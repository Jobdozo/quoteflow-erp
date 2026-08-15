import React, { useState } from 'react';
import { MessageSquare, Send, Upload, Check, CheckCheck, Smartphone, ExternalLink, Sparkles } from 'lucide-react';
import { Quotation, CompanySettings } from '../../types';

interface WhatsAppCenterViewProps {
  quotations: Quotation[];
  settings: CompanySettings;
  selectedQuotationForWA?: Quotation | null;
}

export const WhatsAppCenterView: React.FC<WhatsAppCenterViewProps> = ({
  quotations,
  settings,
  selectedQuotationForWA,
}) => {
  const defaultQuote = selectedQuotationForWA || quotations[0];

  const [activeQuotation, setActiveQuotation] = useState<Quotation>(defaultQuote);
  const [mobileNumber, setMobileNumber] = useState(defaultQuote?.customerMobile || '9876543210');
  const [customerName, setCustomerName] = useState(defaultQuote?.customerName || 'Amit Ji');
  const [message, setMessage] = useState(
    `Dear ${defaultQuote?.customerName || 'Amit Ji'},\n\nThank you for your interest in our services.\n\nPlease find attached our quotation #${defaultQuote?.quotationNumber || 'Q-2026-125'} for ${defaultQuote?.companyName || 'VMart Retail Ltd.'}.\nTotal Value: ₹${(defaultQuote?.grandTotal || 125000).toLocaleString('en-IN')}.\n\nView & Download PDF:\nhttps://${window.location.host}/?verify=${defaultQuote?.id || 'TEST'}\n\nRegards,\n${settings.companyName}\n\n☎ ${settings.phone}\nEmail: ${settings.email}`
  );
  const [statusLog, setStatusLog] = useState<string>('Ready to dispatch');
  
  // Media payload states
  const [sendAsMedia, setSendAsMedia] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('https://i.pravatar.cc');
  const [filename, setFilename] = useState('file_test.pdf');

  const handleSelectQuotation = (q: Quotation) => {
    setActiveQuotation(q);
    setMobileNumber(q.customerMobile);
    setCustomerName(q.customerName);
    setMessage(
      `Dear ${q.customerName},\n\nThank you for your interest in our services.\n\nPlease find attached our quotation #${q.quotationNumber} for ${q.companyName}.\nTotal Value: ₹${q.grandTotal.toLocaleString('en-IN')}.\n\nView & Download PDF:\nhttps://${window.location.host}/?verify=${q.id}\n\nRegards,\n${settings.companyName}\n\n☎ ${settings.phone}\nEmail: ${settings.email}`
    );
  };

  const handleLaunchWhatsApp = async () => {
    const cleanNumber = mobileNumber.replace(/[^0-9]/g, '');
    const fullNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    
    setStatusLog('Dispatching message via API...');

    try {
      // Build Waziper/Saasyto API endpoint and parameters
      const response = await fetch('https://web.saasyto.com/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: fullNumber,
          type: sendAsMedia ? 'media' : 'text',
          message: message,
          ...(sendAsMedia && {
            media_url: mediaUrl,
            filename: filename,
          }),
          instance_id: '6A7C58B9D44FC',
          access_token: '6a7c58a4d5560',
        }),
      });

      if (response.ok) {
        setStatusLog(`Delivered via Saasyto API to +${fullNumber} at ${new Date().toLocaleTimeString()}`);
      } else {
        const errorData = await response.text();
        setStatusLog(`Failed: API returned status ${response.status}`);
        console.error('WhatsApp API Error:', errorData);
      }
    } catch (error: any) {
      setStatusLog(`Error: ${error.message}`);
      console.error('WhatsApp API Exception:', error);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Center</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">
              API Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            One-Click PDF generation, upload, and direct WhatsApp messaging to client.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Composer & Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Select Quotation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700">Select Target Quotation</label>
            <select
              value={activeQuotation?.id}
              onChange={(e) => {
                const found = quotations.find((q) => q.id === e.target.value);
                if (found) handleSelectQuotation(found);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotationNumber} - {q.companyName} (₹{q.grandTotal.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Message Builder */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              WhatsApp Message Template
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Mobile</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attached PDF File</label>
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 font-semibold text-xs truncate">
                  <Upload className="w-4 h-4 shrink-0" />
                  <span className="truncate">{activeQuotation?.quotationNumber}_Quote.pdf</span>
                </div>
              </div>
            </div>

            {/* Media Attachment Options */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendAsMedia"
                  checked={sendAsMedia}
                  onChange={(e) => setSendAsMedia(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="sendAsMedia" className="text-xs font-bold text-slate-700">
                  Send as Media / Document (API requires public URL)
                </label>
              </div>

              {sendAsMedia && (
                <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Media URL</label>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Filename</label>
                    <input
                      type="text"
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-emerald-500"
                      placeholder="file_test.pdf"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Text</label>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-emerald-500 resize-none leading-relaxed font-mono"
              />
            </div>

            <button
              onClick={handleLaunchWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Document & Message via API</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center font-medium">
              Status: <span className="text-emerald-600 font-bold">{statusLog}</span>
            </p>
          </div>
        </div>

        {/* Right 5 Cols: WhatsApp Chat Simulator Preview */}
        <div className="lg:col-span-5">
          <div className="bg-[#0b141a] rounded-3xl p-4 shadow-2xl border border-slate-800 text-white max-w-sm mx-auto space-y-3 relative overflow-hidden">
            {/* Phone Header */}
            <div className="bg-[#202c33] p-3 rounded-2xl flex items-center space-x-3 border-b border-slate-700">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {activeQuotation?.companyName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs text-slate-100">{activeQuotation?.customerName}</h4>
                <span className="text-[10px] text-emerald-400 font-medium">Online • +91 {mobileNumber}</span>
              </div>
            </div>

            {/* Chat Bubble Area */}
            <div
              className="min-h-[380px] p-3 rounded-2xl bg-cover bg-center space-y-3 flex flex-col justify-end"
              style={{
                backgroundImage: `radial-gradient(#1f2c34 1px, transparent 0)`,
                backgroundSize: '16px 16px',
              }}
            >
              {/* Sent Message Bubble */}
              <div className="self-end bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] space-y-2 text-xs shadow-md">
                {/* PDF Attachment Box */}
                <div className="bg-[#025143] p-2.5 rounded-xl flex items-center space-x-2 border border-emerald-400/30">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                    PDF
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-[11px] truncate">{activeQuotation?.quotationNumber}.pdf</p>
                    <span className="text-[9px] text-emerald-200">1.2 MB • Official Quotation</span>
                  </div>
                </div>

                <p className="whitespace-pre-line text-[11px] leading-relaxed">{message}</p>

                <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-200 pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
