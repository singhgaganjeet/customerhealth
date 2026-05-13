import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PILLARS } from './pillars';

export function generatePDFReport(customers, reportDate) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Cover Page ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(126, 217, 87);
  doc.roundedRect(W / 2 - 14, 38, 28, 28, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('H', W / 2, 56, { align: 'center' });
  doc.setFontSize(28);
  doc.text('Hoopstr', W / 2, 82, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Customer Activation Report', W / 2, 94, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report Date: ${reportDate}`, W / 2, 110, { align: 'center' });
  doc.text(`Total Customers: ${customers.length}`, W / 2, 118, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Confidential | Hoopstr Internal Use Only', W / 2, H - 8, { align: 'center' });

  // ── Executive Summary ────────────────────────────────────────────────────────
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, 18);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(14, 22, W - 14, 22);

  const tiers = [
    { label: 'Fully Activated',      min: 80, max: 101, fill: [126, 217, 87] },
    { label: 'Highly Activated',     min: 60, max: 80,  fill: [22, 163, 74]  },
    { label: 'Moderately Activated', min: 40, max: 60,  fill: [202, 138, 4]  },
    { label: 'Low Activation',       min: 20, max: 40,  fill: [220, 38, 38]  },
    { label: 'Not Activated',        min: 0,  max: 20,  fill: [107, 114, 128] },
  ];

  const bW = (W - 28 - 4 * 4) / 5;
  tiers.forEach((t, i) => {
    const count = customers.filter(c => c.activationScore >= t.min && c.activationScore < t.max).length;
    const x = 14 + i * (bW + 4);
    doc.setFillColor(...t.fill);
    doc.roundedRect(x, 28, bW, 26, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(String(count), x + bW / 2, 42, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(t.label, x + bW / 2, 50, { align: 'center' });
  });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Pillar Activation Rates', 14, 68);

  const pillarRows = PILLARS.map(p => {
    const n = customers.filter(c => c.pillarActivations[p.key]?.activated).length;
    const pct = customers.length > 0 ? Math.round((n / customers.length) * 100) : 0;
    return [p.label, `${n} / ${customers.length}`, `${pct}%`];
  });

  autoTable(doc, {
    startY: 72,
    head: [['Pillar', 'Activated Customers', 'Activation Rate']],
    body: pillarRows,
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    margin: { left: 14, right: 14 },
  });

  // ── All Customers Table ──────────────────────────────────────────────────────
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Activation Overview', 14, 18);

  const sorted = [...customers].sort((a, b) => b.activationScore - a.activationScore);
  autoTable(doc, {
    startY: 23,
    head: [['#', 'Customer', 'City', 'State', 'Plan', 'PA Status', 'Score', 'Activation Status', 'Pillars']],
    body: sorted.map((c, i) => [
      i + 1, c.customer, c.city || '', c.state || '', c.plan || '',
      c.pa_status || '', `${c.activationScore}/100`, c.activationStatus.label, `${c.pillarsActivated}/9`,
    ]),
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 8 }, 6: { halign: 'center' }, 8: { halign: 'center' } },
    margin: { left: 14, right: 14 },
  });

  // ── Top 10 / Bottom 10 ───────────────────────────────────────────────────────
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 10 Most Activated', 14, 18);
  autoTable(doc, {
    startY: 22,
    head: [['#', 'Customer', 'Score', 'Status', 'Pillars']],
    body: sorted.slice(0, 10).map((c, i) => [i + 1, c.customer, `${c.activationScore}/100`, c.activationStatus.label, `${c.pillarsActivated}/9`]),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
    margin: { left: 14, right: W / 2 + 2 },
  });

  doc.text('Bottom 10 Least Activated', W / 2 + 6, 18);
  const bottom10 = [...sorted].reverse().slice(0, 10);
  autoTable(doc, {
    startY: 22,
    head: [['#', 'Customer', 'Score', 'Status', 'Pillars']],
    body: bottom10.map((c, i) => [i + 1, c.customer, `${c.activationScore}/100`, c.activationStatus.label, `${c.pillarsActivated}/9`]),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255 },
    margin: { left: W / 2 + 6, right: 14 },
  });

  // ── Footer on all pages ──────────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Confidential | Hoopstr Customer Activation | Generated ${reportDate} | Page ${i} of ${total}`,
      W / 2, H - 5, { align: 'center' }
    );
  }

  doc.save(`hoopstr_activation_${reportDate.replace(/\s/g, '_')}.pdf`);
}
