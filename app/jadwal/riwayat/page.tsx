"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getScheduleLogs } from "@/app/actions/schedule";
import { FiArrowLeft } from "react-icons/fi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function RiwayatJadwalPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem("offline_schedule_logs");
    if (cached) {
      setLogs(JSON.parse(cached));
      setIsLoading(false);
    }

    if (navigator.onLine) {
      getScheduleLogs()
        .then((data) => {
          setLogs(data);
          localStorage.setItem("offline_schedule_logs", JSON.stringify(data));
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const filteredLogs = logs.filter((log) => 
    log.by.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.time.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1000px] mx-auto pb-24 p-4 md:p-8 animate-in fade-in duration-300">
      {/* Header & Back Button */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => router.push("/jadwal")}
            className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-4 cursor-pointer focus:outline-none"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali ke Jadwal
          </button>
          <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Riwayat Perubahan Jadwal</h1>
          <p className="text-sm text-base-text-secondary">Daftar log audit riwayat penambahan, modifikasi, dan penghapusan jadwal posyandu.</p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input 
            type="text" 
            placeholder="Cari log riwayat..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-base-white border border-base-border/50 rounded-xl py-2.5 px-4 pl-10 text-xs font-medium outline-none focus:border-brand-primary transition text-base-text-primary"
          />
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-text-secondary" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-base-white border border-base-border/30 rounded-2xl p-12 text-center text-sm text-base-text-secondary">
          Tidak ada data riwayat log yang ditemukan.
        </div>
      ) : (
        <div className="bg-base-white border border-base-border/30 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-base-border/20">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-base-bg/10 transition">
                <div className="space-y-1">
                  <p className="text-sm text-base-text-primary font-semibold leading-relaxed">
                    {log.detail}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/10 px-2 py-0.5 rounded-full font-bold uppercase">
                      {log.by}
                    </span>
                    <span className="text-xs text-base-text-secondary">
                      {log.time}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] bg-status-blue-light text-status-blue-solid border border-status-blue-solid/10 px-2.5 py-1 rounded-full font-bold uppercase shrink-0">
                  Audit Log
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
