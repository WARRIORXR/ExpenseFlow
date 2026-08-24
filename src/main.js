/* ============================================
   MAIN — App Entry Point
   ============================================ */

import './styles/index.css';

import { store } from './store/Store.js';
import { router } from './utils/router.js';
import { initSidebar } from './components/Sidebar.js';

// Pages
import { renderDashboard } from './pages/Dashboard.js';
import { renderAddTransaction } from './pages/AddTransaction.js';
import { renderTransactionList } from './pages/TransactionList.js';
import { renderBudgetManager } from './pages/BudgetManager.js';
import { renderReports } from './pages/Reports.js';
import { renderSettings } from './pages/Settings.js';

/* ── Initialize App ── */
function init() {
  // Apply saved theme
  const settings = store.getSettings();
  document.documentElement.setAttribute('data-theme', settings.theme);
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.textContent = settings.theme === 'dark' ? '🌙' : '☀️';

  // Initialize sidebar
  initSidebar();

  // Register routes
  router.register('/', {
    title: 'Dashboard',
    render: (container) => renderDashboard(container),
  });

  router.register('/add', {
    title: 'Add Transaction',
    render: (container, params) => renderAddTransaction(container, params),
  });

  router.register('/transactions', {
    title: 'Transactions',
    render: (container) => renderTransactionList(container),
  });

  router.register('/budgets', {
    title: 'Budgets',
    render: (container) => renderBudgetManager(container),
  });

  router.register('/reports', {
    title: 'Reports',
    render: (container) => renderReports(container),
  });

  router.register('/settings', {
    title: 'Settings',
    render: (container) => renderSettings(container),
  });

  // FAB — quick add
  const fab = document.getElementById('fab');
  if (fab) {
    fab.addEventListener('click', () => {
      router.navigate('/add');
    });
  }

  // Theme toggle in topbar
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      store.updateSettings({ theme: next });
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K = Search (navigate to transactions)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      router.navigate('/transactions');
    }
    // Ctrl/Cmd + N = New transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      router.navigate('/add');
    }
  });

  // Re-render current page on data changes (debounced)
  let renderTimer;
  store.on('data:change', () => {
    // Update sidebar balance immediately (handled by sidebar component)
    // Re-render current page with a slight debounce
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      // Only re-render dashboard since other pages manage their own state
      if (router.getCurrentRoute() === '/') {
        const container = document.getElementById('page-content');
        if (container) renderDashboard(container);
      }
    }, 500);
  });
}

// Boot
init();
