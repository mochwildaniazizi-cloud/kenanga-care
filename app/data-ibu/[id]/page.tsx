"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { getMotherDetail, updateMother } from "@/app/actions/mothers";
import { 
  MdArrowBack, MdPerson, MdCalendarToday, MdPhone, 
  MdPregnantWoman, MdBloodtype, MdOutlineError, MdFemale, MdMale,
  MdEdit, MdSave, MdClose, MdCheckCircleOutline, MdCameraAlt, MdHome, MdInfo,
  MdVaccines
} from "react-icons/md";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { getWeeklyMonitorings, upsertWeeklyMonitoring } from "@/app/actions/weekly";
import { FaUserFriends, FaHeartbeat, FaUser, FaUserFriends as FaUserCouple, FaFileMedical } from "react-icons/fa";
import CustomDatePicker from "@/components/CustomDatePicker";

export default function MotherDetailPage() {
  const { id } = useParams();
  const { role } = useUserRole();
  const [mother, setMother] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'ibu' | 'husband' | 'health' | 'ttd' | 'weekly'>('ibu');

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [ttdLogs, setTtdLogs] = useState<any[]>([]);
  const [ttdCompanion, setTtdCompanion] = useState("");
  const [ttdRelationship, setTtdRelationship] = useState("Suami");

  // Weekly self monitoring states
  const [weeklyLogs, setWeeklyLogs] = useState<any[]>([]);
  const [weeklyTrimesterFilter, setWeeklyTrimesterFilter] = useState<1 | 2 | 3>(1);

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
    setDragStart({ x: touch.clientX - cropOffset.x, y: touch.clientY - cropOffset.y });
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
    number_of_children: 0,
    avatarUrl: "",

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

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setError(null);
      const decodedId = decodeURIComponent(id as string);

      // Attempt load full cached detail
      const cached = localStorage.getItem(`offline_mother_detail_${decodedId}`);
      if (cached) {
        setMother(JSON.parse(cached));
        setIsLoading(false);
      } else {
        // Build basic mother fallback from master list cache
        const cachedList = localStorage.getItem("offline_mothers_list");
        if (cachedList) {
          const mothers = JSON.parse(cachedList);
          const basicMother = mothers.find((m: any) => m.mother_id === decodedId);
          if (basicMother) {
            setMother({
              mother_id: basicMother.mother_id,
              national_id: basicMother.national_id,
              name: basicMother.name,
              age: basicMother.rawAge?.toString() || "",
              status: basicMother.status,
              condition: basicMother.condition,
              phone_number: basicMother.phone_number,
              husband_name: "-",
              number_of_children: 0,
              measurements: [],
              children: [],
              maternal_records: []
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
        const data = await getMotherDetail(decodedId);
        if (!data) {
          setError("Rekam medis ibu yang Anda cari tidak terdaftar atau telah dihapus.");
        } else {
          setMother(data);
          localStorage.setItem(`offline_mother_detail_${decodedId}`, JSON.stringify(data));
        }
      } catch (err: any) {
        console.error("Failed to load mother detail", err);
        setError("Gagal memuat rekam medis dari database: " + (err.message || err.toString()));
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!mother) return;
    async function fetchTtdData() {
      const motherId = mother.mother_id;
      const cacheKey = `offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`;
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTtdLogs(parsed.logs || []);
          setTtdCompanion(parsed.companion || "");
          setTtdRelationship(parsed.relationship || "Suami");
        } catch (e) {
          console.error("Failed to parse cached TTD data:", e);
        }
      }

      if (!navigator.onLine) return;

      try {
        const res = await getTtdLogs(motherId, currentYear, currentMonth);
        if (res && res.success) {
          const logs = res.logs;
          setTtdLogs(logs);
          
          const latestLog = logs.find((l: any) => l.companion);
          const companion = latestLog?.companion || localStorage.getItem(`ttd_companion_${motherId}`) || "";
          const relationship = latestLog?.relationship || localStorage.getItem(`ttd_relationship_${motherId}`) || "Suami";
          
          if (companion) setTtdCompanion(companion);
          if (relationship) setTtdRelationship(relationship);

          localStorage.setItem(cacheKey, JSON.stringify({
            logs,
            companion,
            relationship
          }));
        }
      } catch (err) {
        console.error("Failed to load TTD logs", err);
      }
    }
    fetchTtdData();
  }, [mother]);

  const handleToggleTtd = async (day: number) => {
    if (!mother) return;
    const motherId = mother.mother_id;
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const isCurrentlyTaken = ttdLogs.some((l: any) => l.intake_date === dateStr && l.taken);
    const newTakenState = !isCurrentlyTaken;

    localStorage.setItem(`ttd_companion_${motherId}`, ttdCompanion);
    localStorage.setItem(`ttd_relationship_${motherId}`, ttdRelationship);

    let updatedLogs = [...ttdLogs];
    const logIndex = updatedLogs.findIndex((l: any) => l.intake_date === dateStr);
    if (logIndex >= 0) {
      updatedLogs[logIndex] = {
        ...updatedLogs[logIndex],
        taken: newTakenState,
        companion: ttdCompanion,
        relationship: ttdRelationship
      };
    } else {
      updatedLogs.push({
        intake_date: dateStr,
        taken: newTakenState,
        companion: ttdCompanion,
        relationship: ttdRelationship
      });
    }
    setTtdLogs(updatedLogs);

    const cacheKey = `offline_ttd_logs_${motherId}_${currentYear}_${currentMonth}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      logs: updatedLogs,
      companion: ttdCompanion,
      relationship: ttdRelationship
    }));

    if (navigator.onLine) {
      try {
        await upsertTtdLog(motherId, dateStr, newTakenState, ttdCompanion, ttdRelationship);
      } catch (err) {
        console.error("Failed to upsert TTD log:", err);
      }
    }
  };

  useEffect(() => {
    if (!mother) return;
    const motherId = mother.mother_id;
    const cacheKey = `offline_weekly_monitoring_${motherId}`;
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setWeeklyLogs(JSON.parse(cached));
      } catch (e) {}
    }

    if (!navigator.onLine) return;

    getWeeklyMonitorings(motherId).then((res) => {
      if (res && res.success) {
        setWeeklyLogs(res.list || []);
        localStorage.setItem(cacheKey, JSON.stringify(res.list || []));
      }
    });
  }, [mother]);

  const handleToggleWeekly = async (weekNumber: number, field: string) => {
    if (!mother) return;
    const motherId = mother.mother_id;
    const cacheKey = `offline_weekly_monitoring_${motherId}`;

    let updatedLogs = [...weeklyLogs];
    const logIndex = updatedLogs.findIndex((l: any) => l.week_number === weekNumber);
    let record: any = {};
    if (logIndex >= 0) {
      record = {
        ...updatedLogs[logIndex],
        [field]: !updatedLogs[logIndex][field]
      };
      updatedLogs[logIndex] = record;
    } else {
      record = {
        week_number: weekNumber,
        check_pregnancy: false,
        check_class: false,
        fever: false,
        headache: false,
        insomnia: false,
        cough: false,
        fetal_movement: false,
        stomach_pain: false,
        fluid_discharge: false,
        urination_pain: false,
        diarrhea: false,
        [field]: true
      };
      updatedLogs.push(record);
    }
    setWeeklyLogs(updatedLogs);
    localStorage.setItem(cacheKey, JSON.stringify(updatedLogs));

    if (navigator.onLine) {
      try {
        await upsertWeeklyMonitoring(motherId, weekNumber, record);
      } catch (e) {
        console.error(e);
      }
    }
  };

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
      avatarUrl: mother.avatarUrl || "",

      // Buku KIA Mother fields
      jkn_number: mother.jkn_number === "-" ? "" : mother.jkn_number,
      faskes_1: mother.faskes_1 === "-" ? "" : mother.faskes_1,
      faskes_referral: mother.faskes_referral === "-" ? "" : mother.faskes_referral,
      birth_place: mother.birth_place === "-" ? "" : mother.birth_place,
      education: mother.education === "-" ? "" : mother.education,
      occupation: mother.occupation === "-" ? "" : mother.occupation,
      address: mother.address === "-" ? "" : mother.address,
      other_financing: mother.other_financing === "-" ? "" : mother.other_financing,
      insurance_other: mother.insurance_other === "-" ? "" : mother.insurance_other,
      insurance_number: mother.insurance_number === "-" ? "" : mother.insurance_number,
      insurance_validity: mother.insurance_validity || "",
      faskes_primary: mother.faskes_primary === "-" ? "" : mother.faskes_primary,
      puskesmas_domicile: mother.puskesmas_domicile === "-" ? "" : mother.puskesmas_domicile,
      cohort_register_number: mother.cohort_register_number === "-" ? "" : mother.cohort_register_number,
      faskes_secondary: mother.faskes_secondary === "-" ? "" : mother.faskes_secondary,
      medical_record_number: mother.medical_record_number === "-" ? "" : mother.medical_record_number,

      // Riwayat Singkat Kesehatan Ibu
      pregnancy_number: mother.pregnancy_number || 1,
      children_born_alive: mother.children_born_alive || 0,
      miscarriage_history: mother.miscarriage_history || 0,
      disease_history: mother.disease_history === "-" ? "" : mother.disease_history,

      // Husband Identity fields
      husband_national_id: mother.husband_national_id === "-" ? "" : mother.husband_national_id,
      husband_jkn_number: mother.husband_jkn_number === "-" ? "" : mother.husband_jkn_number,
      husband_faskes_1: mother.husband_faskes_1 === "-" ? "" : mother.husband_faskes_1,
      husband_faskes_referral: mother.husband_faskes_referral === "-" ? "" : mother.husband_faskes_referral,
      husband_birth_place: mother.husband_birth_place === "-" ? "" : mother.husband_birth_place,
      husband_birth_date: mother.husband_birth_date || "",
      husband_education: mother.husband_education === "-" ? "" : mother.husband_education,
      husband_occupation: mother.husband_occupation === "-" ? "" : mother.husband_occupation,
      husband_address: mother.husband_address === "-" ? "" : mother.husband_address,
      husband_phone_number: mother.husband_phone_number === "-" ? "" : mother.husband_phone_number,
      husband_blood_type: mother.husband_blood_type === "-" ? "" : mother.husband_blood_type,
      husband_other_financing: mother.husband_other_financing === "-" ? "" : mother.husband_other_financing,
      husband_insurance_other: mother.husband_insurance_other === "-" ? "" : mother.husband_insurance_other,
      husband_insurance_number: mother.husband_insurance_number === "-" ? "" : mother.husband_insurance_number,
      husband_insurance_validity: mother.husband_insurance_validity || "",
      husband_faskes_primary: mother.husband_faskes_primary === "-" ? "" : mother.husband_faskes_primary,
      husband_puskesmas_domicile: mother.husband_puskesmas_domicile === "-" ? "" : mother.husband_puskesmas_domicile,
      husband_faskes_secondary: mother.husband_faskes_secondary === "-" ? "" : mother.husband_faskes_secondary,
      husband_medical_record_number: mother.husband_medical_record_number === "-" ? "" : mother.husband_medical_record_number,
    });
    setIsEditing(true);
  };

  const isFormDirty = () => {
    if (!mother) return false;
    return (
      editForm.mother_name !== (mother.name || "") ||
      editForm.national_id !== (mother.national_id || "") ||
      editForm.birth_date !== (mother.dobRaw || "") ||
      editForm.jkn_number !== (mother.jkn_number === "-" ? "" : mother.jkn_number) ||
      editForm.faskes_1 !== (mother.faskes_1 === "-" ? "" : mother.faskes_1) ||
      editForm.faskes_referral !== (mother.faskes_referral === "-" ? "" : mother.faskes_referral) ||
      editForm.birth_place !== (mother.birth_place === "-" ? "" : mother.birth_place) ||
      editForm.education !== (mother.education === "-" ? "" : mother.education) ||
      editForm.occupation !== (mother.occupation === "-" ? "" : mother.occupation) ||
      editForm.address !== (mother.address === "-" ? "" : mother.address) ||
      editForm.other_financing !== (mother.other_financing === "-" ? "" : mother.other_financing) ||
      editForm.insurance_other !== (mother.insurance_other === "-" ? "" : mother.insurance_other) ||
      editForm.insurance_number !== (mother.insurance_number === "-" ? "" : mother.insurance_number) ||
      editForm.insurance_validity !== (mother.insurance_validity || "") ||
      editForm.faskes_primary !== (mother.faskes_primary === "-" ? "" : mother.faskes_primary) ||
      editForm.puskesmas_domicile !== (mother.puskesmas_domicile === "-" ? "" : mother.puskesmas_domicile) ||
      editForm.cohort_register_number !== (mother.cohort_register_number === "-" ? "" : mother.cohort_register_number) ||
      editForm.faskes_secondary !== (mother.faskes_secondary === "-" ? "" : mother.faskes_secondary) ||
      editForm.medical_record_number !== (mother.medical_record_number === "-" ? "" : mother.medical_record_number) ||
      editForm.pregnancy_number !== (mother.pregnancy_number || 1) ||
      editForm.children_born_alive !== (mother.children_born_alive || 0) ||
      editForm.miscarriage_history !== (mother.miscarriage_history || 0) ||
      editForm.disease_history !== (mother.disease_history === "-" ? "" : mother.disease_history) ||
      editForm.husband_name !== (mother.husband_name === "-" ? "" : mother.husband_name) ||
      editForm.husband_national_id !== (mother.husband_national_id === "-" ? "" : mother.husband_national_id) ||
      editForm.husband_jkn_number !== (mother.husband_jkn_number === "-" ? "" : mother.husband_jkn_number) ||
      editForm.husband_faskes_1 !== (mother.husband_faskes_1 === "-" ? "" : mother.husband_faskes_1) ||
      editForm.husband_faskes_referral !== (mother.husband_faskes_referral === "-" ? "" : mother.husband_faskes_referral) ||
      editForm.husband_birth_place !== (mother.husband_birth_place === "-" ? "" : mother.husband_birth_place) ||
      editForm.husband_birth_date !== (mother.husband_birth_date || "") ||
      editForm.husband_education !== (mother.husband_education === "-" ? "" : mother.husband_education) ||
      editForm.husband_occupation !== (mother.husband_occupation === "-" ? "" : mother.husband_occupation) ||
      editForm.husband_address !== (mother.husband_address === "-" ? "" : mother.husband_address) ||
      editForm.husband_phone_number !== (mother.husband_phone_number === "-" ? "" : mother.husband_phone_number) ||
      editForm.husband_blood_type !== (mother.husband_blood_type === "-" ? "" : mother.husband_blood_type) ||
      editForm.husband_other_financing !== (mother.husband_other_financing === "-" ? "" : mother.husband_other_financing) ||
      editForm.husband_insurance_other !== (mother.husband_insurance_other === "-" ? "" : mother.husband_insurance_other) ||
      editForm.husband_insurance_number !== (mother.husband_insurance_number === "-" ? "" : mother.husband_insurance_number) ||
      editForm.husband_insurance_validity !== (mother.husband_insurance_validity || "") ||
      editForm.husband_faskes_primary !== (mother.husband_faskes_primary === "-" ? "" : mother.husband_faskes_primary) ||
      editForm.husband_puskesmas_domicile !== (mother.husband_puskesmas_domicile === "-" ? "" : mother.husband_puskesmas_domicile) ||
      editForm.husband_faskes_secondary !== (mother.husband_faskes_secondary === "-" ? "" : mother.husband_faskes_secondary) ||
      editForm.husband_medical_record_number !== (mother.husband_medical_record_number === "-" ? "" : mother.husband_medical_record_number) ||
      editForm.phone_number !== (mother.phone_number === "-" ? "" : mother.phone_number) ||
      editForm.blood_type !== (mother.blood_type === "-" ? "" : mother.blood_type) ||
      editForm.estimated_due_date !== (mother.estimated_due_date && mother.estimated_due_date !== "-" ? mother.estimated_due_date : "") ||
      editForm.risk_status !== (mother.condition || "Normal") ||
      editForm.ui_status !== (mother.status || "Ibu Hamil") ||
      editForm.number_of_children !== (mother.number_of_children || 0) ||
      editForm.avatarUrl !== (mother.avatarUrl || "")
    );
  };

  const handleCancelEdit = () => {
    if (isFormDirty()) {
      const confirmCancel = window.confirm("Perubahan yang Anda buat belum disimpan. Apakah Anda yakin ingin membatalkan?");
      if (!confirmCancel) return;
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.mother_name || !editForm.national_id) {
      alert("Nama Ibu dan NIK wajib diisi.");
      return;
    }

    const decodedId = decodeURIComponent(id as string);

    const updatedMother = {
      ...mother,
      national_id: editForm.national_id,
      name: editForm.mother_name,
      dobRaw: editForm.birth_date,
      dob: editForm.birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(editForm.birth_date)) : "-",
      age: getAgeInYears(editForm.birth_date) + " Tahun",
      husband_name: editForm.husband_name || "-",
      phone_number: editForm.phone_number || "-",
      blood_type: editForm.blood_type || "-",
      estimated_due_date: editForm.estimated_due_date || "-",
      hpl: editForm.estimated_due_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(editForm.estimated_due_date)) : "-",
      condition: editForm.risk_status,
      status: editForm.ui_status,
      number_of_children: editForm.number_of_children ? parseInt(editForm.number_of_children.toString()) : 0,
      avatarUrl: editForm.avatarUrl,

      // Additional Buku KIA 2024 fields
      jkn_number: editForm.jkn_number || "-",
      faskes_1: editForm.faskes_1 || "-",
      faskes_referral: editForm.faskes_referral || "-",
      birth_place: editForm.birth_place || "-",
      education: editForm.education || "-",
      occupation: editForm.occupation || "-",
      address: editForm.address || "-",
      other_financing: editForm.other_financing || "-",
      insurance_other: editForm.insurance_other || "-",
      insurance_number: editForm.insurance_number || "-",
      insurance_validity: editForm.insurance_validity || "",
      faskes_primary: editForm.faskes_primary || "-",
      puskesmas_domicile: editForm.puskesmas_domicile || "-",
      cohort_register_number: editForm.cohort_register_number || "-",
      faskes_secondary: editForm.faskes_secondary || "-",
      medical_record_number: editForm.medical_record_number || "-",

      pregnancy_number: editForm.pregnancy_number ? parseInt(editForm.pregnancy_number.toString()) : 1,
      children_born_alive: editForm.children_born_alive ? parseInt(editForm.children_born_alive.toString()) : 0,
      miscarriage_history: editForm.miscarriage_history ? parseInt(editForm.miscarriage_history.toString()) : 0,
      disease_history: editForm.disease_history || "-",

      husband_national_id: editForm.husband_national_id || "-",
      husband_jkn_number: editForm.husband_jkn_number || "-",
      husband_faskes_1: editForm.husband_faskes_1 || "-",
      husband_faskes_referral: editForm.husband_faskes_referral || "-",
      husband_birth_place: editForm.husband_birth_place || "-",
      husband_birth_date: editForm.husband_birth_date || "",
      husband_education: editForm.husband_education || "-",
      husband_occupation: editForm.husband_occupation || "-",
      husband_address: editForm.husband_address || "-",
      husband_phone_number: editForm.husband_phone_number || "-",
      husband_blood_type: editForm.husband_blood_type || "-",
      husband_other_financing: editForm.husband_other_financing || "-",
      husband_insurance_other: editForm.husband_insurance_other || "-",
      husband_insurance_number: editForm.husband_insurance_number || "-",
      husband_insurance_validity: editForm.husband_insurance_validity || "",
      husband_faskes_primary: editForm.husband_faskes_primary || "-",
      husband_puskesmas_domicile: editForm.husband_puskesmas_domicile || "-",
      husband_faskes_secondary: editForm.husband_faskes_secondary || "-",
      husband_medical_record_number: editForm.husband_medical_record_number || "-",
    };

    if (!navigator.onLine) {
      setMother(updatedMother);
      localStorage.setItem("offline_mother_detail_" + decodedId, JSON.stringify(updatedMother));

      const cachedList = localStorage.getItem("offline_mothers_list");
      if (cachedList) {
        const list = JSON.parse(cachedList);
        const idx = list.findIndex((m: any) => m.mother_id === decodedId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            national_id: editForm.national_id,
            name: editForm.mother_name,
            age: getAgeInYears(editForm.birth_date) + " Tahun",
            rawAge: getAgeInYears(editForm.birth_date),
            status: editForm.ui_status,
            condition: editForm.risk_status,
            phone_number: editForm.phone_number || "-",
            hpl: editForm.estimated_due_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(editForm.estimated_due_date)) : "-",
            avatarUrl: editForm.avatarUrl
          };
          localStorage.setItem("offline_mothers_list", JSON.stringify(list));
        }
      }

      const pendingUpdates = JSON.parse(localStorage.getItem("pending_update_mothers") || "[]");
      const cleanPending = pendingUpdates.filter((item: any) => item.mother_id !== decodedId);
      cleanPending.push({ mother_id: decodedId, data: editForm });
      localStorage.setItem("pending_update_mothers", JSON.stringify(cleanPending));

      setIsEditing(false);
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateMother(decodedId, editForm);
      if (res.success) {
        const data = await getMotherDetail(decodedId);
        setMother(data);
        localStorage.setItem("offline_mother_detail_" + decodedId, JSON.stringify(data));
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

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-status-red-light text-status-red-solid rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MdOutlineError className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-base-text-primary">Gagal Memuat Data</h2>
        <p className="text-base-text-secondary max-w-md mx-auto">{error}</p>
        <Link 
          href="/data-ibu"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white font-bold rounded-xl text-sm hover:bg-brand-primary/95 transition shadow-md cursor-pointer"
        >
          <MdArrowBack className="w-4 h-4" /> Kembali ke Daftar Ibu
        </Link>
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
      
      {/* Offline Warning Banner */}
      {!navigator.onLine && (
        <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <span className="text-sm">⚠️</span>
          <span>Mode Offline: Menampilkan rekam medis lokal dari memori peramban. Anda tetap bisa mengubah profil ibu secara offline.</span>
        </div>
      )}

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
                <img src={editForm.avatarUrl} alt={displayName} className="w-full h-full object-cover animate-in fade-in" />
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
        
        {/* Left Column: Identitas & Kehamilan (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: TABBED BENTO CONTAINER */}
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden">
            {/* Tabs Selector */}
            <div className="flex border-b text-xs font-bold text-base-text-secondary select-none">
              <button 
                type="button" 
                onClick={() => setActiveSubTab('ibu')}
                className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${activeSubTab === 'ibu' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
              >
                <FaUser className="w-3.5 h-3.5" /> Identitas Ibu
              </button>
              <button 
                type="button" 
                onClick={() => setActiveSubTab('husband')}
                className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${activeSubTab === 'husband' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
              >
                <FaUserCouple className="w-3.5 h-3.5" /> Suami / Keluarga
              </button>
              <button 
                type="button" 
                onClick={() => setActiveSubTab('health')}
                className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${activeSubTab === 'health' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
              >
                <FaFileMedical className="w-3.5 h-3.5" /> Riwayat &amp; Risiko
              </button>
              <button 
                type="button" 
                onClick={() => setActiveSubTab('ttd')}
                className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${activeSubTab === 'ttd' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
              >
                <MdVaccines className="w-3.5 h-3.5" /> Checklist TTD
              </button>
              <button 
                type="button" 
                onClick={() => setActiveSubTab('weekly')}
                className={`flex-1 py-4 text-center border-b-2 flex items-center justify-center gap-1.5 transition ${activeSubTab === 'weekly' ? 'border-brand-primary text-brand-primary bg-brand-soft/10' : 'border-transparent hover:bg-base-bg/30'}`}
              >
                <MdCalendarMonth className="w-3.5 h-3.5" /> Pemantauan Mingguan
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6">
              
              {/* TAB 1: IDENTITAS IBU */}
              {activeSubTab === 'ibu' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. JKN / BPJS</span>
                    {isEditing ? (
                      <input type="text" name="jkn_number" value={editForm.jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.jkn_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tempat Lahir</span>
                    {isEditing ? (
                      <input type="text" name="birth_place" value={editForm.birth_place} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.birth_place || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tanggal Lahir</span>
                    {isEditing ? (
                      <div className="relative overflow-visible z-50">
                        <CustomDatePicker value={editForm.birth_date} onChange={(val) => setEditForm((prev: any) => ({ ...prev, birth_date: val }))} outputFormat="iso" />
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.dob}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Golongan Darah</span>
                    {isEditing ? (
                      <select name="blood_type" value={editForm.blood_type} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer">
                        <option value="">Golongan Darah</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                        <option value="Tidak Tahu">Tidak Tahu</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                        <MdBloodtype className="w-4 h-4 text-status-red-solid" /> {mother.blood_type}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pendidikan</span>
                    {isEditing ? (
                      <input type="text" name="education" value={editForm.education} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.education || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pekerjaan</span>
                    {isEditing ? (
                      <input type="text" name="occupation" value={editForm.occupation} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.occupation || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Telepon / WA</span>
                    {isEditing ? (
                      <input type="text" name="phone_number" value={editForm.phone_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                        <MdPhone className="w-3.5 h-3.5 text-base-text-secondary" /> {mother.phone_number}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Faskes Tingkat 1</span>
                    {isEditing ? (
                      <input type="text" name="faskes_1" value={editForm.faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.faskes_1 || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Faskes Rujukan</span>
                    {isEditing ? (
                      <input type="text" name="faskes_referral" value={editForm.faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.faskes_referral || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Puskesmas Domisili</span>
                    {isEditing ? (
                      <input type="text" name="puskesmas_domicile" value={editForm.puskesmas_domicile} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.puskesmas_domicile || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Reg Kohort Ibu</span>
                    {isEditing ? (
                      <input type="text" name="cohort_register_number" value={editForm.cohort_register_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.cohort_register_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Catatan Medik RS</span>
                    {isEditing ? (
                      <input type="text" name="medical_record_number" value={editForm.medical_record_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.medical_record_number || "-"}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Alamat Rumah</span>
                    {isEditing ? (
                      <textarea name="address" value={editForm.address} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs resize-none" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.address || "-"}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Pembiayaan Lain</span>
                      {isEditing ? (
                        <input type="text" name="other_financing" value={editForm.other_financing} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.other_financing || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Asuransi Lain</span>
                      {isEditing ? (
                        <input type="text" name="insurance_other" value={editForm.insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.insurance_other || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Nomor Asuransi</span>
                      {isEditing ? (
                        <input type="text" name="insurance_number" value={editForm.insurance_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.insurance_number || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi</span>
                      {isEditing ? (
                        <input type="date" name="insurance_validity" value={editForm.insurance_validity} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs text-base-text-primary" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.insurance_validity || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IDENTITAS SUAMI */}
              {activeSubTab === 'husband' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nama Lengkap Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_name" value={editForm.husband_name} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_name || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">NIK Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_national_id" maxLength={16} value={editForm.husband_national_id} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_national_id || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. JKN / BPJS Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_jkn_number" value={editForm.husband_jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_jkn_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tempat Lahir Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_birth_place" value={editForm.husband_birth_place} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_birth_place || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tanggal Lahir Suami</span>
                    {isEditing ? (
                      <input type="date" name="husband_birth_date" value={editForm.husband_birth_date} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs text-base-text-primary" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_birth_date || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Golongan Darah Suami</span>
                    {isEditing ? (
                      <select name="husband_blood_type" value={editForm.husband_blood_type} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer">
                        <option value="">Golongan Darah</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                        <option value="Tidak Tahu">Tidak Tahu</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_blood_type || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pendidikan Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_education" value={editForm.husband_education} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_education || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Pekerjaan Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_occupation" value={editForm.husband_occupation} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_occupation || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nomor Telepon Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_phone_number" value={editForm.husband_phone_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_phone_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Faskes Tingkat 1 Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_faskes_1" value={editForm.husband_faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_1 || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Faskes Rujukan Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_faskes_referral" value={editForm.husband_faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_referral || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Catatan Medik RS Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_medical_record_number" value={editForm.husband_medical_record_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_medical_record_number || "-"}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Alamat Rumah Suami</span>
                    {isEditing ? (
                      <input type="text" name="husband_address" value={editForm.husband_address} onChange={handleInputChange} placeholder="Kosongkan jika sama dengan alamat ibu..." className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.husband_address || "-"}</p>
                    )}
                  </div>
                  
                  <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Pembiayaan Lain Suami</span>
                      {isEditing ? (
                        <input type="text" name="husband_other_financing" value={editForm.husband_other_financing} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.husband_other_financing || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Asuransi Lain Suami</span>
                      {isEditing ? (
                        <input type="text" name="husband_insurance_other" value={editForm.husband_insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_other || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Nomor Asuransi Suami</span>
                      {isEditing ? (
                        <input type="text" name="husband_insurance_number" value={editForm.husband_insurance_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_number || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi Suami</span>
                      {isEditing ? (
                        <input type="date" name="husband_insurance_validity" value={editForm.husband_insurance_validity} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs text-base-text-primary" />
                      ) : (
                        <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_validity || "-"}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RIWAYAT KESEHATAN IBU */}
              {activeSubTab === 'health' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Kehamilan Ke-</span>
                    {isEditing ? (
                      <input type="number" name="pregnancy_number" min="1" value={editForm.pregnancy_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{mother.pregnancy_number ?? "1"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Jumlah Anak Lahir Hidup</span>
                    {isEditing ? (
                      <input type="number" name="children_born_alive" min="0" value={editForm.children_born_alive} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{mother.children_born_alive ?? "0"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Riwayat Keguguran</span>
                    {isEditing ? (
                      <input type="number" name="miscarriage_history" min="0" value={editForm.miscarriage_history} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary bg-base-bg/30 px-3 py-1.5 rounded-lg inline-block">{mother.miscarriage_history ?? "0"} kali</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Jumlah Anak Hidup Posyandu</span>
                    {isEditing ? (
                      <input type="number" name="number_of_children" min="0" value={editForm.number_of_children} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{mother.number_of_children} anak</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Riwayat Penyakit Ibu</span>
                    {isEditing ? (
                      <textarea name="disease_history" value={editForm.disease_history} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs resize-none" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary italic">{mother.disease_history || "-"}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 border-t pt-3 mt-1 grid grid-cols-3 gap-4">
                    <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Status Ibu</span>
                      {isEditing ? (
                        <select name="ui_status" value={editForm.ui_status} onChange={handleInputChange} className="mt-1 w-full bg-base-white border text-center text-xs p-1 rounded cursor-pointer">
                          <option value="Calon Ibu">Calon Ibu</option>
                          <option value="Ibu Hamil">Ibu Hamil</option>
                          <option value="Ibu Nifas">Ibu Nifas</option>
                          <option value="Ibu Balita">Ibu Balita</option>
                        </select>
                      ) : (
                        <p className="text-xs font-bold text-base-text-primary mt-1">{mother.status}</p>
                      )}
                    </div>
                    <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Kondisi Risiko</span>
                      {isEditing ? (
                        <select name="risk_status" value={editForm.risk_status} onChange={handleInputChange} className="mt-1 w-full bg-base-white border text-center text-xs p-1 rounded cursor-pointer">
                          <option value="Normal">Normal</option>
                          <option value="KEK">KEK</option>
                          <option value="Risiko Tinggi">Risiko Tinggi</option>
                        </select>
                      ) : (
                        <span className={`inline-block mt-1 px-2 py-0.5 border text-[10px] font-bold rounded-full ${getConditionColor(displayCondition)}`}>
                          {displayCondition}
                        </span>
                      )}
                    </div>
                    <div className="bg-base-bg/30 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block">HPL / Bersalin</span>
                      {isEditing ? (
                        editForm.ui_status === "Ibu Hamil" ? (
                          <input type="date" name="estimated_due_date" value={editForm.estimated_due_date} onChange={handleInputChange} className="mt-1 w-full bg-base-white border text-center text-xs p-0.5 rounded" />
                        ) : (
                          <p className="text-xs text-base-text-secondary mt-1.5">Hanya Ibu Hamil</p>
                        )
                      ) : (
                        <p className="text-xs font-bold text-base-text-primary mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{mother.hpl}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CHECKLIST TTD */}
              {activeSubTab === 'ttd' && (() => {
                const totalDays = new Date(currentYear, currentMonth, 0).getDate();
                const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
                const monthsIndonesian = [
                  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];
                const monthName = monthsIndonesian[currentMonth - 1];

                return (
                  <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                    <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2">
                      <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                        <MdVaccines className="w-4 h-4" /> Kartu Minum Tablet Tambah Darah (TTD/MMS)
                      </h4>
                      <p className="text-base-text-secondary text-[11px] leading-relaxed">
                        Sesuai panduan Buku KIA 2024 Halaman 7. Ibu hamil wajib meminum paling sedikit 90 tablet tambah darah selama kehamilan untuk mencegah anemia dan mendukung perkembangan janin.
                      </p>
                    </div>

                    {/* Input Pendamping & Hubungan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-bg/20 p-4 rounded-xl border border-base-border/20">
                      <div className="space-y-1.5">
                        <label className="font-bold text-base-text-secondary">Nama Pendamping Minum TTD</label>
                        <input 
                          type="text" 
                          placeholder="Nama suami, orang tua, atau kader..."
                          value={ttdCompanion}
                          onChange={(e) => {
                            setTtdCompanion(e.target.value);
                            if (mother) {
                              localStorage.setItem(`ttd_companion_${mother.mother_id}`, e.target.value);
                            }
                          }}
                          className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-base-text-secondary">Hubungan dengan Ibu</label>
                        <select
                          value={ttdRelationship}
                          onChange={(e) => {
                            setTtdRelationship(e.target.value);
                            if (mother) {
                              localStorage.setItem(`ttd_relationship_${mother.mother_id}`, e.target.value);
                            }
                          }}
                          className="w-full bg-base-white border border-base-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:border-brand-primary text-base-text-primary transition appearance-none cursor-pointer"
                        >
                          <option value="Suami">Suami</option>
                          <option value="Orang Tua">Orang Tua / Ibu Kandung</option>
                          <option value="Mertua">Mertua</option>
                          <option value="Kader">Kader Posyandu</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    {/* Calendar Grid 1-31 */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-base-text-primary">
                          Lembar Pantauan: <span className="text-brand-primary">{monthName} {currentYear}</span>
                        </span>
                        <span className="text-[10px] text-base-text-secondary italic">
                          * Ketuk tanggal untuk menandai
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-2 text-center">
                        {daysArray.map((day) => {
                          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isTaken = ttdLogs.some((l: any) => l.intake_date === dateStr && l.taken);
                          const isToday = today.getDate() === day && today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear;

                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleTtd(day)}
                              className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer font-bold relative border ${
                                isTaken 
                                  ? "bg-brand-primary text-base-white border-brand-primary shadow-sm hover:bg-status-pink-dark" 
                                  : isToday
                                  ? "bg-base-white text-brand-primary border-brand-primary border-2 shadow-sm"
                                  : "bg-base-bg/30 text-base-text-secondary border-base-border/25 hover:border-brand-primary/40 hover:bg-base-bg/65"
                              }`}
                            >
                              <span className="text-xs">{day}</span>
                              {isTaken && (
                                <span className="text-[8px] mt-0.5 leading-none block font-medium uppercase text-pink-100">taken</span>
                              )}
                              {isToday && !isTaken && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-status-orange-solid animate-pulse" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 text-[10px] text-base-text-secondary border-t pt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-brand-primary" />
                        <span>Tablet Diminum</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded border border-brand-primary bg-base-white" />
                        <span>Hari Ini</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-base-bg/30 border border-base-border/25" />
                        <span>Belum Diminum</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 5: PEMANTAUAN MINGGUAN */}
              {activeSubTab === 'weekly' && (() => {
                const weeks = weeklyTrimesterFilter === 1
                  ? [4, 5, 6, 7, 8, 9, 10, 11, 12]
                  : weeklyTrimesterFilter === 2
                  ? [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
                  : [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];

                return (
                  <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                    {/* Filter Sub-Tabs */}
                    <div className="flex border-b text-[11px] font-bold text-base-text-secondary select-none">
                      <button
                        type="button"
                        onClick={() => setWeeklyTrimesterFilter(1)}
                        className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 1 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                      >
                        Trimester I (Mg 4-12)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeeklyTrimesterFilter(2)}
                        className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 2 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                      >
                        Trimester II (Mg 13-28)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeeklyTrimesterFilter(3)}
                        className={`flex-1 py-2.5 text-center border-b-2 transition cursor-pointer ${weeklyTrimesterFilter === 3 ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                      >
                        Trimester III (Mg 29-42)
                      </button>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                      <h4 className="font-bold text-xs text-brand-primary">
                        Lembar Pemantauan Ibu Hamil (Buku KIA Halaman 10-13)
                      </h4>
                      <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
                        Beri tanda centang (✓) pada kolom pelayanan kesehatan saat periksa/kelas ibu, serta centang kolom pemantauan mingguan jika Ibu merasakan kondisi/gejala tersebut selama minggu kehamilan.
                      </p>
                    </div>

                    {/* Horizontal Scrollable Table */}
                    <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-base-bg/40 text-[10px] font-bold text-base-text-secondary uppercase tracking-wider border-b border-base-border/20">
                            <th className="py-3 px-4 text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-24">Minggu Kehamilan</th>
                            <th className="py-3 px-3 text-center border-r border-base-border/20" colSpan={2}>Pelayanan Kesehatan</th>
                            <th className="py-3 px-3 text-center" colSpan={9}>Pemantauan Gejala / Kondisi</th>
                          </tr>
                          <tr className="bg-base-bg/25 text-[9px] font-bold text-base-text-secondary uppercase tracking-wider border-b border-base-border/20">
                            <th className="py-2.5 px-4 text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]"></th>
                            <th className="py-2.5 px-2 text-center w-28 border-r">Periksa Hamil</th>
                            <th className="py-2.5 px-2 text-center w-28 border-r border-base-border/20">Kelas Ibu Hamil</th>
                            
                            <th className="py-2.5 px-2 text-center w-24 border-r">Demam &gt;2 Hari</th>
                            <th className="py-2.5 px-2 text-center w-24 border-r">Pusing Berat</th>
                            <th className="py-2.5 px-2 text-center w-24 border-r">Cemas / Insomnia</th>
                            <th className="py-2.5 px-2 text-center w-28 border-r">Batuk &gt;2Mg / Kontak TB</th>
                            <th className="py-2.5 px-2 text-center w-28 border-r">Janin Kurang Gerak</th>
                            <th className="py-2.5 px-2 text-center w-24 border-r">Nyeri Perut Hebat</th>
                            <th className="py-2.5 px-2 text-center w-28 border-r">Cairan Berbau/Banyak</th>
                            <th className="py-2.5 px-2 text-center w-28 border-r">Nyeri Kencing/Gatal</th>
                            <th className="py-2.5 px-2 text-center">Diare Berulang</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-base-border/10 font-medium">
                          {weeks.map((week) => {
                            const record = weeklyLogs.find((l: any) => l.week_number === week) || {};
                            const isFetalMovementDisabled = week < 24;

                            return (
                              <tr key={week} className="hover:bg-base-bg/15 transition-colors">
                                <td className="py-3 px-4 font-extrabold text-brand-primary text-center sticky left-0 bg-base-white z-10 border-r border-base-border/20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                  Minggu {week}
                                </td>
                                
                                <td className="py-3 px-2 text-center border-r">
                                  <input
                                    type="checkbox"
                                    checked={!!record.check_pregnancy}
                                    onChange={() => handleToggleWeekly(week, "check_pregnancy")}
                                    className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r border-base-border/20">
                                  <input
                                    type="checkbox"
                                    checked={!!record.check_class}
                                    onChange={() => handleToggleWeekly(week, "check_class")}
                                    className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/20 cursor-pointer"
                                  />
                                </td>

                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.fever}
                                    onChange={() => handleToggleWeekly(week, "fever")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.headache}
                                    onChange={() => handleToggleWeekly(week, "headache")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.insomnia}
                                    onChange={() => handleToggleWeekly(week, "insomnia")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.cough}
                                    onChange={() => handleToggleWeekly(week, "cough")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  {isFetalMovementDisabled ? (
                                    <span className="text-[10px] text-base-text-secondary/40 font-semibold">-</span>
                                  ) : (
                                    <input
                                      type="checkbox"
                                      checked={!!record.fetal_movement}
                                      onChange={() => handleToggleWeekly(week, "fetal_movement")}
                                      className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                    />
                                  )}
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.stomach_pain}
                                    onChange={() => handleToggleWeekly(week, "stomach_pain")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.fluid_discharge}
                                    onChange={() => handleToggleWeekly(week, "fluid_discharge")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center border-r bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.urination_pain}
                                    onChange={() => handleToggleWeekly(week, "urination_pain")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-2 text-center bg-status-red-light/5">
                                  <input
                                    type="checkbox"
                                    checked={!!record.diarrhea}
                                    onChange={() => handleToggleWeekly(week, "diarrhea")}
                                    className="w-4 h-4 rounded text-status-red-solid border-base-border/40 focus:ring-status-red-solid/20 cursor-pointer"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Warning Notice */}
                    <div className="bg-status-red-light/10 border border-status-red-solid/15 rounded-xl p-3.5 flex items-start gap-2.5 text-status-red-solid text-[11px] leading-relaxed">
                      <span className="text-sm">⚠️</span>
                      <p className="font-medium text-xs">
                        <strong>PENTING:</strong> Jika Ibu hamil mencentang salah satu gejala pada kolom <strong>Pemantauan Gejala / Kondisi</strong>, segeralah berkonsultasi ke bidan posyandu atau periksa ke Puskesmas/Rumah Sakit terdekat untuk penanganan medis dini.
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>
          </div>

        </div>

        {/* Right Column: Daftar Anak Kandung (Col span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Daftar Anak Kandung Terhubung */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                <div className="flex items-center gap-2">
                  <FaUserCouple className="w-5 h-5 text-brand-primary" />
                  <h2 className="font-bold text-base-text-primary text-base">Balita Saya</h2>
                </div>
                <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                  {mother.children.length} Balita
                </span>
              </div>

              {mother.children.length === 0 ? (
                <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center text-sm text-base-text-secondary">
                  Belum ada data anak terdaftar yang terhubung dengan rekam medis Ibu ini.
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
            
            <div className="text-xs text-base-text-secondary mt-4 leading-relaxed italic">
              * Anak terdaftar di atas terhubung otomatis melalui data Posyandu.
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
