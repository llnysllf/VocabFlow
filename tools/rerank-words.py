#!/usr/bin/env python3
"""Reorder words.js by corpus frequency, without disturbing saved progress.

The original ranking came from an early-2000s web crawl, which put page
furniture and spam among the commonest English words — "faq" at 693, "usr" at
1077, "phentermine" at 1575. This reorders the deck by wordfreq's Zipf score,
a multi-domain corpus blend (books, subtitles, news, web, Twitter, Wikipedia).

Crucially it does NOT renumber `r`. That field is the identity a learner's
progress, cloud records, and exported backups are all keyed on; rewriting it
would silently reassign every scheduled review to a different word. Only the
array order changes, and the app derives the displayed rank from position.

Usage:
    pip install wordfreq
    python3 tools/rerank-words.py            # rewrites words.js in place
"""

import json
import os
import sys

try:
    from wordfreq import zipf_frequency
except ImportError:
    sys.exit("needs wordfreq: pip install wordfreq")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(REPO, "words.js")
PREFIX = "window.VOCAB = "


def load(path):
    src = open(path, encoding="utf-8").read()
    return json.loads(src[src.index("["):].rstrip().rstrip(";"))


def main():
    vocab = load(TARGET)
    before = {e["r"]: e["w"] for e in vocab}

    # Ties keep their existing relative order, so the result is deterministic.
    ranked = sorted(vocab, key=lambda e: (-zipf_frequency(e["w"].lower(), "en"), e["r"]))

    after = {e["r"]: e["w"] for e in ranked}
    if before != after:
        sys.exit("refusing to write: a rank changed word, which would corrupt progress")
    if len(ranked) != len(vocab):
        sys.exit("refusing to write: entry count changed")

    blob = json.dumps(ranked, ensure_ascii=False, separators=(",", ":"))
    with open(TARGET, "w", encoding="utf-8") as fh:
        fh.write(PREFIX + blob + ";\n")

    moved = sum(1 for i, e in enumerate(ranked) if vocab[i]["r"] != e["r"])
    print("wrote %s — %d entries, %d changed position, every r still on its own word"
          % (TARGET, len(ranked), moved))
    print("new top 20:", " ".join(e["w"] for e in ranked[:20]))


if __name__ == "__main__":
    main()
