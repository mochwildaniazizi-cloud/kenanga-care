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
 
type TabType = CategoryType | "Semua" | "Ibu" | "Anak" | "Tersimpan";
 
export default function EdukasiPage() {
  const { role } = useUserRole();
  const [activeTab, setActiveTab] = useState<TabType>("Semua");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewedHistory, setViewedHistory] = useState<string[]>([]);
  const [historyPageIndex, setHistoryPageIndex] = useState<number>(0);
 
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
        historyList = [];
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
      id: "Ibu" as TabType, label: "Kategori Ibu", icon: MdPregnantWoman, 
      colorStyle: "border-[#EA2986]/30 text-[#EA2986] hover:bg-[#FCE8F0]/30", 
      activeStyle: "bg-[#EA2986] text-base-white border-[#EA2986]" 
    },
    { 
      id: "Anak" as TabType, label: "Kategori Anak", icon: MdChildCare, 
      colorStyle: "border-[#9333EA]/30 text-[#9333EA] hover:bg-[#F3E8FF]/30", 
      activeStyle: "bg-[#9333EA] text-base-white border-[#9333EA]" 
    },
    { 
      id: "Informasi Umum" as TabType, label: "Informasi Umum", icon: MdInfo, 
      colorStyle: "border-[#934B29]/30 text-[#934B29] hover:bg-[#934B29]/5", 
      activeStyle: "bg-[#934B29] text-base-white border-[#934B29]" 
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

  const isIbuTab = (tab: TabType) => {
    return tab === "Ibu" || tab === "Kehamilan" || tab === "Melahirkan" || tab === "Setelah Melahirkan" || tab === "Menyusui";
  };
  const isAnakTab = (tab: TabType) => {
    return tab === "Anak" || tab === "0 - 6 Bulan" || tab === "6 - 12 Bulan" || tab === "12 - 24 Bulan" || tab === "2 - 6 Tahun";
  };
  const isTabDisabled = (tabId: TabType) => {
    if (activeTab === "Semua") return false;
    if (isIbuTab(activeTab) && isAnakTab(tabId)) return true;
    if (isAnakTab(activeTab) && isIbuTab(tabId)) return true;
    if (activeTab === "Informasi Umum" && (isIbuTab(tabId) || isAnakTab(tabId))) return true;
    return false;
  };

  // Filtering based on search query
  const searchedArticles = articles.filter(a => {
    if (showSavedOnly && !savedArticles.has(a.id)) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = a.title?.toLowerCase().includes(query);
    const categoryMatch = a.categories?.some((c: string) => c.toLowerCase().includes(query));
    const typeMatch = a.type?.toLowerCase().includes(query);
    return titleMatch || categoryMatch || typeMatch;
  });

  return (
    <div className="w-full pb-10 space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER AREA */}
      <div className="border-b border-base-border/20 pb-5">
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Artikel &amp; Edukasi KIA</h1>
        <p className="text-xs text-base-text-secondary mt-1">Dapatkan informasi tepercaya seputar kesehatan ibu, bayi, dan tumbuh kembang anak.</p>
      </div>

      {/* TABS SECTION — always visible, search query only hides the sub-tabs */}
      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-4 select-none animate-in fade-in duration-300">
        {/* Top row: label left + search bar right */}
        <div className="flex items-center justify-between gap-4 border-b border-base-border/10 pb-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#EA2986] uppercase block">Daftar Isi Buku KIA Digital</span>
            <h2 className="text-sm font-bold text-base-text-primary mt-0.5">Pilih Perjalanan KIA Anda</h2>
          </div>
          {/* SEARCH BAR */}
          <div className="relative shrink-0 w-56 sm:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-text-secondary/50 pointer-events-none" />
            <input
              id="edukasi-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-base-border/40 bg-base-bg/60 text-xs text-base-text-primary placeholder:text-base-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-text-secondary/50 hover:text-base-text-primary transition cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills — centered, only when not searching */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {UTILITY_TABS.map(tab => {
              const isSavedTab = tab.id === "Tersimpan";
              const isActive = isSavedTab ? showSavedOnly : activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (isSavedTab) {
                      setShowSavedOnly(prev => !prev);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
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
        )}

          {/* PERJALANAN IBU & ANAK — only when not searching */}
          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* PERJALANAN IBU */}
              <div className={`space-y-2.5 transition-opacity duration-200 ${
                isTabDisabled("Kehamilan") ? "opacity-40" : ""
              }`}>
                <span className="text-[10px] font-black tracking-widest text-base-text-secondary uppercase block pl-1">Perjalanan Ibu</span>
                <div className="grid grid-cols-2 gap-2">
                  {PERJALANAN_IBU_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const disabled = isTabDisabled(tab.id);
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        disabled={disabled}
                        onClick={() => !disabled && setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all border text-left ${
                          disabled
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed grayscale"
                            : isActive
                            ? `${tab.activeStyle} cursor-pointer`
                            : `bg-base-white ${tab.colorStyle} cursor-pointer`
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

              {/* PERJALANAN ANAK */}
              <div className={`space-y-2.5 transition-opacity duration-200 ${
                isTabDisabled("0 - 6 Bulan") ? "opacity-40" : ""
              }`}>
                <span className="text-[10px] font-black tracking-widest text-base-text-secondary uppercase block pl-1">Perjalanan Anak</span>
                <div className="grid grid-cols-2 gap-2">
                  {PERJALANAN_ANAK_TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const disabled = isTabDisabled(tab.id);
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        disabled={disabled}
                        onClick={() => !disabled && setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold transition-all border text-left ${
                          disabled
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed grayscale"
                            : isActive
                            ? `${tab.activeStyle} cursor-pointer`
                            : `bg-base-white ${tab.colorStyle} cursor-pointer`
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
            </div>
          )}
        </div>

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
      ) : (() => {
        // Compute the article list based on activeTab + showSavedOnly cross-filter
        const getFilteredArticles = (catFilter: (a: any) => boolean) =>
          articles.filter(a => {
            if (showSavedOnly && !savedArticles.has(a.id)) return false;
            return catFilter(a);
          });

        // --- SEMUA / IBU / ANAK / INFORMASI UMUM VIEW ---
        if (activeTab === "Semua" || activeTab === "Ibu" || activeTab === "Anak" || activeTab === "Informasi Umum") {
          if (articles.length === 0) return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 bg-base-white border border-base-border/30 rounded-2xl p-8 max-w-xl mx-auto shadow-sm animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-brand-soft flex items-center justify-center rounded-full mx-auto">
                <MdDashboard className="w-8 h-8 text-brand-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-base font-bold text-base-text-primary">Edukasi KIA Masih Kosong</p>
                <p className="text-xs text-base-text-secondary leading-relaxed max-w-xs mx-auto">
                  Semua artikel demo telah dibersihkan. Silakan buka tab perjalanan KIA untuk menjelajahi artikel resmi.
                </p>
              </div>
            </div>
          );

          const historyArticles = viewedHistory
            .map(histId => articles.find(a => a.id === histId))
            .filter(Boolean) as any[];

          // When showSavedOnly is active, show a saved header banner
          const savedBanner = showSavedOnly ? (
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-brand-soft/30 border border-brand-primary/20 rounded-xl animate-in fade-in duration-200">
              <MdBookmark className="w-4 h-4 text-brand-primary shrink-0" />
              <p className="text-xs font-bold text-brand-primary">
                Menampilkan artikel tersimpan{activeTab !== "Semua" ? ` dalam kategori ${activeTab}` : ""}
              </p>
              <button
                onClick={() => setShowSavedOnly(false)}
                className="ml-auto text-brand-primary/60 hover:text-brand-primary transition cursor-pointer"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null;

          return (
            <div className="space-y-10">
              {savedBanner}

              {/* Lanjutkan Membaca — hidden when saved filter active */}
              {!showSavedOnly && activeTab === "Semua" && historyArticles.length > 0 && (
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

              {/* Baru Ditambahkan (Kustom) — hidden when saved filter active */}
              {!showSavedOnly && articles.some(a => a.id.startsWith("CUSTOM_")) && (
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
              {(activeTab === "Semua" || activeTab === "Ibu") && (() => {
                const sections = [
                  { label: "Kehamilan", color: "#EA2986", cat: "Kehamilan" as CategoryType },
                  { label: "Melahirkan", color: "#4A85F6", cat: "Melahirkan" as CategoryType },
                  { label: "Setelah Melahirkan", color: "#7A5AF8", cat: "Setelah Melahirkan" as CategoryType },
                  { label: "Menyusui", color: "#1E9D5D", cat: "Menyusui" as CategoryType },
                ];
                const hasSections = sections.some(s => getFilteredArticles(a => a.categories.includes(s.cat)).length > 0);
                if (!hasSections) return null;
                return (
                  <div className="space-y-6 pt-6 border-t border-base-border/20 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5">
                      <MdPregnantWoman className="w-6 h-6 text-[#EA2986]" />
                      <h2 className="text-xl font-black text-[#EA2986] tracking-wide uppercase">Perjalanan Ibu</h2>
                    </div>
                    {sections.map(sec => {
                      const sectionArticles = getFilteredArticles(a => a.categories.includes(sec.cat));
                      if (sectionArticles.length === 0) return null;
                      return (
                        <div key={sec.cat}>
                          <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.color }}></span>
                            {sec.label}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sectionArticles.map(article => (
                              <ArticleCard
                                key={article.id}
                                article={article}
                                isSaved={savedArticles.has(article.id)}
                                onToggleSave={() => toggleBookmark(article.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* PERJALANAN ANAK */}
              {(activeTab === "Semua" || activeTab === "Anak") && (() => {
                const sections = [
                  { label: "0 - 6 Bulan", color: "#9333EA", cat: "0 - 6 Bulan" as CategoryType },
                  { label: "6 - 12 Bulan", color: "#EA580C", cat: "6 - 12 Bulan" as CategoryType },
                  { label: "12 - 24 Bulan", color: "#0284C7", cat: "12 - 24 Bulan" as CategoryType },
                  { label: "2 - 6 Tahun", color: "#DC2626", cat: "2 - 6 Tahun" as CategoryType },
                ];
                const hasSections = sections.some(s => getFilteredArticles(a => a.categories.includes(s.cat)).length > 0);
                if (!hasSections) return null;
                return (
                  <div className="space-y-6 pt-6 border-t border-base-border/20 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5">
                      <MdChildCare className="w-6 h-6 text-[#9333EA]" />
                      <h2 className="text-xl font-black text-[#9333EA] tracking-wide uppercase">Perjalanan Anak</h2>
                    </div>
                    {sections.map(sec => {
                      const sectionArticles = getFilteredArticles(a => a.categories.includes(sec.cat));
                      if (sectionArticles.length === 0) return null;
                      return (
                        <div key={sec.cat}>
                          <h3 className="text-sm font-bold text-base-text-primary flex items-center gap-2 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.color }}></span>
                            {sec.label}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sectionArticles.map(article => (
                              <ArticleCard
                                key={article.id}
                                article={article}
                                isSaved={savedArticles.has(article.id)}
                                onToggleSave={() => toggleBookmark(article.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* INFORMASI UMUM */}
              {(activeTab === "Semua" || activeTab === "Informasi Umum") && (() => {
                const infoArticles = getFilteredArticles(a => a.categories.includes("Informasi Umum" as CategoryType));
                if (infoArticles.length === 0) return null;
                return (
                  <div className="space-y-6 pt-6 border-t border-base-border/20 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2.5">
                      <MdInfo className="w-5 h-5 text-[#934B29]" />
                      <h3 className="text-lg font-bold text-[#934B29]">Informasi Umum</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {infoArticles.map(article => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          isSaved={savedArticles.has(article.id)}
                          onToggleSave={() => toggleBookmark(article.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Empty saved state */}
              {showSavedOnly && !articles.some(a => savedArticles.has(a.id) && (
                activeTab === "Semua" ||
                (activeTab === "Ibu" && ["Kehamilan","Melahirkan","Setelah Melahirkan","Menyusui"].some(c => a.categories.includes(c as CategoryType))) ||
                (activeTab === "Anak" && ["0 - 6 Bulan","6 - 12 Bulan","12 - 24 Bulan","2 - 6 Tahun"].some(c => a.categories.includes(c as CategoryType))) ||
                (activeTab === "Informasi Umum" && a.categories.includes("Informasi Umum" as CategoryType))
              )) && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-soft/40 flex items-center justify-center">
                    <MdBookmark className="w-8 h-8 text-brand-primary/40" />
                  </div>
                  <p className="text-sm font-bold text-base-text-primary">Belum ada artikel tersimpan di kategori ini</p>
                  <button
                    onClick={() => setShowSavedOnly(false)}
                    className="px-4 py-2 border border-brand-primary text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-soft/20 transition cursor-pointer"
                  >
                    Tampilkan Semua Artikel
                  </button>
                </div>
              )}
            </div>
          );
        }

        // --- KATEGORI PERJALANAN (sub-tab) VIEW ---
        const categoryArticles = getFilteredArticles(a => a.categories.includes(activeTab as CategoryType));
        return (
          <div className="space-y-6">
            {showSavedOnly && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-brand-soft/30 border border-brand-primary/20 rounded-xl">
                <MdBookmark className="w-4 h-4 text-brand-primary shrink-0" />
                <p className="text-xs font-bold text-brand-primary">Menampilkan artikel tersimpan dalam kategori {activeTab}</p>
                <button onClick={() => setShowSavedOnly(false)} className="ml-auto text-brand-primary/60 hover:text-brand-primary transition cursor-pointer">
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <h2 className="text-lg font-bold text-base-text-primary">Kumpulan Materi {activeTab}</h2>
            {categoryArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-soft/40 flex items-center justify-center">
                  <MdBookmark className="w-8 h-8 text-brand-primary/40" />
                </div>
                <p className="text-sm font-bold text-base-text-primary">
                  {showSavedOnly ? "Belum ada artikel tersimpan di kategori ini" : "Belum ada artikel di kategori ini"}
                </p>
                {showSavedOnly && (
                  <button
                    onClick={() => setShowSavedOnly(false)}
                    className="px-4 py-2 border border-brand-primary text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-soft/20 transition cursor-pointer"
                  >
                    Tampilkan Semua Artikel
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryArticles.map(article => (
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
        );
      })()}

    </div>
  );
}
