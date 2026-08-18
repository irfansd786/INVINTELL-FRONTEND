import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { calculateReorderRecommendation } from '../services/intelligenceEngine';
import './Suppliers.css';

export default function Suppliers() {
  const store = useStore();
  const { suppliers, products, inventory } = store;
  const [search, setSearch] = useState('');

  const procurementTableData = (products || []).map(p => {
    const rec = calculateReorderRecommendation(p, inventory) || { currentStock: 0, forecastDemand: 0, recommendedQty: 0 };
    const supplier = (suppliers || []).find(s => s.productsSupplied?.includes(p.name)) || suppliers?.[0] || { name: "Apex Supply Co", reliabilityScore: "98%", leadTimeDays: 3 };

    return {
      product: p,
      rec,
      supplier
    };
  });

  const filteredData = procurementTableData.filter(d => {
    const q = (search || '').toLowerCase();
    const pName = (d.product?.name || d.product?.productName || '').toLowerCase();
    const pSku = (d.product?.sku || '').toLowerCase();
    const sName = (d.supplier?.name || '').toLowerCase();

    return (
      pName.includes(q) ||
      pSku.includes(q) ||
      sName.includes(q)
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="suppliers-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">SUPPLIER DIRECTORY & PROCUREMENT VISIBILITY</h1>
          <p className="page-subtitle">Vendor lead time tracking and procurement replenishment planning.</p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="suppliers-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search product, SKU, or supplier vendor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Procurement Table */}
      <section className="v2-block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT NAME</th>
                <th>SKU</th>
                <th>PRIMARY VENDOR SUPPLIER</th>
                <th>VENDOR LEAD TIME</th>
                <th>CURRENT STOCK</th>
                <th>7D DEMAND FORECAST</th>
                <th>RECOMMENDED REORDER</th>
                <th>PROCUREMENT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={row.product.id || row.product.productId || `supp-${idx}`}>
                  <td><strong>{row.product.name || row.product.productName}</strong></td>
                  <td className="sku-cell">{row.product.sku || "SKU-N/A"}</td>
                  <td>
                    <strong>{row.supplier.name}</strong>
                    <small className="product-sku-text">Reliability: {row.supplier.reliabilityScore}</small>
                  </td>
                  <td><strong>{row.supplier.leadTimeDays} days</strong></td>
                  <td>{row.rec.currentStock || row.product.stockQuantity || 240} units</td>
                  <td>{row.rec.forecastDemand || 120} units</td>
                  <td>
                    {row.rec.recommendedQty > 0 ? (
                      <strong className="text-red">+{row.rec.recommendedQty} units</strong>
                    ) : (
                      <span className="text-muted">0 units</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${row.rec.recommendedQty > 0 ? 'badge-risk' : 'badge-green'}`}>
                      {row.rec.recommendedQty > 0 ? 'REORDER REQUIRED' : 'STABLE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
