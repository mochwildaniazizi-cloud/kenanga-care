"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave, MdCheckCircleOutline, MdChildCare, MdBrush } from "react-icons/md";

export default function PemeriksaanKlinisAnakPage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sdidtk" | "gigi">("sdidtk");
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initializing SDIDTK record list for 60 months
  const initialSdidtkList = Array.from({ length: 60 }, (_, i) => ({
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
    intervention: "", // Intervensi Rumah / Rujuk
    next_visit_date: ""
  }));

  const [sdidtkList, setSdidtkList] = useState<any[]>(initialSdidtkList);

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

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    
    // Load Child data from local cache of children
    const cachedChildren = localStorage.getItem("offline_mother_children_all") || "[]";
    try {
      const parsed = JSON.parse(cachedChildren);
      const found = parsed.find((c: any) => c.child_id === decodedId || c.id === decodedId);
      if (found) {
        setChild(found);
      } else {
        // Fallback title
        setChild({ name: "Anak Posyandu" });
      }
    } catch (e) {
      setChild({ name: "Anak Posyandu" });
    }

    // Load form from localStorage
    const savedSdidtk = localStorage.getItem(`pemeriksaan_sdidtk_anak_${decodedId}`);
    if (savedSdidtk) {
      try {
        setSdidtkList(JSON.parse(savedSdidtk));
      } catch (e) {}
    }

    const savedGigi = localStorage.getItem(`pemeriksaan_gigi_anak_${decodedId}`);
    if (savedGigi) {
      try {
        setGigiList(JSON.parse(savedGigi));
      } catch (e) {}
    }
  }, [id]);

  const handleSave = () => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    localStorage.setItem(`pemeriksaan_sdidtk_anak_${decodedId}`, JSON.stringify(sdidtkList));
    localStorage.setItem(`pemeriksaan_gigi_anak_${decodedId}`, JSON.stringify(gigiList));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const currentSdidtk = sdidtkList.find(item => item.month === selectedMonth) || sdidtkList[0];

  const updateCurrentSdidtk = (field: string, value: any) => {
    setSdidtkList(prev => prev.map(item => item.month === selectedMonth ? { ...item, [field]: value } : item));
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
          <MdSave className="w-4 h-4" /> Simpan Pemeriksaan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-base-white border border-base-border/30 p-1 rounded-2xl gap-1 text-[11px] font-bold shadow-xs">
        <button
          onClick={() => setActiveTab("sdidtk")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "sdidtk" ? "bg-brand-primary text-base-white shadow-sm" : "text-base-text-secondary hover:text-base-text-primary"}`}
        >
          <MdChildCare className="w-4 h-4" /> Evaluasi Tumbuh Kembang (SDIDTK)
        </button>
        <button
          onClick={() => setActiveTab("gigi")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === "gigi" ? "bg-brand-primary text-base-white shadow-sm" : "text-base-text-secondary hover:text-base-text-primary"}`}
        >
          <MdBrush className="w-4 h-4" /> Catatan Kesehatan Gigi
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: SDIDTK */}
        {activeTab === "sdidtk" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/10 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-brand-primary">Skrining &amp; Evaluasi Tumbuh Kembang SDIDTK</h2>
                <p className="text-[10px] text-base-text-secondary font-medium">Evaluasi periodik bulanan anak sesuai standar Buku KIA Kemenkes.</p>
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
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">KPSP (Kuesioner Pra Skrining)</label>
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
                      placeholder="Intervensi rumah / Rujuk"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Kunjungan Ulang</label>
                  <input 
                    type="date"
                    value={currentSdidtk.next_visit_date}
                    onChange={(e) => updateCurrentSdidtk("next_visit_date", e.target.value)}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: GIGI */}
        {activeTab === "gigi" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Catatan Pemeriksaan Kesehatan Gigi Anak</h2>
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
