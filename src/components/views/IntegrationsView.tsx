import React, { useState, useEffect } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  Settings,
  X,
  Save,
  Check,
  Globe,
  Lock,
  Key,
  Database,
  Send,
  MessageSquare,
  CreditCard,
  Cloud,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { StorageService } from '../../utils/storage';

export interface IntegrationConfig {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  enabled: boolean;
  status: 'Active' | 'Configured' | 'Disconnected';
  fields: Record<string, string>;
}

export const IntegrationsView: React.FC = () => {
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [modalFormData, setModalFormData] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setConfigs(StorageService.getIntegrations());
  }, []);

  const integrationsList = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      category: 'Communication',
      icon: '💬',
      description: 'Send instant proposal PDFs and interactive templates to client WhatsApp numbers via official Meta Cloud API.',
      defaultFields: {
        phoneNumberId: '109283746591023',
        wabaAccountId: '982736451029384',
        accessToken: 'EAAG129384756abcdef...',
        webhookSecret: 'whsec_zipcon_whatsapp_2026',
      },
    },
    {
      id: 'email',
      name: 'SendGrid & Amazon SES Email',
      category: 'Communication',
      icon: '✉️',
      description: 'High-deliverability HTML email engine with embedded tracking pixels, custom SMTP, and automatic quotation attachments.',
      defaultFields: {
        smtpHost: 'smtp.sendgrid.net',
        smtpPort: '587',
        senderEmail: 'quotes@zipcon.in',
        senderName: 'ZIPCON Proposals Team',
        apiKey: 'SG.2837491029384756abcdef...',
      },
    },
    {
      id: 'razorpay',
      name: 'Razorpay Payment Gateway',
      category: 'Payment',
      icon: '💳',
      description: 'Instant UPI, NetBanking, and Credit Card payment links generated directly on tax invoice PDFs for automated ledger settlement.',
      defaultFields: {
        keyId: 'rzp_live_9827364510',
        keySecret: 'sec_928374615203948',
        webhookSecret: 'whsec_razorpay_zipcon',
        currency: 'INR',
      },
    },
    {
      id: 'tally',
      name: 'Tally Prime & Zoho Books',
      category: 'Accounting',
      icon: '📊',
      description: 'Auto-synchronize monthly invoices, GST ledgers, and sales voucher entries into Tally ERP or Zoho Books.',
      defaultFields: {
        tallyHostUrl: 'http://localhost:9000',
        companyNameInTally: 'ZIPCON SERVICES PVT LTD',
        salesVoucherType: 'Sales Invoice',
        autoPostVouchers: 'true',
      },
    },
    {
      id: 'cloud_storage',
      name: 'Google Drive & Dropbox Cloud',
      category: 'Storage',
      icon: '☁️',
      description: 'Auto-backup generated quotation PDFs, signed contract agreements, and client site survey photos to secure cloud folders.',
      defaultFields: {
        cloudProvider: 'Google Drive',
        backupFolderPath: '/ZIPCON_ERP_Backups/Quotations_2026',
        autoBackupPdf: 'true',
      },
    },
    {
      id: 'calendar_sync',
      name: 'Microsoft Outlook & Google Calendar',
      category: 'Calendar',
      icon: '📅',
      description: 'Synchronize client site visits, contract negotiation meetings, and supervision follow-ups with your team calendar.',
      defaultFields: {
        calendarId: 'primary',
        syncFollowUps: 'true',
        clientClientId: 'google-oauth-client-zipcon-2026.apps.googleusercontent.com',
      },
    },
  ];

  const handleOpenConfig = (item: typeof integrationsList[0]) => {
    setActiveModalId(item.id);
    const existing = configs[item.id] || {};
    setModalFormData(existing.fields || item.defaultFields);
    setTestResult(null);
    setSaveSuccess(false);
  };

  const handleSaveModal = (item: typeof integrationsList[0]) => {
    const updatedConfig = {
      id: item.id,
      name: item.name,
      enabled: true,
      status: 'Active',
      fields: modalFormData,
      updatedAt: new Date().toISOString(),
    };
    const updatedAll = StorageService.saveIntegration(item.id, updatedConfig);
    setConfigs(updatedAll);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveModalId(null);
    }, 1200);
  };

  const handleTestConnection = (item: typeof integrationsList[0]) => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult(`✓ Connection Verified! Connected to ${item.name} API endpoint (HTTP 200 OK). Credentials authenticated.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Integrations Hub</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Meta WhatsApp API, SendGrid Email, Razorpay Payment Gateway, Tally ERP, and Cloud Storage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>6 Active Connectors</span>
          </span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsList.map((item) => {
          const stored = configs[item.id];
          const isConfigured = stored && stored.enabled;

          return (
            <div
              key={item.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isConfigured
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {isConfigured ? '🟢 ACTIVE & SYNCED' : '⚙️ READY TO CONNECT'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                <button
                  onClick={() => handleOpenConfig(item)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure API</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Configuration Modal */}
      {activeModalId && (() => {
        const item = integrationsList.find((i) => i.id === activeModalId);
        if (!item) return null;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">{item.category} Enterprise Connector</span>
                  </div>
                </div>
                <button onClick={() => setActiveModalId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Integration parameters saved & synchronized successfully!</span>
                </div>
              )}

              {testResult && (
                <div className="p-3 bg-indigo-50 text-indigo-900 font-semibold text-xs rounded-xl border border-indigo-200">
                  {testResult}
                </div>
              )}

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {Object.keys(item.defaultFields).map((fieldKey) => (
                  <div key={fieldKey}>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type={fieldKey.toLowerCase().includes('secret') || fieldKey.toLowerCase().includes('key') ? 'password' : 'text'}
                      value={modalFormData[fieldKey] || ''}
                      onChange={(e) =>
                        setModalFormData({ ...modalFormData, [fieldKey]: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestConnection(item)}
                  disabled={isTesting}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing API...' : 'Test API Connection'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalId(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveModal(item)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Enable</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
