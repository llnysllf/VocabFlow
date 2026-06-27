/*
 * handler.mjs — VocabFlow progress-sync API.
 *
 *   GET  /progress  -> { ok:true, state:<obj|null>, mtime:<iso|null> }
 *   PUT  /progress  -> body { state:<obj> }  ->  { ok:true, mtime:<iso> }
 *
 * Every request must carry  Authorization: Bearer <supabase access token>.
 * The token's `sub` (Supabase user id) is the DynamoDB partition key, so a
 * user can only ever touch their own row — the server-side equivalent of the
 * old Row Level Security policy.
 */
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { verifyToken } from "./auth.mjs";

const TABLE = process.env.TABLE_NAME;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";
const ddb = new DynamoDBClient({});

function headers() {
  return {
    "content-type": "application/json",
    "access-control-allow-origin": ALLOW_ORIGIN,
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, PUT, OPTIONS",
  };
}
function resp(statusCode, body) {
  return { statusCode, headers: headers(), body: JSON.stringify(body) };
}

export async function handler(event) {
  const method =
    (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
    event.httpMethod ||
    "GET";

  if (method === "OPTIONS") return resp(204, {});

  // --- authenticate -------------------------------------------------------
  const h = event.headers || {};
  const authz = h.authorization || h.Authorization || "";
  const token = authz.replace(/^Bearer\s+/i, "").trim();
  let claims;
  try {
    claims = await verifyToken(token);
  } catch (e) {
    return resp(401, { error: "unauthorized", detail: String(e && e.message || e) });
  }
  const userId = claims.sub;
  if (!userId) return resp(401, { error: "no-subject" });

  // --- handle -------------------------------------------------------------
  try {
    if (method === "GET") {
      const out = await ddb.send(new GetItemCommand({
        TableName: TABLE,
        Key: { userId: { S: userId } },
      }));
      const item = out.Item;
      const state = item && item.state && item.state.S ? JSON.parse(item.state.S) : null;
      const mtime = item && item.updatedAt && item.updatedAt.S ? item.updatedAt.S : null;
      return resp(200, { ok: true, state, mtime });
    }

    if (method === "PUT") {
      let body;
      try {
        body = JSON.parse(event.body || "{}");
      } catch (e) {
        return resp(400, { error: "bad-json" });
      }
      const state = body.state;
      if (state == null || typeof state !== "object") {
        return resp(400, { error: "bad-state" });
      }
      const now = new Date().toISOString();
      await ddb.send(new PutItemCommand({
        TableName: TABLE,
        Item: {
          userId: { S: userId },
          state: { S: JSON.stringify(state) },
          updatedAt: { S: now },
        },
      }));
      return resp(200, { ok: true, mtime: now });
    }

    return resp(405, { error: "method-not-allowed" });
  } catch (e) {
    return resp(500, { error: "server", detail: String(e && e.message || e) });
  }
}
