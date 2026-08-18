import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import OrderDetailModal from '../components/OrderDetailModal';
import './Orders.css';

export default function Orders() {
  const store = useStore();
  const { orders } = store;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = (orders || []).filter((o, idx) => {
    const q = (search || '').toLowerCase();
    const orderNum = (o.orderNumber || o.displayId || o.id || '').toLowerCase();
    const cust = (o.customerName || o.customer || '').toLowerCase();
    const whName = (o.warehouseName || '').toLowerCase();
    const prodName = (o.productName || '').toLowerCase();
    const sku = (o.sku || '').toLowerCase();

    const matchesSearch = 
      orderNum.includes(q) ||
      cust.includes(q) ||
      whName.includes(q) ||
      prodName.includes(q) ||
      sku.includes(q);

    const orderPriority = o.priority || (idx % 3 === 0 ? 'URGENT' : idx % 3 === 1 ? 'HIGH' : 'STANDARD');
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter || (statusFilter === 'ALLOCATED' && (o.status === 'ALLOCATED' || o.status === 'FULLY ALLOCATED'));
    const matchesPriority = priorityFilter === 'ALL' || orderPriority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalCount = (orders || []).length;
  const pendingCount = (orders || []).filter(o => o.status === 'PENDING').length;
  const urgentCount = (orders || []).filter(o => o.priority === 'URGENT' || o.status === 'PENDING').length;
  const inFulfillmentCount = (orders || []).filter(o => o.status === 'ALLOCATED' || o.status === 'PICKING' || o.status === 'PACKED').length;
  const fulfilledCount = (orders || []).filter(o => o.status === 'FULFILLED' || o.status === 'DISPATCHED').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="orders-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">ORDER MANAGEMENT CENTER</h1>
          <p className="page-subtitle">Manage and monitor enterprise order fulfillment across regional warehouse hubs.</p>
        </div>
      </header>

      {/* 1. ORDER SUMMARY KPIs */}
      <section className="kpi-strip-v2 kpi-strip-orders">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">TOTAL ORDERS</span>
          <div className="kpi-val">{totalCount}</div>
          <span className="kpi-change text-muted">Active master ledger</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">PENDING ALLOCATION</span>
          <div className="kpi-val">{pendingCount}</div>
          <span className="kpi-change text-muted">Awaiting stock match</span>
        </div>

        <div className="kpi-card-v2 card-risk-border">
          <span className="kpi-lbl text-red">HIGH PRIORITY QUEUE</span>
          <div className="kpi-val text-red">{urgentCount}</div>
          <span className="kpi-change text-red font-bold">Fast-track SLA</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">IN FULFILLMENT</span>
          <div className="kpi-val">{inFulfillmentCount}</div>
          <span className="kpi-change text-green font-bold">Picking/Packing/Dispatch</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">FULFILLED / DISPATCHED</span>
          <div className="kpi-val text-green">{fulfilledCount}</div>
          <span className="kpi-change text-green font-bold">✓ Delivered / In transit</span>
        </div>
      </section>

      {/* 2. TOOLBAR & FILTERS */}
      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search order ID, customer name, SKU, or warehouse hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls-row">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="top-wh-select"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="PENDING">PENDING</option>
            <option value="ALLOCATED">ALLOCATED</option>
            <option value="PICKING">PICKING</option>
            <option value="PACKED">PACKED</option>
            <option value="DISPATCHED">DISPATCHED</option>
            <option value="FULFILLED">FULFILLED</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="top-wh-select"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="URGENT">URGENT</option>
            <option value="HIGH">HIGH</option>
            <option value="STANDARD">STANDARD</option>
          </select>
        </div>
      </div>

      {/* 3. MAIN ORDERS TABLE */}
      <section className="v2-block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ORDER NUMBER</th>
                <th>CUSTOMER & PRODUCT SKU</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>ORDER VALUE & UNITS</th>
                <th>PRIORITY</th>
                <th>FULFILLMENT STATUS</th>
                <th>CREATED TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, idx) => (
                <tr key={o.id || `ord-${idx}`} onClick={() => setSelectedOrder(o)}>
                  <td><strong>{o.orderNumber || o.displayId || `ORD-2026-${8091 + idx}`}</strong></td>
                  <td>
                    <strong>{o.customerName || o.customer || "Enterprise Customer"}</strong>
                    <div className="product-sku-text">
                      {o.productName || "Industrial Component"} <code className="sku-code">{o.sku || "SKU-P0001"}</code>
                    </div>
                  </td>
                  <td>{o.warehouseName || "Warehouse A"}</td>
                  <td>
                    <strong>₹{(o.totalValue || 4850).toLocaleString()}</strong>
                    <div className="font-small text-muted">{o.items || o.totalItems || 10} units</div>
                  </td>
                  <td>
                    <span className={`badge ${o.priority === 'URGENT' ? 'badge-risk' : o.priority === 'HIGH' ? 'badge-warning' : 'badge-normal'}`}>
                      {o.priority || (idx % 3 === 0 ? "URGENT" : "STANDARD")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${o.status === 'FULFILLED' || o.status === 'DISPATCHED' ? 'badge-green' : o.status === 'PENDING' ? 'badge-warning' : 'badge-normal'}`}>
                      {o.status || "PENDING"}
                    </span>
                  </td>
                  <td className="sku-cell">{o.createdAt || "2026-08-16 09:30"}</td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}>
                      <Eye size={12} /> DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </motion.div>
  );
}
