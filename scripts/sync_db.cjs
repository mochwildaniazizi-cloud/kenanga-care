const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== VERIFIKASI & POPULASI 3 AKUN UTAMA DI DATABASE ===");

  // 1. Kader Umi
  const kader = await prisma.mother.upsert({
    where: { national_id: "KADER-DEFAULT" },
    update: {
      mother_name: "Kader Umi",
      phone_number: "0812-3456-7890",
      ui_status: "Kader Posyandu",
      risk_status: "Ketua Kader",
      password: "kader123"
    },
    create: {
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
  console.log("✅ Database record Kader:", kader.mother_name, "| ID:", kader.mother_id);

  // 2. Bidan Widya
  const nakes = await prisma.mother.upsert({
    where: { national_id: "NAKES-DEFAULT" },
    update: {
      mother_name: "Bidan Widya, A.Md.Keb",
      phone_number: "0813-9988-7766",
      ui_status: "Tenaga Kesehatan",
      risk_status: "Bidan Puskesmas",
      password: "nakes123"
    },
    create: {
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
  console.log("✅ Database record Nakes:", nakes.mother_name, "| ID:", nakes.mother_id);

  // 3. Ibu Ika
  const ibu = await prisma.mother.upsert({
    where: { national_id: "IBU-DEFAULT" },
    update: {
      mother_name: "Ibu Ika",
      phone_number: "081234567891",
      ui_status: "Ibu Balita",
      risk_status: "Normal",
      password: "ibu123"
    },
    create: {
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
  console.log("✅ Database record Ibu:", ibu.mother_name, "| ID:", ibu.mother_id);

  const totalMothers = await prisma.mother.count();
  console.log("\nTotal akun pengguna di database:", totalMothers);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
