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
  Integration,
} from '../types';
import { initialCompanySettings } from '../data/mockData';

const BASE_KEYS = {
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
  INTEGRATIONS: 'quoteflow_integrations',
  CLEAN_FLAG: 'quoteflow_seeded_data_purged_v3',
};

// Auto purge legacy seeded mock data once on boot
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem(BASE_KEYS.CLEAN_FLAG)) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('quoteflow_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(BASE_KEYS.CLEAN_FLAG, 'true');
    }
  } catch (e) {
    console.warn('Storage purge error:', e);
  }
}

function getScopedKey(baseKey: string, userId?: string): string {
  if (!userId) return baseKey;
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${baseKey}_user_${safeId}`;
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
  // Enterprise Integrations
  getIntegrations(userId?: string): Record<string, any> {
    return getItem(getScopedKey(BASE_KEYS.INTEGRATIONS, userId), {});
  },
  saveIntegration(id: string, config: any, userId?: string): Record<string, any> {
    const key = getScopedKey(BASE_KEYS.INTEGRATIONS, userId);
    const current = getItem<Record<string, any>>(key, {});
    current[id] = config;
    setItem(key, current);
    this.addAuditLog(`Updated Integration Config for ${id}`, 'Integrations Hub', userId);
    return current;
  },

  // Calendar Events
  getEvents(userId?: string): CalendarEvent[] {
    return getItem(getScopedKey(BASE_KEYS.EVENTS, userId), []);
  },
  saveEvent(event: CalendarEvent, userId?: string): CalendarEvent[] {
    const key = getScopedKey(BASE_KEYS.EVENTS, userId);
    const list = getItem<CalendarEvent[]>(key, []);
    const index = list.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      list[index] = event;
    } else {
      list.unshift(event);
    }
    setItem(key, list);
    this.addAuditLog(`Scheduled Event: ${event.title}`, 'Calendar & Schedules', userId);
    return list;
  },
  deleteEvent(id: string, userId?: string): CalendarEvent[] {
    const key = getScopedKey(BASE_KEYS.EVENTS, userId);
    const list = getItem<CalendarEvent[]>(key, []);
    const updated = list.filter((e) => e.id !== id);
    setItem(key, updated);
    return updated;
  },

  // Audit Logs
  getAuditLogs(userId?: string): AuditLog[] {
    return getItem(getScopedKey(BASE_KEYS.AUDIT_LOGS, userId), []);
  },
  addAuditLog(action: string, module: string, userId?: string): AuditLog[] {
    const key = getScopedKey(BASE_KEYS.AUDIT_LOGS, userId);
    const logs = getItem<AuditLog[]>(key, []);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: userId || 'Authenticated User',
      action,
      module,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.45',
    };
    logs.unshift(newLog);
    setItem(key, logs);
    return logs;
  },

  // Quotations
  getQuotations(userId?: string): Quotation[] {
    return getItem(getScopedKey(BASE_KEYS.QUOTATIONS, userId), []);
  },
  saveQuotation(quotation: Quotation, userId?: string): Quotation[] {
    const key = getScopedKey(BASE_KEYS.QUOTATIONS, userId);
    const list = getItem<Quotation[]>(key, []);
    const existingIndex = list.findIndex((q) => q.id === quotation.id);

    if (existingIndex >= 0) {
      list[existingIndex] = { ...quotation, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(quotation);
    }
    setItem(key, list);
    this.addAuditLog(
      `${existingIndex >= 0 ? 'Updated' : 'Created'} Quotation ${quotation.quotationNumber} (${quotation.companyName})`,
      'Quotations CRM',
      userId
    );
    return list;
  },
  deleteQuotation(id: string, userId?: string): Quotation[] {
    const key = getScopedKey(BASE_KEYS.QUOTATIONS, userId);
    const list = getItem<Quotation[]>(key, []);
    const q = list.find((item) => item.id === id);
    const updated = list.filter((item) => item.id !== id);
    setItem(key, updated);
    if (q) {
      this.addAuditLog(`Deleted Quotation ${q.quotationNumber}`, 'Quotations CRM', userId);
    }
    return updated;
  },
  updateQuotationStatus(id: string, status: QuotationStatus, userId?: string): Quotation[] {
    const key = getScopedKey(BASE_KEYS.QUOTATIONS, userId);
    const list = getItem<Quotation[]>(key, []);
    const q = list.find((item) => item.id === id);
    if (q) {
      q.status = status;
      q.updatedAt = new Date().toISOString();
      setItem(key, list);
      this.addAuditLog(`Updated Status for ${q.quotationNumber} -> ${status}`, 'Quotations CRM', userId);
    }
    return list;
  },

  // Invoices & Monthly Billing
  getInvoices(userId?: string): MonthlyInvoice[] {
    return getItem(getScopedKey(BASE_KEYS.INVOICES, userId), []);
  },
  saveInvoice(invoice: MonthlyInvoice, userId?: string): MonthlyInvoice[] {
    const key = getScopedKey(BASE_KEYS.INVOICES, userId);
    const list = getItem<MonthlyInvoice[]>(key, []);
    const index = list.findIndex((inv) => inv.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.unshift(invoice);
    }
    setItem(key, list);
    this.addAuditLog(`Generated Invoice ${invoice.invoiceNumber} for ${invoice.companyName}`, 'Monthly Billing', userId);
    return list;
  },
  recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id'>, userId?: string): MonthlyInvoice[] {
    const key = getScopedKey(BASE_KEYS.INVOICES, userId);
    const list = getItem<MonthlyInvoice[]>(key, []);
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
      setItem(key, list);
      this.addAuditLog(`Recorded ₹${payment.amountPaid} Payment for Invoice ${invoice.invoiceNumber}`, 'Monthly Billing', userId);
    }
    return list;
  },

  // Customers (CRM)
  getCustomers(userId?: string): Customer[] {
    return getItem(getScopedKey(BASE_KEYS.CUSTOMERS, userId), []);
  },
  saveCustomer(customer: Customer, userId?: string): Customer[] {
    const key = getScopedKey(BASE_KEYS.CUSTOMERS, userId);
    const list = getItem<Customer[]>(key, []);
    const index = list.findIndex((c) => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    setItem(key, list);
    this.addAuditLog(`Saved Customer: ${customer.companyName}`, 'Customers CRM', userId);
    return list;
  },

  // Products & Rate Card
  getProducts(userId?: string): Product[] {
    return getItem(getScopedKey(BASE_KEYS.PRODUCTS, userId), []);
  },
  saveProduct(product: Product, userId?: string): Product[] {
    const key = getScopedKey(BASE_KEYS.PRODUCTS, userId);
    const list = getItem<Product[]>(key, []);
    const index = list.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    setItem(key, list);
    this.addAuditLog(`Saved Product: ${product.name}`, 'Product Catalog', userId);
    return list;
  },

  // Proposal Templates
  getTemplates(userId?: string): ProposalTemplate[] {
    return getItem(getScopedKey(BASE_KEYS.TEMPLATES, userId), []);
  },

  // Follow Ups
  getFollowUps(userId?: string): FollowUp[] {
    return getItem(getScopedKey(BASE_KEYS.FOLLOW_UPS, userId), []);
  },
  saveFollowUp(followUp: FollowUp, userId?: string): FollowUp[] {
    const key = getScopedKey(BASE_KEYS.FOLLOW_UPS, userId);
    const list = getItem<FollowUp[]>(key, []);
    const index = list.findIndex((f) => f.id === followUp.id);
    if (index >= 0) {
      list[index] = followUp;
    } else {
      list.unshift(followUp);
    }
    setItem(key, list);
    this.addAuditLog(`Scheduled Follow-up for ${followUp.companyName}`, 'Calendar & Follow-ups', userId);
    return list;
  },
  deleteFollowUp(id: string, userId?: string): FollowUp[] {
    const key = getScopedKey(BASE_KEYS.FOLLOW_UPS, userId);
    const list = getItem<FollowUp[]>(key, []);
    const updated = list.filter((f) => f.id !== id);
    setItem(key, updated);
    return updated;
  },

  // Email Logs
  getEmailLogs(userId?: string): EmailLog[] {
    return getItem(getScopedKey(BASE_KEYS.EMAIL_LOGS, userId), []);
  },
  addEmailLog(log: EmailLog, userId?: string): EmailLog[] {
    const key = getScopedKey(BASE_KEYS.EMAIL_LOGS, userId);
    const list = getItem<EmailLog[]>(key, []);
    list.unshift(log);
    setItem(key, list);
    this.addAuditLog(`Dispatched Email to ${log.customerEmail} for ${log.quotationNumber}`, 'Email Center', userId);
    return list;
  },

  // WhatsApp Logs
  getWhatsAppLogs(userId?: string): WhatsAppLog[] {
    return getItem(getScopedKey(BASE_KEYS.WHATSAPP_LOGS, userId), []);
  },
  addWhatsAppLog(log: WhatsAppLog, userId?: string): WhatsAppLog[] {
    const key = getScopedKey(BASE_KEYS.WHATSAPP_LOGS, userId);
    const list = getItem<WhatsAppLog[]>(key, []);
    list.unshift(log);
    setItem(key, list);
    this.addAuditLog(`Sent WhatsApp message to ${log.customerMobile} for ${log.quotationNumber}`, 'WhatsApp Center', userId);
    return list;
  },

  // Team Members
  getTeamMembers(userId?: string): TeamMember[] {
    return getItem(getScopedKey(BASE_KEYS.TEAM_MEMBERS, userId), []);
  },
  saveTeamMember(member: TeamMember, userId?: string): TeamMember[] {
    const key = getScopedKey(BASE_KEYS.TEAM_MEMBERS, userId);
    const list = getItem<TeamMember[]>(key, []);
    const index = list.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      list[index] = member;
    } else {
      list.unshift(member);
    }
    setItem(key, list);
    this.addAuditLog(`Updated Team Member Role: ${member.name} (${member.role})`, 'Team Members', userId);
    return list;
  },

  // Company Settings
  getCompanySettings(userId?: string): CompanySettings {
    const key = getScopedKey(BASE_KEYS.SETTINGS, userId);
    return getItem(key, initialCompanySettings);
  },
  saveCompanySettings(settings: CompanySettings, userId?: string): CompanySettings {
    const key = getScopedKey(BASE_KEYS.SETTINGS, userId);
    setItem(key, settings);
    this.addAuditLog(`Updated Company Settings & Bank Credentials`, 'Settings', userId);
    return settings;
  },

  resetAllData(userId?: string): void {
    const keys = Object.values(BASE_KEYS).map((k) => getScopedKey(k, userId));
    keys.forEach((k) => localStorage.removeItem(k));
  },
};
