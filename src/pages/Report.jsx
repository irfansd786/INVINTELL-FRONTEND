import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, Download, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExplanationPanel from '../components/ExplanationPanel';
import AdminReportCenter from '../components/AdminReportCenter';
import './Report.css';

export default function Report() {
  const navigate = useNavigate();
  const { warehouses, orders, inventory, exceptions, managementActions } = useStore();

  const [timeRange, setTimeRange] = useState('7D');

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="report-page-v2"
    >
      {/* Header */}
      <header className="report-header-v2">
        <div>
          <h1 className="page-title">EXECUTIVE BRIEFING REPORT</h1>
          <p className="page-subtitle">Enterprise operational and inventory summary for management review.</p>
        </div>

        {/* Toolbar Controls */}
        <div className="report-controls-group">
          {/* Time Period Selector */}
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={14} /> PRINT REPORT
          </button>
        </div>
      </header>

      {/* ADMIN REPORT & EXPORT CENTER - TOP OF PAGE BELOW PRINT OPTION */}
      <AdminReportCenter />

      {/* 1. EXECUTIVE SUMMARY NARRATIVE */}
      <section className="v2-block summary-narrative-block">
        <div className="block-header">
          <h2 className="v2-section-title">EXECUTIVE SUMMARY</h2>
        </div>
        <p className="narrative-text">
          Warehouse operations remained stable over the past 7 days with a 94.2% order fulfillment velocity. However, inventory pressure is increasing in Warehouse B (Dallas), and 6 product lines exhibit critical stockout risks over the next 7 days due to regional demand shifts.
        </p>
      </section>

      {/* 2. REPORT SUMMARY KPIs */}
      <section className="kpi-strip-v2 kpi-strip-report">
        <div className="kpi-card-v2">
          <span className="kpi-lbl">TOTAL ORDERS</span>
          <div className="kpi-val">1,426</div>
          <span className="kpi-change text-muted">Period queue volume</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">FULFILLMENT RATE</span>
          <div className="kpi-val text-green">94.2%</div>
          <span className="kpi-change text-green font-bold">✓ Target met</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">MASTER INVENTORY</span>
          <div className="kpi-val">18,420 <span className="kpi-unit">u</span></div>
          <span className="kpi-change text-muted">Across 3 facilities</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">STOCKOUT RISKS</span>
          <div className="kpi-val text-red">6 <span className="kpi-unit">SKUs</span></div>
          <span className="kpi-change text-red font-bold">Requires replenishment</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">OVERSTOCK EXPOSURE</span>
          <div className="kpi-val">14 <span className="kpi-unit">SKUs</span></div>
          <span className="kpi-change text-muted">Capital holding</span>
        </div>

        <div className="kpi-card-v2">
          <span className="kpi-lbl">OPEN EXCEPTIONS</span>
          <div className="kpi-val text-red">{exceptions.filter(e => e.status === 'OPEN').length}</div>
          <span className="kpi-change text-muted">Staged for resolution</span>
        </div>
      </section>

      {/* 3. PERFORMANCE SECTIONS GRID */}
      <div className="report-two-col">
        {/* TODAY'S PERFORMANCE */}
        <section className="v2-block">
          <div className="block-header">
            <h2 className="v2-section-title">TODAY'S FULFILLMENT PERFORMANCE</h2>
            <span className="v2-section-sub">Outbound and inbound operational volume today.</span>
          </div>
          <div className="rep-stat-list">
            <div className="rs-item"><span>Orders Received:</span> <strong>248 orders</strong></div>
            <div className="rs-item"><span>Orders Fulfilled:</span> <strong className="text-green">165 orders (94.2%)</strong></div>
            <div className="rs-item"><span>Inbound Received:</span> <strong>1,240 units</strong></div>
            <div className="rs-item"><span>Outbound Dispatched:</span> <strong>980 units</strong></div>
          </div>
        </section>

        {/* INVENTORY HEALTH */}
        <section className="v2-block">
          <div className="block-header">
            <h2 className="v2-section-title">INVENTORY HEALTH</h2>
            <span className="v2-section-sub">Stock distribution by risk level.</span>
          </div>
          <div className="rep-stat-list">
            <div className="rs-item"><span>Available Baseline:</span> <strong>18,420 units (82%)</strong></div>
            <div className="rs-item"><span>Reserved Stock:</span> <strong>2,410 units (14%)</strong></div>
            <div className="rs-item"><span>Stockout Risk Gaps:</span> <strong className="text-red">6 products</strong></div>
            <div className="rs-item"><span>Overstock Exposure:</span> <strong>14 products</strong></div>
          </div>
        </section>

        {/* FUTURE OUTLOOK */}
        <section className="v2-block">
          <div className="block-header">
            <h2 className="v2-section-title">FUTURE OUTLOOK (NEXT 7 DAYS)</h2>
            <span className="v2-section-sub">Projected demand shifts and replenishment needs.</span>
          </div>
          <div className="rep-stat-list">
            <div className="rs-item"><span>Forecast Demand Velocity:</span> <strong className="text-green">+14% expected</strong></div>
            <div className="rs-item"><span>Potential Shortage Gaps:</span> <strong className="text-red">6 products</strong></div>
            <div className="rs-item"><span>Replenishment Manifests:</span> <strong>12 recommended orders</strong></div>
            <div className="rs-item"><span>Upcoming Demand Events:</span> <strong>3 calendar events</strong></div>
          </div>
        </section>

        {/* OPERATIONAL HEALTH */}
        <section className="v2-block">
          <div className="block-header">
            <h2 className="v2-section-title">OPERATIONAL HEALTH</h2>
            <span className="v2-section-sub">Throughput rates across warehouse stages.</span>
          </div>
          <div className="rep-stat-list">
            <div className="rs-item"><span>Inventory Allocation:</span> <strong>98% efficiency</strong></div>
            <div className="rs-item"><span>Picking Velocity:</span> <strong className="text-red">76% (Picking Surge)</strong></div>
            <div className="rs-item"><span>Packing Line Verification:</span> <strong>88% efficiency</strong></div>
            <div className="rs-item"><span>Dispatch Carrier Pickup:</span> <strong>91% efficiency</strong></div>
          </div>
        </section>
      </div>

      {/* 4. MANAGEMENT RECOMMENDATIONS */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">MANAGEMENT RECOMMENDATIONS</h2>
          <span className="v2-section-sub">Prioritized decision support items requiring approval.</span>
        </div>

        <div className="recs-list">
          {managementActions.slice(0, 3).map((act) => (
            <ExplanationPanel 
              key={act.id}
              what={act.title}
              why={act.why}
              impact={act.impact}
              action={act.action}
              isRed={act.priority === 'CRITICAL'}
            />
          ))}
        </div>
      </section>

      {/* 5. WAREHOUSE COMPARISON TABLE */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">WAREHOUSE NETWORK COMPARISON</h2>
          <span className="v2-section-sub">Comparative metrics across regional hub facilities.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>FACILITY NAME</th>
                <th>LOCATION</th>
                <th>ACTIVE ORDERS</th>
                <th>INVENTORY UNITS</th>
                <th>FULFILLMENT RATE</th>
                <th>EXCEPTIONS</th>
                <th>RISK STATUS</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((wh) => (
                <tr key={wh.id} onClick={() => navigate('/warehouses')}>
                  <td><strong>{wh.name}</strong></td>
                  <td>{wh.location}</td>
                  <td>{wh.pendingOrders} orders</td>
                  <td><strong>{wh.units ? wh.units.toLocaleString() : '8,420'} u</strong></td>
                  <td><strong className="text-green">94.2%</strong></td>
                  <td>{exceptions.filter(e => e.warehouseId === wh.id || e.warehouseName?.includes(wh.name)).length} open</td>
                  <td>
                    <span className={`badge ${wh.status === 'ATTENTION' ? 'badge-risk' : 'badge-green'}`}>
                      {wh.status === 'ATTENTION' ? 'ATTENTION' : 'HEALTHY'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. KEY TAKEAWAYS SUMMARY */}
      <section className="v2-block">
        <div className="block-header">
          <h2 className="v2-section-title">KEY TAKEAWAYS</h2>
        </div>

        <div className="takeaways-grid">
          <div className="takeaway-item">
            <span className="tk-num">1</span>
            <span>Overall enterprise operations remain stable with 94.2% fulfillment rate.</span>
          </div>

          <div className="takeaway-item">
            <span className="tk-num">2</span>
            <span>Inventory stockout risk is concentrated in 6 specific industrial SKUs.</span>
          </div>

          <div className="takeaway-item">
            <span className="tk-num">3</span>
            <span>Warehouse B (Dallas) capacity requires rebalancing transfer approval.</span>
          </div>

          <div className="takeaway-item">
            <span className="tk-num">4</span>
            <span>Management review is recommended for 3 replenishment decision items.</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
