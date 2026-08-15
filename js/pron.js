/* Pronunciation: phonetic spelling + spoken playback.

   Phonetics come from ipa.js, a table built offline from the CMU Pronouncing
   Dictionary (see tools/build-ipa.py). It ships with the app, so the spelling
   under a word is instant, works offline, and is the same every time.

   Playback prefers a real human recording. Wiktionary/Wikimedia Commons has
   volunteer recordings for most English headwords — including idioms and
   phrasal verbs — served with CORS and usually under 15KB. Coverage runs from
   roughly 90% of the commonest words down to about 60% of the rarest; anything
   without a recording falls back to the browser's speech engine.

   Recording lookups are cached in localStorage, so a word costs at most one
   round trip ever. */
(function () {
"use strict";

var CACHE_KEY = "vocabflow_pron_v3";     // v1/v2 cached phonetics that now ship locally
var CACHE_CAP = 6000;
var WIKI_API = "https://en.wiktionary.org/w/api.php?action=query&format=json&formatversion=2" +
               "&origin=*&prop=imageinfo&generator=images&iiprop=url&gimlimit=100&titles=";

var cache = loadCache();
var pending = {};        // word -> in-flight Promise, so re-renders don't refetch
var saveTimer = null;
var audioEl = null;
var voice = null;
var wanted = "";         // most recent speak() request; older ones lose the race
var synth = window.speechSynthesis;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
  catch (e) { return {}; }
}

function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    var keys = Object.keys(cache);
    if (keys.length > CACHE_CAP) {                       // drop the oldest lookups
      keys.sort(function (a, b) { return (cache[a].t || 0) - (cache[b].t || 0); });
      keys.slice(0, keys.length - CACHE_CAP).forEach(function (k) { delete cache[k]; });
    }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) {}
  }, 500);
}

function key(text) { return String(text || "").trim().toLowerCase(); }

/* ---------------- phonetic spelling (local table) ---------------- */

/* Bare IPA without the enclosing slashes, or "" for the acronyms and
   abbreviations cmudict has no entry for. */
function phonetic(text) {
  var table = window.IPA;
  return (table && table[key(text)]) || "";
}

/* ---------------- recorded audio (Wiktionary / Wikimedia Commons) ---------------- */

var AUDIO_EXT = /\.(ogg|oga|wav|mp3|flac)$/i;

/* Commons names a pronunciation file after its accent and the word itself:
   "En-us-hello.ogg", "En-us-ne-thorough.ogg", "en-us-piece of cake.ogg", or
   Lingua Libre's "LL-Q1860 (eng)-Vealhurl-give up.wav". Rank English accents
   with US first, to match the General American phonetics shown alongside. */
var ACCENT_RANK = [
  [/^en[-_]us\b/i, 0],
  [/^ll-q1860[ _]\(eng\)/i, 1],
  [/^en[-_](gb|uk)\b/i, 2],
  [/^en[-_]ca\b/i, 3],
  [/^en[-_](au|nz|za)\b/i, 4]
];

/* -1 means "not a usable recording of this word". The name has to end in the
   word itself, so unrelated audio embedded on the page can't slip through. */
function rankFile(title, k) {
  if (!AUDIO_EXT.test(title)) return -1;
  var base = title.replace(/^File:/i, "").replace(AUDIO_EXT, "");
  if (base.toLowerCase().slice(-(k.length + 1)) !== "-" + k) return -1;
  for (var i = 0; i < ACCENT_RANK.length; i++) {
    if (ACCENT_RANK[i][0].test(base)) return ACCENT_RANK[i][1];
  }
  return -1;
}

function audioFrom(json, k) {
  var pages = (json && json.query && json.query.pages) || [];
  var best = "", bestRank = 99;
  pages.forEach(function (p) {
    var rank = rankFile(p.title || "", k);
    if (rank < 0 || rank >= bestRank) return;
    var url = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url;
    if (!url) return;
    bestRank = rank;
    best = url.split("?")[0];          // drop Wiktionary's analytics query string
  });
  return best;
}

