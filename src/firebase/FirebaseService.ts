// ─────────────────────────────────────────────────────────────────────────
// Firebase Firestore Service — QuoteFlow ERP
// Real-time Cloud Database replacing LocalStorage
// ─────────────────────────────────────────────────────────────────────────
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp,
  writeBatch, Timestamp, limit,
} from 'firebase/firestore';
import { db, COMPANY_ID } from './config';
import type {
  Quotation, MonthlyInvoice, PaymentRecord, Customer, Product,
  ProposalTemplate, FollowUp, EmailLog, TeamMember, CompanySettings,
  QuotationStatus, AuditLog,
} from '../types';

// ─── Collection Refs ──────────────────────────────────────────────────────
const col = (name: string) =>
  collection(db, 'companies', COMPANY_ID, name);

// ─── QUOTATIONS ───────────────────────────────────────────────────────────
export const FirebaseQuotations = {
  async getAll(): Promise<Quotation[]> {
    const snap = await getDocs(query(col('quotations'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Quotation));
  },

  async getById(id: string): Promise<Quotation | null> {
    const snap = await getDoc(doc(db, 'companies', COMPANY_ID, 'quotations', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } as Quotation : null;
  },

  async save(quotation: Quotation): Promise<void> {
    const ref = doc(db, 'companies', COMPANY_ID, 'quotations', quotation.id);
    await setDoc(ref, { ...quotation, updatedAt: new Date().toISOString() }, { merge: true });
    await FirebaseAudit.log('Save Quotation', 'Quotations', quotation.quotationNumber);
  },

  async updateStatus(id: string, status: QuotationStatus): Promise<void> {
    await updateDoc(doc(db, 'companies', COMPANY_ID, 'quotations', id), {
      status,
      updatedAt: new Date().toISOString(),
    });
    await FirebaseAudit.log('Update Status', 'Quotations', `${id} → ${status}`);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'companies', COMPANY_ID, 'quotations', id));
    await FirebaseAudit.log('Delete Quotation', 'Quotations', id);
  },

  onSnapshot(callback: (quotations: Quotation[]) => void) {
    return onSnapshot(
      query(col('quotations'), orderBy('createdAt', 'desc')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quotation)))
    );
  },
};

// ─── INVOICES ─────────────────────────────────────────────────────────────
export const FirebaseInvoices = {
  async getAll(): Promise<MonthlyInvoice[]> {
    const snap = await getDocs(query(col('invoices'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyInvoice));
  },

  async save(invoice: MonthlyInvoice): Promise<void> {
    const ref = doc(db, 'companies', COMPANY_ID, 'invoices', invoice.id);
    await setDoc(ref, invoice, { merge: true });
    await FirebaseAudit.log('Save Invoice', 'Billing', invoice.invoiceNumber);
  },

  async recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id'>): Promise<void> {
    const paymentId = `pay-${Date.now()}`;
    const newPayment: PaymentRecord = { ...payment, id: paymentId };

    const invoiceRef = doc(db, 'companies', COMPANY_ID, 'invoices', invoiceId);
    const snap = await getDoc(invoiceRef);
    if (!snap.exists()) return;

    const invoice = snap.data() as MonthlyInvoice;
    const updatedPayments = [...(invoice.payments || []), newPayment];
    const paidAmount = updatedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const balanceDue = invoice.totalAmount - paidAmount;
    const status = balanceDue <= 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : invoice.status;

    await updateDoc(invoiceRef, {
      payments: updatedPayments,
      paidAmount,
      balanceDue,
      status,
    });
    await FirebaseAudit.log('Record Payment', 'Billing', `₹${payment.amountPaid} via ${payment.paymentMode}`);
  },

  onSnapshot(callback: (invoices: MonthlyInvoice[]) => void) {
    return onSnapshot(
      query(col('invoices'), orderBy('createdAt', 'desc')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyInvoice)))
    );
  },
};

