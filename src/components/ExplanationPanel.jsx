import React from 'react';
import { HelpCircle, AlertCircle, ArrowRight } from 'lucide-react';
import './ExplanationPanel.css';

export default function ExplanationPanel({ what, why, impact, action, isRed = false }) {
  return (
    <div className={`explanation-panel ${isRed ? 'panel-red' : ''}`}>
      <div className="exp-item">
        <span className="exp-lbl">WHAT</span>
        <p className="exp-text"><strong>{what}</strong></p>
      </div>

      <div className="exp-item">
        <span className="exp-lbl">WHY</span>
        <p className="exp-text">{why}</p>
      </div>

      {impact && (
        <div className="exp-item">
          <span className="exp-lbl">EXPECTED IMPACT</span>
          <p className="exp-text">{impact}</p>
        </div>
      )}

      {action && (
        <div className="exp-item exp-action-item">
          <span className="exp-lbl">RECOMMENDED ACTION</span>
          <p className="exp-text exp-action-text">{action}</p>
        </div>
      )}
    </div>
  );
}
