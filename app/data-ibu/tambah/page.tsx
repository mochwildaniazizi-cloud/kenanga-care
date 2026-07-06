"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { FiArrowLeft } from "react-icons/fi";
import { MdOutlineError, MdCheckCircleOutline } from "react-icons/md";
import { createMother } from "@/app/actions/mothers";
import { showLocalNotification } from "@/utils/notifications";

export default function TambahIbuPage() {
  const { role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role === "ibu") {
      router.replace("/data-ibu");
    }
  }, [role, router]);

  if (role === "ibu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-base-text-secondary">Mengalihkan...</p>
      </div>
    );
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    national_id: "",
    mother_name: "",
    birth_date: "",
    age: "",
    husband_name: "",
    phone_number: "",
    blood_type: "A",
    ui_status: "Ibu Hamil",
    estimated_due_date: "",
    risk_status: "Normal",
    number_of_children: "0"
  });

  // Calculate age automatically when birth_date changes
  useEffect(() => {
    if (formData.birth_date) {
      const birth = new Date(formData.birth_date);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) {
        setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
      }
    }
  }, [formData.birth_date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Prevent negative numbers for children count and age
    if (name === "number_of_children" || name === "age") {
      const valNum = parseInt(value);
      if (valNum < 0) return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate NIK
    if (!formData.national_id || formData.national_id.length < 16) {
      setErrorMsg("NIK harus 16 digit angka.");
      return;
    }

    if (!formData.mother_name || !formData.birth_date) {
      setErrorMsg("Mohon lengkapi Nama Lengkap dan Tanggal Lahir.");
      return;
    }

    if (formData.ui_status === "Ibu Hamil" && !formData.estimated_due_date) {
      setErrorMsg("Mohon lengkapi Tanggal Perkiraan Lahir (HPL) untuk Ibu Hamil.");
      return;
    }

    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");
      pending.push({
        ...formData,
        age: formData.age ? parseInt(formData.age) : 0,
        number_of_children: formData.number_of_children ? parseInt(formData.number_of_children) : 0
      });
      localStorage.setItem("pending_create_mothers", JSON.stringify(pending));

      setIsOfflineSaved(true);
      showLocalNotification("Data Ibu Disimpan Offline", {
        body: `Data profil untuk ${formData.mother_name} disimpan secara lokal di browser Anda.`,
      });
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    const result = await createMother(formData);
    setIsSubmitting(false);

    if (result.success) {
      setIsOfflineSaved(false);
      showLocalNotification("Data Ibu Berhasil Terdaftar", {
        body: `Data profil untuk ${formData.mother_name} telah berhasil disimpan ke database.`,
      });
      setShowSuccessModal(true);
    } else {
      setErrorMsg(result.error || "Gagal mendaftarkan data ibu.");
    }
  };

  const isFormDirty = () => {
    return (
      formData.mother_name !== "" ||
      formData.national_id !== "" ||
      formData.birth_date !== "" ||
      formData.husband_name !== "" ||
      formData.phone_number !== "" ||
      formData.estimated_due_date !== ""
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-28 lg:pb-8 p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Header & Back Button */}
      <div>
        <button 
          onClick={() => {
            if (isFormDirty()) {
              setShowCancelModal(true);
            } else {
              router.push("/data-ibu");
            }
          }} 
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-6 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Registrasi Data Ibu</h1>
        <p className="text-sm text-base-text-secondary">Daftarkan data ibu baru untuk memantau kehamilan atau masa nifas.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Main identity card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-base-white rounded-bento-lg p-6 md:p-8 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-6">Identitas Utama Ibu</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* NIK */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-base-text-primary mb-2">NIK Ibu (KTP)</label>
                  <input 
                    type="text" 
                    name="national_id"
                    maxLength={16}
                    value={formData.national_id}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIK 16 digit..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    required
                  />
                </div>

                {/* Nama Ibu */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Nama Lengkap Ibu</label>
                  <input 
                    type="text" 
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap ibu..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    required
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    required
                  />
                </div>

                {/* Umur */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Umur (Tahun)</label>
                  <input 
                    type="number" 
                    name="age"
                    min="0"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Otomatis dari tanggal lahir" 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    required
                  />
                </div>

                {/* Golongan Darah */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Golongan Darah</label>
                  <select 
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white cursor-pointer appearance-none"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="Tidak Tahu">Tidak Tahu</option>
                  </select>
                </div>

                {/* Jumlah Anak */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Jumlah Anak Yang Dilahirkan</label>
                  <input 
                    type="number" 
                    name="number_of_children"
                    min="0"
                    value={formData.number_of_children}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Husband, status and risks cards */}
          <div className="space-y-6">
            
            {/* Card: Kontak & Suami */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-5">Kontak & Hubungan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Nama Suami</label>
                  <input 
                    type="text" 
                    name="husband_name"
                    value={formData.husband_name}
                    onChange={handleInputChange}
                    placeholder="Nama suami..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Nomor HP / WhatsApp</label>
                  <input 
                    type="tel" 
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="Contoh: 08123456..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>
              </div>
            </div>

            {/* Card: Status Posyandu & Resiko */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-5">Status Kehamilan & Risiko</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Status Ibu Saat Ini</label>
                  <select 
                    name="ui_status"
                    value={formData.ui_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white cursor-pointer"
                  >
                    <option value="Calon Ibu">Calon Ibu</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Ibu Nifas">Ibu Nifas</option>
                    <option value="Ibu Balita">Ibu Balita</option>
                  </select>
                </div>

                {/* HPL Date picker (Only show when status is Ibu Hamil) */}
                {formData.ui_status === "Ibu Hamil" && (
                  <div className="animate-in slide-in-from-top duration-200">
                    <label className="block text-xs font-bold text-base-text-primary mb-2">Tanggal Perkiraan Lahir (HPL)</label>
                    <input 
                      type="date" 
                      name="estimated_due_date"
                      value={formData.estimated_due_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Kondisi Risiko Awal</label>
                  <select 
                    name="risk_status"
                    value={formData.risk_status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="KEK">KEK (Kekurangan Energi Kronis)</option>
                    <option value="Risiko Tinggi">Risiko Tinggi</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center justify-end gap-4 bg-base-white border border-base-border/30 rounded-2xl p-4 shadow-sm">
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)}
            className="px-6 py-2.5 rounded-full border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-bold text-sm hover:bg-base-bg/50 transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-brand-primary text-base-white font-bold text-[15px] hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data Ibu"}
          </button>
        </div>
      </form>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MdOutlineError className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Batalkan Registrasi?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin membatalkan? Semua data yang sudah diketik akan hilang.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-primary font-bold hover:bg-base-white transition cursor-pointer"
              >
                Kembali
              </button>
              <button 
                type="button" 
                onClick={() => router.push("/data-ibu")}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold hover:bg-brand-primary/90 transition shadow-sm cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className={`w-16 h-16 ${isOfflineSaved ? 'bg-status-blue-light text-status-blue-solid' : 'bg-status-green-light text-status-green-solid'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">
                {isOfflineSaved ? "Tersimpan Offline 🔴" : "Berhasil Disimpan"}
              </h3>
              <p className="text-sm text-base-text-secondary">
                {isOfflineSaved 
                  ? "Registrasi data ibu telah disimpan secara lokal di browser Anda dan akan disinkronkan otomatis saat koneksi internet terhubung kembali."
                  : "Registrasi data ibu hamil/nifas baru berhasil disimpan ke database."
                }
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/data-ibu");
                }}
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
