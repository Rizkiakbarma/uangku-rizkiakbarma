/**
 * BudgetIN PRO - INTELLIGENT SHARIA FINANCIAL ASSISTANT
 * Branding: BudgetIN (Official Branding)
 * Version: 18.5 (Set Goal + Supabase Error Catcher + Motivation)
 * Developed for: Rizki Akbar
 */

// =========================================================================
// 1. KONFIGURASI UTAMA
// =========================================================================
const TELEGRAM_TOKEN = "8672396169:AAFRRzCBMDXVRRRRSRcOE1JWRW9cV9h51LE";
const SPREADSHEET_ID = "1FFs6DmkYwCmseCZvIw1rZRjRWU25dkIfN_XV8Md2jDY";
const SHEET_NAME = "Data_Transaksi";
const SHEET_USER = "Users";
const SHEET_VOUCHER = "Vouchers";

const DASHBOARD_URL = "https://budgetin-pro.vercel.app";
const MY_ADMIN_ID = "1210090213";

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = "https://tdjzksdxnvxoaethaxeo.supabase.co";
const SUPABASE_KEY = "sb_publishable_CIPEHIf12ctSTq_liVgWiA_E3n734fh";

const CATEGORY_MAP = {
    'PENDAPATAN': ['gajian', 'cair', 'transferan', 'bonus', 'profit', 'untung', 'sangu', 'pemasukan', 'income', 'pendapatan', 'terima', 'dapat', 'gaji', 'masuk', 'beasiswa', 'hibah', 'cashback', 'angpau', 'refund'],
    'KONSUMSI': ['makan', 'kopi', 'starbucks', 'indomaret', 'alfamart', 'gofood', 'grabfood', 'bakso', 'nasi', 'restoran', 'warung', 'jajan', 'snack', 'cemilan', 'mixue', 'haus', 'esteh', 'mie ayam', 'minum', 'minuman', 'kantin', 'burjo', 'sarapan', 'lunch', 'dinner', 'martabak', 'gorengan', 'cimol', 'cilok', 'seblak'],
    'TRANSPORTASI': ['gojek', 'grab', 'bensin', 'pertalite', 'pertamax', 'parkir', 'tol', 'ojek', 'transport', 'maxim', 'shell', 'mrt', 'krl', 'busway', 'tiket', 'travel', 'kereta', 'pesawat', 'tambal ban', 'servis', 'oli'],
    'PERSONAL CARE': ['skincare', 'laundry', 'cuci', 'sabun', 'sampo', 'shampoo', 'potong rambut', 'barbershop', 'salon', 'parfum', 'softlens', 'deodoran', 'odol', 'sikat gigi', 'facial', 'cuci muka', 'lotion', 'sunscreen'],
    'KEBUTUHAN RUMAH': ['sembako', 'beras', 'galon', 'gas', 'pdam', 'listrik', 'token', 'air', 'deterjen', 'cleaning', 'perabot', 'piring', 'kasur', 'sapu', 'pel', 'minyak goreng', 'telur', 'mi instan'],
    'SOSIAL': ['traktir', 'kondangan', 'iuran', 'sumbangan', 'kado', 'hadiah teman', 'amplop', 'donasi', 'arisan', 'patungan'],
    'KELUARGA': ['ibu', 'mama', 'bunda', 'orang tua', 'ortu', 'ayah', 'papa', 'adek', 'dede', 'adik', 'kakak', 'abang', 'teteh', 'sepupu', 'mbak', 'keponakan', 'ponakan', 'om', 'tante'],
    'SEDEKAH/ZAKAT': ['sedekah', 'zakat', 'infaq', 'masjid', 'donasi', 'berbagi', 'shodaqoh', 'wakaf', 'kurban', 'fidyah', 'waqaf', 'beramal'],
    'HIBURAN': ['nonton', 'bioskop', 'netflix', 'spotify', 'game', 'topup', 'steam', 'healing', 'liburan', 'tiket', 'cinema', 'xxi', 'cgv', 'wisata', 'staycation', 'hotel', 'villa'],
    'KESEHATAN': ['obat', 'apotek', 'dokter', 'rs', 'sakit', 'vitamin', 'klinik', 'gym', 'olahraga', 'sehat', 'puskesmas', 'periksa', 'lab', 'panadol', 'paracetamol'],
    'INTERNET': ['pulsa', 'kuota', 'wifi', 'indihome', 'biznet', 'xl', 'telkomsel', 'tri', 'indosat', 'langganan', 'servis hp', 'casing', 'charger', 'kabel data'],
    'TEMPAT TINGGAL': ['kost', 'kostan', 'apart', 'kontrakan', 'sewa', 'kosan', 'kontrak', 'cicilan rumah', 'maintenance'],
    'BELANJA': ['shopee', 'tokopedia', 'mall', 'baju', 'kaos', 'belanja', 'tiktok shop', 'lazada', 'sepatu', 'celana', 'jaket', 'hoodie', 'tas', 'dompet', 'aksesoris'],
    'PENDIDIKAN': ['ukt', 'semester', 'buku', 'fotocopy', 'print', 'seminar', 'skripsi', 'pendaftaran', 'kursus', 'pelatihan', 'jilid', 'atk', 'pena', 'pensil'],
    'TOOLS & TECH': ['domain', 'hosting', 'vercel', 'api', 'chatgpt', 'ai', 'subscription', 'gemini', 'google', 'bootcamp', 'coding', 'github'],
    'INVESTASI': ['bibit', 'reksadana', 'emas', 'saham', 'crypto', 'nabung', 'aset', 'properti'],
    'ROMANSA': ['pacar', 'doi', 'ayang', 'ngedate', 'kencan', 'dating', 'date', 'bucin', 'anniv', 'pacaran', 'hadiah doi', 'bunga'],
    'HEWAN': ['anabul', 'kucing', 'petshop', 'whiskas', 'pakan', 'pasir kucing', 'dokter hewan', 'grooming', 'anjing', 'wet food'],
    'LAINNYA': ['biaya', 'admin', 'pajak', 'denda', 'gadai', 'hutang', 'utang', 'pinjaman', 'bunga bank']
};

