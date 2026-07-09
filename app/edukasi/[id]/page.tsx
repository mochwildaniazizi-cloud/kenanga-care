"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen, FiTrash, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare, MdEdit } from "react-icons/md";
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
      case "Gizi & MPASI": return "bg-status-green-light text-status-green-solid border border-status-green-solid/20";
      case "Imunisasi": return "bg-status-orange-light text-status-orange-solid border border-status-orange-solid/20";
      case "Ibu Hamil": return "bg-status-blue-light text-status-blue-solid border border-status-blue-solid/20";
      case "Ibu Nifas": return "bg-status-purple-light text-status-purple-solid border border-status-purple-solid/20";
      case "Ibu Menyusui": return "bg-pink-50 text-pink-600 border border-pink-200";
      case "Tumbuh Kembang": return "bg-sky-50 text-sky-600 border border-sky-200";
      default: return "bg-gray-100 text-gray-800";
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
    <div className="max-w-[800px] mx-auto pb-16 animate-in fade-in duration-300">
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
          {role !== "ibu" && (
            <Link
              href={`/edukasi/tambah?edit=${article.id}`}
              className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-base-white text-xs font-bold rounded-xl transition duration-150 flex items-center"
              title="Edit Konten"
            >
              Edit
            </Link>
          )}

          {role !== "ibu" && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 hover:bg-red-600 border border-red-200 text-red-500 hover:text-base-white text-xs font-bold rounded-xl transition duration-150 flex items-center cursor-pointer"
              title="Hapus Konten"
            >
              Hapus
            </button>
          )}

          <span className="w-px h-5 bg-base-border/50 mx-1"></span>

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
          {article.type === "Video" && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
              <div className="w-16 h-16 bg-brand-primary text-base-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition cursor-pointer pl-1">
                <MdPlayCircleOutline className="w-10 h-10" />
              </div>
            </div>
          )}
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
              <span>{article.type}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-text-primary leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-px bg-base-border/30"></div>

          {article.type === "Video" ? (
            <div className="space-y-6">
              <div className="aspect-video w-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden group border border-slate-800 shadow-md">
                <img
                  src={article.imageUrl}
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="z-10 flex flex-col items-center space-y-3 p-4 text-center">
                  <div className="w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg cursor-pointer transform hover:scale-110 transition duration-300 pl-1">
                    <MdPlayCircleOutline className="w-10 h-10 text-brand-primary" />
                  </div>
                  <p className="text-xs font-bold text-white/90">Klik untuk Memutar Video Edukasi</p>
                  <p className="text-[10px] text-white/60 max-w-[280px]">Materi video interaktif untuk menunjang wawasan Posyandu Ibu & Anak</p>
                </div>
              </div>

              <div className="article-content">
                <h2 className="text-lg font-bold text-base-text-primary mb-2">Deskripsi Video</h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content || "" }}
                  className="text-sm leading-relaxed"
                />
              </div>
            </div>
          ) : (
            id === "L1" ? (
              <L1ArticleContent />
            ) : id === "L2" ? (
              <L2ArticleContent />
            ) : id === "L3" ? (
              <L3ArticleContent />
            ) : id === "L4" ? (
              <L4ArticleContent />
            ) : id === "L5" ? (
              <L5ArticleContent />
            ) : id === "L6" ? (
              <L6ArticleContent />
            ) : id === "L7" ? (
              <L7ArticleContent />
            ) : id === "L8" ? (
              <L8ArticleContent />
            ) : id === "L9" ? (
              <L9ArticleContent />
            ) : id === "L10" ? (
              <L10ArticleContent />
            ) : id === "L11" ? (
              <L11ArticleContent />
            ) : id === "L12" ? (
              <L12ArticleContent />
            ) : id === "L13" ? (
              <L13ArticleContent />
            ) : id === "L14" ? (
              <L14ArticleContent />
            ) : id === "L15" ? (
              <L15ArticleContent />
            ) : id === "L16" ? (
              <L16ArticleContent />
            ) : id === "L17" ? (
              <L17ArticleContent />
            ) : id === "L18" ? (
              <L18ArticleContent />
            ) : id === "L19" ? (
              <L19ArticleContent />
            ) : (
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />
            )
          )}
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
// SECTION ARTICLE CONTENT SUB-COMPONENTS (L1 - L19)
// ====================================================================

