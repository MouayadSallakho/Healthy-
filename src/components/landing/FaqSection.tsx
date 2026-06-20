"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SectionHeading } from "./SectionHeading";
import { faqs } from "@/lib/landing-content";

/**
 * Accessible FAQ accordion. Each item is a real <button> toggling its panel
 * with aria-expanded/aria-controls; keyboard and screen-reader friendly.
 */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-pad mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
    >
      <SectionHeading
        eyebrow="FAQ"
        title={<span id="faq-heading">Questions, answered</span>}
      />

      <ul className="mt-10 flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <FaqItem
            key={faq.q}
            question={faq.q}
            answer={faq.a}
            isOpen={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </ul>
    </section>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  return (
    <li className="overflow-hidden rounded-2xl border border-graphite/10 bg-white">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-graphite transition-colors hover:text-maroon"
        >
          {question}
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-graphite/15 text-maroon transition-transform duration-300 ${
              isOpen ? "rotate-45" : ""
            }`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-graphite/65">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
