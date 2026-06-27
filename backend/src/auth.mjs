/*
 * auth.mjs — verify a Supabase-issued JWT with zero external dependencies.
 *
 * Supports the algorithms Supabase actually uses:
 *   - HS256  (legacy shared-secret signing)  -> needs SUPABASE_JWT_SECRET
 *   - RS256 / ES256 (asymmetric signing)      -> fetched from the project's
 *                                                public JWKS, no secret needed
 *
 * Throws on any failure (bad signature, expired, wrong audience). On success
 * returns the decoded payload, whose `sub` is the Supabase user id.
 */
import crypto from "node:crypto";

const SECRET = process.env.SUPABASE_JWT_SECRET || "";
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");

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
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
  const res = await fetch(SUPABASE_URL + "/auth/v1/.well-known/jwks.json");
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
    if (!SECRET) throw new Error("HS256 token but no SUPABASE_JWT_SECRET set");
    const expected = crypto.createHmac("sha256", SECRET).update(signingInput).digest();
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

  // Supabase access tokens carry aud "authenticated".
  const aud = payload.aud;
  const audOk = aud === "authenticated" || (Array.isArray(aud) && aud.includes("authenticated"));
  if (aud && !audOk) throw new Error("bad audience");

  return payload;
}
