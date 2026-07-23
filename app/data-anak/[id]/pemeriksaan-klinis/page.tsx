"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PemeriksaanKlinisAnakPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/perjalanan-anak/rekam-medis?child_id=${id}`);
    } else {
      router.replace("/perjalanan-anak/rekam-medis");
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="w-6 h-6 border-2 border-[#EA2986] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-bold text-gray-700">Mengarahkan ke Rekam Medis Anak...</span>
      </div>
    </div>
  );
}
