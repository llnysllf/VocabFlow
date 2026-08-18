(function () {
"use strict";

/* ---------------- config / state ---------------- */
var LS_PREFIX = "vocabflow_v1";              // guest key; signed-in users append their id
var INTERVALS = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 10, 5: 30, 6: 90 }; // days to next review by strength
var MAX_LEVEL = 6;                           // level 6 = very strong, still reviewed rarely
var RETIRED_DUE = 999999;                    // "too easy" items stay out of review

var DEFAULTS = { strikeLimit: 7, newPerDay: 50, partWeight: 0.5, autoSpeak: true, pos: "all", src: "all", nat: "all" };

/* Part-of-speech filter. "other" is everything the four main classes miss —
   prepositions, pronouns, abbreviations, and the ~8% of entries whose meaning
   carries no part-of-speech marker at all — so no word is unreachable. */
var POS_MAIN = ["n.", "v.", "adj.", "adv."];
var POS_FILTERS = [
  { id: "all", label: "All" },
  { id: "n.", label: "Nouns" },
  { id: "v.", label: "Verbs" },
  { id: "adj.", label: "Adjectives" },
  { id: "adv.", label: "Adverbs" },
  { id: "other", label: "Other" }
];
function posFilterValid(id) {
  return POS_FILTERS.some(function (f) { return f.id === id; }) ? id : "all";
}

/* Expressions splits by what kind of thing an entry is. Nations sit a level
   below that, under Slang, because slang is the only kind tied to a country —
   an idiom or a proverb belongs to no one in particular. */
var SRC_FILTERS = [
  { id: "all", label: "All" },
  { id: "idioms", label: "Idioms" },
  { id: "phrasal", label: "Phrasal Verbs" },
  { id: "slang", label: "Slang" },
  { id: "proverbs", label: "Proverbs" }
];
function srcFilterValid(id) {
  return SRC_FILTERS.some(function (f) { return f.id === id; }) ? id : "all";
}

/* Slang is vocabulary marked by where it is used. "General" was a mistake: its
   entries — awesome, cool, cash, stuff, weird — are ordinary informal English,
   and every one of them already sits in the Vocabulary deck with the same
   meaning. What makes nick, bail and barbie worth a slang deck is that the
   slang sense differs from the everyday word; awesome has no second sense. */
var HIDDEN_NATIONS = ["General"];
var NAT_FILTERS = [
  { id: "all", label: "All" },
  { id: "American", label: "American" },
  { id: "British", label: "British" },
  { id: "Australian", label: "Australian" }
];
function natFilterValid(id) {
  return NAT_FILTERS.some(function (f) { return f.id === id; }) ? id : "all";
}

var GRADE_IDS = ["again", "hard", "shaky", "good", "easy", "retire"];
var STUDY_GRADE_IDS = ["again", "hard", "shaky", "good", "easy"];
var GRADE_META = {
  again:  { label: "Again",    hint: "missed it",       key: "1", strike: 1,   focus: true },
  hard:   { label: "Hard",     hint: "right, but slow", key: "2", strike: 0.5, focus: true },
  shaky:  { label: "Shaky",    hint: "not stable yet",  key: "3", strike: 0,   focus: true },
  good:   { label: "Good",     hint: "knew it",         key: "4", strike: 0,   focus: false },
  easy:   { label: "Easy",     hint: "very familiar",   key: "5", strike: 0,   focus: false },
  retire: { label: "Too easy", hint: "retire it",       key: "6", strike: 0,   focus: false }
};
var FOCUS_SEVERITY = { again: 4, bad: 4, hard: 3, shaky: 2, part: 2 };

function normalizeGrade(g) {
  if (g === "bad") return "again";
  if (g === "part") return "shaky";
  if (g === "right") return "good";
  if (g === "retired") return "retire";
  return GRADE_META[g] ? g : null;
}

function gradeStrike(g) {
  g = normalizeGrade(g);
  if (g === "hard") return S && S.cfg ? S.cfg.partWeight : GRADE_META.hard.strike;
  return g && GRADE_META[g] ? GRADE_META[g].strike : 0;
}

/* Idioms, phrasal verbs, slang, proverbs and sayings are all fixed expressions
   you learn whole, so they share one deck. Each source keeps its own file and
   its own 1..N numbering; merging shifts each by a fixed offset, which makes
   the old rank -> new rank migration pure arithmetic (see migrateExpressions). */
/* `kind` is what an entry is; `id` is only which file it came from. "Sayings"
   was never a real category — white as a sheet and go in one ear and out the
   other are idioms by any normal definition, and the two lists are separate
   only because IdiomKB shipped them separately. So sayings are shown as idioms.
   The file and its id stay put, because ranks are derived from them. */
var EXPRESSION_PARTS = [
  { id: "idioms",   kind: "idioms",   data: window.IDIOMS   || [] },
  { id: "phrasal",  kind: "phrasal",  data: window.PHRASAL  || [] },
  { id: "slang",    kind: "slang",    data: window.SLANG    || [] },
  { id: "proverbs", kind: "proverbs", data: window.PROVERBS || [] },
  { id: "sayings",  kind: "idioms",   data: window.SAYINGS  || [] }
];
var EXPRESSION_OFFSET = {};   // old deck id -> rank offset in the merged deck

/* The same expression can sit in several source lists — "ask out" is in both
   idioms and phrasal verbs, and it is genuinely both. Show it once, under the
   most specific label: a verb+particle is a phrasal verb first, and a fixed
   figurative phrase is an idiom before it is slang. */
var DEDUPE_PRIORITY = ["phrasal", "idioms", "sayings", "proverbs", "slang"];

function claimHeadwords() {
  var owner = {};
  DEDUPE_PRIORITY.forEach(function (id) {
    var part = EXPRESSION_PARTS.filter(function (p) { return p.id === id; })[0];
    if (!part) return;
    part.data.forEach(function (e) {
      var k = String(e.w || "").trim().toLowerCase();
      if (k && owner[k] === undefined) owner[k] = id;
    });
  });
  return owner;
}

function buildExpressions() {
  var out = [], offset = 0, owner = claimHeadwords();
  EXPRESSION_PARTS.forEach(function (part) {
    EXPRESSION_OFFSET[part.id] = offset;
    part.data.forEach(function (e) {
      // Skipping an entry must not shift anything: the offset still advances by
      // the whole file, so every surviving rank keeps its value. That is why
      // retired entries stay in their source file rather than being deleted.
      if (e.nat && HIDDEN_NATIONS.indexOf(e.nat) >= 0) return;
      if (owner[String(e.w || "").trim().toLowerCase()] !== part.id) return;
      out.push({ r: offset + e.r, w: e.w, c: e.c, e: e.e, src: part.kind, nat: e.nat || "" });
    });
    offset += part.data.length;
  });
  return out;
}

var DECKS = {
  vocab:       window.VOCAB || [],
  expressions: buildExpressions()
};
var DECK_IDS = ["vocab", "expressions"];
var DECK_LABELS = { vocab: "Vocabulary", expressions: "Expressions" };
var DECK_NOUN = { vocab: "words", expressions: "expressions" };
var DECK_ITEM = { vocab: "word", expressions: "expression" };
/* What each merged entry actually is, for the card's prompt. */
var SRC_ITEM = { idioms: "idiom", phrasal: "phrasal verb", slang: "slang term", proverbs: "proverb" };

/* `r` is identity — progress, cloud records and exported backups are all keyed
   on it, so it never moves. Frequency order lives in the array order instead,
   and `f` is the 1-based position derived from it: what the card displays and
   what "most common first" sorts on. */
var BY_RANK = {};   // BY_RANK[deckId][rank] -> entry
DECK_IDS.forEach(function (id) {
  BY_RANK[id] = {};
  DECKS[id].forEach(function (o, i) {
    o.f = i + 1;
    BY_RANK[id][o.r] = o;
  });
});

function freqOf(rank) {
  var d = curIndex()[rank];
  return d ? d.f : Infinity;
}

function curData() { return DECKS[S.active] || []; }     // active deck's word list
function curIndex() { return BY_RANK[S.active] || {}; }  // active deck's rank->entry
function D() { return S.decks[S.active]; }               // active deck's progress

function todayIndex() {
  var now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
}

function blankDay() {
  return { idx: todayIndex(), newCount: 0, revCount: 0, strikes: 0, wrongToday: [], answeredToday: [] };
}
function blankDeck() {
  return { words: {}, day: blankDay(), totals: { everSeen: 0 } }; // words: rank -> strength/progress record
}
function blankStore() {
  return {
    schema: 4,          // 4 merged the five phrase decks into one "expressions" deck
    cfg: Object.assign({}, DEFAULTS),
    active: "vocab",
    decks: { vocab: blankDeck(), expressions: blankDeck() },
    sentences: blankDeck(),  // spaced-repetition progress for the sentence-translation mode
    mtime: 0            // last-modified (ms) — used to resolve local vs cloud copies
  };
}

function sanitizeAnswered(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(function (it) { return it && it.r != null; }).map(function (it) {
    return { r: it.r, grade: normalizeGrade(it.grade || it.kind || it.g) || "again", ts: it.ts || 0 };
  });
}

function sanitizeFocus(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(function (it) { return it && it.r != null; }).map(function (it) {
    return { r: it.r, kind: normalizeGrade(it.kind || it.grade || it.g) || "again" };
  });
}

function sanitizeWord(w) {
  var out = {
    lvl: 0,
    due: todayIndex(),
    seen: false,
    lastGrade: null,
    retired: false,
    streak: 0,
    lapses: 0,
    right: 0,
    wrong: 0,
    lastSeen: null
  };
  if (w && typeof w === "object") {
    out.lvl = typeof w.lvl === "number" ? Math.max(0, Math.min(MAX_LEVEL, w.lvl)) : 0;
    out.due = typeof w.due === "number" ? w.due : todayIndex();
    out.seen = !!w.seen;
    out.lastGrade = normalizeGrade(w.lastGrade);
    out.retired = !!w.retired || out.lastGrade === "retire";
    out.streak = w.streak || 0;
    out.lapses = w.lapses || 0;
    out.right = w.right || 0;
    out.wrong = w.wrong || 0;
    out.lastSeen = typeof w.lastSeen === "number" ? w.lastSeen : null;
  }
  if (out.retired) {
    out.seen = true;
    out.lvl = MAX_LEVEL;
    out.due = todayIndex() + RETIRED_DUE;
    out.lastGrade = "retire";
  }
  return out;
}

function sanitizeDeck(d) {
  var out = blankDeck();
  if (d && typeof d === "object") {
    if (d.words && typeof d.words === "object") {
      Object.keys(d.words).forEach(function (rank) { out.words[rank] = sanitizeWord(d.words[rank]); });
    }
    if (d.day && typeof d.day === "object") {
      out.day = {
        idx: typeof d.day.idx === "number" ? d.day.idx : todayIndex(),
        newCount: d.day.newCount || 0, revCount: d.day.revCount || 0,
        strikes: d.day.strikes || 0,
        wrongToday: sanitizeFocus(d.day.wrongToday),
        answeredToday: sanitizeAnswered(d.day.answeredToday)
      };
    }
    if (d.totals && typeof d.totals === "object") out.totals = { everSeen: d.totals.everSeen || 0 };
  }
  return out;
}

/* v3 kept idioms/phrasal/slang/proverbs/sayings as five decks. Fold any such
   progress into the merged "expressions" deck, shifting each rank by the same
   offset used to build the deck, so every record lands back on its own entry.
   Old backups and other devices still carry the v3 shape, so this has to keep
   working rather than being a one-off. */
function migrateExpressions(decks) {
  var out = blankDeck(), t = todayIndex(), sameDay = false;
  EXPRESSION_PARTS.forEach(function (part) {
    var old = decks[part.id];
    if (!old || typeof old !== "object") return;
    old = sanitizeDeck(old);
    var offset = EXPRESSION_OFFSET[part.id];
    Object.keys(old.words).forEach(function (r) {
      out.words[offset + parseInt(r, 10)] = old.words[r];
    });
    out.totals.everSeen += old.totals.everSeen || 0;
    if (old.day && old.day.idx === t) {                 // only today's tallies carry over
      sameDay = true;
      out.day.newCount += old.day.newCount || 0;
      out.day.revCount += old.day.revCount || 0;
      out.day.strikes += old.day.strikes || 0;
      out.day.wrongToday = out.day.wrongToday.concat(sanitizeFocus(old.day.wrongToday).map(function (it) {
        return { r: offset + it.r, kind: it.kind };
      }));
      out.day.answeredToday = out.day.answeredToday.concat(sanitizeAnswered(old.day.answeredToday).map(function (it) {
        return { r: offset + it.r, grade: it.grade, ts: it.ts };
      }));
    }
  });
  if (!sameDay) out.day = blankDay();
  return out;
}

/* Make any loaded object safe, and migrate the old single-deck (v1) shape. */
function sanitizeStore(s) {
  if (!s || typeof s !== "object") return blankStore();
  var out = blankStore();
  if (s.cfg) out.cfg = Object.assign({}, DEFAULTS, s.cfg);
  if (typeof s.mtime === "number") out.mtime = s.mtime;
  if (s.decks && typeof s.decks === "object") {           // v2+
    out.decks.vocab = sanitizeDeck(s.decks.vocab);
    out.decks.expressions = s.decks.expressions
      ? sanitizeDeck(s.decks.expressions)
      : migrateExpressions(s.decks);                      // v3 shape
    out.sentences = sanitizeDeck(s.sentences);
    if (DECK_IDS.indexOf(s.active) >= 0) out.active = s.active;
    else if (EXPRESSION_OFFSET[s.active] !== undefined) out.active = "expressions";
  } else if (s.words && typeof s.words === "object") {    // v1 -> migrate into vocab
    out.decks.vocab = sanitizeDeck({ words: s.words, day: s.day, totals: s.totals });
  }
  return out;
}

function hasProgress(s) {
  s = sanitizeStore(s);
  return (s.sentences.totals.everSeen > 0) ||
         DECK_IDS.some(function (id) { return s.decks[id].totals.everSeen > 0; });
}

/* Union two "missed today" lists by rank, keeping the worst grade. */
function unionWrong(a, b) {
  var byRank = {};
  sanitizeFocus(a).concat(sanitizeFocus(b)).forEach(function (it) {
    if (!it || it.r == null) return;
    if (!byRank[it.r]) byRank[it.r] = { r: it.r, kind: it.kind };
    else if ((FOCUS_SEVERITY[it.kind] || 0) > (FOCUS_SEVERITY[byRank[it.r].kind] || 0)) byRank[it.r].kind = it.kind;
  });
  return Object.keys(byRank).map(function (k) { return byRank[k]; });
}

function unionAnswered(a, b) {
  var byRank = {};
  sanitizeAnswered(a).concat(sanitizeAnswered(b)).forEach(function (it) {
    if (!byRank[it.r] || (it.ts || 0) >= (byRank[it.r].ts || 0)) byRank[it.r] = it;
  });
  return Object.keys(byRank).map(function (k) { return byRank[k]; });
}

/* Merge one deck without losing progress: per word keep the more-advanced
   entry, combine same-day counters. newerIsA decides a stale-day tiebreak. */
function mergeDeck(da, db, newerIsA) {
  da = sanitizeDeck(da); db = sanitizeDeck(db);
  var merged = blankDeck();
  var ranks = {}, r;
  for (r in da.words) ranks[r] = 1;
  for (r in db.words) ranks[r] = 1;
  for (r in ranks) {
    var wa = da.words[r], wb = db.words[r];
    if (!wa) merged.words[r] = wb;
    else if (!wb) merged.words[r] = wa;
    else if (wa.retired !== wb.retired) merged.words[r] = wa.retired ? wa : wb;
    else if (wa.seen !== wb.seen) merged.words[r] = wa.seen ? wa : wb;
    else if (wa.lvl !== wb.lvl) merged.words[r] = (wa.lvl > wb.lvl) ? wa : wb;
    else merged.words[r] = (wa.due >= wb.due) ? wa : wb;
  }
  var seen = 0; for (r in merged.words) { if (merged.words[r].seen) seen++; }
  merged.totals.everSeen = seen;
  if (da.day.idx === db.day.idx) {
    merged.day = {
      idx: da.day.idx,
      newCount: Math.max(da.day.newCount, db.day.newCount),
      revCount: Math.max(da.day.revCount, db.day.revCount),
      strikes: Math.max(da.day.strikes, db.day.strikes),
      wrongToday: unionWrong(da.day.wrongToday, db.day.wrongToday),
      answeredToday: unionAnswered(da.day.answeredToday, db.day.answeredToday)
    };
  } else {
    merged.day = newerIsA ? da.day : db.day;
  }
  return merged;
}

/* Merge two stores (all decks). Newer copy wins for settings + active tab. */
function mergeStates(a, b) {
  a = sanitizeStore(a); b = sanitizeStore(b);
  var newerIsA = (a.mtime || 0) >= (b.mtime || 0);
  var newer = newerIsA ? a : b;
  var merged = blankStore();
  merged.cfg = Object.assign({}, DEFAULTS, newer.cfg);
  merged.active = newer.active;
  merged.mtime = Math.max(a.mtime || 0, b.mtime || 0);
  DECK_IDS.forEach(function (id) {
    merged.decks[id] = mergeDeck(a.decks[id], b.decks[id], newerIsA);
  });
  merged.sentences = mergeDeck(a.sentences, b.sentences, newerIsA);
  return merged;
}

/* Heuristic: does this parsed JSON look like a VocabFlow backup (v1 or v2)? */
function looksLikeBackup(o) {
  if (!o || typeof o !== "object" || !o.cfg || typeof o.cfg !== "object") return false;
  return (o.decks && typeof o.decks === "object") ||
         (o.words && typeof o.words === "object" && o.day);
}

/* ---------------- storage layer (guest localStorage + cloud sync) ---------------- */
var S = blankStore();

function lsKey() {
  return (window.Cloud && Cloud.user) ? LS_PREFIX + "_" + Cloud.user.id : LS_PREFIX;
}
function readLS(key) {
  try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}
function writeLS(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
}

var cloudSaveTimer = null;
var dirty = false;          // unsynced local changes pending
var syncPaused = false;     // true when the load failed: study locally, don't clobber cloud
var baseMtime = 0;          // mtime of the cloud copy we last loaded/saved
var flushing = false;       // a cloud flush is currently in flight

function cloudActive() { return window.Cloud && Cloud.user && !syncPaused; }

function persist() {
  S.mtime = Date.now();
  writeLS(lsKey(), S);                        // local cache: always, instant
  if (cloudActive()) {
    dirty = true;
    setSynced("saving…");
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(flushCloud, 800); // debounce rapid grades into one write
  }
}
function save() { persist(); }                 // alias used throughout

/* Push pending changes to the cloud now (debounce flush / tab-hide / close).
   Conflict-aware: if another device wrote since we last synced, merge first so
   neither side's progress is lost, then write the combined result. */
function flushCloud() {
  clearTimeout(cloudSaveTimer);
  if (!cloudActive() || !dirty || flushing) return;
  flushing = true;
  return Cloud.loadState().then(function (res) {
    if (res.ok && res.state && (res.state.mtime || 0) > baseMtime) {
      S = mergeStates(S, res.state);
      refreshStats();
    }
    S.mtime = Date.now();
    writeLS(lsKey(), S);
    return Cloud.saveState(S);
  }).then(function (ok) {
    if (ok) { dirty = false; baseMtime = S.mtime; }
    setSynced(ok ? "synced ✓" : "offline — saved locally");
  }, function () {
    setSynced("offline — saved locally");
  }).then(function () {
    flushing = false;
    if (dirty && cloudActive()) cloudSaveTimer = setTimeout(flushCloud, 800);
  });
}

/* Save immediately, then run cb (used by Reset/Import before reload). */
function persistNowThen(cb) {
  S.mtime = Date.now();
  writeLS(lsKey(), S);
  if (window.Cloud && Cloud.user && !syncPaused) {
    setSynced("saving…");
    // Intentional overwrite (reset / import) — skip the merge.
    Cloud.saveState(S).then(function () { baseMtime = S.mtime; cb(); }, cb);
  } else { cb(); }
}

/* Load the right state for whoever is signed in (or guest). */
function loadForCurrentUser() {
  syncPaused = false;
  dirty = false;
  if (window.Cloud && Cloud.user) {
    return Cloud.loadState().then(function (res) {
      var cached = readLS(lsKey());
      if (!res.ok) {
        // Couldn't reach the server. Work from the local cache and pause cloud
        // writes so a partial local state never overwrites good remote data.
        syncPaused = true;
        baseMtime = 0;
        S = sanitizeStore(cached || readLS(LS_PREFIX) || blankStore());
        setSynced("offline — changes won't sync until reload");
        return;
      }
      if (res.state) {
        baseMtime = res.state.mtime || 0;
        // If local edits are newer than the cloud (e.g. made while offline),
        // keep them and push up; otherwise adopt the cloud copy.
        if (cached && (cached.mtime || 0) > (res.state.mtime || 0)) {
          S = sanitizeStore(cached);
          writeLS(lsKey(), S);
          dirty = true; flushCloud();
        } else {
          S = sanitizeStore(res.state);
          writeLS(lsKey(), S);
        }
        return;
      }
      // No cloud data yet for this account. If the guest on this browser has
      // real progress, migrate it up so nothing is lost on first sign-in.
      baseMtime = 0;
      var guest = readLS(LS_PREFIX);
      if (!cached && guest && hasProgress(guest)) {
        S = sanitizeStore(guest);
        writeLS(lsKey(), S);
        dirty = true; flushCloud();
      } else {
        S = sanitizeStore(cached || blankStore());
        writeLS(lsKey(), S);
      }
    });
  }
  S = sanitizeStore(readLS(lsKey()) || blankStore());
  return Promise.resolve();
}

function rollDayIfNeeded() {
  var t = todayIndex();
  if (D().day.idx !== t) {
    D().day = blankDay();
    save();
  }
}

/* ---------------- queue building ---------------- */
var queue = [];            // ranks scheduled for this session run
var current = null;        // current rank
var ignoreStrikes = false; // "keep going anyway" mode
var drillOnly = false;     // re-drilling today's misses only — don't introduce new words
var skipped = {};          // ranks skipped this session (won't resurface until next session)
var appView = "practice";
var practiceDone = false;
var deckNavSelected = null; // null = derive from S.active / appView
function currentNavSelected() {
  if (deckNavSelected !== null) return deckNavSelected;
  return appView === "sentences" ? "sentences" : S.active;
}

function dueReviews() {
  var t = todayIndex();
  var out = [];
  for (var rank in D().words) {
    var w = D().words[rank];
    if (w.seen && !w.retired && w.due <= t && posMatchesRank(parseInt(rank, 10))) out.push(parseInt(rank, 10));
  }
  out.sort(function (a, b) {                  // most overdue first, then most common
    var da = D().words[a].due, db = D().words[b].due;
    if (da !== db) return da - db;
    return freqOf(a) - freqOf(b);
  });
  return out;
}

function nextNewRank() {
  var data = curData();
  for (var i = 0; i < data.length; i++) {
    var r = data[i].r;
    if (skipped[r]) continue;
    if (!inScope(data[i])) continue;
    if (!D().words[r] || (!D().words[r].seen && !D().words[r].retired)) return r;
  }
  return null;
}

function nextUnseenRank() {
  var data = curData();
  for (var i = 0; i < data.length; i++) {
    var r = data[i].r;
    if (!inScope(data[i])) continue;
    if (!D().words[r] || (!D().words[r].seen && !D().words[r].retired)) return r;
  }
  return null;
}

function buildQueue() { queue = dueReviews(); }

/* ---------------- session flow ---------------- */
function startSession() {
  rollDayIfNeeded();
  buildQueue();
  ignoreStrikes = false;
  drillOnly = false;
  skipped = {};
  advance();
}

function pickNext() {
  // 1) any queued review still pending and not skipped?
  while (queue.length) {
    var r = queue.shift();
    if (skipped[r] || !posMatchesRank(r)) continue;
    var w = D().words[r];
    if (w && w.seen && !w.retired && w.due <= todayIndex()) return r;
  }
  // 2) introduce a new word if under the daily cap (never while re-drilling misses)
  if (!drillOnly && (ignoreStrikes || D().day.newCount < S.cfg.newPerDay)) {
    var nr = nextNewRank();
    if (nr !== null) return nr;
  }
  return null;
}

function advance() {
  rollDayIfNeeded();
  if (!ignoreStrikes && D().day.strikes >= S.cfg.strikeLimit) return showDone("stopped");
  var r = pickNext();
  if (r === null) return showDone("complete");
  current = r;
  renderCard(r);
  refreshStats();
}

/* ---------------- grading ---------------- */
function isNew(rank) { return !D().words[rank] || !D().words[rank].seen; }

function ensure(rank) {
  if (!D().words[rank]) D().words[rank] = sanitizeWord(null);
  return D().words[rank];
}

function nextLevelForGrade(w, g, wasNew) {
  var lvl = typeof w.lvl === "number" ? w.lvl : 0;
  if (g === "again") return 0;
  if (g === "hard") return Math.max(1, Math.min(lvl > 1 ? lvl - 1 : 1, 3));
  if (g === "shaky") return Math.max(2, wasNew ? 2 : lvl);
  if (g === "good") return Math.min(MAX_LEVEL, wasNew ? 3 : lvl + 1);
  if (g === "easy") return Math.min(MAX_LEVEL, Math.max(5, lvl + 2));
  return lvl;
}

function findAnswered(rank) {
  var day = D().day;
  day.answeredToday = sanitizeAnswered(day.answeredToday);
  for (var i = 0; i < day.answeredToday.length; i++) {
    if (day.answeredToday[i].r === rank) return day.answeredToday[i];
  }
  return null;
}

function recordAnswered(rank, g) {
  var existing = findAnswered(rank);
  if (existing) {
    var prev = existing.grade;
    existing.grade = g;
    existing.ts = Date.now();
    return prev;
  }
  D().day.answeredToday.push({ r: rank, grade: g, ts: Date.now() });
  return null;
}

function recordFocus(rank, kind) {
  var day = D().day;
  day.wrongToday = sanitizeFocus(day.wrongToday);
  var existing = null;
  for (var i = 0; i < day.wrongToday.length; i++) {
    if (day.wrongToday[i].r === rank) { existing = day.wrongToday[i]; break; }
  }
  if (existing) {
    if ((FOCUS_SEVERITY[kind] || 0) >= (FOCUS_SEVERITY[existing.kind] || 0)) existing.kind = kind;
  } else {
    day.wrongToday.push({ r: rank, kind: kind });
  }
}

function clearFocus(rank) {
  D().day.wrongToday = sanitizeFocus(D().day.wrongToday).filter(function (it) { return it.r !== rank; });
}

function applyGrade(rank, g, opts) {
  opts = opts || {};
  g = normalizeGrade(g);
  if (!g || !curIndex()[rank]) return;
  rollDayIfNeeded();
  var w = ensure(rank);
  var wasNew = !w.seen;
  var t = todayIndex();

  if (opts.countSession) {
    if (wasNew) { D().day.newCount++; D().totals.everSeen++; }
    else { D().day.revCount++; }
  } else if (wasNew) {
    D().totals.everSeen++;
  }

  var previousGrade = recordAnswered(rank, g);
  w.seen = true;
  w.lastSeen = t;
  w.lastGrade = g;
  w.retired = g === "retire";
  if (g !== "retire") w.retired = false;

  if (g === "again") {
    w.lvl = 0;
    w.streak = 0;
    w.lapses = (w.lapses || 0) + 1;
    w.wrong = (w.wrong || 0) + 1;
  } else if (g === "retire") {
    w.lvl = MAX_LEVEL;
    w.streak = (w.streak || 0) + 1;
    w.right = (w.right || 0) + 1;
  } else {
    w.lvl = nextLevelForGrade(w, g, wasNew);
    w.streak = (w.streak || 0) + 1;
    w.right = (w.right || 0) + 1;
    if (g === "hard") w.lapses = (w.lapses || 0) + 1;
  }

  if (w.retired) w.due = t + RETIRED_DUE;
  else if (g === "again") w.due = t;
  else if (g === "hard") w.due = t + 1;
  else w.due = t + (INTERVALS[w.lvl] || 1);

  if (GRADE_META[g].focus) recordFocus(rank, g);
  else clearFocus(rank);

  if (opts.adjustStrikes !== false) {
    var delta = gradeStrike(g) - gradeStrike(previousGrade);
    addStrike(delta);
  }

  save();
  refreshStats();
  if (browseActive) renderBrowse();
  if (opts.advance) {
    if (g === "again" && !drillOnly && !w.retired) queue.push(rank);
    advance();
  }
}

function grade(g) { applyGrade(current, g, { countSession: true, advance: true }); }

function addStrike(n) {
  D().day.strikes = Math.max(0, D().day.strikes + (n || 0));
}

/* ---------------- rendering ---------------- */
var elWord, elRank, elQ, elAns, elReveal, elYour, elCn, elEn, elPhon;

/* The phonetic table ships with the app, so this needs no network and can't
   arrive late on the wrong card. Blank for acronyms cmudict doesn't cover. */
function renderPron(text) {
  if (!elPhon) return;
  var ipa = window.Pron ? Pron.phonetic(text) : "";
  elPhon.textContent = ipa ? "/" + ipa + "/" : "";
}

/* Say the current prompt out loud. Auto-play is silent until the page has had
   a click — browsers block audio before that — so the first card may not speak. */
function speakCurrent() {
  var d = curIndex()[current];
  if (d && window.Pron) Pron.speak(d.w);
}

function renderCard(rank) {
  var d = curIndex()[rank];
  practiceDone = false;
  if (appView === "practice") showScreen("screenTest");
  elReveal.classList.remove("show");
  elAns.value = "";
  elWord.textContent = d.w;
  renderPron(d.w);
  if (window.Pron) {
    if (S.cfg.autoSpeak) Pron.speak(d.w);
    else Pron.prefetch(d.w);   // have the recording ready before the play button is pressed
  }
  elRank.textContent = "#" + d.f;
  syncPosNote();   // boot draws the first card without going through syncAppChrome
  var kind = SRC_ITEM[d.src] || DECK_ITEM[S.active];   // "idiom"/"proverb"/… inside Expressions
  elQ.textContent = (isNew(rank) ? "NEW " + kind.toUpperCase() : "REVIEW") + " — what does it mean?";
  setTimeout(function () { elAns.focus(); }, 30);
}

function reveal() {
  var d = curIndex()[current];
  var typed = elAns.value.trim();
  elYour.innerHTML = typed ? ("You typed: <b>" + escapeHtml(typed) + "</b>") : "<i>(no answer typed)</i>";
  renderMeaning(d.c, d.w);
  renderGloss(d.e, d.w);
  elReveal.classList.add("show");
  requestAnimationFrame(function () {
    var grades = document.querySelector(".grades");
    if (grades && grades.scrollIntoView) grades.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

/* Part-of-speech codes appear two ways in the data: WordNet single letters
   (n, v, a, s, r) and dictionary abbreviations (n., adj., prep., v. i. ...).
   Normalise either form to one readable label. */
var POS_LABEL = {
  n: "n.", v: "v.", vt: "v.", vi: "v.",
  a: "adj.", s: "adj.", adj: "adj.",
  ad: "adv.", adv: "adv.", r: "adv.",
  prep: "prep.", conj: "conj.", pron: "pron.", art: "art.",
  num: "num.", int: "interj.", interj: "interj.", aux: "aux.",
  pl: "pl.", imp: "pt.", p: "pp.", abbr: "abbr."
};
function posLabel(token) {
  var key = String(token).toLowerCase().replace(/[.\s&]/g, "");
  return POS_LABEL[key] || null;
}
// One-to-three leading abbreviations like "prep. ", "v. i. ", "n. & a. "
var POS_TOKENS = "n|vt|vi|v|adj|adv|ad|a|s|r|prep|conj|pron|art|num|interj|int|aux|pl|abbr|imp|p";
var POS_LEAD_RE = new RegExp("^((?:(?:" + POS_TOKENS + ")\\.\\s*&?\\s*){1,3})(.+)$", "i");

/* ECDICT marks field-specific senses with a bracketed tag. Left raw they read
   as noise, and they crowd out the everyday meaning: "for" lists a DOS batch
   command beside "为, 因为". Name the field, and sort those senses last. */
var DOMAIN_LABEL = {
  "计": "computing", "医": "medicine", "化": "chemistry", "经": "economics",
  "法": "law", "机": "mechanics", "电": "electrical", "建": "construction",
  "俚": "slang", "物": "physics", "口": "colloquial", "古": "archaic",
  "体": "sport", "地名": "place name", "军": "military", "农": "agriculture"
};

function splitMeaning(text) {
  var parts = String(text || "").split(/\s*\/\s*/).filter(Boolean).map(function (part) {
    var domain = "";
    part = part.replace(/\[([^\]]{1,4})\]\s*/, function (_, tag) {
      domain = DOMAIN_LABEL[tag] || tag;
      return "";
    }).trim();
    var m = part.match(POS_LEAD_RE);
    if (m) {
      var label = posLabel(m[1].split(/\s+/)[0]); // normalise just the first token
      if (label) return { label: label, text: m[2], domain: domain };
    }
    return { label: "", text: part, domain: domain };
  }).filter(function (p) { return p.text; });

  // Everyday senses first; a stable sort keeps each group's original order.
  var plain = parts.filter(function (p) { return !p.domain; });
  return plain.concat(parts.filter(function (p) { return p.domain; }));
}

function splitMeaningTerms(text) {
  return String(text || "").split(/[，,;；]/).map(function (term) {
    return term.trim();
  }).filter(Boolean);
}

/* Meanings and their examples belong together: reading "n. 执政者, 交情" and
   then hunting for the noun examples in a separate list below makes you do the
   join by hand. Each word type is one block — its Chinese, then its sentences. */
/* ECDICT gives a flat list of Chinese per word type and says nothing about
   which meaning each belongs to. Wiktionary's translation tables do, so where
   they overlap the meanings get an English label saying what they are. */
function sensesFor(word, type) {
  var all = window.SENSES && window.SENSES[String(word || "").trim().toLowerCase()];
  if (!all) return [];
  return all.filter(function (s) { return s.p === type; });
}

function senseList(rows) {
  var list = document.createElement("div");
  list.className = "sense-list";
  rows.forEach(function (s) {
    var line = document.createElement("div");
    line.className = "sense-line";
    line.innerHTML = '<span class="sense-zh">' +
      s.z.map(function (t) { return '<span class="meaning-term">' + escapeHtml(t) + "</span>"; }).join("") +
      '</span><span class="sense-gloss">' + escapeHtml(s.g) + "</span>";
    list.appendChild(line);
  });
  return list;
}

function renderMeaning(text, word) {
  elCn.innerHTML = "";
  var groups = examplesFor(word), used = {};
  splitMeaning(text).forEach(function (part) {
    var termList = splitMeaningTerms(part.text);
    var row = document.createElement("div");
    row.className = "meaning-row" +
      (part.label ? "" : " plain") +
      (part.domain ? " domain" : "") +
      (termList.length > 4 ? " wide" : "");

    if (part.label) {
      var label = document.createElement("span");
      label.className = "meaning-pos";
      label.textContent = part.label;
      row.appendChild(label);
    }
    var terms = document.createElement("span");
    terms.className = "meaning-terms";
    // Sits with the terms, not as its own grid cell — the row is a 2-column grid.
    if (part.domain) {
      var dom = document.createElement("span");
      dom.className = "meaning-domain";
      dom.textContent = part.domain;
      terms.appendChild(dom);
    }
    termList.forEach(function (term) {
      var chip = document.createElement("span");
      chip.className = "meaning-term";
      chip.textContent = term;
      terms.appendChild(chip);
    });
    row.appendChild(terms);

    // Wrap the row with this type's sentences, so the two read as one thing.
    var block = document.createElement("div");
    block.className = "sense-block";
    block.appendChild(row);
    // ECDICT can list a type twice (vt. and vi. both become "v."), so the
    // labelled senses and the sentences attach to the first block only.
    var first = part.label && !used[part.label];
    if (first) {
      var labelled = sensesFor(word, part.label);
      if (labelled.length) { used[part.label] = 1; block.appendChild(senseList(labelled)); }
    }
    if (first && groups[part.label]) {
      used[part.label] = 1;
      block.appendChild(exampleFold(part.label, groups[part.label]));
    }
    elCn.appendChild(block);
  });

  // Types the sentences or the labelled senses cover but the dictionary did not
  // list — "the" is only an article in ECDICT, but has an adverb sense in
  // "the more ... the more".
  var extra = exampleTypes(word).slice();
  (window.SENSES && window.SENSES[String(word || "").trim().toLowerCase()] || [])
    .forEach(function (s) { if (extra.indexOf(s.p) < 0) extra.push(s.p); });
  extra.forEach(function (t) {
    if (used[t]) return;
    used[t] = 1;
    var block = document.createElement("div");
    block.className = "sense-block";
    var head = document.createElement("div");
    head.className = "meaning-row";
    head.innerHTML = '<span class="meaning-pos">' + escapeHtml(t) + '</span><span class="meaning-terms"></span>';
    var labelled = sensesFor(word, t);
    if (labelled.length) {
      block.appendChild(head);
      block.appendChild(senseList(labelled));
    }
    if (groups[t]) block.appendChild(exampleFold(t, groups[t]));
    if (block.childNodes.length) elCn.appendChild(block);
  });
}

/* Pull a leading part-of-speech code off an English gloss and make it readable.
   Handles WordNet single letters ("v have...") and abbreviations ("v. i. ..."). */
function parseGloss(line) {
  line = line.trim();
  var m = line.match(/^([nvasr])\s+(.+)$/);          // WordNet: letter + space
  if (m) return { pos: posLabel(m[1]), text: m[2] };
  m = line.match(POS_LEAD_RE);                         // abbreviations: "n.", "v. i."
  if (m) {
    var label = posLabel(m[1].split(/\s+/)[0]);
    if (label) {
      var rest = m[2];
      // absorb Webster transitivity sub-markers: "v. i." / "v. t." / "v. n."
      if (label === "v.") rest = rest.replace(/^(?:i|t|n)\.\s+/i, "");
      return { pos: label, text: rest };
    }
  }
  return { pos: "", text: line };
}

/* Old Webster cross-references carry no meaning on their own ("See Thee.",
   "Alt. of foo") — drop them so the card shows only real definitions. */
function isCrossRef(text) {
  var t = String(text || "").trim();
  return /^See\s+[A-Z][A-Za-z'’\- ]{0,18}\.?$/.test(t) ||
         /^Alt\.\s+of\s+/i.test(t);
}

/* WordNet resolves a short word to the ABBREVIATION that shares its spelling,
   so "who" is glossed as a UN agency, "me" as the state of Maine, "am" as
   americium. Only ever a problem for two- and three-letter words: "washington"
   really is a state and "star" really is a celestial body. */
var ABBREV_GLOSS = /a state in\b|United Nations agency|an associate degree|unit of surface area|radioactive transuranic|a airport|international airport/i;
function isAbbrevGloss(word, text) {
  return String(word || "").length <= 3 && ABBREV_GLOSS.test(String(text || ""));
}

/* The data uses " / " both to separate senses AND to mark mid-sentence line
   wraps from the original dictionary. Rejoin wrapped continuation lines (a
   lowercase start that isn't a new sense, following an unfinished line) so a
   single definition stays in one box. */
var POS_SENSE_START = new RegExp("^(?:[nvasr]\\s|(?:" + POS_TOKENS + ")\\.\\s)", "i");
function joinGlossLines(text) {
  var segs = String(text || "").split(/\s*\/\s*/).filter(Boolean);
  var out = [];
  segs.forEach(function (seg) {
    if (out.length) {
      var prev = out[out.length - 1];
      if (/^[a-z]/.test(seg) && !POS_SENSE_START.test(seg) && !/[.;:!?]["'’)\]]*$/.test(prev)) {
        out[out.length - 1] = prev + " " + seg;
        return;
      }
    }
    out.push(seg);
  });
  return out;
}

/* Example sentences, grouped by the sense each one shows. For a word like
   "run" this is where the meanings separate visibly — 奔跑 in one sentence,
   运行 in another — which a list of comma-separated glosses cannot convey. */
function examplesFor(word) {
  var table = window.EXAMPLES;
  return (table && table[String(word || "").trim().toLowerCase()]) || [];
}

var EX_TYPE_ORDER = ["n.", "v.", "adj.", "adv.", "prep.", "conj.", "pron.", "art.",
                     "num.", "interj.", "aux."];
var EX_TYPE_NAME = { "n.": "Noun", "v.": "Verb", "adj.": "Adjective", "adv.": "Adverb",
                     "prep.": "Preposition", "conj.": "Conjunction", "pron.": "Pronoun",
                     "art.": "Article", "num.": "Numeral", "interj.": "Interjection",
                     "aux.": "Auxiliary" };

function exampleTypes(word) {
  var groups = examplesFor(word), out = [];
  EX_TYPE_ORDER.forEach(function (t) { if (groups[t] && groups[t].length) out.push(t); });
  Object.keys(groups).forEach(function (t) {
    if (out.indexOf(t) < 0 && groups[t] && groups[t].length) out.push(t);
  });
  return out;
}

function exampleBodyHtml(list) {
  return list.map(function (x) {
    return '<div class="ex-row">' +
      (x.s ? '<span class="ex-sense">' + escapeHtml(x.s) + "</span>" : "") +
      '<div class="ex-line"><span class="ex-en">' + escapeHtml(x.en) + "</span>" +
      speakBtnHtml(x.en) + "</div>" +
      '<div class="ex-zh">' + escapeHtml(x.zh) + "</div></div>";
  }).join("");
}

/* One collapsed fold of sentences, belonging to the word type above it. */
function exampleFold(type, list) {
  var details = document.createElement("details");
  details.className = "ex-details";
  details.innerHTML = "<summary>" + list.length + " example" +
    (list.length === 1 ? "" : "s") + " as " +
    escapeHtml((EX_TYPE_NAME[type] || type).toLowerCase()) + "</summary>" +
    '<div class="ex-body">' + exampleBodyHtml(list) + "</div>";
  return details;
}

function renderGloss(text, word) {
  elEn.innerHTML = "";
  var lines = [];
  joinGlossLines(text).forEach(function (raw) {
    var g = parseGloss(raw);
    if (isCrossRef(g.text)) return;                 // skip useless cross-references
    if (isAbbrevGloss(word, g.text)) return;        // ...and the abbreviation mix-ups
    lines.push(g);
  });
  if (!lines.length) return;
  var details = document.createElement("details");
  details.className = "gloss-details";
  var summary = document.createElement("summary");
  summary.textContent = "English hints";
  details.appendChild(summary);
  var grid = document.createElement("div");
  grid.className = "gloss-grid";
  lines.forEach(function (g) {
    var item = document.createElement("div");
    item.className = "gloss-line" + (g.pos ? " has-pos" : "");
    if (g.pos) {
      var pos = document.createElement("span");
      pos.className = "gloss-pos";
      pos.textContent = g.pos;
      item.appendChild(pos);
    }
    var txt = document.createElement("span");
    txt.className = "gloss-text";
    txt.textContent = g.text;
    item.appendChild(txt);
    grid.appendChild(item);
  });
  details.appendChild(grid);
  elEn.appendChild(details);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function refreshStats() {
  if (el("sNew")) el("sNew").textContent = D().day.newCount;
  if (el("sRev")) el("sRev").textContent = D().day.revCount;
  if (el("sStrike")) el("sStrike").textContent = round1(D().day.strikes) + " / " + S.cfg.strikeLimit;
  if (el("sMaster")) el("sMaster").textContent = countMastered();
  var pct = Math.min(100, (D().day.strikes / S.cfg.strikeLimit) * 100);
  if (el("pbar")) el("pbar").style.width = pct + "%";
  renderSideRail();
  if (appView === "stats") renderStatsScreen();
}
function round1(n) { return Math.round(n * 10) / 10; }
/* Every count is scoped to the active part-of-speech filter, so the whole
   Statistics screen describes the same set of words the trainer is serving. */
function countMastered() { var c = 0; for (var r in D().words) { if (D().words[r].seen && !D().words[r].retired && D().words[r].lvl >= 5 && posMatchesRank(parseInt(r, 10))) c++; } return c; }
function countRetired() { var c = 0; for (var r in D().words) { if (D().words[r].retired && posMatchesRank(parseInt(r, 10))) c++; } return c; }
function countSeen() { var c = 0; for (var r in D().words) { if (D().words[r].seen && posMatchesRank(parseInt(r, 10))) c++; } return c; }
function countDue() { return dueReviews().length; }
function countInScope() {
  if (posFilter() === "all" && natFilter() === "all") return curData().length;
  var c = 0, data = curData();
  for (var i = 0; i < data.length; i++) { if (inScope(data[i])) c++; }
  return c;
}
function countNotStarted() {
  var c = 0;
  var data = curData();
  for (var i = 0; i < data.length; i++) {
    if (!inScope(data[i])) continue;
    var w = D().words[data[i].r];
    if (!w || (!w.seen && !w.retired)) c++;
  }
  return c;
}
function countLeftToLearn() { return Math.max(0, countInScope() - countRetired()); }

function renderStatsScreen() {
  if (!el("statsSeen")) return;
  if (currentNavSelected() === "sentences") {
    var sp = sProg().words, t = todayIndex();
    var seen = 0, mastered = 0, retired = 0, due = 0;
    for (var r in sp) {
      var w = sp[r];
      if (w.seen) seen++;
      if (w.seen && !w.retired && w.lvl >= 5) mastered++;
      if (w.retired) retired++;
      if (!w.retired && w.seen && w.due <= t) due++;
    }
    var learning = Math.max(0, seen - mastered - retired);
    var total = SENTENCES.length;
    var sd = sProg().day || {};
    el("statsDeckName").textContent = "Sentences · " + total + " sentences";
    el("statsLeftToLearn").textContent = Math.max(0, total - retired).toLocaleString();
    el("statsLearnLine").textContent = retired + " known · " + total + " total";
    el("statsSeen").textContent = seen.toLocaleString();
    el("statsStrong").textContent = mastered.toLocaleString();
    el("statsRetired").textContent = retired.toLocaleString();
    el("statsUnstarted").textContent = (total - seen).toLocaleString();
    el("statsLearning").textContent = learning.toLocaleString();
    el("statsDue").textContent = due.toLocaleString();
    el("statsToday").textContent = ((sd.newCount || 0) + (sd.revCount || 0)).toLocaleString();
    el("statsTodayLine").textContent = "Today: " + (sd.newCount || 0) + " new, " +
      (sd.revCount || 0) + " reviews, " + round1(sd.strikes || 0) + " strikes.";
    return;
  }
  var seen = countSeen();
  var mastered = countMastered();
  var retired = countRetired();
  var due = countDue();
  var notStarted = countNotStarted();
  var left = countLeftToLearn();
  var total = countInScope();
  var learning = Math.max(0, seen - mastered - retired);
  el("statsDeckName").textContent = DECK_LABELS[S.active] +
    (scopeLabel() ? " · " + scopeLabel() : "") +
    " · " + total.toLocaleString() + " " + DECK_NOUN[S.active];
  el("statsLeftToLearn").textContent = left.toLocaleString();
  el("statsLearnLine").textContent = retired.toLocaleString() + " known · " + total.toLocaleString() + " total";
  el("statsSeen").textContent = seen.toLocaleString();
  el("statsStrong").textContent = mastered.toLocaleString();
  el("statsRetired").textContent = retired.toLocaleString();
  el("statsUnstarted").textContent = notStarted.toLocaleString();
  el("statsLearning").textContent = learning.toLocaleString();
  el("statsDue").textContent = due.toLocaleString();
  el("statsToday").textContent = (D().day.newCount + D().day.revCount).toLocaleString();
  el("statsTodayLine").textContent = "Today: " + D().day.newCount + " new, " +
    D().day.revCount + " reviews, " + round1(D().day.strikes) + " strikes.";
}

function railItemHtml(rank, note) {
  var d = rankEntry(rank);
  if (!d) return "";
  return '<div class="rail-item"><span>' + escapeHtml(d.w) + "</span><small>" + escapeHtml(note) + "</small></div>";
}

function sentenceRailItemHtml(rank, note) {
  var s = SENTENCES.filter(function (x) { return x.r === rank; })[0];
  if (!s) return "";
  return '<div class="rail-item"><span>' + escapeHtml(s.zh) + "</span><small>" + escapeHtml(note) + "</small></div>";
}

function renderSideRail() {
  if (!el("railGoalText")) return;

  if (appView === "sentences") {
    var t = todayIndex();
    if (!sProg().day || sProg().day.idx !== t) sProg().day = blankDay();
    var sd = sProg().day, sp = sProg().words;
    if (el("sNew")) el("sNew").textContent = sd.newCount || 0;
    if (el("sRev")) el("sRev").textContent = sd.revCount || 0;
    if (el("sStrike")) el("sStrike").textContent = "—";
    var smastered = 0;
    for (var rr in sp) { if (sp[rr].seen && !sp[rr].retired && sp[rr].lvl >= MAX_LEVEL) smastered++; }
    if (el("sMaster")) el("sMaster").textContent = smastered;
    var sretired = 0;
    for (var rr2 in sp) { if (sp[rr2].retired) sretired++; }
    var sleft = Math.max(0, SENTENCES.length - sretired);
    if (el("sLeftToLearn")) el("sLeftToLearn").textContent = sleft.toLocaleString();
    if (el("sKnownLine")) el("sKnownLine").textContent = sretired + " known";
    if (el("pbar")) el("pbar").style.width = "0%";
    var dueS = [];
    for (var i = 0; i < SENTENCES.length; i++) {
      var s = SENTENCES[i], sw = sp[s.r];
      if (sw && sw.seen && !sw.retired && sw.due <= t) dueS.push(s);
    }
    el("railGoalText").textContent = dueS.length ? dueS.length + " sentences due for review." : "No sentences due — keep going!";
    var nextS = pickSentence();
    var upRows = nextS ? [sentenceRailItemHtml(nextS.r, sStatus(nextS.r) === "new" ? "new" : "review")] : [];
    el("railQueueList").innerHTML = upRows.length ? upRows.join("") : '<div class="rail-empty">Nothing queued right now.</div>';
    var sWrong = (sd.wrongToday || []).slice(0, 5);
    var focusRows = sWrong.map(function (it) { return sentenceRailItemHtml(it.r, "focus"); }).filter(Boolean);
    el("railFocusList").innerHTML = focusRows.length ? focusRows.join("") : '<div class="rail-empty">No focus sentences yet.</div>';
    if (el("btnRailReviewWrong")) el("btnRailReviewWrong").disabled = true;
    return;
  }

  el("railGoalText").textContent = dailyGoalText();
  if (el("sLeftToLearn")) el("sLeftToLearn").textContent = countLeftToLearn().toLocaleString();
  if (el("sKnownLine")) el("sKnownLine").textContent = countRetired().toLocaleString() + " known";

  var due = uniqueRanks(dueReviews()).slice(0, 5);
  var rows = due.map(function (rank) { return railItemHtml(rank, "review"); }).filter(Boolean);
  if (!rows.length) {
    var nextRank = nextUnseenRank();
    if (nextRank !== null) rows.push(railItemHtml(nextRank, "new"));
  }
  el("railQueueList").innerHTML = rows.length ? rows.join("") : '<div class="rail-empty">Nothing is queued right now.</div>';

  var focus = sanitizeFocus(D().day.wrongToday).slice(0, 5);
  var focusRows = focus.map(function (it) { return railItemHtml(it.r, focusLabel(it.kind)); }).filter(Boolean);
  el("railFocusList").innerHTML = focusRows.length ? focusRows.join("") : '<div class="rail-empty">No focus words yet.</div>';
  if (el("btnRailReviewWrong")) el("btnRailReviewWrong").disabled = !focusRows.length;
}

function focusLabel(kind) {
  kind = normalizeGrade(kind) || kind;
  if (kind === "again") return "again";
  if (kind === "hard") return "hard";
  if (kind === "shaky") return "shaky";
  return kind || "focus";
}

function strengthLabel(w) {
  if (!w || !w.seen) return "New";
  if (w.retired) return "Too easy";
  if (w.lvl <= 0) return "Weak";
  if (w.lvl === 1) return "Hard";
  if (w.lvl === 2) return "Shaky";
  if (w.lvl === 3) return "Familiar";
  if (w.lvl === 4) return "Good";
  if (w.lvl === 5) return "Strong";
  return "Easy";
}

function daysUntil(day) { return Math.max(0, day - todayIndex()); }
function dueLabel(day) {
  var d = daysUntil(day);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return "in " + d + " days";
}

/* ---------------- done screen ---------------- */
function showDone(reason) {
  practiceDone = true;
  appView = "practice";
  browseActive = false;
  syncAppChrome("practice");
  showScreen("screenDone");
  var title = document.getElementById("doneTitle");
  var sub = document.getElementById("doneSub");
  var wrap = document.getElementById("focusWrap");

  var wrong = D().day.wrongToday;
  if (reason === "stopped") {
    title.textContent = "Time to lock these in";
    sub.textContent = "You hit " + round1(D().day.strikes) + " strikes. These " + wrong.length + " focus item(s) are your job to remember today.";
  } else {
    if (wrong.length) {
      title.textContent = "Nice work today ✓";
      sub.textContent = "Today's main queue is clear. These " + wrong.length + " focus item(s) still deserve one more look.";
    } else {
      title.textContent = "Today's goal is clear";
      sub.textContent = "Nothing is due right now for this deck.";
    }
  }

  wrap.innerHTML = "";
  if (wrong.length) {
    wrong.forEach(function (item) {
      var d = curIndex()[item.r];
      var div = document.createElement("div");
      div.className = "focusitem";
      div.innerHTML = '<div><span class="fw">' + escapeHtml(d.w) + "</span>" +
        '<span class="tag ' + focusLabel(item.kind) + '">' + focusLabel(item.kind) + "</span></div>" +
        '<div class="fc">' + escapeHtml(d.c) + "</div>";
      wrap.appendChild(div);
    });
    document.getElementById("btnReviewWrong").style.display = "";
  } else {
    document.getElementById("btnReviewWrong").style.display = "none";
  }
  refreshStats();
}

/* drill today's wrong words again immediately (does not change strikes) */
function drillWrong() {
  if (!D().day.wrongToday.length) return;
  queue = D().day.wrongToday.map(function (x) { return x.r; }).filter(function (r) {
    return D().words[r] && !D().words[r].retired;
  });
  if (!queue.length) return;
  skipped = {};
  ignoreStrikes = true;   // practice past the strike limit
  drillOnly = true;       // ...but stop after the misses, don't pull in new words
  appView = "practice";
  browseActive = false;
  syncAppChrome("practice");
  practiceDone = false;
  var r = queue.shift();
  if (r != null) { current = r; renderCard(r); refreshStats(); }
}

/* ---------------- auth UI ---------------- */
var authMode = "in"; // 'in' | 'up'

function el(id) { return document.getElementById(id); }
function setSynced(text) { var n = el("syncedNote"); if (n) n.textContent = text; }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (screen) {
    screen.classList.toggle("active", screen.id === id);
  });
}

function appViewForBrowse(view) {
  if (view === "today" || view === "answered" || view === "upcoming") return "today";
  if (view === "retired") return "tooEasy";
  return "library";
}

function viewCopy(view) {
  if (view === "today") return {
    title: "Today",
    sub: "Focus words, due reviews, and the next new items for this deck."
  };
  if (view === "library") return {
    title: "Library",
    sub: "Search the deck and adjust mastery for items you have already answered."
  };
  if (view === "tooEasy") return {
    title: "Too Easy",
    sub: "Words you retired because they are already automatic."
  };
  if (view === "stats") return {
    title: "Statistics",
    sub: "A clean read on this deck's progress and due work."
  };
  if (view === "settings") return {
    title: "Goal & Data",
    sub: "Daily limits, grade weight, and backup controls."
  };
  if (view === "sentences") return {
    title: "Sentences",
    sub: "Translate the Chinese sentence into English — several phrasings are accepted."
  };
  return {
    title: "Practice",
    sub: "Answer the current card, then set how strong it feels."
  };
}

function syncAppChrome(view) {
  var copy = viewCopy(view);
  var title = el("viewTitle"), sub = el("viewSub");
  if (title) title.textContent = copy.title;
  if (sub) sub.textContent = copy.sub;
  // "Too Easy" is reached through the Library now, so keep Library lit for it.
  // Sentences is a practice sub-mode, so keep Practice lit while translating.
  var navView = (view === "tooEasy") ? "library" : (view === "sentences") ? "practice" : view;
  document.querySelectorAll(".appnav-item").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-appview") === navView);
  });
  document.body.classList.toggle("sentences-mode", view === "sentences");
  document.body.classList.toggle("settings-mode", view === "settings");
  syncPosNote();
}

/* A narrowed deck has to say so, or a short queue looks like a bug. */
/* The label for whatever narrowing is in force, or "" when the whole deck is
   in play. Used by the practice pill, the list header and the stats heading. */
function scopeLabel() {
  if (posFilter() !== "all") return posLabelFor(posFilter());
  if (srcFilter() === "slang" && natFilter() !== "all") return natLabelFor(natFilter()) + " slang";
  if (srcFilter() !== "all") return srcLabelFor(srcFilter());
  return "";
}

function syncPosNote() {
  var note = el("posNote");
  if (!note) return;
  var label = scopeLabel();
  note.classList.toggle("hidden", !label);
  if (label) note.textContent = label + " only";
}

function showPractice() {
  appView = "practice";
  browseActive = false;
  deckNavSelected = null;
  syncAppChrome("practice");
  showScreen(practiceDone ? "screenDone" : "screenTest");
  renderTabs();
  setTimeout(function () { if (elAns && !practiceDone) elAns.focus(); }, 30);
}

function syncSettingsFields() {
  if (!el("setStrikes")) return;
  el("setStrikes").value = S.cfg.strikeLimit;
  el("setNew").value = S.cfg.newPerDay;
  el("setPart").value = String(S.cfg.partWeight);
  el("setSpeak").value = S.cfg.autoSpeak ? "1" : "0";
}

function showStatsView() {
  if (appView === "sentences") deckNavSelected = "sentences";
  appView = "stats";
  browseActive = false;
  syncAppChrome("stats");
  renderStatsScreen();
  showScreen("screenStats");
  renderTabs();
}

function showSettingsView() {
  if (appView === "sentences") deckNavSelected = "sentences";
  appView = "settings";
  browseActive = false;
  syncAppChrome("settings");
  syncSettingsFields();
  showScreen("screenSettings");
  renderTabs();
}

/* ---------------- sentence translation mode ---------------- */
var SENTENCES = window.SENTENCES || [];
var SENT_BY_RANK = {};
SENTENCES.forEach(function (s) { SENT_BY_RANK[s.r] = s; });
var sCurrent = null;     // current sentence object
var sChecked = false;

/* normalise an English answer for matching (lowercase, expand contractions,
   drop punctuation, collapse spaces). */
function normEn(s) {
  s = " " + String(s || "").toLowerCase().replace(/[’]/g, "'") + " ";
  s = s.replace(/n't\b/g, " not").replace(/'re\b/g, " are").replace(/'ve\b/g, " have")
       .replace(/'ll\b/g, " will").replace(/'m\b/g, " am").replace(/'d\b/g, " would");
  s = s.replace(/[.,!?;:"“”()]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}
/* A point that needs "tall" should be satisfied by "taller", one that needs
   "graduate" by "graduated". Without this, valid paraphrases of the deck's own
   sample answers get marked wrong. Applied only to the "needed" side. */
var SUFFIXES = ["s", "es", "'s", "d", "ed", "r", "er", "st", "est", "ing", "ies", "ied"];
function wordForms(token) {
  var out = [], i, suf;
  var doubles = token.length > 2 &&
    "aeiouwxy".indexOf(token.charAt(token.length - 1)) < 0 &&
    "aeiou".indexOf(token.charAt(token.length - 2)) >= 0 &&
    "aeiou".indexOf(token.charAt(token.length - 3)) < 0;
  for (i = 0; i < SUFFIXES.length; i++) {
    suf = SUFFIXES[i];
    out.push(token + suf);
    if (token.slice(-1) === "e") out.push(token.slice(0, -1) + suf);
    if (token.slice(-1) === "y") out.push(token.slice(0, -1) + "i" + suf);
    if (doubles) out.push(token + token.slice(-1) + suf);   // stop -> stopped
  }
  return out;
}

/* How well `token` matches, as the length of what it matched — 0 for no match.
   Length is what lets a more specific pattern outrank a looser one in
   gradePoints; anywhere a yes/no answer is enough, just test for truthiness.

   Phrases match on word boundaries, not as raw substrings. Without that,
   "how much does this cost" is found inside "how much does this costs", and
   "most students" inside "almost students" — so the very errors a point lists
   as wrong sail through it. */
function hasTok(norm, token, fuzzy, banned) {
  token = normEn(token);
  if (!token) return 0;
  var pad = " " + norm + " ";
  if (token.indexOf(" ") >= 0) {                                          // phrase
    return pad.indexOf(" " + token + " ") >= 0 ? token.length : 0;
  }
  if (pad.indexOf(" " + token + " ") >= 0) return token.length;           // whole word
  if (!fuzzy) return 0;
  // A form the point explicitly lists as wrong must not be rescued by fuzzing:
  // those are the verb-form errors the sentence is there to teach.
  var forms = wordForms(token);
  for (var i = 0; i < forms.length; i++) {
    if (banned && banned.indexOf(forms[i]) >= 0) continue;
    if (pad.indexOf(" " + forms[i] + " ") >= 0) return token.length;
  }
  return 0;
}

function bestMatch(list, norm, fuzzy, banned) {
  var best = 0;
  for (var i = 0; i < (list || []).length; i++) {
    best = Math.max(best, hasTok(norm, list[i], fuzzy, banned));
  }
  return best;
}

/* Forms that are everywhere in real speech but that a grammar book marks wrong.
   The learner's answer is rewritten to the textbook form and re-graded; if that
   passes, the answer is accepted and the note explains what was informal. */
var SPOKEN_FORMS = [
  { re: /\bgonna\b/gi,  to: "going to",
    note: "“gonna” is how “going to” is said — normal in speech, but write “going to”." },
  { re: /\bwanna\b/gi,  to: "want to",
    note: "“wanna” is how “want to” is said — normal in speech, but write “want to”." },
  { re: /\bgotta\b/gi,  to: "have got to",
    note: "“gotta” is how “got to” is said — normal in speech, but write “have got to”." },
  { re: /\bkinda\b/gi,  to: "kind of",
    note: "“kinda” is how “kind of” is said — normal in speech, but write “kind of”." },
  { re: /\bgimme\b/gi,  to: "give me",
    note: "“gimme” is how “give me” is said — normal in speech, but write “give me”." },
  { re: /\blemme\b/gi,  to: "let me",
    note: "“lemme” is how “let me” is said — normal in speech, but write “let me”." },
  { re: /\b(?:cuz|coz|'cause)\b/gi, to: "because",
    note: "“cuz” for “because” — fine in speech and texting, not in writing." },
  { re: /\b(could|would|should|must|might) of\b/gi, to: "$1 have",
    note: "“$1 of” sounds exactly like “$1’ve”, which is why it is so common — but in writing it is “$1 have”." },
  { re: /\bthere(?:'s| is)\b(?=[^,.;?!]*\b(?:two|three|four|five|six|seven|eight|nine|ten|many|several|some|lots|a lot|\w+s)\b)/gi,
    to: "there are",
    note: "“there’s” before a plural is what almost everyone says — the textbook form is “there are”." },
  { re: /\bthere was\b(?=[^,.;?!]*\b(?:two|three|four|five|six|seven|eight|nine|ten|many|several|\w+s)\b)/gi,
    to: "there were",
    note: "“there was” before a plural is very common in speech — the textbook form is “there were”." },
  { re: /\bless\b(?=\s+\w+s\b)/gi, to: "fewer",
    note: "“less” with countable things is everywhere in speech — writing prefers “fewer”." },
  { re: /\bif (i|he|she|it) was\b/gi, to: "if $1 were",
    note: "“if $1 was” is normal in speech; the subjunctive “if $1 were” is the textbook form." },
  { re: /\bthan me\b/gi,   to: "than I",   note: "“than me” is what people say; strict grammar wants “than I”." },
  { re: /\bthan him\b/gi,  to: "than he",  note: "“than him” is what people say; strict grammar wants “than he”." },
  { re: /\bthan her\b/gi,  to: "than she", note: "“than her” is what people say; strict grammar wants “than she”." },
  { re: /\bthan them\b/gi, to: "than they",note: "“than them” is what people say; strict grammar wants “than they”." },
  { re: /\bme and (\w+)\b/gi, to: "$1 and I",
    note: "“me and …” as the subject is extremely common in speech — writing wants “… and I”." },
  { re: /\b(doing|feeling) good\b/gi, to: "$1 well",
    note: "“$1 good” is standard in American speech; the textbook form is “$1 well”." },
  { re: /\bdifferent than\b/gi, to: "different from",
    note: "“different than” is normal in American English; “different from” is the safer written form." }
];

/* Rewrite spoken forms to their textbook equivalents. */
function toTextbook(answer) {
  var text = String(answer || ""), notes = [];
  SPOKEN_FORMS.forEach(function (rule) {
    rule.re.lastIndex = 0;
    if (!rule.re.test(text)) return;
    rule.re.lastIndex = 0;
    var note = rule.note;
    text = text.replace(rule.re, function () {
      var args = arguments;
      note = note.replace(/\$(\d)/g, function (_, i) { return args[i] || ""; });
      return rule.to.replace(/\$(\d)/g, function (_, i) { return args[i] || ""; });
    });
    notes.push(note);
  });
  return { text: text, notes: notes };
}

function gradePoints(sent, answer) {
  var n = normEn(answer);
  if (!n) return { empty: true };
  var exact = sent.en.map(normEn).indexOf(n) >= 0;
  var points = (sent.points || []).map(function (p) {
    var banned = (p.wrong || []).map(normEn);
    // The longer pattern describes what was typed more precisely, so it wins.
    // "close the window" is in the needed list, but "you close the window" is
    // listed as wrong and matches more of the answer — so the answer is wrong.
    var need = bestMatch(p.need, n, true, banned);
    var wrong = bestMatch(p.wrong, n, false);
    var ok = need > 0 && wrong <= need;
    return { p: p, status: ok ? "ok" : (wrong ? "wrong" : "missing") };
  });
  var failed = points.filter(function (x) { return x.status !== "ok"; });
  return { correct: exact || failed.length === 0, exact: exact, points: points, failed: failed };
}

/* Accept several phrasings; accept natural spoken ones with a note; otherwise
   diagnose each tested point. */
function gradeSentence(sent, answer) {
  var res = gradePoints(sent, answer);
  if (res.empty || res.correct) return res;
  var spoken = toTextbook(answer);
  if (!spoken.notes.length) return res;
  var alt = gradePoints(sent, spoken.text);
  if (!alt.correct) return res;
  alt.spoken = spoken.notes;      // right in real life, worth a word about why
  alt.exact = false;
  return alt;
}

function sProg() { return S.sentences; }
function sWord(rank) {
  var p = sProg();
  if (!p.words[rank]) p.words[rank] = sanitizeWord(null);
  return p.words[rank];
}
function sStatus(rank) {
  var w = sProg().words[rank];
  if (!w || !w.seen) return "new";
  if (w.retired || w.lvl >= MAX_LEVEL) return "strong";
  if (w.due <= todayIndex()) return "due";
  return "learning";
}

/* spaced-repetition pick: due reviews first, then new, then earliest-due. */
function pickSentence() {
  var t = todayIndex(), prog = sProg().words, due = [], i, s;
  for (i = 0; i < SENTENCES.length; i++) {
    s = SENTENCES[i]; var w = prog[s.r];
    if (w && w.seen && !w.retired && w.due <= t) due.push(s);
  }
  due.sort(function (a, b) { return (prog[a.r].due - prog[b.r].due) || (a.r - b.r); });
  var notSame = function (x) { return !sCurrent || x.r !== sCurrent.r; };
  var dueOther = due.filter(notSame);
  if (dueOther.length) return dueOther[0];
  for (i = 0; i < SENTENCES.length; i++) { s = SENTENCES[i]; if (!prog[s.r] || !prog[s.r].seen) return s; }
  if (due.length) return due[0];
  var all = SENTENCES.slice().sort(function (a, b) {
    return ((prog[a.r] && prog[a.r].due) || 0) - ((prog[b.r] && prog[b.r].due) || 0);
  });
  return all.filter(notSame)[0] || all[0] || null;
}

function recordSentenceResult(sent, correct) {
  var t = todayIndex();
  if (!sProg().day || sProg().day.idx !== t) sProg().day = blankDay();
  var sd = sProg().day;
  var w = sWord(sent.r), wasNew = !w.seen;
  w.seen = true; w.lastSeen = t;
  if (correct) {
    w.lvl = Math.min(MAX_LEVEL, wasNew ? 1 : w.lvl + 1);
    w.right = (w.right || 0) + 1; w.streak = (w.streak || 0) + 1; w.lastGrade = "good";
    w.due = t + (INTERVALS[w.lvl] != null ? INTERVALS[w.lvl] : 1);
    if (wasNew) sd.newCount++; else sd.revCount++;
    sd.wrongToday = (sd.wrongToday || []).filter(function (it) { return it.r !== sent.r; });
  } else {
    w.lvl = 0; w.wrong = (w.wrong || 0) + 1; w.streak = 0;
    w.lapses = (w.lapses || 0) + 1; w.lastGrade = "again";
    w.due = t + (INTERVALS[0] != null ? INTERVALS[0] : 0);
    var wt = sd.wrongToday = sd.wrongToday || [];
    if (!wt.some(function (it) { return it.r === sent.r; })) wt.push({ r: sent.r, kind: "wrong" });
  }
  if (wasNew) sProg().totals.everSeen = (sProg().totals.everSeen || 0) + 1;
  persist();
}

function renderSentenceProgress() {
  if (!el("sStat")) return;
  var dueN = 0, strong = 0, newN = 0;
  SENTENCES.forEach(function (s) {
    var st = sStatus(s.r);
    if (st === "strong") strong++; else if (st === "new") newN++; else if (st === "due") dueN++;
  });
  el("sStat").textContent = "Due " + dueN + " · New " + newN + " · Strong " + strong + " / " + SENTENCES.length;
}

function showSentencesView() {
  appView = "sentences";
  browseActive = false;
  deckNavSelected = null;
  syncAppChrome("sentences");
  renderTabs();
  refreshStats();
  if (!sChecked) { sCurrent = pickSentence(); renderSentence(); }
  showScreen("screenSentences");
  setTimeout(function () { var t = el("sAnswer"); if (t) t.focus(); }, 30);
}

function renderSentence() {
  sChecked = false;
  if (!el("sZh")) return;
  renderSentenceProgress();
  var sent = sCurrent;
  if (!sent) { el("sZh").textContent = "—"; el("sPointTags").innerHTML = ""; return; }
  el("sZh").textContent = sent.zh;
  el("sProgress").textContent = sStatus(sent.r);
  el("sPointTags").innerHTML = (sent.points || []).map(function (p) {
    return '<span class="spoint">' + escapeHtml(p.reason) + "</span>";
  }).join("");
  el("sAnswer").value = "";
  el("sFeedback").innerHTML = "";
  el("sFeedback").className = "s-feedback";
  el("sCheck").classList.remove("hidden");
  el("sNext").classList.add("hidden");
}

function checkSentence() {
  if (sChecked) return;
  var sent = sCurrent;
  if (!sent) return;
  var res = gradeSentence(sent, el("sAnswer").value);
  var fb = el("sFeedback");
  if (res.empty) { fb.className = "s-feedback"; fb.innerHTML = '<div class="s-head">Type a translation first.</div>'; return; }
  sChecked = true;
  recordSentenceResult(sent, res.correct);
  renderSentenceProgress();
  refreshStats();
  var html = "";
  if (res.correct && res.spoken) {
    fb.className = "s-feedback ok spoken";
    html += '<div class="s-head">✓ Accepted — that is how people really say it</div>';
    html += '<ul class="s-issues">';
    res.spoken.forEach(function (note) { html += "<li>" + escapeHtml(note) + "</li>"; });
    html += "</ul>";
  } else if (res.correct) {
    fb.className = "s-feedback ok";
    html += '<div class="s-head">✓ ' + (res.exact ? "Correct!" : "Looks right!") + "</div>";
  } else {
    fb.className = "s-feedback bad";
    html += '<div class="s-head">✗ Not quite — likely issue' + (res.failed.length > 1 ? "s" : "") + ":</div>";
    html += '<ul class="s-issues">';
    res.failed.forEach(function (x) {
      html += "<li><b>" + escapeHtml(x.p.reason) + "</b> — " + escapeHtml(x.p.label) +
        ' <span class="s-why">(' + (x.status === "wrong" ? "wrong form" : "missing") + ")</span></li>";
    });
    html += "</ul>";
  }
  html += '<div class="s-ref"><span>Sample answer</span>' + escapeHtml(sent.en[0]) + "</div>";
  if (sent.en.length > 1) {
    html += '<div class="s-alts">also accepted: ' + sent.en.slice(1).map(escapeHtml).join(" · ") + "</div>";
  }
  fb.innerHTML = html;
  el("sCheck").classList.add("hidden");
  el("sNext").classList.remove("hidden");
}

function nextSentence() {
  sCurrent = pickSentence();
  renderSentence();
  setTimeout(function () { var t = el("sAnswer"); if (t) t.focus(); }, 30);
}

function skipSentence() { nextSentence(); }   // move on without recording a result

/* ---------------- deck tabs ---------------- */

/* Selecting a deck keeps you in whatever view you were already in. `scope` is
   the sub-entry that was clicked: a word type on Vocabulary, a nation on
   Expressions, or undefined for the deck's own row. */
function selectDeck(id, patch) {
  var prevView = appView;
  var changed = false;
  if (patch) {
    Object.keys(patch).forEach(function (k) {
      if (S.cfg[k] !== patch[k]) { S.cfg[k] = patch[k]; changed = true; }
    });
    if (changed) save();
  }

  if (prevView === "stats" || prevView === "settings") {
    deckNavSelected = id;
    if (id !== S.active) switchDeck(id);
    else if (changed) startSession();
    showStatsView(); renderTabs();
  } else if (browseActive) {
    deckNavSelected = null;
    if (id !== S.active) switchDeck(id);     // switchDeck re-opens browse for the new deck
    else { if (changed) startSession(); openBrowse(browseView); }
  } else {
    deckNavSelected = null;
    appView = "practice";
    syncAppChrome("practice");
    if (id !== S.active) switchDeck(id);
    else {
      if (changed) startSession();
      showScreen(practiceDone ? "screenDone" : "screenTest");
      renderTabs();
    }
  }
}

var CHEVRON = '<span class="chev" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></span>';

function tabButton(label, count, active, onClick, cls, open) {
  var b = document.createElement("button");
  b.className = "tab" + (cls ? " " + cls : "") + (active ? " active" : "") +
    (open === undefined ? "" : " parent" + (open ? " open" : ""));
  b.innerHTML = '<span class="tabname">' + (open === undefined ? "" : CHEVRON) +
    escapeHtml(label) + "</span>" +
    '<span class="tabcount">' + count.toLocaleString() + "</span>";
  if (open !== undefined) b.setAttribute("aria-expanded", open ? "true" : "false");
  b.addEventListener("click", onClick);
  return b;
}

/* Which deck's sub-list is unfolded. Runtime only — but it starts unfolded on
   whichever deck the saved scope belongs to, so a narrowed deck shows you where
   you are instead of looking like the whole thing. */
var navOpen = null;
function initNavOpen() {
  if (navOpen) return;
  var src = srcFilterValid(S.cfg.src);
  navOpen = {
    vocab: posFilterValid(S.cfg.pos) !== "all",
    expressions: src !== "all",
    // Slang folds on its own; a saved nation means it was open.
    slang: src === "slang" && natFilterValid(S.cfg.nat) !== "all"
  };
}
function toggleNav(id) { initNavOpen(); navOpen[id] = !navOpen[id]; }
function navIsOpen(id) { initNavOpen(); return !!navOpen[id]; }

/* How many entries the given part-of-speech filter would leave. Counting walks
   15,000 meanings, so cache it — the answer only depends on the data. */
var posCountCache = {};
function posCount(deckId, id) {
  var key = deckId + "|" + id;
  if (posCountCache[key] !== undefined) return posCountCache[key];
  var data = DECKS[deckId] || [], n = 0;
  if (id === "all") n = data.length;
  else {
    for (var i = 0; i < data.length; i++) {
      if (posMatchesWith(data[i], id, deckId)) n++;
    }
  }
  return (posCountCache[key] = n);
}

var exprCountCache = {};
function exprCount(srcId, natId) {
  var key = srcId + "|" + (natId || "all");
  if (exprCountCache[key] !== undefined) return exprCountCache[key];
  var data = DECKS.expressions || [], n = 0;
  for (var i = 0; i < data.length; i++) {
    if (srcMatchesWith(data[i], srcId) && natMatchesWith(data[i], natId || "all")) n++;
  }
  return (exprCountCache[key] = n);
}

function renderTabs() {
  var nav = el("tabs");
  if (!nav) return;
  nav.innerHTML = "";
  var sel = currentNavSelected();

  DECK_IDS.forEach(function (id) {
    var narrowed = id === "vocab" ? posFilter() !== "all" : srcFilter() !== "all";
    var splits = id === "vocab" ? deckHasPosFor("vocab") : deckHasSrcFor("expressions");
    var open = splits && navIsOpen(id);
    // A deck that splits gets a chevron: the click both selects the whole deck
    // and folds its list open or shut.
    nav.appendChild(tabButton(DECK_LABELS[id], DECKS[id].length, id === sel && !narrowed, function () {
      toggleNav(id);
      selectDeck(id, id === "vocab" ? { pos: "all" } : { src: "all", nat: "all" });
    }, "", splits ? open : undefined));
    if (!open) return;
    // Sub-entries are views over the same deck and the same progress, not decks
    // of their own: word types on Vocabulary, kinds of expression on Expressions.
    if (id === "vocab") {
      POS_FILTERS.forEach(function (f) {
        if (f.id === "all") return;
        nav.appendChild(tabButton(f.label, posCount("vocab", f.id),
          sel === "vocab" && posFilter() === f.id,
          function () { selectDeck("vocab", { pos: f.id }); }, "subtab"));
      });
    }
    if (id === "expressions") {
      SRC_FILTERS.forEach(function (f) {
        if (f.id === "all") return;
        var chosen = sel === "expressions" && srcFilter() === f.id;
        // Slang folds too — nations belong to it alone.
        var splits = f.id === "slang" && exprCount("slang") > 0;
        var open = splits && navIsOpen("slang");
        nav.appendChild(tabButton(f.label, exprCount(f.id),
          chosen && natFilter() === "all",
          function () {
            if (splits) toggleNav("slang");
            selectDeck("expressions", { src: f.id, nat: "all" });
          }, "subtab", splits ? open : undefined));
        if (open) {
          NAT_FILTERS.forEach(function (nf) {
            if (nf.id === "all") return;
            nav.appendChild(tabButton(nf.label, exprCount("slang", nf.id),
              natFilter() === nf.id,
              function () { selectDeck("expressions", { src: "slang", nat: nf.id }); }, "subtab deep"));
          });
        }
      });
    }
  });
  var sb = document.createElement("button");
  sb.className = "tab" + (sel === "sentences" ? " active" : "");
  sb.innerHTML = '<span class="tabname">Sentences</span>' +
    '<span class="tabcount">' + SENTENCES.length + "</span>";
  sb.addEventListener("click", function () {
    var prevView = appView;
    if (prevView === "stats") {
      deckNavSelected = "sentences"; showStatsView(); renderTabs();
    } else if (prevView === "settings") {
      deckNavSelected = "sentences"; showStatsView(); renderTabs();
    } else if (browseActive) {
      // Stay in the Today/Library view, now showing sentences.
      deckNavSelected = "sentences"; openBrowse(browseView);
    } else {
      deckNavSelected = null; showSentencesView();
    }
  });
  nav.appendChild(sb);
}

function switchDeck(id) {
  if (id === S.active || !DECKS[id]) return;
  var wasBrowsing = browseActive;
  var previousBrowseView = browseView;
  S.active = id;
  persist();             // saves the whole store (all decks) + queues a cloud sync
  renderTabs();
  syncPosNote();         // the filter is inert on decks without tags
  startSession();        // builds today's session for the newly active deck
  if (wasBrowsing) openBrowse(previousBrowseView);   // stay in browse, now showing the new deck
}

/* ---------------- browse / list view ---------------- */
var browseActive = false;
var browseTimer = null;
var browseView = "today";

function itemStatus(rank) {
  var w = D().words[rank];
  if (!w || !w.seen) return "new";
  if (w.retired) return "retired";
  if (w.due <= todayIndex()) return "due";
  if (w.lvl >= 5) return "mastered";
  return "learning";
}

/* ---------------- part-of-speech filter ---------------- */

/* Tags are parsed out of the Chinese meaning ("n. 水, 海水" -> ["n."]), which
   only the Vocabulary deck carries; phrases have none. Cached per deck since
   splitMeaning() runs a regex over every sense. */
var posCache = {};      // deckId -> { rank: ["n.", "v."] }
var deckPos = {};       // deckId -> does this deck carry tags at all

function posTagsFor(d, deckId) {
  var cache = posCache[deckId] || (posCache[deckId] = {});
  if (cache[d.r]) return cache[d.r];
  var tags = [];
  splitMeaning(d.c).forEach(function (part) {
    if (part.label && tags.indexOf(part.label) === -1) tags.push(part.label);
  });
  return (cache[d.r] = tags);
}

function deckHasPosFor(deckId) {
  if (deckPos[deckId] === undefined) {
    var data = DECKS[deckId] || [];
    deckPos[deckId] = data.slice(0, 200).some(function (d) { return posTagsFor(d, deckId).length > 0; });
  }
  return deckPos[deckId];
}

function posMatchesWith(d, want, deckId) {
  if (want === "all") return true;
  var tags = posTagsFor(d, deckId);
  if (want === "other") {
    return !tags.some(function (t) { return POS_MAIN.indexOf(t) !== -1; });
  }
  return tags.indexOf(want) !== -1;
}

function posTags(d) { return posTagsFor(d, S.active); }
function deckHasPos() { return deckHasPosFor(S.active); }

/* The filter only bites on decks that have tags, so choosing "Adjectives" and
   then switching to Expressions shows expressions rather than an empty deck. */
function posFilter() {
  return deckHasPos() ? posFilterValid(S.cfg.pos) : "all";
}

function posMatches(d) { return posMatchesWith(d, posFilter(), S.active); }

/* Kind-of-expression filter: only meaningful on the Expressions deck. */
function deckHasSrcFor(deckId) {
  return (DECKS[deckId] || []).some(function (d) { return !!d.src; });
}
function srcFilter() {
  return (S.active === "expressions") ? srcFilterValid(S.cfg.src) : "all";
}
function srcMatchesWith(d, want) { return want === "all" || d.src === want; }
function srcMatches(d) { return srcMatchesWith(d, srcFilter()); }

/* Nations sit under Slang, so they only bite once Slang is the chosen kind. */
function natFilter() {
  return srcFilter() === "slang" ? natFilterValid(S.cfg.nat) : "all";
}
function natMatchesWith(d, want) { return want === "all" || d.nat === want; }
function natMatches(d) { return natMatchesWith(d, natFilter()); }

function labelIn(list, id) {
  for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i].label; }
  return "All";
}
function natLabelFor(id) { return labelIn(NAT_FILTERS, id); }
function srcLabelFor(id) { return labelIn(SRC_FILTERS, id); }

/* The one predicate every list and queue goes through. */
function inScope(d) { return posMatches(d) && srcMatches(d) && natMatches(d); }

function posMatchesRank(rank) {
  var d = curIndex()[rank];
  return !d || inScope(d);
}

function posLabelFor(id) {
  for (var i = 0; i < POS_FILTERS.length; i++) {
    if (POS_FILTERS[i].id === id) return POS_FILTERS[i].label;
  }
  return "All";
}

function entryMatches(d, q) {
  if (!inScope(d)) return false;
  if (!q) return true;
  return d.w.toLowerCase().indexOf(q) !== -1 ||
    String(d.c || "").toLowerCase().indexOf(q) !== -1;
}

function rankEntry(rank) { return curIndex()[rank]; }

function dailyGoalText() {
  var due = dueReviews().length;
  var focus = sanitizeFocus(D().day.wrongToday).length;
  var remainingNew = Math.max(0, S.cfg.newPerDay - D().day.newCount);
  var hasNew = nextUnseenRank() !== null && remainingNew > 0;
  if (D().day.strikes >= S.cfg.strikeLimit) return "Paused at the strike limit. Drill the focus list, then come back fresh.";
  if (!due && !focus && !hasNew) return "Today's goal is complete for this deck.";
  return due + " review" + (due === 1 ? "" : "s") + " due · " +
    focus + " focus item" + (focus === 1 ? "" : "s") + " · " +
    remainingNew + " new left today";
}

function browseStat(rank) {
  var w = D().words[rank];
  return '<span class="bstat ' + itemStatus(rank) + '">' + escapeHtml(strengthLabel(w)) + "</span>";
}

function gradePickerHtml(rank) {
  var w = D().words[rank];
  var currentGrade = w && w.retired ? "retire" : normalizeGrade(w && w.lastGrade);
  return '<div class="scaleedit" data-rank="' + rank + '">' + GRADE_IDS.map(function (g) {
    var meta = GRADE_META[g];
    return '<button type="button" class="scalebtn ' + (currentGrade === g ? "selected" : "") +
      '" data-grade="' + g + '">' + meta.label + "</button>";
  }).join("") + "</div>";
}

var SPEAK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l4.5-3.5v13L7 15H4z"/>' +
  '<path d="M15.5 9.2a4 4 0 0 1 0 5.6"/><path d="M18.2 6.5a7.8 7.8 0 0 1 0 11"/></svg>';

function speakBtnHtml(text) {
  if (!window.Pron || !Pron.available()) return "";
  return '<button type="button" class="speak-btn mini" data-action="speak" aria-label="Hear it" title="Hear it" data-text="' +
    escapeHtml(String(text)) + '">' + SPEAK_ICON + "</button>";
}

/* One-line meaning for a list row: same ordering and domain naming the card
   uses, so "for" leads with 为, 因为 rather than a DOS batch command. */
function meaningSummaryHtml(text) {
  return splitMeaning(text).map(function (p) {
    return (p.label ? '<span class="bc-pos">' + escapeHtml(p.label) + "</span> " : "") +
      (p.domain ? '<span class="meaning-domain">' + escapeHtml(p.domain) + "</span> " : "") +
      escapeHtml(p.text);
  }).join(' <span class="bc-sep">/</span> ');
}

/* Collapsed placeholders, one per word type; sentences built on first open. */
function exampleStubHtml(word) {
  var groups = examplesFor(word);
  var types = exampleTypes(word);
  if (!types.length) return "";
  return '<div class="ex-stubs">' + types.map(function (t) {
    var n = groups[t].length;
    return '<details class="ex-details" data-ex="' + escapeHtml(String(word)) +
      '" data-type="' + escapeHtml(t) + '"><summary>' + n + " example" +
      (n === 1 ? "" : "s") + " as " +
      escapeHtml((EX_TYPE_NAME[t] || t).toLowerCase()) + "</summary></details>";
  }).join("") + "</div>";
}

function phoneticHtml(text) {
  var ipa = window.Pron ? Pron.phonetic(text) : "";
  return ipa ? '<span class="phonetic mini">/' + escapeHtml(ipa) + "/</span>" : "";
}

function browseItemHtml(d, opts) {
  opts = opts || {};
  var w = D().words[d.r];
  var due = w && w.seen && !w.retired ? dueLabel(w.due) : (w && w.retired ? "retired" : "not started");
  return '<div class="browseitem rich" data-rank="' + d.r + '">' +
    '<div class="bmain"><div class="bline"><span class="bw">' + escapeHtml(d.w) + "</span>" +
    speakBtnHtml(d.w) + phoneticHtml(d.w) + "</div>" +
    '<span class="bc">' + meaningSummaryHtml(d.c) + "</span></div>" +
    exampleStubHtml(d.w) +
    '<div class="bmeta">' + browseStat(d.r) + '<span class="bdue">' + escapeHtml(due) + "</span></div>" +
    (opts.edit ? gradePickerHtml(d.r) : "") +
    (opts.restore ? '<button type="button" class="mini-action" data-action="restore" data-rank="' + d.r + '">Restore</button>' : "") +
    "</div>";
}

function renderBrowseSection(title, rows, emptyText, actionHtml) {
  return '<section class="browse-section"><div class="section-title">' + escapeHtml(title) +
    (actionHtml || "") + "</div>" +
    (rows.length ? rows.join("") : '<div class="browseempty">' + escapeHtml(emptyText) + "</div>") +
    "</section>";
}

function uniqueRanks(ranks) {
  var seen = {}, out = [];
  ranks.forEach(function (r) {
    if (r == null || seen[r]) return;
    seen[r] = 1; out.push(r);
  });
  return out;
}

function renderBrowse() {
  rollDayIfNeeded();
  if (currentNavSelected() === "sentences") { renderSentenceBrowse(); return; }
  var q = (el("browseSearch").value || "").trim().toLowerCase();
  var data = curData();
  var parts = [], matches = 0, i, d, w;
  var CAP = browseView === "all" ? 2000 : 400;

  if (browseView === "today") {
    var focusRanks = uniqueRanks(sanitizeFocus(D().day.wrongToday).map(function (x) { return x.r; }));
    var dueRanks = uniqueRanks(dueReviews());
    var newRanks = [];
    var remainingNew = Math.max(0, S.cfg.newPerDay - D().day.newCount);
    for (i = 0; i < data.length && newRanks.length < Math.min(10, remainingNew); i++) {
      d = data[i];
      if ((!D().words[d.r] || !D().words[d.r].seen) && entryMatches(d, q)) newRanks.push(d.r);
    }
    var focusRows = focusRanks.map(rankEntry).filter(function (x) { return x && entryMatches(x, q); }).map(function (x) { return browseItemHtml(x, { edit: true }); });
    var dueRows = dueRanks.map(rankEntry).filter(function (x) { return x && entryMatches(x, q); }).map(function (x) { return browseItemHtml(x, { edit: true }); });
    var newRows = newRanks.map(rankEntry).filter(Boolean).map(function (x) { return browseItemHtml(x); });
    parts.push('<div class="daily-card">' + escapeHtml(dailyGoalText()) + "</div>");
    parts.push(renderBrowseSection("Focus today", focusRows, "No shaky or missed items yet.",
      focusRows.length ? '<button type="button" class="mini-action inline" data-action="drill-focus">Drill</button>' : ""));
    parts.push(renderBrowseSection("Due now", dueRows, "No scheduled reviews due right now."));
    parts.push(renderBrowseSection("New available", newRows, "No new items left for today's goal."));
    matches = focusRows.length + dueRows.length + newRows.length;
  } else if (browseView === "answered") {
    var answered = sanitizeAnswered(D().day.answeredToday).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    answered.forEach(function (it) {
      d = rankEntry(it.r);
      if (!d || !entryMatches(d, q)) return;
      matches++;
      if (parts.length < CAP) parts.push(browseItemHtml(d, { edit: true }));
    });
  } else if (browseView === "upcoming") {
    var upcoming = [];
    for (var rank in D().words) {
      w = D().words[rank];
      d = rankEntry(parseInt(rank, 10));
      if (!d || !w.seen || w.retired || w.due <= todayIndex() || !entryMatches(d, q)) continue;
      upcoming.push({ d: d, due: w.due });
    }
    upcoming.sort(function (a, b) { return a.due - b.due || a.d.f - b.d.f; });
    upcoming.forEach(function (it) {
      matches++;
      if (parts.length < CAP) parts.push(browseItemHtml(it.d, { edit: true }));
    });
  } else if (browseView === "retired") {
    data.forEach(function (item) {
      w = D().words[item.r];
      if (!w || !w.retired || !entryMatches(item, q)) return;
      matches++;
      if (parts.length < CAP) parts.push(browseItemHtml(item, { restore: true }));
    });
  } else {
    for (i = 0; i < data.length; i++) {
      d = data[i];
      if (!entryMatches(d, q)) continue;
      matches++;
      if (parts.length < CAP) parts.push(browseItemHtml(d, { edit: !!(D().words[d.r] && D().words[d.r].seen) }));
    }
  }

  el("browseList").innerHTML = parts.length ? parts.join("") : '<div class="browseempty">No matches.</div>';
  var scope = scopeLabel() ? " · " + scopeLabel() : "";
  var label = q ? matches.toLocaleString() + " match" + (matches === 1 ? "" : "es") + scope :
    DECK_LABELS[S.active] + " · " + browseView + scope;
  if (matches > CAP) label += " · showing first " + CAP.toLocaleString() + ", search to narrow";
  el("browseCount").textContent = label;
}

/* ---------------- sentence browse (Today / Library for the Sentences deck) ---------------- */
function sentenceMatches(sent, q) {
  if (!q) return true;
  if (String(sent.zh || "").toLowerCase().indexOf(q) !== -1) return true;
  return (sent.en || []).some(function (e) { return String(e).toLowerCase().indexOf(q) !== -1; });
}

/* sStatus() -> the shared .bstat colour class used by word rows */
var S_STATUS_CLASS = { new: "new", learning: "learning", due: "due", strong: "mastered" };

function sentenceItemHtml(sent) {
  var w = sProg().words[sent.r];
  var status = sStatus(sent.r);
  var due = w && w.seen && !w.retired ? dueLabel(w.due) : "not started";
  return '<div class="browseitem rich">' +
    '<div class="bmain"><span class="bw">' + escapeHtml(sent.zh) + "</span>" +
    '<div class="bline"><span class="bc">' + escapeHtml(sent.en[0] || "") + "</span>" +
    speakBtnHtml(sent.en[0] || "") + "</div></div>" +
    '<div class="bmeta"><span class="bstat ' + (S_STATUS_CLASS[status] || "new") + '">' +
    escapeHtml(strengthLabel(w)) + "</span>" +
    '<span class="bdue">' + escapeHtml(due) + "</span></div>" +
    "</div>";
}

function sentenceDailyGoalText() {
  var t = todayIndex(), prog = sProg().words, due = 0, unseen = 0;
  SENTENCES.forEach(function (s) {
    var w = prog[s.r];
    if (!w || !w.seen) unseen++;
    else if (!w.retired && w.due <= t) due++;
  });
  var sday = (sProg().day && sProg().day.idx === t) ? sProg().day : null;
  var focus = sday ? sanitizeFocus(sday.wrongToday).length : 0;
  if (!due && !focus && !unseen) return "You've reviewed every sentence available.";
  return due + " review" + (due === 1 ? "" : "s") + " due · " +
    focus + " focus item" + (focus === 1 ? "" : "s") + " · " +
    unseen + " new sentence" + (unseen === 1 ? "" : "s") + " available";
}

function renderSentenceBrowse() {
  var q = (el("browseSearch").value || "").trim().toLowerCase();
  var t = todayIndex(), prog = sProg().words;
  var sday = (sProg().day && sProg().day.idx === t) ? sProg().day : null;
  var parts = [], matches = 0;
  var CAP = browseView === "all" ? 2000 : 400;
  var visible = SENTENCES.filter(function (s) { return sentenceMatches(s, q); });

  if (browseView === "today") {
    var focusRanks = uniqueRanks((sday ? sanitizeFocus(sday.wrongToday) : []).map(function (x) { return x.r; }));
    var focusRows = focusRanks.map(function (r) { return SENT_BY_RANK[r]; })
      .filter(function (s) { return s && sentenceMatches(s, q); }).map(sentenceItemHtml);
    var dueRows = visible.filter(function (s) { return sStatus(s.r) === "due"; }).map(sentenceItemHtml);
    var newRows = visible.filter(function (s) { var w = prog[s.r]; return !w || !w.seen; }).slice(0, 10).map(sentenceItemHtml);
    parts.push('<div class="daily-card">' + escapeHtml(sentenceDailyGoalText()) + "</div>");
    parts.push(renderBrowseSection("Focus today", focusRows, "No missed sentences yet today."));
    parts.push(renderBrowseSection("Due now", dueRows, "No sentences due for review right now."));
    parts.push(renderBrowseSection("New available", newRows, "No new sentences left to start."));
    matches = focusRows.length + dueRows.length + newRows.length;
  } else if (browseView === "answered") {
    visible.forEach(function (s) {
      var w = prog[s.r];
      if (!w || !w.seen || w.lastSeen !== t) return;
      matches++;
      if (parts.length < CAP) parts.push(sentenceItemHtml(s));
    });
  } else if (browseView === "upcoming") {
    var up = visible.filter(function (s) { var w = prog[s.r]; return w && w.seen && !w.retired && w.due > t; });
    up.sort(function (a, b) { return (prog[a.r].due - prog[b.r].due) || (a.r - b.r); });
    up.forEach(function (s) { matches++; if (parts.length < CAP) parts.push(sentenceItemHtml(s)); });
  } else if (browseView === "retired") {
    // Sentences don't retire; surface the ones you've mastered instead (tab is relabelled "Mastered").
    visible.forEach(function (s) { if (sStatus(s.r) === "strong") { matches++; if (parts.length < CAP) parts.push(sentenceItemHtml(s)); } });
  } else {
    visible.forEach(function (s) { matches++; if (parts.length < CAP) parts.push(sentenceItemHtml(s)); });
  }

  el("browseList").innerHTML = parts.length ? parts.join("") : '<div class="browseempty">No matches.</div>';
  var label = q ? matches.toLocaleString() + " match" + (matches === 1 ? "" : "es") : "Sentences · " + browseView;
  if (matches > CAP) label += " · showing first " + CAP.toLocaleString() + ", search to narrow";
  el("browseCount").textContent = label;
}

/* keep the filter tab + search copy honest for whichever deck is being browsed */
function syncBrowseMode() {
  var isSent = currentNavSelected() === "sentences";
  var retiredBtn = document.querySelector('.browseview[data-view="retired"]');
  if (retiredBtn) retiredBtn.textContent = isSent ? "Mastered" : "Too Easy";
  var search = el("browseSearch");
  if (search) search.placeholder = isSent ? "Search sentences..." : "Search this deck...";
}

function setBrowseView(view) {
  browseView = view || "today";
  if (browseActive) {
    appView = appViewForBrowse(browseView);
    syncAppChrome(appView);
  }
  document.querySelectorAll(".browseview").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === browseView);
  });
  renderBrowse();
}

function openBrowse(view) {
  if (view) browseView = view;
  if (appView === "sentences") deckNavSelected = "sentences";
  browseActive = true;
  syncBrowseMode();
  appView = appViewForBrowse(browseView);
  syncAppChrome(appView);
  showScreen("screenBrowse");
  setBrowseView(browseView || "today");
  renderTabs();
}

function closeBrowse() {
  if (currentNavSelected() === "sentences") { showSentencesView(); return; }
  showPractice();
}

function restoreWord(rank) {
  var w = ensure(rank);
  w.retired = false;
  w.seen = true;
  w.lvl = Math.max(4, Math.min(MAX_LEVEL, w.lvl || 4));
  w.lastGrade = "easy";
  w.due = todayIndex() + (INTERVALS[w.lvl] || 30);
  recordAnswered(rank, "easy");
  save();
  refreshStats();
  renderBrowse();
}

function renderAuthBar() {
  var box = el("authBox");
  if (!box) return;
  if (!window.Cloud || !Cloud.configured) {
    // Cloud off entirely (no keys / offline). Quietly stay guest, no button.
    box.innerHTML = '<span class="authpill guest" title="Progress saved in this browser only">' +
      '<span class="dotc"></span><span class="who">Guest (local)</span></span>';
    return;
  }
  if (Cloud.user) {
    box.innerHTML = '<span class="authpill online"><span class="dotc"></span>' +
      '<span class="who">' + escapeHtml(Cloud.user.email) + '</span>' +
      '<button class="iconbtn" id="btnSignOut">Sign out</button></span>';
    el("btnSignOut").addEventListener("click", function () {
      Cloud.signOut().then(onAuthChanged);
    });
  } else {
    box.innerHTML = '<button class="iconbtn" id="btnOpenAuth">Sign in</button>';
    el("btnOpenAuth").addEventListener("click", openAuth);
  }
}

function openAuth() {
  authMode = "in";
  syncAuthModal();
  el("authMsg").textContent = "";
  el("authMsg").className = "authmsg";
  el("googleRow").style.display = (window.VOCABFLOW_CONFIG && window.VOCABFLOW_CONFIG.ENABLE_GOOGLE === false) ? "none" : "";
  el("authModal").classList.add("show");
  setTimeout(function () { el("authEmail").focus(); }, 30);
}
function closeAuth() { el("authModal").classList.remove("show"); }

function syncAuthModal() {
  el("authTitle").textContent = authMode === "in" ? "Sign in" : "Create account";
  el("btnAuthSubmit").textContent = authMode === "in" ? "Sign in" : "Create account";
  el("authPass").setAttribute("autocomplete", authMode === "in" ? "current-password" : "new-password");
  el("authSwitchText").innerHTML = authMode === "in"
    ? 'New here? <a id="authSwitch">Create an account</a>'
    : 'Already have an account? <a id="authSwitch">Sign in</a>';
  el("authSwitch").addEventListener("click", function () {
    authMode = authMode === "in" ? "up" : "in";
    el("authMsg").textContent = ""; el("authMsg").className = "authmsg";
    syncAuthModal();
  });
}

function authError(msg) { var m = el("authMsg"); m.className = "authmsg err"; m.textContent = msg; }
function authOk(msg) { var m = el("authMsg"); m.className = "authmsg ok"; m.textContent = msg; }

function submitAuth() {
  var email = el("authEmail").value.trim();
  var pw = el("authPass").value;
  if (!email || !pw) { authError("Enter an email and password."); return; }
  if (pw.length < 6) { authError("Password must be at least 6 characters."); return; }
  el("btnAuthSubmit").disabled = true;
  var p = authMode === "in" ? Cloud.signInEmail(email, pw) : Cloud.signUpEmail(email, pw);
  p.then(function (res) {
    el("btnAuthSubmit").disabled = false;
    if (res.error) { authError(res.error); return; }
    if (res.needsConfirm) {
      authOk("Account created — check your email to confirm, then sign in.");
      authMode = "in"; syncAuthModal();
      return;
    }
    closeAuth();
    onAuthChanged();
  });
}

function signInGoogle() {
  authOk("Redirecting to Google…");
  Cloud.signInGoogle().then(function (res) {
    if (res && res.error) authError(res.error);
  });
}

/* Called after any login/logout: reload the right data and restart. */
function onAuthChanged() {
  renderAuthBar();
  loadForCurrentUser().then(function () {
    rollDayIfNeeded();
    renderTabs();
    refreshStats();
    if (!syncPaused) setSynced(Cloud.user ? "synced ✓" : "");
    startSession();
  });
}

/* ---------------- events ---------------- */
function wireEvents() {
  elWord = el("word"); elRank = el("rankPill"); elQ = el("qlabel");
  elAns = el("answer"); elReveal = el("reveal"); elYour = el("yourtry");
  elCn = el("ansCn"); elEn = el("ansEn"); elPhon = el("phonetic");

  if (window.Pron && Pron.available()) {
    el("btnSpeak").addEventListener("click", speakCurrent);
    elWord.addEventListener("click", speakCurrent);   // tapping the word replays it too
  } else {
    el("btnSpeak").classList.add("hidden");           // no speech engine: keep the phonetic, drop the button
    elWord.style.cursor = "default";
  }

  el("btnCheck").addEventListener("click", reveal);
  el("btnSkip").addEventListener("click", function () {
    if (current == null) return;
    applyGrade(current, "retire", { countSession: true, advance: true });
  });

  /* app sections */
  el("btnPractice").addEventListener("click", function () {
    // Already translating: stay on the current sentence, don't repick or jump to words.
    if (appView === "sentences") return;
    // In a Today/Library view for the Sentences deck: return to sentence practice, not words.
    if (currentNavSelected() === "sentences") { showSentencesView(); return; }
    showPractice();
  });
  el("btnToday").addEventListener("click", function () { openBrowse("today"); });
  el("btnBrowse").addEventListener("click", function () { openBrowse("all"); });
  el("btnStats").addEventListener("click", showStatsView);
  el("btnSettings").addEventListener("click", showSettingsView);
  if (el("btnSentences")) el("btnSentences").addEventListener("click", showSentencesView);
  if (el("sCheck")) el("sCheck").addEventListener("click", checkSentence);
  if (el("sNext")) el("sNext").addEventListener("click", nextSentence);
  if (el("sSkip")) el("sSkip").addEventListener("click", skipSentence);
  if (el("sAnswer")) el("sAnswer").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sChecked ? nextSentence() : checkSentence();
    }
  });
  el("railOpenToday").addEventListener("click", function () { openBrowse("today"); });
  el("btnRailReviewWrong").addEventListener("click", function () {
    showPractice();
    drillWrong();
  });

  function openRail() {
    var rail = el("studyRail"), bd = el("railBackdrop");
    if (rail) rail.classList.add("open");
    if (bd) bd.classList.add("open");
  }
  function closeRail() {
    var rail = el("studyRail"), bd = el("railBackdrop");
    if (rail) rail.classList.remove("open");
    if (bd) bd.classList.remove("open");
  }
  el("railToggle").addEventListener("click", function () {
    var rail = el("studyRail");
    if (rail && rail.classList.contains("open")) closeRail(); else openRail();
  });
  el("railClose").addEventListener("click", closeRail);
  el("railBackdrop").addEventListener("click", closeRail);

  /* browse / list view */
  el("btnBrowseBack").addEventListener("click", closeBrowse);
  document.querySelectorAll(".browseview").forEach(function (b) {
    b.addEventListener("click", function () { setBrowseView(b.getAttribute("data-view")); });
  });
  // Example sentences sit inside the reveal too, and their play buttons need
  // the same handler the list rows get.
  elReveal.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest('[data-action="speak"]') : null;
    if (b && window.Pron) Pron.speak(b.getAttribute("data-text"));
  });

  el("browseList").addEventListener("click", function (e) {
    // Library rows carry only a stub; fill it the first time it is opened,
    // so 2,000 rows do not each build four example sentences up front.
    var sum = e.target.closest ? e.target.closest(".ex-details > summary") : null;
    if (sum) {
      var det = sum.parentNode;
      if (!det.getAttribute("data-filled")) {
        det.setAttribute("data-filled", "1");
        var list = examplesFor(det.getAttribute("data-ex"))[det.getAttribute("data-type")];
        if (list) {
          var body = document.createElement("div");
          body.className = "ex-body";
          body.innerHTML = exampleBodyHtml(list);
          det.appendChild(body);
        }
      }
      return;
    }
    var scale = e.target.closest ? e.target.closest(".scalebtn") : null;
    if (scale) {
      var holder = scale.closest(".scaleedit");
      applyGrade(parseInt(holder.getAttribute("data-rank"), 10), scale.getAttribute("data-grade"), {
        countSession: false,
        advance: false
      });
      return;
    }
    var action = e.target.closest ? e.target.closest("[data-action]") : null;
    if (!action) return;
    if (action.getAttribute("data-action") === "speak") {
      if (window.Pron) Pron.speak(action.getAttribute("data-text"));
    } else if (action.getAttribute("data-action") === "restore") {
      restoreWord(parseInt(action.getAttribute("data-rank"), 10));
    } else if (action.getAttribute("data-action") === "drill-focus") {
      closeBrowse();
      drillWrong();
    }
  });
  el("browseSearch").addEventListener("input", function () {
    clearTimeout(browseTimer);
    browseTimer = setTimeout(renderBrowse, 120);   // debounce while typing
  });
  elAns.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!elReveal.classList.contains("show")) reveal();
    }
  });
  document.querySelectorAll(".grade").forEach(function (g) {
    g.addEventListener("click", function () { grade(g.getAttribute("data-g")); });
  });
  document.addEventListener("keydown", function (e) {
    if (elReveal.classList.contains("show") && el("screenTest").classList.contains("active")) {
      GRADE_IDS.forEach(function (g) {
        if (e.key === GRADE_META[g].key) grade(g);
      });
    }
  });
  el("btnReviewWrong").addEventListener("click", drillWrong);
  el("btnKeepGoing").addEventListener("click", function () {
    ignoreStrikes = true;
    drillOnly = false;   // "keep going" deliberately resumes new words
    practiceDone = false;
    advance();
  });

  /* settings */
  el("closeSettings").addEventListener("click", function () {
    var st = parseInt(el("setStrikes").value, 10);
    var nw = parseInt(el("setNew").value, 10);
    var pw = parseFloat(el("setPart").value);
    if (st > 0) S.cfg.strikeLimit = st;
    if (nw >= 0) S.cfg.newPerDay = nw;
    if (!isNaN(pw)) S.cfg.partWeight = pw;
    S.cfg.autoSpeak = el("setSpeak").value === "1";
    save();
    refreshStats();
    el("settingsSaved").textContent = "Saved. Your new goal will be used for this deck from now on.";
  });

  /* export / import / reset */
  el("btnExport").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(S)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vocabflow-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
  });
  el("btnImport").addEventListener("click", function () { el("importFile").click(); });
  el("importFile").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var obj;
      try { obj = JSON.parse(rd.result); }
      catch (err) { alert("Could not read that file — it isn't valid JSON."); return; }
      if (!looksLikeBackup(obj)) {
        alert("That doesn't look like a VocabFlow backup, so nothing was changed.");
        return;
      }
      S = sanitizeStore(obj);
      rollDayIfNeeded();
      persistNowThen(function () { alert("Backup imported."); location.reload(); });
    };
    rd.readAsText(f);
  });
  el("btnReset").addEventListener("click", function () {
    if (confirm("Erase ALL progress for this profile and start over from the most common word?")) {
      S = blankStore();
      persistNowThen(function () { location.reload(); });
    }
  });

  /* auth modal */
  el("btnAuthSubmit").addEventListener("click", submitAuth);
  el("btnAuthGoogle").addEventListener("click", signInGoogle);
  el("closeAuth").addEventListener("click", closeAuth);
  el("authPass").addEventListener("keydown", function (e) { if (e.key === "Enter") submitAuth(); });

  /* close modal on backdrop click, or Escape */
  ["authModal"].forEach(function (id) {
    var m = el(id);
    m.addEventListener("click", function (e) { if (e.target === m) m.classList.remove("show"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      ["authModal"].forEach(function (id) { el(id).classList.remove("show"); });
      if (browseActive) closeBrowse();
    }
  });

  /* flush unsynced changes when the tab is backgrounded or closed */
  document.addEventListener("visibilitychange", function () { if (document.hidden) flushCloud(); });
  window.addEventListener("pagehide", flushCloud);

  /* keep other tabs of the same browser in sync: when another tab writes this
     profile's data, merge it in so neither tab's progress is lost */
  window.addEventListener("storage", function (e) {
    if (!e.key || e.key !== lsKey() || !e.newValue) return;
    try {
      S = mergeStates(S, JSON.parse(e.newValue));
      refreshStats();
    } catch (err) {}
  });
}

/* ---------------- boot ---------------- */
function boot() {
  wireEvents();

  if (!DECKS.vocab.length) {
    el("word").textContent = "⚠ words.js not found";
    el("qlabel").textContent = "Keep index.html and words.js together.";
    return;
  }

  var cloudInit = (window.Cloud && Cloud.configured) ? Cloud.init() : Promise.resolve(null);
  cloudInit.then(function () {
    if (window.Cloud && Cloud.configured) {
      Cloud.onChange(function () { /* handled explicitly via onAuthChanged after actions */ });
    }
    renderAuthBar();
    return loadForCurrentUser();
  }).then(function () {
    rollDayIfNeeded();
    renderTabs();
    refreshStats();
    if (!syncPaused) setSynced(window.Cloud && Cloud.user ? "synced ✓" : "");
    startSession();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

})();
