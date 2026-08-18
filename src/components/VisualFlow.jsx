import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Warehouse, Database, Cpu, ArrowDown, ArrowRight } from 'lucide-react';
import './VisualFlow.css';

export default function VisualFlow({ onSelectNode }) {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <div className="visual-flow-wrapper">
      <div className="flow-container">
        
        {/* Step 1: Enterprise */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`flow-node enterprise-node ${activeStep === 'enterprise' ? 'active' : ''}`}
          onClick={() => setActiveStep('enterprise')}
        >
          <Building2 size={18} className="node-icon" />
          <span className="node-title">ENTERPRISE</span>
        </motion.div>

        {/* Down Connector */}
        <div className="connector-vertical">
          <div className="line"></div>
          <ArrowDown size={14} className="arrow-head" />
        </div>

        {/* Step 2: Warehouses */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="warehouses-row"
        >
          <div 
            className={`flow-node warehouse-node ${activeStep === 'wh-a' ? 'active' : ''}`}
            onClick={() => setActiveStep('wh-a')}
          >
            <Warehouse size={16} className="node-icon" />
            <span>Warehouse A</span>
            <small className="node-sub">Chicago Hub</small>
          </div>

          <div 
            className={`flow-node warehouse-node ${activeStep === 'wh-b' ? 'active' : ''}`}
            onClick={() => setActiveStep('wh-b')}
          >
            <Warehouse size={16} className="node-icon" />
            <span>Warehouse B</span>
            <small className="node-sub">Dallas Hub</small>
          </div>
        </motion.div>

        {/* Down Connector to Data */}
        <div className="connector-vertical">
          <div className="line"></div>
          <ArrowDown size={14} className="arrow-head" />
        </div>

        {/* Step 3: Inventory Data Stream */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="data-stream-node"
        >
          <Database size={15} />
          <span>Unified Inventory Data</span>
        </motion.div>

        {/* Down Connector */}
        <div className="connector-vertical">
          <div className="line"></div>
          <ArrowDown size={14} className="arrow-head" />
        </div>

        {/* Step 4: Core Engine */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="platform-engine-box"
        >
          <Cpu size={20} className="engine-icon" />
          <div className="engine-text">
            <span className="engine-title">INVENTORY INTELLIGENCE</span>
            <span className="engine-subtitle">Automated Analysis & Decision Engine</span>
          </div>
        </motion.div>

        {/* Split Connectors to Outputs */}
        <div className="connector-split">
          <div className="line-center"></div>
          <div className="line-horizontal"></div>
        </div>

        {/* Step 5: Three Simple Answers */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="outputs-row"
        >
          <div className="output-card today-card">
            <div className="output-tag">1. TODAY</div>
            <div className="output-question">What happened today?</div>
            <div className="output-stat">2,847 units sold</div>
          </div>

          <div className="output-card future-card">
            <div className="output-tag">2. FUTURE</div>
            <div className="output-question">What might happen next?</div>
            <div className="output-stat">7 items need attention</div>
          </div>

          <div className="output-card risk-card">
            <div className="output-tag risk-tag">3. RISKS</div>
            <div className="output-question">What could go wrong?</div>
            <div className="output-stat risk-stat">8 stockout risks</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
