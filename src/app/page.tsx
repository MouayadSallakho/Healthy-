import { cookies } from "next/headers";
import { INTRO_COOKIE } from "@/lib/landing-content";
import { BrandIntro } from "@/components/landing/BrandIntro";
import { HideOnScrollHeader } from "@/components/landing/HideOnScrollHeader";
import { TopPromoBar } from "@/components/landing/TopPromoBar";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitStrip } from "@/components/landing/BenefitStrip";
import { FeaturedMeals } from "@/components/landing/FeaturedMeals";
import { MenuPreviewTabs } from "@/components/landing/MenuPreviewTabs";
import { MealPlans } from "@/components/landing/MealPlans";
import { MacroGoalSelector } from "@/components/landing/MacroGoalSelector";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { InsideGymPickup } from "@/components/landing/InsideGymPickup";
import { ResultsSection } from "@/components/landing/ResultsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";
import { MobileStickyOrder } from "@/components/landing/MobileStickyOrder";

export default async function Home() {
  // Decide on the server (from a session cookie) so the intro overlay is part
  // of the first paint — no flash of the landing page before it appears.
  const introSeen = (await cookies()).get(INTRO_COOKIE)?.value === "1";

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <BrandIntro
        mode="once-per-session"
        initialShouldShowIntro={!introSeen}
        timingPreset="cinematic"
      />
      <HideOnScrollHeader>
        <TopPromoBar />
        <Navbar />
      </HideOnScrollHeader>

      <main className="flex-1">
        <HeroSection />
        <BenefitStrip />
        <FeaturedMeals />
        <MenuPreviewTabs />
        <MealPlans />
        <MacroGoalSelector />
        <HowItWorks />
        <InsideGymPickup />
        <ResultsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <MobileStickyOrder />
    </div>
  );
}
