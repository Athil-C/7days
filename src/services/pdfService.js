/**
 * 7Days Toys & Babyshop - Professional A4 PDF Generator & WhatsApp Dispatch
 * Pixel-perfect implementation of the official 7Days Daily Sales & Attendance Register design.
 * 100% immune to screen-size clipping, cross-origin image loss, or canvas rendering issues.
 */

import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { SHOP_WHATSAPP_NUMBER, SHOP_PHONE_DISPLAY } from '../data/config.js';

// Cached Data URL for the official store circular badge logo
let cachedLogoDataUrl = null;

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  if (typeof window === 'undefined') return '/7days-logo.png';
  try {
    const res = await fetch('/7days-logo.png');
    if (!res.ok) throw new Error('Logo fetch failed');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoDataUrl = reader.result;
        resolve(cachedLogoDataUrl);
      };
      reader.onerror = () => resolve('/7days-logo.png');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '/7days-logo.png';
  }
}

// Inline SVGs for crisp, bulletproof rendering inside html-to-image canvas
const ICONS = {
  mapPin: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `,
  phone: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  `,
  calendarOrange: `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  `,
  calendarCard: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  `,
  lockGreen: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `,
  unlockAmber: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  `,
  usersGreen: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `,
  barChartWhite: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" x2="18" y1="20" y2="10"/>
      <line x1="12" x2="12" y1="20" y2="4"/>
      <line x1="6" x2="6" y1="20" y2="14"/>
    </svg>
  `,
  cashWhite: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2"/>
      <circle cx="12" cy="12" r="2.5"/>
      <path d="M6 12h.01M18 12h.01"/>
    </svg>
  `,
  cardWhite: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  `,
  calendarGreen: `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  `,
  notesOrange: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
    </svg>
  `
};

/**
 * Context-aware HTML entity escaping utility to prevent XSS injection.
 * Replaces &, <, >, ", and ' with safe HTML entities.
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and sanitizes image URLs/Data URIs to ensure safe attribute insertion.
 * Blocks dangerous schemes (javascript:, vbscript:, data:text/html), protocol-relative URLs (//),
 * SVG data URIs (which can contain embedded script tags), control characters, and malformed inputs.
 * Strictly permits only:
 * - Raster base64 images (data:image/(png|jpe?g|webp|gif);base64,...)
 * - Safe root-relative paths starting with / (excluding //)
 * - Valid HTTPS URLs
 */
