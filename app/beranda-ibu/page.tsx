"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { getLoggedInMotherDetail } from "@/app/actions/mothers";
import { getSchedules } from "@/app/actions/schedule";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { useUserRole } from "@/context/UserRoleContext";
import { getCacheItem, setCacheItem } from "@/lib/db/dexieDb";
import { mockArticles, Article as EdukasiArticle } from "@/app/edukasi/data";
import { 
  MdMenuBook, MdArrowForward, MdKeyboardArrowRight, MdCalendarMonth, 
  MdPregnantWoman, MdChildCare, MdScale, MdStraighten, MdCake, 
  MdMedicalServices, MdAssignment, MdShowChart, MdWarning, 
  MdLocalHospital, MdHealing, MdFlashOn
} from "react-icons/md";
import { FaPills } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────
interface MotherDetail {
  name: string;
  mother_id: string;
  pregnant_status?: string; 
  status: string;
  estimated_due_date?: string | null; 
  children: ChildDetail[];
  maternal_records: MaternalRecord[];
}
interface ChildDetail {
  child_id: string; name: string; gender: string;
  ageInMonths: number; current_weight: number; current_height: number; status: string;
}
interface MaternalRecord {
  date: string; blood_pressure: string; weight: number; muac: number; cadre_notes: string;
}

// ─── Helpers ──────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmtDate = (d: string | Date | null) => {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

const getShortDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const parts = dateStr.split(",");
  const mainPart = parts[1] || parts[0];
  const trimmed = mainPart.trim();
  return trimmed
    .replace("Januari", "Jan")
    .replace("Februari", "Feb")
    .replace("Maret", "Mar")
    .replace("April", "Apr")
    .replace("Mei", "Mei")
    .replace("Juni", "Jun")
    .replace("Juli", "Jul")
    .replace("Agustus", "Agt")
    .replace("September", "Sep")
    .replace("Oktober", "Okt")
    .replace("November", "Nov")
    .replace("Desember", "Des");
};

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Kehamilan": return "bg-[#FCE8F0] text-[#EA2986] border border-[#EA2986]/25";
    case "Melahirkan": return "bg-[#ECF2FE] text-[#4A85F6] border border-[#4A85F6]/25";
    case "Setelah Melahirkan": return "bg-[#E5E6F2] text-[#3E57A3] border border-[#3E57A3]/25";
    case "Menyusui": return "bg-[#E6F8ED] text-[#1E9D5D] border border-[#1E9D5D]/25";
    case "0 - 6 Bulan": return "bg-[#F3E8FF] text-[#9333EA] border border-[#9333EA]/25";
    case "6 - 12 Bulan": return "bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/25";
    case "12 - 24 Bulan": return "bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]/25";
    case "2 - 6 Tahun": return "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/25";
    case "Informasi Umum": return "bg-gray-100 text-gray-700 border border-gray-300/30";
    default: return "bg-gray-200 text-gray-800 border border-gray-300/20";
  }
};

const getAccentColor = (cat: string): string => {
  switch (cat) {
    case "Kehamilan": return "#EA2986";
    case "Melahirkan": return "#4A85F6";
    case "Setelah Melahirkan": return "#3E57A3";
    case "Menyusui": return "#1E9D5D";
    case "0 - 6 Bulan": return "#9333EA";
    case "6 - 12 Bulan": return "#EA580C";
    case "12 - 24 Bulan": return "#0284C7";
    case "2 - 6 Tahun": return "#DC2626";
    case "Informasi Umum": return "#374151";
    default: return "#EA2986";
  }
};

