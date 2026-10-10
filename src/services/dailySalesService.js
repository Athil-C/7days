/**
 * 7Days Toys & Babyshop - Daily Sales Sheet Service
 * Digital A4 Paper replacement for end-of-day sales recording,
 * salesperson/staff on duty attendance, automatic total calculation,
 * and 1-click WhatsApp dispatch to the store WhatsApp number.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { clearDateAttendance } from './attendanceService';

const STORAGE_KEY = '7days_daily_sales_sheets_v1';
const DELETED_DATES_KEY = '7days_deleted_sales_dates_v1';

// Empty initial sales sheets (starts fresh)
const DEFAULT_SHEETS = {};

export function getDeletedSalesDates() {
  try {
    const raw = localStorage.getItem(DELETED_DATES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveDeletedSalesDate(dateStr) {
  try {
    const set = getDeletedSalesDates();
    set.add(dateStr);
    localStorage.setItem(DELETED_DATES_KEY, JSON.stringify([...set]));
  } catch {}
}

export function clearDeletedSalesDate(dateStr) {
  try {
    const set = getDeletedSalesDates();
    set.delete(dateStr);
    localStorage.setItem(DELETED_DATES_KEY, JSON.stringify([...set]));
  } catch {}
}

/**
 * Proactively fetches all daily sales sheets from Supabase and overwrites localStorage
 * with fresh authoritative server data on every page load/reload.
 */
export async function syncDailySalesFromServer() {
  if (!isSupabaseConfigured) return getStoredSheets();
  try {
    const { data, error } = await supabase.from('daily_sales_sheets').select('*');
    if (!error && Array.isArray(data)) {
      const deletedDates = getDeletedSalesDates();
      const freshMap = {};

      for (const row of data) {
        if (!row.date_str) continue;

        // If explicitly deleted by user, purge from Supabase
        if (deletedDates.has(row.date_str)) {
          await supabase.from('daily_sales_sheets').delete().eq('date_str', row.date_str).catch(() => {});
          continue;
        }

        if (row.data) {
          freshMap[row.date_str] = row.data;
        }
      }

      // Overwrite local cache with authoritative server data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(freshMap));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('7days_daily_sales_updated'));
      }
      return freshMap;
    }
  } catch (err) {
    console.warn('Failed to sync daily sales from server:', err);
  }
  return getStoredSheets();
}

/**
 * Actively fetches a specific date's daily sales sheet from Supabase server
 * and updates local cache immediately.
 */
export async function fetchDailySalesSheet(dateStr) {
  if (!dateStr) return getDailySalesSheet(dateStr);
  if (isSupabaseConfigured) {
    try {
      const deletedDates = getDeletedSalesDates();
      if (deletedDates.has(dateStr)) {
        await supabase.from('daily_sales_sheets').delete().eq('date_str', dateStr).catch(() => {});
        const sheets = getStoredSheets();
        delete sheets[dateStr];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
        return getDailySalesSheet(dateStr);
      }

      const { data, error } = await supabase
        .from('daily_sales_sheets')
        .select('*')
        .eq('date_str', dateStr)
        .maybeSingle();

      if (!error) {
        const sheets = getStoredSheets();
        if (data && data.data) {
          sheets[dateStr] = data.data;
        } else {
          delete sheets[dateStr];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
        return getDailySalesSheet(dateStr);
      }
    } catch (err) {
      console.warn('fetchDailySalesSheet error:', err);
    }
  }
  return getDailySalesSheet(dateStr);
}

// Initial sync from Supabase when app loads
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  syncDailySalesFromServer();

  // Realtime subscription for cross-tab, cross-device instant synchronization
  try {
    supabase
      .channel('daily_sales_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_sales_sheets' },
        (payload) => {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const sheets = raw ? JSON.parse(raw) : {};
            if (payload.eventType === 'DELETE') {
              const oldDate = payload.old?.date_str;
              if (oldDate && sheets[oldDate]) {
                delete sheets[oldDate];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
                window.dispatchEvent(new Event('7days_daily_sales_updated'));
              }
            } else if (payload.new && payload.new.date_str) {
              sheets[payload.new.date_str] = payload.new.data;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
              window.dispatchEvent(new Event('7days_daily_sales_updated'));
            }
          } catch (e) {
            console.warn('Realtime sync error:', e);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Realtime subscribe notice:', err);
  }
}

function getStoredSheets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHEETS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      // Purge any legacy demo sheet
      if (parsed['2026-10-08'] && parsed['2026-10-08'].salesperson === 'Athil, Salman') {
        delete parsed['2026-10-08'];
        saveStoredSheets(parsed);
      }
      return parsed;
    }
    return DEFAULT_SHEETS;
  } catch {
    return DEFAULT_SHEETS;
  }
}

