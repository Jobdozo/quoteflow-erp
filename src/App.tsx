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

import { StorageService } from './utils/storage';
import { SyncService } from './services/SyncService';
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
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain States loaded from StorageService
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<MonthlyInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(StorageService.getCompanySettings());

  // Modal / Selection states
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationForWA, setSelectedQuotationForWA] = useState<Quotation | null>(null);
  const [selectedQuotationForEmail, setSelectedQuotationForEmail] = useState<Quotation | null>(null);
  const [showAutoUpdateModal, setShowAutoUpdateModal] = useState(false);

  // Sync state helper to reflect cross-module updates instantly
  const refreshAllState = () => {
    setQuotations(StorageService.getQuotations());
    setInvoices(StorageService.getInvoices());
    setCustomers(StorageService.getCustomers());
    setProducts(StorageService.getProducts());
    setTemplates(StorageService.getTemplates());
    setFollowUps(StorageService.getFollowUps());
    setEmailLogs(StorageService.getEmailLogs());
    setTeamMembers(StorageService.getTeamMembers());
    setAuditLogs(StorageService.getAuditLogs());
    setSettings(StorageService.getCompanySettings());
  };

  useEffect(() => {
    refreshAllState();

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

  // Handlers with automatic cross-module synchronization
  const handleSaveQuotation = (quotation: Quotation) => {
    StorageService.saveQuotation(quotation);
    SyncService.enqueueOfflineAction('Save Quotation');
    refreshAllState();
    setEditingQuotation(null);
    setCurrentTab('quotations');
  };

  const handleDeleteQuotation = (id: string) => {
    StorageService.deleteQuotation(id);
    SyncService.enqueueOfflineAction('Delete Quotation');
    refreshAllState();
  };

  const handleUpdateStatus = (id: string, status: QuotationStatus) => {
    StorageService.updateQuotationStatus(id, status);
    SyncService.enqueueOfflineAction('Update Status');
    refreshAllState();
  };

  const handleSaveInvoice = (invoice: MonthlyInvoice) => {
    StorageService.saveInvoice(invoice);
    SyncService.enqueueOfflineAction('Save Invoice');
    refreshAllState();
    setCurrentTab('monthly-billing');
  };

  const handleRecordPayment = (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => {
    StorageService.recordPayment(invoiceId, payment);
    SyncService.enqueueOfflineAction('Record Payment');
    refreshAllState();
  };

  const handleSaveCustomer = (customer: Customer) => {
    StorageService.saveCustomer(customer);
    SyncService.enqueueOfflineAction('Save Customer');
    refreshAllState();
  };

  const handleSaveProduct = (product: Product) => {
    StorageService.saveProduct(product);
    SyncService.enqueueOfflineAction('Save Product');
    refreshAllState();
  };

  const handleSaveFollowUp = (followUp: FollowUp) => {
    StorageService.saveFollowUp(followUp);
    refreshAllState();
  };

  const handleDeleteFollowUp = (id: string) => {
    StorageService.deleteFollowUp(id);
    refreshAllState();
  };

  const handleSaveTeamMember = (member: TeamMember) => {
    StorageService.saveTeamMember(member);
    refreshAllState();
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    StorageService.saveCompanySettings(newSettings);
    refreshAllState();
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to default demo state?')) {
      StorageService.resetAllData();
      refreshAllState();
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
      createdBy: 'Ankit Sharma',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingQuotation(newDraft);
    setCurrentTab('new-quotation');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
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

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleMobileSidebar={() => setIsOpenMobile(!isOpenMobile)}
          onNavigate={(tab) => {
            if (tab === 'new-quotation') setEditingQuotation(null);
            setCurrentTab(tab);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          quotations={quotations}
          customers={customers}
          products={products}
          onSelectQuotation={(q) => setPreviewQuotation(q)}
          onOpenAutoUpdate={() => setShowAutoUpdateModal(true)}
        />

        {/* View Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              quotations={quotations}
              followUps={followUps}
              onNavigate={(tab) => {
                if (tab === 'new-quotation') setEditingQuotation(null);
                setCurrentTab(tab);
              }}
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
              onCancel={() => setCurrentTab('quotations')}
            />
          )}

          {currentTab === 'quotations' && (
            <QuotationsListView
              quotations={quotations}
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
              quotations={quotations}
              onSelectQuotation={(q) => setPreviewQuotation(q)}
              onUpdateStatus={handleUpdateStatus}
              onNewQuotation={() => {
                setEditingQuotation(null);
                setCurrentTab('new-quotation');
              }}
            />
          )}

          {currentTab === 'monthly-billing' && (
            <MonthlyBillingView
              invoices={invoices}
              quotations={quotations}
              customers={customers}
              onSaveInvoice={handleSaveInvoice}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {currentTab === 'gst-accounting' && (
            <GSTAccountingView invoices={invoices} settings={settings} />
          )}

          {currentTab === 'calendar' && <CalendarView />}

          {currentTab === 'customers' && (
            <CustomersView customers={customers} onSaveCustomer={handleSaveCustomer} />
          )}

          {currentTab === 'products' && (
            <ProductsView products={products} onSaveProduct={handleSaveProduct} />
          )}

          {currentTab === 'price-list' && (
            <PriceListView
              products={products}
              onSelectPackage={(p) => {
                handleUseTemplate({
                  id: `tpl-${Date.now()}`,
                  title: p.name,
                  category: p.category,
                  description: p.description,
                  defaultItems: [
                    {
                      name: p.name,
                      description: p.description,
                      unit: p.unit,
                      quantity: 1,
                      rate: p.rate,
                      discount: 0,
                      gstRate: p.gstRate,
                      total: Math.round(p.rate * (1 + p.gstRate / 100)),
                      costPerUnit: p.costPrice,
                    },
                  ],
                  defaultTerms: settings.defaultTerms,
                });
              }}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView templates={templates} onUseTemplate={handleUseTemplate} />
          )}

          {currentTab === 'follow-ups' && (
            <FollowUpsView
              followUps={followUps}
              onSaveFollowUp={handleSaveFollowUp}
              onDeleteFollowUp={handleDeleteFollowUp}
            />
          )}

          {currentTab === 'whatsapp-center' && (
            <WhatsAppCenterView
              quotations={quotations}
              settings={settings}
              selectedQuotationForWA={selectedQuotationForWA}
            />
          )}

          {currentTab === 'email-center' && (
            <EmailCenterView
              quotations={quotations}
              settings={settings}
              emailLogs={emailLogs}
              onSendEmailSubmit={(log) => {
                const updated = StorageService.addEmailLog(log);
                setEmailLogs(updated);
                refreshAllState();
              }}
              selectedQuotationForEmail={selectedQuotationForEmail}
            />
          )}

          {currentTab === 'reports' && <ReportsView quotations={quotations} />}

          {currentTab === 'team' && (
            <TeamView teamMembers={teamMembers} onSaveTeamMember={handleSaveTeamMember} />
          )}

          {currentTab === 'integrations' && <IntegrationsView />}

          {currentTab === 'security' && <SecurityAuditView auditLogs={auditLogs} />}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Floating AI Business Assistant */}
      <FloatingAiAssistant
        quotations={quotations}
        onOpenQuotationBuilder={() => {
          setEditingQuotation(null);
          setCurrentTab('new-quotation');
        }}
      />

      {/* GitHub Auto Update Releases Modal */}
      {showAutoUpdateModal && (
        <AutoUpdateModal onClose={() => setShowAutoUpdateModal(false)} />
      )}

      {/* PDF Document Preview & Download Modal */}
      {previewQuotation && (
        <PDFDocumentView
          quotation={previewQuotation}
          settings={settings}
          onClose={() => setPreviewQuotation(null)}
        />
      )}
    </div>
  );
}

export default App;
