"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen, FiTrash, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare, MdEdit, MdCalendarMonth } from "react-icons/md";
import { mockArticles } from "../data";
import type { Article } from "../data";
import { useUserRole } from "@/context/UserRoleContext";
import CustomDatePicker from "@/components/CustomDatePicker";

// Extends Article interface to allow custom content field
interface ExtendedArticle extends Article {
  content?: string;
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
      // Add some high-quality content fallback for mock articles so they look real
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
      // Mock article, add to deleted_articles_ids
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
      {/* Styles to render rich text correctly */}
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
          {/* Edit Button */}
          {role !== "ibu" && (
            <Link
              href={`/edukasi/tambah?edit=${article.id}`}
              className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-base-white text-xs font-bold rounded-xl transition duration-150 flex items-center"
              title="Edit Konten"
            >
              Edit
            </Link>
          )}

          {/* Delete Button */}
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
        
        {/* Banner Cover */}
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
          {/* Metadata */}
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

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-text-primary leading-tight">
            {article.title}
          </h1>

          <div className="w-full h-px bg-base-border/30"></div>

          {/* Content Rendering */}
          {article.type === "Video" ? (
            <div className="space-y-6">
              {/* Mock Video Player */}
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

              {/* Video Description */}
              <div className="article-content">
                <h2 className="text-lg font-bold text-base-text-primary mb-2">Deskripsi Video</h2>
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content || "" }}
                  className="text-sm leading-relaxed"
                />
              </div>
            </div>
          ) : (
            /* Text Article Content */
            id === "L6" ? (
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-share-backdrop">
          <div className="bg-base-white rounded-[28px] shadow-xl w-full max-w-sm overflow-visible border border-base-border/20 p-8 pt-10 text-center relative animate-share-content">
            
            {/* Circular badge on the top edge */}
            <div className="w-16 h-16 bg-base-white rounded-full flex items-center justify-center shadow-md absolute top-0 left-1/2 border border-base-border/30 animate-link-badge">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                  <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <g transform="rotate(-45 16 16)" filter="url(#drop-shadow)">
                  {/* Bottom/Left Loop */}
                  <path d="M15 13H9C6.79086 13 5 14.7909 5 17C5 19.2091 6.79086 21 9 21H15C17.2091 21 19 19.2091 19 17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Top/Right Loop */}
                  <path d="M13 15C13 12.7909 14.7909 11 17 11H23C25.2091 11 27 12.7909 27 15C27 17.2091 25.2091 19 23 19H17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                  {/* Center overlap link to make it look interlocking */}
                  <path d="M15 13H17" stroke="url(#chrome-grad)" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            {/* Circled x close button */}
            <button 
              onClick={() => { setShowShareModal(false); setCopiedLink(false); }} 
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F8F9FD] border border-[#E5E9F2] hover:bg-[#E5E9F2]/50 flex items-center justify-center text-base-text-secondary hover:text-base-text-primary transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-2 mb-6 mt-2 animate-stagger-1">
              <h3 className="text-xl font-bold text-[#1E1E1E]">Share with Friends</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-[240px] mx-auto">
                Trading is more effective when you connect with friends!
              </p>
            </div>

            {/* Share link input box */}
            <div className="space-y-2 text-left mb-6 animate-stagger-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Share you link</span>
              <div className="flex items-center justify-between bg-[#F5F7FB] border border-[#E5E9F2] rounded-2xl px-4 py-3.5 text-xs text-[#1E1E1E] font-medium transition-all duration-200 focus-within:border-brand-primary/45 focus-within:ring-1 focus-within:ring-brand-primary/20">
                <span className="truncate max-w-[200px] select-all text-[#4B5563]">{shareUrl}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }} 
                  className="text-[#6B7280] hover:text-[#1E1E1E] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center"
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

            {/* Share to social media icons */}
            <div className="space-y-3 text-left animate-stagger-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Share to</span>
              <div className="grid grid-cols-5 gap-2 text-center">
                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#1877F2"/>
                    <path d="M24 20H21V30H17V20H15V16.5H17V14.25C17 11.25 18.75 9.5 21.5 9.5C22.75 9.5 24 9.75 24 9.75V12.75H22.5C21 12.75 20.5 13.75 20.5 14.75V16.5H24.5L24 20Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Facebook</span>
                </a>

                {/* X */}
                <a 
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="black"/>
                    <path d="M26 11H28.5L22.5 17.5L29.5 27H24L19.5 21.25L14.75 27H12L18.5 20.25L12 11H17.5L21.75 16.5L26 11ZM25 25.5H26.5L16.5 12.5H15L25 25.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">X</span>
                </a>

                {/* Whatsapp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#25D366"/>
                    <path d="M20 9C13.9 9 9 13.9 9 20C9 22 9.5 23.9 10.5 25.6L9 31L14.6 29.5C16.2 30.5 18.1 31 20 31C26.1 31 31 26.1 31 20C31 13.9 26.1 9 20 9ZM25.2 24.1C24.9 25 23.9 25.7 23 25.9C22.4 26 21.6 26.1 18.8 24.9C15.2 23.4 12.9 19.7 12.7 19.5C12.5 19.3 11 17.3 11 15.2C11 13.1 12 12.1 12.4 11.6C12.8 11.1 13.5 10.9 14.1 10.9C14.3 10.9 14.5 10.9 14.7 10.9C15.2 10.9 15.5 10.9 15.8 11.6C16.2 12.5 17.1 14.7 17.2 14.9C17.3 15.1 17.4 15.4 17.2 15.7C17.1 16 16.9 16.2 16.7 16.5C16.5 16.7 16.2 17 16 17.2C15.8 17.4 15.5 17.6 15.8 18.1C16.1 18.6 17.1 20.3 18.7 21.7C20.7 23.5 22.4 24.1 22.9 24.3C23.4 24.5 23.7 24.4 24 24.1C24.3 23.8 24.9 23.1 25.2 22.6C25.5 22.1 25.9 22.2 26.3 22.3C26.7 22.4 28.7 23.4 29.1 23.6C29.5 23.8 29.8 23.9 29.9 24.1C30 24.3 30 25.1 29.6 25.9C29.2 26.7 27 27.5 25.2 24.1Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Whatsapp</span>
                </a>

                {/* Telegram */}
                <a 
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#179CDE"/>
                    <path d="M27.5 12.5L11.5 18.7C10.4 19.1 10.4 19.8 11.3 20.1L15.4 21.4L24.9 15.4C25.3 15.1 25.7 15.3 25.4 15.6L17.7 22.6L17.4 26.8C17.8 26.8 18 26.6 18.2 26.4L20.2 24.5L24.4 27.6C25.2 28 25.8 27.8 26 26.9L28.8 13.8C29.1 12.6 28.3 12.1 27.5 12.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Telegram</span>
                </a>

                {/* Linkedin */}
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#0A66C2"/>
                    <path d="M14.5 13C14.5 13.8 13.8 14.5 13 14.5C12.2 14.5 11.5 13.8 11.5 13C11.5 12.2 12.2 11.5 13 11.5C13.8 11.5 14.5 12.2 14.5 13ZM11.5 27H14.5V17H11.5V27ZM22.5 21.5V27H25.5V21.1C25.5 18.2 24.8 16.5 21.8 16.5C20.3 16.5 19.3 17.3 18.9 18.1H18.8V17H16V27H19V21.5C19 20.1 19.3 19.2 20.5 19.2C21.7 19.2 22.5 20.1 22.5 21.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Linkedin</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// Helper to provide realistic rich HTML mockup articles for preview
