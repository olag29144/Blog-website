window.addEventListener('DOMContentLoaded', () => {
  DB.seedIfNeeded();
  Theme.init();
  Nav.render();

  Router.define('/', (container) => HomePage.render(container));
  Router.define('/explore', (container) => ExplorePage.render(container));
  Router.define('/post/:id', (container, params) => PostPage.render(container, params));
  Router.define('/editor', (container, params) => EditorPage.render(container, params));
  Router.define('/profile/:username', (container, params) => ProfilePage.render(container, params));
  Router.define('/saved', (container) => SavedPage.render(container));
  Router.define('/notifications', (container) => NotificationsPage.render(container));
  Router.define('/search', (container, params) => SearchPage.render(container, params));
  Router.define('/login', (container) => AuthPages.renderLogin(container));
  Router.define('/register', (container) => AuthPages.renderRegister(container));

  Router.init();
});
