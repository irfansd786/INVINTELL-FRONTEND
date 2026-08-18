import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Box, ArrowRight } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import BarcodeDisplay from './BarcodeDisplay';
import BarcodeScannerModal from './BarcodeScannerModal';
import './ProductDetailModal.css';

export default function ProductDetailModal({ product, onClose }) {
  const [detailedProduct, setDetailedProduct] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    const targetId = product.id || product.productId || product.sku;
    if (targetId && mockApi.getProductById) {
      mockApi.getProductById(targetId).then((res) => {
        if (res) setDetailedProduct(res);
      }).catch((err) => {
        console.warn('ProductDetailModal fetch error:', err.message);
      });
    }
  }, [product]);

  // Escape key listener for modal closing
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const displayData = detailedProduct || product;

  // Calculate totals from inventoryDist if available
  const inventoryDist = displayData.inventoryDist || [
    { warehouseName: displayData.warehouse || 'Warehouse A', available: displayData.stockQuantity || displayData.stock || 240, reserved: 20, inTransit: 0, damaged: 0 }
  ];
  const totalAvailable = inventoryDist.reduce((acc, i) => acc + (i.available || 0), 0) || (displayData.stockQuantity || displayData.remaining || 240);
  const totalReserved = inventoryDist.reduce((acc, i) => acc + (i.reserved || 0), 0) || 0;
  const totalInTransit = inventoryDist.reduce((acc, i) => acc + (i.inTransit || 0), 0) || 0;
  const totalDamaged = inventoryDist.reduce((acc, i) => acc + (i.damaged || 0), 0) || 0;
  const totalStock = totalAvailable + totalReserved + totalInTransit + totalDamaged;

  const movements = displayData.movementHistory || [
    { id: 'm1', date: 'Today 10:15', type: 'OUTBOUND', quantity: 24, reference: 'ORD-8092', warehouseName: displayData.warehouse || 'Warehouse A' },
    { id: 'm2', date: 'Yesterday 14:30', type: 'INBOUND', quantity: 200, reference: 'PO-9402', warehouseName: displayData.warehouse || 'Warehouse A' }
  ];

  return (
    <>
      <AnimatePresence>
        <div key="prod-detail-modal-backdrop" className="modal-backdrop" onClick={onClose} role="presentation">
          <motion.div 
            key="prod-detail-modal-content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="modal-content product-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prod-detail-modal-title"
          >
            {/* Header */}
            <div className="modal-header">
              <div>
                <span className="section-label">PRODUCT CATALOG ITEM</span>
                <h2 id="prod-detail-modal-title" className="modal-title">{displayData.name || displayData.productName}</h2>
                <div className="modal-subtitle-row">
                  <span className="modal-sku">SKU: {displayData.sku}</span>
                  <span className="bullet-sep">•</span>
                  <span className="modal-cat">Category: {displayData.category || 'General'}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* KPI Row */}
              <div className="modal-kpi-row">
                <div className="modal-kpi-card">
                  <span className="kpi-label">TOTAL STOCK</span>
                  <span className="kpi-value">{totalStock} <small>units</small></span>
                </div>
                <div className="modal-kpi-card">
                  <span className="kpi-label">AVAILABLE</span>
                  <span className="kpi-value text-green">{totalAvailable} <small>units</small></span>
                </div>
                <div className="modal-kpi-card">
                  <span className="kpi-label">RESERVED / ALLOCATED</span>
                  <span className="kpi-value">{totalReserved} <small>units</small></span>
                </div>
                <div className="modal-kpi-card">
                  <span className="kpi-label">SELLING PRICE</span>
                  <span className="kpi-value">₹{displayData.sellingPrice || displayData.price || 450}</span>
                </div>
              </div>

              {/* Permanent Visual Barcode Section */}
              <BarcodeDisplay product={displayData} onOpenScanner={() => setIsScannerOpen(true)} />

              {/* Risk Banner if Risk Present */}
              {displayData.status && displayData.status !== 'NORMAL' && (
                <div className={`modal-risk-banner ${displayData.status === 'LOW' ? 'banner-red' : 'banner-orange'}`}>
                  <AlertTriangle size={16} />
                  <span>Status: <strong>{displayData.status}</strong> — Action recommended.</span>
                </div>
              )}

              {/* Two Column Layout: Facility Breakdown + Stock Movements */}
              <div className="modal-two-col">
                {/* Warehouse Stock Distribution */}
                <div className="modal-block">
                  <h3 className="block-title">STOCK DISTRIBUTION BY WAREHOUSE</h3>
                  <div className="wh-dist-table-wrapper">
                    <table className="wh-dist-table">
                      <thead>
                        <tr>
                          <th scope="col">WAREHOUSE</th>
                          <th scope="col">AVAILABLE</th>
                          <th scope="col">RESERVED</th>
                          <th scope="col">IN TRANSIT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryDist.map((item, i) => (
                          <tr key={i}>
                            <td><strong>{item.warehouseName || 'Warehouse A'}</strong></td>
                            <td className="text-green"><strong>{item.available || totalAvailable}</strong></td>
                            <td>{item.reserved || 0}</td>
                            <td>{item.inTransit || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Movement History */}
                <div className="modal-block">
                  <h3 className="block-title">RECENT MOVEMENTS</h3>
                  <div className="movement-mini-list">
                    {movements.map((m) => (
                      <div key={m.id} className="movement-mini-item">
                        <div className="m-left">
                          <span className={`m-type-tag ${m.type === 'INBOUND' ? 'type-in' : 'type-out'}`}>{m.type}</span>
                          <div>
                            <strong className="m-ref">{m.reference}</strong>
                            <span className="m-sub">{m.warehouseName} • {m.date}</span>
                          </div>
                        </div>
                        <span className={`m-qty ${m.type === 'INBOUND' ? 'text-green' : ''}`}>
                          {m.type === 'INBOUND' ? '+' : '-'}{m.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Reusable Barcode Scanner Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        targetProduct={displayData}
      />
    </>
  );
}