// ─── Dashboard Article Card Component ─────────────────────
function DashboardArticleCard({ article }: { article: EdukasiArticle }) {
  const [hovered, setHovered] = useState(false);
  const primaryCategory = article.categories?.[0] || "Informasi Umum";
  const accentColor = getAccentColor(primaryCategory);
  
  return (
    <div 
      className="min-w-[260px] w-[260px] md:w-auto md:min-w-0 snap-align-start shrink-0 md:shrink bg-white border border-gray-200/60 rounded-2xl flex flex-col justify-between overflow-hidden group hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative h-36 w-full overflow-hidden bg-gray-100 shrink-0">
        <Image 
          src={article.imageUrl} 
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className={`${getCategoryColor(primaryCategory)} text-[9px] font-bold px-2 py-0.5 rounded-full`}>
            {primaryCategory}
          </span>
        </div>
      </div>

      {/* Title & Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <Link href="/edukasi">
          <h3 
            className="text-xs font-extrabold text-gray-900 leading-snug transition-colors line-clamp-3"
            style={{ color: hovered ? accentColor : "" }}
          >
            {article.title}
          </h3>
        </Link>
      </div>

      {/* Meta Footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <MdMenuBook className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span>{article.duration || "5 Menit"}</span>
        </div>
        <Link href="/edukasi" className="text-xs font-bold hover:underline flex items-center gap-0.5" style={{ color: accentColor }}>
          Baca <MdKeyboardArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── TTD Progress Ring ────────────────────────────────────
function TtdRing({ taken, total }: { taken: number; total: number }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const pct = total > 0 ? taken / total : 0;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="rotate-[-90deg]">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke="#EA2986" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
        className="transition-all duration-700"/>
    </svg>
  );
}

// ─── Growth Card ──────────────────────────────────────────
function ChildGrowthCard({ child }: { child: ChildDetail }) {
  const isNormal = child.status === "Normal";
  return (
    <Link href="/data-anak"
      className="bg-white border border-gray-200/80 rounded-2xl p-4 hover:border-[#EA2986]/30 hover:shadow-sm transition-all relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EA2986] rounded-l-2xl"/>
      <div className="pl-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-bold text-sm text-gray-900">{child.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-[#EA2986] bg-[#EA2986]/10 px-2 py-0.5 rounded-full">
                {child.gender === "M" ? "Laki-laki" : "Perempuan"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{child.ageInMonths} Bulan</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${isNormal ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {child.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Berat", value: `${child.current_weight || "-"} kg`, icon: <MdScale className="mx-auto text-gray-500" /> },
            { label: "Tinggi", value: `${child.current_height || "-"} cm`, icon: <MdStraighten className="mx-auto text-gray-500" /> },
            { label: "Usia", value: `${child.ageInMonths} bln`, icon: <MdCake className="mx-auto text-gray-500" /> },
          ].map((d, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-2 text-center flex flex-col justify-between min-h-[55px]">
              <div className="text-sm text-gray-500 flex justify-center items-center h-4">{d.icon}</div>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">{d.label}</p>
              <p className="text-[11px] font-extrabold text-gray-900 leading-none mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 bg-gray-100 rounded-2xl"/>
      <div className="flex overflow-x-auto gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 w-60 shrink-0 bg-gray-100 rounded-2xl"/>)}</div>
      <div className="grid grid-cols-12 gap-6"><div className="col-span-8 h-80 bg-gray-100 rounded-2xl"/><div className="col-span-4 h-80 bg-gray-100 rounded-2xl"/></div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function IbuDashboardPage() {
  const { username } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  const [motherDetail, setMotherDetail] = useState<MotherDetail | null>(null);
  const [nextSchedule, setNextSchedule] = useState<any>(null);
  const [hasTtdToday, setHasTtdToday] = useState(false);
  const [ttdMonthCount, setTtdMonthCount] = useState(0);
  const [ttdCompanion, setTtdCompanion] = useState("");
  const [displayArticles, setDisplayArticles] = useState<EdukasiArticle[]>([]);
  const TTD_TARGET = 30;

  const today = new Date();
  const todayStr = `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

  const loadData = useCallback(async () => {
    const cached = await getCacheItem("mother_detail_v2");
    const cachedSched = await getCacheItem("mother_sched_v2");
    if (cached) { setMotherDetail(cached); setIsLoading(false); }
    if (cachedSched) setNextSchedule(cachedSched);

    if (!navigator.onLine) { setIsLoading(false); return; }

    try {
      const [detail, schedules] = await Promise.all([
        getLoggedInMotherDetail(username),
        getSchedules(),
      ]);
      if (detail) { 
        setMotherDetail(detail as unknown as MotherDetail); 
        await setCacheItem("mother_detail_v2", detail); 
      }

      const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
      const ns = schedules?.find((s: any) => new Date(s.rawDate) >= todayDate) ?? null;
      setNextSchedule(ns);
      if (ns) await setCacheItem("mother_sched_v2", ns);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [username]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load articles synchronized with history from Edukasi page + mother's real condition
  useEffect(() => {
    const historyJson = typeof window !== "undefined" ? localStorage.getItem("viewed_articles_history") : null;
    let historyIds: string[] = [];
    if (historyJson) {
      try { historyIds = JSON.parse(historyJson); } catch (e) {}
    }

    const customJson = typeof window !== "undefined" ? localStorage.getItem("custom_articles") : null;
    let allAvailable = [...mockArticles];
    if (customJson) {
      try {
        const customList = JSON.parse(customJson);
        allAvailable = [...allAvailable, ...customList];
      } catch (e) {}
    }

    const historyArticles: EdukasiArticle[] = [];
    historyIds.forEach(id => {
      const found = allAvailable.find(a => a.id === id);
      if (found && !historyArticles.some(x => x.id === found.id)) {
        historyArticles.push(found);
      }
    });

    const isHamil = motherDetail?.pregnant_status === "Hamil";
    const mainChild = motherDetail?.children[0] ?? null;

    let targetCat = "Kehamilan";
    if (!isHamil && mainChild) {
      if (mainChild.ageInMonths <= 6) targetCat = "0 - 6 Bulan";
      else if (mainChild.ageInMonths <= 12) targetCat = "6 - 12 Bulan";
      else targetCat = "12 - 24 Bulan";
    }

    const categoryMatched = allAvailable.filter(a => a.categories?.includes(targetCat as any));

    const combined = [...historyArticles];
    categoryMatched.forEach(a => {
      if (!combined.some(x => x.id === a.id)) combined.push(a);
    });
    allAvailable.forEach(a => {
      if (!combined.some(x => x.id === a.id)) combined.push(a);
    });

    setDisplayArticles(combined.slice(0, 4));
  }, [motherDetail]);

  useEffect(() => {
    if (!motherDetail) return;
    const dt = new Date();
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const cacheKey = `ttd_${motherDetail.mother_id}_${dt.getFullYear()}_${dt.getMonth() + 1}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const logs = parsed.logs || [];
      setHasTtdToday(logs.some((l: any) => l.intake_date === dateStr && l.taken));
      setTtdMonthCount(logs.filter((l: any) => l.taken).length);
    }
    if (!navigator.onLine) return;
    getTtdLogs(motherDetail.mother_id, dt.getFullYear(), dt.getMonth() + 1).then(res => {
      if (res?.success) {
        setHasTtdToday(res.logs.some((l: any) => l.intake_date === dateStr && l.taken));
        setTtdMonthCount(res.logs.filter((l: any) => l.taken).length);
        localStorage.setItem(cacheKey, JSON.stringify({ logs: res.logs }));
      }
    });
  }, [motherDetail]);

  const toggleTtd = async () => {
    if (!motherDetail) return;
    const dt = new Date();
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const next = !hasTtdToday;
    setHasTtdToday(next);
    setTtdMonthCount(c => next ? c + 1 : Math.max(0, c - 1));
    if (navigator.onLine) {
      try { await upsertTtdLog(motherDetail.mother_id, dateStr, next, ttdCompanion, "Suami"); } catch (e) {}
    }
  };

  if (isLoading) return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 bg-[#FAFAFA] min-h-screen"><Skeleton/></div>
  );
  if (!motherDetail) return (
    <div className="flex items-center justify-center min-h-[400px]"><p className="text-gray-400 text-sm">Data tidak ditemukan.</p></div>
  );

  const mainChild = motherDetail.children[0] ?? null;
  const isHamil = motherDetail.pregnant_status === "Hamil";
  const daysUntilHpl = motherDetail.estimated_due_date
    ? Math.max(0, Math.ceil((new Date(motherDetail.estimated_due_date).getTime() - Date.now()) / 86400000))
    : null;

  const appsShortcut = [
    { label: "Rekam Medis Anak", sub: "Riwayat Klinis", href: "/perjalanan-anak/rekam-medis", icon: <MdMedicalServices />, bg: "bg-emerald-50 border border-emerald-200/60 text-emerald-600" },
    { label: "Log Gejala Harian", sub: "Catatan Harian", href: "/perjalanan-anak?section=pemantauan_gejala", icon: <MdAssignment />, bg: "bg-blue-50 border border-blue-200/60 text-blue-600" },
    { label: "Lembar Perkembangan", sub: "Milestone Anak", href: "/perjalanan-anak?section=milestone", icon: <MdShowChart />, bg: "bg-amber-50 border border-amber-200/60 text-amber-600" },
    { label: "Gejala Bahaya Anak", sub: "Darurat & Sakit", href: "/perjalanan-anak?section=pemantauan_gejala", icon: <MdWarning />, bg: "bg-rose-50 border border-rose-200/60 text-rose-600" },
    { label: "Rekam Medis Ibu", sub: "Riwayat ANC Maternal", href: "/perjalanan-ibu/rekam-medis", icon: <MdLocalHospital />, bg: "bg-sky-50 border border-sky-200/60 text-sky-600" },
    { label: "Absensi Kelas Ibu", sub: "Kelas Balita", href: "/perjalanan-ibu?section=attendance", icon: <MdCalendarMonth />, bg: "bg-indigo-50 border border-indigo-200/60 text-indigo-600" },
    { label: "Pemantauan Nifas & KB", sub: "Kesehatan Nifas & KB", href: "/perjalanan-ibu?section=postpartum", icon: <MdHealing />, bg: "bg-teal-50 border border-teal-200/60 text-teal-600" },
    { label: "Gejala Mingguan Ibu", sub: "Evaluasi Ibu", href: "/perjalanan-ibu?section=weekly", icon: <MdPregnantWoman />, bg: "bg-purple-50 border border-purple-200/60 text-purple-600" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-20 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">

      {/* ─── HEADER BANNER ORANG TUA (CLEAN NAKES DASHBOARD STYLE) ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA2986]/[0.05] rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-2xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-50 text-[#EA2986] border border-rose-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                👶 Portal Orang Tua · Posyandu Kenanga 1
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Akun Terverifikasi
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Halo, Ibu {motherDetail.name}! 👋
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium mt-1 leading-relaxed max-w-2xl">
                {isHamil
                  ? `Kehamilan Anda sedang dipantau kader. Tetap jaga kesehatan, penuhi nutrisi harian, dan rutin mengikuti pemeriksaan ANC.`
                  : `Pantau tumbuh kembang si kecil secara berkala, kelola jadwal imunisasi dasar, dan dapatkan materi edukasi posyandu terpercaya.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 KPI STAT CARDS (CLEAN & HORIZONTAL GRID ON MOBILE & DESKTOP) ─── */}
      <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4 -mx-2 px-2 md:mx-0 md:px-0">
        
        {/* Card 1: Status */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-rose-200 shadow-xs p-2.5 md:p-5 space-y-1.5 md:space-y-3 relative overflow-hidden group hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-rose-50 border border-rose-200 text-[#EA2986] flex items-center justify-center text-xs md:text-xl shrink-0">
              <MdPregnantWoman />
            </div>
            <span className="text-[7px] md:text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
              Maternal
            </span>
          </div>
          <div>
            <p className="text-[7px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
            <p className="text-[10px] md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
              <span className="md:hidden">{isHamil ? "Hamil" : "Ibu"}</span>
              <span className="hidden md:inline">{isHamil ? "Hamil" : "Ibu Balita"}</span>
            </p>
            <p className="text-[8px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-none">
              {motherDetail.status}
            </p>
          </div>
          <Link href="/perjalanan-ibu/rekam-medis" className="text-[8px] md:text-xs font-extrabold text-[#EA2986] hover:underline flex items-center gap-0.5 md:gap-1 pt-0.5 md:pt-1.5 border-t border-gray-100 mt-1 md:mt-2">
            <span>Rekam Medis</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* Card 2: Anak */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-amber-200 shadow-xs p-2.5 md:p-5 space-y-1.5 md:space-y-3 relative overflow-hidden group hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-xs md:text-xl shrink-0">
              <MdChildCare />
            </div>
            <span className="text-[7px] md:text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
              Pediatrik
            </span>
          </div>
          <div>
            <p className="text-[7px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Anak</p>
            <p className="text-[10px] md:text-2xl font-black text-gray-900 mt-0.5 leading-tight">
              {motherDetail.children.length} <span className="text-[8px] md:text-xs font-bold text-gray-500">Balita</span>
            </p>
            <p className="text-[8px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-none">
              {mainChild ? `Berat: ${mainChild.current_weight} kg` : "-"}
            </p>
          </div>
          <Link href="/data-anak" className="text-[8px] md:text-xs font-extrabold text-amber-600 hover:underline flex items-center gap-0.5 md:gap-1 pt-0.5 md:pt-1.5 border-t border-gray-100 mt-1 md:mt-2">
            <span>Kesehatan</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* Card 3: Agenda Terdekat */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-emerald-300 shadow-xs p-2.5 md:p-5 space-y-1.5 md:space-y-3 relative overflow-hidden group hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-xs md:text-xl shrink-0">
              <MdCalendarMonth />
            </div>
            <span className="text-[7px] md:text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 md:px-2.5 py-0.5 rounded-full uppercase">
              Agenda
            </span>
          </div>
          <div>
            <p className="text-[7px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jadwal Terdekat</p>
            <p className="text-[9px] md:text-lg font-black text-gray-900 mt-0.5 leading-tight">
              {nextSchedule?.date ? getShortDate(nextSchedule.date) : "Bulan Ini"}
            </p>
            <p className="text-[8px] md:text-xs text-gray-500 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-none">
              Posyandu Kenanga 1
            </p>
          </div>
          <Link href="/jadwal" className="text-[8px] md:text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-0.5 md:gap-1 pt-0.5 md:pt-1.5 border-t border-gray-100 mt-1 md:mt-2">
            <span>Detail</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </Link>
        </div>

        {/* Card 4: TTD (Interactive Checklist Card) */}
        <div 
          onClick={toggleTtd}
          className={`rounded-xl md:rounded-2xl border shadow-xs p-2.5 md:p-5 flex flex-col justify-between min-h-[95px] md:min-h-[145px] text-left transition-all duration-300 cursor-pointer active:scale-95 select-none ${
            hasTtdToday 
              ? "bg-[#EA2986] border-[#EA2986] text-white shadow-[#EA2986]/20" 
              : "bg-white border-blue-200 text-gray-800"
          }`}
          title="Klik untuk tandai sudah minum TTD hari ini"
        >
          <div className="flex items-center justify-between">
            <div className={`w-6 h-6 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-xl shrink-0 ${
              hasTtdToday 
                ? "bg-white/20 text-white border border-white/30" 
                : "bg-blue-50 border border-blue-100 text-blue-650"
            }`}>
              <FaPills />
            </div>
            <span className={`text-[7px] md:text-[10px] font-black px-1.5 md:px-2.5 py-0.5 rounded-full uppercase ${
              hasTtdToday 
                ? "text-white bg-white/20 border border-white/30" 
                : "text-blue-700 bg-blue-50 border border-blue-200"
            }`}>
              Checklist
            </span>
          </div>
          <div>
            <p className={`text-[7px] md:text-[10px] font-bold uppercase tracking-wider ${
              hasTtdToday ? "text-white/80" : "text-gray-400"
            }`}>TTD</p>
            <p className={`text-[10px] md:text-lg font-black leading-tight mt-0.5 ${
              hasTtdToday ? "text-white" : "text-gray-900"
            }`}>
              {hasTtdToday ? "Sudah" : "Belum"}
            </p>
            <p className={`text-[8px] md:text-xs mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-none ${
              hasTtdToday ? "text-white/90" : "text-gray-500"
            }`}>
              {ttdMonthCount}/{TTD_TARGET} tab bulan ini
            </p>
          </div>
          <div className={`text-[8px] md:text-xs font-extrabold flex items-center gap-0.5 md:gap-1 pt-0.5 md:pt-1.5 border-t mt-1 md:mt-2 ${
            hasTtdToday ? "text-white/95 border-white/20" : "text-blue-600 border-gray-100"
          }`}>
            <span>{hasTtdToday ? "Tandai Belum" : "Tandai Sudah"}</span> <MdArrowForward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA: TWO EQUAL COLUMNS ON DESKTOP ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Column 1: Tumbuh Kembang Anak (Growth logs) */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <MdChildCare className="text-[#EA2986] text-lg" /> Tumbuh Kembang Anak
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Rekapitulasi tumbuh kembang balita terdaftar Anda.</p>
            </div>
            <Link href="/data-anak" className="text-xs font-bold text-[#EA2986] hover:underline flex items-center gap-1">Detail →</Link>
          </div>
          {motherDetail.children.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-gray-400">Belum ada anak terdaftar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 flex-1">
              {motherDetail.children.map((c) => <ChildGrowthCard key={c.child_id} child={c}/>)}
            </div>
          )}
        </div>

        {/* Column 2: Akses Cepat (Quick shortcuts) */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <MdFlashOn className="text-[#EA2986] text-lg" /> Akses Cepat
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Kurikulum kesehatan mandiri &amp; pintasan cepat.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 pt-2 flex-1 items-center">
            {appsShortcut.map((app, index) => (
              <Link key={index} href={app.href} className="flex flex-col items-center text-center group">
                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${app.bg} flex items-center justify-center text-xl md:text-2xl shadow-xs hover:scale-105 transition-transform duration-200 select-none`}>
                  {app.icon}
                </div>
                <span className="text-[9px] md:text-[11px] font-black text-gray-800 mt-2 group-hover:text-[#EA2986] transition-colors leading-tight max-w-[70px] md:max-w-[120px] line-clamp-2">{app.label}</span>
                <span className="hidden sm:block text-[9px] text-gray-400 font-medium mt-0.5 max-w-[110px] truncate">{app.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM SECTION: LANJUTKAN MEMBACA & REKOMENDASI ARTIKEL ─── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        {/* Header Section: Judul Kiri & Link Tampilkan Selengkapnya */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <MdMenuBook className="text-[#EA2986] text-lg" /> Lanjutkan Membaca
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Histori artikel terakhir yang Anda baca &amp; rekomendasi sesuai kondisi Anda.</p>
          </div>
          
          <Link 
            href="/edukasi" 
            className="px-3.5 py-2 rounded-xl bg-[#EA2986]/10 hover:bg-[#EA2986]/20 text-[#EA2986] text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <span>Tampilkan Selengkapnya</span>
            <MdArrowForward className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Article Cards: Horizontal Scroll on Mobile, 4-Cols Grid on Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 pb-2 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {displayArticles.map((article) => (
            <DashboardArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

    </div>
  );
}