"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen, FiTrash, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare } from "react-icons/md";
import { mockArticles } from "../data";
import type { Article } from "../data";
import { useUserRole } from "@/context/UserRoleContext";

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
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
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
