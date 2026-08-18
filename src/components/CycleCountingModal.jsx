import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle2, AlertTriangle, Scan, Play, Check } from 'lucide-react';
import { api } from '../services/api';
import BarcodeScannerModal from './BarcodeScannerModal';
import './CycleCountingModal.css';

export default function CycleCountingModal({ isOpen, onClose, onCompleted }) {
  const [cycleCounts, setCycleCounts] = useState([]);
  const [activeCount, setActiveCount] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCounts();
    }
  }, [isOpen]);

  const loadCounts = async () => {
    try {
      const res = await api.getCycleCounts();
      if (res && res.success && res.data) {
        setCycleCounts(res.data);
        if (res.data.length > 0) setActiveCount(res.data[0]);
      }
    } catch (e) {}
  };

  if (!isOpen) return null;

  const handleCreateNewCount = async () => {
    try {
      const res = await api.createCycleCount({
        warehouseName: 'Warehouse A (Chicago Hub)',
        notes: 'Operational Cycle Count Audit'
      });
      if (res && res.success && res.data) {
        setCycleCounts(prev => [res.data, ...prev]);
        setActiveCount(res.data);
      }
    } catch (e) {}
  };

  const handleItemCountChange = async (itemId, val) => {
    if (!activeCount) return;
    const qty = parseInt(val || 0, 10);

    const updatedItems = activeCount.items.map(item => {
      if (item.id === itemId) {
        const variance = qty - item.expectedQuantity;
        return {
          ...item,
          countedQuantity: qty,
          variance,
          status: variance === 0 ? 'MATCHED' : 'DISCREPANCY'
        };
      }
      return item;
    });

    setActiveCount(prev => ({ ...prev, items: updatedItems }));

    try {
      await api.updateCycleCountItem(activeCount.id, { itemId, countedQuantity: qty });
    } catch (e) {}
  };

  const handleBarcodeScanResult = (matchedProduct, barcode) => {
    if (!activeCount || !matchedProduct) return;
    const targetItem = activeCount.items.find(i => 
      i.productId === matchedProduct.id ||
      i.sku === matchedProduct.sku ||
      String(i.barcode).toLowerCase() === String(barcode).toLowerCase()
    );

    if (targetItem) {
      const newQty = (targetItem.countedQuantity || 0) + 1;
      handleItemCountChange(targetItem.id, newQty);
    }
  };

  const handleFinalizeCount = async () => {
    if (!activeCount) return;
    setIsSubmitting(true);
    try {
      const res = await api.completeCycleCount(activeCount.id);
      if (res && res.success) {
        setActiveCount(prev => ({ ...prev, status: 'COMPLETED' }));
        if (onCompleted) onCompleted();
        setTimeout(() => onClose(), 1000);
      }
    } catch (e) {}
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div key="cycle-count-modal-backdrop" className="modal-backdrop" onClick={onClose}>
        <motion.div 
          key="cycle-count-modal-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="modal-content cycle-count-modal"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header flex-between">
            <div>
              <span className="section-label">INVENTORY AUDIT & CYCLE COUNTING SYSTEM</span>
              <h3 className="modal-title">PHYSICAL INVENTORY CYCLE COUNT</h3>
            </div>
            <div className="flex-align-gap-2">
              <button className="btn-secondary btn-sm" onClick={handleCreateNewCount}>
                + New Audit Count
              </button>
              <button className="modal-close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="modal-body">
            {/* Active Audit Header & Scanner Action */}
            {activeCount ? (
              <div>
                <div className="cc-audit-strip flex-between">
                  <div>
                    <span className="audit-num">{activeCount.countNumber}</span>
                    <span className="audit-wh">• {activeCount.warehouseName}</span>
                  </div>

                  <div className="flex-align-gap-2">
                    <span className={`badge ${activeCount.status === 'COMPLETED' ? 'badge-green' : 'badge-warning'}`}>
                      {activeCount.status}
                    </span>

                    {activeCount.status !== 'COMPLETED' && (
                      <button className="btn-primary btn-sm" onClick={() => setIsScannerOpen(true)}>
                        <Camera size={14} /> Scan Barcode
                      </button>
                    )}
                  </div>
                </div>

                {/* Audit Items Table */}
                <div className="table-container" style={{ marginTop: '14px', maxHeight: '320px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>PRODUCT / SKU</th>
                        <th>BARCODE</th>
                        <th>EXPECTED</th>
                        <th>PHYSICAL COUNTED</th>
                        <th>VARIANCE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeCount.items || []).map((item) => {
                        const countVal = item.countedQuantity !== null && item.countedQuantity !== undefined ? item.countedQuantity : '';
                        const variance = item.countedQuantity !== null && item.countedQuantity !== undefined ? (item.countedQuantity - item.expectedQuantity) : 0;
                        return (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.productName}</strong>
                              <div className="sku-cell">{item.sku}</div>
                            </td>
                            <td><code className="barcode-code-cell">{item.barcode || '890100000001'}</code></td>
                            <td><strong>{item.expectedQuantity} units</strong></td>
                            <td>
                              {activeCount.status === 'COMPLETED' ? (
                                <strong>{item.countedQuantity || 0} units</strong>
                              ) : (
                                <input 
                                  type="number"
                                  min="0"
                                  placeholder="Enter count"
                                  value={countVal}
                                  onChange={e => handleItemCountChange(item.id, e.target.value)}
                                  className="cc-input-field"
                                />
                              )}
                            </td>
                            <td>
                              <span className={`font-bold ${variance === 0 ? 'text-muted' : variance > 0 ? 'text-green' : 'text-red'}`}>
                                {variance > 0 ? `+${variance}` : variance}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${item.status === 'MATCHED' ? 'badge-green' : item.status === 'DISCREPANCY' ? 'badge-risk' : 'badge-normal'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="empty-cc-box">
                <Scan size={32} className="text-muted" />
                <p>No active cycle count audit sheets found.</p>
                <button className="btn-primary" onClick={handleCreateNewCount}>Initialize Cycle Count</button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer flex-between">
            <button className="btn-secondary" onClick={onClose}>CLOSE</button>
            {activeCount && activeCount.status !== 'COMPLETED' && (
              <button className="btn-primary" onClick={handleFinalizeCount} disabled={isSubmitting}>
                <Check size={14} /> {isSubmitting ? 'FINALIZING...' : 'FINALIZE AUDIT & RECONCILE'}
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Barcode Scanner Modal Integration */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleBarcodeScanResult}
      />
    </AnimatePresence>
  );
}
