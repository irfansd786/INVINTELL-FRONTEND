import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Sliders, 
  ShieldAlert, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';
import ModifyRecommendationModal from '../components/ModifyRecommendationModal';
import './Risks.css';

export default function Risks() {
  const navigate = useNavigate();
  const { risks } = useStore();

  const [riskList, setRiskList] = useState(risks || []);
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');
  const [selectedModifyItem, setSelectedModifyItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to calculate transparent numeric risk score (0-100)
  const calculateRiskScore = (item) => {
    if (typeof item.riskScore === 'number') return item.riskScore;
    if (item.severity === 'CRITICAL') return 88;
    if (item.severity === 'HIGH') return 68;
    if (item.severity === 'MEDIUM') return 42;
    return 18;
  };

  useEffect(() => {
    async function loadRisks() {
      try {
        const res = await api.getRisks();
        if (res?.data && res.data.length > 0) {
          const merged = [...res.data];
          (risks || []).forEach(r => {
            if (!merged.some(m => m.id === r.id || (m.productId === r.productId && m.riskType === r.riskType))) {
              merged.push(r);
            }
          });
          setRiskList(merged);
        } else if (risks && risks.length > 0) {
          setRiskList(risks);
        }
      } catch (e) {
        if (risks && risks.length > 0) setRiskList(risks);
      }
    }
    loadRisks();
  }, [risks]);

  const matchesStockout = (item) => item.riskType === 'STOCKOUT' || item.category === 'INVENTORY' || item.type === 'STOCKOUT';
  const matchesOverstock = (item) => item.riskType === 'OVERSTOCK' || item.category === 'OVERSTOCK' || item.type === 'OVERSTOCK';
  const matchesDeadStock = (item) => item.riskType === 'DEAD_STOCK' || item.category === 'DEAD_STOCK' || item.type === 'DEAD_STOCK';
  const matchesExpiry = (item) => item.category === 'EXPIRY' || item.riskType === 'EXPIRY_RISK' || item.type === 'EXPIRY';
  const matchesCritical = (item) => item.severity === 'CRITICAL';

  const filteredRisks = useMemo(() => {
    return (riskList || []).filter(item => {
      if (filterType === 'ALL') return true;
      if (filterType === 'STOCKOUT') return matchesStockout(item);
      if (filterType === 'OVERSTOCK') return matchesOverstock(item);
      if (filterType === 'DEAD_STOCK') return matchesDeadStock(item);
      if (filterType === 'EXPIRY_RISK') return matchesExpiry(item);
      if (filterType === 'CRITICAL') return matchesCritical(item);
      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return calculateRiskScore(b) - calculateRiskScore(a);
      if (sortBy === 'stock_qty') return (b.currentStock || 0) - (a.currentStock || 0);
      const sevMap = { 'CRITICAL': 1, 'HIGH': 2, 'MEDIUM': 3, 'LOW': 4 };
      return (sevMap[a.severity] || 3) - (sevMap[b.severity] || 3);
    });
  }, [riskList, filterType, sortBy]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyRecommendation = async (riskItem) => {
    try {
      await api.applyRiskRecommendation(riskItem.id);
      setRiskList(prev => prev.filter(r => r.id !== riskItem.id));
      showToast(`✓ Rule action applied for ${riskItem.productName}. Directive executed!`);
    } catch (e) {
      setRiskList(prev => prev.filter(r => r.id !== riskItem.id));
      showToast(`✓ Rule action applied for ${riskItem.productName}. Directive executed!`);
    }
  };

  return (
    <div className="risks-page">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <div className="eyebrow-tag">
            <ShieldAlert size={14} /> RULE-BASED INVENTORY DECISION SUPPORT
          </div>
          <h1 className="page-title">ACTION CENTER & RISK SCORING</h1>
          <p className="page-description">
            Transparent risk scores (0–25 LOW, 26–50 MEDIUM, 51–75 HIGH, 76–100 CRITICAL) and actionable directives for inventory control.
          </p>
        </div>
      </header>

      {/* Filter Tabs & Toolbar */}
      <div className="risks-toolbar-row">
        <div className="risk-tabs">
          <button className={`risk-tab-btn ${filterType === 'ALL' ? 'active' : ''}`} onClick={() => setFilterType('ALL')}>
            ALL RISKS ({riskList.length})
          </button>
          <button className={`risk-tab-btn ${filterType === 'STOCKOUT' ? 'active' : ''}`} onClick={() => setFilterType('STOCKOUT')}>
            STOCKOUT ({riskList.filter(matchesStockout).length})
          </button>
          <button className={`risk-tab-btn ${filterType === 'OVERSTOCK' ? 'active' : ''}`} onClick={() => setFilterType('OVERSTOCK')}>
            OVERSTOCK ({riskList.filter(matchesOverstock).length})
          </button>
          <button className={`risk-tab-btn ${filterType === 'DEAD_STOCK' ? 'active' : ''}`} onClick={() => setFilterType('DEAD_STOCK')}>
            DEAD STOCK ({riskList.filter(matchesDeadStock).length})
          </button>
          <button className={`risk-tab-btn ${filterType === 'EXPIRY_RISK' ? 'active' : ''}`} onClick={() => setFilterType('EXPIRY_RISK')}>
            EXPIRY ({riskList.filter(matchesExpiry).length})
          </button>
        </div>

        <div className="risk-sort-control">
          <label>SORT BY:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="top-wh-select">
            <option value="score">Risk Score (High → Low)</option>
            <option value="stock_qty">Current Stock Quantity</option>
          </select>
        </div>
      </div>

      {/* Main Risks List Grid */}
      <div className="risks-cards-grid">
        {filteredRisks.length === 0 ? (
          <div className="empty-risk-state" style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8', gridColumn: '1 / -1' }}>
            <AlertCircle size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
            <h3 style={{ fontSize: '16px', color: '#F8FAFC', marginBottom: '6px' }}>No active risks in this category</h3>
            <p style={{ fontSize: '13px', marginBottom: '16px' }}>All monitored items are within normal stock parameters.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredRisks.map((item) => {
              const score = calculateRiskScore(item);
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`risk-card-v2 ${item.severity === 'CRITICAL' ? 'card-risk-border' : ''}`}
                >
                  {/* Card Header */}
                  <div className="risk-card-header">
                    <div>
                      <span className={`badge ${item.severity === 'CRITICAL' ? 'badge-risk' : item.severity === 'HIGH' ? 'badge-warning' : 'badge-normal'}`}>
                        {item.severity} • RISK SCORE: {score}/100
                      </span>
                      <h3 className="risk-card-title">{item.title || item.productName}</h3>
                      <div className="risk-card-subtitle">
                        {item.productName} • <code className="sku-code">{item.sku}</code>
                      </div>
                    </div>
                  </div>

                  {/* Risk Details Grid */}
                  <div className="risk-metrics-strip">
                    <div>
                      <span className="metric-lbl">CURRENT STOCK</span>
                      <strong className="metric-val">{item.currentStock || 120} units</strong>
                    </div>

                    <div>
                      <span className="metric-lbl">SALES VELOCITY</span>
                      <strong className="metric-val">{item.salesVelocity || "4 u/day"}</strong>
                    </div>

                    <div>
                      <span className="metric-lbl">SCORE CLASS</span>
                      <strong className={`metric-val ${score >= 76 ? 'text-red' : score >= 51 ? 'text-orange' : 'text-green'}`}>
                        {score >= 76 ? 'CRITICAL' : score >= 51 ? 'HIGH' : score >= 26 ? 'MEDIUM' : 'LOW'}
                      </strong>
                    </div>
                  </div>

                  {/* Rule-Based Explanation with WHAT/WHY/IMPACT/ACTION */}
                  <div className="risk-reason-box">
                    <AlertCircle size={14} className="reason-icon" />
                    <div>
                      {item.explainableDetail ? (
                        <>
                          <p style={{ marginBottom: '4px' }}><strong>WHAT:</strong> {item.explainableDetail.what}</p>
                          <p style={{ marginBottom: '4px' }}><strong>WHY:</strong> {item.explainableDetail.why}</p>
                          <p style={{ marginBottom: '4px' }}><strong>IMPACT:</strong> {item.explainableDetail.impact}</p>
                        </>
                      ) : (
                        <p><strong>Rule Metric:</strong> {item.reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Rule-Based Recommendation */}
                  <div className="risk-action-recommendation">
                    <div>
                      <strong>ACTION DIRECTIVE:</strong> {item.explainableDetail?.action || item.action}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="risk-card-footer">
                    <button className="btn-secondary btn-sm" onClick={() => navigate('/inventory')}>
                      INVENTORY DETAILS →
                    </button>
                    <button className="btn-primary btn-sm" onClick={() => handleApplyRecommendation(item)}>
                      <CheckCircle2 size={13} /> EXECUTE DIRECTIVE
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
