import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  MessageSquare,
  Mail,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../../types';

interface QuotationsListViewProps {
  quotations: Quotation[];
  onNewQuotation: () => void;
  onSelectQuotation: (quotation: Quotation) => void;
  onEditQuotation: (quotation: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onUpdateStatus: (id: string, status: QuotationStatus) => void;
  onSendWhatsApp: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
}

export const QuotationsListView: React.FC<QuotationsListViewProps> = ({
  quotations,
  onNewQuotation,
  onSelectQuotation,
  onEditQuotation,
  onDeleteQuotation,
  onUpdateStatus,
  onSendWhatsApp,
  onSendEmail,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');

  const statusTabs = ['All', 'Draft', 'Sent', 'Viewed', 'Follow Up', 'Negotiation', 'Approved', 'Rejected', 'Expired'];

  const filteredQuotations = quotations.filter((q) => {
    const matchesTab = activeTab === 'All' || q.status === activeTab;
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.companyName.toLowerCase().includes(search.toLowerCase()) ||
      q.customerName.toLowerCase().includes(search.toLowerCase()) ||
      q.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      q.customerMobile.includes(search);
    return matchesTab && matchesSearch;
  });

  const getStatusBadgeClass = (status: QuotationStatus) => {
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
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, track, send, and update all customer quotations in one central hub.
          </p>
        </div>

        <button
          onClick={onNewQuotation}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
          {statusTabs.map((tab) => {
            const count =
              tab === 'All'
                ? quotations.length
                : quotations.filter((q) => q.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Quotation #, Customer, Mobile, Email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-100">
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Date & Valid Until</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Est. Margin</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                    No quotations found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-indigo-600">
                      {q.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{q.companyName}</p>
                      <p className="text-[11px] text-slate-400">{q.customerName} • {q.customerMobile}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <p>{q.date}</p>
                      <span className="text-[10px] text-slate-400">Valid: {q.validUntil}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      ₹ {q.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                        {q.estimatedMarginPercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={q.status}
                        onChange={(e) => onUpdateStatus(q.id, e.target.value as QuotationStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getStatusBadgeClass(
                          q.status
                        )}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Viewed">Viewed</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectQuotation(q)}
                          title="Preview & Print PDF"
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
                        <button
                          onClick={() => onEditQuotation(q)}
                          title="Edit Quotation"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteQuotation(q.id)}
                          title="Delete Quotation"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
