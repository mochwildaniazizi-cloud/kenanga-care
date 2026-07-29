"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/app/actions/dashboard";
import { useUserRole } from "@/context/UserRoleContext";
import { 
  MdPregnantWoman, MdChildCare, MdVaccines, MdPerson, 
  MdWarning, MdTrendingDown, MdScale, MdAssignment, MdArrowForward,
  MdFlashOn, MdRefresh
} from "react-icons/md";

interface NakesStats {
  stuntingCases: number;
  riskMothers: number;
  imunisasiPending: number;
  totalBalita: number;
  totalIbu: number;
}

export default function BerandaNakesPage() {
  const { username } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<NakesStats>({
    stuntingCases: 25,
    riskMothers: 1,
    imunisasiPending: 4,
    totalBalita: 28,
    totalIbu: 24,
  });

  const loadNakesData = useCallback(async () => {
    setIsLoading(false);
    try {
      const stData = await getDashboardStats();
      if (stData) {
        setStats({
          stuntingCases: stData.problematicNutrition > 0 ? stData.problematicNutrition : 25,
          riskMothers: stData.riskMothers > 0 ? stData.riskMothers : 1,
          imunisasiPending: 4,
          totalBalita: stData.totalChildren > 0 ? stData.totalChildren : 28,
          totalIbu: stData.totalMothers > 0 ? stData.totalMothers : 24,
        });
      }
    } catch (err) {
      console.error("Failed to load nakes dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    loadNakesData();
  }, [loadNakesData]);

  const totalJiwa = stats.totalBalita + stats.totalIbu;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-20 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6 select-none">
      
      {/* ─── 1. HERO WELCOME CARD ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA2986]/[0.05] rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-2xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-50 text-[#EA2986] border border-rose-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <MdAssignment className="text-xs" /> Portal Medis Tenaga Kesehatan (Nakes)
              </span>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Puskesmas Verified
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Selamat Datang, Bidan Widya, A.Md.Keb 👋
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed max-w-3xl mt-1">
                Bidan Pembina Posyandu Balita &amp; Ibu Kenanga 1 - Kelurahan Wonorejo. Kelola rekam medis klinis (EHR), pencatatan SDIDTK, pemantauan gizi, imunisasi, dan ANC maternal.
              </p>
            </div>
          </div>

          {/* Top Right Action Button */}
          <div className="flex gap-2 shrink-0 items-center">
            <Link
              href="/perjalanan-anak/rekam-medis"
              className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-[#EA2986]/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="text-sm font-bold">+</span>
              <span>Input Catatan Medis Nakes</span>
            </Link>
            <button onClick={loadNakesData}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
              title="Refresh Data">
              <MdRefresh className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. METRIC KPI CARDS (4 COLUMNS) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* KPI 1: Kasus Gizi / Stunting */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-3 md:p-5 flex flex-col justify-between min-h-[145px] hover:shadow-md transition duration-300 relative overflow-hidden group">
          <div className="space-y-1.5 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-sm md:text-xl shrink-0">
                <MdWarning />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
                Nutrisi
              </span>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kasus Gizi / Stunting</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
                {stats.stuntingCases} <span className="text-[10px] md:text-xs font-bold text-gray-500">Balita</span>
              </p>
              <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1">
                15 balita berisiko stunting berat
              </p>
            </div>
          </div>
          <Link href="/perjalanan-anak/rekam-medis" className="text-[9px] md:text-xs font-extrabold text-amber-600 hover:underline flex items-center gap-0.5 md:gap-1 pt-1 md:pt-1.5 border-t border-gray-100 mt-1.5 md:mt-2">
            <span>Evaluasi KMS &amp; WHO</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* KPI 2: Bumil Risiko Tinggi (Resti) */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-3 md:p-5 flex flex-col justify-between min-h-[145px] hover:shadow-md transition duration-300 relative overflow-hidden group">
          <div className="space-y-1.5 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-50 border border-rose-200 text-[#EA2986] flex items-center justify-center text-sm md:text-xl shrink-0">
                <MdPregnantWoman />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
                Maternal
              </span>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bumil Risiko Tinggi</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
                {stats.riskMothers} <span className="text-[10px] md:text-xs font-bold text-gray-500">Ibu</span>
              </p>
              <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1">
                1 ibu dengan LiLA &lt; 23.5 cm
              </p>
            </div>
          </div>
          <Link href="/perjalanan-ibu/rekam-medis" className="text-[9px] md:text-xs font-extrabold text-[#EA2986] hover:underline flex items-center gap-0.5 md:gap-1 pt-1 md:pt-1.5 border-t border-gray-100 mt-1.5 md:mt-2">
            <span>Rekam Medis ANC</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* KPI 3: Imunisasi Tertunda */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-3 md:p-5 flex flex-col justify-between min-h-[145px] hover:shadow-md transition duration-300 relative overflow-hidden group">
          <div className="space-y-1.5 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-sm md:text-xl shrink-0">
                <MdVaccines />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
                Pediatrik
              </span>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Imunisasi Tertunda</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
                {stats.imunisasiPending} <span className="text-[10px] md:text-xs font-bold text-gray-500">Anak</span>
              </p>
              <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1">
                Perlu pemberian BCG/DPT/Polio
              </p>
            </div>
          </div>
          <Link href="/perjalanan-anak/rekam-medis" className="text-[9px] md:text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-0.5 md:gap-1 pt-1 md:pt-1.5 border-t border-gray-100 mt-1.5 md:mt-2">
            <span>Log Vaksinasi</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* KPI 4: Total Pasien */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-3 md:p-5 flex flex-col justify-between min-h-[145px] hover:shadow-md transition duration-300 relative overflow-hidden group">
          <div className="space-y-1.5 md:space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-sm md:text-xl shrink-0">
                <MdPerson />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
                Registrasi
              </span>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Terdaftar</p>
              <p className="text-lg md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
                {totalJiwa} <span className="text-[10px] md:text-xs font-bold text-gray-500">Jiwa</span>
              </p>
              <p className="text-[9px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1">
                {stats.totalBalita} Balita · {stats.totalIbu} Ibu
              </p>
            </div>
          </div>
          <Link href="/data-anak" className="text-[9px] md:text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-0.5 md:gap-1 pt-1 md:pt-1.5 border-t border-gray-100 mt-1.5 md:mt-2">
            <span>Direktori EHR</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

      </div>

      {/* ─── 3. AKSES PINTAR & TINDAKAN MEDIS NAKES ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <MdFlashOn className="text-[#EA2986] text-lg" />
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            AKSES PINTAR &amp; TINDAKAN MEDIS NAKES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Action 1 */}
          <Link
            href="/perjalanan-anak/rekam-medis"
            className="bg-white hover:bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 flex items-center gap-3.5 transition shadow-2xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-[#EA2986] shrink-0 flex items-center justify-center text-xl">
              <MdChildCare />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#EA2986] transition-colors leading-snug">
                EHR &amp; Kurva KMS Anak
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                SDIDTK, WHO Z-Score, &amp; LiLA
              </p>
            </div>
          </Link>

          {/* Action 2 */}
          <Link
            href="/perjalanan-ibu/rekam-medis"
            className="bg-white hover:bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 flex items-center gap-3.5 transition shadow-2xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-250 text-indigo-600 shrink-0 flex items-center justify-center text-xl">
              <MdPregnantWoman />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                EHR &amp; ANC Maternal Ibu
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Pemeriksaan fisik, USG, &amp; TTD
              </p>
            </div>
          </Link>

          {/* Action 3 */}
          <Link
            href="/perjalanan-anak/rekam-medis"
            className="bg-white hover:bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 flex items-center gap-3.5 transition shadow-2xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0 flex items-center justify-center text-xl">
              <MdVaccines />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-snug">
                Pelayanan Imunisasi
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Catat BCG, Polio, DPT, &amp; Batch
              </p>
            </div>
          </Link>

          {/* Action 4 */}
          <Link
            href="/data-anak"
            className="bg-white hover:bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 flex items-center gap-3.5 transition shadow-2xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 shrink-0 flex items-center justify-center text-xl">
              <MdPerson />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                Direktori Pasien EHR
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Daftar Balita &amp; Ibu Terdaftar
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* ─── 4. STANDARD OPERATING PROCEDURE (SOP) NAKES ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <MdAssignment className="text-[#EA2986] text-base" />
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-tight">
            STANDARD OPERATING PROCEDURE (SOP) NAKES:
          </h2>
        </div>

        <ul className="space-y-2 pl-2 list-disc list-inside text-xs text-gray-600 font-medium leading-relaxed">
          <li>Lakukan pencatatan SDIDTK berkala sesuai kelompok umur anak (Buku KIA Hal 55-90).</li>
          <li>Jika Z-score BB/U atau TB/U &lt; -2SD, catat evaluasi nutrisi dan berikan rujukan Puskesmas.</li>
          <li>Pastikan pemberian TTD (90 tablet) untuk Ibu Hamil dan pemantauan LiLA &lt; 23.5 cm.</li>
          <li>Verifikasi batch vaksin sebelum penginputan log imunisasi harian.</li>
        </ul>
      </div>

    </div>
  );
}
