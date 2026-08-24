/* ============================================
   SIDEBAR — Navigation & Quick Balance
   ============================================ */

import { store } from '../store/Store.js';
import { formatCurrency, getCurrentMonthRange } from '../utils/helpers.js';

/**
 * Initialize sidebar interactions and balance footer.
 */
export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeBtn = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar.classList.add('sidebar--open');
    overlay.classList.add('sidebar-overlay--visible');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('sidebar--open');
    overlay.classList.remove('sidebar-overlay--visible');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', openSidebar);
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Close on nav link click (mobile)
  sidebar.querySelectorAll('.sidebar__link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });

  // Update sidebar footer with balance
  updateSidebarBalance();
  store.on('data:change', updateSidebarBalance);
}

/**
 * Update the sidebar footer with current balance info.
 */
function updateSidebarBalance() {
  const footer = document.getElementById('sidebar-footer');
  if (!footer) return;

  const { from, to } = getCurrentMonthRange();
  const income = store.getTotalIncome(from, to);
  const expense = store.getTotalExpense(from, to);
  const balance = income - expense;

  footer.innerHTML = `
    <div style="font-size: var(--font-size-sm); color: var(--color-text-tertiary); margin-bottom: var(--space-2);">
      This Month
    </div>
    <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: ${balance >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
      ${formatCurrency(balance)}
    </div>
    <div style="display: flex; gap: var(--space-4); margin-top: var(--space-2); font-size: var(--font-size-sm);">
      <span style="color: var(--color-income);">↑ ${formatCurrency(income, true)}</span>
      <span style="color: var(--color-expense);">↓ ${formatCurrency(expense, true)}</span>
    </div>
  `;
}
