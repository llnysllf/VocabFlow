#!/usr/bin/env python3
"""Check sentences.js against the grader in js/app.js.

Three things go wrong when hand-writing an answer key, and all three are silent:

  1. a sample answer that the sentence's own points reject — the learner types
     something the deck itself calls correct and is marked wrong;
  2. a "wrong" form that the points accept anyway — the error the sentence
     exists to teach slips through;
  3. a "wrong" form that can never fire, because it contains the "need" phrase
     as a substring, so it is dead weight in the file.

Usage:
    python3 tools/check-sentences.py          # exits non-zero if 1 or 2 occur
"""

import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Mirrors normEn() / hasTok() in js/app.js. Keep in step with them.
CONTRACTIONS = [(r"n't\b", " not"), (r"'re\b", " are"), (r"'ve\b", " have"),
                (r"'ll\b", " will"), (r"'m\b", " am"), (r"'d\b", " would")]
SUFFIXES = ["s", "es", "'s", "d", "ed", "r", "er", "st", "est", "ing", "ies", "ied"]


def norm(text):
    out = " " + str(text or "").lower().replace("’", "'") + " "
    for pat, rep in CONTRACTIONS:
        out = re.sub(pat, rep, out)
    out = re.sub(r'[.,!?;:"“”()]', " ", out)
    return re.sub(r"\s+", " ", out).strip()


def word_forms(token):
    forms = []
    doubles = (len(token) > 2 and token[-1] not in "aeiouwxy"
               and token[-2] in "aeiou" and token[-3] not in "aeiou")
    for suf in SUFFIXES:
        forms.append(token + suf)
        if token.endswith("e"):
            forms.append(token[:-1] + suf)
        if token.endswith("y"):
            forms.append(token[:-1] + "i" + suf)
        if doubles:
            forms.append(token + token[-1] + suf)
    return forms


def has_token(text, token, fuzzy, banned=()):
    """Length of what `token` matched, or 0. Phrases match on word boundaries."""
    token = norm(token)
    if not token:
        return 0
    padded = " " + text + " "
    if " " in token:
        return len(token) if " " + token + " " in padded else 0
    if " " + token + " " in padded:
        return len(token)
    if not fuzzy:
        return 0
    for form in word_forms(token):
        if form in banned:
            continue
        if " " + form + " " in padded:
            return len(token)
    return 0


def best_match(candidates, text, fuzzy, banned=()):
    return max([has_token(text, t, fuzzy, banned) for t in (candidates or [])] or [0])


def grades_correct(sentence, answer):
    text = norm(answer)
    if text in norm_any(sentence):
        return True
    for point in sentence.get("points", []):
        banned = [norm(w) for w in point.get("wrong", [])]
        need = best_match(point.get("need"), text, True, banned)
        wrong = best_match(point.get("wrong"), text, False)
        if not (need > 0 and wrong <= need):     # the longer pattern wins
            return False
    return True


def norm_any(sentence):
    return [norm(a) for a in sentence.get("en", [])]


def load():
    src = open(os.path.join(REPO, "sentences.js"), encoding="utf-8").read()
    return json.loads(src[src.index("[", src.index("window.SENTENCES")):].rstrip().rstrip(";"))


def main():
    deck = load()
    rejected, accepted, dead = [], [], []

    for s in deck:
        for answer in s["en"]:
            if not grades_correct(s, answer):
                rejected.append((s["r"], answer))
        for point in s.get("points", []):
            banned = [norm(w) for w in point.get("wrong", [])]
            for wrong in point.get("wrong", []):
                if grades_correct(s, wrong):
                    accepted.append((s["r"], point["id"], wrong))
                if any(has_token(norm(wrong), t, True, banned) for t in point.get("need", [])):
                    dead.append((s["r"], point["id"], wrong))

    ranks = [s["r"] for s in deck]
    print("%d sentences, %d points"
          % (len(deck), sum(len(s.get("points", [])) for s in deck)))
    print("ranks contiguous from 1: %s" % (ranks == list(range(1, len(deck) + 1))))
    print("sample answers rejected by their own points: %d" % len(rejected))
    for r, a in rejected[:10]:
        print("    r=%-4d %s" % (r, a))
    print("wrong forms accepted anyway: %d" % len(accepted))
    for r, pid, w in accepted[:10]:
        print("    r=%-4d %-14s %s" % (r, pid, w))
    print("wrong forms that can never fire: %d" % len(dead))

    # Only the first class is unambiguously broken — the learner is told they are
    # wrong when the deck itself says otherwise. The other two are looseness: the
    # point tests what it claims, something else about the answer is untested.
    return 1 if rejected else 0


if __name__ == "__main__":
    sys.exit(main())
