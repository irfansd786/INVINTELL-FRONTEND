import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import './RiskScoreCard.css';

export default function RiskScoreCard({ score = 0, level = "LOW", factors = [] }) {
  const isHigh = level === 'CRITICAL' || level === 'HIGH';

  return (
    <div className={`risk-score-card ${isHigh ? 'card-high-risk' : ''}`}>
      <div className="rsc-header">
        <span className="rsc-lbl">INVENTORY RISK SCORE</span>
        <span className={`rsc-badge level-${level.toLowerCase()}`}>{level}</span>
      </div>

      <div className="rsc-meter-row">
        <div className="rsc-score-val">
          <span className="score-num">{score}</span>
          <span className="score-denom">/ 100</span>
        </div>

        <div className="rsc-progress-bar">
          <div 
            className={`rsc-progress-fill fill-${level.toLowerCase()}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {factors.length > 0 && (
        <div className="rsc-factors-section">
          <span className="factors-hdr">MATHEMATICAL SCORE BREAKDOWN</span>
          <div className="factors-list">
            {factors.map((f, i) => (
              <div key={i} className="factor-item">
                <span className="factor-pts">+{f.points}</span>
                <span className="factor-name">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
