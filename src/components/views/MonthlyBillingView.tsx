import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  X,
  Send,
  Building2,
} from 'lucide-react';
import type { MonthlyInvoice, PaymentRecord, Customer, Quotation, InvoiceStatus } from '../../types';

interface MonthlyBillingViewProps {
  invoices: MonthlyInvoice[];
  quotations: Quotation[];
  customers: Customer[];
  onSaveInvoice: (invoice: MonthlyInvoice) => void;
  onRecordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => void;
}

export const MonthlyBillingView: React.FC<MonthlyBillingViewProps> = ({
  invoices,
  quotations,
  customers,
  onSaveInvoice,
  onRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<MonthlyInvoice | null>(null);

  // Generate Invoice Form State
  const [selectedQuotationId, setSelectedQuotationId] = useState(quotations[0]?.id || '');
  const [billingMonth, setBillingMonth] = useState('May 2026');

  // Record Payment Form State
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentRecord['paymentMode']>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Calculations
  const totalBilled = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalPendingDues = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueCount = invoices.filter((i) => i.status === 'Overdue').length;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab = activeTab === 'All' || inv.status === activeTab;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partially Paid':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overdue':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Sent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleGenerateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quotations.find((item) => item.id === selectedQuotationId) || quotations[0];
    if (!q) return;

    const issueDate = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 15);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const taxable = q.subtotal - q.totalDiscount;
    const cgst = taxable * 0.09;
    const sgst = taxable * 0.09;

    const newInvoice: MonthlyInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      quotationId: q.id,
      quotationNumber: q.quotationNumber,
      customerId: q.customerId,
      customerName: q.customerName,
      companyName: q.companyName,
      customerGst: q.customerGst || 'N/A',
      customerAddress: q.customerAddress || q.companyName,
      billingMonth,
      issueDate,
      dueDate,
      items: q.items,
      subtotal: q.subtotal,
      totalDiscount: q.totalDiscount,
      taxableAmount: taxable,
      cgstAmount: Math.round(cgst),
      sgstAmount: Math.round(sgst),
      igstAmount: 0,
      totalGst: q.totalGst,
      totalAmount: q.grandTotal,
      paidAmount: 0,
      balanceDue: q.grandTotal,
      status: 'Sent',
      payments: [],
      createdAt: new Date().toISOString(),
    };

    onSaveInvoice(newInvoice);
    setShowGenerateModal(false);
  };

  const handleOpenPaymentModal = (inv: MonthlyInvoice) => {
    setSelectedInvoiceForPay(inv);
    setAmountPaid(inv.balanceDue);
    setTransactionRef(`NEFT${Math.floor(100000 + Math.random() * 900000)}`);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPay) return;

    onRecordPayment(selectedInvoiceForPay.id, {
      invoiceId: selectedInvoiceForPay.id,
      invoiceNumber: selectedInvoiceForPay.invoiceNumber,
      customerName: selectedInvoiceForPay.customerName,
      companyName: selectedInvoiceForPay.companyName,
      amountPaid: Number(amountPaid),
      paymentDate,
      paymentMode,
      transactionRef,
      notes: paymentNotes || 'Payment recorded via QuoteFlow Accounting',
    });

    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Monthly Billing & Dues CRM</h1>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full">
              Accounting Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate monthly recurring invoices, track collections, record bank payments, and manage pending client dues.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Monthly Invoice</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Billed Revenue</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹ {totalBilled.toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-slate-500 mt-0.5 block">Monthly Invoices Issued</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Payments Collected</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            ₹ {totalCollected.toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-emerald-600 font-semibold block mt-0.5">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(0) : '0'}% Cleared
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Pending Dues</span>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
            ₹ {totalPendingDues.toLocaleString('en-IN')}
          </h3>
          <span className="text-xs text-rose-600 font-semibold block mt-0.5">
            {overdueCount} Invoices Overdue
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Collection Rate</span>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
            {invoices.length > 0 ? ((invoices.filter((i) => i.status === 'Paid').length / invoices.length) * 100).toFixed(0) : '100'}%
          </h3>
          <span className="text-xs text-indigo-600 font-medium block mt-0.5">On-time Settlements</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {['All', 'Paid', 'Partially Paid', 'Overdue', 'Sent'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 font-bold border-b border-slate-100">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer & Month</th>
                <th className="py-3 px-4">Issue / Due Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-indigo-600">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{inv.companyName}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{inv.billingMonth}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <p>{inv.issueDate}</p>
                    <span className="text-[10px] text-rose-500 font-medium">Due: {inv.dueDate}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ₹ {inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                    ₹ {inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                    ₹ {inv.balanceDue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {inv.balanceDue > 0 ? (
                      <button
                        onClick={() => handleOpenPaymentModal(inv)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-md transition-colors"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cleared</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Generate Invoice Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Generate Monthly Invoice</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Approved Proposal / Quotation</label>
                <select
                  value={selectedQuotationId}
                  onChange={(e) => setSelectedQuotationId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
                >
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quotationNumber} - {q.companyName} (₹{q.grandTotal.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Billing Month</label>
                <select
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                >
                  <option value="May 2026">May 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payment Modal */}
      {showPaymentModal && selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Client Payment</h3>
                <p className="text-xs text-slate-500">
                  Invoice #{selectedInvoiceForPay.invoiceNumber} • {selectedInvoiceForPay.companyName}
                </p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 font-semibold flex justify-between">
                <span>Total Invoice Balance Due:</span>
                <span className="font-extrabold">₹ {selectedInvoiceForPay.balanceDue.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    required
                    max={selectedInvoiceForPay.balanceDue}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-semibold"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI Payment</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Ref / UTR No.</label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="NEFT982347102"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receipt Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Bank"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
