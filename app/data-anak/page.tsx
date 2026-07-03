// src/app/data-anak/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdMonitorWeight, MdOutlineError, MdVaccines, MdTrendingDown,
  MdMale, MdFemale, MdPerson, MdCalendarMonth, MdCake, MdFingerprint,
  MdScale, MdHeight, MdOutlineMonitorWeight as MdOutlineWeight
} from "react-icons/md";
import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";
import { FaBaby, FaNotesMedical } from "react-icons/fa";
import { getChildrenData, getMeasurementHistory, getChildMetrics, getChildDetail } from "@/app/actions/children";
import { getLoggedInMotherData } from "@/app/actions/mothers";
import { useUserRole } from "@/context/UserRoleContext";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

// ==========================================
// 1. MOCK DATA (Data Dummy)
// ==========================================
// Mock data dihilangkan karena data diambil dari Supabase

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

// Komponen Card Metrik Atas
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
      {/* Garis Warna Bawah */}
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

// Komponen Badge Status Gizi
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

// Komponen Ikon Gender
function GenderIcon({ gender, imageUrl }: { gender: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-base-border/25">
        <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  const isMale = gender === "M";
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMale ? 'bg-gender-male-bg text-gender-male-solid' : 'bg-gender-female-bg text-gender-female-solid'}`}>
      {isMale ? <MdMale className="w-5 h-5" /> : <MdFemale className="w-5 h-5" />}
    </div>
  );
}

// Indikator Trend Berat Badan (Naik/Turun/Tetap)
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
  const [motherChildren, setMotherChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [selectedChildDetail, setSelectedChildDetail] = useState<any>(null);
  const [isLoadingChildDetail, setIsLoadingChildDetail] = useState(true);

  // Load mother's children if role === "ibu"
  useEffect(() => {
    async function loadMotherChildren() {
      if (role !== "ibu") return;
      try {
        const loggedInMother = await getLoggedInMotherData(username);
        if (loggedInMother && loggedInMother.children.length > 0) {
          setMotherChildren(loggedInMother.children);
          setSelectedChildId(loggedInMother.children[0].child_id);
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
      try {
        setIsLoadingChildDetail(true);
        const detail = await getChildDetail(selectedChildId);
        setSelectedChildDetail(detail);
      } catch (err) {
        console.error("Failed to load child detail:", err);
      } finally {
        setIsLoadingChildDetail(false);
      }
    }
    loadChildDetail();
  }, [selectedChildId]);

  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [childFilterAge, setChildFilterAge] = useState("");

  const [showHistoryFilter, setShowHistoryFilter] = useState(false);
  const [historyFilterGender, setHistoryFilterGender] = useState("");
  const [historyFilterStatus, setHistoryFilterStatus] = useState("");

  // Sort states for Children list
  const [childSortField, setChildSortField] = useState<"name" | "age" | "mother" | "status" | null>("name");
  const [childSortOrder, setChildSortOrder] = useState<"asc" | "desc">("asc");

  // Sort states for History list
  const [historySortField, setHistorySortField] = useState<"name" | "age" | "date" | "status" | null>(null);
  const [historySortOrder, setHistorySortOrder] = useState<"asc" | "desc">("asc");

  const handleChildSort = (field: "name" | "age" | "mother" | "status") => {
    if (childSortField === field) {
      setChildSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setChildSortField(field);
      setChildSortOrder("asc");
    }
  };

  const handleHistorySort = (field: "name" | "age" | "date" | "status") => {
    if (historySortField === field) {
      setHistorySortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setHistorySortField(field);
      setHistorySortOrder("asc");
    }
  };

  const [metrics, setMetrics] = useState({ 
    totalChildren: 0, 
    notWeighedThisMonth: 0, 
    problematicNutrition: 0, 
    immunizationScheduled: 0, 
    downwardTrend: 0 
  });

  const loadData = async () => {
    try {
      const [children, history, fetchedMetrics] = await Promise.all([
        getChildrenData(),
        getMeasurementHistory(),
        getChildMetrics()
      ]);
      setChildrenList(children);
      setHistoryList(history);
      setMetrics(fetchedMetrics);
      
      localStorage.setItem("offline_children_list", JSON.stringify(children));
      localStorage.setItem("offline_children_history", JSON.stringify(history));
      localStorage.setItem("offline_children_metrics", JSON.stringify(fetchedMetrics));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cachedChildren = localStorage.getItem("offline_children_list");
    const cachedHistory = localStorage.getItem("offline_children_history");
    const cachedMetrics = localStorage.getItem("offline_children_metrics");

    if (cachedChildren) setChildrenList(JSON.parse(cachedChildren));
    if (cachedHistory) setHistoryList(JSON.parse(cachedHistory));
    if (cachedMetrics) setMetrics(JSON.parse(cachedMetrics));
    
    if (cachedChildren || cachedHistory || cachedMetrics) {
      setIsLoading(false);
    }

    if (navigator.onLine) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSync = () => {
      loadData();
    };
    window.addEventListener("sync-data", handleSync);
    return () => window.removeEventListener("sync-data", handleSync);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [childSearch, itemsPerPage, childFilterGender, childFilterStatus, childFilterAge, childSortField, childSortOrder]);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [historySearch, historyItemsPerPage, historyFilterGender, historyFilterStatus, historySortField, historySortOrder]);

  const filteredChildren = childrenList.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(childSearch.toLowerCase()) || 
                          child.mother.toLowerCase().includes(childSearch.toLowerCase());
    const matchesGender = childFilterGender === "" || child.gender === childFilterGender;
    const matchesStatus = childFilterStatus === "" || child.status === childFilterStatus;
    
    let matchesAge = true;
    if (childFilterAge !== "") {
      const ageNum = parseInt(child.age); // parses "24 Bulan" to 24
      if (childFilterAge === "0-12") matchesAge = ageNum >= 0 && ageNum <= 12;
      else if (childFilterAge === "13-24") matchesAge = ageNum >= 13 && ageNum <= 24;
      else if (childFilterAge === "25-36") matchesAge = ageNum >= 25 && ageNum <= 36;
      else if (childFilterAge === "37-60") matchesAge = ageNum >= 37 && ageNum <= 60;
    }
    
    return matchesSearch && matchesGender && matchesStatus && matchesAge;
  });

  const sortedChildren = [...filteredChildren].sort((a, b) => {
    if (!childSortField) return 0;
    
    let comparison = 0;
    if (childSortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (childSortField === "age") {
      comparison = (a.rawAge || 0) - (b.rawAge || 0);
    } else if (childSortField === "mother") {
      comparison = a.mother.localeCompare(b.mother);
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
    const matchesGender = historyFilterGender === "" || item.gender === historyFilterGender;
    const matchesStatus = historyFilterStatus === "" || item.status === historyFilterStatus;
    
    return matchesSearch && matchesGender && matchesStatus;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (!historySortField) return 0;

    let comparison = 0;
    if (historySortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (historySortField === "age") {
      comparison = (a.rawAge || 0) - (b.rawAge || 0);
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

  if (role === "ibu") {
    if (isLoadingChildDetail) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!selectedChildDetail) {
      return (
        <div className="bg-base-white p-8 rounded-xl shadow-sm border border-base-border/30 text-center">
          <p className="text-base-text-secondary font-bold">Data Kesehatan Anak tidak ditemukan.</p>
        </div>
      );
    }

    const child = selectedChildDetail;
    const zScoreBB = child.zScoreBB;
    const zScoreTB = child.zScoreTB;
    const nutritionStatus = child.status;

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

    const chronologicalMeasurements = [...child.measurements].reverse();
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
      <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
        
        {/* Child Selector Tabs (if multiple children) */}
        {motherChildren.length > 1 && (
          <div className="flex bg-base-white p-1 rounded-2xl border border-base-border/30 max-w-md shadow-sm">
            {motherChildren.map((c) => (
              <button
                key={c.child_id}
                type="button"
                onClick={() => setSelectedChildId(c.child_id)}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedChildId === c.child_id
                    ? "bg-brand-primary text-base-white shadow-md shadow-brand-primary/15"
                    : "text-base-text-secondary hover:text-base-text-primary"
                }`}
              >
                {c.child_name}
              </button>
            ))}
          </div>
        )}

        {/* Child Identity Card */}
        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border shrink-0 overflow-hidden ${
              child.gender === "M" 
                ? "bg-gender-male-bg text-gender-male-solid border-gender-male-solid/10" 
                : "bg-gender-female-bg text-gender-female-solid border-gender-female-solid/10"
            }`}>
              {child.avatarUrl ? (
                <img src={child.avatarUrl} alt={child.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(child.name)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">{child.name}</h1>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-base-text-secondary mt-1.5 font-semibold">
                <span>NIK: {child.national_id || "-"}</span>
                <span>&bull;</span>
                <span>ID Anak: {child.child_id}</span>
                <span>&bull;</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${getStatusBadgeStyle(child.status)}`}>
                  Status Gizi: {child.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side: Identitas & Kondisi Medis */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card: Identitas Balita */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <FaBaby className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Identitas Balita</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Jenis Kelamin</span>
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    {child.gender === "M" ? (
                      <>
                        <MdMale className="w-4 h-4 text-status-blue-solid" /> Laki-laki
                      </>
                    ) : (
                      <>
                        <MdFemale className="w-4 h-4 text-brand-primary" /> Perempuan
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Tempat / Tanggal Lahir</span>
                  <p className="text-sm font-bold text-base-text-primary">{child.birth_place || "-"}, {child.dob}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Usia Saat Ini</span>
                  <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{child.ageInMonths} Bulan</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Anak Ke-</span>
                  <p className="text-sm font-bold text-base-text-primary">Ke-{child.birth_order || 1}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Golongan Darah</span>
                  <p className="text-sm font-bold text-base-text-primary uppercase">{child.blood_type || "-"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Ibu Kandung</span>
                  <p className="text-sm font-bold text-base-text-primary">{child.mother_name}</p>
                </div>
              </div>
            </div>

            {/* Card: Antropometri Lahir & Pengukuran Terbaru */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
              
              {/* Lahir */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-base-border/10 pb-2">
                  <FaBaby className="w-4 h-4 text-brand-primary" />
                  <h3 className="font-bold text-sm text-base-text-primary">Kondisi Saat Lahir</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-base-bg/30 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Lahir</span>
                    <p className="text-lg font-bold text-base-text-primary mt-1">{child.birth_weight} kg</p>
                  </div>
                  <div className="bg-base-bg/30 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Panjang Lahir</span>
                    <p className="text-lg font-bold text-base-text-primary mt-1">{child.birth_length} cm</p>
                  </div>
                </div>
              </div>

              {/* Terbaru */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-base-border/10 pb-2">
                  <FaNotesMedical className="w-4 h-4 text-brand-primary" />
                  <h3 className="font-bold text-sm text-base-text-primary">Pengukuran Terbaru</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                    <MdMonitorWeight className="w-4 h-4 text-brand-primary absolute top-2 right-2" />
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Sekarang</span>
                    <p className="text-xl font-bold text-brand-primary mt-1">{child.current_weight} kg</p>
                  </div>
                  <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                    <MdHeight className="w-4 h-4 text-brand-primary absolute top-2 right-2" />
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Sekarang</span>
                    <p className="text-xl font-bold text-brand-primary mt-1">{child.current_height} cm</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Card: Kondisi Medis & Alergi */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <FaNotesMedical className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Kondisi Medis &amp; Alergi</h2>
              </div>
              
              {(!child.special_conditions || child.special_conditions.length === 0) ? (
                <p className="text-xs text-base-text-secondary italic">Tidak ada kondisi khusus / riwayat alergi.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {child.special_conditions.map((tag: string) => (
                      <span key={tag} className="bg-brand-soft/50 text-brand-primary border border-brand-primary/20 rounded-full px-3 py-1 text-xs font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {child.special_conditions.includes("Lainnya...") && child.special_conditions_notes && (
                    <div className="bg-base-bg/30 p-3 rounded-xl border border-base-border/20">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block mb-1">Catatan Tambahan</span>
                      <p className="text-xs text-base-text-primary font-medium">{child.special_conditions_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Tren Tumbuh Kembang & Z-Score (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card: Grafik Tren */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></span>
                  <h2 className="font-bold text-base-text-primary text-base">Tren Tumbuh Kembang Balita</h2>
                </div>
                <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                  {child.measurements.length} kunjungan
                </span>
              </div>

              {hasHistory ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-base-text-secondary">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-3 h-0.5 bg-brand-primary inline-block"></span>
                      <span>Berat Badan (kg)</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
                      <span>Tinggi Badan (cm)</span>
                    </div>
                  </div>

                  <div className="relative border border-base-border/20 rounded-2xl p-4 bg-base-bg/5 flex items-center justify-center">
                    <svg className="w-full max-w-[500px] h-[160px]" viewBox="0 0 500 160">
                      <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="20" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                      <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={heightPoints} />
                      <polyline fill="none" stroke="#ea2986" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={weightPoints} />

                      {chronologicalMeasurements.map((m: any, i: number) => {
                        const maxWeight = Math.max(...chronologicalMeasurements.map((x: any) => x.weight), 15);
                        const minWeight = Math.min(...chronologicalMeasurements.map((x: any) => x.weight), 3);
                        const wDiff = maxWeight - minWeight || 1;
                        const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                        const y = 140 - ((m.weight - minWeight) / wDiff) * 100;
                        return <circle key={`w-${i}`} cx={x} cy={y} r="4" fill="#ea2986" stroke="#fff" strokeWidth="1.5" />;
                      })}

                      {chronologicalMeasurements.map((m: any, i: number) => {
                        const maxHeight = Math.max(...chronologicalMeasurements.map((x: any) => x.height), 110);
                        const minHeight = Math.min(...chronologicalMeasurements.map((x: any) => x.height), 40);
                        const hDiff = maxHeight - minHeight || 1;
                        const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                        const y = 140 - ((m.height - minHeight) / hDiff) * 100;
                        return <circle key={`h-${i}`} cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />;
                      })}
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

            {/* Card: Status Gizi (WHO Z-Score) */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <MdOutlineWeight className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Analisis Status Gizi (WHO Z-Score)</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Badan vs Umur</span>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeStyle(nutritionStatus)}`}>
                    {nutritionStatus}
                  </span>
                  <p className="text-[10px] text-base-text-secondary mt-1.5 font-semibold">Z-Score: {zScoreBB ? zScoreBB.toFixed(2) : "0.00"} SD</p>
                </div>

                <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Badan vs Umur</span>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getStatusBadgeStyle(nutritionStatus)}`}>
                    {nutritionStatus}
                  </span>
                  <p className="text-[10px] text-base-text-secondary mt-1.5 font-semibold">Z-Score: {zScoreTB ? zScoreTB.toFixed(2) : "0.00"} SD</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* History Table */}
        <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
            <MdScale className="w-5 h-5 text-brand-primary" />
            <h2 className="font-bold text-base-text-primary text-base">Riwayat Kunjungan &amp; Penimbangan Balita</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal Kunjungan</th>
                  <th className="py-3 px-4 text-center">Umur</th>
                  <th className="py-3 px-4 text-center">Berat (kg)</th>
                  <th className="py-3 px-4 text-center">Tinggi (cm)</th>
                  <th className="py-3 px-4 text-center">Lkr. Kepala (cm)</th>
                  <th className="py-3 px-4 text-center">Vit A</th>
                  <th className="py-3 px-4 text-center">Obat Cacing</th>
                  <th className="py-3 px-4 text-center">Imunisasi</th>
                  <th className="py-3 px-4 text-center">PMT</th>
                  <th className="py-3 px-4">Catatan Kader</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {child.measurements.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-base-text-secondary text-xs">Belum ada riwayat penimbangan posyandu.</td>
                  </tr>
                ) : (
                  child.measurements.map((m: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{m.date}</td>
                      <td className="py-3 px-4 text-center font-bold text-base-text-primary">{m.ageAtVisit} Bulan</td>
                      <td className="py-3 px-4 text-center font-bold text-brand-primary">{m.weight ? `${m.weight} kg` : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.height ? `${m.height} cm` : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.head_circumference ? `${m.head_circumference} cm` : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.vitamin_a_capsule || "-"}</td>
                      <td className="py-3 px-4 text-center">{m.deworming_pill === "Ya" || m.deworming_pill === true ? "✓" : "-"}</td>
                      <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.immunizations || "-"}</td>
                      <td className="py-3 px-4 text-center">{m.supplementary_feeding === "Ya" || m.supplementary_feeding === true ? "✓" : "-"}</td>
                      <td className="py-3 px-4 text-base-text-secondary font-medium italic">{m.cadre_notes || "-"}</td>
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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* --- GRID METRIK (4 KARTU BENTO) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard 
          icon={MdMonitorWeight} 
          title="Belum Ditimbang" 
          iconBgColor="bg-brand-soft" 
          iconTextColor="text-brand-primary" 
          barColor="bg-brand-primary"
          barPercentage={calculatePercentage(metrics.notWeighedThisMonth)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.notWeighedThisMonth}</span>
          <span className="text-xs text-base-text-secondary">dari</span>
          <span className="text-sm font-bold text-brand-primary">{metrics.totalChildren}</span>
          <span className="text-xs text-base-text-secondary">balita</span>
        </StatMetricCard>
        
        <StatMetricCard 
          icon={MdOutlineError} 
          title="Gizi Bermasalah" 
          iconBgColor="bg-status-orange-light" 
          iconTextColor="text-status-orange-solid" 
          barColor="bg-status-orange-solid" 
          barPercentage={calculatePercentage(metrics.problematicNutrition)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.problematicNutrition}</span>
          <span className="text-xs text-base-text-secondary">dari</span>
          <span className="text-sm font-bold text-status-orange-solid">{metrics.totalChildren}</span>
          <span className="text-xs text-base-text-secondary">balita</span>
        </StatMetricCard>

        <StatMetricCard 
          icon={MdVaccines} 
          title="Jadwal Imunisasi" 
          iconBgColor="bg-status-green-light" 
          iconTextColor="text-status-green-solid" 
          barColor="bg-status-green-solid"
          barPercentage={calculatePercentage(metrics.immunizationScheduled)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.immunizationScheduled}</span>
          <span className="text-xs text-base-text-secondary">balita (Bulan Ini)</span>
        </StatMetricCard>
        
        <StatMetricCard 
          icon={MdTrendingDown} 
          title="Tumbuh Kembang" 
          iconBgColor="bg-status-pink-light" 
          iconTextColor="text-status-pink-solid" 
          barColor="bg-status-pink-solid" 
          barPercentage={calculatePercentage(metrics.downwardTrend)}
          isLoading={isLoading}
        >
          <span className="text-2xl font-bold text-base-text-primary">{metrics.downwardTrend}</span>
          <span className="text-xs text-base-text-secondary">balita trend turun</span>
        </StatMetricCard>
      </div>

      {/* --- TABEL 1: DAFTAR ANAK --- */}
      <div className="bg-base-white rounded-2xl shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-base-text-primary whitespace-nowrap">Daftar Anak</h2>
          
          {/* Action Toolbar */}
          <div className="flex items-center gap-3 w-full flex-1 justify-end">
            <div className="relative flex-1 ml-8">
              <input 
                type="search" 
                placeholder="Cari nama anak atau nama ibu..." 
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
              <Link href="/data-anak/tambah" className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)]">
                Tambah Anak <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showChildFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Gender Filter */}
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

            {/* Status Gizi Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Status Gizi</label>
              <select
                value={childFilterStatus}
                onChange={(e) => setChildFilterStatus(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Status Gizi</option>
                <option value="Normal">Normal</option>
                <option value="Risiko Stunting">Risiko Stunting</option>
                <option value="Gizi Kurang">Gizi Kurang</option>
                <option value="Gizi Buruk">Gizi Buruk</option>
              </select>
            </div>

            {/* Umur Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Kategori Umur</label>
              <select
                value={childFilterAge}
                onChange={(e) => setChildFilterAge(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Umur</option>
                <option value="0-12">0 - 12 Bulan</option>
                <option value="13-24">13 - 24 Bulan</option>
                <option value="25-36">25 - 36 Bulan</option>
                <option value="37-60">37 - 60 Bulan</option>
              </select>
            </div>
          </div>
        )}

        {/* Wrapper Table agar bisa di-scroll horizontal di layar kecil */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-gray-400">NO.</th>
                <th className="py-2.5 px-4 select-none">
                  <div className="flex items-center gap-3">
                    <span>NAMA ANAK</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => handleChildSort("name")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${childSortField === "name" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Nama"
                      >
                        Nama {childSortField === "name" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleChildSort("age")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${childSortField === "age" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Usia"
                      >
                        Usia {childSortField === "age" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                    </div>
                  </div>
                </th>
                <th className="py-2.5 px-4">TANGGAL LAHIR</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleChildSort("mother")}>
                  <div className="flex items-center gap-1">
                    <span>NAMA IBU</span>
                    <span className="text-[10px]">{childSortField === "mother" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4">TB / BB</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleChildSort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS GIZI</span>
                    <span className="text-[10px]">{childSortField === "status" ? (childSortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
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
                    <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div><div className="w-32 h-4 bg-gray-200 animate-pulse rounded"></div></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-4 px-4"><div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedChildren.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-sm text-base-text-secondary font-semibold">Tidak ada data ditemukan</p>
                      <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-bold hover:bg-brand-soft/80 transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 20v-5h-.581m0 0a8.003 8.003 0 11-15.357-2" />
                        </svg>
                        Segarkan Data
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedChildren.map((child, index) => {
                  const hoverColor = child.gender === 'M' ? 'hover:bg-blue-50/70' : 'hover:bg-pink-50/70';
                  
                  return (
                    <tr key={index} className={`border-b border-gray-50 transition-colors ${hoverColor}`}>
                      <td className="py-2.5 px-4 text-base-text-secondary font-medium">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <GenderIcon gender={child.gender} imageUrl={child.avatarUrl} />
                        <div>
                          <p className="font-bold text-base-text-primary leading-tight">{child.name}</p>
                          <p className="text-xs text-base-text-secondary mt-0.5">{child.age}</p>
                        </div>
                      </td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{child.dob}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center shrink-0">
                          <MdPerson className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-base-text-primary font-semibold">{child.mother}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-base-text-primary font-bold">
                      {child.height} cm / {child.weight} kg <TrendArrow trend={child.trend} />
                    </td>
                    <td className="py-2.5 px-4"><StatusBadge status={child.status} /></td>
                    <td className="py-2.5 px-4 text-center">
                      <Link 
                        href={`/data-anak/${child.child_id}`}
                        className="inline-block px-3 py-1.5 border border-base-border/50 text-base-text-primary rounded-lg text-xs font-semibold hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/20 transition-all cursor-pointer"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                );
              })
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
          </div>
        )}
      </div>

      {/* --- TABEL 2: RIWAYAT PENIMBANGAN --- */}
      <div className="bg-base-white rounded-bento-lg shadow-sm border border-base-border/30 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-base-text-primary">Riwayat Penimbangan</h2>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
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
              <Link href="/data-anak/input-penimbangan" className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)]">
                Input Penimbangan <MdAdd className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showHistoryFilter && (
          <div className="bg-base-bg/30 p-4 rounded-xl border border-base-border/20 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            {/* Gender Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Jenis Kelamin</label>
              <select
                value={historyFilterGender}
                onChange={(e) => setHistoryFilterGender(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Jenis Kelamin</option>
                <option value="M">Laki-laki (L)</option>
                <option value="F">Perempuan (P)</option>
              </select>
            </div>

            {/* Status Gizi Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-text-secondary block">Status Gizi</label>
              <select
                value={historyFilterStatus}
                onChange={(e) => setHistoryFilterStatus(e.target.value)}
                className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
              >
                <option value="">Semua Status Gizi</option>
                <option value="Normal">Normal</option>
                <option value="Risiko Stunting">Risiko Stunting</option>
                <option value="Gizi Kurang">Gizi Kurang</option>
                <option value="Gizi Buruk">Gizi Buruk</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-gray-400">NO.</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("date")}>
                  <div className="flex items-center gap-1">
                    <span>TANGGAL TIMBANG</span>
                    <span className="text-[10px]">{historySortField === "date" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 select-none">
                  <div className="flex items-center gap-3">
                    <span>NAMA ANAK</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => handleHistorySort("name")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${historySortField === "name" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Nama"
                      >
                        Nama {historySortField === "name" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleHistorySort("age")}
                        className={`hover:text-brand-primary flex items-center gap-0.5 text-[9px] font-bold tracking-normal cursor-pointer select-none px-1.5 py-0.5 rounded border border-base-border/30 bg-base-white transition-all ${historySortField === "age" ? "text-brand-primary border-brand-primary bg-brand-soft/10" : "text-base-text-secondary"}`}
                        title="Urutkan Usia"
                      >
                        Usia {historySortField === "age" ? (historySortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </button>
                    </div>
                  </div>
                </th>
                <th className="py-2.5 px-4">BERAT BADAN</th>
                <th className="py-2.5 px-4">TINGGI BADAN</th>
                <th className="py-2.5 px-4 cursor-pointer select-none hover:text-brand-primary" onClick={() => handleHistorySort("status")}>
                  <div className="flex items-center gap-1">
                    <span>STATUS GIZI</span>
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
                    <td className="py-4 px-4"><div className="w-16 h-6 bg-gray-200 animate-pulse rounded-full"></div></td>
                    <td className="py-4 px-4"><div className="w-20 h-8 bg-gray-200 animate-pulse rounded-lg"></div></td>
                  </tr>
                ))
              ) : paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-sm text-base-text-secondary font-semibold">Tidak ada data ditemukan</p>
                      <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-soft text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-bold hover:bg-brand-soft/80 transition cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 20v-5h-.581m0 0a8.003 8.003 0 11-15.357-2" />
                        </svg>
                        Segarkan Data
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => {
                  const hoverColor = item.gender === 'M' ? 'hover:bg-blue-50/70' : 'hover:bg-pink-50/70';
                  
                  return (
                    <tr key={index} className={`border-b border-gray-50 transition-colors ${hoverColor}`}>
                      <td className="py-2.5 px-4 text-base-text-secondary font-medium">
                        {String((currentHistoryPage - 1) * historyItemsPerPage + index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.date}</td>
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <GenderIcon gender={item.gender} imageUrl={item.avatarUrl} />
                        <div>
                          <p className="font-bold text-base-text-primary leading-tight">{item.name}</p>
                          <p className="text-xs text-base-text-secondary mt-0.5">{item.age}</p>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-base-text-primary font-bold">
                        {item.weight} kg <TrendArrow trend={item.trend} />
                      </td>
                      <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.height} cm</td>
                      <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                    <td className="py-2.5 px-4 text-center">
                      <button className="px-3 py-1.5 border border-base-border/50 text-base-text-primary rounded-lg text-xs font-semibold hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/20 transition-all">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                );
              })
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
          </div>
        )}
      </div>

    </div>
  );
}