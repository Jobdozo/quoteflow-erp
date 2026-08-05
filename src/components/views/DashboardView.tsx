import React from 'react';
import {
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Phone,
  MessageSquare,
  Mail,
  Plus,
  UserPlus,
  PackagePlus,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Quotation, FollowUp, QuotationStatus } from '../../types';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  quotations: Quotation[];
  followUps: FollowUp[];
  onNavigate: (tab: NavTab) => void;
  onSelectQuotation: (quotation: Quotation) => void;
  onSendWhatsApp: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotations,
  followUps,
  onNavigate,
  onSelectQuotation,
  onSendWhatsApp,
  onSendEmail,
}) => {
  // Compute metrics from actual state or realistic dashboard defaults
  const totalCount = quotations.length || 128;
  const sentCount = quotations.filter((q) => q.status === 'Sent').length || 42;
  const viewedCount = quotations.filter((q) => q.status === 'Viewed').length || 27;
  const approvedCount = quotations.filter((q) => q.status === 'Approved').length || 15;
  const rejectedCount = quotations.filter((q) => q.status === 'Rejected').length || 8;

  const totalValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0) || 1875420;

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Viewed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Negotiation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Follow Up':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Expired':
        return 'bg-slate-200 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Welcome back, <span className="font-semibold text-slate-800">Ankit Sharma</span>! Here is your quotation overview for today.
        </p>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Quotations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> 18%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{totalCount}</h3>
            <p className="text-xs font-medium text-slate-500">Total Quotations</p>
          </div>
        </div>

        {/* Quotations Sent */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> 12%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{sentCount}</h3>
            <p className="text-xs font-medium text-slate-500">Quotations Sent</p>
          </div>
        </div>

        {/* Viewed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> 8%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{viewedCount}</h3>
            <p className="text-xs font-medium text-slate-500">Viewed</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> 25%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{approvedCount}</h3>
            <p className="text-xs font-medium text-slate-500">Approved</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <TrendingDown className="w-3 h-3 mr-1" /> 3%
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{rejectedCount}</h3>
            <p className="text-xs font-medium text-slate-500">Rejected</p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Line Chart, Donut Chart, Follow Ups Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quotation Overview Line Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Quotation Overview</h3>
            <select className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg px-2.5 py-1.5 outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
            </select>
          </div>

          {/* SVG Line Curve Visualization matching mockup */}
          <div className="relative w-full h-56 flex flex-col justify-end">
            <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1.5" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1.5" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeWidth="1.5" />

              {/* Area Under Curve */}
              <path
                d="M 10 120 C 50 80, 80 130, 120 70 C 160 40, 190 90, 240 40 C 290 90, 340 50, 400 45 C 440 20, 470 70, 490 50 L 490 150 L 10 150 Z"
                fill="url(#blueGradient)"
              />
              {/* Curve Stroke */}
              <path
                d="M 10 120 C 50 80, 80 130, 120 70 C 160 40, 190 90, 240 40 C 290 90, 340 50, 400 45 C 440 20, 470 70, 490 50"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data point 18 May highlight matching mockup */}
              <circle cx="240" cy="40" r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="3" />
            </svg>

            {/* Active Tooltip matching mockup */}
            <div className="absolute left-[44%] top-4 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl border border-slate-700 flex flex-col items-center">
              <span>18 May</span>
              <span className="text-indigo-300 font-bold">28 Quotations</span>
            </div>

            {/* X Axis labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-3 px-2 border-t border-slate-100">
              <span>1 May</span>
              <span>5 May</span>
              <span>10 May</span>
              <span>15 May</span>
              <span>20 May</span>
              <span>25 May</span>
              <span>31 May</span>
            </div>
          </div>
        </div>

        {/* Total Value Donut Chart */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Total Value</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹ {totalValue.toLocaleString('en-IN')}
            </h3>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 mt-0.5">
              <TrendingUp className="w-3 h-3 mr-1" /> 22% this month
            </span>
          </div>

          {/* Donut Chart Graphic */}
          <div className="my-4 flex items-center justify-center relative">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Circle segments */}
              <circle cx="72" cy="72" r="54" stroke="#e2e8f0" strokeWidth="18" fill="transparent" />
              {/* Approved 40% */}
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke="#10b981"
                strokeWidth="18"
                strokeDasharray="339"
                strokeDashoffset="203"
                fill="transparent"
              />
              {/* Pending 30% */}
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke="#f59e0b"
                strokeWidth="18"
                strokeDasharray="339"
                strokeDashoffset="254"
                fill="transparent"
                className="transform origin-center rotate-[144deg]"
              />
              {/* Negotiation 20% */}
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke="#6366f1"
                strokeWidth="18"
                strokeDasharray="339"
                strokeDashoffset="271"
                fill="transparent"
                className="transform origin-center rotate-[252deg]"
              />
              {/* Rejected 10% */}
              <circle
                cx="72"
                cy="72"
                r="54"
                stroke="#f43f5e"
                strokeWidth="18"
                strokeDasharray="339"
                strokeDashoffset="305"
                fill="transparent"
                className="transform origin-center rotate-[324deg]"
              />
            </svg>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Approved</span>
              <span className="text-slate-900 font-bold ml-auto">40%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">Pending</span>
              <span className="text-slate-900 font-bold ml-auto">30%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600 font-medium">Negotiation</span>
              <span className="text-slate-900 font-bold ml-auto">20%</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 font-medium">Rejected</span>
              <span className="text-slate-900 font-bold ml-auto">10%</span>
            </div>
          </div>
        </div>

        {/* Follow Ups Due Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-base">Follow Ups Due</h3>
              <button
                onClick={() => onNavigate('follow-ups')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {followUps.slice(0, 5).map((fu) => (
                <div key={fu.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {fu.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{fu.companyName}</h4>
                      <p className="text-[11px] text-slate-400">Quotation #{fu.quotationNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full block ${
                        fu.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-700'
                          : fu.reminderStage === '2 Days'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {fu.reminderStage}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{fu.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('follow-ups')}
            className="mt-4 w-full text-center text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2.5 rounded-xl transition-colors"
          >
            View All Follow Ups
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Quotations Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Quotations Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Recent Quotations</h3>
            <button
              onClick={() => onNavigate('quotations')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="py-2.5 px-3">Quotation No.</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{q.quotationNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{q.companyName}</td>
                    <td className="py-3 px-3 text-slate-500">{q.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹ {q.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectQuotation(q)}
                          title="View & Generate PDF"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSendWhatsApp(q)}
                          title="Send via WhatsApp"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSendEmail(q)}
                          title="Send via Email"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center pt-4 border-t border-slate-100 mt-2">
            <button
              onClick={() => onNavigate('quotations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All Quotations
            </button>
          </div>
        </div>

        {/* Quick Actions Grid matching mockup */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('new-quotation')}
                className="p-3 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">New Quotation</span>
              </button>

              <button
                onClick={() => onNavigate('customers')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">New Customer</span>
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">New Product</span>
              </button>

              <button
                onClick={() => onNavigate('email-center')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Send Email</span>
              </button>

              <button
                onClick={() => onNavigate('whatsapp-center')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">Send WhatsApp</span>
              </button>

              <button
                onClick={() => onNavigate('follow-ups')}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 mt-2">New Follow Up</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
