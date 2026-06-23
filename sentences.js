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
},
{
  "r": 31, "zh": "如果明天下雨，我们就待在家里。",
  "en": ["If it rains tomorrow, we will stay home.", "If it rains tomorrow, we'll stay home.", "We will stay home if it rains tomorrow.", "If it rains tomorrow, we will stay at home."],
  "points": [
    { "id": "cond1", "label": "first conditional (if + present)", "reason": "conditional", "need": ["if it rains"], "wrong": ["if it will rain", "if it rained", "if it rain "] },
    { "id": "will", "label": "future result (will + base)", "reason": "tense", "need": ["will stay", "'ll stay"], "wrong": ["stayed home", "would stay", "staying home"] },
    { "id": "v-home", "label": "the word “home”", "reason": "vocabulary", "need": ["home", "house"] }
  ]
},
{
  "r": 32, "zh": "你必须现在就走。",
  "en": ["You must leave now.", "You have to leave now.", "You must go now.", "You have to go now."],
  "points": [
    { "id": "must", "label": "modal “must / have to”", "reason": "modal", "need": ["must leave", "have to leave", "must go", "have to go", "must", "have to"], "wrong": ["should leave", "can leave", "must to leave", "have leave"] },
    { "id": "t-now", "label": "time word “now”", "reason": "time word", "need": ["now"] },
    { "id": "v-leave", "label": "the word “leave / go”", "reason": "vocabulary", "need": ["leave", "go"] }
  ]
},
{
  "r": 33, "zh": "你不能在这里抽烟。",
  "en": ["You can't smoke here.", "You cannot smoke here.", "You must not smoke here.", "You mustn't smoke here."],
  "points": [
    { "id": "prohib", "label": "modal “can't / mustn't”", "reason": "modal", "need": ["can't", "cannot", "must not", "mustn't"], "wrong": ["don't smoke", "do not smoke", "can not to smoke"] },
    { "id": "v-smoke", "label": "the word “smoke”", "reason": "vocabulary", "need": ["smoke"] },
    { "id": "here", "label": "the word “here”", "reason": "vocabulary", "need": ["here"] }
  ]
},
{
  "r": 34, "zh": "我以前住在上海。",
  "en": ["I used to live in Shanghai.", "I used to live in Shanghai before."],
  "points": [
    { "id": "usedto", "label": "past habit “used to”", "reason": "past habit (used to)", "need": ["used to live", "used to"], "wrong": ["use to live", "used to lived", "was living in", "used live"] },
    { "id": "prep", "label": "preposition “in Shanghai”", "reason": "preposition", "need": ["in shanghai"], "wrong": ["at shanghai", "on shanghai"] },
    { "id": "v-sh", "label": "the place “Shanghai”", "reason": "vocabulary", "need": ["shanghai"] }
  ]
},
{
  "r": 35, "zh": "我希望我会说法语。",
  "en": ["I wish I could speak French.", "I wish I spoke French.", "I wish I knew French."],
  "points": [
    { "id": "wish", "label": "subjunctive (wish + past / could)", "reason": "subjunctive (wish)", "need": ["wish i could speak", "wish i spoke", "wish i knew", "wish i could"], "wrong": ["wish i can speak", "wish i will speak", "hope i could speak", "wish i can"] },
    { "id": "v-french", "label": "the word “French”", "reason": "vocabulary", "need": ["french"] }
  ]
},
{
  "r": 36, "zh": "虽然天气很冷，但他还是去游泳了。",
  "en": ["Although it was cold, he still went swimming.", "Even though it was cold, he went swimming.", "He went swimming although it was cold.", "Although the weather was cold, he still went swimming."],
  "points": [
    { "id": "although", "label": "conjunction “although / even though”", "reason": "conjunction", "need": ["although", "even though"], "wrong": ["but although", "although but", "despite it was"] },
    { "id": "went", "label": "past tense “went swimming”", "reason": "tense", "need": ["went swimming", "went for a swim"], "wrong": ["go swimming", "goes swimming", "gone swimming"] },
    { "id": "v-cold", "label": "the word “cold”", "reason": "vocabulary", "need": ["cold"] }
  ]
},
{
  "r": 37, "zh": "因为他生病了，所以没来。",
  "en": ["Because he was sick, he didn't come.", "He didn't come because he was sick.", "He didn't come because he was ill.", "Because he was ill, he didn't come."],
  "points": [
    { "id": "because", "label": "conjunction “because”", "reason": "conjunction", "need": ["because"], "wrong": ["because of he", "so because", "cause of"] },
    { "id": "neg", "label": "past negative (didn't come)", "reason": "negation / tense", "need": ["didn't come", "did not come"], "wrong": ["don't come", "didn't came", "not come"] },
    { "id": "v-sick", "label": "the word “sick / ill”", "reason": "vocabulary", "need": ["sick", "ill"] }
  ]
},
{
  "r": 38, "zh": "这个箱子太重了，我搬不动。",
  "en": ["This box is too heavy for me to lift.", "The box is so heavy that I can't lift it.", "This box is too heavy to lift.", "The box is so heavy I can't move it."],
  "points": [
    { "id": "toostructure", "label": "structure “too … to / so … that”", "reason": "structure (too/so)", "need": ["too heavy", "so heavy that", "so heavy i"], "wrong": ["very heavy so", "heavy too", "too much heavy"] },
    { "id": "v-box", "label": "the word “box”", "reason": "vocabulary", "need": ["box"] },
    { "id": "v-lift", "label": "the word “lift / move”", "reason": "vocabulary", "need": ["lift", "move", "carry"] }
  ]
},
{
  "r": 39, "zh": "你喜欢咖啡，对吗？",
  "en": ["You like coffee, don't you?", "You like coffee, right?"],
  "points": [
    { "id": "tag", "label": "tag question (don't you?)", "reason": "tag question", "need": ["don't you", "right"], "wrong": ["do you", "isn't it", "aren't you", "didn't you"] },
    { "id": "v-coffee", "label": "the word “coffee”", "reason": "vocabulary", "need": ["coffee"] }
  ]
},
{
  "r": 40, "zh": "你妈妈会开车吗？",
  "en": ["Can your mother drive?", "Does your mother know how to drive?", "Can your mom drive?", "Can your mum drive?"],
  "points": [
    { "id": "qform", "label": "question form (Can/Does + subject)", "reason": "question form", "need": ["can your mother", "can your mom", "can your mum", "does your mother", "does your mom"], "wrong": ["your mother can", "your mom can drive", "mother can drive?"] },
    { "id": "ability", "label": "ability (can / know how to)", "reason": "modal", "need": ["can ", "know how to"], "wrong": ["could to drive", "can to drive"] },
    { "id": "v-drive", "label": "the word “drive”", "reason": "vocabulary", "need": ["drive", "driving"] }
  ]
},
{
  "r": 41, "zh": "请把这本书给我。",
  "en": ["Please give me this book.", "Please give this book to me.", "Give me this book, please.", "Please hand me this book."],
  "points": [
    { "id": "object", "label": "object order (give me / give … to me)", "reason": "object pronoun", "need": ["give me", "give this book to me", "hand me"], "wrong": ["give to me this", "give i", "give me to", "give for me"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] },
    { "id": "please", "label": "politeness “please”", "reason": "politeness", "need": ["please"] }
  ]
},
{
  "r": 42, "zh": "这个蛋糕是他自己做的。",
  "en": ["He made this cake himself.", "He himself made this cake.", "He made the cake himself."],
  "points": [
    { "id": "reflexive", "label": "reflexive pronoun (himself)", "reason": "reflexive pronoun", "need": ["himself"], "wrong": ["hisself", "by him self", "by his self", "his self"] },
    { "id": "made", "label": "past tense “made”", "reason": "tense", "need": ["made"], "wrong": ["make", "makes", "making", "maked"] },
    { "id": "v-cake", "label": "the word “cake”", "reason": "vocabulary", "need": ["cake"] }
  ]
},
{
  "r": 43, "zh": "我们八点在车站见面。",
  "en": ["We will meet at the station at eight.", "We'll meet at the station at eight o'clock.", "Let's meet at the station at 8.", "We will meet at eight at the station."],
  "points": [
    { "id": "at-time", "label": "preposition “at + time”", "reason": "preposition", "need": ["at eight", "at 8"], "wrong": ["on eight", "in eight", "at the eight"] },
    { "id": "at-place", "label": "preposition “at + place”", "reason": "preposition", "need": ["at the station"], "wrong": ["in the station", "on the station"] },
    { "id": "v-station", "label": "the word “station”", "reason": "vocabulary", "need": ["station"] }
  ]
},
{
  "r": 44, "zh": "猫跳到了桌子上。",
  "en": ["The cat jumped onto the table.", "The cat jumped on the table.", "The cat jumped up onto the table."],
  "points": [
    { "id": "onto", "label": "preposition of movement “onto / on”", "reason": "preposition", "need": ["onto the table", "on the table"], "wrong": ["into the table", "at the table", "to the table"] },
    { "id": "jumped", "label": "past tense “jumped”", "reason": "tense", "need": ["jumped"], "wrong": ["jump", "jumps", "jumping", "jumpped"] },
    { "id": "v-cat", "label": "the word “cat”", "reason": "vocabulary", "need": ["cat"] }
  ]
},
{
  "r": 45, "zh": "她唱歌唱得很好。",
  "en": ["She sings very well.", "She sings beautifully.", "She is a very good singer.", "She sings really well."],
  "points": [
    { "id": "adverb", "label": "adverb of manner (well, not “good”)", "reason": "adverb (well)", "need": ["very well", "beautifully", "really well", "good singer"], "wrong": ["sings very good", "sings good", "sing very good"] },
    { "id": "agree", "label": "agreement (she sings)", "reason": "agreement", "need": ["she sings", "she is a"], "wrong": ["she sing "] },
    { "id": "v-sing", "label": "the word “sing”", "reason": "vocabulary", "need": ["sing", "singer", "sings"] }
  ]
},
{
  "r": 46, "zh": "冰箱里只剩一点牛奶了。",
  "en": ["There is only a little milk left in the fridge.", "There is only a little milk in the fridge.", "There's only a little milk left in the refrigerator."],
  "points": [
    { "id": "little", "label": "quantifier “a little” (uncountable)", "reason": "quantifier", "need": ["a little milk", "little milk"], "wrong": ["a few milk", "a little milks", "few milk", "a little milks"] },
    { "id": "there-is", "label": "existential “there is”", "reason": "existential (there is)", "need": ["there is", "there's"], "wrong": ["there are", "it has", "have only"] },
    { "id": "v-fridge", "label": "the word “fridge”", "reason": "vocabulary", "need": ["fridge", "refrigerator"] }
  ]
},
{
  "r": 47, "zh": "今年的游客比去年少。",
  "en": ["There are fewer tourists this year than last year.", "There are fewer tourists this year than last.", "Fewer tourists came this year than last year."],
  "points": [
    { "id": "fewer", "label": "comparative “fewer” (countable)", "reason": "comparative", "need": ["fewer tourists"], "wrong": ["less tourists", "fewer tourist", "more fewer", "lesser tourists"] },
    { "id": "than", "label": "comparison “than last year”", "reason": "comparison", "need": ["than last year", "than last"], "wrong": ["then last year", "that last year", "as last year"] },
    { "id": "v-tourist", "label": "the word “tourist”", "reason": "vocabulary", "need": ["tourist", "visitor"] }
  ]
},
{
  "r": 48, "zh": "我还没吃晚饭呢。",
  "en": ["I haven't eaten dinner yet.", "I have not eaten dinner yet.", "I haven't had dinner yet.", "I still haven't eaten dinner."],
  "points": [
    { "id": "perfect-yet", "label": "present perfect (haven't … yet)", "reason": "tense", "need": ["haven't eaten", "have not eaten", "haven't had", "still haven't"], "wrong": ["didn't eat", "don't eat", "am not eating", "did not eat"] },
    { "id": "yet", "label": "adverb “yet / still”", "reason": "adverb (yet)", "need": ["yet", "still"], "wrong": ["already", "ever"] },
    { "id": "v-dinner", "label": "the word “dinner”", "reason": "vocabulary", "need": ["dinner"] }
  ]
},
{
  "r": 49, "zh": "这是一个很有趣的故事。",
  "en": ["This is an interesting story.", "This is a very interesting story.", "It is an interesting story."],
  "points": [
    { "id": "article", "label": "article “an” before a vowel sound", "reason": "article", "need": ["an interesting", "a very interesting"], "wrong": ["a interesting", "an very interesting", "the interesting story"] },
    { "id": "v-story", "label": "the word “story”", "reason": "vocabulary", "need": ["story"] },
    { "id": "v-int", "label": "the word “interesting”", "reason": "vocabulary", "need": ["interesting"] }
  ]
},
{
  "r": 50, "zh": "她有一只又大又白的狗。",
  "en": ["She has a big white dog.", "She has a large white dog."],
  "points": [
    { "id": "adjorder", "label": "adjective order (size before colour)", "reason": "adjective order", "need": ["big white dog", "large white dog"], "wrong": ["white big dog", "white large dog", "big and white dog"] },
    { "id": "agree", "label": "agreement (she has)", "reason": "agreement", "need": ["she has"], "wrong": ["she have"] },
    { "id": "v-dog", "label": "the word “dog”", "reason": "vocabulary", "need": ["dog"] }
  ]
},
{
  "r": 51, "zh": "我和我朋友一样高。",
  "en": ["I am as tall as my friend.", "I'm as tall as my friend.", "I am as tall as my friend is."],
  "points": [
    { "id": "asas", "label": "comparison of equality (as … as)", "reason": "comparison", "need": ["as tall as"], "wrong": ["as tall than", "so tall as", "tall as my", "as taller as"] },
    { "id": "v-tall", "label": "the word “tall”", "reason": "vocabulary", "need": ["tall"] },
    { "id": "v-friend", "label": "the word “friend”", "reason": "vocabulary", "need": ["friend"] }
  ]
},
{
  "r": 52, "zh": "这部电影比那部更有意思。",
  "en": ["This movie is more interesting than that one.", "This film is more interesting than that one.", "This movie is more interesting than that movie."],
  "points": [
    { "id": "comp", "label": "comparative (more … than)", "reason": "comparative", "need": ["more interesting than"], "wrong": ["interestinger", "more interesting then", "most interesting than", "interesting than"] },
    { "id": "v-movie", "label": "the word “movie / film”", "reason": "vocabulary", "need": ["movie", "film"] }
  ]
},
{
  "r": 53, "zh": "我下周要见我的医生。",
  "en": ["I am seeing my doctor next week.", "I'm seeing my doctor next week.", "I am going to see my doctor next week.", "I will see my doctor next week."],
  "points": [
    { "id": "future", "label": "future arrangement (am seeing / going to / will)", "reason": "tense", "need": ["am seeing", "going to see", "will see"], "wrong": ["saw my doctor", "am see", "seed my doctor", "see my doctor next"] },
    { "id": "t-next", "label": "time phrase “next week”", "reason": "time phrase", "need": ["next week"] },
    { "id": "v-doctor", "label": "the word “doctor”", "reason": "vocabulary", "need": ["doctor"] }
  ]
},
{
  "r": 54, "zh": "我明天可能会去。",
  "en": ["I might go tomorrow.", "I may go tomorrow.", "Maybe I will go tomorrow.", "I might come tomorrow."],
  "points": [
    { "id": "might", "label": "modal of possibility (might / may)", "reason": "modal", "need": ["might go", "may go", "might come", "maybe i will", "might", "may "], "wrong": ["can go tomorrow", "must go", "will definitely go"] },
    { "id": "t-tomorrow", "label": "time word “tomorrow”", "reason": "time word", "need": ["tomorrow"] }
  ]
},
{
  "r": 55, "zh": "你本应该早点告诉我。",
  "en": ["You should have told me earlier.", "You should have told me sooner.", "You ought to have told me earlier.", "You should've told me earlier."],
  "points": [
    { "id": "shouldhave", "label": "modal perfect (should have + done)", "reason": "modal", "need": ["should have told", "ought to have told", "should have", "should've told"], "wrong": ["should told", "should have tell", "should had told", "must have told"] },
    { "id": "v-earlier", "label": "“earlier / sooner”", "reason": "vocabulary", "need": ["earlier", "sooner"] }
  ]
},
{
  "r": 56, "zh": "这就是我出生的医院。",
  "en": ["This is the hospital where I was born.", "This is the hospital I was born in.", "This is the hospital that I was born in.", "This is the hospital in which I was born."],
  "points": [
    { "id": "rel", "label": "relative clause (where / in which)", "reason": "relative clause", "need": ["where i was born", "born in", "in which i was born"], "wrong": ["which i was born", "that i born", "where i born"] },
    { "id": "born", "label": "passive “was born”", "reason": "tense", "need": ["was born"], "wrong": ["born ", "is born", "were born", "am born"] },
    { "id": "v-hospital", "label": "the word “hospital”", "reason": "vocabulary", "need": ["hospital"] }
  ]
},
{
  "r": 57, "zh": "房子里所有的窗户都开着。",
  "en": ["All the windows in the house are open.", "All of the windows in the house are open.", "All the windows in the house were open."],
  "points": [
    { "id": "all", "label": "quantifier “all the”", "reason": "quantifier", "need": ["all the windows", "all of the windows"], "wrong": ["every windows", "all the window ", "all window"] },
    { "id": "plural", "label": "plural “windows”", "reason": "plural", "need": ["windows"], "wrong": ["all the window are", "window are open"] },
    { "id": "v-window", "label": "the word “window”", "reason": "vocabulary", "need": ["window"] }
  ]
},
{
  "r": 58, "zh": "别忘了关灯。",
  "en": ["Don't forget to turn off the lights.", "Don't forget to turn off the light.", "Remember to turn off the lights.", "Don't forget to switch off the lights."],
  "points": [
    { "id": "imperative", "label": "negative imperative (Don't …)", "reason": "imperative", "need": ["don't forget", "do not forget", "remember to"], "wrong": ["not forget", "you don't forget", "forget not"] },
    { "id": "phrasal", "label": "phrasal verb “turn off”", "reason": "phrasal verb", "need": ["turn off", "switch off", "shut off"], "wrong": ["turn out the light", "close the light", "open off"] },
    { "id": "v-light", "label": "the word “light”", "reason": "vocabulary", "need": ["light"] }
  ]
},
{
  "r": 59, "zh": "自从2010年，我就一直在学英语。",
  "en": ["I have been learning English since 2010.", "I have studied English since 2010.", "I've been learning English since 2010.", "I have been studying English since 2010."],
  "points": [
    { "id": "perfect", "label": "present perfect (continuous)", "reason": "tense", "need": ["have been learning", "have been studying", "have studied", "have learned"], "wrong": ["am learning english since", "learned english since", "study english since"] },
    { "id": "since", "label": "preposition “since 2010”", "reason": "preposition", "need": ["since 2010"], "wrong": ["for 2010", "from 2010"] },
    { "id": "v-english", "label": "the word “English”", "reason": "vocabulary", "need": ["english"] }
  ]
},
{
  "r": 60, "zh": "钥匙在桌子上还是在抽屉里？",
  "en": ["Are the keys on the table or in the drawer?", "Is the key on the table or in the drawer?"],
  "points": [
    { "id": "qform", "label": "question form (be + subject)", "reason": "question form", "need": ["are the keys", "is the key"], "wrong": ["the keys are", "the key is on", "where the keys"] },
    { "id": "prep", "label": "prepositions “on the table / in the drawer”", "reason": "preposition", "need": ["on the table", "in the drawer"], "wrong": ["in the table", "on the drawer", "at the drawer"] },
    { "id": "v-key", "label": "the word “key”", "reason": "vocabulary", "need": ["key"] }
  ]
},
{
  "r": 61, "zh": "他跑得比我快。",
  "en": ["He runs faster than me.", "He runs faster than I do.", "He runs more quickly than me."],
  "points": [
    { "id": "compadv", "label": "comparative adverb (faster than)", "reason": "comparative", "need": ["faster than", "more quickly than"], "wrong": ["more fast than", "faster then", "quicklier", "more faster"] },
    { "id": "agree", "label": "agreement (he runs)", "reason": "agreement", "need": ["he runs"], "wrong": ["he run "] },
    { "id": "v-run", "label": "the word “run”", "reason": "vocabulary", "need": ["run"] }
  ]
},
{
  "r": 62, "zh": "我没有足够的钱买那个。",
  "en": ["I don't have enough money to buy that.", "I do not have enough money to buy it.", "I haven't got enough money to buy that."],
  "points": [
    { "id": "enough", "label": "quantifier “enough” (before noun)", "reason": "quantifier", "need": ["enough money"], "wrong": ["money enough", "enough of money", "too much money to buy"] },
    { "id": "neg", "label": "negation (don't have / haven't got)", "reason": "negation", "need": ["don't have", "do not have", "haven't got"], "wrong": ["not have enough", "no have"] },
    { "id": "v-money", "label": "the word “money”", "reason": "vocabulary", "need": ["money"] }
  ]
},
{
  "r": 63, "zh": "那本书是我的，不是你的。",
  "en": ["That book is mine, not yours.", "That book is mine, not yours."],
  "points": [
    { "id": "possessive", "label": "possessive pronouns (mine / yours)", "reason": "possessive pronoun", "need": ["mine", "yours"], "wrong": ["is my book", "is your book", "mine's"] },
    { "id": "neg", "label": "negation (not)", "reason": "negation", "need": ["not"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 64, "zh": "我每天步行去上班。",
  "en": ["I walk to work every day.", "I go to work on foot every day.", "Every day I walk to work.", "I walk to work everyday."],
  "points": [
    { "id": "habit", "label": "present simple (daily habit)", "reason": "tense", "need": ["walk to work", "go to work", "i walk"], "wrong": ["walked to work", "am walking to work", "walking to work every"] },
    { "id": "prep", "label": "preposition “to work / on foot”", "reason": "preposition", "need": ["to work", "on foot"], "wrong": ["at work every", "into work"] },
    { "id": "t-everyday", "label": "“every day”", "reason": "time phrase", "need": ["every day", "everyday"] }
  ]
},
{
  "r": 65, "zh": "他们结婚十年了。",
  "en": ["They have been married for ten years.", "They have been married for 10 years.", "They got married ten years ago.", "They have been married for ten years now."],
  "points": [
    { "id": "perfect", "label": "present perfect / state duration", "reason": "tense", "need": ["have been married", "got married ten years ago", "got married 10 years ago"], "wrong": ["are married for", "were married for ten", "have married for"] },
    { "id": "forago", "label": "“for ten years” / “… ago”", "reason": "preposition", "need": ["for ten years", "for 10 years", "ten years ago", "10 years ago"], "wrong": ["since ten years", "before ten years"] },
    { "id": "v-married", "label": "the word “married”", "reason": "vocabulary", "need": ["married", "marry"] }
  ]
},
{
  "r": 66, "zh": "请安静一点。",
  "en": ["Please be quiet.", "Please be quieter.", "Could you be quiet, please?", "Be quiet, please."],
  "points": [
    { "id": "imperative", "label": "imperative / polite request (Be …)", "reason": "imperative", "need": ["be quiet", "be quieter", "could you be quiet"], "wrong": ["you are quiet", "you quiet", "are quiet please"] },
    { "id": "v-quiet", "label": "the word “quiet”", "reason": "vocabulary", "need": ["quiet"] }
  ]
},
{
  "r": 67, "zh": "昨晚我看电视的时候，电话响了。",
  "en": ["The phone rang while I was watching TV last night.", "While I was watching TV last night, the phone rang.", "The phone rang while I was watching television last night."],
  "points": [
    { "id": "pastcont", "label": "past continuous (was + -ing)", "reason": "tense", "need": ["was watching"], "wrong": ["watched tv when", "am watching", "was watch", "is watching"] },
    { "id": "pastsimple", "label": "past simple (interrupting action)", "reason": "tense", "need": ["phone rang", "rang"], "wrong": ["phone rings", "phone ringed", "was ringing"] },
    { "id": "while", "label": "conjunction “while”", "reason": "conjunction", "need": ["while"], "wrong": ["during i was"] }
  ]
},
{
  "r": 68, "zh": "这些苹果比那些便宜。",
  "en": ["These apples are cheaper than those.", "These apples are cheaper than those ones.", "These apples are cheaper than those apples."],
  "points": [
    { "id": "comp", "label": "comparative (-er than)", "reason": "comparative", "need": ["cheaper than"], "wrong": ["more cheap than", "cheaper then", "more cheaper"] },
    { "id": "demon", "label": "demonstratives (these / those)", "reason": "demonstrative", "need": ["these apples", "those"], "wrong": ["this apples", "that apples are", "these apple are"] },
    { "id": "v-apple", "label": "the word “apple”", "reason": "vocabulary", "need": ["apple"] }
  ]
},
{
  "r": 69, "zh": "我已经把作业做完了。",
  "en": ["I have finished my homework.", "I have done my homework.", "I've finished my homework.", "I have already finished my homework."],
  "points": [
    { "id": "perfect", "label": "present perfect (have + done)", "reason": "tense", "need": ["have finished", "have done", "have already finished"], "wrong": ["am finishing", "will finish", "finishing my homework"] },
    { "id": "uncount", "label": "the word “homework” (uncountable)", "reason": "vocabulary", "need": ["homework"], "wrong": ["homeworks", "a homework", "my homeworks"] }
  ]
},
{
  "r": 70, "zh": "他问我住在哪里。",
  "en": ["He asked me where I lived.", "He asked me where I live.", "He asked where I lived."],
  "points": [
    { "id": "reportedq", "label": "reported question (no inversion)", "reason": "reported speech", "need": ["asked me where i lived", "asked where i lived", "asked me where i live"], "wrong": ["asked me where did i live", "asked me where do i live", "asked me where was i"] },
    { "id": "v-live", "label": "the word “live”", "reason": "vocabulary", "need": ["live"] }
  ]
},
{
  "r": 71, "zh": "这是世界上最高的建筑。",
  "en": ["This is the tallest building in the world.", "It is the tallest building in the world.", "This is the highest building in the world."],
  "points": [
    { "id": "super", "label": "superlative (the -est)", "reason": "superlative", "need": ["tallest building", "highest building"], "wrong": ["taller building", "most tall building", "most tallest", "more tall building"] },
    { "id": "prep", "label": "preposition “in the world”", "reason": "preposition", "need": ["in the world"], "wrong": ["of the world", "on the world", "in world"] },
    { "id": "v-build", "label": "the word “building”", "reason": "vocabulary", "need": ["building"] }
  ]
},
{
  "r": 72, "zh": "如果我是你，我就不会那样做。",
  "en": ["If I were you, I wouldn't do that.", "If I were you, I would not do that.", "I wouldn't do that if I were you.", "If I was you, I wouldn't do that."],
  "points": [
    { "id": "cond2", "label": "second conditional (if I were)", "reason": "conditional", "need": ["if i were you", "if i was you"], "wrong": ["if i am you", "if i will be you", "if i would be you"] },
    { "id": "would", "label": "modal “would (not)”", "reason": "modal", "need": ["wouldn't do", "would not do", "wouldn't"], "wrong": ["will not do", "won't do", "don't do that"] }
  ]
},
{
  "r": 73, "zh": "牛奶在冰箱里。",
  "en": ["The milk is in the fridge.", "The milk is in the refrigerator.", "Milk is in the fridge."],
  "points": [
    { "id": "prep", "label": "preposition “in the fridge”", "reason": "preposition", "need": ["in the fridge", "in the refrigerator"], "wrong": ["on the fridge", "at the fridge", "into the fridge"] },
    { "id": "uncount", "label": "uncountable agreement (milk is)", "reason": "uncountable noun", "need": ["milk is"], "wrong": ["milks", "milk are", "a milk"] },
    { "id": "v-fridge", "label": "the word “fridge”", "reason": "vocabulary", "need": ["fridge", "refrigerator"] }
  ]
},
{
  "r": 74, "zh": "我们应该多锻炼。",
  "en": ["We should exercise more.", "We should do more exercise.", "We ought to exercise more.", "We should get more exercise."],
  "points": [
    { "id": "should", "label": "modal “should / ought to”", "reason": "modal", "need": ["should exercise", "ought to exercise", "should do more", "should get more", "should"], "wrong": ["must exercise", "should to exercise", "will exercise"] },
    { "id": "more", "label": "quantifier “more”", "reason": "quantifier", "need": ["more"], "wrong": ["mucher", "many exercise"] },
    { "id": "v-ex", "label": "the word “exercise”", "reason": "vocabulary", "need": ["exercise"] }
  ]
},
{
  "r": 75, "zh": "那个戴眼镜的男人是我老师。",
  "en": ["The man who is wearing glasses is my teacher.", "The man with glasses is my teacher.", "The man wearing glasses is my teacher.", "The man who wears glasses is my teacher."],
  "points": [
    { "id": "rel", "label": "relative clause (who / with)", "reason": "relative clause", "need": ["who is wearing glasses", "with glasses", "wearing glasses", "who wears glasses"], "wrong": ["which is wearing glasses", "who wear glasses", "that wearing glasses"] },
    { "id": "v-glasses", "label": "the word “glasses”", "reason": "vocabulary", "need": ["glasses"] },
    { "id": "v-teacher", "label": "the word “teacher”", "reason": "vocabulary", "need": ["teacher"] }
  ]
},
{
  "r": 76, "zh": "你去过日本吗？",
  "en": ["Have you ever been to Japan?", "Have you been to Japan?", "Have you ever gone to Japan?"],
  "points": [
    { "id": "perfect-exp", "label": "present perfect — experience (have been)", "reason": "tense", "need": ["have you ever been", "have you been", "have you ever gone"], "wrong": ["did you ever go", "do you ever go", "have you ever went", "are you been"] },
    { "id": "prep", "label": "preposition “been to”", "reason": "preposition", "need": ["to japan", "been to"], "wrong": ["in japan", "at japan"] },
    { "id": "v-japan", "label": "the place “Japan”", "reason": "vocabulary", "need": ["japan"] }
  ]
},
{
  "r": 77, "zh": "这本书值得一读。",
  "en": ["This book is worth reading.", "This book is worth a read.", "The book is worth reading."],
  "points": [
    { "id": "worth", "label": "verb form (worth + -ing)", "reason": "verb form", "need": ["worth reading", "worth a read"], "wrong": ["worth to read", "worth read", "worthy reading", "worth of reading"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] },
    { "id": "v-read", "label": "the word “read”", "reason": "vocabulary", "need": ["read", "reading"] }
  ]
},
{
  "r": 78, "zh": "天气越来越冷了。",
  "en": ["The weather is getting colder and colder.", "It is getting colder and colder.", "The weather is getting colder.", "It's getting colder and colder."],
  "points": [
    { "id": "comprepeat", "label": "comparative (colder and colder)", "reason": "comparative", "need": ["colder and colder", "getting colder"], "wrong": ["more and more cold", "colder colder", "more cold and more cold"] },
    { "id": "cont", "label": "continuous (is getting)", "reason": "tense", "need": ["is getting", "'s getting"], "wrong": ["gets colder", "got colder", "is get"] },
    { "id": "v-cold", "label": "the word “cold”", "reason": "vocabulary", "need": ["cold"] }
  ]
},
{
  "r": 79, "zh": "请把窗户关上。",
  "en": ["Please close the window.", "Please shut the window.", "Close the window, please.", "Please close the windows."],
  "points": [
    { "id": "imperative", "label": "imperative (Please + base verb)", "reason": "imperative", "need": ["please close", "please shut", "close the window", "shut the window"], "wrong": ["you close the window", "closing the window", "you should close"] },
    { "id": "v-window", "label": "the word “window”", "reason": "vocabulary", "need": ["window"] }
  ]
},
{
  "r": 80, "zh": "我宁愿待在家里。",
  "en": ["I would rather stay home.", "I'd rather stay at home.", "I would rather stay at home.", "I'd rather stay home."],
  "points": [
    { "id": "wouldrather", "label": "structure “would rather + base verb”", "reason": "structure (would rather)", "need": ["would rather stay", "rather stay"], "wrong": ["would rather to stay", "would rather staying", "prefer rather", "rather than stay"] },
    { "id": "v-home", "label": "the word “home”", "reason": "vocabulary", "need": ["home", "house"] }
  ]
},
{
  "r": 81, "zh": "他工作努力，所以成功了。",
  "en": ["He worked hard, so he succeeded.", "He worked hard, so he was successful.", "He worked hard and therefore succeeded.", "He worked hard, so he became successful."],
  "points": [
    { "id": "so", "label": "result connector (so / therefore)", "reason": "conjunction", "need": ["so he", "therefore"], "wrong": ["because he succeeded", "so that he"] },
    { "id": "adverb", "label": "adverb (hard, not “hardly”)", "reason": "adverb", "need": ["hard"], "wrong": ["hardly"] },
    { "id": "v-succeed", "label": "the word “succeed”", "reason": "vocabulary", "need": ["succeed", "succeeded", "succeeds", "successful", "success"] }
  ]
},
{
  "r": 82, "zh": "桌子上有一些书和两支笔。",
  "en": ["There are some books and two pens on the table.", "There are some books and 2 pens on the table."],
  "points": [
    { "id": "there", "label": "existential “there are”", "reason": "grammar (there are)", "need": ["there are"], "wrong": ["there is", "it has", "have some"] },
    { "id": "plural", "label": "plurals “books / pens”", "reason": "plural", "need": ["books", "pens"], "wrong": ["two pen", "some book and", "two pen on"] },
    { "id": "prep", "label": "preposition “on the table”", "reason": "preposition", "need": ["on the table"], "wrong": ["in the table", "at the table"] }
  ]
},
{
  "r": 83, "zh": "我不知道该说什么。",
  "en": ["I don't know what to say.", "I do not know what to say.", "I didn't know what to say.", "I have no idea what to say."],
  "points": [
    { "id": "clause", "label": "noun clause (what to + verb)", "reason": "noun clause", "need": ["what to say", "what i should say", "what i could say"], "wrong": ["what should i say", "what do i say", "what i say"] },
    { "id": "neg", "label": "negation (don't / didn't know)", "reason": "negation", "need": ["don't know", "do not know", "didn't know", "no idea"], "wrong": ["not know what", "no know"] },
    { "id": "v-say", "label": "the word “say”", "reason": "vocabulary", "need": ["say"] }
  ]
},
{
  "r": 84, "zh": "这件衬衫太贵了，我买不起。",
  "en": ["This shirt is too expensive for me to buy.", "This shirt is too expensive, I can't afford it.", "This shirt is so expensive that I can't afford it.", "I can't afford this shirt, it's too expensive."],
  "points": [
    { "id": "too", "label": "structure “too … to / so … that”", "reason": "structure (too/so)", "need": ["too expensive", "so expensive that"], "wrong": ["very expensive so", "expensive too", "too much expensive"] },
    { "id": "v-shirt", "label": "the word “shirt”", "reason": "vocabulary", "need": ["shirt"] },
    { "id": "v-afford", "label": "the word “afford / buy”", "reason": "vocabulary", "need": ["afford", "buy"] }
  ]
},
{
  "r": 85, "zh": "我从来没有见过这么大的狗。",
  "en": ["I have never seen such a big dog.", "I've never seen such a big dog.", "I have never seen so big a dog.", "I have never seen a dog this big."],
  "points": [
    { "id": "never", "label": "present perfect + never", "reason": "tense", "need": ["have never seen", "never seen"], "wrong": ["never saw", "didn't never see", "have never see", "never see such"] },
    { "id": "such", "label": "structure “such a + adj + noun”", "reason": "structure (such a …)", "need": ["such a big", "so big a", "this big", "that big"], "wrong": ["so big dog", "a such big", "such big dog"] },
    { "id": "v-dog", "label": "the word “dog”", "reason": "vocabulary", "need": ["dog"] }
  ]
},
{
  "r": 86, "zh": "房间需要打扫了。",
  "en": ["The room needs cleaning.", "The room needs to be cleaned.", "The room needs to be tidied.", "The room needs cleaning up."],
  "points": [
    { "id": "needform", "label": "verb form (need + -ing / to be done)", "reason": "verb form (needs …ing / to be done)", "need": ["needs cleaning", "needs to be cleaned", "needs to be tidied", "needs tidying"], "wrong": ["need cleaning", "needs clean", "needs be cleaned", "needs cleaned", "need to clean"] },
    { "id": "v-room", "label": "the word “room”", "reason": "vocabulary", "need": ["room"] },
    { "id": "v-clean", "label": "the word “clean / tidy”", "reason": "vocabulary", "need": ["clean", "cleaning", "cleaned", "tidy", "tidied", "tidying"] }
  ]
},
{
  "r": 87, "zh": "你越努力，就越成功。",
  "en": ["The harder you work, the more successful you are.", "The harder you work, the more successful you become.", "The more you work, the more successful you are.", "The harder you work, the more successful you will be."],
  "points": [
    { "id": "themore", "label": "structure “the …er …, the more …”", "reason": "structure (the more … the more)", "need": ["the harder you work", "the more you work"], "wrong": ["more harder you", "the more hard you work", "harder you work the"] },
    { "id": "compsucc", "label": "comparative “more successful”", "reason": "comparative (more + long adj)", "need": ["more successful"], "wrong": ["successfuler", "most successful", "more success you"] }
  ]
},
{
  "r": 88, "zh": "这部电影是根据真实故事改编的。",
  "en": ["This movie is based on a true story.", "The movie is based on a true story.", "This film is based on a real story.", "This movie was based on a true story."],
  "points": [
    { "id": "passive", "label": "passive / phrase “based on”", "reason": "passive (based on)", "need": ["is based on", "was based on", "based on"], "wrong": ["bases on", "based in", "is base on", "is basing on", "based of"] },
    { "id": "v-movie", "label": "the word “movie / film”", "reason": "vocabulary", "need": ["movie", "film"] },
    { "id": "v-story", "label": "the word “story”", "reason": "vocabulary", "need": ["story"] }
  ]
},
{
  "r": 89, "zh": "别担心，一切都会好起来的。",
  "en": ["Don't worry, everything will be fine.", "Don't worry, everything will be okay.", "Don't worry, everything will work out.", "Don't worry, it will all be fine."],
  "points": [
    { "id": "imperneg", "label": "negative imperative (Don't …)", "reason": "imperative (negative)", "need": ["don't worry", "do not worry"], "wrong": ["not worry", "you don't worry", "no worry"] },
    { "id": "future", "label": "future “will …”", "reason": "tense (future will)", "need": ["will be fine", "will be okay", "will work out", "will be alright", "will all be"], "wrong": ["everything is fine", "going be fine", "will fine", "would be fine"] }
  ]
},
{
  "r": 90, "zh": "我们到达时，电影已经开始了。",
  "en": ["When we arrived, the movie had already started.", "The movie had already started when we arrived.", "When we arrived, the film had already begun.", "By the time we arrived, the movie had started."],
  "points": [
    { "id": "pastperfect", "label": "past perfect (had + done)", "reason": "tense (past perfect)", "need": ["had already started", "had started", "had already begun", "had begun"], "wrong": ["has already started", "was already started", "had already start", "movie already started", "film already started"] },
    { "id": "pastsimple", "label": "past simple (arrived)", "reason": "tense (past simple)", "need": ["we arrived", "by the time we arrived"], "wrong": ["we arrive", "we have arrived", "we were arriving"] },
    { "id": "when", "label": "conjunction “when / by the time”", "reason": "conjunction (when)", "need": ["when we", "by the time"], "wrong": ["while we arrived"] }
  ]
},
{
  "r": 91, "zh": "这是我读过的最好的书。",
  "en": ["This is the best book I have ever read.", "This is the best book I've ever read.", "It is the best book I have ever read.", "This is the best book that I have ever read."],
  "points": [
    { "id": "super", "label": "superlative “the best”", "reason": "superlative (best)", "need": ["best book"], "wrong": ["better book", "goodest book", "most best book", "most good book"] },
    { "id": "perfectever", "label": "present perfect + ever", "reason": "tense (present perfect + ever)", "need": ["have ever read", "ever read", "i've ever read"], "wrong": ["ever readed", "did ever read", "have ever readed", "ever reading"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 92, "zh": "请你帮我个忙好吗？",
  "en": ["Could you do me a favor?", "Can you do me a favor?", "Could you do me a favour?", "Would you do me a favor?"],
  "points": [
    { "id": "modalreq", "label": "modal request (Could/Can you …)", "reason": "modal (could/can you)", "need": ["could you", "can you", "would you"], "wrong": ["do you can", "may you do", "you could do", "are you can"] },
    { "id": "favor", "label": "collocation “do … a favor”", "reason": "collocation (do a favor)", "need": ["a favor", "a favour", "me a favor"], "wrong": ["a help", "favour to me", "favor for help"] }
  ]
},
{
  "r": 93, "zh": "自从我搬到这里，我就一直很开心。",
  "en": ["I have been happy since I moved here.", "I've been happy since I moved here.", "Since I moved here, I have been happy.", "I have been very happy since I moved here."],
  "points": [
    { "id": "perfectsince", "label": "present perfect + since", "reason": "tense (present perfect + since)", "need": ["have been happy", "have been very happy", "i've been happy"], "wrong": ["am happy since", "was happy since", "have being happy", "have been happy for"] },
    { "id": "since", "label": "conjunction “since”", "reason": "conjunction (since)", "need": ["since i moved", "since"], "wrong": ["from i moved", "since i move", "for i moved"] },
    { "id": "v-happy", "label": "the word “happy”", "reason": "vocabulary", "need": ["happy"] }
  ]
},
{
  "r": 94, "zh": "据说他很富有。",
  "en": ["It is said that he is rich.", "He is said to be rich.", "It's said that he is very rich.", "People say that he is rich."],
  "points": [
    { "id": "reportpassive", "label": "passive reporting (It is said that …)", "reason": "passive (it is said that)", "need": ["it is said that", "he is said to be", "it's said that", "people say that", "is said to be"], "wrong": ["it is say that", "it said that he", "he is said be rich", "it is said he rich"] },
    { "id": "v-rich", "label": "the word “rich / wealthy”", "reason": "vocabulary", "need": ["rich", "wealthy"] }
  ]
},
{
  "r": 95, "zh": "我把钥匙忘在家里了。",
  "en": ["I left my keys at home.", "I forgot my keys at home.", "I left my key at home.", "I have left my keys at home."],
  "points": [
    { "id": "pastleave", "label": "irregular past (left / forgot)", "reason": "verb (left / forgot)", "need": ["left my key", "forgot my key", "have left my key"], "wrong": ["leaved my key", "leave my key", "forget my key at", "forgetted my key"] },
    { "id": "prep-at", "label": "preposition “at home”", "reason": "preposition (at home)", "need": ["at home"], "wrong": ["in home", "on home", "at the home"] },
    { "id": "v-key", "label": "the word “key”", "reason": "vocabulary", "need": ["key"] }
  ]
},
{
  "r": 96, "zh": "你最好现在就去睡觉。",
  "en": ["You had better go to bed now.", "You'd better go to bed now.", "You had better go to sleep now.", "You'd better go to bed right now."],
  "points": [
    { "id": "hadbetter", "label": "structure “had better + base verb”", "reason": "structure (had better)", "need": ["had better go", "'d better go", "better go to bed", "better go to sleep"], "wrong": ["had better to go", "would better go", "had better going", "better to go to bed"] },
    { "id": "v-bed", "label": "the word “bed / sleep”", "reason": "vocabulary", "need": ["bed", "sleep"] }
  ]
},
{
  "r": 97, "zh": "桌子是木头做的。",
  "en": ["The table is made of wood.", "The table is made out of wood.", "This table is made of wood."],
  "points": [
    { "id": "madeof", "label": "phrase “made of”", "reason": "phrase (made of)", "need": ["made of wood", "made out of wood"], "wrong": ["made from wood", "made by wood", "make of wood", "made in wood"] },
    { "id": "v-table", "label": "the word “table”", "reason": "vocabulary", "need": ["table"] },
    { "id": "v-wood", "label": "the word “wood”", "reason": "vocabulary", "need": ["wood"] }
  ]
},
{
  "r": 98, "zh": "我宁可走路也不愿意等公交车。",
  "en": ["I would rather walk than wait for the bus.", "I'd rather walk than wait for the bus.", "I would rather walk than wait for a bus.", "I'd rather walk than take the bus."],
  "points": [
    { "id": "ratherthan", "label": "structure “would rather … than”", "reason": "structure (would rather … than)", "need": ["would rather walk than", "rather walk than", "'d rather walk than"], "wrong": ["would rather walk then", "would rather to walk than", "prefer walk than", "rather walk that"] },
    { "id": "v-walk", "label": "the word “walk”", "reason": "vocabulary", "need": ["walk"] },
    { "id": "v-bus", "label": "the word “bus”", "reason": "vocabulary", "need": ["bus"] }
  ]
},
{
  "r": 99, "zh": "他装作什么都不知道。",
  "en": ["He pretended to know nothing.", "He pretended he knew nothing.", "He pretended not to know anything.", "He pretended that he knew nothing."],
  "points": [
    { "id": "pretend", "label": "verb form (pretend to + base verb)", "reason": "verb form (pretend to …)", "need": ["pretended to know", "pretended he knew", "pretended not to know", "pretended that he knew"], "wrong": ["pretended knowing", "pretend to know", "pretended to knew", "pretended to knowing"] },
    { "id": "neg", "label": "negation (nothing / not … anything)", "reason": "negation", "need": ["nothing", "not to know anything", "not know anything", "know anything"], "wrong": ["anything nothing", "not nothing", "didn't know nothing"] }
  ]
},
{
  "r": 100, "zh": "时间过得太快了。",
  "en": ["Time goes by so fast.", "Time flies so fast.", "Time passes so quickly.", "Time goes by so quickly."],
  "points": [
    { "id": "adverb", "label": "adverb (fast / quickly)", "reason": "adverb (fast / quickly)", "need": ["so fast", "so quickly", "very fast", "very quickly"], "wrong": ["so quick", "so fastly", "very quick", "so quickly fast"] },
    { "id": "v-time", "label": "the word “time”", "reason": "vocabulary", "need": ["time"] }
  ]
},
{
  "r": 101, "zh": "我不仅会说英语，还会说法语。",
  "en": ["I can speak not only English but also French.", "I can speak not only English, but also French.", "Not only can I speak English, but I can also speak French.", "I speak not only English but also French."],
  "points": [
    { "id": "notonly", "label": "structure “not only … but also”", "reason": "structure (not only … but also)", "need": ["not only english but also", "not only english, but also", "not only can i speak english"], "wrong": ["not only english but french", "only not english", "not only english also french"] },
    { "id": "v-english", "label": "the word “English”", "reason": "vocabulary", "need": ["english"] },
    { "id": "v-french", "label": "the word “French”", "reason": "vocabulary", "need": ["french"] }
  ]
},
{
  "r": 102, "zh": "如果明天下雨，我们就待在家里。",
  "en": ["If it rains tomorrow, we will stay home.", "If it rains tomorrow, we'll stay at home.", "We will stay home if it rains tomorrow.", "If it rains tomorrow, we will stay at home."],
  "points": [
    { "id": "cond1", "label": "first conditional (if + present)", "reason": "conditional (first: if + present)", "need": ["if it rains tomorrow", "if it rains"], "wrong": ["if it will rain", "if it rain tomorrow", "if it rained tomorrow", "if it raining"] },
    { "id": "willresult", "label": "future “will” in result clause", "reason": "tense (will in result clause)", "need": ["will stay", "'ll stay"], "wrong": ["would stay", "we stay home if", "we staying home"] },
    { "id": "v-rain", "label": "the word “rain”", "reason": "vocabulary", "need": ["rain"] }
  ]
}
];
