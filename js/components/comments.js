const Comments = (() => {
  function render(postId, container) {
    const comments = DB.getCommentsByPost(postId).filter(c => !c.parentId);
    const totalCount = DB.getCommentsByPost(postId).length;
    const user = Auth.getCurrentUser();

    container.innerHTML = `
      <section class="comments-section" aria-label="Comments">
        <h2 class="comments-heading">
          Comments <span>${totalCount}</span>
        </h2>
        ${user ? `
          <div class="comment-form">
            ${Utils.renderAvatar(user, 'avatar-sm')}
            <div class="comment-form-content">
              <textarea class="comment-input" id="new-comment-input" placeholder="Add a comment…" rows="1" aria-label="Write a comment"></textarea>
              <div class="comment-form-actions hidden" id="comment-form-actions">
                <button class="btn btn-ghost btn-sm" id="cancel-comment-btn">Cancel</button>
                <button class="btn btn-primary btn-sm" id="submit-comment-btn">Post comment</button>
              </div>
            </div>
          </div>
        ` : `
          <div style="background:var(--color-bg-2);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-5);text-align:center;margin-bottom:var(--space-8)">
            <p style="font-size:var(--text-sm);color:var(--color-text-3);margin-bottom:var(--space-3)">Sign in to join the conversation.</p>
            <button class="btn btn-primary btn-sm" onclick="Router.navigate('/login')">Sign in</button>
          </div>
        `}
        <div id="comments-list">
          ${comments.length === 0 ? renderEmptyComments() : comments.map(c => renderComment(c, postId, user)).join('')}
        </div>
      </section>
    `;
    bindCommentFormEvents(postId, container);
  }

  function renderComment(comment, postId, user, isReply = false) {
    const author = DB.getUserById(comment.authorId);
    const replies = isReply ? [] : DB.getCommentsByPost(postId).filter(c => c.parentId === comment.id);
    const likeCount = DB.getCommentLikeCount(comment.id);
    const isLiked = user ? DB.isCommentLikedBy(comment.id, user.id) : false;
    const isOwner = user && user.id === comment.authorId;

    return `
      <div class="comment-item" id="comment-${comment.id}" role="article">
        <button onclick="Router.navigate('/profile/${author ? author.username : ''}')" style="background:none;border:none;padding:0;cursor:pointer;flex-shrink:0" aria-label="View ${author ? author.name : 'author'}'s profile">
          ${Utils.renderAvatar(author, 'avatar-sm')}
        </button>
        <div class="comment-body">
          <div class="comment-header">
            <button class="comment-author" onclick="Router.navigate('/profile/${author ? author.username : ''}')">${author ? Utils.escapeHtml(author.name) : 'Deleted user'}</button>
            <span class="comment-time">${Utils.formatDate(comment.createdAt)}</span>
            ${comment.updatedAt ? `<span class="text-faint" style="font-size:var(--text-xs)">(edited)</span>` : ''}
          </div>
          <div class="comment-text" id="comment-text-${comment.id}">${Utils.nl2br(comment.text)}</div>
          <div class="comment-actions">
            <button class="comment-action-btn ${isLiked ? 'liked' : ''}" onclick="CommentsActions.toggleCommentLike('${comment.id}', this)" aria-label="${isLiked ? 'Unlike' : 'Like'} comment">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>${likeCount > 0 ? likeCount : ''}</span>
            </button>
            ${user && !isReply ? `
              <button class="comment-action-btn" onclick="CommentsActions.showReplyForm('${comment.id}', '${postId}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                Reply
              </button>
            ` : ''}
            ${isOwner ? `
              <div class="comment-menu" style="position:relative;margin-left:auto">
                <button class="comment-menu-btn" onclick="CommentsActions.toggleCommentMenu('${comment.id}')" aria-label="Comment options" aria-haspopup="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                <div id="comment-menu-${comment.id}" class="dropdown hidden" style="right:0;min-width:140px;top:calc(100% + 4px)">
                  <button class="dropdown-item" onclick="CommentsActions.editComment('${comment.id}', '${postId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                  <button class="dropdown-item danger" onclick="CommentsActions.deleteComment('${comment.id}', '${postId}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
          <div id="reply-form-${comment.id}"></div>
          ${replies.length > 0 ? `
            <div class="replies-section" id="replies-${comment.id}">
              ${replies.map(r => renderComment(r, postId, user, true)).join('')}
            </div>
          ` : `<div class="replies-section" id="replies-${comment.id}" style="display:none"></div>`}
        </div>
      </div>
    `;
  }

  function renderEmptyComments() {
    return `
      <div class="empty-state" style="padding:var(--space-10) 0">
        <div class="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p class="empty-state-title">No comments yet</p>
        <p class="empty-state-text">Be the first to share your thoughts.</p>
      </div>
    `;
  }

  function bindCommentFormEvents(postId, container) {
    const input = container.querySelector('#new-comment-input');
    const actions = container.querySelector('#comment-form-actions');
    const cancelBtn = container.querySelector('#cancel-comment-btn');
    const submitBtn = container.querySelector('#submit-comment-btn');

    if (!input) return;

    input.addEventListener('focus', () => {
      actions && actions.classList.remove('hidden');
      Utils.autoResizeTextarea(input);
    });

    input.addEventListener('input', () => Utils.autoResizeTextarea(input));

    cancelBtn && cancelBtn.addEventListener('click', () => {
      input.value = '';
      input.style.height = 'auto';
      actions && actions.classList.add('hidden');
    });

    submitBtn && submitBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      const user = Auth.getCurrentUser();
      const comment = DB.createComment({ postId, authorId: user.id, text, parentId: null });
      const post = DB.getPostById(postId);
      if (post && post.authorId !== user.id) {
        DB.createNotification({ type: 'comment', recipientId: post.authorId, actorId: user.id, postId, commentId: comment.id, message: `${user.name} commented on your post "${post.title}"` });
      }
      input.value = '';
      input.style.height = 'auto';
      actions && actions.classList.add('hidden');
      refreshComments(postId, container);
      Toast.success('Comment posted.');
    });
  }

  function refreshComments(postId, container) {
    const list = container.querySelector('#comments-list');
    if (!list) return;
    const comments = DB.getCommentsByPost(postId).filter(c => !c.parentId);
    const totalCount = DB.getCommentsByPost(postId).length;
    const user = Auth.getCurrentUser();
    const heading = container.querySelector('.comments-heading span');
    if (heading) heading.textContent = totalCount;
    list.innerHTML = comments.length === 0 ? renderEmptyComments() : comments.map(c => renderComment(c, postId, user)).join('');
  }

  const CommentsActions = {
    toggleCommentLike(commentId, el) {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const liked = DB.toggleCommentLike(commentId, user.id);
      const count = DB.getCommentLikeCount(commentId);
      el.classList.toggle('liked', liked);
      el.querySelector('svg').setAttribute('fill', liked ? 'currentColor' : 'none');
      el.querySelector('span').textContent = count > 0 ? count : '';
    },
    showReplyForm(commentId, postId) {
      const container = document.getElementById(`reply-form-${commentId}`);
      if (!container) return;
      if (container.querySelector('.comment-input')) {
        container.innerHTML = '';
        return;
      }
      const user = Auth.getCurrentUser();
      container.innerHTML = `
        <div class="comment-form" style="margin-top:var(--space-3)">
          ${Utils.renderAvatar(user, 'avatar-xs')}
          <div class="comment-form-content">
            <textarea class="comment-input reply-input" placeholder="Write a reply…" rows="1" aria-label="Write a reply"></textarea>
            <div class="comment-form-actions">
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('reply-form-${commentId}').innerHTML=''">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="CommentsActions.submitReply('${commentId}', '${postId}')">Reply</button>
            </div>
          </div>
        </div>
      `;
      const ta = container.querySelector('.reply-input');
      if (ta) {
        ta.focus();
        ta.addEventListener('input', () => Utils.autoResizeTextarea(ta));
      }
    },
    submitReply(parentId, postId) {
      const container = document.getElementById(`reply-form-${parentId}`);
      if (!container) return;
      const ta = container.querySelector('.reply-input');
      const text = ta ? ta.value.trim() : '';
      if (!text) return;
      const user = Auth.getCurrentUser();
      const comment = DB.createComment({ postId, authorId: user.id, text, parentId });
      container.innerHTML = '';
      const parent = DB.getCommentsByPost(postId).find(c => c.id === parentId);
      const post = DB.getPostById(postId);
      if (parent && parent.authorId !== user.id) {
        DB.createNotification({ type: 'reply', recipientId: parent.authorId, actorId: user.id, postId, commentId: comment.id, message: `${user.name} replied to your comment` });
      }
      if (post && post.authorId !== user.id && post.authorId !== parent?.authorId) {
        DB.createNotification({ type: 'comment', recipientId: post.authorId, actorId: user.id, postId, commentId: comment.id, message: `${user.name} commented on your post "${post.title}"` });
      }
      const repliesContainer = document.getElementById(`replies-${parentId}`);
      if (repliesContainer) {
        repliesContainer.style.display = '';
        const newComment = DB.getCommentsByPost(postId).find(c => c.id === comment.id);
        if (newComment) {
          repliesContainer.insertAdjacentHTML('beforeend', renderComment(newComment, postId, user, true));
        }
      }
      const heading = document.querySelector('.comments-heading span');
      if (heading) heading.textContent = DB.getCommentsByPost(postId).length;
      Toast.success('Reply posted.');
    },
    toggleCommentMenu(commentId) {
      const menu = document.getElementById(`comment-menu-${commentId}`);
      if (!menu) return;
      const isHidden = menu.classList.toggle('hidden');
      if (!isHidden) {
        Utils.onOutsideClick(menu, () => menu.classList.add('hidden'));
      }
    },
    editComment(commentId, postId) {
      document.getElementById(`comment-menu-${commentId}`)?.classList.add('hidden');
      const comment = DB.getCommentsByPost(postId).find(c => c.id === commentId);
      if (!comment) return;
      const textEl = document.getElementById(`comment-text-${commentId}`);
      if (!textEl) return;
      const original = comment.text;
      textEl.outerHTML = `
        <div class="comment-edit-form" id="edit-form-${commentId}">
          <textarea class="comment-input" id="edit-input-${commentId}" style="min-height:70px">${Utils.escapeHtml(original)}</textarea>
          <div class="comment-form-actions" style="display:flex">
            <button class="btn btn-ghost btn-sm" data-cancel-edit="${commentId}">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="CommentsActions.saveEdit('${commentId}', '${postId}')">Save</button>
          </div>
        </div>
      `;
      const ta = document.getElementById(`edit-input-${commentId}`);
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
      const cancelBtn = document.querySelector(`[data-cancel-edit="${commentId}"]`);
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => CommentsActions.cancelEdit(commentId, original));
      }
    },
    cancelEdit(commentId, originalText) {
      const form = document.getElementById(`edit-form-${commentId}`);
      if (form) form.outerHTML = `<div class="comment-text" id="comment-text-${commentId}">${Utils.nl2br(originalText)}</div>`;
    },
    saveEdit(commentId, postId) {
      const ta = document.getElementById(`edit-input-${commentId}`);
      const text = ta ? ta.value.trim() : '';
      if (!text) return;
      DB.updateComment(commentId, { text });
      const form = document.getElementById(`edit-form-${commentId}`);
      if (form) form.outerHTML = `<div class="comment-text" id="comment-text-${commentId}">${Utils.nl2br(text)}</div>`;
      Toast.success('Comment updated.');
    },
    deleteComment(commentId, postId) {
      showConfirmModal('Delete this comment?', 'This cannot be undone.', () => {
        DB.deleteComment(commentId);
        const commentEl = document.getElementById(`comment-${commentId}`);
        if (commentEl) commentEl.remove();
        const heading = document.querySelector('.comments-heading span');
        if (heading) heading.textContent = DB.getCommentsByPost(postId).length;
        Toast.success('Comment deleted.');
      });
    }
  };

  window.CommentsActions = CommentsActions;

  function showConfirmModal(title, message, onConfirm) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', title);
    backdrop.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${Utils.escapeHtml(title)}</h2>
          <button class="modal-close" aria-label="Close dialog"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div class="modal-body"><p style="color:var(--color-text-2)">${Utils.escapeHtml(message)}</p></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Delete</button>
        </div>
      </div>
    `;
    document.getElementById('modal-root').appendChild(backdrop);
    backdrop.querySelector('.modal-close').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#confirm-cancel').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#confirm-ok').addEventListener('click', () => { backdrop.remove(); onConfirm(); });
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  }

  window.showConfirmModal = showConfirmModal;

  return { render };
})();
