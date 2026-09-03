import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://fundsroom-api-twtt.onrender.com';

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fundsroom_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginEmail, setLoginEmail] = useState('sales@fundsroom.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState('sales');

  // Navigation tab: 'challans' | 'inventory' | 'crm'
  const [activeTab, setActiveTab] = useState('challans');

  // Notification Banner
  const [successMsg, setSuccessMsg] = useState('Sales Challan CH-082203 recorded successfully!');

  // Live Data Lists
  const [customersList, setCustomersList] = useState([
    { id: '1', name: 'Vikram Patel', business: 'Patel Logistics', phone: '+91 9811223344', email: 'vikram@patellogistics.com' },
    { id: '2', name: 'Rajesh Sharma', business: 'Sharma Enterprises', phone: '+91 9876543210', email: 'rajesh@sharma.in' }
  ]);

  const [productsList, setProductsList] = useState([
    { id: 'p1', name: 'Heavy Duty Pallet Racks', stock: 10, minThreshold: 5, category: 'Storage' },
    { id: 'p2', name: 'Hydraulic Forklift Pallet Truck 2.5T', stock: 6, minThreshold: 3, category: 'Machinery' },
    { id: 'p3', name: 'Barcode Scanner Pro Wireless', stock: 3, minThreshold: 5, category: 'Electronics' }
  ]);

  const [records, setRecords] = useState([
    { id: 'CH-082203', customer: 'Vikram Patel', qty: 1, status: 'Confirmed', date: '2026-09-02' },
    { id: 'CH-061853', customer: 'Rajesh Sharma', qty: 1, status: 'Confirmed', date: '2026-09-02' },
    { id: 'CH-756822', customer: 'Vikram Patel', qty: 3, status: 'Confirmed', date: '2026-09-02' },
    { id: 'CH-735081', customer: 'Vikram Patel', qty: 3, status: 'Confirmed', date: '2026-09-01' },
    { id: 'CH-732341', customer: 'Vikram Patel', qty: 3, status: 'Confirmed', date: '2026-09-01' },
    { id: 'CH-539689', customer: 'Rajesh Sharma', qty: 5, status: 'Confirmed', date: '2026-08-30' },
    { id: 'CH-519621', customer: 'Rajesh Sharma', qty: 3, status: 'Confirmed', date: '2026-08-29' },
    { id: 'CH-492626', customer: 'Rajesh Sharma', qty: 2, status: 'Confirmed', date: '2026-08-28' },
    { id: 'CH-491595', customer: 'Rajesh Sharma', qty: 2, status: 'Confirmed', date: '2026-08-27' },
    { id: 'CH-488480', customer: 'Rajesh Sharma', qty: 2, status: 'Confirmed', date: '2026-08-26' }
  ]);

  // Form State
  const [selectedPartner, setSelectedPartner] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dispatchState, setDispatchState] = useState('Confirmed (Immediate Stock Reduction)');

  // Modals State
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Entity Forms
  const [newCustName, setNewCustName] = useState('');
  const [newCustBiz, setNewCustBiz] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  const [newProdName, setNewProdName] = useState('');
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdCat, setNewProdCat] = useState('Storage');
  const [newProdThreshold, setNewProdThreshold] = useState(5);

  // Fetch backend data if available
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/api/customers`).then(r => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/products`).then(r => r.json()).catch(() => null)
        ]);
        if (cRes && Array.isArray(cRes) && cRes.length > 0) setCustomersList(cRes);
        if (pRes && Array.isArray(pRes) && pRes.length > 0) setProductsList(pRes);
      } catch (err) {
        // Fallback to local default data
      }
    };
    loadData();
  }, []);

  // Total Warehouse Units
  const totalStockInHand = productsList.reduce((acc, p) => acc + Number(p.stock || p.quantity || p.units || 0), 0);
  const lowStockCount = productsList.filter(p => Number(p.stock || 0) <= Number(p.minThreshold || 5)).length;

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    let name = 'Sales Lead';
    let roleText = 'SALES PERSONA';

    if (loginRole === 'admin') {
      name = 'System Administrator';
      roleText = 'ADMIN ROLE';
    } else if (loginRole === 'warehouse') {
      name = 'Warehouse Supervisor';
      roleText = 'WAREHOUSE ROLE';
    }

    const userData = { name, role: loginRole, roleDisplay: roleText, email: loginEmail };
    setCurrentUser(userData);
    localStorage.setItem('fundsroom_user', JSON.stringify(userData));
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('fundsroom_user');
    setCurrentUser(null);
  };

  // Handle Dispatch Challan
  const handleDispatch = (e) => {
    e.preventDefault();
    if (!selectedPartner) {
      alert('Kripya Consignee partner select karein.');
      return;
    }
    if (!selectedProduct) {
      alert('Kripya Product item select karein.');
      return;
    }

    const partner = customersList.find(c => String(c.id) === String(selectedPartner));
    const product = productsList.find(p => String(p.id) === String(selectedProduct));

    if (product && product.stock < Number(quantity)) {
      alert(`Warning: Available stock is only ${product.stock} units!`);
    }

    const newId = `CH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRecord = {
      id: newId,
      customer: partner ? partner.name : 'Unknown Partner',
      qty: Number(quantity),
      status: 'Confirmed',
      date: new Date().toISOString().split('T')[0]
    };

    setRecords([newRecord, ...records]);
    setProductsList(productsList.map(p => {
      if (String(p.id) === String(selectedProduct)) {
        return { ...p, stock: Math.max(0, Number(p.stock) - Number(quantity)) };
      }
      return p;
    }));

    setSuccessMsg(`Sales Challan ${newId} recorded successfully!`);
    setSelectedPartner('');
    setSelectedProduct('');
    setQuantity(1);
  };

  // Add Customer Submit
  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustBiz) {
      alert('Naam aur Business dono bharo.');
      return;
    }
    const newCustomer = {
      id: String(Date.now()),
      name: newCustName,
      business: newCustBiz,
      phone: newCustPhone || '+91 9876543210',
      email: newCustEmail || 'client@trade.in'
    };
    setCustomersList([...customersList, newCustomer]);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustBiz('');
    setNewCustPhone('');
    setNewCustEmail('');
    alert('Naya Customer account successfully create ho gaya!');
  };

  // Add Product Submit
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName) {
      alert('Product name zaroori hai.');
      return;
    }
    const newProduct = {
      id: `p-${Date.now()}`,
      name: newProdName,
      stock: Number(newProdStock),
      category: newProdCat,
      minThreshold: Number(newProdThreshold)
    };
    setProductsList([...productsList, newProduct]);
    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdStock(10);
    alert('Naya Product stock add ho gaya!');
  };

  // -------------------------------------------------------------
  // 1. LOGIN SCREEN (agar user login nahi hai)
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '400px', backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '14px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '52px', height: '52px', backgroundColor: '#4f46e5', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '22px', marginBottom: '12px' }}>
              FR
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Fundsroom Operations</h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Sign in to access ERP & Challan Engine</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>SELECT ACTIVE ROLE</label>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0a0d18', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              >
                <option value="sales">Sales Executive (Challans & Billing)</option>
                <option value="warehouse">Warehouse Manager (Inventory Control)</option>
                <option value="admin">Administrator (Complete Operations)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>WORK EMAIL</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                placeholder="user@fundsroom.com"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '6px' }}>PASSWORD</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}
            >
              Sign In to Suite
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#475569' }}>
            Developed by Sujal Singhal • Enterprise Grade ACID Engine
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DASHBOARD SUITE
  // -------------------------------------------------------------
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0f1422', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 16px' }}>
        <div>
          {/* Brand Header */}
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

          {/* Core Modules */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', marginBottom: '12px' }}>
            ENTERPRISE CORE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button 
              onClick={() => setActiveTab('challans')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: activeTab === 'challans' ? '#4f46e5' : 'transparent', color: activeTab === 'challans' ? '#ffffff' : '#94a3b8', borderRadius: '8px', border: 'none', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
              <span>📄 Sales Challans</span>
              <span style={{ backgroundColor: activeTab === 'challans' ? '#1e1b4b' : '#1e293b', color: '#ffffff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{records.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('inventory')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: activeTab === 'inventory' ? '#4f46e5' : 'transparent', color: activeTab === 'inventory' ? '#ffffff' : '#94a3b8', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              <span>📦 Inventory & Stocks</span>
              <span style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', fontSize: '10px', padding: '2px 6px', borderRadius: '12px', fontWeight: 'bold' }}>!</span>
            </button>

            <button 
              onClick={() => setActiveTab('crm')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: activeTab === 'crm' ? '#4f46e5' : 'transparent', color: activeTab === 'crm' ? '#ffffff' : '#94a3b8', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer' }}>
              <span>👥 Customer CRM</span>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{customersList.length}</span>
            </button>
          </div>
        </div>

        {/* User Card */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '10px', color: '#38bdf8', letterSpacing: '0.05em' }}>{currentUser.roleDisplay}</div>
            </div>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '8px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '56px', borderBottom: '1px solid #1e293b', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c101d' }}>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Workspace / <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
              {activeTab === 'challans' ? 'Challans View' : activeTab === 'inventory' ? 'Inventory Control' : 'Customer CRM'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34d399', backgroundColor: '#064e3b33', padding: '4px 10px', borderRadius: '6px', border: '1px solid #065f46' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            Neon Cloud DB Live
          </div>
        </header>

        {/* TAB 1: CHALLANS VIEW */}
        {activeTab === 'challans' && (
          <main style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>CUSTOMER ACCOUNTS</span>
                  <span style={{ fontSize: '14px', color: '#6366f1' }}>👥</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{customersList.length}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Verified partner entities</div>
              </div>

              <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>WAREHOUSE TOTAL UNITS</span>
                  <span style={{ fontSize: '14px', color: '#f59e0b' }}>📦</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{totalStockInHand}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Live physical count</div>
              </div>

              <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>LOW STOCK WARNINGS</span>
                  <span style={{ fontSize: '14px', color: '#ef4444' }}>⚠️</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{lowStockCount}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Below minimum threshold</div>
              </div>

              <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>CHALLANS GENERATED</span>
                  <span style={{ fontSize: '14px', color: '#8b5cf6' }}>📄</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginTop: '12px' }}>{records.length}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Audit log records</div>
              </div>
            </div>

            {/* Notification Banner */}
            {successMsg && (
              <div style={{ backgroundColor: '#064e3b40', border: '1px solid #065f46', borderRadius: '8px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', fontSize: '13px' }}>
                <span>{successMsg}</span>
                <span onClick={() => setSuccessMsg('')} style={{ cursor: 'pointer', color: '#6ee7b7', fontWeight: 'bold' }}>✕</span>
              </div>
            )}

            {/* Form & Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              
              {/* Issue Sales Challan */}
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
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.business})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>PRODUCT LINE</label>
                      <span onClick={() => setShowAddProductModal(true)} style={{ fontSize: '11px', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>+ Add Product</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        style={{ flex: 1, padding: '9px 12px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                      >
                        <option value="">Select Item...</option>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
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

              {/* Records Table */}
              <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Challan Dispatch Records</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', margin: 0 }}>Click any row to view print-ready dispatch invoice</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
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
                      {records.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #1e293b66', color: '#cbd5e1' }}>
                          <td style={{ padding: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{r.id}</td>
                          <td style={{ padding: '10px', color: '#ffffff' }}>{r.customer}</td>
                          <td style={{ padding: '10px', color: '#94a3b8' }}>{r.qty} units</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '12px', backgroundColor: '#064e3b33', color: '#34d399', fontSize: '11px', border: '1px solid #065f46' }}>
                              ● {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <button 
                              onClick={() => setActiveInvoice(r)}
                              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '11px', textDecoration: 'underline' }}>
                              View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </main>
        )}

        {/* TAB 2: INVENTORY VIEW */}
        {activeTab === 'inventory' && (
          <main style={{ padding: '24px 28px' }}>
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Warehouse Inventory</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Total {totalStockInHand} physical items in stock</p>
                </div>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  + Add New Stock
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#64748b', fontSize: '11px' }}>
                    <th style={{ padding: '10px' }}>PRODUCT NAME</th>
                    <th style={{ padding: '10px' }}>CATEGORY</th>
                    <th style={{ padding: '10px' }}>CURRENT STOCK</th>
                    <th style={{ padding: '10px' }}>THRESHOLD</th>
                    <th style={{ padding: '10px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1e293b66' }}>
                      <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{p.category}</td>
                      <td style={{ padding: '12px 10px', color: '#38bdf8', fontWeight: 'bold' }}>{p.stock} units</td>
                      <td style={{ padding: '12px 10px', color: '#64748b' }}>{p.minThreshold} units</td>
                      <td style={{ padding: '12px 10px' }}>
                        {p.stock <= p.minThreshold ? (
                          <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: '#7f1d1d44', color: '#f87171', fontSize: '11px', border: '1px solid #991b1b' }}>Low Stock</span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: '#064e3b44', color: '#34d399', fontSize: '11px', border: '1px solid #065f46' }}>Adequate</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {/* TAB 3: CUSTOMER CRM */}
        {activeTab === 'crm' && (
          <main style={{ padding: '24px 28px' }}>
            <div style={{ backgroundColor: '#0f1422', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0 }}>Registered Customer Directory</h2>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Verified commercial partners ({customersList.length} entities)</p>
                </div>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                  + Add New Customer
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {customersList.map((c) => (
                  <div key={c.id} style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>{c.business}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>📞 {c.phone}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>✉️ {c.email}</div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

      </div>

      {/* MODAL 1: ADD CUSTOMER */}
      {showAddCustomerModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: '420px', backgroundColor: '#0f1422', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#ffffff' }}>Add New Consignee Partner</h3>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Customer Contact Person (e.g. Vikram Patel)"
                value={newCustName}
                onChange={e => setNewCustName(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                required
              />
              <input
                type="text"
                placeholder="Enterprise / Business Name (e.g. Patel Logistics)"
                value={newCustBiz}
                onChange={e => setNewCustBiz(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                required
              />
              <input
                type="text"
                placeholder="Phone Number (+91 ...)"
                value={newCustPhone}
                onChange={e => setNewCustPhone(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newCustEmail}
                onChange={e => setNewCustEmail(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Create Entity</button>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} style={{ padding: '10px 16px', backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PRODUCT */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: '420px', backgroundColor: '#0f1422', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#ffffff' }}>Add Inventory Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Product Item Name"
                value={newProdName}
                onChange={e => setNewProdName(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                required
              />
              <input
                type="number"
                placeholder="Initial Stock Quantity"
                value={newProdStock}
                onChange={e => setNewProdStock(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                required
              />
              <input
                type="text"
                placeholder="Category (e.g. Machinery, Storage)"
                value={newProdCat}
                onChange={e => setNewProdCat(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <input
                type="number"
                placeholder="Low Stock Alert Threshold"
                value={newProdThreshold}
                onChange={e => setNewProdThreshold(e.target.value)}
                style={{ padding: '10px', backgroundColor: '#0a0d18', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add to Warehouse</button>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ padding: '10px 16px', backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW INVOICE */}
      {activeInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: '460px', backgroundColor: '#0f1422', border: '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>Dispatch Invoice: {activeInvoice.id}</h3>
              <button onClick={() => setActiveInvoice(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '18px 0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><span style={{ color: '#64748b' }}>Consignee:</span> <strong style={{ color: '#ffffff' }}>{activeInvoice.customer}</strong></div>
              <div><span style={{ color: '#64748b' }}>Dispatch Date:</span> <strong style={{ color: '#ffffff' }}>{activeInvoice.date}</strong></div>
              <div><span style={{ color: '#64748b' }}>Total Dispatched:</span> <strong style={{ color: '#38bdf8' }}>{activeInvoice.qty} Units</strong></div>
              <div><span style={{ color: '#64748b' }}>Transaction Status:</span> <span style={{ color: '#34d399', fontWeight: 'bold' }}>● {activeInvoice.status}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Print Voucher</button>
              <button onClick={() => setActiveInvoice(null)} style={{ padding: '10px 16px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
