import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Admin Login and Activity Audit Logging Service
// Captures and stores login details, device metadata, and audit logs of all edits performed in the admin panel.

const STORAGE_KEY_CURRENT_SESSION = '7days_admin_active_session';
const STORAGE_KEY_LOGS_HISTORY = '7days_admin_login_history';
const STORAGE_KEY_ACTIVITY_LOGS = '7days_admin_activity_logs_v1';

// Initial async sync from Supabase if configured
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  // Sync login history from database
  supabase
    .from('admin_login_history')
    .select('*')
    .order('login_timestamp', { ascending: false })
    .limit(50)
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.id,
          email: item.email,
          role: item.role,
          loginTimestamp: item.login_timestamp,
          formattedTime: item.formatted_time,
          formattedDate: item.formatted_date,
          browser: item.browser,
          os: item.os,
          deviceInfo: item.device_info,
          userAgent: item.user_agent,
          status: item.status,
          lastActive: item.login_timestamp
        }));
        const raw = localStorage.getItem(STORAGE_KEY_LOGS_HISTORY);
        const local = raw ? JSON.parse(raw) : [];
        const merged = [...mapped, ...local.filter((l) => !mapped.some((m) => m.id === l.id))].slice(0, 50);
        localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(merged));
      }
    });

  // Sync activity logs from database
  supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.id,
          action: item.action,
          category: item.category,
          title: item.title,
          details: item.details,
          email: item.email,
          role: item.role,
          browser: item.browser,
          os: item.os,
          deviceInfo: item.device_info,
          timestamp: item.created_at,
          formattedTime: item.formatted_time,
          formattedDate: item.formatted_date
        }));
        const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_LOGS);
        const local = raw ? JSON.parse(raw) : [];
        const merged = [...mapped, ...local.filter((l) => !mapped.some((m) => m.id === l.id))].slice(0, 200);
        localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(merged));
        window.dispatchEvent(new Event('7days_admin_activity_updated'));
      }
    });
}

/**
 * Helper to detect browser name from user agent
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect Browser
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Apple Safari';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

  return { browser, os, full: `${browser} on ${os}` };
}

/**
 * Record any action / edit performed by an admin in the panel
 * @param {Object} param0
 * @param {'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK' | 'DUTY_CHANGE' | 'LOGIN'} param0.action
 * @param {'Products' | 'Daily Sales' | 'Attendance' | 'Store Updates' | 'Showcase' | 'Settings' | 'Security'} param0.category
 * @param {string} param0.title - Short summary of the action
 * @param {string} [param0.details] - Detailed info of what was edited
 * @param {string} [param0.userEmail] - Optional admin email override
 */
export function recordAdminAction({
  action = 'UPDATE',
  category = 'Products',
  title = '',
  details = '',
  userEmail = null
}) {
  try {
    const session = getCurrentAdminSession();
    const email = userEmail || session?.email || 'admin@7days.com';
    const role = session?.role || 'Super Admin';
    const now = new Date();
    const { browser, os, full } = getBrowserInfo();

    const newLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      category,
      title: title || 'Admin action performed',
      details: details || '',
      email,
      role,
      browser,
      os,
      deviceInfo: full,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const existing = getAdminActivityLogs();
    const updated = [newLog, ...existing].slice(0, 200); // Retain latest 200 activity logs
    localStorage.setItem(STORAGE_KEY_ACTIVITY_LOGS, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_activity_updated'));
    }

    // Mirror to Supabase database if connected
    if (isSupabaseConfigured) {
      supabase.from('admin_activity_logs').insert([{
        id: newLog.id,
        action: newLog.action,
        category: newLog.category,
        title: newLog.title,
        details: newLog.details,
        email: newLog.email,
        role: newLog.role,
        browser: newLog.browser,
        os: newLog.os,
        device_info: newLog.deviceInfo,
        created_at: newLog.timestamp,
        formatted_time: newLog.formattedTime,
        formatted_date: newLog.formattedDate
      }]).then(({ error }) => {
        if (error) console.warn('Supabase admin_activity_logs insert notice:', error.message);
      });
    }

    return newLog;
  } catch (err) {
    console.error('Failed to record admin activity log:', err);
    return null;
  }
}

/**
 * Get all admin action and edit logs
 */
export function getAdminActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Clear action logs
 */
export function clearAdminActivityLogs() {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVITY_LOGS);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_activity_updated'));
    }
    if (isSupabaseConfigured) {
      supabase.from('admin_activity_logs').delete().neq('id', 'preserve_none').then();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Record a new login event
 */
export function recordAdminLogin(userEmail, role = 'Super Admin') {
  try {
    const now = new Date();
    const { browser, os, full } = getBrowserInfo();

    const sessionData = {
      id: 'session_' + Date.now(),
      email: userEmail || 'admin@7days.com',
      role: role || 'Super Admin',
      loginTimestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      browser,
      os,
      deviceInfo: full,
      userAgent: navigator.userAgent,
      status: 'Active',
      lastActive: now.toISOString()
    };

    // Store in sessionStorage and localStorage for current session persistence
    sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(sessionData));

    // Append to login audit trail in localStorage
    const history = getAdminLoginHistory();
    const updatedHistory = [sessionData, ...history.filter(h => h.id !== sessionData.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(updatedHistory));

    // Mirror to Supabase database if connected
    if (isSupabaseConfigured) {
      supabase.from('admin_login_history').insert([{
        id: sessionData.id,
        email: sessionData.email,
        role: sessionData.role,
        login_timestamp: sessionData.loginTimestamp,
        formatted_time: sessionData.formattedTime,
        formatted_date: sessionData.formattedDate,
        browser: sessionData.browser,
        os: sessionData.os,
        device_info: sessionData.deviceInfo,
        user_agent: sessionData.userAgent,
        status: sessionData.status
      }]).then(({ error }) => {
        if (error) console.warn('Supabase admin_login_history insert notice:', error.message);
      });
    }

    // Also record an entry in the master activity log
    recordAdminAction({
      action: 'LOGIN',
      category: 'Security',
      title: `Administrator Logged In`,
      details: `Signed in as ${userEmail || 'admin@7days.com'} from ${full}`,
      userEmail: userEmail || 'admin@7days.com'
    });

    return sessionData;
  } catch (err) {
    console.error('Failed to record admin login details:', err);
    return null;
  }
}

/**
 * Get current active session details
 */
export function getCurrentAdminSession(fallbackUser = null) {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (stored) {
      return JSON.parse(stored);
    }

    // If session storage was empty but user is logged in, check recent history
    const history = getAdminLoginHistory();
    if (history.length > 0) {
      sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(history[0]));
      return history[0];
    }

    if (fallbackUser) {
      return recordAdminLogin(fallbackUser.email || 'admin@7days.com');
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get recent login audit history
 */
export function getAdminLoginHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Clear login history
 */
export function clearAdminLoginHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY_LOGS_HISTORY);
    if (isSupabaseConfigured) {
      supabase.from('admin_login_history').delete().neq('id', 'preserve_none').then();
    }
    return true;
  } catch {
    return false;
  }
}
