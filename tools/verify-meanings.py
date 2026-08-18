#!/usr/bin/env python3
"""Cross-check words.js's Chinese meanings against a second dictionary.

words.js gets its Chinese from ECDICT. Checking it against itself proves
nothing, so this compares it with CC-CEDICT (CC BY-SA 4.0), which has an
entirely separate lineage: CC-CEDICT is a Chinese→English dictionary, so it is
inverted here — for each English word, collect the Chinese headwords CC-CEDICT
glosses with that word, and ask whether any of ECDICT's terms is among them.

A word counts as corroborated when the two dictionaries name the same Chinese,
allowing for one being a substring of the other (ECDICT gives 水位 where
CC-CEDICT has 水).

Not matching is weaker evidence than matching. Most unmatched words are either
compositional phrases CC-CEDICT does not carry as headwords (你的, 他们的,
在哪里) or a different but equally correct synonym (ECDICT 为什么 against
CC-CEDICT 为何). Read the unmatched list as "worth a look", not "wrong".

Usage:
    curl -sO https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz
    gunzip cedict_1_0_ts_utf-8_mdbg.txt.gz
    python3 tools/verify-meanings.py cedict_1_0_ts_utf-8_mdbg.txt
"""

import collections
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CEDICT_LINE = re.compile(r"^(\S+)\s+(\S+)\s+\[[^\]]*\]\s+/(.*)/\s*$")
HAN = re.compile(r"[一-鿿]")


def stem(word):
    word = word.lower().strip()
    for suffix, replacement in [("ies", "y"), ("ying", "y"), ("ing", ""),
                                ("ied", "y"), ("es", ""), ("ed", ""), ("s", "")]:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[:-len(suffix)] + replacement
    return word


def load_cedict(path):
    """english gloss -> {chinese headwords}."""
    index = collections.defaultdict(set)
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            m = CEDICT_LINE.match(line.strip())
            if not m:
                continue
            traditional, simplified, defs = m.groups()
            # fields are slash-separated; senses within a field use semicolons
            for field in defs.split("/"):
                for sense in field.split(";"):
                    sense = re.sub(r"\([^)]*\)", " ", sense).strip().lower()
                    sense = re.sub(r"^(to|a|an|the)\s+", "", sense).strip()
                    if not sense or len(sense) > 40:
                        continue
                    # Whole glosses only. Indexing the words inside a multi-word
                    # gloss makes "was" match any idiom containing "was".
                    for key in {sense, stem(sense)}:
                        index[key].add(simplified)
                        index[key].add(traditional)
    return index


def chinese_terms(meaning):
    out = []
    for part in re.split(r"\s*/\s*", str(meaning or "")):
        part = re.sub(r"\[[^\]]*\]", "", part).strip()
        part = re.sub(r"^((?:[a-z]+\.\s*){1,3})", "", part)
        for term in re.split(r"[，,;；]", part):
            term = re.sub(r"[（(].*?[)）]", "", term).strip()
            if term and HAN.search(term):
                out.append(term)
    return out


def load_vocab():
    src = open(os.path.join(REPO, "words.js"), encoding="utf-8").read()
    return json.loads(src[src.index("["):].rstrip().rstrip(";"))


def main():
    if len(sys.argv) < 2:
        sys.exit("usage: verify-meanings.py <cedict .txt>  — see this file's docstring")
    index = load_cedict(sys.argv[1])
    print("CC-CEDICT: %d english gloss keys" % len(index))

    corroborated, unmatched, uncovered = 0, [], 0
    for rank, entry in enumerate(load_vocab(), 1):
        word = entry["w"].lower()
        reference = index.get(word, set()) | index.get(stem(word), set())
        ours = chinese_terms(entry["c"])
        if not reference or not ours:
            uncovered += 1
            continue
        hit = any(t in reference or any(t in r or r in t for r in reference) for t in ours)
        if hit:
            corroborated += 1
        else:
            unmatched.append((rank, entry["w"], ours[:3], sorted(reference)[:4]))

    total = corroborated + len(unmatched)
    print("words both dictionaries cover: %d   (CC-CEDICT has no entry for %d)"
          % (total, uncovered))
    print("  corroborated  %d (%.1f%%)" % (corroborated, 100.0 * corroborated / max(total, 1)))
    print("  not matched   %d (%.1f%%)" % (len(unmatched), 100.0 * len(unmatched) / max(total, 1)))
    top = [u for u in unmatched if u[0] <= 3000]
    print("  ...of which in the top 3,000: %d" % len(top))
    print("\nnot matched, most common first — check, do not assume wrong:")
    for rank, word, ours, theirs in unmatched[:25]:
        print("   #%-6d%-14s ECDICT=%s  CC-CEDICT=%s" % (rank, word, ours, theirs))


if __name__ == "__main__":
    main()
