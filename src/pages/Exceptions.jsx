import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExceptionModal from '../components/ExceptionModal';
import './Exceptions.css';

export default function Exceptions() {
  const navigate = useNavigate();
  const store = useStore();
  const { exceptions, resolveException, createException, setSelectedWarehouseFilter } = store;

  const [filter, setFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const openCount = (exceptions || []).filter(e => e.status === 'OPEN' || e.status === 'INVESTIGATING').length;
  const criticalCount = (exceptions || []).filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length;
  const resolvedCount = (exceptions || []).filter(e => e.status === 'RESOLVED').length;

  const filteredExceptions = (exceptions || []).filter(e => {
    if (filter === 'ALL') return true;
    if (filter === 'OPEN') return e.status === 'OPEN' || e.status === 'INVESTIGATING';
    if (filter === 'RESOLVED') return e.status === 'RESOLVED';
    return true;
  });

  const handleWarehouseClick = (whName) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(whName);
    }
    navigate('/inventory');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="exceptions-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title text-red">OPERATIONAL EXCEPTIONS CENTER</h1>
          <p className="page-subtitle">Track, investigate, and resolve inventory shortages, damage reports, and fulfillment delays.</p>
        </div>

        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> REPORT EXCEPTION
        </button>
      </header>

      {/* 1. EXCEPTION KPIs */}
      <section className="kpi-strip-v2 kpi-strip-exceptions">
        <div className="kpi-card-v2 card-risk-border">
          <span className="kpi-lbl text-red">OPEN EXCEPTIONS</span>
          <div className="kpi-val text-red">{openCount}</div>
          <span className="kpi-change text-red font-bold">Requires resolution</span>
        </div>

        <div className="kpi-card-v2 card-risk-border">
          <span className="kpi-lbl text-red">CRITICAL SEVERITY</span>
          <div className="kpi-val text-red">{criticalCount}</div>
          <span className="kpi-change text-red font-bold">Fast-track investigation</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">RESOLVED TODAY</span>
          <div className="kpi-val text-green">{resolvedCount}</div>
          <span className="kpi-change text-green font-bold">✓ Closed ledger</span>
        </div>
      </section>

      {/* 2. EXCEPTIONS TABLE */}
      <section className="v2-block">
        <div className="table-header-row">
          <div>
            <h2 className="v2-section-title">EXCEPTIONS REGISTER</h2>
            <span className="v2-section-sub">Chronological audit ledger of reported warehouse issues.</span>
          </div>

          <div className="segmented-filter">
            <button className={`segmented-btn ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>ALL</button>
            <button className={`segmented-btn ${filter === 'OPEN' ? 'active' : ''}`} onClick={() => setFilter('OPEN')}>OPEN <span className="filter-count filter-count-red">{openCount}</span></button>
            <button className={`segmented-btn ${filter === 'RESOLVED' ? 'active' : ''}`} onClick={() => setFilter('RESOLVED')}>RESOLVED ({resolvedCount})</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CODE / ID</th>
                <th>TITLE & DESCRIPTION</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>ASSIGNED TO</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th>REPORTED TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredExceptions.map((ex, idx) => (
                <tr key={ex.id || `exc-${idx}`}>
                  <td><strong className="text-red">{ex.exceptionCode || `EXP-50${idx + 1}`}</strong></td>
                  <td>
                    <strong>{ex.title}</strong>
                    <div className="product-sku-text">{ex.description}</div>
                  </td>
                  <td>
                    <button className="v2-inline-link" onClick={() => handleWarehouseClick(ex.warehouseName || "Warehouse A")}>
                      {ex.warehouseName || "Warehouse A"} →
                    </button>
                  </td>
                  <td><strong>{ex.assignedTo || "Inventory Lead"}</strong></td>
                  <td>
                    <span className={`badge ${ex.severity === 'HIGH' || ex.severity === 'CRITICAL' ? 'badge-risk' : 'badge-warning'}`}>
                      {ex.severity || 'MEDIUM'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${ex.status === 'RESOLVED' ? 'badge-green' : 'badge-risk'}`}>
                      {ex.status || 'OPEN'}
                    </span>
                  </td>
                  <td className="sku-cell">{ex.createdAt || "Today 08:30"}</td>
                  <td>
                    {ex.status !== 'RESOLVED' ? (
                      <button className="btn-secondary btn-sm" onClick={() => resolveException && resolveException(ex.id)}>
                        <CheckCircle2 size={12} /> RESOLVE
                      </button>
                    ) : (
                      <span className="completed-tag text-dark">✓ RESOLVED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Exception Creation Modal */}
      {modalOpen && (
        <ExceptionModal onClose={() => setModalOpen(false)} onCreate={createException} />
      )}
    </motion.div>
  );
}
