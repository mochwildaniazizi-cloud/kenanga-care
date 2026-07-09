"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdOutlineError, MdPerson, MdCalendarMonth, MdPregnantWoman,
  MdPhone, MdBloodtype, MdMale, MdFemale, MdVaccines, MdEdit,
  MdCheckCircleOutline, MdBabyChangingStation, MdFamilyRestroom
} from "react-icons/md";
import { FaUserNurse, FaUserFriends, FaHeartbeat, FaUser, FaFileMedical } from "react-icons/fa";
import { getMothersData, getMaternalHistory, getMotherMetrics, getLoggedInMotherData, getMotherDetail, getLoggedInMotherDetail } from "@/app/actions/mothers";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { getWeeklyMonitorings, upsertWeeklyMonitoring } from "@/app/actions/weekly";
import { useUserRole } from "@/context/UserRoleContext";
import { FiRefreshCw } from "react-icons/fi";
import CustomDatePicker from "@/components/CustomDatePicker";

// ==========================================
// 2. SUB-KOMPONEN BANTUAN
// ==========================================

interface StatMetricCardProps {
  icon: any;
  title: string;
  children: React.ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  barColor: string;
  barPercentage?: number;
  isLoading?: boolean;
}

function StatMetricCard({ icon: Icon, title, children, iconBgColor, iconTextColor, barColor, barPercentage = 40, isLoading }: StatMetricCardProps) {
  return (
    <div className="bg-base-white p-6 pb-8 rounded-xl shadow-sm border border-base-border/30 relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${iconBgColor} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${iconTextColor}`} />
        </div>
        <div className="space-y-1 w-full">
          <p className="text-sm font-bold text-base-text-primary mb-1 leading-tight">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <div className="flex items-baseline gap-1.5 flex-wrap font-medium">
              {children}
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-3 left-6 right-6 h-1 rounded-lg bg-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="h-full w-full bg-gray-300 animate-pulse rounded-lg"></div>
        ) : (
          <div className={`h-full ${barColor} rounded-lg transition-all duration-1000 ease-in-out`} style={{ width: `${barPercentage}%` }}></div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Normal") {
    return (
      <span className="px-3 py-1 bg-status-green-light text-status-green-solid border border-status-green-solid/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        Normal
      </span>
    );
  }
  if (status.includes("KEK") || status.includes("Risiko")) {
    return (
      <span className="px-3 py-1 bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        {status}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-brand-soft text-brand-primary border border-brand-primary/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
      {status}
    </span>
  );
}

function MotherTypeBadge({ type }: { type: string }) {
  if (type === "Calon Ibu") {
    return (
      <span className="px-3 py-1 bg-status-pink-light text-brand-primary border border-brand-primary/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        Calon Ibu
      </span>
    );
  }
  if (type === "Ibu Hamil") {
    return (
      <span className="px-3 py-1 bg-status-blue-light text-status-blue-solid border border-status-blue-solid/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        Ibu Hamil
      </span>
    );
  }
  if (type === "Ibu Nifas") {
    return (
      <span className="px-3 py-1 bg-status-purple-light text-status-purple-solid border border-status-purple-solid/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        Ibu Nifas
      </span>
    );
  }
  if (type === "Ibu Balita") {
    return (
      <span className="px-3 py-1 bg-status-green-light text-status-green-solid border border-status-green-solid/25 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
        Ibu Balita
      </span>
    );
  }
  // Fallback
  return (
    <span className="px-3 py-1 bg-base-bg text-base-text-secondary border border-base-border/30 text-xs font-semibold rounded-full whitespace-nowrap inline-block">
      {type}
    </span>
  );
}


// ==========================================
// 3. KOMPONEN UTAMA HALAMAN
// ==========================================
export default function DataIbuPage() {
  const { role, username } = useUserRole();
  const [motherDetail, setMotherDetail] = useState<any>(null);
  const [isLoadingMother, setIsLoadingMother] = useState(true);
  const [activeIbuSubTab, setActiveIbuSubTab] = useState<'ibu' | 'husband' | 'health'>('ibu');
  const [activePemantauanTab, setActivePemantauanTab] = useState<'ttd' | 'weekly' | 'attendance' | 'birth_prep' | 'birth_process' | 'postpartum' | 'kb' | 'breastfeeding'>('ttd');
  const [breastfeedingAnswers, setBreastfeedingAnswers] = useState<boolean[]>(new Array(12).fill(false));
  
  const [attendance, setAttendance] = useState([
    { date: "", note: "" },
    { date: "", note: "" },
    { date: "", note: "" }
  ]);
  const [isEditingAttendance, setIsEditingAttendance] = useState(false);
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
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const cachedAttendance = localStorage.getItem(`attendance_class_ibu_hamil_${motherId}`);
    if (cachedAttendance) {
      try {
        setAttendance(JSON.parse(cachedAttendance));
      } catch (e) {}
    } else {
      setAttendance([
        { date: "", note: "" },
        { date: "", note: "" },
        { date: "", note: "" }
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
        console.error("Failed to load TTD logs", err);
      }
    }
    fetchTtdData();
  }, [motherDetail]);

  useEffect(() => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const cacheKey = `offline_weekly_monitoring_${motherId}`;
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setWeeklyLogs(JSON.parse(cached));
      } catch (e) {}
    }

    if (!navigator.onLine) return;

    getWeeklyMonitorings(motherId).then((res) => {
      if (res && res.success) {
        setWeeklyLogs(res.list || []);
        localStorage.setItem(cacheKey, JSON.stringify(res.list || []));
      }
    });
  }, [motherDetail]);

  const handleToggleWeekly = async (weekNumber: number, field: string) => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const cacheKey = `offline_weekly_monitoring_${motherId}`;

    let updatedLogs = [...weeklyLogs];
    const logIndex = updatedLogs.findIndex((l: any) => l.week_number === weekNumber);
    let record: any = {};
    if (logIndex >= 0) {
      record = {
        ...updatedLogs[logIndex],
        [field]: !updatedLogs[logIndex][field]
      };
      updatedLogs[logIndex] = record;
    } else {
      record = {
        week_number: weekNumber,
        check_pregnancy: false,
        check_class: false,
        fever: false,
        headache: false,
        insomnia: false,
        cough: false,
        fetal_movement: false,
        stomach_pain: false,
        fluid_discharge: false,
        urination_pain: false,
        diarrhea: false,
        [field]: true
      };
      updatedLogs.push(record);
    }
    setWeeklyLogs(updatedLogs);
    localStorage.setItem(cacheKey, JSON.stringify(updatedLogs));

    if (navigator.onLine) {
      try {
        await upsertWeeklyMonitoring(motherId, weekNumber, record);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const [mothersList, setMothersList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalMothers: 0, mothersKek: 0, highRiskPregnancies: 0, dueThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [motherSearch, setMotherSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);

  // Filter States
  const [showMotherFilter, setShowMotherFilter] = useState(false);
  const [motherFilterStatus, setMotherFilterStatus] = useState("");
  const [motherFilterCondition, setMotherFilterCondition] = useState("");

  const [showHistoryFilter, setShowHistoryFilter] = useState(false);
  const [historyFilterCondition, setHistoryFilterCondition] = useState("");

  // Sort states for Ibu list
  const [motherSortField, setMotherSortField] = useState<"name" | "age" | "status" | "condition" | null>("name");
  const [motherSortOrder, setMotherSortOrder] = useState<"asc" | "desc">("asc");

  // Sort states for History list
  const [historySortField, setHistorySortField] = useState<"name" | "date" | "status" | null>(null);
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("asc");

  const handleMotherSort = (field: "name" | "age" | "status" | "condition") => {
    if (motherSortField === field) {
      setMotherSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setMotherSortField(field);
      setMotherSortOrder("asc");
    }
  };

  const handleHistorySort = (field: "name" | "date" | "status") => {
    if (historySortField === field) {
      setHistorySortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setHistorySortField(field);
      setHistorySortOrder("asc");
    }
  };

  const handleToggleTtd = async (day: number) => {
    if (!motherDetail) return;
    const motherId = motherDetail.mother_id;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isCurrentlyTaken = ttdLogs.some(l => l.intake_date === dateStr && l.taken);
    const newTakenState = !isCurrentlyTaken;

    // Save companion to cache
    localStorage.setItem(`ttd_companion_${motherId}`, ttdCompanion);
    localStorage.setItem(`ttd_relationship_${motherId}`, ttdRelationship);

    let updatedLogs = [...ttdLogs];
    const logIndex = updatedLogs.findIndex(l => l.intake_date === dateStr);
    if (logIndex >= 0) {
      updatedLogs[logIndex] = {
        ...updatedLogs[logIndex],
        taken: newTakenState,
        companion: ttdCompanion,
        relationship: ttdRelationship
      };
    } else {
      updatedLogs.push({
        intake_date: dateStr,
        taken: newTakenState,
        companion: ttdCompanion,
        relationship: ttdRelationship
      });
    }
    setTtdLogs(updatedLogs);

    const cacheKey = `offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      logs: updatedLogs,
      companion: ttdCompanion,
      relationship: ttdRelationship
    }));

    if (navigator.onLine) {
      try {
        await upsertTtdLog(motherId, dateStr, newTakenState, ttdCompanion, ttdRelationship);
      } catch (err) {
        console.error("Failed to upsert TTD log:", err);
      }
    }
  };

  const loadData = async (forceRefresh = false) => {
    if (!navigator.onLine) {
      if (forceRefresh) alert("Perangkat Anda offline. Tidak dapat menyegarkan data dari server.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    
    const cachedMothers = localStorage.getItem("offline_mothers_list");
    if (!cachedMothers && !forceRefresh) {
      setIsLoading(true);
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    }

    try {
      const [mothers, history, fetchedMetrics] = await Promise.all([
        getMothersData(),
        getMaternalHistory(),
        getMotherMetrics()
      ]);
      setMothersList(mothers);
      setHistoryList(history);
      setMetrics(fetchedMetrics);
      
      localStorage.setItem("offline_mothers_list", JSON.stringify(mothers));
      localStorage.setItem("offline_mothers_history", JSON.stringify(history));
      localStorage.setItem("offline_mothers_metrics", JSON.stringify(fetchedMetrics));
    } catch (error: any) {
      console.error("Failed to load data:", error);
      if (forceRefresh) {
        alert("Gagal memuat data dari server. Pastikan skema database Anda sudah disinkronkan dengan menjalankan 'npx prisma db push' di terminal.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cachedMothers = localStorage.getItem("offline_mothers_list");
    const cachedHistory = localStorage.getItem("offline_mothers_history");
    const cachedMetrics = localStorage.getItem("offline_mothers_metrics");

    if (cachedMothers) setMothersList(JSON.parse(cachedMothers));
    if (cachedHistory) setHistoryList(JSON.parse(cachedHistory));
    if (cachedMetrics) setMetrics(JSON.parse(cachedMetrics));
    
    if (cachedMothers || cachedHistory || cachedMetrics) {
      setIsLoading(false);
    }

    if (navigator.onLine) {
      loadData(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      loadData(false);
    };
    window.addEventListener("sync-data", handleSync);
    return () => window.removeEventListener("sync-data", handleSync);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [motherSearch, itemsPerPage, motherFilterStatus, motherFilterCondition, motherSortField, motherSortOrder]);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [historySearch, historyItemsPerPage, historyFilterCondition, historySortField, historySortOrder]);

  const filteredMothers = mothersList.filter(mother => {
    const matchesSearch = mother.name.toLowerCase().includes(motherSearch.toLowerCase());
    const matchesStatus = motherFilterStatus === "" || mother.status === motherFilterStatus;
    const matchesCondition = motherFilterCondition === "" || mother.condition === motherFilterCondition;
    
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const sortedMothers = [...filteredMothers].sort((a, b) => {
    if (!motherSortField) return 0;
    
    let comparison = 0;
    if (motherSortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (motherSortField === "age") {
      comparison = (a.rawAge || 0) - (b.rawAge || 0);
    } else if (motherSortField === "status") {
      comparison = a.status.localeCompare(b.status);
    } else if (motherSortField === "condition") {
      comparison = a.condition.localeCompare(b.condition);
    }

    return motherSortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedMothers.length / itemsPerPage);
  const paginatedMothers = sortedMothers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(historySearch.toLowerCase());
    const matchesCondition = historyFilterCondition === "" || item.status === historyFilterCondition;
    
    return matchesSearch && matchesCondition;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (!historySortField) return 0;

    let comparison = 0;
    if (historySortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (historySortField === "date") {
      comparison = new Date(a.rawDate || 0).getTime() - new Date(b.rawDate || 0).getTime();
    } else if (historySortField === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return historySortOrder === "asc" ? comparison : -comparison;
  });

  const totalHistoryPages = Math.ceil(sortedHistory.length / historyItemsPerPage);
  const paginatedHistory = sortedHistory.slice(
    (currentHistoryPage - 1) * historyItemsPerPage,
    currentHistoryPage * historyItemsPerPage
  );

  const calculatePercentage = (value: number) => {
    if (metrics.totalMothers === 0) return 0;
    return Math.round((value / metrics.totalMothers) * 100);
  };

  if (role === "ibu") {
    if (isLoadingMother) {
      return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-pulse">
          {/* Mother Identity Card Skeleton */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 h-28">
            <div className="flex items-center gap-4 w-full">
              <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
              <div className="space-y-2 w-full max-w-sm">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Grid Stats Bento Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-base-white p-5 rounded-bento-lg border border-base-border/30 h-28 flex flex-col justify-between">
                <div className="h-4 w-12 bg-gray-100 rounded"></div>
                <div className="h-6 w-20 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>

          {/* History Table Skeleton */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 h-80">
            <div className="h-5 w-48 bg-gray-100 rounded"></div>
            <div className="h-full mt-4 bg-gray-50 rounded"></div>
          </div>
        </div>
      );
    }

    if (!motherDetail) {
      return (
        <div className="bg-base-white p-8 rounded-xl shadow-sm border border-base-border/30 text-center">
          <p className="text-base-text-secondary font-bold">Data Kesehatan tidak ditemukan.</p>
        </div>
      );
    }

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

    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
        
        {/* Offline Warning Banner */}
        {!navigator.onLine && (
          <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
            <span className="text-sm">⚠️</span>
            <span>Mode Offline: Menampilkan data cadangan lokal dari Beranda. Sambungkan ke internet untuk menyinkronkan data pemeriksaan terbaru.</span>
          </div>
        )}

        {/* Header Profil */}
        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Bento Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Identitas & Kehamilan */}
          <div className="lg:col-span-12 space-y-6">
            
            {/* Card: TABBED BENTO CONTAINER */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden">
              {/* Tabs Selector */}
              <div className="flex border-b text-xs font-bold text-base-text-secondary select-none">
                <button 
                  type="button" 
                  onClick={() => setActiveIbuSubTab('ibu')}
                  className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activeIbuSubTab === 'ibu' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <FaUser className="w-3.5 h-3.5" /> Identitas Ibu
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveIbuSubTab('husband')}
                  className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activeIbuSubTab === 'husband' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <FaUserFriends className="w-3.5 h-3.5" /> Suami / Keluarga
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveIbuSubTab('health')}
                  className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activeIbuSubTab === 'health' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <FaFileMedical className="w-3.5 h-3.5" /> Riwayat &amp; Risiko
                </button>
              </div>

              {/* Content Body */}
              <div className="p-6">
                
                {/* TAB 1: IDENTITAS IBU */}
                {activeIbuSubTab === 'ibu' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. JKN / BPJS</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.jkn_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tempat Lahir</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.birth_place || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tanggal Lahir</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.dob}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Golongan Darah</span>
                      <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                        <MdBloodtype className="w-4 h-4 text-status-red-solid" /> {motherDetail.blood_type || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Pendidikan</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.education || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Pekerjaan</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.occupation || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. Telepon / WA</span>
                      <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                        <MdPhone className="w-3.5 h-3.5 text-base-text-secondary" /> {motherDetail.phone_number || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Faskes Tingkat 1</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.faskes_1 || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Faskes Rujukan</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.faskes_referral || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Puskesmas Domisili</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.puskesmas_domicile || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. Reg Kohort Ibu</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.cohort_register_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. Catatan Medik RS</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.medical_record_number || "-"}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-base-text-secondary block">Alamat Rumah</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.address || "-"}</p>
                    </div>

                    <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Pembiayaan Lain</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.other_financing || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Asuransi Lain</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.insurance_other || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Nomor Asuransi</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.insurance_number || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.insurance_validity || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: IDENTITAS SUAMI */}
                {activeIbuSubTab === 'husband' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Nama Lengkap Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_name || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">NIK Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_national_id || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. JKN / BPJS Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_jkn_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tempat Lahir Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_birth_place || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tanggal Lahir Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_birth_date || "-"}</p>
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
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Faskes Tingkat 1 Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_faskes_1 || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Faskes Rujukan Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_faskes_referral || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">No. Catatan Medik RS Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_medical_record_number || "-"}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-base-text-secondary block">Alamat Rumah Suami</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_address || "-"}</p>
                    </div>
                    
                    <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Pembiayaan Lain Suami</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_other_financing || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Asuransi Lain Suami</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_insurance_other || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Nomor Asuransi Suami</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_insurance_number || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi Suami</span>
                        <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_insurance_validity || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: RIWAYAT KESEHATAN IBU */}
                {activeIbuSubTab === 'health' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Kehamilan Ke-</span>
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{motherDetail.pregnancy_number ?? "1"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Jumlah Anak Lahir Hidup</span>
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{motherDetail.children_born_alive ?? "0"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Riwayat Keguguran</span>
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{motherDetail.miscarriage_history ?? "0"} kali</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Jumlah Anak Hidup Posyandu</span>
                      <p className="text-sm font-bold text-base-text-primary">{motherDetail.number_of_children} anak</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-base-text-secondary block">Riwayat Penyakit Ibu</span>
                      <p className="text-sm font-bold text-base-text-primary italic">{motherDetail.disease_history || "-"}</p>
                    </div>

                    <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-3 gap-4">
                      <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Status Ibu</span>
                        <p className="text-xs font-bold text-base-text-primary mt-1">{motherDetail.status}</p>
                      </div>
                      <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Kondisi Risiko</span>
                        <span className={`inline-block mt-1 px-2 py-0.5 border text-[10px] font-bold rounded-full ${getConditionColor(motherDetail.condition)}`}>
                          {motherDetail.condition}
                        </span>
                      </div>
                      <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-base-text-secondary uppercase block">HPL / Bersalin</span>
                        <p className="text-xs font-bold text-base-text-primary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{motherDetail.hpl}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: PEMANTAUAN MANDIRI (TTD & MINGGUAN) */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden mt-6">
              {/* Tabs Selector for Card 2 */}
              <div className="flex border-b text-xs font-bold text-base-text-secondary select-none flex-wrap">
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('ttd')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'ttd' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdVaccines className="w-3.5 h-3.5" /> Checklist TTD / MMS
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('weekly')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'weekly' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdCalendarMonth className="w-3.5 h-3.5" /> Pemantauan Mingguan
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('attendance')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'attendance' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdEdit className="w-3.5 h-3.5" /> Absensi Kelas
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('birth_prep')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'birth_prep' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdCalendarMonth className="w-3.5 h-3.5" /> Persiapan Melahirkan
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('birth_process')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'birth_process' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdCheckCircleOutline className="w-3.5 h-3.5" /> Proses Melahirkan
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('postpartum')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'postpartum' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdBabyChangingStation className="w-3.5 h-3.5" /> Pemantauan Nifas
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('kb')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'kb' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdFamilyRestroom className="w-3.5 h-3.5" /> KB Pasca Salin
                </button>
                <button 
                  type="button" 
                  onClick={() => setActivePemantauanTab('breastfeeding')}
                  className={`flex-1 min-w-[120px] py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition cursor-pointer ${activePemantauanTab === 'breastfeeding' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
                >
                  <MdPregnantWoman className="w-3.5 h-3.5" /> Menyusui & Nutrisi
                </button>
              </div>

              {/* Content Body for Card 2 */}
              <div className="p-6">
                
                {/* TAB 4: CHECKLIST TTD */}
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
                      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2">
                        <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                          <MdVaccines className="w-4 h-4" /> Kartu Minum Tablet Tambah Darah (TTD/MMS)
                        </h4>
                        <p className="text-base-text-secondary text-[11px] leading-relaxed">
                          Sesuai panduan Buku KIA 2024 Halaman 7. Ibu hamil wajib meminum paling sedikit 90 tablet tambah darah selama kehamilan untuk mencegah anemia dan mendukung perkembangan janin.
                        </p>
                      </div>

                      <div className="bg-base-bg/20 p-4 rounded-xl border border-base-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                  if (motherDetail) {
                                    localStorage.setItem(`ttd_companion_${motherDetail.mother_id}`, e.target.value);
                                  }
                                }}
                                className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary text-base-text-primary transition"
                              />
                            ) : (
                              <p className="text-sm font-bold text-base-text-primary">{ttdCompanion || "Belum diatur"}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary uppercase">Hubungan dengan Ibu</span>
                            {isEditingCompanion ? (
                              <select
                                value={ttdRelationship}
                                onChange={(e) => {
                                  setTtdRelationship(e.target.value);
                                  if (motherDetail) {
                                    localStorage.setItem(`ttd_relationship_${motherDetail.mother_id}`, e.target.value);
                                  }
                                }}
                                className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary text-base-text-primary transition appearance-none cursor-pointer"
                              >
                                <option value="Suami">Suami</option>
                                <option value="Orang Tua">Orang Tua / Ibu Kandung</option>
                                <option value="Mertua">Mertua</option>
                                <option value="Kader">Kader Posyandu</option>
                                <option value="Lainnya">Lainnya</option>
                              </select>
                            ) : (
                              <p className="text-sm font-bold text-base-text-primary">{ttdRelationship || "Suami"}</p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center self-end md:self-center">
                          {isEditingCompanion ? (
                            <button
                              type="button"
                              onClick={() => setIsEditingCompanion(false)}
                              className="px-4 py-2 bg-brand-primary text-base-white hover:bg-status-pink-dark text-xs font-bold rounded-lg shadow-sm cursor-pointer transition"
                            >
                              Selesai
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsEditingCompanion(true)}
                              className="px-3.5 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
                            >
                              <MdEdit className="w-3.5 h-3.5" /> Ubah Pendamping
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Calendar Grid 1-31 */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-base-text-primary">
                            Lembar Pantauan: <span className="text-brand-primary">{monthName} {currentYear}</span>
                          </span>
                          <span className="text-[10px] text-base-text-secondary italic">
                            * Ketuk tanggal untuk menandai
                          </span>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center">
                          {daysArray.map((day) => {
                            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isTaken = ttdLogs.some((l: any) => l.intake_date === dateStr && l.taken);
                            const isToday = today.getDate() === day && today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear;

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleToggleTtd(day)}
                                className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer font-bold relative border ${
                                  isTaken 
                                    ? "bg-brand-primary text-base-white border-brand-primary shadow-sm hover:bg-status-pink-dark" 
                                    : isToday
                                    ? "bg-base-white text-brand-primary border-brand-primary border-2 shadow-sm"
                                    : "bg-base-bg/30 text-base-text-secondary border-base-border/25 hover:border-brand-primary/40 hover:bg-base-bg/65"
                                }`}
                              >
                                <span className="text-xs">{day}</span>
                                {isTaken && (
                                  <span className="text-[8px] mt-0.5 leading-none block font-medium uppercase text-pink-100">taken</span>
                                )}
                                {isToday && !isTaken && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-status-orange-solid animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 text-[10px] text-base-text-secondary border-t pt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded bg-brand-primary" />
                          <span>Tablet Diminum</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded border border-brand-primary bg-base-white" />
                          <span>Hari Ini</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded bg-base-bg/30 border border-base-border/25" />
                          <span>Belum Diminum</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activePemantauanTab === 'weekly' && (() => {
                  const weeks = weeklyTrimesterFilter === 1
                    ? [4, 5, 6, 7, 8, 9, 10, 11, 12]
                    : weeklyTrimesterFilter === 2
                    ? [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
                    : [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                      {/* Filter Sub-Tabs */}
                      <div className="flex border-b text-[11px] font-bold text-base-text-secondary select-none">
                        <button
                          type="button"
                          onClick={() => setWeeklyTrimesterFilter(1)}
                          className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 1 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                        >
                          Trimester I (Mg 4-12)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeeklyTrimesterFilter(2)}
                          className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 2 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                        >
                          Trimester II (Mg 13-28)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeeklyTrimesterFilter(3)}
                          className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 3 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                        >
                          Trimester III (Mg 29-42)
                        </button>
                      </div>

                      {/* Info Banner */}
                      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                        <h4 className="font-bold text-xs text-brand-primary">
                          Lembar Pemantauan Ibu Hamil (Buku KIA Halaman 10-13)
                        </h4>
                        <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                          Beri tanda centang (✓) pada kolom pelayanan kesehatan saat periksa/kelas ibu, serta centang kolom pemantauan mingguan jika Ibu merasakan kondisi/gejala tersebut selama minggu kehamilan Anda.
                        </p>
                      </div>

                      {/* Horizontal Scrollable Table */}
                      <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                          <thead>
                            <tr className="bg-base-bg/40 text-[10px] font-bold text-base-text-secondary uppercase tracking-wider border-b border-base-border/20">
                              <th className="py-3 px-4 text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-24">Minggu Kehamilan</th>
                              <th className="py-3 px-3 text-center border-r border-base-border/20" colSpan={2}>Pelayanan Kesehatan</th>
                              <th className="py-3 px-3 text-center" colSpan={9}>Pemantauan Gejala / Kondisi</th>
                            </tr>
                            <tr className="bg-base-bg/25 text-[9px] font-bold text-base-text-secondary uppercase tracking-wider border-b border-base-border/20">
                              <th className="py-2.5 px-4 text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"></th>
                              <th className="py-2.5 px-2 text-center w-28 border-r">Periksa Hamil</th>
                              <th className="py-2.5 px-2 text-center w-28 border-r border-base-border/20">Kelas Ibu Hamil</th>
                              
                              <th className="py-2.5 px-2 text-center w-24 border-r">Demam &gt;2 Hari</th>
                              <th className="py-2.5 px-2 text-center w-24 border-r">Pusing Berat</th>
                              <th className="py-2.5 px-2 text-center w-24 border-r">Cemas / Insomnia</th>
                              <th className="py-2.5 px-2 text-center w-28 border-r">Batuk &gt;2Mg / Kontak TB</th>
                              <th className="py-2.5 px-2 text-center w-28 border-r">Janin Kurang Gerak</th>
                              <th className="py-2.5 px-2 text-center w-24 border-r">Nyeri Perut Hebat</th>
                              <th className="py-2.5 px-2 text-center w-28 border-r">Cairan Berbau/Banyak</th>
                              <th className="py-2.5 px-2 text-center w-28 border-r">Nyeri Kencing/Gatal</th>
                              <th className="py-2.5 px-2 text-center">Diare Berulang</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-base-border/10 font-medium">
                            {weeks.map((week) => {
                              const record = weeklyLogs.find((l: any) => l.week_number === week) || {};
                              const isFetalMovementDisabled = week < 24;

                              return (
                                <tr key={week} className="hover:bg-base-bg/15 transition-colors">
                                  <td className="py-3 px-4 font-extrabold text-brand-primary text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    Minggu {week}
                                  </td>
                                  
                                  <td className="py-3 px-2 text-center border-r">
                                    <input
                                      type="checkbox"
                                      checked={!!record.check_pregnancy}
                                      onChange={() => handleToggleWeekly(week, "check_pregnancy")}
                                      className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r border-base-border/20">
                                    <input
                                      type="checkbox"
                                      checked={!!record.check_class}
                                      onChange={() => handleToggleWeekly(week, "check_class")}
                                      className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/20 cursor-pointer"
                                    />
                                  </td>

                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.fever}
                                      onChange={() => handleToggleWeekly(week, "fever")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.headache}
                                      onChange={() => handleToggleWeekly(week, "headache")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.insomnia}
                                      onChange={() => handleToggleWeekly(week, "insomnia")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.cough}
                                      onChange={() => handleToggleWeekly(week, "cough")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    {isFetalMovementDisabled ? (
                                      <span className="text-[10px] text-base-text-secondary/40 font-semibold">-</span>
                                    ) : (
                                      <input
                                        type="checkbox"
                                        checked={!!record.fetal_movement}
                                        onChange={() => handleToggleWeekly(week, "fetal_movement")}
                                        className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                      />
                                    )}
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.stomach_pain}
                                      onChange={() => handleToggleWeekly(week, "stomach_pain")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.fluid_discharge}
                                      onChange={() => handleToggleWeekly(week, "fluid_discharge")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.urination_pain}
                                      onChange={() => handleToggleWeekly(week, "urination_pain")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 px-2 text-center bg-status-red-light/5">
                                    <input
                                      type="checkbox"
                                      checked={!!record.diarrhea}
                                      onChange={() => handleToggleWeekly(week, "diarrhea")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Warning Notice */}
                      <div className="bg-status-red-light/10 border border-status-red-solid/15 rounded-xl p-3.5 flex items-start gap-2.5 text-status-red-solid text-[11px] leading-relaxed">
                        <span className="text-sm">⚠️</span>
                        <p className="font-medium text-xs">
                          <strong>PENTING:</strong> Jika Ibu hamil mencentang salah satu gejala pada kolom <strong>Pemantauan Gejala / Kondisi</strong>, segeralah berkonsultasi ke bidan posyandu atau periksa ke Puskesmas/Rumah Sakit terdekat untuk penanganan medis dini.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {activePemantauanTab === 'attendance' && (() => {
                  const formatDate = (isoStr: string) => {
                    if (!isoStr) return "-";
                    const d = new Date(isoStr);
                    if (isNaN(d.getTime())) return "-";
                    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                  };

                  const handleSaveAttendance = () => {
                    if (motherDetail) {
                      localStorage.setItem(`attendance_class_ibu_hamil_${motherDetail.mother_id}`, JSON.stringify(attendance));
                    }
                    setIsEditingAttendance(false);
                  };

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                        <h4 className="font-bold text-xs text-brand-primary">
                          Absensi Kehadiran Kelas Ibu Hamil
                        </h4>
                        <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                          Mencatat tanggal dan materi kelas ibu hamil yang telah diikuti secara mandiri. Kelas ini penting untuk persiapan persalinan.
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-base-text-primary">Daftar Kehadiran:</span>
                        <div className="flex gap-2">
                          {isEditingAttendance ? (
                            <>
                              <button 
                                type="button"
                                onClick={handleSaveAttendance} 
                                className="px-3 py-1.5 bg-brand-primary hover:bg-status-pink-dark text-base-white text-xs font-bold rounded-lg cursor-pointer transition shadow-sm"
                              >
                                Selesai
                              </button>
                              <button 
                                type="button"
                                onClick={() => setIsEditingAttendance(false)} 
                                className="px-3 py-1.5 border border-base-border/50 text-base-text-secondary hover:bg-base-bg text-xs font-bold rounded-lg cursor-pointer transition"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => setIsEditingAttendance(true)} 
                              className="px-3 py-1.5 border border-brand-primary hover:bg-brand-soft/20 text-brand-primary text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                            >
                              <MdEdit className="w-3 h-3" /> Ubah Absensi
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm bg-base-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                              <th className="py-2.5 px-4 text-center w-12">No.</th>
                              <th className="py-2.5 px-4 w-48">Tanggal Kelas</th>
                              <th className="py-2.5 px-4">Materi / Nama & Paraf Kader</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((row, idx) => (
                              <tr key={idx} className="border-b last:border-b-0 hover:bg-base-bg/5">
                                <td className="py-2.5 px-4 text-center font-bold text-base-text-primary">{idx + 1}</td>
                                <td className="py-2.5 px-4 relative overflow-visible">
                                  {isEditingAttendance ? (
                                    <div className="relative overflow-visible z-50">
                                      <CustomDatePicker 
                                        value={row.date} 
                                        onChange={(val) => {
                                          const next = [...attendance];
                                          next[idx].date = val;
                                          setAttendance(next);
                                        }} 
                                        outputFormat="iso" 
                                        label="Pilih Tanggal"
                                      />
                                    </div>
                                  ) : (
                                    <span className="font-bold text-base-text-primary">{formatDate(row.date)}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4">
                                  {isEditingAttendance ? (
                                    <input 
                                      type="text" 
                                      value={row.note} 
                                      onChange={(e) => {
                                        const next = [...attendance];
                                        next[idx].note = e.target.value;
                                        setAttendance(next);
                                      }} 
                                      placeholder={`Materi Trimester ${idx + 1} / Nama Bidan`} 
                                      className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-brand-primary text-base-text-primary transition"
                                    />
                                  ) : (
                                    <span className="font-semibold text-base-text-secondary">{row.note || "-"}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {activePemantauanTab === 'birth_prep' && (() => {
                  const handleToggle = (idx: number) => {
                    const next = [...prepList];
                    next[idx] = !next[idx];
                    setPrepList(next);
                    if (motherDetail) {
                      localStorage.setItem(`birth_prep_${idx + 1}_${motherDetail.mother_id}`, String(next[idx]));
                    }
                  };

                  const checkedCount = prepList.filter(Boolean).length;
                  const pct = checkedCount * 10;

                  const items = [
                    { title: "1. Tanggal Perkiraan Persalinan (HPL)", desc: "Sudah menanyakan tanggal perkiraan lahir ke bidan/dokter." },
                    { title: "2. Pendamping Melahirkan", desc: "Meminta suami atau keluarga mendampingi saat periksa dan melahirkan." },
                    { title: "3. Tabungan / Dana Cadangan", desc: "Mempersiapkan dana cadangan untuk biaya persalinan dan keperluan tak terduga." },
                    { title: "4. Kartu JKN / BPJS Kesehatan", desc: "Mempersiapkan kartu BPJS atau mendaftar jika belum memilikinya." },
                    { title: "5. Tempat Melahirkan", desc: "Sudah menyepakati tempat bersalin (Puskesmas, RS, atau Klinik Bersalin)." },
                    { title: "6. KTP, KK & Dokumen Lahir", desc: "Menyiapkan berkas KTP, Kartu Keluarga, dan Buku KIA untuk syarat administrasi bayi." },
                    { title: "7. Calon Pendonor Darah Siaga", desc: "Menyiapkan lebih dari 1 orang yang bergolongan darah sama dan bersedia mendonor." },
                    { title: "8. Kendaraan Siaga", desc: "Menyepakati kendaraan darurat dengan keluarga atau tetangga untuk transportasi." },
                    { title: "9. Stiker P4K Terpasang", desc: "Sudah menempelkan stiker Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) di depan rumah." },
                    { title: "10. Rencana KB Pasca Salin", desc: "Sudah merencanakan metode Keluarga Berencana (KB) pasca bersalin." }
                  ];

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                        <h4 className="font-bold text-xs text-brand-primary">
                          Checklist Mandiri Persiapan Melahirkan (Diisi Ibu)
                        </h4>
                        <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                          Memastikan kelengkapan administrasi, fisik, finansial, dan logistik sebelum tanggal persalinan.
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
                        <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                          <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                        </div>
                        <p className="text-[11px] font-bold text-brand-primary">Persiapan selesai: {pct}% ({checkedCount} dari 10)</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((item, idx) => (
                          <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                            <input 
                              type="checkbox" 
                              checked={prepList[idx]} 
                              onChange={() => handleToggle(idx)} 
                              className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                            />
                            <div className="text-[10px] leading-relaxed select-none">
                              <span className="font-bold text-base-text-primary block">{item.title}</span>
                              <span className="text-base-text-secondary">{item.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {activePemantauanTab === 'birth_process' && (() => {
                  const handleToggle = (idx: number) => {
                    const next = [...birthProcessList];
                    next[idx] = !next[idx];
                    setBirthProcessList(next);
                    if (motherDetail) {
                      localStorage.setItem(`birth_process_${idx + 1}_${motherDetail.mother_id}`, String(next[idx]));
                    }
                  };

                  const checkedCount = birthProcessList.filter(Boolean).length;
                  const pct = Math.round(checkedCount * (100 / 7));

                  const items = [
                    { title: "1. Tanda-Tanda Persalinan", desc: "Mengetahui bahwa awal persalinan ditandai mulas teratur yang semakin lama semakin kuat." },
                    { title: "2. Durasi Persalinan Normal", desc: "Memahami durasi persalinan anak pertama (±12 jam) dan anak kedua/seterusnya yang lebih cepat." },
                    { title: "3. Hak Pendamping Persalinan", desc: "Ibu berhak menentukan apakah ingin didampingi atau tidak, serta siapa pendampingnya." },
                    { title: "4. Hak Memilih Posisi Bersalin", desc: "Ibu berhak memilih posisi melahirkan yang diinginkan dan mendiskusikan keamanannya dengan petugas." },
                    { title: "5. Keinginan Buang Air Besar", desc: "Segera memberitahu petugas kesehatan bila merasa ingin buang air besar (tanda kepala bayi turun)." },
                    { title: "6. Teknik Mengurangi Rasa Sakit", desc: "Mengetahui teknik menarik napas melalui hidung dan mengeluarkannya lewat mulut saat mulas." },
                    { title: "7. Inisiasi Menyusu Dini (IMD)", desc: "Siap melakukan kontak kulit ke kulit segera setelah bayi lahir selama minimal 1 jam." }
                  ];

                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                        <h4 className="font-bold text-xs text-brand-primary">
                          Proses Melahirkan (Diisi Ibu)
                        </h4>
                        <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                          Memastikan pemahaman Ibu mengenai hal-hal penting selama persalinan dan sesudahnya sesuai Buku KIA halaman 24.
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
                        <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                          <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                        </div>
                        <p className="text-[11px] font-bold text-brand-primary">Pemahaman selesai: {pct}% ({checkedCount} dari 7)</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {items.map((item, idx) => (
                          <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                            <input 
                              type="checkbox" 
                              checked={birthProcessList[idx]} 
                              onChange={() => handleToggle(idx)} 
                              className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                            />
                            <div className="text-[10px] leading-relaxed select-none">
                              <span className="font-bold text-base-text-primary block">{item.title}</span>
                              <span className="text-base-text-secondary">{item.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                  {activePemantauanTab === 'postpartum' && (() => {
                    const daysInWeek = Array.from({ length: 7 }, (_, i) => (postpartumFilter - 1) * 7 + i + 1);

                    const handleTogglePostpartum = (dayIdx: number, field: string) => {
                      const next = [...postpartumList];
                      const idx = dayIdx - 1;
                      next[idx] = { ...next[idx], [field]: !next[idx][field] };
                      setPostpartumList(next);
                      if (motherDetail) {
                        localStorage.setItem(`postpartum_monitoring_${motherDetail.mother_id}`, JSON.stringify(next));
                      }
                    };

                    const fields = [
                      { key: "pemeriksaan_nifas", label: "Pemeriksaan Nifas", cat: "health" },
                      { key: "vitamin_a", label: "Konsumsi Vit A", cat: "health" },
                      { key: "ttd", label: "Konsumsi TTD", cat: "health" },
                      { key: "gizi_sesuai", label: "Makan Gizi Cukup", cat: "health" },
                      { key: "masalah_jiwa", label: "Masalah Jiwa/Sedih", cat: "symptom" },
                      { key: "demam", label: "Demam >38°C", cat: "danger" },
                      { key: "sakit_kepala", label: "Sakit Kepala Hebat", cat: "danger" },
                      { key: "pandangan_kabur", label: "Pandangan Mata Kabur", cat: "danger" },
                      { key: "nyeri_ulu_hati", label: "Nyeri Ulu Hati", cat: "danger" },
                      { key: "jantung_berdebar", label: "Jantung Berdebar", cat: "symptom" },
                      { key: "napas_pendek", label: "Napas Pendek", cat: "danger" },
                      { key: "payudara_bengkak", label: "Payudara Bengkak/Nyeri", cat: "symptom" },
                      { key: "gangguan_bak", label: "Gangguan Buang Air Kecil", cat: "symptom" },
                      { key: "kelamin_bengkak", label: "Kelamin Bengkak/Luka", cat: "danger" },
                      { key: "darah_bau", label: "Darah Nifas Berbau", cat: "danger" },
                      { key: "konstipasi_diare", label: "Pencernaan Terganggu", cat: "symptom" },
                      { key: "keputihan", label: "Keputihan Abnormal", cat: "symptom" }
                    ];

                    return (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                          <h4 className="font-bold text-xs text-brand-primary">
                            Lembar Pemantauan Harian Ibu Nifas (Diisi Ibu)
                          </h4>
                          <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                            Catat pelayanan kesehatan dan pantau tanda bahaya masa nifas setiap hari selama 42 hari pasca melahirkan (Buku KIA Hal 28-31).
                          </p>
                        </div>

                        {/* Week Switcher */}
                        <div className="flex border-b text-[10px] font-bold text-base-text-secondary select-none flex-wrap gap-1">
                          {[1, 2, 3, 4, 5, 6].map(w => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setPostpartumFilter(w)}
                              className={`flex-1 min-w-[50px] py-2 text-center border-b-2 transition cursor-pointer ${postpartumFilter === w ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                            >
                              Minggu {w}
                            </button>
                          ))}
                        </div>

                        {/* Accordion for the 7 Days of Selected Week */}
                        <div className="space-y-3">
                          {daysInWeek.map(dayNum => {
                            const record = postpartumList[dayNum - 1] || { day: dayNum };
                            const checkedCount = fields.filter(f => record[f.key]).length;

                            return (
                              <details key={dayNum} className="group bg-base-white border border-base-border/25 rounded-xl [&_summary::-webkit-details-marker]:hidden overflow-hidden">
                                <summary className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-base-bg/10 transition select-none">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-[11px] font-extrabold text-brand-primary bg-brand-soft/30 px-2 py-0.5 rounded-md">Hari Ke-{dayNum}</span>
                                    <span className="text-[10px] font-bold text-base-text-secondary">Tercatat: {checkedCount} parameter</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {fields.some(f => f.cat === 'danger' && record[f.key]) && (
                                      <span className="text-[8px] font-bold text-status-red-solid bg-status-red-light/30 border border-status-red-solid/25 px-1.5 py-0.5 rounded-full uppercase animate-pulse">Bahaya</span>
                                    )}
                                    <span className="text-base-text-secondary group-open:rotate-180 transition-transform duration-200">▼</span>
                                  </div>
                                </summary>
                                
                                <div className="p-4 border-t border-base-border/10 bg-base-bg/5 space-y-4">
                                  <div className="space-y-2">
                                    <h5 className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">I. Pelayanan Kesehatan & Nutrisi</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {fields.filter(f => f.cat === 'health').map(f => (
                                        <label key={f.key} className="flex items-center gap-2.5 p-2 bg-base-white border border-base-border/15 rounded-lg cursor-pointer hover:border-brand-primary/20 transition">
                                          <input
                                            type="checkbox"
                                            checked={!!record[f.key]}
                                            onChange={() => handleTogglePostpartum(dayNum, f.key)}
                                            className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/25 cursor-pointer"
                                          />
                                          <span className="text-[10px] font-semibold text-base-text-primary select-none">{f.label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h5 className="text-[9px] font-bold text-status-red-solid uppercase tracking-wider">II. Pemantauan Gejala / Tanda Bahaya</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {fields.filter(f => f.cat !== 'health').map(f => {
                                        const isDanger = f.cat === 'danger';
                                        return (
                                          <label key={f.key} className={`flex items-center gap-2.5 p-2 bg-base-white border rounded-lg cursor-pointer transition ${isDanger ? 'hover:border-status-red-solid/35 border-base-border/15' : 'hover:border-brand-primary/20 border-base-border/15'}`}>
                                            <input
                                              type="checkbox"
                                              checked={!!record[f.key]}
                                              onChange={() => handleTogglePostpartum(dayNum, f.key)}
                                              className={`w-4 h-4 rounded border-base-border/40 cursor-pointer ${isDanger ? 'text-status-red-solid focus:ring-status-red-solid/25' : 'text-brand-primary focus:ring-brand-primary/25'}`}
                                            />
                                            <span className={`text-[10px] font-semibold select-none ${isDanger ? 'text-status-red-solid font-bold' : 'text-base-text-primary'}`}>{f.label}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {activePemantauanTab === 'kb' && (() => {
                    const handleToggleKbAnswer = (idx: number) => {
                      const next = [...kbAnswers];
                      next[idx] = !next[idx];
                      setKbAnswers(next);
                      if (motherDetail) {
                        localStorage.setItem(`kb_answers_${motherDetail.mother_id}`, JSON.stringify(next));
                      }
                    };

                    const handleToggleConsent = () => {
                      const next = !kbConsent;
                      setKbConsent(next);
                      if (motherDetail) {
                        localStorage.setItem(`kb_consent_${motherDetail.mother_id}`, String(next));
                      }
                    };

                    const questions = [
                      { title: "1. Pemahaman Pentingnya KB", desc: "Memahami mengapa perlu ikut KB (menjaga jarak kehamilan, membatasi jumlah anak, dll)." },
                      { title: "2. Pilihan Metode Kontrasepsi Jangka Panjang (MKJP)", desc: "Mengetahui metode steril (MOW/MOP), spiral (IUD), dan susuk (Implan)." },
                      { title: "3. Pilihan Metode Non Jangka Panjang", desc: "Mengetahui metode Suntik KB 3 bulan, Pil KB Progestin, dan Kondom." }
                    ];

                    return (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                          <h4 className="font-bold text-xs text-brand-primary">
                            Keluarga Berencana (KB) Pasca Salin (Diisi Ibu)
                          </h4>
                          <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                            Merencanakan kehamilan sehat pasca melahirkan bersama suami sesuai Buku KIA halaman 33.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {questions.map((q, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 p-3.5 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                              <input 
                                type="checkbox" 
                                checked={kbAnswers[idx]} 
                                onChange={() => handleToggleKbAnswer(idx)} 
                                className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                              />
                              <div className="text-[10px] leading-relaxed select-none">
                                <span className="font-bold text-base-text-primary block">{q.title}</span>
                                <span className="text-base-text-secondary">{q.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="border border-brand-primary/25 rounded-2xl p-5 bg-brand-soft/10 space-y-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="kb-consent-checkbox"
                              checked={kbConsent}
                              onChange={handleToggleConsent}
                              className="w-5 h-5 rounded text-brand-primary mt-0.5 cursor-pointer border-brand-primary/30 focus:ring-brand-primary/20"
                            />
                            <label htmlFor="kb-consent-checkbox" className="text-xs leading-relaxed font-semibold text-base-text-primary select-none cursor-pointer">
                              PERNYATAAN PERSETUJUAN IBU
                              <span className="block text-[10px] font-medium text-base-text-secondary mt-1">
                                "Saya bersedia menggunakan kontrasepsi (KB) pasca bersalin demi menjaga kesehatan saya dan jarak kehamilan untuk tumbuh kembang anak yang optimal."
                              </span>
                            </label>
                          </div>

                          {kbConsent && (
                            <div className="border-t border-brand-primary/20 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">Status Persetujuan</span>
                                <span className="text-xs font-bold text-status-green-solid flex items-center gap-1">
                                  ✓ Disetujui secara Digital oleh Ibu
                                </span>
                              </div>
                              <div className="border border-brand-primary/20 rounded-xl px-4 py-2 bg-base-white text-center sm:text-right shrink-0">
                                <span className="text-[9px] font-bold text-base-text-secondary uppercase block">Paraf/Tanda Tangan digital</span>
                                <span className="text-xs font-extrabold text-brand-primary italic block font-serif tracking-widest mt-0.5">
                                  {motherDetail ? motherDetail.name : "Ibu Kandung"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {activePemantauanTab === 'breastfeeding' && (() => {
                    const handleToggleBreastfeeding = (idx: number) => {
                      const next = [...breastfeedingAnswers];
                      next[idx] = !next[idx];
                      setBreastfeedingAnswers(next);
                      if (motherDetail) {
                        localStorage.setItem(`breastfeeding_monitoring_${motherDetail.mother_id}`, JSON.stringify(next));
                      }
                    };

                    const items = [
                      { title: "1. Posisi Lurus & Dekat", desc: "Kepala dan badan bayi membentuk garis lurus, badan bayi dekat menempel tubuh ibu." },
                      { title: "2. Mulut Terbuka Lebar", desc: "Mulut bayi terbuka lebar saat menyusu untuk pelekatan maksimal." },
                      { title: "3. Dagu Menempel Payudara", desc: "Dagu bayi menempel erat pada payudara ibu saat menyusu." },
                      { title: "4. Areola Atas Terlihat Lebih Banyak", desc: "Bagian areola payudara di atas terlihat lebih banyak dibanding areola bawah." },
                      { title: "5. Bibir Bawah Dower / Flanged", desc: "Bibir bawah bayi memutar keluar secara sempurna." },
                      { title: "6. Menyusu 8-12 Kali Sehari", desc: "Menyusui sesering mungkin minimal 8 hingga 12 kali dalam 24 jam." },
                      { title: "7. Makanan Pokok (6 Porsi)", desc: "Mengonsumsi nasi atau makanan pokok sebanyak 6 porsi sehari." },
                      { title: "8. Protein Hewani (4 Porsi)", desc: "Mengonsumsi lauk pauk protein hewani seperti ikan, telur, daging sebanyak 4 porsi sehari." },
                      { title: "9. Protein Nabati (4 Porsi)", desc: "Mengonsumsi tempe atau tahu sebanyak 4 porsi sehari." },
                      { title: "10. Sayur-sayuran (4 Porsi)", desc: "Mengonsumsi sayur matang sebanyak 4 mangkuk sehari." },
                      { title: "11. Buah-buahan (4 Porsi)", desc: "Mengonsumsi buah-buahan seperti pisang, pepaya, apel sebanyak 4 porsi sehari." },
                      { title: "12. Air Putih (14 Gelas/Hari)", desc: "Memenuhi hidrasi harian dengan minum 14 gelas air putih sehari." }
                    ];

                    const checkedCount = breastfeedingAnswers.filter(Boolean).length;
                    const pct = Math.round(checkedCount * (100 / 12));

                    return (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                          <h4 className="font-bold text-xs text-brand-primary">
                            Lembar Pemantauan Menyusui & Nutrisi Ibu (Diisi Ibu)
                          </h4>
                          <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                            Memastikan posisi pelekatan menyusui yang benar dan pemenuhan porsi makan harian ibu menyusui sesuai Buku KIA halaman 35-37.
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
                          <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                            <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                          </div>
                          <p className="text-[11px] font-bold text-brand-primary">Selesai: {pct}% ({checkedCount} dari 12)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                              <input 
                                type="checkbox" 
                                checked={!!breastfeedingAnswers[idx]} 
                                onChange={() => handleToggleBreastfeeding(idx)} 
                                className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                              />
                              <div className="text-[10px] leading-relaxed select-none">
                                <span className="font-bold text-base-text-primary block">{item.title}</span>
                                <span className="text-base-text-secondary">{item.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        </div>

        {/* Maternal Examination History Table */}
        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
            <FaHeartbeat className="w-5 h-5 text-status-red-solid" />
            <h2 className="font-bold text-base-text-primary text-base">Riwayat Pemeriksaan Kesehatan Saya</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal Periksa</th>
                  <th className="py-3 px-4 text-center">BB Ibu (kg)</th>
                  <th className="py-3 px-4 text-center">Tekanan Darah</th>
                  <th className="py-3 px-4 text-center">Lila (cm)</th>
                  <th className="py-3 px-4 text-center">Fundus (cm)</th>
                  <th className="py-3 px-4 text-center">Detak Jantung Janin (DJJ)</th>
                  <th className="py-3 px-4 text-center">Tablet Fe (Butir)</th>
                  <th className="py-3 px-4">Catatan Kader Posyandu</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {motherDetail.maternal_records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-base-text-secondary text-xs">Belum ada riwayat pemeriksaan kehamilan/kesehatan.</td>
                  </tr>
                ) : (
                  motherDetail.maternal_records.map((r: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{r.date}</td>
                      <td className="py-3 px-4 text-center font-bold text-brand-primary">{r.weight > 0 ? `${r.weight} kg` : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{r.blood_pressure}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{r.muac > 0 ? `${r.muac} cm` : "-"}</td>
                      <td className="py-3 px-4 text-center font-medium text-base-text-secondary">{r.fundal_height > 0 ? `${r.fundal_height} cm` : "-"}</td>
                      <td className="py-3 px-4 text-center font-medium text-base-text-secondary">{r.fetal_heart_rate > 0 ? `${r.fetal_heart_rate} x/mnt` : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-secondary">{r.iron_pills_given > 0 ? `${r.iron_pills_given} butir` : "-"}</td>
                      <td className="py-3 px-4 text-base-text-secondary font-medium italic">{r.cadre_notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-10">
      
      {/* --- GRID METRIK (4 KARTU BENTO) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard 
          icon={FaUserNurse} 
          title="Total Ibu Terdaftar" 
          iconBgColor="bg-brand-soft" 
          iconTextColor="text-brand-primary" 
          barColor="bg-brand-primary"
          barPercentage={100}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.totalMothers}</span>
          <span className="text-xs text-base-text-secondary">ibu terdaftar</span>
        </StatMetricCard>
        
        <StatMetricCard 
          icon={MdOutlineError} 
          title="Ibu Hamil KEK" 
          iconBgColor="bg-status-orange-light" 
          iconTextColor="text-status-orange-solid" 
          barColor="bg-status-orange-solid" 
          barPercentage={calculatePercentage(metrics.mothersKek)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.mothersKek}</span>
          <span className="text-xs text-base-text-secondary">dari</span>
          <span className="text-sm font-bold text-status-orange-solid">{metrics.totalMothers}</span>
          <span className="text-xs text-base-text-secondary">ibu</span>
        </StatMetricCard>

        <StatMetricCard 
          icon={MdPregnantWoman} 
          title="Kehamilan Risiko Tinggi" 
          iconBgColor="bg-status-yellow-light" 
          iconTextColor="text-status-yellow-solid" 
          barColor="bg-status-yellow-solid"
          barPercentage={calculatePercentage(metrics.highRiskPregnancies)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.highRiskPregnancies}</span>
          <span className="text-xs text-base-text-secondary">ibu risiko tinggi</span>
        </StatMetricCard>

        <StatMetricCard 
          icon={MdCalendarMonth} 
          title="HPL Bulan Ini" 
          iconBgColor="bg-status-blue-light" 
          iconTextColor="text-status-blue-solid" 
          barColor="bg-status-blue-solid" 
          barPercentage={calculatePercentage(metrics.dueThisMonth)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.dueThisMonth}</span>
          <span className="text-xs text-base-text-secondary">ibu (Bulan Ini)</span>
        </StatMetricCard>
      </div>

      {/* --- TABEL 1: DAFTAR IBU --- */}
      <div className="bg-base-white rounded-bento-lg shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-base-text-primary w-full md:w-auto">Daftar Ibu</h2>
          
          {/* Action Toolbar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input 
                type="search" 
                placeholder="Cari nama ibu..." 
                className="w-full pl-10 pr-4 py-2 border border-base-border/40 bg-base-bg/30 focus:bg-base-white rounded-full text-sm outline-none focus:border-brand-primary transition-all" 
                value={motherSearch}
                onChange={(e) => setMotherSearch(e.target.value)}
              />
              <MdSearch className="absolute left-3 top-2.5 text-base-text-secondary w-5 h-5" />
            </div>
            <button 
              onClick={() => setShowMotherFilter(!showMotherFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                showMotherFilter 
                  ? "bg-brand-primary border-brand-primary text-base-white shadow-sm" 
                  : "border-base-border/40 text-base-text-secondary hover:bg-base-bg/50"
              }`}
            >
              <span>Filter</span> <MdFilterList className="w-4 h-4" />
            </button>
            {role === "kader" && (
              <Link 
                href="/data-ibu/tambah" 
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] cursor-pointer"
              >
                Tambah Ibu <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showMotherFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Status (Type) Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Status Ibu</label>
              <select
                value={motherFilterStatus}
                onChange={(e) => setMotherFilterStatus(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Status Ibu</option>
                <option value="Calon Ibu">Calon Ibu</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
                <option value="Ibu Nifas">Ibu Nifas</option>
                <option value="Ibu Balita">Ibu Balita</option>
              </select>
            </div>

            {/* Risk Condition Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Kondisi Risiko</label>
              <select
                value={motherFilterCondition}
                onChange={(e) => setMotherFilterCondition(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Kondisi</option>
                <option value="Normal">Normal</option>
                <option value="KEK">KEK (Kurang Energi Kronis)</option>
                <option value="Risiko Tinggi">Risiko Tinggi</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-gray-400">NO.</th>
                <th className="py-2.5 px-3 min-w-[180px] select-none">
                  <div className="flex items-center gap-3">
                    <span>NAMA IBU & USIA</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => handleMotherSort("name")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${motherSortField === "name" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Nama"
                      >
                        Nama {motherSortField === "name" ? (motherSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleMotherSort("age")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${motherSortField === "age" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Usia"
                      >
                        Usia {motherSortField === "age" ? (motherSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                    </div>
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[130px] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleMotherSort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS</span>
                    <span className="text-[10px]">{motherSortField === "status" ? (motherSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[160px] whitespace-nowrap">USIA KANDUNGAN / NIFAS</th>
                <th className="py-2.5 px-3 min-w-[140px] whitespace-nowrap">HPL / TGL BERSALIN</th>
                <th className="py-2.5 px-3 min-w-[110px] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleMotherSort("condition")}>
                  <div className="flex items-center gap-1">
                    <span>KONDISI</span>
                    <span className="text-[10px]">{motherSortField === "condition" ? (motherSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center min-w-[100px]">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-4 px-4"><div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div><div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedMothers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-sm text-base-text-secondary font-semibold">Tidak ada data ditemukan</p>
                      <button
                        type="button"
                        onClick={() => loadData(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-bold hover:bg-brand-soft/80 transition cursor-pointer"
                        disabled={isRefreshing}
                      >
                        <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Menyegarkan..." : "Segarkan Data"}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedMothers.map((mother, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-base-bg/40 transition-colors">
                    <td className="py-2.5 px-3 text-base-text-secondary font-medium">
                      {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center shrink-0 overflow-hidden border border-base-border/10">
                          {mother.avatarUrl ? (
                            <img src={mother.avatarUrl} alt={mother.name} className="w-full h-full object-cover" />
                          ) : (
                            <MdPerson className="w-4.5 h-4.5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-base-text-primary leading-tight">{mother.name}</p>
                          <p className="text-xs text-base-text-secondary mt-0.5">{mother.age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3"><MotherTypeBadge type={mother.status} /></td>
                    <td className="py-2.5 px-3 text-base-text-primary font-medium whitespace-nowrap">{mother.gestationalAge}</td>
                    <td className="py-2.5 px-3 text-base-text-primary font-medium whitespace-nowrap">{mother.hpl}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={mother.condition} /></td>
                    <td className="py-2.5 px-3 text-center">
                      <Link 
                        href={`/data-ibu/${encodeURIComponent(mother.mother_id)}`}
                        className="inline-block px-3 py-1.5 border border-base-border/50 text-base-text-primary rounded-lg text-xs font-semibold hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/20 transition-all cursor-pointer whitespace-nowrap"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredMothers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm text-base-text-secondary font-medium gap-4">
            <div className="flex items-center gap-2">
              <span>Tampilkan</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-base-border/50 rounded-md px-2 py-1 bg-base-white focus:outline-none focus:border-brand-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>dari {filteredMothers.length} Ibu</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 hover:text-brand-primary transition disabled:opacity-50 disabled:hover:text-base-text-secondary"
              >
                &lt; Sebelumnya
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    currentPage === page 
                      ? 'bg-brand-primary text-base-white font-bold shadow-md shadow-brand-primary/10' 
                      : 'hover:bg-base-bg/60'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 hover:text-brand-primary transition disabled:opacity-50 disabled:hover:text-base-text-secondary"
              >
                Selanjutnya &gt;
              </button>
            </div>
            <p>{currentPage} dari {totalPages}</p>
          </div>
        )}
      </div>

      {/* --- TABEL 2: RIWAYAT PEMERIKSAAN KEHAMILAN --- */}
      <div className="bg-base-white rounded-bento-lg shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-base-text-primary w-full md:w-auto">Riwayat Pemeriksaan Kehamilan</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="search" 
                placeholder="Cari nama ibu..." 
                className="w-full pl-10 pr-4 py-2 border border-base-border/40 bg-base-bg/30 focus:bg-base-white rounded-full text-sm outline-none focus:border-brand-primary transition-all" 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
              <MdSearch className="absolute left-3 top-2.5 text-base-text-secondary w-5 h-5" />
            </div>
            <button 
              onClick={() => setShowHistoryFilter(!showHistoryFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                showHistoryFilter 
                  ? "bg-brand-primary border-brand-primary text-base-white shadow-sm" 
                  : "border-base-border/40 text-base-text-secondary hover:bg-base-bg/50"
              }`}
            >
              <span>Filter</span> <MdFilterList className="w-4 h-4" />
            </button>
            {role === "kader" && (
              <Link 
                href="/data-ibu/input-pemeriksaan" 
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] whitespace-nowrap cursor-pointer"
              >
                Input Pemeriksaan <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showHistoryFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Risk Condition Filter */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-base-text-secondary block">Status Kondisi Ibu</label>
              <select
                value={historyFilterCondition}
                onChange={(e) => setHistoryFilterCondition(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Kondisi</option>
                <option value="Normal">Normal</option>
                <option value="KEK">KEK (Kurang Energi Kronis)</option>
                <option value="Risiko Tinggi">Risiko Tinggi</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-gray-400">NO.</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("date")}>
                  <div className="flex items-center gap-1">
                    <span>TANGGAL PERIKSA</span>
                    <span className="text-[10px]">{historySortField === "date" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("name")}>
                  <div className="flex items-center gap-1">
                    <span>NAMA IBU</span>
                    <span className="text-[10px]">{historySortField === "name" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4">BERAT BADAN</th>
                <th className="py-2.5 px-4">TENSI</th>
                <th className="py-2.5 px-4">LILA / FUNDUS</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS KONDISI</span>
                    <span className="text-[10px]">{historySortField === "status" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-4 px-4"><div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div><div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-sm text-base-text-secondary font-semibold">Tidak ada data ditemukan</p>
                      <button
                        type="button"
                        onClick={() => loadData(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-bold hover:bg-brand-soft/80 transition cursor-pointer"
                        disabled={isRefreshing}
                      >
                        <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Menyegarkan..." : "Segarkan Data"}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-base-bg/40 transition-colors">
                    <td className="py-2.5 px-4 text-base-text-secondary font-medium">
                      {String((currentHistoryPage - 1) * historyItemsPerPage + index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.date}</td>
                    <td className="py-2.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center shrink-0">
                        <MdPerson className="w-4.5 h-4.5" />
                      </div>
                      <p className="font-bold text-base-text-primary leading-tight">{item.name}</p>
                    </td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.weight ? `${item.weight} kg` : '-'}</td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.bloodPressure}</td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">
                      {item.muac ? `${item.muac} cm` : '-'} / {item.fundalHeight ? `${item.fundalHeight} cm` : '-'}
                    </td>
                    <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                    <td className="py-2.5 px-4 text-center">
                      <button className="px-3 py-1.5 border border-base-border/50 text-base-text-primary rounded-lg text-xs font-semibold hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/20 transition-all">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination History */}
        {filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm text-base-text-secondary font-medium gap-4">
            <div className="flex items-center gap-2">
              <span>Tampilkan</span>
              <select 
                value={historyItemsPerPage} 
                onChange={(e) => setHistoryItemsPerPage(Number(e.target.value))}
                className="border border-base-border/50 rounded-md px-2 py-1 bg-base-white focus:outline-none focus:border-brand-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>dari {filteredHistory.length} Riwayat</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentHistoryPage(prev => Math.max(prev - 1, 1))}
                disabled={currentHistoryPage === 1}
                className="px-3 py-1 hover:text-brand-primary transition disabled:opacity-50 disabled:hover:text-base-text-secondary"
              >
                &lt; Sebelumnya
              </button>
              
              {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => setCurrentHistoryPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    currentHistoryPage === page 
                      ? 'bg-brand-primary text-base-white font-bold shadow-md shadow-brand-primary/10' 
                      : 'hover:bg-base-bg/60'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                disabled={currentHistoryPage === totalHistoryPages}
                className="px-3 py-1 hover:text-brand-primary transition disabled:opacity-50 disabled:hover:text-base-text-secondary"
              >
                Selanjutnya &gt;
              </button>
            </div>
            <p>{currentHistoryPage} dari {totalHistoryPages}</p>
          </div>
        )}
      </div>

    </div>
  );
}
