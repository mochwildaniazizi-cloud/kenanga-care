const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== MENGHAPUS SEMUA DATA IBU, MEMPERTAHANKAN IBU IKA, KADER UMI, & BIDAN WIDYA ===");

  // 1. Ensure 3 main accounts exist
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

  const ibuIka = await prisma.mother.upsert({
    where: { national_id: "IBU-DEFAULT" },
    update: { mother_name: "Ibu Ika" },
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

  // 2. Cari semua id ibu selain 3 akun utama ini
  const mothersToDelete = await prisma.mother.findMany({
    where: {
      AND: [
        { NOT: { national_id: { in: ["KADER-DEFAULT", "NAKES-DEFAULT", "IBU-DEFAULT"] } } },
        { NOT: { mother_name: { in: ["Kader Umi", "Bidan Widya, A.Md.Keb", "Ibu Ika"] } } }
      ]
    },
    select: { mother_id: true, mother_name: true }
  });

  const deleteIds = mothersToDelete.map(m => m.mother_id);
  console.log(`Ditemukan ${deleteIds.length} data ibu selain Ibu Ika yang akan dihapus:`, mothersToDelete.map(m => m.mother_name));

  if (deleteIds.length > 0) {
    // Cari anak-anak dari ibu yang dihapus
    const childrenToDelete = await prisma.child.findMany({
      where: { mother_id: { in: deleteIds } },
      select: { child_id: true }
    });
    const childIds = childrenToDelete.map(c => c.child_id);

    // Menghapus data relasi anak & ibu yang dihapus
    if (childIds.length > 0) {
      await prisma.childMeasurement.deleteMany({
        where: { child_id: { in: childIds } }
      });
      await prisma.child.deleteMany({
        where: { child_id: { in: childIds } }
      });
    }

    await prisma.maternalHealthRecord.deleteMany({
      where: { mother_id: { in: deleteIds } }
    });

    await prisma.ttdLog.deleteMany({
      where: { mother_id: { in: deleteIds } }
    });

    await prisma.weeklyMonitoring.deleteMany({
      where: { mother_id: { in: deleteIds } }
    });

    const result = await prisma.mother.deleteMany({
      where: { mother_id: { in: deleteIds } }
    });

    console.log(`✅ Berhasil menghapus ${result.count} data ibu.`);
  } else {
    console.log("ℹ️ Tidak ada data ibu lain untuk dihapus.");
  }

  // 3. Tampilkan daftar ibu yang tersisa di database
  const remainingMothers = await prisma.mother.findMany({
    select: {
      mother_id: true,
      national_id: true,
      mother_name: true,
      ui_status: true,
      phone_number: true
    }
  });

  console.log("\n=== DAFTAR PENGGUNA TERSIAP DI DATABASE ===");
  console.log(JSON.stringify(remainingMothers, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
