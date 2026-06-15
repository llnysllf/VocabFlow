# VocabFlow — English → Chinese vocabulary trainer

A self-contained flashcard trainer for the 15,000 most common English words. It tests you in
frequency order (most common first), you type the Chinese meaning, then you grade yourself and
the app schedules each word for the right day using spaced repetition.

## How to use

1. Keep **`index.html`** and **`words.js`** in the **same folder**.
2. Double-click **`index.html`** — it opens in your browser. No internet needed.
3. You'll see an English word. Type its Chinese meaning and press **Enter** (or click *Check answer*).
4. The real meaning appears. Grade yourself:
   - **✓ Right** (key `1`) — you knew it
   - **~ Partly** (key `2`) — close / fuzzy
   - **✗ Wrong** (key `3`) — didn't know it
5. The next word loads automatically.

## When the session stops

It stops at **7 strikes** — a wrong answer = 1 strike, a partly-right = ½ strike. Those words
become **today's focus list**, shown at the end. You can drill them again right away with
*"Drill today's words again"*, or quit and they'll be first in line tomorrow.

New words are capped at **50 per day** so sessions don't run forever. (Both numbers are adjustable
in Settings.)

## How the memory schedule works

Every word lives in a "box". Each time you get it right, the gap before you see it again grows;
get it wrong and it drops back. This expanding-interval method (Leitner / SM-2 style) is the
research-backed way to move words into long-term memory.

| Box | Next review |
|-----|-------------|
| just learned / just wrong | **1 day** |
| 1 | 2 days |
| 2 | 4 days |
| 3 | 7 days |
| 4 | 15 days |
| 5 | 30 days |
| 6 | **mastered** (retired) |

- **Right** → move up one box (longer gap).
- **Partly** → drop back one box (shorter gap) + ½ strike.
- **Wrong** → back to box 0, see it again tomorrow + 1 strike.

So even a word you got right *today* comes back in 2 days, then 4, then 7… exactly the
"test me again a few days later" behavior you asked for.

## Your data

Progress is saved automatically in your browser (this browser, this computer). In **Settings** you
can:
- **Export backup** — download a `.json` of all your progress.
- **Import backup** — restore it, or move it to another computer/browser.
- **Reset** — wipe everything and start over from word #1.

Tip: export a backup now and then so nothing is lost if you clear your browser data.
