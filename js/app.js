(function () {
"use strict";

/* ---------------- config / state ---------------- */
var LS_PREFIX = "vocabflow_v1";              // guest key; signed-in users append their id
var INTERVALS = { 0: 1, 1: 2, 2: 4, 3: 7, 4: 15, 5: 30 }; // days to next review by resulting level
var MAX_LEVEL = 6;                           // level 6 = mastered

var DEFAULTS = { strikeLimit: 7, newPerDay: 50, partWeight: 0.5 };

var DATA = window.VOCAB || [];
var BY_RANK = {};
for (var i = 0; i < DATA.length; i++) { BY_RANK[DATA[i].r] = DATA[i]; }

function todayIndex() {
  var now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
}

function blankState() {
  return {
    cfg: Object.assign({}, DEFAULTS),
    words: {},          // rank -> {lvl, due, seen, lastGrade}
    day: { idx: todayIndex(), newCount: 0, revCount: 0, strikes: 0, wrongToday: [] },
    totals: { everSeen: 0 },
    mtime: 0            // last-modified (ms) — used to resolve local vs cloud copies
  };
}

/* Make any loaded object safe to use even if a key is missing/corrupt. */
function sanitize(s) {
  if (!s || typeof s !== "object") return blankState();
  if (!s.cfg) s.cfg = Object.assign({}, DEFAULTS);
  else s.cfg = Object.assign({}, DEFAULTS, s.cfg);
  if (!s.words || typeof s.words !== "object") s.words = {};
  if (!s.day) s.day = { idx: todayIndex(), newCount: 0, revCount: 0, strikes: 0, wrongToday: [] };
  if (!Array.isArray(s.day.wrongToday)) s.day.wrongToday = [];
  if (!s.totals) s.totals = { everSeen: 0 };
  if (typeof s.mtime !== "number") s.mtime = 0;
  return s;
}

/* ---------------- storage layer (guest localStorage + cloud sync) ---------------- */
var S = blankState();

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

/* Push pending changes to the cloud now (debounce flush / tab-hide / close). */
function flushCloud() {
  clearTimeout(cloudSaveTimer);
  if (!cloudActive() || !dirty) return;
  return Cloud.saveState(S).then(function (ok) {
    if (ok) dirty = false;
    setSynced(ok ? "synced ✓" : "offline — saved locally");
  });
}

/* Save immediately, then run cb (used by Reset/Import before reload). */
function persistNowThen(cb) {
  S.mtime = Date.now();
  writeLS(lsKey(), S);
  if (window.Cloud && Cloud.user && !syncPaused) {
    setSynced("saving…");
    Cloud.saveState(S).then(cb, cb);           // proceed even if the write fails
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
        S = sanitize(cached || readLS(LS_PREFIX) || blankState());
        setSynced("offline — changes won't sync until reload");
        return;
      }
      if (res.state) {
        // If local edits are newer than the cloud (e.g. made while offline),
        // keep them and push up; otherwise adopt the cloud copy.
        if (cached && (cached.mtime || 0) > (res.state.mtime || 0)) {
          S = sanitize(cached);
          writeLS(lsKey(), S);
          dirty = true; flushCloud();
        } else {
          S = sanitize(res.state);
          writeLS(lsKey(), S);
        }
        return;
      }
      // No cloud data yet for this account. If the guest on this browser has
      // real progress, migrate it up so nothing is lost on first sign-in.
      var guest = readLS(LS_PREFIX);
      if (!cached && guest && guest.totals && guest.totals.everSeen > 0) {
        S = sanitize(guest);
        writeLS(lsKey(), S);
        dirty = true; flushCloud();
      } else {
        S = sanitize(cached || blankState());
        writeLS(lsKey(), S);
      }
    });
  }
  S = sanitize(readLS(lsKey()) || blankState());
  return Promise.resolve();
}

function rollDayIfNeeded() {
  var t = todayIndex();
  if (S.day.idx !== t) {
    S.day = { idx: t, newCount: 0, revCount: 0, strikes: 0, wrongToday: [] };
    save();
  }
}

/* ---------------- queue building ---------------- */
var queue = [];            // ranks scheduled for this session run
var current = null;        // current rank
var ignoreStrikes = false; // "keep going anyway" mode
var skipped = {};          // ranks skipped this session (won't resurface until next session)

function dueReviews() {
  var t = todayIndex();
  var out = [];
  for (var rank in S.words) {
    var w = S.words[rank];
    if (w.seen && w.lvl < MAX_LEVEL && w.due <= t) out.push(parseInt(rank, 10));
  }
  out.sort(function (a, b) {                  // most overdue first, then most common
    var da = S.words[a].due, db = S.words[b].due;
    if (da !== db) return da - db;
    return a - b;
  });
  return out;
}