/* Resolves to a recording URL, or "" when there is no recording for the word.
   Wiktionary answers 200 with an empty page list for words it doesn't have, so
   a non-200 is a transport problem: reject, and let the next card retry rather
   than caching it as "no recording". */
function fetchAudio(k) {
  return fetch(WIKI_API + encodeURIComponent(k))
    .then(function (r) {
      if (!r.ok) throw new Error("wiktionary " + r.status);
      return r.json();
    })
    .then(function (json) { return audioFrom(json, k); });
}

function audioUrl(k) {
  if (cache[k]) return Promise.resolve(cache[k].a);
  if (!window.fetch || !window.Promise) return Promise.resolve("");
  if (pending[k]) return pending[k];
  pending[k] = fetchAudio(k).then(function (url) {
    delete pending[k];
    cache[k] = { a: url, t: Date.now() };
    saveSoon();
    return url;
  })["catch"](function () {
    delete pending[k];
    return "";
  });
  return pending[k];
}

/* ---------------- combined lookup ---------------- */

/* Resolves to { p: phonetic, a: audioUrl }; either may be "". The phonetic is
   available synchronously via Pron.phonetic() when that is all you need. */
function lookup(text) {
  var k = key(text);
  if (!k) return Promise.resolve({ p: "", a: "" });
  return audioUrl(k).then(function (url) {
    return { p: phonetic(k), a: url };
  });
}

/* ---------------- speech fallback ---------------- */

/* Every platform ships joke voices next to the real ones, and they sit in the
   same list — "Zarvox" is as valid an en-US voice as "Samantha". Score by name
   so a usable voice is picked deliberately rather than by list order. */
var NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|hysterical|jester|junior|kathy|organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox)\b/i;
var PREFERRED = [
  [/google us english/i, 100],
  [/microsoft.*natural/i, 95],
  [/google uk english/i, 90],
  [/microsoft.*online/i, 85],
  [/\b(premium|enhanced)\b/i, 80],
  [/siri/i, 70],
  [/^(ava|allison|samantha|susan|nathan|noelle|zoe|evan)\b/i, 60]
];

function voiceScore(v) {
  var name = v.name || "";
  if (NOVELTY.test(name)) return -1;
  var score = /^en[-_]US/i.test(v.lang || "") ? 10 : 0;     // match the phonetics shown
  for (var i = 0; i < PREFERRED.length; i++) {
    if (PREFERRED[i][0].test(name)) { score += PREFERRED[i][1]; break; }
  }
  return score;
}

function pickVoice() {
  if (!synth || !synth.getVoices) return null;
  var best = null, bestScore = -1;
  (synth.getVoices() || []).forEach(function (v) {
    if (!/^en/i.test(v.lang || "")) return;
    var s = voiceScore(v);
    if (s > bestScore) { bestScore = s; best = v; }
  });
  return best;
}
/* Chrome loads its voice list asynchronously; re-pick once it arrives. */
if (synth && synth.addEventListener) {
  synth.addEventListener("voiceschanged", function () { voice = pickVoice(); });
}

function tts(text) {
  if (!synth || !window.SpeechSynthesisUtterance) return;
  try {
    synth.cancel();                       // don't queue up behind an earlier card
    var u = new SpeechSynthesisUtterance(String(text));
    if (!voice) voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || "en-US";
    u.rate = 0.9;
    synth.speak(u);
  } catch (e) {}
}

/* ---------------- playback ---------------- */

/* A millisecond of silence — see unlock(). */
var SILENCE = "data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA==";

