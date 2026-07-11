"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdOutlineError, MdPerson, MdCalendarMonth, MdPregnantWoman,
  MdPhone, MdBloodtype, MdMale, MdFemale, MdVaccines, MdEdit,
  MdCheckCircleOutline, MdBabyChangingStation, MdFamilyRestroom,
  MdArrowBack, MdSave, MdClose, MdScale
} from "react-icons/md";
import { FaHeartbeat, FaHeart, FaUser } from "react-icons/fa";
import { getMaternalHistory, getMotherMetrics, getLoggedInMotherData, getMotherDetail, getLoggedInMotherDetail } from "@/app/actions/mothers";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { getWeeklyMonitorings, upsertWeeklyMonitoring } from "@/app/actions/weekly";
import { useUserRole } from "@/context/UserRoleContext";
import CustomDatePicker from "@/components/CustomDatePicker";

function PerjalananIbuContent() {
  const { role, username, isLoggedIn } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams?.get("section") || "";
  const [motherDetail, setMotherDetail] = useState<any>(null);
  const [isLoadingMother, setIsLoadingMother] = useState(true);
  const [activeIbuSubTab, setActiveIbuSubTab] = useState<'ibu' | 'husband' | 'health'>('ibu');
  const [activePemantauanTab, setActivePemantauanTab] = useState<'ttd' | 'weekly' | 'attendance' | 'birth_prep' | 'birth_process' | 'postpartum' | 'kb' | 'breastfeeding'>('ttd');
  const [breastfeedingAnswers, setBreastfeedingAnswers] = useState<boolean[]>(new Array(12).fill(false));
  
  const [attendance, setAttendance] = useState<any[]>([
    { date: "", facilitator: "", note: "" },
    { date: "", facilitator: "", note: "" },
    { date: "", facilitator: "", note: "" }
  ]);
  const [editingAttendanceIdx, setEditingAttendanceIdx] = useState<number | null>(null);
  const [prepList, setPrepList] = useState<boolean[]>(new Array(10).fill(false));
  const [birthProcessList, setBirthProcessList] = useState<boolean[]>(new Array(7).fill(false));

  const [postpartumFilter, setPostpartumFilter] = useState<number>(1); // Week 1-6
  const [postpartumList, setPostpartumList] = useState<any[]>(
    new Array(42).fill(null).map((_, i) => ({
      day: i + 1,
      pemeriksaan_nifas: false,
      vitamin_a: false,
      ttd: false,
      gizi_sesuai: false,
      masalah_jiwa: false,
      demam: false,
      sakit_kepala: false,
      pandangan_kabur: false,
      nyeri_ulu_hati: false,
      jantung_berdebar: false,
      napas_pendek: false,
      payudara_bengkak: false,
      gangguan_bak: false,
      kelamin_bengkak: false,
      darah_bau: false,
      konstipasi_diare: false,
      keputihan: false
    }))
  );
  const [kbAnswers, setKbAnswers] = useState<boolean[]>(new Array(3).fill(false));
  const [kbConsent, setKbConsent] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (role && role !== "ibu") {
      router.replace("/data-ibu");
    }
  }, [role, isLoggedIn, router]);

  useEffect(() => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const cachedAttendance = localStorage.getItem(`attendance_class_ibu_hamil_${motherId}`);
    if (cachedAttendance) {
      try {
        const parsed = JSON.parse(cachedAttendance);
        const normalized = parsed.map((item: any) => ({
          date: item.date || "",
          facilitator: item.facilitator || "",
          note: item.note || ""
        }));
        setAttendance(normalized);
      } catch (e) {}
    } else {
      setAttendance([
        { date: "", facilitator: "", note: "" },
        { date: "", facilitator: "", note: "" },
        { date: "", facilitator: "", note: "" }
      ]);
    }

    const list = [];
    for(let i=1; i<=10; i++) {
      list.push(localStorage.getItem(`birth_prep_${i}_${motherId}`) === 'true');
    }
    setPrepList(list);

    const processList = [];
    for(let i=1; i<=7; i++) {
      processList.push(localStorage.getItem(`birth_process_${i}_${motherId}`) === 'true');
    }
    setBirthProcessList(processList);

    const cachedPostpartum = localStorage.getItem(`postpartum_monitoring_${motherId}`);
    if (cachedPostpartum) {
      try {
        setPostpartumList(JSON.parse(cachedPostpartum));
      } catch (e) {}
    }

    const cachedKbAnswers = localStorage.getItem(`kb_answers_${motherId}`);
    if (cachedKbAnswers) {
      try {
        setKbAnswers(JSON.parse(cachedKbAnswers));
      } catch (e) {}
    }

    const cachedKbConsent = localStorage.getItem(`kb_consent_${motherId}`);
    if (cachedKbConsent) {
      setKbConsent(cachedKbConsent === 'true');
    }

    const cachedBreastfeeding = localStorage.getItem(`breastfeeding_monitoring_${motherId}`);
    if (cachedBreastfeeding) {
      try {
        setBreastfeedingAnswers(JSON.parse(cachedBreastfeeding));
      } catch (e) {}
    }
  }, [motherDetail]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [ttdLogs, setTtdLogs] = useState<any[]>([]);
  const [ttdCompanion, setTtdCompanion] = useState("");
  const [ttdRelationship, setTtdRelationship] = useState("Suami");
  const [isSavingTtd, setIsSavingTtd] = useState(false);
  const [isEditingCompanion, setIsEditingCompanion] = useState(false);

  // Weekly self monitoring states
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
  const [weeklyTrimesterFilter, setWeeklyTrimesterFilter] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    async function loadMotherDetail() {
      if (role !== "ibu") return;
      const cacheKey = `offline_mother_detail_${username}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setMotherDetail(JSON.parse(cached));
          setIsLoadingMother(false);
        } catch (e) {
          console.error("Failed to parse cached mother detail:", e);
        }
      }

      if (!navigator.onLine) {
        return;
      }

      try {
        setIsLoadingMother(true);
        const detail = await getLoggedInMotherDetail(username);
        if (detail) {
          setMotherDetail(detail);
          localStorage.setItem(cacheKey, JSON.stringify(detail));
        }
      } catch (err) {
        console.error("Failed to load mother detail:", err);
      } finally {
        setIsLoadingMother(false);
      }
    }
    if (role === "ibu") {
      loadMotherDetail();
    }
  }, [role, username]);

  useEffect(() => {
    if (!motherDetail) return;
    async function fetchTtdData() {
      const motherId = motherDetail.mother_id;
      const cacheKey = `offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`;
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTtdLogs(parsed.logs || []);
          setTtdCompanion(parsed.companion || "");
          setTtdRelationship(parsed.relationship || "Suami");
        } catch (e) {
          console.error("Failed to parse cached TTD data:", e);
        }
      }

      if (!navigator.onLine) return;

      try {
        const res = await getTtdLogs(motherId, currentYear, currentMonth);
        if (res && res.success) {
          const logs = res.logs;
          setTtdLogs(logs);
          
          const latestLog = logs.find((l: any) => l.companion);
          const companion = latestLog?.companion || localStorage.getItem(`ttd_companion_${motherId}`) || "";
          const relationship = latestLog?.relationship || localStorage.getItem(`ttd_relationship_${motherId}`) || "Suami";
          
          if (companion) setTtdCompanion(companion);
          if (relationship) setTtdRelationship(relationship);

          localStorage.setItem(cacheKey, JSON.stringify({
            logs,
            companion,
            relationship
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchTtdData();
  }, [motherDetail, currentMonth, currentYear]);

  // Sync activePemantauanTab with activeSection
  useEffect(() => {
    if (activeSection === "ttd" || activeSection === "weekly" || activeSection === "attendance" || activeSection === "birth_prep" || activeSection === "postpartum" || activeSection === "breastfeeding") {
      setActivePemantauanTab(activeSection as any);
    }
  }, [activeSection]);

  // Load weekly logs
  useEffect(() => {
    if (!motherDetail) return;
    async function fetchWeeklyData() {
      const motherId = motherDetail.mother_id;
      const cacheKey = `offline_weekly_logs_${motherId}`;
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setWeeklyLogs(JSON.parse(cached));
        } catch (e) {}
      }

      if (!navigator.onLine) return;

      try {
        const res = await getWeeklyMonitorings(motherId);
        if (res && res.success) {
          setWeeklyLogs(res.list || []);
          localStorage.setItem(cacheKey, JSON.stringify(res.list || []));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchWeeklyData();
  }, [motherDetail]);

  const handleTtdCheck = async (day: number) => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const hasLog = ttdLogs.includes(day);
    
    // Toggle
    let updatedLogs: number[];
    if (hasLog) {
      updatedLogs = ttdLogs.filter(d => d !== day);
    } else {
      updatedLogs = [...ttdLogs, day];
    }
    setTtdLogs(updatedLogs);

    // Save Offline first
    const offlineData = {
      logs: updatedLogs,
      companion: ttdCompanion,
      relationship: ttdRelationship
    };
    localStorage.setItem(`offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`, JSON.stringify(offlineData));

    if (!navigator.onLine) {
      // Queue sync
      const syncQueue = JSON.parse(localStorage.getItem("pending_ttd_syncs") || "[]");
      syncQueue.push({ motherId, day, action: hasLog ? "remove" : "add", year: currentYear, month: currentMonth });
      localStorage.setItem("pending_ttd_syncs", JSON.stringify(syncQueue));
      return;
    }

    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    try {
      await upsertTtdLog(motherId, dateStr, !hasLog, ttdCompanion, ttdRelationship);
    } catch (e) {
      console.error("Failed to sync TTD log to server:", e);
    }
  };

  const handleSaveCompanion = async () => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    setIsEditingCompanion(false);

    // Save offline
    const offlineKey = `offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`;
    const cached = JSON.parse(localStorage.getItem(offlineKey) || "{}");
    cached.companion = ttdCompanion;
    cached.relationship = ttdRelationship;
    localStorage.setItem(offlineKey, JSON.stringify(cached));

    if (!navigator.onLine) {
      localStorage.setItem(`pending_ttd_companion_${motherId}`, JSON.stringify({ companion: ttdCompanion, relationship: ttdRelationship }));
      return;
    }

    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    try {
      await upsertTtdLog(motherId, dateStr, false, ttdCompanion, ttdRelationship);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWeeklyCheck = async (week: number, field: string) => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;

    // Toggle local state
    const updated = [...weeklyLogs];
    let recordIndex = updated.findIndex(l => l.week_number === week);
    
    if (recordIndex === -1) {
      const newRec: any = {
        mother_id: motherId,
        week_number: week,
        fetal_movement: false,
        swollen_feet: false,
        fever: false,
        bleeding: false,
        premature_fluid: false
      };
      newRec[field] = true;
      updated.push(newRec);
      recordIndex = updated.length - 1;
    } else {
      updated[recordIndex][field] = !updated[recordIndex][field];
    }
    setWeeklyLogs(updated);

    // Save offline
    localStorage.setItem(`offline_weekly_logs_${motherId}`, JSON.stringify(updated));

    if (!navigator.onLine) {
      const syncQueue = JSON.parse(localStorage.getItem("pending_weekly_syncs") || "[]");
      syncQueue.push({ motherId, week, field, value: updated[recordIndex][field] });
      localStorage.setItem("pending_weekly_syncs", JSON.stringify(syncQueue));
      return;
    }

    try {
      const rec = updated[recordIndex];
      await upsertWeeklyMonitoring(
        motherId,
        week,
        rec
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAttendanceClass = () => {
    const updated = [...attendance, { date: "", facilitator: "", note: "" }];
    setAttendance(updated);
    setEditingAttendanceIdx(updated.length - 1);
    if (motherDetail) {
      localStorage.setItem(`attendance_class_ibu_hamil_${motherDetail.mother_id}`, JSON.stringify(updated));
    }
  };

  const handleDeleteAttendanceClass = (idx: number) => {
    const updated = attendance.filter((_, i) => i !== idx);
    setAttendance(updated);
    if (editingAttendanceIdx === idx) {
      setEditingAttendanceIdx(null);
    } else if (editingAttendanceIdx !== null && editingAttendanceIdx > idx) {
      setEditingAttendanceIdx(editingAttendanceIdx - 1);
    }
    if (motherDetail) {
      localStorage.setItem(`attendance_class_ibu_hamil_${motherDetail.mother_id}`, JSON.stringify(updated));
    }
  };

  const handleSaveSingleAttendance = (idx: number) => {
    setEditingAttendanceIdx(null);
    if (motherDetail) {
      localStorage.setItem(`attendance_class_ibu_hamil_${motherDetail.mother_id}`, JSON.stringify(attendance));
    }
  };

  const handleAttendanceChange = (idx: number, field: 'date' | 'facilitator' | 'note', value: string) => {
    const updated = [...attendance];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };
    setAttendance(updated);
  };

  const handlePrepToggle = (idx: number) => {
    if (!motherDetail) return;
    const updated = [...prepList];
    updated[idx] = !updated[idx];
    setPrepList(updated);
    localStorage.setItem(`birth_prep_${idx + 1}_${motherDetail.mother_id}`, updated[idx] ? 'true' : 'false');
  };

  const handleProcessToggle = (idx: number) => {
    if (!motherDetail) return;
    const updated = [...birthProcessList];
    updated[idx] = !updated[idx];
    setBirthProcessList(updated);
    localStorage.setItem(`birth_process_${idx + 1}_${motherDetail.mother_id}`, updated[idx] ? 'true' : 'false');
  };

  const handlePostpartumToggle = (day: number, field: string) => {
    if (!motherDetail) return;
    const updated = [...postpartumList];
    updated[day - 1][field] = !updated[day - 1][field];
    setPostpartumList(updated);
    localStorage.setItem(`postpartum_monitoring_${motherDetail.mother_id}`, JSON.stringify(updated));
  };

  const handleKbAnswerToggle = (idx: number) => {
    if (!motherDetail) return;
    const updated = [...kbAnswers];
    updated[idx] = !updated[idx];
    setKbAnswers(updated);
    localStorage.setItem(`kb_answers_${motherDetail.mother_id}`, JSON.stringify(updated));
  };

  const handleKbConsentToggle = () => {
    if (!motherDetail) return;
    const nextVal = !kbConsent;
    setKbConsent(nextVal);
    localStorage.setItem(`kb_consent_${motherDetail.mother_id}`, nextVal ? 'true' : 'false');
  };

  const handleBreastfeedingToggle = (idx: number) => {
    if (!motherDetail) return;
    const updated = [...breastfeedingAnswers];
    updated[idx] = !updated[idx];
    setBreastfeedingAnswers(updated);
    localStorage.setItem(`breastfeeding_monitoring_${motherDetail.mother_id}`, JSON.stringify(updated));
  };

  const getConditionColor = (cond: string) => {
    if (cond === "Normal") return "bg-status-green-light text-status-green-solid border-status-green-solid/25";
    if (cond.includes("KEK") || cond.includes("Risiko")) return "bg-status-orange-light text-status-orange-solid border-status-orange-solid/25";
    return "bg-brand-soft text-brand-primary border-brand-primary/25";
  };

  const getInitials = (name: string) => {
    if (!name) return "IB";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoadingMother) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 pb-10 animate-pulse">
        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 h-28">
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
            <div className="space-y-2 w-full max-w-sm">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-base-white p-5 rounded-bento-lg border border-base-border/30 h-28 flex flex-col justify-between">
              <div className="h-4 w-12 bg-gray-100 rounded"></div>
              <div className="h-6 w-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 h-80">
          <div className="h-5 w-48 bg-gray-100 rounded"></div>
          <div className="h-full mt-4 bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!motherDetail) {
    return (
      <div className="bg-base-white p-8 rounded-xl shadow-sm border border-base-border/30 text-center m-8">
        <p className="text-base-text-secondary font-bold">Data Kesehatan tidak ditemukan.</p>
      </div>
    );
  }

  const displayCondition = motherDetail.condition || "Normal";
  const lastRecord = motherDetail.maternal_records && motherDetail.maternal_records.length > 0 ? motherDetail.maternal_records[0] : null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-8 pb-28 lg:pb-10 animate-in fade-in duration-300">
      
      {!navigator.onLine && (
        <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <span className="text-sm">⚠️</span>
          <span>Mode Offline: Menampilkan data cadangan lokal dari Beranda. Sambungkan ke internet untuk menyinkronkan data pemeriksaan terbaru.</span>
        </div>
      )}

      {activeSection === "" && (
        <div className="space-y-6">
          {/* Header Profil */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm"
              >
                <MdArrowBack className="w-4 h-4" />
              </Link>
              <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center font-bold text-brand-primary text-xl border-2 border-brand-primary/20 shrink-0 overflow-hidden">
                {motherDetail.avatarUrl ? (
                  <img src={motherDetail.avatarUrl} alt={motherDetail.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(motherDetail.name)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">{motherDetail.name}</h1>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-base-text-secondary mt-1.5 font-semibold">
                  <span>NIK: {motherDetail.national_id}</span>
                  <span>&bull;</span>
                  <span>ID Ibu: {motherDetail.mother_id}</span>
                  <span>&bull;</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${getConditionColor(displayCondition)}`}>
                    Status: {displayCondition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bento Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-soft/30 text-brand-primary flex items-center justify-center shrink-0">
                <MdCalendarMonth className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">HPL / Persalinan</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5 truncate">{motherDetail.hpl || "-"}</p>
              </div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center shrink-0">
                <MdPerson className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Lingkar Lengan (LiLA)</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.muac ? `${lastRecord.muac} cm` : "-"}</p>
              </div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-orange-light text-status-orange-solid flex items-center justify-center shrink-0">
                <MdScale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Berat Badan</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.weight ? `${lastRecord.weight} kg` : "-"}</p>
              </div>
            </div>
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-red-light text-status-red-solid flex items-center justify-center shrink-0">
                <FaHeartbeat className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Tekanan Darah</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.blood_pressure || "-"}</p>
              </div>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-base-text-primary font-bold">Kurikulum Pemantauan Kesehatan Ibu Hamil</h2>
              <p className="text-xs text-base-text-secondary font-semibold">Pilih modul kartu di bawah untuk mengisi data check-up harian dan melihat perkembangan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Card 1: Biodata Ibu & Keluarga */}
              <div 
                onClick={() => router.push("?section=biodata")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full"></span> BIODATA IBU</span>
                  <span>Profil</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FFCC00] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    IDENTITAS IBU &amp; SUAMI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Identitas Ibu &amp; Suami</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Informasi data diri lengkap Ibu, suami, faskes rujukan domisili, nomor HP, pekerjaan, dan daftar balita terhubung.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👩
                        </div>
                        <div className="w-6 h-6 rounded-full bg-status-blue-light text-status-blue-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👨
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#FFCC00] hover:underline">Detail Profil &gt;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Riwayat Pemeriksaan Medis */}
              <div 
                onClick={() => router.push("?section=medical")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4A85F6] rounded-full"></span> HISTORI MEDIS</span>
                  <span>Buku KIA Hlm. 4-6</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4A85F6] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    RIWAYAT KUNJUNGAN KEHAMILAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Histori &amp; Catatan Faskes</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Lihat catatan perkembangan kehamilan, tekanan darah, fundus, detak jantung janin (DJJ), dan instruksi bidan posyandu.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <span className="text-[10px] font-extrabold text-[#4A85F6] uppercase tracking-tight">
                        {motherDetail.maternal_records?.length || 0} Kali Pemeriksaan
                      </span>
                      <span className="text-[10px] font-bold text-[#4A85F6] hover:underline">Lihat Riwayat &gt;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Tablet Tambah Darah (TTD) */}
              <div 
                onClick={() => router.push("?section=ttd")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FF2D55] rounded-full"></span> TABLET Fe</span>
                  <span>Fe / MMS</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FF2D55] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    SUPLEMEN BESI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Checklist Minum TTD</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log minum harian tablet besi Fe/MMS (min. 90 tablet selama kehamilan) beserta identitas pendamping minum obat.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-pink-light text-brand-primary flex items-center justify-center text-[10px] font-bold border border-base-white">
                          💊
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-pink-50 text-[#FF2D55]">
                        {ttdLogs.length} Diminum
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Pemantauan Mingguan */}
              <div 
                onClick={() => router.push("?section=weekly")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></span> MINGGUAN</span>
                  <span>Gejala &amp; Tanda Bahaya</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#007AFF] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    PEMANTAUAN MANDIRI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Gejala Mingguan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log gejala rutin (tensi, bengkak kaki, pergerakan janin, pusing) di setiap minggu kehamilan Trimester 1, 2, dan 3.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-blue-light text-status-blue-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          📅
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#007AFF]">
                        Mg {weeklyLogs.length > 0 ? weeklyLogs[weeklyLogs.length - 1].week_number : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Kelas Ibu Hamil */}
              <div 
                onClick={() => router.push("?section=attendance")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#5856D6] rounded-full"></span> KELAS IBU</span>
                  <span>Absensi</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#5856D6] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    KELAS IBU HAMIL
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Absensi Kehadiran Kelas</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log partisipasi materi edukasi antenatal harian (Trimester 1, 2, dan 3) yang dibimbing bidan/kader.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🎓
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-[#5856D6]">
                        {attendance.filter((r: any) => !!r.date).length} Hadir
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 6: Persiapan Persalinan */}
              <div 
                onClick={() => router.push("?section=birth_prep")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CD964] rounded-full"></span> PERSALINAN</span>
                  <span>P4K &amp; Rencana</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CD964] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    RENCANA PERSALINAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Persiapan &amp; Proses Lahir</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Checklist mandiri persiapan logistik persalinan (P4K, pendonor, transportasi, dana, jaminan) &amp; panduan proses persalinan.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-green-light text-status-green-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🏠
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-[#4CD964]">
                        {prepList.filter(Boolean).length} / 10 Siap
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 7: Pasca Salin */}
              <div 
                onClick={() => router.push("?section=postpartum")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4A90E2] rounded-full"></span> PASCA SALIN</span>
                  <span>Nifas &amp; KB</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4A90E2] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    MASA NIFAS &amp; KB
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Nifas &amp; KB</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log pemantauan harian nifas 42 hari (vitamin A, tanda bahaya nifas) serta rencana/persetujuan kontrasepsi KB pasca bersalin.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🍼
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#4A90E2]">
                        {kbConsent ? "KB Disetujui" : "Belum KB"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 8: Menyusui & Nutrisi */}
              <div 
                onClick={() => router.push("?section=breastfeeding")}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#50E3C2] rounded-full"></span> MENYUSUI</span>
                  <span>ASI &amp; Gizi</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#50E3C2] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    ASI &amp; NUTRISI IBU
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Menyusui &amp; Porsi Makan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Checklist teknik pelekatan posisi menyusui ASI eksklusif dan evaluasi pemenuhan nutrisi porsi makan harian ibu menyusui.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👩‍🍼
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-[#50E3C2]">
                        {breastfeedingAnswers.filter(Boolean).length} / 12 Terpenuhi
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Biodata */}
      {activeSection === "biodata" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("?")}
              className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm"
            >
              <MdArrowBack className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black text-base-text-primary font-bold">Identitas Lengkap Ibu &amp; Keluarga</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Biodata Ibu & Suami (Left column) */}
            <div className="lg:col-span-7 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
              
              {/* Tab selector inside biodata */}
              <div className="flex border-b border-base-border/10 pb-1 gap-4 select-none">
                <button 
                  onClick={() => setActiveIbuSubTab('ibu')}
                  className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${activeIbuSubTab === 'ibu' ? 'text-brand-primary' : 'text-base-text-secondary hover:text-brand-primary/80'}`}
                >
                  Identitas Ibu
                  {activeIbuSubTab === 'ibu' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"></span>}
                </button>
                <button 
                  onClick={() => setActiveIbuSubTab('husband')}
                  className={`pb-2.5 text-xs font-bold transition-all relative cursor-pointer ${activeIbuSubTab === 'husband' ? 'text-brand-primary' : 'text-base-text-secondary hover:text-brand-primary/80'}`}
                >
                  Identitas Suami
                  {activeIbuSubTab === 'husband' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full"></span>}
                </button>
              </div>

              {/* Subtab: Ibu */}
              {activeIbuSubTab === 'ibu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nama Lengkap Ibu</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">NIK Ibu</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.national_id}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Golongan Darah Ibu</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.blood_type || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tempat / Tanggal Lahir</span>
                    <p className="text-sm font-bold text-base-text-primary">
                      {motherDetail.birth_place || "-"}, {motherDetail.birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(motherDetail.birth_date)) : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Usia</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.age || "-"} Tahun</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pendidikan Terakhir</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.education || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pekerjaan</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.occupation || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nomor HP / WhatsApp</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.phone_number || "-"}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Alamat Lengkap</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.address || "-"}</p>
                  </div>
                </div>
              )}

              {/* Subtab: Suami */}
              {activeIbuSubTab === 'husband' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nama Lengkap Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_name || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">NIK Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_national_id || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tempat / Tanggal Lahir Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">
                      {motherDetail.husband_birth_place || "-"}, {motherDetail.husband_birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(motherDetail.husband_birth_date)) : "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Golongan Darah Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_blood_type || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pendidikan Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_education || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pekerjaan Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_occupation || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nomor Telepon Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_phone_number || "-"}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Alamat Rumah Suami</span>
                    <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_address || "-"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Balita Terdaftar (Right column) */}
            <div className="lg:col-span-5 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <MdBabyChangingStation className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-bold text-base-text-primary text-base">Balita Terdaftar</h2>
                </div>
                <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                  {motherDetail.children?.length || 0} Balita
                </span>
              </div>

              {!motherDetail.children || motherDetail.children.length === 0 ? (
                <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center text-sm text-base-text-secondary">
                  Belum ada data anak terdaftar yang terhubung.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {motherDetail.children.map((child: any, idx: number) => (
                    <div key={idx} className="border border-base-border/30 rounded-xl p-4 bg-base-bg/5 hover:border-brand-primary/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-base-text-primary leading-tight">{child.name}</p>
                          {child.gender === "M" ? (
                            <MdMale className="w-4 h-4 text-status-blue-solid" />
                          ) : (
                            <MdFemale className="w-4 h-4 text-brand-primary" />
                          )}
                        </div>
                        <p className="text-xs text-base-text-secondary mt-1">{child.age} &bull; {child.dob}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Medical */}
      {activeSection === "medical" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("?")}
              className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm"
            >
              <MdArrowBack className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black text-base-text-primary font-bold">Riwayat Medis Kehamilan Ibu</h2>
          </div>

          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-base-text-primary">Riwayat Kehamilan &amp; Status Risiko Kesehatan</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-medium">
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Kehamilan Ke-</span>
                <p className="text-lg font-black text-base-text-primary">{motherDetail.pregnancy_number ?? "1"}</p>
              </div>
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Jumlah Anak Lahir Hidup</span>
                <p className="text-lg font-black text-base-text-primary">{motherDetail.children_born_alive ?? "0"}</p>
              </div>
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Riwayat Keguguran</span>
                <p className="text-lg font-black text-base-text-primary">{motherDetail.miscarriage_history ?? "0"} kali</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t pt-4">
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Riwayat Penyakit Kronis</span>
                <p className="text-sm font-bold text-base-text-primary italic">{motherDetail.disease_history || "Tidak ada riwayat penyakit"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Status Risiko Kehamilan</span>
                <span className={`inline-block mt-1 px-3 py-1 border text-xs font-bold rounded-full ${getConditionColor(displayCondition)}`}>
                  {displayCondition}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
              <div className="flex items-center gap-2">
                <FaHeartbeat className="w-5 h-5 text-status-red-solid" />
                <h2 className="font-bold text-base-text-primary text-base">Riwayat Kunjungan Pemeriksaan Ibu Hamil</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
                <thead>
                  <tr className="border-b border-gray-100 font-bold text-base-text-secondary uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal Periksa</th>
                    <th className="py-3 px-4 text-center">BB (kg)</th>
                    <th className="py-3 px-4 text-center">TD (Tensi)</th>
                    <th className="py-3 px-4 text-center">Lila (cm)</th>
                    <th className="py-3 px-4 text-center">Fundus (cm)</th>
                    <th className="py-3 px-4 text-center">DJJ (Janin)</th>
                    <th className="py-3 px-4 text-center">Tablet Fe</th>
                    <th className="py-3 px-4">Catatan Posyandu</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold">
                  {motherDetail.maternal_records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-base-text-secondary">Belum ada riwayat pemeriksaan.</td>
                    </tr>
                  ) : (
                    motherDetail.maternal_records.map((r: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4 text-center text-brand-primary">{r.weight > 0 ? `${r.weight} kg` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-primary">{r.blood_pressure}</td>
                        <td className="py-3 px-4 text-center text-base-text-primary">{r.muac > 0 ? `${r.muac} cm` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.fundal_height > 0 ? `${r.fundal_height} cm` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.fetal_heart_rate > 0 ? `${r.fetal_heart_rate} x/mnt` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.iron_pills_given > 0 ? `${r.iron_pills_given} butir` : "-"}</td>
                        <td className="py-3 px-4 text-base-text-secondary italic">{r.cadre_notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Control cards / monitoring */}
      {(activeSection === "ttd" || activeSection === "weekly" || activeSection === "attendance" || activeSection === "birth_prep" || activeSection === "postpartum" || activeSection === "breastfeeding") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("?")}
              className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm"
            >
              <MdArrowBack className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black text-base-text-primary font-bold">
              {activeSection === "ttd" && "Tablet Tambah Darah (TTD)"}
              {activeSection === "weekly" && "Pemantauan Mingguan Ibu Hamil"}
              {activeSection === "attendance" && "Kelas Ibu Hamil"}
              {activeSection === "birth_prep" && "Rencana & Persiapan Persalinan"}
              {activeSection === "postpartum" && "Pemantauan Masa Nifas & Rencana KB"}
              {activeSection === "breastfeeding" && "Log Sukses Menyusui & Nutrisi ASI"}
            </h2>
          </div>

          {/* Subtab: TTD */}
          {activePemantauanTab === 'ttd' && (() => {
            const totalDays = new Date(currentYear, currentMonth, 0).getDate();
            const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
            const monthsIndonesian = [
              "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];
            const monthName = monthsIndonesian[currentMonth - 1];

            return (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2 bg-base-white shadow-sm">
                  <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                    <MdVaccines className="w-4 h-4" /> Kartu Minum Tablet Tambah Darah (TTD/MMS)
                  </h4>
                  <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                    Sesuai panduan Buku KIA 2024 Halaman 7. Ibu hamil wajib meminum paling sedikit 90 tablet tambah darah selama kehamilan untuk mencegah anemia dan mendukung perkembangan janin.
                  </p>
                </div>

                <div className="bg-base-white p-6 rounded-bento-lg border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase">Nama Pendamping Minum TTD</span>
                      {isEditingCompanion ? (
                        <input 
                          type="text" 
                          placeholder="Nama suami, orang tua, atau kader..."
                          value={ttdCompanion}
                          onChange={(e) => {
                            setTtdCompanion(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs font-bold text-base-text-primary"
                        />
                      ) : (
                        <p className="text-sm font-black text-base-text-primary">{ttdCompanion || "Belum ditentukan"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase">Hubungan Keluarga</span>
                      {isEditingCompanion ? (
                        <select 
                          value={ttdRelationship} 
                          onChange={(e) => setTtdRelationship(e.target.value)}
                          className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white text-xs font-bold text-base-text-primary cursor-pointer"
                        >
                          <option value="Suami">Suami</option>
                          <option value="Orang Tua">Orang Tua</option>
                          <option value="Saudara">Saudara</option>
                          <option value="Kader">Kader Posyandu</option>
                        </select>
                      ) : (
                        <p className="text-sm font-black text-base-text-primary">{ttdRelationship}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {isEditingCompanion ? (
                      <button 
                        onClick={handleSaveCompanion}
                        className="px-5 py-2.5 bg-status-green-solid hover:bg-status-green-solid/90 text-base-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <MdSave className="w-4 h-4" /> Simpan
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsEditingCompanion(true)}
                        className="px-5 py-2.5 bg-brand-primary hover:bg-status-pink-dark text-base-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <MdEdit className="w-4 h-4" /> Atur Pendamping
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
                    <span className="font-extrabold text-base-text-primary text-sm uppercase">Bulan: {monthName} {currentYear}</span>
                    <span className="text-[10px] font-bold text-brand-primary bg-brand-soft border border-brand-primary/20 px-3 py-1 rounded-full">
                      {ttdLogs.length} Hari Diminum
                    </span>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3 pt-2">
                    {daysArray.map((day) => {
                      const isTaken = ttdLogs.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => handleTtdCheck(day)}
                          className={`h-12 border rounded-2xl flex flex-col items-center justify-center relative transition cursor-pointer group hover:scale-105 ${
                            isTaken 
                              ? "bg-brand-primary border-brand-primary text-base-white shadow-md shadow-brand-primary/10" 
                              : "bg-base-white border-base-border/40 hover:border-brand-primary text-base-text-secondary hover:text-brand-primary"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{day}</span>
                          {isTaken && (
                            <MdCheckCircleOutline className="w-3.5 h-3.5 absolute bottom-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Subtab: Weekly */}
          {activePemantauanTab === 'weekly' && (() => {
            const weeks = Array.from({ length: 42 }, (_, i) => i + 1);
            return (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                <div className="bg-base-white p-4 rounded-xl border border-base-border/30 shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-base-text-primary">Pemantauan Mandiri Mingguan Ibu Hamil</h4>
                    <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                      Laporkan segera ke bidan jika Anda merasakan tanda-tanda bahaya di bawah.
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 select-none">
                    <button 
                      onClick={() => setWeeklyTrimesterFilter(1)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer border ${weeklyTrimesterFilter === 1 ? 'bg-[#EA2986] text-white border-[#EA2986]' : 'bg-base-white border-base-border/30 text-base-text-secondary hover:text-[#EA2986]'}`}
                    >
                      Trimester 1 (Mg 1-13)
                    </button>
                    <button 
                      onClick={() => setWeeklyTrimesterFilter(2)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer border ${weeklyTrimesterFilter === 2 ? 'bg-[#EA2986] text-white border-[#EA2986]' : 'bg-base-white border-base-border/30 text-base-text-secondary hover:text-[#EA2986]'}`}
                    >
                      Trimester 2 (Mg 14-27)
                    </button>
                    <button 
                      onClick={() => setWeeklyTrimesterFilter(3)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer border ${weeklyTrimesterFilter === 3 ? 'bg-[#EA2986] text-white border-[#EA2986]' : 'bg-base-white border-base-border/30 text-base-text-secondary hover:text-[#EA2986]'}`}
                    >
                      Trimester 3 (Mg 28-42)
                    </button>
                  </div>
                </div>

                <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 font-bold text-base-text-secondary uppercase tracking-wider">
                        <th className="py-3 px-4">Minggu Ke-</th>
                        <th className="py-3 px-4 text-center">Gerakan Janin Aktif (&ge;10x/12 jam)</th>
                        <th className="py-3 px-4 text-center">Kaki/Tangan/Wajah Bengkak</th>
                        <th className="py-3 px-4 text-center">Demam / Panas Tinggi</th>
                        <th className="py-3 px-4 text-center">Perdarahan Jalan Lahir</th>
                        <th className="py-3 px-4 text-center">Keluar Cairan Ketuban Sebelum Waktunya</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-semibold">
                      {weeks.filter(w => {
                        if (weeklyTrimesterFilter === 1) return w >= 1 && w <= 13;
                        if (weeklyTrimesterFilter === 2) return w >= 14 && w <= 27;
                        return w >= 28 && w <= 42;
                      }).map((w) => {
                        const rec = weeklyLogs.find(l => l.week_number === w) || {};
                        return (
                          <tr key={w} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-base-text-primary">Minggu {w}</td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={rec.fetal_movement || false}
                                onChange={() => handleWeeklyCheck(w, "fetal_movement")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={rec.swollen_feet || false}
                                onChange={() => handleWeeklyCheck(w, "swollen_feet")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={rec.fever || false}
                                onChange={() => handleWeeklyCheck(w, "fever")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={rec.bleeding || false}
                                onChange={() => handleWeeklyCheck(w, "bleeding")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={rec.premature_fluid || false}
                                onChange={() => handleWeeklyCheck(w, "premature_fluid")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Subtab: Attendance */}
          {activePemantauanTab === 'attendance' && (
            <div className="space-y-5 animate-in fade-in duration-200 text-xs">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2 bg-base-white shadow-sm">
                <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                  <MdFamilyRestroom className="w-4 h-4" /> Pemantauan Kehadiran Kelas Ibu Hamil
                </h4>
                <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                  Ibu hamil disarankan mengikuti minimal 3 kali pertemuan kelas ibu hamil untuk pembekalan persalinan, menyusui, dan perawatan bayi.
                </p>
              </div>

              <div className="bg-base-white p-6 rounded-bento-lg border border-base-border/30 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
                  <span className="font-bold text-base-text-primary text-sm uppercase">Log Kelas Ibu Hamil</span>
                  <button 
                    onClick={handleAddAttendanceClass}
                    className="px-4 py-2 bg-brand-primary hover:bg-status-pink-dark text-base-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition cursor-pointer text-xs"
                  >
                    <MdAdd className="w-4 h-4" /> Tambah Data Kelas
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
                  {attendance.map((classItem, idx) => {
                    const isEditing = editingAttendanceIdx === idx;
                    return (
                      <div key={idx} className="border border-base-border/30 rounded-2xl p-4 bg-base-bg/5 space-y-4 relative flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-2 border-base-border/10">
                            <span className="font-black text-brand-primary text-xs uppercase">Pertemuan Ke-{idx + 1}</span>
                            {!isEditing && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setEditingAttendanceIdx(idx)}
                                  className="p-1.5 text-brand-primary hover:bg-brand-soft rounded-lg transition"
                                  title="Edit Pertemuan"
                                >
                                  <MdEdit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm("Apakah Anda yakin ingin menghapus kelas pertemuan ini?")) {
                                      handleDeleteAttendanceClass(idx);
                                    }
                                  }}
                                  className="p-1.5 text-status-red-solid hover:bg-status-red-solid/10 rounded-lg transition"
                                  title="Hapus Pertemuan"
                                >
                                  <MdClose className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary uppercase">Tanggal Kelas</span>
                                <CustomDatePicker
                                  value={classItem.date}
                                  onChange={(val) => handleAttendanceChange(idx, "date", val)}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary uppercase">Fasilitator</span>
                                <input 
                                  type="text" 
                                  placeholder="Nama Bidan / Dokter..."
                                  value={classItem.facilitator || ""}
                                  onChange={(e) => handleAttendanceChange(idx, "facilitator", e.target.value)}
                                  className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white text-xs font-bold text-base-text-primary"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary uppercase">Catatan</span>
                                <input 
                                  type="text" 
                                  placeholder="Catatan kelas..."
                                  value={classItem.note || ""}
                                  onChange={(e) => handleAttendanceChange(idx, "note", e.target.value)}
                                  className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white text-xs font-bold text-base-text-primary"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary block">Tanggal Kelas</span>
                                <p className="text-sm font-black text-base-text-primary">{classItem.date || "-"}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary block">Fasilitator</span>
                                <p className="text-sm font-black text-base-text-primary">{classItem.facilitator || "-"}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-base-text-secondary block">Catatan</span>
                                <p className="text-sm font-black text-base-text-primary">{classItem.note || "-"}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {isEditing && (
                          <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-base-border/10">
                            <button 
                              onClick={() => setEditingAttendanceIdx(null)}
                              className="px-3 py-1.5 border border-base-border/50 text-base-text-secondary hover:text-base-text-primary hover:bg-base-bg font-bold rounded-lg transition cursor-pointer text-[10px]"
                            >
                              Batal
                            </button>
                            <button 
                              onClick={() => handleSaveSingleAttendance(idx)}
                              className="px-3 py-1.5 bg-status-green-solid hover:bg-status-green-solid/90 text-base-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition cursor-pointer text-[10px]"
                            >
                              <MdSave className="w-3 h-3" /> Simpan
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* Subtab: Birth Prep */}
          {activePemantauanTab === 'birth_prep' && (() => {
            const preps = [
              "1. Rencana melahirkan ditolong oleh Dokter/Bidan",
              "2. Rencana tempat melahirkan di Rumah Sakit/Puskesmas/Klinik",
              "3. Pendamping persalinan (suami, keluarga, atau kader)",
              "4. Transportasi/kendaraan siap pakai saat dibutuhkan",
              "5. Calon pendonor darah yang sudah disiapkan & cocok golongannya",
              "6. Dana darurat persalinan sudah disiapkan (BPJS/Pribadi)",
              "7. Surat-surat administrasi (KTP, KK, KIA, BPJS)",
              "8. Metode KB pasca persalinan yang sudah dipilih",
              "9. Perlengkapan bayi & ibu sudah siap dimasukkan tas koper",
              "10. Rencana IMD (Inisiasi Menyusu Dini) sudah dibahas dengan nakes"
            ];
            const checklistItems = [
              "1. Ibu bersalin ditolong oleh tenaga kesehatan kompeten",
              "2. Persalinan dilakukan di fasilitas pelayanan kesehatan (Klinik/Puskesmas/RS)",
              "3. Dilakukan IMD (Inisiasi Menyusu Dini) minimal 1 jam setelah lahir",
              "4. Bayi baru lahir mendapatkan suntikan Vitamin K1 langsung",
              "5. Bayi baru lahir mendapatkan salep mata antibiotik profilaksis",
              "6. Bayi baru lahir mendapatkan imunisasi Hepatitis B0 (HB-0)",
              "7. Ibu mendapatkan Tablet Tambah Darah (TTD) nifas & Vitamin A kapsul merah"
            ];

            return (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs font-semibold">
                <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2 bg-base-white shadow-sm">
                  <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                    <MdBabyChangingStation className="w-4 h-4" /> Checklist Persiapan &amp; Proses Persalinan (Buku KIA Hlm. 9-10)
                  </h4>
                  <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                    Persiapkan hal-hal di bawah minimal sejak trimester 3 agar proses persalinan berjalan aman dan terencana, serta ikuti langkah-langkah log persalinan saat melahirkan.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
                      <span className="font-bold text-base-text-primary text-sm uppercase">Checklist Persiapan Ibu (P4K)</span>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-soft border border-brand-primary/20 px-3 py-1 rounded-full">
                        {prepList.filter(Boolean).length} dari {preps.length} Terpenuhi
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {preps.map((prepText, idx) => (
                        <div key={idx} className="py-3.5 flex items-start gap-4">
                          <input 
                            type="checkbox" 
                            checked={prepList[idx] || false}
                            onChange={() => handlePrepToggle(idx)}
                            className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                          />
                          <span className={`font-semibold text-xs leading-relaxed ${prepList[idx] ? 'text-base-text-secondary line-through' : 'text-base-text-primary'}`}>{prepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
                      <span className="font-bold text-base-text-primary text-sm uppercase">Proses Persalinan &amp; IMD</span>
                      <span className="text-[10px] font-bold text-brand-primary bg-brand-soft border border-brand-primary/20 px-3 py-1 rounded-full">
                        {birthProcessList.filter(Boolean).length} dari {checklistItems.length} Selesai
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {checklistItems.map((itemText, idx) => (
                        <div key={idx} className="py-3.5 flex items-start gap-4">
                          <input 
                            type="checkbox" 
                            checked={birthProcessList[idx] || false}
                            onChange={() => handleProcessToggle(idx)}
                            className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                          />
                          <span className={`font-semibold text-xs leading-relaxed ${birthProcessList[idx] ? 'text-base-text-secondary line-through' : 'text-base-text-primary'}`}>{itemText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}



          {/* Subtab: Postpartum */}
          {activePemantauanTab === 'postpartum' && (
            <div className="space-y-5 animate-in fade-in duration-200 text-xs">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Postpartum logs */}
                <div className="xl:col-span-8 space-y-4">
                  <div className="bg-base-white p-4 rounded-xl border border-base-border/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 w-full sm:w-auto">
                      <h4 className="font-bold text-sm text-base-text-primary">Pemantauan Ibu Nifas (Masa Nifas 42 Hari)</h4>
                      <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                        Sesuai Buku KIA Halaman 12-14. Ibu nifas memantau tanda bahaya &amp; asupan nutrisi harian.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      <span className="font-bold text-[10px] text-base-text-secondary uppercase">Minggu Ke:</span>
                      {[1, 2, 3, 4, 5, 6].map((w) => (
                        <button
                          key={w}
                          onClick={() => setPostpartumFilter(w)}
                          className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center cursor-pointer transition ${postpartumFilter === w ? 'bg-brand-primary border-brand-primary text-base-white' : 'bg-base-white border-base-border/30 text-base-text-secondary hover:text-brand-primary'}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 font-bold text-base-text-secondary uppercase tracking-wider">
                          <th className="py-3 px-4 w-20">Hari Ke-</th>
                          <th className="py-3 px-4 text-center">Pemeriksaan Nifas (N1-N4)</th>
                          <th className="py-3 px-4 text-center">Vitamin A</th>
                          <th className="py-3 px-4 text-center">Tablet TTD</th>
                          <th className="py-3 px-4 text-center">Gizi Sesuai</th>
                          <th className="py-3 px-4 text-center">Demam</th>
                          <th className="py-3 px-4 text-center">Sakit Kepala</th>
                          <th className="py-3 px-4 text-center">Payudara Bengkak</th>
                          <th className="py-3 px-4 text-center">Cairan Bau</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-semibold">
                        {postpartumList.filter(item => {
                          const day = item.day;
                          const startDay = (postpartumFilter - 1) * 7 + 1;
                          const endDay = postpartumFilter * 7;
                          return day >= startDay && day <= endDay;
                        }).map((item) => (
                          <tr key={item.day} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-base-text-primary">Hari {item.day}</td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.pemeriksaan_nifas || false}
                                onChange={() => handlePostpartumToggle(item.day, "pemeriksaan_nifas")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.vitamin_a || false}
                                onChange={() => handlePostpartumToggle(item.day, "vitamin_a")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.ttd || false}
                                onChange={() => handlePostpartumToggle(item.day, "ttd")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.gizi_sesuai || false}
                                onChange={() => handlePostpartumToggle(item.day, "gizi_sesuai")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.demam || false}
                                onChange={() => handlePostpartumToggle(item.day, "demam")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.sakit_kepala || item.pandangan_kabur || false}
                                onChange={() => handlePostpartumToggle(item.day, "sakit_kepala")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.payudara_bengkak || false}
                                onChange={() => handlePostpartumToggle(item.day, "payudara_bengkak")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input 
                                type="checkbox" 
                                checked={item.darah_bau || false}
                                onChange={() => handlePostpartumToggle(item.day, "darah_bau")}
                                className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4 w-4 cursor-pointer"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: KB Consent */}
                <div className="xl:col-span-4 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-5">
                  <div className="border-b pb-3 border-base-border/10">
                    <span className="font-bold text-base-text-primary text-sm uppercase">Persetujuan &amp; Rencana KB</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-xl flex items-start gap-4">
                      <input 
                        type="checkbox" 
                        checked={kbAnswers[0] || false}
                        onChange={() => handleKbAnswerToggle(0)}
                        className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-base-text-primary">1. Konseling Awal (Buku KIA)</h4>
                        <p className="text-[11px] text-base-text-secondary mt-1 font-semibold">
                          Sudah mendapatkan informasi lengkap tentang metode kontrasepsi jangka panjang (MKJP/IUD/Implan) dan jangka pendek (Suntik, Pil, Kondom) dari kader atau bidan.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl flex items-start gap-4">
                      <input 
                        type="checkbox" 
                        checked={kbAnswers[1] || false}
                        onChange={() => handleKbAnswerToggle(1)}
                        className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-base-text-primary">2. Diskusi dengan Pasangan</h4>
                        <p className="text-[11px] text-base-text-secondary mt-1 font-semibold">
                          Ibu sudah mendiskusikan keputusan KB pasca melahirkan bersama suami/keluarga terdekat.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl flex items-start gap-4">
                      <input 
                        type="checkbox" 
                        checked={kbAnswers[2] || false}
                        onChange={() => handleKbAnswerToggle(2)}
                        className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-base-text-primary">3. Metode Terpilih Disepakati</h4>
                        <p className="text-[11px] text-base-text-secondary mt-1 font-semibold">
                          Sudah menyepakati metode kontrasepsi yang akan dipasang segera setelah melahirkan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-brand-soft/20 border border-brand-primary/10 rounded-xl flex flex-col gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-brand-primary">Persetujuan KB Pasca Persalinan</h4>
                      <p className="text-[10px] text-base-text-secondary leading-relaxed font-semibold">
                        Kami menyatakan setuju dan merencanakan ber-KB setelah melahirkan.
                      </p>
                    </div>
                    <button 
                      onClick={handleKbConsentToggle}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${kbConsent ? 'bg-status-green-solid text-white hover:bg-status-green-solid/90' : 'bg-brand-primary text-white hover:bg-status-pink-dark'}`}
                    >
                      {kbConsent ? <><MdCheckCircleOutline className="w-4 h-4" /> Sudah Disetujui</> : "Setujui Rencana KB"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Breastfeeding */}
          {activePemantauanTab === 'breastfeeding' && (() => {
            const checks = [
              "1. Bayi disusui segera setelah lahir (IMD/Inisiasi Menyusu Dini)",
              "2. Bayi hanya diberikan ASI saja (ASI Eksklusif), tidak diberi madu, susu formula, air putih, dll",
              "3. Bayi disusui secara 'On Demand' (kapan pun bayi meminta, minimal 8-12 kali sehari siang & malam)",
              "4. Posisi menyusui sudah benar (seluruh badan bayi disangga, kepala lurus menghadap payudara)",
              "5. Pelekatan payudara sudah benar (dagu menempel payudara, areola sebagian besar masuk mulut bayi)",
              "6. Bayi menyusu dengan tenang, terdengar bunyi menelan, dan payudara terasa kosong setelah disusui",
              "7. Bayi sering kencing (minimal 6 kali sehari dengan air kencing jernih/kekuningan)",
              "8. Tinja/BAB bayi berwarna kekuningan/keemasan tanpa darah atau lendir",
              "9. Ibu makan porsi gizi seimbang dengan asupan sayuran hijau & buah yang mencukupi",
              "10. Ibu meminum air putih yang cukup (minimal 3 liter sehari) agar produksi ASI lancar",
              "11. Ibu tidak meminum ramuan/jamu/obat herbal yang tidak direkomendasikan bidan posyandu",
              "12. Bayi tertidur tenang selama 1-2 jam setelah menyusu secara puas"
            ];

            return (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2 bg-base-white shadow-sm">
                  <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                    <MdCheckCircleOutline className="w-4 h-4" /> Lembar Evaluasi &amp; Monitoring ASI Eksklusif 0-6 Bulan
                  </h4>
                  <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                    Panduan Buku KIA untuk mengukur keberhasilan pemberian ASI eksklusif dan mendeteksi sedini mungkin kendala menyusui.
                  </p>
                </div>

                <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
                    <span className="font-bold text-base-text-primary text-sm uppercase">Checklist Sukses Menyusui</span>
                    <span className="text-[10px] font-bold text-brand-primary bg-brand-soft border border-brand-primary/20 px-3 py-1 rounded-full">
                      {breastfeedingAnswers.filter(Boolean).length} dari {checks.length} Terpenuhi
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {checks.map((checkText, idx) => (
                      <div key={idx} className="py-3.5 flex items-start gap-4">
                        <input 
                          type="checkbox" 
                          checked={breastfeedingAnswers[idx] || false}
                          onChange={() => handleBreastfeedingToggle(idx)}
                          className="rounded text-brand-primary border-base-border/50 focus:ring-brand-primary h-4.5 w-4.5 mt-0.5 cursor-pointer shrink-0"
                        />
                        <span className={`font-semibold text-xs leading-relaxed ${breastfeedingAnswers[idx] ? 'text-base-text-secondary line-through' : 'text-base-text-primary'}`}>{checkText}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default function PerjalananIbuPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PerjalananIbuContent />
    </Suspense>
  );
}
