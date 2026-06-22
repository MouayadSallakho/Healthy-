"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/admin/auth/auth-context";

/** Branded full-screen loading state while auth hydrates / before redirect. */
function AdminLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-offwhite">
      <div className="flex flex-col items-center gap-3 text-graphite/60">
        <span
          className="h-8 w-8 animate-spin rounded-full border-2 border-maroon/25 border-t-maroon"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}

/**
 * Client-side route guard for the protected admin area. Redirects to
 * `/admin/login` when there is no session, and shows a loading screen while
 * auth hydrates or the redirect is in flight.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return <AdminLoadingScreen />;
  return <>{children}</>;
}
