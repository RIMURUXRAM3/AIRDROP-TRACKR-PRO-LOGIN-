document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const getEl = (id) => document.getElementById(id);
    const loginForm = getEl('login-form');
    const registerForm = getEl('register-form');
    const tabLogin = getEl('tab-login');
    const tabRegister = getEl('tab-register');
    const authError = getEl('auth-error');

    // Guard: abort if critical DOM elements are missing
    if (!loginForm || !registerForm || !tabLogin || !tabRegister || !authError) {
        console.error('[login] Critical DOM elements missing — cannot initialize login page.');
        return;
    }

    // --- STATE & DATA MANAGEMENT ---
    const DB_KEY = 'airdropTrackerApp';

    const loadAppData = () => {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (raw === null) return { users: {}, currentUser: null };
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.users) return parsed;
            console.warn('[login] Stored data has unexpected shape — resetting to defaults.');
            return { users: {}, currentUser: null };
        } catch (err) {
            console.error('[login] Failed to parse stored data — resetting to defaults.', err);
            return { users: {}, currentUser: null };
        }
    };

    let appData = loadAppData();

    // Jika user sudah login, langsung redirect ke halaman aplikasi
    if (appData.currentUser) {
        window.location.href = 'app.html';
        return;
    }

    const saveAppData = () => {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(appData));
            return true;
        } catch (err) {
            console.error('[login] Failed to save data to localStorage.', err);
            authError.textContent = 'Gagal menyimpan data. Penyimpanan lokal mungkin penuh.';
            return false;
        }
    };

    const hashPassword = (password) => btoa(password); // Pengamanan sederhana

    const handleRegister = (e) => {
        e.preventDefault();
        const usernameEl = getEl('register-username');
        const passwordEl = getEl('register-password');
        if (!usernameEl || !passwordEl) {
            authError.textContent = 'Elemen form registrasi tidak ditemukan.';
            return;
        }
        const username = usernameEl.value.trim().toLowerCase();
        const password = passwordEl.value;
        authError.textContent = '';

        if (!username || !password) {
            authError.textContent = 'Username dan password tidak boleh kosong.';
            return;
        }
        if (appData.users[username]) {
            authError.textContent = 'Username sudah digunakan.';
            return;
        }

        appData.users[username] = { password: hashPassword(password), airdrops: [] };

        // Persist first, then auto-login — abort if save fails
        if (!saveAppData()) return;
        handleLogin(e, username, password);
    };

    const handleLogin = (e, prefilledUser = null, prefilledPass = null) => {
        e.preventDefault();
        const username = prefilledUser || (getEl('login-username') ? getEl('login-username').value.trim().toLowerCase() : '');
        const password = prefilledPass || (getEl('login-password') ? getEl('login-password').value : '');
        authError.textContent = '';

        if (!username || !password) {
            authError.textContent = 'Username dan password tidak boleh kosong.';
            return;
        }

        const user = appData.users[username];
        if (user && user.password === hashPassword(password)) {
            appData.currentUser = username;
            if (!saveAppData()) return;
            window.location.href = 'app.html';
        } else {
            authError.textContent = 'Username atau password salah.';
        }
    };

    // --- EVENT LISTENERS ---
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    tabLogin.addEventListener('click', () => {
        tabLogin.className = 'flex-1 py-2 text-center font-semibold text-white border-b-2 border-blue-500';
        tabRegister.className = 'flex-1 py-2 text-center font-semibold text-gray-400';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authError.textContent = '';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.className = 'flex-1 py-2 text-center font-semibold text-white border-b-2 border-green-500';
        tabLogin.className = 'flex-1 py-2 text-center font-semibold text-gray-400';
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authError.textContent = '';
    });
});
