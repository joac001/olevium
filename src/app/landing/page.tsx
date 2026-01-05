'use client';

import { HeroSection } from './_components/HeroSection';
import { DemoSection } from './_components/DemoSection';
import { FrustrationsSection } from './_components/FrustrationsSection';
import { ChaosToOrderSection } from './_components/ChaosToOrderSection';
import { PrivacySection } from './_components/PrivacySection';
import { CTASection } from './_components/CTASection';

export default function NewLandingPage() {
  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory">
      <div className="relative z-0">
        <HeroSection />
        <DemoSection />
        <FrustrationsSection />
        <ChaosToOrderSection />
        <PrivacySection />
        <CTASection />
      </div>
    </div>
  );
}
