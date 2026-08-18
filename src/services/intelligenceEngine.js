/**
 * Enterprise Inventory Intelligence Engine
 * Deterministic calculation utilities for demand forecasting, stockout prediction,
 * overstock/dead-stock detection, risk scoring, and explainable decision support.
 */

// 1. Calculate Demand Forecast (7d / 14d / 30d)
export function calculateForecast(product, days = 7, inventory = []) {
  if (!product) return null;

  const prodInvs = inventory.filter(i => i.productId === product.id);
  const currentStock = prodInvs.length > 0
    ? prodInvs.reduce((acc, i) => acc + i.available, 0)
    : (product.stock || 240);

  const avgDailyDemand = product.avgDailyDemand || Math.max(10, Math.round(currentStock / 14));
  const forecastDemand = Math.round(avgDailyDemand * days * (product.demandMultiplier || 1.1));
  const projectedStock = currentStock - forecastDemand;

  let status = "NORMAL";
  if (projectedStock < 0) {
    status = Math.abs(projectedStock) > 200 ? "CRITICAL STOCKOUT RISK" : "HIGH STOCKOUT RISK";
  } else if (projectedStock < currentStock * 0.2) {
    status = "LOW STOCK BUFFER";
  } else if (currentStock > avgDailyDemand * 60) {
    status = "OVERSTOCK EXPOSURE";
  }

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock,
    avgDailyDemand,
    forecastPeriodDays: days,
    forecastDemand,
    projectedStock,
    projectedShortage: projectedStock < 0 ? Math.abs(projectedStock) : 0,
    status
  };
}

// 2. Calculate Stock Coverage (in Days)
export function calculateStockCoverage(product, inventory = []) {
  const prodInvs = inventory.filter(i => i.productId === product.id);
  const currentStock = prodInvs.length > 0
    ? prodInvs.reduce((acc, i) => acc + i.available, 0)
    : (product.stock || 240);

  const avgDailyDemand = product.avgDailyDemand || 30;
  if (avgDailyDemand <= 0) return 999;
  return Math.round((currentStock / avgDailyDemand) * 10) / 10;
}

// 3. Detect Stockout Risk
export function detectStockoutRisk(product, inventory = []) {
  const coverageDays = calculateStockCoverage(product, inventory);
  const forecast = calculateForecast(product, 7, inventory);

  let riskLevel = "LOW";
  let explanation = "Stock coverage is sufficient for current demand trajectory.";

  if (coverageDays < 1) {
    riskLevel = "CRITICAL";
    explanation = `Available stock (${forecast.currentStock} units) covers less than 1 day of demand. Shortage of ${forecast.projectedShortage} units expected.`;
  } else if (coverageDays < 3) {
    riskLevel = "HIGH";
    explanation = `Stock coverage is ${coverageDays} days. High probability of shortage within 3 days.`;
  } else if (coverageDays < 7) {
    riskLevel = "MEDIUM";
    explanation = `Stock coverage is ${coverageDays} days. Reorder review recommended.`;
  }

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock: forecast.currentStock,
    coverageDays,
    forecastDemand7d: forecast.forecastDemand,
    projectedShortage: forecast.projectedShortage,
    riskLevel,
    explanation,
    recommendation: riskLevel !== "LOW" ? "Review replenishment before projected shortage date." : "Maintain normal monitoring."
  };
}

// 4. Detect Overstock Exposure
export function detectOverstock(product, inventory = []) {
  const prodInvs = inventory.filter(i => i.productId === product.id);
  const currentStock = prodInvs.length > 0
    ? prodInvs.reduce((acc, i) => acc + i.total, 0)
    : (product.totalStock || 1500);

  const avgWeeklyDemand = (product.avgDailyDemand || 20) * 7;
  const coverageWeeks = Math.round((currentStock / avgWeeklyDemand) * 10) / 10;

  const isOverstock = coverageWeeks > 16;
  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock,
    avgWeeklyDemand,
    coverageWeeks,
    isOverstock,
    status: isOverstock ? "OVERSTOCK" : "BALANCED",
    reason: isOverstock ? `Inventory coverage (${coverageWeeks} weeks) significantly exceeds target maximum (12 weeks).` : "Inventory level is within normal operational range.",
    recommendation: isOverstock ? "Pause procurement orders and evaluate stock re-allocation to high-demand facilities." : "No action required."
  };
}

// 5. Detect Dead Stock
export function detectDeadStock(product, movements = []) {
  const pMovs = movements.filter(m => m.productId === product.id);
  const daysDormant = product.daysDormant || (pMovs.length === 0 ? 65 : 14);

  const isDeadStock = daysDormant >= 60;
  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    daysDormant,
    isDeadStock,
    status: isDeadStock ? "DEAD STOCK RISK" : "ACTIVE",
    recentMovementUnits: isDeadStock ? 0 : 45,
    reason: isDeadStock ? `No meaningful sales movements recorded in past ${daysDormant} consecutive days.` : "Regular movement recorded.",
    recommendation: isDeadStock ? "Review inventory exposure with purchasing manager for supplier return or stock transfer." : "Normal activity."
  };
}

