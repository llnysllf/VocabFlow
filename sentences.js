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
}
];
