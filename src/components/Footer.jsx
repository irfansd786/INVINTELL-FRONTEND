import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-status">
          <span className="status-dot"></span>
          <span>SYSTEM STATUS: OPERATIONAL — ALL WAREHOUSES SYNCED</span>
        </div>
        <div className="footer-copy">
          INVENTORY INTELLIGENCE PLATFORM &copy; 2026 ENTERPRISE EDITION
        </div>
      </div>
    </footer>
  );
}
