"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  BookOpenIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import { MdPregnantWoman, MdFavorite, MdChildCare, MdMonitorHeart, MdPeopleAlt } from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";
import { useUserRole } from "@/context/UserRoleContext";

// ──────────────────────────────────────────
// NAV CONFIG PER ROLE
// ──────────────────────────────────────────
const kaderNavItems = [
  { href: "/beranda-kader", label: "Beranda", icon: HomeIcon },
  { href: "/data-anak", label: "Data Anak", icon: PiBabyFill },
  { href: "/data-ibu", label: "Data Ibu", icon: MdPregnantWoman },
  { href: "/edukasi", label: "Edukasi", icon: BookOpenIcon },
  { href: "/jadwal", label: "Jadwal", icon: CalendarDaysIcon },
  { href: "/setting", label: "Pengaturan", icon: Cog6ToothIcon },
];

const nakesNavItems = [
  { href: "/beranda-nakes", label: "Beranda Medis", icon: HomeIcon },
  { href: "/perjalanan-anak/rekam-medis", label: "Rekam Medis Anak", icon: PiBabyFill },
  { href: "/perjalanan-ibu/rekam-medis", label: "Rekam Medis Ibu", icon: MdPregnantWoman },
  { href: "/edukasi", label: "Portal Edukasi", icon: BookOpenIcon },
  { href: "/setting", label: "Pengaturan", icon: Cog6ToothIcon },
];

const ibuNavItems = [
  { href: "/beranda-ibu", label: "Beranda", icon: HomeIcon },
  { href: "/perjalanan-anak", label: "Perjalanan Anak", icon: PiBabyFill },
  { href: "/perjalanan-ibu", label: "Perjalanan Ibu", icon: MdFavorite },
  { href: "/edukasi", label: "Artikel & Edukasi", icon: BookOpenIcon },
  { href: "/setting", label: "Pengaturan", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { role, isLoggedIn } = useUserRole();

  const navItems = role === "nakes" ? nakesNavItems : role === "ibu" ? ibuNavItems : kaderNavItems;

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);

    return () => {
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, []);

  // Close sidebar on pathname change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  if (!isLoggedIn || pathname === "/login" || pathname === "/wireframe") return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-white border-r border-base-border flex flex-col p-6 shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>

        {/* Logo Section */}
        <div className="flex items-center justify-between pb-5 border-b border-base-border/30 mb-5">
          <div className="flex items-center gap-2">
            <img 
              src="/Logo.png" 
              alt="Kenanga Care Logo" 
              className="w-12 h-12 rounded-xl object-cover" 
            />
            <div>
              <h1 className="text-xl font-bold text-brand-primary tracking-tight">Kenanga Care</h1>
              <p className="text-xs text-base-text-secondary font-medium">Posyandu Kenanga 1</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-base-bg text-base-text-secondary hover:text-brand-primary cursor-pointer shrink-0"
            title="Tutup Menu"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>


        
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 p-3.5 transition-all duration-200 group rounded-bento-sm ${
                  active
                    ? "bg-brand-primary text-base-white shadow-md font-semibold"
                    : "text-base-text-secondary hover:bg-brand-soft hover:text-brand-primary font-medium"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    active ? "text-base-white" : "text-base-text-secondary group-hover:text-brand-primary"
                  }`}
                />
                <span className="leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}