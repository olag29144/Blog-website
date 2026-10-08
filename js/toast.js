const Toast = (() => {
  function show(message, type = 'default', duration = 3200) {
    const root = document.getElementById('toast-root');
    if (!root) return;

    const icons = {
      success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      default: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `${icons[type] || icons.default}<span>${Utils.escapeHtml(message)}</span>`;
    root.appendChild(toast);

    const remove = () => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 280);
    };

    const timer = setTimeout(remove, duration);
    toast.addEventListener('click', () => { clearTimeout(timer); remove(); });
  }

  function success(msg, duration) { show(msg, 'success', duration); }
  function error(msg, duration) { show(msg, 'error', duration); }
  function info(msg, duration) { show(msg, 'info', duration); }

  return { show, success, error, info };
})();
