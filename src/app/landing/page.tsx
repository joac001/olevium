'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { HeroSection } from './_components/HeroSection';
import { DemoSection } from './_components/DemoSection';
import { FrustrationsSection } from './_components/FrustrationsSection';
import { ChaosToOrderSection } from './_components/ChaosToOrderSection';
import { PrivacySection } from './_components/PrivacySection';
import { CTASection } from './_components/CTASection';

const TOTAL_SECTIONS = 6;
const SCROLL_COOLDOWN = 800; // ms between scroll actions (increased for smooth animations)
const SCROLL_THRESHOLD = 50; // minimum accumulated delta to trigger scroll
const DELTA_RESET_TIMEOUT = 150; // ms of inactivity before resetting accumulated delta

export default function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const lastScrollTime = useRef(0);
  const isScrolling = useRef(false);
  const accumulatedDelta = useRef(0);
  const deltaResetTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollToSection = useCallback((index: number) => {
    if (!containerRef.current) return;

    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;
    if (isScrolling.current) return;

    const sections = containerRef.current.querySelectorAll('section');
    if (sections[index]) {
      isScrolling.current = true;
      lastScrollTime.current = now;
      accumulatedDelta.current = 0;

      sections[index].scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(index);

      // Reset scrolling flag after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, SCROLL_COOLDOWN);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If currently scrolling, ignore all wheel events
      if (isScrolling.current) return;

      // Clear the reset timer
      if (deltaResetTimer.current) {
        clearTimeout(deltaResetTimer.current);
      }

      // Accumulate the delta
      accumulatedDelta.current += e.deltaY;

      // Set a timer to reset accumulated delta after period of inactivity
      deltaResetTimer.current = setTimeout(() => {
        accumulatedDelta.current = 0;
      }, DELTA_RESET_TIMEOUT);

      // Only trigger scroll when accumulated delta exceeds threshold
      if (accumulatedDelta.current > SCROLL_THRESHOLD && currentSection < TOTAL_SECTIONS - 1) {
        scrollToSection(currentSection + 1);
      } else if (accumulatedDelta.current < -SCROLL_THRESHOLD && currentSection > 0) {
        scrollToSection(currentSection - 1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling.current) return;

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
      if (isScrolling.current) return;

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
      if (deltaResetTimer.current) {
        clearTimeout(deltaResetTimer.current);
      }
    };
  }, [currentSection, scrollToSection]);

  return (
    <main ref={containerRef} className="relative h-screen overflow-hidden">
      <div className="relative z-0 h-full">
        <HeroSection />
        <DemoSection />
        <FrustrationsSection />
        <ChaosToOrderSection />
        <PrivacySection />
        <CTASection />
      </div>
    </main>
  );
}
