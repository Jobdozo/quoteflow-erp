import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target, Users, ArrowUpRight } from 'lucide-react';
import { Quotation } from '../../types';

interface ReportsViewProps {
  quotations: Quotation[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ quotations }) => {
  const totalVal = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const approvedVal = quotations.filter((q) => q.status === 'Approved').reduce((acc, q) => acc + q.grandTotal, 0);
  const conversionRate = quotations.length > 0 ? ((quotations.filter((q) => q.status === 'Approved').length / quotations.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Business Intelligence</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time analytics on revenue pipeline, win rates, product performance, and sales executive leaderboards.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3">₹ {totalVal.toLocaleString('en-IN')}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> Real-time state
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Closed Win Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3">₹ {approvedVal.toLocaleString('en-IN')}</h3>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" /> Approved contracts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Conversion Win Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3">{conversionRate}%</h3>
          <span className="text-[11px] text-slate-400 font-medium flex items-center mt-1">
            Ratio of Approved / Total
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Deals</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-3">{quotations.length}</h3>
          <span className="text-[11px] text-slate-400 font-medium flex items-center mt-1">
            Total Quotations
          </span>
        </div>
      </div>
    </div>
  );
};
