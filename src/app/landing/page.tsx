'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { HeroSection } from './_components/HeroSection';
import { DemoSection } from './_components/DemoSection';
import { FrustrationsSection } from './_components/FrustrationsSection';
import { ChaosToOrderSection } from './_components/ChaosToOrderSection';
import { PrivacySection } from './_components/PrivacySection';
import { CTASection } from './_components/CTASection';

const TOTAL_SECTIONS = 6;
const SCROLL_COOLDOWN = 500; // ms between scroll actions

export default function NewLandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const lastScrollTime = useRef(0);

  const scrollToSection = useCallback((index: number) => {
    if (!containerRef.current) return;

    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;

    const sections = containerRef.current.querySelectorAll('section');
    if (sections[index]) {
      lastScrollTime.current = now;
      sections[index].scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(index);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.deltaY > 0 && currentSection < TOTAL_SECTIONS - 1) {
        scrollToSection(currentSection + 1);
      } else if (e.deltaY < 0 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentSection < TOTAL_SECTIONS - 1) {
          e.preventDefault();
          scrollToSection(currentSection + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSection > 0) {
          e.preventDefault();
          scrollToSection(currentSection - 1);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY;

      if (deltaY > 50 && currentSection < TOTAL_SECTIONS - 1) {
        scrollToSection(currentSection + 1);
      } else if (deltaY < -50 && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSection, scrollToSection]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden"
    >
      <div className="relative z-0 h-full">
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
