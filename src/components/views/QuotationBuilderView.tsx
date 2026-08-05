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
  const [items, setItems] = useState<QuotationItem[]>(
    editingQuotation?.items || [
      {
        id: 'item-1',
        productId: products[0]?.id,
        name: products[0]?.name || 'Security Guard (12 Hours Shift)',
        description:
          products[0]?.description ||
          'Trained male security guard for round-the-clock physical surveillance.',
        unit: products[0]?.unit || 'Month',
        quantity: 2,
        rate: products[0]?.rate || 18500,
        discount: 0,
        gstRate: products[0]?.gstRate || 18,
        total: (products[0]?.rate || 18500) * 2,
        costPerUnit: products[0]?.costPrice || 13500,
      },
    ]
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
  const subtotal = items.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0
  );
  const totalDiscount = items.reduce(
    (sum, item) =>
      sum + (item.rate * item.quantity * (item.discount || 0)) / 100,
    0
  );
  const totalGst = items.reduce((sum, item) => {
    const itemNet =
      item.rate * item.quantity -
      (item.rate * item.quantity * (item.discount || 0)) / 100;
    return sum + (itemNet * item.gstRate) / 100;
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
      productId: defaultProd?.id,
      name: defaultProd?.name || 'New Custom Service',
      description: defaultProd?.description || 'Scope of work details',
      unit: defaultProd?.unit || 'Month',
      quantity: 1,
      rate: defaultProd?.rate || 15000,
      discount: 0,
      gstRate: defaultProd?.gstRate || 18,
      total: defaultProd?.rate || 15000,
      costPerUnit: defaultProd?.costPrice || 10000,
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

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        item.name = prod.name;
        item.description = prod.description;
        item.unit = prod.unit;
        item.rate = prod.rate;
        item.gstRate = prod.gstRate;
        item.costPerUnit = prod.costPrice;
      }
    }

    const netRate = item.rate * (1 - (item.discount || 0) / 100);
    item.total = Math.round(netRate * item.quantity * (1 + item.gstRate / 100));

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Terms Handlers
  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setTerms([...terms, newTermInput.trim()]);
    setNewTermInput('');
  };

  const handleUpdateTerm = (index: number, val: string) => {
    const updated = [...terms];
    updated[index] = val;
    setTerms(updated);
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleResetDefaultTerms = () => {
    setTerms(settings.defaultTerms || zipconDefaultTerms);
  };

  // Build Object
  const buildQuotationObject = (): Quotation => {
    return {
      id: editingQuotation?.id || `q-${Date.now()}`,
      quotationNumber,
      customerId: selectedCustomer?.id || '',
      customerName: selectedCustomer?.name || '',
      companyName: selectedCustomer?.companyName || '',
      customerEmail: selectedCustomer?.email || '',
      customerMobile: selectedCustomer?.mobile || '',
      customerGst: selectedCustomer?.gstNumber || '',
      customerAddress: selectedCustomer?.address || '',
      date,
      validityDays,
      validUntil: validUntilDate,
      items,
      subtotal: Math.round(subtotal),
      totalDiscount: Math.round(totalDiscount),
      totalGst: Math.round(totalGst),
      grandTotal,
      estimatedCost: Math.round(totalCost),
      estimatedMarginPercent,
      terms,
      status,
      hasCompanyStamp,
      createdBy: 'Ankit Sharma',
      createdAt: editingQuotation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const qObj = buildQuotationObject();
    onSaveQuotation(qObj);
  };

  const handlePreview = () => {
    const qObj = buildQuotationObject();
    onPreviewPDF(qObj);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Build customized commercial proposal with automated GST, AI assistance, and terms manager.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setShowAiDrawer(!showAiDrawer)}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Copilot</span>
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-300"
          >
            <Eye className="w-4 h-4 text-slate-600" />
            <span>PDF Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Quotation</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Customer & Quote Details Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Client & Invoice Reference Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quotation Number</label>
              <input
                type="text"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quote Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Validity (Days)</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table Builder */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Services & Scope Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Service Line</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Service Name & Scope</th>
                  <th className="py-2.5 px-3 w-24">Unit</th>
                  <th className="py-2.5 px-3 w-20">Qty</th>
                  <th className="py-2.5 px-3 w-28">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-20">Disc %</th>
                  <th className="py-2.5 px-3 w-20">GST %</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total (₹)</th>
                  <th className="py-2.5 px-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 space-y-1">
                      <select
                        value={item.productId || ''}
                        onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 font-bold outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.rate}/{p.unit})
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                        rows={1}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-600 text-[11px] outline-none"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center font-semibold text-slate-700"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(index, 'quantity', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center font-bold text-slate-900"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleUpdateItem(index, 'rate', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleUpdateItem(index, 'discount', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        value={item.gstRate}
                        onChange={(e) => handleUpdateItem(index, 'gstRate', Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 text-center"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 text-sm">
                      ₹ {item.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMIZABLE TERMS & CONDITIONS MANAGER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Customizable Terms & Conditions ({terms.length} Rules)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Modify, add, or delete specific contractual terms for this quotation.
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetDefaultTerms}
              className="text-xs text-indigo-600 hover:underline font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default ZIPCON Terms</span>
            </button>
          </div>

          {/* Terms List Line By Line */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {terms.map((term, tIdx) => (
              <div key={tIdx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-indigo-600 w-6 shrink-0 pt-1">
                  #{tIdx + 1}
                </span>
                <textarea
                  value={term}
                  onChange={(e) => handleUpdateTerm(tIdx, e.target.value)}
                  rows={2}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(tIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg pt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Custom Term Box */}
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newTermInput}
              onChange={(e) => setNewTermInput(e.target.value)}
              placeholder="Add new custom term or condition..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              + Add Rule
            </button>
          </div>
        </div>

        {/* Profit Estimation & Financial Summary Card */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL ESTIMATED REVENUE
            </span>
            <h3 className="text-3xl font-black text-white mt-1">
              ₹ {grandTotal.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              Subtotal: ₹{subtotal.toLocaleString('en-IN')} | GST: ₹{totalGst.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
              <span>Internal Cost Est:</span>
              <strong className="font-bold text-white">₹ {totalCost.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex justify-between items-center text-xs text-emerald-400 font-bold mb-2">
              <span>Estimated Profit:</span>
              <span>₹ {estimatedProfit.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, estimatedMarginPercent))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 mt-1.5 block text-right">
              {estimatedMarginPercent}% Gross Margin
            </span>
          </div>

          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Quotation</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
