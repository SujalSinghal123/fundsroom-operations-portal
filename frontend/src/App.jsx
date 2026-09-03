import React, { useState } from 'react';

export default function App() {
  // Top Counters as seen in Image 2
  const [customerAccounts, setCustomerAccounts] = useState(2);
  const [warehouseUnits, setWarehouseUnits] = useState(19);
  const [lowStockWarnings, setLowStockWarnings] = useState(3);
  const [challansCount, setChallansCount] = useState(10);

  // Success Banner State
  const [successMsg, setSuccessMsg] = useState('Sales Challan CH-082203 recorded successfully!');

  // Dropdown Data
  const customersList = [
    { id: '1', name: 'Vikram Patel', business: 'Patel Logistics' },
    { id: '2', name: 'Rajesh Sharma', business: 'Sharma Enterprises' }
  ];

  const productsList = [
    { id: 'p1', name: 'Heavy Duty Pallet Racks', stock: 10 },
    { id: 'p2', name: 'Hydraulic Forklift Pallet Truck 2.5T', stock: 6 },
    { id: 'p3', name: 'Barcode Scanner Pro Wireless', stock: 3 }
  ];

  // Form State
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dispatchState, setDispatchState] = useState('Confirmed (Immediate Stock Reduction)');

  // Challan Dispatch Records Table Data (exact from Image 2)
  const [records, setRecords] = useState([
    { id: 'CH-082203', customer: 'Vikram Patel', qty: '1 units', status: 'Confirmed' },
    { id: 'CH-061853', customer: 'Rajesh Sharma', qty: '1 units', status: 'Confirmed' },
    { id: 'CH-756822', customer: 'Vikram Patel', qty: '3 units', status: 'Confirmed' },
    { id: 'CH-735081', customer: 'Vikram Patel', qty: '3 units', status: 'Confirmed' },
    { id: 'CH-732341', customer: 'Vikram Patel', qty: '3 units', status: 'Confirmed' },
    { id: 'CH-539689', customer: 'Rajesh Sharma', qty: '5 units', status: 'Confirmed' },
    { id: 'CH-519621', customer: 'Rajesh Sharma', qty: '3 units', status: 'Confirmed' },
    { id: 'CH-492626', customer: 'Rajesh Sharma', qty: '2 units', status: 'Confirmed' },
    { id: 'CH-491595', customer: 'Rajesh Sharma', qty: '2 units', status: 'Confirmed' },
    { id: 'CH-488480', customer: 'Rajesh Sharma', qty: '2 units', status: 'Confirmed' }
  ]);

  // Handle Form Submission
  const handleDispatch = (e) => {
    e.preventDefault();
    if (!selectedPartner) {
      alert('Please select a partner / consignee');
      return;
    }
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    const partnerObj = customersList.find((c) => c.id === selectedPartner);
    const newChallanId = `CH-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord = {
      id: newChallanId,
      customer: partnerObj ? partnerObj.name : 'Vikram Patel',
      qty: `${quantity} units`,
      status: 'Confirmed'
    };

    setRecords([newRecord, ...records]);
    setChallansCount((prev) => prev + 1);
    setWarehouseUnits((prev) => Math.max(0, prev - Number(quantity)));
    setSuccessMsg(`Sales Challan ${newChallanId} recorded successfully!`);

    // Reset Form fields
    setSelectedPartner('');
    setSelectedProduct('');
    setQuantity(1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f1422', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 16px' }}>
        <div>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '42px', height: '42px', backgroundColor: '#4f46e5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#ffffff', fontSize: '18px' }}>
              FR
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff' }}>Fundsroom</span>
                <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '4px' }}>PRO</span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.08em', marginTop: '3px' }}>OPERATIONS SUITE</div>
            </div>
          </div>

          {/* Nav Section */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '12px' }}>
            ENTERPRISE CORE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
              <span>📄 Sales Challans</span>
              <span style={{ backgroundColor: '#1e1b4b', color: '#ffffff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{challansCount}</span>
            </button>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'transparent', color: '#94a3b8', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              <span>📦 Inventory & Stocks</span>
              <span style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', fontSize: '10px', padding: '2px 6px', borderRadius: '12px' }}>!</span>
            </button>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'transparent', color: '#94a3b8', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              <span>👥 Customer CRM</span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{customerAccounts}</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Sales Lead</div>
              <div style={{ fontSize: '10px', color: '#38bdf8', letterSpacing: '0.05em' }}>SALES PERSONA</div>
            </div>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          </div>
          <button style={{ width: '100%', padding: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header */}
        <header style={{ height: '56px', borderBottom: '1px solid #1e293b', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c101d' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Workspace / <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Challans View</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34d399', backgroundColor: '#064e3b33', padding: '4px 10px', borderRadius: '6px', border: '1px solid #065f46' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Neon Cloud DB Live
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top 4 Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {/* Metric 1 */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>CUSTOMER ACCOUNTS</span>
                <span style={{ fontSize: '14px', color: '#6366f1' }}>👥</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{customerAccounts}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Verified partner entities</div>
            </div>

            {/* Metric 2 */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>WAREHOUSE TOTAL UNITS</span>
                <span style={{ fontSize: '14px', color: '#f59e0b' }}>📦</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{warehouseUnits}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Live physical count</div>
            </div>

            {/* Metric 3 */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>LOW STOCK WARNINGS</span>
                <span style={{ fontSize: '14px', color: '#ef4444' }}>⚠️</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{lowStockWarnings}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Below minimum threshold</div>
            </div>

            {/* Metric 4 */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>CHALLANS GENERATED</span>
                <span style={{ fontSize: '14px', color: '#8b5cf6' }}>📄</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{challansCount}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Audit log records</div>
            </div>
          </div>

          {/* Green Alert Banner */}
          {successMsg && (
            <div style={{ backgroundColor: '#064e3b40', border: '1px solid #065f46', borderRadius: '8px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', fontSize: '13px' }}>
              <span>{successMsg}</span>
              <span onClick={() => setSuccessMsg('')} style={{ cursor: 'pointer', color: '#6ee7b7', fontWeight: 'bold' }}>✕</span>
            </div>
          )}

          {/* Form & Table Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            {/* Issue Sales Challan Form Card */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Issue Sales Challan</h3>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', marginBottom: '18px' }}>Deducts inventory stock transactionally</p>

              <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>SELECT PARTNER</label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: '#0a0d18', border: '1px solid #3b82f6', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="">-- Choose Consignee --</option>
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id} style={{ backgroundColor: '#0f1422', color: '#ffffff' }}>
                        {c.name} ({c.business})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>PRODUCT LINE</label>
                    <span style={{ fontSize: '11px', color: '#6366f1', cursor: 'pointer' }}>+ Add Line</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      style={{ flex: 1, padding: '9px 12px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="">Select Item...</option>
                      {productsList.map((p) => (
                        <option key={p.id} value={p.id} style={{ backgroundColor: '#0f1422', color: '#ffffff' }}>
                          {p.name} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{ width: '60px', padding: '9px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#ffffff', fontSize: '12px', textAlign: 'center', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>DISPATCH STATE</label>
                  <select
                    value={dispatchState}
                    onChange={(e) => setDispatchState(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  >
                    <option value="Confirmed (Immediate Stock Reduction)">Confirmed (Immediate Stock Reduction)</option>
                    <option value="Draft">Draft Order</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{ width: '100%', padding: '11px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
                >
                  Process Challan Dispatch
                </button>
              </form>
            </div>

            {/* Challan Dispatch Records Table Card */}
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Challan Dispatch Records</h3>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', margin: 0 }}>Click any row to view print-ready dispatch invoice</p>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
                  <span>🖨️</span> Export PDF
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#64748b', fontSize: '10px', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '8px 10px' }}>CHALLAN #</th>
                      <th style={{ padding: '8px 10px' }}>CUSTOMER</th>
                      <th style={{ padding: '8px 10px' }}>TOTAL QTY</th>
                      <th style={{ padding: '8px 10px' }}>STATUS</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>VOUCHER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b66', color: '#cbd5e1' }}>
                        <td style={{ padding: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{r.id}</td>
                        <td style={{ padding: '10px', color: '#ffffff' }}>{r.customer}</td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{r.qty}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#064e3b33', color: '#34d399', fontSize: '11px', border: '1px solid #065f46' }}>
                            ● {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <span style={{ color: '#38bdf8', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>View Invoice</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