export function sanitizeImageUrl(url, fallback = '/7days-logo.png') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();

  // Block any control characters or internal whitespace
  if (/[\x00-\x1f\x7f\s]/.test(trimmed)) {
    return fallback;
  }

  // Block protocol-relative URLs (//example.com) and backslash paths (\\)
  if (trimmed.startsWith('//') || trimmed.startsWith('\\\\')) {
    return fallback;
  }

  // 1. Permit strictly raster base64 data URIs (png, jpeg, webp, gif). Explicitly blocks SVG data URIs.
  if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  // 2. Permit safe root-relative or local relative paths (e.g. /7days-logo.png, ./logo.png)
  if (
    (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
    (trimmed.startsWith('./') && !trimmed.startsWith('.//'))
  ) {
    // Ensure no quotes or angle brackets in the relative path
    if (/[<>"'`]/.test(trimmed)) return fallback;
    return trimmed;
  }

  // 3. Permit safe absolute HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      // Disallow quotes or tag brackets in URL
      if (/[<>"'`]/.test(parsed.href)) return fallback;
      return parsed.href;
    }
  } catch {
    // Malformed URL
    return fallback;
  }

  return fallback;
}

/**
 * Creates the exact 794px A4 document container matching the user reference design:
 * - Warm background #FAF8F5 with peach/mint cards
 * - 3D 7Days Circular Badge + Header
 * - DAILY CLOSING REGISTER strip with date and verification badges
 * - Sales Date and Staff On Duty cards
 * - Sales Details table with peach header
 * - 3 Collection Summary cards (Total Day Sales, Cash, UPI)
 * - Monthly Staff Attendance Register with 31-day duty audit matrix and legend
 * - Notes card
 * - Signature lines and official footer
 */
export function createA4SalesDocumentElement({
  dateStr,
  readableDate,
  sheet,
  staffNames,
  cashTotal,
  upiTotal,
  cardTotal,
  weeklyAttendance,
  monthAttendance,
  logoDataUrl
}) {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.boxSizing = 'border-box';
  container.style.padding = '36px 36px 28px 36px';
  container.style.backgroundColor = '#FAF8F5';
  container.style.color = '#0f172a';
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  // Date parsing
  const dateObj = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = isNaN(dateObj)
    ? 'Daily'
    : dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
  const dayMonthYear = isNaN(dateObj)
    ? readableDate || dateStr
    : dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  // Staff on duty list & count
  const rawStaff = (staffNames || sheet.salesperson || '').trim();
  const staffList = rawStaff
    ? rawStaff
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const displayStaff = staffList.length > 0 ? staffList.join(', ') : 'Staff on Duty';

  // Staff on duty headcount (from duty map or salesperson list)
  let staffDutyCount = staffList.length;
  if (monthAttendance && monthAttendance.dailyHeadcount && monthAttendance.dailyHeadcount[dateStr]) {
    staffDutyCount = monthAttendance.dailyHeadcount[dateStr];
  }
  if (!staffDutyCount || staffDutyCount === 0) {
    staffDutyCount = staffList.length > 0 ? staffList.length : 1;
  }

  // Transaction counts
  const items = Array.isArray(sheet.items) ? sheet.items : [];
  const cashTransactionsCount = items.filter((it) => it.paymentMethod === 'Cash').length;
  const upiTransactionsCount = items.filter(
    (it) => it.paymentMethod === 'UPI' || it.paymentMethod === 'Card'
  ).length;

  // Build items rows with strict HTML escaping
  const itemsHtml =
    items.length > 0
      ? items
          .map((it, idx) => {
            const isUPI = it.paymentMethod === 'UPI';
            const isCard = it.paymentMethod === 'Card';
            const badgeBg = isUPI ? '#f3e8ff' : isCard ? '#dbeafe' : '#dcfce7';
            const badgeColor = isUPI ? '#7e22ce' : isCard ? '#1e40af' : '#166534';

            return `
              <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 8px; text-align: center; font-weight: 800; color: #1e293b; font-size: 11px; border-right: 1px solid #f1f5f9;">
                  ${idx + 1}
                </td>
                <td style="padding: 10px 14px; text-align: left; font-weight: 700; color: #1e293b; font-size: 11px; border-right: 1px solid #f1f5f9; line-height: 1.35; word-break: break-word;">
                  ${escapeHtml(it.itemName || 'Item')}
                </td>
                <td style="padding: 10px 8px; text-align: center; border-right: 1px solid #f1f5f9;">
                  <span style="display: inline-block; background: ${badgeBg}; color: ${badgeColor}; font-size: 9px; font-weight: 900; padding: 3px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${escapeHtml(it.paymentMethod || 'Cash')}
                  </span>
                </td>
                <td style="padding: 10px 8px; text-align: center; font-size: 10.5px; color: #334155; font-weight: 600; border-right: 1px solid #f1f5f9;">
                  ${escapeHtml(it.time || '-')}
                </td>
                <td style="padding: 10px 14px; text-align: right; font-weight: 900; font-size: 13px; color: #0f172a;">
                  ₹${Number(it.amount || 0).toLocaleString('en-IN')}
                </td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="5" style="padding: 28px; text-align: center; color: #94a3b8; font-style: italic; background: #ffffff;">
            No sales recorded for this date.
          </td>
        </tr>
      `;

  // Build Monthly Staff Attendance Section
  const hasMonth =
    monthAttendance &&
    Array.isArray(monthAttendance.records) &&
    monthAttendance.records.length > 0;
  const hasWeekly =
    weeklyAttendance &&
    Array.isArray(weeklyAttendance.records) &&
    weeklyAttendance.records.length > 0;

  let attendanceSectionHtml = '';

  if (hasMonth) {
    const days = monthAttendance.days || [];
    const daysInMonth = monthAttendance.daysInMonth || days.length || 31;
    const monthHeaderName = monthAttendance.monthName
      ? monthAttendance.monthName.toUpperCase()
      : 'CURRENT MONTH';

    attendanceSectionHtml = `
      <div style="margin-top: 18px; margin-bottom: 4px;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; color: #1e293b; text-transform: uppercase;">
              <span style="border-bottom: 2.5px solid #ea580c; padding-bottom: 2px;">MONTHLY</span> STAFF ATTENDANCE REGISTER
            </div>
            <div style="font-size: 8.5px; font-weight: 800; color: #0369a1; letter-spacing: 0.8px;">
              ALL DAYS AUDIT (${escapeHtml(monthHeaderName)})
            </div>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #86efac; border-radius: 6px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 8.5px; font-weight: 800; color: #15803d; letter-spacing: 0.5px;">
            ${ICONS.calendarGreen}
            <span>ALL DAYS ATTENDANCE (${Number(daysInMonth || 0)} DAYS)</span>
          </div>
        </div>

        <!-- Attendance Matrix Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff; margin-bottom: 8px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; table-layout: fixed;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 7.5px; font-weight: 800; color: #475569;">
                <th style="padding: 6px 6px; text-align: left; width: 85px; color: #1e293b; border-right: 1px solid #e2e8f0;">STAFF NAME</th>
                ${days
                  .map(
                    (d) => `
                    <th style="padding: 4px 0.5px; text-align: center; border-right: 1px solid #f1f5f9; ${
                      d.isSelectedDate
                        ? 'background: #ffedd5; color: #c2410c; font-weight: 900;'
                        : ''
                    }">
                      <div style="font-size: 8px; font-weight: 800;">${escapeHtml(d.dayNum)}</div>
                    </th>
                  `
                  )
                  .join('')}
                <th style="padding: 6px 2px; text-align: center; width: 34px; color: #15803d; font-size: 7.5px; border-left: 1px solid #e2e8f0;">PRESENT</th>
                <th style="padding: 6px 2px; text-align: center; width: 30px; font-size: 7.5px; color: #1e293b;">ATT. %</th>
              </tr>
            </thead>
            <tbody>
              ${monthAttendance.records
                .map((r) => {
                  return `
                    <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 5px 6px; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-right: 1px solid #e2e8f0;">
                        <div style="font-size: 9px; font-weight: 800;">${escapeHtml(r.name || 'Staff')}</div>
                        <div style="font-size: 7px; color: #64748b; font-weight: 600;">${escapeHtml(r.role || 'Sales Staff')}</div>
                      </td>
                      ${days
                        .map((d) => {
                          const val = r.statuses[d.dateStr];
                          const isP = val === 'P';
                          const isH = val === 'H';
                          const isA = val === 'A';

                          let badgeHtml = '';
                          if (isP) {
                            badgeHtml = `<span style="display: inline-block; width: 13px; height: 13px; line-height: 13px; text-align: center; border-radius: 2px; background: #10b981; color: #ffffff; font-weight: 900; font-size: 7.5px;">✓</span>`;
                          } else if (isA) {
                            badgeHtml = `<span style="display: inline-block; width: 13px; height: 13px; line-height: 13px; text-align: center; border-radius: 2px; background: #ef4444; color: #ffffff; font-weight: 900; font-size: 7.5px;">✕</span>`;
                          } else if (isH) {
                            badgeHtml = `<span style="display: inline-block; width: 13px; height: 13px; line-height: 13px; text-align: center; border-radius: 2px; background: #f59e0b; color: #ffffff; font-weight: 900; font-size: 7.5px;">½</span>`;
                          } else {
                            badgeHtml = `<span style="display: inline-block; width: 13px; height: 13px; border-radius: 2px; background: #f1f5f9; border: 1px solid #e2e8f0;"></span>`;
                          }

                          return `
                            <td style="padding: 3px 0.5px; text-align: center; border-right: 1px solid #f8fafc; ${
                              d.isSelectedDate ? 'background: #fffaf5;' : ''
                            }">
                              ${badgeHtml}
                            </td>
                          `;
                        })
                        .join('')}
                      <td style="padding: 5px 2px; text-align: center; font-weight: 900; color: #15803d; font-size: 9px; border-left: 1px solid #e2e8f0;">
                        ${escapeHtml(r.presentCount)}
                      </td>
                      <td style="padding: 5px 2px; text-align: center; font-weight: 900; color: #0f172a; font-size: 9px;">
                        ${escapeHtml(r.percentage)}%
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
            ${
              monthAttendance.dailyHeadcount
                ? `
              <tfoot>
                <tr style="background: #ffffff; border-top: 1px solid #e2e8f0; font-weight: 800;">
                  <td style="padding: 5px 6px; font-size: 7.5px; color: #1e293b; text-transform: uppercase; border-right: 1px solid #e2e8f0;">
                    STAFF ON DUTY
                  </td>
                  ${days
                    .map((d) => {
                      const count = monthAttendance.dailyHeadcount[d.dateStr] || 0;
                      let cellContent = '';
                      if (d.isSelectedDate) {
                        cellContent = `<span style="display: inline-block; width: 13px; height: 13px; line-height: 13px; text-align: center; border-radius: 2px; background: #fed7aa; color: #ea580c; font-weight: 900; font-size: 7.5px;">${escapeHtml(count)}</span>`;
                      } else if (count > 0) {
                        cellContent = `<span style="display: inline-block; width: 13px; height: 13px; line-height: 13px; text-align: center; border-radius: 2px; background: #f1f5f9; color: #475569; font-weight: 800; font-size: 7.5px;">${escapeHtml(count)}</span>`;
                      } else {
                        cellContent = `<span style="display: inline-block; width: 13px; height: 13px; border-radius: 2px; background: #f8fafc; border: 1px solid #f1f5f9;"></span>`;
                      }

                      return `
                        <td style="padding: 3px 0.5px; text-align: center; border-right: 1px solid #f8fafc; ${
                          d.isSelectedDate ? 'background: #fffaf5;' : ''
                        }">
                          ${cellContent}
                        </td>
                      `;
                    })
                    .join('')}
                  <td colspan="2" style="padding: 5px 2px; text-align: center; font-size: 7.5px; color: #64748b; font-weight: 700; border-left: 1px solid #e2e8f0;">
                    All Days
                  </td>
                </tr>
              </tfoot>
            `
                : ''
            }
          </table>
        </div>

        <!-- Attendance Legend matching design -->
        <div style="font-size: 8px; color: #64748b; display: flex; align-items: center; gap: 14px; padding-left: 2px;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; line-height: 12px; text-align: center; border-radius: 2px; background: #10b981; color: #ffffff; font-weight: 900; font-size: 7px;">✓</span>
            <span>Present</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; line-height: 12px; text-align: center; border-radius: 2px; background: #ef4444; color: #ffffff; font-weight: 900; font-size: 7px;">✕</span>
            <span>Absent</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; line-height: 12px; text-align: center; border-radius: 2px; background: #fed7aa; color: #ea580c; font-weight: 900; font-size: 7px;">3</span>
            <span>No. of Staff on Duty</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background: #f1f5f9; border: 1px solid #e2e8f0;"></span>
            <span>Non-Working Day</span>
          </div>
        </div>
      </div>
    `;
  } else if (hasWeekly) {
    attendanceSectionHtml = `
      <div style="margin-top: 18px; margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; color: #1e293b; text-transform: uppercase;">
            <span style="border-bottom: 2.5px solid #ea580c; padding-bottom: 2px;">WEEKLY</span> STAFF ATTENDANCE SUMMARY
          </div>
          <div style="background: #ffffff; border: 1.5px solid #86efac; border-radius: 6px; padding: 4px 10px; display: flex; align-items: center; gap: 6px; font-size: 8.5px; font-weight: 800; color: #15803d;">
            ${ICONS.calendarGreen}
            <span>7-DAY AUDIT</span>
          </div>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 8px; font-weight: 800; color: #475569;">
                <th style="padding: 6px 8px; text-align: left; width: 140px;">Staff Name</th>
                ${weeklyAttendance.days
                  .map(
                    (d) => `
                    <th style="padding: 4px 2px; text-align: center;">
                      <div style="font-size: 7.5px;">${escapeHtml(d.dayName)}</div>
                      <div style="font-size: 9px; font-weight: 800;">${escapeHtml(d.dayNum)}</div>
                    </th>
                  `
                  )
                  .join('')}
                <th style="padding: 6px 4px; text-align: center; width: 50px;">Present</th>
                <th style="padding: 6px 4px; text-align: center; width: 45px;">Att. %</th>
              </tr>
            </thead>
            <tbody>
              ${weeklyAttendance.records
                .map((r) => {
                  return `
                    <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 6px 8px; font-weight: 800; color: #1e293b;">
                        <div>${escapeHtml(r.name || 'Staff')}</div>
                        <div style="font-size: 8px; color: #64748b;">${escapeHtml(r.role || 'Sales Staff')}</div>
                      </td>
                      ${weeklyAttendance.days
                        .map((d) => {
                          const val = r.statuses[d.dateStr];
                          const isP = val === 'P';
                          const isA = val === 'A';
                          const bg = isP ? '#10b981' : isA ? '#ef4444' : '#f1f5f9';
                          const text = isP ? '✓' : isA ? '✕' : '-';
                          const textCol = isP || isA ? '#ffffff' : '#94a3b8';
                          return `
                            <td style="padding: 4px 2px; text-align: center;">
                              <span style="display: inline-block; width: 16px; height: 16px; line-height: 16px; text-align: center; border-radius: 3px; background: ${bg}; color: ${textCol}; font-weight: 900; font-size: 8px;">
                                ${text}
                              </span>
                            </td>
                          `;
                        })
                        .join('')}
                      <td style="padding: 6px 4px; text-align: center; font-weight: 900; color: #15803d; font-size: 9.5px;">
                        ${escapeHtml(r.presentCount)}
                      </td>
                      <td style="padding: 6px 4px; text-align: center; font-weight: 900; color: #0f172a; font-size: 9.5px;">
                        ${escapeHtml(r.percentage)}%
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Verification status pill
  const statusPillHtml = sheet.isLocked
    ? `
      <div style="background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
        <div style="width: 26px; height: 26px; border-radius: 6px; background: #bbf7d0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${ICONS.lockGreen}
        </div>
        <div>
          <div style="font-size: 8.5px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 0.4px;">
            VERIFIED &amp; LOCKED
          </div>
          <div style="font-size: 7.5px; font-weight: 600; color: #15803d;">
            No further changes allowed
          </div>
        </div>
      </div>
    `
    : `
      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
        <div style="width: 26px; height: 26px; border-radius: 6px; background: #fde68a; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${ICONS.unlockAmber}
        </div>
        <div>
          <div style="font-size: 8.5px; font-weight: 900; color: #92400e; text-transform: uppercase; letter-spacing: 0.4px;">
            DRAFT / UNLOCKED
          </div>
          <div style="font-size: 7.5px; font-weight: 600; color: #b45309;">
            Open for sales additions
          </div>
        </div>
      </div>
    `;

  container.innerHTML = `
    <div>
      <!-- 1. OFFICIAL BRAND HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #fed7aa;">
        <!-- Left: Logo & Store Titles -->
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 58px; height: 58px; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25); background: radial-gradient(circle at 30% 30%, #ef4444, #991b1b);">
            <img 
              src="${sanitizeImageUrl(logoDataUrl || '/7days-logo.png')}" 
              alt="7Days Logo" 
              style="width: 100%; height: 100%; object-fit: contain; display: block;" 
              crossOrigin="anonymous" 
            />
          </div>

          <div>
            <div style="font-size: 27px; font-weight: 900; color: #0f172a; line-height: 1; letter-spacing: -0.5px;">
              7Days
            </div>
            <div style="font-size: 13px; font-weight: 900; color: #ea580c; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px;">
              TOYS &amp; BABYSHOP
            </div>
            <div style="font-size: 9.5px; font-weight: 600; color: #94a3b8; margin-top: 2px;">
              Little Things. Big Smiles.
            </div>
          </div>
        </div>

        <!-- Vertical Accent Divider -->
        <div style="width: 1px; height: 44px; background: #fed7aa; margin: 0 16px;"></div>

        <!-- Right: Location & Phone Contact -->
        <div style="display: flex; flex-direction: column; gap: 6px; text-align: left;">
          <div style="display: flex; align-items: center; gap: 7px; font-size: 10.5px; font-weight: 600; color: #475569;">
            ${ICONS.mapPin}
            <span>Payod, Mananthavady, Wayanad, Kerala</span>
          </div>
          <div style="display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: #1e293b;">
            ${ICONS.phone}
            <span>${escapeHtml(SHOP_PHONE_DISPLAY || '+91 95629 22471')}</span>
          </div>
        </div>
      </div>

      <!-- 2. DAILY CLOSING REGISTER STRIP -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; margin-bottom: 12px;">
        <div style="font-size: 11.5px; font-weight: 900; letter-spacing: 2px; color: #1e293b; text-transform: uppercase;">
          <span style="border-bottom: 2.5px solid #ea580c; padding-bottom: 3px;">DAILY</span> CLOSING REGISTER
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Date Pill -->
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
            <div style="width: 26px; height: 26px; border-radius: 6px; background: #ffedd5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${ICONS.calendarOrange}
            </div>
            <div>
              <div style="font-size: 8.5px; font-weight: 800; color: #ea580c; text-transform: uppercase;">
                ${escapeHtml(dayOfWeek)}
              </div>
              <div style="font-size: 11px; font-weight: 900; color: #0f172a;">
                ${escapeHtml(dayMonthYear)}
              </div>
            </div>
          </div>

          <!-- Verified / Locked Status Pill -->
          ${statusPillHtml}
        </div>
      </div>

      <!-- 3. METADATA CARDS (2 COLUMNS) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
        <!-- Card 1: Sales Date -->
        <div style="background: #fffaf5; border: 1px solid #fed7aa; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #ffedd5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${ICONS.calendarCard}
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.8px;">
              SALES DATE
            </div>
            <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 1px;">
              ${escapeHtml(dateStr)} (${escapeHtml(dayOfWeek)})
            </div>
          </div>
        </div>

        <!-- Card 2: Staff on Duty -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #dcfce7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${ICONS.usersGreen}
          </div>
          <div style="overflow: hidden;">
            <div style="font-size: 9px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.8px;">
              STAFF ON DUTY (${escapeHtml(staffDutyCount)})
            </div>
            <div style="font-size: 16px; font-weight: 900; color: #065f46; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(displayStaff)}
            </div>
          </div>
        </div>
      </div>

      <!-- 4. SALES DETAILS TABLE -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
        <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; color: #1e293b; text-transform: uppercase;">
          <span style="border-bottom: 2.5px solid #ea580c; padding-bottom: 2px;">SALES</span> DETAILS (${Number(sheet.count || items.length || 0)} ITEMS)
        </div>
        <div style="font-size: 9px; font-weight: 600; color: #64748b;">
          All amounts are in Indian Rupees (₹)
        </div>
      </div>

      <div style="border: 1px solid #fed7aa; border-radius: 8px; overflow: hidden; margin-bottom: 14px; background: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #fff1e6; border-bottom: 1px solid #fed7aa; font-size: 9.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 10px 8px; width: 36px; text-align: center; border-right: 1px solid #fed7aa;">#</th>
              <th style="padding: 10px 14px; text-align: left; border-right: 1px solid #fed7aa;">ITEM / PRODUCT NAME</th>
              <th style="padding: 10px 8px; width: 110px; text-align: center; border-right: 1px solid #fed7aa;">PAYMENT MODE</th>
              <th style="padding: 10px 8px; width: 85px; text-align: center; border-right: 1px solid #fed7aa;">TIME</th>
              <th style="padding: 10px 14px; width: 115px; text-align: right;">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- 5. TOTAL COLLECTION & PAYMENT BREAKDOWN (3 CARDS) -->
      <div style="display: grid; grid-template-columns: 2fr 1.15fr 1.15fr; gap: 12px; margin-bottom: 14px;">
        <!-- Card 1: Total Collection -->
        <div style="background: #fffaf5; border: 1px solid #fed7aa; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #ea580c; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 8px rgba(234, 88, 12, 0.25);">
            ${ICONS.barChartWhite}
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 900; color: #ea580c; text-transform: uppercase; letter-spacing: 0.8px;">
              TOTAL DAY SALES COLLECTION (${Number(sheet.count || items.length || 0)} ITEMS)
            </div>
            <div style="font-size: 30px; font-weight: 900; color: #ea580c; letter-spacing: -0.5px; margin-top: 1px; line-height: 1.1;">
              ₹${Number(sheet.total || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <!-- Card 2: CASH Card -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${ICONS.cashWhite}
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
              CASH
            </div>
            <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 1px;">
              ₹${Number(cashTotal || 0).toLocaleString('en-IN')}
            </div>
            <div style="font-size: 8.5px; font-weight: 600; color: #64748b; margin-top: 1px;">
              ${cashTransactionsCount} ${cashTransactionsCount === 1 ? 'transaction' : 'transactions'}
            </div>
          </div>
        </div>

        <!-- Card 3: UPI / ONLINE Card -->
        <div style="background: #fffaf5; border: 1px solid #fed7aa; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: #ea580c; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${ICONS.cardWhite}
          </div>
          <div>
            <div style="font-size: 9px; font-weight: 900; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px;">
              UPI / ONLINE
            </div>
            <div style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 1px;">
              ₹${Number((upiTotal || 0) + (cardTotal || 0)).toLocaleString('en-IN')}
            </div>
            <div style="font-size: 8.5px; font-weight: 600; color: #64748b; margin-top: 1px;">
              ${upiTransactionsCount} ${upiTransactionsCount === 1 ? 'transaction' : 'transactions'}
            </div>
          </div>
        </div>
      </div>

      <!-- 6. MONTHLY ATTENDANCE REGISTER -->
      ${attendanceSectionHtml}

      <!-- 7. NOTES SECTION -->
      <div style="background: #fffaf5; border: 1px solid #fed7aa; border-radius: 10px; padding: 10px 14px; margin-top: 12px; display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #ffedd5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${ICONS.notesOrange}
        </div>
        <div>
          <div style="font-size: 9px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
            NOTES
          </div>
          <div style="font-size: 11px; font-weight: 600; color: #334155; margin-top: 2px; white-space: pre-wrap; word-break: break-word;">
            ${escapeHtml(sheet.notes || '-')}
          </div>
        </div>
      </div>
    </div>

    <!-- 8. SIGNATURES & OFFICIAL FOOTER -->
    <div style="margin-top: 26px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 8px;">
        <div style="text-align: left;">
          <div style="width: 210px; border-bottom: 1.5px dotted #94a3b8; margin-bottom: 6px;"></div>
          <div style="font-size: 8.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
            CLOSING STAFF SIGNATURE
          </div>
        </div>

        <div style="text-align: right;">
          <div style="width: 210px; border-bottom: 1.5px dotted #94a3b8; margin-bottom: 6px; margin-left: auto;"></div>
          <div style="font-size: 8.5px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
            STORE MANAGER / OWNER SIGNATURE
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
        <div>
          <div style="font-size: 9.5px; font-weight: 800; color: #0f172a;">
            7Days Toys &amp; Babyshop
          </div>
          <div style="font-size: 8px; font-weight: 600; color: #64748b; margin-top: 2px;">
            Payod, Mananthavady, Wayanad, Kerala &bull; Official Daily Closing Register
          </div>
        </div>

        <div style="border-left: 1px solid #cbd5e1; padding-left: 14px; font-size: 9px; font-weight: 700; color: #64748b;">
          Little Things. Big Smiles.
        </div>
      </div>
    </div>
  `;

  return container;
}

/**
 * Generates an A4 PDF Document from structured sales data.
 * Guarantees zero horizontal clipping, full-width A4 layout, and exact color preservation.
 */
export async function generateDailySalesPdfDocument(data, fileName) {
  // Pre-load official logo as data URL for instant, bulletproof canvas inclusion
  const logoDataUrl = await getLogoDataUrl();

  // Off-screen wrapper prevents any visual flashing on user screen
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = '794px';
  wrapper.style.height = '0';
  wrapper.style.overflow = 'hidden';
  wrapper.style.opacity = '0';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.zIndex = '-9999';

  const container = createA4SalesDocumentElement({
    ...data,
    logoDataUrl
  });

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  try {
    const canvas = await toCanvas(container, {
      backgroundColor: '#FAF8F5',
      pixelRatio: 2,
      skipFonts: true,
      fontEmbedCSS: false,
      width: 794
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering generated an empty document');
    }

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 8; // 8mm margin
    const printWidth = pdfWidth - margin * 2;
    const printHeight = (canvas.height * printWidth) / canvas.width;

    if (printHeight <= pdfHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight);
    } else {
      let heightLeft = printHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = heightLeft - printHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }
    }

    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { doc: pdf, blob, file };
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

/**
 * Downloads the styled PDF file directly to the user's device
 */
export async function downloadSalesSheetPdf(data, dateStr) {
  const fileName = `7Days_Sales_Sheet_${dateStr}.pdf`;
  const { doc } = await generateDailySalesPdfDocument(data, fileName);
  doc.save(fileName);
  return fileName;
}

/**
 * Shares the PDF file to WhatsApp.
 * - On Mobile/WebShare supported devices: Triggers native share sheet with the actual PDF file attached!
 * - On fallback devices: Automatically downloads the styled PDF and opens WhatsApp chat with direct number.
 */
export async function sendPdfToWhatsApp(data, dateStr, targetPhone = SHOP_WHATSAPP_NUMBER) {
  const fileName = `7Days_Sales_Sheet_${dateStr}.pdf`;
  const { doc, file } = await generateDailySalesPdfDocument(data, fileName);

  const shareData = {
    title: `7Days Daily Sales Sheet - ${dateStr}`,
    text: `🧾 7Days Toys & Babyshop — Daily Sales Sheet (${dateStr})`,
    files: [file]
  };

  // Check if browser supports sharing PDF file directly
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'native_share' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, aborted: true };
      }
      console.warn('Native file share failed, falling back to download + WhatsApp link', err);
    }
  }

  // Fallback: Download the PDF file to device and open WhatsApp chat
  doc.save(fileName);
  const cleanNum = (targetPhone || SHOP_WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const greeting = encodeURIComponent(
    `🧾 *7Days Toys & Babyshop — Daily Sales Sheet (${dateStr})*\n\nAttached is today's closing sales sheet PDF.`
  );
  const waUrl = cleanNum
    ? `https://api.whatsapp.com/send?phone=${cleanNum}&text=${greeting}`
    : `https://api.whatsapp.com/send?text=${greeting}`;

  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'download_and_whatsapp' };
}
