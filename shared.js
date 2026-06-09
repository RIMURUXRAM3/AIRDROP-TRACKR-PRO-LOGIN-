/**
 * Shared utilities for Airdrop Tracker Pro.
 *
 * Single source of truth for the localStorage key, DOM helpers,
 * persistence, and navigation used across both login and app pages.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.Shared = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  var DB_KEY = 'airdropTrackerApp';

  /**
   * Shorthand for document.getElementById.
   * @param {string} id
   * @returns {HTMLElement|null}
   */
  function getEl(id) {
    return document.getElementById(id);
  }

  /**
   * Load the full application state from a storage-like object.
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
   * Persist the full application state to a storage-like object.
   * @param {Storage} storage
   * @param {{ users: Object, currentUser: string|null }} appData
   */
  function saveAppData(storage, appData) {
    storage.setItem(DB_KEY, JSON.stringify(appData));
  }

  /**
   * Navigate to another page.
   * @param {string} page
   */
  function navigateTo(page) {
    window.location.href = page;
  }

  return {
    DB_KEY: DB_KEY,
    getEl: getEl,
    loadAppData: loadAppData,
    saveAppData: saveAppData,
    navigateTo: navigateTo
  };
});
