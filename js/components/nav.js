const Nav = (() => {
  function render() {
    const root = document.getElementById('nav-root');
    if (!root) return;
    root.innerHTML = buildNav();
    bindEvents();
  }

  function buildNav() {
    const user = Auth.getCurrentUser();
    const path = Router.getCurrentPath();
    const unread = user ? DB.getUnreadNotificationCount(user.id) : 0;

    return `
      <nav class="nav" role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
          <div class="nav-logo" onclick="Router.navigate('/')" role="button" tabindex="0" aria-label="Gabby Blogs home">
            <div class="nav-logo-icon">
              <img src="https://res.cloudinary.com/sbja6tt8/image/upload/v1791463032/ChatGPT_Image_Oct_8_2026_01_32_02_PM.png" alt="Gabby Blogs logo" class="nav-logo-img" />
            </div>
            <span style="font-family:'Inter',sans-serif;font-weight:700;font-size:1.0625rem;letter-spacing:-0.03em;color:var(--color-text)">Gabby <span style="color:var(--color-accent)">Blogs</span></span>
          </div>

          <div class="nav-links" role="list">
            <a class="nav-link ${path === '/' ? 'active' : ''}" onclick="Router.navigate('/')" role="listitem" tabindex="0" aria-label="Home">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </a>
            <a class="nav-link ${path === '/explore' ? 'active' : ''}" onclick="Router.navigate('/explore')" role="listitem" tabindex="0" aria-label="Explore">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Explore
            </a>
            ${user ? `
            <a class="nav-link ${path === '/saved' ? 'active' : ''}" onclick="Router.navigate('/saved')" role="listitem" tabindex="0" aria-label="Saved posts">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              Saved
            </a>` : ''}
          </div>

          <div class="nav-actions">
            <button class="nav-search-btn" onclick="Router.navigate('/search')" aria-label="Search" title="Search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>

            <button class="theme-toggle" data-theme-toggle onclick="Theme.toggle()" aria-label="Toggle theme" title="Toggle theme"></button>

            ${user ? `
              <button class="nav-notif-btn" onclick="Router.navigate('/notifications')" aria-label="Notifications${unread > 0 ? `, ${unread} unread` : ''}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                ${unread > 0 ? `<span class="notif-badge" aria-hidden="true">${unread > 99 ? '99+' : unread}</span>` : ''}
              </button>

              <button class="nav-write-btn" onclick="Router.navigate('/editor')" aria-label="Write a new post">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Write</span>
              </button>

              <div style="position:relative" id="nav-avatar-wrapper">
                <button class="nav-avatar-btn" id="nav-avatar-btn" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">
                  ${Utils.renderAvatar(user, 'avatar-sm')}
                </button>
              </div>
            ` : `
              <div class="nav-auth-btns">
                <button class="btn btn-secondary btn-sm" onclick="Router.navigate('/login')">Sign in</button>
                <button class="btn btn-primary btn-sm" onclick="Router.navigate('/register')">Get started</button>
              </div>
            `}

            <button class="nav-mobile-toggle" id="nav-mobile-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="nav-hamburger-icon">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div class="nav-mobile-menu" id="nav-mobile-menu" role="menu">
        <a class="nav-mobile-link ${path === '/' ? 'active' : ''}" onclick="closeMobileMenu(); Router.navigate('/')" role="menuitem" tabindex="0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </a>
        <a class="nav-mobile-link ${path === '/explore' ? 'active' : ''}" onclick="closeMobileMenu(); Router.navigate('/explore')" role="menuitem" tabindex="0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Explore
        </a>
        <a class="nav-mobile-link" onclick="closeMobileMenu(); Router.navigate('/search')" role="menuitem" tabindex="0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Search
        </a>
        ${user ? `
          <a class="nav-mobile-link ${path === '/saved' ? 'active' : ''}" onclick="closeMobileMenu(); Router.navigate('/saved')" role="menuitem" tabindex="0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Saved
          </a>
          <a class="nav-mobile-link ${path === '/notifications' ? 'active' : ''}" onclick="closeMobileMenu(); Router.navigate('/notifications')" role="menuitem" tabindex="0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notifications ${unread > 0 ? `<span class="notif-badge" style="position:static;margin-left:4px">${unread}</span>` : ''}
          </a>
          <a class="nav-mobile-link ${path === '/editor' ? 'active' : ''}" onclick="closeMobileMenu(); Router.navigate('/editor')" role="menuitem" tabindex="0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Write a Post
          </a>
          <hr class="divider" style="margin:var(--space-2) 0">
          <a class="nav-mobile-link" onclick="closeMobileMenu(); Router.navigate('/profile/${user.username}')" role="menuitem" tabindex="0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            My Profile
          </a>
          <a class="nav-mobile-link" onclick="closeMobileMenu(); handleSignOut()" role="menuitem" tabindex="0" style="color:var(--color-danger)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </a>
        ` : `
          <hr class="divider" style="margin:var(--space-2) 0">
          <div style="padding:var(--space-3) var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)">
            <button class="btn btn-secondary w-full" style="height:44px;font-size:var(--text-base)" onclick="closeMobileMenu(); Router.navigate('/login')">Sign in</button>
            <button class="btn btn-primary w-full" style="height:44px;font-size:var(--text-base)" onclick="closeMobileMenu(); Router.navigate('/register')">Get started</button>
          </div>
        `}
        <div style="margin-top:var(--space-2);padding:var(--space-3) var(--space-4)">
          <button class="theme-toggle" data-theme-toggle onclick="Theme.toggle()" aria-label="Toggle theme" style="width:auto;display:flex;align-items:center;gap:var(--space-2);color:var(--color-text-3);font-size:var(--text-sm)">
            <span>Toggle theme</span>
          </button>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    Theme.updateToggleIcons(Theme.current());

    const toggleBtn = document.getElementById('nav-mobile-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const menu = document.getElementById('nav-mobile-menu');
        const isOpen = menu.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        toggleBtn.innerHTML = isOpen
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
      });
    }

    const avatarBtn = document.getElementById('nav-avatar-btn');
    const avatarWrapper = document.getElementById('nav-avatar-wrapper');
    if (avatarBtn && avatarWrapper) {
      avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const existing = avatarWrapper.querySelector('.dropdown');
        if (existing) { existing.remove(); return; }
        const dropdown = buildAvatarDropdown();
        avatarWrapper.appendChild(dropdown);
        avatarBtn.setAttribute('aria-expanded', 'true');
        Utils.onOutsideClick(avatarWrapper, () => {
          dropdown.remove();
          avatarBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    document.querySelectorAll('.nav-link, .nav-logo, .nav-mobile-link').forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });
  }

  function buildAvatarDropdown() {
    const user = Auth.getCurrentUser();
    const div = document.createElement('div');
    div.className = 'dropdown';
    div.setAttribute('role', 'menu');
    div.innerHTML = `
      <div class="dropdown-header">
        <div class="dropdown-header-name">${Utils.escapeHtml(user.name)}</div>
        <div class="dropdown-header-username">@${Utils.escapeHtml(user.username)}</div>
      </div>
      <button class="dropdown-item" onclick="this.closest('.dropdown').remove(); Router.navigate('/profile/${user.username}')" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        My Profile
      </button>
      <button class="dropdown-item" onclick="this.closest('.dropdown').remove(); Router.navigate('/editor')" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Write a Post
      </button>
      <button class="dropdown-item" onclick="this.closest('.dropdown').remove(); Router.navigate('/saved')" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        Saved Posts
      </button>
      <button class="dropdown-item" onclick="this.closest('.dropdown').remove(); Router.navigate('/notifications')" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Notifications
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-item danger" onclick="this.closest('.dropdown').remove(); handleSignOut()" role="menuitem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>
    `;
    return div;
  }

  function update() {
    render();
  }

  return { render, update };
})();

function closeMobileMenu() {
  const menu = document.getElementById('nav-mobile-menu');
  const toggleBtn = document.getElementById('nav-mobile-toggle');
  if (menu) menu.classList.remove('open');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  }
}

function handleSignOut() {
  Auth.logout();
  Nav.update();
  Router.navigate('/');
  Toast.success('You have been signed out.');
}
