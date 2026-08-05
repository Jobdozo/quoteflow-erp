import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Package,
  BadgePercent,
  Copy,
  Clock,
  Mail,
  MessageSquare,
  BarChart3,
  UserCheck,
  Settings,
  Zap,
  CreditCard,
  Receipt,
  Kanban,
  Calendar,
  Layers,
  Shield,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'new-quotation'
  | 'quotations'
  | 'pipeline'
  | 'monthly-billing'
  | 'gst-accounting'
  | 'calendar'
  | 'customers'
  | 'products'
  | 'price-list'
  | 'templates'
  | 'follow-ups'
  | 'email-center'
  | 'whatsapp-center'
  | 'reports'
  | 'team'
  | 'integrations'
  | 'security'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-quotation', label: 'New Quotation', icon: FilePlus },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'pipeline', label: 'Kanban Pipeline', icon: Kanban },
    { id: 'monthly-billing', label: 'Monthly Billing & Dues', icon: CreditCard },
    { id: 'gst-accounting', label: 'GST & Tax Ledger', icon: Receipt },
    { id: 'calendar', label: 'Calendar & Schedules', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products & Services', icon: Package },
    { id: 'price-list', label: 'Price List', icon: BadgePercent },
    { id: 'templates', label: 'Proposal Templates', icon: Copy },
    { id: 'follow-ups', label: 'Follow Ups', icon: Clock },
    { id: 'email-center', label: 'Email Center', icon: Mail },
    { id: 'whatsapp-center', label: 'WhatsApp Center', icon: MessageSquare },
    { id: 'reports', label: 'Reports & BI', icon: BarChart3 },
    { id: 'team', label: 'Team Members', icon: UserCheck },
    { id: 'integrations', label: 'Integrations Hub', icon: Layers },
    { id: 'security', label: 'Security & Audit', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight leading-none">
                Quote<span className="text-indigo-400">Flow</span>
              </h1>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Enterprise Quotation CRM
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id as NavTab);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-150 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Promo CTA Card */}
        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 p-3.5 text-white shadow-xl">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <h4 className="font-bold text-xs tracking-wide">Create Quotation in 60s</h4>
            <p className="text-[11px] text-indigo-100/90 mt-0.5">Professional, Fast & Easy.</p>
            <button
              onClick={() => {
                onSelectTab('new-quotation');
                setIsOpenMobile(false);
              }}
              className="mt-2.5 w-full bg-white text-indigo-700 font-semibold text-xs py-1.5 px-3 rounded-lg shadow hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-1"
            >
              <span>+ Create Now</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
