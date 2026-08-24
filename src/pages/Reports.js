/* ============================================
   REPORTS PAGE — Analytics & Insights
   ============================================ */

import { store } from '../store/Store.js';
import { formatCurrency, exportCSV, exportPDF } from '../utils/helpers.js';
import { createCategoryBarChart, createMonthlyBarChart, createSpendingLineChart } from '../utils/charts.js';
import { showToast } from '../components/Toast.js';

export function renderReports(container) {
  const settings = store.getSettings();
  const monthlyData = store.getMonthlyData(6);
  const dailyData = store.getDailySpending(30);

  // Date range state
  let rangeType = 'month'; // month, quarter, year

  render();

  function render() {
    const { from, to } = getRange(rangeType);
    const breakdown = store.getCategoryBreakdown('expense', from, to).map(b => {
      const cat = store.getCategoryById(b.category);
      return {
        ...b,
        categoryName: cat ? cat.name : b.category,
        color: cat ? cat.color : '#818cf8',
      };
    });

    const totalIncome = store.getTotalIncome(from, to);
    const totalExpense = store.getTotalExpense(from, to);
    const stats = store.getQuickStats(from, to);
    const topCategories = breakdown.slice(0, 5);

    container.innerHTML = `
      <div class="reports-page stagger-children">
        <!-- Controls -->
        <div class="reports-page__controls">
          <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">📈 Reports & Analytics</h2>
          <div class="flex gap-2">
            <div class="tabs" id="range-tabs">
              <button class="tabs__tab ${rangeType === 'month' ? 'tabs__tab--active' : ''}" data-range="month">Month</button>
              <button class="tabs__tab ${rangeType === 'quarter' ? 'tabs__tab--active' : ''}" data-range="quarter">Quarter</button>
              <button class="tabs__tab ${rangeType === 'year' ? 'tabs__tab--active' : ''}" data-range="year">Year</button>
            </div>
            <button class="btn btn--ghost btn--sm" id="print-report-btn">🖨️ Print</button>
            <button class="btn btn--ghost btn--sm" id="download-report-btn">📥 Download</button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="dashboard__balance-row">
          <div class="card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: var(--space-2);">📈</div>
            <div class="stat__value text-income">${formatCurrency(totalIncome)}</div>
            <div class="stat__label" style="margin-top: var(--space-2);">Total Income</div>
          </div>
          <div class="card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: var(--space-2);">📉</div>
            <div class="stat__value text-expense">${formatCurrency(totalExpense)}</div>
            <div class="stat__label" style="margin-top: var(--space-2);">Total Expenses</div>
          </div>
          <div class="card" style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: var(--space-2);">💰</div>
            <div class="stat__value" style="color: ${totalIncome - totalExpense >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
              ${formatCurrency(totalIncome - totalExpense)}
            </div>
            <div class="stat__label" style="margin-top: var(--space-2);">Net Savings</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="dashboard__charts-row">
          <div class="card report-chart-card">
            <div class="card__header">
              <h3 class="card__title">Category Breakdown</h3>
            </div>
            ${breakdown.length > 0
              ? '<canvas id="report-category-bar"></canvas>'
              : '<div class="empty-state"><span class="empty-state__icon">📊</span><p class="empty-state__text">No data for this period</p></div>'
            }
          </div>

          <div class="card report-chart-card">
            <div class="card__header">
              <h3 class="card__title">Monthly Comparison</h3>
            </div>
            <canvas id="report-monthly-bar"></canvas>
          </div>
        </div>

        <!-- Spending Trend -->
        <div class="card report-chart-card">
          <div class="card__header">
            <h3 class="card__title">Spending Trend (30 Days)</h3>
          </div>
          <canvas id="report-trend-line"></canvas>
        </div>

        <!-- Insights -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">💡 Spending Insights</h3>
          </div>
          <div class="insights-grid">
            <div class="insight-card">
              <div class="insight-card__icon">${stats.highestCategory ? (store.getCategoryById(stats.highestCategory.category)?.icon || '📦') : '—'}</div>
              <div class="insight-card__value">${stats.highestCategory ? formatCurrency(stats.highestCategory.amount) : 'N/A'}</div>
              <div class="insight-card__label">
                Highest Spending: ${stats.highestCategory ? (store.getCategoryById(stats.highestCategory.category)?.name || stats.highestCategory.category) : 'N/A'}
              </div>
            </div>

            <div class="insight-card">
              <div class="insight-card__icon">📅</div>
              <div class="insight-card__value">${formatCurrency(Math.round(stats.avgDailySpending))}</div>
              <div class="insight-card__label">Average Daily Spending</div>
            </div>

            <div class="insight-card">
              <div class="insight-card__icon">💰</div>
              <div class="insight-card__value" style="color: ${stats.savingsRate >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                ${stats.savingsRate.toFixed(1)}%
              </div>
              <div class="insight-card__label">Savings Rate</div>
            </div>

            <div class="insight-card">
              <div class="insight-card__icon">📝</div>
              <div class="insight-card__value">${stats.totalTransactions}</div>
              <div class="insight-card__label">Total Transactions</div>
            </div>

            ${topCategories.length >= 2 ? `
              <div class="insight-card">
                <div class="insight-card__icon">🥈</div>
                <div class="insight-card__value">${formatCurrency(topCategories[1].amount)}</div>
                <div class="insight-card__label">2nd Highest: ${topCategories[1].categoryName}</div>
              </div>
            ` : ''}

            ${totalExpense > 0 && totalIncome > 0 ? `
              <div class="insight-card">
                <div class="insight-card__icon">📊</div>
                <div class="insight-card__value">${((totalExpense / totalIncome) * 100).toFixed(1)}%</div>
                <div class="insight-card__label">Expense-to-Income Ratio</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Render charts
    if (breakdown.length > 0) {
      setTimeout(() => createCategoryBarChart('report-category-bar', breakdown, settings.currency), 100);
    }
    setTimeout(() => createMonthlyBarChart('report-monthly-bar', monthlyData, settings.currency), 150);
    setTimeout(() => createSpendingLineChart('report-trend-line', dailyData, settings.currency), 200);

    // Range tabs
    container.querySelector('#range-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.tabs__tab');
      if (!tab) return;
      rangeType = tab.dataset.range;
      render();
    });

    // Print
    container.querySelector('#print-report-btn').addEventListener('click', () => {
      window.print();
    });

    // Download
    container.querySelector('#download-report-btn').addEventListener('click', async () => {
      const txs = store.getFilteredTransactions(getRange(rangeType));
      await exportPDF(txs, `${rangeType.charAt(0).toUpperCase() + rangeType.slice(1)}ly Report`);
      showToast('Report downloaded!', 'success');
    });
  }
}

function getRange(rangeType) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (rangeType) {
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { from, to, dateFrom: from, dateTo: to };
    }
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const from = new Date(now.getFullYear(), qMonth, 1).toISOString().split('T')[0];
      return { from, to: today, dateFrom: from, dateTo: today };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { from, to: today, dateFrom: from, dateTo: today };
    }
    default:
      return { from: null, to: null };
  }
}
