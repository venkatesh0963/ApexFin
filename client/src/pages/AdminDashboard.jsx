import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { formatINR } from '../services/api';
import toast from 'react-hot-toast';
import { Users, FileText, Settings, Trash2, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('Overview');

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRules: 0,
    financialYears: 0,
    totalTransactions: 0,
  });
  const [users, setUsers] = useState([]);
  const [taxSlabs, setTaxSlabs] = useState([]);

  const [slabForm, setSlabForm] = useState({
    regime: 'New',
    financialYear: '2025-2026',
    minIncome: '',
    maxIncome: '',
    rate: '',
  });
  const [tempSlabs, setTempSlabs] = useState([]);

  const fetchData = async () => {
    try {
      if (activeTab === 'Overview') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'Users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'TaxSlabs') {
        const res = await api.get('/admin/tax-slabs');
        setTaxSlabs(res.data);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      fetchData();
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user and all associated records?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const handleAddSlabItem = () => {
    setTempSlabs([
      ...tempSlabs,
      {
        minIncome: Number(slabForm.minIncome),
        maxIncome: slabForm.maxIncome ? Number(slabForm.maxIncome) : null,
        rate: Number(slabForm.rate),
      },
    ]);
    setSlabForm({ ...slabForm, minIncome: '', maxIncome: '', rate: '' });
  };

  const handleSaveTaxSlab = async () => {
    try {
      await api.post('/admin/tax-slabs', {
        regime: slabForm.regime,
        financialYear: slabForm.financialYear,
        slabs: tempSlabs,
      });
      toast.success('Tax slab configuration saved');
      setTempSlabs([]);
      fetchData();
    } catch (error) {
      toast.error('Error saving tax slab');
    }
  };

  const handleDeleteTaxSlab = async (id) => {
    if (!window.confirm('Delete this tax slab configuration?')) return;
    try {
      await api.delete(`/admin/tax-slabs/${id}`);
      toast.success('Tax slab deleted');
      fetchData();
    } catch (error) {
      toast.error('Error deleting slab');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administrator Portal</h1>
          <p className="text-sm text-slate-500">
            Manage users, access roles, and statutory tax slab configurations
          </p>
        </div>
        <div className="flex bg-white rounded-xl p-1 shadow-2xs border border-slate-200">
          {['Overview', 'Users', 'TaxSlabs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'TaxSlabs' ? 'Tax Slabs' : tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card flex items-center gap-4 border-l-4 border-l-purple-600">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Users
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
            </div>
          </div>
          <div className="card flex items-center gap-4 border-l-4 border-l-blue-600">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Settings className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Tax Rules
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.activeRules}</h3>
            </div>
          </div>
          <div className="card flex items-center gap-4 border-l-4 border-l-emerald-600">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Fin. Years Configured
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.financialYears}</h3>
            </div>
          </div>
          <div className="card flex items-center gap-4 border-l-4 border-l-indigo-600">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Activity className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ledger Entries
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalTransactions || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Users' && (
        <div className="card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">User &amp; Role Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Name</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Email</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Role</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-4 text-sm text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={u._id === user._id}
                      >
                        <option value="User">User</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      {u._id !== user._id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'TaxSlabs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Configured Tax Slabs</h3>
            <div className="space-y-4">
              {taxSlabs.length === 0 && (
                <p className="text-slate-500 text-sm">No tax slabs configured yet.</p>
              )}
              {taxSlabs.map((slab) => (
                <div key={slab._id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{slab.regime} Regime</h4>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        FY {slab.financialYear}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTaxSlab(slab._id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="text-sm space-y-1.5">
                    {slab.slabs.map((s, idx) => (
                      <li key={idx} className="flex justify-between items-center text-slate-600">
                        <span className="font-medium bg-white px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {formatINR(s.minIncome)} –{' '}
                          {s.maxIncome ? formatINR(s.maxIncome) : 'Above'}
                        </span>
                        <span className="font-bold text-slate-900 bg-slate-200/70 px-2.5 py-1 rounded text-xs">
                          {s.rate}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="card h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Slab Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Regime</label>
                  <select
                    value={slabForm.regime}
                    onChange={(e) => setSlabForm({ ...slabForm, regime: e.target.value })}
                    className="input-field"
                  >
                    <option value="New">New</option>
                    <option value="Old">Old</option>
                  </select>
                </div>
                <div>
                  <label className="label">Financial Year</label>
                  <input
                    type="text"
                    placeholder="2025-2026"
                    value={slabForm.financialYear}
                    onChange={(e) => setSlabForm({ ...slabForm, financialYear: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Add Bracket Rule
                </h4>
                <div className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">
                      Min (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={slabForm.minIncome}
                      onChange={(e) => setSlabForm({ ...slabForm, minIncome: e.target.value })}
                      className="input-field py-1.5 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">
                      Max (Opt)
                    </label>
                    <input
                      type="number"
                      placeholder="300000"
                      value={slabForm.maxIncome}
                      onChange={(e) => setSlabForm({ ...slabForm, maxIncome: e.target.value })}
                      className="input-field py-1.5 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-500">
                      Rate (%)
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      value={slabForm.rate}
                      onChange={(e) => setSlabForm({ ...slabForm, rate: e.target.value })}
                      className="input-field py-1.5 px-2 text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddSlabItem}
                      className="btn btn-primary w-full py-1.5 px-2 text-sm"
                      disabled={slabForm.minIncome === '' || slabForm.rate === ''}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {tempSlabs.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Pending Brackets
                  </h5>
                  <ul className="text-sm space-y-1.5 mb-4">
                    {tempSlabs.map((s, idx) => (
                      <li key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          {formatINR(s.minIncome)} –{' '}
                          {s.maxIncome ? formatINR(s.maxIncome) : 'Above'}
                        </span>
                        <span className="font-bold">{s.rate}%</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleSaveTaxSlab}
                    className="btn btn-success w-full"
                    disabled={!slabForm.financialYear}
                  >
                    Save Full Configuration
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
