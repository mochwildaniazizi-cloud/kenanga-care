"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  UserIcon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon, 
  InformationCircleIcon,
  CameraIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/solid";
import { MdOutlineError, MdCheckCircleOutline } from "react-icons/md";

// Component wrapper with Suspense to handle next.js searchParams client-side rendering
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>("profile");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: "Kader Siti",
    posyandu: "Posyandu Kenanga 1",
    role: "Ketua Kader",
    email: "siti.posyandu@gmail.com",
    phone: "0812-3456-7890",
    address: "Jl. Mawar No. 12, Kel. Kenanga"
  });

  // Account Settings Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [lang, setLang] = useState("id");

  // Sync tab parameter with active state
  useEffect(() => {
    if (tabParam === "help") {
      setActiveTab("help");
    } else if (tabParam === "account") {
      setActiveTab("account");
    } else if (tabParam === "about") {
      setActiveTab("about");
    } else {
      setActiveTab("profile");
    }
  }, [tabParam]);

  // Load from local storage
  useEffect(() => {
    const savedName = localStorage.getItem("kader_name");
    const savedPosyandu = localStorage.getItem("kader_posyandu");
    const savedRole = localStorage.getItem("kader_role");
    const savedEmail = localStorage.getItem("kader_email");
    const savedPhone = localStorage.getItem("kader_phone");
    const savedAddress = localStorage.getItem("kader_address");
    
    setFormData({
      name: savedName || "Kader Siti",
      posyandu: savedPosyandu || "Posyandu Kenanga 1",
      role: savedRole || "Ketua Kader",
      email: savedEmail || "siti.posyandu@gmail.com",
      phone: savedPhone || "0812-3456-7890",
      address: savedAddress || "Jl. Mawar No. 12, Kel. Kenanga"
    });
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem("kader_name", formData.name);
    localStorage.setItem("kader_posyandu", formData.posyandu);
    localStorage.setItem("kader_role", formData.role);
    localStorage.setItem("kader_email", formData.email);
    localStorage.setItem("kader_phone", formData.phone);
    localStorage.setItem("kader_address", formData.address);

    // Dispatch update event for Header sync
    window.dispatchEvent(new Event("profile-updated"));

    setSuccessMessage("Informasi profil Anda telah berhasil diperbarui dan disimpan.");
    setShowSuccessModal(true);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }
    
    // Simulate password saving
    setSuccessMessage("Kata sandi Anda berhasil diperbarui.");
    setShowSuccessModal(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const getInitials = (name: string) => {
    if (!name) return "KS";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Back to dashboard & header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-base-white border border-base-border/30 rounded-xl text-base-text-secondary hover:text-brand-primary transition hover:shadow-sm">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Pengaturan</h1>
            <p className="text-xs md:text-sm text-base-text-secondary">Kelola informasi profil, preferensi akun, dan akses pusat bantuan.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Bento Menu Tabs */}
        <div className="lg:col-span-4 bg-card p-6 rounded-bento-md shadow-sm border border-base-border/20 space-y-2">
          <div className="pb-4 border-b border-base-border/20 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-soft rounded-full flex items-center justify-center font-bold text-brand-primary border border-brand-primary/20 text-lg">
              {getInitials(formData.name)}
            </div>
            <div>
              <h2 className="font-bold text-base-text-primary leading-tight text-base">{formData.name}</h2>
              <p className="text-xs text-base-text-secondary mt-0.5">{formData.role} • {formData.posyandu}</p>
            </div>
          </div>

          <button
            onClick={() => { setActiveTab("profile"); router.push("/setting"); }}
            className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl text-left transition duration-150 cursor-pointer ${
              activeTab === "profile" 
                ? "bg-brand-primary text-base-white font-semibold shadow-md"
                : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => { setActiveTab("account"); router.push("/setting?tab=account"); }}
            className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl text-left transition duration-150 cursor-pointer ${
              activeTab === "account" 
                ? "bg-brand-primary text-base-white font-semibold shadow-md"
                : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Pengaturan Akun</span>
          </button>

          <button
            onClick={() => { setActiveTab("help"); router.push("/setting?tab=help"); }}
            className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl text-left transition duration-150 cursor-pointer ${
              activeTab === "help" 
                ? "bg-brand-primary text-base-white font-semibold shadow-md"
                : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
            }`}
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
            <span>Pusat Bantuan</span>
          </button>

          <button
            onClick={() => { setActiveTab("about"); router.push("/setting?tab=about"); }}
            className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl text-left transition duration-150 cursor-pointer ${
              activeTab === "about" 
                ? "bg-brand-primary text-base-white font-semibold shadow-md"
                : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
            }`}
          >
            <InformationCircleIcon className="w-5 h-5" />
            <span>Tentang Aplikasi</span>
          </button>
        </div>

        {/* Right Side: Bento Content Area */}
        <div className="lg:col-span-8 bg-card p-6 md:p-8 rounded-bento-md shadow-sm border border-base-border/20 min-h-[450px]">
          
          {/* TAB 1: PROFIL SAYA */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-base-text-primary">Profil Saya</h3>
                <p className="text-xs md:text-sm text-base-text-secondary">Perbarui detail profil Anda untuk digunakan pada laporan Posyandu.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                {/* Avatar change */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-base-bg/30 border border-base-border/20 rounded-2xl w-fit">
                  <div className="relative group cursor-pointer w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center font-bold text-brand-primary border border-brand-primary/20 text-3xl">
                    {getInitials(formData.name)}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150">
                      <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-semibold text-sm text-base-text-primary">Foto Profil</h4>
                    <p className="text-[11px] text-base-text-secondary">Unggah foto format JPG/PNG, ukuran maks. 2 MB</p>
                    <button type="button" className="px-3 py-1 bg-base-white border border-base-border/50 text-[11px] rounded-lg text-base-text-primary hover:bg-brand-soft hover:text-brand-primary transition">Pilih File</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Posyandu */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Posyandu</label>
                    <input 
                      type="text" 
                      required
                      value={formData.posyandu} 
                      onChange={(e) => setFormData({...formData, posyandu: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Jabatan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Jabatan</label>
                    <input 
                      type="text" 
                      required
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Nomor WhatsApp / HP</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-base-text-primary block">Alamat Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-base-text-primary block">Alamat Kerja / Posyandu</label>
                    <textarea 
                      rows={3}
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-brand-primary text-base-white font-bold text-sm hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PENGATURAN AKUN */}
          {activeTab === "account" && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary">Keamanan Kata Sandi</h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Ubah kata sandi Anda secara berkala untuk menjaga keamanan data.</p>
                </div>

                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Kata Sandi Sekarang</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Masukkan kata sandi lama"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Minimal 6 karakter"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Konfirmasi Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Ulangi kata sandi baru"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-md cursor-pointer"
                  >
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Ubah Kata Sandi</span>
                  </button>
                </form>
              </div>

              <hr className="border-t border-base-border/20" />

              {/* Preference: Language */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-base-text-secondary" />
                    <span>Bahasa (Language)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Pilih bahasa pengantar antarmuka sistem dashboard.</p>
                </div>

                <div className="max-w-xs">
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUSAT BANTUAN */}
          {activeTab === "help" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-base-text-primary">Pusat Bantuan</h3>
                <p className="text-xs md:text-sm text-base-text-secondary">Temukan panduan cepat dan jawaban atas pertanyaan umum seputar dashboard Kenanga Care.</p>
              </div>

              <div className="space-y-4">
                {/* Accordion FAQ 1 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150" open>
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Bagaimana cara menyinkronkan data secara offline?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Sistem dirancang dengan teknologi PWA (Progressive Web App). Data pengukuran anak atau ibu yang diinputkan saat offline akan otomatis disimpan di cache lokal peramban. Ketika koneksi internet Anda terhubung kembali, data akan otomatis terkirim dan disinkronkan ke server database Supabase. Anda dapat melihat status sinkronisasi aktif melalui ikon awan pada Header di kanan atas.
                  </p>
                </details>

                {/* Accordion FAQ 2 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150">
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Mengapa ada batasan nilai input angka negatif?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Demi keakuratan rekam medis anak (seperti berat badan, tinggi badan, lingkar kepala, dan umur), sistem menyertakan validasi otomatis `min="0"`. Ini mencegah kader salah menginputkan nilai minus atau negatif yang berisiko merusak hasil grafik status gizi anak.
                  </p>
                </details>

                {/* Accordion FAQ 3 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150">
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Bagaimana cara menghubungi administrator posyandu?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Apabila Anda mengalami kendala teknis atau masalah otentikasi login yang berkelanjutan, silakan hubungi tim IT Puskesmas wilayah Anda atau hubungi nomor layanan Kenanga Care melalui WhatsApp di +62-812-3456-7890.
                  </p>
                </details>
              </div>
            </div>
          )}

          {/* TAB 4: TENTANG APLIKASI */}
          {activeTab === "about" && (
            <div className="space-y-8 flex flex-col justify-center items-center py-6 h-full text-center">
              <div className="w-20 h-20 bg-brand-soft rounded-2xl flex items-center justify-center text-4xl shadow-md border border-brand-primary/10">
                🌸
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-primary tracking-tight">Kenanga Care</h3>
                <p className="text-sm font-semibold text-base-text-primary">Dashboard Pemantauan Kesehatan Balita & Ibu Hamil</p>
                <p className="text-xs text-base-text-secondary">Kader Version: 1.2.0 • Offline-First PWA Support</p>
              </div>

              <div className="max-w-md bg-base-bg/30 border border-base-border/20 rounded-xl p-4 text-xs text-base-text-secondary leading-relaxed">
                Aplikasi ini dikembangkan untuk memfasilitasi pencatatan, pemantauan, dan deteksi dini stunting secara digital di Posyandu Kenanga. Mendukung sinkronisasi otomatis, visualisasi status gizi dinamis, dan ramah pengguna.
              </div>

              <div className="text-[11px] text-base-text-secondary/70">
                © 2026 Posyandu Kenanga. All rights reserved.
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Success Alert Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Berhasil Disimpan</h3>
              <p className="text-sm text-base-text-secondary">
                {successMessage}
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => setShowSuccessModal(false)}
                className="w-full max-w-[200px] py-2.5 rounded-xl bg-status-green-solid text-base-white font-bold hover:bg-status-green-solid/90 transition shadow-sm cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
