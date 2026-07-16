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
  },
  {
    id: "L13",
    title: "Panduan Inisiasi Menyusu Dini (IMD): Prosedur Golden Hour dan Manfaat Klinis bagi Ibu & Bayi",
    categories: ["Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L13.jpg",
  },
  {
    id: "L14",
    title: "Perawatan Setelah Melahirkan: Panduan Pemulihan Fisik Masa Nifas & Jadwal Periksa Rutin",
    categories: ["Setelah Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L14.jpg"
  },
  {
    id: "L15",
    title: "Deteksi Dini Kelahiran Berisiko: Tanda Bahaya pada Ibu Setelah Melahirkan & Larangan Nifas",
    categories: ["Setelah Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L15.jpg"
  },
  {
    id: "L16",
    title: "Mengenal Depresi Setelah Melahirkan: Perbedaan Baby Blues, Gejala, dan Solusi Penanganannya",
    categories: ["Setelah Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L16.jpg"
  },
  {
    id: "L17",
    title: "Perencanaan Kehamilan Sehat: Panduan Program Keluarga Berencana (KB) Pasca Melahirkan",
    categories: ["Setelah Melahirkan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L17.jpg"
  },
  {
    id: "L18",
    title: "Panduan Manajemen Menyusui: Manfaat Klinis, Teknik Pelekatan Benar, hingga Posisi Bayi Kembar",
    categories: ["Menyusui"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L18.jpg"
  },
  {
    id: "L19",
    title: "Manajemen ASI Perah: Panduan Teknik Memerah, Aturan Suhu, dan Cara Penyimpanan Steril",
    categories: ["Menyusui"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L19.jpg"
  },
  {
    id: "L20",
    title: "Nutrisi Ibu Menyusui: Panduan Porsi Makan, Kebutuhan Gizi Harian, dan Aturan Hidrasi",
    categories: ["Menyusui"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L20.jpg"
  },
  {
    id: "L21",
    title: "Panduan Perawatan Bayi Baru Lahir: Tanda Bayi Sehat, Pelayanan Neonatal esensial, & Perawatan Harian",
    categories: ["0 - 6 Bulan"],
    duration: "7 Menit",
    imageUrl: "/cover-article/L21.jpg"
  },
  {
    id: "L22",
    title: "Tahapan Ukuran Lambung Bayi Baru Lahir & Perilaku Menyusu yang Wajib Dipahami",
    categories: ["0 - 6 Bulan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L22.jpg"
  },
  {
    id: "L23",
    title: "Esensi Masa Neonatus (0-28 Hari): Jadwal Kunjungan Medis, Pola Tidur Sehat, dan Skrining Kritis",
    categories: ["0 - 6 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L23.jpg"
  },
  {
    id: "L24",
    title: "Deteksi Dini Neonatus: 11 Tanda Bahaya pada Bayi Usia 0-28 Hari & Edukasi Medis Kritis",
    categories: ["0 - 6 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L24.jpg"
  },
  {
    id: "L25",
    title: "Panduan Higiene Bayi Baru Lahir: Cara Memandikan, Rawat Tali Pusat, & Metode Kanguru BBLR",
    categories: ["0 - 6 Bulan"],
    duration: "7 Menit",
    imageUrl: "/cover-article/L25.jpg"
  },
  {
    id: "L26",
    title: "Skrining Warna Tinja Bayi: Deteksi Dini Atresia Bilier & Panduan Pemantauan Usia 0-4 Bulan",
    categories: ["0 - 6 Bulan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L26.jpg"
  },
  {
    id: "L27",
    title: "Psikologi Pola Asuh 0-18 Bulan: Stimulasi Motorik, Manajemen Tangisan, dan Regulasi Screen Time Kritis",
    categories: ["0 - 6 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L27.jpg"
  },
  {
    id: "L28",
    title: "Skrining Gizi Balita: Panduan Tepat Mengukur Lingkar Lengan Atas (LiLA) & Interpretasi Warna Pita",
    categories: ["0 - 6 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L28.jpg"
  },
  {
    id: "L29",
    title: "Mengapa Harus Mengikuti Kelas Ibu Balita? Manfaat Edukasi Kelompok, Imunisasi, dan Sharing Pengalaman",
    categories: ["0 - 6 Bulan"],
    duration: "4 Menit",
    imageUrl: "/cover-article/L29.jpg"
  },
  {
    id: "L30",
    title: "Deteksi Kegawatdaruratan Balita: 9 Tanda Bahaya pada Anak Usia 29 Hari - 5 Tahun yang Wajib Dirujuk",
    categories: ["0 - 6 Bulan"],
    duration: "5 Menit",
    imageUrl: "/cover-article/L30.jpg"
  },
  {
    id: "L31",
    title: "Pemantauan Bayi Usia 29 Hari - 3 Bulan: Panduan Stimulasi, Manfaat Imunisasi Dasar, & 8 Milestone Perkembangan",
    categories: ["0 - 6 Bulan"],
    duration: "7 Menit",
    imageUrl: "/cover-article/L31.jpg"
  },
  {
    id: "L32",
    title: "Pemantauan Bayi Usia 3 - 6 Bulan: Stimulasi Motorik, Perawatan Gusi Pertama, & 10 Indikator Perkembangan",
    categories: ["0 - 6 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L32.jpg"
  },
  // ======= MASUK KATEGORI PERAWATAN BAYI 6-12 BULAN ==========
  {
    id: "L33",
    title: "Panduan Tumbuh Kembang 6-12 Bulan: Cegah Stunting dengan MPASI Protein Hewani & Intervensi Medis Wajib",
    categories: ["6 - 12 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L33.jpg"
  },
  {
    id: "L34",
    title: "Panduan Kelompok Bahan MPASI 6-12 Bulan: Strategi Mengenalkan Alergi & Aturan Transisi Tekstur Makanan",
    categories: ["6 - 12 Bulan"],
    duration: "6 Menit",
    imageUrl: "/cover-article/L34.jpg"
  },
  {
    id: "L35",
    title: "Strategi Pemenuhan Gizi 6-24 Bulan: 4 Syarat MPASI Layak, Aturan Takaran Usia, & Panduan Resep Praktis",
    categories: ["6 - 12 Bulan"],
    duration: "8 Menit",
    imageUrl: "/cover-article/L35.jpg"
  },
  {
    id: "L36",
    title: "Pemantauan Bayi Usia 6-9 Bulan: Jadwal Imunisasi Campak, Perawatan Gigi Seri, & 11 Milestone Perkembangan",
    categories: ["6 - 12 Bulan"],
    duration: "7 Menit",
    imageUrl: "/cover-article/L36.jpg"
  },
  {
    id: "L37",
    title: "Pemantauan Bayi Usia 9-12 Bulan: Manfaat Imunisasi JE, Perawatan Gigi Geraham, & 12 Indikator Perkembangan",
    categories: ["6 - 12 Bulan"],
    duration: "8 Menit",
    imageUrl: "/cover-article/L37.jpg"
  },
];