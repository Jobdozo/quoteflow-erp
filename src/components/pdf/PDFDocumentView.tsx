import React, { useRef, useState } from 'react';
import { Download, Printer, Shield, X, FileText, Check } from 'lucide-react';
import type { Quotation, CompanySettings } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFDocumentViewProps {
  quotation: Quotation;
  settings: CompanySettings;
  onClose: () => void;
}

export const PDFDocumentView: React.FC<PDFDocumentViewProps> = ({
  quotation,
  settings,
  onClose,
}) => {
  const documentRef = useRef<HTMLDivElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeCoverPage, setIncludeCoverPage] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsGenerating(true);

    try {
      const element = documentRef.current;
      const pages = element.querySelectorAll<HTMLElement>('.a4-page');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${quotation.quotationNumber}_${quotation.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617]/85 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto font-sans">
      {/* Top Floating Control Bar */}
      <div className="w-full bg-[#0f172a] border-b border-[#334155] text-white p-3.5 sticky top-0 z-50 shadow-2xl flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center space-x-3">
          <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
            <img
              src={settings.logoUrl || "/zipcon_logo.png"}
              alt={settings.companyName || "Company Logo"}
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>{quotation.quotationNumber}</span>
              <span className="text-xs text-[#818cf8] font-semibold">• {quotation.companyName}</span>
            </h3>
            <p className="text-[11px] text-[#94a3b8]">Official Zipcon™ Commercial Quotation PDF</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-3">
          <label className="flex items-center space-x-2 bg-[#1e293b] hover:bg-[#334155] px-3 py-1.5 rounded-xl cursor-pointer text-xs font-semibold text-slate-200 border border-[#334155] transition-colors">
            <input
              type="checkbox"
              checked={includeCoverPage}
              onChange={(e) => setIncludeCoverPage(e.target.checked)}
              className="rounded text-[#4f46e5] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Include Cover Page</span>
          </label>

          {/* Zoom Selector */}
          <div className="hidden sm:flex items-center bg-[#1e293b] border border-[#334155] rounded-xl px-2 py-1 text-xs font-medium text-slate-300">
            <button
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
              className="px-1.5 py-0.5 hover:text-white font-bold"
            >
              -
            </button>
            <span className="px-2 font-mono">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
              className="px-1.5 py-0.5 hover:text-white font-bold"
            >
              +
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-xl border border-[#334155] flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#94a3b8]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-5 py-1.5 text-xs font-bold bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Pages Container */}
      <div
        ref={documentRef}
        id="printable-pdf"
        className="w-full flex flex-col items-center py-8 px-4 sm:px-6 space-y-8"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
      >
        {/* Optional Cover Page */}
        {includeCoverPage && (
          <div className="a4-page w-[210mm] min-h-[297mm] bg-white text-[#0f172a] shadow-2xl border border-[#e2e8f0] p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#0B192C]" />

            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-6 mt-2">
              <div className="flex items-center space-x-4">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={settings.logoUrl || "/zipcon_logo.png"}
                    alt={settings.companyName || "Company Logo"}
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#0f172a] tracking-tight">{settings.companyName}</h1>
                  <p className="text-xs text-[#4f46e5] font-bold tracking-wide mt-0.5">{settings.tagline}</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-[#0B192C] text-white font-black text-xs rounded-full uppercase tracking-widest">
                CORPORATE PROPOSAL
              </span>
            </div>

            <div className="my-auto py-12 space-y-6">
              <span className="inline-block px-4 py-1.5 bg-[#e0e7ff] text-[#3730a3] text-xs font-extrabold rounded-full uppercase tracking-wider border border-[#c7d2fe]">
                OFFICIAL COMMERCIAL COST-SHEET
              </span>
              <h2 className="text-4xl font-black text-[#0f172a] leading-tight tracking-tight max-w-xl">
                Commercial Security & Integrated Facility Services
              </h2>
              <p className="text-xs text-[#475569] max-w-lg leading-relaxed font-medium">
                Comprehensive operational scope, statutory wage compliance framework, and manpower rate card prepared exclusively for{' '}
                <strong className="text-[#0f172a] font-bold">{quotation.companyName}</strong>.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-6 border-t border-[#e2e8f0] max-w-md">
                <div>
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">PREPARED FOR</span>
                  <p className="text-sm font-bold text-[#0f172a]">{quotation.customerName}</p>
                  <p className="text-xs font-semibold text-[#334155]">{quotation.companyName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider block mb-1">QUOTATION REF</span>
                  <p className="text-sm font-bold text-[#4f46e5]">{quotation.quotationNumber}</p>
                  <p className="text-xs text-[#64748b]">Date: {quotation.date}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e2e8f0] pt-4 flex justify-between items-center text-xs text-[#64748b]">
              <span className="font-semibold">Tollfree: {settings.phone} • {settings.email}</span>
              <span className="font-bold text-[#0f172a]">{settings.website}</span>
            </div>
          </div>
        )}

        {/* ULTRA-PREMIUM SINGLE A4 CORPORATE QUOTATION WITH OFFICIAL ZIPCON LOGO */}
        <div className="a4-page w-[210mm] h-[297mm] max-h-[297mm] bg-white text-[#0f172a] shadow-2xl border border-[#cbd5e1] p-8 flex flex-col justify-between relative overflow-hidden box-border">
          {/* Top Corporate Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-[#0B192C]" />

          <div>
            {/* EXECUTIVE HEADER WITH OFFICIAL ZIPCON LOGO */}
            <div className="flex justify-between items-start border-b border-[#cbd5e1] pb-3 mb-3 mt-1">
              <div className="flex items-center space-x-3.5">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={settings.logoUrl || "/zipcon_logo.png"}
                    alt={settings.companyName || "Company Logo"}
                    className="h-12 max-w-[170px] object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#0f172a] tracking-tight leading-none">
                    {settings.companyName}
                  </h2>
                  <p className="text-[9px] text-[#4f46e5] font-bold tracking-wide mt-0.5">{settings.tagline}</p>
                  <p className="text-[9px] text-[#64748b] mt-0.5 leading-tight">{settings.address}</p>
                  <p className="text-[9px] text-[#334155] font-semibold">
                    GSTIN: <strong className="text-[#0f172a]">{settings.gstNumber}</strong> | Tollfree: {settings.phone} | Email: {settings.email}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-[#0B192C] text-white font-black text-[10px] rounded uppercase tracking-wider shadow">
                  OFFICIAL QUOTATION
                </span>
                <h3 className="text-sm font-black text-[#1e1b4b] mt-1 font-mono">{quotation.quotationNumber}</h3>
                <p className="text-[9px] text-[#64748b] font-medium">Issue Date: <strong>{quotation.date}</strong></p>
                <p className="text-[9px] text-[#64748b] font-medium">Valid Until: <strong>{quotation.validUntil}</strong></p>
              </div>
            </div>

            {/* CLIENT & SERVICE LOCATION CARD */}
            <div className="grid grid-cols-2 gap-3 bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0] mb-3 text-[11px]">
              <div className="border-r border-[#cbd5e1] pr-2">
                <span className="font-extrabold text-[9px] text-[#1e1b4b] uppercase tracking-wider block mb-0.5">
                  CLIENT DETAILS (PREPARED FOR)
                </span>
                <p className="font-extrabold text-[#0f172a] text-xs">{quotation.customerName}</p>
                <p className="font-bold text-[#4338ca]">{quotation.companyName}</p>
                {quotation.customerGst && (
                  <p className="text-[#475569] text-[10px]">GSTIN: <strong>{quotation.customerGst}</strong></p>
                )}
                <p className="text-[#64748b] text-[10px]">Mobile: {quotation.customerMobile} | Email: {quotation.customerEmail}</p>
              </div>

              <div className="pl-1">
                <span className="font-extrabold text-[9px] text-[#1e1b4b] uppercase tracking-wider block mb-0.5">
                  SERVICE LOCATION & PROPOSAL METADATA
                </span>
                <p className="text-[#334155] text-[10px] leading-tight font-medium">
                  {quotation.customerAddress || quotation.companyName}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#d1fae5] text-[#065f46] font-extrabold rounded text-[9px] border border-[#a7f3d0]">
                    STATUS: {quotation.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-bold text-[#64748b]">Prepared By: {quotation.createdBy}</span>
                </div>
              </div>
            </div>

            {/* EXECUTIVE COST SHEET LINE ITEMS TABLE */}
            <div className="mb-3 overflow-hidden rounded-lg border border-[#cbd5e1] shadow-sm">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-[#0B192C] text-white font-extrabold tracking-wider uppercase">
                    <th className="py-1.5 px-2.5 border-r border-[#334155] w-8 text-center">#</th>
                    <th className="py-1.5 px-2.5 border-r border-[#334155]">SERVICE & SCOPE DESCRIPTION</th>
                    <th className="py-1.5 px-2 text-center border-r border-[#334155] w-12">UNIT</th>
                    <th className="py-1.5 px-2 text-center border-r border-[#334155] w-10">QTY</th>
                    <th className="py-1.5 px-2.5 text-right border-r border-[#334155] w-20">RATE (₹)</th>
                    <th className="py-1.5 px-2 text-center border-r border-[#334155] w-12">DISC %</th>
                    <th className="py-1.5 px-2 text-center border-r border-[#334155] w-12">GST %</th>
                    <th className="py-1.5 px-2.5 text-right w-24">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-[10px]">
                  {quotation.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-[#f1f5f9] transition-colors">
                      <td className="py-1.5 px-2.5 text-center font-bold text-[#64748b] border-r border-[#e2e8f0]">{idx + 1}</td>
                      <td className="py-1.5 px-2.5 border-r border-[#e2e8f0]">
                        <p className="font-extrabold text-[#0f172a]">{item.name}</p>
                        <p className="text-[#64748b] text-[9px] leading-tight">{item.description}</p>
                      </td>
                      <td className="py-1.5 px-2 text-center font-semibold text-[#334155] border-r border-[#e2e8f0]">{item.unit}</td>
                      <td className="py-1.5 px-2 text-center font-black text-[#0f172a] border-r border-[#e2e8f0]">{item.quantity}</td>
                      <td className="py-1.5 px-2.5 text-right font-semibold text-[#1e293b] border-r border-[#e2e8f0]">₹ {item.rate.toLocaleString('en-IN')}</td>
                      <td className="py-1.5 px-2 text-center text-[#475569] border-r border-[#e2e8f0]">{item.discount}%</td>
                      <td className="py-1.5 px-2 text-center text-[#475569] border-r border-[#e2e8f0]">{item.gstRate}%</td>
                      <td className="py-1.5 px-2.5 text-right font-black text-[#0f172a] font-mono">
                        ₹ {item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TERMS & FINANCIAL BREAKDOWN SPLIT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Left Column: Key Contractual Terms */}
              <div className="bg-[#f8fafc] p-2.5 rounded-lg border border-[#e2e8f0] space-y-1">
                <h4 className="font-extrabold text-[9px] text-[#0B192C] uppercase tracking-wider border-b border-[#cbd5e1] pb-0.5">
                  KEY TERMS & STATUTORY COMPLIANCE
                </h4>
                <div className="max-h-28 overflow-y-auto space-y-0.5 pr-1 text-[9px] text-[#334155] font-medium leading-tight">
                  {quotation.terms.slice(0, 6).map((term, tIdx) => (
                    <div key={tIdx} className="flex items-start space-x-1">
                      <span className="text-[#4f46e5] font-bold shrink-0">✓</span>
                      <p>{term}</p>
                    </div>
                  ))}
                  {quotation.terms.length > 6 && (
                    <p className="text-[8px] text-[#64748b] italic pt-0.5">+ {quotation.terms.length - 6} additional statutory terms apply as per agreement.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Financial Calculation Box */}
              <div className="bg-[#0B192C] text-white p-3 rounded-lg border border-[#1e1b4b] shadow-md space-y-1 text-[10px]">
                <div className="flex justify-between text-[#cbd5e1]">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-semibold">₹ {quotation.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {quotation.totalDiscount > 0 && (
                  <div className="flex justify-between text-[#34d399] font-semibold">
                    <span>Discount Allowed:</span>
                    <span className="font-mono">- ₹ {quotation.totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#cbd5e1]">
                  <span>GST Liability (18% Slab):</span>
                  <span className="font-mono font-semibold">₹ {quotation.totalGst.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-[#334155] pt-1.5 flex justify-between items-center">
                  <span className="font-black text-xs text-white">NET AMOUNT PAYABLE:</span>
                  <span className="text-base font-black text-[#818cf8] font-mono">
                    ₹ {quotation.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* BANK DETAILS & PAYMENT QR CODE CARD */}
            <div className="grid grid-cols-2 gap-3 p-2.5 bg-[#e0e7ff]/40 rounded-lg border border-[#c7d2fe] text-[9px]">
              <div>
                <h4 className="font-extrabold text-[#1e1b4b] uppercase tracking-wider mb-0.5">BANK NEFT / RTGS TRANSFER DETAILS</h4>
                <p className="text-[#1e293b]">Bank Name: <strong>{settings.bankName}</strong></p>
                <p className="text-[#1e293b]">Account No: <strong className="font-mono">{settings.accountNumber}</strong> | IFSC: <strong className="font-mono">{settings.ifscCode}</strong></p>
                <p className="text-[#475569]">Branch: {settings.branchName}</p>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <div className="text-right">
                  <span className="font-bold text-[#0f172a] block text-[9px]">SCAN TO PAY / VERIFY</span>
                  <span className="text-[8px] text-[#64748b]">Instant UPI Direct Deposit</span>
                </div>
                <div className="w-11 h-11 bg-white p-1 rounded border border-[#cbd5e1] flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=UPI://${settings.accountNumber}@hdfcbank`}
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL CORPORATE FOOTER WITH SIGNATURE & STAMP */}
          <div className="flex justify-between items-end border-t border-[#cbd5e1] pt-2.5 mt-auto text-[9px]">
            <div className="text-[#64748b] space-y-0.5">
              <div className="flex items-center space-x-1 text-[#047857] font-extrabold">
                <Shield className="w-3.5 h-3.5 text-[#059669]" />
                <span>Verified Official Document • ISO 9001:2015 Certified</span>
              </div>
              <p>Generated via Zipcon QuoteFlow Corporate CRM System</p>
              <p className="text-[8px] text-[#94a3b8]">Regd. Office: {settings.address}</p>
            </div>

            <div className="text-center relative min-w-[160px]">
              {settings.companyStampUrl ? (
                <img
                  src={settings.companyStampUrl}
                  alt="Company Stamp"
                  className="absolute -top-7 left-1/2 -translate-x-1/2 h-14 w-14 object-contain opacity-80 pointer-events-none transform -rotate-12"
                />
              ) : quotation.hasCompanyStamp ? (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-[#4338ca]/50 text-[#4338ca]/60 flex items-center justify-center font-black text-[8px] uppercase tracking-wider transform -rotate-12 pointer-events-none">
                  OFFICIAL SEAL
                </div>
              ) : null}

              {(quotation.digitalSignature || settings.digitalSignatureUrl) ? (
                <img
                  src={quotation.digitalSignature || settings.digitalSignatureUrl}
                  alt="Signature"
                  className="h-9 mx-auto object-contain mb-0.5"
                />
              ) : (
                <div className="h-9 font-serif italic text-[#1e293b] text-xs flex items-center justify-center font-bold">
                  Authorized Signatory
                </div>
              )}
              <div className="border-t border-[#0f172a] pt-0.5">
                <p className="text-[10px] font-black text-[#0f172a]">For {settings.companyName}</p>
                <p className="text-[8px] text-[#64748b] font-semibold">Authorized Signature & Stamp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
