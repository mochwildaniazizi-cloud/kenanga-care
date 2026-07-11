"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave, MdCheckCircleOutline, MdPregnantWoman, MdMedicalServices, MdShield, MdBabyChangingStation, MdHome } from "react-icons/md";
import { getMotherDetail } from "@/app/actions/mothers";

export default function PemeriksaanKlinisIbuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mother, setMother] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"anc" | "usg_fisik" | "preeklampsia_dmg" | "persalinan" | "nifas">("anc");
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    anc: {
      t1: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" },
      t2_1: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" },
      t2_2: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" },
      t3_1: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" },
      t3_2: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" },
      t3_3: { date: "", place: "", weight: "", height: "", lila: "", bp: "", tfu: "", djj: "", tt: "", counseling: "", screening: "", pills: "", hb: "", goldar: "", protein: "", sugar: "", usg: "", triple: "", management: "" }
    },
    usg_fisik: {
      imt: "Normal", // Kurus, Normal, Gemuk, Obesitas
      vagina: "",
      fluksus: "Tidak",
      fluor: "Tidak",
      disease_history: {
        alergi: false, asma: false, autoimun: false, diabetes: false, hipertensi: false, jantung: false, jiwa: false, sifilis: false, tb: false
      },
      prev_pregnancy: [
        { year: "", weight: "", process: "", helper: "", problem: "" }
      ],
      usg: {
        gs: "Tunggal",
        gs_diameter: "",
        crl: "",
        location: "Intrauterin",
        heart_pulsation: "Ya",
        bpd: "", hc: "", ac: "", fl: "", efw: "",
        amnion: ""
      },
      mental_screening: "",
      delivery_plan: "Normal"
    },
    preeklampsia_dmg: {
      risiko_sedang: { nullipara: false, usia_35: false, bmi_30: false, riwayat_keluarga: false, jarak_10: false },
      risiko_tinggi: { riwayat_preeklampsia: false, kehamilan_ganda: false, hipertensi_kronis: false, diabetes: false, ginjal: false, autoimun: false },
      sistole: "",
      diastole: "",
      urin_celup: "Negatif", // Negatif, +1, +2, +3, +4
      dmg: {
        gdp: "",
        gd2jpp: ""
      }
    },
    persalinan: {
      birth_cert_no: "",
      birth_time: "",
      gestation_age: "",
      child_order: "",
      baby_weight: "",
      baby_height: "",
      head_circ: "",
      birth_type: "Tunggal",
      mother_details: { name: "", age: "", nik: "", occupation: "", address: "" },
      father_details: { name: "", age: "", nik: "", occupation: "", address: "" },
      delivery_method: "Spontan",
      helper: "Bidan",
      imd: "Ya",
      footprint_file: ""
    },
    nifas: {
      kf1: { date: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf2: { date: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf3: { date: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf4: { date: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      final_status: {
        mother: "Sehat",
        baby: "Sehat",
        problems: ""
      }
    }
  });

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    
    // Load Mother Info
    getMotherDetail(decodedId).then(data => {
      if (data) {
        setMother(data);
      }
    });

    // Load form from localStorage
    const saved = localStorage.getItem(`pemeriksaan_klinis_ibu_${decodedId}`);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed parsing mother clinical data", e);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    localStorage.setItem(`pemeriksaan_klinis_ibu_${decodedId}`, JSON.stringify(formData));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // MAP Calculation
  const getMAP = () => {
    const sys = parseFloat(formData.preeklampsia_dmg.sistole);
    const dia = parseFloat(formData.preeklampsia_dmg.diastole);
    if (isNaN(sys) || isNaN(dia)) return null;
    return Math.round(((2 * dia) + sys) / 3);
  };

  const mapValue = getMAP();
  const urinCelup = formData.preeklampsia_dmg.urin_celup;
  const isReferralNeeded = (mapValue !== null && mapValue > 90) || urinCelup === "+1" || urinCelup === "+2" || urinCelup === "+3" || urinCelup === "+4";

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-base-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/data-ibu/${id}`} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Rekam Medis Klinis Ibu</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Ibu: <span className="font-bold text-base-text-primary">{mother?.mother_name || "-"}</span> &bull; NIK: <span className="font-semibold text-base-text-primary">{mother?.national_id || "-"}</span>
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
      <div className="flex bg-base-white border border-base-border/30 p-1 rounded-2xl gap-1 text-[11px] font-bold overflow-x-auto no-scrollbar shadow-xs">
        {[
          { id: "anc", label: "ANC Trimester 1-3", icon: <MdPregnantWoman className="w-4 h-4" /> },
          { id: "usg_fisik", label: "USG & Pemeriksaan Fisik", icon: <MdMedicalServices className="w-4 h-4" /> },
          { id: "preeklampsia_dmg", label: "Skrining Preeklampsia & DMG", icon: <MdShield className="w-4 h-4" /> },
          { id: "persalinan", label: "Persalinan & Keterangan Lahir", icon: <MdBabyChangingStation className="w-4 h-4" /> },
          { id: "nifas", label: "Pelayanan Nifas (KF)", icon: <MdHome className="w-4 h-4" /> }
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

      {/* Main Panel Content */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: ANC */}
        {activeTab === "anc" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Log Pemeriksaan ANC (Antenatal Care)</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
              {[
                { key: "t1", title: "Trimester I (Kunjungan 1)" },
                { key: "t2_1", title: "Trimester II (Kunjungan 2)" },
                { key: "t2_2", title: "Trimester II (Kunjungan 3)" },
                { key: "t3_1", title: "Trimester III (Kunjungan 4)" },
                { key: "t3_2", title: "Trimester III (Kunjungan 5)" },
                { key: "t3_3", title: "Trimester III (Kunjungan 6)" }
              ].map((visit) => (
                <div key={visit.key} className="p-4 bg-base-bg/10 rounded-2xl space-y-4 border border-base-border/10">
                  <h3 className="font-bold text-xs text-base-text-primary">{visit.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Periksa</label>
                      <input 
                        type="date" 
                        value={formData.anc[visit.key].date}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], date: e.target.value } } })}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tempat Periksa</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].place}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], place: e.target.value } } })}
                        placeholder="Puskesmas/Klinik"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Berat Badan (kg)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].weight}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], weight: e.target.value } } })}
                        placeholder="BB"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Badan (cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].height}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], height: e.target.value } } })}
                        placeholder="TB"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lingkar Lengan Atas (LiLA cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].lila}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], lila: e.target.value } } })}
                        placeholder="LiLA"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tekanan Darah (mmHg)</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].bp}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], bp: e.target.value } } })}
                        placeholder="120/80"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Fundus Uteri (TFU cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].tfu}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], tfu: e.target.value } } })}
                        placeholder="TFU"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Denyut Jantung Janin (DJJ x/mnt)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].djj}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], djj: e.target.value } } })}
                        placeholder="DJJ"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Imunisasi TT</label>
                      <select 
                        value={formData.anc[visit.key].tt}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], tt: e.target.value } } })}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="">Belum/Tidak</option>
                        <option value="T1">T1</option>
                        <option value="T2">T2</option>
                        <option value="T3">T3</option>
                        <option value="T4">T4</option>
                        <option value="T5">T5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pil TTD / MMS</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].pills}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], pills: e.target.value } } })}
                        placeholder="Jumlah tablet"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tes Laboratorium (Hb g/dL)</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].hb}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], hb: e.target.value } } })}
                        placeholder="Kadar Hb"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Protein Urin</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].protein}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], protein: e.target.value } } })}
                        placeholder="Protein Urin"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Gula Darah</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].sugar}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], sugar: e.target.value } } })}
                        placeholder="mg/dL"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tripel Eliminasi</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].triple}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], triple: e.target.value } } })}
                        placeholder="HIV, Sifilis, Hep B"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tata Laksana Kasus &amp; Rujukan</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].management}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], management: e.target.value } } })}
                        placeholder="Catatan rujukan atau resep nakes"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: USG & PEMERIKSAAN FISIK */}
        {activeTab === "usg_fisik" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Evaluasi Kesehatan Fisik &amp; Hasil USG</h2>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">IMT (Indeks Massa Tubuh)</label>
                  <select 
                    value={formData.usg_fisik.imt}
                    onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, imt: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Kurus">Kurus</option>
                    <option value="Normal">Normal</option>
                    <option value="Gemuk">Gemuk</option>
                    <option value="Obesitas">Obesitas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Inspeksi Vagina/Porsio/Uretra</label>
                  <input 
                    type="text" 
                    value={formData.usg_fisik.vagina}
                    onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, vagina: e.target.value } })}
                    placeholder="Hasil inspeksi"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Fluksus</label>
                    <select 
                      value={formData.usg_fisik.fluksus}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, fluksus: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tidak">Tidak (-)</option>
                      <option value="Ya">Ya (+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Fluor</label>
                    <select 
                      value={formData.usg_fisik.fluor}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, fluor: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tidak">Tidak (-)</option>
                      <option value="Ya">Ya (+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Riwayat Penyakit */}
              <div className="bg-base-bg/10 p-4 rounded-2xl space-y-2.5">
                <span className="font-bold text-[10px] uppercase text-base-text-secondary">Riwayat Penyakit Ibu / Riwayat Keluarga</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.keys(formData.usg_fisik.disease_history).map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer font-semibold text-base-text-secondary hover:text-base-text-primary capitalize">
                      <input 
                        type="checkbox"
                        checked={formData.usg_fisik.disease_history[d]}
                        onChange={(e) => setFormData({
                          ...formData,
                          usg_fisik: {
                            ...formData.usg_fisik,
                            disease_history: {
                              ...formData.usg_fisik.disease_history,
                              [d]: e.target.checked
                            }
                          }
                        })}
                        className="accent-brand-primary w-4.5 h-4.5"
                      />
                      <span>{d === "tb" ? "TB Paru" : d}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Riwayat Kehamilan Terdahulu */}
              <div className="p-4 border border-base-border/20 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-base-text-secondary">Log Kehamilan Terdahulu</span>
                {formData.usg_fisik.prev_pregnancy.map((p: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Tahun"
                      value={p.year}
                      onChange={(e) => {
                        const list = [...formData.usg_fisik.prev_pregnancy];
                        list[idx].year = e.target.value;
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, prev_pregnancy: list } });
                      }}
                      className="bg-base-white border border-base-border/40 rounded-xl px-2 py-1 text-xs"
                    />
                    <input 
                      type="number" 
                      placeholder="BB (kg)"
                      value={p.weight}
                      onChange={(e) => {
                        const list = [...formData.usg_fisik.prev_pregnancy];
                        list[idx].weight = e.target.value;
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, prev_pregnancy: list } });
                      }}
                      className="bg-base-white border border-base-border/40 rounded-xl px-2 py-1 text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Proses"
                      value={p.process}
                      onChange={(e) => {
                        const list = [...formData.usg_fisik.prev_pregnancy];
                        list[idx].process = e.target.value;
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, prev_pregnancy: list } });
                      }}
                      className="bg-base-white border border-base-border/40 rounded-xl px-2 py-1 text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Penolong"
                      value={p.helper}
                      onChange={(e) => {
                        const list = [...formData.usg_fisik.prev_pregnancy];
                        list[idx].helper = e.target.value;
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, prev_pregnancy: list } });
                      }}
                      className="bg-base-white border border-base-border/40 rounded-xl px-2 py-1 text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Masalah"
                      value={p.problem}
                      onChange={(e) => {
                        const list = [...formData.usg_fisik.prev_pregnancy];
                        list[idx].problem = e.target.value;
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, prev_pregnancy: list } });
                      }}
                      className="bg-base-white border border-base-border/40 rounded-xl px-2 py-1 text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    usg_fisik: {
                      ...formData.usg_fisik,
                      prev_pregnancy: [...formData.usg_fisik.prev_pregnancy, { year: "", weight: "", process: "", helper: "", problem: "" }]
                    }
                  })}
                  className="text-[10px] font-bold text-brand-primary"
                >
                  + Tambah Log Kehamilan
                </button>
              </div>

              {/* Hasil USG */}
              <div className="bg-brand-soft/5 p-4 border border-brand-primary/10 rounded-2xl space-y-4">
                <span className="font-bold text-[10px] uppercase text-brand-primary">Hasil USG Obstetrik</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Kantung Gestasi (GS)</label>
                    <select 
                      value={formData.usg_fisik.usg.gs}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, gs: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tunggal">Tunggal</option>
                      <option value="Kembar">Kembar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">GS Diameter (mm)</label>
                    <input 
                      type="number" 
                      value={formData.usg_fisik.usg.gs_diameter}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, gs_diameter: e.target.value } } })}
                      placeholder="mm"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Crown-Rump Length (CRL mm)</label>
                    <input 
                      type="number" 
                      value={formData.usg_fisik.usg.crl}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, crl: e.target.value } } })}
                      placeholder="mm"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lokasi Kantung</label>
                    <select 
                      value={formData.usg_fisik.usg.location}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, location: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Intrauterin">Intrauterin</option>
                      <option value="Extrauterin">Extrauterin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pulsasi Jantung Janin</label>
                    <select 
                      value={formData.usg_fisik.usg.heart_pulsation}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, heart_pulsation: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Ya">Ya</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">BPD / HC / AC / FL (mm)</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg.bpd || ""}/${formData.usg_fisik.usg.hc || ""}/${formData.usg_fisik.usg.ac || ""}/${formData.usg_fisik.usg.fl || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({
                          ...formData,
                          usg_fisik: {
                            ...formData.usg_fisik,
                            usg: {
                              ...formData.usg_fisik.usg,
                              bpd: parts[0] || "",
                              hc: parts[1] || "",
                              ac: parts[2] || "",
                              fl: parts[3] || ""
                            }
                          }
                        });
                      }}
                      placeholder="BPD/HC/AC/FL"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Estimasi Berat Janin (EFW g)</label>
                    <input 
                      type="number" 
                      value={formData.usg_fisik.usg.efw}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, efw: e.target.value } } })}
                      placeholder="gram"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Air Ketuban (SDP cm)</label>
                    <input 
                      type="number" 
                      value={formData.usg_fisik.usg.amnion}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg: { ...formData.usg_fisik.usg, amnion: e.target.value } } })}
                      placeholder="SDP cm"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Skrining Kesehatan Jiwa Nakes</label>
                  <input 
                    type="text" 
                    value={formData.usg_fisik.mental_screening}
                    onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, mental_screening: e.target.value } })}
                    placeholder="Hasil skrining kejiwaan"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Rencana Persalinan</label>
                  <select 
                    value={formData.usg_fisik.delivery_plan}
                    onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, delivery_plan: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Normal">Normal (Pervaginam Spontan)</option>
                    <option value="Pervaginam Berbantu">Pervaginam Berbantu (Vakum/Forsep)</option>
                    <option value="SC">Sectio Caesarea (SC)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PREEKLAMPSIA & DMG */}
        {activeTab === "preeklampsia_dmg" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Matriks Skrining Preeklampsia &amp; DM Gestasional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              <div className="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-2xl p-4.5 space-y-3">
                <span className="font-bold text-[10px] uppercase text-status-orange-solid block">Faktor Risiko Sedang Preeklampsia</span>
                <div className="space-y-2">
                  {Object.keys(formData.preeklampsia_dmg.risiko_sedang).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer font-medium text-base-text-secondary hover:text-base-text-primary">
                      <input 
                        type="checkbox"
                        checked={formData.preeklampsia_dmg.risiko_sedang[key]}
                        onChange={(e) => setFormData({
                          ...formData,
                          preeklampsia_dmg: {
                            ...formData.preeklampsia_dmg,
                            risiko_sedang: {
                              ...formData.preeklampsia_dmg.risiko_sedang,
                              [key]: e.target.checked
                            }
                          }
                        })}
                        className="accent-status-orange-solid w-4.5 h-4.5"
                      />
                      <span>{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-4.5 space-y-3">
                <span className="font-bold text-[10px] uppercase text-status-red-solid block">Faktor Risiko Tinggi Preeklampsia</span>
                <div className="space-y-2">
                  {Object.keys(formData.preeklampsia_dmg.risiko_tinggi).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer font-medium text-base-text-secondary hover:text-base-text-primary">
                      <input 
                        type="checkbox"
                        checked={formData.preeklampsia_dmg.risiko_tinggi[key]}
                        onChange={(e) => setFormData({
                          ...formData,
                          preeklampsia_dmg: {
                            ...formData.preeklampsia_dmg,
                            risiko_tinggi: {
                              ...formData.preeklampsia_dmg.risiko_tinggi,
                              [key]: e.target.checked
                            }
                          }
                        })}
                        className="accent-status-red-solid w-4.5 h-4.5"
                      />
                      <span>{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* MAP & Urin */}
            <div className="p-4 border border-base-border/30 rounded-2xl space-y-4 text-xs">
              <span className="font-bold text-[10px] uppercase text-base-text-secondary">Pemeriksaan MAP &amp; Protein Urine</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Sistole (mmHg)</label>
                  <input 
                    type="number"
                    value={formData.preeklampsia_dmg.sistole}
                    onChange={(e) => setFormData({
                      ...formData,
                      preeklampsia_dmg: { ...formData.preeklampsia_dmg, sistole: e.target.value }
                    })}
                    placeholder="Sistole"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Diastole (mmHg)</label>
                  <input 
                    type="number"
                    value={formData.preeklampsia_dmg.diastole}
                    onChange={(e) => setFormData({
                      ...formData,
                      preeklampsia_dmg: { ...formData.preeklampsia_dmg, diastole: e.target.value }
                    })}
                    placeholder="Diastole"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Protein Urine Celup</label>
                  <select
                    value={formData.preeklampsia_dmg.urin_celup}
                    onChange={(e) => setFormData({
                      ...formData,
                      preeklampsia_dmg: { ...formData.preeklampsia_dmg, urin_celup: e.target.value }
                    })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Negatif">Negatif (-)</option>
                    <option value="+1">+1</option>
                    <option value="+2">+2</option>
                    <option value="+3">+3</option>
                    <option value="+4">+4</option>
                  </select>
                </div>
              </div>

              {mapValue !== null && (
                <div className="flex items-center justify-between p-3.5 bg-base-bg/30 rounded-xl">
                  <span className="font-bold text-base-text-secondary text-[11px]">Mean Arterial Pressure (MAP):</span>
                  <span className={`text-sm font-black ${mapValue > 90 ? "text-status-red-solid" : "text-status-green-solid"}`}>
                    {mapValue} mmHg
                  </span>
                </div>
              )}

              {isReferralNeeded && (
                <div className="p-4 bg-status-red-light/20 border border-status-red-solid/25 rounded-xl text-xs text-status-red-solid font-bold leading-relaxed flex gap-2.5 items-start shadow-xs animate-in shake duration-300">
                  <span className="text-lg">🚨</span>
                  <div>
                    <h5 className="font-black text-status-red-solid text-xs">REKOMENDASI RUJUK KE FKRTL:</h5>
                    <p className="font-semibold text-status-red-solid/90 mt-0.5">Hasil MAP ({mapValue} mmHg) &gt; 90 atau Protein Urin ({urinCelup}) positif terdeteksi. Rujuk pasien ke Fasilitas Kesehatan Rujukan Tingkat Lanjut (FKRTL) segera!</p>
                  </div>
                </div>
              )}
            </div>

            {/* DM Gestasional */}
            <div className="p-4 border border-base-border/30 rounded-2xl space-y-3 text-xs">
              <span className="font-bold text-[10px] uppercase text-base-text-secondary">Skrining Diabetes Melitus Gestasional (DMG)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Gula Darah Puasa (GDP mg/dL)</label>
                  <input 
                    type="number"
                    value={formData.preeklampsia_dmg.dmg.gdp}
                    onChange={(e) => setFormData({
                      ...formData,
                      preeklampsia_dmg: { ...formData.preeklampsia_dmg, dmg: { ...formData.preeklampsia_dmg.dmg, gdp: e.target.value } }
                    })}
                    placeholder="GDP"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Gula Darah 2 Jam Post Prandial (GD2JPP mg/dL)</label>
                  <input 
                    type="number"
                    value={formData.preeklampsia_dmg.dmg.gd2jpp}
                    onChange={(e) => setFormData({
                      ...formData,
                      preeklampsia_dmg: { ...formData.preeklampsia_dmg, dmg: { ...formData.preeklampsia_dmg.dmg, gd2jpp: e.target.value } }
                    })}
                    placeholder="GD2JPP"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PERSALINAN */}
        {activeTab === "persalinan" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Keterangan Lahir &amp; Persalinan</h2>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">No. Keterangan Lahir</label>
                  <input 
                    type="text" 
                    value={formData.persalinan.birth_cert_no}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, birth_cert_no: e.target.value } })}
                    placeholder="Nomor Surat"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal/Waktu Lahir</label>
                  <input 
                    type="datetime-local" 
                    value={formData.persalinan.birth_time}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, birth_time: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Usia Gestasi (Minggu)</label>
                  <input 
                    type="number" 
                    value={formData.persalinan.gestation_age}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, gestation_age: e.target.value } })}
                    placeholder="Minggu"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Anak Ke-</label>
                  <input 
                    type="number" 
                    value={formData.persalinan.child_order}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, child_order: e.target.value } })}
                    placeholder="Urutan Anak"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                  />
                </div>
              </div>

              {/* Antropometri Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Berat Lahir (gram)</label>
                  <input 
                    type="number" 
                    value={formData.persalinan.baby_weight}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, baby_weight: e.target.value } })}
                    placeholder="gram"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Panjang Lahir (cm)</label>
                  <input 
                    type="number" 
                    value={formData.persalinan.baby_height}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, baby_height: e.target.value } })}
                    placeholder="cm"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lingkar Kepala (cm)</label>
                  <input 
                    type="number" 
                    value={formData.persalinan.head_circ}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, head_circ: e.target.value } })}
                    placeholder="cm"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-semibold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Jenis Kelahiran</label>
                  <select 
                    value={formData.persalinan.birth_type}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, birth_type: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Tunggal">Tunggal</option>
                    <option value="Kembar">Kembar</option>
                  </select>
                </div>
              </div>

              {/* Ibu / Ayah info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Identitas Ibu</span>
                  <input 
                    type="text" placeholder="Nama Lengkap Ibu"
                    value={formData.persalinan.mother_details.name}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, mother_details: { ...formData.persalinan.mother_details, name: e.target.value } } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" placeholder="Umur"
                      value={formData.persalinan.mother_details.age}
                      onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, mother_details: { ...formData.persalinan.mother_details, age: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="NIK"
                      value={formData.persalinan.mother_details.nik}
                      onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, mother_details: { ...formData.persalinan.mother_details, nik: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Identitas Ayah</span>
                  <input 
                    type="text" placeholder="Nama Lengkap Ayah"
                    value={formData.persalinan.father_details.name}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, father_details: { ...formData.persalinan.father_details, name: e.target.value } } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" placeholder="Umur"
                      value={formData.persalinan.father_details.age}
                      onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, father_details: { ...formData.persalinan.father_details, age: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="NIK"
                      value={formData.persalinan.father_details.nik}
                      onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, father_details: { ...formData.persalinan.father_details, nik: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Metode Melahirkan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Metode Melahirkan</label>
                  <select 
                    value={formData.persalinan.delivery_method}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, delivery_method: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Spontan">Spontan</option>
                    <option value="Sungsang">Sungsang</option>
                    <option value="Vakum">Vakum</option>
                    <option value="Forsep">Forsep</option>
                    <option value="SC">Sectio Caesarea (SC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Penolong Persalinan</label>
                  <select 
                    value={formData.persalinan.helper}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, helper: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Spesialis">Dokter Spesialis Obsgyn</option>
                    <option value="Dokter">Dokter Umum</option>
                    <option value="Bidan">Bidan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Inisiasi Menyusu Dini (IMD)</label>
                  <select 
                    value={formData.persalinan.imd}
                    onChange={(e) => setFormData({ ...formData, persalinan: { ...formData.persalinan, imd: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Ya">Ya</option>
                    <option value="Tidak">Tidak</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: NIFAS */}
        {activeTab === "nifas" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Ringkasan Pelayanan Masa Nifas (KF 1 - 4)</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1 text-xs">
              {[
                { key: "kf1", title: "KF 1 (6 - 48 Jam)" },
                { key: "kf2", title: "KF 2 (3 - 7 Hari)" },
                { key: "kf3", title: "KF 3 (8 - 28 Hari)" },
                { key: "kf4", title: "KF 4 (29 - 42 Hari)" }
              ].map((kf) => (
                <div key={kf.key} className="p-4 bg-base-bg/10 rounded-2xl space-y-4 border border-base-border/10">
                  <h3 className="font-bold text-xs text-base-text-primary">{kf.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Kunjungan</label>
                      <input 
                        type="date" 
                        value={formData.nifas[kf.key].date}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], date: e.target.value } } })}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pemeriksaan Payudara</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].breast}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], breast: e.target.value } } })}
                        placeholder="Kondisi ASI/Payudara"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pemeriksaan Perdarahan</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].bleeding}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], bleeding: e.target.value } } })}
                        placeholder="Normal/Berlebih"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Kondisi Jalan Lahir</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].tear}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], tear: e.target.value } } })}
                        placeholder="Luka jahitan/Utuh"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-base-text-secondary hover:text-base-text-primary">
                        <input 
                          type="checkbox"
                          checked={formData.nifas[kf.key].vit_a}
                          onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], vit_a: e.target.checked } } })}
                          className="accent-brand-primary w-4.5 h-4.5"
                        />
                        <span>Vit A</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-base-text-secondary hover:text-base-text-primary">
                        <input 
                          type="checkbox"
                          checked={formData.nifas[kf.key].kb}
                          onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], kb: e.target.checked } } })}
                          className="accent-brand-primary w-4.5 h-4.5"
                        />
                        <span>KB Pasca Salin</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Skrining Jiwa</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].mental}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], mental: e.target.value } } })}
                        placeholder="Depresi postpartum?"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tata Laksana Kasus</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].management}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], management: e.target.value } } })}
                        placeholder="Tata laksana medis"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Status Akhir */}
              <div className="p-4 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-brand-primary">Status Akhir Masa Nifas (KF 4)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Keadaan Akhir Ibu</label>
                    <select 
                      value={formData.nifas.final_status.mother}
                      onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, final_status: { ...formData.nifas.final_status, mother: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Sehat">Sehat</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Meninggal">Meninggal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Keadaan Akhir Bayi</label>
                    <select 
                      value={formData.nifas.final_status.baby}
                      onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, final_status: { ...formData.nifas.final_status, baby: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Sehat">Sehat</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Kelainan">Kelainan Bawaan</option>
                      <option value="Meninggal">Meninggal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Masalah yang Terjadi</label>
                    <input 
                      type="text" 
                      value={formData.nifas.final_status.problems}
                      onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, final_status: { ...formData.nifas.final_status, problems: e.target.value } } })}
                      placeholder="Perdarahan/Infeksi/Hipertensi"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                    />
                  </div>
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
            <p className="text-[11px] text-base-text-secondary leading-relaxed font-semibold">Rekam medis klinis ibu telah berhasil diperbarui dan disimpan dalam lokal data posyandu.</p>
          </div>
        </div>
      )}

    </div>
  );
}
