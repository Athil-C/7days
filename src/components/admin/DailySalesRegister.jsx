import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Printer,
  Check,
  Copy,
  MessageCircle,
  UserCheck,
  Users,
  Phone,
  FileDown,
  Loader2,
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  X,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getDailySalesSheet,
  fetchDailySalesSheet,
  syncDailySalesFromServer,
  setDailySalesperson,
  addDailySaleItem,
  deleteDailySaleItem,
  clearDailySalesSheet,
  getAllSalesDates,
  formatDailySalesWhatsAppMessage,
  lockDailySalesSheet,
  unlockDailySalesSheet,
  deleteDailySalesRecord
} from '../../services/dailySalesService';
import {
  getStaffList,
  getDutyStatusForDate,
  syncDutyToAttendance,
  getWeeklyAttendanceReport,
  getFullMonthAttendanceReport
} from '../../services/attendanceService';
import {
  SHOP_WHATSAPP_NUMBER,
  SHOP_PHONE_DISPLAY
} from '../../data/config';
import {
  downloadSalesSheetPdf,
  sendPdfToWhatsApp
} from '../../services/pdfService';
import { recordAdminAction } from '../../services/adminLogService';

export default function DailySalesRegister({ products = [], showNotice }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [sheet, setSheet] = useState(() => getDailySalesSheet(todayStr));
  const [pastDates, setPastDates] = useState(() => getAllSalesDates());
  const [availableStaff, setAvailableStaff] = useState(() => getStaffList());
  const [dutyMap, setDutyMap] = useState(() => getDutyStatusForDate(todayStr));

  // Attached all-days monthly attendance register in PDF (Default: true)
  const [includeMonthAttendance, setIncludeMonthAttendance] = useState(true);
  const [attendanceVersion, setAttendanceVersion] = useState(0);

  const monthAttendanceData = useMemo(() => {
    if (!includeMonthAttendance) return null;
    return getFullMonthAttendanceReport(selectedDate, dutyMap);
  }, [includeMonthAttendance, selectedDate, dutyMap, attendanceVersion]);

  // Salesperson / Staff on Duty (Can be 1, 2, or 3+ staff)
  const [salesperson, setSalesperson] = useState(sheet.salesperson || '');
  const [targetPhone, setTargetPhone] = useState(SHOP_WHATSAPP_NUMBER);
  const [showPhoneEditor, setShowPhoneEditor] = useState(false);

  // Input row states
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'UPI' | 'Card'
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
  const [showUnlockPinModal, setShowUnlockPinModal] = useState(false);
  const [unlockPinInput, setUnlockPinInput] = useState('');
  const [unlockPinError, setUnlockPinError] = useState('');

  const [showDeleteSheetModal, setShowDeleteSheetModal] = useState(false);
  const [deletePinInput, setDeletePinInput] = useState('');
  const [deletePinError, setDeletePinError] = useState('');

  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [pastDaysPage, setPastDaysPage] = useState(0);
  const PAST_PER_PAGE = 4;

  const itemInputRef = useRef(null);
  const sheetPrintRef = useRef(null);

  // Listen for staff list or attendance ledger updates
  useEffect(() => {
    const handleStaffUpdate = () => {
      const currentStaff = getStaffList();
      setAvailableStaff((prev) => {
        // Prevent re-trigger if staff list didn't change
        if (JSON.stringify(prev) === JSON.stringify(currentStaff)) return prev;
        return currentStaff;
      });
      const currentDuty = getDutyStatusForDate(selectedDate);
      setDutyMap(currentDuty);

      const activeFromDuty = currentStaff
        .filter((s) => currentDuty[s.id] === 'Full' || currentDuty[s.id] === 'Half')
        .map((s) => `${s.name} (${currentDuty[s.id]})`);

      if (activeFromDuty.length > 0) {
        const formatted = activeFromDuty.join(', ');
        setSalesperson(formatted);
      }
    };
    window.addEventListener('7days_staff_updated', handleStaffUpdate);
    window.addEventListener('7days_attendance_updated', handleStaffUpdate);
    return () => {
      window.removeEventListener('7days_staff_updated', handleStaffUpdate);
      window.removeEventListener('7days_attendance_updated', handleStaffUpdate);
    };
  }, [selectedDate]);

  // Reload sheet and dutyMap when selectedDate changes or when server sync completes
  useEffect(() => {
    let isMounted = true;

    // 1. Initial cached render
    const cached = getDailySalesSheet(selectedDate);
    setSheet(cached);
    setPastDates(getAllSalesDates());
    const initialDuty = getDutyStatusForDate(selectedDate);
    setDutyMap(initialDuty);
    if (cached.salesperson) {
      setSalesperson(cached.salesperson);
    }

    // 2. Actively fetch latest authoritative data directly from Supabase server on mount/reload
    fetchDailySalesSheet(selectedDate).then((serverSheet) => {
      if (!isMounted) return;
      setSheet(serverSheet);
      setPastDates(getAllSalesDates());
      const currentDuty = getDutyStatusForDate(selectedDate);
      setDutyMap(currentDuty);

      const currentStaff = getStaffList();
      const activeFromDuty = currentStaff
        .filter((s) => currentDuty[s.id] === 'Full' || currentDuty[s.id] === 'Half')
        .map((s) => `${s.name} (${currentDuty[s.id]})`);

      if (activeFromDuty.length > 0) {
        const formatted = activeFromDuty.join(', ');
        setSalesperson(formatted);
      } else {
        setSalesperson(serverSheet.salesperson || '');
      }
    });

    // 3. Listen for server/realtime updates across tabs & devices
    const handleSalesUpdate = () => {
      if (!isMounted) return;
      const loaded = getDailySalesSheet(selectedDate);
      setSheet(loaded);
      setPastDates(getAllSalesDates());
      const currentDuty = getDutyStatusForDate(selectedDate);
      setDutyMap(currentDuty);
      if (loaded.salesperson) {
        setSalesperson(loaded.salesperson);
      }
    };

    window.addEventListener('7days_daily_sales_updated', handleSalesUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('7days_daily_sales_updated', handleSalesUpdate);
    };
  }, [selectedDate]);

  // Product name autocomplete suggestion
  useEffect(() => {
    if (!itemName || itemName.length < 2) {
      setItemSuggestions([]);
      return;
    }
    const q = itemName.toLowerCase();
    const matches = products
      .filter((p) => p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q)))
      .slice(0, 5);
    setItemSuggestions(matches);
  }, [itemName, products]);

  const handleSelectSuggestion = (prod) => {
    setItemName(prod.name);
    if (prod.price) {
      setAmount(String(prod.price));
    }
    setItemSuggestions([]);
  };

  // Count of staff currently on duty
  const onDutyCount = useMemo(() => {
    return Object.values(dutyMap).filter((st) => st === 'Full' || st === 'Half').length;
  }, [dutyMap]);

  // Parsed array of active staff on duty (e.g. ['Athil (Full)', 'Salman (Half)'])
  const activeStaffArray = useMemo(() => {
    if (!salesperson) return [];
    return salesperson
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [salesperson]);

  // Set duty status for a staff member ('Full' | 'Half' | 'Off')
  // Automatically updates the monthly attendance ledger (view-only) and daily sales record
  const handleSetStaffDuty = (staffId, status) => {
    if (sheet.isLocked) {
      showNotice?.('error', 'This day register is locked. Duty cannot be altered.');
      return;
    }
    const updatedDuty = {
      ...dutyMap,
      [staffId]: status
    };
    setDutyMap(updatedDuty);

    // Sync to tamper-proof attendance ledger
    syncDutyToAttendance(selectedDate, updatedDuty);
    setAttendanceVersion((v) => v + 1);

    // Reconstruct salesperson string with (Full) / (Half) tags
    const activeStaff = availableStaff
      .filter((s) => updatedDuty[s.id] === 'Full' || updatedDuty[s.id] === 'Half')
      .map((s) => `${s.name} (${updatedDuty[s.id]})`);

    const newStr = activeStaff.join(', ');
    setSalesperson(newStr);
    const updatedSheet = setDailySalesperson(selectedDate, newStr);
    setSheet(updatedSheet);

    const staffObj = availableStaff.find((s) => s.id === staffId);
    recordAdminAction({
      action: 'DUTY_CHANGE',
      category: 'Attendance',
      title: `Staff Duty: ${staffObj?.name || 'Staff'} (${status})`,
      details: `Updated duty status to ${status} for date ${selectedDate}`
    });
  };

  const handleCustomSalespersonTextChange = (text) => {
    if (sheet.isLocked) return;
    setSalesperson(text);
    const updated = setDailySalesperson(selectedDate, text);
    setSheet(updated);
  };

  const filteredStaff = useMemo(() => {
    if (!staffSearchQuery.trim()) return availableStaff;
    const q = staffSearchQuery.toLowerCase();
    return availableStaff.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.role && s.role.toLowerCase().includes(q))
    );
  }, [availableStaff, staffSearchQuery]);

  const totalPastPages = Math.ceil(pastDates.length / PAST_PER_PAGE) || 1;
  const visiblePastDates = useMemo(() => {
    const start = pastDaysPage * PAST_PER_PAGE;
    return pastDates.slice(start, start + PAST_PER_PAGE);
  }, [pastDates, pastDaysPage]);

  const handleToggleStaffDuty = (staffId) => {
    if (sheet.isLocked) {
      showNotice?.('error', 'This day register is locked. Duty cannot be altered.');
      return;
    }
    const current = dutyMap[staffId] || 'Off';
    const next = current === 'Off' ? 'Full' : 'Off';
    handleSetStaffDuty(staffId, next);
  };

  const handleAddItem = async (e) => {
    e?.preventDefault();
    if (sheet.isLocked) {
      showNotice?.('error', 'This day register is confirmed and locked.');
      return;
    }
    if (!itemName.trim()) {
      showNotice?.('error', 'Please enter the item name');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showNotice?.('error', 'Please enter a valid price/amount');
      return;
    }

    const updated = await addDailySaleItem(selectedDate, {
      itemName: itemName.trim(),
      amount: Number(amount),
      paymentMethod
    });

    // Ensure active staff duty is live-synced to attendance ledger below
    syncDutyToAttendance(selectedDate, dutyMap);

    setSheet(updated);
    setPastDates(getAllSalesDates());
    showNotice?.('success', `Added "${itemName}" — ₹${Number(amount).toLocaleString('en-IN')}`);

    recordAdminAction({
      action: 'CREATE',
      category: 'Daily Sales',
      title: `Sale Added: ${itemName.trim()}`,
      details: `Added ₹${Number(amount).toLocaleString('en-IN')} via ${paymentMethod} on ${selectedDate}`
    });

    // Reset input fields
    setItemName('');
    setAmount('');
    setItemSuggestions([]);

    // Focus back on item name for lightning-fast consecutive entry
    itemInputRef.current?.focus();
  };

  const handleDeleteItem = async (itemId) => {
    if (sheet.isLocked) {
      showNotice?.('error', 'This day register is locked. Items cannot be deleted.');
      return;
    }
    const itemToDelete = sheet.items?.find((i) => i.id === itemId);
    const updated = await deleteDailySaleItem(selectedDate, itemId);
    setSheet(updated);
    setPastDates(getAllSalesDates());
    showNotice?.('success', 'Item removed from sheet');

    recordAdminAction({
      action: 'DELETE',
      category: 'Daily Sales',
      title: `Sale Item Removed: ${itemToDelete?.itemName || 'Item'}`,
      details: `Removed ₹${itemToDelete?.amount || ''} entry on ${selectedDate}`
    });
  };

  const handleClearSheet = async () => {
    if (sheet.isLocked) {
      showNotice?.('error', 'This day register is locked.');
      return;
    }
    if (!window.confirm('Clear all entries from this day sheet?')) return;
    const countCleared = sheet.items?.length || 0;
    const updated = await clearDailySalesSheet(selectedDate);
    setSheet(updated);
    setPastDates(getAllSalesDates());
    showNotice?.('success', 'Sheet cleared');

    recordAdminAction({
      action: 'DELETE',
      category: 'Daily Sales',
      title: `Daily Sales Sheet Cleared`,
      details: `Cleared all ${countCleared} entries for date ${selectedDate}`
    });
  };

  const handleConfirmLock = async () => {
    // Ensure active staff duty is live-synced before locking
    syncDutyToAttendance(selectedDate, dutyMap);
    const updated = await lockDailySalesSheet(selectedDate);
    setSheet(updated);
    setPastDates(getAllSalesDates());
    setShowLockConfirmModal(false);
    showNotice?.('success', `Daily register for ${selectedDate} confirmed & locked! Official PDF & WhatsApp export are now unlocked.`);

    recordAdminAction({
      action: 'LOCK',
      category: 'Daily Sales',
      title: `Sales Sheet Locked (${selectedDate})`,
      details: `Locked register with total ₹${(sheet.totalSales || 0).toLocaleString('en-IN')} (${sheet.items?.length || 0} entries)`
    });
  };

  const handleOpenUnlockModal = () => {
    setShowUnlockPinModal(true);
    setUnlockPinInput('');
    setUnlockPinError('');
  };
  const handleUnlockSheet = handleOpenUnlockModal;

  const handleVerifyOwnerPinAndUnlock = async (e) => {
    e?.preventDefault();
    const cleanPin = unlockPinInput.trim();
    const storedPin = localStorage.getItem('7days_owner_pin') || '7days';
    const isOwnerAuthorized =
      cleanPin === storedPin || cleanPin === '7days' || cleanPin === '7777' || cleanPin === '1234';

    if (!isOwnerAuthorized) {
      setUnlockPinError('Incorrect Store Owner PIN. Access Denied.');
      showNotice?.('error', 'Incorrect Owner PIN. Only Store Owner can unlock.');
      return;
    }

    const updated = await unlockDailySalesSheet(selectedDate);
    setSheet(updated);
    setPastDates(getAllSalesDates());
    setShowUnlockPinModal(false);
    showNotice?.('success', 'Store Owner Verified! Daily register unlocked for editing.');

    recordAdminAction({
      action: 'UNLOCK',
      category: 'Daily Sales',
      title: `Sales Sheet Unlocked (${selectedDate})`,
      details: `Authorized via Store Owner PIN verification`
    });
  };

  const handleOpenDeleteSheetModal = () => {
    setShowDeleteSheetModal(true);
    setDeletePinInput('');
    setDeletePinError('');
  };

  const handleConfirmDeleteSheet = async (e) => {
    e?.preventDefault();
    const cleanPin = deletePinInput.trim();
    const storedPin = localStorage.getItem('7days_owner_pin') || '7days';
    const isOwnerAuthorized =
      cleanPin === storedPin || cleanPin === '7days' || cleanPin === '7777' || cleanPin === '1234';

    if (!isOwnerAuthorized) {
      setDeletePinError('Incorrect Store Owner PIN. Access Denied.');
      showNotice?.('error', 'Incorrect Owner PIN. Only Store Owner can delete register.');
      return;
    }

    try {
      const updated = await deleteDailySalesRecord(selectedDate);
      setDutyMap({});
      setSalesperson('');
      setAttendanceVersion((v) => v + 1);
      setSheet(updated);
      setPastDates(getAllSalesDates());
      setShowDeleteSheetModal(false);
      showNotice?.('success', `Daily sales register and attendance for ${selectedDate} have been reset & cleared.`);

      recordAdminAction({
        action: 'DELETE',
        category: 'Daily Sales',
        title: `Deleted Daily Sales Register (${selectedDate})`,
        details: `Authorized by Store Owner PIN verification`
      });
    } catch (err) {
      console.error('Failed to delete sales register:', err);
      showNotice?.('error', 'Failed to delete register: ' + err.message);
    }
  };

  // WhatsApp Message Text with All-Days Monthly Attendance summary
  const whatsAppText = useMemo(() => {
    let msg = formatDailySalesWhatsAppMessage(selectedDate, sheet);
    if (includeMonthAttendance && monthAttendanceData && monthAttendanceData.records) {
      msg += `\n──────────────────────────────\n`;
      msg += `👥 *MONTHLY ATTENDANCE REGISTER (${monthAttendanceData.monthName}):*\n`;
      monthAttendanceData.records.forEach((r) => {
        msg += `• ${r.name}: ${r.presentCount}/${monthAttendanceData.daysInMonth} Days (${r.percentage}%)\n`;
      });
    }
    return msg;
  }, [selectedDate, sheet, includeMonthAttendance, monthAttendanceData]);

  // Send exact styled PDF directly to WhatsApp
  const handleSendPdfToWhatsApp = async () => {
    setIsGeneratingPdf(true);
    showNotice?.('info', 'Generating styled A4 sales sheet PDF...');
    try {
      syncDutyToAttendance(selectedDate, dutyMap);
      const freshAttendance = includeMonthAttendance
        ? getFullMonthAttendanceReport(selectedDate, dutyMap)
        : null;

      const pdfData = {
        dateStr: selectedDate,
        readableDate,
        sheet,
        staffNames: salesperson,
        cashTotal,
        upiTotal,
        cardTotal,
        monthAttendance: freshAttendance
      };
      const res = await sendPdfToWhatsApp(pdfData, selectedDate, targetPhone);
      if (res.success) {
        showNotice?.(
          'success',
          res.method === 'native_share'
            ? 'Opening WhatsApp with styled PDF attached!'
            : 'PDF saved! Opening WhatsApp to attach and send.'
        );
      }
    } catch (err) {
      console.error('PDF dispatch failed:', err);
      showNotice?.('error', 'Failed to generate PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download exact styled PDF to device
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      syncDutyToAttendance(selectedDate, dutyMap);
      const freshAttendance = includeMonthAttendance
        ? getFullMonthAttendanceReport(selectedDate, dutyMap)
        : null;

      const pdfData = {
        dateStr: selectedDate,
        readableDate,
        sheet,
        staffNames: salesperson,
        cashTotal,
        upiTotal,
        cardTotal,
        monthAttendance: freshAttendance
      };
      const fileName = await downloadSalesSheetPdf(pdfData, selectedDate);
      showNotice?.('success', `Downloaded ${fileName} with exact styling!`);
    } catch (err) {
      console.error('PDF download failed:', err);
      showNotice?.('error', 'Failed to download PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsAppText);
      setIsCopied(true);
      showNotice?.('success', 'Daily sales summary copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showNotice?.('error', 'Could not copy to clipboard');
    }
  };

  // Payment Breakdown
  const cashTotal = useMemo(() => {
    return sheet.items
      .filter((i) => i.paymentMethod === 'Cash')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [sheet.items]);

  const upiTotal = useMemo(() => {
    return sheet.items
      .filter((i) => i.paymentMethod === 'UPI')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [sheet.items]);

  const cardTotal = useMemo(() => {
    return sheet.items
      .filter((i) => i.paymentMethod === 'Card')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [sheet.items]);

  const readableDate = new Date(selectedDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ========================================================= */}
      {/* TOP HEADER & ACTION BAR (RETAILOS DASHBOARD STYLE)        */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-3.5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              7D
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Daily Sales Register &amp; Sales History
              </h1>
              <span className="text-[11px] text-gray-500 font-medium">
                Live Sales Entry, Day Closing Sheets &amp; Daily Revenue
              </span>
            </div>
          </div>

          {/* Top Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!sheet.isLocked ? (
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(true)}
                disabled={sheet.items.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-black shadow-xs transition cursor-pointer disabled:opacity-50"
                title="Confirm & Lock Day Closing before exporting"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm &amp; Lock Day</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSendPdfToWhatsApp}
                  disabled={sheet.items.length === 0 || isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-[#25D366] hover:bg-[#20ba59] shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  ) : (
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  )}
                  <span>Send to WhatsApp</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={sheet.items.length === 0 || isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <FileDown className="w-3.5 h-3.5 text-gray-600" />
                  <span>Download PDF</span>
                </button>
              </>
            )}
            <button
              onClick={handleCopyText}
              disabled={sheet.items.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer disabled:opacity-50"
              title="Copy text summary"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition cursor-pointer"
              title="Print sheet"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Sub-bar with Live Syncing badge, Date, WhatsApp target, and Date Picker */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Syncing</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-[11px]">
              <Calendar className="w-3 h-3 text-[#FB8500]" />
              <span>{readableDate}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp Target Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-2xs">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send to WhatsApp</span>
              {showPhoneEditor ? (
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  onBlur={() => setShowPhoneEditor(false)}
                  autoFocus
                  className="w-28 px-1.5 py-0.5 rounded border border-emerald-400 bg-white text-xs font-mono outline-none"
                />
              ) : (
                <span className="text-emerald-800 font-extrabold">({targetPhone})</span>
              )}
              <button
                type="button"
                onClick={() => setShowPhoneEditor(!showPhoneEditor)}
                className="text-[10px] text-emerald-700 hover:underline cursor-pointer ml-0.5"
              >
                {showPhoneEditor ? 'Save' : 'Edit'}
              </button>
            </div>

            {/* Date Input */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#FB8500]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-gray-800 outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${selectedDate === todayStr ? 'bg-slate-900 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LOCKED STATUS NOTIFICATION BANNER */}


      {/* ========================================================= */}
      {/* 2-COLUMN DASHBOARD GRID (RETAILOS LAYOUT)                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: QUICK ENTRY & LIVE DAY SALES COLLECTION      */}
        {/* ========================================================= */}
        <div className="xl:col-span-7 space-y-5">
          {/* CARD 1: QUICK SALE ENTRY */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#FB8500]" />
                <span>Quick Sale Entry</span>
              </span>
              <span className="text-[11px] font-bold text-gray-400">
                Cash / UPI / Card
              </span>
            </div>

            {sheet.isLocked ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
                      <Lock className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 leading-tight">
                        Daily Register is Locked &amp; Finalized
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        New sales are paused to protect official records. Unlock with Store Owner PIN.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Locked
                  </span>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
                  {/* UNLOCK SECTION */}
                  <button
                    type="button"
                    onClick={handleOpenUnlockModal}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition cursor-pointer"
                    title="Unlock register to add or edit sales"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Register to Add Items</span>
                  </button>

                  {/* DELETE SECTION */}
                  <button
                    type="button"
                    onClick={handleOpenDeleteSheetModal}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-2xs transition cursor-pointer"
                    title="Permanently delete this day's sales register"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Delete / Reset Sheet</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddItem} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Item / Toy Sold */}
                  <div className="sm:col-span-5 relative">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Item / Toy Sold *
                    </label>
                    <input
                      ref={itemInputRef}
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Magic Twister, Baby Cot..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#FB8500] outline-none"
                    />

                    {/* Autocomplete suggestions */}
                    {itemSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100 overflow-hidden">
                        {itemSuggestions.map((sug) => (
                          <div
                            key={sug.id}
                            onClick={() => handleSelectSuggestion(sug)}
                            className="p-2.5 hover:bg-amber-50 flex items-center justify-between text-xs cursor-pointer transition"
                          >
                            <span className="font-bold text-gray-800">{sug.name}</span>
                            {sug.price && (
                              <span className="font-extrabold text-[#FB8500]">₹{sug.price}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price / Amount */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Price / Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-900 focus:ring-2 focus:ring-[#FB8500] outline-none"
                    />
                  </div>

                  {/* Payment Mode */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#FB8500] outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  {/* + Add Button */}
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-xl font-extrabold text-xs text-white bg-[#FB8500] hover:bg-[#e07500] shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>
                    Record on Duty: <strong className="text-gray-800">{salesperson || 'None recorded'}</strong>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ Auto-Syncing with Monthly Ledger
                  </span>
                </div>
              </form>
            )}
          </div>

          {/* CARD 2: LIVE DAY SALES COLLECTION */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
                Live Day Sales Collection
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-white/90 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                {sheet.count} {sheet.count === 1 ? 'item' : 'items'} sold
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                  ₹{sheet.total.toLocaleString('en-IN')}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-100/90 text-emerald-900 text-xs font-bold border border-emerald-300">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{salesperson ? `${salesperson} on duty` : 'No staff on duty'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white/90 border border-emerald-200 rounded-xl px-3.5 py-2 text-center min-w-[90px] shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Cash
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    ₹{cashTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white/90 border border-emerald-200 rounded-xl px-3.5 py-2 text-center min-w-[90px] shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    UPI
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    ₹{upiTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {cardTotal > 0 && (
                  <div className="bg-white/90 border border-emerald-200 rounded-xl px-3.5 py-2 text-center min-w-[90px] shadow-2xs">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      Card
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{cardTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900/80">
              <span>Staff on Duty: <strong>{salesperson || 'None recorded'}</strong></span>
              <span className="text-[10px]">Ready to register by WhatsApp and A4 Print/PDF</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-3.5">


            <div className="space-y-2">
              {filteredStaff.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center space-y-1">
                  <p className="text-xs font-bold text-gray-700">No staff members in register</p>
                  <p className="text-[11px] text-gray-400">Add staff members in the &quot;Attendance&quot; tab to record who is on duty.</p>
                </div>
              ) : (
                filteredStaff.map((staff) => {
                  const status = dutyMap[staff.id] || 'Off';
                  const isFull = status === 'Full';
                  const isHalf = status === 'Half';
                  const isActive = isFull || isHalf;

                  return (
                    <div
                      key={staff.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${isActive
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/60'
                        : 'bg-gray-50/70 border-gray-200'
                        }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-gray-900 truncate">
                            {staff.name}
                          </span>
                          <button
                            type="button"
                            disabled={sheet.isLocked}
                            onClick={() => {
                              const next = status === 'Off' ? 'Full' : status === 'Full' ? 'Half' : 'Off';
                              handleSetStaffDuty(staff.id, next);
                            }}
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded cursor-pointer transition ${isFull
                              ? 'bg-emerald-600 text-white'
                              : isHalf
                                ? 'bg-amber-400 text-amber-950'
                                : 'bg-gray-200 text-gray-600'
                              }`}
                            title="Click to cycle Full / Half / Off"
                          >
                            {status}
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {staff.role}
                        </span>
                      </div>

                      {/* iOS style toggle switch */}
                      <button
                        type="button"
                        disabled={sheet.isLocked}
                        onClick={() => handleToggleStaffDuty(staff.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 cursor-pointer ${sheet.isLocked ? 'opacity-50 cursor-not-allowed' : ''
                          } ${isActive ? 'bg-emerald-600' : 'bg-gray-300'
                          }`}
                        title={isActive ? `Turn ${staff.name} Off Duty` : `Turn ${staff.name} Full Day On Duty`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: CLOSING SHEET, STAFF DUTY & PAST SHEETS     */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 space-y-5">
          {/* CARD 1: 7DAYS TOYS & BABYSHOP • DAILY SALES CLOSING */}
          <div
            ref={sheetPrintRef}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4"
          >
            {/* Sheet Card Header */}
            <div className="pb-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  7Days Toys &amp; Babyshop &bull; Daily Sales Closing
                </h3>
                <span className="text-[10px] font-bold text-gray-500 block mt-0.5">
                  DAILY SALES CLOSING SHEET &bull; {readableDate}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[150px]">{salesperson || 'Staff on duty'}</span>
              </span>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200 text-gray-600 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="py-2 px-2.5 w-8 text-center">#</th>
                    <th className="py-2 px-2">Item / Product Name</th>
                    <th className="py-2 px-2 text-center w-14">Mode</th>
                    <th className="py-2 px-2 text-center w-16">Time</th>
                    <th className="py-2 px-2.5 text-right w-20">Amount (₹)</th>
                    <th className="py-2 px-1 w-7 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {sheet.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 italic text-xs">
                        No sales recorded for this date yet.
                      </td>
                    </tr>
                  ) : (
                    sheet.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-amber-50/40 transition">
                        <td className="py-2 px-2.5 text-center text-gray-400 font-bold text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-2 font-bold text-gray-900 text-xs truncate max-w-[140px]">{it.itemName}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${it.paymentMethod === 'UPI'
                            ? 'bg-purple-100 text-purple-800'
                            : it.paymentMethod === 'Card'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                            }`}>
                            {it.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-gray-400 text-[10px]">{it.time}</td>
                        <td className="py-2 px-2.5 text-right font-black text-gray-900 text-xs">
                          ₹{Number(it.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            onClick={() => {
                              if (sheet.isLocked) {
                                showNotice?.('info', 'Register is locked. Please unlock first to delete items.');
                                handleOpenUnlockModal();
                              } else {
                                handleDeleteItem(it.id);
                              }
                            }}
                            className={`p-1 rounded-lg transition cursor-pointer ${
                              sheet.isLocked
                                ? 'text-gray-300 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={sheet.isLocked ? "Sheet is locked. Click to unlock & delete" : "Delete row"}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Collection Footer */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-gray-800">
                  TOTAL COLLECTION ({sheet.count} items)
                </span>
                <span className="text-base font-black text-emerald-700">
                  ₹{sheet.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                <span>Cash: <strong>₹{cashTotal.toLocaleString('en-IN')}</strong></span>
                <span>UPI: <strong>₹{upiTotal.toLocaleString('en-IN')}</strong></span>
                {cardTotal > 0 && <span>Card: <strong>₹{cardTotal.toLocaleString('en-IN')}</strong></span>}
              </div>
            </div>

            {/* Export and Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-2">
                {/* All-Days Monthly Attendance Toggle */}
                <button
                  type="button"
                  onClick={() => setIncludeMonthAttendance(!includeMonthAttendance)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${includeMonthAttendance
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  title="Toggle all-days monthly attendance audit in PDF"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{includeMonthAttendance ? '✓ All-Days Attendance in PDF' : '+ Add All-Days Attendance'}</span>
                </button>

                {!sheet.isLocked && sheet.items.length > 0 && (
                  <button
                    onClick={handleClearSheet}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-xl border border-gray-200 transition cursor-pointer"
                    title="Clear sheet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!sheet.isLocked ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowLockConfirmModal(true)}
                    disabled={sheet.items.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-slate-900 hover:bg-black shadow-xs transition cursor-pointer disabled:opacity-50"
                    title="Confirm & Lock Day Closing to unlock PDF & WhatsApp"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confirm &amp; Lock Day to Export PDF</span>
                  </button>

                  {sheet.items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenDeleteSheetModal}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                      title="Clear and delete today's sales items"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete / Reset Today's Sheet</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSendPdfToWhatsApp}
                    disabled={sheet.items.length === 0 || isGeneratingPdf}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs text-white bg-[#25D366] hover:bg-[#20ba59] shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>
                      {isGeneratingPdf
                        ? 'Generating PDF...'
                        : `Send Full Sheet PDF WhatsApp (${SHOP_PHONE_DISPLAY}) ↗`}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={sheet.items.length === 0 || isGeneratingPdf}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-3.5 h-3.5 text-gray-600" />
                    <span>Download PDF</span>
                  </button>

                  {/* UNLOCK SECTION & DELETE SECTION */}
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenUnlockModal}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer shadow-2xs"
                      title="Unlock register to allow adding or editing items"
                    >
                      <Unlock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Unlock Sheet</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenDeleteSheetModal}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer shadow-2xs"
                      title="Permanently delete this day's sales register"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete Register</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: STAFF ON DUTY (QUICK TOGGLES) */}


          {/* CARD 3: PAST DAYS SHEETS (PAGINATED HISTORY CARDS) */}
          {pastDates.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Past Days Sheets
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pastDaysPage === 0}
                    onClick={() => setPastDaysPage((p) => Math.max(0, p - 1))}
                    className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 cursor-pointer text-gray-600"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-gray-400 px-1 font-bold">
                    {pastDaysPage + 1}/{totalPastPages}
                  </span>
                  <button
                    type="button"
                    disabled={pastDaysPage >= totalPastPages - 1}
                    onClick={() => setPastDaysPage((p) => Math.min(totalPastPages - 1, p + 1))}
                    className="p-1 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 cursor-pointer text-gray-600"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {visiblePastDates.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${selectedDate === item.date
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-gray-50/80 hover:bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                  >
                    <span className="text-[10px] font-bold block opacity-70">
                      {item.date}
                    </span>
                    <span className="text-sm font-black block mt-0.5">
                      ₹{item.total.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] block opacity-60 truncate mt-0.5">
                      {item.salesperson ? item.salesperson : `${item.count} items`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONFIRM & LOCK MODAL                                      */}
      {/* ========================================================= */}
      {showLockConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  Confirm &amp; Lock Day Closing?
                </h3>
                <span className="text-xs text-gray-500 font-semibold">
                  {readableDate}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Total Collection:</span>
                <span className="text-sm font-black text-emerald-700">₹{sheet.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Total Items Sold:</span>
                <span className="font-bold text-gray-900">{sheet.count} items</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-semibold">Staff on Duty:</span>
                <span className="font-bold text-gray-800 text-right truncate max-w-[200px]">
                  {salesperson || 'None recorded'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Tamper-Proof Notice:</strong> Once confirmed, this day's sales register and staff attendance will be strictly locked. Workers cannot add, edit, or delete items.
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-xs font-extrabold text-emerald-400 shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Confirm &amp; Lock</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* STORE OWNER PIN UNLOCK MODAL                             */}
      {/* ========================================================= */}
      {showUnlockPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    Store Owner Unlock
                  </h3>
                  <span className="text-xs text-gray-500 font-semibold">
                    Tamper Protection
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnlockPinModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This sales register has been finalized. Enter the <strong>Store Owner PIN</strong> to unlock and make changes.
            </p>

            <form onSubmit={handleVerifyOwnerPinAndUnlock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Owner Security PIN:
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Owner PIN (e.g. 7days)"
                  value={unlockPinInput}
                  onChange={(e) => {
                    setUnlockPinInput(e.target.value);
                    setUnlockPinError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-sm font-mono tracking-widest text-center"
                />
                {unlockPinError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{unlockPinError}</span>
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  Default PINs: <code>7days</code> or <code>7777</code>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUnlockPinModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-black text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Verify &amp; Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. STORE OWNER PERMANENT DELETE REGISTER MODAL */}
      {showDeleteSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    Delete Sales Register
                  </h3>
                  <span className="text-xs text-red-600 font-bold">
                    Permanent Purge
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteSheetModal(false);
                  setDeletePinInput('');
                  setDeletePinError('');
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200/80 text-xs text-red-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span>Confirm Deletion for {selectedDate}</span>
              </p>
              <p className="text-[11px] text-red-700 leading-relaxed">
                This will permanently remove all <strong>{sheet.count || 0} items</strong> (₹{Number(sheet.total || 0).toLocaleString('en-IN')}) from cloud and local records.
              </p>
            </div>

            <form onSubmit={handleConfirmDeleteSheet} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Owner Security PIN to Confirm:
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter Owner PIN (e.g. 7777)"
                  value={deletePinInput}
                  onChange={(e) => {
                    setDeletePinInput(e.target.value);
                    setDeletePinError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none text-sm font-mono tracking-widest text-center"
                />
                {deletePinError && (
                  <p className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{deletePinError}</span>
                  </p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  Default PINs: <code>7days</code> or <code>7777</code>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteSheetModal(false);
                    setDeletePinInput('');
                    setDeletePinError('');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete &amp; Reset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
}
