/*
 * auth.mjs — verify a JWT with zero external dependencies.
 *
 * Driven by env vars so it isn't tied to any one provider:
 *   JWT_ISSUER    expected `iss` (also where the JWKS lives). For Cognito:
 *                 https://cognito-idp.<region>.amazonaws.com/<userPoolId>
 *   JWT_AUDIENCE  expected audience — matched against `aud` OR `client_id`
 *                 (Cognito access tokens use `client_id`, id tokens use `aud`).
 *   JWKS_URL      optional override; defaults to JWT_ISSUER/.well-known/jwks.json
 *   JWT_HS_SECRET optional HS256 shared secret (not used by Cognito).
 *
 * Supports RS256 / ES256 (asymmetric, via JWKS) and HS256 (shared secret).
 * Throws on any failure. On success returns the decoded payload; `sub` is the
 * user id used to key each row.
 */
import crypto from "node:crypto";

const HS_SECRET = process.env.JWT_HS_SECRET || "";
const ISSUER = (process.env.JWT_ISSUER || "").replace(/\/+$/, "");
const AUDIENCE = process.env.JWT_AUDIENCE || "";
const JWKS_URL = process.env.JWKS_URL || (ISSUER ? ISSUER + "/.well-known/jwks.json" : "");

let jwksCache = null;
let jwksFetchedAt = 0;
const JWKS_TTL_MS = 60 * 60 * 1000; // refresh hourly (covers key rotation)

function b64urlToBuf(s) {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function b64urlJson(s) {
  return JSON.parse(b64urlToBuf(s).toString("utf8"));
}

async function getJwks() {
  const now = Date.now();
  if (jwksCache && now - jwksFetchedAt < JWKS_TTL_MS) return jwksCache;
  if (!JWKS_URL) throw new Error("JWKS_URL / JWT_ISSUER not configured");
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("jwks fetch failed: " + res.status);
  const data = await res.json();
  jwksCache = data.keys || [];
  jwksFetchedAt = now;
  return jwksCache;
}

export async function verifyToken(token) {
  if (!token) throw new Error("missing token");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed token");

  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  const signingInput = parts[0] + "." + parts[1];
  const sig = b64urlToBuf(parts[2]);
  const alg = header.alg;

  if (alg === "HS256") {
    if (!HS_SECRET) throw new Error("HS256 token but no JWT_HS_SECRET set");
    const expected = crypto.createHmac("sha256", HS_SECRET).update(signingInput).digest();
    if (sig.length !== expected.length || !crypto.timingSafeEqual(sig, expected)) {
      throw new Error("bad signature");
    }
  } else if (alg === "RS256" || alg === "ES256") {
    const jwks = await getJwks();
    const jwk = jwks.find((k) => k.kid === header.kid) || jwks[0];
    if (!jwk) throw new Error("no matching jwk");
    const pub = crypto.createPublicKey({ key: jwk, format: "jwk" });
    // ES256 signatures are raw r||s (IEEE-P1363); RS256 is standard.
    const keyOpt = alg === "ES256" ? { key: pub, dsaEncoding: "ieee-p1363" } : pub;
    if (!crypto.verify("SHA256", Buffer.from(signingInput), keyOpt, sig)) {
      throw new Error("bad signature");
    }
  } else {
    throw new Error("unsupported alg: " + alg);
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now >= payload.exp) throw new Error("token expired");
  if (payload.nbf && now < payload.nbf) throw new Error("token not yet valid");

  if (ISSUER && payload.iss !== ISSUER) throw new Error("bad issuer");

  if (AUDIENCE) {
    const aud = payload.aud;
    const audOk =
      aud === AUDIENCE ||
      payload.client_id === AUDIENCE ||
      (Array.isArray(aud) && aud.includes(AUDIENCE));
    if (!audOk) throw new Error("bad audience");
  }

  return payload;
}
