import { MealCard } from "./MealCard";
import { SectionHeading } from "./SectionHeading";
import { CtaButton } from "./CtaButton";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { featuredMeals, PRODUCTS_ROUTE } from "@/lib/landing-content";

export function FeaturedMeals() {
  return (
    <section
      id="featured"
      aria-labelledby="featured-heading"
      className="section-pad mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <SectionHeading
        eyebrow="Signature meals"
        title={<span id="featured-heading">Fuel built for your training</span>}
        intro="Chef-prepared, macro-counted plates designed for performance, recovery, and everyday strength."
      />

      <RevealGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredMeals.map((meal) => (
          <RevealItem key={meal.id} className="h-full">
            <MealCard meal={meal} />
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-10 flex justify-center" delay={0.1}>
        <CtaButton href={PRODUCTS_ROUTE} variant="secondary">
          View Full Menu
        </CtaButton>
      </Reveal>
    </section>
  );
}
