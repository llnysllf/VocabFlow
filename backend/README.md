# VocabFlow backend (AWS)

Per-user progress sync on **API Gateway (HTTP API) → Lambda → DynamoDB**, with
each request authenticated by verifying the **Supabase-issued JWT**. Supabase
stays the login service; the progress data lives in your own AWS account.

```
Browser (GitHub Pages)
   │  signs in with Supabase  → gets a JWT
   │  GET/PUT /progress  with  Authorization: Bearer <JWT>
   ▼
API Gateway (HTTP API)  →  Lambda  →  DynamoDB (one row per user)
                              │
                              └─ verifies the Supabase JWT (HS256 secret,
                                 or RS256/ES256 via the public JWKS)
```

The API has exactly two routes:

| Method | Path        | Body            | Returns                                  |
|--------|-------------|-----------------|------------------------------------------|
| GET    | `/progress` | –               | `{ ok, state, mtime }` (`state` may be null) |
| PUT    | `/progress` | `{ "state": … }`| `{ ok, mtime }`                          |

---

## What you need (you do these — I can't enter your credentials)

1. **An AWS account** and the credentials configured locally:
   - Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
     and the [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
   - Run `aws configure` and paste an IAM user's access key / secret (an admin
     or a user with CloudFormation/Lambda/DynamoDB/API Gateway/IAM permissions).
   - Node.js installed (so `sam build` can `npm install` the one dependency).

2. **Your Supabase JWT secret** (only if your project still signs with HS256):
   - Supabase dashboard → **Project Settings → API → JWT keys** → copy the
     **JWT Secret**. You'll paste it into the deploy prompt below — it goes
     straight into AWS as a hidden parameter and is **never committed**.
   - If your project uses **asymmetric keys (RS256/ES256)**, leave the secret
     blank; the Lambda verifies tokens against the project's public JWKS.
   - Not sure which? Provide the secret if it's shown — it's harmless, and the
     Lambda picks the right method per token.

---

## Deploy

From this `backend/` folder:

```bash
sam build
sam deploy --guided
```

The guided deploy asks a few questions. Answer:

- **Stack Name:** `vocabflow-backend`
- **AWS Region:** e.g. `us-east-1`
- **Parameter SupabaseUrl:** `https://gmumbqqmlvghuwizdnut.supabase.co`
- **Parameter SupabaseJwtSecret:** paste the JWT Secret (or leave blank for
  asymmetric projects). Input is hidden.
- **Parameter AllowOrigin:** `https://llnysllf.github.io`
  (your GitHub Pages origin — scheme + host, no trailing path)
- Confirm changes / allow IAM role creation: **Yes**.
- Save arguments to `samconfig.toml`: **Yes** (so future deploys are just `sam deploy`).

When it finishes it prints **Outputs → ApiUrl**, e.g.
`https://abc123.execute-api.us-east-1.amazonaws.com`.

---

## Point the app at it

In [`../js/config.js`](../js/config.js) set:

```js
API_BASE_URL: "https://abc123.execute-api.us-east-1.amazonaws.com"
```

(Use the `ApiUrl` output, no trailing slash.) Then bump `js/config.js?v=` in
`index.html`, commit, and push. From then on every signed-in user's progress
reads/writes through your AWS backend instead of the Supabase table. **Sign-in
is unchanged.** Leaving `API_BASE_URL` blank keeps the old Supabase-table path.

---

## Test it

Grab a real access token from the browser console while signed in:

```js
// in the app's devtools console
(await window.Cloud && (await supabase /* the SDK */)) // …or simply:
JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('auth-token')))).access_token
```

Then:

```bash
TOKEN='<paste access token>'
API='https://abc123.execute-api.us-east-1.amazonaws.com'

curl -s "$API/progress" -H "Authorization: Bearer $TOKEN"          # -> {"ok":true,"state":null,...}
curl -s -X PUT "$API/progress" -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' -d '{"state":{"hello":"world"}}'
curl -s "$API/progress" -H "Authorization: Bearer $TOKEN"          # -> state echoes back
curl -s "$API/progress"                                            # -> 401 unauthorized (no token)
```

---

## Notes

- **Cost:** DynamoDB is on-demand (`PAY_PER_REQUEST`) and Lambda/API Gateway
  scale to zero — a personal app sits comfortably in the always-free tier.
- **Security:** the user id comes from the *verified* JWT `sub`, never from the
  client, so one user can't read another's row. CORS is locked to `AllowOrigin`.
- **Migration (optional):** existing users have data in the Supabase `progress`
  table. The app's merge logic means anyone still signed in keeps their local
  copy and re-uploads it to AWS on first sync, so no action is needed for active
  users. To move everything up front, export `select user_id, state from
  progress` from Supabase and `PutItem` each row into the `vocabflow-progress`
  table (`userId` = `user_id`, `state` = JSON string).
- **Teardown:** `sam delete` removes the stack (and the DynamoDB table — back it
  up first if you care about the data).
```
