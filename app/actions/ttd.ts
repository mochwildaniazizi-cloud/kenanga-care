"use server";

import { prisma } from "@/lib/prisma";

export async function getTtdLogs(motherId: string, year: number, month: number) {
  try {
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const logs = await (prisma as any).ttdLog.findMany({
      where: {
        mother_id: motherId,
        intake_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        intake_date: "asc",
      },
    });

    const mapped = logs.map((l: any) => ({
      log_id: l.log_id,
      mother_id: l.mother_id,
      intake_date: l.intake_date.toISOString().split("T")[0],
      taken: l.taken,
      companion: l.companion || "",
      relationship: l.relationship || "",
    }));

    return { success: true, logs: mapped };
  } catch (error: any) {
    console.error("Failed to get TTD logs:", error);
    return { success: false, error: error.message, logs: [] };
  }
}

export async function upsertTtdLog(
  motherId: string,
  dateStr: string,
  taken: boolean,
  companion?: string,
  relationship?: string
) {
  try {
    const intakeDate = new Date(dateStr + "T00:00:00.000Z");

    const existing = await (prisma as any).ttdLog.findFirst({
      where: {
        mother_id: motherId,
        intake_date: intakeDate,
      },
    });

    if (existing) {
      const updated = await (prisma as any).ttdLog.update({
        where: {
          log_id: existing.log_id,
        },
        data: {
          taken,
          companion: companion || null,
          relationship: relationship || null,
        },
      });
      return { success: true, log: updated };
    } else {
      const created = await (prisma as any).ttdLog.create({
        data: {
          mother_id: motherId,
          intake_date: intakeDate,
          taken,
          companion: companion || null,
          relationship: relationship || null,
        },
      });
      return { success: true, log: created };
    }
  } catch (error: any) {
    console.error("Failed to upsert TTD log:", error);
    return { success: false, error: error.message };
  }
}

export async function syncOfflineTtdLogs(motherId: string, logs: any[]) {
  try {
    const results = [];
    for (const log of logs) {
      const res = await upsertTtdLog(
        motherId,
        log.intake_date,
        log.taken,
        log.companion,
        log.relationship
      );
      results.push(res);
    }
    return { success: true, results };
  } catch (error: any) {
    console.error("Failed to sync TTD logs:", error);
    return { success: false, error: error.message };
  }
}
