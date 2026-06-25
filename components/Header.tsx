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
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/solid";

import { MdPregnantWoman } from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";

const breadcrumbs: Record<string, { label: string; icon: any }> = {
  "/": { label: "Beranda", icon: HomeIcon },
  "/data-anak": { label: "Data Anak", icon: PiBabyFill },
  "/data-ibu": { label: "Data Ibu", icon: MdPregnantWoman },
  "/edukasi": { label: "Edukasi", icon: BookOpenIcon },
  "/jadwal": { label: "Jadwal", icon: CalendarDaysIcon },
  "/setting": { label: "Pengaturan", icon: Cog6ToothIcon },
};

export default function Header() {
  const [syncStatus, setSyncStatus] = useState<"success" | "reconnecting" | "offline">("success");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    name: "Kader Siti",
    posyandu: "Posyandu Kenanga 1"
  });

  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync profile from local storage and custom events
  useEffect(() => {
    const loadProfile = () => {
      const savedName = localStorage.getItem("kader_name");
      const savedPosyandu = localStorage.getItem("kader_posyandu");
      setProfile({
        name: savedName || "Kader Siti",
        posyandu: savedPosyandu || "Posyandu Kenanga 1"
      });
    };

    loadProfile();
    window.addEventListener("profile-updated", loadProfile);

    // Initial check for dark mode
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, []);

  // Dropdown click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleSync = () => {
    setSyncStatus(prev => {
      if (prev === "success") return "reconnecting";
      if (prev === "reconnecting") return "offline";
      return "success";
    });
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

  // Find matching breadcrumb item
  const activeKey = Object.keys(breadcrumbs)
    .sort((a, b) => b.length - a.length)
    .find(key => key === "/" ? pathname === "/" : pathname.startsWith(key)) || "/";
    
  const currentBreadcrumb = breadcrumbs[activeKey];
  const ActiveIcon = currentBreadcrumb.icon;

  return (
    <header className="h-20 bg-base-white border-b border-base-border/40 flex items-center justify-between px-10 shrink-0 z-40 relative">
      
      {/* 1. Breadcrumb / Judul Halaman Aktif */}
      <div className="flex items-center gap-2.5 text-sm font-semibold text-base-text-primary">
        <ActiveIcon className="w-5 h-5 text-base-text-secondary" />
        <span>{currentBreadcrumb.label}</span>
      </div>
      
      {/* 2. Search Bar */}
      <div className="relative flex-1 mx-8">
        <input 
          type="search" 
          placeholder="Cari data anak, ibu hamil, atau jadwal..." 
          className="w-full bg-base-bg border border-base-border/55 rounded-full py-2.5 px-6 pl-12 text-sm outline-none focus:border-brand-primary transition-colors text-base-text-primary" 
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-text-secondary" />
      </div>

      {/* 3. Aksi Sisi Kanan (Status Sync, Notifikasi, & Profil) */}
      <div className="flex items-center gap-6">
        
        {/* Indikator Status Sinkronisasi Data PWA */}
        <button 
          onClick={handleToggleSync}
          className="hover:opacity-80 transition-all duration-200 focus:outline-none cursor-pointer" 
          title={
            syncStatus === "success" 
              ? "Semua data tersinkronisasi (Klik untuk simulasi reconnect)" 
              : syncStatus === "reconnecting"
              ? "Menghubungkan kembali & menyinkronkan data... (Klik untuk simulasi offline)"
              : "Mode Offline - Koneksi Terputus (Klik untuk simulasi sukses)"
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
        
        {/* Tombol Notifikasi dengan Badge Merah */}
        <button className="text-base-text-secondary hover:text-brand-primary relative transition-colors cursor-pointer">
          <BellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-status-red-solid rounded-full border-2 border-base-white" />
        </button>
        
        {/* Informasi Profil Pengguna (Kader) dengan Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3.5 border-l border-base-border/50 pl-6 focus:outline-none cursor-pointer group text-left"
          >
            <div className="w-10 h-10 bg-base-bg rounded-full flex items-center justify-center font-bold text-base-text-secondary border border-base-border/50 group-hover:border-brand-primary transition duration-150 shrink-0">
              {getInitials(profile.name)}
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
                  // Simulasikan logout dengan mengarahkan ke dashboard
                  window.location.href = "/";
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