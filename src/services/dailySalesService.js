/**
 * 7Days Toys & Babyshop - Daily Sales Sheet Service
 * Digital A4 Paper replacement for end-of-day sales recording,
 * salesperson/staff on duty attendance, automatic total calculation,
 * and 1-click WhatsApp dispatch to the store WhatsApp number.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = '7days_daily_sales_sheets_v1';

// Empty initial sales sheets (starts fresh)
const DEFAULT_SHEETS = {};

// Initial sync from Supabase if configured
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  supabase
    .from('daily_sales_sheets')
    .select('*')
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const local = raw ? JSON.parse(raw) : {};
        const merged = { ...local };
        data.forEach((row) => {
          if (row.date_str && row.data) {
            merged[row.date_str] = row.data;
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('7days_daily_sales_updated'));
      }
    });
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

function saveStoredSheets(sheets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_daily_sales_updated'));
    }
    // Database sync if Supabase is active
    if (isSupabaseConfigured && sheets && typeof sheets === 'object') {
      Object.keys(sheets).forEach(async (dateStr) => {
        try {
          await supabase.from('daily_sales_sheets').upsert({
            date_str: dateStr,
            data: sheets[dateStr],
            updated_at: new Date().toISOString()
          }, { onConflict: 'date_str' });
        } catch {}
      });
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
  saveStoredSheets(sheets);
  return getDailySalesSheet(dateStr);
}

/**
 * Unlock daily sales sheet (Admin override)
 */
export function unlockDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  day.isLocked = false;
  day.lockedAt = null;
  sheets[dateStr] = day;
  saveStoredSheets(sheets);
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
  saveStoredSheets(sheets);
  return getDailySalesSheet(dateStr);
}

/**
 * Add a new sold product item to a specific date
 */
export function addDailySaleItem(dateStr, item) {
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
  saveStoredSheets(sheets);
  return getDailySalesSheet(dateStr);
}

/**
 * Delete a sold item by ID
 */
export function deleteDailySaleItem(dateStr, itemId) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  day.items = day.items.filter((it) => it.id !== itemId);
  sheets[dateStr] = day;
  saveStoredSheets(sheets);
  return getDailySalesSheet(dateStr);
}

/**
 * Clear all items for a given date
 */
export function clearDailySalesSheet(dateStr) {
  const sheets = getStoredSheets();
  const day = normalizeDayRecord(sheets[dateStr]);
  if (day.isLocked) return getDailySalesSheet(dateStr);
  day.items = [];
  sheets[dateStr] = day;
  saveStoredSheets(sheets);
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
  const formattedDate = new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const lines = [
    ` *7DAYS TOYS & BABYSHOP — DAILY SALES SHEET*`,
    ` Payod, Mananthavady, Wayanad`,
    ` *Date:* ${formattedDate}`
  ];

  if (sheet.isLocked) {
    lines.push(` *STATUS: CONFIRMED & LOCKED EOD CLOSING*`);
  }

  if (sheet.salesperson) {
    const staffList = sheet.salesperson.split(',').map((s) => s.trim()).filter(Boolean);
    const countLabel = staffList.length > 1 ? ` (${staffList.length} Present)` : '';
    lines.push(`*Staff on Duty${countLabel}:* ${sheet.salesperson}`);
  }

  lines.push(`──────────────────────────────`);
  lines.push(` *ITEMS SOLD:*`);

  if (!sheet.items || sheet.items.length === 0) {
    lines.push(`_No sales recorded for this date._`);
  } else {
    sheet.items.forEach((it, idx) => {
      const mode = it.paymentMethod ? ` (${it.paymentMethod})` : '';
      lines.push(`${idx + 1}. *${it.itemName}* — ₹${Number(it.amount).toLocaleString('en-IN')}${mode}`);
    });
  }

  lines.push(`──────────────────────────────`);
  lines.push(` *DAY SUMMARY:*`);
  lines.push(`• Total Items Sold: ${sheet.count}`);
  if (sheet.cashTotal !== undefined) {
    lines.push(`•  Cash Sales: ₹${sheet.cashTotal.toLocaleString('en-IN')}`);
    lines.push(`•  UPI / Online: ₹${(sheet.upiTotal + sheet.cardTotal).toLocaleString('en-IN')}`);
  }
  lines.push(` *TOTAL DAY COLLECTION: ₹${sheet.total.toLocaleString('en-IN')}*`);
  lines.push(`──────────────────────────────`);
  lines.push(`_7Days Toys & Cycles, Payod_`);

  return lines.join('\n');
}
