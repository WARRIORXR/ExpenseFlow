/* ============================================
   MODAL — Reusable Modal & Confirm Dialog
   ============================================ */

/**
 * Show a modal dialog.
 * @param {object} options
 * @param {string} options.title - Modal title
 * @param {string|HTMLElement} options.content - HTML string or element
 * @param {Array} [options.actions] - Array of { label, class, onClick }
 * @param {boolean} [options.closeOnOverlay] - Close when clicking overlay
 * @returns {{ close: Function, element: HTMLElement }}
 */
export function showModal({ title, content, actions = [], closeOnOverlay = true }) {
  const container = document.getElementById('modal-container');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close" aria-label="Close">✕</button>
      </div>
      <div class="modal__body"></div>
      ${actions.length ? '<div class="modal__footer"></div>' : ''}
    </div>
  `;

  // Inject content
  const body = overlay.querySelector('.modal__body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }

  // Inject actions
  if (actions.length) {
    const footer = overlay.querySelector('.modal__footer');
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = `btn ${action.class || 'btn--ghost'}`;
      btn.textContent = action.label;
      btn.addEventListener('click', () => {
        if (action.onClick) action.onClick();
        if (action.autoClose !== false) close();
      });
      footer.appendChild(btn);
    });
  }

  function close() {
    const modal = overlay.querySelector('.modal');
    modal.style.animation = 'modalOut 0.2s ease forwards';
    overlay.style.animation = 'fadeOut 0.2s ease forwards';
    setTimeout(() => overlay.remove(), 200);
  }

  // Close button
  overlay.querySelector('.modal__close').addEventListener('click', close);

  // Overlay click
  if (closeOnOverlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  // Escape key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  container.appendChild(overlay);

  return { close, element: overlay };
}

/**
 * Show a confirmation dialog.
 * @param {string} title
 * @param {string} message
 * @param {object} [options]
 * @returns {Promise<boolean>}
 */
export function confirmDialog(title, message, options = {}) {
  return new Promise(resolve => {
    showModal({
      title,
      content: `<p style="color: var(--color-text-secondary); line-height: 1.6;">${message}</p>`,
      closeOnOverlay: false,
      actions: [
        {
          label: options.cancelText || 'Cancel',
          class: 'btn--ghost',
          onClick: () => resolve(false),
        },
        {
          label: options.confirmText || 'Confirm',
          class: options.danger ? 'btn--danger' : 'btn--primary',
          onClick: () => resolve(true),
        },
      ],
    });
  });
}

// Inject modal styles dynamically
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-bg-overlay);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    padding: var(--space-4);
    animation: modalOverlayIn 0.2s ease forwards;
  }

  .modal {
    background: var(--color-bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    width: 100%;
    max-width: 480px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .modal__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  .modal__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    transition: all var(--transition-fast);
  }

  .modal__close:hover {
    background: var(--color-accent-subtle);
    color: var(--color-text-primary);
  }

  .modal__body {
    padding: var(--space-6);
  }

  .modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid var(--color-border-subtle);
  }

  @keyframes fadeOut {
    to { opacity: 0; }
  }
`;
document.head.appendChild(modalStyles);
