import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Sparkles,
  Send,
  MessageSquare,
  Building,
  User,
  Calendar,
  FileText,
  Percent,
  Calculator,
  ShieldAlert,
  ListPlus,
  RotateCcw,
  Inbox,
} from 'lucide-react';
import type {
  Quotation,
  QuotationItem,
  Customer,
  Product,
  CompanySettings,
  QuotationStatus,
} from '../../types';
import { zipconDefaultTerms } from '../../data/mockData';

interface QuotationBuilderViewProps {
  customers: Customer[];
  products: Product[];
  settings: CompanySettings;
  editingQuotation: Quotation | null;
  onSaveQuotation: (quotation: Quotation) => void;
  onPreviewPDF: (quotation: Quotation) => void;
  onSendWhatsApp: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
  onCancel: () => void;
}

export const QuotationBuilderView: React.FC<QuotationBuilderViewProps> = ({
  customers,
  products,
  settings,
  editingQuotation,
  onSaveQuotation,
  onPreviewPDF,
  onSendWhatsApp,
  onSendEmail,
  onCancel,
}) => {
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    editingQuotation?.customerId || customers[0]?.id || ''
  );
  const [quotationNumber, setQuotationNumber] = useState(
    editingQuotation?.quotationNumber ||
      `${settings.quotationPrefix}${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(
    editingQuotation?.date || new Date().toISOString().split('T')[0]
  );
  const [validityDays, setValidityDays] = useState(
    editingQuotation?.validityDays || 30
  );
  // Default to empty array when creating a new quotation (no seeded line items)
  const [items, setItems] = useState<QuotationItem[]>(
    editingQuotation?.items || []
  );

  const [terms, setTerms] = useState<string[]>(
    editingQuotation?.terms?.length ? editingQuotation.terms : settings.defaultTerms || zipconDefaultTerms
  );
  const [newTermInput, setNewTermInput] = useState('');
  const [status, setStatus] = useState<QuotationStatus>(
    editingQuotation?.status || 'Draft'
  );
  const [hasCompanyStamp, setHasCompanyStamp] = useState(
    editingQuotation?.hasCompanyStamp ?? true
  );

  // AI Drawer state
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Calculate validity date
  const validUntilDate = new Date(
    new Date(date).getTime() + validityDays * 86400000
  )
    .toISOString()
    .split('T')[0];

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Financial Calculations
  const rawSubtotal = items.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0
  );

  const totalAdminCharges = items.reduce(
    (sum, item) =>
      sum + (item.rate * item.quantity * (item.adminChargePercent || 0)) / 100,
    0
  );

  const subtotal = rawSubtotal + totalAdminCharges;

  const totalDiscount = items.reduce(
    (sum, item) => {
      const base = item.rate * item.quantity;
      const adminFee = (base * (item.adminChargePercent || 0)) / 100;
      return sum + ((base + adminFee) * (item.discount || 0)) / 100;
    },
    0
  );

  const totalGst = items.reduce((sum, item) => {
    const base = item.rate * item.quantity;
    const adminFee = (base * (item.adminChargePercent || 0)) / 100;
    const itemTaxable = (base + adminFee) - ((base + adminFee) * (item.discount || 0)) / 100;
    return sum + (itemTaxable * item.gstRate) / 100;
  }, 0);

  const grandTotal = Math.round(subtotal - totalDiscount + totalGst);

  const totalCost = items.reduce(
    (sum, item) =>
      sum + (item.costPerUnit || item.rate * 0.7) * item.quantity,
    0
  );
  const estimatedProfit = grandTotal - totalCost;
  const estimatedMarginPercent =
    grandTotal > 0 ? Math.round((estimatedProfit / grandTotal) * 100) : 0;

  // Item Handlers
  const handleAddItem = () => {
    const defaultProd = products[0];
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      productId: defaultProd?.id || '',
      name: defaultProd?.name || '',
      description: defaultProd?.description || '',
      unit: defaultProd?.unit || 'Month',
      quantity: 1,
      rate: defaultProd?.rate || 0,
      adminChargePercent: 0,
      discount: 0,
      gstRate: defaultProd?.gstRate || 18,
      total: defaultProd?.rate || 0,
      costPerUnit: defaultProd?.costPrice || 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (
    index: number,
    field: keyof QuotationItem,
    value: any
  ) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Auto-recalculate line total (Base + Admin - Disc)
    const base = item.rate * item.quantity;
    const adminFee = (base * (item.adminChargePercent || 0)) / 100;
    const taxable = (base + adminFee) - ((base + adminFee) * (item.discount || 0)) / 100;
    item.total = Math.round(taxable);

    updated[index] = item;
    setItems(updated);
  };

  const handleSelectProductForItem = (index: number, productId: string) => {
    const selectedProd = products.find((p) => p.id === productId);
    if (!selectedProd) return;

    const updated = [...items];
    const base = selectedProd.rate * updated[index].quantity;
    const adminFee = (base * (updated[index].adminChargePercent || 0)) / 100;
    const taxable = (base + adminFee) - ((base + adminFee) * (updated[index].discount || 0)) / 100;

    updated[index] = {
      ...updated[index],
      productId: selectedProd.id,
      name: selectedProd.name,
      description: selectedProd.description,
      unit: selectedProd.unit,
      rate: selectedProd.rate,
      gstRate: selectedProd.gstRate,
      costPerUnit: selectedProd.costPrice,
      total: Math.round(taxable),
    };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setTerms([...terms, newTermInput.trim()]);
    setNewTermInput('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedCustomerId && !selectedCustomer) {
      alert('Please select or enter a Customer before saving.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one Service Line Item.');
      return;
    }

    const currentCust = selectedCustomer || {
      id: `cust-custom-${Date.now()}`,
      name: 'Client',
      companyName: 'Client Company',
      email: '',
      mobile: '',
    };

    const newQuotation: Quotation = {
      id: editingQuotation?.id || `q-${Date.now()}`,
      quotationNumber,
      customerId: currentCust.id,
      customerName: currentCust.name,
      companyName: currentCust.companyName,
      customerEmail: currentCust.email,
      customerMobile: currentCust.mobile,
      date,
      validityDays,
      validUntil: validUntilDate,
      items,
      subtotal,
      adminChargesTotal: totalAdminCharges,
      totalDiscount,
      totalGst,
      grandTotal,
      estimatedCost: totalCost,
      estimatedMarginPercent,
      terms,
      status,
      hasCompanyStamp,
      createdBy: editingQuotation?.createdBy || 'ZIPCON Staff',
      createdAt: editingQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveQuotation(newQuotation);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {editingQuotation ? `Edit Quotation (${editingQuotation.quotationNumber})` : 'Create New Quotation'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Build customized commercial proposal with automated GST, AI assistance, and terms manager.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAiDrawer(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>

          {items.length > 0 && (
            <button
              onClick={() => {
                const tempQuote: Quotation = {
                  id: editingQuotation?.id || `q-temp-${Date.now()}`,
                  quotationNumber,
                  customerId: selectedCustomer?.id || '',
                  customerName: selectedCustomer?.name || 'Valued Client',
                  companyName: selectedCustomer?.companyName || 'Client Organization',
                  customerEmail: selectedCustomer?.email || '',
                  customerMobile: selectedCustomer?.mobile || '',
                  date,
                  validityDays,
                  validUntil: validUntilDate,
                  items,
                  subtotal,
                  adminChargesTotal: totalAdminCharges,
                  totalDiscount,
                  totalGst,
                  grandTotal,
                  estimatedCost: totalCost,
                  estimatedMarginPercent,
                  terms,
                  status,
                  hasCompanyStamp,
                  createdBy: editingQuotation?.createdBy || 'ZIPCON Staff',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                onPreviewPDF(tempQuote);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-all"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>PDF Preview</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Quotation</span>
          </button>
        </div>
      </div>

      {/* Client & Reference Info Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Building className="w-4 h-4 text-indigo-600" />
          <span>Client & Invoice Reference Details</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="">-- Choose Customer from CRM --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Quotation Number
            </label>
            <input
              type="text"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Quote Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Validity (Days)
            </label>
            <input
              type="number"
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Services & Line Items Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <ListPlus className="w-4 h-4 text-indigo-600" />
            <span>Services & Scope Line Items</span>
          </h3>
          <button
            onClick={handleAddItem}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Service Line</span>
          </button>
        </div>

        {items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3 min-w-[260px]">Service Name & Scope</th>
                  <th className="py-2.5 px-3 w-24">Unit</th>
                  <th className="py-2.5 px-3 w-20">Qty</th>
                  <th className="py-2.5 px-3 w-24">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-20">Admin %</th>
                  <th className="py-2.5 px-3 w-20">Disc %</th>
                  <th className="py-2.5 px-3 w-20">GST %</th>
                  <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    {/* Service Name & Scope */}
                    <td className="py-3 px-3 space-y-1">
                      {products.length > 0 && (
                        <select
                          value={item.productId || ''}
                          onChange={(e) => handleSelectProductForItem(idx, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none mb-1"
                        >
                          <option value="">-- Select Pre-saved Service --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.rate}/{p.unit})
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        placeholder="Service Name (e.g. Armed Security Guard)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                      />
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                        placeholder="Detailed scope description & duty specifications..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 outline-none focus:border-indigo-500 focus:bg-white resize-none"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3 align-top">
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 outline-none"
                      >
                        <option value="Month">Month</option>
                        <option value="Shift">Shift</option>
                        <option value="Person">Person</option>
                        <option value="Sq. Ft.">Sq. Ft.</option>
                        <option value="Unit">Unit</option>
                        <option value="Hours">Hours</option>
                      </select>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 outline-none text-center"
                      />
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(idx, 'rate', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 outline-none"
                      />
                    </td>

                    {/* Admin Charges % */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.adminChargePercent || 0}
                        onChange={(e) => handleUpdateItem(idx, 'adminChargePercent', Number(e.target.value))}
                        placeholder="0%"
                        className="w-full bg-indigo-50/50 border border-indigo-200 rounded-lg px-2 py-1.5 text-xs font-bold text-indigo-700 outline-none text-center focus:border-indigo-500 focus:bg-white"
                        title="Admin / Service Charge percentage"
                      />
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discount || 0}
                        onChange={(e) => handleUpdateItem(idx, 'discount', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 outline-none text-center"
                      />
                    </td>

                    {/* GST Rate */}
                    <td className="py-3 px-3 align-top">
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleUpdateItem(idx, 'gstRate', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs font-medium text-slate-800 outline-none"
                      >
                        <option value={18}>18%</option>
                        <option value={12}>12%</option>
                        <option value={5}>5%</option>
                        <option value={0}>0%</option>
                      </select>
                    </td>

                    {/* Line Total */}
                    <td className="py-3 px-3 align-top text-right font-extrabold text-slate-900 text-sm">
                      ₹ {item.total.toLocaleString('en-IN')}
                    </td>

                    {/* Remove */}
                    <td className="py-3 px-2 align-top text-center">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove Line Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No service line items added yet.</p>
            <p className="text-slate-400">Click below to add your first custom service or manpower scope.</p>
            <button
              onClick={handleAddItem}
              className="mt-2 bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors inline-flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Line</span>
            </button>
          </div>
        )}
      </div>

      {/* Financial Summary & Commercial Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terms & Conditions Editor */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center justify-between">
            <span>Customizable Terms & Conditions ({terms.length} Rules)</span>
          </h3>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newTermInput}
              onChange={(e) => setNewTermInput(e.target.value)}
              placeholder="Add custom clause or payment condition..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
            />
            <button
              onClick={handleAddTerm}
              className="bg-indigo-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              + Add Term
            </button>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {terms.map((t, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-2 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100"
              >
                <span className="leading-snug pr-2">
                  <strong className="text-indigo-600 mr-1">{index + 1}.</strong> {t}
                </span>
                <button
                  onClick={() => handleRemoveTerm(index)}
                  className="text-slate-400 hover:text-rose-600 shrink-0 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Total Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 border-b border-indigo-900/60 pb-2">
              Proposal Financial Summary
            </h4>

            <div className="space-y-2 mt-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Subtotal:</span>
                <span className="font-bold text-white">₹ {rawSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {totalAdminCharges > 0 && (
                <div className="flex justify-between text-amber-300 font-semibold">
                  <span>Admin / Service Charges:</span>
                  <span className="font-bold">+ ₹ {totalAdminCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-rose-300 font-semibold">
                  <span>Total Discount Allowed:</span>
                  <span className="font-bold">- ₹ {totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Estimated GST (Tax):</span>
                <span className="font-bold text-emerald-300">+ ₹ {Math.round(totalGst).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-700/80 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-indigo-200">Grand Total (Inc. GST):</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹ {grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Estimated Gross Profit Margin</span>
              <span className="font-extrabold text-emerald-400 text-sm">₹ {estimatedProfit.toLocaleString('en-IN')} ({estimatedMarginPercent}%)</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs">
              {estimatedMarginPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
