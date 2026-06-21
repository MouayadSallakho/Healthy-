"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CtaButton } from "./CtaButton";
import { RotatingHeaderLogo } from "./RotatingHeaderLogo";
import { MobileMenu } from "./MobileMenu";
import { navLinks, PRODUCTS_ROUTE, brand } from "@/lib/landing-content";

type NavLink = { label: string; href: string };

/**
 * Premium sticky navbar. Transparent over the hero, then condenses into a
 * blurred brushed-silver bar once the user scrolls. Slides down on load.
 *
 * Reusable across routes: pass `links` / `logoHref` / `activeHref` to adapt the
 * navigation (defaults preserve the landing-page behavior).
 */
export function Navbar({
  links = navLinks,
  logoHref = "#home",
  activeHref,
}: {
  links?: NavLink[];
  logoHref?: string;
  activeHref?: string;
} = {}) {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Positioning/stickiness is owned by <HideOnScrollHeader>; this stays
          in-flow within it. */}
      <motion.header
        initial={reduce ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="relative z-40"
      >
        <div
          className={`transition-colors duration-300 ${
            scrolled
              ? "border-b border-black/5 bg-cream/85 shadow-sm backdrop-blur-lg"
              : "bg-transparent"
          }`}
        >
          <nav
            aria-label="Primary"
            className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8"
          >
            <a href={logoHref} aria-label="Barbell Kitchen — home" className="text-graphite">
              <RotatingHeaderLogo />
            </a>

            <div className="hidden items-center gap-1 lg:flex">
              {links.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-maroon/10 text-maroon"
                        : "text-graphite/80 hover:bg-maroon/8 hover:text-maroon"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden rounded-full border border-maroon/25 bg-maroon/8 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-maroon xl:inline-flex">
                {brand.badge}
              </span>
              <div className="hidden sm:block">
                <CtaButton href={PRODUCTS_ROUTE} variant="primary" size="md">
                  Order Now
                </CtaButton>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-graphite/15 text-graphite transition-colors hover:bg-maroon/8 hover:text-maroon md:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        activeHref={activeHref}
      />
    </>
  );
}
