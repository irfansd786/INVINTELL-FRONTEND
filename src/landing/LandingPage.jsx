import React from 'react';
import LandingNavbar from './components/LandingNavbar';
import Hero from './components/Hero';
import Challenge from './components/Challenge';
import PlatformSection from './components/PlatformSection';
import PlatformVideo from './components/PlatformVideo';
import HowItWorks from './components/HowItWorks';
import LandingFooter from './components/LandingFooter';
import './styles/landing.css';

export default function LandingPage() {
  return (
    <div className="inv-landing-root">
      {/* 1. NAVBAR */}
      <LandingNavbar />

      {/* 2. HERO */}
      <Hero />

      {/* 3. THE CHALLENGE */}
      <Challenge />

      {/* 4. OUR PLATFORM */}
      <PlatformSection />

      {/* 5. PLATFORM VIDEO */}
      <PlatformVideo />

      {/* 6. HOW IT WORKS */}
      <HowItWorks />

      {/* 7. FOOTER */}
      <LandingFooter />
    </div>
  );
}
