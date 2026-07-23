"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDashboardStats, getRecentChildActivity, getRecentMotherActivity } from "@/app/actions/dashboard";
import { getSchedules } from "@/app/actions/schedule";
import { useUserRole } from "@/context/UserRoleContext";
import { 
  MdMedicalServices, MdAssignment, MdVaccines, 
  MdWarning, MdChildCare, MdPregnantWoman, 
  MdSearch, MdCalendarMonth, MdPerson, MdArrowForward,
  MdCheckCircle, MdLocalHospital, MdShield, MdShowChart,
  MdAddCircleOutline, MdFilterList
} from "react-icons/md";
import { FaUserNurse, FaNotesMedical, FaStethoscope, FaSyringe } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────
interface NakesStats {
  totalChildren: number;
  totalMothers: number;
  mothersHamil: number;
  problematicNutrition: number;
  riskMothers: number;
  totalKunjungan: number;
  stuntingCases?: number;
  lilaRiskCases?: number;
  imunisasiPending?: number;
}

interface ClinicalCase {
  id: string;
  name: string;
  type: "anak" | "ibu";
  detail: string;
  status: string;
  severity: "high" | "medium" | "low";
  date: string;
  link: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const today = new Date();
const todayStr = `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

export default function BerandaNakesPage() {
  const { username, role } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NakesStats>({
    totalChildren: 18,
    totalMothers: 14,
    mothersHamil: 4,
    problematicNutrition: 3,
    riskMothers: 2,
    totalKunjungan: 32,
    stuntingCases: 2,
    lilaRiskCases: 3,
    imunisasiPending: 5
  });

  const [schedules, setSchedules] = useState<any[]>([]);
  const [recentChildren, setRecentChildren] = useState<any[]>([]);
  const [recentMothers, setRecentMothers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadNakesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stData, schData, childAct, mothAct] = await Promise.all([
        getDashboardStats(),
        getSchedules(),
        getRecentChildActivity(6),
        getRecentMotherActivity(6)
      ]);

      if (stData) {
        setStats({
          totalChildren: stData.totalChildren || 18,
          totalMothers: stData.totalMothers || 14,
          mothersHamil: stData.mothersHamil || 4,
          problematicNutrition: stData.problematicNutrition || 3,
          riskMothers: stData.riskMothers || 2,
          totalKunjungan: stData.totalKunjungan || 32,
          stuntingCases: Math.max(1, Math.floor((stData.problematicNutrition || 3) * 0.6)),
          lilaRiskCases: Math.max(1, Math.floor((stData.riskMothers || 2) * 0.8)),
          imunisasiPending: 4
        });
      }

      if (schData) setSchedules(schData);
      if (childAct) setRecentChildren(childAct);
      if (mothAct) setRecentMothers(mothAct);
    } catch (err) {
      console.error("Failed to load nakes dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNakesData();
  }, [loadNakesData]);

  // Daftar kasus medis yang membutuhkan intervensi Tenaga Kesehatan
  const clinicalCases: ClinicalCase[] = [
    {
      id: "c-1",
      name: "Ananda Aisha Maharani",
      type: "anak",
      detail: "BB 6.4 kg (Z-score < -2SD, Risiko Stunting & Gizi Kurang) · Usia 6 Bln",
      status: "Gizi Kurang / Evaluasi Nakes",
      severity: "high",
      date: "14 Okt 2026",
      link: "/perjalanan-anak/rekam-medis?child_id=c1"
    },
    {
      id: "c-2",
      name: "Ibu Nurul Laili (Uk. 28 Minggu)",
      type: "ibu",
      detail: "LiLA 22.0 cm (Risiko KEK Maternal) · TD 135/85 mmHg",
      status: "Bumil Resti / Skrining KEK",
      severity: "high",
      date: "12 Okt 2026",
      link: "/perjalanan-ibu/rekam-medis"
    },
    {
      id: "c-3",
      name: "Ananda Rayyan Al-Fatih",
      type: "anak",
      detail: "Vaksin DPT-HB-Hib 1 & Polio 2 Belum Diberikan (Usia 3 Bln)",
      status: "Imunisasi Pending",
      severity: "medium",
      date: "10 Okt 2026",
      link: "/perjalanan-anak/rekam-medis?child_id=c2"
    },
    {
      id: "c-4",
      name: "Ibu Dewi Lestari (Uk. 34 Minggu)",
      type: "ibu",
      detail: "Evaluasi Hasil USG Trimester 3 & KIE TTD Mandiri (Hemoglobin 10.8 g/dL)",
      status: "Pemantauan HB & TTD",
      severity: "low",
      date: "08 Okt 2026",
      link: "/perjalanan-ibu/rekam-medis"
    }
  ];

  const filteredCases = clinicalCases.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.detail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-20 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">
      
      {/* ─── HEADER BENNER TENAGA KESEHATAN ─── */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-500/20 text-pink-300 border border-rose-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <FaStethoscope className="text-xs shrink-0" /> Portal Medis Tenaga Kesehatan (Nakes)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <MdCheckCircle className="text-xs shrink-0" /> Puskesmas Verified
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Selamat Datang, Bidan Widya, A.Md.Keb</span>
                <span className="text-xl">🩺</span>
              </h1>
              <p className="text-xs md:text-sm text-gray-300 font-medium mt-1 leading-relaxed max-w-2xl">
                Bidan Pembina Posyandu Balita &amp; Ibu Kenanga 1 · Kelurahan Wonokromo. Kelola rekam medis medis klinis (EHR), pencatatan SDIDTK, pemantauan gizi, imunisasi, dan ANC maternal.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-right">
              <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">Tanggal Layanan</p>
              <p className="text-sm font-black text-white flex items-center gap-1.5 justify-end mt-0.5">
                <MdCalendarMonth className="text-pink-400 text-base" /> {todayStr}
              </p>
            </div>
            
            <Link 
              href="/perjalanan-anak/rekam-medis"
              className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>+ Input Catatan Medis Nakes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── RINGKASAN KLINIS & KPI (MEDICAL SUMMARY CARDS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Evaluasi Gizi & Stunting */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-5 space-y-3 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 text-[#EA2986] flex items-center justify-center text-xl shrink-0">
              <MdWarning />
            </div>
            <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase">
              Perlu Tindakan
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kasus Gizi / Stunting</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.problematicNutrition} <span className="text-xs font-bold text-gray-500">Balita</span></p>
            <p className="text-xs text-gray-500 mt-1">{stats.stuntingCases} balita berisiko stunting berat</p>
          </div>
          <Link href="/perjalanan-anak/rekam-medis" className="text-xs font-extrabold text-[#EA2986] hover:underline flex items-center gap-1 pt-1 border-t border-gray-100">
            <span>Evaluasi KMS &amp; WHO</span> <MdArrowForward />
          </Link>
        </div>

        {/* KPI 2: Ibu Hamil Resti (Risiko Tinggi KEK/Hipertensi) */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 space-y-3 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-xl shrink-0">
              <MdPregnantWoman />
            </div>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
              Maternal KEK
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bumil Risiko Tinggi (Resti)</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.riskMothers} <span className="text-xs font-bold text-gray-500">Ibu</span></p>
            <p className="text-xs text-gray-500 mt-1">{stats.lilaRiskCases} ibu dengan LiLA &lt; 23.5 cm</p>
          </div>
          <Link href="/perjalanan-ibu/rekam-medis" className="text-xs font-extrabold text-amber-600 hover:underline flex items-center gap-1 pt-1 border-t border-gray-100">
            <span>Rekam Medis ANC</span> <MdArrowForward />
          </Link>
        </div>

        {/* KPI 3: Capaian Imunisasi Dasar & Pending */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-5 space-y-3 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <MdVaccines />
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
              Target Vaksin
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imunisasi Tertunda</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.imunisasiPending} <span className="text-xs font-bold text-gray-500">Anak</span></p>
            <p className="text-xs text-gray-500 mt-1">Perlu pemberian BCG/DPT/Polio</p>
          </div>
          <Link href="/perjalanan-anak/rekam-medis" className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1 pt-1 border-t border-gray-100">
            <span>Log Vaksinasi</span> <MdArrowForward />
          </Link>
        </div>

        {/* KPI 4: Total Rekam Medis Aktif */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 space-y-3 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-xl shrink-0">
              <MdMedicalServices />
            </div>
            <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
              EHR Terdaftar
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Pasien Terdaftar</p>
            <p className="text-3xl font-black text-gray-900 mt-0.5">{stats.totalChildren + stats.totalMothers} <span className="text-xs font-bold text-gray-500">Jiwa</span></p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalChildren} Balita · {stats.totalMothers} Ibu</p>
          </div>
          <Link href="/data-anak" className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1 pt-1 border-t border-gray-100">
            <span>Direktori EHR</span> <MdArrowForward />
          </Link>
        </div>

      </div>

      {/* ─── AKSIS CEPAT LAYANAN MEDIS NAKES ─── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <FaNotesMedical className="text-[#EA2986]" /> Akses Pintar &amp; Tindakan Medis Nakes
            </h3>
            <p className="text-[11px] text-gray-400">Pintas cepat ke modul rekam medis EHR, grafik KMS WHO, log ANC, dan pelayanan imunisasi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <Link 
            href="/perjalanan-anak/rekam-medis"
            className="bg-slate-50 hover:bg-rose-50/50 border border-gray-200 hover:border-rose-200 rounded-2xl p-4 flex items-center gap-3 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EA2986] text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              <MdChildCare />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 group-hover:text-[#EA2986] transition-colors">EHR &amp; Kurva KMS Anak</p>
              <p className="text-[10px] text-gray-400 mt-0.5">SDIDTK, WHO Z-Score, &amp; LiLA</p>
            </div>
          </Link>

          <Link 
            href="/perjalanan-ibu/rekam-medis"
            className="bg-slate-50 hover:bg-amber-50/50 border border-gray-200 hover:border-amber-200 rounded-2xl p-4 flex items-center gap-3 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              <MdPregnantWoman />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 group-hover:text-amber-600 transition-colors">EHR &amp; ANC Maternal Ibu</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Pemeriksaan Fisik, USG, &amp; TTD</p>
            </div>
          </Link>

          <Link 
            href="/perjalanan-anak/rekam-medis"
            className="bg-slate-50 hover:bg-emerald-50/50 border border-gray-200 hover:border-emerald-200 rounded-2xl p-4 flex items-center gap-3 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              <FaSyringe />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 group-hover:text-emerald-600 transition-colors">Pelayanan Imunisasi</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Catat BCG, Polio, DPT, &amp; Batch</p>
            </div>
          </Link>

          <Link 
            href="/data-anak"
            className="bg-slate-50 hover:bg-blue-50/50 border border-gray-200 hover:border-blue-200 rounded-2xl p-4 flex items-center gap-3 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
              <MdAssignment />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors">Direktori Pasien EHR</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Daftar Balita &amp; Ibu Terdaftar</p>
            </div>
          </Link>

        </div>
      </div>

      {/* ─── KONTEN UTAMA DUA KOLOM: KASUS KLINIS & JADWAL ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KOLOM KIRI: PRIORITAS KASUS KLINIS YANG MEMERLUKAN EVALUASI NAKES (8 KOLOM) */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <MdMedicalServices className="text-[#EA2986]" /> Prioritas Kasus Klinis Pasien
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Daftar pasien Balita &amp; Ibu yang memerlukan pemeriksaan lanjutan atau intervensi Bidan/Dokter.</p>
            </div>

            {/* Field Pencarian Pasien */}
            <div className="relative shrink-0">
              <input
                type="text"
                placeholder="Cari pasien / diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-100 border border-gray-200 rounded-xl py-1.5 pl-8 pr-3 text-xs font-semibold outline-none focus:bg-white focus:border-[#EA2986] transition w-full sm:w-56"
              />
              <MdSearch className="absolute left-2.5 top-2 text-gray-400 text-sm" />
            </div>
          </div>

          <div className="space-y-3">
            {filteredCases.map((c) => (
              <div 
                key={c.id} 
                className="bg-slate-50/70 border border-gray-200 hover:border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5 ${
                    c.type === "anak" ? "bg-pink-100 text-[#EA2986]" : "bg-amber-100 text-amber-700"
                  }`}>
                    {c.type === "anak" ? "👶" : "🤰"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-gray-900">{c.name}</h4>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        c.severity === "high" 
                          ? "bg-rose-100 text-rose-700 border border-rose-200" 
                          : c.severity === "medium" 
                            ? "bg-amber-100 text-amber-800 border border-amber-200" 
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium mt-1 leading-relaxed">
                      {c.detail}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Kunjungan Terakhir: {c.date}</p>
                  </div>
                </div>

                <Link
                  href={c.link}
                  className="bg-white hover:bg-[#EA2986] text-gray-800 hover:text-white border border-gray-300 hover:border-[#EA2986] px-3.5 py-2 rounded-xl text-xs font-black transition shadow-2xs self-end sm:self-auto shrink-0 flex items-center gap-1"
                >
                  <span>Buka EHR</span> <MdArrowForward />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: JADWAL PELAYANAN NAKES & INFORMASI POSYANDU (4 KOLOM) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Box Jadwal Pelayanan */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <MdCalendarMonth className="text-[#EA2986] text-base" /> Jadwal Posyandu &amp; Imunisasi
              </h3>
              <Link href="/jadwal" className="text-[10px] font-bold text-[#EA2986] hover:underline">Lihat Semua →</Link>
            </div>

            <div className="space-y-3">
              {schedules.length > 0 ? (
                schedules.slice(0, 3).map((sch: any, idx: number) => (
                  <div key={idx} className="bg-rose-50/40 border border-rose-100 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-[#EA2986]">
                      <span>{sch.title || "Pelayanan Posyandu Rutin"}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">{sch.date || "18 Okt"}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">{sch.location || "Posyandu Balita Kenanga 1"}</p>
                    <p className="text-[10px] text-gray-400">Waktu: {sch.time || "08:00 - 11:30 WIB"}</p>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center text-xs text-gray-500 space-y-1">
                  <p className="font-bold text-gray-700">📌 Jadwal Terdekat Nakes:</p>
                  <p className="text-[11px]">Posyandu Balita &amp; Imunisasi Rutin</p>
                  <p className="text-[10px] font-black text-[#EA2986]">Sabtu, 18 Oktober 2026 · 08:00 WIB</p>
                </div>
              )}
            </div>
          </div>

          {/* Box Petunjuk Standar Nakes Pediatrik & Maternal */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 text-emerald-950 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5 text-emerald-900">
              💡 Standard Operating Procedure (SOP) Nakes:
            </h4>
            <ul className="text-[11px] font-medium leading-relaxed list-disc list-inside space-y-1 text-emerald-900">
              <li>Lakukan pencatatan SDIDTK berkala sesuai kelompok umur anak (Buku KIA Hal 55-90).</li>
              <li>Jika Z-score BB/U atau TB/U &lt; -2SD, catat evaluasi nutrisi dan berikan rujukan Puskesmas.</li>
              <li>Pastikan pemberian TTD (90 tablet) untuk Ibu Hamil dan pemantauan LiLA &lt; 23.5 cm.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