// ─── CUSTOMERS ────────────────────────────────────────────────────────────
export const FirebaseCustomers = {
  async getAll(): Promise<Customer[]> {
    const snap = await getDocs(query(col('customers'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
  },

  async save(customer: Customer): Promise<void> {
    const ref = doc(db, 'companies', COMPANY_ID, 'customers', customer.id);
    await setDoc(ref, { ...customer, updatedAt: new Date().toISOString() }, { merge: true });
    await FirebaseAudit.log('Save Customer', 'CRM', customer.companyName);
  },

  onSnapshot(callback: (customers: Customer[]) => void) {
    return onSnapshot(
      query(col('customers'), orderBy('createdAt', 'desc')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)))
    );
  },
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────
export const FirebaseProducts = {
  async getAll(): Promise<Product[]> {
    const snap = await getDocs(col('products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  },

  async save(product: Product): Promise<void> {
    const ref = doc(db, 'companies', COMPANY_ID, 'products', product.id);
    await setDoc(ref, product, { merge: true });
  },

  onSnapshot(callback: (products: Product[]) => void) {
    return onSnapshot(col('products'),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)))
    );
  },
};

// ─── FOLLOW-UPS ───────────────────────────────────────────────────────────
export const FirebaseFollowUps = {
  async getAll(): Promise<FollowUp[]> {
    const snap = await getDocs(query(col('followups'), orderBy('scheduledDate', 'asc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FollowUp));
  },

  async save(followUp: FollowUp): Promise<void> {
    const ref = doc(db, 'companies', COMPANY_ID, 'followups', followUp.id);
    await setDoc(ref, followUp, { merge: true });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'companies', COMPANY_ID, 'followups', id));
  },

  onSnapshot(callback: (followUps: FollowUp[]) => void) {
    return onSnapshot(
      query(col('followups'), orderBy('scheduledDate', 'asc')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FollowUp)))
    );
  },
};

// ─── COMPANY SETTINGS ─────────────────────────────────────────────────────
export const FirebaseSettings = {
  async get(): Promise<CompanySettings | null> {
    const snap = await getDoc(doc(db, 'companies', COMPANY_ID));
    return snap.exists() ? snap.data() as CompanySettings : null;
  },

  async save(settings: CompanySettings): Promise<void> {
    await setDoc(
      doc(db, 'companies', COMPANY_ID),
      { ...settings, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await FirebaseAudit.log('Update Settings', 'Settings', 'Company settings updated');
  },

  onSnapshot(callback: (settings: CompanySettings) => void) {
    return onSnapshot(doc(db, 'companies', COMPANY_ID), snap => {
      if (snap.exists()) callback(snap.data() as CompanySettings);
    });
  },
};

// ─── EMAIL LOGS ───────────────────────────────────────────────────────────
export const FirebaseEmailLogs = {
  async getAll(): Promise<EmailLog[]> {
    const snap = await getDocs(query(col('email_logs'), orderBy('sentAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmailLog));
  },

  async add(log: EmailLog): Promise<EmailLog[]> {
    await setDoc(doc(db, 'companies', COMPANY_ID, 'email_logs', log.id), log);
    return this.getAll();
  },
};

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────
export const FirebaseTeam = {
  async getAll(): Promise<TeamMember[]> {
    const snap = await getDocs(col('team_members'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
  },

  async save(member: TeamMember): Promise<void> {
    await setDoc(doc(db, 'companies', COMPANY_ID, 'team_members', member.id), member, { merge: true });
  },
};

// ─── AUDIT LOG ────────────────────────────────────────────────────────────
export const FirebaseAudit = {
  async log(action: string, module: string, detail?: string): Promise<void> {
    try {
      await addDoc(col('audit_logs'), {
        action: detail ? `${action}: ${detail}` : action,
        module,
        user: 'System',
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      } as Omit<AuditLog, 'id'>);
    } catch (_) {
      // Silently fail — audit logs should not block operations
    }
  },

  async getAll(): Promise<AuditLog[]> {
    const snap = await getDocs(query(col('audit_logs'), orderBy('timestamp', 'desc'), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
  },

  onSnapshot(callback: (logs: AuditLog[]) => void) {
    return onSnapshot(
      query(col('audit_logs'), orderBy('timestamp', 'desc'), limit(100)),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)))
    );
  },
};

// ─── SEED INITIAL DATA ────────────────────────────────────────────────────
// Call once after Firebase config to push default company data
export async function seedInitialFirebaseData(defaults: {
  settings: CompanySettings;
  products: Product[];
  templates: ProposalTemplate[];
}): Promise<void> {
  const companyRef = doc(db, 'companies', COMPANY_ID);
  const existing = await getDoc(companyRef);
  if (existing.exists()) return; // Already seeded

  const batch = writeBatch(db);

  // Company Settings
  batch.set(companyRef, { ...defaults.settings, createdAt: new Date().toISOString() });

  // Products
  defaults.products.forEach(p => {
    batch.set(doc(db, 'companies', COMPANY_ID, 'products', p.id), p);
  });

  // Templates
  defaults.templates.forEach(t => {
    batch.set(doc(db, 'companies', COMPANY_ID, 'templates', t.id), t);
  });

  await batch.commit();
  console.log('✅ QuoteFlow ERP: Firebase initial data seeded successfully!');
}
