import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Scan, CheckCircle2, AlertTriangle, Search, Package, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './BarcodeScannerModal.css';

export default function BarcodeScannerModal({ isOpen, onClose, targetProduct, onScanResult }) {
  const { products } = useStore();
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setManualCode('');
      setScanResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch (e) {
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleProcessBarcode = (codeToTest) => {
    const cleanCode = String(codeToTest || '').trim().toLowerCase();
    if (!cleanCode) return;

    // Search product list by barcode or SKU
    const matchedProduct = (products || []).find(p => {
      const pBarcode = String(p.barcode || '').toLowerCase();
      const pSku = String(p.sku || '').toLowerCase();
      return pBarcode === cleanCode || pSku === cleanCode || pBarcode.includes(cleanCode);
    });

    let status = 'SUCCESS';
    let isMatchTarget = true;

    if (targetProduct) {
      const targetBarcode = String(targetProduct.barcode || '').toLowerCase();
      const targetSku = String(targetProduct.sku || '').toLowerCase();
      if (cleanCode !== targetBarcode && cleanCode !== targetSku) {
        isMatchTarget = false;
        status = 'MISMATCH';
      }
    }

    const resultObj = {
      scannedBarcode: codeToTest,
      matchedProduct: matchedProduct || null,
      isMatchTarget,
      status,
      timestamp: new Date().toLocaleTimeString()
    };

    setScanResult(resultObj);
    if (onScanResult) {
      onScanResult(matchedProduct, codeToTest);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleProcessBarcode(manualCode);
  };

  return (
    <AnimatePresence>
      <div key="barcode-scanner-backdrop" className="modal-backdrop" onClick={onClose}>
        <motion.div 
          key="barcode-scanner-modal-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="modal-content barcode-scanner-modal"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <span className="section-label">INVINTELL HARDWARE / CAMERA SCANNER</span>
              <h3 className="modal-title">BARCODE SCANNER & PRODUCT VERIFICATION</h3>
              {targetProduct && (
                <p className="scanner-target-hint">
                  Verifying target product: <strong>{targetProduct.name || targetProduct.productName}</strong> ({targetProduct.sku})
                </p>
              )}
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Camera Viewport & Scan Laser Line */}
            <div className="scanner-camera-viewport">
              <video ref={videoRef} autoPlay playsInline muted className="scanner-video-feed" />
              <div className="scanner-overlay-grid">
                <div className="scanner-box-frame">
                  <div className="scanner-laser-line"></div>
                </div>
              </div>
              <div className="scanner-status-tag">
                <Scan size={14} className="animate-pulse" />
                <span>{cameraActive ? 'CAMERA LIVE — READY TO SCAN' : 'READY FOR HARDWARE USB SCANNER / MANUAL ENTRY'}</span>
              </div>
            </div>

            {/* Manual Barcode Input & Hardware Scanner Support */}
            <form onSubmit={handleManualSubmit} className="scanner-input-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717A' }} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Enter or scan barcode / SKU (e.g. 8908470000015)..."
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  className="scanner-manual-input"
                />
              </div>
              <button type="submit" className="scanner-submit-btn">
                VERIFY BARCODE
              </button>
            </form>

            {/* Quick Demo Barcode Selector for instant testing */}
            <div className="demo-barcode-chips">
              <span className="chips-label">QUICK TEST BARCODES:</span>
              {(products || []).slice(0, 4).map(p => (
                <button 
                  key={p.id || p.sku}
                  type="button"
                  className="barcode-chip"
                  onClick={() => {
                    const b = p.barcode || `890${String(p.sku).replace(/\D/g,'').padStart(9,'0')}`;
                    setManualCode(b);
                    handleProcessBarcode(b);
                  }}
                >
                  {p.sku} ({p.barcode || '890...'})
                </button>
              ))}
            </div>

            {/* Scan Results Display */}
            {scanResult && (
              <div className={`scan-result-card ${scanResult.isMatchTarget ? 'result-success' : 'result-warning'}`}>
                <div className="result-header">
                  {scanResult.isMatchTarget ? (
                    <>
                      <CheckCircle2 size={20} color="#10B981" />
                      <strong style={{ color: '#34D399' }}>✓ BARCODE VERIFIED — PRODUCT MATCHED</strong>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} color="#FBBF24" />
                      <strong style={{ color: '#FBBF24' }}>⚠ MISMATCH — BELONGS TO ANOTHER PRODUCT</strong>
                    </>
                  )}
                </div>

                <div className="result-details-body">
                  <div><strong>Scanned Code:</strong> <code>{scanResult.scannedBarcode}</code></div>
                  {scanResult.matchedProduct ? (
                    <div>
                      <strong>Matched Product:</strong> {scanResult.matchedProduct.name} ({scanResult.matchedProduct.sku}) • {scanResult.matchedProduct.category}
                    </div>
                  ) : (
                    <div style={{ color: '#EF4444' }}>No product found matching this barcode.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>CLOSE SCANNER</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
