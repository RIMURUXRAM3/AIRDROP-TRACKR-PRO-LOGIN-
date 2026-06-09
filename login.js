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
    let appData = LoginUtils.loadAppData(localStorage);

    // Jika user sudah login, langsung redirect ke halaman aplikasi
    if (appData.currentUser) {
        window.location.href = 'app.html';
        return;
    }

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

        const result = LoginUtils.registerUser(appData, username, password);
        if (!result.success) {
            authError.textContent = result.error;
            return;
        }

        // Persist first, then auto-login — abort if save fails
        if (!LoginUtils.saveAppData(localStorage, appData)) {
            authError.textContent = 'Gagal menyimpan data. Penyimpanan lokal mungkin penuh.';
            return;
        }
        handleLogin(e, username, password);
    };

    const handleLogin = (e, prefilledUser = null, prefilledPass = null) => {
        e.preventDefault();
        const username = prefilledUser || (getEl('login-username') ? getEl('login-username').value.trim().toLowerCase() : '');
        const password = prefilledPass || (getEl('login-password') ? getEl('login-password').value : '');
        authError.textContent = '';

        const result = LoginUtils.authenticateUser(appData, username, password);
        if (result.success) {
            appData.currentUser = username;
            if (!LoginUtils.saveAppData(localStorage, appData)) {
                authError.textContent = 'Gagal menyimpan data. Penyimpanan lokal mungkin penuh.';
                return;
            }
            window.location.href = 'app.html';
        } else {
            authError.textContent = result.error;
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
