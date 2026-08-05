import React, { useState } from 'react';
import { Mail, Send, Eye, CheckCircle2, Clock, AlertCircle, Paperclip, Sparkles, ExternalLink } from 'lucide-react';
import { Quotation, CompanySettings, EmailLog } from '../../types';

interface EmailCenterViewProps {
  quotations: Quotation[];
  settings: CompanySettings;
  emailLogs: EmailLog[];
  onSendEmailSubmit: (log: EmailLog) => void;
  selectedQuotationForEmail?: Quotation | null;
}

export const EmailCenterView: React.FC<EmailCenterViewProps> = ({
  quotations,
  settings,
  emailLogs,
  onSendEmailSubmit,
  selectedQuotationForEmail,
}) => {
  const defaultQuote = selectedQuotationForEmail || quotations[0];

  const [activeQuotation, setActiveQuotation] = useState<Quotation>(defaultQuote);
  const [recipientEmail, setRecipientEmail] = useState(defaultQuote?.customerEmail || 'client@company.com');
  const [subject, setSubject] = useState(
    `Official Quotation ${defaultQuote?.quotationNumber || 'Q-2026-125'} from ${settings.companyName}`
  );
  const [emailBody, setEmailBody] = useState(
    `Dear ${defaultQuote?.customerName || 'Client'},\n\nThank you for giving ${settings.companyName} the opportunity to submit our proposal.\n\nPlease find attached our formal quotation #${defaultQuote?.quotationNumber || 'Q-2026-125'} for your review.\n\nSummary:\n- Quotation Ref: ${defaultQuote?.quotationNumber || 'Q-2026-125'}\n- Grand Total: ₹${(defaultQuote?.grandTotal || 125000).toLocaleString('en-IN')}\n- Valid Until: ${defaultQuote?.validUntil || '2026-06-17'}\n\nWe look forward to partnering with you.\n\nBest Regards,\n${settings.companyName}\n${settings.phone} | ${settings.website}`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSelectQuotation = (q: Quotation) => {
    setActiveQuotation(q);
    setRecipientEmail(q.customerEmail);
    setSubject(`Official Quotation ${q.quotationNumber} from ${settings.companyName}`);
    setEmailBody(
      `Dear ${q.customerName},\n\nThank you for giving ${settings.companyName} the opportunity to submit our proposal.\n\nPlease find attached our formal quotation #${q.quotationNumber} for your review.\n\nSummary:\n- Quotation Ref: ${q.quotationNumber}\n- Grand Total: ₹${q.grandTotal.toLocaleString('en-IN')}\n- Valid Until: ${q.validUntil}\n\nWe look forward to partnering with you.\n\nBest Regards,\n${settings.companyName}\n${settings.phone} | ${settings.website}`
    );
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog: EmailLog = {
        id: `em-${Date.now()}`,
        quotationId: activeQuotation.id,
        quotationNumber: activeQuotation.quotationNumber,
        customerEmail: recipientEmail,
        customerName: activeQuotation.customerName,
        subject,
        status: 'Delivered',
        sentAt: new Date().toISOString(),
        trackingPixelId: `px-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      onSendEmailSubmit(newLog);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Center & Pixel Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Send professional HTML emails with PDF auto-attachments and live email read tracking.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Email Composer */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
            Compose Proposal Email
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Quotation</label>
              <select
                value={activeQuotation?.id}
                onChange={(e) => {
                  const q = quotations.find((item) => item.id === e.target.value);
                  if (q) handleSelectQuotation(q);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:border-indigo-500"
              >
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.companyName} (₹{q.grandTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">To Email Address</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
              />
            </div>

            {/* Attached File Pill */}
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-900">{activeQuotation?.quotationNumber}_Quotation.pdf</span>
              </div>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                Auto-Attached
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Content</label>
              <textarea
                rows={8}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-mono text-xs outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSend}
                disabled={isSending}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending Email & Tracking Pixel...' : 'Dispatch HTML Email'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Email Tracking Pixel Logs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Tracking Pixel Analytics</h3>
            </div>
            <p className="text-xs text-slate-400">
              Live notifications when customers open or click your proposal PDF link.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Sent</span>
                <span className="text-lg font-bold text-white">42</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Opened</span>
                <span className="text-lg font-bold text-amber-400">27</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Clicked</span>
                <span className="text-lg font-bold text-emerald-400">18</span>
              </div>
            </div>
          </div>

          {/* Email Activity Log Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">RECENT DISPATCH LOGS</h4>

            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">{log.quotationNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'Clicked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'Opened'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-800 font-semibold truncate">{log.customerName} ({log.customerEmail})</p>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>Sent: {new Date(log.sentAt).toLocaleTimeString()}</span>
                    <span>Pixel: {log.trackingPixelId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
