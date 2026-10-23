import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownRight,
  Receipt,
  ShieldCheck,
  BarChart3,
  Users,
  Settings,
} from 'lucide-react';
import ApexFinLogo from './ApexFinLogo';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  const ledgerAndTaxItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Income', icon: <Wallet size={20} />, path: '/income' },
    { name: 'Expenses', icon: <ArrowDownRight size={20} />, path: '/expenses' },
    { name: 'Transactions', icon: <Receipt size={20} />, path: '/transactions' },
    { name: 'Tax & Deductions', icon: <ShieldCheck size={20} />, path: '/deductions' },
    { name: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  ];

  const rolePortals = [];
  if (user?.role === 'Accountant' || user?.role === 'Admin') {
    rolePortals.push({
      name: 'Accountant Portal',
      icon: <Users size={20} />,
      path: '/accountant',
    });
  }
  if (user?.role === 'Admin') {
    rolePortals.push({
      name: 'Admin Portal',
      icon: <Settings size={20} />,
      path: '/admin',
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <ApexFinLogo size={38} className="shadow-sm rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
              Apex<span className="text-blue-600">Fin</span>
            </h1>
            <p className="text-[11px] font-medium text-emerald-600 tracking-wide uppercase">
              Ledger + Tax Suite
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-6 overflow-y-auto">
        {rolePortals.length > 0 && (
          <div>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Role Portals
            </p>
            <div className="flex flex-col gap-1">
              {rolePortals.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ledger &amp; Tax Workspace
          </p>
          <div className="flex flex-col gap-1">
            {ledgerAndTaxItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {user && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full shrink-0">
              {user.role}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
