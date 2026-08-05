import {
  Quotation,
  Customer,
  Product,
  ProposalTemplate,
  FollowUp,
  TeamMember,
  CompanySettings,
  MonthlyInvoice,
} from '../types';

export const zipconDefaultTerms: string[] = [];

export const initialCompanySettings: CompanySettings = {
  companyName: '',
  tagline: '',
  logoUrl: '',
  email: '',
  phone: '',
  website: '',
  gstNumber: '',
  address: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  digitalSignatureUrl: '',
  companyStampUrl: '',
  defaultTerms: [],
  quotationPrefix: 'Q-2026-',
  currentBranch: 'Main Office',
};

// ── Clean Slate (Zero Seed Data) ──────────────────────────────────────────
export const initialCustomers: Customer[] = [];
export const initialProducts: Product[] = [];
export const initialTemplates: ProposalTemplate[] = [];
export const initialQuotations: Quotation[] = [];
export const initialInvoices: MonthlyInvoice[] = [];
export const initialFollowUps: FollowUp[] = [];
export const initialTeamMembers: TeamMember[] = [];
