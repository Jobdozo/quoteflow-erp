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

export const zipconDefaultTerms: string[] = [
  'This cost sheet forms an integral part of Agreement / work order and must be signed and stamped for start-up of operations.',
  'Above rates are Based On 26 Days Duty Pattern.',
  'Quotation validity for 30 days.',
  'GST will be Charged as per applicable.',
  'Overtime will be charged beyond 8 hours duty on an hourly basis at twice the rate of the existing salary for all except the Management Team.',
  'ZIPCON facility team salary break-up will be at sole discretion of ZIPCON Management. Annual cost revision of the Management team will be mutually decided and by default to be made applicable from the date of renewal/annual revision.',
];

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
