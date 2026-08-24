/* ============================================
   TOAST — Notification Toast System
   ============================================ */

const TOAST_DURATION = 4000;
const MAX_TOASTS = 5;

let toastQueue = [];

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [duration=4000]
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Limit max toasts
  while (toastQueue.length >= MAX_TOASTS) {
    const oldest = toastQueue.shift();
    oldest.remove();
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type]}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close" aria-label="Close">✕</button>
    <div class="toast__progress">
      <div class="toast__progress-bar" style="animation-duration: ${duration}ms;"></div>
    </div>
  `;

  // Close button
  toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));

  container.appendChild(toast);
  toastQueue.push(toast);

  // Auto dismiss
  const timer = setTimeout(() => dismiss(toast), duration);
  toast._timer = timer;
}

function dismiss(toast) {
  clearTimeout(toast._timer);
  toast.style.animation = 'toastOut 0.3s ease forwards';
  setTimeout(() => {
    toast.remove();
    toastQueue = toastQueue.filter(t => t !== toast);
  }, 300);
}

// Inject toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: var(--color-bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-xl);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
    pointer-events: all;
    position: relative;
    overflow: hidden;
    min-width: 280px;
    max-width: 420px;
    animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    backdrop-filter: blur(12px);
  }

  .toast--success { border-left: 3px solid var(--color-success); }
  .toast--error   { border-left: 3px solid var(--color-danger); }
  .toast--warning { border-left: 3px solid var(--color-warning); }
  .toast--info    { border-left: 3px solid var(--color-accent); }

  .toast__icon {
    font-size: 1.125rem;
    flex-shrink: 0;
  }

  .toast__message {
    flex: 1;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  .toast__close {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    flex-shrink: 0;
    transition: all var(--transition-fast);
  }

  .toast__close:hover {
    background: var(--color-accent-subtle);
    color: var(--color-text-primary);
  }

  .toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-border-subtle);
  }

  .toast__progress-bar {
    height: 100%;
    background: var(--color-accent);
    animation: toastProgress linear forwards;
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  }

  @keyframes toastProgress {
    from { width: 100%; }
    to { width: 0%; }
  }

  @media (max-width: 768px) {
    .toast {
      min-width: auto;
      max-width: none;
    }
  }
`;
document.head.appendChild(toastStyles);