function nextNewRank() {
  for (var i = 0; i < DATA.length; i++) {
    var r = DATA[i].r;
    if (skipped[r]) continue;
    if (!S.words[r] || !S.words[r].seen) return r;
  }
  return null;
}

function buildQueue() { queue = dueReviews(); }

/* ---------------- session flow ---------------- */
function startSession() {
  rollDayIfNeeded();
  buildQueue();
  ignoreStrikes = false;
  skipped = {};
  advance();
}

function pickNext() {
  // 1) any queued review still pending and not skipped?
  while (queue.length) {
    var r = queue.shift();
    if (skipped[r]) continue;
    var w = S.words[r];
    if (w && w.seen && w.lvl < MAX_LEVEL && w.due <= todayIndex()) return r;
  }
  // 2) introduce a new word if under the daily cap
  if (ignoreStrikes || S.day.newCount < S.cfg.newPerDay) {
    var nr = nextNewRank();
    if (nr !== null) return nr;
  }
  return null;
}

function advance() {
  rollDayIfNeeded();
  if (!ignoreStrikes && S.day.strikes >= S.cfg.strikeLimit) return showDone("stopped");
  var r = pickNext();
  if (r === null) return showDone("complete");
  current = r;
  renderCard(r);
  refreshStats();
}

/* ---------------- grading ---------------- */
function isNew(rank) { return !S.words[rank] || !S.words[rank].seen; }

function ensure(rank) {
  if (!S.words[rank]) S.words[rank] = { lvl: 0, due: todayIndex(), seen: false, lastGrade: null };
  return S.words[rank];
}

function grade(g) { // 'good' | 'part' | 'bad'
  rollDayIfNeeded();
  var w = ensure(current);
  var wasNew = !w.seen;
  var t = todayIndex();

  if (wasNew) { S.day.newCount++; S.totals.everSeen++; }
  else { S.day.revCount++; }
  w.seen = true;
  w.lastGrade = g;

  if (g === "good") {
    w.lvl = Math.min(MAX_LEVEL, (wasNew ? 1 : w.lvl + 1));
  } else if (g === "part") {
    w.lvl = Math.max(0, w.lvl - 1);
    addStrike(S.cfg.partWeight);
    recordWrong("part");
  } else { // bad
    w.lvl = 0;
    addStrike(1);
    recordWrong("bad");
  }

  w.due = (w.lvl >= MAX_LEVEL) ? t + 999999 : t + (INTERVALS[w.lvl] || 1);

  save();
  advance();
}

function addStrike(n) { S.day.strikes += n; }

function recordWrong(kind) {
  var existing = null;
  for (var i = 0; i < S.day.wrongToday.length; i++) {
    if (S.day.wrongToday[i].r === current) { existing = S.day.wrongToday[i]; break; }
  }
  if (existing) { if (kind === "bad") existing.kind = "bad"; }
  else { S.day.wrongToday.push({ r: current, kind: kind }); }
}

/* ---------------- rendering ---------------- */
var elWord, elRank, elQ, elAns, elReveal, elYour, elCn, elEn;

function renderCard(rank) {
  var d = BY_RANK[rank];
  document.getElementById("screenDone").classList.remove("active");
  document.getElementById("screenTest").classList.add("active");
  elReveal.classList.remove("show");
  elAns.value = "";
  elWord.textContent = d.w;
  elRank.textContent = "#" + d.r;
  elQ.textContent = isNew(rank) ? "NEW WORD — what does it mean?" : "REVIEW — what does it mean?";
  setTimeout(function () { elAns.focus(); }, 30);
}

