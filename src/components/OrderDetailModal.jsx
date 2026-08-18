import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Play, Truck, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExceptionModal from './ExceptionModal';
import './OrderDetailModal.css';

/**
 * Safely normalizes raw order objects into a standard, typed schema guaranteed for OrderDetailModal.
 */
function normalizeOrder(order) {
  if (!order) return null;

  const rawItems = order.items;
  let itemsArray = [];

  if (Array.isArray(rawItems)) {
    itemsArray = rawItems.map(item => {
      if (typeof item === 'object' && item !== null) {
        return {
          productName: item.productName || item.name || order.productName || order.product || 'Industrial Product',
          sku: item.sku || order.sku || 'SKU-INV-100',
          quantity: typeof item.quantity === 'number' ? item.quantity : (typeof order.quantity === 'number' ? order.quantity : 1),
          warehouseStock: item.warehouseStock || { "Warehouse A": 45, "Warehouse B": 30 }
        };
      }
      return {
        productName: order.productName || order.product || 'Industrial Product',
        sku: order.sku || 'SKU-INV-100',
        quantity: typeof item === 'number' ? item : 1,
        warehouseStock: { "Warehouse A": 45, "Warehouse B": 30 }
      };
    });
  } else if (typeof rawItems === 'string') {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) {
        itemsArray = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        itemsArray = [parsed];
      }
    } catch (e) {
      // Fallback
    }
  } else if (typeof rawItems === 'object' && rawItems !== null) {
    itemsArray = [rawItems];
  }

  // If itemsArray is still empty (e.g. when order.items was a number like 55 or null), derive default item array safely
  if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
    const qty = typeof rawItems === 'number' ? rawItems : (typeof order.totalItems === 'number' ? order.totalItems : (typeof order.quantity === 'number' ? order.quantity : 1));
    itemsArray = [{
      productName: order.productName || order.product || 'Enterprise Component',
      sku: order.sku || 'SKU-P0001',
      quantity: qty,
      warehouseStock: { 
        "Warehouse A": Math.max(10, Math.round(qty * 0.8)), 
        "Warehouse B": Math.max(5, Math.round(qty * 0.5)) 
      }
    }];
  }

  const safeItemsArray = Array.isArray(itemsArray) ? itemsArray : [];

  // Calculate total units safely without crashing on .reduce
  const totalUnits = order.totalUnits || order.totalItems || safeItemsArray.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 1), 0);

  // Normalize activity log array safely
  let activityArray = [];
  if (Array.isArray(order.activity)) {
    activityArray = order.activity;
  } else if (typeof order.activity === 'string') {
    activityArray = [{ time: '09:15', text: order.activity }];
  } else {
    activityArray = [
      { time: '09:15', text: 'Created via B2B Order Gateway' },
      { time: '09:30', text: `Allocated to ${order.warehouseName || order.assignedWarehouse || 'Warehouse Hub'}` }
    ];
  }

  return {
    ...order,
    displayId: order.orderNumber || order.displayId || order.id || 'ORD-2026-1001',
    customer: order.customerName || order.customer || 'Enterprise Customer',
    priority: order.priority || 'STANDARD',
    status: order.status || 'PENDING',
    warehouseName: order.warehouseName || order.assignedWarehouse || 'Warehouse A (Chicago Hub)',
    date: order.createdAt || order.date || '2026-08-16',
    items: safeItemsArray,
    totalUnits,
    activity: Array.isArray(activityArray) ? activityArray : []
  };
}