function getMockContent(id: string, title: string): string {
  if (id === "L1") {
    return `
      <p>Memasuki usia 6 bulan, kebutuhan gizi bayi tidak lagi dapat dipenuhi hanya oleh ASI. Disinilah peran MPASI (Makanan Pendamping ASI) pertama sangat krusial untuk mencegah stunting dan melatih keterampilan motorik oral anak.</p>
      
      <h2>1. Jadwal Pemberian MPASI</h2>
      <p>Jadwal makan sebaiknya teratur agar bayi mengenali rasa lapar dan kenyang. Berikut adalah jadwal yang disarankan untuk bayi usia 6 bulan:</p>
      <ul>
        <li><strong>06.00:</strong> ASI</li>
        <li><strong>08.00:</strong> MPASI Utama Pagi (Porsi 2-3 sendok makan)</li>
        <li><strong>10.00:</strong> Selingan buah lumat atau ASI</li>
        <li><strong>12.00:</strong> MPASI Utama Siang</li>
        <li><strong>14.00:</strong> ASI</li>
        <li><strong>16.00:</strong> Selingan sore / ASI</li>
        <li><strong>18.00:</strong> MPASI Utama Sore (opsional/bertahap)</li>
      </ul>

      <h2>2. Tekstur Makanan</h2>
      <p>Untuk bayi 6 bulan, tekstur wajib berupa <strong>puree halus (bubur saring)</strong>. Makanan harus disaring menggunakan saringan kawat agar tidak menyisakan serat kasar yang dapat membuat bayi tersedak.</p>
      
      <blockquote>
        "Jangan memberikan makanan yang terlalu encer. Makanan pendamping harus cukup kental sehingga tidak mudah jatuh dari sendok saat dimiringkan." - Panduan Gizi Kemenkes
      </blockquote>

      <h2>3. Contoh Porsi dan Kandungan Gizi</h2>
      <p>Gunakan konsep menu lengkap (mengandung karbohidrat, protein hewani, lemak, sedikit sayur/buah). Berikut adalah tabel takaran gizi harian yang direkomendasikan:</p>

      <table>
        <thead>
          <tr>
            <th>Bahan Makanan</th>
            <th>Fungsi Utama</th>
            <th>Porsi per Sajian</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Beras Merah/Putih</td>
            <td>Energi & Karbohidrat</td>
            <td>1-1.5 sendok makan</td>
          </tr>
          <tr>
            <td>Hati Ayam / Daging Sapi</td>
            <td>Zat Besi & Protein Hewani</td>
            <td>1 sendok makan (haluskan)</td>
          </tr>
          <tr>
            <td>Minyak Kelapa / Mentega</td>
            <td>Lemak Tambahan (Kalori)</td>
            <td>1/2 sendok teh</td>
          </tr>
          <tr>
            <td>Bayam / Wortel</td>
            <td>Vitamin & Mineral</td>
            <td>Seujung sendok (hanya perkenalan)</td>
          </tr>
        </tbody>
      </table>

      <img src="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" alt="MPASI Sehat Bayi 6 Bulan" />

      <h2>Kesimpulan</h2>
      <p>Mulailah dengan sabar dan biarkan bayi menikmati proses belajarnya. Tanda MPASI berhasil adalah ketika kenaikan berat badan bayi sesuai kurva KMS di posyandu.</p>
    `;
  }
  
  if (id === "L2") {
    return `
      <p>Imunisasi adalah langkah preventif paling efektif untuk melindungi anak dari penyakit menular berbahaya. Di Indonesia, Kementerian Kesehatan menetapkan jadwal imunisasi dasar wajib yang harus didapatkan lengkap sebelum anak berusia 1 tahun.</p>
      
      <blockquote>
        "Mencegah jauh lebih baik, lebih murah, dan lebih aman daripada mengobati. Imunisasi lengkap melatih sistem imun anak agar siap menghadapi infeksi nyata."
      </blockquote>

      <h2>Jadwal Imunisasi Lengkap Usia 0 - 12 Bulan</h2>
      <p>Pastikan buah hati Anda mendapatkan imunisasi berikut tepat waktu sesuai dengan bulannya:</p>

      <table>
        <thead>
          <tr>
            <th>Usia Anak</th>
            <th>Jenis Imunisasi Wajib</th>
            <th>Melindungi Dari Penyakit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kurang dari 24 Jam</td>
            <td>Hepatitis B (HB-0)</td>
            <td>Kerusakan hati (Hepatitis B)</td>
          </tr>
          <tr>
            <td>1 Bulan</td>
            <td>BCG & Polio 1</td>
            <td>TBC (Tuberkulosis) & Kelumpuhan (Polio)</td>
          </tr>
          <tr>
            <td>2 Bulan</td>
            <td>DPT-HB-Hib 1, Polio 2, PCV 1, Rotavirus 1</td>
            <td>Difteri, Tetanus, Pertusis, Radang Paru, Diare Akut</td>
          </tr>
          <tr>
            <td>3 Bulan</td>
            <td>DPT-HB-Hib 2, Polio 3, Rotavirus 2</td>
            <td>Difteri, Tetanus, Batuk Rejan, Diare Rotavirus</td>
          </tr>
          <tr>
            <td>4 Bulan</td>
            <td>DPT-HB-Hib 3, Polio 4, IPV (Polio suntik), Rotavirus 3</td>
            <td>Perlindungan ganda polio dan tetanus infeksius</td>
          </tr>
          <tr>
            <td>9 Bulan</td>
            <td>Campak-Rubella (MR) 1, PCV 3</td>
            <td>Campak dan kecacatan janin bawaan (Rubella)</td>
          </tr>
          <tr>
            <td>12 Bulan</td>
            <td>PCV Lanjutan</td>
            <td>Penguat kekebalan paru anak</td>
          </tr>
        </tbody>
      </table>

      <h2>Apa yang Harus Dilakukan Setelah Imunisasi?</h2>
      <p>Umumnya anak akan mengalami reaksi ringan atau KIPI (Kejadian Ikutan Pasca Imunisasi) seperti demam ringan atau kemerahan di bekas suntikan. Langkah penanganannya:</p>
      <ol>
        <li>Kompres area bekas suntikan dengan kain bersih yang dibasahi air dingin.</li>
        <li>Berikan ASI lebih sering untuk menjaga hidrasi bayi.</li>
        <li>Berikan obat penurun panas sesuai dosis rekomendasi dokter atau bidan jika suhu tubuh di atas 38°C.</li>
      </ol>
    `;
  }

  if (id === "L3") {
    return `
      <p><strong>1000 Hari Pertama Kehidupan (1000 HPK)</strong> adalah masa paling penting dalam pertumbuhan dan perkembangan anak. Masa ini terdiri dari <strong>270 hari</strong> selama bayi berada dalam kandungan ibu, dan <strong>730 hari</strong> atau dua tahun pertama kehidupan anak setelah dilahirkan.</p>
      
      <blockquote>
        "Masa 1000 HPK sangat penting karena anak akan mengalami pertumbuhan dan perkembangan organ tubuh penting (otak, jantung, hati, ginjal, paru-paru, dan tulang) secara sangat pesat yang berdampak pada kualitas kesehatannya di masa depan."
      </blockquote>

      <h2>Tahapan Perkembangan Otak Anak</h2>
      <p>Kapasitas otak berkembang sangat cepat pada periode emas ini:</p>
      <ul>
        <li><strong>25% Saat Lahir:</strong> Otak mulai membentuk sambungan sel saraf awal.</li>
        <li><strong>70% Di Usia 0 - 1 Tahun:</strong> Periode emas belajar sensorik, visual, dan motorik.</li>
        <li><strong>85% Di Usia 1 - 3 Tahun:</strong> Puncak perkembangan kemampuan berbahasa dan kognitif berpikir anak.</li>
      </ul>

      <h2>Mengapa Nutrisi 1000 HPK Harus Optimal?</h2>
      <p>Kekurangan asupan gizi pada masa ini dapat menyebabkan gangguan pertumbuhan fisik dan otak yang bersifat <strong>permanen (tidak dapat diperbaiki)</strong>, termasuk tubuh pendek atau stunting serta rendahnya kemampuan berpikir anak saat dewasa. Pencegahan harus dilakukan sejak masa calon pengantin, kehamilan, nifas, hingga anak berusia 2 tahun.</p>

      <h2>Layanan Kesehatan Gratis Selama Kehamilan</h2>
      <p>Gunakan fasilitas kesehatan (Puskesmas/Posyandu) untuk mendapatkan pemeriksaan gratis berikut:</p>
      <table>
        <thead>
          <tr>
            <th>Layanan Kesehatan Ibu</th>
            <th>Layanan Kesehatan Bayi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pemeriksaan Kehamilan Bidan/Dokter</td>
            <td>Pemeriksaan Kondisi & Denyut Jantung Bayi</td>
          </tr>
          <tr>
            <td>Pemberian Tablet Tambah Darah (TTD)</td>
            <td>Imunisasi Tetanus Toxoid (TT)</td>
          </tr>
          <tr>
            <td>Pemeriksaan Status Gizi & LILA</td>
            <td>Pemeriksaan USG Gratis (3 Kali)</td>
          </tr>
          <tr>
            <td>Pemeriksaan Tekanan Darah & Laboratorium</td>
            <td>Kelas Ibu Hamil & Konseling Menyusui</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  if (id === "L4") {
    return `
      <p>Kehamilan trimester pertama (usia 1-3 bulan) adalah masa pembentukan organ vital janin. Pada bulan pertama janin baru sebesar <strong>biji beras</strong>, dan pada bulan ketiga telah berkembang sebesar <strong>jeruk nipis</strong> (panjang sekitar 9 cm, berat 28 gram). Ibu disarankan melakukan periksa kehamilan minimal 6 kali oleh bidan/dokter.</p>

      <blockquote>
        "Selama 9 bulan kehamilan, berat badan ibu hamil idealnya naik sebanyak 5 - 10 kg sesuai dengan status gizi ibu sebelum hamil."
      </blockquote>

      <h2>Panduan Porsi Makan & Minum Harian Trimester 1</h2>
      <p>Porsi makanan harian harus padat gizi untuk mendukung pembentukan organ janin. Berikut adalah tabel porsi makan harian yang direkomendasikan:</p>

      <table>
        <thead>
          <tr>
            <th>Bahan Makanan</th>
            <th>12 Minggu Pertama</th>
            <th>Keterangan per Porsi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Nasi atau Makanan Pokok</strong></td>
            <td>5 porsi</td>
            <td>
              <ul>
                <li>100 g atau 3/4 gelas nasi</li>
                <li>125 g atau 3 buah jagung sedang</li>
                <li>210 g atau 2 kentang sedang</li>
                <li>120 g atau 1/2 potong singkong</li>
                <li>70 g atau 3 iris roti putih</li>
                <li>200 g atau 2 gelas mie basah</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td><strong>Protein Hewani</strong><br/><small style="color: #6B7280;">Ikan, Telur, Ayam dll.</small></td>
            <td>4 porsi</td>
            <td>
              <ul>
                <li>50 g atau 1 potong sedang ikan</li>
                <li>55 g atau 1 butir telur Ayam</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td><strong>Protein Nabati</strong><br/><small style="color: #6B7280;">Tempe, Tahu, dll.</small></td>
            <td>4 porsi</td>
            <td>
              <ul>
                <li>50 g atau 1 potong sedang tempe</li>
                <li>100 g atau 2 potong sedang tahu</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td><strong>Sayur-sayuran</strong></td>
            <td>4 porsi</td>
            <td>100 g atau 1 mangkuk sayur matang tanpa kuah</td>
          </tr>
          <tr>
            <td><strong>Buah-buahan</strong></td>
            <td>4 porsi</td>
            <td>
              <ul>
                <li>100 g atau 1 potong sedang pisang</li>
                <li>100-190 g atau 1 potong besar pepaya</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td><strong>Minyak/Lemak</strong></td>
            <td>5 porsi</td>
            <td>5 g atau 1 sendok teh, bersumber dari pengolahan makanan seperti menggoreng, menumis, santan, kemiri, mentega dan sumber lemak lainnya. Minyak/lemak termasuk santan yang digunakan dalam pengolahan, makanan digoreng, ditumis atau dimasak dengan santan.</td>
          </tr>
          <tr>
            <td><strong>Gula</strong></td>
            <td>2 porsi</td>
            <td>10 g atau 1 sendok makan bersumber dari kue-kue manis, minum teh manis dan lain-lainnya</td>
          </tr>
        </tbody>
      </table>

      <h2>Batasan Penting Konsumsi Harian</h2>
      <ul>
        <li><strong>Garam:</strong> Batasi konsumsi garam paling banyak <strong>1 sendok teh per hari</strong> guna mencegah hipertensi kehamilan (preeklamsia).</li>
        <li><strong>Air Putih:</strong> Minum air putih minimal <strong>8 - 12 gelas per hari</strong> untuk mencegah dehidrasi dan menjaga volume air ketuban.</li>
        <li><strong>Minuman Kafein:</strong> Batasi konsumsi kopi, teh, dan minuman bersoda. Hindari alkohol sama sekali.</li>
      </ul>
    `;
  }
  if (id === "L5") {
    return `
      <p class="text-sm text-base-text-secondary leading-relaxed mb-6">
        Ibu hamil trimester pertama (usia kehamilan 1-12 minggu) wajib mengenali dan mewaspadai berbagai tanda bahaya, serta memahami tata cara perawatan sehari-hari dan larangan aktivitas fisik sesuai standar panduan Buku KIA 2024 Halaman 8 dan 9.
      </p>

      <h2 class="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        Tanda Bahaya Pada Trimester 1 (Segera ke Puskesmas/Rumah Sakit)
      </h2>
      <p class="text-xs text-base-text-secondary mb-4 italic">* Segera bawa ibu hamil periksa ke dokter/bidan jika mengalami salah satu gejala di bawah ini:</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <!-- Demam Tinggi -->
        <div class="bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-status-red-solid/10 text-status-red-solid flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <h4 class="font-extrabold text-xs text-base-text-primary">Demam Tinggi</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed">Suhu tubuh di atas 38°C bisa menandakan infeksi sistemik yang berbahaya bagi janin.</p>
        </div>

        <!-- Nyeri Perut Hebat -->
        <div class="bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-status-red-solid/10 text-status-red-solid flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </div>
          <h4 class="font-extrabold text-xs text-base-text-primary">Nyeri Perut Hebat</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed">Kram perut bawah yang sangat menusuk berisiko keguguran atau kehamilan ektopik.</p>
        </div>

        <!-- Mual & Muntah Hebat -->
        <div class="bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-status-red-solid/10 text-status-red-solid flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h4 class="font-extrabold text-xs text-base-text-primary">Mual & Muntah Berlebih</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed">Muntah terus menerus hingga tubuh lemas dan cairan terbuang (Hiperemesis Gravidarum).</p>
        </div>

        <!-- Perdarahan -->
        <div class="bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
          <div class="w-12 h-12 rounded-full bg-status-red-solid/10 text-status-red-solid flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
          </div>
          <h4 class="font-extrabold text-xs text-base-text-primary">Perdarahan / Flek Darah</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed">Keluar flek atau darah merah segar dari jalan lahir, tanda ancaman keguguran.</p>
        </div>

        <!-- Sakit Saat Kencing / Keputihan Gatal -->
        <div class="bg-status-red-light/20 border border-status-red-solid/25 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 sm:col-span-2 md:col-span-1">
          <div class="w-12 h-12 rounded-full bg-status-red-solid/10 text-status-red-solid flex items-center justify-center">
            <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
          </div>
          <h4 class="font-extrabold text-xs text-base-text-primary">Keluhan Organ Intim</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed">Nyeri saat kencing, keputihan berlebih, gatal, atau berbau di daerah kewanitaan.</p>
        </div>
      </div>

      <h2 class="text-lg font-extrabold text-status-orange-solid border-b pb-2 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Masalah Lain Pada Kehamilan
      </h2>
      <p class="text-xs text-base-text-secondary mb-4 italic">* Laporkan segera kepada kader, bidan, atau dokter bila menemui kondisi berikut:</p>
      
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8">
        <!-- Batuk Lama -->
        <div class="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center">
          <svg class="w-6 h-6 text-status-orange-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="font-bold text-[11px] text-base-text-primary">Batuk Lama</span>
          <span class="text-[10px] text-base-text-secondary mt-1">Batuk terus menerus lebih dari 2 minggu.</span>
        </div>
        <!-- Demam Menggigil -->
        <div class="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center">
          <svg class="w-6 h-6 text-status-orange-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <span class="font-bold text-[11px] text-base-text-primary">Demam Menggigil</span>
          <span class="text-[10px] text-base-text-secondary mt-1">Gejala khas infeksi malaria (terutama daerah endemis).</span>
        </div>
        <!-- Diare Berulang -->
        <div class="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center">
          <svg class="w-6 h-6 text-status-orange-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          <span class="font-bold text-[11px] text-base-text-primary">Diare Berulang</span>
          <span class="text-[10px] text-base-text-secondary mt-1">Buang air besar cair berkali-kali, berisiko dehidrasi.</span>
        </div>
        <!-- Jantung Berdebar -->
        <div class="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center">
          <svg class="w-6 h-6 text-status-orange-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <span class="font-bold text-[11px] text-base-text-primary">Jantung Berdebar</span>
          <span class="text-[10px] text-base-text-secondary mt-1">Jantung terasa terpompa kencang / nyeri dada.</span>
        </div>
        <!-- Cemas & Sulit Tidur -->
        <div class="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-xl p-3 text-center flex flex-col items-center">
          <svg class="w-6 h-6 text-status-orange-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          <span class="font-bold text-[11px] text-base-text-primary">Cemas Berlebih</span>
          <span class="text-[10px] text-base-text-secondary mt-1">Kecemasan psikologis tinggi & sulit tidur malam.</span>
        </div>
      </div>

      <h2 class="text-lg font-extrabold text-status-blue-solid border-b pb-2 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Perawatan Sehari-hari Ibu Hamil
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs font-semibold text-base-text-primary">
        <div class="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start">
          <span class="w-6 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-extrabold">1</span>
          <div>
            <h4 class="font-bold text-xs">Menjaga Kebersihan Diri</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">Mandi teratur, cuci tangan pakai sabun di air mengalir sebelum makan, serta ganti pakaian dan pakaian dalam secara teratur.</p>
          </div>
        </div>
        <div class="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start">
          <span class="w-6 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-extrabold">2</span>
          <div>
            <h4 class="font-bold text-xs">Istirahat Cukup</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">Tidur malam minimal 6 - 7 jam dan tidur siang santai sekitar 1 - 2 jam demi mengurangi ketegangan fisik ibu.</p>
          </div>
        </div>
        <div class="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start">
          <span class="w-6 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-extrabold">3</span>
          <div>
            <h4 class="font-bold text-xs">Stimulasi Perkembangan Bayi</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">Sering ajak janin berbicara, bersenandung, dan berikan sentuhan/usapan hangat pada perut ibu secara rutin.</p>
          </div>
        </div>
        <div class="flex gap-3 bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl items-start">
          <span class="w-6 h-6 rounded-full bg-brand-primary text-base-white flex items-center justify-center shrink-0 font-extrabold">4</span>
          <div>
            <h4 class="font-bold text-xs">Hubungan Suami Istri</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-1 leading-relaxed">Boleh dilakukan selama kondisi kehamilan sehat, tidak ada riwayat keguguran berulang, flek darah, atau ketuban pecah dini.</p>
          </div>
        </div>
      </div>

      <h2 class="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Hal yang DILARANG Selama Kehamilan
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        <!-- Minum Obat Tanpa Resep -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Obat Tanpa Resep</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Bisa memicu cacat bawaan lahir.</p>
        </div>
        <!-- Kerja Berat -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Kerja Berat / Lelah</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Memicu stres janin & kontraksi dini.</p>
        </div>
        <!-- Merokok -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Merokok / Asap</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Berat bayi lahir rendah (BBLR).</p>
        </div>
        <!-- Alkohol & Jamu -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Alkohol & Jamu</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Gangguan saraf janin & kerusakan hati.</p>
        </div>
        <!-- Stres Berlebihan -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Stres Berlebihan</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Mengganggu suplai darah & nutrisi.</p>
        </div>
        <!-- Tidur Telentang >10m -->
        <div class="bg-base-white border border-status-red-solid/20 rounded-xl p-3 text-center flex flex-col items-center relative overflow-hidden group">
          <div class="absolute inset-0 bg-status-red-solid/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg class="w-8 h-8 text-status-red-solid mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          <span class="font-extrabold text-[10px] text-base-text-primary leading-tight">Tidur Telentang</span>
          <p class="text-[9px] text-base-text-secondary mt-1 leading-tight">Trimester 2 & 3: risiko janin kurang oksigen.</p>
        </div>
      </div>

      <h2 class="text-lg font-extrabold text-status-orange-solid border-b pb-2 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
        Aktivitas Fisik yang DILARANG Selama Hamil
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mb-6 text-xs text-center font-bold text-base-text-primary">
        <div class="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-2 border-status-red-solid flex items-center justify-center text-status-red-solid font-extrabold mb-3">🚷</div>
          <h4>Jongkok Terlalu Lama</h4>
        </div>
        <div class="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-2 border-status-red-solid flex items-center justify-center text-status-red-solid font-extrabold mb-3">🚷</div>
          <h4>Melompat & Hentakan</h4>
        </div>
        <div class="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-2 border-status-red-solid flex items-center justify-center text-status-red-solid font-extrabold mb-3">🚷</div>
          <h4>Olahraga Keseimbangan</h4>
        </div>
        <div class="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-2 border-status-red-solid flex items-center justify-center text-status-red-solid font-extrabold mb-3">🚷</div>
          <h4>Membungkuk Tanpa Pegangan</h4>
        </div>
        <div class="p-4 bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl flex flex-col items-center">
          <div class="w-10 h-10 rounded-full border-2 border-status-red-solid flex items-center justify-center text-status-red-solid font-extrabold mb-3">🚷</div>
          <h4>Mengejan Sangat Kuat</h4>
        </div>
      </div>

      <div class="bg-brand-soft/20 border border-brand-primary/10 p-4.5 rounded-2xl text-xs font-semibold text-brand-primary">
        <h4 class="font-extrabold text-sm mb-1.5 flex items-center gap-1.5"><span class="text-base text-brand-primary">💡</span> Saran Latihan Fisik Trimester 1</h4>
        <p class="text-base-text-secondary leading-relaxed font-medium">Ibu diperbolehkan (dan disarankan) melakukan latihan fisik ringan seperti pemanasan, peregangan lembut, senam panggul, pendinginan, serta jalan kaki santai untuk menjaga stamina kehamilan.</p>
      </div>
    `;
  }

  if (id === "L6") {
    return `
      <p class="text-sm text-base-text-secondary leading-relaxed mb-6">
        Kehamilan bukan hanya tentang kesehatan fisik, melainkan juga kesehatan mental. Di Trimester 1, perubahan hormon yang drastis seringkali mempengaruhi emosi ibu. Selain itu, partisipasi dalam Kelas Ibu Hamil sangat penting sebagai sarana edukasi kelompok demi kelancaran persalinan.
      </p>

      <h2 class="text-lg font-extrabold text-brand-primary border-b pb-2 mb-4 flex items-center gap-2">
        🧠 Kesehatan Jiwa Ibu Hamil
      </h2>
      <p class="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Selama kehamilan Ibu dapat mengalami berbagai gejolak emosi seperti mudah sedih, mudah marah, stres, cemas, dan depresi. Hal ini akan mempengaruhi kesehatan fisik dan emosi ibu hamil, serta perkembangan bayi dalam kandungannya.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-4.5">
          <h4 class="font-bold text-xs text-status-purple-solid mb-2">Kenali Gejala Gangguan Jiwa:</h4>
          <ul class="list-disc pl-4 space-y-1.5 text-xs text-base-text-secondary font-medium">
            <li>Ketegangan mental berupa kecemasan dan rasa khawatir yang berlebihan.</li>
            <li>Ketegangan fisik seperti gelisah, gemetar, tidak dapat rileks, dan sakit kepala.</li>
            <li>Berdebar-debar, berkeringat dingin, sesak napas, kepala terasa ringan, serta keluhan tidak nyaman di ulu hati.</li>
            <li>Merasa lelah berkepanjangan tapi sulit untuk tidur.</li>
            <li>Mudah tersinggung dan marah.</li>
            <li>Mengalami perubahan hubungan dengan suami atau keluarga.</li>
          </ul>
        </div>

        <div class="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-4.5">
          <h4 class="font-bold text-xs text-status-green-solid mb-2">YANG HARUS DILAKUKAN:</h4>
          <p class="text-xs text-base-text-secondary leading-relaxed mb-3">
            Ibu tidak bisa menjalani kehamilan sendiri dan membutuhkan dukungan penuh dari suami dan keluarga. Jaga kesehatan jiwa ibu selama kehamilan dengan:
          </p>
          <ul class="list-disc pl-4 space-y-1.5 text-xs text-base-text-secondary font-medium">
            <li>Tidur dan istirahat yang cukup.</li>
            <li>Makan makanan bergizi seimbang.</li>
            <li>Pergi ke Puskesmas atau fasilitas pelayanan kesehatan untuk melakukan pemeriksaan masalah kesehatan jiwa bila keluhan terus berlanjut.</li>
            <li>Suami atau keluarga mendampingi serta memberi perhatian dan bantuan yang dibutuhkan ibu.</li>
          </ul>
        </div>
      </div>

      <!-- Interactive Widget: Self Screening -->
      <div class="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-5 mb-8 shadow-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">📋</span>
          <h4 class="font-extrabold text-sm text-brand-primary">Skrining Mandiri Kesehatan Jiwa Ibu Hamil</h4>
        </div>
        <p class="text-xs text-base-text-secondary mb-4 leading-relaxed">
          Deteksi dini suasana perasaan (mood) Ibu secara mandiri untuk mencegah kecemasan atau depresi antenatal.
        </p>

        <div class="space-y-2.5 text-xs font-semibold text-base-text-primary">
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="screening_1" class="mt-0.5 rounded text-brand-primary w-4 h-4" onclick="window.checkScreening()" />
            <span>Merasa cemas, tegang, atau gelisah berlebih dalam 2 minggu terakhir.</span>
          </label>
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="screening_2" class="mt-0.5 rounded text-brand-primary w-4 h-4" onclick="window.checkScreening()" />
            <span>Kehilangan minat atau kesenangan dalam melakukan aktivitas sehari-hari.</span>
          </label>
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="screening_3" class="mt-0.5 rounded text-brand-primary w-4 h-4" onclick="window.checkScreening()" />
            <span>Merasa murung, sedih, putus asa, atau merasa tidak berharga.</span>
          </label>
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="screening_4" class="mt-0.5 rounded text-brand-primary w-4 h-4" onclick="window.checkScreening()" />
            <span>Mengalami gangguan tidur (insomnia atau tidur berlebihan) akibat pikiran cemas.</span>
          </label>
        </div>

        <div id="screening-result" class="hidden mt-4 p-3.5 bg-brand-soft/20 border border-brand-primary/25 rounded-xl text-xs leading-relaxed font-semibold text-brand-primary">
          <strong>Hasil Skrining:</strong> <span class="font-normal text-base-text-secondary" id="screening-advice"></span>
        </div>

        <button onclick="window.submitScreening()" class="mt-4 w-full py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-xs hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10 cursor-pointer">
          Cek Hasil Skrining Mandiri
        </button>

        <img src="x" onerror="this.style.display='none'; window.checkScreening = function(){}; window.submitScreening = function(){
          const c1 = document.getElementById('screening_1').checked;
          const c2 = document.getElementById('screening_2').checked;
          const c3 = document.getElementById('screening_3').checked;
          const c4 = document.getElementById('screening_4').checked;
          const count = (c1?1:0) + (c2?1:0) + (c3?1:0) + (c4?1:0);
          const resBox = document.getElementById('screening-result');
          const adviceText = document.getElementById('screening-advice');
          resBox.classList.remove('hidden');
          if (count === 0) {
            adviceText.innerHTML = 'Kondisi emosi Ibu tampak sehat dan stabil! Tetap pertahankan pikiran positif dan nikmati masa kehamilan.';
          } else if (count <= 2) {
            adviceText.innerHTML = 'Ibu mengalami tingkat stres/kecemasan ringan. Cobalah bicarakan dengan suami/keluarga, perbanyak istirahat, dan lakukan latihan napas dalam.';
          } else {
            adviceText.innerHTML = 'Ibu mengalami gejala stres/depresi sedang hingga berat. Segera konsultasikan dengan bidan, dokter di Puskesmas, atau psikolog untuk pendampingan emosional.';
          }
        }" />
      </div>

      <h2 class="text-lg font-extrabold text-brand-primary border-b pb-2 mb-4 flex items-center gap-2">
        👩‍🏫 Ikuti Kelas Ibu Hamil
      </h2>
      <p class="text-xs text-base-text-secondary leading-relaxed mb-4">
        Dengan mengikuti Kelas Ibu Hamil, Ibu bisa mempersiapkan fisik dan mental untuk kelancaran proses melahirkan. Selain itu juga mendapatkan dukungan dari ibu-ibu lain, serta memperoleh informasi tentang kehamilan, proses melahirkan, perawatan masa nifas, perawatan bayi baru lahir, kebutuhan dan pemenuhan gizi, serta pelayanan kesehatan yang diterima.
      </p>
      
      <div class="bg-status-yellow-light/20 border border-status-yellow-solid/25 rounded-2xl p-4.5 mb-6 text-xs font-semibold text-base-text-primary">
        📌 Untuk jadwal dan tempat pelaksanaan Kelas Ibu Hamil tanyakan pada petugas kesehatan. Minta suami/keluarga mendampingi mengikuti kelas paling sedikit 1 kali.
      </div>

      <h3 class="font-bold text-xs text-base-text-primary mb-3">Absensi Kehadiran Kelas Ibu Hamil (Diisi Mandiri):</h3>
      <div class="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-base-bg text-base-text-primary border-b font-bold">
              <th class="py-2.5 px-4 text-center w-12">No.</th>
              <th class="py-2.5 px-4 w-40">Tanggal Kelas</th>
              <th class="py-2.5 px-4">Materi / Nama & Paraf Kader</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-2 px-4 text-center font-bold">1</td>
              <td class="py-2 px-4"><input type="date" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
              <td class="py-2 px-4"><input type="text" placeholder="Materi Trimester 1 / Nama Kader" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
            </tr>
            <tr class="border-b">
              <td class="py-2 px-4 text-center font-bold">2</td>
              <td class="py-2 px-4"><input type="date" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
              <td class="py-2 px-4"><input type="text" placeholder="Materi Trimester 2 / Nama Bidan" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
            </tr>
            <tr>
              <td class="py-2 px-4 text-center font-bold">3</td>
              <td class="py-2 px-4"><input type="date" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
              <td class="py-2 px-4"><input type="text" placeholder="Materi Trimester 3 / Persiapan Lahir" class="border rounded px-1.5 py-0.5 text-xs w-full bg-base-white" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  if (id === "L7") {
    return `
      <p class="text-sm text-base-text-secondary leading-relaxed mb-6">
        Trimester kedua (usia kehamilan 4-6 bulan atau minggu ke-13 hingga 28) adalah masa ketika organ tubuh janin berkembang semakin matang dan ibu mulai merasakan gerakan pertamanya. Di masa ini, pemenuhan porsi gizi seimbang harian meningkat secara bertahap.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span class="text-3xl">🍎</span>
          <div class="text-xs">
            <h4 class="font-bold text-base-text-primary">Bulan Ke-4 (13-16 Minggu)</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin sebesar <strong>Apel</strong>. Berat sekitar 100 gram, organ-organ tubuh mulai berfungsi.</p>
          </div>
        </div>
        <div class="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span class="text-3xl">🌽</span>
          <div class="text-xs">
            <h4 class="font-bold text-base-text-primary">Bulan Ke-6 (21-24 Minggu)</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin sebesar <strong>Jagung</strong>. Berat sekitar 600 gram, kulit berkembang keriput halus.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div class="bg-[#F8FAF8] border border-[#CBDCCB] rounded-2xl p-4.5">
          <h4 class="font-bold text-status-green-solid mb-2 flex items-center gap-1">👶 Yang Dialami Bayi:</h4>
          <p class="text-base-text-secondary font-medium">Fungsi organ dan tubuh bayi berkembang, dimana bayi tumbuh mulai dari panjang 12.5 cm atau kira-kira sebesar apel sampai 34 cm dan berat sekitar 1000 gram atau kira-kira sebesar jagung di akhir bulan ke-6.</p>
        </div>
        <div class="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-4.5">
          <h4 class="font-bold text-status-blue-solid mb-2 flex items-center gap-1">👩 Yang Dialami Ibu:</h4>
          <p class="text-base-text-secondary font-medium">Gejala mual muntah (morning sickness) pada awal kehamilan mulai berkurang. Kenaikan berat badan bertambah sesuai status gizi sebelum hamil. Ibu juga mulai merasakan gerakan bayi seperti menendang, pada usia kehamilan 5 bulan.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 text-xs leading-relaxed">
        <div class="bg-status-orange-light/10 border border-status-orange-solid/15 rounded-2xl p-4.5">
          <h4 class="font-bold text-status-orange-solid mb-2 flex items-center gap-1">✅ Yang Harus Dilakukan:</h4>
          <ul class="list-disc pl-4 space-y-1 text-base-text-secondary font-medium">
            <li>Periksa kehamilan ke dokter atau bidan paling sedikit dua kali di trimester ini.</li>
            <li>Pantau gerak janin secara mandiri.</li>
            <li>Makan dengan porsi lebih kecil tapi sering, porsi ditambah dengan kudapan bergizi (lihat tabel porsi).</li>
            <li>Minum Tablet Tambah Darah (TTD) atau multivitamin setiap hari selama kehamilan.</li>
            <li>Kenali dan cek tanda bahaya kehamilan. Bila ada, segera pergi ke fasilitas kesehatan terdekat.</li>
            <li>Mulai merencanakan proses melahirkan atau kelahiran melalui diskusi dengan tenaga kesehatan.</li>
          </ul>
        </div>
        <div class="bg-status-purple-light/10 border border-status-purple-solid/15 rounded-2xl p-4.5">
          <h4 class="font-bold text-status-purple-solid mb-2 flex items-center gap-1">💡 Mengapa Harus Dilakukan?</h4>
          <ul class="list-disc pl-4 space-y-1 text-base-text-secondary font-medium">
            <li>Untuk memastikan ibu tetap sehat dan pertumbuhan bayi sesuai tahapannya.</li>
            <li>Agar ibu dan keluarga sudah memiliki perencanaan proses melahirkan/kelahiran sejak jauh hari demi keselamatan ibu dan bayi baru lahir.</li>
          </ul>
        </div>
      </div>

      <h2 class="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🍽️ Porsi Makan Ibu Hamil Trimester 2 (12-40 Minggu)
      </h2>
      <p class="text-xs text-base-text-secondary mb-4">
        Kebutuhan kalori ibu hamil meningkat pada trimester 2 dan 3 untuk pertumbuhan plasenta dan janin. Berikut takaran porsi makan per hari sesuai Buku KIA 2024:
      </p>

      <div class="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm mb-6">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-base-bg text-base-text-primary border-b font-bold">
              <th class="py-2.5 px-4">Bahan Makanan</th>
              <th class="py-2.5 px-4 text-center w-32">Porsi / Hari</th>
              <th class="py-2.5 px-4">Keterangan Takaran Porsi</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Nasi atau Makanan Pokok</td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">6 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">
                1 porsi = 100 g (3/4 gelas) nasi, ATAU 125 g (3 buah) jagung sedang, ATAU 210 g (2 buah) kentang sedang, ATAU 120 g (1/2 potong) singkong, ATAU 70 g (3 iris) roti putih.
              </td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Protein Hewani <small class="text-base-text-secondary block">(Ikan, Telur, Daging)</small></td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">
                1 porsi = 50 g (1 potong sedang) ikan, ATAU 55 g (1 butir) telur ayam, ATAU 50 g (1 potong sedang) daging ayam/sapi.
              </td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Protein Nabati <small class="text-base-text-secondary block">(Tempe, Tahu)</small></td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">
                1 porsi = 50 g (1 potong sedang) tempe, ATAU 100 g (2 potong sedang) tahu.
              </td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Sayur-sayuran</td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">1 porsi = 100 g sayur segar (1 mangkuk sayur matang tanpa kuah).</td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Buah-buahan</td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">
                1 porsi = 100 g (1 potong sedang) pisang, ATAU 100-190 g (1 potong besar) pepaya.
              </td>
            </tr>
            <tr class="border-b">
              <td class="py-3 px-4 font-bold">Minyak/Lemak</td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">5 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">
                1 porsi = 5 g (1 sendok teh) minyak goreng/mentega. Termasuk santan/minyak yang digunakan dalam menumis dan menggoreng.
              </td>
            </tr>
            <tr>
              <td class="py-3 px-4 font-bold">Gula</td>
              <td class="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">2 Porsi</td>
              <td class="py-3 px-4 text-base-text-secondary">1 porsi = 10 g (1 sendok makan) gula pasir / pemanis makanan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl p-4.5 text-xs font-semibold text-status-orange-solid">
        ⚠️ Batasi konsumsi garam paling banyak 1 sendok teh/hari dan minum air putih 8 - 12 gelas per hari.
      </div>
    `;
  }

  if (id === "L8") {
    return `
      <p class="text-sm text-base-text-secondary leading-relaxed mb-6">
        Mengenali tanda bahaya kehamilan trimester 2 sangat penting demi keselamatan Ibu dan janin. Jika Ibu mengalami salah satu dari gejala-gejala berikut, segera bawa ke bidan, dokter, Puskesmas, atau Rumah Sakit terdekat tanpa menunda.
      </p>

      <h2 class="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 9 Tanda Bahaya Kehamilan Trimester 2
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <!-- 1 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🤒</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">1. Demam Tinggi</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh panas tinggi, menandakan adanya infeksi sistemik yang berisiko bagi keselamatan janin.</p>
        </div>
        <!-- 2 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🤮</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">2. Muntah Darah</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Muntah parah atau bercampur darah segar yang menyebabkan ibu lemas dan tidak bisa makan sama sekali.</p>
        </div>
        <!-- 3 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🫁</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">3. Sesak Napas & Berdebar</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Napas tersengal pendek disertai jantung berdenyut sangat kencang dan dada terasa nyeri tertekan.</p>
        </div>
        <!-- 4 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🤰</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">4. Nyeri Perut Hebat</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Kram atau nyeri perut bagian bawah yang menusuk tajam, berisiko aborsi spontan atau kontraksi dini.</p>
        </div>
        <!-- 5 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">👁️</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">5. Pandangan Kabur</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Penglihatan berkunang-kunang atau mendadak buram, merupakan salah satu indikasi preeklampsia.</p>
        </div>
        <!-- 6 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🩸</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">6. Perdarahan Pervaginam</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar darah segar maupun flek kecokelatan dari jalan lahir. Tanda solusio plasenta atau plasenta previa.</p>
        </div>
        <!-- 7 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">💦</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">7. Air Ketuban Pecah/Bau</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar cairan merembes sangat banyak dari jalan lahir atau berbau tidak sedap/busuk.</p>
        </div>
        <!-- 8 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🤯</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">8. Pusing / Sakit Kepala Berat</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Sakit kepala berdenyut hebat yang tidak kunjung reda walau sudah beristirahat.</p>
        </div>
        <!-- 9 -->
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span class="text-3xl mb-2">🚽</span>
          <h4 class="font-extrabold text-xs text-base-text-primary">9. Sakit Saat Kencing / Gatal</h4>
          <p class="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Nyeri saat buang air kecil, keluar keputihan pekat berwarna kehijauan, gatal, atau berbau di organ intim.</p>
        </div>
      </div>

      <div class="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start">
        <span class="text-lg">🚨</span>
        <div>
          <h4 class="font-extrabold text-sm mb-1">TINDAKAN DARURAT:</h4>
          <p class="font-medium leading-relaxed">Jika Ibu hamil merasakan minimal 1 tanda bahaya di atas, segera bawa ke bidan desa, Puskesmas, atau langsung ke Instalasi Gawat Darurat (IGD) Rumah Sakit terdekat untuk pertolongan medis segera!</p>
        </div>
      </div>
    `;
  }

  if (id === "L9") {
    return `
      <p class="text-sm text-base-text-secondary leading-relaxed mb-6">
        Trimester ketiga (usia kehamilan 7-9 bulan atau minggu ke-29 hingga 40) adalah garis akhir menuju persalinan. Pada periode penting ini, ibu dan keluarga harus mematangkan perencanaan persiapan melahirkan demi kelancaran persalinan.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span class="text-3xl">🍉</span>
          <div class="text-xs">
            <h4 class="font-bold text-base-text-primary">Perkembangan Janin Trimester 3</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin bertambah dari sebesar <strong>Pepaya</strong> pada bulan ke-7 menjadi sebesar <strong>Semangka</strong> pada bulan ke-9 sebelum lahir.</p>
          </div>
        </div>
        <div class="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span class="text-3xl">🤝</span>
          <div class="text-xs">
            <h4 class="font-bold text-base-text-primary">Dukungan Keluarga & Suami</h4>
            <p class="text-[11px] text-base-text-secondary font-medium mt-0.5">Suami, keluarga, dan kader bersama-sama membantu ibu menyiapkan kesiapan donor darah, kendaraan darurat, dan stiker P4K.</p>
          </div>
        </div>
      </div>

      <!-- Interactive Widget: Checklist Persiapan Melahirkan -->
      <div class="bg-brand-soft/10 border border-brand-primary/20 rounded-[24px] p-6 mb-8 shadow-sm">
        <div class="flex items-center gap-2.5 mb-2">
          <span class="text-xl">🎒</span>
          <h4 class="font-extrabold text-sm text-brand-primary">Checklist Mandiri Persiapan Melahirkan (Diisi Ibu)</h4>
        </div>
        <p class="text-xs text-base-text-secondary mb-5 leading-relaxed">
          Centang persiapan yang sudah selesai. Data akan tersimpan otomatis di perangkat Anda.
        </p>

        <!-- Progress Bar -->
        <div class="w-full bg-base-border/40 h-2.5 rounded-full mb-2.5 overflow-hidden">
          <div id="prep-progress" class="bg-brand-primary h-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <p class="text-xs font-bold text-brand-primary mb-5" id="prep-progress-text">Persiapan selesai: 0% (0 dari 10)</p>

        <div class="space-y-3">
          <!-- 1 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_1" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">1. Tanggal Perkiraan Persalinan (HPL)</span>
              <span class="text-base-text-secondary">Sudah menanyakan tanggal perkiraan lahir ke bidan/dokter.</span>
            </div>
          </label>
          <!-- 2 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_2" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">2. Pendamping Melahirkan</span>
              <span class="text-base-text-secondary">Meminta suami atau keluarga mendampingi saat periksa dan melahirkan.</span>
            </div>
          </label>
          <!-- 3 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_3" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">3. Tabungan / Dana Cadangan</span>
              <span class="text-base-text-secondary">Mempersiapkan dana cadangan untuk biaya persalinan dan keperluan tak terduga.</span>
            </div>
          </label>
          <!-- 4 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_4" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">4. Kartu JKN / BPJS Kesehatan</span>
              <span class="text-base-text-secondary">Mempersiapkan kartu BPJS atau mendaftar jika belum memilikinya.</span>
            </div>
          </label>
          <!-- 5 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_5" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">5. Tempat Melahirkan</span>
              <span class="text-base-text-secondary">Sudah menyepakati tempat bersalin (Puskesmas, RS, atau Klinik Bersalin).</span>
            </div>
          </label>
          <!-- 6 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_6" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">6. KTP, KK & Dokumen Lahir</span>
              <span class="text-base-text-secondary">Menyiapkan berkas KTP, Kartu Keluarga, dan Buku KIA untuk syarat administrasi bayi.</span>
            </div>
          </label>
          <!-- 7 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_7" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">7. Calon Pendonor Darah Siaga</span>
              <span class="text-base-text-secondary">Menyiapkan lebih dari 1 orang yang bergolongan darah sama dan bersedia mendonor.</span>
            </div>
          </label>
          <!-- 8 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_8" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">8. Kendaraan Siaga</span>
              <span class="text-base-text-secondary">Menyepakati kendaraan darurat dengan keluarga atau tetangga untuk transportasi.</span>
            </div>
          </label>
          <!-- 9 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_9" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">9. Stiker P4K Terpasang</span>
              <span class="text-base-text-secondary">Sudah menempelkan stiker Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) di depan rumah.</span>
            </div>
          </label>
          <!-- 10 -->
          <label class="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
            <input type="checkbox" id="prep_10" class="w-4 h-4 rounded text-brand-primary mt-0.5" onclick="window.updatePrepCheck()" />
            <div class="text-[11px] leading-relaxed">
              <span class="font-bold text-base-text-primary block">10. Rencana KB Pasca Salin</span>
              <span class="text-base-text-secondary">Sudah merencanakan metode Keluarga Berencana (KB) pasca bersalin.</span>
            </div>
          </label>
        </div>

        <img src="x" onerror="this.style.display='none'; 
          window.updatePrepCheck = function() {
            let checked = 0;
            for(let i=1; i<=10; i++) {
              const chk = document.getElementById('prep_'+i);
              if(chk && chk.checked) {
                checked++;
                localStorage.setItem('birth_prep_'+i, 'true');
              } else {
                localStorage.setItem('birth_prep_'+i, 'false');
              }
            }
            const pct = checked * 10;
            const progress = document.getElementById('prep-progress');
            const text = document.getElementById('prep-progress-text');
            if(progress) progress.style.width = pct + '%';
            if(text) text.textContent = 'Persiapan selesai: ' + pct + '% (' + checked + ' dari 10)';
          };
          // Initialize state
          for(let i=1; i<=10; i++) {
            const chk = document.getElementById('prep_'+i);
            if(chk) chk.checked = localStorage.getItem('birth_prep_'+i) === 'true';
          }
          window.updatePrepCheck();
        " />
      </div>

      <h2 class="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🔍 Mitos vs Fakta Kehamilan Trimester 3
      </h2>
      
      <div class="space-y-4 mb-6">
        <div class="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4">
          <div class="flex items-center gap-1.5 font-bold text-xs text-status-red-solid uppercase mb-1">
            ❌ Mitos
          </div>
          <p class="text-xs text-base-text-primary font-bold">\"Minyak kelapa atau makanan pedas dapat mempercepat dan melicinkan persalinan.\"</p>
        </div>
        <div class="bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl p-4">
          <div class="flex items-center gap-1.5 font-bold text-xs text-status-green-solid uppercase mb-1">
            ✅ Fakta
          </div>
          <p class="text-xs text-base-text-secondary font-semibold leading-relaxed">
            Mitos ini tidak terbukti secara ilmiah ya, Bu. Mengonsumsi minyak kelapa secara berlebihan justru dapat mengganggu pencernaan ibu (memicu diare), dan makanan pedas berisiko memicu sakit maag/diare. Yang terpenting di akhir trimester ketiga adalah menjaga porsi makan gizi seimbang, istirahat cukup, menjaga hidrasi tubuh, dan senam hamil ringan guna melatih kelenturan panggul.
          </p>
        </div>
      </div>
    `;
  }



  // General fallback
  return `
    <p>Ini adalah isi artikel tentang <strong>${title}</strong>.</p>
    <p>Artikel ini berisi informasi berharga untuk memantau kesehatan dan asupan nutrisi optimal bagi ibu dan balita Anda di Posyandu.</p>
    
    <blockquote>
      "Keluarga sehat dan bahagia dimulai dari pemahaman gizi dan tumbuh kembang anak sejak 1000 Hari Pertama Kehidupan (HPK)."
    </blockquote>

    <h2>Panduan Kesehatan Praktis</h2>
    <p>Lakukan pemeriksaan rutin di Posyandu setiap bulan untuk memantau status gizi anak secara akurat melalui kurva berat badan dan tinggi badan.</p>

    <table>
      <thead>
        <tr>
          <th>Langkah Pemantauan</th>
          <th>Frekuensi</th>
          <th>Tujuan Utama</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Penimbangan Berat Badan</td>
          <td>Setiap Bulan</td>
          <td>Deteksi dini gagal tumbuh / stunting</td>
        </tr>
        <tr>
          <td>Pengukuran Tinggi Badan</td>
          <td>Setiap Bulan</td>
          <td>Mengukur perkembangan tulang linier anak</td>
        </tr>
        <tr>
          <td>Konsultasi Bidan/Kader</td>
          <td>Setiap Bulan</td>
          <td>Mendapatkan saran pemberian nutrisi MPASI</td>
        </tr>
      </tbody>
    </table>
    
    <p>Selalu penuhi kebutuhan nutrisi hewani, sayuran hijau, dan air putih berkualitas demi menjaga kebugaran tubuh harian.</p>
  `;
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
      try {
        setAttendance(JSON.parse(cachedAttendance));
      } catch (e) {}
    }

    const cachedScreening = localStorage.getItem("screening_mental_trimester_1");
    if (cachedScreening) {
      try {
        setScreening(JSON.parse(cachedScreening));
      } catch (e) {}
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
    if (activeCount === 0) {
      return "Kondisi emosi Ibu tampak sehat dan stabil! Tetap pertahankan pikiran positif dan nikmati masa kehamilan.";
    } else if (activeCount <= 2) {
      return "Ibu mengalami tingkat stres/kecemasan ringan. Cobalah bicarakan dengan suami/keluarga, perbanyak istirahat, dan lakukan latihan napas dalam.";
    } else {
      return "Ibu mengalami gejala stres/depresi sedang hingga berat. Segera konsultasikan dengan bidan, dokter di Puskesmas, atau psikolog untuk pendampingan emosional.";
    }
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
        Kehamilan bukan hanya tentang kesehatan fisik, melainkan juga kesehatan mental. Di Trimester 1, perubahan hormon yang drastis seringkali mempengaruhi emosi ibu. Selain itu, partisipasi dalam Kelas Ibu Hamil sangat penting sebagai sarana edukasi kelompok demi kelancaran persalinan.
      </p>

      <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 mb-4 flex items-center gap-2">
        🧠 Kesehatan Jiwa Ibu Hamil
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Selama kehamilan Ibu dapat mengalami berbagai gejolak emosi seperti mudah sedih, mudah marah, stres, cemas, dan depresi. Hal ini akan mempengaruhi kesehatan fisik dan emosi ibu hamil, serta perkembangan bayi dalam kandungannya.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-xs text-status-purple-solid mb-2">Kenali Gejala Gangguan Jiwa:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-base-text-secondary font-medium">
            <li>Ketegangan mental berupa kecemasan dan rasa khawatir yang berlebihan.</li>
            <li>Ketegangan fisik seperti gelisah, gemetar, tidak dapat rileks, dan sakit kepala.</li>
            <li>Berdebar-debar, berkeringat dingin, sesak napas, kepala terasa ringan, serta keluhan tidak nyaman di ulu hati.</li>
            <li>Merasa lelah berkepanjangan tapi sulit untuk tidur.</li>
            <li>Mudah tersinggung dan marah.</li>
            <li>Mengalami perubahan hubungan dengan suami atau keluarga.</li>
          </ul>
        </div>

        <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-xs text-status-green-solid mb-2">YANG HARUS DILAKUKAN:</h4>
          <p className="text-xs text-base-text-secondary leading-relaxed mb-3">
            Ibu tidak bisa menjalani kehamilan sendiri dan membutuhkan dukungan penuh dari suami dan keluarga. Jaga kesehatan jiwa ibu selama kehamilan dengan:
          </p>
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-base-text-secondary font-medium">
            <li>Tidur dan istirahat yang cukup.</li>
            <li>Makan makanan bergizi seimbang.</li>
            <li>Pergi ke Puskesmas atau fasilitas pelayanan kesehatan untuk melakukan pemeriksaan masalah kesehatan jiwa bila keluhan terus berlanjut.</li>
            <li>Suami atau keluarga mendampingi serta memberi perhatian dan bantuan yang dibutuhkan ibu.</li>
          </ul>
        </div>
      </div>

      {/* Interactive Widget: Self Screening */}
      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📋</span>
          <h4 className="font-extrabold text-sm text-brand-primary">Skrining Mandiri Kesehatan Jiwa Ibu Hamil</h4>
        </div>
        <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
          Deteksi dini suasana perasaan (mood) Ibu secara mandiri untuk mencegah kecemasan atau depresi antenatal.
        </p>

        <div className="space-y-2.5 text-xs font-semibold text-base-text-primary">
          {["Merasa cemas, tegang, atau gelisah berlebih dalam 2 minggu terakhir.",
            "Kehilangan minat atau kesenangan dalam melakukan aktivitas sehari-hari.",
            "Merasa murung, sedih, putus asa, atau merasa tidak berharga.",
            "Mengalami gangguan tidur (insomnia atau tidur berlebihan) akibat pikiran cemas."].map((q, idx) => (
            <label key={idx} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={screening[idx]} 
                onChange={(e) => {
                  updateScreening(idx, e.target.checked);
                  setScreeningSubmitted(false);
                }} 
                className="mt-0.5 rounded text-brand-primary w-4 h-4 cursor-pointer focus:ring-brand-primary/30" 
              />
              <span>{q}</span>
            </label>
          ))}
        </div>

        {screeningSubmitted && (
          <div className="mt-4 p-3.5 bg-brand-soft/20 border border-brand-primary/25 rounded-xl text-xs leading-relaxed font-semibold text-brand-primary animate-in fade-in duration-200">
            <strong>Hasil Skrining:</strong> <span className="font-normal text-base-text-secondary">{getScreeningAdvice()}</span>
          </div>
        )}

        <button 
          onClick={() => setScreeningSubmitted(true)} 
          className="mt-4 w-full py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-xs hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10 cursor-pointer"
        >
          Cek Hasil Skrining Mandiri
        </button>
      </div>

      <h2 className="text-lg font-extrabold text-brand-primary border-b pb-2 mb-4 flex items-center gap-2">
        👩‍🏫 Ikuti Kelas Ibu Hamil
      </h2>
      <p className="text-xs text-base-text-secondary leading-relaxed mb-4">
        Dengan mengikuti Kelas Ibu Hamil, Ibu bisa mempersiapkan fisik dan mental untuk kelancaran proses melahirkan. Selain itu juga mendapatkan dukungan dari ibu-ibu lain, serta memperoleh informasi tentang kehamilan, proses melahirkan, perawatan masa nifas, perawatan bayi baru lahir, kebutuhan dan pemenuhan gizi, serta pelayanan kesehatan yang diterima.
      </p>
      
      <div className="bg-status-yellow-light/20 border border-status-yellow-solid/25 rounded-2xl p-4.5 mb-6 text-xs font-semibold text-base-text-primary">
        📌 Untuk jadwal dan tempat pelaksanaan Kelas Ibu Hamil tanyakan pada petugas kesehatan. Minta suami/keluarga mendampingi mengikuti kelas paling sedikit 1 kali.
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-base-text-primary">Absensi Kehadiran Kelas Ibu Hamil (Diisi Mandiri):</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveAttendance} 
                className="px-3.5 py-1.5 bg-brand-primary hover:bg-status-pink-dark text-base-white text-xs font-bold rounded-lg cursor-pointer transition shadow-sm"
              >
                Selesai
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-3.5 py-1.5 border border-base-border/50 text-base-text-secondary hover:bg-base-bg text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Batal
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-3.5 py-1.5 border border-brand-primary hover:bg-brand-soft/20 text-brand-primary text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
            >
              <MdEdit className="w-3.5 h-3.5" /> Ubah Absensi
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm bg-base-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-base-bg text-base-text-primary border-b font-bold">
              <th className="py-3 px-4 text-center w-12">No.</th>
              <th className="py-3 px-4 w-52">Tanggal Kelas</th>
              <th className="py-3 px-4">Materi / Nama & Paraf Kader</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((row, idx) => (
              <tr key={idx} className="border-b last:border-b-0 hover:bg-base-bg/5">
                <td className="py-3 px-4 text-center font-bold text-base-text-primary">{idx + 1}</td>
                <td className="py-3 px-4 relative overflow-visible">
                  {isEditing ? (
                    <div className="relative overflow-visible z-50">
                      <CustomDatePicker 
                        value={row.date} 
                        onChange={(val) => {
                          const next = [...attendance];
                          next[idx].date = val;
                          setAttendance(next);
                        }} 
                        outputFormat="iso" 
                        label="Pilih Tanggal"
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-base-text-primary">{formatDate(row.date)}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={row.note} 
                      onChange={(e) => {
                        const next = [...attendance];
                        next[idx].note = e.target.value;
                        setAttendance(next);
                      }} 
                      placeholder={`Materi Trimester ${idx + 1} / Nama Kader`} 
                      className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  ) : (
                    <span className="font-semibold text-base-text-secondary">{row.note || "-"}</span>
                  )}
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
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Trimester kedua (usia kehamilan 4-6 bulan atau minggu ke-13 hingga 28) adalah masa ketika organ tubuh janin berkembang semakin matang dan ibu mulai merasakan gerakan pertamanya. Di masa ini, pemenuhan porsi gizi seimbang harian meningkat secara bertahap.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🍎</span>
          <div className="text-xs">
            <h4 className="font-bold text-base-text-primary">Bulan Ke-4 (13-16 Minggu)</h4>
            <p className="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin sebesar <strong>Apel</strong>. Berat sekitar 100 gram, organ-organ tubuh mulai berfungsi.</p>
          </div>
        </div>
        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🌽</span>
          <div className="text-xs">
            <h4 className="font-bold text-base-text-primary">Bulan Ke-6 (21-24 Minggu)</h4>
            <p className="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin sebesar <strong>Jagung</strong>. Berat sekitar 600 gram, kulit berkembang keriput halus.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-[#F8FAF8] border border-[#CBDCCB] rounded-2xl p-4.5">
          <h4 className="font-bold text-status-green-solid mb-2 flex items-center gap-1">👶 Yang Dialami Bayi:</h4>
          <p className="text-base-text-secondary font-medium">Fungsi organ dan tubuh bayi berkembang, dimana bayi tumbuh mulai dari panjang 12.5 cm atau kira-kira sebesar apel sampai 34 cm dan berat sekitar 1000 gram atau kira-kira sebesar jagung di akhir bulan ke-6.</p>
        </div>
        <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-status-blue-solid mb-2 flex items-center gap-1">👩 Yang Dialami Ibu:</h4>
          <p className="text-base-text-secondary font-medium">Gejala mual muntah (morning sickness) pada awal kehamilan mulai berkurang. Kenaikan berat badan bertambah sesuai status gizi sebelum hamil. Ibu juga mulai merasakan gerakan bayi seperti menendang, pada usia kehamilan 5 bulan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 text-xs leading-relaxed">
        <div className="bg-status-orange-light/10 border border-status-orange-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-status-orange-solid mb-2 flex items-center gap-1">✅ Yang Harus Dilakukan:</h4>
          <ul className="list-disc pl-4 space-y-1 text-base-text-secondary font-medium">
            <li>Periksa kehamilan ke dokter atau bidan paling sedikit dua kali di trimester ini.</li>
            <li>Pantau gerak janin secara mandiri.</li>
            <li>Makan dengan porsi lebih kecil tapi sering, porsi ditambah dengan kudapan bergizi (lihat tabel porsi).</li>
            <li>Minum Tablet Tambah Darah (TTD) atau multivitamin setiap hari selama kehamilan.</li>
            <li>Kenali dan cek tanda bahaya kehamilan. Bila ada, segera pergi ke fasilitas kesehatan terdekat.</li>
            <li>Mulai merencanakan proses melahirkan atau kelahiran melalui diskusi dengan tenaga kesehatan.</li>
          </ul>
        </div>
        <div className="bg-status-purple-light/10 border border-status-purple-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-status-purple-solid mb-2 flex items-center gap-1">💡 Mengapa Harus Dilakukan?</h4>
          <ul className="list-disc pl-4 space-y-1 text-base-text-secondary font-medium">
            <li>Untuk memastikan ibu tetap sehat dan pertumbuhan bayi sesuai tahapannya.</li>
            <li>Agar ibu dan keluarga sudah memiliki perencanaan proses melahirkan/kelahiran sejak jauh hari demi keselamatan ibu dan bayi baru lahir.</li>
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🍽️ Porsi Makan Ibu Hamil Trimester 2 (12-40 Minggu)
      </h2>
      <p className="text-xs text-base-text-secondary mb-4">
        Kebutuhan kalori ibu hamil meningkat pada trimester 2 dan 3 untuk pertumbuhan plasenta dan janin. Berikut takaran porsi makan per hari sesuai Buku KIA 2024:
      </p>

      <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm bg-base-white mb-6">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-base-bg text-base-text-primary border-b font-bold">
              <th className="py-2.5 px-4">Bahan Makanan</th>
              <th className="py-2.5 px-4 text-center w-32">Porsi / Hari</th>
              <th className="py-2.5 px-4">Keterangan Takaran Porsi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Nasi atau Makanan Pokok</td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">6 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">
                1 porsi = 100 g (3/4 gelas) nasi, ATAU 125 g (3 buah) jagung sedang, ATAU 210 g (2 buah) kentang sedang, ATAU 120 g (1/2 potong) singkong, ATAU 70 g (3 iris) roti putih.
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Protein Hewani <small className="text-base-text-secondary block">(Ikan, Telur, Daging)</small></td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">
                1 porsi = 50 g (1 potong sedang) ikan, ATAU 55 g (1 butir) telur ayam, ATAU 50 g (1 potong sedang) daging ayam/sapi.
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Protein Nabati <small className="text-base-text-secondary block">(Tempe, Tahu)</small></td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">
                1 porsi = 50 g (1 potong sedang) tempe, ATAU 100 g (2 potong sedang) tahu.
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Sayur-sayuran</td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">1 porsi = 100 g sayur segar (1 mangkuk sayur matang tanpa kuah).</td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Buah-buahan</td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">4 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">
                1 porsi = 100 g (1 potong sedang) pisang, ATAU 100-190 g (1 potong besar) pepaya.
              </td>
            </tr>
            <tr className="border-b">
              <td className="py-3 px-4 font-bold">Minyak/Lemak</td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">5 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">
                1 porsi = 5 g (1 sendok teh) minyak goreng/mentega. Termasuk santan/minyak yang digunakan dalam menumis dan menggoreng.
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold">Gula</td>
              <td className="py-3 px-4 text-center font-extrabold text-brand-primary bg-brand-soft/10">2 Porsi</td>
              <td className="py-3 px-4 text-base-text-secondary">1 porsi = 10 g (1 sendok makan) gula pasir / pemanis makanan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-status-orange-light/10 border border-status-orange-solid/25 rounded-2xl p-4.5 text-xs font-semibold text-status-orange-solid">
        ⚠️ Batasi konsumsi garam paling banyak 1 sendok teh/hari dan minum air putih 8 - 12 gelas per hari.
      </div>
    </div>
  );
}

function L8ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Mengenali tanda bahaya kehamilan trimester 2 sangat penting demi keselamatan Ibu dan janin. Jika Ibu mengalami salah satu dari gejala-gejala berikut, segera bawa ke bidan, dokter, Puskesmas, atau Rumah Sakit terdekat tanpa menunda.
      </p>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 9 Tanda Bahaya Kehamilan Trimester 2
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤒</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Demam Tinggi</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh panas tinggi, menandakan adanya infeksi sistemik yang berisiko bagi keselamatan janin.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤮</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Muntah Darah</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Muntah parah atau bercampur darah segar yang menyebabkan ibu lemas dan tidak bisa makan sama sekali.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🫁</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Sesak Napas & Berdebar</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Napas tersengal pendek disertai jantung berdenyut sangat kencang dan dada terasa nyeri tertekan.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤰</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Nyeri Perut Hebat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Kram atau nyeri perut bagian bawah yang menusuk tajam, berisiko aborsi spontan atau kontraksi dini.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">👁️</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Pandangan Kabur</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Penglihatan berkunang-kunang atau mendadak buram, merupakan salah satu indikasi preeklampsia.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🩸</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">6. Perdarahan Pervaginam</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar darah segar maupun flek kecokelatan dari jalan lahir. Tanda solusio plasenta atau plasenta previa.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">💦</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">7. Air Ketuban Pecah/Bau</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar cairan merembes sangat banyak dari jalan lahir atau berbau tidak sedap/busuk.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤯</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">8. Pusing / Sakit Kepala Berat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Sakit kepala berdenyut hebat yang tidak kunjung reda walau sudah beristirahat.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🚽</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">9. Sakit Saat Kencing / Gatal</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Nyeri saat buang air kecil, keluar keputihan pekat berwarna kehijauan, gatal, atau berbau di organ intim.</p>
        </div>
      </div>

      <div className="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start">
        <span className="text-lg">🚨</span>
        <div>
          <h4 className="font-extrabold text-sm mb-1">TINDAKAN DARURAT:</h4>
          <p className="font-medium leading-relaxed">Jika Ibu hamil merasakan minimal 1 tanda bahaya di atas, segera bawa ke bidan desa, Puskesmas, atau langsung ke Instalasi Gawat Darurat (IGD) Rumah Sakit terdekat untuk pertolongan medis segera!</p>
        </div>
      </div>
    </div>
  );
}

