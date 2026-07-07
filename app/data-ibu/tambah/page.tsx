"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { FiArrowLeft } from "react-icons/fi";
import { MdOutlineError, MdCheckCircleOutline, MdPregnantWoman, MdPerson, MdCalendarMonth, MdPhone } from "react-icons/md";
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
    number_of_children: "0",

    // Additional Mother Identity fields from Buku KIA 2024
    jkn_number: "",
    faskes_1: "",
    faskes_referral: "",
    birth_place: "",
    education: "",
    occupation: "",
    address: "",
    other_financing: "",
    insurance_other: "",
    insurance_number: "",
    insurance_validity: "",
    faskes_primary: "",
    puskesmas_domicile: "",
    cohort_register_number: "",
    faskes_secondary: "",
    medical_record_number: "",

    // Riwayat Singkat Kesehatan Ibu
    pregnancy_number: "1",
    children_born_alive: "0",
    miscarriage_history: "0",
    disease_history: "",

    // Husband fields
    husband_national_id: "",
    husband_jkn_number: "",
    husband_faskes_1: "",
    husband_faskes_referral: "",
    husband_birth_place: "",
    husband_birth_date: "",
    husband_education: "",
    husband_occupation: "",
    husband_address: "",
    husband_phone_number: "",
    husband_blood_type: "-",
    husband_other_financing: "",
    husband_insurance_other: "",
    husband_insurance_number: "",
    husband_insurance_validity: "",
    husband_faskes_primary: "",
    husband_puskesmas_domicile: "",
    husband_faskes_secondary: "",
    husband_medical_record_number: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Prevent negative numbers for children count, age, pregnancy number, live births, miscarriages
    if (
      name === "number_of_children" || 
      name === "age" || 
      name === "pregnancy_number" || 
      name === "children_born_alive" || 
      name === "miscarriage_history"
    ) {
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
      setErrorMsg("NIK Ibu harus 16 digit angka.");
      return;
    }

    if (!formData.mother_name || !formData.birth_date) {
      setErrorMsg("Mohon lengkapi Nama Lengkap Ibu dan Tanggal Lahir.");
      return;
    }

    if (formData.ui_status === "Ibu Hamil" && !formData.estimated_due_date) {
      setErrorMsg("Mohon lengkapi Tanggal Perkiraan Lahir (HPL) untuk Ibu Hamil.");
      return;
    }

    const payload = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : 0,
      number_of_children: formData.number_of_children ? parseInt(formData.number_of_children) : 0,
      pregnancy_number: formData.pregnancy_number ? parseInt(formData.pregnancy_number) : 1,
      children_born_alive: formData.children_born_alive ? parseInt(formData.children_born_alive) : 0,
      miscarriage_history: formData.miscarriage_history ? parseInt(formData.miscarriage_history) : 0
    };

    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");
      pending.push(payload);
      localStorage.setItem("pending_create_mothers", JSON.stringify(pending));

      setIsOfflineSaved(true);
      showLocalNotification("Data Ibu Disimpan Offline", {
        body: `Data profil untuk ${formData.mother_name} disimpan secara lokal di browser Anda.`,
      });
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    const result = await createMother(payload);
    setIsSubmitting(false);

    if (result.success) {
      setIsOfflineSaved(false);
      showLocalNotification("Data Ibu Berhasil Terdaftar", {
        body: `Data profil untuk ${formData.mother_name} telah disimpan ke database.`,
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

      {/* Offline Warning Banner */}
      {!navigator.onLine && (
        <div className="mb-6 bg-status-orange-light border border-status-orange-solid/30 text-status-orange-solid rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <span>📵</span>
          <span>Mode Offline — Data akan disimpan di perangkat dan dikirim ketika online kembali.</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Registrasi Data Ibu (Sesuai Buku KIA)</h1>
        <p className="text-sm text-base-text-secondary">Daftarkan data ibu, suami/keluarga, dan riwayat singkat kesehatan sesuai standar Buku KIA.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ROW 1: IDENTITAS IBU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Identitas Utama Ibu */}
          <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 space-y-4">
            <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-brand-soft text-brand-primary text-xs">Ibu</span> Identitas Utama Ibu
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-base-text-primary mb-1">Nama Lengkap Ibu <span className="text-status-red-solid">*</span></label>
                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleInputChange} required placeholder="Nama lengkap ibu..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">NIK Ibu <span className="text-status-red-solid">*</span></label>
                <input type="text" name="national_id" maxLength={16} value={formData.national_id} onChange={handleInputChange} required placeholder="KTP 16 digit..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">No. JKN / BPJS</label>
                <input type="text" name="jkn_number" value={formData.jkn_number} onChange={handleInputChange} placeholder="Nomor JKN..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
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
                <label className="block text-xs font-bold text-base-text-primary mb-1">Umur (Tahun)</label>
                <input type="number" name="age" min="0" value={formData.age} onChange={handleInputChange} placeholder="Kalkulasi otomatis..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Golongan Darah</label>
                <select name="blood_type" value={formData.blood_type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition cursor-pointer">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="Tidak Tahu">Tidak Tahu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Pendidikan</label>
                <input type="text" name="education" value={formData.education} onChange={handleInputChange} placeholder="Pendidikan terakhir..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Pekerjaan</label>
                <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="Pekerjaan ibu..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Tingkat 1</label>
                <input type="text" name="faskes_1" value={formData.faskes_1} onChange={handleInputChange} placeholder="Faskes I (e.g. Puskesmas)..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Rujukan</label>
                <input type="text" name="faskes_referral" value={formData.faskes_referral} onChange={handleInputChange} placeholder="Rumah Sakit rujukan..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
            </div>
          </div>

          {/* Card 2: Kontak, Alamat & Asuransi Ibu */}
          <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 space-y-4">
            <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-brand-soft text-brand-primary text-xs">Ibu</span> Kontak & Layanan Kesehatan Ibu
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-base-text-primary mb-1">Alamat Rumah Ibu</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} placeholder="Alamat lengkap rumah..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Nomor Telepon / WhatsApp</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="Contoh: 0812..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Pembiayaan Lain</label>
                <input type="text" name="other_financing" value={formData.other_financing} onChange={handleInputChange} placeholder="Pembiayaan (e.g. Mandiri)..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Asuransi Lain</label>
                <input type="text" name="insurance_other" value={formData.insurance_other} onChange={handleInputChange} placeholder="Nama asuransi swasta..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Nomor Asuransi</label>
                <input type="text" name="insurance_number" value={formData.insurance_number} onChange={handleInputChange} placeholder="Nomor polis asuransi..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Tanggal Berlaku Asuransi</label>
                <input type="date" name="insurance_validity" value={formData.insurance_validity} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition text-base-text-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Puskesmas Domisili</label>
                <input type="text" name="puskesmas_domicile" value={formData.puskesmas_domicile} onChange={handleInputChange} placeholder="Puskesmas Domisili..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">No. Reg Kohort Ibu</label>
                <input type="text" name="cohort_register_number" value={formData.cohort_register_number} onChange={handleInputChange} placeholder="Nomor Kohort Ibu..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">No. Catatan Medik RS</label>
                <input type="text" name="medical_record_number" value={formData.medical_record_number} onChange={handleInputChange} placeholder="Nomor rekam medis RS..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: SUAMI/KELUARGA */}
        <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 space-y-4">
          <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 flex items-center gap-2">
            <span className="p-1 rounded bg-status-blue-light text-status-blue-solid text-xs font-bold">Suami/Keluarga</span> Identitas Suami/Keluarga
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Nama Lengkap Suami</label>
              <input type="text" name="husband_name" value={formData.husband_name} onChange={handleInputChange} placeholder="Nama suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">NIK Suami</label>
              <input type="text" name="husband_national_id" maxLength={16} value={formData.husband_national_id} onChange={handleInputChange} placeholder="KTP Suami 16 digit..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">No. JKN / BPJS Suami</label>
              <input type="text" name="husband_jkn_number" value={formData.husband_jkn_number} onChange={handleInputChange} placeholder="BPJS Suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Tempat Lahir Suami</label>
              <input type="text" name="husband_birth_place" value={formData.husband_birth_place} onChange={handleInputChange} placeholder="Tempat lahir..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Tanggal Lahir Suami</label>
              <input type="date" name="husband_birth_date" value={formData.husband_birth_date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition text-base-text-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Pendidikan Suami</label>
              <input type="text" name="husband_education" value={formData.husband_education} onChange={handleInputChange} placeholder="Pendidikan suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Pekerjaan Suami</label>
              <input type="text" name="husband_occupation" value={formData.husband_occupation} onChange={handleInputChange} placeholder="Pekerjaan suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Nomor Telepon Suami</label>
              <input type="tel" name="husband_phone_number" value={formData.husband_phone_number} onChange={handleInputChange} placeholder="No. Telp suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Golongan Darah Suami</label>
              <select name="husband_blood_type" value={formData.husband_blood_type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition">
                <option value="-">- (Pilih)</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="Tidak Tahu">Tidak Tahu</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-base-text-primary mb-1">Alamat Rumah Suami</label>
              <input type="text" name="husband_address" value={formData.husband_address} onChange={handleInputChange} placeholder="Kosongkan jika sama dengan alamat ibu..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Pembiayaan Lain Suami</label>
              <input type="text" name="husband_other_financing" value={formData.husband_other_financing} onChange={handleInputChange} placeholder="Mandiri/Lainnya..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Tingkat I Suami</label>
              <input type="text" name="husband_faskes_1" value={formData.husband_faskes_1} onChange={handleInputChange} placeholder="Faskes I Suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">Faskes Rujukan Suami</label>
              <input type="text" name="husband_faskes_referral" value={formData.husband_faskes_referral} onChange={handleInputChange} placeholder="Faskes Rujukan Suami..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-base-text-primary mb-1">No. Catatan Medik RS Suami</label>
              <input type="text" name="husband_medical_record_number" value={formData.husband_medical_record_number} onChange={handleInputChange} placeholder="No Rekam Medis RS..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
            </div>
          </div>
        </div>

        {/* ROW 3: RIWAYAT KESEHATAN IBU & STATUS POSYANDU */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 3: Riwayat Singkat Kesehatan Ibu */}
          <div className="lg:col-span-2 bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 space-y-4">
            <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-status-purple-light text-status-purple-solid text-xs font-bold">Kesehatan</span> Riwayat Singkat Kesehatan Ibu
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Kehamilan Ke-</label>
                <input type="number" name="pregnancy_number" min="1" value={formData.pregnancy_number} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Jumlah Anak Lahir Hidup</label>
                <input type="number" name="children_born_alive" min="0" value={formData.children_born_alive} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Riwayat Keguguran (Kali)</label>
                <input type="number" name="miscarriage_history" min="0" value={formData.miscarriage_history} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-base-text-primary mb-1">Riwayat Penyakit Ibu</label>
                <textarea name="disease_history" value={formData.disease_history} onChange={handleInputChange} rows={2} placeholder="E.g. Diabetes, Hipertensi, Asma, TBC, dll (boleh kosong)..." className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition resize-none" />
              </div>
            </div>
          </div>

          {/* Card 4: Status Posyandu & Resiko */}
          <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30 space-y-4">
            <h2 className="text-lg font-bold text-base-text-primary border-b pb-2 flex items-center gap-2">
              <span className="p-1 rounded bg-status-orange-light text-status-orange-solid text-xs font-bold">Risiko</span> Status & Risiko Posyandu
            </h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Status Ibu Saat Ini</label>
                <select name="ui_status" value={formData.ui_status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition cursor-pointer">
                  <option value="Calon Ibu">Calon Ibu</option>
                  <option value="Ibu Hamil">Ibu Hamil</option>
                  <option value="Ibu Nifas">Ibu Nifas</option>
                  <option value="Ibu Balita">Ibu Balita</option>
                </select>
              </div>

              {/* HPL Date picker (Only show when status is Ibu Hamil) */}
              {formData.ui_status === "Ibu Hamil" && (
                <div className="animate-in slide-in-from-top duration-200">
                  <label className="block text-xs font-bold text-base-text-primary mb-1">Tanggal Perkiraan Lahir (HPL) <span className="text-status-red-solid">*</span></label>
                  <input type="date" name="estimated_due_date" value={formData.estimated_due_date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition text-base-text-primary" required />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Kondisi Risiko Awal</label>
                <select name="risk_status" value={formData.risk_status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition cursor-pointer">
                  <option value="Normal">Normal</option>
                  <option value="KEK">KEK (Kekurangan Energi Kronis)</option>
                  <option value="Risiko Tinggi">Risiko Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-base-text-primary mb-1">Jumlah Anak Yang Dilahirkan</label>
                <input type="number" name="number_of_children" min="0" value={formData.number_of_children} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-xl bg-base-bg/10 focus:bg-base-white outline-none focus:border-brand-primary transition" />
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
