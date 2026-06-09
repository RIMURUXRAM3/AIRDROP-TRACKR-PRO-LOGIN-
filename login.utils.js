(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./shared'));
  } else {
    root.LoginUtils = factory(root.Shared);
  }
})(typeof window !== 'undefined' ? window : this, function (Shared) {
  var DB_KEY = Shared.DB_KEY;

  /**
   * Hash a password using base64 encoding.
   * @param {string} password
   * @returns {string}
   */
  function hashPassword(password) {
    return btoa(password);
  }

  /**
   * Load app data from a storage-like object (must implement getItem).
   * Returns the parsed object or a fresh default.
   * @param {Storage} storage
   * @returns {{ users: Object, currentUser: string|null }}
   */
  function loadAppData(storage) {
    return Shared.loadAppData(storage);
  }

  /**
   * Persist app data to a storage-like object.
   * @param {Storage} storage
   * @param {{ users: Object, currentUser: string|null }} appData
   */
  function saveAppData(storage, appData) {
    Shared.saveAppData(storage, appData);
  }

  /**
   * Validate that both username and password are non-empty.
   * @param {string} username
   * @param {string} password
   * @returns {{ valid: boolean, error: string }}
   */
  function validateCredentials(username, password) {
    if (!username || !password) {
      return { valid: false, error: 'Username dan password tidak boleh kosong.' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Attempt to register a new user.
   * Mutates appData.users on success.
   * @param {{ users: Object }} appData
   * @param {string} username  – already trimmed & lowered
   * @param {string} password
   * @returns {{ success: boolean, error: string }}
   */
  function registerUser(appData, username, password) {
    var v = validateCredentials(username, password);
    if (!v.valid) return { success: false, error: v.error };

    if (appData.users[username]) {
      return { success: false, error: 'Username sudah digunakan.' };
    }

    appData.users[username] = { password: hashPassword(password), airdrops: [] };
    return { success: true, error: '' };
  }

  /**
   * Attempt to authenticate a user.
   * @param {{ users: Object }} appData
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, error: string }}
   */
  function authenticateUser(appData, username, password) {
    var user = appData.users[username];
    if (user && user.password === hashPassword(password)) {
      return { success: true, error: '' };
    }
    return { success: false, error: 'Username atau password salah.' };
  }

  return {
    DB_KEY: DB_KEY,
    hashPassword: hashPassword,
    loadAppData: loadAppData,
    saveAppData: saveAppData,
    validateCredentials: validateCredentials,
    registerUser: registerUser,
    authenticateUser: authenticateUser
  };
});