// =========================================================================
// 2. SISTEM KEAMANAN & REGISTRASI
// =========================================================================

function checkUserAccess(chatId) {
    if (String(chatId) === String(MY_ADMIN_ID)) return true;
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const uSheet = ss.getSheetByName(SHEET_USER);
        if (!uSheet) return false;
        const data = uSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]).trim() === String(chatId).trim() && String(data[i][2]).toUpperCase() === "ACTIVE") return true;
        }
    } catch (e) { console.error("Access Check Error: " + e.message); }
    return false;
}

function getSecretKey(chatId) {
    const cache = CacheService.getScriptCache();
    const cachedKey = cache.get(`sk_${chatId}`);
    if (cachedKey) return cachedKey;

    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const uSheet = ss.getSheetByName(SHEET_USER);
        const data = uSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            if (String(data[i][0]).trim() === String(chatId).trim()) {
                const key = data[i][3]; // Kolom D (indeks 3)
                if (key) {
                    cache.put(`sk_${chatId}`, String(key), 21600); // Cache 6 jam
                    return key;
                }
            }
        }
    } catch (e) { console.error("Get Secret Key Error: " + e.message); }
    return "UNKNOWN_KEY"; // Fallback aman
}

function handleRegistration(chatId, key, firstName) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const vSheet = ss.getSheetByName(SHEET_VOUCHER);
        const uSheet = ss.getSheetByName(SHEET_USER) || ss.insertSheet(SHEET_USER);
        if (uSheet.getLastRow() === 0) uSheet.appendRow(["ID_Telegram", "Nama", "Status"]);

        if (!vSheet) return "❌ Sistem Voucher belum siap di Spreadsheet.";

        const vData = vSheet.getDataRange().getValues();
        const inputKey = String(key).trim();

        for (let i = 1; i < vData.length; i++) {
            if (String(vData[i][0]).trim() === inputKey) {
                if (String(vData[i][1]).toUpperCase() === "USED") return "❌ ID Pesanan ini sudah pernah digunakan.";

                const secretKey = Utilities.getUuid(); // Mengunci privasi user baru

                vSheet.getRange(i + 1, 2).setValue("USED");
                vSheet.getRange(i + 1, 3).setValue(chatId);
                uSheet.appendRow([chatId, firstName || "Customer", "ACTIVE", secretKey]);

                // Daftarkan ke Supabase users_auth
                sendToSupabase("users_auth", {
                    secret_key: secretKey,
                    telegram_id: String(chatId),
                    name: firstName || "Customer"
                });

                return `✅ *AKTIVASI BERHASIL!*\n\nSelamat! BudgetIN Pro kamu sekarang sudah aktif selamanya. Silakan ketik \`/help\` untuk panduan.\n\n📊 *Dashboard Akses Pribadi:* [Buka Di Sini](${DASHBOARD_URL}/?key=${secretKey})`;
            }
        }
        return "❌ ID Pesanan tidak ditemukan. Pastikan kamu copy-paste TRX ID dengan benar.";
    } catch (e) { return "⚠️ Gagal akses database: " + e.message; }
}

function migrateOldUsers() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const uSheet = ss.getSheetByName(SHEET_USER);
        const data = uSheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            const chatId = String(data[i][0]).trim();
            const currentKey = data[i][3];
            const name = data[i][1];

            if (chatId && !currentKey) {
                const newKey = String(Utilities.getUuid());
                uSheet.getRange(i + 1, 4).setValue(newKey); // Tulis ke kolom D

                sendToSupabase("users_auth", {
                    secret_key: newKey,
                    telegram_id: chatId,
                    name: name
                });
            }
        }
    } catch (e) { console.error("Migration Error: " + e.message); }
}

// =========================================================================
// 3. API DASHBOARD & CORE LOGIC
// =========================================================================

function doGet(e) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAME);
        const userId = e.parameter.userid;
        if (!userId) return returnJson({ status: "error", message: "Akses Ditolak." });

        if (e.parameter.action === "delete") {
            const rowToDelete = parseInt(e.parameter.row);
            const checkId = sheet.getRange(rowToDelete, 3).getValue();
            if (String(checkId) === String(userId)) {
                sheet.deleteRow(rowToDelete);
                return returnJson({ status: "success" });
            }
        }

        const data = sheet.getDataRange().getValues();
        const transactions = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[0] !== "" && String(row[2]) === String(userId)) {
                transactions.push({
                    id: i + 1, date: row[0], desc: row[1], category: row[3], type: row[4], amount: parseFloat(row[5]), status: row[6]
                });
            }
        }
        return returnJson({ status: "success", data: transactions });
    } catch (error) { return returnJson({ status: "error" }); }
}

