import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getSummary,
  getMonthlyData,
  getCategoriesData,
  getIncomes,
  getExpenses,
  getDeductions,
  formatINR,
} from '../services/api';
import {
  Wallet,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calculator,
  Percent,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const Dashboard = () => {
  const { user, selectedYear } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState({ income: [], expense: [], deduction: [] });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, monthlyRes, categoryRes, incRes, expRes, dedRes] = await Promise.all([
          getSummary(selectedYear),
          getMonthlyData(selectedYear),
          getCategoriesData(selectedYear),
          getIncomes({ financialYear: selectedYear }),
          getExpenses({ financialYear: selectedYear }),
          getDeductions({ financialYear: selectedYear }),
        ]);

        setSummary(summaryRes.data.data);
        setMonthlyData(monthlyRes.data.data);
        setCategoryData(categoryRes.data.data);

        const incList = (incRes.data.data || []).slice(0, 4).map((i) => ({
          _id: i._id,
          title: i.title || i.source,
          subtitle: `Income • ${i.category}`,
          amount: i.amount,
          date: i.date,
          kind: 'income',
        }));
        const expList = (expRes.data.data || []).slice(0, 4).map((e) => ({
          _id: e._id,
          title: e.title || e.category,
          subtitle: `Expense • ${e.category}`,
          amount: e.amount,
          date: e.date,
          kind: 'expense',
        }));
        const dedList = (dedRes.data.data || []).slice(0, 3).map((d) => ({
          _id: d._id,
          title: d.title || d.section,
          subtitle: `Deduction • ${d.section} (${d.status || 'Pending'})`,
          amount: d.amount,
          date: d.createdAt,
          kind: 'deduction',
        }));

        const merged = [...incList, ...expList, ...dedList]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 7);

        setRecentItems(merged);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data. Please ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const lowestTax = Math.min(summary?.estimatedTaxOld || 0, summary?.estimatedTaxNew || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Unified Ledger &amp; Tax Overview
          </h2>
          <p className="text-sm text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span> • Viewing{' '}
            <span className="font-semibold text-blue-600">
              {selectedYear === 'All' ? 'All Financial Years' : `FY ${selectedYear}`}
            </span>
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* 6 Unified KPI Cards (Ledger + Tax) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="card border-l-4 border-l-blue-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Total Income
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatINR(summary?.totalIncome)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Gross revenue &amp; earnings</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Wallet size={24} />
          </div>
        </div>

        <div className="card border-l-4 border-l-red-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Total Expenses
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatINR(summary?.totalExpenses)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Operating &amp; personal spend</p>
          </div>
          <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div
          className={`card border-l-4 flex items-center justify-between ${
            summary?.isProfit ? 'border-l-emerald-500' : 'border-l-orange-500'
          }`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {summary?.isProfit ? 'Net Profit / Surplus' : 'Net Loss / Deficit'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatINR(Math.abs(summary?.netProfit || 0))}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Profit Margin: <span className="font-semibold">{summary?.profitMargin || 0}%</span>
            </p>
          </div>
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              summary?.isProfit
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-orange-50 text-orange-600'
            }`}
          >
            {summary?.isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
        </div>

        <div className="card border-l-4 border-l-teal-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tax Deductions Claimed
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatINR(summary?.totalDeductions)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">80C, 80D, NPS &amp; Exemptions</p>
          </div>
          <div className="h-12 w-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="card border-l-4 border-l-indigo-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Est. Taxable Income
            </p>
            <h3 className="text-2xl font-bold text-indigo-700">
              {formatINR(summary?.taxableIncomeOld)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              New Regime Taxable: {formatINR(summary?.taxableIncomeNew)}
            </p>
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Percent size={24} />
          </div>
        </div>

        <div className="card border-l-4 border-l-purple-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Optimal Est. Tax
            </p>
            <h3 className="text-2xl font-bold text-purple-700">{formatINR(lowestTax)}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Recommended: {summary?.recommendedRegime || 'New Regime'}
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Calculator size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Monthly Income vs Expense
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip
                  formatter={(value) => formatINR(value)}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Expenses by Category</h3>
          <div className="h-80">
            {categoryData.expense?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.expense}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.expense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(value)} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No expense data for this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tax Regime Comparison & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tax Regime Quick Comparison</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Old Tax Regime</p>
                <p className="text-xs text-slate-500">
                  Taxable: {formatINR(summary?.taxableIncomeOld)} (after deductions)
                </p>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {formatINR(summary?.estimatedTaxOld)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-blue-900">New Tax Regime</p>
                <p className="text-xs text-blue-600">
                  Taxable: {formatINR(summary?.taxableIncomeNew)} (₹75k std. deduction)
                </p>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {formatINR(summary?.estimatedTaxNew)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              💡 You save{' '}
              <span className="font-bold">
                {formatINR(
                  Math.abs((summary?.estimatedTaxOld || 0) - (summary?.estimatedTaxNew || 0))
                )}
              </span>{' '}
              by choosing the <span className="underline">{summary?.recommendedRegime}</span>.
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Ledger &amp; Tax Activity</h3>
          {recentItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No recent activity recorded for this period.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentItems.map((item) => (
                <div
                  key={`${item.kind}-${item._id}`}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.subtitle} • {new Date(item.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      item.kind === 'income'
                        ? 'text-emerald-600'
                        : item.kind === 'expense'
                        ? 'text-red-600'
                        : 'text-teal-600'
                    }`}
                  >
                    {item.kind === 'income' ? '+' : item.kind === 'expense' ? '-' : ''}
                    {formatINR(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