export async function saveSingleDailySheetToDb(dateStr, sheetData) {
  if (!isSupabaseConfigured || !dateStr) return;
  try {
    await supabase.from('daily_sales_sheets').upsert({
      date_str: dateStr,
      data: sheetData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'date_str' });
  } catch (err) {
    console.warn('Supabase upsert daily sheet error:', err);
  }
}

async function saveStoredSheets(sheets, deletedDateStr = null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_daily_sales_updated'));
    }

    if (isSupabaseConfigured) {
      if (deletedDateStr) {
        try {
          await supabase.from('daily_sales_sheets').delete().eq('date_str', deletedDateStr);
        } catch (e) {
          console.warn('Supabase delete daily sheet error:', e);
        }
      }

      if (sheets && typeof sheets === 'object') {
        const promises = Object.keys(sheets).map((dateStr) =>
          supabase.from('daily_sales_sheets').upsert({
            date_str: dateStr,
            data: sheets[dateStr],
            updated_at: new Date().toISOString()
          }, { onConflict: 'date_str' }).catch((e) => console.warn(e))
        );
        await Promise.all(promises);
      }
    }
  } catch (err) {
    console.error('Failed to save daily sales sheet:', err);
  }
}

/**
 * Normalizes day data from either legacy array or structured object
 */
function normalizeDayRecord(entry) {
  if (Array.isArray(entry)) {
    return {
      salesperson: '',
      items: entry,
      isLocked: false,
      lockedAt: null
    };
  }
  if (entry && typeof entry === 'object') {
    return {
      salesperson: entry.salesperson || '',
      items: Array.isArray(entry.items) ? entry.items : [],
      isLocked: Boolean(entry.isLocked),
      lockedAt: entry.lockedAt || null
    };
  }
  return {
    salesperson: '',
    items: [],
    isLocked: false,
    lockedAt: null
  };
}

/**
 * Get items sold and salesperson on a given date (YYYY-MM-DD)
 */
export function getDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  const total = day.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const cashTotal = day.items
    .filter((it) => it.paymentMethod === 'Cash')
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const upiTotal = day.items
    .filter((it) => it.paymentMethod === 'UPI')
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const cardTotal = day.items
    .filter((it) => it.paymentMethod === 'Card')
    .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);

  return {
    date: dateStr,
    salesperson: day.salesperson,
    items: day.items,
    total,
    cashTotal,
    upiTotal,
    cardTotal,
    count: day.items.length,
    isLocked: Boolean(day.isLocked),
    lockedAt: day.lockedAt || null
  };
}

/**
 * Lock and finalize daily sales sheet (Permanently locks editing for workers)
 */
export function lockDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  day.isLocked = true;
  day.lockedAt = new Date().toISOString();
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

/**
 * Unlock daily sales sheet (Admin override)
 */
export async function unlockDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  day.isLocked = false;
  day.lockedAt = null;
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

export function isDailySheetLocked(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  return Boolean(day.isLocked);
}

/**
 * Update salesperson / staff name on duty for a specific date
 */
export function setDailySalesperson(dateStr, salespersonName) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  day.salesperson = (salespersonName || '').trim();
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

/**
 * Add a new sold product item to a specific date
 */
export async function addDailySaleItem(dateStr, item) {
  clearDeletedSalesDate(dateStr);
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    itemName: (item.itemName || '').trim(),
    amount: Number(item.amount) || 0,
    paymentMethod: item.paymentMethod || 'Cash',
    time: item.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  };
  day.items = [...day.items, newItem];
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

/**
 * Delete a sold item by ID (guaranteed deletion locally and in database)
 */
export async function deleteDailySaleItem(dateStr, itemId) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  day.items = day.items.filter((it) => it.id !== itemId);
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  await saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