function doPost(e) {
    if (!e || !e.postData) return;
    try {
        const contents = JSON.parse(e.postData.contents);
        if (contents.callback_query) { handleCallback(contents.callback_query); return; }

        const message = contents.message;
        if (!message || !message.text) return;

        const chatId = message.chat.id;
        let text = message.text.trim();
        const firstName = message.from ? message.from.first_name : "User";

        if (text === "/id") {
            sendTelegramMessage(chatId, `🆔 *ID Telegram Kamu:* \`${chatId}\``);
            return;
        }

        if (text.startsWith("/register")) {
            const key = text.split(" ")[1];
            if (!key) {
                sendTelegramMessage(chatId, "⚠️ Gunakan format: `/register [REF_ID]`");
                return;
            }
            sendTelegramMessage(chatId, handleRegistration(chatId, key, firstName));
            return;
        }

        if (!checkUserAccess(chatId)) {
            sendHelpMessage(chatId);
            return;
        }

        if (text.toLowerCase() === "/stats") {
            sendTelegramMessage(chatId, getWeeklyStats(chatId));
            return;
        }

        if (text.toLowerCase() === "/dashboard") {
            const dashboardLink = `${DASHBOARD_URL}/?key=${getSecretKey(chatId)}`;
            sendTelegramMessage(chatId, `📊 *Link Dashboard Pribadi Kamu:*\n[Buka Dashboard Di Sini](${dashboardLink})\n\n_Note: Link ini bersifat rahasia, jangan dibagikan ke orang lain._`);
            return;
        }

        if (text.toLowerCase() === "/kodeakses") {
            const secretKey = getSecretKey(chatId);
            sendTelegramMessage(chatId,
                `🔑 *Kode Akses Dashboard BudgetIN Kamu:*\n\n` +
                `\`${secretKey}\`\n\n` +
                `Langkah login:\n` +
                `1️⃣ Copy kode di atas\n` +
                `2️⃣ Buka: ${DASHBOARD_URL}\n` +
                `3️⃣ Tempel di kolom *"Masukkan Kode Akses"* → tekan Masuk\n\n` +
                `⚠️ _Jaga kerahasiaan kode ini, jangan bagikan ke siapapun._`
            );
            return;
        }

        if (text.startsWith("/help") || text.startsWith("/start")) {
            sendHelpMessage(chatId);
            return;
        }

        // --- 🤖 FITUR GOALS: WIZARD SETGOAL ---
        const stateCachePath = `state_${chatId}`;
        const userState = CacheService.getScriptCache().get(stateCachePath);
        
        if (userState === "SETGOAL_NAME" && !text.startsWith("/")) {
            CacheService.getScriptCache().put(stateCachePath, 'SETGOAL_AMT|' + text, 600);
            sendTelegramMessage(chatId, `Sip! Target tabunganmu: *${text}*\n\nBerapa target nominal untuk dicapai?\n_Ketik angkanya saja, contoh: 15.000.000 atau 15jt_`);
            return;
        }
        else if (userState && userState.startsWith("SETGOAL_AMT|") && !text.startsWith("/")) {
            const targetAmount = parseAmount(text);
            if (!targetAmount) {
                sendTelegramMessage(chatId, "❌ Nominal tidak valid, coba ketik ulang angkanya (contoh: 15jt):");
                return;
            }
            const goalName = userState.split('|')[1];
            CacheService.getScriptCache().remove(stateCachePath);
            text = `/setgoal ${goalName} ${targetAmount}`; // Lempar ke parser utama di bawah
        }

        if (text.trim() === "/setgoal") {
            CacheService.getScriptCache().put(stateCachePath, "SETGOAL_NAME", 600);
            sendTelegramMessage(chatId, `🎯 *Mau bikin target tabungan untuk apa?*\n\nBalas pesan ini dengan nama targetmu.\n_(Contoh: HP Baru, Bayar UKT, Liburan ke Bali)_`);
            return;
        }

        // --- 🔥 FITUR GOALS: /setgoal [nama] [nominal] ---
        if (text.startsWith("/setgoal ")) {
            const targetAmount = parseAmount(text);
            const goalName = text.replace('/setgoal', '').replace(/[\d\.,]+/g, '').replace(/\b(miliar|m|juta|jt|ribu|rb|k|ratus|perak)\b/gi, '').trim() || "Target Baru";
            
            if (!targetAmount) {
                sendTelegramMessage(chatId, "❌ Nominal tidak valid.\nGunakan: `/setgoal [nama_target] [nominal]` atau ketik `/setgoal` saja.");
                return;
            }

            const supaResponse = sendToSupabase("goals", {
                user_id: String(chatId),
                goal_name: goalName,
                target_amount: targetAmount,
                current_amount: 0,
                is_active: true
            });

            if (supaResponse && supaResponse.isError) {
                sendTelegramMessage(chatId, `❌ *GAGAL MENYIMPAN KE SUPABASE*\n\nPenyebab:\n\`${supaResponse.detail}\``);
                return;
            }

            const goalId = supaResponse?.id || "0";
            const dashboardLink = `${DASHBOARD_URL}/?key=${getSecretKey(chatId)}`;
            const replyMarkup = { inline_keyboard: [[{ text: "🗑️ BATALKAN", callback_data: `delgoal_${goalId}` }]] };

            sendTelegramMessage(chatId, `🎯 *GOAL BARU TERCATAT!*\n\nTarget: *${goalName}*\nNominal: *Rp ${targetAmount.toLocaleString('id-ID')}*\n\n💡 *CARA MENGISI CELENGAN INI:*\nKapan pun kamu punya uang lebih, cukup kirim chat ke bot dengan format:\n👉 \`nabung 50k\`\n👉 \`nabung 150000\`\n\nNanti bot akan otomatis memunculkan tombol pilihan celenganmu!\n\n📊 *Pantau Progress di Dashboard:* [Klik Di Sini](${dashboardLink})`, replyMarkup);
            return;
        }

        // --- 🔥 FITUR GOALS: nabung [nominal] & goals [nama] [nominal] ---
        if (text.toLowerCase().startsWith("goals ") || text.toLowerCase().startsWith("nabung ")) {
            const amt = parseAmount(text);
            if (!amt) {
                sendTelegramMessage(chatId, "❌ Nominal tidak valid.\nContoh: `goals 100k` atau `nabung 50rb`");
                return;
            }

            const possibleName = text.replace(/^(goals|nabung)\s+/i, '').replace(/[\d\.,]+/g, '').replace(/\b(miliar|m|juta|jt|ribu|rb|k|ratus|perak)\b/gi, '').trim();

            if (possibleName) {
                // FALLBACK LAMA: goals hp 100k
                const goal = getGoalData(chatId, possibleName);
                if (!goal) {
                    sendTelegramMessage(chatId, `❌ Target *"${possibleName}"* tidak ditemukan di sistem.`);
                    return;
                }
                showGoalSourceSelection(chatId, goal, amt);
                return;
            } else {
                // FLOW BARU: goals 100k
                const activeGoals = getAllActiveGoals(chatId);
                if (!activeGoals || activeGoals.length === 0) {
                    sendTelegramMessage(chatId, "Kamu belum punya Target Goals aktif. Buat dulu yuk ketik `/setgoal`");
                    return;
                }

                if (activeGoals.length === 1) {
                    showGoalSourceSelection(chatId, activeGoals[0], amt);
                    return;
                }

                const cacheKey = "g" + new Date().getTime().toString(36);
                CacheService.getScriptCache().put(cacheKey, JSON.stringify({ amt: amt }), 600);
                
                let keyboard = [];
                activeGoals.forEach(g => {
                    keyboard.push([{ text: `🎯 ${g.goal_name}`, callback_data: `selGoal_${cacheKey}_${g.id}` }]);
                });
                keyboard.push([{ text: "💼 Tabungan Biasa / Lainnya", callback_data: `selGoal_${cacheKey}_invest` }]);
                keyboard.push([{ text: "❌ Batalkan", callback_data: `selGoal_${cacheKey}_cancel` }]);

                sendTelegramMessage(chatId, `💰 *Uang Rp ${amt.toLocaleString('id-ID')} ini mau ditabung ke mana?*`, { inline_keyboard: keyboard });
                return;
            }
        }

        const lines = text.split('\n');
        lines.forEach(line => { if (line.trim() !== "") processTransaction(chatId, line.trim()); });
    } catch (err) { console.error("Fatal Error: " + err.message); }
}

