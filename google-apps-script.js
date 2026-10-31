/**
 * GOOGLE APPS SCRIPT DATABASE BACKEND & AUTOMATIC TEMPLATE GENERATOR
 * PT. SUKUN WARTONO INDONESIA — DIVISI PENGAWASAN MUTU & PRODUKSI
 * =====================================================================
 * Spreadsheet ID: 1SxLbYUQQ1lDrr9diGAc7Z3WJZP4_pCwnNdCEdQ9vbMM
 * Link: https://docs.google.com/spreadsheets/d/1SxLbYUQQ1lDrr9diGAc7Z3WJZP4_pCwnNdCEdQ9vbMM/edit
 */

// 1. MENU OTOMATIS DI TOOLBAR SPREADSHEET
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏭 MENU SUKUN QC')
    .addItem('📊 1-Klik Buat / Reset Seluruh Kolom Lengkap', 'setupSpreadsheetLengkap')
    .addItem('📋 Perbarui Form Giling Gudang 3 Saja', 'setupFormGiling')
    .addSeparator()
    .addItem('ℹ️ Petunjuk Deploy Web App', 'tampilkanPetunjukDeploy')
    .addToUi();
}

// 2. FUNGSI UTAMA: MEMBUAT SELURUH TAB, KOLOM, FORMULA, DAN MASTER DATA LENGKAP
function setupSpreadsheetLengkap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // -------------------------------------------------------------
  // TAB 1: DATABASE_PRODUKSI (Input Rekap Cacat Harian)
  // -------------------------------------------------------------
  var sheetProduksi = ss.getSheetByName("DATABASE_PRODUKSI");
  if (!sheetProduksi) {
    sheetProduksi = ss.insertSheet("DATABASE_PRODUKSI", 0);
  }
  sheetProduksi.clear();

  var headersProd = [
    "TANGGAL", "NAMA TELAK", "NAMA MANDOR", "LOKAL", "BRAND", 
    "ABSENSI GILING", "GARAPAN", "COWONG", "PAPIR KUSUT", "LEM KURANG", 
    "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", 
    "KERUSAKAN TELAK", "KERUSAKAN MANDOR", "KEKURANGAN PAPIR", "% RASIO TELAK", "% RASIO MANDOR"
  ];
  sheetProduksi.appendRow(headersProd);

  // Sample data sesuai file asli PT Sukun
  var sampleRows = [
    ["2026-07-24", "FIDZALIKA ADZANI", "MUSLIKIN", "3B", "MW", 0.9, 28300, 126, 2, 2, 0, 0, 7, 0, 91, "=SUM(H2:O2)", 2472, 0, "=(P2/G2)*100", "=(Q2/G2)*100"],
    ["2026-07-24", "FIDZALIKA ADZANI", "MUSLIKIN", "3B", "MW", 1.0, 54160, 235, 0, 8, 7, 2, 39, 0, 117, "=SUM(H3:O3)", 3592, 0, "=(P3/G3)*100", "=(Q3/G3)*100"],
    ["2026-07-25", "SITI SOLIHATI", "SABILI ABIDUL H.", "1B", "KS New", 1.0, 45000, 110, 24, 35, 19, 34, 162, 46, 217, "=SUM(H4:O4)", 999, 0, "=(P4/G4)*100", "=(Q4/G4)*100"],
    ["2026-07-25", "EVA NURUL JANNAH", "M. NAUFAL A.", "2A", "SSB", 1.0, 44100, 56, 14, 20, 11, 19, 109, 25, 166, "=SUM(H5:O5)", 651, 0, "=(P5/G5)*100", "=(Q5/G5)*100"],
    ["2026-07-25", "SONYA NOVITA D.", "PURYANI", "3A", "Intan", 1.0, 49700, 142, 34, 44, 27, 46, 241, 59, 299, "=SUM(H6:O6)", 1978, 0, "=(P6/G6)*100", "=(Q6/G6)*100"]
  ];
  for (var r = 0; r < sampleRows.length; r++) {
    sheetProduksi.appendRow(sampleRows[r]);
  }

  formatHeaderRange(sheetProduksi, 1, 1, 1, headersProd.length, "#0F172A", "#38BDF8");
  sheetProduksi.setFrozenRows(1);
  autoFitColumns(sheetProduksi, headersProd.length);

  // -------------------------------------------------------------
  // TAB 2: MASTER_LOKAL_MANDOR (16 Data Master Lengkap)
  // -------------------------------------------------------------
  var sheetMaster = ss.getSheetByName("MASTER_LOKAL_MANDOR");
  if (!sheetMaster) {
    sheetMaster = ss.insertSheet("MASTER_LOKAL_MANDOR", 1);
  }
  sheetMaster.clear();

  var headersMaster = ["NAMA LOKAL", "NAMA MANDOR", "BRAND", "KETERANGAN"];
  sheetMaster.appendRow(headersMaster);

  var masterRows = [
    ["1A", "M. NIRWANSYAH", "MW", "Aktif"],
    ["1B", "SABILI ABIDUL H.", "KS New", "Aktif"],
    ["1C", "LUSI M.", "Gemilang", "Aktif"],
    ["1D", "EKA HAPPY", "Istimea", "Aktif"],
    ["1E", "JANNAH", "Abu-abu", "Aktif"],
    ["1F", "NOOR SULIKAN.", "Orange Fresh", "Aktif"],
    ["2A", "M. NAUFAL A.", "SSB", "Aktif"],
    ["2B", "M. NURDIN", "Premiere", "Aktif"],
    ["2C", "ALI MAHMUD A.", "Sukun 2000", "Aktif"],
    ["2D", "CHOFIFAH", "Intan", "Aktif"],
    ["2E (PELATIHAN)", "SUWARSIH", "Biru Sapphiere", "Pelatihan"],
    ["2F (PELATIHAN)", "MURYATI", "", "Pelatihan"],
    ["3A", "PURYANI", "", "Aktif"],
    ["3B", "MUSLIKIN", "", "Aktif"],
    ["3C", "PIPIT P.", "", "Aktif"],
    ["3D", "ZUMROH", "", "Aktif"]
  ];
  for (var m = 0; m < masterRows.length; m++) {
    sheetMaster.appendRow(masterRows[m]);
  }

  formatHeaderRange(sheetMaster, 1, 1, 1, headersMaster.length, "#0F172A", "#34D399");
  sheetMaster.setFrozenRows(1);
  autoFitColumns(sheetMaster, headersMaster.length);

  // -------------------------------------------------------------
  // TAB 3: FORM_GILING_GUDANG_3 (Format Meja Giling Gudang 3)
  // -------------------------------------------------------------
  setupFormGiling();

  // Hapus Sheet default kosong jika ada
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }

  ss.setActiveSheet(sheetProduksi);
  SpreadsheetApp.getUi().alert("✅ BERHASIL!\n\nSeluruh kolom, formula, 16 Master Mandor, dan Form Kartu Giling Gudang 3 telah 100% lengkap dibuat!");
}

