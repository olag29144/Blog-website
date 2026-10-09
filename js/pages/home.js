const HomePage = (() => {
  let currentCategory = 'All';
  let currentPage = 1;
  const POSTS_PER_PAGE = 6;

  function render(container) {
    currentCategory = 'All';
    currentPage = 1;
    container.innerHTML = `<div class="home-layout"><div class="home-feed" id="home-feed"></div><aside class="home-sidebar" id="home-sidebar"></aside></div>`;
    renderFeed();
    renderSidebar();
  }

  function renderFeed() {
    const feed = document.getElementById('home-feed');
    if (!feed) return;
    const allPosts = DB.getPublishedPosts();
    const featured = allPosts[0];
    const categories = ['All', ...new Set(allPosts.map(p => p.category).filter(Boolean))];
    const filtered = currentCategory === 'All' ? allPosts : allPosts.filter(p => p.category === currentCategory);
    const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
    const user = Auth.getCurrentUser();

    feed.innerHTML = `
      ${featured && currentCategory === 'All' && currentPage === 1 ? renderFeaturedPost(featured, user) : ''}
      <div class="category-filter-bar" role="tablist" aria-label="Filter by category">
        ${categories.map(cat => `
          <button class="badge badge-category ${cat === currentCategory ? 'active' : ''}"
            data-category="${Utils.escapeHtml(cat)}" role="tab"
            aria-selected="${cat === currentCategory}" tabindex="0">${Utils.escapeHtml(cat)}</button>
        `).join('')}
      </div>
      <div class="home-section-heading">
        <h2 class="home-section-title">${currentCategory === 'All' ? 'Latest Posts' : currentCategory}</h2>
        <span class="text-sm text-muted">${filtered.length} ${filtered.length === 1 ? 'post' : 'posts'}</span>
      </div>
      ${paginated.length === 0 ? renderEmptyFeed() : `
        <div class="posts-grid" id="posts-grid">
          ${paginated.map(p => renderPostCard(p, user)).join('')}
        </div>
        ${totalPages > 1 ? renderPagination(currentPage, totalPages) : ''}
      `}
    `;

    feed.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', () => HomePageActions.setCategory(btn.dataset.category));
    });
  }

  function renderFeaturedPost(post, user) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const isLiked = user ? DB.isPostLikedBy(post.id, user.id) : false;
    const isSaved = user ? DB.isPostSavedBy(post.id, user.id) : false;
    const readTime = Utils.calcReadTime(post.content);

    return `
      <article class="featured-post" onclick="Router.navigate('/post/${post.id}')" role="article" aria-label="${Utils.escapeHtml(post.title)}">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="featured-post-image img-zoomable" onclick="event.stopPropagation(); Lightbox.open('${post.coverImage}', '${Utils.escapeHtml(post.title)}')" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="featured-post-image-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="featured-post-body">
          <div class="featured-post-label">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Featured
          </div>
          <h2 class="featured-post-title">${Utils.escapeHtml(post.title)}</h2>
          ${post.subtitle ? `<p class="featured-post-excerpt">${Utils.escapeHtml(post.subtitle)}</p>` : ''}
          <div class="featured-post-meta">
            <div class="featured-post-author">
              ${Utils.renderAvatar(author, 'avatar-sm')}
              <div class="featured-post-author-info">
                <span class="featured-post-author-name">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
                <span class="featured-post-author-date">${Utils.formatFullDate(post.publishedAt)} · ${readTime} min read</span>
              </div>
            </div>
            <div class="featured-post-stats">
              <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); HomePageActions.toggleLike('${post.id}', this)">
                <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>${Utils.formatNumber(likeCount)}</span>
              </span>
              <span class="post-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>${Utils.formatNumber(commentCount)}</span>
              </span>
              ${post.category ? `<span class="badge badge-accent">${Utils.escapeHtml(post.category)}</span>` : ''}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderPostCard(post, user) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const isLiked = user ? DB.isPostLikedBy(post.id, user.id) : false;
    const isSaved = user ? DB.isPostSavedBy(post.id, user.id) : false;
    const readTime = Utils.calcReadTime(post.content);
    const excerpt = Utils.excerpt(post.content, 140);

    return `
      <article class="post-card" onclick="Router.navigate('/post/${post.id}')" role="article" aria-label="${Utils.escapeHtml(post.title)}" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-image img-zoomable" onclick="event.stopPropagation(); Lightbox.open('${post.coverImage}', '${Utils.escapeHtml(post.title)}')" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="post-card-image-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-body">
          <div class="post-card-meta">
            <div class="post-card-author">
              ${Utils.renderAvatar(author, 'avatar-xs')}
              <span class="post-card-author-name">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
            </div>
            ${post.category ? `<span class="dot-separator"></span><span class="badge badge-category" style="pointer-events:none">${Utils.escapeHtml(post.category)}</span>` : ''}
          </div>
          <h3 class="post-card-title line-clamp-2">${Utils.escapeHtml(post.title)}</h3>
          ${excerpt ? `<p class="post-card-excerpt line-clamp-3">${Utils.escapeHtml(excerpt)}</p>` : ''}
          <div class="post-card-footer">
            <div class="post-card-stats">
              <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); HomePageActions.toggleLike('${post.id}', this)" aria-label="${isLiked ? 'Unlike' : 'Like'} post">
                <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>${Utils.formatNumber(likeCount)}</span>
              </span>
              <span class="post-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>${Utils.formatNumber(commentCount)}</span>
              </span>
              <span class="read-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${readTime}m
              </span>
            </div>
            <div class="post-card-actions" onclick="event.stopPropagation()">
              <button class="post-action-btn ${isSaved ? 'saved' : ''}" onclick="HomePageActions.toggleSave('${post.id}', this)" aria-label="${isSaved ? 'Unsave' : 'Save'} post" title="${isSaved ? 'Remove from saved' : 'Save post'}">
                <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              </button>
              <button class="post-action-btn" onclick="HomePageActions.sharePost('${post.id}', this)" aria-label="Share post" title="Share post">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderEmptyFeed() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <h3 class="empty-state-title">No posts in this category</h3>
        <p class="empty-state-text">Be the first to write about ${currentCategory}.</p>
        ${Auth.isLoggedIn() ? `<button class="btn btn-primary" onclick="Router.navigate('/editor')">Write a post</button>` : ''}
      </div>
    `;
  }

  function renderPagination(page, total) {
    let pages = '';
    for (let i = 1; i <= total; i++) {
      pages += `<button class="pagination-btn ${i === page ? 'active' : ''}" onclick="HomePageActions.setPage(${i})" aria-label="Page ${i}" aria-current="${i === page ? 'page' : 'false'}">${i}</button>`;
    }
    return `
      <div class="pagination" role="navigation" aria-label="Pagination">
        <button class="pagination-btn" onclick="HomePageActions.setPage(${page - 1})" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        ${pages}
        <button class="pagination-btn" onclick="HomePageActions.setPage(${page + 1})" ${page === total ? 'disabled' : ''} aria-label="Next page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;
  }

  function renderSidebar() {
    const sidebar = document.getElementById('home-sidebar');
    if (!sidebar) return;
    const user = Auth.getCurrentUser();
    const trending = DB.getTrendingPosts(4);
    const writers = DB.getTopWriters(5);

    sidebar.innerHTML = `
      <div class="sidebar-section">
        <p class="sidebar-heading">Trending</p>
        <div class="posts-list">
          ${trending.map((p, i) => {
            const author = DB.getUserById(p.authorId);
            return `
              <div class="post-card-h" onclick="Router.navigate('/post/${p.id}')" role="article" tabindex="0">
                <div style="font-size:1.5rem;font-weight:var(--fw-bold);color:var(--color-text-4);flex-shrink:0;width:24px;text-align:center;line-height:1">${i + 1}</div>
                <div class="post-card-h-content">
                  <div class="post-card-h-meta">
                    ${Utils.renderAvatar(author, 'avatar-xs')}
                    <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--color-text-3)">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
                  </div>
                  <p class="post-card-h-title line-clamp-2">${Utils.escapeHtml(p.title)}</p>
                  <div class="post-card-h-meta">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    ${Utils.formatNumber(DB.getPostLikeCount(p.id))}
                    <span class="dot-separator"></span>
                    ${Utils.formatDate(p.publishedAt)}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sidebar-section">
        <p class="sidebar-heading">Who to read</p>
        ${writers.map(w => {
          const isFollowing = user ? DB.isFollowing(user.id, w.id) : false;
          const isSelf = user && user.id === w.id;
          return `
            <div class="writer-card" onclick="Router.navigate('/profile/${w.username}')">
              ${Utils.renderAvatar(w, 'avatar-sm')}
              <div class="writer-card-info">
                <div class="writer-card-name">${Utils.escapeHtml(w.name)}</div>
                <div class="writer-card-username">@${Utils.escapeHtml(w.username)}</div>
                <div class="writer-card-posts">${w.postCount} ${w.postCount === 1 ? 'post' : 'posts'}</div>
              </div>
              ${!isSelf ? `
                <button class="follow-btn ${isFollowing ? 'following' : 'not-following'}" 
                  onclick="event.stopPropagation(); HomePageActions.toggleFollow('${w.id}', this)"
                  aria-label="${isFollowing ? 'Unfollow' : 'Follow'} ${Utils.escapeHtml(w.name)}">
                  ${isFollowing ? 'Following' : 'Follow'}
                </button>` : ''}
            </div>
          `;
        }).join('')}
        <button class="btn btn-ghost btn-sm w-full" onclick="Router.navigate('/explore')" style="margin-top:var(--space-2)">See all writers</button>
      </div>
    `;
  }

  const HomePageActions = {
    setCategory(cat) {
      currentCategory = cat;
      currentPage = 1;
      renderFeed();
    },
    setPage(page) {
      currentPage = page;
      renderFeed();
      document.getElementById('home-feed').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    toggleLike(postId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const liked = DB.togglePostLike(postId, user.id);
      const count = DB.getPostLikeCount(postId);
      el.classList.toggle('liked', liked);
      el.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
      el.querySelector('span').textContent = Utils.formatNumber(count);
      const post = DB.getPostById(postId);
      if (liked && post && post.authorId !== user.id) {
        DB.createNotification({ type: 'like', recipientId: post.authorId, actorId: user.id, postId, message: `${user.name} liked your post "${post.title}"` });
      }
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
      if (user.id === userId) return;
      const following = DB.toggleFollow(user.id, userId);
      el.className = `follow-btn ${following ? 'following' : 'not-following'}`;
      el.textContent = following ? 'Following' : 'Follow';
      if (following) {
        DB.createNotification({ type: 'follow', recipientId: userId, actorId: user.id, message: `${user.name} started following you` });
      }
      renderSidebar();
    },
    sharePost(postId, el) {
      showShareMenu(postId, el);
    }
  };

  window.HomePageActions = HomePageActions;

  function showShareMenu(postId, triggerEl) {
    document.querySelectorAll('.share-menu').forEach(m => m.remove());
    const post = DB.getPostById(postId);
    const url = Utils.buildPostUrl(postId);
    const menu = document.createElement('div');
    menu.className = 'share-menu';
    menu.style.cssText = 'position:fixed;z-index:500';
    menu.innerHTML = `
      <div class="share-menu-item" onclick="Utils.copyToClipboard('${url}').then(()=>Toast.success('Link copied!'))">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Copy link
      </div>
      <div class="share-menu-item" onclick="window.open('https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post ? post.title : '')}','_blank')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Share on X
      </div>
      <div class="share-menu-item" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}','_blank')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Share on Facebook
      </div>
      <div class="share-menu-item" onclick="window.open('https://wa.me/?text=${encodeURIComponent((post ? post.title + ' ' : '') + url)}','_blank')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        Share on WhatsApp
      </div>
      <div class="share-menu-item" onclick="window.open('https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post ? post.title : '')}','_blank')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        Share on Telegram
      </div>
    `;
    document.body.appendChild(menu);
    const rect = triggerEl.getBoundingClientRect();
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.querySelectorAll('.share-menu-item').forEach(item => {
      item.addEventListener('click', () => menu.remove());
    });
    Utils.onOutsideClick(menu, () => menu.remove());
  }

  window.showShareMenu = showShareMenu;

  return { render };
})();
