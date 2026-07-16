"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";

export default function RootPage() {
  const { role, isLoggedIn, isInitialized } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      // 💡 Diverter: Melempar user ke halaman spesifik sesuai perannya
      if (role === "kader") {
        router.replace("/dashboard-kader");
      } else {
        router.replace("/beranda-ibu");
      }
    }
  }, [role, isLoggedIn, isInitialized, router]);

  // Render skeleton kosong mini saat proses pengalihan rute (0ms) berlangsung
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-8 h-8 border-4 border-[#EA2986] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}