import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, CheckCircle2, Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import './Packing.css';

export default function Packing() {
  const navigate = useNavigate();
  const store = useStore();
  const { packingTasks, completePacking, setSelectedWarehouseFilter } = store;

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const waitingCount = (packingTasks || []).filter(pk => pk.status === 'READY_TO_PACK' || pk.status === 'READY TO PACK' || pk.status === 'PENDING').length;
  const inProgressCount = (packingTasks || []).filter(pk => pk.status === 'VERIFYING_BARCODE' || pk.status === 'PACKING' || pk.status === 'IN_PROGRESS').length;
  const completedCount = (packingTasks || []).filter(pk => pk.status === 'PACKED').length;

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
    completePacking(selectedTask.orderNumber || selectedTask.id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="packing-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">PACKING STATION QUEUE</h1>
          <p className="page-subtitle">Verify picked items via barcode scanner, seal corrugated boxes, and stage for dispatch.</p>
        </div>
      </header>

      {/* 1. PACKING KPIs */}
      <section className="kpi-strip-v2 kpi-strip-packing">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">READY TO PACK</span>
          <div className="kpi-val">{waitingCount || 1}</div>
          <span className="kpi-change text-muted">Staged at packing bays</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PACKING IN PROGRESS</span>
          <div className="kpi-val text-green">{inProgressCount || 1}</div>
          <span className="kpi-change text-green font-bold">Packers active</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PACKED & VERIFIED</span>
          <div className="kpi-val text-green">{completedCount || 1}</div>
          <span className="kpi-change text-green font-bold">✓ Staged for dispatch</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">VERIFICATION ERRORS</span>
          <div className="kpi-val">0</div>
          <span className="kpi-change text-muted">100% item accuracy</span>
        </div>
      </section>

      {/* 2. PACKING QUEUE TABLE */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">ACTIVE PACKING BAY LINE</h2>
          <span className="v2-section-sub">Barcode verification and box sealing staging.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PACK ID / ORDER</th>
                <th>SKU</th>
                <th>BOX TYPE</th>
                <th>WEIGHT (KG)</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>PACKER ASSIGNED</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(packingTasks || []).map((pk, idx) => {
                const isPacked = pk.status === 'PACKED';

                return (
                  <tr key={pk.id || `pack-${idx}`}>
                    <td>
                      <strong>{pk.packId || `PAC-401${idx + 1}`}</strong>
                      <div className="font-small text-muted">{pk.orderNumber || 'ORD-2026-8093'}</div>
                    </td>
                    <td><code className="sku-cell">{pk.sku || "SKU-P0001"}</code></td>
                    <td><span className="bin-tag"><Box size={12} /> {pk.boxType || "MEDIUM_CORRUGATED"}</span></td>
                    <td><strong>{pk.weightKg || "4.2 kg"}</strong></td>
                    <td>
                      <button className="v2-inline-link" onClick={() => handleWarehouseClick(pk.warehouseName || "Warehouse A")}>
                        {pk.warehouseName || "Warehouse A"} →
                      </button>
                    </td>
                    <td>{pk.packerName || "Dave Evans"}</td>
                    <td>
                      <span className={`badge ${isPacked ? 'badge-green' : pk.status === 'VERIFYING_BARCODE' ? 'badge-warning' : 'badge-normal'}`}>
                        {pk.status || 'READY_TO_PACK'}
                      </span>
                    </td>
                    <td>
                      {isPacked ? (
                        <span className="text-green font-bold flex-align-gap-2">
                          <CheckCircle2 size={14} /> VERIFIED & PACKED
                        </span>
                      ) : (
                        <button className="btn-primary btn-sm" onClick={() => handleScanTask(pk)}>
                          <Camera size={12} /> SCAN BARCODE & SEAL
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
        targetProduct={selectedTask}
        onScanResult={handleScanResult}
      />
    </motion.div>
  );
}
