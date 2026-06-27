# VocabFlow backend (AWS) — accounts + progress sync

Fully on AWS, no Supabase:

```
Browser (GitHub Pages)
   │  sign up / sign in with Cognito  → gets a JWT
   │  GET/PUT /progress  with  Authorization: Bearer <JWT>
   ▼
Cognito (user pool)          API Gateway (HTTP API) → Lambda → DynamoDB
   issues & signs JWTs          │
                                └─ verifies the Cognito JWT (RS256 via the
                                   pool's public JWKS); `sub` keys the row
```

One `sam deploy` creates everything: the Cognito user pool + app client, the
DynamoDB table, the HTTP API, and the Lambda. The API has two routes:

| Method | Path        | Body            | Returns                                  |
|--------|-------------|-----------------|------------------------------------------|
| GET    | `/progress` | –               | `{ ok, state, mtime }` (`state` may be null) |
| PUT    | `/progress` | `{ "state": … }`| `{ ok, mtime }`                          |

---

## What you need (you do these — I can't enter your credentials)

- **An AWS account** with credentials configured locally:
  - Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
    and [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
  - `aws configure` with an IAM user that can create CloudFormation / Lambda /
    DynamoDB / API Gateway / **Cognito** / IAM resources.
  - Node.js installed (so `sam build` can install the one dependency).

No Supabase keys needed anymore.

---

## Deploy

From this `backend/` folder:

```bash
sam build
sam deploy --guided
```

Answer the prompts:

- **Stack Name:** `vocabflow-backend`
- **AWS Region:** e.g. `us-east-1`
- **Parameter AllowOrigin:** `https://llnysllf.github.io` (your Pages origin — scheme + host)
- Confirm changes / allow IAM role creation: **Yes**
- Save arguments to `samconfig.toml`: **Yes** (future deploys are just `sam deploy`)

When it finishes it prints **Outputs**:

| Output             | Goes into `js/config.js` as |
|--------------------|-----------------------------|
| `ApiUrl`           | `API_BASE_URL`              |
| `Region`           | `COGNITO_REGION`            |
| `UserPoolId`       | `COGNITO_USER_POOL_ID`      |
| `UserPoolClientId` | `COGNITO_CLIENT_ID`         |

---

## Point the app at it

In [`../js/config.js`](../js/config.js) fill the four values above, e.g.:

```js
API_BASE_URL:         "https://abc123.execute-api.us-east-1.amazonaws.com",
COGNITO_REGION:       "us-east-1",
COGNITO_USER_POOL_ID: "us-east-1_AbCdEf123",
COGNITO_CLIENT_ID:    "1a2b3c4d5e6f7g8h9i0j"
```

Then bump `js/config.js?v=` in `index.html`, commit, and push. From that point
sign-in uses **Cognito** and all data lives in **DynamoDB** — Supabase is no
longer used. Leaving `COGNITO_*` blank keeps the old Supabase auth path, so you
can deploy and flip the switch whenever you're ready.

Once you've confirmed Cognito works, the Supabase SDK `<script>` in `index.html`
and the `SUPABASE_*` keys in `config.js` can be deleted (ask me and I'll do it).

---

## Test it

After filling config and signing up in the app, grab the access token from the
browser console and hit the API directly:

```bash
TOKEN='<paste a Cognito access token>'
API='https://abc123.execute-api.us-east-1.amazonaws.com'

curl -s "$API/progress" -H "Authorization: Bearer $TOKEN"            # {"ok":true,"state":null,...}
curl -s -X PUT "$API/progress" -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' -d '{"state":{"hi":"there"}}'
curl -s "$API/progress" -H "Authorization: Bearer $TOKEN"            # state echoes back
curl -s "$API/progress"                                              # 401 (no token)
```

---

## Notes

- **Existing Supabase accounts don't carry over.** Cognito is a separate user
  store, so users re-register. The app re-uploads their local progress to AWS on
  first sign-in, so nothing on the device is lost.
- **No email code on sign-up.** A Pre-Sign-up Lambda trigger auto-confirms users
  and marks the email verified, matching the previous "confirmation off" UX. To
  require email verification instead, edit `src/presignup.mjs` and the pool's
  `AutoVerifiedAttributes` in `template.yaml`.
- **Google sign-in** isn't wired for Cognito yet (it needs a Hosted UI domain +
  Google as a federated IdP). Email/password works without it; ask if you want it.
- **Cost:** Cognito's first 10k monthly active users are free; DynamoDB is
  on-demand and Lambda/API Gateway scale to zero — a personal app stays free.
- **Security:** the user id comes from the *verified* JWT `sub` (issuer +
  audience checked against the pool), never from the client. CORS is locked to
  `AllowOrigin`.
- **Teardown:** `sam delete` removes the stack, including the user pool and the
  DynamoDB table — export anything you want to keep first.
```
