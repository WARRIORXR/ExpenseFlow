/* ============================================
   DASHBOARD PAGE
   ============================================ */

import { store } from '../store/Store.js';
import { formatCurrency, getCurrentMonthRange, animateCounter } from '../utils/helpers.js';
import { createCategoryPieChart, createSpendingLineChart } from '../utils/charts.js';
import { router } from '../utils/router.js';

export function renderDashboard(container) {
  const { from, to } = getCurrentMonthRange();
  const settings = store.getSettings();
  const totalIncome = store.getTotalIncome(from, to);
  const totalExpense = store.getTotalExpense(from, to);
  const balance = totalIncome - totalExpense;
  const stats = store.getQuickStats(from, to);
  const recentTransactions = store.getFilteredTransactions({ sortBy: 'date', sortDir: 'desc' }).slice(0, 5);

  // Category breakdown for pie chart
  const breakdown = store.getCategoryBreakdown('expense', from, to);
  const enrichedBreakdown = breakdown.map(b => {
    const cat = store.getCategoryById(b.category);
    return {
      ...b,
      categoryName: cat ? cat.name : b.category,
      color: cat ? cat.color : '#818cf8',
      icon: cat ? cat.icon : '📦',
    };
  });

  container.innerHTML = `
    <div class="dashboard stagger-children">
      <!-- Balance Cards -->
      <div class="dashboard__balance-row">
        <div class="card balance-card balance-card--total">
          <div class="balance-card__gradient"></div>
          <div class="balance-card__icon">💎</div>
          <div class="stat">
            <span class="stat__label">Total Balance</span>
            <span class="stat__value ${balance >= 0 ? 'text-income' : 'text-expense'}" id="stat-balance">
              ${formatCurrency(balance)}
            </span>
            <span class="stat__change ${balance >= 0 ? 'text-income' : 'text-expense'}">
              ${balance >= 0 ? '↑' : '↓'} This month
            </span>
          </div>
        </div>

        <div class="card balance-card balance-card--income">
          <div class="balance-card__gradient"></div>
          <div class="balance-card__icon">📈</div>
          <div class="stat">
            <span class="stat__label">Income</span>
            <span class="stat__value text-income" id="stat-income">${formatCurrency(totalIncome)}</span>
            <span class="stat__change text-income">This month</span>
          </div>
        </div>

        <div class="card balance-card balance-card--expense">
          <div class="balance-card__gradient"></div>
          <div class="balance-card__icon">📉</div>
          <div class="stat">
            <span class="stat__label">Expenses</span>
            <span class="stat__value text-expense" id="stat-expense">${formatCurrency(totalExpense)}</span>
            <span class="stat__change text-expense">This month</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="dashboard__charts-row">
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Expense Breakdown</h3>
            <span class="badge badge--neutral">This Month</span>
          </div>
          <div class="chart-wrapper">
            ${enrichedBreakdown.length > 0
              ? '<canvas id="chart-category-pie"></canvas>'
              : '<div class="empty-state"><span class="empty-state__icon">📊</span><p class="empty-state__text">No expenses this month yet</p></div>'
            }
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Spending Trend</h3>
            <span class="badge badge--neutral">Last 30 Days</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="chart-spending-trend"></canvas>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Quick Stats + Recent Transactions -->
      <div class="dashboard__bottom-row">
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Quick Stats</h3>
          </div>
          <div class="quick-stats">
            <div class="quick-stat-card">
              <div class="quick-stat-card__icon">${stats.highestCategory ? (store.getCategoryById(stats.highestCategory.category)?.icon || '📦') : '—'}</div>
              <div class="quick-stat-card__value">${stats.highestCategory ? stats.highestCategory.categoryName || stats.highestCategory.category : 'N/A'}</div>
              <div class="quick-stat-card__label">Top Category</div>
            </div>
            <div class="quick-stat-card">
              <div class="quick-stat-card__icon">📅</div>
              <div class="quick-stat-card__value">${formatCurrency(Math.round(stats.avgDailySpending))}</div>
              <div class="quick-stat-card__label">Avg Daily Spend</div>
            </div>
            <div class="quick-stat-card">
              <div class="quick-stat-card__icon">💰</div>
              <div class="quick-stat-card__value" style="color: ${stats.savingsRate >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                ${stats.savingsRate.toFixed(1)}%
              </div>
              <div class="quick-stat-card__label">Savings Rate</div>
            </div>
            <div class="quick-stat-card">
              <div class="quick-stat-card__icon">📝</div>
              <div class="quick-stat-card__value">${stats.totalTransactions}</div>
              <div class="quick-stat-card__label">Transactions</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Recent Transactions</h3>
            <button class="btn btn--ghost btn--sm" id="view-all-btn">View All →</button>
          </div>
          ${recentTransactions.length > 0 ? recentTransactions.map(tx => {
            const cat = store.getCategoryById(tx.category);
            return `
              <div class="transaction-item">
                <div class="transaction-item__icon" style="background: ${cat ? cat.color + '20' : 'var(--color-accent-subtle)'};">
                  ${cat ? cat.icon : '📦'}
                </div>
                <div class="transaction-item__details">
                  <div class="transaction-item__title truncate">${tx.description || cat?.name || tx.category}</div>
                  <div class="transaction-item__meta">
                    <span>${new Date(tx.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>${cat?.name || tx.category}</span>
                  </div>
                </div>
                <div class="transaction-item__amount transaction-item__amount--${tx.type}">
                  ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                </div>
              </div>
            `;
          }).join('') : `
            <div class="empty-state" style="padding: var(--space-8);">
              <span class="empty-state__icon">📭</span>
              <p class="empty-state__text">No transactions yet</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Render charts
  if (enrichedBreakdown.length > 0) {
    setTimeout(() => createCategoryPieChart('chart-category-pie', enrichedBreakdown, settings.currency), 100);
  }

  const dailyData = store.getDailySpending(30);
  setTimeout(() => createSpendingLineChart('chart-spending-trend', dailyData, settings.currency), 150);

  // Animate counters
  setTimeout(() => {
    const balEl = container.querySelector('#stat-balance');
    const incEl = container.querySelector('#stat-income');
    const expEl = container.querySelector('#stat-expense');
    if (balEl) animateCounter(balEl, balance, 800, settings.currency);
    if (incEl) animateCounter(incEl, totalIncome, 800, settings.currency);
    if (expEl) animateCounter(expEl, totalExpense, 800, settings.currency);
  }, 200);

  // View all button
  container.querySelector('#view-all-btn')?.addEventListener('click', () => router.navigate('/transactions'));
}
