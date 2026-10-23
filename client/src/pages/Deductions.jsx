import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getDeductions,
  createDeduction,
  deleteDeduction,
  getSummary,
  getPublicTaxSlabs,
  formatINR,
} from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ShieldCheck, Calculator, CheckCircle2, Clock, XCircle } from 'lucide-react';

const DEDUCTION_SECTIONS = [
  'Section 80C',
  'Section 80D',
  'Home Loan Interest',
  'Education Loan Interest',
  'HRA Exemption',
  'Donations',
  'NPS Contributions',
  'Other',
];

const Deductions = () => {
  const { selectedYear } = useSelector((state) => state.auth);
  const [deductions, setDeductions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultFY = selectedYear === 'All' ? '2025-2026' : selectedYear;

  const [formData, setFormData] = useState({
    section: 'Section 80C',
    title: '',
    amount: '',
    financialYear: defaultFY,
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [dedRes, sumRes, slabRes] = await Promise.all([
        getDeductions({ financialYear: selectedYear }),
        getSummary(selectedYear),
        getPublicTaxSlabs(selectedYear === 'All' ? '2025-2026' : selectedYear),
      ]);
      setDeductions(dedRes.data.data || []);
      setSummary(sumRes.data.data || null);
      setSlabs(slabRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load tax & deduction data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [selectedYear]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createDeduction({
        ...formData,
        financialYear:
          selectedYear === 'All' ? formData.financialYear || '2025-2026' : selectedYear,
        amount: Number(formData.amount),
      });
      toast.success('Deduction declared successfully');
      setFormData({
        section: 'Section 80C',
        title: '',
        amount: '',
        financialYear: defaultFY,
      });
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding deduction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deduction declaration?')) return;
    try {
      await deleteDeduction(id);
      toast.success('Deduction removed');
      fetchAll();
    } catch (error) {
      toast.error('Error deleting deduction');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Verified
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={12} /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="text-emerald-600" size={26} />
            Tax Deductions &amp; Regime Calculator
          </h2>
          <p className="text-sm text-slate-500">
            Track tax-saving declarations and compare Old vs New Regime liabilities
          </p>
        </div>
      </div>

      {/* Tax Computation Summary Banner */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-slate-900 text-white border-none">
            <p className="text-xs uppercase tracking-wider text-slate-400">Net Ledger Profit</p>
            <h3 className="text-2xl font-bold mt-1">{formatINR(summary.netProfit)}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Income ({formatINR(summary.totalIncome)}) - Spend ({formatINR(summary.totalExpenses)})
            </p>
          </div>
          <div className="card border-l-4 border-l-emerald-500">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Deductions</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {formatINR(summary.totalDeductions)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Applied to Old Regime</p>
          </div>
          <div className="card border-l-4 border-l-slate-600">
            <p className="text-xs uppercase tracking-wider text-slate-400">Old Regime Tax</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {formatINR(summary.estimatedTaxOld)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Taxable: {formatINR(summary.taxableIncomeOld)}
            </p>
          </div>
          <div className="card border-l-4 border-l-blue-600">
            <p className="text-xs uppercase tracking-wider text-slate-400">New Regime Tax</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">
              {formatINR(summary.estimatedTaxNew)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Taxable: {formatINR(summary.taxableIncomeNew)} (₹75k Std Ded.)
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Declared Deductions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">
                    Section / Details
                  </th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">FY</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Status</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Amount Claimed
                  </th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      Loading deductions...
                    </td>
                  </tr>
                ) : deductions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No deductions declared for this period.
                    </td>
                  </tr>
                ) : (
                  deductions.map((ded) => (
                    <tr key={ded._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(ded.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
                          {ded.section}
                        </span>
                        {ded.title && ded.title !== ded.section && (
                          <p className="text-xs text-slate-600 mt-1">{ded.title}</p>
                        )}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {ded.financialYear}
                      </td>
                      <td className="p-4">{getStatusBadge(ded.status)}</td>
                      <td className="p-4 font-bold text-emerald-600 text-right">
                        {formatINR(ded.amount)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(ded._id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors p-1.5 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Tax Declaration</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label">Tax Section / Exemption</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="input-field"
                >
                  {DEDUCTION_SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Investment / Proof Description</label>
                <input
                  type="text"
                  placeholder="e.g., PPF, ELSS, LIC, Health Insurance"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Amount Claimed (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="150000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                />
              </div>
              <button type="submit" className="w-full btn btn-success">
                <Plus size={18} /> Declare Deduction
              </button>
            </form>
          </div>

          {/* Active Tax Slabs Reference */}
          <div className="card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Calculator size={16} className="text-blue-600" />
              Configured Tax Slabs
            </h3>
            {slabs.length === 0 ? (
              <p className="text-xs text-slate-500">Using standard statutory tax slabs.</p>
            ) : (
              <div className="space-y-3">
                {slabs.map((slab) => (
                  <div
                    key={slab._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex justify-between font-bold text-slate-800 mb-1.5">
                      <span>{slab.regime} Regime</span>
                      <span className="text-blue-600">FY {slab.financialYear}</span>
                    </div>
                    <div className="space-y-1">
                      {slab.slabs.map((s, idx) => (
                        <div key={idx} className="flex justify-between text-slate-600">
                          <span>
                            {formatINR(s.minIncome)} –{' '}
                            {s.maxIncome ? formatINR(s.maxIncome) : 'Above'}
                          </span>
                          <span className="font-semibold text-slate-900">{s.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deductions;
