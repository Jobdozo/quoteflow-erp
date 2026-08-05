import React from 'react';
import { Shield, Lock, Activity, Building2, Key } from 'lucide-react';
import type { AuditLog } from '../../types';

interface SecurityAuditViewProps {
  auditLogs: AuditLog[];
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security, RBAC & Audit Trail</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise security compliance, role-based access matrix, multi-branch partitioning, and real-time audit logs.
        </p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Database Encryption</span>
            <h4 className="text-sm font-bold text-slate-900">AES-256 Enabled</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Multi-Branch Mode</span>
            <h4 className="text-sm font-bold text-slate-900">Gurugram HQ • Mumbai • Blr</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Two-Factor Auth</span>
            <h4 className="text-sm font-bold text-slate-900">2FA Enforced for Admins</h4>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">System Audit Activity Log (Real-time Synchronized)</h3>
          <span className="text-xs font-semibold text-slate-500">{auditLogs.length} Events Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action Details</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.user}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{log.action}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{log.timestamp}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
