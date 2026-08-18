import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  GitCommit, 
  AlertTriangle, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';

export default function PlatformSection() {
  return (
    <section className="inv-platform-section-pic2">
      <div className="inv-section-container">
        <div className="inv-section-header-center">
          <div className="inv-section-label">OUR PLATFORM</div>
          <h2 className="inv-section-heading">From warehouse data to operational decisions.</h2>
        </div>

        {/* Pic 2 Horizontal Platform Architecture Flow */}
        <div className="inv-pic2-flow-container">
          
          {/* Stage 1: Warehouse Source Nodes */}
          <div className="inv-pic2-stage stage-warehouses">
            <div className="inv-wh-card">
              <Building2 className="inv-green-icon" size={18} />
              <span>Warehouse A</span>
            </div>
            <div className="inv-wh-card">
              <Building2 className="inv-green-icon" size={18} />
              <span>Warehouse B</span>
            </div>
            <div className="inv-wh-card">
              <Building2 className="inv-green-icon" size={18} />
              <span>Warehouse C</span>
            </div>
          </div>

          {/* Connector Arrow 1 */}
          <div className="inv-pic2-connector">
            <svg width="48" height="120" viewBox="0 0 48 120" fill="none">
              <path d="M 0 20 C 30 20, 30 60, 42 60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 60 L 42 60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 100 C 30 100, 30 60, 42 60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="42,56 48,60 42,64" fill="#10B981" />
            </svg>
          </div>

          {/* Stage 2: INVINTELL Core Platform Card */}
          <div className="inv-pic2-stage stage-invintell">
            <div className="inv-core-card-pic2">
              <div className="inv-core-brand-title">
                <span>INVI</span><span className="inv-green-text">NTELL</span>
              </div>
              <div className="inv-core-sub-title">Intelligence Platform</div>

              <div className="inv-core-checklist">
                <div className="inv-check-item">
                  <CheckCircle2 className="inv-green-icon" size={16} />
                  <span>Collect Data</span>
                </div>
                <div className="inv-check-item">
                  <CheckCircle2 className="inv-green-icon" size={16} />
                  <span>Analyze</span>
                </div>
                <div className="inv-check-item">
                  <CheckCircle2 className="inv-green-icon" size={16} />
                  <span>Predict</span>
                </div>
                <div className="inv-check-item">
                  <CheckCircle2 className="inv-green-icon" size={16} />
                  <span>Recommend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Arrow 2 */}
          <div className="inv-pic2-connector">
            <svg width="48" height="120" viewBox="0 0 48 120" fill="none">
              <path d="M 0 60 C 15 60, 15 20, 42 20" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 60 L 42 60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 60 C 15 60, 15 100, 42 100" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="42,56 48,60 42,64" fill="#10B981" />
            </svg>
          </div>

          {/* Stage 3: Operational Outputs Card */}
          <div className="inv-pic2-stage stage-outputs">
            <div className="inv-outputs-card-pic2">
              <div className="inv-output-item">
                <Clock className="inv-green-icon" size={20} />
                <div>
                  <div className="inv-item-title">Today</div>
                  <div className="inv-item-desc">Real-time performance</div>
                </div>
              </div>

              <div className="inv-output-item">
                <GitCommit className="inv-green-icon" size={20} />
                <div>
                  <div className="inv-item-title">Future</div>
                  <div className="inv-item-desc">Demand forecasting</div>
                </div>
              </div>

              <div className="inv-output-item">
                <AlertTriangle className="inv-green-icon" size={20} />
                <div>
                  <div className="inv-item-title">Risks</div>
                  <div className="inv-item-desc">Risk detection & alerts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Arrow 3 */}
          <div className="inv-pic2-connector">
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
              <line x1="0" y1="12" x2="34" y2="12" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="34,8 40,12 34,16" fill="#10B981" />
            </svg>
          </div>

          {/* Stage 4: Management Report Card */}
          <div className="inv-pic2-stage stage-report">
            <div className="inv-report-card-pic2">
              <div className="inv-report-icon-wrapper">
                <BarChart3 className="inv-green-icon" size={28} />
              </div>
              <div className="inv-report-title">Management Report</div>
              <div className="inv-report-desc">Actionable insights for better decisions</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
