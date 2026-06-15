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
  SUPABASE_URL: "",      // e.g. "https://abcdefgh.supabase.co"
  SUPABASE_ANON_KEY: "", // e.g. "eyJhbGciOiJI..."

  // Optional: set to false to hide the "Continue with Google" button
  // (only enable it if you've configured the Google provider in Supabase).
  ENABLE_GOOGLE: true
};
