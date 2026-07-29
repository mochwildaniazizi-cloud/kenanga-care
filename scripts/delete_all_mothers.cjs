const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== MEMULAI PENGHAPUSAN SELURUH DATA IBU DI DAFTAR IBU ===");

  // 1. Cari semua record Ibu (selain Kader Umi dan Bidan Widya)
  const mothers = await prisma.mother.findMany({
    where: {
      AND: [
        { OR: [ { ui_status: null }, { ui_status: { notIn: ["Kader Posyandu", "Tenaga Kesehatan", "Nakes", "Bidan"] } } ] },
        { NOT: { national_id: { startsWith: "KADER-" } } },
        { NOT: { national_id: { startsWith: "NAKES-" } } }
      ]
    },
    select: { mother_id: true, mother_name: true }
  });

  const idsToDelete = mothers.map(m => m.mother_id);
  console.log(`Ditemukan ${idsToDelete.length} data ibu untuk dihapus:`, mothers.map(m => m.mother_name));

  if (idsToDelete.length > 0) {
    // 2. Cari anak-anak dari ibu tersebut
    const children = await prisma.child.findMany({
      where: { mother_id: { in: idsToDelete } },
      select: { child_id: true }
    });
    const childIds = children.map(c => c.child_id);

    // 3. Hapus relasi anak & pengukuran
    if (childIds.length > 0) {
      await prisma.childMeasurement.deleteMany({
        where: { child_id: { in: childIds } }
      });
      await prisma.child.deleteMany({
        where: { child_id: { in: childIds } }
      });
    }

    // 4. Hapus rekam medis & log ibu
    await prisma.maternalHealthRecord.deleteMany({
      where: { mother_id: { in: idsToDelete } }
    });
    await prisma.ttdLog.deleteMany({
      where: { mother_id: { in: idsToDelete } }
    });
    await prisma.weeklyMonitoring.deleteMany({
      where: { mother_id: { in: idsToDelete } }
    });

    // 5. Hapus record mother
    const deleted = await prisma.mother.deleteMany({
      where: { mother_id: { in: idsToDelete } }
    });
    console.log(`✅ Berhasil menghapus ${deleted.count} data ibu dari Daftar Ibu.`);
  } else {
    console.log("ℹ️ Daftar Ibu sudah bersih (0 data).");
  }

  // 6. Pastikan 2 akun admin utama (Kader Umi & Bidan Widya) tetap aman di DB
  await prisma.mother.upsert({
    where: { national_id: "KADER-DEFAULT" },
    update: { mother_name: "Kader Umi" },
    create: {
      national_id: "KADER-DEFAULT",
      mother_name: "Kader Umi",
      phone_number: "0812-3456-7890",
      ui_status: "Kader Posyandu",
      risk_status: "Ketua Kader",
      husband_name: "Kader Utama",
      password: "kader123",
      number_of_children: 0
    }
  });

  await prisma.mother.upsert({
    where: { national_id: "NAKES-DEFAULT" },
    update: { mother_name: "Bidan Widya, A.Md.Keb" },
    create: {
      national_id: "NAKES-DEFAULT",
      mother_name: "Bidan Widya, A.Md.Keb",
      phone_number: "0813-9988-7766",
      ui_status: "Tenaga Kesehatan",
      risk_status: "Bidan Puskesmas",
      husband_name: "Tenaga Kesehatan",
      password: "nakes123",
      number_of_children: 0
    }
  });

  const remaining = await prisma.mother.findMany({
    select: { mother_id: true, national_id: true, mother_name: true, ui_status: true }
  });
  console.log("\nStatus Pengguna Tersisa di DB:", JSON.stringify(remaining, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
