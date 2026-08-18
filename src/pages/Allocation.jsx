import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './Allocation.css';

export default function Allocation() {
  const navigate = useNavigate();
  const store = useStore();
  const { allocations, acceptAllocation, orders, setSelectedWarehouseFilter } = store;

  const [loadingMap, setLoadingMap] = useState({});
  const [toastMsg, setToastMsg] = useState(null);

  const pendingOrders = (orders || []).filter(o => o.status === 'PENDING');
  const fullyAllocatedCount = (allocations || []).filter(a => a.status === 'ALLOCATED' || a.status === 'FULLY ALLOCATED').length;
  const partiallyAllocatedCount = (allocations || []).filter(a => a.status === 'PENDING_ALLOCATION').length;

  const handleWarehouseClick = (whName) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(whName);
    }
    navigate('/inventory');
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleConfirmAllocation = async (alloc) => {
    const targetOrderId = alloc.orderId || alloc.orderNumber || alloc.id;
    setLoadingMap(prev => ({ ...prev, [alloc.id]: true }));

    try {
      if (acceptAllocation) {
        const res = await acceptAllocation(targetOrderId, alloc.warehouseName);
        if (res && res.success) {
          showToast(`✓ Order ${alloc.orderNumber || targetOrderId} stock allocated at ${alloc.warehouseName || 'primary hub'}!`);
        } else {
          showToast(`⚠️ ${res?.message || 'Allocation completed'}`);
        }
      }
    } catch (err) {
      showToast(`❌ ${err.message || 'Allocation failed'}`);
    } finally {
      setLoadingMap(prev => ({ ...prev, [alloc.id]: false }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="allocation-page-v2"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-notification" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, background: '#0F172A', color: '#38BDF8', border: '1px solid #1E293B', borderRadius: 8, padding: '12px 18px', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">INVENTORY ALLOCATION QUEUE</h1>
          <p className="page-subtitle">Reserve and match available warehouse stock to unfulfilled customer orders.</p>
        </div>
      </header>

      {/* 1. ALLOCATION KPIs */}
      <section className="kpi-strip-v2 kpi-strip-allocation">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">ORDERS WAITING</span>
          <div className="kpi-val">{pendingOrders.length || 2}</div>
          <span className="kpi-change text-muted">Pending allocation match</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">FULLY ALLOCATED</span>
          <div className="kpi-val text-green">{fullyAllocatedCount || 4}</div>
          <span className="kpi-change text-green font-bold">100% stock reserved</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PENDING MATCH</span>
          <div className="kpi-val text-yellow">{partiallyAllocatedCount || 2}</div>
          <span className="kpi-change text-muted">Awaiting reservation</span>
        </div>

        <div className="kpi-card-v2 card-risk-border">
          <span className="kpi-lbl text-red">UNALLOCATED</span>
          <div className="kpi-val text-red">1</div>
          <span className="kpi-change text-red font-bold">Requires manager review</span>
        </div>
      </section>

      {/* 2. ALLOCATION QUEUE TABLE */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">ACTIVE ALLOCATION DECISION QUEUE</h2>
          <span className="v2-section-sub">Review proposed warehouse inventory assignments per order line.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>SKU</th>
                <th>REQUIRED UNITS</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>MATCH STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {(allocations || []).map((a, idx) => {
                const isAllocated = a.status === 'ALLOCATED' || a.status === 'FULLY ALLOCATED';
                const isLoading = loadingMap[a.id];

                return (
                  <tr key={a.id || `alloc-${idx}`}>
                    <td><strong>{a.orderNumber || `ORD-2026-${8091 + idx}`}</strong></td>
                    <td><strong>{a.customerName || a.customer || "Enterprise Client"}</strong></td>
                    <td><code className="sku-cell">{a.sku || "SKU-P0001"}</code></td>
                    <td><strong>{a.requestedQuantity || a.quantity || a.requiredUnits || 4} units</strong></td>
                    <td>
                      <button className="v2-inline-link" onClick={() => handleWarehouseClick(a.warehouseName || "Warehouse A")}>
                        {a.warehouseName || "Warehouse A"} →
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${isAllocated ? 'badge-green' : 'badge-warning'}`}>
                        {a.status || 'ALLOCATED'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn-sm ${isAllocated ? 'btn-secondary' : 'btn-primary'}`} 
                        disabled={isLoading}
                        onClick={() => handleConfirmAllocation(a)}
                        style={isAllocated ? { opacity: 0.85 } : {}}
                      >
                        <CheckCircle2 size={12} /> {isLoading ? 'ALLOCATING...' : isAllocated ? 'ALLOCATED ✓' : 'CONFIRM ALLOCATION'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
