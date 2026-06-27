/*
 * cloud.js — thin wrapper around Supabase for auth + progress sync.
 *
 * Exposes a single global `Cloud`. Every method is safe to call even
 * when Supabase isn't configured or the SDK failed to load (offline):
 * it simply reports `configured:false` and the app stays in guest mode.
 */
(function () {
  "use strict";

  var cfg = window.VOCABFLOW_CONFIG || {};
  var hasKeys = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var sdkReady = typeof window.supabase !== "undefined" && !!window.supabase.createClient;

  // When set, progress is synced through our own AWS backend (Supabase stays
  // the login service only). Blank -> fall back to the Supabase `progress` table.
  var apiBase = (cfg.API_BASE_URL || "").replace(/\/+$/, "");

  var client = null;
  if (hasKeys && sdkReady) {
    try {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    } catch (e) {
      client = null;
    }
  }

  function mapUser(u) {
    if (!u) return null;
    return { id: u.id, email: u.email || (u.user_metadata && u.user_metadata.email) || "account" };
  }

  // The current Supabase access token (a JWT). Our AWS backend verifies it and
  // reads `sub` to key each user's row, so progress stays private per account.
  function accessToken() {
    if (!client) return Promise.resolve(null);
    return client.auth.getSession()
      .then(function (res) {
        return res && res.data && res.data.session ? res.data.session.access_token : null;
      })
      .catch(function () { return null; });
  }

  var Cloud = {
    // configured = keys present AND sdk loaded AND client built
    configured: !!client,
    // reason cloud isn't available, for friendlier messaging
    reason: !hasKeys ? "not-configured" : (!sdkReady ? "offline" : (!client ? "error" : "ok")),
    user: null,

    /* Resolve the current session (called once on boot). */
    init: function () {
      if (!client) return Promise.resolve(null);
      return client.auth.getSession()
        .then(function (res) {
          var u = res && res.data && res.data.session ? res.data.session.user : null;
          Cloud.user = mapUser(u);
          return Cloud.user;
        })
        .catch(function () { Cloud.user = null; return null; });
    },

    /* Subscribe to login/logout events. cb receives the mapped user or null. */
    onChange: function (cb) {
      if (!client) return;
      client.auth.onAuthStateChange(function (_event, session) {
        Cloud.user = mapUser(session ? session.user : null);
        cb(Cloud.user);
      });
    },

    signUpEmail: function (email, password) {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      return client.auth.signUp({ email: email, password: password })
        .then(function (res) {
          if (res.error) return { error: res.error.message };
          // If email confirmation is on, there's no session yet.
          var session = res.data && res.data.session;
          if (!session) return { needsConfirm: true };
          Cloud.user = mapUser(res.data.user);
          return { user: Cloud.user };
        });
    },

    signInEmail: function (email, password) {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      return client.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) return { error: res.error.message };
          Cloud.user = mapUser(res.data.user);
          return { user: Cloud.user };
        });
    },

    signInGoogle: function () {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      // Strip any OAuth hash so we return to a clean URL after redirect.
      var redirectTo = location.origin + location.pathname;
      return client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo }
      }).then(function (res) {
        if (res.error) return { error: res.error.message };
        return { redirecting: true }; // browser navigates away
      });
    },

    signOut: function () {
      if (!client) return Promise.resolve();
      return client.auth.signOut().then(function () { Cloud.user = null; });
    },

    /* Fetch this user's saved state.
       Returns { ok, state }: ok=false means the server couldn't be reached
       (so callers must NOT treat it as an empty account and overwrite it);
       ok=true with state=null means the account genuinely has no data yet. */
    loadState: function () {
      if (!client || !Cloud.user) return Promise.resolve({ ok: true, state: null });

      // Custom AWS backend.
      if (apiBase) {
        return accessToken().then(function (tok) {
          if (!tok) return { ok: false, state: null };
          return fetch(apiBase + "/progress", {
            headers: { Authorization: "Bearer " + tok }
          })
            .then(function (r) {
              if (!r.ok) return { ok: false, state: null };
              return r.json().then(function (j) {
                return { ok: true, state: j && j.state ? j.state : null };
              });
            })
            .catch(function () { return { ok: false, state: null }; });
        });
      }

      // Supabase `progress` table (default).
      return client.from("progress")
        .select("state")
        .eq("user_id", Cloud.user.id)
        .maybeSingle()
        .then(function (res) {
          if (res.error) return { ok: false, state: null };
          return { ok: true, state: res.data ? (res.data.state || null) : null };
        })
        .catch(function () { return { ok: false, state: null }; });
    },

    /* Upsert this user's state. Returns true on success. */
    saveState: function (state) {
      if (!client || !Cloud.user) return Promise.resolve(false);

      // Custom AWS backend.
      if (apiBase) {
        return accessToken().then(function (tok) {
          if (!tok) return false;
          return fetch(apiBase + "/progress", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + tok
            },
            body: JSON.stringify({ state: state })
          })
            .then(function (r) { return r.ok; })
            .catch(function () { return false; });
        });
      }

      // Supabase `progress` table (default).
      return client.from("progress")
        .upsert({
          user_id: Cloud.user.id,
          state: state,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" })
        .then(function (res) { return !res.error; })
        .catch(function () { return false; });
    }
  };

  window.Cloud = Cloud;
})();