function L9ArticleContent() {
  const [prepList, setPrepList] = useState<boolean[]>(new Array(10).fill(false));

  useEffect(() => {
    const list = [];
    for(let i=1; i<=10; i++) {
      list.push(localStorage.getItem('birth_prep_'+i) === 'true');
    }
    setPrepList(list);
  }, []);

  const handleToggle = (idx: number) => {
    const next = [...prepList];
    next[idx] = !next[idx];
    setPrepList(next);
    localStorage.setItem('birth_prep_' + (idx + 1), String(next[idx]));
  };

  const checkedCount = prepList.filter(Boolean).length;
  const pct = checkedCount * 10;

  const items = [
    { title: "1. Tanggal Perkiraan Persalinan (HPL)", desc: "Sudah menanyakan tanggal perkiraan lahir ke bidan/dokter." },
    { title: "2. Pendamping Melahirkan", desc: "Meminta suami atau keluarga mendampingi saat periksa dan melahirkan." },
    { title: "3. Tabungan / Dana Cadangan", desc: "Mempersiapkan dana cadangan untuk biaya persalinan dan keperluan tak terduga." },
    { title: "4. Kartu JKN / BPJS Kesehatan", desc: "Mempersiapkan kartu BPJS atau mendaftar jika belum memilikinya." },
    { title: "5. Tempat Melahirkan", desc: "Sudah menyepakati tempat bersalin (Puskesmas, RS, atau Klinik Bersalin)." },
    { title: "6. KTP, KK & Dokumen Lahir", desc: "Menyiapkan berkas KTP, Kartu Keluarga, dan Buku KIA untuk syarat administrasi bayi." },
    { title: "7. Calon Pendonor Darah Siaga", desc: "Menyiapkan lebih dari 1 orang yang bergolongan darah sama dan bersedia mendonor." },
    { title: "8. Kendaraan Siaga", desc: "Menyepakati kendaraan darurat dengan keluarga atau tetangga untuk transportasi." },
    { title: "9. Stiker P4K Terpasang", desc: "Sudah menempelkan stiker Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) di depan rumah." },
    { title: "10. Rencana KB Pasca Salin", desc: "Sudah merencanakan metode Keluarga Berencana (KB) pasca bersalin." }
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Trimester ketiga (usia kehamilan 7-9 bulan atau minggu ke-29 hingga 40) adalah garis akhir menuju persalinan. Pada periode penting ini, ibu dan keluarga harus mematangkan perencanaan persiapan melahirkan demi kelancaran persalinan.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🍉</span>
          <div className="text-xs">
            <h4 className="font-bold text-base-text-primary">Perkembangan Janin Trimester 3</h4>
            <p className="text-[11px] text-base-text-secondary font-medium mt-0.5">Ukuran janin bertambah dari sebesar <strong>Pepaya</strong> pada bulan ke-7 menjadi sebesar <strong>Semangka</strong> pada bulan ke-9 sebelum lahir.</p>
          </div>
        </div>
        <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🤝</span>
          <div className="text-xs">
            <h4 className="font-bold text-base-text-primary">Dukungan Keluarga & Suami</h4>
            <p className="text-[11px] text-base-text-secondary font-medium mt-0.5">Suami, keluarga, dan kader bersama-sama membantu ibu menyiapkan kesiapan donor darah, kendaraan darurat, dan stiker P4K.</p>
          </div>
        </div>
      </div>

      {/* Interactive Widget: Checklist Persiapan Melahirkan */}
      <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[24px] p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-xl">🎒</span>
          <h4 className="font-extrabold text-sm text-brand-primary">Checklist Mandiri Persiapan Melahirkan (Diisi Ibu)</h4>
        </div>
        <p className="text-xs text-base-text-secondary mb-5 leading-relaxed">
          Centang persiapan yang sudah selesai. Data akan tersimpan otomatis di perangkat Anda.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-base-border/40 h-2.5 rounded-full mb-2.5 overflow-hidden">
          <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
        </div>
        <p className="text-xs font-bold text-brand-primary mb-5">Persiapan selesai: {pct}% ({checkedCount} dari 10)</p>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <label key={idx} className="flex items-start gap-3 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
              <input 
                type="checkbox" 
                checked={prepList[idx]} 
                onChange={() => handleToggle(idx)} 
                className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
              />
              <div className="text-[11px] leading-relaxed select-none">
                <span className="font-bold text-base-text-primary block">{item.title}</span>
                <span className="text-base-text-secondary">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🔍 Mitos vs Fakta Kehamilan Trimester 3
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 font-bold text-xs text-status-red-solid uppercase mb-1">
            ❌ Mitos
          </div>
          <p className="text-xs text-base-text-primary font-bold">"Minyak kelapa atau makanan pedas dapat mempercepat dan melicinkan persalinan."</p>
        </div>
        <div className="bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 font-bold text-xs text-status-green-solid uppercase mb-1">
            ✅ Fakta
          </div>
          <p className="text-xs text-base-text-secondary font-semibold leading-relaxed">
            Mitos ini tidak terbukti secara ilmiah ya, Bu. Mengonsumsi minyak kelapa secara berlebihan justru dapat mengganggu pencernaan ibu (memicu diare), dan makanan pedas berisiko memicu sakit maag/diare. Yang terpenting di akhir trimester ketiga adalah menjaga porsi makan gizi seimbang, istirahat cukup, menjaga hidrasi tubuh, dan senam hamil ringan guna melatih kelenturan panggul.
          </p>
        </div>
      </div>
    </div>
  );
}

