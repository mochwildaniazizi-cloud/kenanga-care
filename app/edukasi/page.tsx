"use client";
 
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdDashboard, MdVaccines, MdPregnantWoman, 
  MdChildCare, MdOutlineLocalDining, MdOutlineExtension,
  MdAdd, MdBookmark, MdSearch, MdMenuBook, MdFavorite,
  MdInfo, MdCheckCircleOutline, MdBabyChangingStation
} from "react-icons/md";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import ArticleCard from "@/components/ArticleCard";
import { mockArticles } from "./data";
import type { CategoryType } from "./data";
import { useUserRole } from "@/context/UserRoleContext";
 
type TabType = CategoryType | "Semua" | "Tersimpan";
 
export default function EdukasiPage() {
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>("Semua");
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedHistory, setViewedHistory] = useState<string[]>([]);
  const [historyPageIndex, setHistoryPageIndex] = useState<number>(0);
  const [journeyFilter, setJourneyFilter] = useState<"Semua" | "Ibu" | "Anak">("Semua");
 
  useEffect(() => {
    const loadData = () => {
      const local = localStorage.getItem("custom_articles");
      let customList: any[] = [];
      if (local) {
        try {
          customList = JSON.parse(local);
        } catch (e) {
          console.error("Failed to parse custom articles", e);
        }
      }
   
      const deleted = localStorage.getItem("deleted_articles_ids");
      let deletedIds = new Set<string>();
      if (deleted) {
        try {
          deletedIds = new Set(JSON.parse(deleted));
        } catch (e) {
          console.error("Failed to parse deleted articles list", e);
        }
      }
   
      // Filter and deduplicate
      const customIds = new Set(customList.map((a: any) => a.id));
      const filteredMock = mockArticles.filter(a => !deletedIds.has(a.id) && !customIds.has(a.id));
      const filteredCustom = customList.filter((a: any) => !deletedIds.has(a.id));
   
      setArticles([...filteredMock, ...filteredCustom]);
   
      // Load saved bookmarks from localStorage
      const bookmarks = localStorage.getItem("saved_articles_ids");
      if (bookmarks) {
        try {
          const ids = JSON.parse(bookmarks) as string[];
          setSavedArticles(new Set(ids));
        } catch (e) {
          console.error("Failed to parse saved articles bookmarks", e);
        }
      }
  
      // Load viewed history from localStorage
      const historyJson = localStorage.getItem("viewed_articles_history");
      let historyList: string[] = [];
      if (historyJson) {
        try {
          historyList = JSON.parse(historyJson);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Pre-populate if empty
        historyList = ["L4", "L5", "L11", "L12", "L14", "L15", "L20", "L23"];
        localStorage.setItem("viewed_articles_history", JSON.stringify(historyList));
      }
      setViewedHistory(historyList);
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  const toggleBookmark = (id: string) => {
    setSavedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("saved_articles_ids", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const UTILITY_TABS = [
    { 
      id: "Semua" as TabType, label: "Semua", icon: MdDashboard, 
      colorStyle: "border-base-text-secondary/30 text-base-text-secondary hover:bg-base-text-secondary/5", 
      activeStyle: "bg-base-text-secondary text-base-white border-base-text-secondary", 
    },
    { 
      id: "Tersimpan" as TabType, label: "Tersimpan", icon: MdBookmark, 
      colorStyle: "border-brand-primary text-brand-primary hover:bg-brand-soft/20", 
      activeStyle: "bg-brand-primary text-base-white border-brand-primary" 
    },
  ];

  const PERJALANAN_IBU_TABS = [
    { 
      id: "Kehamilan" as TabType, label: "Kehamilan", icon: MdPregnantWoman, 
      colorStyle: "border-[#EA2986]/30 text-[#EA2986] hover:bg-[#FCE8F0]/30", 
      activeStyle: "bg-[#EA2986] text-base-white border-[#EA2986]" 
    },
    { 
      id: "Melahirkan" as TabType, label: "Melahirkan", icon: MdCheckCircleOutline, 
      colorStyle: "border-[#4A85F6]/30 text-[#4A85F6] hover:bg-[#ECF2FE]/30", 
      activeStyle: "bg-[#4A85F6] text-base-white border-[#4A85F6]" 
    },
    { 
      id: "Setelah Melahirkan" as TabType, label: "Setelah Melahirkan", icon: MdBabyChangingStation, 
      colorStyle: "border-[#7A5AF8]/30 text-[#7A5AF8] hover:bg-[#F5F3FF]/30", 
      activeStyle: "bg-[#7A5AF8] text-base-white border-[#7A5AF8]" 
    },
    { 
      id: "Menyusui" as TabType, label: "Menyusui", icon: MdChildCare, 
      colorStyle: "border-[#1E9D5D]/30 text-[#1E9D5D] hover:bg-[#E6F8ED]/30", 
      activeStyle: "bg-[#1E9D5D] text-base-white border-[#1E9D5D]" 
    },
  ];

  const PERJALANAN_ANAK_TABS = [
    { 
      id: "0 - 6 Bulan" as TabType, label: "0 - 6 Bulan", icon: MdChildCare, 
      colorStyle: "border-[#9333EA]/30 text-[#9333EA] hover:bg-[#F3E8FF]/30", 
      activeStyle: "bg-[#9333EA] text-base-white border-[#9333EA]" 
    },
    { 
      id: "6 - 12 Bulan" as TabType, label: "6 - 12 Bulan", icon: MdChildCare, 
      colorStyle: "border-[#EA580C]/30 text-[#EA580C] hover:bg-[#FFF7ED]/30", 
      activeStyle: "bg-[#EA580C] text-base-white border-[#EA580C]" 
    },
    { 
      id: "12 - 24 Bulan" as TabType, label: "12 - 24 Bulan", icon: MdChildCare, 
      colorStyle: "border-[#0284C7]/30 text-[#0284C7] hover:bg-[#E0F2FE]/30", 
      activeStyle: "bg-[#0284C7] text-base-white border-[#0284C7]" 
    },
    { 
      id: "2 - 6 Tahun" as TabType, label: "2 - 6 Tahun", icon: MdChildCare, 
      colorStyle: "border-[#DC2626]/30 text-[#DC2626] hover:bg-[#FEF2F2]/30", 
      activeStyle: "bg-[#DC2626] text-base-white border-[#DC2626]" 
    },
  ];

  const INFORMASI_UMUM_TABS = [
    { 
      id: "Informasi Umum" as TabType, label: "Informasi Umum", icon: MdInfo, 
      colorStyle: "border-gray-400/40 text-gray-700 hover:bg-gray-100/30", 
      activeStyle: "bg-gray-700 text-base-white border-gray-700" 
    },
  ];

  // Filtering based on search query
  const searchedArticles = articles.filter(a => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = a.title?.toLowerCase().includes(query);
    const categoryMatch = a.categories?.some((c: string) => c.toLowerCase().includes(query));
    const typeMatch = a.type?.toLowerCase().includes(query);
    return titleMatch || categoryMatch || typeMatch;
  });

  return (
    <div className="w-full pb-10 space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER & SEARCH AREA */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-base-border/20 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Artikel &amp; Edukasi KIA</h1>
          <p className="text-xs text-base-text-secondary mt-1">Dapatkan informasi tepercaya seputar kesehatan ibu, bayi, dan tumbuh kembang anak.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input 
              type="text" 
              placeholder="Cari materi edukasi, topik, atau kata kunci..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-base-border/40 bg-base-bg/30 focus:bg-base-white rounded-full text-sm outline-none focus:border-brand-primary transition-all text-base-text-primary"
            />
            <MdSearch className="absolute left-3.5 top-3 text-base-text-secondary w-5 h-5" />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-base-text-secondary hover:text-base-text-primary transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          {role !== "ibu" && (
            <Link 
              href="/edukasi/tambah" 
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white rounded-xl text-xs font-bold hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10 cursor-pointer shrink-0"
            >
              <MdAdd className="w-4.5 h-4.5" /> Tulis Artikel
            </Link>
          )}
        </div>
      </div>

      {/* TABS SECTION */}
      {!searchQuery && (
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-4 select-none animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/10 pb-3">
            <div>
              <span className="text-[10px] font-black tracking-widest text-[#EA2986] uppercase block">Daftar Isi Buku KIA Digital</span>
              <h2 className="text-sm font-bold text-base-text-primary mt-0.5">Pilih Perjalanan KIA Anda</h2>
            </div>
            <div className="flex items-center gap-2">
              {UTILITY_TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      isActive ? tab.activeStyle : `bg-base-bg/50 ${tab.colorStyle}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Filter Kategori (Ibu / Anak) */}
          <div className="flex items-center gap-1.5 bg-base-bg p-1 rounded-xl w-fit text-[11px] font-bold shadow-sm select-none border border-base-border/20">
            <button
              type="button"
              onClick={() => {
                setJourneyFilter("Semua");
                setActiveTab("Semua");
              }}
              className={`px-4.5 py-2 rounded-lg transition cursor-pointer ${
                journeyFilter === "Semua" 
                  ? "bg-brand-primary text-base-white shadow-sm" 
                  : "text-base-text-secondary hover:text-base-text-primary"
              }`}
            >
              Semua Artikel
            </button>
            <button
              type="button"
              onClick={() => {
                setJourneyFilter("Ibu");
                setActiveTab("Semua");
              }}
              className={`px-4.5 py-2 rounded-lg transition cursor-pointer ${
                journeyFilter === "Ibu" 
                  ? "bg-[#EA2986] text-base-white shadow-sm" 
                  : "text-base-text-secondary hover:text-[#EA2986]"
              }`}
            >
              Kategori Ibu
            </button>
            <button
              type="button"
              onClick={() => {
                setJourneyFilter("Anak");
                setActiveTab("Semua");
              }}
              className={`px-4.5 py-2 rounded-lg transition cursor-pointer ${
                journeyFilter === "Anak" 
                  ? "bg-[#9333EA] text-base-white shadow-sm" 
                  : "text-base-text-secondary hover:text-[#9333EA]"
              }`}
            >
              Kategori Anak
            </button>
          </div>

          <div className={`grid grid-cols-1 ${journeyFilter === "Semua" ? "md:grid-cols-2" : ""} gap-4 pt-1`}>
            {/* PERJALANAN IBU */}
            {(journeyFilter === "Semua" || journeyFilter === "Ibu") && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-black tracking-widest text-base-text-secondary uppercase block pl-1">Perjalanan Ibu</span>
                <div className="grid grid-cols-2 gap-2">
                  {PERJALANAN_IBU_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                          isActive ? tab.activeStyle : `bg-base-white ${tab.colorStyle}`
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-base-white/20" : "bg-base-bg/50"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PERJALANAN ANAK */}
            {(journeyFilter === "Semua" || journeyFilter === "Anak") && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-black tracking-widest text-base-text-secondary uppercase block pl-1">Perjalanan Anak</span>
                <div className="grid grid-cols-2 gap-2">
                  {PERJALANAN_ANAK_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                          isActive ? tab.activeStyle : `bg-base-white ${tab.colorStyle}`
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-base-white/20" : "bg-base-bg/50"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-base-border/10 pt-3 text-[11px] font-semibold text-base-text-secondary">
            <span>Menyesuaikan halaman dan sub-bab Buku KIA Resmi Kementerian Kesehatan</span>
            <div className="flex items-center gap-2">
              {INFORMASI_UMUM_TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                      isActive ? tab.activeStyle : `bg-base-white ${tab.colorStyle}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC BODY */}
      {searchQuery ? (
        // --- SEARCH RESULTS VIEW ---
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2 border-base-border/10">
            <h2 className="text-base font-bold text-base-text-primary">
              Hasil Pencarian: &ldquo;{searchQuery}&rdquo;
            </h2>
            <span className="text-xs bg-brand-soft text-brand-primary font-bold px-3 py-1 rounded-full">
              {searchedArticles.length} Materi ditemukan
            </span>
          </div>

          {searchedArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-base-bg flex items-center justify-center text-base-text-secondary">
                <MdMenuBook className="w-8 h-8 text-base-text-secondary" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-base-text-primary">Tidak Ada Hasil Ditemukan</p>
                <p className="text-xs text-base-text-secondary leading-relaxed">
                  Coba gunakan kata kunci lain seperti &ldquo;MPASI&rdquo;, &ldquo;Imunisasi&rdquo;, atau &ldquo;Kehamilan&rdquo;.
                </p>
              </div>
              <button 
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Bersihkan Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchedArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  isSaved={savedArticles.has(article.id)}
                  onToggleSave={() => toggleBookmark(article.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "Semua" ? (
        // --- SEMUA VIEW ---
        articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 bg-base-white border border-base-border/30 rounded-2xl p-8 max-w-xl mx-auto shadow-sm animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-brand-soft flex items-center justify-center rounded-full mx-auto">
              <MdDashboard className="w-8 h-8 text-brand-primary" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-bold text-base-text-primary">Edukasi KIA Masih Kosong</p>
              <p className="text-xs text-base-text-secondary leading-relaxed max-w-xs mx-auto">
                Semua artikel demo telah dibersihkan. Sebagai Kader, Anda dapat menambahkan materi edukasi baru satu per satu sesuai panduan buku KIA fisik.
              </p>
            </div>
            {role !== "ibu" && (
              <Link
                href="/edukasi/tambah"
                className="px-6 py-2.5 bg-brand-primary text-base-white font-bold text-xs rounded-xl hover:bg-brand-primary/95 transition shadow-md shadow-brand-primary/10 cursor-pointer inline-block"
              >
                Tambah Artikel Pertama
              </Link>
            )}
          </div>
        ) : (() => {
          // Resolve viewed history articles
          const historyArticles = viewedHistory
            .map(histId => articles.find(a => a.id === histId))
            .filter(Boolean) as any[];

          return (
            <div className="space-y-10">
              
              {/* Lanjutkan Membaca (History Slider) */}
              {historyArticles.length > 0 && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-base-text-primary">Lanjutkan Membaca</h2>
                      <p className="text-[10px] text-base-text-secondary font-semibold">Histori artikel terakhir yang selesai Anda lihat.</p>
                    </div>
                    {historyArticles.length > 4 && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setHistoryPageIndex(0)}
                          disabled={historyPageIndex === 0}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                            historyPageIndex === 0 
                              ? "border-base-border/30 text-base-text-secondary/40 cursor-not-allowed" 
                              : "border-brand-primary text-brand-primary hover:bg-[#FCE8F0]/30"
                          }`}
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setHistoryPageIndex(1)}
                          disabled={historyPageIndex === 1}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                            historyPageIndex === 1
                              ? "bg-brand-soft text-brand-primary/40 cursor-not-allowed"
                              : "bg-brand-primary text-base-white hover:bg-status-pink-dark"
                          }`}
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300">
                    {historyArticles.slice(historyPageIndex * 4, (historyPageIndex + 1) * 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Baru Ditambahkan (Kustom) */}
              {articles.some(a => a.id.startsWith("CUSTOM_")) && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-brand-primary flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse"></span>
                      Baru Ditambahkan
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.id.startsWith("CUSTOM_")).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* PERJALANAN IBU */}
              {(journeyFilter === "Semua" || journeyFilter === "Ibu") && (
                <div className="space-y-6 pt-6 border-t border-base-border/20 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2.5">
                    <MdPregnantWoman className="w-6 h-6 text-[#EA2986]" />
                    <h2 className="text-xl font-black text-[#EA2986] tracking-wide uppercase">Perjalanan Ibu</h2>
                  </div>
                
                {/* Kehamilan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA2986]"></span> Kehamilan
                    </h3>
                    <button onClick={() => setActiveTab("Kehamilan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("Kehamilan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Melahirkan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A85F6]"></span> Melahirkan
                    </h3>
                    <button onClick={() => setActiveTab("Melahirkan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("Melahirkan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Setelah Melahirkan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7A5AF8]"></span> Setelah Melahirkan
                    </h3>
                    <button onClick={() => setActiveTab("Setelah Melahirkan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("Setelah Melahirkan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Menyusui */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1E9D5D]"></span> Menyusui
                    </h3>
                    <button onClick={() => setActiveTab("Menyusui")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("Menyusui")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PERJALANAN ANAK */}
            {(journeyFilter === "Semua" || journeyFilter === "Anak") && (
              <div className="space-y-6 pt-6 border-t border-base-border/20 animate-in fade-in duration-300">
                <div className="flex items-center gap-2.5">
                  <MdChildCare className="w-6 h-6 text-[#9333EA]" />
                  <h2 className="text-xl font-black text-[#9333EA] tracking-wide uppercase">Perjalanan Anak</h2>
                </div>
                
                {/* 0 - 6 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span> 0 - 6 Bulan
                    </h3>
                    <button onClick={() => setActiveTab("0 - 6 Bulan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("0 - 6 Bulan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 6 - 12 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span> 6 - 12 Bulan
                    </h3>
                    <button onClick={() => setActiveTab("6 - 12 Bulan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("6 - 12 Bulan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 12 - 24 Bulan */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]"></span> 12 - 24 Bulan
                    </h3>
                    <button onClick={() => setActiveTab("12 - 24 Bulan")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("12 - 24 Bulan")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 2 - 6 Tahun */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span> 2 - 6 Tahun
                    </h3>
                    <button onClick={() => setActiveTab("2 - 6 Tahun")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("2 - 6 Tahun")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INFORMASI UMUM */}
              <div className="space-y-6 pt-6 border-t border-base-border/20">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-base-text-primary flex items-center gap-2">
                      <MdInfo className="w-5 h-5 text-gray-600" /> Informasi Umum
                    </h3>
                    <button onClick={() => setActiveTab("Informasi Umum")} className="text-brand-primary text-xs font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {articles.filter(a => a.categories.includes("Informasi Umum")).slice(0, 4).map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        isSaved={savedArticles.has(article.id)}
                        onToggleSave={() => toggleBookmark(article.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          );
        })()
      ) : activeTab === "Tersimpan" ? (
        // --- TERSIMPAN VIEW ---
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-primary flex items-center gap-2">
              <MdBookmark className="w-5 h-5" /> Artikel Tersimpan
            </h2>
            <span className="text-sm text-base-text-secondary font-medium">{savedArticles.size} artikel</span>
          </div>
          {savedArticles.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-brand-soft/50 flex items-center justify-center">
                <MdBookmark className="w-10 h-10 text-brand-primary/40" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-base-text-primary">Belum Ada Artikel Tersimpan</p>
                <p className="text-sm text-base-text-secondary max-w-[280px] leading-relaxed">Tekan ikon bookmark pada artikel mana pun untuk menyimpannya di sini.</p>
              </div>
              <button 
                onClick={() => setActiveTab("Semua")}
                className="mt-2 px-6 py-2.5 bg-brand-primary text-base-white font-bold text-sm rounded-full hover:bg-brand-primary/95 transition shadow-sm cursor-pointer"
              >
                Jelajahi Artikel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.filter(a => savedArticles.has(a.id)).map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  isSaved={true}
                  onToggleSave={() => toggleBookmark(article.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // --- KATEGORI VIEW ---
        <div className="space-y-6">
          <h2 className="text-center text-lg font-bold text-base-text-primary">
            Kumpulan Materi {activeTab}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Add New Article Card */}
            {role !== "ibu" && (
              <Link 
                href={`/edukasi/tambah?category=${encodeURIComponent(activeTab)}`}
                className="border-2 border-dashed border-base-border/60 rounded-2xl flex flex-col items-center justify-center p-6 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary hover:bg-brand-soft/10 transition-all group min-h-[300px]"
              >
                <MdAdd className="w-12 h-12 mb-2 text-base-text-secondary group-hover:text-brand-primary transition-colors" />
                <span className="font-bold text-sm text-base-text-primary group-hover:text-brand-primary">Tulis Artikel Baru</span>
                <span className="text-xs text-center mt-1">Berbagi Ilmu untuk Kesehatan Ibu dan Anak</span>
              </Link>
            )}

            {/* Articles List */}
            {articles.filter(a => a.categories.includes(activeTab as CategoryType)).map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                isSaved={savedArticles.has(article.id)}
                onToggleSave={() => toggleBookmark(article.id)}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
