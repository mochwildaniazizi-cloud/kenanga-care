"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { 
  MdSearch, 
  MdOutlineExpandMore, 
  MdPerson,
  MdOutlineError as ErrorIcon, 
  MdCheckCircleOutline as CheckIcon 
} from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
import { getMothersData, createMaternalRecord } from "@/app/actions/mothers";
import { showLocalNotification } from "@/utils/notifications";
import CustomDatePicker from "@/components/CustomDatePicker";

export interface Mother {
  id: string;
  mother_id: string;
  national_id: string;
  name: string;
  age: string;
  status: string;
  gestationalAge: string;
  hpl: string;
  condition: string;
}

export default function InputPemeriksaanIbuPage() {
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

  // Combobox State
  const [mothersData, setMothersData] = useState<Mother[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMother, setSelectedMother] = useState<Mother | null>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    weight: "",
    blood_pressure: "",
    muac: "",
    fundal_height: "",
    fetal_heart_rate: "",
    iron_pills_given: "0",
    cadre_notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch mothers list on mount
  useEffect(() => {
    async function fetchData() {
      const data = await getMothersData();
      setMothersData(data as Mother[]);
    }
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMothers = mothersData.filter(
    (mother) =>
      mother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mother.national_id && mother.national_id.includes(searchTerm))
  );

  const handleSelectMother = (mother: Mother) => {
    setSelectedMother(mother);
    setSearchTerm(mother.name);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    if (selectedMother && e.target.value !== selectedMother.name) {
      setSelectedMother(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Prevent negative numbers
    if (["weight", "muac", "fundal_height", "fetal_heart_rate", "iron_pills_given"].includes(name)) {
      const valNum = parseFloat(value);
      if (valNum < 0) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Health prediction based on inputs
  const getPredictedCondition = () => {
    if (!formData.muac && !formData.blood_pressure) return null;

    let conditions = [];

    // LILA (MUAC) check: Less than 23.5 cm indicates KEK
    if (formData.muac) {
      const muacValue = parseFloat(formData.muac);
      if (muacValue > 0 && muacValue < 23.5) {
        conditions.push("Risiko KEK (Kurang Energi Kronis)");
      }
    }

    // Blood Pressure check: Systolic >= 140 or Diastolic >= 90 indicates hypertension risk
    if (formData.blood_pressure) {
      const bpParts = formData.blood_pressure.split("/");
      if (bpParts.length === 2) {
        const systolic = parseInt(bpParts[0]);
        const diastolic = parseInt(bpParts[1]);
        if (systolic >= 140 || diastolic >= 90) {
          conditions.push("Risiko Hipertensi (Tinggi)");
        } else if (systolic < 90 || diastolic < 60) {
          conditions.push("Risiko Hipotensi (Rendah)");
        }
      }
    }

    if (conditions.length > 0) {
      return {
        status: "Perlu Perhatian",
        details: conditions.join(", "),
        color: "bg-status-orange-light text-status-orange-solid border-status-orange-solid/20"
      };
    }

    return {
      status: "Normal",
      details: "Kondisi ibu terpantau sehat dan normal.",
      color: "bg-status-green-light text-status-green-solid border-status-green-solid/20"
    };
  };

  const prediction = getPredictedCondition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedMother) {
      setErrorMsg("Mohon pilih ibu hamil/nifas terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    const result = await createMaternalRecord({
      mother_id: selectedMother.mother_id,
      visit_date: formData.visit_date,
      weight: formData.weight || null,
      blood_pressure: formData.blood_pressure || null,
      muac: formData.muac || null,
      fundal_height: formData.fundal_height || null,
      fetal_heart_rate: formData.fetal_heart_rate || null,
      iron_pills_given: formData.iron_pills_given || "0",
      cadre_notes: formData.cadre_notes || null
    });
    setIsSubmitting(false);

    if (result.success) {
      showLocalNotification("Data Pemeriksaan Ibu Disimpan", {
        body: `Pemeriksaan kesehatan untuk ${selectedMother.name} telah berhasil disimpan.`,
      });
      setShowSuccessModal(true);
    } else {
      setErrorMsg(result.error || "Gagal menyimpan hasil pemeriksaan.");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-8 p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Header & Back Button */}
      <div>
        <button 
          onClick={() => setShowCancelModal(true)} 
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-6 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Input Pemeriksaan Ibu</h1>
        <p className="text-sm text-base-text-secondary">Pencatatan klinis bulanan bagi ibu hamil, ibu nifas, dan perkembangan janin.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm animate-shake">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Search and Identity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Search Mother */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-4">Cari Ibu Terdaftar</h2>
              
              <div className="relative" ref={comboboxRef}>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ketik nama ibu atau NIK..." 
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full pl-10 pr-10 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                  <MdSearch className="absolute left-3.5 top-3 text-base-text-secondary w-5 h-5" />
                  <button 
                    type="button" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="absolute right-3 top-3 text-base-text-secondary cursor-pointer"
                  >
                    <MdOutlineExpandMore className="w-5 h-5" />
                  </button>
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-base-white border border-base-border/40 rounded-xl shadow-lg z-50 py-1 text-sm">
                    {filteredMothers.length === 0 ? (
                      <div className="px-4 py-3 text-base-text-secondary text-center">
                        Ibu tidak ditemukan. <Link href="/data-ibu/tambah" className="text-brand-primary font-bold hover:underline">Tambah data baru dulu</Link>
                      </div>
                    ) : (
                      filteredMothers.map((mother) => (
                        <button
                          key={mother.mother_id}
                          type="button"
                          onClick={() => handleSelectMother(mother)}
                          className="w-full px-4 py-2.5 text-left hover:bg-brand-soft hover:text-brand-primary transition flex items-center justify-between cursor-pointer border-b border-base-bg/30 last:border-0"
                        >
                          <div>
                            <p className="font-bold text-base-text-primary">{mother.name}</p>
                            <p className="text-xs text-base-text-secondary mt-0.5">NIK: {mother.national_id || "-"}</p>
                          </div>
                          <span className="text-xs px-2.5 py-0.5 bg-base-bg text-base-text-secondary rounded-full font-medium">{mother.status}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Mother Details Display */}
              {selectedMother && (
                <div className="mt-6 p-4 bg-brand-soft/20 border border-brand-primary/10 rounded-2xl flex items-start gap-4 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center font-bold text-lg border border-brand-primary/25">
                    {selectedMother.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base-text-primary truncate">{selectedMother.name}</h4>
                      <span className="text-xs px-2.5 py-0.5 bg-brand-primary text-base-white rounded-full font-semibold">{selectedMother.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-base-text-secondary">
                      <p>NIK: <span className="font-medium text-base-text-primary">{selectedMother.national_id || "-"}</span></p>
                      <p>Umur: <span className="font-medium text-base-text-primary">{selectedMother.age}</span></p>
                      {selectedMother.status === "Ibu Hamil" && (
                        <>
                          <p>HPL: <span className="font-medium text-brand-primary">{selectedMother.hpl}</span></p>
                          <p>Usia Kandungan: <span className="font-medium text-base-text-primary">{selectedMother.gestationalAge}</span></p>
                        </>
                      )}
                      <p>Risiko Awal: <span className="font-bold text-status-orange-solid">{selectedMother.condition}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card: Form Pemeriksaan Fisik */}
            <div className="bg-base-white rounded-bento-lg p-6 md:p-8 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-6">Pemeriksaan Fisik & Kehamilan</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Tanggal Pemeriksaan */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Tanggal Pemeriksaan</label>
                  <CustomDatePicker 
                    value={formData.visit_date}
                    onChange={(val) => setFormData(prev => ({ ...prev, visit_date: val }))}
                    label="Tanggal Pemeriksaan"
                    outputFormat="iso"
                  />
                </div>

                {/* Berat Badan */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Berat Badan (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    placeholder="Contoh: 54.5"
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                {/* Tensi / Tekanan Darah */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Tekanan Darah (mmHg)</label>
                  <input 
                    type="text" 
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleFormChange}
                    placeholder="Contoh: 120/80"
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                {/* LILA (Lingkar Lengan Atas) */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Lingkar Lengan Atas / LILA (cm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    name="muac"
                    value={formData.muac}
                    onChange={handleFormChange}
                    placeholder="Contoh: 24.5"
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                {/* Tinggi Fundus */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Tinggi Fundus Uteri (cm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    name="fundal_height"
                    value={formData.fundal_height}
                    onChange={handleFormChange}
                    placeholder="Tinggi fundus..."
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                {/* DJJ / Denyut Jantung Janin */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Denyut Jantung Janin / DJJ (dpm)</label>
                  <input 
                    type="number" 
                    name="fetal_heart_rate"
                    min="0"
                    value={formData.fetal_heart_rate}
                    onChange={handleFormChange}
                    placeholder="Contoh: 140"
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>

                {/* Tablet Tambah Darah (TTD) */}
                <div>
                  <label className="block text-xs font-bold text-base-text-primary mb-2">Tablet Tambah Darah / TTD Diberikan (Butir)</label>
                  <input 
                    type="number" 
                    name="iron_pills_given"
                    min="0"
                    value={formData.iron_pills_given}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Health predictions & notes */}
          <div className="space-y-6">
            
            {/* Card: Prediksi Status & Gizi */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-4">Hasil Diagnosis Mandiri</h2>
              
              {prediction ? (
                <div className={`p-4 border rounded-2xl space-y-2.5 transition duration-300 ${prediction.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold uppercase tracking-wide">Prediksi: {prediction.status}</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{prediction.details}</p>
                </div>
              ) : (
                <div className="p-4 border border-base-border/30 rounded-2xl text-center text-xs text-base-text-secondary bg-base-bg/10">
                  Masukkan data LILA atau Tensi Darah untuk melihat diagnosis hasil pemeriksaan.
                </div>
              )}
            </div>

            {/* Card: Notes */}
            <div className="bg-base-white rounded-bento-lg p-6 shadow-sm border border-base-border/30">
              <h2 className="text-lg font-bold text-base-text-primary mb-4">Catatan Tambahan</h2>
              <textarea 
                name="cadre_notes"
                rows={4}
                value={formData.cadre_notes}
                onChange={handleFormChange}
                placeholder="Catatan kader (misal: keluhan pusing, pemberian suplemen tambahan)..."
                className="w-full px-4 py-3 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white resize-none"
              />
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
            {isSubmitting ? "Menyimpan..." : "Simpan Pemeriksaan"}
          </button>
        </div>
      </form>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ErrorIcon className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Batalkan Pengisian?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin membatalkan? Semua data pemeriksaan yang sudah diketik akan hilang.
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
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Berhasil Disimpan</h3>
              <p className="text-sm text-base-text-secondary">
                Data riwayat pemeriksaan kesehatan ibu berhasil disimpan ke database.
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
