const SavedPage = (() => {
  function render(container) {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const savedEntries = DB.getSavedPostsForUser(user.id);
    const savedPosts = savedEntries.map(s => DB.getPostById(s.postId)).filter(Boolean);

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-inner">
          <h1 class="page-header-title">Saved Posts</h1>
          <p class="page-header-sub">${savedPosts.length === 0 ? 'Posts you save will appear here.' : `${savedPosts.length} saved ${savedPosts.length === 1 ? 'post' : 'posts'}`}</p>
        </div>
      </div>
      <div class="page-content">
        ${savedPosts.length === 0 ? renderEmpty() : `
          <div class="posts-list" id="saved-posts-list">
            ${savedPosts.map(p => renderSavedCard(p, user)).join('')}
          </div>`}
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h2 class="empty-state-title">Nothing saved yet</h2>
        <p class="empty-state-text">When you find a post worth keeping, tap the bookmark icon to save it here.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/')">Browse posts</button>
      </div>
    `;
  }

  function renderSavedCard(post, user) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const readTime = Utils.calcReadTime(post.content);
    const isLiked = DB.isPostLikedBy(post.id, user.id);

    return `
      <div class="post-card-h" id="saved-item-${post.id}" onclick="Router.navigate('/post/${post.id}')" role="article" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-h-image" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="post-card-h-image" style="display:flex;align-items:center;justify-content:center;background:var(--color-bg-3)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-h-content">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            ${Utils.renderAvatar(author, 'avatar-xs')}
            <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--color-text-3)">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
            ${post.category ? `<span class="dot-separator"></span><span class="badge badge-category" style="pointer-events:none">${Utils.escapeHtml(post.category)}</span>` : ''}
          </div>
          <h3 class="post-card-h-title line-clamp-2">${Utils.escapeHtml(post.title)}</h3>
          ${post.subtitle ? `<p class="post-card-h-excerpt line-clamp-2" style="font-size:var(--text-sm);color:var(--color-text-3)">${Utils.escapeHtml(post.subtitle)}</p>` : ''}
          <div class="post-card-h-meta" style="margin-top:auto">
            <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); SavedPageActions.toggleLike('${post.id}', this)">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>${Utils.formatNumber(likeCount)}</span>
            </span>
            <span class="post-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${Utils.formatNumber(commentCount)}
            </span>
            <span class="read-time">${readTime}m</span>
            <div style="margin-left:auto" onclick="event.stopPropagation()">
              <button class="post-action-btn saved" onclick="SavedPageActions.unsave('${post.id}')" aria-label="Remove from saved" title="Remove from saved" style="color:var(--color-accent)">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const SavedPageActions = {
    unsave(postId) {
      const user = Auth.getCurrentUser();
      DB.toggleSavePost(postId, user.id);
      const el = document.getElementById(`saved-item-${postId}`);
      if (el) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.2s';
        setTimeout(() => {
          el.remove();
          const list = document.getElementById('saved-posts-list');
          if (list && list.children.length === 0) {
            list.outerHTML = renderEmpty();
          }
          const sub = document.querySelector('.page-header-sub');
          const remaining = document.querySelectorAll('[id^="saved-item-"]').length;
          if (sub) sub.textContent = remaining === 0 ? 'Posts you save will appear here.' : `${remaining} saved ${remaining === 1 ? 'post' : 'posts'}`;
        }, 200);
      }
      Toast.success('Post removed from saved.');
    },
    toggleLike(postId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const liked = DB.togglePostLike(postId, user.id);
      const count = DB.getPostLikeCount(postId);
      el.classList.toggle('liked', liked);
      el.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
      el.querySelector('span').textContent = Utils.formatNumber(count);
    }
  };

  window.SavedPageActions = SavedPageActions;
  return { render };
})();
