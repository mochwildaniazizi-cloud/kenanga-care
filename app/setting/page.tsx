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
  ArrowLeftIcon,
  UsersIcon
} from "@heroicons/react/24/solid";
import { MdOutlineError, MdCheckCircleOutline } from "react-icons/md";
import { useUserRole } from "@/context/UserRoleContext";
import { getLoggedInMotherData, getMotherDetail, getMothersData } from "@/app/actions/mothers";

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
  const { role, username } = useUserRole();

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
    address: "Jl. Mawar No. 12, Kel. Kenanga",
    husband_name: "",
    national_id: ""
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
    } else if (tabParam === "users" && role === "kader") {
      setActiveTab("users");
    } else {
      setActiveTab("profile");
    }
  }, [tabParam, role]);

  const [motherDetail, setMotherDetail] = useState<any>(null);

  // Users Management states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load mothers for user management if kader
  useEffect(() => {
    if (role === "kader") {
      getMothersData().then((data) => {
        const mothersList = data.map((m) => ({
          name: m.name,
          username: m.phone || m.nik || "Tidak ada",
          role: m.status || "Ibu Balita",
          type: "Ibu / Orang Tua",
          phone: m.phone,
          status: "Aktif",
        }));
        
        const kaderUser = {
          name: "Kader Siti",
          username: "kader",
          role: "Ketua Kader",
          type: "Kader Posyandu",
          phone: "0812-3456-7890",
          status: "Aktif",
        };

        setAllUsers([kaderUser, ...mothersList]);
      });
    }
  }, [role]);

  // Load from local storage or database
  useEffect(() => {
    async function loadProfileData() {
      if (role === "ibu") {
        try {
          const loggedInMother = await getLoggedInMotherData(username);
          if (loggedInMother) {
            const detail = await getMotherDetail(loggedInMother.mother_id);
            if (detail) {
              setMotherDetail(detail);
              
              const savedName = localStorage.getItem("ibu_name") || detail.name || "";
              const savedPhone = localStorage.getItem("ibu_phone") || detail.phone_number || "";
              const savedEmail = localStorage.getItem("ibu_email") || `${detail.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
              const savedAddress = localStorage.getItem("ibu_address") || "Jl. Mawar No. 12, Kel. Kenanga";
              const savedHusband = localStorage.getItem("ibu_husband") || detail.husband_name || "";
              
              setFormData({
                name: savedName,
                posyandu: "Posyandu Kenanga 1",
                role: detail.status || "Ibu Balita",
                email: savedEmail,
                phone: savedPhone,
                address: savedAddress,
                husband_name: savedHusband,
                national_id: detail.national_id || ""
              });
            }
          }
        } catch (err) {
          console.error("Failed to load mother profile settings:", err);
        }
      } else {
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
          address: savedAddress || "Jl. Mawar No. 12, Kel. Kenanga",
          husband_name: "",
          national_id: ""
        });
      }
    }
    loadProfileData();
  }, [role, username]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === "ibu") {
      localStorage.setItem("ibu_name", formData.name);
      localStorage.setItem("ibu_phone", formData.phone);
      localStorage.setItem("ibu_email", formData.email);
      localStorage.setItem("ibu_address", formData.address);
      localStorage.setItem("ibu_husband", formData.husband_name);
    } else {
      localStorage.setItem("kader_name", formData.name);
      localStorage.setItem("kader_posyandu", formData.posyandu);
      localStorage.setItem("kader_role", formData.role);
      localStorage.setItem("kader_email", formData.email);
      localStorage.setItem("kader_phone", formData.phone);
      localStorage.setItem("kader_address", formData.address);
    }

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

          {role === "kader" && (
            <button
              onClick={() => { setActiveTab("users"); router.push("/setting?tab=users"); }}
              className={`flex items-center gap-3.5 w-full p-3.5 rounded-xl text-left transition duration-150 cursor-pointer ${
                activeTab === "users" 
                  ? "bg-brand-primary text-base-white font-semibold shadow-md"
                  : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              <span>Kelola Pengguna</span>
            </button>
          )}
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

                  {/* NIK or Posyandu */}
                  {role === "ibu" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-base-text-primary block">NIK Ibu</label>
                      <input 
                        type="text" 
                        disabled
                        value={formData.national_id} 
                        className="w-full bg-base-bg border border-base-border/30 rounded-xl px-4 py-2.5 text-sm text-base-text-secondary transition bg-base-bg/50 cursor-not-allowed font-semibold"
                      />
                    </div>
                  ) : (
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
                  )}

                  {/* Status Ibu or Jabatan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">
                      {role === "ibu" ? "Status Ibu" : "Jabatan"}
                    </label>
                    <input 
                      type="text" 
                      required
                      disabled={role === "ibu"}
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition ${
                        role === "ibu" ? "bg-base-bg/50 text-base-text-secondary cursor-not-allowed font-semibold" : ""
                      }`}
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

                  {/* Nama Suami (Only for Ibu) */}
                  {role === "ibu" && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-base-text-primary block">Nama Suami</label>
                      <input 
                        type="text" 
                        required
                        value={formData.husband_name} 
                        onChange={(e) => setFormData({...formData, husband_name: e.target.value})}
                        className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                      />
                    </div>
                  )}

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
                    <label className="text-xs font-bold text-base-text-primary block">
                      {role === "ibu" ? "Alamat Rumah" : "Alamat Kerja / Posyandu"}
                    </label>
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

          {/* TAB 5: KELOLA PENGGUNA (Only for Kader) */}
          {activeTab === "users" && role === "kader" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary">Kelola Pengguna</h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Daftar akun Kader dan Ibu yang terdaftar di database Posyandu Kenanga 1.</p>
                </div>
                
                {/* Search Input */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Cari nama atau username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-base-bg border border-base-border/40 focus:border-brand-primary rounded-xl py-2 px-4 pl-9 text-xs outline-none transition-colors text-base-text-primary focus:bg-base-white"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-2.5 w-4 h-4 text-base-text-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                  </svg>
                </div>
              </div>

              {/* Table / Cards */}
              <div className="border border-base-border/20 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-base-bg/50 border-b border-base-border/20 text-xs font-bold text-base-text-secondary uppercase">
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">Username (Akses)</th>
                        <th className="py-3 px-4">Tipe Akun</th>
                        <th className="py-3 px-4">Peran / Status</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-border/10 text-xs">
                      {(allUsers.filter(user => 
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.username.toLowerCase().includes(searchTerm.toLowerCase())
                      )).length > 0 ? (
                        (allUsers.filter(user => 
                          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase())
                        )).map((user, idx) => (
                          <tr key={idx} className="hover:bg-base-bg/25 transition duration-150">
                            <td className="py-3.5 px-4 font-bold text-base-text-primary">{user.name}</td>
                            <td className="py-3.5 px-4 font-mono text-base-text-secondary">{user.username}</td>
                            <td className="py-3.5 px-4 font-semibold text-base-text-secondary">{user.type}</td>
                            <td className="py-3.5 px-4 font-semibold text-base-text-secondary">{user.role}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-status-green-light text-status-green-solid font-bold text-[10px]">
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setSuccessMessage(`Akses & Kata sandi untuk ${user.name} berhasil di-reset ke default.`);
                                  setShowSuccessModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-base-border/50 text-[10px] text-base-text-primary font-bold hover:bg-brand-soft hover:text-brand-primary transition cursor-pointer"
                              >
                                Reset Kata Sandi
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-base-text-secondary font-medium">
                            Tidak ada pengguna ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
