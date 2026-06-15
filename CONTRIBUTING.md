# Contributing to VocabFlow

Thanks for your interest! VocabFlow is intentionally simple: a static site with
no build step and no framework. That keeps it hackable.

## Project layout

```
index.html          Markup + script includes
css/styles.css      All styling
js/config.js        Supabase keys (anon key is public-safe)
js/cloud.js         Supabase auth + cloud sync, with offline fallback
js/app.js           The trainer: scheduling, grading, UI wiring
words.js            The 15,000-word data set (window.VOCAB)
supabase/schema.sql Database table + row-level-security policies
```

## Running locally

No build needed. Either:

- **Double-click `index.html`** — runs in guest mode (offline, no sign-in), or
- **Serve it** so sign-in works against your Supabase project:
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```

Sign-in needs the page served over `http(s)://`, not `file://`, and your
Supabase Auth settings should allow your local URL as a redirect.

## Conventions

- Plain ES5-ish JavaScript, no transpiler, no dependencies beyond the Supabase
  CDN client. Match the existing style (2-space indent, `var`, small functions).
- Keep the app usable offline as a guest — never let a cloud failure block study.
- Escape any user-supplied or data-supplied text before inserting as HTML.

## Word data

`words.js` is `window.VOCAB = [{ r, w, c, e }, …]` where `r` is frequency rank,
`w` the English word, `c` the Chinese meaning, `e` an optional English gloss.
Ranks must stay unique and contiguous from 1.

## Pull requests

Small, focused PRs are easiest to review. Describe what changed and why, and
note anything you tested manually.
