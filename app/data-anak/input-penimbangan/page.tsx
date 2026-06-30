"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { 
  MdSearch, MdOutlineExpandMore, MdMale, MdFemale,
  MdArrowBack, MdOutlineError, MdCheckCircleOutline
} from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";

import { getChildrenData, createChildMeasurement } from "@/app/actions/children";
import CustomDatePicker from "@/components/CustomDatePicker";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

// Type matching getChildrenData return
export interface Child {
  id: string;
  child_id?: string;
  national_id: string;
  name: string;
  age: string;
  gender: string;
  birth_place: string;
  dob: string;
  mother: string;
  status: string;
  dobRaw?: string | null;
}

export default function InputPenimbanganPage() {
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
  
  // Combobox State
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Fetch children on mount
  useEffect(() => {
    async function fetchData() {
      const data = await getChildrenData();
      setChildrenData(data as Child[]);
    }
    fetchData();
  }, []);
  
  // Vitamin A Dropdown State
  const [isVitaminOpen, setIsVitaminOpen] = useState(false);
  const vitaminRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    visit_date: "",
    head_circumference: "",
    height: "",
    weight: "",
    vitamin_a: "Tidak Diberikan",
    deworming: false,
    pmt: false,
    immunization: "",
    notes: ""
  });
  
  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Custom Modals State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{show: boolean, type: 'error' | 'success', title: string, message: string, onConfirm?: () => void} | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (vitaminRef.current && !vitaminRef.current.contains(event.target as Node)) {
        setIsVitaminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredChildren = childrenData.filter(
    (child) =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.national_id.includes(searchTerm)
  );

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setSearchTerm(child.name);
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    if (selectedChild && e.target.value !== selectedChild.name) {
      setSelectedChild(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getAgeInMonthsAtVisit = (dobStr: string, visitStr: string) => {
    if (!dobStr || !visitStr) return 0;
    const birthDate = new Date(dobStr);
    const visitDate = new Date(visitStr);
    const yearsDifference = visitDate.getFullYear() - birthDate.getFullYear();
    const monthsDifference = visitDate.getMonth() - birthDate.getMonth();
    return Math.max(0, yearsDifference * 12 + monthsDifference);
  };

  const getPredictedStatus = () => {
    if (!selectedChild || !formData.weight || !formData.height) return null;
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) return null;
    
    const visitDateStr = formData.visit_date || new Date().toISOString().split('T')[0];
    const dobStr = selectedChild.dobRaw || new Date().toISOString().split('T')[0];
    const ageInMonths = getAgeInMonthsAtVisit(dobStr, visitDateStr);
    const gender = selectedChild.gender === 'M' || selectedChild.gender === 'Laki Laki' || selectedChild.gender === 'L' ? 'M' : 'F';
    
    const zScoreBB = calculateZScore(w, ageInMonths, gender, "BB");
    const zScoreTB = calculateZScore(h, ageInMonths, gender, "TB");
    return getNutritionalStatus(zScoreBB, zScoreTB);
  };

  const predictedStatus = getPredictedStatus();

  const handleSaveClick = () => {
    if (!selectedChild) {
      setAlertModal({
        show: true,
        type: 'error',
        title: 'Data Belum Lengkap',
        message: 'Silakan cari dan pilih data anak terlebih dahulu!'
      });
      return;
    }
    if (!formData.visit_date || !formData.weight || !formData.height) {
      setAlertModal({
        show: true,
        type: 'error',
        title: 'Formulir Belum Lengkap',
        message: 'Harap lengkapi tanggal kunjungan, berat badan, dan tinggi badan anak.'
      });
      return;
    }
    setShowSaveModal(true);
  };
  
  const handleConfirmSave = async () => {
    if (!selectedChild) return;
    setShowSaveModal(false);
    
    try {
      const res = await createChildMeasurement({
        child_id: selectedChild.child_id,
        ...formData
      });
      
      if (res.success) {
        setAlertModal({
          show: true,
          type: 'success',
          title: 'Berhasil Disimpan!',
          message: 'Data penimbangan anak telah berhasil ditambahkan ke dalam sistem.',
          onConfirm: () => router.push("/data-anak")
        });
      } else {
        setAlertModal({
          show: true,
          type: 'error',
          title: 'Gagal Menyimpan',
          message: res.error || 'Terjadi kesalahan saat menyimpan data.'
        });
      }
    } catch (err) {
      console.error("Error saving child measurement:", err);
      setAlertModal({
        show: true,
        type: 'error',
        title: 'Error',
        message: 'Terjadi kesalahan sistem saat menyimpan data.'
      });
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-8">
      {/* Header & Back Button */}
      <div className="mb-6">
        <Link href="/data-anak" className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition">
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* LEFT COLUMN: Ringkasan Profil Anak */}
        <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30 h-full flex flex-col">
          <h2 className="text-xl font-bold text-base-text-primary mb-6">Ringkasan Profil Anak</h2>
          
          {/* Combobox */}
          <div className="relative mb-8" ref={comboboxRef}>
            <div className="relative flex items-center">
              <MdSearch className="absolute left-4 text-base-text-secondary w-5 h-5 z-10 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onClick={() => setIsDropdownOpen(true)}
                placeholder="Cari data anak..."
                className="w-full pl-12 pr-12 py-3 bg-base-white border border-base-border/50 rounded-full focus:outline-none focus:border-brand-primary transition-colors text-base-text-primary shadow-sm"
              />
              <MdOutlineExpandMore 
                className={`absolute right-4 text-base-text-secondary w-5 h-5 z-10 pointer-events-none transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-base-white border border-base-border/30 rounded-xl shadow-md max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {filteredChildren.length > 0 ? (
                  <ul className="py-2">
                    {filteredChildren.map((child) => (
                      <li key={child.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectChild(child)}
                          className="w-full text-left px-4 py-3 hover:bg-base-bg/60 transition-colors flex items-center gap-3 border-b border-base-border/10 last:border-b-0"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${child.gender === 'M' || child.gender === 'Laki Laki' || child.gender === 'L' ? 'bg-status-blue-light/50 text-status-blue-solid' : 'bg-status-pink-light/50 text-brand-primary'}`}>
                            {child.gender === 'M' || child.gender === 'Laki Laki' || child.gender === 'L' ? <MdMale className="w-6 h-6" /> : <MdFemale className="w-6 h-6" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-base-text-primary">{child.name}</span>
                            <span className="text-xs text-base-text-secondary mt-0.5">NIK: {child.national_id}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-base-text-secondary">
                    Data anak tidak ditemukan.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profil Anak Content */}
          {selectedChild ? (
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${selectedChild.gender === 'M' || selectedChild.gender === 'Laki Laki' || selectedChild.gender === 'L' ? 'bg-status-blue-light/30 text-status-blue-solid' : 'bg-status-pink-light/30 text-brand-primary'}`}>
                  {selectedChild.gender === 'M' || selectedChild.gender === 'Laki Laki' || selectedChild.gender === 'L' ? <MdMale className="w-10 h-10" /> : <MdFemale className="w-10 h-10" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-base-text-primary">{selectedChild.name}</h3>
                  <p className="text-sm text-base-text-secondary font-medium">NIK: {selectedChild.national_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-bold text-base-text-primary mb-1">Tempat, Tanggal Lahir</p>
                  <p className="text-sm text-base-text-secondary font-medium">{selectedChild.birth_place}, {selectedChild.dob}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-base-text-primary mb-1">Usia</p>
                  <p className="text-sm text-base-text-secondary font-medium">{selectedChild.age}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-base-text-primary mb-1">Nama Ibu</p>
                  <p className="text-sm text-brand-primary font-bold">{selectedChild.mother}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-base-text-primary mb-1">Status Gizi</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedChild.status === 'Normal' 
                      ? 'bg-status-green-light border border-status-green-solid/30 text-status-green-solid' 
                      : 'bg-status-orange-solid/10 border border-status-orange-solid/30 text-status-orange-solid'
                  }`}>
                    {selectedChild.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-base-text-primary mb-1">Jenis Kelamin</p>
                  <div className="flex items-center gap-1.5 text-sm text-base-text-secondary font-medium">
                    {selectedChild.gender === 'M' || selectedChild.gender === 'Laki Laki' || selectedChild.gender === 'L' ? (
                      <MdMale className="w-4 h-4 text-status-blue-solid" />
                    ) : (
                      <MdFemale className="w-4 h-4 text-brand-primary" />
                    )}
                    {selectedChild.gender === 'M' || selectedChild.gender === 'L' ? 'Laki-Laki' : selectedChild.gender === 'F' || selectedChild.gender === 'P' ? 'Perempuan' : selectedChild.gender}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-base-border/50 rounded-xl bg-base-bg/30">
              <p className="text-base-text-secondary font-medium">Silakan cari dan pilih data anak terlebih dahulu</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Data Kelahiran / Pengukuran */}
        <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30 h-full flex flex-col">
          <h2 className="text-xl font-bold text-base-text-primary mb-6">Data Pengukuran</h2>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-base-text-primary mb-2">Tanggal Kunjungan</label>
              <CustomDatePicker 
                value={formData.visit_date}
                onChange={(val) => setFormData(prev => ({ ...prev, visit_date: val }))}
                label="Tanggal Kunjungan"
                outputFormat="iso"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-base-text-primary mb-2">Lingkar Kepala (cm)</label>
              <div className="relative flex items-center overflow-hidden rounded-lg border border-base-border/50 focus-within:border-brand-primary transition">
                <input 
                  type="number" 
                  min="0"
                  name="head_circumference"
                  value={formData.head_circumference}
                  onChange={handleFormChange}
                  placeholder="masukkan lingkar kepala..." 
                  className="w-full px-4 py-3 focus:outline-none bg-transparent z-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-base-text-primary mb-2">Tinggi/ Panjang Badan (cm)</label>
              <div className="relative flex items-center overflow-hidden rounded-lg border border-base-border/50 focus-within:border-brand-primary transition">
                <input 
                  type="number" 
                  min="0"
                  name="height"
                  value={formData.height}
                  onChange={handleFormChange}
                  placeholder="masukkan tb/pb anak..." 
                  className="w-full px-4 py-3 focus:outline-none bg-transparent z-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-base-text-primary mb-2">Berat Badan (kg)</label>
              <div className="relative flex items-center overflow-hidden rounded-lg border border-base-border/50 focus-within:border-brand-primary transition">
                <input 
                  type="number" 
                  min="0"
                  name="weight"
                  value={formData.weight}
                  onChange={handleFormChange}
                  placeholder="masukkan berat badan..." 
                  className="w-full px-4 py-3 focus:outline-none bg-transparent z-10"
                />
              </div>
            </div>
          </div>

          {/* Prediksi Status Gizi */}
          <div className="mt-auto bg-brand-soft/20 rounded-xl p-6">
            <h3 className="text-sm font-bold text-base-text-primary mb-4">Prediksi Status Gizi</h3>
            <div className="flex flex-wrap gap-3">
              {['Normal', 'Gizi Kurang', 'Gizi Buruk', 'Pendek / Stunting'].map(status => {
                const isActive = status === predictedStatus;
                let activeClasses = "";
                if (isActive) {
                  if (status === 'Normal') activeClasses = "bg-status-green-light border-status-green-solid/50 text-status-green-solid shadow-md scale-105";
                  else if (status === 'Gizi Kurang') activeClasses = "bg-status-orange-solid/10 border-status-orange-solid/50 text-status-orange-solid shadow-md scale-105";
                  else activeClasses = "bg-status-red-light border-status-red-solid/50 text-status-red-solid shadow-md scale-105";
                } else {
                  activeClasses = "bg-base-white border-base-border/40 text-base-text-secondary opacity-60";
                }

                return (
                  <div key={status} className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${activeClasses}`}>
                    {status}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM CARD: Suplemen dan Catatan Kader */}
      <div className="bg-base-white rounded-bento-lg p-8 shadow-sm border border-base-border/30 mb-8">
        <h2 className="text-xl font-bold text-base-text-primary mb-6">Suplemen dan Catatan Kader</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-base-text-primary">Vitamin A</label>
              <div className="relative w-48" ref={vitaminRef}>
                <button 
                  type="button"
                  onClick={() => setIsVitaminOpen(!isVitaminOpen)}
                  className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none text-sm font-bold cursor-pointer transition-colors flex items-center justify-between ${
                    formData.vitamin_a === "Tidak Diberikan" 
                      ? "border-base-border/50 text-base-text-secondary bg-base-white"
                      : formData.vitamin_a === "Kapsul Biru"
                      ? "border-blue-500 text-blue-500 bg-blue-50"
                      : "border-status-red-solid text-status-red-solid bg-status-red-light"
                  }`}
                >
                  {formData.vitamin_a}
                  <MdOutlineExpandMore className={`w-5 h-5 font-bold transition-transform duration-200 ${isVitaminOpen ? 'rotate-180' : ''}`} />
                </button>

                {isVitaminOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-base-white border border-base-border/30 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <ul className="py-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, vitamin_a: "Tidak Diberikan" })); setIsVitaminOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-base-text-secondary hover:bg-base-bg/60 transition-colors"
                        >
                          Tidak Diberikan
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, vitamin_a: "Kapsul Biru" })); setIsVitaminOpen(false); }}
                          className="w-full flex flex-col items-start px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-t border-base-border/10"
                        >
                          <span className="font-bold text-blue-500">Kapsul Biru</span>
                          <span className="text-xs font-medium text-base-text-secondary mt-0.5">Untuk Usia 6-11 Bulan</span>
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, vitamin_a: "Kapsul Merah" })); setIsVitaminOpen(false); }}
                          className="w-full flex flex-col items-start px-4 py-3 text-sm hover:bg-status-red-light transition-colors border-t border-base-border/10"
                        >
                          <span className="font-bold text-status-red-solid">Kapsul Merah</span>
                          <span className="text-xs font-medium text-base-text-secondary mt-0.5">Untuk Usia 1-5 Tahun</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-base-text-primary">Obat Cacing</label>
              <label className="relative flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="deworming"
                  checked={formData.deworming}
                  onChange={handleFormChange}
                  className="sr-only peer"
                />
                <div className="w-6 h-6 rounded-full border-2 border-base-border/50 peer-checked:bg-brand-primary peer-checked:border-brand-primary text-transparent peer-checked:text-white transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-base-text-primary">Pemberian Makanan Tambahan (PMT)</label>
              <label className="relative flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="pmt"
                  checked={formData.pmt}
                  onChange={handleFormChange}
                  className="sr-only peer"
                />
                <div className="w-6 h-6 rounded-full border-2 border-base-border/50 peer-checked:bg-brand-primary peer-checked:border-brand-primary text-transparent peer-checked:text-white transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-base-text-primary mb-2">Imunisasi yang Diberikan Hari Ini</label>
              <input 
                type="text" 
                name="immunization"
                value={formData.immunization}
                onChange={handleFormChange}
                placeholder="masukkan nama imunisasi..." 
                className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition text-base-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-base-text-primary mb-2">Catatan Kader</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="masukkan catatan tambahan..." 
              rows={6}
              className="w-full px-4 py-3 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary transition text-base-text-primary resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ACTION BUTTONS --- */}
      <div className="flex justify-end gap-4">
        <button 
          type="button"
          onClick={() => setShowCancelModal(true)}
          className="px-8 py-3 rounded-full border border-base-border/50 text-base-text-primary font-bold text-[15px] hover:bg-base-bg/50 transition"
        >
          batal
        </button>
        <button 
          type="button" 
          onClick={handleSaveClick}
          className="px-8 py-3 rounded-full bg-brand-primary text-base-white font-bold text-[15px] hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20"
        >
          Simpan Data Anak
        </button>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-base-white rounded-bento-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-base-border/30">
              <h2 className="text-xl font-bold text-base-text-primary">Konfirmasi Data Penimbangan</h2>
              <p className="text-sm text-base-text-secondary mt-1">Pastikan data yang dimasukkan sudah benar sebelum menyimpan.</p>
            </div>
            
            <div className="p-6 overflow-y-auto bg-base-bg/30">
              <div className="space-y-6">
                {/* Profil */}
                <div className="bg-base-white p-4 rounded-xl border border-base-border/50">
                  <h3 className="text-sm font-bold text-base-text-secondary uppercase mb-3 border-b border-base-border/20 pb-2">Data Anak</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Nama Anak</p>
                      <p className="font-bold text-base-text-primary">{selectedChild?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">NIK</p>
                      <p className="font-bold text-base-text-primary">{selectedChild?.national_id}</p>
                    </div>
                  </div>
                </div>

                {/* Pengukuran */}
                <div className="bg-base-white p-4 rounded-xl border border-base-border/50">
                  <h3 className="text-sm font-bold text-base-text-secondary uppercase mb-3 border-b border-base-border/20 pb-2">Hasil Pengukuran</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Tgl Kunjungan</p>
                      <p className="font-bold text-base-text-primary">{formData.visit_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Berat Badan</p>
                      <p className="font-bold text-brand-primary">{formData.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Tinggi Badan</p>
                      <p className="font-bold text-brand-primary">{formData.height} cm</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Lingkar Kepala</p>
                      <p className="font-bold text-base-text-primary">{formData.head_circumference || '-'} cm</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-base-text-secondary mb-1">Prediksi Status Gizi</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      predictedStatus === 'Normal' 
                        ? 'bg-status-green-light text-status-green-solid' 
                        : predictedStatus === 'Gizi Kurang' 
                        ? 'bg-status-orange-solid/10 text-status-orange-solid'
                        : predictedStatus === 'Gizi Buruk' || predictedStatus === 'Pendek / Stunting'
                        ? 'bg-status-red-light text-status-red-solid'
                        : 'bg-base-bg text-base-text-secondary'
                    }`}>
                      {predictedStatus || 'Belum tersedia'}
                    </span>
                  </div>
                </div>

                {/* Suplemen */}
                <div className="bg-base-white p-4 rounded-xl border border-base-border/50">
                  <h3 className="text-sm font-bold text-base-text-secondary uppercase mb-3 border-b border-base-border/20 pb-2">Suplemen & Catatan</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Vitamin A</p>
                      <p className="font-bold text-base-text-primary">{formData.vitamin_a}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Obat Cacing</p>
                      <p className="font-bold text-base-text-primary">{formData.deworming ? "Diberikan" : "Tidak Diberikan"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">PMT</p>
                      <p className="font-bold text-base-text-primary">{formData.pmt ? "Diberikan" : "Tidak Diberikan"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-base-text-secondary mb-1">Imunisasi</p>
                      <p className="font-bold text-base-text-primary">{formData.immunization || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-base-text-secondary mb-1">Catatan Kader</p>
                    <p className="font-medium text-sm text-base-text-primary whitespace-pre-wrap">{formData.notes || "Tidak ada catatan."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-base-border/30 bg-base-white flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-6 py-2.5 rounded-full border border-base-border/50 text-base-text-primary font-bold text-sm hover:bg-base-bg/50 transition"
              >
                Kembali Edit
              </button>
              <button 
                type="button" 
                onClick={handleConfirmSave}
                className="px-6 py-2.5 rounded-full bg-brand-primary text-base-white font-bold text-sm hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20"
              >
                Oke, Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <MdOutlineError className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Batalkan Pengisian?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin membatalkan? Semua data yang sudah diketik akan hilang.
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

      {/* Alert Modal (Error / Success) */}
      {alertModal?.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${alertModal.type === 'success' ? 'bg-status-green-light/50 text-status-green-solid' : 'bg-status-red-light/50 text-status-red-solid'}`}>
                {alertModal.type === 'success' ? (
                  <MdCheckCircleOutline className="w-8 h-8" />
                ) : (
                  <MdOutlineError className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">{alertModal.title}</h3>
              <p className="text-sm text-base-text-secondary">
                {alertModal.message}
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => {
                  if (alertModal.onConfirm) {
                    alertModal.onConfirm();
                  } else {
                    setAlertModal(null);
                  }
                }}
                className={`w-full max-w-[200px] py-2.5 rounded-xl text-base-white font-bold transition shadow-sm ${alertModal.type === 'success' ? 'bg-status-green-solid hover:bg-status-green-solid/90' : 'bg-brand-primary hover:bg-brand-primary/90'}`}
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
