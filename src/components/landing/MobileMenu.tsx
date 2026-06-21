"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CtaButton } from "./CtaButton";
import { Logo } from "./Logo";
import { navLinks, PRODUCTS_ROUTE, brand } from "@/lib/landing-content";

type NavLink = { label: string; href: string };

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  links?: NavLink[];
  activeHref?: string;
};

/**
 * Accessible animated mobile navigation drawer.
 * - Closes on Escape and on link selection.
 * - Locks body scroll while open and moves focus into the panel.
 */
export function MobileMenu({
  open,
  onClose,
  links = navLinks,
  activeHref,
}: MobileMenuProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  // Portal target. Rendering to <body> keeps the drawer out of the (transformed)
  // sticky header, so its `position: fixed` stays relative to the viewport.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setContainer(document.body));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the drawer for keyboard users.
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!container) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 md:hidden"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-ink/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            initial={reduce ? false : { x: "100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col gap-2 bg-graphite px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-cream shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <Logo variant="white" className="h-9 w-auto" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <span className="mt-2 w-fit rounded-full bg-maroon/30 px-3 py-1 text-[0.7rem] font-semibold tracking-widest text-cream uppercase">
              {brand.badge}
            </span>

            <nav className="mt-4 flex flex-col" aria-label="Mobile">
              {links.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-12 items-center border-b border-cream/10 text-lg font-medium transition-colors ${
                      isActive ? "text-maroon-bright" : "text-cream/90 hover:text-cream"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <CtaButton href={PRODUCTS_ROUTE} variant="primary" fullWidth>
                Order Now
              </CtaButton>
              <CtaButton href={PRODUCTS_ROUTE} variant="ghost" fullWidth>
                View Products
              </CtaButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    container,
  );
}
