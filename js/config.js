/*
 * VocabFlow configuration
 * ------------------------------------------------------------------
 * Paste your Supabase project's URL and "anon public" key below to
 * turn on accounts + cross-device sync. Leave them blank and the app
 * runs in offline guest mode (progress saved in this browser only).
 *
 * The anon key is SAFE to commit publicly — it only allows the actions
 * your Row Level Security policies permit (see supabase/schema.sql).
 * Never put the "service_role" / secret key here.
 *
 * Where to find these: Supabase dashboard -> Project Settings ->
 * Data API (Project URL) and API Keys (anon public key).
 */
window.VOCABFLOW_CONFIG = {
  // Base project URL only — NOT the ".../rest/v1/" endpoint. The client adds paths itself.
  SUPABASE_URL: "https://gmumbqqmlvghuwizdnut.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_fecRgCCUl6jf-yqQpO8RQQ_rSZdK7Lt",

  // Google sign-in stays off until you configure the Google provider in
  // Supabase (Authentication -> Providers). Email/password works without it.
  // Flip this to true once Google is set up.
  ENABLE_GOOGLE: false,

  // Custom backend (AWS) for progress sync. When set, the app stores per-user
  // progress in OUR API instead of Supabase's database — Supabase is then only
  // the login service. Leave blank to keep using the Supabase `progress` table.
  // Set this to the SAM stack's ApiUrl output, e.g.
  //   "https://abc123.execute-api.us-east-1.amazonaws.com"
  // See backend/README.md to deploy. (Sign-in is unchanged either way.)
  API_BASE_URL: ""
};
