const Utils = (() => {
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }

  function formatFullDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function calcReadTime(content) {
    const words = content ? content.trim().split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 200);
    return minutes < 1 ? 1 : minutes;
  }

  function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  function countChars(text) {
    return text ? text.length : 0;
  }

  function excerpt(content, maxLength = 160) {
    if (!content) return '';
    const plain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (plain.length <= maxLength) return plain;
    return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  function sanitizeContent(html) {
    const allowed = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'hr'];
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.querySelectorAll('*').forEach(el => {
      if (!allowed.includes(el.tagName.toLowerCase())) {
        el.replaceWith(document.createTextNode(el.textContent));
      }
    });
    return temp.innerHTML;
  }

  function nl2br(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getAvatarColor(name) {
    const colors = [
      '#16a34a', '#2563eb', '#9333ea', '#dc2626',
      '#d97706', '#0891b2', '#be185d', '#059669'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  function renderAvatar(user, sizeClass = 'avatar-md') {
    if (!user) {
      return `<div class="avatar ${sizeClass}" style="background:#e7e5e4">?</div>`;
    }
    if (user.avatar && user.avatar.startsWith('data:')) {
      return `<img src="${user.avatar}" alt="${escapeHtml(user.name)}" class="avatar ${sizeClass}" />`;
    }
    const initials = getInitials(user.name);
    const bg = getAvatarColor(user.name);
    return `<div class="avatar ${sizeClass}" style="background:${bg};color:#fff">${initials}</div>`;
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function buildPostUrl(postId) {
    return `${location.origin}${location.pathname}#/post/${postId}`;
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  }

  function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function onOutsideClick(element, callback) {
    const handler = (e) => {
      if (!element.contains(e.target)) {
        callback(e);
        document.removeEventListener('click', handler);
      }
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return handler;
  }

  function removeOutsideClick(handler) {
    document.removeEventListener('click', handler);
  }

  function categoryEmoji(category) {
    const map = {
      Technology: '💻', Programming: '⌨️', Business: '💼',
      Education: '📚', Lifestyle: '🌿', Travel: '✈️',
      Entertainment: '🎬', Health: '🏃', Finance: '📈',
      Design: '🎨', 'Personal Development': '🧠', News: '📰', Other: '💡'
    };
    return map[category] || '💡';
  }

  return {
    generateId, formatDate, formatFullDate, calcReadTime, countWords,
    countChars, excerpt, slugify, escapeHtml, sanitizeContent, nl2br,
    getInitials, getAvatarColor, renderAvatar, debounce, throttle,
    copyToClipboard, buildPostUrl, formatNumber, autoResizeTextarea,
    onOutsideClick, removeOutsideClick, categoryEmoji
  };
})();