function L10ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Memasuki trimester ketiga (usia kehamilan 29-40 minggu), persiapan melahirkan harus mulai dimatangkan. Ibu dan keluarga wajib mengenali tanda bahaya pada trimester ini agar dapat segera mencari pertolongan medis darurat demi keselamatan ibu dan janin.
      </p>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 Tanda Bahaya Kehamilan Trimester 3
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center">
          <span className="text-3xl mb-2.5">👶</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Gerakan Bayi Berkurang</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1.5 font-medium">Gerakan bayi tidak ada atau kurang dari 10 kali dalam kurun waktu 12 jam.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center">
          <span className="text-3xl mb-2.5">💦</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Ketuban Pecah Dini</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1.5 font-medium">Air ketuban pecah atau merembes keluar dari jalan lahir namun belum ada rasa kram/mulas (kontraksi).</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center">
          <span className="text-3xl mb-2.5">🤰</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Nyeri Perut Hebat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1.5 font-medium">Nyeri perut bagian bawah yang sangat hebat dan menusuk di antara jeda kontraksi.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center sm:col-span-2 md:col-span-1">
          <span className="text-3xl mb-2.5">🩸</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Perdarahan Hebat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1.5 font-medium">Keluar darah segar dalam jumlah banyak dari jalan lahir, berisiko solusio plasenta.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4.5 text-center flex flex-col items-center sm:col-span-2 md:col-span-2">
          <span className="text-3xl mb-2.5">🤯</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Sakit Kepala Berat / Pandangan Buram</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1.5 font-medium">Pusing atau sakit kepala berdenyut sangat berat disertai mata berkunang-kunang. Tanda utama preeklampsia.</p>
        </div>
      </div>

      <div className="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start mb-8">
        <span className="text-lg">🚨</span>
        <div>
          <h4 className="font-extrabold text-sm mb-1">TINDAKAN SEGERA:</h4>
          <p className="font-medium leading-relaxed">Jika Ibu hamil merasakan minimal salah satu tanda bahaya di atas, segera bawa ke Puskesmas atau Rumah Sakit terdekat untuk pertolongan medis darurat!</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🤰 Sambut Kehadiran Sang Buah Hati (Melahirkan)
      </h2>
      <p className="text-xs text-base-text-secondary mb-5 leading-relaxed">
        Persalinan adalah momen yang dinanti-nanti setelah perjuangan 9 bulan. Berikut panduan penting saat menyambut persalinan:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-brand-soft/20 border border-brand-primary/15 rounded-2xl p-5">
          <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-1">🏥 Tempat Melahirkan Terbaik:</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed mb-3">
            Proses melahirkan harus dilakukan di fasilitas pelayanan kesehatan resmi (<strong>Puskesmas, Rumah Sakit, atau Klinik Bersalin</strong>) agar jika terjadi penyulit atau keadaan darurat dapat segera ditangani secara tepat oleh nakes.
          </p>
          <h4 className="font-bold text-brand-primary mb-1 flex items-center gap-1">👩‍👦 Yang Dialami:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mt-1">
            <li>Melahirkan umumnya terjadi pada usia kehamilan 38 - 40 minggu.</li>
            <li>Ditandai dengan pembukaan jalan lahir, rasa mulas teratur yang intensitasnya semakin sering dan lama, serta keluar lendir bercampur sedikit darah.</li>
          </ul>
        </div>
        
        <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-5">
          <h4 className="font-bold text-status-green-solid mb-2 flex items-center gap-1">✅ Yang Harus Dilakukan:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mb-3">
            <li>Segera pergi ke fasilitas kesehatan bila merasakan mulas teratur atau ketuban pecah.</li>
            <li>Siapkan pendamping melahirkan (suami atau keluarga dekat) serta perlengkapan administrasi/bayi.</li>
            <li>Rawat gabung ibu dan bayi dalam satu ruangan jika kondisi keduanya dalam keadaan sehat.</li>
          </ul>
          <h4 className="font-bold text-status-green-solid mb-1 flex items-center gap-1">💡 Mengapa Harus Dilakukan?</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium mt-1">
            <li>Mempercepat penanganan komplikasi persalinan.</li>
            <li>Memulai Inisiasi Menyusu Dini (IMD) dalam 1 jam pertama.</li>
            <li>Menjamin pemantauan kesehatan ibu dan bayi selama 24 jam awal pasca salin.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L11ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Proses persalinan yang lancar memerlukan deteksi dini atas tanda-tanda persalinan normal maupun tanda bahaya. Setelah bayi lahir, langkah pertama yang sangat dianjurkan oleh Kemenkes adalah pelaksanaan Inisiasi Menyusu Dini (IMD) demi kesehatan optimal bayi.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-status-blue-solid mb-2 flex items-center gap-1.5">⚡ Tanda Awal Proses Melahirkan:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Keluar lendir bercampur darah segar dari jalan lahir.</li>
            <li>Merembes atau keluar cairan ketuban jernih dari jalan lahir.</li>
            <li>Perut mulas-mulas yang teratur, timbulnya semakin sering, kram semakin kuat, dan berlangsung semakin lama.</li>
          </ul>
        </div>
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-4.5">
          <h4 className="font-bold text-status-purple-solid mb-2 flex items-center gap-1.5">🌬️ Mengurangi Rasa Sakit Bersalin:</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed">
            Untuk mengurangi rasa sakit ketika bersalin secara mandiri, Ibu dianjurkan untuk menarik napas panjang melalui hidung secara perlahan dan keluarkan melalui mulut saat kontraksi/mulas datang. Minta suami/pendamping memijat punggung bawah secara perlahan.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 Tanda Bahaya Pada Proses Melahirkan
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">💦</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Ketuban Hijau & Bau</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Air ketuban pecah berwarna keruh kehijauan dan berbau tidak sedap/busuk.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">😫</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Ibu Gelisah / Nyeri Hebat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Ibu tampak sangat gelisah atau mengalami kesakitan yang luar biasa ekstrem.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🧠</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Ibu Mengalami Kejang</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Ibu mengalami kejang-kejang (gejala eklampsia pasca bersalin yang berbahaya).</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🥵</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Ibu Tidak Kuat Mengejan</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Ibu merasa kelelahan hebat dan tidak memiliki tenaga lagi untuk mengejan.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🩸</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Perdarahan Lewat Jalan Lahir</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar darah segar mengalir sangat banyak dari jalan lahir sebelum bayi lahir.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">👶</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">6. Tali Pusat/Tangan Keluar</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Tali pusat bayi, tangan, atau kaki bayi keluar mendahului kepala bayi.</p>
        </div>
      </div>

      <div className="bg-status-red-solid text-base-white p-5 rounded-2xl text-xs font-bold shadow-md shadow-status-red-solid/20 flex gap-3 items-start mb-8">
        <span className="text-lg">🚨</span>
        <div>
          <h4 className="font-extrabold text-sm mb-1">RUJUK DARURAT:</h4>
          <p className="font-medium leading-relaxed">Jika mengalami minimal salah satu tanda bahaya pada proses melahirkan di atas, petugas kesehatan harus segera merujuk Ibu ke Rumah Sakit terdekat!</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🍼 Inisiasi Menyusu Dini (IMD)
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Inisiasi Menyusu Dini (IMD) adalah proses meletakkan bayi secara tengkurap di dada ibu segera setelah lahir, sehingga kulit bayi melekat pada kulit ibu selama minimal 1 jam untuk mencari puting susu secara alami.
      </p>

      <div className="bg-brand-soft/20 border border-brand-primary/15 rounded-2xl p-5 text-xs leading-relaxed mb-6">
        <h4 className="font-bold text-brand-primary mb-2 flex items-center gap-1">✨ Manfaat IMD bagi Ibu & Bayi:</h4>
        <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
          <li><strong>Kehangatan Alami:</strong> Sentuhan kulit ke kulit menjaga suhu tubuh bayi tetap hangat dan stabil secara alami.</li>
          <li><strong>Meningkatkan Kekebalan:</strong> Bayi mendapatkan cairan <strong>Kolostrum</strong> (ASI pertama berwarna kekuningan) yang kaya antibodi untuk melindunginya dari infeksi.</li>
          <li><strong>Ikatan Kasih Sayang (Bonding):</strong> Membangun ikatan emosional yang kuat antara Ibu dan bayi sejak detik pertama lahir.</li>
          <li><strong>Merangsang Kontraksi Rahim:</strong> Isapan bayi merangsang pelepasan hormon oksitosin yang membantu rahim ibu berkontraksi sehingga meminimalisir risiko perdarahan pasca salin.</li>
        </ul>
      </div>
    </div>
  );
}

