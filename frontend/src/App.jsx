import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('crm');

  // Auth Inputs
  const [email, setEmail] = useState('admin@fundsroom.com');
  const [password, setPassword] = useState('Password@123');

  // Data states
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchCust, setSearchCust] = useState('');

  // Form states
  const [custForm, setCustForm] = useState({
    customer_name: '', mobile_number: '', email: '', business_name: '',
    customer_type: 'Wholesale', address: '', status: 'Lead', follow_up_date: '', notes: ''
  });

  const [challanItems, setChallanItems] = useState([]);
  const [selectedCustId, setSelectedCustId] = useState('');
  const [challanStatus, setChallanStatus] = useState('Draft');

  useEffect(() => {
    if (token) {
      fetchCustomers();
      fetchProducts();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error during login');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser(null);
  };

  const fetchCustomers = async () => {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setCustomers(data);
    else if (data.data) setCustomers(data.data);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
    else if (data.data) setProducts(data.data);
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(custForm)
    });
    if (res.ok) {
      alert('Customer added successfully');
      fetchCustomers();
      setCustForm({
        customer_name: '', mobile_number: '', email: '', business_name: '',
        customer_type: 'Wholesale', address: '', status: 'Lead', follow_up_date: '', notes: ''
      });
    } else {
      const err = await res.json();
      alert(err.message || 'Failed to add customer');
    }
  };

  const addChallanRow = () => {
    if (products.length === 0) return alert('No products available');
    setChallanItems([...challanItems, { product_id: products[0].id, quantity: 1 }]);
  };

  const submitChallan = async () => {
    if (!selectedCustId || challanItems.length === 0) {
      return alert('Select a customer and add at least one item');
    }
    const res = await fetch(`${API_BASE}/challans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        customer_id: selectedCustId,
        items: challanItems,
        status: challanStatus
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Challan Created: ${data.data.challan_number}`);
      setChallanItems([]);
      fetchProducts();
    } else {
      alert(data.message || 'Error creating challan');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Mini ERP Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600">Email</label>
              <input 
                className="w-full border p-2 rounded" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">Password</label>
              <input 
                type="password" 
                className="w-full border p-2 rounded" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredCustomers = customers.filter(c => 
    c.customer_name?.toLowerCase().includes(searchCust.toLowerCase()) ||
    c.business_name?.toLowerCase().includes(searchCust.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Operations Portal</h1>
          <p className="text-xs text-slate-500">Logged in as: <span className="font-semibold">{user?.name || user?.email}</span> ({user?.role})</p>
        </div>
        <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded font-medium hover:bg-red-100">
          Logout
        </button>
      </header>

      {/* Navigation */}
      <div className="flex border-b bg-white px-6 gap-6">
        <button 
          onClick={() => setActiveTab('crm')} 
          className={`py-3 text-sm font-semibold border-b-2 ${activeTab === 'crm' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          Customer CRM
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`py-3 text-sm font-semibold border-b-2 ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          Products & Inventory
        </button>
        <button 
          onClick={() => setActiveTab('challan')} 
          className={`py-3 text-sm font-semibold border-b-2 ${activeTab === 'challan' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>
          Sales Challan
        </button>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* CRM TAB */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-bold mb-4">Add Customer</h3>
              <form onSubmit={createCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Customer Name *" className="border p-2 rounded" required value={custForm.customer_name} onChange={e => setCustForm({...custForm, customer_name: e.target.value})} />
                <input placeholder="Mobile Number *" className="border p-2 rounded" required value={custForm.mobile_number} onChange={e => setCustForm({...custForm, mobile_number: e.target.value})} />
                <input placeholder="Email *" className="border p-2 rounded" required value={custForm.email} onChange={e => setCustForm({...custForm, email: e.target.value})} />
                <input placeholder="Business Name *" className="border p-2 rounded" required value={custForm.business_name} onChange={e => setCustForm({...custForm, business_name: e.target.value})} />
                <select className="border p-2 rounded" value={custForm.customer_type} onChange={e => setCustForm({...custForm, customer_type: e.target.value})}>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Distributor">Distributor</option>
                </select>
                <input placeholder="Address" className="border p-2 rounded" value={custForm.address} onChange={e => setCustForm({...custForm, address: e.target.value})} />
                <input type="date" className="border p-2 rounded" value={custForm.follow_up_date} onChange={e => setCustForm({...custForm, follow_up_date: e.target.value})} />
                <input placeholder="Initial Notes" className="border p-2 rounded col-span-2" value={custForm.notes} onChange={e => setCustForm({...custForm, notes: e.target.value})} />
                <button type="submit" className="bg-blue-600 text-white rounded font-semibold py-2 md:col-span-3">Save Customer</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Customers</h3>
                <input 
                  placeholder="Search by customer/business name..." 
                  className="border p-2 rounded w-64 text-sm"
                  value={searchCust}
                  onChange={e => setSearchCust(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Business</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="border-b">
                        <td className="p-3 font-semibold">{c.customer_name}</td>
                        <td className="p-3">{c.business_name}</td>
                        <td className="p-3">{c.mobile_number}</td>
                        <td className="p-3">{c.customer_type}</td>
                        <td className="p-3"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Products & Stock Alerts</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Min Alert</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className={`border-b ${p.current_stock <= p.min_stock_alert ? 'bg-red-50' : ''}`}>
                    <td className="p-3 font-mono">{p.sku}</td>
                    <td className="p-3 font-semibold">{p.product_name}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3 font-semibold">₹{p.unit_price}</td>
                    <td className="p-3 font-bold">{p.current_stock}</td>
                    <td className="p-3 text-gray-500">{p.min_stock_alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CHALLAN TAB */}
        {activeTab === 'challan' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h3 className="text-lg font-bold">Generate Sales Challan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Select Customer</label>
                <select className="border p-2 rounded w-full" value={selectedCustId} onChange={e => setSelectedCustId(e.target.value)}>
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.customer_name} ({c.business_name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Status</label>
                <select className="border p-2 rounded w-full" value={challanStatus} onChange={e => setChallanStatus(e.target.value)}>
                  <option value="Draft">Draft</option>
                  <option value="Confirmed">Confirmed (Reduces Stock)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-slate-700">Products</h4>
              {challanItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <select 
                    className="border p-2 rounded flex-1"
                    value={item.product_id}
                    onChange={e => {
                      const newItems = [...challanItems];
                      newItems[idx].product_id = e.target.value;
                      setChallanItems(newItems);
                    }}>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.product_name} (Stock: {p.current_stock})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    className="border p-2 rounded w-24"
                    onChange={e => {
                      const newItems = [...challanItems];
                      newItems[idx].quantity = parseInt(e.target.value, 10) || 1;
                      setChallanItems(newItems);
                    }}
                  />
                  <button 
                    onClick={() => setChallanItems(challanItems.filter((_, i) => i !== idx))}
                    className="text-red-600 font-semibold px-2">
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={addChallanRow} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded font-medium">
                + Add Product Row
              </button>
            </div>

            <button onClick={submitChallan} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold hover:bg-emerald-700">
              Submit Sales Challan
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
