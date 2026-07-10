import { Article } from "@/app/edukasi/data";
import { MdBookmark, MdBookmarkBorder, MdShare, MdMenuBook, MdPlayCircleOutline } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  article: Article;
  isSaved: boolean;
  onToggleSave?: () => void;
}

export default function ArticleCard({ article, isSaved, onToggleSave }: ArticleCardProps) {
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
    <div className="bg-base-white rounded-2xl border border-base-border/50 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
      
      {/* Thumbnail Container */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <Link href={`/edukasi/${article.id}`} className="block w-full h-full">
          <Image 
            src={article.imageUrl} 
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Bookmark Button */}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave?.(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-base-white rounded-lg flex items-center justify-center shadow-sm text-base-text-secondary hover:text-brand-primary transition-colors z-10"
        >
          {isSaved ? <MdBookmark className="w-5 h-5 text-brand-primary" /> : <MdBookmarkBorder className="w-5 h-5 text-brand-primary" />}
        </button>

        {/* Video Overlay Indicator */}
        {article.type === "Video" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center pl-1 shadow-lg">
              <MdPlayCircleOutline className="w-8 h-8 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/edukasi/${article.id}`} className="flex-1 flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {article.categories.map((cat, idx) => (
              <span key={idx} className={`${getCategoryColor(cat)} px-2.5 py-0.5 rounded-full text-[10px] font-bold`}>
                {cat}
              </span>
            ))}
          </div>
          
          {/* Title */}
          <h3 className="font-bold text-sm text-base-text-primary leading-snug mb-4 line-clamp-2 flex-1 group-hover:text-brand-primary transition-colors">
            {article.title}
          </h3>
        </Link>
        
        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-semibold text-base-text-secondary mt-auto pt-2">
          <div className="flex items-center gap-1.5">
            {article.type === "Video" ? (
              <MdPlayCircleOutline className="w-4 h-4" />
            ) : (
              <MdMenuBook className="w-4 h-4" />
            )}
            <span>{article.type} • {article.duration}</span>
          </div>
          <button className="text-base-text-secondary hover:text-brand-primary transition-colors">
            <MdShare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
