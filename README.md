Berikut adalah **README.md versi “Diablo”** yang sudah dilengkapi dengan **tampilan gelap khas Diablo** untuk layar login atau dashboard-nya:

---

````markdown
# 🕷️ AIRDROP‑TRACKR‑PRO‑LOGIN

> *“In the depths of darkness, only the wary survive.”*

![Layar Login Gelap ala Diablo](./assets/diablo-dark-login.jpg)

**AIRDROP‑TRACKR‑PRO‑LOGIN** adalah aplikasi client-side dengan tema kelam dan atmosferik — seperti masuk ke dalam dungeon Diablo saat kamu berburu airdrop kripto.

---

## ⚔️ Sorotan Fitur

- 🕶️ **Mode Gelap Permanen**: Latar belakang hitam pekat, aksen merah darah.
- 🔐 **Login Lokal dengan Gaya Gelap**: UI login menyerupai panel gelap, tombol berpendar merah.
- 🧭 **Dashboard Airdrop**: Tampilkan list airdrop di area gelap, ikon api dan tombol klaim bergaya rune.
- 🔄 **Impor & Ekspor JSON**: Backup data airdrop layaknya menyimpan artefak dungeon.
- 🧹 **Session Timeout**: Logout otomatis saat idle — seakan “reset dungeon” setelah 10 menit.
- 🏹 **Animasi & Efek**: Hover merah mengalir, efek rumit, dan transisi cinematic.

---

## 🛡️ Instalasi Lokal

1. Clone repo  
   ```bash
   git clone https://github.com/RIMURUXRAM3/AIRDROP-TRACKR-PRO-LOGIN.git
   cd AIRDROP-TRACKR-PRO-LOGIN
````

2. Tambahkan gambar Diablo login ke folder `/assets/` (`diablo-dark-login.jpg`).
3. Buka `index.html` langsung di browser.

---

## 🧩 Struktur File

```
/ ─ index.html        
  ├─ assets/           ← termasuk diablo-dark-login.jpg
  ├─ css/              ← tema gelap intens
  ├─ js/
  │   ├─ auth.js
  │   └─ tracker.js
  └─ README.md         ← yang sedang kamu baca
```

---

## 🎯 Cara Pakai

1. Buka aplikasi → tampilan login gelap dan mencekam.
2. Masukkan kredensial (username/password >6 karakter).
3. Setelah login:

   * “+ Add Airdrop” muncul seperti rune di alat inventory.
   * Urutkan atau cari airdrop-mu dengan nuansa seram.
   * Export/Import data JSON sebagai cadangan artefak.
4. Tidak aktif selama idle 10 menit? Aplikasi otomatis logout.

---

## ⚙️ Kostumisasi

### Ganti Timeout Idle

Ubah `js/auth.js`:

```js
const IDLE_TIMEOUT_MINUTES = 10;
```

### Ubah Hash Login

Secara default `auth.js` pakai `SHA‑256`:

```js
const DEFAULT_USER = 'demonhunter';
const DEFAULT_PASS_HASH = 'e3b0c4...'; // hash “passwordku”
```

---

## 📸 Tampilan Diablo

Baru ditampilkan di atas: screenshot UI gelap ala Diablo.
Untuk penggunaan di README, upload ke folder `assets/diablo-dark-login.jpg` dan pastikan path di markdown benar:

```markdown
![Layar Login Gelap ala Diablo](./assets/diablo-dark-login.jpg)
```

---

## 🧱 Kontribusi

Ide fitur tambahan:

* 🔥 OAuth login: Discord/Twitter
* 🛡️ Enkripsi data lokal
* 🎭 Transisi cinematic ala cutscene Diablo

Feel free buat issue atau PR dengan visual preview 🔥

---

## 🧾 Lisensi

MIT License – dunia gelap ini penuh kemungkinan, tapi kode tetap terbuka.

```

---

**Langkah selanjutnya:**
1. Pilih image dari carousel di atas yang paling sesuai.
2. Upload ke folder `assets/` di repo → beri nama `diablo-dark-login.jpg`.
3. Commit dan push.
4. README otomatis menampilkan screenshot UI layar login/gaya Diablo.

Kalau kamu punya screenshot lain atau ingin versi tertentu (misalnya dengan logo Gothic Diablo), kirim link atau gambarnya—akan saya bantu embed lebih lanjut!
```
