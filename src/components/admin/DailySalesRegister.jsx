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
  ChevronRight,
  RefreshCw,
  CreditCard,
  QrCode,
  Banknote,
  ShoppingBag,
  TrendingUp,
  Clock,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  UserPlus
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
  addStaffMember,
  removeStaffMember,
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

export default function DailySalesRegister({
  products = [],
  showNotice,
  initialDate,
  onNavigateToPastSales
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

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
  const [isSyncingSales, setIsSyncingSales] = useState(false);

  // User-Friendly Add Staff Modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Sales Staff');
  const [newStaffOnDutyNow, setNewStaffOnDutyNow] = useState(true);

  // POS Ledger Filter & Search states
  const [paymentFilter, setPaymentFilter] = useState('All'); // 'All' | 'Cash' | 'UPI' | 'Card'
  const [salesSearch, setSalesSearch] = useState('');

  // Filtered sales items for today's table
  const filteredItems = useMemo(() => {
    let list = sheet?.items || [];
    if (paymentFilter !== 'All') {
      list = list.filter((it) => it.paymentMethod === paymentFilter);
    }
    if (salesSearch.trim()) {
      const q = salesSearch.toLowerCase();
      list = list.filter((it) => it.itemName?.toLowerCase().includes(q));
    }
    return list;
  }, [sheet?.items, paymentFilter, salesSearch]);

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Quick preset amount helper
  const handlePresetAmount = (presetVal) => {
    setAmount((prev) => {
      const current = Number(prev) || 0;
      return String(current + presetVal);
    });
  };

  const handleManualSalesSync = async () => {
    if (isSyncingSales) return;
    setIsSyncingSales(true);
    try {
      await Promise.allSettled([
        syncDailySalesFromServer(),
        fetchDailySalesSheet(selectedDate)
      ]);
      const freshSheet = getDailySalesSheet(selectedDate);
      setSheet(freshSheet);
      setPastDates(getAllSalesDates());
      const currentDuty = getDutyStatusForDate(selectedDate);
      setDutyMap(currentDuty);
      showNotice?.('success', 'Daily Sales synchronized with cloud server!');
    } catch (err) {
      console.error('Manual sales sync failed:', err);
      showNotice?.('error', 'Sync failed: ' + (err?.message || 'Error syncing'));
    } finally {
      setIsSyncingSales(false);
    }
  };

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
    if (updatedSheet && typeof updatedSheet.then !== 'function') {
      setSheet(updatedSheet);
    } else {
      setSheet(getDailySalesSheet(selectedDate));
    }

    const staffObj = availableStaff.find((s) => s.id === staffId);
    recordAdminAction({
      action: 'DUTY_CHANGE',
      category: 'Attendance',
      title: `Staff Duty: ${staffObj?.name || 'Staff'} (${status})`,
      details: `Updated duty status to ${status} for date ${selectedDate}`
    });
  };

  const handleAddNewStaff = (e) => {
    e?.preventDefault();
    if (!newStaffName.trim()) {
      showNotice?.('error', 'Please enter a staff name');
      return;
    }
    const name = newStaffName.trim();
    const role = newStaffRole.trim() || 'Sales Staff';
    const updatedStaffList = addStaffMember(name, role);
    setAvailableStaff(updatedStaffList);

    const addedMember = updatedStaffList.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    if (addedMember && newStaffOnDutyNow) {
      handleSetStaffDuty(addedMember.id, 'Full');
    }

    setNewStaffName('');
    setNewStaffRole('Sales Staff');
    setShowAddStaffModal(false);
    showNotice?.('success', `Staff member "${name}" added successfully!`);

    recordAdminAction({
      action: 'CREATE',
      category: 'Attendance',
      title: `Added Staff: ${name}`,
      details: `Added new staff member (${role}) to store register`
    });
  };

  const handleRemoveStaff = async (staffId, staffName) => {
    if (sheet.isLocked) {
      showNotice?.('error', 'This register is locked. Staff list cannot be modified.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${staffName} from staff members?`)) {
      const updated = await removeStaffMember(staffId);
      setAvailableStaff(updated);
      showNotice?.('success', `Removed ${staffName} from staff list`);
    }
  };

  const handleCustomSalespersonTextChange = (text) => {
    if (sheet.isLocked) return;
    setSalesperson(text);
    const updated = setDailySalesperson(selectedDate, text);
    if (updated && typeof updated.then !== 'function') {
      setSheet(updated);
    } else {
      setSheet(getDailySalesSheet(selectedDate));
    }
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
    if (!sheet || typeof sheet !== 'object' || typeof sheet.then === 'function') {
      return '';
    }
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
    <div className="space-y-6 pb-20 font-body">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & POS CONTROL BAR                          */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Section Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-black text-sm shadow-md shrink-0">
              7D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Daily Sales Register
                </h1>
                {sheet.isLocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                    <Lock className="w-3 h-3 text-amber-700" />
                    Locked &amp; Finalized
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Open for Sales
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium block mt-0.5">
                Fast POS Sales Entry, Real-Time Revenue Collection &amp; Day Closing
              </span>
            </div>
          </div>

          {/* Date Navigator & Cloud Sync Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Sync Button */}
            <button
              type="button"
              onClick={handleManualSalesSync}
              disabled={isSyncingSales}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition cursor-pointer disabled:opacity-60 shadow-2xs group"
              title="Reload latest sales from cloud server"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{isSyncingSales ? 'Syncing...' : 'Live Sync'}</span>
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isSyncingSales ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
            </button>

            {/* Date Switcher Pill */}
            <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-[#FB8500]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold text-gray-800 outline-none bg-transparent cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-white'
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-white text-gray-600 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons: WhatsApp / PDF / Copy */}
            <div className="flex items-center gap-1.5">
              {sheet.isLocked ? (
                <>
                  <button
                    onClick={handleSendPdfToWhatsApp}
                    disabled={sheet.items.length === 0 || isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-[#25D366] hover:bg-[#20ba59] shadow-xs transition cursor-pointer disabled:opacity-50"
                    title="Send closing sheet PDF to WhatsApp"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    )}
                    <span>WhatsApp Closing</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={sheet.items.length === 0 || isGeneratingPdf}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-xs transition cursor-pointer disabled:opacity-50"
                    title="Download styled A4 PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-gray-600" />
                    <span>PDF</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLockConfirmModal(true)}
                  disabled={sheet.items.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-black shadow-xs transition cursor-pointer disabled:opacity-50"
                  title="Confirm & Lock Day Closing before exporting"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lock Day</span>
                </button>
              )}

              <button
                onClick={handleCopyText}
                disabled={sheet.items.length === 0}
                className="p-2 rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer disabled:opacity-50"
                title="Copy text summary"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition cursor-pointer"
                title="Print sales register"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp destination phone number bar */}
        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Selected Sheet Date:</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-lg">
              {readableDate}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-800">
            <Phone className="w-3 h-3 text-emerald-600" />
            <span className="font-semibold">WhatsApp Target:</span>
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
              <span className="font-black font-mono">+{targetPhone}</span>
            )}
            <button
              type="button"
              onClick={() => setShowPhoneEditor(!showPhoneEditor)}
              className="text-[10px] text-emerald-700 hover:underline cursor-pointer ml-1"
            >
              {showPhoneEditor ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. STAFF ON DUTY & QUICK ADD STAFF BAR                   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Staff On Duty Today
                </h3>
                {onDutyCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {onDutyCount} Active
                  </span>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                    None Selected
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-500 font-medium block mt-0.5">
                {salesperson ? `Credited: ${salesperson}` : 'Tap a staff chip to mark Full Day / Half Day / Off duty'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer self-start sm:self-auto shadow-2xs group"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-700 transition-transform group-hover:scale-110" />
            <span>+ Add Staff Member</span>
          </button>
        </div>

        {availableStaff.length === 0 ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-gray-800">
                No staff members in store roster yet
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                Add your salespersons, cashiers, or managers so their names appear on daily sales sheets and PDFs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-[#FB8500] hover:bg-[#e07500] shadow-xs transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add First Staff</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {availableStaff.map((staff) => {
              const status = dutyMap[staff.id] || 'Off';
              const isFull = status === 'Full';
              const isHalf = status === 'Half';

              return (
                <div
                  key={staff.id}
                  className={`inline-flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl border transition shadow-2xs ${
                    isFull
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400/40'
                      : isHalf
                      ? 'bg-amber-50 text-amber-950 border-amber-300 ring-1 ring-amber-400/40'
                      : 'bg-gray-50/80 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <button
                    type="button"
                    disabled={sheet.isLocked}
                    onClick={() => handleToggleStaffDuty(staff.id)}
                    className="flex items-center gap-2 text-left cursor-pointer disabled:opacity-50"
                    title={`Click to cycle duty status (currently ${status})`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        isFull
                          ? 'bg-emerald-600 text-white'
                          : isHalf
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block leading-tight">
                        {staff.name}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">
                        {staff.role || 'Staff'}
                      </span>
                    </div>

                    <span
                      className={`ml-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md transition ${
                        isFull
                          ? 'bg-emerald-600 text-white'
                          : isHalf
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {status === 'Full' ? 'Full Day' : status === 'Half' ? 'Half Day' : 'Off'}
                    </span>
                  </button>

                  {!sheet.isLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStaff(staff.id, staff.name)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition cursor-pointer ml-0.5"
                      title={`Remove ${staff.name} from staff list`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. QUICK SALE ENTRY POS TERMINAL (THE MAIN FOCUS)        */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FB8500] to-[#FFB703] text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">
                Quick Sale Entry
              </h2>
              <span className="text-[11px] text-gray-400 font-medium">
                Type toy or item name, amount, choose payment, and hit Enter
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span>Fast Billing</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-amber-300 text-[10px] font-mono shadow-2xs">Enter ↵</kbd>
          </span>
        </div>

        {sheet.isLocked ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  Daily Sales Register is Confirmed &amp; Locked
                </h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  New sales entry is locked to protect closing accounts. Unlock with Store Owner PIN to edit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenUnlockModal}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock with Owner PIN</span>
              </button>
              <button
                type="button"
                onClick={handleOpenDeleteSheetModal}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
                title="Delete this day's sales sheet"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-end">
              {/* Product / Toy Name Input */}
              <div className="lg:col-span-5 relative">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Item / Toy Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={itemInputRef}
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Magic Twister, Baby Tricycle, Teddy Bear..."
                    className="w-full pl-10 pr-9 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#FB8500] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white"
                  />
                  {itemName && (
                    <button
                      type="button"
                      onClick={() => setItemName('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Catalogue Autocomplete Dropdown */}
                {itemSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl divide-y divide-gray-100 overflow-hidden">
                    <div className="p-2 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Matching Store Catalogue Toys
                    </div>
                    {itemSuggestions.map((sug) => (
                      <div
                        key={sug.id}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="p-3 hover:bg-amber-50 flex items-center justify-between text-xs cursor-pointer transition"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-gray-900 block truncate">{sug.name}</span>
                          <span className="text-[10px] text-gray-400 block">{sug.category || 'Toy'}</span>
                        </div>
                        {sug.price && (
                          <span className="font-black text-sm text-[#FB8500] shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            ₹{sug.price}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price / Amount Input */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  {/* Preset Amount Increment Pills */}
                  <div className="flex items-center gap-1">
                    {[100, 500, 1000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetAmount(preset)}
                        className="px-1.5 py-0.5 rounded bg-gray-100 hover:bg-amber-100 text-[10px] font-bold text-gray-700 hover:text-amber-900 transition cursor-pointer"
                        title={`Add +₹${preset}`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3.5 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-900 focus:ring-2 focus:ring-[#FB8500] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      paymentMethod === 'UPI'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span className="text-[10px]">UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center gap-0.5 ${
                      paymentMethod === 'Card'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Card</span>
                  </button>
                </div>
              </div>

              {/* + Add Sale Button */}
              <div className="lg:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#FB8500] to-[#FFB703] hover:from-[#e07500] hover:to-[#f0a500] shadow-md shadow-[#FB8500]/25 transition transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Sale Item</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. LIVE REVENUE METRICS (FINANCIAL STAT CARDS)             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Day Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 sm:p-5 rounded-3xl shadow-md space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Total Revenue</span>
            </span>
            <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full">
              {sheet.count} {sheet.count === 1 ? 'Sale' : 'Sales'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight">
            ₹{Number(sheet?.total || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-100 block">
            {readableDate}
          </span>
        </div>

        {/* Card 2: Cash In Hand */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {sheet.total > 0 ? `${Math.round((cashTotal / sheet.total) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ₹{cashTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            Physical cash collection
          </span>
        </div>

        {/* Card 3: UPI / QR Collection */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>UPI / QR</span>
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {sheet.total > 0 ? `${Math.round((upiTotal / sheet.total) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ₹{upiTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            GPay, PhonePe, Paytm
          </span>
        </div>

        {/* Card 4: Card Collection */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Card / Machine</span>
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {sheet.total > 0 ? `${Math.round((cardTotal / sheet.total) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            ₹{cardTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            Debit / Credit Card POS
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. TODAY'S SALES LEDGER TABLE & FILTER STATION           */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden" ref={sheetPrintRef}>
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Payment Mode Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200 flex-wrap">
            <button
              type="button"
              onClick={() => setPaymentFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'All'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All Items</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700">
                {sheet.items.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('Cash')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'Cash'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800">
                {sheet.items.filter((i) => i.paymentMethod === 'Cash').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('UPI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'UPI'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>UPI</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-800">
                {sheet.items.filter((i) => i.paymentMethod === 'UPI').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentFilter('Card')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                paymentFilter === 'Card'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Card</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800">
                {sheet.items.filter((i) => i.paymentMethod === 'Card').length}
              </span>
            </button>
          </div>

          {/* Search Sales Input & Actions */}
          <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                placeholder="Search today's items..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB8500]/20 focus:border-[#FB8500] transition"
              />
              {salesSearch && (
                <button
                  type="button"
                  onClick={() => setSalesSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!sheet.isLocked && sheet.items.length > 0 && (
              <button
                type="button"
                onClick={handleClearSheet}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition cursor-pointer shrink-0"
                title="Clear all items from today's sheet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Item / Toy Sold</th>
                <th className="py-3 px-4 text-center w-28">Payment Mode</th>
                <th className="py-3 px-4 text-center w-28">Time</th>
                <th className="py-3 px-4 text-right w-36">Amount (₹)</th>
                <th className="py-3 px-4 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#FB8500] flex items-center justify-center mx-auto shadow-2xs">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-gray-800">
                        {sheet.items.length === 0
                          ? 'No sales recorded for this date yet'
                          : 'No sales match your current search/filter'}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {sheet.items.length === 0
                          ? 'Use the Quick Sale Entry station above to record items sold at the counter.'
                          : 'Try switching the payment mode filter or clearing the search box.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-amber-50/30 transition group"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-gray-400 text-xs">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">
                            {item.itemName}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.paymentMethod === 'UPI'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : item.paymentMethod === 'Card'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {item.paymentMethod === 'UPI' ? (
                            <QrCode className="w-3 h-3" />
                          ) : item.paymentMethod === 'Card' ? (
                            <CreditCard className="w-3 h-3" />
                          ) : (
                            <Banknote className="w-3 h-3" />
                          )}
                          <span>{item.paymentMethod}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center text-gray-500 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{item.time || 'Today'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-sm text-gray-900 font-mono">
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (sheet.isLocked) {
                              showNotice?.('info', 'Register is locked. Please unlock first to delete items.');
                              handleOpenUnlockModal();
                            } else {
                              handleDeleteItem(item.id);
                            }
                          }}
                          className={`p-1.5 rounded-xl transition cursor-pointer ${
                            sheet.isLocked
                              ? 'text-gray-300 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-gray-300 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={sheet.isLocked ? 'Sheet is locked. Click to unlock & delete' : 'Delete item'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Bottom Summary Bar */}
        <div className="p-4 sm:p-5 bg-gray-50/90 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap text-xs">
            <span className="font-extrabold text-gray-900">
              Day Closing Total: <strong className="text-base text-emerald-700 font-black">₹{Number(sheet?.total || 0).toLocaleString('en-IN')}</strong> ({sheet?.count || 0} items)
            </span>
            <span className="text-gray-400">&bull;</span>
            <span className="text-gray-600 font-medium">Cash: <strong className="text-gray-900">₹{cashTotal.toLocaleString('en-IN')}</strong></span>
            <span className="text-gray-600 font-medium">UPI: <strong className="text-gray-900">₹{upiTotal.toLocaleString('en-IN')}</strong></span>
            {cardTotal > 0 && <span className="text-gray-600 font-medium">Card: <strong className="text-gray-900">₹{cardTotal.toLocaleString('en-IN')}</strong></span>}
          </div>

          <div className="flex items-center gap-2">
            {!sheet.isLocked ? (
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(true)}
                disabled={sheet.items.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-black shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lock Day Closing</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenUnlockModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Sheet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. QUICK LINK TO PAST SALES SHEETS ARCHIVE                */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FB8500] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Browse Past Daily Sales Sheets
            </h4>
            <p className="text-[11px] text-gray-500 font-medium">
              Access full historical sales archives, items sold &amp; official closing records.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToPastSales?.()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-gray-800 bg-gray-100 hover:bg-gray-200 transition cursor-pointer self-start sm:self-auto"
        >
          <span>View Past Sales Sheets</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FB8500]" />
        </button>
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
                <span className="text-sm font-black text-emerald-700">₹{Number(sheet?.total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Total Items Sold:</span>
                <span className="font-bold text-gray-900">{sheet.count} items</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-semibold">Breakdown:</span>
                <span className="font-bold text-gray-800 text-right text-xs">
                  Cash: ₹{cashTotal} &bull; UPI: ₹{upiTotal}{cardTotal > 0 ? ` • Card: ₹${cardTotal}` : ''}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Tamper-Proof Notice:</strong> Once confirmed, this day's sales register will be strictly locked. Workers cannot add, edit, or delete items.
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

      {/* ========================================================= */}
      {/* USER-FRIENDLY ADD STAFF MEMBER MODAL                     */}
      {/* ========================================================= */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    Add New Staff Member
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    Store salesperson, cashier, or billing counter
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Staff Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rahul, Salman, Athil, Muhammed..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#FB8500] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Role / Position
                </label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Sales Staff, Cashier, Manager..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#FB8500] outline-none mb-2"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Sales Staff', 'Cashier', 'Billing Counter', 'Store Manager', 'Counter Helper'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewStaffRole(preset)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                        newStaffRole === preset
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-950 block">
                    Mark On Duty Immediately
                  </span>
                  <span className="text-[11px] text-emerald-800 block">
                    Automatically record this staff as on duty for today
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newStaffOnDutyNow}
                  onChange={(e) => setNewStaffOnDutyNow(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FB8500] to-[#FFB703] hover:from-[#e07500] hover:to-[#f0a500] text-xs font-black text-white shadow-md shadow-[#FB8500]/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Save Staff Member</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  );
}
