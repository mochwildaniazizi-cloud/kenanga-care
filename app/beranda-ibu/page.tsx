"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getLoggedInMotherDetail } from "@/app/actions/mothers";
import { getSchedules } from "@/app/actions/schedule";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { useUserRole } from "@/context/UserRoleContext";
import { 
  MdPregnantWoman, MdChildFriendly, MdCalendarMonth, MdScale, 
  MdVaccines, MdCheckCircle, MdTrendingUp, MdMenuBook, 
  MdInfoOutline, MdKeyboardArrowRight, MdArrowForward,
  MdBookmarkBorder, MdShare
} from "react-icons/md";
import { FaBaby, FaNotesMedical, FaBookOpen } from "react-icons/fa";

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
interface Article {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  fullTitle: string;
  readTime: string;
  category: "Hamil" | "0-6 Bulan" | "6-12 Bulan";
}

// ─── Dummy Database Artikel Edukasi ────────────────────────
const ALL_ARTICLES: Article[] = [
  {
    id: 1,
    tag: "0 - 6 Bulan",
    tagColor: "text-purple-600 bg-purple-50 border border-purple-100",
    title: "Pemantauan Bayi Usia 3 - 6 Bulan: Stimulasi Motorik...",
    fullTitle: "Pemantauan Bayi Usia 3 - 6 Bulan: Stimulasi Motorik, Perawatan Gusi Pertama, & 10 Indikator Perkembangan",
    readTime: "6 Menit",
    category: "0-6 Bulan"
  },
  {
    id: 2,
    tag: "6 - 12 Bulan",
    tagColor: "text-amber-600 bg-amber-50 border border-amber-100",
    title: "Pemantauan Bayi Usia 9-12 Bulan: Manfaat Imunisasi...",
    fullTitle: "Pemantauan Bayi Usia 9-12 Bulan: Manfaat Imunisasi JE, Perawatan Gigi Geraham, & 12 Indikator Perkembangan",
    readTime: "8 Menit",
    category: "6-12 Bulan"
  },
  {
    id: 3,
    tag: "6 - 12 Bulan",
    tagColor: "text-amber-600 bg-amber-50 border border-amber-100",
    title: "Strategi Pemenuhan Gizi 6-24 Bulan: 4 Syarat MPASI...",
    fullTitle: "Strategi Pemenuhan Gizi 6-24 Bulan: 4 Syarat MPASI Layak, Aturan Takaran Usia, & Panduan Resep Praktis",
    readTime: "8 Menit",
    category: "6-12 Bulan"
  },
  {
    id: 4,
    tag: "6 - 12 Bulan",
    tagColor: "text-amber-600 bg-amber-50 border border-amber-100",
    title: "Panduan Kelompok Bahan MPASI 6-12 Bulan: Strategi...",
    fullTitle: "Panduan Kelompok Bahan MPASI 6-12 Bulan: Strategi Mengenalkan Alergi & Aturan Transisi Tekstur Makanan",
    readTime: "6 Menit",
    category: "6-12 Bulan"
  },
  {
    id: 5,
    tag: "Kehamilan",
    tagColor: "text-pink-600 bg-pink-50 border border-pink-100",
    title: "Nutrisi Trimester 1: Mengatasi Morning Sickness...",
    fullTitle: "Nutrisi Trimester 1: Mengatasi Morning Sickness & Pemenuhan Kebutuhan Asam Folat Janin",
    readTime: "5 Menit",
    category: "Hamil"
  },
  {
    id: 6,
    tag: "Kehamilan",
    tagColor: "text-pink-600 bg-pink-50 border border-pink-100",
    title: "Tanda Bahaya Kehamilan yang Wajib Diwaspadai...",
    fullTitle: "Tanda Bahaya Kehamilan yang Wajib Diwaspadai & Langkah Penanganan Dini Medis",
    readTime: "7 Menit",
    category: "Hamil"
  }
];

// ─── Helpers ──────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmtDate = (d: string | Date | null) => {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

