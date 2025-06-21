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

    // --- STATE & DATA ---
    const DB_KEY = 'airdropTrackerApp';
    let appData = JSON.parse(localStorage.getItem(DB_KEY)) || { users: {}, currentUser: null };
    let currentUser = appData.currentUser;
    let airdrops = [];
    let currentFilter = 'all';
    let screenshotBase64 = '';

    // --- AUTH GUARD (PENTING!) ---
    // Jika tidak ada user yang login, tendang kembali ke halaman login
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    // Jika sudah lolos, tampilkan halaman aplikasi
    appScreen.classList.remove('hidden');
    appScreen.classList.add('fade-in');


    // --- FUNGSI ---
    const saveUserAirdrops = () => {
        if (currentUser) {
            appData.users[currentUser].airdrops = airdrops;
            localStorage.setItem(DB_KEY, JSON.stringify(appData));
        }
    };

    const loadUserAirdrops = () => {
        if (currentUser && appData.users[currentUser]) {
            airdrops = appData.users[currentUser].airdrops || [];
        }
    };

    const handleLogout = () => {
        appData.currentUser = null;
        localStorage.setItem(DB_KEY, JSON.stringify(appData));
        window.location.href = 'index.html';
    };

    const getStatusBadge = (status) => {const S = {'To Do':'bg-yellow-900 text-yellow-300','In Progress':'bg-blue-900 text-blue-300','Done':'bg-green-900 text-green-300','Farmed':'bg-purple-900 text-purple-300','Snapshot':'bg-pink-900 text-pink-300'}; return `<span class="px-2.5 py-1 text-xs font-medium rounded-full inline-block ${S[status] || 'bg-gray-700 text-gray-300'}">${status}</span>`;};
    const renderAirdrops = () => {airdropTableBody.innerHTML = ''; const filtered = airdrops.filter(a => currentFilter === 'all' || a.status === currentFilter); emptyState.classList.toggle('hidden', airdrops.length > 0); if (airdrops.length === 0) { emptyState.innerHTML = `<svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z"/></svg><h3 class="mt-2 text-lg font-medium text-white">Belum ada proyek</h3><p class="mt-1 text-sm text-gray-400">Mulai lacak dengan menambahkan proyek baru di atas.</p>`;} if (filtered.length === 0 && airdrops.length > 0) { airdropTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">Tidak ada proyek dengan status "${currentFilter}".</td></tr>`; } filtered.forEach((airdrop) => { const index = airdrops.findIndex(a => a.id === airdrop.id); const row = document.createElement('tr'); row.className = 'bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50'; row.innerHTML = `<td class="px-6 py-4 font-medium text-white whitespace-nowrap">${airdrop.name} <br> <span class="text-xs text-gray-400">${airdrop.ecosystem}</span>${airdrop.link ? `<a href="${airdrop.link}" target="_blank" class="text-blue-400 hover:underline text-xs block">Visit</a>` : ''}</td><td class="px-6 py-4">${getStatusBadge(airdrop.status)}</td><td class="px-6 py-4">${airdrop.wallet}</td><td class="px-6 py-4">${airdrop.screenshot ? `<img src="${airdrop.screenshot}" class="h-10 w-10 object-cover rounded-md cursor-pointer" onclick="showModal('${airdrop.screenshot}')">` : '<span class="text-gray-500 text-xs">-</span>'}</td><td class="px-6 py-4 text-gray-400 max-w-xs whitespace-pre-wrap break-words text-xs">${airdrop.tasks}</td><td class="px-6 py-4 text-center"><button class="edit-btn text-yellow-400 hover:text-yellow-300 mr-3" data-index="${index}">Edit</button><button class="delete-btn text-red-400 hover:text-red-300" data-index="${index}">Hapus</button></td>`; airdropTableBody.appendChild(row); });};
    const renderFilterButtons = () => {const statuses = ['all', 'To Do', 'In Progress', 'Done', 'Farmed', 'Snapshot']; filterButtonsContainer.innerHTML = statuses.map(s => `<button class="filter-btn ${s === 'all' ? 'active bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'} py-1 px-3 rounded-full text-sm" data-filter="${s}">${s === 'all' ? 'Semua' : s}</button>`).join('');};
    window.showModal = (base64) => {modalImage.src = base64; imageModal.classList.remove('hidden');};
    const resetForm = () => {airdropForm.reset(); editIndexInput.value = ''; screenshotBase64 = ''; imagePreview.classList.add('hidden'); removeImageBtn.classList.add('hidden'); formTitle.textContent = 'Tambah Proyek Baru'; submitBtn.textContent = 'Tambah Proyek'; cancelBtn.classList.add('hidden');};
    const startEdit = (index) => {const airdrop = airdrops[index]; editIndexInput.value = index; getEl('projectName').value = airdrop.name; getEl('ecosystem').value = airdrop.ecosystem; getEl('status').value = airdrop.status; getEl('wallet').value = airdrop.wallet; getEl('tasks').value = airdrop.tasks; getEl('link').value = airdrop.link; screenshotBase64 = airdrop.screenshot || ''; if (screenshotBase64) { imagePreview.src = screenshotBase64; imagePreview.classList.remove('hidden'); removeImageBtn.classList.remove('hidden'); } else { imagePreview.classList.add('hidden'); removeImageBtn.classList.add('hidden'); } formTitle.textContent = 'Edit Proyek'; submitBtn.textContent = 'Simpan Perubahan'; cancelBtn.classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' });};

    // --- EVENT LISTENERS ---
    logoutBtn.addEventListener('click', handleLogout);
    airdropForm.addEventListener('submit', (e) => { e.preventDefault(); const editIndex = editIndexInput.value; const airdropData = {id: editIndex !== '' ? airdrops[editIndex].id : Date.now(), name: getEl('projectName').value.trim(), ecosystem: getEl('ecosystem').value.trim(), status: getEl('status').value, wallet: getEl('wallet').value.trim(), tasks: getEl('tasks').value.trim(), link: getEl('link').value.trim(), screenshot: screenshotBase64,}; if (editIndex !== '') { airdrops[editIndex] = airdropData; } else { airdrops.unshift(airdropData); } saveUserAirdrops(); renderAirdrops(); resetForm(); });
    screenshotInput.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { screenshotBase64 = event.target.result; imagePreview.src = screenshotBase64; imagePreview.classList.remove('hidden'); removeImageBtn.classList.remove('hidden'); }; reader.readAsDataURL(file); } });
    removeImageBtn.addEventListener('click', () => { screenshotBase64 = ''; imagePreview.src = ''; imagePreview.classList.add('hidden'); removeImageBtn.classList.add('hidden'); screenshotInput.value = ''; });
    cancelBtn.addEventListener('click', resetForm);
    airdropTableBody.addEventListener('click', (e) => { if (e.target.classList.contains('edit-btn')) { startEdit(e.target.dataset.index); } if (e.target.classList.contains('delete-btn')) { if (confirm(`Yakin menghapus proyek "${airdrops[e.target.dataset.index].name}"?`)) { airdrops.splice(e.target.dataset.index, 1); saveUserAirdrops(); renderAirdrops(); resetForm(); } } });
    filterButtonsContainer.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { currentFilter = e.target.dataset.filter; document.querySelectorAll('.filter-btn').forEach(btn => {btn.classList.remove('bg-blue-600', 'text-white'); btn.classList.add('bg-gray-700', 'hover:bg-gray-600', 'text-gray-300');}); e.target.classList.add('bg-blue-600', 'text-white'); e.target.classList.remove('bg-gray-700', 'hover:bg-gray-600', 'text-gray-300'); renderAirdrops(); } });

    // --- INISIALISASI HALAMAN APLIKASI ---
    const initializeApp = () => {
        copyrightYear.textContent = new Date().getFullYear();
        loadUserAirdrops();
        renderFilterButtons();
        renderAirdrops();
    };

    initializeApp();
});