// =========================================================================
// 4. ENGINE KONTEKSTUAL (SMART RESPONSE)
// =========================================================================

function getContextualNote(category) {
    const notes = {
        'KONSUMSI': [
            "Nyam! Makanan enak itu energi, tapi jangan lupa berhenti sebelum kenyang ya. 🍲",
            "Sip, tercatat! Inget ya, minuman enak itu investasi mood, asal dompet nggak bad mood. ☕",
            "Data masuk. Makan dan minum yang bergizi ya best, biar aktivitas makin gacor! 🍎"
        ],
        'TRANSPORTASI': [
            "Hati-hati di jalan! Semoga perjalanannya lancar dan selamat sampai tujuan. 🚗",
            "Satu perjalanan, satu cerita. Data ongkos/bensin sudah diamankan!"
        ],
        'SEDEKAH/ZAKAT': [
            "Alhamdulillah! Semoga berkah dan menjadi pembuka pintu rezeki yang lebih luas. ✨",
            "Harta tidak akan berkurang karena sedekah. Terima kasih sudah berbagi hari ini! 🕌"
        ],
        'ROMANSA': [
            "Ciee, biaya 'bucin' ya? Gapapa, asal tetap terkontrol biar masa depan bareng doi aman! 😜",
            "Data ngedate tersimpan. Semoga makin harmonis ya! Jangan lupa nabung buat masa depan. 💍"
        ],
        'TOOLS & TECH': [
            "Investasi masa depan AI Enthusiast nih. Semoga tools ini bikin produktivitasmu makin gacor! 🤖",
            "Siap, biaya R&D & Tech sudah masuk database. Lanjutkan inovasinya!"
        ],
        'PENDAPATAN': [
            "Alhamdulillah, dana segar! Jangan lupa diparkir ke tabungan dulu sebelum diterbangkan buat jajan. 🚀",
            "Rezeki hari ini tercatat. Mau dialokasikan ke mana nih? 📈"
        ],
        'INVESTASI': [
            "Pilihan cerdas! Biarkan uangmu bekerja keras sementara kamu fokus berkarya. 💰",
            "Satu langkah lebih dekat menuju kebebasan finansial. Mantap!"
        ],
        'HIBURAN': [
            "Enjoy your time! Sesekali 'healing' itu perlu biar pikiran nggak burnout. 🍿",
            "Data hiburan masuk. Selamat bersenang-senang dan refresh pikiran!"
        ],
        'PENDIDIKAN': [
            "Investasi leher ke atas nggak pernah rugi. Semangat terus belajarnya! 📚",
            "Pendidikan adalah kunci. Data biaya belajar sudah tersimpan."
        ],
        'BELANJA': [
            "Belanja boleh, israf jangan ya. Pastikan barangnya bermanfaat! 🛍️",
            "Oke, pengeluaran masuk. Ingat: Keinginan tak terbatas, saldo terbatas."
        ],
        'PERSONAL CARE': [
            "Self-care itu penting! Rawat diri tapi tetap bijak ya. ✨",
            "Investasi penampilan tercatat. Selalu tampil percaya diri! 💆"
        ],
        'KEBUTUHAN RUMAH': [
            "Kebutuhan pokok rumah tercatat. Rumah nyaman = hati tenang! 🏠",
            "Stok rumah aman. Hidup teratur dimulai dari dapur yang rapi! 🧹"
        ],
        'SOSIAL': [
            "Menjaga silaturahmi itu investasi sosial terbaik. Tercatat! 🤝",
            "Berbagi kebahagiaan dengan orang sekitar. Semoga berkah selalu! 🎁"
        ],
        'KELUARGA': [
            "Untuk keluarga, tidak pernah rugi. Semoga selalu harmonis! 👨‍👩‍👧‍👦",
            "Keluarga adalah segalanya. Pengeluaran ini pasti bernilai! ❤️"
        ],
        'KESEHATAN': [
            "Sehat itu mahal, tapi sakit lebih mahal. Jaga kesehatan selalu! 💪",
            "Investasi kesehatan tercatat. Badan sehat, rezeki lancar! 🏥"
        ],
        'INTERNET': [
            "Koneksi lancar, produktivitas melesat! Data tercatat. 📶",
            "Kebutuhan digital di era modern. Semoga dipakai untuk hal positif! 📱"
        ],
        'TEMPAT TINGGAL': [
            "Tempat tinggal nyaman = pikiran tenang untuk berkarya. 🏡",
            "Biaya hunian tercatat. Semoga selalu betah dan produktif!"
        ],
        'HEWAN': [
            "Sayang anabul! Merawat hewan itu ibadah juga lho. 🐱",
            "Si bulu tercinta pasti senang! Pengeluaran kasih sayang tercatat. 🐾"
        ],
        'LAINNYA': [
            "Data tersimpan. Yuk, catat terus biar keuangan makin sehat dan transparan!",
            "Tercatat! Kamu keren hari ini karena tetap disiplin mencatat pengeluaran."
        ]
    };

    let pool = notes[category] || notes['LAINNYA'];
    return pool[Math.floor(Math.random() * pool.length)];
}

