#!/usr/bin/env python3
"""Report how much of the Vocabulary deck has an example sentence.

Reads the shipped words.js and examples.js, so it checks what the app actually
serves rather than what the builder believed it wrote. For every word type the
dictionary lists, it asks whether examples.js carries at least one sentence.

Coverage is not evenly spread and the average hides that, so the report breaks
it down by how common the word is: Tatoeba has plenty of sentences for the
first few thousand words and very few for the last few thousand, which is the
real limit on how far this can go.

    python3 tools/check-examples.py [--missing N]

--missing lists N uncovered word/type pairs, most common word first, for
spot-checking whether they are genuinely absent from the source.
"""

import collections
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BAND = 3000

ECDICT_TO_TYPE = {
    "n": "n.", "vt": "v.", "vi": "v.", "v": "v.", "a": "adj.", "adj": "adj.",
    "s": "adj.", "ad": "adv.", "adv": "adv.", "r": "adv.", "prep": "prep.",
    "conj": "conj.", "pron": "pron.", "art": "art.", "num": "num.",
    "int": "interj.", "interj": "interj.", "aux": "aux.",
}


def load(path, opener):
    src = open(os.path.join(REPO, path), encoding="utf-8").read()
    return json.loads(src[src.index(opener):].rstrip().rstrip(";"))


def types_of(meaning):
    """The word types one ECDICT meaning string lists, in order, deduped."""
    out = []
    for part in re.split(r"\s*/\s*", str(meaning or "")):
        part = part.strip()
        if not part or part.startswith("["):
            continue
        m = re.match(r"^((?:[a-z]+\.\s*){1,3})(.+)$", part)
        if not m:
            continue
        label = ECDICT_TO_TYPE.get(re.sub(r"[.\s]", "", m.group(1).split()[0]).lower())
        if label and label not in out:
            out.append(label)
    return out


def main():
    show = 0
    if "--missing" in sys.argv:
        show = int(sys.argv[sys.argv.index("--missing") + 1])
    words = load("words.js", "[")
    examples = load("examples.js", "{")

    listed = covered = unlabelled = 0
    full = partial = 0
    no_example = []
    missing = []
    by_band = collections.Counter()
    ok_band = collections.Counter()
    by_type = collections.Counter()
    ok_type = collections.Counter()

    for i, entry in enumerate(words):
        word = entry["w"].lower()
        types = types_of(entry["c"])
        if not types:
            unlabelled += 1
            continue
        groups = examples.get(word) or {}
        have = [t for t in types if groups.get(t)]
        band = min(i // BAND, (len(words) - 1) // BAND)
        listed += len(types)
        covered += len(have)
        by_band[band] += len(types)
        ok_band[band] += len(have)
        for t in types:
            by_type[t] += 1
            if groups.get(t):
                ok_type[t] += 1
            elif len(missing) < show:
                missing.append((i + 1, entry["w"], t))
        if not have:
            no_example.append(entry["w"])
        elif len(have) == len(types):
            full += 1
        else:
            partial += 1

    pct = lambda a, b: 100.0 * a / max(b, 1)
    print("%d words, of which %d carry no part-of-speech marker to check"
          % (len(words), unlabelled))
    print()
    print("word+type pairs listed: %d" % listed)
    print("  at least one example: %d (%.1f%%)" % (covered, pct(covered, listed)))
    print("  none:                 %d (%.1f%%)" % (listed - covered, pct(listed - covered, listed)))
    print()
    print("every listed type covered: %d words" % full)
    print("some types covered:        %d words" % partial)
    print("no example at all:         %d words" % len(no_example))
    print()
    print("by frequency band:")
    for b in sorted(by_band):
        print("  %-13s %6d listed  %6d covered  (%.0f%%)"
              % ("%d-%d" % (b * BAND + 1, (b + 1) * BAND),
                 by_band[b], ok_band[b], pct(ok_band[b], by_band[b])))
    print()
    print("by word type:")
    for t, n in by_type.most_common():
        print("  %-8s %6d listed  %6d covered  (%.0f%%)" % (t, n, ok_type[t], pct(ok_type[t], n)))
    if missing:
        print()
        print("uncovered pairs, most common word first:")
        for rank, word, t in missing:
            print("  #%-6d %-18s %s" % (rank, word, t))


if __name__ == "__main__":
    main()
