/**
 * KODE FINAL UANGKU V8.6 PRO - VERCEL EDITION
 * By Rizkiakbarma
 * Struktur: (A) Tanggal | (B) Keterangan | (C) ID Pengguna| (D) Kategori | (E) Tipe| (F) Nominal | (G) Status
 */

const TOKEN = "8672396169:AAFRRzCBMDXVRRRRSRcOE1JWRW9cV9h51LE"; 
const SHEET_NAME = "Data_Transaksi"; 

// 🔗 LINK WEBSITE VERCEL BARU KAMU
const VERCEL_URL = "https://uangku-rizkiakbarma.vercel.app";

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return returnJson({ status: "error", message: "Tab tidak ditemukan" });

    const userId = e.parameter.userid;
    if (!userId) return returnJson({ status: "error", message: "Akses Ditolak: User ID diperlukan." });

    if (e.parameter.action === "delete") {
      const rowToDelete = parseInt(e.parameter.row);
      const checkId = sheet.getRange(rowToDelete, 3).getValue();
      if (String(checkId) === String(userId)) {
        sheet.deleteRow(rowToDelete);
        return returnJson({ status: "success", message: "Data berhasil dihapus." });
      } else {
        return returnJson({ status: "error", message: "Akses hapus ditolak." });
      }
    }

    const data = sheet.getDataRange().getValues();
    const transactions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] !== "" && String(row[2]) === String(userId)) {
        transactions.push({
          id: i + 1,
          date: row[0],
          desc: row[1] || "",
          category: row[3] || "Lain-lain",
          type: row[4] || "Keluar",
          amount: parseFloat(row[5]) || 0,
          status: row[6] || "Selesai"
        });
      }
    }
    return returnJson({ status: "success", data: transactions });
  } catch (error) {
    return returnJson({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    if (!contents.message || !contents.message.text) return;
    
    const chatId = contents.message.chat.id;
    const rawText = contents.message.text;
    const text = rawText.toLowerCase();
    
    let tipe = "Keluar"; 
    let kategori = "Lain-lain";
    
    const kataKunciMasuk = ["masuk", "terima", "dapat", "beasiswa", "gaji", "pemasukan", "ortu", "uti", "mama", "papa"];
    const isMasuk = kataKunciMasuk.some(kata => text.includes(kata));
    
    if (isMasuk) {
      tipe = "Masuk";
      kategori = text.includes("beasiswa") ? "Beasiswa" : (text.includes("gaji") ? "Gaji" : "Pendapatan");
    } else {
      if (text.includes("makan") || text.includes("nasi")) kategori = "Makan & Minum";
      else if (text.includes("jajan") || text.includes("kopi")) kategori = "Jajan";
      else if (text.includes("wifi") || text.includes("listrik") || text.includes("pulsa")) kategori = "Tagihan";
    }

    let amount = 0;
    const matches = text.match(/[\d\.,]+/g);
    if (matches) {
      let numStr = matches[matches.length - 1]; 
      amount = parseInt(numStr.replace(/[\.,]/g, ""));
      if (text.includes("juta")) amount *= 1000000;
      else if (text.includes("ribu") || text.includes("k")) if (amount < 1000) amount *= 1000;
    }

    if (amount > 0) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName(SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        sheet.appendRow(["Tanggal", "Keterangan", "ID Pengguna", "Kategori", "Tipe", "Nominal", "Status"]);
      }
      
      const columnA = sheet.getRange("A:A").getValues();
      let lastRow = 0;
      for (let i = columnA.length - 1; i >= 0; i--) {
        if (columnA[i][0] !== "") { lastRow = i + 1; break; }
      }
      const nextRow = lastRow + 1;
      
      sheet.getRange(nextRow, 1, 1, 7).setValues([[new Date(), rawText, chatId, kategori, tipe, amount, "Selesai"]]);
      
      // MENGGUNAKAN LINK VERCEL YANG BARU
      const dashboardLink = `${VERCEL_URL}/?userid=${chatId}`;
      const msg = `✅ *Tercatat!* \n\n📂 Kategori: *${kategori}* \n💰 Nominal: *Rp ${amount.toLocaleString('id-ID')}* \n\n📊 *Buka Dashboard Pro:* [Klik Di Sini](${dashboardLink})`;
      sendText(chatId, msg);
    }
  } catch (err) {}
}

function returnJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sendText(chatId, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  UrlFetchApp.fetch(url);
}
