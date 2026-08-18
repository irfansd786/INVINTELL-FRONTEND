import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Scale } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import InventoryReconciliationModal from '../components/InventoryReconciliationModal';
import './Inventory.css';

export default function Inventory() {
  const store = useStore();
  const { inventory, updateInventoryStock } = store;

  const [search, setSearch] = useState('');
  const [whFilter, setWhFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Reconciliation Modal State
  const [reconcileTarget, setReconcileTarget] = useState(null);

  const totalInventoryUnits = (inventory || []).reduce((acc, i) => acc + (i.stockQuantity || i.inventoryLevel || i.total || 0), 0);
  const availableUnits = (inventory || []).reduce((acc, i) => acc + (i.availableQuantity || i.available || i.stockQuantity || i.inventoryLevel || 0), 0);
  const reservedUnits = (inventory || []).reduce((acc, i) => acc + (i.reservedQuantity || i.reserved || 0), 0);
  const lowStockCount = (inventory || []).filter(i => i.status === 'LOW' || (i.stockQuantity || i.inventoryLevel || 100) <= (i.minThreshold || 40)).length;

  const filteredInventory = (inventory || []).filter((inv) => {
    const q = (search || '').toLowerCase().trim();
    const pName = (inv.productName || inv.name || '').toLowerCase();
    const sku = (inv.sku || '').toLowerCase();
    const barcode = (inv.barcode || '').toLowerCase();
    const whName = (inv.warehouseName || '').toLowerCase();

    const matchesSearch = !q || pName.includes(q) || sku.includes(q) || barcode.includes(q) || whName.includes(q);

    // Warehouse Filter Evaluation
    let matchesWh = false;
    if (whFilter === 'ALL') {
      matchesWh = true;
    } else {
      const invWhId = (inv.warehouseId || inv.storeId || '').toUpperCase();
      const targetWh = (whFilter || '').toUpperCase();

      if (invWhId === targetWh) {
        matchesWh = true;
      } else if (targetWh === 'S001' || targetWh.includes('CHI') || targetWh.includes('CHICAGO') || targetWh.includes('WAREHOUSE A')) {
        matchesWh = invWhId === 'S001' || whName.includes('chicago') || whName.includes('warehouse a');
      } else if (targetWh === 'S002' || targetWh.includes('DAL') || targetWh.includes('DALLAS') || targetWh.includes('WAREHOUSE B')) {
        matchesWh = invWhId === 'S002' || whName.includes('dallas') || whName.includes('warehouse b');
      } else if (targetWh === 'S003' || targetWh.includes('LA') || targetWh.includes('LOS ANGELES') || targetWh.includes('WAREHOUSE C')) {
        matchesWh = invWhId === 'S003' || whName.includes('los angeles') || whName.includes('warehouse c');
      } else {
        matchesWh = whName.includes(whFilter.toLowerCase());
      }
    }

    // Status Filter Evaluation
    let matchesStatus = false;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else {
      const itemStatus = (inv.status || 'NORMAL').toUpperCase();
      const currentStock = inv.stockQuantity || inv.inventoryLevel || inv.available || 0;
      const minThresh = inv.minThreshold || 50;

      if (statusFilter === 'NORMAL') {
        matchesStatus = itemStatus === 'NORMAL' || (currentStock > minThresh && currentStock < 400);
      } else if (statusFilter === 'LOW') {
        matchesStatus = itemStatus === 'LOW' || currentStock <= minThresh;
      } else if (statusFilter === 'OVERSTOCK') {
        matchesStatus = itemStatus === 'OVERSTOCK' || currentStock >= 400;
      } else if (statusFilter === 'DEAD STOCK') {
        matchesStatus = itemStatus === 'DEAD STOCK' || itemStatus === 'DEAD_STOCK';
      } else {
        matchesStatus = itemStatus === statusFilter.toUpperCase();
      }
    }

    return matchesSearch && matchesWh && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="inventory-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">MASTER INVENTORY CONTROL</h1>
          <p className="page-subtitle">Monitor stock levels, reservation allocations, and transit balances across all warehouses.</p>
        </div>
      </header>

      {/* 1. INVENTORY SUMMARY KPIs */}
      <section className="kpi-strip-v2 kpi-strip-inventory">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">TOTAL INVENTORY</span>
          <div className="kpi-val">{totalInventoryUnits.toLocaleString()} <span className="kpi-unit">units</span></div>
          <span className="kpi-change text-muted">Across 3 regional hubs</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">AVAILABLE FOR SALE</span>
          <div className="kpi-val text-green">{availableUnits.toLocaleString()} <span className="kpi-unit">units</span></div>
          <span className="kpi-change text-green font-bold">Unreserved stock</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">RESERVED / ALLOCATED</span>
          <div className="kpi-val">{reservedUnits.toLocaleString()} <span className="kpi-unit">units</span></div>
          <span className="kpi-change text-muted">Active order commitments</span>
        </div>

        <div className="kpi-card-v2 card-risk-border">
          <span className="kpi-lbl text-red">LOW STOCK SKUS</span>
          <div className="kpi-val text-red">{lowStockCount} <span className="kpi-unit">SKUs</span></div>
          <span className="kpi-change text-red font-bold">Action recommended</span>
        </div>
      </section>

      {/* 2. TOOLBAR */}
      <div className="inventory-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input 
            type="text"
            placeholder="Search product name, SKU, barcode, or warehouse location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search master inventory by name, SKU, barcode, or warehouse location"
          />
        </div>

        <div className="filter-controls-row">
          <select 
            value={whFilter} 
            onChange={(e) => setWhFilter(e.target.value)} 
            className="top-wh-select"
            aria-label="Filter inventory by warehouse"
          >
            <option value="ALL">ALL WAREHOUSES</option>
            <option value="S001">Warehouse A (Chicago Hub)</option>
            <option value="S002">Warehouse B (Dallas Hub)</option>
            <option value="S003">Warehouse C (Los Angeles Hub)</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="top-wh-select"
            aria-label="Filter inventory by stock status"
          >
            <option value="ALL">ALL STOCK STATUSES</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">LOW STOCK</option>
            <option value="OVERSTOCK">OVERSTOCK</option>
            <option value="DEAD STOCK">DEAD STOCK</option>
          </select>
        </div>
      </div>

      {/* 3. MASTER INVENTORY TABLE */}
      <section className="v2-block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">PRODUCT</th>
                <th scope="col">SKU</th>
                <th scope="col">BARCODE</th>
                <th scope="col">WAREHOUSE HUB</th>
                <th scope="col">AVAILABLE STOCK</th>
                <th scope="col">RESERVED</th>
                <th scope="col">STATUS</th>
                <th scope="col">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((inv, idx) => {
                const stock = inv.stockQuantity || inv.inventoryLevel || inv.available || 120;
                const minT = inv.minThreshold || 50;
                const reserved = inv.reservedQuantity || inv.reserved || Math.round(stock * 0.1);
                const status = inv.status || (stock <= minT ? 'LOW' : stock >= 400 ? 'OVERSTOCK' : 'NORMAL');
                const barcode = inv.barcode || `890100000${(idx + 1).toString().padStart(4, '0')}`;
                const pName = inv.productName || inv.name || 'Product';

                return (
                  <tr key={inv.id || `inv-${idx}`}>
                    <td><strong>{pName}</strong></td>
                    <td className="sku-cell">{inv.sku || `SKU-P000${(idx % 20) + 1}`}</td>
                    <td><code className="barcode-code-cell">{barcode}</code></td>
                    <td>{inv.warehouseName || "Warehouse A (Chicago Hub)"}</td>
                    <td><strong className="text-green">{stock.toLocaleString()} units</strong></td>
                    <td>{reserved} units</td>
                    <td>
                      <span className={`badge ${status === 'LOW' || status === 'OUT_OF_STOCK' ? 'badge-risk' : status === 'OVERSTOCK' || status === 'DEAD STOCK' ? 'badge-warning' : 'badge-green'}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="flex-align-gap-2">
                        <button className="btn-secondary btn-sm" onClick={() => setSelectedProduct(inv)} aria-label={`View details for ${pName}`}>
                          <Eye size={12} /> DETAILS
                        </button>

                        <button className="btn-primary btn-sm" onClick={() => setReconcileTarget(inv)} aria-label={`Reconcile stock for ${pName}`}>
                          <Scale size={12} /> RECONCILE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Inventory Reconciliation Modal */}
      {reconcileTarget && (
        <InventoryReconciliationModal 
          isOpen={!!reconcileTarget}
          onClose={() => setReconcileTarget(null)}
          inventoryItem={reconcileTarget}
          onReconciled={(id, newQty) => updateInventoryStock(id, newQty)}
        />
      )}
    </motion.div>
  );
}