function getGoalMotivationalNote() {
    const notes = [
        "Sedikit demi sedikit, lama-lama jadi bukit! Semangat! 🔥",
        "Satu langkah lebih dekat ke target impianmu. Lanjutkan! 🚀",
        "Disiplin adalah kunci. Kamu pasti bisa capai ini! 💪",
        "Wah, makin dekat nih sama targetnya. Jangan kendor! 🎯",
        "Menahan keinginan jajan demi kebahagiaan masa depan. Mantap! ✨",
        "Setiap rupiah yang disisihkan mendekatkanmu pada tujuan. Keren! 🌟",
        "Konsistensi adalah jalan menuju keberhasilan. Yuk gas terus! 🏃‍♂️"
    ];
    return notes[Math.floor(Math.random() * notes.length)];
}

// =========================================================================
// 5. ENGINE TRANSAKSI & HELPERS
// =========================================================================

function parseAmount(text) {
    if (!text || typeof text !== 'string') return null;
    let t = text.toLowerCase().replace(/rp/g, '').trim();
    const unitsBesar = { 'miliar': 1e9, 'm': 1e9, 'juta': 1e6, 'jt': 1e6 };
    for (let unit in unitsBesar) {
        if (t.includes(unit)) {
            let parts = t.split(unit);
            let valStr = parts[0].replace(/,/g, '.').replace(/[^\d.]/g, '');
            if (valStr.split('.').length > 2) valStr = valStr.replace(/\./g, '');
            if (valStr) return parseFloat(valStr) * unitsBesar[unit];
        }
    }
    let shortUnitMatch = t.match(/(\d+[.,]?\d*)\s*(ribu|rb|k|ratus|perak)(?![a-z])/i);
    if (shortUnitMatch) {
        let valStr = shortUnitMatch[1];
        let unit = shortUnitMatch[2].toLowerCase();
        if ((valStr.match(/[.,]/g) || []).length > 1) valStr = valStr.replace(/[.,]/g, '');
        else valStr = valStr.replace(/,/g, '.');
        let val = parseFloat(valStr);
        if (unit === 'k' || unit === 'ribu' || unit === 'rb') return val * 1000;
        if (unit === 'ratus') return val * 100;
        if (unit === 'perak') return val * 1;
    }
    let cleanNumberMatch = t.replace(/[\.,]/g, '').match(/\d+/g);
    if (cleanNumberMatch) return parseInt(cleanNumberMatch[cleanNumberMatch.length - 1], 10);
    return null;
}

function detectCategories(text) {
    if (!text || typeof text !== 'string') return ["LAINNYA"];
    let detected = [];
    for (let category in CATEGORY_MAP) {
        let keywords = CATEGORY_MAP[category];
        for (let i = 0; i < keywords.length; i++) {
            let regex = new RegExp('\\b' + keywords[i] + '\\b', 'i');
            if (regex.test(text)) {
                if (!detected.includes(category)) detected.push(category);
                break;
            }
        }
    }
    return detected.length > 0 ? detected : ["LAINNYA"];
}

function processTransaction(chatId, text) {
    if (!text) return;
    const amount = parseAmount(text);
    if (!amount) {
        sendTelegramMessage(chatId, "❌ *Nominal Tidak Ditemukan*\n\nBudgetIN butuh angka untuk mencatat.");
        return;
    }
    const categories = detectCategories(text);
    const description = text.replace(/[\d\.,]+/g, '').replace(/\b(miliar|m|juta|jt|ribu|rb|k|ratus|perak)\b/gi, '').replace(/\s+/g, ' ').trim() || "Transaksi Manual";

    if (categories.length > 1) {
        const cacheKey = "p" + new Date().getTime().toString(36);
        CacheService.getScriptCache().put(cacheKey, JSON.stringify({ description: description, amount: amount }), 600);
        let keyboard = [];
        categories.forEach(cat => { keyboard.push([{ text: `🏷️ ${cat}`, callback_data: `cat_${cacheKey}_${cat}` }]); });
        sendTelegramMessage(chatId, `🤔 *Ambiguitas Terdeteksi!* \n\nSilakan pilih kategori paling pas untuk: *"${description}"*`, { inline_keyboard: keyboard });
        return;
    }
    saveTransaction(chatId, description, amount, categories[0]);
}

function saveTransaction(chatId, description, amount, category, messageIdToEdit = null) {
    const type = (category === 'PENDAPATAN') ? 'MASUK' : 'KELUAR';
    try {
        const timestamp = new Date();
        // 1. Tembak ke Supabase duluan untuk mendapatkan ID Valid
        const supaResponse = sendToSupabase("transactions", {
            date: timestamp.toISOString(), description: description, user_id: String(chatId), category: category, type: type, amount: amount, status: "Selesai"
        });

        let supaId = supaResponse && !supaResponse.isError ? (supaResponse.id || "0") : "0";

        // 2. Baru catat ke Spreadsheet (Sertakan SupaID di Kolom ke-8)
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
        const nextRow = sheet.getLastRow() + 1;
        sheet.getRange(nextRow, 1, 1, 8).setValues([[timestamp, description, chatId, category, type, amount, "Selesai", supaId]]);
        const response = `✅ *BudgetIN: TERCATAT!*\n\n💰 Rp ${amount.toLocaleString('id-ID')}\n🏷️ ${category}\n📝 ${description}\n\n💡 ${getContextualNote(category)}\n\n📊 [Buka Dashboard](${DASHBOARD_URL}/?key=${getSecretKey(chatId)})`;
        const replyMarkup = { inline_keyboard: [[{ text: "🗑️ HAPUS / BATALKAN", callback_data: `del_${nextRow}_${supaId}` }]] };

        if (messageIdToEdit) {
            UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                method: "post", contentType: "application/json",
                payload: JSON.stringify({ chat_id: chatId, message_id: messageIdToEdit, text: response, parse_mode: "Markdown", reply_markup: replyMarkup }),
                muteHttpExceptions: true
            });
        } else {
            sendTelegramMessage(chatId, response, replyMarkup);
        }
    } catch (err) { sendTelegramMessage(chatId, "⚠️ Gagal: " + err.message); }
}

