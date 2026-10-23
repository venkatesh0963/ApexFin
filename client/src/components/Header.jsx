import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setSelectedYear } from '../store/authSlice';
import { Search, Calendar, LogOut, UserCircle } from 'lucide-react';

const Header = () => {
  const { user, selectedYear } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/transactions');
    }
  };

  const financialYears = ['All', '2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shadow-xs z-20 shrink-0">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, income, or expenses..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        {/* Global Financial Year Selector */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Calendar size={16} className="text-blue-600" />
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">FY:</span>
          <select
            value={selectedYear}
            onChange={(e) => dispatch(setSelectedYear(e.target.value))}
            className="bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
          >
            {financialYears.map((fy) => (
              <option key={fy} value={fy}>
                {fy === 'All' ? 'All Years' : `FY ${fy}`}
              </option>
            ))}
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-slate-700">
              <UserCircle size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
