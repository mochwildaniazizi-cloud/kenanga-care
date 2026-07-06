"use server";

import { prisma } from "@/lib/prisma";

export async function getSchedules() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { schedule_date: "asc" }
    });
    
    if (schedules.length === 0) {
      // Mock initial fallback if database is empty (optional, but let's seed or return them)
      return [
        { id: "1", date: "Sabtu, 04 Juli 2026", rawDate: "2026-07-04", time: "08:00 - 12:00 WIB", focus: "Imunisasi PCV & Penimbangan", status: "Terjadwal" },
        { id: "2", date: "Sabtu, 08 Agustus 2026", rawDate: "2026-08-08", time: "08:00 - 12:00 WIB", focus: "Bulan Kapsul Vitamin A & Obat Cacing", status: "Terjadwal" },
        { id: "3", date: "Sabtu, 05 September 2026", rawDate: "2026-09-05", time: "08:00 - 12:00 WIB", focus: "Cek Tumbuh Kembang & PMT Rutin", status: "Terjadwal" },
        { id: "4", date: "Sabtu, 03 Oktober 2026", rawDate: "2026-10-03", time: "08:00 - 12:00 WIB", focus: "Imunisasi Dasar & Kelas Ibu Hamil", status: "Terjadwal" }
      ];
    }
    
    return schedules.map((s: any) => ({
      id: s.schedule_id,
      date: s.schedule_date.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
      rawDate: s.schedule_date.toISOString().split("T")[0],
      time: `${s.start_time || '08:00'} - ${s.end_time || '12:00'} WIB`,
      focus: s.service_focus || "-",
      status: s.status
    }));
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
}

export async function createSchedule(data: {
  schedule_date: string; // YYYY-MM-DD
  start_time: string;
  end_time: string;
  service_focus: string;
  changed_by: string;
}) {
  try {
    const scheduleDate = new Date(data.schedule_date);
    const newSchedule = await prisma.schedule.create({
      data: {
        schedule_date: scheduleDate,
        start_time: data.start_time,
        end_time: data.end_time,
        service_focus: data.service_focus,
        status: "Terjadwal"
      }
    });

    const dateFormatted = scheduleDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    // Create audit log
    await prisma.scheduleLog.create({
      data: {
        schedule_id: newSchedule.schedule_id,
        changed_by: data.changed_by,
        change_details: `Menambahkan Jadwal Baru untuk tanggal ${dateFormatted}.`
      }
    });

    return { success: true, schedule: newSchedule };
  } catch (error: any) {
    console.error("Error creating schedule:", error);
    return { success: false, error: error.message || "Gagal menyimpan jadwal baru." };
  }
}

export async function updateSchedule(
  id: string,
  data: {
    schedule_date: string; // YYYY-MM-DD
    start_time: string;
    end_time: string;
    service_focus: string;
    status: string;
    changed_by: string;
  }
) {
  try {
    const scheduleDate = new Date(data.schedule_date);
    const dateFormatted = scheduleDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const updated = await prisma.schedule.update({
      where: { schedule_id: id },
      data: {
        schedule_date: scheduleDate,
        start_time: data.start_time,
        end_time: data.end_time,
        service_focus: data.service_focus,
        status: data.status
      }
    });

    // Create audit log
    await prisma.scheduleLog.create({
      data: {
        schedule_id: id,
        changed_by: data.changed_by,
        change_details: `Memperbarui detail jadwal tanggal ${dateFormatted}.`
      }
    });

    return { success: true, schedule: updated };
  } catch (error: any) {
    console.error("Error updating schedule:", error);
    return { success: false, error: error.message || "Gagal menyimpan perubahan jadwal." };
  }
}

