"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDashboardStats, getRecentChildActivity, getRecentMotherActivity } from "@/app/actions/dashboard";
import { getSchedules } from "@/app/actions/schedule";
import { StatusType } from "@/components/StatusBadge";
import ActivityTableCard from "@/components/ActivityTableCard";

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
    pink:  { bg:"bg-[#EA2986]/10", text:"text-[#EA2986]", border:"border-[#EA2986]/25" },
    amber: { bg:"bg-amber-50",     text:"text-amber-600",  border:"border-amber-200" },
    green: { bg:"bg-emerald-50",   text:"text-emerald-600",border:"border-emerald-200" },
    blue:  { bg:"bg-blue-50",      text:"text-blue-600",   border:"border-blue-200" },
  }[color];

  return (
    <Link href={href}
      className={`bg-white rounded-2xl border ${urgent?"border-red-300 shadow-red-100":p.border} shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all group relative overflow-hidden`}>
      {urgent && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-pulse"/>}
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.bg} ${p.text}`}>{icon}</div>
      </div>
      <div>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-black mt-0.5 ${urgent&&Number(value)>0?"text-red-500":"text-gray-900"}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-1">{sub}</p>
      </div>
      {detail && <p className={`text-[11px] font-bold px-2 py-1 rounded-lg w-fit ${p.bg} ${p.text}`}>{detail}</p>}
    </Link>
  );
}

// ─── Quick Action ─────────────────────────────────────────
function QuickAction({ icon, label, sub, href, color }: {
  icon: string; label: string; sub: string; href: string; color: string;
}) {
  return (
    <Link href={href}
      className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:border-[#EA2986]/30 hover:shadow-sm transition-all group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-gray-900 group-hover:text-[#EA2986] transition-colors truncate">{label}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
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
  const emoji = { gizi:"🌿", imunisasi:"💉", bb:"📉", timbang:"⚖️" }[child.issueType];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">{emoji}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{child.name}</p>
        <p className="text-xs text-gray-400 truncate">{child.age} · Ibu: {child.motherName} · {child.rt}</p>
      </div>
      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>
      <Link href="/data-anak" className="shrink-0 text-xs font-bold text-[#EA2986] hover:underline">Input →</Link>
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

  // Urgent children — replace with real action data
  const urgentChildren: UrgentChild[] = [
    { name:"Sari Putri",   age:"18 bln", issue:"Risiko Stunting", issueType:"gizi",      rt:"RT 03", motherName:"Dewi Rahayu" },
    { name:"Bima Saputra", age:"31 bln", issue:"Perlu Campak",    issueType:"imunisasi", rt:"RT 03", motherName:"Siti Rahayu" },
    { name:"Nadia Putri",  age:"9 bln",  issue:"Belum Timbang",   issueType:"timbang",   rt:"RT 04", motherName:"Rina Susanti" },
    { name:"Rina Dewi",    age:"30 bln", issue:"BB Tidak Naik",   issueType:"bb",        rt:"RT 04", motherName:"Lilis Suryani" },
  ];

  const loadData = useCallback(async () => {
    // Load cache first (0ms perceived load)
    const cs = localStorage.getItem("kader_stats_v2");
    const cc = localStorage.getItem("kader_child_v2");
    const cm = localStorage.getItem("kader_mother_v2");
    const cs2 = localStorage.getItem("kader_sched_v2");
    if (cs) { setStats(JSON.parse(cs)); setIsLoading(false); }
    if (cc) setChildActivity(JSON.parse(cc));
    if (cm) setMotherActivity(JSON.parse(cm));
    if (cs2) setNextSchedule(JSON.parse(cs2));

    setIsOnline(navigator.onLine);
    if (!navigator.onLine) { setIsLoading(false); return; }

    try {
      const [rawStats, cAct, mAct, schedules] = await Promise.all([
        getDashboardStats(), getRecentChildActivity(),
        getRecentMotherActivity(), getSchedules(),
      ]);
      if (rawStats && !rawStats.errorMsg) {
        setStats(rawStats);
        localStorage.setItem("kader_stats_v2", JSON.stringify(rawStats));
      }
      if (cAct?.length)  { setChildActivity(cAct);  localStorage.setItem("kader_child_v2",  JSON.stringify(cAct)); }
      if (mAct?.length)  { setMotherActivity(mAct); localStorage.setItem("kader_mother_v2", JSON.stringify(mAct)); }
      const todayDate = new Date(); todayDate.setHours(0,0,0,0);
      const ns = schedules?.find((s: any) => new Date(s.rawDate) >= todayDate) ?? null;
      setNextSchedule(ns);
      if (ns) localStorage.setItem("kader_sched_v2", JSON.stringify(ns));
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
    <div className="max-w-[1600px] mx-auto p-6 space-y-6 animate-pulse">
      <div className="h-32 bg-gray-100 rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-36 bg-gray-100 rounded-2xl"/>)}</div>
      <div className="grid grid-cols-12 gap-6"><div className="col-span-8 h-80 bg-gray-100 rounded-2xl"/><div className="col-span-4 h-80 bg-gray-100 rounded-2xl"/></div>
    </div>
  );

  const childRows = childActivity.map((c:any) => ({
    time:c.time, name:c.name, detail:c.detail, status:c.status as StatusType, avatar:c.gender==="M"?"👦":"👧",
  }));
  const motherRows = motherActivity.map((m:any) => ({
    time:m.time, name:m.name, detail:m.detail, status:m.status as StatusType, avatar:"🤰",
  }));
  const pct = (a:number, b:number) => b>0 ? Math.round((a/b)*100) : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">

      {/* Jumbotron */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#EA2986] opacity-[0.04] rounded-full pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
              Portal Kader · Posyandu Kenanga 1
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Selamat Datang, Kader Posyandu 👋
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              Hari ini <span className="font-bold text-gray-700">{todayStr}</span>. Berikut ringkasan kondisi yang perlu perhatian hari ini.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link href="/data-anak/tambah"
              className="px-4 py-2.5 rounded-xl bg-[#EA2986] text-white text-xs font-bold hover:bg-[#D41F75] transition shadow-md shadow-[#EA2986]/20 flex items-center gap-1.5">
              + Tambah Balita
            </Link>
            <Link href="/data-ibu/tambah"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center gap-1.5">
              + Ibu Hamil
            </Link>
            <Link href="/jadwal"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition">
              Lihat Jadwal
            </Link>
            <button onClick={loadData}
              className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 text-xs hover:bg-gray-50 transition"
              title="Refresh">↻</button>
          </div>
        </div>
      </div>

      {/* Jadwal Banner */}
      {nextSchedule && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-xl">📅</div>
            <div>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest">Jadwal Posyandu Terdekat</span>
              <h4 className="font-black text-sm text-gray-900 mt-0.5">{nextSchedule.date} · {nextSchedule.time}</h4>
              <p className="text-xs text-gray-500 mt-0.5">Fokus: <span className="font-bold text-gray-700">{nextSchedule.focus}</span></p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/jadwal" className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs hover:bg-indigo-100 transition">
              Detail Agenda →
            </Link>
            <Link href="/laporan" className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition">
              Siapkan Laporan
            </Link>
          </div>
        </div>
      )}

      {/* 4 Priority Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <PriorityCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>}
          label="Belum Ditimbang" value={stats?.belumDitimbang??18}
          sub={`dari ${stats?.totalChildren??124} balita bulan ini`}
          detail="Perlu kunjungan rumah" color="pink"
          href="/data-anak?filter=belum-timbang" urgent={(stats?.belumDitimbang??18)>10}
        />
        <PriorityCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>}
          label="Gizi Bermasalah" value={stats?.problematicNutrition??9}
          sub="Kurang · Buruk · Stunting"
          detail="Perlu intervensi segera" color="amber"
          href="/data-anak?filter=gizi" urgent={(stats?.problematicNutrition??9)>5}
        />
        <PriorityCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
          label="Imunisasi Tertunda" value={stats?.imunisasiTertunda??5}
          sub="Jadwal bulan ini belum selesai"
          detail="Deadline biologis" color="green"
          href="/data-anak?filter=imunisasi" urgent={(stats?.imunisasiTertunda??5)>0}
        />
        <PriorityCard
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>}
          label="BB Tidak Naik" value={stats?.bbTidakNaik??4}
          sub={`T: ${(stats?.bbTidakNaik??4)-1} · BGM: 1`}
          detail="Risiko stunting dini" color="blue"
          href="/data-anak?filter=bb-tidak-naik" urgent={(stats?.bbTidakNaik??4)>0}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* Left col 8 */}
        <div className="xl:col-span-8 space-y-6">

          {/* Urgent Children */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-sm">Balita Perlu Perhatian Segera</h2>
                  <p className="text-xs text-gray-400">{urgentChildren.length} anak memerlukan tindak lanjut</p>
                </div>
              </div>
              <Link href="/data-anak" className="text-xs font-bold text-[#EA2986] hover:underline">Lihat Semua →</Link>
            </div>
            <div className="px-5 divide-y divide-gray-50">
              {urgentChildren.map((c,i) => <AlertRow key={i} child={c}/>)}
            </div>
          </div>

          {/* Activity Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActivityTableCard
              title="Aktivitas Balita Terbaru" description="Pemeriksaan & penimbangan"
              columns={["Waktu","Nama Anak","Status"]}
              data={childRows.length>0?childRows:[{time:"-",name:"Belum ada data",detail:"-",status:"Normal" as StatusType,avatar:"👶"}]}
              viewAllHref="/data-anak"
            />
            <ActivityTableCard
              title="Aktivitas Ibu Terbaru" description="Pemeriksaan kehamilan & nifas"
              columns={["Waktu","Nama Ibu","Status"]}
              data={motherRows.length>0?motherRows:[{time:"-",name:"Belum ada data",detail:"-",status:"Sehat" as StatusType,avatar:"🤰"}]}
              viewAllHref="/data-ibu"
            />
          </div>

          {/* Ibu Hamil Risiko Tinggi */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-gray-900 text-sm">Ibu Hamil Risiko Tinggi</h2>
                <p className="text-xs text-gray-400">{stats?.riskMothers??3} ibu perlu pemantauan prioritas</p>
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
        <div className="xl:col-span-4 space-y-5">

          {/* Cakupan Progress */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-widest">Ringkasan</p>
              <h3 className="text-base font-black text-gray-900 mt-1">Cakupan Bulan Ini</h3>
            </div>
            <div className="space-y-4">
              {[
                {label:"Penimbangan (D/S)", done:(stats?.totalChildren??124)-(stats?.belumDitimbang??18), total:stats?.totalChildren??124, color:"bg-[#EA2986]"},
                {label:"Imunisasi Lengkap", done:(stats?.totalChildren??124)-(stats?.imunisasiTertunda??5), total:stats?.totalChildren??124, color:"bg-emerald-500"},
                {label:"Ibu ANC ≥ 4x",     done:(stats?.mothersHamil??18)-(stats?.riskMothers??3), total:stats?.mothersHamil??18, color:"bg-indigo-500"},
                {label:"Ibu Terima TTD",    done:Math.round((stats?.mothersHamil??18)*0.83), total:stats?.mothersHamil??18, color:"bg-amber-500"},
              ].map((r,i) => {
                const p2 = pct(r.done, r.total);
                return (
                  <div key={i} className="space-y-1.5">
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
            <div className="flex gap-2 pt-1">
              <Link href="/laporan" className="flex-1 text-center py-2.5 bg-[#EA2986]/10 text-[#EA2986] rounded-xl text-xs font-bold hover:bg-[#EA2986] hover:text-white transition-colors">Unduh Laporan</Link>
              <Link href="/data-anak" className="flex-1 text-center py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">Rekap Anak</Link>
            </div>
          </div>

          {/* Statistik Total */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Total Sasaran</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {label:"Total Balita",    value:stats?.totalChildren??124, icon:"👶", color:"text-[#EA2986] bg-[#EA2986]/10"},
                {label:"Total Ibu",       value:stats?.totalMothers??48,   icon:"🤰", color:"text-indigo-600 bg-indigo-50"},
                {label:"Ibu Hamil",       value:stats?.mothersHamil??18,   icon:"💊", color:"text-amber-600 bg-amber-50"},
                {label:"Kunjungan",       value:stats?.totalKunjungan??96, icon:"📋", color:"text-emerald-600 bg-emerald-50"},
              ].map((s,i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${s.color}`}>{s.icon}</div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">{s.label}</p>
                    <p className="text-lg font-black text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indikator */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] text-gray-400">
              Diperbarui: {lastRefresh.getHours().toString().padStart(2,"0")}:{lastRefresh.getMinutes().toString().padStart(2,"0")}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOnline?"bg-emerald-50 text-emerald-600":"bg-red-50 text-red-500"}`}>
              {isOnline?"● Online":"● Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider mb-3">⚡ Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            {icon:"⚖️",label:"Input Penimbangan",sub:"Timbang balita hari ini",href:"/data-anak",color:"bg-[#EA2986]/10 text-[#EA2986]"},
            {icon:"💉",label:"Catat Imunisasi",  sub:"Tandai imunisasi selesai",href:"/data-anak",color:"bg-emerald-50 text-emerald-600"},
            {icon:"🤰",label:"Input ANC",        sub:"Kunjungan ibu hamil",    href:"/data-ibu", color:"bg-indigo-50 text-indigo-600"},
            {icon:"📋",label:"Buat Laporan",     sub:"Rekap bulanan D/S",      href:"/laporan",  color:"bg-amber-50 text-amber-600"},
            {icon:"📅",label:"Atur Jadwal",      sub:"Kegiatan posyandu",      href:"/jadwal",   color:"bg-purple-50 text-purple-600"},
            {icon:"📚",label:"Edukasi Kesehatan",sub:"Materi untuk ibu",       href:"/edukasi",  color:"bg-teal-50 text-teal-600"},
          ].map((a,i) => <QuickAction key={i} {...a}/>)}
        </div>
      </div>
    </div>
  );
}