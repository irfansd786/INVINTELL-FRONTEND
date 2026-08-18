import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, AlertTriangle, ArrowRight, Box } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import './WarehouseDetailModal.css';

export default function WarehouseDetailModal({ warehouse, onClose, onSelectProduct }) {
  const [inventoryList, setInventoryList] = useState([]);
  const [movements, setMovements] = useState([]);
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    if (!warehouse) return;
    mockApi.getInventory({ warehouseId: warehouse.id }).then(setInventoryList);
    mockApi.getMovements({ warehouseId: warehouse.id, limit: 5 }).then(setMovements);
    mockApi.getRisks({ warehouseId: warehouse.id }).then(setRisks);
  }, [warehouse]);

  if (!warehouse) return null;

  const totalAvailable = warehouse.availableUnits || inventoryList.reduce((acc, i) => acc + i.available, 0);
  const totalReserved = warehouse.reservedUnits || inventoryList.reduce((acc, i) => acc + i.reserved, 0);
  const totalInTransit = warehouse.inTransitUnits || inventoryList.reduce((acc, i) => acc + i.inTransit, 0);

  return (
    <AnimatePresence>
      <div key="wh-detail-modal-backdrop" className="modal-backdrop" onClick={onClose}>
        <motion.div 
          key="wh-detail-modal-content"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="modal-content wh-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <span className="section-label">WAREHOUSE FACILITY DETAILS</span>
              <h2 className="modal-title">{warehouse.name} — {warehouse.subtitle || warehouse.location}</h2>
              <div className="modal-subtitle-row">
                <span className="modal-sku">FACILITY CODE: {warehouse.code || warehouse.id}</span>
                <span className="bullet-sep">•</span>
                <span className="modal-cat">Manager: {warehouse.manager || 'Operations Manager'}</span>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Facility KPI Grid */}
            <div className="wh-kpi-grid">
              <div className="wh-kpi-card">
                <span className="kpi-lbl">TOTAL INVENTORY</span>
                <span className="kpi-val">{warehouse.units ? warehouse.units.toLocaleString() : (totalAvailable + totalReserved).toLocaleString()}</span>
                <span className="kpi-sub">Total units stored</span>
              </div>

              <div className="wh-kpi-card">
                <span className="kpi-lbl">AVAILABLE STOCK</span>
                <span className="kpi-val">{totalAvailable.toLocaleString()}</span>
                <span className="kpi-sub">Ready for dispatch</span>
              </div>

              <div className="wh-kpi-card">
                <span className="kpi-lbl">RESERVED STOCK</span>
                <span className="kpi-val">{totalReserved.toLocaleString()}</span>
                <span className="kpi-sub">Order allocations</span>
              </div>

              <div className="wh-kpi-card">
                <span className="kpi-lbl">PENDING ORDERS</span>
                <span className="kpi-val">{warehouse.pendingOrders || 0}</span>
                <span className="kpi-sub">Awaiting picking</span>
              </div>
            </div>

            {/* Capacity Level Bar */}
            <div className="wh-capacity-block">
              <div className="wh-capacity-header">
                <span className="cap-lbl">FACILITY CAPACITY UTILIZATION</span>
                <span className="cap-val">{warehouse.levelPercent}% occupied</span>
              </div>
              <div className="wh-progress-track">
                <div 
                  className={`wh-progress-fill ${warehouse.levelPercent > 85 ? 'fill-warning' : 'fill-normal'}`}
                  style={{ width: `${warehouse.levelPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Active Risks & Current Issues */}
            {risks.length > 0 && (
              <div className="wh-section">
                <h4 className="wh-section-title text-red">CURRENT ISSUES ({risks.length})</h4>
                <div className="wh-risks-list">
                  {risks.map((r) => (
                    <div key={r.id} className="wh-risk-row">
                      <AlertTriangle size={15} className="text-red" />
                      <div className="wh-risk-info">
                        <strong>{r.productName}</strong>
                        <span>{r.reason}</span>
                      </div>
                      <span className={`badge ${r.riskType === 'STOCKOUT' ? 'badge-risk' : 'badge-normal'}`}>
                        {r.riskType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Stored Products */}
            <div className="wh-section">
              <h4 className="wh-section-title">TOP STORED PRODUCTS</h4>
              <div className="table-container modal-table-container">
                <table className="data-table modal-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>AVAILABLE</th>
                      <th>RESERVED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryList.slice(0, 5).map((inv) => (
                      <tr 
                        key={inv.id}
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(inv);
                        }}
                      >
                        <td><strong>{inv.shortName || inv.productName}</strong></td>
                        <td className="sku-cell">{inv.sku}</td>
                        <td>{inv.available}</td>
                        <td>{inv.reserved}</td>
                        <td>
                          <span className={`badge badge-${inv.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Facility Movements */}
            {movements.length > 0 && (
              <div className="wh-section">
                <h4 className="wh-section-title">RECENT FACILITY MOVEMENTS</h4>
                <div className="wh-history-list">
                  {movements.map((m) => (
                    <div key={m.id} className="wh-hist-item">
                      <span className="hist-time">{m.timestamp}</span>
                      <span className="hist-prod">{m.productName}</span>
                      <span className={`hist-type type-${m.type.toLowerCase()}`}>{m.type}</span>
                      <span className="hist-qty">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</span>
                      <span className="hist-ref">{m.reference}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
