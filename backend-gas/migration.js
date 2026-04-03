/**
 * MIGRASI DATA HISTORIS KE SUPABASE
 * Fungsi ini menyisir semua transaksi di Spreadsheet dan mengirimkan yang BELUM ada di Supabase.
 */
function migrateOldDataToSupabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tSheet = ss.getSheetByName(SHEET_NAME); // "Data_Transaksi"
  if (!tSheet) {
    console.error("Tab " + SHEET_NAME + " tidak ditemukan!");
    return;
  }

  const data = tSheet.getDataRange().getValues();
  let migratedCount = 0;
  let skippedCount = 0;

  console.log("Memulai migrasi " + (data.length - 1) + " baris...");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const supaId = String(row[7] || "").trim(); // Kolom H (Index 7) adalah SupaID

    // Jika Kolom H kosong atau "0", berarti belum ada di Supabase
    if (supaId === "" || supaId === "0") {
      const date = row[0];
      const desc = row[1];
      const chatId = String(row[2]).trim();
      const category = row[3];
      const type = row[4];
      const amount = parseFloat(row[5]) || 0;

      // Kirim ke Supabase
      const payload = {
        user_id: chatId,
        date: new Date(date).toISOString(),
        description: desc,
        amount: amount,
        category: category,
        type: type,
        status: "Selesai"
      };

      const resCode = sendToSupabase("transactions", payload);

      if (resCode === 200 || resCode === 201) {
        // Tandai di Spreadsheet agar tidak di-migrasi ulang
        tSheet.getRange(i + 1, 8).setValue("MIGRATED");
        migratedCount++;
      } else {
        console.error("Gagal migrasi baris " + (i + 1) + ": " + desc);
      }
    } else {
      skippedCount++;
    }
  }

  console.log("MIGRASI SELESAI!");
  console.log("Berhasil: " + migratedCount);
  console.log("Sudah ada sebelumnya (Skipped): " + skippedCount);
  
  return "Migrasi Selesai! Berhasil: " + migratedCount + ", Lewat: " + skippedCount;
}