/**
 * Clear all items for a given date
 */
export async function clearDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  day.items = [];
  sheets[dateStr] = day;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('7days_daily_sales_updated'));
  }
  await saveSingleDailySheetToDb(dateStr, day);
  return getDailySalesSheet(dateStr);
}

/**
 * Permanently deletes or resets the daily sales sheet for a given date
 * (Bypasses lock when authorized by Store Owner)
 */
export async function deleteDailySalesRecord(dateStr) {
  saveDeletedSalesDate(dateStr);
  const sheets = getStoredSheets();
  delete sheets[dateStr];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_daily_sales_updated'));
    }
  } catch {}

  if (isSupabaseConfigured) {
    try {
      await supabase.from('daily_sales_sheets').delete().eq('date_str', dateStr);
    } catch (e) {
      console.warn('Supabase delete daily sheet error:', e);
    }
  }

  // Also clear attendance for this date so attendance ledger is un-marked
  try {
    await clearDateAttendance(dateStr);
  } catch (e) {
    console.warn('clearDateAttendance error:', e);
  }

  return getDailySalesSheet(dateStr);
}

/**
 * List of all dates that have recorded sales
 */
export function getAllSalesDates() {
  const sheets = getStoredSheets();
  return Object.keys(sheets)
    .sort((a, b) => b.localeCompare(a))
    .map((dateStr) => {
      const sheet = getDailySalesSheet(dateStr);
      return {
        date: dateStr,
        salesperson: sheet.salesperson,
        total: sheet.total,
        count: sheet.count,
        isLocked: sheet.isLocked
      };
    });
}

/**
 * Format sales sheet into a clean WhatsApp text message
 */
export function formatDailySalesWhatsAppMessage(dateStr, sheet) {
  if (!sheet || typeof sheet !== 'object' || typeof sheet.then === 'function') {
    return '';
  }

  const formattedDate = new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const lines = [
    `🛍️ *7DAYS TOYS & BABYSHOP — DAILY SALES SHEET*`,
    `📍 Payod, Mananthavady, Wayanad`,
    `📅 *Date:* ${formattedDate}`
  ];

  if (sheet.isLocked) {
    lines.push(`🔒 *STATUS: CONFIRMED & LOCKED EOD CLOSING*`);
  }

  if (sheet.salesperson) {
    const staffList = sheet.salesperson.split(',').map((s) => s.trim()).filter(Boolean);
    const countLabel = staffList.length > 1 ? ` (${staffList.length} Present)` : '';
    lines.push(`👥 *Staff on Duty${countLabel}:* ${sheet.salesperson}`);
  }

  lines.push(`──────────────────────────────`);
  lines.push(`📦 *ITEMS SOLD:*`);

  if (!sheet.items || sheet.items.length === 0) {
    lines.push(`_No sales recorded for this date._`);
  } else {
    sheet.items.forEach((it, idx) => {
      const mode = it.paymentMethod ? ` (${it.paymentMethod})` : '';
      const amountNum = Number(it.amount || 0);
      lines.push(`${idx + 1}. *${it.itemName || 'Item'}* — ₹${amountNum.toLocaleString('en-IN')}${mode}`);
    });
  }

  const total = Number(sheet.total ?? sheet.totalSales ?? 0);
  const count = Number(sheet.count ?? sheet.items?.length ?? 0);
  const cash = Number(sheet.cashTotal ?? 0);
  const upi = Number(sheet.upiTotal ?? 0);
  const card = Number(sheet.cardTotal ?? 0);

  lines.push(`──────────────────────────────`);
  lines.push(`📊 *DAY SUMMARY:*`);
  lines.push(`• Total Items Sold: ${count}`);
  if (sheet.cashTotal !== undefined) {
    lines.push(`• 💵 Cash Sales: ₹${cash.toLocaleString('en-IN')}`);
    lines.push(`• 📱 UPI / Online: ₹${(upi + card).toLocaleString('en-IN')}`);
  }
  lines.push(`💰 *TOTAL DAY COLLECTION: ₹${total.toLocaleString('en-IN')}*`);
  lines.push(`──────────────────────────────`);
  lines.push(`_7Days Toys & Cycles, Payod_`);

  return lines.join('\n');
}