function L12ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Masa nifas (setelah melahirkan hingga 42 hari) adalah masa pemulihan penting bagi organ reproduksi dan kondisi emosional Ibu. Selama masa pemulihan ini, Ibu diwajibkan memeriksakan kesehatan minimal 4 kali dan mengenali tanda bahaya nifas.
      </p>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
         JADWAL PEMERIKSAAN NIFAS (MINIMAL 4 KALI)
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Sesuai standar Buku KIA 2024, Ibu dan bayi harus mendapatkan pemeriksaan pasca melahirkan minimal 4 kali:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-brand-primary bg-brand-soft px-2.5 py-1 rounded-full uppercase">Pertama</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">6 Jam - 2 Hari</h4>
          <p className="text-[11px] text-base-text-secondary mt-1 font-medium leading-relaxed">Pemeriksaan perdarahan awal, pemulihan rahim, dan inisiasi ASI eksklusif.</p>
        </div>
        <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-brand-primary bg-brand-soft px-2.5 py-1 rounded-full uppercase">Kedua</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">3 - 7 Hari</h4>
          <p className="text-[11px] text-base-text-secondary mt-1 font-medium leading-relaxed">Pemantauan kesehatan bayi, tali pusat, dan kecukupan ASI bagi bayi.</p>
        </div>
        <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-brand-primary bg-brand-soft px-2.5 py-1 rounded-full uppercase">Ketiga</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">8 - 28 Hari</h4>
          <p className="text-[11px] text-base-text-secondary mt-1 font-medium leading-relaxed">Evaluasi pemulihan luka jalan lahir, infeksi pasca salin, dan gizi nifas.</p>
        </div>
        <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-brand-primary bg-brand-soft px-2.5 py-1 rounded-full uppercase">Keempat</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">29 - 42 Hari</h4>
          <p className="text-[11px] text-base-text-secondary mt-1 font-medium leading-relaxed">Pemeriksaan akhir masa pemulihan nifas, konseling kontrasepsi (KB) pasca salin.</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 Tanda Bahaya Pada Ibu Nifas (Masa Pemulihan)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤒</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Demam Tinggi &gt;2 Hari</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh panas tinggi menandakan adanya infeksi jalan lahir atau rahim.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">😭</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Depresi / Sedih Mendalam</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Ibu terlihat sangat sedih, murung, cemas berlebih, atau menangis terus tanpa sebab.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🥀</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Cairan Nifas Berbau</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Cairan lokia (darah nifas) yang keluar berbau busuk atau sangat tidak sedap.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤕</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Pusing Berat & Bengkak</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Sakit kepala hebat, pandangan mata kabur, nyeri ulu hati, kaki/wajah bengkak, atau kejang.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🍒</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Payudara Bengkak & Merah</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Payudara bengkak mengeras, kulit memerah, terasa sangat panas dan nyeri (mastitis).</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🩸</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">6. Perdarahan Jalan Lahir</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Keluar darah nifas segar mengalir deras, tanda sisa plasenta tertinggal di rahim.</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🚫 Hal-hal yang Dilarang Selama Masa Pemulihan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs leading-relaxed font-semibold">
        <div className="p-4.5 bg-status-red-light/10 border border-status-red-solid/15 rounded-2xl space-y-3 text-status-red-solid">
          <p className="flex items-start gap-2">
            <span>❌</span>
            <span>Membuang ASI pertama yang berwarna kekuningan (Kolostrum). ASI pertama sangat penting untuk imun bayi.</span>
          </p>
          <p className="flex items-start gap-2">
            <span>❌</span>
            <span>Membersihkan puting/payudara dengan alkohol, obat merah, atau sabun wangi karena residunya bisa tertelan bayi.</span>
          </p>
          <p className="flex items-start gap-2">
            <span>❌</span>
            <span>Mengikat perut (stagen) terlalu kencang karena mengganggu aliran darah dan pernapasan.</span>
          </p>
        </div>
        <div className="p-4.5 bg-status-red-light/10 border border-status-red-solid/15 rounded-2xl space-y-3 text-status-red-solid">
          <p className="flex items-start gap-2">
            <span>❌</span>
            <span>Melakukan senam/latihan fisik dengan posisi telungkup sebelum rahim pulih sempurna.</span>
          </p>
          <p className="flex items-start gap-2">
            <span>❌</span>
            <span>Menempelkan ramuan daun-daunan pada jalan lahir/kemaluan karena berisiko memicu infeksi bakteri akut.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function L13ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Setelah melahirkan, perubahan hormon yang drastis dan pola tidur yang terganggu berisiko memicu gangguan kesehatan jiwa pada ibu. Selain itu, perencanaan Keluarga Berencana (KB) pasca salin penting disepakati bersama suami untuk menata kehamilan yang sehat di masa depan.
      </p>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🧠 Mengenal Depresi Setelah Melahirkan (Nifas)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-[#FBF7F9] border border-status-purple-solid/15 rounded-2xl p-5">
          <h4 className="font-bold text-status-purple-solid mb-1.5 flex items-center gap-1">🌸 Baby Blues Syndrome:</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed mb-3">
            Terjadi segera setelah melahirkan dan biasanya mereda dalam <strong>2 minggu</strong>. Gejala meliputi: mood tidak stabil, merasa sedih, murung secara tiba-tiba, cemas, sensitif, mudah tersinggung, dan sulit tidur.
          </p>
          <h4 className="font-bold text-status-purple-solid mb-1 flex items-center gap-1">Pencegahan & Dukungan:</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
            Dibutuhkan perhatian penuh dan pembagian tugas mengasuh bayi dari <strong>suami dan keluarga</strong> agar Ibu memiliki waktu istirahat yang cukup.
          </p>
        </div>
        
        <div className="bg-status-red-light/10 border border-status-red-solid/15 rounded-2xl p-5">
          <h4 className="font-bold text-status-red-solid mb-1.5 flex items-center gap-1">🚨 Depresi Pasca Melahirkan (Postpartum Depression):</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed mb-3">
            Kondisi klinis yang lebih parah, terjadi dalam 2 minggu hingga beberapa bulan setelah bersalin. Gejala: sedih mendalam terus menerus, merasa tidak berguna, sulit konsentrasi, menjauh dari bayi, cemas ekstrem, hingga hilangnya minat beraktivitas.
          </p>
          <h4 className="font-bold text-status-red-solid mb-1 flex items-center gap-1">Penanganan Medis:</h4>
          <p className="text-base-text-secondary font-medium leading-relaxed mt-1">
            Jika gejala berlangsung lebih dari 2 minggu, segera lakukan konseling ke psikolog, dokter, atau bidan posyandu untuk penanganan konseling profesional.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        👪 Keluarga Berencana (KB) Pasca Salin
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Menjarangkan kehamilan minimal 2 tahun membantu tubuh ibu pulih optimal dan memberikan waktu menyusui terbaik bagi anak. Berikut pilihan metode kontrasepsi resmi:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-status-green-light/20 border border-status-green-solid/15 rounded-2xl p-5">
          <h4 className="font-bold text-status-green-solid mb-2 flex items-center gap-1">🔄 KB Jangka Panjang (MKJP):</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li><strong>IUD / Spiral / AKDR:</strong> Alat kontrasepsi dalam rahim yang efektif mencegah kehamilan hingga 10 tahun. Sangat aman bagi ibu menyusui.</li>
            <li><strong>Implan / Susuk:</strong> Alat kontrasepsi di bawah kulit lengan atas yang efektif hingga 3 tahun.</li>
            <li><strong>MOW / MOP:</strong> Metode kontrasepsi mantap (sterilisasi) untuk pasangan yang sudah cukup anak.</li>
          </ul>
        </div>
        <div className="bg-status-blue-light/10 border border-status-blue-solid/15 rounded-2xl p-5">
          <h4 className="font-bold text-status-blue-solid mb-2 flex items-center gap-1">⏳ Non Jangka Panjang:</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li><strong>Suntik KB 3 Bulan:</strong> Hormon progestin saja yang tidak menghambat produksi ASI. Disuntik berkala setiap 12 minggu.</li>
            <li><strong>Pil KB Progestin (Minipil):</strong> Pil hormon harian khusus ibu menyusui agar tidak mengganggu kualitas ASI.</li>
            <li><strong>Kondom:</strong> Metode penghalang yang aman digunakan kapan saja pasca nifas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function L14ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Menyusui secara eksklusif selama 6 bulan pertama kehidupan bayi memberikan fondasi gizi terbaik serta melatih kekebalan tubuh bayi secara alami. Ibu menyusui membutuhkan pemahaman tentang posisi, pelekatan yang benar, dan metode memerah/menyimpan ASI.
      </p>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        ✨ Manfaat Menyusui Langsung bagi Ibu
      </h2>
      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-2xl p-5 text-xs leading-relaxed mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
          <li><strong>Mencegah Kanker:</strong> Menyusui mengurangi risiko kanker payudara dan ovarium pada ibu.</li>
          <li><strong>Pemulihan Uterus:</strong> Merangsang pelepasan hormon oksitosin untuk membantu rahim kembali ke ukuran semula dan mengurangi perdarahan.</li>
        </ul>
        <ul className="list-disc pl-4 space-y-2 text-base-text-secondary font-medium">
          <li><strong>KB Alami:</strong> Menyusui eksklusif bekerja sebagai Metode Amenore Laktasi (MAL) pencegah kehamilan alami.</li>
          <li><strong>Penurunan Berat Badan:</strong> Menyusui membakar kalori ekstra untuk mempercepat penurunan berat badan pasca melahirkan.</li>
        </ul>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        👶 Posisi & Pelekatan Menyusui yang Benar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-base-white border border-base-border/25 rounded-2xl p-5">
          <h4 className="font-bold text-brand-primary mb-2">1. Posisi Menyusui yang Benar</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Kepala dan badan bayi membentuk garis lurus yang lurus.</li>
            <li>Wajah bayi menghadap payudara, hidung berhadapan dengan puting susu.</li>
            <li>Badan bayi dekat dan menempel erat ke tubuh ibu.</li>
            <li>Ibu menggendong/mendekap seluruh badan bayi secara mantap.</li>
          </ul>
        </div>
        <div className="bg-base-white border border-base-border/25 rounded-2xl p-5">
          <h4 className="font-bold text-brand-primary mb-2">2. Pelekatan Menyusui yang Benar</h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Bayi dekat dengan payudara dengan mulut terbuka lebar.</li>
            <li>Dagu bayi menyentuh payudara ibu.</li>
            <li>Bagian areola payudara di atas terlihat lebih banyak dibanding areola bawah.</li>
            <li>Bibir bawah bayi memutar keluar (dower / flanged).</li>
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🌡️ Suhu & Durasi Penyimpanan ASI Perah (ASIP)
      </h2>
      <div className="overflow-x-auto border border-base-border/20 rounded-2xl shadow-sm bg-base-white text-xs mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-base-bg/30 text-base-text-primary font-bold border-b border-base-border/10">
              <th className="p-3">Tempat Penyimpanan</th>
              <th className="p-3">Suhu</th>
              <th className="p-3">Lama Penyimpanan</th>
            </tr>
          </thead>
          <tbody className="text-base-text-secondary font-medium">
            <tr className="border-b border-base-border/5">
              <td className="p-3 font-bold text-base-text-primary">Cooler Bag (Dengan Ice Pack)</td>
              <td className="p-3">15°C</td>
              <td className="p-3 font-bold text-status-orange-solid">24 Jam</td>
            </tr>
            <tr className="border-b border-base-border/5">
              <td className="p-3 font-bold text-base-text-primary">Dalam Ruangan (ASIP Segar)</td>
              <td className="p-3">27°C s.d. 32°C / 25°C</td>
              <td className="p-3 font-bold text-status-orange-solid">4 Jam / 6-8 Jam</td>
            </tr>
            <tr className="border-b border-base-border/5">
              <td className="p-3 font-bold text-base-text-primary">Kulkas Bawah / Chiller</td>
              <td className="p-3">4°C</td>
              <td className="p-3 font-bold text-brand-primary">2 - 3 Hari (48-72 jam)</td>
            </tr>
            <tr className="border-b border-base-border/5">
              <td className="p-3 font-bold text-base-text-primary">Freezer Kulkas 1 Pintu</td>
              <td className="p-3">-15°C s.d. 0°C</td>
              <td className="p-3 font-bold text-brand-primary">2 Minggu</td>
            </tr>
            <tr>
              <td className="p-3 font-bold text-base-text-primary">Freezer Kulkas 2 Pintu / Deep Freezer</td>
              <td className="p-3">-20°C s.d. -18°C</td>
              <td className="p-3 font-bold text-status-green-solid">3 - 6 Bulan</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🥗 Porsi Makan & Minum Ibu Menyusui (Kebutuhan Sehari)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4 text-xs leading-relaxed font-semibold">
        <div className="p-5 bg-brand-soft/10 border border-brand-primary/15 rounded-2xl space-y-2.5 text-base-text-primary">
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🍚 Nasi / Makanan Pokok:</span> <span className="font-extrabold text-brand-primary">6 Porsi Sehari</span></p>
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🍗 Protein Hewani (Ikan, Daging, Telur):</span> <span className="font-extrabold text-brand-primary">4 Porsi Sehari</span></p>
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🥛 Protein Nabati (Tempe, Tahu):</span> <span className="font-extrabold text-brand-primary">4 Porsi Sehari</span></p>
          <p className="flex justify-between"><span>🥦 Sayur-sayuran:</span> <span className="font-extrabold text-brand-primary">4 Porsi Sehari</span></p>
        </div>
        <div className="p-5 bg-brand-soft/10 border border-brand-primary/15 rounded-2xl space-y-2.5 text-base-text-primary">
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🍎 Buah-buahan:</span> <span className="font-extrabold text-brand-primary">4 Porsi Sehari</span></p>
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🧈 Minyak / Lemak:</span> <span className="font-extrabold text-brand-primary">6 Porsi Sehari</span></p>
          <p className="flex justify-between border-b pb-2 border-base-border/10"><span>🍬 Gula:</span> <span className="font-extrabold text-brand-primary">2 Porsi Sehari</span></p>
          <p className="flex justify-between text-status-green-solid font-bold"><span>💧 Air Putih:</span> <span>14 Gelas/Hari (0-6 bln) / 12 Gelas/Hari (7-12 bln)</span></p>
        </div>
      </div>
    </div>
  );
}

