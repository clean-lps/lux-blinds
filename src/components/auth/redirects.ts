/**
 * Completing an email challenge creates the account but does not forward the
 * Better Auth session created server-side to the browser. The customer must
 * therefore sign in once before opening a protected route.
 */
export function postVerificationPath(): '/login' {
  return '/login';
}
