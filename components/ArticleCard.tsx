import { Article } from "@/app/edukasi/data";
import { MdBookmark, MdBookmarkBorder, MdShare, MdMenuBook } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave?: () => void;
}

export default function ArticleCard({ article, isSaved, onToggleSave }: ArticleCardProps) {
  const handleRecordHistory = () => {
    try {
      const historyJson = localStorage.getItem("viewed_articles_history");
      let historyList: string[] = [];
      if (historyJson) {
        historyList = JSON.parse(historyJson);
      }
      historyList = [article.id, ...historyList.filter((x) => x !== article.id)].slice(0, 8);
      localStorage.setItem("viewed_articles_history", JSON.stringify(historyList));
      // Dispatch storage event to notify other components instantly
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error(e);
    }
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

  return (
    <div className="bg-base-white rounded-2xl border border-base-border/50 overflow-hidden flex flex-row sm:flex-col group hover:shadow-lg transition-all duration-300 w-full">
      
      {/* Thumbnail Container */}
      <div className="relative h-28 w-28 sm:h-44 sm:w-full shrink-0 overflow-hidden bg-gray-100">
        <Link 
          href={`/edukasi/${article.id}`} 
          className="block w-full h-full"
          onClick={handleRecordHistory}
        >
          <Image 
            src={article.imageUrl} 
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 112px, (max-width: 768px) 100vw, 33vw"
          />
        </Link>

        {/* Bookmark Button */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave?.(); }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-base-white/95 rounded-lg flex items-center justify-center shadow-sm text-base-text-secondary hover:text-brand-primary transition-colors z-10"
        >
          {isSaved ? <MdBookmark className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" /> : <MdBookmarkBorder className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0 justify-between">
        <Link 
          href={`/edukasi/${article.id}`} 
          className="flex-1 flex flex-col min-w-0"
          onClick={handleRecordHistory}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-3">
            {article.categories.map((cat, idx) => (
              <span key={idx} className={`${getCategoryColor(cat)} px-2 py-0.5 rounded-full text-[9px] font-bold`}>
                {cat}
              </span>
            ))}
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-base-text-primary leading-snug mb-2 sm:mb-4 line-clamp-2 flex-1 group-hover:text-brand-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        
        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-base-text-secondary mt-auto pt-1 sm:pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <MdMenuBook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Buku KIA • {article.duration}</span>
          </div>
          <button className="text-base-text-secondary hover:text-brand-primary transition-colors p-1 rounded-lg hover:bg-base-bg">
            <MdShare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}