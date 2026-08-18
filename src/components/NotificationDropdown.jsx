import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ShieldAlert, Package, AlertTriangle, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './NotificationDropdown.css';

const DEFAULT_ALERTS = [
  {
    id: 'alt-101',
    title: 'Low Stock Alert — SKU-P0004',
    message: 'Wireless Optical Mouse stock reached critical threshold (45 units remaining at Warehouse A).',
    severity: 'HIGH',
    status: 'UNREAD',
    timestamp: '10 mins ago',
    source: 'Inventory Control',
    actionPath: '/inventory'
  },
  {
    id: 'alt-102',
    title: 'Operational Exception Flagged',
    message: 'Bin Mismatch reported at Warehouse A during picking task PK-9041.',
    severity: 'CRITICAL',
    status: 'UNREAD',
    timestamp: '25 mins ago',
    source: 'Warehouse Operations',
    actionPath: '/exceptions'
  },
  {
    id: 'alt-103',
    title: 'High Velocity Order Surge',
    message: 'Order fulfillment velocity increased by +18.4% over past 2 hours across all hubs.',
    severity: 'MEDIUM',
    status: 'UNREAD',
    timestamp: '1 hour ago',
    source: 'Demand Analytics',
    actionPath: '/orders'
  },
  {
    id: 'alt-104',
    title: 'Stock Transfer Approved',
    message: 'Transfer TR-804 (50 units Basmati Rice) approved from Chicago to Dallas Hub.',
    severity: 'LOW',
    status: 'READ',
    timestamp: '2 hours ago',
    source: 'Stock Transfers',
    actionPath: '/transfers'
  },
  {
    id: 'alt-105',
    title: 'Dead Stock Exposure Risk',
    message: 'Potential write-off capital identified for 4 inactive SKUs.',
    severity: 'HIGH',
    status: 'READ',
    timestamp: '3 hours ago',
    source: 'Risk Engine',
    actionPath: '/risks'
  }
];

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const store = useStore();
  const { alerts, setAlerts } = store;
  const [isOpen, setIsOpen] = useState(false);

  const activeAlerts = useMemo(() => {
    return (alerts && alerts.length > 0) ? alerts : DEFAULT_ALERTS;
  }, [alerts]);

  const unreadAlerts = useMemo(() => {
    return activeAlerts.filter(a => a.status === 'UNREAD');
  }, [activeAlerts]);

  const handleSelectAlert = (alt) => {
    if (setAlerts) {
      setAlerts(prev => prev.map(a => a.id === alt.id ? { ...a, status: 'READ' } : a));
    }
    navigate(alt.actionPath || '/alerts');
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    if (setAlerts) {
      setAlerts(prev => prev.map(a => ({ ...a, status: 'READ' })));
    }
  };

  return (
    <div className="notif-wrapper" style={{ position: 'relative' }}>
      <button 
        className="notif-bell-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        style={{ position: 'relative' }}
      >
        <Bell size={18} />
        {unreadAlerts.length > 0 && (
          <span className="notif-badge">{unreadAlerts.length}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="notif-dropdown-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="notif-dropdown-card"
            aria-live="polite"
          >
            <div className="notif-card-header">
              <span className="notif-title">NOTIFICATIONS & ALERTS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="notif-count">{unreadAlerts.length} unread</span>
                {unreadAlerts.length > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    style={{ background: 'none', border: 'none', color: '#10B981', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>

            <div className="notif-items-list">
              {activeAlerts.slice(0, 5).map((alt) => {
                const isCritical = alt.severity === 'CRITICAL' || alt.severity === 'HIGH';
                return (
                  <div 
                    key={alt.id} 
                    className={`notif-item ${alt.status === 'UNREAD' ? 'item-unread' : ''}`}
                    onClick={() => handleSelectAlert(alt)}
                  >
                    <div className="notif-item-left">
                      <span className={`priority-dot ${isCritical ? 'dot-high' : 'dot-medium'}`}></span>
                      <div className="notif-item-text">
                        <strong>{alt.title}</strong>
                        <p>{alt.message}</p>
                        <span className="notif-time">{alt.timestamp} • {alt.source}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="notif-card-footer">
              <button className="btn-v2-link" onClick={() => { navigate('/alerts'); setIsOpen(false); }}>
                VIEW ALL ALERTS CENTER →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
