export type CategoryType = "Gizi & MPASI" | "Imunisasi" | "Ibu Hamil" | "Ibu Nifas" | "Tumbuh Kembang";

export interface Article {
  id: string;
  title: string;
  categories: CategoryType[];
  type: "Artikel" | "Video";
  duration: string;
  imageUrl: string;
  isLanjutkanMembaca?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: "L1",
    title: "MPASI Pertama: Jadwal, Menu, dan Aturan Makan",
    categories: ["Gizi & MPASI"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true
  },
  {
    id: "L2",
    title: "Imunisasi Dasar Lengkap Balita 0-12 Bulan",
    categories: ["Imunisasi"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true
  },
  {
    id: "L3",
    title: "1000 Hari Pertama Kehidupan (1000 HPK) & Pencegahan Stunting",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "4 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true
  },
  {
    id: "L4",
    title: "Kehamilan Trimester 1: Panduan Gizi dan Porsi Makan Harian",
    categories: ["Gizi & MPASI", "Ibu Hamil"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L5",
    title: "Tanda Bahaya dan Larangan Penting di Trimester Pertama Kehamilan",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1584515901187-548c00a5a16a?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  }
];