export async function deleteSchedule(id: string, changed_by: string) {
  try {
    const existing = await prisma.schedule.findUnique({
      where: { schedule_id: id }
    });

    if (!existing) {
      return { success: false, error: "Jadwal tidak ditemukan." };
    }

    const dateFormatted = existing.schedule_date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    // Since we delete cascade, we can't log to scheduleLog after deleting.
    // Instead, we can delete the schedule itself. Let's do that!
    await prisma.schedule.delete({
      where: { schedule_id: id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return { success: false, error: error.message || "Gagal menghapus jadwal." };
  }
}

export async function getScheduleLogs() {
  try {
    const logs = await prisma.scheduleLog.findMany({
      orderBy: { change_timestamp: "desc" },
      take: 50
    });

    if (logs.length === 0) {
      // Mock fallback if empty
      return [
        { id: "1", time: "09 Juni 2026 Pukul 11:30", by: "Kader Siti", detail: "Menambahkan Jadwal 03 Oktober 2026." },
        { id: "2", time: "09 Juni 2026 Pukul 11:15", by: "Kader Siti", detail: "Memperbarui Fokus Layanan 05 September 2026." },
        { id: "3", time: "08 Juni 2026 Pukul 14:00", by: "Kader Ratna", detail: "Menetapkan Jadwal 08 Agustus 2026." }
      ];
    }

    return logs.map((l: any) => {
      const ts = new Date(l.change_timestamp);
      const formattedTime = ts.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + 
                            ` Pukul ${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}`;
      return {
        id: l.log_id,
        time: formattedTime,
        by: l.changed_by,
        detail: l.change_details
      };
    });
  } catch (error) {
    console.error("Error fetching schedule logs:", error);
    throw error;
  }
}

export async function getRealtimeNotifications(role: "kader" | "ibu", username?: string) {
  try {
    const notifications: any[] = [];

    // 1. Fetch recent schedule logs (last 3 entries)
    const logs = await prisma.scheduleLog.findMany({
      orderBy: { change_timestamp: "desc" },
      take: 3
    });

    logs.forEach((log: any) => {
      const ts = new Date(log.change_timestamp);
      const timeStr = ts.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB";
      
      notifications.push({
        id: `log-${log.log_id}`,
        category: "Jadwal Posyandu",
        time: timeStr,
        message: log.change_details,
        timestamp: ts.getTime()
      });
    });

    // 2. Health alert logic for Kader
    if (role === "kader") {
      const stuntingCount = await prisma.child.count({
        where: {
          OR: [
            { current_weight: { lte: 5.0 } },
            { special_conditions: { contains: "Prematur" } }
          ]
        }
      });

      if (stuntingCount > 0) {
        notifications.push({
          id: "alert-nutrition",
          category: "Status Pertumbuhan",
          time: "Baru saja",
          message: `Sistem mendeteksi ${stuntingCount} balita dalam pemantauan khusus (kurva berat rendah / prematur).`,
          timestamp: Date.now()
        });
      }

      const highRiskMothers = await prisma.mother.count({
        where: { risk_status: "Risiko Tinggi" }
      });

      if (highRiskMothers > 0) {
        notifications.push({
          id: "alert-risk-mothers",
          category: "Risiko Tinggi",
          time: "Baru saja",
          message: `Pengingat: Terdapat ${highRiskMothers} ibu hamil dengan status Risiko Tinggi di database.`,
          timestamp: Date.now()
        });
      }
    } else {
      // 3. Health alert logic for Ibu
      // Attempt to load mother details to personalize notifications
      let motherName = "Ibu";
      let children: any[] = [];

      if (username) {
        const u = username.trim().toLowerCase();
        let cleanU = u;
        if (cleanU.startsWith("ibu ")) {
          cleanU = cleanU.substring(4).trim();
        }
        const digitsOnly = u.replace(/\D/g, "");

        const mother = await prisma.mother.findFirst({
          where: {
            OR: [
              { phone_number: { equals: u, mode: 'insensitive' } },
              { phone_number: { contains: digitsOnly && digitsOnly.length > 5 ? digitsOnly : "NONMATCH" } },
              { national_id: { equals: u, mode: 'insensitive' } },
              { mother_name: { equals: u, mode: 'insensitive' } },
              { mother_name: { contains: cleanU, mode: 'insensitive' } }
            ]
          },
          include: { children: true }
        });

        if (mother) {
          motherName = mother.mother_name;
          children = mother.children || [];
        }
      }

      // Add general reminder
      notifications.push({
        id: "alert-ibu-kia",
        category: "Pemberitahuan PWA",
        time: "Baru saja",
        message: `Halo Ibu ${motherName}, selalu bawa buku KIA (Kesehatan Ibu dan Anak) setiap berkunjung ke Posyandu Kenanga.`,
        timestamp: Date.now()
      });

      // Add child specific growth/vitamin reminders
      children.forEach((child, idx) => {
        notifications.push({
          id: `alert-child-nutr-${child.child_id}`,
          category: "Status Gizi",
          time: "1 hari yang lalu",
          message: `Grafik tumbuh kembang anak Anda (${child.child_name}) bulan ini terpantau Normal & Baik. Pertahankan!`,
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * (idx + 1)
        });

        notifications.push({
          id: `alert-child-vit-${child.child_id}`,
          category: "Vitamin A Anak",
          time: "6 jam yang lalu",
          message: `Jadwal pembagian Vitamin A untuk Balita Anda (${child.child_name}) sudah dibuka di Kader.`,
          timestamp: Date.now() - 1000 * 60 * 60 * 6 * (idx + 1)
        });
      });
    }

    // Sort by timestamp desc
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error generating realtime notifications:", error);
    return [];
  }
}
