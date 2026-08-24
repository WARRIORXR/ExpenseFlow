/* ============================================
   BUDGET MANAGER PAGE
   ============================================ */

import { store } from '../store/Store.js';
import { formatCurrency, getCurrentMonthRange } from '../utils/helpers.js';
import { showToast } from '../components/Toast.js';
import { confirmDialog } from '../components/Modal.js';

export function renderBudgetManager(container) {
  render();

  function render() {
    const { from, to } = getCurrentMonthRange();
    const budgetStatuses = store.getBudgetStatus(from, to);
    const categories = store.getCategories('expense');
    const settings = store.getSettings();

    // Separate overall and category budgets
    const overallBudget = budgetStatuses.find(b => b.category === 'overall');
    const categoryBudgets = budgetStatuses.filter(b => b.category !== 'overall');

    container.innerHTML = `
      <div class="budget-page stagger-children">
        <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">🎯 Budget Manager</h2>

        <!-- Overall Budget Card -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Monthly Budget Overview</h3>
          </div>
          ${overallBudget ? `
            <div style="margin-bottom: var(--space-4);">
              <div class="budget-card__amounts">
                <span class="budget-card__spent" style="color: var(--color-expense);">
                  Spent: ${formatCurrency(overallBudget.spent)}
                </span>
                <span class="budget-card__limit">
                  Budget: ${formatCurrency(overallBudget.limit)}
                </span>
              </div>
              <div class="progress">
                <div class="progress__bar progress__bar--${getProgressClass(overallBudget.percentage)} progress__bar--animated"
                     style="width: ${Math.min(overallBudget.percentage, 100)}%"></div>
              </div>
              <div class="budget-card__percentage" style="color: ${getStatusColor(overallBudget.status)};">
                ${overallBudget.percentage.toFixed(1)}% used
                ${overallBudget.percentage < 100 ? ` — ${formatCurrency(overallBudget.limit - overallBudget.spent)} remaining` : ''}
              </div>
              ${overallBudget.status !== 'safe' ? `
                <div class="budget-card__alert budget-card__alert--${overallBudget.status === 'exceeded' ? 'danger' : 'warning'}">
                  ${overallBudget.status === 'exceeded' ? '🚨 Budget exceeded!' : '⚠️ Approaching budget limit'}
                </div>
              ` : ''}
            </div>
          ` : '<p style="color: var(--color-text-tertiary);">No overall budget set. Add one below.</p>'}
        </div>

        <!-- Add Budget Form -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Set Budget</h3>
          </div>
          <div class="budget-form" id="budget-form">
            <div class="input-group">
              <label class="input-group__label">Category</label>
              <select class="input" id="budget-category">
                <option value="overall">💰 Overall Monthly</option>
                ${categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="input-group">
              <label class="input-group__label">Budget Limit (${settings.currency})</label>
              <input type="number" class="input" id="budget-limit" placeholder="Enter amount" min="0" />
            </div>
            <div>
              <button class="btn btn--primary" id="save-budget-btn">💾 Save Budget</button>
            </div>
          </div>
        </div>

        <!-- Category Budgets -->
        <div class="card">
          <div class="card__header">
            <h3 class="card__title">Category Budgets</h3>
          </div>
          ${categoryBudgets.length > 0 ? `
            <div class="budget-overview" id="budget-cards">
              ${categoryBudgets.map(budget => {
                const cat = store.getCategoryById(budget.category);
                return `
                  <div class="budget-card card--interactive" style="padding: var(--space-4); border-radius: var(--radius-lg); background: var(--color-bg-card); border: 1px solid var(--color-border-subtle);">
                    <div class="budget-card__header">
                      <div class="budget-card__category">
                        <div class="budget-card__category-icon" style="background: ${cat ? cat.color + '20' : 'var(--color-accent-subtle)'};">
                          ${cat ? cat.icon : '📦'}
                        </div>
                        <div>
                          <div style="font-weight: var(--font-weight-semibold);">${cat ? cat.name : budget.category}</div>
                          <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">Monthly</div>
                        </div>
                      </div>
                      <button class="btn btn--ghost btn--icon btn--sm budget-delete-btn" data-id="${budget.id}" title="Remove budget">🗑️</button>
                    </div>
                    <div class="budget-card__amounts">
                      <span class="budget-card__spent" style="color: ${getStatusColor(budget.status)};">
                        ${formatCurrency(budget.spent)}
                      </span>
                      <span class="budget-card__limit">/ ${formatCurrency(budget.limit)}</span>
                    </div>
                    <div class="progress">
                      <div class="progress__bar progress__bar--${getProgressClass(budget.percentage)} progress__bar--animated"
                           style="width: ${Math.min(budget.percentage, 100)}%"></div>
                    </div>
                    <div class="budget-card__percentage" style="color: ${getStatusColor(budget.status)};">
                      ${budget.percentage.toFixed(1)}%
                    </div>
                    ${budget.status !== 'safe' ? `
                      <div class="budget-card__alert budget-card__alert--${budget.status === 'exceeded' ? 'danger' : 'warning'}">
                        ${budget.status === 'exceeded' ? '🚨 Exceeded!' : '⚠️ Near limit'}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-8);">
              <span class="empty-state__icon">📊</span>
              <span class="empty-state__title">No category budgets set</span>
              <span class="empty-state__text">Set budgets above to track spending by category</span>
            </div>
          `}
        </div>
      </div>
    `;

    // Save budget handler
    container.querySelector('#save-budget-btn').addEventListener('click', () => {
      const category = container.querySelector('#budget-category').value;
      const limit = parseFloat(container.querySelector('#budget-limit').value);

      if (!limit || limit <= 0) {
        showToast('Please enter a valid budget amount', 'error');
        return;
      }

      // Check if budget already exists for this category
      const existing = store.getBudgets().find(b => b.category === category);
      if (existing) {
        store.updateBudget(existing.id, { limit });
        showToast('Budget updated!', 'success');
      } else {
        store.addBudget({ category, limit });
        showToast('Budget created!', 'success');
      }

      render();
    });

    // Delete budget handlers
    container.querySelectorAll('.budget-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const confirmed = await confirmDialog(
          'Remove Budget',
          'Are you sure you want to remove this budget?',
          { danger: true, confirmText: 'Remove' }
        );
        if (confirmed) {
          store.deleteBudget(btn.dataset.id);
          showToast('Budget removed', 'success');
          render();
        }
      });
    });
  }
}

function getProgressClass(percentage) {
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'income';
}

function getStatusColor(status) {
  switch (status) {
    case 'exceeded': return 'var(--color-danger)';
    case 'warning': return 'var(--color-warning)';
    default: return 'var(--color-income)';
  }
}
