"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDashboardStats, getRecentChildActivity, getRecentMotherActivity } from "@/app/actions/dashboard";
import { getSchedules } from "@/app/actions/schedule";
import { getCacheItem, setCacheItem } from "@/lib/db/dexieDb";
import { StatusType } from "@/components/StatusBadge";
import ActivityTableCard from "@/components/ActivityTableCard";
import { 
  MdCalendarMonth, MdPerson, MdArrowForward, MdInfoOutline, MdRefresh,
  MdScale, MdWarning, MdVaccines, MdTrendingDown, MdPregnantWoman, 
  MdAssignment, MdMenuBook, MdChildCare, MdFlashOn
} from "react-icons/md";
import { FaPills } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────
interface KaderStats {
  totalChildren: number;
  totalMothers: number;
  mothersHamil: number;
  problematicNutrition: number;
  riskMothers: number;
  totalKunjungan: number;
  belumDitimbang?: number;
  imunisasiTertunda?: number;
  bbTidakNaik?: number;
}

interface UrgentChild {
  name: string; age: string; issue: string;
  issueType: "gizi" | "imunisasi" | "bb" | "timbang";
  rt: string; motherName: string;
}

// ─── Helpers ──────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const today = new Date();
const todayStr = `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`;

// ─── Priority Card ────────────────────────────────────────
function PriorityCard({ icon, label, value, sub, detail, color, href, urgent }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub: string; detail?: string; color: "pink"|"amber"|"green"|"blue";
  href: string; urgent?: boolean;
}) {
  const p = {
    pink:  { bg:"bg-rose-50",     text:"text-[#EA2986]", border:"border-rose-200" },
    amber: { bg:"bg-amber-50",    text:"text-amber-600",  border:"border-amber-200" },
    green: { bg:"bg-emerald-50",  text:"text-emerald-600",border:"border-emerald-200" },
    blue:  { bg:"bg-blue-50",     text:"text-blue-600",   border:"border-blue-200" },
  }[color];

  return (
    <Link href={href}
      className={`bg-white rounded-2xl border ${urgent?"border-red-300 shadow-xs":p.border} shadow-2xs p-5 flex flex-col justify-between min-h-[145px] hover:shadow-md hover:border-[#EA2986]/30 transition-all duration-300 group relative overflow-hidden`}>
      {urgent && <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"/>}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.bg} ${p.text} text-xl border ${p.border}`}>{icon}</div>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-2xl md:text-3xl font-black mt-0.5 ${urgent&&Number(value)>0?"text-red-650":"text-gray-900"}`}>{value}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
        <span className="truncate">{sub}</span>
        {detail && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${p.bg} ${p.text} hidden sm:inline`}>{detail}</span>}
      </div>
    </Link>
  );
}

// ─── Quick Action ─────────────────────────────────────────
function QuickAction({ icon, label, sub, href, color }: {
  icon: React.ReactNode; label: string; sub: string; href: string; color: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center text-center group">
      <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${color} flex items-center justify-center text-xl md:text-2xl shadow-xs hover:scale-105 transition-transform duration-200 select-none`}>
        {icon}
      </div>
      <span className="text-[9px] md:text-[11px] font-black text-gray-800 mt-2 group-hover:text-[#EA2986] transition-colors leading-tight max-w-[70px] md:max-w-[120px] line-clamp-2">{label}</span>
      <span className="hidden sm:block text-[9px] text-gray-400 font-medium mt-0.5 max-w-[110px] truncate">{sub}</span>
    </Link>
  );
}

// ─── Alert Row ────────────────────────────────────────────
function AlertRow({ child }: { child: UrgentChild }) {
  const cfg = {
    gizi:     { label:"Gizi Bermasalah",   cls:"text-amber-700 bg-amber-50 border-amber-200" },
    imunisasi:{ label:"Imunisasi Tertunda",cls:"text-emerald-700 bg-emerald-50 border-emerald-200" },
    bb:       { label:"BB Tidak Naik",     cls:"text-blue-700 bg-blue-50 border-blue-200" },
    timbang:  { label:"Belum Ditimbang",   cls:"text-[#EA2986] bg-[#EA2986]/5 border-[#EA2986]/20" },
  }[child.issueType];

  const iconComp = {
    gizi: <MdWarning className="text-amber-600" />,
    imunisasi: <MdVaccines className="text-emerald-600" />,
    bb: <MdTrendingDown className="text-blue-600" />,
    timbang: <MdScale className="text-[#EA2986]" />
  }[child.issueType];

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/20 px-1 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base shrink-0 border border-gray-100">{iconComp}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{child.name}</p>
        <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{child.age} · Ibu: {child.motherName} · {child.rt}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>
        <Link href="/data-anak" className="text-xs font-bold text-[#EA2986] hover:underline whitespace-nowrap">Input →</Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function KaderDashboardPage() {
  const [isLoading, setIsLoading]           = useState(true);
  const [stats, setStats]                   = useState<KaderStats|null>(null);
  const [childActivity, setChildActivity]   = useState<any[]>([]);
  const [motherActivity, setMotherActivity] = useState<any[]>([]);
  const [nextSchedule, setNextSchedule]     = useState<any>(null);
  const [lastRefresh, setLastRefresh]       = useState(new Date());
  const [isOnline, setIsOnline]             = useState(true);

  const urgentChildren: UrgentChild[] = [
    { name:"Sari Putri",   age:"18 bln", issue:"Risiko Stunting", issueType:"gizi",      rt:"RT 03", motherName:"Dewi Rahayu" },
    { name:"Bima Saputra", age:"31 bln", issue:"Perlu Campak",    issueType:"imunisasi", rt:"RT 03", motherName:"Siti Rahayu" },
    { name:"Nadia Putri",  age:"9 bln",  issue:"Belum Timbang",   issueType:"timbang",   rt:"RT 04", motherName:"Rina Susanti" },
    { name:"Rina Dewi",    age:"30 bln", issue:"BB Tidak Naik",   issueType:"bb",        rt:"RT 04", motherName:"Lilis Suryani" },
  ];

  const loadData = useCallback(async () => {
    const [cs, cc, cm, cs2] = await Promise.all([
      getCacheItem("kader_stats_v2"),
      getCacheItem("kader_child_v2"),
      getCacheItem("kader_mother_v2"),
      getCacheItem("kader_sched_v2")
    ]);
    if (cs) { setStats(cs); setIsLoading(false); }
    if (cc) setChildActivity(cc);
    if (cm) setMotherActivity(cm);
    if (cs2) setNextSchedule(cs2);

    setIsOnline(navigator.onLine);
    if (!navigator.onLine) { setIsLoading(false); return; }

    try {
      const [rawStats, cAct, mAct, schedules] = await Promise.all([
        getDashboardStats(), getRecentChildActivity(),
        getRecentMotherActivity(), getSchedules(),
      ]);
      if (rawStats && !rawStats.errorMsg) {
        setStats(rawStats);
        await setCacheItem("kader_stats_v2", rawStats);
      }
      if (cAct?.length)  { setChildActivity(cAct);  await setCacheItem("kader_child_v2",  cAct); }
      if (mAct?.length)  { setMotherActivity(mAct); await setCacheItem("kader_mother_v2", mAct); }
      const todayDate = new Date(); todayDate.setHours(0,0,0,0);
      const ns = schedules?.find((s: any) => new Date(s.rawDate) >= todayDate) ?? null;
      setNextSchedule(ns);
      if (ns) await setCacheItem("kader_sched_v2", ns);
      setLastRefresh(new Date());
    } catch(e) { console.error(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const handleSync = () => loadData();
    window.addEventListener("sync-data", handleSync);
    return () => window.removeEventListener("sync-data", handleSync);
  }, [loadData]);

  if (isLoading) return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-pulse bg-[#FAFAFA] min-h-screen">
      <div className="h-32 bg-gray-100 rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-36 bg-gray-100 rounded-2xl"/>)}</div>
      <div className="grid grid-cols-12 gap-6"><div className="col-span-8 h-80 bg-gray-100 rounded-2xl"/><div className="col-span-4 h-80 bg-gray-100 rounded-2xl"/></div>
    </div>
  );

  const childRows = childActivity.map((c:any) => ({
    time:c.time, name:c.name, detail:c.detail, status:c.status as StatusType, avatar: <MdChildCare className="text-gray-400" />,
  }));
  const motherRows = motherActivity.map((m:any) => ({
    time:m.time, name:m.name, detail:m.detail, status:m.status as StatusType, avatar: <MdPregnantWoman className="text-gray-400" />,
  }));
  const pct = (a:number, b:number) => b>0 ? Math.round((a/b)*100) : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-20 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">

      {/* ─── HEADER BANNER KADER (CLEAN DESIGN STYLE) ─── */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EA2986]/[0.05] rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-2xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-rose-50 text-[#EA2986] border border-rose-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <MdAssignment className="text-xs" /> Portal Layanan Kader Posyandu
              </span>
              <span className="bg-[#E5E6F2] text-[#3E57A3] border border-[#3E57A3]/25 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Posyandu Kenanga 1
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Selamat Datang, Rekan Kader 👋
              </h1>
              <p className="text-xs md:text-sm text-gray-600 font-medium mt-1 leading-relaxed max-w-2xl">
                Pantau sasaran balita dan ibu hamil di wilayah Anda. Pastikan cakupan penimbangan, imunisasi dasar, dan pencatatan KMS terupdate secara realtime.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-3 shrink-0">
            <div className="flex gap-2 shrink-0">
              <Link href="/data-anak/tambah"
                className="bg-[#EA2986] hover:bg-[#d41f76] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-[#EA2986]/20 transition flex items-center justify-center gap-1.5">
                + Tambah Balita
              </Link>
              <Link href="/data-ibu/tambah"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition flex items-center justify-center gap-1.5">
                + Ibu Hamil
              </Link>
              <button onClick={loadData}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 p-2.5 rounded-xl transition flex items-center justify-center"
                title="Refresh Data">
                <MdRefresh className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── JADWAL BANNER (AGENDA TERDEKAT DETAILED WIDGET) ─── */}
      {nextSchedule && (
        <div className="bg-white border border-indigo-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#E5E6F2] text-[#3E57A3] border border-[#3E57A3]/25 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Jadwal Posyandu Terdekat
              </span>
              <span className="text-xs text-indigo-500 font-bold flex items-center gap-1">
                <MdCalendarMonth /> Posyandu
              </span>
            </div>
            <h4 className="font-black text-xl md:text-2xl text-gray-900 mt-1">{nextSchedule.date} · {nextSchedule.time}</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Fokus: <span className="font-bold text-gray-700">{nextSchedule.focus}</span>. Kegiatan rutin penimbangan balita, imunisasi bulanan, pemantauan status gizi, dan layanan pemeriksaan ibu hamil.
            </p>
          </div>
          <div className="flex sm:flex-row md:flex-col gap-2 shrink-0 justify-end md:justify-center items-stretch sm:items-center md:items-end">
            <Link href="/jadwal" className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3E57A3] font-bold text-xs transition text-center">
              Detail Agenda →
            </Link>
          </div>
        </div>
      )}

      {/* ─── 4 PRIORITY CARDS (CLEAN CARD STYLES) ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 -mx-2 px-2 md:mx-0 md:px-0">
        <PriorityCard
          icon={<MdScale />}
          label="Belum Ditimbang" value={stats?.belumDitimbang??18}
          sub={`dari ${stats?.totalChildren??124} balita bulan ini`}
          detail="Kunjungan rumah" color="pink"
          href="/data-anak?filter=belum-timbang" urgent={(stats?.belumDitimbang??18)>10}
        />
        <PriorityCard
          icon={<MdWarning />}
          label="Gizi Bermasalah" value={stats?.problematicNutrition??9}
          sub="Kurang · Buruk · Stunting"
          detail="Intervensi segera" color="amber"
          href="/data-anak?filter=gizi" urgent={(stats?.problematicNutrition??9)>5}
        />
        <PriorityCard
          icon={<MdVaccines />}
          label="Imunisasi Tertunda" value={stats?.imunisasiTertunda??5}
          sub="Jadwal belum diselesaikan"
          detail="Target imunisasi" color="green"
          href="/data-anak?filter=imunisasi" urgent={(stats?.imunisasiTertunda??5)>0}
        />
        <PriorityCard
          icon={<MdTrendingDown />}
          label="BB Tidak Naik" value={stats?.bbTidakNaik??4}
          sub={`T: ${(stats?.bbTidakNaik??4)-1} · BGM: 1`}
          detail="Risiko stunting" color="blue"
          href="/data-anak?filter=bb-tidak-naik" urgent={(stats?.bbTidakNaik??4)>0}
        />
      </div>

      {/* ─── QUICK ACTIONS (AKSES CEPAT BOTTOM PANEL) ─── */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <MdFlashOn className="text-[#EA2986] text-lg" /> Akses Cepat &amp; Tugas Mandiri
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Pintasan cepat tugas kader posyandu harian.</p>
          </div>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-y-5 gap-x-2 pt-2 items-center">
          {[
            {icon:<MdScale />,label:"Input Penimbangan",sub:"Timbang balita",href:"/data-anak",color:"bg-rose-50 border border-rose-200/60 text-[#EA2986]"},
            {icon:<MdVaccines />,label:"Catat Imunisasi",sub:"Imunisasi selesai",href:"/data-anak",color:"bg-emerald-50 border border-emerald-200/60 text-emerald-600"},
            {icon:<MdPregnantWoman />,label:"Input ANC",sub:"Ibu hamil",href:"/data-ibu",color:"bg-indigo-50 border border-indigo-200/60 text-indigo-600"},
            {icon:<MdAssignment />,label:"Buat Laporan",sub:"Rekap D/S",href:"/laporan",color:"bg-amber-50 border border-amber-200/60 text-amber-600"},
            {icon:<MdCalendarMonth />,label:"Atur Jadwal",sub:"Posyandu",href:"/jadwal",color:"bg-purple-50 border border-purple-200/60 text-purple-600"},
            {icon:<MdMenuBook />,label:"Edukasi Kesehatan",sub:"Materi ibu",href:"/edukasi",color:"bg-teal-50 border border-teal-200/60 text-teal-600"},
          ].map((a,i) => <QuickAction key={i} {...a}/>)}
        </div>
      </div>

      {/* ─── ASYMMETRIC GRID (MAIN LAYOUT PANELS) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* Left col 8 */}
        <div className="xl:col-span-8 space-y-6">

          {/* Urgent Children */}
          <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200/80 shadow-sm overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg shrink-0">
                  <MdWarning className="text-red-500" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-sm md:text-base">Balita Perlu Perhatian Segera</h2>
                  <p className="text-[10px] text-gray-400 font-medium">{urgentChildren.length} anak memerlukan tindak lanjut khusus.</p>
                </div>
              </div>
              <Link href="/data-anak" className="text-xs font-bold text-[#EA2986] hover:underline">Lihat Semua →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {urgentChildren.map((c,i) => <AlertRow key={i} child={c}/>)}
            </div>
          </div>

          {/* Ibu Hamil Risiko Tinggi */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <MdPregnantWoman className="text-[#EA2986] text-xl" />
                <div>
                  <h2 className="font-extrabold text-gray-900 text-sm md:text-base">Ibu Hamil Risiko Tinggi</h2>
                  <p className="text-[10px] text-gray-400 font-medium">{stats?.riskMothers??3} ibu tergolong risiko prioritas.</p>
                </div>
              </div>
              <Link href="/data-ibu" className="text-xs font-bold text-[#EA2986] hover:underline">Lihat Semua →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[580px]">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Nama Ibu</th><th className="py-3 px-4 text-center">Usia Keh.</th>
                    <th className="py-3 px-4 text-center">HPL</th><th className="py-3 px-4 text-center">TD</th>
                    <th className="py-3 px-4 text-center">Risiko</th><th className="py-3 px-4 text-center">ANC</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-50">
                  {[
                    {nama:"Siti Rahayu",  usia:"28 mgg",hpl:"22 Ags",td:"140/90",risiko:"Tinggi",anc:"7/8"},
                    {nama:"Dewi Lestari", usia:"32 mgg",hpl:"1 Sep",  td:"118/76",risiko:"Sedang",anc:"6/8"},
                    {nama:"Fitri Dewi",   usia:"36 mgg",hpl:"10 Sep", td:"122/80",risiko:"Sedang",anc:"7/8"},
                  ].map((ibu,i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 font-bold text-gray-900">{ibu.nama}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{ibu.usia}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{ibu.hpl}</td>
                      <td className={`py-3 px-4 text-center font-bold ${ibu.td>"130"?"text-red-500":"text-gray-700"}`}>{ibu.td}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${ibu.risiko==="Tinggi"?"bg-red-50 text-red-600 border border-red-200":"bg-amber-50 text-amber-600 border border-amber-200"}`}>{ibu.risiko}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700">{ibu.anc}</td>
                      <td className="py-3 px-4"><Link href="/data-ibu" className="text-xs font-bold text-[#EA2986] hover:underline">Input ANC →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right col 4 */}
        <div className="xl:col-span-4 space-y-6">

          {/* Cakupan Progress */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-5 md:p-6 space-y-5">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">Ringkasan Pencapaian</p>
              <h3 className="text-base font-black text-gray-900 mt-1">Cakupan Posyandu Bulan Ini</h3>
            </div>
            <div className="space-y-4.5">
              {[
                {label:"Penimbangan (D/S)", done:(stats?.totalChildren??124)-(stats?.belumDitimbang??18), total:stats?.totalChildren??124, color:"bg-[#EA2986]"},
                {label:"Imunisasi Lengkap", done:(stats?.totalChildren??124)-(stats?.imunisasiTertunda??5), total:stats?.totalChildren??124, color:"bg-emerald-500"},
                {label:"Ibu ANC ≥ 4x",     done:(stats?.mothersHamil??18)-(stats?.riskMothers??3), total:stats?.mothersHamil??18, color:"bg-indigo-500"},
                {label:"Ibu Terima TTD",    done:Math.round((stats?.mothersHamil??18)*0.83), total:stats?.mothersHamil??18, color:"bg-amber-500"},
              ].map((r,i) => {
                const p2 = pct(r.done, r.total);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-600">{r.label}</span>
                      <span className="font-black text-gray-900">{r.done}/{r.total} <span className="font-normal text-gray-400">({p2}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.color}`} style={{width:`${p2}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2.5 pt-2 border-t border-gray-50">
              <Link href="/laporan" className="flex-1 text-center py-2.5 bg-[#EA2986]/10 text-[#EA2986] rounded-xl text-xs font-bold hover:bg-[#EA2986] hover:text-white transition-colors duration-200">Unduh Laporan</Link>
              <Link href="/data-anak" className="flex-1 text-center py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors duration-200">Rekap Anak</Link>
            </div>
          </div>

          {/* Statistik Total */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-5 md:p-6 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Total Sasaran Posyandu</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:"Total Balita",    value:stats?.totalChildren??124, icon:<MdChildCare />, color:"text-[#EA2986] bg-rose-50 border border-rose-100"},
                {label:"Total Ibu",       value:stats?.totalMothers??48,   icon:<MdPerson />, color:"text-indigo-600 bg-indigo-50 border border-indigo-100"},
                {label:"Ibu Hamil",       value:stats?.mothersHamil??18,   icon:<FaPills />, color:"text-amber-600 bg-amber-50 border border-amber-100"},
                {label:"Kunjungan",       value:stats?.totalKunjungan??96, icon:<MdAssignment />, color:"text-emerald-600 bg-emerald-50 border border-emerald-100"},
              ].map((s,i) => (
                <div key={i} className="bg-gray-50 border border-gray-200/40 rounded-xl p-3 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${s.color}`}>{s.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide truncate">{s.label}</p>
                    <p className="text-base font-black text-gray-900 mt-0.5">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indikator */}
          <div className="flex items-center justify-between px-2 text-[10px] text-gray-400 font-medium">
            <p>
              Sinkronisasi: {lastRefresh.getHours().toString().padStart(2,"0")}:{lastRefresh.getMinutes().toString().padStart(2,"0")}
            </p>
            <span className={`font-bold px-2 py-0.5 rounded-full ${isOnline?"bg-emerald-50 text-emerald-600":"bg-red-50 text-red-500"}`}>
              {isOnline?"● Online":"● Offline"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}