import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  getIncomes,
  getExpenses,
  deleteIncome,
  deleteExpense,
  formatINR,
} from '../services/api';
import toast from 'react-hot-toast';
import { Search, Filter, Trash2, Download, Receipt } from 'lucide-react';

const Transactions = () => {
  const { selectedYear } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [incomeRes, expenseRes] = await Promise.all([
        getIncomes({ financialYear: selectedYear }),
        getExpenses({ financialYear: selectedYear }),
      ]);

      const incomes = (incomeRes.data.data || []).map((item) => ({
        ...item,
        title: item.title || item.source,
        type: 'Income',
      }));
      const expenses = (expenseRes.data.data || []).map((item) => ({
        ...item,
        title: item.title || item.category,
        type: 'Expense',
      }));

      const combined = [...incomes, ...expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(combined);
    } catch (error) {
      toast.error('Failed to load unified transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedYear]);

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()} record?`)) {
      try {
        if (type === 'Income') {
          await deleteIncome(id);
        } else {
          await deleteExpense(id);
        }
        toast.success(`${type} deleted successfully`);
        fetchTransactions();
      } catch (error) {
        toast.error(`Failed to delete ${type.toLowerCase()}`);
      }
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const titleStr = (t.title || '').toLowerCase();
    const catStr = (t.category || '').toLowerCase();
    const descStr = (t.description || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = titleStr.includes(q) || catStr.includes(q) || descStr.includes(q);
    const matchesType = filterType === 'All' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Title', 'Type', 'Category', 'Financial Year', 'Payment Method', 'Amount (INR)', 'Description'];
    const rows = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString('en-IN'),
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      t.category,
      t.financialYear || '',
      t.paymentMethod || '',
      t.type === 'Income' ? t.amount : -t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ApexFin_Transactions_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Receipt className="text-blue-600" size={26} />
            Unified Ledger Transactions
          </h2>
          <p className="text-sm text-slate-500">
            Showing {filteredTransactions.length} combined income &amp; expense entries
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn btn-outline bg-white">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/60">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, category, or notes..."
              className="pl-9 pr-4 py-2 w-full bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-500" size={18} />
            <select
              className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Income">Income Only</option>
              <option value="Expense">Expense Only</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Title</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Category</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Type</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">FY</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Method</th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                    Amount
                  </th>
                  <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((t) => (
                  <tr key={`${t.type}-${t._id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                      {t.description && (
                        <p className="text-xs text-slate-500">{t.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-600">{t.category}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.type === 'Income'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">{t.financialYear}</td>
                    <td className="p-4 text-sm text-slate-600">{t.paymentMethod}</td>
                    <td
                      className={`p-4 text-sm font-bold text-right ${
                        t.type === 'Income' ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {t.type === 'Income' ? '+' : '-'}
                      {formatINR(t.amount)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(t._id, t.type)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