// ─── TTD Ring Progress ────────────────────────────────────
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
      className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#EA2986]/30 hover:shadow-sm transition-all relative overflow-hidden group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EA2986] rounded-l-2xl"/>
      <div className="pl-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-bold text-sm text-gray-900">{child.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-[#EA2986] bg-[#EA2986]/10 px-2 py-0.5 rounded-full">
                {child.gender==="M"?"Laki-laki":"Perempuan"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">{child.ageInMonths} Bulan</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${isNormal?"bg-emerald-50 text-emerald-600 border border-emerald-200":"bg-red-50 text-red-600 border border-red-200"}`}>
            {child.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            {label:"Berat", value:`${child.current_weight||"-"} kg`, icon:"⚖️"},
            {label:"Tinggi",value:`${child.current_height||"-"} cm`,icon:"📏"},
            {label:"Usia",  value:`${child.ageInMonths} bln`,        icon:"🎂"},
          ].map((d,i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <div className="text-base">{d.icon}</div>
              <p className="text-[10px] text-gray-400 mt-0.5">{d.label}</p>
              <p className="text-xs font-extrabold text-gray-900">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── Education Card ───────────────────────────────────────
function EduCard({ tag, tagColor, title, href }: {
  tag: string; tagColor: string; title: string; href: string;
}) {
  return (
    <Link href={href}
      className="p-3.5 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group cursor-pointer flex items-start gap-3 bg-white">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 text-sm">📖</div>
      <div className="flex-1 min-w-0">
        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${tagColor}`}>{tag}</span>
        <h4 className="font-bold text-xs text-gray-800 mt-1.5 leading-snug group-hover:text-[#EA2986] transition-colors">{title}</h4>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 bg-gray-100 rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-2xl"/>)}</div>
      <div className="grid grid-cols-12 gap-6"><div className="col-span-8 h-80 bg-gray-100 rounded-2xl"/><div className="col-span-4 h-80 bg-gray-100 rounded-2xl"/></div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function IbuDashboardPage() {
  const { username } = useUserRole();
  const [isLoading, setIsLoading]         = useState(true);
  const [motherDetail, setMotherDetail]   = useState<MotherDetail|null>(null);
  const [nextSchedule, setNextSchedule]   = useState<any>(null);
  const [hasTtdToday, setHasTtdToday]     = useState(false);
  const [ttdMonthCount, setTtdMonthCount] = useState(0);
  const [ttdCompanion, setTtdCompanion]   = useState("");
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const TTD_TARGET = 30;

  const loadData = useCallback(async () => {
    const cached = localStorage.getItem("mother_detail_v2");
    const cachedSched = localStorage.getItem("mother_sched_v2");
    if (cached)     { setMotherDetail(JSON.parse(cached)); setIsLoading(false); }
    if (cachedSched)  setNextSchedule(JSON.parse(cachedSched));

    if (!navigator.onLine) { setIsLoading(false); return; }

    try {
      const [detail, schedules] = await Promise.all([
        getLoggedInMotherDetail(username),
        getSchedules(),
      ]);
      if (detail) { 
        setMotherDetail(detail as unknown as MotherDetail); 
        localStorage.setItem("mother_detail_v2", JSON.stringify(detail)); 
      }

      const todayDate = new Date(); todayDate.setHours(0,0,0,0);
      const ns = schedules?.find((s:any) => new Date(s.rawDate) >= todayDate) ?? null;
      setNextSchedule(ns);
      if (ns) localStorage.setItem("mother_sched_v2", JSON.stringify(ns));
    } catch(e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [username]);

  useEffect(() => { loadData(); }, [loadData]);

  // Dynamic Content Recommendation Logic based on Mother's Real Condition
  useEffect(() => {
    if (!motherDetail) return;

    const isHamil = motherDetail.pregnant_status === "Hamil";
    const mainChild = motherDetail.children[0] ?? null;

    let targetCategory: "Hamil" | "0-6 Bulan" | "6-12 Bulan" = "6-12 Bulan"; // fallback default

    if (isHamil) {
      targetCategory = "Hamil";
    } else if (mainChild) {
      if (mainChild.ageInMonths <= 6) {
        targetCategory = "0-6 Bulan";
      } else {
        targetCategory = "6-12 Bulan";
      }
    }

    // Mengambil artikel yang cocok dengan kondisi ibu saat ini, sisanya sebagai pelengkap
    const primaryMatched = ALL_ARTICLES.filter(art => art.category === targetCategory);
    const secondaryMatched = ALL_ARTICLES.filter(art => art.category !== targetCategory);
    
    // Tampilkan 4 artikel kombinasi (Prioritas kondisi saat ini ditaruh di depan)
    setRecommendedArticles([...primaryMatched, ...secondaryMatched].slice(0, 4));

  }, [motherDetail]);

  useEffect(() => {
    if (!motherDetail) return;
    const dt = new Date();
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    const cacheKey = `ttd_${motherDetail.mother_id}_${dt.getFullYear()}_${dt.getMonth()+1}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const logs = parsed.logs || [];
      setHasTtdToday(logs.some((l:any) => l.intake_date===dateStr && l.taken));
      setTtdMonthCount(logs.filter((l:any) => l.taken).length);
    }
    if (!navigator.onLine) return;
    getTtdLogs(motherDetail.mother_id, dt.getFullYear(), dt.getMonth()+1).then(res => {
      if (res?.success) {
        setHasTtdToday(res.logs.some((l:any) => l.intake_date===dateStr && l.taken));
        setTtdMonthCount(res.logs.filter((l:any) => l.taken).length);
        localStorage.setItem(cacheKey, JSON.stringify({logs:res.logs}));
      }
    });
  }, [motherDetail]);

  const toggleTtd = async () => {
    if (!motherDetail) return;
    const dt = new Date();
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    const next = !hasTtdToday;
    setHasTtdToday(next);
    setTtdMonthCount(c => next ? c+1 : Math.max(0,c-1));
    if (navigator.onLine) {
      try { await upsertTtdLog(motherDetail.mother_id, dateStr, next, ttdCompanion, "Suami"); } catch(e) {}
    }
  };

  if (isLoading) return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 bg-[#FAFAFA] min-h-screen"><Skeleton/></div>
  );
  if (!motherDetail) return (
    <div className="flex items-center justify-center min-h-[400px]"><p className="text-gray-400 text-sm">Data tidak ditemukan.</p></div>
  );

  const mainChild = motherDetail.children[0] ?? null;
  const isHamil   = motherDetail.pregnant_status === "Hamil";
  const daysUntilHpl = motherDetail.estimated_due_date
    ? Math.max(0, Math.ceil((new Date(motherDetail.estimated_due_date).getTime() - Date.now()) / 86400000))
    : null;

  const appsShortcut = [
    { label: "Rekam Medis Anak", sub: "Riwayat Klinis", href: "/perjalanan-anak/rekam-medis", emoji: "🩺", bg: "bg-emerald-50 border border-emerald-200/60" },
    { label: "Log Gejala Harian", sub: "Catatan Harian", href: "/perjalanan-anak?section=pemantauan_gejala", emoji: "📝", bg: "bg-blue-50 border border-blue-200/60" },
    { label: "Lembar Perkembangan", sub: "Milestone Anak", href: "/perjalanan-anak?section=milestone", emoji: "📊", bg: "bg-amber-50 border border-amber-200/60" },
    { label: "Gejala Bahaya Anak", sub: "Darurat & Sakit", href: "/perjalanan-anak?section=pemantauan_gejala", emoji: "⚠️", bg: "bg-rose-50 border border-rose-200/60" },
    { label: "Rekam Medis Ibu", sub: "Riwayat ANC Maternal", href: "/perjalanan-ibu/rekam-medis", emoji: "🏥", bg: "bg-sky-50 border border-sky-200/60" },
    { label: "Absensi Kelas Ibu", sub: "Kelas Balita", href: "/perjalanan-ibu?section=attendance", emoji: "🗓️", bg: "bg-indigo-50 border border-indigo-200/60" },
    { label: "Pemantauan Nifas & KB", sub: "Kesehatan Nifas & KB", href: "/perjalanan-ibu?section=postpartum", emoji: "🩹", bg: "bg-teal-50 border border-teal-200/60" },
    { label: "Gejala Mingguan Ibu", sub: "Evaluasi Ibu", href: "/perjalanan-ibu?section=weekly", emoji: "🤰", bg: "bg-purple-50 border border-purple-200/60" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">

      {/* Jumbotron */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#EA2986] opacity-[0.04] rounded-full pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-[#EA2986] bg-[#EA2986]/10 px-2.5 py-1 rounded-md uppercase tracking-widest">
              Portal Orang Tua · Posyandu Kenanga 1
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Halo, Ibu {motherDetail.name}! 👋
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              {isHamil
                ? `Kehamilan Anda sedang dipantau kader. Tetap jaga kesehatan dan rutin ANC.`
                : `Pantau tumbuh kembang si kecil dan dapatkan edukasi posyandu terpercaya.`}
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0 flex-wrap">
            <Link href="/data-anak" className="px-4 py-2.5 rounded-xl bg-[#EA2986] text-white text-xs font-bold hover:bg-[#D41F75] transition shadow-md shadow-[#EA2986]/20">
              Kesehatan Anak →
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#EA2986]/25 shadow-sm p-5">
          <div className="w-11 h-11 rounded-xl bg-[#EA2986]/10 text-[#EA2986] flex items-center justify-center text-xl mb-3">{isHamil?"🤰":"👩"}</div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
          <p className="text-lg font-black text-gray-900 mt-0.5">{isHamil?"Hamil":"Ibu Balita"}</p>
          <p className="text-xs text-gray-500 mt-1">Kondisi: {motherDetail.status}</p>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3">👶</div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Anak Terdaftar</p>
          <p className="text-3xl font-black text-gray-900 mt-0.5">{motherDetail.children.length}</p>
          <p className="text-xs text-gray-500 mt-1">{mainChild ? `Terakhir: ${mainChild.current_weight} kg` : "Belum terdaftar"}</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3">📅</div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{isHamil?"Estimasi HPL":"Posyandu Terdekat"}</p>
          <p className="text-base font-black text-gray-900 mt-0.5 leading-tight">{isHamil ? fmtDate(motherDetail.estimated_due_date ?? null) : (nextSchedule?.date ?? "Bulan Ini")}</p>
          {isHamil && daysUntilHpl !== null && ( <p className="text-xs text-amber-600 font-bold mt-1">{daysUntilHpl} hari lagi</p> )}
        </div>

        <div className={`bg-white rounded-2xl border shadow-sm p-5 ${hasTtdToday?"border-emerald-200":"border-[#EA2986]/25"}`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 ${hasTtdToday?"bg-emerald-50 text-emerald-600":"bg-[#EA2986]/10 text-[#EA2986]"}`}>
            {hasTtdToday?"✅":"💊"}
          </div>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">TTD Hari Ini</p>
          <p className="text-base font-black text-gray-900 mt-0.5">{hasTtdToday?"Sudah Diminum":"Belum Diminum"}</p>
          <p className="text-xs text-gray-400 mt-1">{ttdMonthCount}/{TTD_TARGET} tablet</p>
        </div>
      </div>

      {/* Asymmetric Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 */}
        <div className="xl:col-span-8 space-y-6">
          {/* Quick Access Apps */}
          <div className="bg-gradient-to-br from-pink-100/40 via-purple-50/20 to-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-[#EA2986] uppercase tracking-widest">Akses Cepat</span>
              <h3 className="text-base font-extrabold text-gray-900 mt-0.5">Menu Kurikulum Kesehatan Mandiri</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 pt-2">
              {appsShortcut.map((app, index) => (
                <Link key={index} href={app.href} className="flex flex-col items-center text-center group">
                  <div className={`w-14 h-14 rounded-2xl ${app.bg} text-white flex items-center justify-center text-2xl shadow-md hover:scale-105 transition-transform duration-200 select-none`}>
                    {app.emoji}
                  </div>
                  <span className="text-xs font-bold text-gray-800 mt-2 group-hover:text-[#EA2986] transition-colors leading-tight max-w-[120px]">{app.label}</span>
                  <span className="text-[9px] text-gray-400 font-medium mt-0.5 max-w-[110px] truncate">{app.sub}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Tumbuh Kembang Anak */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EA2986]/10 flex items-center justify-center text-base">👶</div>
                <h2 className="font-extrabold text-gray-900 text-base">Tumbuh Kembang Anak</h2>
              </div>
              <Link href="/data-anak" className="text-xs font-bold text-[#EA2986] hover:underline flex items-center gap-1">Lihat Detail →</Link>
            </div>
            {motherDetail.children.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-bold text-gray-400">Belum ada anak terdaftar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motherDetail.children.map((c) => <ChildGrowthCard key={c.child_id} child={c}/>)}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 */}
        <div className="xl:col-span-4 space-y-5">
          {/* TTD Widget */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasTtdToday ? "bg-emerald-100 text-emerald-600" : "bg-[#EA2986]/10 text-[#EA2986]"}`}>💊</div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Checklist Harian</span>
                <h4 className="font-extrabold text-sm text-gray-900 mt-0.5">Pemantauan TTD</h4>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <TtdRing taken={ttdMonthCount} total={TTD_TARGET}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-gray-900 leading-none">{ttdMonthCount}</span>
                  <span className="text-[9px] text-gray-400 font-bold">/{TTD_TARGET}</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-gray-900">{Math.round((ttdMonthCount/TTD_TARGET)*100)}% bulan ini</p>
              </div>
            </div>
            <button type="button" onClick={toggleTtd} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${hasTtdToday ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-[#EA2986] text-white"}`}>
              {hasTtdToday ? "✓ Sudah Minum Hari Ini" : "Tandai Sudah Minum Hari Ini"}
            </button>
          </div>

          {/* Jadwal Terdekat */}
          {nextSchedule && (
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Agenda Terdekat</span>
              <h4 className="font-black text-xl text-gray-900 mt-2">{nextSchedule.date}</h4>
              <Link href="/jadwal" className="mt-3 block text-center py-2 rounded-xl bg-indigo-100 text-indigo-600 text-xs font-bold">Lihat Detail Jadwal →</Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── 🆕 SECTION BARU: LANJUTKAN MEMBACA & REKOMENDASI ARTIKEL PINTAR ─── */}
      <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        {/* Header Section dengan Judul Kiri & Tombol Arah Kanan Atas */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Lanjutkan Membaca</h2>
            <p className="text-xs text-gray-400 mt-0.5">Histori artikel terakhir yang sesuai dengan rekomendasi kondisi Anda saat ini.</p>
          </div>
          
          {/* Tombol Arah Navigasi Bulat Pojok Kanan Atas */}
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              ‹
            </button>
            <Link href="/edukasi" className="w-8 h-8 rounded-full bg-[#EA2986] text-white flex items-center justify-center font-bold shadow-md shadow-[#EA2986]/20 hover:bg-[#D41F75] transition-colors" title="Buka Halaman Edukasi">
              ›
            </Link>
          </div>
        </div>

        {/* Grid Card Edukasi Horizontal (Bento-Grid / Card Layout Modern) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {recommendedArticles.map((article) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-2xl flex flex-col justify-between overflow-hidden group hover:shadow-md hover:border-[#EA2986]/30 transition-all duration-300">
              {/* Bagian Atas: Gambar/Placeholder & Title Text Wrapper */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Badge Kondisi Dinamis */}
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${article.tagColor}`}>
                      {article.tag}
                    </span>
                    {/* Icon Bookmark */}
                    <button className="text-gray-400 hover:text-[#EA2986] transition-colors">
                      <MdBookmarkBorder className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Judul Utama Artikel */}
                  <Link href="/edukasi">
                    <h3 className="text-xs font-extrabold text-gray-900 leading-snug group-hover:text-[#EA2986] transition-colors line-clamp-3">
                      {article.fullTitle}
                    </h3>
                  </Link>
                </div>
              </div>

              {/* Bagian Bawah: Meta info footer */}
              <div className="border-t border-gray-50 px-4 py-3 bg-gray-50/50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                  <MdMenuBook className="w-3.5 h-3.5 text-gray-400" />
                  <span>Buku KIA • {article.readTime}</span>
                </div>
                <button className="hover:text-gray-600 transition-colors">
                  <MdShare className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}