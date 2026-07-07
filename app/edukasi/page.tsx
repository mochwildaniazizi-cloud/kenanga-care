"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MdDashboard, MdVaccines, MdPregnantWoman, 
  MdChildCare, MdOutlineLocalDining, MdOutlineExtension,
  MdAdd, MdBookmark, MdSearch, MdMenuBook
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

  useEffect(() => {
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

  const TABS: { id: TabType; label: string; icon: any; colorStyle: string; activeStyle: string; iconColor?: string }[] = [
    { 
      id: "Semua", label: "Semua", icon: MdDashboard, 
      colorStyle: "border-base-text-secondary/30 text-base-text-secondary", 
      activeStyle: "bg-base-text-secondary text-base-white border-base-text-secondary", 
    },
    { 
      id: "Gizi & MPASI", label: "Gizi & MPASI", icon: MdOutlineLocalDining, 
      colorStyle: "border-status-green-solid text-status-green-solid", 
      activeStyle: "bg-status-green-solid text-base-white border-status-green-solid" 
    },
    { 
      id: "Imunisasi", label: "Imunisasi", icon: MdVaccines, 
      colorStyle: "border-status-orange-solid text-status-orange-solid", 
      activeStyle: "bg-status-orange-solid text-base-white border-status-orange-solid" 
    },
    { 
      id: "Ibu Hamil", label: "Ibu Hamil", icon: MdPregnantWoman, 
      colorStyle: "border-status-blue-solid text-status-blue-solid", 
      activeStyle: "bg-status-blue-solid text-base-white border-status-blue-solid" 
    },
    { 
      id: "Ibu Nifas", label: "Ibu Nifas", icon: MdChildCare, 
      colorStyle: "border-status-purple-solid text-status-purple-solid", 
      activeStyle: "bg-status-purple-solid text-base-white border-status-purple-solid" 
    },
    { 
      id: "Tumbuh Kembang", label: "Tumbuh Kembang", icon: MdOutlineExtension, 
      colorStyle: "border-status-cerulean-solid text-status-cerulean-solid", 
      activeStyle: "bg-status-cerulean-solid text-base-white border-status-cerulean-solid" 
    },
    { 
      id: "Tersimpan", label: "Tersimpan", icon: MdBookmark, 
      colorStyle: "border-brand-primary text-brand-primary", 
      activeStyle: "bg-brand-primary text-base-white border-brand-primary" 
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
        <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar select-none">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 cursor-pointer ${
                  isActive ? tab.activeStyle : `bg-base-white ${tab.colorStyle}`
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? "bg-base-white" : ""}`}>
                  <Icon className={`w-4 h-4 ${tab.colorStyle.split(" ")[1]}`} />
                </div>
                {tab.label}
              </button>
            );
          })}
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
        ) : (
          <div className="space-y-10">
            
            {/* Lanjutkan Membaca */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-base-text-primary">Lanjutkan Membaca</h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full border border-base-border/50 flex items-center justify-center text-base-text-secondary hover:text-brand-primary transition-colors cursor-pointer">
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-base-white hover:bg-status-pink-dark transition-colors shadow-sm cursor-pointer">
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.isLanjutkanMembaca).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    isSaved={savedArticles.has(article.id)}
                    onToggleSave={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            </div>

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

            {/* Kategori 1: Gizi & MPASI */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-status-green-solid flex items-center gap-2">
                  <MdOutlineLocalDining className="w-5 h-5" /> Gizi &amp; MPASI
                </h2>
                <button onClick={() => setActiveTab("Gizi & MPASI")} className="text-brand-primary text-sm font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.categories.includes("Gizi & MPASI") && !a.isLanjutkanMembaca).slice(0,4).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    isSaved={savedArticles.has(article.id)}
                    onToggleSave={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            </div>

            {/* Kategori 2: Imunisasi */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-status-orange-solid flex items-center gap-2">
                  <MdVaccines className="w-5 h-5" /> Imunisasi
                </h2>
                <button onClick={() => setActiveTab("Imunisasi")} className="text-brand-primary text-sm font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.categories.includes("Imunisasi") && !a.isLanjutkanMembaca).slice(0,4).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    isSaved={savedArticles.has(article.id)}
                    onToggleSave={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            </div>

            {/* Kategori 3: Ibu Hamil */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-status-blue-solid flex items-center gap-2">
                  <MdPregnantWoman className="w-5 h-5" /> Ibu Hamil
                </h2>
                <button onClick={() => setActiveTab("Ibu Hamil")} className="text-brand-primary text-sm font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.categories.includes("Ibu Hamil") && !a.isLanjutkanMembaca).slice(0,4).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    isSaved={savedArticles.has(article.id)}
                    onToggleSave={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            </div>

            {/* Kategori 4: Ibu Nifas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-status-purple-solid flex items-center gap-2">
                  <MdChildCare className="w-5 h-5" /> Ibu Nifas
                </h2>
                <button onClick={() => setActiveTab("Ibu Nifas")} className="text-brand-primary text-sm font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.categories.includes("Ibu Nifas") && !a.isLanjutkanMembaca).slice(0,4).map(article => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    isSaved={savedArticles.has(article.id)}
                    onToggleSave={() => toggleBookmark(article.id)}
                  />
                ))}
              </div>
            </div>

            {/* Kategori 5: Tumbuh Kembang */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-status-cerulean-solid flex items-center gap-2">
                  <MdOutlineExtension className="w-5 h-5" /> Tumbuh Kembang
                </h2>
                <button onClick={() => setActiveTab("Tumbuh Kembang")} className="text-brand-primary text-sm font-bold hover:underline cursor-pointer">Lihat Selengkapnya &gt;</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {articles.filter(a => a.categories.includes("Tumbuh Kembang") && !a.isLanjutkanMembaca).slice(0,4).map(article => (
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
        )
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
