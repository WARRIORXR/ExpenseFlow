/* ============================================
   DEFAULTS — Categories, Settings, Sample Data
   ============================================ */

export const DEFAULT_CATEGORIES = [
  { id: 'food',           name: 'Food',           icon: '🍔', color: '#f97316', type: 'expense' },
  { id: 'transport',      name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'entertainment',  name: 'Entertainment',  icon: '🎬', color: '#a855f7', type: 'expense' },
  { id: 'bills',          name: 'Bills',          icon: '📄', color: '#ef4444', type: 'expense' },
  { id: 'healthcare',     name: 'Healthcare',     icon: '🏥', color: '#ec4899', type: 'expense' },
  { id: 'shopping',       name: 'Shopping',       icon: '🛍️', color: '#f59e0b', type: 'expense' },
  { id: 'education',      name: 'Education',      icon: '📚', color: '#6366f1', type: 'expense' },
  { id: 'travel',         name: 'Travel',         icon: '✈️', color: '#14b8a6', type: 'expense' },
  { id: 'rent',           name: 'Rent',           icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'utilities',      name: 'Utilities',      icon: '💡', color: '#64748b', type: 'expense' },
  { id: 'others_expense', name: 'Others',         icon: '📦', color: '#78716c', type: 'expense' },
  { id: 'salary',         name: 'Salary',         icon: '💼', color: '#22c55e', type: 'income' },
  { id: 'freelance',      name: 'Freelance',      icon: '💻', color: '#06b6d4', type: 'income' },
  { id: 'investment',     name: 'Investment',     icon: '📈', color: '#10b981', type: 'income' },
  { id: 'gift',           name: 'Gift',           icon: '🎁', color: '#f472b6', type: 'income' },
  { id: 'others_income',  name: 'Others',         icon: '💰', color: '#a3a3a3', type: 'income' },
];

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  currency: '₹',
  currencyCode: 'INR',
  dateFormat: 'DD/MM/YYYY',
  startOfWeek: 'monday',
};

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

/**
 * Generate sample data so the app looks rich on first launch.
 */
