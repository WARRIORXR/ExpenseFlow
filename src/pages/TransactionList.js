/* ============================================
   TRANSACTION LIST PAGE
   ============================================ */

import { store } from '../store/Store.js';
import { formatCurrency, formatDate, exportCSV, exportPDF } from '../utils/helpers.js';
import { renderFilterBar } from '../components/FilterBar.js';
import { renderTransactionForm } from '../components/TransactionForm.js';
import { showModal, confirmDialog } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';
import { router } from '../utils/router.js';

const PAGE_SIZE = 20;

export function renderTransactionList(container) {
  let currentFilters = null;
  let visibleCount = PAGE_SIZE;
  let selectedIds = new Set();
  let bulkMode = false;

  container.innerHTML = `
    <div class="transaction-list-page">
      <div class="transaction-list-page__header">
        <h2 style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">💳 Transactions</h2>
        <div class="transaction-list-page__actions">
          <button class="btn btn--ghost btn--sm" id="bulk-toggle-btn">☑️ Select</button>
          <button class="btn btn--ghost btn--sm" id="export-csv-btn">📄 CSV</button>
          <button class="btn btn--ghost btn--sm" id="export-pdf-btn">📋 PDF</button>
        </div>
      </div>

      <div id="filter-container"></div>

      <div id="bulk-bar" style="display: none;"></div>

      <div id="transaction-list-container" class="transaction-list"></div>

      <div id="load-more-container" class="load-more" style="display: none;">
        <button class="btn btn--ghost" id="load-more-btn">Load More</button>
      </div>
    </div>
  `;

  // Render filter bar
  const filterContainer = container.querySelector('#filter-container');
  const { getFilters } = renderFilterBar(filterContainer, (filters) => {
    currentFilters = filters;
    visibleCount = PAGE_SIZE;
    renderList();
  });

  // Initialize with default filters
  currentFilters = getFilters();

  function renderList() {
    const listContainer = container.querySelector('#transaction-list-container');
    const loadMoreContainer = container.querySelector('#load-more-container');

    const allTxs = store.getFilteredTransactions(currentFilters);
    const visibleTxs = allTxs.slice(0, visibleCount);

    if (visibleTxs.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-state__icon">🔍</span>
          <span class="empty-state__title">No transactions found</span>
          <span class="empty-state__text">Try adjusting your filters or add a new transaction</span>
          <button class="btn btn--primary" onclick="location.hash='#/add'">➕ Add Transaction</button>
        </div>
      `;
      loadMoreContainer.style.display = 'none';
      return;
    }

    // Group by date
    const groups = {};
    visibleTxs.forEach(tx => {
      const dateKey = tx.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });

    listContainer.innerHTML = Object.entries(groups).map(([dateKey, txs]) => `
      <div class="transaction-list__group">
        <div class="date-header">${formatDate(dateKey, 'relative')} — ${formatDate(dateKey, 'medium')}</div>
        ${txs.map(tx => renderTransactionItem(tx)).join('')}
      </div>
    `).join('');

    // Load more
    loadMoreContainer.style.display = visibleCount < allTxs.length ? 'flex' : 'none';

    // Attach item event listeners
    attachItemListeners(listContainer);
    updateBulkBar();
  }

  function renderTransactionItem(tx) {
    const cat = store.getCategoryById(tx.category);
    const iconBg = cat ? cat.color + '20' : 'var(--color-accent-subtle)';

    return `
      <div class="transaction-item" data-id="${tx.id}">
        ${bulkMode ? `<input type="checkbox" class="transaction-item__checkbox" data-id="${tx.id}" ${selectedIds.has(tx.id) ? 'checked' : ''} />` : ''}
        <div class="transaction-item__icon" style="background: ${iconBg}; ${bulkMode ? 'margin-left: var(--space-6);' : ''}">
          ${cat ? cat.icon : '📦'}
        </div>
        <div class="transaction-item__details">
          <div class="transaction-item__title truncate">${tx.description || cat?.name || tx.category}</div>
          <div class="transaction-item__meta">
            <span>${cat?.name || tx.category}</span>
            ${tx.recurring ? '<span>🔄</span>' : ''}
            ${tx.tags?.length ? `<span>🏷️ ${tx.tags.join(', ')}</span>` : ''}
          </div>
        </div>
        <div class="transaction-item__amount transaction-item__amount--${tx.type}">
          ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
        </div>
        <div class="transaction-item__actions">
          <button class="btn btn--ghost btn--icon btn--sm action-edit" data-id="${tx.id}" title="Edit">✏️</button>
          <button class="btn btn--ghost btn--icon btn--sm action-duplicate" data-id="${tx.id}" title="Duplicate">📋</button>
          <button class="btn btn--ghost btn--icon btn--sm action-delete" data-id="${tx.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }

  function attachItemListeners(listContainer) {
    // Edit
    listContainer.querySelectorAll('.action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tx = store.getTransactionById(btn.dataset.id);
        if (!tx) return;

        const formContainer = document.createElement('div');
        renderTransactionForm(formContainer, tx, () => {
          modal.close();
          renderList();
        });

        // Remove the outer card wrapper for modal context
        const formEl = formContainer.querySelector('.add-transaction');

        const modal = showModal({
          title: '✏️ Edit Transaction',
          content: formEl || formContainer,
          actions: [],
        });
      });
    });

    // Duplicate
    listContainer.querySelectorAll('.action-duplicate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        store.duplicateTransaction(btn.dataset.id);
        showToast('Transaction duplicated!', 'success');
        renderList();
      });
    });

    // Delete
    listContainer.querySelectorAll('.action-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = await confirmDialog(
          'Delete Transaction',
          'Are you sure you want to delete this transaction? This action cannot be undone.',
          { danger: true, confirmText: 'Delete' }
        );
        if (confirmed) {
          store.deleteTransaction(btn.dataset.id);
          showToast('Transaction deleted', 'success');
          renderList();
        }
      });
    });

    // Bulk checkboxes
    listContainer.querySelectorAll('.transaction-item__checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          selectedIds.add(e.target.dataset.id);
        } else {
          selectedIds.delete(e.target.dataset.id);
        }
        updateBulkBar();
      });
    });
  }

  function updateBulkBar() {
    const bar = container.querySelector('#bulk-bar');
    if (!bulkMode || selectedIds.size === 0) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'block';
    bar.innerHTML = `
      <div class="bulk-actions">
        <span class="bulk-actions__count">${selectedIds.size} selected</span>
        <button class="btn btn--danger btn--sm" id="bulk-delete-btn">🗑️ Delete Selected</button>
        <button class="btn btn--ghost btn--sm" id="bulk-clear-btn">Clear Selection</button>
      </div>
    `;

    bar.querySelector('#bulk-delete-btn').addEventListener('click', async () => {
      const confirmed = await confirmDialog(
        'Delete Selected',
        `Are you sure you want to delete ${selectedIds.size} transactions?`,
        { danger: true, confirmText: 'Delete All' }
      );
      if (confirmed) {
        store.deleteTransactions([...selectedIds]);
        selectedIds.clear();
        showToast('Transactions deleted', 'success');
        renderList();
      }
    });

    bar.querySelector('#bulk-clear-btn').addEventListener('click', () => {
      selectedIds.clear();
      renderList();
    });
  }

  // Bulk toggle
  container.querySelector('#bulk-toggle-btn').addEventListener('click', () => {
    bulkMode = !bulkMode;
    selectedIds.clear();
    container.querySelector('#bulk-toggle-btn').textContent = bulkMode ? '✕ Cancel' : '☑️ Select';
    renderList();
  });

  // Export CSV
  container.querySelector('#export-csv-btn').addEventListener('click', () => {
    const txs = store.getFilteredTransactions(currentFilters);
    exportCSV(txs);
    showToast('CSV exported!', 'success');
  });

  // Export PDF
  container.querySelector('#export-pdf-btn').addEventListener('click', async () => {
    const txs = store.getFilteredTransactions(currentFilters);
    await exportPDF(txs);
    showToast('PDF exported!', 'success');
  });

  // Load more
  container.querySelector('#load-more-btn').addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderList();
  });

  // Initial render
  renderList();
}
