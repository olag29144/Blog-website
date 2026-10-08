const Auth = (() => {
  function getCurrentUser() {
    return DB.getCurrentUser();
  }

  function isLoggedIn() {
    return !!DB.getCurrentUser();
  }

  function register({ name, username, email, password, avatar }) {
    name = name.trim();
    username = username.trim();
    email = email.trim().toLowerCase();

    if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' };
    if (!username || username.length < 3) return { error: 'Username must be at least 3 characters.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { error: 'Username can only contain letters, numbers, and underscores.' };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
    if (!password || password.length < 6) return { error: 'Password must be at least 6 characters.' };

    if (DB.getUserByEmail(email)) return { error: 'An account with this email already exists.' };
    if (DB.getUserByUsername(username)) return { error: 'That username is already taken.' };

    const user = DB.createUser({ name, username, email, password, avatar: avatar || '', bio: '' });
    const sessionUser = sanitizeUser(user);
    DB.setCurrentUser(sessionUser);
    return { user: sessionUser };
  }

  function login({ identifier, password }) {
    identifier = identifier.trim();
    if (!identifier || !password) return { error: 'Please fill in all fields.' };

    let user = DB.getUserByEmail(identifier.toLowerCase());
    if (!user) user = DB.getUserByUsername(identifier);
    if (!user) return { error: 'No account found with that email or username.' };
    if (user.password !== password) return { error: 'Incorrect password.' };

    const sessionUser = sanitizeUser(user);
    DB.setCurrentUser(sessionUser);
    return { user: sessionUser };
  }

  function logout() {
    DB.clearCurrentUser();
  }

  function updateProfile({ name, username, bio, avatar }) {
    const current = DB.getCurrentUser();
    if (!current) return { error: 'Not logged in.' };

    name = (name || '').trim();
    username = (username || '').trim();

    if (!name || name.length < 2) return { error: 'Name must be at least 2 characters.' };
    if (!username || username.length < 3) return { error: 'Username must be at least 3 characters.' };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { error: 'Username can only contain letters, numbers, and underscores.' };

    const existingByUsername = DB.getUserByUsername(username);
    if (existingByUsername && existingByUsername.id !== current.id) {
      return { error: 'That username is already taken.' };
    }

    const updated = DB.updateUser(current.id, { name, username, bio: bio || '', avatar: avatar !== undefined ? avatar : current.avatar });
    if (!updated) return { error: 'Failed to update profile.' };

    const sessionUser = sanitizeUser(updated);
    DB.setCurrentUser(sessionUser);
    return { user: sessionUser };
  }

  function refreshCurrentUser() {
    const current = DB.getCurrentUser();
    if (!current) return null;
    const fresh = DB.getUserById(current.id);
    if (!fresh) return null;
    const sessionUser = sanitizeUser(fresh);
    DB.setCurrentUser(sessionUser);
    return sessionUser;
  }

  function sanitizeUser(user) {
    const { password: _pw, ...safe } = user;
    return safe;
  }

  function requireAuth(callback) {
    if (!isLoggedIn()) {
      Router.navigate('/login');
      return false;
    }
    if (callback) callback();
    return true;
  }

  return { getCurrentUser, isLoggedIn, register, login, logout, updateProfile, refreshCurrentUser, requireAuth };
})();
