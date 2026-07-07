"use server";

import { prisma } from "@/lib/prisma";

export async function getWeeklyMonitorings(motherId: string) {
  try {
    const list = await (prisma as any).weeklyMonitoring.findMany({
      where: {
        mother_id: motherId,
      },
      orderBy: {
        week_number: "asc",
      },
    });
    return { success: true, list };
  } catch (error: any) {
    console.error("Failed to get weekly monitorings:", error);
    return { success: false, error: error.message, list: [] };
  }
}

export async function upsertWeeklyMonitoring(
  motherId: string,
  weekNumber: number,
  data: any
) {
  try {
    const existing = await (prisma as any).weeklyMonitoring.findFirst({
      where: {
        mother_id: motherId,
        week_number: weekNumber,
      },
    });

    if (existing) {
      const updated = await (prisma as any).weeklyMonitoring.update({
        where: {
          monitoring_id: existing.monitoring_id,
        },
        data: {
          check_pregnancy: data.check_pregnancy ?? false,
          check_class: data.check_class ?? false,
          fever: data.fever ?? false,
          headache: data.headache ?? false,
          insomnia: data.insomnia ?? false,
          cough: data.cough ?? false,
          fetal_movement: data.fetal_movement ?? false,
          stomach_pain: data.stomach_pain ?? false,
          fluid_discharge: data.fluid_discharge ?? false,
          urination_pain: data.urination_pain ?? false,
          diarrhea: data.diarrhea ?? false,
        },
      });
      return { success: true, record: updated };
    } else {
      const created = await (prisma as any).weeklyMonitoring.create({
        data: {
          mother_id: motherId,
          week_number: weekNumber,
          check_pregnancy: data.check_pregnancy ?? false,
          check_class: data.check_class ?? false,
          fever: data.fever ?? false,
          headache: data.headache ?? false,
          insomnia: data.insomnia ?? false,
          cough: data.cough ?? false,
          fetal_movement: data.fetal_movement ?? false,
          stomach_pain: data.stomach_pain ?? false,
          fluid_discharge: data.fluid_discharge ?? false,
          urination_pain: data.urination_pain ?? false,
          diarrhea: data.diarrhea ?? false,
        },
      });
      return { success: true, record: created };
    }
  } catch (error: any) {
    console.error("Failed to upsert weekly monitoring:", error);
    return { success: false, error: error.message };
  }
}
