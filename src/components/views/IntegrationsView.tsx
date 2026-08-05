import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, RefreshCw, Zap, Shield } from 'lucide-react';
import type { Integration } from '../../types';

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'int-1',
      name: 'WhatsApp Business API',
      category: 'Communication',
      icon: '💬',
      connected: true,
      status: 'Active',
      description: 'Send instant proposal PDFs and interactive templates to client WhatsApp numbers.',
    },
    {
      id: 'int-2',
      name: 'SendGrid & Amazon SES Email',
      category: 'Communication',
      icon: '✉️',
      connected: true,
      status: 'Active',
      description: 'High-deliverability HTML emails with embedded tracking pixels and attachments.',
    },
    {
      id: 'int-3',
      name: 'Razorpay Payment Gateway',
      category: 'Payment',
      icon: '💳',
      connected: true,
      status: 'Active',
      description: 'Instant UPI, NetBanking, and credit card payment links generated on PDF invoices.',
    },
    {
      id: 'int-4',
      name: 'Tally Prime & Zoho Books',
      category: 'Accounting',
      icon: '📊',
      connected: true,
      status: 'Active',
      description: 'Auto-sync monthly invoices, GST ledgers, and voucher entries into Tally ERP.',
    },
    {
      id: 'int-5',
      name: 'Google Drive & Dropbox Cloud',
      category: 'Storage',
      icon: '☁️',
      connected: true,
      status: 'Active',
      description: 'Auto-backup generated quotation PDFs, contract agreements, and site survey photos.',
    },
    {
      id: 'int-6',
      name: 'Microsoft Outlook & Google Calendar',
      category: 'Calendar',
      icon: '📅',
      connected: true,
      status: 'Active',
      description: 'Synchronize client site visits and follow-up deadlines with your personal calendar.',
    },
  ]);

  const toggleConnect = (id: string) => {
    setIntegrations(
      integrations.map((item) => {
        if (item.id === id) {
          const nextState = !item.connected;
          return {
            ...item,
            connected: nextState,
            status: nextState ? 'Active' : 'Disconnected',
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Integrations Hub</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect QuoteFlow with your existing CRM stack, payment gateways, accounting software, and communication APIs.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    item.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{item.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
              <button
                onClick={() => toggleConnect(item.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                  item.connected
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {item.connected ? 'Disconnect' : 'Connect API'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
