const ExplorePage = (() => {
  const CATEGORIES = [
    { name: 'Technology', emoji: '💻' }, { name: 'Programming', emoji: '⌨️' },
    { name: 'Business', emoji: '💼' }, { name: 'Education', emoji: '📚' },
    { name: 'Lifestyle', emoji: '🌿' }, { name: 'Travel', emoji: '✈️' },
    { name: 'Entertainment', emoji: '🎬' }, { name: 'Health', emoji: '🏃' },
    { name: 'Finance', emoji: '📈' }, { name: 'Design', emoji: '🎨' },
    { name: 'Personal Development', emoji: '🧠' }, { name: 'News', emoji: '📰' }, { name: 'Other', emoji: '💡' }
  ];

  function render(container) {
    const user = Auth.getCurrentUser();
    const trending = DB.getTrendingPosts(6);
    const mostLiked = DB.getPublishedPosts()
      .map(p => ({ ...p, likeCount: DB.getPostLikeCount(p.id) }))
      .sort((a, b) => b.likeCount - a.likeCount).slice(0, 6);
    const mostCommented = DB.getMostCommentedPosts(6);
    const writers = DB.getTopWriters(8);

    container.innerHTML = `
      <div class="explore-header">
        <div class="explore-header-inner">
          <h1 class="explore-header-title">Explore</h1>
          <p class="explore-header-sub">Discover stories, ideas, and people that matter to you.</p>
        </div>
      </div>
      <div class="explore-layout">
        <section>
          <h2 class="explore-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Trending Now
          </h2>
          <div class="posts-grid">
            ${trending.map(p => renderMiniCard(p, user)).join('')}
          </div>
        </section>
        <section>
          <h2 class="explore-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Most Liked
          </h2>
          <div class="posts-list">
            ${mostLiked.map(p => renderListCard(p, user)).join('')}
          </div>
        </section>
        <section>
          <h2 class="explore-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Most Discussed
          </h2>
          <div class="posts-list">
            ${mostCommented.map(p => renderListCard(p, user)).join('')}
          </div>
        </section>
        <section>
          <h2 class="explore-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Writers to Follow
          </h2>
          <div class="writers-grid">
            ${writers.map(w => renderWriterCard(w, user)).join('')}
          </div>
        </section>
        <section>
          <h2 class="explore-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Browse by Category
          </h2>
          <div class="categories-grid">
            ${CATEGORIES.map(cat => {
              const count = DB.getPublishedPosts().filter(p => p.category === cat.name).length;
              return `
                <button class="category-card" onclick="Router.navigate('/search?q=${encodeURIComponent(cat.name)}&type=category')" aria-label="${cat.name}, ${count} posts">
                  <div class="category-card-icon">${cat.emoji}</div>
                  <div class="category-card-name">${cat.name}</div>
                  <div class="category-card-count">${count} ${count === 1 ? 'post' : 'posts'}</div>
                </button>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderMiniCard(post, user) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const isLiked = user ? DB.isPostLikedBy(post.id, user.id) : false;
    const isSaved = user ? DB.isPostSavedBy(post.id, user.id) : false;

    return `
      <article class="post-card" onclick="Router.navigate('/post/${post.id}')" role="article" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-image" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="post-card-image-placeholder"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-body">
          <div class="post-card-meta">
            ${Utils.renderAvatar(author, 'avatar-xs')}
            <span class="post-card-author-name">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
            ${post.category ? `<span class="dot-separator"></span><span class="badge badge-category" style="pointer-events:none;font-size:10px">${Utils.escapeHtml(post.category)}</span>` : ''}
          </div>
          <h3 class="post-card-title line-clamp-2">${Utils.escapeHtml(post.title)}</h3>
          <div class="post-card-footer">
            <div class="post-card-stats">
              <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); ExplorePageActions.toggleLike('${post.id}', this)">
                <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>${Utils.formatNumber(likeCount)}</span>
              </span>
              <span class="post-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>${Utils.formatNumber(commentCount)}</span>
              </span>
            </div>
            <button class="post-action-btn ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); ExplorePageActions.toggleSave('${post.id}', this)" aria-label="${isSaved ? 'Unsave' : 'Save'} post">
              <svg viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderListCard(post, user) {
    const author = DB.getUserById(post.authorId);
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const readTime = Utils.calcReadTime(post.content);

    return `
      <div class="post-card-h" onclick="Router.navigate('/post/${post.id}')" role="article" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-h-image" loading="lazy" referrerpolicy="no-referrer" />`
          : `<div class="post-card-h-image" style="display:flex;align-items:center;justify-content:center;background:var(--color-bg-3);border-radius:var(--radius-md)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-h-content">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            ${Utils.renderAvatar(author, 'avatar-xs')}
            <span style="font-size:var(--text-xs);font-weight:var(--fw-medium);color:var(--color-text-3)">${author ? Utils.escapeHtml(author.name) : 'Unknown'}</span>
          </div>
          <h4 class="post-card-h-title line-clamp-2">${Utils.escapeHtml(post.title)}</h4>
          <div class="post-card-h-meta">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${Utils.formatNumber(likeCount)}
            <span class="dot-separator"></span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            ${Utils.formatNumber(commentCount)}
            <span class="dot-separator"></span>
            ${readTime}m read
          </div>
        </div>
      </div>
    `;
  }

  function renderWriterCard(w, user) {
    const isFollowing = user ? DB.isFollowing(user.id, w.id) : false;
    const isSelf = user && user.id === w.id;
    return `
      <div class="writer-card" onclick="Router.navigate('/profile/${w.username}')">
        ${Utils.renderAvatar(w, 'avatar-md')}
        <div class="writer-card-info">
          <div class="writer-card-name">${Utils.escapeHtml(w.name)}</div>
          <div class="writer-card-username">@${Utils.escapeHtml(w.username)}</div>
          <div class="writer-card-posts">${w.postCount} posts · ${Utils.formatNumber(w.followerCount)} followers</div>
        </div>
        ${!isSelf ? `
          <button class="follow-btn ${isFollowing ? 'following' : 'not-following'}"
            onclick="event.stopPropagation(); ExplorePageActions.toggleFollow('${w.id}', this)"
            aria-label="${isFollowing ? 'Unfollow' : 'Follow'} ${Utils.escapeHtml(w.name)}">
            ${isFollowing ? 'Following' : 'Follow'}
          </button>` : ''}
      </div>
    `;
  }

  const ExplorePageActions = {
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
    }
  };
  window.ExplorePageActions = ExplorePageActions;

  return { render };
})();
