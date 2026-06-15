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

    /* Fetch this user's saved state, or null if they have none yet. */
    loadState: function () {
      if (!client || !Cloud.user) return Promise.resolve(null);
      return client.from("progress")
        .select("state")
        .eq("user_id", Cloud.user.id)
        .maybeSingle()
        .then(function (res) {
          if (res.error || !res.data) return null;
          return res.data.state || null;
        })
        .catch(function () { return null; });
    },

    /* Upsert this user's state. Returns true on success. */
    saveState: function (state) {
      if (!client || !Cloud.user) return Promise.resolve(false);
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
