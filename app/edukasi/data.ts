export type CategoryType = "Gizi & MPASI" | "Imunisasi" | "Ibu Hamil" | "Ibu Nifas" | "Ibu Menyusui" | "Tumbuh Kembang";

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
  },
  {
    id: "L6",
    title: "Kesehatan Jiwa Ibu Hamil & Kelas Ibu Hamil (Trimester 1)",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L7",
    title: "Usia Kehamilan 4-6 Bulan: Perkembangan & Porsi Makan Trimester 2",
    categories: ["Ibu Hamil", "Gizi & MPASI"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L8",
    title: "9 Tanda Bahaya Kehamilan Trimester 2 yang Wajib Diwaspadai",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "5 Menit",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L9",
    title: "Panduan Trimester 3: Perkembangan Bayi & Checklist Persiapan Melahirkan",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L10",
    title: "Tanda Bahaya Trimester 3 & Panduan Awal Proses Melahirkan",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L11",
    title: "Tanda Bahaya pada Proses Melahirkan & Inisiasi Menyusu Dini (IMD)",
    categories: ["Ibu Hamil", "Gizi & MPASI"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L12",
    title: "Panduan Pemulihan Masa Nifas & Tanda Bahaya Setelah Melahirkan",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L13",
    title: "Depresi Pasca Melahirkan & Perencanaan Keluarga Berencana (KB)",
    categories: ["Ibu Hamil"],
    type: "Artikel",
    duration: "6 Menit",
    imageUrl: "https://images.unsplash.com/photo-1536640719371-2e25f8dd9a98?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L14",
    title: "Panduan Sukses Menyusui: Posisi, Pelekatan, & Cara Menyimpan ASI",
    categories: ["Ibu Menyusui", "Gizi & MPASI"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L15",
    title: "Tanda Bahaya Bayi Baru Lahir (0-28 Hari) & Ukuran Lambung Bayi",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "7 Menit",
    imageUrl: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L16",
    title: "Perawatan Bayi Baru Lahir: Tali Pusat, Perawatan Kanguru, & Deteksi Warna Tinja (Atresia Bilier)",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "9 Menit",
    imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  },
  {
    id: "L17",
    title: "Tanda Bahaya Balita 29 Hari - 5 Tahun & Panduan Pengukuran Lingkar Lengan Atas (LiLA)",
    categories: ["Tumbuh Kembang"],
    type: "Artikel",
    duration: "8 Menit",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=600&auto=format&fit=crop",
    isLanjutkanMembaca: false
  }
];