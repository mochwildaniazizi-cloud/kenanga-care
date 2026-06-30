"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { MdOutlineMale, MdOutlineFemale, MdOutlineError } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";
import { searchMothers, createChild } from "@/app/actions/children";
import { showLocalNotification } from "@/utils/notifications";

export default function TambahAnakPage() {
  const { role } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (role === "ibu") {
      router.replace("/data-anak");
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

  // Form States
  const [formData, setFormData] = useState({
    national_id: "",
    child_name: "",
    gender: "M",
    birth_place: "",
    birth_date: "",
    birth_order: "1",
    mother_id: "",
    birth_weight: "",
    birth_length: "",
    blood_type: "-"
  });

  // Mother Search State
  const [motherSearchTerm, setMotherSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{id: string, name: string, nik: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (motherSearchTerm.length >= 2 && !formData.mother_id) {
      setIsSearching(true);
      setShowDropdown(true);
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchMothers(motherSearchTerm);
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [motherSearchTerm, formData.mother_id]);

  const selectMother = (mother: {id: string, name: string}) => {
    setFormData(prev => ({ ...prev, mother_id: mother.id }));
    setMotherSearchTerm(mother.name);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Basic Validation
    if (!formData.child_name || !formData.birth_date || !formData.mother_id) {
      setErrorMsg("Mohon lengkapi Nama Anak, Tanggal Lahir, dan pilih Ibu Kandung.");
      return;
    }

    setIsSubmitting(true);
    const result = await createChild(formData);
    setIsSubmitting(false);

    if (result.success) {
      showLocalNotification("Data Anak Berhasil Disimpan", {
        body: `Data profil untuk ${formData.child_name} telah berhasil disimpan ke database.`,
      });
      router.push("/data-anak");
    } else {
      setErrorMsg(result.error || "Terjadi kesalahan.");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-4">
      
      {/* Header & Back Button */}
      <div>
        <Link href="/data-anak" className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-4">
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Card: Identitas Utama Anak */}
            <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30 h-full">
              <h2 className="text-xl font-bold text-base-text-primary mb-6">Identitas Utama Anak</h2>
              
              <div className="space-y-6">
                {/* NIK */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">NIK Anak</label>
                  <input 
                    type="text" 
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    placeholder="masukkan nik anak..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition"
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Nama Lengkap Anak</label>
                  <input 
                    type="text" 
                    name="child_name"
                    value={formData.child_name}
                    onChange={handleInputChange}
                    placeholder="masukkan nama lengkap anak..." 
                    className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition"
                    required
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Jenis Kelamin</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: "M" }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all font-bold text-sm ${
                        formData.gender === "M" 
                          ? "border-status-blue-solid text-status-blue-solid bg-status-blue-light/50" 
                          : "border-base-border/50 text-base-text-secondary hover:border-status-blue-solid/50 hover:bg-status-blue-light/20"
                      }`}
                    >
                      <MdOutlineMale className="w-5 h-5" /> Laki-Laki
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: "F" }))}
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all font-bold text-sm ${
                        formData.gender === "F" 
                          ? "border-brand-primary text-brand-primary bg-brand-soft/50" 
                          : "border-base-border/50 text-base-text-secondary hover:border-brand-primary/50 hover:bg-brand-soft/20"
                      }`}
                    >
                      <MdOutlineFemale className="w-5 h-5" /> Perempuan
                    </button>
                  </div>
                </div>

                {/* Tempat & Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Tempat, Tanggal Lahir</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      name="birth_place"
                      value={formData.birth_place}
                      onChange={handleInputChange}
                      placeholder="Tempat Lahir" 
                      className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition"
                    />
                    <div className="relative">
                      <input 
                        type="date" 
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition appearance-none text-base-text-primary bg-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Anak ke- */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Anak ke-</label>
                  <select 
                    name="birth_order"
                    value={formData.birth_order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition appearance-none bg-base-white text-base-text-primary"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {/* Golongan Darah */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Golongan Darah</label>
                  <select 
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition appearance-none bg-base-white text-base-text-primary"
                  >
                    <option value="-">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Span 1) */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
            <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30">
              <h2 className="text-xl font-bold text-base-text-primary mb-6">Data Kelahiran</h2>
              
              <div className="space-y-6">
                {/* Berat Badan Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Berat Badan Lahir (kg)</label>
                  <div className="relative flex items-center overflow-hidden rounded-lg border border-base-border/50 focus-within:border-brand-primary transition">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      name="birth_weight"
                      value={formData.birth_weight}
                      onChange={handleInputChange}
                      placeholder="masukkan berat badan anak..." 
                      className="w-full px-4 py-3 focus:outline-none bg-transparent z-10"
                    />
                  </div>
                </div>

                {/* Panjang Badan Lahir */}
                <div>
                  <label className="block text-sm font-semibold text-base-text-primary mb-2">Panjang Badan Lahir (cm)</label>
                  <div className="relative flex items-center overflow-hidden rounded-lg border border-base-border/50 focus-within:border-brand-primary transition">
                    <input 
                      type="number" 
                      min="0"
                      step="0.1"
                      name="birth_length"
                      value={formData.birth_length}
                      onChange={handleInputChange}
                      placeholder="masukkan panjang badan anak..." 
                      className="w-full px-4 py-3 focus:outline-none bg-transparent z-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Relasi Keluarga */}
            <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-base-text-primary mb-6">Relasi Keluarga</h2>
              <div>
                <label className="block text-sm font-semibold text-base-text-primary mb-2">Pilih Ibu Kandung</label>
                <div className="relative">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="cari berdasarkan nama atau nik ibu..." 
                      value={motherSearchTerm}
                      onChange={(e) => {
                        setMotherSearchTerm(e.target.value);
                        setFormData(prev => ({ ...prev, mother_id: "" })); // Reset selection if user types
                      }}
                      className="w-full pl-4 pr-10 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition"
                    />
                    <FiSearch className="absolute right-4 top-3.5 text-base-text-secondary w-5 h-5" />
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-base-white border border-base-border/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-sm text-center text-base-text-secondary">Mencari...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(mother => (
                          <button
                            key={mother.id}
                            type="button"
                            onClick={() => selectMother(mother)}
                            className="w-full text-left px-4 py-3 hover:bg-base-bg/50 border-b border-base-border/10 last:border-0 transition-colors"
                          >
                            <p className="font-bold text-base-text-primary text-sm">{mother.name}</p>
                            <p className="text-xs text-base-text-secondary mt-0.5">NIK: {mother.nik}</p>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-center text-base-text-secondary">Tidak ditemukan.</div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-base-text-secondary mt-3">
                  Pastikan data ibu sudah terdaftar. Jika belum, <Link href="/data-ibu/tambah" className="text-brand-primary font-bold hover:underline">Tambah Data Ibu Dulu</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- BOTTOM ACTION BUTTONS --- */}
        <div className="flex justify-end gap-4 mt-8">
          <button 
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-8 py-3 rounded-full border border-base-border/50 text-base-text-primary font-bold text-[15px] hover:bg-base-bg/50 transition"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-brand-primary text-base-white font-bold text-[15px] hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data Anak"}
          </button>
        </div>
      </form>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MdOutlineError className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Batalkan Pengisian?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin membatalkan? Semua isian formulir yang belum disimpan akan hilang.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-primary font-bold hover:bg-base-white transition"
              >
                Kembali
              </button>
              <button 
                type="button" 
                onClick={() => router.push("/data-anak")}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold hover:bg-brand-primary/90 transition shadow-sm"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
