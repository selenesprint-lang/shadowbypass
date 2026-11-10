SHADOWBYPASS — PANDUAN ANDROID

ISI PROJECT
- index.html, style.css, app.js: frontend website
- worker.js, wrangler.toml: backend Cloudflare Worker

LANGKAH 1 — SIAPKAN FILE
1. Unduh dan ekstrak ShadowBypass.zip di Android.
2. Buka folder hasil ekstrak dengan editor teks/kode.
3. Jangan mengubah worker.js dulu.

LANGKAH 2 — DEPLOY BACKEND WORKER
Cara paling mudah:
1. Login ke https://dash.cloudflare.com/
2. Buka Workers & Pages > Create > Worker.
3. Beri nama shadowbypass-api.
4. Pilih Edit code, hapus kode contoh, lalu salin seluruh isi worker.js.
5. Deploy.
6. Salin URL Worker, misalnya https://shadowbypass-api.NAMA-AKUN.workers.dev

LANGKAH 3 — HUBUNGKAN FRONTEND
1. Buka app.js.
2. Cari baris API_BASE.
3. Ganti URL placeholder dengan URL Worker milikmu.
4. Simpan file.

LANGKAH 4 — DEPLOY FRONTEND PAGES
1. Buka https://dash.cloudflare.com/
2. Workers & Pages > Create > Pages > Direct Upload (jika tersedia).
3. Unggah folder/file frontend: index.html, style.css, app.js.
4. Deploy dan buka URL Pages yang diberikan.

LANGKAH 5 — BATASI CORS
1. Buka Worker shadowbypass-api > Settings > Variables.
2. Tambahkan/edit ALLOWED_ORIGIN menjadi URL Pages milikmu, misalnya https://shadowbypass.pages.dev
3. Save dan deploy ulang jika diminta.

CATATAN KEAMANAN
- Pemeriksa ini hanya memeriksa redirect HTTP publik.
- Tidak melewati login, CAPTCHA, paywall, atau akses berbayar.
- Jangan masukkan URL pribadi, token, atau tautan reset password.
- Jangan menghapus validasi host privat di worker.js.
- Hasil dapat gagal jika situs memblokir bot, memerlukan JavaScript, atau membutuhkan sesi/login.
- Untuk pemakaian publik, atur rate limiting dan pantau penggunaan Worker.
