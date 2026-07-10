"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdMonitorWeight, MdOutlineError, MdVaccines, MdTrendingDown,
  MdMale, MdFemale, MdPerson, MdCalendarMonth, MdCake, MdFingerprint,
  MdScale, MdHeight, MdOutlineMonitorWeight as MdOutlineWeight,
  MdPhone, MdArrowBack, MdBloodtype
} from "react-icons/md";
import { FiArrowUp, FiArrowDown, FiMinus, FiRefreshCw } from "react-icons/fi";
import { FaBaby, FaNotesMedical } from "react-icons/fa";
import { getChildDetail } from "@/app/actions/children";
import { getLoggedInMotherData } from "@/app/actions/mothers";
import { useUserRole } from "@/context/UserRoleContext";

function StatusBadge({ status }: { status: string }) {
  if (status === "Normal") {
    return (
      <span className="px-3 py-1 bg-status-green-light text-status-green-solid border border-status-green-solid/25 text-xs font-semibold rounded-full">
        Normal
      </span>
    );
  }
  if (status === "Gizi Kurang" || status === "Risiko Stunting") {
    return (
      <span className="px-3 py-1 bg-status-yellow-light text-status-yellow-solid border border-status-yellow-solid/25 text-xs font-semibold rounded-full">
        {status}
      </span>
    );
  }
  if (status === "Gizi Buruk" || status === "Pendek / Stunting" || status.includes("Stunting")) {
    return (
      <span className="px-3 py-1 bg-status-red-light text-status-red-solid border border-status-red-solid/25 text-xs font-semibold rounded-full">
        {status}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-base-bg text-base-text-secondary border border-base-border/50 text-xs font-semibold rounded-full">
      {status}
    </span>
  );
}

export default function PerjalananAnakPage() {
  const { role, username, isLoggedIn } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams?.get("section") || "";
  const [motherChildren, setMotherChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedChildDetail, setSelectedChildDetail] = useState<any>(null);
  const [isLoadingChildDetail, setIsLoadingChildDetail] = useState(true);
  const [milestones69, setMilestones69] = useState<any[]>([
    { id: 1, text: "Apakah bayi bisa duduk secara mandiri?", status: null },
    { id: 2, text: "Apakah bayi belajar berdiri, kedua kakinya menyangga sebagian besar badan?", status: null },
    { id: 3, text: "Apakah bayi bisa merangkak meraih mainan atau mendekati seseorang?", status: null },
    { id: 4, text: "Apakah bayi bisa memindahkan benda dari satu tangan ke tangan lainnya?", status: null },
    { id: 5, text: "Apakah bayi bisa memungut 2 benda, kedua tangan memegang 2 benda pada saat bersamaan?", status: null },
    { id: 6, text: "Apakah bayi bisa memungut benda sebesar kacang dengan cara meraup?", status: null },
    { id: 7, text: "Apakah bayi bersuara tanpa arti: mamama, bababa, dadada, tatata?", status: null },
    { id: 8, text: "Apakah bayi mencari mainan/benda yang dijatuhkan?", status: null },
    { id: 9, text: "Apakah bayi bermain tepuk tangan / Cilukba?", status: null },
    { id: 10, text: "Apakah bayi bergembira dengan melempar benda?", status: null },
  ]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (role && role !== "ibu") {
      router.replace("/data-anak");
    }
  }, [role, isLoggedIn, router]);

  const handleMilestoneRadioChange = (id: number, value: boolean) => {
    setMilestones69(prev => prev.map(item => item.id === id ? { ...item, status: value } : item));
    if (selectedChildId) {
      localStorage.setItem(`milestone_69_${selectedChildId}_${id}`, value ? 'true' : 'false');
    }
  };

  // Load mother's children if role === "ibu"
  useEffect(() => {
    async function loadMotherChildren() {
      if (role !== "ibu") return;
      const cacheKey = `offline_mother_children_${username}`;
      const cached = localStorage.getItem(cacheKey);
      let parsedChildren: any[] = [];
      
      if (cached) {
        try {
          parsedChildren = JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached mother children:", e);
        }
      }

      if (parsedChildren.length === 0) {
        const dashboardCached = localStorage.getItem("mother_dashboard_detail");
        if (dashboardCached) {
          try {
            const parsed = JSON.parse(dashboardCached);
            if (parsed.children && parsed.children.length > 0) {
              parsedChildren = parsed.children.map((c: any) => ({
                child_id: c.child_id,
                child_name: c.name || c.child_name || "-",
                gender: c.gender,
                birth_date: c.birth_date,
              }));
            }
          } catch (e) {
            console.error("Failed to parse fallback dashboard details:", e);
          }
        }
      }

      if (parsedChildren.length > 0) {
        setMotherChildren(parsedChildren);
        if (!selectedChildId) {
          setSelectedChildId(parsedChildren[0].child_id);
        }
      }

      if (!navigator.onLine) {
        setIsLoadingChildDetail(false);
        return;
      }

      try {
        const loggedInMother = await getLoggedInMotherData(username);
        if (loggedInMother && loggedInMother.children.length > 0) {
          setMotherChildren(loggedInMother.children);
          localStorage.setItem(cacheKey, JSON.stringify(loggedInMother.children));
          if (!selectedChildId) {
            setSelectedChildId(loggedInMother.children[0].child_id);
          }
        } else {
          setIsLoadingChildDetail(false);
        }
      } catch (err) {
        console.error("Failed to load mother children:", err);
        setIsLoadingChildDetail(false);
      }
    }
    if (role === "ibu") {
      loadMotherChildren();
    }
  }, [role, username]);

  // Load child details when selectedChildId changes
  useEffect(() => {
    async function loadChildDetail() {
      if (!selectedChildId) return;
      const cacheKey = `offline_child_detail_${selectedChildId}`;
      const cached = localStorage.getItem(cacheKey);
      let foundDetail: any = null;

      if (cached) {
        try {
          foundDetail = JSON.parse(cached);
        } catch (e) {
          console.error("Failed to parse cached child detail:", e);
        }
      }

      if (!foundDetail) {
        const dashboardCached = localStorage.getItem("mother_dashboard_detail");
        if (dashboardCached) {
          try {
            const parsed = JSON.parse(dashboardCached);
            const match = parsed.children.find((c: any) => c.child_id === selectedChildId);
            if (match) {
              foundDetail = {
                child_id: match.child_id,
                national_id: match.national_id || "-",
                name: match.name || match.child_name,
                birth_order: match.birth_order || "-",
                birth_place: match.birth_place || "-",
                dob: match.dob || match.birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(match.birth_date || match.dob)) : "-",
                gender: match.gender,
                avatarUrl: match.avatarUrl || null,
                birth_weight: match.birth_weight || 0,
                birth_length: match.birth_length || 0,
                current_weight: match.current_weight || 0,
                current_height: match.current_height || 0,
                ageInMonths: parseInt(match.age) || 0,
                blood_type: match.blood_type || "-",
                special_conditions: [],
                special_conditions_notes: "",
                status: match.status || "Normal",
                mother_name: parsed.mother_name || parsed.name || "-",
                measurements: [],
                isOfflineFallback: true,
              };
            }
          } catch (e) {
            console.error("Failed to parse child fallback from dashboard cached details:", e);
          }
        }
      }

      if (foundDetail) {
        setSelectedChildDetail(foundDetail);
        setIsLoadingChildDetail(false);
      }

      // Load milestones status from localStorage
      const updatedMilestones = milestones69.map(m => {
        const saved = localStorage.getItem(`milestone_69_${selectedChildId}_${m.id}`);
        return {
          ...m,
          status: saved === 'true' ? true : saved === 'false' ? false : null
        };
      });
      setMilestones69(updatedMilestones);

      if (!navigator.onLine) {
        return;
      }

      try {
        setIsLoadingChildDetail(true);
        const detail = await getChildDetail(selectedChildId);
        if (detail) {
          setSelectedChildDetail(detail);
          localStorage.setItem(cacheKey, JSON.stringify(detail));
        }
      } catch (err) {
        console.error("Failed to load child detail:", err);
      } finally {
        setIsLoadingChildDetail(false);
      }
    }
    loadChildDetail();
  }, [selectedChildId]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-status-green-light text-status-green-solid border border-status-green-solid/25";
      case "Gizi Kurang":
        return "bg-status-yellow-light text-status-yellow-solid border border-status-yellow-solid/25";
      case "Gizi Buruk":
      case "Pendek / Stunting":
        return "bg-status-red-light text-status-red-solid border border-status-red-solid/25 font-bold";
      default:
        return "bg-base-bg text-base-text-secondary border border-base-border/50";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "AN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoadingChildDetail) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 pb-10 animate-pulse">
        <div className="flex items-center gap-4 border-b border-base-border/20 pb-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-base-white p-5 rounded-[20px] border border-base-border/30 h-24 flex flex-col justify-between">
              <div className="h-4 w-12 bg-gray-100 rounded"></div>
              <div className="h-6 w-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#F4F5F7] p-4 rounded-[24px] h-52"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedChildDetail) {
    return (
      <div className="bg-base-white p-8 rounded-xl shadow-sm border border-base-border/30 text-center m-8">
        <p className="text-base-text-secondary font-bold">Data Kesehatan Anak tidak ditemukan.</p>
      </div>
    );
  }

  const child = selectedChildDetail;
  const zScoreBB = child.zScoreBB;
  const zScoreTB = child.zScoreTB;
  const nutritionStatus = child.status;

  const chronologicalMeasurements = [...(child.measurements || [])].reverse();
  const hasHistory = chronologicalMeasurements.length > 1;

  let weightPoints = "";
  let heightPoints = "";
  if (hasHistory) {
    const maxWeight = Math.max(...chronologicalMeasurements.map((m: any) => m.weight), 15);
    const minWeight = Math.min(...chronologicalMeasurements.map((m: any) => m.weight), 3);
    const maxHeight = Math.max(...chronologicalMeasurements.map((m: any) => m.height), 110);
    const minHeight = Math.min(...chronologicalMeasurements.map((m: any) => m.height), 40);

    const wDiff = maxWeight - minWeight || 1;
    const hDiff = maxHeight - minHeight || 1;

    weightPoints = chronologicalMeasurements.map((m: any, i: number) => {
      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
      const y = 140 - ((m.weight - minWeight) / wDiff) * 100;
      return `${x},${y}`;
    }).join(" ");

    heightPoints = chronologicalMeasurements.map((m: any, i: number) => {
      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
      const y = 140 - ((m.height - minHeight) / hDiff) * 100;
      return `${x},${y}`;
    }).join(" ");
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 pb-28 lg:pb-10 animate-in fade-in duration-300">
      {child.isOfflineFallback && (
        <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <span className="text-sm">⚠️</span>
          <span>Mode Offline: Menampilkan data cadangan lokal. Sambungkan ke internet untuk melihat grafik &amp; riwayat lengkap.</span>
        </div>
      )}

      {activeSection === "" && (
        <div className="space-y-6">
          {/* Header Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/20 pb-4">
            <div className="flex items-center gap-4">
              {motherChildren.length > 1 && (
                <div className="flex bg-base-bg/50 p-1 rounded-2xl border border-base-border/30 shadow-sm mr-2 select-none">
                  {motherChildren.map((c) => (
                    <button
                      key={c.child_id}
                      type="button"
                      onClick={() => setSelectedChildId(c.child_id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedChildId === c.child_id
                          ? "bg-brand-primary text-base-white shadow-md shadow-brand-primary/15"
                          : "text-base-text-secondary hover:text-base-text-primary"
                      }`}
                    >
                      {c.child_name || c.name}
                    </button>
                  ))}
                </div>
              )}
              <div className={`w-16 h-16 rounded-full overflow-hidden border border-base-border/30 shadow-sm shrink-0 flex items-center justify-center font-bold text-xl ${
                child.gender === "M" ? "bg-status-blue-light text-status-blue-solid" : "bg-status-pink-light text-brand-primary"
              }`}>
                {child.avatarUrl ? (
                  <img src={child.avatarUrl} alt={child.name} className="w-full h-full object-cover" />
                ) : (
                  child.gender === "M" ? <MdMale className="w-9 h-9" /> : <MdFemale className="w-9 h-9" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-base-text-primary">{child.name}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    child.gender === "M"
                      ? "bg-status-blue-light text-status-blue-solid border border-status-blue-solid/25"
                      : "bg-status-pink-light text-brand-primary border border-brand-primary/25"
                  }`}>
                    {child.gender === "M" ? "Laki-laki" : "Perempuan"}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(child.status)}`}>
                    {child.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-base-text-secondary font-medium">
                  <span>NIK: <span className="font-semibold text-base-text-primary">{child.national_id || "-"}</span></span>
                  <span>&bull;</span>
                  <span>Umur: <span className="font-semibold text-base-text-primary">{child.ageInMonths} Bulan</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bento Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-soft/30 text-brand-primary flex items-center justify-center shrink-0"><MdScale className="w-5 h-5" /></div>
              <div className="min-w-0"><span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Berat Badan</span><p className="text-base font-black text-base-text-primary mt-0.5">{child.current_weight || child.birth_weight || "-"} kg</p></div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center shrink-0"><MdHeight className="w-5 h-5" /></div>
              <div className="min-w-0"><span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Tinggi Badan</span><p className="text-base font-black text-base-text-primary mt-0.5">{child.current_height || child.birth_length || "-"} cm</p></div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-red-light text-status-red-solid flex items-center justify-center shrink-0"><MdOutlineError className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1"><span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Status Gizi</span><div className="truncate text-xs font-bold text-base-text-primary mt-0.5">{nutritionStatus || "Normal"}</div></div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-green-light text-status-green-solid flex items-center justify-center shrink-0"><MdCalendarMonth className="w-5 h-5" /></div>
              <div className="min-w-0"><span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Kunjungan Terakhir</span><p className="text-xs font-bold text-base-text-primary mt-0.5 truncate">{child.measurements && child.measurements.length > 0 ? child.measurements[0].date : "Belum ada"}</p></div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-base-text-primary">Kurikulum Pemantauan Kesehatan Balita</h2>
              <p className="text-xs text-base-text-secondary font-semibold">Pilih modul kartu di bawah untuk mengisi data check-up harian dan melihat perkembangan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Card 1: Identitas */}
              <div onClick={() => router.push("?section=identitas")} className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FF5C5C] rounded-full"></span> BIODATA BALITA</span>
                  <span>Profil</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FF5C5C] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">BIODATA &amp; IDENTITAS</div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Identitas Lengkap Anak</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Data NIK, tempat/tanggal lahir, nama ibu kandung, golongan darah, serta kondisi medis khusus/riwayat alergi.</p>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center text-[10px] font-bold border border-base-white">{child.name.charAt(0)}</div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-[#FF5C5C]">Lengkap</span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>⚖️ {child.birth_weight || "-"} kg &nbsp;📏 {child.birth_length || "-"} cm</span>
                    <span>Lihat Detail</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Tumbuh Kembang */}
              <div onClick={() => router.push("?section=tumbuh_kembang")} className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CD964] rounded-full"></span> TUMBUH KEMBANG</span>
                  <span>Z-Score</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CD964] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">STATUS GIZI &amp; GRAFIK</div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Grafik &amp; Analisis Status Gizi</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Tren grafik berat/tinggi badan serta analisis Z-Score WHO (BB/U, TB/U) untuk memantau status gizi anak.</p>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="w-6 h-6 rounded-full bg-status-green-light text-status-green-solid flex items-center justify-center text-[10px] font-bold border border-base-white">📈</div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-[#4CD964]">{nutritionStatus}</span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>⚖️ {child.current_weight || "-"} kg &nbsp;📏 {child.current_height || "-"} cm</span>
                    <span>Lihat Grafik</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Riwayat */}
              <div onClick={() => router.push("?section=riwayat")} className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#00BCD4] rounded-full"></span> TREN PERTUMBUHAN</span>
                  <span>Posyandu</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#00BCD4] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">RIWAYAT KUNJUNGAN</div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Log Timbangan &amp; Penimbangan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Riwayat lengkap kunjungan posyandu, penimbangan, imunisasi, dan catatan dari kader.</p>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="w-6 h-6 rounded-full bg-status-cerulean-light text-status-cerulean-solid flex items-center justify-center text-[10px] font-bold border border-base-white">📊</div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-cyan-50 text-[#00BCD4]">{child.measurements?.length || 0} Kunjungan</span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>📊 Log Penimbangan</span>
                    <span>Lihat Riwayat</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Milestone */}
              <div onClick={() => router.push("?section=milestone")} className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group">
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CA3FF] rounded-full"></span> MILESTONE</span>
                  <span>Buku KIA</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CA3FF] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">PENANDA PERKEMBANGAN</div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Checklist Kuesioner Buku KIA</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Evaluasi mandiri penanda perkembangan (milestones) motorik kasar/halus anak usia 6-9 bulan sesuai Buku KIA.</p>
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="w-6 h-6 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center text-[10px] font-bold border border-base-white">👶</div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#4CA3FF]">Usia 6-9 Bulan</span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>📋 {milestones69.filter(m => m.status !== null).length} / {milestones69.length} dijawab</span>
                    <span>Buka Checklist</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEWS */}
      {activeSection !== "" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b pb-3 mb-2 select-none">
            <button type="button" onClick={() => router.push("?")} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm">
              <MdArrowBack className="w-4 h-4" />
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-base-text-secondary">
              {activeSection === "identitas" && "Identitas & Biodata Anak"}
              {activeSection === "tumbuh_kembang" && "Grafik Tumbuh Kembang & Z-Score"}
              {activeSection === "riwayat" && "Riwayat Kunjungan Posyandu"}
              {activeSection === "milestone" && "Penanda Perkembangan (Milestone)"}
            </span>
            <span className="text-[10px] bg-brand-soft text-brand-primary font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/20">{child.name}</span>
          </div>

          {/* SECTION: Identitas */}
          {activeSection === "identitas" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
              <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden">
                <div className="bg-[#FF5C5C] px-5 py-3 flex items-center gap-2">
                  <FaBaby className="w-4 h-4 text-base-white" />
                  <h2 className="text-sm font-extrabold text-base-white uppercase tracking-wider">Identitas Balita</h2>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4 text-xs font-medium">
                  <div className="space-y-1"><span className="text-base-text-secondary block">Nama Lengkap</span><p className="text-sm font-bold text-base-text-primary">{child.name}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Nomor NIK</span><p className="text-sm font-bold text-base-text-primary">{child.national_id || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Jenis Kelamin</span><p className="text-sm font-bold text-base-text-primary flex items-center gap-1">{child.gender === "M" ? <><MdMale className="w-4 h-4 text-status-blue-solid" />Laki-laki</> : <><MdFemale className="w-4 h-4 text-brand-primary" />Perempuan</>}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Golongan Darah</span><p className="text-sm font-bold text-base-text-primary">{child.blood_type || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Tempat Lahir</span><p className="text-sm font-bold text-base-text-primary">{child.birth_place || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Tanggal Lahir</span><p className="text-sm font-bold text-base-text-primary">{child.dob}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Usia Saat Ini</span><p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{child.ageInMonths} Bulan</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Anak Ke-</span><p className="text-sm font-bold text-base-text-primary">Ke-{child.birth_order || 1}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">Ibu Kandung</span><p className="text-sm font-bold text-base-text-primary">{child.mother_name || child.mother || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">No. JKN / BPJS</span><p className="text-sm font-bold text-base-text-primary">{child.jkn_number || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">No. Akta Kelahiran</span><p className="text-sm font-bold text-base-text-primary">{child.birth_certificate_number || "-"}</p></div>
                  <div className="space-y-1"><span className="text-base-text-secondary block">No. Telepon Orang Tua</span><p className="text-sm font-bold text-base-text-primary">{child.phone_number || "-"}</p></div>
                  <div className="col-span-2 space-y-1"><span className="text-base-text-secondary block">Alamat Rumah</span><p className="text-sm font-bold text-base-text-primary">{child.address || "-"}</p></div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden">
                  <div className="bg-[#FF9F43] px-5 py-3 flex items-center gap-2">
                    <MdScale className="w-4 h-4 text-base-white" />
                    <h2 className="text-sm font-extrabold text-base-white uppercase tracking-wider">Kondisi Saat Lahir</h2>
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-4 text-center">
                    <div className="bg-base-bg/30 p-4 rounded-xl"><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Lahir</span><p className="text-2xl font-black text-base-text-primary mt-1">{child.birth_weight || "-"}<span className="text-sm ml-1">kg</span></p></div>
                    <div className="bg-base-bg/30 p-4 rounded-xl"><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Panjang Lahir</span><p className="text-2xl font-black text-base-text-primary mt-1">{child.birth_length || "-"}<span className="text-sm ml-1">cm</span></p></div>
                    <div className="bg-brand-soft/20 p-4 border border-brand-primary/10 rounded-xl relative"><MdScale className="w-4 h-4 text-brand-primary absolute top-2 right-2" /><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Sekarang</span><p className="text-2xl font-black text-brand-primary mt-1">{child.current_weight || "-"}<span className="text-sm ml-1">kg</span></p></div>
                    <div className="bg-brand-soft/20 p-4 border border-brand-primary/10 rounded-xl relative"><MdHeight className="w-4 h-4 text-brand-primary absolute top-2 right-2" /><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Sekarang</span><p className="text-2xl font-black text-brand-primary mt-1">{child.current_height || "-"}<span className="text-sm ml-1">cm</span></p></div>
                  </div>
                </div>
                <div className="bg-base-white rounded-bento-lg p-5 border border-base-border/30 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-base-border/10 pb-2"><FaNotesMedical className="w-4 h-4 text-brand-primary" /><h3 className="font-bold text-sm text-base-text-primary">Kondisi Medis &amp; Alergi</h3></div>
                  {(!child.special_conditions || child.special_conditions.length === 0) ? (
                    <p className="text-xs text-base-text-secondary italic">Tidak ada kondisi khusus / riwayat alergi.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">{child.special_conditions.map((tag: string) => <span key={tag} className="bg-brand-soft/50 text-brand-primary border border-brand-primary/20 rounded-full px-3 py-1 text-xs font-semibold">{tag}</span>)}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Tumbuh Kembang */}
          {activeSection === "tumbuh_kembang" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-brand-soft/30 text-brand-primary flex items-center justify-center shrink-0"><MdScale className="w-5 h-5" /></div><div><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Badan</span><p className="text-lg font-black text-brand-primary">{child.current_weight || "-"} kg</p></div></div>
                <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center shrink-0"><MdHeight className="w-5 h-5" /></div><div><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Badan</span><p className="text-lg font-black text-status-blue-solid">{child.current_height || "-"} cm</p></div></div>
                <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-status-green-light text-status-green-solid flex items-center justify-center shrink-0"><MdOutlineWeight className="w-5 h-5" /></div><div><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Z-Score BB/U</span><p className="text-lg font-black text-status-green-solid">{zScoreBB ? `${zScoreBB.toFixed(2)} SD` : "-"}</p></div></div>
                <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm"><div className="w-10 h-10 rounded-xl bg-status-orange-light text-status-orange-solid flex items-center justify-center shrink-0"><MdOutlineWeight className="w-5 h-5" /></div><div><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Z-Score TB/U</span><p className="text-lg font-black text-status-orange-solid">{zScoreTB ? `${zScoreTB.toFixed(2)} SD` : "-"}</p></div></div>
              </div>
              <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></span><h2 className="font-bold text-base-text-primary text-base">Tren Tumbuh Kembang Balita</h2></div>
                  <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">{child.measurements?.length || 0} kunjungan</span>
                </div>
                {hasHistory ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-base-text-secondary">
                      <div className="flex items-center justify-center gap-2"><span className="w-3 h-0.5 bg-brand-primary inline-block"></span><span>Berat Badan (kg)</span></div>
                      <div className="flex items-center justify-center gap-2"><span className="w-3 h-0.5 bg-blue-500 inline-block"></span><span>Tinggi Badan (cm)</span></div>
                    </div>
                    <div className="relative border border-base-border/20 rounded-2xl p-4 bg-base-bg/5 flex items-center justify-center">
                      <svg className="w-full max-w-[500px] h-[160px]" viewBox="0 0 500 160">
                        <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />
                        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={heightPoints} />
                        <polyline fill="none" stroke="#ea2986" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={weightPoints} />
                        {chronologicalMeasurements.map((m: any, i: number) => { const maxW=Math.max(...chronologicalMeasurements.map((x:any)=>x.weight),15); const minW=Math.min(...chronologicalMeasurements.map((x:any)=>x.weight),3); const wD=maxW-minW||1; const x=(i/(chronologicalMeasurements.length-1))*460+20; const y=140-((m.weight-minW)/wD)*100; return <circle key={`w-${i}`} cx={x} cy={y} r="4" fill="#ea2986" stroke="#fff" strokeWidth="1.5" />; })}
                        {chronologicalMeasurements.map((m: any, i: number) => { const maxH=Math.max(...chronologicalMeasurements.map((x:any)=>x.height),110); const minH=Math.min(...chronologicalMeasurements.map((x:any)=>x.height),40); const hD=maxH-minH||1; const x=(i/(chronologicalMeasurements.length-1))*460+20; const y=140-((m.height-minH)/hD)*100; return <circle key={`h-${i}`} cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />; })}
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center space-y-2 text-base-text-secondary text-sm">
                    <p>Belum memiliki riwayat pemeriksaan posyandu yang cukup.</p>
                    <p className="text-xs">Diperlukan minimal 2 riwayat penimbangan untuk memvisualisasikan tren grafik.</p>
                  </div>
                )}
              </div>
              <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-base-border/10 pb-3"><MdOutlineWeight className="w-5 h-5 text-brand-primary" /><h2 className="font-bold text-base-text-primary text-base">Analisis Status Gizi (WHO Z-Score)</h2></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-base-bg/30 p-4 rounded-xl text-center"><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Badan vs Umur</span><span className={`inline-block mt-2 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeStyle(nutritionStatus)}`}>{nutritionStatus}</span><p className="text-[10px] text-base-text-secondary mt-1.5 font-semibold">Z-Score: {zScoreBB ? zScoreBB.toFixed(2) : "0.00"} SD</p></div>
                  <div className="bg-base-bg/30 p-4 rounded-xl text-center"><span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Badan vs Umur</span><span className={`inline-block mt-2 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeStyle(nutritionStatus)}`}>{nutritionStatus}</span><p className="text-[10px] text-base-text-secondary mt-1.5 font-semibold">Z-Score: {zScoreTB ? zScoreTB.toFixed(2) : "0.00"} SD</p></div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Riwayat */}
          {activeSection === "riwayat" && (
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3"><MdScale className="w-5 h-5 text-brand-primary" /><h2 className="font-bold text-base-text-primary text-base">Riwayat Kunjungan &amp; Penimbangan Balita</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead><tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider"><th className="py-3 px-4">Tanggal Kunjungan</th><th className="py-3 px-4 text-center">Umur</th><th className="py-3 px-4 text-center">Berat (kg)</th><th className="py-3 px-4 text-center">Tinggi (cm)</th><th className="py-3 px-4 text-center">Lkr. Kepala (cm)</th><th className="py-3 px-4 text-center">Vit A</th><th className="py-3 px-4 text-center">Imunisasi</th><th className="py-3 px-4">Catatan Kader</th></tr></thead>
                  <tbody className="text-sm">
                    {(!child.measurements || child.measurements.length === 0) ? (
                      <tr><td colSpan={8} className="py-8 text-center text-base-text-secondary text-xs">Belum ada riwayat penimbangan posyandu.</td></tr>
                    ) : (
                      child.measurements.map((m: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{m.date}</td>
                          <td className="py-3 px-4 text-center font-bold text-base-text-primary">{m.ageAtVisit} Bulan</td>
                          <td className="py-3 px-4 text-center font-bold text-brand-primary">{m.weight ? `${m.weight} kg` : "-"}</td>
                          <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.height ? `${m.height} cm` : "-"}</td>
                          <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.head_circumference ? `${m.head_circumference} cm` : "-"}</td>
                          <td className="py-3 px-4 text-center font-semibold">{m.vitamin_a_capsule || "-"}</td>
                          <td className="py-3 px-4 text-center font-semibold">{m.immunizations || "-"}</td>
                          <td className="py-3 px-4 text-base-text-secondary font-medium italic">{m.cadre_notes || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: Milestone */}
          {activeSection === "milestone" && (
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3"><span className="text-xl">📋</span><div><h2 className="font-bold text-base-text-primary text-base leading-tight">Lembar Penanda Perkembangan Anak</h2><p className="text-[11px] text-base-text-secondary font-medium mt-0.5">Evaluasi mandiri berkala Buku KIA 2024 Halaman 62 - Usia 6 s.d 9 Bulan.</p></div></div>
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {milestones69.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-bg/20 rounded-xl gap-2.5 text-xs">
                    <span className="font-medium text-base-text-primary leading-relaxed">{item.id}. {item.text}</span>
                    <div className="flex gap-4 shrink-0 select-none font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer text-status-green-solid text-[11px]"><input type="radio" name={`milestone-q-${item.id}`} checked={item.status === true} onChange={() => handleMilestoneRadioChange(item.id, true)} className="accent-status-green-solid w-4 h-4 cursor-pointer" /> Ya</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-status-red-solid text-[11px]"><input type="radio" name={`milestone-q-${item.id}`} checked={item.status === false} onChange={() => handleMilestoneRadioChange(item.id, false)} className="accent-status-red-solid w-4 h-4 cursor-pointer" /> Tidak</label>
                    </div>
                  </div>
                ))}
              </div>
              {milestones69.some(item => item.status === false) && (
                <div className="p-4 bg-status-red-light/20 border border-status-red-solid/25 rounded-xl text-xs text-status-red-solid font-bold leading-relaxed flex gap-2.5 items-start shadow-xs animate-in shake duration-300">
                  <span className="text-base mt-0.5">⚠️</span>
                  <p className="font-semibold text-status-red-solid"><strong>PENTING:</strong> Jika anak BELUM bisa melakukan salah satu indikator di atas, mohon segera bawa balita ke dokter anak atau Puskesmas terdekat untuk pemeriksaan dini tumbuh kembang!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
