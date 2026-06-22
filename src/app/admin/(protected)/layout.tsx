import { RequireAuth } from "@/features/admin/components/require-auth";
import { AdminShell } from "@/features/admin/components/admin-shell";

/**
 * Guarded admin layout (route group — adds no URL segment). Everything inside
 * requires a session and renders within the admin shell. The login page lives
 * outside this group, so it stays unguarded and chrome-free.
 */
export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
