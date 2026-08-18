import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './AlertCenter.css';

export default function AlertCenter() {
  const navigate = useNavigate();
  const { alerts, markAlertReviewed } = useStore();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredAlerts = (alerts || []).filter(alt => {
    const q = (search || '').toLowerCase();
    const dId = (alt.displayId || alt.id || '').toLowerCase();
    const title = (alt.title || '').toLowerCase();
    const msg = (alt.message || '').toLowerCase();
    const cat = (alt.category || '').toLowerCase();

    const matchesSearch = 
      dId.includes(q) ||
      title.includes(q) ||
      msg.includes(q) ||
      cat.includes(q);

    const matchesSeverity = severityFilter === 'ALL' || alt.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || alt.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const unreadCount = (alerts || []).filter(a => a.status === 'UNREAD').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="alerts-page-container"
    >
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">CENTRALIZED ALERTS CENTER</h1>
        <p className="page-subtitle">Single source of truth for critical inventory stockout alerts, operational bottlenecks, and system exceptions.</p>
      </header>

      {/* Toolbar */}
      <div className="alerts-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search alert title, category, ID, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-selects-group">
          {/* Status Segmented Filter */}
          <div className="segmented-filter">
            <button 
              className={`segmented-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              ALL ALERTS ({(alerts || []).length})
            </button>
            <button 
              className={`segmented-btn ${statusFilter === 'UNREAD' ? 'active' : ''}`}
              onClick={() => setStatusFilter('UNREAD')}
            >
              UNREAD <span className="filter-count filter-count-red">{unreadCount}</span>
            </button>
            <button 
              className={`segmented-btn ${statusFilter === 'REVIEWED' ? 'active' : ''}`}
              onClick={() => setStatusFilter('REVIEWED')}
            >
              REVIEWED
            </button>
          </div>

          {/* Severity Dropdown */}
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="select-filter"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
      </div>

      {/* Alerts Cards List */}
      <div className="alerts-cards-list">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => (
            <div 
              key={alt.id} 
              className={`alert-card ${alt.status === 'UNREAD' ? 'alert-unread' : ''} ${alt.severity === 'CRITICAL' || alt.severity === 'HIGH' ? 'card-sev-high' : ''}`}
            >
              <div className="alt-card-header">
                <div>
                  <span className="alt-meta-tag">{alt.displayId} • {alt.category} • Source: {alt.source}</span>
                  <h3 className="alt-title">{alt.title}</h3>
                </div>
                <div className="alt-header-right">
                  <span className={`priority-tag p-${(alt.severity || 'info').toLowerCase()}`}>{alt.severity || 'INFO'}</span>
                  <span className={`badge ${alt.status === 'UNREAD' ? 'badge-risk' : 'badge-normal'}`}>
                    {alt.status}
                  </span>
                </div>
              </div>

              <p className="alt-message-text">{alt.message}</p>

              <div className="alt-card-footer">
                <span className="alt-time">{alt.timestamp}</span>

                <div className="controls-buttons-row">
                  {alt.status === 'UNREAD' && (
                    <button className="btn-secondary" onClick={() => markAlertReviewed(alt.id)}>
                      <CheckCircle2 size={14} /> MARK REVIEWED
                    </button>
                  )}

                  <button className="btn-primary" onClick={() => { markAlertReviewed(alt.id); navigate(alt.actionPath || '/overview'); }}>
                    OPEN RELATED PAGE <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-queue-box">
            <CheckCircle2 size={32} className="text-muted" />
            <span>No alerts found matching current filter.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
