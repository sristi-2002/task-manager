/**
 * user-not-found and wrong-password deliberately share one message:
 * distinguishing them tells an attacker which emails are registered.
 */
const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use':
    'That email is already registered. Try signing in instead.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/too-many-requests':
    'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed':
    'No connection. Check your network and try again.',
  'auth/user-disabled': 'This account has been disabled.',
  // Firebase reports CONFIGURATION_NOT_FOUND as an internal error. In practice
  // it almost always means Email/Password sign-in is switched off for the project.
  'auth/operation-not-allowed':
    'Email/password sign-in is not enabled for this Firebase project.',
  'auth/internal-error':
    'Email/password sign-in is not enabled for this Firebase project. Enable it in Firebase console → Authentication → Sign-in method.',
};

export const mapAuthError = (code: string): string =>
  MESSAGES[code] ?? 'Something went wrong. Please try again.';
