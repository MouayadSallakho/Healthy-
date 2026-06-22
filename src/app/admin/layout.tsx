import type { Metadata } from "next";
import { AuthProvider } from "@/features/admin/auth/auth-context";
import { ToastProvider } from "@/features/admin/components/toast-provider";

export const metadata: Metadata = {
  title: "Admin — Barbell Kitchen",
  // The admin area must never be indexed.
  robots: { index: false, follow: false },
};

/**
 * Base admin layout: provides auth + toast context to every admin route (login +
 * protected). The shell + route guard live in the (protected) group so the
 * login page isn't wrapped by them. The toast viewport lives here so toasts
 * persist across client-side navigations (e.g. "Product created." after a
 * redirect) and never appear on the public site.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
