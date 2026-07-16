"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen, FiTrash, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { 
  MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare, MdEdit,
  MdEventAvailable, MdInfo, MdCheckCircle, MdWarning, MdCancel, MdShield,
  MdHealing, MdFavorite, MdPsychology, MdFamilyRestroom, MdPregnantWoman,
  MdArrowForward, MdChildCare, MdAllInclusive, MdCleanHands, MdKitchen,
  MdRestaurant, MdLocalCafe, MdWaterDrop, MdHealthAndSafety, MdTimeline,
  MdFace, MdLocalHospital, MdSecurity, MdAccessTime, MdOutlineBabyChangingStation,
  MdThermostat, MdAccessibility, MdPalette, MdEvent, MdSentimentVeryDissatisfied,
  MdPhonelinkOff, MdColorLens, MdStraighten, MdGroups, MdMenuBook, MdForum, MdEmergencyShare,
  MdVaccines, MdAssignmentTurnedIn, MdCleaningServices, MdFastfood, MdTrendingUp, MdRestaurantMenu,
  MdDoneAll, MdHourglassTop, MdOutdoorGrill
} from "react-icons/md";
import { mockArticles } from "../data";
import type { Article } from "../data";
import { useUserRole } from "@/context/UserRoleContext";
import CustomDatePicker from "@/components/CustomDatePicker";
import Image from "next/image";

// Extends Article interface to allow custom content field
interface ExtendedArticle extends Article {
  content?: string;
}

interface MilestoneItem {
  id: number;
  text: string;
  checked: boolean;
}

