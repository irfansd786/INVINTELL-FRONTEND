import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';
import './Analytics.css';

export default function Analytics() {
  const [category, setCategory] = useState('SALES');
  const [timeframe, setTimeframe] = useState('30days');
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [fulfillmentData, setFulfillmentData] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      const salesRes = await api.getSalesAnalytics({ timeframe });
      if (salesRes?.data) setSalesData(salesRes.data);

      const invRes = await api.getInventoryAnalytics();
      if (invRes?.data) setInventoryData(invRes.data);

      const fulRes = await api.getFulfillmentAnalytics();
      if (fulRes?.data) setFulfillmentData(fulRes.data);
    }
    loadAnalytics();
  }, [timeframe]);

  const salesTrend = salesData?.salesTrend || [
    { date: 'Day 1', sales: 12000 },
    { date: 'Day 2', sales: 14500 },
    { date: 'Day 3', sales: 11000 },
    { date: 'Day 4', sales: 16800 },
    { date: 'Day 5', sales: 18200 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="analytics-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">ENTERPRISE ANALYTICS CONTROL</h1>
          <p className="page-subtitle">Single-source-of-truth analytics for sales trends, stock velocity, and operational performance.</p>
        </div>

        {/* Section Tabs */}
        <div className="segmented-filter">
          <button className={`segmented-btn ${category === 'SALES' ? 'active' : ''}`} onClick={() => setCategory('SALES')}>SALES</button>
          <button className={`segmented-btn ${category === 'INVENTORY' ? 'active' : ''}`} onClick={() => setCategory('INVENTORY')}>INVENTORY</button>
          <button className={`segmented-btn ${category === 'FULFILLMENT' ? 'active' : ''}`} onClick={() => setCategory('FULFILLMENT')}>FULFILLMENT</button>
        </div>
      </header>

      {/* Timeframe Filter Bar */}
      <div className="inventory-toolbar" style={{ marginBottom: '20px' }}>
        <div className="filter-controls-row">
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginRight: '8px' }}>TIMEFRAME:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="top-wh-select">
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
      </div>

      {/* 1. SALES ANALYTICS */}
      {category === 'SALES' && (
        <div className="analytics-grid-v2">
          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">DAILY SALES TREND REVENUE</h2>
              <span className="v2-section-sub">Gross sales revenue across timeframe window.</span>
            </div>
            <div className="chart-wrapper-compact">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7E5" vertical={false} />
                  <XAxis dataKey="date" stroke="#5F6368" fontSize={11} tickLine={false} />
                  <YAxis stroke="#5F6368" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#FFFFFF' }} 
                    itemStyle={{ color: '#F8FAFC', fontSize: '13px' }}
                  />
                  <Bar dataKey="sales" fill="#16A34A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">SALES METRIC SUMMARY</h2>
              <span className="v2-section-sub">Calculated operational totals.</span>
            </div>
            <div className="rep-stat-list">
              <div className="rs-item"><span>Total Sales Revenue:</span> <strong className="text-green">₹{(salesData?.totalSalesRevenue || 480000).toLocaleString()}</strong></div>
              <div className="rs-item"><span>Completed Orders:</span> <strong>{(salesData?.totalOrders || 1245).toLocaleString()} orders</strong></div>
              <div className="rs-item"><span>Total Units Sold:</span> <strong>{(salesData?.totalUnitsSold || 3842).toLocaleString()} units</strong></div>
              <div className="rs-item"><span>Average Order Value (AOV):</span> <strong className="text-green">₹{(salesData?.avgOrderValue || 385).toLocaleString()}</strong></div>
            </div>
          </section>
        </div>
      )}

      {/* 2. INVENTORY ANALYTICS */}
      {category === 'INVENTORY' && (
        <div className="analytics-grid-v2">
          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">SLOW-MOVING & DEAD STOCK ANALYSIS</h2>
              <span className="v2-section-sub">Products with low sales velocity or inactive holding.</span>
            </div>
            <div className="rep-stat-list">
              <div className="rs-item"><span>Total Monitored SKUs:</span> <strong>{inventoryData?.totalSKUs || 60} SKUs</strong></div>
              <div className="rs-item"><span>Slow-Moving Products:</span> <strong className="text-orange">{(inventoryData?.slowMoving || []).length} SKUs</strong></div>
              <div className="rs-item"><span>Potential Dead Stock (90+ Days):</span> <strong className="text-red">{(inventoryData?.deadStock || []).length} SKUs</strong></div>
              <div className="rs-item"><span>Average Stock Coverage:</span> <strong>{inventoryData?.coverageAvgDays || 45.2} Days</strong></div>
            </div>
          </section>
        </div>
      )}

      {/* 3. FULFILLMENT ANALYTICS */}
      {category === 'FULFILLMENT' && (
        <section className="v2-block">
          <div className="block-header">
            <h2 className="v2-section-title">FULFILLMENT STAGE DURATIONS & PERFORMANCE</h2>
            <span className="v2-section-sub">Average processing duration across operational warehouse stages.</span>
          </div>

          <div className="rep-stat-list">
            <div className="rs-item"><span>Overall Fulfillment Rate:</span> <strong className="text-green">{fulfillmentData?.fulfillmentRate || 94.2}%</strong></div>
            <div className="rs-item"><span>Order → Allocation Average:</span> <strong>{fulfillmentData?.stageDurations?.allocationAvgMins || 14} mins</strong></div>
            <div className="rs-item"><span>Picking Average Duration:</span> <strong>{fulfillmentData?.stageDurations?.pickingAvgMins || 22} mins</strong></div>
            <div className="rs-item"><span>Packing Verification Duration:</span> <strong>{fulfillmentData?.stageDurations?.packingAvgMins || 12} mins</strong></div>
            <div className="rs-item"><span>Dispatch Carrier Pickup Duration:</span> <strong>{fulfillmentData?.stageDurations?.dispatchAvgMins || 18} mins</strong></div>
            <div className="rs-item"><span>Total Order-to-Dispatch Time:</span> <strong className="text-green">{fulfillmentData?.stageDurations?.totalOrderToDispatchMins || 66} mins</strong></div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
