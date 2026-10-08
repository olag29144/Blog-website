const PostPage = (() => {
  function render(container, params) {
    const postId = params.id;
    const post = DB.getPostById(postId);

    if (!post) {
      container.innerHTML = `
        <div class="empty-state" style="padding-top:var(--space-24)">
          <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <h2 class="empty-state-title">Post not found</h2>
          <p class="empty-state-text">This post may have been deleted or the link is incorrect.</p>
          <button class="btn btn-primary" onclick="Router.navigate('/')">Go Home</button>
        </div>`;
      return;
    }

    const author = DB.getUserById(post.authorId);
    const user = Auth.getCurrentUser();
    const likeCount = DB.getPostLikeCount(postId);
    const commentCount = DB.getCommentsByPost(postId).length;
    const isLiked = user ? DB.isPostLikedBy(postId, user.id) : false;
    const isSaved = user ? DB.isPostSavedBy(postId, user.id) : false;
    const isFollowingAuthor = user && author ? DB.isFollowing(user.id, author.id) : false;
    const isSelf = user && author && user.id === author.id;
    const readTime = Utils.calcReadTime(post.content);
    const viewCount = DB.incrementView(postId);
    const related = DB.getPublishedPostsByUser(post.authorId).filter(p => p.id !== postId).slice(0, 3);

    document.title = `${post.title} — Gabby Blogs`;

    container.innerHTML = `
      <div class="post-page">
        <article class="post-article">
          ${post.status === 'draft' ? `
            <div class="draft-banner">
              <span style="display:flex;align-items:center;gap:var(--space-2)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Draft — not visible to others
              </span>
              ${isSelf ? `<button class="btn btn-primary btn-sm" onclick="Router.navigate('/editor?id=${postId}')">Edit &amp; Publish</button>` : ''}
            </div>` : ''}

          <header class="post-article-header">
            ${post.category ? `<div class="post-category-badge"><span class="badge badge-accent">${Utils.escapeHtml(post.category)}</span></div>` : ''}
            <h1 class="post-title">${Utils.escapeHtml(post.title)}</h1>
            ${post.subtitle ? `<p class="post-subtitle">${Utils.escapeHtml(post.subtitle)}</p>` : ''}
          </header>

          <div class="post-author-row">
            <div class="post-author-info">
              <button onclick="Router.navigate('/profile/${author ? author.username : ''}')" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0" aria-label="View ${author ? author.name : 'author'} profile">
                ${Utils.renderAvatar(author, 'avatar-md')}
              </button>
              <div class="post-author-details">
                <span class="post-author-name" onclick="Router.navigate('/profile/${author ? author.username : ''}')">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
                <div class="post-meta-row">
                  <span>${Utils.formatFullDate(post.publishedAt || post.createdAt)}</span>
                  <span class="dot-separator"></span>
                  <span>${readTime} min read</span>
                  <span class="dot-separator"></span>
                  <span>${Utils.formatNumber(viewCount)} views</span>
                </div>
              </div>
            </div>
            <div class="post-actions-row">
              <button class="post-action ${isLiked ? 'active-like' : ''}" id="post-like-btn" onclick="PostPageActions.toggleLike('${postId}')" aria-label="${isLiked ? 'Unlike' : 'Like'} post">
                <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span id="post-like-count">${Utils.formatNumber(likeCount)}</span>
              </button>
              <button class="post-action ${isSaved ? 'active-save' : ''}" id="post-save-btn" onclick="PostPageActions.toggleSave('${postId}')" aria-label="${isSaved ? 'Unsave' : 'Save'} post">
                <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <span id="post-save-label">${isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <div style="position:relative" id="post-share-wrapper">
                <button class="post-action" onclick="PostPageActions.share('${postId}')" aria-label="Share post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              </div>
              ${isSelf ? `
                <button class="post-action" onclick="Router.navigate('/editor?id=${postId}')" aria-label="Edit post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button class="post-action" style="color:var(--color-danger);border-color:transparent" onclick="PostPageActions.deletePost('${postId}')" aria-label="Delete post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>` : ''}
            </div>
          </div>

          ${post.coverImage ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-featured-image" />` : ''}

          <div class="article-content">${renderContent(post.content)}</div>

          <div id="post-comments-root"></div>
        </article>

        <aside class="post-sidebar" aria-label="Post sidebar">
          <div class="post-sidebar-card">
            <p class="post-sidebar-card-title">Written by</p>
            <div style="text-align:center">
              <button onclick="Router.navigate('/profile/${author ? author.username : ''}')" style="background:none;border:none;padding:0;cursor:pointer">
                ${Utils.renderAvatar(author, 'avatar-lg')}
              </button>
              <div class="author-card-name" onclick="Router.navigate('/profile/${author ? author.username : ''}')">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</div>
              ${author && author.bio ? `<p class="author-card-bio line-clamp-3">${Utils.escapeHtml(author.bio)}</p>` : ''}
              <div class="author-card-stats">
                <div class="author-card-stat">
                  <span class="author-card-stat-value">${Utils.formatNumber(DB.getPublishedPostsByUser(author ? author.id : '').length)}</span>
                  <span class="author-card-stat-label">Posts</span>
                </div>
                <div class="author-card-stat">
                  <span class="author-card-stat-value">${Utils.formatNumber(DB.getFollowerCount(author ? author.id : ''))}</span>
                  <span class="author-card-stat-label">Followers</span>
                </div>
              </div>
              ${!isSelf && author ? `
                <button class="follow-btn ${isFollowingAuthor ? 'following' : 'not-following'}" id="sidebar-follow-btn"
                  style="width:100%;justify-content:center;margin-top:var(--space-4)"
                  onclick="PostPageActions.toggleFollow('${author.id}')"
                  aria-label="${isFollowingAuthor ? 'Unfollow' : 'Follow'} ${Utils.escapeHtml(author.name)}">
                  ${isFollowingAuthor ? 'Following' : 'Follow'}
                </button>` : ''}
            </div>
          </div>

          ${related.length > 0 ? `
            <div class="post-sidebar-card">
              <p class="post-sidebar-card-title">More from ${author ? Utils.escapeHtml(author.name.split(' ')[0]) : 'this author'}</p>
              ${related.map(r => `
                <div class="related-post-item" onclick="Router.navigate('/post/${r.id}')" role="article" tabindex="0">
                  ${r.coverImage
                    ? `<img src="${r.coverImage}" alt="${Utils.escapeHtml(r.title)}" class="related-post-image" loading="lazy" />`
                    : `<div class="related-post-image" style="display:flex;align-items:center;justify-content:center;background:var(--color-bg-3)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
                  }
                  <div>
                    <p class="related-post-title line-clamp-2">${Utils.escapeHtml(r.title)}</p>
                    <p class="related-post-meta">${Utils.formatDate(r.publishedAt)}</p>
                  </div>
                </div>
              `).join('')}
            </div>` : ''}
        </aside>
      </div>

      <div class="floating-actions" role="toolbar" aria-label="Post actions">
        <button class="floating-action ${isLiked ? 'liked' : ''}" id="float-like-btn" onclick="PostPageActions.toggleLike('${postId}')" aria-label="Like post">
          <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span id="float-like-count">${Utils.formatNumber(likeCount)}</span>
        </button>
        <button class="floating-action" onclick="document.getElementById('post-comments-root').scrollIntoView({behavior:'smooth'})" aria-label="Jump to comments">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${Utils.formatNumber(commentCount)}
        </button>
        <div class="floating-divider"></div>
        <button class="floating-action ${isSaved ? 'saved' : ''}" id="float-save-btn" onclick="PostPageActions.toggleSave('${postId}')" aria-label="${isSaved ? 'Unsave' : 'Save'} post">
          <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
        <button class="floating-action" onclick="PostPageActions.share('${postId}')" aria-label="Share post">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>
    `;

    Comments.render(postId, document.getElementById('post-comments-root'));

    return () => { document.title = 'Gabby Blogs'; };
  }

  function renderContent(content) {
    if (!content) return '<p>No content.</p>';
    return content.split('\n\n').map(block => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('### ')) return `<h3>${Utils.escapeHtml(t.slice(4))}</h3>`;
      if (t.startsWith('## ')) return `<h2>${Utils.escapeHtml(t.slice(3))}</h2>`;
      if (t.startsWith('# ')) return `<h1>${Utils.escapeHtml(t.slice(2))}</h1>`;
      if (t.startsWith('> ')) return `<blockquote><p>${Utils.escapeHtml(t.slice(2))}</p></blockquote>`;
      if (t.match(/^[-*] /m)) {
        const items = t.split('\n').filter(l => l.match(/^[-*] /));
        return `<ul>${items.map(i => `<li>${Utils.escapeHtml(i.replace(/^[-*] /, ''))}</li>`).join('')}</ul>`;
      }
      const inline = (str) => str
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>');
      return `<p>${t.split('\n').map(l => inline(Utils.escapeHtml(l))).join('<br>')}</p>`;
    }).join('');
  }

  const PostPageActions = {
    toggleLike(postId) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const liked = DB.togglePostLike(postId, user.id);
      const count = DB.getPostLikeCount(postId);
      ['post-like-btn', 'float-like-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.toggle('active-like', liked);
        btn.classList.toggle('liked', liked);
        btn.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
      });
      document.querySelectorAll('#post-like-count, #float-like-count').forEach(el => el.textContent = Utils.formatNumber(count));
      const post = DB.getPostById(postId);
      if (liked && post && post.authorId !== user.id) {
        DB.createNotification({ type: 'like', recipientId: post.authorId, actorId: user.id, postId, message: `${user.name} liked your post "${post.title}"` });
        Nav.update();
      }
    },
    toggleSave(postId) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const saved = DB.toggleSavePost(postId, user.id);
      ['post-save-btn', 'float-save-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.toggle('active-save', saved);
        btn.classList.toggle('saved', saved);
        btn.querySelector('svg').setAttribute('fill', saved ? 'currentColor' : 'none');
      });
      const label = document.getElementById('post-save-label');
      if (label) label.textContent = saved ? 'Saved' : 'Save';
      Toast.success(saved ? 'Post saved.' : 'Post removed from saved.');
    },
    share(postId) {
      const btn = document.querySelector('#post-share-wrapper button');
      if (btn) showShareMenu(postId, btn);
      else Utils.copyToClipboard(Utils.buildPostUrl(postId)).then(() => Toast.success('Link copied!'));
    },
    toggleFollow(authorId) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const following = DB.toggleFollow(user.id, authorId);
      const btn = document.getElementById('sidebar-follow-btn');
      if (btn) {
        btn.className = `follow-btn ${following ? 'following' : 'not-following'}`;
        btn.style.cssText = 'width:100%;justify-content:center;margin-top:var(--space-4)';
        btn.textContent = following ? 'Following' : 'Follow';
      }
      if (following) {
        DB.createNotification({ type: 'follow', recipientId: authorId, actorId: user.id, message: `${user.name} started following you` });
        Nav.update();
      }
    },
    deletePost(postId) {
      showConfirmModal('Delete this post?', 'This will permanently remove the post and all its comments. This cannot be undone.', () => {
        DB.deletePost(postId);
        Toast.success('Post deleted.');
        Router.navigate('/');
      });
    }
  };

  window.PostPageActions = PostPageActions;
  return { render };
})();
