import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  formatINR,
} from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Wallet } from 'lucide-react';

const INCOME_CATEGORIES = [
  'Salary',
  'Sales',
  'Business Income',
  'Freelancing',
  'Investments',
  'Rental Income',
  'Interest Income',
  'Capital Gains',
  'Commission',
  'Other',
];

const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Credit Card', 'Cheque', 'PayPal', 'Other'];

const Income = () => {
  const { selectedYear } = useSelector((state) => state.auth);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultFY = selectedYear === 'All' ? '2025-2026' : selectedYear;

  const [formData, setFormData] = useState({
    title: '',
    source: '',
    amount: '',
    category: 'Salary',
    description: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    financialYear: defaultFY,
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await getIncomes({ financialYear: selectedYear });
      setIncomes(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [selectedYear]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      source: '',
      amount: '',
      category: 'Salary',
      description: '',
      paymentMethod: 'Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      financialYear: selectedYear === 'All' ? '2025-2026' : selectedYear,
    });
    setShowModal(true);
  };

  const openEditModal = (inc) => {
    setEditingId(inc._id);
    setFormData({
      title: inc.title || inc.source || '',
      source: inc.source || inc.title || '',
      amount: inc.amount,
      category: inc.category || 'Salary',
      description: inc.description || '',
      paymentMethod: inc.paymentMethod || 'Bank Transfer',
      date: inc.date ? new Date(inc.date).toISOString().split('T')[0] : '',
      financialYear: inc.financialYear || defaultFY,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        title: formData.title || formData.source,
        source: formData.source || formData.title,
        amount: Number(formData.amount),
      };

      if (editingId) {
        await updateIncome(editingId, payload);
        toast.success('Income updated successfully');
      } else {
        await createIncome(payload);
        toast.success('Income added successfully');
      }
      setShowModal(false);
      fetchIncomes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save income');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteIncome(id);
        toast.success('Income deleted');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wallet className="text-blue-600" size={26} />
            Income Management
          </h2>
          <p className="text-sm text-slate-500">
            Total Recorded ({selectedYear === 'All' ? 'All Years' : `FY ${selectedYear}`}):{' '}
            <span className="font-bold text-emerald-600">{formatINR(totalAmount)}</span>
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} /> Add Income
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading income records...</div>
        ) : incomes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No income records found for {selectedYear === 'All' ? 'any year' : `FY ${selectedYear}`}.
            Click &ldquo;Add Income&rdquo; to create one!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">
                    Title / Source
                  </th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Category</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">FY</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Method</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Amount
                  </th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map((income) => (
                  <tr key={income._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(income.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {income.title || income.source}
                      </p>
                      {income.description && (
                        <p className="text-xs text-slate-500">{income.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-medium">
                        {income.category}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {income.financialYear}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{income.paymentMethod}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600 text-right">
                      +{formatINR(income.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(income)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(income._id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Income Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Income Record' : 'Add New Income'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Title / Employer / Client Source</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Monthly Tech Salary or Client Consulting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="1"
                    step="any"
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {INCOME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Financial Year</label>
                  <select
                    name="financialYear"
                    value={formData.financialYear}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2022-2023">2022-2023</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description / Notes (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="input-field"
                  placeholder="Additional details for ledger or tax filing..."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingId ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
