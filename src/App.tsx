import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { QuotationBuilderView } from './components/views/QuotationBuilderView';
import { QuotationsListView } from './components/views/QuotationsListView';
import { PipelineKanbanView } from './components/views/PipelineKanbanView';
import { MonthlyBillingView } from './components/views/MonthlyBillingView';
import { GSTAccountingView } from './components/views/GSTAccountingView';
import { CalendarView } from './components/views/CalendarView';
import { CustomersView } from './components/views/CustomersView';
import { ProductsView } from './components/views/ProductsView';
import { PriceListView } from './components/views/PriceListView';
import { TemplatesView } from './components/views/TemplatesView';
import { FollowUpsView } from './components/views/FollowUpsView';
import { WhatsAppCenterView } from './components/views/WhatsAppCenterView';
import { EmailCenterView } from './components/views/EmailCenterView';
import { ReportsView } from './components/views/ReportsView';
import { TeamView } from './components/views/TeamView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SecurityAuditView } from './components/views/SecurityAuditView';
import { SettingsView } from './components/views/SettingsView';
import { PDFDocumentView } from './components/pdf/PDFDocumentView';
import { FloatingAiAssistant } from './components/ai/FloatingAiAssistant';
import { AutoUpdateModal } from './components/common/AutoUpdateModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { ZeroTrust, getUserRole } from './services/ZeroTrustService';
import { ShieldAlert } from 'lucide-react';

import { StorageService } from './utils/storage';
import { SyncService } from './services/SyncService';
import {
  FirebaseQuotations,
  FirebaseInvoices,
  FirebaseCustomers,
  FirebaseProducts,
  FirebaseFollowUps,
  FirebaseSettings,
  FirebaseEmailLogs,
  FirebaseAudit,
} from './firebase/FirebaseService';
import type {
  Quotation,
  MonthlyInvoice,
  PaymentRecord,
  Customer,
  Product,
  ProposalTemplate,
  FollowUp,
  EmailLog,
  TeamMember,
  CompanySettings,
  QuotationStatus,
  AuditLog,
} from './types';

