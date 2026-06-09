(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.AppUtils = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  var DB_KEY = 'airdropTrackerApp';

  var STATUS_STYLES = {
    'To Do':       'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Done':        'bg-green-900 text-green-300',
    'Farmed':      'bg-purple-900 text-purple-300',
    'Snapshot':    'bg-pink-900 text-pink-300'
  };

  var ALL_STATUSES = ['all', 'To Do', 'In Progress', 'Done', 'Farmed', 'Snapshot'];

  /**
   * Escape a string for safe HTML insertion.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    if (!str) return '';
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, function (c) { return map[c]; });
  }

  /**
   * Sanitize a URL — only allow http: and https: protocols.
   * @param {string} url
   * @returns {string} sanitized URL or empty string
   */
  function sanitizeURL(url) {
    if (!url) return '';
    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch (e) { /* invalid URL */ }
    return '';
  }

  /**
   * Validate that a string is a valid base64 data-URI image.
   * @param {string} str
   * @returns {boolean}
   */
  function isValidBase64Image(str) {
    if (!str) return false;
    return /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(str);
  }

  /**
   * Return an HTML badge string for a given status (XSS-safe).
   * @param {string} status
   * @returns {string}
   */
  function getStatusBadge(status) {
    var cls = STATUS_STYLES[status] || 'bg-gray-700 text-gray-300';
    return '<span class="px-2.5 py-1 text-xs font-medium rounded-full inline-block ' +
      cls + '">' + escapeHTML(status) + '</span>';
  }

  /**
   * Filter airdrops by status.
   * @param {Array} airdrops
   * @param {string} filter – 'all' or one of the valid statuses
   * @returns {Array}
   */
  function filterAirdrops(airdrops, filter) {
    if (filter === 'all') return airdrops.slice();
    return airdrops.filter(function (a) { return a.status === filter; });
  }

  /**
   * Build an airdrop data object from form values with validation.
   * @param {{ name: string, ecosystem: string, status: string, wallet: string, tasks: string, link: string, screenshot: string }} values
   * @param {number|null} existingId – if editing, pass the existing id; otherwise null
   * @returns {{ data: Object|null, error: string }}
   */
  function createAirdropData(values, existingId) {
    var name = (values.name || '').trim();
    var ecosystem = (values.ecosystem || '').trim();
    var link = (values.link || '').trim();

    if (name.length > 200 || ecosystem.length > 200) {
      return { data: null, error: 'Nama proyek dan ekosistem maksimal 200 karakter.' };
    }

    var safeLink = link ? sanitizeURL(link) : '';
    if (link && !safeLink) {
      return { data: null, error: 'URL tidak valid. Gunakan http:// atau https://' };
    }

    return {
      data: {
        id: existingId != null ? existingId : Date.now(),
        name: name,
        ecosystem: ecosystem,
        status: values.status || 'To Do',
        wallet: (values.wallet || '').trim(),
        tasks: (values.tasks || '').trim(),
        link: safeLink,
        screenshot: values.screenshot || ''
      },
      error: ''
    };
  }

  /**
   * Export airdrops array to a JSON string.
   * @param {Array} airdrops
   * @returns {string}
   */
  function exportAirdrops(airdrops) {
    return JSON.stringify(airdrops, null, 2);
  }

  /**
   * Import airdrops from a JSON string.
   * Returns the parsed array or throws on invalid input.
   * @param {string} jsonString
   * @returns {Array}
   */
  function importAirdrops(jsonString) {
    var data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Data yang diimpor harus berupa array.');
    }
    return data;
  }

  /**
   * Perform logout: clear currentUser from appData.
   * @param {{ currentUser: string|null }} appData
   * @returns {{ currentUser: null }}
   */
  function performLogout(appData) {
    appData.currentUser = null;
    return appData;
  }

  /**
   * Load airdrops for the current user from appData.
   * @param {{ users: Object, currentUser: string|null }} appData
   * @returns {Array}
   */
  function loadUserAirdrops(appData) {
    var user = appData.currentUser;
    if (user && appData.users[user]) {
      return appData.users[user].airdrops || [];
    }
    return [];
  }

  /**
   * Save airdrops for the current user into appData.
   * Mutates appData.users[currentUser].airdrops.
   * @param {{ users: Object, currentUser: string|null }} appData
   * @param {Array} airdrops
   */
  function saveUserAirdrops(appData, airdrops) {
    var user = appData.currentUser;
    if (user && appData.users[user]) {
      appData.users[user].airdrops = airdrops;
    }
  }

  return {
    DB_KEY: DB_KEY,
    STATUS_STYLES: STATUS_STYLES,
    ALL_STATUSES: ALL_STATUSES,
    escapeHTML: escapeHTML,
    sanitizeURL: sanitizeURL,
    isValidBase64Image: isValidBase64Image,
    getStatusBadge: getStatusBadge,
    filterAirdrops: filterAirdrops,
    createAirdropData: createAirdropData,
    exportAirdrops: exportAirdrops,
    importAirdrops: importAirdrops,
    performLogout: performLogout,
    loadUserAirdrops: loadUserAirdrops,
    saveUserAirdrops: saveUserAirdrops
  };
});
