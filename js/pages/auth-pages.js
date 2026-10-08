const AuthPages = (() => {
  function renderLogin(container) {
    if (Auth.isLoggedIn()) { Router.navigate('/'); return; }
    container.innerHTML = `
      <div class="auth-page" id="page-root-inner">
        <div class="auth-card">
          <div class="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
              <rect width="28" height="28" rx="7" fill="#16a34a"/>
              <path d="M14.8 8C11.6 8 9 10.6 9 13.9c0 3.3 2.6 5.9 5.8 5.9 1.5 0 2.8-.5 3.8-1.4v-3h-4v1.6h2.2v.7c-.6.4-1.3.6-2 .6-2.3 0-4-1.8-4-4.3 0-2.4 1.7-4.3 4-4.3 1.1 0 2.1.4 2.8 1.1l1.1-1.2C17.8 8.6 16.4 8 14.8 8z" fill="white"/>
            </svg>
            <span style="font-weight:700;font-size:1.125rem;letter-spacing:-0.03em;color:var(--color-text)">Gabby <span style="color:#16a34a">Blogs</span></span>
          </div>
          <p class="auth-subheading">Sign in to continue writing and reading.</p>
          <form class="auth-form" id="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-identifier">Email or username</label>
              <input class="form-input" type="text" id="login-identifier" name="identifier" placeholder="you@example.com" autocomplete="username" required />
              <span class="form-error hidden" id="login-identifier-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div style="position:relative">
                <input class="form-input" type="password" id="login-password" name="password" placeholder="••••••••" autocomplete="current-password" required style="padding-right:44px" />
                <button type="button" id="login-pw-toggle" aria-label="Toggle password visibility" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--color-text-4);display:flex;cursor:pointer;background:none;border:none;padding:0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="pw-eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="form-error hidden" id="login-password-error" role="alert"></span>
            </div>
            <span class="form-error hidden" id="login-general-error" role="alert"></span>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="login-submit">Sign in</button>
          </form>
          <p class="auth-switch">Don't have an account? <a onclick="Router.navigate('/register')">Create one</a></p>
        </div>
      </div>
    `;
    bindLoginEvents();
  }

  function bindLoginEvents() {
    const form = document.getElementById('login-form');
    const pwToggle = document.getElementById('login-pw-toggle');
    const pwInput = document.getElementById('login-password');

    if (pwToggle) {
      pwToggle.addEventListener('click', () => {
        const isPassword = pwInput.type === 'password';
        pwInput.type = isPassword ? 'text' : 'password';
        document.getElementById('pw-eye-icon').innerHTML = isPassword
          ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-submit');
        btn.disabled = true;
        btn.textContent = 'Signing in…';
        const result = Auth.login({ identifier, password });
        if (result.error) {
          showError('login-general-error', result.error);
          btn.disabled = false;
          btn.textContent = 'Sign in';
        } else {
          Nav.update();
          Toast.success(`Welcome back, ${result.user.name.split(' ')[0]}!`);
          Router.navigate('/');
        }
      });
    }
  }

  function renderRegister(container) {
    if (Auth.isLoggedIn()) { Router.navigate('/'); return; }
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-card" style="max-width:500px">
          <div class="auth-logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
              <rect width="28" height="28" rx="7" fill="#16a34a"/>
              <path d="M14.8 8C11.6 8 9 10.6 9 13.9c0 3.3 2.6 5.9 5.8 5.9 1.5 0 2.8-.5 3.8-1.4v-3h-4v1.6h2.2v.7c-.6.4-1.3.6-2 .6-2.3 0-4-1.8-4-4.3 0-2.4 1.7-4.3 4-4.3 1.1 0 2.1.4 2.8 1.1l1.1-1.2C17.8 8.6 16.4 8 14.8 8z" fill="white"/>
            </svg>
            <span style="font-weight:700;font-size:1.125rem;letter-spacing:-0.03em;color:var(--color-text)">Gabby <span style="color:#16a34a">Blogs</span></span>
          </div>
          <h1 class="auth-heading">Create your account</h1>
          <p class="auth-subheading">Start writing and sharing your ideas with the world.</p>
          <form class="auth-form" id="register-form" novalidate>
            <div class="avatar-upload">
              <div class="avatar-upload-preview" id="avatar-upload-preview" role="button" tabindex="0" aria-label="Upload profile picture">
                <div class="avatar avatar-xl" id="avatar-preview" style="background:var(--color-bg-3);color:var(--color-text-4)">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div class="avatar-upload-overlay" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
              <p class="avatar-upload-label">Click to upload a profile photo (optional)</p>
              <input type="file" id="avatar-file-input" accept="image/*" class="visually-hidden" aria-label="Choose profile picture" />
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
              <div class="form-group">
                <label class="form-label" for="reg-name">Full name</label>
                <input class="form-input" type="text" id="reg-name" name="name" placeholder="Jane Smith" autocomplete="name" required />
                <span class="form-error hidden" id="reg-name-error" role="alert"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-username">Username</label>
                <input class="form-input" type="text" id="reg-username" name="username" placeholder="janesmith" autocomplete="username" required />
                <span class="form-error hidden" id="reg-username-error" role="alert"></span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-email">Email address</label>
              <input class="form-input" type="email" id="reg-email" name="email" placeholder="you@example.com" autocomplete="email" required />
              <span class="form-error hidden" id="reg-email-error" role="alert"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <div style="position:relative">
                <input class="form-input" type="password" id="reg-password" name="password" placeholder="At least 6 characters" autocomplete="new-password" required style="padding-right:44px" />
                <button type="button" id="reg-pw-toggle" aria-label="Toggle password visibility" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--color-text-4);display:flex;cursor:pointer;background:none;border:none;padding:0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="form-error hidden" id="reg-password-error" role="alert"></span>
            </div>
            <span class="form-error hidden" id="reg-general-error" role="alert"></span>
            <button type="submit" class="btn btn-primary w-full btn-lg" id="reg-submit">Create account</button>
          </form>
          <p class="auth-switch">Already have an account? <a onclick="Router.navigate('/login')">Sign in</a></p>
        </div>
      </div>
    `;
    bindRegisterEvents();
  }

  function bindRegisterEvents() {
    let avatarDataUrl = '';
    const preview = document.getElementById('avatar-upload-preview');
    const fileInput = document.getElementById('avatar-file-input');
    const avatarEl = document.getElementById('avatar-preview');

    if (preview) {
      preview.addEventListener('click', () => fileInput.click());
      preview.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
    }

    if (fileInput) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { Toast.error('Image must be under 2MB.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
          avatarDataUrl = e.target.result;
          avatarEl.innerHTML = `<img src="${avatarDataUrl}" alt="Profile preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
        };
        reader.readAsDataURL(file);
      });
    }

    const pwToggle = document.getElementById('reg-pw-toggle');
    const pwInput = document.getElementById('reg-password');
    if (pwToggle) {
      pwToggle.addEventListener('click', () => {
        pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
      });
    }

    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();
        const name = document.getElementById('reg-name').value;
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const btn = document.getElementById('reg-submit');
        btn.disabled = true;
        btn.textContent = 'Creating account…';
        const result = Auth.register({ name, username, email, password, avatar: avatarDataUrl });
        if (result.error) {
          showError('reg-general-error', result.error);
          btn.disabled = false;
          btn.textContent = 'Create account';
        } else {
          Nav.update();
          Toast.success(`Welcome to Gabby Blogs, ${result.user.name.split(' ')[0]}!`);
          Router.navigate('/');
        }
      });
    }
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  }

  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.add('hidden');
    });
  }

  return { renderLogin, renderRegister };
})();
