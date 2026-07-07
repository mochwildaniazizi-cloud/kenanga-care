"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { FiArrowLeft, FiSearch } from "react-icons/fi";
import { MdOutlineMale, MdOutlineFemale, MdOutlineError, MdCheckCircleOutline } from "react-icons/md";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

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
    blood_type: "-",

    // Additional Child Identity fields from Buku KIA 2024
    jkn_number: "",
    faskes_1: "",
    faskes_referral: "",
    birth_certificate_number: "",
    other_financing: "",
    insurance_other: "",
    insurance_number: "",
    insurance_validity: "",
    faskes_primary: "",
    puskesmas_domicile: "",
    cohort_register_number_baby: "",
    cohort_register_number_toddler: "",
    faskes_secondary: "",
    medical_record_number: "",
    address: "",
    phone_number: "",
  });

  // Mother Search State
  const [motherSearchTerm, setMotherSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{id: string, name: string, nik: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    // Offline check for mother list
    if (motherSearchTerm.length >= 2 && !formData.mother_id) {
      if (!navigator.onLine) {
        const cachedMothers = localStorage.getItem("offline_mothers_list");
        if (cachedMothers) {
          const mothers = JSON.parse(cachedMothers);
          const filtered = mothers.filter((m: any) => 
            m.name.toLowerCase().includes(motherSearchTerm.toLowerCase()) || 
            (m.national_id && m.national_id.includes(motherSearchTerm))
          ).map((m: any) => ({ id: m.mother_id, name: m.name, nik: m.national_id }));
          setSearchResults(filtered);
          setShowDropdown(true);
        }
        return;
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    const payload = {
      ...formData,
      birth_order: formData.birth_order ? parseInt(formData.birth_order) : 1,
      birth_weight: formData.birth_weight ? parseFloat(formData.birth_weight) : null,
      birth_length: formData.birth_length ? parseFloat(formData.birth_length) : null,
    };

    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem("pending_create_children") || "[]");
      pending.push(payload);
      localStorage.setItem("pending_create_children", JSON.stringify(pending));

      setIsOfflineSaved(true);
      showLocalNotification("Data Anak Disimpan Offline", {
        body: `Data profil untuk ${formData.child_name} disimpan secara lokal di browser Anda.`,
      });
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    const result = await createChild(payload);
    setIsSubmitting(false);

    if (result.success) {
      setIsOfflineSaved(false);
      showLocalNotification("Data Anak Berhasil Disimpan", {
        body: `Data profil untuk ${formData.child_name} telah berhasil disimpan ke database.`,
      });
      setShowSuccessModal(true);
    } else {
      setErrorMsg(result.error || "Terjadi kesalahan.");
    }
  };

  const isFormDirty = () => {
    return (
      formData.child_name !== "" ||
      formData.birth_date !== "" ||
      formData.mother_id !== "" ||
      formData.national_id !== "" ||
      formData.birth_place !== "" ||
      formData.birth_weight !== "" ||
      formData.birth_length !== ""
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-28 lg:pb-8 p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Header & Back Button */}
      <div>
        <button 
          type="button"
          onClick={() => {
            if (isFormDirty()) {
              setShowCancelModal(true);
            } else {
              router.push("/data-anak");
            }
          }}
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-4 cursor-pointer focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      {/* Offline Warning Banner */}
      {!navigator.onLine && (
        <div className="mb-6 bg-status-orange-light border border-status-orange-solid/30 text-status-orange-solid rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <span>📵</span>
          <span>Mode Offline — Data akan disimpan di perangkat dan dikirim ketika online kembali.</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Registrasi Data Anak (Buku KIA)</h1>
        <p className="text-sm text-base-text-secondary">Daftarkan data balita baru sesuai dengan standar kolom identitas Buku KIA.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Child identity and health services (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card 1: Identitas Utama Anak */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 mb-4 flex items-center gap-2">
                <span className="p-1 rounded bg-brand-soft text-brand-primary text-xs">Balita</span> Identitas Utama Anak
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Nama Lengkap Anak <span className="text-status-red-solid">*</span></label>
                  <input type="text" name="child_name" value={formData.child_name} onChange={handleInputChange} required placeholder="Nama lengkap sesuai akta..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">NIK Anak</label>
                  <input type="text" name="national_id" maxLength={16} value={formData.national_id} onChange={handleInputChange} placeholder="KTP anak/KIA 16 digit..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">No. JKN / BPJS Anak</label>
                  <input type="text" name="jkn_number" value={formData.jkn_number} onChange={handleInputChange} placeholder="No. JKN..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Jenis Kelamin <span className="text-status-red-solid">*</span></label>
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: "M" }))} className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all font-bold text-xs ${formData.gender === "M" ? "border-status-blue-solid text-status-blue-solid bg-status-blue-light/50 shadow-sm" : "border-base-border/50 text-base-text-secondary hover:bg-base-bg/50"}`}><MdOutlineMale className="w-4 h-4" /> Laki-Laki</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, gender: "F" }))} className={`flex items-center justify-center gap-2 py-2 rounded-xl border transition-all font-bold text-xs ${formData.gender === "F" ? "border-brand-primary text-brand-primary bg-brand-soft/50 shadow-sm" : "border-base-border/50 text-base-text-secondary hover:bg-base-bg/50"}`}><MdOutlineFemale className="w-4 h-4" /> Perempuan</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Tempat Lahir</label>
                  <input type="text" name="birth_place" value={formData.birth_place} onChange={handleInputChange} placeholder="Tempat lahir..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Tanggal Lahir <span className="text-status-red-solid">*</span></label>
                  <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition text-base-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Anak Ke-</label>
                  <select name="birth_order" value={formData.birth_order} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition cursor-pointer">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Nomor Akta Kelahiran</label>
                  <input type="text" name="birth_certificate_number" value={formData.birth_certificate_number} onChange={handleInputChange} placeholder="No. Akta Kelahiran..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Golongan Darah</label>
                  <select name="blood_type" value={formData.blood_type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition cursor-pointer">
                    <option value="-">- (Pilih)</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Kontak & Layanan Kesehatan Anak */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 mb-4 flex items-center gap-2">
                <span className="p-1 rounded bg-brand-soft text-brand-primary text-xs">Balita</span> Kontak & Layanan Balita
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Alamat Rumah Anak</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} placeholder="Alamat rumah..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">No. Telepon / WA Anak</label>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="No. Telp anak/keluarga..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Tingkat I</label>
                  <input type="text" name="faskes_1" value={formData.faskes_1} onChange={handleInputChange} placeholder="Faskes I..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Rujukan</label>
                  <input type="text" name="faskes_referral" value={formData.faskes_referral} onChange={handleInputChange} placeholder="Faskes Rujukan..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Pembiayaan Lain</label>
                  <input type="text" name="other_financing" value={formData.other_financing} onChange={handleInputChange} placeholder="BPJS Mandiri/PBI..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Asuransi Lain</label>
                  <input type="text" name="insurance_other" value={formData.insurance_other} onChange={handleInputChange} placeholder="E.g. Prudential..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Nomor Asuransi</label>
                  <input type="text" name="insurance_number" value={formData.insurance_number} onChange={handleInputChange} placeholder="No. asuransi..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Tanggal Berlaku Asuransi</label>
                  <input type="date" name="insurance_validity" value={formData.insurance_validity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition text-base-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Primer</label>
                  <input type="text" name="faskes_primary" value={formData.faskes_primary} onChange={handleInputChange} placeholder="Faskes Primer..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Puskesmas Domisili</label>
                  <input type="text" name="puskesmas_domicile" value={formData.puskesmas_domicile} onChange={handleInputChange} placeholder="Puskesmas Domisili..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">No. Reg Kohort Bayi</label>
                  <input type="text" name="cohort_register_number_baby" value={formData.cohort_register_number_baby} onChange={handleInputChange} placeholder="No Kohort Bayi..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">No. Reg Kohort Balita</label>
                  <input type="text" name="cohort_register_number_toddler" value={formData.cohort_register_number_toddler} onChange={handleInputChange} placeholder="No Kohort Balita..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Sekunder</label>
                  <input type="text" name="faskes_secondary" value={formData.faskes_secondary} onChange={handleInputChange} placeholder="E.g. RSUD..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">No. Catatan Medik RS</label>
                  <input type="text" name="medical_record_number" value={formData.medical_record_number} onChange={handleInputChange} placeholder="No rekam medis RS..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Birth data and mother relation */}
          <div className="space-y-6">
            
            {/* Card: Data Kelahiran */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 mb-4 flex items-center gap-2">
                <span className="p-1 rounded bg-brand-soft text-brand-primary text-xs">Balita</span> Data Kelahiran
              </h2>
              
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Berat Badan Lahir (kg)</label>
                  <input type="number" step="0.01" min="0" name="birth_weight" value={formData.birth_weight} onChange={handleInputChange} placeholder="E.g. 3.12..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Panjang Badan Lahir (cm)</label>
                  <input type="number" step="0.1" min="0" name="birth_length" value={formData.birth_length} onChange={handleInputChange} placeholder="E.g. 48.5..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                </div>
              </div>
            </div>

            {/* Card: Relasi Keluarga */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 mb-4 flex items-center gap-2">
                  <span className="p-1 rounded bg-status-blue-light text-status-blue-solid text-xs font-bold">Relasi</span> Ibu Kandung
                </h2>
                
                <div className="space-y-3 text-sm relative">
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Pilih Ibu Kandung <span className="text-status-red-solid">*</span></label>
                  <div className="relative flex items-center">
                    <input type="text" placeholder="Ketik nama atau NIK ibu..." value={motherSearchTerm} onChange={(e) => { setMotherSearchTerm(e.target.value); setFormData(prev => ({ ...prev, mother_id: "" })); }} className="w-full pl-3 pr-10 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
                    <FiSearch className="absolute right-3 text-base-text-secondary w-4.5 h-4.5 pointer-events-none" />
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-base-white border border-base-border/30 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-xs text-center text-base-text-secondary">Mencari...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(mother => (
                          <button key={mother.id} type="button" onClick={() => selectMother(mother)} className="w-full text-left px-4 py-3 hover:bg-base-bg/50 border-b border-base-border/10 last:border-0 transition-colors flex flex-col">
                            <span className="font-bold text-base-text-primary text-sm">{mother.name}</span>
                            <span className="text-xs text-base-text-secondary mt-0.5">NIK: {mother.nik}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-center text-base-text-secondary">Tidak ditemukan.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-xs text-base-text-secondary mt-6 border-t pt-3 leading-relaxed">
                * Pastikan data ibu sudah terdaftar. Jika belum, <Link href="/data-ibu/tambah" className="text-brand-primary font-bold hover:underline">Daftarkan Ibu Terlebih Dahulu</Link>.
              </div>
            </div>

          </div>
        </div>

        {/* --- BOTTOM ACTION BUTTONS --- */}
        <div className="flex items-center justify-end gap-4 bg-base-white border border-base-border/30 rounded-2xl p-4 shadow-sm">
          <button 
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-8 py-2.5 rounded-full border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-bold text-sm hover:bg-base-bg/50 transition cursor-pointer"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full bg-brand-primary text-base-white font-bold text-[15px] hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data Anak"}
          </button>
        </div>
      </form>
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
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
                onClick={() => router.push("/data-anak")}
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
                  ? "Registrasi data anak telah disimpan secara lokal di browser Anda dan akan disinkronkan otomatis saat koneksi internet terhubung kembali."
                  : "Registrasi data balita baru berhasil disimpan ke database."
                }
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/data-anak");
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
