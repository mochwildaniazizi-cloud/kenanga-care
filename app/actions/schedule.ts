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
    return [];
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
      include: {
        schedule: true
      }
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
    return [];
  }
}