function L1ArticleContent() {
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

function L2ArticleContent() {
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

function L3ArticleContent() {
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

function L4ArticleContent() {
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

function L5ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Ibu hamil trimester pertama (usia kehamilan 1-12 minggu) wajib mengenali dan mewaspadai berbagai tanda bahaya, serta memahami tata cara perawatan sehari-hari dan larangan aktivitas fisik sesuai standar panduan Buku KIA 2024 Halaman 8 dan 9.
      </p>

      {/* Bagian 1: Tanda Bahaya */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          Tanda Bahaya Pada Trimester 1 (Segera ke Puskesmas/Rumah Sakit)
        </h2>
        <p className="text-xs text-base-text-secondary italic">* Segera bawa ibu hamil periksa ke dokter/bidan jika mengalami salah satu gejala di bawah ini:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "🤒", title: "Demam Tinggi", desc: "Suhu tubuh di atas 38°C bisa menandakan infeksi sistemik yang berbahaya bagi janin." },
            { icon: "⚡", title: "Nyeri Perut Hebat", desc: "Kram perut bawah yang sangat menusuk berisiko keguguran atau kehamilan ektopik." },
            { icon: "🤮", title: "Mual & Muntah Berlebih", desc: "Muntah terus menerus hingga tubuh lemas dan cairan terbuang (Hiperemesis Gravidarum)." },
            { icon: "🩸", title: "Perdarahan / Flek Darah", desc: "Keluar flek atau darah merah segar dari jalan lahir, tanda ancaman keguguran." },
            { icon: "🚽", title: "Keluhan Organ Intim", desc: "Nyeri saat kencing, keputihan berlebih, gatal, atau berbau di daerah kewanitaan." }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 shadow-xs
                ${idx === 4 ? 'sm:col-span-2 md:col-span-1' : ''}`}
            >
              <span className="text-2xl">{item.icon}</span>
              <h4 className="font-extrabold text-xs text-base-text-primary">{item.title}</h4>
              <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Masalah Lain */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-orange-solid border-b pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Masalah Lain Pada Kehamilan
        </h2>
        <p className="text-xs text-base-text-secondary italic">* Laporkan segera kepada kader, bidan, atau dokter bila menemui kondisi berikut:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {[
            { icon: "😷", title: "Batuk Lama", desc: "Batuk terus menerus lebih dari 2 minggu." },
            { icon: "🥶", title: "Demam Menggigil", desc: "Gejala khas infeksi malaria (terutama daerah endemis)." },
            { icon: "🤢", title: "Diare Berulang", desc: "Buang air besar cair berkali-kali, berisiko dehidrasi." },
            { icon: "🫀", title: "Jantung Berdebar", desc: "Jantung terasa terpompa kencang / nyeri dada." },
            { icon: "😰", title: "Cemas Berlebih", desc: "Kecemasan psikologis tinggi & sulit tidur malam." }
          ].map((item, idx) => (
            <div key={idx} className="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center shadow-xs">
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="font-bold text-[11px] text-base-text-primary">{item.title}</span>
              <span className="text-[10px] text-base-text-secondary mt-1 leading-tight font-medium">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 3: Perawatan Sehari-hari */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-blue-solid border-b pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Perawatan Sehari-hari Ibu Hamil
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-base-text-primary">
          {[
            { num: "1", title: "Menjaga Kebersihan Diri", desc: "Mandi teratur, cuci tangan pakai sabun di air mengalir sebelum makan, serta ganti pakaian harian secara rutin." },
            { num: "2", title: "Istirahat Cukup", desc: "Tidur malam minimal 6 - 7 jam dan tidur siang santai sekitar 1 - 2 jam demi kestabilan stamina fisik." },
            { num: "3", title: "Stimulasi Perkembangan Bayi", desc: "Sering ajak janin berbicara, bersenandung, dan berikan sentuhan/usapan hangat pada perut ibu." },
            { num: "4", title: "Hubungan Suami Istri", desc: "Boleh dilakukan selama kondisi kehamilan sehat, tidak ada flek darah, atau ketuban pecah dini." }
          ].map((step, idx) => (
            <div key={idx} className="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start shadow-xs">
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

      {/* Bagian 4: Hal yang Dilarang */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Hal yang DILARANG Selama Kehamilan
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { title: "Obat Tanpa Resep", desc: "Bisa memicu cacat bawaan lahir janin." },
            { title: "Kerja Berat / Lelah", desc: "Memicu kontraksi rahim dini." },
            { title: "Merokok / Asap", desc: "Risiko bayi lahir berat rendah (BBLR)." },
            { title: "Alkohol & Jamu", desc: "Gangguan hati dan saraf janin." },
            { title: "Stres Berlebihan", desc: "Mengganggu suplai nutrisi darah." },
            { title: "Tidur Telentang", desc: "Trimester akhir: janin kurang oksigen." }
          ].map((item, idx) => (
            <div key={idx} className="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center shadow-xs">
              <span className="text-xl mb-1.5">❌</span>
              <span className="font-extrabold text-[10px] text-base-text-primary leading-tight">{item.title}</span>
              <p className="text-[9px] text-base-text-secondary mt-1 leading-tight font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function L6ArticleContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [attendance, setAttendance] = useState([
    { date: "", note: "" },
    { date: "", note: "" },
    { date: "", note: "" }
  ]);
  const [screening, setScreening] = useState([false, false, false, false]);
  const [screeningSubmitted, setScreeningSubmitted] = useState(false);

  useEffect(() => {
    const cachedAttendance = localStorage.getItem("attendance_class_ibu_hamil");
    if (cachedAttendance) {
      try { setAttendance(JSON.parse(cachedAttendance)); } catch (e) {}
    }
    const cachedScreening = localStorage.getItem("screening_mental_trimester_1");
    if (cachedScreening) {
      try { setScreening(JSON.parse(cachedScreening)); } catch (e) {}
    }
  }, []);

  const handleSaveAttendance = () => {
    localStorage.setItem("attendance_class_ibu_hamil", JSON.stringify(attendance));
    setIsEditing(false);
  };

  const updateScreening = (idx: number, val: boolean) => {
    const next = [...screening];
    next[idx] = val;
    setScreening(next);
    localStorage.setItem("screening_mental_trimester_1", JSON.stringify(next));
  };

  const activeCount = screening.filter(Boolean).length;
  const getScreeningAdvice = () => {
    if (activeCount === 0) return "Kondisi emosi Ibu tampak sehat dan stabil! Tetap pertahankan pikiran positif.";
    if (activeCount <= 2) return "Ibu mengalami tingkat cemas ringan. Perbanyak relaksasi dan latihan napas.";
    return "Ibu mengalami gejala depresi sedang/berat. Segera konsultasikan ke dokter atau psikolog Puskesmas.";
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Kehamilan bukan hanya tentang kesehatan fisik, melainkan juga kesehatan mental. Di Trimester 1, perubahan hormon yang drastis seringkali mempengaruhi emosi ibu.
      </p>
      <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 mb-4 flex items-center gap-2">🧠 Kesehatan Jiwa Ibu Hamil</h2>
      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-5 mb-8 shadow-sm">
        <h4 className="font-extrabold text-sm text-brand-primary mb-3">Skrining Mandiri Kesehatan Jiwa</h4>
        <div className="space-y-2.5 text-xs font-semibold text-base-text-primary">
          {["Merasa cemas, tegang, atau gelisah berlebih dalam 2 minggu terakhir.",
            "Kehilangan minat atau kesenangan dalam aktivitas sehari-hari.",
            "Merasa murung, sedih, atau putus asa.",
            "Mengalami gangguan tidur akibat pikiran cemas."].map((q, idx) => (
            <label key={idx} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={screening[idx]} onChange={(e) => { updateScreening(idx, e.target.checked); setScreeningSubmitted(false); }} className="mt-0.5 rounded text-brand-primary w-4 h-4 cursor-pointer" />
              <span>{q}</span>
            </label>
          ))}
        </div>
        {screeningSubmitted && (
          <div className="mt-4 p-3.5 bg-brand-soft/20 border border-brand-primary/25 rounded-xl text-xs leading-relaxed font-semibold text-brand-primary">
            <strong>Hasil Skrining:</strong> {getScreeningAdvice()}
          </div>
        )}
        <button onClick={() => setScreeningSubmitted(true)} className="mt-4 w-full py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-xs hover:bg-status-pink-dark transition cursor-pointer">Cek Hasil Skrining</button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-base-text-primary">Absensi Kehadiran Kelas Ibu Hamil:</h3>
        {isEditing ? (
          <button onClick={handleSaveAttendance} className="px-3.5 py-1.5 bg-brand-primary text-base-white text-xs font-bold rounded-lg cursor-pointer">Selesai</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-3.5 py-1.5 border border-brand-primary text-brand-primary text-xs font-bold rounded-lg cursor-pointer">Ubah Absensi</button>
        )}
      </div>
      <div className="overflow-x-auto border border-base-border/20 rounded-xl bg-base-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-base-bg text-base-text-primary border-b font-bold"><th className="py-3 px-4 text-center w-12">No.</th><th className="py-3 px-4 w-52">Tanggal Kelas</th><th className="py-3 px-4">Materi</th></tr>
          </thead>
          <tbody>
            {attendance.map((row, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-3 px-4 text-center font-bold">{idx + 1}</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <CustomDatePicker value={row.date} onChange={(val) => { const next = [...attendance]; next[idx].date = val; setAttendance(next); }} outputFormat="iso" label="Tanggal" />
                  ) : (<span>{formatDate(row.date)}</span>)}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input type="text" value={row.note} onChange={(e) => { const next = [...attendance]; next[idx].note = e.target.value; setAttendance(next); }} className="w-full border rounded px-2 py-1" />
                  ) : (<span>{row.note || "-"}</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function L7ArticleContent() {
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

function L8ArticleContent() {
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

function L9ArticleContent() {
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

function L10ArticleContent() {
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

function L11ArticleContent() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Paragraf Pembuka */}
      <p className="text-sm text-base-text-secondary leading-relaxed">
        Proses persalinan yang lancar memerlukan deteksi dini atas tanda-tanda persalinan normal maupun tanda bahaya. Setelah bayi lahir, langkah pertama yang sangat dianjurkan oleh Kemenkes adalah pelaksanaan Inisiasi Menyusu Dini (IMD) demi kesehatan optimal bayi.
      </p>

      {/* Grid Tanda Awal & Mengurangi Rasa Sakit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
        <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-4.5 shadow-xs">
          <h4 className="font-bold text-status-blue-solid mb-2 flex items-center gap-1.5">
            ⚡ Tanda Awal Proses Melahirkan:
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Keluar lendir bercampur darah segar dari jalan lahir.</li>
            <li>Merembes atau keluar cairan ketuban jernih dari jalan lahir.</li>
            <li>Perut mulas-mulas yang teratur, timbulnya semakin sering, kram semakin kuat, dan berlangsung semakin lama.</li>
          </ul>
        </div>
        
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-4.5 shadow-xs">
          <h4 className="font-bold text-status-purple-solid mb-2 flex items-center gap-1.5">
            🌬️ Mengurangi Rasa Sakit Bersalin:
          </h4>
          <p className="text-base-text-secondary font-medium leading-relaxed">
            Untuk mengurangi rasa sakit ketika bersalin secara mandiri, Ibu dianjurkan untuk menarik napas panjang melalui hidung secara perlahan dan keluarkan melalui mulut saat kontraksi/mulas datang. Minta suami/pendamping memijat punggung bawah secara perlahan.
          </p>
        </div>
      </div>

      {/* Bagian Tanda Bahaya */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 flex items-center gap-2">
          🚨 Tanda Bahaya Pada Proses Melahirkan
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "💦", title: "Ketuban Hijau & Bau", desc: "Air ketuban pcah berwarna keruh kehijauan dan berbau tidak sedap/busuk." },
            { icon: "😫", title: "Ibu Gelisah / Nyeri Hebat", desc: "Ibu tampak sangat gelisah atau mengalami kesakitan yang luar biasa ekstrem." },
            { icon: "🧠", title: "Ibu Mengalami Kejang", desc: "Ibu mengalami kejang-kejang (gejala eklampsia pasca bersalin yang berbahaya)." },
            { icon: "🥵", title: "Ibu Tidak Kuat Mengejan", desc: "Ibu merasa kelelahan hebat dan tidak memiliki tenaga lagi untuk mengejan." },
            { icon: "🩸", title: "Perdarahan Jalan Lahir", desc: "Keluar darah segar mengalir sangat banyak dari jalan lahir sebelum bayi lahir." },
            { icon: "👶", title: "Tali Pusat/Tangan Keluar", desc: "Tali pusat bayi, tangan, atau kaki bayi keluar mendahului kepala bayi." }
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
          <h4 className="font-extrabold text-sm mb-1">RUJUK DARURAT:</h4>
          <p className="font-medium leading-relaxed">
            Jika mengalami minimal salah satu tanda bahaya pada proses melahirkan di atas, petugas kesehatan harus segera merujuk Ibu ke Rumah Sakit terdekat!
          </p>
        </div>
      </div>

      {/* Bagian IMD */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 flex items-center gap-2">
          🍼 Inisiasi Menyusu Dini (IMD)
        </h2>
        <p className="text-xs text-base-text-secondary leading-relaxed">
          Inisiasi Menyusu Dini (IMD) adalah proses meletakkan bayi secara tengkurap di dada ibu segera setelah lahir, sehingga kulit bayi melekat pada kulit ibu selama minimal 1 jam untuk mencari puting susu secara alami.
        </p>

        <div className="bg-brand-soft/20 border border-brand-primary/15 rounded-2xl p-5 text-xs leading-relaxed shadow-xs">
          <h4 className="font-bold text-brand-primary mb-3 flex items-center gap-1.5">
            ✨ Manfaat IMD bagi Ibu & Bayi:
          </h4>
          <ul className="list-disc pl-4 space-y-2.5 text-base-text-secondary font-medium">
            <li>
              <strong className="text-base-text-primary">Kehangatan Alami:</strong> Sentuhan kulit ke kulit menjaga suhu tubuh bayi tetap hangat dan stabil secara alami.
            </li>
            <li>
              <strong className="text-base-text-primary">Meningkatkan Kekebalan:</strong> Bayi mendapatkan cairan <strong className="text-brand-primary">Kolostrum</strong> (ASI pertama berwarna kekuningan) yang kaya antibodi untuk melindunginya dari infeksi.
            </li>
            <li>
              <strong className="text-base-text-primary">Ikatan Kasih Sayang (Bonding):</strong> Membangun ikatan emosional yang kuat antara Ibu dan bayi sejak detik pertama lahir.
            </li>
            <li>
              <strong className="text-base-text-primary">Merangsang Kontraksi Rahim:</strong> Isapan bayi merangsang pelepasan hormon oksitosin yang membantu rahim ibu berkontraksi sehingga meminimalisir risiko perdarahan pasca salin.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L12ArticleContent() {
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

function L13ArticleContent() {
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

function L14ArticleContent() {
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

function L15ArticleContent() {
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

function L16ArticleContent() {
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

function L17ArticleContent() {
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

function L18ArticleContent() {
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
            <label 
              key={item.id} 
              className={`flex items-start gap-3 p-3 bg-base-white border rounded-xl text-xs cursor-pointer transition-all select-none
                ${item.checked ? 'border-status-orange-solid bg-status-orange-light/5' : 'border-base-border/20 hover:border-base-border/40'}`}
            >
              {/* Checkbox */}
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => handleCheckboxChange(item.id)} 
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
            </label>
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

function L19ArticleContent() {
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
          <label 
            key={item.id} 
            className={`flex items-start gap-3 p-3 bg-base-white border rounded-xl text-xs cursor-pointer transition-all select-none
              ${item.checked ? 'border-status-orange-solid bg-status-orange-light/5' : 'border-base-border/20 hover:border-base-border/40'}`}
          >
            {/* Checkbox */}
            <div className="flex items-center h-5 mt-0.5 shrink-0">
              <input 
                type="checkbox" 
                checked={item.checked} 
                onChange={() => handleCheckboxChange(item.id)} 
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
          </label>
        ))}
      </div>

      {/* Catatan / Peringatan Evaluasi */}
      <div className="p-4 bg-status-orange-light/10 border border-status-orange-solid/20 rounded-2xl text-xs text-status-orange-solid font-bold leading-relaxed shadow-xs">
        ⚠️ Jika bayi BELUM bisa melakukan salah satu hal di atas, segera bawa ke Bidan/Puskesmas untuk evaluasi tumbuh kembang lebih lanjut.
      </div>
    </div>
  );
}

// Fallback Mock Content Generator
function getMockContent(id: string, title: string): string {
  return `<p>Konten artikel statis untuk ID <strong>${id}</strong> - <strong>${title}</strong>.</p>`;
}



// -----------------------------------------------------------------------------