"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { getLoggedInMotherDetail } from "@/app/actions/mothers";
import { getMeasurementHistory, createChildMeasurement, getChildDetail, getChildrenData } from "@/app/actions/children";
import { saveChildOfflineStateToDexie, getChildOfflineStateFromDexie, saveChildMeasurementToDexie, getCacheItem, setCacheItem } from "@/lib/db/dexieDb";
import { 
  MdChildCare, MdLocalDining,
  MdShield, MdAssignmentTurnedIn,
  MdCheckCircle, MdShowChart,
  MdSearch, MdClose, MdKeyboardArrowDown, MdAdd,
  MdEdit, MdWarning, MdCheckCircleOutline, MdWarningAmber,
  MdMedication, MdCalendarMonth
} from "react-icons/md";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

// ─── DATA MOCK PEDIKATRIK BUKU KIA ────────────────────────
const MOCK_NEONATUS_DATA = [
  { fase: "0 - 6 Jam", tanggal: "14/09/2026", jam: "05:00", batch: "B26-HB0", bb: 3200, pb: 50, lk: 34, imd: "✓ Ya", vitK: "✓ Ya", salepMata: "✓ Ya", hb0: "✓ Ya", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Tidak ada, kondisi stabil", rujukan: "-", nakes: "Bidan Widya" },
  { fase: "6 - 48 Jam (KN1)", tanggal: "15/09/2026", jam: "10:00", batch: "B26-VITK", bb: 3150, pb: 50, lk: 34, menyusu: "✓ Aktif", taliPusat: "✓ Bersih/Normal", vitK: "✓ Ya", salepMata: "✓ Ya", hb0: "✓ Ya", shk: "Dilakukan (Sampel Darah Tumit)", pjbKritis: "Lolos (Saturasi 98%)", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Penurunan BB fisiologis normal", rujukan: "-", nakes: "Bidan Widya" },
  { fase: "3 - 7 Hari (KN2)", tanggal: "19/09/2026", jam: "09:00", batch: "-", bb: 3250, pb: 50, lk: 34.2, menyusu: "✓ Kuat", taliPusat: "✓ Kering/Hampir Puput", tandaBahaya: "❌ Tidak Ada", ikterus: "❌ Tidak Kuning", hb0: "✓ Sudah", shk: "Hasil: Normal", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Tidak ada", rujukan: "-", nakes: "Bidan Widya" },
  { fase: "8 - 28 Hari (KN3)", tanggal: "12/10/2026", jam: "11:00", batch: "-", bb: 3800, pb: 52, lk: 35.5, menyusu: "✓ Sangat Kuat", taliPusat: "✓ Sembuh Sempurna", tandaBahaya: "❌ Tidak Ada", ikterus: "❌ Tidak Kuning", shk: "Terverifikasi", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Pertumbuhan optimal", rujukan: "-", nakes: "Dr. Rian Syarif, Sp.A" }
];

const MOCK_JADWAL_IMUNISASI = [
  { id: "hb0", vaksin: "Hepatitis B (<24 Jam)", usia: "0 Bulan", status: "Tepat Jadwal", tgl: "14/09/2026", batch: "HB0-991A", nakes: "Bidan Widya" },
  { id: "bcg", vaksin: "BCG (Tuberculosis)", usia: "1 Bulan", status: "Tepat Jadwal", tgl: "14/10/2026", batch: "BCG-221B", nakes: "Bidan Widya" },
  { id: "opv1", vaksin: "Polio Tetes 1 (OPV 1)", usia: "1 Bulan", status: "Tepat Jadwal", tgl: "14/10/2026", batch: "OPV-003Z", nakes: "Bidan Widya" },
  { id: "dpthb1", vaksin: "DPT-HB-Hib 1", usia: "2 Bulan", status: "Belum Waktunya", tgl: "-", batch: "-", nakes: "-" },
  { id: "opv2", vaksin: "Polio Tetes 2 (OPV 2)", usia: "2 Bulan", status: "Belum Waktunya", tgl: "-", batch: "-", nakes: "-" },
  { id: "pcv1", vaksin: "PCV 1 (Pneumokokus)", usia: "2 Bulan", status: "Belum Waktunya", tgl: "-", batch: "-", nakes: "-" },
];

// ─── DATA STANDAR PERTUMBUHAN KMS BUKU KIA 0-2 TAHUN (HALAMAN 130-131) ───
const KMS_IDEAL_DATA = [
  { month: 0,  l_bb: "2.5 - 3.9", l_pb: "46.1 - 51.8", p_bb: "2.4 - 3.7", p_pb: "45.4 - 51.0", medianBB: 3.3, redBB: 2.5, orangeBB: 2.9, yellowBB: 3.9 },
  { month: 1,  l_bb: "3.4 - 5.1", l_pb: "50.8 - 56.7", p_bb: "3.2 - 4.8", p_pb: "49.8 - 55.6", medianBB: 4.5, redBB: 3.4, orangeBB: 3.9, yellowBB: 5.1 },
  { month: 2,  l_bb: "4.3 - 6.3", l_pb: "54.4 - 60.4", p_bb: "3.9 - 5.8", p_pb: "53.0 - 59.1", medianBB: 5.6, redBB: 4.3, orangeBB: 4.9, yellowBB: 6.3 },
  { month: 3,  l_bb: "5.0 - 7.2", l_pb: "57.3 - 63.5", p_bb: "4.5 - 6.6", p_pb: "55.6 - 61.9", medianBB: 6.4, redBB: 5.0, orangeBB: 5.7, yellowBB: 7.2 },
  { month: 4,  l_bb: "5.6 - 7.8", l_pb: "59.7 - 66.0", p_bb: "5.0 - 7.3", p_pb: "57.8 - 64.3", medianBB: 7.0, redBB: 5.6, orangeBB: 6.2, yellowBB: 7.8 },
  { month: 5,  l_bb: "6.1 - 8.4", l_pb: "61.7 - 68.0", p_bb: "5.4 - 7.8", p_pb: "59.6 - 66.2", medianBB: 7.5, redBB: 6.1, orangeBB: 6.7, yellowBB: 8.4 },
  { month: 6,  l_bb: "6.4 - 8.8", l_pb: "63.3 - 69.8", p_bb: "5.7 - 8.2", p_pb: "61.2 - 68.0", medianBB: 7.9, redBB: 6.4, orangeBB: 7.1, yellowBB: 8.8 },
  { month: 7,  l_bb: "6.7 - 9.2", l_pb: "64.8 - 71.3", p_bb: "6.0 - 8.6", p_pb: "62.7 - 69.6", medianBB: 8.3, redBB: 6.7, orangeBB: 7.4, yellowBB: 9.2 },
  { month: 8,  l_bb: "6.9 - 9.6", l_pb: "66.2 - 72.8", p_bb: "6.3 - 9.0", p_pb: "64.0 - 71.1", medianBB: 8.6, redBB: 6.9, orangeBB: 7.7, yellowBB: 9.6 },
  { month: 9,  l_bb: "7.1 - 9.9", l_pb: "67.5 - 74.2", p_bb: "6.5 - 9.3", p_pb: "65.3 - 72.6", medianBB: 8.9, redBB: 7.1, orangeBB: 7.9, yellowBB: 9.9 },
  { month: 10, l_bb: "7.4 - 10.2", l_pb: "68.7 - 75.6", p_bb: "6.7 - 9.6", p_pb: "66.5 - 74.0", medianBB: 9.2, redBB: 7.4, orangeBB: 8.2, yellowBB: 10.2 },
  { month: 11, l_bb: "7.6 - 10.5", l_pb: "69.9 - 76.9", p_bb: "6.9 - 9.9", p_pb: "67.7 - 75.3", medianBB: 9.4, redBB: 7.6, orangeBB: 8.4, yellowBB: 10.5 },
  { month: 12, l_bb: "7.7 - 10.8", l_pb: "71.0 - 78.1", p_bb: "7.0 - 10.1", p_pb: "68.9 - 76.6", medianBB: 9.6, redBB: 7.7, orangeBB: 8.6, yellowBB: 10.8 },
  { month: 13, l_bb: "7.9 - 11.0", l_pb: "72.1 - 79.3", p_bb: "7.2 - 10.4", p_pb: "70.0 - 77.8", medianBB: 9.9, redBB: 7.9, orangeBB: 8.8, yellowBB: 11.0 },
  { month: 14, l_bb: "8.1 - 11.3", l_pb: "73.1 - 80.5", p_bb: "7.4 - 10.6", p_pb: "71.0 - 79.0", medianBB: 10.1, redBB: 8.1, orangeBB: 9.0, yellowBB: 11.3 },
  { month: 15, l_bb: "8.3 - 11.5", l_pb: "74.1 - 81.7", p_bb: "7.6 - 10.9", p_pb: "72.0 - 80.2", medianBB: 10.3, redBB: 8.3, orangeBB: 9.2, yellowBB: 11.5 },
  { month: 16, l_bb: "8.4 - 11.7", l_pb: "75.0 - 82.8", p_bb: "7.7 - 11.1", p_pb: "73.0 - 81.4", medianBB: 10.5, redBB: 8.4, orangeBB: 9.4, yellowBB: 11.7 },
  { month: 17, l_bb: "8.6 - 12.0", l_pb: "76.0 - 83.9", p_bb: "7.9 - 11.4", p_pb: "74.0 - 82.5", medianBB: 10.7, redBB: 8.6, orangeBB: 9.6, yellowBB: 12.0 },
  { month: 18, l_bb: "8.8 - 12.2", l_pb: "76.9 - 85.0", p_bb: "8.1 - 11.6", p_pb: "74.9 - 83.6", medianBB: 10.9, redBB: 8.8, orangeBB: 9.8, yellowBB: 12.2 },
  { month: 19, l_bb: "8.9 - 12.5", l_pb: "77.7 - 86.0", p_bb: "8.2 - 11.8", p_pb: "75.8 - 84.7", medianBB: 11.1, redBB: 8.9, orangeBB: 10.0, yellowBB: 12.5 },
  { month: 20, l_bb: "9.1 - 12.7", l_pb: "78.6 - 87.0", p_bb: "8.4 - 12.1", p_pb: "76.7 - 85.7", medianBB: 11.3, redBB: 9.1, orangeBB: 10.2, yellowBB: 12.7 },
  { month: 21, l_bb: "9.2 - 12.9", l_pb: "79.4 - 88.0", p_bb: "8.6 - 12.3", p_pb: "77.5 - 86.7", medianBB: 11.5, redBB: 9.2, orangeBB: 10.4, yellowBB: 12.9 },
  { month: 22, l_bb: "9.4 - 13.2", l_pb: "80.2 - 89.0", p_bb: "8.7 - 12.5", p_pb: "78.4 - 87.7", medianBB: 11.8, redBB: 9.4, orangeBB: 10.6, yellowBB: 13.2 },
  { month: 23, l_bb: "9.5 - 13.4", l_pb: "81.0 - 89.9", p_bb: "8.9 - 12.8", p_pb: "79.2 - 88.7", medianBB: 12.0, redBB: 9.5, orangeBB: 10.8, yellowBB: 13.4 },
  { month: 24, l_bb: "9.7 - 13.6", l_pb: "81.7 - 90.9", p_bb: "9.0 - 13.0", p_pb: "80.0 - 89.6", medianBB: 12.2, redBB: 9.7, orangeBB: 11.0, yellowBB: 13.6 }
];

const KMS_IDEAL_DATA_24_60 = [
  { month: 24, l_bb: "9.7 - 13.6", l_pb: "81.7 - 90.9", p_bb: "9.0 - 13.0", p_pb: "80.0 - 89.6" },
  { month: 27, l_bb: "10.2 - 14.3", l_pb: "83.5 - 93.4", p_bb: "9.4 - 13.8", p_pb: "81.9 - 92.2" },
  { month: 30, l_bb: "10.6 - 15.0", l_pb: "85.9 - 96.3", p_bb: "9.8 - 14.5", p_pb: "84.2 - 95.0" },
  { month: 33, l_bb: "11.1 - 15.7", l_pb: "88.1 - 99.1", p_bb: "10.2 - 15.2", p_pb: "86.5 - 97.7" },
  { month: 36, l_bb: "11.4 - 16.3", l_pb: "90.2 - 101.9", p_bb: "10.6 - 15.8", p_pb: "88.5 - 100.4" },
  { month: 39, l_bb: "11.8 - 17.0", l_pb: "92.2 - 104.6", p_bb: "10.9 - 16.5", p_pb: "90.5 - 103.0" },
  { month: 42, l_bb: "12.2 - 17.7", l_pb: "94.1 - 107.2", p_bb: "11.3 - 17.2", p_pb: "92.4 - 105.5" },
  { month: 45, l_bb: "12.6 - 18.3", l_pb: "96.0 - 109.6", p_bb: "11.6 - 17.9", p_pb: "94.2 - 107.9" },
  { month: 48, l_bb: "13.0 - 19.0", l_pb: "97.8 - 111.9", p_bb: "11.9 - 18.6", p_pb: "96.0 - 110.3" },
  { month: 51, l_bb: "13.3 - 19.7", l_pb: "99.7 - 114.1", p_bb: "12.2 - 19.3", p_pb: "97.7 - 112.6" },
  { month: 54, l_bb: "13.7 - 20.4", l_pb: "101.5 - 116.3", p_bb: "12.5 - 20.0", p_pb: "99.4 - 114.7" },
  { month: 57, l_bb: "14.0 - 21.1", l_pb: "103.3 - 118.4", p_bb: "12.8 - 20.7", p_pb: "101.1 - 116.8" },
  { month: 60, l_bb: "14.3 - 21.8", l_pb: "104.9 - 120.4", p_bb: "13.1 - 21.4", p_pb: "102.7 - 118.9" },
];

// ─── DATA WHO Z-SCORE LAKI-LAKI LENGKAP (Buku KIA Hal 131-141) ───
// BB/U Laki-laki 0–24 Bulan (z-score: -3SD, -2SD, Median/0SD, +2SD)
const WHO_MALE_BB_0_24 = [
  { m:0,  sd3n:2.1, sd2n:2.5, med:3.3, sd2p:4.4, sd3p:4.9 },
  { m:1,  sd3n:2.9, sd2n:3.4, med:4.5, sd2p:5.8, sd3p:6.6 },
  { m:2,  sd3n:3.8, sd2n:4.3, med:5.6, sd2p:7.1, sd3p:8.0 },
  { m:3,  sd3n:4.4, sd2n:5.0, med:6.4, sd2p:8.0, sd3p:9.0 },
  { m:4,  sd3n:4.9, sd2n:5.6, med:7.0, sd2p:8.7, sd3p:9.7 },
  { m:5,  sd3n:5.3, sd2n:6.1, med:7.5, sd2p:9.3, sd3p:10.4 },
  { m:6,  sd3n:5.7, sd2n:6.4, med:7.9, sd2p:9.8, sd3p:10.9 },
  { m:7,  sd3n:5.9, sd2n:6.7, med:8.3, sd2p:10.3, sd3p:11.4 },
  { m:8,  sd3n:6.2, sd2n:6.9, med:8.6, sd2p:10.7, sd3p:11.9 },
  { m:9,  sd3n:6.3, sd2n:7.1, med:8.9, sd2p:11.0, sd3p:12.3 },
  { m:10, sd3n:6.5, sd2n:7.4, med:9.2, sd2p:11.4, sd3p:12.7 },
  { m:11, sd3n:6.7, sd2n:7.6, med:9.4, sd2p:11.7, sd3p:13.0 },
  { m:12, sd3n:6.9, sd2n:7.7, med:9.6, sd2p:11.9, sd3p:13.3 },
  { m:13, sd3n:7.0, sd2n:7.9, med:9.9, sd2p:12.3, sd3p:13.7 },
  { m:14, sd3n:7.2, sd2n:8.1, med:10.1, sd2p:12.6, sd3p:14.0 },
  { m:15, sd3n:7.4, sd2n:8.3, med:10.3, sd2p:12.8, sd3p:14.3 },
  { m:16, sd3n:7.5, sd2n:8.4, med:10.5, sd2p:13.1, sd3p:14.6 },
  { m:17, sd3n:7.7, sd2n:8.6, med:10.7, sd2p:13.4, sd3p:14.9 },
  { m:18, sd3n:7.8, sd2n:8.8, med:10.9, sd2p:13.6, sd3p:15.2 },
  { m:19, sd3n:8.0, sd2n:8.9, med:11.1, sd2p:13.9, sd3p:15.5 },
  { m:20, sd3n:8.1, sd2n:9.1, med:11.3, sd2p:14.2, sd3p:15.8 },
  { m:21, sd3n:8.2, sd2n:9.2, med:11.5, sd2p:14.5, sd3p:16.1 },
  { m:22, sd3n:8.4, sd2n:9.4, med:11.8, sd2p:14.7, sd3p:16.5 },
  { m:23, sd3n:8.5, sd2n:9.5, med:12.0, sd2p:15.0, sd3p:16.8 },
  { m:24, sd3n:8.6, sd2n:9.7, med:12.2, sd2p:15.3, sd3p:17.1 },
];

// PB/U Laki-laki 0–24 Bulan (cm)
const WHO_MALE_PB_0_24 = [
  { m:0,  sd3n:44.2, sd2n:46.1, med:49.9, sd2p:53.7, sd3p:55.6 },
  { m:1,  sd3n:48.9, sd2n:50.8, med:54.7, sd2p:58.6, sd3p:60.6 },
  { m:2,  sd3n:52.4, sd2n:54.4, med:58.4, sd2p:62.4, sd3p:64.4 },
  { m:3,  sd3n:55.3, sd2n:57.3, med:61.4, sd2p:65.5, sd3p:67.6 },
  { m:4,  sd3n:57.6, sd2n:59.7, med:63.9, sd2p:68.0, sd3p:70.1 },
  { m:5,  sd3n:59.6, sd2n:61.7, med:65.9, sd2p:70.1, sd3p:72.2 },
  { m:6,  sd3n:61.2, sd2n:63.3, med:67.6, sd2p:71.9, sd3p:74.0 },
  { m:7,  sd3n:62.7, sd2n:64.8, med:69.2, sd2p:73.5, sd3p:75.7 },
  { m:8,  sd3n:64.0, sd2n:66.2, med:70.6, sd2p:75.0, sd3p:77.2 },
  { m:9,  sd3n:65.2, sd2n:67.5, med:72.0, sd2p:76.5, sd3p:78.7 },
  { m:10, sd3n:66.4, sd2n:68.7, med:73.3, sd2p:78.0, sd3p:80.1 },
  { m:11, sd3n:67.6, sd2n:69.9, med:74.5, sd2p:79.2, sd3p:81.5 },
  { m:12, sd3n:68.6, sd2n:71.0, med:75.7, sd2p:80.5, sd3p:82.9 },
  { m:13, sd3n:69.6, sd2n:72.1, med:76.9, sd2p:81.8, sd3p:84.2 },
  { m:14, sd3n:70.6, sd2n:73.1, med:78.0, sd2p:83.0, sd3p:85.5 },
  { m:15, sd3n:71.6, sd2n:74.1, med:79.1, sd2p:84.2, sd3p:86.7 },
  { m:16, sd3n:72.5, sd2n:75.0, med:80.2, sd2p:85.4, sd3p:87.9 },
  { m:17, sd3n:73.3, sd2n:76.0, med:81.2, sd2p:86.5, sd3p:89.1 },
  { m:18, sd3n:74.2, sd2n:76.9, med:82.3, sd2p:87.7, sd3p:90.3 },
  { m:19, sd3n:75.0, sd2n:77.7, med:83.2, sd2p:88.8, sd3p:91.4 },
  { m:20, sd3n:75.8, sd2n:78.6, med:84.2, sd2p:89.8, sd3p:92.6 },
  { m:21, sd3n:76.5, sd2n:79.4, med:85.1, sd2p:90.9, sd3p:93.8 },
  { m:22, sd3n:77.2, sd2n:80.2, med:86.0, sd2p:91.9, sd3p:94.9 },
  { m:23, sd3n:78.0, sd2n:81.0, med:86.9, sd2p:92.9, sd3p:95.9 },
  { m:24, sd3n:78.7, sd2n:81.7, med:87.8, sd2p:93.9, sd3p:96.9 },
];

// BB/U Laki-laki 2–5 Tahun (Bulan 24-60)
const WHO_MALE_BB_24_60 = [
  { m:24, sd3n:8.6,  sd2n:9.7,  med:12.2, sd2p:15.3, sd3p:17.1 },
  { m:27, sd3n:8.9,  sd2n:10.2, med:12.8, sd2p:16.0, sd3p:18.0 },
  { m:30, sd3n:9.4,  sd2n:10.6, med:13.3, sd2p:16.7, sd3p:18.8 },
  { m:33, sd3n:9.8,  sd2n:11.1, med:13.8, sd2p:17.4, sd3p:19.6 },
  { m:36, sd3n:10.2, sd2n:11.4, med:14.3, sd2p:18.1, sd3p:20.4 },
  { m:39, sd3n:10.5, sd2n:11.8, med:14.8, sd2p:18.8, sd3p:21.3 },
  { m:42, sd3n:10.8, sd2n:12.2, med:15.3, sd2p:19.5, sd3p:22.2 },
  { m:45, sd3n:11.2, sd2n:12.6, med:15.8, sd2p:20.3, sd3p:23.1 },
  { m:48, sd3n:11.5, sd2n:13.0, med:16.3, sd2p:21.0, sd3p:24.0 },
  { m:51, sd3n:11.8, sd2n:13.3, med:16.7, sd2p:21.7, sd3p:24.9 },
  { m:54, sd3n:12.1, sd2n:13.7, med:17.2, sd2p:22.4, sd3p:25.7 },
  { m:57, sd3n:12.4, sd2n:14.0, med:17.7, sd2p:23.1, sd3p:26.6 },
  { m:60, sd3n:12.7, sd2n:14.3, med:18.3, sd2p:23.9, sd3p:27.5 },
];

// TB/U Laki-laki 2–5 Tahun (cm)
const WHO_MALE_TB_24_60 = [
  { m:24, sd3n:78.0, sd2n:81.0, med:87.1, sd2p:93.4, sd3p:96.5 },
  { m:27, sd3n:80.4, sd2n:83.5, med:89.9, sd2p:96.3, sd3p:99.5 },
  { m:30, sd3n:82.7, sd2n:85.9, med:92.5, sd2p:99.1, sd3p:102.4 },
  { m:33, sd3n:84.8, sd2n:88.1, med:95.0, sd2p:101.9, sd3p:105.3 },
  { m:36, sd3n:86.8, sd2n:90.2, med:97.4, sd2p:104.6, sd3p:108.1 },
  { m:39, sd3n:88.7, sd2n:92.2, med:99.7, sd2p:107.2, sd3p:110.8 },
  { m:42, sd3n:90.5, sd2n:94.1, med:101.8, sd2p:109.6, sd3p:113.3 },
  { m:45, sd3n:92.3, sd2n:96.0, med:103.9, sd2p:111.9, sd3p:115.7 },
  { m:48, sd3n:94.1, sd2n:97.8, med:105.9, sd2p:114.1, sd3p:118.0 },
  { m:51, sd3n:95.8, sd2n:99.7, med:107.8, sd2p:116.3, sd3p:120.3 },
  { m:54, sd3n:97.5, sd2n:101.5, med:109.7, sd2p:118.4, sd3p:122.6 },
  { m:57, sd3n:99.2, sd2n:103.3, med:111.5, sd2p:120.4, sd3p:124.7 },
  { m:60, sd3n:100.7, sd2n:104.9, med:113.3, sd2p:122.3, sd3p:126.7 },
];

// LK/U Laki-laki 0–5 Tahun (cm) — dipilih interval 3-bulan
const WHO_MALE_LK_0_60 = [
  { m:0,  sd3n:31.5, sd2n:32.7, med:34.5, sd2p:36.3, sd3p:37.5 },
  { m:3,  sd3n:36.5, sd2n:37.8, med:40.0, sd2p:42.2, sd3p:43.5 },
  { m:6,  sd3n:39.0, sd2n:40.4, med:42.6, sd2p:44.8, sd3p:46.2 },
  { m:9,  sd3n:40.7, sd2n:42.1, med:44.4, sd2p:46.7, sd3p:48.1 },
  { m:12, sd3n:41.9, sd2n:43.3, med:45.7, sd2p:48.1, sd3p:49.5 },
  { m:15, sd3n:42.7, sd2n:44.1, med:46.6, sd2p:49.1, sd3p:50.5 },
  { m:18, sd3n:43.4, sd2n:44.8, med:47.3, sd2p:49.9, sd3p:51.4 },
  { m:21, sd3n:43.9, sd2n:45.3, med:47.9, sd2p:50.5, sd3p:52.0 },
  { m:24, sd3n:44.3, sd2n:45.7, med:48.3, sd2p:51.0, sd3p:52.5 },
  { m:30, sd3n:44.9, sd2n:46.4, med:49.0, sd2p:51.7, sd3p:53.3 },
  { m:36, sd3n:45.4, sd2n:46.9, med:49.6, sd2p:52.4, sd3p:53.9 },
  { m:42, sd3n:45.9, sd2n:47.4, med:50.1, sd2p:52.9, sd3p:54.5 },
  { m:48, sd3n:46.3, sd2n:47.8, med:50.6, sd2p:53.4, sd3p:54.9 },
  { m:54, sd3n:46.6, sd2n:48.2, med:51.0, sd2p:53.9, sd3p:55.5 },
  { m:60, sd3n:46.9, sd2n:48.5, med:51.3, sd2p:54.2, sd3p:55.8 },
];

// ─── DATA WHO Z-SCORE PEREMPUAN LENGKAP (Buku KIA Hal 142-153) ───
// BB/U Perempuan 0–24 Bulan
const WHO_FEMALE_BB_0_24 = [
  { m:0,  sd3n:2.0, sd2n:2.4, med:3.2, sd2p:4.2, sd3p:4.8 },
  { m:1,  sd3n:2.7, sd2n:3.2, med:4.2, sd2p:5.5, sd3p:6.2 },
  { m:2,  sd3n:3.4, sd2n:3.9, med:5.1, sd2p:6.6, sd3p:7.5 },
  { m:3,  sd3n:3.9, sd2n:4.5, med:5.8, sd2p:7.5, sd3p:8.5 },
  { m:4,  sd3n:4.4, sd2n:5.0, med:6.4, sd2p:8.1, sd3p:9.3 },
  { m:5,  sd3n:4.8, sd2n:5.4, med:6.9, sd2p:8.8, sd3p:10.0 },
  { m:6,  sd3n:5.1, sd2n:5.7, med:7.3, sd2p:9.3, sd3p:10.6 },
  { m:7,  sd3n:5.3, sd2n:6.0, med:7.6, sd2p:9.8, sd3p:11.1 },
  { m:8,  sd3n:5.6, sd2n:6.3, med:7.9, sd2p:10.2, sd3p:11.6 },
  { m:9,  sd3n:5.8, sd2n:6.5, med:8.2, sd2p:10.5, sd3p:11.9 },
  { m:10, sd3n:5.9, sd2n:6.7, med:8.5, sd2p:10.9, sd3p:12.4 },
  { m:11, sd3n:6.1, sd2n:6.9, med:8.7, sd2p:11.2, sd3p:12.8 },
  { m:12, sd3n:6.3, sd2n:7.0, med:8.9, sd2p:11.5, sd3p:13.1 },
  { m:13, sd3n:6.4, sd2n:7.2, med:9.2, sd2p:11.8, sd3p:13.5 },
  { m:14, sd3n:6.6, sd2n:7.4, med:9.4, sd2p:12.1, sd3p:13.9 },
  { m:15, sd3n:6.7, sd2n:7.6, med:9.6, sd2p:12.4, sd3p:14.2 },
  { m:16, sd3n:6.9, sd2n:7.7, med:9.8, sd2p:12.6, sd3p:14.5 },
  { m:17, sd3n:7.0, sd2n:7.9, med:10.0, sd2p:12.9, sd3p:14.9 },
  { m:18, sd3n:7.2, sd2n:8.1, med:10.2, sd2p:13.2, sd3p:15.2 },
  { m:19, sd3n:7.3, sd2n:8.2, med:10.4, sd2p:13.5, sd3p:15.6 },
  { m:20, sd3n:7.5, sd2n:8.4, med:10.6, sd2p:13.7, sd3p:15.9 },
  { m:21, sd3n:7.6, sd2n:8.6, med:10.9, sd2p:14.0, sd3p:16.3 },
  { m:22, sd3n:7.8, sd2n:8.7, med:11.1, sd2p:14.3, sd3p:16.6 },
  { m:23, sd3n:7.9, sd2n:8.9, med:11.3, sd2p:14.6, sd3p:17.0 },
  { m:24, sd3n:8.1, sd2n:9.0, med:11.5, sd2p:14.8, sd3p:17.3 },
];

// PB/U Perempuan 0–24 Bulan (cm)
const WHO_FEMALE_PB_0_24 = [
  { m:0,  sd3n:43.6, sd2n:45.4, med:49.1, sd2p:52.9, sd3p:54.7 },
  { m:1,  sd3n:47.8, sd2n:49.8, med:53.7, sd2p:57.6, sd3p:59.5 },
  { m:2,  sd3n:51.0, sd2n:53.0, med:57.1, sd2p:61.1, sd3p:63.2 },
  { m:3,  sd3n:53.5, sd2n:55.6, med:59.8, sd2p:64.0, sd3p:66.1 },
  { m:4,  sd3n:55.6, sd2n:57.8, med:62.1, sd2p:66.4, sd3p:68.6 },
  { m:5,  sd3n:57.4, sd2n:59.6, med:64.0, sd2p:68.5, sd3p:70.7 },
  { m:6,  sd3n:58.9, sd2n:61.2, med:65.7, sd2p:70.3, sd3p:72.5 },
  { m:7,  sd3n:60.3, sd2n:62.7, med:67.3, sd2p:72.0, sd3p:74.2 },
  { m:8,  sd3n:61.7, sd2n:64.0, med:68.7, sd2p:73.5, sd3p:75.9 },
  { m:9,  sd3n:62.9, sd2n:65.3, med:70.1, sd2p:75.0, sd3p:77.5 },
  { m:10, sd3n:64.1, sd2n:66.5, med:71.5, sd2p:76.4, sd3p:78.9 },
  { m:11, sd3n:65.2, sd2n:67.7, med:72.8, sd2p:77.8, sd3p:80.3 },
  { m:12, sd3n:66.3, sd2n:68.9, med:74.0, sd2p:79.2, sd3p:81.7 },
  { m:13, sd3n:67.3, sd2n:70.0, med:75.2, sd2p:80.5, sd3p:83.1 },
  { m:14, sd3n:68.3, sd2n:71.0, med:76.4, sd2p:81.7, sd3p:84.4 },
  { m:15, sd3n:69.3, sd2n:72.0, med:77.5, sd2p:83.0, sd3p:85.7 },
  { m:16, sd3n:70.2, sd2n:73.0, med:78.6, sd2p:84.2, sd3p:87.0 },
  { m:17, sd3n:71.1, sd2n:74.0, med:79.7, sd2p:85.4, sd3p:88.2 },
  { m:18, sd3n:71.9, sd2n:74.9, med:80.7, sd2p:86.5, sd3p:89.4 },
  { m:19, sd3n:72.8, sd2n:75.8, med:81.7, sd2p:87.6, sd3p:90.6 },
  { m:20, sd3n:73.6, sd2n:76.7, med:82.7, sd2p:88.7, sd3p:91.8 },
  { m:21, sd3n:74.4, sd2n:77.5, med:83.7, sd2p:89.8, sd3p:92.9 },
  { m:22, sd3n:75.2, sd2n:78.4, med:84.6, sd2p:90.8, sd3p:94.0 },
  { m:23, sd3n:76.0, sd2n:79.2, med:85.5, sd2p:91.9, sd3p:95.0 },
  { m:24, sd3n:76.7, sd2n:80.0, med:86.4, sd2p:92.9, sd3p:96.1 },
];

// BB/U Perempuan 2–5 Tahun (Bulan 24-60)
const WHO_FEMALE_BB_24_60 = [
  { m:24, sd3n:8.1,  sd2n:9.0,  med:11.5, sd2p:14.8, sd3p:17.3 },
  { m:27, sd3n:8.5,  sd2n:9.4,  med:12.0, sd2p:15.5, sd3p:18.1 },
  { m:30, sd3n:8.8,  sd2n:9.8,  med:12.5, sd2p:16.2, sd3p:19.0 },
  { m:33, sd3n:9.1,  sd2n:10.2, med:13.0, sd2p:16.9, sd3p:19.9 },
  { m:36, sd3n:9.5,  sd2n:10.6, med:13.5, sd2p:17.7, sd3p:20.9 },
  { m:39, sd3n:9.7,  sd2n:10.9, med:14.0, sd2p:18.4, sd3p:21.8 },
  { m:42, sd3n:10.0, sd2n:11.3, med:14.5, sd2p:19.2, sd3p:22.8 },
  { m:45, sd3n:10.3, sd2n:11.6, med:15.0, sd2p:20.0, sd3p:23.8 },
  { m:48, sd3n:10.5, sd2n:11.9, med:15.4, sd2p:20.7, sd3p:24.7 },
  { m:51, sd3n:10.8, sd2n:12.2, med:15.9, sd2p:21.5, sd3p:25.7 },
  { m:54, sd3n:11.0, sd2n:12.5, med:16.4, sd2p:22.3, sd3p:26.7 },
  { m:57, sd3n:11.3, sd2n:12.8, med:16.9, sd2p:23.1, sd3p:27.7 },
  { m:60, sd3n:11.5, sd2n:13.1, med:17.3, sd2p:23.9, sd3p:28.6 },
];

// TB/U Perempuan 2–5 Tahun (cm)
const WHO_FEMALE_TB_24_60 = [
  { m:24, sd3n:76.0, sd2n:79.3, med:85.7, sd2p:92.2, sd3p:95.4 },
  { m:27, sd3n:78.5, sd2n:81.9, med:88.4, sd2p:95.0, sd3p:98.3 },
  { m:30, sd3n:80.7, sd2n:84.2, med:91.0, sd2p:97.7, sd3p:101.1 },
  { m:33, sd3n:82.8, sd2n:86.5, med:93.5, sd2p:100.4, sd3p:103.8 },
  { m:36, sd3n:84.8, sd2n:88.5, med:95.7, sd2p:103.0, sd3p:106.5 },
  { m:39, sd3n:86.7, sd2n:90.5, med:98.0, sd2p:105.5, sd3p:109.1 },
  { m:42, sd3n:88.5, sd2n:92.4, med:100.1, sd2p:107.9, sd3p:111.6 },
  { m:45, sd3n:90.2, sd2n:94.2, med:102.2, sd2p:110.3, sd3p:114.1 },
  { m:48, sd3n:91.9, sd2n:96.0, med:104.3, sd2p:112.6, sd3p:116.5 },
  { m:51, sd3n:93.6, sd2n:97.7, med:106.2, sd2p:114.7, sd3p:118.8 },
  { m:54, sd3n:95.2, sd2n:99.4, med:108.1, sd2p:116.8, sd3p:121.0 },
  { m:57, sd3n:96.7, sd2n:101.1, med:110.0, sd2p:118.9, sd3p:123.2 },
  { m:60, sd3n:98.3, sd2n:102.7, med:111.8, sd2p:120.9, sd3p:125.3 },
];

// LK/U Perempuan 0–5 Tahun (cm) — interval 3-bulan
const WHO_FEMALE_LK_0_60 = [
  { m:0,  sd3n:30.7, sd2n:31.9, med:33.9, sd2p:35.8, sd3p:37.0 },
  { m:3,  sd3n:34.9, sd2n:36.1, med:38.3, sd2p:40.5, sd3p:41.7 },
  { m:6,  sd3n:37.4, sd2n:38.7, med:41.0, sd2p:43.3, sd3p:44.6 },
  { m:9,  sd3n:39.1, sd2n:40.4, med:42.7, sd2p:45.1, sd3p:46.4 },
  { m:12, sd3n:40.4, sd2n:41.7, med:44.1, sd2p:46.5, sd3p:47.8 },
  { m:15, sd3n:41.2, sd2n:42.5, med:45.0, sd2p:47.5, sd3p:48.9 },
  { m:18, sd3n:41.9, sd2n:43.3, med:45.8, sd2p:48.3, sd3p:49.7 },
  { m:21, sd3n:42.5, sd2n:43.9, med:46.4, sd2p:49.0, sd3p:50.4 },
  { m:24, sd3n:42.9, sd2n:44.3, med:46.9, sd2p:49.5, sd3p:50.9 },
  { m:30, sd3n:43.6, sd2n:45.1, med:47.7, sd2p:50.3, sd3p:51.8 },
  { m:36, sd3n:44.1, sd2n:45.6, med:48.3, sd2p:51.0, sd3p:52.5 },
  { m:42, sd3n:44.6, sd2n:46.1, med:48.8, sd2p:51.6, sd3p:53.1 },
  { m:48, sd3n:44.9, sd2n:46.5, med:49.3, sd2p:52.1, sd3p:53.7 },
  { m:54, sd3n:45.3, sd2n:46.9, med:49.7, sd2p:52.6, sd3p:54.2 },
  { m:60, sd3n:45.6, sd2n:47.3, med:50.1, sd2p:53.0, sd3p:54.6 },
];

const DEFAULT_NEONATUS_PELAYANAN = {
  headerDates: {
    k1Date: "14/09/2026", k1Place: "Puskesmas Suhat",
    k2Date: "15/09/2026", k2Place: "Puskesmas Suhat",
    k3Date: "19/09/2026", k3Place: "Puskesmas Suhat",
    k4Date: "12/10/2026", k4Place: "Puskesmas Suhat",
  },
  items: {
    "tali_pusat": { label: "Perawatan Tali pusat", k1: "✓ Bersih", k2: "✓ Bersih", k3: "✓ Puput/Sembuh", k4: "✓ Sembuh Sempurna" },
    "imd": { label: "IMD (Inisiasi Menyusu Dini)", k1: "✓ Dilaksanakan", k2: "Lanjut ASI", k3: "Lanjut ASI", k4: "Lanjut ASI" },
    "vit_k1": { label: "Vitamin K1", k1: "✓ Injeksi Done", k2: "-", k3: "-", k4: "-" },
    "hb0": { label: "Imunisasi Hepatitis B (HB0)", k1: "✓ (<24 Jam) Done", k2: "-", k3: "-", k4: "-" },
    "salep_mata": { label: "Salep/Tetes Mata Antibiotik", k1: "✓ Diberikan", k2: "-", k3: "-", k4: "-" },
    "shk": { label: "Skrining BBL / SHK", k1: "-", k2: "✓ Ambil Sampel", k3: "-", k4: "✓ Hasil Normal" },
    "buku_kia": { label: "Buku KIA (Diberikan/Edukasi)", k1: "✓ Diterima", k2: "✓ Edukasi", k3: "✓ Edukasi", k4: "✓ Edukasi" },
    "triple": { label: "Tripel Eliminasi (H, S, Hep B)", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif" },
  }
};

const DEFAULT_TAHUNAN_PELAYANAN: Record<string, { visits: { date: string; place: string }[]; items: Record<string, string[]>; triple?: string }> = {
  bayi_1: {
    visits: [
      { date: "14/10/26", place: "Pusk" },
      { date: "14/11/26", place: "Pusk" },
      { date: "15/12/26", place: "Posy" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
    ],
    items: {
      bb: ["✓ Diukur", "✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-"],
      tb: ["✓ Diukur", "✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-"],
      lk: ["✓ Diukur", "✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-"],
      perkembangan: ["✓ KPSP Sesuai", "✓ KPSP Sesuai", "✓ KPSP Sesuai", "-", "-", "-", "-", "-"],
      kie: ["✓ KIE ASI Eksklusif", "✓ KIE MPASI", "✓ KIE Gizi", "-", "-", "-", "-", "-"],
      imunisasi: ["✓ BCG & Polio 1", "✓ DPT-HB-Hib 1", "✓ DPT-HB-Hib 2", "-", "-", "-", "-", "-"],
      vita: ["✓ Diberikan (Kapsul Biru)", "-", "-", "-", "-", "-", "-", "-"],
      cacing: ["-", "-", "-", "-", "-", "-", "-", "-"],
    },
    triple: "Non-Reaktif (3 Parameter)"
  },
  anak_2: {
    visits: [
      { date: "14/10/27", place: "Posy" },
      { date: "14/11/27", place: "Posy" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
      { date: "-", place: "-" },
    ],
    items: {
      bb: ["✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-", "-"],
      tb: ["✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-", "-"],
      lk: ["✓ Diukur", "✓ Diukur", "-", "-", "-", "-", "-", "-"],
      perkembangan: ["✓ KPSP Sesuai", "✓ KPSP Sesuai", "-", "-", "-", "-", "-", "-"],
      kie: ["✓ KIE Gizi Seimbang", "✓ KIE Gizi Seimbang", "-", "-", "-", "-", "-", "-"],
      imunisasi: ["✓ DPT Booster", "-", "-", "-", "-", "-", "-", "-"],
      vita: ["✓ Vit A & Cacing", "-", "-", "-", "-", "-", "-", "-"],
      cacing: ["-", "-", "-", "-", "-", "-", "-", "-"],
    },
    triple: "Non-Reaktif (3 Parameter)"
  },
  anak_3: {
    visits: Array.from({ length: 8 }, () => ({ date: "-", place: "-" })),
    items: {
      bb: Array(8).fill("-"),
      tb: Array(8).fill("-"),
      lk: Array(8).fill("-"),
      perkembangan: Array(8).fill("-"),
      kie: Array(8).fill("-"),
      imunisasi: Array(8).fill("-"),
      vita: Array(8).fill("-"),
      cacing: Array(8).fill("-"),
    },
    triple: "-"
  },
  anak_4: {
    visits: Array.from({ length: 8 }, () => ({ date: "-", place: "-" })),
    items: {
      bb: Array(8).fill("-"),
      tb: Array(8).fill("-"),
      lk: Array(8).fill("-"),
      perkembangan: Array(8).fill("-"),
      kie: Array(8).fill("-"),
      imunisasi: Array(8).fill("-"),
      vita: Array(8).fill("-"),
      cacing: Array(8).fill("-"),
    },
    triple: "-"
  },
  anak_5: {
    visits: Array.from({ length: 8 }, () => ({ date: "-", place: "-" })),
    items: {
      bb: Array(8).fill("-"),
      tb: Array(8).fill("-"),
      lk: Array(8).fill("-"),
      perkembangan: Array(8).fill("-"),
      kie: Array(8).fill("-"),
      imunisasi: Array(8).fill("-"),
      vita: Array(8).fill("-"),
      cacing: Array(8).fill("-"),
    },
    triple: "-"
  },
  anak_6: {
    visits: Array.from({ length: 8 }, () => ({ date: "-", place: "-" })),
    items: {
      bb: Array(8).fill("-"),
      tb: Array(8).fill("-"),
      lk: Array(8).fill("-"),
      perkembangan: Array(8).fill("-"),
      kie: Array(8).fill("-"),
      imunisasi: Array(8).fill("-"),
      vita: Array(8).fill("-"),
      cacing: Array(8).fill("-"),
    },
    triple: "-"
  }
};

const DEFAULT_GIZI_PMBA = {
  asi_frekuensi: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "4": "✓", "5": "✓", "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  asi_posisi: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "4": "✓", "5": "✓", "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  asi_perah: { "0": "-", "1": "-", "2": "-", "3": "-", "4": "-", "5": "-", "6_8": "-", "9_11": "-", "12_23": "-", "23_59": "-" },
  mpasi_ya: { "0": "❌", "1": "❌", "2": "❌", "3": "❌", "4": "❌", "5": "❌", "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  mpasi_tidak: { "0": "✓", "1": "✓", "2": "✓", "3": "✓", "4": "✓", "5": "✓", "6_8": "❌", "9_11": "❌", "12_23": "❌", "23_59": "❌" },
  variasi_pokok: { "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  variasi_lauk: { "6_8": "✓ (Hewani)", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  variasi_minyak: { "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  variasi_sayur: { "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  variasi_buah: { "6_8": "✓", "9_11": "✓", "12_23": "✓", "23_59": "✓" },
  variasi_lainnya: { "6_8": "-", "9_11": "-", "12_23": "-", "23_59": "-" },
  tekstur_saring: { "6_8": "✓ Saring", "9_11": "❌", "12_23": "❌", "23_59": "❌" },
  tekstur_lumat: { "6_8": "✓ Lumat", "9_11": "❌", "12_23": "❌", "23_59": "❌" },
  tekstur_cincang: { "6_8": "❌", "9_11": "✓ Cincang", "12_23": "❌", "23_59": "❌" },
  tekstur_keluarga: { "6_8": "❌", "9_11": "❌", "12_23": "✓ Menu Keluarga", "23_59": "✓ Menu Keluarga" },
  porsi_1: { "6_8": "✓ Terpenuhi", "9_11": "❌", "12_23": "❌", "23_59": "❌" },
  porsi_2: { "6_8": "❌", "9_11": "✓ Terpenuhi", "12_23": "❌", "23_59": "❌" },
  porsi_3: { "6_8": "❌", "9_11": "❌", "12_23": "✓ Terpenuhi", "23_59": "❌" },
  porsi_4: { "6_8": "❌", "9_11": "❌", "12_23": "❌", "23_59": "✓ Terpenuhi" },
  frekuensi_utama: { "6_8": "2x Sehari", "9_11": "3x Sehari", "12_23": "3x Sehari", "23_59": "3x Sehari" },
  frekuensi_selingan: { "6_8": "✓ 1-2x", "9_11": "✓ 2x", "12_23": "✓ 2x", "23_59": "✓ 2x" },
};

const DEFAULT_VIT_A_CACING = {
  vitA_biru: { diberikan: true, tanggal: "14/08/2026", batch: "A26-BLU", nakes: "Bidan Widya", status: "Sudah Diberikan" },
  vitA_merah_th1: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  vitA_merah_th2: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  vitA_merah_th3: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  vitA_merah_th4: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  vitA_merah_th5: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  cacing_th1: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  cacing_th2: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  cacing_th3: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  cacing_th4: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
  cacing_th5: { diberikan: false, tanggal: "", batch: "", nakes: "", status: "Belum" },
};

const DEFAULT_GIGI_RECORDS = [
  { bln: "9 M", tgl: "14/06/2026", ada: "2", lubang: "0", bersih: "✓", kotor: "", r: "Rendah" },
  { bln: "12 M", tgl: "14/09/2026", ada: "4", lubang: "0", bersih: "✓", kotor: "", r: "Rendah" },
  { bln: "18 M", tgl: "14/03/2027", ada: "8", lubang: "0", bersih: "✓", kotor: "", r: "Rendah" },
  { bln: "24 M", tgl: "14/09/2027", ada: "12", lubang: "1", bersih: "", kotor: "✓", r: "Sedang" },
  { bln: "30 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
  { bln: "36 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
  { bln: "42 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
  { bln: "48 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
  { bln: "54 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
  { bln: "60 M", tgl: "", ada: "", lubang: "", bersih: "", kotor: "", r: "" },
];

const DEFAULT_IMUNISASI_DATA = [
  { id: "hb0",         nama: "Hepatitis B (<24 Jam)",        target: [0],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [], pink: [], gray: [] },
  { id: "bcg",         nama: "BCG (Tuberkulosis)",            target: [1],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [2,3,4,5,6,7,8,9,10,11], pink: [], gray: [] },
  { id: "opv1",        nama: "Polio Tetes 1 (OPV 1)",        target: [1],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [2,3,4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [] },
  { id: "dpt1",        nama: "DPT-HB-Hib 1",                 target: [2],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [3,4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1] },
  { id: "opv2",        nama: "Polio Tetes 2 (OPV 2)",        target: [2],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [3,4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1] },
  { id: "rv1",         nama: "Rotavirus (RV) 1*",             target: [2],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [3,4,5], pink: [], gray: [0,1,6,7,8,9,10,11,12,13,14,15,16] },
  { id: "pcv1",        nama: "PCV 1 (Pneumokokus)",           target: [2],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [3,4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1] },
  { id: "dpt2",        nama: "DPT-HB-Hib 2",                 target: [3],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2] },
  { id: "opv3",        nama: "Polio Tetes 3 (OPV 3)",        target: [3],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2] },
  { id: "rv2",         nama: "Rotavirus (RV) 2*",             target: [3],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [4,5], pink: [], gray: [0,1,2,6,7,8,9,10,11,12,13,14,15,16] },
  { id: "pcv2",        nama: "PCV 2 (Pneumokokus)",           target: [3],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [4,5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2] },
  { id: "dpt3",        nama: "DPT-HB-Hib 3",                 target: [4],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2,3] },
  { id: "opv4",        nama: "Polio Tetes 4 (OPV 4)",        target: [4],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2,3] },
  { id: "ipv1",        nama: "Polio Suntik (IPV) 1",          target: [4],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [5,6,7,8,9,10,11], pink: [12,13,14,15,16], gray: [0,1,2,3] },
  { id: "rv3",         nama: "Rotavirus (RV) 3*",             target: [4],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [5,6], pink: [], gray: [0,1,2,3,7,8,9,10,11,12,13,14,15,16] },
  { id: "mr1",         nama: "Campak-Rubella (MR)",           target: [9],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [10,11], pink: [12,13,14,15,16], gray: [0,1,2,3,4,5,6,7,8] },
  { id: "ipv2",        nama: "Polio Suntik (IPV) 2*",         target: [9],  done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [10,11], pink: [12,13,14,15,16], gray: [0,1,2,3,4,5,6,7,8] },
  { id: "je",          nama: "*Japanese Encephalitis (JE)",   target: [10], done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [], pink: [11,12,13,14,15,16], gray: [0,1,2,3,4,5,6,7,8,9] },
  { id: "pcv3",        nama: "PCV 3 Lanjutan",                target: [12], done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [13,14], pink: [15,16], gray: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { id: "dpt_lanjut",  nama: "DPT-HB-Hib Lanjutan",          target: [13], done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [14], pink: [15,16], gray: [0,1,2,3,4,5,6,7,8,9,10,11,12] },
  { id: "mr2",         nama: "Campak Rubella Lanjutan",       target: [13], done: "", tgl: "", batch: "", nakes: "", status: "Belum", yellow: [14], pink: [15,16], gray: [0,1,2,3,4,5,6,7,8,9,10,11,12] },
];

function RekamMedisAnakContent() {
  const { username, role } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramChildId = searchParams?.get("child_id") || searchParams?.get("id");

  const [dbChildData, setDbChildData] = useState<any>(null);
  const [dbMeasurements, setDbMeasurements] = useState<any[]>([]);
  const [allChildrenList, setAllChildrenList] = useState<any[]>([]);
  const [motherChildren, setMotherChildren] = useState<any[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChildrenList() {
      try {
        const list = await getChildrenData();
        if (list && list.length > 0) {
          setAllChildrenList(list);
        }
      } catch (e) {
        console.error("Failed to load children list:", e);
      }
    }
    fetchChildrenList();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = allChildrenList.filter((c) => {
    const q = patientSearchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.national_id && c.national_id.toLowerCase().includes(q)) ||
      (c.mother && c.mother.toLowerCase().includes(q))
    );
  });

  const [activeTab, setActiveTab] = useState<"log_pelayanan_anak" | "log_imunisasi" | "neonatus" | "gizi" | "imunisasi_dasar">("log_pelayanan_anak");
  const [selectedKN, setSelectedKN] = useState<number>(0);
  const [selectedKategoriUsia, setSelectedKategoriUsia] = useState<"neonatus_28" | "bayi_1" | "anak_2" | "anak_3" | "anak_4" | "anak_5" | "anak_6">("neonatus_28");
  const [activeGiziSubTab, setActiveGiziSubTab] = useState<"matriks_gizi" | "vit_a" | "gigi">("matriks_gizi");
  const [activeCatatanSubTab, setActiveCatatanSubTab] = useState<"kronologis" | "sdidtk" | "lila" | "kms_0_2">("kronologis");

  const [kmsGenderFilter, setKmsGenderFilter] = useState<"P" | "L">("P");
  const [kmsChartMetric, setKmsChartMetric] = useState<"bb_0_2" | "bb_2_5" | "pb_0_2" | "tb_2_5" | "lk_0_5">("bb_0_2");
  const [kmsTableAgeGroup, setKmsTableAgeGroup] = useState<"0_2" | "2_5">("0_2");

  const [lilaRecords, setLilaRecords] = useState<Record<number, { val?: number; status?: string }>>({});

  // State Matriks Pelayanan yang Diterima (Neonatus & Tahunan) per Anak
  const [neonatusPelayananData, setNeonatusPelayananData] = useState<any>(DEFAULT_NEONATUS_PELAYANAN);
  const [tahunanPelayananData, setTahunanPelayananData] = useState<any>(DEFAULT_TAHUNAN_PELAYANAN);

  // Helper Format Date & Time for HTML5 Pickers
  const toInputDate = (str?: string) => {
    if (!str) return new Date().toISOString().split("T")[0];
    if (str.includes("/")) {
      const parts = str.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        if (y.length === 4) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    }
    if (str.includes("-") && str.length >= 10) return str.split("T")[0];
    return new Date().toISOString().split("T")[0];
  };

  const formatDisplayDate = (isoOrDashStr?: string) => {
    if (!isoOrDashStr) return "-";
    if (isoOrDashStr.includes("/")) return isoOrDashStr;
    const parts = isoOrDashStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    return isoOrDashStr;
  };

  const toInputTime = (str?: string) => {
    if (!str) return "08:00";
    const clean = str.replace("WIB", "").trim();
    const parts = clean.split(":");
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].slice(0, 2).padStart(2, "0")}`;
    }
    return "08:00";
  };

  // State Data Per-Fase Neonatus (0-6 Jam, KN1, KN2, KN3)
  const [neonatusFaseData, setNeonatusFaseData] = useState<any[]>(MOCK_NEONATUS_DATA);
  const [showEditFaseModal, setShowEditFaseModal] = useState<boolean>(false);
  const [editFaseForm, setEditFaseForm] = useState<any>({});

  const handleOpenEditFaseNeonatus = (knIndex: number) => {
    setSelectedKN(knIndex);
    const faseObj = neonatusFaseData[knIndex] || MOCK_NEONATUS_DATA[knIndex];
    setEditFaseForm({ ...faseObj });
    setShowEditFaseModal(true);
  };

  const handleSaveFaseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...neonatusFaseData];
    updated[selectedKN] = { ...editFaseForm };
    setNeonatusFaseData(updated);

    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`fase_neonatus_child_${childId}`, JSON.stringify(updated));
      await saveChildOfflineStateToDexie(childId, { faseNeonatus: updated });
      await setCacheItem(`fase_neonatus_child_${childId}`, updated);
    }

    showToast("success", "Berhasil Disimpan", `Data Fase ${updated[selectedKN]?.fase || "Neonatus"} berhasil diperbarui!`);
    setShowEditFaseModal(false);
  };

  // State & Handler Pelayanan Gizi (PMBA) per-Kolom Usia
  const [giziPmbaData, setGiziPmbaData] = useState<any>(DEFAULT_GIZI_PMBA);
  const [showEditGiziPmbaModal, setShowEditGiziPmbaModal] = useState<boolean>(false);
  const [selectedGiziColKey, setSelectedGiziColKey] = useState<string>("6_8");
  const [selectedGiziColLabel, setSelectedGiziColLabel] = useState<string>("6-8 Bln");
  const [editGiziPmbaForm, setEditGiziPmbaForm] = useState<any>({});

  const handleOpenEditGiziCol = (colKey: string, colLabel: string) => {
    setSelectedGiziColKey(colKey);
    setSelectedGiziColLabel(colLabel);
    setEditGiziPmbaForm(JSON.parse(JSON.stringify(giziPmbaData)));
    setShowEditGiziPmbaModal(true);
  };

  const handleSaveGiziPmbaEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGiziPmbaData(editGiziPmbaForm);
    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`gizi_pmba_child_${childId}`, JSON.stringify(editGiziPmbaForm));
      await saveChildOfflineStateToDexie(childId, { giziPmba: editGiziPmbaForm });
      await setCacheItem(`gizi_pmba_child_${childId}`, editGiziPmbaForm);
    }
    showToast("success", "Berhasil Disimpan", `Matriks Gizi Usia (${selectedGiziColLabel}) berhasil diperbarui!`);
    setShowEditGiziPmbaModal(false);
  };

  // State & Handler Vitamin A & Obat Cacing per-Kolom Usia
  const [vitAObatCacingData, setVitAObatCacingData] = useState<any>(DEFAULT_VIT_A_CACING);
  const [showEditVitAModal, setShowEditVitAModal] = useState<boolean>(false);
  const [selectedVitAColKey, setSelectedVitAColKey] = useState<string>("th1");
  const [selectedVitAColLabel, setSelectedVitAColLabel] = useState<string>("Tahun 1 - 2");
  const [editVitAForm, setEditVitAForm] = useState<any>({});

  const handleOpenEditVitACol = (colKey: string, colLabel: string) => {
    setSelectedVitAColKey(colKey);
    setSelectedVitAColLabel(colLabel);
    setEditVitAForm(JSON.parse(JSON.stringify(vitAObatCacingData)));
    setShowEditVitAModal(true);
  };

  const handleSaveVitAEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVitAObatCacingData(editVitAForm);
    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`vit_a_cacing_child_${childId}`, JSON.stringify(editVitAForm));
      await saveChildOfflineStateToDexie(childId, { vitACacing: editVitAForm });
      await setCacheItem(`vit_a_cacing_child_${childId}`, editVitAForm);
    }
    showToast("success", "Berhasil Disimpan", `Data Vitamin A & Cacing (${selectedVitAColLabel}) berhasil diperbarui!`);
    setShowEditVitAModal(false);
  };

  // State & Handler Catatan Kesehatan Gigi
  const [gigiRecordsData, setGigiRecordsData] = useState<any[]>(DEFAULT_GIGI_RECORDS);
  const [showEditGigiModal, setShowEditGigiModal] = useState<boolean>(false);
  const [selectedGigiIndex, setSelectedGigiIndex] = useState<number>(0);
  const [editGigiForm, setEditGigiForm] = useState<any>({});

  const handleOpenEditGigiModal = (rowObj: any, index: number) => {
    setSelectedGigiIndex(index);
    setEditGigiForm({ ...rowObj });
    setShowEditGigiModal(true);
  };

  const handleSaveGigiEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...gigiRecordsData];
    updated[selectedGigiIndex] = { ...editGigiForm };
    setGigiRecordsData(updated);

    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`gigi_records_child_${childId}`, JSON.stringify(updated));
      await saveChildOfflineStateToDexie(childId, { gigiRecords: updated });
      await setCacheItem(`gigi_records_child_${childId}`, updated);
    }

    showToast("success", "Berhasil Disimpan", `Catatan Kesehatan Gigi Usia ${updated[selectedGigiIndex]?.bln} berhasil diperbarui!`);
    setShowEditGigiModal(false);
  };

  // ─── State & Handlers: Imunisasi Dasar (Inline Cell Editing) ───
  const [imunisasiData, setImunisasiData] = useState<any[]>(DEFAULT_IMUNISASI_DATA);
  // editingImunisasiId: "<rowId>" when a cell is being inline-edited, null otherwise
  const [editingImunisasiId, setEditingImunisasiId] = useState<string | null>(null);
  const [inlineImunisasiForm, setInlineImunisasiForm] = useState<{ tgl: string; batch: string; nakes: string; status: string }>({ tgl: "", batch: "", nakes: "", status: "Tepat Jadwal" });

  const handleStartInlineImunisasi = (row: any) => {
    setEditingImunisasiId(row.id);
    setInlineImunisasiForm({
      tgl: row.tgl || row.done || "",
      batch: row.batch || "",
      nakes: row.nakes || "",
      status: (row.status && row.status !== "Belum") ? row.status : "Tepat Jadwal",
    });
  };

  const handleCancelInlineImunisasi = () => {
    setEditingImunisasiId(null);
  };

  const handleSaveInlineImunisasi = async (rowId: string) => {
    const idx = imunisasiData.findIndex((r) => r.id === rowId);
    if (idx === -1) return;
    const updated = [...imunisasiData];
    updated[idx] = {
      ...updated[idx],
      tgl: inlineImunisasiForm.tgl,
      done: inlineImunisasiForm.tgl,
      batch: inlineImunisasiForm.batch,
      nakes: inlineImunisasiForm.nakes,
      status: inlineImunisasiForm.tgl ? inlineImunisasiForm.status : "Belum",
    };
    setImunisasiData(updated);
    setEditingImunisasiId(null);

    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`imunisasi_data_child_${childId}`, JSON.stringify(updated));
      await saveChildOfflineStateToDexie(childId, { imunisasiData: updated });
      await setCacheItem(`imunisasi_data_child_${childId}`, updated);
    }
    showToast("success", "Berhasil Disimpan", `Imunisasi ${updated[idx]?.nama} berhasil diperbarui!`);
  };


  // Handler Column-based Edit for Pelayanan Neonatus

  const [showEditPelayananNeonatusColModal, setShowEditPelayananNeonatusColModal] = useState<boolean>(false);
  const [selectedPelayananNeonatusColKey, setSelectedPelayananNeonatusColKey] = useState<string>("k1");
  const [selectedPelayananNeonatusColLabel, setSelectedPelayananNeonatusColLabel] = useState<string>("0 - 6 Jam");
  const [editPelayananNeonatusColForm, setEditPelayananNeonatusColForm] = useState<any>({});

  const handleOpenEditPelayananKolomNeonatus = (colKey: string, colLabel: string) => {
    setSelectedPelayananNeonatusColKey(colKey);
    setSelectedPelayananNeonatusColLabel(colLabel);
    setEditPelayananNeonatusColForm(JSON.parse(JSON.stringify(neonatusPelayananData)));
    setShowEditPelayananNeonatusColModal(true);
  };

  const handleSavePelayananNeonatusColEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNeonatusPelayananData(editPelayananNeonatusColForm);
    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`pelayanan_neonatus_child_${childId}`, JSON.stringify(editPelayananNeonatusColForm));
      await saveChildOfflineStateToDexie(childId, { pelayananNeonatus: editPelayananNeonatusColForm });
      await setCacheItem(`pelayanan_neonatus_child_${childId}`, editPelayananNeonatusColForm);
    }
    showToast("success", "Berhasil Disimpan", `Pelayanan ${selectedPelayananNeonatusColLabel} berhasil diperbarui!`);
    setShowEditPelayananNeonatusColModal(false);
  };

  // Handler Column-based Edit for Pelayanan Tahunan
  const [showEditPelayananTahunanColModal, setShowEditPelayananTahunanColModal] = useState<boolean>(false);
  const [selectedPelayananTahunanIndex, setSelectedPelayananTahunanIndex] = useState<number>(0);
  const [selectedPelayananTahunanKatUsia, setSelectedPelayananTahunanKatUsia] = useState<string>("bayi_1");
  const [editPelayananTahunanColForm, setEditPelayananTahunanColForm] = useState<any>({});

  const handleOpenEditPelayananKolomTahunan = (visitIndex: number, katUsia: string) => {
    setSelectedPelayananTahunanIndex(visitIndex);
    setSelectedPelayananTahunanKatUsia(katUsia);
    setEditPelayananTahunanColForm(JSON.parse(JSON.stringify(tahunanPelayananData)));
    setShowEditPelayananTahunanColModal(true);
  };

  const handleSavePelayananTahunanColEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTahunanPelayananData(editPelayananTahunanColForm);
    if (dbChildData?.child_id) {
      const childId = dbChildData.child_id;
      localStorage.setItem(`pelayanan_tahunan_child_${childId}`, JSON.stringify(editPelayananTahunanColForm));
      await saveChildOfflineStateToDexie(childId, { pelayananTahunan: editPelayananTahunanColForm });
      await setCacheItem(`pelayanan_tahunan_child_${childId}`, editPelayananTahunanColForm);
    }
    showToast("success", "Berhasil Disimpan", `Pelayanan Kunjungan ${selectedPelayananTahunanIndex + 1} berhasil diperbarui!`);
    setShowEditPelayananTahunanColModal(false);
  };

  const [showEditPelayananModal, setShowEditPelayananModal] = useState<boolean>(false);
  const [editPelayananTarget, setEditPelayananTarget] = useState<{
    type: "neonatus" | "tahunan";
    itemKey: string;
    itemLabel: string;
    katUsia?: string;
  } | null>(null);
  const [editPelayananForm, setEditPelayananForm] = useState<any>({});

  const handleOpenEditPelayanan = (type: "neonatus" | "tahunan", itemKey: string, itemLabel: string, katUsia?: string) => {
    setEditPelayananTarget({ type, itemKey, itemLabel, katUsia });
    if (type === "neonatus") {
      if (itemKey === "header_dates") {
        setEditPelayananForm({ ...(neonatusPelayananData.headerDates || DEFAULT_NEONATUS_PELAYANAN.headerDates) });
      } else if (itemKey === "triple") {
        setEditPelayananForm({ ...(neonatusPelayananData.items?.triple || DEFAULT_NEONATUS_PELAYANAN.items.triple) });
      } else {
        setEditPelayananForm({ ...(neonatusPelayananData.items?.[itemKey] || DEFAULT_NEONATUS_PELAYANAN.items[itemKey as keyof typeof DEFAULT_NEONATUS_PELAYANAN.items] || {}) });
      }
    } else {
      const kat = katUsia || selectedKategoriUsia;
      const dataCat = tahunanPelayananData[kat] || DEFAULT_TAHUNAN_PELAYANAN[kat] || DEFAULT_TAHUNAN_PELAYANAN.bayi_1;
      if (itemKey === "header_visits") {
        setEditPelayananForm({ visits: dataCat.visits ? [...dataCat.visits] : Array.from({ length: 8 }, () => ({ date: "-", place: "-" })) });
      } else if (itemKey === "triple") {
        setEditPelayananForm({ triple: dataCat.triple || "Non-Reaktif (3 Parameter)" });
      } else {
        setEditPelayananForm({ list: dataCat.items[itemKey] ? [...dataCat.items[itemKey]] : Array(8).fill("-") });
      }
    }
    setShowEditPelayananModal(true);
  };

  const handleSavePelayananEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbChildData?.child_id) {
      showToast("warning", "Pilihan Pasien", "Harap pilih balita terlebih dahulu.");
      return;
    }
    const childId = dbChildData.child_id;
    if (!editPelayananTarget) return;

    const { type, itemKey, katUsia } = editPelayananTarget;

    if (type === "neonatus") {
      const updated = { ...neonatusPelayananData };
      if (!updated.headerDates) updated.headerDates = { ...DEFAULT_NEONATUS_PELAYANAN.headerDates };
      if (!updated.items) updated.items = { ...DEFAULT_NEONATUS_PELAYANAN.items };

      if (itemKey === "header_dates") {
        updated.headerDates = { ...editPelayananForm };
      } else if (itemKey === "triple") {
        updated.items.triple = { ...editPelayananForm };
      } else {
        updated.items[itemKey] = { ...updated.items[itemKey], ...editPelayananForm };
      }
      setNeonatusPelayananData(updated);
      localStorage.setItem(`pelayanan_neonatus_child_${childId}`, JSON.stringify(updated));
      saveChildOfflineStateToDexie(childId, { neonatus: updated });
    } else {
      const kat = katUsia || selectedKategoriUsia;
      const updatedAll = { ...tahunanPelayananData };
      const dataCat = updatedAll[kat] ? { ...updatedAll[kat] } : { ...DEFAULT_TAHUNAN_PELAYANAN[kat] };
      dataCat.items = { ...dataCat.items };

      if (itemKey === "header_visits") {
        dataCat.visits = editPelayananForm.visits;
      } else if (itemKey === "triple") {
        dataCat.triple = editPelayananForm.triple;
      } else {
        dataCat.items[itemKey] = editPelayananForm.list;
      }
      updatedAll[kat] = dataCat;
      setTahunanPelayananData(updatedAll);
      localStorage.setItem(`pelayanan_tahunan_child_${childId}`, JSON.stringify(updatedAll));
      saveChildOfflineStateToDexie(childId, { tahunan: updatedAll });
    }

    setShowEditPelayananModal(false);
  };

  // Toast Notification State & Handler
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
  }>({
    show: false,
    type: "info",
    title: "",
    message: ""
  });

  const showToast = (type: "success" | "error" | "info" | "warning", title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // State Log Catatan Pelayanan Kesehatan Khusus Nakes
  const [nakesLogs, setNakesLogs] = useState<any[]>([]);

  const [showAddNakesLogModal, setShowAddNakesLogModal] = useState<boolean>(false);
  const [newNakesLogForm, setNewNakesLogForm] = useState({
    tanggalPeriksa: new Date().toISOString().split("T")[0],
    nakesName: "Bidan Widya, A.Md.Keb",
    keluhanTindakanSaran: "",
    tanggalKembali: ""
  });

  // State Modal Tambah Antropometri Balita (BB / TB / LK) khusus Nakes
  const [showAddAntropometriModal, setShowAddAntropometriModal] = useState<boolean>(false);
  const [newAntropometriForm, setNewAntropometriForm] = useState({
    tanggalPeriksa: new Date().toISOString().split("T")[0],
    beratBadan: "",
    tinggiBadan: "",
    lingkarKepala: "",
    lingkarLengan: "",
    catatan: ""
  });

  const handleSaveAntropometri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbChildData?.child_id) {
      showToast("warning", "Pilihan Pasien", "Harap pilih pasien balita terlebih dahulu.");
      return;
    }

    const bb = parseFloat(newAntropometriForm.beratBadan);
    const tb = parseFloat(newAntropometriForm.tinggiBadan);
    const lk = parseFloat(newAntropometriForm.lingkarKepala);
    const lila = parseFloat(newAntropometriForm.lingkarLengan);

    if (isNaN(bb) && isNaN(tb) && isNaN(lk) && isNaN(lila)) {
      showToast("warning", "Peringatan", "Harap isi setidaknya salah satu nilai pengukuran.");
      return;
    }

    try {
      const res = await createChildMeasurement({
        child_id: dbChildData.child_id,
        visit_date: newAntropometriForm.tanggalPeriksa,
        weight: isNaN(bb) ? null : bb,
        height: isNaN(tb) ? null : tb,
        head_circumference: isNaN(lk) ? null : lk,
        muac: isNaN(lila) ? null : lila,
        notes: newAntropometriForm.catatan || "[Pemeriksaan Antropometri Nakes]"
      });

      if (res.success) {
        showToast("success", "Berhasil Disimpan", "Pengukuran Antropometri berhasil disimpan ke database!");
        const refreshed = await getChildDetail(dbChildData.child_id);
        if (refreshed) {
          setDbChildData(refreshed);
          if (refreshed.measurements) setDbMeasurements(refreshed.measurements);
        }
      } else {
        showToast("error", "Gagal Menyimpan", res.error);
      }
    } catch (err) {
      console.error("Error saving measurement:", err);
      showToast("error", "Kesalahan Sistem", "Terjadi kesalahan saat menyimpan data.");
    }

    setShowAddAntropometriModal(false);
    setNewAntropometriForm({
      tanggalPeriksa: new Date().toISOString().split("T")[0],
      beratBadan: "",
      tinggiBadan: "",
      lingkarKepala: "",
      lingkarLengan: "",
      catatan: ""
    });
  };

  // State Modal Edit Data Pertumbuhan (Tabel BB/PB per Bulan)
  const [showEditKmsRowModal, setShowEditKmsRowModal] = useState<boolean>(false);
  const [editKmsRowForm, setEditKmsRowForm] = useState({
    measurement_id: null as string | null,
    usiaBulan: 0,
    tanggalPeriksa: new Date().toISOString().split("T")[0],
    beratBadan: "",
    tinggiBadan: "",
    lingkarKepala: "",
    catatan: ""
  });

  const findMeasurementForMonth = (monthNum: number) => {
    // 1. Check tagged measurement first (highest priority)
    const tagged = dbMeasurements.find((x: any) =>
      x.cadre_notes && x.cadre_notes.includes(`[Pengukuran KMS Usia ${monthNum} Bulan]`)
    );

    if (tagged) {
      return {
        measurement_id: tagged.measurement_id || null,
        weight: tagged.weight !== undefined && tagged.weight !== null ? tagged.weight : null,
        height: tagged.height !== undefined && tagged.height !== null ? tagged.height : null,
        head_circumference: tagged.head_circumference || null,
        cadre_notes: tagged.cadre_notes || tagged.notes || "",
        visit_date: tagged.visit_date ? tagged.visit_date.split("T")[0] : (tagged.dateRaw || new Date().toISOString().split("T")[0])
      };
    }

    if (monthNum === 0 && (dbChildData?.birth_weight || dbChildData?.birth_length)) {
      const m = dbMeasurements.find((x: any) =>
        (x.ageAtVisit !== undefined && x.ageAtVisit === 0) ||
        (x.rawAge !== undefined && x.rawAge === 0) ||
        (x.usiaBulan !== undefined && x.usiaBulan === 0)
      );
      return {
        measurement_id: m?.measurement_id || null,
        weight: m?.weight !== undefined && m?.weight !== null ? m.weight : dbChildData?.birth_weight || null,
        height: m?.height !== undefined && m?.height !== null ? m.height : dbChildData?.birth_length || null,
        head_circumference: m?.head_circumference || null,
        cadre_notes: m?.cadre_notes || m?.notes || "",
        visit_date: m?.visit_date ? m.visit_date.split("T")[0] : new Date().toISOString().split("T")[0]
      };
    }

    const m = dbMeasurements.find((x: any) =>
      (x.ageAtVisit !== undefined && x.ageAtVisit === monthNum) ||
      (x.rawAge !== undefined && x.rawAge === monthNum) ||
      (x.usiaBulan !== undefined && x.usiaBulan === monthNum)
    );

    if (!m) return null;

    return {
      measurement_id: m.measurement_id || null,
      weight: m.weight !== undefined && m.weight !== null ? m.weight : null,
      height: m.height !== undefined && m.height !== null ? m.height : null,
      head_circumference: m.head_circumference || null,
      cadre_notes: m.cadre_notes || m.notes || "",
      visit_date: m.visit_date ? m.visit_date.split("T")[0] : (m.dateRaw || new Date().toISOString().split("T")[0])
    };
  };

  const handleSelectMonthInModal = (selectedMonth: number) => {
    const existing = findMeasurementForMonth(selectedMonth);
    setEditKmsRowForm({
      measurement_id: existing?.measurement_id || null,
      usiaBulan: selectedMonth,
      tanggalPeriksa: existing?.visit_date || new Date().toISOString().split("T")[0],
      beratBadan: existing?.weight !== null && existing?.weight !== undefined ? String(existing.weight) : "",
      tinggiBadan: existing?.height !== null && existing?.height !== undefined ? String(existing.height) : "",
      lingkarKepala: existing?.head_circumference !== null && existing?.head_circumference !== undefined ? String(existing.head_circumference) : "",
      catatan: existing?.cadre_notes ? existing.cadre_notes.replace(/\[Pengukuran KMS Usia \d+ Bulan\]/g, "").trim() : ""
    });
  };

  const handleOpenEditKmsRow = (monthNum: number, currentBB: number | null, currentPB: number | null, dbMatch?: any) => {
    handleSelectMonthInModal(monthNum);
    setShowEditKmsRowModal(true);
  };

  const handleSaveEditKmsRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbChildData?.child_id) {
      showToast("warning", "Pilihan Pasien", "Harap pilih balita terlebih dahulu.");
      return;
    }

    const parseInput = (val: string) => {
      if (!val || val.trim() === "" || val.trim() === "—") return NaN;
      return parseFloat(val.replace(',', '.'));
    };

    const bb = parseInput(editKmsRowForm.beratBadan);
    const tb = parseInput(editKmsRowForm.tinggiBadan);
    const lk = parseInput(editKmsRowForm.lingkarKepala);

    if (isNaN(bb) && isNaN(tb) && isNaN(lk)) {
      showToast("warning", "Peringatan", "Harap isi setidaknya salah satu nilai pengukuran (Berat/Panjang Badan).");
      return;
    }

    try {
      const noteTag = editKmsRowForm.catatan
        ? `${editKmsRowForm.catatan} [Pengukuran KMS Usia ${editKmsRowForm.usiaBulan} Bulan]`
        : `[Pengukuran KMS Usia ${editKmsRowForm.usiaBulan} Bulan]`;

      // 1. Save to Dexie.js (IndexedDB) for offline resilience
      await saveChildMeasurementToDexie({
        child_id: dbChildData.child_id,
        visit_date: editKmsRowForm.tanggalPeriksa,
        weight_kg: isNaN(bb) ? undefined : bb,
        height_cm: isNaN(tb) ? undefined : tb,
        head_circ_cm: isNaN(lk) ? undefined : lk,
        notes: noteTag
      });

      // 2. Call Server Action to persist in Supabase / Prisma DB
      const res = await createChildMeasurement({
        child_id: dbChildData.child_id,
        measurement_id: editKmsRowForm.measurement_id || undefined,
        usiaBulan: editKmsRowForm.usiaBulan,
        visit_date: editKmsRowForm.tanggalPeriksa,
        weight: isNaN(bb) ? null : bb,
        height: isNaN(tb) ? null : tb,
        head_circumference: isNaN(lk) ? null : lk,
        notes: noteTag
      });

      // 3. Construct local measurement object for instant UI update
      const newMeasurementObj = {
        measurement_id: res.id || editKmsRowForm.measurement_id || `local_${Date.now()}`,
        child_id: dbChildData.child_id,
        visit_date: editKmsRowForm.tanggalPeriksa,
        weight: isNaN(bb) ? null : bb,
        height: isNaN(tb) ? null : tb,
        head_circumference: isNaN(lk) ? null : lk,
        cadre_notes: noteTag,
        ageAtVisit: editKmsRowForm.usiaBulan,
        rawAge: editKmsRowForm.usiaBulan,
        usiaBulan: editKmsRowForm.usiaBulan,
      };

      setDbMeasurements(prev => {
        const filtered = prev.filter(m => {
          if (m.measurement_id && editKmsRowForm.measurement_id && m.measurement_id === editKmsRowForm.measurement_id) return false;
          if (m.cadre_notes && m.cadre_notes.includes(`[Pengukuran KMS Usia ${editKmsRowForm.usiaBulan} Bulan]`)) return false;
          const age = m.ageAtVisit ?? m.rawAge ?? m.usiaBulan;
          if (age === editKmsRowForm.usiaBulan) return false;
          return true;
        });
        return [newMeasurementObj, ...filtered];
      });

      showToast("success", "Berhasil Disimpan", `Data Pertumbuhan Usia ${editKmsRowForm.usiaBulan} Bulan berhasil diperbarui!`);

      // 4. Refresh full details from DB if available with safe fallback merge
      const refreshed = await getChildDetail(dbChildData.child_id);
      if (refreshed) {
        setDbChildData(refreshed);
        if (refreshed.measurements && Array.isArray(refreshed.measurements)) {
          setDbMeasurements(prev => {
            const freshList = [...refreshed.measurements];
            const existsInFresh = freshList.some(x =>
              (x.cadre_notes && x.cadre_notes.includes(`[Pengukuran KMS Usia ${editKmsRowForm.usiaBulan} Bulan]`)) ||
              (x.usiaBulan !== undefined && x.usiaBulan === editKmsRowForm.usiaBulan) ||
              (x.ageAtVisit !== undefined && x.ageAtVisit === editKmsRowForm.usiaBulan)
            );
            if (!existsInFresh) {
              return [newMeasurementObj, ...freshList];
            }
            return freshList;
          });
        }
      }

      setShowEditKmsRowModal(false);
    } catch (err: any) {
      console.error("Error saving KMS row:", err);
      showToast("error", "Kesalahan Sistem", "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const [editingNakesLogId, setEditingNakesLogId] = useState<string | null>(null);

  const handleEditNakesLog = (log: any) => {
    setEditingNakesLogId(log.id);
    setNewNakesLogForm({
      tanggalPeriksa: log.tanggalPeriksaRaw || new Date().toISOString().split("T")[0],
      nakesName: log.nakesName || "Bidan Widya, A.Md.Keb",
      keluhanTindakanSaran: log.keluhanTindakanSaran || "",
      tanggalKembali: log.tanggalKembaliRaw || ""
    });
    setShowAddNakesLogModal(true);
  };

  const [deleteConfirmLogId, setDeleteConfirmLogId] = useState<string | null>(null);

  const handleDeleteNakesLog = (logId: string) => {
    setDeleteConfirmLogId(logId);
  };

  const confirmDeleteNakesLog = async () => {
    if (!deleteConfirmLogId) return;
    const updated = nakesLogs.filter((l) => l.id !== deleteConfirmLogId);
    setNakesLogs(updated);
    if (dbChildData?.child_id) {
      await setCacheItem(`nakes_clinical_logs_child_${dbChildData.child_id}`, updated);
    }
    setDeleteConfirmLogId(null);
  };

  const handleSaveNakesLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNakesLogForm.keluhanTindakanSaran) {
      alert("Harap isi keluhan, hasil pemeriksaan, tindakan, dan saran.");
      return;
    }

    const dateFormatted = new Date(newNakesLogForm.tanggalPeriksa).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
    const nextDateFormatted = newNakesLogForm.tanggalKembali 
      ? new Date(newNakesLogForm.tanggalKembali).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
      : "-";

    const childId = dbChildData?.child_id;

    if (editingNakesLogId) {
      const updated = nakesLogs.map((l) =>
        l.id === editingNakesLogId
          ? {
              ...l,
              tanggalPeriksa: dateFormatted,
              tanggalPeriksaRaw: newNakesLogForm.tanggalPeriksa,
              nakesName: newNakesLogForm.nakesName || "Bidan Widya, A.Md.Keb",
              keluhanTindakanSaran: newNakesLogForm.keluhanTindakanSaran,
              tanggalKembali: nextDateFormatted,
              tanggalKembaliRaw: newNakesLogForm.tanggalKembali
            }
          : l
      );
      setNakesLogs(updated);
      if (childId) {
        await setCacheItem(`nakes_clinical_logs_child_${childId}`, updated);
      }
      setEditingNakesLogId(null);
    } else {
      const newEntry = {
        id: "nakes-log-" + Date.now(),
        tanggalPeriksa: dateFormatted,
        tanggalPeriksaRaw: newNakesLogForm.tanggalPeriksa,
        nakesName: newNakesLogForm.nakesName || "Bidan Widya, A.Md.Keb",
        keluhanTindakanSaran: newNakesLogForm.keluhanTindakanSaran,
        tanggalKembali: nextDateFormatted,
        tanggalKembaliRaw: newNakesLogForm.tanggalKembali
      };

      const updated = [newEntry, ...nakesLogs];
      setNakesLogs(updated);
      try {
        if (childId) {
          await setCacheItem(`nakes_clinical_logs_child_${childId}`, updated);
          await createChildMeasurement({
            child_id: childId,
            visit_date: newNakesLogForm.tanggalPeriksa,
            notes: `[Catatan Nakes ${newNakesLogForm.nakesName}] ${newNakesLogForm.keluhanTindakanSaran}`
          });
        }
      } catch (err) {
        console.error("Failed to save nakes log to DB:", err);
      }
    }

    setShowAddNakesLogModal(false);
    setNewNakesLogForm({
      tanggalPeriksa: new Date().toISOString().split("T")[0],
      nakesName: "Bidan Widya, A.Md.Keb",
      keluhanTindakanSaran: "",
      tanggalKembali: ""
    });
  };

  // State Matrix SDIDTK Interaktif Nakes (Dropdown BB/U, BB/TB, TB/U, LK/U, KPSP, TDD, TDL, PKAT)
  const [sdidtkMatrixData, setSdidtkMatrixData] = useState<Record<number, any>>({});
  const [sdidtkGreenChecks, setSdidtkGreenChecks] = useState<Record<number, boolean>>({});

  const handleUpdateMatrixCell = async (month: number, field: string, value: string) => {
    const updated = {
      ...sdidtkMatrixData,
      [month]: {
        ...(sdidtkMatrixData[month] || {}),
        [field]: value
      }
    };
    setSdidtkMatrixData(updated);
    if (dbChildData?.child_id) {
      await setCacheItem(`sdidtk_matrix_data_child_${dbChildData.child_id}`, updated);
    }
  };

  const formatDateString = (inputVal: string) => {
    const digits = inputVal.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleToggleGreenCheck = async (month: number) => {
    const updated = {
      ...sdidtkGreenChecks,
      [month]: !sdidtkGreenChecks[month]
    };
    setSdidtkGreenChecks(updated);
    if (dbChildData?.child_id) {
      await setCacheItem(`sdidtk_green_checks_child_${dbChildData.child_id}`, updated);
    }
  };

  const renderSelectCell = (
    monthNum: number,
    field: string,
    val: string,
    options: { value: string; label: string }[]
  ) => {
    const isSelected = !!val && val !== "—" && val !== "-";
    return (
      <td className="p-0.5 border-r border-gray-900">
        <select
          value={val || ""}
          onChange={(e) => handleUpdateMatrixCell(monthNum, field, e.target.value)}
          className={`w-full text-[10px] font-black py-1 px-0.5 rounded outline-none transition cursor-pointer text-center ${
            isSelected
              ? "bg-emerald-600 text-white font-extrabold shadow-2xs"
              : "bg-white text-gray-700 hover:bg-gray-100 font-bold"
          }`}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-gray-900 font-bold">
              {opt.value} - {opt.label}
            </option>
          ))}
        </select>
      </td>
    );
  };

  const [showAddLilaModal, setShowAddLilaModal] = useState<boolean>(false);
  const [editingLilaMonth, setEditingLilaMonth] = useState<number | null>(null);
  const [newLilaForm, setNewLilaForm] = useState({
    usiaBulan: "1",
    valCm: "",
    tanggalPeriksa: new Date().toISOString().split("T")[0]
  });

  const handleOpenAddLilaModal = () => {
    setEditingLilaMonth(null);
    let availableMonth = 1;
    for (let m = 1; m <= 60; m++) {
      if (!lilaRecords[m]) {
        availableMonth = m;
        break;
      }
    }
    setNewLilaForm({
      usiaBulan: availableMonth.toString(),
      valCm: "",
      tanggalPeriksa: new Date().toISOString().split("T")[0]
    });
    setShowAddLilaModal(true);
  };

  const handleEditLilaRecord = (monthNum: number) => {
    const existing = lilaRecords[monthNum];
    setEditingLilaMonth(monthNum);
    setNewLilaForm({
      usiaBulan: monthNum.toString(),
      valCm: existing?.val ? existing.val.toString() : "",
      tanggalPeriksa: new Date().toISOString().split("T")[0]
    });
    setShowAddLilaModal(true);
  };

  const handleSaveLilaRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthNum = parseInt(newLilaForm.usiaBulan, 10);
    const val = parseFloat(newLilaForm.valCm);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 60 || isNaN(val) || val <= 0) {
      alert("Harap masukkan angka usia bulan (1-60) dan nilai LiLA yang valid.");
      return;
    }

    const updated = {
      ...lilaRecords,
      [monthNum]: { val, status: val >= 12.5 ? "baik" : val >= 11.5 ? "kurang" : "buruk" }
    };
    setLilaRecords(updated);
    try {
      const childId = dbChildData?.child_id;
      if (childId) {
        await setCacheItem(`lila_records_child_${childId}`, updated);
        await saveChildMeasurementToDexie({
          child_id: childId,
          visit_date: newLilaForm.tanggalPeriksa,
          muac_cm: val,
          notes: `[Pengukuran LiLA Nakes - Usia ${monthNum} Bulan] LiLA: ${val} cm`
        });
        await createChildMeasurement({
          child_id: childId,
          visit_date: newLilaForm.tanggalPeriksa,
          muac: val,
          notes: `[Pengukuran LiLA Nakes - Usia ${monthNum} Bulan] LiLA: ${val} cm`
        });
      }
    } catch (err) {
      console.error("Failed to save LiLA to DB:", err);
    }

    setShowAddLilaModal(false);
    setEditingLilaMonth(null);
  };

  // Sync child-specific local storage states whenever selected child changes
  // State isian interaktif kolom kuning SDIDTK (Bulan 1 s/d 60) untuk Ibu/Kader/Guru PAUD
  const [yellowStatuses, setYellowStatuses] = useState<Record<number, "L" | "TL" | null>>({
    1: "L", 2: "L", 3: "L", 4: "L", 5: "L", 6: "L", 7: "L", 8: "L", 9: "L"
  });

  // Sync child-specific Dexie.js (IndexedDB) states whenever selected child changes
  useEffect(() => {
    async function loadIsolatedChildData() {
      if (!dbChildData?.child_id) {
        setNakesLogs([]);
        setLilaRecords({});
        setYellowStatuses({});
        setSdidtkMatrixData({});
        setSdidtkGreenChecks({});
        return;
      }

      const childId = dbChildData.child_id;
      if (dbChildData.name || dbChildData.child_name) {
        setPatientSearchTerm(dbChildData.name || dbChildData.child_name);
      }

      try {
        const [savedLogs, savedLila, savedSdidtk, savedMatrix, savedGreen, savedPelayananNeonatus, savedPelayananTahunan, savedFaseNeonatus, savedGiziPmba, savedVitACacing, savedGigiRecords, savedImunisasiData] = await Promise.all([
          getCacheItem(`nakes_clinical_logs_child_${childId}`),
          getCacheItem(`lila_records_child_${childId}`),
          getCacheItem(`sdidtk_records_child_${childId}`),
          getCacheItem(`sdidtk_matrix_data_child_${childId}`),
          getCacheItem(`sdidtk_green_checks_child_${childId}`),
          getCacheItem(`pelayanan_neonatus_child_${childId}`),
          getCacheItem(`pelayanan_tahunan_child_${childId}`),
          getCacheItem(`fase_neonatus_child_${childId}`),
          getCacheItem(`gizi_pmba_child_${childId}`),
          getCacheItem(`vit_a_cacing_child_${childId}`),
          getCacheItem(`gigi_records_child_${childId}`),
          getCacheItem(`imunisasi_data_child_${childId}`)
        ]);

        if (savedLogs) setNakesLogs(savedLogs);
        else {
          setNakesLogs([
            {
              id: `nakes-log-${childId}-1`,
              tanggalPeriksa: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              nakesName: "Bidan Widya, A.Md.Keb",
              keluhanTindakanSaran: `Pemeriksaan Rutin Rekam Medis Anak (${dbChildData.name || dbChildData.child_name || "Balita"}). Kondisi fisik umum aktif, refleks memuaskan, pertumbuhan terpantau sesuai kurva WHO.`,
              tanggalKembali: "-"
            }
          ]);
        }

        if (savedLila) setLilaRecords(savedLila);
        else {
          const syncedLila: Record<number, { val?: number; status?: string }> = {};
          if (dbChildData.measurements && dbChildData.measurements.length > 0) {
            dbChildData.measurements.forEach((m: any) => {
              if (m.muac && (m.ageAtVisit !== undefined || m.rawAge !== undefined)) {
                const age = m.ageAtVisit ?? m.rawAge;
                syncedLila[age] = {
                  val: Number(m.muac),
                  status: Number(m.muac) >= 12.5 ? "baik" : Number(m.muac) >= 11.5 ? "kurang" : "buruk"
                };
              }
            });
          }
          setLilaRecords(syncedLila);
        }

        if (savedSdidtk) setYellowStatuses(savedSdidtk);
        else setYellowStatuses({ 1: "L", 2: "L", 3: "L", 6: "L" });

        if (savedMatrix) setSdidtkMatrixData(savedMatrix);
        else setSdidtkMatrixData({
          3: { bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "Ds", tdd: "N", tdl: "N", pkat: "✓", tindak: "Stimulasi di rumah", ulang: "14/10/2026" },
          6: { bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "Ds", tdd: "N", tdl: "N", pkat: "✓", tindak: "Lanjutkan Stimulasi", ulang: "14/01/2027" },
          9: { bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "Ds", tdd: "N", tdl: "N", pkat: "✓", tindak: "KIE Gizi Seimbang", ulang: "14/04/2027" }
        });

        if (savedGreen) setSdidtkGreenChecks(savedGreen);
        else setSdidtkGreenChecks({ 3: true, 6: true, 9: true });

        if (savedPelayananNeonatus) setNeonatusPelayananData(savedPelayananNeonatus);
        else setNeonatusPelayananData(DEFAULT_NEONATUS_PELAYANAN);

        if (savedPelayananTahunan) setTahunanPelayananData(savedPelayananTahunan);
        else setTahunanPelayananData(DEFAULT_TAHUNAN_PELAYANAN);

        if (savedFaseNeonatus) {
          setNeonatusFaseData(savedFaseNeonatus);
        } else {
          const localLs = localStorage.getItem(`fase_neonatus_child_${childId}`);
          if (localLs) {
            try {
              setNeonatusFaseData(JSON.parse(localLs));
            } catch (err) {
              populateDefaultFaseFromDb();
            }
          } else {
            populateDefaultFaseFromDb();
          }
        }

        if (savedGiziPmba) setGiziPmbaData(savedGiziPmba);
        else {
          const lsGizi = localStorage.getItem(`gizi_pmba_child_${childId}`);
          if (lsGizi) {
            try { setGiziPmbaData(JSON.parse(lsGizi)); } catch (e) { setGiziPmbaData(DEFAULT_GIZI_PMBA); }
          } else { setGiziPmbaData(DEFAULT_GIZI_PMBA); }
        }

        if (savedVitACacing) setVitAObatCacingData(savedVitACacing);
        else {
          const lsVit = localStorage.getItem(`vit_a_cacing_child_${childId}`);
          if (lsVit) {
            try { setVitAObatCacingData(JSON.parse(lsVit)); } catch (e) { setVitAObatCacingData(DEFAULT_VIT_A_CACING); }
          } else { setVitAObatCacingData(DEFAULT_VIT_A_CACING); }
        }

        if (savedGigiRecords) setGigiRecordsData(savedGigiRecords);
        else {
          const lsGigi = localStorage.getItem(`gigi_records_child_${childId}`);
          if (lsGigi) {
            try { setGigiRecordsData(JSON.parse(lsGigi)); } catch (e) { setGigiRecordsData(DEFAULT_GIGI_RECORDS); }
          } else { setGigiRecordsData(DEFAULT_GIGI_RECORDS); }
        }

        if (savedImunisasiData) setImunisasiData(savedImunisasiData);
        else {
          const lsImunisasi = localStorage.getItem(`imunisasi_data_child_${childId}`);
          if (lsImunisasi) {
            try { setImunisasiData(JSON.parse(lsImunisasi)); } catch (e) { setImunisasiData(DEFAULT_IMUNISASI_DATA); }
          } else { setImunisasiData(DEFAULT_IMUNISASI_DATA); }
        }

        function populateDefaultFaseFromDb() {
          const rawW = dbChildData?.birth_weight || dbChildData?.weight;
          const birthWeight = rawW ? (Number(rawW) < 100 ? Math.round(Number(rawW) * 1000) : Math.round(Number(rawW))) : 3200;
          const birthLength = dbChildData?.birth_length || dbChildData?.height || 50;
          const dobRaw = dbChildData?.date_of_birth || dbChildData?.birth_date;
          const birthDateStr = dobRaw ? new Date(dobRaw).toLocaleDateString("id-ID") : "14/09/2026";

          setNeonatusFaseData([
            { fase: "0 - 6 Jam", tanggal: birthDateStr, jam: "05:00", batch: "B26-HB0", bb: birthWeight, pb: birthLength, lk: 34, imd: "✓ Ya", vitK: "✓ Ya", salepMata: "✓ Ya", hb0: "✓ Ya", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Tidak ada, kondisi stabil", rujukan: "-", nakes: "Bidan Widya" },
            { fase: "6 - 48 Jam (KN 1)", tanggal: birthDateStr, jam: "10:00", batch: "B26-VITK", bb: Math.round(birthWeight * 0.98), pb: birthLength, lk: 34, menyusu: "✓ Aktif", taliPusat: "✓ Bersih/Normal", vitK: "✓ Ya", salepMata: "✓ Ya", hb0: "✓ Ya", shk: "Dilakukan (Sampel Darah Tumit)", pjbKritis: "Lolos (Saturasi 98%)", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Penurunan BB fisiologis normal", rujukan: "-", nakes: "Bidan Widya" },
            { fase: "3 - 7 Hari (KN 2)", tanggal: birthDateStr, jam: "09:00", batch: "-", bb: Math.round(birthWeight * 1.02), pb: birthLength, lk: 34.2, menyusu: "✓ Kuat", taliPusat: "✓ Kering/Hampir Puput", tandaBahaya: "❌ Tidak Ada", ikterus: "❌ Tidak Kuning", hb0: "✓ Sudah", shk: "Hasil: Normal", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Tidak ada", rujukan: "-", nakes: "Bidan Widya" },
            { fase: "8 - 28 Hari (KN 3)", tanggal: birthDateStr, jam: "11:00", batch: "-", bb: Math.round(birthWeight * 1.18), pb: Number(birthLength) + 2, lk: 35.5, menyusu: "✓ Sangat Kuat", taliPusat: "✓ Sembuh Sempurna", tandaBahaya: "❌ Tidak Ada", ikterus: "❌ Tidak Kuning", shk: "Terverifikasi", hiv: "Non-Reaktif", sifilis: "Non-Reaktif", hepB: "Non-Reaktif", masalah: "Pertumbuhan optimal", rujukan: "-", nakes: "Dr. Rian Syarif, Sp.A" }
          ]);
        }
      } catch (e) {
        console.error("Failed to load Dexie offline child data:", e);
      }
    }
    loadIsolatedChildData();
  }, [dbChildData?.child_id]);

  useEffect(() => {
    async function loadChildEhrData() {
      try {
        let targetChild: any = null;
        if (role === "ibu") {
          const targetUser = username || "08123456789";
          const motherDetail = await getLoggedInMotherDetail(targetUser);
          if (motherDetail && motherDetail.children && motherDetail.children.length > 0) {
            setMotherChildren(motherDetail.children);
            let selectedChild: any = motherDetail.children[0];
            if (paramChildId) {
              const matched = motherDetail.children.find((c: any) => c.child_id === paramChildId);
              if (matched) {
                const detail = await getChildDetail(matched.child_id);
                if (detail) selectedChild = detail;
              }
            } else {
              const detail = await getChildDetail(selectedChild.child_id);
              if (detail) selectedChild = detail;
            }
            targetChild = selectedChild;
          }
        } else if (paramChildId) {
          const childDetail = await getChildDetail(paramChildId);
          if (childDetail) {
            targetChild = childDetail;
          }
        } else {
          const allChildren = await getChildrenData();
          if (allChildren && allChildren.length > 0) {
            const defaultId = allChildren[0].child_id;
            const childDetail = await getChildDetail(defaultId);
            if (childDetail) {
              targetChild = childDetail;
            }
          }
        }

        if (targetChild) {
          setDbChildData(targetChild);
          setKmsGenderFilter(targetChild.gender === "P" || targetChild.gender === "F" ? "P" : "L");
          if (targetChild.name || targetChild.child_name) {
            setPatientSearchTerm(targetChild.name || targetChild.child_name);
          }
          if (targetChild.measurements && targetChild.measurements.length > 0) {
            setDbMeasurements(targetChild.measurements);
          } else {
            setDbMeasurements([]);
          }
        } else {
          setDbChildData(null);
          setDbMeasurements([]);
        }
      } catch (err) {
        console.error("Failed to load child EHR from DB:", err);
      }
    }
    loadChildEhrData();
  }, [paramChildId, username, role]);

  const handleToggleYellowCell = async (monthNum: number) => {
    const current = yellowStatuses[monthNum];
    let next: "L" | "TL" | null = null;
    if (!current) {
      next = "L";
    } else if (current === "L") {
      next = "TL";
    } else {
      next = null;
    }

    const updated = { ...yellowStatuses, [monthNum]: next };
    setYellowStatuses(updated);
    try {
      const childId = dbChildData?.child_id;
      if (childId) {
        await setCacheItem(`sdidtk_records_child_${childId}`, updated);
      }
    } catch (e) {
      console.error("Failed to save yellow status:", e);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-3 md:px-6 md:py-4 pb-18 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-4">
      
      {/* ─── BREADCRUMB & HEADER (NON-NAKES ONLY) ─── */}
      {role !== "nakes" && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Link href="/" className="hover:text-[#EA2986]">Beranda</Link>
              <span>/</span>
              <span className="text-gray-600">{role === "ibu" ? "Perjalanan Anak" : "Rekam Medis Anak"}</span>
            </div>
            <h1 className="text-xl font-black text-gray-900 mt-1 tracking-tight">Rekam Medis &amp; Pelayanan Kesehatan Anak</h1>
          </div>
          <span className="text-[10px] font-extrabold text-[#EA2986] bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl uppercase tracking-wider self-start md:self-auto">
            Buku KIA Pediatrik Verified
          </span>
        </div>
      )}

      {/* ─── SEARCH & CHILD INFORMATIONAL CARD (LIGHT MODE) ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 animate-fadeIn">
        
        {/* TOP ROW: SEARCH & DROPDOWN COMBOBOX (DI ATAS NAMA ANAK - HANYA UNTUK NAKES/KADER) */}
        {role !== "ibu" && allChildrenList.length > 0 && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA2986] animate-pulse" />
              <span>Cari &amp; Pilih Pasien Balita (EHR):</span>
            </div>

            {/* SEARCHABLE COMBOBOX CONTAINER */}
            <div className="relative flex-1 max-w-md w-full" ref={patientDropdownRef}>
              <div className="relative flex items-center">
                <MdSearch className="absolute left-3 text-gray-400 text-base pointer-events-none" />
                
                <input
                  type="text"
                  placeholder="Ketik Nama Balita / NIK / Nama Ibu..."
                  value={patientSearchTerm}
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  onChange={(e) => {
                    setPatientSearchTerm(e.target.value);
                    setIsPatientDropdownOpen(true);
                  }}
                  className="w-full bg-white text-gray-900 font-extrabold text-xs outline-none py-2.5 pl-9 pr-9 rounded-xl border border-gray-300 focus:border-[#EA2986] focus:ring-2 focus:ring-[#EA2986]/20 transition shadow-2xs"
                />

                {patientSearchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPatientSearchTerm("");
                      setIsPatientDropdownOpen(true);
                    }}
                    className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                  >
                    <MdClose className="text-sm" />
                  </button>
                ) : (
                  <MdKeyboardArrowDown 
                    onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                    className="absolute right-2.5 text-gray-400 text-lg cursor-pointer hover:text-gray-600" 
                  />
                )}
              </div>

              {/* DROPDOWN MENU FLOATING */}
              {isPatientDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((c) => {
                      const isSelected = dbChildData?.child_id === c.child_id;
                      const isFemale = c.gender === "P" || c.gender === "F";

                      return (
                        <button
                          key={c.child_id}
                          type="button"
                          onClick={async () => {
                            setPatientSearchTerm(c.name);
                            setIsPatientDropdownOpen(false);
                            const detail = await getChildDetail(c.child_id);
                            if (detail) {
                              setDbChildData(detail);
                              setKmsGenderFilter(detail.gender === "P" || detail.gender === "F" ? "P" : "L");
                              setDbMeasurements(detail.measurements || []);
                            }
                            router.push(`/perjalanan-anak/rekam-medis?child_id=${c.child_id}`);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer ${
                            isSelected 
                              ? "bg-rose-50 border border-rose-200 text-[#EA2986]" 
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${
                              isFemale ? "bg-pink-100 text-[#EA2986] border-pink-200" : "bg-blue-100 text-blue-600 border-blue-200"
                            }`}>
                              {isFemale ? "👧" : "👦"}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-black truncate">{c.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">
                                Usia: {c.age} · Ibu: {c.mother}
                              </p>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#EA2986] text-white shrink-0">
                              Aktif
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-gray-400 font-semibold">
                      Tidak ada pasien balita yang cocok dengan "{patientSearchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMPTY STATE IF NO CHILD SELECTED YET */}
        {!dbChildData && (
          <div className="bg-slate-50 border-2 border-dashed border-rose-200/80 rounded-2xl p-8 text-center space-y-3 my-2">
            <div className="w-14 h-14 bg-rose-100 text-[#EA2986] rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-2xs">
              👧
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Belum Ada Pasien Balita Dipilih</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 font-semibold leading-relaxed">
                Silakan ketik atau pilih nama balita dari menu pencarian di atas untuk mulai melihat dan mengelola Rekam Medis (EHR) balita.
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM ROW: PROFIL NAMA ANAK (LIGHT MODE) */}
        {dbChildData && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3.5">
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl font-black border shrink-0 ${
                kmsGenderFilter === "P" 
                  ? "bg-rose-50 text-[#EA2986] border-rose-200" 
                  : "bg-blue-50 text-blue-600 border-blue-200"
              }`}>
                {kmsGenderFilter === "P" ? "👧" : "👦"}
              </div>
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-gray-900">{dbChildData.name || dbChildData.child_name}</h2>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    kmsGenderFilter === "P" 
                      ? "bg-rose-50 text-[#EA2986] border-rose-200" 
                      : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}>
                    {kmsGenderFilter === "P" ? "♀ Perempuan" : "♂ Laki-Laki"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Tanggal Lahir: <span className="font-bold text-gray-800">{dbChildData.dob || dbChildData.birth_date || "-"}</span>
                  {dbChildData.ageInMonths !== undefined && (
                    <span> • Usia: <span className="font-bold text-gray-800">{dbChildData.ageInMonths} Bulan</span></span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {role === "nakes" && (
                <button
                  type="button"
                  onClick={() => setShowAddAntropometriModal(true)}
                  className="px-3.5 py-2 text-xs font-black bg-[#EA2986] text-white hover:bg-[#d41f76] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <MdAdd className="text-base" />
                  <span>Input Pengukuran Medis</span>
                </button>
              )}
              {dbChildData.mother && (
                <div className="text-left md:text-right text-xs bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 shrink-0">
                  <span className="text-gray-400 text-[10px] block font-bold uppercase tracking-wider">Nama Ibu Kandung</span>
                  <span className="font-extrabold text-gray-900 text-xs">{dbChildData.mother}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ─── MAIN TABS NAVIGATION & EHR CONTENT (ONLY IF CHILD IS SELECTED) ─── */}
      {dbChildData && (
        <>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
          
          {/* TABS 1: Catatan Pelayanan Kesehatan Anak */}
          <button
            type="button"
            onClick={() => setActiveTab("log_pelayanan_anak")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeTab === "log_pelayanan_anak" ? "bg-[#EA2986] text-white shadow-xs" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MdAssignmentTurnedIn className="text-sm shrink-0" />
            <span className="truncate">Catatan Pelayanan Anak</span>
          </button>

          {/* TABS 2: Pencatatan Pelayanan Kesehatan Anak yang Sudah Diterima */}
          <button
            type="button"
            onClick={() => setActiveTab("log_imunisasi")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeTab === "log_imunisasi" ? "bg-[#EA2986] text-white shadow-xs" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MdCheckCircle className="text-sm shrink-0" />
            <span className="truncate">Pelayanan yang Diterima</span>
          </button>

          {/* TABS 3: Pelayanan Kesehatan Bayi Umur 0 - 28 Hari (Neonatus) */}
          <button
            type="button"
            onClick={() => setActiveTab("neonatus")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeTab === "neonatus" ? "bg-[#EA2986] text-white shadow-xs" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MdChildCare className="text-sm shrink-0" />
            <span className="truncate">Neonatus (0-28 Hari)</span>
          </button>

          {/* TABS 4: Pelayanan Gizi (PMBA, Vit A) & Obat Cacing */}
          <button
            type="button"
            onClick={() => setActiveTab("gizi")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeTab === "gizi" ? "bg-[#EA2986] text-white shadow-xs" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MdLocalDining className="text-sm shrink-0" />
            <span className="truncate">Pelayanan Gizi &amp; Cacing</span>
          </button>

          {/* TABS 5: Imunisasi Dasar Bayi dan Baduta Beserta Checklist */}
          <button
            type="button"
            onClick={() => setActiveTab("imunisasi_dasar")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center col-span-2 lg:col-span-1 ${
              activeTab === "imunisasi_dasar" ? "bg-[#EA2986] text-white shadow-xs" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <MdShield className="text-sm shrink-0" />
            <span className="truncate">Imunisasi Dasar &amp; Checklist</span>
          </button>

        </div>
      </div>

      {/* ─── RENDERING KONTEN BERDASARKAN FILTER TABS ─── */}

      {/* ─── RENDER TABS 1: CATATAN PELAYANAN KESEHATAN ANAK & SDIDTK ─── */}
      {activeTab === "log_pelayanan_anak" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Selektor Internal Catatan Anak */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Lembar Pemeriksaan Berkala Anak
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveCatatanSubTab("kronologis")}
                className={`py-2 px-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${
                  activeCatatanSubTab === "kronologis" ? "bg-white text-gray-950 shadow-xs border border-gray-200" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Log Catatan Pelayanan
              </button>
              <button
                type="button"
                onClick={() => setActiveCatatanSubTab("sdidtk")}
                className={`py-2 px-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${
                  activeCatatanSubTab === "sdidtk" ? "bg-white text-gray-950 shadow-xs border border-gray-200" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Pemantauan SDIDTK
              </button>
              <button
                type="button"
                onClick={() => setActiveCatatanSubTab("lila")}
                className={`py-2 px-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${
                  activeCatatanSubTab === "lila" ? "bg-white text-gray-950 shadow-xs border border-gray-200" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Lembar LiLA (0-60 Bln)
              </button>
              <button
                type="button"
                onClick={() => setActiveCatatanSubTab("kms_0_2")}
                className={`py-2 px-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                  activeCatatanSubTab === "kms_0_2" ? "bg-[#EA2986] text-white shadow-xs" : "text-gray-600 hover:text-gray-950"
                }`}
              >
                <MdShowChart className="text-sm shrink-0" />
                <span>KMS &amp; Kurva Tumbuh Anak</span>
              </button>
            </div>
          </div>

          {/* KONTEN SUB-TAB 1: LOG KRONOLOGIS JURNAL PEMERIKSAAN NAKES */}
          {activeCatatanSubTab === "kronologis" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Catatan Pelayanan Kesehatan Anak</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Jurnal rekam medis klinis, keluhan, tindakan medis, &amp; saran resep khusus dari dokter/bidan.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Khusus Tenaga Kesehatan
                  </span>
                  {role === "nakes" && (
                    <button
                      type="button"
                      onClick={() => setShowAddNakesLogModal(true)}
                      className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>+ Tambah Catatan Nakes</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="border border-gray-400 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/4 border-r border-gray-700">Tanggal Periksa &amp; Nakes</th>
                      <th className="py-3 px-4 w-2/4 border-r border-gray-700">Keluhan, Hasil Pemeriksaan, Tindakan dan Saran</th>
                      <th className="py-3 px-4 text-center w-1/6 border-r border-gray-700">Tanggal Kembali</th>
                      <th className="py-3 px-3 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs bg-white text-gray-700 font-medium divide-y divide-gray-400">
                    {nakesLogs.map((log: any, idx: number) => (
                      <tr key={log.id || idx} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-4 align-top border-r border-gray-400">
                          <p className="font-black text-gray-900 text-sm">{log.tanggalPeriksa}</p>
                          <span className="text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded block mt-1 inline-block">
                            {log.nakesName}
                          </span>
                        </td>
                        <td className="p-4 leading-relaxed text-gray-600 align-top whitespace-pre-line border-r border-gray-400">
                          {log.keluhanTindakanSaran}
                        </td>
                        <td className="p-4 text-center font-black text-[#EA2986] text-sm align-top border-r border-gray-400">
                          {log.tanggalKembali || "-"}
                        </td>
                        <td className="p-4 text-center align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditNakesLog(log)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Edit Catatan"
                            >
                              <MdEdit className="text-base" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNakesLog(log.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Hapus Catatan"
                            >
                              <span>🗑️</span>
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PERBAIKAN TOTAL: MATRIKS SDIDTK SESUAI DETAIL SCAN DOKUMEN ASLI */}
          {activeCatatanSubTab === "sdidtk" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Pemantauan Pertumbuhan &amp; Perkembangan</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mencakup stimulasi, deteksi, dan intervensi dini tumbuh kembang anak (0 - 60 Bulan).</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded uppercase tracking-wider">
                  Diisi oleh Tenaga Kesehatan, Kader &amp; Ortu
                </span>
              </div>

              {/* Info banner interaktif untuk Ibu/Kader/Guru PAUD */}
              <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base">⭐</span>
                  <p className="font-bold text-amber-900 leading-relaxed">
                    <strong>Petunjuk Pengisian Ibu/Kader/Guru PAUD:</strong> Ketuk pada sel bulan (<span className="bg-[#FFEDA9] border border-amber-300 text-gray-900 px-1.5 py-0.5 rounded font-black">Kolom Kuning</span>) untuk mengganti status: <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black text-[10px]">L (Lengkap)</span> → <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded font-black text-[10px]">TL (Tidak Lengkap)</span> → Reset Angka.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setYellowStatuses({});
                    localStorage.removeItem("sdidtk_yellow_statuses");
                  }}
                  className="text-[10px] font-extrabold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 border border-amber-400/50 px-2.5 py-1 rounded-lg transition shrink-0 cursor-pointer"
                >
                  Reset Isian Kuning
                </button>
              </div>

              {/* Tabel Utama Bergaris Tegas Gelap */}
              <div className="border border-gray-900 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse min-w-[1350px]">
                  <thead>
                    {/* ─── HEADER BARIS 1 ─── */}
                    <tr className="bg-gray-950 text-white font-extrabold uppercase text-center tracking-wider border-b border-gray-900">
                      <th className="py-2.5 px-2 border-r border-gray-800" colSpan={4}>
                        Stimulasi, Deteksi, dan Intervensi Dini Tumbuh kembang
                      </th>
                      <th className="py-2.5 px-2 border-r border-gray-800" colSpan={11}>
                        Deteksi Dini Penyimpangan
                      </th>
                      <th className="py-2.5 px-2 border-r border-gray-800 w-16 text-center bg-gray-950 text-white font-extrabold" rowSpan={3}>
                        <span className="text-[10px] font-black uppercase tracking-wider block">
                          Hasil PKAT
                        </span>
                      </th>
                      <th className="py-2.5 px-2 border-r border-gray-800 w-36 text-center bg-gray-950 text-white font-extrabold" rowSpan={3}>
                        <span className="text-[10px] font-black uppercase tracking-wider block">
                          Tindakan
                        </span>
                      </th>
                      <th className="py-2.5 px-2 text-center bg-gray-950 text-white font-extrabold w-28" rowSpan={3}>
                        <span className="text-[10px] font-black uppercase tracking-wider block leading-tight">
                          Kunjungan Ulang
                        </span>
                      </th>
                    </tr>

                    {/* ─── HEADER BARIS 2 ─── */}
                    <tr className="bg-gray-900 text-white font-bold text-center border-b border-gray-900">
                      <th className="py-2.5 px-1 border-r border-gray-800 bg-[#FFEDA9] text-gray-900 font-black text-xs text-center" colSpan={3} rowSpan={2}>
                        Umur (Bulan)
                      </th>
                      <th className="py-2.5 px-1 border-r border-gray-800 bg-[#C7E1AA] text-emerald-950 font-black text-xs text-center" colSpan={1} rowSpan={2}>
                        Evaluasi (Bulan)
                      </th>
                      <th className="py-2 px-1 border-r border-gray-800" colSpan={5}>
                        Pertumbuhan
                      </th>
                      <th className="py-2 px-1 border-r border-gray-800" colSpan={3}>
                        Perkembangan
                      </th>
                      <th className="py-2 px-1 border-r border-gray-800" colSpan={3}>
                        Perilaku Emosional (atas indikasi)
                      </th>
                    </tr>

                    {/* ─── HEADER BARIS 3 ─── */}
                    <tr className="bg-[#C7E1AA] text-gray-950 text-[9px] font-bold text-center border-b border-gray-900">
                      {/* Pertumbuhan */}
                      <th className="py-2 px-1 border-r border-gray-800 w-16 text-emerald-950 text-center">BB/U<br/><span className="text-[7px] font-semibold text-gray-700">(SK/K/N/RBBL)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-20 text-emerald-950 text-center">BB/TB<br/><span className="text-[7px] font-semibold text-gray-700">(GB/GK/GN/RGL/GL/O)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-16 text-emerald-950 text-center">TB/U<br/><span className="text-[7px] font-semibold text-gray-700">(SP/P/N/Ti)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-16 text-emerald-950 text-center">LK/U<br/><span className="text-[7px] font-semibold text-gray-700">(Mi/N/Ma)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-14 text-emerald-950 text-center">LiLA<br/><span className="text-[7px] font-semibold text-gray-700">(GB, GK, N)</span></th>

                      {/* Perkembangan */}
                      <th className="py-2 px-1 border-r border-gray-800 w-16 text-emerald-950 text-center">KPSP<br/><span className="text-[7px] font-semibold text-gray-700">(Ds/Dm/Dp)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-12 text-emerald-950 text-center">TDD<br/><span className="text-[7px] font-semibold text-gray-700">(N/R)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-12 text-emerald-950 text-center">TDL<br/><span className="text-[7px] font-semibold text-gray-700">(N/R)</span></th>

                      {/* Perilaku Emosional */}
                      <th className="py-2 px-1 border-r border-gray-800 w-14 text-emerald-950 text-center">KMPE<br/><span className="text-[7px] font-semibold text-gray-700">(N/R)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-18 text-emerald-950 text-center">M-CHAT-REVISED<br/><span className="text-[7px] font-semibold text-gray-700">(N/R)</span></th>
                      <th className="py-2 px-1 border-r border-gray-800 w-16 text-emerald-950 text-center">ACTRS<br/><span className="text-[7px] font-semibold text-gray-700">(N/R)</span></th>
                    </tr>
                  </thead>
                  
                  <tbody className="bg-white text-gray-800 font-bold divide-y divide-gray-900 text-center">
                    {[
                      { u1: "1", u2: "2", u3: "3", u4: "3", bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "S", tdd: "N", tdl: "N", kmpe: "-", mchat: "-", gpph: "-", tindak: "Stimulasi di rumah", ulang: "14/10/2026" },
                      { u1: "4", u2: "5", u3: "6", u4: "6", bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "S", tdd: "N", tdl: "N", kmpe: "-", mchat: "-", gpph: "-", tindak: "Lanjutkan Stimulasi", ulang: "14/01/2027" },
                      { u1: "7", u2: "8", u3: "9", u4: "9", bbu: "GN", bbtb: "GN", tbu: "N", lku: "N", lila: "N", kpsp: "S", tdd: "N", tdl: "N", kmpe: "-", mchat: "-", gpph: "-", tindak: "KIE Gizi Seimbang", ulang: "14/04/2027" },
                      { u1: "10", u2: "11", u3: "12", u4: "12", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "13", u2: "14", u3: "15", u4: "15", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "16", u2: "17", u3: "18", u4: "18", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "19", u2: "20", u3: "21", u4: "21", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "22", u2: "23", u3: "24", u4: "24", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "25", u2: "26", u3: "27", u4: "27", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "28", u2: "29", u3: "30", u4: "30", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "31", u2: "32", u3: "33", u4: "33", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "34", u2: "35", u3: "36", u4: "36", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "37", u2: "38", u3: "39", u4: "39", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "40", u2: "41", u3: "42", u4: "42", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "43", u2: "44", u3: "45", u4: "45", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "46", u2: "47", u3: "48", u4: "48", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "49", u2: "50", u3: "51", u4: "51", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "52", u2: "53", u3: "54", u4: "54", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "55", u2: "56", u3: "57", u4: "57", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                      { u1: "58", u2: "59", u3: "60", u4: "60", bbu: "", bbtb: "", tbu: "", lku: "", lila: "", kpsp: "", tdd: "", tdl: "", kmpe: "", mchat: "", gpph: "", tindak: "", ulang: "" },
                    ].map((row, index) => {
                      // Konfigurasi arsiran kolom Hasil PKAT: Baris 1, 2, 3 (index 0,1,2) tetap putih. Index 3 ke bawah diarsir abu-abu.
                      const isPkatDisabled = index === 0 || index > 2;

                      const renderYellowCell = (monthVal: string) => {
                        const monthNum = parseInt(monthVal, 10);
                        if (isNaN(monthNum)) return monthVal;
                        
                        const status = yellowStatuses[monthNum];
                        
                        return (
                          <button
                            type="button"
                            onClick={() => handleToggleYellowCell(monthNum)}
                            title={`Bulan ke-${monthNum}: Ketuk untuk ubah status (L = Lengkap, TL = Tidak Lengkap, Angka = Reset)`}
                            className={`relative w-full h-full py-2 px-1 font-black transition-all cursor-pointer flex items-center justify-center rounded-sm min-h-[32px] ${
                              status === "L" 
                                ? "bg-emerald-600 text-white shadow-2xs font-extrabold"
                                : status === "TL"
                                ? "bg-rose-600 text-white shadow-2xs font-extrabold"
                                : "bg-[#FFEDA9] text-gray-900 hover:bg-amber-300 font-bold"
                            }`}
                          >
                            {/* Label Angka Usia Bulan di Pojok Kiri Atas Cell */}
                            <span className={`absolute top-0.5 left-1 text-[8px] font-black leading-none ${status ? "text-white/80" : "text-gray-500/70"}`}>
                              {monthVal}
                            </span>

                            {status ? (
                              <span className="text-[11px] font-black tracking-tight mt-1">{status}</span>
                            ) : (
                              <span className="text-xs font-bold text-gray-900 mt-1">{monthVal}</span>
                            )}
                          </button>
                        );
                      };

                      const monthNum4 = parseInt(row.u4, 10);
                      const isGreenChecked = !!sdidtkGreenChecks[monthNum4];
                      const cellData = sdidtkMatrixData[monthNum4] || {};

                      const bbuVal = cellData.bbu !== undefined ? cellData.bbu : row.bbu;
                      const bbtbVal = cellData.bbtb !== undefined ? cellData.bbtb : row.bbtb;
                      const tbuVal = cellData.tbu !== undefined ? cellData.tbu : row.tbu;
                      const lkuVal = cellData.lku !== undefined ? cellData.lku : row.lku;
                      const lilaVal = cellData.lila !== undefined ? cellData.lila : row.lila;
                      const kpspVal = cellData.kpsp !== undefined ? cellData.kpsp : row.kpsp;
                      const tddVal = cellData.tdd !== undefined ? cellData.tdd : row.tdd;
                      const tdlVal = cellData.tdl !== undefined ? cellData.tdl : row.tdl;
                      const kmpeVal = cellData.kmpe !== undefined ? cellData.kmpe : row.kmpe;
                      const mchatVal = cellData.mchat !== undefined ? cellData.mchat : row.mchat;
                      const gpphVal = cellData.gpph !== undefined ? cellData.gpph : row.gpph;
                      const pkatVal = cellData.pkat !== undefined ? cellData.pkat : (isPkatDisabled ? "" : "✓");

                      return (
                        <tr key={index} className="hover:bg-gray-50/40 transition-colors">
                          {/* 3 Kolom Umur Awal (Warna Kuning Buku KIA Interaktif) */}
                          <td className="p-0 border-r border-gray-900 bg-[#FFEDA9]">{renderYellowCell(row.u1)}</td>
                          <td className="p-0 border-r border-gray-900 bg-[#FFEDA9]">{renderYellowCell(row.u2)}</td>
                          <td className="p-0 border-r border-gray-900 bg-[#FFEDA9]">{renderYellowCell(row.u3)}</td>
                          
                          {/* Kolom Umur Evaluasi ke-4 (Warna Hijau Buku KIA - Klik untuk Centang ✓) */}
                          <td className="p-0 border-r border-gray-900 bg-[#C7E1AA]">
                            <button
                              type="button"
                              onClick={() => handleToggleGreenCheck(monthNum4)}
                              title={`Petugas Kesehatan: Ketuk untuk centang ✓ bulan ke-${monthNum4}`}
                              className={`w-full h-full py-1.5 px-1 font-black transition-all cursor-pointer flex items-center justify-center min-h-[32px] ${
                                isGreenChecked
                                  ? "bg-emerald-700 text-white font-extrabold shadow-2xs"
                                  : "bg-[#C7E1AA] text-gray-950 hover:bg-emerald-300 font-bold"
                              }`}
                            >
                              {isGreenChecked ? `✓ ${row.u4} Bln` : `${row.u4} Bln`}
                            </button>
                          </td>
                          
                          {/* Data Medis Pertumbuhan Dropdowns */}
                          {renderSelectCell(monthNum4, "bbu", bbuVal, [
                            { value: "SK", label: "Berat Badan Sangat Kurang" },
                            { value: "K", label: "Berat Badan Kurang" },
                            { value: "GN", label: "Gizi Normal" },
                            { value: "RBBL", label: "Risiko BB Lebih" }
                          ])}

                          {renderSelectCell(monthNum4, "bbtb", bbtbVal, [
                            { value: "GB", label: "Gizi Buruk" },
                            { value: "GK", label: "Gizi Kurang" },
                            { value: "GN", label: "Gizi Normal" },
                            { value: "RGL", label: "Risiko Gizi Lebih" },
                            { value: "O", label: "Obesitas" }
                          ])}

                          {renderSelectCell(monthNum4, "tbu", tbuVal, [
                            { value: "SP", label: "Sangat Pendek" },
                            { value: "P", label: "Pendek" },
                            { value: "N", label: "Normal" },
                            { value: "Ti", label: "Tinggi" }
                          ])}

                          {renderSelectCell(monthNum4, "lku", lkuVal, [
                            { value: "Mi", label: "Mikrosefali" },
                            { value: "N", label: "Normal" },
                            { value: "Ma", label: "Makrosefali" }
                          ])}

                          {renderSelectCell(monthNum4, "lila", lilaVal, [
                            { value: "GB", label: "Gizi Buruk (<11.5cm)" },
                            { value: "GK", label: "Gizi Kurang (11.5-12.5cm)" },
                            { value: "N", label: "Normal (>12.5cm)" }
                          ])}
                          
                          {/* Data Medis Perkembangan Dropdowns */}
                          {renderSelectCell(monthNum4, "kpsp", kpspVal, [
                            { value: "Ds", label: "Sesuai" },
                            { value: "Dm", label: "Meragukan" },
                            { value: "Dp", label: "Penyimpangan Terindikasi" }
                          ])}

                          {renderSelectCell(monthNum4, "tdd", tddVal, [
                            { value: "N", label: "Normal" },
                            { value: "R", label: "Rujuk" }
                          ])}

                          {renderSelectCell(monthNum4, "tdl", tdlVal, [
                            { value: "N", label: "Normal" },
                            { value: "R", label: "Rujuk" }
                          ])}
                          
                          {/* Data Medis Perilaku Emosional Dropdowns */}
                          {renderSelectCell(monthNum4, "kmpe", kmpeVal, [
                            { value: "N", label: "Normal" },
                            { value: "R", label: "Rujuk" }
                          ])}

                          {renderSelectCell(monthNum4, "mchat", mchatVal, [
                            { value: "N", label: "Normal" },
                            { value: "R", label: "Rujuk" }
                          ])}

                          {renderSelectCell(monthNum4, "gpph", gpphVal, [
                            { value: "N", label: "Normal" },
                            { value: "R", label: "Rujuk" }
                          ])}
                          
                          {/* Hasil PKAT Kondisional Dropdown */}
                          <td className={`p-0.5 border-r border-gray-900 ${isPkatDisabled ? "bg-gray-200 select-none" : "bg-white"}`}>
                            {!isPkatDisabled ? (
                              <select
                                value={pkatVal || ""}
                                onChange={(e) => handleUpdateMatrixCell(monthNum4, "pkat", e.target.value)}
                                className={`w-full text-[10px] font-black py-1 px-0.5 rounded outline-none transition cursor-pointer text-center ${
                                  pkatVal === "✓"
                                    ? "bg-emerald-600 text-white font-extrabold"
                                    : pkatVal === "PKAT"
                                    ? "bg-rose-600 text-white font-extrabold"
                                    : "bg-white text-gray-700 font-bold"
                                }`}
                              >
                                <option value="">—</option>
                                <option value="✓">✓ (Tidak Ada Masalah)</option>
                                <option value="PKAT">PKAT (Tindakan Rujuk)</option>
                              </select>
                            ) : (
                              <span className="text-transparent">—</span>
                            )}
                          </td>
                          
                          {/* Input Catatan Tindakan & Tanggal Kembali */}
                          <td className="p-1 border-r border-gray-900 text-left font-semibold text-gray-600">
                            <input
                              type="text"
                              placeholder="Tindakan / Saran..."
                              value={cellData.tindak !== undefined ? cellData.tindak : row.tindak}
                              onChange={(e) => handleUpdateMatrixCell(monthNum4, "tindak", e.target.value)}
                              className="w-full bg-slate-50 border border-gray-200 text-[10px] font-semibold text-gray-900 rounded p-1 outline-none focus:border-[#EA2986]"
                            />
                          </td>
                          <td className="p-1 font-mono font-bold text-[#EA2986]">
                            <input
                              type="text"
                              maxLength={10}
                              placeholder="dd/mm/yyyy"
                              value={cellData.ulang !== undefined ? cellData.ulang : row.ulang}
                              onChange={(e) => {
                                const formatted = formatDateString(e.target.value);
                                handleUpdateMatrixCell(monthNum4, "ulang", formatted);
                              }}
                              className="w-full bg-slate-50 border border-gray-200 text-[10px] font-mono font-bold text-[#EA2986] rounded p-1 outline-none focus:border-[#EA2986] text-center"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Box Kaki Halaman: Petunjuk Cara Mengisi & Glosarium Sesuai Gambar */}
              <div className="pt-3 border-t border-gray-900 grid grid-cols-1 lg:grid-cols-12 gap-4 text-[9px] text-gray-500 font-medium leading-relaxed">
                <div className="lg:col-span-3 border-r border-gray-200 pr-2">
                  <span className="font-black text-gray-700 block mb-0.5">Cara Mengisi:</span>
                  <p>• Ibu/kader/guru PAUD mengisi kolom kuning dengan **L (lengkap)** / **TL (tidak lengkap)**.</p>
                  <p>• Petugas kesehatan mengisi kolom hijau dengan tanda **✓ (centang)**.</p>
                </div>
                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p><strong>SK</strong>: Berat Badan sangat Kurang</p>
                    <p><strong>K</strong>: Berat Badan Kurang</p>
                    <p><strong>RBBL</strong>: Risiko BB Lebih</p>
                  </div>
                  <div>
                    <p><strong>GB</strong>: Gizi Buruk / <strong>GK</strong>: Gizi Kurang</p>
                    <p><strong>GN</strong>: Gizi Normal / <strong>O</strong>: Obesitas</p>
                    <p><strong>RGL</strong>: Risiko Gizi Lebih</p>
                  </div>
                  <div>
                    <p><strong>SP</strong>: Sangat Pendek / <strong>P</strong>: Pendek</p>
                    <p><strong>N</strong>: Normal / <strong>Ti</strong>: Tinggi</p>
                    <p><strong>Mi</strong>: Mikrosefali / <strong>Ma</strong>: Makrosefali</p>
                  </div>
                  <div>
                    <p><strong>Ds</strong>: Sesuai / <strong>Dm</strong>: Meragukan</p>
                    <p><strong>Dp</strong>: Penyimpangan Terindikasi</p>
                    <p><strong>PKAT</strong>: Tidak ada masalah/Tindakan Rujuk</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* KONTEN SUB-TAB 3: LEMBAR PENCATATAN LILA (BUKU KIA HALAMAN 128) */}
          {activeCatatanSubTab === "lila" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-base font-black text-gray-900">Lembar Pencatatan LiLA (Lingkar Lengan Atas)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Pemantauan Lingkar Lengan Atas Balita usia 1 - 60 bulan sesuai standar Buku KIA 2024.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md uppercase tracking-wider self-start sm:self-auto">
                    Khusus Tenaga Kesehatan
                  </span>
                  {role === "nakes" && (
                    <button
                      type="button"
                      onClick={handleOpenAddLilaModal}
                      className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>+ Input LiLA Nakes</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── 1. Tabel Hasil Pengukuran LiLA Usia < 6 Bulan ── */}
              <div className="space-y-2">
                <div className="bg-gray-950 text-white p-2.5 rounded-t-xl font-extrabold text-xs text-center uppercase tracking-wide">
                  Hasil Pengukuran LiLA Usia &lt; 6 Bulan
                </div>
                <div className="border border-gray-900 rounded-b-xl overflow-hidden shadow-2xs overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-gray-900 font-bold">
                        <th className="py-2.5 px-3 border-r border-gray-900 bg-gray-100 w-28 text-gray-900">Usia Bulan</th>
                        <th className="py-2.5 px-3 border-r border-gray-900 bg-[#FFD4D4] text-rose-950 w-2/5">
                          Berisiko Hambatan Pertumbuhan<br/><span className="text-[10px] font-normal text-rose-800">&lt; 11,0 cm</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-gray-900 bg-[#FFF9C4] text-amber-950 w-2/5">
                          Pertumbuhan Baik<br/><span className="text-[10px] font-normal text-amber-800">≥ 11,0 cm</span>
                        </th>
                        <th className="py-2.5 px-3 bg-gray-100 text-gray-900 w-20">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 font-bold bg-white text-gray-800">
                      {[1, 2, 3, 4, 5].map((m) => {
                        const rec = lilaRecords[m];
                        return (
                          <tr key={m} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-2.5 border-r border-gray-900 bg-gray-50 font-black text-gray-900">{m} Bulan</td>
                            <td className={`p-2.5 border-r border-gray-900 ${rec?.val && rec.val < 11 ? "bg-rose-100 font-black text-rose-700" : ""}`}>
                              {rec?.val && rec.val < 11 ? `✓ (${rec.val} cm)` : "—"}
                            </td>
                            <td className={`p-2.5 border-r border-gray-900 ${rec?.val && rec.val >= 11 ? "bg-emerald-100 font-black text-emerald-700" : ""}`}>
                              {rec?.val && rec.val >= 11 ? `✓ (${rec.val} cm)` : "—"}
                            </td>
                            <td className="p-2 bg-gray-50/80 text-center">
                              {rec?.val && role === "nakes" ? (
                                <button
                                  type="button"
                                  onClick={() => handleEditLilaRecord(m)}
                                  title={`Edit Data LiLA Bulan ke-${m}`}
                                  className="text-[10px] font-black text-gray-700 hover:text-black bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer inline-flex items-center gap-1"
                                >
                                  <MdEdit /> Edit
                                </button>
                              ) : (
                                <span className="text-gray-300 font-normal">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-gray-400 italic mt-1">* Catatan: Isilah hasil pengukuran LiLA atau beri tanda ✓ pada kotak pengukuran.</p>
              </div>

              {/* ── 2. Tabel Hasil Pengukuran LiLA Usia >= 6 Bulan (Bulan 6 - 60) ── */}
              <div className="space-y-2 pt-2">
                <div className="bg-gray-950 text-white p-2.5 rounded-t-xl font-extrabold text-xs text-center uppercase tracking-wide">
                  Hasil Pengukuran LiLA Usia ≥ 6 Bulan (6 - 60 Bulan)
                </div>
                <div className="border border-gray-900 rounded-b-xl overflow-hidden shadow-2xs overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse min-w-[850px]">
                    <thead>
                      <tr className="border-b border-gray-900 font-bold text-[10px]">
                        {/* Bagian Kiri (Bulan 6-33) */}
                        <th className="py-2 px-1 border-r border-gray-900 bg-gray-100 w-16 text-gray-900">Usia Bulan</th>
                        <th className="py-2 px-1 border-r border-gray-900 bg-[#FFD4D4] text-rose-950 w-20">Gizi Buruk<br/>&lt; 11,5 cm</th>
                        <th className="py-2 px-1 border-r border-gray-900 bg-[#FFE0B2] text-amber-950 w-24">Gizi Kurang<br/>11,5 - 12,4 cm</th>
                        <th className="py-2 px-2 border-r border-gray-900 bg-[#C8E6C9] text-emerald-950 w-20">Gizi Baik<br/>≥ 12,5 cm</th>
                        <th className="py-2 px-1 border-r border-gray-900 bg-gray-100 w-14 text-gray-900">Aksi</th>
                        
                        {/* Bagian Kanan (Bulan 34-60) */}
                        <th className="py-2 px-1 border-r border-gray-900 bg-gray-100 w-16 text-gray-900">Usia Bulan</th>
                        <th className="py-2 px-1 border-r border-gray-900 bg-[#FFD4D4] text-rose-950 w-20">Gizi Buruk<br/>&lt; 11,5 cm</th>
                        <th className="py-2 px-1 border-r border-gray-900 bg-[#FFE0B2] text-amber-950 w-24">Gizi Kurang<br/>11,5 - 12,4 cm</th>
                        <th className="py-2 px-2 border-r border-gray-900 bg-[#C8E6C9] text-emerald-950 w-20">Gizi Baik<br/>≥ 12,5 cm</th>
                        <th className="py-2 px-1 bg-gray-100 w-14 text-gray-900">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 font-bold bg-white text-gray-800 text-[11px]">
                      {Array.from({ length: 27 }, (_, i) => {
                        const mLeft = 6 + i;
                        const mRight = 34 + i;
                        const recLeft = lilaRecords[mLeft];
                        const recRight = mRight <= 60 ? lilaRecords[mRight] : null;

                        return (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            {/* Kiri */}
                            <td className="p-1.5 border-r border-gray-900 bg-gray-50 font-black">{mLeft}</td>
                            <td className={`p-1.5 border-r border-gray-900 ${recLeft?.val && recLeft.val < 11.5 ? "bg-rose-100 text-rose-700 font-black" : ""}`}>
                              {recLeft?.val && recLeft.val < 11.5 ? `✓ (${recLeft.val})` : "—"}
                            </td>
                            <td className={`p-1.5 border-r border-gray-900 ${recLeft?.val && recLeft.val >= 11.5 && recLeft.val <= 12.4 ? "bg-amber-100 text-amber-800 font-black" : ""}`}>
                              {recLeft?.val && recLeft.val >= 11.5 && recLeft.val <= 12.4 ? `✓ (${recLeft.val})` : "—"}
                            </td>
                            <td className={`p-1.5 border-r border-gray-900 ${recLeft?.val && recLeft.val >= 12.5 ? "bg-emerald-100 text-emerald-700 font-black" : ""}`}>
                              {recLeft?.val && recLeft.val >= 12.5 ? `✓ (${recLeft.val})` : "—"}
                            </td>
                            <td className="p-1 border-r border-gray-900 bg-gray-50/80 text-center">
                              {recLeft?.val && role === "nakes" ? (
                                <button
                                  type="button"
                                  onClick={() => handleEditLilaRecord(mLeft)}
                                  title={`Edit Data LiLA Bulan ke-${mLeft}`}
                                  className="text-[9px] font-black text-gray-700 hover:text-black bg-white hover:bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded shadow-2xs transition cursor-pointer"
                                >
                                  <MdEdit /> Edit
                                </button>
                              ) : (
                                <span className="text-gray-300 font-normal">—</span>
                              )}
                            </td>

                            {/* Kanan */}
                            {mRight <= 60 ? (
                              <>
                                <td className="p-1.5 border-r border-gray-900 bg-gray-50 font-black">{mRight}</td>
                                <td className={`p-1.5 border-r border-gray-900 ${recRight?.val && recRight.val < 11.5 ? "bg-rose-100 text-rose-700 font-black" : ""}`}>
                                  {recRight?.val && recRight.val < 11.5 ? `✓ (${recRight.val})` : "—"}
                                </td>
                                <td className={`p-1.5 border-r border-gray-900 ${recRight?.val && recRight.val >= 11.5 && recRight.val <= 12.4 ? "bg-amber-100 text-amber-800 font-black" : ""}`}>
                                  {recRight?.val && recRight.val >= 11.5 && recRight.val <= 12.4 ? `✓ (${recRight.val})` : "—"}
                                </td>
                                <td className={`p-1.5 border-r border-gray-900 ${recRight?.val && recRight.val >= 12.5 ? "bg-emerald-100 text-emerald-700 font-black" : ""}`}>
                                  {recRight?.val && recRight.val >= 12.5 ? `✓ (${recRight.val})` : "—"}
                                </td>
                                <td className="p-1 bg-gray-50/80 text-center">
                                  {recRight?.val && role === "nakes" ? (
                                    <button
                                      type="button"
                                      onClick={() => handleEditLilaRecord(mRight)}
                                      title={`Edit Data LiLA Bulan ke-${mRight}`}
                                      className="text-[9px] font-black text-gray-700 hover:text-black bg-white hover:bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded shadow-2xs transition cursor-pointer"
                                    >
                                      <MdEdit /> Edit
                                    </button>
                                  ) : (
                                    <span className="text-gray-300 font-normal">—</span>
                                  )}
                                </td>
                              </>
                            ) : (
                              <td colSpan={5} className="bg-gray-100"></td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KONTEN SUB-TAB 4: TABEL & GRAFIK KMS PERTUMBUHAN ANAK 0-2 TAHUN (BUKU KIA HALAMAN 130-131) */}
          {activeCatatanSubTab === "kms_0_2" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Kartu Informasi */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-gray-900">Kartu Menuju Sehat (KMS) &amp; Kurva Pertumbuhan Anak</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Grafik otomatis memplot titik berat badan (BB) hasil penimbangan fisik yang sudah tersimpan di database.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  {/* Button Input/Edit Pertumbuhan */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditKmsRow(0, null, null, null)}
                    className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>Tambah / Edit Data</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ── BAGIAN KIRI: TABEL PERTUMBUHAN ANAK (BUKU KIA HAL 130) ── */}
                <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wide">
                        Tabel Pertumbuhan (KMS)
                      </h4>
                      <p className="text-[11px] text-gray-400">Data berat &amp; tinggi badan per bulan</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Age group toggle */}
                      <div className="flex rounded-lg overflow-hidden border border-gray-300 text-[10px] font-black">
                        <button
                          type="button"
                          onClick={() => setKmsTableAgeGroup("0_2")}
                          className={`px-2.5 py-1 transition cursor-pointer ${kmsTableAgeGroup === "0_2" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                        >
                          0–2 Thn
                        </button>
                        <button
                          type="button"
                          onClick={() => setKmsTableAgeGroup("2_5")}
                          className={`px-2.5 py-1 transition cursor-pointer border-l border-gray-300 ${kmsTableAgeGroup === "2_5" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
                        >
                          2–5 Thn
                        </button>
                      </div>
                      {/* Badge gender otomatis dari database */}
                      <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                        kmsGenderFilter === "P"
                          ? "bg-rose-50 text-[#EA2986] border-rose-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {kmsGenderFilter === "P" ? "♀ Perempuan" : "♂ Laki-Laki"}
                        <span className="ml-1 text-[9px] font-medium opacity-70">• otomatis</span>
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-900 rounded-xl overflow-hidden shadow-2xs max-h-[600px] overflow-y-auto">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead className="sticky top-0 z-10 bg-gray-950 text-white font-extrabold">
                        {kmsGenderFilter === "P" ? (
                          <>
                            <tr>
                              <th rowSpan={3} className="py-2.5 px-2 border-r border-gray-800 bg-gray-900 w-14">Usia<br/>(Bln)</th>
                              <th colSpan={4} className="py-1.5 border-b border-gray-800 bg-[#EA2986] text-white text-center uppercase tracking-wider text-xs font-black">
                                ♀ STANDAR PERTUMBUHAN PEREMPUAN
                              </th>
                              <th rowSpan={3} className="py-2.5 px-2 border-l border-gray-800 bg-gray-900 w-16 text-white text-center">Aksi</th>
                            </tr>
                            <tr>
                              <th colSpan={2} className="py-1 border-r border-b border-gray-800 bg-pink-900 text-pink-100 text-[10px]">Berat Badan (BB)</th>
                              <th colSpan={2} className="py-1 border-b border-gray-800 bg-pink-800 text-pink-100 text-[10px]">Panjang Badan (PB)</th>
                            </tr>
                            <tr>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-pink-950 text-pink-200 text-[9px]">Ideal</th>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-emerald-900 text-emerald-200 text-[9px]">Hasil</th>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-pink-900 text-pink-200 text-[9px]">Ideal</th>
                              <th className="py-1 px-1.5 border-gray-800 bg-emerald-900 text-emerald-200 text-[9px]">Hasil</th>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <th rowSpan={3} className="py-2.5 px-2 border-r border-gray-800 bg-gray-900 w-14">Usia<br/>(Bln)</th>
                              <th colSpan={4} className="py-1.5 border-b border-gray-800 bg-blue-700 text-white text-center uppercase tracking-wider text-xs font-black">
                                ♂ STANDAR PERTUMBUHAN LAKI-LAKI
                              </th>
                              <th rowSpan={3} className="py-2.5 px-2 border-l border-gray-800 bg-gray-900 w-16 text-white text-center">Aksi</th>
                            </tr>
                            <tr>
                              <th colSpan={2} className="py-1 border-r border-b border-gray-800 bg-blue-900 text-blue-100 text-[10px]">Berat Badan (BB)</th>
                              <th colSpan={2} className="py-1 border-b border-gray-800 bg-blue-800 text-blue-100 text-[10px]">Panjang Badan (PB)</th>
                            </tr>
                            <tr>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-blue-950 text-blue-200 text-[9px]">Ideal</th>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-emerald-900 text-emerald-200 text-[9px]">Hasil</th>
                              <th className="py-1 px-1.5 border-r border-gray-800 bg-blue-900 text-blue-200 text-[9px]">Ideal</th>
                              <th className="py-1 px-1.5 border-gray-800 bg-emerald-900 text-emerald-200 text-[9px]">Hasil</th>
                            </tr>
                          </>
                        )}
                      </thead>
                      <tbody className="divide-y divide-gray-300 font-bold bg-white text-gray-800">
                        {(kmsTableAgeGroup === "0_2" ? KMS_IDEAL_DATA : KMS_IDEAL_DATA_24_60).map((row) => {
                          const dbMatch = dbMeasurements.find((m: any) =>
                            m.cadre_notes && m.cadre_notes.includes(`[Pengukuran KMS Usia ${row.month} Bulan]`)
                          ) || dbMeasurements.find((m: any) =>
                            (m.ageAtVisit !== undefined && m.ageAtVisit === row.month) ||
                            (m.rawAge !== undefined && m.rawAge === row.month) ||
                            (m.usiaBulan !== undefined && m.usiaBulan === row.month)
                          );
                          const rawBB = (dbMatch?.weight !== undefined && dbMatch?.weight !== null)
                            ? Number(dbMatch.weight)
                            : (row.month === 0 && dbChildData?.birth_weight ? Number(dbChildData.birth_weight) : null);
                          const rawPB = (dbMatch?.height !== undefined && dbMatch?.height !== null)
                            ? Number(dbMatch.height)
                            : (row.month === 0 && dbChildData?.birth_length ? Number(dbChildData.birth_length) : null);

                          const actualBB = rawBB !== null ? `${rawBB} kg` : "—";
                          const actualPB = rawPB !== null ? `${rawPB} cm` : "—";

                          const rowColor = kmsGenderFilter === "P" ? "hover:bg-pink-50/60" : "hover:bg-blue-50/60";
                          const idealBBColor = kmsGenderFilter === "P" ? "text-pink-950 font-bold" : "text-blue-950 font-bold";
                          const idealPBColor = kmsGenderFilter === "P" ? "text-pink-900 font-normal" : "text-blue-900 font-normal";
                          const idealBB = kmsGenderFilter === "P" ? row.p_bb : row.l_bb;
                          const idealPB = kmsGenderFilter === "P" ? row.p_pb : row.l_pb;

                          const hasRowData = actualBB !== "—" || actualPB !== "—";

                          return (
                            <tr key={row.month} className={`${rowColor} transition-colors`}>
                              <td className="p-2 border-r border-gray-400 bg-gray-100 font-black text-gray-900">{row.month} Bln</td>
                              <td className={`p-2 border-r border-gray-300 ${idealBBColor}`}>{idealBB} kg</td>
                              <td className={`p-2 border-r border-gray-300 ${actualBB !== "—" ? "bg-emerald-100 text-emerald-950 font-black" : "text-gray-400 font-normal"}`}>
                                {actualBB}
                              </td>
                              <td className={`p-2 border-r border-gray-300 ${idealPBColor}`}>{idealPB} cm</td>
                              <td className={`p-2 border-r border-gray-300 ${actualPB !== "—" ? "bg-emerald-100 text-emerald-950 font-black" : "text-gray-400 font-normal"}`}>
                                {actualPB}
                              </td>
                              <td className="p-1 text-center bg-gray-50 border-l border-gray-300">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditKmsRow(row.month, rawBB, rawPB, dbMatch)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition shadow-2xs cursor-pointer flex items-center justify-center gap-0.5 mx-auto border ${
                                    hasRowData
                                      ? "bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border-amber-300 hover:border-amber-600"
                                      : "bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-300 hover:border-emerald-600"
                                  }`}
                                  title={hasRowData ? `Edit Data Usia ${row.month} Bulan` : `Tambah Data Usia ${row.month} Bulan`}
                                >
                                  {hasRowData ? <><MdEdit /> Edit</> : <><MdAdd /> Tambah</>}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── BAGIAN KANAN: KARTU MENUJU SEHAT (KMS) & KURVA INTERAKTIF RECHARTS ── */}
                <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-3 gap-2">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">
                        Grafik Pertumbuhan WHO {kmsGenderFilter === "L" ? "♂ Laki-Laki" : "♀ Perempuan"}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Berdasarkan Standar Antropometri WHO 2020 — Buku KIA Hal 131–141
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 border ${
                      kmsGenderFilter === "P"
                        ? "text-[#EA2986] bg-rose-50 border-rose-200"
                        : "text-blue-700 bg-blue-50 border-blue-200"
                    }`}>
                      Plot Otomatis DB
                    </span>
                  </div>

                  {/* Metric Selector */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: "bb_0_2",  label: "BB/U 0–2 Thn",  color: "blue" },
                      { key: "bb_2_5",  label: "BB/U 2–5 Thn",  color: "blue" },
                      { key: "pb_0_2",  label: "PB/U 0–2 Thn",  color: "purple" },
                      { key: "tb_2_5",  label: "TB/U 2–5 Thn",  color: "purple" },
                      { key: "lk_0_5",  label: "LK/U 0–5 Thn",  color: "teal" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setKmsChartMetric(key as typeof kmsChartMetric)}
                        className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition cursor-pointer border ${
                          kmsChartMetric === key
                            ? kmsGenderFilter === "P"
                              ? "bg-[#EA2986] text-white border-[#EA2986] shadow"
                              : "bg-blue-700 text-white border-blue-700 shadow"
                            : kmsGenderFilter === "P"
                              ? "bg-white text-gray-600 border-gray-300 hover:border-[#EA2986] hover:text-[#EA2986]"
                              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="w-full flex-1 min-h-[380px] bg-slate-50/50 p-2 rounded-2xl border border-gray-200">
                    <ResponsiveContainer width="100%" height="100%">
                      {(() => {
                        const isMale = kmsGenderFilter === "L";
                        const actColor = isMale ? "#2563EB" : "#EA2986";
                        const actLabel = isMale ? "♂ Aktual DB" : "♀ Aktual DB";

                        // Helper: find actual measurement for a given month age
                        const getActualWeight = (month: number): number | null => {
                          if (month === 0 && dbChildData?.birth_weight) return Number(dbChildData.birth_weight);
                          const m = dbMeasurements.find((x: any) =>
                            (x.ageAtVisit !== undefined && x.ageAtVisit === month) ||
                            (x.rawAge !== undefined && x.rawAge === month) ||
                            (x.usiaBulan !== undefined && x.usiaBulan === month) ||
                            (x.cadre_notes && x.cadre_notes.includes(`[Pengukuran KMS Usia ${month} Bulan]`))
                          );
                          return m?.weight !== undefined && m?.weight !== null ? Number(m.weight) : null;
                        };
                        const getActualHeight = (month: number): number | null => {
                          if (month === 0 && dbChildData?.birth_length) return Number(dbChildData.birth_length);
                          const m = dbMeasurements.find((x: any) =>
                            (x.ageAtVisit !== undefined && x.ageAtVisit === month) ||
                            (x.rawAge !== undefined && x.rawAge === month) ||
                            (x.usiaBulan !== undefined && x.usiaBulan === month) ||
                            (x.cadre_notes && x.cadre_notes.includes(`[Pengukuran KMS Usia ${month} Bulan]`))
                          );
                          return m?.height !== undefined && m?.height !== null ? Number(m.height) : null;
                        };
                        const getActualLK = (month: number): number | null => {
                          const m = dbMeasurements.find((x: any) =>
                            (x.ageAtVisit !== undefined && x.ageAtVisit === month) ||
                            (x.rawAge !== undefined && x.rawAge === month) ||
                            (x.usiaBulan !== undefined && x.usiaBulan === month) ||
                            (x.cadre_notes && x.cadre_notes.includes(`[Pengukuran KMS Usia ${month} Bulan]`))
                          );
                          return m?.head_circumference !== undefined && m?.head_circumference !== null ? Number(m.head_circumference) : null;
                        };

                        // ── BB/U 0–2 Tahun ──
                        if (kmsChartMetric === "bb_0_2") {
                          const src = isMale ? WHO_MALE_BB_0_24 : WHO_FEMALE_BB_0_24;
                          const data = src.map((row) => ({
                            label: `${row.m}`,
                            "-3 SD (Buruk)": row.sd3n,
                            "-2 SD (Kurang)": row.sd2n,
                            "Median": row.med,
                            "+2 SD (Lebih)": row.sd2p,
                            "+3 SD (Obese)": row.sd3p,
                            [actLabel]: getActualWeight(row.m),
                          }));
                          return (
                            <LineChart data={data} margin={{ top: 10, right: 16, left: 2, bottom: 28 }}>
                              <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" />
                              <XAxis dataKey="label" stroke="#475569" fontSize={10} fontWeight="bold" label={{ value: "Usia (Bulan)", position: "insideBottom", offset: -16, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <YAxis stroke="#475569" fontSize={10} fontWeight="bold" domain={[1, 20]} ticks={[2,4,6,8,10,12,14,16,18,20]} label={{ value: "BB (kg)", angle: -90, position: "insideLeft", offset: 12, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "10px", border: "none", fontSize: "10px", fontWeight: "bold" }} />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontWeight: "bold" }} />
                              <Line type="monotone" dataKey="+3 SD (Obese)" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey="+2 SD (Lebih)" stroke="#EAB308" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="Median" stroke="#10B981" strokeWidth={2.5} dot={false} />
                              <Line type="monotone" dataKey="-2 SD (Kurang)" stroke="#F97316" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="-3 SD (Buruk)" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey={actLabel} stroke={actColor} strokeWidth={3.5} dot={{ r: 5, fill: actColor, stroke: "#FFF", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls />
                            </LineChart>
                          );
                        }

                        // ── BB/U 2–5 Tahun ──
                        if (kmsChartMetric === "bb_2_5") {
                          const src = isMale ? WHO_MALE_BB_24_60 : WHO_FEMALE_BB_24_60;
                          const data = src.map((row) => ({
                            label: `${row.m}`,
                            "-3 SD (Buruk)": row.sd3n,
                            "-2 SD (Kurang)": row.sd2n,
                            "Median": row.med,
                            "+2 SD (Lebih)": row.sd2p,
                            "+3 SD (Obese)": row.sd3p,
                            [actLabel]: getActualWeight(row.m),
                          }));
                          return (
                            <LineChart data={data} margin={{ top: 10, right: 16, left: 2, bottom: 28 }}>
                              <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" />
                              <XAxis dataKey="label" stroke="#475569" fontSize={10} fontWeight="bold" label={{ value: "Usia (Bulan)", position: "insideBottom", offset: -16, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <YAxis stroke="#475569" fontSize={10} fontWeight="bold" domain={[8, 30]} ticks={[8,10,12,14,16,18,20,22,24,26,28,30]} label={{ value: "BB (kg)", angle: -90, position: "insideLeft", offset: 12, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "10px", border: "none", fontSize: "10px", fontWeight: "bold" }} />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontWeight: "bold" }} />
                              <Line type="monotone" dataKey="+3 SD (Obese)" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey="+2 SD (Lebih)" stroke="#EAB308" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="Median" stroke="#10B981" strokeWidth={2.5} dot={false} />
                              <Line type="monotone" dataKey="-2 SD (Kurang)" stroke="#F97316" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="-3 SD (Buruk)" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey={actLabel} stroke={actColor} strokeWidth={3.5} dot={{ r: 5, fill: actColor, stroke: "#FFF", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls />
                            </LineChart>
                          );
                        }

                        // ── PB/U 0–2 Tahun ──
                        if (kmsChartMetric === "pb_0_2") {
                          const src = isMale ? WHO_MALE_PB_0_24 : WHO_FEMALE_PB_0_24;
                          const data = src.map((row) => ({
                            label: `${row.m}`,
                            "-3 SD (Sangat Pendek)": row.sd3n,
                            "-2 SD (Pendek)": row.sd2n,
                            "Median": row.med,
                            "+2 SD (Tinggi)": row.sd2p,
                            "+3 SD": row.sd3p,
                            [actLabel]: getActualHeight(row.m),
                          }));
                          return (
                            <LineChart data={data} margin={{ top: 10, right: 16, left: 2, bottom: 28 }}>
                              <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" />
                              <XAxis dataKey="label" stroke="#475569" fontSize={10} fontWeight="bold" label={{ value: "Usia (Bulan)", position: "insideBottom", offset: -16, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <YAxis stroke="#475569" fontSize={10} fontWeight="bold" domain={[43, 100]} ticks={[44,50,55,60,65,70,75,80,85,90,95,100]} label={{ value: "PB (cm)", angle: -90, position: "insideLeft", offset: 12, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "10px", border: "none", fontSize: "10px", fontWeight: "bold" }} />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontWeight: "bold" }} />
                              <Line type="monotone" dataKey="+3 SD" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey="+2 SD (Tinggi)" stroke="#EAB308" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="Median" stroke="#10B981" strokeWidth={2.5} dot={false} />
                              <Line type="monotone" dataKey="-2 SD (Pendek)" stroke="#F97316" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="-3 SD (Sangat Pendek)" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey={actLabel} stroke={actColor} strokeWidth={3.5} dot={{ r: 5, fill: actColor, stroke: "#FFF", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls />
                            </LineChart>
                          );
                        }

                        // ── TB/U 2–5 Tahun ──
                        if (kmsChartMetric === "tb_2_5") {
                          const src = isMale ? WHO_MALE_TB_24_60 : WHO_FEMALE_TB_24_60;
                          const data = src.map((row) => ({
                            label: `${row.m}`,
                            "-3 SD (Stunting)": row.sd3n,
                            "-2 SD (Pendek)": row.sd2n,
                            "Median": row.med,
                            "+2 SD (Tinggi)": row.sd2p,
                            "+3 SD": row.sd3p,
                            [actLabel]: getActualHeight(row.m),
                          }));
                          return (
                            <LineChart data={data} margin={{ top: 10, right: 16, left: 2, bottom: 28 }}>
                              <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" />
                              <XAxis dataKey="label" stroke="#475569" fontSize={10} fontWeight="bold" label={{ value: "Usia (Bulan)", position: "insideBottom", offset: -16, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <YAxis stroke="#475569" fontSize={10} fontWeight="bold" domain={[75, 130]} ticks={[75,80,85,90,95,100,105,110,115,120,125,130]} label={{ value: "TB (cm)", angle: -90, position: "insideLeft", offset: 12, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "10px", border: "none", fontSize: "10px", fontWeight: "bold" }} />
                              <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontWeight: "bold" }} />
                              <Line type="monotone" dataKey="+3 SD" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey="+2 SD (Tinggi)" stroke="#EAB308" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="Median" stroke="#10B981" strokeWidth={2.5} dot={false} />
                              <Line type="monotone" dataKey="-2 SD (Pendek)" stroke="#F97316" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="-3 SD (Stunting)" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                              <Line type="monotone" dataKey={actLabel} stroke={actColor} strokeWidth={3.5} dot={{ r: 5, fill: actColor, stroke: "#FFF", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls />
                            </LineChart>
                          );
                        }

                        // ── LK/U 0–5 Tahun ──
                        const lkSrc = isMale ? WHO_MALE_LK_0_60 : WHO_FEMALE_LK_0_60;
                        const lkData = lkSrc.map((row) => ({
                          label: `${row.m}`,
                          "-3 SD": row.sd3n,
                          "-2 SD": row.sd2n,
                          "Median": row.med,
                          "+2 SD": row.sd2p,
                          "+3 SD": row.sd3p,
                          [actLabel]: getActualLK(row.m),
                        }));
                        return (
                          <LineChart data={lkData} margin={{ top: 10, right: 16, left: 2, bottom: 28 }}>
                            <CartesianGrid strokeDasharray="2 2" stroke="#CBD5E1" />
                            <XAxis dataKey="label" stroke="#475569" fontSize={10} fontWeight="bold" label={{ value: "Usia (Bulan)", position: "insideBottom", offset: -16, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                            <YAxis stroke="#475569" fontSize={10} fontWeight="bold" domain={[30, 57]} ticks={[30,32,34,36,38,40,42,44,46,48,50,52,54,56]} label={{ value: "LK (cm)", angle: -90, position: "insideLeft", offset: 12, fill: "#1E293B", fontSize: 10, fontWeight: "bold" }} />
                            <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#F8FAFC", borderRadius: "10px", border: "none", fontSize: "10px", fontWeight: "bold" }} />
                            <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px", fontWeight: "bold" }} />
                            <Line type="monotone" dataKey="+3 SD" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                            <Line type="monotone" dataKey="+2 SD" stroke="#EAB308" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Median" stroke="#10B981" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="-2 SD" stroke="#F97316" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="-3 SD" stroke="#DC2626" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                            <Line type="monotone" dataKey={actLabel} stroke={actColor} strokeWidth={3.5} dot={{ r: 5, fill: actColor, stroke: "#FFF", strokeWidth: 2 }} activeDot={{ r: 7 }} connectNulls />
                          </LineChart>
                        );
                      })()}
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Interpretation */}
                  <div className={`rounded-xl p-3 text-[11px] font-medium leading-relaxed border ${
                    kmsGenderFilter === "P"
                      ? "bg-rose-50/60 border-rose-200 text-rose-950"
                      : "bg-blue-50/60 border-blue-200 text-blue-950"
                  }`}>
                    <strong>💡 Petunjuk Penafsiran Grafik WHO:</strong>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1.5 text-[10px]">
                      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-600 inline-block rounded"/><span>-3 SD → Gizi Buruk / Stunting Berat</span></span>
                      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-orange-500 inline-block rounded"/><span>-2 SD → Gizi Kurang / Pendek</span></span>
                      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block rounded"/><span>Median → Normal / Gizi Baik</span></span>
                      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-yellow-500 inline-block rounded"/><span>+2 SD → Risiko Lebih / Overweight</span></span>
                      <span className="flex items-center gap-1">
                        <span className={`w-4 h-0.5 inline-block rounded ${kmsGenderFilter === "P" ? "bg-[#EA2986]" : "bg-blue-600"}`}/>
                        <span className={`font-black ${kmsGenderFilter === "P" ? "text-[#EA2986]" : "text-blue-800"}`}>
                          {kmsGenderFilter === "P" ? "Garis Pink → Data Aktual ♀ DB" : "Garis Biru → Data Aktual ♂ DB"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500 inline-block rounded" style={{borderStyle:"dashed"}}/><span>+3 SD → Obesitas</span></span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ─── RENDER TABS 2: PENCATATAN PELAYANAN KESEHATAN ANAK YANG SUDAH DITERIMA ─── */}
      {activeTab === "log_imunisasi" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Kategori Usia Berdasarkan Lembar Buku KIA */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block px-2 mb-2">
              Pilih Kelompok Usia Pemantauan
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: "neonatus_28", label: "0 - 28 Hari" },
                { id: "bayi_1", label: "0 - 1 Tahun" },
                { id: "anak_2", label: "1 - 2 Tahun" },
                { id: "anak_3", label: "2 - 3 Tahun" },
                { id: "anak_4", label: "3 - 4 Tahun" },
                { id: "anak_5", label: "4 - 5 Tahun" },
                { id: "anak_6", label: "5 - 6 Tahun" },
              ].map((kat) => (
                <button
                  key={kat.id}
                  type="button"
                  onClick={() => setSelectedKategoriUsia(kat.id as any)}
                  className={`py-2 rounded-lg text-[11px] font-black transition-all text-center cursor-pointer ${
                    selectedKategoriUsia === kat.id
                      ? "bg-white text-gray-950 shadow-xs border"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {kat.label}
                </button>
              ))}
            </div>
          </div>

          {/* MATRIKS TABEL DETAIL BERDASARKAN KATEGORI YANG DIPILIH */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  {selectedKategoriUsia === "neonatus_28" && "Matriks Pelayanan Kesehatan Bayi Umur 0 - 28 Hari"}
                  {selectedKategoriUsia === "bayi_1" && "Matriks Pemantauan Anak Umur 0 - 1 Tahun"}
                  {selectedKategoriUsia === "anak_2" && "Matriks Pemantauan Anak Umur 1 - 2 Tahun"}
                  {selectedKategoriUsia === "anak_3" && "Matriks Pemantauan Anak Umur 2 - 3 Tahun"}
                  {selectedKategoriUsia === "anak_4" && "Matriks Pemantauan Anak Umur 3 - 4 Tahun"}
                  {selectedKategoriUsia === "anak_5" && "Matriks Pemantauan Anak Umur 4 - 5 Tahun"}
                  {selectedKategoriUsia === "anak_6" && "Matriks Pemantauan Anak Umur 5 - 6 Tahun"}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Daftar instrumen pelayanan kesehatan wajib Kemenkes RI yang telah diterima anak.</p>
              </div>
              <span className="text-[9px] font-bold text-[#EA2986] bg-rose-50 border border-rose-200 px-2 py-1 rounded uppercase tracking-wider">
                Diisi Oleh Tenaga Kesehatan
              </span>
            </div>

            {/* KONDISI A: JIKA MEMILIH BAYI 0 - 28 HARI (NEONATUS) */}
            {selectedKategoriUsia === "neonatus_28" && (
              <div className="border rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase text-center">
                      <th className="py-3 px-4 text-left w-1/4">Bayi 0 - 28 Hari</th>
                      {[
                        { key: "k1", label: "0 - 6 Jam" },
                        { key: "k2", label: "6 - 48 Jam (KN1)" },
                        { key: "k3", label: "3 - 7 Hari (KN2)" },
                        { key: "k4", label: "8 - 28 Hari (KN3)" },
                      ].map((col) => (
                        <th key={col.key} className="py-2 px-3 border-l border-gray-700">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span>{col.label}</span>
                            {role === "nakes" && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditPelayananKolomNeonatus(col.key, col.label)}
                                className="text-[9px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-2 py-0.5 rounded shadow-2xs transition cursor-pointer flex items-center gap-0.5"
                                title={`Edit Pelayanan Kolom ${col.label}`}
                              >
                                <MdEdit /> Edit
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs bg-white font-medium text-gray-700 divide-y text-center">
                    <tr className="bg-amber-50/10 font-bold text-gray-900">
                      <td className="p-2.5 text-left bg-gray-50/50">Tgl/Bln/Th &amp; Tempat</td>
                      <td className="p-2.5">{neonatusPelayananData.headerDates?.k1Date || "14/09/2026"}<br/><span className="text-[10px] font-normal text-gray-400">{neonatusPelayananData.headerDates?.k1Place || "Puskesmas"}</span></td>
                      <td className="p-2.5">{neonatusPelayananData.headerDates?.k2Date || "15/09/2026"}<br/><span className="text-[10px] font-normal text-gray-400">{neonatusPelayananData.headerDates?.k2Place || "Puskesmas"}</span></td>
                      <td className="p-2.5">{neonatusPelayananData.headerDates?.k3Date || "19/09/2026"}<br/><span className="text-[10px] font-normal text-gray-400">{neonatusPelayananData.headerDates?.k3Place || "Puskesmas"}</span></td>
                      <td className="p-2.5">{neonatusPelayananData.headerDates?.k4Date || "12/10/2026"}<br/><span className="text-[10px] font-normal text-gray-400">{neonatusPelayananData.headerDates?.k4Place || "Puskesmas"}</span></td>
                    </tr>
                    {[
                      { key: "tali_pusat", item: "Perawatan Tali pusat" },
                      { key: "imd", item: "IMD (Inisiasi Menyusu Dini)" },
                      { key: "vit_k1", item: "Vitamin K1" },
                      { key: "hb0", item: "Imunisasi Hepatitis B (HB0)" },
                      { key: "salep_mata", item: "Salep/Tetes Mata Antibiotik" },
                      { key: "shk", item: "Skrining BBL / SHK" },
                      { key: "buku_kia", item: "Buku KIA (Diberikan/Edukasi)" },
                    ].map(({ key, item }) => {
                      const rowData = neonatusPelayananData.items?.[key] || DEFAULT_NEONATUS_PELAYANAN.items[key as keyof typeof DEFAULT_NEONATUS_PELAYANAN.items] || {};
                      return (
                        <tr key={key} className="hover:bg-gray-50/40">
                          <td className="p-2.5 font-bold text-left bg-gray-50">{item}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{rowData.k1 || "-"}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{rowData.k2 || "-"}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{rowData.k3 || "-"}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{rowData.k4 || "-"}</td>
                        </tr>
                      );
                    })}
                    {/* Baris Khusus Triple Eliminasi Bayi Neonatus */}
                    <tr className="bg-pink-50/10">
                      <td className="p-2.5 font-bold text-left bg-gray-50">Tripel Eliminasi (H, S, Hep B)</td>
                      <td className="p-2.5 font-black text-[10px]" colSpan={4}>
                        <div className="flex justify-center gap-6 text-emerald-700">
                          <span>HIV: {neonatusPelayananData.items?.triple?.hiv || "Non-Reaktif"}</span>
                          <span>Sifilis: {neonatusPelayananData.items?.triple?.sifilis || "Non-Reaktif"}</span>
                          <span>Hepatitis B: {neonatusPelayananData.items?.triple?.hepB || "Non-Reaktif"}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* KONDISI B: JIKA MEMILIH RENTANG USIA TAHUNAN (0-1 TAHUN s/d 5-6 TAHUN) */}
            {selectedKategoriUsia !== "neonatus_28" && (() => {
              const catData = tahunanPelayananData[selectedKategoriUsia] || DEFAULT_TAHUNAN_PELAYANAN[selectedKategoriUsia] || DEFAULT_TAHUNAN_PELAYANAN.bayi_1;
              const visits = catData.visits || Array.from({ length: 8 }, () => ({ date: "-", place: "-" }));
              const items = catData.items || {};

              return (
                <div className="border rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase text-center">
                        <th className="py-3 px-4 text-left w-1/5">Indikator Pelayanan</th>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <th key={i} className="py-2 px-2 border-l border-gray-700 text-[10px]">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span>Kunjungan {i + 1}</span>
                              {role === "nakes" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditPelayananKolomTahunan(i, selectedKategoriUsia)}
                                  className="text-[9px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-2 py-0.5 rounded shadow-2xs transition cursor-pointer flex items-center gap-0.5"
                                  title={`Edit Pelayanan Kunjungan ${i + 1}`}
                                >
                                  <MdEdit /> Edit
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-xs bg-white font-medium text-gray-700 divide-y text-center">
                      <tr className="bg-amber-50/10 font-bold text-gray-900">
                        <td className="p-2.5 text-left bg-gray-50/50">Tgl &amp; Tempat</td>
                        {visits.map((v: any, idx: number) => (
                          <td key={idx}>
                            {v.date && v.date !== "-" ? (
                              <>
                                {v.date}<br/>
                                <span className="text-[9px] font-normal text-gray-400">{v.place || "Puskesmas"}</span>
                              </>
                            ) : (
                              <span className="text-gray-300 font-normal">-</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      
                      {[
                        { key: "bb", label: "Berat Badan (BB)" },
                        { key: "tb", label: selectedKategoriUsia === "bayi_1" || selectedKategoriUsia === "anak_2" ? "Panjang Badan (PB)" : "Tinggi Badan (TB)" },
                        { key: "lk", label: "Lingkar Kepala (LK)" },
                        { key: "perkembangan", label: "Perkembangan (KPSP/KIA)" },
                        { key: "kie", label: "Pemberian KIE / Konseling" },
                        { key: "imunisasi", label: "Imunisasi Masuk", hide: ["anak_3", "anak_4", "anak_5"] },
                        { key: "vita", label: selectedKategoriUsia === "bayi_1" ? "Vitamin A" : "Vit. A & Obat Cacing", hide: ["anak_6"] },
                        { key: "cacing", label: "Obat Cacing", showOnly: ["anak_6"] },
                      ].filter(row => {
                        if (row.hide?.includes(selectedKategoriUsia)) return false;
                        if (row.showOnly && !row.showOnly.includes(selectedKategoriUsia)) return false;
                        return true;
                      }).map((row) => {
                        const vals: string[] = items[row.key] || Array(8).fill("-");
                        return (
                          <tr key={row.key} className="hover:bg-gray-50/40">
                            <td className="p-2.5 font-bold text-left bg-gray-50">{row.label}</td>
                            {vals.map((v: string, i: number) => (
                              <td key={i} className={v && v !== "-" ? "text-emerald-600 font-bold" : "text-gray-300 font-normal"}>
                                {v || "-"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}

                      {(selectedKategoriUsia === "bayi_1" || selectedKategoriUsia === "anak_2") && (
                        <tr className="bg-pink-50/10">
                          <td className="p-2.5 font-bold text-left bg-gray-50">Tripel Eliminasi</td>
                          <td className="p-2.5 font-black text-[9px] text-emerald-700" colSpan={8}>
                            {catData.triple || "Non-Reaktif (3 Parameter)"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─── RENDER TABS 3: PELAYANAN KESEHATAN BAYI UMUR 0 - 28 HARI (NEONATUS) ─── */}
      {activeTab === "neonatus" && (() => {
        const curFase = neonatusFaseData[selectedKN] || MOCK_NEONATUS_DATA[selectedKN];

        return (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Sub-Tabs Penyaring Fase Kunjungan Neonatal (KN) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                  Pilih Fase Pelayanan Neonatus
                </span>
                <span className="text-[10px] font-extrabold text-[#EA2986] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  Fase Terpilih: {curFase.fase}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                {[
                  { id: 0, label: "0 - 6 Jam" },
                  { id: 1, label: "6 - 48 Jam (KN 1)" },
                  { id: 2, label: "3 - 7 Hari (KN 2)" },
                  { id: 3, label: "8 - 28 Hari (KN 3)" },
                ].map((kn) => (
                  <div
                    key={kn.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedKN(kn.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedKN(kn.id);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                      selectedKN === kn.id
                        ? "bg-white text-gray-950 shadow-xs border border-gray-200 ring-1 ring-black/5"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span>{kn.label}</span>
                    {selectedKN === kn.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditFaseNeonatus(kn.id);
                        }}
                        className="text-[9px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-2 py-0.5 rounded-md shadow-2xs transition cursor-pointer flex items-center gap-0.5 shrink-0"
                        title={`Edit Data Fase ${kn.label}`}
                      >
                        <MdEdit /> Edit
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BENTROW BLOCK: Konten Pemeriksaan Medis Terpilih */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* KANVAS KIRI: Rekam Fisik & Tindakan Klinis (7 Kolom) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center border-b pb-3 gap-2">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#EA2986] rounded-full block"/> 
                      Lembar Pemeriksaan: {curFase.fase}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                        MTBS Algoritma Bayi Muda
                      </span>
                      {role === "nakes" && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditFaseNeonatus(selectedKN)}
                          className="text-[10px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-2.5 py-1 rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
                        >
                          <MdEdit /> Edit Data Fase Ini
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid Identitas Batas Kunjungan */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>📅 Tanggal: <span className="text-gray-900 font-black">{curFase.tanggal || "-"}</span></div>
                    <div>⏰ Jam Periksa: <span className="text-gray-900 font-black">{curFase.jam ? `${curFase.jam} WIB` : "-"}</span></div>
                    <div>🧪 No. Batch: <span className="text-gray-500 font-mono font-semibold">{curFase.batch || "-"}</span></div>
                  </div>

                  {/* Indikator Fisik & Antropometri */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Hasil Pengukuran Fisik</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white border rounded-xl p-2.5"><span className="text-[10px] text-gray-400 block font-bold">BB (Berat)</span><span className="text-sm font-black text-gray-900">{curFase.bb || "-"} g</span></div>
                      <div className="bg-white border rounded-xl p-2.5"><span className="text-[10px] text-gray-400 block font-bold">PB (Panjang)</span><span className="text-sm font-black text-gray-900">{curFase.pb || "-"} cm</span></div>
                      <div className="bg-white border rounded-xl p-2.5"><span className="text-[10px] text-gray-400 block font-bold">LK (Kepala)</span><span className="text-sm font-black text-gray-900">{curFase.lk || "-"} cm</span></div>
                    </div>
                  </div>

                  {/* Checklist Komponen Pelayanan Kesehatan Neonatus */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Checklist Pelayanan Kesehatan yang Diterima</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-700">
                      {selectedKN === 0 && (
                        <>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Inisiasi Menyusu Dini (IMD)</span><span className="text-emerald-700 font-black">{curFase.imd || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Suntik Vitamin K1</span><span className="text-emerald-700 font-black">{curFase.vitK || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Salep/Tetes Mata Antibiotik</span><span className="text-emerald-700 font-black">{curFase.salepMata || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Imunisasi Hepatitis B (HB0)</span><span className="text-emerald-700 font-black">{curFase.hb0 || "-"}</span></div>
                        </>
                      )}
                      {selectedKN === 1 && (
                        <>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Menyusu Aktif / Adekuat</span><span className="text-emerald-700 font-black">{curFase.menyusu || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Perawatan Tali Pusar</span><span className="text-emerald-700 font-black">{curFase.taliPusat || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Skrining Hipotiroid (SHK)</span><span className="text-indigo-700 font-black">{curFase.shk || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Skrining PJB Kritis (24-48 Jam)</span><span className="text-indigo-700 font-black">{curFase.pjbKritis || "-"}</span></div>
                        </>
                      )}
                      {selectedKN >= 2 && (
                        <>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Menyusu / Kebutuhan ASI</span><span className="text-emerald-700 font-black">{curFase.menyusu || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Kondisi Tali Pusar</span><span className="text-emerald-700 font-black">{curFase.taliPusat || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Skrining Tanda Bahaya</span><span className="text-rose-700 font-black">{curFase.tandaBahaya || "-"}</span></div>
                          <div className="p-2.5 bg-gray-50 border rounded-lg flex justify-between"><span>Identifikasi Ikterus (Kuning)</span><span className="text-emerald-700 font-black">{curFase.ikterus || "-"}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t text-[11px] font-bold text-gray-400 flex justify-between items-center">
                  <span>Tenaga Kesehatan Pemeriksa: <span className="text-gray-800 font-black">{curFase.nakes || "Bidan Desa"}</span></span>
                  <span>Buku KIA Hal. 116</span>
                </div>
              </div>

              {/* KANVAS KANAN: Laboratorium, Kramer Score & Rujukan (5 Kolom) */}
              <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
                
                {/* Box A: Triple Eliminasi Berkala */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Hasil Uji Laboratorium Triple Eliminasi Prenatal/Bayi</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl"><span className="block text-gray-400 font-bold text-[9px] mb-0.5">HIV (H)</span>{curFase.hiv || "Non-Reaktif"}</div>
                    <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl"><span className="block text-gray-400 font-bold text-[9px] mb-0.5">Sifilis (S)</span>{curFase.sifilis || "Non-Reaktif"}</div>
                    <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl"><span className="block text-gray-400 font-bold text-[9px] mb-0.5">Hep B</span>{curFase.hepB || "Non-Reaktif"}</div>
                  </div>
                </div>

                {/* Box B: Visualisasi Penanda Kramer Score (Hanya Muncul di KN2 & KN3) */}
                {selectedKN >= 2 ? (
                  <div className="bg-[#EA2986]/5 border border-[#EA2986]/20 rounded-2xl p-4 shadow-xs space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Peta Identifikasi Ikterus (Kramer Score)</span>
                    <div className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl text-[11px] font-medium text-amber-900 leading-normal flex gap-2">
                      <span className="text-lg">👶</span>
                      <div>
                        <strong>Hasil Pemetaan Tubuh:</strong> Bayi terpantau bersih. Tidak ada indikasi akumulasi warna kuning di area kepala (Kramer 1), badan (Kramer 2), paha (Kramer 3), maupun ujung kaki/tangan (Kramer 4-5).
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center p-6 text-gray-400 text-xs">
                    <span>ℹ️</span>
                    <p className="mt-1 font-medium text-[11px]">Skrining visual perluasan ikterus (Kramer) dilakukan mulai usia &gt; 3 hari setelah bersalin.</p>
                  </div>
                )}

                {/* Box C: Temuan Keluhan & Rujukan */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-2.5">
                  <div className="p-2.5 bg-gray-50 border rounded-xl text-xs">
                    <span className="text-[9px] text-gray-400 block font-black uppercase tracking-wide">Masalah yang Ditemukan:</span>
                    <p className="font-bold text-gray-700 mt-0.5">{curFase.masalah || "-"}</p>
                  </div>
                  <div className="p-2.5 bg-gray-50 border rounded-xl text-xs">
                    <span className="text-[9px] text-gray-400 block font-black uppercase tracking-wide">Dirujuk Ke faskes/RS:</span>
                    <p className="font-bold text-gray-700 mt-0.5">{curFase.rujukan || "-"}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Baris Khusus Kaki Halaman: Catatan Penting & Resume Narasi Medis Terpisah */}
            <div className="space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Catatan Penting Pelayanan Neonatus</span>
                <p className="text-xs font-bold text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                  Seluruh parameter refleks neurologis primitif (rooting, sucking, moro, plantar) bayi muda berkembang baik dan simetris. Tali pusar terawat bersih, sirkulasi paru-jantung stabil, dan berat badan adaptif berada pada kurva normal rujukan standar nasional Kemenkes RI.
                </p>
              </div>
              
              <div className="p-3 bg-[#EA2986]/5 border border-[#EA2986]/20 text-[10px] font-bold text-gray-500 rounded-xl">
                * Tanda penandaan strip (—) menandakan parameter tidak ada masalah atau tidak memerlukan tindakan rujukan terencana harian.
              </div>
            </div>

          </div>
        );
      })()}

      {/* ─── RENDER TABS 4: PELAYANAN GIZI (PMBA, VIT A) & CATATAN KESEHATAN GIGI ─── */}
      {activeTab === "gizi" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Internal untuk Memisahkan Berkas Gizi & Gigi */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Lembar Berkas Pelayanan Gizi &amp; Gigi Anak
            </span>
            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveGiziSubTab("matriks_gizi")}
                className={`py-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${activeGiziSubTab === "matriks_gizi" ? "bg-white text-gray-950 shadow-xs border" : "text-gray-500 hover:text-gray-900"}`}
              >
                Matriks Gizi &amp; PMBA
              </button>
              <button
                type="button"
                onClick={() => setActiveGiziSubTab("vit_a")}
                className={`py-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${activeGiziSubTab === "vit_a" ? "bg-white text-gray-950 shadow-xs border" : "text-gray-500 hover:text-gray-900"}`}
              >
                Vitamin A &amp; Obat Cacing
              </button>
              <button
                type="button"
                onClick={() => setActiveGiziSubTab("gigi")}
                className={`py-2 rounded-lg text-xs font-black transition-all text-center cursor-pointer ${activeGiziSubTab === "gigi" ? "bg-white text-gray-950 shadow-xs border" : "text-gray-500 hover:text-gray-900"}`}
              >
                Catatan Kesehatan Gigi
              </button>
            </div>
          </div>

          {/* KONTEN SUB-TAB 1: MATRIKS KOMPREHENSIF PMBA */}
          {activeGiziSubTab === "matriks_gizi" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Pelayanan Gizi (PMBA) Berkala</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Matriks evaluasi nasihat pemberian ASI, variasi, tekstur, porsi, dan frekuensi MPASI. Klik tombol <MdEdit className="inline" /> di setiap header kolom usia untuk mengedit.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded uppercase tracking-wider">
                    Diisi Oleh Tenaga Kesehatan
                  </span>
                </div>
              </div>

            <div className="border rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider text-center">
                    <th className="py-2.5 px-3 text-left w-1/5 bg-gray-900 sticky left-0 z-10">Nasihat Klinis</th>
                    <th className="py-2.5 px-3 text-left w-1/5 bg-gray-800">Detail Parameter</th>
                    {[
                      { key: "0", label: "0 Bln" },
                      { key: "1", label: "1 Bln" },
                      { key: "2", label: "2 Bln" },
                      { key: "3", label: "3 Bln" },
                      { key: "4", label: "4 Bln" },
                      { key: "5", label: "5 Bln" },
                      { key: "6_8", label: "6-8 Bln", bg: "bg-pink-950/20" },
                      { key: "9_11", label: "9-11 Bln", bg: "bg-pink-950/20" },
                      { key: "12_23", label: "12-23 Bln", bg: "bg-emerald-950/20" },
                      { key: "23_59", label: "23-59 Bln", bg: "bg-emerald-950/20" },
                    ].map((col) => (
                      <th key={col.key} className={`py-2 px-1 border-l border-gray-700 ${col.bg || ""}`}>
                        <div className="text-[10px] font-black text-white">{col.label}</div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditGiziCol(col.key, col.label)}
                          className="mt-1 text-[9px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                        >
                          <MdEdit /> Edit
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs bg-white text-gray-700 font-medium divide-y divide-gray-100 text-center">
                  
                  {/* KLASTER ASI */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={3}>ASI</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Frekuensi menyusui</td>
                    {["0","1","2","3","4","5","6_8","9_11","12_23","23_59"].map((k) => (
                      <td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.asi_frekuensi?.[k] || "✓"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Posisi Menyusu (Pelekatan)</td>
                    {["0","1","2","3","4","5","6_8","9_11","12_23","23_59"].map((k) => (
                      <td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.asi_posisi?.[k] || "✓"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">ASI Perah</td>
                    {["0","1","2","3","4","5","6_8","9_11","12_23","23_59"].map((k) => (
                      <td key={k}>{giziPmbaData?.asi_perah?.[k] || "-"}</td>
                    ))}
                  </tr>

                  {/* KLASTER MPASI */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={2}>MPASI</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Ya</td>
                    {["0","1","2","3","4","5"].map((k) => (
                      <td key={k} className="text-gray-300 bg-gray-50/50">❌</td>
                    ))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (
                      <td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.mpasi_ya?.[k] || "✓"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Tidak</td>
                    {["0","1","2","3","4","5"].map((k) => (
                      <td key={k} className="text-emerald-600 font-bold">✓</td>
                    ))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (
                      <td key={k} className="text-gray-300 bg-gray-50/50">{giziPmbaData?.mpasi_tidak?.[k] || "❌"}</td>
                    ))}
                  </tr>

                  {/* KLASTER VARIASI MPASI */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={6}>Variasi MPASI</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Beras / Makanan Pokok</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.variasi_pokok?.[k] || "✓"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Lauk / Protein (Hewani/Nabati)</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.variasi_lauk?.[k] || "✓"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Minyak / Lemak</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className="text-emerald-600 font-bold">{giziPmbaData?.variasi_minyak?.[k] || "✓"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Sayur</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k}>{giziPmbaData?.variasi_sayur?.[k] || "✓"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Buah</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k}>{giziPmbaData?.variasi_buah?.[k] || "✓"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Lainnya</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k}>{giziPmbaData?.variasi_lainnya?.[k] || "-"}</td>))}
                  </tr>

                  {/* KLASTER TEKSTUR MPASI */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={4}>Tekstur MPASI</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Disaring</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.tekstur_saring?.[k] === "✓ Saring" ? "text-indigo-600 font-bold" : "text-gray-300"}>{giziPmbaData?.tekstur_saring?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Dihaluskan</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.tekstur_lumat?.[k] === "✓ Lumat" ? "text-indigo-600 font-bold" : "text-gray-300"}>{giziPmbaData?.tekstur_lumat?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Dicincang</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.tekstur_cincang?.[k] === "✓ Cincang" ? "text-indigo-600 font-bold" : "text-gray-300"}>{giziPmbaData?.tekstur_cincang?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Makanan Rumah</td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.tekstur_keluarga?.[k] ? "text-indigo-600 font-bold" : "text-gray-300"}>{giziPmbaData?.tekstur_keluarga?.[k] || "❌"}</td>))}
                  </tr>

                  {/* KLASTER JUMLAH MAKAN */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={4}>Jumlah Setiap Kali Makan</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">2 - 3 sdm <span className="text-[10px] text-gray-400 block font-normal">(1/2 mangkok 250ml)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.porsi_1?.[k] === "✓ Terpenuhi" ? "text-emerald-600 font-bold" : "text-gray-300"}>{giziPmbaData?.porsi_1?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">1/2 - 3/4 mangkok <span className="text-[10px] text-gray-400 block font-normal">(250ml)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.porsi_2?.[k] === "✓ Terpenuhi" ? "text-emerald-600 font-bold" : "text-gray-300"}>{giziPmbaData?.porsi_2?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">3/4 - 1 mangkok <span className="text-[10px] text-gray-400 block font-normal">(250ml)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.porsi_3?.[k] === "✓ Terpenuhi" ? "text-emerald-600 font-bold" : "text-gray-300"}>{giziPmbaData?.porsi_3?.[k] || "❌"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">1 mangkok <span className="text-[10px] text-gray-400 block font-normal">(250ml)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className={giziPmbaData?.porsi_4?.[k] === "✓ Terpenuhi" ? "text-emerald-600 font-bold" : "text-gray-300"}>{giziPmbaData?.porsi_4?.[k] || "❌"}</td>))}
                  </tr>

                  {/* KLASTER FREKUENSI MAKAN */}
                  <tr>
                    <td className="p-2 px-3 font-black text-left bg-gray-100 sticky left-0" rowSpan={2}>Frekuensi Makan</td>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Makanan Utama <span className="text-[10px] text-gray-400 block font-normal">(3x / hari)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k} className="text-indigo-600 font-bold">{giziPmbaData?.frekuensi_utama?.[k] || "3x Sehari"}</td>))}
                  </tr>
                  <tr>
                    <td className="p-2 px-3 text-left bg-gray-50/50">Makanan Selingan <span className="text-[10px] text-gray-400 block font-normal">(2x / hari)</span></td>
                    {["0","1","2","3","4","5"].map((k) => (<td key={k} className="text-gray-200 bg-gray-100">-</td>))}
                    {["6_8","9_11","12_23","23_59"].map((k) => (<td key={k}>{giziPmbaData?.frekuensi_selingan?.[k] || "✓ 2x"}</td>))}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* KONTEN SUB-TAB 2: KAPSUL VITAMIN A & OBAT CACING */}
          {activeGiziSubTab === "vit_a" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Pemberian Vitamin A &amp; Obat Cacing</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Matriks validasi pemberian berkala. Klik <MdEdit className="inline" /> Edit pada header kolom usia untuk mencatat tanggal &amp; batch.</p>
                </div>
              </div>

            <div className="border rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-800 text-[10px] font-extrabold text-white uppercase tracking-wider text-center">
                    <th className="py-2.5 px-3 text-left w-1/4 bg-gray-900">Vitamin A dan Obat Cacing</th>
                    {[
                      { key: "bln_6_11", label: "Bulan 6 - 11" },
                      { key: "th1", label: "Tahun 1 - 2" },
                      { key: "th2", label: "Tahun 2 - 3" },
                      { key: "th3", label: "Tahun 3 - 4" },
                      { key: "th4", label: "Tahun 4 - 5" },
                      { key: "th5", label: "Tahun 5 - 6" },
                    ].map((col) => (
                      <th key={col.key} className="py-2.5 px-2 w-28 border-l border-gray-700">
                        <div className="text-[10px] font-black text-white">{col.label}</div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVitACol(col.key, col.label)}
                          className="mt-1 text-[9px] font-black text-blue-950 bg-blue-400 hover:bg-blue-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                        >
                          <MdEdit /> Edit
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs bg-white font-bold text-gray-700 divide-y divide-gray-100 text-center">
                  
                  {/* VIT A KAPSUL BIRU */}
                  <tr>
                    <td className="p-3 text-left bg-gray-50/70">
                      <span className="text-blue-600 block">🔵 VIT A KAPSUL BIRU</span>
                      <span className="text-[10px] text-gray-400 font-normal block">(100.000 IU) — Februari / Agustus</span>
                    </td>
                    <td className="bg-emerald-50 text-emerald-700 font-black text-xs">
                      {vitAObatCacingData?.vitA_biru?.tanggal ? (
                        <>
                          {vitAObatCacingData.vitA_biru.tanggal}<br/>
                          <span className="text-[9px] font-normal text-gray-400">Batch: {vitAObatCacingData.vitA_biru.batch || "-"}</span>
                        </>
                      ) : (
                        <span className="text-gray-400 font-normal">Belum Diberikan</span>
                      )}
                    </td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                  </tr>

                  {/* VIT A KAPSUL MERAH FEBRUARI & AGUSTUS */}
                  <tr>
                    <td className="p-3 text-left bg-gray-50/70">
                      <span className="text-rose-600 block">🔴 VIT A KAPSUL MERAH</span>
                      <span className="text-[10px] text-gray-400 font-normal block">(200.000 IU) — Setiap Februari &amp; Agustus</span>
                    </td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">❌ Disabled</td>
                    {["th1","th2","th3","th4","th5"].map((k) => {
                      const item = vitAObatCacingData?.[`vitA_merah_${k}`];
                      return (
                        <td key={k} className={item?.tanggal ? "bg-rose-50 text-rose-700 font-black text-xs" : "text-gray-400 font-medium"}>
                          {item?.tanggal ? (
                            <>
                              {item.tanggal}<br/>
                              <span className="text-[9px] font-normal text-gray-400">Batch: {item.batch || "-"}</span>
                            </>
                          ) : "Belum"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* OBAT CACING */}
                  <tr>
                    <td className="p-3 text-left bg-gray-50/70">
                      <span className="text-amber-700 flex items-center gap-1 font-black"><MdMedication className="text-base" /> OBAT CACING</span>
                      <span className="text-[10px] text-gray-400 font-normal block">Pencegahan Infeksi Parasit Cacingan</span>
                    </td>
                    <td className="bg-gray-200/70 text-gray-400 font-normal">— Disabled</td>
                    {["th1","th2","th3","th4","th5"].map((k) => {
                      const item = vitAObatCacingData?.[`cacing_${k}`];
                      return (
                        <td key={k} className={item?.tanggal ? "bg-amber-50 text-amber-800 font-black text-xs" : "text-gray-400 font-medium"}>
                          {item?.tanggal ? (
                            <>
                              {item.tanggal}<br/>
                              <span className="text-[9px] font-normal text-gray-400">Batch: {item.batch || "-"}</span>
                            </>
                          ) : "Belum"}
                        </td>
                      );
                    })}
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* ✅ KONTEN SUB-TAB 3 BARU: CATATAN KESEHATAN GIGI (HALAMAN 126) */}
          {activeGiziSubTab === "gigi" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Catatan Pemeriksaan Kesehatan Gigi Anak</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Matriks monitoring pertumbuhan erupsi gigi, kebersihan plak, dan penilaian zonasi risiko karies gigi berlubang.</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded uppercase tracking-wider">
                  Buku KIA Halaman 126
                </span>
              </div>

              {/* Tabel Catatan Gigi Bergaris Tegas/Gelap */}
              <div className="border border-gray-400 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider text-center">
                      <th className="py-2.5 px-2 border-r border-gray-700" colSpan={2}>Pemeriksaan</th>
                      <th className="py-2.5 px-2 border-r border-gray-700" colSpan={2}>Jumlah Gigi</th>
                      <th className="py-2.5 px-2 border-r border-gray-700" colSpan={2}>Plak</th>
                      <th className="py-2.5 px-2 border-r border-gray-700" colSpan={3}>Risiko Gigi Berlubang</th>
                      <th className="py-2.5 px-2">Aksi</th>
                    </tr>
                    <tr className="bg-gray-800 text-[9px] font-bold text-white text-center">
                      <th className="py-2 px-1 border-r border-gray-600 w-16">Bulan</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-24">Tanggal</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-16">Ada</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-16">Berlubang</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-16">Bersih</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-16">Kotor</th>
                      <th className="py-2 px-1 border-r border-gray-600 w-20 bg-rose-950/40">Tinggi</th>
                      <th className="py-2 px-1 border-r border-gray-600 bg-amber-950/40">Sedang</th>
                      <th className="py-2 px-1 border-r border-gray-600 bg-emerald-950/40">Rendah</th>
                      <th className="py-2 px-1 w-14">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs bg-white text-gray-800 font-medium divide-y divide-gray-400 text-center">
                    {(gigiRecordsData.length > 0 ? gigiRecordsData : DEFAULT_GIGI_RECORDS).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/40">
                        <td className="p-2.5 font-black bg-gray-50 border-r border-gray-400 text-gray-900">{row.bln}</td>
                        <td className="p-2.5 border-r border-gray-400 text-gray-600 font-mono">{row.tgl || "—"}</td>
                        <td className="p-2.5 border-r border-gray-400 font-bold">{row.ada || "—"}</td>
                        <td className={`p-2.5 border-r border-gray-400 font-bold ${row.lubang && row.lubang !== "0" ? "text-rose-600" : ""}`}>{row.lubang || "—"}</td>
                        <td className="p-2.5 border-r border-gray-400 text-emerald-600 font-black">{row.bersih || "—"}</td>
                        <td className="p-2.5 border-r border-gray-400 text-amber-600 font-black">{row.kotor || "—"}</td>
                        
                        {/* Kolom Risiko Tinggi (Arsir Pink jika aktif) */}
                        <td className={`p-2.5 border-r border-gray-400 transition-colors ${row.r === "Tinggi" ? "bg-rose-100 text-rose-700 font-black" : "bg-rose-50/20 text-transparent"}`}>● Tinggi</td>
                        
                        {/* Kolom Risiko Sedang (Arsir Kuning jika aktif) */}
                        <td className={`p-2.5 border-r border-gray-400 transition-colors ${row.r === "Sedang" ? "bg-amber-100 text-amber-800 font-black" : "bg-amber-50/20 text-transparent"}`}>● Sedang</td>
                        
                        {/* Kolom Risiko Rendah (Arsir Hijau jika aktif) */}
                        <td className={`p-2.5 border-r border-gray-400 transition-colors ${row.r === "Rendah" ? "bg-emerald-100 text-emerald-700 font-black" : "bg-emerald-50/20 text-transparent"}`}>✓ Rendah</td>

                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGigiModal(row, idx)}
                            className="px-2 py-1 text-[11px] font-black text-[#EA2986] bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg transition cursor-pointer"
                          >
                            <MdEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legenda Keterangan Risiko Gigi Sesuai Catatan Kaki Buku KIA */}
              <div className="pt-3 border-t border-gray-200">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-2">Legenda Kriteria Risiko Karies:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] font-bold text-gray-600">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-100 border border-rose-300 rounded"/> <span>Ada gigi berlubang. Ada faktor risiko. (Risiko Tinggi)</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded"/> <span>Tidak ada gigi berlubang. Ada faktor risiko. (Risiko Sedang)</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"/> <span>Tidak ada gigi berlubang. Tidak ada faktor risiko. (Risiko Rendah)</span></div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── RENDER TABS 5: IMUNISASI DASAR BAYI, BADUTA & MATRIKS LOG PELAYANAN ─── */}
      {activeTab === "imunisasi_dasar" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BENTO CARD 1: PANDUAN VISUAL SASARAN IMUNISASI & MANFAAT PENCEGAHAN */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-gray-900">Jadwal Sasaran Imunisasi Dasar Bayi &amp; Baduta</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Panduan jenis antigen vaksin berdasarkan kelompok usia beserta daftar penyakit infeksi yang dicegah.</p>
            </div>

            {/* Grid Kartu Edukasi Mengikuti Infografis Buku KIA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
              {[
                { umur: "0-24 Jam", vaks: "HB0", cegah: ["Hepatitis B", "Kanker Hati"] },
                { umur: "1 Bulan", vaks: "BCG, OPV 1", cegah: ["Tuberkulosis", "Polio (Lumpuh Layu)"] },
                { umur: "2 Bulan", vaks: "DPT-HB-Hib 1, OPV 2, PCV 1, RV 1*", cegah: ["Difteri, Pertusis, Tetanus", "Hep B, Pneumonia, Diare"] },
                { umur: "3 Bulan", vaks: "DPT-HB-Hib 2, OPV 3, PCV 2, RV 2*", cegah: ["Difteri, Pertusis, Tetanus", "Hep B, Pneumonia, Diare"] },
                { umur: "4 Bulan", vaks: "DPT-HB-Hib 3, OPV 4, IPV 1, RV 3*", cegah: ["Difteri, Pertusis, Tetanus", "Polio Suntik, Pneumonia, Diare"] },
                { umur: "9 Bulan", vaks: "Campak Rubella 1, IPV 2***", cegah: ["Campak", "Rubella", "Polio"] },
                { umur: "10 Bulan", vaks: "JE **", cegah: ["Japanese Encephalitis (Radang Otak)"] },
                { umur: "12 & 18 M", vaks: "PCV 3 & Booster Lanjutan", cegah: ["Pneumonia", "Meningitis, MR Lanjutan"] },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between min-h-[140px] shadow-3xs">
                  <div>
                    <span className="px-2 py-0.5 bg-gray-900 text-white font-black rounded text-[8px] block w-max uppercase tracking-wide">{item.umur}</span>
                    <h4 className="font-black text-[#EA2986] text-[11px] mt-2 leading-tight">{item.vaks}</h4>
                  </div>
                  <div className="pt-2 border-t border-gray-200/60 mt-2">
                    <span className="text-[8px] text-gray-400 font-bold block uppercase tracking-wider">Mencegah:</span>
                    <ul className="text-[9px] text-gray-600 font-medium leading-tight space-y-0.5 mt-0.5">
                      {item.cegah.map((c, i) => <li key={i}>• {c}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BENTO CARD 2: MATRIKS FORMAT FORMAL REKAM IMUNISASI BUKU KIA */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-black text-gray-900">Pelayanan Imunisasi (Registrasi &amp; Pencatatan Batch)</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Matriks pencatatan tanggal pemberian dan nomor batch produk vaksin sesuai zonasi rentang bulan Buku KIA.</p>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded uppercase tracking-wider">
                Tenaga Kesehatan
              </span>
            </div>

            {/* Kontainer Tabel Utama */}
            <div className="border border-gray-400 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider text-center">
                    <th className="py-2.5 px-3 text-left w-64 bg-gray-900 sticky left-0 z-10" rowSpan={2}>Jenis Vaksin &amp; No. Batch</th>
                    <th className="py-2.5 px-2 border-l border-gray-700" colSpan={16}>Pemberian Berdasarkan Usia Rentang Bulan Anak</th>
                    {role === "nakes" && (
                      <th className="py-2.5 px-2 border-l border-gray-700 w-16" rowSpan={2}>Aksi</th>
                    )}
                  </tr>
                  <tr className="bg-gray-800 text-[9px] font-bold text-white text-center">
                    {/* Header Kolom Bulan 0 s/d 23-59 sesuai gambar Buku KIA */}
                    {["0","1","2","3","4","5","6","7","8","9","10","11","12","18","23","23-59"].map((bln, i) => (
                      <th key={i} className="py-2 px-1 border-l border-gray-600 w-12">{bln} M</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[11px] bg-white text-gray-700 font-medium divide-y divide-gray-100 text-center">
                  {imunisasiData.map((row, idx) => {
                    const isEditing = editingImunisasiId === row.id;
                    return (
                    <tr key={row.id || idx} className="hover:bg-gray-50/40 transition-colors">
                      {/* Sisi Kiri Terkunci: Nama Vaksin & Slot Batch + Metadata */}
                      <td className="p-2 px-3 text-left bg-gray-50 sticky left-0 font-bold border-r shadow-3xs z-10 min-w-[160px]">
                        <span className="text-gray-900 block text-[11px]">{row.nama}</span>
                        {row.batch ? (
                          <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">Batch: {row.batch}</span>
                        ) : (
                          <span className="text-[9px] text-gray-300 font-normal italic block">Batch: —</span>
                        )}
                        {row.nakes && (
                          <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5 truncate max-w-[155px]">👩‍⚕️ {row.nakes}</span>
                        )}
                        {row.status && row.status !== "Belum" && (
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                            row.status === "Tepat Jadwal" ? "bg-emerald-100 text-emerald-700" :
                            row.status === "Terlambat" ? "bg-amber-100 text-amber-700" :
                            row.status === "Terlewat" ? "bg-rose-100 text-rose-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>{row.status}</span>
                        )}
                      </td>

                      {/* Render Cell Mengikuti Format Peta Warna Lembar Asli Buku KIA */}
                      {["0","1","2","3","4","5","6","7","8","9","10","11","12","18","23","59"].map((_, cIdx) => {
                        const isTarget = row.target.includes(cIdx);
                        const isYellow = row.yellow?.includes(cIdx);
                        const isPink = row.pink?.includes(cIdx);
                        const isGray = row.gray?.includes(cIdx);
                        const isDone = isTarget && !!row.done;
                        const isActiveEdit = isEditing && isTarget;

                        // Background warna cell
                        let cellBg = "bg-white";
                        if (isActiveEdit) cellBg = "bg-white ring-2 ring-[#EA2986] ring-inset";
                        else if (isDone) cellBg = "bg-emerald-50 text-emerald-700";
                        else if (isYellow) cellBg = "bg-amber-100/60";
                        else if (isPink) cellBg = "bg-pink-100/50";
                        else if (isGray || (!isTarget && !isYellow && !isPink)) cellBg = "bg-gray-200 text-gray-400 font-normal select-none";

                        // Nakes: klik cell target untuk inline edit
                        const canClickToEdit = role === "nakes" && isTarget && !isEditing;
                        const canClickToClearEdit = role === "nakes" && isTarget && isEditing;

                        if (isActiveEdit) {
                          // ── MODE INLINE EDIT ──
                          return (
                            <td key={cIdx} className={`border border-[#EA2986] border-2 align-top p-1.5 ${cellBg}`} style={{ minWidth: 140 }}>
                              <div className="flex flex-col gap-1">
                                {/* Tanggal */}
                                <input
                                  type="date"
                                  value={inlineImunisasiForm.tgl
                                    ? (() => {
                                        const p = inlineImunisasiForm.tgl.split("/");
                                        if (p.length === 3) {
                                          const [d, m, y] = p;
                                          return y.length === 4 ? `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}` : inlineImunisasiForm.tgl;
                                        }
                                        return inlineImunisasiForm.tgl;
                                      })()
                                    : ""
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (!v) { setInlineImunisasiForm(f => ({...f, tgl: ""})); return; }
                                    const [y,m,d] = v.split("-");
                                    setInlineImunisasiForm(f => ({...f, tgl: `${d}/${m}/${y}`}));
                                  }}
                                  className="w-full text-[9px] border border-gray-300 rounded-md px-1 py-0.5 font-bold outline-none focus:border-[#EA2986] bg-white cursor-pointer"
                                />
                                {/* Batch */}
                                <input
                                  type="text"
                                  value={inlineImunisasiForm.batch}
                                  onChange={(e) => setInlineImunisasiForm(f => ({...f, batch: e.target.value}))}
                                  placeholder="No. Batch"
                                  className="w-full text-[9px] border border-gray-300 rounded-md px-1 py-0.5 font-mono font-bold outline-none focus:border-[#EA2986] bg-white"
                                />
                                {/* Nakes */}
                                <input
                                  type="text"
                                  value={inlineImunisasiForm.nakes}
                                  onChange={(e) => setInlineImunisasiForm(f => ({...f, nakes: e.target.value}))}
                                  placeholder="Nama Nakes"
                                  className="w-full text-[9px] border border-gray-300 rounded-md px-1 py-0.5 font-bold outline-none focus:border-[#EA2986] bg-white"
                                />
                                {/* Status */}
                                <select
                                  value={inlineImunisasiForm.status}
                                  onChange={(e) => setInlineImunisasiForm(f => ({...f, status: e.target.value}))}
                                  className="w-full text-[9px] border border-gray-300 rounded-md px-1 py-0.5 font-bold outline-none focus:border-[#EA2986] bg-white cursor-pointer"
                                >
                                  <option value="Tepat Jadwal">✓ Tepat Jadwal</option>
                                  <option value="Terlambat">! Terlambat</option>
                                  <option value="Terlewat">✗ Terlewat</option>
                                  <option value="Kontraindikasi">⊘ Kontraindikasi</option>
                                </select>
                                {/* Aksi tombol */}
                                <div className="flex gap-1 mt-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveInlineImunisasi(row.id)}
                                    className="flex-1 text-[9px] font-black text-white bg-[#EA2986] hover:bg-[#D01F75] rounded-md py-0.5 transition cursor-pointer"
                                  >✓</button>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineImunisasi}
                                    className="flex-1 text-[9px] font-black text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md py-0.5 transition cursor-pointer"
                                  >✕</button>
                                </div>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td
                            key={cIdx}
                            onClick={canClickToEdit ? () => handleStartInlineImunisasi(row) : undefined}
                            className={`border border-gray-400 font-bold leading-tight transition ${
                              canClickToEdit
                                ? "cursor-pointer hover:ring-2 hover:ring-[#EA2986]/50 hover:ring-inset hover:bg-white"
                                : ""
                            } ${
                              isDone ? "p-2 text-[10px]" : "p-2"
                            } ${cellBg}`}
                          >
                            {isDone ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-black">{row.tgl || row.done}</span>
                                <span className="text-[8px] text-emerald-600">✓ Selesai</span>
                                {role === "nakes" && isTarget && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleStartInlineImunisasi(row); }}
                                    className="text-[8px] text-[#EA2986] hover:underline mt-0.5 cursor-pointer"
                                  >edit</button>
                                )}
                              </div>
                            ) : isTarget && role === "nakes" ? (
                              <span className="text-[9px] text-gray-300 italic">+ isi</span>
                            ) : ""}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legenda Indikator Warna Matriks */}
            <div className="pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block mb-2">Legenda Kodifikasi Warna Pelayanan Imunisasi:</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-bold text-gray-600">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded"/> <span>Putih: Usia Tepat Pemberian Imunisasi Dasar</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-100 border border-amber-200 rounded"/> <span>Kuning: Usia Melengkapi Imunisasi Bayi/Baduta</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-pink-100 border border-pink-200 rounded"/> <span>Rose/Pink: Rentang Booster / Imunisasi Kejar</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"/> <span>Abu-abu: Usia yang Tidak Diperbolehkan / Lewat</span></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL FORM TAMBAH CATATAN PELAYANAN NAKES ─── */}
      {showAddNakesLogModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">Tambah Catatan Pelayanan Nakes</h3>
                <p className="text-xs text-gray-400">Pencatatan pemeriksaan klinis, tindakan medis, &amp; saran resep nakes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNakesLogModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNakesLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tanggal Pemeriksaan *</label>
                  <input
                    type="date"
                    required
                    value={newNakesLogForm.tanggalPeriksa}
                    onChange={(e) => setNewNakesLogForm({ ...newNakesLogForm, tanggalPeriksa: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nama &amp; Gelar Nakes *</label>
                  <input
                    type="text"
                    required
                    value={newNakesLogForm.nakesName}
                    onChange={(e) => setNewNakesLogForm({ ...newNakesLogForm, nakesName: e.target.value })}
                    placeholder="Contoh: Bidan Widya, A.Md.Keb"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Keluhan, Hasil Pemeriksaan, Tindakan &amp; Saran *</label>
                <textarea
                  required
                  rows={4}
                  value={newNakesLogForm.keluhanTindakanSaran}
                  onChange={(e) => setNewNakesLogForm({ ...newNakesLogForm, keluhanTindakanSaran: e.target.value })}
                  placeholder="Tuliskan keluhan anak, hasil diagnosa fisik, imunisasi/tindakan medis yang diberikan, obat, dan saran nakes..."
                  className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tanggal Kembali / Kontrol Ulang (Opsional)</label>
                <input
                  type="date"
                  value={newNakesLogForm.tanggalKembali}
                  onChange={(e) => setNewNakesLogForm({ ...newNakesLogForm, tanggalKembali: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddNakesLogModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Catatan Nakes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL FORM TAMBAH PENGUKURAN LILA NAKES ─── */}
      {/* ─── MODAL INPUT / EDIT PENGUKURAN LILA NAKES ─── */}
      {showAddLilaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {editingLilaMonth !== null ? `Edit Pengukuran LiLA (Usia ${editingLilaMonth} Bulan)` : "Input Pengukuran LiLA Nakes"}
                </h3>
                <p className="text-xs text-gray-400">Pencatatan Lingkar Lengan Atas (LiLA) balita tersimpan ke Database Supabase.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddLilaModal(false);
                  setEditingLilaMonth(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLilaRecord} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Usia Anak (1 s/d 60) *</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    disabled={editingLilaMonth !== null}
                    value={newLilaForm.usiaBulan}
                    onChange={(e) => setNewLilaForm({ ...newLilaForm, usiaBulan: e.target.value })}
                    placeholder="Contoh: 12"
                    className={`w-full text-xs p-2.5 pr-16 border rounded-xl outline-none font-bold text-gray-900 ${
                      editingLilaMonth !== null ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed" : "border-gray-300 focus:ring-2 focus:ring-[#EA2986]"
                    }`}
                  />
                  <span className="absolute right-3 text-xs font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 pointer-events-none select-none">
                    Bulan
                  </span>
                </div>

                {/* Warning Banner untuk Bulan yang Sudah Memiliki Data */}
                {(() => {
                  const selMonth = parseInt(newLilaForm.usiaBulan, 10);
                  const isExisting = !isNaN(selMonth) && lilaRecords[selMonth] !== undefined && editingLilaMonth !== selMonth;
                  if (isExisting) {
                    return (
                      <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 mt-2 flex items-start gap-2 text-[11px] text-amber-900 font-semibold leading-snug">
                        <MdWarning className="text-base shrink-0" />
                        <span>
                          Usia <strong>{selMonth} Bulan</strong> sudah memiliki data LiLA (<strong>{lilaRecords[selMonth]?.val} cm</strong>). Menyimpan data ini akan <strong>memperbarui (mengedit)</strong> data yang sudah ada.
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Hasil Pengukuran LiLA (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newLilaForm.valCm}
                  onChange={(e) => setNewLilaForm({ ...newLilaForm, valCm: e.target.value })}
                  placeholder="Contoh: 12.5"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none font-bold text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  • Usia &lt; 6 Bln: &lt;11 cm (Berisiko), ≥11 cm (Baik)<br/>
                  • Usia ≥ 6 Bln: &lt;11.5 cm (Gizi Buruk), 11.5-12.4 cm (Gizi Kurang), ≥12.5 cm (Gizi Baik)
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tanggal Pemeriksaan *</label>
                <input
                  type="date"
                  required
                  value={newLilaForm.tanggalPeriksa}
                  onChange={(e) => setNewLilaForm({ ...newLilaForm, tanggalPeriksa: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EA2986] outline-none font-semibold text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLilaModal(false);
                    setEditingLilaMonth(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer"
                >
                  {editingLilaMonth !== null ? "Update Pengukuran LiLA" : "Simpan Pengukuran LiLA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL INPUT PENGUKURAN ANTROPOMETRI BALITA (BB / TB / LK) ─── */}
      {showAddAntropometriModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-[#EA2986] flex items-center justify-center text-lg font-black">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Input Pengukuran Antropometri</h3>
                  <p className="text-xs text-gray-500 font-medium">Pasien: {dbChildData?.name || dbChildData?.child_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAntropometriModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <MdClose className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveAntropometri} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tanggal Kunjungan / Pemeriksaan</label>
                <input
                  type="date"
                  value={newAntropometriForm.tanggalPeriksa}
                  onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, tanggalPeriksa: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-semibold outline-none focus:border-[#EA2986]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Contoh: 8.5"
                    value={newAntropometriForm.beratBadan}
                    onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, beratBadan: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-extrabold outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tinggi / Panjang (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 72.0"
                    value={newAntropometriForm.tinggiBadan}
                    onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, tinggiBadan: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-extrabold outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 44.5"
                    value={newAntropometriForm.lingkarKepala}
                    onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, lingkarKepala: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-extrabold outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">LiLA (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Contoh: 12.5"
                    value={newAntropometriForm.lingkarLengan}
                    onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, lingkarLengan: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-extrabold outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Pemeriksaan / Hasil Observasi</label>
                <textarea
                  rows={2}
                  placeholder="Catatan status gizi, tumbuh kembang, atau saran..."
                  value={newAntropometriForm.catatan}
                  onChange={(e) => setNewAntropometriForm({ ...newAntropometriForm, catatan: e.target.value })}
                  className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-medium outline-none focus:border-[#EA2986]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddAntropometriModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer"
                >
                  Simpan Pengukuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT MATRIKS PELAYANAN KESEHATAN ANAK (PER KOLOM KUNJUNGAN) ─── */}
      {showEditPelayananModal && editPelayananTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-black shadow-2xs">
                  <MdEdit />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Pelayanan Kolom: {editPelayananTarget.itemLabel}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Input / Perbarui Seluruh Indikator Pelayanan ({dbChildData?.name || dbChildData?.child_name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPelayananModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePelayananEdit} className="space-y-4">
              {/* MODAL CASE A: NEONATUS PER KOLOM (0-6 Jam / KN1 / KN2 / KN3) */}
              {editPelayananTarget.type === "neonatus" && (
                <div className="space-y-4">
                  {/* Header Tanggal & Tempat */}
                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                    <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>📅</span> Tanggal &amp; Lokasi Pelayanan ({editPelayananTarget.itemLabel})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-600 mb-1">Tanggal Periksa</label>
                        <input
                          type="text"
                          value={editPelayananForm.date || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, date: e.target.value })}
                          placeholder="misal: 14/09/2026"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-600 mb-1">Tempat Pelayanan</label>
                        <input
                          type="text"
                          value={editPelayananForm.place || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, place: e.target.value })}
                          placeholder="misal: Puskesmas Suhat"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-medium outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist Indikator Wajib Neonatal */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-black text-gray-800">Checklist Pelayanan Medis Diterima:</p>
                    {[
                      { key: "tali_pusat", label: "Perawatan Tali Pusar", ph: "Contoh: ✓ Bersih / ✓ Puput/Sembuh / -" },
                      { key: "imd", label: "IMD (Inisiasi Menyusu Dini)", ph: "Contoh: ✓ Dilaksanakan / Lanjut ASI / -" },
                      { key: "vit_k1", label: "Vitamin K1", ph: "Contoh: ✓ Injeksi Done / -" },
                      { key: "hb0", label: "Imunisasi Hepatitis B (HB0)", ph: "Contoh: ✓ (<24 Jam) Done / -" },
                      { key: "salep_mata", label: "Salep/Tetes Mata Antibiotik", ph: "Contoh: ✓ Diberikan / -" },
                      { key: "shk", label: "Skrining BBL / SHK", ph: "Contoh: ✓ Ambil Sampel / ✓ Hasil Normal / -" },
                      { key: "buku_kia", label: "Buku KIA (Diberikan/Edukasi)", ph: "Contoh: ✓ Diterima / ✓ Edukasi / -" },
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-800 shrink-0">{item.label}</span>
                        <input
                          type="text"
                          value={editPelayananForm[item.key] || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, [item.key]: e.target.value })}
                          placeholder={item.ph}
                          className="w-full sm:w-64 bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-lg p-2 outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Status Triple Eliminasi */}
                  <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-200 space-y-2">
                    <p className="text-xs font-black text-pink-950 flex items-center gap-1.5">
                      <span>🧪</span> Skrining Tripel Eliminasi (H, S, Hep B)
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "hiv", label: "HIV" },
                        { key: "sifilis", label: "Sifilis" },
                        { key: "hepB", label: "Hepatitis B" },
                      ].map((sub) => (
                        <div key={sub.key} className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                          <span className="block text-[10px] font-bold text-gray-500 mb-1">{sub.label}</span>
                          <select
                            value={editPelayananForm[sub.key] || "Non-Reaktif"}
                            onChange={(e) => setEditPelayananForm({ ...editPelayananForm, [sub.key]: e.target.value })}
                            className="w-full bg-slate-50 border border-gray-300 text-[10px] font-black text-emerald-800 rounded p-1 outline-none text-center cursor-pointer"
                          >
                            <option value="Non-Reaktif">Non-Reaktif</option>
                            <option value="Reaktif">Reaktif</option>
                            <option value="-">Belum</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL CASE B: TAHUNAN PER KOLOM KUNJUNGAN (Kunjungan 1..8) */}
              {editPelayananTarget.type === "tahunan" && (
                <div className="space-y-4">
                  {/* Header Tanggal & Tempat */}
                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                    <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>📅</span> Tanggal &amp; Lokasi Kunjungan ({editPelayananTarget.itemLabel})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-600 mb-1">Tanggal Periksa</label>
                        <input
                          type="text"
                          value={editPelayananForm.date || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, date: e.target.value })}
                          placeholder="misal: 14/09/2026"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-600 mb-1">Tempat Pelayanan</label>
                        <input
                          type="text"
                          value={editPelayananForm.place || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, place: e.target.value })}
                          placeholder="misal: Posyandu Kenanga 1"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-medium outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Input All Indicators for this visit */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-black text-gray-800">Indikator Pelayanan Kunjungan Ini:</p>
                    {[
                      { key: "bb", label: "Berat Badan (BB)", ph: "misal: 3.5 kg / -" },
                      { key: "tb", label: editPelayananTarget.katUsia === "bayi_1" || editPelayananTarget.katUsia === "anak_2" ? "Panjang Badan (PB)" : "Tinggi Badan (TB)", ph: "misal: 50 cm / -" },
                      { key: "lk", label: "Lingkar Kepala (LK)", ph: "misal: 34 cm / -" },
                      { key: "perkembangan", label: "Perkembangan (KPSP/KIA)", ph: "misal: Sesuai (S) / -" },
                      { key: "kie", label: "Pemberian KIE / Konseling", ph: "misal: Edukasi ASI Eksklusif / -" },
                      { key: "imunisasi", label: "Imunisasi Masuk", ph: "misal: BCG + Polio 1 / -" },
                      { key: "vita", label: editPelayananTarget.katUsia === "bayi_1" ? "Vitamin A" : "Vit. A & Obat Cacing", ph: "misal: Kapsul Biru / -" },
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-800 shrink-0">{item.label}</span>
                        <input
                          type="text"
                          value={editPelayananForm[item.key] || ""}
                          onChange={(e) => setEditPelayananForm({ ...editPelayananForm, [item.key]: e.target.value })}
                          placeholder={item.ph}
                          className="w-full sm:w-64 bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-lg p-2 outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Status Triple Eliminasi */}
                  {(editPelayananTarget.katUsia === "bayi_1" || editPelayananTarget.katUsia === "anak_2") && (
                    <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-200 space-y-1.5">
                      <label className="block text-xs font-black text-pink-950">Status Tripel Eliminasi Tahunan</label>
                      <input
                        type="text"
                        value={editPelayananForm.triple || ""}
                        onChange={(e) => setEditPelayananForm({ ...editPelayananForm, triple: e.target.value })}
                        placeholder="Contoh: Non-Reaktif (3 Parameter) / -"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditPelayananModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Perubahan Kolom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT DATA PER-FASE NEONATUS (0-6 Jam / KN1 / KN2 / KN3) ─── */}
      {showEditFaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#EA2986] flex items-center justify-center text-xl font-black shadow-2xs">
                  <MdEdit />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Data Fase Pelayanan: {editFaseForm.fase || "Neonatus"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Input / Perbarui Pemeriksaan Medis Fase Neonatal ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditFaseModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFaseEdit} className="space-y-4">
              {/* Header Info Kunjungan */}
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 space-y-2">
                <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <span>📅</span> Identitas Waktu &amp; Nakes Pemeriksa
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                      <span>📅</span> Tanggal Periksa
                    </label>
                    <input
                      type="date"
                      value={toInputDate(editFaseForm.tanggal)}
                      onChange={(e) => {
                        const formatted = formatDisplayDate(e.target.value);
                        setEditFaseForm({ ...editFaseForm, tanggal: formatted, rawTanggal: e.target.value });
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-bold outline-none focus:border-[#EA2986] focus:ring-2 focus:ring-[#EA2986]/20 transition shadow-2xs cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                      <span>⏰</span> Jam Periksa (WIB)
                    </label>
                    <input
                      type="time"
                      value={toInputTime(editFaseForm.jam)}
                      onChange={(e) => {
                        setEditFaseForm({ ...editFaseForm, jam: e.target.value });
                      }}
                      className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-bold outline-none focus:border-[#EA2986] focus:ring-2 focus:ring-[#EA2986]/20 transition shadow-2xs cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-600 mb-1">No. Batch Vaksin/Kit</label>
                    <input
                      type="text"
                      value={editFaseForm.batch || ""}
                      onChange={(e) => setEditFaseForm({ ...editFaseForm, batch: e.target.value })}
                      placeholder="B26-HB0 / -"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-mono font-semibold outline-none focus:border-[#EA2986]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-600 mb-1">Nakes Pemeriksa</label>
                    <input
                      type="text"
                      value={editFaseForm.nakes || ""}
                      onChange={(e) => setEditFaseForm({ ...editFaseForm, nakes: e.target.value })}
                      placeholder="Bidan Widya"
                      className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                    />
                  </div>
                </div>
              </div>

              {/* Pengukuran Fisik */}
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-800">Hasil Pengukuran Fisik Antropometri:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">BB (Berat - gram)</label>
                    <input
                      type="number"
                      value={editFaseForm.bb || ""}
                      onChange={(e) => setEditFaseForm({ ...editFaseForm, bb: e.target.value })}
                      placeholder="3200"
                      className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-black text-center outline-none focus:border-[#EA2986]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">PB (Panjang - cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFaseForm.pb || ""}
                      onChange={(e) => setEditFaseForm({ ...editFaseForm, pb: e.target.value })}
                      placeholder="50"
                      className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-black text-center outline-none focus:border-[#EA2986]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">LK (Kepala - cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFaseForm.lk || ""}
                      onChange={(e) => setEditFaseForm({ ...editFaseForm, lk: e.target.value })}
                      placeholder="34"
                      className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-black text-center outline-none focus:border-[#EA2986]"
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Spesifik Per Fase */}
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-800">Checklist Pelayanan Kesehatan ({editFaseForm.fase}):</p>
                
                {selectedKN === 0 && (
                  <div className="space-y-2">
                    {[
                      { key: "imd", label: "Inisiasi Menyusu Dini (IMD)", ph: "✓ Ya / -" },
                      { key: "vitK", label: "Suntik Vitamin K1", ph: "✓ Ya / -" },
                      { key: "salepMata", label: "Salep/Tetes Mata", ph: "✓ Ya / -" },
                      { key: "hb0", label: "Imunisasi Hepatitis B (HB0)", ph: "✓ Ya / -" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-800">{item.label}</span>
                        <input
                          type="text"
                          value={editFaseForm[item.key] || ""}
                          onChange={(e) => setEditFaseForm({ ...editFaseForm, [item.key]: e.target.value })}
                          placeholder={item.ph}
                          className="w-48 bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-lg p-1.5 outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedKN === 1 && (
                  <div className="space-y-2">
                    {[
                      { key: "menyusu", label: "Menyusu Aktif / Adekuat", ph: "✓ Aktif / -" },
                      { key: "taliPusat", label: "Perawatan Tali Pusar", ph: "✓ Bersih/Normal / -" },
                      { key: "shk", label: "Skrining Hipotiroid (SHK)", ph: "Dilakukan (Sampel Darah Tumit)" },
                      { key: "pjbKritis", label: "Skrining PJB Kritis", ph: "Lolos (Saturasi 98%)" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-800">{item.label}</span>
                        <input
                          type="text"
                          value={editFaseForm[item.key] || ""}
                          onChange={(e) => setEditFaseForm({ ...editFaseForm, [item.key]: e.target.value })}
                          placeholder={item.ph}
                          className="w-48 bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-lg p-1.5 outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedKN >= 2 && (
                  <div className="space-y-2">
                    {[
                      { key: "menyusu", label: "Menyusu / Kebutuhan ASI", ph: "✓ Kuat / -" },
                      { key: "taliPusat", label: "Kondisi Tali Pusar", ph: "✓ Kering/Puput / -" },
                      { key: "tandaBahaya", label: "Skrining Tanda Bahaya", ph: "❌ Tidak Ada" },
                      { key: "ikterus", label: "Identifikasi Ikterus (Kramer)", ph: "❌ Tidak Kuning" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                        <span className="text-xs font-bold text-gray-800">{item.label}</span>
                        <input
                          type="text"
                          value={editFaseForm[item.key] || ""}
                          onChange={(e) => setEditFaseForm({ ...editFaseForm, [item.key]: e.target.value })}
                          placeholder={item.ph}
                          className="w-48 bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-lg p-1.5 outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Triple Eliminasi */}
              <div className="bg-pink-50/50 p-3 rounded-2xl border border-pink-200 space-y-2">
                <p className="text-xs font-black text-pink-950 flex items-center gap-1.5">
                  <span>🧪</span> Uji Laboratorium Triple Eliminasi Fase Ini
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "hiv", label: "HIV (H)" },
                    { key: "sifilis", label: "Sifilis (S)" },
                    { key: "hepB", label: "Hepatitis B" },
                  ].map((sub) => (
                    <div key={sub.key} className="bg-white p-2 rounded-xl border border-gray-200 text-center">
                      <span className="block text-[10px] font-bold text-gray-500 mb-1">{sub.label}</span>
                      <select
                        value={editFaseForm[sub.key] || "Non-Reaktif"}
                        onChange={(e) => setEditFaseForm({ ...editFaseForm, [sub.key]: e.target.value })}
                        className="w-full bg-slate-50 border border-gray-300 text-[10px] font-black text-emerald-800 rounded p-1 outline-none text-center cursor-pointer"
                      >
                        <option value="Non-Reaktif">Non-Reaktif</option>
                        <option value="Reaktif">Reaktif</option>
                        <option value="-">Belum</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Masalah & Rujukan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Masalah yang Ditemukan</label>
                  <input
                    type="text"
                    value={editFaseForm.masalah || ""}
                    onChange={(e) => setEditFaseForm({ ...editFaseForm, masalah: e.target.value })}
                    placeholder="misal: Tidak ada, kondisi stabil"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-medium outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Dirujuk Ke Faskes/RS</label>
                  <input
                    type="text"
                    value={editFaseForm.rujukan || ""}
                    onChange={(e) => setEditFaseForm({ ...editFaseForm, rujukan: e.target.value })}
                    placeholder="misal: - / RSUD Suhat"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-medium outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditFaseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Data Fase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT MATRIKS GIZI & PMBA (PER KOLOM USIA) ─── */}
      {showEditGiziPmbaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-black shadow-2xs">
                  🥗
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Matriks Gizi: {selectedGiziColLabel}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Evaluasi Nasihat ASI &amp; PMBA ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditGiziPmbaModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGiziPmbaEdit} className="space-y-4">
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium leading-relaxed">
                💡 Mengubah parameter gizi khusus untuk kelompok usia <strong>{selectedGiziColLabel}</strong>.
              </div>

              {/* Form ASI */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">1. Evaluasi Pemberian ASI ({selectedGiziColLabel})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                    <label className="block text-[10px] font-extrabold text-gray-700">Frekuensi Menyusui</label>
                    <select
                      value={editGiziPmbaForm.asi_frekuensi?.[selectedGiziColKey] || "✓"}
                      onChange={(e) => {
                        const updated = { ...editGiziPmbaForm.asi_frekuensi, [selectedGiziColKey]: e.target.value };
                        setEditGiziPmbaForm({ ...editGiziPmbaForm, asi_frekuensi: updated });
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-gray-900"
                    >
                      <option value="✓">✓ Terpenuhi / Adekuat</option>
                      <option value="❌">❌ Kurang / Tidak ASI</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                    <label className="block text-[10px] font-extrabold text-gray-700">Posisi &amp; Pelekatan Menyusu</label>
                    <select
                      value={editGiziPmbaForm.asi_posisi?.[selectedGiziColKey] || "✓"}
                      onChange={(e) => {
                        const updated = { ...editGiziPmbaForm.asi_posisi, [selectedGiziColKey]: e.target.value };
                        setEditGiziPmbaForm({ ...editGiziPmbaForm, asi_posisi: updated });
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-gray-900"
                    >
                      <option value="✓">✓ Baik &amp; Melekat Sempurna</option>
                      <option value="❌">❌ Pelekatan Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form MPASI Khusus Usia >= 6 Bulan */}
              {["6_8", "9_11", "12_23", "23_59"].includes(selectedGiziColKey) ? (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">2. Evaluasi MPASI ({selectedGiziColLabel})</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                      <label className="block text-[10px] font-extrabold text-gray-700">Pemberian MPASI</label>
                      <select
                        value={editGiziPmbaForm.mpasi_ya?.[selectedGiziColKey] === "✓" ? "Ya" : "Belum"}
                        onChange={(e) => {
                          const isYa = e.target.value === "Ya";
                          const uYa = { ...editGiziPmbaForm.mpasi_ya, [selectedGiziColKey]: isYa ? "✓" : "❌" };
                          const uTidak = { ...editGiziPmbaForm.mpasi_tidak, [selectedGiziColKey]: isYa ? "❌" : "✓" };
                          setEditGiziPmbaForm({ ...editGiziPmbaForm, mpasi_ya: uYa, mpasi_tidak: uTidak });
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-gray-900"
                      >
                        <option value="Ya">✓ Ya (Sudah Diberikan MPASI)</option>
                        <option value="Belum">❌ Belum Diberikan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Variasi Lauk Protein</label>
                      <input
                        type="text"
                        value={editGiziPmbaForm.variasi_lauk?.[selectedGiziColKey] || "✓ (Hewani)"}
                        onChange={(e) => {
                          const u = { ...editGiziPmbaForm.variasi_lauk, [selectedGiziColKey]: e.target.value };
                          setEditGiziPmbaForm({ ...editGiziPmbaForm, variasi_lauk: u });
                        }}
                        placeholder="misal: ✓ (Telur, Ayam, Daging)"
                        className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Frekuensi Makanan Utama</label>
                      <input
                        type="text"
                        value={editGiziPmbaForm.frekuensi_utama?.[selectedGiziColKey] || "3x Sehari"}
                        onChange={(e) => {
                          const u = { ...editGiziPmbaForm.frekuensi_utama, [selectedGiziColKey]: e.target.value };
                          setEditGiziPmbaForm({ ...editGiziPmbaForm, frekuensi_utama: u });
                        }}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Frekuensi Makanan Selingan</label>
                      <input
                        type="text"
                        value={editGiziPmbaForm.frekuensi_selingan?.[selectedGiziColKey] || "✓ 2x"}
                        onChange={(e) => {
                          const u = { ...editGiziPmbaForm.frekuensi_selingan, [selectedGiziColKey]: e.target.value };
                          setEditGiziPmbaForm({ ...editGiziPmbaForm, frekuensi_selingan: u });
                        }}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-[11px] font-medium text-blue-900">
                  ℹ️ Bayi usia 0-5 bulan direkomendasikan mendapat ASI Eksklusif saja tanpa MPASI.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditGiziPmbaModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Kolom Usia {selectedGiziColLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT VITAMIN A & OBAT CACING (PER KOLOM USIA) ─── */}
      {showEditVitAModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-black shadow-2xs">
                  <MdMedication className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Vitamin A &amp; Cacing: {selectedVitAColLabel}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Validasi Kapsul Medis ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditVitAModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVitAEdit} className="space-y-4">
              {/* Form Jika Kolom Bulan 6 - 11 */}
              {selectedVitAColKey === "bln_6_11" ? (
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2">
                  <span className="text-xs font-black text-blue-900 block">🔵 VITAMIN A KAPSUL BIRU (100.000 IU) — Bulan 6 - 11</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                        <span>📅</span> Tanggal Pemberian
                      </label>
                      <input
                        type="date"
                        value={toInputDate(editVitAForm.vitA_biru?.tanggal)}
                        onChange={(e) => {
                          const formatted = formatDisplayDate(e.target.value);
                          setEditVitAForm({
                            ...editVitAForm,
                            vitA_biru: { ...editVitAForm.vitA_biru, tanggal: formatted, diberikan: true, status: "Sudah Diberikan" }
                          });
                        }}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-700 mb-1">Nomor Batch / Keterangan</label>
                      <input
                        type="text"
                        value={editVitAForm.vitA_biru?.batch || ""}
                        onChange={(e) => {
                          setEditVitAForm({
                            ...editVitAForm,
                            vitA_biru: { ...editVitAForm.vitA_biru, batch: e.target.value }
                          });
                        }}
                        placeholder="A26-BLU"
                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Form Jika Kolom Tahun 1-2 s/d Tahun 5-6 */
                <div className="space-y-3">
                  {/* Kapsul Merah */}
                  <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 space-y-2">
                    <span className="text-xs font-black text-rose-900 block">🔴 VITAMIN A KAPSUL MERAH (200.000 IU) — {selectedVitAColLabel}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                          <span>📅</span> Tanggal Pemberian
                        </label>
                        <input
                          type="date"
                          value={toInputDate(editVitAForm[`vitA_merah_${selectedVitAColKey}`]?.tanggal)}
                          onChange={(e) => {
                            const formatted = formatDisplayDate(e.target.value);
                            const key = `vitA_merah_${selectedVitAColKey}`;
                            setEditVitAForm({
                              ...editVitAForm,
                              [key]: { ...editVitAForm[key], tanggal: formatted, diberikan: true, status: "Sudah" }
                            });
                          }}
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-700 mb-1">Nomor Batch</label>
                        <input
                          type="text"
                          value={editVitAForm[`vitA_merah_${selectedVitAColKey}`]?.batch || ""}
                          onChange={(e) => {
                            const key = `vitA_merah_${selectedVitAColKey}`;
                            setEditVitAForm({
                              ...editVitAForm,
                              [key]: { ...editVitAForm[key], batch: e.target.value }
                            });
                          }}
                          placeholder="M26-RED"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Obat Cacing */}
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-2">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1"><MdMedication className="text-base" /> OBAT CACING — {selectedVitAColLabel}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                          <MdCalendarMonth className="text-gray-500" /> Tanggal Pemberian
                        </label>
                        <input
                          type="date"
                          value={toInputDate(editVitAForm[`cacing_${selectedVitAColKey}`]?.tanggal)}
                          onChange={(e) => {
                            const formatted = formatDisplayDate(e.target.value);
                            const key = `cacing_${selectedVitAColKey}`;
                            setEditVitAForm({
                              ...editVitAForm,
                              [key]: { ...editVitAForm[key], tanggal: formatted, diberikan: true, status: "Sudah" }
                            });
                          }}
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-gray-700 mb-1">Nomor Batch / Merk</label>
                        <input
                          type="text"
                          value={editVitAForm[`cacing_${selectedVitAColKey}`]?.batch || ""}
                          onChange={(e) => {
                            const key = `cacing_${selectedVitAColKey}`;
                            setEditVitAForm({
                              ...editVitAForm,
                              [key]: { ...editVitAForm[key], batch: e.target.value }
                            });
                          }}
                          placeholder="C26-ALB"
                          className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditVitAModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan {selectedVitAColLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT CATATAN KESEHATAN GIGI ─── */}
      {showEditGigiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-black shadow-2xs">
                  🦷
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Catatan Gigi: {editGigiForm.bln || "Usia"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Buku KIA Halaman 126 ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditGigiModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGigiEdit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                  <span>📅</span> Tanggal Periksa Gigi
                </label>
                <input
                  type="date"
                  value={toInputDate(editGigiForm.tgl)}
                  onChange={(e) => {
                    const formatted = formatDisplayDate(e.target.value);
                    setEditGigiForm({ ...editGigiForm, tgl: formatted });
                  }}
                  className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-bold outline-none focus:border-[#EA2986] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-1">Gigi Tumbuh (Ada)</label>
                  <input
                    type="number"
                    value={editGigiForm.ada || ""}
                    onChange={(e) => setEditGigiForm({ ...editGigiForm, ada: e.target.value })}
                    placeholder="misal: 4"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-black text-center outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-rose-700 mb-1">Gigi Berlubang</label>
                  <input
                    type="number"
                    value={editGigiForm.lubang || ""}
                    onChange={(e) => setEditGigiForm({ ...editGigiForm, lubang: e.target.value })}
                    placeholder="misal: 0"
                    className="w-full bg-rose-50/50 border border-rose-200 text-rose-900 text-xs rounded-xl p-2 font-black text-center outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-gray-700">Kondisi Kebersihan Plak Gigi</label>
                <select
                  value={editGigiForm.bersih === "✓" ? "Bersih" : editGigiForm.kotor === "✓" ? "Kotor" : "Bersih"}
                  onChange={(e) => {
                    if (e.target.value === "Bersih") {
                      setEditGigiForm({ ...editGigiForm, bersih: "✓", kotor: "" });
                    } else {
                      setEditGigiForm({ ...editGigiForm, bersih: "", kotor: "✓" });
                    }
                  }}
                  className="w-full bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-xl p-2.5 outline-none focus:border-[#EA2986]"
                >
                  <option value="Bersih">✓ Bersih (Tidak ada plak menumpuk)</option>
                  <option value="Kotor">! Kotor (Ada penumpukan plak/sisa makanan)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-gray-700">Penilaian Risiko Gigi Berlubang</label>
                <select
                  value={editGigiForm.r || "Rendah"}
                  onChange={(e) => setEditGigiForm({ ...editGigiForm, r: e.target.value })}
                  className="w-full bg-white border border-gray-300 text-xs font-bold text-gray-900 rounded-xl p-2.5 outline-none focus:border-[#EA2986]"
                >
                  <option value="Rendah">🟢 Rendah (Gigi sehat, tidak ada karies)</option>
                  <option value="Sedang">🟡 Sedang (Mulai ada plak / 1 bercak)</option>
                  <option value="Tinggi">🔴 Tinggi (Ada karies aktif &amp; berlubang)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditGigiModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Catatan Gigi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT PELAYANAN NEONATUS PER KOLOM ─── */}
      {showEditPelayananNeonatusColModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-black shadow-2xs">
                  📋
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Pelayanan Neonatus: {selectedPelayananNeonatusColLabel}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Kolom Kunjungan Neonatus ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPelayananNeonatusColModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePelayananNeonatusColEdit} className="space-y-3.5">
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
                💡 Mengubah status pelayanan yang diberikan pada periode <strong>{selectedPelayananNeonatusColLabel}</strong>.
              </div>

              {/* Tanggal & Tempat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                    <span>📅</span> Tanggal Periksa
                  </label>
                  <input
                    type="date"
                    value={toInputDate(editPelayananNeonatusColForm.headerDates?.[`${selectedPelayananNeonatusColKey}Date`])}
                    onChange={(e) => {
                      const formatted = formatDisplayDate(e.target.value);
                      const hd = { ...(editPelayananNeonatusColForm.headerDates || {}), [`${selectedPelayananNeonatusColKey}Date`]: formatted };
                      setEditPelayananNeonatusColForm({ ...editPelayananNeonatusColForm, headerDates: hd });
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold cursor-pointer outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-700 mb-1">Lokasi Periksa</label>
                  <input
                    type="text"
                    value={editPelayananNeonatusColForm.headerDates?.[`${selectedPelayananNeonatusColKey}Place`] || "Puskesmas Suhat"}
                    onChange={(e) => {
                      const hd = { ...(editPelayananNeonatusColForm.headerDates || {}), [`${selectedPelayananNeonatusColKey}Place`]: e.target.value };
                      setEditPelayananNeonatusColForm({ ...editPelayananNeonatusColForm, headerDates: hd });
                    }}
                    placeholder="misal: Puskesmas Suhat"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              {/* Item Pelayanan */}
              <div className="space-y-2.5">
                {[
                  { key: "tali_pusat", item: "Perawatan Tali pusat" },
                  { key: "imd", item: "IMD (Inisiasi Menyusu Dini)" },
                  { key: "vit_k1", item: "Vitamin K1" },
                  { key: "hb0", item: "Imunisasi Hepatitis B (HB0)" },
                  { key: "salep_mata", item: "Salep/Tetes Mata Antibiotik" },
                  { key: "shk", item: "Skrining BBL / SHK" },
                  { key: "buku_kia", item: "Buku KIA (Diberikan/Edukasi)" },
                ].map(({ key, item }) => (
                  <div key={key} className="flex items-center justify-between gap-3 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-700">{item}</span>
                    <input
                      type="text"
                      value={editPelayananNeonatusColForm.items?.[key]?.[selectedPelayananNeonatusColKey] || ""}
                      onChange={(e) => {
                        const itemsObj = { ...(editPelayananNeonatusColForm.items || {}) };
                        itemsObj[key] = { ...(itemsObj[key] || {}), [selectedPelayananNeonatusColKey]: e.target.value };
                        setEditPelayananNeonatusColForm({ ...editPelayananNeonatusColForm, items: itemsObj });
                      }}
                      placeholder="✓ Done / -"
                      className="w-40 bg-white border border-gray-300 text-xs font-bold rounded-lg p-1.5 text-center"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditPelayananNeonatusColModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Kolom {selectedPelayananNeonatusColLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL EDIT PELAYANAN TAHUNAN PER KOLOM KUNJUNGAN ─── */}
      {showEditPelayananTahunanColModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-black shadow-2xs">
                  📅
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Edit Pelayanan: Kunjungan {selectedPelayananTahunanIndex + 1}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Kategori: {selectedPelayananTahunanKatUsia} ({dbChildData?.name || dbChildData?.child_name || "Pasien"})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditPelayananTahunanColModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePelayananTahunanColEdit} className="space-y-3.5">
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-200 text-xs text-indigo-900 font-medium">
                💡 Mengubah detail Kunjungan Ke-{selectedPelayananTahunanIndex + 1} untuk kategori usia <strong>{selectedPelayananTahunanKatUsia}</strong>.
              </div>

              {/* Tanggal & Tempat Kunjungan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-700 mb-1 flex items-center gap-1">
                    <span>📅</span> Tanggal Kunjungan
                  </label>
                  <input
                    type="date"
                    value={toInputDate(editPelayananTahunanColForm[selectedPelayananTahunanKatUsia]?.visits?.[selectedPelayananTahunanIndex]?.date)}
                    onChange={(e) => {
                      const formatted = formatDisplayDate(e.target.value);
                      const catData = { ...(editPelayananTahunanColForm[selectedPelayananTahunanKatUsia] || {}) };
                      const visits = [...(catData.visits || [])];
                      visits[selectedPelayananTahunanIndex] = { ...(visits[selectedPelayananTahunanIndex] || {}), date: formatted };
                      catData.visits = visits;
                      setEditPelayananTahunanColForm({ ...editPelayananTahunanColForm, [selectedPelayananTahunanKatUsia]: catData });
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold cursor-pointer outline-none focus:border-[#EA2986]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-700 mb-1">Lokasi Kunjungan</label>
                  <input
                    type="text"
                    value={editPelayananTahunanColForm[selectedPelayananTahunanKatUsia]?.visits?.[selectedPelayananTahunanIndex]?.place || "Posyandu"}
                    onChange={(e) => {
                      const catData = { ...(editPelayananTahunanColForm[selectedPelayananTahunanKatUsia] || {}) };
                      const visits = [...(catData.visits || [])];
                      visits[selectedPelayananTahunanIndex] = { ...(visits[selectedPelayananTahunanIndex] || {}), place: e.target.value };
                      catData.visits = visits;
                      setEditPelayananTahunanColForm({ ...editPelayananTahunanColForm, [selectedPelayananTahunanKatUsia]: catData });
                    }}
                    placeholder="misal: Posyandu"
                    className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded-xl p-2 font-bold outline-none focus:border-[#EA2986]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditPelayananTahunanColModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#EA2986] hover:bg-[#d41f76] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <MdEdit /> Simpan Kunjungan {selectedPelayananTahunanIndex + 1}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL TAMBAH / EDIT DATA PERTUMBUHAN KMS (TABEL BB & PB PER BULAN) ─── */}
      {showEditKmsRowModal && (() => {
        const currentData = findMeasurementForMonth(editKmsRowForm.usiaBulan);
        const isEditMode = !!(currentData && (currentData.weight !== null || currentData.height !== null || currentData.head_circumference !== null));

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base font-black ${
                    isEditMode ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-[#EA2986]"
                  }`}>
                    {isEditMode ? <MdEdit /> : <MdAdd />}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-gray-900">
                      {isEditMode ? "Edit Data Pertumbuhan" : "Tambah Data Pertumbuhan Baru"} (Usia {editKmsRowForm.usiaBulan} Bulan)
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Input / Perbarui Berat Badan (BB) &amp; Panjang/Tinggi Badan (PB/TB)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditKmsRowModal(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer font-black text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Status Card Banner Indicator */}
              {isEditMode ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-amber-900 font-bold">
                    <MdEdit className="text-base shrink-0" />
                    <div>
                      <p className="font-black text-amber-950 text-[12px]">Mode Edit Data (Sudah Ada Record)</p>
                      <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                        Data usia {editKmsRowForm.usiaBulan} bulan sudah tersimpan. Mengubah nilai akan meng-update record database.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">
                    Status: Terisi
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-bold">
                    <MdAdd className="text-base shrink-0" />
                    <div>
                      <p className="font-black text-emerald-950 text-[12px]">Mode Tambah Data Baru</p>
                      <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                        Belum ada data penimbangan untuk usia {editKmsRowForm.usiaBulan} bulan. Silakan isi form di bawah.
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-1 rounded-md shrink-0 uppercase tracking-wider">
                    Status: Kosong
                  </span>
                </div>
              )}

              <form onSubmit={handleSaveEditKmsRow} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilih Usia Bulan (Combobox 0–60 Bln)
                  </label>
                  <select
                    value={editKmsRowForm.usiaBulan}
                    onChange={(e) => handleSelectMonthInModal(parseInt(e.target.value, 10) || 0)}
                    className={`w-full border text-xs rounded-xl p-2.5 font-black outline-none transition cursor-pointer ${
                      isEditMode
                        ? "bg-amber-50/60 border-amber-300 text-amber-950 focus:border-amber-500"
                        : "bg-slate-50 border-gray-300 text-gray-900 focus:border-[#EA2986]"
                    }`}
                  >
                    {Array.from({ length: 61 }, (_, i) => {
                      const mData = findMeasurementForMonth(i);
                      const hasData = mData && (mData.weight !== null || mData.height !== null);
                      return (
                        <option key={i} value={i} className={hasData ? "font-black text-amber-950 bg-amber-50" : "font-medium text-gray-700"}>
                          {i} Bulan {hasData ? "(Sudah Ada Data - Mode Edit)" : "(Belum Ada Data)"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tanggal Pemeriksaan / Kunjungan
                  </label>
                  <input
                    type="date"
                    value={editKmsRowForm.tanggalPeriksa}
                    onChange={(e) => setEditKmsRowForm({ ...editKmsRowForm, tanggalPeriksa: e.target.value })}
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-bold outline-none focus:border-[#EA2986]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Berat Badan (BB - kg)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editKmsRowForm.beratBadan}
                      onChange={(e) => setEditKmsRowForm({ ...editKmsRowForm, beratBadan: e.target.value })}
                      placeholder="Contoh: 3.5 atau 3,5"
                      className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-black outline-none focus:border-[#EA2986]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Panjang/Tinggi (PB/TB - cm)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={editKmsRowForm.tinggiBadan}
                      onChange={(e) => setEditKmsRowForm({ ...editKmsRowForm, tinggiBadan: e.target.value })}
                      placeholder="Contoh: 50.0 atau 50,0"
                      className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-black outline-none focus:border-[#EA2986]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Lingkar Kepala (LK - cm) <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editKmsRowForm.lingkarKepala}
                    onChange={(e) => setEditKmsRowForm({ ...editKmsRowForm, lingkarKepala: e.target.value })}
                    placeholder="Contoh: 35.0"
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-bold outline-none focus:border-[#EA2986]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catatan Pertumbuhan / Nakes <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={editKmsRowForm.catatan}
                    onChange={(e) => setEditKmsRowForm({ ...editKmsRowForm, catatan: e.target.value })}
                    placeholder="Contoh: Penimbangan Posyandu Rutin"
                    className="w-full bg-slate-50 border border-gray-300 text-gray-900 text-xs rounded-xl p-2.5 font-medium outline-none focus:border-[#EA2986]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditKmsRowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                      isEditMode
                        ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                        : "bg-[#EA2986] hover:bg-[#d41f76] shadow-rose-200"
                    }`}
                  >
                    {isEditMode ? <><MdEdit /> Simpan Perubahan (Edit Data)</> : <><MdAdd /> Tambah Data Pertumbuhan</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ─── MODAL KONFIRMASI HAPUS CATATAN NAKES ─── */}
      {deleteConfirmLogId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-[#EA2986] rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-2xs">
              🗑️
            </div>
            
            <div>
              <h3 className="text-base font-black text-gray-900">Hapus Catatan Pelayanan?</h3>
              <p className="text-xs text-gray-500 font-semibold mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus catatan pelayanan medis ini?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmLogId(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteNakesLog}
                className="flex-1 py-2.5 px-4 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─── TOAST NOTIFICATION FLOATING POPUP ─── */}

      {toast.show && (
        <div className="fixed top-5 right-5 z-50 animate-fadeIn max-w-md w-full sm:w-96">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md transition-all ${
            toast.type === "success"
              ? "bg-slate-900 text-emerald-300 border-emerald-500/40 shadow-emerald-950/20"
              : toast.type === "error"
                ? "bg-slate-900 text-rose-300 border-rose-500/40 shadow-rose-950/20"
                : toast.type === "warning"
                  ? "bg-slate-900 text-amber-300 border-amber-500/40 shadow-amber-950/20"
                  : "bg-slate-900 text-slate-200 border-slate-700 shadow-slate-950/20"
          }`}>
            <div className="text-xl shrink-0 mt-0.5">
              {toast.type === "success" && <MdCheckCircle className="text-emerald-400" />}
              {toast.type === "error" && <MdWarning className="text-amber-400" />}
              {toast.type === "warning" && <MdWarningAmber className="text-yellow-400" />}
              {toast.type === "info" && <MdWarningAmber className="text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">{toast.title}</h4>
              <p className="text-xs font-medium opacity-90 leading-relaxed mt-0.5">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="text-xs font-bold opacity-70 hover:opacity-100 p-1 rounded-lg transition cursor-pointer text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default function RekamMedisAnakPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-6 h-6 border-2 border-[#EA2986] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-gray-700">Memuat Rekam Medis Anak...</span>
          </div>
        </div>
      }
    >
      <RekamMedisAnakContent />
    </Suspense>
  );
}