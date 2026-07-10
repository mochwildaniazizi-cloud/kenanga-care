"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  UserIcon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon, 
  InformationCircleIcon,
  CameraIcon,
  LockClosedIcon,
  GlobeAltIcon,
  CheckIcon,
  ArrowLeftIcon,
  UsersIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import { MdOutlineError, MdCheckCircleOutline } from "react-icons/md";
import { useUserRole } from "@/context/UserRoleContext";
import { getLoggedInMotherData, getMotherDetail, getMothersData, createMother, deleteMother, updateUserPassword, updateUserAvatar, updateMother, ensureKaderProfileExists } from "@/app/actions/mothers";
import CustomDatePicker from "@/components/CustomDatePicker";

// Component wrapper with Suspense to handle next.js searchParams client-side rendering
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const { role, username } = useUserRole();

  const [activeTab, setActiveTab] = useState<string>("profile");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Crop States
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Profile Form State
  const [formData, setFormData] = useState({
    name: "Kader Siti",
    posyandu: "Posyandu Kenanga 1",
    role: "Ketua Kader",
    email: "siti.posyandu@gmail.com",
    phone: "0812-3456-7890",
    address: "Jl. Mawar No. 12, Kel. Kenanga",
    husband_name: "",
    national_id: ""
  });

  // Account Settings Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [lang, setLang] = useState("id");

  // Sync tab parameter with active state
  useEffect(() => {
    if (tabParam === "help") {
      setActiveTab("help");
    } else if (tabParam === "account") {
      setActiveTab("account");
    } else if (tabParam === "about") {
      setActiveTab("about");
    } else if (tabParam === "users" && role === "kader") {
      setActiveTab("users");
    } else {
      setActiveTab("profile");
    }
  }, [tabParam, role]);

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [motherDetail, setMotherDetail] = useState<any>(null);

  // Users Management states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [newUserForm, setNewUserForm] = useState({
    type: "Ibu / Orang Tua",
    name: "",
    national_id: "",
    phone: "",
    birth_date: "",
    husband_name: "",
    status: "Ibu Hamil",
    role: "Kader Posyandu"
  });

  const refreshUsersList = async () => {
    if (role !== "kader") return;
    try {
      const data = await getMothersData();
      
      const defaultKader = {
        name: "Kader Siti",
        username: "kader",
        role: "Ketua Kader",
        type: "Kader Posyandu",
        phone: "0812-3456-7890",
        status: "Aktif",
      };

      const mappedUsers = data.map((m) => {
        const isDbCadre = m.status === "Kader Posyandu" || (m.national_id && m.national_id.startsWith("KADER-"));
        const rawPhone = m.phone_number || "";
        const rawNik = m.national_id || "";
        
        if (isDbCadre) {
          const cleanUsername = (rawPhone && rawPhone !== "-") ? rawPhone : (rawNik.replace("KADER-", "") || "Tidak ada");
          return {
            name: m.name || "Tanpa Nama",
            username: cleanUsername,
            role: m.condition || "Kader Posyandu",
            type: "Kader Posyandu",
            phone: rawPhone || "-",
            status: "Aktif",
            mother_id: m.mother_id,
            password: m.password || ""
          };
        } else {
          return {
            name: m.name || "Tanpa Nama",
            username: (rawPhone && rawPhone !== "-") ? rawPhone : (rawNik || "Tidak ada"),
            role: m.status || "Ibu Balita",
            type: "Ibu / Orang Tua",
            phone: rawPhone || "-",
            status: "Aktif",
            mother_id: m.mother_id,
            password: m.password || ""
          };
        }
      });

      const filteredMapped = mappedUsers.filter(u => u.username !== "kader");

      setAllUsers([defaultKader, ...filteredMapped]);
    } catch (err) {
      console.error(err);
    }
  };

  // Load mothers for user management if kader
  useEffect(() => {
    if (role === "kader") {
      refreshUsersList();
    }
  }, [role]);

  const handleDeleteUser = async (user: any) => {
    if (user.username === "kader") {
      alert("Akun Kader Utama tidak dapat dihapus.");
      return;
    }
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus akun ${user.name}?`);
    if (!confirmDelete) return;

    if (!user.mother_id) {
      alert("ID Pengguna tidak valid.");
      return;
    }
    try {
      const res = await deleteMother(user.mother_id);
      if (res.success) {
        setSuccessMessage(`Akun ${user.name} berhasil dihapus.`);
        setShowSuccessModal(true);
        refreshUsersList();
      } else {
        alert(res.error || "Gagal menghapus akun.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.national_id || !newUserForm.phone) {
      alert("Nama, NIK/Identitas, dan Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsCreatingUser(true);
    try {
      if (newUserForm.type === "Kader Posyandu") {
        const motherData = {
          national_id: "KADER-" + newUserForm.national_id,
          mother_name: newUserForm.name,
          phone_number: newUserForm.phone,
          ui_status: "Kader Posyandu",
          risk_status: newUserForm.role || "Kader Posyandu",
          husband_name: "Kader",
          number_of_children: 0
        };

        if (!navigator.onLine) {
          const pending = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");
          pending.push(motherData);
          localStorage.setItem("pending_create_mothers", JSON.stringify(pending));

          setSuccessMessage(`Akun Kader ${newUserForm.name} disimpan secara offline di browser Anda.`);
          setShowSuccessModal(true);
          setShowAddUserModal(false);
          refreshUsersList();
          
          setNewUserForm({
            type: "Ibu / Orang Tua",
            name: "",
            national_id: "",
            phone: "",
            birth_date: "",
            husband_name: "",
            status: "Ibu Hamil",
            role: "Kader Posyandu"
          });
          return;
        }

        const res = await createMother(motherData);

        if (res.success) {
          setSuccessMessage(`Akun Kader ${newUserForm.name} berhasil ditambahkan ke database.`);
          setShowSuccessModal(true);
          setShowAddUserModal(false);
          refreshUsersList();
          
          setNewUserForm({
            type: "Ibu / Orang Tua",
            name: "",
            national_id: "",
            phone: "",
            birth_date: "",
            husband_name: "",
            status: "Ibu Hamil",
            role: "Kader Posyandu"
          });
        } else {
          alert(res.error || "Gagal membuat akun Kader.");
        }
      } else {
        const birthDateObj = newUserForm.birth_date ? new Date(newUserForm.birth_date) : null;
        let ageVal = 0;
        if (birthDateObj) {
          ageVal = new Date().getFullYear() - birthDateObj.getFullYear();
        }

        const motherData = {
          national_id: newUserForm.national_id,
          mother_name: newUserForm.name,
          birth_date: newUserForm.birth_date,
          age: ageVal.toString(),
          husband_name: newUserForm.husband_name,
          phone_number: newUserForm.phone,
          ui_status: newUserForm.status,
          risk_status: "Normal",
          number_of_children: 0
        };

        if (!navigator.onLine) {
          const pending = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");
          pending.push(motherData);
          localStorage.setItem("pending_create_mothers", JSON.stringify(pending));

          setSuccessMessage(`Akun Ibu ${newUserForm.name} disimpan secara offline di browser Anda.`);
          setShowSuccessModal(true);
          setShowAddUserModal(false);
          refreshUsersList();
          
          setNewUserForm({
            type: "Ibu / Orang Tua",
            name: "",
            national_id: "",
            phone: "",
            birth_date: "",
            husband_name: "",
            status: "Ibu Hamil",
            role: "Kader Posyandu"
          });
          return;
        }

        const res = await createMother(motherData);

        if (res.success) {
          setSuccessMessage(`Akun Ibu ${newUserForm.name} berhasil ditambahkan ke database.`);
          setShowSuccessModal(true);
          setShowAddUserModal(false);
          refreshUsersList();
          
          setNewUserForm({
            type: "Ibu / Orang Tua",
            name: "",
            national_id: "",
            phone: "",
            birth_date: "",
            husband_name: "",
            status: "Ibu Hamil",
            role: "Kader Posyandu"
          });
        } else {
          alert(res.error || "Gagal membuat akun.");
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback save offline
      const usernameVal = newUserForm.phone;
      const fallbackData = {
        national_id: newUserForm.type === "Kader Posyandu" ? "KADER-" + newUserForm.national_id : newUserForm.national_id,
        mother_name: newUserForm.name,
        phone_number: newUserForm.phone,
        ui_status: newUserForm.type === "Kader Posyandu" ? "Kader Posyandu" : newUserForm.status,
        risk_status: newUserForm.type === "Kader Posyandu" ? (newUserForm.role || "Kader Posyandu") : "Normal",
        husband_name: newUserForm.type === "Kader Posyandu" ? "Kader" : newUserForm.husband_name,
        number_of_children: 0
      };
      const pending = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");
      pending.push(fallbackData);
      localStorage.setItem("pending_create_mothers", JSON.stringify(pending));

      setSuccessMessage(`Gagal menghubungi server. Akun ${newUserForm.name} disimpan secara offline.`);
      setShowSuccessModal(true);
      setShowAddUserModal(false);
      refreshUsersList();
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Load from local storage or database
  useEffect(() => {
    async function loadProfileData() {
      setIsProfileLoading(true);
      const startTime = Date.now();

      const savedAvatar = username ? localStorage.getItem(`user_profile_avatar_${username}`) : null;
      if (savedAvatar) {
        setAvatarUrl(savedAvatar);
      }
      
      try {
        const loggedInUser = await getLoggedInMotherData(username);
        if (loggedInUser) {
          const detail = await getMotherDetail(loggedInUser.mother_id);
          if (detail) {
            setMotherDetail(detail);
            if (detail.avatarUrl) {
              setAvatarUrl(detail.avatarUrl);
              localStorage.setItem(`user_profile_avatar_${username}`, detail.avatarUrl);
            } else {
              setAvatarUrl(null);
              localStorage.removeItem(`user_profile_avatar_${username}`);
            }
            
            const savedEmail = localStorage.getItem(`${role}_email`) || `${detail.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
            const savedAddress = localStorage.getItem(`${role}_address`) || "Jl. Mawar No. 12, Kel. Kenanga";
            
            setFormData({
              name: detail.name || "",
              posyandu: "Posyandu Kenanga 1",
              role: detail.status || (role === "kader" ? "Kader Posyandu" : "Ibu Balita"),
              email: savedEmail,
              phone: detail.phone_number || "",
              address: savedAddress,
              husband_name: detail.husband_name || "",
              national_id: detail.national_id || ""
            });
            
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 800 - elapsed);
            setTimeout(() => {
              setIsProfileLoading(false);
            }, remaining);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load user profile from database:", err);
      }

      // Fallback for static bypass kader account or offline mode
      if (role === "ibu") {
        const savedName = localStorage.getItem("ibu_name") || "Siti Aminah";
        const savedPhone = localStorage.getItem("ibu_phone") || "0899-1234-5678";
        const savedEmail = localStorage.getItem("ibu_email") || "ibu.aminah@gmail.com";
        const savedAddress = localStorage.getItem("ibu_address") || "Jl. Mawar No. 12, Kel. Kenanga";
        const savedHusband = localStorage.getItem("ibu_husband") || "Budi Santoso";
        
        setFormData({
          name: savedName,
          posyandu: "Posyandu Kenanga 1",
          role: "Ibu Balita",
          email: savedEmail,
          phone: savedPhone,
          address: savedAddress,
          husband_name: savedHusband,
          national_id: "3273010203040005"
        });
      } else {
        const savedName = localStorage.getItem("kader_name") || "Kader Siti";
        const savedPhone = localStorage.getItem("kader_phone") || "0812-3456-7890";
        const savedEmail = localStorage.getItem("kader_email") || "siti.posyandu@gmail.com";
        const savedAddress = localStorage.getItem("kader_address") || "Jl. Mawar No. 12, Kel. Kenanga";
        
        setFormData({
          name: savedName,
          posyandu: "Posyandu Kenanga 1",
          role: "Ketua Kader",
          email: savedEmail,
          phone: savedPhone,
          address: savedAddress,
          husband_name: "",
          national_id: "KADER-SITI"
        });
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 800 - elapsed);
      setTimeout(() => {
        setIsProfileLoading(false);
      }, remaining);
    }
    
    loadProfileData();
  }, [role, username]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === "ibu") {
      localStorage.setItem("ibu_name", formData.name);
      localStorage.setItem("ibu_phone", formData.phone);
      localStorage.setItem("ibu_email", formData.email);
      localStorage.setItem("ibu_address", formData.address);
      localStorage.setItem("ibu_husband", formData.husband_name);
    } else {
      localStorage.setItem("kader_name", formData.name);
      localStorage.setItem("kader_posyandu", formData.posyandu);
      localStorage.setItem("kader_role", formData.role);
      localStorage.setItem("kader_email", formData.email);
      localStorage.setItem("kader_phone", formData.phone);
      localStorage.setItem("kader_address", formData.address);
    }

    // Save to PostgreSQL database if backed by database record
    if (motherDetail && motherDetail.mother_id) {
      try {
        const res = await updateMother(motherDetail.mother_id, {
          national_id: formData.national_id || motherDetail.national_id,
          mother_name: formData.name,
          birth_date: motherDetail.dobRaw || null,
          husband_name: formData.husband_name || null,
          phone_number: formData.phone || null,
          blood_type: motherDetail.blood_type || null,
          estimated_due_date: motherDetail.rawHpl || null,
          risk_status: motherDetail.condition || null,
          ui_status: formData.role || motherDetail.status
        });
        
        if (res && !res.success) {
          alert(res.error || "Gagal memperbarui data profil di database.");
          return;
        }
      } catch (err) {
        console.error("Failed to update profile to database:", err);
      }
    } else if (role === "kader" && username === "kader") {
      // Default kader account — upsert into Supabase
      try {
        await ensureKaderProfileExists(formData.name, formData.phone);
      } catch (err) {
        console.error("Failed to upsert default kader profile to database:", err);
      }
    }

    // Dispatch update event for Header sync
    window.dispatchEvent(new Event("profile-updated"));

    setSuccessMessage("Informasi profil Anda telah berhasil diperbarui dan disimpan.");
    setShowSuccessModal(true);
  };

  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 150;
          const MAX_HEIGHT = 150;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
            resolve(compressedBase64);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

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
    img.onload = async () => {
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
      setAvatarUrl(croppedBase64);
      localStorage.setItem(`user_profile_avatar_${username}`, croppedBase64);
      setCropImageSrc(null);

      // Save to Supabase DB or default kader upsert
      if (username === "kader" || username.toLowerCase() === "kader") {
        try {
          const kaderProfile = await ensureKaderProfileExists(formData.name || "Kader Siti", formData.phone || undefined);
          if (kaderProfile?.mother_id) {
            await updateMother(kaderProfile.mother_id, { 
              national_id: "KADER-DEFAULT",
              mother_name: formData.name || "Kader Siti",
              avatarUrl: croppedBase64
            });
          }
        } catch (err) {
          console.error("Failed to persist kader avatar to database:", err);
        }
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        const res = await updateUserAvatar(username, croppedBase64);
        if (res && res.success) {
          window.dispatchEvent(new Event("profile-updated"));
        } else {
          console.warn("Avatar sync failed:", res?.error);
          window.dispatchEvent(new Event("profile-updated"));
        }
      }
    };
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Harap isi semua kolom kata sandi.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }

    try {
      const res = await updateUserPassword(username, passwordData.currentPassword, passwordData.newPassword, role);
      if (res && res.success) {
        setSuccessMessage("Kata sandi Anda berhasil diperbarui.");
        setShowSuccessModal(true);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(res?.error || "Gagal mengubah kata sandi. Periksa kata sandi saat ini.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menyimpan kata sandi.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "KS";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-8 pb-28 lg:pb-8 animate-in fade-in duration-300">
      
      {/* Back to dashboard & header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-base-white border border-base-border/30 rounded-xl text-base-text-secondary hover:text-brand-primary transition hover:shadow-sm">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Pengaturan</h1>
            <p className="text-xs md:text-sm text-base-text-secondary">Kelola informasi profil, preferensi akun, dan akses pusat bantuan.</p>
          </div>
        </div>
      </div>

      {isProfileLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* Top Bento Menu Skeleton */}
          <div className="bg-card p-4 rounded-bento-md shadow-sm border border-base-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4 h-20">
            <div className="flex items-center gap-4 shrink-0 pr-4 w-full max-w-xs">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex gap-2 w-full max-w-md">
              <div className="h-8 bg-gray-100 rounded-xl w-24"></div>
              <div className="h-8 bg-gray-100 rounded-xl w-24"></div>
              <div className="h-8 bg-gray-100 rounded-xl w-24"></div>
            </div>
          </div>

          {/* Form Content Skeleton */}
          <div className="bg-card rounded-bento-lg p-6 md:p-8 shadow-sm border border-base-border/20">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Image Column */}
              <div className="flex flex-col items-center md:items-start gap-4 shrink-0">
                <div className="w-28 h-28 rounded-full bg-gray-200"></div>
                <div className="h-8 bg-gray-100 rounded-xl w-32"></div>
              </div>
              
              {/* Profile Details Column */}
              <div className="flex-1 space-y-6 w-full">
                <div className="h-5 bg-gray-250 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-100 border border-base-border/10 rounded-xl w-full"></div>
                    </div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-32 mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        
        {/* Top Side: Horizontal Bento Menu Tabs */}
        <div className="bg-card p-4 rounded-bento-md shadow-sm border border-base-border/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0 pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-base-border/20 pr-4">
            <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center font-bold text-brand-primary border border-brand-primary/20 text-sm shrink-0">
              {getInitials(formData.name)}
            </div>
            <div>
              <h2 className="font-bold text-base-text-primary leading-tight text-sm">{formData.name}</h2>
              <p className="text-[10px] text-base-text-secondary mt-0.5">{formData.role} • {formData.posyandu}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-base-border/50 scrollbar-track-transparent pr-2 w-full">
            {/* 1. Profil Saya */}
            <button
              onClick={() => { setActiveTab("profile"); router.push("/setting"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition duration-150 cursor-pointer shrink-0 text-xs font-bold ${
                activeTab === "profile" 
                  ? "bg-brand-primary text-base-white font-semibold shadow-md"
                  : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profil Saya</span>
            </button>

            {/* 2. Kelola Pengguna (Placed after Profil Saya) */}
            {role === "kader" && (
              <button
                onClick={() => { setActiveTab("users"); router.push("/setting?tab=users"); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition duration-150 cursor-pointer shrink-0 text-xs font-bold ${
                  activeTab === "users" 
                    ? "bg-brand-primary text-base-white font-semibold shadow-md"
                    : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary"
                }`}
              >
                <UsersIcon className="w-4 h-4" />
                <span>Kelola Pengguna</span>
              </button>
            )}

            {/* 3. Pengaturan Akun */}
            <button
              onClick={() => { setActiveTab("account"); router.push("/setting?tab=account"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition duration-150 cursor-pointer shrink-0 text-xs font-bold ${
                activeTab === "account" 
                  ? "bg-brand-primary text-base-white font-semibold shadow-md"
                  : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Pengaturan Akun</span>
            </button>

            {/* 4. Pusat Bantuan */}
            <button
              onClick={() => { setActiveTab("help"); router.push("/setting?tab=help"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition duration-150 cursor-pointer shrink-0 text-xs font-bold ${
                activeTab === "help" 
                  ? "bg-brand-primary text-base-white font-semibold shadow-md"
                  : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
              <span>Pusat Bantuan</span>
            </button>

            {/* 5. Tentang Aplikasi */}
            <button
              onClick={() => { setActiveTab("about"); router.push("/setting?tab=about"); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-left transition duration-150 cursor-pointer shrink-0 text-xs font-bold ${
                activeTab === "about" 
                  ? "bg-brand-primary text-base-white font-semibold shadow-md"
                  : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary"
              }`}
            >
              <InformationCircleIcon className="w-4 h-4" />
              <span>Tentang Aplikasi</span>
            </button>
          </div>
        </div>

        {/* Right Side: Bento Content Area */}
        <div className="bg-card p-6 md:p-8 rounded-bento-md shadow-sm border border-base-border/20 min-h-[450px]">
          
          {/* TAB 1: PROFIL SAYA */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-base-text-primary">Profil Saya</h3>
                <p className="text-xs md:text-sm text-base-text-secondary">Perbarui detail profil Anda untuk digunakan pada laporan Posyandu.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                {/* Avatar change */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-base-bg/30 border border-base-border/20 rounded-2xl w-fit">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer w-20 h-20 bg-brand-soft rounded-full flex items-center justify-center font-bold text-brand-primary border border-brand-primary/20 text-3xl overflow-hidden"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={formData.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(formData.name)
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150">
                      <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="font-semibold text-sm text-base-text-primary">Foto Profil</h4>
                    <p className="text-[11px] text-base-text-secondary">Unggah foto format JPG/PNG, ukuran maks. 2 MB</p>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-base-white border border-base-border/50 text-[11px] rounded-lg text-base-text-primary hover:bg-brand-soft hover:text-brand-primary transition cursor-pointer"
                    >
                      Pilih File
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* NIK or Posyandu */}
                  {role === "ibu" ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-base-text-primary block">NIK Ibu</label>
                      <input 
                        type="text" 
                        disabled
                        value={formData.national_id} 
                        className="w-full bg-base-bg border border-base-border/30 rounded-xl px-4 py-2.5 text-sm text-base-text-secondary transition bg-base-bg/50 cursor-not-allowed font-semibold"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-base-text-primary block">Posyandu</label>
                      <input 
                        type="text" 
                        required
                        value={formData.posyandu} 
                        onChange={(e) => setFormData({...formData, posyandu: e.target.value})}
                        className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                      />
                    </div>
                  )}

                  {/* Status Ibu or Jabatan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">
                      {role === "ibu" ? "Status Ibu" : "Jabatan"}
                    </label>
                    <input 
                      type="text" 
                      required
                      disabled={role === "ibu"}
                      value={formData.role} 
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition ${
                        role === "ibu" ? "bg-base-bg/50 text-base-text-secondary cursor-not-allowed font-semibold" : ""
                      }`}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Nomor WhatsApp / HP</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Nama Suami (Only for Ibu) */}
                  {role === "ibu" && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-base-text-primary block">Nama Suami</label>
                      <input 
                        type="text" 
                        required
                        value={formData.husband_name} 
                        onChange={(e) => setFormData({...formData, husband_name: e.target.value})}
                        className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-base-text-primary block">Alamat Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-base-text-primary block">
                      {role === "ibu" ? "Alamat Rumah" : "Alamat Kerja / Posyandu"}
                    </label>
                    <textarea 
                      rows={3}
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-brand-primary text-base-white font-bold text-sm hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/20 cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PENGATURAN AKUN */}
          {activeTab === "account" && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary">Keamanan Kata Sandi</h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Ubah kata sandi Anda secara berkala untuk menjaga keamanan data.</p>
                </div>

                <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Kata Sandi Sekarang</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Masukkan kata sandi lama"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Minimal 6 karakter"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-base-text-primary block">Konfirmasi Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Ulangi kata sandi baru"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-base-white rounded-lg text-sm font-semibold hover:bg-status-pink-dark transition shadow-md cursor-pointer"
                  >
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Ubah Kata Sandi</span>
                  </button>
                </form>
              </div>

              <hr className="border-t border-base-border/20" />

              {/* Preference: Language */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary flex items-center gap-2">
                    <GlobeAltIcon className="w-5 h-5 text-base-text-secondary" />
                    <span>Bahasa (Language)</span>
                  </h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Pilih bahasa pengantar antarmuka sistem dashboard.</p>
                </div>

                <div className="max-w-xs">
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-base-bg border border-base-border/40 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary text-base-text-primary transition cursor-pointer appearance-none"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUSAT BANTUAN */}
          {activeTab === "help" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-base-text-primary">Pusat Bantuan</h3>
                <p className="text-xs md:text-sm text-base-text-secondary">Temukan panduan cepat dan jawaban atas pertanyaan umum seputar dashboard Kenanga Care.</p>
              </div>

              <div className="space-y-4">
                {/* Accordion FAQ 1 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150" open>
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Bagaimana cara menyinkronkan data secara offline?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Sistem dirancang dengan teknologi PWA (Progressive Web App). Data pengukuran anak atau ibu yang diinputkan saat offline akan otomatis disimpan di cache lokal peramban. Ketika koneksi internet Anda terhubung kembali, data akan otomatis terkirim dan disinkronkan ke server database Supabase. Anda dapat melihat status sinkronisasi aktif melalui ikon awan pada Header di kanan atas.
                  </p>
                </details>

                {/* Accordion FAQ 2 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150">
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Mengapa ada batasan nilai input angka negatif?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Demi keakuratan rekam medis anak (seperti berat badan, tinggi badan, lingkar kepala, dan umur), sistem menyertakan validasi otomatis `min="0"`. Ini mencegah kader salah menginputkan nilai minus atau negatif yang berisiko merusak hasil grafik status gizi anak.
                  </p>
                </details>

                {/* Accordion FAQ 3 */}
                <details className="group border border-base-border/30 rounded-xl p-4 bg-base-bg/10 hover:bg-base-bg/30 transition duration-150">
                  <summary className="font-semibold text-sm text-base-text-primary cursor-pointer flex justify-between items-center list-none select-none">
                    <span>Bagaimana cara menghubungi administrator posyandu?</span>
                    <span className="text-base-text-secondary transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-base-text-secondary mt-3 leading-relaxed">
                    Apabila Anda mengalami kendala teknis atau masalah otentikasi login yang berkelanjutan, silakan hubungi tim IT Puskesmas wilayah Anda atau hubungi nomor layanan Kenanga Care melalui WhatsApp di +62-812-3456-7890.
                  </p>
                </details>
              </div>
            </div>
          )}

          {/* TAB 4: TENTANG APLIKASI */}
          {activeTab === "about" && (
            <div className="space-y-8 flex flex-col justify-center items-center py-6 h-full text-center">
              <div className="w-20 h-20 bg-brand-soft rounded-2xl flex items-center justify-center text-4xl shadow-md border border-brand-primary/10">
                🌸
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-brand-primary tracking-tight">Kenanga Care</h3>
                <p className="text-sm font-semibold text-base-text-primary">Dashboard Pemantauan Kesehatan Balita & Ibu Hamil</p>
                <p className="text-xs text-base-text-secondary">Kader Version: 1.2.0 • Offline-First PWA Support</p>
              </div>

              <div className="max-w-md bg-base-bg/30 border border-base-border/20 rounded-xl p-4 text-xs text-base-text-secondary leading-relaxed">
                Aplikasi ini dikembangkan untuk memfasilitasi pencatatan, pemantauan, dan deteksi dini stunting secara digital di Posyandu Kenanga. Mendukung sinkronisasi otomatis, visualisasi status gizi dinamis, dan ramah pengguna.
              </div>

              <div className="text-[11px] text-base-text-secondary/70">
                © 2026 Posyandu Kenanga. All rights reserved.
              </div>
            </div>
          )}

          {/* TAB 5: KELOLA PENGGUNA (Only for Kader) */}
          {activeTab === "users" && role === "kader" && (
            <div className="space-y-6 pb-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-base-text-primary">Kelola Pengguna</h3>
                  <p className="text-xs md:text-sm text-base-text-secondary">Daftar akun Kader dan Ibu yang terdaftar di database Posyandu Kenanga 1.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Search Input */}
                  <div className="relative max-w-xs w-full">
                    <input
                      type="text"
                      placeholder="Cari nama atau username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-base-bg border border-base-border/40 focus:border-brand-primary rounded-xl py-2 px-4 pl-9 text-xs outline-none transition-colors text-base-text-primary focus:bg-base-white"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-2.5 w-4 h-4 text-base-text-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                    </svg>
                  </div>

                  {/* Add User Button */}
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="px-4 py-2 rounded-xl bg-brand-primary text-base-white text-xs font-bold hover:bg-status-pink-dark transition flex items-center gap-1.5 shrink-0 shadow-md shadow-brand-primary/10 cursor-pointer"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Table / Cards */}
              <div className="border border-base-border/20 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-base-bg/50 border-b border-base-border/20 text-xs font-bold text-base-text-secondary uppercase">
                        <th className="py-3 px-4">Nama Lengkap</th>
                        <th className="py-3 px-4">Username (Akses)</th>
                        <th className="py-3 px-4">Kata Sandi</th>
                        <th className="py-3 px-4">Tipe Akun</th>
                        <th className="py-3 px-4">Peran / Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-base-border/10 text-xs">
                      {(allUsers.filter(user => 
                        (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
                      )).length > 0 ? (
                        (allUsers.filter(user => 
                          (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
                        )).map((user, idx) => (
                          <tr key={idx} className="hover:bg-base-bg/25 transition duration-150">
                            <td className="py-3.5 px-4 font-bold text-base-text-primary">{user.name}</td>
                            <td className="py-3.5 px-4 font-mono text-base-text-secondary">{user.username}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base-text-primary font-semibold">
                                  {visiblePasswords[user.username] 
                                    ? (user.password || (user.type === "Kader Posyandu" ? "kader123" : "ibu123")) 
                                    : "••••••"
                                  }
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setVisiblePasswords(prev => ({ ...prev, [user.username]: !prev[user.username] }))}
                                  className="text-base-text-secondary hover:text-brand-primary p-0.5 rounded cursor-pointer"
                                  title="Tampilkan Sandi"
                                >
                                  {visiblePasswords[user.username] ? (
                                    <EyeSlashIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <EyeIcon className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-base-text-secondary">{user.type}</td>
                            <td className="py-3.5 px-4 font-semibold text-base-text-secondary">{user.role}</td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setSuccessMessage(`Akses & Kata sandi untuk ${user.name} berhasil di-reset ke default.`);
                                  setShowSuccessModal(true);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-base-border/50 text-[10px] text-base-text-primary font-bold hover:bg-brand-soft hover:text-brand-primary transition cursor-pointer"
                              >
                                Reset
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                disabled={user.username === "kader"}
                                className="px-3 py-1.5 rounded-lg border border-status-red-solid/20 text-[10px] text-status-red-solid font-bold hover:bg-status-red-solid/10 disabled:opacity-50 transition cursor-pointer"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-sm text-base-text-secondary font-medium">
                            Tidak ada pengguna ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Tambah Pengguna */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
                  <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-lg overflow-y-auto max-h-[90vh] border border-base-border/20">
                    <form onSubmit={handleCreateUser}>
                      <div className="p-6 space-y-4">
                        <h3 className="text-xl font-bold text-base-text-primary">Registrasi Pengguna Baru</h3>
                        <p className="text-xs text-base-text-secondary">Daftarkan akun Kader baru atau Ibu baru ke database sistem.</p>
                        
                        <div className="space-y-4">
                          {/* Account Type */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-base-text-primary">Tipe Akun</label>
                            <select
                              value={newUserForm.type}
                              onChange={(e) => setNewUserForm({ ...newUserForm, type: e.target.value })}
                              className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                            >
                              <option value="Ibu / Orang Tua">Ibu / Orang Tua (Simpan di Database)</option>
                              <option value="Kader Posyandu">Kader Posyandu (Simpan di LocalStorage)</option>
                            </select>
                          </div>

                          {/* Full Name */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-base-text-primary">Nama Lengkap</label>
                            <input
                              type="text"
                              required
                              placeholder="Masukkan nama lengkap"
                              value={newUserForm.name}
                              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                              className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                            />
                          </div>

                          {/* NIK */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-base-text-primary">NIK (Nomor Induk Kependudukan)</label>
                            <input
                              type="text"
                              required
                              placeholder="Masukkan NIK 16 digit"
                              value={newUserForm.national_id}
                              onChange={(e) => setNewUserForm({ ...newUserForm, national_id: e.target.value })}
                              className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                            />
                          </div>

                          {/* WhatsApp/Phone (Username) */}
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-base-text-primary">Nomor WhatsApp (Digunakan untuk Login)</label>
                            <input
                              type="text"
                              required
                              placeholder="Contoh: 081222575562"
                              value={newUserForm.phone}
                              onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                              className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                            />
                          </div>

                          {/* Conditional inputs for Mother */}
                          {newUserForm.type === "Ibu / Orang Tua" ? (
                            <>
                              {/* Husband's Name */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-base-text-primary">Nama Suami</label>
                                <input
                                  type="text"
                                  placeholder="Masukkan nama suami"
                                  value={newUserForm.husband_name}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, husband_name: e.target.value })}
                                  className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                                />
                              </div>

                              {/* Birth Date */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-base-text-primary">Tanggal Lahir Ibu</label>
                                <CustomDatePicker
                                  value={newUserForm.birth_date}
                                  onChange={(val) => setNewUserForm({ ...newUserForm, birth_date: val })}
                                />
                              </div>

                              {/* Status */}
                              <div className="space-y-1">
                                <label className="block text-xs font-bold text-base-text-primary">Status Ibu</label>
                                <select
                                  value={newUserForm.status}
                                  onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                                  className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                                >
                                  <option value="Ibu Hamil">Ibu Hamil</option>
                                  <option value="Ibu Menyusui">Ibu Menyusui</option>
                                  <option value="Ibu Nifas">Ibu Nifas</option>
                                </select>
                              </div>
                            </>
                          ) : (
                            /* Conditional inputs for Kader */
                            <div className="space-y-1">
                              <label className="block text-xs font-bold text-base-text-primary">Peran / Jabatan Kader</label>
                              <select
                                value={newUserForm.role}
                                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                                className="w-full px-4 py-2 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                              >
                                <option value="Kader Posyandu">Kader Posyandu</option>
                                <option value="Ketua Kader">Ketua Kader</option>
                                <option value="Bidan Desa">Bidan Desa</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3 rounded-b-2xl">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="flex-1 py-2 rounded-xl border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-bold text-xs hover:bg-base-white transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingUser}
                          className="flex-1 py-2 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-status-pink-dark transition shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          {isCreatingUser ? "Mendaftarkan..." : "Daftarkan Pengguna"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      )}

      {/* Success Alert Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Berhasil Disimpan</h3>
              <p className="text-sm text-base-text-secondary">
                {successMessage}
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => setShowSuccessModal(false)}
                className="w-full max-w-[200px] py-2.5 rounded-xl bg-status-green-solid text-base-white font-bold hover:bg-status-green-solid/90 transition shadow-sm cursor-pointer"
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
