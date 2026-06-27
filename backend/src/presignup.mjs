/*
 * presignup.mjs — Cognito Pre-Sign-up trigger.
 *
 * Auto-confirms each new user and marks their email verified, so sign-up is
 * immediately usable with no emailed confirmation code (matches the app's
 * previous "email confirmation off" behaviour). Remove the auto-confirm lines
 * if you'd rather require email verification.
 */
export async function handler(event) {
  event.response.autoConfirmUser = true;
  if (event.request.userAttributes && event.request.userAttributes.email) {
    event.response.autoVerifyEmail = true;
  }
  return event;
}
