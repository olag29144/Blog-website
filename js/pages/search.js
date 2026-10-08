const SearchPage = (() => {
  let searchTimer = null;

  function render(container, params) {
    const urlParams = new URLSearchParams(location.hash.split('?')[1] || '');
    const initialQuery = urlParams.get('q') || '';
    const initialType = urlParams.get('type') || 'all';
    const user = Auth.getCurrentUser();

    container.innerHTML = `
      <div class="search-page-header">
        <div class="search-page-header-inner">
          <h1 style="font-size:var(--text-3xl);font-weight:var(--fw-bold);color:var(--color-text);letter-spacing:-0.02em;margin-bottom:var(--space-2)">Search</h1>
          <p style="color:var(--color-text-3);font-size:var(--text-base)">Find posts, writers, and topics.</p>
          <div class="search-page-bar">
            <div class="search-page-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="search" class="search-page-input" id="search-input" placeholder="Search posts, writers, categories…" value="${Utils.escapeHtml(initialQuery)}" autocomplete="off" autocorrect="off" aria-label="Search" />
            <button class="search-clear ${initialQuery ? '' : 'hidden'}" id="search-clear-btn" onclick="SearchPageActions.clear()" aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="tabs" style="margin-top:var(--space-5);border-bottom:none;gap:var(--space-1)" role="tablist">
            ${['all', 'posts', 'writers', 'category'].map(t => `
              <button class="tab ${initialType === t ? 'active' : ''}" id="search-tab-${t}"
                onclick="SearchPageActions.setType('${t}')" role="tab" aria-selected="${initialType === t}">
                ${t.charAt(0).toUpperCase() + t.slice(1)}
              </button>`).join('')}
          </div>
        </div>
      </div>
      <div class="search-content" id="search-content">
        ${initialQuery ? '' : renderSuggestions()}
      </div>
    `;

    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', () => {
        const q = input.value.trim();
        const clearBtn = document.getElementById('search-clear-btn');
        if (clearBtn) clearBtn.classList.toggle('hidden', !q);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => runSearch(q, getCurrentType()), 300);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { input.value = ''; SearchPageActions.clear(); }
      });
      if (initialQuery) {
        setTimeout(() => runSearch(initialQuery, initialType), 0);
      }
    }
  }

  function getCurrentType() {
    const active = document.querySelector('.tabs .tab.active');
    return active ? active.id.replace('search-tab-', '') : 'all';
  }

  function runSearch(query, type) {
    const content = document.getElementById('search-content');
    if (!content) return;
    if (!query) { content.innerHTML = renderSuggestions(); return; }
    const user = Auth.getCurrentUser();
    const posts = DB.searchPosts(query);
    const writers = searchWriters(query);

    let results = '';
    let count = 0;

    if (type === 'all' || type === 'posts' || type === 'category') {
      const filteredPosts = type === 'category'
        ? DB.getPublishedPosts().filter(p => p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        : posts;
      count += filteredPosts.length;
      if (filteredPosts.length > 0) {
        results += `
          <div style="margin-bottom:var(--space-8)">
            ${type === 'all' ? `<h2 style="font-size:var(--text-base);font-weight:var(--fw-semibold);color:var(--color-text-3);margin-bottom:var(--space-4);text-transform:uppercase;letter-spacing:0.05em;font-size:var(--text-xs)">Posts (${filteredPosts.length})</h2>` : ''}
            <div class="posts-list">
              ${filteredPosts.map(p => renderPostResult(p, user, query)).join('')}
            </div>
          </div>`;
      }
    }

    if (type === 'all' || type === 'writers') {
      count += writers.length;
      if (writers.length > 0) {
        results += `
          <div style="margin-bottom:var(--space-8)">
            ${type === 'all' ? `<h2 style="font-size:var(--text-xs);font-weight:var(--fw-semibold);color:var(--color-text-3);margin-bottom:var(--space-4);text-transform:uppercase;letter-spacing:0.05em">Writers (${writers.length})</h2>` : ''}
            <div class="writers-grid">
              ${writers.map(w => renderWriterResult(w, user)).join('')}
            </div>
          </div>`;
      }
    }

    content.innerHTML = `
      <p class="search-results-count">
        ${count === 0 ? 'No results' : `<strong>${count}</strong> result${count === 1 ? '' : 's'}`} for <strong>"${Utils.escapeHtml(query)}"</strong>
      </p>
      ${count === 0 ? renderNoResults(query) : results}
    `;
  }

  function searchWriters(query) {
    const q = query.toLowerCase();
    return DB.getUsers().filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.bio || '').toLowerCase().includes(q)
    );
  }

  function renderPostResult(post, user, query) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const isLiked = user ? DB.isPostLikedBy(post.id, user.id) : false;
    const isSaved = user ? DB.isPostSavedBy(post.id, user.id) : false;
    const readTime = Utils.calcReadTime(post.content);

    return `
      <div class="post-card-h" onclick="Router.navigate('/post/${post.id}')" role="article" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-h-image" loading="lazy" />`
          : `<div class="post-card-h-image" style="display:flex;align-items:center;justify-content:center;background:var(--color-bg-3)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-h-content">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            ${Utils.renderAvatar(author, 'avatar-xs')}
            <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--color-text-3)">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
            ${post.category ? `<span class="dot-separator"></span><span class="badge badge-category" style="pointer-events:none">${Utils.escapeHtml(post.category)}</span>` : ''}
          </div>
          <h3 class="post-card-h-title line-clamp-2">${Utils.escapeHtml(post.title)}</h3>
          ${post.subtitle ? `<p class="post-card-h-excerpt line-clamp-1" style="font-size:var(--text-sm);color:var(--color-text-3)">${Utils.escapeHtml(post.subtitle)}</p>` : ''}
          <div class="post-card-h-meta" style="margin-top:var(--space-2)">
            <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); SearchPageActions.toggleLike('${post.id}', this)">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>${Utils.formatNumber(likeCount)}</span>
            </span>
            <span class="read-time">${readTime}m</span>
            <span class="text-faint" style="font-size:var(--text-xs)">${Utils.formatDate(post.publishedAt)}</span>
            <div style="margin-left:auto" onclick="event.stopPropagation()">
              <button class="post-action-btn ${isSaved ? 'saved' : ''}" onclick="SearchPageActions.toggleSave('${post.id}', this)" aria-label="${isSaved ? 'Unsave' : 'Save'} post">
                <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderWriterResult(writer, user) {
    const postCount = DB.getPublishedPostsByUser(writer.id).length;
    const followerCount = DB.getFollowerCount(writer.id);
    const isFollowing = user ? DB.isFollowing(user.id, writer.id) : false;
    const isSelf = user && user.id === writer.id;

    return `
      <div class="writer-card" onclick="Router.navigate('/profile/${writer.username}')">
        ${Utils.renderAvatar(writer, 'avatar-md')}
        <div class="writer-card-info">
          <div class="writer-card-name">${Utils.escapeHtml(writer.name)}</div>
          <div class="writer-card-username">@${Utils.escapeHtml(writer.username)}</div>
          <div class="writer-card-posts">${postCount} posts · ${Utils.formatNumber(followerCount)} followers</div>
        </div>
        ${!isSelf ? `
          <button class="follow-btn ${isFollowing ? 'following' : 'not-following'}"
            onclick="event.stopPropagation(); SearchPageActions.toggleFollow('${writer.id}', this)"
            aria-label="${isFollowing ? 'Unfollow' : 'Follow'} ${Utils.escapeHtml(writer.name)}">
            ${isFollowing ? 'Following' : 'Follow'}
          </button>` : ''}
      </div>
    `;
  }

  function renderNoResults(query) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
        <h2 class="empty-state-title">No results found</h2>
        <p class="empty-state-text">Try different keywords or explore by category.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/explore')">Browse Explore</button>
      </div>
    `;
  }

  function renderSuggestions() {
    const trending = DB.getTrendingPosts(4);
    const user = Auth.getCurrentUser();
    return `
      <div>
        <p style="font-size:var(--text-xs);font-weight:var(--fw-semibold);text-transform:uppercase;letter-spacing:0.06em;color:var(--color-text-4);margin-bottom:var(--space-5)">Trending</p>
        <div class="posts-list">
          ${trending.map(p => renderPostResult(p, user, '')).join('')}
        </div>
      </div>
    `;
  }

  const SearchPageActions = {
    setType(type) {
      document.querySelectorAll('.tabs .tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.getElementById(`search-tab-${type}`)?.classList.add('active');
      document.getElementById(`search-tab-${type}`)?.setAttribute('aria-selected', 'true');
      const q = document.getElementById('search-input')?.value.trim() || '';
      if (q) runSearch(q, type);
    },
    clear() {
      const input = document.getElementById('search-input');
      if (input) input.value = '';
      document.getElementById('search-clear-btn')?.classList.add('hidden');
      const content = document.getElementById('search-content');
      if (content) content.innerHTML = renderSuggestions();
    },
    toggleLike(postId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const liked = DB.togglePostLike(postId, user.id);
      const count = DB.getPostLikeCount(postId);
      el.classList.toggle('liked', liked);
      el.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
      el.querySelector('span').textContent = Utils.formatNumber(count);
    },
    toggleSave(postId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const saved = DB.toggleSavePost(postId, user.id);
      el.classList.toggle('saved', saved);
      el.querySelector('svg').setAttribute('fill', saved ? 'currentColor' : 'none');
      Toast.success(saved ? 'Post saved.' : 'Post removed from saved.');
    },
    toggleFollow(userId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const following = DB.toggleFollow(user.id, userId);
      el.className = `follow-btn ${following ? 'following' : 'not-following'}`;
      el.textContent = following ? 'Following' : 'Follow';
      if (following) DB.createNotification({ type: 'follow', recipientId: userId, actorId: user.id, message: `${user.name} started following you` });
    }
  };

  window.SearchPageActions = SearchPageActions;
  return { render };
})();
