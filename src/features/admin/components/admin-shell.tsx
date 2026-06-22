"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/landing/Logo";
import { Icon } from "@/components/landing/icons";
import { useAuth } from "@/features/admin/auth/auth-context";
import { ConfirmDialog } from "./confirm-dialog";
import { adminNavItems, isNavItemActive } from "./admin-nav";

/**
 * Protected admin chrome: sticky topbar (logo, user, logout) + a left sidebar
 * on `lg+` and a slide-in drawer on mobile. Active nav reflects the route.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await logout(); // best-effort + redirect to /admin/login (errors are swallowed)
  }

  // Lock body scroll + Escape-to-close while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  const navList = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {adminNavItems.map((item) => {
        const active = isNavItemActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-maroon text-cream shadow-sm shadow-maroon/20"
                : "text-graphite/70 hover:bg-maroon/8 hover:text-maroon"
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-offwhite text-graphite">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-graphite/10 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="grid h-10 w-10 place-items-center rounded-full border border-graphite/15 text-graphite transition-colors hover:bg-maroon/8 hover:text-maroon lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <Logo variant="red" className="h-8 w-auto" />
          <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.18em] text-graphite/60 sm:inline">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight text-graphite">{user?.name ?? "Admin"}</p>
            {user?.email && <p className="text-xs leading-tight text-graphite/55">{user.email}</p>}
          </div>
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-graphite/20 px-4 text-sm font-semibold text-graphite transition-colors hover:border-maroon hover:text-maroon"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M15 12H3m0 0 4-4m-4 4 4 4M21 4v16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-graphite/10 p-4 lg:block">
          <div className="sticky top-[5rem]">{navList}</div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation"
              className="absolute left-0 top-0 flex h-full w-72 max-w-[80vw] flex-col gap-4 bg-cream p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <Logo variant="red" className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="grid h-10 w-10 place-items-center rounded-full border border-graphite/15 text-graphite transition-colors hover:bg-maroon/8 hover:text-maroon"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {navList}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <ConfirmDialog
        open={showLogout}
        title="Sign out?"
        message="You will need to sign in again to manage the menu."
        confirmLabel="Sign out"
        loading={signingOut}
        onConfirm={handleLogout}
        onCancel={() => {
          if (!signingOut) setShowLogout(false);
        }}
      />
    </div>
  );
}
