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
},
{
  "r": 13, "zh": "我已经在这里住了五年了。",
  "en": ["I have lived here for five years.", "I have been living here for five years.", "I've lived here for five years.", "I've been living here for five years."],
  "points": [
    { "id": "perfect", "label": "present perfect (have + done)", "reason": "tense", "need": ["have lived", "have been living"], "wrong": ["am living", "lived here for five", "live here for"] },
    { "id": "for", "label": "duration “for five years”", "reason": "preposition", "need": ["for five years", "for 5 years"], "wrong": ["since five years", "since 5 years"] },
    { "id": "num", "label": "number “five”", "reason": "number", "need": ["five", "5"] }
  ]
},
{
  "r": 14, "zh": "当我到家的时候，他已经离开了。",
  "en": ["When I got home, he had already left.", "He had already left when I got home.", "When I got home, he had left."],
  "points": [
    { "id": "pastperfect", "label": "past perfect (had + done)", "reason": "tense", "need": ["had left", "had already left", "had gone"], "wrong": ["has left", "left when", "was leaving"] },
    { "id": "got", "label": "past tense “got home”", "reason": "tense", "need": ["got home", "got back", "arrived"], "wrong": ["get home", "getting home", "go home"] },
    { "id": "conj", "label": "conjunction “when”", "reason": "conjunction", "need": ["when"] }
  ]
},
{
  "r": 15, "zh": "到明年，我就毕业了。",
  "en": ["By next year, I will have graduated.", "I will have graduated by next year.", "By next year, I'll have graduated."],
  "points": [
    { "id": "futureperfect", "label": "future perfect (will have + done)", "reason": "tense", "need": ["will have graduated", "have graduated by"], "wrong": ["will graduate", "am graduating", "graduated"] },
    { "id": "by", "label": "preposition “by next year”", "reason": "preposition", "need": ["by next year"], "wrong": ["until next year", "in next year", "at next year"] },
    { "id": "v-grad", "label": "the word “graduate”", "reason": "vocabulary", "need": ["graduate"] }
  ]
},
{
  "r": 16, "zh": "明天这个时候，我将在飞机上。",
  "en": ["This time tomorrow, I will be on a plane.", "I'll be on a plane this time tomorrow.", "This time tomorrow, I will be flying."],
  "points": [
    { "id": "futurecont", "label": "future continuous (will be + -ing / state)", "reason": "tense", "need": ["will be on", "will be flying"], "wrong": ["will fly", "am on a plane", "was on"] },
    { "id": "t-tomorrow", "label": "time word “tomorrow”", "reason": "time word", "need": ["tomorrow"] },
    { "id": "v-plane", "label": "the word “plane”", "reason": "vocabulary", "need": ["plane", "flying", "airplane"] }
  ]
},
{
  "r": 17, "zh": "你应该多喝水。",
  "en": ["You should drink more water.", "You ought to drink more water.", "You should drink more water."],
  "points": [
    { "id": "modal", "label": "modal “should”", "reason": "modal", "need": ["should drink", "ought to drink", "should", "ought to"], "wrong": ["must drink", "have to drink", "will drink"] },
    { "id": "quant", "label": "quantifier “more”", "reason": "quantifier", "need": ["more water"], "wrong": ["mucher water", "many water", "more waters"] },
    { "id": "v-water", "label": "the word “water”", "reason": "vocabulary", "need": ["water"] }
  ]
},
{
  "r": 18, "zh": "这座桥是十年前建的。",
  "en": ["This bridge was built ten years ago.", "This bridge was built 10 years ago.", "The bridge was built ten years ago."],
  "points": [
    { "id": "passive", "label": "passive (was + built)", "reason": "passive", "need": ["was built"], "wrong": ["built ten", "is built", "builded", "was build", "build"] },
    { "id": "v-bridge", "label": "the word “bridge”", "reason": "vocabulary", "need": ["bridge"] },
    { "id": "ago", "label": "time phrase “… ago”", "reason": "time phrase", "need": ["years ago"], "wrong": ["before ten years", "ten years before", "years before"] }
  ]
},
{
  "r": 19, "zh": "我喜欢在早上跑步。",
  "en": ["I like running in the morning.", "I like to run in the morning.", "I enjoy running in the morning.", "I like jogging in the morning."],
  "points": [
    { "id": "gerund", "label": "verb form (gerund / infinitive after “like”)", "reason": "verb form", "need": ["like running", "like to run", "enjoy running", "like jogging", "enjoy jogging"], "wrong": ["like run", "like ran", "enjoy to run"] },
    { "id": "prep", "label": "preposition “in the morning”", "reason": "preposition", "need": ["in the morning"], "wrong": ["on the morning", "at the morning", "in morning"] },
    { "id": "v-run", "label": "the word “run”", "reason": "vocabulary", "need": ["run", "running", "jog", "jogging"] }
  ]
},
{
  "r": 20, "zh": "房间里没有多少人。",
  "en": ["There are not many people in the room.", "There aren't many people in the room.", "There weren't many people in the room.", "There were not many people in the room."],
  "points": [
    { "id": "quant", "label": "quantifier “many” (countable)", "reason": "quantifier", "need": ["many people"], "wrong": ["much people", "a lot people", "many peoples"] },
    { "id": "there", "label": "existential “there are/were”", "reason": "grammar (there be)", "need": ["there are", "there were", "there aren't", "there weren't"], "wrong": ["it has", "have many", "has many"] },
    { "id": "neg", "label": "negation (not)", "reason": "negation", "need": ["not", "n't"] }
  ]
},
{
  "r": 21, "zh": "这是我姐姐的车。",
  "en": ["This is my sister's car.", "This is my older sister's car.", "This car is my sister's."],
  "points": [
    { "id": "poss", "label": "possessive (’s)", "reason": "possessive", "need": ["sister's"], "wrong": ["sister car", "car of my sister", "of my sister", "sisters car"] },
    { "id": "v-sister", "label": "the word “sister”", "reason": "vocabulary", "need": ["sister"] },
    { "id": "v-car", "label": "the word “car”", "reason": "vocabulary", "need": ["car"] }
  ]
},
{
  "r": 22, "zh": "他每周锻炼三次。",
  "en": ["He exercises three times a week.", "He works out three times a week.", "He exercises 3 times a week."],
  "points": [
    { "id": "agree", "label": "subject–verb agreement (he + verb-s)", "reason": "agreement", "need": ["exercises", "works out"], "wrong": ["exercise three", "exercising", "work out three"] },
    { "id": "freq", "label": "frequency phrase “three times a week”", "reason": "frequency phrase", "need": ["three times a week", "3 times a week", "three times per week"], "wrong": ["three time a week", "three times week"] },
    { "id": "v-ex", "label": "the word “exercise”", "reason": "vocabulary", "need": ["exercise", "work out", "workout"] }
  ]
},
{
  "r": 23, "zh": "你昨天为什么没来上班？",
  "en": ["Why didn't you come to work yesterday?", "Why did you not come to work yesterday?", "Why weren't you at work yesterday?"],
  "points": [
    { "id": "qform", "label": "question form (why + did/were)", "reason": "question form", "need": ["why did", "why were", "why was", "why weren't"], "wrong": ["why you did", "why you not", "you why"] },
    { "id": "negpast", "label": "past negative (didn't come)", "reason": "negation / tense", "need": ["didn't come", "did not come", "weren't", "were not"], "wrong": ["don't come", "didn't came", "no come"] },
    { "id": "t-yesterday", "label": "time word “yesterday”", "reason": "time word", "need": ["yesterday"] }
  ]
},
{
  "r": 24, "zh": "这是我读过的最好的书。",
  "en": ["This is the best book I have ever read.", "This is the best book I've ever read.", "This is the best book that I have read.", "It is the best book I've ever read."],
  "points": [
    { "id": "super", "label": "superlative (the best)", "reason": "superlative", "need": ["best book"], "wrong": ["better book", "goodest", "most good book", "more good book"] },
    { "id": "perfect", "label": "present perfect (have read)", "reason": "tense", "need": ["have ever read", "have read", "ever read"], "wrong": ["am reading", "will read", "read book"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 25, "zh": "老师让我们写一篇作文。",
  "en": ["The teacher made us write an essay.", "The teacher asked us to write an essay.", "The teacher had us write a composition.", "The teacher made us write a composition."],
  "points": [
    { "id": "caus", "label": "causative (make/have/ask sb do)", "reason": "causative", "need": ["made us write", "had us write", "asked us to write", "made us"], "wrong": ["made us to write", "let us to write", "make us write"] },
    { "id": "v-essay", "label": "the word “essay / composition”", "reason": "vocabulary", "need": ["essay", "composition"] },
    { "id": "v-teacher", "label": "the word “teacher”", "reason": "vocabulary", "need": ["teacher"] }
  ]
},
{
  "r": 26, "zh": "如果你早点告诉我，我就能帮你了。",
  "en": ["If you had told me earlier, I could have helped you.", "I could have helped you if you had told me earlier.", "If you'd told me earlier, I could have helped you.", "If you had told me sooner, I could have helped you."],
  "points": [
    { "id": "cond3", "label": "conditional (if + had + done)", "reason": "conditional", "need": ["had told", "had let me know"], "wrong": ["told me earlier", "if you tell", "if you would tell", "if you have told"] },
    { "id": "modalperf", "label": "modal perfect (could have + done)", "reason": "modal", "need": ["could have helped", "could have"], "wrong": ["could help", "can help", "would help you"] },
    { "id": "v-earlier", "label": "“earlier / sooner”", "reason": "vocabulary", "need": ["earlier", "sooner"] }
  ]
},
{
  "r": 27, "zh": "桌子上的那本书是谁的？",
  "en": ["Whose is the book on the table?", "Whose book is on the table?", "Who does the book on the table belong to?"],
  "points": [
    { "id": "whose", "label": "question word “whose”", "reason": "question form", "need": ["whose", "belong to"], "wrong": ["who's book", "who book", "who is book"] },
    { "id": "prep", "label": "preposition “on the table”", "reason": "preposition", "need": ["on the table"], "wrong": ["in the table", "at the table", "on table"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 28, "zh": "水在一百摄氏度时沸腾。",
  "en": ["Water boils at 100 degrees Celsius.", "Water boils at one hundred degrees Celsius.", "Water boils at a hundred degrees Celsius."],
  "points": [
    { "id": "present", "label": "present simple (general fact)", "reason": "tense", "need": ["water boils", "boils at"], "wrong": ["water boil", "is boiling", "boiled", "water boiling"] },
    { "id": "at", "label": "preposition “at … degrees”", "reason": "preposition", "need": ["at 100", "at one hundred", "at a hundred"], "wrong": ["in 100", "on 100", "at hundred degree"] },
    { "id": "v-water", "label": "the word “water”", "reason": "vocabulary", "need": ["water"] }
  ]
},
{
  "r": 29, "zh": "我妈妈说她很累。",
  "en": ["My mother said she was tired.", "My mom said she was tired.", "My mother said that she was tired.", "My mum said she was tired."],
  "points": [
    { "id": "reported", "label": "reported speech (backshift: said … was)", "reason": "reported speech", "need": ["said she was", "said that she was", "told me she was"], "wrong": ["said she is", "says she was", "said she tired", "say she was"] },
    { "id": "v-tired", "label": "the word “tired”", "reason": "vocabulary", "need": ["tired"] },
    { "id": "v-mother", "label": "the word “mother”", "reason": "vocabulary", "need": ["mother", "mom", "mum"] }
  ]
},
{
  "r": 30, "zh": "这些信息很有用。",
  "en": ["This information is very useful.", "This information is really useful.", "The information is very useful."],
  "points": [
    { "id": "uncount", "label": "uncountable noun (information is, no plural)", "reason": "uncountable noun", "need": ["information is"], "wrong": ["informations", "these information are", "information are", "an information", "these informations"] },
    { "id": "v-useful", "label": "the word “useful”", "reason": "vocabulary", "need": ["useful", "helpful"] }
  ]
}
];
