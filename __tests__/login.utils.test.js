const LoginUtils = require('../login.utils');

describe('LoginUtils', () => {
  // ---------------------------------------------------------------
  // hashPassword
  // ---------------------------------------------------------------
  describe('hashPassword', () => {
    it('should return base64-encoded string', () => {
      expect(LoginUtils.hashPassword('hello')).toBe(btoa('hello'));
    });

    it('should return different hashes for different passwords', () => {
      expect(LoginUtils.hashPassword('a')).not.toBe(LoginUtils.hashPassword('b'));
    });

    it('should handle empty string', () => {
      expect(LoginUtils.hashPassword('')).toBe(btoa(''));
    });

    it('should handle special characters', () => {
      const pw = '!@#$%^&*()';
      expect(LoginUtils.hashPassword(pw)).toBe(btoa(pw));
    });
  });

  // ---------------------------------------------------------------
  // loadAppData
  // ---------------------------------------------------------------
  describe('loadAppData', () => {
    it('should return default data when storage is empty', () => {
      const storage = { getItem: jest.fn().mockReturnValue(null) };
      const data = LoginUtils.loadAppData(storage);
      expect(data).toEqual({ users: {}, currentUser: null });
    });

    it('should parse stored JSON', () => {
      const stored = { users: { alice: { password: 'x', airdrops: [] } }, currentUser: 'alice' };
      const storage = { getItem: jest.fn().mockReturnValue(JSON.stringify(stored)) };
      expect(LoginUtils.loadAppData(storage)).toEqual(stored);
    });

    it('should return default data on corrupt JSON', () => {
      const storage = { getItem: jest.fn().mockReturnValue('{{bad json}}') };
      expect(LoginUtils.loadAppData(storage)).toEqual({ users: {}, currentUser: null });
    });

    it('should return default data when stored object has no users key', () => {
      const storage = { getItem: jest.fn().mockReturnValue(JSON.stringify({ foo: 'bar' })) };
      expect(LoginUtils.loadAppData(storage)).toEqual({ users: {}, currentUser: null });
    });

    it('should call getItem with the correct key', () => {
      const storage = { getItem: jest.fn().mockReturnValue(null) };
      LoginUtils.loadAppData(storage);
      expect(storage.getItem).toHaveBeenCalledWith(LoginUtils.DB_KEY);
    });
  });

  // ---------------------------------------------------------------
  // saveAppData
  // ---------------------------------------------------------------
  describe('saveAppData', () => {
    it('should call setItem with serialised data', () => {
      const storage = { setItem: jest.fn() };
      const data = { users: {}, currentUser: null };
      LoginUtils.saveAppData(storage, data);
      expect(storage.setItem).toHaveBeenCalledWith(LoginUtils.DB_KEY, JSON.stringify(data));
    });

    it('should persist user data correctly', () => {
      const storage = { setItem: jest.fn() };
      const data = { users: { bob: { password: 'pw', airdrops: [1] } }, currentUser: 'bob' };
      LoginUtils.saveAppData(storage, data);
      const saved = JSON.parse(storage.setItem.mock.calls[0][1]);
      expect(saved.users.bob.airdrops).toEqual([1]);
    });

    it('should return true on success', () => {
      const storage = { setItem: jest.fn() };
      expect(LoginUtils.saveAppData(storage, { users: {} })).toBe(true);
    });

    it('should return false when storage throws', () => {
      const storage = { setItem: jest.fn(() => { throw new Error('QuotaExceeded'); }) };
      expect(LoginUtils.saveAppData(storage, { users: {} })).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // validateCredentials
  // ---------------------------------------------------------------
  describe('validateCredentials', () => {
    it('should reject empty username', () => {
      const result = LoginUtils.validateCredentials('', 'pass');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject empty password', () => {
      const result = LoginUtils.validateCredentials('user', '');
      expect(result.valid).toBe(false);
    });

    it('should reject both empty', () => {
      expect(LoginUtils.validateCredentials('', '').valid).toBe(false);
    });

    it('should accept valid credentials', () => {
      const result = LoginUtils.validateCredentials('user', 'pass');
      expect(result.valid).toBe(true);
      expect(result.error).toBe('');
    });
  });

  // ---------------------------------------------------------------
  // registerUser
  // ---------------------------------------------------------------
  describe('registerUser', () => {
    let appData;

    beforeEach(() => {
      appData = { users: {}, currentUser: null };
    });

    it('should register a new user successfully', () => {
      const result = LoginUtils.registerUser(appData, 'alice', 'secret');
      expect(result.success).toBe(true);
      expect(appData.users.alice).toBeDefined();
      expect(appData.users.alice.password).toBe(btoa('secret'));
      expect(appData.users.alice.airdrops).toEqual([]);
    });

    it('should reject duplicate username', () => {
      appData.users.alice = { password: 'x', airdrops: [] };
      const result = LoginUtils.registerUser(appData, 'alice', 'secret');
      expect(result.success).toBe(false);
      expect(result.error).toContain('sudah digunakan');
    });

    it('should reject empty username', () => {
      const result = LoginUtils.registerUser(appData, '', 'pass');
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = LoginUtils.registerUser(appData, 'bob', '');
      expect(result.success).toBe(false);
    });

    it('should not mutate users on failure', () => {
      LoginUtils.registerUser(appData, '', '');
      expect(Object.keys(appData.users).length).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // authenticateUser
  // ---------------------------------------------------------------
  describe('authenticateUser', () => {
    let appData;

    beforeEach(() => {
      appData = {
        users: {
          alice: { password: btoa('pass123'), airdrops: [] }
        },
        currentUser: null
      };
    });

    it('should authenticate with correct credentials', () => {
      const result = LoginUtils.authenticateUser(appData, 'alice', 'pass123');
      expect(result.success).toBe(true);
    });

    it('should reject wrong password', () => {
      const result = LoginUtils.authenticateUser(appData, 'alice', 'wrong');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject non-existent user', () => {
      const result = LoginUtils.authenticateUser(appData, 'nobody', 'pass');
      expect(result.success).toBe(false);
    });

    it('should be case-sensitive for passwords', () => {
      const result = LoginUtils.authenticateUser(appData, 'alice', 'PASS123');
      expect(result.success).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // DB_KEY constant
  // ---------------------------------------------------------------
  describe('DB_KEY', () => {
    it('should equal airdropTrackerApp', () => {
      expect(LoginUtils.DB_KEY).toBe('airdropTrackerApp');
    });
  });
});