function L15ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Bayi baru lahir (neonatus) usia 0 hingga 28 hari berada dalam fase rentan terhadap infeksi dan penyesuaian organ fisik. Orang tua wajib memantau tanda-tanda bahaya neonatus dan memahami pertumbuhan kapasitas lambung bayi.
      </p>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🍒 Ukuran Lambung Bayi Baru Lahir (0 - 6 Bulan)
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed">
        Mengapa bayi menyusu sangat sering? Lambung bayi baru lahir sangat kecil dan bertumbuh bertahap:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFDF6] border border-status-orange-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-1">🔴</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">Hari Ke-1</h4>
          <span className="text-[10px] text-status-orange-solid bg-status-orange-light/40 px-2 py-0.5 rounded-full font-bold uppercase mt-1">Seukuran Kelereng</span>
          <p className="text-[11px] text-base-text-secondary mt-2 font-medium leading-relaxed">Kapasitas lambung: 5-7 ml. Bayi hanya membutuhkan sedikit cairan kolostrum.</p>
        </div>
        <div className="bg-[#FFFDF6] border border-status-orange-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-1">🟡</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">Hari Ke-3</h4>
          <span className="text-[10px] text-status-orange-solid bg-status-orange-light/40 px-2 py-0.5 rounded-full font-bold uppercase mt-1">Bola Pingpong</span>
          <p className="text-[11px] text-base-text-secondary mt-2 font-medium leading-relaxed">Kapasitas lambung: 22-27 ml. Bayi menyusu lebih sering (10-12 kali).</p>
        </div>
        <div className="bg-[#FFFDF6] border border-status-orange-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-1">🥚</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">Minggu Ke-1</h4>
          <span className="text-[10px] text-status-orange-solid bg-status-orange-light/40 px-2 py-0.5 rounded-full font-bold uppercase mt-1">Telur Ayam</span>
          <p className="text-[11px] text-base-text-secondary mt-2 font-medium leading-relaxed">Kapasitas lambung: 45-60 ml. Bayi mulai menyusu dengan pola teratur.</p>
        </div>
        <div className="bg-[#FFFDF6] border border-status-orange-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-1">🦆</span>
          <h4 className="font-extrabold text-xs text-base-text-primary mt-2">Bulan Ke-1</h4>
          <span className="text-[10px] text-status-orange-solid bg-status-orange-light/40 px-2 py-0.5 rounded-full font-bold uppercase mt-1">Telur Bebek</span>
          <p className="text-[11px] text-base-text-secondary mt-2 font-medium leading-relaxed">Kapasitas lambung: 80-150 ml. Bayi sanggup menyusu lebih banyak sekali minum.</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-6 flex items-center gap-2">
        🚨 Tanda Bahaya Pada Bayi Baru Lahir (0 - 28 Hari)
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤒</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Demam / Panas Tinggi</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh bayi &gt;37.5°C menandakan adanya infeksi akut.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🥶</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Badan Dingin (Hipotermia)</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh &lt;36°C, tubuh bayi teraba dingin, berisiko fatal jika dibiarkan.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">💤</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Bayi Lemah / Merintih</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Bayi lunglai, sulit dibangunkan untuk menyusu, atau bernapas merintih terus.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">👃</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Sesak Napas</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Napas bayi cepat (&gt;60 kali/menit) atau tampak tarikan dinding dada ke dalam.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🔗</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Tali Pusat Merah/Bau</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Pangkal tali pusat kemerahan meluas ke perut, basah, berbau busuk/bernanah.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤮</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">6. Muntah &amp; Diare</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Bayi memuntahkan semua isi lambung, menolak menyusu, disertai diare cair berulang.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">⚡</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">7. Kejang-Kejang</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Bayi mengalami kejang kaku, kelojotan, atau mata mendelik ke atas.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🟡</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">8. Kulit &amp; Mata Kuning</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Kuning muncul pada hari pertama (&lt;24 jam) atau kuning meluas hingga kaki.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">💩</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">9. Tinja Berwarna Pucat</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Kotoran bayi berwarna putih keabu-abuan/pucat (indikasi sumbatan empedu).</p>
        </div>
      </div>

      <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-5 text-xs text-status-red-solid leading-relaxed font-bold">
        ⚠️ PENTING: Jika menemukan salah satu tanda bahaya di atas pada bayi Anda, segeralah bawa bayi ke Bidan, Puskesmas, atau Rumah Sakit terdekat untuk pertolongan medis segera.
      </div>
    </div>
  );
}

