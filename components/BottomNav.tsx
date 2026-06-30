"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  HomeIcon, 
  BookOpenIcon,
  CalendarDaysIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/solid";
import { MdPregnantWoman, MdFavorite } from "react-icons/md";
import { PiBabyFill } from "react-icons/pi";
import { useUserRole } from "@/context/UserRoleContext";

const kaderItems = [
  { href: "/", label: "Beranda", icon: HomeIcon },
  { href: "/data-anak", label: "Anak", icon: PiBabyFill },
  { href: "/data-ibu", label: "Ibu", icon: MdPregnantWoman },
  { href: "/edukasi", label: "Edukasi", icon: BookOpenIcon },
  { href: "/jadwal", label: "Jadwal", icon: CalendarDaysIcon },
];

const ibuItems = [
  { href: "/", label: "Beranda", icon: HomeIcon },
  { href: "/data-anak", label: "Anak Saya", icon: PiBabyFill },
  { href: "/data-ibu", label: "Kesehatan", icon: MdFavorite },
  { href: "/edukasi", label: "Edukasi", icon: BookOpenIcon },
  { href: "/setting", label: "Pengaturan", icon: Cog6ToothIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { role, isLoggedIn } = useUserRole();

  if (!isLoggedIn || pathname === "/login") return null;

  const items = role === "ibu" ? ibuItems : kaderItems;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-base-white/95 backdrop-blur-md border-t border-base-border/30 px-3 py-2 pb-3 shadow-lg flex items-center justify-around lg:hidden transition-all duration-300">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 group cursor-pointer relative"
          >
            <div className={`p-1 rounded-xl transition-all duration-300 flex items-center justify-center ${
              active 
                ? "text-brand-primary scale-110" 
                : "text-base-text-secondary group-hover:text-brand-primary/80 group-hover:scale-105"
            }`}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            
            <span className={`text-[9px] font-bold md:text-[10px] tracking-tight transition-colors duration-200 ${
              active ? "text-brand-primary" : "text-base-text-secondary"
            }`}>
              {item.label}
            </span>

            {/* Glowing active indicator dot */}
            {active && (
              <span className="absolute bottom-0 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_8px_#ea2986]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
