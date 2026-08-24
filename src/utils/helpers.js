/* ============================================
   HELPERS — Formatting, Export, Utilities
   ============================================ */

import { store } from '../store/Store.js';

/**
 * Format a number as currency.
 */
export function formatCurrency(amount, compact = false) {
  const settings = store.getSettings();
  const symbol = settings.currency || '₹';

  if (compact && Math.abs(amount) >= 100000) {
    return symbol + (amount / 100000).toFixed(1) + 'L';
  }
  if (compact && Math.abs(amount) >= 1000) {
    return symbol + (amount / 1000).toFixed(1) + 'K';
  }

  return symbol + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Format a date string.
 */
export function formatDate(dateStr, format = 'medium') {
  const date = new Date(dateStr + 'T00:00:00');
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    case 'medium':
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    case 'relative':
      return getRelativeDate(dateStr);
    default:
      return dateStr;
  }
}

/**
 * Get relative date string (Today, Yesterday, etc.)
 */
function getRelativeDate(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);

  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get current month's date range.
 */
export function getCurrentMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

/**
 * Get date range for a preset period.
 */
export function getDateRange(preset) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString().split('T')[0], to: today };
    }
    case 'month':
      return getCurrentMonthRange();
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { from, to: today };
    }
    case 'all':
      return { from: null, to: null };
    default:
      return getCurrentMonthRange();
  }
}

/**
 * Generate a UUID-like ID.
 */
export function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Debounce a function.
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Deep clone an object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Export transactions as CSV.
 */
export function exportCSV(transactions) {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description', 'Tags'];
  const rows = transactions.map(t => [
    t.date,
    t.type,
    t.category,
    t.amount,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    (t.tags || []).join('; '),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csv, 'expenseflow_transactions.csv', 'text/csv');
}

/**
 * Export transactions as PDF.
 */
export async function exportPDF(transactions, title = 'Transaction Report') {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();
  const settings = store.getSettings();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text('ExpenseFlow', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(130, 130, 130);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  // Table
  const rows = transactions.map(t => [
    t.date,
    t.type === 'income' ? 'Income' : 'Expense',
    t.category,
    settings.currency + t.amount.toLocaleString(),
    t.description || '',
  ]);

  doc.autoTable({
    startY: 44,
    head: [['Date', 'Type', 'Category', 'Amount', 'Description']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Summary
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text(`Total Income: ${settings.currency}${totalIncome.toLocaleString()}`, 14, finalY);
  doc.setTextColor(239, 68, 68);
  doc.text(`Total Expenses: ${settings.currency}${totalExpense.toLocaleString()}`, 14, finalY + 7);
  doc.setTextColor(99, 102, 241);
  doc.text(`Balance: ${settings.currency}${(totalIncome - totalExpense).toLocaleString()}`, 14, finalY + 14);

  doc.save('expenseflow_report.pdf');
}

/**
 * Download a file.
 */
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download a JSON file.
 */
export function downloadJSON(data, filename) {
  downloadFile(data, filename, 'application/json');
}

/**
 * Animate a number counting up.
 */
export function animateCounter(element, target, duration = 800, prefix = '') {
  const start = parseInt(element.textContent.replace(/[^0-9-]/g, '')) || 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    element.textContent = prefix + current.toLocaleString('en-IN');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
