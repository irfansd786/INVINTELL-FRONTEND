import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Scale, Camera } from 'lucide-react';
import { api } from '../services/api';
import BarcodeDisplay from './BarcodeDisplay';
import BarcodeScannerModal from './BarcodeScannerModal';
import './InventoryReconciliationModal.css';

export default function InventoryReconciliationModal({ isOpen, onClose, inventoryItem, onReconciled }) {
  const [physicalCount, setPhysicalCount] = useState(inventoryItem ? (inventoryItem.inventoryLevel || inventoryItem.stockQuantity || 0) : 0);
  const [reason, setReason] = useState('Physical Stock Audit Count');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen || !inventoryItem) return null;

  const currentSystemStock = inventoryItem.inventoryLevel !== undefined ? inventoryItem.inventoryLevel : (inventoryItem.stockQuantity || 0);
  const physical = parseInt(physicalCount || 0, 10);
  const variance = physical - currentSystemStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResultMsg(null);

    const payload = {
      productId: inventoryItem.productId || inventoryItem.id,
      warehouseName: inventoryItem.warehouseName || inventoryItem.store?.name || 'Warehouse A (Chicago Hub)',
      physicalCount: physical,
      reason
    };

    try {
      const res = await api.reconcileInventory(payload);
      if (res && res.success) {
        setResultMsg({ type: 'success', text: res.message || 'Inventory reconciled successfully!' });
        if (onReconciled) {
          onReconciled(inventoryItem.id || inventoryItem.productId, physical);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setResultMsg({ type: 'error', text: res?.message || 'Reconciliation failed.' });
      }
    } catch (err) {
      setResultMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div key="reconcile-modal-backdrop" className="modal-backdrop" onClick={onClose} role="presentation">
          <motion.div 
            key="reconcile-modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="modal-content reconcile-modal"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-header flex-between">
              <div>
                <span className="section-label">INVENTORY RECONCILIATION & VARIANCE AUDIT</span>
                <h3 className="modal-title">RECONCILE PHYSICAL VS SYSTEM STOCK</h3>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close reconciliation modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Scannable Product Barcode Display */}
              <div className="reconcile-product-card">
                <div className="flex-between">
                  <div>
                    <h4 className="prod-name-title">{inventoryItem.productName || inventoryItem.name || 'Inventory Product'}</h4>
                    <span className="prod-sku-tag">SKU: {inventoryItem.sku || inventoryItem.productId} • {inventoryItem.warehouseName || 'Warehouse Hub'}</span>
                  </div>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => setIsScannerOpen(true)}>
                    <Camera size={13} /> Verify Barcode
                  </button>
                </div>

                {/* Barcode Display Component */}
                <div style={{ marginTop: '12px' }}>
                  <BarcodeDisplay product={inventoryItem} onOpenScanner={() => setIsScannerOpen(true)} />
                </div>
              </div>

              {/* Comparison Box: System Stock vs Physical Count */}
              <div className="stock-compare-grid">
                <div className="compare-box">
                  <span className="box-lbl">SYSTEM STOCK</span>
                  <div className="box-val text-dark">{currentSystemStock} units</div>
                  <span className="box-sub">Current Database Balance</span>
                </div>

                <div className="compare-box">
                  <span className="box-lbl">PHYSICAL COUNT</span>
                  <input 
                    type="number" 
                    min="0"
                    required
                    value={physicalCount}
                    onChange={e => setPhysicalCount(e.target.value)}
                    className="physical-count-field"
                    aria-label="Physical counted units"
                  />
                  <span className="box-sub">Actual Counted Units</span>
                </div>

                <div className={`compare-box ${variance === 0 ? 'box-neutral' : variance > 0 ? 'box-positive' : 'box-negative'}`}>
                  <span className="box-lbl">VARIANCE</span>
                  <div className={`box-val ${variance === 0 ? 'text-muted' : variance > 0 ? 'text-green' : 'text-red'}`}>
                    {variance > 0 ? `+${variance}` : variance} units
                  </div>
                  <span className="box-sub">{variance === 0 ? 'Exact Match' : variance > 0 ? 'Surplus Stock' : 'Stock Shortage'}</span>
                </div>
              </div>

              {/* Audit Reason Field */}
              <div className="field-group" style={{ marginTop: '16px' }}>
                <label htmlFor="reconcile-reason-select" className="field-lbl">RECONCILIATION AUDIT REASON</label>
                <select 
                  id="reconcile-reason-select"
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className="select-field"
                  aria-label="Reconciliation audit reason"
                >
                  <option value="Physical Stock Audit Count">Physical Stock Audit Count</option>
                  <option value="Damaged Stock Write-Off">Damaged Stock Write-Off</option>
                  <option value="Supplier Receiving Correction">Supplier Receiving Correction</option>
                  <option value="Misplaced / Bin Relocation">Misplaced / Bin Relocation</option>
                  <option value="Inventory Shrinkage / Theft">Inventory Shrinkage / Theft</option>
                </select>
              </div>

              {/* Result Notification */}
              {resultMsg && (
                <div className={`result-alert ${resultMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} role="alert">
                  {resultMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{resultMsg.text}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="modal-footer flex-between" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>CANCEL</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  <Scale size={14} /> {isSubmitting ? 'RECONCILING...' : 'SUBMIT RECONCILIATION'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        targetProduct={inventoryItem}
      />
    </>
  );
}
