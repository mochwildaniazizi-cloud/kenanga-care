"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave, MdCheckCircleOutline, MdChildCare, MdBrush, MdVaccines, MdFastfood, MdShield, MdScale } from "react-icons/md";

export default function PemeriksaanKlinisAnakPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"neonatus" | "sdidtk" | "gigi" | "gizi_pmba" | "imunisasi" | "lila">("neonatus");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Form States
  const [neonatus, setNeonatus] = useState<any>({
    h06: { bb: "", pb: "", lk: "", imd: "Ya", vit_k1: false, salep: false, hb0: false, triple: "", problems: "", referral: "", nakes: "" },
    kn1: { bb: "", pb: "", lk: "", breast: "Ya", cord: "Normal", vit_k1: false, salep: false, hb0: false, shk: false, pjb: "", triple: "", problems: "", referral: "", nakes: "" },
    kn2: { breast: "Ya", cord: "Normal", danger: "Tidak", yellow: "Tidak", hb0: false, shk: false, triple: "", problems: "", referral: "", nakes: "", kremer: "1" },
    kn3: { breast: "Ya", cord: "Normal", danger: "Tidak", yellow: "Tidak", shk: false, triple: "", problems: "", referral: "", nakes: "" }
  });

  const [sdidtkList, setSdidtkList] = useState<any[]>(
    Array.from({ length: 60 }, (_, i) => ({
      month: i + 1,
      visit_date: "",
      weight_status: "N", // SK, K, N, RBL
      height_status: "N", // SP, P, N, T
      w_h_status: "N", // GB, GK, N, O
      head_status: "N", // Mi, N, Ma
      kpsp: "Sesuai", // Sesuai, Meragukan, Penyimpangan
      tdl: "Tidak", // Ya, Tidak
      kmme: "Tidak", // Ya, Tidak
      mchat: "Rendah", // Rendah, Sedang, Tinggi
      actrs: "Tidak", // Ya, Tidak
      pkat: "Tidak", // Ya, Tidak
      intervention: "",
      next_visit_date: ""
    }))
  );

  const [gigiList, setGigiList] = useState<any[]>([
    { month: 6, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 9, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 12, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 18, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 24, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 36, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 48, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" },
    { month: 60, date: "", count: "", cavities: "", plaque: "Bersih", risk: "Rendah" }
  ]);

  const [giziPmba, setGiziPmba] = useState<any>({
    months: Array.from({ length: 10 }, (_, i) => {
      const labels = ["0", "1", "2", "3", "4", "5", "6-8", "9-11", "12-23", "23-59"];
      return {
        age_label: labels[i],
        asi_freq: "",
        asi_pelekatan: "Baik",
        asi_perah: "Tidak",
        mpasi_done: "Tidak",
        mpasi_protein: false, mpasi_sayur: false, mpasi_buah: false,
        texture: "Dihaluskan",
        amount: "",
        freq_main: "", freq_snack: ""
      };
    }),
    vit_a_blue: { date: "", batch: "" },
    vit_a_red: { y1: "", y2: "", y3: "", y4: "", y5: "" },
    worm_pills: { y1: "", y2: "", y3: "", y4: "", y5: "" }
  });

  const [imunisasi, setImunisasi] = useState<any>({
    hb0: { date: "", batch: "" },
    bcg: { date: "", batch: "" },
    polio1: { date: "", batch: "" },
    dpt1: { date: "", batch: "" },
    polio2: { date: "", batch: "" },
    rv1: { date: "", batch: "" },
    pcv1: { date: "", batch: "" },
    dpt2: { date: "", batch: "" },
    polio3: { date: "", batch: "" },
    rv2: { date: "", batch: "" },
    pcv2: { date: "", batch: "" },
    dpt3: { date: "", batch: "" },
    polio4: { date: "", batch: "" },
    ipv1: { date: "", batch: "" },
    rv3: { date: "", batch: "" },
    mr: { date: "", batch: "" },
    ipv2: { date: "", batch: "" },
    je: { date: "", batch: "" },
    pcv3: { date: "", batch: "" },
    dpt_lanjutan: { date: "", batch: "" },
    mr_lanjutan: { date: "", batch: "" }
  });

  const [lila, setLila] = useState<any>({
    m1: "", m2: "", m3: "", m4: "", m5: "",
    m6: "", m12: "", m18: "", m24: "", m36: "", m48: "", m60: ""
  });

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);

    // Load Child Info
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
  }, [id]);

  const handleSave = () => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    localStorage.setItem(`pemeriksaan_neonatus_${decodedId}`, JSON.stringify(neonatus));
    localStorage.setItem(`pemeriksaan_sdidtk_anak_${decodedId}`, JSON.stringify(sdidtkList));
    localStorage.setItem(`pemeriksaan_gigi_anak_${decodedId}`, JSON.stringify(gigiList));
    localStorage.setItem(`pemeriksaan_gizi_pmba_${decodedId}`, JSON.stringify(giziPmba));
    localStorage.setItem(`pemeriksaan_imunisasi_${decodedId}`, JSON.stringify(imunisasi));
    localStorage.setItem(`pemeriksaan_lila_${decodedId}`, JSON.stringify(lila));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-base-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/data-anak/${id}`} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Pemeriksaan &amp; Pencatatan Klinis Anak</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Anak: <span className="font-bold text-base-text-primary">{child?.name || child?.child_name || "-"}</span> &bull; Gender: <span className="font-semibold text-base-text-primary">{child?.gender === "M" ? "Laki-laki" : "Perempuan"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-base-white border border-base-border/30 p-1 rounded-2xl gap-1 text-[11px] font-bold overflow-x-auto no-scrollbar shadow-xs">
        {[
          { id: "neonatus", label: "Neonatus (0-28 Hari)", icon: <MdChildCare className="w-4 h-4" /> },
          { id: "sdidtk", label: "Tumbuh Kembang (SDIDTK)", icon: <MdScale className="w-4 h-4" /> },
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

      {/* TAB CONTENT: SEPARATE CARDS PER SECTION */}

      {/* 1. NEONATUS */}
      {activeTab === "neonatus" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Pelayanan Neonatus</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Neonatus
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-base-text-secondary">
              {["h06", "kn1", "kn2", "kn3"].map((key) => (
                <div key={key} className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-xs uppercase text-brand-primary">{key.toUpperCase()}</span>
                  <input type="text" placeholder="Menyusu / ASI" value={neonatus[key].breast || ""} onChange={(e) => setNeonatus({ ...neonatus, [key]: { ...neonatus[key], breast: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-2" />
                  <input type="text" placeholder="Tali Pusat" value={neonatus[key].cord || ""} onChange={(e) => setNeonatus({ ...neonatus, [key]: { ...neonatus[key], cord: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SDIDTK */}
      {activeTab === "sdidtk" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Skrining SDIDTK (Bulan ke-{selectedMonth})</h3>
              <div className="flex items-center gap-4">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-base-bg border border-base-border/40 rounded-xl p-1.5 font-bold text-brand-primary text-xs cursor-pointer">
                  {Array.from({ length: 60 }, (_, i) => (<option key={i} value={i + 1}>Bulan {i + 1}</option>))}
                </select>
                <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                  <MdSave className="w-4 h-4" /> Simpan SDIDTK
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">BB/U Status</label>
                <select value={sdidtkList[selectedMonth - 1]?.weight_status} onChange={(e) => {
                  const list = [...sdidtkList];
                  list[selectedMonth - 1].weight_status = e.target.value;
                  setSdidtkList(list);
                }} className="w-full bg-base-white border border-base-border/40 rounded-xl p-2.5">
                  <option value="SK">Sangat Kurang</option><option value="K">Kurang</option><option value="N">Normal</option><option value="RBL">Risiko Lebih</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">KPSP</label>
                <select value={sdidtkList[selectedMonth - 1]?.kpsp} onChange={(e) => {
                  const list = [...sdidtkList];
                  list[selectedMonth - 1].kpsp = e.target.value;
                  setSdidtkList(list);
                }} className="w-full bg-base-white border border-base-border/40 rounded-xl p-2.5">
                  <option value="Sesuai">Sesuai</option><option value="Meragukan">Meragukan</option><option value="Penyimpangan">Penyimpangan</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. KESEHATAN GIGI */}
      {activeTab === "gigi" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Kesehatan Gigi Anak</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Gigi
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              {gigiList.map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 items-center bg-base-bg/10 p-3 rounded-xl">
                  <span className="font-bold text-base-text-primary">{item.month} Bulan</span>
                  <input type="number" placeholder="Jumlah Gigi" value={item.count} onChange={(e) => {
                    const list = [...gigiList];
                    list[idx].count = e.target.value;
                    setGigiList(list);
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5" />
                  <input type="number" placeholder="Gigi Berlubang" value={item.cavities} onChange={(e) => {
                    const list = [...gigiList];
                    list[idx].cavities = e.target.value;
                    setGigiList(list);
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5" />
                  <select value={item.plaque} onChange={(e) => {
                    const list = [...gigiList];
                    list[idx].plaque = e.target.value;
                    setGigiList(list);
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5">
                    <option value="Bersih">Bersih</option><option value="Kotor">Kotor</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. PMBA & GIZI */}
      {activeTab === "gizi_pmba" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">PMBA &amp; Pelayanan Gizi</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Gizi
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              {giziPmba.months.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-4 gap-4 items-center bg-base-bg/10 p-3 rounded-xl font-semibold">
                  <span className="font-bold text-base-text-primary">Fase {item.age_label} Bulan</span>
                  <input type="text" placeholder="ASI Freq" value={item.asi_freq} onChange={(e) => {
                    const list = [...giziPmba.months];
                    list[idx].asi_freq = e.target.value;
                    setGiziPmba({ ...giziPmba, months: list });
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5" />
                  <input type="text" placeholder="Tekstur" value={item.texture} onChange={(e) => {
                    const list = [...giziPmba.months];
                    list[idx].texture = e.target.value;
                    setGiziPmba({ ...giziPmba, months: list });
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5" />
                  <input type="text" placeholder="Jumlah" value={item.amount} onChange={(e) => {
                    const list = [...giziPmba.months];
                    list[idx].amount = e.target.value;
                    setGiziPmba({ ...giziPmba, months: list });
                  }} className="bg-base-white border border-base-border/40 rounded-lg p-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. IMUNISASI */}
      {activeTab === "imunisasi" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Riwayat Imunisasi</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Imunisasi
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-semibold">
              {Object.keys(imunisasi).map((key) => (
                <div key={key} className="p-3 bg-base-bg/15 rounded-xl space-y-1">
                  <span className="font-bold text-[9px] uppercase text-brand-primary block">{key.replace(/_/g, " ")}</span>
                  <input type="date" value={imunisasi[key].date} onChange={(e) => setImunisasi({ ...imunisasi, [key]: { ...imunisasi[key], date: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. LILA */}
      {activeTab === "lila" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Pengukuran LiLA Anak</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan LiLA
              </button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-xs font-semibold">
              {Object.keys(lila).map((m) => (
                <div key={m} className="bg-base-bg/15 p-3 rounded-xl space-y-1">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">{m.replace("m", "Bulan ")}</span>
                  <input type="number" step="0.1" value={lila[m]} onChange={(e) => setLila({ ...lila, [m]: e.target.value })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-base-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-base-white p-6 rounded-3xl max-w-sm w-full mx-4 shadow-xl border border-base-border/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E6F8ED] text-status-green-solid flex items-center justify-center text-2xl mx-auto shadow-xs border border-status-green-solid/10">
              <MdCheckCircleOutline className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-base-text-primary">Data Berhasil Disimpan</h4>
            <p className="text-[11px] text-base-text-secondary leading-relaxed font-semibold">Rekam medis bagian ini telah berhasil diperbarui.</p>
          </div>
        </div>
      )}

    </div>
  );
}
