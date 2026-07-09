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
      case "Gizi & MPASI": return "bg-status-green-solid text-base-white";
      case "Imunisasi": return "bg-status-orange-solid text-base-white";
      case "Ibu Hamil": return "bg-status-blue-solid text-base-white";
      case "Ibu Nifas": return "bg-status-purple-solid text-base-white";
      case "Ibu Menyusui": return "bg-pink-500 text-base-white";
      case "Tumbuh Kembang": return "bg-[#0277BD] text-base-white";
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
