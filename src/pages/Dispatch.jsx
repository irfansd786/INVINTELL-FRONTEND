import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import './Dispatch.css';

export default function Dispatch() {
  const navigate = useNavigate();
  const store = useStore();
  const { dispatchQueue, dispatchOrder, setSelectedWarehouseFilter } = store;

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState(null);

  const readyCount = (dispatchQueue || []).filter(dq => dq.status === 'READY_FOR_PICKUP' || dq.status === 'READY FOR DISPATCH' || dq.status === 'READY').length;
  const inTransitCount = (dispatchQueue || []).filter(dq => dq.status === 'DISPATCHED' || dq.status === 'STAGE_LOADING').length;
  const fulfilledCount = (dispatchQueue || []).filter(dq => dq.status === 'FULFILLED' || dq.status === 'DELIVERED').length;

  const handleWarehouseClick = (whName) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(whName);
    }
    navigate('/inventory');
  };

  const handleScanManifest = (dq) => {
    setSelectedManifest(dq);
    setIsScannerOpen(true);
  };

  const handleScanResult = (matchedProduct, barcode) => {
    if (!selectedManifest) return;
    dispatchOrder(selectedManifest.orderNumber || selectedManifest.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="dispatch-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">OUTBOUND DISPATCH CONTROL</h1>
          <p className="page-subtitle">Manage carrier pickups, freight manifests, and barcode verification for outbound shipments.</p>
        </div>
      </header>

      {/* 1. DISPATCH KPIs */}
      <section className="kpi-strip-v2 kpi-strip-dispatch">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">READY TO DISPATCH</span>
          <div className="kpi-val">{readyCount || 1}</div>
          <span className="kpi-change text-muted">Staged at loading dock</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">DISPATCHED TODAY</span>
          <div className="kpi-val text-green">{inTransitCount || 2}</div>
          <span className="kpi-change text-green font-bold">In transit to customer</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">DELIVERED / FULFILLED</span>
          <div className="kpi-val text-green">{fulfilledCount || 1}</div>
          <span className="kpi-change text-green font-bold">✓ Cycle completed</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">CARRIER ON-TIME RATE</span>
          <div className="kpi-val text-green">98.4%</div>
          <span className="kpi-change text-green font-bold">Enterprise Logistics</span>
        </div>
      </section>

      {/* 2. OUTBOUND DISPATCH TABLE */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">ACTIVE DISPATCH MANIFEST QUEUE</h2>
          <span className="v2-section-sub">Carrier loading dock schedule and tracking assignment.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>MANIFEST / ORDER</th>
                <th>CUSTOMER</th>
                <th>CARRIER</th>
                <th>TRACKING CODE</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(dispatchQueue || []).map((dq, idx) => {
                const isDispatched = dq.status === 'DISPATCHED';

                return (
                  <tr key={dq.id || `disp-${idx}`}>
                    <td>
                      <strong>{dq.dispatchManifest || `MAN-709${idx + 1}`}</strong>
                      <div className="font-small text-muted">{dq.orderNumber || 'ORD-2026-8094'}</div>
                    </td>
                    <td><strong>{dq.customerName || "VibraSens Corp"}</strong></td>
                    <td>
                      <div className="flex-align-gap-2">
                        <Truck size={14} className="text-dark" />
                        <strong>{dq.carrier || "FedEx Freight"}</strong>
                      </div>
                    </td>
                    <td><code className="sku-cell">{dq.trackingCode || "FX-940281-US"}</code></td>
                    <td>
                      <button className="v2-inline-link" onClick={() => handleWarehouseClick(dq.warehouseName || "Warehouse C")}>
                        {dq.warehouseName || "Warehouse C"} →
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${isDispatched ? 'badge-green' : dq.status === 'STAGE_LOADING' ? 'badge-warning' : 'badge-normal'}`}>
                        {dq.status || 'DISPATCHED'}
                      </span>
                    </td>
                    <td>
                      {isDispatched ? (
                        <span className="text-green font-bold flex-align-gap-2">
                          <CheckCircle2 size={14} /> DISPATCHED
                        </span>
                      ) : (
                        <button className="btn-primary btn-sm" onClick={() => handleScanManifest(dq)}>
                          <Camera size={12} /> SCAN MANIFEST & DISPATCH
                        </button>
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
        targetProduct={selectedManifest}
        onScanResult={handleScanResult}
      />
    </motion.div>
  );
}
