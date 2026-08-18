import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Box, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './Warehouses.css';

export default function Warehouses() {
  const navigate = useNavigate();
  const store = useStore();
  const { warehouses, setSelectedWarehouseFilter } = store;

  // Restrict to 3 warehouses
  const threeWarehouses = (warehouses || []).slice(0, 3);

  const handleWarehouseClick = (wh) => {
    if (setSelectedWarehouseFilter) {
      setSelectedWarehouseFilter(wh.id || wh.storeCode || wh.name);
    }
    navigate('/inventory');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="warehouses-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">REGIONAL WAREHOUSE NETWORK (3 HUBS)</h1>
          <p className="page-subtitle">Monitor capacity utilization, fulfillment velocity, and stock distribution across regional facilities. Click any hub to view inventory.</p>
        </div>
      </header>

      {/* 1. NETWORK FACILITY CARDS GRID - EXACTLY 3 WAREHOUSES */}
      <div className="wh-grid-v2">
        {threeWarehouses.map((wh) => {
          const stockVal = wh.currentStock || (wh.id === 'wh-chi-01' ? 18420 : wh.id === 'wh-dal-02' ? 14200 : 21900);
          const ordersVal = wh.activeOrders || (wh.id === 'wh-chi-01' ? 42 : wh.id === 'wh-dal-02' ? 28 : 56);
          const capacity = wh.totalCapacity || 50000;
          const levelPercent = Math.round((stockVal / capacity) * 100);

          return (
            <div 
              key={wh.id} 
              className="wh-card-v2" 
              onClick={() => handleWarehouseClick(wh)} 
              style={{ cursor: 'pointer' }}
              title="Click to view Inventory for this warehouse"
            >
              <div className="wh-card-hdr">
                <div>
                  <span className="wh-code-tag">{wh.storeCode || wh.code || "HUB"}</span>
                  <h3 className="wh-name-title">{wh.name}</h3>
                  <span className="wh-loc-text">{wh.region || wh.address}</span>
                </div>
                <span className="badge badge-green">
                  OPERATIONAL
                </span>
              </div>

              <div className="wh-metrics-list">
                <div className="wh-m-row">
                  <span><Box size={14} className="text-muted" /> Total Inventory:</span>
                  <strong>{stockVal.toLocaleString()} units</strong>
                </div>

                <div className="wh-m-row">
                  <span><ShoppingBag size={14} className="text-muted" /> Active Orders:</span>
                  <strong>{ordersVal} orders</strong>
                </div>

                <div className="wh-m-row">
                  <span>Capacity Utilization:</span>
                  <strong className={levelPercent > 85 ? "text-red" : "text-green"}>{levelPercent}%</strong>
                </div>

                <div className="wh-progress-track mt-2">
                  <div className={`wh-progress-fill ${levelPercent > 85 ? 'fill-warning' : 'fill-green'}`} style={{ width: `${levelPercent}%` }}></div>
                </div>
              </div>

              <div className="wh-card-ftr">
                <span className="v2-inline-link">View Facility Inventory <ArrowRight size={14} /></span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