function reveal() {
  var d = BY_RANK[current];
  var typed = elAns.value.trim();
  elYour.innerHTML = typed ? ("You typed: <b>" + escapeHtml(typed) + "</b>") : "<i>(no answer typed)</i>";
  elCn.textContent = d.c;
  elEn.textContent = d.e ? d.e.replace(/ \/ /g, "\n") : "";
  elReveal.classList.add("show");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function refreshStats() {
  document.getElementById("sNew").textContent = S.day.newCount;
  document.getElementById("sRev").textContent = S.day.revCount;
  document.getElementById("sStrike").textContent = round1(S.day.strikes) + " / " + S.cfg.strikeLimit;
  document.getElementById("sMaster").textContent = countMastered();
  var pct = Math.min(100, (S.day.strikes / S.cfg.strikeLimit) * 100);
  document.getElementById("pbar").style.width = pct + "%";
}
function round1(n) { return Math.round(n * 10) / 10; }
function countMastered() { var c = 0; for (var r in S.words) { if (S.words[r].lvl >= MAX_LEVEL) c++; } return c; }
function countSeen() { var c = 0; for (var r in S.words) { if (S.words[r].seen) c++; } return c; }
function countDue() { return dueReviews().length; }

/* ---------------- done screen ---------------- */
function showDone(reason) {
  document.getElementById("screenTest").classList.remove("active");
  var sc = document.getElementById("screenDone");
  sc.classList.add("active");
  var title = document.getElementById("doneTitle");
  var sub = document.getElementById("doneSub");
  var wrap = document.getElementById("focusWrap");

  var wrong = S.day.wrongToday;
  if (reason === "stopped") {
    title.textContent = "Time to lock these in 🔒";
    sub.textContent = "You hit " + round1(S.day.strikes) + " strikes. These " + wrong.length + " word(s) are your job to remember today.";
  } else {
    if (wrong.length) {
      title.textContent = "Nice work today ✓";
      sub.textContent = "No more words due. Here are the " + wrong.length + " you stumbled on — give them a look.";
    } else {
      title.textContent = "All clear — great session! 🎉";
      sub.textContent = "You got everything right and there's nothing left due today.";
    }
  }

  wrap.innerHTML = "";
  if (wrong.length) {
    wrong.forEach(function (item) {
      var d = BY_RANK[item.r];
      var div = document.createElement("div");
      div.className = "focusitem";
      div.innerHTML = '<div><span class="fw">' + escapeHtml(d.w) + "</span>" +
        '<span class="tag ' + (item.kind === "bad" ? "bad" : "part") + '">' + (item.kind === "bad" ? "wrong" : "partly") + "</span></div>" +
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
  if (!S.day.wrongToday.length) return;
  queue = S.day.wrongToday.map(function (x) { return x.r; });
  skipped = {};
  ignoreStrikes = true;
  document.getElementById("screenDone").classList.remove("active");
  var r = queue.shift();
  if (r != null) { current = r; renderCard(r); refreshStats(); }
}

/* ---------------- auth UI ---------------- */
var authMode = "in"; // 'in' | 'up'

function el(id) { return document.getElementById(id); }
function setSynced(text) { var n = el("syncedNote"); if (n) n.textContent = text; }

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
      if (e.key === "1") grade("good");
      else if (e.key === "2") grade("part");
      else if (e.key === "3") grade("bad");
    }
  });
  el("btnReviewWrong").addEventListener("click", drillWrong);
  el("btnKeepGoing").addEventListener("click", function () {
    ignoreStrikes = true;
    el("screenDone").classList.remove("active");
    advance();
  });

  /* stats modal */
  el("btnStats").addEventListener("click", function () {
    rollDayIfNeeded();
    var seen = countSeen(), mastered = countMastered(), due = countDue();
    var learning = seen - mastered;
    el("statsBody").innerHTML =
      "<b>" + seen.toLocaleString() + "</b> of " + DATA.length.toLocaleString() + " words started<br>" +
      "<b>" + mastered.toLocaleString() + "</b> mastered (level " + MAX_LEVEL + ")<br>" +
      "<b>" + learning.toLocaleString() + "</b> still in rotation<br>" +
      "<b>" + due.toLocaleString() + "</b> due for review right now<br><br>" +
      "Today: " + S.day.newCount + " new · " + S.day.revCount + " reviews · " + round1(S.day.strikes) + " strikes";
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
      try {
        S = sanitize(JSON.parse(rd.result));
        rollDayIfNeeded();
        persistNowThen(function () { alert("Backup imported."); location.reload(); });
      } catch (err) { alert("Could not read that file."); }
    };
    rd.readAsText(f);
  });
  el("btnReset").addEventListener("click", function () {
    if (confirm("Erase ALL progress for this profile and start over from the most common word?")) {
      S = blankState();
      persistNowThen(function () { location.reload(); });
    }
  });

  /* auth modal */
  el("btnAuthSubmit").addEventListener("click", submitAuth);
  el("btnAuthGoogle").addEventListener("click", signInGoogle);
  el("closeAuth").addEventListener("click", closeAuth);
  el("authPass").addEventListener("keydown", function (e) { if (e.key === "Enter") submitAuth(); });

  /* close modals on backdrop click */
  ["statsModal", "settingsModal", "authModal"].forEach(function (id) {
    var m = el(id);
    m.addEventListener("click", function (e) { if (e.target === m) m.classList.remove("show"); });
  });

  /* flush unsynced changes when the tab is backgrounded or closed */
  document.addEventListener("visibilitychange", function () { if (document.hidden) flushCloud(); });
  window.addEventListener("pagehide", flushCloud);
}

/* ---------------- boot ---------------- */
function boot() {
  wireEvents();

  if (!DATA.length) {
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