// 3. FUNGSI KHUSUS: MEMBUAT FORM KARTU GILING GUDANG 3 TANPA ERROR
function setupFormGiling() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGiling = ss.getSheetByName("FORM_GILING_GUDANG_3");
  if (!sheetGiling) {
    sheetGiling = ss.insertSheet("FORM_GILING_GUDANG_3", 2);
  }
  sheetGiling.clear();

  var gilingGrid = [
    ["FORM KERUSAKAN ROKOK BATANGAN GUDANG 3", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["Tanggal", "", "", "Lokal", "", ":", "1A", "", "", "Quality Control", "", "Pelaksana Telak", ""],
    ["Brand", "", "", "Petugas Mandor", "", ":", "M. NIRWANSYAH", "", "", "", "", "", ""],
    ["Jumlah Produksi", "", "", "Giling", "", ":", "50000", "", "", "( Muhamad Syafa Hanif )", "", "( Fidzalika Adzani )", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["GILING", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["NO URUT", "NO KARTU", "N A M A", "CW", "PK", "LK", "TK", "MT", "MD", "AT", "MM", "TOTAL KERUSAKAN", "KETERANGAN"],
    [1, 5626, "Sri Suliyatun", 12, 1, 0, 0, 2, 4, 0, 8, "=SUM(D9:K9)", "OK"],
    [2, 5708, "Fitriana", 8, 0, 1, 0, 1, 3, 0, 6, "=SUM(D10:K10)", "OK"],
    [3, 5718, "Istifah", 10, 2, 1, 0, 0, 5, 1, 9, "=SUM(D11:K11)", "OK"],
    [4, 5730, "Sri Nurul Huda", 7, 0, 0, 0, 1, 2, 0, 5, "=SUM(D12:K12)", "OK"],
    [5, 6083, "Suyati", 15, 3, 2, 1, 2, 6, 0, 11, "=SUM(D13:K13)", "Perlu Pembinaan"],
    [6, 5638, "Siti Nor Jannah", 9, 1, 1, 0, 1, 4, 0, 7, "=SUM(D14:K14)", "OK"],
    [7, 6506, "Rini Astutuik", 11, 1, 0, 0, 0, 3, 0, 8, "=SUM(D15:K15)", "OK"],
    [8, 6501, "Intan Leni", 8, 0, 0, 0, 1, 2, 0, 6, "=SUM(D16:K16)", "OK"],
    [9, 6591, "Efit Mudi A.", 14, 2, 1, 1, 2, 5, 1, 10, "=SUM(D17:K17)", "OK"],
    [10, 6423, "Tyas Yulianis", 6, 0, 0, 0, 0, 2, 0, 4, "=SUM(D18:K18)", "Benchmark"],
    [11, 6364, "Nor Hayati", 10, 1, 1, 0, 1, 4, 0, 7, "=SUM(D19:K19)", "OK"],
    [12, 5636, "Nailis Sa'adah", 8, 0, 1, 0, 0, 3, 0, 6, "=SUM(D20:K20)", "OK"],
    [13, 6372, "Sri Ngatini", 12, 2, 1, 0, 1, 5, 0, 9, "=SUM(D21:K21)", "OK"],
    [14, 6412, "Tohiroh Mahrofi", 9, 1, 0, 0, 1, 3, 0, 7, "=SUM(D22:K22)", "OK"],
    [15, 6418, "Sugiarti", 13, 2, 1, 0, 2, 4, 1, 9, "=SUM(D23:K23)", "OK"],
    [16, 6571, "Kustini", 7, 0, 0, 0, 0, 2, 0, 5, "=SUM(D24:K24)", "Benchmark"],
    [17, 5842, "Khomsatun", 10, 1, 1, 0, 1, 4, 0, 8, "=SUM(D25:K25)", "OK"],
    [18, 5327, "Zurikah", 11, 2, 0, 0, 1, 3, 0, 8, "=SUM(D26:K26)", "OK"],
    ["", "", "TOTAL KERUSAKAN MEJA", "=SUM(D9:D26)", "=SUM(E9:E26)", "=SUM(F9:F26)", "=SUM(G9:G26)", "=SUM(H9:H26)", "=SUM(I9:I26)", "=SUM(J9:J26)", "=SUM(K9:K26)", "=SUM(L9:L26)", ""]
  ];

  sheetGiling.getRange(1, 1, gilingGrid.length, 13).setValues(gilingGrid);

  // Format Tampilan
  sheetGiling.getRange("A1").setFontSize(14).setFontWeight("bold").setFontColor("#0F172A");
  formatHeaderRange(sheetGiling, 8, 1, 1, 13, "#0F172A", "#FBBF24");
  sheetGiling.getRange(27, 1, 1, 13).setFontWeight("bold").setBackground("#F1F5F9");
  autoFitColumns(sheetGiling, 13);
}

// 4. API ENDPOINTS: DUA ARAH (GET & POST) UNTUK DASHBOARD WEB
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        workers: [],
        master: []
      }
    };

    var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
    if (prodSheet) {
      result.data.workers = getSheetDataAsJson(prodSheet);
    }

    var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR");
    if (masterSheet) {
      result.data.master = getSheetDataAsJson(masterSheet);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);

    if (postData.workers && Array.isArray(postData.workers)) {
      var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
      if (!prodSheet) prodSheet = ss.insertSheet("DATABASE_PRODUKSI", 0);
      prodSheet.clear();

      var headers = [
        "TANGGAL", "NAMA TELAK", "NAMA MANDOR", "LOKAL", "BRAND", 
        "ABSENSI GILING", "GARAPAN", "COWONG", "PAPIR KUSUT", "LEM KURANG", 
        "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", 
        "KERUSAKAN TELAK", "KERUSAKAN MANDOR", "KEKURANGAN PAPIR"
      ];
      prodSheet.appendRow(headers);

      var rows = postData.workers.map(function(w) {
        var d = w.defects || {};
        return [
          new Date().toLocaleDateString("id-ID"),
          w.name || "",
          w.mandor || "",
          w.lokal || "",
          w.brand || "",
          1.0,
          w.garapan || 0,
          d.cowong || 0,
          d.papir_kusut || 0,
          d.lem_kurang || 0,
          d.talipan_kotor || 0,
          d.muntir || 0,
          d.medot || 0,
          d.atos || 0,
          d.mekar_mingkup || 0,
          w.telak || 0,
          w.mandorDefect || w.mandor || 0,
          0
        ];
      });

      if (rows.length > 0) {
        prodSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      formatHeaderRange(prodSheet, 1, 1, 1, headers.length, "#0F172A", "#38BDF8");
      prodSheet.setFrozenRows(1);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan permanen di Google Spreadsheet!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 5. HELPER PARSER & FORMATTING
function getSheetDataAsJson(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || values.length <= 1) return [];

  var headers = values[0];
  var result = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      obj[key] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function formatHeaderRange(sheet, startRow, startCol, numRows, numCols, bgColor, fontColor) {
  try {
    sheet.getRange(startRow, startCol, numRows, numCols)
      .setBackground(bgColor)
      .setFontColor(fontColor)
      .setFontWeight("bold")
      .setFontFamily("Arial");
  } catch(e) {}
}

function autoFitColumns(sheet, numCols) {
  try {
    sheet.autoResizeColumns(1, numCols);
  } catch(e) {}
}

function tampilkanPetunjukDeploy() {
  var html = HtmlService.createHtmlOutput(
    '<p><b>Cara Mendapatkan Link Web App:</b></p>' +
    '<ol>' +
    '<li>Klik tombol biru <b>Deploy (Terapkan)</b> di pojok kanan atas.</li>' +
    '<li>Pilih <b>New deployment</b>.</li>' +
    '<li>Pilih jenis <b>Web app</b>.</li>' +
    '<li>Atur <i>Who has access</i>: <b>Anyone (Siapa saja)</b>.</li>' +
    '<li>Klik <b>Deploy</b> dan salin URL Web App ke dashboard web.</li>' +
    '</ol>'
  ).setWidth(400).setHeight(250);
  SpreadsheetApp.getUi().showModalDialog(html, 'Petunjuk Deploy Web App');
}
