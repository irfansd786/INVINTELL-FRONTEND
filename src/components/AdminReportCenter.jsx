import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCheck, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  X, 
  RotateCcw,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { exportCSV, exportExcel, exportPDF } from '../utils/reportExporter';
import './AdminReportCenter.css';

const INITIAL_EXPORTS_LOG = [
  { id: 'exp-101', name: 'Full Enterprise Report', timestamp: 'Today, 10:42 AM', period: 'Last 7 Days', warehouse: 'All Warehouses', format: 'PDF', status: 'Ready' },
  { id: 'exp-102', name: 'Inventory Master Report', timestamp: 'Today, 10:31 AM', period: 'Today', warehouse: 'Warehouse A (Chicago)', format: 'Excel', status: 'Ready' },
  { id: 'exp-103', name: 'Orders Fulfillment Report', timestamp: 'Yesterday, 04:15 PM', period: 'Last 30 Days', warehouse: 'Warehouse B (Dallas)', format: 'CSV', status: 'Ready' },
  { id: 'exp-104', name: 'Stockout Risk Assessment', timestamp: '12 Aug 2026, 02:20 PM', period: 'Last 7 Days', warehouse: 'All Warehouses', format: 'PDF', status: 'Ready' }
];

export default function AdminReportCenter() {
  const store = useStore();
  const { inventory, orders, warehouses, risks, exceptions, managementActions } = store;

  // Filter States
  const [dateRange, setDateRange] = useState('7D');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [reportType, setReportType] = useState('FULL');
  const [selectedFormat, setSelectedFormat] = useState('PDF');

  // Modal & Generation States
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generationState, setGenerationState] = useState('IDLE');
  const [exportHistory, setExportHistory] = useState(INITIAL_EXPORTS_LOG);
  
  const pendingCount = (orders || []).filter(o => o.status === 'PENDING').length;
  const pickingCount = (orders || []).filter(o => o.status === 'PICKING').length;
  const packingCount = (orders || []).filter(o => o.status === 'PACKING' || o.status === 'PACKED').length;
  const dispatchCount = (orders || []).filter(o => o.status === 'READY FOR DISPATCH' || o.status === 'DISPATCHED').length;
  const todayRevenue = (orders || []).reduce((acc, o) => acc + (o.totalValue || 0), 0) || 48250;

  const getReportTitle = (type) => {
    switch (type) {
      case 'FULL': return 'Full Enterprise Management Briefing';
      case 'INVENTORY': return 'Master Inventory Balance Report';
      case 'ORDERS': return 'Orders & Fulfillment Report';
      case 'WAREHOUSE': return 'Warehouse Performance Report';
      case 'RISK': return 'Risk & Stockout Assessment';
      case 'OPERATIONS': return 'Operational Bottleneck Report';
      case 'EXCEPTION': return 'Operational Exceptions Report';
      default: return 'Enterprise Report';
    }
  };

  const executeDownload = (fmt = selectedFormat) => {
    setGenerationState('LOADING');
    setShowFormatModal(false);

    setTimeout(() => {
      const filtersObj = {
        dateRange: dateRange === '7D' ? 'Last 7 Days' : dateRange === '30D' ? 'Last 30 Days' : dateRange === 'TODAY' ? 'Today' : 'Custom Range',
        warehouse: warehouseFilter === 'ALL' ? 'ALL WAREHOUSES' : warehouseFilter
      };

      if (fmt === 'CSV') {
        exportCSV(reportType === 'FULL' ? 'FULL' : reportType, store, filtersObj);
      } else if (fmt === 'EXCEL') {
        exportExcel(reportType === 'FULL' ? 'FULL' : reportType, store, filtersObj);
      } else {
        exportPDF(getReportTitle(reportType), store, filtersObj);
      }

      setGenerationState('SUCCESS');

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newExportLog = {
        id: `exp-${Date.now()}`,
        name: getReportTitle(reportType),
        timestamp: `Today, ${nowStr}`,
        period: filtersObj.dateRange,
        warehouse: filtersObj.warehouse,
        format: fmt,
        status: 'Ready'
      };
      setExportHistory(prev => [newExportLog, ...prev]);
    }, 1200);
  };

  return (
    <section className="admin-report-center-container" aria-label="Admin Report Download Center">
      {/* SECTION HEADER */}
      <div className="arc-header-block">
        <div>
          <span className="section-label">ADMIN REPORT & EXPORT CENTER</span>
          <h2 className="v2-section-title">EXPORT ENTERPRISE REPORTS</h2>
          <p className="v2-section-sub">Download detailed operational, inventory, fulfillment, and risk reports for executive management.</p>
        </div>
      </div>

      {/* 1. REPORT FILTER & SELECTION TOOLBAR */}
      <div className="arc-export-panel v2-block">
        <div className="arc-controls-grid">
          {/* DATE RANGE */}
          <div className="arc-filter-col">
            <label className="arc-label"><Calendar size={13} /> DATE RANGE</label>
            <div className="segmented-filter">
              <button className={`segmented-btn ${dateRange === 'TODAY' ? 'active' : ''}`} onClick={() => setDateRange('TODAY')}>TODAY</button>
              <button className={`segmented-btn ${dateRange === '7D' ? 'active' : ''}`} onClick={() => setDateRange('7D')}>LAST 7 DAYS</button>
              <button className={`segmented-btn ${dateRange === '30D' ? 'active' : ''}`} onClick={() => setDateRange('30D')}>LAST 30 DAYS</button>
            </div>
          </div>

          {/* WAREHOUSE SELECTOR */}
          <div className="arc-filter-col">
            <label className="arc-label"><Building2 size={13} /> WAREHOUSE</label>
            <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="arc-select">
              <option value="ALL">ALL WAREHOUSES</option>
              <option value="wh-chi-01">Warehouse A (Chicago)</option>
              <option value="wh-dal-02">Warehouse B (Dallas)</option>
              <option value="wh-atl-03">Warehouse C (Atlanta)</option>
            </select>
          </div>

          {/* REPORT TYPE */}
          <div className="arc-filter-col arc-report-type-col">
            <label className="arc-label"><FileText size={13} /> REPORT TYPE</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="arc-select font-bold">
              <option value="FULL">FULL ENTERPRISE REPORT (Complete Management Brief)</option>
              <option value="INVENTORY">INVENTORY REPORT (Master Stock Balances)</option>
              <option value="ORDERS">ORDERS REPORT (Fulfillment Velocity)</option>
              <option value="WAREHOUSE">WAREHOUSE REPORT (Facility Capacity)</option>
              <option value="RISK">RISK REPORT (Stockout & Overstock)</option>
              <option value="OPERATIONS">OPERATIONS REPORT (Bottlenecks & Throughput)</option>
              <option value="EXCEPTION">EXCEPTION REPORT (Operational Delays)</option>
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS STRIP */}
        <div className="arc-actions-bar">
          <div className="arc-actions-left">
            <button className="btn-secondary" onClick={() => setShowPreviewModal(true)}>
              <Eye size={15} /> REPORT PREVIEW
            </button>
            <span className="arc-meta-text">
              Selected Report: <strong>{getReportTitle(reportType)}</strong> ({inventory.length} Records)
            </span>
          </div>

          <div className="arc-actions-right">
            {/* FORMAT SELECTOR (PDF | EXCEL | CSV) RIGHT BESIDE DOWNLOAD REPORT */}
            <div className="format-selector-group">
              <span className="format-lbl"><Filter size={12} /> FORMAT:</span>
              <div className="segmented-filter">
                <button className={`segmented-btn ${selectedFormat === 'PDF' ? 'active' : ''}`} onClick={() => setSelectedFormat('PDF')}>PDF</button>
                <button className={`segmented-btn ${selectedFormat === 'EXCEL' ? 'active' : ''}`} onClick={() => setSelectedFormat('EXCEL')}>EXCEL</button>
                <button className={`segmented-btn ${selectedFormat === 'CSV' ? 'active' : ''}`} onClick={() => setSelectedFormat('CSV')}>CSV</button>
              </div>
            </div>

            {/* ONLY ONE MAIN DOWNLOAD ACTION BUTTON */}
            <button className="btn-primary btn-large-primary" onClick={() => executeDownload(selectedFormat)}>
              {generationState === 'LOADING' ? (
                <><Loader2 size={16} className="spin-icon" /> GENERATING...</>
              ) : (
                <><Download size={16} /> DOWNLOAD REPORT</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. RECENT EXPORTS HISTORY LOG TABLE */}
      <div className="arc-history-block v2-block">
        <div className="block-header">
          <h3 className="v2-section-title">RECENT EXPORTS LOG</h3>
          <span className="v2-section-sub">Chronological audit trail of generated management reports and file downloads.</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>REPORT NAME</th>
                <th>GENERATED TIMESTAMP</th>
                <th>PERIOD & FACILITY</th>
                <th>FORMAT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((exp) => (
                <tr key={exp.id}>
                  <td><strong>{exp.name}</strong></td>
                  <td className="date-cell">{exp.timestamp}</td>
                  <td>{exp.period} • {exp.warehouse}</td>
                  <td>
                    <span className={`badge ${exp.format === 'PDF' ? 'badge-risk' : exp.format === 'EXCEL' ? 'badge-green' : 'badge-normal'}`}>
                      {exp.format}
                    </span>
                  </td>
                  <td>
                    <span className="completed-tag text-green">✓ {exp.status}</span>
                  </td>
                  <td>
                    <button className="btn-secondary btn-sm" onClick={() => executeDownload(exp.format)}>
                      <RotateCcw size={12} /> Re-download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. FORMAT SELECTION MODAL */}
      <AnimatePresence>
        {showFormatModal && (
          <div className="modal-backdrop" onClick={() => setShowFormatModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="modal-content format-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="section-label">EXPORT GENERATOR</span>
                  <h2 className="modal-title">DOWNLOAD REPORT</h2>
                  <span className="modal-subtitle-row">{getReportTitle(reportType)}</span>
                </div>
                <button className="modal-close-btn" onClick={() => setShowFormatModal(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body format-modal-body">
                <p className="format-modal-desc">Choose export format for management review:</p>
                
                <div className="format-options-grid">
                  <label className={`format-opt-card ${selectedFormat === 'PDF' ? 'selected' : ''}`} onClick={() => setSelectedFormat('PDF')}>
                    <input type="radio" name="format" checked={selectedFormat === 'PDF'} onChange={() => setSelectedFormat('PDF')} />
                    <div className="format-opt-text">
                      <strong>PDF Document (.pdf)</strong>
                      <span>Print-ready executive briefing with tables, logos, and page formatting.</span>
                    </div>
                  </label>

                  <label className={`format-opt-card ${selectedFormat === 'EXCEL' ? 'selected' : ''}`} onClick={() => setSelectedFormat('EXCEL')}>
                    <input type="radio" name="format" checked={selectedFormat === 'EXCEL'} onChange={() => setSelectedFormat('EXCEL')} />
                    <div className="format-opt-text">
                      <strong>Excel Spreadsheet (.xls)</strong>
                      <span>Structured multi-sheet workbook for data analysis and financial auditing.</span>
                    </div>
                  </label>

                  <label className={`format-opt-card ${selectedFormat === 'CSV' ? 'selected' : ''}`} onClick={() => setSelectedFormat('CSV')}>
                    <input type="radio" name="format" checked={selectedFormat === 'CSV'} onChange={() => setSelectedFormat('CSV')} />
                    <div className="format-opt-text">
                      <strong>Comma Separated Values (.csv)</strong>
                      <span>Raw dataset export for system integration and database ingestion.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowFormatModal(false)}>CANCEL</button>
                <button className="btn-primary" onClick={() => executeDownload(selectedFormat)}>
                  <Download size={14} /> DOWNLOAD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. REPORT PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="modal-content preview-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="section-label">ENTERPRISE MANAGEMENT REPORT PREVIEW</span>
                  <h2 className="modal-title">INVINTELL ENTERPRISE REPORT</h2>
                  <div className="modal-subtitle-row">
                    <span>Period: {dateRange === '7D' ? 'Last 7 Days' : 'Today'}</span>
                    <span className="bullet-sep">•</span>
                    <span>Facility: {warehouseFilter === 'ALL' ? 'ALL WAREHOUSES' : warehouseFilter}</span>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setShowPreviewModal(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              {/* REPORT PREVIEW PAPER BODY */}
              <div className="modal-body preview-paper-body">
                <div className="report-preview-sheet">
                  <div className="rep-preview-banner">
                    <div>
                      <h1 className="rep-p-title">INVINTELL</h1>
                      <div className="rep-p-sub">ENTERPRISE MANAGEMENT REPORT</div>
                    </div>
                    <div className="rep-p-meta">
                      <span>REPORT PERIOD: {dateRange === '7D' ? 'Last 7 Days' : 'Today'}</span>
                      <span>FACILITY HUB: {warehouseFilter === 'ALL' ? 'ALL WAREHOUSES' : warehouseFilter}</span>
                      <span className="text-green font-bold">TODAY'S REVENUE: ${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* 1. EXECUTIVE SUMMARY */}
                  <div className="rep-preview-section">
                    <h3 className="rep-sec-h3">1. EXECUTIVE SUMMARY</h3>
                    <p className="rep-sec-p">
                      Warehouse operations across regional hubs generated <strong className="text-green">${todayRevenue.toLocaleString()} in revenue today</strong> with a 94.2% order fulfillment velocity. Master inventory balance holds {inventory.reduce((acc, i) => acc + i.total, 0).toLocaleString()} total units across facilities. 6 product lines exhibit critical stockout risks requiring immediate replenishment actions.
                    </p>
                  </div>

                  {/* 2. OPERATIONS SUMMARY */}
                  <div className="rep-preview-section">
                    <h3 className="rep-sec-h3">2. OPERATIONS & REVENUE SUMMARY</h3>
                    <div className="rep-grid-2col">
                      <div className="rep-kv-row"><span>Today's Gross Revenue:</span> <strong className="text-green">${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                      <div className="rep-kv-row"><span>Orders Received:</span> <strong>{orders.length} orders</strong></div>
                      <div className="rep-kv-row"><span>Orders Fulfilled:</span> <strong className="text-green">165 orders (94.2%)</strong></div>
                      <div className="rep-kv-row"><span>Pending Allocation:</span> <strong>{orders.filter(o => o.status === 'PENDING').length} orders</strong></div>
                    </div>
                  </div>

                  {/* 3. INVENTORY STATUS */}
                  <div className="rep-preview-section">
                    <h3 className="rep-sec-h3">3. INVENTORY DISTRIBUTION</h3>
                    <div className="rep-grid-2col">
                      <div className="rep-kv-row"><span>Total Inventory:</span> <strong>{inventory.reduce((acc, i) => acc + i.total, 0).toLocaleString()} units</strong></div>
                      <div className="rep-kv-row"><span>Available Stock:</span> <strong>{inventory.reduce((acc, i) => acc + i.available, 0).toLocaleString()} units</strong></div>
                      <div className="rep-kv-row"><span>Reserved Stock:</span> <strong>{inventory.reduce((acc, i) => acc + (i.reserved || 0), 0).toLocaleString()} units</strong></div>
                      <div className="rep-kv-row"><span>In Transit:</span> <strong>980 units</strong></div>
                      <div className="rep-kv-row"><span>Damaged Stock:</span> <strong className="text-red">190 units</strong></div>
                      <div className="rep-kv-row"><span>Stockout Risk SKUs:</span> <strong className="text-red">6 products</strong></div>
                    </div>
                  </div>

                  {/* 4. WAREHOUSE PERFORMANCE */}
                  <div className="rep-preview-section">
                    <h3 className="rep-sec-h3">4. WAREHOUSE PERFORMANCE TABLE</h3>
                    <table className="rep-preview-table">
                      <thead>
                        <tr><th>FACILITY</th><th>LOCATION</th><th>INVENTORY</th><th>ORDERS</th><th>CAPACITY</th></tr>
                      </thead>
                      <tbody>
                        {warehouses.map(w => (
                          <tr key={w.id}>
                            <td><strong>{w.name}</strong></td>
                            <td>{w.location}</td>
                            <td>{w.units ? w.units.toLocaleString() : '8,420'} u</td>
                            <td>{w.pendingOrders} active</td>
                            <td>{w.levelPercent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 5. TOP RISKS & RECOMMENDATIONS */}
                  <div className="rep-preview-section">
                    <h3 className="rep-sec-h3">5. MANAGEMENT RECOMMENDATIONS</h3>
                    <ul className="rep-preview-list">
                      {managementActions.slice(0, 3).map(a => (
                        <li key={a.id}>
                          <strong>{a.title} ({a.warehouseName}):</strong> {a.action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rep-preview-footer">
                    <span>--- END OF ENTERPRISE MANAGEMENT REPORT ---</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => executeDownload('CSV')}><FileText size={14} /> EXPORT CSV</button>
                <button className="btn-secondary" onClick={() => executeDownload('EXCEL')}><FileSpreadsheet size={14} /> EXPORT EXCEL</button>
                <button className="btn-primary" onClick={() => executeDownload('PDF')}><FileCheck size={14} /> EXPORT PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. GENERATION LOADING / SUCCESS OVERLAY */}
      <AnimatePresence>
        {generationState === 'LOADING' && (
          <div className="modal-backdrop">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-content gen-status-modal">
              <Loader2 size={36} className="spin-icon text-green" />
              <h3>Preparing report...</h3>
              <p>Aggregating centralized warehouse inventory and operational metrics.</p>
            </motion.div>
          </div>
        )}

        {generationState === 'SUCCESS' && (
          <div className="modal-backdrop" onClick={() => setGenerationState('IDLE')}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="modal-content gen-status-modal" onClick={(e) => e.stopPropagation()}>
              <CheckCircle2 size={44} className="text-green" />
              <h3 className="text-green">✓ REPORT READY</h3>
              <p>Your enterprise management report has been generated successfully.</p>
              <div className="modal-footer-row" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setGenerationState('IDLE')}>CLOSE</button>
                <button className="btn-primary" onClick={() => executeDownload(selectedFormat)}>DOWNLOAD AGAIN</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
