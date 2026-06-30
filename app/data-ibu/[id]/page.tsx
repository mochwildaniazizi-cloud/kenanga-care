"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { getMotherDetail, updateMother } from "@/app/actions/mothers";
import { 
  MdArrowBack, MdPerson, MdCalendarToday, MdPhone, 
  MdPregnantWoman, MdBloodtype, MdOutlineError, MdFemale, MdMale,
  MdEdit, MdSave, MdClose, MdCheckCircleOutline, MdCameraAlt
} from "react-icons/md";
import { FaUserFriends, FaHeartbeat } from "react-icons/fa";
import CustomDatePicker from "@/components/CustomDatePicker";

export default function MotherDetailPage() {
  const { id } = useParams();
  const { role } = useUserRole();
  const [mother, setMother] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar terlalu besar. Maksimal 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setCropZoom(1);
        setCropOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - cropOffset.x, y: touch.clientY - cropOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCropOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleCropSave = () => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.src = cropImageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);
      ctx.translate(size / 2, size / 2);

      const scaleFactor = size / 192;
      ctx.translate(cropOffset.x * scaleFactor, cropOffset.y * scaleFactor);
      ctx.scale(cropZoom, cropZoom);

      const aspect = img.height / img.width;
      const drawWidth = size;
      const drawHeight = size * aspect;

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.85);
      setEditForm((prev: any) => ({ ...prev, avatarUrl: croppedBase64 }));
      setCropImageSrc(null);
    };
  };
  const [editForm, setEditForm] = useState<any>({
    national_id: "",
    mother_name: "",
    birth_date: "",
    husband_name: "",
    phone_number: "",
    blood_type: "",
    estimated_due_date: "",
    risk_status: "Normal",
    ui_status: "Ibu Hamil",
    number_of_children: 0
  });

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      try {
        const data = await getMotherDetail(id as string);
        setMother(data);
      } catch (err) {
        console.error("Failed to load mother detail", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleStartEdit = () => {
    setEditForm({
      national_id: mother.national_id,
      mother_name: mother.name,
      birth_date: mother.dobRaw || "",
      husband_name: mother.husband_name === "-" ? "" : mother.husband_name,
      phone_number: mother.phone_number === "-" ? "" : mother.phone_number,
      blood_type: mother.blood_type === "-" ? "" : mother.blood_type,
      estimated_due_date: mother.estimated_due_date && mother.estimated_due_date !== "-" ? mother.estimated_due_date : "",
      risk_status: mother.condition || "Normal",
      ui_status: mother.status || "Ibu Hamil",
      number_of_children: mother.number_of_children || 0,
      avatarUrl: mother.avatarUrl || ""
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.mother_name || !editForm.national_id) {
      alert("Nama Ibu dan NIK wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateMother(id as string, editForm);
      if (res.success) {
        const data = await getMotherDetail(id as string);
        setMother(data);
        setIsEditing(false);
        setShowSuccessModal(true);
      } else {
        alert(res.error || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error("Error updating mother details:", err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAgeInYears = (dobStr: string) => {
    if (!dobStr) return 0;
    const birthDate = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }
    return Math.max(0, years);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-base-text-secondary">Memuat rekam medis ibu...</p>
      </div>
    );
  }

  if (!mother) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-status-orange-light text-status-orange-solid rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MdOutlineError className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-base-text-primary">Data Ibu Tidak Ditemukan</h2>
        <p className="text-base-text-secondary">Rekam medis ibu yang Anda cari tidak terdaftar atau telah dihapus.</p>
        <Link 
          href="/data-ibu"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-sm hover:bg-brand-primary/95 transition shadow-md cursor-pointer"
        >
          <MdArrowBack className="w-4 h-4" /> Kembali ke Daftar Ibu
        </Link>
      </div>
    );
  }

  const getConditionColor = (cond: string) => {
    if (cond === "Normal") return "bg-status-green-light text-status-green-solid border-status-green-solid/25";
    if (cond.includes("KEK") || cond.includes("Risiko")) return "bg-status-orange-light text-status-orange-solid border-status-orange-solid/25";
    return "bg-brand-soft text-brand-primary border-brand-primary/25";
  };

  const displayName = isEditing ? editForm.mother_name : mother.name;
  const displayNik = isEditing ? editForm.national_id : mother.national_id;
  const displayStatus = isEditing ? editForm.ui_status : mother.status;
  const displayCondition = isEditing ? editForm.risk_status : mother.condition;
  const displayAge = isEditing ? getAgeInYears(editForm.birth_date) : parseInt(mother.age);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-300">
      
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/20 pb-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/data-ibu"
            className="p-2.5 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary bg-base-white rounded-xl hover:bg-brand-soft/20 transition cursor-pointer shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          
          {/* Avatar Profile Picture */}
          {isEditing ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-16 h-16 rounded-full overflow-hidden border border-brand-primary shadow-sm shrink-0 flex items-center justify-center cursor-pointer group bg-status-yellow-light text-status-yellow-solid"
              title="Klik untuk ubah foto profil"
            >
              {editForm.avatarUrl ? (
                <img src={editForm.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <MdPerson className="w-9 h-9" />
              )}
              <div className="absolute inset-0 bg-base-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <MdCameraAlt className="w-6 h-6 text-base-white" />
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full overflow-hidden border border-base-border/30 shadow-sm shrink-0 bg-status-yellow-light text-status-yellow-solid flex items-center justify-center">
              {mother.avatarUrl ? (
                <img src={mother.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <MdPerson className="w-9 h-9" />
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <input 
                  type="text" 
                  name="mother_name"
                  value={editForm.mother_name}
                  onChange={handleInputChange}
                  className="px-3 py-1 border border-brand-primary rounded-lg font-bold text-xl text-base-text-primary focus:outline-none w-64 bg-base-white"
                  placeholder="Nama Lengkap Ibu"
                  required
                />
              ) : (
                <h1 className="text-2xl font-bold text-base-text-primary">{displayName}</h1>
              )}
              
              {!isEditing && (
                <span className="px-3 py-1 bg-status-yellow-light text-status-yellow-solid border border-status-yellow-solid/25 text-xs font-semibold rounded-full">
                  {displayStatus}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1.5 text-xs text-base-text-secondary">
              <span>NIK:</span>
              {isEditing ? (
                <input 
                  type="text" 
                  name="national_id"
                  value={editForm.national_id}
                  onChange={handleInputChange}
                  className="px-2 py-0.5 border border-base-border/50 rounded text-xs focus:outline-none w-36 bg-base-white"
                  placeholder="NIK Ibu"
                  required
                />
              ) : (
                <span className="font-semibold text-base-text-primary">{displayNik}</span>
              )}
              <span>&bull;</span>
              <span>ID Ibu: {mother.mother_id}</span>
            </div>
          </div>
        </div>
        
        {/* Actions Button */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-base-border/50 hover:bg-base-bg text-base-text-secondary rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                disabled={isSubmitting}
              >
                <MdClose className="w-4 h-4" /> Batal
              </button>
              <button 
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-brand-primary text-base-white hover:bg-brand-primary/95 rounded-xl text-xs font-bold shadow-md shadow-brand-primary/10 transition cursor-pointer flex items-center gap-1"
                disabled={isSubmitting}
              >
                <MdSave className="w-4 h-4" /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          ) : (
            role !== "ibu" && (
              <button 
                type="button"
                onClick={handleStartEdit}
                className="px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <MdEdit className="w-4 h-4" /> Edit Data Ibu
              </button>
            )
          )}
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Identitas & Kehamilan (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Identitas Ibu */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
              <MdPerson className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-base-text-primary text-base">Identitas Ibu</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Tanggal Lahir</span>
                {isEditing ? (
                  <div className="relative overflow-visible z-50">
                    <CustomDatePicker 
                      value={editForm.birth_date}
                      onChange={(val) => setEditForm((prev: any) => ({ ...prev, birth_date: val }))}
                      label="Select birth date"
                      outputFormat="iso"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.dob}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Usia Saat Ini</span>
                <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{displayAge ? `${displayAge} Tahun` : "-"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Nama Suami</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="husband_name"
                    value={editForm.husband_name}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs"
                    placeholder="Nama Suami"
                  />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.husband_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">No. Telepon / WA</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="phone_number"
                    value={editForm.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs"
                    placeholder="No. Telepon"
                  />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    <MdPhone className="w-3.5 h-3.5 text-base-text-secondary" /> {mother.phone_number}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Golongan Darah</span>
                {isEditing ? (
                  <select 
                    name="blood_type"
                    value={editForm.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer"
                  >
                    <option value="">Pilih Golongan Darah</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    <MdBloodtype className="w-4 h-4 text-status-red-solid" /> {mother.blood_type}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Jumlah Anak</span>
                {isEditing ? (
                  <input 
                    type="number" 
                    name="number_of_children"
                    value={editForm.number_of_children}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs"
                    min="0"
                  />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.number_of_children} anak</p>
                )}
              </div>
            </div>
          </div>

          {/* Card: Status Kehamilan / Nifas */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
              <MdPregnantWoman className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-base-text-primary text-base">Status Kehamilan & Persalinan</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Status Ibu</span>
                {isEditing ? (
                  <select 
                    name="ui_status"
                    value={editForm.ui_status}
                    onChange={handleInputChange}
                    className="mt-1 px-1.5 py-1 border border-base-border/50 rounded text-xs bg-base-white cursor-pointer w-full text-center"
                  >
                    <option value="Calon Ibu">Calon Ibu</option>
                    <option value="Ibu Hamil">Ibu Hamil</option>
                    <option value="Ibu Nifas">Ibu Nifas</option>
                    <option value="Ibu Balita">Ibu Balita</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-base-text-primary mt-1">{mother.status}</p>
                )}
              </div>

              <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Kondisi Risiko</span>
                {isEditing ? (
                  <select 
                    name="risk_status"
                    value={editForm.risk_status}
                    onChange={handleInputChange}
                    className="mt-1 px-1.5 py-1 border border-base-border/50 rounded text-xs bg-base-white cursor-pointer w-full text-center"
                  >
                    <option value="Normal">Normal</option>
                    <option value="KEK">KEK</option>
                    <option value="Risiko Tinggi">Risiko Tinggi</option>
                  </select>
                ) : (
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${getConditionColor(displayCondition)}`}>
                    {displayCondition}
                  </span>
                )}
              </div>

              <div className="bg-base-bg/30 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase block">HPL / Bersalin</span>
                {isEditing ? (
                  editForm.ui_status === "Ibu Hamil" ? (
                    <input 
                      type="date" 
                      name="estimated_due_date"
                      value={editForm.estimated_due_date}
                      onChange={handleInputChange}
                      className="mt-1 px-1.5 py-1 border border-base-border/50 rounded text-xs bg-base-white cursor-pointer w-full text-center"
                    />
                  ) : (
                    <p className="text-xs text-base-text-secondary mt-2">Hanya Ibu Hamil</p>
                  )
                ) : (
                  <p className="text-sm font-bold text-base-text-primary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{mother.hpl}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Daftar Anak Kandung (Col span 6) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Card: Daftar Anak Kandung Terhubung */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <FaUserFriends className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-bold text-base-text-primary text-base">Anak Terdaftar dari Ibu Ini</h2>
                </div>
                <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                  {mother.children.length} Balita
                </span>
              </div>

              {mother.children.length === 0 ? (
                <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center text-sm text-base-text-secondary">
                  Belum ada data anak terdaftar yang terhubung dengan NIK Ibu ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mother.children.map((child: any, idx: number) => (
                    <div key={idx} className="border border-base-border/30 rounded-xl p-4 bg-base-bg/5 hover:border-brand-primary/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-base-text-primary leading-tight">{child.name}</p>
                          {child.gender === "M" ? (
                            <MdMale className="w-4 h-4 text-status-blue-solid" />
                          ) : (
                            <MdFemale className="w-4 h-4 text-brand-primary" />
                          )}
                        </div>
                        <p className="text-xs text-base-text-secondary mt-1">{child.age} &bull; {child.dob}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-base-border/10 flex justify-end">
                        <Link 
                          href={`/data-anak/${child.child_id}`}
                          className="text-xs font-bold text-brand-primary hover:underline transition cursor-pointer"
                        >
                          Lihat Detail Balita &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-xs text-base-text-secondary mt-4 leading-relaxed">
              * Relasi data di atas berdasarkan pencocokan nomor induk data keluarga yang tersimpan di rekam medis posyandu.
            </div>
          </div>

        </div>

      </div>

      {/* Maternal Examination History Table */}
      <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
          <div className="flex items-center gap-2">
            <FaHeartbeat className="w-5 h-5 text-status-red-solid" />
            <h2 className="font-bold text-base-text-primary text-base">Riwayat Kunjungan & Pemeriksaan Ibu</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal Periksa</th>
                <th className="py-3 px-4 text-center">BB Ibu (kg)</th>
                <th className="py-3 px-4 text-center">Tekanan Darah</th>
                <th className="py-3 px-4 text-center">Lila (cm)</th>
                <th className="py-3 px-4 text-center">Fundus (cm)</th>
                <th className="py-3 px-4 text-center">Detak Jantung Janin (DJJ)</th>
                <th className="py-3 px-4 text-center">Tablet Fe (Butir)</th>
                <th className="py-3 px-4">Catatan Kader Posyandu</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mother.maternal_records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-base-text-secondary text-xs">Belum ada riwayat pemeriksaan kehamilan/kesehatan.</td>
                </tr>
              ) : (
                mother.maternal_records.map((r: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{r.date}</td>
                    <td className="py-3 px-4 text-center font-bold text-brand-primary">{r.weight > 0 ? `${r.weight} kg` : "-"}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{r.blood_pressure}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{r.muac > 0 ? `${r.muac} cm` : "-"}</td>
                    <td className="py-3 px-4 text-center font-medium text-base-text-secondary">{r.fundal_height > 0 ? `${r.fundal_height} cm` : "-"}</td>
                    <td className="py-3 px-4 text-center font-medium text-base-text-secondary">{r.fetal_heart_rate > 0 ? `${r.fetal_heart_rate} x/mnt` : "-"}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-secondary">{r.iron_pills_given > 0 ? `${r.iron_pills_given} butir` : "-"}</td>
                    <td className="py-3 px-4 text-base-text-secondary font-medium italic">{r.cadre_notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Modal Pop-up */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-sm overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Berhasil Diperbarui</h3>
              <p className="text-sm text-base-text-secondary">
                Data rekam medis ibu berhasil diperbarui ke database.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => setShowSuccessModal(false)}
                className="w-full max-w-[200px] py-2.5 rounded-xl bg-status-green-solid text-base-white font-bold hover:bg-status-green-solid/90 transition shadow-sm cursor-pointer text-xs"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Crop Image Modal */}
      {cropImageSrc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl max-w-sm w-full p-6 border border-base-border/30 shadow-2xl space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="text-center w-full">
              <h3 className="text-lg font-bold text-base-text-primary">Sesuaikan Foto Profil</h3>
              <p className="text-xs text-base-text-secondary mt-1">Geser dan perbesar foto agar pas di dalam lingkaran.</p>
            </div>

            {/* Crop Viewport container */}
            <div 
              className="w-64 h-64 border border-base-border/30 rounded-xl relative overflow-hidden bg-base-bg flex items-center justify-center select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Circular view overlay masking everything outside */}
              <div className="absolute w-48 h-48 rounded-full border-2 border-brand-primary z-10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
              
              {/* The Image inside */}
              <img 
                src={cropImageSrc} 
                alt="Raw Preview" 
                draggable={false}
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                  maxWidth: 'none',
                  width: '192px',
                  height: 'auto'
                }}
                className="select-none pointer-events-none origin-center"
              />
            </div>

            {/* Slider control */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-bold text-base-text-secondary">
                <span>Perkecil</span>
                <span>Perbesar</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.02" 
                value={cropZoom} 
                onChange={(e) => setCropZoom(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-base-border rounded-lg appearance-none cursor-pointer accent-brand-primary" 
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setCropImageSrc(null)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-secondary font-bold text-xs hover:bg-base-bg transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-brand-primary/95 transition shadow-md shadow-brand-primary/10 cursor-pointer"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
