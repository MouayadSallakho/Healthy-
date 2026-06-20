import { BrandIntro } from "@/components/landing/BrandIntro";
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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <BrandIntro />
      <TopPromoBar />
      <Navbar />

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
