#!/usr/bin/env python3
"""Regenerate examples.js — example sentences per headword, split by word type.

Source: Tatoeba's aligned English–Chinese sentence pairs (CC BY 2.0 FR).

A word like "break" is a noun in "The break is over" and a verb in "I sometimes
break the rules", and those are the two things a learner needs to see apart. So
every candidate sentence is part-of-speech tagged, and the examples for a word
are filed under the type the word actually has *in that sentence* — not under
the dictionary's list of types, and not by guessing from the translation.

Within a type, an example is additionally labelled with the specific sense when
the Chinese translation makes that unambiguous: if the translation of a "v."
example contains 打断, and 打断 is one of the word's listed verb meanings, the
example is showing that meaning. That is a heuristic and only fires when the
translation says so.

Usage:
    pip install spacy && python3 -m spacy download en_core_web_sm
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
PER_TYPE = 3            # at most this many examples per word type
MIN_LEN, MAX_LEN = 12, 100

# spaCy's coarse tags -> the labels the dictionary uses.
POS_TO_TYPE = {
    "NOUN": "n.", "PROPN": "n.", "VERB": "v.", "ADJ": "adj.", "ADV": "adv.",
    "ADP": "prep.", "PRON": "pron.", "DET": "art.", "CCONJ": "conj.",
    "SCONJ": "conj.", "NUM": "num.", "INTJ": "interj.", "AUX": "aux.",
}
# ECDICT's abbreviations -> the same labels.
ECDICT_TO_TYPE = {
    "n": "n.", "vt": "v.", "vi": "v.", "v": "v.", "a": "adj.", "adj": "adj.",
    "s": "adj.", "ad": "adv.", "adv": "adv.", "r": "adv.", "prep": "prep.",
    "conj": "conj.", "pron": "pron.", "art": "art.", "num": "num.",
    "int": "interj.", "interj": "interj.", "aux": "aux.",
}
TYPE_ORDER = ["n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.", "art.",
              "num.", "interj.", "aux."]


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


def senses_by_type(meaning):
    """{"n.": [chinese terms], "v.": [...]} from one ECDICT meaning string."""
    out = collections.defaultdict(list)
    for part in re.split(r"\s*/\s*", str(meaning or "")):
        part = part.strip()
        if not part or part.startswith("["):        # [计] / [医] domain tags
            continue
        m = re.match(r"^((?:[a-z]+\.\s*){1,3})(.+)$", part)
        if not m:
            continue
        key = re.sub(r"[.\s]", "", m.group(1).split()[0]).lower()
        label = ECDICT_TO_TYPE.get(key)
        if not label:
            continue
        for term in re.split(r"[，,;；]", m.group(2)):
            term = term.strip()
            if term:
                out[label].append(term)
    return out


def load_vocab():
    src = open(os.path.join(REPO, "words.js"), encoding="utf-8").read()
    return json.loads(src[src.index("["):].rstrip().rstrip(";"))


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    if not os.path.exists(os.path.join(folder, "eng_sentences.tsv")):
        sys.exit("Tatoeba .tsv exports not found in %s — see this file's docstring" % folder)
    try:
        import spacy
    except ImportError:
        sys.exit("needs spacy: pip install spacy && python3 -m spacy download en_core_web_sm")
    try:
        # The parser, NER and lemmatiser are not needed for tagging, and dropping
        # them roughly triples throughput over 70k sentences.
        nlp = spacy.load("en_core_web_sm", disable=["parser", "ner", "lemmatizer"])
    except OSError:
        sys.exit("spacy model missing: python3 -m spacy download en_core_web_sm")

    pairs = [p for p in load_pairs(folder) if MIN_LEN <= len(p[0]) <= MAX_LEN]
    print("tagging %d sentences..." % len(pairs))

    # word -> type -> [(en, zh)], from what the word actually is in that sentence
    index = collections.defaultdict(lambda: collections.defaultdict(list))
    docs = nlp.pipe((en for en, _ in pairs), batch_size=200)
    for n, (doc, (en, zh)) in enumerate(zip(docs, pairs)):
        if n and n % 20000 == 0:
            print("  %d/%d" % (n, len(pairs)))
        for i, token in enumerate(doc):
            label = POS_TO_TYPE.get(token.pos_)
            key = token.text.lower()
            if not label or not key.isalpha():
                continue
            # A tagger still calls "the bus run?" and "much less run" nouns.
            # A real singular noun almost always has a determiner, possessive or
            # number just before it, so prefer those and keep the rest as
            # fallback — a preference costs no coverage, a filter would.
            strong = True
            if label == "n." and token.tag_ == "NN":
                # Look at the word immediately before, stepping back over one
                # adjective ("a fast run"). Anything else — a noun, a verb, an
                # adverb — and this is probably not really a noun here.
                j = i - 1
                if j >= 0 and doc[j].pos_ == "ADJ":
                    j -= 1
                strong = j >= 0 and doc[j].pos_ in ("DET", "NUM", "PRON")
            index[key][label].append((en, zh, strong))

    table, with_type, full = {}, 0, 0
    types_wanted = types_got = 0
    for entry in load_vocab():
        word = entry["w"].lower()
        found = index.get(word)
        if not found:
            continue
        wanted = senses_by_type(entry["c"])
        # Offer every type the dictionary lists that sentences exist for, plus
        # any type the sentences show that the dictionary happens to omit.
        labels = [t for t in TYPE_ORDER if t in wanted and t in found]
        if not labels:
            labels = [t for t in TYPE_ORDER if t in found][:1]
        groups = {}
        for label in labels:
            terms = wanted.get(label, [])
            picked, seen = [], set()
            # Confidently-tagged first, then shortest — a short sentence is
            # easier to read and usually shows the word more plainly.
            ordered = sorted(found[label], key=lambda p: (not p[2], len(p[0])))

            def take(en, zh, sense=None):
                key = (en.lower(), zh)
                if key in seen or en.lower() in {e for e, _ in seen}:
                    return False
                seen.add(key)
                picked.append({"en": en, "zh": zh, "s": sense} if sense
                              else {"en": en, "zh": zh})
                return True

            # A sentence whose translation names a specific sense goes first —
            # that is what makes two examples of the same type differ.
            for en, zh, _strong in ordered:
                if len(picked) >= PER_TYPE:
                    break
                hit = next((t for t in terms if len(t) >= 2 and t in zh), None)
                if hit and not any(p.get("s") == hit for p in picked):
                    take(en, zh, hit)
            for en, zh, _strong in ordered:
                if len(picked) >= PER_TYPE:
                    break
                take(en, zh)
            if picked:
                groups[label] = picked
        if groups:
            table[word] = groups
            with_type += 1
            types_wanted += len(wanted) or 1
            types_got += len([t for t in groups if t in wanted]) or len(groups)
            if wanted and all(t in groups for t in wanted):
                full += 1

    blob = json.dumps(table, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    out = os.path.join(REPO, "examples.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "/* Example sentences for the Vocabulary deck, split by word type.\n"
            "   Generated by tools/build-examples.py from Tatoeba (CC BY 2.0 FR,\n"
            "   https://tatoeba.org). Each sentence is filed under the part of speech\n"
            "   the word actually has in it; `s` names the specific sense where the\n"
            "   Chinese translation makes it clear. Do not edit by hand. */\n"
            "window.EXAMPLES = " + blob + ";\n")
    total = sum(len(v) for g in table.values() for v in g.values())
    print("wrote %s — %d words, %d sentences, %.0f KB"
          % (out, len(table), total, os.path.getsize(out) / 1024))
    print("  word types the dictionary lists: %d; covered by an example: %d (%d%%)"
          % (types_wanted, types_got, 100 * types_got // max(types_wanted, 1)))
    print("  words where every listed type has an example: %d" % full)


if __name__ == "__main__":
    main()
