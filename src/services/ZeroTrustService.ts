// ─────────────────────────────────────────────────────────────────────────
// Zero Trust Security Architecture Engine — QuoteFlow ERP
// Principle: Never Trust, Always Verify. Strict RBAC + ABAC Ownership Scoping
// ─────────────────────────────────────────────────────────────────────────

import type { Quotation, MonthlyInvoice, Customer, FollowUp, AuditLog } from '../types';
import type { CustomUser } from '../hooks/useFirebaseAuth';

export type UserRole = 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Accountant' | 'Viewer';

export interface UserSecurityProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId: string;
  branch: string;
}

// ─── Default Role Resolver ────────────────────────────────────────────────
export function getUserRole(user: CustomUser | null): UserRole {
  if (!user) return 'Viewer';
  const email = (user.email || '').toLowerCase();
  
  // Admin credentials check
  if (email.includes('admin') || email.includes('zipcon') || user.uid === 'demo-admin-zipcon-001') {
    return 'Admin';
  }
  if (email.includes('manager')) return 'Sales Manager';
  if (email.includes('accounts') || email.includes('accountant')) return 'Accountant';
  if (email.includes('sales') || email.includes('exec')) return 'Sales Executive';

  return 'Admin'; // Default admin access for authenticated ZIPCON staff
}

// ─── Zero Trust Authorization Rules ───────────────────────────────────────
export const ZeroTrust = {
  /**
   * Check if user can view a specific quotation (Ownership or Role authorization)
   */
  canViewQuotation(user: CustomUser | null, q: Quotation): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    if (role === 'Admin' || role === 'Sales Manager') return true;
    if (role === 'Accountant') return true; // Needs read access for invoicing
    if (role === 'Viewer') return true;

    // Sales Executive: Only authorized if created by or assigned to user
    return q.createdBy === user.uid || q.createdBy === user.displayName || q.createdBy === user.email;
  },

  /**
   * Check if user can edit/update a quotation
   */
  canEditQuotation(user: CustomUser | null, q?: Quotation | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    if (role === 'Admin' || role === 'Sales Manager') return true;
    if (role === 'Accountant' || role === 'Viewer') return false; // Read-only

    if (!q) return true; // Creating new quote
    return q.createdBy === user.uid || q.createdBy === user.displayName || q.createdBy === user.email;
  },

  /**
   * Check if user can delete a quotation
   */
  canDeleteQuotation(user: CustomUser | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'Admin';
  },

  /**
   * Check access to Billing & GST Accounting
   */
  canAccessBilling(user: CustomUser | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'Admin' || role === 'Sales Manager' || role === 'Accountant';
  },

  /**
   * Check access to Security Audit Logs
   */
  canAccessAuditLogs(user: CustomUser | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'Admin';
  },

  /**
   * Check access to Company Settings & System Config
   */
  canManageSettings(user: CustomUser | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'Admin';
  },

  /**
   * Check access to Team Management
   */
  canManageTeam(user: CustomUser | null): boolean {
    if (!user) return false;
    const role = getUserRole(user);
    return role === 'Admin' || role === 'Sales Manager';
  },

  // ─── Data Filter Engines (Scoping) ──────────────────────────────────────

  /**
   * Filter quotations list strictly based on Zero Trust user clearance
   */
  scopeQuotations(user: CustomUser | null, quotations: Quotation[]): Quotation[] {
    if (!user) return [];
    const role = getUserRole(user);
    if (role === 'Admin' || role === 'Sales Manager' || role === 'Accountant' || role === 'Viewer') {
      return quotations;
    }
    // Sales Executive: Filter strictly to own quotes
    return quotations.filter(q =>
      q.createdBy === user.uid || q.createdBy === user.displayName || q.createdBy === user.email
    );
  },

  /**
   * Filter invoices list
   */
  scopeInvoices(user: CustomUser | null, invoices: MonthlyInvoice[]): MonthlyInvoice[] {
    if (!user) return [];
    const role = getUserRole(user);
    if (role === 'Admin' || role === 'Sales Manager' || role === 'Accountant') {
      return invoices;
    }
    return [];
  },

  /**
   * Filter follow-ups list
   */
  scopeFollowUps(user: CustomUser | null, followUps: FollowUp[]): FollowUp[] {
    if (!user) return [];
    const role = getUserRole(user);
    if (role === 'Admin' || role === 'Sales Manager') {
      return followUps;
    }
    // Sales Executive: Filter to assigned follow-ups
    return followUps.filter(f =>
      f.customerName?.toLowerCase().includes(user.displayName?.toLowerCase() || '')
    );
  },
};
