/**
 * GOOGLE APPS SCRIPT DATABASE BACKEND UNTUK EXECUTIVE QUALITY DASHBOARD
 * ---------------------------------------------------------------------
 * Cara Pemasangan (Hanya 1 Menit):
 * 1. Buka Google Spreadsheet baru di browser (sheets.new)
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script"
 * 3. Hapus semua kode default di editor, lalu PASTE SELURUH KODE DI BAWAH INI
 * 4. Klik ikon Save (Disket)
 * 5. Klik tombol "Deploy" (Terapkan) di kanan atas > "New deployment" (Penerapan baru)
 * 6. Klik ikon gear (roda gigi) di samping "Select type", pilih "Web app"
 * 7. Isi:
 *    - Description: Database Dashboard Produksi
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 8. Klik "Deploy", beri izin otorisasi Google jika diminta.
 * 9. Copy "Web app URL" (akhiran /exec) dan paste ke Pengaturan Google Sheets di Dashboard!
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    
    var result = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {}
    };

    // 1. Ambil Data Workers / Produksi
    var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
    if (prodSheet) {
      result.data.workers = getSheetDataAsJson(prodSheet);
    } else {
      result.data.workers = [];
    }

    // 2. Ambil Master Mandor & Lokal
    var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR");
    if (masterSheet) {
      result.data.master = getSheetDataAsJson(masterSheet);
    } else {
      result.data.master = [];
    }

    // 3. Ambil Konfigurasi
    var configSheet = ss.getSheetByName("KONFIGURASI");
    if (configSheet) {
      var rawCfg = configSheet.getRange("A2").getValue();
      if (rawCfg) {
        try {
          result.data.config = JSON.parse(rawCfg);
        } catch(err) {
          result.data.config = null;
        }
      }
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
    var action = postData.action || 'syncAll';

    // 1. Simpan Workers & Defects
    if (postData.workers && Array.isArray(postData.workers)) {
      var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
      if (!prodSheet) {
        prodSheet = ss.insertSheet("DATABASE_PRODUKSI");
      }
      prodSheet.clearContents();

      var headers = [
        "Nama Pekerja", "Lokal", "Mandor", "Brand", "Total Garapan", 
        "Kerusakan Telak", "Kerusakan Mandor", "Rasio % Telak", "Rasio % Mandor",
        "COWONG", "PAPIR KUSUT", "LEM KURANG", "TALIPAN KOTOR", 
        "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", "Last Updated"
      ];
      prodSheet.appendRow(headers);

      var rows = postData.workers.map(function(w) {
        var d = w.defects || {};
        return [
          w.name || "",
          w.lokal || "",
          w.mandor || "",
          w.brand || "",
          w.garapan || 0,
          w.telak || 0,
          w.mandorDefect || w.mandor || 0,
          w.pctTelak || 0,
          w.pctMandor || 0,
          d.cowong || 0,
          d.papir_kusut || 0,
          d.lem_kurang || 0,
          d.talipan_kotor || 0,
          d.muntir || 0,
          d.medot || 0,
          d.atos || 0,
          d.mekar_mingkup || 0,
          new Date().toLocaleString("id-ID")
        ];
      });

      if (rows.length > 0) {
        prodSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      formatSheet(prodSheet, headers.length);
    }

    // 2. Simpan Master Lokal Mandor Brand
    if (postData.master && Array.isArray(postData.master)) {
      var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR");
      if (!masterSheet) {
        masterSheet = ss.insertSheet("MASTER_LOKAL_MANDOR");
      }
      masterSheet.clearContents();

      var mHeaders = ["NAMA LOKAL", "NAMA MANDOR", "BRAND", "Last Updated"];
      masterSheet.appendRow(mHeaders);

      var mRows = postData.master.map(function(m) {
        return [
          m.lokal || "",
          m.mandor || "",
          m.brand || "",
          new Date().toLocaleString("id-ID")
        ];
      });

      if (mRows.length > 0) {
        masterSheet.getRange(2, 1, mRows.length, mHeaders.length).setValues(mRows);
      }
      formatSheet(masterSheet, mHeaders.length);
    }

    // 3. Simpan Konfigurasi Menu & Widgets
    if (postData.config) {
      var configSheet = ss.getSheetByName("KONFIGURASI");
      if (!configSheet) {
        configSheet = ss.insertSheet("KONFIGURASI");
      }
      configSheet.clearContents();
      configSheet.appendRow(["Config_JSON", "Saved_At"]);
      configSheet.appendRow([JSON.stringify(postData.config), new Date().toLocaleString("id-ID")]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan permanen ke Google Spreadsheet!",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

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

function formatSheet(sheet, colCount) {
  try {
    sheet.getRange(1, 1, 1, colCount)
      .setBackground("#0F172A")
      .setFontColor("#00F2FE")
      .setFontWeight("bold");
    sheet.autoResizeColumns(1, colCount);
  } catch(e) {}
}
