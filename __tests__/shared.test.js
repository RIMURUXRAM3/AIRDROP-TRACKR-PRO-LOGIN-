const Shared = require('../shared');

describe('Shared', () => {
  describe('DB_KEY', () => {
    it('should be the expected constant', () => {
      expect(Shared.DB_KEY).toBe('airdropTrackerApp');
    });
  });

  describe('getEl', () => {
    it('should be a function', () => {
      expect(typeof Shared.getEl).toBe('function');
    });
  });

  describe('loadAppData', () => {
    it('should return default data when storage is empty', () => {
      const storage = { getItem: jest.fn().mockReturnValue(null) };
      expect(Shared.loadAppData(storage)).toEqual({ users: {}, currentUser: null });
    });

    it('should parse stored JSON', () => {
      const stored = { users: { alice: { password: 'x', airdrops: [] } }, currentUser: 'alice' };
      const storage = { getItem: jest.fn().mockReturnValue(JSON.stringify(stored)) };
      expect(Shared.loadAppData(storage)).toEqual(stored);
    });

    it('should return default data on corrupt JSON', () => {
      const storage = { getItem: jest.fn().mockReturnValue('{{bad}}') };
      expect(Shared.loadAppData(storage)).toEqual({ users: {}, currentUser: null });
    });

    it('should call getItem with the correct key', () => {
      const storage = { getItem: jest.fn().mockReturnValue(null) };
      Shared.loadAppData(storage);
      expect(storage.getItem).toHaveBeenCalledWith('airdropTrackerApp');
    });
  });

  describe('saveAppData', () => {
    it('should call setItem with serialised data', () => {
      const storage = { setItem: jest.fn() };
      const data = { users: {}, currentUser: null };
      Shared.saveAppData(storage, data);
      expect(storage.setItem).toHaveBeenCalledWith('airdropTrackerApp', JSON.stringify(data));
    });
  });

  describe('navigateTo', () => {
    it('should be a function', () => {
      expect(typeof Shared.navigateTo).toBe('function');
    });
  });
});