export function generateSampleData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const sampleTransactions = [
    // Current month
    { id: _uid(), type: 'income',  amount: 75000,  category: 'salary',        date: _d(year, month, 1),   description: 'Monthly Salary',       tags: ['work'], recurring: true, recurringFreq: 'monthly' },
    { id: _uid(), type: 'income',  amount: 15000,  category: 'freelance',     date: _d(year, month, 5),   description: 'Web Development Project', tags: ['freelance'] },
    { id: _uid(), type: 'expense', amount: 18000,  category: 'rent',          date: _d(year, month, 1),   description: 'Monthly Rent',         tags: ['housing'], recurring: true, recurringFreq: 'monthly' },
    { id: _uid(), type: 'expense', amount: 3500,   category: 'utilities',     date: _d(year, month, 3),   description: 'Electricity & Water Bill', tags: ['bills'] },
    { id: _uid(), type: 'expense', amount: 1200,   category: 'food',          date: _d(year, month, 4),   description: 'Grocery Shopping',     tags: ['essential'] },
    { id: _uid(), type: 'expense', amount: 800,    category: 'transport',     date: _d(year, month, 5),   description: 'Uber rides this week', tags: [] },
    { id: _uid(), type: 'expense', amount: 2500,   category: 'entertainment', date: _d(year, month, 7),   description: 'Movie & Dinner Out',   tags: ['weekend'] },
    { id: _uid(), type: 'expense', amount: 1500,   category: 'shopping',      date: _d(year, month, 8),   description: 'New Headphones',       tags: ['electronics'] },
    { id: _uid(), type: 'expense', amount: 5000,   category: 'healthcare',    date: _d(year, month, 10),  description: 'Doctor Visit & Medicines', tags: ['health'] },
    { id: _uid(), type: 'expense', amount: 900,    category: 'food',          date: _d(year, month, 12),  description: 'Restaurant Lunch',     tags: [] },
    { id: _uid(), type: 'income',  amount: 3000,   category: 'investment',    date: _d(year, month, 15),  description: 'Dividend Income',      tags: ['passive'] },
    { id: _uid(), type: 'expense', amount: 4500,   category: 'education',     date: _d(year, month, 14),  description: 'Online Course',        tags: ['learning'] },
    { id: _uid(), type: 'expense', amount: 700,    category: 'transport',     date: _d(year, month, 16),  description: 'Metro Card Recharge',  tags: [] },
    { id: _uid(), type: 'expense', amount: 2000,   category: 'shopping',      date: _d(year, month, 18),  description: 'Clothing',             tags: [] },
    { id: _uid(), type: 'expense', amount: 350,    category: 'food',          date: _d(year, month, 19),  description: 'Coffee & Snacks',      tags: [] },
    { id: _uid(), type: 'expense', amount: 1800,   category: 'bills',         date: _d(year, month, 20),  description: 'Internet + Phone Bill', tags: ['bills'], recurring: true, recurringFreq: 'monthly' },

    // Previous month
    { id: _uid(), type: 'income',  amount: 75000,  category: 'salary',        date: _d(year, month - 1, 1),  description: 'Monthly Salary',    tags: ['work'] },
    { id: _uid(), type: 'income',  amount: 8000,   category: 'freelance',     date: _d(year, month - 1, 10), description: 'Logo Design',       tags: ['freelance'] },
    { id: _uid(), type: 'expense', amount: 18000,  category: 'rent',          date: _d(year, month - 1, 1),  description: 'Monthly Rent',      tags: ['housing'] },
    { id: _uid(), type: 'expense', amount: 3200,   category: 'utilities',     date: _d(year, month - 1, 3),  description: 'Electricity Bill',  tags: ['bills'] },
    { id: _uid(), type: 'expense', amount: 6500,   category: 'food',          date: _d(year, month - 1, 5),  description: 'Monthly Groceries', tags: ['essential'] },
    { id: _uid(), type: 'expense', amount: 1500,   category: 'transport',     date: _d(year, month - 1, 8),  description: 'Fuel',              tags: [] },
    { id: _uid(), type: 'expense', amount: 4000,   category: 'entertainment', date: _d(year, month - 1, 12), description: 'Concert Tickets',   tags: ['fun'] },
    { id: _uid(), type: 'expense', amount: 3500,   category: 'shopping',      date: _d(year, month - 1, 15), description: 'Home Decor',        tags: [] },
    { id: _uid(), type: 'expense', amount: 2000,   category: 'healthcare',    date: _d(year, month - 1, 18), description: 'Dental Checkup',    tags: ['health'] },
    { id: _uid(), type: 'expense', amount: 12000,  category: 'travel',        date: _d(year, month - 1, 20), description: 'Weekend Trip',      tags: ['vacation'] },
    { id: _uid(), type: 'expense', amount: 1800,   category: 'bills',         date: _d(year, month - 1, 22), description: 'Internet + Phone',  tags: ['bills'] },

    // 2 months ago
    { id: _uid(), type: 'income',  amount: 75000,  category: 'salary',        date: _d(year, month - 2, 1),  description: 'Monthly Salary',    tags: ['work'] },
    { id: _uid(), type: 'expense', amount: 18000,  category: 'rent',          date: _d(year, month - 2, 1),  description: 'Monthly Rent',      tags: ['housing'] },
    { id: _uid(), type: 'expense', amount: 5500,   category: 'food',          date: _d(year, month - 2, 6),  description: 'Groceries',         tags: ['essential'] },
    { id: _uid(), type: 'expense', amount: 8000,   category: 'education',     date: _d(year, month - 2, 10), description: 'Textbooks',         tags: ['learning'] },
    { id: _uid(), type: 'expense', amount: 2200,   category: 'entertainment', date: _d(year, month - 2, 14), description: 'Streaming + Games', tags: [] },
    { id: _uid(), type: 'expense', amount: 3000,   category: 'utilities',     date: _d(year, month - 2, 4),  description: 'Electricity',       tags: ['bills'] },
    { id: _uid(), type: 'expense', amount: 1800,   category: 'bills',         date: _d(year, month - 2, 20), description: 'Internet + Phone',  tags: ['bills'] },
  ];

  const sampleBudgets = [
    { id: _uid(), category: 'food',          limit: 8000,  period: 'monthly' },
    { id: _uid(), category: 'transport',     limit: 3000,  period: 'monthly' },
    { id: _uid(), category: 'entertainment', limit: 5000,  period: 'monthly' },
    { id: _uid(), category: 'shopping',      limit: 5000,  period: 'monthly' },
    { id: _uid(), category: 'healthcare',    limit: 3000,  period: 'monthly' },
    { id: _uid(), category: 'bills',         limit: 6000,  period: 'monthly' },
    { id: _uid(), category: 'overall',       limit: 60000, period: 'monthly' },
  ];

  return { transactions: sampleTransactions, budgets: sampleBudgets };
}

/* Helpers */
let _counter = 0;
function _uid() {
  return `sample_${Date.now()}_${++_counter}_${Math.random().toString(36).slice(2, 7)}`;
}

function _d(y, m, d) {
  const date = new Date(y, m, d);
  return date.toISOString().split('T')[0];
}
