"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdSave, MdCheckCircleOutline, MdPregnantWoman, MdMedicalServices, MdShield, MdBabyChangingStation, MdHome, MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { getMotherDetail } from "@/app/actions/mothers";

export default function PemeriksaanKlinisIbuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mother, setMother] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"anc" | "usg_fisik" | "preeklampsia_dmg" | "rencana_persalinan" | "skl" | "nifas">("anc");
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
      vagina: "Normal", uretra: "Normal", vulva: "Normal", porsio: "Normal",
      fluksus: "Tidak", fluor: "Tidak",
      disease_history: { alergi: false, asma: false, autoimun: false, diabetes: false, hepatitis_b: false, hipertensi: false, jantung: false, jiwa: false, sifilis: false, tb: false },
      risk_behavior: { fisik_kurang: false, alkohol: false, kosmetik_bahaya: false, merokok: false, obat_teratogenik: false, makan_berisiko: false },
      family_disease: { alergi: false, asma: false, autoimun: false, diabetes: false, hepatitis_b: false, hipertensi: false, jantung: false, jiwa: false, sifilis: false, tb: false },
      prev_pregnancy: [
        { year: "", weight: "", process: "", helper: "", problem: "" }
      ],
      usg_t1: { gs: "Tunggal", gs_diameter: "", crl: "", location: "Intrauterin", heart_pulsation: "Ya", abnormal: "Tidak", abnormal_detail: "" },
      usg_t3: { done: "Tidak", uk_t1: "", uk_hpht: "", uk_t3: "", gap_3weeks: "Tidak", count: "Tunggal", location: "Intrauterin", presentation: "Kepala", status: "Hidup", djj: "", plasenta: "Fundus", amnion_sdp: "", amnion_status: "Cukup", bpd: "", hc: "", ac: "", fl: "", efw: "", abnormal: "Tidak", abnormal_detail: "" },
      mental_screening: "",
      delivery_plan: "Normal"
    },
    preeklampsia_dmg: {
      risiko_sedang: { multipara_baru: false, teknologi_bantu: false, usia_35: false, nullipara: false, jarak_10: false, riwayat_keluarga: false, obesitas: false },
      risiko_tinggi: { riwayat_preeklampsia: false, kehamilan_ganda: false, diabetes: false, hipertensi_kronis: false, ginjal: false, autoimun: false, aps: false },
      sistole: "", diastole: "", urin_celup: "Negatif",
      dmg: { gdp: "", gd2jpp: "" }
    },
    rencana_persalinan: {
      client_name: "", client_address: "", helper_name: "", est_month: "", est_year: "",
      faskes1: "", faskes2: "", finance: "JKN",
      ambulance_driver1: "", ambulance_phone1: "", ambulance_driver2: "", ambulance_phone2: "",
      kb_chosen: "", donor_name1: "", donor_phone1: "", donor_name2: "", donor_phone2: "",
      // Ringkasan Persalinan
      delivery_date: "", delivery_time: "", gestation_age: "", order: "", penolong: "Bidan", cara: "Normal", keadaan_ibu: "Sehat", kb_postpartum: "",
      baby_gender: "Laki-laki", baby_weight: "", baby_height: "", baby_head: "", baby_status: "Segera menangis", baby_asuhan: { imd: false, vit_k1: false, salep: false, hb0: false }
    },
    skl: {
      no_skl: "", day: "", date: "", time: "", gender: "Laki-laki", type: "Tunggal", order: "", gestation: "", weight: "", height: "", head: "", place: "Puskesmas", place_address: "", baby_name: "",
      mother_name: "", mother_age: "", mother_nik: "",
      father_name: "", father_age: "", father_nik: "", father_job: "",
      address: "", rtrw: "", kec: "", kota: "",
      saksi1: "", saksi2: "", penolong_nakes: ""
    },
    nifas: {
      kf1: { date: "", place: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf2: { date: "", place: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf3: { date: "", place: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      kf4: { date: "", place: "", breast: "", bleeding: "", tear: "", vit_a: false, kb: false, mental: "", counseling: "", management: "" },
      checks_kf1: { general: false, vitals: false, lochia: false, perineum: false, fundus: false, breast: false, vit_a: false, kb: false, mental: false, counseling: false, sick: false },
      checks_kf2: { general: false, vitals: false, lochia: false, perineum: false, fundus: false, breast: false, vit_a: false, kb: false, mental: false, counseling: false, sick: false },
      checks_kf3: { general: false, vitals: false, lochia: false, perineum: false, fundus: false, breast: false, vit_a: false, kb: false, mental: false, counseling: false, sick: false },
      checks_kf4: { general: false, vitals: false, lochia: false, perineum: false, fundus: false, breast: false, vit_a: false, kb: false, mental: false, counseling: false, sick: false },
      final_status: { mother: "Sehat", baby: "Sehat", problems: "" }
    }
  });

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    
    // Load Mother Info
    getMotherDetail(decodedId).then(data => {
      if (data) {
        setMother(data);
        // Pre-fill some default fields if empty
        setFormData((prev: any) => ({
          ...prev,
          rencana_persalinan: {
            ...prev.rencana_persalinan,
            client_name: data.name || "",
            client_address: data.address || ""
          },
          skl: {
            ...prev.skl,
            mother_name: data.name || "",
            mother_nik: data.national_id || "",
            father_name: data.husband_name || "",
            address: data.address || ""
          }
        }));
      }
    });

    // Load form from localStorage
    const saved = localStorage.getItem(`pemeriksaan_klinis_ibu_${decodedId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
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
  
  // Rujukan preeklampsia logic: jika ada >= 2 risiko sedang, ATAU >= 1 risiko tinggi, ATAU MAP > 90, ATAU protein urin positif
  const countSedang = Object.values(formData.preeklampsia_dmg.risiko_sedang).filter(Boolean).length;
  const countTinggi = Object.values(formData.preeklampsia_dmg.risiko_tinggi).filter(Boolean).length;
  const isReferralNeeded = countSedang >= 2 || countTinggi >= 1 || (mapValue !== null && mapValue > 90) || urinCelup !== "Negatif";

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-base-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/data-ibu/${id}`} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
            <MdArrowBack className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Rekam Medis Klinis Ibu Hamil &amp; Nifas</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Ibu: <span className="font-bold text-base-text-primary">{mother?.name || "-"}</span> &bull; NIK: <span className="font-semibold text-base-text-primary">{mother?.national_id || "-"}</span>
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
          { id: "anc", label: "ANC Trimester 1-3", icon: <MdPregnantWoman className="w-4 h-4" /> },
          { id: "usg_fisik", label: "Pemeriksaan Fisik & USG", icon: <MdMedicalServices className="w-4 h-4" /> },
          { id: "preeklampsia_dmg", label: "Skrining Preeklampsia & DMG", icon: <MdShield className="w-4 h-4" /> },
          { id: "rencana_persalinan", label: "Rencana & Ringkasan Persalinan", icon: <MdBabyChangingStation className="w-4 h-4" /> },
          { id: "skl", label: "Surat Keterangan Lahir (SKL)", icon: <MdOutlineAssignmentTurnedIn className="w-4 h-4" /> },
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

      {/* Content Container */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: ANC */}
        {activeTab === "anc" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pencatatan Pelayanan Kesehatan Ibu (Halaman 96)</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
              {[
                { key: "t1", title: "Trimester I (Kunjungan 1)", activeFields: { height: true, lila: true, screening: true, goldar: true, triple: true } },
                { key: "t2_1", title: "Trimester II (Kunjungan 2)", activeFields: {} },
                { key: "t2_2", title: "Trimester II (Kunjungan 3)", activeFields: {} },
                { key: "t3_1", title: "Trimester III (Kunjungan 4)", activeFields: {} },
                { key: "t3_2", title: "Trimester III (Kunjungan 5)", activeFields: { screening: true, usg: true } },
                { key: "t3_3", title: "Trimester III (Kunjungan 6)", activeFields: { hb: true, protein: true, sugar: true } }
              ].map((visit) => (
                <div key={visit.key} className="p-4 bg-base-bg/10 rounded-2xl space-y-4 border border-base-border/10">
                  <h3 className="font-bold text-xs text-brand-primary">{visit.title}</h3>
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
                        placeholder="Nama Faskes"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Berat Badan (kg)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].weight}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], weight: e.target.value } } })}
                        placeholder="kg"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    
                    {/* TB - K1 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Badan (cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].height}
                        disabled={!visit.activeFields.height}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], height: e.target.value } } })}
                        placeholder={visit.activeFields.height ? "cm" : "Hanya Kunjungan 1"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    {/* LiLA - K1 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">LiLA (cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].lila}
                        disabled={!visit.activeFields.lila}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], lila: e.target.value } } })}
                        placeholder={visit.activeFields.lila ? "cm" : "Hanya Kunjungan 1"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
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
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Fundus (TFU cm)</label>
                      <input 
                        type="number" 
                        value={formData.anc[visit.key].tfu}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], tfu: e.target.value } } })}
                        placeholder="cm"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Letak &amp; DJJ Bayi</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].djj}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], djj: e.target.value } } })}
                        placeholder="Letak / DJJ"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Status Imunisasi TT</label>
                      <select 
                        value={formData.anc[visit.key].tt}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], tt: e.target.value } } })}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                      >
                        <option value="">Belum</option>
                        <option value="T1">T1</option>
                        <option value="T2">T2</option>
                        <option value="T3">T3</option>
                        <option value="T4">T4</option>
                        <option value="T5">T5</option>
                      </select>
                    </div>

                    {/* Skrining Dokter - K1 & K5 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Skrining Dokter</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].screening}
                        disabled={!visit.activeFields.screening}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], screening: e.target.value } } })}
                        placeholder={visit.activeFields.screening ? "Hasil" : "Hanya Kunjungan 1 & 5"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tablet TTD / MMS</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].pills}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], pills: e.target.value } } })}
                        placeholder="Jumlah"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>

                    {/* Hb - K1 & K6 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lab Hb (g/dL)</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].hb}
                        disabled={visit.key !== "t1" && visit.key !== "t3_3"}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], hb: e.target.value } } })}
                        placeholder={visit.key === "t1" || visit.key === "t3_3" ? "g/dL" : "Hanya Kunjungan 1 & 6"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    {/* Golongan Darah - K1 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Golongan Darah</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].goldar}
                        disabled={!visit.activeFields.goldar}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], goldar: e.target.value } } })}
                        placeholder={visit.activeFields.goldar ? "A/B/AB/O" : "Hanya Kunjungan 1"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    {/* Protein Urine - K1 & K6 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Protein Urine</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].protein}
                        disabled={visit.key !== "t1" && visit.key !== "t3_3"}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], protein: e.target.value } } })}
                        placeholder={visit.key === "t1" || visit.key === "t3_3" ? "Hasil" : "Hanya Kunjungan 1 & 6"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    {/* Gula Darah - K1 & K6 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Gula Darah (mg/dL)</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].sugar}
                        disabled={visit.key !== "t1" && visit.key !== "t3_3"}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], sugar: e.target.value } } })}
                        placeholder={visit.key === "t1" || visit.key === "t3_3" ? "mg/dL" : "Hanya Kunjungan 1 & 6"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    {/* USG - K1 & K5 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pemeriksaan USG</label>
                      <select 
                        value={formData.anc[visit.key].usg}
                        disabled={visit.key !== "t1" && visit.key !== "t3_2"}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], usg: e.target.value } } })}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      >
                        <option value="">Belum</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>

                    {/* Triple Eliminasi - K1 Only */}
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tripel Eliminasi (H/S/H)</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].triple}
                        disabled={!visit.activeFields.triple}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], triple: e.target.value } } })}
                        placeholder={visit.activeFields.triple ? "HIV/Sifilis/Hep B" : "Hanya Kunjungan 1"}
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100 disabled:text-gray-400" 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tata Laksana Kasus &amp; Konseling</label>
                      <input 
                        type="text" 
                        value={formData.anc[visit.key].management}
                        onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], management: e.target.value } } })}
                        placeholder="Rincian obat, resep, atau rujukan"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FISIK & USG */}
        {activeTab === "usg_fisik" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Evaluasi Kesehatan Ibu Hamil &amp; Hasil USG (Halaman 98-99, 104)</h2>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">IMT (Pra Kehamilan)</label>
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
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pemeriksaan Porsio</label>
                  <select 
                    value={formData.usg_fisik.porsio}
                    onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, porsio: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Tidak normal">Tidak normal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Vulva / Vagina / Uretra</label>
                  <input 
                    type="text" 
                    value={`${formData.usg_fisik.vulva || ""}/${formData.usg_fisik.vagina || ""}/${formData.usg_fisik.uretra || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("/");
                      setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, vulva: parts[0] || "", vagina: parts[1] || "", uretra: parts[2] || "" } });
                    }}
                    placeholder="Vulva/Vagina/Uretra"
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

              {/* Riwayat Penyakit & Perilaku */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-base-bg/10 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-base-text-secondary">Riwayat Penyakit Ibu Sekarang</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(formData.usg_fisik.disease_history).map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer font-medium text-base-text-secondary capitalize">
                        <input 
                          type="checkbox"
                          checked={formData.usg_fisik.disease_history[d]}
                          onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, disease_history: { ...formData.usg_fisik.disease_history, [d]: e.target.checked } } })}
                          className="accent-brand-primary w-4 h-4"
                        />
                        <span>{d.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-base-bg/10 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-base-text-secondary">Riwayat Perilaku Berisiko (1 Bln Sebelum Hamil)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(formData.usg_fisik.risk_behavior).map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer font-medium text-base-text-secondary capitalize">
                        <input 
                          type="checkbox"
                          checked={formData.usg_fisik.risk_behavior[r]}
                          onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, risk_behavior: { ...formData.usg_fisik.risk_behavior, [r]: e.target.checked } } })}
                          className="accent-brand-primary w-4 h-4"
                        />
                        <span>{r.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* USG Trimester 1 */}
              <div className="p-4 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-brand-primary block">Hasil USG Trimester I (Kehamilan &lt; 12 Minggu)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Jumlah GS</label>
                    <select 
                      value={formData.usg_fisik.usg_t1.gs}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, gs: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Tunggal">Tunggal</option>
                      <option value="Kembar">Kembar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">GS Diameter (cm)</label>
                    <input 
                      type="number" step="0.01"
                      value={formData.usg_fisik.usg_t1.gs_diameter}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, gs_diameter: e.target.value } } })}
                      placeholder="cm"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">CRL (cm)</label>
                    <input 
                      type="number" step="0.01"
                      value={formData.usg_fisik.usg_t1.crl}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, crl: e.target.value } } })}
                      placeholder="cm"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Letak Kantung / Pulsasi</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t1.location || ""}/${formData.usg_fisik.usg_t1.heart_pulsation || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, location: parts[0] || "", heart_pulsation: parts[1] || "" } } });
                      }}
                      placeholder="Intrauterin/Tampak"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* USG Trimester 3 */}
              <div className="p-4 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-brand-primary block">Hasil USG Trimester III (Kehamilan 32 - 36 Minggu)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Dilakukan USG T3?</label>
                    <select 
                      value={formData.usg_fisik.usg_t3.done}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, done: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Ya">Ya</option>
                      <option value="Tidak">Tidak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">UK berdasar USG T1 / HPHT</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t3.uk_t1 || ""}/${formData.usg_fisik.usg_t3.uk_hpht || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, uk_t1: parts[0] || "", uk_hpht: parts[1] || "" } } });
                      }}
                      placeholder="USG T1 / HPHT"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Presentasi &amp; Letak Janin</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t3.presentation || ""}/${formData.usg_fisik.usg_t3.location || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, presentation: parts[0] || "", location: parts[1] || "" } } });
                      }}
                      placeholder="Kepala/Intrauterin"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Air Ketuban (SDP cm) / Status</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t3.amnion_sdp || ""}/${formData.usg_fisik.usg_t3.amnion_status || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, amnion_sdp: parts[0] || "", amnion_status: parts[1] || "" } } });
                      }}
                      placeholder="cm / Cukup"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">BPD / HC (cm)</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t3.bpd || ""}/${formData.usg_fisik.usg_t3.hc || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, bpd: parts[0] || "", hc: parts[1] || "" } } });
                      }}
                      placeholder="BPD/HC"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">AC / FL (cm)</label>
                    <input 
                      type="text" 
                      value={`${formData.usg_fisik.usg_t3.ac || ""}/${formData.usg_fisik.usg_t3.fl || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, ac: parts[0] || "", fl: parts[1] || "" } } });
                      }}
                      placeholder="AC/FL"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">EFW/TBJ (gram)</label>
                    <input 
                      type="number" 
                      value={formData.usg_fisik.usg_t3.efw}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, efw: e.target.value } } })}
                      placeholder="gram"
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lokasi Plasenta</label>
                    <select 
                      value={formData.usg_fisik.usg_t3.plasenta}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, plasenta: e.target.value } } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Fundus">Fundus</option>
                      <option value="Corpus">Corpus</option>
                      <option value="Letak Rendah">Letak Rendah</option>
                      <option value="Previa">Previa</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: PREEKLAMPSIA & DMG */}
        {activeTab === "preeklampsia_dmg" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Matriks Skrining Preeklampsia (Kehamilan &lt; 20 Minggu) &amp; DMG</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              <div className="bg-status-orange-light/10 border border-status-orange-solid/20 rounded-2xl p-4.5 space-y-3">
                <span className="font-bold text-[10px] uppercase text-status-orange-solid block">Faktor Risiko Sedang (Halaman 102)</span>
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
                            risiko_sedang: { ...formData.preeklampsia_dmg.risiko_sedang, [key]: e.target.checked }
                          }
                        })}
                        className="accent-status-orange-solid w-4.5 h-4.5"
                      />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-status-red-light/10 border border-status-red-solid/20 rounded-2xl p-4.5 space-y-3">
                <span className="font-bold text-[10px] uppercase text-status-red-solid block">Faktor Risiko Tinggi (Halaman 102)</span>
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
                            risiko_tinggi: { ...formData.preeklampsia_dmg.risiko_tinggi, [key]: e.target.checked }
                          }
                        })}
                        className="accent-status-red-solid w-4.5 h-4.5"
                      />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
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
                    <h5 className="font-black text-status-red-solid text-xs">REKOMENDASI RUJUK KE RS/FKRTL (Halaman 102):</h5>
                    <p className="font-semibold text-status-red-solid/90 mt-0.5">Ibu hamil memiliki minimal 2 faktor risiko sedang, 1 faktor risiko tinggi, MAP &gt; 90, atau Proteinuria (+). Wajib dirujuk terencana ke rumah sakit.</p>
                  </div>
                </div>
              )}
            </div>

            {/* DM Gestasional */}
            <div className="p-4 border border-base-border/30 rounded-2xl space-y-3 text-xs">
              <span className="font-bold text-[10px] uppercase text-base-text-secondary">Skrining Diabetes Melitus Gestasional (DMG - Usia Hamil 24-28 Minggu)</span>
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

        {/* TAB 4: RENCANA & RINGKASAN PERSALINAN */}
        {activeTab === "rencana_persalinan" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Rencana Persalinan (Halaman 110-111)</h2>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Perkiraan Bulan / Tahun</label>
                  <input 
                    type="text" 
                    value={`${formData.rencana_persalinan.est_month || ""}/${formData.rencana_persalinan.est_year || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("/");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, est_month: parts[0] || "", est_year: parts[1] || "" } });
                    }}
                    placeholder="Bulan/Tahun"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Fasyankes Utama / Cadangan</label>
                  <input 
                    type="text" 
                    value={`${formData.rencana_persalinan.faskes1 || ""}/${formData.rencana_persalinan.faskes2 || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("/");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, faskes1: parts[0] || "", faskes2: parts[1] || "" } });
                    }}
                    placeholder="Faskes 1/Faskes 2"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Metode Pembiayaan</label>
                  <select 
                    value={formData.rencana_persalinan.finance}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, finance: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="JKN">JKN / BPJS</option>
                    <option value="Jamkesda">Jamkesda</option>
                    <option value="Swasta">Asuransi Swasta</option>
                    <option value="Sendiri">Biaya Sendiri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">KB Pasca Salin dipilih</label>
                  <input 
                    type="text" 
                    value={formData.rencana_persalinan.kb_chosen}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, kb_chosen: e.target.value } })}
                    placeholder="Metode KB"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Kendaraan & Pendonor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Ambulans Desa / Kendaraan</span>
                  <input 
                    type="text" placeholder="Nama Driver 1 - No. HP"
                    value={`${formData.rencana_persalinan.ambulance_driver1 || ""} - ${formData.rencana_persalinan.ambulance_phone1 || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(" - ");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, ambulance_driver1: parts[0] || "", ambulance_phone1: parts[1] || "" } });
                    }}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <input 
                    type="text" placeholder="Nama Driver 2 - No. HP"
                    value={`${formData.rencana_persalinan.ambulance_driver2 || ""} - ${formData.rencana_persalinan.ambulance_phone2 || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(" - ");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, ambulance_driver2: parts[0] || "", ambulance_phone2: parts[1] || "" } });
                    }}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Pendonor Darah Pendukung</span>
                  <input 
                    type="text" placeholder="Pendonor 1 - No. HP"
                    value={`${formData.rencana_persalinan.donor_name1 || ""} - ${formData.rencana_persalinan.donor_phone1 || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(" - ");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, donor_name1: parts[0] || "", donor_phone1: parts[1] || "" } });
                    }}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <input 
                    type="text" placeholder="Pendonor 2 - No. HP"
                    value={`${formData.rencana_persalinan.donor_name2 || ""} - ${formData.rencana_persalinan.donor_phone2 || ""}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(" - ");
                      setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, donor_name2: parts[0] || "", donor_phone2: parts[1] || "" } });
                    }}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Ringkasan Realisasi Persalinan */}
              <div className="p-4 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-brand-primary block border-b pb-1">📄 Ringkasan Pelayanan Proses Melahirkan (Halaman 111)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Melahirkan</label>
                    <input 
                      type="date"
                      value={formData.rencana_persalinan.delivery_date}
                      onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, delivery_date: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pukul</label>
                    <input 
                      type="time"
                      value={formData.rencana_persalinan.delivery_time}
                      onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, delivery_time: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Penolong Persalinan</label>
                    <select
                      value={formData.rencana_persalinan.penolong}
                      onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, penolong: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="SpOG">SpOG (Spesialis)</option>
                      <option value="Dokter">Dokter Umum</option>
                      <option value="Bidan">Bidan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Keadaan Akhir Ibu</label>
                    <select
                      value={formData.rencana_persalinan.keadaan_ibu}
                      onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, keadaan_ibu: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs font-bold"
                    >
                      <option value="Sehat">Sehat</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Meninggal">Meninggal</option>
                    </select>
                  </div>
                </div>

                {/* Asuhan Bayi Baru Lahir */}
                <div className="bg-brand-soft/10 p-3 rounded-xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">Asuhan Bayi Baru Lahir</span>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(formData.rencana_persalinan.baby_asuhan).map(a => (
                      <label key={a} className="flex items-center gap-2 cursor-pointer font-semibold text-base-text-secondary hover:text-base-text-primary capitalize">
                        <input 
                          type="checkbox"
                          checked={formData.rencana_persalinan.baby_asuhan[a]}
                          onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, baby_asuhan: { ...formData.rencana_persalinan.baby_asuhan, [a]: e.target.checked } } })}
                          className="accent-brand-primary w-4.5 h-4.5"
                        />
                        <span>{a.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SKL */}
        {activeTab === "skl" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Surat Keterangan Lahir (SKL - Halaman 112)</h2>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Nomor SKL Resmi</label>
                  <input 
                    type="text" 
                    value={formData.skl.no_skl}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, no_skl: e.target.value } })}
                    placeholder="No. SKL"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Nama Lengkap Bayi</label>
                  <input 
                    type="text" 
                    value={formData.skl.baby_name}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, baby_name: e.target.value } })}
                    placeholder="Nama Anak"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Jenis Kelahiran</label>
                  <select 
                    value={formData.skl.type}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, type: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Tunggal">Tunggal</option>
                    <option value="Kembar 2">Kembar 2</option>
                    <option value="Kembar 3">Kembar 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Anak Ke-</label>
                  <input 
                    type="number" 
                    value={formData.skl.order}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, order: e.target.value } })}
                    placeholder="Anak Ke-"
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
                    value={formData.skl.weight}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, weight: e.target.value } })}
                    placeholder="gram"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Panjang Badan (cm)</label>
                  <input 
                    type="number" 
                    value={formData.skl.height}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, height: e.target.value } })}
                    placeholder="cm"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lingkar Kepala (cm)</label>
                  <input 
                    type="number" 
                    value={formData.skl.head}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, head: e.target.value } })}
                    placeholder="cm"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    value={formData.skl.place}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, place: e.target.value } })}
                    placeholder="Nama RS/Puskesmas"
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Identitas Orang Tua */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] text-brand-primary block">Ibu Kandung</span>
                  <input 
                    type="text" placeholder="Nama Ibu"
                    value={formData.skl.mother_name}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, mother_name: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="number" placeholder="Umur Ibu"
                      value={formData.skl.mother_age}
                      onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, mother_age: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="NIK Ibu"
                      value={formData.skl.mother_nik}
                      onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, mother_nik: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] text-brand-primary block">Ayah Kandung</span>
                  <input 
                    type="text" placeholder="Nama Ayah"
                    value={formData.skl.father_name}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, father_name: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <input 
                      type="number" placeholder="Umur"
                      value={formData.skl.father_age}
                      onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, father_age: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2.5 py-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="NIK"
                      value={formData.skl.father_nik}
                      onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, father_nik: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2.5 py-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="Pekerjaan"
                      value={formData.skl.father_job}
                      onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, father_job: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-2.5 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: NIFAS */}
        {activeTab === "nifas" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Pelayanan Kesehatan Ibu Nifas (KF 1 - KF 4)</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1 text-xs">
              {[
                { key: "kf1", title: "KF 1 (6 - 48 Jam)" },
                { key: "kf2", title: "KF 2 (3 - 7 Hari)" },
                { key: "kf3", title: "KF 3 (8 - 28 Hari)" },
                { key: "kf4", title: "KF 4 (29 - 42 Hari)" }
              ].map((kf) => (
                <div key={kf.key} className="p-4 bg-base-bg/10 rounded-2xl space-y-4 border border-base-border/10">
                  <h3 className="font-bold text-xs text-brand-primary">{kf.title}</h3>
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
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tempat Pemeriksaan</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].place}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], place: e.target.value } } })}
                        placeholder="Faskes/Rumah"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">ASI &amp; Kondisi Payudara</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].breast}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], breast: e.target.value } } })}
                        placeholder="ASI Eksklusif?"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Pemeriksaan Perdarahan</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].bleeding}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], bleeding: e.target.value } } })}
                        placeholder="Jumlah lokhia"
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
                        <span>Kapsul Vit A</span>
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
                        placeholder="Kondisi psikologis"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tata Laksana Kasus / Rujukan</label>
                      <input 
                        type="text" 
                        value={formData.nifas[kf.key].management}
                        onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf.key]: { ...formData.nifas[kf.key], management: e.target.value } } })}
                        placeholder="Rujukan atau terapi nakes"
                        className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Status Akhir */}
              <div className="p-4 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-brand-primary">Status Akhir Masa Nifas (KF 4 - Halaman 116)</span>
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
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Masalah Nifas yang Terjadi</label>
                    <input 
                      type="text" 
                      value={formData.nifas.final_status.problems}
                      onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, final_status: { ...formData.nifas.final_status, problems: e.target.value } } })}
                      placeholder="Perdarahan/Infeksi/Hipertensi/Lainnya"
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
