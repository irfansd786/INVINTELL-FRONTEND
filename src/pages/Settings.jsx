import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, CheckCircle2, Server, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './Settings.css';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="settings-page-v2"
    >
      {/* Header */}
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">ENTERPRISE PLATFORM CONFIGURATION</h1>
          <p className="page-subtitle">Configure enterprise preferences, intelligence thresholds, and system preferences.</p>
        </div>

        {/* Section Tabs */}
        <div className="segmented-filter">
          <button className={`segmented-btn ${activeTab === 'GENERAL' ? 'active' : ''}`} onClick={() => setActiveTab('GENERAL')}>GENERAL</button>
          <button className={`segmented-btn ${activeTab === 'INVENTORY' ? 'active' : ''}`} onClick={() => setActiveTab('INVENTORY')}>INVENTORY</button>
          <button className={`segmented-btn ${activeTab === 'SYSTEM' ? 'active' : ''}`} onClick={() => setActiveTab('SYSTEM')}>SYSTEM STATUS</button>
        </div>
      </header>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="settings-form-layout">
        {activeTab === 'GENERAL' && (
          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">GENERAL PREFERENCES</h2>
              <span className="v2-section-sub">Enterprise identity and default warehouse.</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="modal-label">ENTERPRISE ORGANIZATION NAME</label>
                <input 
                  type="text"
                  value={formData.enterpriseName}
                  onChange={(e) => setFormData({ ...formData, enterpriseName: e.target.value })}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">PRIMARY DEFAULT WAREHOUSE HUB</label>
                <select 
                  value={formData.defaultWarehouse}
                  onChange={(e) => setFormData({ ...formData, defaultWarehouse: e.target.value })}
                  className="top-wh-select full-width"
                >
                  <option value="wh-chi-01">Warehouse A (Chicago)</option>
                  <option value="wh-dal-02">Warehouse B (Dallas)</option>
                  <option value="wh-atl-03">Warehouse C (Atlanta)</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'INVENTORY' && (
          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">INTELLIGENCE THRESHOLDS</h2>
              <span className="v2-section-sub">Stockout risk and safety stock calculation parameters.</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="modal-label">LOW-STOCK THRESHOLD (DAYS COVERAGE)</label>
                <input 
                  type="number"
                  value={formData.lowStockThresholdDays}
                  onChange={(e) => setFormData({ ...formData, lowStockThresholdDays: Number(e.target.value) })}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label className="modal-label">SAFETY-STOCK BUFFER (DAYS)</label>
                <input 
                  type="number"
                  value={formData.safetyStockBufferDays}
                  onChange={(e) => setFormData({ ...formData, safetyStockBufferDays: Number(e.target.value) })}
                  className="search-input"
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'SYSTEM' && (
          <section className="v2-block">
            <div className="block-header">
              <h2 className="v2-section-title">PLATFORM SYSTEM STATUS</h2>
              <span className="v2-section-sub">Simulated architecture status for frontend prototype.</span>
            </div>

            <div className="status-grid-box">
              <div className="status-item">
                <Server size={18} className="text-dark" />
                <div className="st-info">
                  <span className="st-lbl">DATA LAYER SERVICE</span>
                  <strong className="st-val">{formData.dataStatus}</strong>
                </div>
              </div>

              <div className="status-item">
                <Shield size={18} className="text-dark" />
                <div className="st-info">
                  <span className="st-lbl">INTELLIGENCE ENGINE</span>
                  <strong className="st-val">{formData.intelligenceEngineStatus}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="settings-footer-actions">
          {savedSuccess && (
            <span className="save-success-text"><CheckCircle2 size={16} /> CONFIGURATION PREFERENCES SAVED</span>
          )}
          <button type="submit" className="btn-primary">
            <Save size={16} /> SAVE CONFIGURATION PREFERENCES
          </button>
        </div>
      </form>
    </motion.div>
  );
}
