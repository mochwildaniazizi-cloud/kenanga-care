"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { getMotherDetail, updateMother } from "@/app/actions/mothers";
import { 
  MdArrowBack, MdPerson, MdCalendarToday, MdPhone, 
  MdPregnantWoman, MdBloodtype, MdOutlineError, MdFemale, MdMale,
  MdEdit, MdSave, MdClose, MdCheckCircleOutline, MdCameraAlt, MdHome, MdInfo,
  MdVaccines, MdCalendarMonth, MdBabyChangingStation, MdFamilyRestroom, MdScale, MdAdd,
  MdWarning, MdMedication
} from "react-icons/md";
import { getTtdLogs, upsertTtdLog } from "@/app/actions/ttd";
import { getWeeklyMonitorings, upsertWeeklyMonitoring } from "@/app/actions/weekly";
import { FaUserFriends, FaHeartbeat, FaUser, FaUserFriends as FaUserCouple, FaFileMedical } from "react-icons/fa";
import CustomDatePicker from "@/components/CustomDatePicker";
import { getCacheItem, setCacheItem } from "@/lib/db/dexieDb";

function MotherDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") || "";
  const { role } = useUserRole();
  const [mother, setMother] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'ibu' | 'husband' | 'health'>('ibu');
  const [activePemantauanTab, setActivePemantauanTab] = useState<'ttd' | 'weekly' | 'attendance' | 'birth_prep' | 'birth_process' | 'postpartum' | 'kb' | 'breastfeeding'>('ttd');
  const [breastfeedingAnswers, setBreastfeedingAnswers] = useState<boolean[]>(new Array(12).fill(false));
  
  const [attendance, setAttendance] = useState<any[]>([
    { date: "", facilitator: "", note: "" },
    { date: "", facilitator: "", note: "" },
    { date: "", facilitator: "", note: "" }
  ]);
  const [editingAttendanceIdx, setEditingAttendanceIdx] = useState<number | null>(null);
  const [prepList, setPrepList] = useState<boolean[]>(new Array(10).fill(false));
  const [birthProcessList, setBirthProcessList] = useState<boolean[]>(new Array(7).fill(false));
  
  const [postpartumFilter, setPostpartumFilter] = useState<number>(1); // Week 1-6
  const [postpartumList, setPostpartumList] = useState<any[]>(
    new Array(42).fill(null).map((_, i) => ({
      day: i + 1,
      pemeriksaan_nifas: false,
      vitamin_a: false,
      ttd: false,
      gizi_sesuai: false,
      masalah_jiwa: false,
      demam: false,
      sakit_kepala: false,
      pandangan_kabur: false,
      nyeri_ulu_hati: false,
      jantung_berdebar: false,
      napas_pendek: false,
      payudara_bengkak: false,
      gangguan_bak: false,
      kelamin_bengkak: false,
      darah_bau: false,
      konstipasi_diare: false,
      keputihan: false
    }))
  );
  const [kbAnswers, setKbAnswers] = useState<boolean[]>(new Array(3).fill(false));
  const [kbConsent, setKbConsent] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const cachedAttendance = localStorage.getItem(`attendance_class_ibu_hamil_${id}`);
    if (cachedAttendance) {
      try {
        const parsed = JSON.parse(cachedAttendance);
        const normalized = parsed.map((item: any) => ({
          date: item.date || "",
          facilitator: item.facilitator || "",
          note: item.note || ""
        }));
        setAttendance(normalized);
      } catch (e) {}
    } else {
      setAttendance([
        { date: "", facilitator: "", note: "" },
        { date: "", facilitator: "", note: "" },
        { date: "", facilitator: "", note: "" }
      ]);
    }

    const list = [];
    for(let i=1; i<=10; i++) {
      list.push(localStorage.getItem(`birth_prep_${i}_${id}`) === 'true');
    }
    setPrepList(list);

    const processList = [];
    for(let i=1; i<=7; i++) {
      processList.push(localStorage.getItem(`birth_process_${i}_${id}`) === 'true');
    }
    setBirthProcessList(processList);

    const cachedPostpartum = localStorage.getItem(`postpartum_monitoring_${id}`);
    if (cachedPostpartum) {
      try {
        setPostpartumList(JSON.parse(cachedPostpartum));
      } catch (e) {}
    }

    const cachedKbAnswers = localStorage.getItem(`kb_answers_${id}`);
    if (cachedKbAnswers) {
      try {
        setKbAnswers(JSON.parse(cachedKbAnswers));
      } catch (e) {}
    }

    const cachedKbConsent = localStorage.getItem(`kb_consent_${id}`);
    if (cachedKbConsent) {
      setKbConsent(cachedKbConsent === 'true');
    }

    const cachedBreastfeeding = localStorage.getItem(`breastfeeding_monitoring_${id}`);
    if (cachedBreastfeeding) {
      try {
        setBreastfeedingAnswers(JSON.parse(cachedBreastfeeding));
      } catch (e) {}
    }
  }, [id]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const [ttdLogs, setTtdLogs] = useState<any[]>([]);
  const [ttdCompanion, setTtdCompanion] = useState("");
  const [ttdRelationship, setTtdRelationship] = useState("Suami");
  const [isEditingCompanion, setIsEditingCompanion] = useState(false);

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

      // Attempt load full cached detail from Dexie.js (IndexedDB)
      const cached = await getCacheItem(`offline_mother_detail_${decodedId}`);
      if (cached) {
        setMother(cached);
        setIsLoading(false);
      } else {
        // Build basic mother fallback from master list cache in Dexie.js
        const cachedList = await getCacheItem("offline_mothers_list");
        if (cachedList) {
          const basicMother = cachedList.find((m: any) => m.mother_id === decodedId);
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
          await setCacheItem(`offline_mother_detail_${decodedId}`, data);
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

  const lastRecord = mother?.maternal_records && mother.maternal_records.length > 0 ? mother.maternal_records[0] : null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
      
      {/* Offline Warning Banner */}
      {!navigator.onLine && (
        <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <MdWarning className="text-status-orange-solid text-sm flex-shrink-0" />
          <span>Mode Offline: Menampilkan rekam medis lokal dari memori peramban. Anda tetap bisa mengubah profil ibu secara offline.</span>
        </div>
      )}

      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/20 pb-4">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => {
              if (activeSection !== "") {
                router.push(`/data-ibu/${mother.mother_id}`);
              } else {
                router.push("/data-ibu");
              }
            }}
            className="p-2.5 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary bg-base-white rounded-xl hover:bg-brand-soft/20 transition cursor-pointer shrink-0"
          >
            <MdArrowBack className="w-5 h-5" />
          </button>
          
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
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/perjalanan-ibu/rekam-medis?mother_id=${mother.mother_id}`}
            className="px-4 py-2 bg-[#EA2986] text-white hover:bg-[#d41f76] rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>🏥 Rekam Medis (EHR)</span>
          </Link>
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

      {/* Sub-section Title Header when focused */}
      {activeSection !== "" && (
        <div className="flex items-center gap-3 border-b pb-3 mb-4 select-none">
          <button
            type="button"
            onClick={() => router.push(`/data-ibu/${mother.mother_id}`)}
            className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition cursor-pointer flex items-center justify-center bg-base-white shadow-sm"
          >
            <MdArrowBack className="w-4 h-4" />
          </button>
          <span className="text-xs font-black uppercase tracking-wider text-base-text-secondary font-bold">
            {activeSection === "biodata" && "Biodata Ibu & Keluarga"}
            {activeSection === "medical" && "Riwayat Medis & Jaminan"}
            {activeSection === "ttd" && "Suplemen TTD / MMS"}
            {activeSection === "weekly" && "Pemantauan Mingguan"}
            {activeSection === "attendance" && "Kelas Ibu Hamil"}
            {activeSection === "birth_prep" && "Perencanaan & Proses Persalinan"}
            {activeSection === "postpartum" && "Pemeriksaan Nifas & KB Pasca Salin"}
            {activeSection === "breastfeeding" && "ASI & Nutrisi Ibu"}
          </span>
        </div>
      )}

      {/* VIEW: MAIN DASHBOARD HUB */}
      {activeSection === "" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Stats Bento Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm bg-base-white">
              <div className="w-10 h-10 rounded-xl bg-brand-soft/30 text-brand-primary flex items-center justify-center shrink-0">
                <MdCalendarMonth className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">HPL / EDD</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5 truncate">{mother.hpl || "-"}</p>
              </div>
            </div>

            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm bg-base-white">
              <div className="w-10 h-10 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center shrink-0">
                <MdFemale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Lingkar Lengan (LiLA)</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.muac ? `${lastRecord.muac} cm` : "-"}</p>
              </div>
            </div>

            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm bg-base-white">
              <div className="w-10 h-10 rounded-xl bg-status-yellow-light text-status-yellow-solid flex items-center justify-center shrink-0">
                <MdScale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Berat Badan Ibu</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.weight ? `${lastRecord.weight} kg` : "-"}</p>
              </div>
            </div>

            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm bg-base-white">
              <div className="w-10 h-10 rounded-xl bg-status-red-light text-status-red-solid flex items-center justify-center shrink-0">
                <FaHeartbeat className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Tekanan Darah</span>
                <p className="text-sm font-black text-base-text-primary mt-0.5">{lastRecord?.blood_pressure || "-"}</p>
              </div>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-base-text-primary font-bold">Kurikulum Pemantauan Kesehatan Ibu Hamil</h2>
              <p className="text-xs text-base-text-secondary font-semibold">Pilih modul kartu di bawah untuk mengisi data check-up harian dan melihat perkembangan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Card 1: Biodata Ibu & Keluarga */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=biodata`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FFCC00] rounded-full"></span> BIODATA IBU</span>
                  <span>Profil</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FFCC00] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    IDENTITAS IBU &amp; SUAMI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Identitas Ibu &amp; Suami</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Informasi data diri lengkap Ibu, suami, faskes rujukan domisili, nomor HP, pekerjaan, dan daftar balita terhubung.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👩
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-yellow-50 text-status-yellow-solid">
                        {mother.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Lengkapi Data</span>
                    <span>Ubah Profil</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Riwayat Medis & Jaminan */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=medical`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-status-red-solid rounded-full"></span> RIWAYAT MEDIS</span>
                  <span>BPJS &amp; Risiko</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-status-red-solid h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    RIWAYAT KESEHATAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Riwayat Kesehatan &amp; Kunjungan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Catatan rekam medis pemeriksaan fisik kehamilan (BB, tensi, Lila, DJJ, tablet Fe) serta nomor JKN/BPJS.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-red-light text-status-red-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🩺
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg ${getConditionColor(displayCondition)}`}>
                        {displayCondition}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>{mother.maternal_records.length} Pemeriksaan</span>
                    <span>Lihat Riwayat</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Tablet Tambah Darah (TTD) */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=ttd`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FF2D55] rounded-full"></span> TABLET Fe</span>
                  <span>Fe / MMS</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FF2D55] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    SUPLEMEN BESI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Checklist Minum TTD</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log minum harian tablet besi Fe/MMS (min. 90 tablet selama kehamilan) beserta identitas pendamping minum obat.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-pink-light text-brand-primary flex items-center justify-center text-[10px] font-bold border border-base-white">
                          <MdMedication className="text-brand-primary text-sm" />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-pink-50 text-[#FF2D55]">
                        {ttdLogs.filter((l: any) => l.taken).length} Diminum
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Buka Kartu Kontrol</span>
                    <span>Tandai Hari Ini</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Pemantauan Mingguan */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=weekly`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></span> MINGGUAN</span>
                  <span>Gejala &amp; Tanda Bahaya</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#007AFF] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    PEMANTAUAN MANDIRI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Gejala Mingguan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log gejala rutin (tensi, bengkak kaki, pergerakan janin, pusing) di setiap minggu kehamilan Trimester 1, 2, dan 3.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-blue-light text-status-blue-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          📅
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#007AFF]">
                        Mg {weeklyLogs.length > 0 ? weeklyLogs[weeklyLogs.length - 1].week_number : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>{weeklyLogs.length} Log Tercatat</span>
                    <span>Buka Lembar</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Kelas Ibu Hamil */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=attendance`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#5856D6] rounded-full"></span> KELAS IBU</span>
                  <span>Absensi</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#5856D6] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    KELAS IBU HAMIL
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Absensi Kehadiran Kelas</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log partisipasi materi edukasi antenatal harian (Trimester 1, 2, dan 3) yang dibimbing bidan/kader.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🎓
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-[#5856D6]">
                        {attendance.filter((r: any) => !!r.date).length} / 3 Selesai
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Buka Absensi</span>
                    <span>Ubah Absensi</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Persiapan Persalinan */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=birth_prep`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CD964] rounded-full"></span> PERSALINAN</span>
                  <span>P4K &amp; Rencana</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CD964] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    RENCANA PERSALINAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Persiapan &amp; Proses Lahir</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Checklist mandiri persiapan logistik persalinan (P4K, pendonor, transportasi, dana, jaminan) &amp; panduan proses persalinan.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-green-light text-status-green-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🏠
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-[#4CD964]">
                        {prepList.filter(Boolean).length} / 10 Siap
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Buka Rencana Lahir</span>
                    <span>Lihat Panduan</span>
                  </div>
                </div>
              </div>

              {/* Card 7: Nifas & KB */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=postpartum`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4A90E2] rounded-full"></span> PASCA SALIN</span>
                  <span>Nifas &amp; KB</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4A90E2] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    MASA NIFAS &amp; KB
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Nifas &amp; KB</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log pemantauan harian nifas 42 hari (vitamin A, tanda bahaya nifas) serta rencana/persetujuan kontrasepsi KB pasca bersalin.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-base-white">
                          🍼
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#4A90E2]">
                        {kbConsent ? "KB Disetujui" : "Belum KB"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Pantau Nifas</span>
                    <span>Rencana KB</span>
                  </div>
                </div>
              </div>

              {/* Card 8: Menyusui & Nutrisi */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}?section=breastfeeding`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#50E3C2] rounded-full"></span> MENYUSUI</span>
                  <span>ASI &amp; Gizi</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#50E3C2] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    ASI &amp; NUTRISI IBU
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Pemantauan Menyusui &amp; Porsi Makan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Checklist teknik pelekatan posisi menyusui ASI eksklusif dan evaluasi pemenuhan nutrisi porsi makan harian ibu menyusui.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👩‍🍼
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-[#50E3C2]">
                        {breastfeedingAnswers.filter(Boolean).length} / 12 Terpenuhi
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <span>Buka Panduan ASI</span>
                    <span>Ubah Log Gizi</span>
                  </div>
                </div>
              </div>

              {/* Card 9: Rekam Medis Klinis EHR */}
              <div 
                onClick={() => router.push(`/data-ibu/${mother.mother_id}/pemeriksaan-klinis`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#AC1959] rounded-full"></span> EHR KLINIS</span>
                  <span>Catatan Nakes</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#AC1959] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    REKAM MEDIS ELEKTRONIK (EHR)
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">EHR ANC, USG &amp; Preeklampsia</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Lihat rekam medis formal hasil pemeriksaan dokter/bidan meliputi USG, log ANC lengkap, skrining preeklampsia, dan masa nifas.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="w-6 h-6 rounded-full bg-pink-100 text-[#AC1959] flex items-center justify-center text-[10px] font-bold border border-base-white">
                        🩺
                      </div>
                      <span className="text-[10px] font-bold text-[#AC1959] hover:underline">Buka EHR &gt;</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW: BIODATA & KELUARGA */}
      {activeSection === "biodata" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-base-text-primary">Identitas Lengkap Ibu</h3>
              {!isEditing && role !== "ibu" && (
                <button 
                  type="button" 
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <MdEdit className="w-3.5 h-3.5" /> Edit Biodata
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-base-text-secondary block">No. JKN / BPJS</span>
                {isEditing ? (
                  <input type="text" name="jkn_number" value={editForm.jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.jkn_number || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Tempat Lahir</span>
                {isEditing ? (
                  <input type="text" name="birth_place" value={editForm.birth_place} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
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
                  <select name="blood_type" value={editForm.blood_type} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer text-base-text-primary">
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
                  <input type="text" name="education" value={editForm.education} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.education || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Pekerjaan</span>
                {isEditing ? (
                  <input type="text" name="occupation" value={editForm.occupation} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.occupation || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">No. Telepon / WA</span>
                {isEditing ? (
                  <input type="text" name="phone_number" value={editForm.phone_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary flex items-center gap-1">
                    <MdPhone className="w-3.5 h-3.5 text-base-text-secondary" /> {mother.phone_number}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Alamat Rumah Ibu</span>
                {isEditing ? (
                  <textarea name="address" value={editForm.address} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs resize-none bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.address || "-"}</p>
                )}
              </div>

              {/* Faskes and Cohort details for mother */}
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Fasilitas Kesehatan TK1</span>
                {isEditing ? (
                  <input type="text" name="faskes_1" value={editForm.faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.faskes_1 || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Fasilitas Kesehatan Rujukan</span>
                {isEditing ? (
                  <input type="text" name="faskes_referral" value={editForm.faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.faskes_referral || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Puskesmas Domisili</span>
                {isEditing ? (
                  <input type="text" name="puskesmas_domicile" value={editForm.puskesmas_domicile} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.puskesmas_domicile || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">No. Reg. Kohort Ibu</span>
                {isEditing ? (
                  <input type="text" name="cohort_register_number" value={editForm.cohort_register_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.cohort_register_number || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">No. Catatan Medik RS</span>
                {isEditing ? (
                  <input type="text" name="medical_record_number" value={editForm.medical_record_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.medical_record_number || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Asuransi Lain</span>
                {isEditing ? (
                  <input type="text" name="insurance_other" value={editForm.insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.insurance_other || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Nomor Asuransi Lain</span>
                {isEditing ? (
                  <input type="text" name="insurance_number" value={editForm.insurance_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.insurance_number || "-"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi</span>
                {isEditing ? (
                  <input type="date" name="insurance_validity" value={editForm.insurance_validity} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary">{mother.insurance_validity || "-"}</p>
                )}
              </div>
            </div>

            {/* Husband details inside biodata page */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-bold text-sm text-base-text-primary border-b pb-2">Identitas Lengkap Suami</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Nama Lengkap Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_name" value={editForm.husband_name} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_name || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">NIK Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_national_id" maxLength={16} value={editForm.husband_national_id} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_national_id || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">No. JKN / BPJS Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_jkn_number" value={editForm.husband_jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_jkn_number || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Nomor Telepon Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_phone_number" value={editForm.husband_phone_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_phone_number || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Tempat Lahir Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_birth_place" value={editForm.husband_birth_place} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_birth_place || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Tanggal Lahir Suami</span>
                  {isEditing ? (
                    <input type="date" name="husband_birth_date" value={editForm.husband_birth_date} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_birth_date || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Pendidikan Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_education" value={editForm.husband_education} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_education || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Pekerjaan Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_occupation" value={editForm.husband_occupation} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_occupation || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Alamat Rumah Suami</span>
                  {isEditing ? (
                    <textarea name="husband_address" value={editForm.husband_address} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs resize-none bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_address || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Golongan Darah Suami</span>
                  {isEditing ? (
                    <select name="husband_blood_type" value={editForm.husband_blood_type} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white cursor-pointer text-base-text-primary">
                      <option value="-">-</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option>
                    </select>
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_blood_type || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Fasilitas Kesehatan TK1 Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_faskes_1" value={editForm.husband_faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_1 || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Fasilitas Kesehatan Rujukan Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_faskes_referral" value={editForm.husband_faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_referral || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Puskesmas Domisili Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_faskes_primary" value={editForm.husband_faskes_primary} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_primary || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">No. Catatan Medik RS Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_faskes_secondary" value={editForm.husband_faskes_secondary} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_faskes_secondary || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Asuransi Lain Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_insurance_other" value={editForm.husband_insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_other || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Nomor Asuransi Lain Suami</span>
                  {isEditing ? (
                    <input type="text" name="husband_insurance_number" value={editForm.husband_insurance_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_number || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi Suami</span>
                  {isEditing ? (
                    <input type="date" name="husband_insurance_validity" value={editForm.husband_insurance_validity} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs bg-base-white text-base-text-primary" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{mother.husband_insurance_validity || "-"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>



        </div>
      )}

      {/* VIEW: RIWAYAT MEDIS & JAMINAN */}
      {activeSection === "medical" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-base-text-primary">Riwayat Kehamilan &amp; Status Risiko Kesehatan</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-medium">
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Kehamilan Ke-</span>
                {isEditing ? (
                  <input type="number" name="pregnancy_number" min="1" value={editForm.pregnancy_number} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-lg font-black text-base-text-primary">{mother.pregnancy_number ?? "1"}</p>
                )}
              </div>
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Jumlah Anak Lahir Hidup</span>
                {isEditing ? (
                  <input type="number" name="children_born_alive" min="0" value={editForm.children_born_alive} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-lg font-black text-base-text-primary">{mother.children_born_alive ?? "0"}</p>
                )}
              </div>
              <div className="space-y-1 bg-base-bg/20 p-4 rounded-xl">
                <span className="text-base-text-secondary block">Riwayat Keguguran</span>
                {isEditing ? (
                  <input type="number" name="miscarriage_history" min="0" value={editForm.miscarriage_history} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-xs bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-lg font-black text-base-text-primary">{mother.miscarriage_history ?? "0"} kali</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium border-t pt-4">
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Riwayat Penyakit Kronis</span>
                {isEditing ? (
                  <textarea name="disease_history" value={editForm.disease_history} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border rounded-lg focus:outline-none focus:border-brand-primary text-xs resize-none bg-base-white text-base-text-primary" />
                ) : (
                  <p className="text-sm font-bold text-base-text-primary italic">{mother.disease_history || "Tidak ada riwayat penyakit"}</p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-base-text-secondary block">Status Risiko Kehamilan</span>
                <span className={`inline-block mt-1 px-3 py-1 border text-xs font-bold rounded-full ${getConditionColor(displayCondition)}`}>
                  {displayCondition}
                </span>
              </div>
            </div>
          </div>

          {/* Maternal Records Table inside Section */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
              <div className="flex items-center gap-2">
                <FaHeartbeat className="w-5 h-5 text-status-red-solid" />
                <h2 className="font-bold text-base-text-primary text-base">Riwayat Kunjungan Pemeriksaan Ibu Hamil</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
                <thead>
                  <tr className="border-b border-gray-100 font-bold text-base-text-secondary uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal Periksa</th>
                    <th className="py-3 px-4 text-center">BB (kg)</th>
                    <th className="py-3 px-4 text-center">TD (Tensi)</th>
                    <th className="py-3 px-4 text-center">Lila (cm)</th>
                    <th className="py-3 px-4 text-center">Fundus (cm)</th>
                    <th className="py-3 px-4 text-center">DJJ (Janin)</th>
                    <th className="py-3 px-4 text-center">Tablet Fe</th>
                    <th className="py-3 px-4">Catatan Posyandu</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold">
                  {mother.maternal_records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-base-text-secondary">Belum ada riwayat pemeriksaan.</td>
                    </tr>
                  ) : (
                    mother.maternal_records.map((r: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-base-text-primary whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4 text-center text-brand-primary">{r.weight > 0 ? `${r.weight} kg` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-primary">{r.blood_pressure}</td>
                        <td className="py-3 px-4 text-center text-base-text-primary">{r.muac > 0 ? `${r.muac} cm` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.fundal_height > 0 ? `${r.fundal_height} cm` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.fetal_heart_rate > 0 ? `${r.fetal_heart_rate} x/mnt` : "-"}</td>
                        <td className="py-3 px-4 text-center text-base-text-secondary">{r.iron_pills_given > 0 ? `${r.iron_pills_given} butir` : "-"}</td>
                        <td className="py-3 px-4 text-base-text-secondary italic">{r.cadre_notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TABLET TAMBAH DARAH */}
      {activeSection === "ttd" && (() => {
        const totalDays = new Date(currentYear, currentMonth, 0).getDate();
        const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
        const monthsIndonesian = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        const monthName = monthsIndonesian[currentMonth - 1];

        return (
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="space-y-5 text-xs">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5 font-bold">
                  <MdVaccines className="w-4 h-4" /> Kartu Minum Tablet Tambah Darah (TTD/MMS)
                </h4>
                <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                  Sesuai panduan Buku KIA 2024 Halaman 7. Ibu hamil wajib meminum paling sedikit 90 tablet tambah darah selama kehamilan untuk mencegah anemia dan mendukung perkembangan janin.
                </p>
              </div>

              {/* Input Pendamping & Hubungan */}
              <div className="bg-base-bg/20 p-4 rounded-xl border border-base-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase">Nama Pendamping Minum TTD</span>
                    {isEditingCompanion ? (
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
                        className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary text-base-text-primary transition"
                      />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{ttdCompanion || "Belum diatur"}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-base-text-secondary uppercase">Hubungan dengan Ibu</span>
                    {isEditingCompanion ? (
                      <select
                        value={ttdRelationship}
                        onChange={(e) => {
                          setTtdRelationship(e.target.value);
                          if (mother) {
                            localStorage.setItem(`ttd_relationship_${mother.mother_id}`, e.target.value);
                          }
                        }}
                        className="w-full bg-base-white border border-base-border/40 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand-primary text-base-text-primary transition appearance-none cursor-pointer"
                      >
                        <option value="Suami">Suami</option>
                        <option value="Orang Tua">Orang Tua / Ibu Kandung</option>
                        <option value="Mertua">Mertua</option>
                        <option value="Kader">Kader Posyandu</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{ttdRelationship || "Suami"}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center self-end md:self-center">
                  {isEditingCompanion ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingCompanion(false)}
                      className="px-4 py-2 bg-brand-primary text-base-white hover:bg-status-pink-dark text-xs font-bold rounded-lg shadow-sm cursor-pointer transition"
                    >
                      Selesai
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingCompanion(true)}
                      className="px-3.5 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5"
                    >
                      <MdEdit className="w-3.5 h-3.5" /> Ubah Pendamping
                    </button>
                  )}
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
          </div>
        );
      })()}

      {/* VIEW: PEMANTAUAN MINGGUAN */}
      {activeSection === "weekly" && (() => {
        const weeks = weeklyTrimesterFilter === 1
          ? [4, 5, 6, 7, 8, 9, 10, 11, 12]
          : weeklyTrimesterFilter === 2
          ? [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
          : [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];

        return (
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
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
              <h4 className="font-bold text-xs text-brand-primary font-bold">
                Lembar Pemantauan Hamil Mingguan (Buku KIA Hal 10-13)
              </h4>
              <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">
                Centang pelayanan kesehatan periksa/kelas ibu, serta tanda/gejala jika Ibu merasakannya selama minggu kehamilan tersebut.
              </p>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto border border-base-border/20 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse min-w-[1000px] text-xs">
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
                    <th className="py-2.5 px-2 text-center w-28 border-r">Batuk &gt;2Mg</th>
                    <th className="py-2.5 px-2 text-center w-28 border-r">Janin Kurang Gerak</th>
                    <th className="py-2.5 px-2 text-center w-24 border-r">Nyeri Perut Hebat</th>
                    <th className="py-2.5 px-2 text-center w-28 border-r">Cairan Berbau</th>
                    <th className="py-2.5 px-2 text-center w-28 border-r">Nyeri Kencing</th>
                    <th className="py-2.5 px-2 text-center">Diare Berulang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-border/10 font-semibold">
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
            <div className="bg-status-red-light/10 border border-status-red-solid/15 rounded-xl p-3.5 flex items-start gap-2.5 text-status-red-solid leading-relaxed">
              <MdWarning className="text-sm flex-shrink-0 mt-0.5" />
              <p className="font-semibold text-xs">
                <strong>PENTING:</strong> Jika Ibu hamil mencentang salah satu gejala pada kolom <strong>Pemantauan Gejala / Kondisi</strong>, segeralah berkonsultasi ke bidan posyandu atau periksa ke Puskesmas/Rumah Sakit terdekat untuk penanganan medis dini.
              </p>
            </div>
          </div>
        );
      })()}
      {/* VIEW: KELAS IBU HAMIL */}
      {activeSection === "attendance" && (() => {
        const handleAddAttendanceClass = () => {
          const updated = [...attendance, { date: "", facilitator: "", note: "" }];
          setAttendance(updated);
          setEditingAttendanceIdx(updated.length - 1);
          if (id) {
            localStorage.setItem(`attendance_class_ibu_hamil_${id}`, JSON.stringify(updated));
          }
        };

        const handleDeleteAttendanceClass = (idx: number) => {
          const updated = attendance.filter((_, i) => i !== idx);
          setAttendance(updated);
          if (editingAttendanceIdx === idx) {
            setEditingAttendanceIdx(null);
          } else if (editingAttendanceIdx !== null && editingAttendanceIdx > idx) {
            setEditingAttendanceIdx(editingAttendanceIdx - 1);
          }
          if (id) {
            localStorage.setItem(`attendance_class_ibu_hamil_${id}`, JSON.stringify(updated));
          }
        };

        const handleSaveSingleAttendance = (idx: number) => {
          setEditingAttendanceIdx(null);
          if (id) {
            localStorage.setItem(`attendance_class_ibu_hamil_${id}`, JSON.stringify(attendance));
          }
        };

        const handleAttendanceChange = (idx: number, field: 'date' | 'facilitator' | 'note', value: string) => {
          const updated = [...attendance];
          updated[idx] = {
            ...updated[idx],
            [field]: value
          };
          setAttendance(updated);
        };

        return (
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-6 animate-in fade-in duration-200 text-xs">
            <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
              <h4 className="font-bold text-sm text-brand-primary flex items-center gap-1.5">
                <MdFamilyRestroom className="w-4 h-4" /> Pemantauan Kehadiran Kelas Ibu Hamil (Pantauan Kader)
              </h4>
              <p className="text-base-text-secondary text-[11px] leading-relaxed font-semibold">
                Ibu hamil disarankan mengikuti minimal 3 kali pertemuan kelas ibu hamil untuk pembekalan persalinan, menyusui, dan perawatan bayi.
              </p>
            </div>

            <div className="flex items-center justify-between border-b pb-3 border-base-border/10">
              <span className="font-bold text-base-text-primary text-sm uppercase">Log Kelas Ibu Hamil</span>
              <button 
                onClick={handleAddAttendanceClass}
                className="px-4 py-2 bg-brand-primary hover:bg-status-pink-dark text-base-white font-bold rounded-xl flex items-center gap-1 shadow-sm transition cursor-pointer text-xs"
              >
                <MdAdd className="w-4 h-4" /> Tambah Data Kelas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
              {attendance.map((classItem, idx) => {
                const isEditing = editingAttendanceIdx === idx;
                return (
                  <div key={idx} className="border border-base-border/30 rounded-2xl p-4 bg-base-bg/5 space-y-4 relative flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2 border-base-border/10">
                        <span className="font-black text-brand-primary text-xs uppercase">Pertemuan Ke-{idx + 1}</span>
                        {!isEditing && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setEditingAttendanceIdx(idx)}
                              className="p-1.5 text-brand-primary hover:bg-brand-soft rounded-lg transition"
                              title="Edit Pertemuan"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm("Apakah Anda yakin ingin menghapus kelas pertemuan ini?")) {
                                  handleDeleteAttendanceClass(idx);
                                }
                              }}
                              className="p-1.5 text-status-red-solid hover:bg-status-red-solid/10 rounded-lg transition"
                              title="Hapus Pertemuan"
                            >
                              <MdClose className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary uppercase">Tanggal Kelas</span>
                            <CustomDatePicker
                              value={classItem.date}
                              onChange={(val) => handleAttendanceChange(idx, "date", val)}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary uppercase">Fasilitator</span>
                            <input 
                              type="text" 
                              placeholder="Nama Bidan / Dokter..."
                              value={classItem.facilitator || ""}
                              onChange={(e) => handleAttendanceChange(idx, "facilitator", e.target.value)}
                              className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white text-xs font-bold text-base-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary uppercase">Catatan</span>
                            <input 
                              type="text" 
                              placeholder="Catatan kelas..."
                              value={classItem.note || ""}
                              onChange={(e) => handleAttendanceChange(idx, "note", e.target.value)}
                              className="w-full px-3 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white text-xs font-bold text-base-text-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary block">Tanggal Kelas</span>
                            <p className="text-sm font-black text-base-text-primary">{classItem.date ? new Date(classItem.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary block">Fasilitator</span>
                            <p className="text-sm font-black text-base-text-primary">{classItem.facilitator || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-base-text-secondary block">Catatan</span>
                            <p className="text-sm font-black text-base-text-primary">{classItem.note || "-"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-3 mt-2 border-t border-base-border/10">
                        <button 
                          onClick={() => setEditingAttendanceIdx(null)}
                          className="px-3 py-1.5 border border-base-border/50 text-base-text-secondary hover:text-base-text-primary hover:bg-base-bg font-bold rounded-lg transition cursor-pointer text-[10px]"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={() => handleSaveSingleAttendance(idx)}
                          className="px-3 py-1.5 bg-status-green-solid hover:bg-status-green-solid/90 text-base-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition cursor-pointer text-[10px]"
                        >
                          <MdSave className="w-3 h-3" /> Simpan
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}



      {/* VIEW: PERSIAPAN & PROSES PERSALINAN */}
      {activeSection === "birth_prep" && (() => {
        const handleTogglePrep = (idx: number) => {
          const next = [...prepList];
          next[idx] = !next[idx];
          setPrepList(next);
          if (id) {
            localStorage.setItem(`birth_prep_${idx + 1}_${id}`, String(next[idx]));
          }
        };

        const handleToggleProcess = (idx: number) => {
          const next = [...birthProcessList];
          next[idx] = !next[idx];
          setBirthProcessList(next);
          if (id) {
            localStorage.setItem(`birth_process_${idx + 1}_${id}`, String(next[idx]));
          }
        };

        const prepItems = [
          { title: "1. Tanggal Perkiraan Persalinan (HPL)", desc: "Sudah menanyakan tanggal perkiraan lahir ke bidan/dokter." },
          { title: "2. Pendamping Melahirkan", desc: "Meminta suami atau keluarga mendampingi saat periksa dan melahirkan." },
          { title: "3. Tabungan / Dana Cadangan", desc: "Mempersiapkan dana cadangan untuk biaya persalinan dan keperluan tak terduga." },
          { title: "4. Kartu JKN / BPJS Kesehatan", desc: "Mempersiapkan kartu BPJS atau mendaftar jika belum memilikinya." },
          { title: "5. Tempat Melahirkan", desc: "Sudah menyepakati tempat bersalin (Puskesmas, RS, atau Klinik Bersalin)." },
          { title: "6. KTP, KK & Dokumen Lahir", desc: "Menyiapkan berkas KTP, Kartu Keluarga, dan Buku KIA untuk syarat administrasi bayi." },
          { title: "7. Calon Pendonor Darah Siaga", desc: "Menyiapkan lebih dari 1 orang yang bergolongan darah sama dan bersedia mendonor." },
          { title: "8. Kendaraan Siaga", desc: "Menyepakati kendaraan darurat dengan keluarga atau tetangga untuk transportasi." },
          { title: "9. Stiker P4K Terpasang", desc: "Sudah menempelkan stiker Program Perencanaan Persalinan dan Pencegahan Komplikasi (P4K) di depan rumah." },
          { title: "10. Rencana KB Pasca Salin", desc: "Sudah merencanakan metode Keluarga Berencana (KB) pasca bersalin." }
        ];

        const processItems = [
          { title: "1. Tanda-Tanda Persalinan", desc: "Mengetahui bahwa awal persalinan ditandai mulas teratur yang semakin lama semakin kuat." },
          { title: "2. Durasi Persalinan Normal", desc: "Memahami durasi persalinan anak pertama (±12 jam) dan anak kedua/seterusnya yang lebih cepat." },
          { title: "3. Hak Pendamping Persalinan", desc: "Ibu berhak menentukan apakah ingin didampingi atau tidak, serta siapa pendampingnya." },
          { title: "4. Hak Memilih Posisi Bersalin", desc: "Ibu berhak memilih posisi melahirkan yang diinginkan dan mendiskusikan keamanannya dengan petugas." },
          { title: "5. Keinginan Buang Air Besar", desc: "Segera memberitahu petugas kesehatan bila merasa ingin buang air besar (tanda kepala bayi turun)." },
          { title: "6. Teknik Mengurangi Rasa Sakit", desc: "Mengetahui teknik menarik napas melalui hidung dan mengeluarkannya lewat mulut saat mulas." },
          { title: "7. Inisiasi Menyusu Dini (IMD)", desc: "Siap melakukan kontak kulit ke kulit segera setelah bayi lahir selama minimal 1 jam." }
        ];

        const prepChecked = prepList.filter(Boolean).length;
        const prepPct = prepChecked * 10;

        const processChecked = birthProcessList.filter(Boolean).length;
        const processPct = Math.round(processChecked * (100 / 7));

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card 1: Persiapan Persalinan */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 bg-base-white">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                <h4 className="font-bold text-xs text-brand-primary">Checklist Mandiri Persiapan Melahirkan (Diisi Ibu)</h4>
                <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">Memastikan kelengkapan administrasi, fisik, finansial, dan logistik sebelum tanggal persalinan.</p>
              </div>

              <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
                <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                  <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${prepPct}%` }}></div>
                </div>
                <p className="text-[11px] font-bold text-brand-primary font-bold">Persiapan selesai: {prepPct}% ({prepChecked} dari 10)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prepItems.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                    <input 
                      type="checkbox" 
                      checked={prepList[idx]} 
                      onChange={() => handleTogglePrep(idx)} 
                      className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                    />
                    <div className="text-[10px] leading-relaxed select-none">
                      <span className="font-bold text-base-text-primary block">{item.title}</span>
                      <span className="text-base-text-secondary">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Card 2: Proses Persalinan */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 bg-base-white">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                <h4 className="font-bold text-xs text-brand-primary">Pemahaman Proses Melahirkan (Buku KIA Hal 24)</h4>
                <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">Memahami tanda-tanda awal persalinan dan hak-hak Ibu saat melahirkan.</p>
              </div>

              <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
                <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                  <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${processPct}%` }}></div>
                </div>
                <p className="text-[11px] font-bold text-brand-primary font-bold">Pemahaman selesai: {processPct}% ({processChecked} dari 7)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {processItems.map((item, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                    <input 
                      type="checkbox" 
                      checked={birthProcessList[idx]} 
                      onChange={() => handleToggleProcess(idx)} 
                      className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                    />
                    <div className="text-[10px] leading-relaxed select-none">
                      <span className="font-bold text-base-text-primary block">{item.title}</span>
                      <span className="text-base-text-secondary">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW: PEMANTAUAN NIFAS & KB PASCA SALIN */}
      {activeSection === "postpartum" && (() => {
        const daysInWeek = Array.from({ length: 7 }, (_, i) => (postpartumFilter - 1) * 7 + i + 1);

        const handleTogglePostpartum = (dayIdx: number, field: string) => {
          const next = [...postpartumList];
          const idx = dayIdx - 1;
          next[idx] = { ...next[idx], [field]: !next[idx][field] };
          setPostpartumList(next);
          if (id) {
            localStorage.setItem(`postpartum_monitoring_${id}`, JSON.stringify(next));
          }
        };

        const handleToggleKbAnswer = (idx: number) => {
          const next = [...kbAnswers];
          next[idx] = !next[idx];
          setKbAnswers(next);
          if (id) {
            localStorage.setItem(`kb_answers_${id}`, JSON.stringify(next));
          }
        };

        const handleToggleConsent = () => {
          const next = !kbConsent;
          setKbConsent(next);
          if (id) {
            localStorage.setItem(`kb_consent_${id}`, String(next));
          }
        };

        const fields = [
          { key: "pemeriksaan_nifas", label: "Pemeriksaan Nifas", cat: "health" },
          { key: "vitamin_a", label: "Konsumsi Vit A", cat: "health" },
          { key: "ttd", label: "Konsumsi TTD", cat: "health" },
          { key: "gizi_sesuai", label: "Makan Gizi Cukup", cat: "health" },
          { key: "masalah_jiwa", label: "Masalah Jiwa/Sedih", cat: "symptom" },
          { key: "demam", label: "Demam >38°C", cat: "danger" },
          { key: "sakit_kepala", label: "Sakit Kepala Hebat", cat: "danger" },
          { key: "pandangan_kabur", label: "Pandangan Mata Kabur", cat: "danger" },
          { key: "nyeri_ulu_hati", label: "Nyeri Ulu Hati", cat: "danger" },
          { key: "jantung_berdebar", label: "Jantung Berdebar", cat: "symptom" },
          { key: "napas_pendek", label: "Napas Pendek", cat: "danger" },
          { key: "payudara_bengkak", label: "Payudara Bengkak/Nyeri", cat: "symptom" },
          { key: "gangguan_bak", label: "Gangguan Buang Air Kecil", cat: "symptom" },
          { key: "kelamin_bengkak", label: "Kelamin Bengkak/Luka", cat: "danger" },
          { key: "darah_bau", label: "Darah Nifas Berbau", cat: "danger" },
          { key: "konstipasi_diare", label: "Pencernaan Terganggu", cat: "symptom" },
          { key: "keputihan", label: "Keputihan Abnormal", cat: "symptom" }
        ];

        const kbQuestions = [
          { title: "1. Pemahaman Pentingnya KB", desc: "Memahami mengapa perlu ikut KB (menjaga jarak kehamilan, membatasi jumlah anak, dll)." },
          { title: "2. Pilihan Metode Kontrasepsi Jangka Panjang (MKJP)", desc: "Mengetahui metode steril (MOW/MOP), spiral (IUD), dan susuk (Implan)." },
          { title: "3. Pilihan Metode Non Jangka Panjang", desc: "Mengetahui metode Suntik KB 3 month, Pil KB Progestin, dan Kondom." }
        ];

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Card 1: Harian Nifas */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 bg-base-white">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                <h4 className="font-bold text-xs text-brand-primary">Lembar Pemantauan Harian Ibu Nifas (Diisi Ibu)</h4>
                <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">Catat pelayanan kesehatan dan pantau tanda bahaya masa nifas setiap hari selama 42 hari pasca melahirkan (Buku KIA Hal 28-31).</p>
              </div>

              {/* Week Switcher */}
              <div className="flex border-b text-[10px] font-bold text-base-text-secondary select-none flex-wrap gap-1">
                {[1, 2, 3, 4, 5, 6].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setPostpartumFilter(w)}
                    className={`flex-1 min-w-[50px] py-2 text-center border-b-2 transition cursor-pointer ${postpartumFilter === w ? 'border-brand-primary text-brand-primary bg-brand-soft/5' : 'border-transparent hover:bg-base-bg/30'}`}
                  >
                    Minggu {w}
                  </button>
                ))}
              </div>

              {/* Accordion for the 7 Days of Selected Week */}
              <div className="space-y-3">
                {daysInWeek.map(dayNum => {
                  const record = postpartumList[dayNum - 1] || { day: dayNum };
                  const checkedCount = fields.filter(f => record[f.key]).length;

                  return (
                    <details key={dayNum} className="group bg-base-white border border-base-border/25 rounded-xl [&_summary::-webkit-details-marker]:hidden overflow-hidden">
                      <summary className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-base-bg/10 transition select-none">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-extrabold text-brand-primary bg-brand-soft/30 px-2 py-0.5 rounded-md">Hari Ke-{dayNum}</span>
                          <span className="text-[10px] font-bold text-base-text-secondary">Tercatat: {checkedCount} parameter</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {fields.some(f => f.cat === 'danger' && record[f.key]) && (
                            <span className="text-[8px] font-bold text-status-red-solid bg-status-red-light/30 border border-status-red-solid/25 px-1.5 py-0.5 rounded-full uppercase animate-pulse">Bahaya</span>
                          )}
                          <span className="text-base-text-secondary group-open:rotate-180 transition-transform duration-200">▼</span>
                        </div>
                      </summary>
                      
                      <div className="p-4 border-t border-base-border/10 bg-base-bg/5 space-y-4">
                        <div className="space-y-2">
                          <h5 className="text-[9px] font-bold text-brand-primary uppercase tracking-wider">I. Pelayanan Kesehatan &amp; Nutrisi</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {fields.filter(f => f.cat === 'health').map(f => (
                              <label key={f.key} className="flex items-center gap-2.5 p-2 bg-base-white border border-base-border/15 rounded-lg cursor-pointer hover:border-brand-primary/20 transition">
                                <input
                                  type="checkbox"
                                  checked={!!record[f.key]}
                                  onChange={() => handleTogglePostpartum(dayNum, f.key)}
                                  className="w-4 h-4 rounded text-brand-primary border-base-border/40 focus:ring-brand-primary/25 cursor-pointer"
                                />
                                <span className="text-[10px] font-semibold text-base-text-primary select-none">{f.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[9px] font-bold text-status-red-solid uppercase tracking-wider">II. Pemantauan Gejala / Tanda Bahaya</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {fields.filter(f => f.cat !== 'health').map(f => {
                              const isDanger = f.cat === 'danger';
                              return (
                                <label key={f.key} className={`flex items-center gap-2.5 p-2 bg-base-white border rounded-lg cursor-pointer transition ${isDanger ? 'hover:border-status-red-solid/35 border-base-border/15' : 'hover:border-brand-primary/20 border-base-border/15'}`}>
                                  <input
                                    type="checkbox"
                                    checked={!!record[f.key]}
                                    onChange={() => handleTogglePostpartum(dayNum, f.key)}
                                    className={`w-4 h-4 rounded border-base-border/40 cursor-pointer ${isDanger ? 'text-status-red-solid focus:ring-status-red-solid/25' : 'text-brand-primary focus:ring-brand-primary/25'}`}
                                  />
                                  <span className={`text-[10px] font-semibold select-none ${isDanger ? 'text-status-red-solid font-bold' : 'text-base-text-primary'}`}>{f.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            {/* Card 2: KB Pasca Salin */}
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 bg-base-white">
              <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
                <h4 className="font-bold text-xs text-brand-primary">Keluarga Berencana (KB) Pasca Salin (Diisi Ibu)</h4>
                <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">Merencanakan kehamilan sehat pasca melahirkan bersama suami sesuai Buku KIA halaman 33.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {kbQuestions.map((q, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 p-3.5 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition">
                    <input 
                      type="checkbox" 
                      checked={kbAnswers[idx]} 
                      onChange={() => handleToggleKbAnswer(idx)} 
                      className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                    />
                    <div className="text-[10px] leading-relaxed select-none">
                      <span className="font-bold text-base-text-primary block">{q.title}</span>
                      <span className="text-base-text-secondary">{q.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="border border-brand-primary/25 rounded-2xl p-5 bg-brand-soft/10 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kb-consent-checkbox"
                    checked={kbConsent}
                    onChange={handleToggleConsent}
                    className="w-5 h-5 rounded text-brand-primary mt-0.5 cursor-pointer border-brand-primary/30 focus:ring-brand-primary/20"
                  />
                  <label htmlFor="kb-consent-checkbox" className="text-xs leading-relaxed font-semibold text-base-text-primary select-none cursor-pointer">
                    PERNYATAAN PERSETUJUAN IBU
                    <span className="block text-[10px] font-medium text-base-text-secondary mt-1">
                      "Saya bersedia menggunakan kontrasepsi (KB) pasca bersalin demi menjaga kesehatan saya dan jarak kehamilan untuk tumbuh kembang anak yang optimal."
                    </span>
                  </label>
                </div>

                {kbConsent && (
                  <div className="border-t border-brand-primary/20 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">Status Persetujuan</span>
                      <span className="text-xs font-bold text-status-green-solid flex items-center gap-1">
                        ✓ Disetujui secara Digital oleh Ibu
                      </span>
                    </div>
                    <div className="border border-brand-primary/20 rounded-xl px-4 py-2 bg-base-white text-center sm:text-right shrink-0">
                      <span className="text-[9px] font-bold text-base-text-secondary uppercase block">Paraf/Tanda Tangan digital</span>
                      <span className="text-xs font-extrabold text-brand-primary italic block font-serif tracking-widest mt-0.5">
                        {mother ? mother.name : "Ibu Kandung"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIEW: MENYUSUI & NUTRISI */}
      {activeSection === "breastfeeding" && (() => {
        const handleToggleBreastfeeding = (idx: number) => {
          const next = [...breastfeedingAnswers];
          next[idx] = !next[idx];
          setBreastfeedingAnswers(next);
          if (id) {
            localStorage.setItem(`breastfeeding_monitoring_${id}`, JSON.stringify(next));
          }
        };

        const items = [
          { title: "1. Posisi Lurus & Dekat", desc: "Kepala dan badan bayi membentuk garis lurus, badan bayi dekat menempel tubuh ibu." },
          { title: "2. Mulut Terbuka Lebar", desc: "Mulut bayi terbuka lebar saat menyusu untuk pelekatan maksimal." },
          { title: "3. Dagu Menempel Payudara", desc: "Dagu bayi menempel erat pada payudara ibu saat menyusu." },
          { title: "4. Areola Atas Terlihat Lebih Banyak", desc: "Bagian areola payudara di atas terlihat lebih banyak dibanding areola bawah." },
          { title: "5. Bibir Bawah Dower / Flanged", desc: "Bibir bawah bayi memutar keluar secara sempurna." },
          { title: "6. Menyusu 8-12 Kali Sehari", desc: "Menyusui sesering mungkin minimal 8 hingga 12 kali dalam 24 jam." },
          { title: "7. Makanan Pokok (6 Porsi)", desc: "Mengonsumsi nasi atau makanan pokok sebanyak 6 porsi sehari." },
          { title: "8. Protein Hewani (4 Porsi)", desc: "Mengonsumsi lauk pauk protein hewani seperti ikan, telur, daging sebanyak 4 porsi sehari." },
          { title: "9. Protein Nabati (4 Porsi)", desc: "Mengonsumsi tempe atau tahu sebanyak 4 porsi sehari." },
          { title: "10. Sayur-sayuran (4 Porsi)", desc: "Mengonsumsi sayur matang sebanyak 4 mangkuk sehari." },
          { title: "11. Buah-buahan (4 Porsi)", desc: "Mengonsumsi buah-buahan seperti pisang, pepaya, apel sebanyak 4 porsi sehari." },
          { title: "12. Air Putih (14 Gelas/Hari)", desc: "Memenuhi hidrasi harian dengan minum 14 gelas air putih sehari." }
        ];

        const checkedCount = breastfeedingAnswers.filter(Boolean).length;
        const pct = Math.round(checkedCount * (100 / 12));

        return (
          <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4 bg-base-white animate-in fade-in duration-200">
            <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
              <h4 className="font-bold text-xs text-brand-primary font-bold">Lembar Pemantauan Menyusui &amp; Nutrisi Ibu (Diisi Ibu)</h4>
              <p className="text-base-text-secondary text-[10px] leading-relaxed font-semibold">Memastikan posisi pelekatan menyusui yang benar dan pemenuhan porsi makan harian ibu menyusui sesuai Buku KIA halaman 35-37.</p>
            </div>

            <div className="bg-brand-soft/10 border border-brand-primary/20 rounded-[20px] p-4 shadow-sm bg-base-white">
              <div className="w-full bg-base-border/40 h-2 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
              </div>
              <p className="text-[11px] font-bold text-brand-primary font-bold">Selesai: {pct}% ({checkedCount} dari 12)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2.5 p-3 bg-base-white border border-base-border/25 rounded-xl cursor-pointer hover:border-brand-primary/30 transition animate-in fade-in">
                  <input 
                    type="checkbox" 
                    checked={!!breastfeedingAnswers[idx]} 
                    onChange={() => handleToggleBreastfeeding(idx)} 
                    className="w-4 h-4 rounded text-brand-primary mt-0.5 cursor-pointer focus:ring-brand-primary/30" 
                  />
                  <div className="text-[10px] leading-relaxed select-none">
                    <span className="font-bold text-base-text-primary block">{item.title}</span>
                    <span className="text-base-text-secondary">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Success Modal Pop-up */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-sm overflow-hidden border border-base-border/20 bg-base-white">
            <div className="p-6 text-center space-y-4 bg-base-white">
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
          <div className="bg-base-white rounded-2xl max-w-sm w-full p-6 border border-base-border/30 shadow-2xl space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-200 bg-base-white">
            <div className="text-center w-full bg-base-white">
              <h3 className="text-lg font-bold text-base-text-primary">Sesuaikan Foto Profil</h3>
              <p className="text-xs text-base-text-secondary mt-1">Geser dan perbesar foto agar pas di dalam lingkaran.</p>
            </div>

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
              <div className="absolute w-48 h-48 rounded-full border-2 border-brand-primary z-10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
              
              <img 
                src={cropImageSrc || undefined} 
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

            <div className="w-full space-y-2 bg-base-white">
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

            <div className="flex items-center gap-3 w-full bg-base-white">
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

export default function MotherDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-6 h-6 border-2 border-[#EA2986] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-gray-700">Memuat Data Ibu...</span>
          </div>
        </div>
      }
    >
      <MotherDetailContent />
    </Suspense>
  );
}
