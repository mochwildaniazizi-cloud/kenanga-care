"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  CloudIcon, 
  CheckIcon, 
  ArrowPathIcon,
  HomeIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  XMarkIcon,
  Cog6ToothIcon,
  UserIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from "@heroicons/react/24/solid";

import { MdPregnantWoman } from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";
import { useUserRole } from "@/context/UserRoleContext";
import { createChildMeasurement } from "@/app/actions/children";
import { createMaternalRecord, createMother } from "@/app/actions/mothers";

const breadcrumbs: Record<string, { label: string; icon: any; parent?: string; parentLabel?: string }> = {
  "/": { label: "Beranda", icon: HomeIcon },
  "/data-anak": { label: "Data Anak", icon: PiBabyFill },
  "/data-anak/tambah": { label: "Data Anak", icon: PiBabyFill, parent: "/data-anak", parentLabel: "Tambah Anak" },
  "/data-anak/[id]": { label: "Data Anak", icon: PiBabyFill, parent: "/data-anak", parentLabel: "Detail Balita" },
  "/data-ibu": { label: "Data Ibu", icon: MdPregnantWoman },
  "/data-ibu/tambah": { label: "Data Ibu", icon: MdPregnantWoman, parent: "/data-ibu", parentLabel: "Tambah Ibu" },
  "/data-ibu/[id]": { label: "Data Ibu", icon: MdPregnantWoman, parent: "/data-ibu", parentLabel: "Detail Ibu" },
  "/edukasi": { label: "Edukasi", icon: BookOpenIcon },
  "/jadwal": { label: "Jadwal", icon: CalendarDaysIcon },
  "/setting": { label: "Pengaturan", icon: Cog6ToothIcon },
};

import { showLocalNotification, requestNotificationPermission } from "@/utils/notifications";

