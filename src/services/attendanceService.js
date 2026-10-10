/**
 * 7Days Toys & Babyshop - Staff Attendance & Register Service
 * Manages staff list and month-wise attendance ledger with tick marks (Present, Absent, Half-day).
 * Completely tamper-proof: Attendance is automatically driven and recorded
 * by the Daily Sales Sheet "On Duty" entries (Full Day / Half Day).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STAFF_STORAGE_KEY = '7days_staff_list_v1';
const ATTENDANCE_STORAGE_KEY = '7days_staff_attendance_ledger_v1';

// Initial staff list for 7Days
const DEFAULT_STAFF = [
  { id: 'staff_1', name: 'Athil', role: 'Store Lead / Manager' },
  { id: 'staff_2', name: 'Salman', role: 'Sales Executive' },
  { id: 'staff_3', name: 'Faisal', role: 'Sales & Service Specialist' }
];

// Initial sync from Supabase if configured
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  // Sync staff members
  supabase
    .from('staff_members')
    .select('*')
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event('7days_staff_updated'));
      }
    });

  // Sync attendance ledger
  supabase
    .from('staff_attendance')
    .select('*')
    .then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length > 0) {
        const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        const local = raw ? JSON.parse(raw) : {};
        const merged = { ...local };
        data.forEach((row) => {
          if (row.month_key && row.ledger_data) {
            merged[row.month_key] = row.ledger_data;
          }
        });
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('7days_attendance_updated'));
      }
    });
}

export function getStaffList() {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!raw) {
      saveStaffList(DEFAULT_STAFF);
      return DEFAULT_STAFF;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF;
  } catch {
    return DEFAULT_STAFF;
  }
}

export function saveStaffList(list) {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_staff_updated'));
    }
    // Database background sync if Supabase is active
    if (isSupabaseConfigured && Array.isArray(list)) {
      list.forEach(async (staff) => {
        try {
          await supabase.from('staff_members').upsert({
            id: staff.id,
            name: staff.name,
            role: staff.role
          });
        } catch {}
      });
    }
  } catch (err) {
    console.error('Failed to save staff list:', err);
  }
}

export function addStaffMember(name, role = 'Sales Staff') {
  const current = getStaffList();
  const trimmed = (name || '').trim();
  if (!trimmed) return current;
  const newStaff = {
    id: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
    name: trimmed,
    role: (role || 'Sales Staff').trim()
  };
  const updated = [...current, newStaff];
  saveStaffList(updated);
  return updated;
}

export function removeStaffMember(id) {
  const current = getStaffList();
  const updated = current.filter((s) => s.id !== id);
  saveStaffList(updated);
  if (isSupabaseConfigured) {
    try {
      supabase.from('staff_members').delete().eq('id', id);
    } catch {}
  }
  return updated;
}

// ==========================================
// MONTHLY ATTENDANCE LEDGER
// ==========================================

function getStoredAttendance() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredAttendance(ledger) {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(ledger));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('7days_attendance_updated'));
    }
    // Database background sync if Supabase is active
    if (isSupabaseConfigured && ledger && typeof ledger === 'object') {
      Object.keys(ledger).forEach(async (mKey) => {
        try {
          await supabase.from('staff_attendance').upsert({
            month_key: mKey,
            ledger_data: ledger[mKey],
            updated_at: new Date().toISOString()
          }, { onConflict: 'month_key' });
        } catch {}
      });
    }
  } catch (err) {
    console.error('Failed to save attendance ledger:', err);
  }
}

/**
 * Get attendance for a month key (e.g., '2026-10')
 * Returns: { [staffId]: { [day]: 'P' | 'A' | 'H' } }
 */
export function getMonthAttendance(year, month) {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  const ledger = getStoredAttendance();
  return ledger[monthKey] || {};
}

/**
 * Automatically records attendance for a specific date (YYYY-MM-DD)
 * based on the staff on duty recorded in the Daily Sales Sheet!
 * dutyMap: { [staffId]: 'Full' | 'Half' | 'Off' }
 */
export function syncDutyToAttendance(dateStr, dutyMap) {
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;

  // If daily sheet is locked, prevent tampering with attendance
  try {
    const raw = localStorage.getItem('7days_daily_sales_sheets_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[dateStr]?.isLocked) {
        return getStoredAttendance()[monthKey] || {};
      }
    }
  } catch {}

  // Ensure month ledger is initialized/seeded first
  getMonthAttendance(year, month);
  const ledger = getStoredAttendance();
  if (!ledger[monthKey]) ledger[monthKey] = {};

  const staff = getStaffList();
  staff.forEach((s) => {
    if (!ledger[monthKey][s.id]) ledger[monthKey][s.id] = {};
    const status = dutyMap ? dutyMap[s.id] : undefined;
    if (status === 'Full') {
      ledger[monthKey][s.id][day] = 'P'; // Present (Full day)
    } else if (status === 'Half') {
      ledger[monthKey][s.id][day] = 'H'; // Half Day
    } else if (status === 'Off') {
      ledger[monthKey][s.id][day] = 'A'; // Absent / Off Duty
    }
  });

  saveStoredAttendance(ledger);
  return ledger[monthKey];
}

