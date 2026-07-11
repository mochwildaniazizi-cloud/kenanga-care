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
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);

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

    // Load form states from localStorage
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

  const currentSdidtk = sdidtkList.find(item => item.month === selectedMonth) || sdidtkList[0];

  const updateCurrentSdidtk = (field: string, value: any) => {
    setSdidtkList((prev: any[]) => prev.map(item => item.month === selectedMonth ? { ...item, [field]: value } : item));
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
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Rekam Medis Klinis Anak</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Anak: <span className="font-bold text-base-text-primary">{child?.name || child?.child_name || "-"}</span> &bull; Gender: <span className="font-semibold text-base-text-primary">{child?.gender === "M" ? "Laki-laki" : "Perempuan"}</span>
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-brand-primary text-base-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-md hover:shadow-lg cursor-pointer text-xs"
        >
          <MdSave className="w-4 h-4" /> Simpan Rekam Medis
        </button>
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

      {/* Main Content Card */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: NEONATUS */}
        {activeTab === "neonatus" && (
          <div className="space-y-6 text-xs">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Kesehatan Bayi Umur 0 - 28 Hari (Halaman 122)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "h06", title: "Pelayanan 0 - 6 Jam" },
                { key: "kn1", title: "Kunjungan Neonatal 1 (6-48 Jam)" },
                { key: "kn2", title: "Kunjungan Neonatal 2 (3-7 Hari)" },
                { key: "kn3", title: "Kunjungan Neonatal 3 (8-28 Hari)" }
              ].map((visit) => (
                <div key={visit.key} className="bg-base-bg/15 border border-base-border/10 p-4 rounded-2xl space-y-3">
                  <span className="font-bold text-xs text-brand-primary block">{visit.title}</span>
                  
                  {/* Antropometri for h06/kn1 */}
                  {(visit.key === "h06" || visit.key === "kn1") && (
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 block">BB (g)</label>
                        <input 
                          type="number" 
                          value={neonatus[visit.key].bb} 
                          onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], bb: e.target.value } })}
                          placeholder="g" className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 block">PB (cm)</label>
                        <input 
                          type="number" 
                          value={neonatus[visit.key].pb} 
                          onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], pb: e.target.value } })}
                          placeholder="cm" className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 block">LK (cm)</label>
                        <input 
                          type="number" 
                          value={neonatus[visit.key].lk} 
                          onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], lk: e.target.value } })}
                          placeholder="cm" className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Checklist options */}
                  <div className="space-y-1.5 font-semibold text-base-text-secondary">
                    {visit.key !== "h06" && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={neonatus[visit.key].breast === "Ya"}
                          onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], breast: e.target.checked ? "Ya" : "Tidak" } })}
                          className="accent-brand-primary w-3.5 h-3.5"
                        />
                        <span>ASI Eksklusif (Menyusu)</span>
                      </label>
                    )}
                    {visit.key === "kn2" && (
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 block">Kuning Kremer Body Map (1-5)</label>
                        <select 
                          value={neonatus[visit.key].kremer}
                          onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], kremer: e.target.value } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                        >
                          <option value="1">1 (Kepala & Leher)</option>
                          <option value="2">2 (Dada s.d Pusat)</option>
                          <option value="3">3 (Pusat s.d Lutut)</option>
                          <option value="4">4 (Lutut s.d Pergelangan)</option>
                          <option value="5">5 (Tangan & Kaki)</option>
                        </select>
                      </div>
                    )}
                    <input 
                      type="text" placeholder="Tripel Eliminasi"
                      value={neonatus[visit.key].triple}
                      onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], triple: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px] mt-1"
                    />
                    <input 
                      type="text" placeholder="Nama Nakes"
                      value={neonatus[visit.key].nakes}
                      onChange={(e) => setNeonatus({ ...neonatus, [visit.key]: { ...neonatus[visit.key], nakes: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SDIDTK */}
        {activeTab === "sdidtk" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/10 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-brand-primary">Skrining &amp; Evaluasi Tumbuh Kembang SDIDTK (Halaman 127)</h2>
                <p className="text-[10px] text-base-text-secondary font-medium font-semibold">Gunakan menu di bawah untuk memilih umur target bulan.</p>
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

            {/* Form Fields for Selected Month */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Parameter Pertumbuhan */}
              <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3.5">
                <span className="font-bold text-[10px] uppercase text-brand-primary block border-b border-brand-primary/10 pb-1">⚖️ Parameter Pertumbuhan (Standar WHO)</span>
                
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Kunjungan</label>
                  <input 
                    type="date"
                    value={currentSdidtk.visit_date}
                    onChange={(e) => updateCurrentSdidtk("visit_date", e.target.value)}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Berat Badan / Umur (BB/U)</label>
                    <select
                      value={currentSdidtk.weight_status}
                      onChange={(e) => updateCurrentSdidtk("weight_status", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="SK">Sangat Kurang (Severely Underweight)</option>
                      <option value="K">Kurang (Underweight)</option>
                      <option value="N">Normal</option>
                      <option value="RBL">Risiko Berat Lebih</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Badan / Umur (TB/U)</label>
                    <select
                      value={currentSdidtk.height_status}
                      onChange={(e) => updateCurrentSdidtk("height_status", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="SP">Sangat Pendek (Severely Stunted)</option>
                      <option value="P">Pendek (Stunted)</option>
                      <option value="N">Normal</option>
                      <option value="T">Tinggi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">BB / Tinggi Badan (BB/TB)</label>
                    <select
                      value={currentSdidtk.w_h_status}
                      onChange={(e) => updateCurrentSdidtk("w_h_status", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="GB">Gizi Buruk (Severely Wasted)</option>
                      <option value="GK">Gizi Kurang (Wasted)</option>
                      <option value="N">Normal</option>
                      <option value="O">Obesitas (Obese)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lingkar Kepala / Umur (LK/U)</label>
                    <select
                      value={currentSdidtk.head_status}
                      onChange={(e) => updateCurrentSdidtk("head_status", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Mi">Mikrosefali</option>
                      <option value="N">Normal</option>
                      <option value="Ma">Makrosefali</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parameter Perkembangan */}
              <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3.5">
                <span className="font-bold text-[10px] uppercase text-brand-primary block border-b border-brand-primary/10 pb-1">🧠 Parameter Perkembangan Klinis</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">KPSP (Pra Skrining)</label>
                    <select
                      value={currentSdidtk.kpsp}
                      onChange={(e) => updateCurrentSdidtk("kpsp", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Sesuai">Sesuai</option>
                      <option value="Meragukan">Meragukan</option>
                      <option value="Penyimpangan">Penyimpangan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">TDL (Tes Daya Lihat)</label>
                    <select
                      value={currentSdidtk.tdl}
                      onChange={(e) => updateCurrentSdidtk("tdl", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tidak">Tidak Ada Gangguan</option>
                      <option value="Ya">Ada Gangguan (Rujuk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-base-text-secondary uppercase mb-1">KMME (Mental Emosional)</label>
                    <select
                      value={currentSdidtk.kmme}
                      onChange={(e) => updateCurrentSdidtk("kmme", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2 py-2 text-[10px]"
                    >
                      <option value="Tidak">Normal</option>
                      <option value="Ya">Ada Gangguan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-base-text-secondary uppercase mb-1">M-CHAT-R (Autisme)</label>
                    <select
                      value={currentSdidtk.mchat}
                      onChange={(e) => updateCurrentSdidtk("mchat", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2 py-2 text-[10px]"
                    >
                      <option value="Rendah">Risiko Rendah</option>
                      <option value="Sedang">Risiko Sedang</option>
                      <option value="Tinggi">Risiko Tinggi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-base-text-secondary uppercase mb-1">GPPH / ACTRS</label>
                    <select
                      value={currentSdidtk.actrs}
                      onChange={(e) => updateCurrentSdidtk("actrs", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2 py-2 text-[10px]"
                    >
                      <option value="Tidak">Normal</option>
                      <option value="Ya">Gejala GPPH</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-base-border/10 pt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Hasil PKAT</label>
                    <select
                      value={currentSdidtk.pkat}
                      onChange={(e) => updateCurrentSdidtk("pkat", e.target.value)}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tidak">Tidak</option>
                      <option value="Ya">Ya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Intervensi / Rujukan</label>
                    <input 
                      type="text"
                      value={currentSdidtk.intervention}
                      onChange={(e) => updateCurrentSdidtk("intervention", e.target.value)}
                      placeholder="Intervensi / Rujukan"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: GIGI */}
        {activeTab === "gigi" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Catatan Pemeriksaan Kesehatan Gigi Anak (Halaman 126)</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-base-border/30 text-[10px] uppercase text-base-text-secondary font-bold">
                    <th className="py-2.5 px-3">Umur Target</th>
                    <th className="py-2.5 px-3">Tanggal Periksa</th>
                    <th className="py-2.5 px-3">Jumlah Gigi Ada</th>
                    <th className="py-2.5 px-3">Gigi Berlubang</th>
                    <th className="py-2.5 px-3">Kondisi Plak</th>
                    <th className="py-2.5 px-3">Risiko Gigi Berlubang</th>
                  </tr>
                </thead>
                <tbody>
                  {gigiList.map((item, idx) => (
                    <tr key={idx} className="border-b border-base-border/10 hover:bg-base-bg/20 transition-colors">
                      <td className="py-3 px-3 font-bold text-base-text-primary">{item.month} Bulan</td>
                      <td className="py-3 px-3">
                        <input 
                          type="date"
                          value={item.date}
                          onChange={(e) => {
                            const list = [...gigiList];
                            list[idx].date = e.target.value;
                            setGigiList(list);
                          }}
                          className="bg-base-white border border-base-border/40 rounded-xl px-2.5 py-1.5 text-xs"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input 
                          type="number"
                          value={item.count}
                          onChange={(e) => {
                            const list = [...gigiList];
                            list[idx].count = e.target.value;
                            setGigiList(list);
                          }}
                          placeholder="Gigi"
                          className="w-20 bg-base-white border border-base-border/40 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input 
                          type="number"
                          value={item.cavities}
                          onChange={(e) => {
                            const list = [...gigiList];
                            list[idx].cavities = e.target.value;
                            setGigiList(list);
                          }}
                          placeholder="Lubang"
                          className="w-20 bg-base-white border border-base-border/40 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={item.plaque}
                          onChange={(e) => {
                            const list = [...gigiList];
                            list[idx].plaque = e.target.value;
                            setGigiList(list);
                          }}
                          className="bg-base-white border border-base-border/40 rounded-xl px-2.5 py-1.5 text-xs"
                        >
                          <option value="Bersih">Bersih</option>
                          <option value="Kotor">Kotor</option>
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={item.risk}
                          onChange={(e) => {
                            const list = [...gigiList];
                            list[idx].risk = e.target.value;
                            setGigiList(list);
                          }}
                          className="bg-base-white border border-base-border/40 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                        >
                          <option value="Rendah">Rendah</option>
                          <option value="Sedang">Sedang</option>
                          <option value="Tinggi">Tinggi</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PMBA & GIZI */}
        {activeTab === "gizi_pmba" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Gizi &amp; Pemberian Makan Bayi/Anak (PMBA - Halaman 123)</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1 text-xs">
              
              {/* PMBA Monthly Table */}
              <div className="space-y-2.5">
                <span className="font-bold text-[10px] uppercase text-base-text-secondary block">1. Evaluasi Pola Makan (ASI &amp; MPASI)</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-base-border/30 text-[9px] uppercase text-base-text-secondary font-bold">
                        <th className="py-2 px-2">Kategori Usia</th>
                        <th className="py-2 px-2">Frekuensi ASI / Perah</th>
                        <th className="py-2 px-2">ASI Pelekatan</th>
                        <th className="py-2 px-2">MPASI Lauk/Sayur/Buah</th>
                        <th className="py-2 px-2">Tekstur MPASI</th>
                        <th className="py-2 px-2">Jumlah</th>
                        <th className="py-2 px-2">Frekuensi Utama/Selingan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {giziPmba.months.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-base-border/10 hover:bg-base-bg/10 transition-colors">
                          <td className="py-2.5 px-2 font-bold text-base-text-primary">{item.age_label} Bulan</td>
                          <td className="py-2.5 px-2">
                            <input 
                              type="text" placeholder="ASI per hari"
                              value={item.asi_freq}
                              onChange={(e) => {
                                const list = [...giziPmba.months];
                                list[idx].asi_freq = e.target.value;
                                setGiziPmba({ ...giziPmba, months: list });
                              }}
                              className="w-24 bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <select
                              value={item.asi_pelekatan}
                              onChange={(e) => {
                                const list = [...giziPmba.months];
                                list[idx].asi_pelekatan = e.target.value;
                                setGiziPmba({ ...giziPmba, months: list });
                              }}
                              className="bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                            >
                              <option value="Baik">Baik</option>
                              <option value="Cukup">Cukup</option>
                              <option value="Kurang">Kurang</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2 flex gap-1.5 items-center mt-1.5">
                            <label className="flex items-center gap-1">
                              <input 
                                type="checkbox" checked={item.mpasi_protein}
                                onChange={(e) => {
                                  const list = [...giziPmba.months];
                                  list[idx].mpasi_protein = e.target.checked;
                                  setGiziPmba({ ...giziPmba, months: list });
                                }}
                              /> Lauk
                            </label>
                            <label className="flex items-center gap-1">
                              <input 
                                type="checkbox" checked={item.mpasi_sayur}
                                onChange={(e) => {
                                  const list = [...giziPmba.months];
                                  list[idx].mpasi_sayur = e.target.checked;
                                  setGiziPmba({ ...giziPmba, months: list });
                                }}
                              /> Sayur
                            </label>
                          </td>
                          <td className="py-2.5 px-2">
                            <select
                              value={item.texture}
                              onChange={(e) => {
                                const list = [...giziPmba.months];
                                list[idx].texture = e.target.value;
                                setGiziPmba({ ...giziPmba, months: list });
                              }}
                              className="bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                            >
                              <option value="Disaring">Disaring</option>
                              <option value="Dihaluskan">Dihaluskan</option>
                              <option value="Dicincang">Dicincang</option>
                              <option value="Makanan Rumah">Makanan Rumah</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2">
                            <input 
                              type="text" placeholder="Jumlah"
                              value={item.amount}
                              onChange={(e) => {
                                const list = [...giziPmba.months];
                                list[idx].amount = e.target.value;
                                setGiziPmba({ ...giziPmba, months: list });
                              }}
                              className="w-20 bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input 
                              type="text" placeholder="Main / Snack"
                              value={`${item.freq_main || ""}/${item.freq_snack || ""}`}
                              onChange={(e) => {
                                const list = [...giziPmba.months];
                                const parts = e.target.value.split("/");
                                list[idx].freq_main = parts[0] || "";
                                list[idx].freq_snack = parts[1] || "";
                                setGiziPmba({ ...giziPmba, months: list });
                              }}
                              className="w-24 bg-base-white border border-base-border/40 rounded-lg p-1 text-[10px]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vit A & Worm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div className="p-4 bg-brand-soft/10 border border-brand-primary/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Kapsul Vitamin A</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" placeholder="Bulan 6-11 Kapsul Biru"
                      value={`${giziPmba.vit_a_blue.date || ""} (${giziPmba.vit_a_blue.batch || ""})`}
                      onChange={(e) => {
                        const parts = e.target.value.split(" (");
                        setGiziPmba({ ...giziPmba, vit_a_blue: { date: parts[0] || "", batch: (parts[1] || "").replace(")", "") } });
                      }}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2 text-[10px]"
                    />
                    <input 
                      type="text" placeholder="Tahun 1 Kapsul Merah"
                      value={giziPmba.vit_a_red.y1}
                      onChange={(e) => setGiziPmba({ ...giziPmba, vit_a_red: { ...giziPmba.vit_a_red, y1: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2 text-[10px]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-base-bg/10 border border-base-border/20 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-base-text-secondary block">Obat Cacing Berkala</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" placeholder="Tahun 1"
                      value={giziPmba.worm_pills.y1}
                      onChange={(e) => setGiziPmba({ ...giziPmba, worm_pills: { ...giziPmba.worm_pills, y1: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2 text-[10px]"
                    />
                    <input 
                      type="text" placeholder="Tahun 2"
                      value={giziPmba.worm_pills.y2}
                      onChange={(e) => setGiziPmba({ ...giziPmba, worm_pills: { ...giziPmba.worm_pills, y2: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2 text-[10px]"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: IMUNISASI */}
        {activeTab === "imunisasi" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Imunisasi Dasar &amp; Lanjutan Anak (Halaman 124-125)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1 text-xs">
              {Object.keys(imunisasi).map((key) => (
                <div key={key} className="p-3 bg-base-bg/15 rounded-xl border border-base-border/10 flex flex-col justify-between">
                  <span className="font-bold text-brand-primary uppercase text-[10px]">{key.replace(/_/g, " ")}</span>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <input 
                      type="date"
                      value={imunisasi[key].date}
                      onChange={(e) => setImunisasi({ ...imunisasi, [key]: { ...imunisasi[key], date: e.target.value } })}
                      className="bg-base-white border border-base-border/40 rounded-lg p-1.5 text-[10px]"
                    />
                    <input 
                      type="text" placeholder="Batch/Paraf"
                      value={imunisasi[key].batch}
                      onChange={(e) => setImunisasi({ ...imunisasi, [key]: { ...imunisasi[key], batch: e.target.value } })}
                      className="bg-base-white border border-base-border/40 rounded-lg p-1.5 text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LILA */}
        {activeTab === "lila" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Lembar Pencatatan Lingkar Lengan Atas (LiLA) Anak (Halaman 128)</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 text-xs">
              
              {/* LiLA < 6 Bulan */}
              <div className="p-4 bg-brand-soft/10 border border-brand-primary/10 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] text-brand-primary uppercase block">1. Bayi Usia &lt; 6 Bulan (Target &ge; 11.0 cm)</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {["m1", "m2", "m3", "m4", "m5"].map((m, idx) => (
                    <div key={m}>
                      <label className="text-[10px] text-gray-500 font-bold block mb-1">Bulan {idx + 1}</label>
                      <input 
                        type="number" step="0.1" placeholder="cm"
                        value={lila[m]}
                        onChange={(e) => setLila({ ...lila, [m]: e.target.value })}
                        className="w-full bg-base-white border border-base-border/40 rounded-lg p-2 text-xs font-semibold"
                      />
                      {lila[m] && parseFloat(lila[m]) < 11.0 && (
                        <span className="text-[9px] text-status-red-solid font-bold block mt-0.5">⚠️ Risiko Hambatan</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* LiLA >= 6 Bulan */}
              <div className="p-4 bg-base-bg/10 border border-base-border/20 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] text-base-text-secondary uppercase block">2. Anak Usia &ge; 6 Bulan (Target &ge; 12.5 cm)</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {["m6", "m12", "m18", "m24", "m36", "m48", "m60"].map((m) => (
                    <div key={m}>
                      <label className="text-[10px] text-gray-500 font-bold block mb-1">{m.replace("m", "Bulan ")}</label>
                      <input 
                        type="number" step="0.1" placeholder="cm"
                        value={lila[m]}
                        onChange={(e) => setLila({ ...lila, [m]: e.target.value })}
                        className="w-full bg-base-white border border-base-border/40 rounded-lg p-2 text-xs font-semibold"
                      />
                      {lila[m] && parseFloat(lila[m]) < 11.5 && (
                        <span className="text-[9px] text-status-red-solid font-bold block mt-0.5">🚨 Gizi Buruk</span>
                      )}
                      {lila[m] && parseFloat(lila[m]) >= 11.5 && parseFloat(lila[m]) < 12.5 && (
                        <span className="text-[9px] text-status-orange-solid font-bold block mt-0.5">⚠️ Gizi Kurang</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-base-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-base-white p-6 rounded-3xl max-w-sm w-full mx-4 shadow-xl border border-base-border/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E6F8ED] text-status-green-solid flex items-center justify-center text-2xl mx-auto shadow-xs border border-status-green-solid/10">
              <MdCheckCircleOutline className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-base-text-primary">Data Berhasil Disimpan</h4>
            <p className="text-[11px] text-base-text-secondary leading-relaxed font-semibold">Rekam medis klinis anak telah berhasil diperbarui dan disimpan dalam lokal data posyandu.</p>
          </div>
        </div>
      )}

    </div>
  );
}
