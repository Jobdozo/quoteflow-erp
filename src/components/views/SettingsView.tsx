import React, { useState, useRef } from 'react';
import {
  Save,
  RefreshCw,
  Building,
  CreditCard,
  FileText,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  FileCheck,
  Stamp,
  PenTool,
} from 'lucide-react';
import type { CompanySettings } from '../../types';

import { compressImageFile } from '../../utils/imageCompressor';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [newTerm, setNewTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    field: 'logoUrl' | 'digitalSignatureUrl' | 'companyStampUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImageFile(file, 400, 400, 0.85);
        handleChange(field, compressedBase64);
      } catch (err) {
        console.error('Image compression error:', err);
      }
    }
  };

  const handleUpdateTerm = (index: number, value: string) => {
    const updated = [...(formData.defaultTerms || [])];
    updated[index] = value;
    setFormData({ ...formData, defaultTerms: updated });
  };

  const handleRemoveTerm = (index: number) => {
    const updated = (formData.defaultTerms || []).filter((_, i) => i !== index);
    setFormData({ ...formData, defaultTerms: updated });
  };

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    setFormData({ ...formData, defaultTerms: [...(formData.defaultTerms || []), newTerm.trim()] });
    setNewTerm('');
  };

  const handleClearTerms = () => {
    setFormData({ ...formData, defaultTerms: [] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Settings & Terms Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your company logo, legal profile, tax registration, bank transfer details, and default Terms & Conditions.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-2xl border border-emerald-200 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Company logo, legal profile, and default Terms & Conditions saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* COMPANY BRANDING & LOGO UPLOAD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <span>Company Logo & Official PDF Branding</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Upload Card */}
            <div className="md:col-span-1 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-3">
              <span className="text-xs font-bold text-slate-700">Company Logo (Printed on Quotation Headers)</span>

              <div className="w-full h-28 bg-white rounded-xl border border-dashed border-slate-300 p-2 flex items-center justify-center relative group overflow-hidden">
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt="Company Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center space-y-1">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-semibold">No Logo Uploaded</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload('logoUrl', e)}
                className="hidden"
              />

              <div className="flex items-center space-x-2 w-full">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                </button>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', '')}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Supports PNG, JPG, WebP, SVG (Max 3MB)</p>
            </div>

            {/* Digital Signature Upload Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-3">
              <span className="text-xs font-bold text-slate-700">Authorized Signature</span>

              <div className="w-full h-28 bg-white rounded-xl border border-dashed border-slate-300 p-2 flex items-center justify-center relative overflow-hidden">
                {formData.digitalSignatureUrl ? (
                  <img
                    src={formData.digitalSignatureUrl}
                    alt="Signature Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center space-y-1">
                    <PenTool className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-semibold">No Signature Uploaded</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={signatureInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload('digitalSignatureUrl', e)}
                className="hidden"
              />

              <div className="flex items-center space-x-2 w-full">
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Signature</span>
                </button>

                {formData.digitalSignatureUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('digitalSignatureUrl', '')}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200"
                    title="Remove Signature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Transparent PNG recommended</p>
            </div>

            {/* Official Stamp Upload Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-3">
              <span className="text-xs font-bold text-slate-700">Official Company Seal / Stamp</span>

              <div className="w-full h-28 bg-white rounded-xl border border-dashed border-slate-300 p-2 flex items-center justify-center relative overflow-hidden">
                {formData.companyStampUrl ? (
                  <img
                    src={formData.companyStampUrl}
                    alt="Stamp Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center space-y-1">
                    <Stamp className="w-8 h-8 opacity-40" />
                    <span className="text-[10px] font-semibold">No Stamp Uploaded</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={stampInputRef}
                accept="image/*"
                onChange={(e) => handleFileUpload('companyStampUrl', e)}
                className="hidden"
              />

              <div className="flex items-center space-x-2 w-full">
                <button
                  type="button"
                  onClick={() => stampInputRef.current?.click()}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Seal Stamp</span>
                </button>

                {formData.companyStampUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('companyStampUrl', '')}
                    className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl border border-rose-200"
                    title="Remove Stamp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Printed on quotation signature footer</p>
            </div>
          </div>
        </div>

        {/* Company Identity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center space-x-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Company Identity & Legal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Enter your Company Name (e.g. Acme Corp Ltd.)"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                placeholder="Company Slogan / Services Tagline"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                placeholder="GSTIN Number (e.g. 07AAAAA0000A1Z5)"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 font-bold outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="info@yourcompany.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tollfree / Phone</label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                placeholder="www.yourcompany.com"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                placeholder="Full Corporate Registered Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Bank Account Details (Printed on Invoices & PDFs)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank Ltd"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 font-bold outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                placeholder="Branch Location"
                value={formData.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* DEFAULT TERMS & CONDITIONS MANAGER */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Default Company Terms & Conditions ({(formData.defaultTerms || []).length} Rules)</span>
            </h3>

            {(formData.defaultTerms || []).length > 0 && (
              <button
                type="button"
                onClick={handleClearTerms}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                Clear All Terms
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {(formData.defaultTerms || []).map((term, idx) => (
              <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-indigo-600 w-6 shrink-0 pt-1">
                  #{idx + 1}
                </span>
                <textarea
                  value={term}
                  onChange={(e) => handleUpdateTerm(idx, e.target.value)}
                  rows={2}
                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg pt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Add your custom contractual term or payment condition..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md"
            >
              + Add Rule
            </button>
          </div>
        </div>

        {/* Clear Data Reset */}
        <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-rose-900 text-sm">Clear Workspace Storage</h4>
            <p className="text-xs text-rose-600 mt-0.5">
              Permanently wipe all stored data for your account and start with a fresh workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear My Data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
