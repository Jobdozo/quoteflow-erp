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
import {
  initialQuotations,
  initialCustomers,
  initialProducts,
  initialTemplates,
  initialFollowUps,
  initialTeamMembers,
  initialCompanySettings,
  initialInvoices,
} from '../data/mockData';

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
};

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
    return getItem(KEYS.AUDIT_LOGS, [
      {
        id: 'log-1',
        user: 'Ankit Sharma (Admin)',
        action: 'Generated Tax Invoice INV-2026-0501',
        module: 'Monthly Billing',
        timestamp: '2026-05-18 10:14:22',
        ipAddress: '192.168.1.45',
      },
      {
        id: 'log-2',
        user: 'Rahul Verma (Sales Mgr)',
        action: 'Updated Quotation Q-2026-124 to Status: Viewed',
        module: 'Quotations CRM',
        timestamp: '2026-05-18 09:30:10',
        ipAddress: '192.168.1.88',
      },
    ]);
  },
  addAuditLog(action: string, module: string): AuditLog[] {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: 'Ankit Sharma (Admin)',
      action,
      module,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.45',
    };
    logs.unshift(newLog);
    setItem(KEYS.AUDIT_LOGS, logs);
    return logs;
  },

  // Quotations with Full Cross-Module Auto Sync
  getQuotations(): Quotation[] {
    return getItem(KEYS.QUOTATIONS, initialQuotations);
  },
  saveQuotation(quotation: Quotation): Quotation[] {
    const list = this.getQuotations();
    const existingIndex = list.findIndex((q) => q.id === quotation.id);
    const isNew = existingIndex < 0;

    if (existingIndex >= 0) {
      list[existingIndex] = { ...quotation, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(quotation);
    }
    setItem(KEYS.QUOTATIONS, list);

    this.addAuditLog(
      `${isNew ? 'Created' : 'Updated'} Quotation ${quotation.quotationNumber} for ${quotation.companyName} (₹${quotation.grandTotal.toLocaleString('en-IN')})`,
      'Quotations'
    );

    const customers = this.getCustomers();
    const custExists = customers.some((c) => c.companyName.toLowerCase() === quotation.companyName.toLowerCase());
    if (!custExists && quotation.companyName) {
      this.saveCustomer({
        id: quotation.customerId || `cust-${Date.now()}`,
        name: quotation.customerName,
        companyName: quotation.companyName,
        gstNumber: quotation.customerGst || '',
        email: quotation.customerEmail,
        mobile: quotation.customerMobile,
        contactPerson: quotation.customerName,
        address: quotation.customerAddress || '',
        notes: `Auto-created from Quotation ${quotation.quotationNumber}`,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }

    if (quotation.status === 'Approved') {
      const invoices = this.getInvoices();
      const invoiceExists = invoices.some((inv) => inv.quotationNumber === quotation.quotationNumber);
      if (!invoiceExists) {
        const taxable = quotation.subtotal - quotation.totalDiscount;
        const cgst = taxable * 0.09;
        const sgst = taxable * 0.09;
        const issueDate = new Date().toISOString().split('T')[0];
        const dueDateObj = new Date();
        dueDateObj.setDate(dueDateObj.getDate() + 15);

        this.saveInvoice({
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          quotationId: quotation.id,
          quotationNumber: quotation.quotationNumber,
          customerId: quotation.customerId,
          customerName: quotation.customerName,
          companyName: quotation.companyName,
          customerGst: quotation.customerGst || 'N/A',
          customerAddress: quotation.customerAddress || quotation.companyName,
          billingMonth: 'Current Month',
          issueDate,
          dueDate: dueDateObj.toISOString().split('T')[0],
          items: quotation.items,
          subtotal: quotation.subtotal,
          totalDiscount: quotation.totalDiscount,
          taxableAmount: taxable,
          cgstAmount: Math.round(cgst),
          sgstAmount: Math.round(sgst),
          igstAmount: 0,
          totalGst: quotation.totalGst,
          totalAmount: quotation.grandTotal,
          paidAmount: 0,
          balanceDue: quotation.grandTotal,
          status: 'Sent',
          payments: [],
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (isNew) {
      const followUps = this.getFollowUps();
      const fuExists = followUps.some((f) => f.quotationNumber === quotation.quotationNumber);
      if (!fuExists) {
        const schedDate = new Date();
        schedDate.setDate(schedDate.getDate() + 2);
        this.saveFollowUp({
          id: `fu-${Date.now()}`,
          quotationId: quotation.id,
          quotationNumber: quotation.quotationNumber,
          customerName: quotation.customerName,
          companyName: quotation.companyName,
          scheduledDate: schedDate.toISOString().split('T')[0],
          type: 'Call',
          status: 'Pending',
          reminderStage: '2 Days',
          notes: `Follow up on proposal feedback for ${quotation.companyName}`,
          amount: quotation.grandTotal,
        });
      }
    }

    return list;
  },

  deleteQuotation(id: string): Quotation[] {
    const list = this.getQuotations().filter((q) => q.id !== id);
    setItem(KEYS.QUOTATIONS, list);
    this.addAuditLog(`Deleted Quotation ID ${id}`, 'Quotations');
    return list;
  },

  updateQuotationStatus(id: string, status: QuotationStatus): Quotation[] {
    const list = this.getQuotations();
    const q = list.find((item) => item.id === id);
    if (q) {
      q.status = status;
      q.updatedAt = new Date().toISOString();
      setItem(KEYS.QUOTATIONS, list);
      this.addAuditLog(`Updated Quotation ${q.quotationNumber} status to ${status}`, 'Pipeline / Quotations');

      if (status === 'Approved') {
        const invoices = this.getInvoices();
        const invoiceExists = invoices.some((inv) => inv.quotationNumber === q.quotationNumber);
        if (!invoiceExists) {
          const taxable = q.subtotal - q.totalDiscount;
          const cgst = taxable * 0.09;
          const sgst = taxable * 0.09;
          const issueDate = new Date().toISOString().split('T')[0];
          const dueDateObj = new Date();
          dueDateObj.setDate(dueDateObj.getDate() + 15);

          this.saveInvoice({
            id: `inv-${Date.now()}`,
            invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            quotationId: q.id,
            quotationNumber: q.quotationNumber,
            customerId: q.customerId,
            customerName: q.customerName,
            companyName: q.companyName,
            customerGst: q.customerGst || 'N/A',
            customerAddress: q.customerAddress || q.companyName,
            billingMonth: 'Current Month',
            issueDate,
            dueDate: dueDateObj.toISOString().split('T')[0],
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
          });
        }
      }
    }
    return list;
  },

  // Monthly Invoices
  getInvoices(): MonthlyInvoice[] {
    return getItem(KEYS.INVOICES, initialInvoices);
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
    this.addAuditLog(`Saved Tax Invoice ${invoice.invoiceNumber} for ${invoice.companyName}`, 'Monthly Billing');
    return list;
  },

  recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id'>): MonthlyInvoice[] {
    const list = this.getInvoices();
    const inv = list.find((i) => i.id === invoiceId);
    if (inv) {
      const newPay: PaymentRecord = {
        id: `pay-${Date.now()}`,
        ...payment,
      };
      inv.payments.unshift(newPay);
      inv.paidAmount += payment.amountPaid;
      inv.balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);
      if (inv.balanceDue === 0) {
        inv.status = 'Paid';
      } else if (inv.paidAmount > 0) {
        inv.status = 'Partially Paid';
      }
      setItem(KEYS.INVOICES, list);
      this.addAuditLog(
        `Recorded payment of ₹${payment.amountPaid.toLocaleString('en-IN')} for Invoice ${inv.invoiceNumber} via ${payment.paymentMode}`,
        'Monthly Billing & Dues'
      );
    }
    return list;
  },

  // Customers
  getCustomers(): Customer[] {
    return getItem(KEYS.CUSTOMERS, initialCustomers);
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
    this.addAuditLog(`Saved Customer Profile: ${customer.companyName}`, 'Customers CRM');
    return list;
  },

  // Products
  getProducts(): Product[] {
    return getItem(KEYS.PRODUCTS, initialProducts);
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
    this.addAuditLog(`Saved Catalog Product: ${product.name}`, 'Products & Services');
    return list;
  },

  // Templates
  getTemplates(): ProposalTemplate[] {
    return getItem(KEYS.TEMPLATES, initialTemplates);
  },
  saveTemplate(template: ProposalTemplate): ProposalTemplate[] {
    const list = this.getTemplates();
    const index = list.findIndex((t) => t.id === template.id);
    if (index >= 0) {
      list[index] = template;
    } else {
      list.unshift(template);
    }
    setItem(KEYS.TEMPLATES, list);
    return list;
  },

  // Follow Ups
  getFollowUps(): FollowUp[] {
    return getItem(KEYS.FOLLOW_UPS, initialFollowUps);
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
    this.addAuditLog(`Updated Follow-up task for ${followUp.companyName}`, 'Follow-up CRM');
    return list;
  },
  deleteFollowUp(id: string): FollowUp[] {
    const list = this.getFollowUps().filter((f) => f.id !== id);
    setItem(KEYS.FOLLOW_UPS, list);
    return list;
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
    return getItem(KEYS.TEAM_MEMBERS, initialTeamMembers);
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
    // Force update logoUrl if it contains unsplash or is outdated
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
  },
};
