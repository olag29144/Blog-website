const NotificationsPage = (() => {
  function render(container) {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const notifications = DB.getNotificationsForUser(user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-inner">
          <h1 class="page-header-title">Notifications</h1>
          <p class="page-header-sub">${unreadCount > 0 ? `${unreadCount} unread` : 'All caught up.'}</p>
        </div>
      </div>
      <div class="page-content" style="max-width:720px">
        ${notifications.length === 0 ? renderEmpty() : `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
            <span style="font-size:var(--text-sm);color:var(--color-text-3)">${notifications.length} notification${notifications.length === 1 ? '' : 's'}</span>
            ${unreadCount > 0 ? `<button class="btn btn-ghost btn-sm" onclick="NotificationsActions.markAllRead()">Mark all as read</button>` : ''}
          </div>
          <div class="notifications-list" id="notifications-list">
            ${notifications.map(n => renderNotification(n, user)).join('')}
          </div>`}
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <h2 class="empty-state-title">No notifications</h2>
        <p class="empty-state-text">When someone likes, comments on, or follows your posts you will see it here.</p>
      </div>
    `;
  }

  function renderNotification(notif, currentUser) {
    const actor = DB.getUserById(notif.actorId);
    const post = notif.postId ? DB.getPostById(notif.postId) : null;

    const iconMap = {
      like: { cls: 'notif-icon-like', svg: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` },
      comment: { cls: 'notif-icon-comment', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
      reply: { cls: 'notif-icon-reply', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>` },
      follow: { cls: 'notif-icon-follow', svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` }
    };

    const icon = iconMap[notif.type] || iconMap.comment;
    const destination = notif.postId ? `/post/${notif.postId}` : (actor ? `/profile/${actor.username}` : '/');

    return `
      <div class="notif-item ${notif.read ? '' : 'unread'}" id="notif-${notif.id}"
        onclick="NotificationsActions.handleClick('${notif.id}', '${destination}')"
        role="article" tabindex="0" aria-label="${Utils.escapeHtml(notif.message)}"
        style="cursor:pointer">
        <div class="notif-icon ${icon.cls}" aria-hidden="true">${icon.svg}</div>
        <div style="display:flex;align-items:flex-start;gap:var(--space-3);flex:1">
          ${Utils.renderAvatar(actor, 'avatar-xs')}
          <div class="notif-content">
            <p class="notif-text">${Utils.escapeHtml(notif.message)}</p>
            <p class="notif-time">${Utils.formatDate(notif.createdAt)}</p>
          </div>
        </div>
        ${!notif.read ? `<div class="unread-dot" aria-label="Unread"></div>` : ''}
      </div>
    `;
  }

  const NotificationsActions = {
    handleClick(notifId, destination) {
      DB.markNotificationRead(notifId);
      const el = document.getElementById(`notif-${notifId}`);
      if (el) {
        el.classList.remove('unread');
        const dot = el.querySelector('.unread-dot');
        if (dot) dot.remove();
      }
      Nav.update();
      Router.navigate(destination);
    },
    markAllRead() {
      const user = Auth.getCurrentUser();
      DB.markAllNotificationsRead(user.id);
      document.querySelectorAll('.notif-item.unread').forEach(el => {
        el.classList.remove('unread');
        el.querySelector('.unread-dot')?.remove();
      });
      const sub = document.querySelector('.page-header-sub');
      if (sub) sub.textContent = 'All caught up.';
      const markBtn = document.querySelector('[onclick="NotificationsActions.markAllRead()"]');
      if (markBtn) markBtn.remove();
      Nav.update();
      Toast.success('All notifications marked as read.');
    }
  };

  window.NotificationsActions = NotificationsActions;
  return { render };
})();
