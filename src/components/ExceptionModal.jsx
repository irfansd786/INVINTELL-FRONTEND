import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './ExceptionModal.css';

export default function ExceptionModal({ orderId, displayId, customer, warehouseName, onClose }) {
  const { createException } = useStore();
  const [type, setType] = useState('DAMAGED ITEM');
  const [severity, setSeverity] = useState('HIGH');
  const [productName, setProductName] = useState('Product A — Industrial Bearings');
  const [sku, setSku] = useState('SKU-9402-A');
  const [shortageUnits, setShortageUnits] = useState(2);
  const [impact, setImpact] = useState('Damaged units discovered during picking. Replacement required.');
  const [actionRequired, setActionRequired] = useState('Quarantine damaged units and adjust inventory ledger count.');

  const handleSubmit = (e) => {
    e.preventDefault();
    createException({
      orderId,
      orderDisplayId: displayId,
      customer,
      warehouseName: warehouseName || 'Warehouse A',
      type,
      severity,
      productName,
      sku,
      shortageUnits,
      impact,
      actionRequired
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div key="exception-modal-backdrop" className="modal-backdrop" onClick={onClose}>
        <motion.div 
          key="exception-modal-content"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="modal-content exc-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header header-red">
            <div>
              <span className="section-label label-red">OPERATIONAL EXCEPTION REPORT</span>
              <h2 className="modal-title">REPORT EXCEPTION — ORDER {displayId}</h2>
              <span className="modal-sku">{customer} • {warehouseName}</span>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="modal-label">EXCEPTION CATEGORY</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="select-filter full-width">
                    <option value="DAMAGED ITEM">DAMAGED ITEM</option>
                    <option value="MISSING ITEM">MISSING ITEM</option>
                    <option value="WRONG QUANTITY">WRONG QUANTITY MISMATCH</option>
                    <option value="INVENTORY SHORTAGE">INVENTORY SHORTAGE</option>
                    <option value="DISPATCH DELAY">DISPATCH CARRIER DELAY</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="modal-label">SEVERITY LEVEL</label>
                  <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="select-filter full-width">
                    <option value="CRITICAL">CRITICAL (Stops Fulfillment)</option>
                    <option value="HIGH">HIGH (Requires Immediate Manager Review)</option>
                    <option value="MEDIUM">MEDIUM (Standard Exception)</option>
                    <option value="LOW">LOW (Informational Logging)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="modal-label">IMPACTED PRODUCT & SKU</label>
                  <input 
                    type="text" 
                    value={productName} 
                    onChange={(e) => setProductName(e.target.value)}
                    className="search-input"
                    placeholder="Product Name"
                  />
                </div>

                <div className="form-group">
                  <label className="modal-label">AFFECTED UNITS</label>
                  <input 
                    type="number" 
                    value={shortageUnits} 
                    onChange={(e) => setShortageUnits(Number(e.target.value))}
                    className="search-input"
                    placeholder="Units count"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="modal-label">OPERATIONAL IMPACT DESCRIPTION</label>
                <textarea 
                  value={impact} 
                  onChange={(e) => setImpact(e.target.value)}
                  className="search-input text-area"
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="modal-label">RECOMMENDED MANAGER RESOLUTION ACTION</label>
                <textarea 
                  value={actionRequired} 
                  onChange={(e) => setActionRequired(e.target.value)}
                  className="search-input text-area"
                  rows={2}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                CANCEL
              </button>
              <button type="submit" className="btn-primary btn-red">
                LOG EXCEPTION & UPDATE ORDER STATUS <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
