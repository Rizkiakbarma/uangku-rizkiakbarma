# BudgetIN Pro - Core Architecture & AI Agents Rules

**PENTING UNTUK SEMUA AI AGENTS:** Jika Anda membaca dokumen ini, Anda sedang diperintah oleh *Head of Product* (Rizki Akbar Maulana) untuk memelihara aplikasi **BudgetIN Pro**. Baca seluruh aturan ini sebelum memodifikasi satupun kode di repositori ini. DILARANG MELANGGAR ATURAN INI TANPA IZIN EKSPLISIT DARI FOUNDER.

---

## 1. Identitas Produk (Product Identity)
BudgetIN Pro adalah Aplikasi Pencatatan Keuangan Pintar tanpa friksi. Pengguna hanya melakukan *input* transaksi via **Telegram Bot**. Website *(React App)* hanya berfungsi sebagai alat visualisasi/analisis cantik (Dashboard) dan konfigurasi target (Goals).

## 2. Tech Stack & Arsitektur Database
- **Frontend:** React 18, TypeScript, Vite.
- **Styling:** Vanilla Tailwind CSS dipadukan dengan komponen analitik `Tremor` (`@tremor/react`).
- **Database Utama:** Supabase (PostgreSQL). Seluruh visualisasi Dashboard ditarik dari sini.
- **Backup & Logging:** Google Sheets via Google Apps Script (GAS). API ini tetap menerima data dari Bot sebagai cadangan, namun **Dashboard tidak lagi membaca data dari sini** untuk kecepatan akses (Supabase-Only Source).
- **I/O Node:** Telegram Bot API.

## 3. Aturan Manajemen State & Fetching (CRITICAL)
- **State Management:** Semua state diatur secara lokal menggunakan `AppContext.tsx` dan Custom Hook `useFinanceData.ts`.
- **Global Caching:** `useFinanceData.ts` memiliki variabel *singleton* lokal (`globalHasFetchedData` dll) untuk mencegah re-render berulang lintas navigasi.
- **Single Source of Truth:** Dashboard HARUS mengambil data hanya dari Supabase. Pengambilan data dari Google Sheets dilarang karena lambat (Latency GAS). Kecepatan pemuatan Dashboard ditargetkan < 1 detik.

## 4. Pola UI dan UX (Design System)
- **Theming:** Aplikasi menggunakan *Custom Themes* berbasis objek HSL *(Light, Dark, Slate, Midnight)*. Selalu gunakan variabel kontekstual dari `useApp().t` (seperti `t.bgSoft`, `t.textMain`) saat mengatur warna komponen baru. JANGAN pernah menggunakan *hardcode hex text/bg colors*.
- **Loading State:** Jika `isFetching` bernilai `true`, Komponen UI angka dan tabel harus dibungkus dengan **Skeletons (Pulse Skeletons)** yang berpadu dengan tema latar belakang (contoh: `<div className={\`animate-pulse \${t.bgSoft}\`}></div>`).

## 5. Sistem Autentikasi (Authentication Rules)
- Kami menggunakan autentikasi *Secret Key* / URL Magic Link via Telegram: `https://.../?key=[KODE_RAHASIA]`. 
- Sistem akan mencari kode tersebut di *database* Supabase (`telegram_id` atau semacamnya).
- JANGAN DITAWARKAN / DIBANGUN struktur *login* kompleks seperti OAuth/Google Login tanpa persetujuan eksplisit dari *Founder*.

## 6. Realtime Websocket
Aplikasi disetel dengan Supabase Realtime *Subscription* pada tabel `transactions` dan `goals`. Pembaruan data yang berasal dari bot Telegram harus dengan instan memicu `fetchData(bypassCache = true)` di *frontend*. JANGAN pecahkan jalur pipa pesan realtime ini.

---

*Tertanda, Founder: Rizki Akbar Maulana & Asisten Antigravity Khusus.*
