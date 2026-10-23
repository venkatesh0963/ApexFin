import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  getMonthlyData,
  getCategoriesData,
  getYearlyData,
  formatINR,
} from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { BarChart3 } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const Analytics = () => {
  const { selectedYear } = useSelector((state) => state.auth);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState({ income: [], expense: [], deduction: [] });
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [monthlyRes, categoryRes, yearlyRes] = await Promise.all([
          getMonthlyData(selectedYear),
          getCategoriesData(selectedYear),
          getYearlyData(),
        ]);

        setMonthlyData(monthlyRes.data.data || []);
        setCategoryData(categoryRes.data.data || { income: [], expense: [], deduction: [] });
        setYearlyData(yearlyRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load analytics data');
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="text-blue-600" size={26} />
          Analytics &amp; Financial Reports
        </h2>
        <p className="text-sm text-slate-500">
          Visual breakdown of cash flow, profit trends, and category distributions (
          {selectedYear === 'All' ? 'All Financial Years' : `FY ${selectedYear}`})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income & Expenses */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Income &amp; Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit Trend */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Net Profit Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Pie */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Expenses by Category</h3>
          <div className="h-80">
            {categoryData.expense.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.expense}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.expense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No expense data available
              </div>
            )}
          </div>
        </div>

        {/* Income Categories Pie */}
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Income by Category</h3>
          <div className="h-80">
            {categoryData.income.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.income}
                    cx="50%"
                    cy="48%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.income.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No income data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Year Financial Comparison */}
      {yearlyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Financial Year Comparison (Income, Expenses &amp; Deductions)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="financialYear" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip formatter={(value) => formatINR(value)} />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deductions" name="Tax Deductions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
