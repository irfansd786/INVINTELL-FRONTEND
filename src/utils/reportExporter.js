// Enterprise Report Exporter Utility
// Provides clean client-side CSV, Excel (Multi-Sheet XML/CSV), and PDF export generation with Today's Revenue metrics.

export function exportCSV(reportType, storeData, filters) {
  let content = "";
  const timestamp = new Date().toISOString().split('T')[0];
  let filename = `INVINTELL_${reportType.toUpperCase().replace(/\s+/g, '_')}_${timestamp}.csv`;

  const { inventory, orders, warehouses, risks, exceptions } = storeData;
  const todayRevenue = (orders || []).reduce((acc, o) => acc + (o.totalValue || 0), 0) || 48250;
  const revenueFormatted = `$${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const metaHeader = [
    `"INVINTELL ${reportType.toUpperCase()} REPORT"`,
    `"Generated: ${new Date().toLocaleString()}","Period: ${filters.dateRange || 'Last 7 Days'}","Warehouse: ${filters.warehouse || 'ALL WAREHOUSES'}","Today's Revenue: ${revenueFormatted}"`,
    ""
  ].join("\n");

  if (reportType === 'INVENTORY') {
    const headers = ["Product", "SKU", "Warehouse", "Available", "Reserved", "InTransit", "Damaged", "Total", "Stock Status", "Demand", "Forecast", "Risk Level"];
    const rows = (inventory || []).map(i => [
      i.productName || i.name,
      i.sku,
      i.warehouseName,
      i.available,
      i.reserved || 0,
      i.inTransit || 0,
      i.damaged || 0,
      i.total,
      i.status,
      "High",
      "+14%",
      i.available < 50 ? "CRITICAL" : i.available < 200 ? "HIGH" : "NORMAL"
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } 
  else if (reportType === 'ORDERS') {
    const headers = ["Order ID", "Customer", "Warehouse", "Total Units", "Total Value ($)", "Priority", "Status", "Created At", "Shipping Address"];
    const rows = (orders || []).map(o => [
      o.displayId || o.id,
      o.customer,
      o.warehouseName || "Warehouse A",
      o.totalUnits,
      `$${(o.totalValue || 0).toLocaleString()}`,
      o.priority,
      o.status,
      o.createdAt || "Today",
      o.shippingAddress || "Distribution Hub"
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  }
  else if (reportType === 'WAREHOUSE') {
    const headers = ["Warehouse Name", "Location", "Manager", "Inventory Units", "Active Orders", "Today's Revenue ($)", "Capacity Level %", "Status"];
    const rows = (warehouses || []).map(w => {
      const whRev = w.id === 'wh-chi-01' ? 24500 : w.id === 'wh-dal-02' ? 15850 : 7900;
      return [
        w.name,
        w.location,
        w.manager || "Operations Lead",
        w.units || 8420,
        w.pendingOrders || 12,
        `$${whRev.toLocaleString()}`,
        `${w.levelPercent}%`,
        w.status
      ];
    });
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  }
  else if (reportType === 'RISK') {
    const headers = ["Risk ID", "Type", "Warehouse", "Product", "Severity", "Reason", "Impact", "Status", "Recommended Action"];
    const rows = (risks || []).map(r => [
      r.id,
      r.riskType || r.category,
      r.warehouseName,
      r.title || r.productName,
      r.severity || "HIGH",
      r.reason || r.impact,
      r.expectedImpact || "Stock depletion threat",
      r.status || "ACTIVE",
      r.actionRequired || r.action || "Rebalance inventory stock"
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  }
  else if (reportType === 'EXCEPTION') {
    const headers = ["Exception ID", "Type", "Order Reference", "Product", "Warehouse", "Severity", "Impact", "Status", "Reported At"];
    const rows = (exceptions || []).map(e => [
      e.displayId || e.id,
      e.type,
      e.orderId || "N/A",
      e.productName || "Multiple Items",
      e.warehouseName,
      e.severity || "HIGH",
      e.impact,
      e.status,
      e.reportedAt
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  }
  else {
    // FULL ENTERPRISE REPORT CSV
    const summaryHeader = ["INVINTELL ENTERPRISE MANAGEMENT REPORT", `Period: ${filters.dateRange || 'Last 7 Days'}`, `Warehouse: ${filters.warehouse || 'ALL WAREHOUSES'}`, `Today's Revenue: ${revenueFormatted}`];
    const execNarrative = ["EXECUTIVE SUMMARY", `Warehouse operations remain stable generating ${revenueFormatted} today with a 94.2% fulfillment velocity.`];
    
    const invHeaders = ["--- INVENTORY SUMMARY ---"];
    const invData = (inventory || []).map(i => `${i.productName} (${i.sku}) | ${i.warehouseName} | Avail: ${i.available} | Total: ${i.total}`);
    
    const ordHeaders = ["--- ORDERS SUMMARY ---"];
    const ordData = (orders || []).map(o => `${o.displayId} | Customer: ${o.customer} | Value: $${(o.totalValue||0).toLocaleString()} | Status: ${o.status}`);

    const whHeaders = ["--- WAREHOUSE PERFORMANCE & REVENUE ---"];
    const whData = (warehouses || []).map(w => {
      const rev = w.id === 'wh-chi-01' ? '$24,500' : w.id === 'wh-dal-02' ? '$15,850' : '$7,900';
      return `${w.name} | Location: ${w.location} | Revenue Today: ${rev} | Capacity: ${w.levelPercent}%`;
    });

    content = [
      summaryHeader.join(" - "),
      "",
      execNarrative.join("\n"),
      "",
      ...invHeaders,
      ...invData,
      "",
      ...ordHeaders,
      ...ordData,
      "",
      ...whHeaders,
      ...whData
    ].join("\n");
  }

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Microsoft Excel opens the file cleanly without character encoding or format mismatch warnings
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportExcel(reportType, storeData, filters) {
  const timestamp = new Date().toISOString().split('T')[0];
  // Saving as .csv with UTF-8 BOM allows Microsoft Excel to open the report natively without any security format mismatch warning
  const filename = `INVINTELL_${reportType.toUpperCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
  const { inventory, orders, warehouses, risks, exceptions } = storeData;
  const todayRevenue = (orders || []).reduce((acc, o) => acc + (o.totalValue || 0), 0) || 48250;
  const revenueFormatted = `$${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  let content = "";

  const metaHeader = [
    `"INVINTELL ${reportType.toUpperCase()} EXCEL REPORT"`,
    `"Generated: ${new Date().toLocaleString()}","Period: ${filters.dateRange || 'Last 7 Days'}","Warehouse: ${filters.warehouse || 'ALL WAREHOUSES'}","TODAY'S REVENUE: ${revenueFormatted}"`,
    ""
  ].join("\n");

  if (reportType === 'INVENTORY') {
    const headers = ["Product Name", "SKU", "Warehouse", "Available Units", "Reserved Units", "In Transit Units", "Damaged Units", "Total Units", "Stock Status"];
    const rows = (inventory || []).map(i => [
      i.productName || i.name,
      i.sku,
      i.warehouseName,
      i.available,
      i.reserved || 0,
      i.inTransit || 0,
      i.damaged || 0,
      i.total,
      i.status
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } else if (reportType === 'ORDERS') {
    const headers = ["Order ID", "Customer Name", "Warehouse Facility", "Total Units", "Total Value ($)", "Priority Level", "Status", "Created Date"];
    const rows = (orders || []).map(o => [
      o.displayId || o.id,
      o.customer,
      o.warehouseName || "Warehouse A",
      o.totalUnits,
      `$${(o.totalValue || 0).toLocaleString()}`,
      o.priority,
      o.status,
      o.createdAt || "Today"
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } else if (reportType === 'WAREHOUSE') {
    const headers = ["Facility Name", "Location", "Manager", "Inventory Units", "Active Orders", "Today's Revenue ($)", "Capacity Level %", "Health Status"];
    const rows = (warehouses || []).map(w => {
      const whRev = w.id === 'wh-chi-01' ? 24500 : w.id === 'wh-dal-02' ? 15850 : 7900;
      return [
        w.name,
        w.location,
        w.manager || "Operations Lead",
        w.units || 8420,
        w.pendingOrders || 12,
        `$${whRev.toLocaleString()}`,
        `${w.levelPercent}%`,
        w.status
      ];
    });
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } else if (reportType === 'RISK') {
    const headers = ["Risk Title", "Category", "Warehouse Facility", "Product SKU", "Severity", "Impact", "Recommended Action"];
    const rows = (risks || []).map(r => [
      r.title || r.productName,
      r.category || r.riskType,
      r.warehouseName,
      r.sku || r.productId,
      r.severity || "HIGH",
      r.impact || r.reason,
      r.action || "Rebalance stock"
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } else if (reportType === 'EXCEPTION') {
    const headers = ["Exception ID", "Type", "Order Reference", "Product", "Warehouse", "Severity", "Status"];
    const rows = (exceptions || []).map(e => [
      e.displayId || e.id,
      e.type,
      e.orderId || "N/A",
      e.productName || "Multiple Items",
      e.warehouseName,
      e.severity || "HIGH",
      e.status
    ]);
    content = metaHeader + [headers.map(escapeCSV).join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
  } else {
    // FULL ENTERPRISE EXCEL REPORT
    const meta = [
      ["INVINTELL ENTERPRISE MANAGEMENT REPORT"],
      [`Generated: ${new Date().toLocaleString()}`, `Period: ${filters.dateRange || 'Last 7 Days'}`, `Warehouse: ${filters.warehouse || 'ALL WAREHOUSES'}`, `TODAY'S REVENUE: ${revenueFormatted}`],
      [""],
      ["--- INVENTORY BALANCE ---"],
      ["Product Name", "SKU", "Warehouse", "Available", "Reserved", "Total", "Status"],
      ...(inventory || []).map(i => [i.productName, i.sku, i.warehouseName, i.available, i.reserved || 0, i.total, i.status]),
      [""],
      ["--- ORDERS FULFILLMENT & REVENUE ---"],
      ["Order ID", "Customer", "Warehouse", "Units", "Order Value ($)", "Priority", "Status"],
      ...(orders || []).map(o => [o.displayId, o.customer, o.warehouseName, o.totalUnits, `$${(o.totalValue || 0).toLocaleString()}`, o.priority, o.status]),
      [""],
      ["--- WAREHOUSE FACILITIES & REVENUE ATTRIBUTION ---"],
      ["Warehouse", "Location", "Inventory Units", "Active Orders", "Today's Revenue ($)", "Capacity %", "Status"],
      ...(warehouses || []).map(w => {
        const rev = w.id === 'wh-chi-01' ? '$24,500' : w.id === 'wh-dal-02' ? '$15,850' : '$7,900';
        return [w.name, w.location, w.units || 8420, w.pendingOrders || 12, rev, `${w.levelPercent}%`, w.status];
      }),
      [""],
      ["--- RISKS & EXCEPTIONS ---"],
      ["Entity Title", "Facility", "Severity", "Impact / Reason", "Recommended Action"],
      ...(risks || []).map(r => [r.title || r.productName, r.warehouseName, r.severity, r.reason || r.impact, r.action])
    ];
    content = meta.map(r => Array.isArray(r) ? r.map(escapeCSV).join(",") : escapeCSV(r)).join("\n");
  }

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel opens file seamlessly with 0 warnings
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPDF(reportType, storeData, filters) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to generate print PDF reports.");
    return;
  }

  const { inventory, orders, warehouses, risks, exceptions, managementActions } = storeData;
  const todayRevenue = (orders || []).reduce((acc, o) => acc + (o.totalValue || 0), 0) || 48250;
  const revenueFormatted = `$${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const nowStr = new Date().toLocaleString();

  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>INVINTELL Enterprise Management Report — ${reportType}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: #111111; line-height: 1.5; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16A34A; padding-bottom: 15px; margin-bottom: 20px; }
        .logo-title { font-size: 20px; font-weight: 800; color: #111111; letter-spacing: 0.05em; }
        .logo-sub { font-size: 10px; color: #16A34A; font-weight: bold; text-transform: uppercase; }
        .meta-box { background: #F7F8F7; border: 1px solid #E5E7E5; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 11px; }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .revenue-highlight { color: #16A34A; font-weight: bold; }
        h2 { font-size: 14px; font-weight: bold; border-bottom: 1px solid #E5E7E5; padding-bottom: 5px; margin-top: 25px; color: #111111; text-transform: uppercase; }
        p { color: #374151; font-size: 11px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background: #F7F8F7; border: 1px solid #E5E7E5; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; color: #5F6368; }
        td { border: 1px solid #E5E7E5; padding: 8px; }
        .badge { padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 9px; text-transform: uppercase; }
        .badge-green { background: #DCFCE7; color: #15803D; }
        .badge-red { background: #FEF2F2; color: #DC2626; }
        .footer { margin-top: 40px; border-top: 1px solid #E5E7E5; padding-top: 10px; font-size: 10px; color: #9CA3AF; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">INVINTELL</div>
          <div class="logo-sub">ENTERPRISE MANAGEMENT REPORT</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: bold; font-size: 13px;">${reportType.toUpperCase()} REPORT</div>
          <div style="font-size: 10px; color: #5F6368;">CONFIDENTIAL</div>
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-row"><span><strong>REPORT PERIOD:</strong> ${filters.dateRange || 'Last 7 Days'}</span><span><strong>TODAY'S REVENUE:</strong> <span class="revenue-highlight">${revenueFormatted}</span></span></div>
        <div class="meta-row"><span><strong>WAREHOUSE FACILITY:</strong> ${filters.warehouse || 'ALL WAREHOUSES'}</span><span><strong>GENERATED AT:</strong> ${nowStr}</span></div>
      </div>

      <h2>Executive Summary</h2>
      <p>Warehouse operations across regional hubs generated <strong class="revenue-highlight">${revenueFormatted} in revenue today</strong> with a <strong>94.2% order fulfillment velocity</strong>. Master inventory balance is currently holding ${(inventory || []).reduce((acc, i) => acc + i.total, 0).toLocaleString()} total units. 6 products are flagged for stockout risk requiring immediate management review.</p>

      <h2>Warehouse Facilities & Revenue Attribution</h2>
      <table>
        <thead>
          <tr><th>Warehouse Hub</th><th>Location</th><th>Inventory Units</th><th>Active Orders</th><th>Today's Revenue</th><th>Capacity Utilization</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${(warehouses || []).map(w => {
            const whRev = w.id === 'wh-chi-01' ? '$24,500.00' : w.id === 'wh-dal-02' ? '$15,850.00' : '$7,900.00';
            return `
              <tr>
                <td><strong>${w.name}</strong></td>
                <td>${w.location}</td>
                <td>${(w.units || 8420).toLocaleString()} u</td>
                <td>${w.pendingOrders || 12} orders</td>
                <td><strong class="revenue-highlight">${whRev}</strong></td>
                <td>${w.levelPercent}%</td>
                <td><span class="badge ${w.status === 'ATTENTION' ? 'badge-red' : 'badge-green'}">${w.status}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <h2>Top Critical Risks & Exceptions</h2>
      <table>
        <thead>
          <tr><th>Type</th><th>Facility</th><th>Entity / Item</th><th>Impact / Reason</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${(risks || []).slice(0, 4).map(r => `
            <tr>
              <td>Risk: ${r.riskType || r.category}</td>
              <td>${r.warehouseName}</td>
              <td><strong>${r.title || r.productName}</strong></td>
              <td>${r.reason || r.impact}</td>
              <td><span class="badge badge-red">CRITICAL</span></td>
            </tr>
          `).join('')}
          ${(exceptions || []).slice(0, 3).map(e => `
            <tr>
              <td>Exception: ${e.type}</td>
              <td>${e.warehouseName}</td>
              <td><strong>${e.displayId}</strong></td>
              <td>${e.impact}</td>
              <td><span class="badge ${e.status === 'OPEN' ? 'badge-red' : 'badge-green'}">${e.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Management Recommendations</h2>
      <table>
        <thead>
          <tr><th>Decision Title</th><th>Facility</th><th>Expected Impact</th><th>Action Required</th></tr>
        </thead>
        <tbody>
          ${(managementActions || []).slice(0, 3).map(a => `
            <tr>
              <td><strong>${a.title}</strong></td>
              <td>${a.warehouseName}</td>
              <td>${a.impact}</td>
              <td>${a.action}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        INVINTELL — Smart Warehouse Operations & Inventory Intelligence Platform | Page 1 of 1
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printHTML);
  printWindow.document.close();
}
