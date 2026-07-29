"use client";

import Link from "next/link";
import { useUserRole } from "@/context/UserRoleContext";
import { MdPregnantWoman, MdChildCare, MdArrowForward, MdAssignment } from "react-icons/md";

export default function BerandaNakesPage() {
  const { username } = useUserRole();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pb-24 min-h-screen flex flex-col justify-center select-none">

      {/* ─── GREETING ─── */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-[#EA2986] border border-rose-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
          <MdAssignment className="text-xs" />
          Portal Medis Nakes
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          Selamat Datang{username ? `, ${username}` : ""} 👋
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-2">
          Pilih modul rekam medis untuk memulai.
        </p>
      </div>

      {/* ─── SHORTCUT CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Rekam Medis Anak */}
        <Link
          href="/perjalanan-anak/rekam-medis"
          className="group relative bg-white border border-rose-200 hover:border-[#EA2986] rounded-3xl p-7 flex flex-col gap-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          {/* background blob */}
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-[#EA2986]/[0.07] rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-[#EA2986] flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform duration-300">
            <MdChildCare />
          </div>

          <div className="relative z-10 flex-1">
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight group-hover:text-[#EA2986] transition-colors">
              Rekam Medis Anak
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1.5 leading-relaxed">
              EHR balita, kurva KMS / WHO Z-Score, SDIDTK, log imunisasi, dan catatan gizi anak.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 text-[#EA2986] text-sm font-extrabold">
            <span>Buka Modul</span>
            <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </Link>

        {/* Rekam Medis Ibu */}
        <Link
          href="/perjalanan-ibu/rekam-medis"
          className="group relative bg-white border border-indigo-200 hover:border-indigo-500 rounded-3xl p-7 flex flex-col gap-5 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        >
          {/* background blob */}
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-indigo-500/[0.07] rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform duration-300">
            <MdPregnantWoman />
          </div>

          <div className="relative z-10 flex-1">
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
              Rekam Medis Ibu
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1.5 leading-relaxed">
              EHR ibu hamil, pemeriksaan ANC, pantauan LiLA, tekanan darah, TTD, dan riwayat maternal.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-1.5 text-indigo-600 text-sm font-extrabold">
            <span>Buka Modul</span>
            <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </Link>

      </div>
    </div>
  );
}
