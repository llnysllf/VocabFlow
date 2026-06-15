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
type the Chinese meaning, grade yourself honestly, and a **Leitner / SM-2-style spaced
repetition** engine schedules each word for the right day so it actually moves into
long-term memory.

It's a single static site — no framework, no build step. Open it and study. Optionally
**sign in** (powered by Supabase) so your progress syncs across all your devices; without
sign-in it works fully offline as a guest, saving progress in your browser.

## Features

- 🧠 **Spaced repetition** — expanding review intervals (1 → 2 → 4 → 7 → 15 → 30 days → mastered).
- 📊 **Frequency-ordered** — learn the highest-value words first, 15,000 in total.
- ✍️ **Active recall** — you type the meaning, then self-grade Right / Partly / Wrong.
- 🎯 **Daily focus list** — words you miss become today's drill list.
- ☁️ **Accounts + sync** — sign in with email or Google; progress follows you across devices.
- 🔌 **Works offline** — no account? It runs as a guest, saving locally. Sign-in is optional.
- 💾 **Export / import** — back up or move your progress as a JSON file.
- ⌨️ **Keyboard-first** — `Enter` to check, `1` / `2` / `3` to grade.
- 🆓 **Free & self-hostable** — static files on GitHub Pages + a free Supabase tier.

## How the memory schedule works

Every word lives in a "box." Get it right and the gap before you see it again grows; get
it wrong and it drops back — the research-backed way to move words into long-term memory.

| Box | Next review |
|-----|-------------|
| just learned / just wrong | **1 day** |
| 1 | 2 days |
| 2 | 4 days |
| 3 | 7 days |
| 4 | 15 days |
| 5 | 30 days |
| 6 | **mastered** (retired) |

- **Right** → up one box (longer gap).
- **Partly** → down one box (shorter gap) + ½ strike.
- **Wrong** → back to box 0, see it again tomorrow + 1 strike.

A session stops at **7 strikes** (wrong = 1, partly = ½) or after **50 new words** — both
adjustable in Settings.

## Run it locally

No build, no dependencies. Two ways:

- **Guest mode (offline):** just double-click `index.html`.
- **With sign-in:** serve over http so auth can redirect properly:
  ```bash
  python3 -m http.server 8000   # then open http://localhost:8000
  ```

## Enable accounts + sync (Supabase)

Sign-in is optional — skip this and the app runs in guest mode. To turn it on with a free
[Supabase](https://supabase.com) project:

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is plenty).
2. **Create the table:** open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and **Run**. This creates a `progress`
   table with row-level security so each user can only touch their own data.
3. **Get your keys:** **Project Settings → Data API** for the *Project URL*, and
   **Project Settings → API Keys** for the *anon public* key.
4. **Paste them into [`js/config.js`](js/config.js):**
   ```js
   window.VOCABFLOW_CONFIG = {
     SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
     SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",
     ENABLE_GOOGLE: true
   };
   ```
   > The **anon key is meant to be public** — it's safe to commit. It can only do what the
   > row-level-security policies allow. Never put the `service_role` secret key here.
5. **Allowed URLs:** in **Authentication → URL Configuration**, add your site URL
   (e.g. `https://llnysllf.github.io/VocabFlow/` and `http://localhost:8000`) to the
   redirect allow-list.
6. *(Optional)* **Google sign-in:** enable the Google provider under
   **Authentication → Providers** and add your OAuth credentials. Don't want it? Set
   `ENABLE_GOOGLE: false` to hide the button. Email/password works without this.
7. *(Optional)* For the smoothest first run, turn **off** "Confirm email" under
   **Authentication → Sign In / Providers** so new accounts can sign in immediately
   (otherwise users confirm via an emailed link first).

That's it — reload the page and the **Sign in** button goes live. Existing guest progress
on that browser is migrated into your account the first time you sign in.

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
js/config.js          Your Supabase URL + anon key (public-safe)
js/cloud.js           Supabase auth + cloud sync, with offline fallback
js/app.js             The trainer: scheduling, grading, UI
words.js              15,000-word data set (window.VOCAB)
supabase/schema.sql   Database table + row-level-security policies
```

**Tech:** vanilla HTML/CSS/JavaScript (no framework, no build) + the
[Supabase JS client](https://supabase.com/docs/reference/javascript) loaded from a CDN.

## Your data

- **Signed in:** progress is stored in your Supabase project and synced across devices.
- **Guest:** progress is saved in that browser's `localStorage` only.
- **Export / Import** (in Settings) lets you back up or move progress as JSON anytime.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

[MIT](LICENSE) © 2026 YitongLiu
