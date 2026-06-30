"use server";

import { prisma } from "@/lib/prisma";

export async function getSchedules() {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { schedule_date: "asc" }
    });
    
    if (schedules.length === 0) {
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

export async function getScheduleLogs() {
  return [
    { id: "1", time: "09 Juni 2026 Pukul 11:30", by: "Kader Siti", detail: "Menambahkan Jadwal 03 Oktober 2026." },
    { id: "2", time: "09 Juni 2026 Pukul 11:15", by: "Kader Siti", detail: "Memperbarui Fokus Layanan 05 September 2026." },
    { id: "3", time: "08 Juni 2026 Pukul 14:00", by: "Kader Ratna", detail: "Menetapkan Jadwal 08 Agustus 2026." },
    { id: "4", time: "08 Juni 2026 Pukul 09:45", by: "Kader Siti", detail: "Memperbarui Fokus Layanan 04 Juli 2026." },
    { id: "5", time: "07 Juni 2026 Pukul 16:20", by: "Kader Ratna", detail: "Menghapus Jadwal 01 Juni 2026." },
    { id: "6", time: "07 Juni 2026 Pukul 10:10", by: "Kader Siti", detail: "Menambahkan Jadwal 05 September 2026." },
    { id: "7", time: "06 Juni 2026 Pukul 15:30", by: "Kader Ratna", detail: "Memperbarui Fokus Layanan 08 Agustus 2026." },
    { id: "8", time: "06 Juni 2026 Pukul 09:15", by: "Kader Siti", detail: "Menetapkan Jadwal 04 Juli 2026." },
    { id: "9", time: "05 Juni 2026 Pukul 14:45", by: "Kader Aminah", detail: "Menambahkan Jadwal 08 Agustus 2026." },
    { id: "10", time: "05 Juni 2026 Pukul 11:00", by: "Kader Aminah", detail: "Membuat Jadwal Baru untuk 04 Juli 2026." },
    { id: "11", time: "04 Juni 2026 Pukul 13:20", by: "Kader Siti", detail: "Menghapus Jadwal 05 Mei 2026." },
    { id: "12", time: "04 Juni 2026 Pukul 08:30", by: "Kader Ratna", detail: "Memperbarui Fokus Layanan 01 Juni 2026." }
  ];
}

