/* ============================================
   SETTINGS PAGE
   ============================================ */

import { store } from '../store/Store.js';
import { CURRENCIES } from '../store/defaults.js';
import { showToast } from '../components/Toast.js';
import { confirmDialog } from '../components/Modal.js';
import { showCreateCategoryModal } from '../components/CategoryPicker.js';
import { downloadJSON } from '../utils/helpers.js';

export function renderSettings(container) {
  render();

  function render() {
    const settings = store.getSettings();
    const categories = store.getCategories();
    const expenseCats = categories.filter(c => c.type === 'expense');
    const incomeCats = categories.filter(c => c.type === 'income');

    container.innerHTML = `
      <div class="settings-page stagger-children">
        <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">⚙️ Settings</h2>

        <!-- Appearance -->
        <div class="card settings-section">
          <h3 class="settings-section__title">🎨 Appearance</h3>

          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__title">Dark Mode</span>
              <span class="settings-row__description">Toggle between dark and light themes</span>
            </div>
            <label class="toggle">
              <input type="checkbox" id="setting-theme" ${settings.theme === 'dark' ? 'checked' : ''} />
              <span class="toggle__slider"></span>
            </label>
          </div>
        </div>

        <!-- Currency -->
        <div class="card settings-section">
          <h3 class="settings-section__title">💱 Currency</h3>

          <div class="settings-row">
            <div class="settings-row__label">
              <span class="settings-row__title">Currency</span>
              <span class="settings-row__description">Select your preferred currency</span>
            </div>
            <select class="input" id="setting-currency" style="max-width: 200px;">
              ${CURRENCIES.map(c =>
                `<option value="${c.code}" ${c.code === settings.currencyCode ? 'selected' : ''}>
                  ${c.symbol} ${c.name}
                </option>`
              ).join('')}
            </select>
          </div>
        </div>

        <!-- Categories -->
        <div class="card settings-section">
          <h3 class="settings-section__title">📁 Categories</h3>

          <div style="margin-bottom: var(--space-4);">
            <h4 style="font-size: var(--font-size-base); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
              Expense Categories
            </h4>
            <div class="category-manager" id="expense-categories">
              ${expenseCats.map(cat => categoryItem(cat)).join('')}
            </div>
            <button class="btn btn--ghost btn--sm" style="margin-top: var(--space-3);" id="add-expense-cat-btn">
              ➕ Add Expense Category
            </button>
          </div>

          <div class="divider"></div>

          <div>
            <h4 style="font-size: var(--font-size-base); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
              Income Categories
            </h4>
            <div class="category-manager" id="income-categories">
              ${incomeCats.map(cat => categoryItem(cat)).join('')}
            </div>
            <button class="btn btn--ghost btn--sm" style="margin-top: var(--space-3);" id="add-income-cat-btn">
              ➕ Add Income Category
            </button>
          </div>
        </div>

        <!-- Data Management -->
        <div class="card settings-section">
          <h3 class="settings-section__title">💾 Data Management</h3>

          <div class="data-actions">
            <button class="btn btn--primary btn--sm" id="export-backup-btn">📥 Export Backup</button>
            <label class="btn btn--ghost btn--sm" style="cursor: pointer;">
              📤 Import Backup
              <input type="file" accept=".json" id="import-backup-input" style="display: none;" />
            </label>
            <button class="btn btn--danger btn--sm" id="clear-data-btn">🗑️ Clear All Data</button>
          </div>

          <p style="font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-top: var(--space-4);">
            Your data is stored locally in your browser. Export regularly to prevent data loss.
          </p>
        </div>

        <!-- About -->
        <div class="card settings-section">
          <h3 class="settings-section__title">ℹ️ About</h3>
          <p style="color: var(--color-text-secondary); line-height: 1.8;">
            <strong>ExpenseFlow</strong> v1.0.0<br />
            A modern, privacy-first expense tracker.<br />
            All data stays in your browser — no server, no tracking.<br />
            Built with ❤️ using Vanilla JS, Chart.js, and CSS.
          </p>
        </div>
      </div>
    `;

    // Theme toggle
    container.querySelector('#setting-theme').addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      store.updateSettings({ theme });
      // Update theme icon
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
      showToast(`Switched to ${theme} mode`, 'info');
    });

    // Currency change
    container.querySelector('#setting-currency').addEventListener('change', (e) => {
      const currency = CURRENCIES.find(c => c.code === e.target.value);
      if (currency) {
        store.updateSettings({ currency: currency.symbol, currencyCode: currency.code });
        showToast(`Currency changed to ${currency.name}`, 'success');
      }
    });

    // Add category buttons
    container.querySelector('#add-expense-cat-btn').addEventListener('click', () => {
      showCreateCategoryModal('expense', render);
    });

    container.querySelector('#add-income-cat-btn').addEventListener('click', () => {
      showCreateCategoryModal('income', render);
    });

    // Delete category buttons
    container.querySelectorAll('.cat-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const confirmed = await confirmDialog(
          'Delete Category',
          'Delete this category? Existing transactions using it will keep their category ID but display may change.',
          { danger: true, confirmText: 'Delete' }
        );
        if (confirmed) {
          store.deleteCategory(btn.dataset.id);
          showToast('Category deleted', 'success');
          render();
        }
      });
    });

    // Export backup
    container.querySelector('#export-backup-btn').addEventListener('click', () => {
      const data = store.exportData();
      downloadJSON(data, `expenseflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      showToast('Backup exported!', 'success');
    });

    // Import backup
    container.querySelector('#import-backup-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = store.importData(ev.target.result);
        if (success) {
          showToast('Data imported successfully!', 'success');
          render();
        } else {
          showToast('Invalid backup file', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Clear data
    container.querySelector('#clear-data-btn').addEventListener('click', async () => {
      const confirmed = await confirmDialog(
        '⚠️ Clear All Data',
        'This will permanently delete ALL your transactions, budgets, and custom categories. This cannot be undone. Consider exporting a backup first.',
        { danger: true, confirmText: 'Clear Everything' }
      );
      if (confirmed) {
        store.clearAll();
        showToast('All data cleared', 'info');
        render();
      }
    });
  }
}

function categoryItem(cat) {
  return `
    <div class="category-manager__item">
      <div class="category-manager__item-icon" style="background: ${cat.color}20;">
        ${cat.icon}
      </div>
      <span class="category-manager__item-name">${cat.name}</span>
      <span class="badge badge--neutral">${cat.type}</span>
      <button class="btn btn--ghost btn--icon btn--sm cat-delete-btn" data-id="${cat.id}" title="Delete category">✕</button>
    </div>
  `;
}
