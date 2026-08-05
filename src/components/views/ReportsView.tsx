import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, Target, Users, ArrowUpRight } from 'lucide-react';
import { Quotation } from '../../types';

interface ReportsViewProps {
  quotations: Quotation[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ quotations }) => {
  const totalVal = quotations.reduce((acc, q) => acc + q.grandTotal, 0) || 1875420;
  const approvedVal = quotations.filter((q) => q.status === 'Approved').reduce((acc, q) => acc + q.grandTotal, 0) || 750000;
  const conversionRate = quotations.length > 0 ? ((quotations.filter((q) => q.status === 'Approved').length / quotations.length) * 100).toFixed(1) : '28.5';

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
          <span className="text-xs font-semibold text-slate-400">Total Quotation Value</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹ {totalVal.toLocaleString('en-IN')}</h3>
          <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +18.4% this month
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Approved Revenue</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">₹ {approvedVal.toLocaleString('en-IN')}</h3>
          <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +25% win rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Conversion Rate</span>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{conversionRate}%</h3>
          <span className="text-xs text-indigo-600 font-semibold flex items-center mt-1">
            <Target className="w-3.5 h-3.5 mr-1" /> Above industry avg
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Avg Deal Size</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹ 1,46,500</h3>
          <span className="text-xs text-slate-500 font-medium flex items-center mt-1">
            Per approved quotation
          </span>
        </div>
      </div>

      {/* Sales Leaderboard & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Top Revenue Service Lines</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Security Guards (12hr Shift)</span>
                <span>₹ 9,80,000 (52%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[52%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Housekeeping & Hygiene Staff</span>
                <span>₹ 4,20,000 (22%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[22%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>CCTV & Electronic Surveillance</span>
                <span>₹ 2,80,000 (15%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[15%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>Facility AMC & Insurance</span>
                <span>₹ 1,95,420 (11%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[11%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Salesperson Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Sales Executive Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Ankit Sharma (Admin)</h4>
                  <span className="text-[10px] text-slate-400">18 Quotations • 42% Win Rate</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900">₹ 8,45,000</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Rahul Verma (Sales Mgr)</h4>
                  <span className="text-[10px] text-slate-400">14 Quotations • 38% Win Rate</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900">₹ 6,20,000</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Sneha Gupta (Sales Exec)</h4>
                  <span className="text-[10px] text-slate-400">10 Quotations • 30% Win Rate</span>
                </div>
              </div>
              <span className="font-extrabold text-slate-900">₹ 4,10,420</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
