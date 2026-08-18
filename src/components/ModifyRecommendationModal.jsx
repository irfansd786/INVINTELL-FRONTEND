import React, { useState } from 'react';
import { X, Sliders, CheckCircle, Percent, ArrowRightLeft, Tag } from 'lucide-react';
import './ModifyRecommendationModal.css';

export default function ModifyRecommendationModal({ 
  isOpen, 
  onClose, 
  riskItem, 
  onApply 
}) {
  const [offerType, setOfferType] = useState(riskItem?.suggestedAction || 'CLEARANCE_CAMPAIGN');
  const [discountPercent, setDiscountPercent] = useState(riskItem?.suggestedDiscount || 15);
  const [targetWarehouse, setTargetWarehouse] = useState('wh-dal-02');
  const [notes, setNotes] = useState('');

  if (!isOpen || !riskItem) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({
      riskId: riskItem.id,
      productId: riskItem.productId,
      offerType,
      discountPercent,
      targetWarehouse: offerType === 'WAREHOUSE_REALLOCATION' ? targetWarehouse : null,
      notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modify-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Sliders size={20} className="modal-icon" />
            <div>
              <h3>Modify Risk Recommendation</h3>
              <p className="modal-sub">{riskItem.productName} ({riskItem.sku})</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Risk Summary Banner */}
        <div className="modal-risk-banner">
          <div className="banner-item">
            <span className="b-label">Current Stock</span>
            <span className="b-val">{riskItem.currentStock || riskItem.stockQuantity} units</span>
          </div>
          <div className="banner-item">
            <span className="b-label">Days to Expiry</span>
            <span className="b-val warning-text">{riskItem.daysRemaining} days</span>
          </div>
          <div className="banner-item">
            <span className="b-label">Sales Velocity</span>
            <span className="b-val danger-text">{riskItem.salesVelocity || 'Very Low'}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modify-form">
          {/* Select Offer Type */}
          <div className="form-group">
            <label>Management Recommendation Type</label>
            <select 
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              className="form-select"
            >
              <option value="CLEARANCE_CAMPAIGN">Clearance Campaign (Discounted Price)</option>
              <option value="BUNDLE_OFFER">Bundle Offer (Combine with Fast-Moving SKU)</option>
              <option value="PROMOTIONAL_CAMPAIGN">Promotional Banner Campaign</option>
              <option value="WAREHOUSE_REALLOCATION">Inter-Warehouse Reallocation</option>
            </select>
          </div>

          {/* Discount Slider if Discount or Clearance */}
          {(offerType === 'CLEARANCE_CAMPAIGN' || offerType === 'BUNDLE_OFFER' || offerType === 'PROMOTIONAL_CAMPAIGN') && (
            <div className="form-group">
              <div className="label-with-val">
                <label>Suggested Discount Rate</label>
                <span className="slider-val">{discountPercent}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="5"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="form-range"
              />
              <div className="range-min-max">
                <span>5% (Light Markdown)</span>
                <span>25% (Standard Clearance)</span>
                <span>50% (Flash Liquidation)</span>
              </div>
            </div>
          )}

          {/* Target Warehouse if Reallocation */}
          {offerType === 'WAREHOUSE_REALLOCATION' && (
            <div className="form-group">
              <label>Target Reallocation Warehouse</label>
              <select 
                value={targetWarehouse}
                onChange={(e) => setTargetWarehouse(e.target.value)}
                className="form-select"
              >
                <option value="wh-chi-01">Warehouse A (Chicago Hub)</option>
                <option value="wh-dal-02">Warehouse B (Dallas Hub)</option>
                <option value="wh-la-03">Warehouse C (Los Angeles Hub)</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label>Management Notes / Strategy Instructions</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Authorized by Operations Director. Initiate campaign starting Monday..."
              rows={3}
              className="form-textarea"
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save-apply">
              <CheckCircle size={16} /> Save & Apply Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
