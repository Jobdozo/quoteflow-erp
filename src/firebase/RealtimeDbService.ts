// ─────────────────────────────────────────────────────────────────────────
// Firebase Realtime Database Engine — QuoteFlow ERP
// Low-Latency (<50ms WebSocket) Cross-Device Sync for Mobile & Laptop
// ─────────────────────────────────────────────────────────────────────────
import { ref, set, get, onValue, remove, child } from 'firebase/database';
import { rtdb, COMPANY_ID } from './config';
import { cleanObject } from './FirebaseService';
import type {
  Quotation,
  MonthlyInvoice,
  Customer,
  Product,
  FollowUp,
  CompanySettings,
} from '../types';

export function getTenantPathKey(userOrEmail?: string): string {
  if (!userOrEmail) return COMPANY_ID;
  const safeId = userOrEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `tenant_${safeId}`;
}

export const RealtimeDbQuotations = {
  async save(quotation: Quotation, userOrEmail?: string): Promise<void> {
    try {
      const key = getTenantPathKey(userOrEmail);
      const cleaned = cleanObject({ ...quotation, updatedAt: new Date().toISOString() });
      await set(ref(rtdb, `tenants/${key}/quotations/${quotation.id}`), cleaned);
    } catch (e) {
      console.warn('RealtimeDbQuotations.save error:', e);
    }
  },

  async delete(id: string, userOrEmail?: string): Promise<void> {
    try {
      const key = getTenantPathKey(userOrEmail);
      await remove(ref(rtdb, `tenants/${key}/quotations/${id}`));
    } catch (e) {
      console.warn('RealtimeDbQuotations.delete error:', e);
    }
  },

  async getByNumberOrId(query: string): Promise<Quotation | null> {
    try {
      const clean = query.trim().toLowerCase();
      const cleanAlpha = clean.replace(/[^a-zA-Z0-9]/g, '');
      const snapshot = await get(ref(rtdb, 'tenants'));
      const tenantsData = snapshot.val();
      if (!tenantsData) return null;

      for (const tenantKey of Object.keys(tenantsData)) {
        const quotesObj = tenantsData[tenantKey]?.quotations;
        if (quotesObj) {
          const list = Object.values(quotesObj) as Quotation[];
          const found = list.find(
            (q) =>
              (q.quotationNumber || '').toLowerCase() === clean ||
              (q.id || '').toLowerCase() === clean ||
              (q.quotationNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cleanAlpha
          );
          if (found) return found;
        }
      }
    } catch (e) {
      console.warn('RealtimeDbQuotations.getByNumberOrId error:', e);
    }
    return null;
  },

  onValue(callback: (quotations: Quotation[]) => void, userOrEmail?: string) {
    try {
      const key = getTenantPathKey(userOrEmail);
      const dbRef = ref(rtdb, `tenants/${key}/quotations`);
      return onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        const list = Object.values(data) as Quotation[];
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(list);
      });
    } catch (e) {
      return () => {};
    }
  },
};

export const RealtimeDbSettings = {
  async save(settings: CompanySettings, userOrEmail?: string): Promise<void> {
    try {
      const key = getTenantPathKey(userOrEmail);
      const cleaned = cleanObject({ ...settings, updatedAt: new Date().toISOString() });
      await set(ref(rtdb, `tenants/${key}/settings`), cleaned);
    } catch (e) {
      console.warn('RealtimeDbSettings.save error:', e);
    }
  },

  onValue(callback: (settings: CompanySettings) => void, userOrEmail?: string) {
    try {
      const key = getTenantPathKey(userOrEmail);
      const dbRef = ref(rtdb, `tenants/${key}/settings`);
      return onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) callback(data as CompanySettings);
      });
    } catch (e) {
      return () => {};
    }
  },
};

export const RealtimeDbCustomers = {
  async save(customer: Customer, userOrEmail?: string): Promise<void> {
    try {
      const key = getTenantPathKey(userOrEmail);
      const cleaned = cleanObject({ ...customer, updatedAt: new Date().toISOString() });
      await set(ref(rtdb, `tenants/${key}/customers/${customer.id}`), cleaned);
    } catch (e) {
      console.warn('RealtimeDbCustomers.save error:', e);
    }
  },

  onValue(callback: (customers: Customer[]) => void, userOrEmail?: string) {
    try {
      const key = getTenantPathKey(userOrEmail);
      const dbRef = ref(rtdb, `tenants/${key}/customers`);
      return onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          callback([]);
          return;
        }
        callback(Object.values(data) as Customer[]);
      });
    } catch (e) {
      return () => {};
    }
  },
};
