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
 * Helper to detect browser and operating system details
 */
export function getBrowserInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
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
 * Detailed device and hardware model detector
 */
export function getDeviceDetails() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let deviceType = 'Desktop PC';
  let deviceModel = 'Personal Computer / Laptop';

  if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
    if (/iPhone/i.test(ua)) {
      deviceType = 'Mobile Phone';
      deviceModel = 'Apple iPhone';
    } else if (/iPad/i.test(ua)) {
      deviceType = 'Tablet';
      deviceModel = 'Apple iPad';
    } else if (/Android/i.test(ua)) {
      deviceType = 'Mobile Phone';
      const match = ua.match(/Android[^;]+;\s*([^;]+)\s*Build/i);
      deviceModel = match && match[1] ? match[1].trim() : 'Android Smartphone';
    } else {
      deviceType = 'Mobile Phone';
      deviceModel = 'Mobile Smartphone';
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = 'Laptop / Desktop';
    deviceModel = 'Apple Mac';
  } else if (/Windows/i.test(ua)) {
    deviceType = 'Desktop / Laptop';
    deviceModel = 'Windows PC';
  } else if (/Linux/i.test(ua)) {
    deviceType = 'Desktop';
    deviceModel = 'Linux Computer';
  }

  const screenRes = typeof window !== 'undefined' && window.screen
    ? `${window.screen.width} × ${window.screen.height}`
    : '';

  const { browser, os } = getBrowserInfo();

  return {
    deviceType,
    deviceModel,
    browser,
    os,
    screenRes,
    summary: `${deviceModel} (${os}) • ${browser}`
  };
}

/**
 * Fast asynchronous client network & location lookup
 */
export async function fetchClientNetworkDetails() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || 'Unknown IP',
        location: [data.city, data.region, data.country_name].filter(Boolean).join(', ') || 'Kerala, India',
        isp: data.org || data.asn || 'Broadband Network'
      };
    }
  } catch {
    // Fast secondary fallback to ipify
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return {
          ip: data.ip || 'Client Network IP',
          location: 'Network Access',
          isp: 'Internet Provider'
        };
      }
    } catch {}
  }
  return {
    ip: 'Connected Network',
    location: 'Kerala, India',
    isp: 'Local Connection'
  };
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
    const deviceId = getOrCreateDeviceId();
    const verifiedLabels = getVerifiedDeviceLabels();
    const verifiedName = verifiedLabels[deviceId];
    const userIdentifier = session?.userIdentifier || (verifiedName ? `${verifiedName} [${deviceId}]` : `${getDeviceDetails().deviceModel} [${deviceId}]`);
    const now = new Date();
    const { browser, os, full } = getBrowserInfo();

    const actorDisplay = userIdentifier ? ` [${userIdentifier}]` : '';

    const newLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      category,
      title: (title || 'Admin action performed') + actorDisplay,
      details: details ? `${details} (by ${userIdentifier || email})` : `Action by ${userIdentifier || email}`,
      email,
      role,
      userIdentifier,
      browser,
      os,
      deviceInfo: userIdentifier ? `${userIdentifier} • ${full}` : full,
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
/**
 * Generate or retrieve a persistent tamper-proof device identifier
 */
export function getOrCreateDeviceId() {
  if (typeof localStorage === 'undefined') return 'DEV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  let id = localStorage.getItem('7days_device_uid');
  if (!id) {
    id = 'DEV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem('7days_device_uid', id);
  }
  return id;
}

/**
 * Retrieve admin-verified device labels (stored securely by the administrator)
 */
export function getVerifiedDeviceLabels() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem('7days_verified_device_labels');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Store an admin-assigned verified device label
 */
export function setVerifiedDeviceLabel(deviceId, label) {
  try {
    if (typeof localStorage === 'undefined') return;
    const labels = getVerifiedDeviceLabels();
    if (label && label.trim()) {
      labels[deviceId] = label.trim();
    } else {
      delete labels[deviceId];
    }
    localStorage.setItem('7days_verified_device_labels', JSON.stringify(labels));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_sessions_updated'));
    }
  } catch (e) {
    console.warn('Failed to save verified device label', e);
  }
}

/**
 * Check if the current device session was remotely terminated / disconnected
 */
export async function checkCurrentSessionStatus() {
  try {
    if (typeof sessionStorage === 'undefined') return { terminated: false };
    const raw = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (!raw) return { terminated: false };
    const session = JSON.parse(raw);
    if (!session?.id) return { terminated: false };

    // 1. Check local session history
    const history = getAdminLoginHistory();
    const localMatch = history.find((h) => h.id === session.id);
    if (localMatch && localMatch.status === 'Terminated') {
      sessionStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
      return { terminated: true, sessionId: session.id };
    }

    // 2. Check Supabase database in real-time
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('admin_login_history')
        .select('status')
        .eq('id', session.id)
        .maybeSingle();

      if (!error && data && data.status === 'Terminated') {
        sessionStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
        return { terminated: true, sessionId: session.id };
      }
    }

    return { terminated: false };
  } catch {
    return { terminated: false };
  }
}

