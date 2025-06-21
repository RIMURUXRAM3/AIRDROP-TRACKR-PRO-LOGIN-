document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const getEl = (id) => document.getElementById(id);
    const loginForm = getEl('login-form');
    const registerForm = getEl('register-form');
    const tabLogin = getEl('tab-login');
    const tabRegister = getEl('tab-register');
    const authError = getEl('auth-error');

    // --- STATE & DATA MANAGEMENT ---
    const DB_KEY = 'airdropTrackerApp';
    let appData = JSON.parse(localStorage.getItem(DB_KEY)) || { users: {}, currentUser: null };

    // Jika user sudah login, langsung redirect ke halaman aplikasi
    if (appData.currentUser) {
        window.location.href = 'app.html';
        return; // Hentikan eksekusi skrip lebih lanjut
    }

    const saveAppData = () => localStorage.setItem(DB_KEY, JSON.stringify(appData));
    const hashPassword = (password) => btoa(password); // Pengamanan sederhana

    const handleRegister = (e) => {
        e.preventDefault();
        const username = getEl('register-username').value.trim().toLowerCase();
        const password = getEl('register-password').value;
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
        handleLogin(e, username, password); // Auto-login setelah register
    };

    const handleLogin = (e, prefilledUser = null, prefilledPass = null) => {
        e.preventDefault();
        const username = prefilledUser || getEl('login-username').value.trim().toLowerCase();
        const password = prefilledPass || getEl('login-password').value;
        authError.textContent = '';

        const user = appData.users[username];
        if (user && user.password === hashPassword(password)) {
            appData.currentUser = username;
            saveAppData();
            window.location.href = 'app.html'; // Redirect ke halaman aplikasi
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