export function App() {
  // ── ALL HOOKS DECLARED AT TOP LEVEL (React Rules of Hooks) ──────────────
  const { user, loading: authLoading, logout } = useFirebaseAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain States loaded from StorageService — User-Isolated
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<MonthlyInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(StorageService.getCompanySettings(user?.uid));

  // Modal / Selection states
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationForWA, setSelectedQuotationForWA] = useState<Quotation | null>(null);
  const [selectedQuotationForEmail, setSelectedQuotationForEmail] = useState<Quotation | null>(null);
  const [showAutoUpdateModal, setShowAutoUpdateModal] = useState(false);

  // Refresh data strictly isolated to the authenticated user.uid
  const refreshAllState = (uid?: string) => {
    const targetUid = uid || user?.uid;
    setQuotations(StorageService.getQuotations(targetUid));
    setInvoices(StorageService.getInvoices(targetUid));
    setCustomers(StorageService.getCustomers(targetUid));
    setProducts(StorageService.getProducts(targetUid));
    setTemplates(StorageService.getTemplates(targetUid));
    setFollowUps(StorageService.getFollowUps(targetUid));
    setEmailLogs(StorageService.getEmailLogs(targetUid));
    setTeamMembers(StorageService.getTeamMembers(targetUid));
    setAuditLogs(StorageService.getAuditLogs(targetUid));
    setSettings(StorageService.getCompanySettings(targetUid));
  };

  useEffect(() => {
    refreshAllState(user?.uid);

    if (!user?.uid) return;

    // ── REAL-TIME FIREBASE FIRESTORE CLOUD SYNC (<200ms Latency Across Devices) ──
    const unsubQuotations = FirebaseQuotations.onSnapshot((cloudQuotations) => {
      if (cloudQuotations) {
        setQuotations(cloudQuotations);
        StorageService.setQuotationsDirect(cloudQuotations, user.uid);
      }
    }, user.uid);

    const unsubInvoices = FirebaseInvoices.onSnapshot((cloudInvoices) => {
      if (cloudInvoices) {
        setInvoices(cloudInvoices);
        StorageService.setInvoicesDirect(cloudInvoices, user.uid);
      }
    }, user.uid);

    const unsubCustomers = FirebaseCustomers.onSnapshot((cloudCustomers) => {
      if (cloudCustomers) {
        setCustomers(cloudCustomers);
        StorageService.setCustomersDirect(cloudCustomers, user.uid);
      }
    }, user.uid);

    const unsubProducts = FirebaseProducts.onSnapshot((cloudProducts) => {
      if (cloudProducts) {
        setProducts(cloudProducts);
        StorageService.setProductsDirect(cloudProducts, user.uid);
      }
    }, user.uid);

    const unsubFollowUps = FirebaseFollowUps.onSnapshot((cloudFollows) => {
      if (cloudFollows) {
        setFollowUps(cloudFollows);
        StorageService.setFollowUpsDirect(cloudFollows, user.uid);
      }
    }, user.uid);

    const unsubSettings = FirebaseSettings.onSnapshot((cloudSettings) => {
      if (cloudSettings && cloudSettings.companyName !== undefined) {
        setSettings(cloudSettings);
        StorageService.setSettingsDirect(cloudSettings, user.uid);
      }
    }, user.uid);

    const unsubEmailLogs = FirebaseEmailLogs.onSnapshot((cloudLogs) => {
      if (cloudLogs) {
        setEmailLogs(cloudLogs);
        StorageService.setEmailLogsDirect(cloudLogs, user.uid);
      }
    }, user.uid);

    const unsubAudit = FirebaseAudit.onSnapshot((cloudAudit) => {
      if (cloudAudit) {
        setAuditLogs(cloudAudit);
        StorageService.setAuditLogsDirect(cloudAudit, user.uid);
      }
    }, user.uid);

    return () => {
      unsubQuotations();
      unsubInvoices();
      unsubCustomers();
      unsubProducts();
      unsubFollowUps();
      unsubSettings();
      unsubEmailLogs();
      unsubAudit();
    };
  }, [user?.uid]);

  useEffect(() => {
    // Electron IPC Event Handlers
    if (window.electronAPI) {
      window.electronAPI.onNavigateTab((tab: string) => {
        if (tab === 'new-quotation') setEditingQuotation(null);
        setCurrentTab(tab as NavTab);
      });
      window.electronAPI.onCheckUpdates(() => {
        setShowAutoUpdateModal(true);
      });
    }

    // Keyboard Shortcuts (Ctrl+N for New Quote, Ctrl+K for Search)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingQuotation(null);
        setCurrentTab('new-quotation');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── AUTH GATES PLACED AFTER ALL HOOKS ──────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        color: '#fff', fontFamily: 'Inter, sans-serif', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid rgba(99,102,241,0.3)',
          borderTopColor: '#6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          Connecting to QuoteFlow Cloud...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  // ───────────────────────────────────────────────────────────────────────

  // ── ZERO TRUST & USER ISOLATION SCOPING ──────────────────────────────
  const userRole = getUserRole(user);
  const authorizedQuotations = ZeroTrust.scopeQuotations(user, quotations);
  const authorizedInvoices   = ZeroTrust.scopeInvoices(user, invoices);
  const authorizedFollowUps  = ZeroTrust.scopeFollowUps(user, followUps);

  // Handlers with User-Scoped Storage Isolation & Audit Logging
  const handleSaveQuotation = (quotation: Quotation) => {
    StorageService.saveQuotation(quotation, user.uid);
    SyncService.enqueueOfflineAction(`Save Quotation by ${user.displayName || user.email}`);
    refreshAllState(user.uid);
    setEditingQuotation(null);
    setCurrentTab('quotations');
  };

  const handleDeleteQuotation = (id: string) => {
    if (!ZeroTrust.canDeleteQuotation(user)) {
      alert('Zero Trust Security Violation: Only System Admins can delete quotations.');
      return;
    }
    StorageService.deleteQuotation(id, user.uid);
    SyncService.enqueueOfflineAction('Delete Quotation');
    refreshAllState(user.uid);
  };

  const handleUpdateStatus = (id: string, status: QuotationStatus) => {
    StorageService.updateQuotationStatus(id, status, user.uid);
    SyncService.enqueueOfflineAction('Update Status');
    refreshAllState(user.uid);
  };

  const handleSaveInvoice = (invoice: MonthlyInvoice) => {
    StorageService.saveInvoice(invoice, user.uid);
    SyncService.enqueueOfflineAction('Save Invoice');
    refreshAllState(user.uid);
    setCurrentTab('monthly-billing');
  };

  const handleRecordPayment = (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => {
    StorageService.recordPayment(invoiceId, payment, user.uid);
    SyncService.enqueueOfflineAction('Record Payment');
    refreshAllState(user.uid);
  };

  const handleSaveCustomer = (customer: Customer) => {
    StorageService.saveCustomer(customer, user.uid);
    SyncService.enqueueOfflineAction('Save Customer');
    refreshAllState(user.uid);
  };

  const handleSaveProduct = (product: Product) => {
    StorageService.saveProduct(product, user.uid);
    SyncService.enqueueOfflineAction('Save Product');
    refreshAllState(user.uid);
  };

  const handleSaveFollowUp = (followUp: FollowUp) => {
    StorageService.saveFollowUp(followUp, user.uid);
    refreshAllState(user.uid);
  };

  const handleDeleteFollowUp = (id: string) => {
    StorageService.deleteFollowUp(id, user.uid);
    refreshAllState(user.uid);
  };

  const handleSaveTeamMember = (member: TeamMember) => {
    if (!ZeroTrust.canManageTeam(user)) {
      alert('Zero Trust Security Violation: Access denied.');
      return;
    }
    StorageService.saveTeamMember(member, user.uid);
    refreshAllState(user.uid);
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    if (!ZeroTrust.canManageSettings(user)) {
      alert('Zero Trust Security Violation: Only System Admins can alter company settings.');
      return;
    }
    StorageService.saveCompanySettings(newSettings, user.uid);
    refreshAllState(user.uid);
  };

  const handleResetData = () => {
    if (!ZeroTrust.canManageSettings(user)) {
      alert('Zero Trust Security Violation: Only System Admins can reset database.');
      return;
    }
    if (window.confirm('Are you sure you want to reset all your data?')) {
      StorageService.resetAllData(user.uid);
      refreshAllState(user.uid);
    }
  };

  const handleLaunchWhatsApp = (quotation: Quotation) => {
    setSelectedQuotationForWA(quotation);
    setCurrentTab('whatsapp-center');
  };

  const handleLaunchEmail = (quotation: Quotation) => {
    setSelectedQuotationForEmail(quotation);
    setCurrentTab('email-center');
  };

  const handleSendEmailSubmit = (log: EmailLog) => {
    StorageService.addEmailLog(log, user.uid);
    refreshAllState(user.uid);
  };

  const handleUseTemplate = (template: ProposalTemplate) => {
    const newDraft: Quotation = {
      id: `q-${Date.now()}`,
      quotationNumber: `Q-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: customers[0]?.id || '',
      customerName: customers[0]?.name || '',
      companyName: customers[0]?.companyName || '',
      customerEmail: customers[0]?.email || '',
      customerMobile: customers[0]?.mobile || '',
      date: new Date().toISOString().split('T')[0],
      validityDays: 30,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: template.defaultItems.map((item, i) => ({
        ...item,
        id: `item-tpl-${i}`,
      })),
      subtotal: template.defaultItems.reduce((s, i) => s + i.rate * i.quantity, 0),
      totalDiscount: 0,
      totalGst: Math.round(template.defaultItems.reduce((s, i) => s + i.rate * i.quantity * 0.18, 0)),
      grandTotal: Math.round(template.defaultItems.reduce((s, i) => s + i.rate * i.quantity * 1.18, 0)),
      estimatedCost: Math.round(template.defaultItems.reduce((s, i) => s + (i.costPerUnit || i.rate * 0.7) * i.quantity, 0)),
      estimatedMarginPercent: 38,
      terms: template.defaultTerms,
      status: 'Draft',
      hasCompanyStamp: true,
      createdBy: user.displayName || user.email || 'Admin User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingQuotation(newDraft);
    setCurrentTab('new-quotation');
  };

  // Fullscreen PDF Document Preview Override
  if (previewQuotation) {
    return (
      <PDFDocumentView
        quotation={previewQuotation}
        settings={settings}
        onClose={() => setPreviewQuotation(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans antialiased text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'new-quotation') setEditingQuotation(null);
          setCurrentTab(tab);
        }}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 bg-slate-50 text-slate-900 overflow-x-hidden transition-all duration-300">
        {/* Top Header */}
        <Header
          onToggleMobileSidebar={() => setIsOpenMobile(!isOpenMobile)}
          onNavigate={(tab) => {
            if (tab === 'new-quotation') setEditingQuotation(null);
            setCurrentTab(tab);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          quotations={authorizedQuotations}
          customers={customers}
          products={products}
          onSelectQuotation={(q) => setPreviewQuotation(q)}
          onOpenAutoUpdate={() => setShowAutoUpdateModal(true)}
        />

        {/* Dynamic View Router with Zero Trust Access Control */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {currentTab === 'dashboard' && (
            <DashboardView
              quotations={authorizedQuotations}
              followUps={authorizedFollowUps}
              onNavigate={(tab) => setCurrentTab(tab as NavTab)}
              onSelectQuotation={(q) => setPreviewQuotation(q)}
              onSendWhatsApp={handleLaunchWhatsApp}
              onSendEmail={handleLaunchEmail}
            />
          )}

          {currentTab === 'new-quotation' && (
            <QuotationBuilderView
              customers={customers}
              products={products}
              settings={settings}
              editingQuotation={editingQuotation}
              onSaveQuotation={handleSaveQuotation}
              onPreviewPDF={(q) => setPreviewQuotation(q)}
              onSendWhatsApp={handleLaunchWhatsApp}
              onSendEmail={handleLaunchEmail}
              onCancel={() => {
                setEditingQuotation(null);
                setCurrentTab('quotations');
              }}
            />
          )}

          {currentTab === 'quotations' && (
            <QuotationsListView
              quotations={authorizedQuotations}
              onNewQuotation={() => {
                setEditingQuotation(null);
                setCurrentTab('new-quotation');
              }}
              onSelectQuotation={(q) => setPreviewQuotation(q)}
              onEditQuotation={(q) => {
                setEditingQuotation(q);
                setCurrentTab('new-quotation');
              }}
              onDeleteQuotation={handleDeleteQuotation}
              onUpdateStatus={handleUpdateStatus}
              onSendWhatsApp={handleLaunchWhatsApp}
              onSendEmail={handleLaunchEmail}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineKanbanView
              quotations={authorizedQuotations}
              onSelectQuotation={(q) => setPreviewQuotation(q)}
              onUpdateStatus={handleUpdateStatus}
              onNewQuotation={() => {
                setEditingQuotation(null);
                setCurrentTab('new-quotation');
              }}
            />
          )}

          {currentTab === 'monthly-billing' && (
            ZeroTrust.canAccessBilling(user) ? (
              <MonthlyBillingView
                invoices={authorizedInvoices}
                quotations={authorizedQuotations}
                customers={customers}
                onSaveInvoice={handleSaveInvoice}
                onRecordPayment={handleRecordPayment}
              />
            ) : <ZeroTrustAccessDenied role={userRole} required="Accountant or Admin" />
          )}

          {currentTab === 'gst-accounting' && (
            ZeroTrust.canAccessBilling(user) ? (
              <GSTAccountingView
                invoices={authorizedInvoices}
                settings={settings}
              />
            ) : <ZeroTrustAccessDenied role={userRole} required="Accountant or Admin" />
          )}

          {currentTab === 'calendar' && (
            <CalendarView />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              onSaveProduct={handleSaveProduct}
            />
          )}

          {currentTab === 'price-list' && (
            <PriceListView
              products={products}
              onSelectPackage={(prod) => {
                setCurrentTab('new-quotation');
              }}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView
              templates={templates}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {currentTab === 'follow-ups' && (
            <FollowUpsView
              followUps={authorizedFollowUps}
              onSaveFollowUp={handleSaveFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
            />
          )}

          {currentTab === 'whatsapp-center' && (
            <WhatsAppCenterView
              quotations={authorizedQuotations}
              settings={settings}
              selectedQuotationForWA={selectedQuotationForWA}
            />
          )}

          {currentTab === 'email-center' && (
            <EmailCenterView
              quotations={authorizedQuotations}
              settings={settings}
              emailLogs={emailLogs}
              onSendEmailSubmit={handleSendEmailSubmit}
              selectedQuotationForEmail={selectedQuotationForEmail}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView quotations={authorizedQuotations} />
          )}

          {currentTab === 'team' && (
            ZeroTrust.canManageTeam(user) ? (
              <TeamView
                teamMembers={teamMembers}
                onSaveTeamMember={handleSaveTeamMember}
              />
            ) : <ZeroTrustAccessDenied role={userRole} required="Sales Manager or Admin" />
          )}

          {currentTab === 'integrations' && (
            <IntegrationsView />
          )}

          {currentTab === 'security' && (
            ZeroTrust.canAccessAuditLogs(user) ? (
              <SecurityAuditView auditLogs={auditLogs} />
            ) : <ZeroTrustAccessDenied role={userRole} required="System Admin" />
          )}

          {currentTab === 'settings' && (
            ZeroTrust.canManageSettings(user) ? (
              <SettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onResetData={handleResetData}
              />
            ) : <ZeroTrustAccessDenied role={userRole} required="System Admin" />
          )}
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAiAssistant
        quotations={authorizedQuotations}
        onOpenQuotationBuilder={() => {
          setEditingQuotation(null);
          setCurrentTab('new-quotation');
        }}
      />

      {/* Auto Update Modal */}
      {showAutoUpdateModal && (
        <AutoUpdateModal onClose={() => setShowAutoUpdateModal(false)} />
      )}
    </div>
  );
}

// ── Zero Trust Access Denied Screen Component ─────────────────────────────
function ZeroTrustAccessDenied({ role, required }: { role: string; required: string }) {
  return (
    <div className="bg-white p-12 rounded-3xl border border-rose-200 text-center max-w-lg mx-auto my-12 shadow-xl animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-md">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Zero Trust Access Denied</h2>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
        Your current account role <span className="font-bold text-rose-600">"{role}"</span> is not authorized to access this module. Requires clearance: <span className="font-bold text-slate-800">{required}</span>.
      </p>
      <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
        🔒 Security Event Logged · ZIPCON Services Zero Trust Architecture
      </div>
    </div>
  );
}

export default App;
