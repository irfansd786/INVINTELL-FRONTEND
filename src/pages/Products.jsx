import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Upload, Download } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import ProductDetailModal from '../components/ProductDetailModal';
import BulkImportModal from '../components/BulkImportModal';
import './Products.css';

export default function Products() {
  const store = useStore();
  const { products, inventory } = store;

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const filteredProducts = (products || []).filter((p) => {
    const q = (search || '').toLowerCase();
    const pName = (p.name || p.productName || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();

    const matchesSearch = 
      pName.includes(q) ||
      sku.includes(q) ||
      cat.includes(q);

    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleExportCSV = () => {
    let csv = 'ProductID,Name,Category,SKU,Price,Status\n';
    filteredProducts.forEach(p => {
      csv += `"${p.id || p.productId}","${p.name || p.productName}","${p.category}","${p.sku}",${p.price || 0},"${p.status || 'NORMAL'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invintell_products_export.csv';
    a.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="products-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">ENTERPRISE PRODUCT CATALOG</h1>
          <p className="page-subtitle">View master product catalog, category classifications, and multi-facility stock distribution.</p>
        </div>

        <div className="flex-align-gap-2">
          <button className="btn-secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={14} /> Bulk Import CSV
          </button>
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls-row">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="top-wh-select">
            <option value="ALL">ALL CATEGORIES</option>
            <option value="Groceries">Groceries</option>
            <option value="Electronics">Electronics</option>
            <option value="Toys">Toys</option>
            <option value="Clothing">Clothing</option>
            <option value="Furniture">Furniture</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="top-wh-select">
            <option value="ALL">ALL STATUSES</option>
            <option value="NORMAL">NORMAL</option>
            <option value="LOW">LOW STOCK</option>
            <option value="OVERSTOCK">OVERSTOCK</option>
            <option value="DEAD STOCK">DEAD STOCK</option>
          </select>
        </div>
      </div>

      {/* Master Products Table */}
      <section className="v2-block">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT NAME</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>PRIMARY WAREHOUSE</th>
                <th>TOTAL STOCK</th>
                <th>AVG DAILY DEMAND</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => {
                const pInvs = (inventory || []).filter(inv => inv.productId === (p.id || p.productId));
                const totalStock = pInvs.reduce((acc, inv) => acc + (inv.currentStock || inv.inventoryLevel || 0), 0) || p.stockQuantity || p.stock || 240;
                const primaryWh = pInvs[0]?.warehouseName || p.warehouse || "Warehouse A";

                return (
                  <tr key={p.id || p.productId || `prod-${idx}`} onClick={() => setSelectedProduct(p)}>
                    <td><strong>{p.name || p.productName || "Industrial Product"}</strong></td>
                    <td className="sku-cell">{p.sku || "SKU-N/A"}</td>
                    <td>{p.category || "General"}</td>
                    <td>{primaryWh}</td>
                    <td><strong className={totalStock < 50 ? "text-red" : ""}>{totalStock} units</strong></td>
                    <td>{p.avgDailyDemand || 20} units/day</td>
                    <td>
                      <span className={`badge ${p.status === 'LOW' ? 'badge-risk' : p.status === 'OVERSTOCK' ? 'badge-warning' : 'badge-green'}`}>
                        {p.status || "NORMAL"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}>
                        <Eye size={12} /> DETAILS
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {/* Bulk Import CSV Modal */}
      <BulkImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => window.location.reload()}
      />
    </motion.div>
  );
}
