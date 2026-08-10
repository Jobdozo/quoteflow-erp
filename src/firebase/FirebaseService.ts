// ─────────────────────────────────────────────────────────────────────────
// Firebase Firestore Service — QuoteFlow ERP
// Real-time Cloud Database with <200ms Latency & User Data Isolation
// ─────────────────────────────────────────────────────────────────────────
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db, COMPANY_ID } from './config';
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
} from '../types';

// Helper to sanitize objects for Firestore (removes undefined fields which cause Firestore write failures)
export function cleanObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObject(item)) as unknown as T;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanObject(value);
    }
  }
  return cleaned as T;
}

// Helper to calculate user/company-isolated tenant ID in Firestore
export function getCompanyDocId(userOrEmail?: string): string {
  if (!userOrEmail) return COMPANY_ID;
  const safeId = userOrEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `tenant_${safeId}`;
}

// ─── Collection & Doc Helpers ──────────────────────────────────────────────
const col = (name: string, userId?: string) =>
  collection(db, 'companies', getCompanyDocId(userId), name);

const docRef = (name: string, id: string, userId?: string) =>
  doc(db, 'companies', getCompanyDocId(userId), name, id);

// ─── QUOTATIONS ───────────────────────────────────────────────────────────
export const FirebaseQuotations = {
  async getAll(userId?: string): Promise<Quotation[]> {
    try {
      const snap = await getDocs(col('quotations', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quotation));
    } catch (e) {
      console.warn('FirebaseQuotations.getAll offline fallback:', e);
      return [];
    }
  },

  async save(quotation: Quotation, userId?: string): Promise<void> {
    try {
      const ref = docRef('quotations', quotation.id, userId);
      const cleanedData = cleanObject({ ...quotation, updatedAt: new Date().toISOString() });
      await setDoc(ref, cleanedData, { merge: true });
      await FirebaseAudit.log('Save Quotation', 'Quotations', quotation.quotationNumber, userId);
    } catch (e) {
      console.error('FirebaseQuotations.save error:', e);
    }
  },

  async updateStatus(id: string, status: QuotationStatus, userId?: string): Promise<void> {
    try {
      await updateDoc(docRef('quotations', id, userId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('FirebaseQuotations.updateStatus error:', e);
    }
  },

  async delete(id: string, userId?: string): Promise<void> {
    try {
      await deleteDoc(docRef('quotations', id, userId));
      await FirebaseAudit.log('Delete Quotation', 'Quotations', id, userId);
    } catch (e) {
      console.error('FirebaseQuotations.delete error:', e);
    }
  },

  // Real-time snapshot listener (<200ms cloud sync)
  onSnapshot(callback: (quotations: Quotation[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('quotations', userId),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Quotation));
          callback(list);
        },
        (err) => console.warn('FirebaseQuotations listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── INVOICES ─────────────────────────────────────────────────────────────
export const FirebaseInvoices = {
  async getAll(userId?: string): Promise<MonthlyInvoice[]> {
    try {
      const snap = await getDocs(col('invoices', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MonthlyInvoice));
    } catch (e) {
      return [];
    }
  },

  async save(invoice: MonthlyInvoice, userId?: string): Promise<void> {
    try {
      const ref = docRef('invoices', invoice.id, userId);
      const cleaned = cleanObject(invoice);
      await setDoc(ref, cleaned, { merge: true });
      await FirebaseAudit.log('Save Invoice', 'Billing', invoice.invoiceNumber, userId);
    } catch (e) {
      console.error('FirebaseInvoices.save error:', e);
    }
  },

  async recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id'>, userId?: string): Promise<void> {
    try {
      const paymentId = `pay-${Date.now()}`;
      const newPayment: PaymentRecord = { ...payment, id: paymentId };
      const ref = docRef('invoices', invoiceId, userId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const invoice = snap.data() as MonthlyInvoice;
      const updatedPayments = [...(invoice.payments || []), newPayment];
      const paidAmount = updatedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const balanceDue = invoice.totalAmount - paidAmount;
      const status = balanceDue <= 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : invoice.status;
      const cleanedPayments = cleanObject(updatedPayments);
      await updateDoc(ref, { payments: cleanedPayments, paidAmount, balanceDue, status });
      await FirebaseAudit.log('Record Payment', 'Billing', `₹${payment.amountPaid}`, userId);
    } catch (e) {
      console.error('FirebaseInvoices.recordPayment error:', e);
    }
  },

  onSnapshot(callback: (invoices: MonthlyInvoice[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('invoices', userId),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MonthlyInvoice))),
        (err) => console.warn('FirebaseInvoices listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── CUSTOMERS ────────────────────────────────────────────────────────────
export const FirebaseCustomers = {
  async getAll(userId?: string): Promise<Customer[]> {
    try {
      const snap = await getDocs(col('customers', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
    } catch (e) {
      return [];
    }
  },

  async save(customer: Customer, userId?: string): Promise<void> {
    try {
      const ref = docRef('customers', customer.id, userId);
      const cleaned = cleanObject({ ...customer, updatedAt: new Date().toISOString() });
      await setDoc(ref, cleaned, { merge: true });
      await FirebaseAudit.log('Save Customer', 'CRM', customer.companyName, userId);
    } catch (e) {
      console.error('FirebaseCustomers.save error:', e);
    }
  },

  async delete(id: string, userId?: string): Promise<void> {
    try {
      await deleteDoc(docRef('customers', id, userId));
    } catch (e) {
      console.error('FirebaseCustomers.delete error:', e);
    }
  },

  onSnapshot(callback: (customers: Customer[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('customers', userId),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Customer))),
        (err) => console.warn('FirebaseCustomers listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────
export const FirebaseProducts = {
  async getAll(userId?: string): Promise<Product[]> {
    try {
      const snap = await getDocs(col('products', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    } catch (e) {
      return [];
    }
  },

  async save(product: Product, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject(product);
      await setDoc(docRef('products', product.id, userId), cleaned, { merge: true });
    } catch (e) {
      console.error('FirebaseProducts.save error:', e);
    }
  },

  async delete(id: string, userId?: string): Promise<void> {
    try {
      await deleteDoc(docRef('products', id, userId));
    } catch (e) {
      console.error('FirebaseProducts.delete error:', e);
    }
  },

  onSnapshot(callback: (products: Product[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('products', userId),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product))),
        (err) => console.warn('FirebaseProducts listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── FOLLOW-UPS ───────────────────────────────────────────────────────────
export const FirebaseFollowUps = {
  async getAll(userId?: string): Promise<FollowUp[]> {
    try {
      const snap = await getDocs(col('followups', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FollowUp));
    } catch (e) {
      return [];
    }
  },

  async save(followUp: FollowUp, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject(followUp);
      await setDoc(docRef('followups', followUp.id, userId), cleaned, { merge: true });
    } catch (e) {
      console.error('FirebaseFollowUps.save error:', e);
    }
  },

  async delete(id: string, userId?: string): Promise<void> {
    try {
      await deleteDoc(docRef('followups', id, userId));
    } catch (e) {
      console.error('FirebaseFollowUps.delete error:', e);
    }
  },

  onSnapshot(callback: (followUps: FollowUp[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('followups', userId),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FollowUp))),
        (err) => console.warn('FirebaseFollowUps listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── COMPANY SETTINGS ─────────────────────────────────────────────────────
export const FirebaseSettings = {
  async get(userId?: string): Promise<CompanySettings | null> {
    try {
      const snap = await getDoc(doc(db, 'companies', getCompanyDocId(userId)));
      return snap.exists() ? (snap.data() as CompanySettings) : null;
    } catch (e) {
      return null;
    }
  },

  async save(settings: CompanySettings, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject({ ...settings, updatedAt: new Date().toISOString() });
      await setDoc(doc(db, 'companies', getCompanyDocId(userId)), cleaned, { merge: true });
      await FirebaseAudit.log('Update Settings', 'Settings', 'Company settings updated', userId);
    } catch (e) {
      console.error('FirebaseSettings.save error:', e);
    }
  },

  onSnapshot(callback: (settings: CompanySettings) => void, userId?: string) {
    try {
      return onSnapshot(doc(db, 'companies', getCompanyDocId(userId)), (snap) => {
        if (snap.exists()) callback(snap.data() as CompanySettings);
      });
    } catch (e) {
      return () => {};
    }
  },
};

// ─── EMAIL LOGS ───────────────────────────────────────────────────────────
export const FirebaseEmailLogs = {
  async getAll(userId?: string): Promise<EmailLog[]> {
    try {
      const snap = await getDocs(col('email_logs', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailLog));
    } catch (e) {
      return [];
    }
  },

  async add(log: EmailLog, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject(log);
      await setDoc(docRef('email_logs', log.id, userId), cleaned);
    } catch (e) {
      console.error('FirebaseEmailLogs.add error:', e);
    }
  },

  onSnapshot(callback: (logs: EmailLog[]) => void, userId?: string) {
    try {
      return onSnapshot(
        col('email_logs', userId),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EmailLog))),
        (err) => console.warn('FirebaseEmailLogs listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────
export const FirebaseTeam = {
  async getAll(userId?: string): Promise<TeamMember[]> {
    try {
      const snap = await getDocs(col('team_members', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TeamMember));
    } catch (e) {
      return [];
    }
  },

  async save(member: TeamMember, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject(member);
      await setDoc(docRef('team_members', member.id, userId), cleaned, { merge: true });
    } catch (e) {
      console.error('FirebaseTeam.save error:', e);
    }
  },
};

// ─── TEMPLATES ────────────────────────────────────────────────────────────
export const FirebaseTemplates = {
  async getAll(userId?: string): Promise<ProposalTemplate[]> {
    try {
      const snap = await getDocs(col('templates', userId));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProposalTemplate));
    } catch (e) {
      return [];
    }
  },

  async save(template: ProposalTemplate, userId?: string): Promise<void> {
    try {
      const cleaned = cleanObject(template);
      await setDoc(docRef('templates', template.id, userId), cleaned, { merge: true });
    } catch (e) {
      console.error('FirebaseTemplates.save error:', e);
    }
  },
};

// ─── AUDIT LOG ────────────────────────────────────────────────────────────
export const FirebaseAudit = {
  async log(action: string, module: string, detail?: string, userId?: string): Promise<void> {
    try {
      const logId = `log-${Date.now()}`;
      const logObj: AuditLog = {
        id: logId,
        action: detail ? `${action}: ${detail}` : action,
        module,
        user: userId || 'Authenticated User',
        timestamp: new Date().toISOString(),
        ipAddress: 'cloud',
      };
      await setDoc(docRef('audit_logs', logId, userId), cleanObject(logObj));
    } catch (_) {}
  },

  async getAll(userId?: string): Promise<AuditLog[]> {
    try {
      const snap = await getDocs(query(col('audit_logs', userId), limit(100)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
    } catch (e) {
      return [];
    }
  },

  onSnapshot(callback: (logs: AuditLog[]) => void, userId?: string) {
    try {
      return onSnapshot(
        query(col('audit_logs', userId), limit(100)),
        (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog))),
        (err) => console.warn('FirebaseAudit listener warning:', err)
      );
    } catch (e) {
      return () => {};
    }
  },
};
