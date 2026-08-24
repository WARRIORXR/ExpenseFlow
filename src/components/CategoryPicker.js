/* ============================================
   CATEGORY PICKER — Visual Category Selector
   ============================================ */

import { store } from '../store/Store.js';
import { showModal } from './Modal.js';
import { showToast } from './Toast.js';

/**
 * Show a modal to create a new custom category.
 * @param {'income'|'expense'} type
 * @param {Function} [onCreated]
 */
export function showCreateCategoryModal(type = 'expense', onCreated = null) {
  const emojis = ['💰', '🎮', '🍕', '☕', '🎨', '🏋️', '📱', '🎵', '🐾', '✂️', '🧹', '🎓', '🛒', '💊', '🏖️', '🎪'];
  const colors = ['#f97316', '#3b82f6', '#a855f7', '#ef4444', '#ec4899', '#f59e0b', '#6366f1', '#14b8a6', '#8b5cf6', '#22c55e', '#06b6d4', '#78716c'];

  const contentEl = document.createElement('div');
  contentEl.innerHTML = `
    <div class="input-group" style="margin-bottom: var(--space-4);">
      <label class="input-group__label">Category Name</label>
      <input type="text" class="input" id="new-cat-name" placeholder="e.g. Gym Membership" maxlength="30" />
    </div>

    <div class="input-group" style="margin-bottom: var(--space-4);">
      <label class="input-group__label">Choose Icon</label>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);" id="emoji-picker">
        ${emojis.map((e, i) => `
          <button type="button" class="btn btn--ghost btn--icon emoji-opt ${i === 0 ? 'chip--active' : ''}" data-emoji="${e}">${e}</button>
        `).join('')}
      </div>
    </div>

    <div class="input-group">
      <label class="input-group__label">Choose Color</label>
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);" id="color-picker">
        ${colors.map((c, i) => `
          <button type="button" class="color-opt ${i === 0 ? 'color-opt--active' : ''}" data-color="${c}"
                  style="width: 32px; height: 32px; border-radius: 50%; background: ${c}; border: 3px solid transparent; cursor: pointer; transition: all 0.15s;"></button>
        `).join('')}
      </div>
    </div>
  `;

  let selectedEmoji = emojis[0];
  let selectedColor = colors[0];

  // Emoji picker
  contentEl.querySelector('#emoji-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-emoji]');
    if (!btn) return;
    selectedEmoji = btn.dataset.emoji;
    contentEl.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('chip--active'));
    btn.classList.add('chip--active');
  });

  // Color picker
  contentEl.querySelector('#color-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-color]');
    if (!btn) return;
    selectedColor = btn.dataset.color;
    contentEl.querySelectorAll('.color-opt').forEach(b => {
      b.style.borderColor = 'transparent';
      b.classList.remove('color-opt--active');
    });
    btn.style.borderColor = 'white';
    btn.classList.add('color-opt--active');
  });

  const modal = showModal({
    title: `Create ${type === 'income' ? 'Income' : 'Expense'} Category`,
    content: contentEl,
    actions: [
      { label: 'Cancel', class: 'btn--ghost' },
      {
        label: 'Create',
        class: 'btn--primary',
        onClick: () => {
          const name = contentEl.querySelector('#new-cat-name').value.trim();
          if (!name) {
            showToast('Please enter a category name', 'error');
            return;
          }
          store.addCategory({
            name,
            icon: selectedEmoji,
            color: selectedColor,
            type,
          });
          showToast(`Category "${name}" created!`, 'success');
          if (onCreated) onCreated();
        },
      },
    ],
  });
}
