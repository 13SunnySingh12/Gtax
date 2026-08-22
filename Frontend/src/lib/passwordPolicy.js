/**
 * Single source of truth for password rules, shared by Signup and ResetPassword
 * (the two places a NEW password is created). Login does NOT enforce these — an
 * existing account may predate the policy — it only offers show/hide.
 *
 * Supabase is the real server-side enforcer (min length + required character
 * classes + leaked-password protection, configured in the dashboard). These
 * checks give the user instant, friendly feedback before the request is sent.
 */

export const PASSWORD_RULES_TEXT =
  'At least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character.';

// A short denylist of the most-guessed passwords. Not exhaustive — Supabase's
// leaked-password protection (HaveIBeenPwned) is the real breadth here; this just
// catches the obvious ones instantly on the client.
const COMMON = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123',
  'qwerty', 'qwerty123', 'qwertyui', 'abc12345', '11111111', '00000000',
  'iloveyou', 'admin123', 'letmein1', 'welcome1', 'monkey12', 'football',
  'password!', 'passw0rd', '1q2w3e4r', 'zxcvbnm1', 'trustno1', 'sunshine',
]);

/** The individual requirements, each with a pass/fail check. */
export function passwordChecks(pw = '') {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    notCommon: pw.length > 0 && !COMMON.has(pw.toLowerCase()),
  };
}

/**
 * Returns an error string if the password is not acceptable, or null if it is.
 * Never includes the password value itself.
 */
export function validatePassword(pw = '') {
  const c = passwordChecks(pw);
  if (!c.notCommon) return 'That password is too common. Please choose a less predictable one.';
  if (!c.length || !c.upper || !c.lower || !c.number || !c.special) {
    return `Password must be ${PASSWORD_RULES_TEXT.charAt(0).toLowerCase()}${PASSWORD_RULES_TEXT.slice(1)}`;
  }
  return null;
}

/**
 * Strength for the indicator: 'weak' | 'medium' | 'strong'. Based on how many
 * requirements pass plus a small length bonus — deliberately simple.
 */
export function passwordStrength(pw = '') {
  if (!pw) return null;
  const c = passwordChecks(pw);
  if (!c.notCommon) return 'weak';
  const met = [c.length, c.upper, c.lower, c.number, c.special].filter(Boolean).length;
  if (met <= 2) return 'weak';
  if (met === 3 || met === 4) return 'medium';
  // all five met — strong, with an extra nudge for longer passwords
  return pw.length >= 12 ? 'strong' : 'strong';
}
