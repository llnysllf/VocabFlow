#!/usr/bin/env python3
"""Regenerate ipa.js — the offline phonetic table shown next to each headword.

Source: the CMU Pronouncing Dictionary (cmudict), BSD-licensed, General
American. Its ARPAbet phone strings are converted to IPA here, with syllable
stress marks placed by the maximal-onset principle.

Usage:
    curl -sLO https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict
    python3 tools/build-ipa.py          # writes ipa.js at the repo root

Words absent from cmudict (mostly acronyms like "faq" and "gmt", which have no
settled pronunciation) are simply left out; the app shows no phonetic for them
and still speaks them.
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)

ARPA_C = {
    "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f", "G": "ɡ", "HH": "h",
    "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p",
    "R": "ɹ", "S": "s", "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w",
    "Y": "j", "Z": "z", "ZH": "ʒ",
}
# AH and ER are handled separately: both map to a different symbol when unstressed.
ARPA_V = {
    "AA": "ɑ", "AE": "æ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ", "EH": "ɛ",
    "EY": "eɪ", "IH": "ɪ", "IY": "i", "OW": "oʊ", "OY": "ɔɪ", "UH": "ʊ",
    "UW": "u",
}

ONSET2 = set("""P R|P L|P Y|B R|B L|B Y|T R|T W|T Y|D R|D W|D Y|K R|K L|K W|K Y|
G R|G L|G W|G Y|F R|F L|F Y|TH R|TH W|TH Y|SH R|S P|S T|S K|S M|S N|S L|S W|S F|
S Y|HH Y|HH W|M Y|N Y|V Y|L Y""".replace("\n", "").split("|"))
ONSET3 = {"S P R", "S T R", "S K R", "S P L", "S K W", "S K Y", "S P Y",
          "S T Y", "S M Y"}

DECKS = ["words.js", "idioms.js", "phrasal.js", "slang.js", "proverbs.js", "sayings.js"]


def is_vowel(phone):
    return phone[:2] in ARPA_V or phone[:2] in ("AH", "ER")


def vowel_symbol(phone):
    base, stress = phone[:-1], phone[-1]
    if not stress.isdigit():
        base, stress = phone, "0"
    if base == "AH":
        return "ə" if stress == "0" else "ʌ"
    if base == "ER":
        return "ɚ" if stress == "0" else "ɝ"
    return ARPA_V.get(base, "")


def legal_onset(cluster):
    if len(cluster) == 0:
        return True
    if len(cluster) == 1:
        return cluster[0] != "NG"
    if len(cluster) == 2:
        return " ".join(cluster) in ONSET2
    if len(cluster) == 3:
        return " ".join(cluster) in ONSET3
    return False


def to_ipa(phones):
    """ARPAbet phone list -> IPA string with ˈ / ˌ stress marks."""
    nuclei = [i for i, p in enumerate(phones) if is_vowel(p)]
    if not nuclei:
        return ""
    # Each syllable starts as late as a legal onset cluster allows.
    starts = [0]
    for cur, nxt in zip(nuclei, nuclei[1:]):
        between = phones[cur + 1:nxt]
        take = 0
        for n in range(min(3, len(between)), 0, -1):
            if legal_onset(between[len(between) - n:]):
                take = n
                break
        starts.append(nxt - take)

    out, syl = [], 0
    for i, phone in enumerate(phones):
        if syl < len(starts) and i == starts[syl]:
            stress = phones[nuclei[syl]][-1]
            if len(nuclei) > 1:                 # no mark on a one-syllable word
                if stress == "1":
                    out.append("ˈ")
                elif stress == "2":
                    out.append("ˌ")
            syl += 1
        out.append(vowel_symbol(phone) if is_vowel(phone)
                   else ARPA_C.get(re.sub(r"\d", "", phone), ""))
    return "".join(out)


def load_cmudict(path):
    """word -> IPA, keeping cmudict's default (first) pronunciation."""
    lex = {}
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.split("#")[0].strip()
            if not line:
                continue
            parts = line.split()
            word = parts[0]
            if "(" in word:                     # "read(2)" alternate pronunciations
                continue
            if not re.fullmatch(r"[a-z][a-z'.-]*", word):
                continue
            lex.setdefault(word, to_ipa(parts[1:]))
    return lex


def deck_headwords():
    heads = []
    for name in DECKS:
        src = open(os.path.join(REPO, name), encoding="utf-8").read()
        entries = json.loads(src[src.index("["):].rstrip().rstrip(";"))
        heads += [e["w"] for e in entries]
    return heads


def phrase_ipa(text, lex):
    """Idioms and phrasal verbs: join each word's citation form."""
    tokens = re.findall(r"[a-zA-Z']+", text.lower())
    if not tokens:
        return ""
    parts = [lex.get(t, "") for t in tokens]
    return " ".join(parts) if all(parts) else ""


def main():
    dict_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.getcwd(), "cmudict.dict")
    if not os.path.exists(dict_path):
        sys.exit("cmudict.dict not found — download it first (see this file's docstring)")

    lex = load_cmudict(dict_path)
    table, missing = {}, []
    for head in deck_headwords():
        k = head.strip().lower()
        if k in table:
            continue
        ipa = phrase_ipa(k, lex)
        if ipa:
            table[k] = ipa
        else:
            missing.append(k)

    blob = json.dumps(table, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    out = os.path.join(REPO, "ipa.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(
            "/* Phonetic spellings (General American IPA) for every deck headword.\n"
            "   Generated by tools/build-ipa.py from the CMU Pronouncing Dictionary.\n"
            "   cmudict is Copyright (C) 1993-2015 Carnegie Mellon University,\n"
            "   redistributed under its BSD-style licence. Do not edit by hand. */\n"
            "window.IPA = " + blob + ";\n"
        )
    print("wrote %s — %d entries, %.0f KB (%d headwords had no cmudict entry)"
          % (out, len(table), os.path.getsize(out) / 1024, len(missing)))


if __name__ == "__main__":
    main()
