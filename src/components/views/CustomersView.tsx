import React, { useState, useRef } from 'react';
import { Users, Plus, Search, Building2, Phone, Mail, FileText, Edit, Trash2, MapPin, X, Camera, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Customer } from '../../types';
import { scanVisitingCardWithGemini } from '../../services/GeminiService';

interface CustomersViewProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer?: (id: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers, onSaveCustomer, onDeleteCustomer }) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // AI Card Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedSummary, setScannedSummary] = useState<any | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompanyName('');
    setGstNumber('');
    setEmail('');
    setMobile('');
    setContactPerson('');
    setAddress('');
    setNotes('');
    setScanSuccess(false);
    setScanError(null);
    setScannedSummary(null);
    setShowModal(true);
  };

  const handleTriggerCardScan = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const handleCardCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!showModal) {
      openAddModal();
    }

    setIsScanning(true);
    setScanSuccess(false);
    setScanError(null);
    setScannedSummary(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64Data = event.target.result as string;
        try {
          const scanned = await scanVisitingCardWithGemini(base64Data, file.type);
          setScannedSummary(scanned);

          if (scanned.companyName) setCompanyName(scanned.companyName);
          if (scanned.name) setName(scanned.name);
          if (scanned.contactPerson) setContactPerson(scanned.contactPerson);
          if (scanned.mobile) setMobile(scanned.mobile);
          if (scanned.email) setEmail(scanned.email);
          if (scanned.gstNumber) setGstNumber(scanned.gstNumber);
          if (scanned.address) setAddress(scanned.address);
          if (scanned.notes) setNotes(scanned.notes);

          setScanSuccess(true);
          setTimeout(() => setScanSuccess(false), 6000);
        } catch (err: any) {
          console.error('Card scan error:', err);
          setScanError('Failed to extract card details. Please fill manually or try a clearer photo.');
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };



  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setCompanyName(c.companyName);
    setGstNumber(c.gstNumber);
    setEmail(c.email);
    setMobile(c.mobile);
    setContactPerson(c.contactPerson);
    setAddress(c.address);
    setNotes(c.notes);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: editingCustomer?.id || `cust-${Date.now()}`,
      name,
      companyName,
      gstNumber,
      email,
      mobile,
      contactPerson,
      address,
      notes,
      createdAt: editingCustomer?.createdAt || new Date().toISOString().split('T')[0],
    };
    onSaveCustomer(customer);
    setShowModal(false);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer CRM</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client profiles, GSTIN details, communication history, and past quotations.
          </p>
        </div>

        {/* Hidden Camera / File Input for Mobile Visiting Card Capture */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCardCapture}
          className="hidden"
        />

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerCardScan}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            title="Take a photo of a business card to auto-fill customer details"
          >
            <Camera className="w-4 h-4 text-purple-200" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Scan Visiting Card (AI OCR)</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by company, name, email, mobile..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
          Total Customers: {customers.length}
        </span>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {c.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.companyName}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{c.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(c)}
                    title="Edit Customer Details"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {onDeleteCustomer && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete customer account '${c.companyName}'?`)) {
                          onDeleteCustomer(c.id);
                        }
                      }}
                      title="Delete Customer Account"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.mobile}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>GST: <strong className="text-slate-800">{c.gstNumber || 'N/A'}</strong></span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{c.address}</span>
                </div>
              </div>
            </div>

            {c.notes && (
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 italic">
                "{c.notes}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="text-[11px] text-slate-500">Auto-fill details using camera or manual entry</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleTriggerCardScan}
                  disabled={isScanning}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] px-3 py-1.5 rounded-xl border border-purple-200 flex items-center space-x-1 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Card</span>
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Scanning Status Banners */}
            {isScanning && (
              <div className="mt-3 p-3 bg-slate-900 text-purple-100 rounded-2xl border border-purple-500/50 flex items-center space-x-3 text-xs animate-pulse">
                <Loader2 className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
                <div>
                  <p className="font-extrabold text-white flex items-center gap-1">
                    <span>⚡ Gemini Vision AI Scanning Business Card...</span>
                  </p>
                  <p className="text-[10px] text-purple-300">Extracting company, contact name, designation, mobile, email, GSTIN & address</p>
                </div>
              </div>
            )}

            {scanSuccess && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">✅ Card scanned successfully! All detected details auto-populated.</span>
              </div>
            )}

            {scanError && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-medium">
                {scanError}
              </div>
            )}

            {/* AI Extracted Card Details Summary Box */}
            {scannedSummary && !isScanning && (
              <div className="mt-3 p-3.5 bg-gradient-to-r from-purple-950 to-indigo-950 text-white rounded-2xl border border-purple-500/40 shadow-lg text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-800/80 pb-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gemini Vision AI Card Extraction Results</span>
                  </div>
                  <span className="text-[10px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded-full font-bold">Auto-Filled</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-sans pt-1">
                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">🏢 Company: </span>
                    <span className="font-bold text-white">{scannedSummary.companyName || '—'}</span>
                  </div>

                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">👤 Contact: </span>
                    <span className="font-bold text-white">{scannedSummary.contactPerson || scannedSummary.name || '—'}</span>
                  </div>

                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">📱 Mobile: </span>
                    <span className="font-bold text-white">{scannedSummary.mobile || '—'}</span>
                  </div>

                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">✉️ Email: </span>
                    <span className="font-bold text-white">{scannedSummary.email || '—'}</span>
                  </div>

                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">🏛️ GSTIN: </span>
                    <span className="font-bold text-white">{scannedSummary.gstNumber || '—'}</span>
                  </div>

                  <div className="truncate text-purple-200">
                    <span className="font-semibold text-purple-300">📍 Address: </span>
                    <span className="font-bold text-white">{scannedSummary.address || '—'}</span>
                  </div>
                </div>

                <p className="text-[10px] text-purple-300 pt-1 italic">
                  💡 Extracted info filled below. Any missing field can be manually added or edited before saving.
                </p>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. VMart Retail Ltd."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amit Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="07AAAAC1234A1Z5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amit@company.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full office or site address..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special client preferences or notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
