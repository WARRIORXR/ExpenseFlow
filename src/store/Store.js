/* ============================================
   STORE — Central State Management
   ============================================ */

import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS, generateSampleData } from './defaults.js';

const STORAGE_KEY = 'expenseflow_data';
const SAVE_DEBOUNCE_MS = 300;

class Store {
  constructor() {
    this._listeners = {};
    this._saveTimer = null;
    this._data = this._load();
  }

  /* ── Persistence ── */

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure all required keys exist (migration-safe)
        return {
          transactions: parsed.transactions || [],
          budgets: parsed.budgets || [],
          categories: parsed.categories || [...DEFAULT_CATEGORIES],
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          goals: parsed.goals || [],
        };
      }
    } catch (e) {
      console.warn('Failed to load store:', e);
    }

    // First launch — seed with sample data
    const sample = generateSampleData();
    return {
      transactions: sample.transactions,
      budgets: sample.budgets,
      categories: [...DEFAULT_CATEGORIES],
      settings: { ...DEFAULT_SETTINGS },
      goals: [],
    };
  }

  _save() {
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
      } catch (e) {
        console.error('Failed to save store:', e);
      }
    }, SAVE_DEBOUNCE_MS);
  }

  /* ── Pub/Sub ── */

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    };
  }

  _emit(event, data) {
    (this._listeners[event] || []).forEach(cb => cb(data));
    (this._listeners['*'] || []).forEach(cb => cb(event, data));
  }

  /* ── Transactions CRUD ── */

  getTransactions() {
    return [...this._data.transactions];
  }

  getTransactionById(id) {
    return this._data.transactions.find(t => t.id === id) || null;
  }

  addTransaction(transaction) {
    const tx = {
      id: this._uid(),
      createdAt: new Date().toISOString(),
      tags: [],
      recurring: false,
      recurringFreq: null,
      ...transaction,
    };
    this._data.transactions.unshift(tx);
    this._save();
    this._emit('transaction:add', tx);
    this._emit('data:change');
    return tx;
  }

  updateTransaction(id, updates) {
    const idx = this._data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this._data.transactions[idx] = { ...this._data.transactions[idx], ...updates };
    this._save();
    this._emit('transaction:update', this._data.transactions[idx]);
    this._emit('data:change');
    return this._data.transactions[idx];
  }

  deleteTransaction(id) {
    const idx = this._data.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const [removed] = this._data.transactions.splice(idx, 1);
    this._save();
    this._emit('transaction:delete', removed);
    this._emit('data:change');
    return true;
  }

  deleteTransactions(ids) {
    const idSet = new Set(ids);
    this._data.transactions = this._data.transactions.filter(t => !idSet.has(t.id));
    this._save();
    this._emit('transaction:bulk-delete', ids);
    this._emit('data:change');
  }

  duplicateTransaction(id) {
    const original = this.getTransactionById(id);
    if (!original) return null;
    const { id: _id, createdAt, ...rest } = original;
    return this.addTransaction({ ...rest, date: new Date().toISOString().split('T')[0] });
  }

  /* ── Filtered / Computed Transactions ── */

  getFilteredTransactions({ type, category, dateFrom, dateTo, search, sortBy, sortDir } = {}) {
    let list = this.getTransactions();

    if (type) list = list.filter(t => t.type === type);
    if (category) list = list.filter(t => t.category === category);
    if (dateFrom) list = list.filter(t => t.date >= dateFrom);
    if (dateTo) list = list.filter(t => t.date <= dateTo);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'amount':
        list.sort((a, b) => dir * (a.amount - b.amount));
        break;
      case 'category':
        list.sort((a, b) => dir * a.category.localeCompare(b.category));
        break;
      case 'date':
      default:
        list.sort((a, b) => dir * a.date.localeCompare(b.date));
        break;
    }

    return list;
  }

  /* ── Computed Stats ── */

  getTotalIncome(dateFrom, dateTo) {
    return this._sumByType('income', dateFrom, dateTo);
  }

  getTotalExpense(dateFrom, dateTo) {
    return this._sumByType('expense', dateFrom, dateTo);
  }

  getBalance(dateFrom, dateTo) {
    return this.getTotalIncome(dateFrom, dateTo) - this.getTotalExpense(dateFrom, dateTo);
  }

  getCategoryBreakdown(type = 'expense', dateFrom, dateTo) {
    const txs = this.getFilteredTransactions({ type, dateFrom, dateTo });
    const map = {};
    txs.forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  getMonthlyData(numMonths = 6) {
    const now = new Date();
    const months = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const from = d.toISOString().split('T')[0];
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      const label = d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
      months.push({
        label,
        from,
        to,
        income: this.getTotalIncome(from, to),
        expense: this.getTotalExpense(from, to),
      });
    }
    return months;
  }

  getDailySpending(days = 30) {
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTotal = this._data.transactions
        .filter(t => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);
      result.push({
        date: dateStr,
        label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        amount: dayTotal,
      });
    }
    return result;
  }

  getQuickStats(dateFrom, dateTo) {
    const breakdown = this.getCategoryBreakdown('expense', dateFrom, dateTo);
    const totalIncome = this.getTotalIncome(dateFrom, dateTo);
    const totalExpense = this.getTotalExpense(dateFrom, dateTo);

    const from = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = dateTo ? new Date(dateTo) : new Date();
    const days = Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)));

    return {
      highestCategory: breakdown[0] || null,
      avgDailySpending: totalExpense / days,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      totalTransactions: this.getFilteredTransactions({ dateFrom, dateTo }).length,
    };
  }

  /* ── Budgets ── */

  getBudgets() {
    return [...this._data.budgets];
  }

  addBudget(budget) {
    const b = { id: this._uid(), period: 'monthly', ...budget };
    this._data.budgets.push(b);
    this._save();
    this._emit('budget:add', b);
    this._emit('data:change');
    return b;
  }

  updateBudget(id, updates) {
    const idx = this._data.budgets.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this._data.budgets[idx] = { ...this._data.budgets[idx], ...updates };
    this._save();
    this._emit('budget:update', this._data.budgets[idx]);
    this._emit('data:change');
    return this._data.budgets[idx];
  }

  deleteBudget(id) {
    this._data.budgets = this._data.budgets.filter(b => b.id !== id);
    this._save();
    this._emit('budget:delete', id);
    this._emit('data:change');
  }

  getBudgetStatus(dateFrom, dateTo) {
    const budgets = this.getBudgets();
    const breakdown = this.getCategoryBreakdown('expense', dateFrom, dateTo);
    const breakdownMap = {};
    breakdown.forEach(b => { breakdownMap[b.category] = b.amount; });

    const totalExpense = this.getTotalExpense(dateFrom, dateTo);

    return budgets.map(budget => {
      const spent = budget.category === 'overall'
        ? totalExpense
        : (breakdownMap[budget.category] || 0);
      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      let status = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 80) status = 'warning';

      return { ...budget, spent, percentage, status };
    });
  }

  /* ── Categories ── */

  getCategories(type) {
    const cats = [...this._data.categories];
    if (type) return cats.filter(c => c.type === type);
    return cats;
  }

  getCategoryById(id) {
    return this._data.categories.find(c => c.id === id) || null;
  }

  addCategory(cat) {
    const c = { id: this._slugify(cat.name) + '_' + Date.now(), ...cat };
    this._data.categories.push(c);
    this._save();
    this._emit('category:add', c);
    return c;
  }

  deleteCategory(id) {
    this._data.categories = this._data.categories.filter(c => c.id !== id);
    this._save();
    this._emit('category:delete', id);
  }

  /* ── Settings ── */

  getSettings() {
    return { ...this._data.settings };
  }

  updateSettings(updates) {
    this._data.settings = { ...this._data.settings, ...updates };
    this._save();
    this._emit('settings:change', this._data.settings);
    return this._data.settings;
  }

  /* ── Data Management ── */

  exportData() {
    return JSON.stringify(this._data, null, 2);
  }

  importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.transactions && data.categories && data.settings) {
        this._data = data;
        this._save();
        this._emit('data:import');
        this._emit('data:change');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  clearAll() {
    this._data = {
      transactions: [],
      budgets: [],
      categories: [...DEFAULT_CATEGORIES],
      settings: { ...DEFAULT_SETTINGS },
      goals: [],
    };
    this._save();
    this._emit('data:clear');
    this._emit('data:change');
  }

  /* ── Internal Helpers ── */

  _sumByType(type, dateFrom, dateTo) {
    return this._data.transactions
      .filter(t => t.type === type
        && (!dateFrom || t.date >= dateFrom)
        && (!dateTo || t.date <= dateTo))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  _uid() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  _slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  }
}

// Singleton
export const store = new Store();