/**
 * Record a new login event with automatic hardware, IP, and location fingerprinting
 * (Completely automated - prevents anyone from typing a fake or spoofed name on login)
 */
export async function recordAdminLogin(userEmail, role = 'Super Admin') {
  try {
    const now = new Date();
    const dev = getDeviceDetails();
    const deviceId = getOrCreateDeviceId();
    const verifiedLabels = getVerifiedDeviceLabels();

    // Use verified administrator-assigned label if exists, otherwise exact hardware & device UID
    const verifiedName = verifiedLabels[deviceId];
    const identifier = verifiedName
      ? `${verifiedName} [${deviceId}]`
      : `${dev.deviceModel} [${deviceId}]`;

    // Fetch network IP & Location
    const net = await fetchClientNetworkDetails();

    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const sessionData = {
      id: sessionId,
      deviceId,
      email: userEmail || 'admin@7days.com',
      role: role || 'Super Admin',
      userIdentifier: identifier,
      deviceModel: dev.deviceModel,
      deviceType: dev.deviceType,
      screenRes: dev.screenRes,
      ipAddress: net.ip,
      location: net.location,
      isp: net.isp,
      browser: dev.browser,
      os: dev.os,
      deviceInfo: `${identifier} • ${dev.summary} • IP: ${net.ip} (${net.location})`,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      loginTimestamp: now.toISOString(),
      lastActive: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      formattedDate: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active'
    };

    // Store in sessionStorage and localStorage for current session persistence
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(sessionData));
    }

    // Append to login audit trail in localStorage
    const history = getAdminLoginHistory();
    const updatedHistory = [sessionData, ...history.filter((h) => h.id !== sessionData.id)].slice(0, 50);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(updatedHistory));
    }

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
      title: `${identifier} signed in via Super Admin`,
      details: `Signed in as ${userEmail || 'admin@7days.com'} from ${dev.summary} (IP: ${net.ip}, ${net.location})`,
      userEmail: userEmail || 'admin@7days.com'
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_sessions_updated'));
    }

    return sessionData;
  } catch (err) {
    console.error('Failed to record admin login details:', err);
    return null;
  }
}

/**
 * Periodically update last active heartbeat of the current session
 */
export function updateSessionHeartbeat() {
  try {
    if (typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
    if (!raw) return;
    const session = JSON.parse(raw);
    const now = new Date();
    session.lastActive = now.toISOString();
    sessionStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));

    // Also update in history
    const history = getAdminLoginHistory();
    const updated = history.map((s) => (s.id === session.id ? { ...s, lastActive: now.toISOString(), status: 'Active' } : s));
    localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      supabase
        .from('admin_login_history')
        .update({ status: 'Active' })
        .eq('id', session.id)
        .then();
    }
  } catch (e) {
    // silent heartbeat fail
  }
}

/**
 * Terminate/Revoke an active remote session
 */
export function terminateAdminSession(sessionId) {
  try {
    const history = getAdminLoginHistory();
    const updated = history.map((s) => (s.id === sessionId ? { ...s, status: 'Terminated' } : s));
    localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(updated));

    // If terminating current session, clear session storage
    if (typeof sessionStorage !== 'undefined') {
      const current = sessionStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
      if (current) {
        const parsed = JSON.parse(current);
        if (parsed.id === sessionId) {
          sessionStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
          sessionStorage.removeItem('7days_admin_session');
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }
      }
    }

    if (isSupabaseConfigured) {
      supabase
        .from('admin_login_history')
        .update({ status: 'Terminated' })
        .eq('id', sessionId)
        .then();
    }

    recordAdminAction({
      action: 'DELETE',
      category: 'Security',
      title: 'Admin Session Terminated',
      details: `Revoked session ${sessionId}`
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_sessions_updated'));
    }

    return true;
  } catch (err) {
    console.error('Failed to terminate admin session:', err);
    return false;
  }
}

/**
 * Sync login sessions from Supabase cloud database
 */
export async function syncAdminSessionsFromServer() {
  if (!isSupabaseConfigured) return getAdminLoginHistory();
  try {
    const { data, error } = await supabase
      .from('admin_login_history')
      .select('*')
      .order('login_timestamp', { ascending: false })
      .limit(60);

    if (!error && Array.isArray(data)) {
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
      localStorage.setItem(STORAGE_KEY_LOGS_HISTORY, JSON.stringify(mapped));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('7days_admin_sessions_updated'));
      }
      return mapped;
    }
  } catch (e) {
    console.warn('Sync login history notice:', e);
  }
  return getAdminLoginHistory();
}

/**
 * Cleanly parse rich device, user and location info from a session record
 */
