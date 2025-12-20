'use client';

import { FixedLogo } from './_components/FixedLogo';
import { HeroSection } from './_components/HeroSection';
import { IntroSection } from './_components/IntroSection';
import { ChaosToOrderSection } from './_components/ChaosToOrderSection';
import { KnowledgeSection } from './_components/KnowledgeSection';
import { PrivacySection } from './_components/PrivacySection';
import { CTASection } from './_components/CTASection';

export default function LandingPage() {
  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory">
      {/* Logo fijo que permanece centrado */}
      <FixedLogo />

      {/* Contenido que se mueve con el scroll */}
      <div className="relative z-0">
        <HeroSection />
        <IntroSection />
        <PrivacySection />
        <ChaosToOrderSection />
        <KnowledgeSection />
        <CTASection />
      </div>
    </div>
  );
}
