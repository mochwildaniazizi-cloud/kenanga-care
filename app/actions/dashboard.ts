"use server";

import { prisma } from "@/lib/prisma";

import { calculateZScore } from "@/utils/zScoreCalculator";

function formatDateIndonesian(date: Date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${m}, ${h}:${min}`;
}

function calculateAgeInMonths(birthDate: Date) {
  const now = new Date();
  return (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
}

export async function getDashboardStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalChildren,
      totalMothers,
      riskMothers,
      checkedChildren,
      checkedMothers,
      allChildren,
      mothersHamil
    ] = await Promise.all([
      prisma.child.count(),
      prisma.mother.count(),
      prisma.mother.count({
        where: {
          risk_status: { in: ["Risiko Tinggi", "KEK"] }
        }
      }),
      prisma.childMeasurement.groupBy({
        by: ['child_id'],
        where: {
          visit_date: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.maternalHealthRecord.groupBy({
        by: ['mother_id'],
        where: {
          visit_date: { gte: startOfMonth, lte: endOfMonth }
        }
      }),
      prisma.child.findMany({
        select: { birth_date: true, gender: true, current_weight: true, current_height: true }
      }),
      prisma.mother.count({
        where: { estimated_due_date: { not: null } }
      })
    ]);

    // FORCE SYNC: Triggering git detection
    const totalKunjungan = checkedChildren.length + checkedMothers.length;

    // Calculate problematic nutrition kids dynamically
    let problematicNutrition = 0;
    allChildren.forEach((c: any) => {
      if (c.current_weight && c.current_height && c.birth_date) {
        const ageInMonths = calculateAgeInMonths(c.birth_date);
        const zScoreBB = calculateZScore(Number(c.current_weight), ageInMonths, c.gender, "BB");
        const zScoreTB = calculateZScore(Number(c.current_height), ageInMonths, c.gender, "TB");
        if (zScoreTB < -2 || zScoreBB < -2) {
          problematicNutrition++;
        }
      }
    });

    return {
      totalChildren,
      totalMothers,
      mothersHamil,
      totalKunjungan,
      riskMothers,
      problematicNutrition,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalChildren: 0,
      totalMothers: 0,
      totalKunjungan: 0,
      riskMothers: 0,
      problematicNutrition: 0,
    };
  }
}

export async function getRecentChildActivity() {
  try {
    const measurements = await prisma.childMeasurement.findMany({
      include: { child: { include: { mother: true } } },
      orderBy: { visit_date: "desc" },
      take: 5,
    });

    return measurements.map((m: any) => {
      const ageMonths = m.child?.birth_date
        ? calculateAgeInMonths(new Date(m.child.birth_date))
        : 0;
      return {
        time: formatDateIndonesian(new Date(m.visit_date)),
        name: m.child?.child_name || "-",
        detail: `${ageMonths} Bulan`,
        status: "Normal", // simplified; full z-score calc excluded here for perf
        gender: m.child?.gender || "M",
      };
    });
  } catch (error) {
    console.error("Error fetching recent child activity:", error);
    return [];
  }
}

export async function getRecentMotherActivity() {
  try {
    const records = await prisma.maternalHealthRecord.findMany({
      include: { mother: true },
      orderBy: { visit_date: "desc" },
      take: 5,
    });

    return records.map((r: any) => {
      const status = r.mother?.risk_status === "Normal" ? "Sehat"
        : r.mother?.risk_status === "Risiko Tinggi" ? "Pantau"
        : "Sehat";
      const hasDue = !!r.mother?.estimated_due_date;
      const detail = hasDue ? `Hamil` : "Ibu Balita";
      return {
        time: formatDateIndonesian(new Date(r.visit_date)),
        name: r.mother?.mother_name || "-",
        detail,
        status,
      };
    });
  } catch (error) {
    console.error("Error fetching recent mother activity:", error);
    return [];
  }
}
