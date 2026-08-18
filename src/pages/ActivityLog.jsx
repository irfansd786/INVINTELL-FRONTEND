import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, ShieldAlert, CheckCircle2, FileText, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import './ActivityLog.css';

export default function ActivityLog() {
  const store = useStore();
  const { activities } = store;

  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    async function loadAuditTrail() {
      try {
        const res = await api.getAuditLogs();
        if (res && res.success && res.data) {
          setAuditLogs(res.data);
        } else if (activities && activities.length > 0) {
          setAuditLogs(activities);
        }
      } catch (e) {
        if (activities && activities.length > 0) setAuditLogs(activities);
      }
    }
    loadAuditTrail();
  }, [activities]);

  const filteredLogs = (auditLogs || []).filter(act => {
    const q = (search || '').toLowerCase();
    const action = (act.action || act.eventType || '').toLowerCase();
    const entity = (act.entityType || act.entity || '').toLowerCase();
    const user = (act.userName || act.actor || '').toLowerCase();
    const details = (act.description || act.details || '').toLowerCase();

    const matchesSearch = !q || action.includes(q) || entity.includes(q) || user.includes(q) || details.includes(q);
    const matchesType = typeFilter === 'ALL' || (act.action || act.eventType) === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="activity-page-container"
    >
      {/* Header */}
      <header className="page-header">
        <div>
          <div className="eyebrow-tag">
            <Clock size={14} /> IMMUTABLE SYSTEM AUDIT LEDGER
          </div>
          <h1 className="page-title">SYSTEM AUDIT LOGS & ACTIVITY LEDGER</h1>
          <p className="page-subtitle">Append-only audit trail recording user operations, inventory adjustments, and status changes.</p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="activity-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search action, user, entity type, warehouse, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="segmented-filter">
          <button 
            className={`segmented-btn ${typeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setTypeFilter('ALL')}
          >
            ALL AUDIT LOGS ({auditLogs.length})
          </button>
          <button 
            className={`segmented-btn ${typeFilter === 'INVENTORY_ADJUSTMENT' ? 'active' : ''}`}
            onClick={() => setTypeFilter('INVENTORY_ADJUSTMENT')}
          >
            ADJUSTMENTS
          </button>
          <button 
            className={`segmented-btn ${typeFilter === 'PICKING_COMPLETED' ? 'active' : ''}`}
            onClick={() => setTypeFilter('PICKING_COMPLETED')}
          >
            FULFILLMENT
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>USER / ACTOR</th>
              <th>ROLE</th>
              <th>ACTION</th>
              <th>ENTITY TYPE</th>
              <th>FACILITY HUB</th>
              <th>DESCRIPTION</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((act, idx) => {
              const timeStr = act.createdAt ? new Date(act.createdAt).toLocaleString('en-GB') : (act.timestamp || 'Today');
              const isCritical = (act.action || '').includes('DELETE') || (act.action || '').includes('STATUS');

              return (
                <tr key={act.id || `audit-${idx}`} onClick={() => setSelectedLog(act)} style={{ cursor: 'pointer' }}>
                  <td className="date-cell">
                    <strong>{timeStr}</strong>
                  </td>
                  <td>
                    <div className="flex-align-gap-2">
                      <User size={13} className="text-muted" />
                      <strong>{act.userName || act.actor || 'System User'}</strong>
                    </div>
                  </td>
                  <td><span className="badge badge-normal">{act.userRole || 'STAFF'}</span></td>
                  <td>
                    <span className={`badge ${isCritical ? 'badge-risk' : 'badge-green'}`}>
                      {act.action || act.eventType}
                    </span>
                  </td>
                  <td><strong>{act.entityType || act.entity}</strong></td>
                  <td>{act.warehouseName || act.facility || 'Warehouse A'}</td>
                  <td>{act.description || act.details}</td>
                  <td>
                    <span className="completed-tag text-green font-bold">✓ IMMUTABLE LOGGED</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="modal-backdrop" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">AUDIT LOG ENTRY DETAILS</h2>
              <button className="modal-close-btn" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div><strong>Log ID:</strong> {selectedLog.id}</div>
              <div><strong>Timestamp:</strong> {selectedLog.createdAt || selectedLog.timestamp}</div>
              <div><strong>User:</strong> {selectedLog.userName} ({selectedLog.userRole})</div>
              <div><strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Entity:</strong> {selectedLog.entityType} ({selectedLog.entityId || 'N/A'})</div>
              <div><strong>Warehouse:</strong> {selectedLog.warehouseName}</div>
              <div><strong>Description:</strong> {selectedLog.description}</div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedLog(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
