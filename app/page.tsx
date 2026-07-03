"use client";

import { useState, useEffect } from "react";
import { getDashboardStats, getRecentChildActivity, getRecentMotherActivity } from "@/app/actions/dashboard";
import ActivityTableCard from "@/components/ActivityTableCard";
import { StatusType } from "@/components/StatusBadge";
import { PiBabyFill } from "react-icons/pi";
import { MdPregnantWoman, MdChildFriendly, MdCalendarMonth, MdOutlineScale, MdSpeed, MdFavorite, MdHelpOutline, MdScale, MdHeight, MdMonitorWeight } from "react-icons/md";
import { FaBaby, FaNotesMedical, FaBookOpen } from "react-icons/fa";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { getLoggedInMotherData, getMotherDetail } from "@/app/actions/mothers";
import LandingPage from "@/components/LandingPage";
import { getSchedules } from "@/app/actions/schedule";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import { MdArrowForward } from "react-icons/md";

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-base-white rounded-xl border border-base-border/30 shadow-sm p-5 flex items-center gap-4 relative overflow-hidden">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-base-text-secondary font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-base-text-primary leading-tight">{value}</p>
        {sub && <p className="text-xs text-base-text-secondary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role, username, isLoggedIn, isInitialized } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);
  
  // Kader dashboard state
  const [kaderStats, setKaderStats] = useState<any>(null);
  const [childActivity, setChildActivity] = useState<any[]>([]);
  const [motherActivity, setMotherActivity] = useState<any[]>([]);

  // Mother dashboard state
  const [motherDetail, setMotherDetail] = useState<any>(null);
  const [nextSchedule, setNextSchedule] = useState<any>(null);

  // Load cached data immediately on mount/role change to ensure 0ms load speed
  useEffect(() => {
    if (!isLoggedIn) return;

    if (role === "ibu") {
      const cachedMother = localStorage.getItem("mother_dashboard_detail");
      const cachedSchedule = localStorage.getItem("dashboard_next_schedule");
      if (cachedMother) {
        setMotherDetail(JSON.parse(cachedMother));
        setIsLoading(false);
      }
      if (cachedSchedule) {
        setNextSchedule(JSON.parse(cachedSchedule));
      }
    } else {
      const cachedStats = localStorage.getItem("kader_dashboard_stats");
      const cachedChild = localStorage.getItem("kader_dashboard_child_activity");
      const cachedMotherAct = localStorage.getItem("kader_dashboard_mother_activity");
      const cachedSchedule = localStorage.getItem("dashboard_next_schedule");
      if (cachedStats && cachedChild && cachedMotherAct) {
        setKaderStats(JSON.parse(cachedStats));
        setChildActivity(JSON.parse(cachedChild));
        setMotherActivity(JSON.parse(cachedMotherAct));
        setIsLoading(false);
      }
      if (cachedSchedule) {
        setNextSchedule(JSON.parse(cachedSchedule));
      }
    }
  }, [role, isLoggedIn]);

  useEffect(() => {
    if (!isInitialized || !isLoggedIn) return;

    async function loadData() {
      const hasCache = role === "ibu" 
        ? !!localStorage.getItem("mother_dashboard_detail")
        : (!!localStorage.getItem("kader_dashboard_stats") && !!localStorage.getItem("kader_dashboard_child_activity"));
      
      if (!hasCache) {
        setIsLoading(true);
      }

      if (!navigator.onLine) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedSchedules = await getSchedules();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureSchedule = fetchedSchedules.find((s: any) => new Date(s.rawDate) >= today);
        const resolvedSchedule = futureSchedule || null;
        
        setNextSchedule(resolvedSchedule);
        if (resolvedSchedule) {
          localStorage.setItem("dashboard_next_schedule", JSON.stringify(resolvedSchedule));
        }

        if (role === "ibu") {
          const loggedInMother = await getLoggedInMotherData(username);
          if (loggedInMother) {
            const detail = await getMotherDetail(loggedInMother.mother_id);
            setMotherDetail(detail);
            localStorage.setItem("mother_dashboard_detail", JSON.stringify(detail));
          }
        } else {
          const [stats, cAct, mAct] = await Promise.all([
            getDashboardStats(),
            getRecentChildActivity(),
            getRecentMotherActivity(),
          ]);
          setKaderStats(stats);
          setChildActivity(cAct);
          setMotherActivity(mAct);

          localStorage.setItem("kader_dashboard_stats", JSON.stringify(stats));
          localStorage.setItem("kader_dashboard_child_activity", JSON.stringify(cAct));
          localStorage.setItem("kader_dashboard_mother_activity", JSON.stringify(mAct));
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [role, username, isInitialized, isLoggedIn]);

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LandingPage />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // --- MOTHER DASHBOARD VIEW ---
  if (role === "ibu" && motherDetail) {
    const mainChild = motherDetail.children[0] || null;

    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
        
        {/* Welcome Jumbotron Card */}
        <div className="bg-gradient-to-br from-brand-soft/70 via-brand-soft/30 to-base-white rounded-bento-lg p-6 md:p-8 border border-brand-primary/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary border border-brand-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Portal Orang Tua
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-base-text-primary tracking-tight mt-1">
              Selamat Datang, Ibu {motherDetail.name}!
            </h1>
            <p className="text-xs md:text-sm text-base-text-secondary max-w-2xl">
              Pantau secara mandiri rekam tumbuh kembang anak kandung Anda, riwayat pemeriksaan kehamilan, dan dapatkan edukasi posyandu terpercaya.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/data-anak" className="px-5 py-2.5 rounded-xl bg-brand-primary text-base-white text-xs font-bold hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10 cursor-pointer">
              Kesehatan Anak Saya
            </Link>
            <Link href="/data-ibu" className="px-5 py-2.5 rounded-xl bg-base-white border border-base-border/50 text-base-text-secondary text-xs font-bold hover:bg-base-bg transition cursor-pointer">
              Kesehatan Saya
            </Link>
          </div>
        </div>

        {/* PWA Installation Banner */}
        <PWAInstallBanner />

        {/* Next Schedule Banner */}
        {nextSchedule && (
          <div className="bg-base-white border border-brand-primary/20 rounded-bento-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <MdCalendarMonth className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Jadwal Posyandu Terdekat
                </span>
                <h4 className="font-extrabold text-sm text-base-text-primary mt-1.5">
                  {nextSchedule.date} • {nextSchedule.time}
                </h4>
                <p className="text-xs text-base-text-secondary">
                  Fokus Pelayanan: <span className="font-semibold text-base-text-primary">{nextSchedule.focus}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- MOTHER STAT CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={MdPregnantWoman}
            label="Status Kesehatan Ibu"
            value={motherDetail.pregnant_status === "Hamil" ? "Hamil" : "Ibu Balita"}
            sub={`Kondisi: ${motherDetail.status}`}
            color="bg-status-pink-light text-brand-primary"
          />
          <StatCard
            icon={PiBabyFill}
            label="Anak Terdaftar"
            value={`${motherDetail.children.length} Anak`}
            sub="terhubung dengan akun"
            color="bg-brand-soft text-brand-primary"
          />
          <StatCard
            icon={MdChildFriendly}
            label="Anak Pertama Saya"
            value={mainChild ? mainChild.name : "-"}
            sub={mainChild ? `Berat: ${mainChild.current_weight} kg` : "Belum terdaftar"}
            color="bg-status-blue-light text-status-blue-solid"
          />
          <StatCard
            icon={MdCalendarMonth}
            label={motherDetail.pregnant_status === "Hamil" ? "Estimasi HPL" : "Posyandu Terdekat"}
            value={motherDetail.pregnant_status === "Hamil" ? formatDate(motherDetail.estimated_due_date) : "Bulan Ini"}
            sub={motherDetail.pregnant_status === "Hamil" ? "Tanggal HPL perkiraan" : "Jadwal rutin posyandu"}
            color="bg-status-orange-light text-status-orange-solid"
          />
        </div>

        {/* --- MAIN BODY: Children Growth + Maternal Logs + Edukasi --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Area (Col span 8) */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Card: Ringkasan Tumbuh Kembang Anak */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <FaBaby className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-bold text-base-text-primary text-base">Tumbuh Kembang Anak Kandung</h2>
                </div>
                <Link href="/data-anak" className="text-xs font-bold text-brand-primary hover:underline">
                  Lihat Detail Grafik →
                </Link>
              </div>

              {motherDetail.children.length === 0 ? (
                <div className="p-8 text-center text-xs text-base-text-secondary italic">
                  Belum ada anak terdaftar yang terhubung ke akun Anda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {motherDetail.children.map((child: any) => (
                    <div key={child.child_id} className="bg-base-bg/30 p-4 border border-base-border/20 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-base-text-primary leading-tight">{child.name}</h4>
                        <div className="text-[11px] text-base-text-secondary font-semibold">
                          <span>{child.ageInMonths} Bulan &bull; </span>
                          <span>{child.gender === "M" ? "Laki-laki" : "Perempuan"}</span>
                        </div>
                        <div className="flex items-center gap-3.5 text-xs text-brand-primary font-extrabold pt-1">
                          <span>{child.current_weight || "-"} kg</span>
                          <span className="text-base-border/50">&bull;</span>
                          <span>{child.current_height || "-"} cm</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                          child.status === "Normal" 
                            ? "bg-status-green-light text-status-green-solid border-status-green-solid/25" 
                            : "bg-status-red-light text-status-red-solid border-status-red-solid/25 font-bold"
                        }`}>
                          Status: {child.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card: Riwayat Kehamilan & Nifas Ibu */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <FaNotesMedical className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-bold text-base-text-primary text-base">Riwayat Rekam Pemeriksaan Kehamilan</h2>
                </div>
                <Link href="/data-ibu" className="text-xs font-bold text-brand-primary hover:underline">
                  Lihat Detail Periksa →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                      <th className="py-2.5 px-3">Tanggal Kunjungan</th>
                      <th className="py-2.5 px-3 text-center">Tensi Darah</th>
                      <th className="py-2.5 px-3 text-center">Berat Badan</th>
                      <th className="py-2.5 px-3 text-center">Lingkar Lengan (LILA)</th>
                      <th className="py-2.5 px-3">Catatan Pemeriksaan</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {motherDetail.maternal_records.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-base-text-secondary italic">Belum ada riwayat pemeriksaan kehamilan.</td>
                      </tr>
                    ) : (
                      motherDetail.maternal_records.slice(0, 3).map((rec: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-base-text-primary">{rec.date}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-base-text-primary">{rec.blood_pressure || "-"}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-brand-primary">{rec.weight ? `${rec.weight} kg` : "-"}</td>
                          <td className="py-2.5 px-3 text-center font-semibold text-base-text-primary">{rec.muac ? `${rec.muac} cm` : "-"}</td>
                          <td className="py-2.5 px-3 text-base-text-secondary font-medium italic">{rec.cadre_notes || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Area (Col span 4) */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Card: Edukasi Khusus Untuk Ibu */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <FaBookOpen className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Edukasi Pilihan</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="p-3 border border-base-border/30 rounded-xl hover:border-brand-primary/30 transition hover:shadow-sm">
                  <span className="text-[9px] font-bold text-brand-primary uppercase">Nutrisi Ibu Hamil</span>
                  <h4 className="font-bold text-xs text-base-text-primary mt-0.5">Asupan Nutrisi Penting di Trimester Kedua</h4>
                  <p className="text-[10px] text-base-text-secondary mt-1">Panduan lengkap tentang makanan kaya asam folat dan zat besi.</p>
                  <Link href="/edukasi" className="text-[10px] font-bold text-brand-primary hover:underline mt-2 inline-block">Baca Artikel →</Link>
                </div>

                <div className="p-3 border border-base-border/30 rounded-xl hover:border-brand-primary/30 transition hover:shadow-sm">
                  <span className="text-[9px] font-bold text-status-blue-solid uppercase">Tumbuh Kembang</span>
                  <h4 className="font-bold text-xs text-base-text-primary mt-0.5">Imunisasi Dasar Lengkap Balita 0-24 Bulan</h4>
                  <p className="text-[10px] text-base-text-secondary mt-1">Ketahui daftar vaksin wajib dan jadwal pemberiannya.</p>
                  <Link href="/edukasi" className="text-[10px] font-bold text-brand-primary hover:underline mt-2 inline-block">Baca Artikel →</Link>
                </div>

                <div className="p-3 border border-base-border/30 rounded-xl hover:border-brand-primary/30 transition hover:shadow-sm">
                  <span className="text-[9px] font-bold text-status-green-solid uppercase">Kesehatan Balita</span>
                  <h4 className="font-bold text-xs text-base-text-primary mt-0.5">MPASI Pertama: Jadwal, Menu, dan Aturan</h4>
                  <p className="text-[10px] text-base-text-secondary mt-1">Tips memberikan makanan pendamping ASI yang padat gizi.</p>
                  <Link href="/edukasi" className="text-[10px] font-bold text-brand-primary hover:underline mt-2 inline-block">Baca Artikel →</Link>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // --- KADER DASHBOARD VIEW ---
  const childActivityForTable = childActivity.map((c: any) => ({
    time: c.time,
    name: c.name,
    detail: c.detail,
    status: c.status as StatusType,
    avatar: c.gender === "M" ? "👦" : "👧",
  }));

  const motherActivityForTable = motherActivity.map((m: any) => ({
    time: m.time,
    name: m.name,
    detail: m.detail,
    status: m.status as StatusType,
    avatar: "🤰",
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* PWA Installation Banner */}
      <PWAInstallBanner />

      {/* Next Schedule Banner */}
      {nextSchedule && (
        <div className="bg-base-white border border-brand-primary/20 rounded-bento-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <MdCalendarMonth className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold bg-brand-primary/10 text-brand-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Jadwal Posyandu Terdekat
              </span>
              <h4 className="font-extrabold text-sm text-base-text-primary mt-1.5">
                {nextSchedule.date} • {nextSchedule.time}
              </h4>
              <p className="text-xs text-base-text-secondary">
                Fokus Pelayanan: <span className="font-semibold text-base-text-primary">{nextSchedule.focus}</span>
              </p>
            </div>
          </div>
          
          <Link 
            href="/jadwal" 
            className="px-4 py-2 rounded-xl border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-base-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer text-center"
          >
            <span>Kelola Jadwal</span>
            <MdArrowForward className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* --- STAT CARDS 2x2 on sm, 4-col on lg --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={PiBabyFill}
          label="Total Balita"
          value={kaderStats?.totalChildren || 0}
          sub="anak terdaftar"
          color="bg-brand-soft text-brand-primary"
        />
        <StatCard
          icon={MdCalendarMonth}
          label="Kunjungan Bulan Ini"
          value={kaderStats?.totalKunjungan || 0}
          sub="pemeriksaan selesai"
          color="bg-status-blue-light text-status-blue-solid"
        />
        <StatCard
          icon={MdScale}
          label="Masalah Gizi"
          value={kaderStats?.problematicNutrition || 0}
          sub="balita butuh dipantau"
          color="bg-status-purple-light text-status-purple-solid"
        />
        <StatCard
          icon={MdPregnantWoman}
          label="Ibu Hamil Risiko"
          value={kaderStats?.riskMothers || 0}
          sub="status tinggi / KEK"
          color="bg-status-orange-light text-status-orange-solid"
        />
      </div>

      {/* --- MAIN BODY: Activity Tables + Quick Summary --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Activity Tables */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivityTableCard
            title="Aktivitas Anak"
            description="Pemeriksaan & Penimbangan Balita Terbaru"
            columns={["Tanggal & Waktu", "Nama Anak", "Status"]}
            data={childActivityForTable.length > 0 ? childActivityForTable : [
              { time: "-", name: "Belum ada data", detail: "-", status: "Normal" as StatusType, avatar: "👶" }
            ]}
            viewAllHref="/data-anak"
          />
          <ActivityTableCard
            title="Aktivitas Ibu"
            description="Pemeriksaan Kehamilan & Nifas Terbaru"
            columns={["Tanggal & Waktu", "Nama Ibu", "Status"]}
            data={motherActivityForTable.length > 0 ? motherActivityForTable : [
              { time: "-", name: "Belum ada data", detail: "-", status: "Sehat" as StatusType, avatar: "🤰" }
            ]}
            viewAllHref="/data-ibu"
          />
        </div>

        {/* Summary Panel */}
        <div className="xl:col-span-4 bg-base-white rounded-xl border border-base-border/30 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs text-base-text-secondary uppercase font-bold tracking-wide">Ringkasan</p>
            <h3 className="text-lg font-bold text-base-text-primary mt-0.5">Data Bulan Ini</h3>
          </div>

          <div className="space-y-4 flex-1">
            {/* Total Ibu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-text-secondary font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block" />
                  Total Ibu Terdaftar
                </span>
                <span className="font-bold text-base-text-primary">{kaderStats?.totalMothers || 0}</span>
              </div>
              <div className="w-full bg-base-bg rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Ibu Hamil */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-text-secondary font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-blue-solid inline-block" />
                  Ibu Hamil
                </span>
                <span className="font-bold text-base-text-primary">{kaderStats?.mothersHamil || 0}</span>
              </div>
              <div className="w-full bg-base-bg rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-status-blue-solid rounded-full"
                  style={{ width: (kaderStats?.totalMothers || 0) > 0 ? `${Math.round(((kaderStats?.mothersHamil || 0) / (kaderStats?.totalMothers || 1)) * 100)}%` : "0%" }}
                />
              </div>
            </div>

            {/* Total Balita */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-text-secondary font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-green-solid inline-block" />
                  Total Balita
                </span>
                <span className="font-bold text-base-text-primary">{kaderStats?.totalChildren || 0}</span>
              </div>
              <div className="w-full bg-base-bg rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-status-green-solid rounded-full" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-base-border/20 flex gap-3">
            <Link href="/data-anak" className="flex-1 text-center py-2 bg-brand-soft text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-primary hover:text-base-white transition">
              Kesehatan Anak →
            </Link>
            <Link href="/data-ibu" className="flex-1 text-center py-2 bg-status-blue-light text-status-blue-solid rounded-lg text-xs font-bold hover:bg-status-blue-solid hover:text-base-white transition">
              Kesehatan Ibu →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}