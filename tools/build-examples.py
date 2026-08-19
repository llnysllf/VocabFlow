#!/usr/bin/env python3
"""Regenerate examples.js — example sentences per headword, split by word type.

Source: Tatoeba's aligned English–Chinese sentence pairs (CC BY 2.0 FR).

A word like "break" is a noun in "The break is over" and a verb in "I sometimes
break the rules", and those are the two things a learner needs to see apart. So
every candidate sentence is part-of-speech tagged, and the examples for a word
are filed under the type the word actually has *in that sentence* — not under
the dictionary's list of types, and not by guessing from the translation.

Two things decide whether a sentence can count for a word at all, and both are
relaxed in stages so that a good match always beats a merely acceptable one:

  the form   "ran" is an example of "run" and "broken" one of "break". The word
             as written is preferred, but a word whose lemma matches is taken
             rather than leaving the type with nothing — which is what most
             words past the first few thousand would otherwise get.

  the tag    spaCy tags by Universal Dependencies, the dictionary labels by
             traditional grammar, and they disagree on whole word classes.
             "this", "some" and "each" are DET to the tagger and adjectives to
             the dictionary; "not" is a PART and an adverb; an AUX is a verb.
             Each tag therefore names one label it means outright and any it can
             also stand for, and the second kind is only used as a fallback.

Within a type, the picks are spread across senses where the Chinese translation
identifies one: if the translation of a "v." example contains 打断, and 打断 is
one of the word's listed verb meanings, that example is showing that meaning, so
the next pick looks for a different one. The sense is used for choosing only and
is not written to the file — the sentences themselves show the difference.

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
MIN_LEN, MAX_LEN = 10, 140
PER_BUCKET = 80         # candidates kept per word/type/quality — 3 are needed

# spaCy's Universal Dependencies tag -> the label it means outright, then any
# label it can also stand for. The second list is what reconciles the two
# tagsets: traditional grammar has no determiner class, so a word used
# attributively — "this book", "every word" — is an adjective there, and "not"
# is an adverb rather than a particle.
#
# These fallbacks have to stay narrow or they file a usage under a label it does
# not show. A pronoun is not evidence of adjective use: "What's this?" would
# stand as the adjective example for "this" while showing a pronoun. Only the
# possessives cross that line, which is why they are matched on the finer tag
# below rather than on PRON as a whole.
TAG_LABELS = {
    "NOUN":  ("n.", []),
    "PROPN": ("n.", []),
    "VERB":  ("v.", []),
    "AUX":   ("aux.", ["v."]),
    "ADJ":   ("adj.", []),
    "ADV":   ("adv.", []),
    "ADP":   ("prep.", ["conj.", "adv."]),
    "DET":   ("art.", ["adj."]),
    "PRON":  ("pron.", ["n."]),
    "CCONJ": ("conj.", []),
    "SCONJ": ("conj.", ["prep.", "adv."]),
    "NUM":   ("num.", ["adj.", "n."]),
    "INTJ":  ("interj.", []),
    "PART":  ("adv.", ["prep."]),
}
# Checked before the coarse tag. "my", "your", "whose" are pronouns to the
# tagger and possessive adjectives to the dictionary.
FINE_LABELS = {
    "PRP$": ("pron.", ["adj."]),
    "WP$":  ("pron.", ["adj."]),
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
        # Only NER is dead weight here. The lemmatiser earns its cost because
        # without it a word is only ever an example of itself, and most of the
        # vocabulary past the common few thousand appears in Tatoeba only
        # inflected. The parser earns its cost because the tagger alone cannot
        # tell "This book is mine" from "What's this?" — both are DT, and only
        # the dependency separates the determiner from the pronoun.
        nlp = spacy.load("en_core_web_sm", disable=["ner"])
    except OSError:
        sys.exit("spacy model missing: python3 -m spacy download en_core_web_sm")

    vocab = load_vocab()
    wanted_words = {e["w"].lower() for e in vocab}

    # The deck lists inflected forms as headwords of their own — "awards",
    # "communities", "said", "getting". Left alone, each could only be
    # illustrated by a sentence containing that exact form, so a headword also
    # looks under its own lemma and "I won an award" can serve "awards".
    heads = sorted(wanted_words)
    head_lemma = {}
    for word, doc in zip(heads, nlp.pipe(heads, batch_size=500)):
        if not len(doc):
            continue
        lemma = doc[0].lemma_.lower()
        if lemma != word and lemma.isalpha():
            head_lemma[word] = lemma
    index_keys = wanted_words | set(head_lemma.values())
    print("%d headwords, %d of them inflected forms of another word"
          % (len(heads), len(head_lemma)))

    pairs = [p for p in load_pairs(folder) if MIN_LEN <= len(p[0]) <= MAX_LEN]
    print("tagging %d sentences..." % len(pairs))

    # word -> label -> (tag_rank, form_rank) -> [(pair index, well-placed noun)]
    def buckets():
        return collections.defaultdict(lambda: collections.defaultdict(list))
    index = collections.defaultdict(buckets)

    docs = nlp.pipe((en for en, _ in pairs), batch_size=200)
    for n, doc in enumerate(docs):
        if n and n % 20000 == 0:
            print("  %d/%d" % (n, len(pairs)))
        for i, token in enumerate(doc):
            entry = FINE_LABELS.get(token.tag_) or TAG_LABELS.get(token.pos_)
            if not entry:
                continue
            surface = token.text.lower()
            if not surface.isalpha():
                continue
            forms = [surface]
            lemma = token.lemma_.lower()
            if lemma != surface and lemma.isalpha():
                forms.append(lemma)
            forms = [f for f in forms if f in index_keys]
            if not forms:
                continue

            # A tagger still calls "the bus run?" and "much less run" nouns.
            # A real singular noun almost always has a determiner, possessive or
            # number just before it, so prefer those and keep the rest as
            # fallback — a preference costs no coverage, a filter would.
            strong = True
            if token.tag_ == "NN":
                # Look at the word immediately before, stepping back over one
                # adjective ("a fast run"). Anything else — a noun, a verb, an
                # adverb — and this is probably not really a noun here.
                j = i - 1
                if j >= 0 and doc[j].pos_ == "ADJ":
                    j -= 1
                strong = j >= 0 and doc[j].pos_ in ("DET", "NUM", "PRON")

            labels = [(0, entry[0])] + [(1, lbl) for lbl in entry[1]]
            for form_rank, form in enumerate(forms):
                for tag_rank, label in labels:
                    bucket = index[form][label][(tag_rank, form_rank)]
                    if len(bucket) < PER_BUCKET:
                        bucket.append((n, strong or label != "n."))

    table, with_type, full = {}, 0, 0
    types_wanted = types_got = 0
    for entry in vocab:
        word = entry["w"].lower()
        # The word as written first, then whatever it is an inflected form of.
        found = collections.defaultdict(dict)
        for look, key in enumerate([word, head_lemma.get(word)]):
            for label, bucketed in (index.get(key) or {}).items():
                for (tag_rank, form_rank), candidates in bucketed.items():
                    found[label].setdefault((tag_rank, look, form_rank), []).extend(candidates)
        if not found:
            continue
        wanted = senses_by_type(entry["c"])
        # Offer every type the dictionary lists that sentences exist for, plus
        # any type the sentences show that the dictionary happens to omit. That
        # second case has to ignore what the word inflects from: with no listed
        # type to check against there is nothing to catch a lemma that is really
        # a different word, and "gonna" would take a noun from "go" and offer
        # "Give it a go!" as an example of itself.
        labels = [t for t in TYPE_ORDER if t in wanted and t in found]
        if not labels:
            direct = index.get(word) or {}
            labels = [t for t in TYPE_ORDER if t in direct][:1]
        groups = {}
        for label in labels:
            terms = wanted.get(label, [])
            # Best quality first, in that order of importance: the tag meant
            # this label outright before it merely allowed it, the headword
            # before what the headword inflects from, and the word as written
            # before a sentence that only shares its lemma. Within a bucket,
            # well-placed nouns first, then the shortest — a short sentence is
            # easier to read and usually shows the word more plainly.
            ordered = []
            for key in sorted(found[label]):
                ordered.extend(sorted(found[label][key],
                                      key=lambda c: (not c[1], len(pairs[c[0]][0]))))

            picked, seen, seen_en = [], set(), set()
            chosen_senses = set()

            def take(idx, sense=None):
                en, zh = pairs[idx]
                key = (en.lower(), zh)
                if key in seen or en.lower() in seen_en:
                    return False
                seen.add(key)
                seen_en.add(en.lower())
                if sense:
                    chosen_senses.add(sense)
                picked.append({"en": en, "zh": zh})
                return True

            # A sentence whose translation names a specific sense goes first —
            # that is what makes two examples of the same type differ.
            for idx, _strong in ordered:
                if len(picked) >= PER_TYPE:
                    break
                zh = pairs[idx][1]
                hit = next((t for t in terms if len(t) >= 2 and t in zh), None)
                if hit and hit not in chosen_senses:
                    take(idx, hit)
            for idx, _strong in ordered:
                if len(picked) >= PER_TYPE:
                    break
                take(idx)
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
            "   the word actually has in it. Do not edit by hand. */\n"
            "window.EXAMPLES = " + blob + ";\n")
    total = sum(len(v) for g in table.values() for v in g.values())
    print("wrote %s — %d words, %d sentences, %.0f KB"
          % (out, len(table), total, os.path.getsize(out) / 1024))
    print("  word types the dictionary lists: %d; covered by an example: %d (%d%%)"
          % (types_wanted, types_got, 100 * types_got // max(types_wanted, 1)))
    print("  words where every listed type has an example: %d" % full)


if __name__ == "__main__":
    main()
