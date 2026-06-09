(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./shared'));
  } else {
    root.AppUtils = factory(root.Shared);
  }
})(typeof window !== 'undefined' ? window : this, function (Shared) {
  var DB_KEY = Shared.DB_KEY;

  var STATUS_STYLES = {
    'To Do':       'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Done':        'bg-green-900 text-green-300',
    'Farmed':      'bg-purple-900 text-purple-300',
    'Snapshot':    'bg-pink-900 text-pink-300'
  };

  var ALL_STATUSES = ['all', 'To Do', 'In Progress', 'Done', 'Farmed', 'Snapshot'];

  /**
   * Return an HTML badge string for a given status.
   * @param {string} status
   * @returns {string}
   */
  function getStatusBadge(status) {
    var cls = STATUS_STYLES[status] || 'bg-gray-700 text-gray-300';
    return '<span class="px-2.5 py-1 text-xs font-medium rounded-full inline-block ' +
      cls + '">' + status + '</span>';
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
   * Build an airdrop data object from form values.
   * @param {{ name: string, ecosystem: string, status: string, wallet: string, tasks: string, link: string, screenshot: string }} values
   * @param {number|null} existingId – if editing, pass the existing id; otherwise null
   * @returns {Object}
   */
  function createAirdropData(values, existingId) {
    return {
      id: existingId != null ? existingId : Date.now(),
      name: (values.name || '').trim(),
      ecosystem: (values.ecosystem || '').trim(),
      status: values.status || 'To Do',
      wallet: (values.wallet || '').trim(),
      tasks: (values.tasks || '').trim(),
      link: (values.link || '').trim(),
      screenshot: values.screenshot || ''
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
