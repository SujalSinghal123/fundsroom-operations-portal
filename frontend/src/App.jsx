import React, { useState, useEffect } from 'react';

const API_BASE = 'https://fundsroom-api-twtt.onrender.com/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('challans');

  const [email, setEmail] = useState('sales@fundsweb.in');
  const [password, setPassword] = useState('Password@123');
  const [authError, setAuthError] = useState('');

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [challans, setChallans] = useState([]);
  const [movements, setMovements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedCustDetail, setSelectedCustDetail] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [custForm, setCustForm] = useState({
    customer_name: '', business_name: '', email: '', mobile_number: '',
    gst_number: '', customer_type: 'Distributor', status: 'Active', notes: ''
  });

  const [prodForm, setProdForm] = useState({
    product_name: '', sku: '', category: 'Precision Electronics', unit_price: '',
    current_stock: '', min_stock_alert: '5', warehouse_location: 'Bay 02 - Rack B'
  });

  const [challanCust, setChallanCust] = useState('');
  const [challanStatus, setChallanStatus] = useState('Confirmed');
  const [challanLines, setChallanLines] = useState([{ product_id: '', quantity: 1 }]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Authentication failed');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.clear();
  };

  const loadData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cRes, pRes, chRes] = await Promise.all([
        fetch(`${API_BASE}/customers`, { headers }),
        fetch(`${API_BASE}/products`, { headers }),
        fetch(`${API_BASE}/challans`, { headers })
      ]);
      const [c, p, ch] = await Promise.all([cRes.json(), pRes.json(), chRes.json()]);
      if (c.success) setCustomers(c.customers);
      if (p.success) setProducts(p.products);
      if (ch.success) setChallans(ch.challans);

      const mRes = await fetch(`${API_BASE}/products/movements`, { headers });
      const m = await mRes.json();
      if (m.success) setMovements(m.movements);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadData(); }, [token, activeTab]);

  const addChallanLine = () => setChallanLines([...challanLines, { product_id: '', quantity: 1 }]);
  const removeChallanLine = (idx) => challanLines.length > 1 && setChallanLines(challanLines.filter((_, i) => i !== idx));
  const updateChallanLine = (idx, field, val) => {
    const copy = [...challanLines];
    copy[idx][field] = val;
    setChallanLines(copy);
  };

  const handleCreateChallan = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    try {
      const items = challanLines.map(line => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) }));
      const res = await fetch(`${API_BASE}/challans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customer_id: Number(challanCust), status: challanStatus, items })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStatusMsg({ type: 'success', text: `Sales Challan ${data.challan?.challan_number || ''} recorded successfully!` });
      setChallanLines([{ product_id: '', quantity: 1 }]);
      setChallanCust('');
      loadData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockUnits = products.reduce((acc, p) => acc + Number(p.current_stock || 0), 0);
  const lowStockCount = products.filter(p => Number(p.current_stock) <= Number(p.min_stock_alert)).length;

  if (!token) {
    return (
      <div className="min-h-screen bg-[#060a12] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="bg-[#0e1626]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white items-center justify-center font-black text-xl mb-3 shadow-lg shadow-indigo-500/30">FR</div>
            <h1 className="text-2xl font-black text-white tracking-tight">Fundsroom Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Enterprise Mini ERP, CRM & Inventory Suite</p>
          </div>
          {authError && <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Work Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#131d31] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#131d31] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none transition" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 text-xs transition active:scale-[0.99]">
              Enter Workspace
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Fast Role:</span>
            <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setEmail('sales@fundsweb.in')}>Sales</span>
            <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setEmail('warehouse@fundsweb.in')}>Warehouse</span>
            <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setEmail('admin@fundsweb.in')}>Admin</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sleek Enterprise Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a101d] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25">FR</div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                Fundsroom <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-indigo-500/20">PRO</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Operations Suite</div>
            </div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-3">Enterprise Core</div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('challans')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'challans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-[#111a2e] hover:text-slate-200'}`}>
              <span className="flex items-center space-x-2.5"><span>📄</span><span>Sales Challans</span></span>
              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-full font-mono">{challans.length}</span>
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-[#111a2e] hover:text-slate-200'}`}>
              <span className="flex items-center space-x-2.5"><span>📦</span><span>Inventory & Stocks</span></span>
              {lowStockCount > 0 && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">!</span>}
            </button>
            <button onClick={() => setActiveTab('crm')} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${activeTab === 'crm' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-[#111a2e] hover:text-slate-200'}`}>
              <span className="flex items-center space-x-2.5"><span>👥</span><span>Customer CRM</span></span>
              <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded-full font-mono">{customers.length}</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 mt-6 px-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-bold text-slate-200">{user?.name || 'Authorized User'}</div>
              <div className="text-[10px] text-indigo-400 uppercase font-semibold">{user?.role || 'Sales'} Persona</div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
          </div>
          <button onClick={handleLogout} className="w-full bg-[#111a2e] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 text-xs font-medium py-2 rounded-xl transition border border-slate-800">
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060a12] overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between shrink-0 bg-[#0a101d]/60 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
            <span>Workspace</span>
            <span className="text-slate-600">/</span>
            <span className="text-white capitalize font-semibold">{activeTab} View</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium flex items-center space-x-1.5 shadow-sm shadow-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Neon Cloud DB Live</span>
            </span>
          </div>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Glowing Metric KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b1220] border border-slate-800/80 hover:border-indigo-500/30 rounded-2xl p-5 transition group">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer Accounts</span>
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs">👥</span>
              </div>
              <div className="text-2xl font-black text-white mt-2 group-hover:text-indigo-300 transition">{customers.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Verified partner entities</div>
            </div>

            <div className="bg-[#0b1220] border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-5 transition group">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warehouse Total Units</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs">📦</span>
              </div>
              <div className="text-2xl font-black text-white mt-2 group-hover:text-emerald-300 transition">{totalStockUnits}</div>
              <div className="text-[10px] text-slate-500 mt-1">Live physical count</div>
            </div>

            <div className="bg-[#0b1220] border border-slate-800/80 hover:border-rose-500/30 rounded-2xl p-5 transition group">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs">⚠️</span>
              </div>
              <div className={`text-2xl font-black mt-2 ${lowStockCount > 0 ? 'text-rose-400' : 'text-white'}`}>{lowStockCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Below minimum threshold</div>
            </div>

            <div className="bg-[#0b1220] border border-slate-800/80 hover:border-purple-500/30 rounded-2xl p-5 transition group">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Challans Generated</span>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs">📄</span>
              </div>
              <div className="text-2xl font-black text-white mt-2 group-hover:text-purple-300 transition">{challans.length}</div>
              <div className="text-[10px] text-slate-500 mt-1">Audit log records</div>
            </div>
          </div>

          {statusMsg.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold border flex justify-between items-center ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <span>{statusMsg.text}</span>
              <button onClick={() => setStatusMsg({ type: '', text: '' })} className="font-bold">✕</button>
            </div>
          )}

          {/* TAB 1: SALES CHALLANS */}
          {activeTab === 'challans' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 lg:col-span-1 shadow-xl">
                <h3 className="font-bold text-base text-white mb-1">Issue Sales Challan</h3>
                <p className="text-xs text-slate-400 mb-5">Deducts inventory stock transactionally</p>

                <form onSubmit={handleCreateChallan} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Select Partner</label>
                    <select value={challanCust} onChange={e => setChallanCust(e.target.value)} required className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none">
                      <option value="">-- Choose Consignee --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name} ({c.business_name})</option>)}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-400 uppercase">Product Line</label>
                      <button type="button" onClick={addChallanLine} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold">+ Add Line</button>
                    </div>

                    {challanLines.map((line, idx) => (
                      <div key={idx} className="p-2.5 bg-[#111a2e] border border-slate-800 rounded-xl flex gap-2 items-center">
                        <select value={line.product_id} onChange={e => updateChallanLine(idx, 'product_id', e.target.value)} required className="w-2/3 bg-[#0b1220] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none">
                          <option value="">Select Item...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.product_name} (Stock: {p.current_stock})</option>
                          ))}
                        </select>
                        <input type="number" min="1" placeholder="Qty" value={line.quantity} onChange={e => updateChallanLine(idx, 'quantity', e.target.value)} required className="w-1/3 bg-[#0b1220] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none" />
                        {challanLines.length > 1 && (
                          <button type="button" onClick={() => removeChallanLine(idx)} className="text-rose-400 font-bold px-1 text-sm">✕</button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Dispatch State</label>
                    <select value={challanStatus} onChange={e => setChallanStatus(e.target.value)} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none">
                      <option value="Confirmed">Confirmed (Immediate Stock Reduction)</option>
                      <option value="Draft">Draft (Hold)</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition text-xs active:scale-[0.99]">
                    Process Challan Dispatch
                  </button>
                </form>
              </div>

              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 lg:col-span-2 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-base text-white">Challan Dispatch Records</h3>
                    <p className="text-xs text-slate-400">Click any row to view print-ready dispatch invoice</p>
                  </div>
                  <button onClick={() => window.print()} className="bg-[#111a2e] hover:bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 transition">
                    🖨️ Export PDF
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e1626] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Challan #</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Total Qty</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {challans.map(ch => (
                        <tr key={ch.id} className="hover:bg-[#111a2e]/50 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{ch.challan_number}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-200">{ch.customer_name}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-300">{ch.total_quantity} units</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ch.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              ● {ch.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button onClick={() => setActiveInvoice(ch)} className="text-indigo-400 hover:text-indigo-300 font-bold underline text-xs">
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
          )}

          {/* TAB 2: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base text-white">Warehouse Stocks Overview</h3>
                    <p className="text-xs text-slate-400">Inventory levels across fulfillment locations</p>
                  </div>
                  <button onClick={() => setShowAddProduct(true)} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition">
                    + Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e1626] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="py-4 px-6">SKU Code</th>
                        <th className="py-4 px-6">Product Description</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Stock Status</th>
                        <th className="py-4 px-6">Unit Price</th>
                        <th className="py-4 px-6">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-[#111a2e]/50 transition">
                          <td className="py-4 px-6 font-mono font-bold text-indigo-400">{p.sku}</td>
                          <td className="py-4 px-6 font-bold text-slate-200 text-xs">{p.product_name}</td>
                          <td className="py-4 px-6 text-slate-400">{p.category}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${p.current_stock <= p.min_stock_alert ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                              {p.current_stock} units {p.current_stock <= p.min_stock_alert && '— LOW STOCK'}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-200">₹{p.unit_price}</td>
                          <td className="py-4 px-6 text-slate-400">{p.warehouse_location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {movements.length > 0 && (
                <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">Stock Movement Audit Trail (ACID Records)</h4>
                  <div className="divide-y divide-slate-800/60">
                    {movements.map(m => (
                      <div key={m.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3">
                          <span className={`font-black px-2 py-0.5 rounded text-[10px] ${m.movement_type === 'OUT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {m.movement_type}
                          </span>
                          <span className="font-bold text-slate-200">{m.quantity_changed} units</span>
                          <span className="text-slate-400">— {m.product_name} ({m.sku}) | {m.reason}</span>
                        </div>
                        <span className="font-mono text-slate-500">{new Date(m.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER CRM */}
          {activeTab === 'crm' && (
            <div className="bg-[#0b1220] border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <input
                  type="text"
                  placeholder="Search customer by name, business or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-96 bg-[#111a2e] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
                <button onClick={() => setShowAddCustomer(true)} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition">
                  + Add Customer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1626] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6">Customer / Contact</th>
                      <th className="py-4 px-6">Business Entity</th>
                      <th className="py-4 px-6">GST Registration</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-[#111a2e]/50 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-200 text-xs">{c.customer_name}</div>
                          <div className="text-slate-400 text-[11px]">{c.email} • {c.mobile_number}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-300">{c.business_name}</td>
                        <td className="py-4 px-6 font-mono text-slate-400">{c.gst_number || 'Unregistered'}</td>
                        <td className="py-4 px-6"><span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">{c.customer_type}</span></td>
                        <td className="py-4 px-6"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>● {c.status}</span></td>
                        <td className="py-4 px-6">
                          <button onClick={() => setSelectedCustDetail(c)} className="text-indigo-400 hover:text-indigo-300 font-bold underline">
                            View Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INVOICE MODAL */}
          {activeInvoice && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h2 className="text-base font-black text-white">DISPATCH CHALLAN INVOICE</h2>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">Ref ID: {activeInvoice.challan_number}</p>
                  </div>
                  <button onClick={() => setActiveInvoice(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="bg-[#111a2e] p-3 rounded-2xl border border-slate-800">
                    <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">Consignee</div>
                    <div className="font-bold text-white">{activeInvoice.customer_name}</div>
                    <div className="text-slate-400">{activeInvoice.business_name}</div>
                  </div>
                  <div className="bg-[#111a2e] p-3 rounded-2xl border border-slate-800">
                    <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">Status Meta</div>
                    <div className="text-slate-300">State: <span className="font-bold text-emerald-400 uppercase">{activeInvoice.status}</span></div>
                    <div className="text-slate-400">Date: {new Date(activeInvoice.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="border border-slate-800 rounded-2xl overflow-hidden mb-5">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0e1626] border-b border-slate-800 text-slate-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">Dispatched Item Description</th>
                        <th className="p-3">Total Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3 text-slate-200 font-medium">Standard Industrial Stock Allocation</td>
                        <td className="p-3 font-bold text-white">{activeInvoice.total_quantity} units</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end space-x-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30">Print PDF</button>
                  <button onClick={() => setActiveInvoice(null)} className="px-4 py-2 border border-slate-800 text-slate-300 rounded-xl text-xs">Close</button>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER DOSSIER */}
          {selectedCustDetail && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-white text-sm">Customer Dossier</h3>
                  <button onClick={() => setSelectedCustDetail(null)} className="text-slate-400">✕</button>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div><span className="text-slate-400">Contact:</span> {selectedCustDetail.customer_name}</div>
                  <div><span className="text-slate-400">Business:</span> {selectedCustDetail.business_name}</div>
                  <div><span className="text-slate-400">Email:</span> {selectedCustDetail.email}</div>
                  <div><span className="text-slate-400">Phone:</span> {selectedCustDetail.mobile_number}</div>
                  <div><span className="text-slate-400">GST:</span> {selectedCustDetail.gst_number || 'N/A'}</div>
                  <div className="bg-[#111a2e] p-3 rounded-2xl border border-slate-800 mt-3">
                    <div className="font-bold text-slate-400 uppercase text-[10px] mb-1">CRM Follow-up Notes</div>
                    <div className="text-slate-200 italic">{selectedCustDetail.notes || 'Active wholesale account in regular dispatch cycle.'}</div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setSelectedCustDetail(null)} className="px-4 py-2 bg-[#111a2e] text-slate-200 rounded-xl text-xs font-bold border border-slate-800">Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD CUSTOMER MODAL */}
          {showAddCustomer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-sm font-bold text-white mb-3">Add Customer Account</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch(`${API_BASE}/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(custForm)
                  });
                  const d = await res.json();
                  if (d.success) { setShowAddCustomer(false); loadData(); }
                }} className="space-y-2.5 text-xs">
                  <input placeholder="Customer Name *" required value={custForm.customer_name} onChange={e => setCustForm({...custForm, customer_name: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input placeholder="Business Name *" required value={custForm.business_name} onChange={e => setCustForm({...custForm, business_name: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input type="email" placeholder="Email *" required value={custForm.email} onChange={e => setCustForm({...custForm, email: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input placeholder="Mobile *" required value={custForm.mobile_number} onChange={e => setCustForm({...custForm, mobile_number: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input placeholder="GST Number" value={custForm.gst_number} onChange={e => setCustForm({...custForm, gst_number: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setShowAddCustomer(false)} className="px-3 py-1.5 border border-slate-800 rounded-xl text-slate-400">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ADD PRODUCT MODAL */}
          {showAddProduct && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-[#0b1220] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-sm font-bold text-white mb-3">Add Product Unit</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch(`${API_BASE}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({...prodForm, unit_price: Number(prodForm.unit_price), current_stock: Number(prodForm.current_stock), min_stock_alert: Number(prodForm.min_stock_alert)})
                  });
                  const d = await res.json();
                  if (d.success) { setShowAddProduct(false); loadData(); }
                }} className="space-y-2.5 text-xs">
                  <input placeholder="Product Name *" required value={prodForm.product_name} onChange={e => setProdForm({...prodForm, product_name: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input placeholder="SKU *" required value={prodForm.sku} onChange={e => setProdForm({...prodForm, sku: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input type="number" placeholder="Unit Price *" required value={prodForm.unit_price} onChange={e => setProdForm({...prodForm, unit_price: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <input type="number" placeholder="Stock Qty *" required value={prodForm.current_stock} onChange={e => setProdForm({...prodForm, current_stock: e.target.value})} className="w-full bg-[#111a2e] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none" />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setShowAddProduct(false)} className="px-3 py-1.5 border border-slate-800 rounded-xl text-slate-400">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
