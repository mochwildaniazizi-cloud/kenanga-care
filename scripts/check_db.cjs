const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const motherCount = await prisma.mother.count();
  const childCount = await prisma.child.count();
  const scheduleCount = await prisma.schedule.count();
  const measurementCount = await prisma.childMeasurement.count();
  const maternalRecordCount = await prisma.maternalHealthRecord.count();
  const ttdCount = await prisma.ttdLog.count();
  const weeklyCount = await prisma.weeklyMonitoring.count();

  console.log("COUNTS:", JSON.stringify({
    motherCount,
    childCount,
    scheduleCount,
    measurementCount,
    maternalRecordCount,
    ttdCount,
    weeklyCount,
  }));

  const mothers = await prisma.mother.findMany({
    select: {
      mother_id: true,
      national_id: true,
      mother_name: true,
      phone_number: true,
      ui_status: true,
      risk_status: true,
    }
  });

  console.log("Mothers list:", JSON.stringify(mothers, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
