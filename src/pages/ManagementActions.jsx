import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExplanationPanel from '../components/ExplanationPanel';
import './ManagementActions.css';

export default function ManagementActions() {
  const { managementActions, approveManagementAction, dismissManagementAction } = useStore();
  const [statusFilter, setStatusFilter] = useState('PENDING REVIEW');
  const [search, setSearch] = useState('');

  const filteredActions = (managementActions || []).filter(act => {
    const q = (search || '').toLowerCase();
    const title = (act.title || '').toLowerCase();
    const what = (act.what || '').toLowerCase();
    const whName = (act.warehouseName || '').toLowerCase();
    const sku = (act.sku || '').toLowerCase();

    const matchesSearch = 
      title.includes(q) ||
      what.includes(q) ||
      whName.includes(q) ||
      sku.includes(q);

    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = (managementActions || []).filter(a => a.status === 'PENDING REVIEW').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="actions-page-container"
    >
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">MANAGEMENT DECISION CENTER</h1>
        <p className="page-subtitle">Centralized approval workflow for replenishment orders, inventory rebalancing, and operational risk mitigation.</p>
      </header>

      {/* Toolbar */}
      <div className="actions-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search decision title, SKU, warehouse, or impact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="segmented-filter">
          <button 
            className={`segmented-btn ${statusFilter === 'PENDING REVIEW' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING REVIEW')}
          >
            PENDING REVIEW <span className="filter-count filter-count-red">{pendingCount}</span>
          </button>
          <button 
            className={`segmented-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            APPROVED ({(managementActions || []).filter(a => a.status === 'APPROVED').length})
          </button>
          <button 
            className={`segmented-btn ${statusFilter === 'DISMISSED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('DISMISSED')}
          >
            DISMISSED
          </button>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="actions-cards-list">
        {filteredActions.length > 0 ? (
          filteredActions.map((act) => (
            <div key={act.id} className={`action-card ${act.priority === 'CRITICAL' ? 'card-critical' : ''}`}>
              <div className="action-card-header">
                <div>
                  <span className="act-cat-tag">{act.category} • {act.warehouseName}</span>
                  <h3 className="act-title-text">{act.title}</h3>
                </div>
                <div className="act-header-right">
                  <span className={`priority-tag p-${(act.priority || 'standard').toLowerCase()}`}>{act.priority || 'STANDARD'}</span>
                  <span className={`badge ${act.status === 'APPROVED' ? 'badge-normal' : act.status === 'PENDING REVIEW' ? 'badge-risk' : 'badge-slow'}`}>
                    {act.status}
                  </span>
                </div>
              </div>

              {/* Explainability Block */}
              <ExplanationPanel 
                what={act.what}
                why={act.why}
                impact={act.impact}
                action={act.action}
                isRed={act.priority === 'CRITICAL'}
              />

              {/* Decision Approval Bar */}
              <div className="action-card-controls">
                <span className="act-conf-text">
                  Confidence Signal: <strong>{act.confidence}</strong> ({act.confidenceReason})
                </span>

                <div className="controls-buttons-row">
                  {act.status === 'PENDING REVIEW' && (
                    <>
                      <button className="btn-secondary" onClick={() => dismissManagementAction(act.id)}>
                        <XCircle size={14} /> DISMISS DECISION
                      </button>
                      <button className="btn-primary" onClick={() => approveManagementAction(act.id)}>
                        <CheckCircle2 size={14} /> APPROVE RECOMMENDATION
                      </button>
                    </>
                  )}

                  {act.status === 'APPROVED' && (
                    <span className="completed-tag text-dark">✓ DECISION APPROVED & ACTIONED</span>
                  )}

                  {act.status === 'DISMISSED' && (
                    <span className="completed-tag text-muted">✕ DECISION DISMISSED</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-queue-box">
            <CheckCircle2 size={32} className="text-muted" />
            <span>No management decisions found matching current filter.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
