"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBack, MdChildCare, MdBrush, MdFastfood, MdVaccines, MdShield } from "react-icons/md";

function RekamMedisAnakContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");
  const [child, setChild] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"neonatus" | "sdidtk" | "gigi" | "gizi_pmba" | "imunisasi" | "lila">("neonatus");
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // States
  const [neonatus, setNeonatus] = useState<any>({
    h06: {}, kn1: {}, kn2: {}, kn3: {}
  });
  const [sdidtkList, setSdidtkList] = useState<any[]>([]);
  const [gigiList, setGigiList] = useState<any[]>([]);
  const [giziPmba, setGiziPmba] = useState<any>({
    months: [], vit_a_blue: {}, vit_a_red: {}, worm_pills: {}
  });
  const [imunisasi, setImunisasi] = useState<any>({});
  const [lila, setLila] = useState<any>({});

  useEffect(() => {
    if (!childId) return;
    const decodedId = decodeURIComponent(childId as string);

    // Load Child data
    const cachedChildren = localStorage.getItem("offline_mother_children_all") || "[]";
    try {
      const parsed = JSON.parse(cachedChildren);
      const found = parsed.find((c: any) => c.child_id === decodedId || c.id === decodedId);
      if (found) {
        setChild(found);
      } else {
        setChild({ name: "Anak Posyandu" });
      }
    } catch (e) {
      setChild({ name: "Anak Posyandu" });
    }

    // Load EHR data
    const savedNeonatus = localStorage.getItem(`pemeriksaan_neonatus_${decodedId}`);
    if (savedNeonatus) {
      try { setNeonatus(JSON.parse(savedNeonatus)); } catch (e) {}
    }

    const savedSdidtk = localStorage.getItem(`pemeriksaan_sdidtk_anak_${decodedId}`);
    if (savedSdidtk) {
      try { setSdidtkList(JSON.parse(savedSdidtk)); } catch (e) {}
    }

    const savedGigi = localStorage.getItem(`pemeriksaan_gigi_anak_${decodedId}`);
    if (savedGigi) {
      try { setGigiList(JSON.parse(savedGigi)); } catch (e) {}
    }

    const savedGizi = localStorage.getItem(`pemeriksaan_gizi_pmba_${decodedId}`);
    if (savedGizi) {
      try { setGiziPmba(JSON.parse(savedGizi)); } catch (e) {}
    }

    const savedImunisasi = localStorage.getItem(`pemeriksaan_imunisasi_${decodedId}`);
    if (savedImunisasi) {
      try { setImunisasi(JSON.parse(savedImunisasi)); } catch (e) {}
    }

    const savedLila = localStorage.getItem(`pemeriksaan_lila_${decodedId}`);
    if (savedLila) {
      try { setLila(JSON.parse(savedLila)); } catch (e) {}
    }
  }, [childId]);

  const currentSdidtk = sdidtkList.find(item => item.month === selectedMonth) || {};

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4 border-base-border/30">
        <Link href="/perjalanan-anak" className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
          <MdArrowBack className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Rekam Medis (EHR) Anak</h1>
          <p className="text-xs text-base-text-secondary font-medium">
            Nama Anak: <span className="font-bold text-base-text-primary">{child?.name || child?.child_name || "-"}</span> &bull; Status: <span className="font-bold text-status-green-solid">Read-Only EHR</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-base-white border border-base-border/30 p-1 rounded-2xl gap-1 text-[11px] font-bold overflow-x-auto no-scrollbar shadow-xs">
        {[
          { id: "neonatus", label: "Neonatus (0-28 Hari)", icon: <MdChildCare className="w-4 h-4" /> },
          { id: "sdidtk", label: "Tumbuh Kembang (SDIDTK)", icon: <MdShield className="w-4 h-4" /> },
          { id: "gigi", label: "Kesehatan Gigi", icon: <MdBrush className="w-4 h-4" /> },
          { id: "gizi_pmba", label: "PMBA & Pelayanan Gizi", icon: <MdFastfood className="w-4 h-4" /> },
          { id: "imunisasi", label: "Imunisasi Lengkap", icon: <MdVaccines className="w-4 h-4" /> },
          { id: "lila", label: "Pengukuran LiLA", icon: <MdShield className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-brand-primary text-base-white shadow-sm" : "text-base-text-secondary hover:text-base-text-primary"}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main EHR view - Bento Grid style */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: NEONATUS */}
        {activeTab === "neonatus" && (
          <div className="space-y-6 text-xs">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Kesehatan Bayi Baru Lahir (Neonatus)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "h06", title: "Pelayanan 0 - 6 Jam" },
                { key: "kn1", title: "Kunjungan Neonatal 1 (6-48 Jam)" },
                { key: "kn2", title: "Kunjungan Neonatal 2 (3-7 Hari)" },
                { key: "kn3", title: "Kunjungan Neonatal 3 (8-28 Hari)" }
              ].map((visit) => {
                const data = neonatus[visit.key] || {};
                return (
                  <div key={visit.key} className="bg-base-bg/15 border border-base-border/10 p-4 rounded-2xl space-y-2 font-medium text-base-text-secondary">
                    <span className="font-bold text-xs text-brand-primary block">{visit.title}</span>
                    {data.bb && <p>⚖️ Berat: <span className="font-bold text-base-text-primary">{data.bb} g</span></p>}
                    {data.pb && <p>📏 Panjang: <span className="font-bold text-base-text-primary">{data.pb} cm</span></p>}
                    {data.lk && <p>🙆 Lingkar Kepala: <span className="font-bold text-base-text-primary">{data.lk} cm</span></p>}
                    <p>🍼 ASI Eksklusif: <span className="font-bold text-base-text-primary">{data.breast || "Ya"}</span></p>
                    {data.kremer && <p>⚠️ Kuning Kremer: <span className="font-bold text-status-orange-solid">Tingkat {data.kremer}</span></p>}
                    <p>🧬 Eliminasi: <span className="font-bold text-base-text-primary">{data.triple || "-"}</span></p>
                    <p>👩‍⚕️ Nakes: <span className="font-bold text-base-text-primary">{data.nakes || "-"}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SDIDTK */}
        {activeTab === "sdidtk" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/10 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-brand-primary">Laporan Skrining SDIDTK Bulanan</h2>
                <p className="text-[10px] text-base-text-secondary font-medium font-semibold">Gunakan menu di samping untuk melihat riwayat bulan spesifik.</p>
              </div>

              {/* Month selector dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-base-text-secondary">Pilih Umur Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-base-bg border border-base-border/40 rounded-xl px-3 py-1.5 font-bold text-brand-primary cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i + 1}>Bulan ke-{i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Displaying values for selectedMonth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              
              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2.5">
                <span className="text-[10px] text-brand-primary uppercase block">⚖️ Status Pertumbuhan WHO</span>
                <p>Kunjungan: <span className="text-base-text-primary">{currentSdidtk.visit_date || "-"}</span></p>
                <p>Berat Badan / Umur (BB/U): <span className="text-base-text-primary">{currentSdidtk.weight_status || "-"}</span></p>
                <p>Tinggi / Umur (TB/U): <span className="text-base-text-primary">{currentSdidtk.height_status || "-"}</span></p>
                <p>BB / Tinggi (BB/TB): <span className="text-base-text-primary">{currentSdidtk.w_h_status || "-"}</span></p>
                <p>Lingkar Kepala (LK/U): <span className="text-base-text-primary">{currentSdidtk.head_status || "-"}</span></p>
              </div>

              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2.5">
                <span className="text-[10px] text-brand-primary uppercase block">🧠 Status Perkembangan Klinis</span>
                <p>KPSP: <span className="text-brand-primary font-bold">{currentSdidtk.kpsp || "-"}</span></p>
                <p>Tes Daya Lihat (TDL): <span className="text-base-text-primary">{currentSdidtk.tdl || "-"}</span></p>
                <p>Mental Emosional (KMME): <span className="text-base-text-primary">{currentSdidtk.kmme || "-"}</span></p>
                <p>Autisme (M-CHAT-R): <span className="text-base-text-primary">{currentSdidtk.mchat || "-"}</span></p>
                <p>GPPH / ACTRS: <span className="text-base-text-primary">{currentSdidtk.actrs || "-"}</span></p>
              </div>

              <div className="bg-brand-soft/10 p-4 rounded-2xl space-y-2.5 border border-brand-primary/10">
                <span className="text-[10px] text-brand-primary uppercase block">🩺 Tindakan &amp; Intervensi</span>
                <p>Hasil PKAT: <span className="text-base-text-primary">{currentSdidtk.pkat || "-"}</span></p>
                <p>Rekomendasi: <span className="text-base-text-primary italic">{currentSdidtk.intervention || "-"}</span></p>
                <p>Jadwal Ulang: <span className="text-brand-primary">{currentSdidtk.next_visit_date || "-"}</span></p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: GIGI */}
        {activeTab === "gigi" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Catatan Riwayat Kesehatan Gigi Anak</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-semibold">
              {gigiList.map((item, idx) => (
                <div key={idx} className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                  <span className="font-black text-brand-primary text-xs">Target {item.month} Bulan</span>
                  <p>📅 Periksa: <span className="text-base-text-primary">{item.date || "-"}</span></p>
                  <p>🦷 Gigi Ada / Lubang: <span className="text-base-text-primary">{item.count || "0"} / {item.cavities || "0"}</span></p>
                  <p>🧼 Kondisi Plak: <span className="text-base-text-primary">{item.plaque || "-"}</span></p>
                  <p>⚠️ Risiko: <span className={`font-bold ${item.risk === "Tinggi" ? "text-status-red-solid" : "text-status-green-solid"}`}>{item.risk || "-"}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PMBA & GIZI */}
        {activeTab === "gizi_pmba" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Gizi &amp; Pemberian Makan Bayi/Anak (PMBA)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
              {giziPmba.months && giziPmba.months.map((item: any, idx: number) => (
                <div key={idx} className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                  <span className="font-black text-brand-primary text-xs">Kategori {item.age_label} Bulan</span>
                  <p>🍼 ASI Freq: <span className="text-base-text-primary">{item.asi_freq || "-"} ({item.asi_pelekatan || "-"})</span></p>
                  {item.mpasi_done === "Ya" && (
                    <>
                      <p>🍚 MPASI: <span className="text-base-text-primary">{item.texture || "-"}</span></p>
                      <p>🥩 Porsi: <span className="text-base-text-primary">{item.amount || "-"}</span></p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: IMUNISASI */}
        {activeTab === "imunisasi" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Riwayat Imunisasi Lengkap</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-semibold">
              {Object.keys(imunisasi).map((key) => {
                const data = imunisasi[key] || {};
                return (
                  <div key={key} className="p-3.5 bg-base-bg/15 rounded-xl border border-base-border/10">
                    <span className="font-bold text-brand-primary uppercase text-[9px] block mb-1">{key.replace(/_/g, " ")}</span>
                    <p>📅 Tgl: <span className="text-base-text-primary">{data.date || "-"}</span></p>
                    <p>🏷️ Batch: <span className="text-base-text-secondary">{data.batch || "-"}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: LILA */}
        {activeTab === "lila" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Lembar Pencatatan Lingkar Lengan Atas (LiLA)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-xs font-semibold">
              {Object.keys(lila).map((m) => (
                <div key={m} className="bg-base-bg/15 p-4 rounded-2xl">
                  <span className="font-bold text-brand-primary block">{m.replace("m", "Bulan ")}</span>
                  <p className="text-sm font-black mt-1">{lila[m] || "-"} cm</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default function RekamMedisAnakPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RekamMedisAnakContent />
    </Suspense>
  );
}
