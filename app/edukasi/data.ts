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
  // Lanjutkan Membaca
  { id: "L1", title: "Jadwal, Tekstur, dan Porsi MPASI Pertama 6 Bulan", categories: ["Gizi & MPASI"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop", isLanjutkanMembaca: true },
  { id: "L2", title: "Jadwal Imunisasi Dasar Lengkap Kemenkes 2026", categories: ["Imunisasi", "Tumbuh Kembang"], type: "Artikel", duration: "5 menit baca", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop", isLanjutkanMembaca: true },
  { id: "L3", title: "7 Tanda Bahaya Kehamilan yang Mewajibkan Anda Segera ke IGD", categories: ["Ibu Hamil"], type: "Video", duration: "5 menit tonton", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop", isLanjutkanMembaca: true },
  { id: "L4", title: "Ciri-ciri Fisik Bayi Sehat Sesuai Usia", categories: ["Tumbuh Kembang"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop", isLanjutkanMembaca: true },

  // Gizi & MPASI
  { id: "G1", title: "Panduan ASI Eksklusif 0-6 Bulan: Manfaat & Cara Menyusui", categories: ["Gizi & MPASI", "Ibu Nifas"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },
  { id: "G2", title: "Tutorial Menaikkan Tekstur MPASI Usia 9-11 Bulan", categories: ["Gizi & MPASI"], type: "Video", duration: "5 menit tonton", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" },
  { id: "G3", title: "Ide Resep MPASI Bintang 4 Kaya Zat Besi untuk Pemula", categories: ["Gizi & MPASI"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },
  { id: "G4", title: "Cara Benar Menyimpan dan Memanaskan ASIP & MPASI", categories: ["Gizi & MPASI"], type: "Video", duration: "4 menit tonton", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },
  { id: "G5", title: "Mengatasi Anak GTM (Gerakan Tutup Mulut) Tanpa Paksaan", categories: ["Gizi & MPASI", "Tumbuh Kembang"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" },
  { id: "G6", title: "Pentingnya Protein Hewani (Telur, Ikan) untuk Cegah Stunting", categories: ["Gizi & MPASI"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },

  // Imunisasi
  { id: "I1", title: "Apa itu KIPI? Cara Cepat Mengatasi Demam Pasca Imunisasi", categories: ["Imunisasi"], type: "Video", duration: "4 menit tonton", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop" },
  { id: "I2", title: "Manfaat Vaksin BCG dan Polio Sejak Bayi Baru Lahir", categories: ["Imunisasi"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },
  { id: "I3", title: "Imunisasi DPT: Tameng dari Difteri, Pertusis, dan Tetanus", categories: ["Imunisasi"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop" },
  { id: "I4", title: "Bahaya Penyakit Campak & Pentingnya Vaksin Rubella", categories: ["Imunisasi"], type: "Video", duration: "5 menit tonton", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },

  // Ibu Hamil
  { id: "H1", title: "Nutrisi Wajib Trimester 1: Cegah Mual & Penuhi Asam Folat", categories: ["Ibu Hamil", "Gizi & MPASI"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },
  { id: "H2", title: "Panduan Porsi Makan Ibu Hamil untuk Mencegah KEK", categories: ["Ibu Hamil", "Gizi & MPASI"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },
  { id: "H3", title: "Olahraga Ringan & Senam Hamil yang Aman Dilakukan di Rumah", categories: ["Ibu Hamil"], type: "Video", duration: "6 menit tonton", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },
  { id: "H4", title: "Keajaiban Rahim: Perkembangan Janin dari Bulan ke Bulan", categories: ["Ibu Hamil"], type: "Artikel", duration: "5 menit baca", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" },

  // Ibu Nifas
  { id: "N1", title: "Panduan Perawatan Luka Jahitan Perineum Pasca Lahiran Normal", categories: ["Ibu Nifas"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=600&auto=format&fit=crop" },
  { id: "N2", title: "Langkah-langkah Perawatan Luka Operasi Caesar di Rumah", categories: ["Ibu Nifas"], type: "Video", duration: "5 menit tonton", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },
  { id: "N3", title: "Tanda Bahaya Masa Nifas: Kapan Harus ke Dokter?", categories: ["Ibu Nifas"], type: "Artikel", duration: "4 menit baca", imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=600&auto=format&fit=crop" },
  { id: "N4", title: "Porsi Makan & Pemenuhan Gizi Ibu Menyusui untuk Pemulihan Cepat", categories: ["Ibu Nifas", "Gizi & MPASI"], type: "Artikel", duration: "3 menit baca", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop" },
];