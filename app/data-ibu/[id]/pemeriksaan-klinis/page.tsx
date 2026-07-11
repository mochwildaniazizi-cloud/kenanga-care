"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaFileMedical, FaUser } from "react-icons/fa";
import { MdArrowBack as MdArrowBackIcon, MdSave as MdSaveIcon, MdCheckCircleOutline as MdCheckIcon, MdClose as MdCloseIcon, MdPregnantWoman as MdPregIcon, MdMedicalServices as MdMedIcon, MdShield as MdShieldIcon, MdBabyChangingStation as MdBabyIcon, MdHome as MdHomeIcon, MdOutlineAssignmentTurnedIn as MdSklIcon, MdEdit as MdEditIcon } from "react-icons/md";
import { getMotherDetail } from "@/app/actions/mothers";

export default function PemeriksaanKlinisIbuPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mother, setMother] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Modal editor states
  const [editingSection, setEditingSection] = useState<"anc" | "usg_fisik" | "preeklampsia_dmg" | "rencana_persalinan" | "skl" | "nifas" | null>(null);

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
      final_status: { mother: "Sehat", baby: "Sehat", problems: "" }
    }
  });

  useEffect(() => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    
    getMotherDetail(decodedId).then(data => {
      if (data) {
        setMother(data);
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

    const saved = localStorage.getItem(`pemeriksaan_klinis_ibu_${decodedId}`);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [id]);

  const handleSaveSection = () => {
    if (!id) return;
    const decodedId = decodeURIComponent(id as string);
    localStorage.setItem(`pemeriksaan_klinis_ibu_${decodedId}`, JSON.stringify(formData));
    setEditingSection(null);
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
  const countSedang = Object.values(formData.preeklampsia_dmg.risiko_sedang || {}).filter(Boolean).length;
  const countTinggi = Object.values(formData.preeklampsia_dmg.risiko_tinggi || {}).filter(Boolean).length;
  const isReferralNeeded = countSedang >= 2 || countTinggi >= 1 || (mapValue !== null && mapValue > 90) || urinCelup !== "Negatif";

  return (
    <div className="min-h-screen bg-base-bg text-base-text-primary p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-base-border/30">
        <div className="flex items-center gap-3">
          <Link href={`/data-ibu/${id}`} className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
            <MdArrowBackIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Dashboard Rekam Medis (Kader Workstation)</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Ibu: <span className="font-bold text-base-text-primary">{mother?.name || "-"}</span> &bull; NIK: <span className="font-semibold text-base-text-primary">{mother?.national_id || "-"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid layout like Mother's page, but with Edit Button per Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: ANC */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdPregIcon className="w-4.5 h-4.5" /> ANC TRIMESTER 1-3
              </span>
              <button 
                onClick={() => setEditingSection("anc")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>📅 K1: <span className="text-base-text-primary">{formData.anc.t1.date || "-"} ({formData.anc.t1.place || "-"})</span></p>
              <p>📅 K2: <span className="text-base-text-primary">{formData.anc.t2_1.date || "-"}</span></p>
              <p>📅 K3: <span className="text-base-text-primary">{formData.anc.t2_2.date || "-"}</span></p>
              <p>📅 K4: <span className="text-base-text-primary">{formData.anc.t3_1.date || "-"}</span></p>
              <p>📅 K5: <span className="text-base-text-primary">{formData.anc.t3_2.date || "-"}</span></p>
              <p>📅 K6: <span className="text-base-text-primary">{formData.anc.t3_3.date || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 2: USG & Fisik */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdMedIcon className="w-4.5 h-4.5" /> USG &amp; FISIK OBSTETRIK
              </span>
              <button 
                onClick={() => setEditingSection("usg_fisik")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>⚖️ IMT: <span className="text-base-text-primary">{formData.usg_fisik.imt || "Normal"}</span></p>
              <p>🍼 Vagina / Porsio: <span className="text-base-text-primary">{formData.usg_fisik.vagina || "Normal"} / {formData.usg_fisik.porsio || "Normal"}</span></p>
              <p>🩺 USG T1: <span className="text-base-text-primary">{formData.usg_fisik.usg_t1.gs || "Tunggal"} ({formData.usg_fisik.usg_t1.crl ? `${formData.usg_fisik.usg_t1.crl} cm` : "-"})</span></p>
              <p>🩺 USG T3: <span className="text-base-text-primary">{formData.usg_fisik.usg_t3.done === "Ya" ? `${formData.usg_fisik.usg_t3.presentation} (${formData.usg_fisik.usg_t3.efw} g)` : "Tidak dilakukan"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 3: Preeklampsia & DMG */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdShieldIcon className="w-4.5 h-4.5" /> PREEKLAMPSIA &amp; DMG
              </span>
              <button 
                onClick={() => setEditingSection("preeklampsia_dmg")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>🩺 Tensi: <span className="text-base-text-primary">{formData.preeklampsia_dmg.sistole || "-"}/{formData.preeklampsia_dmg.diastole || "-"} mmHg</span></p>
              <p>🧪 MAP: <span className={`font-bold ${mapValue && mapValue > 90 ? "text-status-red-solid" : "text-status-green-solid"}`}>{mapValue || "-"} mmHg</span></p>
              <p>🧪 Protein Urine: <span className="text-base-text-primary">{formData.preeklampsia_dmg.urin_celup}</span></p>
              <p>🍬 DMG (GDP/GD2JPP): <span className="text-base-text-primary">{formData.preeklampsia_dmg.dmg.gdp || "-"} / {formData.preeklampsia_dmg.dmg.gd2jpp || "-"} mg/dL</span></p>
            </div>
          </div>
        </div>

        {/* Card 4: Persalinan */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdBabyIcon className="w-4.5 h-4.5" /> RENCANA &amp; RINGKASAN PERSALINAN
              </span>
              <button 
                onClick={() => setEditingSection("rencana_persalinan")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>🏢 Rencana Faskes: <span className="text-base-text-primary">{formData.rencana_persalinan.faskes1 || "-"}</span></p>
              <p>📅 Realisasi Lahir: <span className="text-base-text-primary">{formData.rencana_persalinan.delivery_date || "-"} {formData.rencana_persalinan.delivery_time || ""}</span></p>
              <p>👩‍⚕️ Penolong / Cara: <span className="text-base-text-primary">{formData.rencana_persalinan.penolong || "-"} / {formData.rencana_persalinan.cara || "-"}</span></p>
            </div>
          </div>
        </div>

        {/* Card 5: SKL */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdSklIcon className="w-4.5 h-4.5" /> SURAT KETERANGAN LAHIR (SKL)
              </span>
              <button 
                onClick={() => setEditingSection("skl")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>📄 No. SKL: <span className="text-base-text-primary">{formData.skl.no_skl || "Belum Diterbitkan"}</span></p>
              <p>👶 Nama Bayi: <span className="text-base-text-primary">{formData.skl.baby_name || "-"}</span></p>
              <p>⚖️ Berat / Panjang: <span className="text-base-text-primary">{formData.skl.weight || "-"} g / {formData.skl.height || "-"} cm</span></p>
            </div>
          </div>
        </div>

        {/* Card 6: Nifas */}
        <div className="bg-base-white border border-base-border/30 rounded-[28px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                <MdHomeIcon className="w-4.5 h-4.5" /> PELAYANAN NIFAS (KF 1-4)
              </span>
              <button 
                onClick={() => setEditingSection("nifas")}
                className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-base-white transition cursor-pointer"
              >
                <MdEditIcon className="w-3.5 h-3.5" /> Edit Bagian
              </button>
            </div>
            <div className="mt-3 space-y-2 text-xs font-semibold text-base-text-secondary">
              <p>📅 KF 1: <span className="text-base-text-primary">{formData.nifas.kf1.date || "-"}</span></p>
              <p>📅 KF 2: <span className="text-base-text-primary">{formData.nifas.kf2.date || "-"}</span></p>
              <p>📅 KF 3: <span className="text-base-text-primary">{formData.nifas.kf3.date || "-"}</span></p>
              <p>📅 KF 4: <span className="text-base-text-primary">{formData.nifas.kf4.date || "-"}</span></p>
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
                <MdCloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Form rendering depending on editingSection */}
            {editingSection === "anc" && (
              <div className="space-y-6 text-xs max-h-[50vh] overflow-y-auto pr-1">
                {[
                  { key: "t1", title: "Trimester I (Kunjungan 1)", activeFields: { height: true, lila: true, screening: true, goldar: true, triple: true } },
                  { key: "t2_1", title: "Trimester II (Kunjungan 2)", activeFields: {} },
                  { key: "t2_2", title: "Trimester II (Kunjungan 3)", activeFields: {} },
                  { key: "t3_1", title: "Trimester III (Kunjungan 4)", activeFields: {} },
                  { key: "t3_2", title: "Trimester III (Kunjungan 5)", activeFields: { screening: true, usg: true } },
                  { key: "t3_3", title: "Trimester III (Kunjungan 6)", activeFields: { hb: true, protein: true, sugar: true } }
                ].map((visit) => (
                  <div key={visit.key} className="p-4 bg-base-bg/10 rounded-2xl space-y-4 border border-base-border/10">
                    <h4 className="font-bold text-xs text-brand-primary">{visit.title}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                          placeholder="Faskes"
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
                      <div>
                        <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Badan (cm)</label>
                        <input 
                          type="number" 
                          value={formData.anc[visit.key].height}
                          disabled={!visit.activeFields.height}
                          onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], height: e.target.value } } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">LiLA (cm)</label>
                        <input 
                          type="number" 
                          value={formData.anc[visit.key].lila}
                          disabled={!visit.activeFields.lila}
                          onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], lila: e.target.value } } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs disabled:bg-gray-100" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tekanan Darah</label>
                        <input 
                          type="text" 
                          value={formData.anc[visit.key].bp}
                          onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], bp: e.target.value } } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">TFU (cm)</label>
                        <input 
                          type="number" 
                          value={formData.anc[visit.key].tfu}
                          onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], tfu: e.target.value } } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">DJJ</label>
                        <input 
                          type="text" 
                          value={formData.anc[visit.key].djj}
                          onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, [visit.key]: { ...formData.anc[visit.key], djj: e.target.value } } })}
                          className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {editingSection === "usg_fisik" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">IMT</label>
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
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Porsio &amp; Uretra</label>
                    <input 
                      type="text"
                      value={`${formData.usg_fisik.porsio || ""}/${formData.usg_fisik.uretra || ""}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("/");
                        setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, porsio: parts[0] || "", uretra: parts[1] || "" } });
                      }}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 bg-base-bg/10 rounded-2xl space-y-2">
                  <span className="font-bold text-[10px] uppercase text-brand-primary block">USG Trimester 1</span>
                  <div className="grid grid-cols-3 gap-3">
                    <input 
                      type="text" placeholder="Kantung GS"
                      value={formData.usg_fisik.usg_t1.gs}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, gs: e.target.value } } })}
                      className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="GS Diameter"
                      value={formData.usg_fisik.usg_t1.gs_diameter}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, gs_diameter: e.target.value } } })}
                      className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                    />
                    <input 
                      type="text" placeholder="CRL"
                      value={formData.usg_fisik.usg_t1.crl}
                      onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, crl: e.target.value } } })}
                      className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {editingSection === "preeklampsia_dmg" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Sistole</label>
                    <input 
                      type="number"
                      value={formData.preeklampsia_dmg.sistole}
                      onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, sistole: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Diastole</label>
                    <input 
                      type="number"
                      value={formData.preeklampsia_dmg.diastole}
                      onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, diastole: e.target.value } })}
                      className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Protein Urine Celup</label>
                  <select 
                    value={formData.preeklampsia_dmg.urin_celup}
                    onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, urin_celup: e.target.value } })}
                    className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Negatif">Negatif (-)</option>
                    <option value="+1">+1</option>
                    <option value="+2">+2</option>
                    <option value="+3">+3</option>
                    <option value="+4">+4</option>
                  </select>
                </div>
              </div>
            )}

            {editingSection === "rencana_persalinan" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Fasyankes 1"
                    value={formData.rencana_persalinan.faskes1}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, faskes1: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2.5 text-xs"
                  />
                  <input 
                    type="text" placeholder="Metode KB dipilih"
                    value={formData.rencana_persalinan.kb_chosen}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, kb_chosen: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="date" placeholder="Tanggal Realisasi"
                    value={formData.rencana_persalinan.delivery_date}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, delivery_date: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                  <input 
                    type="time" placeholder="Pukul"
                    value={formData.rencana_persalinan.delivery_time}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, delivery_time: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                  <input 
                    type="text" placeholder="Penolong"
                    value={formData.rencana_persalinan.penolong}
                    onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, penolong: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>
            )}

            {editingSection === "skl" && (
              <div className="space-y-4 text-xs">
                <input 
                  type="text" placeholder="Nomor SKL Resmi"
                  value={formData.skl.no_skl}
                  onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, no_skl: e.target.value } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl p-2.5 text-xs"
                />
                <input 
                  type="text" placeholder="Nama Lengkap Bayi"
                  value={formData.skl.baby_name}
                  onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, baby_name: e.target.value } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl p-2.5 text-xs"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="number" placeholder="Berat (gram)"
                    value={formData.skl.weight}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, weight: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                  <input 
                    type="number" placeholder="Panjang (cm)"
                    value={formData.skl.height}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, height: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                  <input 
                    type="number" placeholder="Lingkar Kepala"
                    value={formData.skl.head}
                    onChange={(e) => setFormData({ ...formData, skl: { ...formData.skl, head: e.target.value } })}
                    className="bg-base-white border border-base-border/40 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>
            )}

            {editingSection === "nifas" && (
              <div className="space-y-4 text-xs">
                {[
                  { key: "kf1", title: "KF 1" },
                  { key: "kf2", title: "KF 2" },
                  { key: "kf3", title: "KF 3" },
                  { key: "kf4", title: "KF 4" }
                ].map((kf) => (
                  <div key={kf.key} className="p-3 bg-base-bg/10 rounded-xl space-y-2">
                    <span className="font-bold text-[10px] text-brand-primary">{kf.title}</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input 
                        type="date"
                        value={formData.nifas[kf.key].date}
                        onChange={(e) => setFormData({
                          ...formData,
                          nifas: {
                            ...formData.nifas,
                            [kf.key]: { ...formData.nifas[kf.key], date: e.target.value }
                          }
                        })}
                        className="bg-base-white border border-base-border/40 rounded-lg p-1.5 text-[10px]"
                      />
                      <input 
                        type="text" placeholder="Tempat"
                        value={formData.nifas[kf.key].place}
                        onChange={(e) => setFormData({
                          ...formData,
                          nifas: {
                            ...formData.nifas,
                            [kf.key]: { ...formData.nifas[kf.key], place: e.target.value }
                          }
                        })}
                        className="bg-base-white border border-base-border/40 rounded-lg p-1.5 text-[10px]"
                      />
                      <input 
                        type="text" placeholder="ASI"
                        value={formData.nifas[kf.key].breast}
                        onChange={(e) => setFormData({
                          ...formData,
                          nifas: {
                            ...formData.nifas,
                            [kf.key]: { ...formData.nifas[kf.key], breast: e.target.value }
                          }
                        })}
                        className="bg-base-white border border-base-border/40 rounded-lg p-1.5 text-[10px]"
                      />
                    </div>
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
                <MdSaveIcon className="w-4 h-4" /> Simpan Bagian
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
              <MdCheckIcon className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-base-text-primary">Data Berhasil Disimpan</h4>
            <p className="text-[11px] text-base-text-secondary leading-relaxed font-semibold">Rekam medis bagian ini telah berhasil diperbarui dan disimpan.</p>
          </div>
        </div>
      )}

    </div>
  );
}
