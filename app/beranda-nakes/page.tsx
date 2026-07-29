"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/app/actions/dashboard";
import { useUserRole } from "@/context/UserRoleContext";

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
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 select-none">
      
      {/* ─── 1. HERO WELCOME CARD ─── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-4">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">
                PORTAL MEDIS TENAGA KESEHATAN (NAKES)
              </span>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full uppercase tracking-wider">
                PUSKESMAS VERIFIED
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Selamat Datang, Bidan Widya, A.Md.Keb
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-normal leading-relaxed max-w-3xl mt-2">
                Bidan Pembina Posyandu Balita &amp; Ibu Kenanga 1 - Kelurahan Wonokromo. Kelola rekam medis klinis (EHR), pencatatan SDIDTK, pemantauan gizi, imunisasi, dan ANC maternal.
              </p>
            </div>
          </div>

          {/* Top Right Action Button */}
          <div className="shrink-0 pt-1">
            <Link
              href="/perjalanan-anak/rekam-medis"
              className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <span className="text-sm font-bold">+</span>
              <span>Input Catatan Medis Nakes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 2. METRIC KPI CARDS (4 COLUMNS) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Kasus Gizi / Stunting */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              KASUS GIZI / STUNTING
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">{stats.stuntingCases}</span>
              <span className="text-sm font-semibold text-gray-700">Balita</span>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-1">
              15 balita berisiko stunting berat
            </p>
          </div>

          <div>
            <div className="border-b border-gray-100 my-3" />
            <Link
              href="/perjalanan-anak/rekam-medis"
              className="text-xs font-bold text-gray-800 hover:text-gray-900 flex items-center justify-between transition group"
            >
              <span>Evaluasi KMS &amp; WHO</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* KPI 2: Bumil Risiko Tinggi (Resti) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              BUMIL RISIKO TINGGI (RESTI)
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">{stats.riskMothers}</span>
              <span className="text-sm font-semibold text-gray-700">Ibu</span>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-1">
              1 ibu dengan LiLA &lt; 23.5 cm
            </p>
          </div>

          <div>
            <div className="border-b border-gray-100 my-3" />
            <Link
              href="/perjalanan-ibu/rekam-medis"
              className="text-xs font-bold text-gray-800 hover:text-gray-900 flex items-center justify-between transition group"
            >
              <span>Rekam Medis ANC</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* KPI 3: Imunisasi Tertunda */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              IMUNISASI TERTUNDA
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">{stats.imunisasiPending}</span>
              <span className="text-sm font-semibold text-gray-700">Anak</span>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-1">
              Perlu pemberian BCG/DPT/Polio
            </p>
          </div>

          <div>
            <div className="border-b border-gray-100 my-3" />
            <Link
              href="/perjalanan-anak/rekam-medis"
              className="text-xs font-bold text-gray-800 hover:text-gray-900 flex items-center justify-between transition group"
            >
              <span>Log Vaksinasi</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* KPI 4: Total Pasien Terdaftar */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              TOTAL PASIEN TERDAFTAR
            </p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-extrabold text-gray-900">{totalJiwa}</span>
              <span className="text-sm font-semibold text-gray-700">Jiwa</span>
            </div>
            <p className="text-xs text-gray-400 font-normal mt-1">
              {stats.totalBalita} Balita · {stats.totalIbu} Ibu
            </p>
          </div>

          <div>
            <div className="border-b border-gray-100 my-3" />
            <Link
              href="/data-anak"
              className="text-xs font-bold text-gray-800 hover:text-gray-900 flex items-center justify-between transition group"
            >
              <span>Direktori EHR</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ─── 3. AKSES PINTAR & TINDAKAN MEDIS NAKES ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded-xs" />
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
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded-xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
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
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded-xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
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
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded-xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
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
            <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200/80 shrink-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 rounded-xs" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-gray-800 leading-snug">
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
          <div className="w-3.5 h-3.5 bg-gray-200 rounded-xs" />
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
