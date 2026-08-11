import React, { useState } from 'react';
import { Download, Printer, ArrowLeft, Send, Shield, Sparkles, Building, Mail, Phone, MapPin } from 'lucide-react';
import type { Quotation, CompanySettings } from '../../types';

interface PDFDocumentViewProps {
  quotation: Quotation;
  settings: CompanySettings;
  onBack?: () => void;
  onClose?: () => void;
  onSendWhatsApp?: (quotation: Quotation) => void;
  onSendEmail?: (quotation: Quotation) => void;
}

export const PDFDocumentView: React.FC<PDFDocumentViewProps> = ({
  quotation,
  settings,
  onBack,
  onClose,
  onSendWhatsApp,
  onSendEmail,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900/90 py-6 px-2 sm:px-6 flex flex-col items-center">
      {/* Control Action Toolbar */}
      <div className="no-print max-w-[210mm] w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center space-x-3">
          {(onBack || onClose) && (
            <button
              onClick={onBack || onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Close</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-100">
              PDF Document Viewer ({quotation.quotationNumber})
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSendEmail && (
            <button
              onClick={() => onSendEmail(quotation)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email PDF</span>
            </button>
          )}

          {onSendWhatsApp && (
            <button
              onClick={() => onSendWhatsApp(quotation)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* A4 PRINT CONTAINER */}
      <div className="print-area flex justify-center w-full">
        {/* EXECUTIVE PROJECT QUOTATION TEMPLATE (MATCHING APEX REFERENCE LAYOUT) */}
        <div className="a4-page w-[210mm] h-[297mm] max-h-[297mm] bg-white text-[#0f172a] shadow-2xl border border-[#cbd5e1] p-7 flex flex-col justify-between relative overflow-hidden box-border">
          
          {/* Top Corporate Dark Blue Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-3.5 bg-[#0B192C]" />

          {/* Faded Background Logo Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
            <img
              src={settings.logoUrl || "/zipcon_logo.png"}
              alt="Watermark"
              className="w-[380px] h-[380px] object-contain grayscale"
            />
          </div>

          <div>
            {/* 1. HEADER: Company Logo & Top Right Contact Info */}
            <div className="flex justify-between items-start border-b border-[#cbd5e1] pb-3 mb-3 mt-1">
              {/* Left Logo */}
              <div className="flex items-center space-x-3">
                <img
                  src={settings.logoUrl || "/zipcon_logo.png"}
                  alt={settings.companyName || "Company Logo"}
                  className="h-12 max-w-[180px] object-contain"
                />
                <div>
                  <h2 className="text-base font-black text-[#0B192C] tracking-tight leading-none uppercase">
                    {settings.companyName}
                  </h2>
                  <p className="text-[9px] text-[#4f46e5] font-bold tracking-wide mt-0.5">{settings.tagline}</p>
                </div>
              </div>

              {/* Right Address & Contact Header */}
              <div className="text-right text-[9px] text-[#334155] leading-tight space-y-0.5">
                <p className="font-extrabold text-[#0B192C] text-[10px]">{settings.companyName}</p>
                <p>{settings.address}</p>
                <p>GSTIN: <strong className="text-[#0f172a] font-mono">{settings.gstNumber}</strong></p>
                <p>Phone: {settings.phone} | Web: www.zipcon.in</p>
                <p>Email: {settings.email}</p>
              </div>
            </div>

            {/* 2. CENTERED BOLD TITLE */}
            <div className="text-center my-2">
              <h1 className="text-xl font-black text-[#0B192C] tracking-wider uppercase border-b-2 border-[#0B192C] inline-block pb-0.5 px-4">
                PROJECT QUOTATION
              </h1>
            </div>

            {/* 3. CLIENT DETAILS & QUOTATION METADATA SPLIT GRID */}
            <div className="flex justify-between items-start my-2 text-[10px] text-[#334155] border-b border-[#cbd5e1] pb-2">
              {/* Left: Client Details */}
              <div className="space-y-0.5">
                <p><strong className="text-[#0f172a] font-bold">To:</strong> {quotation.companyName}</p>
                <p><strong className="text-[#0f172a] font-bold">Attn:</strong> {quotation.customerName}</p>
                <p><strong className="text-[#0f172a] font-bold">Address:</strong> {quotation.customerAddress || `${quotation.companyName}, Main Site`}</p>
                <p><strong className="text-[#0f172a] font-bold">GSTIN:</strong> {quotation.customerGst || 'Unregistered / NA'}</p>
                <p><strong className="text-[#0f172a] font-bold">Contact:</strong> {quotation.customerMobile} | {quotation.customerEmail}</p>
              </div>

              {/* Right: Quotation Number & Date Info */}
              <div className="text-right space-y-0.5">
                <p className="text-xs font-black text-[#0B192C] font-mono">QUOTATION #{quotation.quotationNumber}</p>
                <p><strong className="text-[#0f172a]">Date:</strong> {quotation.date}</p>
                <p><strong className="text-[#0f172a]">Valid Until:</strong> {quotation.validUntil} ({quotation.validityDays} Days)</p>
                <p><strong className="text-[#0f172a]">Prepared By:</strong> {quotation.createdBy}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#d1fae5] text-[#065f46] font-extrabold rounded text-[8px] border border-[#a7f3d0]">
                  STATUS: {quotation.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* 4. LINE ITEMS TABLE (BOXED GRID MATCHING SAMPLE) */}
            <div className="my-3 overflow-hidden rounded-sm border border-[#0f172a]">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-[#f1f5f9] text-[#0B192C] font-black tracking-wider uppercase border-b border-[#0f172a]">
                    <th className="py-2 px-2 border-r border-[#0f172a] w-8 text-center">Line</th>
                    <th className="py-2 px-2.5 border-r border-[#0f172a]">Description (Item/Service)</th>
                    <th className="py-2 px-2 text-center border-r border-[#0f172a] w-12">Unit</th>
                    <th className="py-2 px-2.5 text-right border-r border-[#0f172a] w-20">Unit Price (₹)</th>
                    <th className="py-2 px-2 text-center border-r border-[#0f172a] w-10">Qty</th>
                    {quotation.adminChargesTotal && quotation.adminChargesTotal > 0 ? (
                      <th className="py-2 px-1.5 text-center border-r border-[#0f172a] w-12">Admin %</th>
                    ) : null}
                    <th className="py-2 px-1.5 text-center border-r border-[#0f172a] w-12">GST %</th>
                    <th className="py-2 px-2.5 text-right w-24">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cbd5e1] text-[10px]">
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-[#f8fafc]">
                      <td className="py-2 px-2 text-center font-bold text-[#475569] border-r border-[#cbd5e1]">{idx + 1}</td>
                      <td className="py-2 px-2.5 border-r border-[#cbd5e1]">
                        <p className="font-extrabold text-[#0f172a]">{item.name}</p>
                        <p className="text-[#64748b] text-[9px] leading-tight">{item.description}</p>
                      </td>
                      <td className="py-2 px-2 text-center font-semibold text-[#334155] border-r border-[#cbd5e1]">{item.unit}</td>
                      <td className="py-2 px-2.5 text-right font-semibold text-[#1e293b] border-r border-[#cbd5e1]">₹ {item.rate.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-2 text-center font-black text-[#0f172a] border-r border-[#cbd5e1]">{item.quantity}</td>
                      {quotation.adminChargesTotal && quotation.adminChargesTotal > 0 ? (
                        <td className="py-2 px-1.5 text-center text-[#475569] border-r border-[#cbd5e1]">{item.adminChargePercent || 0}%</td>
                      ) : null}
                      <td className="py-2 px-1.5 text-center text-[#475569] border-r border-[#cbd5e1]">{item.gstRate}%</td>
                      <td className="py-2 px-2.5 text-right font-black text-[#0f172a] font-mono">
                        ₹ {item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 5. TOTALS SUMMARY BLOCK (RIGHT ALIGNED BOX MATCHING SAMPLE) */}
            <div className="flex justify-end my-2">
              <div className="w-64 space-y-1 text-[10px] text-[#334155]">
                <div className="flex justify-between border-b border-slate-200 pb-0.5">
                  <span className="font-bold">Subtotal:</span>
                  <span className="font-mono font-semibold">₹ {quotation.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {quotation.adminChargesTotal && quotation.adminChargesTotal > 0 ? (
                  <div className="flex justify-between border-b border-slate-200 pb-0.5 text-[#b45309]">
                    <span className="font-bold">Admin Charges:</span>
                    <span className="font-mono">+ ₹ {quotation.adminChargesTotal.toLocaleString('en-IN')}</span>
                  </div>
                ) : null}

                {quotation.totalDiscount > 0 && (
                  <div className="flex justify-between border-b border-slate-200 pb-0.5 text-[#047857]">
                    <span className="font-bold">Discount Allowed:</span>
                    <span className="font-mono">- ₹ {quotation.totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between border-b border-slate-200 pb-0.5">
                  <span className="font-bold">Tax / GST (18%):</span>
                  <span className="font-mono font-semibold">₹ {quotation.totalGst.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between pt-1 border-t-2 border-b-2 border-[#0B192C] font-black text-xs text-[#0B192C]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-sm">₹ {quotation.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 6. TERMS & CONDITIONS (NUMBERED LIST MATCHING SAMPLE) */}
            <div className="my-2 text-[9.5px] text-[#334155] space-y-1">
              <h4 className="font-black text-[#0B192C] uppercase tracking-wider text-[10px] border-b border-[#cbd5e1] pb-0.5">
                Terms & Conditions
              </h4>
              <ol className="list-decimal list-inside space-y-0.5 font-medium leading-tight text-[#1e293b]">
                {quotation.terms.slice(0, 6).map((term, tIdx) => (
                  <li key={tIdx} className="pl-1">
                    <span>{term}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 7. BANK DETAILS & UPI NEFT QR CODE */}
            <div className="my-2 grid grid-cols-2 gap-2 p-2 bg-[#f8fafc] rounded border border-[#cbd5e1] text-[9px]">
              <div>
                <p className="font-extrabold text-[#0B192C] uppercase">BANK NEFT / RTGS DETAILS</p>
                <p>Bank: <strong>{settings.bankName}</strong> | Branch: {settings.branchName}</p>
                <p>A/C: <strong className="font-mono">{settings.accountNumber}</strong> | IFSC: <strong className="font-mono">{settings.ifscCode}</strong></p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <div className="text-right">
                  <p className="font-bold text-[#0B192C] text-[8.5px]">SCAN TO PAY / VERIFY</p>
                  <p className="text-[7.5px] text-[#64748b]">Instant Direct Transfer</p>
                </div>
                <div className="w-9 h-9 bg-white p-0.5 rounded border border-[#cbd5e1] flex items-center justify-center shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=UPI://${settings.accountNumber}@hdfcbank`}
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 8. ACCEPTED BY & DUAL SIGNATURE BLOCK (MATCHING APEX REFERENCE FOOTER) */}
          <div className="border-t border-[#0B192C] pt-2 mt-auto text-[9.5px]">
            <div className="flex justify-between items-end">
              {/* Left Accepted By Line */}
              <div className="space-y-1">
                <p className="text-[#334155]">
                  <strong>Accepted by:</strong> _______________________ | <strong>Date:</strong> ___________
                </p>
                <p className="text-[8px] text-[#64748b]">Client Authorization Signature & Seal</p>
              </div>

              {/* Right Zipcon Signature Block */}
              <div className="text-right relative min-w-[160px]">
                {settings.companyStampUrl ? (
                  <img
                    src={settings.companyStampUrl}
                    alt="Company Stamp"
                    className="absolute -top-6 right-4 h-12 w-12 object-contain opacity-80 pointer-events-none transform -rotate-12"
                  />
                ) : quotation.hasCompanyStamp ? (
                  <div className="absolute -top-6 right-4 w-14 h-14 rounded-full border-2 border-[#4338ca]/50 text-[#4338ca]/60 flex items-center justify-center font-black text-[7px] uppercase tracking-wider transform -rotate-12 pointer-events-none">
                    OFFICIAL SEAL
                  </div>
                ) : null}

                {(quotation.digitalSignature || settings.digitalSignatureUrl) ? (
                  <img
                    src={quotation.digitalSignature || settings.digitalSignatureUrl}
                    alt="Signature"
                    className="h-8 ml-auto object-contain mb-0.5"
                  />
                ) : (
                  <div className="h-8 font-serif italic text-[#1e293b] text-xs flex items-center justify-end font-bold pr-2">
                    Authorized Signatory
                  </div>
                )}
                <p className="font-extrabold text-[#0B192C] text-[10px]">For {settings.companyName}</p>
                <p className="text-[8px] text-[#64748b]">Authorized Signature & Stamp</p>
              </div>
            </div>
          </div>

          {/* Bottom Corporate Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0B192C]" />
        </div>
      </div>
    </div>
  );
};
