import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Clock,
  Laptop,
  CheckCircle2,
  History,
  Trash2,
  RefreshCw,
  LogOut,
  User,
  Activity,
  Lock,
  Unlock,
  Calendar,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  FileText,
  Layers,
  ShoppingBag,
  Users,
  KeyRound,
  AlertCircle,
  UserPlus,
  Mail,
  Shield,
  Check,
  X,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  PowerOff,
  ShieldAlert
} from 'lucide-react';
import {
  getCurrentAdminSession,
  getAdminLoginHistory,
  clearAdminLoginHistory,
  getAdminActivityLogs,
  clearAdminActivityLogs,
  getAdminAccounts,
  saveAdminAccount,
  deleteAdminAccount,
  terminateAdminSession,
  syncAdminSessionsFromServer,
  parseSessionDetails,
  updateSessionHeartbeat,
  setVerifiedDeviceLabel
} from '../../services/adminLogService';

const CATEGORY_COLORS = {
  'Products': 'bg-blue-50 text-blue-700 border-blue-200',
  'Daily Sales': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Attendance': 'bg-purple-50 text-purple-700 border-purple-200',
  'Store Updates': 'bg-amber-50 text-amber-700 border-amber-200',
  'Showcase': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Settings': 'bg-slate-100 text-slate-700 border-slate-200',
  'Security': 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AdminLoginDetailsView({ user, onSignOut, showNotice }) {
  const [activeSession, setActiveSession] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [sessionUptime, setSessionUptime] = useState('');

  // Admin Accounts list state & modal
  const [adminAccounts, setAdminAccounts] = useState(() => getAdminAccounts(user));
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountRole, setNewAccountRole] = useState('Store Admin');

  // Active view tab: 'accounts' (Admin Login Accounts), 'logins' (Login Audit History), or 'activities' (Admin Edits & Actions)
  const [activeViewTab, setActiveViewTab] = useState('accounts');

  // Activity filter states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');

  const refreshData = async () => {
    const current = getCurrentAdminSession(user);
    setActiveSession(current);
    const sessions = await syncAdminSessionsFromServer();
    setLoginHistory(sessions);
    setActivityLogs(getAdminActivityLogs());
    setAdminAccounts(getAdminAccounts(user));
  };

  useEffect(() => {
    refreshData();

    // Heartbeat every 60 seconds to update online status of active device
    const heartbeatTimer = setInterval(() => {
      updateSessionHeartbeat();
    }, 60000);

    const handleSessionsUpdate = () => {
      setLoginHistory(getAdminLoginHistory());
    };
    const handleActivityUpdate = () => {
      setActivityLogs(getAdminActivityLogs());
    };
    const handleAccountsUpdate = () => {
      setAdminAccounts(getAdminAccounts(user));
    };

    window.addEventListener('7days_admin_sessions_updated', handleSessionsUpdate);
    window.addEventListener('7days_admin_activity_updated', handleActivityUpdate);
    window.addEventListener('7days_admin_accounts_updated', handleAccountsUpdate);
    window.addEventListener('storage', refreshData);

    return () => {
      clearInterval(heartbeatTimer);
      window.removeEventListener('7days_admin_sessions_updated', handleSessionsUpdate);
      window.removeEventListener('7days_admin_activity_updated', handleActivityUpdate);
      window.removeEventListener('7days_admin_accounts_updated', handleAccountsUpdate);
      window.removeEventListener('storage', refreshData);
    };
  }, [user]);

  const handleTerminateSession = (session) => {
    const parsed = parseSessionDetails(session);
    if (window.confirm(`Are you sure you want to revoke and disconnect ${parsed.userIdentifier || session.email} (${parsed.deviceSummary})?`)) {
      terminateAdminSession(session.id);
      refreshData();
      showNotice?.('success', `Session disconnected for ${parsed.userIdentifier || session.email}`);
    }
  };

  const handleLabelDevice = (deviceId, currentName) => {
    if (!deviceId) return;
    const cleanCurrent = currentName?.replace(/\s*\[DEV-[A-Z0-9]+\]/, '') || '';
    const newName = window.prompt(
      'Assign an official name for this device (e.g. Counter 1 Mobile, Cashier PC, Shabeer Phone):',
      cleanCurrent
    );
    if (newName !== null) {
      setVerifiedDeviceLabel(deviceId, newName.trim());
      refreshData();
      showNotice?.('success', newName.trim() ? `Device assigned label: "${newName.trim()}"` : 'Device label removed');
    }
  };

  // Live session uptime counter
  useEffect(() => {
    if (!activeSession?.loginTimestamp) return;

    const updateTimer = () => {
      const loginTime = new Date(activeSession.loginTimestamp).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - loginTime);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffHours > 0) {
        setSessionUptime(`${diffHours} hr ${diffMins % 60} mins`);
      } else if (diffMins > 0) {
        setSessionUptime(`${diffMins} min${diffMins > 1 ? 's' : ''}`);
      } else {
        setSessionUptime('Just now (< 1 min)');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleClearLoginHistory = () => {
    if (window.confirm('Clear all past login session records? Current session will be preserved.')) {
      clearAdminLoginHistory();
      refreshData();
      showNotice?.('success', 'Cleared previous login history logs');
    }
  };

  const handleClearActivityLogs = () => {
    if (window.confirm('Clear all recorded admin edit and activity logs? This action cannot be undone.')) {
      clearAdminActivityLogs();
      refreshData();
      showNotice?.('success', 'Cleared all admin activity and edit logs');
    }
  };

  const handleSaveNewAccount = (e) => {
    e.preventDefault();
    if (!newAccountEmail.trim() || !newAccountEmail.includes('@')) {
      showNotice?.('error', 'Please enter a valid admin email address');
      return;
    }
    const email = newAccountEmail.trim().toLowerCase();
    const name = newAccountName.trim() || email.split('@')[0];
    const role = newAccountRole || 'Store Admin';

    saveAdminAccount({
      email,
      name,
      role,
      permissions:
        role === 'Super Admin'
          ? ['All Permissions', 'Catalog Products', 'Daily Sales', 'Staff & Attendance', 'Hero Showcase', 'Settings']
          : ['Catalog Products', 'Daily Sales', 'Staff & Attendance'],
      lastLogin: null
    });

    setAdminAccounts(getAdminAccounts(user));
    setNewAccountEmail('');
    setNewAccountName('');
    setNewAccountRole('Store Admin');
    setIsAddAccountModalOpen(false);
    showNotice?.('success', `Admin login account for ${email} registered successfully!`);
  };

  const handleDeleteAccount = (acc) => {
    const currentEmail = user?.email || 'admin@7days.com';
    if (acc.isPrimary || acc.email?.toLowerCase() === currentEmail.toLowerCase()) {
      showNotice?.('error', 'The primary administrator account cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${acc.email} from authorized login accounts?`)) {
      deleteAdminAccount(acc.email);
      setAdminAccounts(getAdminAccounts(user));
      showNotice?.('success', `Removed ${acc.email} from login accounts`);
    }
  };

  // Filtered activity logs
  const filteredActivities = useMemo(() => {
    return activityLogs.filter((log) => {
      if (categoryFilter !== 'All' && log.category !== categoryFilter) return false;
      if (actionTypeFilter !== 'All' && log.action !== actionTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = log.title?.toLowerCase().includes(q);
        const matchesDetails = log.details?.toLowerCase().includes(q);
        const matchesEmail = log.email?.toLowerCase().includes(q);
        const matchesCat = log.category?.toLowerCase().includes(q);
        return matchesTitle || matchesDetails || matchesEmail || matchesCat;
      }
      return true;
    });
  }, [activityLogs, categoryFilter, actionTypeFilter, searchQuery]);

  // Statistics counters
  const totalEditsCount = activityLogs.length;
  const productEditsCount = activityLogs.filter(a => a.category === 'Products').length;
  const salesActionsCount = activityLogs.filter(a => a.category === 'Daily Sales').length;
  const attendanceActionsCount = activityLogs.filter(a => a.category === 'Attendance').length;

  const renderActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <PlusCircle className="w-3 h-3" />
            CREATED
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
            <Edit3 className="w-3 h-3" />
            EDITED
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
            <Trash2 className="w-3 h-3" />
            DELETED
          </span>
        );
      case 'LOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
            <Lock className="w-3 h-3" />
            LOCKED
          </span>
        );
      case 'UNLOCK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200">
            <Unlock className="w-3 h-3" />
            UNLOCKED
          </span>
        );
      case 'DUTY_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-teal-100 text-teal-800 border border-teal-200">
            <Users className="w-3 h-3" />
            DUTY SET
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
            <KeyRound className="w-3 h-3" />
            LOGIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {action || 'ACTION'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FB8500] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Security & Access Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Admin Login Accounts &amp; Audit</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Security Center
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            View authorized login accounts, active administrator sessions, login security history, and complete chronological edit audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
            <span>Refresh</span>
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Active Session Hero Card & Security Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Session Card (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-[#1E252B] via-[#263238] to-[#161D22] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FB8500]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              Active Administrator Session
            </span>

            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              <Activity className="w-3.5 h-3.5 text-[#FB8500]" />
              <span>Online: {sessionUptime || 'Active'}</span>
            </span>
          </div>

          <div className="flex items-start sm:items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FB8500] to-[#FFB703] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FB8500]/25 shrink-0">
              {activeSession?.email ? activeSession.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                {activeSession?.email || user?.email || 'admin@7days.com'}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-[#FFB703] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {activeSession?.role || 'Super Admin'}
                </span>
                <span className="text-slate-500 text-xs">&bull;</span>
                <span className="text-xs text-slate-300 font-medium">
                  7Days Toys &bull; Wayanad, Kerala
                </span>
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-slate-700/60 text-xs">
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/40">
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Logged In Time
              </span>
              <span className="font-bold text-white text-sm">
                {activeSession?.formattedTime || 'Active'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {activeSession?.formattedDate || 'Today'}
              </span>
            </div>

            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/40">
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                Device & Platform
              </span>
              <span className="font-bold text-white text-sm truncate block">
                {activeSession?.deviceInfo || 'Desktop Browser'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                {activeSession?.browser || 'Web Client'} &bull; {activeSession?.os || 'Windows'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Permissions Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              Live Audit Metrics
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Edits</span>
                <span className="text-xl font-black text-slate-900">{totalEditsCount}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase block">Products</span>
                <span className="text-xl font-black text-blue-950">{productEditsCount}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Daily Sales</span>
                <span className="text-xl font-black text-emerald-950">{salesActionsCount}</span>
              </div>
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                <span className="text-[10px] text-purple-600 font-bold uppercase block">Attendance</span>
                <span className="text-xl font-black text-purple-950">{attendanceActionsCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100 text-xs text-emerald-900">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-950 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Audit Integrity Protected
            </h4>
            <p className="text-emerald-800 leading-relaxed text-[11px] mt-1">
              Every edit, creation, deletion, sales register lock, and staff duty change is automatically tagged with the active admin account, device fingerprint, and precise timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Log Tabs Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-2xl border border-gray-200 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveViewTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeViewTab === 'accounts'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#FB8500]" />
            <span>Admin Login Accounts</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700">
              {adminAccounts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('logins')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeViewTab === 'logins'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Login Session History</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
              {loginHistory.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeViewTab === 'activities'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Activity &amp; Edit Trail</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
              {activityLogs.length}
            </span>
          </button>
        </div>

        {activeViewTab === 'accounts' ? (
          <button
            type="button"
            onClick={() => setIsAddAccountModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Admin Account</span>
          </button>
        ) : activeViewTab === 'activities' ? (
          activityLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClearActivityLogs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Activity Logs</span>
            </button>
          )
        ) : (
          loginHistory.length > 0 && (
            <button
              type="button"
              onClick={handleClearLoginHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Login History</span>
            </button>
          )
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AUTHORIZED ADMIN LOGIN ACCOUNTS & LOGGED DEVICES   */}
      {/* ========================================================= */}
      {activeViewTab === 'accounts' && (
        <div className="space-y-8">
          {/* SECTION 1: USERS & DEVICES LOGGED IN WITH SUPER ADMIN */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                    Shared Super Admin Device Tracking
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#FB8500]" />
                  <span>Devices &amp; Users Logged In with Super Admin</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {loginHistory.filter((s) => parseSessionDetails(s).isOnline).length} Active Online
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Even though your store uses <strong>one Super Admin username &amp; password</strong>, every staff member, phone, tablet, and PC is identified individually below with their name, device model, IP address, and location.
                </p>
              </div>

              <button
                type="button"
                onClick={refreshData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer self-start sm:self-auto shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                <span>Refresh Devices</span>
              </button>
            </div>

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loginHistory.slice(0, 12).map((session, index) => {
                const parsed = parseSessionDetails(session);
                const isCurrent = activeSession?.id === session.id;
                const isMobile =
                  session.userAgent?.includes('Mobi') ||
                  session.userAgent?.includes('Android') ||
                  session.userAgent?.includes('iPhone');

                return (
                  <div
                    key={session.id || index}
                    className={`bg-white rounded-3xl p-5 border transition shadow-xs flex flex-col justify-between ${
                      isCurrent
                        ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                        : parsed.isOnline
                        ? 'border-emerald-200 hover:border-emerald-300'
                        : 'border-gray-200 opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Online Status & Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        {parsed.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Online Right Now
                          </span>
                        ) : session.status === 'Terminated' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Disconnected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                            Session Recorded
                          </span>
                        )}

                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            This Device
                          </span>
                        )}
                      </div>

                      {/* User & Device Identity */}
                      <div className="flex items-start gap-3.5 mb-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs shrink-0 ${
                            isMobile
                              ? 'bg-gradient-to-tr from-[#FB8500] to-[#FFB703] text-white'
                              : 'bg-gradient-to-tr from-slate-800 to-slate-900 text-cyan-400'
                          }`}
                        >
                          {isMobile ? (
                            <Smartphone className="w-6 h-6" />
                          ) : (
                            <Monitor className="w-6 h-6" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-sm text-gray-900 truncate">
                              {parsed.userIdentifier}
                            </h4>
                            {parsed.deviceId && (
                              <button
                                type="button"
                                onClick={() => handleLabelDevice(parsed.deviceId, parsed.userIdentifier)}
                                className="p-1 text-gray-400 hover:text-[#FB8500] hover:bg-amber-50 rounded-lg transition shrink-0 cursor-pointer"
                                title="Owner: Assign or rename this device"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 truncate block mt-0.5 font-medium">
                            {parsed.deviceSummary}
                          </span>
                          <span className="text-[10px] text-[#FB8500] font-bold block mt-0.5">
                            Logged in via Super Admin ({session.email})
                          </span>
                        </div>
                      </div>

                      {/* Technical Details: IP, Location & Network */}
                      <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 text-[11px] space-y-1.5 mb-4 font-mono">
                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center gap-1.5 font-semibold font-sans text-gray-500">
                            <Wifi className="w-3.5 h-3.5 text-blue-500" />
                            IP Address:
                          </span>
                          <span className="font-bold text-gray-900">{parsed.ipAddress}</span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center gap-1.5 font-semibold font-sans text-gray-500">
                            <Globe className="w-3.5 h-3.5 text-emerald-500" />
                            Location:
                          </span>
                          <span className="font-bold text-gray-800 truncate max-w-[150px]">
                            {parsed.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-gray-600">
                          <span className="flex items-center gap-1.5 font-semibold font-sans text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Logged in:
                          </span>
                          <span className="text-gray-700 font-sans font-medium">
                            {session.formattedTime}, {session.formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        ID: {session.id?.slice(0, 14)}...
                      </span>

                      {!isCurrent && session.status !== 'Terminated' ? (
                        <button
                          type="button"
                          onClick={() => handleTerminateSession(session)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                          title="Remotely log out this phone or PC"
                        >
                          <PowerOff className="w-3 h-3" />
                          <span>Disconnect Device</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {isCurrent ? 'Your Current Screen' : 'Terminated'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: AUTHORIZED ADMIN ACCOUNTS */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#FB8500]" />
                  <span>Authorized Administrator Accounts</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {adminAccounts.length} Configured
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Primary store administrator credentials and configured authorized accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-xs transition cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Admin Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminAccounts.map((acc, index) => {
                const isCurrent =
                  acc.email?.toLowerCase() === (user?.email || 'admin@7days.com').toLowerCase();
                return (
                  <div
                    key={acc.id || index}
                    className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            acc.role === 'Super Admin'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {acc.role || 'Super Admin'}
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                          <Check className="w-3 h-3 text-emerald-600" />
                          Authorized
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FB8500] to-[#FFB703] text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                          {acc.email ? acc.email.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {acc.name || acc.email?.split('@')[0]}
                          </h4>
                          <span className="text-xs text-gray-500 font-mono truncate block">
                            {acc.email}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Privileges
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(acc.permissions || ['All Permissions']).map((perm, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[10px] font-semibold bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md border border-gray-100"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Status: Active</span>
                      {!acc.isPrimary && !isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADMIN EDIT & ACTIVITY AUDIT TRAIL                  */}
      {/* ========================================================= */}
      {activeViewTab === 'activities' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search action, product title, salesperson, or admin..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl text-xs bg-gray-50/70 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Category:</span>
              {['All', 'Products', 'Daily Sales', 'Attendance', 'Store Updates', 'Showcase', 'Settings'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-gray-900">
                  Panel Actions & Edits Log
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Showing {filteredActivities.length} of {activityLogs.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Action & Edit Details</th>
                    <th className="py-3 px-4">Admin Account</th>
                    <th className="py-3 px-4">Time & Date</th>
                    <th className="py-3 px-4 text-right">Device / Client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Activity className="w-8 h-8 text-gray-300 mx-auto" />
                          <p className="font-semibold text-gray-600">No admin edits or actions found</p>
                          <p className="text-[11px] text-gray-400">
                            Perform edits in Products, Daily Sales, Staff Attendance, or Store Updates to record audit logs.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderActionBadge(log.action)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${CATEGORY_COLORS[log.category] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {log.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="max-w-md">
                            <span className="font-bold text-gray-900 block text-xs">
                              {log.title}
                            </span>
                            {log.details && (
                              <span className="text-[11px] text-gray-500 block mt-0.5 leading-snug">
                                {log.details}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-[11px]">
                                {log.email}
                              </span>
                              <span className="text-[9px] text-gray-400 block font-semibold">
                                {log.role || 'Super Admin'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-gray-800 block text-xs">
                            {log.formattedTime}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {log.formattedDate}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="text-[11px] text-gray-600 font-medium block truncate max-w-xs ml-auto">
                            {log.deviceInfo || 'Web Browser'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADMIN LOGIN AUDIT HISTORY TABLE                   */}
      {/* ========================================================= */}
      {activeViewTab === 'logins' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span>Admin Login Audit History</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {loginHistory.length}
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete chronological log of recent logins to the 7Days Admin Panel.
              </p>
            </div>

            {loginHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearLoginHistory}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Admin Account</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Device & Platform</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No past session history recorded yet.
                    </td>
                  </tr>
                ) : (
                  loginHistory.map((item, idx) => {
                    const parsed = parseSessionDetails(item);
                    const isCurrent = activeSession?.id === item.id;
                    return (
                      <tr key={item.id || idx} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FB8500] font-bold flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-gray-900 block text-xs">
                                  {parsed.userIdentifier}
                                </span>
                                {parsed.deviceId && (
                                  <button
                                    type="button"
                                    onClick={() => handleLabelDevice(parsed.deviceId, parsed.userIdentifier)}
                                    className="p-0.5 text-gray-400 hover:text-[#FB8500] hover:bg-amber-50 rounded transition cursor-pointer"
                                    title="Assign or rename device label"
                                  >
                                    <Edit3 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 block font-mono">
                                {item.email} &bull; {item.role || 'Super Admin'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {item.formattedTime}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          {item.formattedDate}
                        </td>

                        <td className="py-3 px-4 text-gray-600">
                          <span className="font-medium text-gray-800 block truncate max-w-xs">
                            {parsed.deviceSummary}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-mono">
                            {parsed.ipAddress} &bull; {parsed.location}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isCurrent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Current
                              </span>
                            ) : parsed.isOnline ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : item.status === 'Terminated' ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                                Disconnected
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                                Completed
                              </span>
                            )}

                            {!isCurrent && item.status !== 'Terminated' && (
                              <button
                                type="button"
                                onClick={() => handleTerminateSession(item)}
                                className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Disconnect remote session"
                              >
                                <PowerOff className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Admin Account */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#FB8500] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">
                    Add Admin Login Account
                  </h3>
                  <span className="text-xs text-gray-500">
                    Register authorized administrative access
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddAccountModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAccount} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newAccountEmail}
                    onChange={(e) => setNewAccountEmail(e.target.value)}
                    placeholder="e.g. manager@7daystoys.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="e.g. Store Manager"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FB8500] focus:ring-2 focus:ring-[#FB8500]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Administrator Role &amp; Permissions
                </label>
                <select
                  value={newAccountRole}
                  onChange={(e) => setNewAccountRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FB8500] font-medium bg-white"
                >
                  <option value="Super Admin">Super Admin (Full Access: Products, Sales, Staff, Hero, Settings)</option>
                  <option value="Store Admin">Store Admin (Catalog Products, Daily Sales, Attendance)</option>
                  <option value="Sales Manager">Sales Manager (Daily Sales Register &amp; History Only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white bg-[#FB8500] hover:bg-[#e07500] font-bold shadow-xs transition cursor-pointer"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
