"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdMonitorWeight, MdOutlineError,
  MdMale, MdFemale, MdPerson, MdCalendarMonth, MdTrendingDown
} from "react-icons/md";
import { FiArrowUp, FiArrowDown, FiMinus, FiRefreshCw } from "react-icons/fi";
import { FaBaby } from "react-icons/fa";
import { getChildrenData, getMeasurementHistory, getChildMetrics } from "@/app/actions/children";
import { useUserRole } from "@/context/UserRoleContext";
import { getCacheItem, setCacheItem } from "@/lib/db/dexieDb";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

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

function GenderIcon({ gender, imageUrl }: { gender: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-base-border/25">
        <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  const isMale = gender === "M" || gender === "L";
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMale ? 'bg-gender-male-bg text-gender-male-solid' : 'bg-gender-female-bg text-gender-female-solid'}`}>
      {isMale ? <MdMale className="w-5 h-5" /> : <MdFemale className="w-5 h-5" />}
    </div>
  );
}

function TrendArrow({ trend }: { trend: string }) {
  if (trend === "up") return <FiArrowUp className="text-status-green-solid w-3.5 h-3.5 inline ml-1 align-middle stroke-[3]" />;
  if (trend === "down") return <FiArrowDown className="text-status-red-solid w-3.5 h-3.5 inline ml-1 align-middle stroke-[3]" />;
  return <FiMinus className="text-base-text-secondary w-3.5 h-3.5 inline ml-1 align-middle" />;
}

// ==========================================
// 3. KOMPONEN UTAMA HALAMAN
// ==========================================
export default function DataAnakPage() {
  const { role, username } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role === "ibu") {
      router.replace("/perjalanan-anak");
    }
  }, [role, router]);

  if (role === "ibu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-base-text-secondary">Mengalihkan ke Perjalanan Anak...</p>
      </div>
    );
  }

  // States for cadre child dashboard
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ 
    totalChildren: 0, 
    notWeighedThisMonth: 0, 
    problematicNutrition: 0, 
    immunizationScheduled: 0,
    downwardTrend: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [childSearch, setChildSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);

  // Filter States
  const [showChildFilter, setShowChildFilter] = useState(false);
  const [childFilterGender, setChildFilterGender] = useState("");
  const [childFilterStatus, setChildFilterStatus] = useState("");

  const [showHistoryFilter, setShowHistoryFilter] = useState(false);
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");

  // Sort states for Children list
  const [childSortField, setChildSortField] = useState<"name" | "age" | "gender" | "status" | null>("name");
  const [childSortOrder, setChildSortOrder] = useState<"asc" | "desc">("asc");

  // Sort states for History list
  const [historySortField, setHistorySortField] = useState<"name" | "date" | "status" | null>(null);
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("asc");

  const handleChildSort = (field: "name" | "age" | "gender" | "status") => {
    if (childSortField === field) {
      setChildSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setChildSortField(field);
      setChildSortOrder("asc");
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

  const loadData = async (forceRefresh = false) => {
    if (!navigator.onLine) {
      if (forceRefresh) alert("Perangkat Anda offline. Tidak dapat menyegarkan data dari server.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const cachedChildren = await getCacheItem("offline_children_list");
    if (!cachedChildren && !forceRefresh) {
      setIsLoading(true);
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    }

    try {
      const [children, history, fetchedMetrics] = await Promise.all([
        getChildrenData(),
        getMeasurementHistory(),
        getChildMetrics()
      ]);
      setChildrenList(children);
      setHistoryList(history);
      setMetrics(fetchedMetrics);

      await setCacheItem("offline_children_list", children);
      await setCacheItem("offline_children_history", history);
      await setCacheItem("offline_children_metrics", fetchedMetrics);
    } catch (error) {
      console.error("Failed to load children data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    async function loadCachedData() {
      const cachedChildren = await getCacheItem("offline_children_list");
      const cachedHistory = await getCacheItem("offline_children_history");
      const cachedMetrics = await getCacheItem("offline_children_metrics");

      if (cachedChildren) setChildrenList(cachedChildren);
      if (cachedHistory) setHistoryList(cachedHistory);
      if (cachedMetrics) setMetrics(cachedMetrics);

      if (cachedChildren || cachedHistory || cachedMetrics) {
        setIsLoading(false);
      }

      if (navigator.onLine) {
        loadData(false);
      } else {
        setIsLoading(false);
      }
    }
    loadCachedData();
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
  }, [childSearch, itemsPerPage, childFilterGender, childFilterStatus, childSortField, childSortOrder]);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [historySearch, historyItemsPerPage, historyFilterStatus, historySortField, historySortOrder]);

  const filteredChildren = childrenList.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(childSearch.toLowerCase());
    const matchesGender = childFilterGender === "" || child.gender === childFilterGender;
    const matchesStatus = childFilterStatus === "" || child.status === childFilterStatus;

    return matchesSearch && matchesGender && matchesStatus;
  });

  const sortedChildren = [...filteredChildren].sort((a, b) => {
    if (!childSortField) return 0;

    let comparison = 0;
    if (childSortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (childSortField === "age") {
      comparison = (a.rawAge || 0) - (b.rawAge || 0);
    } else if (childSortField === "gender") {
      comparison = a.gender.localeCompare(b.gender);
    } else if (childSortField === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return childSortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedChildren.length / itemsPerPage);
  const paginatedChildren = sortedChildren.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(historySearch.toLowerCase());
    const matchesStatus = historyFilterStatus === "" || item.status === historyFilterStatus;

    return matchesSearch && matchesStatus;
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
    if (metrics.totalChildren === 0) return 0;
    return Math.round((value / metrics.totalChildren) * 100);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* --- GRID METRIK (4 KARTU BENTO) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard 
          icon={FaBaby} 
          title="Total Balita Terdaftar" 
          iconBgColor="bg-brand-soft" 
          iconTextColor="text-brand-primary" 
          barColor="bg-brand-primary"
          barPercentage={100}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.totalChildren}</span>
          <span className="text-xs text-base-text-secondary">balita terdaftar</span>
        </StatMetricCard>
        
        <StatMetricCard 
          icon={MdOutlineError} 
          title="Gizi Bermasalah" 
          iconBgColor="bg-status-red-light" 
          iconTextColor="text-status-red-solid" 
          barColor="bg-status-red-solid" 
          barPercentage={calculatePercentage(metrics.problematicNutrition)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.problematicNutrition}</span>
          <span className="text-xs text-base-text-secondary">dari</span>
          <span className="text-sm font-bold text-status-red-solid">{metrics.totalChildren}</span>
          <span className="text-xs text-base-text-secondary">anak</span>
        </StatMetricCard>

        <StatMetricCard 
          icon={MdTrendingDown} 
          title="Tren Berat Turun" 
          iconBgColor="bg-status-yellow-light" 
          iconTextColor="text-status-yellow-solid" 
          barColor="bg-status-yellow-solid"
          barPercentage={calculatePercentage(metrics.downwardTrend)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.downwardTrend}</span>
          <span className="text-xs text-base-text-secondary">balita tren turun</span>
        </StatMetricCard>

        <StatMetricCard 
          icon={MdCalendarMonth} 
          title="Ditimbang Bulan Ini" 
          iconBgColor="bg-status-blue-light" 
          iconTextColor="text-status-blue-solid" 
          barColor="bg-status-blue-solid" 
          barPercentage={calculatePercentage(metrics.totalChildren - metrics.notWeighedThisMonth)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.totalChildren - metrics.notWeighedThisMonth}</span>
          <span className="text-xs text-base-text-secondary">balita (Bulan Ini)</span>
        </StatMetricCard>
      </div>

      {/* --- TABEL 1: DAFTAR BALITA --- */}
      <div className="bg-base-white rounded-bento-lg shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-base-text-primary w-full md:w-auto">Daftar Balita</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input 
                type="search" 
                placeholder="Cari nama balita..." 
                className="w-full pl-10 pr-4 py-2 border border-base-border/40 bg-base-bg/30 focus:bg-base-white rounded-full text-sm outline-none focus:border-brand-primary transition-all" 
                value={childSearch}
                onChange={(e) => setChildSearch(e.target.value)}
              />
              <MdSearch className="absolute left-3 top-2.5 text-base-text-secondary w-5 h-5" />
            </div>
            <button 
              onClick={() => setShowChildFilter(!showChildFilter)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                showChildFilter 
                  ? "bg-brand-primary border-brand-primary text-base-white shadow-sm" 
                  : "border-base-border/40 text-base-text-secondary hover:bg-base-bg/50"
              }`}
            >
              <span>Filter</span> <MdFilterList className="w-4 h-4" />
            </button>
            {role === "kader" && (
              <Link 
                href="/data-anak/tambah" 
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] cursor-pointer"
              >
                Tambah Balita <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Panel Filter Collapsible */}
        {showChildFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Filter Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Jenis Kelamin</label>
              <select
                value={childFilterGender}
                onChange={(e) => setChildFilterGender(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Jenis Kelamin</option>
                <option value="M">Laki-laki (L)</option>
                <option value="F">Perempuan (P)</option>
              </select>
            </div>

            {/* Filter Status Gizi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Status Gizi (BB/U)</label>
              <select
                value={childFilterStatus}
                onChange={(e) => setChildFilterStatus(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Status Gizi</option>
                <option value="Normal">Normal</option>
                <option value="Gizi Kurang">Gizi Kurang</option>
                <option value="Gizi Buruk">Gizi Buruk</option>
                <option value="Risiko Stunting">Risiko Stunting</option>
                <option value="Sangat Pendek">Sangat Pendek / Stunting</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-3 w-10 text-gray-400">NO.</th>
                <th className="py-2.5 px-3 min-w-[200px] select-none">
                  <div className="flex items-center gap-3">
                    <span>NAMA BALITA & ORANG TUA</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => handleChildSort("name")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${childSortField === "name" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                      >
                        Nama {childSortField === "name" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChildSort("age")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${childSortField === "age" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                      >
                        Usia {childSortField === "age" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                    </div>
                  </div>
                </th>
                <th className="py-2.5 px-3 w-28 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleChildSort("gender")}>
                  <div className="flex items-center gap-1">
                    <span>JK</span>
                    <span className="text-[10px]">{childSortField === "gender" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 min-w-[120px]">BERAT BADAN</th>
                <th className="py-2.5 px-3 min-w-[120px]">TINGGI BADAN</th>
                <th className="py-2.5 px-3 min-w-[150px] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleChildSort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS GIZI (BB/U)</span>
                    <span className="text-[10px]">{childSortField === "status" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-4 px-3"><div className="w-6 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div><div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div></div></td>
                    <td className="py-4 px-3"><div className="w-12 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-3"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-3"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-3"><div className="w-20 h-6 bg-gray-200 animate-pulse rounded-full"></div></td>
                    <td className="py-4 px-3"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedChildren.length === 0 ? (
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
                paginatedChildren.map((child, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-base-bg/40 transition-colors">
                    <td className="py-2.5 px-3 text-base-text-secondary font-medium">
                      {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <GenderIcon gender={child.gender} imageUrl={child.avatarUrl} />
                        <div>
                          <p className="font-bold text-base-text-primary leading-tight">{child.name}</p>
                          <p className="text-xs text-base-text-secondary mt-0.5">{child.age} &bull; Ibu: {child.mother_name || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-base-text-primary font-medium">{child.gender === "M" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="py-2.5 px-3 text-base-text-primary font-semibold whitespace-nowrap">
                      {child.weight ? `${child.weight} kg` : "-"}
                      {child.weightTrend && <TrendArrow trend={child.weightTrend} />}
                    </td>
                    <td className="py-2.5 px-3 text-base-text-primary font-semibold whitespace-nowrap">
                      {child.height ? `${child.height} cm` : "-"}
                    </td>
                    <td className="py-2.5 px-3"><StatusBadge status={child.status} /></td>
                    <td className="py-2.5 px-3 text-center">
                      <Link 
                        href={`/data-anak/${encodeURIComponent(child.child_id)}`}
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
        {filteredChildren.length > 0 && (
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
              <span>dari {filteredChildren.length} Anak</span>
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

      {/* --- TABEL 2: RIWAYAT PENIMBANGAN & PENGUKURAN --- */}
      <div className="bg-base-white rounded-bento-lg shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-bold text-base-text-primary w-full md:w-auto">Riwayat Penimbangan & Pengukuran</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="search" 
                placeholder="Cari nama anak..." 
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
                href="/data-anak/input-penimbangan" 
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] whitespace-nowrap cursor-pointer"
              >
                Input Pengukuran <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Panel Filter Collapsible */}
        {showHistoryFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Filter Status Gizi */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-base-text-secondary block">Status Gizi Hasil Pengukuran</label>
              <select
                value={historyFilterStatus}
                onChange={(e) => setHistoryFilterStatus(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Status Gizi</option>
                <option value="Normal">Normal</option>
                <option value="Gizi Kurang">Gizi Kurang</option>
                <option value="Gizi Buruk">Gizi Buruk</option>
                <option value="Risiko Stunting">Risiko Stunting</option>
                <option value="Sangat Pendek">Sangat Pendek / Stunting</option>
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
                    <span>TANGGAL UKUR</span>
                    <span className="text-[10px]">{historySortField === "date" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("name")}>
                  <div className="flex items-center gap-1">
                    <span>NAMA BALITA</span>
                    <span className="text-[10px]">{historySortField === "name" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4">UMUR UKUR</th>
                <th className="py-2.5 px-4">BERAT BADAN</th>
                <th className="py-2.5 px-4">TINGGI BADAN</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS GIZI (BB/U)</span>
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
                    <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
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
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.age}</td>
                    <td className="py-2.5 px-4 text-base-text-primary font-semibold whitespace-nowrap">{item.weight ? `${item.weight} kg` : "-"}</td>
                    <td className="py-2.5 px-4 text-base-text-primary font-semibold whitespace-nowrap">{item.height ? `${item.height} cm` : "-"}</td>
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