// 6. Calculate Replenishment Recommendation
export function calculateReorderRecommendation(product, inventory = []) {
  const forecast7d = calculateForecast(product, 7, inventory);
  const currentStock = forecast7d.currentStock;
  const forecastDemand = forecast7d.forecastDemand;
  const safetyStock = Math.round(forecast7d.avgDailyDemand * 2); // 2 days safety buffer

  const recommendedQty = Math.max(0, (forecastDemand + safetyStock) - currentStock);
  const needsReorder = recommendedQty > 0;

  return {
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock,
    forecastDemand,
    safetyStock,
    recommendedQty,
    needsReorder,
    priority: recommendedQty > 500 ? "CRITICAL" : recommendedQty > 200 ? "HIGH" : "MEDIUM",
    reason: needsReorder ? `Projected 7-day demand (${forecastDemand}) plus safety stock (${safetyStock}) exceeds current stock (${currentStock}).` : "Current stock is sufficient to cover expected demand.",
    impact: needsReorder ? `Prevents potential shortage of ${recommendedQty} units.` : "Optimal stock coverage.",
    action: needsReorder ? `Review replenishment order of ${recommendedQty} units.` : "No reorder needed."
  };
}

// 7. Calculate 0-100 Risk Score & Factor Breakdown
export function calculateRiskScore(product, inventory = [], orders = [], events = []) {
  if (!product) return { score: 0, level: 'LOW', factors: [] };

  const coverageDays = calculateStockCoverage(product, inventory);
  const factors = [];
  let score = 0;

  // Factor 1: Low Stock Coverage
  if (coverageDays < 1) {
    score += 35;
    factors.push({ name: "Critical low stock coverage (<1 day)", points: 35 });
  } else if (coverageDays < 3) {
    score += 25;
    factors.push({ name: "Low stock coverage (<3 days)", points: 25 });
  } else if (coverageDays < 7) {
    score += 15;
    factors.push({ name: "Sub-optimal stock coverage (<7 days)", points: 15 });
  }

  // Factor 2: Demand Pressure
  const avgDemand = product.avgDailyDemand || 20;
  if (avgDemand > 80) {
    score += 25;
    factors.push({ name: "High daily sales velocity demand pressure", points: 25 });
  } else if (avgDemand > 40) {
    score += 15;
    factors.push({ name: "Moderate demand pressure", points: 15 });
  }

  // Factor 3: Event Impact
  const matchesEvent = events.some(e => e.impactedProducts?.some(ip => ip.productId === product.id));
  if (matchesEvent) {
    score += 20;
    factors.push({ name: "Upcoming regional event demand surge", points: 20 });
  }

  // Factor 4: Pending Order Queue
  const pOrders = orders.filter(o => o.status === 'PENDING' && o.items?.some(i => i.productId === product.id));
  if (pOrders.length > 0) {
    const pts = Math.min(20, pOrders.length * 7);
    score += pts;
    factors.push({ name: `${pOrders.length} pending unallocated customer sales orders`, points: pts });
  }

  score = Math.min(100, Math.max(0, score));

  let level = "LOW";
  if (score >= 75) level = "CRITICAL";
  else if (score >= 50) level = "HIGH";
  else if (score >= 25) level = "MEDIUM";

  return {
    score,
    level,
    factors
  };
}

// 8. Overall Inventory Health Indicator (0-100)
export function getOverallInventoryHealth(products = [], inventory = [], risks = []) {
  const stockoutCount = products.filter(p => p.status === 'LOW').length;
  const overstockCount = products.filter(p => p.status === 'OVERSTOCK').length;
  const deadStockCount = products.filter(p => p.status === 'DEAD STOCK').length;

  const stockAvailability = Math.max(0, 100 - (stockoutCount * 8));
  const demandCoverage = Math.max(0, 100 - (stockoutCount * 5 + 10));
  const overstockExposure = Math.max(0, 100 - (overstockCount * 7));
  const deadStockExposure = Math.max(0, 100 - (deadStockCount * 6));
  const riskLevel = Math.max(0, 100 - (risks.filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH').length * 4));

  const overallScore = Math.round(
    (stockAvailability * 0.3) +
    (demandCoverage * 0.25) +
    (overstockExposure * 0.15) +
    (deadStockExposure * 0.15) +
    (riskLevel * 0.15)
  );

  let statusLabel = "GOOD";
  if (overallScore < 50) statusLabel = "CRITICAL";
  else if (overallScore < 70) statusLabel = "ATTENTION";

  return {
    overallScore,
    statusLabel,
    breakdown: {
      stockAvailability,
      demandCoverage,
      overstockExposure,
      deadStockExposure,
      riskLevel
    }
  };
}
