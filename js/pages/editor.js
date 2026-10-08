const EditorPage = (() => {
  const AUTOSAVE_KEY = 'gabbyblog_editor_draft';
  let autosaveTimer = null;
  let currentDraftId = null;

  const CATEGORIES = [
    'Technology', 'Programming', 'Business', 'Education', 'Lifestyle',
    'Travel', 'Entertainment', 'Health', 'Finance', 'Design',
    'Personal Development', 'News', 'Other'
  ];

  function render(container, params) {
    if (!Auth.requireAuth()) return;
    const user = Auth.getCurrentUser();
    const editId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
    let existingPost = editId ? DB.getPostById(editId) : null;

    if (existingPost && existingPost.authorId !== user.id) {
      container.innerHTML = `<div class="empty-state" style="padding-top:var(--space-24)"><h2 class="empty-state-title">Not authorized</h2><p class="empty-state-text">You can only edit your own posts.</p><button class="btn btn-primary" onclick="Router.navigate('/')">Go Home</button></div>`;
      return;
    }

    let savedDraft = null;
    if (!existingPost) {
      try { savedDraft = JSON.parse(localStorage.getItem(AUTOSAVE_KEY)); } catch {}
    }
    const data = existingPost || savedDraft || {};
    currentDraftId = existingPost ? existingPost.id : (savedDraft ? savedDraft.id : null);

    container.innerHTML = `
      <div class="editor-page">
        <div class="editor-topbar">
          <div class="editor-topbar-left">
            <button class="btn btn-ghost btn-sm" onclick="EditorActions.goBack()" aria-label="Go back">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>
            <span class="editor-topbar-title">${existingPost ? 'Edit post' : 'New post'}</span>
            <span class="editor-topbar-status" id="autosave-status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Draft
            </span>
          </div>
          <div class="editor-topbar-actions">
            <button class="btn btn-secondary" id="save-draft-btn" onclick="EditorActions.saveDraft()">Save draft</button>
            <button class="btn btn-primary" id="publish-btn" onclick="EditorActions.publish()">
              ${existingPost && existingPost.status === 'published' ? 'Update post' : 'Publish'}
            </button>
          </div>
        </div>

        ${savedDraft && !existingPost ? `
          <div class="draft-banner" id="draft-recovery-banner">
            <span style="display:flex;align-items:center;gap:var(--space-2)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Draft recovered from your last session.
            </span>
            <button class="btn btn-ghost btn-sm" onclick="EditorActions.discardDraft()">Discard</button>
          </div>` : ''}

        <div id="editor-cover-area">
          ${data.coverImage ? `
            <div class="editor-cover-preview" id="cover-preview">
              <img src="${data.coverImage}" alt="Cover image" id="cover-img" />
              <button class="editor-cover-remove" onclick="EditorActions.removeCover()" aria-label="Remove cover image">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Remove
              </button>
            </div>` : `
            <div class="editor-cover-zone" id="cover-dropzone" onclick="document.getElementById('cover-file-input').click()" role="button" tabindex="0" aria-label="Add a cover image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <p>Add a cover image</p>
              <p style="font-size:var(--text-xs);color:var(--color-text-4)">JPG, PNG, GIF — max 3MB</p>
            </div>`}
          <input type="file" id="cover-file-input" accept="image/*" class="visually-hidden" aria-label="Choose cover image" />
        </div>

        <textarea class="editor-title-input" id="editor-title" placeholder="Post title…" rows="1" maxlength="200" aria-label="Post title">${Utils.escapeHtml(data.title || '')}</textarea>
        <textarea class="editor-subtitle-input" id="editor-subtitle" placeholder="Add a subtitle or brief description…" rows="1" aria-label="Post subtitle">${Utils.escapeHtml(data.subtitle || '')}</textarea>

        <div class="editor-meta-row">
          <div class="editor-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <label for="editor-category" class="visually-hidden">Category</label>
            <select class="form-select" id="editor-category" style="border:none;background:none;padding:0;height:auto;font-size:var(--text-sm);color:var(--color-text-3)" aria-label="Category">
              <option value="">Select category…</option>
              ${CATEGORIES.map(c => `<option value="${c}" ${data.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="editor-meta-item" id="stats-words">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            <span id="word-count">0 words</span>
          </div>
          <div class="editor-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="read-time-est">0 min read</span>
          </div>
        </div>

        <div class="editor-toolbar" role="toolbar" aria-label="Text formatting">
          <button class="editor-toolbar-btn" onclick="EditorActions.formatText('bold')" title="Bold (Ctrl+B)" aria-label="Bold"><strong>B</strong></button>
          <button class="editor-toolbar-btn" onclick="EditorActions.formatText('italic')" title="Italic (Ctrl+I)" aria-label="Italic"><em>I</em></button>
          <div class="editor-toolbar-separator" role="separator"></div>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('h2')" title="Heading 2" aria-label="Heading 2" style="font-size:11px;font-weight:700">H2</button>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('h3')" title="Heading 3" aria-label="Heading 3" style="font-size:11px;font-weight:700">H3</button>
          <div class="editor-toolbar-separator" role="separator"></div>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('ul')" title="Bullet list" aria-label="Bullet list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
          </button>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('quote')" title="Block quote" aria-label="Block quote">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </button>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('code')" title="Inline code" aria-label="Inline code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </button>
          <div class="editor-toolbar-separator" role="separator"></div>
          <button class="editor-toolbar-btn" onclick="EditorActions.insertBlock('hr')" title="Divider" aria-label="Horizontal rule" style="font-size:10px">—</button>
        </div>

        <textarea class="editor-content-area" id="editor-content" placeholder="Tell your story…" aria-label="Post content">${Utils.escapeHtml(data.content || '')}</textarea>

        <div class="editor-stats-bar">
          <span id="char-count">0 characters</span>
          <span class="dot-separator"></span>
          <span id="para-count">0 paragraphs</span>
        </div>
      </div>
    `;

    initEditorEvents(existingPost);
  }

  function initEditorEvents(existingPost) {
    const titleEl = document.getElementById('editor-title');
    const subtitleEl = document.getElementById('editor-subtitle');
    const contentEl = document.getElementById('editor-content');
    const coverInput = document.getElementById('cover-file-input');
    const dropzone = document.getElementById('cover-dropzone');

    [titleEl, subtitleEl].forEach(el => {
      if (el) {
        Utils.autoResizeTextarea(el);
        el.addEventListener('input', () => { Utils.autoResizeTextarea(el); scheduleAutosave(); });
      }
    });

    if (contentEl) {
      Utils.autoResizeTextarea(contentEl);
      contentEl.addEventListener('input', () => {
        Utils.autoResizeTextarea(contentEl);
        updateStats();
        scheduleAutosave();
      });
      contentEl.addEventListener('keydown', handleContentKeydown);
      updateStats();
    }

    if (coverInput) {
      coverInput.addEventListener('change', () => {
        const file = coverInput.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) { Toast.error('Image must be under 3MB.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
          const coverArea = document.getElementById('editor-cover-area');
          coverArea.innerHTML = `
            <div class="editor-cover-preview" id="cover-preview">
              <img src="${e.target.result}" alt="Cover image" id="cover-img" />
              <button class="editor-cover-remove" onclick="EditorActions.removeCover()" aria-label="Remove cover">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Remove
              </button>
            </div>
            <input type="file" id="cover-file-input" accept="image/*" class="visually-hidden" />
          `;
          scheduleAutosave();
        };
        reader.readAsDataURL(file);
      });
    }

    if (dropzone) {
      dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('cover-file-input').click(); });
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--color-accent)'; });
      dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          const dt = new DataTransfer();
          dt.items.add(file);
          document.getElementById('cover-file-input').files = dt.files;
          document.getElementById('cover-file-input').dispatchEvent(new Event('change'));
        }
      });
    }
  }

  function handleContentKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); EditorActions.formatText('bold'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); EditorActions.formatText('italic'); }
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      el.value = el.value.slice(0, start) + '  ' + el.value.slice(end);
      el.selectionStart = el.selectionEnd = start + 2;
    }
  }

  function updateStats() {
    const content = document.getElementById('editor-content')?.value || '';
    const words = Utils.countWords(content);
    const chars = Utils.countChars(content);
    const readTime = Utils.calcReadTime(content);
    const paras = content.split('\n\n').filter(p => p.trim()).length;
    const wc = document.getElementById('word-count');
    const rt = document.getElementById('read-time-est');
    const cc = document.getElementById('char-count');
    const pc = document.getElementById('para-count');
    if (wc) wc.textContent = `${Utils.formatNumber(words)} ${words === 1 ? 'word' : 'words'}`;
    if (rt) rt.textContent = `${readTime} min read`;
    if (cc) cc.textContent = `${Utils.formatNumber(chars)} characters`;
    if (pc) pc.textContent = `${paras} ${paras === 1 ? 'paragraph' : 'paragraphs'}`;
  }

  function getEditorData() {
    const coverImg = document.getElementById('cover-img');
    return {
      title: document.getElementById('editor-title')?.value.trim() || '',
      subtitle: document.getElementById('editor-subtitle')?.value.trim() || '',
      category: document.getElementById('editor-category')?.value || '',
      content: document.getElementById('editor-content')?.value.trim() || '',
      coverImage: coverImg ? coverImg.src : ''
    };
  }

  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      const data = getEditorData();
      const draft = { ...data, id: currentDraftId || Utils.generateId(), authorId: Auth.getCurrentUser()?.id, updatedAt: new Date().toISOString() };
      if (!currentDraftId) currentDraftId = draft.id;
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
      const status = document.getElementById('autosave-status');
      if (status) {
        status.className = 'editor-topbar-status saved';
        status.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved`;
        setTimeout(() => {
          if (status) { status.className = 'editor-topbar-status'; status.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Draft`; }
        }, 2000);
      }
    }, 1200);
  }

  const EditorActions = {
    goBack() {
      if (history.length > 1) {
        history.back();
      } else {
        Router.navigate('/');
      }
    },
    saveDraft() {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const data = getEditorData();
      if (!data.title) { Toast.error('Please add a title before saving.'); return; }
      const editId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
      const existingPost = editId ? DB.getPostById(editId) : null;

      if (existingPost) {
        DB.updatePost(existingPost.id, { ...data, status: 'draft' });
        Toast.success('Draft saved.');
      } else {
        const draftId = currentDraftId || Utils.generateId();
        currentDraftId = draftId;
        DB.saveDraft({ ...data, id: draftId, authorId: user.id, status: 'draft' });
        localStorage.removeItem(AUTOSAVE_KEY);
        Toast.success('Draft saved.');
      }
    },
    publish() {
      if (!Auth.requireAuth()) return;
      const user = Auth.getCurrentUser();
      const data = getEditorData();
      if (!data.title) { Toast.error('Please add a title before publishing.'); document.getElementById('editor-title')?.focus(); return; }
      if (!data.content || data.content.length < 20) { Toast.error('Please write some content before publishing.'); document.getElementById('editor-content')?.focus(); return; }

      const editId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
      const existingPost = editId ? DB.getPostById(editId) : null;

      if (existingPost) {
        DB.updatePost(existingPost.id, { ...data, status: 'published', publishedAt: existingPost.publishedAt || new Date().toISOString() });
        localStorage.removeItem(AUTOSAVE_KEY);
        Toast.success('Post updated.');
        Router.navigate(`/post/${existingPost.id}`);
      } else {
        const post = DB.createPost({ ...data, authorId: user.id, status: 'published', publishedAt: new Date().toISOString() });
        if (currentDraftId) DB.deleteDraft(currentDraftId);
        localStorage.removeItem(AUTOSAVE_KEY);
        Toast.success('Post published!');
        Router.navigate(`/post/${post.id}`);
      }
    },
    discardDraft() {
      localStorage.removeItem(AUTOSAVE_KEY);
      currentDraftId = null;
      const banner = document.getElementById('draft-recovery-banner');
      if (banner) banner.remove();
      document.getElementById('editor-title').value = '';
      document.getElementById('editor-subtitle').value = '';
      document.getElementById('editor-content').value = '';
      document.getElementById('editor-category').value = '';
      Toast.info('Draft discarded.');
    },
    removeCover() {
      const coverArea = document.getElementById('editor-cover-area');
      coverArea.innerHTML = `
        <div class="editor-cover-zone" id="cover-dropzone" onclick="document.getElementById('cover-file-input').click()" role="button" tabindex="0" aria-label="Add a cover image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <p>Add a cover image</p>
          <p style="font-size:var(--text-xs);color:var(--color-text-4)">JPG, PNG, GIF — max 3MB</p>
        </div>
        <input type="file" id="cover-file-input" accept="image/*" class="visually-hidden" />
      `;
      const newInput = document.getElementById('cover-file-input');
      if (newInput) newInput.addEventListener('change', () => { document.getElementById('cover-file-input').dispatchEvent(new Event('change')); });
      initEditorEvents(null);
    },
    formatText(type) {
      const ta = document.getElementById('editor-content');
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.slice(start, end);
      const wrap = type === 'bold' ? '**' : '*';
      const replacement = selected ? `${wrap}${selected}${wrap}` : `${wrap}text${wrap}`;
      ta.value = ta.value.slice(0, start) + replacement + ta.value.slice(end);
      ta.selectionStart = start + wrap.length;
      ta.selectionEnd = start + wrap.length + (selected.length || 4);
      ta.focus();
      updateStats();
      scheduleAutosave();
    },
    insertBlock(type) {
      const ta = document.getElementById('editor-content');
      if (!ta) return;
      const pos = ta.selectionStart;
      const before = ta.value.slice(0, pos);
      const after = ta.value.slice(pos);
      const needsNewline = before.length > 0 && !before.endsWith('\n\n');
      const prefix = needsNewline ? '\n\n' : '';
      const blocks = {
        h2: `${prefix}## Heading\n\n`,
        h3: `${prefix}### Subheading\n\n`,
        ul: `${prefix}- First item\n- Second item\n- Third item\n\n`,
        quote: `${prefix}> Quote text here\n\n`,
        code: `${prefix}\`code here\``,
        hr: `${prefix}---\n\n`
      };
      const insertion = blocks[type] || '';
      ta.value = before + insertion + after;
      ta.selectionStart = ta.selectionEnd = pos + insertion.length;
      ta.focus();
      Utils.autoResizeTextarea(ta);
      updateStats();
      scheduleAutosave();
    }
  };

  window.EditorActions = EditorActions;
  return { render };
})();
