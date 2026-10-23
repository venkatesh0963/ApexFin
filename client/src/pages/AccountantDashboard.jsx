import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { formatINR } from '../services/api';
import toast from 'react-hot-toast';
import {
  Users,
  FileCheck,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const AccountantDashboard = () => {
  const { selectedYear } = useSelector((state) => state.auth);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accountant/clients');
      setClients(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch client directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInspectClient = async (clientId) => {
    try {
      setLoadingClient(true);
      const res = await api.get(`/accountant/clients/${clientId}/records`, {
        params: { financialYear: selectedYear },
      });
      setSelectedClientData(res.data);
    } catch (error) {
      toast.error('Failed to load client records');
    } finally {
      setLoadingClient(false);
    }
  };

  const handleDeductionStatus = async (deductionId, status) => {
    try {
      await api.put(`/accountant/deductions/${deductionId}/status`, { status });
      toast.success(`Deduction marked as ${status}`);
      if (selectedClientData?.client?._id) {
        handleInspectClient(selectedClientData.client._id);
      }
      fetchClients();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const totalPendingVerifications = clients.reduce(
    (sum, c) => sum + (c.pendingDeductions || 0),
    0
  );
  const totalManagedVolume = clients.reduce((sum, c) => sum + (c.totalIncome || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Chartered Accountant Portal</h1>
        <p className="text-sm text-slate-500">
          Review client ledgers, audit expenses, and verify tax deduction proofs
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4 border-l-4 border-l-blue-600">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Taxpayer Clients
            </p>
            <h3 className="text-2xl font-bold text-slate-900">{clients.length}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <FileCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Verifications
            </p>
            <h3 className="text-2xl font-bold text-slate-900">{totalPendingVerifications}</h3>
          </div>
        </div>

        <div className="card flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Client Gross Income Volume
            </p>
            <h3 className="text-2xl font-bold text-slate-900">{formatINR(totalManagedVolume)}</h3>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Client Directory &amp; Ledger Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Client Name</th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase">Email</th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                  Total Income
                </th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                  Total Expenses
                </th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                  Deductions
                </th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-center">
                  Pending Proofs
                </th>
                <th className="p-4 font-semibold text-slate-600 text-xs uppercase text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No taxpayer clients found.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{client.name}</td>
                    <td className="p-4 text-sm text-slate-500">{client.email}</td>
                    <td className="p-4 text-sm font-semibold text-emerald-600 text-right">
                      {formatINR(client.totalIncome)}
                    </td>
                    <td className="p-4 text-sm font-semibold text-red-600 text-right">
                      {formatINR(client.totalExpense)}
                    </td>
                    <td className="p-4 text-sm font-semibold text-teal-600 text-right">
                      {formatINR(client.totalDeductions)}
                    </td>
                    <td className="p-4 text-center">
                      {client.pendingDeductions > 0 ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                          {client.pendingDeductions} Pending
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          All Verified
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleInspectClient(client._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye size={14} /> View Records
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Records Inspection & Verification Modal */}
      {(selectedClientData || loadingClient) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Client Audit: {selectedClientData?.client?.name || 'Loading...'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedClientData?.client?.email} • Viewing{' '}
                  {selectedYear === 'All' ? 'All Years' : `FY ${selectedYear}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientData(null)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {loadingClient ? (
              <div className="p-12 text-center text-slate-500">Loading client records...</div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Deductions Verification Section */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Declared Tax Deductions (Approve / Reject)
                  </h4>
                  {selectedClientData.deductions.length === 0 ? (
                    <p className="text-sm text-slate-400">No deductions declared.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClientData.deductions.map((ded) => (
                        <div
                          key={ded._id}
                          className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {ded.section}
                              </span>
                              <span className="text-xs text-slate-500">
                                ({ded.financialYear})
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  ded.status === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : ded.status === 'Rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ded.status || 'Pending'}
                              </span>
                            </div>
                            {ded.title && (
                              <p className="text-xs text-slate-600 mt-0.5">{ded.title}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-600">
                              {formatINR(ded.amount)}
                            </span>
                            <button
                              onClick={() => handleDeductionStatus(ded._id, 'Verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 size={13} /> Verify
                            </button>
                            <button
                              onClick={() => handleDeductionStatus(ded._id, 'Rejected')}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Incomes & Expenses Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Income Ledger ({selectedClientData.incomes.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedClientData.incomes.map((inc) => (
                        <div
                          key={inc._id}
                          className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {inc.title || inc.source}
                            </p>
                            <p className="text-xs text-slate-500">
                              {inc.category} • {new Date(inc.date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <span className="font-bold text-emerald-600">
                            +{formatINR(inc.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Expense Ledger ({selectedClientData.expenses.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedClientData.expenses.map((exp) => (
                        <div
                          key={exp._id}
                          className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {exp.title || exp.category}
                            </p>
                            <p className="text-xs text-slate-500">
                              {exp.category} • {new Date(exp.date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <span className="font-bold text-red-600">
                            -{formatINR(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
