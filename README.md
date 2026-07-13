<div align="center">

# VocabFlow

**A free, open-source spaced-repetition trainer for the 15,000 most common English words — with Chinese meanings.**

[![Live demo](https://img.shields.io/badge/demo-live-34d399?style=flat-square)](https://llnysllf.github.io/VocabFlow/)
[![License: MIT](https://img.shields.io/badge/license-MIT-6c8cff?style=flat-square)](LICENSE)
[![Made with vanilla JS](https://img.shields.io/badge/built%20with-vanilla%20JS-f7df1e?style=flat-square)](#tech)
[![No build step](https://img.shields.io/badge/build-none-9aa1b2?style=flat-square)](#run-it-locally)

**▶ [Try it live](https://llnysllf.github.io/VocabFlow/)**

</div>

---

VocabFlow tests you on English words in **frequency order** (most common first). You
type the Chinese meaning, rate how well you knew it, and a **Leitner / SM-2-style spaced
repetition** engine schedules each word for the right day so it actually moves into
long-term memory.

It has **six decks you switch between with tabs** — **Vocabulary** (15,000 words),
**Idioms** (1,000), **Phrasal Verbs** (1,000), **Slang**, **Proverbs**, and **Sayings** —
each with its own independent progress. There's also a separate **Sentences** mode that
drills full Chinese → English translation with an offline grader.

It's a single static site — no framework, no build step. Open it and study. Optionally
**sign in** (accounts powered by AWS) so your progress syncs across all your devices;
without sign-in it works fully offline as a guest, saving progress in your browser.

## Features

- 🗂️ **Six decks, tabbed** — Vocabulary, Idioms, Phrasal Verbs, Slang, Proverbs, Sayings, each tracked separately.
- ✍️ **Sentences mode** — translate Chinese sentences into English; a built-in grader accepts multiple phrasings and points out what's off (no AI, fully offline).
- 🔎 **Library view** — search a deck and filter by status: today, answered, upcoming, too easy, or all.
- 🧠 **Spaced repetition** — expanding review intervals (same-day → 1 → 2 → 4 → 10 → 30 → 90 days).
- 📊 **Frequency-ordered** — learn the highest-value words first, 15,000 in total.
- 🎚️ **Six-way self-grading** — rate each card Again / Hard / Shaky / Good / Easy / Too easy and the schedule adapts.
- 🎯 **Daily focus list** — words you miss become today's drill list.
- ☁️ **Accounts + sync** — sign in with email or Google; progress follows you across devices.
- 🔌 **Works offline** — no account? It runs as a guest, saving locally. Sign-in is optional.
- 💾 **Export / import** — back up or move your progress as a JSON file.
- ⌨️ **Keyboard-first** — `Enter` to check, `1`–`6` to grade.
- 🆓 **Free & self-hostable** — static files on GitHub Pages + a serverless AWS backend that scales to zero.

## How the memory schedule works

Every word has a **strength level**. Grade it well and the gap before you see it again
grows; grade it poorly and it drops back — the research-backed way to move words into
long-term memory.

| Strength | Next review |
|----------|-------------|
| new / just missed (0) | **same day** |
| 1 | 1 day |
| 2 | 2 days |
| 3 | 4 days |
| 4 | 10 days |
| 5 | 30 days |
| 6 (very strong) | 90 days |
| Too easy | **retired** (removed from review) |

After each card you pick one of six grades:

- **Again** (`1`) → back to level 0, see it again today, + 1 strike, added to today's focus.
- **Hard** (`2`) → drop a level (shorter gap), + ½ strike, added to focus.
- **Shaky** (`3`) → hold the current level, added to focus.
- **Good** (`4`) → up one level (longer gap).
- **Easy** (`5`) → jump up two levels.
- **Too easy** (`6`) → retire the word so it stops coming back.

A session stops at **7 strikes** (Again = 1, Hard = ½) or after **50 new words** — both
adjustable under **Goal & Data**.

## Run it locally

No build, no dependencies. Two ways:

- **Guest mode (offline):** just double-click `index.html`.
- **With sign-in:** serve over http so auth can redirect properly:
  ```bash
  python3 -m http.server 8000   # then open http://localhost:8000
  ```

## Enable accounts + sync (AWS)

Sign-in is optional — skip this and the app runs in guest mode, saving progress in the
browser. To turn on cloud sync, deploy the serverless backend in [`backend/`](backend/).

It's a single [AWS SAM](https://aws.amazon.com/serverless/sam/) stack that provisions
everything with one deploy:

- **Cognito** user pool + app client — issues signed JWTs (email/password, optional Google).
- **API Gateway (HTTP API) → Lambda → DynamoDB** — a tiny `GET`/`PUT /progress` API. The
  Lambda verifies the Cognito JWT (RS256 via the pool's public JWKS) and keys each row on
  the token's `sub`, so a user can only read and write their own progress.

Quick start (full walkthrough, including Google sign-in, in
[`backend/README.md`](backend/README.md)):

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
   and [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html),
   then `aws configure` with an account that can create Cognito / Lambda / DynamoDB / API Gateway / IAM resources.
2. From `backend/`, run:
   ```bash
   sam build
   sam deploy --guided
   ```
   Set `AllowOrigin` to your site's origin (e.g. `https://llnysllf.github.io`) and `AppUrl`
   to where the page is served. Leave the Google params blank for email/password only.
3. Copy the stack **Outputs** into [`js/config.js`](js/config.js):
   ```js
   window.VOCABFLOW_CONFIG = {
     ENABLE_GOOGLE: false,
     API_BASE_URL:         "https://XXXX.execute-api.REGION.amazonaws.com",
     COGNITO_REGION:       "REGION",
     COGNITO_USER_POOL_ID: "REGION_XXXXXXXX",
     COGNITO_CLIENT_ID:    "XXXXXXXXXXXXXXXXXXXXXXXXXX",
     COGNITO_DOMAIN:       "https://your-prefix.auth.REGION.amazoncognito.com" // Google only
   };
   ```
4. Reload the page — the **Sign in** button goes live. Existing guest progress on that
   browser is uploaded to your account the first time you sign in.

> **Cost:** Cognito's first 10k monthly active users are free; DynamoDB is on-demand and
> Lambda / API Gateway scale to zero — a personal deployment stays within the free tier.

*(Optional)* **Google sign-in** federates through the Cognito Hosted UI (OAuth
authorization-code + PKCE). It's a one-time two-deploy setup — deploy once to get the
callback URL, create a Google OAuth client with it, then redeploy with the credentials and
set `ENABLE_GOOGLE: true`. Details in [`backend/README.md`](backend/README.md).

## Deploy (GitHub Pages)

This repo is already a static site, so Pages just serves it:

1. **Settings → Pages → Build and deployment → Source:** *Deploy from a branch*.
2. Branch **`main`**, folder **`/ (root)`**, **Save**.
3. Your app goes live at `https://<your-username>.github.io/VocabFlow/`.

The included `.nojekyll` file tells Pages to serve everything as-is.

## <a id="tech"></a>Project structure

```
index.html            Markup + script includes
css/styles.css        All styling
js/config.js          AWS API + Cognito config for cloud sync
js/cloud.js           Cognito auth + DynamoDB sync, with offline fallback
js/app.js             The trainer: scheduling, grading, sentence grader, UI
words.js              15,000-word data set (window.VOCAB)
idioms.js             1,000 idioms (window.IDIOMS)
phrasal.js            1,000 phrasal verbs (window.PHRASAL)
slang.js              slang & colloquialisms (window.SLANG)
proverbs.js           proverbs (window.PROVERBS)
sayings.js            sayings & expressions (window.SAYINGS)
sentences.js          Chinese → English translation bank (window.SENTENCES)
backend/              AWS SAM stack: Cognito + API Gateway + Lambda + DynamoDB
```

**Tech:** vanilla HTML/CSS/JavaScript (no framework, no build) on the front end, with the
[amazon-cognito-identity-js](https://www.npmjs.com/package/amazon-cognito-identity-js)
client loaded from a CDN for auth; a serverless AWS backend (Cognito + API Gateway +
Lambda + DynamoDB, defined as one SAM template) for accounts and sync.

## Your data

- **Signed in:** progress is stored in DynamoDB (keyed to your account) and synced across devices.
- **Guest:** progress is saved in that browser's `localStorage` only.
- **Export / Import** (under Goal & Data) lets you back up or move progress as JSON anytime.

## Data sources

- **Vocabulary** and **Phrasal Verbs** meanings come from [**ECDICT**](https://github.com/skywind3000/ECDICT),
  an open English→Chinese dictionary.
- **Idioms** and **Sayings** come from [**IdiomKB**](https://github.com/lishuang-w/IdiomKB),
  a verified idiom knowledge base (each entry with a Chinese and English meaning).
- **Proverbs** come from [**LLMProverbMT**](https://github.com/yuriak/LLMProverbMT) (human-verified
  English→Chinese proverbs) plus IdiomKB.
- **Slang** is drawn from ECDICT's register-tagged (俚/口) slang and colloquial entries.
- **Sentences** are hand-built to cover a broad spread of English grammar points.
- The most common entries in each deck are hand-curated at the top.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

[MIT](LICENSE) © 2026 YitongLiu
