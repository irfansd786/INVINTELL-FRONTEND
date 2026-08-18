import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import './Today.css';

export default function Today() {
  const store = useStore();
  const { products, inventory } = store;

  const [filter, setFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isLowStock = (p) => {
    const pId = p.id || p.productId;
    const pInvs = (inventory || []).filter(inv => 
      inv.productId === pId || 
      inv.productId === p.productId ||
      inv.sku === p.sku ||
      inv.product?.productId === pId ||
      inv.product?.id === pId
    );
    const totalRemaining = pInvs.reduce((acc, inv) => acc + (inv.available || inv.availableQuantity || inv.stockQuantity || inv.inventoryLevel || 0), 0);
    const hasLowInv = pInvs.some(inv => inv.status === 'LOW' || inv.status === 'OUT_OF_STOCK');
    const pStatus = (p.status || '').toUpperCase();
    return pStatus === 'LOW' || pStatus === 'OUT_OF_STOCK' || hasLowInv || (totalRemaining > 0 && totalRemaining < 50) || (p.stockQuantity > 0 && p.stockQuantity < 50);
  };

  const isSlowMoving = (p) => {
    const pId = p.id || p.productId;
    const pInvs = (inventory || []).filter(inv => 
      inv.productId === pId || 
      inv.productId === p.productId ||
      inv.sku === p.sku ||
      inv.product?.productId === pId ||
      inv.product?.id === pId
    );
    const hasSlowInv = pInvs.some(inv => 
      inv.status === 'OVERSTOCK' || 
      inv.status === 'DEAD STOCK' || 
      inv.status === 'DEAD_STOCK' || 
      (inv.stockQuantity || inv.inventoryLevel || 0) >= 400
    );
    const pStatus = (p.status || '').toUpperCase();
    return (
      pStatus === 'OVERSTOCK' || 
      pStatus === 'DEAD STOCK' || 
      pStatus === 'DEAD_STOCK' || 
      hasSlowInv || 
      (p.stockQuantity && p.stockQuantity >= 400) || 
      (p.unitsSold !== undefined && p.unitsSold < 30) ||
      (p.avgDailyDemand !== undefined && p.avgDailyDemand <= 3)
    );
  };

  const lowCount = (products || []).filter(isLowStock).length;
  const slowCount = (products || []).filter(isSlowMoving).length;

  const filteredProducts = (products || []).filter((p) => {
    if (filter === 'LOW') return isLowStock(p);
    if (filter === 'SLOW') return isSlowMoving(p);
    return true;
  });

  // Table rows combining sales & stock remaining metrics
  const todayMovementData = filteredProducts.map((p) => {
    const pId = p.id || p.productId;
    const pInvs = (inventory || []).filter(inv => 
      inv.productId === pId || 
      inv.productId === p.productId ||
      inv.sku === p.sku ||
      inv.product?.productId === pId ||
      inv.product?.id === pId
    );
    const totalRemaining = pInvs.reduce((acc, inv) => acc + (inv.available || inv.availableQuantity || inv.stockQuantity || inv.inventoryLevel || 0), 0) || p.stockQuantity || p.stock || 240;
    const soldToday = p.unitsSold !== undefined && p.unitsSold < 200 ? p.unitsSold : Math.round((p.avgDailyDemand || 20) * 1.2);
    const primaryWh = pInvs[0]?.warehouseName || p.warehouse || "Warehouse A";

    let displayStatus = p.status || "NORMAL";
    if (isLowStock(p)) displayStatus = "LOW";
    else if (p.status === 'DEAD STOCK' || p.status === 'DEAD_STOCK' || pInvs.some(i => i.status === 'DEAD STOCK' || i.status === 'DEAD_STOCK')) displayStatus = "DEAD STOCK";
    else if (p.status === 'OVERSTOCK' || p.stockQuantity >= 400 || pInvs.some(i => i.status === 'OVERSTOCK' || (i.stockQuantity || 0) >= 400)) displayStatus = "OVERSTOCK";

    return {
      product: p,
      sku: p.sku || "SKU-P0001",
      warehouseName: primaryWh,
      soldToday,
      remaining: totalRemaining,
      status: displayStatus
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="today-page-v2"
    >
      {/* Header */}
      <header className="today-header-v2">
        <div>
          <h1 className="page-title">TODAY</h1>
          <p className="page-subtitle">Today's warehouse activity and inventory movement.</p>
        </div>
      </header>

      {/* 1. TODAY KPI CARDS (4 Cards) */}
      <section className="kpi-strip-v2 kpi-strip-today">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">SALES TODAY</span>
          <div className="kpi-val">2,847 <span className="kpi-unit">Units</span></div>
          <span className="kpi-change text-green font-bold">↑ Outbound movement</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">ORDERS TODAY</span>
          <div className="kpi-val">1,426 <span className="kpi-unit">Orders</span></div>
          <span className="kpi-change text-muted">Active queue volume</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">STOCK RECEIVED</span>
          <div className="kpi-val">3,214 <span className="kpi-unit">Units</span></div>
          <span className="kpi-change text-muted">Inbound arrivals</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">STOCK AVAILABLE</span>
          <div className="kpi-val">18,420 <span className="kpi-unit">Units</span></div>
          <span className="kpi-change text-green font-bold">Ready for orders</span>
        </div>
      </section>

      {/* 2. INSIGHTS SUMMARY BAR */}
      <section className="today-insights-bar">
        <div className="insight-card">
          <span className="ic-lbl text-green">FAST MOVING TODAY</span>
          <strong className="ic-val">Product A — Industrial Bearings</strong>
          <span className="ic-sub">126 units sold in past 12 hours</span>
        </div>

        <div className="insight-card card-risk-border">
          <span className="ic-lbl text-red">LOW STOCK ALERT</span>
          <strong className="ic-val">Toys Item P0003 (SKU-P0003)</strong>
          <span className="ic-sub text-red">32 units remaining across all hubs</span>
        </div>

        <div className="insight-card">
          <span className="ic-lbl">SLOW MOVING EXPOSURE</span>
          <strong className="ic-val">Electronics Item P0005</strong>
          <span className="ic-sub">2 units sold today • 180 held</span>
        </div>
      </section>

      {/* 3. MAIN TODAY INVENTORY MOVEMENT TABLE */}
      <section className="v2-block">
        <div className="table-header-row">
          <div>
            <h2 className="v2-section-title">TODAY'S INVENTORY MOVEMENT LEDGER</h2>
            <span className="v2-section-sub">Detailed sales and stock remaining per product line.</span>
          </div>

          <div className="segmented-filter">
            <button 
              className={`segmented-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              ALL <span className="filter-count">{products.length}</span>
            </button>
            <button 
              className={`segmented-btn ${filter === 'LOW' ? 'active' : ''}`}
              onClick={() => setFilter('LOW')}
            >
              LOW STOCK <span className="filter-count filter-count-red">{lowCount}</span>
            </button>
            <button 
              className={`segmented-btn ${filter === 'SLOW' ? 'active' : ''}`}
              onClick={() => setFilter('SLOW')}
            >
              SLOW MOVING <span className="filter-count">{slowCount}</span>
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>SOLD TODAY</th>
                <th>REMAINING STOCK</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {todayMovementData.map((row, idx) => (
                <tr key={row.product.id || row.product.productId || `today-${idx}`} onClick={() => setSelectedProduct(row.product)}>
                  <td><strong>{row.product.name || row.product.productName}</strong></td>
                  <td className="sku-cell">{row.sku}</td>
                  <td>{row.warehouseName}</td>
                  <td><strong>{row.soldToday} units</strong></td>
                  <td><strong className={row.remaining < 50 ? "text-red" : ""}>{row.remaining} units</strong></td>
                  <td>
                    <span className={`badge ${row.status === 'LOW' ? 'badge-risk' : row.status === 'OVERSTOCK' ? 'badge-warning' : row.status === 'DEAD STOCK' ? 'badge-dark' : 'badge-green'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </motion.div>
  );
}
