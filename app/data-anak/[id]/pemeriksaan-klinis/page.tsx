"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave, MdCheckCircleOutline, MdChildCare, MdBrush, MdVaccines, MdFastfood, MdShield, MdScale, MdEdit, MdClose } from "react-icons/md";

export default function PemeriksaanKlinisAnakPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingSection, setEditingSection] = useState<"neonatus" | "sdidtk" | "gigi" | "gizi_pmba" | "imunisasi" | "lila" | null>(null);
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

  const handleSaveSection = () => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    localStorage.setItem(`pemeriksaan_neonatus_${decodedId}`, JSON.stringify(neonatus));
    localStorage.setItem(`pemeriksaan_sdidtk_anak_${decodedId}`, JSON.stringify(sdidtkList));
    localStorage.setItem(`pemeriksaan_gigi_anak_${decodedId}`, JSON.stringify(gigiList));
    localStorage.setItem(`pemeriksaan_gizi_pmba_${decodedId}`, JSON.stringify(giziPmba));
    localStorage.setItem(`pemeriksaan_imunisasi_${decodedId}`, JSON.stringify(imunisasi));
    localStorage.setItem(`pemeriksaan_lila_${decodedId}`, JSON.stringify(lila));

    setEditingSection(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const currentSdidtk = sdidtkList.find(item => item.month === selectedMonth) || {};

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-base-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/data-anak/${id}`} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Dashboard Rekam Medis Anak (Kader Workstation)</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Anak: <span className="font-bold text-base-text-primary">{child?.name || child?.child_name || "-"}</span> &bull; Gender: <span className="font-semibold text-base-text-primary">{child?.gender === "M" ? "Laki-laki" : "Perempuan"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid layout like Child EHR view, but with Edit Button per Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Neonatus */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdChildCare className="w-4.5 h-4.5" /> NEONATUS (0-28 HARI)
              </span>
              <button 
                onClick={() => setEditingSection("neonatus")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>⚖️ Berat Lahir: <span className="text-base-text-primary">{neonatus.h06.bb || "-"} g</span></p>
              <p>🍼 ASI Eksklusif: <span className="text-base-text-primary">{neonatus.kn1.breast || "Ya"}</span></p>
              <p>⚠️ Kuning Kremer: <span className="text-base-text-primary">Tingkat {neonatus.kn2.kremer || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 2: SDIDTK */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdScale className="w-4.5 h-4.5" /> TUMBUH KEMBANG (SDIDTK)
              </span>
              <button 
                onClick={() => setEditingSection("sdidtk")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>⚖️ BB/U (Status): <span className="text-base-text-primary">{sdidtkList[selectedMonth - 1]?.weight_status || "-"}</span></p>
              <p>🧠 KPSP: <span className="text-brand-primary">{sdidtkList[selectedMonth - 1]?.kpsp || "-"}</span></p>
              <p>🩺 Intervensi: <span className="text-base-text-primary italic">{sdidtkList[selectedMonth - 1]?.intervention || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 3: Gigi */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdBrush className="w-4.5 h-4.5" /> KESEHATAN GIGI
              </span>
              <button 
                onClick={() => setEditingSection("gigi")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>🦷 Gigi Ada: <span className="text-base-text-primary">{gigiList[0]?.count || "0"} Gigi</span></p>
              <p>⚠️ Gigi Berlubang: <span className="text-status-red-solid">{gigiList[0]?.cavities || "0"} Lubang</span></p>
              <p>🧼 Kondisi Plak: <span className="text-base-text-primary">{gigiList[0]?.plaque || "Bersih"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 4: PMBA & Gizi */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdFastfood className="w-4.5 h-4.5" /> PMBA &amp; GIZI
              </span>
              <button 
                onClick={() => setEditingSection("gizi_pmba")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>🍼 ASI Freq: <span className="text-base-text-primary">{giziPmba.months[0]?.asi_freq || "-"}</span></p>
              <p>🍚 Tekstur: <span className="text-base-text-primary">{giziPmba.months[0]?.texture || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 5: Imunisasi */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdVaccines className="w-4.5 h-4.5" /> IMUNISASI
              </span>
              <button 
                onClick={() => setEditingSection("imunisasi")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>💉 HB0: <span className="text-base-text-primary">{imunisasi.hb0?.date || "-"}</span></p>
              <p>💉 BCG: <span className="text-base-text-primary">{imunisasi.bcg?.date || "-"}</span></p>
              <p>💉 Polio 1: <span className="text-base-text-primary">{imunisasi.polio1?.date || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 6: LiLA */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdShield className="w-4.5 h-4.5" /> LINGKAR LENGAN (LILA)
              </span>
              <button 
                onClick={() => setEditingSection("lila")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>📏 LiLA Bulan 1: <span className="text-base-text-primary">{lila.m1 ? `${lila.m1} cm` : "-"}</span></p>
              <p>📏 LiLA Bulan 6: <span className="text-base-text-primary">{lila.m6 ? `${lila.m6} cm` : "-"}</span></p>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION EDITING MODALS */}
      {editingSection && (
        <div className="fixed inset-0 bg-base-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-base-white rounded-[32px] max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-base-border/30 space-y-6">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase tracking-wide">
                Edit Bagian: {editingSection.toUpperCase()}
              </h3>
              <button 
                onClick={() => setEditingSection(null)}
                className="p-1.5 border border-base-border/50 text-base-text-secondary hover:text-brand-primary rounded-xl cursor-pointer"
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            {editingSection === "neonatus" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {["h06", "kn1", "kn2", "kn3"].map((key) => (
                  <div key={key} className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                    <span className="font-bold text-xs capitalize text-brand-primary">{key}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" placeholder="Menyusu / ASI"
                        value={neonatus[key].breast || ""}
                        onChange={(e) => setNeonatus({ ...neonatus, [key]: { ...neonatus[key], breast: e.target.value } })}
                        className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                      />
                      <input 
                        type="text" placeholder="Tali Pusat"
                        value={neonatus[key].cord || ""}
                        onChange={(e) => setNeonatus({ ...neonatus, [key]: { ...neonatus[key], cord: e.target.value } })}
                        className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSection === "sdidtk" && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base-text-secondary">Pilih Umur Bulan:</span>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="bg-base-bg border border-base-border/40 rounded-xl p-2 font-bold text-brand-primary"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i + 1}>Bulan ke-{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-base-bg/15 p-4 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">BB/U</label>
                    <select 
                      value={sdidtkList[selectedMonth - 1]?.weight_status} 
                      onChange={(e) => {
                        const list = [...sdidtkList];
                        list[selectedMonth - 1].weight_status = e.target.value;
                        setSdidtkList(list);
                      }}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2"
                    >
                      <option value="SK">Sangat Kurang</option>
                      <option value="K">Kurang</option>
                      <option value="N">Normal</option>
                      <option value="RBL">Risiko Lebih</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">KPSP</label>
                    <select 
                      value={sdidtkList[selectedMonth - 1]?.kpsp} 
                      onChange={(e) => {
                        const list = [...sdidtkList];
                        list[selectedMonth - 1].kpsp = e.target.value;
                        setSdidtkList(list);
                      }}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl p-2 font-semibold text-brand-primary"
                    >
                      <option value="Sesuai">Sesuai</option>
                      <option value="Meragukan">Meragukan</option>
                      <option value="Penyimpangan">Penyimpangan</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {editingSection === "gigi" && (
              <div className="space-y-4 text-xs">
                {gigiList.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-base-bg/10 p-3 rounded-xl">
                    <span className="font-bold text-base-text-primary">{item.month} Bulan</span>
                    <input 
                      type="number" placeholder="Gigi Ada"
                      value={item.count}
                      onChange={(e) => {
                        const list = [...gigiList];
                        list[idx].count = e.target.value;
                        setGigiList(list);
                      }}
                      className="bg-base-white border border-base-border/40 rounded-lg p-1.5"
                    />
                    <input 
                      type="number" placeholder="Gigi Lubang"
                      value={item.cavities}
                      onChange={(e) => {
                        const list = [...gigiList];
                        list[idx].cavities = e.target.value;
                        setGigiList(list);
                      }}
                      className="bg-base-white border border-base-border/40 rounded-lg p-1.5"
                    />
                    <select 
                      value={item.plaque}
                      onChange={(e) => {
                        const list = [...gigiList];
                        list[idx].plaque = e.target.value;
                        setGigiList(list);
                      }}
                      className="bg-base-white border border-base-border/40 rounded-lg p-1.5"
                    >
                      <option value="Bersih">Bersih</option>
                      <option value="Kotor">Kotor</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button 
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-base-border/50 text-base-text-secondary rounded-xl hover:bg-base-bg font-bold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveSection}
                className="flex items-center gap-1.5 bg-brand-primary text-base-white px-5 py-2 rounded-xl font-bold hover:bg-brand-dark transition shadow-md cursor-pointer text-xs"
              >
                <MdSave className="w-4 h-4" /> Simpan Bagian
              </button>
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
