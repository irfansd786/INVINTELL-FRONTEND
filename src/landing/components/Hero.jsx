import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import HeroNetwork from './HeroNetwork';

export default function Hero() {
  const navigate = useNavigate();

  // Scroll directly to the PLATFORM VIDEO section (#platform-video)
  const scrollToVideo = () => {
    const videoEl = document.getElementById('platform-video');
    if (videoEl) {
      videoEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="inv-hero-section-split">
      <div className="inv-hero-split-container">
        
        {/* Left Column: Text & CTAs */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="inv-hero-left-col"
        >
          <div className="inv-eyebrow-text-pic2">
            SMART WAREHOUSE OPERATIONS
          </div>

          <h1 className="inv-hero-headline-pic2">
            ONE PLATFORM.<br />
            EVERY WAREHOUSE<br />
            <span className="inv-green-text">DECISION.</span>
          </h1>

          <p className="inv-hero-subtext-pic2">
            Manage inventory, operations, risks and future demand from one intelligent platform.
          </p>

          <div className="inv-hero-buttons-pic2">
            <button className="inv-btn-get-started" onClick={() => navigate('/dashboard')}>
              Get Started <ArrowRight size={16} />
            </button>

            <button className="inv-btn-how-it-works-hero" onClick={scrollToVideo}>
              How It Works <ArrowDown size={16} />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Hero Network & Black Hole */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inv-hero-right-col"
        >
          <HeroNetwork />
        </motion.div>

      </div>
    </section>
  );
}
