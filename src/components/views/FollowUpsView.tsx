import React, { useState } from 'react';
import { Clock, Phone, MessageSquare, Mail, Calendar, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { FollowUp, Customer, CompanySettings } from '../../types';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  customers: Customer[];
  settings: CompanySettings;
  onSaveFollowUp: (followUp: FollowUp) => void;
  onDeleteFollowUp: (id: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  customers,
  settings,
  onSaveFollowUp,
  onDeleteFollowUp,
}) => {
  const [filter, setFilter] = useState<'All' | 'Overdue' | 'Pending' | 'Completed'>('All');
  const [showModal, setShowModal] = useState(false);

  // Modal Form State
  const [quotationNumber, setQuotationNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<FollowUp['type']>('Call');
  const [reminderStage, setReminderStage] = useState<FollowUp['reminderStage']>('2 Days');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [template, setTemplate] = useState('Custom');
  
  // API State
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const predefinedTemplates = {
    'Custom': '',
    'Pending Bill': 'Follow-up for pending bill payment.',
    'Quotation Update': 'Quotation related update.',
    'Monthly Feedback': 'Monthly one feedback follow-up for company record.'
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as keyof typeof predefinedTemplates;
    setTemplate(val);
    if (val !== 'Custom') {
      setNotes(predefinedTemplates[val]);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cName = e.target.value;
    setCompanyName(cName);
    const selectedCustomer = customers.find(c => c.companyName === cName);
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.name);
      setCustomerMobile(selectedCustomer.mobile);
    }
  };

  const filteredFollowUps = followUps.filter((f) => filter === 'All' || f.status === filter);

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newFu: FollowUp = {
      id: `fu-${Date.now()}`,
      quotationId: '',
      quotationNumber: quotationNumber || 'N/A',
      customerName: customerName || 'N/A',
      companyName,
      scheduledDate,
      type,
      status: 'Pending',
      reminderStage,
      notes,
      amount: Number(amount),
    };
    onSaveFollowUp(newFu);
    setShowModal(false);
  };

  const markCompleted = (fu: FollowUp) => {
    onSaveFollowUp({ ...fu, status: 'Completed' });
  };

  const handleSendWhatsApp = async (fu: FollowUp) => {
    // Find customer to get the mobile number
    const targetCustomer = customers.find(c => c.companyName === fu.companyName);
    const mobileNum = targetCustomer?.mobile;
    if (!mobileNum) {
      alert("No mobile number found for this customer.");
      return;
    }
    
    setDispatchingId(fu.id);
    const cleanNumber = mobileNum.replace(/[^0-9]/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    const message = `Dear ${fu.customerName},\n\n${fu.notes}\n\nRegards,\n${settings.companyName}`;

    try {
      const apiUrl = 'https://web.saasyto.com/api/send';
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`;

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: fullNumber,
          type: 'text',
          message: message,
          instance_id: '6A7C58B9D44FC',
          access_token: '6a7c58a4d5560',
        }),
      });

      if (response.ok) {
        alert("WhatsApp message sent successfully via Saasyto API!");
        markCompleted(fu);
      } else {
        alert("Failed to send WhatsApp message.");
      }
    } catch (e) {
      console.error(e);
      alert("Error dispatching API request.");
    } finally {
      setDispatchingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Follow-up CRM Pipeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated reminder cadence: 2-Day Call → 5-Day WhatsApp → 7-Day Email → 15-Day Close/Won.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow Up Task</span>
        </button>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AUTOMATIC CRM FOLLOW-UP STAGES</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">STAGE 1</span>
            <p className="text-xs font-bold text-white mt-1">Quotation Sent</p>
            <span className="text-[10px] text-indigo-400 font-medium">Day 0</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-amber-500/40">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">STAGE 2</span>
            <p className="text-xs font-bold text-white mt-1">Call Reminder</p>
            <span className="text-[10px] text-amber-400 font-medium">+2 Days</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-emerald-500/40">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">STAGE 3</span>
            <p className="text-xs font-bold text-white mt-1">WhatsApp Reminder</p>
            <span className="text-[10px] text-emerald-400 font-medium">+5 Days</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-blue-500/40">
            <span className="text-[10px] text-blue-400 font-bold uppercase block">STAGE 4</span>
            <p className="text-xs font-bold text-white mt-1">Email Reminder</p>
            <span className="text-[10px] text-blue-400 font-medium">+7 Days</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-purple-500/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-purple-400 font-bold uppercase block">STAGE 5</span>
            <p className="text-xs font-bold text-white mt-1">Close or Won</p>
            <span className="text-[10px] text-purple-400 font-medium">+15 Days</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2">
        {(['All', 'Overdue', 'Pending', 'Completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === st
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Follow ups Cards */}
      <div className="space-y-4">
        {filteredFollowUps.map((fu) => (
          <div
            key={fu.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                  fu.type === 'Call'
                    ? 'bg-amber-50 text-amber-600'
                    : fu.type === 'WhatsApp'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {fu.type === 'Call' ? (
                  <Phone className="w-6 h-6" />
                ) : fu.type === 'WhatsApp' ? (
                  <MessageSquare className="w-6 h-6" />
                ) : (
                  <Mail className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">{fu.companyName}</h3>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    #{fu.quotationNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contact: <strong className="text-slate-800">{fu.customerName}</strong> | Value:{' '}
                  <strong className="text-slate-900">₹{fu.amount.toLocaleString('en-IN')}</strong>
                </p>
                <p className="text-xs text-slate-600 mt-1 italic">"{fu.notes}"</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full block ${
                    fu.status === 'Overdue'
                      ? 'bg-rose-100 text-rose-700'
                      : fu.status === 'Completed'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {fu.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-medium">Due: {fu.scheduledDate}</span>
              </div>

              {fu.status !== 'Completed' && (
                <div className="flex items-center space-x-2">
                  {fu.type === 'WhatsApp' && (
                    <button
                      onClick={() => handleSendWhatsApp(fu)}
                      disabled={dispatchingId === fu.id}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{dispatchingId === fu.id ? 'Sending...' : '1-Click Send'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => markCompleted(fu)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Follow Up Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule Follow-up Task</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                  <select
                    required
                    value={companyName}
                    onChange={handleCompanyChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="" disabled>Select Registered Company</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.companyName}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation No.</label>
                  <input
                    type="text"
                    required
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Action Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CRM Stage</label>
                  <select
                    value={reminderStage}
                    onChange={(e) => setReminderStage(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="2 Days">Day 2 (Call)</option>
                    <option value="5 Days">Day 5 (WhatsApp)</option>
                    <option value="7 Days">Day 7 (Email)</option>
                    <option value="15 Days">Day 15 (Close)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Notes / Message</label>
                <textarea
                  required
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record customer comments or write your message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
