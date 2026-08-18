import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';

export default function LandingNavbar() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToVideo = () => {
    const el = document.getElementById('platform-video');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="inv-navbar">
      <div className="inv-nav-left" onClick={scrollToTop}>
        <div className="inv-brand-mark">
          <Layers size={18} />
        </div>
        <span className="inv-brand-name">
          <span>INVI</span><span className="inv-green-text">NTELL</span>
        </span>
      </div>

      <nav className="inv-nav-center">
        <button className="inv-nav-link active-home" onClick={scrollToTop}>
          Home
        </button>
        <button className="inv-nav-link" onClick={scrollToVideo}>
          How It Works
        </button>
      </nav>

      <div className="inv-nav-right">
        <button className="inv-btn-navbar-getstarted" onClick={() => navigate('/dashboard')}>
          Get Started
        </button>
      </div>
    </header>
  );
}
