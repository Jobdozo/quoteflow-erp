import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Settings as SettingsIcon,
  X,
  FileText,
  Users as UsersIcon,
  Package,
  Building2,
  Wifi,
  WifiOff,
  RefreshCw,
  DownloadCloud,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import type { Quotation, Customer, Product } from '../../types';
import { SyncService, SyncStatus } from '../../services/SyncService';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onNavigate: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  quotations: Quotation[];
  customers: Customer[];
  products: Product[];
  onSelectQuotation: (q: Quotation) => void;
  onOpenAutoUpdate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onNavigate,
  searchQuery,
  setSearchQuery,
  quotations,
  customers,
  products,
  onSelectQuotation,
  onOpenAutoUpdate,
}) => {
  const { user, logout } = useFirebaseAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('Gurugram HQ');

  // Sync Engine State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncService.getStatus());

  useEffect(() => {
    const unsubscribe = SyncService.subscribe((status) => {
      setSyncStatus(status);
    });
    return () => unsubscribe();
  }, []);

  // Firebase user display info
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const userEmail   = user?.email || 'admin@zipcon.in';
  const userInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl   = user?.photoURL || null;

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Quotation Q-2026-124 Viewed by Reliance Smart', time: '10m ago', unread: true },
    { id: 2, title: 'Quotation Q-2026-122 Approved by Amazon India!', time: '1h ago', unread: true },
    { id: 3, title: 'Follow-up Call due for VMart Retail Ltd.', time: '3h ago', unread: false },
    { id: 4, title: 'Email opened for DLF Cyber City proposal', time: '5h ago', unread: false },
  ]);

  const isSearching = searchQuery.trim().length > 0;
  const matchedQuotes = isSearching
    ? quotations.filter(
        (q) =>
          q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const matchedCustomers = isSearching
    ? customers.filter(
        (c) =>
          c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.mobile.includes(searchQuery)
      )
    : [];

  const matchedProducts = isSearching
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const simulateNewNotification = () => {
    const newAlerts = [
      'Client VMart Retail opened Quotation Q-2026-125 PDF!',
      'WhatsApp message delivered to Reliance Smart (+91 9812345678)',
      'Follow-up reminder: Call Rajesh Malhotra today regarding security guards',
    ];
    const randomAlert = newAlerts[Math.floor(Math.random() * newAlerts.length)];
    setNotifications([
      { id: Date.now(), title: randomAlert, time: 'Just now', unread: true },
      ...notifications,
    ]);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left section: Mobile Hamburger & Interactive Search */}
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Quotations, Customers, Mobile, Products..."
            className="w-full bg-slate-100/80 border border-transparent focus:border-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-full pl-10 pr-8 py-2 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Interactive Global Search Popup */}
          {isSearching && (
            <div className="absolute top-11 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 text-xs space-y-3">
              {matchedQuotes.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">
                    QUOTATIONS ({matchedQuotes.length})
                  </span>
                  <div className="space-y-1">
                    {matchedQuotes.slice(0, 3).map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          onSelectQuotation(q);
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-xl cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{q.quotationNumber} • {q.companyName}</p>
                            <span className="text-[10px] text-slate-400">{q.customerName}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹{q.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedCustomers.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">
                    CUSTOMERS ({matchedCustomers.length})
                  </span>
                  <div className="space-y-1">
                    {matchedCustomers.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('customers');
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-xl cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{c.companyName}</p>
                            <span className="text-[10px] text-slate-400">{c.name} • {c.mobile}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-600 font-semibold">View CRM</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedProducts.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">
                    PRODUCTS ({matchedProducts.length})
                  </span>
                  <div className="space-y-1">
                    {matchedProducts.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('products');
                          setSearchQuery('');
                        }}
                        className="p-2 hover:bg-indigo-50 rounded-xl cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-purple-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">₹{p.rate}/{p.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedQuotes.length === 0 && matchedCustomers.length === 0 && matchedProducts.length === 0 && (
                <div className="py-4 text-center text-slate-400 italic">
                  No matching records found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Sync Status, Branch Selector, Actions & Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Offline Sync Engine Indicator */}
        <button
          onClick={() => SyncService.triggerAutoSync()}
          title="Click to trigger manual Cloud Sync (SQLite -> PostgreSQL)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
            syncStatus.isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {syncStatus.isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : syncStatus.isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span className="hidden md:inline">
            {syncStatus.isSyncing
              ? 'Syncing...'
              : syncStatus.isOnline
              ? 'Cloud Synced'
              : `Offline Queue (${syncStatus.pendingQueueCount})`}
          </span>
        </button>

        {/* Auto Update Software Badge */}
        <button
          onClick={onOpenAutoUpdate}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold border border-indigo-200"
          title="GitHub Auto Update Releases"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>v1.0.2 Live</span>
        </button>

        {/* Branch Selector */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100/80 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <select
            value={currentBranch}
            onChange={(e) => setCurrentBranch(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="Gurugram HQ">Gurugram HQ</option>
            <option value="Mumbai Branch">Mumbai Branch</option>
            <option value="Bengaluru Hub">Bengaluru Hub</option>
          </select>
        </div>

        {/* + New Quotation CTA */}
        <button
          onClick={() => onNavigate('new-quotation')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Quotation</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 px-1">
                <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={simulateNewNotification}
                    className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold hover:bg-indigo-100"
                  >
                    + Test Alert
                  </button>
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs flex justify-between items-start cursor-pointer hover:bg-slate-50 ${
                      n.unread ? 'bg-indigo-50/50 font-medium' : ''
                    }`}
                  >
                    <div>
                      <p className="text-slate-800 leading-snug">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName}
                className="w-8 h-8 rounded-full object-cover shadow-md border-2 border-indigo-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {userInitial}
              </div>
            )}
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-slate-800 leading-none">{displayName}</p>
              <span className="text-[10px] text-slate-400 font-medium">Administrator</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
              {/* User Profile Summary */}
              <div className="p-3 border-b border-slate-100 mb-1 flex items-center space-x-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-bold flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{displayName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">🟢 Verified Session</span>
                </div>
              </div>
              <button
                onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400" />
                <span>Company Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={async () => { setShowProfileMenu(false); await logout(); }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
