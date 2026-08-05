import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Paperclip,
  Inbox,
  RefreshCw,
  Star,
  Reply,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  X,
  Plus,
  ArrowLeft,
  BarChart2,
  MousePointerClick,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  TrendingUp,
  AtSign,
} from 'lucide-react';
import { Quotation, CompanySettings, EmailLog, InboxEmail, PixelEvent } from '../../types';
import { StorageService } from '../../utils/storage';

interface EmailCenterViewProps {
  quotations: Quotation[];
  settings: CompanySettings;
  emailLogs: EmailLog[];
  onSendEmailSubmit: (log: EmailLog) => void;
  selectedQuotationForEmail?: Quotation | null;
}

type TabType = 'inbox' | 'compose' | 'sent';

const MOCK_INBOX: InboxEmail[] = [
  {
    id: 'in-1',
    fromName: 'Rajesh Sharma',
    fromEmail: 'rajesh.sharma@clientcorp.com',
    subject: 'Re: Quotation Q-2026-112 — Additional Guards Required',
    preview: 'Thank you for the proposal. We would like to increase the guard count to 18 for the night shift...',
    body: `Dear Team,\n\nThank you for the proposal (Q-2026-112). We reviewed it thoroughly.\n\nWe would like to increase the guard count to 18 for the night shift at our Sector 14 facility.\n\nCould you please send a revised quotation with the updated manpower count and GST breakup?\n\nRegards,\nRajesh Sharma\nHead of Security, Client Corp`,
    receivedAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    category: 'reply',
  },
  {
    id: 'in-2',
    fromName: 'Priya Mehta',
    fromEmail: 'priya.mehta@techpark.in',
    subject: 'Security Requirement for New IT Park — Site Survey Request',
    preview: 'We are setting up a new IT campus in Sector 62, Noida. We need armed guards, CCTV...',
    body: `Hi,\n\nWe are setting up a new IT campus in Sector 62, Noida (approx. 2.5 lakh sq ft).\n\nWe need:\n- 24 armed guards (3 shifts)\n- CCTV monitoring team (6 operators)\n- Boom barrier management\n- Access control integration\n\nPlease send a representative for a site survey this week.\n\nThanks,\nPriya Mehta\nFacility Manager, Tech Park Ltd.`,
    receivedAt: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    category: 'inquiry',
  },
  {
    id: 'in-3',
    fromName: 'HDFC Bank NEFT',
    fromEmail: 'noreply@hdfcbank.com',
    subject: 'NEFT Credit Alert — ₹2,84,500 Credited to A/c ending XXXX9812',
    preview: 'Dear Account Holder, Amount of ₹2,84,500 has been credited via NEFT to your account...',
    body: `Dear Account Holder,\n\nAmount of ₹2,84,500 has been credited via NEFT to your account ending XXXX9812.\n\nTransaction Details:\n- Amount: ₹2,84,500\n- Reference: NEFT/ICI0000031/20260806\n- From: CLIENT CORP LTD\n- Narration: PAYMENT AGAINST INV-2026-078\n\nThis is an auto-generated message. Please do not reply.\n\nHDFC Bank Ltd.`,
    receivedAt: new Date(Date.now() - 10800000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    category: 'payment',
  },
  {
    id: 'in-4',
    fromName: 'Suresh Kumar',
    fromEmail: 'suresh.k@mallmanagement.in',
    subject: 'Complaint: Guard Absent at Gate 3 — 05-Aug-2026',
    preview: 'We are disappointed to report that Gate 3 was unmanned for 2 hours yesterday morning...',
    body: `Dear Management,\n\nWe are disappointed to report that Gate 3 was unmanned for 2 hours yesterday morning (05-Aug-2026, 07:00–09:00 AM).\n\nThis is a serious breach of contract. Gate 3 is a high-traffic entry/exit during morning hours.\n\nPlease ensure this does not repeat and send a written explanation within 24 hours.\n\nRegards,\nSuresh Kumar\nMall Operations Manager`,
    receivedAt: new Date(Date.now() - 18000000).toISOString(),
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    category: 'complaint',
  },
  {
    id: 'in-5',
    fromName: 'Amit Verma',
    fromEmail: 'amit.verma@factoryhub.co.in',
    subject: 'Request for Security Proposal — Factory Unit, Bahadurgarh',
    preview: 'Hello, we are looking for a security vendor for our new factory in Bahadurgarh, Haryana...',
    body: `Hello,\n\nWe are looking for a reliable security vendor for our new factory unit in Bahadurgarh, Haryana.\n\nRequirement:\n- Factory area: ~80,000 sq ft\n- 12 guards (2 shifts)\n- Supervisory staff: 2\n- Armed guard for cash movement: 1 on demand\n\nBudget: ₹2.5 – 3.5 lakhs/month\n\nPlease share your proposal.\n\nAmit Verma\nAdmin Head, Factory Hub India Pvt Ltd`,
    receivedAt: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    category: 'inquiry',
  },
];

const generateMockPixelEvents = (): PixelEvent[] => [
  { eventType: 'open', timestamp: new Date(Date.now() - 600000).toISOString(), ipAddress: '103.45.67.89', city: 'Delhi', device: 'Desktop', os: 'Windows 11' },
  { eventType: 'open', timestamp: new Date(Date.now() - 1200000).toISOString(), ipAddress: '49.36.78.21', city: 'Gurugram', device: 'Mobile', os: 'Android 14' },
  { eventType: 'click', timestamp: new Date(Date.now() - 900000).toISOString(), ipAddress: '103.45.67.89', city: 'Delhi', device: 'Desktop', os: 'Windows 11' },
  { eventType: 'open', timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '117.23.11.44', city: 'Noida', device: 'Tablet', os: 'iOS 17' },
];

const categoryColors: Record<string, string> = {
  inquiry: 'bg-indigo-100 text-indigo-800',
  reply: 'bg-emerald-100 text-emerald-800',
  payment: 'bg-green-100 text-green-800',
  complaint: 'bg-rose-100 text-rose-800',
  general: 'bg-slate-100 text-slate-600',
};

const categoryLabels: Record<string, string> = {
  inquiry: 'New Inquiry',
  reply: 'Reply',
  payment: 'Payment',
  complaint: 'Complaint',
  general: 'General',
};

export const EmailCenterView: React.FC<EmailCenterViewProps> = ({
  quotations,
  settings,
  emailLogs,
  onSendEmailSubmit,
  selectedQuotationForEmail,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [inboxEmails, setInboxEmails] = useState<InboxEmail[]>(MOCK_INBOX);
  const [selectedInboxEmail, setSelectedInboxEmail] = useState<InboxEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTrackingLog, setSelectedTrackingLog] = useState<EmailLog | null>(null);

  // Compose state
  const defaultQuote = selectedQuotationForEmail || quotations[0];
  const [activeQuotation, setActiveQuotation] = useState<Quotation | undefined>(defaultQuote);
  const [toEmail, setToEmail] = useState(defaultQuote?.customerEmail || '');
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [subject, setSubject] = useState(
    defaultQuote ? `Official Quotation ${defaultQuote.quotationNumber} from ${settings.companyName || 'QuoteFlow ERP'}` : ''
  );
  const [emailBody, setEmailBody] = useState(() => buildEmailBody(defaultQuote, settings));
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showCcBcc, setShowCcBcc] = useState(false);

  function buildEmailBody(q: Quotation | undefined, s: CompanySettings): string {
    if (!q) return '';
    return `Dear ${q.customerName},\n\nThank you for giving ${s.companyName || 'us'} the opportunity to submit our proposal.\n\nPlease find attached our formal quotation #${q.quotationNumber} for your kind review and consideration.\n\n────────────────────────────────\n📋 QUOTATION SUMMARY\n────────────────────────────────\n• Quotation Ref : ${q.quotationNumber}\n• Company       : ${q.companyName}\n• Grand Total   : ₹${q.grandTotal.toLocaleString('en-IN')}\n• Valid Until   : ${q.validUntil}\n────────────────────────────────\n\nShould you have any questions or require a revision, please feel free to reach out.\n\nWarm Regards,\n${s.companyName || 'Your Company'}\n${s.phone ? `📞 ${s.phone}` : ''} ${s.email ? `| ✉️ ${s.email}` : ''}\n${s.website || ''}`;
  }

  const handleSelectQuotation = (q: Quotation) => {
    setActiveQuotation(q);
    setToEmail(q.customerEmail);
    setSubject(`Official Quotation ${q.quotationNumber} from ${settings.companyName || 'QuoteFlow ERP'}`);
    setEmailBody(buildEmailBody(q, settings));
  };

  const handleSend = () => {
    if (!toEmail.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      const pixelId = `px-${Math.floor(100000 + Math.random() * 900000)}`;
      const mockEvents = generateMockPixelEvents();
      const newLog: EmailLog = {
        id: `em-${Date.now()}`,
        quotationId: activeQuotation?.id || '',
        quotationNumber: activeQuotation?.quotationNumber || '—',
        customerEmail: toEmail,
        customerName: activeQuotation?.customerName || toEmail,
        subject,
        body: emailBody,
        cc: ccEmail,
        bcc: bccEmail,
        status: 'Delivered',
        sentAt: new Date().toISOString(),
        trackingPixelId: pixelId,
        openCount: 0,
        clickCount: 0,
        pixelEvents: [],
        attachmentName: activeQuotation ? `${activeQuotation.quotationNumber}_Quotation.pdf` : undefined,
      };
      onSendEmailSubmit(newLog);
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setActiveTab('sent');
      }, 1500);
    }, 1200);
  };

  const handleReplyToInbox = (email: InboxEmail) => {
    setToEmail(email.fromEmail);
    setSubject(`Re: ${email.subject}`);
    setEmailBody(`\n\n─────── Original Message ───────\nFrom: ${email.fromName} <${email.fromEmail}>\nDate: ${new Date(email.receivedAt).toLocaleString()}\nSubject: ${email.subject}\n\n${email.body}`);
    setActiveQuotation(undefined);
    setActiveTab('compose');
    setSelectedInboxEmail(null);
  };

  const handleRefreshInbox = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleMarkRead = (id: string) => {
    setInboxEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isRead: true } : e)));
  };

  const handleStarToggle = (id: string) => {
    setInboxEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e)));
  };

  const handleDeleteInbox = (id: string) => {
    setInboxEmails((prev) => prev.filter((e) => e.id !== id));
    if (selectedInboxEmail?.id === id) setSelectedInboxEmail(null);
  };

  const filteredInbox = inboxEmails.filter(
    (e) =>
      e.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.fromEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = inboxEmails.filter((e) => !e.isRead).length;
  const totalSent = emailLogs.length;
  const totalOpened = emailLogs.filter((l) => l.status === 'Opened' || l.status === 'Clicked').length;
  const totalClicked = emailLogs.filter((l) => l.status === 'Clicked').length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  const tabs = [
    { id: 'inbox' as TabType, label: 'Inbox', icon: Inbox, badge: unreadCount },
    { id: 'compose' as TabType, label: 'Compose Email', icon: Send, badge: 0 },
    { id: 'sent' as TabType, label: 'Sent & Pixel Tracking', icon: Eye, badge: totalSent },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Center & Pixel Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compose & send professional emails, check incoming client inquiries, and track email opens with real-time pixel analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setActiveTab('compose'); setActiveQuotation(undefined); setToEmail(''); setSubject(''); setEmailBody(''); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Email</span>
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center space-x-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── INBOX TAB ────────────────────────────────────────── */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Inbox List */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Inbox toolbar */}
            <div className="p-3 border-b border-slate-100 flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleRefreshInbox}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredInbox.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No emails found
                </div>
              ) : (
                filteredInbox.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => { setSelectedInboxEmail(email); handleMarkRead(email.id); }}
                    className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${selectedInboxEmail?.id === email.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''} ${!email.isRead ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${email.isRead ? 'bg-transparent' : 'bg-indigo-600'}`} />
                        <div className="min-w-0">
                          <p className={`text-xs truncate ${email.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                            {email.fromName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{email.fromEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleStarToggle(email.id); }}>
                          <Star className={`w-3.5 h-3.5 ${email.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(email.receivedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs mt-1.5 truncate ${email.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                      {email.subject}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[11px] text-slate-500 truncate flex-1">{email.preview}</p>
                      <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${categoryColors[email.category]}`}>
                        {categoryLabels[email.category]}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email Viewer */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {selectedInboxEmail ? (
              <div className="h-full flex flex-col">
                {/* Email header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-slate-900 text-sm leading-tight">{selectedInboxEmail.subject}</h2>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                          {selectedInboxEmail.fromName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{selectedInboxEmail.fromName}</p>
                          <p className="text-[11px] text-slate-500">{selectedInboxEmail.fromEmail}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryColors[selectedInboxEmail.category]}`}>
                          {categoryLabels[selectedInboxEmail.category]}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Received: {new Date(selectedInboxEmail.receivedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleReplyToInbox(selectedInboxEmail)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleDeleteInbox(selectedInboxEmail.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email body */}
                <div className="flex-1 p-5 overflow-y-auto">
                  <pre className="text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">{selectedInboxEmail.body}</pre>
                </div>

                {/* Quick reply bar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => handleReplyToInbox(selectedInboxEmail)}
                    className="w-full text-left text-xs text-slate-400 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-indigo-400 transition-colors"
                  >
                    Click to reply to {selectedInboxEmail.fromName}...
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 text-slate-400">
                <Mail className="w-12 h-12 mb-3 text-slate-200" />
                <p className="font-bold text-sm text-slate-700">Select an email to read</p>
                <p className="text-xs mt-1">Choose any email from the inbox on the left to view its content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPOSE TAB ─────────────────────────────────────── */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Composer */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">✏️ Compose New Email</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                📎 PDF Auto-Attached
              </span>
            </div>

            {sendSuccess && (
              <div className="mx-4 mt-3 p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Email dispatched successfully! Pixel tracking is now active.</span>
              </div>
            )}

            <div className="p-4 space-y-3 text-xs">
              {/* Quotation selector */}
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Link Quotation (Optional)</label>
                <select
                  value={activeQuotation?.id || ''}
                  onChange={(e) => {
                    const q = quotations.find((item) => item.id === e.target.value);
                    if (q) handleSelectQuotation(q);
                    else setActiveQuotation(undefined);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="">— No Quotation Attached —</option>
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quotationNumber} · {q.companyName} · ₹{q.grandTotal.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* To */}
              <div className="relative">
                <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">To</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 space-x-2 focus-within:border-indigo-500">
                  <AtSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="recipient@company.com"
                    className="flex-1 bg-transparent text-slate-800 font-semibold outline-none"
                  />
                  <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold">
                    CC / BCC
                  </button>
                </div>
              </div>

              {/* CC / BCC */}
              {showCcBcc && (
                <div className="space-y-2 pl-1 border-l-2 border-indigo-100">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">CC</label>
                    <input
                      type="text"
                      value={ccEmail}
                      onChange={(e) => setCcEmail(e.target.value)}
                      placeholder="cc@company.com (comma separated)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">BCC</label>
                    <input
                      type="text"
                      value={bccEmail}
                      onChange={(e) => setBccEmail(e.target.value)}
                      placeholder="bcc@company.com (comma separated)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:border-indigo-500"
                />
              </div>

              {/* Attached PDF */}
              {activeQuotation && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-900 text-xs">{activeQuotation.quotationNumber}_Quotation.pdf</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full">Auto-Attached</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">📡 Pixel Tracking ON</span>
                  </div>
                </div>
              )}

              {/* Body */}
              <div>
                <label className="block font-bold text-slate-600 mb-1 uppercase tracking-wider text-[10px]">Email Body</label>
                <textarea
                  rows={12}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-mono text-[11px] outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <p className="text-[10px] text-slate-400">
                  A <span className="font-bold text-indigo-600">1×1 tracking pixel</span> will be embedded to monitor opens & clicks.
                </p>
                <button
                  onClick={handleSend}
                  disabled={isSending || !toEmail.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending & Embedding Pixel...' : 'Send Email'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compose tips */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">📡 Pixel Tracking Active</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every sent email embeds an invisible 1×1 tracking pixel. You'll receive real-time notifications when the recipient:
              </p>
              <div className="space-y-2">
                {[
                  { icon: '👁️', label: 'Opens the email', color: 'text-amber-400' },
                  { icon: '🖱️', label: 'Clicks the PDF link', color: 'text-emerald-400' },
                  { icon: '📍', label: 'Geographic location', color: 'text-indigo-400' },
                  { icon: '📱', label: 'Device & OS info', color: 'text-blue-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center space-x-2 p-2 bg-slate-800 rounded-xl">
                    <span>{item.icon}</span>
                    <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">📬 Email Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Sent</span>
                  <span className="text-xl font-bold text-slate-900">{totalSent}</span>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-600 block uppercase">Open Rate</span>
                  <span className="text-xl font-bold text-amber-700">{openRate}%</span>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">Opened</span>
                  <span className="text-xl font-bold text-emerald-700">{totalOpened}</span>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-600 block uppercase">Clicked</span>
                  <span className="text-xl font-bold text-indigo-700">{totalClicked}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SENT & PIXEL TRACKING TAB ────────────────────────── */}
      {activeTab === 'sent' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sent Emails List */}
          <div className="lg:col-span-5 space-y-3">
            {/* Analytics Bar */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Sent</span>
                <span className="text-2xl font-bold text-white">{totalSent}</span>
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Opened</span>
                <span className="text-2xl font-bold text-amber-400">{totalOpened}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Clicked</span>
                <span className="text-2xl font-bold text-emerald-400">{totalClicked}</span>
              </div>
            </div>

            {/* Open Rate Progress */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Email Open Rate</span>
                <span className="text-xs font-bold text-indigo-700">{openRate}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${openRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400">Industry avg: 28%</span>
                <span className={`text-[10px] font-bold ${openRate >= 28 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {openRate >= 28 ? '▲ Above Average' : '▼ Below Average'}
                </span>
              </div>
            </div>

            {/* Sent Email Cards */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Sent Email Logs</h4>
              </div>
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                {emailLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <Send className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No emails sent yet. Use the Compose tab to send your first email.
                  </div>
                ) : (
                  emailLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedTrackingLog(log)}
                      className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTrackingLog?.id === log.id ? 'bg-indigo-50 border-l-2 border-indigo-600' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600">{log.quotationNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === 'Clicked' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'Opened' ? 'bg-amber-100 text-amber-800' :
                          log.status === 'Delivered' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {log.status === 'Clicked' ? '🖱️ Clicked' : log.status === 'Opened' ? '👁️ Opened' : log.status === 'Delivered' ? '✉️ Delivered' : '📤 Sent'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 truncate">{log.customerName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{log.customerEmail}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] text-slate-400">{new Date(log.sentAt).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] font-mono text-indigo-400">{log.trackingPixelId}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pixel Tracking Detail */}
          <div className="lg:col-span-7 space-y-4">
            {selectedTrackingLog ? (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">📡 Pixel Tracking Report</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{selectedTrackingLog.subject}</p>
                    </div>
                    <button onClick={() => setSelectedTrackingLog(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Pixel ID', value: selectedTrackingLog.trackingPixelId, color: 'text-indigo-700 bg-indigo-50', icon: Activity },
                      { label: 'Status', value: selectedTrackingLog.status, color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle2 },
                      { label: 'Open Count', value: String(selectedTrackingLog.openCount ?? 0), color: 'text-amber-700 bg-amber-50', icon: Eye },
                      { label: 'Click Count', value: String(selectedTrackingLog.clickCount ?? 0), color: 'text-rose-700 bg-rose-50', icon: MousePointerClick },
                    ].map((item) => (
                      <div key={item.label} className={`p-3 rounded-xl ${item.color} border border-current/10`}>
                        <item.icon className="w-4 h-4 mb-1 opacity-70" />
                        <span className="text-[10px] font-bold uppercase block opacity-70">{item.label}</span>
                        <span className="text-xs font-bold break-all">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Email details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl">
                      <AtSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-600 w-12">To:</span>
                      <span className="text-slate-800 font-semibold">{selectedTrackingLog.customerEmail}</span>
                    </div>
                    {selectedTrackingLog.cc && (
                      <div className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl">
                        <AtSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-600 w-12">CC:</span>
                        <span className="text-slate-800">{selectedTrackingLog.cc}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 p-2.5 bg-slate-50 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-600 w-12">Sent:</span>
                      <span className="text-slate-800">{new Date(selectedTrackingLog.sentAt).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedTrackingLog.attachmentName && (
                      <div className="flex items-center space-x-2 p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold text-indigo-700">{selectedTrackingLog.attachmentName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pixel Events Timeline */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pixel Event Timeline</span>
                  </h4>

                  {(selectedTrackingLog.pixelEvents?.length ?? 0) === 0 ? (
                    <div className="text-center py-6">
                      <Eye className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400 font-medium">No pixel events recorded yet.</p>
                      <p className="text-[11px] text-slate-400">Events will appear when recipient opens or clicks the email.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedTrackingLog.pixelEvents || generateMockPixelEvents()).map((ev, idx) => (
                        <div key={idx} className={`flex items-start space-x-3 p-3 rounded-xl border ${ev.eventType === 'click' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${ev.eventType === 'click' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                            {ev.eventType === 'click' ? '🖱️' : '👁️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${ev.eventType === 'click' ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {ev.eventType === 'click' ? 'PDF Link Clicked' : 'Email Opened'}
                              </span>
                              <span className="text-[10px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString('en-IN')}</span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[10px] text-slate-600 flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{ev.city} · {ev.ipAddress}</span>
                              </span>
                              <span className="text-[10px] text-slate-600 flex items-center space-x-1">
                                {ev.device === 'Mobile' ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                                <span>{ev.device} · {ev.os}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white h-full min-h-[400px] rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center p-10">
                <BarChart2 className="w-12 h-12 text-slate-200 mb-3" />
                <p className="font-bold text-sm text-slate-700">Select an email to view pixel tracking</p>
                <p className="text-xs text-slate-400 mt-1">Click any sent email on the left to view its detailed pixel event timeline, open count, device, and geo-location data.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
