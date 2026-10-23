import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Analytics & Summary APIs
export const getSummary = (financialYear) =>
  api.get('/analytics/summary', { params: { financialYear } });
export const getMonthlyData = (financialYear) =>
  api.get('/analytics/monthly', { params: { financialYear } });
export const getCategoriesData = (financialYear) =>
  api.get('/analytics/categories', { params: { financialYear } });
export const getYearlyData = () => api.get('/analytics/yearly');
export const getPublicTaxSlabs = (financialYear) =>
  api.get('/analytics/tax-slabs', { params: { financialYear } });

// Income APIs
export const getIncomes = (params) => api.get('/income', { params });
export const createIncome = (data) => api.post('/income', data);
export const updateIncome = (id, data) => api.put(`/income/${id}`, data);
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// Expense APIs
export const getExpenses = (params) => api.get('/expenses', { params });
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Deduction APIs
export const getDeductions = (params) => api.get('/deductions', { params });
export const createDeduction = (data) => api.post('/deductions', data);
export const updateDeduction = (id, data) => api.put(`/deductions/${id}`, data);
export const deleteDeduction = (id) => api.delete(`/deductions/${id}`);

// Currency Formatter (INR ₹)
export const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

export default api;
