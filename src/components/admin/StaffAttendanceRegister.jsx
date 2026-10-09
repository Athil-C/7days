import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Lock
} from 'lucide-react';
import {
  getStaffList,
  addStaffMember,
  removeStaffMember,
  getMonthAttendance,
  setStaffAttendance,
  getDutyStatusForDate
} from '../../services/attendanceService';
import { recordAdminAction } from '../../services/adminLogService';

export default function StaffAttendanceRegister({
  selectedDate,
  onApplyStaffToSales,
  showNotice
}) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12

  const [staffList, setStaffList] = useState(() => getStaffList());
  const [attendance, setAttendance] = useState(() =>
    getMonthAttendance(currentYear, currentMonth)
  );

  // New staff modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Sales Staff');

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  // Today day number if viewing current month/year
  const isViewingCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;
  const currentDayNum = isViewingCurrentMonth ? today.getDate() : null;

  // Selected sales date day number if viewing the sales date's month
  const salesDayNum = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split('-').map(Number);
    if (y === currentYear && m === currentMonth) {
      return d;
    }
    return null;
  }, [selectedDate, currentYear, currentMonth]);

  // Automatically synchronize view when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) {
        setCurrentYear(y);
        setCurrentMonth(m);
      }
    }
  }, [selectedDate]);

  // Reload attendance when month changes or when attendance is updated externally
  const reloadAttendance = useCallback(() => {
    const data = getMonthAttendance(currentYear, currentMonth);
    setAttendance({ ...data });
    setStaffList(getStaffList());
  }, [currentYear, currentMonth]);

  useEffect(() => {
    reloadAttendance();

    const handleUpdate = () => {
      reloadAttendance();
    };

    window.addEventListener('7days_attendance_updated', handleUpdate);
    window.addEventListener('7days_staff_updated', handleUpdate);
    return () => {
      window.removeEventListener('7days_attendance_updated', handleUpdate);
      window.removeEventListener('7days_staff_updated', handleUpdate);
    };
  }, [reloadAttendance]);

  // Handle month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToCurrentMonth = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Add new staff
  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;
    const addedName = newStaffName.trim();
    const addedRole = newStaffRole;
    const updated = addStaffMember(addedName, addedRole);
    setStaffList(updated);
    setNewStaffName('');
    setNewStaffRole('Sales Staff');
    setIsAddStaffOpen(false);
    reloadAttendance();
    showNotice?.('success', `Added ${addedName} to staff register`);

    recordAdminAction({
      action: 'CREATE',
      category: 'Attendance',
      title: `Staff Member Added: ${addedName}`,
      details: `Role assigned: ${addedRole}`
    });
  };

  const handleDeleteStaff = (staffId, staffName) => {
    if (!window.confirm(`Remove ${staffName} from staff register?`)) return;
    const updated = removeStaffMember(staffId);
    setStaffList(updated);
    reloadAttendance();
    showNotice?.('success', `Removed ${staffName}`);

    recordAdminAction({
      action: 'DELETE',
      category: 'Attendance',
      title: `Staff Member Removed: ${staffName}`,
      details: `Removed from store staff roster`
    });
  };

  const isViewingSalesMonth = useMemo(() => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return y === currentYear && m === currentMonth;
  }, [selectedDate, currentYear, currentMonth]);

  // Interactive toggle cell for a staff member on a specific day
  // Cycles: Unmarked (-) -> Present (✓) -> Half-Day (½) -> Absent (✗) -> Unmarked (-)
  const handleToggleCell = (staffId, day) => {
    const staffRecords = attendance[staffId] || {};
    const currentStatus = staffRecords[day] ?? staffRecords[String(day)] ?? null;

    let nextStatus = null;
    if (!currentStatus || currentStatus === '-') {
      nextStatus = 'P';
    } else if (
      currentStatus === 'P' ||
      currentStatus === 'Full' ||
      currentStatus === 'full' ||
      currentStatus === 'Present'
    ) {
      nextStatus = 'H';
    } else if (
      currentStatus === 'H' ||
      currentStatus === 'Half' ||
      currentStatus === 'half'
    ) {
      nextStatus = 'A';
    } else if (
      currentStatus === 'A' ||
      currentStatus === 'Absent' ||
      currentStatus === 'absent' ||
      currentStatus === 'Off'
    ) {
      nextStatus = null;
    }

    setStaffAttendance(currentYear, currentMonth, day, staffId, nextStatus);
    reloadAttendance();

    // If day matches the current selected sales date, sync back to Daily Sales
    if (isViewingSalesMonth && day === salesDayNum && selectedDate) {
      const updatedDuty = getDutyStatusForDate(selectedDate);
      const activeStaff = staffList
        .filter((s) => updatedDuty[s.id] === 'Full' || updatedDuty[s.id] === 'Half')
        .map((s) => `${s.name} (${updatedDuty[s.id]})`);
      const formatted = activeStaff.join(', ');
      onApplyStaffToSales?.(formatted);
    }
  };

  // Quick Action: Mark all active staff Present for selected sales day or today
  const targetDayForQuickAction = (isViewingSalesMonth && salesDayNum) || currentDayNum || 1;
  const handleMarkAllPresent = () => {
    staffList.forEach((s) => {
      setStaffAttendance(currentYear, currentMonth, targetDayForQuickAction, s.id, 'P');
    });
    reloadAttendance();
    if (isViewingSalesMonth && targetDayForQuickAction === salesDayNum && selectedDate) {
      const activeStaff = staffList.map((s) => `${s.name} (Full)`);
      onApplyStaffToSales?.(activeStaff.join(', '));
    }
    showNotice?.('success', `Marked all staff Present (✓) for Day ${targetDayForQuickAction}`);
  };

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString(
    'en-IN',
    { month: 'long', year: 'numeric' }
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4">
      {/* ========================================================= */}
      {/* HEADER & CONTROLS                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6A994E] mb-1">
            <Users className="w-4 h-4" />
            <span>Staff Attendance Register • Monthly Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Staff Attendance Ledger</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Locked Ledger (Read-Only)</span>
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            View-only monthly attendance ledger. Staff duty is recorded and verified directly through the Daily Sales Register.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">

          {/* Month Switcher */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-2xl p-1 shadow-xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-xl text-gray-600 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-extrabold text-gray-800 min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-xl text-gray-600 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isViewingCurrentMonth && (
            <button
              type="button"
              onClick={handleJumpToCurrentMonth}
              className="px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Current Month
            </button>
          )}

          {/* Add Staff Button */}
          <button
            type="button"
            onClick={() => setIsAddStaffOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Legend Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50 p-3 rounded-2xl border border-gray-100 print:hidden">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
            Legend:
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
            <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              ✓
            </span>
            <span>Full (1.0)</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-700">
            <span className="w-5 h-5 rounded bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-[11px] shadow-xs">
              ½
            </span>
            <span>Half (0.5)</span>
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-rose-700">
            <span className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              ✗
            </span>
            <span>Absent (0)</span>
          </span>
          <span className="inline-flex items-center gap-1 text-gray-500">
            <span className="w-5 h-5 rounded bg-gray-100 text-gray-400 flex items-center justify-center text-[11px]">
              -
            </span>
            <span>Unmarked</span>
          </span>
        </div>

        <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Locked Ledger (Read-Only) • Marked automatically via Daily Sales Sheet</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ATTENDANCE GRID (VIEW-ONLY TABLE)                         */}
      {/* ========================================================= */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
              <th className="py-2.5 px-3 sticky left-0 bg-gray-100 z-10 w-44 font-bold border-r border-gray-200">
                Staff Name
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const isToday = isViewingCurrentMonth && d === currentDayNum;
                const isSalesDay = isViewingSalesMonth && d === salesDayNum;
                return (
                  <th
                    key={d}
                    className={`py-2 px-1 text-center w-7 min-w-[28px] font-bold border-r border-gray-200 text-[11px] ${
                      isToday
                        ? 'bg-emerald-200 text-emerald-950 ring-2 ring-emerald-500 z-10'
                        : isSalesDay
                        ? 'bg-amber-100 text-amber-950 ring-2 ring-amber-400 z-10'
                        : ''
                    }`}
                    title={`Day ${d} of ${monthName}${isSalesDay ? ' (Selected Sales Date)' : isToday ? ' (Today)' : ''}`}
                  >
                    {d}
                  </th>
                );
              })}
              <th className="py-2.5 px-2 text-center font-extrabold text-emerald-900 bg-emerald-50/70 w-18 border-l border-gray-200">
                Present
              </th>
              <th className="py-2.5 px-2 text-center font-extrabold text-gray-900 bg-gray-100 w-16">
                Att. %
              </th>
              <th className="py-2.5 px-2 text-center w-10 bg-gray-100 print:hidden"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 font-medium">
            {staffList.map((staff) => {
              const staffRecords = attendance[staff.id] || {};
              let presentCount = 0;
              let totalMarked = 0;

              for (let d = 1; d <= daysInMonth; d++) {
                const raw = staffRecords[d] ?? staffRecords[String(d)];
                if (
                  raw === 'P' ||
                  raw === 'Full' ||
                  raw === 'full' ||
                  raw === 'Present'
                ) {
                  presentCount += 1;
                  totalMarked += 1;
                } else if (
                  raw === 'H' ||
                  raw === 'Half' ||
                  raw === 'half'
                ) {
                  presentCount += 0.5;
                  totalMarked += 1;
                } else if (
                  raw === 'A' ||
                  raw === 'Absent' ||
                  raw === 'absent' ||
                  raw === 'Off'
                ) {
                  totalMarked += 1;
                }
              }

              const percentage =
                totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

              return (
                <tr key={staff.id} className="hover:bg-amber-50/30 transition">
                  {/* Staff Name & Role */}
                  <td className="py-2.5 px-3 sticky left-0 bg-white hover:bg-amber-50/30 z-10 border-r border-gray-200 shadow-xs">
                    <span className="font-extrabold text-gray-900 block leading-tight">
                      {staff.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block">{staff.role}</span>
                  </td>

                  {/* Day Cells 1 to 31 (Interactive Buttons) */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const status = staffRecords[d] ?? staffRecords[String(d)];
                    const isToday = isViewingCurrentMonth && d === currentDayNum;
                    const isSalesDay = isViewingSalesMonth && d === salesDayNum;

                    let badgeColor = 'bg-gray-100 text-gray-400 border border-transparent';
                    let label = '-';

                    if (
                      status === 'P' ||
                      status === 'Full' ||
                      status === 'full' ||
                      status === 'Present'
                    ) {
                      badgeColor = 'bg-emerald-500 text-white font-black shadow-xs';
                      label = '✓';
                    } else if (
                      status === 'H' ||
                      status === 'Half' ||
                      status === 'half'
                    ) {
                      badgeColor = 'bg-amber-400 text-amber-950 font-black shadow-xs';
                      label = '½';
                    } else if (
                      status === 'A' ||
                      status === 'Absent' ||
                      status === 'absent' ||
                      status === 'Off'
                    ) {
                      badgeColor = 'bg-rose-500 text-white font-black shadow-xs';
                      label = '✗';
                    }

                    return (
                      <td
                        key={d}
                        className={`p-0.5 text-center border-r border-gray-100 select-none ${
                          isToday
                            ? 'bg-emerald-50/80 ring-1 ring-inset ring-emerald-300'
                            : isSalesDay
                            ? 'bg-amber-50/80 ring-1 ring-inset ring-amber-300'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-[11px] font-black cursor-default select-none pointer-events-none ${badgeColor}`}
                          title={`${staff.name} Day ${d}: ${
                            status === 'P' || status === 'Full'
                              ? 'Present ✓'
                              : status === 'H' || status === 'Half'
                              ? 'Half-day ½'
                              : status === 'A' || status === 'Absent'
                              ? 'Absent ✗'
                              : 'Unmarked (-)'
                          }`}
                        >
                          {label}
                        </div>
                      </td>
                    );
                  })}

                  {/* Present Count */}
                  <td className="py-2 px-2 text-center font-black text-emerald-800 bg-emerald-50/70 border-l border-gray-200">
                    <span className="text-sm">{presentCount}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block">days</span>
                  </td>

                  {/* Percentage */}
                  <td className="py-2 px-2 text-center font-black text-gray-800 bg-gray-50/60">
                    <span className="text-sm">{percentage}%</span>
                    <span className="text-[10px] text-gray-400 font-semibold block">
                      {presentCount}/{totalMarked || daysInMonth}
                    </span>
                  </td>

                  {/* Remove Staff */}
                  <td className="py-2 px-1 text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      className="text-gray-300 hover:text-red-500 p-1 rounded transition cursor-pointer"
                      title="Remove staff from register"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Daily Total Staff on Duty Footer */}
          <tfoot>
            <tr className="bg-gray-100 font-extrabold text-gray-800 border-t-2 border-gray-300">
              <td className="py-2.5 px-3 sticky left-0 bg-gray-100 z-10 border-r border-gray-200 font-black">
                Staff on Duty / Day
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                let dayStaffCount = 0;
                staffList.forEach((s) => {
                  const st = attendance[s.id]?.[d] ?? attendance[s.id]?.[String(d)];
                  if (
                    st === 'P' ||
                    st === 'Full' ||
                    st === 'full' ||
                    st === 'Present' ||
                    st === 'H' ||
                    st === 'Half' ||
                    st === 'half'
                  ) {
                    dayStaffCount += 1;
                  }
                });
                return (
                  <td
                    key={d}
                    className={`text-center py-2 text-[10px] border-r border-gray-200 ${
                      dayStaffCount > 0
                        ? 'text-emerald-700 font-black bg-emerald-50/50'
                        : 'text-gray-400'
                    }`}
                    title={`Day ${d}: ${dayStaffCount} staff on duty`}
                  >
                    {dayStaffCount > 0 ? dayStaffCount : '-'}
                  </td>
                );
              })}
              <td colSpan={3} className="text-center text-[10px] font-bold text-gray-600 bg-gray-50">
                Monthly Totals
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ========================================================= */}
      {/* ADD STAFF MODAL                                           */}
      {/* ========================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-gray-900 mb-1">Add New Staff Member</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter staff details to include them in the daily sales &amp; attendance register.
            </p>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Staff Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Salman, Faisal, Rahul..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  placeholder="e.g. Sales Executive, Cashier, Service"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#FB8500]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FB8500] hover:bg-[#e07500] shadow-sm cursor-pointer"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
