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

  // Custom backend (AWS) for progress sync. Set to the SAM stack's ApiUrl
  // output, e.g. "https://abc123.execute-api.us-east-1.amazonaws.com".
  // Leave blank to use the Supabase `progress` table. See backend/README.md.
  API_BASE_URL: "https://b82ayxojhh.execute-api.ap-southeast-2.amazonaws.com",

  // --- AWS Cognito (accounts) ------------------------------------------
  // From the SAM stack outputs (vocabflow-backend, ap-southeast-2). With these
  // set, sign-in runs on Cognito and Supabase is no longer used.
  COGNITO_REGION: "ap-southeast-2",
  COGNITO_USER_POOL_ID: "ap-southeast-2_lWjRUeL9I",
  COGNITO_CLIENT_ID: "1b5724qkhfnri88a6vd30p3n2n",

  // For Google sign-in via Cognito Hosted UI (set ENABLE_GOOGLE: true once the
  // Google IdP is deployed — see backend/README.md "Google sign-in").
  COGNITO_DOMAIN: "https://vocabflow-auth.auth.ap-southeast-2.amazoncognito.com"
};