function L16ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Perawatan bayi baru lahir usia 0-28 hari membutuhkan ketelitian ekstra dari orang tua. Beberapa aspek kritis meliputi menjaga kehangatan tubuh bayi, perawatan tali pusat agar tidak terinfeksi, serta pemantauan warna tinja guna mendeteksi penyakit serius seperti Atresia Bilier.
      </p>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🌡️ Cara Menjaga Bayi Tetap Hangat
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-xs leading-relaxed">
        <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-brand-primary flex items-center gap-1.5">
            🧼 Mandi & Pakaian:
          </h4>
          <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
            <li>Mandikan bayi menggunakan air hangat minimal <strong>6 jam setelah lahir</strong> agar suhu tubuh stabil.</li>
            <li>Sebelum tali pusat terlepas, cukup bersihkan badan bayi dengan dilap air hangat. Jangan direndam.</li>
            <li>Setelah tali pusat lepas, bayi dapat dimandikan dengan cara terendam di bak mandi khusus.</li>
            <li>Beri pakaian bersih, selimuti dengan baik, dan pakaikan topi, kaos kaki, serta kaos tangan jika cuaca dingin.</li>
            <li>Segera ganti pakaian dan popok yang basah agar tubuh tidak kedinginan.</li>
          </ul>
        </div>
        
        <div className="bg-brand-soft/10 border border-brand-primary/15 rounded-2xl p-5 space-y-3">
          <h4 className="font-bold text-brand-primary flex items-center gap-1.5">
            🦘 Perawatan Metode Kanguru (PMK):
          </h4>
          <p className="text-base-text-secondary font-medium leading-relaxed">
            Metode ini sangat disarankan untuk bayi dengan <strong>Berat Lahir Rendah (BBLR) &lt; 2500 gram</strong> atau lahir prematur:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-base-text-secondary font-medium">
            <li>Posisikan bayi di dada ibu/ayah dalam kondisi tegak tanpa pakaian (hanya memakai popok & topi), bersentuhan kulit ke kulit secara langsung (*skin-to-skin contact*).</li>
            <li>Selimuti bayi bersama ibu/ayah dengan kain panjang hangat. Suhu tubuh orang tua akan menghangatkan tubuh bayi secara konstan dan merangsang produksi ASI.</li>
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        🔗 Perawatan Tali Pusat yang Benar
      </h2>
      <div className="p-5 bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl text-xs leading-relaxed mb-6 space-y-3">
        <p className="text-base-text-primary font-bold">Langkah Perawatan Tali Pusat Sehat (Buku KIA Hal 46):</p>
        <ul className="list-disc pl-4 space-y-1.5 text-base-text-secondary font-medium">
          <li><strong>Wajib Cuci Tangan:</strong> Selalu cuci tangan menggunakan air bersih mengalir dan sabun sebelum serta sesudah merawat tali pusat bayi.</li>
          <li><strong>Rawat Terbuka & Kering:</strong> Biarkan tali pusat terbuka dan kering. Jangan dibungkus dengan kain kasa terlalu rapat.</li>
          <li><strong>Tanpa Tambahan Apapun:</strong> Jangan berikan alkohol, betadine, bedak, minyak, atau ramuan dedaunan tradisional pada tali pusat karena berisiko memicu infeksi berat.</li>
          <li><strong>Cara Membersihkan:</strong> Jika tali pusat kotor atau basah terkena air kencing/tinja, cuci dengan air hangat bersih dan sabun bayi secara lembut, kemudian segera keringkan dengan kasa steril atau handuk bersih hingga benar-benar kering.</li>
        </ul>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        💩 Deteksi Dini Warna Tinja Bayi (Deteksi Atresia Bilier)
      </h2>
      <p className="text-xs text-base-text-secondary leading-relaxed mb-4">
        Atresia Bilier adalah penyakit sumbatan saluran empedu hati yang fatal jika terlambat dideteksi. Ibu wajib mengamati warna tinja (kotoran) bayi setiap hari hingga usia 4 bulan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4 text-xs leading-relaxed">
        <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-5 space-y-3">
          <h4 className="font-extrabold text-status-red-solid flex items-center gap-1.5">
            🚨 WARNA TINJA TIDAK NORMAL (BAHAYA!):
          </h4>
          <p className="text-base-text-secondary font-medium leading-relaxed">
            Tinja berwarna <strong>Putih Keabu-abuan, Dempul, Kuning Sangat Pucat</strong> (Nomor 1, 2, atau 3 pada kartu warna tinja Buku KIA).
          </p>
          <div className="p-3 bg-base-white border border-status-red-solid/25 rounded-xl font-bold text-status-red-solid text-[10px]">
            ⚠️ SEGERA bawa bayi ke dokter spesialis anak atau rumah sakit terdekat apabila tinja bayi berwarna pucat!
          </div>
        </div>
        
        <div className="bg-status-green-light/20 border border-status-green-solid/20 rounded-2xl p-5 space-y-3">
          <h4 className="font-extrabold text-status-green-solid flex items-center gap-1.5">
            ✅ WARNA TINJA NORMAL (SEHAT):
          </h4>
          <p className="text-base-text-secondary font-medium leading-relaxed">
            Tinja berwarna <strong>Kuning Emas, Kuning Tua, atau Hijau Kekuningan</strong> (Warna cerah menandakan empedu mengalir dengan lancar ke usus pencernaan).
          </p>
          <p className="text-[10px] text-base-text-secondary leading-normal font-semibold">
            *Catat secara berkala warna tinja bayi Anda saat berusia 2 minggu, 1 bulan, dan 2-4 bulan untuk pemantauan optimal.
          </p>
        </div>
      </div>
    </div>
  );
}

