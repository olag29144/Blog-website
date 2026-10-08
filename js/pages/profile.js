const ProfilePage = (() => {
  function render(container, params) {
    const username = params.username;
    const profileUser = DB.getUserByUsername(username);

    if (!profileUser) {
      container.innerHTML = `
        <div class="empty-state" style="padding-top:var(--space-24)">
          <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h2 class="empty-state-title">User not found</h2>
          <p class="empty-state-text">This profile does not exist or may have been removed.</p>
          <button class="btn btn-primary" onclick="Router.navigate('/')">Go Home</button>
        </div>`;
      return;
    }

    const currentUser = Auth.getCurrentUser();
    const isSelf = currentUser && currentUser.id === profileUser.id;
    const isFollowing = currentUser && !isSelf ? DB.isFollowing(currentUser.id, profileUser.id) : false;
    const followerCount = DB.getFollowerCount(profileUser.id);
    const followingCount = DB.getFollowingCount(profileUser.id);
    const posts = DB.getPublishedPostsByUser(profileUser.id);
    const allUserPosts = isSelf ? DB.getPostsByUser(profileUser.id) : posts;
    const drafts = isSelf ? DB.getDraftsByUser(profileUser.id) : [];

    container.innerHTML = `
      <div class="profile-header">
        <div class="profile-header-inner">
          ${Utils.renderAvatar(profileUser, 'avatar-2xl')}
          <div class="profile-header-info">
            <h1 class="profile-name">${Utils.escapeHtml(profileUser.name)}</h1>
            <p class="profile-username">@${Utils.escapeHtml(profileUser.username)}</p>
            ${profileUser.bio ? `<p class="profile-bio">${Utils.escapeHtml(profileUser.bio)}</p>` : ''}
            <div class="profile-stats">
              <div class="profile-stat" onclick="ProfilePageActions.showFollowers('${profileUser.id}')" tabindex="0" role="button" aria-label="${followerCount} followers">
                <span class="profile-stat-value">${Utils.formatNumber(followerCount)}</span>
                <span class="profile-stat-label">Followers</span>
              </div>
              <div class="profile-stat" onclick="ProfilePageActions.showFollowing('${profileUser.id}')" tabindex="0" role="button" aria-label="${followingCount} following">
                <span class="profile-stat-value">${Utils.formatNumber(followingCount)}</span>
                <span class="profile-stat-label">Following</span>
              </div>
              <div class="profile-stat">
                <span class="profile-stat-value">${Utils.formatNumber(posts.length)}</span>
                <span class="profile-stat-label">Posts</span>
              </div>
            </div>
            <div class="profile-actions">
              ${isSelf ? `
                <button class="btn btn-secondary" onclick="ProfilePageActions.editProfile()" aria-label="Edit profile">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit profile
                </button>
                <button class="btn btn-primary" onclick="Router.navigate('/editor')" aria-label="Write a new post">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Write
                </button>` : `
                <button class="follow-btn ${isFollowing ? 'following' : 'not-following'}" id="profile-follow-btn"
                  onclick="ProfilePageActions.toggleFollow('${profileUser.id}')"
                  aria-label="${isFollowing ? 'Unfollow' : 'Follow'} ${Utils.escapeHtml(profileUser.name)}">
                  ${isFollowing ? 'Following' : 'Follow'}
                </button>`}
            </div>
          </div>
        </div>
      </div>

      <div class="profile-layout">
        <div>
          <div class="tabs" role="tablist">
            <button class="tab active" id="tab-posts" role="tab" aria-selected="true" onclick="ProfilePageActions.switchTab('posts')">
              Posts <span style="font-size:var(--text-xs);color:var(--color-text-4);margin-left:4px">${posts.length}</span>
            </button>
            ${isSelf ? `
              <button class="tab" id="tab-drafts" role="tab" aria-selected="false" onclick="ProfilePageActions.switchTab('drafts')">
                Drafts <span style="font-size:var(--text-xs);color:var(--color-text-4);margin-left:4px">${drafts.length}</span>
              </button>` : ''}
          </div>
          <div id="profile-content" style="padding-top:var(--space-6)">
            ${renderPostsTab(posts, isSelf, currentUser)}
          </div>
        </div>

        <div>
          <div class="post-sidebar-card" style="position:sticky;top:calc(var(--nav-height) + var(--space-8))">
            <p class="post-sidebar-card-title">About</p>
            <div style="text-align:center;padding:var(--space-2) 0 var(--space-4)">
              ${Utils.renderAvatar(profileUser, 'avatar-md')}
              <p style="font-size:var(--text-sm);font-weight:var(--fw-semibold);color:var(--color-text);margin-top:var(--space-3)">${Utils.escapeHtml(profileUser.name)}</p>
              <p style="font-size:var(--text-xs);color:var(--color-text-4)">@${Utils.escapeHtml(profileUser.username)}</p>
            </div>
            ${profileUser.bio ? `<p style="font-size:var(--text-sm);color:var(--color-text-3);line-height:var(--lh-relaxed)">${Utils.escapeHtml(profileUser.bio)}</p>` : ''}
            <div style="display:flex;justify-content:space-around;margin-top:var(--space-5);padding-top:var(--space-4);border-top:1px solid var(--color-border)">
              <div style="text-align:center">
                <div style="font-size:var(--text-lg);font-weight:var(--fw-bold);color:var(--color-text)">${Utils.formatNumber(posts.length)}</div>
                <div style="font-size:var(--text-xs);color:var(--color-text-4)">Posts</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:var(--text-lg);font-weight:var(--fw-bold);color:var(--color-text)">${Utils.formatNumber(followerCount)}</div>
                <div style="font-size:var(--text-xs);color:var(--color-text-4)">Followers</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:var(--text-lg);font-weight:var(--fw-bold);color:var(--color-text)">${Utils.formatNumber(followingCount)}</div>
                <div style="font-size:var(--text-xs);color:var(--color-text-4)">Following</div>
              </div>
            </div>
            <p style="font-size:var(--text-xs);color:var(--color-text-4);margin-top:var(--space-4)">Member since ${Utils.formatFullDate(profileUser.createdAt)}</p>
          </div>
        </div>
      </div>
    `;

    window._profileUser = profileUser;
    window._profilePosts = posts;
    window._profileDrafts = drafts;
    window._profileIsSelf = isSelf;
    window._profileCurrentUser = currentUser;
  }

  function renderPostsTab(posts, isSelf, currentUser) {
    if (posts.length === 0) return `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <p class="empty-state-title">No posts yet</p>
        <p class="empty-state-text">${isSelf ? "You haven't published any posts yet." : "This writer hasn't published any posts yet."}</p>
        ${isSelf ? `<button class="btn btn-primary" onclick="Router.navigate('/editor')">Write your first post</button>` : ''}
      </div>`;
    return `<div class="posts-list">${posts.map(p => renderProfilePostCard(p, isSelf, currentUser)).join('')}</div>`;
  }

  function renderDraftsTab(drafts) {
    if (drafts.length === 0) return `
      <div class="empty-state">
        <div class="empty-state-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
        <p class="empty-state-title">No drafts</p>
        <p class="empty-state-text">Drafts you save will appear here.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/editor')">Start writing</button>
      </div>`;
    return `<div class="posts-list">${drafts.map(d => renderDraftCard(d)).join('')}</div>`;
  }

  function renderProfilePostCard(post, isSelf, currentUser) {
    const likeCount = DB.getPostLikeCount(post.id);
    const commentCount = DB.getCommentsByPost(post.id).length;
    const readTime = Utils.calcReadTime(post.content);
    const isLiked = currentUser ? DB.isPostLikedBy(post.id, currentUser.id) : false;
    const isSaved = currentUser ? DB.isPostSavedBy(post.id, currentUser.id) : false;

    return `
      <div class="post-card-h" onclick="Router.navigate('/post/${post.id}')" role="article" tabindex="0">
        ${post.coverImage
          ? `<img src="${post.coverImage}" alt="${Utils.escapeHtml(post.title)}" class="post-card-h-image" loading="lazy" />`
          : `<div class="post-card-h-image" style="display:flex;align-items:center;justify-content:center;background:var(--color-bg-3)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
        }
        <div class="post-card-h-content">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            ${post.category ? `<span class="badge badge-category" style="pointer-events:none">${Utils.escapeHtml(post.category)}</span>` : ''}
            <span class="text-faint" style="font-size:var(--text-xs)">${Utils.formatDate(post.publishedAt)}</span>
            <span class="text-faint" style="font-size:var(--text-xs)">· ${readTime}m read</span>
          </div>
          <h3 class="post-card-h-title line-clamp-2">${Utils.escapeHtml(post.title)}</h3>
          ${post.subtitle ? `<p class="post-card-h-excerpt line-clamp-2" style="font-size:var(--text-sm);color:var(--color-text-3)">${Utils.escapeHtml(post.subtitle)}</p>` : ''}
          <div class="post-card-h-meta" style="margin-top:auto">
            <span class="post-stat ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); ProfilePageActions.toggleLike('${post.id}', this)">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>${Utils.formatNumber(likeCount)}</span>
            </span>
            <span class="post-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>${Utils.formatNumber(commentCount)}</span>
            </span>
            ${isSelf ? `
              <div style="margin-left:auto;display:flex;gap:var(--space-2)" onclick="event.stopPropagation()">
                <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/editor?id=${post.id}')" aria-label="Edit post">Edit</button>
                <button class="btn btn-ghost btn-sm" style="color:var(--color-danger)" onclick="ProfilePageActions.deletePost('${post.id}')" aria-label="Delete post">Delete</button>
              </div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderDraftCard(draft) {
    const readTime = Utils.calcReadTime(draft.content);
    return `
      <div class="post-card-h" onclick="Router.navigate('/editor?id=${draft.id}')" role="article" tabindex="0" style="border-left:3px solid var(--color-warning)">
        <div class="post-card-h-content">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            <span class="badge" style="background:var(--color-warning-light);color:var(--color-warning)">Draft</span>
            <span class="text-faint" style="font-size:var(--text-xs)">Last edited ${Utils.formatDate(draft.updatedAt || draft.createdAt)}</span>
          </div>
          <h3 class="post-card-h-title">${draft.title ? Utils.escapeHtml(draft.title) : '<em style="color:var(--color-text-4)">Untitled draft</em>'}</h3>
          ${draft.subtitle ? `<p class="post-card-h-excerpt" style="font-size:var(--text-sm);color:var(--color-text-3)">${Utils.escapeHtml(draft.subtitle)}</p>` : ''}
          <div class="post-card-h-meta" style="margin-top:var(--space-2)">
            <span style="font-size:var(--text-xs);color:var(--color-text-4)">${Utils.countWords(draft.content || '')} words · ${readTime}m read</span>
            <div style="margin-left:auto;display:flex;gap:var(--space-2)" onclick="event.stopPropagation()">
              <button class="btn btn-primary btn-sm" onclick="Router.navigate('/editor?id=${draft.id}')">Continue</button>
              <button class="btn btn-ghost btn-sm" style="color:var(--color-danger)" onclick="ProfilePageActions.deleteDraft('${draft.id}')">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const ProfilePageActions = {
    switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.getElementById(`tab-${tab}`)?.classList.add('active');
      document.getElementById(`tab-${tab}`)?.setAttribute('aria-selected', 'true');
      const content = document.getElementById('profile-content');
      if (!content) return;
      if (tab === 'posts') content.innerHTML = renderPostsTab(window._profilePosts, window._profileIsSelf, window._profileCurrentUser);
      else if (tab === 'drafts') content.innerHTML = renderDraftsTab(window._profileDrafts);
    },
    toggleFollow(userId) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      if (user.id === userId) return;
      const following = DB.toggleFollow(user.id, userId);
      const btn = document.getElementById('profile-follow-btn');
      if (btn) { btn.className = `follow-btn ${following ? 'following' : 'not-following'}`; btn.textContent = following ? 'Following' : 'Follow'; }
      const followerStat = document.querySelector('.profile-stat-value');
      if (followerStat) followerStat.textContent = Utils.formatNumber(DB.getFollowerCount(userId));
      if (following) DB.createNotification({ type: 'follow', recipientId: userId, actorId: user.id, message: `${user.name} started following you` });
      Nav.update();
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
    deletePost(postId) {
      showConfirmModal('Delete this post?', 'This will permanently remove the post. This cannot be undone.', () => {
        DB.deletePost(postId);
        window._profilePosts = window._profilePosts.filter(p => p.id !== postId);
        const content = document.getElementById('profile-content');
        if (content) content.innerHTML = renderPostsTab(window._profilePosts, true, window._profileCurrentUser);
        Toast.success('Post deleted.');
      });
    },
    deleteDraft(draftId) {
      showConfirmModal('Delete this draft?', 'This cannot be undone.', () => {
        DB.deleteDraft(draftId);
        window._profileDrafts = window._profileDrafts.filter(d => d.id !== draftId);
        const content = document.getElementById('profile-content');
        if (content) content.innerHTML = renderDraftsTab(window._profileDrafts);
        Toast.success('Draft deleted.');
      });
    },
    showFollowers(userId) {
      const ids = DB.getFollowerIds(userId);
      const users = ids.map(id => DB.getUserById(id)).filter(Boolean);
      showUserListModal('Followers', users);
    },
    showFollowing(userId) {
      const ids = DB.getFollowingIds(userId);
      const users = ids.map(id => DB.getUserById(id)).filter(Boolean);
      showUserListModal('Following', users);
    },
    editProfile() {
      const user = Auth.getCurrentUser();
      if (!user) return;
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-label', 'Edit profile');
      backdrop.innerHTML = `
        <div class="modal" style="max-width:520px">
          <div class="modal-header">
            <h2 class="modal-title">Edit Profile</h2>
            <button class="modal-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal-body">
            <div style="display:flex;flex-direction:column;gap:var(--space-5)">
              <div class="avatar-upload" style="align-items:flex-start;flex-direction:row;gap:var(--space-4)">
                <div class="avatar-upload-preview" id="edit-avatar-preview-wrap" role="button" tabindex="0" aria-label="Change profile picture" onclick="document.getElementById('edit-avatar-input').click()">
                  <div id="edit-avatar-display">${Utils.renderAvatar(user, 'avatar-lg')}</div>
                  <div class="avatar-upload-overlay"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                </div>
                <div>
                  <p style="font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--color-text-2)">Profile photo</p>
                  <p style="font-size:var(--text-xs);color:var(--color-text-4);margin-top:2px">Click to upload a new photo</p>
                  <input type="file" id="edit-avatar-input" accept="image/*" class="visually-hidden" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-name">Full name</label>
                <input class="form-input" type="text" id="edit-name" value="${Utils.escapeHtml(user.name)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-username">Username</label>
                <input class="form-input" type="text" id="edit-username" value="${Utils.escapeHtml(user.username)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-bio">Bio</label>
                <textarea class="form-textarea" id="edit-bio" rows="3" placeholder="Tell readers about yourself…">${Utils.escapeHtml(user.bio || '')}</textarea>
              </div>
              <span class="form-error hidden" id="edit-profile-error" role="alert"></span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="edit-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="edit-save-btn">Save changes</button>
          </div>
        </div>
      `;
      document.getElementById('modal-root').appendChild(backdrop);

      let newAvatarData = user.avatar || '';
      const avatarInput = backdrop.querySelector('#edit-avatar-input');
      avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { Toast.error('Image must be under 2MB.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
          newAvatarData = e.target.result;
          backdrop.querySelector('#edit-avatar-display').innerHTML = `<img src="${newAvatarData}" alt="Profile preview" style="width:56px;height:56px;border-radius:50%;object-fit:cover" />`;
        };
        reader.readAsDataURL(file);
      });

      backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
      backdrop.querySelector('#edit-cancel-btn').addEventListener('click', () => backdrop.remove());
      backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });

      backdrop.querySelector('#edit-save-btn').addEventListener('click', () => {
        const name = backdrop.querySelector('#edit-name').value;
        const username = backdrop.querySelector('#edit-username').value;
        const bio = backdrop.querySelector('#edit-bio').value;
        const result = Auth.updateProfile({ name, username, bio, avatar: newAvatarData });
        if (result.error) {
          const errEl = backdrop.querySelector('#edit-profile-error');
          errEl.textContent = result.error;
          errEl.classList.remove('hidden');
        } else {
          backdrop.remove();
          Toast.success('Profile updated.');
          Nav.update();
          Router.navigate(`/profile/${result.user.username}`);
        }
      });
    }
  };

  function showUserListModal(title, users) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${Utils.escapeHtml(title)}</h2>
          <button class="modal-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body" style="padding:0">
          ${users.length === 0 ? `<div class="empty-state" style="padding:var(--space-8)"><p class="empty-state-text">No ${title.toLowerCase()} yet.</p></div>` : `
            <div class="followers-list">
              ${users.map(u => `
                <div class="follower-item" data-username="${Utils.escapeHtml(u.username)}">
                  ${Utils.renderAvatar(u, 'avatar-sm')}
                  <div class="follower-item-info">
                    <div class="follower-name">${Utils.escapeHtml(u.name)}</div>
                    <div class="follower-username">@${Utils.escapeHtml(u.username)}</div>
                  </div>
                </div>
              `).join('')}
            </div>`}
        </div>
      </div>
    `;
    document.getElementById('modal-root').appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.querySelectorAll('.follower-item').forEach(item => {
      item.addEventListener('click', () => {
        const username = item.dataset.username;
        backdrop.remove();
        Router.navigate(`/profile/${username}`);
      });
    });
  }

  window.ProfilePageActions = ProfilePageActions;
  return { render };
})();
