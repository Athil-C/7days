import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  Laptop,
  CheckCircle2,
  X,
  History,
  Trash2,
  RefreshCw,
  LogOut,
  User,
  Activity,
  Globe
} from 'lucide-react';
import {
  getCurrentAdminSession,
  getAdminLoginHistory,
  clearAdminLoginHistory
} from '../../services/adminLogService';

export default function AdminLoginDetailsModal({ isOpen, onClose, user, onSignOut }) {
  const [activeSession, setActiveSession] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [sessionUptime, setSessionUptime] = useState('');

  const refreshData = () => {
    const current = getCurrentAdminSession(user);
    setActiveSession(current);
    setLoginHistory(getAdminLoginHistory());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, user]);

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

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear past login history logs? Current session will be preserved.')) {
      clearAdminLoginHistory();
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 font-body">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                Admin Session & Login Details
              </h2>
              <p className="text-xs text-gray-500">
                Active authentication state, device information, and security audit log
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Card */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#111c30] to-[#0c1424] text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Live Session
            </span>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {sessionUptime || 'Active'}
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
              {activeSession?.email ? activeSession.email.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white truncate">
                {activeSession?.email || user?.email || 'admin@7days.com'}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {activeSession?.role || 'Super Admin'} &bull; 7Days Toys Wayanad
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-700/60 text-xs">
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> Logged In Time
              </span>
              <span className="font-semibold text-slate-100">
                {activeSession?.formattedDate || 'Today'}, {activeSession?.formattedTime || 'Active'}
              </span>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Laptop className="w-3 h-3 text-cyan-400" /> Device & Browser
              </span>
              <span className="font-semibold text-slate-100 truncate block">
                {activeSession?.deviceInfo || 'Desktop Browser'}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log / Recent Logins */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-gray-400" />
              Recent Admin Logins History ({loginHistory.length})
            </h4>

            {loginHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[11px] font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl max-h-48 overflow-y-auto divide-y divide-gray-100">
            {loginHistory.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                No past session history recorded yet.
              </div>
            ) : (
              loginHistory.map((item, idx) => (
                <div key={item.id || idx} className="p-3 text-xs flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 block truncate">
                        {item.email}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate">
                        {item.deviceInfo || 'Web Browser'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="font-semibold text-gray-700 block">
                      {item.formattedTime}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {item.formattedDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <div className="flex items-center gap-2">
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
