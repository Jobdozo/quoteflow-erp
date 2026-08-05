import React from 'react';
import { Download, FileText, TrendingUp, ShieldCheck, Printer } from 'lucide-react';
import type { MonthlyInvoice, CompanySettings } from '../../types';

interface GSTAccountingViewProps {
  invoices: MonthlyInvoice[];
  settings: CompanySettings;
}

export const GSTAccountingView: React.FC<GSTAccountingViewProps> = ({ invoices, settings }) => {
  const totalTaxable = invoices.reduce((sum, i) => sum + i.taxableAmount, 0);
  const totalCgst = invoices.reduce((sum, i) => sum + i.cgstAmount, 0);
  const totalSgst = invoices.reduce((sum, i) => sum + i.sgstAmount, 0);
  const totalIgst = invoices.reduce((sum, i) => sum + i.igstAmount, 0);
  const totalGst = invoices.reduce((sum, i) => sum + i.totalGst, 0);
  const grandTotalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Customer Name',
      'GSTIN',
      'Billing Month',
      'Issue Date',
      'Taxable Amount',
      'CGST (9%)',
      'SGST (9%)',
      'IGST (18%)',
      'Total GST',
      'Invoice Total',
    ];

    const rows = invoices.map((i) => [
      i.invoiceNumber,
      `"${i.companyName}"`,
      i.customerGst,
      i.billingMonth,
      i.issueDate,
      i.taxableAmount,
      i.cgstAmount,
      i.sgstAmount,
      i.igstAmount,
      i.totalGst,
      i.totalAmount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GSTR1_Sales_Report_${settings.companyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">GST & Tax Accounting Center</h1>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full">
              GSTR-1 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated tax ledger, CGST / SGST / IGST breakdown, and one-click GSTR-1 CSV export.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export GSTR-1 CSV Report</span>
        </button>
      </div>

      {/* Tax Liability Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Taxable Sales</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹ {totalTaxable.toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-slate-500 block mt-0.5">Excludes GST Tax</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">CGST Collected (9%)</span>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
            ₹ {Math.round(totalCgst).toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-indigo-600 font-medium block mt-0.5">Central Tax</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">SGST Collected (9%)</span>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-1">
            ₹ {Math.round(totalSgst).toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-purple-600 font-medium block mt-0.5">State Tax</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Output GST Payable</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹ {Math.round(totalGst).toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-emerald-600 font-bold block mt-0.5">18% Combined GST</span>
        </div>
      </div>

      {/* GSTR-1 Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">GSTR-1 Monthly Tax Ledger</h3>
          <span className="text-xs text-slate-500 font-medium">
            Company GSTIN: <strong className="text-slate-800">{settings.gstNumber}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & GSTIN</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Taxable Value (₹)</th>
                <th className="py-3 px-4 text-right">CGST (9%)</th>
                <th className="py-3 px-4 text-right">SGST (9%)</th>
                <th className="py-3 px-4 text-right">Total GST (₹)</th>
                <th className="py-3 px-4 text-right">Invoice Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{inv.companyName}</p>
                    <span className="text-[10px] text-slate-400 font-mono">GST: {inv.customerGst}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{inv.billingMonth}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                    ₹ {inv.taxableAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-600 font-medium">
                    ₹ {Math.round(inv.cgstAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right text-purple-600 font-medium">
                    ₹ {Math.round(inv.sgstAmount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                    ₹ {Math.round(inv.totalGst).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    ₹ {inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
