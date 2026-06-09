(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.LoginUtils = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  var DB_KEY = 'airdropTrackerApp';

  // Forbidden property names to prevent prototype pollution
  var FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf'];

  /**
   * Check if a key is safe from prototype pollution.
   * @param {string} key
   * @returns {boolean}
   */
  function isSafeKey(key) {
    return FORBIDDEN_KEYS.indexOf(key) === -1;
  }

  /**
   * Validate username format: 3-30 chars, alphanumeric + underscore only.
   * @param {string} username
   * @returns {boolean}
   */
  function isValidUsername(username) {
    return /^[a-z0-9_]{3,30}$/.test(username);
  }

  /**
   * Hash a password using SHA-256 (async, uses SubtleCrypto API).
   * Falls back to a simple hash for non-browser environments (testing).
   * @param {string} password
   * @returns {Promise<string>}
   */
  function hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      var encoder = new TextEncoder();
      var data = encoder.encode(password);
      return crypto.subtle.digest('SHA-256', data).then(function (hashBuffer) {
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      });
    }
    // Fallback for Node.js test environment
    if (typeof require !== 'undefined') {
      var cryptoNode = require('crypto');
      return Promise.resolve(cryptoNode.createHash('sha256').update(password).digest('hex'));
    }
    return Promise.resolve(password);
  }

  /**
   * Load app data from a storage-like object (must implement getItem).
   * Returns the parsed object or a fresh default.
   * @param {Storage} storage
   * @returns {{ users: Object, currentUser: string|null }}
   */
  function loadAppData(storage) {
    try {
      var raw = storage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : { users: {}, currentUser: null };
    } catch (_e) {
      return { users: {}, currentUser: null };
    }
  }

  /**
   * Persist app data to a storage-like object.
   * @param {Storage} storage
   * @param {{ users: Object, currentUser: string|null }} appData
   */
  function saveAppData(storage, appData) {
    storage.setItem(DB_KEY, JSON.stringify(appData));
  }

  /**
   * Validate credentials with strong rules.
   * @param {string} username
   * @param {string} password
   * @returns {{ valid: boolean, error: string }}
   */
  function validateCredentials(username, password) {
    if (!username || !password) {
      return { valid: false, error: 'Username dan password tidak boleh kosong.' };
    }
    if (!isSafeKey(username)) {
      return { valid: false, error: 'Username tidak valid.' };
    }
    if (!isValidUsername(username)) {
      return { valid: false, error: 'Username harus 3-30 karakter (huruf, angka, underscore).' };
    }
    if (password.length < 6) {
      return { valid: false, error: 'Password minimal 6 karakter.' };
    }
    if (password.length > 128) {
      return { valid: false, error: 'Password maksimal 128 karakter.' };
    }
    return { valid: true, error: '' };
  }

  /**
   * Attempt to register a new user.
   * Mutates appData.users on success.
   * @param {{ users: Object }} appData
   * @param {string} username  – already trimmed & lowered
   * @param {string} password
   * @returns {Promise<{ success: boolean, error: string }>}
   */
  function registerUser(appData, username, password) {
    var v = validateCredentials(username, password);
    if (!v.valid) return Promise.resolve({ success: false, error: v.error });

    if (Object.prototype.hasOwnProperty.call(appData.users, username)) {
      return Promise.resolve({ success: false, error: 'Username sudah digunakan.' });
    }

    return hashPassword(password).then(function (hashed) {
      appData.users[username] = { password: hashed, airdrops: [] };
      return { success: true, error: '' };
    });
  }

  /**
   * Attempt to authenticate a user.
   * @param {{ users: Object }} appData
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: boolean, error: string }>}
   */
  function authenticateUser(appData, username, password) {
    if (!isSafeKey(username)) {
      return Promise.resolve({ success: false, error: 'Username tidak valid.' });
    }

    var user = Object.prototype.hasOwnProperty.call(appData.users, username)
      ? appData.users[username]
      : null;

    if (!user) {
      return Promise.resolve({ success: false, error: 'Username atau password salah.' });
    }

    return hashPassword(password).then(function (hashed) {
      if (user.password === hashed) {
        return { success: true, error: '' };
      }
      return { success: false, error: 'Username atau password salah.' };
    });
  }

  return {
    DB_KEY: DB_KEY,
    hashPassword: hashPassword,
    isSafeKey: isSafeKey,
    isValidUsername: isValidUsername,
    loadAppData: loadAppData,
    saveAppData: saveAppData,
    validateCredentials: validateCredentials,
    registerUser: registerUser,
    authenticateUser: authenticateUser
  };
});
