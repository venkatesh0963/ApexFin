import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Transactions from './pages/Transactions';
import Deductions from './pages/Deductions';
import Analytics from './pages/Analytics';
import AccountantDashboard from './pages/AccountantDashboard';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Accountant') return <Navigate to="/accountant" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DefaultHomeRoute = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Accountant') return <Navigate to="/accountant" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <DefaultHomeRoute />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DefaultHomeRoute />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expense />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="deductions" element={<Deductions />} />
          <Route path="analytics" element={<Analytics />} />

          <Route
            path="accountant"
            element={
              <ProtectedRoute allowedRoles={['Accountant', 'Admin']}>
                <AccountantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<DefaultHomeRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
