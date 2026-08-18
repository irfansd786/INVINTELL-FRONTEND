import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowRight, 
  Building2, 
  AlertTriangle, 
  Box, 
  Clock,
  Layers,
  Truck,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ShoppingBag,
  Navigation,
  PackageCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import './Overview.css';

// Custom High-Contrast Tooltip for Revenue Chart
const CustomRevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        color: '#FFFFFF',
        fontSize: '13px'
      }}>
        <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '11px', marginBottom: '4px' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#CBD5E1' }}>Daily Revenue:</span>
          <strong style={{ color: '#4ADE80', fontWeight: 700 }}>
            ${payload[0].value.toLocaleString()}
          </strong>
        </div>
      </div>
    );
  }
  return null;
};

// Custom High-Contrast Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const dotColor = item.payload?.color || item.color || '#16A34A';
    return (
      <div style={{
        backgroundColor: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        color: '#FFFFFF',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          display: 'inline-block',
          flexShrink: 0
        }} />
        <span style={{ color: '#CBD5E1', fontWeight: 500 }}>{item.name}:</span>
        <strong style={{ color: '#F8FAFC', fontWeight: 700 }}>
          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
        </strong>
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const navigate = useNavigate();
  const store = useStore();
  const { orders, inventory, warehouses, exceptions, selectedWarehouseFilter, setSelectedWarehouseFilter } = store;

  const [selectedProduct, setSelectedProduct] = useState(null);

  // Apply Global Warehouse Filter
  const filteredOrders = (orders || []).filter(o => selectedWarehouseFilter === 'ALL' || o.warehouseId === selectedWarehouseFilter || o.warehouseName?.includes(selectedWarehouseFilter));
  const filteredInventory = (inventory || []).filter(i => selectedWarehouseFilter === 'ALL' || i.warehouseId === selectedWarehouseFilter || i.warehouseName?.includes(selectedWarehouseFilter));
  const filteredWarehouses = (warehouses || []).filter(w => selectedWarehouseFilter === 'ALL' || w.id === selectedWarehouseFilter || w.name?.includes(selectedWarehouseFilter));

  // Pipeline stage counts & revenue calculation
  const pendingCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const totalInventoryUnits = filteredInventory.reduce((acc, item) => acc + (item.stockQuantity || item.total || 0), 0) || 54520;
  const todayRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0) || 48250;

  // 7-day revenue trend data
  const revenueTrendData = [
    { day: "Mon", revenue: 38400 },
    { day: "Tue", revenue: 41200 },
    { day: "Wed", revenue: 39800 },
    { day: "Thu", revenue: 44500 },
    { day: "Fri", revenue: 46200 },
    { day: "Sat (Today)", revenue: todayRevenue }
  ];

  // Inventory by status doughnut data
  const inventoryStatusData = [
    { name: 'Available', value: filteredInventory.reduce((acc, i) => acc + (i.stockQuantity || i.available || 0), 0) || 18420, color: '#16A34A' },
    { name: 'Reserved', value: 2410, color: '#111111' },
    { name: 'In Transit', value: 980, color: '#5F6368' },
    { name: 'Damaged', value: 190, color: '#DC2626' }
  ];

  const handleWarehouseClick = (wh) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(wh.id || wh.storeCode || wh.name);
    }
    navigate('/inventory');
  };

  const riskList = store.risks || [];

  const stockoutRiskCount = riskList.filter(r => r.riskType === 'STOCKOUT' || r.category === 'INVENTORY' || r.type === 'STOCKOUT').length || 3;
  const lowStockCount = (inventory || []).filter(i => i.status === 'LOW' || (i.stockQuantity && i.stockQuantity < 50)).length || 4;
  const overstockCount = riskList.filter(r => r.riskType === 'OVERSTOCK' || r.category === 'OVERSTOCK' || r.type === 'OVERSTOCK').length || 3;
  const deadStockCount = riskList.filter(r => r.riskType === 'DEAD_STOCK' || r.category === 'DEAD_STOCK' || r.type === 'DEAD_STOCK').length || 3;
  const expiryRiskCount = riskList.filter(r => r.category === 'EXPIRY' || r.riskType === 'EXPIRY_RISK' || r.type === 'EXPIRY' || r.daysRemaining <= 40).length || 3;

  const pickedCount = (filteredOrders || []).filter(o => o.status === 'PICKING' || o.status === 'PACKED' || o.status === 'DISPATCHED' || o.status === 'FULFILLED' || o.status === 'COMPLETED').length || (store.pickingTasks || []).length || 18;
  const packedCount = (filteredOrders || []).filter(o => o.status === 'PACKED' || o.status === 'DISPATCHED' || o.status === 'FULFILLED' || o.status === 'COMPLETED').length || (store.packingTasks || []).length || 14;
  const fulfilledCount = (filteredOrders || []).filter(o => o.status === 'FULFILLED' || o.status === 'COMPLETED').length || 165;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="overview-page-v2"
    >
      {/* Header */}
      <header className="overview-header-v2">
        <div>
          <span className="welcome-text">Welcome back, Admin </span>
          <h1 className="page-title">OVERVIEW</h1>
        </div>
      </header>

      {/* 1. HORIZONTAL KPI ROW (7 CARDS TOTAL) */}
      <section className="kpi-strip-v2 kpi-strip-overview" aria-label="Key Operational Indicators">
        <div className="kpi-card-v2 card-revenue-featured">
          <span className="kpi-lbl text-green">TODAY'S REVENUE</span>
          <div className="kpi-val text-green">${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <span className="kpi-change text-green font-bold">↑ +14.2% vs yesterday</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/inventory')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/inventory'); } }}
          role="button"
          tabIndex={0}
          aria-label="Total Inventory: view master inventory"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">TOTAL INVENTORY</span>
          <div className="kpi-val">{totalInventoryUnits.toLocaleString()} <span className="kpi-unit">Units</span></div>
          <span className="kpi-change text-green font-bold">↑ 8.6% vs last 7 days</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/orders')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/orders'); } }}
          role="button"
          tabIndex={0}
          aria-label="Today's Orders: view sales orders"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">TODAY'S ORDERS</span>
          <div className="kpi-val">{filteredOrders.length} <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-muted">Daily incoming queue</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/allocation')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/allocation'); } }}
          role="button"
          tabIndex={0}
          aria-label="Pending Allocation: view allocation queue"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">PENDING ALLOCATION</span>
          <div className="kpi-val">{pendingCount} <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-muted">Awaiting allocation</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/picking')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/picking'); } }}
          role="button"
          tabIndex={0}
          aria-label="Orders Picked: view picking tasks"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">ORDERS PICKED</span>
          <div className="kpi-val">{pickedCount} <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-green font-bold">✓ Picking completed</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/packing')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/packing'); } }}
          role="button"
          tabIndex={0}
          aria-label="Orders Packed: view packing tasks"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">ORDERS PACKED</span>
          <div className="kpi-val">{packedCount} <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-green font-bold">✓ Packing verified</span>
        </div>

        <div 
          className="kpi-card-v2" 
          onClick={() => navigate('/dispatch')} 
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/dispatch'); } }}
          role="button"
          tabIndex={0}
          aria-label="Orders Fulfilled: view dispatch queue"
          style={{ cursor: 'pointer' }}
        >
          <span className="kpi-lbl">ORDERS FULFILLED</span>
          <div className="kpi-val">{fulfilledCount} <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-green font-bold">✓ 94.2% fulfillment</span>
        </div>
      </section>

      {/* 2. REVENUE TREND, INVENTORY STATUS & RISKS */}
      <div className="overview-three-col">
        {/* REVENUE ACCELERATION CHART */}
        <section className="v2-block" aria-labelledby="rev-chart-heading">
          <div className="block-header">
            <div>
              <h2 id="rev-chart-heading" className="v2-section-title">TODAY'S REVENUE TRAJECTORY</h2>
              <span className="v2-section-sub">7-day gross order revenue velocity.</span>
            </div>
            <strong className="text-green font-bold">${todayRevenue.toLocaleString()}</strong>
          </div>

          <div style={{ width: '100%', height: 180, minHeight: 180, paddingTop: '10px' }}>
            <p className="sr-only">Revenue graph showing 7-day trend from $38,400 on Monday to ${todayRevenue.toLocaleString()} today.</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7E5" vertical={false} />
                <XAxis dataKey="day" stroke="#5F6368" fontSize={11} tickLine={false} />
                <YAxis stroke="#5F6368" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* INVENTORY STATUS */}
        <section className="v2-block" aria-labelledby="inv-status-heading">
          <div className="block-header">
            <h2 id="inv-status-heading" className="v2-section-title">INVENTORY BY STATUS</h2>
            <span className="v2-section-sub">Stock distribution across operational states.</span>
          </div>

          <div className="doughnut-chart-wrapper">
            <p className="sr-only">Inventory status chart: Available 18,420, Reserved 2,410, In Transit 980, Damaged 190.</p>
            <div style={{ width: '100%', height: 180, minHeight: 180 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180}>
                <PieChart>
                  <Pie 
                    data={inventoryStatusData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={45} 
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {inventoryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend-grid">
              {inventoryStatusData.map((item, i) => (
                <div key={i} className="legend-item" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-lbl">{item.name}: <strong>{item.value.toLocaleString()}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TOP RISKS SUMMARY PANEL */}
        <section className="v2-block" aria-labelledby="top-risks-heading">
          <div className="block-header">
            <h2 id="top-risks-heading" className="v2-section-title">TOP RISKS</h2>
            <span className="v2-section-sub">Operational risks requiring manager review.</span>
          </div>

          <div className="top-risks-summary-list">
            <div 
              className="risk-summary-row risk-row-red" 
              onClick={() => navigate('/risks')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/risks'); } }}
              role="button"
              tabIndex={0}
              aria-label={`Stockout Risk: ${stockoutRiskCount} Products`}
              style={{ cursor: 'pointer' }}
            >
              <span className="rs-title">Stockout Risk</span>
              <strong className="rs-count text-red">{stockoutRiskCount} Products</strong>
            </div>

            <div 
              className="risk-summary-row" 
              onClick={() => navigate('/risks')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/risks'); } }}
              role="button"
              tabIndex={0}
              aria-label={`Low Stock Alert: ${lowStockCount} Products`}
              style={{ cursor: 'pointer' }}
            >
              <span className="rs-title">Low Stock Alert</span>
              <strong className="rs-count text-orange">{lowStockCount} Products</strong>
            </div>

            <div 
              className="risk-summary-row" 
              onClick={() => navigate('/risks')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/risks'); } }}
              role="button"
              tabIndex={0}
              aria-label={`Overstock Surplus: ${overstockCount} Products`}
              style={{ cursor: 'pointer' }}
            >
              <span className="rs-title">Overstock Surplus</span>
              <strong className="rs-count">{overstockCount} Products</strong>
            </div>

            <div 
              className="risk-summary-row" 
              onClick={() => navigate('/risks')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/risks'); } }}
              role="button"
              tabIndex={0}
              aria-label={`Dead Stock Exposure: ${deadStockCount} Products`}
              style={{ cursor: 'pointer' }}
            >
              <span className="rs-title">Dead Stock Exposure</span>
              <strong className="rs-count text-red">{deadStockCount} Products</strong>
            </div>

            <div 
              className="risk-summary-row" 
              onClick={() => navigate('/risks')} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/risks'); } }}
              role="button"
              tabIndex={0}
              aria-label={`Expiry Risk: ${expiryRiskCount} Batches`}
              style={{ cursor: 'pointer' }}
            >
              <span className="rs-title">Expiry Risk</span>
              <strong className="rs-count text-purple">{expiryRiskCount} Batches</strong>
            </div>
          </div>

          <button className="v2-inline-link link-mt" onClick={() => navigate('/risks')} aria-label="View all risk details">
            View all risks →
          </button>
        </section>
      </div>

      {/* 3. WAREHOUSE PERFORMANCE TABLE (3 WAREHOUSES - CLICK NAVIGATES TO INVENTORY) */}
      <section className="v2-block" aria-labelledby="wh-perf-heading">
        <div className="block-header">
          <div>
            <h2 id="wh-perf-heading" className="v2-section-title">WAREHOUSE PERFORMANCE & REVENUE ATTRIBUTION</h2>
            <span className="v2-section-sub">Live capacity utilization, active orders, and daily revenue per regional hub (Click to view Inventory).</span>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">WAREHOUSE</th>
                <th scope="col">INVENTORY</th>
                <th scope="col">ACTIVE ORDERS</th>
                <th scope="col">REVENUE TODAY</th>
                <th scope="col">CAPACITY UTILIZATION</th>
                <th scope="col">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.slice(0, 3).map((wh) => {
                const whRevenue = wh.id === 'wh-chi-01' || wh.storeCode === 'S001' ? 24500 : wh.id === 'wh-dal-02' || wh.storeCode === 'S002' ? 15850 : 7900;
                const whStock = wh.currentStock || (wh.id === 'wh-chi-01' ? 18420 : wh.id === 'wh-dal-02' ? 14200 : 21900);
                const whOrders = wh.activeOrders || (wh.id === 'wh-chi-01' ? 42 : wh.id === 'wh-dal-02' ? 28 : 56);
                const util = Math.round((whStock / (wh.totalCapacity || 50000)) * 100);

                return (
                  <tr key={wh.id} onClick={() => handleWarehouseClick(wh)} style={{ cursor: 'pointer' }} title="Click to view Inventory for this warehouse">
                    <td>
                      <div className="flex-align-gap-2">
                        <Building2 size={16} className="text-muted" />
                        <div>
                          <strong>{wh.name}</strong>
                          <div className="text-muted font-small">{wh.region || wh.address}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{whStock.toLocaleString()}</strong> units</td>
                    <td>{whOrders} active orders</td>
                    <td><strong className="text-green">${whRevenue.toLocaleString()}</strong></td>
                    <td>
                      <div className="cap-progress-cell">
                        <span>{util}%</span>
                        <div className="wh-progress-track">
                          <div className={`wh-progress-fill ${util > 85 ? 'fill-warning' : 'fill-green'}`} style={{ width: `${util}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-green">
                        OPERATIONAL
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. OPERATIONS AT A GLANCE */}
      <section className="v2-block">
        <div className="block-header">
          <div>
            <h2 className="v2-section-title">OPERATIONS AT A GLANCE</h2>
            <span className="v2-section-sub">Direct operational shortcuts across fulfillment stages.</span>
          </div>
        </div>

        <div className="operations-glance-grid">
          <div className="glance-card" onClick={() => navigate('/orders')}>
            <div className="glance-top">
              <ShoppingBag size={18} className="text-dark" />
              <span className="glance-title">ORDERS</span>
            </div>
            <strong className="glance-metric">{filteredOrders.length} Active</strong>
            <span className="glance-link">View orders →</span>
          </div>

          <div className="glance-card" onClick={() => navigate('/allocation')}>
            <div className="glance-top">
              <Layers size={18} className="text-dark" />
              <span className="glance-title">ALLOCATION</span>
            </div>
            <strong className="glance-metric">{pendingCount} Pending</strong>
            <span className="glance-link">Manage allocations →</span>
          </div>

          <div className="glance-card" onClick={() => navigate('/picking')}>
            <div className="glance-top">
              <PackageCheck size={18} className="text-dark" />
              <span className="glance-title">PICKING</span>
            </div>
            <strong className="glance-metric">4 Tasks Active</strong>
            <span className="glance-link">View picking queue →</span>
          </div>

          <div className="glance-card" onClick={() => navigate('/packing')}>
            <div className="glance-top">
              <Box size={18} className="text-dark" />
              <span className="glance-title">PACKING</span>
            </div>
            <strong className="glance-metric">3 In Packing</strong>
            <span className="glance-link">View packing line →</span>
          </div>

          <div className="glance-card" onClick={() => navigate('/dispatch')}>
            <div className="glance-top">
              <Truck size={18} className="text-dark" />
              <span className="glance-title">DISPATCH</span>
            </div>
            <strong className="glance-metric">3 Shipments</strong>
            <span className="glance-link">Dispatch center →</span>
          </div>

          <div className="glance-card" onClick={() => navigate('/exceptions')}>
            <div className="glance-top">
              <AlertTriangle size={18} className="text-dark" />
              <span className="glance-title">EXCEPTIONS</span>
            </div>
            <strong className="glance-metric">3 Open Items</strong>
            <span className="glance-link">Resolve exceptions →</span>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </motion.div>
  );
}
