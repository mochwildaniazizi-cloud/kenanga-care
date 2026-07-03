"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getChildDetail, updateChild } from "@/app/actions/children";
import { 
  MdArrowBack, MdCalendarMonth, MdCake, MdFingerprint, MdScale, MdHeight, 
  MdOutlineMonitorWeight, MdTrendingUp, MdTrendingDown, MdTrendingFlat,
  MdEdit, MdSave, MdClose, MdCheckCircleOutline,
  MdMale, MdFemale, MdCameraAlt, MdOutlineError, MdChildCare,
  MdPerson, MdMonitorWeight, MdLocalHospital
} from "react-icons/md";
import { useUserRole } from "@/context/UserRoleContext";
import { FaBaby, FaNotesMedical } from "react-icons/fa";
import CustomDatePicker from "@/components/CustomDatePicker";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

export default function ChildDetailPage() {
  const { id } = useParams();
  const { role } = useUserRole();
  const [child, setChild] = useState<any>(null);
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
    child_name: "",
    gender: "M",
    birth_place: "",
    birth_date: "",
    birth_order: "1",
    birth_weight: "",
    birth_length: "",
    current_weight: "",
    current_height: "",
    blood_type: "-",
    special_conditions: [],
    special_conditions_notes: ""
  });

  const AVAILABLE_TAGS = [
    "Lahir Prematur",
    "Alergi Susu Sapi",
    "Alergi Seafood",
    "Asma",
    "Riwayat Kejang",
    "Lainnya..."
  ];

  const handleTagToggle = (tag: string) => {
    setEditForm((prev: any) => {
      const currentTags = prev.special_conditions || [];
      const isSelected = currentTags.includes(tag);
      const nextTags = isSelected 
        ? currentTags.filter((t: string) => t !== tag) 
        : [...currentTags, tag];
      
      const notes = (!isSelected && tag === "Lainnya...") 
        ? prev.special_conditions_notes 
        : (isSelected && tag === "Lainnya..." ? "" : prev.special_conditions_notes);
        
      return {
        ...prev,
        special_conditions: nextTags,
        special_conditions_notes: notes
      };
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-status-green-light text-status-green-solid border border-status-green-solid/25";
      case "Gizi Kurang":
        return "bg-status-yellow-light text-status-yellow-solid border border-status-yellow-solid/25";
      case "Gizi Buruk":
      case "Pendek / Stunting":
        return "bg-status-red-light text-status-red-solid border border-status-red-solid/25";
      default:
        return "bg-base-bg text-base-text-secondary border border-base-border/50";
    }
  };

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setError(null);
      
      // Attempt load full cached detail
      const cached = localStorage.getItem(`offline_child_detail_${id}`);
      if (cached) {
        setChild(JSON.parse(cached));
        setIsLoading(false);
      } else {
        // Build basic child fallback from master list cache
        const cachedList = localStorage.getItem("offline_children_list");
        if (cachedList) {
          const children = JSON.parse(cachedList);
          const basicChild = children.find((c: any) => c.child_id === id);
          if (basicChild) {
            setChild({
              child_id: basicChild.child_id,
              name: basicChild.name,
              gender: basicChild.gender,
              national_id: basicChild.national_id,
              dob: basicChild.dob,
              dobRaw: basicChild.dobRaw,
              age: basicChild.age,
              birth_place: basicChild.birth_place,
              birth_weight: basicChild.weight,
              birth_length: basicChild.height,
              current_weight: basicChild.weight,
              current_height: basicChild.height,
              mother: {
                mother_name: basicChild.mother
              },
              measurements: []
            });
            setIsLoading(false);
          }
        }
      }

      if (!navigator.onLine) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getChildDetail(id as string);
        if (!data) {
          setError("Rekam medis balita yang Anda cari tidak terdaftar atau telah dihapus.");
        } else {
          setChild(data);
          localStorage.setItem(`offline_child_detail_${id}`, JSON.stringify(data));
        }
      } catch (err: any) {
        console.error("Failed to load child detail", err);
        setError("Gagal memuat rekam medis dari database: " + (err.message || err.toString()));
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleStartEdit = () => {
    setEditForm({
      national_id: child.national_id === "-" ? "" : child.national_id,
      child_name: child.name,
      gender: child.gender,
      birth_place: child.birth_place === "-" ? "" : child.birth_place,
      birth_date: child.dobRaw || "",
      birth_order: child.birth_order === "-" ? "1" : child.birth_order.toString(),
      birth_weight: child.birth_weight || "",
      birth_length: child.birth_length || "",
      current_weight: child.current_weight || "",
      current_height: child.current_height || "",
      blood_type: child.blood_type || "-",
      special_conditions: child.special_conditions || [],
      special_conditions_notes: child.special_conditions_notes || "",
      avatarUrl: child.avatarUrl || ""
    });
    setIsEditing(true);
  };

  const isFormDirty = () => {
    if (!child) return false;
    return (
      editForm.child_name !== (child.name || "") ||
      editForm.national_id !== (child.national_id || "") ||
      editForm.gender !== (child.gender || "M") ||
      editForm.birth_place !== (child.birth_place || "") ||
      editForm.birth_date !== (child.birth_date ? child.birth_date.split('T')[0] : "") ||
      editForm.birth_order !== (child.birth_order || 1).toString() ||
      editForm.birth_weight !== (child.birth_weight || "").toString() ||
      editForm.birth_length !== (child.birth_length || "").toString() ||
      editForm.blood_type !== (child.blood_type || "-") ||
      editForm.special_conditions_notes !== (child.special_conditions_notes || "")
    );
  };

  const handleCancelEdit = () => {
    if (isFormDirty()) {
      const confirmCancel = window.confirm("Perubahan yang Anda buat belum disimpan. Apakah Anda yakin ingin membatalkan?");
      if (!confirmCancel) return;
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.child_name || !editForm.birth_date) {
      alert("Nama Anak dan Tanggal Lahir wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateChild(id as string, editForm);
      if (res.success) {
        const data = await getChildDetail(id as string);
        setChild(data);
        setIsEditing(false);
        setShowSuccessModal(true);
      } else {
        alert(res.error || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error("Error updating child data:", err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAgeInMonths = (dobStr: string) => {
    if (!dobStr) return 0;
    const birthDate = new Date(dobStr);
    const now = new Date();
    const yearsDifference = now.getFullYear() - birthDate.getFullYear();
    const monthsDifference = now.getMonth() - birthDate.getMonth();
    return Math.max(0, yearsDifference * 12 + monthsDifference);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-base-text-secondary">Memuat rekam medis anak...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-status-red-light text-status-red-solid rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MdOutlineError className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-base-text-primary">Gagal Memuat Data</h2>
        <p className="text-base-text-secondary max-w-md mx-auto">{error}</p>
        <Link 
          href="/data-anak"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-sm hover:bg-brand-primary/95 transition shadow-md cursor-pointer"
        >
          <MdArrowBack className="w-4 h-4" /> Kembali ke Daftar Anak
        </Link>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-status-orange-light text-status-orange-solid rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MdOutlineError className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-base-text-primary">Data Anak Tidak Ditemukan</h2>
        <p className="text-base-text-secondary">Rekam medis balita yang Anda cari tidak terdaftar atau telah dihapus.</p>
        <Link 
          href="/data-anak"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-sm hover:bg-brand-primary/95 transition shadow-md cursor-pointer"
        >
          <MdArrowBack className="w-4 h-4" /> Kembali ke Daftar Anak
        </Link>
      </div>
    );
  }

  const chronologicalMeasurements = [...child.measurements].reverse();
  const hasHistory = chronologicalMeasurements.length > 1;

  let weightPoints = "";
  let heightPoints = "";
  if (hasHistory) {
    const maxWeight = Math.max(...chronologicalMeasurements.map((m: any) => m.weight), 15);
    const minWeight = Math.min(...chronologicalMeasurements.map((m: any) => m.weight), 3);
    const maxHeight = Math.max(...chronologicalMeasurements.map((m: any) => m.height), 110);
    const minHeight = Math.min(...chronologicalMeasurements.map((m: any) => m.height), 40);

    const wDiff = maxWeight - minWeight || 1;
    const hDiff = maxHeight - minHeight || 1;

    weightPoints = chronologicalMeasurements.map((m: any, i: number) => {
      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
      const y = 140 - ((m.weight - minWeight) / wDiff) * 100;
      return `${x},${y}`;
    }).join(" ");

    heightPoints = chronologicalMeasurements.map((m: any, i: number) => {
      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
      const y = 140 - ((m.height - minHeight) / hDiff) * 100;
      return `${x},${y}`;
    }).join(" ");
  }

  // Display fields, handle either edit state or display state
  const displayGender = isEditing ? editForm.gender : child.gender;
  const displayName = isEditing ? editForm.child_name : child.name;
  const displayNik = isEditing ? editForm.national_id : child.national_id;
  const displayAge = isEditing ? getAgeInMonths(editForm.birth_date) : child.ageInMonths;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
      
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/20 pb-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/data-anak"
            className="p-2.5 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary bg-base-white rounded-xl hover:bg-brand-soft/20 transition cursor-pointer shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </Link>
          
          {/* Avatar Profile Picture */}
          {isEditing ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-16 h-16 rounded-full overflow-hidden border border-brand-primary shadow-sm shrink-0 flex items-center justify-center cursor-pointer group ${
                editForm.gender === "M" ? "bg-gender-male-bg text-gender-male-solid" : "bg-gender-female-bg text-gender-female-solid"
              }`}
              title="Klik untuk ubah foto profil"
            >
              {editForm.avatarUrl ? (
                <img src={editForm.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                editForm.gender === "M" ? <MdMale className="w-9 h-9" /> : <MdFemale className="w-9 h-9" />
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
            <div className={`w-16 h-16 rounded-full overflow-hidden border border-base-border/30 shadow-sm shrink-0 flex items-center justify-center ${
              displayGender === "M" ? "bg-gender-male-bg text-gender-male-solid" : "bg-gender-female-bg text-gender-female-solid"
            }`}>
              {child.avatarUrl ? (
                <img src={child.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayGender === "M" ? <MdMale className="w-9 h-9" /> : <MdFemale className="w-9 h-9" />
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <input 
                  type="text" 
                  name="child_name"
                  value={editForm.child_name}
                  onChange={handleInputChange}
                  className="px-3 py-1 border border-brand-primary rounded-lg font-bold text-xl text-base-text-primary focus:outline-none w-64 bg-base-white"
                  placeholder="Nama Lengkap Anak"
                  required
                />
              ) : (
                <h1 className="text-2xl font-bold text-base-text-primary">{displayName}</h1>
              )}
              
              {!isEditing ? (
                <>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    displayGender === "M" 
                      ? "bg-status-blue-light text-status-blue-solid border border-status-blue-solid/25" 
                      : "bg-status-pink-light text-brand-primary border border-brand-primary/25"
                  }`}>
                    {displayGender === "M" ? "Laki-laki" : "Perempuan"}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(child.status)}`}>
                    Status Gizi: {child.status}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleInputChange}
                    className="px-2.5 py-0.5 border border-brand-primary rounded-full text-xs font-semibold focus:outline-none bg-base-white text-base-text-primary cursor-pointer"
                  >
                    <option value="M">Laki-laki (M)</option>
                    <option value="F">Perempuan (F)</option>
                  </select>
                  {editForm.current_weight && editForm.current_height && editForm.birth_date && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      getStatusBadgeStyle(
                        getNutritionalStatus(
                          calculateZScore(Number(editForm.current_weight), getAgeInMonths(editForm.birth_date), editForm.gender, "BB"),
                          calculateZScore(Number(editForm.current_height), getAgeInMonths(editForm.birth_date), editForm.gender, "TB")
                        )
                      )
                    }`}>
                      Status Gizi: {getNutritionalStatus(
                        calculateZScore(Number(editForm.current_weight), getAgeInMonths(editForm.birth_date), editForm.gender, "BB"),
                        calculateZScore(Number(editForm.current_height), getAgeInMonths(editForm.birth_date), editForm.gender, "TB")
                      )}
                    </span>
                  )}
                </div>
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
                  placeholder="NIK Anak"
                />
              ) : (
                <span className="font-semibold text-base-text-primary">{displayNik}</span>
              )}
              <span>&bull;</span>
              <span>ID Anak: {child.child_id}</span>
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
                <MdEdit className="w-4 h-4" /> Edit Data Balita
              </button>
            )
          )}
        </div>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Biodata & Stats (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Biodata Anak */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
              <MdChildCare className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-base-text-primary text-base">Identitas Balita</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Tempat Lahir</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="birth_place"
                    value={editForm.birth_place}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs"
                    placeholder="Tempat Lahir"
                  />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{child.birth_place}</p>
                )}
              </div>

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
                  <p className="text-sm font-bold text-base-text-primary">{child.dob}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Umur Sekarang</span>
                <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{displayAge} Bulan</p>
              </div>

              <div className="space-y-1">
                <span className="text-base-text-secondary block">Anak Ke-</span>
                {isEditing ? (
                  <select 
                    name="birth_order"
                    value={editForm.birth_order}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 border border-base-border/50 rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{child.birth_order}</p>
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
                    <option value="-">-</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                ) : (
                  <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{child.blood_type || "-"}</p>
                )}
              </div>

              {isEditing && (
                <div className="col-span-2 space-y-1">
                  <span className="text-base-text-secondary block">Jenis Kelamin</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button 
                      type="button"
                      onClick={() => setEditForm((prev: any) => ({ ...prev, gender: "M" }))}
                      className={`py-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                        editForm.gender === "M" 
                          ? "border-status-blue-solid bg-status-blue-light/50 text-status-blue-solid" 
                          : "border-base-border/50 text-base-text-secondary"
                      }`}
                    >
                      Laki-laki
                    </button>
                    <button 
                      type="button"
                      onClick={() => setEditForm((prev: any) => ({ ...prev, gender: "F" }))}
                      className={`py-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer ${
                        editForm.gender === "F" 
                          ? "border-brand-primary bg-brand-soft/50 text-brand-primary" 
                          : "border-base-border/50 text-base-text-secondary"
                      }`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
              )}
              
              <div className="col-span-2 space-y-1 pt-2 border-t border-base-border/10">
                <span className="text-base-text-secondary">Ibu Kandung</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center">
                    <MdPerson className="w-3.5 h-3.5" />
                  </div>
                  {child.mother_id ? (
                    <Link 
                      href={`/data-ibu/${child.mother_id}`}
                      className="text-sm font-bold text-brand-primary hover:underline transition cursor-pointer"
                    >
                      {child.mother_name}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-base-text-primary">{child.mother_name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Antropometri Lahir & Pengukuran Terbaru */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
            
            {/* Lahir */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-2">
                <FaBaby className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-sm text-base-text-primary">Kondisi Saat Lahir</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-base-bg/30 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Lahir</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1 justify-center">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        name="birth_weight"
                        value={editForm.birth_weight}
                        onChange={handleInputChange}
                        className="w-16 px-1.5 py-0.5 border border-base-border/50 rounded text-center text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-base-text-secondary">kg</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-base-text-primary mt-1">{child.birth_weight} kg</p>
                  )}
                </div>

                <div className="bg-base-bg/30 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Panjang Lahir</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1 justify-center">
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        name="birth_length"
                        value={editForm.birth_length}
                        onChange={handleInputChange}
                        className="w-16 px-1.5 py-0.5 border border-base-border/50 rounded text-center text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-base-text-secondary">cm</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-base-text-primary mt-1">{child.birth_length} cm</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terbaru */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-base-border/10 pb-2">
                <FaNotesMedical className="w-4 h-4 text-brand-primary" />
                <h3 className="font-bold text-sm text-base-text-primary">Pengukuran Terbaru</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                  <MdMonitorWeight className="w-4 h-4 text-brand-primary absolute top-2 right-2" />
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Sekarang</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1 justify-center">
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        name="current_weight"
                        value={editForm.current_weight}
                        onChange={handleInputChange}
                        className="w-16 px-1.5 py-0.5 border border-brand-primary/30 rounded text-center text-xs focus:outline-none font-semibold text-brand-primary"
                      />
                      <span className="text-[10px] text-brand-primary font-semibold">kg</span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-brand-primary mt-1">{child.current_weight} kg</p>
                  )}
                </div>

                <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                  <MdHeight className="w-4 h-4 text-brand-primary absolute top-2 right-2" />
                  <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Sekarang</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1 mt-1 justify-center">
                      <input 
                        type="number" 
                        step="0.1"
                        min="0"
                        name="current_height"
                        value={editForm.current_height}
                        onChange={handleInputChange}
                        className="w-16 px-1.5 py-0.5 border border-brand-primary/30 rounded text-center text-xs focus:outline-none font-semibold text-brand-primary"
                      />
                      <span className="text-[10px] text-brand-primary font-semibold">cm</span>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-brand-primary mt-1">{child.current_height} cm</p>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Grid: Growth Charts & Tables (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Visualisasi Tren Pertumbuhan */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></span>
                <h2 className="font-bold text-base-text-primary text-base">Tren Tumbuh Kembang (Pemeriksaan Posyandu)</h2>
              </div>
              <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                {child.measurements.length} kunjungan
              </span>
            </div>

            {hasHistory ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-base-text-secondary">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-0.5 bg-brand-primary inline-block"></span>
                    <span>Berat Badan (kg)</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
                    <span>Tinggi Badan (cm)</span>
                  </div>
                </div>

                <div className="relative border border-base-border/20 rounded-2xl p-4 bg-base-bg/5 flex items-center justify-center">
                  <svg className="w-full max-w-[500px] h-[160px]" viewBox="0 0 500 160">
                    {/* Grid lines */}
                    <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="20" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Height Plot Line (Blue) */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={heightPoints}
                    />

                    {/* Weight Plot Line (Pink) */}
                    <polyline
                      fill="none"
                      stroke="#ea2986"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={weightPoints}
                    />

                    {/* Markers for weight */}
                    {chronologicalMeasurements.map((m: any, i: number) => {
                      const maxWeight = Math.max(...chronologicalMeasurements.map((x: any) => x.weight), 15);
                      const minWeight = Math.min(...chronologicalMeasurements.map((x: any) => x.weight), 3);
                      const wDiff = maxWeight - minWeight || 1;
                      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                      const y = 140 - ((m.weight - minWeight) / wDiff) * 100;
                      return (
                        <g key={`w-${i}`} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="4" fill="#ea2986" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={x} cy={y} r="8" fill="#ea2986" opacity="0" className="hover:opacity-20 transition" />
                        </g>
                      );
                    })}

                    {/* Markers for height */}
                    {chronologicalMeasurements.map((m: any, i: number) => {
                      const maxHeight = Math.max(...chronologicalMeasurements.map((x: any) => x.height), 110);
                      const minHeight = Math.min(...chronologicalMeasurements.map((x: any) => x.height), 40);
                      const hDiff = maxHeight - minHeight || 1;
                      const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                      const y = 140 - ((m.height - minHeight) / hDiff) * 100;
                      return (
                        <g key={`h-${i}`} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={x} cy={y} r="8" fill="#3b82f6" opacity="0" className="hover:opacity-20 transition" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <p className="text-[10px] text-center text-base-text-secondary leading-none">Menunjukkan perkembangan kurva pertumbuhan dari kunjungan posyandu berurutan.</p>
              </div>
            ) : (
              <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center space-y-2 text-base-text-secondary text-sm">
                <p>Belum memiliki riwayat pemeriksaan posyandu yang cukup.</p>
                <p className="text-xs">Diperlukan minimal 2 riwayat penimbangan untuk memvisualisasikan tren grafik.</p>
              </div>
            )}
          </div>

          {/* Card: Kondisi Medis & Alergi */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
              <MdLocalHospital className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-base-text-primary text-base">Kondisi Medis & Alergi</h2>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <p className="text-xs text-base-text-secondary">Pilih kondisi medis atau riwayat alergi balita:</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => {
                    const isSelected = editForm.special_conditions?.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? "bg-brand-soft/80 text-brand-primary border-brand-primary"
                            : "bg-base-bg text-base-text-secondary border-base-border/50 hover:bg-base-border/20"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {editForm.special_conditions?.includes("Lainnya...") && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-base-text-secondary uppercase block">Catatan Medis Tambahan</label>
                    <textarea
                      name="special_conditions_notes"
                      value={editForm.special_conditions_notes || ""}
                      onChange={(e) => setEditForm((prev: any) => ({ ...prev, special_conditions_notes: e.target.value }))}
                      placeholder="Masukkan detail kondisi medis atau alergi lainnya..."
                      rows={3}
                      className="w-full px-3 py-2 text-xs border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(!child.special_conditions || child.special_conditions.length === 0) ? (
                  <p className="text-xs text-base-text-secondary italic">Tidak ada kondisi khusus / riwayat alergi.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {child.special_conditions.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-brand-soft/50 text-brand-primary border border-brand-primary/20 rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {child.special_conditions.includes("Lainnya...") && child.special_conditions_notes && (
                      <div className="bg-base-bg/30 p-3 rounded-xl border border-base-border/20">
                        <span className="text-[10px] font-bold text-base-text-secondary uppercase block mb-1">Catatan Tambahan</span>
                        <p className="text-xs text-base-text-primary font-medium">{child.special_conditions_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Full Measurement Log Table */}
      <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
          <h2 className="font-bold text-base-text-primary text-base">Riwayat Lengkap Kunjungan & Penimbangan</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal Kunjungan</th>
                <th className="py-3 px-4 text-center">Umur</th>
                <th className="py-3 px-4 text-center">Berat (kg)</th>
                <th className="py-3 px-4 text-center">Tinggi (cm)</th>
                <th className="py-3 px-4 text-center">Lila/Lika (cm)</th>
                <th className="py-3 px-4 text-center">Vit A</th>
                <th className="py-3 px-4 text-center">Obat Cacing</th>
                <th className="py-3 px-4">Imunisasi</th>
                <th className="py-3 px-4 text-center">Pemberian PMT</th>
                <th className="py-3 px-4">Catatan Kader</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {child.measurements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-base-text-secondary text-xs">Belum ada riwayat penimbangan.</td>
                </tr>
              ) : (
                child.measurements.map((m: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{m.date}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.ageAtVisit} Bln</td>
                    <td className="py-3 px-4 text-center font-bold text-brand-primary">{m.weight} kg</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-primary">{m.height} cm</td>
                    <td className="py-3 px-4 text-center font-medium text-base-text-secondary">{m.head_circumference > 0 ? `${m.head_circumference} cm` : "-"}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-secondary">{m.vitamin_a_capsule}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-secondary">{m.deworming_pill}</td>
                    <td className="py-3 px-4 font-medium text-base-text-primary">{m.immunizations}</td>
                    <td className="py-3 px-4 text-center font-semibold text-base-text-secondary">{m.supplementary_feeding}</td>
                    <td className="py-3 px-4 text-base-text-secondary font-medium italic">{m.cadre_notes}</td>
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
                Data rekam medis balita berhasil diperbarui ke database.
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
