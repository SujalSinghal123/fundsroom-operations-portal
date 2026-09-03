import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Localhost aur Vercel dono ke liye dynamic API target
const API_BASE = import.meta.env.VITE_API_BASE || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://fundsroom-api.onrender.com/api' // Live Render Backend
);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('erp_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('erp_user') || 'null'));
  const [activeTab, setActiveTab] = useState('challans'); // 'challans' | 'inventory' | 'crm'

  // Data States
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Challan Issue Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [challanLines, setChallanLines] = useState([{ product_id: '', quantity: 1 }]);
  const [dispatchState, setDispatchState] = useState('Confirmed');

  // Auth Inputs
  const [email, setEmail] = useState('sales@fundsweb.in');
  const [password, setPassword] = useState('Password@123');
  const [authError, setAuthError] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Fetch Dashboard & Entity Data
  const loadWorkspaceData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [custRes, prodRes, chalRes] = await Promise.all([
        axios.get(`${API_BASE}/customers`, getHeaders()).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/products`, getHeaders()).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_BASE}/challans`, getHeaders()).catch(() => ({ data: { data: [] } }))
      ]);
      setCustomers(custRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setChallans(chalRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadWorkspaceData();
    }
  }, [token]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('erp_token', jwtToken);
      localStorage.setItem('erp_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setAuthError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
  };

  // Quick Role Fast-fill
  const fillRole = (targetRole) => {
    if (targetRole === 'Sales') {
      setEmail('sales@fundsweb.in');
      setPassword('Password@123');
    } else if (targetRole === 'Warehouse') {
      setEmail('warehouse@fundsweb.in');
      setPassword('Password@123');
    } else if (targetRole === 'Admin') {
      setEmail('admin@fundsweb.in');
      setPassword('Password@123');
    }
  };

  // Process Challan Dispatch
  const handleProcessChallan = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      triggerToast('Please select a consignee / customer');
      return;
    }
    const validLines = challanLines.filter(l => l.product_id && l.quantity > 0);
    if (validLines.length === 0) {
      triggerToast('Please select at least one valid product');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/challans`, {
        customer_id: selectedCustomerId,
        items: validLines,
        status: dispatchState
      }, getHeaders());

      triggerToast(`Sales Challan ${res.data.data?.challan_number || 'Recorded'} processed successfully!`);
      setSelectedCustomerId('');
      setChallanLines([{ product_id: '', quantity: 1 }]);
      loadWorkspaceData();
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Challan creation failed');
    }
  };

  // Derived KPI Metrics
  const totalWarehouseUnits = products.reduce((sum, p) => sum + (Number(p.current_stock) || 0), 0);
  const lowStockCount = products.filter(p => Number(p.current_stock) <= Number(p.min_stock_alert || 5)).length;

  // ----------------- LOGIN SCREEN -----------------
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0d1424] border border-[#1b253b] rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg mb-3">
              FR
            </div>
            <h1 className="text-xl font-bold text-slate-100">Fundsroom Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Mini ERP, CRM & Inventory Suite</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131c31] border border-[#23314f] focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-slate-200 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131c31] border border-[#23314f] focus:border-blue-500 rounded-lg px-3.5 py-2 text-sm text-slate-200 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-500/25 mt-2"
            >
              Enter Workspace
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-[#1b253b] flex items-center justify-between text-xs text-slate-400">
            <span>Fast Role:</span>
            <div className="flex gap-4">
              <button type="button" onClick={() => fillRole('Sales')} className="hover:text-blue-400 font-medium">Sales</button>
              <button type="button" onClick={() => fillRole('Warehouse')} className="hover:text-blue-400 font-medium">Warehouse</button>
              <button type="button" onClick={() => fillRole('Admin')} className="hover:text-blue-400 font-medium">Admin</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- ENTERPRISE DASHBOARD -----------------
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1424] border-r border-[#1a233a] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-5 flex items-center gap-3 border-b border-[#1a233a]">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              FR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">Fundsroom</span>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">OPERATIONS SUITE</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3">
            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 py-2">
              ENTERPRISE CORE
            </p>
            <nav className="space-y-1 mt-1">
              <button
                onClick={() => setActiveTab('challans')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'challans'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d33]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>📄</span>
                  <span>Sales Challans</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'challans' ? 'bg-black/30' : 'bg-[#1a243d] text-slate-300'}`}>
                  {challans.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'inventory'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d33]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>📦</span>
                  <span>Inventory & Stocks</span>
                </div>
                {lowStockCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('crm')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'crm'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d33]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>👥</span>
                  <span>Customer CRM</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">{customers.length}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="p-4 border-t border-[#1a233a] bg-[#0a0f1d]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-slate-200">{user.name || 'Sales Lead'}</p>
              <p className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">{user.role} PERSONA</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-teal-400 shadow-sm shadow-teal-400"></div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-1.5 px-3 rounded bg-[#162035] hover:bg-[#1e2c49] text-slate-300 text-xs font-medium border border-[#23314f] transition"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-14 bg-[#0d1424] border-b border-[#1a233a] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Workspace</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold capitalize">{activeTab} View</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 text-xs font-medium tracking-wide">Neon Cloud DB Live</span>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Toast Banner */}
          {toastMsg && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex justify-between items-center shadow-lg animate-fade-in">
              <span>{toastMsg}</span>
              <button onClick={() => setToastMsg('')} className="text-emerald-400 hover:text-white text-base">✕</button>
            </div>
          )}

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0d1424] border border-[#1b253b] rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">CUSTOMER ACCOUNTS</p>
                <h3 className="text-2xl font-black text-white mt-2">{customers.length}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Verified partner entities</p>
              </div>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm">👥</span>
            </div>

            <div className="bg-[#0d1424] border border-[#1b253b] rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">WAREHOUSE TOTAL UNITS</p>
                <h3 className="text-2xl font-black text-white mt-2">{totalWarehouseUnits}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Live physical count</p>
              </div>
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 text-sm">📦</span>
            </div>

            <div className="bg-[#0d1424] border border-[#1b253b] rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">LOW STOCK WARNINGS</p>
                <h3 className="text-2xl font-black text-white mt-2">{lowStockCount}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Below minimum threshold</p>
              </div>
              <span className="p-2 rounded-lg bg-red-500/10 text-red-400 text-sm">⚠️</span>
            </div>

            <div className="bg-[#0d1424] border border-[#1b253b] rounded-xl p-4 flex justify-between items-start shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">CHALLANS GENERATED</p>
                <h3 className="text-2xl font-black text-white mt-2">{challans.length}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Audit log records</p>
              </div>
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-sm">📄</span>
            </div>
          </div>

          {/* MAIN TAB CONTENT: Sales Challans View */}
          {activeTab === 'challans' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Issue Sales Challan Form (Left Box) */}
              <div className="lg:col-span-4 bg-[#0d1424] border border-[#1b253b] rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white">Issue Sales Challan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-4">Deducts inventory stock transactionally</p>

                <form onSubmit={handleProcessChallan} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      SELECT PARTNER
                    </label>
                    <select
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-[#131c31] border border-[#23314f] text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition"
                    >
                      <option value="">-- Choose Consignee --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customer_name} ({c.business_name || 'Individual'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        PRODUCT LINE
                      </label>
                      <button
                        type="button"
                        onClick={() => setChallanLines([...challanLines, { product_id: '', quantity: 1 }])}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300"
                      >
                        + Add Line
                      </button>
                    </div>

                    {challanLines.map((line, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <select
                          required
                          value={line.product_id}
                          onChange={(e) => {
                            const updated = [...challanLines];
                            updated[idx].product_id = e.target.value;
                            setChallanLines(updated);
                          }}
                          className="flex-1 bg-[#131c31] border border-[#23314f] text-slate-200 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-blue-500 transition"
                        >
                          <option value="">Select Item...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id} disabled={p.current_stock <= 0}>
                              {p.product_name} (Stock: {p.current_stock})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          required
                          value={line.quantity}
                          onChange={(e) => {
                            const updated = [...challanLines];
                            updated[idx].quantity = parseInt(e.target.value, 10) || 1;
                            setChallanLines(updated);
                          }}
                          className="w-16 bg-[#131c31] border border-[#23314f] text-slate-200 rounded-lg px-2 py-2 text-xs text-center font-semibold outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      DISPATCH STATE
                    </label>
                    <select
                      value={dispatchState}
                      onChange={(e) => setDispatchState(e.target.value)}
                      className="w-full bg-[#131c31] border border-[#23314f] text-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 transition"
                    >
                      <option value="Confirmed">Confirmed (Immediate Stock Reduction)</option>
                      <option value="Draft">Draft (Hold Only)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition pt-2"
                  >
                    Process Challan Dispatch
                  </button>
                </form>
              </div>

              {/* Challan Dispatch Records (Right Table) */}
              <div className="lg:col-span-8 bg-[#0d1424] border border-[#1b253b] rounded-2xl p-5 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Challan Dispatch Records</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click any row to view print-ready dispatch invoice</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#162035] hover:bg-[#1e2c49] border border-[#23314f] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition">
                    <span>🖨️</span> Export PDF
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#1b253b] text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 px-3">CHALLAN #</th>
                        <th className="pb-3 px-3">CUSTOMER</th>
                        <th className="pb-3 px-3">TOTAL QTY</th>
                        <th className="pb-3 px-3">STATUS</th>
                        <th className="pb-3 px-3 text-right">VOUCHER</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#151e33]">
                      {challans.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            No dispatch records recorded yet.
                          </td>
                        </tr>
                      ) : (
                        challans.map((ch) => {
                          const customerObj = ch.customer_snapshot || {};
                          return (
                            <tr key={ch.id} className="hover:bg-[#121a2d] transition">
                              <td className="py-3 px-3 font-mono font-medium text-blue-400">
                                {ch.challan_number}
                              </td>
                              <td className="py-3 px-3 text-slate-200 font-medium">
                                {customerObj.customer_name || ch.customer_name || 'N/A'}
                              </td>
                              <td className="py-3 px-3 text-slate-300">
                                {ch.total_quantity} units
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  ch.status === 'Confirmed'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${ch.status === 'Confirmed' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                  {ch.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button className="text-blue-400 hover:text-blue-300 font-semibold underline">
                                  View Invoice
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY TAB VIEW */}
          {activeTab === 'inventory' && (
            <div className="bg-[#0d1424] border border-[#1b253b] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-1">Warehouse Stock Catalog</h3>
              <p className="text-[11px] text-slate-400 mb-4">Live inventory tracking and threshold monitors</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b253b] text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">SKU</th>
                      <th className="pb-3 px-3">PRODUCT</th>
                      <th className="pb-3 px-3">CATEGORY</th>
                      <th className="pb-3 px-3">LOCATION</th>
                      <th className="pb-3 px-3 text-right">PRICE</th>
                      <th className="pb-3 px-3 text-right">STOCK COUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151e33]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#121a2d]">
                        <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3 px-3 font-medium text-slate-200">{p.product_name}</td>
                        <td className="py-3 px-3 text-slate-400">{p.category}</td>
                        <td className="py-3 px-3 text-slate-400">{p.location}</td>
                        <td className="py-3 px-3 text-right text-slate-300">₹{Number(p.unit_price).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-bold">
                          <span className={Number(p.current_stock) <= Number(p.min_stock_alert || 5) ? 'text-red-400' : 'text-emerald-400'}>
                            {p.current_stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CRM TAB VIEW */}
          {activeTab === 'crm' && (
            <div className="bg-[#0d1424] border border-[#1b253b] rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-1">Customer CRM Directory</h3>
              <p className="text-[11px] text-slate-400 mb-4">Partner accounts and client follow-ups</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1b253b] text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 px-3">CUSTOMER</th>
                      <th className="pb-3 px-3">BUSINESS NAME</th>
                      <th className="pb-3 px-3">MOBILE</th>
                      <th className="pb-3 px-3">TYPE</th>
                      <th className="pb-3 px-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151e33]">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-[#121a2d]">
                        <td className="py-3 px-3 font-medium text-slate-200">{c.customer_name}</td>
                        <td className="py-3 px-3 text-slate-400">{c.business_name || 'N/A'}</td>
                        <td className="py-3 px-3 text-slate-400">{c.mobile_number}</td>
                        <td className="py-3 px-3 text-slate-300">{c.customer_type}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
