// src/app/data-anak/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdMonitorWeight, MdOutlineError, MdVaccines, MdTrendingDown,
  MdMale, MdFemale, MdPerson
} from "react-icons/md";
import { FiArrowUp, FiArrowDown, FiMinus } from "react-icons/fi";
import { getChildrenData, getMeasurementHistory, getChildMetrics } from "@/app/actions/children";

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
  return (
    <span className="px-3 py-1 bg-base-bg text-base-text-secondary text-xs font-semibold rounded-full">
      {status}
    </span>
  );
}

// Komponen Ikon Gender
function GenderIcon({ gender }: { gender: string }) {
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

  const [metrics, setMetrics] = useState({ 
    totalChildren: 0, 
    notWeighedThisMonth: 0, 
    problematicNutrition: 0, 
    immunizationScheduled: 0, 
    downwardTrend: 0 
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [children, history, fetchedMetrics] = await Promise.all([
          getChildrenData(),
          getMeasurementHistory(),
          getChildMetrics()
        ]);
        setChildrenList(children);
        setHistoryList(history);
        setMetrics(fetchedMetrics);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [childSearch, itemsPerPage, childFilterGender, childFilterStatus, childFilterAge]);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [historySearch, historyItemsPerPage, historyFilterGender, historyFilterStatus]);

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

  const totalPages = Math.ceil(filteredChildren.length / itemsPerPage);
  const paginatedChildren = filteredChildren.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(historySearch.toLowerCase());
    const matchesGender = historyFilterGender === "" || item.gender === historyFilterGender;
    const matchesStatus = historyFilterStatus === "" || item.status === historyFilterStatus;
    
    return matchesSearch && matchesGender && matchesStatus;
  });

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
  const paginatedHistory = filteredHistory.slice(
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <Link href="/data-anak/tambah" className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)]">
              Tambah Anak <MdAdd className="w-4 h-4" />
            </Link>
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
                <th className="py-2.5 px-4">NAMA ANAK</th>
                <th className="py-2.5 px-4">TANGGAL LAHIR</th>
                <th className="py-2.5 px-4">NAMA IBU</th>
                <th className="py-2.5 px-4">TB / BB</th>
                <th className="py-2.5 px-4">STATUS GIZI</th>
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
                  <td colSpan={7} className="text-center py-10 text-base-text-secondary">Tidak ada data ditemukan</td>
                </tr>
              ) : (
                paginatedChildren.map((child, index) => {
                  const hoverColor = child.gender === 'M' ? 'hover:bg-blue-50/70' : 'hover:bg-pink-50/70';
                  
                  return (
                    <tr key={index} className={`border-b border-gray-50 transition-colors ${hoverColor}`}>
                      <td className="py-2.5 px-4 text-base-text-secondary font-medium">{child.id}</td>
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <GenderIcon gender={child.gender} />
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
            <Link href="/data-anak/input-penimbangan" className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)]">
              Input Penimbangan <MdAdd className="w-4 h-4" />
            </Link>
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
                <th className="py-2.5 px-4">TANGGAL TIMBANG</th>
                <th className="py-2.5 px-4">NAMA ANAK</th>
                <th className="py-2.5 px-4">BERAT BADAN</th>
                <th className="py-2.5 px-4">TINGGI BADAN</th>
                <th className="py-2.5 px-4">STATUS GIZI</th>
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
                  <td colSpan={7} className="text-center py-10 text-base-text-secondary">Tidak ada data ditemukan</td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => {
                  const hoverColor = item.gender === 'M' ? 'hover:bg-blue-50/70' : 'hover:bg-pink-50/70';
                  
                  return (
                    <tr key={index} className={`border-b border-gray-50 transition-colors ${hoverColor}`}>
                      <td className="py-2.5 px-4 text-base-text-secondary font-medium">{item.id}</td>
                      <td className="py-2.5 px-4 text-base-text-primary font-medium">{item.date}</td>
                      <td className="py-2.5 px-4 flex items-center gap-3">
                        <GenderIcon gender={item.gender} />
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
            <p>{currentHistoryPage} dari {totalHistoryPages}</p>
          </div>
        )}
      </div>

    </div>
  );
}