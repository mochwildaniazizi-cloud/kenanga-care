"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getChildDetail, updateChild } from "@/app/actions/children";
import { 
  MdArrowBack, MdCalendarMonth, MdCake, MdFingerprint, MdScale, MdHeight, 
  MdOutlineMonitorWeight, MdTrendingUp, MdTrendingDown, MdTrendingFlat,
  MdEdit, MdSave, MdClose, MdCheckCircleOutline,
  MdMale, MdFemale, MdCameraAlt, MdOutlineError, MdChildCare,
  MdPerson, MdMonitorWeight, MdLocalHospital, MdPhone
} from "react-icons/md";
import { useUserRole } from "@/context/UserRoleContext";
import { FaBaby, FaNotesMedical, FaFileMedical, FaUser } from "react-icons/fa";
import CustomDatePicker from "@/components/CustomDatePicker";
import { calculateZScore, getNutritionalStatus } from "@/utils/zScoreCalculator";

export default function ChildDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") || "";
  const { role } = useUserRole();
  const [child, setChild] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'biodata' | 'health_service' | 'newborn_monitoring' | 'development_monitoring'>('biodata');
  const [newbornMonitoring, setNewbornMonitoring] = useState<any>({
    pemeriksaan: [false, false, false, false],
    dangerSigns: new Array(12).fill(false),
    harianList: new Array(28).fill(null).map((_, i) => ({
      day: i + 1,
      symptoms: new Array(12).fill(false),
      notes: ""
    })),
    kelasBalita: new Array(15).fill(null).map((_, i) => ({
      no: i + 1,
      date: "",
      notes: ""
    }))
  });

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
    special_conditions_notes: "",
    avatarUrl: "",

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

  // Perbarui range tipe umur agar mendukung balita hingga 6 tahun
  const [monitoringAgeRange, setMonitoringAgeRange] = useState<'6-9' | '9-12' | '12-18' | '18-24' | '2-3' | '3-4' | '4-5' | '5-6'>('6-9');

  // Kuesioner Umur 2-3 Tahun (Halaman 79)
  const [milestones23, setMilestones23] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa jalan naik tangga sendiri?", status: null },
    { id: 2, text: "Apakah anak bisa bermain dan menendang bola kecil?", status: null },
    { id: 3, text: "Apakah anak bisa mencoret-coret pensil pada kertas?", status: null },
    { id: 4, text: "Apakah anak bisa bicara dengan baik, menggunakan 2 kata?", status: null },
    { id: 5, text: "Apakah anak bisa menunjuk 1 atau lebih bagian tubuhnya ketika diminta?", status: null },
    { id: 6, text: "Apakah anak bisa melihat gambar dan dapat menyebut dengan benar nama 2 benda atau lebih?", status: null },
    { id: 7, text: "Apakah anak bisa membantu memungut mainannya sendiri atau membantu mengangkat piring jika diminta?", status: null },
    { id: 8, text: "Apakah anak bisa makan nasi sendiri tanpa banyak tumpah?", status: null },
    { id: 9, text: "Apakah anak bisa melepas pakaiannya sendiri?", status: null },
  ]);

  // Kuesioner Umur 3-4 Tahun (Halaman 81)
  const [milestones34, setMilestones34] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa berdiri 1 kaki selama 2 detik?", status: null },
    { id: 2, text: "Apakah anak bisa melompat kedua kaki diangkat?", status: null },
    { id: 3, text: "Apakah anak bisa mengayuh sepeda roda tiga?", status: null },
    { id: 4, text: "Apakah anak bisa menggambar garis lurus?", status: null },
    { id: 5, text: "Apakah anak bisa menumpuk 8 buah kubus?", status: null },
    { id: 6, text: "Apakah anak bisa mengenal 2-4 warna?", status: null },
    { id: 7, text: "Apakah anak bisa menyebut nama, umur, tempat?", status: null },
    { id: 8, text: "Apakah anak bisa mengerti arti kata di atas, di bawah, di depan?", status: null },
    { id: 9, text: "Apakah anak bisa mendengarkan cerita?", status: null },
    { id: 10, text: "Apakah anak bisa mencuci dan mengeringkan tangan sendiri?", status: null },
    { id: 11, text: "Apakah anak bermain bersama teman, mengikuti aturan permainan?", status: null },
    { id: 12, text: "Apakah anak bisa mengenakan sepatu sendiri?", status: null },
    { id: 13, text: "Apakah anak bisa mengenakan celana panjang, kemeja, baju?", status: null },
  ]);

  // Kuesioner Umur 4-5 Tahun (Halaman 82)
  const [milestones45, setMilestones45] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa berdiri 1 kaki selama 6 detik?", status: null },
    { id: 2, text: "Apakah anak bisa melompat-lompat 1 kaki?", status: null },
    { id: 3, text: "Apakah anak bisa menari?", status: null },
    { id: 4, text: "Apakah anak bisa menggambar tanda silang?", status: null },
    { id: 5, text: "Apakah anak bisa menggambar lingkaran?", status: null },
    { id: 6, text: "Apakah anak bisa menggambar orang dengan 3 bagian tubuh?", status: null },
    { id: 7, text: "Apakah anak bisa mengancingkan baju atau pakaian boneka?", status: null },
    { id: 8, text: "Apakah anak bisa menyebut nama lengkap tanpa dibantu?", status: null },
    { id: 9, text: "Apakah anak bisa senang menyebut kata-kata baru?", status: null },
    { id: 10, text: "Apakah anak bisa senang bertanya tentang sesuatu?", status: null },
    { id: 11, text: "Apakah anak bisa menjawab pertanyaan dengan kata-kata yang benar?", status: null },
    { id: 12, text: "Apakah anak bisa bicara yang mudah dimengerti?", status: null },
    { id: 13, text: "Apakah anak bisa membandingkan/membedakan sesuatu dari ukuran dan bentuknya?", status: null },
    { id: 14, text: "Apakah anak bisa menyebut angka, menghitung jari?", status: null },
  ]);

  // Kuesioner Umur 5-6 Tahun (Halaman 83)
  const [milestones56, setMilestones56] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa berjalan lurus?", status: null },
    { id: 2, text: "Apakah anak bisa berdiri dengan 1 kaki selama 11 detik?", status: null },
    { id: 3, text: "Apakah anak bisa menggambar dengan 6 bagian, menggambar orang lengkap?", status: null },
    { id: 4, text: "Apakah anak bisa menangkap bola kecil dengan kedua tangan?", status: null },
    { id: 5, text: "Apakah anak bisa menggambar segi empat?", status: null },
    { id: 6, text: "Apakah anak bisa mengerti arti lawan kata?", status: null },
    { id: 7, text: "Apakah anak bisa mengerti pembicaraan yang menggunakan 7 kata atau lebih?", status: null },
    { id: 8, text: "Apakah anak bisa menjawab pertanyaan tentang benda terbuat dari apa dan kegunaannya?", status: null },
    { id: 9, text: "Apakah anak bisa mengenal angka, bisa menghitung angka 5 -10?", status: null },
    { id: 10, text: "Apakah anak bisa mengenal warna-warni?", status: null },
    { id: 11, text: "Apakah anak bisa mengungkapkan simpati?", status: null },
    { id: 12, text: "Apakah anak bisa mengikuti aturan permainan?", status: null },
    { id: 13, text: "Apakah anak bisa berpakaian sendiri tanpa dibantu?", status: null },
  ]);

  // Kuesioner Umur 12-18 Bulan (Halaman 68)
  const [milestones1218, setMilestones1218] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa berdiri sendiri tanpa berpegangan?", status: null },
    { id: 2, text: "Apakah anak bisa membungkuk memungut mainan kemudian berdiri kembali?", status: null },
    { id: 3, text: "Apakah anak bisa berjalan mundur lima langkah?", status: null },
    { id: 4, text: "Apakah anak bisa memanggil ayah dengan kata 'papa', memanggil ibu dengan kata 'mama'?", status: null },
    { id: 5, text: "Apakah anak bisa menumpuk dua kubus?", status: null },
    { id: 6, text: "Apakah anak bisa memasukkan kubus di kotak?", status: null },
    { id: 7, text: "Apakah anak bisa menunjuk apa yang diinginkan tanpa menangis/merengek, anak bisa mengeluarkan suara yang menyenangkan atau menarik tangan ibu?", status: null },
    { id: 8, text: "Apakah anak bisa memperlihatkan rasa cemburu/bersaing?", status: null },
  ]);

  // Kuesioner Umur 18-24 Bulan (Halaman 69)
  const [milestones1824, setMilestones1824] = useState<any[]>([
    { id: 1, text: "Apakah anak bisa berdiri sendiri tanpa berpegangan selama 30 detik?", status: null },
    { id: 2, text: "Apakah anak bisa berjalan tanpa terhuyung-huyung?", status: null },
    { id: 3, text: "Apakah anak bisa menumpuk 4 buah kubus?", status: null },
    { id: 4, text: "Apakah anak bisa memungut benda kecil dengan ibu jari dan jari telunjuk?", status: null },
    { id: 5, text: "Apakah anak bisa menggelindingkan bola ke arah sasaran?", status: null },
    { id: 6, text: "Apakah anak bisa menyebut 3 - 6 kata yang mempunyai arti?", status: null },
    { id: 7, text: "Apakah anak bisa membantu/menirukan pekerjaan rumah tangga?", status: null },
    { id: 8, text: "Apakah anak bisa memegang cangkir sendiri, belajar makan-minum sendiri?", status: null },
  ]);

  // Kuesioner Umur 6-9 Bulan (Halaman 62)
  const [milestones69, setMilestones69] = useState<any[]>([
    { id: 1, text: "Apakah bayi bisa duduk secara mandiri?", status: null },
    { id: 2, text: "Apakah bayi belajar berdiri, kedua kakinya menyangga sebagian besar badan?", status: null },
    { id: 3, text: "Apakah bayi bisa merangkak meraih mainan atau mendekati seseorang?", status: null },
    { id: 4, text: "Apakah bayi bisa memindahkan benda dari satu tangan ke tangan lainnya?", status: null },
    { id: 5, text: "Apakah bayi bisa memungut 2 benda, kedua tangan memegang 2 benda pada saat bersamaan?", status: null },
    { id: 6, text: "Apakah bayi bisa memungut benda sebesar kacang dengan cara meraup?", status: null },
    { id: 7, text: "Apakah bayi bersuara tanpa arti: mamama, bababa, dadada, tatata?", status: null },
    { id: 8, text: "Apakah bayi mencari mainan/benda yang dijatuhkan?", status: null },
    { id: 9, text: "Apakah bayi bermain tepuk tangan / Cilukba?", status: null },
    { id: 10, text: "Apakah bayi bergembira dengan melempar benda?", status: null },
  ]);

  // Kuesioner Umur 9-12 Bulan (Halaman 63)
  const [milestones912, setMilestones912] = useState<any[]>([
    { id: 1, text: "Apakah bayi bisa mengangkat badannya ke posisi berdiri?", status: null },
    { id: 2, text: "Apakah bayi belajar berdiri selama 30 detik atau berpegangan di kursi?", status: null },
    { id: 3, text: "Apakah bayi dapat berjalan dengan dituntun?", status: null },
    { id: 4, text: "Apakah bayi mengulurkan lengan/badan untuk meraih mainan yang diinginkan?", status: null },
    { id: 5, text: "Apakah bayi bisa menggenggam erat pensil?", status: null },
    { id: 6, text: "Apakah bayi memasukkan benda ke mulut?", status: null },
    { id: 7, text: "Apakah bayi mengulang/menirukan bunyi yang didengar?", status: null },
    { id: 8, text: "Apakah bayi menyebut 2-3 suku kata yang sama tanpa arti?", status: null },
    { id: 9, text: "Apakah bayi mengeksplorasi sekitar, ingin tahu, ingin menyentuh apa saja?", status: null },
    { id: 10, text: "Apakah bayi bereaksi terhadap suara yang perlahan atau bisikan?", status: null },
    { id: 11, text: "Apakah bayi senang diajak bermain Cilukba?", status: null },
    { id: 12, text: "Apakah bayi mengenal anggota keluarga, takut pada orang yang belum dikenal?", status: null },
  ]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setError(null);
      
      const decodedId = decodeURIComponent(id as string);

      // Attempt load full cached detail
      const cached = localStorage.getItem(`offline_child_detail_${decodedId}`);
      if (cached) {
        setChild(JSON.parse(cached));
        setIsLoading(false);
      } else {
        // Build basic child fallback from master list cache
        const cachedList = localStorage.getItem("offline_children_list");
        if (cachedList) {
          const children = JSON.parse(cachedList);
          const basicChild = children.find((c: any) => c.child_id === decodedId);
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
              blood_type: "-",
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
        const data = await getChildDetail(decodedId);
        if (!data) {
          setError("Rekam medis balita yang Anda cari tidak terdaftar atau telah dihapus.");
        } else {
          setChild(data);
          localStorage.setItem(`offline_child_detail_${decodedId}`, JSON.stringify(data));
        }
      } catch (err: any) {
        console.error("Failed to load child detail", err);
        setError("Gagal memuat rekam medis dari database: " + (err.message || err.toString()));
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();

    if (id) {
      const decodedId = decodeURIComponent(id as string);
      const cachedNewborn = localStorage.getItem(`newborn_monitoring_${decodedId}`);
      if (cachedNewborn) {
        try {
          const parsed = JSON.parse(cachedNewborn);
          if (!parsed.harianList) {
            parsed.harianList = new Array(28).fill(null).map((_, i) => ({
              day: i + 1,
              symptoms: new Array(12).fill(false),
              notes: ""
            }));
          }
          if (!parsed.kelasBalita) {
            parsed.kelasBalita = new Array(15).fill(null).map((_, i) => ({
              no: i + 1,
              date: "",
              notes: ""
            }));
          }
          setNewbornMonitoring(parsed);
        } catch (e) {}
      }
      const cachedMilestones = localStorage.getItem(`milestones_69_${decodedId}`);
      if (cachedMilestones) {
        try { setMilestones69(JSON.parse(cachedMilestones)); } catch (e) {}
      }
      
      const cachedMilestones912 = localStorage.getItem(`milestones_912_${decodedId}`);
      if (cachedMilestones912) {
        try { setMilestones912(JSON.parse(cachedMilestones912)); } catch (e) {}
      }

      const cachedMilestones1218 = localStorage.getItem(`milestones_1218_${decodedId}`);
      if (cachedMilestones1218) {
        try { setMilestones1218(JSON.parse(cachedMilestones1218)); } catch (e) {}
      }
      
      const cachedMilestones1824 = localStorage.getItem(`milestones_1824_${decodedId}`);
      if (cachedMilestones1824) {
        try { setMilestones1824(JSON.parse(cachedMilestones1824)); } catch (e) {}
      }

      const cachedMilestones23 = localStorage.getItem(`milestones_23_${decodedId}`);
      if (cachedMilestones23) { try { setMilestones23(JSON.parse(cachedMilestones23)); } catch (e) {} }

      const cachedMilestones34 = localStorage.getItem(`milestones_34_${decodedId}`);
      if (cachedMilestones34) { try { setMilestones34(JSON.parse(cachedMilestones34)); } catch (e) {} }

      const cachedMilestones45 = localStorage.getItem(`milestones_45_${decodedId}`);
      if (cachedMilestones45) { try { setMilestones45(JSON.parse(cachedMilestones45)); } catch (e) {} }

      const cachedMilestones56 = localStorage.getItem(`milestones_56_${decodedId}`);
      if (cachedMilestones56) { try { setMilestones56(JSON.parse(cachedMilestones56)); } catch (e) {} }
    }
  }, [id]);

  useEffect(() => {
    if (child?.ageInMonths) {
      const age = child.ageInMonths;
      if (age >= 6 && age < 9) setMonitoringAgeRange('6-9');
      else if (age >= 9 && age < 12) setMonitoringAgeRange('9-12');
      else if (age >= 12 && age < 18) setMonitoringAgeRange('12-18');
      else if (age >= 18 && age < 24) setMonitoringAgeRange('18-24');
      else if (age >= 24 && age < 36) setMonitoringAgeRange('2-3');
      else if (age >= 36 && age < 48) setMonitoringAgeRange('3-4');
      else if (age >= 48 && age < 60) setMonitoringAgeRange('4-5');
      else if (age >= 60 && age <= 72) setMonitoringAgeRange('5-6');
    }
  }, [child]);

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
      avatarUrl: child.avatarUrl || "",

      // Buku KIA child identity details
      jkn_number: child.jkn_number === "-" ? "" : child.jkn_number,
      faskes_1: child.faskes_1 === "-" ? "" : child.faskes_1,
      faskes_referral: child.faskes_referral === "-" ? "" : child.faskes_referral,
      birth_certificate_number: child.birth_certificate_number === "-" ? "" : child.birth_certificate_number,
      other_financing: child.other_financing === "-" ? "" : child.other_financing,
      insurance_other: child.insurance_other === "-" ? "" : child.insurance_other,
      insurance_number: child.insurance_number === "-" ? "" : child.insurance_number,
      insurance_validity: child.insurance_validity || "",
      faskes_primary: child.faskes_primary === "-" ? "" : child.faskes_primary,
      puskesmas_domicile: child.puskesmas_domicile === "-" ? "" : child.puskesmas_domicile,
      cohort_register_number_baby: child.cohort_register_number_baby === "-" ? "" : child.cohort_register_number_baby,
      cohort_register_number_toddler: child.cohort_register_number_toddler === "-" ? "" : child.cohort_register_number_toddler,
      faskes_secondary: child.faskes_secondary === "-" ? "" : child.faskes_secondary,
      medical_record_number: child.medical_record_number === "-" ? "" : child.medical_record_number,
      address: child.address === "-" ? "" : child.address,
      phone_number: child.phone_number === "-" ? "" : child.phone_number,
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
      editForm.birth_date !== (child.dobRaw || "") ||
      editForm.birth_order !== (child.birth_order || 1).toString() ||
      editForm.birth_weight !== (child.birth_weight || "").toString() ||
      editForm.birth_length !== (child.birth_length || "").toString() ||
      editForm.current_weight !== (child.current_weight || "").toString() ||
      editForm.current_height !== (child.current_height || "").toString() ||
      editForm.blood_type !== (child.blood_type || "-") ||
      editForm.special_conditions_notes !== (child.special_conditions_notes || "") ||
      editForm.jkn_number !== (child.jkn_number === "-" ? "" : child.jkn_number) ||
      editForm.faskes_1 !== (child.faskes_1 === "-" ? "" : child.faskes_1) ||
      editForm.faskes_referral !== (child.faskes_referral === "-" ? "" : child.faskes_referral) ||
      editForm.birth_certificate_number !== (child.birth_certificate_number === "-" ? "" : child.birth_certificate_number) ||
      editForm.other_financing !== (child.other_financing === "-" ? "" : child.other_financing) ||
      editForm.insurance_other !== (child.insurance_other === "-" ? "" : child.insurance_other) ||
      editForm.insurance_number !== (child.insurance_number === "-" ? "" : child.insurance_number) ||
      editForm.insurance_validity !== (child.insurance_validity || "") ||
      editForm.faskes_primary !== (child.faskes_primary === "-" ? "" : child.faskes_primary) ||
      editForm.puskesmas_domicile !== (child.puskesmas_domicile === "-" ? "" : child.puskesmas_domicile) ||
      editForm.cohort_register_number_baby !== (child.cohort_register_number_baby === "-" ? "" : child.cohort_register_number_baby) ||
      editForm.cohort_register_number_toddler !== (child.cohort_register_number_toddler === "-" ? "" : child.cohort_register_number_toddler) ||
      editForm.faskes_secondary !== (child.faskes_secondary === "-" ? "" : child.faskes_secondary) ||
      editForm.medical_record_number !== (child.medical_record_number === "-" ? "" : child.medical_record_number) ||
      editForm.address !== (child.address === "-" ? "" : child.address) ||
      editForm.phone_number !== (child.phone_number === "-" ? "" : child.phone_number)
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

  const handleSave = async () => {
    if (!editForm.child_name || !editForm.birth_date) {
      alert("Nama Anak dan Tanggal Lahir wajib diisi.");
      return;
    }

    const decodedId = decodeURIComponent(id as string);

    const updatedChild = {
      ...child,
      national_id: editForm.national_id || "-",
      name: editForm.child_name,
      gender: editForm.gender,
      birth_place: editForm.birth_place || "-",
      dobRaw: editForm.birth_date,
      dob: editForm.birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(editForm.birth_date)) : "-",
      age: getAgeInMonths(editForm.birth_date) + " Bulan",
      birth_order: editForm.birth_order ? parseInt(editForm.birth_order.toString()) : 1,
      birth_weight: editForm.birth_weight ? parseFloat(editForm.birth_weight.toString()) : null,
      birth_length: editForm.birth_length ? parseFloat(editForm.birth_length.toString()) : null,
      current_weight: editForm.current_weight ? parseFloat(editForm.current_weight.toString()) : null,
      current_height: editForm.current_height ? parseFloat(editForm.current_height.toString()) : null,
      blood_type: editForm.blood_type || "-",
      special_conditions: editForm.special_conditions,
      special_conditions_notes: editForm.special_conditions_notes || "",
      avatarUrl: editForm.avatarUrl,

      // Buku KIA Additional Child Identity fields
      jkn_number: editForm.jkn_number || "-",
      faskes_1: editForm.faskes_1 || "-",
      faskes_referral: editForm.faskes_referral || "-",
      birth_certificate_number: editForm.birth_certificate_number || "-",
      other_financing: editForm.other_financing || "-",
      insurance_other: editForm.insurance_other || "-",
      insurance_number: editForm.insurance_number || "-",
      insurance_validity: editForm.insurance_validity || "",
      faskes_primary: editForm.faskes_primary || "-",
      puskesmas_domicile: editForm.puskesmas_domicile || "-",
      cohort_register_number_baby: editForm.cohort_register_number_baby || "-",
      cohort_register_number_toddler: editForm.cohort_register_number_toddler || "-",
      faskes_secondary: editForm.faskes_secondary || "-",
      medical_record_number: editForm.medical_record_number || "-",
      address: editForm.address || "-",
      phone_number: editForm.phone_number || "-",
    };

    if (!navigator.onLine) {
      setChild(updatedChild);
      localStorage.setItem("offline_child_detail_" + decodedId, JSON.stringify(updatedChild));

      const cachedList = localStorage.getItem("offline_children_list");
      if (cachedList) {
        const list = JSON.parse(cachedList);
        const idx = list.findIndex((c: any) => c.child_id === decodedId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            national_id: editForm.national_id || "-",
            name: editForm.child_name,
            gender: editForm.gender,
            dob: editForm.birth_date ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(editForm.birth_date)) : "-",
            dobRaw: editForm.birth_date,
            age: getAgeInMonths(editForm.birth_date) + " Bulan",
            birth_place: editForm.birth_place || "-",
            weight: editForm.current_weight || editForm.birth_weight,
            height: editForm.current_height || editForm.birth_length,
            avatarUrl: editForm.avatarUrl
          };
          localStorage.setItem("offline_children_list", JSON.stringify(list));
        }
      }

      const pendingUpdates = JSON.parse(localStorage.getItem("pending_update_children") || "[]");
      const cleanPending = pendingUpdates.filter((item: any) => item.child_id !== decodedId);
      cleanPending.push({ child_id: decodedId, data: editForm });
      localStorage.setItem("pending_update_children", JSON.stringify(cleanPending));

      setIsEditing(false);
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateChild(decodedId, editForm);
      if (res.success) {
        const data = await getChildDetail(decodedId);
        setChild(data);
        localStorage.setItem("offline_child_detail_" + decodedId, JSON.stringify(data));
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

  const displayName = isEditing ? editForm.child_name : child.name;
  const displayNik = isEditing ? editForm.national_id : child.national_id;
  const displayGender = isEditing ? editForm.gender : child.gender;
  const displayAge = isEditing ? getAgeInMonths(editForm.birth_date) : child.ageInMonths;

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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-28 lg:pb-10 animate-in fade-in duration-300">
      
      {/* Offline Warning Banner */}
      {!navigator.onLine && (
        <div className="bg-status-orange-light text-status-orange-solid border border-status-orange-solid/25 px-5 py-3 rounded-bento-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top duration-300">
          <span className="text-sm">⚠️</span>
          <span>Mode Offline: Menampilkan rekam medis lokal dari memori peramban. Anda tetap bisa mengubah profil anak secara offline.</span>
        </div>
      )}

      {activeSection === "" ? (
        // =========================================================================
        // KANBAN CARDS DASHBOARD OVERVIEW (MENU UTAMA)
        // =========================================================================
        <div className="space-y-6">
          {/* Header & Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/20 pb-4">
            <div className="flex items-center gap-4">
              <Link 
                href="/data-anak"
                className="p-2.5 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary bg-base-white rounded-xl hover:bg-brand-soft/20 transition cursor-pointer shrink-0"
              >
                <MdArrowBack className="w-5 h-5" />
              </Link>
              
              <div className={`w-16 h-16 rounded-full overflow-hidden border border-base-border/30 shadow-sm shrink-0 flex items-center justify-center bg-base-white`}>
                {child.avatarUrl ? (
                  <img src={child.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  displayGender === "M" ? <MdMale className="w-9 h-9 text-status-blue-solid" /> : <MdFemale className="w-9 h-9 text-brand-primary" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-base-text-primary">{displayName}</h1>
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
                </div>
                
                <div className="flex items-center gap-2 mt-1.5 text-xs text-base-text-secondary font-medium">
                  <span>NIK: <span className="font-semibold text-base-text-primary">{displayNik}</span></span>
                  <span>&bull;</span>
                  <span>Umur: <span className="font-semibold text-base-text-primary">{child.age || (child.ageInMonths + " Bulan")}</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {role !== "ibu" && (
                <button 
                  type="button"
                  onClick={() => router.push(`/data-anak/${child.child_id}?section=biodata&edit=true`)}
                  className="px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-soft/20 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <MdEdit className="w-4 h-4" /> Edit Data Balita
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Bento Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Weight card */}
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-soft/30 text-brand-primary flex items-center justify-center shrink-0">
                <MdScale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Berat Badan</span>
                <p className="text-base font-black text-base-text-primary mt-0.5">{child.current_weight || child.birth_weight || "-"} kg</p>
              </div>
            </div>

            {/* Height card */}
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-blue-light text-status-blue-solid flex items-center justify-center shrink-0">
                <MdHeight className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Tinggi Badan</span>
                <p className="text-base font-black text-base-text-primary mt-0.5">{child.current_height || child.birth_length || "-"} cm</p>
              </div>
            </div>

            {/* Medical conditions card */}
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm col-span-1">
              <div className="w-10 h-10 rounded-xl bg-status-red-light text-status-red-solid flex items-center justify-center shrink-0">
                <MdOutlineError className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Kondisi Medis</span>
                <div className="truncate text-xs font-bold text-base-text-primary mt-0.5">
                  {child.special_conditions && child.special_conditions.length > 0 ? (
                    child.special_conditions.filter((c: string) => c !== "Lainnya...").join(", ")
                  ) : (
                    "Normal / Tidak Ada"
                  )}
                </div>
              </div>
            </div>

            {/* Last Posyandu checkup card */}
            <div className="bg-base-white border border-base-border/30 rounded-[20px] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-status-green-light text-status-green-solid flex items-center justify-center shrink-0">
                <MdCalendarMonth className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-base-text-secondary uppercase tracking-wider block">Kunjungan Terakhir</span>
                <p className="text-xs font-bold text-base-text-primary mt-0.5 truncate">
                  {child.measurements && child.measurements.length > 0 ? (
                    child.measurements[0].date
                  ) : (
                    "Belum ada catatan"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Kanban Board Container */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-black text-base-text-primary font-bold">Kurikulum Pemantauan Kesehatan Balita</h2>
              <p className="text-xs text-base-text-secondary font-semibold">Pilih modul kartu di bawah untuk mengisi data check-up harian dan melihat perkembangan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Card 1: Biodata & Identitas */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}?section=biodata`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FF5C5C] rounded-full"></span> BIODATA BALITA</span>
                  <span>Urgent</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FF5C5C] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    BIODATA &amp; ALERGI
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Identitas Lengkap Anak</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Data NIK, tempat/tanggal lahir, nama ibu kandung, golongan darah, serta kondisi medis khusus/riwayat alergi.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center text-[10px] font-bold border border-base-white">
                          {displayName.charAt(0)}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-status-yellow-light text-status-yellow-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          M
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-[#FF5C5C]">
                        Lengkap
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">⚖️ {child.birth_weight || "-"} kg</span>
                      <span className="flex items-center gap-1">📏 {child.birth_length || "-"} cm</span>
                    </div>
                    <span>Detail &bull; Edit</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Layanan Kesehatan */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}?section=health_service`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#FF9F43] rounded-full"></span> LAYANAN KESEHATAN</span>
                  <span>Aktif</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#FF9F43] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    LAYANAN KESEHATAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Jaminan &amp; Faskes</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Informasi nomor BPJS/JKN, asuransi, Faskes Tingkat I (Puskesmas/Posyandu), serta Faskes Rujukan.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-blue-light text-status-blue-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          H
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF9F43]">
                        BPJS Aktif
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">💳 {child.jkn_number ? "Kartu Ada" : "-"}</span>
                    </div>
                    <span>Detail &bull; Edit</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Neonatal harian */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}?section=newborn_monitoring`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CA3FF] rounded-full"></span> NEONATAL MONITORING</span>
                  <span>Hari 1-28</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CA3FF] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    NEONATUS
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Bayi Baru Lahir (0-28 Hari)</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Log gejala harian neonatus, checklist 12 tanda bahaya, dan riwayat pemeriksaan nakes.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-purple-light text-status-purple-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          👶
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#4CA3FF]">
                        Neonatal
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">📋 28 Hari Log</span>
                    </div>
                    <span>Buka Lembar</span>
                  </div>
                </div>
              </div>
              {/* Card 4: Tumbuh Kembang */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}?section=development_monitoring`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4CD964] rounded-full"></span> TUMBUH KEMBANG</span>
                  <span>Buku KIA</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#4CD964] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    TUMBUH KEMBANG
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Checklist Kuesioner Buku KIA</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Evaluasi mandiri penanda perkembangan (milestones) motorik kasar/halus &amp; sensorik anak usia 6 bulan - 6 tahun.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-green-light text-status-green-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          📈
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-[#4CD964]">
                        Sesuai Umur
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">📋 8 Fase Usia</span>
                    </div>
                    <span>Buka Checklist</span>
                  </div>
                </div>
              </div>

              {/* Card 5: Grafik & Riwayat */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}?section=growth_history`)}
                className="bg-[#F4F5F7] p-4 rounded-[24px] border border-base-border/20 flex flex-col hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-bold text-base-text-secondary px-1">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#00BCD4] rounded-full"></span> TREN PERTUMBUHAN</span>
                  <span>Posyandu</span>
                </div>
                <div className="bg-base-white rounded-[20px] shadow-sm border border-base-border/10 overflow-hidden flex flex-col">
                  <div className="bg-[#00BCD4] h-6 flex items-center px-4 text-[9px] font-extrabold uppercase text-base-white">
                    TREN &amp; GRAFIK PERTUMBUHAN
                  </div>
                  <div className="border border-dashed border-base-border/30 rounded-2xl p-4 m-3 mt-2 bg-base-white space-y-3">
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">Grafik &amp; Log Timbangan</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Tren grafik tinggi/berat badan Posyandu beserta log tabel kunjungan lengkap catatan kader.</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-dashed border-base-border/20">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="w-6 h-6 rounded-full bg-status-cerulean-light text-status-cerulean-solid flex items-center justify-center text-[10px] font-bold border border-base-white">
                          📊
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-lg bg-cyan-50 text-[#00BCD4]">
                        {child.measurements.length} Kunjungan
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-base-border/10 px-4 py-2.5 flex items-center justify-between text-[10px] font-semibold text-base-text-secondary">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">📊 Kurva KMS</span>
                    </div>
                    <span>Lihat Grafik</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Rekam Medis Klinis EHR */}
              <div 
                onClick={() => router.push(`/data-anak/${child.child_id}/pemeriksaan-klinis`)}
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
                    <h3 className="text-sm font-bold text-base-text-primary group-hover:text-brand-primary transition-colors">EHR SDIDTK &amp; Pemeriksaan Gigi</h3>
                    <p className="text-[11px] text-base-text-secondary leading-relaxed font-medium">Lihat rekam medis formal hasil pemeriksaan tumbuh kembang klinis (SDIDTK), grafik plak gigi, dan riwayat kesehatan dari nakes.</p>
                    
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
      ) : (
        // =========================================================================
        // FULL-SCREEN SUB-VIEWS DENGAN TOMBOL KEMBALI
        // =========================================================================
        <div className="space-y-6">
          {/* Sub-header */}
          <div className="flex items-center justify-between border-b pb-4">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                router.push(`/data-anak/${child.child_id}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-base-text-secondary hover:text-brand-primary transition border border-base-border/30 rounded-xl bg-base-white cursor-pointer"
            >
              <MdArrowBack className="w-4 h-4" /> Kembali ke Dashboard
            </button>
            <h2 className="text-base font-extrabold text-base-text-primary capitalize flex items-center gap-2">
              <span>{activeSection.replace("_", " ")}</span>
              <span className="text-[10px] bg-brand-soft text-brand-primary font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/20">{displayName}</span>
            </h2>
          </div>

          {activeSection === "biodata" && (
            <>
              <div className="flex flex-col gap-6">
                {/* Profile card & editing form */}
                <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-28 h-28 rounded-full overflow-hidden border border-brand-primary shadow-sm flex items-center justify-center cursor-pointer group bg-status-yellow-light text-status-yellow-solid"
                    >
                      {editForm.avatarUrl ? (
                        <img src={editForm.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        editForm.gender === "M" ? <MdMale className="w-14 h-14 text-status-blue-solid" /> : <MdFemale className="w-14 h-14 text-brand-primary" />
                      )}
                      <div className="absolute inset-0 bg-base-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <MdCameraAlt className="w-8 h-8 text-base-white" />
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                  ) : (
                    <div className={`w-28 h-28 rounded-full overflow-hidden border border-base-border/30 shadow-sm flex items-center justify-center ${
                      displayGender === "M" ? "bg-gender-male-bg text-gender-male-solid" : "bg-gender-female-bg text-gender-female-solid"
                    }`}>
                      {child.avatarUrl ? (
                        <img src={child.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayGender === "M" ? <MdMale className="w-14 h-14" /> : <MdFemale className="w-14 h-14" />
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-base-text-primary">{displayName}</h3>
                    <span className="text-[10px] text-base-text-secondary font-bold uppercase tracking-wider block">ID: {child.child_id}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3 text-xs font-semibold text-base-text-secondary">
                  <div className="flex justify-between"><span>Lahir Prematur</span><span className="text-base-text-primary">{child.special_conditions?.includes("Lahir Prematur") ? "Ya" : "Tidak"}</span></div>
                  <div className="flex justify-between"><span>Berat Lahir</span><span className="text-base-text-primary">{child.birth_weight || "-"} kg</span></div>
                  <div className="flex justify-between"><span>Panjang Lahir</span><span className="text-base-text-primary">{child.birth_length || "-"} cm</span></div>
                </div>
              </div>

              {/* Identity Details Form */}
              <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-sm text-base-text-primary">Detail Identitas Anak</h3>
                  {!(isEditing || searchParams.get("edit") === "true") && role !== "ibu" && (
                    <button 
                      type="button" 
                      onClick={() => {
                        handleStartEdit();
                        router.push(`/data-anak/${child.child_id}?section=biodata&edit=true`);
                      }}
                      className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <MdEdit className="w-3.5 h-3.5" /> Ubah Profil
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nama Lengkap Anak</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="child_name" value={editForm.child_name} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" required />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">NIK Anak</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="national_id" value={editForm.national_id} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.national_id || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tempat Lahir</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="birth_place" value={editForm.birth_place} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.birth_place || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tanggal Lahir</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <div className="relative overflow-visible z-50">
                        <CustomDatePicker value={editForm.birth_date} onChange={(val) => setEditForm((prev: any) => ({ ...prev, birth_date: val }))} outputFormat="iso" />
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.dob}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Anak Ke-</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <select name="birth_order" value={editForm.birth_order} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-base-white cursor-pointer">
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.birth_order || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Golongan Darah</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <select name="blood_type" value={editForm.blood_type} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-base-white cursor-pointer">
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
                  <div className="col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">No. Akta Kelahiran</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="birth_certificate_number" value={editForm.birth_certificate_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.birth_certificate_number || "-"}</p>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-base-text-secondary block">Alamat Rumah</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <textarea name="address" value={editForm.address} onChange={handleInputChange} rows={2} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs resize-none" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.address || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. JKN</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="jkn_number" value={editForm.jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.jkn_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Telepon</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="phone_number" value={editForm.phone_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.phone_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Fasilitas Kesehatan TK1</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="faskes_1" value={editForm.faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.faskes_1 || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Fasilitas Kesehatan Rujukan</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="faskes_referral" value={editForm.faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.faskes_referral || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Puskesmas Domisili</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="puskesmas_domicile" value={editForm.puskesmas_domicile} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.puskesmas_domicile || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Reg. Kohort Bayi</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="cohort_register_number_baby" value={editForm.cohort_register_number_baby} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.cohort_register_number_baby || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Reg. Kohort Balita</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="cohort_register_number_toddler" value={editForm.cohort_register_number_toddler} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.cohort_register_number_toddler || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">No. Catatan Medik RS</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="medical_record_number" value={editForm.medical_record_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.medical_record_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Asuransi Lain</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="insurance_other" value={editForm.insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.insurance_other || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Nomor Asuransi Lain</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="text" name="insurance_number" value={editForm.insurance_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.insurance_number || "-"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-base-text-secondary block">Tanggal Berlaku Asuransi</span>
                    {isEditing || searchParams.get("edit") === "true" ? (
                      <input type="date" name="insurance_validity" value={editForm.insurance_validity} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                    ) : (
                      <p className="text-sm font-bold text-base-text-primary">{child.insurance_validity || "-"}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-1 pt-2 border-t">
                    <span className="text-base-text-secondary block">Ibu Kandung</span>
                    <p className="text-sm font-bold text-brand-primary">{child.mother_name || "-"}</p>
                  </div>
                </div>

                {/* Tags & notes inside biodata view */}
                <div className="pt-4 border-t space-y-2">
                  <span className="text-xs font-bold text-base-text-primary">Kondisi Medis &amp; Riwayat Alergi</span>
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <div className="space-y-4">
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
                        <textarea
                          name="special_conditions_notes"
                          value={editForm.special_conditions_notes || ""}
                          onChange={(e) => setEditForm((prev: any) => ({ ...prev, special_conditions_notes: e.target.value }))}
                          placeholder="Masukkan detail kondisi medis atau alergi lainnya..."
                          rows={3}
                          className="w-full px-3 py-2 text-xs border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary bg-base-white resize-none"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(!child.special_conditions || child.special_conditions.length === 0) ? (
                        <p className="text-xs text-base-text-secondary italic">Tidak ada kondisi khusus / riwayat alergi.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {child.special_conditions.map((tag: string) => (
                            <span key={tag} className="bg-brand-soft/50 text-brand-primary border border-brand-primary/20 rounded-full px-3 py-1 text-xs font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Form Actions */}
                {(isEditing || searchParams.get("edit") === "true") && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        router.push(`/data-anak/${child.child_id}?section=biodata`);
                      }}
                      className="px-4 py-2 border border-base-border/50 hover:bg-base-bg text-base-text-secondary rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        await handleSave();
                        router.push(`/data-anak/${child.child_id}?section=biodata`);
                      }}
                      className="px-4 py-2 bg-brand-primary text-base-white hover:bg-brand-primary/95 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            </>
          )}

          {activeSection === "health_service" && (
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-sm text-base-text-primary">Layanan Kesehatan &amp; Jaminan Sosial</h3>
                {!isEditing && role !== "ibu" && (
                  <button 
                    type="button" 
                    onClick={() => {
                      handleStartEdit();
                      router.push(`/data-anak/${child.child_id}?section=health_service&edit=true`);
                    }}
                    className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <MdEdit className="w-3.5 h-3.5" /> Edit Jaminan
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">No. JKN / BPJS Anak</span>
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <input type="text" name="jkn_number" value={editForm.jkn_number} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{child.jkn_number || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Faskes Tingkat I</span>
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <input type="text" name="faskes_1" value={editForm.faskes_1} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{child.faskes_1 || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Faskes Rujukan</span>
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <input type="text" name="faskes_referral" value={editForm.faskes_referral} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{child.faskes_referral || "-"}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-base-text-secondary block">Asuransi Lain</span>
                  {isEditing || searchParams.get("edit") === "true" ? (
                    <input type="text" name="insurance_other" value={editForm.insurance_other} onChange={handleInputChange} className="w-full px-2.5 py-1.5 border border-brand-primary/30 rounded-lg text-xs" />
                  ) : (
                    <p className="text-sm font-bold text-base-text-primary">{child.insurance_other || "-"}</p>
                  )}
                </div>
              </div>

              {(isEditing || searchParams.get("edit") === "true") && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      router.push(`/data-anak/${child.child_id}?section=health_service`);
                    }}
                    className="px-4 py-2 border border-base-border/50 hover:bg-base-bg text-base-text-secondary rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    onClick={async () => {
                      await handleSave();
                      router.push(`/data-anak/${child.child_id}?section=health_service`);
                    }}
                    className="px-4 py-2 bg-brand-primary text-base-white hover:bg-brand-primary/95 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "newborn_monitoring" && (
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm space-y-6">
              <div className="space-y-6 text-xs">
                
                {/* Gejala Bahaya Neonatus */}
                <div className="space-y-2.5">
                  <h5 className="font-bold text-xs text-brand-primary">I. Pemeriksaan Neonatal Nakes &amp; Tanda Bahaya</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tanda Bahaya Checklist */}
                    <div className="border border-base-border/20 rounded-xl p-4 bg-base-bg/5 space-y-2">
                      <span className="font-bold text-[10px] text-base-text-secondary uppercase block">Tanda Bahaya Bayi Baru Lahir (Buku KIA Hal 36)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-medium">
                        {[
                          "Bayi tidak mau menyusu / muntah", "Bayi kejang", "Bayi lemah / bergerak jika dipegang",
                          "Napas cepat (>60x/menit)", "Napas lambat (<30x/menit)", "Tarikan dinding dada dalam",
                          "Merintih saat bernapas", "Demam / Panas (>37.5 C)", "Suhu dingin (<36 C)",
                          "Mata merah / bernanah", "Kulit bernanah / tali pusat kemerahan", "Kulit/mata kuning"
                        ].map((sign, idx) => {
                          const isChecked = newbornMonitoring.dangerSigns?.[idx] ?? false;
                          return (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-base-bg/30 p-1 rounded-lg transition">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                disabled={role !== "ibu"}
                                onChange={() => {
                                  if (role !== "ibu") return;
                                  const nextDanger = [...newbornMonitoring.dangerSigns];
                                  nextDanger[idx] = !nextDanger[idx];
                                  const nextM = { ...newbornMonitoring, dangerSigns: nextDanger };
                                  setNewbornMonitoring(nextM);
                                  if (child) localStorage.setItem(`newborn_monitoring_${child.child_id}`, JSON.stringify(nextM));
                                }}
                                className="w-3.5 h-3.5 rounded text-status-red-solid cursor-pointer focus:ring-status-red-solid/35 shrink-0" 
                              />
                              <span className={isChecked ? 'text-status-red-solid font-bold' : 'text-base-text-secondary'}>{sign}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kunjungan Neonatal (KN) */}
                    <div className="border border-base-border/20 rounded-xl p-4 bg-base-bg/5 space-y-2.5">
                      <span className="font-bold text-[10px] text-base-text-secondary uppercase block">Pemeriksaan Neonatal (KN) Oleh Dokter/Bidan</span>
                      <div className="space-y-2 font-semibold">
                        {[
                          "KN 1: Hari ke 1-2 (Pelayanan standar bayi baru lahir, salep mata, Vit K1, HB0)",
                          "KN 2: Hari ke 3-7 (Pencegahan stunting, konseling ASI, pencegahan hipotermia)",
                          "KN 3: Hari ke 8-28 (Pemantauan tumbuh kembang harian, deteksi infeksi neonatus)"
                        ].map((label, idx) => {
                          const isChecked = newbornMonitoring.pemeriksaan?.[idx] ?? false;
                          return (
                            <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-base-bg/30 p-1.5 rounded-lg transition">
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                disabled={role !== "ibu"}
                                onChange={() => {
                                  if (role !== "ibu") return;
                                  const nextPem = [...newbornMonitoring.pemeriksaan];
                                  nextPem[idx] = !nextPem[idx];
                                  const nextM = { ...newbornMonitoring, pemeriksaan: nextPem };
                                  setNewbornMonitoring(nextM);
                                  if (child) localStorage.setItem(`newborn_monitoring_${child.child_id}`, JSON.stringify(nextM));
                                }}
                                className="w-4 h-4 text-brand-primary cursor-pointer focus:ring-brand-primary/35 shrink-0" 
                              />
                              <span className={isChecked ? 'text-brand-primary font-bold text-[11px]' : 'text-base-text-secondary text-[11px]'}>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harian List */}
                {(() => {
                  const harianSymptoms = [
                    "Suhu panas / dingin",
                    "Bayi tidak mau menyusu",
                    "Tali pusat kemerahan / berbau",
                    "Mata merah / bernanah",
                    "Kulit berbintil air / bernanah",
                    "Belum mendapat imunisasi HB0 / Vit K1"
                  ];

                  const weeks = [
                    { label: "Minggu 1", days: [1,2,3,4,5,6,7] },
                    { label: "Minggu 2", days: [8,9,10,11,12,13,14] },
                    { label: "Minggu 3", days: [15,16,17,18,19,20,21] },
                    { label: "Minggu 4", days: [22,23,24,25,26,27,28] }
                  ];

                  const handleToggleSymptom = (dayIdx: number, symIdx: number) => {
                    const nextHarian = newbornMonitoring.harianList.map((d: any, i: number) => {
                      if (i !== dayIdx) return d;
                      const nextSymptoms = [...d.symptoms];
                      nextSymptoms[symIdx] = !nextSymptoms[symIdx];
                      return { ...d, symptoms: nextSymptoms };
                    });
                    const nextM = { ...newbornMonitoring, harianList: nextHarian };
                    setNewbornMonitoring(nextM);
                    if (child) localStorage.setItem(`newborn_monitoring_${child.child_id}`, JSON.stringify(nextM));
                  };

                  const getDayStatus = (dayEntry: any) => {
                    if (!dayEntry?.symptoms) return null;
                    const count = dayEntry.symptoms.filter(Boolean).length;
                    return count;
                  };

                  return (
                    <div className="space-y-2.5 border-t pt-4">
                      <h5 className="font-bold text-xs text-brand-primary">II. Lembar Pemantauan Harian (Hari 1-28)</h5>
                      <p className="text-[10px] text-base-text-secondary font-medium leading-relaxed">
                        Centang gejala yang muncul setiap hari. Jika ada tanda, segera hubungi bidan atau puskesmas. (Buku KIA Hal 42-45)
                      </p>

                      <div className="flex gap-1.5 flex-wrap">
                        {weeks.map((wk, wi) => {
                          const weekDayEntries = wk.days.map(d => newbornMonitoring.harianList?.[d - 1]);
                          const weekHasAlert = weekDayEntries.some((d: any) => d?.symptoms?.some(Boolean));
                          return (
                            <button
                              key={wi}
                              type="button"
                              onClick={() => {
                                const nextM = { ...newbornMonitoring, _weekSel: wi };
                                setNewbornMonitoring(nextM);
                                if (child) localStorage.setItem(`newborn_monitoring_${child.child_id}`, JSON.stringify(nextM));
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition border ${(newbornMonitoring._weekSel ?? 0) === wi ? 'bg-brand-primary text-white border-brand-primary' : 'bg-base-white border-base-border/30 text-base-text-secondary hover:border-brand-primary/30'}`}
                            >
                              {wk.label}
                              {weekHasAlert && <span className="w-1.5 h-1.5 rounded-full bg-status-red-solid inline-block animate-pulse" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {weeks[newbornMonitoring._weekSel ?? 0]?.days.map((dayNum: number) => {
                          const dayIdx = dayNum - 1;
                          const dayEntry = newbornMonitoring.harianList?.[dayIdx];
                          const symCount = getDayStatus(dayEntry);
                          const hasAlert = symCount > 0;
                          return (
                            <details key={dayNum} className="group border border-base-border/20 rounded-xl overflow-hidden bg-base-white">
                              <summary className="flex items-center justify-between p-3 cursor-pointer select-none list-none">
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0 ${hasAlert ? 'bg-status-red-solid text-white' : 'bg-brand-soft/20 text-brand-primary'}`}>{dayNum}</span>
                                  <span className="font-bold text-[10px] text-base-text-primary">Hari ke-{dayNum}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {hasAlert ? (
                                    <span className="text-[8px] font-bold text-status-red-solid bg-status-red-light/30 border border-status-red-solid/20 px-1.5 py-0.5 rounded-full animate-pulse">{symCount} Gejala</span>
                                  ) : (
                                    <span className="text-[8px] font-bold text-status-green-solid bg-status-green-light/30 border border-status-green-solid/20 px-1.5 py-0.5 rounded-full">Sehat ✓</span>
                                  )}
                                  <span className="text-base-text-secondary text-[10px] group-open:rotate-180 transition-transform duration-200">▼</span>
                                </div>
                              </summary>
                              <div className="px-3 pb-3 grid grid-cols-1 gap-1.5 border-t border-base-border/10 pt-2.5">
                                {harianSymptoms.map((sym, si) => (
                                  <label key={si} className="flex items-center gap-2 cursor-pointer hover:bg-base-bg/30 px-1.5 py-1 rounded-lg transition">
                                    <input
                                      type="checkbox"
                                      checked={!!dayEntry?.symptoms?.[si]}
                                      onChange={() => handleToggleSymptom(dayIdx, si)}
                                      className="w-3.5 h-3.5 rounded text-status-red-solid cursor-pointer focus:ring-status-red-solid/30 shrink-0"
                                    />
                                    <span className={`text-[10px] font-medium select-none ${dayEntry?.symptoms?.[si] ? 'text-status-red-solid font-bold' : 'text-base-text-secondary'}`}>{sym}</span>
                                  </label>
                                ))}
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Card: Absensi Kelas Ibu Balita */}
                <div className="bg-base-white border border-base-border/20 rounded-xl p-5 shadow-sm space-y-4 mt-6">
                  {(() => {
                    const handleEditKelas = (idx: number, field: string, val: string) => {
                      const nextKelas = newbornMonitoring.kelasBalita.map((k: any, i: number) =>
                        i === idx ? { ...k, [field]: val } : k
                      );
                      const nextM = { ...newbornMonitoring, kelasBalita: nextKelas };
                      setNewbornMonitoring(nextM);
                      if (child) localStorage.setItem(`newborn_monitoring_${child.child_id}`, JSON.stringify(nextM));
                    };

                    const filledCount = newbornMonitoring.kelasBalita?.filter((k: any) => !!k.date).length ?? 0;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h5 className="font-bold text-sm text-brand-primary">III. Absensi Kelas Ibu Balita</h5>
                          <span className="text-xs font-bold text-brand-primary bg-brand-soft/20 px-3 py-1 rounded-full">{filledCount} / 15 Hadir</span>
                        </div>
                        <p className="text-xs text-base-text-secondary leading-relaxed font-medium">
                          Catat kehadiran kelas ibu balita. (Buku KIA Hal 50)
                        </p>
                        <div className="w-full h-2 bg-base-bg/50 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${(filledCount / 15) * 100}%`, '--brand-primary': 'var(--brand-primary)' } as any} />
                        </div>
                        <div className="overflow-x-auto bg-base-white rounded-xl border border-base-border/20">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-brand-soft/10 text-brand-primary font-bold border-b border-base-border/10">
                                <th className="p-3 text-center w-12">No</th>
                                <th className="p-3 text-left w-48">Tanggal Pertemuan</th>
                                <th className="p-3 text-left">Catatan Materi / Nama Fasilitator</th>
                              </tr>
                            </thead>
                            <tbody>
                              {newbornMonitoring.kelasBalita?.map((row: any, idx: number) => (
                                <tr key={idx} className="border-b border-base-border/5 hover:bg-base-bg/20 transition">
                                  <td className="p-3 text-center font-bold text-base-text-secondary">{row.no}</td>
                                  <td className="p-3">
                                    <input
                                      type="date"
                                      value={row.date || ""}
                                      onChange={e => handleEditKelas(idx, 'date', e.target.value)}
                                      className="w-full px-2.5 py-1.5 border border-base-border/20 rounded-lg text-xs focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary"
                                    />
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={row.notes || ""}
                                      onChange={e => handleEditKelas(idx, 'notes', e.target.value)}
                                      placeholder="Catatan materi atau fasilitator..."
                                      className="w-full px-2.5 py-1.5 border border-base-border/20 rounded-lg text-xs focus:outline-none focus:border-brand-primary bg-transparent text-base-text-primary"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeSection === "development_monitoring" && (
            <div className="bg-base-white rounded-bento-lg border border-base-border/30 p-6 shadow-sm">
              <DevelopmentMonitoringTab 
                role={role} 
                child={child} 
                ageRange={monitoringAgeRange}
                setAgeRange={setMonitoringAgeRange}
                milestones69={milestones69} 
                setMilestones69={setMilestones69} 
                milestones912={milestones912}
                setMilestones912={setMilestones912}
                milestones1218={milestones1218}
                setMilestones1218={setMilestones1218}
                milestones1824={milestones1824}
                setMilestones1824={setMilestones1824}
                milestones23={milestones23}
                setMilestones23={setMilestones23}
                milestones34={milestones34}
                setMilestones34={setMilestones34}
                milestones45={milestones45}
                setMilestones45={setMilestones45}
                milestones56={milestones56}
                setMilestones56={setMilestones56}
              />
            </div>
          )}

          {activeSection === "growth_history" && (
            <div className="space-y-6">
              {/* Growth Charts & Antropometri */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Growth Chart curve */}
                <div className="lg:col-span-8 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-pulse"></span>
                      <h2 className="font-bold text-base-text-primary text-base">Kurva Pertumbuhan Balita</h2>
                    </div>
                    <span className="text-[10px] font-bold bg-brand-soft text-brand-primary border border-brand-primary/20 px-2.5 py-1 rounded-full uppercase">
                      {child.measurements.length} Kunjungan
                    </span>
                  </div>

                  {hasHistory ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-base-text-secondary">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-3 h-0.5 bg-[#ea2986] inline-block"></span>
                          <span>Berat Badan (kg)</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-3 h-0.5 bg-[#3b82f6] inline-block"></span>
                          <span>Tinggi Badan (cm)</span>
                        </div>
                      </div>

                      <div className="relative border border-base-border/20 rounded-2xl p-4 bg-base-bg/5 flex items-center justify-center">
                        <svg className="w-full max-w-[500px] h-[160px]" viewBox="0 0 500 160">
                          <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                          <line x1="20" y1="140" x2="480" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                          <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={heightPoints} />
                          <polyline fill="none" stroke="#ea2986" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={weightPoints} />

                          {chronologicalMeasurements.map((m: any, i: number) => {
                            const maxWeight = Math.max(...chronologicalMeasurements.map((x: any) => x.weight), 15);
                            const minWeight = Math.min(...chronologicalMeasurements.map((x: any) => x.weight), 3);
                            const wDiff = maxWeight - minWeight || 1;
                            const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                            const y = 140 - ((m.weight - minWeight) / wDiff) * 100;
                            return (
                              <g key={`w-${i}`} className="group cursor-pointer">
                                <circle cx={x} cy={y} r="4" fill="#ea2986" stroke="#fff" strokeWidth="1.5" />
                              </g>
                            );
                          })}

                          {chronologicalMeasurements.map((m: any, i: number) => {
                            const maxHeight = Math.max(...chronologicalMeasurements.map((x: any) => x.height), 110);
                            const minHeight = Math.min(...chronologicalMeasurements.map((x: any) => x.height), 40);
                            const hDiff = maxHeight - minHeight || 1;
                            const x = (i / (chronologicalMeasurements.length - 1)) * 460 + 20;
                            const y = 140 - ((m.height - minHeight) / hDiff) * 100;
                            return (
                              <g key={`h-${i}`} className="group cursor-pointer">
                                <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 border border-dashed border-base-border/50 rounded-2xl text-center space-y-2 text-base-text-secondary text-sm bg-base-white">
                      <p>Belum memiliki riwayat pemeriksaan posyandu yang cukup.</p>
                      <p className="text-xs">Diperlukan minimal 2 riwayat penimbangan untuk memvisualisasikan tren grafik.</p>
                    </div>
                  )}
                </div>

                {/* Measurements values */}
                <div className="lg:col-span-4 bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-base-border/10 pb-3">
                    <FaNotesMedical className="w-4 h-4 text-brand-primary" />
                    <h3 className="font-bold text-sm text-base-text-primary font-bold">Pengukuran Terakhir</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Berat Badan</span>
                      <p className="text-xl font-bold text-brand-primary mt-1">{child.current_weight || "-"} kg</p>
                    </div>
                    <div className="bg-brand-soft/20 p-3.5 border border-brand-primary/10 rounded-xl relative">
                      <span className="text-[10px] font-bold text-base-text-secondary uppercase block">Tinggi Badan</span>
                      <p className="text-xl font-bold text-brand-primary mt-1">{child.current_height || "-"} cm</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* TABLE log log Posyandu */}
              <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                  <h2 className="font-bold text-base-text-primary text-base">Riwayat Lengkap Kunjungan &amp; Penimbangan</h2>
                </div>

                <div className="overflow-x-auto bg-base-white">
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

            </div>
          )}

        </div>
      )}

      {/* Success Modal Pop-up */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-sm overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary font-bold">Berhasil Diperbarui</h3>
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
              <div className="absolute w-48 h-48 rounded-full border-2 border-brand-primary z-10 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
              
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

// =========================================================================
// KOMPONEN PEMBANTU: SUB-TAB PEMANTAUAN TUMBUH KEMBANG 6-24 BULAN
// =========================================================================
interface DevelopmentMonitoringTabProps {
  role: string; child: any;
  ageRange: '6-9' | '9-12' | '12-18' | '18-24' | '2-3' | '3-4' | '4-5' | '5-6';
  setAgeRange: React.Dispatch<React.SetStateAction<any>>;
  milestones69: any[]; setMilestones69: any;
  milestones912: any[]; setMilestones912: any;
  milestones1218: any[]; setMilestones1218: any;
  milestones1824: any[]; setMilestones1824: any;
  milestones23: any[]; setMilestones23: any;
  milestones34: any[]; setMilestones34: any;
  milestones45: any[]; setMilestones45: any;
  milestones56: any[]; setMilestones56: any;
}

function DevelopmentMonitoringTab({ 
  role, child, ageRange, setAgeRange, 
  milestones69, setMilestones69, milestones912, setMilestones912,
  milestones1218, setMilestones1218, milestones1824, setMilestones1824,
  milestones23, setMilestones23, milestones34, setMilestones34,
  milestones45, setMilestones45, milestones56, setMilestones56
}: DevelopmentMonitoringTabProps) {
  
  const currentList = 
    ageRange === '6-9' ? milestones69 : ageRange === '9-12' ? milestones912 : 
    ageRange === '12-18' ? milestones1218 : ageRange === '18-24' ? milestones1824 :
    ageRange === '2-3' ? milestones23 : ageRange === '3-4' ? milestones34 :
    ageRange === '4-5' ? milestones45 : milestones56;

  const handleRadioChange = (itemId: number, val: boolean) => {
    if (role !== "ibu") return;

    const updateItem = (list: any[]) => list.map(item => item.id === itemId ? { ...item, status: val } : item);

    if (ageRange === '6-9') { const n = updateItem(milestones69); setMilestones69(n); if (child) localStorage.setItem(`milestones_69_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '9-12') { const n = updateItem(milestones912); setMilestones912(n); if (child) localStorage.setItem(`milestones_912_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '12-18') { const n = updateItem(milestones1218); setMilestones1218(n); if (child) localStorage.setItem(`milestones_1218_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '18-24') { const n = updateItem(milestones1824); setMilestones1824(n); if (child) localStorage.setItem(`milestones_1824_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '2-3') { const n = updateItem(milestones23); setMilestones23(n); if (child) localStorage.setItem(`milestones_23_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '3-4') { const n = updateItem(milestones34); setMilestones34(n); if (child) localStorage.setItem(`milestones_34_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '4-5') { const n = updateItem(milestones45); setMilestones45(n); if (child) localStorage.setItem(`milestones_45_${child.child_id}`, JSON.stringify(n)); }
    else if (ageRange === '5-6') { const n = updateItem(milestones56); setMilestones56(n); if (child) localStorage.setItem(`milestones_56_${child.child_id}`, JSON.stringify(n)); }
  };

  const hasDanger = currentList.some(item => item.status === false);

  return (
    <div className="space-y-4 text-xs animate-in fade-in duration-200">
      <div className="bg-brand-soft/20 border border-brand-primary/10 rounded-xl p-4 space-y-1">
        <h4 className="font-bold text-xs text-brand-primary">Evaluasi Perkembangan Anak Mandiri (Buku KIA Complete)</h4>
        <p className="text-base-text-secondary text-[10px] leading-relaxed font-medium">
          {role === "ibu" ? "Silakan centang kondisi perkembangan terkini anak Anda sesuai kelompok umurnya." : "Mode Pemantauan Kader: Menampilkan riwayat pengisian Buku KIA dari Ibu (Read-Only)."}
        </p>
      </div>

      {/* SEGMENTED FILTER UMUR DINAMIS (8 KATEGORI USIA) */}
      <div className="flex bg-base-bg/50 p-1 rounded-xl border border-base-border/20 gap-1 overflow-x-auto hide-scrollbar select-none">
        {[
          { key: '6-9', label: '6-9 Bln' }, { key: '9-12', label: '9-12 Bln' },
          { key: '12-18', label: '12-18 Bln' }, { key: '18-24', label: '18-24 Bln' },
          { key: '2-3', label: '2-3 Thn' }, { key: '3-4', label: '3-4 Thn' },
          { key: '4-5', label: '4-5 Thn' }, { key: '5-6', label: '5-6 Thn' }
        ].map(tab => (
          <button
            key={tab.key} type="button" onClick={() => setAgeRange(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap cursor-pointer ${ageRange === tab.key ? 'bg-brand-primary text-white shadow-sm' : 'text-base-text-secondary hover:text-base-text-primary'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banner Deteksi Dini Keterlambatan */}
      {hasDanger && (
        <div className="p-3 bg-status-red-light/10 border border-status-red-solid/20 rounded-xl text-[10px] text-status-red-solid font-bold leading-relaxed animate-in shake duration-300">
          ⚠️ BERI TANDA (✓) PADA KOLOM TIDAK: Jika anak belum bisa melakukan salah satu dari hal di atas, segera bawa anak ke Puskesmas agar dideteksi dini penyimpangan tumbuh kembangnya!
        </div>
      )}

      {/* Kuesioner Render Output */}
      <div className="space-y-2">
        {currentList.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-base-bg/20 rounded-xl gap-2.5">
            <span className="font-medium text-base-text-primary leading-relaxed">{item.id}. {item.text}</span>
            <div className="flex gap-4 shrink-0 select-none font-semibold">
              <label className={`flex items-center gap-1.5 text-status-green-solid text-[11px] ${role === "ibu" ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                <input type="radio" name={`range-total-q-${item.id}`} checked={item.status === true} disabled={role !== "ibu"} onChange={() => handleRadioChange(item.id, true)} className="accent-status-green-solid w-4 h-4 cursor-pointer" /> Ya
              </label>
              <label className={`flex items-center gap-1.5 text-status-red-solid text-[11px] ${role === "ibu" ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}>
                <input type="radio" name={`range-total-q-${item.id}`} checked={item.status === false} disabled={role !== "ibu"} onChange={() => handleRadioChange(item.id, false)} className="accent-status-red-solid w-4 h-4 cursor-pointer" /> Tidak
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}