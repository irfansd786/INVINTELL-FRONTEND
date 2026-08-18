import React from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube, 
  MessageSquare 
} from 'lucide-react';

export default function LandingFooter() {
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
    <footer className="inv-footer">
      <div className="inv-footer-grid-clean">
        {/* Column 1: Left - Brand & Tagline */}
        <div>
          <div className="inv-footer-brand-title">INVINTELL</div>
          <div style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
            Smart Warehouse Operations & Inventory Intelligence Platform
          </div>
          <p className="inv-footer-subtext">
            "One platform for inventory visibility, operational intelligence and better warehouse decisions."
          </p>
          <div className="inv-copyright">
            © {new Date().getFullYear()} INVINTELL. All rights reserved.
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div>
          <div className="inv-footer-col-title">NAVIGATION</div>
          <div className="inv-footer-links-list">
            <button className="inv-footer-link" onClick={scrollToTop}>Home</button>
            <button className="inv-footer-link" onClick={scrollToVideo}>How It Works</button>
          </div>
        </div>

        {/* Column 3: Follow Us Links */}
        <div>
          <div className="inv-footer-col-title">FOLLOW US</div>
          <div className="inv-social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inv-social-item">
              <Instagram size={18} /> Instagram
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="inv-social-item">
              <Linkedin size={18} /> LinkedIn
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="inv-social-item">
              <Twitter size={18} /> X (Twitter)
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="inv-social-item">
              <Youtube size={18} /> YouTube
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="inv-social-item">
              <MessageSquare size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
