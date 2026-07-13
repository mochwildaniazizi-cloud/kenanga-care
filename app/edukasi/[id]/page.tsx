"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen, FiTrash, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare, MdEdit, MdEventAvailable, MdInfo, MdCheckCircle, MdWarning, MdCancel, MdShield, MdHealing, MdFavorite, MdPsychology, MdFamilyRestroom, MdPregnantWoman, MdArrowForward, MdChildCare, MdAllInclusive, MdCleanHands, MdKitchen, MdRestaurant, MdLocalCafe, MdWaterDrop } from "react-icons/md";
import { mockArticles } from "../data";
import type { Article } from "../data";
import { useUserRole } from "@/context/UserRoleContext";
import CustomDatePicker from "@/components/CustomDatePicker";

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
      case "Setelah Melahirkan": return "bg-[#F5F3FF] text-[#7A5AF8] border border-[#7A5AF8]/25";
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
      <div className="max-w-[800px] mx-auto py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-base-text-primary">Konten Tidak Ditemukan</h2>
        <p className="text-sm text-base-text-secondary">Maaf, artikel atau video yang Anda cari tidak tersedia.</p>
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
    <div className="max-w-[1200px] mx-auto pb-16 animate-in fade-in duration-300">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-xs">
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
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-[240px] mx-auto">
                Bagikan informasi penting ini ke rekan kader posyandu atau keluarga tercinta.
              </p>
            </div>

            <div className="space-y-2 text-left mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Salin Link Halaman</span>
              <div className="flex items-center justify-between bg-[#F5F7FB] border border-[#E5E9F2] rounded-2xl px-4 py-3.5 text-xs text-[#1E1E1E] font-medium transition-all duration-200">
                <span className="truncate max-w-[200px] select-all text-[#4B5563]">{shareUrl}</span>
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF0F5] via-[#FFF5F5] to-[#FEF0E8] border border-[#EA2986]/10 p-6 shadow-sm">
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 p-5 shadow-lg shadow-red-500/25">
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


function L100ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Memasuki usia 6 bulan, kebutuhan gizi bayi tidak lagi dapat dipenuhi hanya oleh ASI. Disinilah peran MPASI (Makanan Pendamping ASI) pertama sangat krusial untuk mencegah stunting dan melatih keterampilan motorik oral anak.
      </p>

      {/* Bagian 1: Jadwal Pemberian */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          📅 1. Jadwal Pemberian MPASI
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Jadwal makan sebaiknya teratur agar bayi mengenali rasa lapar dan kenyang. Berikut adalah jadwal yang disarankan untuk bayi usia 6 bulan:
        </p>

        <div className="bg-brand-soft/10 border border-brand-primary/10 rounded-2xl p-4.5 space-y-2.5 text-xs font-semibold text-base-text-primary shadow-sm">
          {[
            { time: "06.00", label: "ASI", highlight: false },
            { time: "08.00", label: "MPASI Utama Pagi (Porsi 2-3 sendok makan)", highlight: true },
            { time: "10.00", label: "Selingan buah lumat atau ASI", highlight: false },
            { time: "12.00", label: "MPASI Utama Siang", highlight: true },
            { time: "14.00", label: "ASI", highlight: false },
            { time: "16.00", label: "Selingan sore / ASI", highlight: false },
            { time: "18.00", label: "MPASI Utama Sore (opsional/bertahap)", highlight: true },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`flex justify-between border-b border-base-border/30 pb-2 last:border-0 last:pb-0
                ${item.highlight ? 'text-brand-primary font-bold' : 'text-base-text-primary font-medium'}`}
            >
              <span className="flex items-center gap-1.5">🕒 {item.time}</span>
              <span className="text-right">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Tekstur Makanan */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🥣 2. Tekstur Makanan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Untuk bayi 6 bulan, tekstur wajib berupa <strong className="text-base-text-primary">puree halus (bubur saring)</strong>. Makanan harus disaring menggunakan saringan kawat agar tidak menyisakan serat kasar yang dapat membuat bayi tersedak.
        </p>
        
        <div className="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs">
          ⚠️ "Jangan memberikan makanan yang terlalu encer. Makanan pendamping harus cukup kental sehingga tidak mudah jatuh dari sendok saat dimiringkan." — Panduan Gizi Kemenkes
        </div>
      </div>

      {/* Bagian 3: Contoh Porsi dan Kandungan Gizi */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🥗 3. Contoh Porsi dan Kandungan Gizi
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Gunakan konsep menu lengkap (mengandung karbohidrat, protein hewani, lemak, sedikit sayur/buah). Berikut adalah tabel takaran gizi harian yang direkomendasikan:
        </p>

        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="py-3 px-4">Bahan Makanan</th>
                <th className="py-3 px-4">Fungsi Utama</th>
                <th className="py-3 px-4">Porsi per Sajian</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Beras Merah/Putih", function: "Energi & Karbohidrat", portion: "1 - 1.5 sendok makan" },
                { name: "Hati Ayam / Daging Sapi", function: "Zat Besi & Protein Hewani", portion: "1 sendok makan (haluskan)" },
                { name: "Minyak Kelapa / Mentega", function: "Lemak Tambahan (Kalori)", portion: "1/2 sendok teh" },
                { name: "Bayam / Wortel", function: "Vitamin & Mineral", portion: "Seujung sendok (hanya perkenalan)" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-base-text-primary">{row.name}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium">{row.function}</td>
                  <td className="py-3 px-4 font-bold text-brand-primary">{row.portion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Gambar Content */}
      <div className="rounded-2xl overflow-hidden border border-base-border/30 shadow-sm max-w-full">
        <img 
          src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" 
          alt="MPASI Sehat Bayi 6 Bulan" 
          className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
        />
      </div>

      {/* Bagian Penutup / Kesimpulan */}
      <div className="space-y-2">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          💡 Kesimpulan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed font-medium">
          Mulailah dengan sabar dan biarkan bayi menikmati proses belajarnya. Tanda MPASI berhasil adalah ketika kenaikan berat badan bayi sesuai kurva KMS di posyandu.
        </p>
      </div>
    </div>
  );
}



function L101ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Imunisasi adalah langkah preventif paling efektif untuk melindungi anak dari penyakit menular berbahaya. Di Indonesia, Kementerian Kesehatan menetapkan jadwal imunisasi dasar wajib yang harus didapatkan lengkap sebelum anak berusia 1 tahun.
      </p>

      {/* Quote Block / Highlight */}
      <div className="p-4 bg-brand-soft/10 border-l-4 border-brand-primary rounded-r-2xl text-xs italic text-base-text-secondary leading-relaxed">
        "Mencegah jauh lebih baik, lebih murah, dan lebih aman daripada mengobati. Imunisasi lengkap melatih sistem imun anak agar siap menghadapi infeksi nyata."
      </div>

      {/* Bagian Jadwal Imunisasi */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          💉 Jadwal Imunisasi Lengkap Usia 0 - 12 Bulan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Pastikan buah hati Anda mendapatkan imunisasi berikut tepat waktu sesuai dengan bulannya:
        </p>

        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="py-3 px-4 w-1/4">Usia Anak</th>
                <th className="py-3 px-4 w-1/3">Jenis Imunisasi Wajib</th>
                <th className="py-3 px-4">Melindungi Dari Penyakit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { age: "Kurang dari 24 Jam", name: "Hepatitis B (HB-0)", protection: "Kerusakan hati (Hepatitis B)" },
                { age: "1 Bulan", name: "BCG & Polio 1", protection: "TBC (Tuberkulosis) & Kelumpuhan (Polio)" },
                { age: "2 Bulan", name: "DPT-HB-Hib 1, Polio 2, PCV 1, Rotavirus 1", protection: "Difteri, Tetanus, Pertusis, Radang Paru, Diare Akut" },
                { age: "3 Bulan", name: "DPT-HB-Hib 2, Polio 3, Rotavirus 2", protection: "Difteri, Tetanus, Batuk Rejan, Diare Rotavirus" },
                { age: "4 Bulan", name: "DPT-HB-Hib 3, Polio 4, IPV (Polio suntik), Rotavirus 3", protection: "Perlindungan ganda polio dan tetanus infeksius" },
                { age: "9 Bulan", name: "Campak-Rubella (MR) 1, PCV 3", protection: "Campak dan kecacatan janin bawaan (Rubella)" },
                { age: "12 Bulan", name: "PCV Lanjutan", protection: "Penguat kekebalan paru anak" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-base-text-primary bg-base-bg/10 text-center sm:text-left">{row.age}</td>
                  <td className="py-3 px-4 font-extrabold text-brand-primary">{row.name}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium leading-relaxed">{row.protection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Tindakan Pasca Imunisasi */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🤒 Apa yang Harus Dilakukan Setelah Imunisasi?
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Umumnya anak akan mengalami reaksi ringan atau KIPI (Kejadian Ikutan Pasca Imunisasi) seperti demam ringan atau kemerahan di bekas suntikan. Langkah penanganannya:
        </p>

        <div className="grid grid-cols-1 gap-3 text-xs font-semibold text-base-text-primary">
          {[
            { num: "1", title: "Kompres Area Suntikan", desc: "Kompres area bekas suntikan dengan kain bersih yang dibasahi air dingin secara perlahan." },
            { num: "2", title: "Optimalkan ASI harian", desc: "Berikan ASI lebih sering untuk menjaga kecukupan hidrasi cairan tubuh bayi." },
            { num: "3", title: "Pemberian Obat Penurun Panas", desc: "Berikan obat penurun panas sesuai dosis rekomendasi dokter atau bidan jika suhu tubuh anak di atas 38°C." },
          ].map((step, idx) => (
            <div key={idx} className="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4 rounded-2xl items-start shadow-xs">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-extrabold text-[11px]">
                {step.num}
              </span>
              <div>
                <h4 className="font-bold text-xs text-base-text-primary">{step.title}</h4>
                <p className="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function L102ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Kehamilan trimester pertama (usia 1-3 bulan) adalah masa pembentukan organ vital janin. Pada bulan pertama janin baru sebesar <strong className="text-base-text-primary">biji beras</strong>, dan pada bulan ketiga telah berkembang sebesar <strong className="text-base-text-primary">jeruk nipis</strong> (panjang sekitar 9 cm, berat 28 gram). Ibu disarankan melakukan periksa kehamilan minimal 6 kali oleh bidan/dokter.
      </p>

      {/* Quote Block / Kenaikan Berat Badan */}
      <div className="p-4 bg-brand-soft/10 border-l-4 border-brand-primary rounded-r-2xl text-xs italic text-base-text-secondary leading-relaxed shadow-xs">
        "Selama 9 bulan kehamilan, berat badan ibu hamil idealnya naik sebanyak 5 - 10 kg sesuai dengan status gizi ibu sebelum hamil."
      </div>

      {/* Bagian Tabel Porsi Makan */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🍽️ Panduan Porsi Makan & Minum Harian Trimester 1
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Porsi makanan harian harus padat gizi untuk mendukung pembentukan organ janin. Berikut adalah tabel porsi makan harian yang direkomendasikan:
        </p>

        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="py-3 px-4 w-1/3">Bahan Makanan</th>
                <th className="py-3 px-4 text-center w-28">12 Minggu Pertama</th>
                <th className="py-3 px-4">Keterangan per Porsi</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "Nasi atau Makanan Pokok",
                  portion: "5 Porsi",
                  desc: ["100 g atau 3/4 gelas nasi", "125 g atau 3 buah jagung sedang", "210 g atau 2 kentang sedang", "120 g atau 1/2 potong singkong", "70 g atau 3 iris roti putih", "200 g atau 2 gelas mie basah"]
                },
                {
                  name: "Protein Hewani",
                  sub: "Ikan, Telur, Ayam, dll.",
                  portion: "4 Porsi",
                  desc: ["50 g atau 1 potong sedang ikan", "55 g atau 1 butir telur Ayam"]
                },
                {
                  name: "Protein Nabati",
                  sub: "Tempe, Tahu, dll.",
                  portion: "4 Porsi",
                  desc: ["50 g atau 1 potong sedang tempe", "100 g atau 2 potong sedang tahu"]
                },
              ].map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-base-text-primary">
                    {row.name}
                    {row.sub && <small className="text-base-text-secondary block font-normal mt-0.5">({row.sub})</small>}
                  </td>
                  <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">{row.portion}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium">
                    <ul className="list-disc pl-4 space-y-1">
                      {row.desc.map((li, lIdx) => <li key={lIdx}>{li}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
              {[
                { name: "Sayur-sayuran", portion: "4 Porsi", desc: "100 g atau 1 mangkuk sayur matang tanpa kuah" },
                { name: "Buah-buahan", portion: "4 Porsi", desc: "100 g atau 1 potong sedang pisang, ATAU 100-190 g (1 potong besar) pepaya" },
                { name: "Minyak/Lemak", portion: "5 Porsi", desc: "5 g atau 1 sendok teh, bersumber dari pengolahan makanan seperti menggoreng, menumis, santan, kemiri, mentega." },
                { name: "Gula", portion: "2 Porsi", desc: "10 g atau 1 sendok makan bersumber dari kue-kue manis, minum teh manis dll." }
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-base-text-primary">{row.name}</td>
                  <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">{row.portion}</td>
                  <td className="py-3 px-4 text-base-text-secondary font-medium leading-relaxed">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Batasan Konsumsi */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          🛑 Batasan Penting Konsumsi Harian
        </h2>
        
        <div className="grid grid-cols-1 gap-3 text-xs font-semibold text-base-text-primary">
          {[
            { icon: "🧂", title: "Garam (Maksimal 1 Sendok Teh)", desc: "Batasi konsumsi garam paling banyak 1 sendok teh per hari guna mencegah risiko hipertensi kehamilan (preeklamsia)." },
            { icon: "💧", title: "Air Putih (8 - 12 Gelas)", desc: "Minum air putih minimal 8 - 12 gelas per hari untuk mencegah dehidrasi sistemik dan menjaga volume air ketuban tetap ideal." },
            { icon: "☕", title: "Batasi Kafein & Hindari Alkohol", desc: "Batasi ketat konsumsi kopi, teh harian, serta minuman bersoda. Hindari konsumsi alkohol sepenuhnya selama masa kehamilan." },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4 rounded-2xl items-start shadow-xs">
              <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div>
                <h4 className="font-bold text-xs text-base-text-primary">{item.title}</h4>
                <p className="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}








function L111ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Masa nifas (setelah melahirkan hingga 42 hari) adalah masa pemulihan penting bagi organ reproduksi dan kondisi emosional Ibu. Selama masa pemulihan ini, Ibu diwajibkan memeriksakan kesehatan minimal 4 kali guna memantau proses involusi uteri dan mencegah komplikasi pasca salin.
      </p>

      {/* Bagian Jadwal Pemeriksaan */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 flex items-center gap-2">
          📅 Jadwal Pemeriksaan Nifas (Minimal 4 Kali)
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Pastikan Ibu mendapatkan pelayanan kesehatan masa nifas (KF) secara lengkap dari tenaga kesehatan pada lini waktu berikut:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-base-text-primary">
          {[
            { kf: "KF 1", time: "6 Jam - 2 Hari", desc: "Pemeriksaan perdarahan awal, pengecekan kontraksi rahim, dan pemantauan suhu tubuh ibu." },
            { kf: "KF 2", time: "3 - 7 Hari pasca salin", desc: "Memastikan rahim mengecil dengan baik, evaluasi cairan lochia, dan konseling ASI eksklusif." },
            { kf: "KF 3", time: "8 - 28 Hari pasca salin", desc: "Pemeriksaan kondisi fisik umum ibu, penyembuhan luka jalan lahir, dan pemantauan tumbuh kembang awal bayi." },
            { kf: "KF 4", time: "29 - 42 Hari pasca salin", desc: "Evaluasi akhir pemulihan organ reproduksi harian serta perencanaan program Keluarga Berencana (KB) pasca salin." },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start shadow-xs">
              <span className="w-12 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-black text-[10px] uppercase tracking-wider">
                {item.kf}
              </span>
              <div>
                <h4 className="font-extrabold text-xs text-brand-primary">{item.time}</h4>
                <p className="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian Tanda Bahaya Masa Nifas */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 Tanda Bahaya Pada Masa Nifas
        </h2>
        <p className="text-xs text-base-text-secondary italic">* Segera bawa Ibu nifas ke fasilitas kesehatan bila mengalami salah satu gejala di bawah ini:</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "🩸", title: "Perdarahan Hebat", desc: "Perdarahan lewat jalan lahir yang keluar secara tiba-tiba dalam jumlah banyak." },
            { icon: "🐟", title: "Lochia Berbau Busuk", desc: "Cairan vagina (lochia) berbau busuk, menyengat, atau disertai nyeri perut bawah." },
            { icon: "🤒", title: "Demam Tinggi", desc: "Suhu tubuh meningkat drastis di atas 38°C, mengindikasikan adanya infeksi masa nifas." },
            { icon: "🤯", title: "Sakit Kepala / Kejang", desc: "Sakit kepala hebat berulang, pandangan kabur mendadak, atau mengalami kejang fisik." },
            { icon: "🦵", title: "Bengkak di Tangan/Wajah", desc: "Pembengkakan di tangan, wajah, atau kaki yang disertai dengan nyeri tekan hebat." },
            { icon: "🍈", title: "Payudara Bengkak & Merah", desc: "Payudara membengkak, terasa keras, memerah, nyeri, atau mengeluarkan nanah." }
          ].map((item, idx) => (
            <div key={idx} className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center space-y-2 shadow-xs hover:border-status-red-solid/40 transition-colors">
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

      {/* Banner Rujuk Darurat */}
      <div className="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start">
        <span className="text-lg">🚨</span>
        <div>
          <h4 className="font-extrabold text-sm mb-1">TINDAKAN DARURAT:</h4>
          <p className="font-medium leading-relaxed">
            Jika Ibu nifas mengalami salah satu tanda bahaya di atas, suami atau keluarga wajib segera membawa Ibu ke Bidan, Puskesmas, atau IGD Rumah Sakit terdekat demi mencegah komplikasi fatal!
          </p>
        </div>
      </div>
    </div>
  );
}

function L114ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Setelah melahirkan, perubahan hormon yang drastis dan pola tidur yang terganggu berisiko memicu gangguan kesehatan jiwa pada ibu. Selain itu, perencanaan Keluarga Berencana (KB) pasca salin penting disepakati bersama suami untuk menata kehamilan yang sehat di masa depan.
      </p>

      {/* Bagian 1: Depresi Setelah Melahirkan */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🧠 Mengenal Depresi Setelah Melahirkan (Nifas)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Baby Blues */}
          <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="font-bold text-status-purple-solid mb-1.5 flex items-center gap-1.5">
                🌸 Baby Blues Syndrome
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mb-4">
                Terjadi segera setelah melahirkan dan biasanya mereda dalam <strong className="text-base-text-primary">2 minggu</strong>. Gejala meliputi: mood tidak stabil, merasa sedih, murung secara tiba-tiba, cemas, sensitif, mudah tersinggung, dan sulit tidur.
              </p>
            </div>
            <div className="border-t border-status-purple-solid/10 pt-3">
              <h4 className="font-bold text-status-purple-solid mb-1 flex items-center gap-1.5">
                Pencegahan & Dukungan:
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
                Dibutuhkan perhatian penuh dan pembagian tugas mengasuh bayi dari <strong>suami dan keluarga</strong> agar Ibu memiliki waktu istirahat yang cukup.
              </p>
            </div>
          </div>
          
          {/* Postpartum Depression */}
          <div className="bg-status-red-light/10 border border-status-red-solid/15 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="font-bold text-status-red-solid mb-1.5 flex items-center gap-1.5">
                🚨 Depresi Pasca Melahirkan (Postpartum Depression)
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mb-4">
                Kondisi klinis yang lebih parah, terjadi dalam 2 minggu hingga beberapa bulan setelah bersalin. Gejala: sedih mendalam terus menerus, merasa tidak berguna, sulit konsentrasi, menjauh dari bayi, cemas ekstrem, hingga hilangnya minat beraktivitas.
              </p>
            </div>
            <div className="border-t border-status-red-solid/10 pt-3">
              <h4 className="font-bold text-status-red-solid mb-1 flex items-center gap-1.5">
                Penanganan Medis:
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
                Jika gejala berlangsung lebih dari 2 minggu, segera lakukan konseling ke psikolog, dokter, atau bidan posyandu untuk penanganan konseling profesional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 2: Keluarga Berencana (KB) Pasca Salin */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          👪 Keluarga Berencana (KB) Pasca Salin
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Menjarangkan kehamilan minimal 2 tahun membantu tubuh ibu pulih optimal dan memberikan waktu menyusui terbaik bagi anak. Berikut pilihan metode kontrasepsi resmi:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Jangka Panjang */}
          <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-status-green-solid mb-3 flex items-center gap-1.5">
              🔄 KB Jangka Panjang (MKJP)
            </h4>
            <ul className="list-disc pl-4 space-y-2.5 text-base-text-secondary font-medium">
              <li>
                <strong className="text-base-text-primary">IUD / Spiral / AKDR:</strong> Alat kontrasepsi dalam rahim yang efektif mencegah kehamilan hingga 10 tahun. Sangat aman bagi ibu menyusui.
              </li>
              <li>
                <strong className="text-base-text-primary">Implan / Susuk:</strong> Alat kontrasepsi di bawah kulit lengan atas yang efektif menahan kehamilan hingga 3 tahun.
              </li>
              <li>
                <strong className="text-base-text-primary">MOW / MOP:</strong> Metode kontrasepsi mantap (sterilisasi) permanen untuk pasangan yang sudah cukup anak.
              </li>
            </ul>
          </div>
          
          {/* Non Jangka Panjang */}
          <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-status-blue-solid mb-3 flex items-center gap-1.5">
              ⏳ Non Jangka Panjang
            </h4>
            <ul className="list-disc pl-4 space-y-2.5 text-base-text-secondary font-medium">
              <li>
                <strong className="text-base-text-primary">Suntik KB 3 Bulan:</strong> Mengandung hormon progestin saja sehingga aman dan tidak menghambat produksi kuantitas ASI harian. Disuntik berkala setiap 12 minggu.
              </li>
              <li>
                <strong className="text-base-text-primary">Pil KB Progestin (Minipil):</strong> Pil hormon harian khusus ibu menyusui agar tidak mengganggu kualitas ASI.
              </li>
              <li>
                <strong className="text-base-text-primary">Kondom:</strong> Metode kontrasepsi penghalang yang aman digunakan kapan saja pasca masa nifas selesai.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function L115ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Menyusui secara eksklusif selama 6 bulan pertama kehidupan bayi memberikan fondasi gizi terbaik serta melatih kekebalan tubuh bayi secara alami[cite: 2]. Ibu menyusui membutuhkan pemahaman tentang posisi, pelekatan yang benar, dan metode memerah/menyimpan ASI[cite: 2].
      </p>

      {/* Bagian 1: Manfaat Menyusui */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          ✨ Manfaat Menyusui Langsung bagi Ibu
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5 text-xs leading-relaxed shadow-xs">
          <ul className="list-disc pl-4 space-y-2.5 text-base-text-secondary font-medium">
            <li>
              <strong className="text-base-text-primary">Mencegah Kanker:</strong> Menyusui mengurangi risiko kanker payudara dan ovarium pada ibu[cite: 2].
            </li>
            <li>
              <strong className="text-base-text-primary">Pemulihan Uterus:</strong> Merangsang pelepasan hormon oksitosin untuk membantu rahim kembali ke ukuran semula dan mengurangi perdarahan[cite: 2].
            </li>
          </ul>
          <ul className="list-disc pl-4 space-y-2.5 text-base-text-secondary font-medium">
            <li>
              <strong className="text-base-text-primary">KB Alami:</strong> Menyusui eksklusif bekerja sebagai Metode Amenore Laktasi (MAL) pencegah kehamilan alami[cite: 2].
            </li>
            <li>
              <strong className="text-base-text-primary">Penurunan Berat Badan:</strong> Menyusui membakar kalori ekstra untuk mempercepat penurunan berat badan pasca melahirkan[cite: 2].
            </li>
          </ul>
        </div>
      </div>

      {/* Bagian 2: Posisi & Pelekatan */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          👶 Posisi & Pelekatan Menyusui yang Benar
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Posisi */}
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-1.5">
              1. Posisi Menyusui yang Benar
            </h4>
            <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
              <li>Kepala dan badan bayi membentuk garis lurus yang lurus.</li>
              <li>Wajah bayi menghadap payudara, hidung berhadapan dengan puting susu.</li>
              <li>Badan bayi dekat dan menempel erat ke tubuh ibu.</li>
              <li>Ibu menggendong/mendekap seluruh badan bayi secara mantap.</li>
            </ul>
          </div>

          {/* Pelekatan */}
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-1.5">
              2. Pelekatan Menyusui yang Benar
            </h4>
            <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
              <li>Bayi dekat dengan payudara dengan mulut terbuka lebar.</li>
              <li>Dagu bayi menyentuh payudara ibu.</li>
              <li>Bagian areola payudara di atas terlihat lebih banyak dibanding areola bawah.</li>
              <li>Bibir bawah bayi memutar keluar (dower / flanged).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bagian 3: Manajemen Tabel ASIP */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🌡️ Suhu & Durasi Penyimpanan ASI Perah (ASIP)
        </h2>
        
        <div className="overflow-x-auto border border-base-border/20 rounded-2xl shadow-sm bg-base-white text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base-bg/30 text-base-text-primary font-bold border-b border-base-border/10">
                <th className="p-3">Tempat Penyimpanan</th>
                <th className="p-3">Suhu</th>
                <th className="p-3">Lama Penyimpanan</th>
              </tr>
            </thead>
            <tbody className="text-base-text-secondary font-medium">
              {[
                { place: "Cooler Bag (Dengan Ice Pack)", temp: "15°C", duration: "24 Jam", color: "text-status-orange-solid" },
                { place: "Dalam Ruangan (ASIP Segar)", temp: "27°C s.d. 32°C / 25°C", duration: "4 Jam / 6-8 Jam", color: "text-status-orange-solid" },
                { place: "Kulkas Bawah / Chiller", temp: "4°C", duration: "2 - 3 Hari (48-72 jam)", color: "text-brand-primary" },
                { place: "Freezer Kulkas 1 Pintu", temp: "-15°C s.d. 0°C", duration: "2 Minggu", color: "text-brand-primary" },
                { place: "Freezer Kulkas 2 Pintu / Deep Freezer", temp: "-20°C s.d. -18°C", duration: "3 - 6 Bulan", color: "text-status-green-solid" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-base-border/5 last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="p-3 font-bold text-base-text-primary">{row.place}</td>
                  <td className="p-3 font-semibold">{row.temp}</td>
                  <td className={`p-3 font-bold ${row.color}`}>{row.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian 4: Kebutuhan Porsi Makan */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🥗 Porsi Makan & Minum Ibu Menyusui (Kebutuhan Sehari)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
          {/* Makro Pokok */}
          <div className="p-5 bg-brand-soft/10 border border-brand-primary/15 rounded-2xl space-y-3 text-base-text-primary shadow-xs">
            {[
              { label: "🍚 Nasi / Makanan Pokok", portion: "6 Porsi Sehari" },
              { label: "🍗 Protein Hewani (Ikan, Daging, Telur)", portion: "4 Porsi Sehari" },
              { label: "🥛 Protein Nabati (Tempe, Tahu)", portion: "4 Porsi Sehari" },
              { label: "🥦 Sayur-sayuran", portion: "4 Porsi Sehari" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-base-border/10 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-base-text-secondary">{item.label}</span>
                <span className="font-extrabold text-brand-primary">{item.portion}</span>
              </div>
            ))}
          </div>
          
          {/* Mikro & Hidrasi */}
          <div className="p-5 bg-brand-soft/10 border border-brand-primary/15 rounded-2xl space-y-3 text-base-text-primary shadow-xs">
            {[
              { label: "🍎 Buah-buahan", portion: "4 Porsi Sehari" },
              { label: "¼ Minyak / Lemak", portion: "6 Porsi Sehari" },
              { label: "🍬 Gula", portion: "2 Porsi Sehari" }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between border-b border-base-border/10 pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-base-text-secondary">{item.label}</span>
                <span className="font-extrabold text-brand-primary">{item.portion}</span>
              </div>
            ))}
            <div className="flex justify-between text-status-green-solid font-bold pt-0.5">
              <span>💧 Air Putih:</span>
              <span className="text-right text-[11px]">14 Gelas/Hari (0-6 bln) <br/> 12 Gelas/Hari (7-12 bln)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function L116ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Bayi baru lahir (neonatus) usia 0 hingga 28 hari berada dalam fase rentan terhadap infeksi dan penyesuaian organ fisik. Orang tua wajib memantau tanda-tanda bahaya neonatus dan memahami pertumbuhan kapasitas lambung bayi.
      </p>

      {/* Bagian 1: Ukuran Lambung Bayi */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🍒 Ukuran Lambung Bayi Baru Lahir (0 - 6 Bulan)
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Mengapa bayi menyusu sangat sering? Lambung bayi baru lahir sangat kecil dan bertumbuh bertahap:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "🔴 Hari Ke-1", title: "Seukuran Kelereng", bg: "bg-[#FFFDF6] border-status-orange-solid/20", cap: "5 - 7 ml", desc: "Bayi hanya membutuhkan sedikit cairan kolostrum." },
            { label: "🟡 Hari Ke-3", title: "Bola Pingpong", bg: "bg-[#FFFDF6] border-status-orange-solid/20", cap: "22 - 27 ml", desc: "Bayi menyusu lebih sering (10 - 12 kali)." },
            { label: "🥚 Minggu Ke-1", title: "Telur Ayam", bg: "bg-[#FFFDF6] border-status-orange-solid/20", cap: "45 - 60 ml", desc: "Bayi mulai menyusu dengan pola teratur." },
            { label: "🦆 Bulan Ke-1", title: "Telur Bebek", bg: "bg-[#FFFDF6] border-status-orange-solid/20", cap: "80 - 150 ml", desc: "Bayi sanggup menyusu lebih banyak sekali minum." }
          ].map((box, idx) => (
            <div key={idx} className={`border rounded-2xl p-4 text-center flex flex-col items-center shadow-xs ${box.bg}`}>
              <span className="font-extrabold text-xs text-base-text-primary">{box.label}</span>
              <span className="text-[10px] text-status-orange-solid bg-status-orange-light/40 px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 mb-2">
                {box.title}
              </span>
              <div className="text-xs font-bold text-brand-primary mb-1">Kapasitas: {box.cap}</div>
              <p className="text-[11px] text-base-text-secondary font-medium leading-relaxed">
                {box.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Tanda Bahaya Neonatus */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 Tanda Bahaya Pada Bayi Baru Lahir (0 - 28 Hari)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "🤒", title: "Demam / Panas Tinggi", desc: "Suhu tubuh bayi >37.5°C menandakan adanya infeksi akut harian." },
            { icon: "🥶", title: "Badan Dingin (Hipotermia)", desc: "Suhu tubuh <36°C, tubuh bayi teraba dingin, berisiko fatal jika dibiarkan." },
            { icon: "💤", title: "Bayi Lemah / Merintih", desc: "Bayi lunglai, sulit dibangunkan untuk menyusu, atau bernapas merintih terus." },
            { icon: "👃", title: "Sesak Napas", desc: "Napas bayi cepat (>60 kali/menit) atau tampak tarikan jelas dinding dada ke dalam." },
            { icon: "🔗", title: "Tali Pusat Merah/Bau", desc: "Pangkal tali pusat kemerahan meluas ke perut, basah, berbau busuk atau bernanah." },
            { icon: "🤮", title: "Muntah & Diare", desc: "Bayi memuntahkan semua isi lambung, menolak menyusu, disertai diare cair berulang." },
            { icon: "⚡", title: "Kejang-Kejang", desc: "Bayi mengalami kejang kaku, gerakan kelojotan ekstrem, atau mata mendelik ke atas." },
            { icon: "🟡", title: "Kulit & Mata Kuning", desc: "Kuning muncul pada hari pertama (<24 jam) atau warna kuning meluas hingga kaki." },
            { icon: "💩", title: "Tinja Berwarna Pucat", desc: "Kotoran bayi berwarna putih keabu-abuan atau pucat (indikasi sumbatan empedu)." }
          ].map((item, idx) => (
            <div key={idx} className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center space-y-2 shadow-xs hover:border-status-red-solid/40 transition-colors">
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

      {/* Banner Peringatan Penting */}
      <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-5 text-xs text-status-red-solid leading-relaxed font-bold shadow-xs flex gap-3 items-start">
        <span className="text-lg">⚠️</span>
        <p className="font-semibold text-status-red-solid mt-0.5">
          <strong>PENTING:</strong> Jika menemukan salah satu tanda bahaya di atas pada bayi Anda, segeralah bawa bayi ke Bidan, Puskesmas, atau Rumah Sakit terdekat untuk pertolongan medis segera.
        </p>
      </div>
    </div>
  );
}

function L117ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Perawatan bayi baru lahir usia 0-28 hari membutuhkan ketelitian ekstra dari orang tua. Beberapa aspek kritis meliputi menjaga kehangatan tubuh bayi, perawatan tali pusat agar tidak terinfeksi, serta pemantauan warna tinja guna mendeteksi penyakit serius seperti Atresia Bilier.
      </p>

      {/* Bagian 1: Menjaga Bayi Tetap Hangat */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🌡️ Cara Menjaga Bayi Tetap Hangat
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Mandi & Pakaian */}
          <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-brand-primary flex items-center gap-1.5">
              🧼 Mandi & Pakaian:
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
              <li>Mandikan bayi menggunakan air hangat minimal <strong className="text-base-text-primary">6 jam setelah lahir</strong> agar suhu tubuh stabil.</li>
              <li>Sebelum tali pusat terlepas, cukup bersihkan badan bayi dengan dilap air hangat. Jangan direndam.</li>
              <li>Setelah tali pusat lepas, bayi dapat dimandikan dengan cara terendam di bak mandi khusus.</li>
              <li>Beri pakaian bersih, selimuti dengan baik, dan pakaikan topi, kaos kaki, serta kaos tangan jika cuaca dingin.</li>
              <li>Segera ganti pakaian dan popok yang basah agar tubuh tidak kedinginan.</li>
            </ul>
          </div>
          
          {/* Perawatan Metode Kanguru */}
          <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-brand-primary flex items-center gap-1.5">
                🦘 Perawatan Metode Kanguru (PMK):
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mb-2">
                Metote ini sangat disarankan untuk bayi dengan <strong>Berat Lahir Rendah (BBLR) &lt; 2500 gram</strong> atau lahir prematur:
              </p>
            </div>
            <ul className="list-disc pl-4 space-y-2 text-[11px] text-base-text-secondary font-medium border-t border-brand-primary/10 pt-3">
              <li>Posisikan bayi di dada ibu/ayah dalam kondisi tegak tanpa pakaian (hanya memakai popok & topi), bersentuhan kulit ke kulit secara langsung (<em>skin-to-skin contact</em>).</li>
              <li>Selimuti bayi bersama ibu/ayah dengan kain panjang hangat. Suhu tubuh orang tua akan menghangatkan tubuh bayi secara konstan dan merangsang produksi ASI.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bagian 2: Perawatan Tali Pusat */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🔗 Perawatan Tali Pusat yang Benar
        </h2>
        
        <div className="p-5 bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl text-xs leading-relaxed shadow-xs space-y-3">
          <p className="text-base-text-primary font-bold">Langkah Perawatan Tali Pusat Sehat (Buku KIA Hal 46):</p>
          <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
            <li>
              <strong className="text-status-green-solid">Wajib Cuci Tangan:</strong> Selalu cuci tangan menggunakan air bersih mengalir dan sabun sebelum serta sesudah merawat tali pusat bayi.
            </li>
            <li>
              <strong className="text-status-green-solid">Rawat Terbuka & Kering:</strong> Biarkan tali pusat terbuka dan kering. Jangan dibungkus dengan kain kasa terlalu rapat.
            </li>
            <li>
              <strong className="text-status-green-solid">Tanpa Tambahan Apapun:</strong> Jangan berikan alkohol, betadine, bedak, minyak, atau ramuan dedaunan tradisional pada tali pusat karena berisiko memicu infeksi berat.
            </li>
            <li>
              <strong className="text-status-green-solid">Cara Membersihkan:</strong> Jika tali pusat kotor atau basah terkena air kencing/tinja, cuci dengan air hangat bersih dan sabun bayi secara lembut, kemudian segera keringkan dengan kasa steril atau handuk bersih hingga benar-benar kering.
            </li>
          </ul>
        </div>
      </div>

      {/* Bagian 3: Deteksi Dini Warna Tinja */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          💩 Deteksi Dini Warna Tinja Bayi (Deteksi Atresia Bilier)
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Atresia Bilier adalah penyakit sumbatan saluran empedu hati yang fatal jika terlambat dideteksi. Ibu wajib mengamati warna tinja (kotoran) bayi setiap hari hingga usia 4 bulan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          {/* Tidak Normal */}
          <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-status-red-solid flex items-center gap-1.5">
                🚨 WARNA TINJA TIDAK NORMAL (BAHAYA!):
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
                Tinja berwarna <strong className="text-status-red-solid">Putih Keabu-abuan, Dempul, atau Kuning Sangat Pucat</strong> (Nomor 1, 2, atau 3 pada kartu warna tinja Buku KIA).
              </p>
            </div>
            <div className="p-3 bg-base-white border border-status-red-solid/25 rounded-xl font-bold text-status-red-solid text-[10px] mt-2">
              ⚠️ SEGERA bawa bayi ke dokter spesialis anak atau rumah sakit terdekat apabila tinja bayi berwarna pucat!
            </div>
          </div>
          
          {/* Normal */}
          <div className="bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-status-green-solid flex items-center gap-1.5">
                ✅ WARNA TINJA NORMAL (SEHAT):
              </h4>
              <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
                Tinja berwarna <strong className="text-status-green-solid">Kuning Emas, Kuning Tua, atau Hijau Kekuningan</strong> (Warna cerah menandakan empedu mengalir dengan lancar ke usus pencernaan).
              </p>
            </div>
            <p className="text-[10px] text-base-text-secondary leading-normal font-semibold border-t border-status-green-solid/10 pt-2">
              *Catat secara berkala warna tinja bayi Anda saat berusia 2 minggu, 1 bulan, dan 2-4 bulan untuk pemantauan optimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function L118ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Fase balita usia 29 hari hingga 5 tahun merupakan masa keemasan sekaligus membutuhkan kepekaan tinggi dari orang tua terhadap tanda bahaya penyakit akut. Selain mendeteksi tanda bahaya, status gizi balita juga perlu dipantau secara mandiri menggunakan pita Lingkar Lengan Atas (LiLA).
      </p>

      {/* Bagian 1: Tanda Bahaya Balita */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 Tanda Bahaya Balita (29 Hari - 5 Tahun)
        </h2>
        <p className="text-xs text-base-text-secondary font-semibold leading-relaxed">
          Segera periksakan balita Anda ke dokter, bidan, atau puskesmas terdekat jika mendapati gejala berikut:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "🤒", title: "Demam / Panas Tinggi", desc: "Suhu tubuh panas tinggi tidak kunjung turun setelah diberi obat penurun panas secara berkala." },
            { icon: "🤮", title: "Muntah Terus-Menerus", desc: "Balita memuntahkan semua isi lambung, tidak sanggup menelan cairan atau nutrisi apa pun." },
            { icon: "💧", title: "Diare Akut", desc: "Buang air besar cair berkali-kali disertai kondisi fisik lemas atau tanda dehidrasi nyata." },
            { icon: "⚡", title: "Kejang", desc: "Kejang demam maupun kejang tanpa demam (kondisi badan kaku atau kelojotan)." },
            { icon: "👂", title: "Bengkak Belakang Telinga", desc: "Pembengkakan disertai rasa nyeri di tulang belakang daun telinga (Mastoiditis)." },
            { icon: "🩸", title: "Perdarahan Spontan", desc: "Mimisan hebat, muncul bintik-bintik merah darah di kulit, atau buang air besar berdarah." },
            { icon: "👃", title: "Sesak Napas", desc: "Tarikan dinding dada bagian bawah ke dalam yang sangat jelas terlihat saat anak bernapas." },
            { icon: "🔵", title: "Tampak Biru (Sianosis)", desc: "Area mulut, lidah, atau ujung jari tampak kebiruan akibat kekurangan suplai oksigen harian." },
            { icon: "🚰", title: "Tidak Bisa Minum", desc: "Kondisi sangat lemah sehingga menolak atau tidak sanggup meminum cairan/ASI sama sekali." }
          ].map((item, idx) => (
            <div key={idx} className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center space-y-2 shadow-xs hover:border-status-red-solid/40 transition-colors">
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

      {/* Bagian 2: Pengukuran LiLA */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          📏 Pengukuran Lingkar Lengan Atas (LiLA) Balita
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Pengukuran LiLA dilakukan pada balita usia <strong>6 - 59 bulan</strong> menggunakan pita LiLA tiga warna untuk deteksi dini stunting, gizi kurang, dan gizi buruk harian:
        </p>

        {/* Grid Interpretasi Warna LiLA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-center font-bold">
          {/* Merah */}
          <div className="bg-status-red-light/20 border border-status-red-solid/25 text-status-red-solid rounded-2xl p-4.5 flex flex-col justify-between items-center shadow-xs">
            <span className="text-[10px] uppercase bg-status-red-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">
              MERAH
            </span>
            <span className="text-base font-black block text-status-red-solid">&lt; 11.5 cm</span>
            <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-2 block">
              <strong>Gizi Buruk (Sangat Kurus)</strong>. Segera rujuk balita ke Puskesmas/Rumah Sakit untuk penanganan medis darurat.
            </span>
          </div>
          
          {/* Kuning */}
          <div className="bg-status-orange-light/20 border border-status-orange-solid/25 text-status-orange-solid rounded-2xl p-4.5 flex flex-col justify-between items-center shadow-xs">
            <span className="text-[10px] uppercase bg-status-orange-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">
              KUNING
            </span>
            <span className="text-base font-black block text-status-orange-solid">11.5 - 12.4 cm</span>
            <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-2 block">
              <strong>Gizi Kurang (Kurus)</strong>. Perlu asupan makanan tambahan (PMT) serta pemantauan intensif berkala di Posyandu.
            </span>
          </div>
          
          {/* Hijau */}
          <div className="bg-status-green-light/20 border border-status-green-solid/25 text-status-green-solid rounded-2xl p-4.5 flex flex-col justify-between items-center shadow-xs">
            <span className="text-[10px] uppercase bg-status-green-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">
              HIJAU
            </span>
            <span className="text-base font-black block text-status-green-solid">&gt;= 12.4 cm</span>
            <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-2 block">
              <strong>Gizi Baik (Normal)</strong>. Pertahankan asupan gizi seimbang harian serta pola asuh yang penuh kasih sayang.
            </span>
          </div>
        </div>
      </div>

      {/* Bagian 3: Langkah Pengukuran */}
      <div className="p-5 bg-base-white border border-base-border/25 rounded-2xl text-xs leading-relaxed space-y-3 shadow-xs">
        <p className="font-extrabold text-base-text-primary flex items-center gap-1.5">
          💡 Langkah Pengukuran LiLA yang Tepat:
        </p>
        <ol className="list-decimal pl-4 space-y-2 text-base-text-secondary font-medium">
          <li>Pengukuran dilakukan pada lengan kiri anak (atau lengan kanan jika anak kidal nyata).</li>
          <li>Tekuk lengan atas anak membentuk sudut siku sempurna 90 derajat.</li>
          <li>Ukur jarak antara pangkal bahu dan siku lengan atas, tentukan titik tengahnya secara presisi.</li>
          <li>Luruskan kembali lengan anak dan gantung secara santai/rileks di samping tubuh.</li>
          <li>Lingkarkan pita LiLA tepat di titik tengah lengan yang telah ditentukan tadi secara pas (tidak terlalu ketat dan tidak terlalu longgar).</li>
          <li>Baca angka hasil pengukuran serta warna pita yang ditunjukkan oleh panah indikator pita LiLA kader.</li>
        </ol>
      </div>
    </div>
  );
}

function L119ArticleContent() {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: 1, text: "Bayi bisa mengangkat kepala mandiri hingga 45 derajat?", checked: false },
    { id: 2, text: "Bayi menggunakan kepala dan lengan ke depan saat diletakkan tengkurap?", checked: false },
    { id: 3, text: "Bayi bisa melihat dan menoleh ke arah wajah Anda?", checked: false },
    { id: 4, text: "Bayi bisa melepas genggaman atau meraih dan menggenggam benda kecil?", checked: false },
    { id: 5, text: "Bayi suka tertawa keras?", checked: false },
    { id: 6, text: "Bayi bereaksi terhadap suara keras (terkejut atau menoleh)?", checked: false },
    { id: 7, text: "Bayi membalas tersenyum ketika diajak bicara atau tersenyum padanya?", checked: false },
    { id: 8, text: "Bayi menyerap perhatian Anda dengan penglihatan, pendengaran, dan sentuhan?", checked: false }
  ]);

  const handleCheckboxChange = (id: number) => {
    setMilestones(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Memasuki usia 29 hari hingga 3 bulan, bayi mulai menunjukkan respons sosial dan berkembang pesat secara motorik. Kunjungan posyandu setiap bulan, stimulasi bermain yang tepat, dan imunisasi tepat waktu adalah kunci tumbuh kembang optimal di fase ini.
      </p>

      {/* Bagian 1: Pelayanan Kesehatan Rutin */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🏥 Pelayanan Kesehatan Rutin
        </h2>
        <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 text-xs leading-relaxed space-y-2.5 shadow-xs">
          <p className="font-bold text-brand-primary">Bawa bayi ke Posyandu/Puskesmas setiap bulan untuk:</p>
          <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
            <li>
              <strong className="text-base-text-primary">Pemantauan pertumbuhan dan perkembangan:</strong> Pengukuran berkala berat badan, panjang badan, serta lingkar kepala anak.
            </li>
            <li>
              <strong className="text-base-text-primary">Kelas Ibu Balita:</strong> Dihadiri oleh orang tua/keluarga untuk mendapatkan informasi bimbingan seputar perawatan harian bayi.
            </li>
            <li>
              <strong className="text-base-text-primary">Imunisasi Wajib:</strong> Pemberian vaksin pelindung sesuai jadwal panduan resmi Buku KIA.
            </li>
          </ul>
        </div>
      </div>

      {/* Bagian 2: Jadwal Imunisasi */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          💉 Jadwal Imunisasi Usia 29 Hari – 3 Bulan
        </h2>
        
        <div className="overflow-x-auto rounded-xl border border-base-border/20 shadow-sm bg-base-white">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-brand-soft/10 text-brand-primary font-bold border-b border-base-border/10">
                <th className="p-3 text-left w-1/3">Vaksin</th>
                <th className="p-3 text-left">Tujuan Perlindungan Medis</th>
              </tr>
            </thead>
            <tbody className="text-base-text-secondary font-medium">
              {[
                { name: "BCG", desc: "Mencegah penularan penyakit infeksi tuberkulosis (TBC) paru parah." },
                { name: "Polio Drops (Tetes)", desc: "Mencegah infeksi virus polio yang berisiko menyebabkan kelumpuhan saraf kaki permanen." },
                { name: "DPT-HB-Hib 1 & 2", desc: "Mencegah infeksi difteri, batuk rejan (pertusis), tetanus, penyakit hepatitis B, serta radang selaput otak (meningitis)." },
                { name: "IPV (atau Rotavirus)", desc: "Mencegah infeksi virus rotavirus merusak usus yang memicu diare akut parah dan dehidrasi tubuh janin." }
              ].map((row, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-base-bg/30 transition-colors">
                  <td className="p-3 font-bold text-base-text-primary bg-base-bg/5">{row.name}</td>
                  <td className="p-3 leading-relaxed">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian 3: Stimulasi Tumbuh Kembang */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🎈 Stimulasi Tumbuh Kembang (29 Hari – 3 Bulan)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          {/* Emosi */}
          <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-4.5 space-y-2 shadow-xs">
            <h4 className="font-bold text-status-green-solid flex items-center gap-1">💞 Stimulasi Emosi & Kasih Sayang:</h4>
            <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
              <li>Peluk, cium, dan ayun tubuh bayi dengan lembut penuh kehangatan keluarga.</li>
              <li>Senyum, jaga tatapan mata, dan ajak bicara bayi sesering mungkin.</li>
              <li>Bayi belajar menyerap lingkungan sekitar melalui indra <strong>penglihatan, pendengaran, dan sentuhan</strong>.</li>
            </ul>
          </div>
          
          {/* Motorik */}
          <div className="bg-status-blue-light/20 border border-status-blue-solid/15 rounded-2xl p-4.5 space-y-2 shadow-xs">
            <h4 className="font-bold text-status-blue-solid flex items-center gap-1">🧸 Stimulasi Motorik & Sensorik:</h4>
            <ul className="list-disc pl-4 space-y-1 text-base-text-secondary font-medium">
              <li>Tunjukkan objek mainan berwarna cerah kontras untuk melatih fokus saraf mata.</li>
              <li>Perdengarkan alunan suara musik dan nyanyian lembut dari orang tua.</li>
              <li>Bantu latih tangan bayi untuk <strong>meraih, meraba, dan memegang benda kecil</strong>.</li>
              <li>Latih kekuatan otot leher lewat posisi tengkurap (<em>tummy time</em>) berkala.</li>
              <li>Gulingkan tubuh bayi perlahan kanan-kiri melatih fleksibilitas otot badan.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bagian 4: Penanda Perkembangan (Interactive Checkboxes) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-status-orange-solid border-b pb-2 flex items-center gap-2">
          ✅ Penanda Perkembangan Bayi Usia 29 Hari – 3 Bulan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed font-semibold">
          Beri tanda ✓ jika bayi SUDAH bisa melakukan hal berikut. Jika ada yang belum, segera konsultasikan ke Bidan atau Puskesmas. (Buku KIA Hal 53)
        </p>
        
        <div className="space-y-2">
          {milestones.map((item: MilestoneItem, i: number) => (
            <div 
              key={item.id} 
              onClick={() => handleCheckboxChange(item.id)}
              className={`flex items-start gap-3 p-3 bg-base-white border rounded-xl text-xs cursor-pointer transition-all select-none
                ${item.checked ? 'border-status-orange-solid bg-status-orange-light/5' : 'border-base-border/20 hover:border-base-border/40'}`}
            >
              {/* Checkbox */}
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  readOnly 
                  className="w-4 h-4 text-status-orange-solid bg-base-white border-base-border rounded focus:ring-status-orange-solid accent-status-orange-solid cursor-pointer" 
                />
              </div>

              {/* Nomor Urut */}
              <span className={`w-5 h-5 shrink-0 rounded-full font-extrabold flex items-center justify-center text-[10px] mt-0.5
                ${item.checked ? 'bg-status-orange-solid text-base-white' : 'bg-status-orange-light/40 text-status-orange-solid'}`}>
                {i + 1}
              </span>

              {/* Teks Deskripsi */}
              <span className={`font-medium leading-relaxed mt-0.5 transition-colors
                ${item.checked ? 'text-status-orange-solid font-semibold' : 'text-base-text-secondary'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Banner Notifikasi Bahaya */}
        <div className="p-4 bg-status-orange-light/10 border border-status-orange-solid/20 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs">
          ⚠️ Jika bayi BELUM bisa melakukan salah satu hal di atas, segera bawa ke Bidan/Puskesmas untuk evaluasi tumbuh kembang lebih lanjut.
        </div>
      </div>
    </div>
  );
}

function L210ArticleContent() {
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { id: 1, text: "Bayi berguling dari posisi telungkup ke telentang?", checked: false },
    { id: 2, text: "Bayi mengangkat kepala secara mandiri hingga tegak 90°?", checked: false },
    { id: 3, text: "Bayi bisa mempertahankan posisi kepala tetap tegak dan stabil?", checked: false },
    { id: 4, text: "Bayi menggenggam mainan kecil atau benda berbentuk dengan tangannya?", checked: false },
    { id: 5, text: "Bayi bisa melihat dan meraih benda yang ada dalam jangkauannya?", checked: false },
    { id: 6, text: "Bayi bisa menggerakkan benda atau mainan yang ada di tangannya sendiri?", checked: false },
    { id: 7, text: "Bayi berusaha memperluas pandangannya untuk mengamati lingkungan?", checked: false },
    { id: 8, text: "Bayi menghasilkan suara berceloteh atau bergumam (mengoceh)?", checked: false },
    { id: 9, text: "Bayi mengeluarkan suara tawa atau bereaksi gembira saat diajak bermain?", checked: false },
    { id: 10, text: "Bayi tersenyum ketika melihat wajah orang yang dikenal atau saat bermain sendiri?", checked: false }
  ]);

  const handleCheckboxChange = (id: number) => {
    setMilestones(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Judul Bagian */}
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-status-orange-solid border-b pb-2 flex items-center gap-1.5">
          ✅ Penanda Perkembangan Bayi Usia 3 – 6 Bulan
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed font-semibold pt-1">
          Beri tanda ✓ jika bayi SUDAH bisa melakukan hal berikut. Jika ada yang belum, segera konsultasikan ke Bidan atau Puskesmas. (Buku KIA Hal 55)
        </p>
      </div>

      {/* Daftar Item Checklist */}
      <div className="space-y-2">
        {milestones.map((item: MilestoneItem, i: number) => (
          <div 
            key={item.id} 
            onClick={() => handleCheckboxChange(item.id)}
            className={`flex items-start gap-3 p-3 bg-base-white border rounded-xl text-xs cursor-pointer transition-all select-none
              ${item.checked ? 'border-status-orange-solid bg-status-orange-light/5' : 'border-base-border/20 hover:border-base-border/40'}`}
          >
            {/* Checkbox */}
            <div className="flex items-center h-5 mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                checked={item.checked} 
                readOnly 
                className="w-4 h-4 text-status-orange-solid bg-base-white border-base-border rounded focus:ring-status-orange-solid accent-status-orange-solid cursor-pointer" 
              />
            </div>

            {/* Nomor Urut Indikator */}
            <span className={`w-5 h-5 shrink-0 rounded-full font-extrabold flex items-center justify-center text-[10px] mt-0.5
              ${item.checked ? 'bg-status-orange-solid text-base-white' : 'bg-status-orange-light/40 text-status-orange-solid'}`}>
              {i + 1}
            </span>

            {/* Teks Pertanyaan Milestone */}
            <span className={`font-medium leading-relaxed mt-0.5 transition-colors
              ${item.checked ? 'text-status-orange-solid font-semibold' : 'text-base-text-secondary'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* Catatan / Peringatan Evaluasi */}
      <div className="p-4 bg-status-orange-light/10 border border-status-orange-solid/20 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs">
        ⚠️ Jika bayi BELUM bisa melakukan salah satu hal di atas, segera bawa ke Bidan/Puskesmas untuk evaluasi tumbuh kembang lebih lanjut.
      </div>
    </div>
  );
}

function L211ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Pengantar */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Di usia 6-12 bulan, bayi berkembang semakin pesat secara fisik dan mental. Kebutuhan gizi bayi tidak lagi dapat dipenuhi hanya oleh ASI, sehingga membutuhkan pemenuhan gizi lengkap yang kaya protein hewani untuk mencegah stunting dan mendukung anak tumbuh cerdas.
      </p>

      {/* Banner Bahaya Stunting */}
      <div className="p-4 bg-status-orange-light/20 border border-status-orange-solid/25 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs flex items-center gap-2">
        <span>⚠️</span>
        <p>
          <strong>Awas Bahaya Stunting!</strong> Kekurangan gizi pada fase ini dapat menyebabkan gagal pertumbuhan fisik dan performa otak anak menjadi kurang cerdas saat dewasa.
        </p>
      </div>

      {/* Bagian 1: Karakteristik 4 Syarat Utama MPASI */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🥣 4 Syarat Utama Pemenuhan MPASI (Usia 6 - 24 Bulan)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-4.5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-1">1. Tepat Waktu</h4>
            <p className="text-base-text-secondary font-medium">MPASI diberikan saat ASI saja sudah tidak dapat memenuhi kebutuhan gizi bayi. Diberikan mulai tepat usia 6 bulan.</p>
          </div>
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-4.5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-1">2. Cukup (Adekuat)</h4>
            <p className="text-base-text-secondary font-medium">MPASI mempertimbangkan jumlah, frekuensi, konsistensi/tekstur, dan variasi makanan yang mengandung karbohidrat, protein hewani (prioritas), protein nabati, dan lemak tambahan.</p>
          </div>
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-4.5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-1">3. Aman</h4>
            <p className="text-base-text-secondary font-medium">Memperhatikan kebersihan bahan makanan, peralatan memasak, serta wajib mencuci tangan bersih sebelum menyiapkan makanan anak.</p>
          </div>
          <div className="bg-base-white border border-base-border/25 rounded-2xl p-4.5 shadow-xs">
            <h4 className="font-bold text-brand-primary mb-1">4. Diberikan dengan Cara Benar</h4>
            <p className="text-base-text-secondary font-medium">Diberikan secara teratur (pagi, siang, sore, selingan), lama makan maksimal 30 menit, ciptakan lingkungan netral (tanpa TV/gadget), dan ajari anak makan mandiri.</p>
          </div>
        </div>
      </div>

      {/* Bagian 2: 8 Kelompok Bahan Makanan Utama MPASI */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🥦 8 Kelompok Bahan Makanan Utama MPASI
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { id: "1", title: "Air Susu Ibu (ASI)", icon: "🤱" },
            { id: "2", title: "Makanan Pokok (Beras, Jagung, Ubi)", icon: "🌾" },
            { id: "3", title: "Kacang-kacangan (Tempe, Tahu)", icon: "🫘" },
            { id: "4", title: "Susu Hewani & Turunannya", icon: "🥛" },
            { id: "5", title: "Daging-dagingan (Ikan, Daging, Ayam)", icon: "🐟" },
            { id: "6", title: "Telur", icon: "🥚" },
            { id: "7", title: "Buah & Sayur Kaya Vit A", icon: "🥕" },
            { id: "8", title: "Buah & Sayuran Lainnya", icon: "🥑" },
          ].map((item) => (
            <div key={item.id} className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-3 shadow-xs">
              <span className="text-2xl block mb-1">{item.icon}</span>
              <span className="text-[10px] bg-status-purple-solid text-white px-1.5 py-0.5 rounded-full font-extrabold block w-fit mx-auto mb-1">{item.id}</span>
              <h5 className="font-bold text-[11px] text-base-text-primary leading-tight">{item.title}</h5>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 3: Pembagian Tekstur dan Porsi Usia Berkala */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          📊 Panduan Tekstur dan Porsi Makan Berkala
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* 6-8 Bulan */}
          <div className="border border-base-border/30 rounded-2xl p-4 bg-base-white shadow-xs">
            <span className="text-[10px] uppercase bg-status-green-solid text-white px-2 py-0.5 rounded-full font-bold">6 - 8 Bulan</span>
            <h4 className="font-bold text-base-text-primary mt-2 mb-1">Tekstur: DISARING</h4>
            <p className="text-base-text-secondary mb-3 font-medium">Makanan dilumatkan dan disaring halus. Konsistensi kental (tidak mudah jatuh dari sendok).</p>
            <div className="text-[11px] font-semibold text-status-green-solid border-t pt-2">
              ⏱️ 2-3 kali makanan utama + 1-2 kali selingan.<br/>
              🍚 Porsi: Mulai 2-3 sendok makan hingga 1/2 mangkuk (125 ml).
            </div>
          </div>
          {/* 9-11 Bulan */}
          <div className="border border-base-border/30 rounded-2xl p-4 bg-base-white shadow-xs">
            <span className="text-[10px] uppercase bg-status-blue-solid text-white px-2 py-0.5 rounded-full font-bold">9 - 11 Bulan</span>
            <h4 className="font-bold text-base-text-primary mt-2 mb-1">Tekstur: DICINCANG</h4>
            <p className="text-base-text-secondary mb-3 font-medium">Makanan dicincang halus, cincang kasar, atau makanan siap genggang (finger food).</p>
            <div className="text-[11px] font-semibold text-status-blue-solid border-t pt-2">
              ⏱️ 3-4 kali makanan utama + 1-2 kali selingan.<br/>
              🍚 Porsi: 1/2 hingga 3/4 mangkuk ukuran 250 ml.
            </div>
          </div>
          {/* 12-23 Bulan */}
          <div className="border border-base-border/30 rounded-2xl p-4 bg-base-white shadow-xs">
            <span className="text-[10px] uppercase bg-status-purple-solid text-white px-2 py-0.5 rounded-full font-bold">12 - 23 Bulan</span>
            <h4 className="font-bold text-base-text-primary mt-2 mb-1">Tekstur: MASAK BIASA</h4>
            <p className="text-base-text-secondary mb-3 font-medium">Makanan keluarga yang dihaluskan seperlunya atau dipotong kecil jika dirasa perlu.</p>
            <div className="text-[11px] font-semibold text-status-purple-solid border-t pt-2">
              ⏱️ 3-4 kali makanan utama + 1-2 kali selingan.<br/>
              🍚 Porsi: 3/4 hingga 1 mangkuk penuh ukuran 250 ml.
            </div>
          </div>
        </div>
      </div>

      {/* Bagian 4: Menu dan Resep Resmi Kemenkes */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🍳 Menu Masak &amp; Resep Resmi MPASI KIA (Untuk 3 Porsi)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {/* Resep 6-8 Bulan */}
          <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-brand-primary text-sm mb-2">🥣 Bubur Sup Daging Kacang Merah (6-8 Bulan)</h4>
            <div className="space-y-1 text-base-text-secondary font-medium mb-3">
              <p><strong>Bahan:</strong> 50g nasi, 30g daging ayam cincang, 25g telur ayam, 10g kacang merah, 10g wortel, 10g tomat, bumbu halus (bawang merah &amp; putih), 300ml kaldu ayam, 5g minyak.</p>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-base-text-secondary font-medium border-t border-brand-primary/10 pt-2">
              <li>Didihkan air kaldu ayam, masukkan kacang merah dan daging sampai empuk.</li>
              <li>Tumis bumbu halus sampai harum, masukkan ke dalam air kaldu masakan.</li>
              <li>Masukkan nasi, buncis, wortel. Tambahkan kocokan telur, aduk rata hingga matang.</li>
              <li>Haluskan bubur disaring dengan saringan kawat hingga mencapai tekstur lumat kental.</li>
            </ol>
          </div>
          {/* Resep 9-12 Bulan */}
          <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 shadow-xs">
            <h4 className="font-bold text-brand-primary text-sm mb-2">🍛 Nasi Tim Ikan Kembung Telur Puyuh (9-12 Bulan)</h4>
            <div className="space-y-1 text-base-text-secondary font-medium mb-3">
              <p><strong>Bahan:</strong> 75g nasi, 30g ikan kembung (ambil dagingnya), 30g telur puyuh, 15g wortel, 10g tomat, bumbu halus, 75ml kaldu ayam, 7.5g minyak kelapa, buah semangka (selingan).</p>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-base-text-secondary font-medium border-t border-brand-primary/10 pt-2">
              <li>Masukkan nasi, daging ikan kembung, telur puyuh, dan minyak kelapa ke dalam mangkok tim.</li>
              <li>Tambahkan air kaldu ayam secukupnya.</li>
              <li>Masukkan parutan wortel dan tomat, tim hingga matang sempurna.</li>
              <li>Angkat dan sajikan hangat bersama potongan buah semangka secara terpisah.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function L212ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* PENGANTAR & HIGHLIGHT */}
      <div className="bg-brand-soft/10 border-l-4 border-brand-primary p-4 rounded-r-2xl">
        <h3 className="text-base font-extrabold text-brand-primary">6 - 12 Bulan: Cegah Stunting dengan MPASI Kaya Protein Hewani</h3>
        <p className="text-xs text-base-text-secondary mt-1 leading-relaxed">
          Di usia 6-12 bulan, bayi berkembang semakin pesat secara fisik dan mental, sehingga membutuhkan gizi lengkap terutama yang kaya protein hewani.
        </p>
      </div>

      {/* BANNER UTAMA */}
      <div className="p-4 bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl text-xs text-status-red-solid font-bold leading-relaxed shadow-xs flex items-center gap-2">
        <span>⚠️</span>
        <p>Awas bahaya stunting, karena dapat menyebabkan gagal pertumbuhan dan anak menjadi kurang cerdas.</p>
      </div>

      {/* SECTION 1: POLA PERKEMBANGAN & PERAWATAN ASUH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* YANG AKAN DIALAMI */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm">
          <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider mb-2.5 flex items-center gap-1.5">👶 Yang Akan Dialami</h4>
          <ul className="list-disc pl-4 space-y-2 text-[11px] text-base-text-secondary font-medium leading-relaxed">
            <li>Bayi mendapatkan pengalaman makan pertama kalinya dan beradaptasi dengan berbagai tekstur makanan sesuai usia.</li>
            <li>Bayi mulai tumbuh gigi disertai diare dan demam.</li>
            <li>Bayi mulai berbalik dari posisi telentang ke telungkup atau tengkurap dan menjaga kepala tetap tegak.</li>
            <li>Meraih benda di sekitarnya, menirukan bunyi, dan tersenyum melihat hal-hal yang menarik.</li>
            <li>Bayi menjelajah lingkungannya dengan merangkak di usia 8-9 bulan.</li>
          </ul>
        </div>

        {/* YANG HARUS DILAKUKAN */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm md:col-span-2">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider mb-2.5 flex items-center gap-1.5">✅ Yang Harus Dilakukan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-base-text-secondary font-medium leading-relaxed">
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Berikan MPASI yang kaya protein hewani.</li>
              <li>Latih bayi menyenangi suasana makan dan ibu perlu peka terhadap respons bayi.</li>
              <li>Berikan ASI hingga usia 2 tahun atau lebih.</li>
              <li>Cek perkembangan bayi tiap bulan di Posyandu atau fasilitas pelayanan kesehatan.</li>
              <li>Pastikan bayi mendapat vitamin A kapsul biru 1 kali setahun untuk daya tahan tubuhnya.</li>
              <li>Dapatkan Pemeriksaan Kesehatan Anak Terintegrasi (PKAT) di usia 6-7 bulan.</li>
              <li>Dapatkan imunisasi dasar lengkap sesuai usia (lihat halaman 124).</li>
            </ul>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Ajari bayi makan sendiri dengan sendok dan minum sendiri dengan gelas.</li>
              <li>Ajari bayi duduk, memegang benda kecil dengan 2 jari, serta berdiri dan berjalan dengan berpegangan.</li>
              <li>Ajak bayi main Cilukba dan bicara sesering mungkin.</li>
              <li>Cek kesehatan bayi dan kenali tanda bahaya. Segera ke fasilitas kesehatan jika bayi sakit atau mengalami tanda bahaya.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MENGAPA HARUS DILAKUKAN */}
      <div className="bg-status-purple-light/20 border border-status-purple-solid/20 rounded-xl p-4 text-xs font-semibold text-base-text-primary">
        <h4 className="font-extrabold text-xs text-status-purple-solid mb-1.5">💡 Mengapa Harus Dilakukan?</h4>
        <ul className="list-disc pl-4 space-y-1 text-base-text-secondary">
          <li>Meningkatkan sistem imun, mencegah stunting, dan menangkal komplikasi penyakit infeksi kronis.</li>
          <li>Memastikan anak bisa bicara bahasa dengan lancar, bersosialisasi aktif dengan lingkungan, serta mandiri.</li>
        </ul>
      </div>

      {/* SECTION 2: PRINSIP NUTRISI & KELOMPOK MAKANAN */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">🥦 8 Kelompok Bahan Makanan Utama MPASI Usia 6-12 Bulan</h2>
        <p className="text-xs text-base-text-secondary font-medium leading-relaxed">
          Di usia 6 hingga 12 bulan, makanan yang diberikan pada bayi harus mengandung sumber gizi lengkap yang dibutuhkan untuk tumbuh kembang terbaik. Perkenalkan makanan satu per satu sambil memperhatikan apakah anak memiliki alergi terhadap makanan tertentu. Pastikan cara memasak makanan direbus atau dikukus, serta hindari makanan yang digoreng, mengandung bahan pengawat, dan tinggi gula dan garam.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-bold">
          {[
            { id: 1, text: "Air Susu Ibu (ASI)", emoji: "🤱" },
            { id: 2, text: "Makanan Pokok", emoji: "🍚" },
            { id: 3, text: "Kacang-kacangan", emoji: "🫘" },
            { id: 4, text: "Susu Hewani & Produk Turunannya", emoji: "🥛" },
            { id: 5, text: "Daging-dagingan", emoji: "🐟" },
            { id: 6, text: "Telur", emoji: "🥚" },
            { id: 7, text: "Buah & Sayuran Kaya Vitamin A", emoji: "🥕" },
            { id: 8, text: "Buah & Sayuran Lainnya", emoji: "🥑" }
          ].map((item) => (
            <div key={item.id} className="bg-base-bg/30 border border-base-border/30 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-xl mb-1">{item.emoji}</span>
              <span className="text-[9px] bg-brand-primary text-white font-extrabold px-1.5 py-0.2 rounded-full mb-1">{item.id}</span>
              <span className="text-[10px] text-base-text-primary font-semibold leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium bg-base-bg/20 p-3 rounded-xl italic">
          * Catatan Tekstur: Ibu bisa memulai dengan makanan bertekstur lunak dan lembut, seperti bubur pisang campur apel dan pir, bubur sup daging kacang merah atau puding kentang ayam dan telur. Kemudian, lanjutkan dengan makanan yang bertekstur lebih kasar tapi tetap lembut di usia 9-11 bulan, seperti sup daging cincang, nasi tim ikan kembung telur puyuh, dan tim bubur manado daging dan udang.
        </p>
      </div>

      {/* SECTION 3: MPASI DARI MAKANAN KELUARGA (MATANG) & BAHAN MENTAH */}
      <div className="space-y-4 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">🍳 Rekomendasi Menu Gizi Seimbang Usia 6 - 24 Bulan</h2>
        
        {/* TABEL PERBANDINGAN FORMULA MASAK */}
        <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white shadow-sm text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-base-bg text-base-text-primary border-b font-bold">
                <th className="p-3 w-1/4">Kategori Usia</th>
                <th className="p-3 w-1/3">Metode 1: Dari Makanan Keluarga (Matang)</th>
                <th className="p-3 w-1/3">Metode 2: Dari Bahan Mentah</th>
              </tr>
            </thead>
            <tbody className="text-base-text-secondary font-medium leading-relaxed align-top">
              
              {/* 6-8 BULAN */}
              <tr className="border-b hover:bg-base-bg/10 transition-colors">
                <td className="p-3 font-bold text-status-green-solid bg-status-green-light/10 text-center">Bayi 6 - 8 Bulan (Tekstur Disaring)</td>
                <td className="p-3 space-y-1">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Nasi putih 30 g, Dadar telur 35 g, Sayur kare wortel tempe 20 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                    <li>Nasi, telur dadar, tempe dan wortel (dari sayur kare) dilumatkan kemudian disaring.</li>
                    <li>Ditambahkan kuah sayur (santan kare) sampai mendapatkan konsistensi bubur kental.</li>
                    <li>Sajikan harian.</li>
                  </ol>
                </td>
                <td className="p-3 space-y-1 border-l">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Beras putih 10 g, Telur ayam 30 g, Tempe kedelai 10 g, Wortel 10 g, Santan 30 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                    <li>Memasak beras, tambahkan santan dan bumbu yang telah ditumis dengan sedikit minyak (bawang merah, daun salam, kunyit).</li>
                    <li>Setelah nasi masak, masukkan telur yang telah dikocok lepas, tempe dan wortel yang telah dicincang.</li>
                    <li>Aduk sampai mendapatkan konsistensi bubur kental lalu sajikan harian.</li>
                  </ol>
                </td>
              </tr>

              {/* 9-11 BULAN */}
              <tr className="border-b hover:bg-base-bg/10 transition-colors">
                <td className="p-3 font-bold text-status-blue-solid bg-status-blue-light/10 text-center">Bayi 9 - 11 Bulan (Tekstur Dicincang)</td>
                <td className="p-3 space-y-1">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Nasi putih 45 g, Ikan kembung bumbu kuning 30 g, Tumis buncis 25 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                    <li>Nasi, ikan kembung bumbu kuning dan tumis buncis dicincang.</li>
                    <li>Sajikan dengan kuah sayur (santan kare).</li>
                  </ol>
                </td>
                <td className="p-3 space-y-1 border-l">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Beras putih 15 g, Ikan kembung 30 g, Minyak kelapa 10 g, Wortel 15 g, Tempe 10 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                    <li>Memasak beras, tambahkan bumbu yg telah ditumis (bawang merah, daun salam, kunyit) dengan minyak kelapa.</li>
                    <li>Setelah nasi masak, masukkan ikan kembung dan buncis yang telah dicincang.</li>
                    <li>Aduk sampai mendapatkan konsistensi bubur kasar/cincang.</li>
                    <li>Sajikan harian.</li>
                  </ol>
                </td>
              </tr>

              {/* 12-23 BULAN */}
              <tr className="hover:bg-base-bg/10 transition-colors">
                <td className="p-3 font-bold text-status-purple-solid bg-status-purple-light/10 text-center">Bayi 12 - 23 Bulan (Makanan Biasa)</td>
                <td className="p-3 space-y-1">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Nasi putih 55 g, Semur hati ayam 45 g, Bening/bobor bayam 20 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <p className="text-[11px]">MPASI untuk anak 12-23 bulan disajikan dalam bentuk makanan keluarga (dicincang gak besar jika diperlukan).</p>
                </td>
                <td className="p-3 space-y-1 border-l">
                  <p className="font-bold text-base-text-primary">Bahan:</p>
                  <p>Beras putih 25 g, Hati ayam 50 g, Minyak kelapa 5 g, Bayam 20 g, Santan 50 g.</p>
                  <p className="font-bold text-base-text-primary pt-1">Cara Membuat:</p>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                    <li>Memasak beras sampai menjadi nasi.</li>
                    <li>Membuat hati ayam goreng (goreng/tumis hati ayam dengan minyak kelapa).</li>
                    <li>Membuat sayur bayam.</li>
                    <li>Sajikan harian bersama-sama.</li>
                  </ol>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* BENTO CARD: MENU SELINGAN */}
      <div className="bg-brand-soft/20 border border-brand-primary/20 rounded-2xl p-5 text-xs">
        <h4 className="font-bold text-brand-primary text-sm mb-2">🥔 Contoh Makanan Selingan: Perkedel Kentang Isi Daging</h4>
        <p className="text-base-text-secondary mb-3 font-medium">Takaran porsi pembuatan formula selingan padat gizi harian:</p>
        <div className="flex flex-wrap items-center gap-3 font-bold text-center text-base-text-primary">
          <div className="bg-base-white px-4 py-2 border rounded-xl shadow-xs">🥔 Kentang <br/> <span className="text-brand-primary">25 g</span></div>
          <span className="text-lg">+</span>
          <div className="bg-base-white px-4 py-2 border rounded-xl shadow-xs">🥩 Daging Giling <br/> <span className="text-brand-primary">5 g</span></div>
          <span className="text-lg">+</span>
          <div className="bg-base-white px-4 py-2 border rounded-xl shadow-xs">🥣 Minyak <br/> <span className="text-brand-primary">5 g</span></div>
          <span className="text-lg">+</span>
          <div className="bg-base-white px-4 py-2 border rounded-xl shadow-xs">🥚 Telur Ayam <br/> <span className="text-brand-primary">5 g</span></div>
          <span className="text-lg">➡️</span>
          <div className="bg-brand-primary text-white px-5 py-3.5 rounded-xl shadow-sm font-extrabold flex items-center justify-center">Olah &amp; Goreng Perkedel Sehat</div>
        </div>
      </div>

      {/* SECTION 4: FORMULA DETAILED RESEP PORSI MASAK BESAR */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">📑 Detail Komposisi Formula Resep (Untuk 3 Porsi)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Bubur Sup Daging Kacang Merah */}
          <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-brand-primary text-sm border-b pb-1.5">🥣 Bubur Sup Daging Kacang Merah (6-8 Bulan)</h4>
              <div className="grid grid-cols-2 gap-2 pt-2 leading-relaxed text-base-text-secondary font-medium">
                <div>
                  <p className="font-bold text-base-text-primary">Bahan Baku:</p>
                  <p>&bull; 50 g (6 sdm) nasi</p>
                  <p>&bull; 30 g (3 sdm) daging ayam cincang</p>
                  <p>&bull; 25 g (1/2 butir) telur ayam</p>
                  <p>&bull; 10 g (1 sdm) buncis</p>
                  <p>&bull; 10 g (1 sdm) wortel</p>
                  <p>&bull; 10 g (1 sdm) kacang merah</p>
                  <p>&bull; 10 g (1 batang) bawang daun, bawang bombay, seledri</p>
                  <p>&bull; 300 ml kaldu ayam</p>
                  <p>&bull; 2.5 g (1/2 sdt) minyak untuk menumis</p>
                </div>
                <div>
                  <p className="font-bold text-base-text-primary">Bumbu Halus:</p>
                  <p>&bull; 2 siung bawang merah</p>
                  <p>&bull; 2 siung bawang putih</p>
                  <p className="font-bold text-base-text-primary pt-2">Buah Selingan:</p>
                  <p>&bull; 100 g (2 buah) jeruk, diambil sarinya</p>
                </div>
              </div>
            </div>
            <div className="border-t border-base-border/20 pt-3">
              <p className="font-bold text-base-text-primary mb-1">Cara Memasak:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-base-text-secondary font-medium">
                <li>Didihkan air kaldu ayam, masukkan kacang merah dan daging sampai empuk.</li>
                <li>Tumis bumbu halus sampai harum, masukkan daging ayam cincang, lalu masak sampai berubah warna.</li>
                <li>Masukkan tumisan daging ayam ke dalam air kaldu, masak sampai daging empuk.</li>
                <li>Masukkan nasi, buncis, dan wortel.</li>
                <li>Tambahkan kocokan telur, aduk merata dan masak sampai matang.</li>
                <li>Haluskan bubur sampai mencapai tekstur yang diinginkan, lalu sajikan harian.</li>
              </ol>
            </div>
          </div>

          {/* Nasi Tim Ikan Kembung Telur Puyuh */}
          <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-brand-primary text-sm border-b pb-1.5">🍛 Nasi Tim Ikan Kembung Telur Puyuh (9-12 Bulan)</h4>
              <div className="grid grid-cols-2 gap-2 pt-2 leading-relaxed text-base-text-secondary font-medium">
                <div>
                  <p className="font-bold text-base-text-primary">Bahan Baku:</p>
                  <p>&bull; 115 g (12 sdm) nasi putih</p>
                  <p>&bull; 30 g (1 potong kecil) ikan kembung segar, haluskan</p>
                  <p>&bull; 30 g (3 butir) telur puyuh</p>
                  <p>&bull; 15 g (1 potong besar) wortel</p>
                  <p>&bull; 10 g (1 buah sedang) tomat</p>
                  <p>&bull; 7.5 g (1.5 sdt) minyak kelapa</p>
                  <p>&bull; 75 cc (1/3 gelas belimbing) kaldu ayam</p>
                </div>
                <div>
                  <p className="font-bold text-base-text-primary">Sayur &amp; Isian:</p>
                  <p>&bull; 50 g (1/2 potong) pepaya, haluskan</p>
                  <p className="font-bold text-base-text-primary pt-2">Buah Selingan:</p>
                  <p>&bull; 180 g (1 potong besar) semangka</p>
                </div>
              </div>
            </div>
            <div className="border-t border-base-border/20 pt-3">
              <p className="font-bold text-base-text-primary mb-1">Cara Memasak:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-base-text-secondary font-medium">
                <li>Masukkan nasi, ikan kembung, telur puyuh, dan minyak kelapa ke dalam mangkok tim.</li>
                <li>Tambahkan air kaldu.</li>
                <li>Masukkan wortel dan tomat, tim hingga matang.</li>
                <li>Angkat, sajikan harian dengan saus pepaya.</li>
              </ol>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function L213ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER HIGHLIGHT */}
      <div className="bg-brand-soft/10 border-l-4 border-brand-primary p-4 rounded-r-2xl">
        <h3 className="text-base font-extrabold text-brand-primary">12 - 24 Bulan: Beri Makanan Bergizi dan Periksa Rutin ke Posyandu</h3>
        <p className="text-xs text-base-text-secondary mt-1 leading-relaxed">
          Memasuki usia 1 tahun ke atas, kemampuan fisik, mental, dan sosial anak semakin berkembang. Kebutuhan energi dan protein si kecil semakin bertambah.
        </p>
      </div>

      {/* BANNER REKOMENDASI GIZI */}
      <div className="p-4 bg-status-yellow-light/20 border border-status-yellow-solid/25 rounded-2xl text-xs text-status-yellow-solid font-bold leading-relaxed shadow-xs">
        💡 Rekomendasi Gizi: Beri Makanan yang kaya protein hewani, seperti telur, ikan dan daging untuk mendukung pertumbuhan otak dan sel-sel tubuh lainnya.
      </div>

      {/* BENTO GRID: POLA PERKEMBANGAN & PERAWATAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* YANG AKAN DIALAMI */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm">
          <h4 className="font-extrabold text-xs text-status-blue-solid uppercase tracking-wider mb-2.5">👶 Yang Akan Dialami</h4>
          <ul className="list-disc pl-4 space-y-2 text-[11px] text-base-text-secondary font-medium leading-relaxed">
            <li>Anak telah makan makanan keluarga, mulai belajar berjalan dan berkata-kata.</li>
            <li>70% kebutuhan gizi anak dipenuhi dari MPASI. Namun ASI masih tetap dibutuhkan karena menyumbang 30% kebutuhan gizi anak.</li>
          </ul>
        </div>

        {/* YANG HARUS DILAKUKAN */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-sm md:col-span-2">
          <h4 className="font-extrabold text-xs text-status-green-solid uppercase tracking-wider mb-2.5">✅ Yang Harus Dilakukan</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-base-text-secondary font-medium leading-relaxed">
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Timbang, ukur dan cek perkembangan anak setiap bulan.</li>
              <li>Penuhi kecukupan gizi anak dengan pemberian MPASI yang kaya protein hewani.</li>
              <li>Berikan makanan beragam dan menarik. Tetap berikan ASI hingga usia 2 tahun.</li>
              <li>Hindari pemberian makanan atau jajanan yang rendah gizi, tinggi gula dan garam, berpengawet dan pemanis.</li>
              <li>Ajari anak untuk belajar makan sendiri dan berjalan di undakan/tangga.</li>
            </ul>
            <ul className="list-disc pl-4 space-y-1.5">
              <li>Ajari anak mencoret-coret di kertas, menyebut bagian tubuhnya, dan bergerak bebas dalam pengawasan.</li>
              <li>Ajak anak membersihkan meja dan menyapu, membereskan mainan, bernyanyi, dan bermain dengan teman.</li>
              <li>Bacakan cerita buat anak, dan bimbing anak untuk mematuhi aturan permainan.</li>
              <li>Dapatkan imunisasi lanjutan dan pastikan anak mendapatkan suplementasi vitamin A kapsul merah dan obat cacing sebanyak 2 kali dalam setahun.</li>
              <li>Cek kesehatan anak secara rutin dan segera ke fasilitas kesehatan jika anak sakit.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MENGAPA HARUS DILAKUKAN */}
      <div className="bg-status-purple-light/20 border border-status-purple-solid/20 rounded-xl p-4 text-xs font-semibold text-base-text-primary">
        <h4 className="font-extrabold text-xs text-status-purple-solid mb-1">💡 Mengapa Harus Dilakukan?</h4>
        <p className="text-[11px] text-base-text-secondary font-medium leading-relaxed">
          Stunting paling banyak terjadi di kelompok usia ini. Tetap lanjutkan pemantauan tumbuh kembang anak di Posyandu atau fasilitas kesehatan lainnya untuk memastikan anak memiliki kondisi yang sehat, status gizi dan perkembangan terbaik sesuai usianya.
        </p>
      </div>

      {/* PANDUAN MAKANAN YANG HARUS DIHINDARI */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">❌ Batasi &amp; Hindari Jenis Makanan Berikut:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-status-red-light/15 border border-status-red-solid/20 rounded-xl">
            <span className="font-bold text-status-red-solid block mb-1">🚨 Produk Kemasan &amp; Bersoda</span>
            <p className="text-base-text-secondary font-medium">Susu atau yoghurt rendah lemak, minuman bersoda, makanan dan minuman yang tinggi kandungan gulanya atau terbuat dari pemanis buatan.</p>
          </div>
          <div className="p-3.5 bg-status-red-light/15 border border-status-red-solid/20 rounded-xl">
            <span className="font-bold text-status-red-solid block mb-1">🚨 Pengawet &amp; MSG</span>
            <p className="text-base-text-secondary font-medium">Makanan yang banyak mengandung MSG dan bahan pengawet, seperti makanan instan kemasan atau kalengan.</p>
          </div>
          <div className="p-3.5 bg-status-red-light/15 border border-status-red-solid/20 rounded-xl">
            <span className="font-bold text-status-red-solid block mb-1">🚨 Rasa Terlalu Ekstrem</span>
            <p className="text-base-text-secondary font-medium">Hindari pemberian jenis makanan yang terlalu asam dan terlalu pedas bagi pencernaan anak.</p>
          </div>
        </div>
      </div>

      {/* DETEKSI HIDRASI: WARNA AIR KENCING */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">💧 Edukasi Kesehatan: Pantau Warna Air Kencing Anak</h2>
        <div className="grid grid-cols-1 gap-2.5 text-xs">
          <div className="flex items-center gap-4 p-3 bg-status-green-light/20 border border-status-green-solid/25 rounded-xl">
            <div className="w-8 h-12 bg-[#FFFFE0] rounded border border-gray-300 shrink-0"></div>
            <div>
              <span className="font-bold text-status-green-solid text-sm block">Warna Jernih / Kuning Muda (Baik)</span>
              <p className="text-base-text-secondary font-medium">Anak Ibu sudah terhidrasi dengan baik. Teruskan minum air putih sesuai kebutuhan harian anak.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-status-orange-light/20 border border-status-orange-solid/25 rounded-xl">
            <div className="w-8 h-12 bg-[#FFD700] rounded border border-gray-300 shrink-0"></div>
            <div>
              <span className="font-bold text-status-orange-solid text-sm block">Warna Kuning Pekat (Kurang Baik)</span>
              <p className="text-base-text-secondary font-medium">Anak Ibu kurang terhidrasi. Tambahkan takaran porsi minum air putih anak sesuai kebutuhan harian.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-status-red-light/20 border border-status-red-solid/25 rounded-xl">
            <div className="w-8 h-12 bg-[#FF8C00] rounded border border-gray-300 shrink-0"></div>
            <div>
              <span className="font-bold text-status-red-solid text-sm block">Warna Oranye / Keruh (Tidak Baik)</span>
              <p className="text-base-text-secondary font-medium">Anak Ibu sangat kurang minum. Segera minum air putih sesuai kebutuhan. Bila warna air kencing tidak membaik, segera hubungi bidan/perawat/dokter untuk penjelasan lebih lanjut.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function L214ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Di usia 2 tahun ke atas, perkembangan fisik, mental, dan sosial anak berkembang sangat pesat hingga usia 6 tahun. Fase ini merupakan landasan penting bagi pembentukan karakter dan kecerdasan anak.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs">
          <h4 className="font-extrabold text-brand-primary text-xs mb-2.5">🤰 Yang Akan Dialami</h4>
          <ul className="list-disc pl-4 space-y-2 font-medium">
            <li>Anak mulai disapih, lebih banyak melakukan aktivitas, bergaul lebih luas dan memasuki masa pra sekolah.</li>
            <li>Di usia 3 tahun pertama, otak anak berkembang sangat pesat, sehingga asupan gizi disertai stimulasi perkembangan penting agar anak memiliki kesempatan belajar sejak dini.</li>
            <li>Pelayanan kesehatan, pola asuh yang peka dengan kebutuhan anak, serta perlindungan dan keamanan juga penting bagi anak.</li>
          </ul>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs">
          <h4 className="font-extrabold text-status-green-solid text-xs mb-2.5">✅ Yang Harus Dilakukan</h4>
          <ul className="list-disc pl-4 space-y-1.5 font-medium">
            <li>Penuhi gizi anak dengan pemberian makanan keluarga yang bervariasi dan kaya protein hewani.</li>
            <li>Timbang dan ukur serta cek perkembangan anak setiap bulan di Posyandu, atau fasilitas pelayanan kesehatan lainnya, serta PAUD.</li>
            <li>Ajak anak mulai melibatkan diri dalam kegiatan bersama.</li>
            <li>Ajarkan anak perbedaan jenis kelamin dan menjaga alat kelaminnya.</li>
            <li>Kembangkan kreativitas anak dan kemampuan bergaul.</li>
            <li>Cek kesehatan anak secara rutin dan segera ke fasilitas pelayanan kesehatan, jika anak sakit atau mengalami tanda bahaya.</li>
            <li>Pastikan anak balita mendapatkan suplementasi Vitamin A kapsul merah dan obat cacing sebanyak 2 kali dalam setahun.</li>
          </ul>
        </div>
      </div>

      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5">
        <h4 className="font-bold text-brand-primary text-xs mb-2">📋 Panduan Pola Asuh Anak (Usia 1,5 - 3 Tahun)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
          <ul className="list-disc pl-4 space-y-1 font-medium">
            <li>Selalu menghargai dan mengakui kemampuan anak.</li>
            <li>Mendorong anak bergerak bebas, hindari larangan-larangan yang tidak perlu, namun orang tua harus melindunginya dari bahaya.</li>
            <li>Mengajak anak bermain dan berbicara dengan kalimat pendek-pendek yang penuh arti.</li>
            <li>Mendorong anak bermain dengan anak lain.</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1 font-medium">
            <li>Melatih sopan santun dan disiplin secara sederhana.</li>
            <li>Memberi anak permainan yang sederhana.</li>
            <li>Anak 1-2 tahun perlu tidur 11-14 jam sehari (termasuk tidur siang).</li>
            <li><strong>Aturan Gawai (18-24 bln):</strong> Hanya memilih konten program yang berkualitas untuk anak, batasi tidak lebih dari 1 jam per hari, dimainkan bersama orang tua, dan hindari anak menggunakan gawai sendirian.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L49ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Pengolahan dan penyajian makanan yang tidak bersih dan sehat dapat membuat anak rentan terkena diare. Ibu harus dapat mengenali tanda dan gejala diare, karena diare dapat menyebabkan dehidrasi yang membahayakan kesehatan dan jiwa si kecil.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-status-blue-light/10 border border-status-blue-solid/10 rounded-xl space-y-1">
          <span className="font-bold text-status-blue-solid block">🥛 Pemenuhan Cairan Harian anak</span>
          <ul className="list-disc pl-4 font-medium space-y-0.5">
            <li>Anak usia 2-6 tahun wajib mencukupi kebutuhan cairan 5 - 7 gelas air setiap hari.</li>
            <li>Umur 2-3 tahun membutuhkan sekitar 1.300 mL/hari atau sekitar 5 gelas belimbing.</li>
            <li>Umur di atas 3 tahun membutuhkan cairan sekitar 1.700 mL/hari atau sekitar 7 gelas belimbing.</li>
          </ul>
        </div>
        <div className="p-4 bg-status-green-light/10 border border-status-green-solid/10 rounded-xl space-y-1">
          <span className="font-bold text-status-green-solid block">🧼 Kebersihan &amp; Perawatan Gigi</span>
          <ul className="list-disc pl-4 font-medium space-y-0.5">
            <li>Biasakan cuci tangan dan kaki anak dengan air bersih dan sabun setiap habis bermain.</li>
            <li>Gunting kuku tangan dan kaki secara teratur dan jaga kebersihan.</li>
            <li>Mulai ajari anak menyikat gigi di depan cermin seukuran 1 biji kacang polong secara teratur selama 2 menit sesudah makan dan sebelum tidur.</li>
          </ul>
        </div>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-status-red-solid text-xs flex items-center gap-1.5">🚨 4 Langkah Tindakan Pencegahan Dehidrasi Saat Anak Diare:</h4>
        <ol className="list-decimal pl-4 font-medium space-y-2">
          <li><strong>Memberikan Oplosan ASI:</strong> Berikan ASI lebih sering and lebih lama dari biasanya jika anak masih dalam masa menyusu.</li>
          <li><strong>Pemberian Oralit:</strong> Memberikan cairan oralit sampai kondisi diare anak benar-benar berhenti.</li>
          <li><strong>Suplementasi Obat Zinc:</strong> Memberikan obat zinc sehari sekali selama 10 hari berturut-turut untuk mengurangi tingkat keparahan diare.</li>
          <li><strong>Pemberian Air Mineral &amp; Nutrisi Lembek:</strong> Memberikan air minum atau mineral, dan makanan berkuah seperti sayur dan sup.</li>
        </ol>
        <p className="text-[10px] text-status-red-solid bg-status-red-light/10 p-2.5 rounded-xl font-bold">
          ⚠️ SEGERA bawa balita ke fasilitas pelayanan kesehatan dan minta bantuan tenaga kesehatan jika kondisinya tidak membaik.
        </p>
      </div>
    </div>
  );
}

function L50ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Orang tua memiliki peran utama dalam membentuk lingkungan yang sangat dibutuhkan anak untuk tumbuh kembang sehat. Untuk itu, orang tua harus memiliki kemampuan mengelola kesehatan fisik dan mentalnya. Orang tua yang sehat mental mampu mengatasi stres, memberi aturan yang jelas pada anak, paham kebutuhan anak, serta mau memperbaiki hubungan kembali setelah melepas emosi berlebihan.
      </p>

      <div className="space-y-4">
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">1. Bekerja Sama dalam Pengasuhan Positif</h4>
          <p className="font-medium">Ayah dan ibu bekerja sama dalam menerapkan pengasuhan yang tegas dan penuh kasih sayang.</p>
          <ul className="list-disc pl-4 font-medium text-[11px] text-base-text-secondary/90">
            <li>Orang tua menyepakati aturan yang diterapkan pada anak.</li>
            <li>Tidak saling menyalahkan saat menghadapi masalah dalam pengasuhan.</li>
          </ul>
        </div>

        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">2. Mengenali dan Mengelola Emosi dalam Pengasuhan</h4>
          <p className="font-medium">Mengasuh anak tentunya memunculkan banyak tantangan yang dapat mempengaruhi kondisi emosi orang tua. Oleh karena itu, orang tua perlu mengelola emosinya dengan baik.</p>
          <ul className="list-disc pl-4 font-medium text-[11px] text-base-text-secondary/90">
            <li>Kenali diri sendiri. Apa yang membuat saya marah? Apa yang bisa saya lakukan untuk membuat diri merasa lebih baik?</li>
            <li>Atur harapan dan prioritas. Misalnya, anak sedang sakit dan orang tua kelelahan. Jangan memaksakan diri untuk melakukan semua hal, seperti mencuci atau menyetrika baju.</li>
            <li>Bekerja sama dengan pasangan untuk meringankan beban.</li>
            <li>Tetap melakukan hobi untuk menjaga rasa bahagia.</li>
          </ul>
        </div>

        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">3. Memahami dan Mengelola Stres Pengasuhan</h4>
          <p className="font-medium">Ketika orang tua merasa tidak mampu menghadapi tantangan saat mengasuh anak, seperti anak sulit makan, berat badan anak kurang, atau perilaku anak tidak sesuai, maka akan timbul stres pengasuhan.</p>
          <ul className="list-disc pl-4 font-medium text-[11px] text-base-text-secondary/90">
            <li>Kelola stres dengan baik, misalnya dengan melakukan relaksasi.</li>
            <li>Cari bantuan tenaga kesehatan di Puskesmas, jika stres sudah mengganggu kehidupan sehari-hari.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L51ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Memasuki usia 2 tahun ke atas, menu makanan anak sudah harus sepenuhnya beradaptasi dengan variasi menu makanan keluarga seimbang dengan kandungan nutrisi makro harian yang lengkap.
      </p>

      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5 space-y-2">
        <h4 className="font-bold text-brand-primary text-xs">🍽️ Pola Pemenuhan Gizi Balita 2-5 Tahun:</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Biasakan anak makan secara teratur 3 kali sehari (pagi, siang, dan malam) bersama dengan anggota keluarga.</li>
          <li>Penuhi gizi anak dengan makanan kaya protein esensial seperti ikan, telur, tempe, susu, dan tahu.</li>
          <li>Penuhi gizi anak dengan mengonsumsi sayuran segar dan buah-buahan setiap hari.</li>
          <li>Batasi anak mengonsumsi makanan selingan atau kudapan jajan yang terlalu manis, terlalu asin, dan terlalu berlemak.</li>
          <li>Pastikan anak meminum air putih yang cukup sesuai dengan kebutuhan harian tubuhnya.</li>
          <li>Biasakan bermain aktif bersama anak and melakukan aktivitas fisik di luar ruangan setiap hari.</li>
        </ul>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
        <h4 className="font-bold text-status-blue-solid text-xs">🪥 Panduan Perawatan Gigi &amp; Pencegahan Gigi Berlubang:</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Mulai ajari anak menyikat gigi di depan cermin secara teratur selama 2 menit. Dampingi anak menggosok gigi secara intensif sampai anak menginjak usia 8 tahun.</li>
          <li>Untuk anak usia 2-6 tahun, gunakan takaran pasta gigi yang mengandung fluoride seukuran 1 biji kacang polong.</li>
          <li>Jangan biasakan anak minum susu dengan botol dot sambil tiduran menjelang tidur malam.</li>
          <li>Jangan membiarkan anak melakukan kebiasaan menghisap ibu jari tangan atau menghisap dot (mengempeng).</li>
          <li>Hindari memberikan anak makanan manis yang bersifat lengket di antara waktu jam makan utama.</li>
          <li>Disiplinkan anak untuk selalu teratur menyikat gigi sebelum tidur malam.</li>
        </ul>
      </div>

      <div className="p-4 bg-status-green-light/10 border border-status-green-solid/15 rounded-2xl space-y-1">
        <h4 className="font-bold text-status-green-solid text-xs">🧼 Kebersihan Diri &amp; Perawatan Fisik:</h4>
        <ul className="list-disc pl-4 space-y-1 font-medium">
          <li>Biasakan untuk mencuci tangan dan kaki anak dengan air bersih yang mengalir dan sabun setiap kali habis bermain.</li>
          <li>Gunting kuku tangan dan kuku kaki anak secara teratur demi menjaga kebersihan dari kuman penyakit.</li>
        </ul>
      </div>
    </div>
  );
}

function L52ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Fase usia 3 hingga 6 tahun ditandai dengan kemampuan kognitif tingkat tinggi, kemampuan berbahasa kompleks, serta proses pencontohan perilaku (role modeling) dari orang tua kandung.
      </p>

      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5 space-y-2">
        <h4 className="font-bold text-brand-primary text-xs">💞 Pola Asuh &amp; Pencontohan Peran Psikologis:</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Harus ada kerjasama erat antara ayah dan ibu serta seluruh anggota keluarga dalam membantu anak menjalani tahap usia dini. Pada tahap ini terjadi proses mencontoh peran, yaitu anak laki-laki mencontoh peran ayah, sedangkan anak perempuan mencontoh peran ibu. Ajari anak konsep perbedaan jenis kelamin laki-laki dan perempuan sejak dini.</li>
          <li>Mengajari anak untuk menjaga ketat bagian pribadinya yang tertutup pakaian (alat kelamin, paha, dada, pantat dan kaki) untuk menghindari tindakan pelecehan seksual pada anak.</li>
          <li>Orang tua berkewajiban aktif membantu anak mengucapkan kata-kata dengan artikulasi yang benar.</li>
          <li>Memenuhi seluruh kebutuhan dasar anak, baik yang bersifat materi maupun non-materi (kasih sayang).</li>
          <li>Beri kepercayaan penuh pada anak untuk melakukan hal-hal tertentu secara mandiri sesuai batas kemampuan fisiknya.</li>
          <li>Memberi kesempatan pada anak untuk belajar mengurusi diri sendiri dengan tetap di bawah pengawasan orang tua.</li>
          <li>Ketika anak mengekspresikan ketakutan, dekaplah dia agar merasa aman, bicarakan ketakutannya dengan tenang, buat anak menjadi nyaman dan merasa dimengerti oleh kita.</li>
          <li>Anak usia 3-5 tahun memerlukan waktu tidur selama 10-13 jam sehari (termasuk porsi tidur siang).</li>
        </ul>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
        <h4 className="font-bold text-status-orange-solid text-xs">🚫 Regulasi Ketat Penggunaan Gawai (Anak Berusia di Atas 24 Bulan):</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li>Batasi waktu penggunaan gawai (screen time) tidak lebih dari 1 jam per hari.</li>
          <li>Hanya memilih konten program edukasi yang berkualitas tinggi untuk rentang umur anak.</li>
          <li>Gawai hendaknya dimainkan bersama dengan orang tua (wajib didampingi) untuk meningkatkan proses belajar anak, memperbanyak interaksi dua arah, dan mengatur pembatasan waktu penggunaan gawai.</li>
          <li>Dilarang keras menggunakan gawai selama proses makan sedang berlangsung, dan pada rentang waktu 1 jam sebelum waktu tidur malam anak.</li>
          <li>Matikan semua perangkat TV dan gawai media visual lainnya apabila sedang tidak digunakan di dalam rumah.</li>
          <li>Jangan pernah menggunakan gawai dengan tujuan instan untuk menenangkan perilaku tantrum atau rewelnya anak.</li>
          <li>Berupaya memastikan area kamar tidur, waktu saat makan bersama, dan waktu bermain dengan anak, semuanya terbebas dari penggunaan gawai (device-free zones).</li>
          <li>Mempunyai berbagai alternatif aktivitas fisik lain dalam rangka membatasi waktu penggunaan gawai, belajar memecahkan masalah, dan untuk menenangkan perilaku emosional anak.</li>
        </ul>
      </div>
    </div>
  );
}

function L53ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Orang tua memiliki peran utama dalam membentuk lingkungan yang sangat dibutuhkan anak untuk tumbuh kembang sehat. Untuk itu, orang tua harus memiliki kemampuan mengelola kesehatan fisik dan mentalnya sendiri secara seimbang harian.
      </p>
      <p className="font-semibold text-base-text-primary">
        Orang tua yang sehat mental mampu mengatasi stres pengasuhan, memberikan aturan yang tegas dan jelas pada anak, paham kebutuhan psikologis anak, serta mau memperbaiki hubungan emosional kembali setelah melepas luapan emosi yang berlebihan. Anak yang dibesarkan oleh orang tua yang sehat mental akan jauh lebih mudah untuk fokus belajar di sekolah dan berteman dengan baik di lingkungannya.
      </p>

      <div className="space-y-4">
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">🤝 1. Bekerja Sama dalam Pengasuhan Positif</h4>
          <p className="font-medium">Ayah dan ibu wajib bekerja sama dalam menerapkan pola pengasuhan yang tegas namun penuh dengan limpahan kasih sayang harian.</p>
          <ul className="list-disc pl-4 font-medium text-[11px]">
            <li>Orang tua harus saling berkomunikasi dan menyepakati aturan disiplin yang diterapkan pada anak.</li>
            <li>Tidak saling menyalahkan satu sama lain di depan anak saat menghadapi masalah dalam pengasuhan.</li>
          </ul>
        </div>

        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">🧘 2. Mengenali dan Mengelola Emosi dalam Pengasuhan</h4>
          <p className="font-medium">Mengasuh anak tentunya memunculkan banyak tantangan yang dapat mempengaruhi kondisi emosi orang tua. Oleh karena itu, orang tua perlu mengelola emosinya dengan baik:</p>
          <ul className="list-disc pl-4 font-medium text-[11px] space-y-1">
            <li><strong>Kenali Diri Sendiri:</strong> Cari tahu apa yang membuat saya marah? Apa yang bisa saya lakukan untuk membuat diri merasa tenang dan lebih baik?</li>
            <li><strong>Atur Harapan dan Prioritas:</strong> Misalnya, ketika anak sedang sakit dan orang tua kelelahan ekstrem. Jangan memaksakan diri untuk menyelesaikan semua pekerjaan domestik, seperti mencuci atau menyetrika baju secara bersamaan.</li>
            <li>Bekerja sama secara adil dengan pasangan untuk meringankan beban tugas harian rumah tangga.</li>
            <li>Tetap luangkan waktu untuk melakukan hobi pribadi demi menjaga stabilitas rasa bahagia di dalam diri.</li>
          </ul>
        </div>

        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-xl p-4 space-y-1.5">
          <h4 className="font-bold text-status-purple-solid text-xs">🌱 3. Memahami dan Mengelola Stres Pengasuhan</h4>
          <p className="font-medium">Ketika orang tua merasa tidak mampu menghadapi tantangan saat mengasuh anak, seperti ketika anak sulit makan, berat badan anak kurang dari kurva, atau perilaku anak tidak sesuai harapan, maka akan timbul stres pengasuhan.</p>
          <ul className="list-disc pl-4 font-medium text-[11px]">
            <li>Kelola stres dengan baik, misalnya dengan melakukan latihan relaksasi napas atau meditasi.</li>
            <li>Segera cari bantuan profesional ke tenaga kesehatan di Puskesmas, jika tekanan stres sudah mulai mengganggu fungsi kehidupan sehari-hari.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L54ArticleContent() {
  const links = [
    { label: "Website Ayo Sehat", desc: "Portal informasi resmi promosi kesehatan Kemenkes RI", url: "https://ayosehat.kemkes.go.id" },
    { label: "Chatbot Edukasi Ayo Sehat", desc: "Layanan konsultasi & tanya jawab otomatis via WhatsApp", url: "https://wa.me/6281277889912?text=ayosehat" },
    { label: "Konseling Menyusui", desc: "Layanan telekonseling PMBA resmi Kemenkes RI", url: "https://telekonseling-pmba-kemenkes.com" },
    { label: "Kumpulan Resep MPASI", desc: "Buku resep dan referensi MPASI gizi seimbang resmi Kemenkes", url: "https://link.kemkes.go.id/ResepMPASI2" },
    { label: "Kumpulan Link Penting untuk Kesehatan Mental", desc: "Portal panduan psikologis dan rujukan kesehatan mental keluarga", url: "https://link.kemkes.go.id/KesehatanMentalKeluarga" },
    { label: "Kumpulan Link Penting untuk Anak Disabilitas", desc: "Sumber informasi, hak, dan rujukan tumbuh kembang anak berkebutuhan khusus", url: "https://link.kemkes.go.id/InfoAnakDisabilitas" },
    { label: "Hubungi Kemenkes untuk Pertanyaan, Pengaduan & Saran", desc: "Kontak pengaduan masyarakat terpadu Biro Komunikasi Kemenkes", url: "https://www.kemkes.go.id/id/layanan/kontak-kami" }
  ];

  const phoneNumbers = [
    { number: "119", label: "Ambulans", color: "bg-[#3f51b5]" },
    { number: "110", label: "Polisi", color: "bg-[#3f51b5]" },
    { number: "113", label: "Pemadam Kebakaran", color: "bg-[#3f51b5]" },
    { number: "117", label: "Bencana", color: "bg-[#3f51b5]" }
  ];

  return (
    <div className="space-y-8 text-xs text-base-text-primary leading-relaxed">
      
      {/* SECTION: Telepon Darurat */}
      <div className="space-y-4">
        <div className="border-b border-base-border/20 pb-2">
          <h3 className="text-base font-bold text-base-text-primary">Nomor-Nomor Telepon Penting</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {phoneNumbers.map((p, i) => (
            <div key={i} className="bg-base-white border border-base-border/30 rounded-2xl overflow-hidden flex flex-col shadow-sm">
              <div className="flex-1 py-6 flex items-center justify-center text-4xl font-extrabold text-base-text-primary tracking-tight">
                {p.number}
              </div>
              <div className={`py-2 px-3 text-center text-[10px] font-extrabold text-base-white uppercase tracking-wider ${p.color}`}>
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: Link Penting */}
      <div className="space-y-4">
        <div className="border-b border-base-border/20 pb-2">
          <h3 className="text-base font-bold text-base-text-primary">Kumpulan Link Penting</h3>
        </div>
        
        <div className="space-y-3">
          {links.map((link, idx) => (
            <div key={idx} className="p-4 bg-base-white border border-base-border/30 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-brand-primary">{link.label}</h4>
                <p className="text-[10px] text-base-text-secondary font-medium leading-relaxed">{link.desc}</p>
                <span className="text-[9px] font-semibold text-brand-primary block break-all">{link.url}</span>
              </div>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 rounded-xl text-[10px] font-bold transition whitespace-nowrap text-center shrink-0 cursor-pointer"
              >
                Kunjungi Situs
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function L55ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Menjaga kebersihan diri dan lingkungan anak merupakan hal yang harus dilakukan untuk anak di semua rentang usia. Membiasakan perilaku hidup bersih dan sehat (PHBS) sejak dini terbukti efektif memutus rantai penularan kuman penyakit.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-4 bg-brand-soft/20 border border-brand-primary/10 rounded-2xl space-y-2">
          <h4 className="font-bold text-brand-primary text-xs">🧼 Kapan Saja Harus Mencuci Tangan?</h4>
          <ol className="list-decimal pl-4 font-medium space-y-1">
            <li>Setelah buang air.</li>
            <li>Sebelum memegang dan menyusui bayi.</li>
            <li>Setelah menceboki bayi atau anak.</li>
            <li>Sebelum makan dan menyuapi anak.</li>
            <li>Sebelum memegang makanan dan setelah makan.</li>
            <li>Setelah bersin/batuk.</li>
            <li>Setiap kali tangan kotor (mengetik, pegang uang, hewan, berkebun).</li>
          </ol>
        </div>

        <div className="p-4 bg-status-blue-light/10 border border-status-blue-solid/10 rounded-2xl space-y-2">
          <h4 className="font-bold text-status-blue-solid text-xs">💡 Pentingnya Mencuci Tangan Dengan Sabun:</h4>
          <ul className="list-disc pl-4 font-medium space-y-1">
            <li>Kuman penyakit sangat mudah ditularkan melalui tangan. Pada saat makan kuman dengan cepat masuk ke dalam tubuh.</li>
            <li>Tangan kadang terlihat bersih secara kasat mata namun tetap mengandung kuman.</li>
            <li>Sabun dapat membersihkan kotoran dan merontokkan kuman. Tanpa sabun, kotoran dan kuman tertinggal di tangan.</li>
          </ul>
        </div>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-status-green-solid text-xs">🧼 7 Langkah Cara Cuci Tangan Yang Benar (Air Mengalir):</h4>
        <p className="font-medium">Biasakan cuci tangan pakai sabun dengan air mengalir mengikuti urutan standar medis berikut:</p>
        <ol className="list-decimal pl-4 font-medium space-y-1.5">
          <li>Basahi seluruh tangan dengan air bersih mengalir.</li>
          <li>Gosok sabun secara merata pada area telapak tangan.</li>
          <li>Gosok sabun ke telapak punggung, dan sela-sela jari tangan.</li>
          <li>Gosok telapak kanan di atas tangan kiri dan telapak kiri di atas punggung tangan kanan.</li>
          <li>Bersihkan bagian bawah kuku secara menyeluruh.</li>
          <li>Bilas tangan dengan air bersih mengalir sampai busa hilang.</li>
          <li>Keringkan tangan dengan handuk/tisue atau keringkan dengan diangin-anginkan.</li>
        </ol>
        <p className="text-[10px] text-base-text-secondary italic pt-2 border-t border-dashed border-base-border/10">
          * Catatan Tambahan: Jauhkan anak dari paparan asap rokok dan lain-lain. Serta pastikan orang tua/keluarga mengikuti Kelas Ibu Balita setiap bulan.
        </p>
      </div>
    </div>
  );
}

function L56ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Melakukan perawatan kesehatan gigi dan mulut anak harus dibiasakan sejak dini, bahkan sebelum gigi susu pertama si kecil mulai tumbuh ke permukaan gusi.
      </p>

      <div className="p-4 bg-status-red-light/10 border border-status-red-solid/10 rounded-2xl space-y-2">
        <h4 className="font-bold text-status-red-solid text-xs">🛑 Faktor Risiko Utama Gigi Berlubang:</h4>
        <ul className="list-disc pl-4 font-medium space-y-1">
          <li>Meminum susu botol saat tidur malam.</li>
          <li>Mengemil makanan manis di antara waktu makan aturan waktu makan.</li>
          <li>Tidak menyikat gigi sebelum tidur.</li>
          <li>Mengemut makanan.</li>
        </ul>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-brand-primary text-xs">🪥 Panduan Cara Membersihkan Gigi Anak Berdasarkan Kategori Usia:</h4>
        
        <div className="space-y-4">
          <div className="p-3.5 bg-base-bg/30 rounded-xl space-y-1">
            <span className="font-bold text-base-text-primary block">👶 1. Anak Usia 0 - 4 Bulan:</span>
            <ol className="list-decimal pl-4 font-medium space-y-0.5">
              <li>Gendong atau pangku anak dengan satu tangan.</li>
              <li>Bersihkan gusi anak secara perlahan dengan kain atau lap basah yang dilingkarkan pada jari telunjuk ibu.</li>
            </ol>
          </div>

          <div className="p-3.5 bg-base-bg/30 rounded-xl space-y-1">
            <span className="font-bold text-base-text-primary block">🦷 2. Anak Usia 6 - 12 Bulan:</span>
            <ol className="list-decimal pl-4 font-medium space-y-1">
              <li>Bersihkan gusi anak setelah diberi makan menggunakan kain atau lap basah.</li>
              <li>Bila gigi susu mulai muncul, bersihkan giginya dengan sikat gigi anak berbulu halus tanpa pasta gigi atau dengan pasta gigi selapis tipis pada permukaan bulu sikat.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function L57ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Setiap orang tua pasti khawatir jika anaknya jatuh sakit. Namun, Ibu harus tetap tenang dan memastikan kebutuhan gizi si kecil tetap tercukupi selama sakit. Saat anak sakit, daya tahan tubuhnya akan melemah, sehingga ia membutuhkan lebih banyak zat gizi untuk memperbaiki sel-sel tubuh yang rusak, serta memulihkan energinya.
      </p>

      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 space-y-2">
        <h4 className="font-bold text-brand-primary text-xs">🩺 Panduan Merawat Anak Yang Sedang Sakit:</h4>
        <ul className="list-disc pl-4 space-y-1.5 font-medium">
          <li><strong>Memberi asupan gizi lebih banyak:</strong> Caranya bisa dengan menambah porsi ASI atau makanan minuman yang diberikan, atau menambah variasi makanan untuk menambah asupan gizinya.</li>
          <li><strong>Memberi asupan gizi lebih sering:</strong> Caranya dengan memberi makan lebih sering dari biasanya. Misalnya, jika anak biasa makan 3-4 kali dalam sehari, tambahkan 1-2 kali lagi, namun dengan porsi yang tidak membuat anak terlalu kenyang.</li>
        </ul>
      </div>

      <div className="space-y-4">
        {/* Demam */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
          <h4 className="font-bold text-status-orange-solid text-xs">🤒 1. Perawatan Saat Anak Demam</h4>
          <ul className="list-disc pl-4 font-medium space-y-1">
            <li>Jika masih menyusu, berikan ASI lebih sering.</li>
            <li>Beri minum lebih sering dan lebih banyak.</li>
            <li>Jangan diselimuti atau diberi baju tebal.</li>
            <li>Kompres dengan air biasa atau air hangat. Jangan air dingin karena anak bisa menggigil.</li>
            <li>Jika demam tinggi, beri obat penurun panas sesuai dosis.</li>
            <li>Daerah endemis malaria: balita tidur di kelambu anti nyamuk (mengandung insektisida).</li>
          </ul>
          <div className="p-2.5 bg-status-red-light/10 text-status-red-solid rounded-xl font-bold text-[10px]">
            🚨 SEGERA KE FASKES JIKA: Demam disertai kejang; Demam tidak turun dalam 2 hari; Demam disertai bintik merah, mimisan, atau BAB hitam.
          </div>
        </div>

        {/* Batuk */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
          <h4 className="font-bold text-status-blue-solid text-xs">😮💨 2. Perawatan Saat Anak Batuk</h4>
          <ul className="list-disc pl-4 font-medium space-y-1">
            <li>Berikan ASI lebih sering, beri air matang lebih banyak.</li>
            <li>Jika umur &gt; 1 tahun, beri kecap manis atau madu dicampur air jeruk nipis.</li>
            <li>Jauhkan dari asap rokok, asap dapur, asap sampah, polusi dan debu.</li>
          </ul>
          <div className="p-2.5 bg-status-red-light/10 text-status-red-solid rounded-xl font-bold text-[10px]">
            🚨 SEGERA KE FASKES JIKA: Batuk tidak sembuh dalam 2 hari; Anak sesak napas; Demam.
          </div>
        </div>

        {/* Diare */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
          <h4 className="font-bold text-status-red-solid text-xs">💩 3. Perawatan Saat Anak Diare / Mencret</h4>
          <ul className="list-disc pl-4 font-medium space-y-1">
            <li>ASI sesering mungkin. Berikan 1/2 - 1 gelas cairan oralit setiap buang air besar.</li>
            <li>Jika tidak ada oralit, beri air matang, kuah sayur bening, atau air tajin.</li>
            <li>Pemberian zinc selama 10 hari berturut-turut: anak &lt;6 bulan 1/2 tablet; anak 6 bulan - 5 tahun 1 tablet.</li>
            <li>Beri MP-ASI atau makan seperti biasa. Jangan beri obat lain tanpa resep petugas medis.</li>
          </ul>
          <div className="p-2.5 bg-status-red-light/10 text-status-red-solid rounded-xl font-bold text-[10px]">
            🚨 SEGERA KE FASKES JIKA: Timbul demam; Ada darah dalam tinja; Muntah terus; Sangat haus; Diare makin parah/berulang-ulang.
          </div>
        </div>

        {/* Luka */}
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-2">
          <h4 className="font-bold text-gray-700 text-xs">🩹 4. Perawatan Luka dan Koreng</h4>
          <ul className="list-disc pl-4 font-medium space-y-1">
            <li>Luka: Cuci bersih luka dengan air bersih mengalir.</li>
            <li>Koreng: Periksakan ke Puskesmas.</li>
          </ul>
          <div className="p-2.5 bg-status-red-light/10 text-status-red-solid rounded-xl font-bold text-[10px]">
            🚨 SEGERA KE FASKES JIKA: Luka bernanah atau berbau.
          </div>
        </div>
      </div>
    </div>
  );
}

function L58ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      <p className="text-sm font-medium">
        Setiap anak berhak dilindungi dari berbagai bentuk kekerasan, pelecehan, dan penelantaran. Pendampingan yang tepat dan peka sangat diperlukan bagi anak dengan disabilitas.
      </p>

      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5 space-y-2">
        <h4 className="font-bold text-brand-primary text-xs">🛡️ I. Perlindungan Anak dari Kekerasan &amp; Pelecehan</h4>
        <p className="font-semibold text-base-text-primary">Lindungi Anak dari Kekerasan Fisik, Psikis, Seksual, dan Penelantaran.</p>
        <ul className="list-disc pl-4 space-y-1 font-medium">
          <li>Mencubit, memukul (kekerasan fisik).</li>
          <li>Mengejek, mengancam (kekerasan psikis).</li>
          <li>Melakukan perbuatan cabul terhadap anak, mempertontonkan aktivitas seksual terhadap anak (kekerasan seksual).</li>
          <li>Tidak memenuhi kebutuhan gizi, kesehatan, pendidikan (penelantaran).</li>
        </ul>
        <p className="text-[10px] text-status-red-solid font-bold">🚨 Awas! Banyak pelaku kekerasan fisik dan kejahatan seksual dilakukan oleh orang yang dikenal anak.</p>
      </div>

      <div className="bg-base-white border border-base-border/30 rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-status-blue-solid text-xs">♿ II. Pendampingan Anak Dengan Disabilitas</h4>
        <p className="font-medium">Keluarga membantu Anak dengan Disabilitas dalam menjalankan aktivitas sehari-hari:</p>
        <ol className="list-decimal pl-4 font-medium space-y-1.5">
          <li>Penguatan mental untuk bisa menerima kondisi anak dengan segala kekurangannya.</li>
          <li>Melindungi dan memberi rasa aman pada anak dengan memberikan kasih sayang, semangat dan motivasi secara terbaik.</li>
          <li>Ajari anak dengan sabar melatih kemandirian anak dalam melakukan aktivitas sehari-hari.</li>
          <li>Menyediakan makanan bergizi seimbang dan memeriksakan kesehatan anak secara teratur serta memantau tumbuh kembang anak.</li>
          <li>Kontrol teratur untuk terapi, status gizi, kemajuan perkembangan, serta melengkapi status imunisasi di Puskesmas.</li>
          <li>Anak dengan gangguan berbicara: melatih pelafalan huruf, vokal, konsonan, dan kalimat secara bertahap.</li>
        </ol>
      </div>
    </div>
  );
}

function L59ArticleContent() {
  return (
    <div className="space-y-6 text-xs text-base-text-secondary leading-relaxed animate-in fade-in duration-200">
      
      {/* SECTION 1: KERAWANAN & RISIKO PSIKOLOGIS */}
      <div className="bg-brand-soft/10 border-l-4 border-brand-primary p-4 rounded-r-2xl space-y-2">
        <h3 className="text-base font-extrabold text-brand-primary">Kesiapsiagaan Dalam Situasi Bencana</h3>
        <p className="font-medium text-base-text-secondary">
          Indonesia merupakan negara yang terletak di wilayah yang rawan bencana, bencana alam yang sering terjadi di Indonesia antara lain gempa bumi, erupsi gunung berapi, kebakaran hutan/lahan longsor, banjir, tsunami, di samping bencana non alam seperti pandemi virus atau situasi konflik.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs">
          <h4 className="font-bold text-status-red-solid text-xs mb-2">🚨 Kerentanan Kelompok Risiko Tinggi</h4>
          <p className="font-medium">
            Kelompok yang paling rentan terdampak bencana diantaranya adalah ibu hamil, ibu nifas, bayi dan balita. Kondisi pengungsian yang padat dan tidak memadai, dengan hygiene dan sanitasi yang buruk, berisiko tinggi menimbulkan berbagai penyakit, termasuk risiko terinfeksi penyakit menular dan peningkatan kasus gizi kurang. Disamping itu juga berisiko terhadap pelecehan, kekerasan, dan trauma. Selain risiko kesakitan, kecacatan dan kematian, anak dan balita juga memiliki risiko terpisah dari orang tua.
          </p>
        </div>

        <div className="bg-base-white border border-base-border/30 rounded-2xl p-4.5 shadow-xs">
          <h4 className="font-bold text-status-blue-solid text-xs mb-2">🧠 Dampak Suasana Kejiwaan &amp; Trauma</h4>
          <p className="font-medium">
            Reaksi bayi dan anak berumur 1-2 tahun sangat dipengaruhi oleh suasana kejiwaan orangtuanya dalam menghadapi bencana. Bila orang tua panik dan cemas, maka anak-anak tersebut akan gelisah, rewel dan mudah terkena penyakit. Anak usia prasekolah mudah merasa tidak berdaya dan terus mengingat trauma psikis yang dialami akibat bencana. Hal ini mengakibatkan gangguan tidur dan anak lebih banyak berdiam diri. Bimbingan untuk bermain dapat mengurangi masalah tersebut.
          </p>
        </div>
      </div>

      {/* SECTION 2: RENCANA DARURAT KELUARGA */}
      <div className="p-5 bg-base-bg/30 border border-base-border/30 rounded-2xl space-y-3">
        <h4 className="font-bold text-base-text-primary text-xs uppercase tracking-wider">📋 Rencana Darurat Kesiapsiagaan Keluarga</h4>
        <p className="font-medium">
          Dalam situasi normal, ibu hamil, ibu bersalin, bayi, dan balita terutama yang tinggal di daerah rawan bencana berkewajiban untuk mempersiapkan kesiapsiagaan menghadapi bencana dengan langkah berikut:
        </p>
        
        <ul className="list-disc pl-4 space-y-2 font-medium">
          <li>
            <strong>Membuat rencana darurat keluarga:</strong>
            <ul className="list-circle pl-4 space-y-1 mt-1 text-[11px]">
              <li>Kenali ancaman bencana.</li>
              <li>Nomor kontak penting (keluarga, fasilitas pelayanan kesehatan/rumah sakit/puskesmas/rumah bersalin/klinik, dan lain-lain).</li>
              <li>Identifikasi lokasi untuk mematikan air, gas, dan listrik.</li>
              <li>Identifikasi titik kumpul dan titik aman di dalam bangunan atau rumah.</li>
              <li>Ketahui rute evakuasi.</li>
              <li>Identifikasi anggota keluarga yang rentan (bayi, balita, ibu hamil, ibu bersalin nifas, lanjut usia, dan penyandang disabilitas).</li>
            </ul>
          </li>
          <li><strong>Menyimak informasi resmi:</strong> Menyimak informasi dari radio/televisi media online/informasi resmi dari BPBD, BNPB. Apabila sudah terbentuk posko informasi lanjutan akan diberikan oleh posko setempat.</li>
          <li><strong>Menyiapkan kit bencana:</strong> Mengemas tas darurat yang berisi kebutuhan esensial pertahanan hidup seluruh anggota keluarga.</li>
        </ul>
      </div>

      {/* SECTION 3: ISI KIT BENCANA (12 ITEM GRID) */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-extrabold text-base-text-primary border-b pb-2">🎒 Manajemen Persiapan Isi Kit Ransel Bencana</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          {[
            { title: "Buku KIA", desc: "Buku pedoman untuk ibu hamil/bersalin/nifas dan pedoman bayi dan balita.", icon: "📚" },
            { title: "Obat-obatan", desc: "Obat sehari-hari dan obat-obatan rutin, vitamin, serta perlengkapan pendukungnya.", icon: "💊" },
            { title: "Kalung Tanda Pengenal", desc: "Tanda pengenal berisi informasi nama, nama orang tua, no. telepon orang tua, dan alamat.", icon: "🪪" },
            { title: "Peralatan Elektronik", desc: "Handphone, powerbank, kabel charger, radio walkie-talkie, baterai.", icon: "🔋" },
            { title: "Benda Khusus Bayi & Balita", desc: "Pakaian, selimut, popok, topi, kaos kaki, dan mainan secukupnya.", icon: "🍼" },
            { title: "Peralatan Bertahan Hidup", desc: "Pisau, gunting, peluit, pisau serba guna, senter, korek/pemantik api.", icon: "🔦" },
            { title: "Benda Khusus Ibu", desc: "Kain panjang, pakaian lengkap dan perlengkapan lain secukupnya.", icon: "👚" },
            { title: "Makanan & Minuman", desc: "Makanan instan, air mineral, roti, dan makanan praktis untuk dibawa di dalam tas.", icon: "🍞" },
            { title: "Persih Higienis", desc: "Tisu basah dan tisu kering, hand sanitizer, perlengkapan mandi.", icon: "🧼" },
            { title: "Uang & Dokumen Penting", desc: "Uang tunai, KTP/Paspor, kartu ATM, dan dokumen penting lainnya.", icon: "💵" },
            { title: "Perlengkapan Keselamatan", desc: "Jaket, sepatu, sarung tangan, masker, helm, jas hujan/ponco ringan.", icon: "⛑️" },
            { title: "Tas Ransel", desc: "Tas untuk membawa semua perlengkapan persiapan kit bencana.", icon: "🎒" }
          ].map((item, idx) => (
            <div key={idx} className="bg-base-white border border-base-border/30 rounded-xl p-3 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xl block mb-1">{item.icon}</span>
                <h5 className="font-bold text-[11px] text-base-text-primary leading-tight mb-1">{item.title}</h5>
                <p className="text-[10px] text-base-text-secondary leading-normal font-medium">{item.desc}</p>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}

// Fallback Mock Content Generator
function getMockContent(id: string, title: string): string {
  return `<p>Konten artikel statis untuk ID <strong>${id}</strong> - <strong>${title}</strong>.</p>`;
}

// ARTIKEL L103: Persiapan Melahirkan
function L103ArticleContent() {
  const [prepList, setPrepList] = useState<boolean[]>(new Array(10).fill(false));

  useEffect(() => {
    const list = [];
    for (let i = 1; i <= 10; i++) {
      list.push(localStorage.getItem('birth_prep_' + i) === 'true');
    }
    setPrepList(list);
  }, []);

  const handleToggle = (idx: number) => {
    const next = [...prepList];
    next[idx] = !next[idx];
    setPrepList(next);
    localStorage.setItem('birth_prep_' + (idx + 1), String(next[idx]));
  };

  const items = [
    { title: "1. Hari Perkiraan Lahir (HPL)", desc: "Sudah mencatat dan menanyakan HPL ke bidan desa." },
    { title: "2. Pendamping Bersalin", desc: "Suami atau keluarga siap mendampingi proses melahirkan." },
    { title: "3. Tabungan Cadangan", desc: "Mempersiapkan dana darurat finansial tak terduga." },
    { title: "4. Kartu BPJS Kesehatan", desc: "Memastikan kartu aktif untuk rujukan jaminan kesehatan." },
    { title: "5. Tempat Bersalin", desc: "Menyepakati tempat persalinan aman di Puskesmas atau RS." },
    { title: "6. Berkas Berkas Administrasi", desc: "Menyiapkan fotokopi KTP, KK, dan berkas Buku KIA." },
    { title: "7. Pendonor Darah Pendamping", desc: "Menyiapkan calon pendonor darah golongan sejenis." },
    { title: "8. Kendaraan Siaga", desc: "Menyiapkan moda transportasi darurat warga/keluarga." },
    { title: "9. Stiker P4K Terpasang", desc: "Menempelkan stiker perencanaan persalinan di depan rumah." },
    { title: "10. Kontrasepsi Pasca Salin", desc: "Sudah berkonsultasi mengenai rencana program KB pasca bersalin." }
  ];

  const count = prepList.filter(Boolean).length;
  const percentage = count * 10;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Trimester ketiga (7-9 bulan) adalah persiapan akhir menyambut garis finish lahirnya janin. Pada periode penting ini, ibu dan keluarga harus mematangkan perencanaan persiapan melahirkan demi kelancaran persalinan.
      </p>

      {/* Kontainer Utama Checklist */}
      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[24px] p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xl">🎒</span>
          <h4 className="font-extrabold text-sm text-brand-primary">Checklist Mandiri Persiapan Lahiran</h4>
        </div>

        {/* Progress Bar Indikator */}
        <div className="w-full bg-base-border/40 h-2.5 rounded-full mb-2 overflow-hidden">
          <div 
            className="bg-brand-primary h-full transition-all duration-300 ease-out" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <p className="text-xs font-bold text-brand-primary mb-5">
          Persiapan selesai: {percentage}% ({count} dari 10)
        </p>

        {/* Daftar Item Checklist */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <label 
              key={idx} 
              className={`flex items-start gap-3 p-3 bg-base-white border rounded-xl text-xs cursor-pointer transition-all select-none
                ${prepList[idx] ? 'border-brand-primary bg-brand-soft/5' : 'border-base-border/20 hover:border-base-border/40'}`}
            >
              {/* Checkbox Input */}
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  checked={prepList[idx]} 
                  onChange={() => handleToggle(idx)} 
                  className="w-4 h-4 text-brand-primary bg-base-white border-base-border rounded focus:ring-brand-primary/30 accent-brand-primary cursor-pointer" 
                />
              </div>

              {/* Konten Judul dan Deskripsi */}
              <div className="text-[11px] leading-relaxed mt-0.5">
                <span 
                  className={`font-bold block transition-colors
                    ${prepList[idx] ? 'text-brand-primary font-semibold' : 'text-base-text-primary'}`}
                >
                  {item.title}
                </span>
                <span className="text-base-text-secondary font-medium">
                  {item.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}