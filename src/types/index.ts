export type QuotationStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Follow Up'
  | 'Negotiation'
  | 'Approved'
  | 'Rejected'
  | 'Expired';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue';

export interface QuotationItem {
  id: string;
  productId?: string;
  name: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  adminChargePercent?: number;
  discount: number;
  gstRate: number;
  total: number;
  costPerUnit?: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  customerEmail: string;
  customerMobile: string;
  customerGst?: string;
  customerAddress?: string;
  date: string;
  validityDays: number;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  adminChargesTotal?: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  estimatedCost: number;
  estimatedMarginPercent: number;
  winProbabilityPercent?: number;
  priority?: 'High' | 'Medium' | 'Low';
  terms: string[];
  status: QuotationStatus;
  digitalSignature?: string;
  hasCompanyStamp: boolean;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  companyName: string;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash';
  transactionRef: string;
  notes: string;
}

export interface MonthlyInvoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  quotationNumber?: string;
  customerId: string;
  customerName: string;
  companyName: string;
  customerGst: string;
  customerAddress: string;
  billingMonth: string;
  issueDate: string;
  dueDate: string;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  gstNumber: string;
  email: string;
  mobile: string;
  contactPerson: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  companyName: string;
  email: string;
  mobile: string;
  source: 'Website' | 'LinkedIn' | 'Referral' | 'Cold Call' | 'Trade Show';
  expectedValue: number;
  winProbability: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Won' | 'Lost';
  assignedTo: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'Meeting' | 'Site Visit' | 'Call' | 'Deadline';
  date: string;
  time: string;
  companyName: string;
  assignedTo: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Integration {
  id: string;
  name: string;
  category: 'Communication' | 'Payment' | 'Accounting' | 'Storage' | 'Calendar';
  icon: string;
  connected: boolean;
  status: 'Active' | 'Disconnected' | 'Configure';
  description: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Security' | 'Housekeeping' | 'Manpower' | 'CCTV & Safety' | 'Insurance & AMC' | 'Bouncer' | 'Lady Guard' | 'Custom';
  description: string;
  unit: string;
  rate: number;
  gstRate: number;
  costPrice: number;
  standardTerms?: string;
  image?: string;
}

export interface ProposalTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  defaultItems: Omit<QuotationItem, 'id'>[];
  defaultTerms: string[];
}

export interface FollowUp {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerName: string;
  companyName: string;
  scheduledDate: string;
  type: 'Call' | 'WhatsApp' | 'Email' | 'Meeting';
  status: 'Pending' | 'Completed' | 'Overdue';
  reminderStage: '2 Days' | '5 Days' | '7 Days' | '15 Days';
  notes: string;
  amount: number;
}

export interface PixelEvent {
  eventType: 'open' | 'click';
  timestamp: string;
  ipAddress: string;
  city: string;
  device: string;
  os: string;
}

export interface EmailLog {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  body?: string;
  cc?: string;
  bcc?: string;
  status: 'Sent' | 'Delivered' | 'Opened' | 'Clicked';
  sentAt: string;
  openedAt?: string;
  lastOpenedAt?: string;
  openCount?: number;
  clickCount?: number;
  deviceType?: string;
  trackingPixelId: string;
  pixelEvents?: PixelEvent[];
  attachmentName?: string;
}

export interface InboxEmail {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  attachmentName?: string;
  category: 'inquiry' | 'reply' | 'payment' | 'complaint' | 'general';
}

export interface WhatsAppLog {
  id: string;
  quotationId: string;
  quotationNumber: string;
  customerMobile: string;
  customerName: string;
  message: string;
  status: 'Sent' | 'Delivered' | 'Read';
  sentAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Accountant' | 'Viewer';
  avatar: string;
  status: 'Active' | 'Inactive';
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  email: string;
  phone: string;
  website: string;
  gstNumber: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  digitalSignatureUrl: string;
  companyStampUrl: string;
  defaultTerms: string[];
  quotationPrefix: string;
  currentBranch?: string;
}
