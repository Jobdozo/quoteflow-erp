import {
  Quotation,
  Customer,
  Product,
  ProposalTemplate,
  FollowUp,
  EmailLog,
  WhatsAppLog,
  TeamMember,
  CompanySettings,
  QuotationStatus,
  MonthlyInvoice,
  PaymentRecord,
  AuditLog,
  CalendarEvent,
} from '../types';
import { initialCompanySettings } from '../data/mockData';

const KEYS = {
  QUOTATIONS: 'quoteflow_quotations',
  INVOICES: 'quoteflow_invoices',
  CUSTOMERS: 'quoteflow_customers',
  PRODUCTS: 'quoteflow_products',
  TEMPLATES: 'quoteflow_templates',
  FOLLOW_UPS: 'quoteflow_follow_ups',
  EMAIL_LOGS: 'quoteflow_email_logs',
  WHATSAPP_LOGS: 'quoteflow_whatsapp_logs',
  TEAM_MEMBERS: 'quoteflow_team_members',
  SETTINGS: 'quoteflow_settings',
  AUDIT_LOGS: 'quoteflow_audit_logs',
  EVENTS: 'quoteflow_events',
  CLEAN_FLAG: 'quoteflow_seeded_data_purged_v1',
};

// Auto purge legacy seeded mock data once on boot
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(KEYS.CLEAN_FLAG)) {
      localStorage.removeItem(KEYS.QUOTATIONS);
      localStorage.removeItem(KEYS.INVOICES);
      localStorage.removeItem(KEYS.CUSTOMERS);
      localStorage.removeItem(KEYS.PRODUCTS);
      localStorage.removeItem(KEYS.FOLLOW_UPS);
      localStorage.removeItem(KEYS.TEAM_MEMBERS);
      localStorage.removeItem(KEYS.AUDIT_LOGS);
      localStorage.setItem(KEYS.CLEAN_FLAG, 'true');
    }
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from LocalStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to LocalStorage:`, error);
  }
}

export const StorageService = {
  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getItem(KEYS.AUDIT_LOGS, []);
  },
  addAuditLog(action: string, module: string): AuditLog[] {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: 'User',
      action,
      module,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.45',
    };
    logs.unshift(newLog);
    setItem(KEYS.AUDIT_LOGS, logs);
    return logs;
  },

  // Quotations
  getQuotations(): Quotation[] {
    return getItem(KEYS.QUOTATIONS, []);
  },
  saveQuotation(quotation: Quotation): Quotation[] {
    const list = this.getQuotations();
    const existingIndex = list.findIndex((q) => q.id === quotation.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...quotation, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(quotation);
    }
    setItem(KEYS.QUOTATIONS, list);
    this.addAuditLog(
      `${existingIndex >= 0 ? 'Updated' : 'Created'} Quotation ${quotation.quotationNumber} (${quotation.companyName})`,
      'Quotations CRM'
    );
    return list;
  },
  deleteQuotation(id: string): Quotation[] {
    const list = this.getQuotations();
    const q = list.find((item) => item.id === id);
    const updated = list.filter((item) => item.id !== id);
    setItem(KEYS.QUOTATIONS, updated);
    if (q) {
      this.addAuditLog(`Deleted Quotation ${q.quotationNumber}`, 'Quotations CRM');
    }
    return updated;
  },
  updateQuotationStatus(id: string, status: QuotationStatus): Quotation[] {
    const list = this.getQuotations();
    const q = list.find((item) => item.id === id);
    if (q) {
      q.status = status;
      q.updatedAt = new Date().toISOString();
      setItem(KEYS.QUOTATIONS, list);
      this.addAuditLog(`Updated Status for ${q.quotationNumber} -> ${status}`, 'Quotations CRM');
    }
    return list;
  },

  // Invoices & Monthly Billing
  getInvoices(): MonthlyInvoice[] {
    return getItem(KEYS.INVOICES, []);
  },
  saveInvoice(invoice: MonthlyInvoice): MonthlyInvoice[] {
    const list = this.getInvoices();
    const index = list.findIndex((inv) => inv.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.unshift(invoice);
    }
    setItem(KEYS.INVOICES, list);
    this.addAuditLog(`Generated Invoice ${invoice.invoiceNumber} for ${invoice.companyName}`, 'Monthly Billing');
    return list;
  },
  recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id'>): MonthlyInvoice[] {
    const list = this.getInvoices();
    const invoice = list.find((inv) => inv.id === invoiceId);
    if (invoice) {
      const newPayment: PaymentRecord = {
        ...payment,
        id: `pay-${Date.now()}`,
      };
      if (!invoice.payments) invoice.payments = [];
      invoice.payments.push(newPayment);
      invoice.paidAmount = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;
      if (invoice.balanceDue <= 0) {
        invoice.status = 'Paid';
      } else if (invoice.paidAmount > 0) {
        invoice.status = 'Partially Paid';
      }
      setItem(KEYS.INVOICES, list);
      this.addAuditLog(`Recorded ₹${payment.amountPaid} Payment for Invoice ${invoice.invoiceNumber}`, 'Monthly Billing');
    }
    return list;
  },

  // Customers (CRM)
  getCustomers(): Customer[] {
    return getItem(KEYS.CUSTOMERS, []);
  },
  saveCustomer(customer: Customer): Customer[] {
    const list = this.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    setItem(KEYS.CUSTOMERS, list);
    this.addAuditLog(`Saved Customer: ${customer.companyName}`, 'Customers CRM');
    return list;
  },

  // Products & Rate Card
  getProducts(): Product[] {
    return getItem(KEYS.PRODUCTS, []);
  },
  saveProduct(product: Product): Product[] {
    const list = this.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    setItem(KEYS.PRODUCTS, list);
    this.addAuditLog(`Saved Product: ${product.name}`, 'Product Catalog');
    return list;
  },

  // Proposal Templates
  getTemplates(): ProposalTemplate[] {
    return getItem(KEYS.TEMPLATES, []);
  },

  // Follow Ups
  getFollowUps(): FollowUp[] {
    return getItem(KEYS.FOLLOW_UPS, []);
  },
  saveFollowUp(followUp: FollowUp): FollowUp[] {
    const list = this.getFollowUps();
    const index = list.findIndex((f) => f.id === followUp.id);
    if (index >= 0) {
      list[index] = followUp;
    } else {
      list.unshift(followUp);
    }
    setItem(KEYS.FOLLOW_UPS, list);
    this.addAuditLog(`Scheduled Follow-up for ${followUp.companyName}`, 'Calendar & Follow-ups');
    return list;
  },
  deleteFollowUp(id: string): FollowUp[] {
    const list = this.getFollowUps();
    const updated = list.filter((f) => f.id !== id);
    setItem(KEYS.FOLLOW_UPS, updated);
    return updated;
  },

  // Email Logs
  getEmailLogs(): EmailLog[] {
    return getItem(KEYS.EMAIL_LOGS, []);
  },
  addEmailLog(log: EmailLog): EmailLog[] {
    const list = this.getEmailLogs();
    list.unshift(log);
    setItem(KEYS.EMAIL_LOGS, list);
    this.addAuditLog(`Dispatched Email to ${log.customerEmail} for ${log.quotationNumber}`, 'Email Center');
    return list;
  },

  // WhatsApp Logs
  getWhatsAppLogs(): WhatsAppLog[] {
    return getItem(KEYS.WHATSAPP_LOGS, []);
  },
  addWhatsAppLog(log: WhatsAppLog): WhatsAppLog[] {
    const list = this.getWhatsAppLogs();
    list.unshift(log);
    setItem(KEYS.WHATSAPP_LOGS, list);
    this.addAuditLog(`Sent WhatsApp message to ${log.customerMobile} for ${log.quotationNumber}`, 'WhatsApp Center');
    return list;
  },

  // Team Members
  getTeamMembers(): TeamMember[] {
    return getItem(KEYS.TEAM_MEMBERS, []);
  },
  saveTeamMember(member: TeamMember): TeamMember[] {
    const list = this.getTeamMembers();
    const index = list.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      list[index] = member;
    } else {
      list.unshift(member);
    }
    setItem(KEYS.TEAM_MEMBERS, list);
    this.addAuditLog(`Updated Team Member Role: ${member.name} (${member.role})`, 'Team Members');
    return list;
  },

  // Company Settings
  getCompanySettings(): CompanySettings {
    const s = getItem(KEYS.SETTINGS, initialCompanySettings);
    if (!s.logoUrl || s.logoUrl.includes('unsplash')) {
      s.logoUrl = '/zipcon_logo.png';
      setItem(KEYS.SETTINGS, s);
    }
    return s;
  },
  saveCompanySettings(settings: CompanySettings): CompanySettings {
    setItem(KEYS.SETTINGS, settings);
    this.addAuditLog(`Updated Company Settings & Bank Credentials`, 'Settings');
    return settings;
  },

  resetAllData(): void {
    localStorage.removeItem(KEYS.QUOTATIONS);
    localStorage.removeItem(KEYS.INVOICES);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.PRODUCTS);
    localStorage.removeItem(KEYS.TEMPLATES);
    localStorage.removeItem(KEYS.FOLLOW_UPS);
    localStorage.removeItem(KEYS.EMAIL_LOGS);
    localStorage.removeItem(KEYS.WHATSAPP_LOGS);
    localStorage.removeItem(KEYS.TEAM_MEMBERS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.setItem(KEYS.CLEAN_FLAG, 'true');
  },
};
