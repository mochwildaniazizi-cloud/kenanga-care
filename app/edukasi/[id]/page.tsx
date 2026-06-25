"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiTag, FiBookOpen } from "react-icons/fi";
import { MdPlayCircleOutline, MdBookmark, MdBookmarkBorder, MdShare } from "react-icons/md";
import { mockArticles, Article } from "../data";

// Extends Article interface to allow custom content field
interface ExtendedArticle extends Article {
  content?: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [article, setArticle] = useState<ExtendedArticle | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link artikel disalin ke clipboard!");
            }}
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
