import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExplanationPanel from '../components/ExplanationPanel';
import './Transfers.css';

export default function Transfers() {
  const { transfers, approveTransfer, dismissTransfer } = useStore();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredTransfers = (transfers || []).filter(t => {
    const q = (search || '').toLowerCase();
    const dId = (t.displayId || t.id || '').toLowerCase();
    const pName = (t.productName || '').toLowerCase();
    const sku = (t.sku || '').toLowerCase();
    const srcWh = (t.sourceWarehouseName || '').toLowerCase();
    const dstWh = (t.destWarehouseName || '').toLowerCase();

    const matchesSearch = 
      dId.includes(q) ||
      pName.includes(q) ||
      sku.includes(q) ||
      srcWh.includes(q) ||
      dstWh.includes(q);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="transfers-page-container"
    >
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">INVENTORY REBALANCING & STOCK TRANSFERS</h1>
        <p className="page-subtitle">Cross-warehouse inventory rebalancing decision support to relieve localized stock shortages.</p>
      </header>

      {/* Toolbar */}
      <div className="transfers-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search transfer ID, product, SKU, or warehouse hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="segmented-filter">
          <button 
            className={`segmented-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            ALL TRANSFERS ({(transfers || []).length})
          </button>
          <button 
            className={`segmented-btn ${statusFilter === 'PENDING REVIEW' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING REVIEW')}
          >
            PENDING REVIEW ({(transfers || []).filter(t => t.status === 'PENDING REVIEW').length})
          </button>
          <button 
            className={`segmented-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            APPROVED ({(transfers || []).filter(t => t.status === 'APPROVED').length})
          </button>
        </div>
      </div>

      {/* Transfer Cards List */}
      <div className="transfers-cards-list">
        {filteredTransfers.length > 0 ? (
          filteredTransfers.map((trf) => (
            <div key={trf.id} className="trf-card">
              {/* Card Header */}
              <div className="trf-card-header">
                <div>
                  <span className="trf-id-tag">RECOMMENDED STOCK TRANSFER {trf.displayId}</span>
                  <h3 className="trf-product-title">{trf.productName} ({trf.sku})</h3>
                </div>
                <div className="trf-header-right">
                  <span className={`priority-tag p-${(trf.priority || 'standard').toLowerCase()}`}>{trf.priority || 'STANDARD'}</span>
                  <span className={`badge ${trf.status === 'APPROVED' ? 'badge-normal' : trf.status === 'PENDING REVIEW' ? 'badge-risk' : 'badge-slow'}`}>
                    {trf.status}
                  </span>
                </div>
              </div>

              {/* Source vs Destination Rebalancing Flow Box */}
              <div className="trf-flow-box">
                <div className="tf-hub-col">
                  <span className="tf-hub-lbl">SOURCE FACILITY</span>
                  <strong className="tf-hub-name">{trf.sourceWarehouseName}</strong>
                  <span className="tf-cov-lbl">Coverage Before: <strong>{trf.sourceCoverageDaysBefore} days</strong></span>
                  <span className="tf-cov-lbl">Coverage After: <strong>{trf.sourceCoverageDaysAfter} days</strong></span>
                </div>

                <div className="tf-arrow-col">
                  <span className="tf-qty-badge">MOVE {trf.suggestedQty} UNITS</span>
                  <ArrowRight size={24} className="tf-arrow-icon" />
                </div>

                <div className="tf-hub-col">
                  <span className="tf-hub-lbl">DESTINATION FACILITY</span>
                  <strong className="tf-hub-name">{trf.destWarehouseName}</strong>
                  <span className="tf-cov-lbl">Coverage Before: <strong className="text-red">{trf.destCoverageDaysBefore} days</strong></span>
                  <span className="tf-cov-lbl">Coverage After: <strong className="text-dark">{trf.destCoverageDaysAfter} days</strong></span>
                </div>
              </div>

              {/* Explanation Block */}
              <ExplanationPanel 
                what={`Transfer ${trf.suggestedQty} units of ${trf.productName} from ${trf.sourceWarehouseName} to ${trf.destWarehouseName}.`}
                why={trf.reason}
                impact={trf.expectedImpact}
                action="Approve stock transfer manifest for regional transport."
              />

              {/* Action Controls */}
              <div className="trf-card-controls">
                <span className="trf-meta-text">Requested at {trf.requestedAt} by {trf.requestedBy}</span>

                <div className="controls-buttons-row">
                  {trf.status === 'PENDING REVIEW' && (
                    <>
                      <button className="btn-secondary" onClick={() => dismissTransfer(trf.id)}>
                        <XCircle size={14} /> DISMISS TRANSFER
                      </button>
                      <button className="btn-primary" onClick={() => approveTransfer(trf.id)}>
                        <CheckCircle2 size={14} /> APPROVE TRANSFER & SHIFT INVENTORY
                      </button>
                    </>
                  )}

                  {trf.status === 'APPROVED' && (
                    <span className="completed-tag text-dark">✓ TRANSFER APPROVED & INVENTORY REBALANCED</span>
                  )}

                  {trf.status === 'DISMISSED' && (
                    <span className="completed-tag text-muted">✕ TRANSFER DISMISSED</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-queue-box">
            <CheckCircle2 size={32} className="text-muted" />
            <span>No stock transfer recommendations found matching filter.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
