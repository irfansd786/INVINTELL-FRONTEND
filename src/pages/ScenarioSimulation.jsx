import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RefreshCw, AlertTriangle, Building2, Box, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ExplanationPanel from '../components/ExplanationPanel';
import './ScenarioSimulation.css';

export default function ScenarioSimulation() {
  const { products, inventory, warehouses } = useStore();

  const [demandShiftPercent, setDemandShiftPercent] = useState(20); // +20%
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'prod-a');
  const [incomingWarehouseStock, setIncomingWarehouseStock] = useState(1500);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Base metrics for selected product
  const baseStock = 90;
  const baseDailyDemand = 120;
  const base7dDemand = 840;

  // Simulated metrics
  const simulatedDailyDemand = Math.round(baseDailyDemand * (1 + demandShiftPercent / 100));
  const simulated7dDemand = Math.round(base7dDemand * (1 + demandShiftPercent / 100));
  const simulatedDepletionDays = Math.round((baseStock / simulatedDailyDemand) * 10) / 10;
  const simulatedShortage = Math.max(0, simulated7dDemand - baseStock);

  // Warehouse capacity simulation (Warehouse B)
  const targetWh = warehouses.find(w => w.name.includes("Warehouse B")) || warehouses[1];
  const baseCapPercent = targetWh.levelPercent || 88;
  const simulatedCapPercent = Math.min(100, Math.round(baseCapPercent + (incomingWarehouseStock / 100)));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="scenarios-page-container"
    >
      {/* Header */}
      <header className="page-header">
        <h1 className="page-title">WHAT-IF SCENARIO SIMULATION ENGINE</h1>
        <p className="page-subtitle">Interactive decision modeling to simulate demand surges, market shifts, and warehouse capacity pressure.</p>
      </header>

      <div className="scenarios-grid">
        
        {/* SCENARIO 1 — DEMAND SHIFT SIMULATOR */}
        <section className="v2-block scenario-block">
          <div className="block-header">
            <div>
              <span className="section-label">PRODUCT DEMAND SIMULATION</span>
              <h2 className="v2-section-title">PRODUCT DEMAND SURGE / DROP</h2>
            </div>
          </div>

          <div className="sim-controls-form">
            <div className="form-group">
              <label className="modal-label">SELECT PRODUCT</label>
              <select 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="select-filter full-width"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="slider-label-row">
                <label className="modal-label">SIMULATED DEMAND SHIFT PERCENTAGE</label>
                <strong className={demandShiftPercent > 0 ? "text-red" : "text-dark"}>
                  {demandShiftPercent > 0 ? `+${demandShiftPercent}%` : `${demandShiftPercent}%`}
                </strong>
              </div>
              <input 
                type="range"
                min="-50"
                max="+100"
                step="5"
                value={demandShiftPercent}
                onChange={(e) => setDemandShiftPercent(Number(e.target.value))}
                className="sim-slider"
              />
            </div>
          </div>

          {/* Simulation Output Comparison Grid */}
          <div className="sim-comparison-grid">
            <div className="sim-cmp-card">
              <span className="sc-lbl">CURRENT BASELINE</span>
              <div className="cmp-val">{base7dDemand} units</div>
              <span className="cmp-sub">7-day expected demand</span>
              <span className="cmp-sub">Depletion: 0.75 days</span>
            </div>

            <div className="sim-cmp-arrow">
              <ArrowRight size={20} />
            </div>

            <div className={`sim-cmp-card ${simulatedShortage > 0 ? 'card-risk-high' : ''}`}>
              <span className="sc-lbl">SIMULATED TRAJECTORY</span>
              <div className="cmp-val text-red">{simulated7dDemand} units</div>
              <span className="cmp-sub">Depletion: <strong>{simulatedDepletionDays} days</strong></span>
              <span className="cmp-sub text-red">Projected Shortage: <strong>-{simulatedShortage} units</strong></span>
            </div>
          </div>

          <ExplanationPanel 
            what={`Simulated ${demandShiftPercent}% demand shift for ${selectedProduct.name}.`}
            why={`Daily sales velocity changes from ${baseDailyDemand} to ${simulatedDailyDemand} units/day.`}
            impact={simulatedShortage > 0 ? `Projected stockout gap increases to ${simulatedShortage} units.` : "Stock coverage remains balanced."}
            action={simulatedShortage > 0 ? "Review replenishment order of 800 units." : "Maintain normal monitoring."}
            isRed={simulatedShortage > 0}
          />
        </section>

        {/* SCENARIO 2 — WAREHOUSE CAPACITY SURGE SIMULATOR */}
        <section className="v2-block scenario-block">
          <div className="block-header">
            <div>
              <span className="section-label">FACILITY CAPACITY SIMULATION</span>
              <h2 className="v2-section-title">WAREHOUSE INBOUND SURGE</h2>
            </div>
          </div>

          <div className="sim-controls-form">
            <div className="form-group">
              <label className="modal-label">TARGET WAREHOUSE FACILITY</label>
              <input type="text" value={targetWh.name} disabled className="search-input" />
            </div>

            <div className="form-group">
              <label className="modal-label">SIMULATED INCOMING INVENTORY ARRIVAL (UNITS)</label>
              <input 
                type="number"
                value={incomingWarehouseStock}
                onChange={(e) => setIncomingWarehouseStock(Number(e.target.value))}
                className="search-input"
                step="250"
              />
            </div>
          </div>

          <div className="sim-comparison-grid">
            <div className="sim-cmp-card">
              <span className="sc-lbl">CURRENT UTILIZATION</span>
              <div className="cmp-val">{baseCapPercent}%</div>
              <span className="cmp-sub">Baseline capacity level</span>
            </div>

            <div className="sim-cmp-arrow">
              <ArrowRight size={20} />
            </div>

            <div className={`sim-cmp-card ${simulatedCapPercent > 90 ? 'card-risk-high' : ''}`}>
              <span className="sc-lbl">PROJECTED UTILIZATION</span>
              <div className="cmp-val text-red">{simulatedCapPercent}%</div>
              <span className="cmp-sub text-red">{simulatedCapPercent > 90 ? "HIGH CAPACITY PRESSURE" : "MODERATE PRESSURE"}</span>
            </div>
          </div>

          <ExplanationPanel 
            what={`Simulated incoming shipment of ${incomingWarehouseStock} units to ${targetWh.name}.`}
            why={`Pushes facility storage utilization from ${baseCapPercent}% to ${simulatedCapPercent}%.`}
            impact={simulatedCapPercent > 90 ? "Triggers storage congestion risk and picking staging slowdown." : "Facility can absorb inbound stock."}
            action={simulatedCapPercent > 90 ? "Review inventory rebalancing transfer to secondary hub." : "Proceed with inbound receiving."}
            isRed={simulatedCapPercent > 90}
          />
        </section>

      </div>
    </motion.div>
  );
}