export default function OrderDetailModal({ order, onClose }) {
  const store = useStore();
  const { 
    orders, 
    acceptAllocation, 
    startPicking, 
    completePicking, 
    startPacking, 
    completePacking, 
    dispatchOrder, 
    fulfillOrder 
  } = store;

  const [showExceptionModal, setShowExceptionModal] = useState(false);

  // Escape key listener for modal closing
  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  // Get reactive order from store and normalize data schema safely
  const rawLiveOrder = (Array.isArray(orders) ? orders : []).find(o => o.id === order.id || o.displayId === order.displayId || o.orderNumber === order.orderNumber) || order;
  const liveOrder = normalizeOrder(rawLiveOrder);

  if (!liveOrder) return null;

  const safeOrderItems = Array.isArray(liveOrder.items) ? liveOrder.items : [];
  const safeActivityLog = Array.isArray(liveOrder.activity) ? liveOrder.activity : [];

  // Workflow steps array
  const workflowSteps = [
    { key: "PENDING", label: "CREATED" },
    { key: "ALLOCATED", label: "ALLOCATED" },
    { key: "PICKING", label: "PICKING" },
    { key: "PICKED", label: "PICKED" },
    { key: "PACKING", label: "PACKING" },
    { key: "PACKED", label: "PACKED" },
    { key: "READY FOR DISPATCH", label: "READY DISPATCH" },
    { key: "DISPATCHED", label: "DISPATCHED" },
    { key: "FULFILLED", label: "FULFILLED" }
  ];

  // Helper to determine step status (COMPLETED / ACTIVE / UPCOMING / EXCEPTION)
  const getStepStatus = (stepKey, index) => {
    if (liveOrder.status === 'EXCEPTION') {
      return { isCompleted: false, isActive: false, isException: true };
    }
    const currentStepIndex = workflowSteps.findIndex(s => s.key === liveOrder.status);
    if (currentStepIndex === -1) {
      if (liveOrder.status === 'FULFILLED') return { isCompleted: true, isActive: false };
      return { isCompleted: false, isActive: false };
    }
    if (index < currentStepIndex) return { isCompleted: true, isActive: false };
    if (index === currentStepIndex) return { isCompleted: false, isActive: true };
    return { isCompleted: false, isActive: false };
  };

  return (
    <>
      <AnimatePresence>
        <div key="order-detail-modal-backdrop" className="modal-backdrop" onClick={onClose} role="presentation">
          <motion.div 
            key="order-detail-modal-content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="modal-content order-detail-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            {/* Header */}
            <div className="modal-header">
              <div>
                <span className="section-label">B2B SALES ORDER FULFILLMENT LIFECYCLE</span>
                <h2 id="order-modal-title" className="modal-title">ORDER {liveOrder.displayId}</h2>
                <div className="modal-subtitle-row">
                  <span className="modal-sku">Customer: <strong>{liveOrder.customer}</strong></span>
                  <span className="bullet-sep">•</span>
                  <span className="modal-cat">Created: {liveOrder.date}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Visual Workflow Timeline Step Bar */}
              <div className="workflow-timeline-container">
                <span className="timeline-header-label">FULFILLMENT LIFECYCLE PROGRESS</span>
                <div className="workflow-steps-bar">
                  {workflowSteps.map((step, idx) => {
                    const { isCompleted, isActive, isException } = getStepStatus(step.key, idx);
                    return (
                      <div 
                        key={step.key}
                        className={`wf-step-item ${isCompleted ? 'step-completed' : ''} ${isActive ? 'step-active' : ''} ${isException ? 'step-exception' : ''}`}
                      >
                        <div className="step-circle">
                          {isCompleted ? "✓" : isException ? "!" : idx + 1}
                        </div>
                        <span className="step-label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Metadata Summary Strip */}
              <div className="order-meta-grid">
                <div className="order-meta-item">
                  <span className="meta-lbl">PRIORITY</span>
                  <div>
                    <span className={`priority-tag p-${(liveOrder.priority || 'standard').toLowerCase()}`}>
                      {liveOrder.priority}
                    </span>
                  </div>
                </div>

                <div className="order-meta-item">
                  <span className="meta-lbl">STATUS</span>
                  <div>
                    <span className={`badge ${liveOrder.status === 'EXCEPTION' ? 'badge-risk' : 'badge-normal'}`}>
                      {liveOrder.status}
                    </span>
                  </div>
                </div>

                <div className="order-meta-item">
                  <span className="meta-lbl">TOTAL UNITS</span>
                  <span className="meta-val">
                    {liveOrder.totalUnits} units
                  </span>
                </div>

                <div className="order-meta-item">
                  <span className="meta-lbl">PRIMARY HUB</span>
                  <span className="meta-val">{liveOrder.warehouseName}</span>
                </div>
              </div>

              {/* Order Items Table with Warehouse Stock Availability */}
              <div className="modal-section">
                <h4 className="order-section-title">ORDER ITEMS & WAREHOUSE AVAILABILITY</h4>
                <div className="table-container modal-table-container">
                  <table className="data-table modal-table">
                    <thead>
                      <tr>
                        <th scope="col">PRODUCT</th>
                        <th scope="col">SKU</th>
                        <th scope="col">ORDERED QTY</th>
                        <th scope="col">WAREHOUSE A AVAILABILITY</th>
                        <th scope="col">WAREHOUSE B AVAILABILITY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeOrderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.productName}</strong></td>
                          <td className="sku-cell">{item.sku}</td>
                          <td><strong>{item.quantity} units</strong></td>
                          <td>
                            {item.warehouseStock?.["Warehouse A"] !== undefined ? (
                              <span className={item.warehouseStock["Warehouse A"] > 0 ? "text-available" : "text-none"}>
                                {item.warehouseStock["Warehouse A"]} avail
                              </span>
                            ) : (
                              <span className="text-muted">Available</span>
                            )}
                          </td>
                          <td>
                            {item.warehouseStock?.["Warehouse B"] !== undefined ? (
                              <span className={item.warehouseStock["Warehouse B"] > 0 ? "text-available" : "text-none"}>
                                {item.warehouseStock["Warehouse B"]} avail
                              </span>
                            ) : (
                              <span className="text-muted">Available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Lifecycle Status Action Toolbar */}
              <div className="order-modal-action-bar">
                <span className="action-bar-label">LIFECYCLE CONTROL ACTION:</span>

                <div className="action-bar-buttons">
                  {liveOrder.status === 'PENDING' && (
                    <button className="btn-primary" onClick={() => acceptAllocation && acceptAllocation(liveOrder.id)}>
                      ACCEPT ALLOCATION & STAGE FOR PICKING <ArrowRight size={14} />
                    </button>
                  )}

                  {liveOrder.status === 'ALLOCATED' && (
                    <button className="btn-primary" onClick={() => startPicking && startPicking(liveOrder.id)}>
                      <Play size={14} /> START PICKING
                    </button>
                  )}

                  {liveOrder.status === 'PICKING' && (
                    <button className="btn-primary" onClick={() => completePicking && completePicking(liveOrder.id)}>
                      <Check size={14} /> MARK PICKED
                    </button>
                  )}

                  {liveOrder.status === 'PICKED' && (
                    <button className="btn-primary" onClick={() => startPacking && startPacking(liveOrder.id)}>
                      <Play size={14} /> START PACKING
                    </button>
                  )}

                  {liveOrder.status === 'PACKING' && (
                    <button className="btn-primary" onClick={() => completePacking && completePacking(liveOrder.id)}>
                      <Check size={14} /> MARK PACKED
                    </button>
                  )}

                  {liveOrder.status === 'READY FOR DISPATCH' && (
                    <button className="btn-primary" onClick={() => dispatchOrder && dispatchOrder(liveOrder.id)}>
                      <Truck size={14} /> MARK DISPATCHED
                    </button>
                  )}

                  {liveOrder.status === 'DISPATCHED' && (
                    <button className="btn-primary" onClick={() => fulfillOrder && fulfillOrder(liveOrder.id)}>
                      MARK FULFILLED
                    </button>
                  )}

                  {liveOrder.status === 'FULFILLED' && (
                    <span className="completed-tag text-dark">✓ LIFECYCLE COMPLETE</span>
                  )}

                  {liveOrder.status !== 'FULFILLED' && (
                    <button className="btn-secondary text-red" onClick={() => setShowExceptionModal(true)}>
                      REPORT EXCEPTION
                    </button>
                  )}
                </div>
              </div>

              {/* Order Activity Timeline */}
              <div className="modal-section">
                <h4 className="order-section-title">ORDER ACTIVITY AUDIT LEDGER</h4>
                <div className="order-activity-timeline">
                  {safeActivityLog.length > 0 ? (
                    safeActivityLog.map((act, idx) => (
                      <div key={idx} className="timeline-item">
                        <span className="timeline-time">{act.time}</span>
                        <span className="timeline-dot"></span>
                        <span className="timeline-text">{act.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="timeline-item">
                      <span className="timeline-time">09:15</span>
                      <span className="timeline-dot"></span>
                      <span className="timeline-text">Created via B2B Gateway</span>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Exception Modal Trigger */}
      {showExceptionModal && (
        <ExceptionModal 
          orderId={liveOrder.id}
          displayId={liveOrder.displayId}
          customer={liveOrder.customer}
          warehouseName={liveOrder.warehouseName}
          onClose={() => setShowExceptionModal(false)}
        />
      )}
    </>
  );
}
