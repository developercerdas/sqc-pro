# 📘 BUKU PANDUAN PENGGUNAAN
## Executive Production & Defect Quality Dashboard (Node.js)
**Divisi Pengawasan Mutu & Efisiensi Produksi Rokok Batangan**

---

## 📑 DAFTAR ISI
1. [Cara Memulai & Menjalankan Aplikasi](#1-cara-memulai--menjalankan-aplikasi)
2. [Arsitektur Database Spreadsheet & Struktur Folder Google Drive](#2-arsitektur-database-spreadsheet--struktur-folder-google-drive)
3. [Panduan Lengkap per Menu Sidebar](#3-panduan-lengkap-per-menu-sidebar)
   - [Menu 1: Executive Dashboard (Indikator Kunci KPI)](#menu-1-executive-dashboard)
   - [Menu 2: Key Insights & AI (Analisis Cerdas & Benchmark)](#menu-2-key-insights--ai)
   - [Menu 3: Visual Analytics (Grafik Interaktif & Tren Kriteria)](#menu-3-visual-analytics)
   - [Menu 4: Matrix Heatmap (Matriks Titik Kritis Cacat per Lokal)](#menu-4-matrix-heatmap)
   - [Menu 5: Detail Rekapitulasi (Tabel Master & Evaluasi Risiko)](#menu-5-detail-rekapitulasi)
   - [Menu 6: Master Mandor & Lokal (Data Referensi Operasional)](#menu-6-master-mandor--lokal)
4. [Panduan Drag & Drop File Excel](#4-panduan-drag--drop-file-excel)
5. [Panduan Kustomisasi Menu & Dashboard](#5-panduan-kustomisasi-menu--dashboard)
6. [Sinkronisasi Dua Arah ke Google Spreadsheet](#6-sinkronisasi-dua-arah-ke-google-spreadsheet)
7. [Ekspor Laporan & Cetak PDF](#7-ekspor-laporan--cetak-pdf)
8. [Tanya Jawab & Troubleshooting (FAQ)](#8-tanya-jawab--troubleshooting-faq)

---

## 1. CARA MEMULAI & MENJALANKAN APLIKASI

Aplikasi ini berbasis Node.js yang sangat ringan dan cepat. Anda tidak perlu repot mengetik perintah di terminal setiap kali ingin membuka aplikasi.

### Cara Menjalankan (1-Klik):
1. Buka folder: `D:\APLIKASI\dashboard-produksi`
2. **Klik dua kali (Double-click)** file **`JALANKAN_APLIKASI.bat`**.
3. Jendela hitam server akan aktif dan browser Anda akan otomatis membuka alamat:
   👉 **`http://localhost:3000`**
4. Biarkan jendela terminal server tetap menyala selama Anda menggunakan aplikasi. Jika selesai, Anda cukup menutup jendela tersebut.

---

## 2. ARSITEKTUR DATABASE SPREADSHEET & STRUKTUR FOLDER GOOGLE DRIVE

> [!TIP]
> **Rekomendasi Terbaik untuk Struktur Folder Spreadsheet di Google Drive:**
> Agar data Anda rapi, mudah dilacak per periode, dan tidak pernah hilang, buatlah folder di Google Drive Anda dengan struktur berikut:

```
Google Drive Anda/
└── 📁 DATABASE_PRODUKSI_QC/
    ├── 📊 DATABASE_UTAMA_PRODUKSI (Google Sheet Aktif - Terhubung ke Aplikasi)
    │   ├── 📑 Sheet 1: DATABASE_PRODUKSI   (Rekapitulasi Cacat & Garapan Pekerja)
    │   ├── 📑 Sheet 2: MASTER_LOKAL_MANDOR (Daftar Lokal, Mandor, & Brand)
    │   └── 📑 Sheet 3: KONFIGURASI         (Pengaturan Menu, Widget, & Toleransi)
    │
    └── 📁 ARSIP_EXCEL_MENTAH/ (Opsional - Cold Storage Backup)
        ├── 📁 2026-07 Juli/
        ├── 📁 2026-08 Agustus/
        └── 📁 2026-09 September/
```

### Mengapa 1 File Utama dengan 3 Sheet adalah Solusi Terbaik?
1. **Cukup 1 Kali Pengaturan**: Anda hanya perlu memasang script Web App sekali saja pada spreadsheet `DATABASE_UTAMA_PRODUKSI`.
2. **Otomatisasi Penuh**: Setiap kali Anda men-drag Excel baru di dashboard, data langsung masuk dan memperbarui Sheet 1, Sheet 2, dan Sheet 3 secara otomatis.
3. **Bisa Dibuka di HP atau Komputer Lain**: Karena tersimpan di Google Drive, manajer atau tim QC dapat membuka spreadsheet tersebut kapan saja via Google Sheets di smartphone atau laptop lain.

---

## 3. PANDUAN LENGKAP PER MENU SIDEBAR

Sidebar di sebelah kiri layar dirancang dengan gaya navigasi eksekutif. Berikut fungsi dan cara membaca setiap menu:

```
┌──────────────────────────────────────────────┐
│  [Defect Analytics - Gudang 3 BI]           │
├──────────────────────────────────────────────┤
│  📊 Executive Dashboard                       │
│  🧠 Key Insights & AI                         │
│  📈 Visual Analytics                          │
│  🔲 Matrix Heatmap                           │
│  📋 Detail Rekapitulasi                       │
│  🪪 Master Mandor & Lokal                     │
├──────────────────────────────────────────────┤
│  ⚙️ Ubah Menu & Widget                        │
│  ☁️ Spreadsheet Cloud (Sync Now)              │
│  📥 Export Excel & CSV                        │
└──────────────────────────────────────────────┘
```

---

### Menu 1: Executive Dashboard
**Tujuan:** Memberikan gambaran kilat (*helicopter view*) kepada pimpinan pabrik mengenai volume garapan dan rasio cacat produk pada periode aktif.

* **Kartu Total Garapan (Hijau Neon)**:
  * Menampilkan total akumulasi batang rokok yang diproduksi.
  * Dilengkapi status pencapaian target produksi (100%).
* **Kartu Kerusakan Telak (Cyan Neon)**:
  * Menampilkan jumlah unit rokok yang ditolak/rusak hasil pemeriksaan awal oleh petugas Telak.
  * Rasio % Kerusakan Telak dihitung dengan rumus: `(Total Telak / Total Garapan) * 100%`.
* **Kartu Kerusakan Mandor (Ungu Neon)**:
  * Menampilkan jumlah unit kerusakan yang ditemukan pada inspeksi tingkat mandor/pengawas.
* **Kartu Gap Variansi (Kuning Amber)**:
  * Menampilkan selisih (*Escaped Defect*): `Kerusakan Mandor - Kerusakan Telak`.
  * Semakin tinggi angka ini, semakin banyak cacat produk yang lolos dari pemeriksaan petugas telak awal.
* **Kartu Best Quality Worker (Hijau Emerald)**:
  * Memberikan penghargaan otomatis kepada pekerja telak dengan tingkat cacat terendah yang bekerja di bawah batas toleransi (*benchmark* mutu).

---

### Menu 2: Key Insights & AI
**Tujuan:** Menyediakan interpretasi data otomatis berbasis kecerdasan analitik tanpa perlu menghitung manual:
1. **Volume vs Defect**: Mengidentifikasi pekerja dengan kapasitas garapan terbesar dan mengevaluasi apakah volume tinggi berdampak pada peningkatan angka kerusakan.
2. **Top Defect Criteria**: Menyorot 3 jenis cacat produk yang paling dominan di pabrik dari 8 kriteria murni (misal: MEKAR-MINGKUP, MEDOT, COWONG).
3. **Inspection Gap**: Menghitung persentase deviasi temuan pengawas mandor terhadap telak untuk evaluasi ketelitian kerja.
4. **Quality Benchmark**: Menentukan operator telak teladan yang layak dijadikan rujukan pelatihan bagi operator lainnya.

---

### Menu 3: Visual Analytics
**Tujuan:** Menganalisis korelasi dan tren waktu melalui 4 grafik interaktif:
1. **Analisis Tren Harian Kerusakan (Area Chart)**:
   * Menampilkan garis waktu fluktuasi harian cacat Telak (Cyan) vs Mandor (Ungu).
   * Berguna untuk memantau apakah ada lonjakan cacat pada tanggal tertentu (misalnya awal pekan atau akhir shift).
2. **Perbandingan per Pekerja (Bar Chart)**:
   * Membandingkan volume kerusakan masing-masing operator telak lengkap dengan kode lokalisasi kerjanya.
3. **Tren Kriteria Kerusakan (Degradasi Warna Neon)**:
   * Dilengkapi **Dropdown Filter Kriteria**: Anda bisa memilih melihat grafik spesifik untuk *COWONG*, *PAPIR KUSUT*, *LEM KURANG*, *TALIPAN KOTOR*, *MUNTIR*, *MEDOT*, *ATOS*, atau *MEKAR-MINGKUP*.
   * Dilengkapi **Filter Rentang Tanggal** (Mulai - Sampai) untuk memantau masa kritis mesin tertentu.
4. **Scatter Plot: Garapan vs % Rasio Kerusakan**:
   * Menunjukkan titik sebaran (*correlation matrix*). Operator di sudut kanan-bawah adalah yang paling ideal (Garapan Tinggi, % Cacat Rendah). Operator di kiri-atas memerlukan pembinaan teknik giling.

---

### Menu 4: Matrix Heatmap
**Tujuan:** Memetakan titik kritis kerusakan berdasarkan lokasi meja/sektor giling dan 8 kriteria cacat murni.

* **Indikator Warna Sel Matriks**:
  * 🟢 **Hijau (Rendah / Aman)**: Persentase cacat `< 1.2%`.
  * 🟡 **Kuning (Sedang / Peringatan)**: Persentase cacat antara `1.2% - 2.0%`.
  * 🔴 **Merah (Tinggi / Kritis)**: Persentase cacat `> 2.0%`.
* **8 Kriteria Cacat yang Dipantau**:
  1. **CW** (*Cowong*)
  2. **PK** (*Papir Kusut*)
  3. **LK** (*Lem Kurang*)
  4. **TK** (*Talipan Kotor*)
  5. **MT** (*Muntir*)
  6. **MD** (*Medot*)
  7. **AT** (*Atos*)
  8. **MM** (*Mekar-Mingkup*)

---

### Menu 5: Detail Rekapitulasi
**Tujuan:** Menampilkan tabel master data seluruh pekerja secara rinci.
* **Kolom**: Nama Pekerja, Lokal Kerja, Mandor Penanggung Jawab, Merek/Brand Rokok, Total Garapan, Kerusakan Telak, Kerusakan Mandor, Gap (Selisih), Rata % Telak, Rata % Mandor, dan Badge Status.
* **Sorotan Otomatis (Conditional Formatting)**:
  * Operator dengan rasio cacat `> 2.0%` akan otomatis diberi tanda warna merah dan label **High Risk**.
  * Operator dengan performa baik diberi label hijau **Normal**.
* **Pencarian Cepat**: Ketik nama pekerja, brand, atau lokal pada kotak pencarian di bagian atas tabel untuk menyaring data seketika.

---

### Menu 6: Master Mandor & Lokal
**Tujuan:** Mengelola daftar referensi penugasan mandor, kode lokal meja, dan brand rokok.
* **Tambah Data**: Klik tombol **"Tambah Data Baru"** untuk mendaftarkan lokal baru (misal: *1A, 2B, 3D*), nama mandor (misal: *M. Nirwansyah*), dan merek yang diproduksi (misal: *MW, Sukun 2000*).
* **Edit & Hapus**: Tombol ikon pensil (edit) dan tempat sampah (hapus) di setiap baris.
* **Korelasi Otomatis**: Saat Anda mengimpor data rekap harian, sistem otomatis mencocokkan nama lokal dengan nama mandor dan brand dari tabel master ini.

---

## 4. PANDUAN DRAG & DROP FILE EXCEL

Anda tidak perlu menginput data satu per satu. Cukup seret file Excel dari File Explorer ke jendela dashboard.

```
                  ┌──────────────────────────────────────────────┐
                  │                                              │
  File Excel ───► │      LEPASKAN FILE EXCEL DI SINI!            │
  (.xlsx / .csv)  │  [Auto-Detect Kolom & Simpan Otomatis]       │
                  │                                              │
                  └──────────────────────────────────────────────┘
```

### 3 Format File yang Didukung Otomatis:

#### Format A: Rekapitulasi Harian Telak & Mandor
File Excel dengan kolom:
```csv
TANGGAL, NAMA TELAK, NAMA MANDOR, LOKAL, BRAND, GARAPAN, COWONG, PAPIR KUSUT, LEM KURANG, TALIPAN KOTOR, MUNTIR, MEDOT, ATOS, MEKAR-MINGKUP, KERUSAKAN TELAK, KERUSAKAN MANDOR
```
*(Catatan: Kolom Kekurangan Papir otomatis diabaikan karena bukan kriteria kerusakan batangan)*.

#### Format B: Form Kartu Giling Gudang 3 (Kode Singkatan)
File Excel dengan header kartu kerja operator:
```csv
NO URUT, NO KARTU, N A M A, CW, PK, LK, TK, MT, MD, AT, MM
```
Sistem otomatis mengonversi kode singkatan:
`CW` ➔ Cowong, `PK` ➔ Papir Kusut, `LK` ➔ Lem Kurang, `TK` ➔ Talipan Kotor, `MT` ➔ Muntir, `MD` ➔ Medot, `AT` ➔ Atos, `MM` ➔ Mekar-Mingkup.

#### Format C: Master Data Mandor & Lokal
File Excel dengan kolom:
```csv
NAMA LOKAL, NAMA MANDOR, BRAND
```

---

## 5. PANDUAN KUSTOMISASI MENU & DASHBOARD

Jika Anda ingin mengubah tampilan, menambah menu, atau mengatur batas peringatan mutu:

1. Klik tombol **"Ubah Menu & Widget"** di bagian bawah sidebar.
2. Jendela modal pengaturan akan terbuka dengan 5 tab:
   * **Tab 1: Menu Sidebar**:
     * Geser urutan menu dengan tombol **Panah Atas / Bawah**.
     * Ganti label teks menu atau ubah ikon FontAwesome (misal `fa-solid fa-chart-pie`).
     * Klik ikon mata untuk menyembunyikan (Hide) atau menampilkan (Show) menu.
     * Klik **"Tambah Menu Baru"** jika ingin menambahkan pintasan menu tambahan.
   * **Tab 2: Widget Dashboard**:
     * Centang / matikan saklar untuk kartu KPI atau grafik yang ingin Anda sembunyikan dari layar utama.
   * **Tab 3: Batas Toleransi KPI**:
     * Atur batas target kualitas (default: `1.0%`).
     * Atur ambang batas merah / kritis (default: `2.0%`).
   * **Tab 4: Kriteria Cacat**:
     * Anda dapat mengganti nama kriteria (misal mengubah istilah teknis pabrik) atau memilih warna degradasi grafiknya.
   * **Tab 5: Identitas & Gudang**:
     * Ubah judul aplikasi, sub-judul, dan nama gudang (misal dari "Gudang 3" ke "Gudang 1 / Bagian Giling").
3. Klik tombol **"Simpan Perubahan"**.

---

## 6. SINKRONISASI DUA ARAH KE GOOGLE SPREADSHEET

Agar data tidak hilang saat membersihkan cache browser atau saat berpindah komputer, hubungkan aplikasi ke Google Spreadsheet Anda:

### Langkah Pemasangan (Hanya Sekali):
1. Buat spreadsheet baru di [sheets.new](https://sheets.new). Beri nama file: **`DATABASE_UTAMA_PRODUKSI`**.
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus semua tulisan di editor Apps Script, lalu buka file:
   📂 `D:\APLIKASI\dashboard-produksi\google-apps-script.js`
4. Salin seluruh isi file tersebut dan tempel (paste) ke editor Apps Script.
5. Klik ikon **Simpan (Disket)**.
6. Klik tombol biru **Deploy (Terapkan)** di pojok kanan atas > **New deployment**.
7. Klik ikon roda gigi di sebelah kiri > pilih **Web app**.
8. Konfigurasi:
   * **Description**: `Database Produksi`
   * **Execute as**: `Me (email Anda)`
   * **Who has access**: `Anyone (Siapa saja)`
9. Klik **Deploy**, klik *Authorize access* dan izinkan akun Google Anda.
10. Salin **Web app URL** yang muncul (berakhiran `/exec`).
11. Buka Dashboard aplikasi > klik tombol **"Database Sheet"** di sidebar > tempelkan URL tersebut > klik **Simpan URL**.

### Cara Kerja Sinkronisasi:
* **Auto-Sync Otomatis**: Setiap kali Anda men-drag Excel baru, data langsung terkirim dan tersimpan rapi ke Google Spreadsheet Anda.
* **Tarik Data dari Cloud**: Jika Anda membuka aplikasi di laptop lain, cukup masukkan URL Web App yang sama lalu klik **"Tarik Data dari Cloud"**; semua riwayat data dan pengaturan akan langsung muncul kembali!

---

## 7. EKSPOR LAPORAN & CETAK PDF

### 1. Ekspor ke Excel (.xlsx)
Klik tombol **"Export Excel"** di sidebar. Sistem akan menghasilkan file Excel resmi dengan 2 Sheet terpisah:
* **Sheet 1**: Rekapitulasi Produksi lengkap dengan rincian 8 kriteria cacat.
* **Sheet 2**: Master Lokal, Mandor, dan Brand.

### 2. Ekspor ke CSV (.csv)
Klik tombol **"Export CSV"** untuk kebutuhan analisis cepat di software lain.

### 3. Cetak Laporan Eksekutif (Print / PDF)
Klik tombol **"Cetak Laporan"** di header atas (atau tekan `Ctrl + P`).
Aplikasi telah dilengkapi styling khusus cetak: sidebar dan tombol-tombol antarmuka otomatis disembunyikan, menghasilkan format cetak dokumen bersih dan profesional siap diserahkan ke jajaran manajemen pabrik.

---

## 8. TANYA JAWAB & TROUBLESHOOTING (FAQ)

**Q: Apakah data saya hilang jika laptop dimatikan?**  
*A: Tidak. Data tersimpan di 3 lapis pengamanan:*
1. *Tersimpan di database lokal Node.js (`data/database.json`).*
2. *Tersimpan di browser storage (LocalStorage).*
3. *Tersimpan permanen di Google Spreadsheet cloud Anda jika sudah dihubungkan.*

**Q: Bagaimana jika format Excel yang saya miliki urutan kolomnya berbeda?**  
*A: Sistem menggunakan algoritma pencocokan nama header cerdas (*fuzzy matching*). Selama ada kata kunci seperti `NAMA`, `GARAPAN`, `LOKAL`, atau nama cacat seperti `COWONG`, `MEDOT`, sistem otomatis mengenalinya tanpa terpengaruh urutan kolom.*

**Q: Bagaimana jika saya ingin mereset semua pengaturan menu ke bawaan pabrik?**  
*A: Buka modal "Ubah Menu & Widget", lalu di pojok kiri bawah klik tombol "Reset ke Pengaturan Awal".*

---
*Dokumen ini diterbitkan untuk PT. Sukun Wartono Indonesia — Divisi Pengawasan Mutu & Produksi.*
