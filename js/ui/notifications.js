/**
 * Notifications UI Module
 * Handles toast notifications and user feedback messages
 */

/**
 * Shows a toast notification to the user
 * @param {string} message - Message to display
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const toast = createToastElement(message, type);
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.animation = 'slideUp 0.3s ease';
  });

  // Auto-remove after duration
  setTimeout(() => {
    hideNotification(toast);
  }, duration);
}

/**
 * Creates a toast element
 * @param {string} message - Message to display
 * @param {string} type - Notification type
 * @returns {HTMLElement} Toast element
 */
function createToastElement(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Base styles
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--card)',
    border: '1px solid var(--border)',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    zIndex: 'var(--z-toast)',
    maxWidth: '90vw',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text)',
    pointerEvents: 'auto',
  });

  // Type-specific border colors
  const borderColors = {
    success: 'var(--green)',
    error: 'var(--red)',
    warning: 'var(--yellow)',
    info: 'var(--accent)',
  };

  if (borderColors[type]) {
    toast.style.borderColor = borderColors[type];
    toast.style.borderLeftWidth = '4px';
  }

  return toast;
}

/**
 * Hides and removes a toast notification
 * @param {HTMLElement} toast - Toast element to hide
 */
function hideNotification(toast) {
  toast.style.animation = 'slideDown 0.3s ease';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Shows a success notification
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration) {
  showNotification(message, 'success', duration);
}

/**
 * Shows an error notification
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
export function showError(message, duration) {
  showNotification(message, 'error', duration);
}

/**
 * Shows a warning notification
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export function showWarning(message, duration) {
  showNotification(message, 'warning', duration);
}

/**
 * Shows an info notification
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration) {
  showNotification(message, 'info', duration);
}

/**
 * Clears all active notifications
 */
export function clearAllNotifications() {
  const toasts = document.querySelectorAll('.toast');
  toasts.forEach(toast => hideNotification(toast));
}
