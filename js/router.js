const Router = (() => {
  const routes = {};
  let currentPath = null;
  let currentCleanup = null;

  function define(path, handler) {
    routes[path] = handler;
  }

  function matchRoute(hash) {
    const path = (hash.replace(/^#/, '') || '/').split('?')[0];
    if (routes[path]) return { handler: routes[path], params: {} };

    for (const pattern of Object.keys(routes)) {
      const patternParts = pattern.split('/');
      const pathParts = path.split('/');
      if (patternParts.length !== pathParts.length) continue;

      const params = {};
      let matched = true;
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        } else if (patternParts[i] !== pathParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { handler: routes[pattern], params };
    }
    return null;
  }

  function resolve() {
    const hash = location.hash || '#/';
    const match = matchRoute(hash.slice(1));

    if (currentCleanup && typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const pageRoot = document.getElementById('page-root');
    if (!pageRoot) return;

    if (!match) {
      pageRoot.innerHTML = `
        <div class="empty-state" style="padding-top:var(--space-24)">
          <div class="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 class="empty-state-title">Page Not Found</h2>
          <p class="empty-state-text">The page you are looking for does not exist.</p>
          <button class="btn btn-primary" onclick="Router.navigate('/')">Go Home</button>
        </div>`;
      return;
    }

    currentPath = hash;
    pageRoot.innerHTML = '';
    const cleanup = match.handler(pageRoot, match.params);
    if (typeof cleanup === 'function') {
      currentCleanup = cleanup;
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    Nav.update();
  }

  function navigate(path) {
    const hash = path.startsWith('#') ? path : '#' + path;
    if (location.hash === hash) {
      resolve();
    } else {
      location.hash = hash.slice(1);
    }
  }

  function getCurrentPath() {
    return ((location.hash || '#/').slice(1)).split('?')[0];
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  return { define, navigate, getCurrentPath, init };
})();
