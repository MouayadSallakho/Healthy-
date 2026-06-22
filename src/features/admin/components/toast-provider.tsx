"use client";

/**
 * Small custom toast system for the admin panel (no external dependency).
 *
 * - `success | error | warning | info`, auto-dismiss + manual close.
 * - Screen-reader announcements via each toast's role (`status` polite /
 *   `alert` assertive) — no separate live region to avoid double announcements.
 * - Fixed viewport (bottom-center on mobile, bottom-right on desktop); only the
 *   toasts capture pointer events, so they never block the UI.
 * - Mounted by the admin layout only (not on public/landing).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/landing/icons";
import type { IconName } from "@/lib/landing-content";

export type ToastType = "success" | "error" | "warning" | "info";

type Toast = { id: number; type: ToastType; message: string };

type ToastApi = {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS_MS = 4500;

const TOAST_STYLE: Record<ToastType, { accent: string; icon: IconName; role: "status" | "alert" }> = {
  success: { accent: "#7a1e2b", icon: "check", role: "status" },
  error: { accent: "#b42318", icon: "bolt", role: "alert" },
  warning: { accent: "#b7791f", icon: "clock", role: "alert" },
  info: { accent: "#17191b", icon: "spark", role: "status" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = (idRef.current += 1);
      setToasts((current) => [...current, { id, type, message }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  // Clear any pending timers if the provider ever unmounts.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show("success", m),
      error: (m) => show("error", m),
      warning: (m) => show("warning", m),
      info: (m) => show("info", m),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const style = TOAST_STYLE[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              role={style.role}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-graphite/10 bg-white px-4 py-3 shadow-lg"
              style={{ borderLeftColor: style.accent, borderLeftWidth: 4 }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: style.accent }}>
                <Icon name={style.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm leading-snug text-graphite">{toast.message}</p>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-graphite/45 transition-colors hover:bg-graphite/5 hover:text-graphite"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