const renderContent = (id: string) => {
  switch (id) {
    case "L1":
      return <L1ArticleContent />;
    case "L2":
      return <L2ArticleContent />;
    case "L3":
      return <L3ArticleContent />;
    case "L4":
      return <L4ArticleContent />;
    case "L5":
      return <L5ArticleContent />;
    case "L6":
      return <L6ArticleContent />;
    case "L7":
      return <L7ArticleContent />;
    case "L8":
      return <L8ArticleContent />;
    case "L9":
      return <L9ArticleContent />;
    case "L10":
      return <L10ArticleContent />;
    case "L11":
      return <L11ArticleContent />;
    case "L12":
      return <L12ArticleContent />;
    case "L13":
      return <L13ArticleContent />;
    case "L14":
      return <L14ArticleContent />;
    case "L15":
      return <L15ArticleContent />;
    case "L16":
      return <L16ArticleContent />;
    case "L17":
      return <L17ArticleContent />;
    case "L18":
      return <L18ArticleContent />;
    case "L19":
      return <L19ArticleContent />;
    case "L20":
      return <L20ArticleContent />;
    case "L21":
      return <L21ArticleContent />;
    case "L22":
      return <L22ArticleContent />;
    case "L23":
      return <L23ArticleContent />;
    case "L24":
      return <L24ArticleContent />;
    case "L25":
      return <L25ArticleContent />;
    case "L26":
      return <L26ArticleContent />;
    case "L27":
      return <L27ArticleContent />;
    case "L28":
      return <L28ArticleContent />;
    case "L29":
      return <L29ArticleContent />;
    case "L30":
      return <L30ArticleContent />;
    case "L31":
      return <L31ArticleContent />;
    case "L32":
      return <L32ArticleContent />;
    case "L33":
      return <L33ArticleContent />;
    case "L34":
      return <L34ArticleContent />;
    case "L35":
      return <L35ArticleContent />;
    case "L36":
      return <L36ArticleContent />;
    case "L37":
      return <L37ArticleContent />;
    default:
      return (
        <p className="text-xs text-base-text-secondary italic">
          Konten artikel belum tersedia atau sedang dalam proses pembaruan.
        </p>
      );
  }
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { role } = useUserRole();

  const [article, setArticle] = useState<ExtendedArticle | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    // 1. Check in mock articles
    const mock = mockArticles.find((a) => a.id === id);
    if (mock) {
      const mockContent = getMockContent(mock.id, mock.title);
      setArticle({ ...mock, content: mockContent });
      setLoading(false);
    } else {
      // 2. Check in localStorage
      const local = localStorage.getItem("custom_articles");
      if (local) {
        try {
          const parsed = JSON.parse(local) as ExtendedArticle[];
          const found = parsed.find((a) => a.id === id);
          if (found) {
            setArticle(found);
          }
        } catch (e) {
          console.error("Error reading custom article details", e);
        }
      }
      setLoading(false);
    }

    // Check if bookmarked
    const bookmarks = localStorage.getItem("saved_articles_ids");
    if (bookmarks) {
      try {
        const ids = JSON.parse(bookmarks) as string[];
        setIsSaved(ids.includes(id));
      } catch (e) {
        console.error(e);
      }
    }

    // Record in viewed history
    if (id) {
      const historyJson = localStorage.getItem("viewed_articles_history");
      let historyList: string[] = [];
      if (historyJson) {
        try {
          historyList = JSON.parse(historyJson);
        } catch (e) {
          console.error(e);
        }
      }
      historyList = [id, ...historyList.filter((x) => x !== id)].slice(0, 8);
      localStorage.setItem("viewed_articles_history", JSON.stringify(historyList));
    }
  }, [id]);

  const toggleBookmark = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    const bookmarks = localStorage.getItem("saved_articles_ids");
    let ids: string[] = [];
    if (bookmarks) {
      try {
        ids = JSON.parse(bookmarks);
      } catch (e) {
        console.error(e);
      }
    }
    if (nextSaved) {
      if (!ids.includes(id)) ids.push(id);
    } else {
      ids = ids.filter((x) => x !== id);
    }
    localStorage.setItem("saved_articles_ids", JSON.stringify(ids));
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    if (id.startsWith("CUSTOM_")) {
      const local = localStorage.getItem("custom_articles");
      if (local) {
        try {
          const parsed = JSON.parse(local) as ExtendedArticle[];
          const filtered = parsed.filter((a) => a.id !== id);
          localStorage.setItem("custom_articles", JSON.stringify(filtered));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const deleted = localStorage.getItem("deleted_articles_ids");
      let deletedIds: string[] = [];
      if (deleted) {
        try {
          deletedIds = JSON.parse(deleted);
        } catch (e) {
          console.error(e);
        }
      }
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
      }
      localStorage.setItem("deleted_articles_ids", JSON.stringify(deletedIds));
    }

    router.push("/edukasi");
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Kehamilan": return "bg-[#FCE8F0] text-[#EA2986] border border-[#EA2986]/25";
      case "Melahirkan": return "bg-[#ECF2FE] text-[#4A85F6] border border-[#4A85F6]/25";
      case "Setelah Melahirkan": return "bg-[#E5E6F2] text-[#3E57A3] border border-[#3E57A3]/25";
      case "Menyusui": return "bg-[#E6F8ED] text-[#1E9D5D] border border-[#1E9D5D]/25";
      case "0 - 6 Bulan": return "bg-[#F3E8FF] text-[#9333EA] border border-[#9333EA]/25";
      case "6 - 12 Bulan": return "bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/25";
      case "12 - 24 Bulan": return "bg-[#E0F2FE] text-[#0284C7] border border-[#0284C7]/25";
      case "2 - 6 Tahun": return "bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/25";
      case "Informasi Umum": return "bg-gray-100 text-gray-700 border border-gray-300/30";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-base-text-secondary">Memuat konten...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-200 mx-auto py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-base-text-primary">Konten Tidak Ditemukan</h2>
        <p className="text-sm text-base-text-secondary">Maaf, artikel yang Anda cari tidak tersedia.</p>
        <Link
          href="/edukasi"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-xs hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10"
        >
          <FiArrowLeft /> Kembali ke Edukasi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto pb-16 animate-in fade-in duration-300">
      <style>{`
        .article-content blockquote {
          border-left: 4px solid #ea2986;
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          background-color: rgba(234, 41, 134, 0.04);
          color: #4b5563;
          border-radius: 0 8px 8px 0;
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          overflow-x: auto;
          display: block;
        }
        @media (min-width: 640px) {
          .article-content table {
            display: table;
          }
        }
        .article-content th, .article-content td {
          border: 1px solid rgba(226, 232, 240, 0.8);
          padding: 10px 12px;
          text-align: left;
          font-size: 0.875rem;
        }
        .article-content th {
          background-color: rgba(248, 250, 252, 0.8);
          font-weight: 700;
          color: #1e293b;
        }
        .article-content tr:nth-child(even) {
          background-color: rgba(248, 250, 252, 0.4);
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .article-content h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1e293b;
          line-height: 1.3;
        }
        .article-content h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: #1e293b;
          line-height: 1.3;
        }
        .article-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #334155;
        }
        .article-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: #334155;
        }
      `}</style>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/edukasi"
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </Link>


        <div className="flex items-center gap-2">

          <button
            onClick={toggleBookmark}
            className="w-9 h-9 bg-base-white border border-base-border/50 rounded-xl flex items-center justify-center shadow-sm text-base-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            title={isSaved ? "Hapus Markah" : "Simpan ke Markah"}
          >
            {isSaved ? (
              <MdBookmark className="w-5 h-5 text-brand-primary" />
            ) : (
              <MdBookmarkBorder className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="w-9 h-9 bg-base-white border border-base-border/50 rounded-xl flex items-center justify-center shadow-sm text-base-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
            title="Bagikan"
          >
            <MdShare className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-base-white rounded-bento-lg overflow-hidden border border-base-border/30 shadow-sm">
        <div className="relative h-64 sm:h-80 w-full bg-slate-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-2.5 items-center text-xs font-semibold text-base-text-secondary">
            {article.categories.map((cat) => (
              <span
                key={cat}
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${getCategoryColor(cat)}`}
              >
                {cat}
              </span>
            ))}
            <span className="w-1.5 h-1.5 rounded-full bg-base-border mx-1"></span>
            <div className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              <span>{article.duration}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-base-border mx-1"></span>
            <div className="flex items-center gap-1">
              <FiBookOpen className="w-3.5 h-3.5" />
              <span>Artikel Buku KIA</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-text-primary leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-px bg-base-border/30"></div>

          {/* Render Konten Utama Edukasi Bersih */}
          <div className="article-content">
            {renderContent(article.id)}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-base-border/20 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-red-solid/10 text-status-red-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <FiTrash className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Hapus Konten Edukasi?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin menghapus artikel/video ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-semibold text-xs hover:bg-base-white transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-status-red-solid text-white font-semibold text-xs hover:bg-status-red-solid/90 transition shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bagikan Artikel */}
      {showShareModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
          <div className="bg-base-white rounded-[28px] shadow-xl w-full max-w-sm border border-base-border/20 p-8 pt-10 text-center relative">
            <div className="w-16 h-16 bg-base-white rounded-full flex items-center justify-center shadow-md absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-base-border/30">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
                <g transform="rotate(-45 16 16)">
                  <path d="M15 13H9C6.79086 13 5 14.7909 5 17C5 19.2091 6.79086 21 9 21H15C17.2091 21 19 19.2091 19 17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M13 15C13 12.7909 14.7909 11 17 11H23C25.2091 11 27 12.7909 27 15C27 17.2091 25.2091 19 23 19H17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M15 13H17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            <button 
              onClick={() => { setShowShareModal(false); setCopiedLink(false); }} 
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F8F9FD] border border-[#E5E9F2] hover:bg-[#E5E9F2]/50 flex items-center justify-center text-base-text-secondary hover:text-base-text-primary transition-all duration-200 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="space-y-2 mb-6 mt-2">
              <h3 className="text-xl font-bold text-[#1E1E1E]">Bagikan Edukasi</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-60 mx-auto">
                Bagikan informasi penting ini ke rekan kader posyandu atau keluarga tercinta.
              </p>
            </div>

            <div className="space-y-2 text-left mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Salin Link Halaman</span>
              <div className="flex items-center justify-between bg-[#F5F7FB] border border-[#E5E9F2] rounded-2xl px-4 py-3.5 text-xs text-[#1E1E1E] font-medium transition-all duration-200">
                <span className="truncate max-w-50 select-all text-[#4B5563]">{shareUrl}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }} 
                  className="text-[#6B7280] hover:text-[#1E1E1E] transition-all duration-200 cursor-pointer flex items-center"
                  title="Salin Tautan"
                >
                  {copiedLink ? (
                    <FiCheck className="w-4 h-4 text-status-green-solid" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Bagikan ke</span>
              <div className="grid grid-cols-5 gap-2 text-center">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 transition-all duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#1877F2"/><path d="M24 20H21V30H17V20H15V16.5H17V14.25C17 11.25 18.75 9.5 21.5 9.5C22.75 9.5 24 9.75 24 9.75V12.75H22.5C21 12.75 20.5 13.75 20.5 14.75V16.5H24.5L24 20Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280]">Facebook</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 transition-all duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="black"/><path d="M26 11H28.5L22.5 17.5L29.5 27H24L19.5 21.25L14.75 27H12L18.5 20.25L12 11H17.5L21.75 16.5L26 11ZM25 25.5H26.5L16.5 12.5H15 loopholes 25 25.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280]">X</span>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 transition-all duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#25D366"/><path d="M20 9C13.9 9 9 13.9 9 20C9 22 9.5 23.9 10.5 25.6L9 31L14.6 29.5C16.2 30.5 18.1 31 20 31C26.1 31 31 26.1 31 20C31 13.9 26.1 9 20 9ZM25.2 24.1C24.9 25 23.9 25.7 23 25.9C22.4 26 21.6 26.1 18.8 24.9C15.2 23.4 12.9 19.7 12.7 19.5C12.5 19.3 11 17.3 11 15.2C11 13.1 12 12.1 12.4 11.6C12.8 11.1 13.5 10.9 14.1 10.9C14.3 10.9 14.5 10.9 14.7 10.9C15.2 10.9 15.5 10.9 15.8 11.6C16.2 12.5 17.1 14.7 17.2 14.9C17.3 15.1 17.4 15.4 17.2 15.7C17.1 16 16.9 16.2 16.7 16.5C16.5 16.7 16.2 17 16 17.2C15.8 17.4 15.5 17.6 15.8 18.1C16.1 18.6 17.1 20.3 18.7 21.7C20.7 23.5 22.4 24.1 22.9 24.3C23.4 24.5 23.7 24.4 24 24.1C24.3 23.8 24.9 23.1 25.2 22.6C25.5 22.1 25.9 22.2 26.3 22.3C26.7 22.4 28.7 23.4 29.1 23.6C29.5 23.8 29.8 23.9 29.9 24.1C30 24.3 30 25.1 29.6 25.9C29.2 26.7 27 27.5 25.2 24.1Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280]">Whatsapp</span>
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 transition-all duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#179CDE"/><path d="M27.5 12.5L11.5 18.7C10.4 19.1 10.4 19.8 11.3 20.1L15.4 21.4L24.9 15.4C25.3 15.1 25.7 15.3 25.4 15.6L17.7 22.6L17.4 26.8C17.8 26.8 18 26.6 18.2 26.4L20.2 24.5L24.4 27.6C25.2 28 25.8 27.8 26 26.9L28.8 13.8C29.1 12.6 28.3 12.1 27.5 12.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280]">Telegram</span>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 transition-all duration-300" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#0A66C2"/><path d="M14.5 13C14.5 13.8 13.8 14.5 13 14.5C12.2 14.5 11.5 13.8 11.5 13C11.5 12.2 12.2 11.5 13 11.5C13.8 11.5 14.5 12.2 14.5 13ZM11.5 27H14.5V17H11.5V27ZM22.5 21.5V27H25.5V21.1C25.5 18.2 24.8 16.5 21.8 16.5C20.3 16.5 19.3 17.3 18.9 18.1H18.8V17H16V27H19V21.5C19 20.1 19.3 19.2 20.5 19.2C21.7 19.2 22.5 20.1 22.5 21.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280]">Linkedin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================================================
// SECTION ARTICLE CONTENT SUB-COMPONENTS
// ====================================================================

// ARTIKEL L1: 1000 Hari Pertama Kehidupan
function L1ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        <strong className="text-base-text-primary font-bold">1000 Hari Pertama Kehidupan (1000 HPK)</strong> adalah masa paling penting dalam pertumbuhan dan perkembangan anak. Masa ini terdiri dari <strong className="text-base-text-primary">270 hari</strong> selama bayi berada dalam kandungan ibu, dan <strong className="text-base-text-primary">730 hari</strong> atau dua tahun pertama kehidupan anak setelah dilahirkan.
      </p>

      {/* Quote Block / Highlight */}
      <div className="p-4 bg-brand-soft/10 border-l-4 border-brand-primary rounded-r-2xl text-xs italic text-base-text-secondary leading-relaxed shadow-xs">
        "Masa 1000 HPK sangat penting karena anak akan mengalami pertumbuhan dan perkembangan organ tubuh penting (otak, jantung, hati, ginjal, paru-paru, dan tulang) secara sangat pesat yang berdampak pada kualitas kesehatannya di masa depan."
      </div>

      {/* Bagian 1: Tahapan Perkembangan Otak */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🧠 Tahapan Perkembangan Otak Anak
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Kapasitas volume dan koneksi jaringan otak berkembang sangat cepat pada periode emas ini:
        </p>

        <div className="grid grid-cols-1 gap-3 text-xs font-semibold text-base-text-primary">
          {[
            { pct: "25%", title: "Saat Lahir", desc: "Otak mulai aktif membentuk jaringan dan sambungan sel saraf awal." },
            { pct: "70%", title: "Usia 0 - 1 Tahun", desc: "Periode emas perkembangan kemampuan sensorik, visual, serta motorik anak." },
            { pct: "85%", title: "Usia 1 - 3 Tahun", desc: "Puncak perkembangan kapasitas kemampuan berbahasa dan kognitif berpikir anak." },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4 rounded-2xl items-center shadow-xs">
              <span className="w-12 h-12 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm shadow-brand-primary/10">
                {item.pct}
              </span>
              <div>
                <h4 className="font-bold text-xs text-base-text-primary">{item.title}</h4>
                <p className="text-[11px] text-base-text-secondary font-medium mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Urgensi Nutrisi Optimal */}
      <div className="space-y-2.5">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          💡 Mengapa Nutrisi 1000 HPK Harus Optimal?
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Kekurangan asupan gizi pada masa ini dapat menyebabkan gangguan pertumbuhan fisik dan perkembangan otak yang bersifat <strong className="text-status-red-solid">permanen (tidak dapat diperbaiki)</strong>, termasuk tubuh pendek atau stunting serta rendahnya kemampuan berpikir anak saat dewasa. 
        </p>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Pencegahan komprehensif harus dilakukan secara konsisten sejak masa calon pengantin, kehamilan, masa nifas, hingga anak berusia genap 2 tahun.
        </p>
      </div>

      {/* Bagian 3: Layanan Kesehatan Gratis */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🏥 Layanan Kesehatan Gratis Selama Kehamilan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Gunakan fasilitas kesehatan dasar (Puskesmas/Posyandu) secara aktif harian untuk mendapatkan hak pemeriksaan gratis berikut:
        </p>

        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="py-3 px-4 w-1/2">🤰 Layanan Kesehatan Ibu</th>
                <th className="py-3 px-4 w-1/2">👶 Layanan Kesehatan Bayi</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ibu: "Pemeriksaan Rutin Kehamilan Bidan/Dokter", bayi: "Pemeriksaan Kondisi & Denyut Jantung Bayi" },
                { ibu: "Pemberian Paket Tablet Tambah Darah (TTD)", bayi: "Imunisasi Proteksi Tetanus Toxoid (TT)" },
                { ibu: "Pemeriksaan Status Gizi Akurat & LiLA", bayi: "Pemeriksaan USG Gratis Berkala (3 Kali)" },
                { ibu: "Pemeriksaan Tekanan Darah & Lab Darah", bayi: "Kelas Edukasi Ibu Hamil & Konseling Menyusui" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors font-medium text-base-text-secondary">
                  <td className="py-3 px-4 border-r border-base-border/20">✓ {row.ibu}</td>
                  <td className="py-3 px-4">✓ {row.bayi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L2: Kehamilan
function L2ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER UTAMA */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-black text-base-text-primary uppercase tracking-tight">Kehamilan</h1>
        <p className="text-sm font-semibold text-brand-primary italic mt-0.5">Masa keemasan seorang ibu.</p>
      </div>

      {/* BANNER UTAMA (KUNING) */}
      <div className="p-4 bg-status-yellow-light/30 border border-status-yellow-solid/30 rounded-2xl text-center text-sm font-black text-status-yellow-solid shadow-xs uppercase tracking-wide">
        ⭐ Periksa paling sedikit 6 kali oleh dokter atau bidan.
      </div>

      <p className="text-xs font-medium text-base-text-secondary leading-relaxed">
        Kehamilan adalah masa menyenangkan dalam kehidupan seorang ibu yang menantikan kehadiran buah hatinya.
      </p>

      {/* BENTO GRID: YANG AKAN DIALAMI & YANG HARUS DILAKUKAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KELOMPOK 1: YANG AKAN DIALAMI */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-extrabold text-xs text-status-purple-solid uppercase tracking-wider flex items-center gap-1.5">🤰 Yang Akan Dialami</h4>
          <p className="font-semibold text-base-text-primary bg-status-purple-light/10 p-3 rounded-xl">
            Selama masa kehamilan 9 bulan, Ibu akan naik berat badannya sebanyak 5 – 18 kg sesuai dengan status gizi ibu sebelum hamil (lihat halaman 108).
          </p>
          <div className="space-y-2 pt-1">
            <p className="font-bold text-base-text-primary">Bayi dalam kandungan juga akan berkembang, yaitu:</p>
            <ul className="space-y-2 pl-1 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">•</span>
                <span><strong>Usia kehamilan 1-3 bulan:</strong> Kira-kira sebesar jeruk nipis di akhir bulan ke-3.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">•</span>
                <span><strong>Usia kehamilan 4-6 bulan:</strong> Kira-kira sebesar jagung di akhir bulan ke-6.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-primary font-bold">•</span>
                <span><strong>Usia kehamilan 7-9 bulan:</strong> Kira-kira sebesar buah semangka di akhir bulan ke-9.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* KELOMPOK 2: YANG HARUS DILAKUKAN */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-2.5">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider">✅ Yang Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Segera periksa ke fasilitas pelayanan kesehatan, jika terlambat datang bulan 1 minggu.</li>
            <li>Periksa kehamilan ke fasilitas pelayanan kesehatan paling sedikit 6 kali.</li>
            <li>Makan dengan porsi lebih banyak atau lebih sering daripada sebelum hamil, dan cukup minum (lihat halaman 6, 16 &amp; 38).</li>
            <li>Batasi konsumsi kopi, teh, dan minuman bersoda, hindari minum alkohol.</li>
            <li>Hindari merokok dan paparan asap rokok.</li>
            <li>Minum tablet tambah darah (TTD)/multivitamin setiap hari selama kehamilan.</li>
            <li>Kenali dan cek tanda bahaya (lihat halaman 8, 17 &amp; 20). Segera pergi ke rumah sakit jika dirujuk.</li>
            <li>Jangan minum obat yang tidak diresepkan oleh dokter.</li>
          </ul>
        </div>
      </div>

      {/* SECTION 3: MENGAPA HARUS DILAKUKAN */}
      <div className="bg-status-blue-light/10 border border-status-blue-solid/25 rounded-2xl p-4.5">
        <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider mb-2">💡 Mengapa Harus Dilakukan</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Untuk mencegah masalah pada kehamilan.</li>
          <li>Agar bayi lahir cukup bulan pada usia kehamilan 38-40 minggu dengan berat badan lahir paling sedikit 2.5 kg dan panjang badan paling sedikit 48 cm.</li>
          <li>Untuk mempersiapkan ibu dan keluarga dalam menjalani kehamilan, melahirkan/kelahiran dan perawatan bayi baru lahir.</li>
        </ul>
      </div>

      {/* SECTION 4: TABEL LAYANAN KESEHATAN GRATIS */}
      <div className="space-y-2.5 pt-2">
        <h4 className="font-bold text-base-text-primary text-sm border-b pb-1.5 flex items-center gap-2">🏥 Tabel Acuan Layanan Kesehatan Gratis Selama Kehamilan</h4>
        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base-text-primary text-white text-[11px] font-bold">
                <th colSpan={2} className="p-2.5 text-center uppercase tracking-wider">Layanan kesehatan gratis selama kehamilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border/20 text-xs font-semibold text-base-text-primary">
              <tr className="divide-x divide-base-border/20">
                <td className="p-3 w-1/2 bg-base-bg/30">Pemeriksaan kehamilan oleh dokter, bidan dan tenaga kesehatan</td>
                <td className="p-3 w-1/2">Pemberian tablet tambah darah (TTD)/multivitamin bagi ibu hamil</td>
              </tr>
              <tr className="divide-x divide-base-border/20">
                <td className="p-3 w-1/2">Pemeriksaan status gizi</td>
                <td className="p-3 w-1/2 bg-base-bg/30">Pemeriksaan tekanan darah</td>
              </tr>
              <tr className="divide-x divide-base-border/20">
                <td className="p-3 w-1/2 bg-base-bg/30">Pemeriksaan laboratorium</td>
                <td className="p-3 w-1/2">Skrining kesehatan jiwa</td>
              </tr>
              <tr className="divide-x divide-base-border/20">
                <td className="p-3 w-1/2">Pemeriksaan kondisi bayi</td>
                <td className="p-3 w-1/2 bg-base-bg/30">Imunisasi Tetanus</td>
              </tr>
              <tr className="divide-x divide-base-border/20">
                <td className="p-3 w-1/2 bg-base-bg/30">USG 2 kali</td>
                <td className="p-3 w-1/2">Kelas ibu hamil</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="text-[10px] text-base-text-secondary/70 italic text-center pt-2">
        Lihat pencatatan dan pemeriksaan ibu hamil oleh tenaga kesehatan di halaman 96-108.
      </div>

    </div>
  );
}

// ARTIKEL L3: Usia Kehamilan 1-3 Bulan (Trimester 1)
function L3ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER UTAMA */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-wider">Kehamilan - Trimester 1</span>
        <h1 className="text-xl font-black text-base-text-primary mt-2">Usia Kehamilan 1-3 Bulan (Trimester 1)</h1>
        <p className="text-xs font-bold text-base-text-secondary mt-0.5">Masa Penting Pembentukan Bagian Tubuh Janin</p>
      </div>

      {/* INFOGRAFIS PERKEMBANGAN JANIN */}
      <div className="grid grid-cols-2 gap-3 bg-base-bg/20 p-4 rounded-2xl border border-base-border/20 text-center">
        <div className="bg-base-white p-3 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-base-text-secondary block">Bulan ke-1</span>
          <span className="text-xs font-black text-brand-primary block my-1">👶 Sebesar Biji Beras</span>
          <span className="text-[10px] text-base-text-secondary font-medium">Panjang: ± 0.64 cm</span>
        </div>
        <div className="bg-base-white p-3 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-base-text-secondary block">Bulan ke-3</span>
          <span className="text-xs font-black text-brand-primary block my-1">🍋 Sebesar Jeruk Nipis</span>
          <span className="text-[10px] text-base-text-secondary font-medium">Panjang: hingga 10 cm | Berat: ± 28 gram</span>
        </div>
      </div>

      <p className="font-medium text-base-text-primary">
        Selama 3-bulan pertama kehamilan, ibu dan bayi akan mengalami berbagai perubahan.
      </p>

      {/* TIMELINE DIALAMI IBU & BAYI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-purple-solid uppercase tracking-wider">🤰 Yang Akan Dialami Ibu</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Gejala mual, muntah dan mudah lelah. Pada masa ini juga rentan terjadi keguguran.</li>
            <li>Berat badan naik, yaitu sekitar 1-3 kg sesuai dengan grafik peningkatan berat badan (lihat halaman 108).</li>
          </ul>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider">👶 Yang Akan Dialami Bayi</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Pada masa ini, bayi akan tumbuh mulai dari panjang 0.64 cm atau kira-kira sebesar biji beras, hingga 10 cm dan berat sekitar 28 gram atau kira-kira sebesar jeruk nipis.</li>
            <li>Bagian tubuh bayi, termasuk otak, mulai terbentuk.</li>
          </ul>
        </div>
      </div>

      {/* STRUKTUR TINDAKAN MANDIRI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider">✅ Yang Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Periksa kehamilan ke dokter paling sedikit satu kali, termasuk USG dan laboratorium lengkap.</li>
            <li>Makan dengan porsi lebih kecil tapi sering, yang terbagi dalam 3 kali makanan utama dan 2 kali makanan selingan (lihat tabel porsi makan dan minum Ibu Hamil di bawah).</li>
            <li>Minum Tablet Tambah Darah (TTD)/Multivitamin setiap hari selama kehamilan.</li>
            <li>Kenali dan cek tanda bahaya (lihat halaman 8). Jika mengalami tanda bahaya, segera pergi ke fasilitas pelayanan kesehatan.</li>
          </ul>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-brand-primary uppercase tracking-wider">💡 Mengapa Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Memastikan kesehatan ibu dan perkembangan bayi.</li>
            <li>Agar dapat dirawat dengan segera jika ditemukan kondisi yang membahayakan ibu dan bayi.</li>
          </ul>
        </div>
      </div>

      {/* MATRIX TABEL PORSI MAKANAN HARIAN */}
      <div className="space-y-2.5 pt-2">
        <h4 className="font-bold text-base-text-primary text-sm border-b pb-1.5">🍽️ Porsi Makan dan Minum Ibu Hamil Untuk Kebutuhan Sehari (12 Minggu Pertama)</h4>
        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-xs">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-base-text-primary text-white text-[10px] uppercase font-bold tracking-wider">
                <th className="p-2.5 w-1/4">Bahan Makanan</th>
                <th className="p-2.5 w-1/5 text-center">12 Minggu Pertama</th>
                <th className="p-2.5 w-11/20">Keterangan Per Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border/20 font-medium text-base-text-primary">
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Nasi atau Makanan Pokok</td>
                <td className="p-2.5 text-center font-bold">5 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">
                  • 100 g atau 3/4 gelas nasi<br/>
                  • 125 g atau 1 buah jagung sedang<br/>
                  • 210 g atau 2 kentang sedang<br/>
                  • 120 g atau 1/2 potong singkong<br/>
                  • 70 g atau 3 biskuit putih<br/>
                  • 200 g atau 2 gelas mie basah
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Protein Hewani (Ikan, Telur, Ayam, dll)</td>
                <td className="p-2.5 text-center font-bold">4 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">
                  • 50 g atau 1 potong sedang ikan<br/>
                  • 55 g atau 1 butir telur ayam
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Protein Nabati (Tempe, Tahu, dll)</td>
                <td className="p-2.5 text-center font-bold">4 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">
                  • 50 g atau 1 potong sedang tempe<br/>
                  • 100 g atau 2 potong sedang tahu
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Sayur-sayuran</td>
                <td className="p-2.5 text-center font-bold">4 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">• 100 g atau 1 mangkuk sayur matang tanpa kuah</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Buah-buahan</td>
                <td className="p-2.5 text-center font-bold">4 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">
                  • 110 g atau 1 potong sedang pisang<br/>
                  • 100-190 g atau 1 potong besar pepaya
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Minyak/Lemak</td>
                <td className="p-2.5 text-center font-bold">5 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">
                  • 5 g atau 1 sendok teh, bersumber dari pengolahan makanan seperti menggoreng, menumis, santan, kemiri, mentega dan sumber lemak lainnya.<br/>
                  • <em>Minyak/lemak termasuk santan yang digunakan dalam pengolahan, makanan digoreng, ditumis atau dimasak dengan santan.</em>
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold bg-base-bg/10">Gula</td>
                <td className="p-2.5 text-center font-bold">2 Porsi</td>
                <td className="p-2.5 text-base-text-secondary">• 10 g atau 1 sendok makan bersumber dari kue-kue manis, minum teh manis dan lain-lainnya</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* HIGHLIGHT BOX BATASI KONSUMSI */}
      <div className="p-3.5 bg-status-yellow-light/20 border border-status-yellow-solid/25 rounded-xl text-status-yellow-solid font-black text-center text-xs uppercase tracking-wide">
        ⚠️ Batasi konsumsi garam paling banyak 1 sendok teh/hari dan minum air putih 8 - 12 gelas per hari.
      </div>
      <p className="text-[10px] text-base-text-secondary/60 italic -mt-2 pl-1">
        * Tenaga kesehatan menjelaskan porsi makan disesuaikan dengan bahan lokal.
      </p>

      {/* SECTION PENTING: PANDUAN KONSUMSI TTD / MMS (EKS HALAMAN 7) */}
      <div className="p-4 bg-status-blue-light/10 border border-status-blue-solid/20 rounded-2xl space-y-2">
        <h4 className="font-extrabold text-xs text-status-blue-solid flex items-center gap-1.5">💊 Penting: Panduan Disiplin Minum TTD/MMS harian</h4>
        <p className="font-medium text-base-text-secondary text-[11px] leading-relaxed">
          Untuk mencegah kekurangan darah, TTD/MMS harus diminum setiap hari selama kehamilan. Sebaiknya pada malam hari sebelum tidur untuk mengurangi rasa mual.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[10px] font-semibold text-base-text-primary">
          <div className="p-2.5 bg-base-white border border-base-border/30 rounded-xl">
            <span className="text-status-green-solid block mb-0.5">👍 Sangat Direkomendasikan:</span>
            Agar zat besi diserap lebih baik dalam tubuh, TTD/MMS sebaiknya dikonsumsi bersama makanan atau minuman yang mengandung vitamin C seperti buah-buahan.
          </div>
          <div className="p-2.5 bg-base-white border border-base-border/30 rounded-xl">
            <span className="text-status-red-solid block mb-0.5">❌ Hindari Konsumsi Bersama:</span>
            Hindari minum TTD/MMS bersama teh, kopi, susu dan obat maag yang dapat menghambat penyerapan zat besi di dalam lambung tubuh.
          </div>
        </div>
      </div>

      {/* FOOTER REFERENCE */}
      <div className="text-[10px] text-base-text-secondary/70 italic text-center pt-1 border-t">
        Lihat pencatatan dan pemeriksaan ibu hamil trimester 1 oleh tenaga kesehatan di halaman 96-101.
      </div>

    </div>
  );
}
// ARTIKEL L4: Tanda Bahaya Pada Trimester 1
function L4ArticleContent() {
  return (
    <div className="space-y-8 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-300">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#FFF0F5] via-[#FFF5F5] to-[#FEF0E8] border border-[#EA2986]/10 p-6 shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#EA2986]/5 rounded-full -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FF6B6B]/5 rounded-full translate-y-8 -translate-x-8 pointer-events-none" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-[10px] bg-[#EA2986]/10 text-[#EA2986] px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            📖 Kehamilan · Trimester 1 · Halaman 8 – 9
          </span>
          <h1 className="text-xl font-black text-base-text-primary leading-tight">
            Tanda Bahaya &amp; Perawatan Sehari-hari Ibu Hamil
          </h1>
          <p className="text-xs text-base-text-secondary/80 mt-1.5 font-medium">
            Panduan Medis Resmi Buku KIA · Halaman 8 – 9
          </p>
          <div className="flex items-center gap-3 mt-4 text-[10px] font-semibold text-base-text-secondary/70">
            <span className="flex items-center gap-1">⏱ 8 Menit membaca</span>
            <span className="w-1 h-1 bg-base-text-secondary/30 rounded-full" />
            <span className="flex items-center gap-1">📋 Informasi Medis</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HALAMAN 8 — TANDA BAHAYA & MASALAH KEHAMILAN
         ══════════════════════════════════════════════════════════════ */}

      {/* ── ALERT KRITIS ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-red-600 to-rose-500 p-5 shadow-lg shadow-red-500/25">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🚨</div>
          <div>
            <p className="font-black text-white text-sm uppercase tracking-wide leading-snug">
              Segera ke Puskesmas / Rumah Sakit!
            </p>
            <p className="text-white/85 text-[11px] mt-1 font-medium leading-relaxed">
              Jika mengalami tanda bahaya pada masa kehamilan, segera bawa ibu hamil periksa ke Puskesmas / Rumah Sakit.
            </p>
          </div>
        </div>
      </div>

      {/* ── TANDA BAHAYA TRIMESTER 1 ───────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-400 rounded-full" />
          <h2 className="text-sm font-black text-base-text-primary">Tanda Bahaya Pada Trimester 1</h2>
          <span className="text-[9px] bg-red-50 text-red-500 border border-red-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Waspada!</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: "🌡️", label: "Demam Tinggi.", color: "from-orange-50 to-red-50", border: "border-orange-200/60", dot: "bg-red-500" },
            { icon: "🤕", label: "Nyeri perut hebat.", color: "from-red-50 to-rose-50", border: "border-red-200/60", dot: "bg-red-500" },
            { icon: "🤢", label: "Mual dan muntah hebat.", color: "from-yellow-50 to-orange-50", border: "border-yellow-200/60", dot: "bg-orange-500" },
            { icon: "🩸", label: "Perdarahan.", color: "from-rose-50 to-red-50", border: "border-rose-300/60", dot: "bg-rose-600" },
            { icon: "⚠️", label: "Sakit saat kencing atau keluar keputihan atau gatal di daerah kemaluan.", color: "from-amber-50 to-yellow-50", border: "border-amber-200/60", dot: "bg-amber-500" },
          ].map((item, idx) => (
            <div key={idx} className={`relative bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-4 flex items-start gap-3 shadow-xs hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5`}>
              <div className="shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-base group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </div>
              <div className="flex items-start gap-2 pt-0.5">
                <div className={`shrink-0 w-2 h-2 ${item.dot} rounded-full mt-1`} />
                <p className="font-bold text-base-text-primary text-[11px] leading-snug">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MASALAH LAIN PADA KEHAMILAN ────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-400 rounded-full" />
          <h2 className="text-sm font-black text-base-text-primary">Masalah Lain Pada Kehamilan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "😮‍💨", label: "Batuk lama (lebih dari 2 minggu).", span: false },
            { icon: "🦟", label: "Demam, menggigil dan berkeringat. Bila ibu berada di daerah endemis malaria, menunjukkan adanya gejala penyakit malaria.", span: true },
            { icon: "💧", label: "Diare berulang.", span: false },
            { icon: "💗", label: "Jantung berdebar-debar atau nyeri di dada.", span: false },
            { icon: "😰", label: "Sulit tidur dan cemas berlebihan.", span: false },
          ].map((item, idx) => (
            <div key={idx} className={`bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${item.span ? "sm:col-span-2" : ""}`}>
              <div className="shrink-0 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-sm">{item.icon}</div>
              <div className="flex items-start gap-2 pt-0.5">
                <div className="shrink-0 w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5" />
                <p className="font-semibold text-base-text-primary text-[11px] leading-snug">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DIVIDER HALAMAN ───────────────────────────────────────── */}
      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-border/40 to-transparent" />
        <span className="shrink-0 text-[10px] font-black text-base-text-secondary/50 uppercase tracking-widest bg-base-bg px-3 rounded-full border border-base-border/20 py-1">
          Halaman 9
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-base-border/40 to-transparent" />
      </div>

      {/* ── PERAWATAN SEHARI-HARI ──────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-green-400 rounded-full" />
          <h2 className="text-sm font-black text-base-text-primary">Perawatan Sehari-hari Ibu Hamil</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              num: "1", icon: "🧼", title: "Higiene & Kebersihan Diri",
              desc: "Menjaga kebersihan diri dengan mencuci tangan pakai sabun dan dibilas dengan air bersih yang mengalir, mandi, dan mengganti pakaian secara teratur.",
              from: "from-emerald-50", to: "to-green-50", border: "border-emerald-200/50", numColor: "bg-emerald-500"
            },
            {
              num: "2", icon: "😴", title: "Pola Istirahat",
              desc: "Istirahat cukup dengan tidur malam paling sedikit 6-7 jam dan tidur siang selama 1-2 jam.",
              from: "from-blue-50", to: "to-cyan-50", border: "border-blue-200/50", numColor: "bg-blue-500"
            },
            {
              num: "3", icon: "💬", title: "Stimulasi Janin",
              desc: "Merangsang pertumbuhan bayi dengan sering berbicara pada bayi, dan melakukan sentuhan pada perut ibu.",
              from: "from-pink-50", to: "to-rose-50", border: "border-pink-200/50", numColor: "bg-pink-500"
            },
            {
              num: "4", icon: "💑", title: "Aktivitas Seksual",
              desc: "Hubungan suami istri selama hamil boleh dilakukan selama kondisi kesehatan sehat.",
              from: "from-amber-50", to: "to-orange-50", border: "border-amber-200/50", numColor: "bg-amber-500"
            },
          ].map((item, idx) => (
            <div key={idx} className={`relative bg-gradient-to-br ${item.from} ${item.to} border ${item.border} rounded-2xl p-4 space-y-2 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 ${item.numColor} text-white rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm`}>{item.num}</div>
                <span className="text-base">{item.icon}</span>
                <span className="font-black text-base-text-primary text-[11px]">{item.title}</span>
              </div>
              <p className="text-[10.5px] text-base-text-secondary leading-relaxed pl-9">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HAL YANG TIDAK BOLEH DILAKUKAN ─────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-rose-500 rounded-full" />
          <h2 className="text-sm font-black text-red-600 uppercase tracking-wide">Hal-hal yang Tidak Boleh Dilakukan Ibu Selama Kehamilan</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: "💊", label: "Minum obat tanpa resep dokter." },
            { icon: "🏋️", label: "Aktivitas berat yang membuat ibu kelelahan." },
            { icon: "🚬", label: "Merokok atau terpapar asap rokok." },
            { icon: "🍶", label: "Minum minuman beralkohol dan jamu." },
            { icon: "😤", label: "Stres berlebihan." },
            { icon: "🛌", label: "Tidur terlentang lebih dari 10 menit pada trimester 2 & 3, untuk menghindari kekurangan oksigen pada bayi." },
          ].map((item, idx) => (
            <div key={idx} className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 rounded-2xl p-4 flex items-start gap-3 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
              <div className="shrink-0 w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-base group-hover:scale-110 transition-transform duration-200">{item.icon}</div>
              <div className="flex items-start gap-2 pt-1">
                <span className="shrink-0 text-red-500 font-black text-sm leading-none">✕</span>
                <p className="font-bold text-base-text-primary text-[11px] leading-snug">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AKTIVITAS FISIK YANG DILARANG ──────────────────────────── */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 bg-gradient-to-b from-red-600 to-rose-500 rounded-full" />
          <h2 className="text-sm font-black text-red-600 uppercase tracking-wide">Aktivitas Fisik yang Tidak Boleh Dilakukan Ibu Selama Hamil</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: "🦵", label: "Jongkok terlalu lama." },
            { icon: "🦘", label: "Melompat." },
            { icon: "⚖️", label: "Risiko keseimbangan." },
            { icon: "🙇", label: "Membungkuk tanpa pegangan." },
            { icon: "😤", label: "Mengejan." },
          ].map((item, idx) => (
            <div key={idx} className="bg-gradient-to-b from-red-50 to-rose-50 border border-red-200/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group text-center min-h-[80px]">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
              <div className="flex items-start gap-1">
                <span className="text-red-500 font-black text-[10px]">🚫</span>
                <span className="font-bold text-base-text-primary text-[10px] leading-tight">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BANNER REKOMENDASI LATIHAN FISIK ──────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EFF6FF] via-[#F0FDF4] to-[#ECFDF5] border border-blue-200/50 p-5 shadow-sm">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -translate-y-6 translate-x-6 pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">🏃‍♀️</div>
          <div>
            <p className="font-black text-base-text-primary text-xs mb-1">Rekomendasi Latihan Fisik</p>
            <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">
              Pada Trimester 1 ibu dapat melakukan latihan fisik, seperti <strong className="text-base-text-primary">pemanasan dan peregangan</strong>, <strong className="text-base-text-primary">senam panggul</strong>, serta <strong className="text-base-text-primary">pendinginan dan peregangan</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* ── FOOTER REFERENCE ──────────────────────────────────────── */}
      <div className="text-[10px] text-base-text-secondary/60 italic text-center pt-1 border-t border-base-border/30 pb-2">
        Sumber: Buku KIA 2024 · Halaman 8 – 9 · Tanda Bahaya &amp; Perawatan Ibu Hamil Trimester 1
      </div>

    </div>
  );
}

// ARTIKEL L5: Kesehatan Jiwa Ibu Hamil
function L5ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      {/* PENGANTAR EDUKASI VERBATIM */}
      <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs">
        <p className="font-medium text-base-text-primary text-[11px] leading-normal">
          Kehamilan merupakan proses yang sangat penting bagi ibu dan keluarga. Selama masa kehamilan, ibu akan mengalami perubahan fisik dan emosional yang wajar terjadi karena perubahan hormon dalam tubuh. Keluarga harus selalu memberikan dukungan emosional kepada ibu hamil agar ibu merasa tenang, nyaman, dan bahagia selama menjalani kehamilan.
        </p>
      </div>

      {/* SEKSI TANDA PERUBAHAN JIWA */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-base-text-primary border-l-4 border-[#AC1959] pl-2 uppercase tracking-wide">
          Segera Konsultasikan ke Dokter/Bidan jika Ibu Hamil Mengalami Gejala:
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Sangat cemas/khawatir tentang proses kehamilan, persalinan, dan setelah melahirkan.",
            "Sedih yang mendalam, menangis tanpa sebab, gampang tersinggung, dan sering marah.",
            "Perubahan pola tidur (sulit tidur atau tidur berlebihan).",
            "Nafsu makan menurun atau berlebihan.",
            "Sulit berkonsentrasi.",
            "Kurang bertenaga/mudah lelah atau kehilangan minat terhadap aktivitas yang biasa disukai.",
            "Merasa tidak berharga atau merasa bersalah yang berlebihan.",
            "Muncul pikiran untuk menyakiti diri sendiri atau janin."
          ].map((gejala, idx) => (
            <div key={idx} className="bg-base-white border border-base-border/30 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
              <span className="text-[#AC1959] font-black text-sm mt-0.5">•</span>
              <p className="font-bold text-base-text-primary text-[11px] leading-tight">{gejala}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BANNER DUKUNGAN KELUARGA */}
      <div className="p-4 bg-[#AC1959]/5 border border-[#AC1959]/20 rounded-xl text-base-text-primary font-bold text-[11px] flex items-start gap-3 shadow-xs">
        <span className="text-base">❤️</span>
        <p className="leading-normal">
          <strong className="text-[#AC1959] block mb-0.5">Pesan untuk Suami & Keluarga:</strong>
          Dukungan psikologis dari suami dan anggota keluarga terdekat adalah kunci utama dalam mencegah terjadinya depresi atau gangguan kesehatan jiwa pada ibu selama masa kehamilan.
        </p>
      </div>

    </div>
  );
}

// ARTIKEL L6: Usia Kehamilan 4-6 Bulan (Trimester 2)
function L6ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Memasuki Usia Kehamilan 4-6 Bulan (Trimester 2), organ tubuh janin berkembang semakin matang dan Ibu mulai dapat merasakan gerakan pertamanya. Fase ini adalah saat yang tepat bagi Ibu dan keluarga untuk mulai merencanakan persiapan persalinan dengan matang harian.
      </p>

      {/* Grid Estimasi Ukuran Janin Berkala */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            icon: "🍎",
            title: "Bulan Ke-4 (13-16 Minggu)",
            desc: "Ukuran janin sebesar Apel. Panjang tubuh janin mulai berkembang dari sekitar 12.5 cm."
          },
          {
            icon: "🌽",
            title: "Bulan Ke-6 (21-24 Minggu)",
            desc: "Ukuran janin sebesar Jagung. Panjang mencapai 34 cm dengan berat badan kisaran 1000 gram."
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
            <span className="text-3xl shrink-0">{item.icon}</span>
            <div className="text-xs">
              <h4 className="font-bold text-base-text-primary">{item.title}</h4>
              <p className="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid Dinamika Ibu, Bayi, dan Edukasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
        {/* Yang Dialami Ibu */}
        <div className="bg-base-white border border-base-border/25 rounded-2xl p-5 shadow-xs">
          <h4 className="font-bold text-brand-primary mb-2.5 flex items-center gap-1.5">
            🤰 Yang Akan Dialami Ibu:
          </h4>
          <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
            <li>Gejala mual/muntah yang dirasakan pada awal kehamilan mulai berkurang secara bertahap.</li>
            <li>Kenaikan berat badan ideal berkisar <strong className="text-base-text-primary">4 - 8 kg</strong> (sesuai status gizi pra-hamil).</li>
            <li>Mulai merasakan tendangan atau pergerakan aktif janin harian pada usia kehamilan 5 bulan.</li>
          </ul>
        </div>

        {/* Yang Harus Dilakukan */}
        <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-5 shadow-xs">
          <h4 className="font-bold text-status-green-solid mb-2.5 flex items-center gap-1.5">
            ✅ Yang Harus Dilakukan Ibu:
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Periksa kehamilan ke dokter atau bidan minimal 2 kali pada trimester ini.</li>
            <li>Pantau secara aktif gerakan janin harian dalam kandungan.</li>
            <li>Makan porsi kecil tapi sering (3 kali makan utama + 1-2 kali kudapan sehat).</li>
            <li>Minum rutin Paket <strong className="text-status-green-solid">Tablet Tambah Darah (TTD)</strong> harian.</li>
            <li>Diskusikan awal rencana proses persalinan bersama tenaga kesehatan.</li>
          </ul>
        </div>
      </div>

      {/* Bagian Utama: Tabel Porsi Makan & Minum Trimester 2 */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🍽️ Porsi Makan & Minum Ibu Hamil (Kebutuhan Sehari Usia 12-40 Minggu)
        </h2>
        
        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="py-3 px-4 w-1/3">Bahan Makanan</th>
                <th className="py-3 px-4 text-center w-28">Takaran Harian</th>
                <th className="py-3 px-4">Keterangan Porsi Pilihan</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Nasi / Makanan Pokok",
                  portion: "6 Porsi",
                  desc: ["100 g atau 3/4 gelas nasi", "125 g atau 3 buah jagung sedang", "210 g atau 2 kentang sedang", "120 g atau 1/2 potong singkong", "70 g atau 3 iris roti putih", "200 g atau 2 gelas mie basah"]
                },
                {
                  name: "Protein Hewani",
                  sub: "Ikan, Telur, Ayam, dll.",
                  portion: "4 Porsi",
                  desc: ["50 g atau 1 potong sedang ikan", "55 g atau 1 butir telur ayam"]
                },
                {
                  name: "Protein Nabati",
                  sub: "Tempe, Tahu, dll.",
                  portion: "4 Porsi",
                  desc: ["50 g atau 1 potong sedang tempe", "100 g atau 2 potong sedang tahu"]
                },
              ].map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 border-r border-base-border/10 font-bold text-base-text-primary">
                    {row.name}
                    {row.sub && <small className="text-base-text-secondary block font-normal mt-0.5">({row.sub})</small>}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">{row.portion}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium">
                    <ul className="list-disc pl-4 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {row.desc.map((li, lIdx) => <li key={lIdx}>{li}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
              {[
                { name: "Sayur-sayuran", portion: "4 Porsi", desc: "100 g atau 1 mangkuk sayur matang tanpa kuah." },
                { name: "Buah-buahan", portion: "4 Porsi", desc: "100 g (1 potong sedang) pisang, ATAU 100-190 g (1 potong besar) pepaya." },
                { name: "Minyak / Lemak", portion: "5 Porsi", desc: "5 g atau 1 sendok teh. Bersumber dari pengolahan makanan seperti menggoreng, menumis, santan, mentega, atau kemiri." },
                { name: "Gula", portion: "2 Porsi", desc: "10 g atau 1 sendok makan. Bersumber dari kue-kue manis, teh manis harian, dsb." }
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 border-r border-base-border/10 font-bold text-base-text-primary">{row.name}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">{row.portion}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium leading-relaxed">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Baris Intisari Batasan Konsumsi */}
      <div className="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs flex items-center gap-2">
        <span>⚠️</span>
        <p>
          Batasi konsumsi garam paling banyak <strong className="text-base-text-primary">1 sendok teh/hari</strong> dan pastikan minum air putih minimal <strong className="text-base-text-primary">8 - 12 gelas per hari</strong>.
        </p>
      </div>
    </div>
  );
}

// ARTIKEL L7: Tanda Bahaya Pada Trimester 2
function L7ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Mengenali tanda bahaya kehamilan trimester 2 sangat penting demi keselamatan Ibu dan janin. Jika Ibu mengalami salah satu dari gejala di bawah ini, segera ke Puskesmas atau Rumah Sakit terdekat tanpa menunda.
      </p>

      {/* Bagian Judul Indikator */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 9 Tanda Bahaya Kehamilan Trimester 2
        </h2>
        
        {/* Grid Cards Menu Tanda Bahaya */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "🤒", num: "1", title: "Demam Tinggi", desc: "Suhu tubuh panas tinggi menandakan infeksi sistemik pada sistem tubuh ibu hamil." },
            { icon: "🤮", num: "2", title: "Muntah Darah", desc: "Muntah parah atau bercampur darah segar berisiko hilangnya nutrisi esensial harian harian ibu." },
            { icon: "🫁", num: "3", title: "Sesak Napas", desc: "Napas pendek tersengal disertai nyeri dada mendadak atau kondisi jantung berdebar kencang." },
          ].map((item, idx) => (
            <div key={idx} className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center space-y-2 shadow-xs hover:border-status-red-solid/40 transition-colors">
              <span className="text-3xl mb-1">{item.icon}</span>
              <h4 className="font-extrabold text-xs text-base-text-primary">
                {item.num}. {item.title}
              </h4>
              <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L8: Usia Kehamilan 7-9 Bulan (Trimester 3)
function L8ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER UTAMA */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-wider">Kehamilan - Trimester 3</span>
        <h1 className="text-xl font-black text-base-text-primary mt-2">Usia Kehamilan 7-9 Bulan (Trimester 3)</h1>
        <p className="text-xs font-bold text-base-text-secondary mt-0.5">Persiapan Menyambut Kehadiran Si Kecil</p>
      </div>

      {/* INFOGRAFIS PERKEMBANGAN JANIN */}
      <div className="grid grid-cols-2 gap-3 bg-base-bg/20 p-4 rounded-2xl border border-base-border/20 text-center">
        <div className="bg-base-white p-3 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-base-text-secondary block">Bulan ke-7</span>
          <span className="text-xs font-black text-brand-primary block my-1">🥭 Sebesar Pepaya</span>
        </div>
        <div className="bg-base-white p-3 rounded-xl shadow-xs">
          <span className="text-xs font-bold text-base-text-secondary block">Bulan ke-9</span>
          <span className="text-xs font-black text-brand-primary block my-1">🍉 Sebesar Semangka</span>
        </div>
      </div>

      <p className="font-medium text-base-text-primary bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/10 text-center">
        Selamat, Ibu sudah mencapai masa terakhir kehamilan! Sebentar lagi ibu, ayah, dan keluarga akan bertemu dengan anggota keluarga baru.
      </p>

      {/* BENTO GRID: DIALAMI IBU & BAYI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-purple-solid uppercase tracking-wider">🤰 Yang Akan Dialami Ibu</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Sering merasa lelah, tidak nyaman, dan sulit tidur.</li>
            <li>Sering buang air kecil dan kakinya bengkek.</li>
            <li>Kenaikan berat badan sesuai dengan status gizi ibu sebelum hamil, yaitu sekitar 4 – 8 kg.</li>
          </ul>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider">👶 Yang Akan Dialami Bayi</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Perkembangan fungsi organ dan tubuh bayi memasuki tahap akhir dan bayi siap dilahirkan.</li>
            <li>Bayi akan tumbuh mulai dari panjang 40 cm dan berat sekitar 1300 gram, atau kira-kira sebesar buah pepaya, hingga panjang paling sedikit 48 cm dan berat sekitar 2500 – 3999 gram, atau kira-kira sebesar buah semangka di akhir trimester 3.</li>
          </ul>
        </div>
      </div>

      {/* ACTIONS GRID: YANG HARUS DILAKUKAN & MENGAPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider">✅ Yang Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Periksa kehamilan paling sedikit tiga kali dan salah satunya harus oleh dokter, termasuk pemeriksaan USG dan laboratorium.</li>
            <li>Makan dengan porsi lebih kecil tapi sering, yang terbagi dalam 3 kali makanan utama ditambah dengan 1-2 kali makanan kudapan dalam sehari (lihat halaman 16) sama dengan trimester 2.</li>
            <li>Minum Tablet Tambah Darah (TTD)/Multivitamin setiap hari selama kehamilan.</li>
            <li>Kenali dan cek tanda bahaya (lihat halaman 20). Jika mengalami tanda bahaya, segera pergi ke fasilitas pelayanan kesehatan.</li>
            <li>Kenali tanda awal melahirkan dan tanda bahaya pada melahirkan.</li>
            <li>Pelajari proses melahirkan.</li>
            <li>Diskusikan dengan tenaga kesehatan metode KB yang akan dipilih.</li>
            <li>Pelajari pentingnya Inisiasi Menyusu Dini (IMD) dan pemberian Air Susu Ibu (ASI).</li>
            <li>Ketahui hal-hal penting terkait perawatan bayi baru lahir.</li>
          </ul>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-extrabold text-xs text-brand-primary uppercase tracking-wider">💡 Mengapa Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Agar ibu mendapatkan pemeriksaan menyeluruh, untuk dapat menentukan di mana sebaiknya ibu melahirkan.</li>
            <li>Agar ibu dan keluarga siap untuk menghadapi proses kelahiran dan merawat bayi yang dilahirkan.</li>
          </ul>
        </div>
      </div>

      {/* FOOTER PANDUAN BUKU */}
      <div className="text-[10px] text-base-text-secondary/70 italic text-center p-2 bg-base-bg/30 rounded-xl border">
        Lihat pencatatan dan pemeriksaan ibu hamil trimester 3 oleh tenaga kesehatan di halaman 102-106.
      </div>

      {/* BOX MITOS & FAKTA (AKSEN WARNA UTAMA KENANGA CARE #AC1959) */}
      <div className="border rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-[#E25E3E] text-white p-3 flex items-center gap-3">
          <span className="font-black tracking-wider uppercase bg-black/20 px-2 py-0.5 rounded text-[10px]">MITOS</span>
          <p className="font-bold text-[11px]">Minyak dan makanan pedas dapat mempercepat kelahiran.</p>
        </div>
        <div className="bg-status-blue-solid text-white p-3">
          <div className="flex items-start gap-3">
            <span className="font-black tracking-wider uppercase bg-black/20 px-2 py-0.5 rounded text-[10px] mt-0.5">FAKTA</span>
            <div className="text-[11px] font-medium space-y-1">
              <p className="font-black text-status-yellow-solid">Mitos ini tidak terbukti secara ilmiah ya, Bu.</p>
              <p>Yang terpenting adalah menjaga pola makan seimbang dan memenuhi kebutuhan gizi agar ibu dan bayi tetap sehat selama proses melahirkan.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-base-text-secondary font-semibold text-center italic pt-1">
        Ibu juga bisa menanyakan ke kader atau bidan soal makanan dan minuman yang harus dikonsumsi.
      </p>

    </div>
  );
}

// ARTIKEL L9: Tanda Bahaya Pada Trimester 3
function L9ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Memasuki trimester ketiga (usia kehamilan 29-40 minggu), persiapan melahirkan harus mulai dimatangkan. Ibu dan keluarga wajib mengenali tanda bahaya pada trimester ini agar dapat segera mencari pertolongan medis darurat demi keselamatan ibu dan janin.
      </p>

      {/* Bagian 1: Tanda Bahaya Trimester 3 */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 Tanda Bahaya Kehamilan Trimester 3
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "👶", title: "Gerakan Bayi Berkurang", desc: "Gerakan bayi tidak ada atau kurang dari 10 kali dalam kurun waktu 12 jam." },
            { icon: "💦", title: "Ketuban Pecah Dini", desc: "Air ketuban pecah atau merembes keluar dari jalan lahir namun belum ada rasa kram/mulas (kontraksi)." },
            { icon: "🤰", title: "Nyeri Perut Hebat", desc: "Nyeri perut bagian bawah yang sangat hebat dan menusuk di antara jeda kontraksi." },
            { icon: "🩸", title: "Perdarahan Hebat", desc: "Keluar darah segar dalam jumlah banyak dari jalan lahir, berisiko solusio plasenta." },
            { icon: "🤯", title: "Sakit Kepala / Pandangan Buram", desc: "Pusing atau sakit kepala berdenyut sangat berat disertai mata berkunang-kunang. Tanda utama preeklampsia." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center space-y-2 shadow-xs hover:border-status-red-solid/40 transition-colors
                ${idx === 3 ? 'sm:col-span-2 md:col-span-1' : ''}
                ${idx === 4 ? 'sm:col-span-2 md:col-span-2' : ''}`}
            >
              <span className="text-3xl mb-1">{item.icon}</span>
              <h4 className="font-extrabold text-xs text-base-text-primary">
                {idx + 1}. {item.title}
              </h4>
              <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Tindakan Segera */}
      <div className="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start">
        <span className="text-lg">🚨</span>
        <div>
          <h4 className="font-extrabold text-sm mb-1">TINDAKAN SEGERA:</h4>
          <p className="font-medium leading-relaxed">
            Jika Ibu hamil merasakan minimal salah satu tanda bahaya di atas, segera bawa ke Puskesmas atau Rumah Sakit terdekat untuk pertolongan medis darurat!
          </p>
        </div>
      </div>

      {/* Bagian 2: Menyambut Kelahiran */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🤰 Sambut Kehadiran Sang Buah Hati (Melahirkan)
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Persalinan adalah momen yang dinanti-nanti setelah perjuangan 9 bulan. Berikut panduan penting saat menyambut persalinan:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Kolom Tempat & Yang Dialami */}
          <div className="bg-brand-soft/20 border border-brand-primary/15 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-1.5">
                🏥 Tempat Melahirkan Terbaik
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mb-4">
                Proses melahirkan harus dilakukan di fasilitas pelayanan kesehatan resmi (<strong>Puskesmas, Rumah Sakit, atau Klinik Bersalin</strong>) agar jika terjadi penyulit atau keadaan darurat dapat segera ditangani secara tepat oleh nakes.
              </p>
            </div>
            
            <div className="border-t border-brand-primary/10 pt-3">
              <h4 className="font-bold text-brand-primary mb-1 flex items-center gap-1.5">
                👩‍👦 Yang Dialami Ibu
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mt-1">
                <li>Melahirkan umumnya terjadi pada usia kehamilan 38 - 40 minggu.</li>
                <li>Ditandai dengan pembukaan jalan lahir, rasa mulas teratur yang intensitasnya semakin sering dan lama, serta keluar lendir bercampur sedikit darah.</li>
              </ul>
            </div>
          </div>
          
          {/* Kolom Yang Harus Dilakukan & Alasan */}
          <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="font-bold text-status-green-solid mb-2 flex items-center gap-1.5">
                ✅ Yang Harus Dilakukan
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mb-4">
                <li>Segera pergi ke fasilitas kesehatan bila merasakan mulas teratur atau ketuban pecah.</li>
                <li>Siapkan pendamping melahirkan (suami atau keluarga dekat) serta perlengkapan administrasi/bayi.</li>
                <li>Rawat gabung ibu dan bayi dalam satu ruangan jika kondisi keduanya dalam keadaan sehat.</li>
              </ul>
            </div>

            <div className="border-t border-status-green-solid/10 pt-3">
              <h4 className="font-bold text-status-green-solid mb-1 flex items-center gap-1.5">
                💡 Mengapa Harus Dilakukan?
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mt-1">
                <li>Mempercepat penanganan komplikasi persalinan jika ada.</li>
                <li>Memulai Inisiasi Menyusu Dini (IMD) dalam 1 jam pertama.</li>
                <li>Menjamin pemantauan kesehatan ibu dan bayi selama 24 jam awal pasca salin.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//=====================================================================================================================
// ARTIKEL L10: Melahirkan
function L10ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER UTAMA */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-wider">Persalinan</span>
        <h1 className="text-2xl font-black text-base-text-primary uppercase tracking-tight mt-2">Melahirkan</h1>
        <p className="text-sm font-semibold text-brand-primary italic mt-0.5">Saatnya Sambut Kehadiran Sang Buah Hati</p>
      </div>

      {/* BANNER UTAMA (KUNING) */}
      <div className="p-4 bg-status-yellow-light/30 border border-status-yellow-solid/30 rounded-2xl text-center text-xs font-black text-status-yellow-solid shadow-xs uppercase tracking-wide leading-normal">
        ⭐ Proses melahirkan harus dilakukan di Puskesmas, Rumah Sakit atau Klinik Bersalin, sehingga jika terjadi masalah dapat ditangani segera.
      </div>

      <p className="text-xs font-medium text-base-text-secondary leading-relaxed">
        Masa yang dinanti-nanti telah tiba! Setelah melalui masa kehamilan 9 bulan lebih, kini saatnya mempersiapkan kelahiran si kecil dengan baik.
      </p>

      {/* BENTO GRID: YANG AKAN DIALAMI & YANG HARUS DILAKUKAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* KELOMPOK 1: YANG AKAN DIALAMI */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm space-y-2.5">
          <h4 className="font-extrabold text-xs text-status-purple-solid uppercase tracking-wider">🤰 Yang Akan Dialami</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Ibu akan melahirkan idealnya pada usia kehamilan 38-40 minggu.</li>
            <li>Ketika proses melahirkan dimulai, Ibu akan mengalami pembukaan jalan lahir, keluarnya lendir bercampur darah, merasakan mulas-mulas yang teratur, semakin sering dan semakin lama.</li>
          </ul>
        </div>

        {/* KELOMPOK 2: YANG HARUS DILAKUKAN */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm space-y-2.5">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider">✅ Yang Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Pergi ke Puskesmas atau fasilitas pelayanan kesehatan sesuai dengan perencanaan melahirkan, bila ibu merasakan tanda awal melahirkan.</li>
            <li>Siapkan pendamping proses melahirkan dan apa saja yang perlu dibawa ibu.</li>
            <li>Ibu dan bayi dirawat dalam satu ruangan jika kondisi keduanya baik.</li>
            <li>Ibu dan bayi dirawat di puskesmas, Rumah Sakit atau klinik bersalin paling sedikit 24 jam setelah melahirkan normal.</li>
            <li>Lakukan perawatan Inisiasi Menyusu Dini (IMD) atau kontak kulit ke kulit antara ibu dengan bayinya segera setelah melahirkan sampai paling sedikit 1 jam.</li>
          </ul>
        </div>
      </div>

      {/* SECTION 3: MENGAPA HARUS DILAKUKAN */}
      <div className="bg-status-blue-light/10 border border-status-blue-solid/25 rounded-2xl p-4.5">
        <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider mb-2">💡 Mengapa Harus Dilakukan</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Melahirkan dilakukan di fasilitas pelayanan kesehatan untuk mempercepat penanganan yang tepat, jika terjadi masalah pada saat melahirkan.</li>
          <li>Kontak kulit ke kulit dengan bayi penting untuk menjaga kehangatan bayi, membangun ikatan kasih sayang antara ibu dan anak (bonding), serta awal keberhasilan menyusui, dimana bayi mendapat Air Susu Ibu pertama (Kolostrum) untuk menjaga kekebalan tubuhnya.</li>
          <li>Ibu dan bayi tetap dirawat paling sedikit 24 jam untuk pemantauan kesehatan dan tanda bahaya.</li>
        </ul>
      </div>

      {/* FOOTER NOTE */}
      <div className="text-[10px] text-base-text-secondary/70 italic text-center pt-2 border-t">
        Lihat pencatatan dan pemeriksaan persiapan ibu melahirkan oleh tenaga kesehatan di halaman 110-115.
      </div>

    </div>
  );
}

// ARTIKEL L11: Tanda Awal Proses Melahirkan
function L11ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER ARTIKEL */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-wider">Persalinan - Panduan Normal</span>
        <h1 className="text-xl font-black text-base-text-primary mt-2">Tanda Awal Melahirkan &amp; Panduan IMD</h1>
        <p className="text-xs font-semibold text-base-text-secondary mt-0.5">Panduan Edukasi Menjelang Hari Perkiraan Lahir (HPL)</p>
      </div>

      <p className="text-sm text-base-text-secondary leading-relaxed font-medium">
        Proses persalinan yang lancar memerlukan pemahaman mendalam atas tanda-tanda persalinan normal. Setelah bayi lahir, langkah pertama yang sangat dianjurkan adalah pelaksanaan Inisiasi Menyusu Dini (IMD) demi kesehatan optimal bayi.
      </p>

      {/* GRID: TANDA AWAL & MANAJEMEN NYERI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-bold text-status-blue-solid flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
            ⚡ Tanda Awal Proses Melahirkan
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 font-semibold text-base-text-primary">
            <li>Keluar lendir bercampur darah segar dari jalan lahir.</li>
            <li>Merembes atau keluar cairan ketuban jernih dari jalan lahir.</li>
            <li>Perut mulas-mulas yang teratur, timbulnya semakin sering, kram semakin kuat, dan berlangsung semakin lama.</li>
          </ul>
        </div>
        
        <div className="bg-[#AC1959]/5 border border-[#AC1959]/15 rounded-2xl p-4.5 shadow-xs space-y-2">
          <h4 className="font-bold text-[#AC1959] flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
            🌬️ Mengurangi Rasa Sakit Bersalin
          </h4>
          <p className="font-semibold text-base-text-primary leading-relaxed">
            Untuk mengurangi rasa sakit ketika bersalin secara mandiri, Ibu dianjurkan untuk menarik napas panjang melalui hidung secara perlahan dan keluarkan melalui mulut saat kontraksi/mulas datang. Minta suami atau pendamping memijat punggung bawah secara perlahan.
          </p>
        </div>
      </div>

      {/* SEKSI UTAMA IMD */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-black text-base-text-primary border-l-4 border-brand-primary pl-2 uppercase tracking-wide">
          🍼 Inisiasi Menyusu Dini (IMD)
        </h2>
        <p className="font-medium">
          Inisiasi Menyusu Dini (IMD) adalah proses meletakkan bayi secara tengkurap di dada ibu segera setelah lahir, sehingga kulit bayi melekat pada kulit ibu selama minimal 1 jam untuk mencari puting susu secara alami.
        </p>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-brand-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            ✨ Manfaat IMD bagi Ibu &amp; Bayi
          </h4>
          <ul className="list-none space-y-3 pl-1 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="text-brand-primary mt-0.5">🔥</span>
              <span><strong className="text-base-text-primary block">Kehangatan Alami</strong> Sentuhan kulit ke kulit menjaga suhu tubuh bayi tetap hangat dan stabil secara alami pasca keluar dari rahim.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-primary mt-0.5">🛡️</span>
              <span><strong className="text-base-text-primary block">Meningkatkan Kekebalan Tubuh</strong> Bayi mendapatkan cairan <strong className="text-[#AC1959]">Kolostrum</strong> (ASI pertama berwarna kekuningan) yang kaya antibodi alami untuk melindunginya dari risiko infeksi bakteri.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-primary mt-0.5">🧬</span>
              <span><strong className="text-base-text-primary block">Ikatan Kasih Sayang (Bonding)</strong> Membangun kelekatan emosional yang kuat antara Ibu dan bayi sejak detik pertama dilahirkan ke dunia.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-brand-primary mt-0.5">🩸</span>
              <span><strong className="text-base-text-primary block">Merangsang Kontraksi Rahim Ibu</strong> Isapan alami bayi pada puting merangsang pelepasan hormon oksitosin yang membantu rahim ibu berkontraksi dengan baik, sehingga meminimalisir risiko perdarahan pasca salin.</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}

// ARTIKEL L12: Tanda Bahaya Pada Proses Melahirkan
function L12ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER ARTIKEL */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-status-red-solid/10 text-status-red-solid px-2.5 py-1 rounded-full uppercase tracking-wider">Persalinan - Risiko Tinggi</span>
        <h1 className="text-xl font-black text-base-text-primary mt-2">Tanda Bahaya Pada Proses Melahirkan</h1>
        <p className="text-xs font-semibold text-base-text-secondary mt-0.5">Panduan Deteksi Kritis dan Protokol Rujukan Darurat</p>
      </div>

      <p className="text-sm font-medium leading-relaxed">
        Saat proses persalinan berlangsung, pendamping dan bidan wajib waspada penuh. Kemunculan salah satu dari tanda klinis di bawah ini menandakan adanya komplikasi persalinan yang mengancam nyawa ibu maupun janin.
      </p>

      {/* MATRIX BENTO GRID LARANGAN & GEJALA KRITIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: "💦", title: "Ketuban Hijau & Bau", desc: "Air ketuban pecah berwarna keruh kehijauan dan berbau tidak sedap atau busuk akibat tanda janin stres." },
          { icon: "😫", title: "Ibu Gelisah / Nyeri Hebat", desc: "Ibu tampak sangat gelisah atau mengalami kesakitan luar biasa ekstrem di luar batas normal kontraksi." },
          { icon: "🧠", title: "Ibu Mengalami Kejang", desc: "Ibu mengalami kejang-kejang akibat lonjakan tekanan darah tinggi (gejala eklampsia persalinan)." },
          { icon: "🥵", title: "Ibu Tidak Kuat Mengejan", desc: "Ibu merasa kelelahan hebat, kehabisan energi, dan tidak memiliki tenaga lagi untuk mendorong bayi." },
          { icon: "🩸", title: "Perdarahan Jalan Lahir", desc: "Keluar darah segar mengalir sangat banyak dari jalan lahir sebelum tanda-tangan bayi lahir." },
          { icon: "👶", title: "Tali Pusat/Tangan Keluar", desc: "Tali pusat bayi, pergelangan tangan, atau kaki bayi keluar dari jalan lahir mendahului kepala bayi." }
        ].map((item, idx) => (
          <div key={idx} className="bg-status-red-light/10 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-2.5 shadow-xs">
            <span className="text-3xl">{item.icon}</span>
            <h4 className="font-extrabold text-xs text-base-text-primary">
              {idx + 1}. {item.title}
            </h4>
            <p className="text-[11px] text-base-text-secondary font-medium leading-normal">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* BANNER UTAMA RUJUK DARURAT */}
      <div className="bg-status-red-solid text-white p-5 rounded-2xl flex gap-3.5 items-start shadow-md border border-status-red-solid">
        <span className="text-2xl animate-pulse">🚨</span>
        <div className="space-y-1">
          <h4 className="font-black text-sm uppercase tracking-wide">Protokol Intervensi Rujuk Darurat:</h4>
          <p className="font-semibold text-[11px] leading-relaxed opacity-90">
            Jika ditemukan minimal salah satu dari 6 tanda bahaya di atas, keluarga dan petugas kesehatan dilarang keras menunda waktu atau melakukan penanganan mandiri di rumah. Ibu harus segera dievakuasi dan dirujuk ke Rumah Sakit dengan fasilitas PONEK terdekat!
          </p>
        </div>
      </div>

    </div>
  );
}

// ARTIKEL L13: Panduan Inisiasi Menyusu Dini (IMD)
function L13ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* HEADER UTAMA HALAMAN */}
      <div className="border-b pb-4">
        <span className="font-extrabold text-[10px] bg-[#AC1959]/10 text-[#AC1959] px-2.5 py-1 rounded-full uppercase tracking-wider">Pasca Persalinan / Neonatal</span>
        <h1 className="text-xl font-black text-base-text-primary mt-2 uppercase tracking-tight">Inisiasi Menyusu Dini (IMD)</h1>
        <p className="text-xs font-semibold text-base-text-secondary mt-0.5">Panduan Golden Hour Resmi Buku KIA 2024</p>
      </div>

      {/* PARAGRAF PENGANTAR VERBATIM */}
      <div className="p-4 bg-brand-soft/10 border border-brand-primary/10 rounded-2xl space-y-2">
        <p className="font-semibold text-base-text-primary text-[11px] leading-relaxed">
          Bayi yang baru lahir harus segera mendapatkan Inisiasi Menyusu Dini (IMD) melalui kontak kulit ke kulit dengan ibunya dalam waktu 1 jam setelah kelahiran. Setelah menyusu pada jam pertama, bayi biasanya akan tidur panjang dan menyusu lagi jika lapar.
        </p>
      </div>

      {/* MATRIKS MANFAAT KLINIS IMD VERBATIM */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-base-text-primary uppercase tracking-wide border-l-4 border-[#AC1959] pl-2">
          Manfaat IMD pada ibu dan bayi adalah sebagai berikut:
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🧘‍♀️</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Kenyamanan Psikologis</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Menciptakan rasa tenang dan nyaman pada ibu dan bayi melalui kontak kulit ke kulit.</p>
          </div>

          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🛡️</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Antibodi &amp; Daya Tahan</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Kandungan kolostrum dalam ASI mengandung gizi dan antibodi dari ibu, sehingga bisa meningkatkan daya tahan tubuh dan ketahanan hidup bayi.</p>
          </div>

          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🦠</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Kesehatan Pencernaan</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Meningkatkan kesehatan sistem pencernaan bayi, sehingga mengurangi risiko diare pada bayi.</p>
          </div>

          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🍼</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Stimulasi ASI Kontinu</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Menstimulasi produksi ASI dan meningkatkan durasi menyusui.</p>
          </div>

          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🩸</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Reduksi Pendarahan Ibu</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Mengurangi pendarahan karena gerakan bayi di atas perut ibu dapat membantu menstimulasi kontraksi rahim.</p>
          </div>

          <div className="bg-base-white border border-base-border/30 rounded-xl p-4 shadow-xs space-y-1">
            <span className="text-sm">🧬</span>
            <h4 className="font-bold text-base-text-primary text-[11px]">Pelepasan Plasenta</h4>
            <p className="font-medium text-base-text-secondary leading-normal">Mempercepat proses pelepasan plasenta.</p>
          </div>
        </div>
      </div>

      {/* ========================================================
          INFORMASI TAMBAHAN EDUKATIF (ENHANCED/ADDITIONAL INFO)
         ======================================================== */}
      <hr className="my-6 border-base-border/40" />

      {/* BENTO BOX 1: TAHAPAN LAHANAN PRAKTIS IMD */}
      <div className="bg-[#AC1959]/5 border border-[#AC1959]/20 rounded-2xl p-4.5 space-y-3">
        <h4 className="font-black text-xs text-[#AC1959] uppercase tracking-wide flex items-center gap-1.5">
          📋 Tahapan Pelaksanaan IMD di Ruang Bersalin (Golden Hour)
        </h4>
        <ol className="list-decimal pl-4 space-y-2 font-medium text-base-text-primary">
          <li><strong className="text-base-text-primary">Keringkan Bayi:</strong> Segera setelah lahir, bayi dikeringkan tubuhnya kecuali kedua telapak tangan (karena bau ketuban pada tangan menuntun bayi ke puting susu).</li>
          <li><strong className="text-base-text-primary">Skin-to-Skin:</strong> Bayi ditengkurapkan langsung di dada telanjang ibu tanpa pakaian/bedong. Kepala bayi berada di antara payudara ibu dengan posisi lebih rendah dari puting.</li>
          <li><strong className="text-base-text-primary">Selimuti Bersama:</strong> Bayi dan ibu diselimuti bersama, dan kepala bayi diberi topi agar terhindar dari hipotermia (kedinginan).</li>
          <li><strong className="text-base-text-primary">Biarkan Merangkak Mandiri:</strong> Biarkan bayi melakukan usaha alami mencari puting susu ibu. Petugas/keluarga dilarang memaksakan atau memasukkan puting ke mulut bayi secara instan.</li>
        </ol>
      </div>

      {/* BENTO BOX 2: HUSBAND SUPPORT SYSTEM */}
      <div className="bg-status-blue-light/10 border border-status-blue-solid/20 rounded-2xl p-4.5 space-y-2">
        <h4 className="font-black text-xs text-status-blue-solid uppercase tracking-wide flex items-center gap-1.5">
          👨‍🍼 Peran Suami/Ayah Saat Proses IMD Berlangsung
        </h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Mendampingi di sisi tempat tidur ibu dan memberikan motivasi verbal agar ibu tetap rileks.</li>
          <li>Membantu memastikan selimut dan topi bayi terpasang dengan baik agar kehangatan bayi terjaga.</li>
          <li>Ikut menjaga posisi bayi agar aman, tidak terjatuh, dan jalan napas (hidung) bayi tidak tertutup oleh payudara atau kain.</li>
        </ul>
      </div>

    </div>
  );
}

//=====================================================================================================================
// ARTIKEL L14: Setelah Melahirkan
function L14ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro */}
      <div className="bg-[#E5E6F2] p-4 rounded-xl border border-[#3E57A3]/20">
        <p className="text-xs sm:text-sm font-medium text-[#3E57A3] leading-relaxed">
          Selamat, Ibu sudah melahirkan si kecil! Pada masa nifas ini, ibu, ayah, dan seluruh anggota keluarga perlu memberikan perhatian ekstra terhadap kesehatan fisik serta emosional ibu dan bayi.
        </p>
      </div>

      {/* Jadwal Periksa */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-[#3E57A3]">
          <MdEventAvailable className="w-4 h-4" />
          Jadwal Pemeriksaan Kesehatan Ibu &amp; Bayi (Minimal 4 Kali)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center">
            <span className="text-[10px] font-bold text-base-text-secondary block">KF 1 / Pertama</span>
            <span className="text-xs font-black text-[#3E57A3]">6 Jam - 2 Hari</span>
            <span className="text-[9px] text-base-text-secondary block mt-0.5">setelah melahirkan</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center">
            <span className="text-[10px] font-bold text-base-text-secondary block">KF 2 / Kedua</span>
            <span className="text-xs font-black text-[#3E57A3]">3 - 7 Hari</span>
            <span className="text-[9px] text-base-text-secondary block mt-0.5">setelah melahirkan</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center">
            <span className="text-[10px] font-bold text-base-text-secondary block">KF 3 / Ketiga</span>
            <span className="text-xs font-black text-[#3E57A3]">8 - 28 Hari</span>
            <span className="text-[9px] text-base-text-secondary block mt-0.5">setelah melahirkan</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center">
            <span className="text-[10px] font-bold text-base-text-secondary block">KF 4 / Keempat</span>
            <span className="text-xs font-black text-[#3E57A3]">29 - 42 Hari</span>
            <span className="text-[9px] text-base-text-secondary block mt-0.5">khusus untuk Ibu</span>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Dual Column Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yang Akan Dialami */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#3E57A3] flex items-center gap-2">
            <MdInfo className="w-4 h-4" />
            Yang Akan Dialami Ibu
          </h4>
          <ul className="list-disc list-inside text-xs space-y-2 text-base-text-secondary leading-relaxed pl-1">
            <li><span className="font-semibold text-base-text-primary">Masa Pemulihan:</span> Ibu akan mengalami fase pemulihan fisik, fluktuasi hormonal, serta adaptasi emosional pasca-persalinan.</li>
            <li><span className="font-semibold text-base-text-primary">Produksi Kolostrum:</span> Air Susu Ibu (ASI) pertama yang berwarna kekuningan mulai keluar sekitar 5-10 ml pada hari pertama dan akan terus bertambah seiring seringnya bayi menyusu.</li>
          </ul>
        </div>

        {/* Yang Harus Dilakukan */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#3E57A3] flex items-center gap-2">
            <MdCheckCircle className="w-4 h-4" />
            Yang Harus Dilakukan
          </h4>
          <ul className="list-disc list-inside text-xs space-y-2 text-base-text-secondary leading-relaxed pl-1">
            <li>Melakukan pemeriksaan rutin ke dokter/bidan/perawat minimal 4 kali sesuai jadwal nifas.</li>
            <li>Mengonsumsi <span className="font-semibold text-base-text-primary">Tablet Tambah Darah (TTD)</span> secara teratur untuk mencegah risiko anemia pasca-melahirkan.</li>
            <li>Segera periksa ke fasilitas kesehatan jika mendapati tanda bahaya nifas atau merasa sedih/depresi lebih dari 2 minggu (*postpartum depression*).</li>
            <li>Mengonsumsi makanan bergizi seimbang (makanan pokok, lauk pauk, sayur, buah) dengan porsi lebih banyak untuk mendukung produksi ASI.</li>
            <li>Ayah dan keluarga berbagi peran dalam pengasuhan bayi serta memijat punggung ibu dengan lembut demi stimulasi ASI.</li>
          </ul>
        </div>
      </div>

      {/* Mengapa Harus Dilakukan */}
      <div className="p-4 bg-base-bg border border-base-border/60 rounded-xl space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-base-text-secondary flex items-center gap-1.5">
          <MdWarning className="w-3.5 h-3.5 text-[#3E57A3]" />
          Mengapa Ini Sangat Penting?
        </h4>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Pemeriksaan rutin penting untuk memantau kesehatan rahim ibu hingga 42 hari pasca-melahirkan, mendeteksi dini adanya infeksi, mencegah perdarahan nifas, serta memastikan pemenuhan gizi ibu terpenuhi dengan baik sehingga pasokan ASI bagi bayi dapat terjaga secara penuh.
        </p>
      </div>
    </div>
  );
}

// ARTIKEL L15: Tanda Bahaya pada Ibu Setelah Melahirkan
function L15ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Alert Banner */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Peringatan Kritis</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Kematian ibu tertinggi rawan terjadi pada masa setelah melahirkan. Jika ibu mengalami salah satu tanda bahaya di bawah ini, segera bawa ke Puskesmas atau Rumah Sakit!
          </p>
        </div>
      </div>

      {/* Grid Tanda Bahaya */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-[#3E57A3]">
          <MdWarning className="w-4 h-4 text-status-red" />
          Kenali 6 Tanda Bahaya Masa Nifas
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">1. Demam Tinggi</span>
            <p className="text-base-text-secondary">Suhu tubuh meningkat drastis atau demam bertahan lebih dari 2 hari.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">2. Depresi Pasca-Melahirkan</span>
            <p className="text-base-text-secondary">Ibu terlihat sangat sedih, murung, gelisah, dan sering menangis tanpa sebab jelas.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">3. Cairan Jalan Lahir Berbau</span>
            <p className="text-base-text-secondary">Keluar cairan atau lokhia yang berbau busuk/menyengat dari jalan lahir.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">4. Gejala Preeklamsia Nifas</span>
            <p className="text-base-text-secondary">Nyeri ulu hati, mual muntah berat, sakit kepala hebat, pandangan kabur, atau kejang disertai bengkak pada kaki, tangan, dan wajah.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">5. Masalah Payudara Akut</span>
            <p className="text-base-text-secondary">Payudara membengkak, memerah ekstrem, mengeras, disertai rasa sakit atau nyeri hebat (mastitis).</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-base-text-primary block mb-0.5">6. Perdarahan Nifas</span>
            <p className="text-base-text-secondary">Keluar darah segar secara terus-menerus lewat jalan lahir pasca-persalinan.</p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Hal yang Dilarang */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-status-red">
          <MdCancel className="w-4 h-4" />
          Hal-hal yang Dilarang Selama Pemulihan &amp; Nifas
        </h4>
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/60">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-base-text-secondary pl-1 list-none">
            <li className="flex items-start gap-2">
              <span className="text-status-red font-bold">✕</span>
              <span><span className="font-semibold text-base-text-primary">Membuang Kolostrum:</span> Dilarang membuang ASI pertama yang keluar karena sangat kaya zat kekebalan tubuh anak.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-red font-bold">✕</span>
              <span><span className="font-semibold text-base-text-primary">Zat Kimia pada Payudara:</span> Dilarang membersihkan payudara dengan alkohol, povidon iodine, obat merah, atau sabun keras karena berisiko terminum bayi.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-red font-bold">✕</span>
              <span><span className="font-semibold text-base-text-primary">Mengikat Perut Ekstrem:</span> Tidak boleh mengikat/bebat perut terlalu kencang karena dapat mengganggu pemulihan organ dalam rahim.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-red font-bold">✕</span>
              <span><span className="font-semibold text-base-text-primary">Posisi Tidur Telungkup:</span> Dilarang melakukan latihan fisik atau posisi tidur telungkup terlalu dini selama pemulihan rahim.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-status-red font-bold">✕</span>
              <span><span className="font-semibold text-base-text-primary">Daun-daunan di Area Intim:</span> Dilarang menempelkan ramuan atau daun-daunan pada kemaluan karena memicu infeksi bakteri serius.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L16: Mengenal Depresi Setelah Melahirkan
function L16ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Banner */}
      <div className="bg-[#E5E6F2] p-4 rounded-xl border border-[#3E57A3]/20">
        <p className="text-xs sm:text-sm font-medium text-[#3E57A3] leading-relaxed">
          Setelah melahirkan, perubahan hormon dan tekanan emosional dapat memicu gangguan kesehatan jiwa pada ibu. Penting bagi keluarga untuk mengenali perbedaan antara kondisi emosional biasa dan depresi klinis agar penanganan tepat bisa segera diberikan.
        </p>
      </div>

      {/* Perbedaan Kondisi */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold flex items-center gap-2 text-[#3E57A3]">
          <MdInfo className="w-4 h-4" />
          Kenali Perbedaan: Baby Blues vs Depresi Pasca-Melahirkan
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baby Blues */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECF2FE] text-[#4A85F6]">BABY BLUES</span>
            <p className="text-xs text-base-text-secondary leading-relaxed">
              Terjadi segera setelah melahirkan dan biasanya memuncak dalam beberapa hari hingga <span className="font-semibold text-base-text-primary">maksimal 2 minggu</span>.
            </p>
            <div className="text-[11px] text-base-text-secondary pt-1 border-t border-gray-100">
              <span className="font-bold text-base-text-primary block mb-0.5">Gejala Utama:</span>
              Suasana perasaan tidak stabil, mudah menangis, sulit tidur, mudah cemas, dan mudah tersinggung.
            </div>
          </div>

          {/* Postpartum Depression */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-red-soft/30 text-status-red">POSTPARTUM DEPRESI</span>
            <p className="text-xs text-base-text-secondary leading-relaxed">
              Dapat terjadi dalam <span className="font-semibold text-base-text-primary">2 hingga 4 minggu</span> setelah melahirkan, dengan gejala menetap paling sedikit selama 2 minggu berturut-turut.
            </p>
            <div className="text-[11px] text-base-text-secondary pt-1 border-t border-gray-100 space-y-1">
              <span className="font-bold text-base-text-primary block">Gejala Kritis:</span>
              <ul className="list-disc list-inside space-y-0.5 pl-0.5">
                <li>Merasa sangat sedih, tertekan, lelah, dan tidak bergairah.</li>
                <li>Perubahan perasaan dan perilaku ekstrem yang tidak serasi.</li>
                <li>Gangguan tidur berat, tidak selera makan (atau terlalu banyak makan).</li>
                <li>Khawatir berlebih tidak dapat menjadi ibu yang baik.</li>
                <li><span className="text-status-red font-semibold">Kondisi Berat:</span> Mengalami gangguan halusinasi, waham/delusi, hingga pikiran untuk melukai diri sendiri atau bayinya.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Upaya Pencegahan */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-[#3E57A3]">
          <MdShield className="w-4 h-4" />
          Langkah Pencegahan Dini
        </h4>
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/60">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs text-base-text-secondary pl-1 list-inside list-disc">
            <li>Ibu hamil dan keluarga aktif mengenali serta memahami gejala gangguan jiwa.</li>
            <li>Kontrol kehamilan dan nifas secara teratur ke bidan atau dokter sesuai jadwal.</li>
            <li>Mendapatkan deteksi dini faktor risiko masalah kesehatan jiwa pasca-melahirkan.</li>
            <li>Mengonsumsi makanan sehat, bergizi seimbang, serta vitamin pendukung tubuh.</li>
            <li>Memastikan adanya dukungan emosional penuh dari suami dan keluarga selama masa kehamilan hingga nifas.</li>
          </ul>
        </div>
      </div>

      {/* Upaya Penanganan */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-[#3E57A3]">
          <MdHealing className="w-4 h-4" />
          Rencana Penanganan Efektif
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center space-y-1">
            <div className="w-7 h-7 bg-[#E5E6F2] rounded-lg flex items-center justify-center text-[#3E57A3] mx-auto">
              <MdFavorite className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">Dukungan Suami</span>
            <p className="text-[11px] text-base-text-secondary">Memberi perhatian agar tidak hanya bayinya saja yang dipedulikan, serta berbagi peran mengasuh.</p>
          </div>

          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center space-y-1">
            <div className="w-7 h-7 bg-[#E5E6F2] rounded-lg flex items-center justify-center text-[#3E57A3] mx-auto">
              <MdPsychology className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">Konseling Profesional</span>
            <p className="text-[11px] text-base-text-secondary">Mengajak ibu bicara mengenai perasaannya dan melakukan sesi konseling dengan tenaga kesehatan.</p>
          </div>

          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 text-center space-y-1">
            <div className="w-7 h-7 bg-status-red-soft/40 rounded-lg flex items-center justify-center text-status-red mx-auto">
              <MdWarning className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">Terapi Medis &amp; Kunjungan</span>
            <p className="text-[11px] text-base-text-secondary">Mengikuti program kunjungan rumah oleh nakes serta menjalani terapi obat-obatan jika diindikasikan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L17: Panduan Program Keluarga Berencana (KB)
function L17ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#E5E6F2] p-4 rounded-xl border border-[#3E57A3]/20 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#3E57A3] flex items-center gap-1.5">
          <MdFamilyRestroom className="w-4 h-4" />
          Membangun Keluarga Sehat &amp; Terencana
        </h4>
        <p className="text-xs sm:text-sm text-base-text-secondary leading-relaxed">
          Kehamilan yang sehat adalah kehamilan yang <span className="font-semibold text-base-text-primary">direncanakan, diinginkan, dan dijaga</span> perkembangannya dengan baik. Program Keluarga Berencana (KB) pasca-melahirkan hadir agar ibu dapat memulihkan kondisi fisik sepenuhnya dan memberikan perhatian serta kecukupan gizi yang optimal untuk si kecil.
        </p>
      </div>

      {/* Syarat Layak Hamil */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#3E57A3] flex items-center gap-2">
          <MdCheckCircle className="w-4 h-4" />
          Kriteria Kondisi Layak Hamil (Fisik &amp; Mental)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">1. Jarak Ideal Kehamilan</span>
            <p className="text-base-text-secondary leading-relaxed">
              Usia reproduksi sehat berkisar antara <span className="font-semibold text-base-text-primary">20-35 tahun</span> dengan jarak antar-kehamilan minimal <span className="font-semibold text-[#3E57A3]">2 tahun</span> guna menekan angka kematian ibu dan komplikasi persalinan.
            </p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">2. Batas Kecukupan Gizi &amp; Asuhan</span>
            <p className="text-base-text-secondary leading-relaxed">
              Jumlah anak disarankan <span className="font-semibold text-base-text-primary">kurang dari 3</span> untuk memastikan kecukupan gizi, stabilitas ekonomi, serta kualitas perhatian pengasuhan anak yang merata.
            </p>
          </div>
        </div>
      </div>

      {/* Prinsip KB Pasca Melahirkan */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#3E57A3] flex items-center gap-2">
          <MdInfo className="w-4 h-4" />
          Ketentuan KB Pasca Melahirkan (Nifas)
        </h4>
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 text-xs text-base-text-secondary space-y-2 leading-relaxed">
          <p>
            Program KB pasca-melahirkan mencakup penggunaan metode kontrasepsi langsung sesudah melahirkan <span className="font-semibold text-base-text-primary">sampai dengan 6 minggu (42 hari)</span> pasca-persalinan.
          </p>
          <div className="flex items-start gap-2 bg-base-white p-2.5 rounded-lg border border-base-border/40 text-[11px] text-[#3E57A3]">
            <span className="font-bold">✦ Prinsip Utama:</span>
            <span>Metode kontrasepsi yang dipilih wajib <span className="font-semibold underline">tidak mengganggu produksi ASI Eksklusif</span> dan harus disesuaikan secara personal dengan kondisi kesehatan tubuh ibu.</span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE SHORTCUT / CTA LINK BANNER */}
      <div className="p-4 bg-base-white border-2 border-dashed border-[#3E57A3]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 bg-[#E5E6F2] text-[#3E57A3] rounded-xl flex items-center justify-center shrink-0">
            <MdPregnantWoman className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold text-base-text-primary">Pantau Rencana KB Anda Mandiri</h5>
            <p className="text-[10px] text-base-text-secondary">Isi kuesioner dan catat jenis kontrasepsi pilihan Anda di lembar rekam data Ibu.</p>
          </div>
        </div>
        <Link 
          href="/perjalanan-ibu?tab=kb" 
          className="flex items-center gap-1.5 px-4 py-2 bg-[#3E57A3] hover:bg-[#2F4482] text-base-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 group whitespace-nowrap"
        >
          Buka Fitur KB
          <MdArrowForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
//=====================================================================================================================
// ARTIKEL L18: Panduan Manajemen Menyusui
function L18ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Highlight */}
      <div className="bg-[#ECF5E8] p-4 rounded-xl border border-[#58B146]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#58B146] leading-relaxed">
          Menyusui bayi secara langsung dapat mempercepat proses pemulihan rahim dan menjaga kesehatan payudara Ibu setelah melahirkan. ASI adalah investasi gizi terbaik demi daya tahan tubuh optimal si kecil.
        </p>
      </div>

      {/* Manfaat Ganda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
          <span className="font-bold text-[#58B146] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58B146]"></span>
            Manfaat untuk Ibu
          </span>
          <ul className="list-disc list-inside space-y-1 text-base-text-secondary pl-0.5">
            <li>Mempercepat rahim kembali ke ukuran semula pasca-melahirkan.</li>
            <li>Mencegah risiko perdarahan hebat setelah persalinan.</li>
            <li>Mengurangi stres, rasa cemas, serta menjaga kesehatan mental.</li>
            <li>Mencegah risiko kanker payudara &amp; menjadi metode KB alami (*Mal*).</li>
            <li>Membantu mempercepat berat badan kembali ke ukuran semula.</li>
          </ul>
        </div>

        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
          <span className="font-bold text-[#58B146] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#58B146]"></span>
            Aturan Pemberian ASI
          </span>
          <p className="text-base-text-secondary leading-relaxed">
            Berikan <span className="font-semibold text-base-text-primary">ASI Eksklusif saja selama 6 bulan pertama</span> tanpa tambahan makanan/minuman lain, kemudian teruskan hingga anak berusia 2 tahun didampingi MPASI yang tepat.
          </p>
          <div className="bg-base-white p-2 rounded-lg border border-base-border/30 text-[11px] text-base-text-secondary">
            <span className="font-bold text-base-text-primary">Tips:</span> Susui bayi sesering mungkin/semau bayi (8-12 kali sehari). Jika bayi tidur lebih dari 3 jam, bangunkan lalu susui.
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Cara Menyusui & Pelekatan Benar */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#58B146] flex items-center gap-2">
          <MdChildCare className="w-4 h-4" />
          Teknik Posisi dan Pelekatan (Latch-On) Terbaik
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Posisi Badan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 space-y-2">
            <span className="text-xs font-bold text-base-text-primary flex items-center gap-1">
              <MdCheckCircle className="text-[#58B146] w-4 h-4" /> Posisi Badan Bayi yang Benar
            </span>
            <ul className="list-disc list-inside text-xs text-base-text-secondary space-y-1 pl-0.5">
              <li>Kepala dan badan bayi membentuk <span className="font-semibold text-base-text-primary">garis lurus</span>.</li>
              <li>Wajah bayi menghadap payudara, hidung berhadapan dengan puting susu.</li>
              <li>Badan bayi didekap dekat dengan tubuh ibu secara utuh.</li>
              <li>Ibu menggendong/memeluk lengan dan seluruh badan bayi secara mantap.</li>
            </ul>
          </div>

          {/* Pelekatan Mulut */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 space-y-2">
            <span className="text-xs font-bold text-base-text-primary flex items-center gap-1">
              <MdCheckCircle className="text-[#58B146] w-4 h-4" /> Pelekatan Mulut Bayi yang Benar
            </span>
            <ul className="list-disc list-inside text-xs text-base-text-secondary space-y-1 pl-0.5">
              <li>Bayi dekat dengan payudara dengan <span className="font-semibold text-base-text-primary">mulut terbuka lebar</span>.</li>
              <li>Dagu bayi menempel erat menyentuh payudara ibu.</li>
              <li>Bagian <span className="font-semibold text-base-text-primary">areola payudara atas</span> lebih banyak terlihat dibanding areola bawah.</li>
              <li>Bibir bawah bayi memutar melengkung keluar (dower).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pencegahan Mastitis & Bayi Kembar */}
      <div className="p-4 bg-base-white border border-base-border/50 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 text-xs">
          <span className="font-bold text-status-red flex items-center gap-1">
            <MdCancel className="w-4 h-4" /> Cegah Mastitis (Radang Payudara)
          </span>
          <p className="text-base-text-secondary leading-relaxed pl-5">
            Apabila bayi sudah kenyang tetapi payudara masih terasa penuh atau kencang, **payudara wajib diperah** dan ASI disimpan dengan steril. Hal ini krusial untuk mencegah penyumbatan kelenjar susu (*mastitis*) serta menjaga kontinuitas pasokan ASI.
          </p>
        </div>

        <div className="space-y-1 text-xs border-t sm:border-t-0 sm:border-l border-base-border/30 pt-3 sm:pt-0 sm:pl-4">
          <span className="font-bold text-[#58B146] flex items-center gap-1">
            <MdAllInclusive className="w-4 h-4" /> Posisi Menyusui Bayi Kembar
          </span>
          <p className="text-base-text-secondary leading-relaxed">
            Ibu dapat menyusui bayi kembar secara bersamaan menggunakan metode **Football Hold (Double Clutch)** atau **Cradle Position**, dengan menyangga kedua tubuh bayi menggunakan bantal menyusui agar posisi kepala tetap lurus menghadap kedua puting susu secara seimbang.
          </p>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L19: Manajemen ASI Perah
function L19ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#ECF5E8] p-4 rounded-xl border border-[#58B146]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#58B146] leading-relaxed">
          Memerah dan menyimpan ASI dengan benar sangat penting untuk menjaga kandungan nutrisi alami di dalamnya serta memastikan pasokan ASI tetap steril dan aman dikonsumsi oleh bayi.
        </p>
      </div>

      {/* Grid Langkah Memerah */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#58B146] flex items-center gap-1.5">
            <MdCleanHands className="w-4 h-4" />
            1. Sterilisasi Wadah &amp; Teknik Tangan
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5">
            <li>Cuci bersih cangkir/gelas kecil penampung dengan sabun.</li>
            <li>Tuangkan air mendidih ke dalam wadah, diamkan beberapa menit untuk membunuh kuman, lalu buang airnya saat akan digunakan.</li>
            <li>Letakkan ibu jari di atas puting &amp; areola, jari telunjuk dan tengah di bawahnya (membentuk huruf C).</li>
            <li>Tekan ke belakang, lalu tekan dan lepaskan dari samping secara berirama selama 20-30 menit bergantian sisi.</li>
          </ul>
        </div>

        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-status-red flex items-center gap-1.5">
            <MdWarning className="w-4 h-4" />
            2. Aturan Penting Penyajian ASIP
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5">
            <li><span className="font-bold text-base-text-primary">Jangan rebus ASI</span> atau memanaskannya dengan microwave karena merusak gizi.</li>
            <li>Gunakan air hangat untuk mencairkan ASIP beku yang sudah diturunkan ke kulkas bawah sebelumnya.</li>
            <li>Utamakan memberikan ASI segar pasca-perah (tanpa dibekukan) dalam waktu satu jam jika memungkinkan.</li>
            <li>Selalu beri label tanggal perah pada setiap wadah penyimpanan.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Tabel Standar Penyimpanan */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#58B146] flex items-center gap-2">
          <MdKitchen className="w-4 h-4" />
          Tabel Standar Suhu &amp; Durasi Penyimpanan ASIP
        </h4>
        
        <div className="overflow-x-auto rounded-xl border border-base-border/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#ECF5E8] text-[#58B146] border-b border-base-border/60 font-bold">
                <th className="p-3">Tempat Penyimpanan</th>
                <th className="p-3">Suhu Ideal</th>
                <th className="p-3">Lama Aman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-border/40 text-base-text-secondary">
              <tr className="hover:bg-base-white/40">
                <td className="p-3 font-semibold text-base-text-primary">Cooler Bag (ASIP Baru)</td>
                <td className="p-3">15°C</td>
                <td className="p-3">24 Jam</td>
              </tr>
              <tr className="hover:bg-base-white/40">
                <td className="p-3 font-semibold text-base-text-primary">Dalam Ruangan Terbuka</td>
                <td className="p-3">27°C s/d 32°C<br />&lt; 25°C</td>
                <td className="p-3">4 Jam<br />6 - 8 Jam</td>
              </tr>
              <tr className="hover:bg-base-white/40">
                <td className="p-3 font-semibold text-base-text-primary">Kulkas Bawah (Chiller)</td>
                <td className="p-3">&lt; 4°C</td>
                <td className="p-3">48 - 72 Jam (2-3 hari)</td>
              </tr>
              <tr className="hover:bg-base-white/40">
                <td className="p-3 font-semibold text-base-text-primary">Freezer (Lemari Es 1 Pintu)</td>
                <td className="p-3">-15°C s/d 0°C</td>
                <td className="p-3">2 Minggu</td>
              </tr>
              <tr className="hover:bg-base-white/40">
                <td className="p-3 font-semibold text-base-text-primary">Freezer (Lemari Es 2 Pintu)</td>
                <td className="p-3">-20°C s/d -18°C</td>
                <td className="p-3">3 - 6 Bulan</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-base-text-secondary italic pl-1">
          * Catatan: Simpan ASI perah sebanyak 15-60ml per wadah untuk menghindari ASI terbuang habis secara sia-sia setelah dicairkan.
        </p>
      </div>
    </div>
  );
}

// ARTIKEL L20: Nutrisi Ibu Menyusui
function L20ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Highlight */}
      <div className="bg-[#ECF5E8] p-4 rounded-xl border border-[#58B146]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#58B146] leading-relaxed">
          Kebutuhan gizi ibu menyusui (0-12 bulan) lebih tinggi dibanding masa kehamilan demi mendukung kelancaran produksi ASI berkualitas. Yuk, pantau porsi makan dan minum harian Ibu di bawah ini!
        </p>
      </div>

      {/* Grid Porsi Visual */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#58B146] flex items-center gap-2">
          <MdRestaurant className="w-4 h-4" />
          Panduan Porsi Makan Harian Ibu Menyusui
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Makanan Pokok */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Makanan Pokok (Nasi/Karbohidrat)</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">6 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 100 g (¾ gelas nasi), 3 buah jagung sedang (125 g), 2 kentang sedang (210 g), atau 2 gelas mie basah (200 g).
            </p>
          </div>

          {/* Protein Hewani */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Protein Hewani (Ikan, Telur, Ayam)</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">4 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 1 potong sedang ikan segar (50 g) atau 1 butir telur ayam (55 g).
            </p>
          </div>

          {/* Protein Nabati */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Protein Nabati (Tempe, Tahu)</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">4 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 1 potong sedang tempe (50 g) atau 2 potong sedang tahu bersih (100 g).
            </p>
          </div>

          {/* Sayur-sayuran */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Sayur-sayuran</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">4 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 100 g atau 1 mangkuk sayur matang segar tanpa kuah.
            </p>
          </div>

          {/* Buah-buahan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Buah-buahan</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">4 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 1 potong sedang pisang (100 g) atau 1 potong besar pepaya segar (100-190 g).
            </p>
          </div>

          {/* Minyak/Lemak */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base-text-primary">Minyak atau Lemak</span>
              <span className="px-2 py-0.5 rounded-md bg-[#ECF5E8] text-[#58B146] font-extrabold text-[11px]">6 Porsi</span>
            </div>
            <p className="text-base-text-secondary leading-relaxed">
              1 porsi setara dengan: 5 g atau 1 sendok teh dari minyak goreng, tumisan, olahan santan, kemiri, atau mentega.
            </p>
          </div>
        </div>

        {/* Konsumsi Gula Tambahan */}
        <div className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MdLocalCafe className="w-4 h-4 text-[#58B146]" />
            <span><span className="font-bold text-base-text-primary">Batas Konsumsi Gula:</span> Maksimal <span className="font-semibold text-base-text-primary">2 Porsi/Hari</span> (10 g atau 1 sendok makan dari teh manis, kue, dsb).</span>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Aturan Hidrasi / Air Putih */}
      <div className="p-4 bg-base-white border-2 border-dashed border-[#58B146]/40 rounded-2xl space-y-3">
        <h4 className="text-sm font-bold text-[#58B146] flex items-center gap-2">
          <MdWaterDrop className="w-4 h-4 text-sky-500 animate-pulse" />
          Aturan Wajib Hidrasi (Minum Air Putih)
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#ECF5E8]/60 rounded-xl border border-[#58B146]/20">
            <span className="font-bold text-base-text-primary block mb-0.5">6 Bulan Pertama Pasca-Melahirkan</span>
            <p className="text-base-text-secondary">Wajib minum minimal <span className="text-[#58B146] font-black text-sm">14 Gelas / Hari</span>.</p>
          </div>
          <div className="p-3 bg-[#ECF5E8]/60 rounded-xl border border-[#58B146]/20">
            <span className="font-bold text-base-text-primary block mb-0.5">6 Bulan Kedua Pasca-Melahirkan</span>
            <p className="text-base-text-secondary">Wajib minum minimal <span className="text-[#58B146] font-black text-sm">12 Gelas / Hari</span>.</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-1.5 text-[10px] text-base-text-secondary italic pl-1">
        <MdInfo className="w-3.5 h-3.5 text-[#58B146] shrink-0 mt-0.5" />
        <span>* Catatan Penting: Konsultasikan porsi makan Ibu secara berkala kepada tenaga kesehatan terdekat dengan tetap memperhatikan Indeks Massa Tubuh (IMT).</span>
      </div>
    </div>
  );
}

// ARTIKEL L21: Panduan Perawatan Bayi Baru Lahir (0 - 6 Bulan)
function L21ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#EAE5F1] p-4 rounded-xl border border-[#6F4595]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#6F4595] leading-relaxed">
          Bayi baru lahir (neonatus) usia 0-28 hari membutuhkan perawatan yang sangat higienis dan penuh kasih sayang. Kenali tanda bayi sehat, hak pelayanan medis esensial, serta cara merawatnya sehari-hari di rumah.
        </p>
      </div>

      {/* Tanda Bayi Sehat */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdCheckCircle className="w-4 h-4" />
          Kriteria Tanda Bayi Baru Lahir Sehat
        </h4>
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 text-xs text-base-text-secondary leading-relaxed">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside pl-0.5">
            <li>Bayi lahir <span className="font-semibold text-base-text-primary">langsung menangis kuat</span> saat persalinan.</li>
            <li>Tubuh bayi bergerak aktif dan bernapas tanpa kesulitan.</li>
            <li>Kulit seluruh tubuh berwarna <span className="font-semibold text-base-text-primary">kemerahan bersih</span>.</li>
            <li>Bayi langsung mau dan bisa menghisap puting susu Ibu saat IMD.</li>
            <li>Berat badan lahir ideal berkisar antara <span className="font-semibold text-base-text-primary">2.500 gram sampai 4.000 gram</span>.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Pelayanan Kesehatan Neonatal */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdHealthAndSafety className="w-4 h-4" />
          6 Pelayanan Kesehatan Esensial yang Wajib Diterima Bayi
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-center">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">1. Kapsul &amp; Salep Mata</span>
            <p className="text-[11px] text-base-text-secondary">Pemberian salep atau tetes mata antibiotik segera setelah lahir untuk mencegah infeksi mata.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">2. Suntikan Vitamin K1</span>
            <p className="text-[11px] text-base-text-secondary">Suntikan Vitamin K1 di paha kiri bayi untuk mencegah risiko perdarahan internal.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">3. Imunisasi Hepatitis B0</span>
            <p className="text-[11px] text-base-text-secondary">Diberikan di paha kanan, minimal 1 jam setelah suntikan Vitamin K1 untuk mencegah kanker hati.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">4. Pemeriksaan Fisik</span>
            <p className="text-[11px] text-base-text-secondary">Pengecekan berat badan, panjang badan, lingkar kepala, dan kelainan bawaan secara menyeluruh.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">5. Skrining SHK</span>
            <p className="text-[11px] text-base-text-secondary">Skrining Hipotiroid Kongenital melalui sampel darah tumit bayi usia 48-72 jam guna mencegah stunting intelektual.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">6. Penanganan Sakit</span>
            <p className="text-[11px] text-base-text-secondary">Rujukan cepat ke fasilitas kesehatan terdekat jika ditemukan kelainan atau tanda bahaya akut.</p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Perawatan Harian */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdChildCare className="w-4 h-4" />
          Panduan Perawatan Harian Bayi di Rumah
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Perawatan Tali Pusat */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 space-y-1.5">
            <span className="font-bold text-base-text-primary block">✦ Merawat Tali Pusat</span>
            <p className="text-base-text-secondary leading-relaxed">
              Jaga tali pusat selalu <span className="font-semibold text-base-text-primary">bersih dan kering</span>. Jangan dibungkus dengan kassa basah, ramuan, daun-daunan, atau dibubuhi bedak/salep. Biarkan terbuka hingga puput sendiri secara alami.
            </p>
          </div>

          {/* Menjaga Kehangatan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 space-y-1.5">
            <span className="font-bold text-base-text-primary block">✦ Menjaga Suhu &amp; Memandikan</span>
            <p className="text-base-text-secondary leading-relaxed">
              Mandikan bayi menggunakan air hangat suam-suam kuku setelah usia lebih dari 6 jam. Cegah hipotermia dengan selalu memakaikan baju kering, topi bayi, kaos kaki, serta menyelimutinya dengan lembut.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-1.5 text-[10px] text-base-text-secondary italic pl-1">
        <MdInfo className="w-3.5 h-3.5 text-[#6F4595] shrink-0 mt-0.5" />
        <span>* Catatan: Pastikan seluruh anggota keluarga yang memegang bayi sudah mencuci tangan dengan sabun dan air mengalir guna menjaga sistem kekebalan tubuh neonatus yang masih rentan.</span>
      </div>
    </div>
  );
}

// ARTIKEL L22: Tahapan Ukuran Lambung Bayi
function L22ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#EAE5F1] p-4 rounded-xl border border-[#6F4595]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#6F4595] leading-relaxed">
          Tahukah Ibu? Ukuran lambung bayi baru lahir ternyata sangat kecil dan akan membesar seiring bertambahnya usia. Yuk, pelajari kapasitas lambung si kecil dan frekuensi menyusu idealnya agar tidak cemas berlebihan!
        </p>
      </div>

      {/* Visual Timeline Ukuran Lambung */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdTimeline className="w-4 h-4" />
          Simulasi Perkembangan Ukuran Lambung Bayi
        </h4>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Hari 1 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col items-center text-center space-y-2">
            <div className="w-6 h-6 bg-[#6F4595]/20 rounded-full flex items-center justify-center font-bold text-[#6F4595] text-[10px]">1</div>
            <span className="px-2 py-0.5 rounded bg-[#EAE5F1] text-[#6F4595] font-bold text-[10px]">Hari ke-1</span>
            <div className="space-y-0.5">
              <span className="font-bold block text-base-text-primary">Seukuran Kelereng</span>
              <p className="text-[11px] text-base-text-secondary">Menyusu 5-12 kali dalam 24 jam pertama (tergantung kontak kulit ke kulit &amp; rawat gabung).</p>
            </div>
          </div>

          {/* Hari 2-3 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col items-center text-center space-y-2">
            <div className="w-8 h-8 bg-[#6F4595]/20 rounded-full flex items-center justify-center font-bold text-[#6F4595] text-xs">2</div>
            <span className="px-2 py-0.5 rounded bg-[#EAE5F1] text-[#6F4595] font-bold text-[10px]">Hari ke-2 s/d 3</span>
            <div className="space-y-0.5">
              <span className="font-bold block text-base-text-primary">Seukuran Bola Pingpong</span>
              <p className="text-[11px] text-base-text-secondary">Frekuensi menyusu meningkat menjadi 10-12 kali sehari, namun polanya masih belum stabil.</p>
            </div>
          </div>

          {/* Minggu 1 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 bg-[#6F4595]/20 rounded-full flex items-center justify-center font-bold text-[#6F4595] text-sm">3</div>
            <span className="px-2 py-0.5 rounded bg-[#EAE5F1] text-[#6F4595] font-bold text-[10px]">Minggu ke-1</span>
            <div className="space-y-0.5">
              <span className="font-bold block text-base-text-primary">Seukuran Telur Ayam</span>
              <p className="text-[11px] text-base-text-secondary">Menyusu rata-rata 8 kali dalam 24 jam dengan interval yang mulai sedikit lebih lama.</p>
            </div>
          </div>

          {/* Bulan 1 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-[#6F4595]/20 rounded-full flex items-center justify-center font-bold text-[#6F4595] text-base">4</div>
            <span className="px-2 py-0.5 rounded bg-[#EAE5F1] text-[#6F4595] font-bold text-[10px]">Bulan ke-1</span>
            <div className="space-y-0.5">
              <span className="font-bold block text-base-text-primary">Seukuran Telur Bebek</span>
              <p className="text-[11px] text-base-text-secondary">Kapasitas semakin mantap dengan frekuensi menyusu rata-rata 8-12 kali dalam 24 jam.</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Respon Isyarat Lapar Bayi */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdFace className="w-4 h-4" />
          Kenali Tanda Isyarat Lapar Bayi (Feeding Cues)
        </h4>
        
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-3 text-xs leading-relaxed">
          <p className="text-base-text-secondary">
            Selama menyusui, Ibu disarankan untuk selalu berada di dekat bayi agar dapat merespon dengan cepat saat bayi menunjukkan tanda-tanda lapar awal sebelum mereka menangis keras.
          </p>
          <div className="bg-[#EAE5F1]/40 p-3 rounded-xl border border-[#6F4595]/10 space-y-1.5">
            <span className="font-bold text-[#6F4595] block text-[11px]">Gerakan Isyarat Lapar yang Wajib Tanggap:</span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base-text-secondary list-none pl-0.5">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6F4595]"></span>
                Bayi mulai aktif bergerak dan gelisah.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6F4595]"></span>
                Memutar kepala ke kanan dan kiri (*rooting reflex*).
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6F4595]"></span>
                Memasukkan dan mengisap jari tangan.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#6F4595]"></span>
                Mengecap-ngecap bibir atau membuka mulut.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-1.5 text-[10px] text-base-text-secondary italic pl-1">
        <MdInfo className="w-3.5 h-3.5 text-[#6F4595] shrink-0 mt-0.5" />
        <span>* Catatan: Frekuensi menyusu bayi akan meningkat secara alami sejalan dengan semakin banyaknya produksi ASI yang keluar dan bertambahnya kapasitas volume lambung mereka.</span>
      </div>
    </div>
  );
}

// ARTIKEL L23: Esensi Masa Neonatus (0-28 Hari)
function L23ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Peringatan Kritis Kematian Neonatal */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Fakta Penting Kesehatan</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Dua pertiga kematian balita di Indonesia terjadi pada usia <span className="font-semibold text-base-text-primary">1-28 hari pertama</span>. Pemeriksaan rutin sangat vital untuk mendeteksi dini infeksi atau kondisi yang membahayakan bayi.
          </p>
        </div>
      </div>

      {/* Jadwal Pemeriksaan Neonatus */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdLocalHospital className="w-4 h-4" />
          4 Tahapan Wajib Pemeriksaan Kesehatan Bayi (Neonatus)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-[#6F4595] block text-[11px]">Tahap 1</span>
            <span className="font-semibold text-base-text-primary">0 - 6 Jam</span>
            <span className="text-[10px] text-base-text-secondary block mt-0.5">Setelah lahir</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-[#6F4595] block text-[11px]">Tahap 2</span>
            <span className="font-semibold text-base-text-primary">6 - 48 Jam</span>
            <span className="text-[10px] text-base-text-secondary block mt-0.5">Setelah lahir</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-[#6F4595] block text-[11px]">Tahap 3</span>
            <span className="font-semibold text-base-text-primary">3 - 7 Hari</span>
            <span className="text-[10px] text-base-text-secondary block mt-0.5">Setelah lahir</span>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40">
            <span className="font-bold text-[#6F4595] block text-[11px]">Tahap 4</span>
            <span className="font-semibold text-base-text-primary">8 - 28 Hari</span>
            <span className="text-[10px] text-base-text-secondary block mt-0.5">Setelah lahir</span>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Skrining Medis Kritis */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdSecurity className="w-4 h-4" />
          3 Skrining &amp; Imunisasi Kritis Pertama
        </h4>
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/60 text-xs text-base-text-secondary space-y-2.5 leading-relaxed">
          <p>Pastikan buah hati Anda mendapatkan penanganan medis wajib berikut sebelum terlambat:</p>
          <ul className="list-none space-y-2 pl-0.5">
            <li className="flex items-start gap-2">
              <span className="text-[#6F4595] font-bold">✓</span>
              <span><span className="font-semibold text-base-text-primary">Imunisasi Hepatitis B (HB0):</span> Wajib disuntikkan sebelum bayi berusia 24 jam pertama.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6F4595] font-bold">✓</span>
              <span><span className="font-semibold text-base-text-primary">Skrining Hipotiroid Kongenital (SHK):</span> Dilakukan pada usia 48 - 72 jam untuk mencegah keterbelakangan mental.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6F4595] font-bold">✓</span>
              <span><span className="font-semibold text-base-text-primary">Skrining Penyakit Jantung Bawaan (PJB) Kritis:</span> Dilakukan pada usia 24 - 48 jam pasca-melahirkan.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Regulasi Pola Tidur & Interaksi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pola Tidur */}
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-2">
          <span className="font-bold text-[#6F4595] flex items-center gap-1.5">
            <MdAccessTime className="w-4 h-4" />
            Tips Pola Tidur Sehat (Hingga 16 Jam/Hari)
          </span>
          <ul className="list-disc list-inside space-y-1 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Posisikan bayi tidur secara <span className="font-semibold text-base-text-primary">terlentang</span> (mencegah SIDS).</li>
            <li>Gunakan alas tidur yang rata, bersih, dan tidak terlalu empuk.</li>
            <li>Jauhkan bantal besar, boneka, atau benda yang dapat menutupi kepala bayi.</li>
            <li>Selalu gunakan kelambu bersih untuk mencegah gigitan nyamuk.</li>
          </ul>
        </div>

        {/* Asuhan Kedekatan */}
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-2">
          <span className="font-bold text-[#6F4595] flex items-center gap-1.5">
            <MdOutlineBabyChangingStation className="w-4 h-4" />
            Membangun Ikatan (Bonding) &amp; Perawatan
          </span>
          <ul className="list-disc list-inside space-y-1 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Susui bayi dengan penuh kasih sayang, dekap secara hangat ke dada Ibu.</li>
            <li>Jalin hubungan emosional yang erat dengan menatap matanya dan mengajaknya bicara.</li>
            <li>Jaga tubuh bayi tetap hangat dan selalu pastikan kebersihan popok serta lingkungan sekitar.</li>
            <li>Tetap berikan <span className="font-semibold text-base-text-primary">ASI Eksklusif saja selama 6 bulan</span>, dilanjutkan hingga usia 2 tahun.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L24: Deteksi Dini Neonatus
function L24ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Kritis Emergency Banner */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Tindakan Darurat</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Jika bayi Anda mengalami salah satu atau lebih tanda bahaya di bawah ini, jangan menunda waktu. **Segera bawa bayi periksa ke bidan, dokter, atau perawat di fasilitas kesehatan terdekat!**
          </p>
        </div>
      </div>

      {/* Grid Pengelompokan Tanda Bahaya */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdLocalHospital className="w-4 h-4" />
          Kenali 11 Tanda Bahaya pada Bayi Baru Lahir
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Klaster Gejala Sistemik & Saraf */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#6F4595] block border-b border-base-border/30 pb-1">1. Gejala Sistemik &amp; Saraf</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Demam atau panas tinggi.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Suhu tubuh terlalu dingin (hipotermia).</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Bayi mengalami kejang.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Bayi tampak lemah atau kesadaran menurun.</li>
            </ul>
          </div>

          {/* Klaster Pernapasan & Fisik */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#6F4595] block border-b border-base-border/30 pb-1">2. Pernapasan &amp; Kondisi Fisik</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Sesak napas atau napas cepat terengah-engah.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Menangis atau merintih terus-menerus tanpa henti.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Kulit dan area mata bayi tampak kuning (*ikterus*).</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Tali pusat kemerahan meluas sampai dinding perut, berbau busuk, atau bernanah.</li>
            </ul>
          </div>

          {/* Klaster Nutrisi & Pencernaan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#6F4595] block border-b border-base-border/30 pb-1">3. Nutrisi &amp; Pencernaan</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Bayi malas atau tidak mau menyusu sama sekali.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Muntah-muntah hebat (mengeluarkan semua yang diminum).</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Mengalami diare berat.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red">✕</span> Tinja/feses bayi saat buang air besar berwarna putih pucat.</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Edukasi Penting Sunat Perempuan */}
      <div className="p-4 bg-base-white border border-[#6F4595]/30 rounded-2xl space-y-2 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F4595] flex items-center gap-1.5">
          <MdHealthAndSafety className="w-4 h-4" />
          Edukasi Medis: Regulasi Sunat Bayi Perempuan
        </h4>
        <div className="p-3 bg-[#EAE5F1]/40 rounded-xl border border-[#6F4595]/10 text-xs text-base-text-secondary leading-relaxed flex gap-2">
          <MdInfo className="w-4 h-4 text-[#6F4595] shrink-0 mt-0.5" />
          <p>
            Berdasarkan standar kesehatan klinis resmi, **sunat pada bayi perempuan tidak mempunyai manfaat terhadap kesehatan** dan justru **berisiko tinggi** bagi kesehatan reproduksi serta mental bayi, baik saat ini maupun di masa yang akan datang. Orang tua diimbau untuk tidak melakukan praktik ini.
          </p>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L25: Panduan Higiene Bayi Baru Lahir
function L25ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#EAE5F1] p-4 rounded-xl border border-[#6F4595]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#6F4595] leading-relaxed">
          Menjaga kehangatan dan kebersihan tubuh bayi baru lahir adalah kunci mencegah infeksi serta hipotermia. Pelajari teknik memandikan yang aman, perawatan tali pusat steril, hingga panduan Metode Kanguru untuk bayi kecil.
        </p>
      </div>

      {/* Grid Higiene & Kehangatan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Regulasi Memandikan & Kehangatan */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#6F4595] flex items-center gap-1.5">
            <MdThermostat className="w-4 h-4" />
            1. Regulasi Suhu &amp; Cara Memandikan
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Mandikan bayi dengan air hangat setelah <span className="font-semibold text-base-text-primary">6 jam lahir</span> dengan syarat kondisi stabil.</li>
            <li><span className="font-semibold text-base-text-primary">Sebelum tali pusat lepas:</span> Mandikan bayi cukup dengan dilap bersih memakai kain lembut basah.</li>
            <li><span className="font-semibold text-base-text-primary">Setelah tali pusat lepas:</span> Bayi boleh dimasukkan ke dalam bak air hangat secara perlahan (hati-hati agar kepala tidak terendam).</li>
            <li>Usahakan suhu AC ruangan sekitar <span className="font-semibold text-base-text-primary">25 - 26°C</span>. Jika menggunakan kipas angin, pastikan arah angin tidak langsung mengenai tubuh bayi.</li>
            <li>Beri pakaian kering, bedong longgar, serta pakaikan topi/kaos kaki saat cuci dingin.</li>
          </ul>
        </div>

        {/* Sterilisasi Tali Pusat */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#6F4595] flex items-center gap-1.5">
            <MdCleanHands className="w-4 h-4" />
            2. Protokol Steril Rawat Tali Pusat
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Wajib <span className="font-bold text-base-text-primary">cuci tangan dengan sabun</span> dan air mengalir sebelum serta sesudah memegang tali pusat bayi.</li>
            <li>Biarkan tali pusat dalam kondisi <span className="font-semibold text-[#6F4595]">terbuka dan kering</span> tanpa bungkus apapun.</li>
            <li><span className="font-bold text-status-red">Jangan memberikan apapun</span> (bedak, minyak, salep, atau ramuan daun) pada tali pusat karena memicu infeksi bakteri fatal.</li>
            <li>Jika tali pusat kotor atau basah terkena air kencing/tinja, segera cuci dengan air bersih dan sedikit sabun, lalu keringkan sampai benar-benar tuntas.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Metode Kanguru untuk Bayi Kecil */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdAccessibility className="w-4 h-4" />
          Perawatan Metode Kanguru (PMK) untuk Bayi Prematur / BBLR
        </h4>
        
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-3 text-xs leading-relaxed">
          <p className="text-base-text-secondary">
            Bayi kecil atau prematur dengan usia kehamilan <span className="font-semibold text-base-text-primary">≤ 37 minggu</span> atau Berat Badan Lahir Rendah (<span className="font-semibold text-status-red font-bold">&lt; 2.500 gram</span>) membutuhkan Perawatan Metode Kanguru (PMK) secara konsisten untuk menjaga kehangatan tubuh stabil dan meningkatkan keberhasilan asupan ASI.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-[#EAE5F1]/50 rounded-xl border border-[#6F4595]/10">
              <span className="font-bold text-base-text-primary block mb-0.5">Kontak Kulit ke Kulit</span>
              <p className="text-[11px] text-base-text-secondary">Bayi diletakkan tegak lurus di dada ibu/ayah tanpa pakaian (hanya popok dan topi) sehingga kulit bayi menempel langsung dengan kulit orang tua.</p>
            </div>
            <div className="p-3 bg-[#EAE5F1]/50 rounded-xl border border-[#6F4595]/10">
              <span className="font-bold text-base-text-primary block mb-0.5">Dukungan Fleksibel</span>
              <p className="text-[11px] text-base-text-secondary">Gunakan kain bedong khusus atau selendang elastis untuk mengikat tubuh bayi dengan aman di dada agar posisi tidak bergeser saat orang tua beraktivitas.</p>
            </div>
            <div className="p-3 bg-[#EAE5F1]/50 rounded-xl border border-[#6F4595]/10">
              <span className="font-bold text-base-text-primary block mb-0.5">Peran Bergantian</span>
              <p className="text-[11px] text-base-text-secondary">Ayah dan anggota keluarga lain dapat menggantikan ibu melakukan PMK secara bergantian agar bayi tetap mendapatkan kehangatan kulit konstan saat ibu beristirahat.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kritis Note Buku KIA Khusus */}
      <div className="bg-[#EAE5F1]/40 p-3.5 rounded-xl border border-[#6F4595]/20 text-[11px] text-base-text-secondary flex items-start gap-2 italic">
        <MdInfo className="w-4 h-4 text-[#6F4595] shrink-0 mt-0.5" />
        <span>Catatan Khusus: Apabila berat lahir bayi &lt; 2500 gram atau usia kehamilan ≤ 37 minggu, perawatan medis dan pemantauan grafik tumbuh kembang bayi wajib beralih menggunakan **Buku KIA Khusus Bayi Kecil** yang disediakan oleh fasilitas kesehatan.</span>
      </div>
    </div>
  );
}

// ARTIKEL L26: Skrining Warna Tinja Bayi
function L26ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Medis Alert Banner */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Kewaspadaan Atresia Bilier</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Periksa warna tinja bayi Anda setiap hari hingga berumur 4 bulan. Jika warna tinja pucat mendebati warna putih atau keabu-abuan (Nomor 1-3), **segera bawa bayi ke dokter** karena ada risiko tinggi sumbatan kandung empedu (*Atresia Bilier*).
          </p>
        </div>
      </div>

      {/* Simulator / Panduan Skrining Warna */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdPalette className="w-4 h-4" />
          Grafik Acuan Warna Tinja Bayi
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Warna Waspada (1-3) */}
          <div className="p-4 bg-base-bg rounded-xl border border-status-red/30 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-red-soft/40 text-status-red uppercase">⚠️ Skor 1 - 3: WASPADA / ABNORMAL</span>
            <p className="text-[11px] text-base-text-secondary">Warna tinja tampak pucat, putih, keabu-abuan, atau kuning sangat muda kusam.</p>
            <div className="flex gap-2 pt-1">
              <div className="w-10 h-8 rounded-lg bg-[#F4F2E1] border border-base-border/50 flex items-center justify-center text-[10px] font-bold text-base-text-primary">1</div>
              <div className="w-10 h-8 rounded-lg bg-[#EAE5C1] border border-base-border/50 flex items-center justify-center text-[10px] font-bold text-base-text-primary">2</div>
              <div className="w-10 h-8 rounded-lg bg-[#DDD6A4] border border-base-border/50 flex items-center justify-center text-[10px] font-bold text-base-text-primary">3</div>
            </div>
          </div>

          {/* Warna Normal (4-7) */}
          <div className="p-4 bg-base-bg rounded-xl border border-[#58B146]/30 space-y-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECF5E8] text-[#58B146] uppercase">✓ Skor 4 - 7: NORMAL / SEHAT</span>
            <p className="text-[11px] text-base-text-secondary">Warna tinja normal kuning cerah, kuning kunyit, kecokelatan, atau kehijauan (efek ASI).</p>
            <div className="flex gap-2 pt-1">
              <div className="w-10 h-8 rounded-lg bg-[#EAD31A] border border-base-border/40 flex items-center justify-center text-[10px] font-bold text-base-white">4</div>
              <div className="w-10 h-8 rounded-lg bg-[#D3B41C] border border-base-border/40 flex items-center justify-center text-[10px] font-bold text-base-white">5</div>
              <div className="w-10 h-8 rounded-lg bg-[#B28924] border border-base-border/40 flex items-center justify-center text-[10px] font-bold text-base-white">6</div>
              <div className="w-10 h-8 rounded-lg bg-[#868A34] border border-base-border/40 flex items-center justify-center text-[10px] font-bold text-base-white">7</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Jadwal Catatan Rutin */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#6F4595] flex items-center gap-2">
          <MdEvent className="w-4 h-4" />
          3 Milestones Pengisian Log Warna Tinja Wajib
        </h4>
        <p className="text-xs text-base-text-secondary leading-relaxed pl-0.5">
          Ibu diwajibkan melakukan pencatatan dan validasi kondisi warna tinja secara berkala pada lembar rekam medis pada tiga fase pertumbuhan utama ini:
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">Fase 1: Usia 2 Minggu</span>
            <p className="text-[11px] text-base-text-secondary">Skrining awal pasca-kelahiran untuk mendeteksi tanda awal kelainan empedu bawaan.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">Fase 2: Usia 1 Bulan</span>
            <p className="text-[11px] text-base-text-secondary">Pengecekan konsistensi warna transisi seiring bertambahnya volume konsumsi ASI Eksklusif.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-base-text-primary block">Fase 3: Usia 1 - 4 Bulan</span>
            <p className="text-[11px] text-base-text-secondary">Pemantauan akhir masa kritis pembentukan saluran pencernaan neonatus.</p>
          </div>
        </div>
      </div>

      {/* Gejala Sekunder Bahaya Mata Kuning */}
      <div className="p-4 bg-base-white border border-[#6F4595]/30 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F4595] flex items-center gap-1.5">
          <MdLocalHospital className="w-4 h-4" />
          Deteksi Tambahan: Sindrom Bayi Kuning
        </h4>
        <p className="text-xs text-base-text-secondary leading-relaxed pl-0.5">
          Perhatikan juga kondisi fisik luar bayi Anda. **Jika mata bayi masih tampak kuning** atau **air kencing (urin) berwarna kuning kerah/pekat setelah usia bayi lebih dari 2 minggu**, segera bawa bayi konsultasi ke dokter spesialis anak terdekat untuk pemeriksaan laboratorium lebih lanjut.
        </p>
      </div>
    </div>
  );
}

// ARTIKEL L27: 
function L27ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#FDF4FA] p-4 rounded-xl border border-[#A13481]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#A13481] leading-relaxed">
          Pola asuh yang konsisten dan penuh kasih sayang di 18 bulan pertama kehidupan adalah fondasi utama membentuk rasa aman, bahagia, dan rasa percaya diri pada anak hingga ia dewasa.
        </p>
      </div>

      {/* Grid Fondasi Pengasuhan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pilar Kasih Sayang & Responsif */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#A13481] flex items-center gap-1.5">
            <MdChildCare className="w-4 h-4" />
            1. Stimulasi &amp; Ikatan Emosional (Bonding)
          </span>
          <ul className="list-disc list-inside space-y-2 text-base-text-secondary pl-0.5 leading-relaxed">
            <li><span className="font-semibold text-base-text-primary">Dekapan Hangat:</span> Susui dan dekap anak dengan kehangatan penuh, tatap matanya, serta ajak bicara sedini mungkin untuk merangsang otaknya.</li>
            <li><span className="font-semibold text-base-text-primary">Stimulasi Fisik &amp; Kognitif:</span> Ajak anak bermain menggunakan permainan interaktif yang melatih kemampuan fisik, motorik kasar/halus, serta daya pikirnya.</li>
            <li><span className="font-semibold text-base-text-primary">Kebutuhan Istirahat:</span> Pastikan bayi usia 4-12 bulan mendapatkan tidur yang cukup selama <span className="font-semibold text-base-text-primary">12-16 jam sehari</span> (termasuk tidur siang rutin).</li>
          </ul>
        </div>

        {/* Manajemen Tangisan */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#A13481] flex items-center gap-1.5">
            <MdSentimentVeryDissatisfied className="w-4 h-4" />
            2. Manajemen Tangisan &amp; Ketenangan Ibu
          </span>
          <div className="space-y-2 text-base-text-secondary leading-relaxed">
            <p>
              <span className="font-semibold text-base-text-primary">Tangisan adalah Komunikasi:</span> Bagi bayi, tangisan menunjukkan bahwa ia sedang membutuhkan bantuan (lapar, popok basah, sakit, atau tidak nyaman). 
            </p>
            <p className="bg-status-red-soft/20 p-2.5 rounded-lg border border-status-red/20 text-[11px] text-base-text-primary">
              ⚠️ <span className="font-bold">Peringatan:</span> Jangan biarkan bayi menangis terlalu lama tanpa direspons karena dapat memicu stres emosional berat pada bayi.
            </p>
            <p className="text-[11px] italic">
              * Ingat Ibu: Perasaan cemas atau tidak menyenangkan pada Ibu akan dirasakan secara instingtif oleh bayi dan dapat berdampak pada rasa tidak nyaman saat ia menyusu.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Regulasi Gadget / Screen Time */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#A13481] flex items-center gap-2">
          <MdPhonelinkOff className="w-4 h-4 text-status-red" />
          Aturan Kritis Penggunaan Gawai (Screen Time) &lt; 18 Bulan
        </h4>
        
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2 bg-[#FDF4FA] p-3 rounded-xl border border-[#A13481]/10 text-base-text-primary">
            <span className="font-bold text-[#A13481]">✦ Standar Medis:</span>
            <span>Anak berusia <span className="font-bold text-status-red">&lt; 18 bulan sama sekali tidak boleh menggunakan gawai (gadget)</span>, kecuali dalam bentuk interaksi video-call singkat dengan keluarga yang wajib didampingi penuh oleh orang tua.</span>
          </div>

          <div className="space-y-1.5 pl-1">
            <span className="font-bold text-base-text-primary block text-[11px]">Dampak Buruk Paparan Gawai Berlebih pada Bayi:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-base-text-secondary font-medium">
              <div className="flex items-center gap-1.5"><span className="text-status-red">✕</span> Keterlambatan bicara dan bahasa (*speech delay*).</div>
              <div className="flex items-center gap-1.5"><span className="text-status-red">✕</span> Gangguan kognitif (kurangnya tingkat kecerdasan).</div>
              <div className="flex items-center gap-1.5"><span className="text-status-red">✕</span> Kurangnya interaksi sosial dan fokus mata.</div>
              <div className="flex items-center gap-1.5"><span className="text-status-red">✕</span> Gampang marah dan ledakan emosi (*tantrum*).</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wajib Ke Posyandu Banner */}
      <div className="p-4 bg-base-white border-2 border-dashed border-[#A13481]/40 rounded-2xl flex items-start gap-3 shadow-sm">
        <MdCheckCircle className="w-5 h-5 text-[#A13481] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <h5 className="font-bold text-base-text-primary">Komitmen Rutin Bulanan</h5>
          <p className="text-base-text-secondary leading-relaxed">
            Selalu bawa anak ke **Posyandu atau Fasilitas Kesehatan setiap bulan** untuk memantau kurva pertumbuhan, evaluasi perkembangan sesuai jadwal, mendapatkan pelayanan imunisasi dasar lengkap, vitamin A, serta obat cacing berkala.
          </p>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L28: 
function L28ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#059669]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#059669] leading-relaxed">
          Pengukuran Lingkar Lengan Atas (LiLA) wajib dilakukan setiap bulan untuk anak usia 6-59 bulan di Posyandu. Ini adalah metode skrining tercepat untuk mendeteksi dini masalah gizi buruk dan stunting pada balita.
        </p>
      </div>

      {/* Tiga Zona Warna Pita LiLA */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdColorLens className="w-4 h-4" />
          Interpretasi Ambang Batas Pita LiLA Balita
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Zona Hijau */}
          <div className="p-3 bg-base-bg rounded-xl border border-emerald-500/20 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 block w-max">ZONA HIJAU (&gt; 12,4 cm)</span>
            <span className="font-bold text-base-text-primary block">Status: Gizi Baik</span>
            <p className="text-[11px] text-base-text-secondary">Pertumbuhan balita dalam kondisi normal dan optimal. Pertahankan pola asuh dan nutrisi.</p>
          </div>

          {/* Zona Kuning */}
          <div className="p-3 bg-base-bg rounded-xl border border-amber-500/20 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 block w-max">ZONA KUNING (11,5 - 12,4 cm)</span>
            <span className="font-bold text-base-text-primary block">Status: Gizi Kurang</span>
            <p className="text-[11px] text-base-text-secondary">Balita terindikasi mengalami masalah nutrisi. Memerlukan evaluasi makanan tambahan.</p>
          </div>

          {/* Zona Merah */}
          <div className="p-3 bg-base-bg rounded-xl border border-rose-500/20 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 block w-max">ZONA MERAH (&lt; 11,5 cm)</span>
            <span className="font-bold text-rose-600 block">Status: Gizi Buruk</span>
            <p className="text-[11px] text-base-text-secondary">Kondisi kritis! Balita harus segera dirujuk ke fasyankes untuk penanganan medis intensif.</p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Protokol Pengukuran Teknis */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdStraighten className="w-4 h-4" />
          5 Tahap Utama Mengukur LiLA dengan Benar
        </h4>
        
        <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-base-text-secondary leading-relaxed">
              <p>
                <span className="font-bold text-base-text-primary">1. Persiapan Lengan:</span> Pengukuran dilakukan pada lengan yang tidak terlalu aktif (biasanya lengan kiri). Buka baju lengan balita terlebih dahulu agar pita menempel langsung ke kulit.
              </p>
              <p>
                <span className="font-bold text-base-text-primary">2. Tentukan Titik Tengah:</span> Tekuk lengan balita, cari posisi antara tulang pundak atas dan siku. Tetapkan titik tengah lengan di area tersebut.
              </p>
              <p>
                <span className="font-bold text-base-text-primary">3. Posisi Lengan saat Ukur:</span> Saat pita dilingkarkan, pastikan posisi tangan balita kembali diturunkan secara lurus, santai, dan rileks.
              </p>
            </div>
            
            <div className="space-y-2 text-base-text-secondary leading-relaxed">
              <p>
                <span className="font-bold text-base-text-primary">4. Aturan Keketatan Pita:</span> Masukkan ujung pita A ke lubang ujung B. Tarik dengan pas hingga menyentuh kulit. <span className="text-status-red font-semibold">Jangan ditarik terlalu ketat</span> hingga menjepit daging lengan, dan <span className="text-status-red font-semibold">jangan terlalu kendor</span>.
              </p>
              <p>
                <span className="font-bold text-base-text-primary">5. Baca Hasil Skor:</span> Lihat warna pita yang ditunjuk oleh tanda panah pembaca lubang jendela pita, lalu catat skor meterannya pada log entry dashboard.
              </p>
            </div>
          </div>

          <div className="bg-status-red-soft/20 p-3 rounded-xl border border-status-red/20 text-[11px] text-base-text-secondary flex gap-2 items-start">
            <MdWarning className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-base-text-primary">Prosedur Lanjutan:</span> Jika hasil pengukuran masuk ke Zona Kuning atau Merah, tenaga kesehatan di fasyankes akan melakukan konfirmasi lanjutan berupa pengukuran Berat Badan, Tinggi/Panjang Badan, serta Indeks Massa Tubuh (IMT) guna menentukan diagnosis klinis yang tepat.
            </p>
          </div>
        </div>
      </div>

      {/* Higiene Pasca Pengukuran */}
      <div className="p-4 bg-base-white border border-[#059669]/30 rounded-2xl flex items-start gap-3 shadow-sm text-xs text-base-text-secondary leading-relaxed">
        <MdCheckCircle className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-base-text-primary block">Protokol Kebersihan</span>
          Selalu cuci tangan menggunakan air mengalir dan sabun antiseptik sebelum serta sesudah melakukan pengukuran balita di Posyandu. Setelah selesai, pastikan Buku KIA disimpan kembali di tempat yang aman dan jauh dari jangkauan anak kecil.
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L29:
interface L29ArticleContentProps {
  onNavigateToAbsensi?: () => void; // Prop opsional untuk handle routing Next.js kamu
}

function L29ArticleContent({ onNavigateToAbsensi }: L29ArticleContentProps) {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#059669]/20 space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
          <MdGroups className="w-4 h-4" />
          Edukasi Komunitas Posyandu
        </h4>
        <p className="text-xs sm:text-sm text-base-text-secondary leading-relaxed">
          Kelas Ibu Balita bukan hanya diperuntukkan bagi Ibu saja. **Ibu, ayah, dan seluruh anggota keluarga** sangat dianjurkan untuk ikut serta dalam Kelas Ibu Balita demi menyelaraskan pemahaman dalam memantau tumbuh kembang si kecil.
        </p>
      </div>

      {/* Grid Manfaat Utama */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdMenuBook className="w-4 h-4" />
          3 Manfaat Utama Kelas Ibu Balita bagi Keluarga
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Manfaat 1 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-1.5">
            <div className="w-7 h-7 bg-[#ECFDF5] text-[#059669] rounded-lg flex items-center justify-center shrink-0">
              <MdChildCare className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">1. Panduan Pola Asuh Tepat</span>
            <p className="text-[11px] text-base-text-secondary leading-relaxed">
              Membantu orang tua memperoleh informasi penting dan terpercaya terkait bagaimana melakukan pola asuh yang benar dan responsif sesuai dengan tahapan usia tumbuh kembang anak.
            </p>
          </div>

          {/* Manfaat 2 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-1.5">
            <div className="w-7 h-7 bg-[#ECFDF5] text-[#059669] rounded-lg flex items-center justify-center shrink-0">
              <MdMenuBook className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">2. Pemahaman Medis Komprehensif</span>
            <p className="text-[11px] text-base-text-secondary leading-relaxed">
              Mendapatkan wawasan mendalam mengenai deteksi tumbuh kembang, jadwal imunisasi wajib, pemenuhan gizi seimbang, cara perawatan bayi dan anak balita, serta mengenali gejala penyakit yang sering ditemukan.
            </p>
          </div>

          {/* Manfaat 3 */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-1.5">
            <div className="w-7 h-7 bg-[#ECFDF5] text-[#059669] rounded-lg flex items-center justify-center shrink-0">
              <MdForum className="w-4 h-4" />
            </div>
            <span className="font-bold text-base-text-primary block">3. Ruang Diskusi &amp; Tukar Pikiran</span>
            <p className="text-[11px] text-base-text-secondary leading-relaxed">
              Menjadi wadah yang suportif untuk mendapatkan teman berdiskusi, saling bertukar pendapat, serta berbagi pengalaman nyata antar-orang tua mengenai pelayanan kesehatan, gizi, dan stimulasi tumbuh kembang anak.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* NEW FEATURE: INTERACTIVE SHORTCUT TO LOG/ABSENSI */}
      <div className="p-4 bg-base-white border border-[#059669]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-bold text-base-text-primary block text-sm sm:text-base">📅 Log &amp; Jadwal Kelas Ibu Balita</span>
          <p className="text-[11px] text-base-text-secondary leading-relaxed">
            Pantau jadwal pelaksanaan kelas terdekat, isi absensi kehadiran, dan lihat rekam jejak partisipasi kelas parenting Anda.
          </p>
        </div>
        
        <button
          onClick={onNavigateToAbsensi}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-base-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
        >
          <span>Buka Absensi Kelas</span>
          <MdArrowForward className="w-4 h-4" />
        </button>
      </div>

      {/* Info Tips */}
      <div className="p-3 bg-base-bg border border-base-border/40 rounded-xl text-[11px] text-base-text-secondary text-center">
        💡 <span className="font-semibold text-base-text-primary">Tips Mandiri:</span> Jangan ragu untuk menanyakan jadwal pelaksanaan Kelas Ibu Balita terdekat kepada Kader Posyandu atau Bidan desa saat Anda melakukan penimbangan bulanan.
      </div>
    </div>
  );
}

// ARTIKEL L30:
function L30ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Emergency Action Banner */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Respon Cepat Kedaruratan</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Jika balita Anda mengalami salah satu dari tanda bahaya di bawah ini, waktu sangat berharga. **Segera bawa anak periksa ke bidan, dokter, atau perawat di fasilitas pelayanan kesehatan/puskesmas/rumah sakit terdekat!**
          </p>
        </div>
      </div>

      {/* Grid Pengelompokan 9 Tanda Bahaya */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdLocalHospital className="w-4 h-4" />
          Kenali 9 Tanda Bahaya pada Balita (29 Hari - 5 Tahun)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Klaster Gejala Sistemik & Saraf */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#059669] block border-b border-base-border/30 pb-1">1. Sistemik &amp; Aktivitas Saraf</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Demam atau panas tinggi.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Anak mengalami kejang.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Pembengkakan yang disertai nyeri di belakang telinga (*mastoiditis*).</li>
            </ul>
          </div>

          {/* Klaster Fungsi Pernapasan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#059669] block border-b border-base-border/30 pb-1">2. Fungsi Saluran Pernapasan</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Sesak napas atau tarikan dinding dada ke dalam.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Tubuh tampak biru atau keunguan (*sianosis* akibat kekurangan oksigen).</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Mengalami pendarahan abnormal di hidung (mimisan), kulit, atau saat BAB.</li>
            </ul>
          </div>

          {/* Klaster Saluran Pencernaan & Nutrisi */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-2.5">
            <span className="font-bold text-[#059669] block border-b border-base-border/30 pb-1">3. Pencernaan &amp; Asupan Nutrisi</span>
            <ul className="space-y-2 text-base-text-secondary list-none pl-0 font-medium">
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Mengalami diare berat secara terus-menerus.</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Muntah-muntah hebat (tidak ada makanan/cairan yang bisa masuk).</li>
              <li className="flex items-start gap-1.5"><span className="text-status-red font-bold">✕</span> Anak lemas total dan sama sekali tidak bisa atau tidak mau minum.</li>
            </ul>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Rujukan Integrasi Dashboard */}
      <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 bg-[#ECFDF5] text-[#059669] rounded-xl flex items-center justify-center shrink-0">
            <MdEmergencyShare className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-base-text-primary block">Integrasi Fitur PWA Posyandu</span>
            <p className="text-[11px] text-base-text-secondary">Gunakan tombol panggilan darurat bidan desa atau fitur pencarian fasyankes terdekat pada menu navigasi utama jika membutuhkan rujukan kilat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L31:
function L31ArticleContent() {
  const milestones = [
    { title: "Kontrol Kepala", desc: "Bayi mampu mengangkat kepala mandiri secara stabil hingga setinggi 45 derajat saat posisi tengkurap." },
    { title: "Fokus Gerakan", desc: "Mampu menggerakkan kepala secara halus dari posisi kiri atau kanan menuju ke area tengah." },
    { title: "Kontak Mata", desc: "Mulai mampu melihat, fokus menatap, dan mengikuti pergerakan wajah Anda dalam jarak dekat." },
    { title: "Komunikasi Awal", desc: "Mulai mengoceh spontan (cooing) atau memberikan reaksi suara saat diajak berinteraksi." },
    { title: "Ekspresi Emosi", desc: "Bayi sudah mulai bisa tertawa keras secara spontan ketika merasa senang atau nyaman." },
    { title: "Respons Auditorik", desc: "Menunjukkan reaksi terkejut, berkedip, atau menoleh secara aktif terhadap suara yang keras." },
    { title: "Senyum Sosial", desc: "Membalas tersenyum dengan ceria ketika ada orang lain yang mengajak bicara atau memberikan senyuman." },
    { title: "Pengenalan Ibu", desc: "Mampu mengenali Ibu dengan baik melalui penglihatan, penciuman, pendengaran, maupun kontak fisik." }
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#059669]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#059669] leading-relaxed">
          Usia 29 hari hingga 3 bulan adalah masa transisi emas di mana motorik kasar dan kecerdasan sosial bayi berkembang pesat. Pastikan si kecil mendapatkan stimulasi terarah serta perlindungan imunisasi dasar lengkap!
        </p>
      </div>

      {/* Grid Imunisasi & Pelayanan Kesehatan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Kamus Imunisasi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#059669] flex items-center gap-1.5">
            <MdVaccines className="w-4 h-4" />
            Manfaat Perlindungan Imunisasi Masa Ini
          </span>
          <div className="space-y-2 text-base-text-secondary leading-relaxed">
            <div className="border-b border-base-border/30 pb-1.5"><span className="font-bold text-base-text-primary block">BCG &amp; Polio 1:</span> Memberikan perlindungan dari penyakit TBC paru/selaput otak, serta mencegah kelumpuhan layu pada kaki dan lengan.</div>
            <div className="border-b border-base-border/30 pb-1.5"><span className="font-bold text-base-text-primary block">DPT-HB-Hib 1:</span> Proteksi mutlak dari penyakit difteri (penyumbatan jalan napas), batuk rejan, tetanus, hepatitis B, dan radang selaput otak bakteri.</div>
            <div className="border-b border-base-border/30 pb-1.5"><span className="font-bold text-base-text-primary block">PCV 1 &amp; Rotavirus (RV) 1:</span> Mencegah infeksi paru-paru berat (pneumonia) akibat bakteri pneumokokus serta diare akut berbahaya pemicu dehidrasi.</div>
          </div>
        </div>

        {/* Tips Stimulasi Harian */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#059669] flex items-center gap-1.5">
            <MdAccessibility className="w-4 h-4" />
            Panduan Stimulasi Tumbuh Kembang Mandiri
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Sering memeluk, mencium, dan mengayun bayi dengan kelembutan penuh kasih sayang.</li>
            <li>Berikan senyuman tulus, tatap mata bayi secara lekat, dan ajak ia berbicara sedini mungkin.</li>
            <li>Tirukan ocehan (*cooing*) serta ekspresi mimik wajah bayi untuk memicu interaksi dua arah.</li>
            <li>Gantungkan benda/mainan berwarna cerah yang aman dan dapat mengeluarkan bunyi di atas bayi.</li>
            <li>Latih gerakan fisik: meraba, meraih mainan, angkat kepala saat tengkurap (*tummy time*), serta miring kanan-kiri.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* MILITARY MILESTONES - INFO GRID LAYOUT */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdMenuBook className="w-4 h-4" />
          8 Milestone Penanda Perkembangan Utama Bayi (29 Hari - 3 Bulan)
        </h4>
        <p className="text-xs text-base-text-secondary pl-0.5">
          Berikut adalah indikator standar capaian perkembangan fisik, kognitif, dan sosial anak yang wajib dipantau oleh orang tua pada fase usia ini:
        </p>

        {/* Info Grid Card Layout (No Checkbox) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-start gap-3 text-xs shadow-sm hover:border-[#059669]/30 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#059669] font-bold flex items-center justify-center shrink-0 text-[11px]">
                {index + 1}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">{item.title}</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rujukan Tindakan Medis */}
        <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-base-text-secondary flex gap-2 items-start mt-2">
          <MdWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-amber-800">Catatan Penting:</span> Apabila pada usia 3 bulan si kecil belum mampu menunjukkan salah satu atau beberapa kemampuan di atas, orang tua disarankan untuk berkonsultasi secara langsung kepada bidan atau dokter di Puskesmas demi mendeteksi adanya keterlambatan perkembangan (*developmental delay*).
          </p>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="p-4 bg-base-white border border-[#059669]/30 rounded-2xl flex items-start gap-3 shadow-sm text-xs text-base-text-secondary leading-relaxed">
        <MdCheckCircle className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-base-text-primary block">Komitmen Pemantauan Bulanan</span>
          Selalu bawa bayi Anda secara rutin setiap bulan ke Posyandu atau Fasilitas Kesehatan terdekat untuk mendapatkan pengukuran fisik terstandar, imunisasi terjadwal, serta vitamin berkala.
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L32:
function L32ArticleContent() {
  const milestones = [
    { title: "Kemampuan Guling", desc: "Bayi sudah bisa berbalik secara mandiri dari posisi telungkup ke telentang atau sebaliknya." },
    { title: "Kontrol Kepala 90°", desc: "Mampu mengangkat kepala secara mandiri hingga tegak 90 derajat secara mantap saat ditengkurapkan." },
    { title: "Stabilitas Leher", desc: "Dapat mempertahankan posisi kepala tetap tegak dan stabil tanpa disangga saat digendong tegak." },
    { title: "Genggaman Motorik", desc: "Bisa menggenggam dengan kuat mainan berukuran kecil, mainan bertangkai, atau kerincingan." },
    { title: "Jangkauan Tangan", desc: "Secara aktif berusaha meraih benda-benda menarik yang berada di dalam jangkauan pandangannya." },
    { title: "Eksplorasi Tubuh", desc: "Mulai menunjukkan rasa ingin tahu terhadap tubuhnya sendiri, seperti mengamati gerakan tangannya." },
    { title: "Perluasan Pandangan", desc: "Bayi berusaha memperluas sudut pandangan secara aktif dengan menoleh ke kanan dan kiri." },
    { title: "Fokus Visual", desc: "Mampu mengarahkan pandangan matanya dengan fokus pada benda-benda berukuran kecil di dekatnya." },
    { title: "Ekspresi Vokal", desc: "Mulai mengeluarkan suara gembira bernada tinggi, mengoceh panjang, atau memekik senang." },
    { title: "Bermain Mandiri", desc: "Tersenyum dengan ceria ketika melihat mainan atau gambar menarik saat sedang bermain sendiri." }
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#059669]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#059669] leading-relaxed">
          Memasuki usia 3 hingga 6 bulan, si kecil akan mengalami lompatan perkembangan motorik dan sensorik yang luar biasa. Dukung eksplorasinya dengan stimulasi aman dan mulailah menjaga kesehatan rongga mulutnya sedini mungkin!
        </p>
      </div>

      {/* Grid Stimulasi Harian & Perawatan Mulut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Panduan Stimulasi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#059669] flex items-center gap-1.5">
            <MdAccessibility className="w-4 h-4" />
            Panduan Stimulasi Tumbuh Kembang Aktif
          </span>
          <ul className="list-disc list-inside space-y-1.5 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Lanjutkan memberikan pelukan hangat, ciuman, pandangan mata lekat, serta mengajak bayi berbicara.</li>
            <li>Rangsang respons pendengaran dengan mengajak bayi mencari sumber suara.</li>
            <li>Ajak bermain interaktif seperti cilukba atau membiarkan bayi melihat wajahnya di cermin aman.</li>
            <li>Latih koordinasi motorik dengan membantu bayi meraih mainan, berguling-guling, hingga belajar duduk stabil.</li>
          </ul>
        </div>

        {/* Perawatan Gigi & Gusi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#059669] flex items-center gap-1.5">
            <MdCleaningServices className="w-4 h-4" />
            Panduan Membersihkan Gigi &amp; Gusi Bayi
          </span>
          <div className="space-y-2 text-base-text-secondary leading-relaxed">
            <p>Meskipun gigi pertama belum tumbuh, sisa ASI dapat mengendap di gusi dan memicu pertumbuhan bakteri. Lakukan pembersihan rutin dengan metode berikut:</p>
            <ol className="list-decimal list-inside space-y-1 pl-0.5 text-[11px]">
              <li>Gendong atau pangku anak dengan posisi nyaman menggunakan satu tangan Ibu.</li>
              <li><span className="font-semibold text-base-text-primary">Bersihkan gusi anak secara perlahan</span> menggunakan kain lembut steril atau lap basah hangat yang dilingkarkan pada jari telunjuk Ibu.</li>
            </ol>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* INFOGRAFIS MILESTONE PERKEMBANGAN */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#059669] flex items-center gap-2">
          <MdMenuBook className="w-4 h-4" />
          10 Indikator Utama Milestone Perkembangan Bayi (3 - 6 Bulan)
        </h4>
        <p className="text-xs text-base-text-secondary pl-0.5">
          Perhatikan rentang capaian kemampuan fisik, kognitif, dan sosial anak pada infografis di bawah ini sebagai acuan evaluasi bulanan:
        </p>

        {/* Bento Grid layout untuk Milestone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-start gap-3 text-xs shadow-sm hover:border-[#059669]/30 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#059669] font-bold flex items-center justify-center shrink-0 text-[11px]">
                {index + 1}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">{item.title}</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Peringatan Klinis */}
        <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-base-text-secondary flex gap-2 items-start mt-2">
          <MdWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-amber-800">Peringatan Tumbuh Kembang:</span> Apabila pada usia 6 bulan si kecil belum bisa menunjukkan atau melakukan salah satu saja dari indikator di atas, mohon segera bawa si kecil ke Puskesmas atau dokter anak terdekat untuk mendapatkan skrining tumbuh kembang komprehensif.
          </p>
        </div>
      </div>

      {/* Footer Posyandu */}
      <div className="p-4 bg-base-white border border-[#059669]/30 rounded-2xl flex items-start gap-3 shadow-sm text-xs text-base-text-secondary leading-relaxed">
        <MdCheckCircle className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-base-text-primary block">Rutinitas Layanan Kesehatan</span>
          Dukung masa keemasan anak dengan selalu membawanya ke Posyandu setiap bulan untuk memantau berat badan, lingkar kepala, tinggi badan, serta konsultasi di Kelas Ibu Balita bersama tenaga kesehatan terlatih.
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L33:
function L33ArticleContent() {
  const milestones = [
    { phase: "Adaptasi Makan", desc: "Bayi mendapatkan pengalaman makan pertamanya dan belajar beradaptasi dengan berbagai tekstur MPASI." },
    { phase: "Fase Tumbuh Gigi", desc: "Gigi pertama mulai tumbuh, yang terkadang disertai gejala diare ringan atau demam suam-suam kuku." },
    { phase: "Motorik Kasar", desc: "Mampu berbalik aktif (telentang-telungkup), menjaga kepala tegak, dan merangkak menjelajah di usia 8-9 bulan." },
    { phase: "Respons Sosial", desc: "Meraih benda di sekitarnya, menirukan bunyi, menyenangi permainan cilukba, serta tersenyum aktif." }
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Stunting Alert Box */}
      <div className="bg-status-red-soft/20 p-4 rounded-xl border border-status-red/30 flex items-start gap-3">
        <MdWarning className="w-5 h-5 text-status-red shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-bold uppercase tracking-wider text-status-red">Bahaya Gagal Tumbuh</h5>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Awas bahaya <span className="font-bold text-base-text-primary">Stunting!</span> Kondisi ini dapat menyebabkan gagal pertumbuhan fisik yang permanen dan menyebabkan anak menjadi kurang cerdas di masa depan.
          </p>
        </div>
      </div>

      {/* Grid Rencana Aksi & Gizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Nutrisi & MPASI */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdFastfood className="w-4 h-4" />
            1. Fondasi Nutrisi &amp; Pengalaman MPASI
          </span>
          <ul className="list-disc list-inside space-y-2 text-base-text-secondary pl-0.5 leading-relaxed">
            <li><span className="font-semibold text-base-text-primary">Protein Hewani wajib:</span> Berikan MPASI yang kaya daging, ikan, ayam, atau telur untuk pertumbuhan jaringan otot dan otak yang optimal.</li>
            <li>Latih kemandirian bayi dengan mengajarkannya makan sendiri menggunakan sendok aman dan minum langsung dari gelas.</li>
            <li>Pertahankan pemberian <span className="font-semibold text-base-text-primary">ASI hingga usia 2 tahun</span> atau lebih sebagai benteng imunitas.</li>
            <li>Latih suasana makan yang menyenangkan dan peka terhadap respons kenyang/lapar bayi.</li>
          </ul>
        </div>

        {/* Pelayanan Kesehatan */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdHealthAndSafety className="w-4 h-4" />
            2. Intervensi Medis Wajib di Posyandu
          </span>
          <ul className="list-disc list-inside space-y-2 text-base-text-secondary pl-0.5 leading-relaxed">
            <li><span className="font-semibold text-base-text-primary">Kapsul Vitamin A Biru:</span> Pastikan bayi mendapatkan vitamin A dosis tinggi kapsul biru 1 kali setahun demi menjaga daya tahan tubuh dan kesehatan mata.</li>
            <li>Dapatkan layanan <span className="font-semibold text-base-text-primary">PKAT</span> (Pemeriksaan Kesehatan Anak Terintegrasi) secara intensif pada rentang usia 6-7 bulan.</li>
            <li>Lengkapi imunisasi dasar lanjutan sesuai dengan jadwal Buku KIA untuk mencegah penyakit infeksi berbahaya.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Bento Milestones */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdTrendingUp className="w-4 h-4" />
          Fase Perkembangan &amp; Milestones yang Akan Dialami (6 - 12 Bulan)
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-start gap-3 text-xs shadow-sm hover:border-[#C15F28]/30 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-[#F3E7DD] text-[#C15F28] font-bold flex items-center justify-center shrink-0 text-[11px]">
                {index + 1}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">{item.phase}</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-[#F3E7DD]/40 p-3.5 rounded-xl border border-[#C15F28]/20 text-[11px] text-base-text-secondary flex items-start gap-2 italic">
        <MdInfo className="w-4 h-4 text-[#C15F28] shrink-0 mt-0.5" />
        <span>* Tujuan Utama Tindakan: Memastikan pencegahan stunting dan penyakit infeksi secara dini, serta memastikan anak bisa optimal dalam melatih kemampuan bicara, bahasa, bersosialisasi, dan mandiri secara bertahap.</span>
      </div>
    </div>
  );
}

// ARTIKEL L34:
function L34ArticleContent() {
  const foodGroups = [
    "Air Susu Ibu (ASI)",
    "Makanan Pokok (Karbohidrat)",
    "Kacang-kacangan",
    "Suku Hewani & Produk Turunannya",
    "Daging-dagingan (Ikan, Ayam, Sapi)",
    "Telur (Ayam, Puyuh)",
    "Buah & Sayuran Kaya Vitamin A",
    "Buah & Sayuran Lainnya"
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Highlight */}
      <div className="bg-[#F3E7DD] p-4 rounded-xl border border-[#C15F28]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#C15F28] leading-relaxed">
          Memasuki usia 6 hingga 12 bulan, makanan yang diberikan pada bayi harus mengandung sumber gizi lengkap dan bervariasi dari 8 kelompok bahan makanan untuk mendukung tumbuh kembang terbaiknya.
        </p>
      </div>

      {/* 8 Kelompok Makanan Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdRestaurantMenu className="w-4 h-4" />
          8 Kelompok Bahan Makanan MPASI Wajib Balita
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {foodGroups.map((group, index) => (
            <div 
              key={index} 
              className="p-3 bg-base-bg rounded-xl border border-base-border/40 flex flex-col items-center text-center justify-center space-y-1.5 min-h-[80px]"
            >
              <span className="w-5 h-5 bg-[#C15F28]/10 text-[#C15F28] font-bold rounded-full flex items-center justify-center text-[10px]">
                {index + 1}
              </span>
              <span className="font-bold text-base-text-primary leading-tight text-[11px]">{group}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Timeline Transisi Tekstur */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdTimeline className="w-4 h-4" />
          Panduan Tahapan Transisi Tekstur MPASI
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Usia 6-8 Bulan */}
          <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-2">
            <span className="px-2 py-0.5 rounded bg-[#F3E7DD] text-[#C15F28] font-bold text-[10px] uppercase">Fase 1: Usia 6 - 8 Bulan</span>
            <span className="font-bold text-base-text-primary block text-sm">Tekstur Lunak &amp; Lembut</span>
            <p className="text-base-text-secondary leading-relaxed">
              Mulailah dengan bubur saring sereal basah, bubur pisang campur apel/pir, bubur sup daging kacang merah, atau puding kentang ayam telur yang dihaluskan sempurna.
            </p>
          </div>

          {/* Usia 9-11 Bulan */}
          <div className="p-4 bg-base-white border border-base-border/60 rounded-2xl space-y-2">
            <span className="px-2 py-0.5 rounded bg-[#F3E7DD] text-[#C15F28] font-bold text-[10px] uppercase">Fase 2: Usia 9 - 11 Bulan</span>
            <span className="font-bold text-base-text-primary block text-sm">Tekstur Lebih Kasar tapi Lembut</span>
            <p className="text-base-text-secondary leading-relaxed">
              Naikkan tekstur secara bertahap ke makanan cincang atau semi-padat. Contoh: sup daging cincang halus, nasi tim ikan kembung dengan telur puyuh, atau tim bubur manado daging udang.
            </p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Regulasi Memasak & Alergi */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdInfo className="w-4 h-4" />
          Aturan Higiene &amp; Strategi Pengenalan Alergi
        </h4>
        
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3 text-xs leading-relaxed">
          <div className="flex items-start gap-2.5">
            <MdCheckCircle className="w-4 h-4 text-[#C15F28] shrink-0 mt-0.5" />
            <p className="text-base-text-secondary">
              <span className="font-bold text-base-text-primary">Metode Pengenalan Tunggal:</span> Perkenalkan jenis makanan baru satu per satu selama 2-3 hari berturut-turut sambil memperhatikan dengan saksama apakah anak menunjukkan gejala alergi tertentu terhadap makanan tersebut.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <MdWarning className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            <p className="text-base-text-secondary">
              <span className="font-bold text-base-text-primary">Batasan Cara Memasak:</span> Pastikan cara memasak makanan diutamakan dengan cara <span className="font-semibold text-base-text-primary">direbus atau dikukus</span>. Hindari memberikan makanan yang digoreng berlebihan, mengandung bahan pengawet tambahan, serta tinggi gula dan garam sebelum anak berusia 1 tahun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L35:
function L35ArticleContent() {
  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Box Pembuka */}
      <div className="bg-[#F3E7DD] p-4 rounded-xl border border-[#C15F28]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#C15F28] leading-relaxed">
          Memasuki usia 6 bulan, ASI saja sudah tidak cukup untuk mengejar tumbuh kembang si kecil. Yuk, pelajari syarat mutlak MPASI ideal, matriks tekstur berdasarkan usia, serta contekan resep takaran gramasi pas dari Buku KIA!
        </p>
      </div>

      {/* 4 Pilar Syarat MPASI */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdDoneAll className="w-4 h-4" />
          4 Syarat Mutlak MPASI yang Baik &amp; Benar
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-[#C15F28] block">1. Tepat Waktu</span>
            <p className="text-[11px] text-base-text-secondary">Diberikan tepat saat bayi menginjak usia 6 bulan karena fungsi pencernaan siap dan kebutuhan gizi meningkat.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-[#C15F28] block">2. Adekuat (Cukup)</span>
            <p className="text-[11px] text-base-text-secondary">Memenuhi jumlah, frekuensi, kekentalan tekstur, dan variasi zat gizi. Prioritaskan protein hewani, kenalkan buah/sayur kaya Vit A &amp; C, serta tambahkan lemak dari minyak/santan.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-[#C15F28] block">3. Aman &amp; Higienis</span>
            <p className="text-[11px] text-base-text-secondary">Pastikan kebersihan bahan makanan dan alat masak. Selalu cuci tangan sebelum menyiapkan makanan dan sebelum menyuapi anak.</p>
          </div>
          <div className="p-3 bg-base-bg rounded-xl border border-base-border/40 space-y-1">
            <span className="font-bold text-[#C15F28] block">4. Prosedur Benar</span>
            <p className="text-[11px] text-base-text-secondary">Berikan teratur (pagi, siang, sore), durasi makan maksimal 30 menit, suasana tenang tanpa TV/gadget, dan latih anak makan mandiri.</p>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Matriks Aturan Usia & Tekstur */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdHourglassTop className="w-4 h-4" />
          Matriks Aturan Tekstur, Porsi, &amp; Kebutuhan Cairan
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 6-8 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col justify-between min-h-[400px] space-y-3">
            <div className="space-y-3">
              <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Bayi 6 - 8 Bulan</span>
              
              {/* Slot Gambar Tekstur */}
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
                <Image 
                  src="/images/mpasi/texture-6-8.jpg" 
                  alt="Tekstur MPASI Disaring" 
                  fill 
                  className="object-cover !m-0" 
                />
              </div>

              <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
                <p><span className="font-bold text-base-text-primary block">🥣 Tekstur: DISARING</span> Makanan dibuat dengan disaring. Tekstur makanan lumat dan kental.</p>
                <p><span className="font-bold text-base-text-primary block">🍽️ Porsi &amp; Frekuensi:</span> 2 - 3 sendok makan (sdm) bertahap hingga 1/2 mangkok (62.5 ml - 125 ml). 2 - 3 kali makanan utama + 1 - 2 kali selingan harian.</p>
              </div>
            </div>

            {/* Terkunci di Paling Bawah */}
            <div className="pt-2 border-t border-base-border/30 space-y-0.5 text-[11px] text-base-text-secondary">
              <span className="font-bold text-[#C15F28] block">⚡ Energi: ±200 kkal / hari</span>
              <span className="block">💧 Cairan: 800 ml/hari (±3 gelas belimbing)</span>
            </div>
          </div>

          {/* 9-11 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col justify-between min-h-[400px] space-y-3">
            <div className="space-y-3">
              <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Bayi 9 - 11 Bulan</span>
              
              {/* Slot Gambar Tekstur */}
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
                <Image 
                  src="/images/mpasi/texture-9-11.jpg" 
                  alt="Tekstur MPASI Dicincang" 
                  fill 
                  className="object-cover !m-0" 
                />
              </div>

              <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
                <p><span className="font-bold text-base-text-primary block">🥣 Tekstur: DICINCANG</span> Bahan dicincang halus / kasar lembut sesuai kemampuan kunyah anak.</p>
                <p><span className="font-bold text-base-text-primary block">🍽️ Porsi &amp; Frekuensi:</span> 1/2 sampai 3/4 mangkok ukuran 250 ml (125 ml - 200 ml). 3 - 4 kali makanan utama + 1 - 2 kali selingan harian.</p>
              </div>
            </div>

            {/* Terkunci di Paling Bawah */}
            <div className="pt-2 border-t border-base-border/30 space-y-0.5 text-[11px] text-base-text-secondary">
              <span className="font-bold text-[#C15F28] block">⚡ Energi: ±300 kkal / hari</span>
              <span className="block">💧 Cairan: Diimbangi ASI aktif bulanan</span>
            </div>
          </div>

          {/* 12-23 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col justify-between min-h-[400px] space-y-3">
            <div className="space-y-3">
              <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Bayi 12 - 23 Bulan</span>
              
              {/* Slot Gambar Tekstur */}
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
                <Image 
                  src="/images/mpasi/texture-12-23.jpg" 
                  alt="Tekstur Makanan Keluarga" 
                  fill 
                  className="object-cover !m-0" 
                />
              </div>

              <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
                <p><span className="font-bold text-base-text-primary block">🥣 Tekstur: MASAK BIASA</span> Makanan keluarga diiris-iris atau dimasak biasa tanpa rasa pedas.</p>
                <p><span className="font-bold text-base-text-primary block">🍽️ Porsi &amp; Frekuensi:</span> 3/4 sampai 1 mangkok penuh ukuran 250 ml. 3 - 4 kali makanan utama + 1 - 2 kali selingan harian.</p>
              </div>
            </div>

            {/* Terkunci di Paling Bawah */}
            <div className="pt-2 border-t border-base-border/30 space-y-0.5 text-[11px] text-base-text-secondary">
              <span className="font-bold text-[#C15F28] block">⚡ Energi: ±550 kkal / hari</span>
              <span className="block">💧 Cairan: 1.300 ml/hari (±5 gelas)</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* STRATEGI RESEP MODUL A: BAHAN MATANG KELUARGA */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdKitchen className="w-4 h-4" />
          Metode A: Cara Membuat MPASI dari Makanan Keluarga (Bahan Matang)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Matang 6-8 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 6 - 8 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/matang-6-8.jpg" alt="Menu Matang 6-8 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="list-disc list-inside pl-0.5 text-base-text-secondary text-[11px]">
                <li>Nasi putih: 30 gram | Dadar telur: 35 gram</li>
                <li>Sayur kare wortel tempe: 20 gram</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Lumatan nasi, telur dadar, tempe, dan wortel kare lalu disaring kental bersama kuah santan.</p>
            </div>
          </div>

          {/* Matang 9-11 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 9 - 11 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/matang-9-11.jpg" alt="Menu Matang 9-11 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="list-disc list-inside pl-0.5 text-base-text-secondary text-[11px]">
                <li>Nasi putih: 45 gram | Tumis buncis: 25 gram</li>
                <li>Ikan kembung bumbu kuning: 30 gram</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Cincang halus daging ikan kembung bebas duri, nasi, dan buncis. Sajikan lembab dengan kuah bumbu.</p>
            </div>
          </div>

          {/* Matang 12-23 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 12 - 23 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/matang-12-23.jpg" alt="Menu Matang 12-23 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="list-disc list-inside pl-0.5 text-base-text-secondary text-[11px]">
                <li>Nasi putih: 55 gram | Semur hati ayam: 45 gram</li>
                <li>Bening/bobor bayam: 20 gram</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Sajikan utuh ala menu keluarga, cukup potong kecil semur hati dan iris sayur bayam agar mudah dikunyah.</p>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGI RESEP MODUL B: BAHAN MENTAH */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdOutdoorGrill className="w-4 h-4" />
          Metode B: Cara Membuat MPASI dari Bahan Mentah (Masak Khusus)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Mentah 6-8 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 6 - 8 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/mentah-6-8.jpg" alt="Bahan Mentah 6-8 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="grid grid-cols-2 gap-x-1 text-base-text-secondary text-[11px]">
                <li>• Beras putih: 10 g</li>
                <li>• Telur ayam: 30 g</li>
                <li>• Tempe: 10 g</li>
                <li>• Wortel &amp; Santan: @10g/30g</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Masak bubur beras bersama tempe, wortel tumis, santan, dan kocokan telur hingga lumat kental, lalu saring.</p>
            </div>
          </div>

          {/* Mentah 9-11 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 9 - 11 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/mentah-9-11.jpg" alt="Bahan Mentah 9-11 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="grid grid-cols-2 gap-x-1 text-base-text-secondary text-[11px]">
                <li>• Beras putih: 15 g</li>
                <li>• Ikan kembung: 30 g</li>
                <li>• Minyak kelapa: 10 g</li>
                <li>• Wortel &amp; Tempe: @15g/10g</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Masak nasi tim dengan tumisan ikan kembung cincang dan sayur buncis/wortel hingga jadi nasi tim lembek kasar.</p>
            </div>
          </div>

          {/* Mentah 12-23 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
            <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">Fase 12 - 23 Bulan</span>
            
            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-base-white border border-base-border/30">
              <Image src="/images/resep/mentah-12-23.jpg" alt="Bahan Mentah 12-23 Bulan" fill className="object-cover !m-0" />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Komposisi Bahan:</span>
              <ul className="grid grid-cols-2 gap-x-1 text-base-text-secondary text-[11px]">
                <li>• Beras putih: 25 g</li>
                <li>• Hati ayam: 50 g</li>
                <li>• Minyak kelapa: 5 g</li>
                <li>• Bayam &amp; Santan: @20g/50g</li>
              </ul>
            </div>
            <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
              <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
              <p>Masak nasi pulen biasa. Sajikan terpisah dengan lauk hati ayam goreng santan serta kuah bening sayur bayam.</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-base-border/30" />

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdFastfood className="w-4 h-4" />
          Metode C: Detail Resep Spesifik Buku KIA (Porsi &amp; Langkah Lengkap)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Resep 6-8 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col justify-between min-h-[520px] space-y-3">
            <div className="space-y-3">
              <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">
                Bubur Sup Daging Kacang Merah (6 - 8 Bulan)
              </span>
              
              {/* Gambar Resep - Rasio 4:3 Terkunci, Ukuran Dibatasi (Tidak Kegedean) */}
              <div className="w-full max-w-50 sm:max-w-60 aspect-4/3 relative rounded-lg overflow-hidden bg-base-white border border-base-border/30 mx-auto">
                <Image 
                  src="/images/resep/kia-bubur-daging.jpg" 
                  alt="Bubur Sup Daging Kacang Merah" 
                  fill 
                  className="object-cover m-0!" 
                />
              </div>

              {/* Komposisi Bahan Lengkap */}
              <div className="space-y-1">
                <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Bahan Baku &amp; Bumbu:</span>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 list-disc list-inside pl-0.5 text-base-text-secondary text-[11px]">
                  <li>Nasi: 50 g (6 sdm)</li>
                  <li>Daging ayam: 30 g (3 sdm)</li>
                  <li>Telur ayam: 25 g (1/2 butir)</li>
                  <li>Buncis &amp; Wortel: @10 g (1 sdm)</li>
                  <li>Kacang merah: 10 g (1 sdm)</li>
                  <li>Bawang daun: 10 g (1 batang)</li>
                  <li>Seledri: 1 batang</li>
                  <li>Kaldu ayam: 300 ml</li>
                  <li>Minyak tumis: 2.5 g (1/2 sdt)</li>
                  <li>Baput &amp; Bamer: @2 siung</li>
                </ul>
              </div>

              {/* Cara Membuat */}
              <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
                <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
                <ol className="list-decimal list-inside space-y-0.5 pl-0.5">
                  <li>Didihkan air kaldu ayam, masukkan kacang merah dan masak sampai empuk.</li>
                  <li>Tumis bumbu halus (bamer, baput) sampai harum, masukkan daging ayam cincang, masak hingga berubah warna.</li>
                  <li>Masukkan tumisan daging ke dalam air kaldu, masak sampai daging empuk.</li>
                  <li>Masukkan nasi, buncis, dan wortel.</li>
                  <li>Tambahkan kocokan telur, aduk merata dan masak sampai matang.</li>
                  <li>Haluskan bubur sampai mencapai tekstur lumat yang diinginkan, lalu sajikan.</li>
                </ol>
              </div>
            </div>

            {/* Terkunci di Paling Bawah */}
            <div className="pt-2 border-t border-base-border/30 space-y-0.5 text-[11px] text-base-text-secondary">
              <span className="font-bold text-[#C15F28] block">🍽️ Porsi &amp; Pendamping:</span>
              <span className="block">Untuk 3 Porsi | Buah: 100 g (2 buah) jeruk diambil sarinya.</span>
            </div>
          </div>

          {/* Resep 9-12 Bulan */}
          <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 flex flex-col justify-between min-h-130 space-y-3">
            <div className="space-y-3">
              <span className="font-bold text-base-text-primary block border-b border-base-border/30 pb-1">
                Nasi Tim Ikan Kembung Telur Puyuh (9 - 12 Bulan)
              </span>
              
              {/* Gambar Resep - Rasio 4:3 Terkunci, Ukuran Dibatasi (Tidak Kegedean) */}
              <div className="w-full max-w-50 sm:max-w-60 aspect-4/3 relative rounded-lg overflow-hidden bg-base-white border border-base-border/30 mx-auto">
                <Image 
                  src="/images/resep/kia-tim-kembung.jpg" 
                  alt="Nasi Tim Ikan Kembung Telur Puyuh" 
                  fill 
                  className="object-cover m-0!" 
                />
              </div>

              {/* Komposisi Bahan Lengkap */}
              <div className="space-y-1">
                <span className="font-bold text-[#C15F28] block text-[11px]">🛒 Bahan Baku &amp; Bumbu:</span>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 list-disc list-inside pl-0.5 text-base-text-secondary text-[11px]">
                  <li>Nasi putih: 115 g (12 sdm)</li>
                  <li>Ikan kembung segar: 30 g</li>
                  <li>Telur puyuh: 30 g (3 butir)</li>
                  <li>Wortel: 15 g (1 potong besar)</li>
                  <li>Tomat: 10 g (1 buah sedang)</li>
                  <li>Minyak kelapa: 7.5 g (1.5 sdt)</li>
                  <li>Kaldu ayam: 75 cc (1/3 gelas)</li>
                  <li>Pepaya haluskan: 50 g</li>
                </ul>
              </div>

              {/* Cara Membuat */}
              <div className="space-y-1 text-[11px] text-base-text-secondary leading-relaxed">
                <span className="font-bold text-base-text-primary block">🍳 Cara Membuat:</span>
                <ol className="list-decimal list-inside space-y-0.5 pl-0.5">
                  <li>Masukkan nasi, ikan kembung (yang sudah dihaluskan/bebas duri), telur puyuh, dan minyak kelapa ke dalam mangkok tim.</li>
                  <li>Tambahkan air kaldu ayam ke dalam mangkok.</li>
                  <li>Masukkan serutan wortel dan potongan tomat, lalu tim hingga seluruh bahan matang sempurna.</li>
                  <li>Angkat, sajikan dengan pendamping saus pepaya yang telah dihaluskan.</li>
                </ol>
              </div>
            </div>

            {/* Terkunci di Paling Bawah */}
            <div className="pt-2 border-t border-base-border/30 space-y-0.5 text-[11px] text-base-text-secondary">
              <span className="font-bold text-[#C15F28] block">🍽️ Porsi &amp; Pendamping:</span>
              <span className="block">Untuk 3 Porsi | Buah Selingan: 180 g (1 potong besar) semangka.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Camilan Selingan */}
      <div className="p-4 bg-base-white border border-[#C15F28]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs max-w-2xl mx-auto">
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-bold text-base-text-primary block text-sm">💡 Inspirasi Camilan Selingan: Perkedel Kentang Isi Daging</span>
          <p className="text-[11px] text-base-text-secondary leading-relaxed">
            <span className="font-semibold text-base-text-primary">Formula Takaran:</span> Kentang 25 g + Daging Giling 5 g + Minyak 5 g + Telur Ayam 5 g. Campur seluruh bahan kompak, bentuk bulat lalu goreng matang.
          </p>
        </div>
      </div>
    </div>
  );
}

// ARTIKEL L36: 
function L36ArticleContent() {
  const milestones = [
    { title: "Duduk Mandiri", desc: "Bayi sudah mulai mampu mempertahankan posisi duduk secara mandiri tanpa disangga." },
    { title: "Belajar Berdiri", desc: "Kedua kakinya mulai aktif menyangga sebagian berat badan saat diposisikan berdiri." },
    { title: "Merangkak Aktif", desc: "Bisa merangkak secara terarah untuk meraih mainan atau mendekati seseorang di dekatnya." },
    { title: "Koordinasi Tangan", desc: "Mampu memindahkan benda atau mainan dari genggaman satu tangan ke tangan lainnya." },
    { title: "Pegang Dua Benda", desc: "Dapat memungut dua benda di mana kedua tangan masing-masing memegang benda pada saat bersamaan." },
    { title: "Meraup Benda", desc: "Mampu memungut benda berukuran kecil sebesar kacang dengan cara meraup menggunakan jemari." },
    { title: "Ocehan Suku Kata", desc: "Mulai bersuara tanpa arti yang jelas berupa repetisi suku kata: mamama, bababa, dadada, tatatata." },
    { title: "Fokus Visual Spasial", desc: "Secara aktif mencari mainan atau benda yang sengaja dijatuhkan dari pandangannya." },
    { title: "Interaksi Sosial", desc: "Senang bermain interaktif dua arah bersama orang tua seperti tepuk tangan atau Cilukba." },
    { title: "Ekspresi Motorik", desc: "Menunjukkan kegembiraan secara aktif salah satunya dengan melempar benda di sekitarnya." }
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#F3E7DD] p-4 rounded-xl border border-[#C15F28]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#C15F28] leading-relaxed">
          Pada rentang usia 6 hingga 9 bulan, koordinasi motorik kasar anak meningkat tajam dari belajar duduk hingga merangkak. Pastikan proteksi imunisasi dasar dan stimulasi harian berjalan selaras!
        </p>
      </div>

      {/* Grid Intervensi Medis & Stimulasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pelayanan Kesehatan & Gigi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdVaccines className="w-4 h-4" />
            Layanan Kesehatan &amp; Tumbuh Gigi
          </span>
          <div className="space-y-2 text-base-text-secondary leading-relaxed">
            <div className="border-b border-base-border/30 pb-1.5">
              <span className="font-bold text-base-text-primary block">💉 Imunisasi Campak-Rubella:</span> 
              Wajib diberikan untuk mencegah radang paru (pneumonia), radang otak, hingga kebutaan.
            </div>
            <div className="border-b border-base-border/30 pb-1.5">
              <span className="font-bold text-base-text-primary block">💊 Vitamin A Kapsul Biru:</span> 
              Dapatkan rutin pada bulan Februari atau Agustus di Posyandu untuk mata sehat dan pertumbuhan fisik.
            </div>
            <div>
              <span className="font-bold text-base-text-primary block">🦷 Perawatan Gigi Seri:</span> 
              Perhatikan tumbuhnya 4 gigi seri pada rahang atas serta rahang bawah. Bersihkan berkala.
            </div>
          </div>
        </div>

        {/* Tips Stimulasi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdAccessibility className="w-4 h-4" />
            Panduan Stimulasi Harian (6 - 9 Bulan)
          </span>
          <ul className="list-disc list-inside space-y-1 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Sering peluk, tersenyum, bicara, dan panggil nama panggilan.</li>
            <li>Latih bersalaman, tepuk tangan, dan melambai.</li>
            <li>Bermain Cilukba, cermin, dongeng, dan mainan mengapung di air.</li>
            <li>Latih kognitif: masukkan benda kecil ke wadah, serta duduk, merangkak, hingga berdiri berpegangan.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* INFOGRAFIS MILESTONE PERKEMBANGAN */}
      <div className="space-y-3 relative pb-20"> {/* Tambahkan relative dan pb untuk tombol pintas */}
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdMenuBook className="w-4 h-4" />
          11 Milestone Utama Penanda Tumbuh Kembang Bayi (6 - 9 Bulan)
        </h4>
        <p className="text-xs text-base-text-secondary pl-0.5">
          Perhatikan rentang capaian kemampuan fisik, kognitif, dan komunikasi anak di bawah ini sebagai bahan pemantauan mandiri:
        </p>

        {/* Bento Grid layout untuk Milestone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-start gap-3 text-xs shadow-sm hover:border-[#C15F28]/30 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-[#F3E7DD] text-[#C15F28] font-bold flex items-center justify-center shrink-0 text-[11px]">
                {index + 1}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">{item.title}</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* 11th Milestone - Dimaksimalkan dengan Slot Ilustrasi Berrasio Pas */}
          <div className="p-3 bg-base-white border border-base-border/50 rounded-xl flex flex-col justify-between text-xs shadow-sm sm:col-span-2 hover:border-[#C15F28]/30 transition-all space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-6 h-6 rounded-lg bg-[#F3E7DD] text-[#C15F28] font-bold flex items-center justify-center shrink-0 text-[11px]">
                11
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">Eksplorasi Lingkungan</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">
                  Bayi aktif menunjukkan kegembiraan dengan melempar benda-benda di sekitarnya berulang kali sebagai eksperimen motorik dan sebab-akibat.
                </p>
              </div>
              
              {/* Slot Gambar Kunci Rasio 4:3 Terkendali (Tidak Kegedean) */}
              <div className="w-full max-w-40 aspect-4/3 relative rounded-lg overflow-hidden bg-base-white border border-base-border/30 sm:ml-auto mx-auto shrink-0">
                <Image 
                  src="/images/mpasi/texture-6-8.jpg" 
                  alt="Ilustrasi Perkembangan Bayi" 
                  fill 
                  className="object-contain block m-0!" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Peringatan Medis */}
        <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-base-text-secondary flex gap-2 items-start mt-2">
          <MdWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-amber-800">Evaluasi Klinis Tambahan:</span> Jika anak belum bisa melakukan salah satu atau beberapa dari hal-hal yang disebutkan di atas pada usia 9 bulan, **Segera bawa anak ke Puskesmas** untuk deteksi dini keterlambatan.
          </p>
        </div>

        {/* 🟢 SISIPKAN TOMBOL PINTAS INTERAKTIF DI SINI */}
        <div className="absolute -bottom-6 left-0 right-0 p-3 flex justify-center">
          <Link href="../pemantauan/6-9" passHref>
            <button className="px-6 py-2.5 rounded-full bg-[#C15F28] text-white font-bold text-xs shadow-md hover:bg-[#C15F28]/90 flex items-center gap-2 group transition-all">
              Beri Tanda Ya/Tidak Sekarang di Lembar Pemantauan
              <MdArrowForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Footer Posyandu */}
      <div className="p-4 bg-base-white border border-[#C15F28]/30 rounded-2xl flex items-start gap-3 shadow-sm text-xs text-base-text-secondary leading-relaxed">
        <MdCheckCircle className="w-5 h-5 text-[#C15F28] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-base-text-primary block">Komitmen Pemantauan Bulanan</span>
          Bawa bayi Anda setiap bulan ke Posyandu atau Fasilitas Kesehatan terdekat untuk pemantauan KMS Digital bulanan.
        </div>
      </div>
    </div>
  );
}

//ARTIKEL L37:
function L37ArticleContent() {
  const milestones = [
    { title: "Mengangkat Badan", desc: "Bayi aktif mengangkat tubuhnya secara mandiri menuju posisi berdiri." },
    { title: "Belajar Berdiri", desc: "Mampu berdiri selama minimal 30 detik dengan berpegangan pada kursi atau perabot." },
    { title: "Berjalan Dituntun", desc: "Langkah kaki mulai maju ke depan saat kedua tangan dituntun oleh orang tua." },
    { title: "Meraih Mainan", desc: "Mengulurkan lengan atau seluruh badannya secara terarah demi menggapai mainan yang diinginkan." },
    { title: "Menggenggam Erat", desc: "Jemari tangan sudah mampu memegang dan menggenggam erat pensil atau krayon." },
    { title: "Fase Oral Lanjutan", desc: "Memasukkan benda-benda di sekitarnya ke dalam mulut sebagai bentuk eksplorasi sensorik." },
    { title: "Meniru Bunyi", desc: "Secara vokal mengulang atau menirukan bunyi-bunyian unik yang baru saja didengarnya." },
    { title: "Repetisi Kata", desc: "Mampu menyebutkan 2-3 suku kata yang sama secara berulang tanpa arti yang spesifik." },
    { title: "Eksplorasi Aktif", desc: "Rasa ingin tahu tinggi, senang menjelajah sekitar, dan ingin menyentuh benda apa saja." },
    { title: "Respons Auditorik", desc: "Bereaksi dengan cepat terhadap suara yang diucapkan perlahan atau suara bisikan." },
    { title: "Bermain Interaktif", desc: "Sangat senang dan tertawa responsif saat diajak bermain Cilukba bersama keluarga." },
    { title: "Mengenal Keluarga", desc: "Mampu mengenali anggota keluarga inti dan mulai menunjukkan rasa takut pada orang asing." }
  ];

  return (
    <div className="space-y-6 text-base-text-primary">
      {/* Intro Box */}
      <div className="bg-[#F3E7DD] p-4 rounded-xl border border-[#C15F28]/20">
        <p className="text-xs sm:text-sm font-semibold text-[#C15F28] leading-relaxed">
          Menginjak usia 9 hingga 12 bulan, si kecil mulai transisi ke posisi tegak. Perhatikan perkembangan motorik halus jari jemari serta imunisasi spesifik untuk memproteksi perkembangan otaknya.
        </p>
      </div>

      {/* Grid Intervensi Medis & Stimulasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pelayanan Kesehatan & Gigi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdVaccines className="w-4 h-4" />
            Layanan Medis &amp; Kesehatan Gigi 9-12 Bulan
          </span>
          <div className="space-y-2 text-base-text-secondary leading-relaxed">
            <div className="border-b border-base-border/30 pb-1.5">
              <span className="font-bold text-base-text-primary block">💉 Imunisasi JE (Japanese Encephalitis):</span> 
              Sangat penting diberikan untuk memproteksi anak dari risiko infeksi virus pemicu penyakit radang otak.
            </div>
            <div className="border-b border-base-border/30 pb-1.5">
              <span className="font-bold text-base-text-primary block">🦷 Pertumbuhan Gigi Kompleks:</span> 
              Pada fase usia 9 bulan umumnya telah tumbuh 8 gigi seri dan berlanjut hingga 4 gigi geraham untuk mendukung proses mengunyah.
            </div>
            <div>
              <span className="font-bold text-base-text-primary block">🧼 Higienitas Mulut:</span> 
              Lanjutkan membersihkan gigi anak secara teratur memakai kain kasa steril yang dibasahi air hangat, dicampur sedikit pasta gigi khusus anak.
            </div>
          </div>
        </div>

        {/* Tips Stimulasi */}
        <div className="p-4 bg-base-bg rounded-xl border border-base-border/40 space-y-3">
          <span className="font-bold text-[#C15F28] flex items-center gap-1.5">
            <MdAccessibility className="w-4 h-4" />
            Panduan Stimulasi Tumbuh Kembang Aktif
          </span>
          <ul className="list-disc list-inside space-y-1 text-base-text-secondary pl-0.5 leading-relaxed">
            <li>Ajak anak berbicara interaktif menggunakan media boneka kesukaannya.</li>
            <li>Latih kemampuan menunjuk dan mengucapkan nama orang, benda, atau organ tubuh yang dikenal.</li>
            <li>Bacakan dongeng cerita bergambar sambil menyuruh anak menunjuk objek di buku.</li>
            <li>Ajarkan anak memegang mainan dengan dua tangan, menyusun balok, dan menyembunyikan mainan.</li>
            <li>Stimulasi motorik halus: latih memegang pensil untuk mencoret-coret kertas kosong.</li>
            <li>Stimulasi motorik kasar: dukung aktivitas duduk, merangkak, berdiri berpegangan, berjalan mundur, hingga berjalan jinjiit.</li>
          </ul>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* INFOGRAFIS MILESTONE PERKEMBANGAN */}
      <div className="space-y-3 relative pb-20">
        <h4 className="text-sm font-bold text-[#C15F28] flex items-center gap-2">
          <MdMenuBook className="w-4 h-4" />
          12 Milestone Utama Penanda Tumbuh Kembang Bayi (9 - 12 Bulan)
        </h4>
        <p className="text-xs text-base-text-secondary pl-0.5">
          Pantau grafik kemampuan fisik, cara berkomunikasi, dan kemandirian emosional anak lewat parameter matriks berikut:
        </p>

        {/* Bento Grid layout untuk 12 Milestone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((item, index) => (
            <div 
              key={index}
              className="p-3 bg-base-white border border-base-border/50 rounded-xl flex items-start gap-3 text-xs shadow-sm hover:border-[#C15F28]/30 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-[#F3E7DD] text-[#C15F28] font-bold flex items-center justify-center shrink-0 text-[11px]">
                {index + 1}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">{item.title}</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Slot Ilustrasi Khusus Bento Grid - Dikunci Rasio 4:3 Ukuran Pas */}
          <div className="p-3 bg-base-white border border-base-border/50 rounded-xl flex flex-col justify-between text-xs shadow-sm sm:col-span-2 hover:border-[#C15F28]/30 transition-all space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-6 h-6 rounded-lg bg-[#F3E7DD] font-bold flex items-center justify-center shrink-0 text-[11px] text-[#C15F28]">
                💡
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-base-text-primary block">Pemantauan Mandiri Teratur</span>
                <p className="text-[11px] text-base-text-secondary leading-relaxed">
                  Gunakan indikator di atas untuk memastikan kemampuan motorik dan sosial emosional anak berkembang optimal menjelang usia satu tahun.
                </p>
              </div>
              
              {/* Gambar Terkendali 4:3 Tanpa Efek Gepeng */}
              <div className="w-full max-w-[160px] aspect-[4/3] relative rounded-lg overflow-hidden bg-base-white border border-base-border/30 sm:ml-auto mx-auto shrink-0">
                <Image 
                  src="/images/mpasi/texture-9-11.jpg" 
                  alt="Ilustrasi Berdiri Bayi 9-12 Bulan" 
                  fill 
                  className="object-contain block m-0!" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Peringatan Evaluasi Medis */}
        <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-base-text-secondary flex gap-2 items-start mt-2">
          <MdWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-amber-800">Evaluasi Klinis Tambahan:</span> Jika anak belum bisa melakukan salah satu dari hal-hal yang disebutkan di atas pada rentang usianya, **segera bawa anak ke Puskesmas** terdekat untuk berkonsultasi mengenai deteksi tumbuh kembangnya.
          </p>
        </div>

        {/* Shortcut Interaktif Pintas Menuju Fitur Lembar Pemantauan */}
        <div className="absolute -bottom-6 left-0 right-0 p-3 flex justify-center">
          <Link href="../pemantauan/9-12" passHref>
            <button className="px-6 py-2.5 rounded-full bg-[#C15F28] text-white font-bold text-xs shadow-md hover:bg-[#C15F28]/90 flex items-center gap-2 group transition-all">
              Beri Tanda Ya/Tidak Sekarang di Lembar Pemantauan
              <MdArrowForward className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      <hr className="border-base-border/30" />

      {/* Footer Komitmen Layanan */}
      <div className="p-4 bg-base-white border border-[#C15F28]/30 rounded-2xl flex items-start gap-3 shadow-sm text-xs text-base-text-secondary leading-relaxed">
        <MdCheckCircle className="w-5 h-5 text-[#C15F28] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-base-text-primary block">Kunjungan Fasilitas Kesehatan</span>
          Pastikan untuk membawa bayi Anda setiap bulan ke Posyandu, Puskesmas, atau kelas Ibu Balita untuk mendapatkan pencatatan tumbuh kembang yang menyeluruh dan kapsul Vitamin A berkala.
        </div>
      </div>
    </div>
  );
}



// Fallback Mock Content Generator
function getMockContent(id: string, title: string): string {
  return `<p>Konten artikel statis untuk ID <strong>${id}</strong> - <strong>${title}</strong>.</p>`;
}