"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { Icon } from "@/components/landing/icons";
import { isApiError } from "@/lib/api";
import { useAuth } from "@/features/admin/auth/auth-context";

/**
 * Admin sign-in. Email/password with inline validation + invalid-credentials
 * messaging. Already-authenticated visitors are redirected to the dashboard.
 * Errors are mapped from the API client; raw backend details are never shown.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // If a session already exists, skip the login page.
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/admin");
  }, [isLoading, isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    try {
      await login({ email: email.trim(), password, device_name: "dashboard" });
      router.replace("/admin");
    } catch (err) {
      if (isApiError(err)) {
        if (err.isValidation && err.fieldErrors) {
          setFieldErrors({ email: err.fieldError("email"), password: err.fieldError("password") });
          if (!err.fieldError("email") && !err.fieldError("password")) {
            setFormError("Please check the form and try again.");
          }
        } else if (err.isUnauthenticated) {
          setFormError("Invalid email or password.");
        } else if (err.isNetwork) {
          setFormError("Can't reach the server. Check your connection and try again.");
        } else {
          setFormError("Something went wrong. Please try again.");
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center gym-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo variant="white" className="h-12 w-auto" />
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.22em] text-silver-light/70">
            Admin Dashboard
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-cream p-6 shadow-2xl sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-graphite">Sign in</h1>
          <p className="mt-1 text-sm text-graphite/60">Manage the Barbell Kitchen menu.</p>

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-maroon/20 bg-maroon/8 px-4 py-3 text-sm text-maroon"
            >
              <Icon name="bolt" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-graphite">
                Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? "admin-email-error" : undefined}
                className="min-h-11 w-full rounded-xl border border-graphite/15 bg-white px-3.5 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                placeholder="admin@barbellkitchen.example"
              />
              {fieldErrors.email && (
                <p id="admin-email-error" className="mt-1.5 text-xs font-medium text-maroon">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-graphite">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "admin-password-error" : undefined}
                className="min-h-11 w-full rounded-xl border border-graphite/15 bg-white px-3.5 text-sm text-graphite placeholder:text-graphite/40 focus:border-maroon focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px]"
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p id="admin-password-error" className="mt-1.5 text-xs font-medium text-maroon">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-maroon px-6 text-sm font-semibold text-cream shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-bright disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
