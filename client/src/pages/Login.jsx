import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, reset } from '../store/authSlice';
import { LogIn, UserPlus, Shield, Briefcase, User } from 'lucide-react';
import toast from 'react-hot-toast';
import ApexFinLogo from '../components/ApexFinLogo';

const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
  });

  const { name, email, password, role } = formData;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
    if (isSuccess || user) {
      if (user?.role === 'Admin') navigate('/admin');
      else if (user?.role === 'Accountant') navigate('/accountant');
      else navigate('/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      dispatch(register({ name, email, password, role }));
    } else {
      dispatch(login({ email, password }));
    }
  };

  const quickDemoLogin = (demoEmail) => {
    dispatch(login({ email: demoEmail, password: 'password123' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex items-center justify-center p-4">
      <div className="glass-panel p-8 w-full max-w-md shadow-xl border border-slate-200/80">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <ApexFinLogo size={56} className="shadow-md rounded-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Apex<span className="text-blue-600">Fin</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Unified Financial Ledger, Analytics &amp; Tax Management
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isRegisterMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isRegisterMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input-field"
                name="name"
                value={name}
                placeholder="Enter your full name"
                onChange={onChange}
                required
              />
            </div>
          )}

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input-field"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              name="password"
              value={password}
              placeholder="Enter password"
              onChange={onChange}
              required
            />
          </div>

          {isRegisterMode && (
            <div>
              <label className="label">Account Role</label>
              <select name="role" value={role} onChange={onChange} className="input-field">
                <option value="User">Taxpayer / Business User</option>
                <option value="Accountant">Chartered Accountant</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full btn-primary py-2.5 mt-2" disabled={isLoading}>
            {isLoading
              ? 'Please wait...'
              : isRegisterMode
              ? 'Create Unified Account'
              : 'Sign In to Workspace'}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            One-Click Demo Accounts (Seeded)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('user@example.com')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs font-medium text-slate-700 cursor-pointer"
            >
              <User size={16} className="text-blue-600" />
              <span>Taxpayer</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('accountant@example.com')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-xs font-medium text-slate-700 cursor-pointer"
            >
              <Briefcase size={16} className="text-emerald-600" />
              <span>Accountant</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin@example.com')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-xs font-medium text-slate-700 cursor-pointer"
            >
              <Shield size={16} className="text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
