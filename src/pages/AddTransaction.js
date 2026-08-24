/* ============================================
   ADD TRANSACTION PAGE
   ============================================ */

import { renderTransactionForm } from '../components/TransactionForm.js';

export function renderAddTransaction(container, params = {}) {
  renderTransactionForm(container, null, null);
}
