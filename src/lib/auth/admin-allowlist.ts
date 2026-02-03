const getAdminAllowlist = (): string[] =>
  (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email: string): boolean => {
  const allowlist = getAdminAllowlist();
  if (!allowlist.length) return false;
  return allowlist.includes(email.trim().toLowerCase());
};
