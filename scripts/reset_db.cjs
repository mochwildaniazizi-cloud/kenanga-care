const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const AVATAR_FILE_PATH = "c:/Code/kenanga-care/custom_avatars.json";

async function main() {
  console.log("=== MEMULAI RESET SELURUH DATA SISTEM ===");

  // 1. Hapus data pada tabel pendukung/relasi
  console.log("1. Menghapus log pengukuran anak...");
  await prisma.childMeasurement.deleteMany({});

  console.log("2. Menghapus rekam medis ibu...");
  await prisma.maternalHealthRecord.deleteMany({});

  console.log("3. Menghapus log TTD ibu...");
  await prisma.ttdLog.deleteMany({});

  console.log("4. Menghapus log pemantauan mingguan ibu...");
  await prisma.weeklyMonitoring.deleteMany({});

  console.log("5. Menghapus log jadwal...");
  await prisma.scheduleLog.deleteMany({});

  console.log("6. Menghapus jadwal posyandu...");
  await prisma.schedule.deleteMany({});

  console.log("7. Menghapus seluruh data anak/balita...");
  await prisma.child.deleteMany({});

  console.log("8. Menghapus seluruh data ibu/pengguna lama...");
  await prisma.mother.deleteMany({});

  // 9. Reset file avatar kustom jika ada
  try {
    if (fs.existsSync(AVATAR_FILE_PATH)) {
      fs.writeFileSync(AVATAR_FILE_PATH, JSON.stringify({ mothers: {}, children: {} }, null, 2), "utf-8");
      console.log("9. Reset file custom_avatars.json berhasil.");
    }
  } catch (e) {
    console.warn("Gagal mereset custom_avatars.json:", e.message);
  }

  console.log("\n=== MEMBUAT 3 AKUN BARU BERSIH UNTUK PRESENTASI ===");

  // Akun 1: Kader Posyandu
  const kader = await prisma.mother.create({
    data: {
      national_id: "KADER-DEFAULT",
      mother_name: "Kader Umi",
      phone_number: "0812-3456-7890",
      ui_status: "Kader Posyandu",
      risk_status: "Ketua Kader",
      husband_name: "Kader Utama",
      password: "kader123",
      number_of_children: 0,
      address: "Posyandu Kenanga 1"
    }
  });
  console.log("✅ Akun 1 dibuat: Kader (Username: kader | Pass: kader123)");

  // Akun 2: Tenaga Kesehatan (Nakes / Bidan)
  const nakes = await prisma.mother.create({
    data: {
      national_id: "NAKES-DEFAULT",
      mother_name: "Bidan Widya, A.Md.Keb",
      phone_number: "0813-9988-7766",
      ui_status: "Tenaga Kesehatan",
      risk_status: "Bidan Puskesmas",
      husband_name: "Tenaga Kesehatan",
      password: "nakes123",
      number_of_children: 0,
      address: "Puskesmas Pembantu Kenanga"
    }
  });
  console.log("✅ Akun 2 dibuat: Nakes (Username: nakes / bidan | Pass: nakes123)");

  // Akun 3: Ibu Balita
  const ibu = await prisma.mother.create({
    data: {
      national_id: "IBU-DEFAULT",
      mother_name: "Ibu Ika",
      phone_number: "081234567891",
      ui_status: "Ibu Balita",
      risk_status: "Normal",
      husband_name: "Budi Santoso",
      password: "ibu123",
      number_of_children: 0,
      address: "Jl. Mawar No. 12, Kel. Kenanga"
    }
  });
  console.log("✅ Akun 3 dibuat: Ibu Balita (Username: ibu | Pass: ibu123)");

  console.log("\n=== RESET & PEMBUATAN AKUN BERHASIL LENGKAP ===");
}

main()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan saat reset database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