export default function Header() {
  const [syncStatus, setSyncStatus] = useState<"success" | "reconnecting" | "offline">("success");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "Kader Siti",
    posyandu: "Posyandu Kenanga 1"
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { role, setRole, logout, isLoggedIn } = useUserRole();

  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync profile from local storage and custom events
  useEffect(() => {
    const loadProfile = () => {
      const isIbu = role === "ibu";
      const savedName = isIbu 
        ? (localStorage.getItem("ibu_name") || localStorage.getItem("logged_username") || "Siti Aminah")
        : (localStorage.getItem("kader_name") || "Kader Siti");
      const savedPosyandu = isIbu
        ? "Posyandu Kenanga 1"
        : (localStorage.getItem("kader_posyandu") || "Posyandu Kenanga 1");
      setProfile({
        name: savedName,
        posyandu: savedPosyandu
      });
      
      const savedAvatar = localStorage.getItem("user_profile_avatar");
      setAvatarUrl(savedAvatar);
    };

    loadProfile();
    window.addEventListener("profile-updated", loadProfile);

    // Initial check for dark mode (defaults to light mode)
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [role]);

  // Online/Offline listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSyncStatus(navigator.onLine ? "success" : "offline");

    const handleOnline = async () => {
      setSyncStatus("reconnecting");
      try {
        const count = await runActualSync();
        setTimeout(() => {
          setSyncStatus("success");
          window.dispatchEvent(new Event("sync-data"));
          window.dispatchEvent(new Event("profile-updated"));
          showLocalNotification("Koneksi Terhubung 🟢", {
            body: count > 0 
              ? `Aplikasi kembali online. Berhasil menyinkronkan ${count} data baru ke server!`
              : "Aplikasi kembali online. Semua data tersinkronisasi.",
          });
        }, 1500);
      } catch (err) {
        setSyncStatus("success");
      }
    };

    const handleOffline = () => {
      setSyncStatus("offline");
      showLocalNotification("Mode Offline Aktif 🔴", {
        body: "Koneksi terputus. Data Anda akan disimpan secara lokal di cache peramban.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const kaderNotifications = [
    { category: "Jadwal Posyandu", time: "1 jam yang lalu", message: "Pelaksanaan Posyandu Kenanga 1 dijadwalkan besok mulai pukul 08:00 WIB." },
    { category: "Balita Kurang Gizi", time: "4 jam yang lalu", message: "Sistem mendeteksi 3 balita di wilayah Anda memiliki kurva pertumbuhan menurun. Mohon pantau PMT." },
    { category: "Imunisasi Balita", time: "1 hari yang lalu", message: "Pengingat: Jadwal imunisasi Campak & BCG untuk Balita sudah siap diinput bulan ini." }
  ];

  const ibuNotifications = [
    { category: "Jadwal Rutin", time: "1 jam yang lalu", message: "Halo Ibu, Posyandu Kenanga 1 akan mengadakan imunisasi balita besok pagi. Jangan lupa membawa KIA." },
    { category: "Vitamin A Anak", time: "6 jam yang lalu", message: "Jadwal pembagian Vitamin A untuk Balita Anda (Bagas Pratama) sudah dibuka di Kader." },
    { category: "Status Gizi", time: "1 hari yang lalu", message: "Grafik tumbuh kembang Giselle Putri bulan ini terpantau Normal & Baik. Pertahankan!" }
  ];

  const notificationsList = role === "ibu" ? ibuNotifications : kaderNotifications;

  const handleEnableSystemNotif = async () => {
    setIsNotifOpen(false);
    const granted = await requestNotificationPermission();
    if (granted) {
      showLocalNotification("Kenanga Care Aktif 🌸", {
        body: "Notifikasi sistem berhasil diaktifkan. Anda akan mendapatkan pengingat kesehatan secara berkala.",
      });
    }
  };

  const runActualSync = async () => {
    const pendingChildMeas = JSON.parse(localStorage.getItem("pending_child_measurements") || "[]");
    const pendingMaternal = JSON.parse(localStorage.getItem("pending_maternal_records") || "[]");
    const pendingMothers = JSON.parse(localStorage.getItem("pending_create_mothers") || "[]");

    let syncedCount = 0;

    // Sync new mothers
    for (const m of pendingMothers) {
      try {
        const res = await createMother(m);
        if (res.success) syncedCount++;
      } catch (e) {
        console.error("Failed to sync mother creation offline record:", e);
      }
    }

    // Sync child measurements
    for (const m of pendingChildMeas) {
      try {
        const res = await createChildMeasurement(m);
        if (res.success) syncedCount++;
      } catch (e) {
        console.error("Failed to sync child measurement offline record:", e);
      }
    }

    // Sync maternal records
    for (const m of pendingMaternal) {
      try {
        const res = await createMaternalRecord(m);
        if (res.success) syncedCount++;
      } catch (e) {
        console.error("Failed to sync maternal offline record:", e);
      }
    }

    localStorage.removeItem("pending_child_measurements");
    localStorage.removeItem("pending_maternal_records");
    localStorage.removeItem("pending_create_mothers");

    return syncedCount;
  };

  const handleToggleSync = async () => {
    if (!navigator.onLine) {
      setSyncStatus("offline");
      showLocalNotification("Mode Offline Aktif 🔴", {
        body: "Tidak dapat menyinkronkan data saat ini karena perangkat Anda sedang offline. Sistem akan mencoba lagi secara otomatis ketika koneksi internet terhubung.",
      });
      alert("Perangkat Anda sedang offline. Data saat ini disimpan lokal di browser Anda dan akan disinkronkan otomatis begitu internet terhubung.");
      return;
    }

    setSyncStatus("reconnecting");
    
    try {
      const count = await runActualSync();
      
      // Dispatch custom event to trigger reloading page-level content
      window.dispatchEvent(new Event("sync-data"));
      window.dispatchEvent(new Event("profile-updated"));
      
      setSyncStatus("success");
      showLocalNotification("Sinkronisasi Selesai 🟢", {
        body: count > 0 
          ? `Berhasil mengunggah ${count} data pemeriksaan baru dari cache lokal ke database.`
          : "Seluruh data Posyandu Kenanga 1 berhasil diselaraskan dengan server utama.",
      });
      if (count > 0) {
        alert(`Sinkronisasi selesai! Berhasil mengirimkan ${count} data pemeriksaan offline ke database.`);
      }
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("offline");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "KS";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Match pathname to breadcrumb key (supports dynamic segments)
  const activeKey = (() => {
    // Exact match first
    if (breadcrumbs[pathname]) return pathname;
    // Try to match known patterns with dynamic segments
    if (/^\/data-anak\/tambah/.test(pathname)) return "/data-anak/tambah";
    if (/^\/data-anak\/.+/.test(pathname)) return "/data-anak/[id]";
    if (/^\/data-ibu\/tambah/.test(pathname)) return "/data-ibu/tambah";
    if (/^\/data-ibu\/.+/.test(pathname)) return "/data-ibu/[id]";
    // Prefix match fallback (longest prefix wins)
    return Object.keys(breadcrumbs)
      .filter(k => !k.includes("["))
      .sort((a, b) => b.length - a.length)
      .find(key => key === "/" ? pathname === "/" : pathname.startsWith(key)) || "/";
  })();
    
  const currentBreadcrumb = breadcrumbs[activeKey];
  const ActiveIcon = currentBreadcrumb.icon;

  const getBreadcrumbLabel = (key: string, defaultLabel: string) => {
    if (role === "ibu") {
      if (key === "/data-anak") return "Kesehatan Anak Saya";
      if (key === "/data-ibu") return "Kesehatan Saya";
      if (key === "/edukasi") return "Artikel & Edukasi";
    }
    return defaultLabel;
  };

  if (!isLoggedIn || pathname === "/login") return null;

  return (
    <header className="h-20 bg-base-white border-b border-base-border/40 flex items-center justify-between px-4 sm:px-10 shrink-0 z-40 relative">
      
      <div className="flex items-center gap-3">
        {/* Brand Logo only on mobile */}
        <div className="flex items-center gap-1.5 lg:hidden border-r border-base-border/30 pr-3 mr-1 shrink-0">
          <img 
            src="/Logo.png" 
            alt="Kenanga Care Logo" 
            className="w-7 h-7 rounded-lg object-cover" 
          />
          <span className="font-extrabold text-brand-primary text-xs tracking-tight hidden sm:inline">Kenanga Care</span>
        </div>

        {/* 1. Breadcrumb / Judul Halaman Aktif */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-base-text-primary">
          <ActiveIcon className="w-4 h-4 sm:w-5 sm:h-5 text-base-text-secondary shrink-0" />
          {currentBreadcrumb.parent ? (
            <span className="flex items-center gap-1">
              <Link href={currentBreadcrumb.parent} className="text-base-text-secondary hover:text-brand-primary transition">
                {getBreadcrumbLabel(currentBreadcrumb.parent, currentBreadcrumb.label)}
              </Link>
              <span className="text-base-text-secondary/40">/</span>
              <span className="text-base-text-primary">{currentBreadcrumb.parentLabel}</span>
            </span>
          ) : (
            <span className="inline">{getBreadcrumbLabel(activeKey, currentBreadcrumb.label)}</span>
          )}
        </div>
      </div>
      
      {/* 2. Search Bar */}
      <div className="relative flex-1 mx-4 max-w-xs md:max-w-md hidden md:block">
        <input 
          type="search" 
          placeholder="Cari data anak, ibu hamil, atau jadwal..." 
          className="w-full bg-base-bg border border-base-border/55 rounded-full py-2.5 px-6 pl-12 text-sm outline-none focus:border-brand-primary transition-colors text-base-text-primary" 
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-text-secondary" />
      </div>

      {/* 3. Aksi Sisi Kanan (Status Sync, Notifikasi, & Profil) */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Indikator Status Sinkronisasi Data PWA */}
        <button 
          onClick={handleToggleSync}
          className="hover:opacity-80 transition-all duration-200 focus:outline-none cursor-pointer" 
          title={
            syncStatus === "success" 
              ? "Koneksi Terhubung - Semua data tersinkronisasi (Klik untuk menyinkronkan ulang)" 
              : syncStatus === "reconnecting"
              ? "Sedang menyelaraskan data dengan server..."
              : "Mode Offline - Koneksi Terputus (Klik untuk info selengkapnya)"
          }
        >
          {syncStatus === "success" && (
            <div className="relative flex items-center justify-center w-8 h-8">
              <CloudIcon className="w-6 h-6 text-status-green-solid" />
              <div className="absolute -bottom-0.5 -right-0.5 bg-base-white rounded-full p-0.5 border border-base-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center w-4 h-4">
                <CheckIcon className="w-2.5 h-2.5 text-status-green-solid stroke-[3]" />
              </div>
            </div>
          )}
          {syncStatus === "reconnecting" && (
            <div className="relative flex items-center justify-center w-8 h-8">
              <CloudIcon className="w-6 h-6 text-base-text-secondary" />
              <div className="absolute -top-0.5 -right-0.5 bg-base-white rounded-full p-0.5 border border-base-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center w-4 h-4">
                <ArrowPathIcon className="w-2.5 h-2.5 text-status-blue-solid animate-spin" />
              </div>
            </div>
          )}
          {syncStatus === "offline" && (
            <div className="relative flex items-center justify-center w-8 h-8">
              <CloudIcon className="w-6 h-6 text-status-red-solid" />
              <div className="absolute -bottom-0.5 -right-0.5 bg-base-white rounded-full p-0.5 border border-base-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex items-center justify-center w-4 h-4">
                <XMarkIcon className="w-2.5 h-2.5 text-status-red-solid stroke-[3]" />
              </div>
            </div>
          )}
        </button>
        
        {/* Tombol Notifikasi dengan Badge Merah & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setHasUnreadNotif(false);
            }}
            className="text-base-text-secondary hover:text-brand-primary relative transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
          >
            <BellIcon className="w-6 h-6" />
            {hasUnreadNotif && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-status-red-solid rounded-full border-2 border-base-white animate-pulse" />
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-base-white border border-base-border/30 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="px-4 pb-2 border-b border-base-border/20 flex items-center justify-between">
                <span className="font-bold text-sm text-base-text-primary">Notifikasi Posyandu</span>
                {hasUnreadNotif && (
                  <button 
                    onClick={() => setHasUnreadNotif(false)} 
                    className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-base-border/10 text-xs">
                {notificationsList.map((notif, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-base-bg/30 transition duration-150 text-left space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-brand-primary uppercase text-[9px] tracking-wider">{notif.category}</span>
                      <span className="text-[10px] text-base-text-secondary font-medium">{notif.time}</span>
                    </div>
                    <p className="font-semibold text-base-text-primary text-xs leading-normal">{notif.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="px-4 pt-2 border-t border-base-border/20 text-center">
                <button 
                  onClick={handleEnableSystemNotif}
                  className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  Aktifkan Notifikasi Sistem 🔔
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Informasi Profil Pengguna (Kader) dengan Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3.5 border-l border-base-border/50 pl-3 sm:pl-6 focus:outline-none cursor-pointer group text-left"
          >
            <div className="w-10 h-10 bg-base-bg rounded-full flex items-center justify-center font-bold text-base-text-secondary border border-base-border/50 group-hover:border-brand-primary transition duration-150 shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <div className="hidden lg:block">
              <p className="font-semibold text-base-text-primary text-sm leading-tight group-hover:text-brand-primary transition duration-150">{profile.name}</p>
              <p className="text-xs text-base-text-secondary mt-0.5">{profile.posyandu}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-base-white border border-base-border/30 rounded-xl shadow-lg py-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
              {/* Account Setting */}
              <Link 
                href="/setting"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-base-text-primary hover:bg-brand-soft hover:text-brand-primary transition duration-150 font-medium"
              >
                <UserIcon className="w-5 h-5 text-base-text-secondary group-hover:text-brand-primary" />
                <span>Account Setting</span>
              </Link>
              
              {/* Darkmode Toggle */}
              <div className="flex items-center justify-between px-4 py-2 text-sm text-base-text-primary transition duration-150 font-medium select-none">
                <div className="flex items-center gap-3">
                  <MoonIcon className="w-5 h-5 text-base-text-secondary" />
                  <span>Darkmode</span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
                    isDarkMode ? "bg-brand-primary" : "bg-base-border/60"
                  }`}
                >
                  <div
                    className={`bg-base-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                      isDarkMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Role Switcher */}
              <div className="flex items-center justify-between px-4 py-2 text-sm text-base-text-primary transition duration-150 font-medium select-none">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-base-text-secondary" />
                  <span>Tampilan {role === "kader" ? "Kader" : "Ibu"}</span>
                </div>
                <button
                  onClick={() => setRole(role === "kader" ? "ibu" : "kader")}
                  title={role === "kader" ? "Ganti ke tampilan Ibu" : "Ganti ke tampilan Kader"}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
                    role === "ibu" ? "bg-brand-primary" : "bg-base-border/60"
                  }`}
                >
                  <div
                    className={`bg-base-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${
                      role === "ibu" ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Help Center */}
              <Link 
                href="/setting?tab=help"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-base-text-primary hover:bg-brand-soft hover:text-brand-primary transition duration-150 font-medium"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 text-base-text-secondary" />
                <span>Help Center</span>
              </Link>

              {/* Line Separator */}
              <hr className="border-t border-base-border/30 my-2" />

              {/* Log Out */}
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-status-red-solid hover:bg-status-red-solid/10 transition duration-150 font-semibold cursor-pointer text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 text-status-red-solid" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-red-solid/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ArrowRightOnRectangleIcon className="w-8 h-8 text-status-red-solid transform rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Keluar dari Aplikasi?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin keluar dari akun Kader Anda? Anda harus masuk kembali untuk mengakses data.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-primary font-bold hover:bg-base-white transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-status-red-solid text-base-white font-bold hover:bg-status-red-solid/90 transition shadow-sm cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}