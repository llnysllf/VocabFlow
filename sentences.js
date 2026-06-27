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
},
{
  "r": 103, "zh": "他已经在这家公司工作十年了。",
  "en": ["He has worked at this company for ten years.", "He has been working at this company for ten years.", "He has worked for this company for 10 years.", "He has been working here for ten years."],
  "points": [
    { "id": "perfectfor", "label": "present perfect (have + worked)", "reason": "tense (present perfect)", "need": ["has worked", "has been working"], "wrong": ["has work", "is working at this company for", "have work at this", "has been work"] },
    { "id": "prep-for", "label": "preposition “for + duration”", "reason": "preposition (for + duration)", "need": ["for ten years", "for 10 years"], "wrong": ["since ten years", "for ten year", "during ten years"] },
    { "id": "v-company", "label": "the word “company”", "reason": "vocabulary", "need": ["company"] }
  ]
},
{
  "r": 104, "zh": "越早开始越好。",
  "en": ["The sooner you start, the better.", "The sooner the better.", "The sooner you begin, the better.", "The earlier you start, the better."],
  "points": [
    { "id": "soonerbetter", "label": "structure “the sooner … the better”", "reason": "structure (the sooner … the better)", "need": ["the sooner you start, the better", "the sooner the better", "the sooner you begin, the better", "the earlier you start, the better", "the sooner you start the better"], "wrong": ["sooner is better", "more soon the better", "the soonest", "the more soon"] }
  ]
},
{
  "r": 105, "zh": "我建议你早点睡。",
  "en": ["I suggest that you go to bed early.", "I suggest you go to bed early.", "I suggest going to bed early.", "I recommend that you go to bed early."],
  "points": [
    { "id": "suggest", "label": "verb form (suggest + that … / -ing)", "reason": "verb form (suggest + that / -ing)", "need": ["suggest that you go", "suggest you go", "suggest going", "recommend that you go", "recommend you go"], "wrong": ["suggest you to go", "suggest to go", "suggest that you to go", "suggest you going"] },
    { "id": "v-early", "label": "the word “early”", "reason": "vocabulary", "need": ["early"] }
  ]
},
{
  "r": 106, "zh": "那是我一生中最快乐的一天。",
  "en": ["That was the happiest day of my life.", "It was the happiest day of my life.", "That was the happiest day in my life."],
  "points": [
    { "id": "super", "label": "superlative “happiest”", "reason": "superlative (happiest)", "need": ["happiest day"], "wrong": ["most happy day", "happier day", "most happiest day"] },
    { "id": "prep", "label": "preposition “of my life”", "reason": "preposition (of my life)", "need": ["of my life", "in my life"], "wrong": ["of my live", "in my live", "on my life"] },
    { "id": "pastbe", "label": "past tense “was”", "reason": "tense (was)", "need": ["that was", "it was"], "wrong": ["that is the happiest", "it is the happiest"] }
  ]
},
{
  "r": 107, "zh": "你能告诉我邮局怎么走吗？",
  "en": ["Can you tell me how to get to the post office?", "Could you tell me how to get to the post office?", "Can you tell me the way to the post office?", "Do you know how to get to the post office?"],
  "points": [
    { "id": "indirectq", "label": "indirect question (how to get to)", "reason": "indirect question (how to get to …)", "need": ["how to get to", "the way to", "how i can get to", "how to get there"], "wrong": ["how do i get to", "how can i get to the post", "how get to"] },
    { "id": "modalreq", "label": "modal request (Can/Could you …)", "reason": "modal (can/could you)", "need": ["can you tell me", "could you tell me", "do you know"], "wrong": ["you can tell me", "tell me can you", "can tell me"] },
    { "id": "v-postoffice", "label": "the word “post office”", "reason": "vocabulary", "need": ["post office"] }
  ]
},
{
  "r": 108, "zh": "我习惯早起。",
  "en": ["I am used to getting up early.", "I'm used to getting up early.", "I am used to waking up early.", "I'm used to early mornings."],
  "points": [
    { "id": "usedto", "label": "verb form (be used to + -ing)", "reason": "verb form (be used to + -ing)", "need": ["used to getting", "used to waking", "used to early"], "wrong": ["used to get up", "use to getting", "used to got up", "am use to"] },
    { "id": "v-early", "label": "the word “early / morning”", "reason": "vocabulary", "need": ["early", "morning"] }
  ]
},
{
  "r": 109, "zh": "无论你做什么，我都会支持你。",
  "en": ["No matter what you do, I will support you.", "Whatever you do, I will support you.", "No matter what you do, I'll support you.", "I will support you no matter what you do."],
  "points": [
    { "id": "nomatter", "label": "structure “no matter what / whatever”", "reason": "structure (no matter what / whatever)", "need": ["no matter what you do", "whatever you do", "no matter what"], "wrong": ["no matter what do you", "whatever do you", "no matter you do"] },
    { "id": "future", "label": "future “will support”", "reason": "tense (future will)", "need": ["will support", "'ll support"], "wrong": ["would support", "support you no matter", "am supporting"] },
    { "id": "v-support", "label": "the word “support”", "reason": "vocabulary", "need": ["support"] }
  ]
},
{
  "r": 110, "zh": "他累得说不出话来。",
  "en": ["He was so tired that he couldn't speak.", "He was so tired he couldn't speak.", "He was too tired to speak.", "He was so exhausted that he couldn't talk."],
  "points": [
    { "id": "sothat", "label": "structure “so … that / too … to”", "reason": "structure (so … that / too … to)", "need": ["so tired that", "so tired he", "too tired to", "so exhausted that"], "wrong": ["so tired to speak", "too tired that", "very tired that he", "so tired for"] },
    { "id": "couldnt", "label": "modal “couldn't + base verb”", "reason": "modal (couldn't + base)", "need": ["couldn't speak", "couldn't talk", "to speak", "to talk"], "wrong": ["can't speak", "couldn't to speak", "couldn't spoke"] },
    { "id": "v-tired", "label": "the word “tired”", "reason": "vocabulary", "need": ["tired", "exhausted"] }
  ]
},
{
  "r": 111, "zh": "请把音量调小一点。",
  "en": ["Please turn down the volume.", "Please turn the volume down.", "Could you turn down the music?", "Please lower the volume."],
  "points": [
    { "id": "phrasal", "label": "phrasal verb “turn down”", "reason": "phrasal verb (turn down)", "need": ["turn down the volume", "turn the volume down", "turn down the music", "lower the volume", "turn it down"], "wrong": ["turn off the volume", "close the volume", "turn small the volume", "open the volume"] },
    { "id": "v-volume", "label": "the word “volume”", "reason": "vocabulary", "need": ["volume", "music", "sound"] }
  ]
},
{
  "r": 112, "zh": "自从那以后我再也没见过他。",
  "en": ["I have never seen him since then.", "I haven't seen him since then.", "I have never seen him again since then.", "I've never seen him since."],
  "points": [
    { "id": "perfectneg", "label": "present perfect negative", "reason": "tense (present perfect negative)", "need": ["have never seen him", "haven't seen him", "have not seen him"], "wrong": ["never saw him", "didn't see him since", "have never see him"] },
    { "id": "since", "label": "preposition “since then”", "reason": "preposition (since then)", "need": ["since then", "since"], "wrong": ["from then", "since that time ago"] }
  ]
},
{
  "r": 113, "zh": "据天气预报说明天会下雪。",
  "en": ["According to the weather forecast, it will snow tomorrow.", "According to the forecast, it's going to snow tomorrow.", "The weather forecast says it will snow tomorrow.", "According to the weather report, it will snow tomorrow."],
  "points": [
    { "id": "accordingto", "label": "phrase “according to”", "reason": "phrase (according to)", "need": ["according to the", "forecast says", "report says"], "wrong": ["according the", "according with", "accord to the"] },
    { "id": "future", "label": "future (will / going to)", "reason": "tense (future)", "need": ["will snow", "going to snow"], "wrong": ["snows tomorrow", "would snow", "will snows"] },
    { "id": "v-snow", "label": "the word “snow”", "reason": "vocabulary", "need": ["snow"] }
  ]
},
{
  "r": 114, "zh": "我刚吃完午饭。",
  "en": ["I have just finished lunch.", "I've just had lunch.", "I just finished lunch.", "I have just eaten lunch."],
  "points": [
    { "id": "justperfect", "label": "present perfect + just", "reason": "tense (present perfect + just)", "need": ["have just finished", "have just had", "'ve just", "just finished", "just had lunch", "have just eaten"], "wrong": ["have just finish", "am just finishing", "will just finish"] },
    { "id": "v-lunch", "label": "the word “lunch”", "reason": "vocabulary", "need": ["lunch"] }
  ]
},
{
  "r": 115, "zh": "他对数学很在行。",
  "en": ["He is good at math.", "He is good at mathematics.", "He is good at maths.", "He's good at math."],
  "points": [
    { "id": "goodat", "label": "collocation “good at”", "reason": "collocation (good at)", "need": ["good at math", "good at maths", "good at mathematics"], "wrong": ["good in math", "good on math", "good to math"] },
    { "id": "v-math", "label": "the word “math”", "reason": "vocabulary", "need": ["math", "maths", "mathematics"] }
  ]
},
{
  "r": 116, "zh": "你应该为自己感到骄傲。",
  "en": ["You should be proud of yourself.", "You ought to be proud of yourself.", "You should feel proud of yourself."],
  "points": [
    { "id": "should", "label": "modal “should + be”", "reason": "modal (should + be)", "need": ["should be proud", "ought to be proud", "should feel proud"], "wrong": ["should proud", "should to be proud", "must proud"] },
    { "id": "reflexive", "label": "reflexive pronoun “yourself”", "reason": "reflexive pronoun (yourself)", "need": ["of yourself", "yourself"], "wrong": ["of you", "of yourselves", "proud of you"] },
    { "id": "v-proud", "label": "the word “proud”", "reason": "vocabulary", "need": ["proud"] }
  ]
},
{
  "r": 117, "zh": "这么晚了，他不可能还在工作。",
  "en": ["He can't still be working this late.", "He can't be working so late.", "It's impossible that he is still working this late.", "He couldn't still be working this late."],
  "points": [
    { "id": "modalcertainty", "label": "modal of certainty (can't = impossible)", "reason": "modal (can't = certainty)", "need": ["can't still be working", "can't be working", "couldn't still be working", "impossible that he"], "wrong": ["can't still working", "mustn't be working", "can't be work", "doesn't can be working"] },
    { "id": "v-late", "label": "the word “late”", "reason": "vocabulary", "need": ["late"] }
  ]
},
{
  "r": 118, "zh": "这家餐厅以海鲜闻名。",
  "en": ["This restaurant is famous for its seafood.", "This restaurant is known for its seafood.", "The restaurant is famous for its seafood.", "This restaurant is well known for its seafood."],
  "points": [
    { "id": "famousfor", "label": "collocation “famous / known for”", "reason": "collocation (famous/known for)", "need": ["famous for", "known for"], "wrong": ["famous of", "famous as", "known as its seafood", "famous with", "famous by"] },
    { "id": "possessive", "label": "possessive “its”", "reason": "possessive (its)", "need": ["its seafood", "their seafood"], "wrong": ["it's seafood", "his seafood", "its' seafood"] },
    { "id": "v-restaurant", "label": "the word “restaurant”", "reason": "vocabulary", "need": ["restaurant"] }
  ]
},
{
  "r": 119, "zh": "越来越多的人在家工作。",
  "en": ["More and more people work from home.", "More and more people are working from home.", "An increasing number of people work from home.", "More and more people work at home."],
  "points": [
    { "id": "moreandmore", "label": "structure “more and more”", "reason": "structure (more and more)", "need": ["more and more people", "an increasing number of people", "increasingly more people"], "wrong": ["more more people", "much more people", "many and many people"] },
    { "id": "prep", "label": "preposition “from / at home”", "reason": "preposition (from/at home)", "need": ["from home", "at home"], "wrong": ["in home", "on home", "from the home"] },
    { "id": "v-work", "label": "the word “work”", "reason": "vocabulary", "need": ["work"] }
  ]
},
{
  "r": 120, "zh": "我把这本书推荐给所有学生。",
  "en": ["I recommend this book to all students.", "I recommend this book to every student.", "I would recommend this book to all students.", "I'd recommend this book to all students."],
  "points": [
    { "id": "recommendto", "label": "verb pattern (recommend sth to sb)", "reason": "verb pattern (recommend sth to sb)", "need": ["recommend this book to", "recommend it to", "would recommend this book to"], "wrong": ["recommend all students this book", "recommend to all students this book", "recommend you this book", "recommend this book all students"] },
    { "id": "quantifier", "label": "quantifier “all + plural”", "reason": "quantifier (all + plural)", "need": ["all students", "every student", "all of the students"], "wrong": ["all student", "every students", "all the student"] },
    { "id": "v-student", "label": "the word “student”", "reason": "vocabulary", "need": ["student"] }
  ]
},
{
  "r": 121, "zh": "游泳是很好的锻炼。",
  "en": ["Swimming is good exercise.", "Swimming is a good exercise.", "Swimming is great exercise."],
  "points": [
    { "id": "gerundsubj", "label": "gerund as subject (Swimming is …)", "reason": "gerund as subject", "need": ["swimming is"], "wrong": ["swim is", "to swim is", "swimming are", "swimming it is"] },
    { "id": "v-exercise", "label": "the word “exercise”", "reason": "vocabulary", "need": ["exercise"] }
  ]
},
{
  "r": 122, "zh": "他个子高得能够到天花板。",
  "en": ["He is tall enough to reach the ceiling.", "He's tall enough to reach the ceiling.", "He is tall enough to touch the ceiling."],
  "points": [
    { "id": "enoughto", "label": "structure “adj + enough to”", "reason": "structure (adj + enough to)", "need": ["tall enough to"], "wrong": ["enough tall to", "tall enough for reach", "tall enough that he reach", "enough tall that"] },
    { "id": "v-ceiling", "label": "the word “ceiling”", "reason": "vocabulary", "need": ["ceiling"] },
    { "id": "v-reach", "label": "the word “reach / touch”", "reason": "vocabulary", "need": ["reach", "touch"] }
  ]
},
{
  "r": 123, "zh": "我真希望我会弹钢琴。",
  "en": ["I wish I could play the piano.", "I wish I knew how to play the piano.", "I wish that I could play the piano.", "I wish I could play piano."],
  "points": [
    { "id": "wish", "label": "subjunctive “wish + past”", "reason": "subjunctive (wish + past)", "need": ["wish i could play", "wish i knew", "wish that i could"], "wrong": ["wish i can play", "wish i will play", "hope i could play", "wish i could to play", "wish i play"] },
    { "id": "v-piano", "label": "the word “piano”", "reason": "vocabulary", "need": ["piano"] }
  ]
},
{
  "r": 124, "zh": "她一定把钥匙落在办公室了。",
  "en": ["She must have left her keys at the office.", "She must have left her keys in the office.", "She must have forgotten her keys at the office."],
  "points": [
    { "id": "musthave", "label": "modal perfect (must have + p.p.)", "reason": "modal perfect (must have + p.p.)", "need": ["must have left", "must have forgotten"], "wrong": ["must left", "must have leave", "must has left", "must of left", "should have left"] },
    { "id": "prep", "label": "preposition “at/in the office”", "reason": "preposition (at/in the office)", "need": ["at the office", "in the office"], "wrong": ["on the office", "at office"] },
    { "id": "v-key", "label": "the word “key”", "reason": "vocabulary", "need": ["key"] }
  ]
},
{
  "r": 125, "zh": "我们小时候常常去那条河里游泳。",
  "en": ["We used to swim in that river when we were kids.", "We used to swim in that river when we were children.", "When we were kids, we used to swim in that river."],
  "points": [
    { "id": "usedtopast", "label": "past habit (used to + base verb)", "reason": "past habit (used to + base verb)", "need": ["used to swim"], "wrong": ["use to swim", "used to swimming", "were used to swim", "used swim"] },
    { "id": "pastwere", "label": "past tense “were”", "reason": "tense (were)", "need": ["we were kids", "we were children", "we were young"], "wrong": ["we are kids", "we was kids", "when we kids"] },
    { "id": "v-river", "label": "the word “river”", "reason": "vocabulary", "need": ["river"] }
  ]
},
{
  "r": 126, "zh": "这座桥是工人们去年建造的。",
  "en": ["This bridge was built by the workers last year.", "The bridge was built by the workers last year.", "This bridge was constructed by the workers last year."],
  "points": [
    { "id": "passiveby", "label": "passive (was + p.p. + by)", "reason": "passive (was + p.p. + by)", "need": ["was built by", "was constructed by"], "wrong": ["was build by", "is built by", "was builded by", "was built from"] },
    { "id": "pasttime", "label": "time expression “last year”", "reason": "time expression (last year)", "need": ["last year"], "wrong": ["the last year", "in last year", "past year ago"] },
    { "id": "v-bridge", "label": "the word “bridge”", "reason": "vocabulary", "need": ["bridge"] }
  ]
},
{
  "r": 127, "zh": "不是约翰就是玛丽拿了我的书。",
  "en": ["Either John or Mary took my book.", "Either John or Mary has my book.", "It was either John or Mary who took my book."],
  "points": [
    { "id": "eitheror", "label": "structure “either … or”", "reason": "structure (either … or)", "need": ["either john or mary", "either john or"], "wrong": ["either john nor mary", "neither john or mary", "john either or mary", "either or john"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 128, "zh": "他既不抽烟也不喝酒。",
  "en": ["He neither smokes nor drinks.", "He doesn't smoke or drink.", "He neither smokes nor drinks alcohol."],
  "points": [
    { "id": "neithernor", "label": "structure “neither … nor”", "reason": "structure (neither … nor)", "need": ["neither smokes nor", "doesn't smoke or drink", "does not smoke or drink"], "wrong": ["neither smokes or drinks", "either smokes nor", "nor smokes nor drinks"] },
    { "id": "v-smoke", "label": "the word “smoke”", "reason": "vocabulary", "need": ["smoke"] },
    { "id": "v-drink", "label": "the word “drink”", "reason": "vocabulary", "need": ["drink"] }
  ]
},
{
  "r": 129, "zh": "他的车和我的一样贵。",
  "en": ["His car is as expensive as mine.", "His car is as expensive as my car.", "His car costs as much as mine."],
  "points": [
    { "id": "asas", "label": "structure “as … as”", "reason": "structure (as … as)", "need": ["as expensive as", "as much as"], "wrong": ["as expensive than", "so expensive as", "as expensive like", "more expensive as"] },
    { "id": "possessive", "label": "possessive pronoun “mine”", "reason": "possessive pronoun (mine)", "need": ["as mine", "as my car"], "wrong": ["as my", "as me", "as i"] },
    { "id": "v-car", "label": "the word “car”", "reason": "vocabulary", "need": ["car"] }
  ]
},
{
  "r": 130, "zh": "直到午夜他才回家。",
  "en": ["He didn't come home until midnight.", "He did not get home until midnight.", "It was not until midnight that he came home.", "He didn't come home till midnight."],
  "points": [
    { "id": "notuntil", "label": "structure “not … until”", "reason": "structure (not … until)", "need": ["didn't come home until", "did not get home until", "not until midnight that", "didn't come home till", "didn't get home until"], "wrong": ["didn't come home before midnight", "came home until midnight", "didn't came home until"] },
    { "id": "v-midnight", "label": "the word “midnight”", "reason": "vocabulary", "need": ["midnight"] }
  ]
},
{
  "r": 131, "zh": "我昨天理发了。",
  "en": ["I had my hair cut yesterday.", "I got my hair cut yesterday.", "I had my hair done yesterday.", "I got a haircut yesterday."],
  "points": [
    { "id": "causative", "label": "causative (have/get sth done)", "reason": "causative (have/get sth done)", "need": ["had my hair cut", "got my hair cut", "had my hair done", "got a haircut"], "wrong": ["cut my hair yesterday", "had cut my hair", "had my hair cutted", "have my hair cut yesterday", "did my hair cut"] },
    { "id": "v-hair", "label": "the word “hair”", "reason": "vocabulary", "need": ["hair"] }
  ]
},
{
  "r": 132, "zh": "老师让我们写一篇作文。",
  "en": ["The teacher made us write an essay.", "The teacher made us write a composition.", "Our teacher made us write an essay."],
  "points": [
    { "id": "makesodo", "label": "verb form (make sb + base verb)", "reason": "verb form (make sb + base verb)", "need": ["made us write"], "wrong": ["made us to write", "made us writing", "make us write", "made us wrote", "let us to write"] },
    { "id": "v-essay", "label": "the word “essay”", "reason": "vocabulary", "need": ["essay", "composition"] }
  ]
},
{
  "r": 133, "zh": "学好一门语言需要时间。",
  "en": ["It takes time to learn a language well.", "It takes time to master a language.", "Learning a language well takes time.", "It takes time to learn a language."],
  "points": [
    { "id": "ittakes", "label": "structure “it takes time to do”", "reason": "structure (it takes time to do)", "need": ["it takes time to", "takes time to learn", "takes time to master", "learning a language well takes time"], "wrong": ["it takes time learning", "it spends time to learn", "it needs time to learning", "it costs time to learn"] },
    { "id": "v-language", "label": "the word “language”", "reason": "vocabulary", "need": ["language"] }
  ]
},
{
  "r": 134, "zh": "我盼望着收到你的来信。",
  "en": ["I am looking forward to hearing from you.", "I'm looking forward to hearing from you.", "I look forward to hearing from you.", "I'm looking forward to your reply."],
  "points": [
    { "id": "lookforward", "label": "verb form (look forward to + -ing)", "reason": "verb form (look forward to + -ing)", "need": ["looking forward to hearing", "look forward to hearing", "forward to your reply", "looking forward to your"], "wrong": ["looking forward to hear", "look forward to hear", "looking forward hearing", "forward to hear from"] },
    { "id": "hearfrom", "label": "collocation “hear from you”", "reason": "collocation (hear from you)", "need": ["hearing from you", "from you", "your reply"], "wrong": ["hear of you", "listen from you"] }
  ]
},
{
  "r": 135, "zh": "我比起咖啡更喜欢茶。",
  "en": ["I prefer tea to coffee.", "I prefer tea over coffee.", "I like tea more than coffee."],
  "points": [
    { "id": "preferto", "label": "structure “prefer A to B”", "reason": "structure (prefer A to B)", "need": ["prefer tea to coffee", "prefer tea over coffee", "like tea more than coffee", "tea more than coffee"], "wrong": ["prefer tea than coffee", "prefer tea from coffee", "more prefer tea than", "prefer tea coffee"] },
    { "id": "v-tea", "label": "the word “tea”", "reason": "vocabulary", "need": ["tea"] },
    { "id": "v-coffee", "label": "the word “coffee”", "reason": "vocabulary", "need": ["coffee"] }
  ]
},
{
  "r": 136, "zh": "记得出门时锁门。",
  "en": ["Remember to lock the door when you leave.", "Remember to lock the door when you go out.", "Don't forget to lock the door when you leave."],
  "points": [
    { "id": "remembertodo", "label": "verb form (remember to + base verb)", "reason": "verb form (remember to + base verb)", "need": ["remember to lock", "don't forget to lock", "forget to lock the door"], "wrong": ["remember locking the door", "remember lock the door", "remember that lock", "remembering to lock"] },
    { "id": "when", "label": "conjunction “when + present”", "reason": "conjunction (when + present)", "need": ["when you leave", "when you go out"], "wrong": ["when you will leave", "when do you leave", "while you leave"] },
    { "id": "v-door", "label": "the word “door”", "reason": "vocabulary", "need": ["door"] }
  ]
},
{
  "r": 137, "zh": "你认识那个姐姐是医生的男孩吗？",
  "en": ["Do you know the boy whose sister is a doctor?", "Do you know the boy whose older sister is a doctor?", "Do you know that boy whose sister is a doctor?"],
  "points": [
    { "id": "whose", "label": "relative clause “whose”", "reason": "relative clause (whose)", "need": ["whose sister is", "whose older sister"], "wrong": ["boy who sister", "boy that sister", "boy his sister is", "boy which sister"] },
    { "id": "v-doctor", "label": "the word “doctor”", "reason": "vocabulary", "need": ["doctor"] },
    { "id": "v-sister", "label": "the word “sister”", "reason": "vocabulary", "need": ["sister"] }
  ]
},
{
  "r": 138, "zh": "今天天气很好，是吧？",
  "en": ["The weather is nice today, isn't it?", "It's a nice day today, isn't it?", "The weather is lovely today, isn't it?", "Nice weather today, isn't it?"],
  "points": [
    { "id": "tag", "label": "question tag “isn't it”", "reason": "question tag (isn't it)", "need": ["isn't it", "is it not"], "wrong": ["isn't they", "doesn't it", "is it", "aren't it"] },
    { "id": "v-weather", "label": "the word “weather”", "reason": "vocabulary", "need": ["weather", "day"] }
  ]
},
{
  "r": 139, "zh": "尽管下着雨，他们还是踢了足球。",
  "en": ["Although it was raining, they still played football.", "Even though it was raining, they played football.", "Despite the rain, they played football.", "Although it was raining, they played soccer."],
  "points": [
    { "id": "although", "label": "conjunction “although / despite”", "reason": "conjunction (although / despite)", "need": ["although it was raining", "even though it was raining", "despite the rain", "in spite of the rain"], "wrong": ["despite it was raining", "despite of the rain", "although raining", "inspite of rain"] },
    { "id": "pastcont", "label": "past continuous “was raining”", "reason": "tense (was raining)", "need": ["was raining", "it rained"], "wrong": ["is raining", "was rain", "were raining"] },
    { "id": "v-football", "label": "the word “football / soccer”", "reason": "vocabulary", "need": ["football", "soccer"] }
  ]
},
{
  "r": 140, "zh": "你介意我开窗户吗？",
  "en": ["Would you mind if I open the window?", "Would you mind if I opened the window?", "Do you mind if I open the window?", "Would you mind my opening the window?"],
  "points": [
    { "id": "wouldmind", "label": "verb form (would you mind + if / -ing)", "reason": "verb form (would you mind + if/-ing)", "need": ["would you mind if i open", "would you mind if i opened", "do you mind if i open", "would you mind my opening", "mind if i open"], "wrong": ["would you mind to open", "would you mind if i opening", "do you mind to open", "would you mind that i open"] },
    { "id": "v-window", "label": "the word “window”", "reason": "vocabulary", "need": ["window"] }
  ]
},
{
  "r": 141, "zh": "我们一到那儿就给你打电话。",
  "en": ["We will call you as soon as we get there.", "We'll call you as soon as we arrive.", "As soon as we get there, we will call you.", "We will call you as soon as we arrive there."],
  "points": [
    { "id": "assoonas", "label": "conjunction “as soon as + present”", "reason": "conjunction (as soon as + present)", "need": ["as soon as we get there", "as soon as we arrive", "as soon as we get"], "wrong": ["as soon as we will get", "as soon as we will arrive", "as soon when we get", "as soon as we got there"] },
    { "id": "future", "label": "future “will call”", "reason": "tense (future will)", "need": ["will call you", "'ll call you"], "wrong": ["would call you", "are calling you", "call you as soon"] }
  ]
},
{
  "r": 142, "zh": "只要你努力，就会成功。",
  "en": ["As long as you work hard, you will succeed.", "As long as you try hard, you will succeed.", "You will succeed as long as you work hard.", "So long as you work hard, you will succeed."],
  "points": [
    { "id": "aslongas", "label": "conjunction “as long as”", "reason": "conjunction (as long as)", "need": ["as long as you work", "as long as you try", "so long as you work"], "wrong": ["as long you work", "so long you work", "as long as you will work", "as long as you worked"] },
    { "id": "future", "label": "future “will succeed”", "reason": "tense (future will)", "need": ["will succeed", "'ll succeed"], "wrong": ["would succeed", "are succeeding", "succeed as long"] },
    { "id": "v-succeed", "label": "the word “succeed”", "reason": "vocabulary", "need": ["succeed", "succeeded", "successful", "success"] }
  ]
},
{
  "r": 143, "zh": "他努力学习以便通过考试。",
  "en": ["He studied hard in order to pass the exam.", "He studied hard so as to pass the exam.", "He studied hard to pass the exam.", "He studied hard in order to pass the test."],
  "points": [
    { "id": "purpose", "label": "structure “in order to / to + base”", "reason": "structure (in order to / to + base)", "need": ["in order to pass", "so as to pass", "hard to pass"], "wrong": ["in order to passing", "for pass the exam", "so as pass the", "in order pass the", "for passing the exam"] },
    { "id": "v-exam", "label": "the word “exam / test”", "reason": "vocabulary", "need": ["exam", "test"] }
  ]
},
{
  "r": 144, "zh": "如果我早知道，我就会帮你了。",
  "en": ["If I had known, I would have helped you.", "If I had known earlier, I would have helped you.", "I would have helped you if I had known.", "Had I known, I would have helped you."],
  "points": [
    { "id": "cond3if", "label": "third conditional (if + had + p.p.)", "reason": "conditional (third: if + had + p.p.)", "need": ["if i had known", "had i known"], "wrong": ["if i had know", "if i knew", "if i would have known", "if i have known"] },
    { "id": "cond3result", "label": "result clause (would have + p.p.)", "reason": "conditional (would have + p.p.)", "need": ["would have helped", "would've helped"], "wrong": ["would helped", "would have help", "will have helped", "would had helped"] },
    { "id": "v-help", "label": "the word “help”", "reason": "vocabulary", "need": ["help", "helped", "helping", "helps"] }
  ]
},
{
  "r": 145, "zh": "你应该早点告诉我的。",
  "en": ["You should have told me earlier.", "You should have told me sooner.", "You ought to have told me earlier."],
  "points": [
    { "id": "shouldhave", "label": "modal perfect (should have + p.p.)", "reason": "modal perfect (should have + p.p.)", "need": ["should have told", "ought to have told", "should've told"], "wrong": ["should told me", "should have tell", "should have telled", "should has told", "should of told"] },
    { "id": "comptime", "label": "comparative “earlier / sooner”", "reason": "comparative (earlier/sooner)", "need": ["earlier", "sooner"], "wrong": ["more early", "more sooner", "early"] }
  ]
},
{
  "r": 146, "zh": "这是我第一次吃寿司。",
  "en": ["This is the first time I have eaten sushi.", "This is the first time I've eaten sushi.", "It's the first time I have had sushi.", "This is the first time I have tried sushi."],
  "points": [
    { "id": "firsttime", "label": "tense (first time + present perfect)", "reason": "tense (first time + present perfect)", "need": ["first time i have eaten", "first time i've eaten", "first time i have had", "first time i have tried"], "wrong": ["first time i eat sushi", "first time i ate sushi", "first time i am eating", "first time i have ate"] },
    { "id": "v-sushi", "label": "the word “sushi”", "reason": "vocabulary", "need": ["sushi"] }
  ]
},
{
  "r": 147, "zh": "火车刚要开的时候我们赶到了。",
  "en": ["The train was about to leave when we arrived.", "The train was about to depart when we arrived.", "We arrived just as the train was about to leave."],
  "points": [
    { "id": "aboutto", "label": "structure “be about to + base verb”", "reason": "structure (be about to + base verb)", "need": ["was about to leave", "was about to depart"], "wrong": ["was about to leaving", "was about leave", "is about to leave", "was about to left"] },
    { "id": "pastsimple", "label": "past simple “arrived”", "reason": "tense (past simple)", "need": ["we arrived", "we got there"], "wrong": ["we arrive", "we have arrived", "we were arriving"] },
    { "id": "v-train", "label": "the word “train”", "reason": "vocabulary", "need": ["train"] }
  ]
},
{
  "r": 148, "zh": "我花了两个小时做作业。",
  "en": ["I spent two hours doing my homework.", "I spent two hours on my homework.", "It took me two hours to do my homework.", "I spent 2 hours doing my homework."],
  "points": [
    { "id": "spend", "label": "verb pattern (spend time doing)", "reason": "verb pattern (spend time doing)", "need": ["spent two hours doing", "spent two hours on", "took me two hours to", "spent 2 hours doing"], "wrong": ["spent two hours to do", "spent two hours for doing", "spent two hours to doing", "cost two hours doing", "spend two hours doing"] },
    { "id": "v-homework", "label": "the word “homework”", "reason": "vocabulary", "need": ["homework"] }
  ]
},
{
  "r": 149, "zh": "我们停下来休息了一会儿。",
  "en": ["We stopped to take a rest.", "We stopped to rest for a while.", "We stopped to have a rest.", "We stopped to take a break."],
  "points": [
    { "id": "stoptodo", "label": "verb form (stop to do = purpose)", "reason": "verb form (stop to do = purpose)", "need": ["stopped to take", "stopped to rest", "stopped to have a rest", "stopped to take a break"], "wrong": ["stopped taking a rest", "stopped resting for", "stopped to taking", "stop to take a rest"] },
    { "id": "v-rest", "label": "the word “rest / break”", "reason": "vocabulary", "need": ["rest", "break"] }
  ]
},
{
  "r": 150, "zh": "听到这个消息我忍不住笑了。",
  "en": ["I couldn't help laughing when I heard the news.", "I couldn't help but laugh when I heard the news.", "I could not help laughing at the news."],
  "points": [
    { "id": "canthelp", "label": "verb form (can't help + -ing)", "reason": "verb form (can't help + -ing)", "need": ["couldn't help laughing", "couldn't help but laugh", "could not help laughing"], "wrong": ["couldn't help to laugh", "couldn't help laugh", "couldn't help but laughing"] },
    { "id": "v-news", "label": "the word “news”", "reason": "vocabulary", "need": ["news"] },
    { "id": "v-laugh", "label": "the word “laugh”", "reason": "vocabulary", "need": ["laugh", "laughing"] }
  ]
},
{
  "r": 151, "zh": "这本书读起来很容易。",
  "en": ["This book is easy to read.", "This book is easy to understand.", "The book is easy to read."],
  "points": [
    { "id": "easyto", "label": "structure “adj + to + base verb”", "reason": "structure (adj + to + base verb)", "need": ["read", "understand"], "wrong": ["easy to reading", "easy for read", "easy of reading", "easy to be read", "easy reading"] },
    { "id": "v-book", "label": "the word “book”", "reason": "vocabulary", "need": ["book"] }
  ]
},
{
  "r": 152, "zh": "据我所知，他还没结婚。",
  "en": ["As far as I know, he is not married yet.", "As far as I know, he hasn't got married yet.", "As far as I know, he is still single.", "As far as I know, he isn't married yet."],
  "points": [
    { "id": "asfaras", "label": "phrase “as far as I know”", "reason": "phrase (as far as I know)", "need": ["as far as i know", "as far as i am aware", "so far as i know"], "wrong": ["as far i know", "as far as i known", "far that i know"] },
    { "id": "yet", "label": "adverb “yet / still”", "reason": "adverb (yet / still)", "need": ["not married yet", "hasn't got married yet", "still single", "isn't married yet"], "wrong": ["not yet married already", "married yet not"] },
    { "id": "v-married", "label": "the word “married / single”", "reason": "vocabulary", "need": ["married", "single"] }
  ]
},
{
  "r": 153, "zh": "他似乎对结果很满意。",
  "en": ["He seems to be satisfied with the result.", "He seems satisfied with the result.", "He seems to be happy with the result.", "He appears to be satisfied with the result."],
  "points": [
    { "id": "seemto", "label": "verb form (seem to + be)", "reason": "verb form (seem to + be)", "need": ["seems to be satisfied", "seems satisfied", "seems to be happy", "appears to be satisfied"], "wrong": ["seems to satisfied", "seem to be satisfied", "seems being satisfied", "seems to be satisfy"] },
    { "id": "satisfiedwith", "label": "collocation “satisfied with”", "reason": "collocation (satisfied with)", "need": ["satisfied with", "happy with", "pleased with"], "wrong": ["satisfied of", "satisfied about", "satisfied to the", "satisfied for"] },
    { "id": "v-result", "label": "the word “result”", "reason": "vocabulary", "need": ["result"] }
  ]
},
{
  "r": 154, "zh": "无论多么困难，都不要放弃。",
  "en": ["No matter how difficult it is, don't give up.", "However difficult it is, don't give up.", "No matter how hard it is, don't give up.", "However hard it is, never give up."],
  "points": [
    { "id": "nomatterhow", "label": "structure “no matter how / however + adj”", "reason": "structure (no matter how / however + adj)", "need": ["no matter how difficult", "no matter how hard", "however difficult", "however hard"], "wrong": ["no matter how is it difficult", "however it is difficult", "no matter how difficulty", "how matter difficult"] },
    { "id": "giveup", "label": "phrasal verb “give up”", "reason": "phrasal verb (give up)", "need": ["give up", "giving up"], "wrong": ["gave up", "give out", "giving out"] }
  ]
},
{
  "r": 155, "zh": "这部电影没有我想象的那么好。",
  "en": ["This movie is not as good as I expected.", "The movie wasn't as good as I expected.", "This movie isn't as good as I thought.", "This movie is not so good as I expected."],
  "points": [
    { "id": "notasas", "label": "structure “not as … as”", "reason": "structure (not as … as)", "need": ["not as good as", "wasn't as good as", "isn't as good as", "not so good as"], "wrong": ["not as good than", "not good as i", "not as better as", "not as good like"] },
    { "id": "v-expect", "label": "the word “expect / thought”", "reason": "vocabulary", "need": ["expect", "expected", "thought", "imagined", "imagine"] }
  ]
},
{
  "r": 156, "zh": "你最好不要迟到。",
  "en": ["You had better not be late.", "You'd better not be late.", "You had better not arrive late.", "You'd better not come late."],
  "points": [
    { "id": "hadbetternot", "label": "structure “had better not + base verb”", "reason": "structure (had better not + base verb)", "need": ["had better not be late", "'d better not be late", "better not be late", "had better not arrive late", "had better not come late", "better not be"], "wrong": ["had not better be late", "had better don't be late", "had better not to be late", "better not being late", "had better no be late"] },
    { "id": "v-late", "label": "the word “late”", "reason": "vocabulary", "need": ["late"] }
  ]
},
{
  "r": 157, "zh": "这就是我出生的小镇。",
  "en": ["This is the town where I was born.", "This is the town where I grew up.", "This is the town in which I was born.", "This is the town I was born in."],
  "points": [
    { "id": "relwhere", "label": "relative clause (where / in which)", "reason": "relative clause (where / in which)", "need": ["town where i was born", "town where i grew up", "town in which i was born", "town i was born in"], "wrong": ["town which i was born", "town that i was born", "town where was i born"] },
    { "id": "passiveborn", "label": "passive “was born”", "reason": "passive (was born)", "need": ["was born", "grew up"], "wrong": ["was borned", "am born", "i born in"] },
    { "id": "v-town", "label": "the word “town”", "reason": "vocabulary", "need": ["town"] }
  ]
},
{
  "r": 158, "zh": "这里以前有一家书店。",
  "en": ["There used to be a bookstore here.", "There used to be a book shop here.", "There was a bookstore here before."],
  "points": [
    { "id": "thereusedto", "label": "structure “there used to be”", "reason": "structure (there used to be)", "need": ["there used to be", "there used to", "there was a bookstore here before", "there was a book shop here before"], "wrong": ["there use to be", "there used to being", "it used to be a bookstore here", "there used be"] },
    { "id": "v-bookstore", "label": "the word “bookstore”", "reason": "vocabulary", "need": ["bookstore", "book shop", "bookshop"] }
  ]
},
{
  "r": 159, "zh": "你本应该早点来的。",
  "en": ["You were supposed to come earlier.", "You were supposed to arrive earlier.", "You were supposed to be here earlier."],
  "points": [
    { "id": "supposedto", "label": "structure “be supposed to + base verb”", "reason": "structure (be supposed to + base verb)", "need": ["were supposed to come", "were supposed to arrive", "were supposed to be here"], "wrong": ["was supposed to come", "were suppose to come", "were supposed to coming", "supposed to came"] },
    { "id": "comptime", "label": "comparative “earlier”", "reason": "comparative (earlier)", "need": ["earlier", "sooner"], "wrong": ["more early", "more sooner", "early"] }
  ]
},
{
  "r": 160, "zh": "我明天要去看牙医。",
  "en": ["I am going to see the dentist tomorrow.", "I'm going to see the dentist tomorrow.", "I am seeing the dentist tomorrow.", "I'm going to the dentist tomorrow."],
  "points": [
    { "id": "goingto", "label": "future “be going to / arrangement”", "reason": "tense (be going to / arrangement)", "need": ["am going to", "'m going to", "am seeing the dentist", "going to the dentist"], "wrong": ["will going to see", "go to see the dentist tomorrow", "am going see the dentist", "going to saw the dentist"] },
    { "id": "v-dentist", "label": "the word “dentist”", "reason": "vocabulary", "need": ["dentist"] }
  ]
},
{
  "r": 161, "zh": "你不必现在就做决定。",
  "en": ["You don't have to decide now.", "You don't need to decide right now.", "You needn't decide now.", "You don't have to make a decision now."],
  "points": [
    { "id": "noobligation", "label": "modal “don't have to / needn't”", "reason": "modal (don't have to / needn't)", "need": ["don't have to decide", "don't need to decide", "needn't decide", "don't have to make a decision"], "wrong": ["don't must decide", "haven't to decide", "needn't to decide", "mustn't decide"] },
    { "id": "v-decide", "label": "the word “decide”", "reason": "vocabulary", "need": ["decide", "decision"] }
  ]
},
{
  "r": 162, "zh": "昨天我不得不步行回家。",
  "en": ["I had to walk home yesterday.", "Yesterday I had to walk home.", "I had to walk back home yesterday."],
  "points": [
    { "id": "hadto", "label": "modal “had to = past of must”", "reason": "modal (had to = past of must)", "need": ["had to walk"], "wrong": ["must walk home yesterday", "had to walked", "had to walking", "must have walked home", "have to walk home yesterday"] },
    { "id": "prep-home", "label": "preposition “walk home”", "reason": "preposition (walk home)", "need": ["walk home", "walk back home"], "wrong": ["walk to home", "walk at home", "walk home to"] }
  ]
},
{
  "r": 163, "zh": "他可能已经到家了。",
  "en": ["He may have already arrived home.", "He might have already gotten home.", "He may have got home already.", "He might already be home."],
  "points": [
    { "id": "mighthave", "label": "modal “may/might + have + p.p.”", "reason": "modal (may/might + have + p.p.)", "need": ["may have already arrived", "might have already gotten", "may have got home", "might already be home", "may have arrived"], "wrong": ["may have already arrive", "might have already get", "may has arrived", "may have already arriving"] },
    { "id": "v-home", "label": "the word “home”", "reason": "vocabulary", "need": ["home"] }
  ]
},
{
  "r": 164, "zh": "除非你道歉，否则我不会原谅你。",
  "en": ["I won't forgive you unless you apologize.", "Unless you apologize, I won't forgive you.", "I will not forgive you unless you apologize.", "I won't forgive you unless you say sorry."],
  "points": [
    { "id": "unless", "label": "conjunction “unless + present”", "reason": "conjunction (unless + present)", "need": ["unless you apologize", "unless you say sorry"], "wrong": ["unless you will apologize", "unless you don't apologize", "unless if you apologize", "unless you apologized"] },
    { "id": "future-neg", "label": "future negative “will not”", "reason": "tense (will not)", "need": ["won't forgive", "will not forgive"], "wrong": ["wouldn't forgive", "don't forgive you unless", "am not forgiving"] },
    { "id": "v-forgive", "label": "the word “forgive / apologize”", "reason": "vocabulary", "need": ["forgive", "apologize", "sorry"] }
  ]
},
{
  "r": 165, "zh": "万一你需要帮助，给我打电话。",
  "en": ["Call me in case you need help.", "In case you need help, call me.", "Call me in case you need any help.", "Give me a call in case you need help."],
  "points": [
    { "id": "incase", "label": "conjunction “in case + present”", "reason": "conjunction (in case + present)", "need": ["in case you need help", "in case you need any help", "in case you need"], "wrong": ["in case you will need", "in case of you need", "in case that you will need", "in the case you need"] },
    { "id": "imperative", "label": "imperative (Call me / Give me a call)", "reason": "imperative", "need": ["call me", "give me a call"], "wrong": ["you call me", "calling me", "you should call me"] }
  ]
},
{
  "r": 166, "zh": "即使下雨我们也会去。",
  "en": ["We will go even if it rains.", "Even if it rains, we will go.", "We'll go even if it rains.", "We will still go even if it rains."],
  "points": [
    { "id": "evenif", "label": "conjunction “even if + present”", "reason": "conjunction (even if + present)", "need": ["even if it rains"], "wrong": ["even if it will rain", "even though it rains", "even if it rain", "even if it rained"] },
    { "id": "future", "label": "future “will go”", "reason": "tense (future will)", "need": ["will go", "'ll go"], "wrong": ["would go", "go even if"] },
    { "id": "v-rain", "label": "the word “rain”", "reason": "vocabulary", "need": ["rain"] }
  ]
},
{
  "r": 167, "zh": "他英语说得和母语者一样好。",
  "en": ["He speaks English as well as a native speaker.", "He speaks English as fluently as a native speaker.", "He speaks English as well as a native."],
  "points": [
    { "id": "asas-adv", "label": "structure “as well as” (adverb)", "reason": "structure (as well as — adverb)", "need": ["as well as a native", "as fluently as a native"], "wrong": ["as good as a native", "as well than a native", "so well as a native"] },
    { "id": "v-native", "label": "the word “native”", "reason": "vocabulary", "need": ["native"] }
  ]
},
{
  "r": 168, "zh": "这是一个我从未听说过的词。",
  "en": ["This is a word I have never heard of.", "This is a word that I have never heard of.", "This is a word I've never heard of.", "It is a word I have never heard before."],
  "points": [
    { "id": "relreduced", "label": "relative clause (reduced / contact clause)", "reason": "relative clause (reduced / contact clause)", "need": ["word i have never heard", "word that i have never heard", "word i've never heard"], "wrong": ["word what i have never heard", "word which i have never heard of it", "word i have never heard of it"] },
    { "id": "heardof", "label": "collocation “hear of”", "reason": "collocation (hear of)", "need": ["heard of", "heard before", "heard about"], "wrong": ["heard from", "listened of", "heard to"] },
    { "id": "v-word", "label": "the word “word”", "reason": "vocabulary", "need": ["word"] }
  ]
},
{
  "r": 169, "zh": "我建议你不要熬夜。",
  "en": ["I advise you not to stay up late.", "I suggest you don't stay up late.", "I'd advise you not to stay up late.", "I suggest that you not stay up late."],
  "points": [
    { "id": "advisenotto", "label": "verb form (advise sb not to / suggest)", "reason": "verb form (advise sb not to / suggest)", "need": ["advise you not to stay", "suggest you don't stay", "suggest that you not stay", "advise you not to"], "wrong": ["advise you don't stay", "advise you not staying", "suggest you not to stay"] },
    { "id": "stayup", "label": "phrasal verb “stay up”", "reason": "phrasal verb (stay up)", "need": ["stay up", "staying up"], "wrong": ["sit up late", "stay up lately"] }
  ]
},
{
  "r": 170, "zh": "你学英语多久了？",
  "en": ["How long have you been learning English?", "How long have you been studying English?", "How long have you studied English?", "How long have you learned English?"],
  "points": [
    { "id": "howlong", "label": "tense (how long + present perfect)", "reason": "tense (how long + present perfect)", "need": ["how long have you been learning", "how long have you been studying", "how long have you studied", "how long have you learned"], "wrong": ["how long are you learning", "how long do you learn", "how long you have learned", "how long have you been learn", "how long did you learn"] },
    { "id": "v-english", "label": "the word “English”", "reason": "vocabulary", "need": ["english"] }
  ]
},
{
  "r": 171, "zh": "这双鞋是我姐姐给我买的。",
  "en": ["These shoes were bought for me by my sister.", "My sister bought these shoes for me.", "My sister bought me these shoes.", "It was my sister who bought me these shoes."],
  "points": [
    { "id": "ditransitive", "label": "verb pattern (buy sb sth / buy sth for sb)", "reason": "verb pattern (buy sb sth / for sb)", "need": ["bought me these shoes", "bought these shoes for me", "were bought for me by", "who bought me these shoes"], "wrong": ["bought these shoes to me", "bought for me these shoes", "bought to me these shoes", "buyed me these shoes"] },
    { "id": "v-shoes", "label": "the word “shoes”", "reason": "vocabulary", "need": ["shoes"] },
    { "id": "v-sister", "label": "the word “sister”", "reason": "vocabulary", "need": ["sister"] }
  ]
},
{
  "r": 172, "zh": "他没有道歉，反而责怪我。",
  "en": ["Instead of apologizing, he blamed me.", "He blamed me instead of apologizing.", "Rather than apologizing, he blamed me.", "Instead of saying sorry, he blamed me."],
  "points": [
    { "id": "insteadof", "label": "verb form (instead of + -ing)", "reason": "verb form (instead of + -ing)", "need": ["instead of apologizing", "instead of saying sorry", "rather than apologizing"], "wrong": ["instead of apologize", "instead to apologize", "instead of he apologize", "instead apologizing", "rather than apologize"] },
    { "id": "blame", "label": "collocation “blame sb”", "reason": "collocation (blame sb)", "need": ["blamed me", "blamed it on me"], "wrong": ["blamed to me", "blamed at me"] }
  ]
},
{
  "r": 173, "zh": "通过努力工作，她实现了梦想。",
  "en": ["By working hard, she achieved her dream.", "She achieved her dream by working hard.", "By working hard, she made her dream come true.", "She realized her dream by working hard."],
  "points": [
    { "id": "bygerund", "label": "verb form (by + -ing = means)", "reason": "verb form (by + -ing = means)", "need": ["by working hard", "by studying hard"], "wrong": ["by work hard", "by worked hard", "with working hard", "by to work hard"] },
    { "id": "achievedream", "label": "collocation “achieve a dream”", "reason": "collocation (achieve a dream)", "need": ["achieved her dream", "made her dream come true", "realized her dream", "realised her dream"], "wrong": ["achieved her dream come true", "reached her dream", "complete her dream", "arrived her dream"] }
  ]
},
{
  "r": 174, "zh": "现在后悔也没用。",
  "en": ["It's no use regretting now.", "There's no point in regretting now.", "It is no use regretting it now.", "There's no point regretting now."],
  "points": [
    { "id": "nouse", "label": "structure “no use / no point + -ing”", "reason": "structure (no use / no point + -ing)", "need": ["no use regretting", "no point in regretting", "no point regretting"], "wrong": ["no use to regret", "no point to regret", "no use regret", "no point of regretting", "no point in regret"] },
    { "id": "v-regret", "label": "the word “regret”", "reason": "vocabulary", "need": ["regret", "regretting"] }
  ]
},
{
  "r": 175, "zh": "小时候，奶奶常常给我讲故事。",
  "en": ["When I was young, my grandmother would tell me stories.", "When I was a child, my grandma would tell me stories.", "My grandmother used to tell me stories when I was young.", "When I was young, my grandmother would tell me stories every night."],
  "points": [
    { "id": "wouldhabit", "label": "past habit (would / used to)", "reason": "past habit (would / used to)", "need": ["would tell me stories", "used to tell me stories"], "wrong": ["will tell me stories", "would told me stories", "would telling me stories", "would tells me"] },
    { "id": "pastwhen", "label": "past tense “when I was …”", "reason": "tense (when I was …)", "need": ["when i was young", "when i was a child", "when i was little", "when i was a kid"], "wrong": ["when i am young", "when i was being young"] },
    { "id": "v-grandmother", "label": "the word “grandmother”", "reason": "vocabulary", "need": ["grandmother", "grandma", "grandmom", "granny"] }
  ]
},
{
  "r": 176, "zh": "他说得好像他亲眼看见过一样。",
  "en": ["He talks as if he had seen it himself.", "He talks as though he had seen it himself.", "He speaks as if he saw it himself.", "He talks as if he had witnessed it."],
  "points": [
    { "id": "asif", "label": "conjunction “as if / as though”", "reason": "conjunction (as if / as though)", "need": ["as if he had seen", "as though he had seen", "as if he saw", "as if he had witnessed"], "wrong": ["as if he has seen", "as if he sees", "like he had seen", "as if he had see"] },
    { "id": "reflexive", "label": "reflexive pronoun “himself”", "reason": "reflexive pronoun (himself)", "need": ["himself"], "wrong": ["by his self", "hisself", "himselves"] }
  ]
},
{
  "r": 177, "zh": "既然你来了，就留下吃晚饭吧。",
  "en": ["Now that you're here, stay for dinner.", "Now that you are here, stay for dinner.", "Since you're here, stay for dinner.", "Now that you're here, why don't you stay for dinner?"],
  "points": [
    { "id": "nowthat", "label": "conjunction “now that”", "reason": "conjunction (now that)", "need": ["now that you're here", "now that you are here", "since you're here"], "wrong": ["now that you here", "now you are here that", "now that you will be here", "now that here you are"] },
    { "id": "imperative", "label": "imperative / suggestion", "reason": "imperative / suggestion", "need": ["stay for dinner", "why don't you stay"], "wrong": ["you stay for dinner", "staying for dinner", "you should stay for dinner"] },
    { "id": "v-dinner", "label": "the word “dinner”", "reason": "vocabulary", "need": ["dinner"] }
  ]
},
{
  "r": 178, "zh": "我不确定他是否会来。",
  "en": ["I'm not sure whether he will come or not.", "I'm not sure if he will come.", "I'm not sure whether he'll come.", "I am not sure whether or not he will come."],
  "points": [
    { "id": "whether", "label": "clause “whether / if”", "reason": "clause (whether / if)", "need": ["whether he will come", "whether he'll come", "if he will come", "whether or not he will come"], "wrong": ["whether he will come or no", "whether will he come", "whether that he will come"] },
    { "id": "notsure", "label": "phrase “not sure”", "reason": "phrase (not sure)", "need": ["not sure", "not certain"], "wrong": ["no sure", "not sured", "don't sure"] }
  ]
},
{
  "r": 179, "zh": "看来要下雨了。",
  "en": ["It looks like it's going to rain.", "It looks like it is going to rain.", "It seems like it's going to rain.", "It looks as if it's going to rain."],
  "points": [
    { "id": "lookslike", "label": "structure “it looks like / as if”", "reason": "structure (it looks like / as if)", "need": ["looks like it's going to rain", "looks like it is going to rain", "seems like it's going to rain", "looks as if it's going to rain", "looks like it will rain"], "wrong": ["looks like to rain", "look like it's going to rain", "looks like raining", "it looks like will rain"] },
    { "id": "v-rain", "label": "the word “rain”", "reason": "vocabulary", "need": ["rain"] }
  ]
},
{
  "r": 180, "zh": "学这门课我有困难。",
  "en": ["I have difficulty learning this course.", "I have difficulty in learning this subject.", "I have trouble learning this course.", "I'm having difficulty with this course."],
  "points": [
    { "id": "difficulty", "label": "verb form (have difficulty (in) doing)", "reason": "verb form (have difficulty (in) doing)", "need": ["difficulty learning", "difficulty in learning", "trouble learning", "difficulty with this"], "wrong": ["difficulty to learn", "difficulty learn", "trouble to learn", "difficulty on learning"] },
    { "id": "v-course", "label": "the word “course / subject”", "reason": "vocabulary", "need": ["course", "subject"] }
  ]
},
{
  "r": 181, "zh": "我整个下午都在忙着写报告。",
  "en": ["I was busy writing a report all afternoon.", "I was busy writing the report all afternoon.", "I spent all afternoon busy writing a report.", "I was busy with a report all afternoon."],
  "points": [
    { "id": "busydoing", "label": "verb form (be busy doing)", "reason": "verb form (be busy doing)", "need": ["busy writing", "busy with a report", "busy with the report"], "wrong": ["busy to write", "busy write", "busy for writing"] },
    { "id": "v-report", "label": "the word “report”", "reason": "vocabulary", "need": ["report"] }
  ]
},
{
  "r": 182, "zh": "我们去看电影怎么样？",
  "en": ["How about going to the movies?", "What about going to the movies?", "How about seeing a movie?", "How about we go to the movies?"],
  "points": [
    { "id": "howabout", "label": "structure “how about + -ing”", "reason": "structure (how about + -ing)", "need": ["how about going", "what about going", "how about seeing", "how about we go"], "wrong": ["how about to go", "what about to go", "how about go to the", "how about goes"] },
    { "id": "v-movie", "label": "the word “movie”", "reason": "vocabulary", "need": ["movie", "cinema", "film"] }
  ]
},
{
  "r": 183, "zh": "老师让学生们朗读课文。",
  "en": ["The teacher had the students read the text aloud.", "The teacher made the students read the text aloud.", "The teacher got the students to read the text aloud.", "The teacher had the students read the passage aloud."],
  "points": [
    { "id": "causativeverb", "label": "verb form (have/make sb do, get sb to do)", "reason": "verb form (have/make sb do, get sb to do)", "need": ["had the students read", "made the students read", "got the students to read"], "wrong": ["had the students to read", "made the students to read", "got the students read", "had the students reading", "let the students to read"] },
    { "id": "v-text", "label": "the word “text / passage”", "reason": "vocabulary", "need": ["text", "passage"] }
  ]
},
{
  "r": 184, "zh": "这是两者中较好的一个。",
  "en": ["This is the better one of the two.", "This is the better of the two.", "This is the nicer one of the two."],
  "points": [
    { "id": "comptwo", "label": "comparative (the + -er of the two)", "reason": "comparative (the + -er of the two)", "need": ["the better one of the two", "the better of the two", "the nicer one of the two"], "wrong": ["the best of the two", "the better two", "the more better of the two", "best one of the two"] }
  ]
},
{
  "r": 185, "zh": "你的包和我的一模一样。",
  "en": ["Your bag is the same as mine.", "Your bag is exactly the same as mine.", "Your bag is identical to mine.", "Your bag and mine are the same."],
  "points": [
    { "id": "sameas", "label": "structure “the same as”", "reason": "structure (the same as)", "need": ["the same as mine", "identical to mine", "and mine are the same", "the same as my bag"], "wrong": ["the same with mine", "the same like mine", "the same than mine", "same to mine"] },
    { "id": "v-bag", "label": "the word “bag”", "reason": "vocabulary", "need": ["bag"] }
  ]
},
{
  "r": 186, "zh": "这个房间和那个很不一样。",
  "en": ["This room is different from that one.", "This room is very different from that one.", "This room is different to that one.", "This room differs from that one."],
  "points": [
    { "id": "differentfrom", "label": "structure “different from”", "reason": "structure (different from)", "need": ["different from", "different to", "differs from"], "wrong": ["different than that one", "different with that", "different of that", "difference from that"] },
    { "id": "v-room", "label": "the word “room”", "reason": "vocabulary", "need": ["room"] }
  ]
},
{
  "r": 187, "zh": "这部手机是那部的两倍贵。",
  "en": ["This phone is twice as expensive as that one.", "This phone costs twice as much as that one.", "This phone is twice the price of that one.", "This phone is two times as expensive as that one."],
  "points": [
    { "id": "multiple", "label": "structure “twice as … as”", "reason": "structure (twice as … as)", "need": ["twice as expensive as", "twice as much as", "twice the price of", "two times as expensive as"], "wrong": ["twice more expensive than", "twice as expensive than", "two times more expensive", "as twice expensive as"] },
    { "id": "v-phone", "label": "the word “phone”", "reason": "vocabulary", "need": ["phone"] }
  ]
},
{
  "r": 188, "zh": "房间里几乎没有家具。",
  "en": ["There is little furniture in the room.", "There was little furniture in the room.", "There is hardly any furniture in the room."],
  "points": [
    { "id": "littlefurn", "label": "quantifier (little + uncountable)", "reason": "quantifier (little / few)", "need": ["little furniture", "hardly any furniture"], "wrong": ["few furniture", "many furniture", "a few furniture"] },
    { "id": "v-furniture", "label": "the word “furniture”", "reason": "vocabulary", "need": ["furniture"] }
  ]
},
{
  "r": 189, "zh": "我花了很长时间才适应这里的生活。",
  "en": ["It took me a long time to get used to living here.", "It took a long time to get used to life here.", "I took a long time to get used to living here.", "It took me ages to get used to living here."],
  "points": [
    { "id": "getusedto", "label": "verb form (get used to + -ing)", "reason": "verb form (get used to + -ing)", "need": ["get used to living", "get used to life here"], "wrong": ["get used to live here", "get use to living", "get used living here"] },
    { "id": "ittook", "label": "structure (it takes/took time to)", "reason": "structure (it took time to)", "need": ["it took me a long time to", "it took a long time to", "took me ages to"], "wrong": ["it spent a long time", "it cost me a long time", "i spent a long time to get"] }
  ]
},
{
  "r": 190, "zh": "我喜欢咖啡，她也喜欢。",
  "en": ["I like coffee, and so does she.", "I like coffee, and she does too.", "I like coffee. So does she.", "I like coffee, and she likes it too."],
  "points": [
    { "id": "soaux", "label": "structure “so does she / she does too”", "reason": "structure (so does she / she does too)", "need": ["so does she", "she does too", "she likes it too"], "wrong": ["so she does", "so is she", "so does her", "also she does", "so do she"] },
    { "id": "v-coffee", "label": "the word “coffee”", "reason": "vocabulary", "need": ["coffee"] }
  ]
},
{
  "r": 191, "zh": "我也不喜欢。",
  "en": ["I don't like it either.", "Neither do I.", "Nor do I.", "Me neither."],
  "points": [
    { "id": "neitheraux", "label": "structure “neither do I / not … either”", "reason": "structure (neither do I / not … either)", "need": ["neither do i", "nor do i", "don't like it either", "me neither"], "wrong": ["neither i do", "also i don't", "i don't like it neither", "either do i"] }
  ]
},
{
  "r": 192, "zh": "无论你去哪里，我都会跟着你。",
  "en": ["Wherever you go, I will follow you.", "No matter where you go, I will follow you.", "Wherever you go, I'll follow you.", "I will follow you wherever you go."],
  "points": [
    { "id": "wherever", "label": "structure “wherever / no matter where”", "reason": "structure (wherever / no matter where)", "need": ["wherever you go", "no matter where you go"], "wrong": ["where ever you go", "whereever you go", "wherever you will go", "wherever do you go", "wherever you went"] },
    { "id": "future", "label": "future “will follow”", "reason": "tense (future will)", "need": ["will follow", "'ll follow"], "wrong": ["would follow", "am following", "follow you wherever"] },
    { "id": "v-follow", "label": "the word “follow”", "reason": "vocabulary", "need": ["follow"] }
  ]
},
{
  "r": 193, "zh": "明天这个时候我将在飞往北京的飞机上。",
  "en": ["This time tomorrow, I will be flying to Beijing.", "This time tomorrow, I'll be flying to Beijing.", "At this time tomorrow, I will be on a plane to Beijing.", "This time tomorrow I will be flying to Beijing."],
  "points": [
    { "id": "futurecont", "label": "future continuous (will be doing)", "reason": "tense (future continuous)", "need": ["will be flying", "'ll be flying", "will be on a plane"], "wrong": ["will fly to beijing", "am flying to beijing tomorrow", "will be fly", "would be flying", "will flying"] },
    { "id": "v-beijing", "label": "the place “Beijing”", "reason": "vocabulary", "need": ["beijing"] }
  ]
},
{
  "r": 194, "zh": "到下个月我就在这里工作满五年了。",
  "en": ["By next month, I will have worked here for five years.", "By next month, I'll have worked here for 5 years.", "By next month, I will have been here for five years.", "Next month, I will have worked here for five years."],
  "points": [
    { "id": "futureperfect", "label": "future perfect (will have done)", "reason": "tense (future perfect)", "need": ["will have worked", "'ll have worked", "will have been here"], "wrong": ["will work here for five", "will have work", "would have worked", "will have been worked", "am working here for five"] },
    { "id": "prep-by", "label": "preposition “by + time”", "reason": "preposition (by + time)", "need": ["by next month", "by the next month"], "wrong": ["until next month", "in next month", "at next month"] }
  ]
},
{
  "r": 195, "zh": "我到那儿时，他们已经等了两个小时了。",
  "en": ["By the time I got there, they had been waiting for two hours.", "When I arrived, they had been waiting for two hours.", "By the time I got there, they had already been waiting for two hours.", "They had been waiting for two hours by the time I arrived."],
  "points": [
    { "id": "pastperfcont", "label": "past perfect continuous (had been doing)", "reason": "tense (past perfect continuous)", "need": ["had been waiting"], "wrong": ["had waited for two hours", "were waiting for two hours", "have been waiting", "had been wait", "had being waiting"] },
    { "id": "prep-for", "label": "preposition “for + duration”", "reason": "preposition (for + duration)", "need": ["for two hours"], "wrong": ["since two hours", "for two hour", "during two hours"] }
  ]
},
{
  "r": 196, "zh": "你该理发了。",
  "en": ["It's time you had a haircut.", "It's time you got a haircut.", "It's time for you to get a haircut.", "It is time you had your hair cut."],
  "points": [
    { "id": "itstime", "label": "subjunctive “it's time you did”", "reason": "subjunctive (it's time you did)", "need": ["time you had a haircut", "time you got a haircut", "time for you to get a haircut", "time you had your hair cut"], "wrong": ["time you have a haircut", "time you get a haircut", "time that you get a haircut", "time you having a haircut"] },
    { "id": "v-haircut", "label": "the word “haircut”", "reason": "vocabulary", "need": ["haircut", "hair cut", "hair"] }
  ]
},
{
  "r": 197, "zh": "要是我没错过那趟火车就好了。",
  "en": ["If only I hadn't missed the train.", "If only I had not missed that train.", "I wish I hadn't missed the train.", "If only I hadn't missed that train."],
  "points": [
    { "id": "ifonly", "label": "subjunctive (if only / wish + past perfect)", "reason": "subjunctive (if only / wish + past perfect)", "need": ["if only i hadn't missed", "if only i had not missed", "wish i hadn't missed", "wish i had not missed"], "wrong": ["if only i didn't miss", "if only i don't miss", "if only i haven't missed", "if only i wouldn't miss", "wish i didn't miss"] },
    { "id": "v-train", "label": "the word “train”", "reason": "vocabulary", "need": ["train"] }
  ]
},
{
  "r": 198, "zh": "我确实给你发过邮件。",
  "en": ["I did send you an email.", "I did email you.", "I really did send you an email.", "I did send you a message."],
  "points": [
    { "id": "emphaticdo", "label": "emphatic “do/did” + base verb", "reason": "emphatic do/did + base verb", "need": ["did send you", "did email you", "did send you an email", "did send you a message"], "wrong": ["did sent you", "do sent you", "did sended you"] },
    { "id": "v-email", "label": "the word “email”", "reason": "vocabulary", "need": ["email", "message", "mail"] }
  ]
},
{
  "r": 199, "zh": "我需要的是一个好的解释。",
  "en": ["What I need is a good explanation.", "What I want is a good explanation.", "A good explanation is what I need.", "What I need is a proper explanation."],
  "points": [
    { "id": "cleftwhat", "label": "cleft (What … is)", "reason": "cleft (What … is)", "need": ["what i need is", "what i want is", "is what i need"], "wrong": ["what i need it is", "that i need is", "what do i need is", "what i need are", "the what i need is"] },
    { "id": "v-explanation", "label": "the word “explanation”", "reason": "vocabulary", "need": ["explanation"] }
  ]
},
{
  "r": 200, "zh": "正是他帮助了我。",
  "en": ["It was he who helped me.", "It was him who helped me.", "It was he that helped me.", "He was the one who helped me."],
  "points": [
    { "id": "cleftit", "label": "cleft (It was … who/that)", "reason": "cleft (It was … who/that)", "need": ["it was he who", "it was him who", "it was he that", "he was the one who"], "wrong": ["it was he helped me", "it was who helped me", "it is he who helped", "it was he which helped", "was he who helped me"] },
    { "id": "v-help", "label": "the word “help”", "reason": "vocabulary", "need": ["help", "helped", "helping", "helps"] }
  ]
},
{
  "r": 201, "zh": "由于大雨，比赛被取消了。",
  "en": ["The game was cancelled because of the heavy rain.", "The match was cancelled due to the heavy rain.", "Because of the heavy rain, the game was cancelled.", "The game was called off because of the heavy rain."],
  "points": [
    { "id": "becauseof", "label": "preposition (because of / due to + noun)", "reason": "preposition (because of / due to + noun)", "need": ["because of the heavy rain", "due to the heavy rain", "because of the rain", "due to the rain"], "wrong": ["because the heavy rain", "because of it was raining", "due to it rained", "because of heavy rain was"] },
    { "id": "passive-cancel", "label": "passive (was cancelled)", "reason": "passive (was cancelled)", "need": ["was cancelled", "was canceled", "was called off"], "wrong": ["was cancel", "cancelled the game", "is cancelled", "was cancelling"] },
    { "id": "v-game", "label": "the word “game / match”", "reason": "vocabulary", "need": ["game", "match"] }
  ]
},
{
  "r": 202, "zh": "那是一个如此感人的故事，我们都哭了。",
  "en": ["It was such a moving story that we all cried.", "It was such a touching story that we all cried.", "It was such an emotional story that we all cried.", "It was such a moving story that we all wept."],
  "points": [
    { "id": "suchthat", "label": "structure “such a … that”", "reason": "structure (such a … that)", "need": ["such a moving story that", "such a touching story that", "such an emotional story that"], "wrong": ["so a moving story that", "such moving story that", "such a moving story so", "so moving story that we"] },
    { "id": "v-cry", "label": "the word “cry”", "reason": "vocabulary", "need": ["cried", "cry", "wept", "weep"] },
    { "id": "v-story", "label": "the word “story”", "reason": "vocabulary", "need": ["story"] }
  ]
},
{
  "r": 203, "zh": "这本字典对学生很有用。",
  "en": ["This dictionary is very useful for students.", "This dictionary is very useful to students.", "This dictionary is really useful for students.", "This dictionary is helpful for students."],
  "points": [
    { "id": "usefulfor", "label": "collocation (useful for/to)", "reason": "collocation (useful for/to)", "need": ["useful for students", "useful to students", "helpful for students", "helpful to students"], "wrong": ["useful of students", "useful with students", "use for students"] },
    { "id": "v-dictionary", "label": "the word “dictionary”", "reason": "vocabulary", "need": ["dictionary"] }
  ]
},
{
  "r": 204, "zh": "我喜欢在雨中散步。",
  "en": ["I enjoy walking in the rain.", "I love walking in the rain.", "I like walking in the rain.", "I enjoy taking walks in the rain."],
  "points": [
    { "id": "enjoydoing", "label": "verb form (enjoy + -ing)", "reason": "verb form (enjoy + -ing)", "need": ["enjoy walking", "love walking", "like walking", "enjoy taking walks"], "wrong": ["enjoy to walk", "enjoy walk in", "like to walking", "enjoy walked"] },
    { "id": "prep-in", "label": "preposition “in the rain”", "reason": "preposition (in the rain)", "need": ["in the rain"], "wrong": ["on the rain", "under the rain", "at the rain", "in rain"] }
  ]
},
{
  "r": 205, "zh": "他答应帮我搬家。",
  "en": ["He promised to help me move.", "He promised to help me move house.", "He promised that he would help me move.", "He promised to help me with the move."],
  "points": [
    { "id": "promiseto", "label": "verb form (promise to + base verb)", "reason": "verb form (promise to + base verb)", "need": ["promised to help", "promised that he would help", "promised to help me move", "promised to help me with"], "wrong": ["promised helping me", "promised help me", "promised to helped"] },
    { "id": "v-move", "label": "the word “move”", "reason": "vocabulary", "need": ["move", "moving", "moved"] }
  ]
},
{
  "r": 206, "zh": "我设法按时完成了工作。",
  "en": ["I managed to finish the work on time.", "I managed to complete the work on time.", "I managed to get the work done on time.", "I managed to finish the job on time."],
  "points": [
    { "id": "manageto", "label": "verb form (manage to + base verb)", "reason": "verb form (manage to + base verb)", "need": ["managed to finish", "managed to complete", "managed to get the work done"], "wrong": ["managed finishing", "managed finish", "managed to finished", "manage to finish the work"] },
    { "id": "ontime", "label": "collocation “on time”", "reason": "collocation (on time)", "need": ["on time"], "wrong": ["in time", "on the time", "at time"] }
  ]
},
{
  "r": 207, "zh": "这家公司是2010年成立的。",
  "en": ["The company was founded in 2010.", "The company was established in 2010.", "This company was founded in 2010.", "The company was set up in 2010."],
  "points": [
    { "id": "passivefound", "label": "passive (was founded)", "reason": "passive (was founded / established)", "need": ["was founded in", "was established in", "was set up in"], "wrong": ["was found in 2010", "is founded in", "was founding in", "was build in 2010"] },
    { "id": "prep-in-year", "label": "preposition “in + year”", "reason": "preposition (in + year)", "need": ["in 2010"], "wrong": ["on 2010", "at 2010", "in the 2010"] },
    { "id": "v-company", "label": "the word “company”", "reason": "vocabulary", "need": ["company"] }
  ]
},
{
  "r": 208, "zh": "听到这个好消息，他高兴得跳了起来。",
  "en": ["Hearing the good news, he jumped for joy.", "On hearing the good news, he jumped for joy.", "When he heard the good news, he jumped for joy.", "Hearing the good news, he jumped up with joy."],
  "points": [
    { "id": "participle", "label": "participle clause (Hearing …)", "reason": "participle clause (Hearing …)", "need": ["hearing the good news", "on hearing the good news", "when he heard the good news"], "wrong": ["when he hear the good news", "because hearing the good news", "for hearing the good news"] },
    { "id": "joy", "label": "collocation “jump for joy”", "reason": "collocation (jump for joy)", "need": ["jumped for joy", "jumped up with joy", "jumped with joy", "jumped up"], "wrong": ["jumped of joy", "jumped by joy", "jumped from joy"] },
    { "id": "v-news", "label": "the word “news”", "reason": "vocabulary", "need": ["news"] }
  ]
},
{
  "r": 209, "zh": "无论谁打电话来，告诉他们我出去了。",
  "en": ["Whoever calls, tell them I'm out.", "No matter who calls, tell them I'm out.", "Whoever calls, tell them that I'm out.", "Whoever phones, tell them I'm out."],
  "points": [
    { "id": "whoever", "label": "structure “whoever + verb”", "reason": "structure (whoever + verb)", "need": ["whoever calls", "no matter who calls", "whoever phones"], "wrong": ["whoever call", "who ever calls", "whoever will call", "whomever calls", "whoever calling"] },
    { "id": "imperative", "label": "imperative (tell them …)", "reason": "imperative", "need": ["tell them", "tell them that"], "wrong": ["you tell them", "telling them", "you should tell them"] }
  ]
},
{
  "r": 210, "zh": "冬天她容易感冒。",
  "en": ["She tends to catch colds in winter.", "She is likely to catch a cold in winter.", "She tends to get colds in winter.", "She often catches colds in winter."],
  "points": [
    { "id": "tendto", "label": "verb form (tend to / be likely to + base)", "reason": "verb form (tend to / be likely to + base)", "need": ["tends to catch", "is likely to catch", "tends to get", "often catches"], "wrong": ["tends to catching", "tend to catch", "tends catch", "is likely catch", "tends to caught"] },
    { "id": "prep-in", "label": "preposition “in winter”", "reason": "preposition (in winter)", "need": ["in winter", "in the winter"], "wrong": ["on winter", "at winter", "in winters"] },
    { "id": "v-cold", "label": "the word “cold”", "reason": "vocabulary", "need": ["cold", "colds"] }
  ]
},
{
  "r": 211, "zh": "我刚到家就开始下雨了。",
  "en": ["No sooner had I got home than it started to rain.", "Hardly had I got home when it started to rain.", "No sooner had I gotten home than it began to rain.", "Hardly had I arrived home when it started raining."],
  "points": [
    { "id": "inversion", "label": "inversion (no sooner … than / hardly … when)", "reason": "inversion (no sooner … than / hardly … when)", "need": ["no sooner had i got home than", "hardly had i got home when", "no sooner had i gotten home than", "hardly had i arrived home when"], "wrong": ["no sooner i had got home than", "no sooner had i got home when", "hardly had i got home than", "no sooner did i get home than", "hardly i had got home when"] },
    { "id": "v-rain", "label": "the word “rain”", "reason": "vocabulary", "need": ["rain", "raining"] }
  ]
},
{
  "r": 212, "zh": "我从没见过这么美的日落。",
  "en": ["Never have I seen such a beautiful sunset.", "Never had I seen such a beautiful sunset.", "Never have I seen so beautiful a sunset.", "Never have I seen a more beautiful sunset."],
  "points": [
    { "id": "neverinv", "label": "inversion (Never have I …)", "reason": "inversion (Never have I …)", "need": ["never have i seen", "never had i seen"], "wrong": ["never i have seen", "never have i saw", "never have seen i", "never i saw"] },
    { "id": "such", "label": "structure “such a … / so … a”", "reason": "structure (such a … / so … a)", "need": ["such a beautiful sunset", "so beautiful a sunset", "a more beautiful sunset"], "wrong": ["such beautiful sunset", "so a beautiful sunset", "a such beautiful sunset"] },
    { "id": "v-sunset", "label": "the word “sunset”", "reason": "vocabulary", "need": ["sunset"] }
  ]
},
{
  "r": 213, "zh": "只有努力工作，你才能成功。",
  "en": ["Only by working hard can you succeed.", "Only through hard work can you succeed.", "Only by working hard can you be successful.", "You can only succeed by working hard."],
  "points": [
    { "id": "onlyinv", "label": "inversion (Only by … can you)", "reason": "inversion (Only by … can you)", "need": ["only by working hard can you", "only through hard work can you", "you can only succeed by working hard"], "wrong": ["only by working hard you can", "only by work hard can you", "only by working hard can you to succeed", "only by working hard you can succeed"] },
    { "id": "v-succeed", "label": "the word “succeed”", "reason": "vocabulary", "need": ["succeed", "successful", "success"] }
  ]
},
{
  "r": 214, "zh": "要是我当时学了医就好了，现在我就是医生了。",
  "en": ["If I had studied medicine, I would be a doctor now.", "If I had studied medicine, I'd be a doctor now.", "Had I studied medicine, I would be a doctor now.", "If I had studied medicine, I would be a doctor today."],
  "points": [
    { "id": "mixedif", "label": "mixed conditional (if + had + p.p.)", "reason": "conditional (mixed: if + had + p.p.)", "need": ["if i had studied medicine", "had i studied medicine"], "wrong": ["if i studied medicine", "if i had study medicine", "if i would have studied medicine", "if i have studied medicine"] },
    { "id": "mixedresult", "label": "present result (would be …)", "reason": "conditional (would be — present result)", "need": ["would be a doctor", "'d be a doctor"], "wrong": ["would have been a doctor now", "will be a doctor", "would been a doctor", "would be a doctor then"] },
    { "id": "v-doctor", "label": "the word “doctor”", "reason": "vocabulary", "need": ["doctor"] }
  ]
},
{
  "r": 215, "zh": "请尽快回复我。",
  "en": ["Please reply to me as soon as possible.", "Please get back to me as soon as possible.", "Please reply as soon as you can.", "Please answer me as soon as possible."],
  "points": [
    { "id": "asaspossible", "label": "structure “as … as possible”", "reason": "structure (as … as possible)", "need": ["as soon as possible", "as soon as you can"], "wrong": ["as soon as possibly", "as soon possible", "so soon as possible", "as soon as it possible"] },
    { "id": "replyto", "label": "collocation “reply to sb”", "reason": "collocation (reply to sb)", "need": ["reply to me", "reply as soon", "get back to me", "answer me", "reply to"], "wrong": ["reply me as soon", "response to me", "reply me back"] }
  ]
},
{
  "r": 216, "zh": "与其说他懒，不如说他累了。",
  "en": ["He is not so much lazy as tired.", "He's not so much lazy as tired.", "It's not so much that he's lazy as that he's tired.", "He is not so much lazy as he is tired."],
  "points": [
    { "id": "notsomuch", "label": "structure “not so much … as”", "reason": "structure (not so much … as)", "need": ["not so much lazy as", "not so much that he's lazy as"], "wrong": ["not so much lazy than", "not so much lazy but", "not as much lazy as", "not so lazy as much"] },
    { "id": "v-lazy", "label": "the word “lazy”", "reason": "vocabulary", "need": ["lazy"] },
    { "id": "v-tired", "label": "the word “tired”", "reason": "vocabulary", "need": ["tired"] }
  ]
},
{
  "r": 217, "zh": "老板坚持要我们准时到。",
  "en": ["The boss insisted that we arrive on time.", "The boss insisted that we be on time.", "The boss insisted that we should arrive on time.", "The boss insisted on us arriving on time."],
  "points": [
    { "id": "insistsubj", "label": "subjunctive (insist that … (should) do)", "reason": "subjunctive (insist that … (should) do)", "need": ["insisted that we arrive", "insisted that we be on time", "insisted that we should arrive", "insisted on us arriving", "insisted on our arriving"], "wrong": ["insisted us to arrive", "insisted that we to arrive", "insisted us arriving"] },
    { "id": "ontime", "label": "collocation “on time”", "reason": "collocation (on time)", "need": ["on time"], "wrong": ["in time", "on the time", "at time"] },
    { "id": "v-boss", "label": "the word “boss”", "reason": "vocabulary", "need": ["boss"] }
  ]
},
{
  "r": 218, "zh": "她害怕一个人待着。",
  "en": ["She is afraid of being alone.", "She's afraid of being alone.", "She is afraid of staying alone.", "She is scared of being alone."],
  "points": [
    { "id": "afraidof", "label": "verb form (afraid of + -ing)", "reason": "verb form (afraid of + -ing)", "need": ["afraid of being alone", "afraid of staying alone", "scared of being alone", "afraid of being on her own"], "wrong": ["afraid of be alone", "afraid to being alone", "afraid of stay alone", "afraid being alone", "scared of be alone"] },
    { "id": "v-alone", "label": "the word “alone”", "reason": "vocabulary", "need": ["alone"] }
  ]
},
{
  "r": 219, "zh": "成功取决于努力。",
  "en": ["Success depends on hard work.", "Success depends on effort.", "Success depends upon hard work.", "Whether you succeed depends on how hard you work."],
  "points": [
    { "id": "dependon", "label": "collocation “depend on”", "reason": "collocation (depend on)", "need": ["depends on", "depends upon", "depend on", "depend upon"], "wrong": ["depends of", "depends to", "depends in", "is depend on", "depending of"] },
    { "id": "v-success", "label": "the word “success”", "reason": "vocabulary", "need": ["success", "succeed"] },
    { "id": "v-effort", "label": "the word “effort / hard work”", "reason": "vocabulary", "need": ["hard work", "effort", "how hard you work"] }
  ]
},
{
  "r": 220, "zh": "他成功地通过了考试。",
  "en": ["He succeeded in passing the exam.", "He succeeded in passing the test.", "He managed to pass the exam.", "He succeeded in passing his exam."],
  "points": [
    { "id": "succeedin", "label": "verb form (succeed in + -ing)", "reason": "verb form (succeed in + -ing)", "need": ["succeeded in passing", "managed to pass"], "wrong": ["succeeded to pass", "succeeded in pass", "succeeded passing", "succeed in passing", "succeeded in to pass"] },
    { "id": "v-exam", "label": "the word “exam / test”", "reason": "vocabulary", "need": ["exam", "test"] }
  ]
},
{
  "r": 221, "zh": "我们应该对自己的行为负责。",
  "en": ["We should be responsible for our own actions.", "We should be responsible for our actions.", "We should take responsibility for our own actions.", "We must be responsible for our own behavior."],
  "points": [
    { "id": "responsiblefor", "label": "collocation “responsible for”", "reason": "collocation (responsible for)", "need": ["responsible for our", "responsibility for our", "responsible for", "responsibility for"], "wrong": ["responsible of our", "responsible to our actions", "responsible for to our", "responsable for"] },
    { "id": "modal", "label": "modal “should + be”", "reason": "modal (should + be)", "need": ["should be responsible", "should take responsibility", "must be responsible"], "wrong": ["should responsible", "should to be responsible", "should being responsible"] },
    { "id": "v-action", "label": "the word “action / behavior”", "reason": "vocabulary", "need": ["action", "actions", "behavior", "behaviour"] }
  ]
},
{
  "r": 222, "zh": "我打算下周去看望我祖母。",
  "en": ["I plan to visit my grandmother next week.", "I am planning to visit my grandmother next week.", "I intend to visit my grandmother next week.", "I'm going to visit my grandmother next week."],
  "points": [
    { "id": "planto", "label": "verb form (plan/intend to + base verb)", "reason": "verb form (plan/intend to + base verb)", "need": ["plan to visit", "planning to visit", "intend to visit", "going to visit"], "wrong": ["plan visiting", "plan to visiting", "plan on visit", "intend visiting", "plan to visited"] },
    { "id": "nexttime", "label": "time expression “next week”", "reason": "time expression (next week)", "need": ["next week"], "wrong": ["the next week", "in next week", "on next week"] },
    { "id": "v-grandmother", "label": "the word “grandmother”", "reason": "vocabulary", "need": ["grandmother", "grandma", "granny"] }
  ]
},
{
  "r": 223, "zh": "我们偶然在街上遇见了一位老朋友。",
  "en": ["We ran into an old friend on the street.", "We came across an old friend on the street.", "We bumped into an old friend on the street.", "We ran into an old friend in the street."],
  "points": [
    { "id": "runinto", "label": "phrasal verb (run into / come across)", "reason": "phrasal verb (run into / come across)", "need": ["ran into an old friend", "came across an old friend", "bumped into an old friend"], "wrong": ["run into an old friend", "ran into with an old friend", "ran in an old friend", "met into an old friend", "ran into to an old friend"] },
    { "id": "prep-street", "label": "preposition “on/in the street”", "reason": "preposition (on/in the street)", "need": ["on the street", "in the street"], "wrong": ["at the street", "on street", "in street"] },
    { "id": "v-friend", "label": "the word “friend”", "reason": "vocabulary", "need": ["friend"] }
  ]
},
{
  "r": 224, "zh": "别忘了把灯关掉。",
  "en": ["Don't forget to turn off the lights.", "Don't forget to turn the lights off.", "Don't forget to switch off the lights.", "Remember to turn off the lights."],
  "points": [
    { "id": "turnoff", "label": "phrasal verb (turn off)", "reason": "phrasal verb (turn off)", "need": ["turn off the lights", "turn the lights off", "switch off the lights", "turn off the light", "turn them off"], "wrong": ["close the lights", "open the lights", "turn down the lights"] },
    { "id": "v-light", "label": "the word “light”", "reason": "vocabulary", "need": ["light", "lights"] }
  ]
},
{
  "r": 225, "zh": "这个项目是由一个国际团队执行的。",
  "en": ["The project was carried out by an international team.", "The project was conducted by an international team.", "This project was carried out by an international team.", "The project was carried out by a global team."],
  "points": [
    { "id": "passivecarry", "label": "passive (was carried out by)", "reason": "passive (was carried out by)", "need": ["was carried out by", "was conducted by"], "wrong": ["was carry out by", "is carried out by", "was carried out from", "was carrying out by", "were carried out by"] },
    { "id": "v-project", "label": "the word “project”", "reason": "vocabulary", "need": ["project"] },
    { "id": "v-team", "label": "the word “team”", "reason": "vocabulary", "need": ["team"] }
  ]
},
{
  "r": 226, "zh": "无论何时你需要我，我都在。",
  "en": ["Whenever you need me, I'll be there.", "Whenever you need me, I will be there.", "No matter when you need me, I'll be there.", "I'll be there whenever you need me."],
  "points": [
    { "id": "whenever", "label": "structure “whenever + present”", "reason": "structure (whenever + present)", "need": ["whenever you need me", "no matter when you need me"], "wrong": ["when ever you need me", "whenever you will need me", "whenever do you need me", "whenever you needed me"] },
    { "id": "future", "label": "future “will be there”", "reason": "tense (future will)", "need": ["will be there", "'ll be there"], "wrong": ["would be there", "am being there", "be there whenever"] }
  ]
},
{
  "r": 227, "zh": "这正是我一直在找的东西。",
  "en": ["This is exactly what I have been looking for.", "This is exactly what I've been looking for.", "This is just what I have been looking for.", "This is precisely what I have been looking for."],
  "points": [
    { "id": "whatclause", "label": "clause “what … for”", "reason": "clause (what … for)", "need": ["what i have been looking for", "what i've been looking for", "what i was looking for"], "wrong": ["what i have been looking for it", "that i have been looking for", "what i have been looking", "which i have been looking for"] },
    { "id": "perfectcont", "label": "present perfect continuous", "reason": "tense (present perfect continuous)", "need": ["have been looking for", "'ve been looking for", "had been looking for"], "wrong": ["have been look for", "am looking for", "has been looking for"] }
  ]
},
{
  "r": 228, "zh": "据报道，那位歌手将举办一场演唱会。",
  "en": ["It is reported that the singer will hold a concert.", "It's reported that the singer will give a concert.", "The singer is reported to be holding a concert.", "It is reported that the singer will perform a concert."],
  "points": [
    { "id": "reportpassive", "label": "passive (it is reported that)", "reason": "passive (it is reported that)", "need": ["it is reported that", "it's reported that", "is reported to be", "is reported to", "reportedly"], "wrong": ["it is report that", "it reported that", "it is reporting that"] },
    { "id": "future", "label": "future (will + base verb)", "reason": "tense (future will)", "need": ["will hold", "will give", "will perform", "be holding"], "wrong": ["would hold a concert", "held a concert", "will held a concert"] },
    { "id": "v-concert", "label": "the word “concert”", "reason": "vocabulary", "need": ["concert"] },
    { "id": "v-singer", "label": "the word “singer”", "reason": "vocabulary", "need": ["singer"] }
  ]
},
{
  "r": 229, "zh": "直到他离开我才意识到我爱他。",
  "en": ["Not until he left did I realize that I loved him.", "Not until he left did I realise I loved him.", "It was not until he left that I realized I loved him.", "Only after he left did I realize I loved him."],
  "points": [
    { "id": "notuntilinv", "label": "inversion (Not until … did I)", "reason": "inversion (Not until … did I)", "need": ["not until he left did i realize", "not until he left did i realise", "it was not until he left that i", "only after he left did i realize"], "wrong": ["not until he left i realized", "not until he left that i realized", "until he left i did not realize"] },
    { "id": "v-realize", "label": "the word “realize”", "reason": "vocabulary", "need": ["realize", "realise", "realized", "realised"] }
  ]
},
{
  "r": 230, "zh": "我钱花得越多，存得越少。",
  "en": ["The more money I spend, the less I save.", "The more I spend, the less I save.", "The more money I spend, the less money I save."],
  "points": [
    { "id": "morelessstruct", "label": "structure “the more … the less”", "reason": "structure (the more … the less)", "need": ["the more money i spend, the less i save", "the more i spend, the less i save", "the more money i spend, the less money i save", "the more i spend the less i save"], "wrong": ["more i spend less i save", "the more i spend, the lesser i save", "the much i spend the less i save", "the more i spend, the least i save"] },
    { "id": "v-save", "label": "the word “save / spend”", "reason": "vocabulary", "need": ["save", "spend"] }
  ]
},
{
  "r": 231, "zh": "那个站在门口的男人是我老师。",
  "en": ["The man standing at the door is my teacher.", "The man standing in the doorway is my teacher.", "The man who is standing at the door is my teacher.", "The man standing by the door is my teacher."],
  "points": [
    { "id": "reducedrel", "label": "relative clause (reduced -ing)", "reason": "relative clause (reduced -ing)", "need": ["man standing at the door", "man standing in the doorway", "man who is standing at the door", "man standing by the door"], "wrong": ["man stand at the door", "man is standing at the door is", "man stood at the door is my"] },
    { "id": "v-teacher", "label": "the word “teacher”", "reason": "vocabulary", "need": ["teacher"] }
  ]
},
{
  "r": 232, "zh": "你能帮我拿一下那个箱子吗？",
  "en": ["Could you help me carry this box?", "Can you help me carry this box?", "Could you help me to carry this box?", "Could you give me a hand with this box?"],
  "points": [
    { "id": "helpdo", "label": "verb form (help sb (to) do)", "reason": "verb form (help sb (to) do)", "need": ["carry", "give me a hand"], "wrong": ["help me carrying", "help to me carry", "help me carried", "help me to carrying", "help me carries"] },
    { "id": "modalreq", "label": "modal request (Could/Can you)", "reason": "modal (could/can you)", "need": ["could you", "can you"], "wrong": ["do you can", "you could help", "may you to"] },
    { "id": "v-box", "label": "the word “box”", "reason": "vocabulary", "need": ["box"] }
  ]
},
{
  "r": 233, "zh": "我宁可饿着也不吃那个。",
  "en": ["I would sooner starve than eat that.", "I'd sooner starve than eat that.", "I would rather starve than eat that.", "I'd rather go hungry than eat that."],
  "points": [
    { "id": "wouldsooner", "label": "structure “would sooner/rather … than”", "reason": "structure (would sooner/rather … than)", "need": ["would sooner starve than", "'d sooner starve than", "would rather starve than", "'d rather go hungry than"], "wrong": ["would sooner starve then", "would sooner to starve than", "would sooner starve that", "would sooner starve as"] },
    { "id": "v-starve", "label": "the word “starve / hungry”", "reason": "vocabulary", "need": ["starve", "hungry", "starving"] }
  ]
},
{
  "r": 234, "zh": "他一边走路一边听音乐。",
  "en": ["He listens to music while walking.", "He listens to music while he walks.", "He walks while listening to music.", "He listens to music while he is walking."],
  "points": [
    { "id": "whileing", "label": "structure “while + -ing / present”", "reason": "structure (while + -ing / present)", "need": ["while walking", "while he walks", "while listening", "while he is walking"], "wrong": ["while walk", "while he walk", "during walking", "while to walk"] },
    { "id": "listento", "label": "collocation “listen to”", "reason": "collocation (listen to)", "need": ["listens to music", "listen to music", "listening to music"], "wrong": ["listens music", "hears to music", "listen music"] }
  ]
},
{
  "r": 235, "zh": "我的电脑出了点问题。",
  "en": ["There's something wrong with my computer.", "There is something wrong with my computer.", "Something is wrong with my computer.", "Something's wrong with my computer."],
  "points": [
    { "id": "somethingwrong", "label": "structure “something wrong with”", "reason": "structure (something wrong with)", "need": ["something wrong with my computer", "something is wrong with my computer", "wrong with my computer"], "wrong": ["something wrong in my computer", "something wrong of my computer", "there is something wrong my computer", "something wrong to my computer"] },
    { "id": "v-computer", "label": "the word “computer”", "reason": "vocabulary", "need": ["computer"] }
  ]
},
{
  "r": 236, "zh": "他连走路都困难，更别说跑步了。",
  "en": ["He can hardly walk, let alone run.", "He can barely walk, let alone run.", "He has trouble walking, let alone running."],
  "points": [
    { "id": "letalone", "label": "structure “let alone + verb”", "reason": "structure (let alone + verb)", "need": ["let alone run", "let alone running"], "wrong": ["let alone to run", "let it alone run", "not to mention to run", "let alone he runs"] },
    { "id": "hardly", "label": "adverb “hardly / barely”", "reason": "adverb (hardly / barely)", "need": ["can hardly walk", "can barely walk", "has trouble walking"], "wrong": ["can hardly to walk", "can't hardly walk", "hardly can walk", "can hard walk"] }
  ]
},
{
  "r": 237, "zh": "难怪你这么累，你工作了一整天。",
  "en": ["No wonder you're so tired; you've worked all day.", "It's no wonder you're so tired; you worked all day.", "No wonder you are so tired, you have worked all day.", "No wonder you're tired, you've been working all day."],
  "points": [
    { "id": "nowonder", "label": "structure “no wonder …”", "reason": "structure (no wonder …)", "need": ["no wonder you're so tired", "no wonder you are so tired", "it's no wonder you're so tired", "no wonder you're tired"], "wrong": ["no wander you're so tired", "no wonder are you so tired", "its a no wonder you so tired"] },
    { "id": "perfect", "label": "tense (present perfect / past)", "reason": "tense (worked all day)", "need": ["you've worked all day", "you have worked all day", "you've been working all day", "worked all day"], "wrong": ["you have work all day", "you been working all day"] }
  ]
},
{
  "r": 238, "zh": "我再也受不了这种噪音了。",
  "en": ["I can't stand this noise any longer.", "I can't stand this noise anymore.", "I can't bear this noise any longer.", "I can no longer stand this noise."],
  "points": [
    { "id": "cantstand", "label": "verb form (can't stand / bear)", "reason": "verb form (can't stand / bear)", "need": ["can't stand this noise", "can't bear this noise", "can no longer stand"], "wrong": ["can't stand to this noise", "don't can stand this noise", "can't standing this noise"] },
    { "id": "anylonger", "label": "adverb “any longer / anymore”", "reason": "adverb (any longer / anymore)", "need": ["any longer", "anymore", "any more", "no longer"], "wrong": ["any more longer", "no more longer", "not longer"] },
    { "id": "v-noise", "label": "the word “noise”", "reason": "vocabulary", "need": ["noise"] }
  ]
},
{
  "r": 239, "zh": "他迟到的可能性很大。",
  "en": ["He is likely to be late.", "He's likely to be late.", "He is bound to be late.", "He will probably be late."],
  "points": [
    { "id": "likelyto", "label": "structure “be likely/bound to + base”", "reason": "structure (be likely/bound to + base)", "need": ["likely to be late", "bound to be late", "will probably be late", "probably be late"], "wrong": ["likely be late", "likely to being late", "likely that he late", "likely to late", "bound to being late"] },
    { "id": "v-late", "label": "the word “late”", "reason": "vocabulary", "need": ["late"] }
  ]
},
{
  "r": 240, "zh": "你想喝点什么吗？",
  "en": ["Would you like something to drink?", "Would you like anything to drink?", "Do you want something to drink?", "Would you like a drink?"],
  "points": [
    { "id": "wouldlike", "label": "structure “would you like + noun / to”", "reason": "structure (would you like + noun / to)", "need": ["would you like something to drink", "would you like anything to drink", "would you like a drink", "do you want something to drink"], "wrong": ["do you would like a drink", "are you like a drink", "would you liked a drink"] },
    { "id": "v-drink", "label": "the word “drink”", "reason": "vocabulary", "need": ["drink"] }
  ]
},
{
  "r": 241, "zh": "我把这件事告诉了他。",
  "en": ["I told him about it.", "I told him the news.", "I told him what happened.", "I told him about the matter."],
  "points": [
    { "id": "tellsb", "label": "verb pattern (tell sb (about) sth)", "reason": "verb pattern (tell sb (about) sth)", "need": ["told him about", "told him the news", "told him what happened", "told him about the matter"], "wrong": ["told to him about", "said him about", "spoke him about", "said to him the news"] },
    { "id": "v-tell", "label": "the word “tell”", "reason": "vocabulary", "need": ["told", "tell"] }
  ]
},
{
  "r": 242, "zh": "这本书是用简单的英语写的。",
  "en": ["This book is written in simple English.", "The book is written in plain English.", "This book is written in easy English.", "This book was written in simple English."],
  "points": [
    { "id": "writtenin", "label": "passive (written in)", "reason": "passive (written in)", "need": ["is written in", "was written in"], "wrong": ["is wrote in", "is written by simple english", "is writing in", "is written with simple english"] },
    { "id": "v-english", "label": "the word “English”", "reason": "vocabulary", "need": ["english"] }
  ]
},
{
  "r": 243, "zh": "无论发生什么，保持冷静。",
  "en": ["Whatever happens, stay calm.", "No matter what happens, stay calm.", "Whatever happens, keep calm.", "No matter what happens, remain calm."],
  "points": [
    { "id": "whatever", "label": "structure “whatever + present”", "reason": "structure (whatever + present)", "need": ["whatever happens", "no matter what happens"], "wrong": ["whatever happen", "what ever happens", "whatever will happen", "whatever happened", "no matter what happen"] },
    { "id": "staycalm", "label": "collocation “stay calm”", "reason": "collocation (stay calm)", "need": ["stay calm", "keep calm", "remain calm"], "wrong": ["stay calmly", "be calm down", "stay in calm", "keep calmly"] }
  ]
},
{
  "r": 244, "zh": "我们应该保护环境。",
  "en": ["We should protect the environment.", "We ought to protect the environment.", "We should protect our environment.", "We must protect the environment."],
  "points": [
    { "id": "modal", "label": "modal “should + base verb”", "reason": "modal (should + base verb)", "need": ["should protect", "ought to protect", "must protect"], "wrong": ["should to protect", "should protecting", "should protects", "must to protect"] },
    { "id": "v-environment", "label": "the word “environment”", "reason": "vocabulary", "need": ["environment"] }
  ]
},
{
  "r": 245, "zh": "他对我撒了谎。",
  "en": ["He lied to me.", "He told me a lie.", "He lied to my face.", "He didn't tell me the truth."],
  "points": [
    { "id": "lieto", "label": "collocation “lie to sb”", "reason": "collocation (lie to sb)", "need": ["lied to me", "told me a lie", "lied to my face", "didn't tell me the truth"], "wrong": ["lied me", "lied at me", "lied on me", "told me lie"] },
    { "id": "v-lie", "label": "the word “lie / truth”", "reason": "vocabulary", "need": ["lie", "lied", "truth"] }
  ]
},
{
  "r": 246, "zh": "多亏了你的帮助，我们按时完成了。",
  "en": ["Thanks to your help, we finished on time.", "Thanks to your help, we finished it on time.", "We finished on time thanks to your help.", "Thanks to you, we finished on time."],
  "points": [
    { "id": "thanksto", "label": "preposition “thanks to + noun”", "reason": "preposition (thanks to + noun)", "need": ["thanks to your help", "thanks to you"], "wrong": ["thank to your help", "thanks of your help", "thank you to your help"] },
    { "id": "ontime", "label": "collocation “on time”", "reason": "collocation (on time)", "need": ["on time"], "wrong": ["in time", "on the time", "at time"] },
    { "id": "v-finish", "label": "the word “finish”", "reason": "vocabulary", "need": ["finish", "finished", "completed"] }
  ]
},
{
  "r": 247, "zh": "请问洗手间在哪里？",
  "en": ["Excuse me, where is the bathroom?", "Excuse me, where is the restroom?", "Excuse me, where's the toilet?", "Excuse me, where can I find the bathroom?"],
  "points": [
    { "id": "whereis", "label": "question (where is …)", "reason": "question (where is …)", "need": ["where is the bathroom", "where is the restroom", "where's the toilet", "where can i find the bathroom", "where is the toilet"], "wrong": ["where the bathroom is", "where is have the bathroom", "where bathroom is", "where does the bathroom"] },
    { "id": "excuseme", "label": "phrase “excuse me”", "reason": "phrase (excuse me)", "need": ["excuse me"], "wrong": ["excuse me to ask", "sorry me", "excuse i"] },
    { "id": "v-bathroom", "label": "the word “bathroom”", "reason": "vocabulary", "need": ["bathroom", "restroom", "toilet"] }
  ]
},
{
  "r": 248, "zh": "我想点一份牛排。",
  "en": ["I'd like to order a steak.", "I would like to order a steak.", "I'd like to order steak.", "Can I order a steak?"],
  "points": [
    { "id": "wouldliketo", "label": "verb form (would like to + base)", "reason": "verb form (would like to + base)", "need": ["like to order", "can i order", "want to order"], "wrong": ["like order a steak", "like to ordering", "would like order a steak", "like ordering a steak"] },
    { "id": "v-steak", "label": "the word “steak”", "reason": "vocabulary", "need": ["steak"] }
  ]
},
{
  "r": 249, "zh": "这件多少钱？",
  "en": ["How much is this?", "How much does this cost?", "How much is it?", "What's the price of this?"],
  "points": [
    { "id": "howmuch", "label": "question (how much …)", "reason": "question (how much …)", "need": ["how much is this", "how much does this cost", "how much is it", "what's the price of this", "how much for this"], "wrong": ["how much this is", "how much cost this", "how many is this", "how much this cost", "how much does this costs"] },
    { "id": "v-price", "label": "the word “price / cost”", "reason": "vocabulary", "need": ["price", "cost", "much"] }
  ]
},
{
  "r": 250, "zh": "我对花生过敏。",
  "en": ["I'm allergic to peanuts.", "I am allergic to peanuts.", "I'm allergic to nuts.", "I have an allergy to peanuts."],
  "points": [
    { "id": "allergicto", "label": "collocation “allergic to”", "reason": "collocation (allergic to)", "need": ["allergic to peanuts", "allergic to nuts", "allergy to peanuts", "allergic to"], "wrong": ["allergic of peanuts", "allergic with peanuts", "allergic from peanuts", "allergic for peanuts"] },
    { "id": "v-peanut", "label": "the word “peanut”", "reason": "vocabulary", "need": ["peanut", "peanuts", "nut", "nuts"] }
  ]
},
{
  "r": 251, "zh": "火车几点出发？",
  "en": ["What time does the train leave?", "What time does the train depart?", "When does the train leave?", "What time is the train leaving?"],
  "points": [
    { "id": "whattime", "label": "question (what time does …)", "reason": "question (what time does …)", "need": ["what time does the train leave", "what time does the train depart", "when does the train leave", "what time is the train leaving"], "wrong": ["what time the train leaves", "what time does the train leaves", "what time do the train leave", "when the train leaves"] },
    { "id": "v-train", "label": "the word “train”", "reason": "vocabulary", "need": ["train"] }
  ]
},
{
  "r": 252, "zh": "你能推荐一家好餐厅吗？",
  "en": ["Can you recommend a good restaurant?", "Could you recommend a good restaurant?", "Can you suggest a good restaurant?", "Do you know a good restaurant?"],
  "points": [
    { "id": "recommend", "label": "verb pattern (recommend sth)", "reason": "verb pattern (recommend sth)", "need": ["recommend a good restaurant", "suggest a good restaurant", "know a good restaurant", "recommend me a good restaurant"], "wrong": ["recommend to go a restaurant", "recommend going a restaurant", "recommend for a good restaurant"] },
    { "id": "modalreq", "label": "modal request (Can/Could you)", "reason": "modal (can/could you)", "need": ["can you", "could you", "do you"], "wrong": ["do you can", "you can recommend", "may you"] },
    { "id": "v-restaurant", "label": "the word “restaurant”", "reason": "vocabulary", "need": ["restaurant"] }
  ]
},
{
  "r": 253, "zh": "我头疼。",
  "en": ["I have a headache.", "I've got a headache.", "My head hurts.", "I have got a headache."],
  "points": [
    { "id": "haveache", "label": "structure (have a headache / head hurts)", "reason": "structure (have a headache / head hurts)", "need": ["have a headache", "'ve got a headache", "my head hurts", "have got a headache"], "wrong": ["have headache", "i am headache", "have a head pain", "my head is hurt"] },
    { "id": "v-head", "label": "the word “head / headache”", "reason": "vocabulary", "need": ["head", "headache"] }
  ]
},
{
  "r": 254, "zh": "外面很冷，多穿点衣服。",
  "en": ["It's cold outside, dress warmly.", "It's cold outside, put on more clothes.", "It's cold outside, wear warm clothes.", "It's cold outside, bundle up."],
  "points": [
    { "id": "imperative", "label": "imperative + adverb (dress warmly)", "reason": "imperative + adverb (dress warmly)", "need": ["dress warmly", "put on more clothes", "wear warm clothes", "bundle up", "wear more clothes"], "wrong": ["dress warm", "wear more clothe", "dress yourself warm", "wear much clothes"] },
    { "id": "v-cold", "label": "the word “cold”", "reason": "vocabulary", "need": ["cold"] },
    { "id": "v-clothes", "label": "the word “clothes / warm”", "reason": "vocabulary", "need": ["clothes", "clothing", "warmly", "warm"] }
  ]
},
{
  "r": 255, "zh": "你考虑过出国留学吗？",
  "en": ["Have you considered studying abroad?", "Have you thought about studying abroad?", "Have you considered going abroad to study?", "Did you consider studying abroad?"],
  "points": [
    { "id": "considering", "label": "verb form (consider + -ing)", "reason": "verb form (consider + -ing)", "need": ["considered studying", "thought about studying", "considered going abroad", "consider studying"], "wrong": ["considered to study", "considered study abroad", "thought studying abroad", "considered studied"] },
    { "id": "abroad", "label": "collocation (study abroad — no preposition)", "reason": "collocation (study abroad)", "need": ["studying abroad", "study abroad", "abroad to study", "go abroad"], "wrong": ["studying in abroad", "study in abroad", "to abroad", "studying at abroad"] }
  ]
},
{
  "r": 256, "zh": "我们必须在五点前离开。",
  "en": ["We must leave before five.", "We have to leave before five o'clock.", "We need to leave by five.", "We must leave before 5."],
  "points": [
    { "id": "mustleave", "label": "modal (must / have to + base)", "reason": "modal (must / have to + base)", "need": ["must leave", "have to leave", "need to leave"], "wrong": ["must to leave", "must leaving", "have leave", "must leaves"] },
    { "id": "prep-time", "label": "preposition (before/by + time)", "reason": "preposition (before/by + time)", "need": ["before five", "before 5", "by five", "before five o'clock"], "wrong": ["before of five", "until five we leave", "at before five"] }
  ]
},
{
  "r": 257, "zh": "这家商店每天营业到晚上十点。",
  "en": ["This shop is open until 10 p.m. every day.", "The store is open until 10 pm every day.", "This shop stays open until 10 p.m. daily.", "The shop opens until 10 p.m. every day."],
  "points": [
    { "id": "presenthabit", "label": "tense (present simple — opening hours)", "reason": "tense (present simple)", "need": ["is open until", "stays open until", "opens until"], "wrong": ["is opening until", "is opened until", "are open until"] },
    { "id": "v-shop", "label": "the word “shop / store”", "reason": "vocabulary", "need": ["shop", "store"] }
  ]
},
{
  "r": 258, "zh": "别担心，我会照顾好孩子们的。",
  "en": ["Don't worry, I'll look after the kids.", "Don't worry, I'll take care of the kids.", "Don't worry, I will look after the children.", "Don't worry, I'll watch the kids."],
  "points": [
    { "id": "lookafter", "label": "phrasal verb (look after / take care of)", "reason": "phrasal verb (look after / take care of)", "need": ["look after the kids", "take care of the kids", "look after the children", "watch the kids", "look after them"], "wrong": ["look after of the kids", "take care the kids", "look after for the kids", "care the kids"] },
    { "id": "future", "label": "future “I'll …”", "reason": "tense (future will)", "need": ["i'll look", "i will look", "i'll take care", "i will take care", "i'll watch"], "wrong": ["i look after the kids", "i looking after", "i would look after"] },
    { "id": "v-kid", "label": "the word “kid / child”", "reason": "vocabulary", "need": ["kid", "kids", "child", "children"] }
  ]
},
{
  "r": 259, "zh": "我喝咖啡不加糖。",
  "en": ["I drink coffee without sugar.", "I drink my coffee without sugar.", "I take my coffee without sugar.", "I have my coffee without sugar."],
  "points": [
    { "id": "without", "label": "preposition (without + noun)", "reason": "preposition (without + noun)", "need": ["without sugar"], "wrong": ["without of sugar", "without sugars", "with no sugars", "without to sugar"] },
    { "id": "v-coffee", "label": "the word “coffee”", "reason": "vocabulary", "need": ["coffee"] },
    { "id": "v-sugar", "label": "the word “sugar”", "reason": "vocabulary", "need": ["sugar"] }
  ]
},
{
  "r": 260, "zh": "你介意把盐递给我吗？",
  "en": ["Would you mind passing me the salt?", "Could you pass me the salt?", "Would you mind passing the salt?", "Can you pass the salt, please?"],
  "points": [
    { "id": "mindpassing", "label": "verb form (would you mind + -ing)", "reason": "verb form (would you mind + -ing)", "need": ["mind passing", "you pass the salt", "pass me the salt"], "wrong": ["mind to pass the salt", "mind pass the salt", "mind you pass the salt"] },
    { "id": "v-salt", "label": "the word “salt”", "reason": "vocabulary", "need": ["salt"] }
  ]
},
{
  "r": 261, "zh": "自从大学毕业后我就一直在找工作。",
  "en": ["I've been looking for a job since I graduated.", "I have been looking for a job since I graduated from college.", "I've been job hunting since I graduated.", "I have been searching for a job since graduation."],
  "points": [
    { "id": "perfectcontsince", "label": "tense (present perfect continuous + since)", "reason": "tense (present perfect continuous + since)", "need": ["i've been looking for a job since", "have been looking for a job since", "i've been job hunting since", "have been searching for a job since"], "wrong": ["i am looking for a job since", "i looked for a job since", "i've been look for a job since", "i was looking for a job since"] },
    { "id": "v-job", "label": "the word “job”", "reason": "vocabulary", "need": ["job", "work"] },
    { "id": "v-graduate", "label": "the word “graduate”", "reason": "vocabulary", "need": ["graduated", "graduation", "graduate"] }
  ]
},
{
  "r": 262, "zh": "这是我吃过的最辣的菜。",
  "en": ["This is the spiciest dish I have ever eaten.", "This is the spiciest food I've ever had.", "This is the hottest dish I have ever eaten.", "It's the spiciest dish I have ever tasted."],
  "points": [
    { "id": "super", "label": "superlative (spiciest)", "reason": "superlative (spiciest)", "need": ["spiciest dish", "spiciest food", "hottest dish"], "wrong": ["most spicy dish", "more spicy dish", "most spiciest dish", "spicyest dish"] },
    { "id": "perfectever", "label": "tense (present perfect + ever)", "reason": "tense (present perfect + ever)", "need": ["ever eaten", "ever had", "ever tasted"], "wrong": ["i ever eat", "i have ever ate", "i did ever eat", "i have ever eated"] },
    { "id": "v-dish", "label": "the word “dish / food”", "reason": "vocabulary", "need": ["dish", "food"] }
  ]
},
{
  "r": 263, "zh": "飞机正点起飞。",
  "en": ["The plane took off on time.", "The plane took off on schedule.", "The flight took off on time.", "The plane departed on time."],
  "points": [
    { "id": "takeoff", "label": "phrasal verb (take off) + past", "reason": "phrasal verb (take off) + past", "need": ["took off on time", "took off on schedule", "departed on time"], "wrong": ["take off on time", "took of on time", "took off in time", "taked off on time", "was took off"] },
    { "id": "v-plane", "label": "the word “plane / flight”", "reason": "vocabulary", "need": ["plane", "flight", "aircraft"] }
  ]
},
{
  "r": 264, "zh": "多喝水对健康有好处。",
  "en": ["Drinking more water is good for your health.", "Drinking plenty of water is good for your health.", "Drinking more water is good for you.", "Drinking lots of water is good for the health."],
  "points": [
    { "id": "gerundsubj", "label": "gerund as subject (Drinking … is)", "reason": "gerund as subject (Drinking … is)", "need": ["drinking more water is", "drinking plenty of water is", "drinking lots of water is"], "wrong": ["drink more water is", "to drink more water is", "drinking more water are", "drinking more water it is"] },
    { "id": "goodfor", "label": "collocation (good for)", "reason": "collocation (good for)", "need": ["good for your health", "good for you", "good for the health", "good for health"], "wrong": ["good to your health", "good for your healthy", "good at your health", "benefit for your health"] },
    { "id": "v-water", "label": "the word “water”", "reason": "vocabulary", "need": ["water"] }
  ]
},
{
  "r": 265, "zh": "我的航班晚点了两个小时。",
  "en": ["My flight was delayed by two hours.", "My flight has been delayed by two hours.", "My flight was delayed for two hours.", "My flight got delayed by two hours."],
  "points": [
    { "id": "delayed", "label": "passive (was delayed)", "reason": "passive (was delayed)", "need": ["was delayed", "has been delayed", "got delayed"], "wrong": ["was delay", "is delaying", "was delayed since two hours", "delayed two hours"] },
    { "id": "prep-by", "label": "preposition (by/for + duration)", "reason": "preposition (by/for + duration)", "need": ["by two hours", "for two hours"], "wrong": ["since two hours", "of two hours", "in two hours"] },
    { "id": "v-flight", "label": "the word “flight”", "reason": "vocabulary", "need": ["flight", "plane"] }
  ]
},
{
  "r": 266, "zh": "如果发烧了，你应该去看医生。",
  "en": ["If you have a fever, you should see a doctor.", "If you have a fever, you should go to the doctor.", "You should see a doctor if you have a fever.", "If you've got a fever, you should see a doctor."],
  "points": [
    { "id": "cond1", "label": "conditional (if + present)", "reason": "conditional (if + present)", "need": ["if you have a fever", "if you've got a fever"], "wrong": ["if you will have a fever", "if you had a fever you should", "if you would have a fever"] },
    { "id": "should", "label": "modal (should + base)", "reason": "modal (should + base)", "need": ["should see a doctor", "should go to the doctor"], "wrong": ["should to see a doctor", "should seeing a doctor", "should saw a doctor"] },
    { "id": "v-fever", "label": "the word “fever”", "reason": "vocabulary", "need": ["fever"] }
  ]
},
{
  "r": 267, "zh": "我正在考虑换一份新工作。",
  "en": ["I'm thinking about changing jobs.", "I am thinking of changing jobs.", "I'm thinking about getting a new job.", "I'm considering changing my job."],
  "points": [
    { "id": "thinkabout", "label": "verb form (think about + -ing)", "reason": "verb form (think about + -ing)", "need": ["thinking about changing", "thinking of changing", "thinking about getting", "considering changing"], "wrong": ["thinking about to change", "thinking to change", "thinking about change jobs", "think about changing"] },
    { "id": "v-job", "label": "the word “job”", "reason": "vocabulary", "need": ["job", "jobs", "work"] }
  ]
},
{
  "r": 268, "zh": "我厌倦了每天做同样的事。",
  "en": ["I'm tired of doing the same thing every day.", "I'm sick of doing the same thing every day.", "I'm fed up with doing the same thing every day.", "I am tired of the same routine every day."],
  "points": [
    { "id": "tiredof", "label": "verb form (tired of / sick of + -ing)", "reason": "verb form (tired of / sick of + -ing)", "need": ["tired of doing", "sick of doing", "fed up with doing", "tired of the same"], "wrong": ["tired of do", "tired to do the same", "tired of to do", "sick of to do"] },
    { "id": "sameverb", "label": "collocation (the same thing)", "reason": "collocation (the same thing)", "need": ["the same thing", "the same routine", "same thing"], "wrong": ["a same thing", "same things every", "the sames thing"] }
  ]
},
{
  "r": 269, "zh": "今天能做的事别拖到明天。",
  "en": ["Don't put off until tomorrow what you can do today.", "Don't put off till tomorrow what you can do today.", "Don't delay until tomorrow what you can do today.", "Don't leave for tomorrow what you can do today."],
  "points": [
    { "id": "putoff", "label": "phrasal verb (put off)", "reason": "phrasal verb (put off)", "need": ["put off until tomorrow", "put off till tomorrow", "delay until tomorrow", "leave for tomorrow"], "wrong": ["put off to tomorrow", "put of until tomorrow", "postpone to tomorrow"] },
    { "id": "canmodal", "label": "modal (can do today)", "reason": "modal (can do today)", "need": ["you can do today", "can do today"], "wrong": ["you can to do today", "you could doing today", "you can did today"] }
  ]
},
{
  "r": 270, "zh": "自从我搬来这座城市，交到了很多朋友。",
  "en": ["I've made many friends since I moved to this city.", "I have made a lot of friends since I moved to this city.", "Since I moved to this city, I've made many friends.", "I've made lots of friends since moving here."],
  "points": [
    { "id": "perfectsince", "label": "tense (present perfect + since)", "reason": "tense (present perfect + since)", "need": ["i've made many friends since", "have made a lot of friends since", "i've made lots of friends since", "have made many friends since"], "wrong": ["i made many friends since", "i am making many friends since", "i've make many friends since", "i was making friends since"] },
    { "id": "moveto", "label": "collocation (move to)", "reason": "collocation (move to)", "need": ["moved to this city", "moved here", "moving here", "moved to the city"], "wrong": ["moved in this city", "moved at this city", "moved to here", "move to this city since"] }
  ]
},
{
  "r": 271, "zh": "这家公司雇佣了五百多名员工。",
  "en": ["The company employs more than 500 people.", "The company employs over 500 employees.", "The company has more than 500 employees.", "The company hires more than 500 workers."],
  "points": [
    { "id": "morethan", "label": "structure (more than + number)", "reason": "structure (more than + number)", "need": ["more than 500", "over 500", "more than five hundred"], "wrong": ["more than 500 of people", "more as 500", "over than 500", "much more than 500"] },
    { "id": "employ", "label": "the word “employ / employees”", "reason": "vocabulary", "need": ["employs", "employees", "hires", "workers", "staff", "people"] },
    { "id": "v-company", "label": "the word “company”", "reason": "vocabulary", "need": ["company"] }
  ]
},
{
  "r": 272, "zh": "请慢点说，我听不懂。",
  "en": ["Please speak slowly, I can't understand.", "Please speak more slowly, I don't understand.", "Could you speak slowly? I can't understand you.", "Please slow down, I can't follow you."],
  "points": [
    { "id": "adverb", "label": "adverb (speak slowly)", "reason": "adverb (speak slowly)", "need": ["speak slowly", "speak more slowly", "slow down"], "wrong": ["speak slow", "speak slowlier", "talk slow", "speak more slow"] },
    { "id": "understand", "label": "the word “understand”", "reason": "vocabulary", "need": ["can't understand", "don't understand", "can't follow"] }
  ]
},
{
  "r": 273, "zh": "我们应该互相帮助。",
  "en": ["We should help each other.", "We should help one another.", "We ought to help each other.", "We should help one another out."],
  "points": [
    { "id": "eachother", "label": "pronoun (each other)", "reason": "pronoun (each other)", "need": ["help each other", "help one another"], "wrong": ["help us each other", "help each one another", "help themselves each other"] },
    { "id": "modal", "label": "modal (should + base)", "reason": "modal (should + base)", "need": ["should help", "ought to help"], "wrong": ["should to help", "should helping", "should helps"] }
  ]
},
{
  "r": 274, "zh": "别紧张，深呼吸。",
  "en": ["Don't be nervous, take a deep breath.", "Relax, take a deep breath.", "Don't be nervous, breathe deeply.", "Calm down and take a deep breath."],
  "points": [
    { "id": "imperative", "label": "imperative (Don't be …)", "reason": "imperative (Don't be …)", "need": ["don't be nervous", "relax", "calm down"], "wrong": ["don't be nervously", "no be nervous", "not be nervous", "you don't be nervous"] },
    { "id": "breath", "label": "collocation (take a deep breath)", "reason": "collocation (take a deep breath)", "need": ["take a deep breath", "breathe deeply"], "wrong": ["make a deep breath", "get a deep breath", "do a deep breath"] }
  ]
},
{
  "r": 275, "zh": "我把车停在了停车场。",
  "en": ["I parked my car in the parking lot.", "I parked the car in the car park.", "I left my car in the parking lot.", "I parked my car in the garage."],
  "points": [
    { "id": "park", "label": "verb (parked — past)", "reason": "verb (parked — past)", "need": ["parked my car", "parked the car", "left my car", "parked"], "wrong": ["parked my car at the parking", "i park my car", "parking my car in", "i parked my car on"] },
    { "id": "prep-in", "label": "preposition (in the parking lot)", "reason": "preposition (in the parking lot)", "need": ["in the parking lot", "in the car park", "in the garage"], "wrong": ["at the parking lot", "on the parking lot", "in parking lot"] },
    { "id": "v-car", "label": "the word “car”", "reason": "vocabulary", "need": ["car"] }
  ]
},
{
  "r": 276, "zh": "我等不及要见你了。",
  "en": ["I can't wait to see you.", "I can't wait to meet you.", "I can hardly wait to see you.", "I'm looking forward to seeing you."],
  "points": [
    { "id": "cantwait", "label": "verb form (can't wait to + base)", "reason": "verb form (can't wait to + base)", "need": ["can't wait to see you", "can't wait to meet you", "can hardly wait to see", "looking forward to seeing"], "wrong": ["can't wait seeing you", "can't wait for see you", "can't wait to seeing you", "can't wait see you", "looking forward to see you"] },
    { "id": "v-see", "label": "the word “see / meet”", "reason": "vocabulary", "need": ["see", "meet", "seeing"] }
  ]
},
{
  "r": 277, "zh": "这是个秘密，别告诉任何人。",
  "en": ["It's a secret, don't tell anyone.", "It's a secret, don't tell anybody.", "This is a secret, don't tell anyone.", "It's a secret, keep it to yourself."],
  "points": [
    { "id": "dontany", "label": "negation (don't … anyone)", "reason": "negation (don't … anyone)", "need": ["don't tell anyone", "don't tell anybody", "keep it to yourself"], "wrong": ["don't tell no one", "don't tell to anyone", "don't tell someone", "not tell anyone"] },
    { "id": "v-secret", "label": "the word “secret”", "reason": "vocabulary", "need": ["secret"] }
  ]
},
{
  "r": 278, "zh": "你应该为考试做好准备。",
  "en": ["You should prepare for the exam.", "You should get ready for the exam.", "You should prepare for the test.", "You ought to prepare for the exam."],
  "points": [
    { "id": "preparefor", "label": "collocation (prepare for)", "reason": "collocation (prepare for)", "need": ["prepare for the exam", "get ready for the exam", "prepare for the test"], "wrong": ["prepare to the exam", "prepare the exam", "prepare for to the exam", "prepare yourself the exam"] },
    { "id": "v-exam", "label": "the word “exam / test”", "reason": "vocabulary", "need": ["exam", "test"] }
  ]
},
{
  "r": 279, "zh": "我从来不吃早饭。",
  "en": ["I never eat breakfast.", "I never have breakfast.", "I don't usually eat breakfast.", "I rarely eat breakfast."],
  "points": [
    { "id": "frequency", "label": "adverb (never / rarely + verb)", "reason": "adverb (never / rarely + verb)", "need": ["never eat breakfast", "never have breakfast", "don't usually eat", "rarely eat breakfast"], "wrong": ["eat never breakfast", "i eat never breakfast", "never not eat breakfast", "i never eating breakfast"] },
    { "id": "v-breakfast", "label": "the word “breakfast”", "reason": "vocabulary", "need": ["breakfast"] }
  ]
},
{
  "r": 280, "zh": "你能借我一支笔吗？",
  "en": ["Can you lend me a pen?", "Could you lend me a pen?", "Can I borrow a pen?", "Could I borrow your pen?"],
  "points": [
    { "id": "borrowlend", "label": "verb pattern (lend sb sth / borrow sth)", "reason": "verb pattern (lend sb sth / borrow sth)", "need": ["lend me a pen", "can i borrow a pen", "borrow your pen", "lend me your pen"], "wrong": ["borrow me a pen", "lend a pen from you", "can you borrow me a pen", "lend me to a pen"] },
    { "id": "v-pen", "label": "the word “pen”", "reason": "vocabulary", "need": ["pen"] }
  ]
},
{
  "r": 281, "zh": "房子着火了，快跑！",
  "en": ["The house is on fire, run!", "The house is on fire, get out!", "The house is burning, run!", "The house is on fire, run quickly!"],
  "points": [
    { "id": "onfire", "label": "collocation (on fire)", "reason": "collocation (on fire)", "need": ["on fire", "is burning"], "wrong": ["in fire", "on the fire", "is on the fire", "burning fire"] },
    { "id": "imperative", "label": "imperative (run!)", "reason": "imperative (run!)", "need": ["run", "get out", "run quickly"], "wrong": ["running", "you run", "to run"] },
    { "id": "v-house", "label": "the word “house”", "reason": "vocabulary", "need": ["house"] }
  ]
},
{
  "r": 282, "zh": "我手机没电了。",
  "en": ["My phone is dead.", "My phone has run out of battery.", "My phone battery is dead.", "My phone ran out of battery."],
  "points": [
    { "id": "ranout", "label": "phrase (run out of / dead battery)", "reason": "phrase (run out of / dead battery)", "need": ["is out of battery", "has run out of battery", "have run out of battery", "ran out of battery", "phone is dead", "battery is dead"], "wrong": ["run out battery", "run out of the battery", "is run out of battery", "run off battery", "phone is died"] },
    { "id": "v-phone", "label": "the word “phone / battery”", "reason": "vocabulary", "need": ["phone", "battery"] }
  ]
},
{
  "r": 283, "zh": "我每天乘地铁上班。",
  "en": ["I take the subway to work every day.", "I go to work by subway every day.", "I commute to work by subway.", "I take the metro to work every day."],
  "points": [
    { "id": "bytransport", "label": "preposition (by + transport)", "reason": "preposition (by + transport)", "need": ["by subway", "by metro", "by train", "take the subway", "take the metro"], "wrong": ["by the subway", "with subway", "on subway every", "by a subway"] },
    { "id": "presenthabit", "label": "tense (present simple habit)", "reason": "tense (present simple habit)", "need": ["i take the subway", "i go to work", "i commute"], "wrong": ["i am taking the subway every day", "i took the subway every day", "i takes the subway"] },
    { "id": "v-work", "label": "the word “work”", "reason": "vocabulary", "need": ["work"] }
  ]
},
{
  "r": 284, "zh": "外面正在下大雨。",
  "en": ["It's raining heavily outside.", "It is raining hard outside.", "It's pouring outside.", "It's raining heavily outside right now."],
  "points": [
    { "id": "raincont", "label": "tense (present continuous)", "reason": "tense (present continuous)", "need": ["it's raining", "it is raining", "it's pouring"], "wrong": ["it rains heavily outside", "it raining outside", "it's rain heavily"] },
    { "id": "adverb", "label": "adverb (heavily / hard)", "reason": "adverb (heavily / hard)", "need": ["raining heavily", "raining hard", "pouring"], "wrong": ["raining heavy", "raining strong", "raining big"] }
  ]
},
{
  "r": 285, "zh": "你多大了？",
  "en": ["How old are you?", "What is your age?", "May I ask how old you are?", "How old are you now?"],
  "points": [
    { "id": "howold", "label": "question (how old are you)", "reason": "question (how old are you)", "need": ["how old are you", "what is your age", "what's your age", "ask how old you are"], "wrong": ["how many years you have", "how old do you have", "how age are you", "how many years old are you"] }
  ]
},
{
  "r": 286, "zh": "我妹妹比我小三岁。",
  "en": ["My sister is three years younger than me.", "My sister is three years younger than I am.", "My younger sister is three years younger than me.", "My sister is 3 years younger than me."],
  "points": [
    { "id": "younger", "label": "comparative (younger than)", "reason": "comparative (younger than)", "need": ["three years younger than", "3 years younger than", "years younger than me"], "wrong": ["three years more young than", "younger three years than", "more younger than", "three years young than"] },
    { "id": "v-sister", "label": "the word “sister”", "reason": "vocabulary", "need": ["sister"] }
  ]
},
{
  "r": 287, "zh": "请把这个翻译成英文。",
  "en": ["Please translate this into English.", "Could you translate this into English?", "Please translate this to English.", "Please put this into English."],
  "points": [
    { "id": "translateinto", "label": "collocation (translate into)", "reason": "collocation (translate into)", "need": ["translate this into english", "translate this to english", "put this into english", "translate it into english"], "wrong": ["translate this in english", "translate this english", "translate this for english", "translate this on english"] },
    { "id": "v-english", "label": "the word “English”", "reason": "vocabulary", "need": ["english"] }
  ]
},
{
  "r": 288, "zh": "别让我失望。",
  "en": ["Don't let me down.", "Please don't let me down.", "Don't disappoint me.", "Don't let me down again."],
  "points": [
    { "id": "letdown", "label": "phrasal verb (let sb down)", "reason": "phrasal verb (let sb down)", "need": ["let me down", "disappoint me"], "wrong": ["let down me", "let me down to", "let me fall down", "let me feel down"] },
    { "id": "imperative", "label": "imperative (Don't …)", "reason": "imperative (Don't …)", "need": ["don't let me down", "don't disappoint me", "please don't let"], "wrong": ["not let me down", "you don't let me down", "don't lets me down"] }
  ]
},
{
  "r": 289, "zh": "这个箱子太重了，我搬不动。",
  "en": ["This box is too heavy to lift.", "This box is too heavy for me to lift.", "This box is too heavy to carry.", "This box is so heavy that I can't lift it."],
  "points": [
    { "id": "tooheavy", "label": "structure (too … to / so … that)", "reason": "structure (too … to / so … that)", "need": ["too heavy to lift", "too heavy for me to lift", "too heavy to carry", "so heavy that i can't"], "wrong": ["too heavy to lifting", "too heavy for lift", "so heavy to lift", "too much heavy to lift", "too heavy that i can't"] },
    { "id": "v-box", "label": "the word “box”", "reason": "vocabulary", "need": ["box"] }
  ]
},
{
  "r": 290, "zh": "这个座位有人坐吗？",
  "en": ["Is this seat taken?", "Is anyone sitting here?", "Is this seat free?", "Is someone sitting here?"],
  "points": [
    { "id": "seattaken", "label": "question (Is this seat taken?)", "reason": "question (Is this seat taken?)", "need": ["is this seat taken", "is anyone sitting here", "is this seat free", "is someone sitting here", "is this seat occupied"], "wrong": ["is this seat take", "does this seat taken", "is sitting here anyone", "is this seat is taken"] },
    { "id": "v-seat", "label": "the word “seat”", "reason": "vocabulary", "need": ["seat"] }
  ]
},
{
  "r": 291, "zh": "我们应该减少塑料的使用。",
  "en": ["We should reduce the use of plastic.", "We should cut down on plastic.", "We should use less plastic.", "We ought to reduce our plastic use."],
  "points": [
    { "id": "reduce", "label": "collocation (reduce / cut down on)", "reason": "collocation (reduce / cut down on)", "need": ["reduce the use of plastic", "cut down on plastic", "use less plastic", "reduce our plastic use"], "wrong": ["cut down plastic on", "reduce less plastic", "use fewer plastic", "reduce plastic down"] },
    { "id": "v-plastic", "label": "the word “plastic”", "reason": "vocabulary", "need": ["plastic"] }
  ]
},
{
  "r": 292, "zh": "他把我介绍给了他的父母。",
  "en": ["He introduced me to his parents.", "He introduced me to his mom and dad.", "He introduced me to his family.", "He introduced me to his parents last night."],
  "points": [
    { "id": "introduceto", "label": "verb pattern (introduce sb to sb)", "reason": "verb pattern (introduce sb to sb)", "need": ["introduced me to his parents", "introduced me to his", "introduced me to"], "wrong": ["introduced me with his parents", "introduced me his parents", "introduced to me his parents", "introduced me at his parents"] },
    { "id": "v-parents", "label": "the word “parents / family”", "reason": "vocabulary", "need": ["parents", "family", "mom and dad"] }
  ]
},
{
  "r": 293, "zh": "天色越来越晚了，我们该走了。",
  "en": ["It's getting late, we should go.", "It's getting late, we'd better go.", "It's getting dark, we should leave.", "It's getting late, let's go."],
  "points": [
    { "id": "getting", "label": "structure (it's getting + adj)", "reason": "structure (it's getting + adj)", "need": ["it's getting late", "it is getting late", "it's getting dark"], "wrong": ["it's getting lately", "it gets late", "it's get late", "it becoming late"] },
    { "id": "shouldgo", "label": "modal (should / had better)", "reason": "modal (should / had better)", "need": ["we should go", "we'd better go", "we should leave", "let's go"], "wrong": ["we should to go", "we should going", "we better to go"] }
  ]
},
{
  "r": 294, "zh": "我的电脑刚才死机了。",
  "en": ["My computer just crashed.", "My computer crashed just now.", "My computer has just crashed.", "My computer froze just now."],
  "points": [
    { "id": "crashed", "label": "verb (crashed — past)", "reason": "verb (crashed — past)", "need": ["computer just crashed", "computer crashed just now", "computer has just crashed", "computer froze just now", "just crashed"], "wrong": ["computer just crash", "computer is crashed", "computer just crashes", "computer just was crashed"] },
    { "id": "v-computer", "label": "the word “computer”", "reason": "vocabulary", "need": ["computer"] }
  ]
},
{
  "r": 295, "zh": "我得走了，再见。",
  "en": ["I have to go now, goodbye.", "I've got to go now, bye.", "I need to go now, see you.", "I have to leave now, goodbye."],
  "points": [
    { "id": "havetogo", "label": "modal (have to / have got to + base)", "reason": "modal (have to / have got to + base)", "need": ["go", "leave"], "wrong": ["have to going", "must to go now", "have to gone", "have to leaving"] },
    { "id": "v-bye", "label": "the word “goodbye / bye”", "reason": "vocabulary", "need": ["goodbye", "bye", "see you"] }
  ]
},
{
  "r": 296, "zh": "出门记得带钥匙。",
  "en": ["Remember to take your keys when you go out.", "Don't forget to bring your keys when you leave.", "Remember to take your keys with you.", "Remember to bring your keys."],
  "points": [
    { "id": "remembertodo", "label": "verb form (remember to + base verb)", "reason": "verb form (remember to + base verb)", "need": ["remember to take your keys", "don't forget to bring your keys", "remember to bring your keys", "remember to take"], "wrong": ["remember taking your keys", "remember take your keys", "remember bringing your keys", "remember of taking keys"] },
    { "id": "v-key", "label": "the word “key”", "reason": "vocabulary", "need": ["key", "keys"] }
  ]
},
{
  "r": 297, "zh": "这道菜是用鸡肉做的。",
  "en": ["This dish is made with chicken.", "This dish is made from chicken.", "This dish is made of chicken.", "This dish is cooked with chicken."],
  "points": [
    { "id": "madewith", "label": "passive (made with / from)", "reason": "passive (made with / from)", "need": ["made with chicken", "made from chicken", "made of chicken", "cooked with chicken"], "wrong": ["made by chicken", "made in chicken", "is make with chicken", "made for chicken"] },
    { "id": "v-chicken", "label": "the word “chicken”", "reason": "vocabulary", "need": ["chicken"] }
  ]
},
{
  "r": 298, "zh": "我为你感到骄傲。",
  "en": ["I'm proud of you.", "I am proud of you.", "I'm so proud of you.", "I feel proud of you."],
  "points": [
    { "id": "proudof", "label": "collocation (proud of)", "reason": "collocation (proud of)", "need": ["proud of you"], "wrong": ["proud for you", "proud about you", "proud on you", "proud to you"] },
    { "id": "v-proud", "label": "the word “proud”", "reason": "vocabulary", "need": ["proud"] }
  ]
},
{
  "r": 299, "zh": "我同意你的看法。",
  "en": ["I agree with you.", "I agree with your opinion.", "I agree with what you said.", "I share your opinion."],
  "points": [
    { "id": "agreewith", "label": "collocation (agree with sb)", "reason": "collocation (agree with sb)", "need": ["agree with you", "agree with your", "agree with what", "share your opinion"], "wrong": ["agree to you", "agree on you", "agree you"] },
    { "id": "v-opinion", "label": "the word “opinion / view”", "reason": "vocabulary", "need": ["opinion", "you", "view"] }
  ]
},
{
  "r": 300, "zh": "祝你旅途愉快！",
  "en": ["Have a good trip!", "Have a nice trip!", "Have a safe trip!", "Have a pleasant journey!"],
  "points": [
    { "id": "havetrip", "label": "structure (Have a + adj + noun)", "reason": "structure (Have a + adj + noun)", "need": ["have a good trip", "have a nice trip", "have a safe trip", "have a pleasant journey", "have a great trip"], "wrong": ["have good trip", "have a good travel", "having a good trip", "have an good trip"] },
    { "id": "v-trip", "label": "the word “trip / journey”", "reason": "vocabulary", "need": ["trip", "journey", "travel"] }
  ]
}
];
