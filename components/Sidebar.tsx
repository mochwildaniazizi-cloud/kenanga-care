"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  BookOpenIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/solid";

import { MdPregnantWoman } from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";

const navItems = [
  { href: "/", label: "Beranda", icon: HomeIcon },
  { href: "/data-anak", label: "Data Anak", icon: PiBabyFill },
  { href: "/data-ibu", label: "Data Ibu", icon: MdPregnantWoman },
  { href: "/edukasi", label: "Edukasi", icon: BookOpenIcon },
  { href: "/jadwal", label: "Jadwal", icon: CalendarDaysIcon },
  { href: "/setting", label: "Pengaturan", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-base-white border-r border-base-border flex flex-col p-6 shrink-0">
      {/* Logo Section */}

      <div className="flex items-center gap-2 pb-6">
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
      
      <nav className="flex-1 space-y-3">
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
                className={`w-6 h-6 transition-colors ${
                  active ? "text-base-white" : "text-base-text-secondary group-hover:text-brand-primary"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}