"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdSearch, MdFilterList, MdAdd, 
  MdOutlineError, MdPerson, MdCalendarMonth, MdPregnantWoman
} from "react-icons/md";
import { FaUserNurse } from "react-icons/fa";
import { getMothersData, getMaternalHistory, getMotherMetrics } from "@/app/actions/mothers";

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
  if (status.includes("KEK") || status.includes("Risiko")) {
    return (
      <span className="px-3 py-1 bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 text-xs font-semibold rounded-full">
        {status}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-brand-soft text-brand-primary border border-brand-primary/25 text-xs font-semibold rounded-full">
      {status}
    </span>
  );
}

function MotherTypeBadge({ type }: { type: string }) {
  if (type === "Calon Ibu") {
    return (
      <span className="px-3 py-1 bg-status-pink-light text-brand-primary border border-brand-primary/25 text-xs font-semibold rounded-full">
        Calon Ibu
      </span>
    );
  }
  if (type === "Ibu Hamil") {
    return (
      <span className="px-3 py-1 bg-status-blue-light text-status-blue-solid border border-status-blue-solid/25 text-xs font-semibold rounded-full">
        Ibu Hamil
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-status-green-light text-status-green-solid border border-status-green-solid/25 text-xs font-semibold rounded-full">
      {type}
    </span>
  );
}

// ==========================================
// 3. KOMPONEN UTAMA HALAMAN
// ==========================================
export default function DataIbuPage() {
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

  useEffect(() => {
    async function loadData() {
      try {
        const [mothers, history, fetchedMetrics] = await Promise.all([
          getMothersData(),
          getMaternalHistory(),
          getMotherMetrics()
        ]);
        setMothersList(mothers);
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
  }, [motherSearch, itemsPerPage, motherFilterStatus, motherFilterCondition]);

  useEffect(() => {
    setCurrentHistoryPage(1);
  }, [historySearch, historyItemsPerPage, historyFilterCondition]);

  const filteredMothers = mothersList.filter(mother => {
    const matchesSearch = mother.name.toLowerCase().includes(motherSearch.toLowerCase());
    const matchesStatus = motherFilterStatus === "" || mother.status === motherFilterStatus;
    const matchesCondition = motherFilterCondition === "" || mother.condition === motherFilterCondition;
    
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const totalPages = Math.ceil(filteredMothers.length / itemsPerPage);
  const paginatedMothers = filteredMothers.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(historySearch.toLowerCase());
    const matchesCondition = historyFilterCondition === "" || item.status === historyFilterCondition;
    
    return matchesSearch && matchesCondition;
  });

  const totalHistoryPages = Math.ceil(filteredHistory.length / historyItemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentHistoryPage - 1) * historyItemsPerPage,
    currentHistoryPage * historyItemsPerPage
  );

  const calculatePercentage = (value: number) => {
    if (metrics.totalMothers === 0) return 0;
    return Math.round((value / metrics.totalMothers) * 100);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      
      {/* --- GRID METRIK (4 KARTU BENTO) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <Link 
              href="/data-ibu/tambah" 
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] cursor-pointer"
            >
              Tambah Ibu <MdAdd className="w-4 h-4" />
            </Link>
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-gray-400">NO.</th>
                <th className="py-2.5 px-4">NAMA IBU & USIA</th>
                <th className="py-2.5 px-4">STATUS</th>
                <th className="py-2.5 px-4">USIA KANDUNGAN / NIFAS</th>
                <th className="py-2.5 px-4">HPL / TGL BERSALIN</th>
                <th className="py-2.5 px-4">KONDISI</th>
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
                    <td className="py-2.5 px-4 text-base-text-secondary font-medium">{mother.id}</td>
                    <td className="py-2.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center shrink-0">
                        <MdPerson className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="font-bold text-base-text-primary leading-tight">{mother.name}</p>
                        <p className="text-xs text-base-text-secondary mt-0.5">{mother.age}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-4"><MotherTypeBadge type={mother.status} /></td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{mother.gestationalAge}</td>
                    <td className="py-2.5 px-4 text-base-text-primary font-medium">{mother.hpl}</td>
                    <td className="py-2.5 px-4"><StatusBadge status={mother.condition} /></td>
                    <td className="py-2.5 px-4 text-center">
                      <Link 
                        href={`/data-ibu/${mother.mother_id}`}
                        className="inline-block px-3 py-1.5 border border-base-border/50 text-base-text-primary rounded-lg text-xs font-semibold hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/20 transition-all cursor-pointer"
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
            <Link 
              href="/data-ibu/input-pemeriksaan" 
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-[0_4px_12px_rgba(234,41,134,0.15)] whitespace-nowrap cursor-pointer"
            >
              Input Pemeriksaan <MdAdd className="w-4 h-4" />
            </Link>
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
                <th className="py-2.5 px-4">TANGGAL PERIKSA</th>
                <th className="py-2.5 px-4">NAMA IBU</th>
                <th className="py-2.5 px-4">BERAT BADAN</th>
                <th className="py-2.5 px-4">TENSI</th>
                <th className="py-2.5 px-4">LILA / FUNDUS</th>
                <th className="py-2.5 px-4">STATUS KONDISI</th>
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
                    <td className="py-2.5 px-4 text-base-text-secondary font-medium">{item.id}</td>
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
