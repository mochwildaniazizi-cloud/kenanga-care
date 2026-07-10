// data.ts
export type CategoryType = "Gizi & MPASI" | "Imunisasi" | "Kesehatan Ibu" | "Tumbuh Kembang" | "Informasi Umum";

export interface Article {
  id: string;
  title: string;
  categories: CategoryType[];
  type: "Artikel" | "Video";
  duration: string;
  imageUrl: string;
  isLanjutkanMembaca?: boolean;
  isNativeKIA?: boolean;
}

export const mockArticles: Article[] = [
  {
    id: "L1",
    title: "MPASI Pertama: Jadwal, Menu, dan Aturan Makan",
    categories: ["Gizi & MPASI"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true,
    isNativeKIA: true
  },
  {
    id: "L2",
    title: "Imunisasi Dasar Lengkap Balita 0-12 Bulan",
    categories: ["Imunisasi"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true,
    isNativeKIA: true
  },
  {
    id: "L3",
    title: "1000 Hari Pertama Kehidupan (1000 HPK) & Pencegahan Stunting",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "4 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: true,
    isNativeKIA: true
  },
  {
    id: "L4",
    title: "Kehamilan Trimester 1: Panduan Gizi dan Porsi Makan Harian",
    categories: ["Gizi & MPASI", "Kesehatan Ibu"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L5",
    title: "Tanda Bahaya dan Larangan Penting di Trimester Pertama Kehamilan",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "/cover-article/L5.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L6",
    title: "Kesehatan Jiwa Ibu Hamil & Kelas Ibu Hamil (Trimester 1)",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L7",
    title: "Usia Kehamilan 4-6 Bulan: Perkembangan & Porsi Makan Trimester 2",
    categories: ["Kesehatan Ibu", "Gizi & MPASI"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L8",
    title: "9 Tanda Bahaya Kehamilan Trimester 2 yang Wajib Diwaspadai",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L9",
    title: "Panduan Trimester 3: Perkembangan Bayi & Checklist Persiapan Melahirkan",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L10",
    title: "Tanda Bahaya Trimester 3 & Panduan Awal Proses Melahirkan",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L11",
    title: "Tanda Bahaya pada Proses Melahirkan & Inisiasi Menyusu Dini (IMD)",
    categories: ["Kesehatan Ibu", "Gizi & MPASI"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L12",
    title: "Panduan Pemulihan Masa Nifas & Tanda Bahaya Setelah Melahirkan",
    categories: ["Kesehatan Ibu"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L13",
    title: "Depresi Pasca Melahirkan & Perencanaan Keluarga Berencana (KB)",
    categories: ["Kesehatan Ibu", "Informasi Umum"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "/cover-article/L13.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L14",
    title: "Panduan Sukses Menyusui: Posisi, Pelekatan, & Cara Menyimpan ASI",
    categories: ["Kesehatan Ibu", "Gizi & MPASI"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L15",
    title: "Tanda Bahaya Bayi Baru Lahir (0-28 Hari) & Ukuran Lambung Bayi",
    categories: ["Tumbuh Kembang", "Informasi Umum"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L16",
    title: "Perawatan Bayi Baru Lahir: Tali Pusat, Perawatan Kanguru, & Deteksi Warna Tinja (Atresia Bilier)",
    categories: ["Tumbuh Kembang", "Informasi Umum"],
    type: "Artikel",
    duration: "9 Menit",
    imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L17",
    title: "Tanda Bahaya Balita 29 Hari - 5 Tahun & Panduan Pengukuran Lingkar Lengan Atas (LiLA)",
    categories: ["Tumbuh Kembang", "Informasi Umum"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L18",
    title: "Pemantauan Tumbuh Kembang Bayi 29 Hari - 3 Bulan: Stimulasi, Imunisasi & Milestones",
    categories: ["Tumbuh Kembang", "Imunisasi"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L19",
    title: "Pemantauan Tumbuh Kembang Bayi 3 - 6 Bulan: Stimulasi, Perawatan Gigi & Milestones",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L20",
    title: "Panduan Lengkap MPASI Gizi Seimbang & Resep Praktis Bayi Usia 6 - 12 Bulan",
    categories: ["Gizi & MPASI", "Tumbuh Kembang"],
    type: "Artikel",
    duration: "10 Menit",
    imageUrl: "/cover-article/L20.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L21",
    title: "Panduan Lengkap Tumbuh Kembang, Pola Asuh & Menu MPASI Bayi Usia 6 - 12 Bulan",
    categories: ["Gizi & MPASI", "Tumbuh Kembang"],
    type: "Artikel",
    duration: "10 Menit",
    imageUrl: "/cover-article/L21.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L22",
    title: "Panduan Gizi Seimbang, Pola Asuh & Deteksi Hidrasi Anak Usia 12 - 24 Bulan",
    categories: ["Gizi & MPASI", "Tumbuh Kembang"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "/cover-article/L22.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L23",
    title: "Panduan Tumbuh Kembang, Golden Age & Pola Asuh Anak Usia 2 - 6 Tahun",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "/cover-article/L23.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L24",
    title: "Manajemen Gizi Seimbang & Tindakan Pencegahan Diare Dehidrasi Balita",
    categories: ["Gizi & MPASI", "Informasi Umum"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "/cover-article/L24.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  },
  {
    id: "L25",
    title: "Menjaga Kesehatan Mental Orang Tua & Manajemen Stres Pengasuhan Anak",
    categories: ["Informasi Umum"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "/cover-article/L25.jpg",
    isLanjutkanMembaca: false,
    isNativeKIA: true
  }
];