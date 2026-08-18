import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Box, ShoppingBag, Building2, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './GlobalSearchModal.css';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { products, orders, warehouses, exceptions } = useStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = (query || '').toLowerCase().trim();

  const matchedProducts = q ? (products || []).filter(p => {
    const pName = (p.name || p.productName || '').toLowerCase();
    const pSku = (p.sku || '').toLowerCase();
    const pCat = (p.category || '').toLowerCase();
    const pBarcode = String(p.barcode || '').toLowerCase();
    return pName.includes(q) || pSku.includes(q) || pCat.includes(q) || pBarcode.includes(q);
  }).slice(0, 5) : [];

  const matchedOrders = q ? (orders || []).filter(o => 
    (o.orderNumber || o.displayId || o.id || '').toLowerCase().includes(q) || 
    (o.customerName || o.customer || '').toLowerCase().includes(q) ||
    (o.productName || '').toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedWarehouses = q ? (warehouses || []).filter(w => 
    (w.name || '').toLowerCase().includes(q) || 
    (w.region || w.location || '').toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedExceptions = q ? (exceptions || []).filter(e => 
    (e.exceptionCode || e.displayId || e.id || '').toLowerCase().includes(q) || 
    (e.title || e.type || '').toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div key="global-search-backdrop" className="search-backdrop" onClick={onClose}>
        <motion.div 
          key="global-search-modal-box"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.16 }}
          className="search-modal-box"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input Header */}
          <div className="search-input-row">
            <Search size={20} className="search-input-icon" />
            <input 
              type="text"
              placeholder="Global Search (Products, Orders, Warehouses, SKUs, Exceptions)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="global-search-field"
            />
            <button className="search-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Search Results Container */}
          <div className="search-results-container">
            {q && matchedProducts.length === 0 && matchedOrders.length === 0 && matchedWarehouses.length === 0 && matchedExceptions.length === 0 && (
              <div className="no-search-results">
                <Search size={32} className="no-res-icon" />
                <p>No matching inventory, orders, or facilities found for "{query}".</p>
              </div>
            )}

            {/* Products Section */}
            {matchedProducts.length > 0 && (
              <div className="search-section">
                <span className="search-sec-title"><Box size={13} /> PRODUCTS</span>
                {matchedProducts.map(p => (
                  <div key={p.id || p.productId} className="search-res-item" onClick={() => handleSelect('/products')}>
                    <div>
                      <strong>{p.name || p.productName}</strong>
                      <span className="search-res-sub">SKU: {p.sku} • {p.category}</span>
                    </div>
                    <span className="badge badge-green">₹{p.sellingPrice}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Section */}
            {matchedOrders.length > 0 && (
              <div className="search-section">
                <span className="search-sec-title"><ShoppingBag size={13} /> ORDERS</span>
                {matchedOrders.map(o => (
                  <div key={o.id} className="search-res-item" onClick={() => handleSelect('/orders')}>
                    <div>
                      <strong>{o.orderNumber || o.displayId}</strong>
                      <span className="search-res-sub">{o.customerName || o.customer} • {o.warehouseName}</span>
                    </div>
                    <span className="badge badge-normal">{o.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warehouses Section */}
            {matchedWarehouses.length > 0 && (
              <div className="search-section">
                <span className="search-sec-title"><Building2 size={13} /> WAREHOUSES</span>
                {matchedWarehouses.map(w => (
                  <div key={w.id} className="search-res-item" onClick={() => handleSelect('/inventory')}>
                    <div>
                      <strong>{w.name}</strong>
                      <span className="search-res-sub">{w.region || w.location}</span>
                    </div>
                    <span className="badge badge-green">OPERATIONAL</span>
                  </div>
                ))}
              </div>
            )}

            {/* Exceptions Section */}
            {matchedExceptions.length > 0 && (
              <div className="search-section">
                <span className="search-sec-title"><AlertTriangle size={13} /> EXCEPTIONS</span>
                {matchedExceptions.map(e => (
                  <div key={e.id} className="search-res-item" onClick={() => handleSelect('/exceptions')}>
                    <div>
                      <strong>{e.exceptionCode || e.displayId}</strong>
                      <span className="search-res-sub">{e.title}</span>
                    </div>
                    <span className="badge badge-risk">{e.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
