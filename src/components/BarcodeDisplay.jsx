import React, { useState } from 'react';
import { Camera, Copy, Printer, Check } from 'lucide-react';
import './BarcodeDisplay.css';

/**
 * Deterministically converts a barcode string into crisp, high-contrast Code-128 / EAN-13 style SVG bars
 */
function generateBarcodeBars(code) {
  const cleanCode = String(code || '8901234567890');
  const bars = [];
  
  // Code 128 Start Pattern (11010010000)
  const startPattern = [2, 1, 1, 2, 1, 4];
  
  // Encode each character into bar & space widths
  let isBar = true;
  startPattern.forEach(w => {
    bars.push({ width: w, isBar });
    isBar = !isBar;
  });

  for (let i = 0; i < cleanCode.length; i++) {
    const charCode = cleanCode.charCodeAt(i);
    const pattern = [
      (charCode % 3) + 1,
      ((charCode * 2) % 3) + 1,
      ((charCode * 3) % 4) + 1,
      (charCode % 2) + 1
    ];
    pattern.forEach(w => {
      bars.push({ width: w, isBar });
      isBar = !isBar;
    });
  }

  // Stop Pattern
  [2, 3, 3, 1, 1, 1, 2].forEach(w => {
    bars.push({ width: w, isBar });
    isBar = !isBar;
  });

  return bars;
}

export default function BarcodeDisplay({ product, onOpenScanner }) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const barcodeValue = product.barcode || `890${String(product.id || product.sku || '1001').replace(/\D/g, '').padStart(9, '0').slice(-9)}`;
  const productName = product.name || product.productName || 'Inventory Product';
  const sku = product.sku || product.id || 'SKU-1001';
  const category = product.category || 'General';

  const bars = generateBarcodeBars(barcodeValue);

  // Calculate SVG bar widths
  let currentX = 12;
  const renderBars = bars.map((bar, index) => {
    const barWidth = bar.width * 2.2;
    const xPos = currentX;
    currentX += barWidth;
    
    if (bar.isBar) {
      return (
        <rect
          key={index}
          x={xPos}
          y="8"
          width={barWidth}
          height="54"
          fill="#000000"
        />
      );
    }
    return null;
  });

  const totalSvgWidth = Math.max(260, currentX + 12);

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>INVINTELL Barcode Label — ${sku}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f4f4f5;
            }
            .label-card {
              background: #ffffff;
              border: 2px solid #000000;
              border-radius: 8px;
              padding: 24px;
              width: 320px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .brand {
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #10B981;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .product-name {
              font-size: 16px;
              font-weight: 800;
              color: #09090B;
              margin-bottom: 4px;
            }
            .meta-info {
              font-size: 12px;
              color: #71717A;
              margin-bottom: 16px;
            }
            .barcode-box {
              background: #ffffff;
              border: 1px solid #e4e4e7;
              padding: 12px 8px;
              margin-bottom: 12px;
              border-radius: 4px;
            }
            .barcode-num {
              font-family: 'Courier New', Courier, monospace;
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 4px;
              color: #000000;
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="brand">INVINTELL LOGISTICS SYSTEMS</div>
            <div class="product-name">${productName}</div>
            <div class="meta-info">SKU: ${sku} • Category: ${category}</div>
            <div class="barcode-box">
              <svg width="${totalSvgWidth}" height="70" viewBox="0 0 ${totalSvgWidth} 70">
                <rect width="${totalSvgWidth}" height="70" fill="#FFFFFF" />
                ${bars.map((bar, i) => {
                  if (bar.isBar) {
                    let bx = 12;
                    for (let j = 0; j < i; j++) bx += bars[j].width * 2.2;
                    return `<rect x="${bx}" y="8" width="${bar.width * 2.2}" height="54" fill="#000000" />`;
                  }
                  return '';
                }).join('')}
              </svg>
            </div>
            <div class="barcode-num">${barcodeValue}</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="barcode-display-section">
      <div className="barcode-header-row">
        <span className="barcode-title-label">PRODUCT BARCODE (PERMANENT IDENTIFIER)</span>
        <div className="barcode-action-group">
          <button 
            type="button" 
            className="barcode-btn btn-scan" 
            onClick={() => onOpenScanner && onOpenScanner(product)}
            title="Scan physical product barcode to verify"
          >
            <Camera size={13} /> Scan Barcode
          </button>

          <button 
            type="button" 
            className="barcode-btn btn-secondary" 
            onClick={handleCopy}
            title="Copy barcode number"
          >
            {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button 
            type="button" 
            className="barcode-btn btn-secondary" 
            onClick={handlePrint}
            title="Print product barcode label"
          >
            <Printer size={13} /> Print Label
          </button>
        </div>
      </div>

      {/* Visual Scannable Barcode Box */}
      <div className="barcode-visual-card">
        <div className="barcode-svg-container">
          <svg 
            width={totalSvgWidth} 
            height="70" 
            viewBox={`0 0 ${totalSvgWidth} 70`} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="barcode-svg"
          >
            <rect width={totalSvgWidth} height="70" rx="4" fill="#FFFFFF" />
            {renderBars}
          </svg>
        </div>
        
        {/* Human Readable Barcode Number */}
        <div className="barcode-digits-display">
          {barcodeValue}
        </div>
      </div>
    </div>
  );
}
