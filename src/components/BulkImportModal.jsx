import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import './BulkImportModal.css';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [csvText, setCsvText] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleSampleCSV = () => {
    const sample = `name,sku,category,price,cost,stock\n"Wireless Optical Mouse","SKU-IMP-9001","Electronics",29.99,14.50,150\n"Ergonomic Mechanical Keyboard","SKU-IMP-9002","Electronics",89.99,45.00,80\n"Industrial Safety Helmet","SKU-IMP-9003","Safety",34.50,16.20,200`;
    setCsvText(sample);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setCsvText(evt.target.result);
      reader.readAsText(file);
    }
  };

  const handleValidate = async () => {
    if (!csvText.trim()) return;
    setIsValidating(true);
    setValidationResult(null);
    setStatusMessage(null);

    const res = await api.importProductsBulk(csvText);
    setIsValidating(false);

    if (res && res.success) {
      setValidationResult(res);
    } else {
      setStatusMessage({ type: 'error', text: res?.message || 'CSV validation failed' });
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;
    setIsImporting(true);

    const res = await api.confirmProductsBulk(validationResult.validRows);
    setIsImporting(false);

    if (res && res.success) {
      setStatusMessage({ type: 'success', text: `✓ Imported ${res.importedCount} products successfully!` });
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ type: 'error', text: res?.message || 'Import execution failed' });
    }
  };

  return (
    <AnimatePresence>
      <div key="bulk-import-modal-backdrop" className="modal-backdrop" onClick={onClose} role="presentation">
        <motion.div 
          key="bulk-import-modal-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="modal-content bulk-modal-content"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-import-modal-title"
        >
          <div className="modal-header">
            <div>
              <span className="section-label">DATA MANAGEMENT</span>
              <h2 id="bulk-import-modal-title" className="modal-title">BULK CSV PRODUCT IMPORT</h2>
              <p className="modal-subtitle-row">Upload CSV file to import products and initial warehouse inventory.</p>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
          </div>

          <div className="modal-body bulk-modal-body">
            {statusMessage && (
              <div className={`status-alert ${statusMessage.type}`} role="alert">
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {!validationResult ? (
              <>
                <div className="csv-upload-dropzone">
                  <Upload size={32} className="text-green" />
                  <p>Drag and drop CSV file here or click to browse</p>
                  <input id="csv-file-input" type="file" accept=".csv" onChange={handleFileUpload} className="file-input-hidden" aria-label="Upload CSV file" />
                  <button className="btn-secondary btn-sm" onClick={handleSampleCSV}>
                    <FileSpreadsheet size={14} /> LOAD SAMPLE CSV TEMPLATE
                  </button>
                </div>

                <div className="csv-textarea-group">
                  <label htmlFor="csv-textarea-input">OR PASTE CSV CONTENT DIRECTLY:</label>
                  <textarea 
                    id="csv-textarea-input"
                    rows={6}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="name,sku,category,price,cost,stock&#10;Product A,SKU-001,Groceries,150,90,100"
                    className="csv-textarea"
                  />
                </div>
              </>
            ) : (
              <div className="validation-report-box">
                <div className="val-summary-strip">
                  <div><span>TOTAL ROWS:</span> <strong>{validationResult.summary.totalRows}</strong></div>
                  <div><span>VALID ROWS:</span> <strong className="text-green">{validationResult.summary.validCount}</strong></div>
                  <div><span>INVALID ROWS:</span> <strong className="text-red">{validationResult.summary.invalidCount}</strong></div>
                </div>

                {validationResult.invalidRows.length > 0 && (
                  <div className="invalid-rows-list">
                    <h4 className="text-red">INVALID ROWS REJECTED:</h4>
                    <ul>
                      {validationResult.invalidRows.map((inv, i) => (
                        <li key={i}>
                          <strong>Row {inv.rowNum}:</strong> {inv.errors}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="valid-preview-table-container">
                  <h4>VALID ROWS PREVIEW ({validationResult.validRows.length}):</h4>
                  <table className="data-table">
                    <thead>
                      <tr><th scope="col">ROW</th><th scope="col">NAME</th><th scope="col">SKU</th><th scope="col">CATEGORY</th><th scope="col">PRICE</th><th scope="col">STOCK</th></tr>
                    </thead>
                    <tbody>
                      {validationResult.validRows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td>#{r.rowNum}</td>
                          <td><strong>{r.name}</strong></td>
                          <td><code>{r.sku}</code></td>
                          <td>{r.category}</td>
                          <td>₹{r.price}</td>
                          <td>{r.stockQuantity} u</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => { setValidationResult(null); onClose(); }}>
              CANCEL
            </button>

            {!validationResult ? (
              <button className="btn-primary" onClick={handleValidate} disabled={isValidating || !csvText.trim()}>
                {isValidating ? <><Loader2 size={14} className="spin-icon" /> VALIDATING...</> : 'VALIDATE CSV DATA'}
              </button>
            ) : (
              <button className="btn-primary" onClick={handleConfirmImport} disabled={isImporting || validationResult.validRows.length === 0}>
                {isImporting ? <><Loader2 size={14} className="spin-icon" /> IMPORTING...</> : `CONFIRM & IMPORT ${validationResult.validRows.length} ROWS`}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
