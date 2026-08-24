/* ============================================
   FILTER BAR — Search, Filter & Sort
   ============================================ */

import { debounce } from '../utils/helpers.js';
import { store } from '../store/Store.js';

/**
 * Render a filter bar and return a function to get current filters.
 * @param {HTMLElement} container
 * @param {Function} onChange - Called when any filter changes
 * @returns {{ getFilters: () => object }}
 */
export function renderFilterBar(container, onChange) {
  const categories = store.getCategories();

  container.innerHTML = `
    <div class="filter-bar">
      <!-- Search -->
      <div class="filter-bar__search">
        <span class="filter-bar__search-icon">🔍</span>
        <input type="text" class="input" id="filter-search" placeholder="Search transactions..." />
      </div>

      <!-- Date Preset Chips -->
      <div class="filter-bar__chips" id="date-chips">
        <button class="chip chip--active" data-range="month">This Month</button>
        <button class="chip" data-range="week">This Week</button>
        <button class="chip" data-range="today">Today</button>
        <button class="chip" data-range="year">This Year</button>
        <button class="chip" data-range="all">All Time</button>
      </div>
    </div>

    <div class="filter-bar" style="margin-top: var(--space-3);">
      <!-- Type Filter -->
      <select class="input" id="filter-type" style="max-width: 150px;">
        <option value="">All Types</option>
        <option value="expense">Expenses</option>
        <option value="income">Income</option>
      </select>

      <!-- Category Filter -->
      <select class="input" id="filter-category" style="max-width: 180px;">
        <option value="">All Categories</option>
        ${categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </select>

      <!-- Sort -->
      <select class="input" id="filter-sort" style="max-width: 160px;">
        <option value="date-desc">Date (Newest)</option>
        <option value="date-asc">Date (Oldest)</option>
        <option value="amount-desc">Amount (High)</option>
        <option value="amount-asc">Amount (Low)</option>
        <option value="category-asc">Category (A-Z)</option>
      </select>
    </div>
  `;

  let currentRange = 'month';

  // Date chips
  container.querySelector('#date-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    currentRange = chip.dataset.range;
    container.querySelectorAll('#date-chips .chip').forEach(c => c.classList.remove('chip--active'));
    chip.classList.add('chip--active');
    onChange(getFilters());
  });

  // Other filter changes
  ['filter-type', 'filter-category', 'filter-sort'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('change', () => onChange(getFilters()));
  });

  // Debounced search
  const searchInput = container.querySelector('#filter-search');
  searchInput.addEventListener('input', debounce(() => onChange(getFilters()), 300));

  function getFilters() {
    const [sortBy, sortDir] = (container.querySelector('#filter-sort').value || 'date-desc').split('-');
    const { from, to } = _getDateRange(currentRange);

    return {
      search: searchInput.value.trim(),
      type: container.querySelector('#filter-type').value || null,
      category: container.querySelector('#filter-category').value || null,
      dateFrom: from,
      dateTo: to,
      sortBy,
      sortDir,
      range: currentRange,
    };
  }

  return { getFilters };
}

function _getDateRange(preset) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'week': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { from: d.toISOString().split('T')[0], to: today };
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      return { from, to };
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      return { from, to: today };
    }
    case 'all':
    default:
      return { from: null, to: null };
  }
}