function handleCallback(callback) {
    try {
        const data = callback.data;
        const chatId = callback.message.chat.id;
        const messageId = callback.message.message_id;

        // --- CALLBACK UNTUK AMBIGUITAS KATEGORI ---
        if (data.startsWith("cat_")) {
            const parts = data.split("_");
            const cached = CacheService.getScriptCache().get(parts[1]);
            if (!cached) return;
            saveTransaction(chatId, JSON.parse(cached).description, JSON.parse(cached).amount, parts[2], messageId);
            CacheService.getScriptCache().remove(parts[1]);
            return;
        }

        // --- CALLBACK UNTUK HAPUS TRANSAKSI (UPGRADE: AUTO REVERSE GOALS) ---
        if (data.startsWith("del_") || data.startsWith("delete_")) {
            const parts = data.split("_");
            const rowNum = parseInt(parts[1]);
            const supaId = parts[2];
            const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

            if (sheet) {
                try {
                    // Cari baris yang benar menggunakan ID Supabase dari Kolom ke-8 (Nihil risiko salah hapus)
                    let targetRow = -1;
                    if (supaId && supaId !== "0") {
                        const allData = sheet.getDataRange().getValues();
                        for (let i = 1; i < allData.length; i++) {
                            if (String(allData[i][7]) === String(supaId)) {
                                targetRow = i + 1;
                                break;
                            }
                        }
                    }

                    // Fallback (Penyelamat untuk transaksi transaksi lawas sebelum sistem ini ada)
                    if (targetRow === -1 && rowNum > 1) {
                        targetRow = rowNum;
                    }

                    if (targetRow > 1) {
                        const rowData = sheet.getRange(targetRow, 1, 1, 8).getValues()[0];
                        const desc = String(rowData[1] || "");
                        const amount = parseFloat(rowData[5]) || 0;

                        // Eksekusi Hapus dari Spreadsheet
                        sheet.deleteRow(targetRow);

                        // 3. REVISI: Jika ini transaksi nabung, tarik kembali saldo dari celengan Goals
                        if (desc.startsWith("Nabung Goals: ")) {
                            const goalName = desc.replace("Nabung Goals: ", "").trim();
                            const goal = getGoalData(chatId, goalName);
                            if (goal) {
                                // Pastikan saldo tidak jadi minus
                                const newTotal = Math.max(0, Number(goal.current_amount) - amount);
                                updateGoalAmount(goal.id, newTotal);
                            }
                        }
                    } // Penutup if (targetRow > 1)
                } catch (e) {
                    console.error("Gagal membatalkan saldo goal: " + e.message);
                }
            }

            // Hapus dari Supabase transactions
            if (supaId && supaId !== "0") {
                UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${supaId}`, { method: "delete", headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }, muteHttpExceptions: true });
            }

            UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                method: "post", contentType: "application/json",
                payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "🗑️ *TRANSAKSI BERHASIL DIBATALKAN*\n_(Saldo Goal otomatis ditarik kembali jika terkait)_", parse_mode: "Markdown" }),
                muteHttpExceptions: true
            });
            return;
        }

        // --- 🔥 CALLBACK UNTUK HAPUS GOAL (BATALKAN SET GOAL) ---
        if (data.startsWith("delgoal_")) {
            const goalId = data.split("_")[1];
            if (goalId && goalId !== "0") {
                UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/goals?id=eq.${goalId}`, { method: "delete", headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }, muteHttpExceptions: true });
            }
            UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                method: "post", contentType: "application/json",
                payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "🗑️ *TARGET BERHASIL DIBATALKAN*", parse_mode: "Markdown" }),
                muteHttpExceptions: true
            });
            return;
        }

        // --- 🔥 CALLBACK UNTUK PEMILIHAN GOAL (FLOW BARU) ---
        if (data.startsWith("selGoal_")) {
            const parts = data.split("_");
            const cacheKey = parts[1];
            const action = parts[2];

            if (action === "cancel") {
                UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                    method: "post", contentType: "application/json",
                    payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "❌ *Aksi menabung dibatalkan.*", parse_mode: "Markdown" }),
                    muteHttpExceptions: true
                });
                return;
            }

            const cached = CacheService.getScriptCache().get(cacheKey);
            if (!cached) {
                UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                    method: "post", contentType: "application/json",
                    payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "❌ Sesi kadaluarsa, silakan ulangi perintah `nabung`." }),
                    muteHttpExceptions: true
                });
                return;
            }

            const parsedCache = JSON.parse(cached);
            const amt = parsedCache.amt;

            // Delete the inline keyboard message beforehand to prevent stacking
            UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`, { 
                method: "post", contentType: "application/json", 
                payload: JSON.stringify({ chat_id: chatId, message_id: messageId }), 
                muteHttpExceptions: true 
            });

            if (action === "invest") {
                saveTransaction(chatId, "Tabungan / Investasi Tambahan", amt, "INVESTASI");
                return;
            }

            const goalId = action;
            const url = `${SUPABASE_URL}/rest/v1/goals?id=eq.${goalId}&select=*`;
            const res = UrlFetchApp.fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, muteHttpExceptions: true });
            const goalData = JSON.parse(res.getContentText())[0];

            if (goalData) {
                showGoalSourceSelection(chatId, goalData, amt);
            }
            return;
        }

        // --- 🔥 CALLBACK UNTUK PEMILIHAN SUMBER DANA GOALS ---
        if (data.startsWith("src_")) {
            const parts = data.split("_");
            const cached = CacheService.getScriptCache().get(parts[1]);
            if (!cached) {
                sendTelegramMessage(chatId, "❌ Sesi kadaluarsa, silakan ulangi perintah `goals`.");
                return;
            }

            const item = JSON.parse(cached);
            const source = parts[2]; // 'main', 'fresh', atau 'cancel'

            if (source === "cancel") {
                UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                    method: "post", contentType: "application/json",
                    payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "❌ *Aksi menabung dibatalkan.*", parse_mode: "Markdown" }),
                    muteHttpExceptions: true
                });
                CacheService.getScriptCache().remove(parts[1]);
                return;
            }

            const newTotal = Number(item.curr) + Number(item.amt);
            updateGoalAmount(item.gid, newTotal);

            const dashboardLink = `${DASHBOARD_URL}/?key=${getSecretKey(chatId)}`;
            const note = getGoalMotivationalNote();

            let msg = `✅ *BERHASIL NABUNG!*\n\nTarget: *${item.gname}*\nMasuk: *Rp ${item.amt.toLocaleString('id-ID')}*\nTotal Terkumpul: *Rp ${newTotal.toLocaleString('id-ID')}*\n\n💡 _"${note}"_\n\n📊 *Cek progress di Dashboard:* [Klik Di Sini](${dashboardLink})`;

            if (source === "main") {
                msg += "\n\n_(Menggunakan Saldo Utama. Laporan transaksi potong saldo akan dikirim otomatis...)_";
            } else {
                msg += "\n\n_(Menggunakan Uang Luar. Saldo Utama kamu tidak terpotong.)_";
            }

            UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
                method: "post", contentType: "application/json",
                payload: JSON.stringify({ chat_id: chatId, message_id: messageId, text: msg, parse_mode: "Markdown" }),
                muteHttpExceptions: true
            });

            CacheService.getScriptCache().remove(parts[1]);

            if (source === "main") {
                saveTransaction(chatId, `Nabung Goals: ${item.gname}`, item.amt, "INVESTASI");
            }
            return;
        }

    } catch (e) { console.error(e.message); }
}

// =========================================================================
// 6. 🔥 BANTUAN SUPABASE KHUSUS GOALS (UPDATED ERROR CATCHER)
// =========================================================================

function sendToSupabase(endpoint, data) {
    const options = {
        method: "post", contentType: "application/json",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Prefer": "return=representation" },
        payload: JSON.stringify(data), muteHttpExceptions: true
    };
    try {
        const res = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, options);
        const code = res.getResponseCode();
        const textRes = res.getContentText();

        // Jika Supabase sukses merespons dengan 200/201 (OK/Created)
        if (code === 200 || code === 201) {
            const json = JSON.parse(textRes);
            return json.length ? json[0] : json;
        } else {
            // Jika error (misal karena RLS atau nama tabel salah)
            console.error("Supabase Error: " + textRes);
            return { isError: true, detail: textRes };
        }
    } catch (e) {
        console.error(e.message);
        return { isError: true, detail: e.message };
    }
}

function getGoalData(chatId, goalName) {
    const url = `${SUPABASE_URL}/rest/v1/goals?user_id=eq.${chatId}&goal_name=ilike.${goalName}&select=*`;
    const options = {
        method: "get",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
        muteHttpExceptions: true
    };
    try {
        const res = UrlFetchApp.fetch(url, options);
        const data = JSON.parse(res.getContentText());
        return data.length > 0 ? data[0] : null;
    } catch (e) { return null; }
}

function getAllActiveGoals(chatId) {
    const url = `${SUPABASE_URL}/rest/v1/goals?user_id=eq.${chatId}&is_active=eq.true&select=id,goal_name,current_amount&order=created_at.desc`;
    const options = {
        method: "get",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
        muteHttpExceptions: true
    };
    try {
        const res = UrlFetchApp.fetch(url, options);
        const data = JSON.parse(res.getContentText());
        return Array.isArray(data) ? data : null;
    } catch (e) { return null; }
}

function showGoalSourceSelection(chatId, goal, amt) {
    const cacheKey = "g" + new Date().getTime().toString(36);
    CacheService.getScriptCache().put(cacheKey, JSON.stringify({ gid: goal.id, gname: goal.goal_name, amt: amt, curr: goal.current_amount }), 600);

    const keyboard = {
        inline_keyboard: [
            [{ text: "🏦 Saldo Utama", callback_data: `src_${cacheKey}_main` }],
            [{ text: "💵 Uang Luar (Fresh)", callback_data: `src_${cacheKey}_fresh` }],
            [{ text: "❌ Batalkan", callback_data: `src_${cacheKey}_cancel` }]
        ]
    };

    sendTelegramMessage(chatId, `💰 *Menabung untuk ${goal.goal_name}*\nNominal: *Rp ${amt.toLocaleString('id-ID')}*\n\nUangnya bersumber dari mana, Best?`, keyboard);
}

function updateGoalAmount(goalId, newAmount) {
    const url = `${SUPABASE_URL}/rest/v1/goals?id=eq.${goalId}`;
    const options = {
        method: "patch",
        contentType: "application/json",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
        payload: JSON.stringify({ current_amount: newAmount }),
        muteHttpExceptions: true
    };
    UrlFetchApp.fetch(url, options);
}

// =========================================================================
// 7. STATS & SUMMARY (Tetap Stabil)
// =========================================================================

function getWeeklyStats(chatId) {
    try {
        const data = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME).getDataRange().getValues();
        const sevenDaysAgo = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
        let tMasuk = 0, tKeluar = 0, cStats = {};
        let totalMasukAll = 0, totalKeluarAll = 0;

        for (let i = 1; i < data.length; i++) {
            if (String(data[i][2]) === String(chatId)) {
                const amount = parseFloat(data[i][5]) || 0;
                const isWithin7Days = new Date(data[i][0]) >= sevenDaysAgo;

                if (data[i][4] === 'MASUK') {
                    totalMasukAll += amount;
                    if (isWithin7Days) tMasuk += amount;
                }
                else if (data[i][4] === 'KELUAR') {
                    totalKeluarAll += amount;
                    if (isWithin7Days) {
                        tKeluar += amount;
                        cStats[data[i][3]] = (cStats[data[i][3]] || 0) + amount;
                    }
                }
            }
        }

        let msg = `📊 *7 HARI TERAKHIR*\n🟢 In: Rp ${tMasuk.toLocaleString('id-ID')}\n🔴 Out: Rp ${tKeluar.toLocaleString('id-ID')}\n\n*Rincian:*`;
        Object.keys(cStats).sort((a, b) => cStats[b] - cStats[a]).forEach(c => msg += `\n▫️ ${c}: Rp ${cStats[c].toLocaleString('id-ID')}`);

        // --- PREDIKSI AI ---
        const saldoAktif = totalMasukAll - totalKeluarAll;
        const rataHarian = tKeluar / 7;

        msg += `\n\n🤖 *PREDIKSI AI (BETA)*\n`;
        msg += `Saldo Aktif: *Rp ${saldoAktif.toLocaleString('id-ID')}*\n`;

        if (saldoAktif <= 0) {
            msg += `_Waduh, saldo sudah habis atau minus! Waktunya cari cuan tambahan. 💸_`;
        } else if (rataHarian > 0) {
            const sisaHari = Math.floor(saldoAktif / rataHarian);
            msg += `_Berdasarkan pola jajanmu 7 hari terakhir (Rp ${Math.round(rataHarian).toLocaleString('id-ID')}/hari), uangmu diprediksi habis dalam *${sisaHari} hari* lagi. `;

            if (sisaHari <= 7) {
                msg += `Yuk, mulai ngerem pengeluaran yang gak perlu! 🚨_`;
            } else if (sisaHari <= 14) {
                msg += `Hati-hati, tetap kontrol pengeluaranmu ya! ⚠️_`;
            } else {
                msg += `Aman terkendali, tapi tetap bijak ya! 🧘‍♂️_`;
            }
        } else {
            msg += `_Pengeluaranmu sangat hemat minggu ini. Pertahankan! 🌟_`;
        }

        return msg;
    } catch (e) { return "⚠️ Gagal memuat statistik."; }
}

function sendDailySummary() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const tz = ss.getSpreadsheetTimeZone(); // Gunakan zona waktu bawaan Spreadsheet (misal: Asia/Jakarta)
        const uSheet = ss.getSheetByName(SHEET_USER);
        const tSheet = ss.getSheetByName(SHEET_NAME);
        if (!uSheet || !tSheet) return;

        const usersData = uSheet.getDataRange().getValues();
        let targetUsers = [];

        // 1. Kumpulkan semua user yang statusnya ACTIVE
        for (let i = 1; i < usersData.length; i++) {
            if (String(usersData[i][2]).toUpperCase() === "ACTIVE") {
                targetUsers.push(String(usersData[i][0]).trim());
            }
        }

        // 2. Selalu pastikan ADMIN masuk list (Karena Admin pakai jalur bypass dan sering tidak kedaftar di Sheet Users)
        if (!targetUsers.includes(String(MY_ADMIN_ID))) {
            targetUsers.push(String(MY_ADMIN_ID));
        }

        const transactions = tSheet.getDataRange().getValues();
        const todayStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

        // 3. Loop ke setiap target target
        targetUsers.forEach(chatId => {
            let dailyTotal = 0;
            let count = 0;

            for (let j = 1; j < transactions.length; j++) {
                const row = transactions[j];
                const rowId = String(row[2]).trim();
                const type = row[4];

                // Konversi tanggal baris transaksi ke timezone yang sama persis dengan hari ini
                let rowDateStr = "";
                try {
                    if (row[0]) rowDateStr = Utilities.formatDate(new Date(row[0]), tz, "yyyy-MM-dd");
                } catch (e) { }

                if (rowId === chatId && rowDateStr === todayStr && type === 'KELUAR') {
                    dailyTotal += (parseFloat(row[5]) || 0);
                    count++;
                }
            }

            // 4. Kirim notifikasi HANYA jika hari itu ada pengeluaran (count > 0)
            if (count > 0) {
                let summaryMsg = `🌙 *DAILY RECAP: BUDGETIN*\n\nHari ini kamu mencatat *${count} transaksi* pengeluaran.\nTotal pengeluaran: *Rp ${dailyTotal.toLocaleString('id-ID')}*.\n\nIstirahat yang cukup ya, besok kita cari cuan lagi! 💪`;

                if (dailyTotal > 500000) {
                    summaryMsg = `⚠️ *CAUTION: BUDGETIN*\n\nHari ini pengeluaranmu cukup besar: *Rp ${dailyTotal.toLocaleString('id-ID')}*.\nAlgoritma saya mendeteksi dompet kamu sedang dalam zona kuning. Yuk, lebih bijak besok! 🧘‍♂️`;
                }
                sendTelegramMessage(chatId, summaryMsg);
            }
        });
    } catch (e) {
        console.error("Error in sendDailySummary: " + e.message);
    }
}

function sendHelpMessage(chatId) {
    const helpMsg = "Assalamualaikum! 👋\n*BudgetIN Pro* siap bantu catat keuangan kamu.\n\n" +
        "🚀 *CARA MULAI:*\n1️⃣ `/register [REF_ID]`\n2️⃣ *Langsung Catat:* `Nasi Padang 25rb` atau `Gaji 5jt`\n\n" +
        "🎯 *FITUR GOALS (Target Nabung):*\n• `/setgoal` — Buat target nabung baru.\n• `nabung 50k` — Ketik jumlah untuk isi celengan.\n\n" +
        "📊 *DAFTAR PERINTAH LAIN:*\n• `/dashboard` — Link web kamu.\n• `/stats` — Rangkuman 7 hari.\n• `/id` — Cek ID kamu.\n\n" +
        "💡 _Financial Freedom dimulai dari mencatat keuangan harian._";
    sendTelegramMessage(chatId, helpMsg);
}

function returnJson(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function sendTelegramMessage(chatId, text, replyMarkup = null) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    let payload = { chat_id: String(chatId), text: text, parse_mode: "Markdown" };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    try {
        let res = UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true });
        if (!JSON.parse(res.getContentText()).ok) {
            delete payload.parse_mode;
            UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true });
        }
    } catch (e) { }
}