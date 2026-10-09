/**
 * 7Days Toys & Babyshop - Professional A4 PDF Generator & WhatsApp Dispatch
 * Generates an authentic, pixel-perfect A4 Daily Sales Register document
 * with exact brand styling, crisp typography, payment breakdown,
 * and signature verification. 100% immune to screen size clipping or oklch errors.
 */

import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { SHOP_WHATSAPP_NUMBER } from '../data/config';

/**
 * Creates an exact 794px (A4 width at 96 DPI) document container
 * with full official store header, itemized sales table, summary banner,
 * optional 7-day Friday-to-Friday weekly attendance table, and signatures.
 */
function createA4SalesDocumentElement({
  dateStr,
  readableDate,
  sheet,
  staffNames,
  cashTotal,
  upiTotal,
  cardTotal,
  weeklyAttendance,
  monthAttendance
}) {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.boxSizing = 'border-box';
  container.style.padding = '44px 44px 36px 44px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  const staffList = (staffNames || sheet.salesperson || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const displayStaff = staffList.length > 0 ? staffList.join(', ') : 'Staff on Duty';

  // Build items rows
  const itemsHtml =
    sheet.items && sheet.items.length > 0
      ? sheet.items
          .map((it, idx) => {
            const isUPI = it.paymentMethod === 'UPI';
            const isCard = it.paymentMethod === 'Card';
            const badgeBg = isUPI ? '#f3e8ff' : isCard ? '#dbeafe' : '#d1fae5';
            const badgeColor = isUPI ? '#6b21a8' : isCard ? '#1e40af' : '#065f46';
            const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

            return `
              <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 8px; text-align: center; color: #64748b; font-weight: 700;">${idx + 1}</td>
                <td style="padding: 10px 12px; font-weight: 700; color: #0f172a; word-break: break-word;">${it.itemName}</td>
                <td style="padding: 10px 8px; text-align: center;">
                  <span style="display: inline-block; background: ${badgeBg}; color: ${badgeColor}; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                    ${it.paymentMethod || 'Cash'}
                  </span>
                </td>
                <td style="padding: 10px 8px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600;">
                  ${it.time || '-'}
                </td>
                <td style="padding: 10px 14px; text-align: right; font-weight: 900; font-size: 13px; color: #0f172a;">
                  ₹${Number(it.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            `;
          })
          .join('')
      : `
        <tr>
          <td colspan="5" style="padding: 32px; text-align: center; color: #94a3b8; font-style: italic;">
            No sales recorded for this date.
          </td>
        </tr>
      `;

  // Build Monthly Staff Attendance Section (All Days Attendance) or fallback Weekly
  const hasMonth = monthAttendance && Array.isArray(monthAttendance.records) && monthAttendance.records.length > 0;
  const hasWeekly = weeklyAttendance && Array.isArray(weeklyAttendance.records) && weeklyAttendance.records.length > 0;

  let attendanceSectionHtml = '';

  if (hasMonth) {
    const days = monthAttendance.days || [];
    attendanceSectionHtml = `
      <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #0f172a;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 9.5px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.8px;">
              MONTHLY STAFF ATTENDANCE REGISTER &bull; ALL DAYS AUDIT (${monthAttendance.monthName})
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-top: 2px;">
              Complete Days 1 to ${monthAttendance.daysInMonth} Duty Ledger &bull; Verified Against Daily Sales Sheet
            </div>
          </div>
          <div style="background: #ecfdf5; border: 1.5px solid #059669; border-radius: 6px; padding: 3px 8px; font-size: 9px; font-weight: 800; color: #065f46; letter-spacing: 0.5px;">
            ALL-DAYS ATTENDANCE (${monthAttendance.daysInMonth} DAYS)
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 6px; table-layout: fixed;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; text-transform: uppercase; font-size: 8px; font-weight: 800; color: #475569;">
              <th style="padding: 5px 4px; text-align: left; width: 115px;">Staff Name</th>
              ${days
                .map(
                  (d) => `
                  <th style="padding: 3px 0.5px; text-align: center; ${
                    d.isSelectedDate
                      ? 'background: #fef3c7; color: #92400e; font-weight: 900;'
                      : d.isFriday
                      ? 'background: #e2e8f0; color: #0f172a; font-weight: 900;'
                      : ''
                  }">
                    <div style="font-size: 6.5px; opacity: 0.7;">${d.dayName}</div>
                    <div style="font-size: 9px; font-weight: 800;">${d.dayNum}</div>
                  </th>
                `
                )
                .join('')}
              <th style="padding: 5px 2px; text-align: center; width: 44px; color: #065f46; font-size: 8.5px;">Present</th>
              <th style="padding: 5px 2px; text-align: center; width: 38px; font-size: 8.5px;">Att. %</th>
            </tr>
          </thead>
          <tbody>
            ${monthAttendance.records
              .map((r, idx) => {
                const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                return `
                  <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 5px 4px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      <div style="font-size: 10px; font-weight: 800;">${r.name}</div>
                      <div style="font-size: 7.5px; color: #64748b; font-weight: 600;">${r.role}</div>
                    </td>
                    ${days
                      .map((d) => {
                        const val = r.statuses[d.dateStr];
                        const isP = val === 'P';
                        const isH = val === 'H';
                        const isA = val === 'A';
                        const bg = isP ? '#10b981' : isH ? '#f59e0b' : isA ? '#ef4444' : '#f1f5f9';
                        const text = isP ? '✓' : isH ? '½' : isA ? '✗' : '-';
                        const textColor = isP || isA ? '#ffffff' : isH ? '#78350f' : '#cbd5e1';
                        return `
                          <td style="padding: 2.5px 0.5px; text-align: center; ${
                            d.isSelectedDate ? 'background: #fffbeb;' : ''
                          }">
                            <span style="display: inline-block; width: 14px; height: 14px; line-height: 14px; border-radius: 2px; background: ${bg}; color: ${textColor}; font-weight: 900; font-size: 7.5px;">
                              ${text}
                            </span>
                          </td>
                        `;
                      })
                      .join('')}
                    <td style="padding: 5px 2px; text-align: center; font-weight: 900; color: #065f46; font-size: 9.5px;">
                      ${r.presentCount}
                    </td>
                    <td style="padding: 5px 2px; text-align: center; font-weight: 900; color: #0f172a; font-size: 9.5px;">
                      ${r.percentage}%
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
              <tr style="background: #f8fafc; border-top: 1.5px solid #cbd5e1; font-weight: 800;">
                <td style="padding: 4px 4px; font-size: 8px; color: #475569; text-transform: uppercase;">Staff on Duty</td>
                ${days
                  .map((d) => {
                    const count = monthAttendance.dailyHeadcount[d.dateStr] || 0;
                    return `
                      <td style="padding: 3px 0.5px; text-align: center; font-size: 8px; font-weight: 800; ${
                        count > 0 ? 'color: #047857;' : 'color: #94a3b8;'
                      } ${d.isSelectedDate ? 'background: #fffbeb;' : ''}">
                        ${count > 0 ? count : '-'}
                      </td>
                    `;
                  })
                  .join('')}
                <td colspan="2" style="padding: 3px; text-align: center; font-size: 7.5px; color: #64748b; font-weight: 700;">All Days</td>
              </tr>
            </tfoot>
          `
              : ''
          }
        </table>
        <div style="font-size: 8px; color: #64748b; font-style: italic; display: flex; justify-content: space-between;">
          <span>Legend: <strong style="color: #047857;">✓</strong> Full Day (1.0) &bull; <strong style="color: #b45309;">½</strong> Half Day (0.5) &bull; <strong style="color: #b91c1c;">✗</strong> Off / Absent</span>
          <span>Highlighted day indicates current daily sales closing date</span>
        </div>
      </div>
    `;
  } else if (hasWeekly) {
    attendanceSectionHtml = `
      <div style="margin-top: 24px; padding-top: 18px; border-top: 2px solid #0f172a;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 1px;">
              WEEKLY STAFF ATTENDANCE SUMMARY (${weeklyAttendance.startDateStr} &mdash; ${weeklyAttendance.endDateStr})
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">
              Friday to Friday Cycle Audit &bull; Verified from Daily Duty Sheets
            </div>
          </div>
          <div style="background: #ecfdf5; border: 1.5px solid #059669; border-radius: 6px; padding: 4px 10px; font-size: 10px; font-weight: 800; color: #065f46; letter-spacing: 0.5px;">
            WEEKLY ATTENDANCE AUDIT
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; text-transform: uppercase; font-size: 9px; font-weight: 800; color: #475569;">
              <th style="padding: 8px 10px; text-align: left; width: 155px;">Staff Name</th>
              ${weeklyAttendance.days
                .map(
                  (d) => `
                  <th style="padding: 6px 3px; text-align: center; ${
                    d.isFriday ? 'background: #e2e8f0; font-weight: 900; color: #0f172a;' : ''
                  }">
                    <div style="font-size: 8px;">${d.dayName}</div>
                    <div style="font-size: 11px; font-weight: 800;">${d.dayNum}</div>
                  </th>
                `
                )
                .join('')}
              <th style="padding: 8px 6px; text-align: center; width: 65px;">Total Present</th>
              <th style="padding: 8px 6px; text-align: center; width: 55px;">Att. %</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyAttendance.records
              .map((r, idx) => {
                const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                return `
                  <tr style="background: ${rowBg}; border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px 10px; font-weight: 800; color: #0f172a;">
                      <div>${r.name}</div>
                      <div style="font-size: 9px; color: #64748b; font-weight: 600;">${r.role}</div>
                    </td>
                    ${weeklyAttendance.days
                      .map((d) => {
                        const val = r.statuses[d.dateStr];
                        const isP = val === 'P';
                        const isH = val === 'H';
                        const isA = val === 'A';
                        const bg = isP ? '#10b981' : isH ? '#f59e0b' : isA ? '#ef4444' : '#f1f5f9';
                        const text = isP ? '✓' : isH ? '½' : isA ? '✗' : '-';
                        const textColor = isP || isA ? '#ffffff' : isH ? '#78350f' : '#94a3b8';
                        return `
                          <td style="padding: 6px 2px; text-align: center;">
                            <span style="display: inline-block; width: 22px; height: 22px; line-height: 22px; border-radius: 4px; background: ${bg}; color: ${textColor}; font-weight: 900; font-size: 10px;">
                              ${text}
                            </span>
                          </td>
                        `;
                      })
                      .join('')}
                    <td style="padding: 8px 6px; text-align: center; font-weight: 800; color: #065f46; font-size: 11px;">
                      ${r.presentCount} / ${weeklyAttendance.days.length}
                    </td>
                    <td style="padding: 8px 6px; text-align: center; font-weight: 900; color: #0f172a; font-size: 11px;">
                      ${r.percentage}%
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
        <div style="font-size: 9px; color: #64748b; font-style: italic;">
          Legend: <strong style="color: #047857;">✓</strong> Full Day &bull; <strong style="color: #b45309;">½</strong> Half Day &bull; <strong style="color: #b91c1c;">✗</strong> Off Duty / Absent
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div>
      <!-- STORE HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 18px; border-bottom: 2.5px solid #0f172a;">
        <div>
          <div style="font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
            PAYOD, MANANTHAVADY, WAYANAD
          </div>
          <div style="font-size: 26px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; line-height: 1.1;">
            7Days Toys &amp; Babyshop
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #475569; margin-top: 4px;">
            Payod, Mananthavady, Wayanad, Kerala &bull; Ph: +91 95261 22471
          </div>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; background: ${sheet.isLocked ? '#064e3b' : '#1e293b'}; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
            ${sheet.isLocked ? '🔒 VERIFIED &amp; LOCKED' : 'DAILY CLOSING REGISTER'}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 8px;">
            ${readableDate}
          </div>
        </div>
      </div>

      <!-- METADATA BAR -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-top: 16px; margin-bottom: 20px;">
        <div>
          <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">
            Sales Date
          </span>
          <span style="font-size: 13px; font-weight: 800; color: #0f172a;">
            ${dateStr} (${readableDate.split(',')[0]})
          </span>
        </div>

        <div style="text-align: right;">
          <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">
            Staff on Duty (${staffList.length > 0 ? staffList.length : 1})
          </span>
          <span style="font-size: 13px; font-weight: 800; color: #047857;">
            ${displayStaff}
          </span>
        </div>
      </div>

      <!-- ITEMIZED SALES TABLE -->
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 22px;">
        <thead>
          <tr style="background: #f1f5f9; border-top: 1.5px solid #cbd5e1; border-bottom: 1.5px solid #cbd5e1; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; color: #475569;">
            <th style="padding: 10px 8px; width: 44px; text-align: center;">#</th>
            <th style="padding: 10px 12px; text-align: left;">Item / Product Name</th>
            <th style="padding: 10px 8px; width: 95px; text-align: center;">Payment Mode</th>
            <th style="padding: 10px 8px; width: 85px; text-align: center;">Time</th>
            <th style="padding: 10px 14px; width: 125px; text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- TOTAL COLLECTION SUMMARY BANNER -->
      <div style="background: linear-gradient(135deg, #064e3b 0%, #042f2e 100%); color: #ffffff; border-radius: 12px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #6ee7b7;">
            TOTAL DAY SALES COLLECTION (${sheet.count} ITEMS)
          </div>
          <div style="font-size: 26px; font-weight: 900; color: #ffffff; margin-top: 4px; letter-spacing: -0.5px;">
            ₹${Number(sheet.total).toLocaleString('en-IN')}
          </div>
        </div>

        <div style="text-align: right; display: flex; gap: 8px;">
          <div style="background: rgba(255, 255, 255, 0.12); padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: center;">
            <span style="display: block; font-size: 9px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 2px;">Cash</span>
            ₹${Number(cashTotal).toLocaleString('en-IN')}
          </div>
          <div style="background: rgba(255, 255, 255, 0.12); padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: 700; text-align: center;">
            <span style="display: block; font-size: 9px; text-transform: uppercase; color: #c4b5fd; margin-bottom: 2px;">UPI / Online</span>
            ₹${Number(upiTotal + cardTotal).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      ${attendanceSectionHtml}
    </div>

    <!-- SIGNATURES & OFFICIAL FOOTER -->
    <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 22px;">
        <div style="text-align: left;">
          <div style="width: 170px; border-bottom: 1px dashed #94a3b8; margin-bottom: 6px;"></div>
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
            Closing Staff Signature
          </span>
        </div>
        <div style="text-align: right;">
          <div style="width: 170px; border-bottom: 1px dashed #94a3b8; margin-bottom: 6px; margin-left: auto;"></div>
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
            Store Manager / Owner Signature
          </span>
        </div>
      </div>

      <div style="text-align: center; font-size: 10px; font-weight: 600; color: #94a3b8;">
        7Days Toys &amp; Babyshop &bull; Payod, Mananthavady, Wayanad, Kerala &bull; Official Daily Closing Register
      </div>
    </div>
  `;

  return container;
}

/**
 * Generates an A4 PDF Document from the structured sales data.
 * Guarantees zero horizontal clipping, full-width A4 layout, and exact color preservation.
 */
export async function generateDailySalesPdfDocument(data, fileName) {
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

  const container = createA4SalesDocumentElement(data);
  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  try {
    const canvas = await toCanvas(container, {
      backgroundColor: '#ffffff',
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
