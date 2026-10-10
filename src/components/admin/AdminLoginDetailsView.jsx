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
  AlertCircle
} from 'lucide-react';
import {
  getCurrentAdminSession,
  getAdminLoginHistory,
  clearAdminLoginHistory,
  getAdminActivityLogs,
  clearAdminActivityLogs
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

  // Active view tab: 'activities' (Admin Edits & Actions) or 'logins' (Login Audit History)
  const [activeViewTab, setActiveViewTab] = useState('activities');

  // Activity filter states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');

  const refreshData = () => {
    const current = getCurrentAdminSession(user);
    setActiveSession(current);
    setLoginHistory(getAdminLoginHistory());
    setActivityLogs(getAdminActivityLogs());
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Listen to live updates from other tabs/actions
  useEffect(() => {
    const handleActivityUpdate = () => {
      setActivityLogs(getAdminActivityLogs());
    };
    window.addEventListener('7days_admin_activity_updated', handleActivityUpdate);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('7days_admin_activity_updated', handleActivityUpdate);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

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
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Audit, Edits & Session Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Admin Audit History & Logs</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Audit Trail
            </span>
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-3xl">
            Complete chronological record of all administrative activities, edits, price changes, product deletions, sales registrations, and staff duty adjustments.
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
        <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-2xl border border-gray-200">
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
            <span>Admin Activity & Edit History</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
              {activityLogs.length}
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
        </div>

        {activeViewTab === 'activities' ? (
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
      {/* TAB 1: ADMIN EDIT & ACTIVITY AUDIT TRAIL                  */}
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
                  loginHistory.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">
                              {item.email}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {item.role || 'Super Admin'}
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
                        <span className="truncate block max-w-xs">
                          {item.deviceInfo || 'Web Browser'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {idx === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Current
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
