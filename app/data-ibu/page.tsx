"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdOutlineError, MdPerson, MdCalendarMonth, MdPregnantWoman,
  MdPhone, MdBloodtype, MdMale, MdFemale
} from "react-icons/md";
import { FaUserNurse, FaUserFriends, FaHeartbeat } from "react-icons/fa";
import { getMothersData, getMaternalHistory, getMotherMetrics, getLoggedInMotherData, getMotherDetail } from "@/app/actions/mothers";
import { useUserRole } from "@/context/UserRoleContext";

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

  useEffect(() => {
    async function loadMotherDetail() {
      if (role !== "ibu") return;
      try {
        setIsLoadingMother(true);
        const loggedInMother = await getLoggedInMotherData(username);
        if (loggedInMother) {
          const detail = await getMotherDetail(loggedInMother.mother_id);
          setMotherDetail(detail);
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

  const [mothersList, setMothersList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalMothers: 0, mothersKek: 0, highRiskPregnancies: 0, dueThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);

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

  const loadData = async () => {
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
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
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
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
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
          <div className="lg:col-span-6 space-y-6">
            
            {/* Card: Identitas Ibu */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <MdPerson className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Identitas Ibu</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Tanggal Lahir</span>
                  <p className="text-sm font-bold text-base-text-primary">{motherDetail.dob}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Usia Saat Ini</span>
                  <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{motherDetail.age}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Nama Suami</span>
                  <p className="text-sm font-bold text-base-text-primary">{motherDetail.husband_name}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">No. Telepon / WA</span>
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    <MdPhone className="w-3.5 h-3.5 text-base-text-secondary" /> {motherDetail.phone_number}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Golongan Darah</span>
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    <MdBloodtype className="w-4 h-4 text-status-red-solid" /> {motherDetail.blood_type}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Jumlah Anak</span>
                  <p className="text-sm font-bold text-base-text-primary">{motherDetail.number_of_children} anak</p>
                </div>
              </div>
            </div>

            {/* Card: Status Kehamilan / Nifas */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                <MdPregnantWoman className="w-5 h-5 text-brand-primary" />
                <h2 className="font-bold text-base-text-primary text-base">Status Kehamilan & Persalinan</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Status Ibu</span>
                  <p className="text-sm font-bold text-base-text-primary mt-1">{motherDetail.status}</p>
                </div>

                <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Kondisi Risiko</span>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getConditionColor(motherDetail.condition)}`}>
                    {motherDetail.condition}
                  </span>
                </div>

                <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">HPL / Bersalin</span>
                  <p className="text-sm font-bold text-base-text-primary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{motherDetail.hpl}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Daftar Anak Kandung */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Card: Daftar Anak Kandung Terhubung */}
            <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="w-5 h-5 text-brand-primary" />
                    <h2 className="font-bold text-base-text-primary text-base">Anak Terdaftar Saya</h2>
                  </div>
                  <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                    {motherDetail.children.length} Balita
                  </span>
                </div>

                {motherDetail.children.length === 0 ? (
                  <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center text-sm text-base-text-secondary">
                    Belum ada data anak terdaftar yang terhubung.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="mt-4 pt-3 border-t border-base-border/10 flex justify-end">
                          <Link 
                            href={`/data-anak/${child.child_id}`}
                            className="text-xs font-bold text-brand-primary hover:underline transition cursor-pointer"
                          >
                            Lihat Detail Balita &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-base-text-secondary mt-4 leading-relaxed">
                * Relasi data di atas berdasarkan pencocokan nomor induk data keluarga yang tersimpan di rekam medis posyandu.
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
                  <td colSpan={7} className="text-center py-10 text-base-text-secondary">Tidak ada data ditemukan</td>
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
                        href={`/data-ibu/${mother.mother_id}`}
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
                  <td colSpan={8} className="text-center py-10 text-base-text-secondary">Tidak ada data ditemukan</td>
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
