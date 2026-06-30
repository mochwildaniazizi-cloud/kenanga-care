"use client";

import Link from "next/link";
import { 
  MdPregnantWoman, 
  MdOutlineScale, 
  MdSpeed, 
  MdSecurity, 
  MdArrowForward,
  MdCheckCircle,
  MdPhone,
  MdLocationOn
} from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";
import { FaBookOpen, FaCalendarAlt } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary overflow-x-hidden font-sans select-none pb-12">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-status-blue-solid/5 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]"></div>

      {/* --- 1. HERO NAVIGATION NAVBAR --- */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-status-pink-dark rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <img 
              src="/Logo.png" 
              alt="Logo Kenanga Care" 
              className="w-10 h-10 rounded-xl object-cover relative border border-brand-primary/15 shadow-sm" 
            />
          </div>
          <div>
            <h1 className="text-lg font-black text-brand-primary leading-tight tracking-tight">Kenanga Care</h1>
            <p className="text-[10px] text-base-text-secondary font-bold uppercase tracking-wider">Layanan Posyandu Digital</p>
          </div>
        </div>
        
        <Link 
          href="/login"
          className="px-6 py-2.5 rounded-full bg-brand-primary text-base-white font-bold text-xs hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/15 hover:shadow-brand-primary/25 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Masuk Dashboard</span>
          <MdArrowForward className="w-4 h-4" />
        </Link>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Intro Text */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/10 text-xs font-bold tracking-wide uppercase">
            🌸 Posyandu Kenanga 1 Online
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-base-text-primary tracking-tight leading-[1.1]">
            Pantau Tumbuh Kembang <br />
            <span className="bg-gradient-to-r from-brand-primary via-status-pink-dark to-status-blue-solid bg-clip-text text-transparent">
              Balita &amp; Ibu Hamil
            </span>
          </h2>
          <p className="text-sm md:text-base text-base-text-secondary leading-relaxed max-w-2xl">
            Selamat datang di portal informasi dan pemantauan kesehatan digital Posyandu Kenanga 1. Kami mendigitalisasi pencatatan KMS, deteksi dini stunting balita, serta pengawasan risiko kesehatan ibu hamil/nifas demi mewujudkan generasi emas yang sehat dan cerdas.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/login"
              className="px-8 py-3.5 rounded-full bg-brand-primary text-base-white font-extrabold text-sm hover:bg-status-pink-dark transition shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30 flex items-center gap-2 cursor-pointer"
            >
              <span>Mulai Pantau Sekarang</span>
              <MdArrowForward className="w-4 h-4" />
            </Link>
            <a 
              href="#features"
              className="px-8 py-3.5 rounded-full bg-base-white border border-base-border/50 text-base-text-primary font-bold text-sm hover:bg-base-bg/50 transition shadow-sm flex items-center gap-2"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Right Preview Banner */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="absolute -inset-2 bg-gradient-to-tr from-brand-primary to-status-blue-solid rounded-[2.5rem] blur-xl opacity-20 animate-pulse duration-[10s]"></div>
          <div className="relative bg-base-white border border-base-border/40 p-5 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-base-border/20">
              <span className="text-[10px] font-black uppercase text-brand-primary tracking-wider">Status Tumbuh Kembang</span>
              <span className="px-2 py-0.5 rounded-full bg-status-green-light text-status-green-solid font-bold text-[9px]">Normal</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center font-bold text-brand-primary text-lg">
                GP
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-base-text-primary">Giselle Putri</h4>
                <p className="text-[10px] text-base-text-secondary font-medium">Usia: 7 Bulan • Perempuan</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-base-bg/40 p-3 rounded-xl border border-base-border/20 text-center">
                <p className="text-[10px] text-base-text-secondary font-bold uppercase">Berat Badan</p>
                <p className="text-base font-extrabold text-base-text-primary mt-0.5">8.2 kg</p>
              </div>
              <div className="bg-base-bg/40 p-3 rounded-xl border border-base-border/20 text-center">
                <p className="text-[10px] text-base-text-secondary font-bold uppercase">Tinggi Badan</p>
                <p className="text-base font-extrabold text-base-text-primary mt-0.5">68.5 cm</p>
              </div>
            </div>

            <div className="p-3 bg-brand-soft/20 rounded-xl border border-brand-primary/5 text-xs text-brand-primary font-semibold flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 shrink-0" />
              <span>Z-Score: Gizi Baik (-0.23 SD)</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. KEY METRICS STATS --- */}
      <section className="bg-base-white border-y border-base-border/20 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-black text-brand-primary">120+</p>
            <p className="text-xs md:text-sm text-base-text-secondary font-bold uppercase tracking-wider">Balita Terpantau</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-black text-status-blue-solid">45+</p>
            <p className="text-xs md:text-sm text-base-text-secondary font-bold uppercase tracking-wider">Ibu Terdaftar</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-black text-status-green-solid">98%</p>
            <p className="text-xs md:text-sm text-base-text-secondary font-bold uppercase tracking-wider">Kehadiran Posyandu</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl md:text-4xl font-black text-status-pink-dark">0%</p>
            <p className="text-xs md:text-sm text-base-text-secondary font-bold uppercase tracking-wider">Kasus Stunting Baru</p>
          </div>
        </div>
      </section>

      {/* --- 4. FEATURE CARDS GRID --- */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h3 className="text-2xl md:text-3xl font-black text-base-text-primary tracking-tight">
            Layanan Unggulan Digital Posyandu
          </h3>
          <p className="text-xs md:text-sm text-base-text-secondary">
            Semua modul dirancang khusus untuk mempermudah kader dalam pencatatan dan mempercepat akses informasi ibu balita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-base-white border border-base-border/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center">
              <PiBabyFill className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-lg text-base-text-primary">E-KMS &amp; Hitung Z-Score</h4>
            <p className="text-xs text-base-text-secondary leading-relaxed">
              Kader dapat memasukkan hasil timbangan berat badan dan tinggi badan anak secara instan. Sistem langsung mengkalkulasi skor antropometri berdasarkan standar WHO secara akurat.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-base-white border border-base-border/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center">
              <MdPregnantWoman className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-lg text-base-text-primary">Pemantauan Ibu Hamil</h4>
            <p className="text-xs text-base-text-secondary leading-relaxed">
              Memantau status Hb darah, tekanan darah, lingkar lengan atas (LILA), serta tinggi fundus ibu hamil secara digital untuk mendeteksi dini risiko tinggi kehamilan (Resti).
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-base-white border border-base-border/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition space-y-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-status-green-light text-status-green-solid flex items-center justify-center">
              <MdSpeed className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-lg text-base-text-primary">Offline-First PWA</h4>
            <p className="text-xs text-base-text-secondary leading-relaxed">
              Aplikasi tetap dapat digunakan secara luring saat jaringan internet di lokasi posyandu buruk. Data tersimpan aman di cache dan otomatis sinkron begitu koneksi pulih.
            </p>
          </div>
        </div>
      </section>

      {/* --- 5. ALUR POSYANDU --- */}
      <section className="bg-base-white border-y border-base-border/20 py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl md:text-3xl font-black text-base-text-primary tracking-tight">
              Alur Pemeriksaan Kesehatan Digital
            </h3>
            <p className="text-xs md:text-sm text-base-text-secondary">
              Proses pemeriksaan yang efisien dari kedatangan hingga peninjauan data oleh orang tua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 bg-brand-primary text-base-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow-md">
                1
              </div>
              <h4 className="font-extrabold text-base text-base-text-primary">Pendaftaran Akun</h4>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                Kader posyandu meregistrasikan data profil awal ibu hamil atau profil balita ke database sistem.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 bg-status-blue-solid text-base-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow-md">
                2
              </div>
              <h4 className="font-extrabold text-base text-base-text-primary">Timbang &amp; Ukur</h4>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                Kader menimbang berat badan dan mengukur panjang/tinggi badan saat pelaksanaan posyandu bulanan.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 bg-status-green-solid text-base-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow-md">
                3
              </div>
              <h4 className="font-extrabold text-base text-base-text-primary">Analisis Z-Score</h4>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                Sistem menghitung kurva gizi WHO secara otomatis dan memproses status stunting secara real-time.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 bg-status-pink-dark text-base-white rounded-full flex items-center justify-center font-black text-sm mx-auto md:mx-0 shadow-md">
                4
              </div>
              <h4 className="font-extrabold text-base text-base-text-primary">Pantau Grafik KMS</h4>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                Orang tua dapat memantau grafik tumbuh kembang anak kandungnya langsung dari dasbor HP pribadi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. FOOTER CONTACT --- */}
      <footer className="max-w-7xl mx-auto px-6 pt-20 pb-8 text-xs text-base-text-secondary space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-extrabold text-base text-base-text-primary">Kenanga Care</span>
            </div>
            <p className="leading-relaxed">
              Mendigitalisasi layanan posyandu demi pemantauan kesehatan ibu dan anak balita yang lebih terintegrasi, andal, dan cerdas.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <h5 className="font-extrabold text-sm text-base-text-primary">Kontak Layanan</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <MdPhone className="w-4 h-4 text-brand-primary" />
                <span>+62 812-3456-7890 (Kader)</span>
              </li>
              <li className="flex items-center gap-2">
                <MdLocationOn className="w-4 h-4 text-brand-primary" />
                <span>Balai RW 05, Kel. Kenanga, Malang</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h5 className="font-extrabold text-sm text-base-text-primary">Keamanan Data</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <MdSecurity className="w-4 h-4 text-status-green-solid" />
                <span>Data terenkripsi aman di Supabase DB</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-base-border/20 text-center">
          <p>© 2026 Posyandu Kenanga 1. Semua Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