/**
 * Gets duty status for each staff member on a specific date (YYYY-MM-DD):
 * Returns: { [staffId]: 'Full' | 'Half' | 'Off' }
 */
export function getDutyStatusForDate(dateStr) {
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  // ALWAYS retrieve via getMonthAttendance so defaults are initialized
  const monthData = getMonthAttendance(year, month);
  const staff = getStaffList();
  const result = {};

  let hasAnyMarked = false;
  staff.forEach((s) => {
    const rawVal = monthData[s.id]?.[day] ?? monthData[s.id]?.[String(day)];
    if (rawVal === 'P' || rawVal === 'Full' || rawVal === 'full' || rawVal === 'Present') {
      result[s.id] = 'Full';
      hasAnyMarked = true;
    } else if (rawVal === 'H' || rawVal === 'Half' || rawVal === 'half') {
      result[s.id] = 'Half';
      hasAnyMarked = true;
    } else if (rawVal === 'A' || rawVal === 'Absent' || rawVal === 'absent') {
      result[s.id] = 'Off';
      hasAnyMarked = true;
    } else {
      result[s.id] = 'Off';
    }
  });

  // If nothing was marked yet in attendance ledger for this date,
  // check if salesperson string on daily sales sheet has active staff
  if (!hasAnyMarked) {
    try {
      const rawSheets = localStorage.getItem('7days_daily_sales_sheets_v1');
      if (rawSheets) {
        const parsed = JSON.parse(rawSheets);
        const sp = parsed[dateStr]?.salesperson || '';
        if (sp) {
          staff.forEach((s) => {
            if (sp.includes(s.name)) {
              if (sp.includes(`${s.name} (Half)`)) {
                result[s.id] = 'Half';
              } else {
                result[s.id] = 'Full';
              }
            }
          });
        }
      }
    } catch {}
  }

  return result;
}

/**
 * Toggle or set attendance status for a staff member on a specific day
 * status: 'P' (Present) | 'A' (Absent) | 'H' (Half Day) | null (Unset)
 */
