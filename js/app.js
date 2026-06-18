(function () {
"use strict";

/* ---------------- config / state ---------------- */
var LS_PREFIX = "vocabflow_v1";              // guest key; signed-in users append their id
var INTERVALS = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 10, 5: 30, 6: 90 }; // days to next review by strength
var MAX_LEVEL = 6;                           // level 6 = very strong, still reviewed rarely
var RETIRED_DUE = 999999;                    // "too easy" items stay out of review

var DEFAULTS = { strikeLimit: 7, newPerDay: 50, partWeight: 0.5 };

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

/* Three independent decks, each with its own data set and progress. */
var DECKS = {
  vocab:   window.VOCAB || [],
  idioms:  window.IDIOMS || [],
  phrasal: window.PHRASAL || []
};
var DECK_IDS = ["vocab", "idioms", "phrasal"];
var DECK_LABELS = { vocab: "Vocabulary", idioms: "Idioms", phrasal: "Phrasal Verbs" };
var DECK_NOUN = { vocab: "words", idioms: "idioms", phrasal: "phrasal verbs" };
var DECK_ITEM = { vocab: "word", idioms: "idiom", phrasal: "phrasal verb" };

var BY_RANK = {};   // BY_RANK[deckId][rank] -> entry
DECK_IDS.forEach(function (id) {
  BY_RANK[id] = {};
  DECKS[id].forEach(function (o) { BY_RANK[id][o.r] = o; });
});

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
    schema: 3,
    cfg: Object.assign({}, DEFAULTS),
    active: "vocab",
    decks: { vocab: blankDeck(), idioms: blankDeck(), phrasal: blankDeck() },
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

/* Make any loaded object safe, and migrate the old single-deck (v1) shape. */
function sanitizeStore(s) {
  if (!s || typeof s !== "object") return blankStore();
  var out = blankStore();
  if (s.cfg) out.cfg = Object.assign({}, DEFAULTS, s.cfg);
  if (typeof s.mtime === "number") out.mtime = s.mtime;
  if (s.decks && typeof s.decks === "object") {           // v2
    DECK_IDS.forEach(function (id) { out.decks[id] = sanitizeDeck(s.decks[id]); });
    if (DECK_IDS.indexOf(s.active) >= 0) out.active = s.active;
  } else if (s.words && typeof s.words === "object") {    // v1 -> migrate into vocab
    out.decks.vocab = sanitizeDeck({ words: s.words, day: s.day, totals: s.totals });
  }
  return out;
}

function hasProgress(s) {
  s = sanitizeStore(s);
  return DECK_IDS.some(function (id) { return s.decks[id].totals.everSeen > 0; });
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

function dueReviews() {
  var t = todayIndex();
  var out = [];
  for (var rank in D().words) {
    var w = D().words[rank];
    if (w.seen && !w.retired && w.due <= t) out.push(parseInt(rank, 10));
  }
  out.sort(function (a, b) {                  // most overdue first, then most common
    var da = D().words[a].due, db = D().words[b].due;
    if (da !== db) return da - db;
    return a - b;
  });
  return out;
}

function nextNewRank() {
  var data = curData();
  for (var i = 0; i < data.length; i++) {
    var r = data[i].r;
    if (skipped[r]) continue;
    if (!D().words[r] || (!D().words[r].seen && !D().words[r].retired)) return r;
  }
  return null;
}

function nextUnseenRank() {
  var data = curData();
  for (var i = 0; i < data.length; i++) {
    var r = data[i].r;
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
    if (skipped[r]) continue;
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
var elWord, elRank, elQ, elAns, elReveal, elYour, elCn, elEn;

function renderCard(rank) {
  var d = curIndex()[rank];
  document.getElementById("screenDone").classList.remove("active");
  document.getElementById("screenTest").classList.add("active");
  elReveal.classList.remove("show");
  elAns.value = "";
  elWord.textContent = d.w;
  elRank.textContent = "#" + d.r;
  elQ.textContent = (isNew(rank) ? "NEW " + DECK_ITEM[S.active].toUpperCase() : "REVIEW") + " — what does it mean?";
  setTimeout(function () { elAns.focus(); }, 30);
}

function reveal() {
  var d = curIndex()[current];
  var typed = elAns.value.trim();
  elYour.innerHTML = typed ? ("You typed: <b>" + escapeHtml(typed) + "</b>") : "<i>(no answer typed)</i>";
  renderMeaning(d.c);
  renderGloss(d.e);
  elReveal.classList.add("show");
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

function splitMeaning(text) {
  return String(text || "").split(/\s*\/\s*/).filter(Boolean).map(function (part) {
    var m = part.match(POS_LEAD_RE);
    if (m) {
      var label = posLabel(m[1].split(/\s+/)[0]); // normalise just the first token
      if (label) return { label: label, text: m[2] };
    }
    return { label: "", text: part };
  });
}

function splitMeaningTerms(text) {
  return String(text || "").split(/[，,;；]/).map(function (term) {
    return term.trim();
  }).filter(Boolean);
}

function renderMeaning(text) {
  elCn.innerHTML = "";
  splitMeaning(text).forEach(function (part) {
    var termList = splitMeaningTerms(part.text);
    var row = document.createElement("div");
    row.className = "meaning-row" +
      (part.label ? "" : " plain") +
      (termList.length > 4 ? " wide" : "");

    if (part.label) {
      var label = document.createElement("span");
      label.className = "meaning-pos";
      label.textContent = part.label;
      row.appendChild(label);
    }

    var terms = document.createElement("span");
    terms.className = "meaning-terms";
    termList.forEach(function (term) {
      var chip = document.createElement("span");
      chip.className = "meaning-term";
      chip.textContent = term;
      terms.appendChild(chip);
    });
    row.appendChild(terms);
    elCn.appendChild(row);
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

function renderGloss(text) {
  elEn.innerHTML = "";
  var lines = [];
  joinGlossLines(text).forEach(function (raw) {
    var g = parseGloss(raw);
    if (isCrossRef(g.text)) return;                 // skip useless cross-references
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
  document.getElementById("sNew").textContent = D().day.newCount;
  document.getElementById("sRev").textContent = D().day.revCount;
  document.getElementById("sStrike").textContent = round1(D().day.strikes) + " / " + S.cfg.strikeLimit;
  document.getElementById("sMaster").textContent = countMastered();
  var pct = Math.min(100, (D().day.strikes / S.cfg.strikeLimit) * 100);
  document.getElementById("pbar").style.width = pct + "%";
}
function round1(n) { return Math.round(n * 10) / 10; }
function countMastered() { var c = 0; for (var r in D().words) { if (D().words[r].seen && !D().words[r].retired && D().words[r].lvl >= 5) c++; } return c; }
function countRetired() { var c = 0; for (var r in D().words) { if (D().words[r].retired) c++; } return c; }
function countSeen() { var c = 0; for (var r in D().words) { if (D().words[r].seen) c++; } return c; }
function countDue() { return dueReviews().length; }

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
  document.getElementById("screenTest").classList.remove("active");
  var sc = document.getElementById("screenDone");
  sc.classList.add("active");
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
  document.getElementById("screenDone").classList.remove("active");
  var r = queue.shift();
  if (r != null) { current = r; renderCard(r); refreshStats(); }
}

/* ---------------- auth UI ---------------- */
var authMode = "in"; // 'in' | 'up'

function el(id) { return document.getElementById(id); }
function setSynced(text) { var n = el("syncedNote"); if (n) n.textContent = text; }

/* ---------------- deck tabs ---------------- */
function renderTabs() {
  var nav = el("tabs");
  if (!nav) return;
  nav.innerHTML = "";
  DECK_IDS.forEach(function (id) {
    var b = document.createElement("button");
    b.className = "tab" + (id === S.active ? " active" : "");
    b.innerHTML = '<span class="tabname">' + DECK_LABELS[id] + "</span>" +
      '<span class="tabcount">' + DECKS[id].length + "</span>";
    b.addEventListener("click", function () { switchDeck(id); });
    nav.appendChild(b);
  });
}

function switchDeck(id) {
  if (id === S.active || !DECKS[id]) return;
  S.active = id;
  persist();             // saves the whole store (all decks) + queues a cloud sync
  renderTabs();
  startSession();        // builds today's session for the newly active deck
  if (browseActive) openBrowse();   // stay in browse, now showing the new deck
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

function entryMatches(d, q) {
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

function browseItemHtml(d, opts) {
  opts = opts || {};
  var w = D().words[d.r];
  var due = w && w.seen && !w.retired ? dueLabel(w.due) : (w && w.retired ? "retired" : "not started");
  return '<div class="browseitem rich" data-rank="' + d.r + '">' +
    '<div class="bmain"><span class="bw">' + escapeHtml(d.w) + "</span>" +
    '<span class="bc">' + escapeHtml(String(d.c || "").replace(/\n/g, " / ")) + "</span></div>" +
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
    upcoming.sort(function (a, b) { return a.due - b.due || a.d.r - b.d.r; });
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
  var label = q ? matches.toLocaleString() + " match" + (matches === 1 ? "" : "es") :
    DECK_LABELS[S.active] + " · " + browseView;
  if (matches > CAP) label += " · showing first " + CAP.toLocaleString() + ", search to narrow";
  el("browseCount").textContent = label;
}

function setBrowseView(view) {
  browseView = view || "today";
  document.querySelectorAll(".browseview").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-view") === browseView);
  });
  renderBrowse();
}

function openBrowse() {
  browseActive = true;
  el("screenTest").classList.remove("active");
  el("screenDone").classList.remove("active");
  el("screenBrowse").classList.add("active");
  setBrowseView(browseView || "today");
}

function closeBrowse() {
  browseActive = false;
  el("screenBrowse").classList.remove("active");
  el("screenTest").classList.add("active");
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
  elCn = el("ansCn"); elEn = el("ansEn");

  el("btnCheck").addEventListener("click", reveal);
  el("btnSkip").addEventListener("click", function () {
    if (current != null) skipped[current] = true; // fixes: Skip now shows a *different* word
    advance();
  });

  /* browse / list view */
  el("btnBrowse").addEventListener("click", function () { browseActive ? closeBrowse() : openBrowse(); });
  el("btnBrowseBack").addEventListener("click", closeBrowse);
  document.querySelectorAll(".browseview").forEach(function (b) {
    b.addEventListener("click", function () { setBrowseView(b.getAttribute("data-view")); });
  });
  el("browseList").addEventListener("click", function (e) {
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
    if (action.getAttribute("data-action") === "restore") {
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
    el("screenDone").classList.remove("active");
    advance();
  });

  /* stats modal */
  el("btnStats").addEventListener("click", function () {
    rollDayIfNeeded();
    var seen = countSeen(), mastered = countMastered(), due = countDue(), retired = countRetired();
    var learning = seen - mastered - retired;
    el("statsBody").innerHTML =
      "<b>" + DECK_LABELS[S.active] + "</b><br>" +
      "<b>" + seen.toLocaleString() + "</b> of " + curData().length.toLocaleString() + " " + DECK_NOUN[S.active] + " started<br>" +
      "<b>" + mastered.toLocaleString() + "</b> strong / easy<br>" +
      "<b>" + retired.toLocaleString() + "</b> retired as too easy<br>" +
      "<b>" + learning.toLocaleString() + "</b> still in rotation<br>" +
      "<b>" + due.toLocaleString() + "</b> due for review right now<br><br>" +
      "Today: " + D().day.newCount + " new · " + D().day.revCount + " reviews · " + round1(D().day.strikes) + " strikes";
    el("statsModal").classList.add("show");
  });
  el("closeStats").addEventListener("click", function () { el("statsModal").classList.remove("show"); });

  /* settings modal */
  el("btnSettings").addEventListener("click", function () {
    el("setStrikes").value = S.cfg.strikeLimit;
    el("setNew").value = S.cfg.newPerDay;
    el("setPart").value = String(S.cfg.partWeight);
    el("settingsModal").classList.add("show");
  });
  el("closeSettings").addEventListener("click", function () {
    var st = parseInt(el("setStrikes").value, 10);
    var nw = parseInt(el("setNew").value, 10);
    var pw = parseFloat(el("setPart").value);
    if (st > 0) S.cfg.strikeLimit = st;
    if (nw >= 0) S.cfg.newPerDay = nw;
    if (!isNaN(pw)) S.cfg.partWeight = pw;
    save();
    el("settingsModal").classList.remove("show");
    refreshStats();
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

  /* close modals on backdrop click, or Escape */
  ["statsModal", "settingsModal", "authModal"].forEach(function (id) {
    var m = el(id);
    m.addEventListener("click", function (e) { if (e.target === m) m.classList.remove("show"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      ["statsModal", "settingsModal", "authModal"].forEach(function (id) { el(id).classList.remove("show"); });
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
