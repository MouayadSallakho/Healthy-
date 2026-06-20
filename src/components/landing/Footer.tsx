import { Logo } from "./Logo";
import { CtaButton } from "./CtaButton";
import { footer, brand, PRODUCTS_ROUTE } from "@/lib/landing-content";

const socialGlyphs: Record<string, string> = {
  Instagram: "IG",
  TikTok: "TT",
  YouTube: "YT",
  X: "X",
};

/**
 * Site footer with brand summary, quick links, contact, hours, and socials.
 * Extra bottom padding on mobile keeps content clear of the sticky order bar.
 */
export function Footer() {
  return (
    <footer
      id="footer"
      className="gym-surface text-cream"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        {brand.name} footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 min-w-0 lg:col-span-2">
            <Logo variant="red" className="h-auto w-18 sm:w-20" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-silver-light/75">
              {footer.description}
            </p>
            <div className="mt-5">
              <CtaButton href={PRODUCTS_ROUTE} variant="primary" size="md">
                Order Now
              </CtaButton>
            </div>
          </div>

          <nav aria-label="Footer" className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-silver-light/60">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footer.quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/85 transition-colors hover:text-maroon-bright"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-silver-light/60">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 break-words text-sm text-cream/85">
              <li>{footer.contact.address}</li>
              <li>
                <a
                  href={`tel:${footer.contact.phone.replace(/[^+\d]/g, "")}`}
                  className="transition-colors hover:text-maroon-bright"
                >
                  {footer.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${footer.contact.email}`}
                  className="transition-colors hover:text-maroon-bright"
                >
                  {footer.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-silver-light/60">
              Hours
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-cream/85">
              {footer.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3">
                  <span className="text-silver-light/70">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="metal-divider mt-12 h-px" />

        <div className="flex flex-col items-center justify-between gap-4 py-7 pb-24 sm:flex-row md:pb-8">
          <p className="text-xs text-silver-light/60">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-3">
            {footer.socials.map((s) => (
              <li key={s}>
                <a
                  href="#"
                  aria-label={s}
                  className="grid h-9 w-9 place-items-center rounded-full border border-cream/20 text-[0.7rem] font-bold text-silver-light transition-colors hover:border-maroon-bright hover:text-maroon-bright"
                >
                  {socialGlyphs[s] ?? s.slice(0, 2)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