export function setStaffAttendance(year, month, day, staffId, status) {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`;
  // Ensure month ledger is initialized/seeded first
  getMonthAttendance(year, month);
  const ledger = getStoredAttendance();
  if (!ledger[monthKey]) ledger[monthKey] = {};
  if (!ledger[monthKey][staffId]) ledger[monthKey][staffId] = {};

  if (!status) {
    delete ledger[monthKey][staffId][day];
    delete ledger[monthKey][staffId][String(day)];
  } else {
    ledger[monthKey][staffId][day] = status;
  }

  saveStoredAttendance(ledger);
  return ledger[monthKey];
}

/**
 * Get list of staff names who were Present ('P' or 'H') on a given date (YYYY-MM-DD)
 */
export function getPresentStaffForDate(dateStr) {
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  const monthData = getMonthAttendance(year, month);
  const staff = getStaffList();

  const present = [];
  staff.forEach((s) => {
    const rawVal = monthData[s.id]?.[day] ?? monthData[s.id]?.[String(day)];
    if (rawVal === 'P' || rawVal === 'Full' || rawVal === 'Present') {
      present.push(`${s.name} (Full)`);
    } else if (rawVal === 'H' || rawVal === 'Half') {
      present.push(`${s.name} (Half)`);
    }
  });

  return present;
}

/**
 * Generates a weekly attendance audit report for the 7-day period ending on targetDateStr
 * (or Friday-to-Friday cycle)
 */
export function getWeeklyAttendanceReport(targetDateStr) {
  const [yStr, mStr, dStr] = targetDateStr.split('-');
  const targetDate = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, parseInt(dStr, 10));

  // Determine span: If Friday, 8-day cycle (previous Fri to this Fri), else 7 days
  const isFriday = targetDate.getDay() === 5;
  const spanDays = isFriday ? 8 : 7;

  const days = [];
  for (let i = spanDays - 1; i >= 0; i--) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayNum = d.getDate();
    days.push({
      dateStr,
      dayNum,
      dayName,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      isFriday: d.getDay() === 5
    });
  }

  const staff = getStaffList();
  const records = staff.map((s) => {
    let presentCount = 0;
    let markedCount = 0;
    const statuses = {};

    days.forEach((dayInfo) => {
      const monthData = getMonthAttendance(dayInfo.year, dayInfo.month);
      const rawVal = monthData[s.id]?.[dayInfo.dayNum] ?? monthData[s.id]?.[String(dayInfo.dayNum)];
      let val = '-';
      if (rawVal === 'P' || rawVal === 'Full' || rawVal === 'full' || rawVal === 'Present') {
        val = 'P';
        presentCount += 1;
        markedCount += 1;
      } else if (rawVal === 'H' || rawVal === 'Half' || rawVal === 'half') {
        val = 'H';
        presentCount += 0.5;
        markedCount += 1;
      } else if (rawVal === 'A' || rawVal === 'Absent' || rawVal === 'absent' || rawVal === 'Off') {
        val = 'A';
        markedCount += 1;
      }
      statuses[dayInfo.dateStr] = val;
    });

    const percentage = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

    return {
      staffId: s.id,
      name: s.name,
      role: s.role,
      statuses,
      presentCount,
      percentage
    };
  });

  return {
    isFriday,
    startDateStr: days[0].dateStr,
    endDateStr: days[days.length - 1].dateStr,
    days,
    records
  };
}

/**
 * Generates full monthly attendance ledger report for all days of the month (1 to 28/30/31)
 * for attaching complete all-days monthly attendance register in PDF and WhatsApp export.
 * Accepts optional activeDutyMap: { [staffId]: 'Full' | 'Half' | 'Off' } for live sync of selected day.
 */
export function getFullMonthAttendanceReport(targetDateStr, activeDutyMap = null) {
  const [yStr, mStr, dStr] = targetDateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const selectedDay = parseInt(dStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  const staff = getStaffList();
  const monthData = getMonthAttendance(year, month);

  // Read saved daily sales sheets for this month so any day with registered sales or salesperson is automatically verified
  let savedDailySheets = {};
  try {
    const rawSheets = localStorage.getItem('7days_daily_sales_sheets_v1');
    if (rawSheets) {
      savedDailySheets = JSON.parse(rawSheets) || {};
    }
  } catch {}

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, month - 1, d);
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = curDate.toLocaleDateString('en-IN', { weekday: 'narrow' }); // 'M', 'T', 'W', etc.
    const isFriday = curDate.getDay() === 5;
    const isSunday = curDate.getDay() === 0;
    const isSelectedDate = d === selectedDay;

    days.push({
      dateStr,
      dayNum: d,
      dayName,
      isFriday,
      isSunday,
      isSelectedDate
    });
  }

  const records = staff.map((s) => {
    let presentCount = 0;
    let totalMarked = 0;
    const statuses = {};

    days.forEach((dayInfo) => {
      let rawVal = monthData[s.id]?.[dayInfo.dayNum] ?? monthData[s.id]?.[String(dayInfo.dayNum)];

      // 1. If it's the target sales date and activeDutyMap was provided, use it directly
      if (dayInfo.dayNum === selectedDay && activeDutyMap && activeDutyMap[s.id]) {
        const duty = activeDutyMap[s.id];
        if (duty === 'Full') rawVal = 'P';
        else if (duty === 'Half') rawVal = 'H';
        else if (duty === 'Off') rawVal = 'A';
      }

      // 2. If not marked in ledger, check if that date has a saved daily sales sheet with salesperson recorded
      if (!rawVal || rawVal === '-') {
        const daySheet = savedDailySheets[dayInfo.dateStr];
        if (daySheet) {
          const sp = daySheet.salesperson || '';
          if (sp.includes(s.name)) {
            if (sp.includes(`${s.name} (Half)`)) {
              rawVal = 'H';
            } else {
              rawVal = 'P';
            }
          } else if (daySheet.isLocked || (Array.isArray(daySheet.items) && daySheet.items.length > 0)) {
            rawVal = 'A'; // Off / Absent on that sales day
          }
        }
      }

      let val = '-';
      if (rawVal === 'P' || rawVal === 'Full' || rawVal === 'full' || rawVal === 'Present') {
        val = 'P';
        presentCount += 1;
        totalMarked += 1;
      } else if (rawVal === 'H' || rawVal === 'Half' || rawVal === 'half') {
        val = 'H';
        presentCount += 0.5;
        totalMarked += 1;
      } else if (rawVal === 'A' || rawVal === 'Absent' || rawVal === 'absent' || rawVal === 'Off') {
        val = 'A';
        totalMarked += 1;
      }

      statuses[dayInfo.dateStr] = val;
    });

    const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    return {
      staffId: s.id,
      name: s.name,
      role: s.role,
      statuses,
      presentCount,
      totalMarked,
      percentage
    };
  });

  // Calculate daily staff duty headcount for each day
  const dailyHeadcount = {};
  days.forEach((dayInfo) => {
    let count = 0;
    records.forEach((r) => {
      const st = r.statuses[dayInfo.dateStr];
      if (st === 'P' || st === 'H') {
        count += 1;
      }
    });
    dailyHeadcount[dayInfo.dateStr] = count;
  });

  return {
    year,
    month,
    monthName,
    daysInMonth,
    days,
    records,
    dailyHeadcount
  };
}

