# Executive Production & Defect Quality Dashboard (Node.js)

Aplikasi Web Eksekutif untuk Pemantauan Kualitas Produksi & Cacat (Defect), dilengkapi fitur **Drag-and-Drop Excel**, **Kustomisasi Menu & Dashboard**, dan **Database Google Spreadsheet** dua arah agar data tidak pernah hilang.

---

## 🚀 Cara Menjalankan Aplikasi dengan Node.js

1. Buka Terminal / PowerShell di folder ini (`C:\Users\Administrator\.gemini\antigravity\scratch\aplikasi`):
   ```bash
   npm start
   ```
2. Buka browser dan akses:
   ```
   http://localhost:3000
   ```
*(Aplikasi juga dapat langsung dibuka tanpa server dengan mengklik dua kali file `public/index.html` di browser)*.

---

## 📂 Struktur Folder Proyek

```
aplikasi/
├── server.js                 # Backend Server Node.js (Express REST API & Static Server)
├── package.json              # Konfigurasi dependensi Node.js
├── google-apps-script.js     # Kode backend siap pakai untuk Google Spreadsheet
├── README.md                 # Dokumentasi panduan lengkap
├── data/                     # Database lokal JSON (tersimpan otomatis)
│   ├── database.json         # Data rekapitulasi produksi & defect pekerja
│   ├── master_lokal_mandor.json # Master data Lokal, Mandor, & Brand
│   └── config.json           # Konfigurasi menu kustom & widget dashboard
└── public/                   # Frontend Web Dashboard (Glassmorphism Dark Theme)
    ├── index.html            # Halaman utama & modal kustomisasi
    ├── app.js                # Logika drag & drop, kalkulasi cacat, charts, sync
    └── style.css             # Tema glassmorphism & animasi responsive
```

---

## 🎯 Fitur Utama

### 1. Drag & Drop File Excel Langsung ke Dashboard
- Anda cukup men-drag file `.xlsx`, `.xls`, atau `.csv` dari komputer ke browser.
- Layar otomatis menampilkan area dropzone bercahaya.
- **Mendukung 3 format sekaligus**:
  1. **Rekap Harian Defect**: Kolom `TANGGAL, NAMA TELAK, MANDOR, LOKAL, BRAND, GARAPAN, COWONG, PAPIR KUSUT, LEM KURANG, TALIPAN KOTOR, MUNTIR, MEDOT, ATOS, MEKAR-MINGKUP, KERUSAKAN TELAK, KERUSAKAN MANDOR`.
  2. **Master Mandor & Lokal**: Kolom `NAMA LOKAL, NAMA MANDOR, BRAND`.
  3. **Form Kartu Giling Gudang 3**: Kolom `NO URUT, NO KARTU, N A M A, CW, PK, LK, TK, MT, MD, AT, MM`.
- Sistem cerdas otomatis mendeteksi sheet dan mengagregasi total garapan, cacat telak, cacat mandor, serta rasio % kerusakan per pekerja.

---

### 2. Menu & Dashboard Bisa Dirubah Sesuai Keinginan
Klik tombol **"Ubah Menu & Widget"** di sidebar atau tombol pengatur:
- **Pengaturan Menu Sidebar**:
  - Ubah urutan menu (geser Naik/Turun).
  - Ubah nama label menu.
  - Ubah ikon (FontAwesome).
  - Tampilkan atau sembunyikan menu.
  - Tambah menu kustom baru.
- **Pengaturan Widget Dashboard**:
  - Tampilkan atau sembunyikan KPI Cards (Total Garapan, Kerusakan Telak, Kerusakan Mandor, Gap Variansi, Best Worker).
  - Tampilkan atau sembunyikan grafik (Tren Harian, Bar Per Pekerja, Tren Line Kriteria Cacat, Scatter Plot, Heatmap Matrix, Tabel Detail).
- **Pengaturan Batas Toleransi KPI**:
  - Ubah batas toleransi target (default: 1.0%).
  - Ubah batas High Risk / Kritis (default: 2.0%). Baris pekerja di atas batas ini otomatis disorot merah.
- **Pengaturan Kriteria Cacat**:
  - Ganti nama atau singkatan kriteria (COWONG, MEDOT, MEKAR-MINGKUP, dll).
  - Tambah kriteria cacat baru sesuai kebutuhan.
- **Identitas Dashboard**:
  - Ganti judul, sub-judul, dan nama gudang (misal: "Gudang 3").

---

### 3. Database lewat Google Spreadsheet (Agar Data Tidak Hilang)

Selain tersimpan di database lokal Node.js (`data/database.json`) dan browser (LocalStorage/IndexedDB), data dapat disinkronkan langsung ke Google Spreadsheet:

#### Langkah Setup (Hanya 1 Menit):
1. Buat Google Spreadsheet baru di browser: [sheets.new](https://sheets.new)
2. Klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus kode default, lalu **Paste** seluruh isi file `google-apps-script.js`.
4. Klik **Simpan (Save)**.
5. Klik tombol **Deploy (Terapkan)** di kanan atas > **New deployment** > pilih jenis **Web app**.
6. Atur konfigurasi:
   - **Execute as**: Me
   - **Who has access**: Anyone (Siapa saja)
7. Klik **Deploy** dan berikan izin Google jika diminta.
8. Salin **Web app URL** yang muncul (berakhiran `/exec`).
9. Di dashboard aplikasi, klik tombol **"Database Sheet"** > Paste URL tersebut > Klik **Simpan URL**.

Setiap kali Anda men-drag Excel baru, data akan otomatis tersimpan langsung ke Google Spreadsheet Anda secara realtime!

---

### 4. Ekspor & Cetak Laporan
- **Export Excel (.xlsx)**: Menghasilkan file Excel multi-sheet (Sheet 1: Rekap Produksi & Defect, Sheet 2: Master Mandor & Lokal).
- **Export CSV**: Format cepat untuk data olahan.
- **Cetak Laporan**: Template rapi dan bersih siap cetak ke printer fisik maupun PDF.
