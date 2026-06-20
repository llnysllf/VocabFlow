/* Sentence-translation sample (Chinese -> English).
   Each sentence carries an answer key the heuristic grader uses to (a) accept
   several phrasings and (b) diagnose WHY a wrong answer is wrong, per point.

   point = { id, label, reason, need:[forms that satisfy it], wrong:[forms that
   show it was attempted but wrong] }. Tokens are matched case-insensitively;
   multi-word tokens match as a phrase, single words match whole-word. */
window.SENTENCES = [
{
  "r": 1, "zh": "我昨天看了一部电影。",
  "en": ["I watched a movie yesterday.", "I saw a movie yesterday.", "Yesterday I watched a movie.", "I watched a film yesterday.", "I saw a film yesterday."],
  "points": [
    { "id": "past", "label": "Past tense", "reason": "tense", "need": ["watched", "saw"], "wrong": ["watch", "watches", "watching", "see", "sees", "seeing", "seen"] },
    { "id": "v-movie", "label": "the word “movie/film”", "reason": "vocabulary", "need": ["movie", "film"] },
    { "id": "t-yesterday", "label": "time word “yesterday”", "reason": "time word", "need": ["yesterday"] },
    { "id": "art", "label": "article “a”", "reason": "article", "need": ["a movie", "a film"] }
  ]
},
{
  "r": 2, "zh": "她每天早上喝咖啡。",
  "en": ["She drinks coffee every morning.", "She has coffee every morning.", "Every morning she drinks coffee."],
  "points": [
    { "id": "agree", "label": "subject–verb agreement (she + verb-s)", "reason": "tense / agreement", "need": ["drinks", "has coffee"], "wrong": ["drink", "drinking", "drank", "have coffee"] },
    { "id": "v-coffee", "label": "the word “coffee”", "reason": "vocabulary", "need": ["coffee"] },
    { "id": "t-morning", "label": "“every morning”", "reason": "time phrase", "need": ["every morning"] }
  ]
},
{
  "r": 3, "zh": "我已经吃过午饭了。",
  "en": ["I have eaten lunch.", "I have already eaten lunch.", "I have had lunch.", "I've eaten lunch.", "I've had lunch.", "I already ate lunch."],
  "points": [
    { "id": "perfect", "label": "present perfect (have + done)", "reason": "tense", "need": ["have eaten", "have had", "have already eaten", "have done"], "wrong": ["am eating", "will eat", "was eating"] },
    { "id": "v-lunch", "label": "the word “lunch”", "reason": "vocabulary", "need": ["lunch"] }
  ]
},
{
  "r": 4, "zh": "这些孩子在公园里玩。",
  "en": ["The children are playing in the park.", "The kids are playing in the park.", "These children are playing in the park."],
  "points": [
    { "id": "cont", "label": "present continuous (are + -ing)", "reason": "tense", "need": ["are playing"], "wrong": ["play", "plays", "played", "is playing", "playing in"] },
    { "id": "plural", "label": "plural “children/kids”", "reason": "plural", "need": ["children", "kids"], "wrong": ["child", "childs", "kid"] },
    { "id": "prep", "label": "preposition “in the park”", "reason": "preposition", "need": ["in the park", "in park"], "wrong": ["on the park", "at the park"] },
    { "id": "v-park", "label": "the word “park”", "reason": "vocabulary", "need": ["park"] }
  ]
},
{
  "r": 5, "zh": "如果我有钱，我就会买一辆车。",
  "en": ["If I had money, I would buy a car.", "If I had money, I'd buy a car.", "I would buy a car if I had money."],
  "points": [
    { "id": "cond", "label": "conditional (if + past)", "reason": "conditional", "need": ["if i had", "had money", "had the money"], "wrong": ["if i have", "if i will have", "if i had had"] },
    { "id": "would", "label": "modal “would”", "reason": "modal", "need": ["would buy", "would get"], "wrong": ["will buy", "will get"] },
    { "id": "v-car", "label": "the word “car”", "reason": "vocabulary", "need": ["car"] }
  ]
},
{
  "r": 6, "zh": "他比我高。",
  "en": ["He is taller than me.", "He is taller than I am.", "He's taller than me.", "He is taller than I."],
  "points": [
    { "id": "comp", "label": "comparative (taller than)", "reason": "comparative", "need": ["taller than"], "wrong": ["more tall", "tall than", "taller then", "more taller"] },
    { "id": "v-tall", "label": "the word “tall”", "reason": "vocabulary", "need": ["tall"] }
  ]
},
{
  "r": 7, "zh": "桌子上有三本书。",
  "en": ["There are three books on the table.", "There are 3 books on the table."],
  "points": [
    { "id": "there", "label": "existential “there are”", "reason": "grammar (there are)", "need": ["there are"], "wrong": ["there is", "there's", "have", "has", "it has"] },
    { "id": "plural", "label": "plural “books”", "reason": "plural", "need": ["books"], "wrong": ["book on", "book on the", "three book"] },
    { "id": "num", "label": "number “three”", "reason": "number", "need": ["three", "3"] },
    { "id": "prep", "label": "preposition “on the table”", "reason": "preposition", "need": ["on the table"], "wrong": ["in the table", "at the table", "on table"] }
  ]
},
{
  "r": 8, "zh": "我不喜欢喝茶。",
  "en": ["I don't like to drink tea.", "I don't like drinking tea.", "I do not like tea.", "I don't like tea."],
  "points": [
    { "id": "neg", "label": "negation (don't)", "reason": "negation", "need": ["don't", "do not"], "wrong": ["am not like", "not like to"] },
    { "id": "v-tea", "label": "the word “tea”", "reason": "vocabulary", "need": ["tea"] }
  ]
},
{
  "r": 9, "zh": "昨天下雨的时候，我正在睡觉。",
  "en": ["I was sleeping when it was raining yesterday.", "I was sleeping when it rained yesterday.", "Yesterday I was sleeping when it rained.", "When it was raining yesterday, I was sleeping."],
  "points": [
    { "id": "pastcont", "label": "past continuous (was + -ing)", "reason": "tense", "need": ["was sleeping"], "wrong": ["slept", "am sleeping", "was sleep", "is sleeping"] },
    { "id": "v-rain", "label": "the word “rain”", "reason": "vocabulary", "need": ["rain", "raining", "rained"] },
    { "id": "conj", "label": "conjunction “when”", "reason": "conjunction", "need": ["when"] }
  ]
},
{
  "r": 10, "zh": "那个穿红色衣服的女孩是我妹妹。",
  "en": ["The girl who is wearing red is my sister.", "The girl in red is my sister.", "The girl wearing red is my sister.", "The girl who wears red is my sister.", "The girl in the red clothes is my sister."],
  "points": [
    { "id": "rel", "label": "relative clause / modifier (who / wearing)", "reason": "relative clause", "need": ["who is wearing", "who wears", "wearing red", "in red", "in the red"] },
    { "id": "v-red", "label": "the word “red”", "reason": "vocabulary", "need": ["red"] },
    { "id": "v-sister", "label": "the word “sister”", "reason": "vocabulary", "need": ["sister"] }
  ]
},
{
  "r": 11, "zh": "这部电影没有那本书好看。",
  "en": ["This movie is not as good as the book.", "The movie isn't as good as the book.", "This film is not as good as the book.", "This movie is not as good as that book."],
  "points": [
    { "id": "asas", "label": "comparison (as … as)", "reason": "comparison", "need": ["as good as"], "wrong": ["gooder", "more good", "as better as", "good as"] },
    { "id": "neg", "label": "negation (not)", "reason": "negation", "need": ["not", "isn't", "is not"] },
    { "id": "v-movie", "label": "the word “movie/film”", "reason": "vocabulary", "need": ["movie", "film"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 12, "zh": "我明天要去北京。",
  "en": ["I will go to Beijing tomorrow.", "I'm going to Beijing tomorrow.", "I am going to Beijing tomorrow.", "I'm going to go to Beijing tomorrow.", "Tomorrow I will go to Beijing."],
  "points": [
    { "id": "future", "label": "future (will / going to)", "reason": "tense", "need": ["will go", "going to", "will travel", "am going"], "wrong": ["went", "go to beijing yesterday", "was going"] },
    { "id": "v-beijing", "label": "the place “Beijing”", "reason": "vocabulary", "need": ["beijing"] },
    { "id": "t-tomorrow", "label": "time word “tomorrow”", "reason": "time word", "need": ["tomorrow"] }
  ]
}
];
