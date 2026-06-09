const AppUtils = require('../app.utils');

describe('AppUtils', () => {
  // ---------------------------------------------------------------
  // getStatusBadge
  // ---------------------------------------------------------------
  describe('getStatusBadge', () => {
    it('should return correct badge for "To Do"', () => {
      const badge = AppUtils.getStatusBadge('To Do');
      expect(badge).toContain('bg-yellow-900');
      expect(badge).toContain('text-yellow-300');
      expect(badge).toContain('>To Do</span>');
    });

    it('should return correct badge for "In Progress"', () => {
      const badge = AppUtils.getStatusBadge('In Progress');
      expect(badge).toContain('bg-blue-900');
      expect(badge).toContain('>In Progress</span>');
    });

    it('should return correct badge for "Done"', () => {
      const badge = AppUtils.getStatusBadge('Done');
      expect(badge).toContain('bg-green-900');
    });

    it('should return correct badge for "Farmed"', () => {
      const badge = AppUtils.getStatusBadge('Farmed');
      expect(badge).toContain('bg-purple-900');
    });

    it('should return correct badge for "Snapshot"', () => {
      const badge = AppUtils.getStatusBadge('Snapshot');
      expect(badge).toContain('bg-pink-900');
    });

    it('should fall back to gray for unknown status', () => {
      const badge = AppUtils.getStatusBadge('Unknown');
      expect(badge).toContain('bg-gray-700');
      expect(badge).toContain('>Unknown</span>');
    });

    it('should always wrap in a <span>', () => {
      expect(AppUtils.getStatusBadge('Done')).toMatch(/^<span .+<\/span>$/);
    });
  });

  // ---------------------------------------------------------------
  // filterAirdrops
  // ---------------------------------------------------------------
  describe('filterAirdrops', () => {
    const airdrops = [
      { id: 1, name: 'A', status: 'To Do' },
      { id: 2, name: 'B', status: 'Done' },
      { id: 3, name: 'C', status: 'To Do' },
      { id: 4, name: 'D', status: 'In Progress' }
    ];

    it('should return all airdrops when filter is "all"', () => {
      const result = AppUtils.filterAirdrops(airdrops, 'all');
      expect(result).toHaveLength(4);
    });

    it('should return a copy, not the original array', () => {
      const result = AppUtils.filterAirdrops(airdrops, 'all');
      expect(result).not.toBe(airdrops);
      expect(result).toEqual(airdrops);
    });

    it('should filter by "To Do" status', () => {
      const result = AppUtils.filterAirdrops(airdrops, 'To Do');
      expect(result).toHaveLength(2);
      result.forEach(a => expect(a.status).toBe('To Do'));
    });

    it('should filter by "Done" status', () => {
      const result = AppUtils.filterAirdrops(airdrops, 'Done');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('B');
    });

    it('should return empty array if no match', () => {
      const result = AppUtils.filterAirdrops(airdrops, 'Farmed');
      expect(result).toHaveLength(0);
    });

    it('should handle empty airdrops array', () => {
      expect(AppUtils.filterAirdrops([], 'all')).toEqual([]);
      expect(AppUtils.filterAirdrops([], 'Done')).toEqual([]);
    });
  });

  // ---------------------------------------------------------------
  // createAirdropData
  // ---------------------------------------------------------------
  describe('createAirdropData', () => {
    it('should create airdrop with provided values', () => {
      const values = {
        name: ' My Project ',
        ecosystem: ' Ethereum ',
        status: 'In Progress',
        wallet: ' 0x123 ',
        tasks: ' some tasks ',
        link: ' https://example.com ',
        screenshot: 'base64data'
      };
      const result = AppUtils.createAirdropData(values, null);
      expect(result.name).toBe('My Project');
      expect(result.ecosystem).toBe('Ethereum');
      expect(result.status).toBe('In Progress');
      expect(result.wallet).toBe('0x123');
      expect(result.tasks).toBe('some tasks');
      expect(result.link).toBe('https://example.com');
      expect(result.screenshot).toBe('base64data');
      expect(typeof result.id).toBe('number');
    });

    it('should use existingId when provided', () => {
      const result = AppUtils.createAirdropData({ name: 'A' }, 42);
      expect(result.id).toBe(42);
    });

    it('should generate a new id when existingId is null', () => {
      const before = Date.now();
      const result = AppUtils.createAirdropData({ name: 'A' }, null);
      expect(result.id).toBeGreaterThanOrEqual(before);
    });

    it('should default status to "To Do"', () => {
      const result = AppUtils.createAirdropData({}, null);
      expect(result.status).toBe('To Do');
    });

    it('should handle undefined fields gracefully', () => {
      const result = AppUtils.createAirdropData({}, null);
      expect(result.name).toBe('');
      expect(result.ecosystem).toBe('');
      expect(result.wallet).toBe('');
      expect(result.tasks).toBe('');
      expect(result.link).toBe('');
      expect(result.screenshot).toBe('');
    });

    it('should preserve existingId 0', () => {
      const result = AppUtils.createAirdropData({ name: 'X' }, 0);
      expect(result.id).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // exportAirdrops / importAirdrops
  // ---------------------------------------------------------------
  describe('exportAirdrops', () => {
    it('should return valid JSON string', () => {
      const data = [{ id: 1, name: 'A' }];
      const json = AppUtils.exportAirdrops(data);
      expect(JSON.parse(json)).toEqual(data);
    });

    it('should handle empty array', () => {
      expect(JSON.parse(AppUtils.exportAirdrops([]))).toEqual([]);
    });
  });

  describe('importAirdrops', () => {
    it('should parse valid JSON array', () => {
      const arr = [{ id: 1, name: 'A' }];
      expect(AppUtils.importAirdrops(JSON.stringify(arr))).toEqual(arr);
    });

    it('should throw on non-array JSON', () => {
      expect(() => AppUtils.importAirdrops('{"a":1}')).toThrow('array');
    });

    it('should throw on invalid JSON', () => {
      expect(() => AppUtils.importAirdrops('not json')).toThrow();
    });

    it('should accept empty array', () => {
      expect(AppUtils.importAirdrops('[]')).toEqual([]);
    });
  });

  // ---------------------------------------------------------------
  // performLogout
  // ---------------------------------------------------------------
  describe('performLogout', () => {
    it('should set currentUser to null', () => {
      const appData = { currentUser: 'alice', users: {} };
      AppUtils.performLogout(appData);
      expect(appData.currentUser).toBeNull();
    });

    it('should return the mutated appData', () => {
      const appData = { currentUser: 'bob' };
      const result = AppUtils.performLogout(appData);
      expect(result).toBe(appData);
    });

    it('should handle already null currentUser', () => {
      const appData = { currentUser: null };
      AppUtils.performLogout(appData);
      expect(appData.currentUser).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // loadUserAirdrops
  // ---------------------------------------------------------------
  describe('loadUserAirdrops', () => {
    it('should return user airdrops when they exist', () => {
      const appData = {
        currentUser: 'alice',
        users: { alice: { airdrops: [{ id: 1 }, { id: 2 }] } }
      };
      expect(AppUtils.loadUserAirdrops(appData)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should return empty array when user has no airdrops', () => {
      const appData = {
        currentUser: 'alice',
        users: { alice: {} }
      };
      expect(AppUtils.loadUserAirdrops(appData)).toEqual([]);
    });

    it('should return empty array when currentUser is null', () => {
      const appData = { currentUser: null, users: {} };
      expect(AppUtils.loadUserAirdrops(appData)).toEqual([]);
    });

    it('should return empty array when user not in users map', () => {
      const appData = { currentUser: 'ghost', users: {} };
      expect(AppUtils.loadUserAirdrops(appData)).toEqual([]);
    });
  });

  // ---------------------------------------------------------------
  // saveUserAirdrops
  // ---------------------------------------------------------------
  describe('saveUserAirdrops', () => {
    it('should store airdrops on the current user', () => {
      const appData = { currentUser: 'alice', users: { alice: { airdrops: [] } } };
      const newAirdrops = [{ id: 1 }];
      AppUtils.saveUserAirdrops(appData, newAirdrops);
      expect(appData.users.alice.airdrops).toBe(newAirdrops);
    });

    it('should not throw when currentUser is null', () => {
      const appData = { currentUser: null, users: {} };
      expect(() => AppUtils.saveUserAirdrops(appData, [])).not.toThrow();
    });

    it('should not throw when user is missing from map', () => {
      const appData = { currentUser: 'ghost', users: {} };
      expect(() => AppUtils.saveUserAirdrops(appData, [{ id: 1 }])).not.toThrow();
    });
  });

  // ---------------------------------------------------------------
  // escapeHtml
  // ---------------------------------------------------------------
  describe('escapeHtml', () => {
    it('should escape angle brackets', () => {
      expect(AppUtils.escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape ampersands', () => {
      expect(AppUtils.escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape quotes', () => {
      expect(AppUtils.escapeHtml('"hello" & \'world\'')).toBe('&quot;hello&quot; &amp; &#039;world&#039;');
    });

    it('should handle empty or null input', () => {
      expect(AppUtils.escapeHtml('')).toBe('');
      expect(AppUtils.escapeHtml(null)).toBe('');
      expect(AppUtils.escapeHtml(undefined)).toBe('');
    });

    it('should leave safe strings unchanged', () => {
      expect(AppUtils.escapeHtml('To Do')).toBe('To Do');
      expect(AppUtils.escapeHtml('My Project')).toBe('My Project');
    });
  });

  // ---------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------
  describe('constants', () => {
    it('DB_KEY should be airdropTrackerApp', () => {
      expect(AppUtils.DB_KEY).toBe('airdropTrackerApp');
    });

    it('ALL_STATUSES should have 6 entries', () => {
      expect(AppUtils.ALL_STATUSES).toHaveLength(6);
      expect(AppUtils.ALL_STATUSES[0]).toBe('all');
    });

    it('STATUS_STYLES should have entries for all real statuses', () => {
      ['To Do', 'In Progress', 'Done', 'Farmed', 'Snapshot'].forEach(s => {
        expect(AppUtils.STATUS_STYLES[s]).toBeDefined();
      });
    });
  });
});
