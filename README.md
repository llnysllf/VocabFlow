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

It has **two decks you switch between in the sidebar** — **Vocabulary** (15,000 words,
splittable by word type) and **Expressions** (3,173 idioms, phrasal verbs, slang and
proverbs) — each with its own independent progress. There's also a separate
**Sentences** mode — 575 Chinese → English translations with an offline grader.

It's a single static site — no framework, no build step. Open it and study. Optionally
**sign in** (accounts powered by AWS) so your progress syncs across all your devices;
without sign-in it works fully offline as a guest, saving progress in your browser.

## Features

- 🗂️ **Two decks plus Sentences** — Vocabulary and Expressions, each tracked separately. Vocabulary splits by word type; Expressions splits by kind, and its Slang splits again by country.
- ✍️ **Sentences mode** — translate Chinese sentences into English; a built-in grader accepts multiple phrasings and points out what's off (no AI, fully offline). Natural spoken forms like *"there's three books"* or *"gonna"* are accepted, with a note on what the written form would be.
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

## Studying one part of speech

**Nouns · Verbs · Adjectives · Adverbs · Other** fold out of Vocabulary in the sidebar —
click the deck to open its list, click again to shut it. They are views over that one deck, sharing its progress — grading a word under
Nouns counts everywhere. Picking one scopes the Library list, the practice queue and the
Statistics counts, and sticks until you change it, so you can spend a session on
adjectives alone. A pill on the practice card shows when the deck is narrowed.

Words carrying several senses (`in` is a preposition, adverb, adjective *and* noun) appear
under each of their types. *Other* covers prepositions, pronouns, abbreviations and the
~2,000 entries whose meaning has no part-of-speech marker, so nothing is unreachable.
Idioms, phrasal verbs, proverbs and sayings carry no markers, so they get no word-type
sub-entries. **Expressions** splits by kind instead — **Idioms · Phrasal Verbs · Slang ·
Proverbs** — and **Slang** splits again by country, since slang is the only kind tied to
one:

```
Expressions        3,173
   Idioms          1,568
   Phrasal Verbs   1,000
   Slang             114
      American        39
      British         40
      Australian      35
   Proverbs          491
```

The three kinds are told apart by grammar, not by feel:

- a **phrasal verb** is a verb — you conjugate it (*give up → gave up*);
- an **idiom** is a fragment you build a sentence around (*"we broke the ice"*);
- a **proverb** is a whole sentence that stands alone (*"you get what you pay for"*).

`sayings.js` is still a separate file, but its entries are shown as **idioms** — *white as
a sheet* and *go in one ear and out the other* are idioms by any normal definition, and the
two lists are separate only because IdiomKB shipped them that way.

An expression that appears in several source lists is shown once, under the most specific
label: *ask out* and *come on* are phrasal verbs before they are idioms, and *hit the road*
is an idiom before it is slang. That removes 42 duplicates.

Every group with children folds — Vocabulary, Expressions and Slang each carry a chevron,
and click to open or shut. The app reopens on the group you were last studying rather than
collapsing everything. Words like `arvo` and `knackered` are
missing from the CMU dictionary (it is American), so they show no phonetic — but Wiktionary
has recordings by native speakers of the right accent, so the play button still gives you
`En-au-arvo.ogg` rather than an American approximation.

## Example sentences

Checking an answer, or opening a word in the Library, reveals an **Examples** panel:
real sentences with Chinese translations, each with its own play button.

Each word type is one block: its Chinese meanings, then a fold of its sentences. Reading
"n. 执政者, 交情" and then hunting for the noun examples in a separate list below made you do
the join by hand.

| | |
|---|---|
| **n.** Noun | Take a break. — 休息一下吧。 · The break is over. · I just need a break. |
| **v.** Verb | We didn't break in. · I sometimes break the rules. · Did Tom break something again? |

