// Client-side admin check: controls UI visibility only.
// Actual security is enforced via Supabase RLS policies.
export const isUserAdmin = (user) => {
  if (!user) return false;
  const adminEmails = JSON.parse(import.meta.env.VITE_ADMIN_EMAILS || '[]');
  return adminEmails.includes(user.email);
};