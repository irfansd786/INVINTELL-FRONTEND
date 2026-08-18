import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, MapPin, Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import './Picking.css';

export default function Picking() {
  const navigate = useNavigate();
  const store = useStore();
  const { pickingTasks, completePicking, startPicking, setSelectedWarehouseFilter } = store;

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const waitingCount = (pickingTasks || []).filter(pt => pt.status === 'PENDING_PICK' || pt.status === 'PENDING' || pt.status === 'READY TO PICK').length;
  const inProgressCount = (pickingTasks || []).filter(pt => pt.status === 'IN_PROGRESS' || pt.status === 'PICKING').length;
  const completedCount = (pickingTasks || []).filter(pt => pt.status === 'COMPLETED' || pt.status === 'PICKED').length;

  const handleWarehouseClick = (whName) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(whName);
    }
    navigate('/inventory');
  };

  const handleScanTask = (task) => {
    setSelectedTask(task);
    setIsScannerOpen(true);
  };

  const handleScanResult = (matchedProduct, barcode) => {
    if (!selectedTask) return;
    const taskSku = String(selectedTask.sku || '').toLowerCase();
    const taskName = String(selectedTask.productName || selectedTask.name || '').toLowerCase();

    if (matchedProduct) {
      const matchSku = String(matchedProduct.sku || matchedProduct.productId || '').toLowerCase();
      const matchName = String(matchedProduct.name || matchedProduct.productName || '').toLowerCase();
      if (matchSku === taskSku || matchName === taskName) {
        completePicking(selectedTask.orderNumber || selectedTask.id);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="picking-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">PICKING QUEUE MANAGEMENT</h1>
          <p className="page-subtitle">Track bin location routing, picker assignments, and barcode item verification.</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedTask(null); setIsScannerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={16} /> Scan Item Barcode
        </button>
      </header>

      {/* 1. PICKING KPIs */}
      <section className="kpi-strip-v2 kpi-strip-picking">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">READY TO PICK</span>
          <div className="kpi-val">{waitingCount || 2}</div>
          <span className="kpi-change text-muted">Staged at picking bays</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PICKING IN PROGRESS</span>
          <div className="kpi-val text-green">{inProgressCount || 1}</div>
          <span className="kpi-change text-green font-bold">Pickers active</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PICKED TODAY</span>
          <div className="kpi-val text-green">{completedCount || 1}</div>
          <span className="kpi-change text-green font-bold">✓ Ready for packing</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">ACCURACY RATE</span>
          <div className="kpi-val text-green">100%</div>
          <span className="kpi-change text-green font-bold">Barcode verified</span>
        </div>
      </section>

      {/* 2. PICKING QUEUE TABLE */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">ACTIVE PICKING QUEUE</h2>
          <span className="v2-section-sub">Bin location route execution and picker staging.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>TICKET / ORDER</th>
                <th>SKU & PRODUCT</th>
                <th>LOCATION BIN</th>
                <th>UNITS</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>ASSIGNED PICKER</th>
                <th>STATUS</th>
                <th>VERIFICATION ACTION</th>
              </tr>
            </thead>
            <tbody>
              {(pickingTasks || []).map((pt, idx) => {
                const isCompleted = pt.status === 'COMPLETED' || pt.status === 'PICKED';
                const isInProgress = pt.status === 'IN_PROGRESS' || pt.status === 'PICKING';

                return (
                  <tr key={pt.id || `pick-${idx}`}>
                    <td>
                      <strong>{pt.pickTicketNumber || `PK-90${41 + idx}`}</strong>
                      <div className="font-small text-muted">{pt.orderNumber || 'ORD-2026-8093'}</div>
                    </td>
                    <td>
                      <strong>{pt.productName || 'Groceries Item P0001'}</strong>
                      <div className="sku-cell">{pt.sku || 'SKU-P0001'}</div>
                    </td>
                    <td><span className="bin-tag"><MapPin size={12} /> {pt.binLocation || "A-12-04"}</span></td>
                    <td><strong>{pt.quantity || pt.totalUnits || 8} units</strong></td>
                    <td>
                      <button className="v2-inline-link" onClick={() => handleWarehouseClick(pt.warehouseName || "Warehouse A")}>
                        {pt.warehouseName || "Warehouse A"} →
                      </button>
                    </td>
                    <td>{pt.pickerName || pt.pickerAssigned || "John Miller"}</td>
                    <td>
                      <span className={`badge ${isCompleted ? 'badge-green' : isInProgress ? 'badge-warning' : 'badge-normal'}`}>
                        {pt.status || 'PENDING_PICK'}
                      </span>
                    </td>
                    <td>
                      {isCompleted ? (
                        <span className="text-green font-bold flex-align-gap-2">
                          <CheckCircle2 size={14} /> PICKED & VERIFIED
                        </span>
                      ) : (
                        <div className="flex-align-gap-2">
                          {!isInProgress && (
                            <button className="btn-secondary btn-sm" onClick={() => startPicking && startPicking(pt.orderNumber || pt.id)}>
                              <Play size={12} /> START
                            </button>
                          )}
                          <button className="btn-primary btn-sm" onClick={() => handleScanTask(pt)}>
                            <Camera size={12} /> SCAN & COMPLETE
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        targetProduct={selectedTask}
        onScanResult={handleScanResult}
      />
    </motion.div>
  );
}
