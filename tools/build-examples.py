#!/usr/bin/env python3
"""Regenerate examples.js — example sentences for each headword.

Source: Tatoeba's aligned English–Chinese sentence pairs (CC BY 2.0 FR).

Tatoeba sentences are not tagged with which sense of a word they use, so that
is inferred here: if the Chinese translation of an example contains one of the
word's own Chinese meanings, the example is showing that sense. "You must not
run in the school buildings / 你不应该在学校大楼里奔跑" contains 奔跑, which is one
of run's listed senses — so the example is filed under it. It gives a word like
"run" or "break" several examples that visibly differ in meaning, which is the
point; where nothing matches, the example is still kept, just untagged.

Usage:
    curl -sO https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2
    curl -sO https://downloads.tatoeba.org/exports/per_language/cmn/cmn_sentences.tsv.bz2
    curl -sO https://downloads.tatoeba.org/exports/per_language/cmn/cmn-eng_links.tsv.bz2
    bunzip2 *.bz2
    python3 tools/build-examples.py [directory containing the .tsv files]
"""

import collections
import csv
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PER_WORD = 4           # at most this many examples per headword
MIN_LEN, MAX_LEN = 14, 95


def load_sentences(path):
    out = {}
    with open(path, encoding="utf-8") as fh:
        for row in csv.reader(fh, delimiter="\t"):
            if len(row) >= 3:
                out[row[0]] = row[2]
    return out


def load_pairs(folder):
    eng = load_sentences(os.path.join(folder, "eng_sentences.tsv"))
    cmn = load_sentences(os.path.join(folder, "cmn_sentences.tsv"))
    pairs = []
    with open(os.path.join(folder, "cmn-eng_links.tsv"), encoding="utf-8") as fh:
        for row in csv.reader(fh, delimiter="\t"):
            if len(row) >= 2 and row[0] in cmn and row[1] in eng:
                pairs.append((eng[row[1]], cmn[row[0]]))
    return pairs


def senses(meaning):
    """[(pos label, [chinese terms])] for one ECDICT meaning string."""
    out = []
    for part in re.split(r"\s*/\s*", str(meaning or "")):
        part = part.strip()
        if not part or part.startswith("["):        # [计] / [医] domain tags
            continue
        m = re.match(r"^((?:[a-z]+\.\s*){1,3})(.+)$", part)
        label, rest = (m.group(1).strip(), m.group(2)) if m else ("", part)
        terms = [t.strip() for t in re.split(r"[，,;；]", rest) if t.strip()]
        if terms:
            out.append((label, terms))
    return out


def sense_of(chinese, word_senses):
    """Which sense this translation appears to show, or "" if unclear."""
    for label, terms in word_senses:
        for term in terms:
            if len(term) >= 2 and term in chinese:
                return (label + " " + term).strip()
    return ""


def load_vocab():
    src = open(os.path.join(REPO, "words.js"), encoding="utf-8").read()
    return json.loads(src[src.index("["):].rstrip().rstrip(";"))


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    if not os.path.exists(os.path.join(folder, "eng_sentences.tsv")):
        sys.exit("Tatoeba .tsv exports not found in %s — see this file's docstring" % folder)

    pairs = load_pairs(folder)
    index = collections.defaultdict(list)
    for en, zh in pairs:
        if not (MIN_LEN <= len(en) <= MAX_LEN):
            continue
        for w in set(re.findall(r"[a-z']+", en.lower())):
            index[w].append((en, zh))

    table, tagged, multi = {}, 0, 0
    for entry in load_vocab():
        word = entry["w"].lower()
        found = index.get(word)
        if not found:
            continue
        ss = senses(entry["c"])
        # One example per distinct sense first — that is what makes the meanings
        # visibly differ — then the shortest remaining ones to fill the quota.
        best, seen_zh, by_sense = [], set(), {}
        for en, zh in sorted(found, key=lambda p: len(p[0])):
            key = sense_of(zh, ss)
            if not key or key in by_sense or zh in seen_zh:
                continue
            by_sense[key] = True
            seen_zh.add(zh)
            best.append({"en": en, "zh": zh, "s": key})
        for en, zh in sorted(found, key=lambda p: len(p[0])):
            if len(best) >= PER_WORD:
                break
            if zh in seen_zh:
                continue
            seen_zh.add(zh)
            best.append({"en": en, "zh": zh})
        best = best[:PER_WORD]
        if best:
            table[word] = best
            if any("s" in b for b in best):
                tagged += 1
            if len(by_sense) > 1:
                multi += 1

    blob = json.dumps(table, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    out = os.path.join(REPO, "examples.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "/* Example sentences for the Vocabulary deck, with Chinese translations.\n"
            "   Generated by tools/build-examples.py from Tatoeba (CC BY 2.0 FR,\n"
            "   https://tatoeba.org). The `s` field is the sense an example appears to\n"
            "   show, inferred from the translation. Do not edit by hand. */\n"
            "window.EXAMPLES = " + blob + ";\n")
    print("wrote %s — %d words, %d sentences, %.0f KB"
          % (out, len(table), sum(len(v) for v in table.values()),
             os.path.getsize(out) / 1024))
    print("  %d words have at least one sense-tagged example, %d span two or more senses"
          % (tagged, multi))


if __name__ == "__main__":
    main()