function L17ArticleContent() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-text-secondary leading-relaxed mb-6">
        Fase balita usia 29 hari hingga 5 tahun merupakan masa keemasan sekaligus membutuhkan kepekaan tinggi dari orang tua terhadap tanda bahaya penyakit akut. Selain mendeteksi tanda bahaya, status gizi balita juga perlu dipantau secara mandiri menggunakan pita Lingkar Lengan Atas (LiLA).
      </p>

      <h2 className="text-lg font-extrabold text-status-red-solid border-b pb-2 mb-4 flex items-center gap-1.5">
        🚨 Tanda Bahaya Balita (29 Hari - 5 Tahun)
      </h2>
      <p className="text-xs text-base-text-secondary mb-4 leading-relaxed font-semibold">
        Segera periksakan balita Anda ke dokter, bidan, atau puskesmas terdekat jika mendapati gejala berikut:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤒</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">1. Demam / Panas Tinggi</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Suhu tubuh panas tinggi tidak kunjung turun setelah diberi penurun panas.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🤮</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">2. Muntah Terus-Menerus</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Balita memuntahkan semua isi lambung, tidak sanggup menelan cairan apa pun.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">💧</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">3. Diare Akut</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Buang air besar cair berkali-kali disertai lemas atau tanda dehidrasi.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">⚡</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">4. Kejang</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Kejang demam maupun kejang tanpa demam (badan kaku/kelojotan).</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">👂</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">5. Bengkak di Belakang Telinga</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Pembengkakan disertai rasa nyeri di tulang belakang daun telinga (Mastoiditis).</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🩸</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">6. Perdarahan</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Mimisan hebat, bintik-bintik merah darah di kulit, atau buang air besar berdarah.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">👃</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">7. Sesak Napas</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Tarikan dinding dada bagian bawah ke dalam yang sangat jelas saat bernapas.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🔵</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">8. Tampak Biru (Sianosis)</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Mulut, lidah, atau ujung jari tampak kebiruan akibat kekurangan oksigen.</p>
        </div>
        <div className="bg-status-red-light/20 border border-status-red-solid/20 rounded-2xl p-4 text-center flex flex-col items-center">
          <span className="text-3xl mb-2">🚰</span>
          <h4 className="font-extrabold text-xs text-base-text-primary">9. Tidak Bisa Minum</h4>
          <p className="text-[11px] text-base-text-secondary leading-relaxed mt-1 font-medium">Sangat lemah sehingga menolak atau tidak sanggup minum cairan/ASI sama sekali.</p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-base-text-primary border-b pb-2 mb-4">
        📏 Pengukuran Lingkar Lengan Atas (LiLA) Balita
      </h2>
      <p className="text-xs text-base-text-secondary leading-relaxed mb-4">
        Pengukuran LiLA dilakukan pada balita usia <strong>6 - 59 bulan</strong> menggunakan pita LiLA tiga warna untuk deteksi dini stunting, gizi kurang, dan gizi buruk:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs leading-relaxed text-center font-bold">
        <div className="bg-status-red-light/20 border border-status-red-solid/25 text-status-red-solid rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[10px] uppercase bg-status-red-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">MERAH</span>
          <span className="text-sm font-extrabold block">&lt; 11.5 cm</span>
          <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-1 block">
            <strong>Gizi Buruk (Sangat Kurus)</strong>. Segera rujuk balita ke Puskesmas/Rumah Sakit untuk penanganan medis darurat.
          </span>
        </div>
        
        <div className="bg-status-orange-light/20 border border-status-orange-solid/25 text-status-orange-solid rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[10px] uppercase bg-status-orange-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">KUNING</span>
          <span className="text-sm font-extrabold block">11.5 - 12.4 cm</span>
          <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-1 block">
            <strong>Gizi Kurang (Kurus)</strong>. Perlu asupan makanan tambahan (PMT) serta pemantauan intensif di Posyandu.
          </span>
        </div>
        
        <div className="bg-status-green-light/20 border border-status-green-solid/25 text-status-green-solid rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[10px] uppercase bg-status-green-solid text-white px-2.5 py-0.5 rounded-full font-extrabold mb-2">HIJAU</span>
          <span className="text-sm font-extrabold block">&gt;= 12.4 cm</span>
          <span className="text-[11px] text-base-text-secondary font-medium leading-normal mt-1 block">
            <strong>Gizi Baik (Normal)</strong>. Pertahankan asupan gizi seimbang serta pola asuh yang penuh kasih sayang.
          </span>
        </div>
      </div>

      <div className="p-5 bg-base-white border border-base-border/20 rounded-2xl text-xs leading-relaxed space-y-2">
        <p className="font-extrabold text-base-text-primary">Langkah Pengukuran LiLA yang Tepat:</p>
        <ol className="list-decimal pl-4 space-y-1 text-base-text-secondary font-medium">
          <li>Pengukuran dilakukan pada lengan kiri anak (atau lengan kanan jika anak kidal).</li>
          <li>Tekuk lengan anak membentuk sudut 90 derajat.</li>
          <li>Ukur jarak antara pangkal bahu dan siku lengan atas, tentukan titik tengahnya.</li>
          <li>Luruskan kembali lengan anak dan gantung secara santai di samping tubuh.</li>
          <li>Lingkarkan pita LiLA tepat di titik tengah lengan yang telah ditentukan tadi secara pas (tidak terlalu ketat dan tidak terlalu longgar).</li>
          <li>Baca angka hasil pengukuran serta warna pita yang ditunjukkan oleh panah indikator pita LiLA.</li>
        </ol>
      </div>
    </div>
  );
}
