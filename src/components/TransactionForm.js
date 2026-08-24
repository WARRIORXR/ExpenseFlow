/* ============================================
   TRANSACTION FORM — Add/Edit Transaction
   ============================================ */

import { store } from '../store/Store.js';
import { showToast } from './Toast.js';

/**
 * Render the transaction form into a container.
 * @param {HTMLElement} container
 * @param {object} [existingTx] - If provided, form is in edit mode
 * @param {Function} [onComplete] - Callback after save
 */
export function renderTransactionForm(container, existingTx = null, onComplete = null) {
  const isEdit = !!existingTx;
  const tx = existingTx || {
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    tags: [],
    recurring: false,
    recurringFreq: 'monthly',
  };

  const expenseCategories = store.getCategories('expense');
  const incomeCategories = store.getCategories('income');
  const settings = store.getSettings();

  container.innerHTML = `
    <div class="add-transaction">
      <div class="card">
        <h2 style="margin-bottom: var(--space-6); font-size: var(--font-size-xl);">
          ${isEdit ? '✏️ Edit Transaction' : '✨ New Transaction'}
        </h2>

        <!-- Type Toggle -->
        <div class="add-transaction__type-toggle" id="type-toggle">
          <button class="type-btn type-btn--expense ${tx.type === 'expense' ? 'type-btn--active' : ''}" data-type="expense">
            📉 Expense
          </button>
          <button class="type-btn type-btn--income ${tx.type === 'income' ? 'type-btn--active' : ''}" data-type="income">
            📈 Income
          </button>
        </div>

        <form class="add-transaction__form" id="transaction-form">
          <!-- Amount -->
          <div class="input-group">
            <label class="input-group__label">Amount</label>
            <div class="amount-input-wrapper">
              <span class="amount-input-wrapper__currency">${settings.currency}</span>
              <input type="number" class="input amount-input" id="tx-amount"
                     placeholder="0" min="0" step="1"
                     value="${tx.amount || ''}" required />
            </div>
          </div>

          <!-- Category -->
          <div class="input-group">
            <label class="input-group__label">Category</label>
            <div class="category-grid" id="category-grid">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Date -->
          <div class="input-group">
            <label class="input-group__label">Date</label>
            <input type="date" class="input" id="tx-date" value="${tx.date}" required />
          </div>

          <!-- Description -->
          <div class="input-group">
            <label class="input-group__label">Description</label>
            <input type="text" class="input" id="tx-description"
                   placeholder="What was this for?"
                   value="${tx.description || ''}" />
          </div>

          <!-- Tags -->
          <div class="input-group">
            <label class="input-group__label">Tags (comma separated)</label>
            <input type="text" class="input" id="tx-tags"
                   placeholder="e.g. essential, work, fun"
                   value="${(tx.tags || []).join(', ')}" />
          </div>

          <!-- Recurring -->
          <div class="recurring-options">
            <div class="flex items-center justify-between">
              <div>
                <div style="font-weight: var(--font-weight-medium);">🔄 Recurring Transaction</div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary);">Automatically repeats</div>
              </div>
              <label class="toggle">
                <input type="checkbox" id="tx-recurring" ${tx.recurring ? 'checked' : ''} />
                <span class="toggle__slider"></span>
              </label>
            </div>
            <div id="recurring-freq-wrapper" style="display: ${tx.recurring ? 'block' : 'none'};">
              <select class="input" id="tx-recurring-freq" style="margin-top: var(--space-3);">
                <option value="weekly" ${tx.recurringFreq === 'weekly' ? 'selected' : ''}>Weekly</option>
                <option value="monthly" ${tx.recurringFreq === 'monthly' ? 'selected' : ''}>Monthly</option>
                <option value="yearly" ${tx.recurringFreq === 'yearly' ? 'selected' : ''}>Yearly</option>
              </select>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn btn--primary btn--lg btn--block" id="tx-submit">
            ${isEdit ? '💾 Update Transaction' : '➕ Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  `;

  // State
  let selectedType = tx.type;
  let selectedCategory = tx.category;

  // Render categories
  function renderCategories() {
    const cats = selectedType === 'expense' ? expenseCategories : incomeCategories;
    const grid = container.querySelector('#category-grid');
    grid.innerHTML = cats.map(cat => `
      <div class="category-grid__item ${cat.id === selectedCategory ? 'category-grid__item--active' : ''}"
           data-category="${cat.id}" style="--cat-color: ${cat.color}">
        <span class="category-grid__item-icon">${cat.icon}</span>
        <span>${cat.name}</span>
      </div>
    `).join('');

    // Category click handlers
    grid.querySelectorAll('.category-grid__item').forEach(item => {
      item.addEventListener('click', () => {
        selectedCategory = item.dataset.category;
        grid.querySelectorAll('.category-grid__item').forEach(i =>
          i.classList.toggle('category-grid__item--active', i.dataset.category === selectedCategory)
        );
      });
    });
  }

  renderCategories();

  // Type toggle
  container.querySelector('#type-toggle').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    selectedType = btn.dataset.type;
    selectedCategory = '';
    container.querySelectorAll('.type-btn').forEach(b => b.classList.remove('type-btn--active'));
    btn.classList.add('type-btn--active');
    renderCategories();
  });

  // Recurring toggle
  container.querySelector('#tx-recurring').addEventListener('change', (e) => {
    container.querySelector('#recurring-freq-wrapper').style.display = e.target.checked ? 'block' : 'none';
  });

  // Form submit
  container.querySelector('#transaction-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(container.querySelector('#tx-amount').value);
    const date = container.querySelector('#tx-date').value;
    const description = container.querySelector('#tx-description').value.trim();
    const tagsRaw = container.querySelector('#tx-tags').value;
    const recurring = container.querySelector('#tx-recurring').checked;
    const recurringFreq = container.querySelector('#tx-recurring-freq').value;

    // Validation
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      container.querySelector('#tx-amount').classList.add('input--error');
      return;
    }

    if (!selectedCategory) {
      showToast('Please select a category', 'error');
      return;
    }

    if (!date) {
      showToast('Please select a date', 'error');
      return;
    }

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const txData = {
      type: selectedType,
      amount,
      category: selectedCategory,
      date,
      description,
      tags,
      recurring,
      recurringFreq: recurring ? recurringFreq : null,
    };

    if (isEdit) {
      store.updateTransaction(existingTx.id, txData);
      showToast('Transaction updated!', 'success');
    } else {
      store.addTransaction(txData);
      showToast('Transaction added!', 'success');
      // Reset form
      container.querySelector('#tx-amount').value = '';
      container.querySelector('#tx-description').value = '';
      container.querySelector('#tx-tags').value = '';
      selectedCategory = '';
      renderCategories();
    }

    if (onComplete) onComplete();
  });
}
