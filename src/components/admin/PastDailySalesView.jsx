import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  FileText,
  MessageCircle,
  Download,
  Share2,
  TrendingUp,
  Banknote,
  QrCode,
  CreditCard,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Package,
  Layers,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import {
  getAllSalesDates,
  getDailySalesSheet,
  formatDailySalesWhatsAppMessage,
  syncDailySalesFromServer
} from '../../services/dailySalesService';
import { getDutyStatusForDate, getStaffList } from '../../services/attendanceService';
import { downloadSalesSheetPdf, sendPdfToWhatsApp } from '../../services/pdfService';
import { SHOP_WHATSAPP_NUMBER } from '../../data/config';

export default function PastDailySalesView({ onOpenInRegister, showNotice }) {
  const [salesDates, setSalesDates] = useState(() => getAllSalesDates());
  const [selectedDate, setSelectedDate] = useState(() => {
    const dates = getAllSalesDates();
    return dates.length > 0 ? dates[0].date : new Date().toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'locked' | 'unlocked'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'Cash' | 'UPI' | 'Card'

  // Load latest sheet details whenever selectedDate changes
  const activeSheet = useMemo(() => {
    return getDailySalesSheet(selectedDate);
  }, [selectedDate, salesDates]);

  // Load duty / staff for selected date
  const staffOnDuty = useMemo(() => {
    if (activeSheet.salesperson) return activeSheet.salesperson;
    const duty = getDutyStatusForDate(selectedDate);
    const staff = getStaffList();
    const active = staff
      .filter((s) => duty[s.id] === 'Full' || duty[s.id] === 'Half')
      .map((s) => `${s.name} (${duty[s.id]})`);
    return active.join(', ');
  }, [selectedDate, activeSheet]);

  // Listen to daily sales update events
  useEffect(() => {
    const handleUpdate = () => {
      const dates = getAllSalesDates();
      setSalesDates(dates);
    };
    window.addEventListener('7days_daily_sales_updated', handleUpdate);
    return () => window.removeEventListener('7days_daily_sales_updated', handleUpdate);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncDailySalesFromServer();
      const freshDates = getAllSalesDates();
      setSalesDates(freshDates);
      showNotice?.('success', 'Past sales sheets refreshed from server!');
    } catch (e) {
      console.warn('Sync error:', e);
      showNotice?.('error', 'Failed to refresh from cloud server');
    } finally {
      setIsRefreshing(false);
    }
  };

  // High-level historical statistics
  const historicalStats = useMemo(() => {
    let totalRev = 0;
    let totalItems = 0;
    let totalCash = 0;
    let totalOnline = 0;
    let lockedCount = 0;

    salesDates.forEach((d) => {
      const sheet = getDailySalesSheet(d.date);
      totalRev += Number(sheet.total || 0);
      totalItems += Number(sheet.count || sheet.items?.length || 0);
      totalCash += Number(sheet.cashTotal || 0);
      totalOnline += Number((sheet.upiTotal || 0) + (sheet.cardTotal || 0));
      if (sheet.isLocked) lockedCount += 1;
    });

    return {
      totalRevenue: totalRev,
      totalDays: salesDates.length,
      totalItems,
      totalCash,
      totalOnline,
      lockedCount,
      averagePerDay: salesDates.length > 0 ? Math.round(totalRev / salesDates.length) : 0
    };
  }, [salesDates]);

  // Filtered sales dates
  const filteredDates = useMemo(() => {
    return salesDates.filter((item) => {
      const sheet = getDailySalesSheet(item.date);
      const matchesSearch =
        !searchQuery.trim() ||
        item.date.includes(searchQuery.trim()) ||
        (sheet.salesperson && sheet.salesperson.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'locked' && sheet.isLocked) ||
        (statusFilter === 'unlocked' && !sheet.isLocked);

      return matchesSearch && matchesStatus;
    });
  }, [salesDates, searchQuery, statusFilter]);

  // Formatted date string for active sheet
  const formattedReadableDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      return new Date(selectedDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Filtered items of active sheet
  const filteredItems = useMemo(() => {
    if (!activeSheet || !activeSheet.items) return [];
    return activeSheet.items.filter((it) => {
      const matchesName =
        !itemSearchQuery.trim() ||
        it.itemName.toLowerCase().includes(itemSearchQuery.toLowerCase());
      const matchesPay =
        paymentFilter === 'ALL' || it.paymentMethod === paymentFilter;
      return matchesName && matchesPay;
    });
  }, [activeSheet, itemSearchQuery, paymentFilter]);

  // PDF Export
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showNotice?.('info', `Preparing PDF for ${selectedDate}...`);
    try {
      const pdfData = {
        dateStr: selectedDate,
        readableDate: formattedReadableDate,
        sheet: activeSheet,
        staffNames: staffOnDuty,
        attendanceReport: null
      };
      await downloadSalesSheetPdf(pdfData, selectedDate);
      showNotice?.('success', `PDF for ${selectedDate} downloaded!`);
    } catch (err) {
      console.error(err);
      showNotice?.('error', 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // WhatsApp Message Sharing
  const handleShareWhatsAppText = () => {
    const text = formatDailySalesWhatsAppMessage(selectedDate, activeSheet);
    if (!text) {
      showNotice?.('error', 'No data to share for this date');
      return;
    }
    const cleanPhone = SHOP_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Direct PDF share to WhatsApp
  const handleSendPdfWhatsApp = async () => {
    setIsGeneratingPdf(true);
    showNotice?.('info', `Sending PDF to WhatsApp...`);
    try {
      const pdfData = {
        dateStr: selectedDate,
        readableDate: formattedReadableDate,
        sheet: activeSheet,
        staffNames: staffOnDuty,
        attendanceReport: null
      };
      await sendPdfToWhatsApp(pdfData, selectedDate, SHOP_WHATSAPP_NUMBER);
      showNotice?.('success', 'PDF prepared for WhatsApp!');
    } catch (err) {
      console.error(err);
      showNotice?.('error', 'Failed to send PDF to WhatsApp');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & GLOBAL ACTIONS                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-[#FB8500]">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#263238] tracking-tight">
              Browse Past Daily Sales Sheets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 pl-11">
            Historical day closing records, items sold, payment mode breakdowns &amp; staff attendance archives.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FB8500]' : 'text-gray-500'}`} />
            <span>Sync Cloud</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenInRegister?.(new Date().toISOString().split('T')[0])}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#FB8500] to-[#FFB703] hover:from-[#e07500] hover:to-[#f0a500] shadow-md shadow-[#FB8500]/25 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Today's Sales Register</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HISTORICAL KPI STATS                                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-3xl shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Historical Revenue</span>
            </span>
            <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full text-emerald-300">
              {historicalStats.totalDays} Days
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ₹{historicalStats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Avg. ₹{historicalStats.averagePerDay.toLocaleString('en-IN')} / day
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#FB8500]" />
              <span>Items Sold</span>
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Catalog
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {historicalStats.totalItems}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            Recorded sale entries
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash Collection</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {historicalStats.totalRevenue > 0
                ? `${Math.round((historicalStats.totalCash / historicalStats.totalRevenue) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
            ₹{historicalStats.totalCash.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            Physical store cash
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              <span>Digital / UPI</span>
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {historicalStats.totalRevenue > 0
                ? `${Math.round((historicalStats.totalOnline / historicalStats.totalRevenue) * 100)}%`
                : '0%'}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
            ₹{historicalStats.totalOnline.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            UPI, GPay &amp; POS Cards
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MASTER-DETAIL DUAL PANE LAYOUT                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIST OF DATES (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FB8500]" />
                <span>Recorded Dates ({filteredDates.length})</span>
              </h2>
            </div>

            {/* Date Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search YYYY-MM-DD or staff..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#FB8500] outline-none"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-xl text-[11px] font-bold text-gray-600">
              {[
                { id: 'all', label: 'All' },
                { id: 'locked', label: 'Locked 🔒' },
                { id: 'unlocked', label: 'In Progress ⏳' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex-1 py-1 rounded-lg transition cursor-pointer text-center ${
                    statusFilter === tab.id
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates Cards Scrollable List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 no-scrollbar">
            {filteredDates.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Calendar className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold">No sales sheets match your filter.</p>
              </div>
            ) : (
              filteredDates.map((item) => {
                const isSelected = selectedDate === item.date;
                const sheet = getDailySalesSheet(item.date);
                const displayTotal = Number(sheet.total || item.total || 0);
                const count = sheet.count || item.count || 0;

                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => setSelectedDate(item.date)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                        : 'bg-gray-50/70 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-black ${isSelected ? 'text-amber-300' : 'text-gray-900'}`}>
                        {item.date}
                      </span>
                      {sheet.isLocked ? (
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <Unlock className="w-2.5 h-2.5" />
                          <span>In-Progress</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                        ₹{displayTotal.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-gray-500'}`}>
                        {count} items
                      </span>
                    </div>

                    {sheet.salesperson && (
                      <div className={`text-[10px] truncate mt-1.5 flex items-center gap-1 ${isSelected ? 'text-slate-300' : 'text-gray-500'}`}>
                        <UserCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate">{sheet.salesperson}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE SHEET DETAILS (8 COLS) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Card for Selected Date */}
          <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {selectedDate}
                  </span>
                  {activeSheet.isLocked ? (
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>EOD Finalized &amp; Locked</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      <span>Active / Open Register</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                  {formattedReadableDate}
                </h2>
                {staffOnDuty ? (
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Staff Credited: {staffOnDuty}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    No staff credited on duty for this date.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onOpenInRegister?.(selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-black transition cursor-pointer shadow-xs"
                  title="Open this date in Daily Sales Register for editing"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open in Register</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                  title="Download styled A4 PDF"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsAppText}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                  title="Send summary to WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendPdfWhatsApp}
                  disabled={isGeneratingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                  title="Share PDF directly to WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Send PDF</span>
                </button>
              </div>
            </div>

            {/* Financial Mini Cards for this Sheet */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Total Day Sales
                </span>
                <span className="text-lg font-black text-emerald-900 block mt-0.5">
                  ₹{Number(activeSheet.total || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {activeSheet.count || activeSheet.items?.length || 0} entries
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                  Cash In Hand
                </span>
                <span className="text-lg font-black text-gray-900 block mt-0.5">
                  ₹{Number(activeSheet.cashTotal || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  Physical currency
                </span>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  UPI / QR
                </span>
                <span className="text-lg font-black text-purple-900 block mt-0.5">
                  ₹{Number(activeSheet.upiTotal || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-purple-600 font-medium">
                  GPay / PhonePe
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Card Machine
                </span>
                <span className="text-lg font-black text-blue-900 block mt-0.5">
                  ₹{Number(activeSheet.cardTotal || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-600 font-medium">
                  POS swipe / tap
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Sold Products Table */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#FB8500]" />
                <h3 className="text-sm font-black text-gray-900">
                  Itemized Sales Ledger ({filteredItems.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search sold items..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-[#FB8500] outline-none"
                  />
                </div>

                {/* Payment method selector */}
                <div className="flex items-center gap-1 p-0.5 bg-gray-200/70 rounded-xl text-[10px] font-bold text-gray-600">
                  {['ALL', 'Cash', 'UPI', 'Card'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentFilter(m)}
                      className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                        paymentFilter === m
                          ? 'bg-white text-gray-900 shadow-xs font-black'
                          : 'hover:text-gray-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            {filteredItems.length === 0 ? (
              <div className="p-10 text-center text-gray-400 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold">
                  {activeSheet.items && activeSheet.items.length > 0
                    ? 'No sales matched your search filter.'
                    : 'No sales recorded for this date.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/90 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Item Name / Product</th>
                      <th className="py-3 px-4">Payment Mode</th>
                      <th className="py-3 px-4 text-center">Time</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-amber-50/30 transition">
                        <td className="py-3 px-4 text-center text-gray-400 font-bold text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {item.itemName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.paymentMethod === 'Cash'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.paymentMethod === 'UPI'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {item.paymentMethod === 'Cash' && <Banknote className="w-2.5 h-2.5" />}
                            {item.paymentMethod === 'UPI' && <QrCode className="w-2.5 h-2.5" />}
                            {item.paymentMethod === 'Card' && <CreditCard className="w-2.5 h-2.5" />}
                            <span>{item.paymentMethod || 'Cash'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500 text-[11px]">
                          {item.time || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900 text-sm">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Total Shown: {filteredItems.length} items</span>
              <span className="text-emerald-700 font-black text-sm">
                Sum: ₹{filteredItems.reduce((acc, it) => acc + Number(it.amount || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
