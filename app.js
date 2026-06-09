document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const getEl = (id) => document.getElementById(id);
    const appScreen = getEl('app-screen');
    const logoutBtn = getEl('logout-btn');
    const airdropForm = getEl('airdropForm'), airdropTableBody = getEl('airdropTableBody'),
        emptyState = getEl('emptyState'), filterButtonsContainer = getEl('filter-buttons'),
        copyrightYear = getEl('copyrightYear'), imageModal = getEl('imageModal'),
        modalImage = getEl('modalImage'), screenshotInput = getEl('screenshot'),
        imagePreview = getEl('imagePreview'), removeImageBtn = getEl('removeImageBtn'),
        formTitle = getEl('formTitle'), submitBtn = getEl('submitBtn'),
        cancelBtn = getEl('cancelBtn'), editIndexInput = getEl('editIndex');

    // Guard: abort if critical DOM elements are missing
    const requiredEls = { appScreen, logoutBtn, airdropForm, airdropTableBody, emptyState,
        filterButtonsContainer, copyrightYear, imageModal, modalImage, screenshotInput,
        imagePreview, removeImageBtn, formTitle, submitBtn, cancelBtn, editIndexInput };
    const missingEls = Object.entries(requiredEls).filter(([, el]) => !el).map(([name]) => name);
    if (missingEls.length > 0) {
        console.error('[app] Critical DOM elements missing:', missingEls.join(', '));
        return;
    }

    // --- STATE & DATA ---
    const DB_KEY = AppUtils.DB_KEY;
    const escapeHtml = AppUtils.escapeHtml;

    const loadAppData = () => {
        try {
            const raw = localStorage.getItem(DB_KEY);
            if (raw === null) return { users: {}, currentUser: null };
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.users) return parsed;
            console.warn('[app] Stored data has unexpected shape — resetting to defaults.');
            return { users: {}, currentUser: null };
        } catch (err) {
            console.error('[app] Failed to parse stored data — resetting to defaults.', err);
            return { users: {}, currentUser: null };
        }
    };

    let appData = loadAppData();
    let currentUser = appData.currentUser;
    let airdrops = [];
    let currentFilter = 'all';
    let screenshotBase64 = '';

    // --- AUTH GUARD (PENTING!) ---
    if (!currentUser || !appData.users[currentUser]) {
        appData.currentUser = null;
        try { localStorage.setItem(DB_KEY, JSON.stringify(appData)); } catch (_) { /* best-effort cleanup */ }
        window.location.href = 'index.html';
        return;
    }
    appScreen.classList.remove('hidden');
    appScreen.classList.add('fade-in');

    // --- FUNGSI ---
    const showUserError = (message) => {
        alert(message);
    };

    const saveUserAirdrops = () => {
        if (!currentUser || !appData.users[currentUser]) {
            console.error('[app] Current user record missing — cannot save.');
            showUserError('Sesi tidak valid. Silakan login ulang.');
            handleLogout();
            return false;
        }
        AppUtils.saveUserAirdrops(appData, airdrops);
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(appData));
            return true;
        } catch (err) {
            console.error('[app] Failed to save data to localStorage.', err);
            showUserError('Gagal menyimpan data. Penyimpanan lokal mungkin penuh.');
            return false;
        }
    };

    const loadUserAirdrops = () => {
        const loaded = AppUtils.loadUserAirdrops(appData);
        airdrops = Array.isArray(loaded) ? loaded : [];
    };

    const handleLogout = () => {
        AppUtils.performLogout(appData);
        try { localStorage.setItem(DB_KEY, JSON.stringify(appData)); } catch (_) { /* best-effort */ }
        window.location.href = 'index.html';
    };

    const getStatusBadge = (status) => AppUtils.getStatusBadge(status);

    const renderAirdrops = () => {
        airdropTableBody.innerHTML = '';
        const filtered = AppUtils.filterAirdrops(airdrops, currentFilter);

        emptyState.classList.toggle('hidden', airdrops.length > 0);
        if (airdrops.length === 0) {
            emptyState.innerHTML = `<svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"/></svg><h3 class="mt-2 text-lg font-medium text-white">Belum ada proyek</h3><p class="mt-1 text-sm text-gray-400">Mulai lacak dengan menambahkan proyek baru di atas.</p>`;
        }
        if (filtered.length === 0 && airdrops.length > 0) {
            airdropTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">Tidak ada proyek dengan status "${escapeHtml(currentFilter)}".</td></tr>`;
        }

        filtered.forEach((airdrop) => {
            const index = airdrops.findIndex(a => a.id === airdrop.id);
            if (index === -1) return;
            const row = document.createElement('tr');
            row.className = 'bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50';

            const safeName = escapeHtml(airdrop.name);
            const safeEcosystem = escapeHtml(airdrop.ecosystem);
            const safeWallet = escapeHtml(airdrop.wallet);
            const safeTasks = escapeHtml(airdrop.tasks);
            const safeLink = airdrop.link ? escapeHtml(airdrop.link) : '';

            let screenshotCell;
            if (airdrop.screenshot) {
                screenshotCell = `<img src="${escapeHtml(airdrop.screenshot)}" class="h-10 w-10 object-cover rounded-md cursor-pointer screenshot-thumb" data-index="${index}">`;
            } else {
                screenshotCell = '<span class="text-gray-500 text-xs">-</span>';
            }

            row.innerHTML = `<td class="px-6 py-4 font-medium text-white whitespace-nowrap">${safeName} <br> <span class="text-xs text-gray-400">${safeEcosystem}</span>${safeLink ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline text-xs block">Visit</a>` : ''}</td><td class="px-6 py-4">${getStatusBadge(airdrop.status)}</td><td class="px-6 py-4">${safeWallet}</td><td class="px-6 py-4">${screenshotCell}</td><td class="px-6 py-4 text-gray-400 max-w-xs whitespace-pre-wrap break-words text-xs">${safeTasks}</td><td class="px-6 py-4 text-center"><button class="edit-btn text-yellow-400 hover:text-yellow-300 mr-3" data-index="${index}">Edit</button><button class="delete-btn text-red-400 hover:text-red-300" data-index="${index}">Hapus</button></td>`;
            airdropTableBody.appendChild(row);
        });
    };

    const renderFilterButtons = () => {
        filterButtonsContainer.innerHTML = AppUtils.ALL_STATUSES.map(s =>
            `<button class="filter-btn ${s === 'all' ? 'active bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'} py-1 px-3 rounded-full text-sm" data-filter="${s}">${s === 'all' ? 'Semua' : escapeHtml(s)}</button>`
        ).join('');
    };

    window.showModal = (base64) => {
        if (!base64) return;
        modalImage.src = base64;
        imageModal.classList.remove('hidden');
    };

    const resetForm = () => {
        airdropForm.reset();
        editIndexInput.value = '';
        screenshotBase64 = '';
        imagePreview.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
        formTitle.textContent = 'Tambah Proyek Baru';
        submitBtn.textContent = 'Tambah Proyek';
        cancelBtn.classList.add('hidden');
    };

    const startEdit = (index) => {
        const idx = Number(index);
        if (isNaN(idx) || idx < 0 || idx >= airdrops.length) {
            console.error('[app] startEdit called with invalid index:', index);
            return;
        }
        const airdrop = airdrops[idx];
        editIndexInput.value = idx;
        getEl('projectName').value = airdrop.name || '';
        getEl('ecosystem').value = airdrop.ecosystem || '';
        getEl('status').value = airdrop.status || 'To Do';
        getEl('wallet').value = airdrop.wallet || '';
        getEl('tasks').value = airdrop.tasks || '';
        getEl('link').value = airdrop.link || '';
        screenshotBase64 = airdrop.screenshot || '';
        if (screenshotBase64) {
            imagePreview.src = screenshotBase64;
            imagePreview.classList.remove('hidden');
            removeImageBtn.classList.remove('hidden');
        } else {
            imagePreview.classList.add('hidden');
            removeImageBtn.classList.add('hidden');
        }
        formTitle.textContent = 'Edit Proyek';
        submitBtn.textContent = 'Simpan Perubahan';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- EVENT LISTENERS ---
    logoutBtn.addEventListener('click', handleLogout);

    airdropForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projectName = getEl('projectName').value.trim();
        if (!projectName) {
            showUserError('Nama proyek tidak boleh kosong.');
            return;
        }
        const editIndex = editIndexInput.value;
        const editIdx = editIndex !== '' ? Number(editIndex) : -1;

        if (editIndex !== '' && (isNaN(editIdx) || editIdx < 0 || editIdx >= airdrops.length)) {
            console.error('[app] Form submit with invalid edit index:', editIndex);
            resetForm();
            return;
        }

        const existingId = editIndex !== '' ? airdrops[editIdx].id : null;
        const airdropData = AppUtils.createAirdropData({
            name: projectName,
            ecosystem: getEl('ecosystem').value,
            status: getEl('status').value,
            wallet: getEl('wallet').value,
            tasks: getEl('tasks').value,
            link: getEl('link').value,
            screenshot: screenshotBase64
        }, existingId);

        if (editIndex !== '') {
            airdrops[editIdx] = airdropData;
        } else {
            airdrops.unshift(airdropData);
        }
        saveUserAirdrops();
        renderAirdrops();
        resetForm();
    });

    screenshotInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            screenshotBase64 = event.target.result;
            imagePreview.src = screenshotBase64;
            imagePreview.classList.remove('hidden');
            removeImageBtn.classList.remove('hidden');
        };
        reader.onerror = (err) => {
            console.error('[app] Failed to read screenshot file.', err);
            showUserError('Gagal membaca file screenshot. Coba file lain.');
            screenshotBase64 = '';
            imagePreview.classList.add('hidden');
            removeImageBtn.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener('click', () => {
        screenshotBase64 = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        removeImageBtn.classList.add('hidden');
        screenshotInput.value = '';
    });

    cancelBtn.addEventListener('click', resetForm);

    airdropTableBody.addEventListener('click', (e) => {
        // Handle screenshot thumbnail clicks
        if (e.target.classList.contains('screenshot-thumb')) {
            const idx = Number(e.target.dataset.index);
            if (!isNaN(idx) && idx >= 0 && idx < airdrops.length && airdrops[idx].screenshot) {
                window.showModal(airdrops[idx].screenshot);
            }
            return;
        }

        const idx = Number(e.target.dataset.index);
        if (isNaN(idx) || idx < 0 || idx >= airdrops.length) {
            if (e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) {
                console.error('[app] Action button clicked with invalid index:', e.target.dataset.index);
            }
            return;
        }

        if (e.target.classList.contains('edit-btn')) {
            startEdit(idx);
        }
        if (e.target.classList.contains('delete-btn')) {
            if (confirm(`Yakin menghapus proyek "${airdrops[idx].name}"?`)) {
                airdrops.splice(idx, 1);
                saveUserAirdrops();
                renderAirdrops();
                resetForm();
            }
        }
    });

    filterButtonsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-700', 'hover:bg-gray-600', 'text-gray-300');
            });
            e.target.classList.add('bg-blue-600', 'text-white');
            e.target.classList.remove('bg-gray-700', 'hover:bg-gray-600', 'text-gray-300');
            renderAirdrops();
        }
    });

    // --- INISIALISASI HALAMAN APLIKASI ---
    const initializeApp = () => {
        copyrightYear.textContent = new Date().getFullYear();
        loadUserAirdrops();
        renderFilterButtons();
        renderAirdrops();
    };

    initializeApp();
});
