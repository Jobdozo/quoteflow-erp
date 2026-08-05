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
  'This cost-sheet forms an integral part of Agreement / work order and must be signed and stamped for start-up of operations.',
  'Above rates are Based On 8X6 Days Duty Pattern.',
  'Quotation validity for 30 days from date of issuance.',
  'GST will be Charged as per applicable government rates.',
  'Overtime will be charged beyond 8 hours’ duty on an hourly basis at twice the rate of the existing salary for all except the Management team.',
  'ZIPCON Facility team salary break-up will be at sole discretion of ZIPCON Management. Annual cost revision will be mutually decided.',
  'All staff will be entitled for compulsory 4 days’ holidays – 15th August, 26th January, 2nd October and 1st May. Work on holidays will be paid @ 2x overtime rate.',
  'Uniforms will be supplied to line category personnel by the client.',
  'The above costs would be applicable for the first year of operations; annual escalation will apply from second year onwards.',
  'Manpower rates are based on statutory minimum wages and are subject to revision upon official Government notification.',
  'Taxes at prevailing rate will be applicable on Gross Billing.',
  'Change Room and Store for Facility Management Team to be provided by client.',
  'Payment Terms: Invoice shall be paid within 10 days from submission date.',
  'The manpower on site will follow client holiday schedule, subject to emergency deployment calls.',
  'Contract duration: 1 year from effective date with automatic 10% annual renewal escalation unless terminated with 30 days prior written notice.',
  'Payroll Administration Fee is fixed for one year and subject to mutual annual revision thereafter.',
  'Additional pass-through expenses charged at Actuals + 10% fee + applicable Service Tax/GST.',
  'Contact: Tollfree 1800-889-4191 | Email: info@zipcon.in | Web: www.zipcon.in | 33/1A Jalalabad Sunjwan Jammu (180011) India.',
];

export const initialCompanySettings: CompanySettings = {
  companyName: 'ZIPCON SERVICES PRIVATE LIMITED',
  tagline: 'Premier Security, Housekeeping & Facility Management Solutions',
  logoUrl: '/zipcon_logo.png',
  email: 'info@zipcon.in',
  phone: '1800-889-4191',
  website: 'www.zipcon.in',
  gstNumber: '01AABCZ9876Q1Z9',
  address: '33/1A Jalalabad Sunjwan, Jammu (180011), J&K, India',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200049182717',
  ifscCode: 'HDFC0001243',
  branchName: 'Bahuta Colony, Sunjwan, Jammu',
  digitalSignatureUrl: '',
  companyStampUrl: '',
  defaultTerms: zipconDefaultTerms,
  quotationPrefix: 'Q-2026-',
  currentBranch: 'Gurugram HQ',
};

// ── Clean Slate (Zero Seed Data) ──────────────────────────────────────────
export const initialCustomers: Customer[] = [];
export const initialProducts: Product[] = [];
export const initialTemplates: ProposalTemplate[] = [];
export const initialQuotations: Quotation[] = [];
export const initialInvoices: MonthlyInvoice[] = [];
export const initialFollowUps: FollowUp[] = [];
export const initialTeamMembers: TeamMember[] = [];
