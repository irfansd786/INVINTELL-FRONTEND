import React, { useState } from 'react';
import { Plus, RefreshCw, RotateCcw, AlertTriangle, ShieldAlert, Truck, Box } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './DemoControlBar.css';

export default function DemoControlBar() {
  const { 
    simulateNewOrder, 
    simulateStockArrival, 
    simulateException, 
    refreshData, 
    resetDemoData, 
    isRefreshing 
  } = useStore();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  return (
    <>
      <div className="demo-control-bar">
        <div className="demo-bar-container">
          <div className="demo-badge-group">
            <span className="pulse-dot"></span>
            <span className="demo-badge-lbl">DEMO MODE ACTIVE</span>
            <span className="demo-badge-sub">Simulated Enterprise Dataset</span>
          </div>

          <div className="demo-actions-group">
            <button className="demo-btn" onClick={simulateNewOrder}>
              <Plus size={13} /> SIMULATE NEW ORDER
            </button>

            <button className="demo-btn" onClick={simulateStockArrival}>
              <Box size={13} /> SIMULATE INBOUND STOCK
            </button>

            <button className="demo-btn demo-btn-red" onClick={simulateException}>
              <ShieldAlert size={13} /> SIMULATE EXCEPTION
            </button>

            <button className="demo-btn" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw size={13} className={isRefreshing ? "spin-icon" : ""} /> {isRefreshing ? "RECALCULATING..." : "REFRESH DATA"}
            </button>

            <button className="demo-btn demo-btn-danger" onClick={() => setConfirmResetOpen(true)}>
              <RotateCcw size={13} /> RESET DEMO DATA
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmResetOpen(false)}>
          <div className="reset-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="text-red">RESET DEMO DATA CONFIRMATION</h3>
            </div>
            <p className="modal-desc">
              Are you sure you want to reset all platform inventory, orders, allocations, and activity logs back to the initial demonstration state?
            </p>
            <div className="modal-footer-actions">
              <button className="btn-secondary" onClick={() => setConfirmResetOpen(false)}>CANCEL</button>
              <button className="btn-primary" onClick={() => { resetDemoData(); setConfirmResetOpen(false); }}>CONFIRM RESET DEMO DATA</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
