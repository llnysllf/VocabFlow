/*
 * cloud.js — accounts + progress sync.
 *
 * Exposes a single global `Cloud`. Auth runs through ONE provider, chosen by
 * config:
 *   - AWS Cognito  — when COGNITO_USER_POOL_ID + COGNITO_CLIENT_ID are set
 *                    (and the Cognito SDK loaded). This is the all-AWS path.
 *   - Supabase     — otherwise (the original path; kept so the live site keeps
 *                    working until the Cognito pool is deployed + configured).
 *
 * Progress data always syncs through our AWS API when API_BASE_URL is set; the
 * Supabase `progress` table is only used as a fallback under the Supabase
 * provider. Every method is safe to call when nothing is configured (guest mode).
 */
(function () {
  "use strict";

  var cfg = window.VOCABFLOW_CONFIG || {};
  var apiBase = (cfg.API_BASE_URL || "").replace(/\/+$/, "");

  // ---- provider selection ------------------------------------------------
  var cognitoReady =
    typeof window.AmazonCognitoIdentity !== "undefined" &&
    !!window.AmazonCognitoIdentity.CognitoUserPool;
  var hasCognitoCfg = !!(cfg.COGNITO_USER_POOL_ID && cfg.COGNITO_CLIENT_ID);

  var supaReady = typeof window.supabase !== "undefined" && !!window.supabase.createClient;
  var hasSupaCfg = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  var provider = hasCognitoCfg && cognitoReady ? "cognito"
               : (hasSupaCfg && supaReady ? "supabase" : null);

  var changeCb = null; // the app's onChange listener

  var Cloud = {
    configured: false,
    reason: "not-configured",
    provider: provider,
    user: null,
    init: function () { return Promise.resolve(null); },
    onChange: function (cb) { changeCb = cb; },
    signUpEmail: function () { return Promise.resolve({ error: "Cloud not configured." }); },
    signInEmail: function () { return Promise.resolve({ error: "Cloud not configured." }); },
    signInGoogle: function () { return Promise.resolve({ error: "Cloud not configured." }); },
    signOut: function () { return Promise.resolve(); },
    loadState: function () { return Promise.resolve({ ok: true, state: null }); },
    saveState: function () { return Promise.resolve(false); }
  };

  function setUser(u) {
    Cloud.user = u;
    if (changeCb) { try { changeCb(u); } catch (e) {} }
  }

  // accessToken() resolves the current provider's JWT (or null). Used to
  // authenticate calls to our AWS /progress API.
  var accessToken = function () { return Promise.resolve(null); };

  // ---- shared data layer (AWS API) --------------------------------------
  function apiLoadState() {
    if (!Cloud.user) return Promise.resolve({ ok: true, state: null });
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
  function apiSaveState(state) {
    if (!Cloud.user) return Promise.resolve(false);
    return accessToken().then(function (tok) {
      if (!tok) return false;
      return fetch(apiBase + "/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok },
        body: JSON.stringify({ state: state })
      })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; });
    });
  }

  // =======================================================================
  // Cognito provider
  // =======================================================================
  if (provider === "cognito") {
    var AC = window.AmazonCognitoIdentity;
    var pool = null;
    try {
      pool = new AC.CognitoUserPool({
        UserPoolId: cfg.COGNITO_USER_POOL_ID,
        ClientId: cfg.COGNITO_CLIENT_ID
      });
    } catch (e) { pool = null; }

    Cloud.configured = !!pool;
    Cloud.reason = pool ? "ok" : "error";

    function userFromSession(session) {
      var p = {};
      try { p = session.getIdToken().decodePayload(); } catch (e) {}
      return { id: p.sub, email: p.email || "account" };
    }

    accessToken = function () {
      return new Promise(function (resolve) {
        var u = pool && pool.getCurrentUser();
        if (!u) return resolve(null);
        u.getSession(function (err, session) {
          if (err || !session || !session.isValid()) return resolve(null);
          resolve(session.getAccessToken().getJwtToken());
        });
      });
    };

    // ---- Hosted UI (Google) via OAuth code flow + PKCE -------------------
    var hostedDomain = (cfg.COGNITO_DOMAIN || "").replace(/\/+$/, "");
    function redirectUri() { return location.origin + location.pathname; }
    function b64url(buf) {
      var bytes = new Uint8Array(buf), s = "";
      for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function makePkce() {
      var rnd = new Uint8Array(32);
      crypto.getRandomValues(rnd);
      var verifier = b64url(rnd.buffer);
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
        .then(function (hash) { return { verifier: verifier, challenge: b64url(hash) }; });
    }
    function cleanUrl() {
      try { history.replaceState({}, document.title, location.origin + location.pathname); } catch (e) {}
    }
    function bridgeSession(tok) {
      // Turn Hosted-UI tokens into an SDK session so getCurrentUser()/getSession()
      // (and silent refresh) work the same as for password sign-in.
      var idToken = new AC.CognitoIdToken({ IdToken: tok.id_token });
      var accessTok = new AC.CognitoAccessToken({ AccessToken: tok.access_token });
      var refreshTok = new AC.CognitoRefreshToken({ RefreshToken: tok.refresh_token || "" });
      var session = new AC.CognitoUserSession({ IdToken: idToken, AccessToken: accessTok, RefreshToken: refreshTok });
      var payload = idToken.decodePayload();
      var username = payload["cognito:username"] || payload.sub;
      var user = new AC.CognitoUser({ Username: username, Pool: pool });
      user.setSignInUserSession(session);
      setUser({ id: payload.sub, email: payload.email || "account" });
    }
    function handleRedirect() {
      var params = new URLSearchParams(location.search);
      var code = params.get("code");
      if (!code) return Promise.resolve();
      var verifier = sessionStorage.getItem("vf_pkce");
      sessionStorage.removeItem("vf_pkce");
      if (!verifier || !hostedDomain) { cleanUrl(); return Promise.resolve(); }
      var body = new URLSearchParams();
      body.set("grant_type", "authorization_code");
      body.set("client_id", cfg.COGNITO_CLIENT_ID);
      body.set("code", code);
      body.set("redirect_uri", redirectUri());
      body.set("code_verifier", verifier);
      return fetch(hostedDomain + "/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (tok) { if (tok && tok.id_token) bridgeSession(tok); cleanUrl(); })
        .catch(function () { cleanUrl(); });
    }

    function signIn(email, password) {
      return new Promise(function (resolve) {
        var user = new AC.CognitoUser({ Username: email, Pool: pool });
        var details = new AC.AuthenticationDetails({ Username: email, Password: password });
        user.authenticateUser(details, {
          onSuccess: function (session) {
            setUser(userFromSession(session));
            resolve({ user: Cloud.user });
          },
          onFailure: function (err) { resolve({ error: (err && err.message) || String(err) }); }
        });
      });
    }

    Cloud.init = function () {
      // First complete any Hosted-UI (Google) redirect, then resolve the session.
      return handleRedirect().then(function () {
        return new Promise(function (resolve) {
          var u = pool && pool.getCurrentUser();
          if (!u) { Cloud.user = null; return resolve(null); }
          u.getSession(function (err, session) {
            if (err || !session || !session.isValid()) { Cloud.user = null; return resolve(null); }
            Cloud.user = userFromSession(session);
            resolve(Cloud.user);
          });
        });
      });
    };

    Cloud.signUpEmail = function (email, password) {
      return new Promise(function (resolve) {
        var attrs = [new AC.CognitoUserAttribute({ Name: "email", Value: email })];
        pool.signUp(email, password, attrs, null, function (err) {
          if (err) return resolve({ error: (err && err.message) || String(err) });
          // PreSignUp trigger auto-confirms, so sign in immediately.
          signIn(email, password).then(resolve);
        });
      });
    };

    Cloud.signInEmail = function (email, password) { return signIn(email, password); };

    Cloud.signInGoogle = function () {
      if (!hostedDomain) {
        return Promise.resolve({ error: "Google sign-in isn't configured (set COGNITO_DOMAIN)." });
      }
      return makePkce().then(function (p) {
        sessionStorage.setItem("vf_pkce", p.verifier);
        var url = hostedDomain + "/oauth2/authorize?" + [
          "identity_provider=Google",
          "response_type=code",
          "client_id=" + encodeURIComponent(cfg.COGNITO_CLIENT_ID),
          "redirect_uri=" + encodeURIComponent(redirectUri()),
          "scope=" + encodeURIComponent("openid email profile"),
          "code_challenge=" + encodeURIComponent(p.challenge),
          "code_challenge_method=S256"
        ].join("&");
        location.assign(url);
        return { redirecting: true };
      });
    };

    Cloud.signOut = function () {
      return new Promise(function (resolve) {
        var u = pool && pool.getCurrentUser();
        if (u) { try { u.signOut(); } catch (e) {} }
        setUser(null);
        resolve();
      });
    };

    Cloud.loadState = apiLoadState;
    Cloud.saveState = apiSaveState;
  }

  // =======================================================================
  // Supabase provider (original)
  // =======================================================================
  else if (provider === "supabase") {
    var client = null;
    try {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    } catch (e) { client = null; }

    Cloud.configured = !!client;
    Cloud.reason = client ? "ok" : "error";

    function mapUser(u) {
      if (!u) return null;
      return { id: u.id, email: u.email || (u.user_metadata && u.user_metadata.email) || "account" };
    }

    accessToken = function () {
      if (!client) return Promise.resolve(null);
      return client.auth.getSession()
        .then(function (res) {
          return res && res.data && res.data.session ? res.data.session.access_token : null;
        })
        .catch(function () { return null; });
    };

    Cloud.init = function () {
      if (!client) return Promise.resolve(null);
      return client.auth.getSession()
        .then(function (res) {
          var u = res && res.data && res.data.session ? res.data.session.user : null;
          Cloud.user = mapUser(u);
          return Cloud.user;
        })
        .catch(function () { Cloud.user = null; return null; });
    };

    Cloud.onChange = function (cb) {
      changeCb = cb;
      if (!client) return;
      client.auth.onAuthStateChange(function (_event, session) {
        Cloud.user = mapUser(session ? session.user : null);
        if (changeCb) { try { changeCb(Cloud.user); } catch (e) {} }
      });
    };

    Cloud.signUpEmail = function (email, password) {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      return client.auth.signUp({ email: email, password: password })
        .then(function (res) {
          if (res.error) return { error: res.error.message };
          var session = res.data && res.data.session;
          if (!session) return { needsConfirm: true };
          Cloud.user = mapUser(res.data.user);
          return { user: Cloud.user };
        });
    };

    Cloud.signInEmail = function (email, password) {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      return client.auth.signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) return { error: res.error.message };
          Cloud.user = mapUser(res.data.user);
          return { user: Cloud.user };
        });
    };

    Cloud.signInGoogle = function () {
      if (!client) return Promise.resolve({ error: "Cloud not configured." });
      var redirectTo = location.origin + location.pathname;
      return client.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo } })
        .then(function (res) {
          if (res.error) return { error: res.error.message };
          return { redirecting: true };
        });
    };

    Cloud.signOut = function () {
      if (!client) return Promise.resolve();
      return client.auth.signOut().then(function () { Cloud.user = null; });
    };

    Cloud.loadState = function () {
      if (!client || !Cloud.user) return Promise.resolve({ ok: true, state: null });
      if (apiBase) return apiLoadState();
      return client.from("progress")
        .select("state")
        .eq("user_id", Cloud.user.id)
        .maybeSingle()
        .then(function (res) {
          if (res.error) return { ok: false, state: null };
          return { ok: true, state: res.data ? (res.data.state || null) : null };
        })
        .catch(function () { return { ok: false, state: null }; });
    };

    Cloud.saveState = function (state) {
      if (!client || !Cloud.user) return Promise.resolve(false);
      if (apiBase) return apiSaveState(state);
      return client.from("progress")
        .upsert({ user_id: Cloud.user.id, state: state, updated_at: new Date().toISOString() },
                { onConflict: "user_id" })
        .then(function (res) { return !res.error; })
        .catch(function () { return false; });
    };
  }

  // =======================================================================
  // Nothing configured (guest mode)
  // =======================================================================
  else {
    Cloud.reason = (hasCognitoCfg || hasSupaCfg) ? "offline" : "not-configured";
  }

  window.Cloud = Cloud;
})();