Every sentence is part-of-speech tagged with [spaCy](https://spacy.io), and filed under the
type the word actually has *in that sentence* — not under the dictionary's list, and not
guessed from the translation. That covers **81%** of the word types the dictionary lists,
and **5,436 words have an example for every type they list**.

Within a type, the picks are spread across senses where the Chinese translation identifies
one — that is why `break`'s three verb examples show breaking a rule, breaking in and
breaking an object rather than three of the same. The sense drives the choosing only and is
not shown on the sentence.

Coverage follows frequency, which is the right shape — 99% of the top 1,000 words have
examples, 92% of 1,000–3,000, falling to 9% by rank 15,000. In the Library the panel is a
stub until opened, so 2,000 rows do not each build four sentences up front.

## Meanings

ECDICT marks field-specific senses with a bracketed tag — `[计]` computing, `[医]` medicine,
`[化]` chemistry, `[经]` economics, `[法]` law. `can` means the ASCII cancel character in
computing and `for` is a DOS batch command; both are true and neither helps.

A field sense is shown **only when it is all the word has**. `for` now reads
*prep. 为, 因为, 至于 / conj. 因为* with the DOS command dropped, while `online` keeps
<sub>computing</sub> 联机 because there is nothing else — 819 words are in that position and
would otherwise render blank. 3,854 words that mix the two just lose the tail.

A side effect worth knowing: about 20 words whose only part-of-speech marker sat inside a
hidden field sense now count as *Other* rather than a noun or verb. Nothing becomes
unreachable, since *Other* is the catch-all.

WordNet also resolves some short words to the **abbreviation** that shares their spelling,
so `who` was glossed as a UN agency, `me` as the state of Maine, `am` as americium. Those
English hints are dropped for words of three letters or fewer — `washington`, `california`
and `star` are longer and keep theirs, because for them the definition is real.

Both are display fixes; `words.js` is untouched.

### Labelled senses

ECDICT gives a flat list per word type and says nothing about which Chinese goes with which
meaning. Wiktionary's translation tables do carry that label, so `senses.js` layers them on
where they exist — as a label on the term itself, not a second copy of it:

```
v.    装罐
n.    罐头   容器                                              3 ›
      a more or less cylindrical vessel for liquids
```

The Chinese stays one unbroken run — it is the answer being tested — and the English drops
to a caption underneath rather than splitting the terms apart. Where a row carries two
different senses the caption names its terms, and terms sharing a sense share one line:

```
n.    男人   人类   人                                          3 ›
      男人 · adult male human
      人类 人 · a human being
```

The count on the right opens that type's sentences; there is no separate heading for them.

A sense whose Chinese the dictionary did not already list is added as its own line; one it
did list just gains the label. Wiktionary writes a word as `罐頭 /罐头`, traditional then
simplified — only the simplified form is kept, since the rest of the app is simplified.

Built by `tools/build-senses.py` from [kaikki.org](https://kaikki.org)'s machine-readable
Wiktionary extract (CC BY-SA 4.0), streamed and filtered rather than stored — the extract is
3 GB and the result is 118 KB.

**Coverage is thin**: 1,243 of 15,000 words, and only 189 of those get two or more labelled
senses, which is the case where the labels actually disambiguate anything. 28% of the top
1,000 words, falling to 3% by rank 15,000. It supplements `words.js` and never replaces it,
so a word without labelled senses looks exactly as it did before.

Oxford and Cambridge were considered and rejected: Cambridge publishes no API, and Oxford's
forbids redistributing the data, which rules it out for a public repository regardless of
whether you hold a key.

### Are the Chinese meanings right?

Checked against a second, independent dictionary — [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict)
(CC BY-SA 4.0), whose lineage is unrelated to ECDICT's. `tools/verify-meanings.py` inverts
it (CC-CEDICT is Chinese→English) and asks whether ECDICT's Chinese for a word is among the
headwords CC-CEDICT glosses with that word.

Of the **10,759 words both dictionaries cover, 8,486 (79%) are corroborated**; 2,273 are not
matched, only 335 of them in the top 3,000. Spot-checking the unmatched shows they are
overwhelmingly *not* errors — CC-CEDICT does not carry compositional phrases as headwords
(`your` → 你的, `their` → 他们的) or simply prefers a more literary synonym (`why` → 为何
against ECDICT's 为什么). Read that list as "worth a look", not "wrong".

No systematic errors in the Chinese were found. What this does not establish is that all
15,000 are right: 4,241 words have no CC-CEDICT entry at all and remain unchecked.

## Spoken English in the sentence grader

Plenty of English is universal in speech but marked wrong in a grammar book. The grader
accepts those instead of failing you, and says what the written form would be:

| You type | Accepted, with a note |
|---|---|
| There**'s** three books on the table. | *"there's" before a plural is what almost everyone says — the textbook form is "there are".* |
| I'm **gonna** go to Beijing tomorrow. | *"gonna" is how "going to" is said — normal in speech, but write "going to".* |
| There's **less** tourists this year. | *"less" with countable things is everywhere in speech — writing prefers "fewer".* |
| **Me and** my friend watched a movie. | *"me and …" as the subject is extremely common in speech — writing wants "… and I".* |
| I could **of** helped you. | *"could of" sounds exactly like "could've", which is why it is so common — but in writing it is "could have".* |

Also covered: *wanna · gotta · kinda · gimme · lemme · cuz · there was + plural ·
if I was · than me/him/her/them · doing good · different than*.

Genuinely stigmatised forms are deliberately **not** accepted — `ain't` and double
negatives would hurt a learner more than help. Nor are the real errors each sentence is
built to teach: wrong tense, wrong verb form, missing article, singular for plural.

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
js/pron.js            Phonetics + audio playback for the current card
words.js              15,000-word data set (window.VOCAB)
ipa.js                Phonetic spellings for every headword (window.IPA)
idioms.js             1,000 idioms (window.IDIOMS)          ┐
phrasal.js            1,000 phrasal verbs (window.PHRASAL)  │ merged at load
slang.js              slang & colloquialisms (window.SLANG) │ into the one
proverbs.js           491 proverbs (window.PROVERBS)        │ Expressions deck
sayings.js            600 sayings (window.SAYINGS)          ┘
sentences.js          Chinese → English translation bank (window.SENTENCES)
examples.js           Example sentences per headword (window.EXAMPLES)
tools/build-ipa.py    Regenerates ipa.js from the CMU Pronouncing Dictionary
tools/build-examples.py  Regenerates examples.js from Tatoeba
tools/rerank-words.py Re-sorts words.js by wordfreq corpus frequency
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
- **Word order** is by [**wordfreq**](https://github.com/rspeer/wordfreq) Zipf score — a blend of
  books, subtitles, news, web and Wikipedia. ECDICT's own ranking came from an early-2000s web
  crawl, which placed page furniture and spam among the commonest English (`faq` at 693, `usr` at
  1077, `phentermine` at 1575). Re-sort with `tools/rerank-words.py`.
- **Idioms** and **Sayings** come from [**IdiomKB**](https://github.com/lishuang-w/IdiomKB),
  a verified idiom knowledge base (each entry with a Chinese and English meaning).
- **Proverbs** come from [**LLMProverbMT**](https://github.com/yuriak/LLMProverbMT) (human-verified
  English→Chinese proverbs) plus IdiomKB.
- **Slang** is hand-curated for this project and tagged by where it is used —
  American, British or Australian, and kept only where the slang sense differs from the
  everyday word (`nick` is a notch but also to steal). It replaced ECDICT's register-tagged (俚/口)
  entries, which were unreliable (`molly` glossed as "coward" but defined as an aquarium
  fish, `becky` as "上挂钩"). Vulgar terms, slurs, and words whose meaning flips between
  countries are deliberately excluded.
- **Example sentences** (`examples.js`) come from [**Tatoeba**](https://tatoeba.org) —
  aligned English–Chinese pairs, CC BY 2.0 FR. Regenerate with `tools/build-examples.py`.
- **Sentences** are hand-built to cover everyday English grammar: 575 sentences across tenses,
  articles, quantifiers, prepositions, modals, conditionals, passives, reported speech,
  relative clauses, question forms, verb patterns and comparison, plus everyday functions
  (time, money, directions, appointments, health, apologising). The everyday points get
  three or more sentences each, so a weak one comes back in a different shape rather than
  once only; `tools/check-sentences.py` validates the answer keys.
- The most common entries in each deck are hand-curated at the top.
- **Phonetic spellings** (`ipa.js`) are converted from the
  [**CMU Pronouncing Dictionary**](https://github.com/cmusphinx/cmudict) — General American,
  BSD-licensed, © 1993–2015 Carnegie Mellon University. Regenerate with `tools/build-ipa.py`.
- **Pronunciation audio** is fetched on demand from
  [**Wiktionary**](https://en.wiktionary.org) / Wikimedia Commons (volunteer recordings,
  CC BY-SA), cached in the browser, and falls back to the browser's speech voice
  for words with no recording.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

[MIT](LICENSE) © 2026 YitongLiu