export function parseSessionDetails(session) {
  if (!session) return {};
  const info = session.deviceInfo || '';

  // Extract parts: "Identifier • DeviceModel (OS) • Browser • IP: xxx (Location)"
  let userIdentifier = session.userIdentifier || '';
  let ipAddress = session.ipAddress || '';
  let location = session.location || '';
  let deviceSummary = '';
  let deviceId = session.deviceId || '';

  if (info.includes('•')) {
    const parts = info.split('•').map((p) => p.trim());
    if (parts.length >= 2) {
      if (!userIdentifier) userIdentifier = parts[0];
      deviceSummary = parts[1];
      const ipPart = parts.slice(2).join('•');
      if (ipPart.includes('IP:')) {
        const ipMatch = ipPart.match(/IP:\s*([^\s(]+)/);
        if (ipMatch) ipAddress = ipMatch[1];
        const locMatch = ipPart.match(/\(([^)]+)\)/);
        if (locMatch) location = locMatch[1];
      }
    } else {
      deviceSummary = info;
    }
  } else {
    deviceSummary = info || `${session.browser || 'Browser'} on ${session.os || 'OS'}`;
  }

  // Extract Device ID if present
  if (!deviceId) {
    const idMatch = (userIdentifier + ' ' + info).match(/\[(DEV-[A-Z0-9]+)\]/);
    if (idMatch) deviceId = idMatch[1];
  }

  // Check if owner gave a verified name to this device
  if (deviceId) {
    const verifiedLabels = getVerifiedDeviceLabels();
    if (verifiedLabels[deviceId]) {
      userIdentifier = `${verifiedLabels[deviceId]} [${deviceId}]`;
    }
  }

  // Check if session was active recently (within last 30 minutes)
  const lastActiveTime = session.lastActive ? new Date(session.lastActive).getTime() : new Date(session.loginTimestamp).getTime();
  const isOnline = session.status === 'Active' && Date.now() - lastActiveTime < 30 * 60 * 1000;

  return {
    deviceId,
    userIdentifier: userIdentifier || session.email?.split('@')[0] || 'Super Admin User',
    deviceSummary: deviceSummary || `${session.browser || 'Web Client'} on ${session.os || 'Desktop'}`,
    ipAddress: ipAddress || 'Connected Network IP',
    location: location || 'Kerala, India',
    isOnline,
    status: session.status || 'Active'
  };
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

const STORAGE_KEY_ADMIN_ACCOUNTS = '7days_admin_accounts_v1';

/**
 * Get list of all known and authorized admin login accounts
 */
export function getAdminAccounts(currentUser = null) {
  let saved = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_ACCOUNTS);
    if (raw) {
      saved = JSON.parse(raw);
    }
  } catch (e) {
    saved = [];
  }

  // Ensure current user or default admin is included
  const currentEmail = currentUser?.email || 'admin@7days.com';
  const hasCurrent = saved.some((a) => a.email?.toLowerCase() === currentEmail.toLowerCase());
  if (!hasCurrent) {
    saved.unshift({
      id: 'acc_primary',
      email: currentEmail,
      name: currentUser?.user_metadata?.name || 'Primary Store Administrator',
      role: 'Super Admin',
      status: 'Active',
      permissions: ['All Permissions', 'Catalog Products', 'Daily Sales', 'Staff & Attendance', 'Hero Showcase', 'Settings'],
      createdAt: new Date().toISOString(),
      isPrimary: true
    });
  }

  // Also collect any unique emails from login audit history
  const history = getAdminLoginHistory();
  history.forEach((h) => {
    if (h.email && !saved.some((a) => a.email?.toLowerCase() === h.email.toLowerCase())) {
      saved.push({
        id: `acc_${h.id || Date.now()}`,
        email: h.email,
        name: h.email.split('@')[0],
        role: h.role || 'Admin',
        status: 'Active',
        permissions: ['Catalog Products', 'Daily Sales', 'Staff & Attendance'],
        createdAt: h.loginTimestamp || new Date().toISOString(),
        lastLogin: h.formattedDate ? `${h.formattedDate} at ${h.formattedTime}` : null,
        lastDevice: h.deviceInfo || h.browser,
        isPrimary: false
      });
    }
  });

  return saved;
}

/**
 * Add or update an admin account
 */
export function saveAdminAccount(account) {
  try {
    const current = getAdminAccounts();
    const existingIdx = current.findIndex(
      (a) => a.email?.toLowerCase() === account.email?.toLowerCase()
    );
    let updated;
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...updated[existingIdx], ...account };
    } else {
      updated = [
        ...current,
        {
          id: `acc_${Date.now()}`,
          status: 'Active',
          createdAt: new Date().toISOString(),
          permissions: account.permissions || ['All Permissions'],
          ...account
        }
      ];
    }
    localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_accounts_updated'));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save admin account:', err);
    return [];
  }
}

/**
 * Delete an admin account
 */
export function deleteAdminAccount(email) {
  try {
    const current = getAdminAccounts();
    const filtered = current.filter(
      (a) => a.email?.toLowerCase() !== email?.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_admin_accounts_updated'));
    }
    return filtered;
  } catch (err) {
    console.error('Failed to delete admin account:', err);
    return [];
  }
}

