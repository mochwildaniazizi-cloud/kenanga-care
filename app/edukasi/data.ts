export type CategoryType = 
  | "Kehamilan" 
  | "Melahirkan" 
  | "Setelah Melahirkan" 
  | "Menyusui" 
  | "0 - 6 Bulan" 
  | "6 - 12 Bulan" 
  | "12 - 24 Bulan" 
  | "2 - 6 Tahun" 
  | "Informasi Umum";

export interface Article {
  id: string;
  title: string;
  categories: CategoryType[];
  duration: string;
  imageUrl: string;
}

export const mockArticles: Article[] = [
  {
    id: "L1",
    title: "1000 Hari Pertama Kehidupan (HPK): Fondasi Emas Pertumbuhan Otak Anak",
    categories: ["Kehamilan", "Informasi Umum"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L1.jpg"
  },
  {
    id: "L2",
    title: "Panduan Dasar Kehamilan: Masa Keemasan Ibu dan Pola Nutrisi Harian",
    categories: ["Kehamilan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L2.jpg"
  },
  {
    id: "L3",
    title: "Usia Kehamilan 1-3 Bulan (Trimester 1): Masa Penting Pembentukan Janin & Panduan Nutrisi",
    categories: ["Kehamilan"],
    duration: "7 Menit",
    imageUrl: "/cover-article/L3.jpg"
  },
  {
    id: "L4",
    title: "Panduan Lengkap Trimester 1: Deteksi Tanda Bahaya & Perawatan Sehari-hari Ibu Hamil",
    categories: ["Kehamilan"],
    duration: "8 Menit",
    imageUrl: "/cover-article/L4.jpg"
  },
  {
    id: "L5",
    title: "Kesehatan Jiwa Ibu Hamil: Mengenali Gejala Emosional & Pentingnya Dukungan Keluarga",
    categories: ["Kehamilan", "Informasi Umum"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L5.jpg"
  },
  {
    id: "L6",
    title: "Usia Kehamilan 4-6 Bulan (Trimester 2): Perkembangan Janin & Porsi Makan Ibu Hamil",
    categories: ["Kehamilan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L6.jpg"
  },
  {
    id: "L7",
    title: "Deteksi Dini Kelahiran Berisiko: 9 Tanda Bahaya Kehamilan Trimester 2",
    categories: ["Kehamilan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L7.jpg"
  },
  {
    id: "L8",
    title: "Usia Kehamilan 7-9 Bulan (Trimester 3): Persiapan Menyambut Kehadiran Si Kecil",
    categories: ["Kehamilan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L8.jpg"
  },
  {
    id: "L9",
    title: "Tanda Bahaya Kehamilan Trimester 3: Deteksi Kritis & Protokol Rujukan Darurat Medis",
    categories: ["Kehamilan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L9.jpg"
  },
  {
    id: "L10",
    title: "Melahirkan: Saatnya Sambut Kehadiran Sang Buah Hati & Pilihan Tempat Persalinan",
    categories: ["Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L10.jpg"
  },
  {
    id: "L11",
    title: "Panduan Persalinan Normal: Mengenali Tanda Awal Melahirkan & Manajemen Nyeri",
    categories: ["Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L11.jpg"
  },
  {
    id: "L12",
    title: "Deteksi Dini Kelahiran Berisiko: 6 Tanda Bahaya Pada Proses Melahirkan yang Wajib Dirujuk",
    categories: ["Melahirkan"],
    duration: "4 Menit",
    imageUrl: "/cover-article/L12.jpg"
  }
];