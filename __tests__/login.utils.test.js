const LoginUtils = require('../login.utils');
const crypto = require('crypto');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

describe('LoginUtils', () => {
  // ---------------------------------------------------------------
  // hashPassword
  // ---------------------------------------------------------------
  describe('hashPassword', () => {
    it('should return SHA-256 hex string', async () => {
      const hash = await LoginUtils.hashPassword('hello');
      expect(hash).toBe(sha256('hello'));
    });

    it('should return different hashes for different passwords', async () => {
      const a = await LoginUtils.hashPassword('a');
      const b = await LoginUtils.hashPassword('b');
      expect(a).not.toBe(b);
    });

    it('should handle empty string', async () => {
      const hash = await LoginUtils.hashPassword('');
      expect(hash).toBe(sha256(''));
    });

    it('should handle special characters', async () => {
      const pw = '!@#$%^&*()';
      const hash = await LoginUtils.hashPassword(pw);
      expect(hash).toBe(sha256(pw));
    });
  });

  // ---------------------------------------------------------------
  // isSafeKey
  // ---------------------------------------------------------------
  describe('isSafeKey', () => {
    it('should return true for normal usernames', () => {
      expect(LoginUtils.isSafeKey('alice')).toBe(true);
      expect(LoginUtils.isSafeKey('user_123')).toBe(true);
    });

    it('should return false for prototype pollution keys', () => {
      expect(LoginUtils.isSafeKey('__proto__')).toBe(false);
      expect(LoginUtils.isSafeKey('constructor')).toBe(false);
      expect(LoginUtils.isSafeKey('prototype')).toBe(false);
    });
  });

  // ---------------------------------------------------------------
  // isValidUsername
  // ---------------------------------------------------------------
  describe('isValidUsername', () => {
    it('should accept valid usernames', () => {
      expect(LoginUtils.isValidUsername('alice')).toBe(true);
      expect(LoginUtils.isValidUsername('user_123')).toBe(true);
      expect(LoginUtils.isValidUsername('abc')).toBe(true);
    });

    it('should reject too short', () => {
      expect(LoginUtils.isValidUsername('ab')).toBe(false);
    });

    it('should reject too long', () => {
      expect(LoginUtils.isValidUsername('a'.repeat(31))).toBe(false);
    });

    it('should reject uppercase', () => {
      expect(LoginUtils.isValidUsername('Alice')).toBe(false);
    });

    it('should reject special chars', () => {
      expect(LoginUtils.isValidUsername('user@name')).toBe(false);
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
  });

  // ---------------------------------------------------------------
  // validateCredentials
  // ---------------------------------------------------------------
  describe('validateCredentials', () => {
    it('should reject empty username', () => {
      const result = LoginUtils.validateCredentials('', 'password');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject empty password', () => {
      const result = LoginUtils.validateCredentials('user_1', '');
      expect(result.valid).toBe(false);
    });

    it('should reject both empty', () => {
      expect(LoginUtils.validateCredentials('', '').valid).toBe(false);
    });

    it('should reject short password', () => {
      const result = LoginUtils.validateCredentials('alice', '12345');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('6');
    });

    it('should reject too long password', () => {
      const result = LoginUtils.validateCredentials('alice', 'a'.repeat(129));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('128');
    });

    it('should reject invalid username format', () => {
      const result = LoginUtils.validateCredentials('AB', 'password');
      expect(result.valid).toBe(false);
    });

    it('should reject prototype pollution username', () => {
      const result = LoginUtils.validateCredentials('__proto__', 'password');
      expect(result.valid).toBe(false);
    });

    it('should accept valid credentials', () => {
      const result = LoginUtils.validateCredentials('alice', 'password');
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

    it('should register a new user successfully', async () => {
      const result = await LoginUtils.registerUser(appData, 'alice', 'secret123');
      expect(result.success).toBe(true);
      expect(appData.users.alice).toBeDefined();
      expect(appData.users.alice.password).toBe(sha256('secret123'));
      expect(appData.users.alice.airdrops).toEqual([]);
    });

    it('should reject duplicate username', async () => {
      appData.users.alice = { password: 'x', airdrops: [] };
      const result = await LoginUtils.registerUser(appData, 'alice', 'secret123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('sudah digunakan');
    });

    it('should reject empty username', async () => {
      const result = await LoginUtils.registerUser(appData, '', 'password');
      expect(result.success).toBe(false);
    });

    it('should reject empty password', async () => {
      const result = await LoginUtils.registerUser(appData, 'bob_1', '');
      expect(result.success).toBe(false);
    });

    it('should not mutate users on failure', async () => {
      await LoginUtils.registerUser(appData, '', '');
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
          alice: { password: sha256('pass123'), airdrops: [] }
        },
        currentUser: null
      };
    });

    it('should authenticate with correct credentials', async () => {
      const result = await LoginUtils.authenticateUser(appData, 'alice', 'pass123');
      expect(result.success).toBe(true);
    });

    it('should reject wrong password', async () => {
      const result = await LoginUtils.authenticateUser(appData, 'alice', 'wrong1');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject non-existent user', async () => {
      const result = await LoginUtils.authenticateUser(appData, 'nobody', 'pass123');
      expect(result.success).toBe(false);
    });

    it('should be case-sensitive for passwords', async () => {
      const result = await LoginUtils.authenticateUser(appData, 'alice', 'PASS123');
      expect(result.success).toBe(false);
    });

    it('should reject prototype pollution username', async () => {
      const result = await LoginUtils.authenticateUser(appData, '__proto__', 'pass');
      expect(result.success).toBe(false);
      expect(result.error).toContain('tidak valid');
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