function ensureEl() {
  if (!audioEl && window.Audio) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/* Safari only lets a media element play if that element was first started from
   a user gesture, and a gesture does not survive the network round trip our
   recordings need. Start the element on a moment of silence at the first
   interaction, and every later play() on it is allowed. */
var unlocked = false;
function unlock() {
  if (unlocked) return;
  unlocked = true;
  var a = ensureEl();
  if (!a) return;
  try {
    a.src = SILENCE;
    var p = a.play();
    if (p && p["catch"]) p["catch"](function () {});
  } catch (e) {}
}
document.addEventListener("click", unlock, true);
document.addEventListener("keydown", unlock, true);
document.addEventListener("touchstart", unlock, true);

/* Most Commons recordings are Ogg Vorbis, which older Safari cannot decode. */
var probeEl = null;
function canPlay(url) {
  probeEl = probeEl || document.createElement("audio");
  if (!probeEl.canPlayType) return true;
  if (/\.og[ga]$/i.test(url)) return !!probeEl.canPlayType('audio/ogg; codecs="vorbis"');
  if (/\.flac$/i.test(url)) return !!probeEl.canPlayType("audio/flac");
  if (/\.wav$/i.test(url)) return !!probeEl.canPlayType("audio/wav");
  return true;
}

/* Wikimedia keeps an MP3 transcode of every Commons audio file beside it:
   .../commons/5/52/En-us-hello.ogg
   .../commons/transcoded/5/52/En-us-hello.ogg/En-us-hello.ogg.mp3 */
var COMMONS = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/(.+)$/;
function mp3Of(url) {
  var m = COMMONS.exec(url);
  return m ? m[1] + "/transcoded/" + m[2] + "/" + m[3] + "/" + m[4] + "/" + m[4] + ".mp3" : "";
}

/* Resolves once the recording is audibly playing, rejects if it cannot be.
   A decode failure surfaces as an "error" event rather than a rejected play(),
   so both have to be watched — otherwise a dead format is silently silent. */
function playUrl(url) {
  var a = ensureEl();
  if (!a) return Promise.reject(new Error("no audio element"));
  return new Promise(function (resolve, reject) {
    var settled = false, timer;
    function finish(ok) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("error", onError);
      if (ok) resolve(); else reject(new Error("playback failed"));
    }
    function onPlaying() { finish(true); }
    function onError() { finish(false); }
    a.addEventListener("playing", onPlaying);
    a.addEventListener("error", onError);
    timer = setTimeout(function () { finish(a.currentTime > 0); }, 4000);

    a.pause();
    a.src = url;
    try { a.load(); } catch (e) {}
    var p = a.play();
    if (p && p["catch"]) p["catch"](function () { finish(false); });
  });
}

/* Moving to the next card interrupts whatever is playing, which rejects the
   pending play(). That is a cancellation, not a decode failure, so it must not
   drag the old word through the fallback chain — hence the generation check. */
var playGen = 0;

function stopAll() {
  playGen++;
  if (synth) { try { synth.cancel(); } catch (e) {} }
  if (audioEl) { try { audioEl.pause(); } catch (e) {} }
}

function playRecording(url, gen) {
  var alt = mp3Of(url);
  var first = canPlay(url) ? url : (alt || url);
  return playUrl(first)["catch"](function () {
    if (gen !== playGen) throw new Error("superseded");
    if (!alt || alt === first) throw new Error("no alternative encoding");
    return playUrl(alt);                 // Safari without Ogg support lands here
  });
}

function play(url, text) {
  var gen = playGen;
  if (!url) { tts(text); return; }
  playRecording(url, gen)["catch"](function () {
    if (gen === playGen) tts(text);
  });
}

/* Say `text` out loud, preferring the recording and falling back to the speech
   voice. If the card has already moved on by the time a lookup returns, stay
   quiet rather than speaking the previous word over the new one. */
function speak(text) {
  if (!text) return;
  var k = key(text);
  wanted = k;
  stopAll();
  if (cache[k]) { play(cache[k].a, text); return; }   // stay inside the click
  audioUrl(k).then(function (url) {
    if (wanted === k) play(url, text);
  });
}

/* Warm the recording URL while the card is being read, so pressing play is a
   straight-through gesture rather than a network round trip. */
function prefetch(text) {
  var k = key(text);
  if (k && !cache[k]) audioUrl(k);
}

window.Pron = {
  speak: speak,
  prefetch: prefetch,
  lookup: lookup,
  phonetic: phonetic,
  available: function () { return !!(window.Audio || window.SpeechSynthesisUtterance); }
};

})();
