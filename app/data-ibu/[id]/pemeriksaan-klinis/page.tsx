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
  const countSedang = Object.values(formData.preeklampsia_dmg.risiko_sedang || {}).filter(Boolean).length;
  const countTinggi = Object.values(formData.preeklampsia_dmg.risiko_tinggi || {}).filter(Boolean).length;
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
            <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Pemeriksaan &amp; Pencatatan Klinis Ibu</h1>
            <p className="text-xs text-base-text-secondary font-medium">
              Nama Ibu: <span className="font-bold text-base-text-primary">{mother?.name || "-"}</span> &bull; NIK: <span className="font-semibold text-base-text-primary">{mother?.national_id || "-"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-base-white border border-base-border/30 p-1 rounded-2xl gap-1 text-[11px] font-bold overflow-x-auto no-scrollbar shadow-xs">
        {[
          { id: "anc", label: "ANC Trimester 1-3", icon: <MdPregnantWoman className="w-4 h-4" /> },
          { id: "usg_fisik", label: "Pemeriksaan Fisik & USG", icon: <MdMedicalServices className="w-4 h-4" /> },
          { id: "preeklampsia_dmg", label: "Skrining Preeklampsia & DMG", icon: <MdShield className="w-4 h-4" /> },
          { id: "persalinan", label: "Rencana & Ringkasan Persalinan", icon: <MdBabyChangingStation className="w-4 h-4" /> },
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

      {/* TAB CONTENT: SEPARATE CARDS PER SECTION */}
      
      {/* 1. ANC TRIMESTER TABS */}
      {activeTab === "anc" && (
        <div className="space-y-6">
          
          {/* Card ANC Trimester 1 */}
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Trimester I (Kunjungan 1)</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Trimester I
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tanggal Periksa</label>
                <input 
                  type="date" 
                  value={formData.anc.t1.date}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, date: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tempat Periksa</label>
                <input 
                  type="text" 
                  value={formData.anc.t1.place}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, place: e.target.value } } })}
                  placeholder="Faskes"
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Berat Badan (kg)</label>
                <input 
                  type="number" 
                  value={formData.anc.t1.weight}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, weight: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tinggi Badan (cm)</label>
                <input 
                  type="number" 
                  value={formData.anc.t1.height}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, height: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">LiLA (cm)</label>
                <input 
                  type="number" 
                  value={formData.anc.t1.lila}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, lila: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Tekanan Darah</label>
                <input 
                  type="text" 
                  value={formData.anc.t1.bp}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, bp: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Lab Golongan Darah</label>
                <input 
                  type="text" 
                  value={formData.anc.t1.goldar}
                  onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t1: { ...formData.anc.t1, goldar: e.target.value } } })}
                  className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2 text-xs" 
                />
              </div>
            </div>
          </div>

          {/* Card ANC Trimester 2 */}
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Trimester II (Kunjungan 2 &amp; 3)</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Trimester II
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Kunjungan 2 */}
              <div className="space-y-3 bg-base-bg/10 p-4 rounded-2xl">
                <span className="font-bold text-[10px] text-brand-primary block">Kunjungan ke-2</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.anc.t2_1.date} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_1: { ...formData.anc.t2_1, date: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tempat" value={formData.anc.t2_1.place} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_1: { ...formData.anc.t2_1, place: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="BB (kg)" value={formData.anc.t2_1.weight} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_1: { ...formData.anc.t2_1, weight: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tensi" value={formData.anc.t2_1.bp} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_1: { ...formData.anc.t2_1, bp: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>

              {/* Kunjungan 3 */}
              <div className="space-y-3 bg-base-bg/10 p-4 rounded-2xl">
                <span className="font-bold text-[10px] text-brand-primary block">Kunjungan ke-3</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.anc.t2_2.date} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_2: { ...formData.anc.t2_2, date: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tempat" value={formData.anc.t2_2.place} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_2: { ...formData.anc.t2_2, place: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="BB (kg)" value={formData.anc.t2_2.weight} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_2: { ...formData.anc.t2_2, weight: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tensi" value={formData.anc.t2_2.bp} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t2_2: { ...formData.anc.t2_2, bp: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>
            </div>
          </div>

          {/* Card ANC Trimester 3 */}
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Trimester III (Kunjungan 4, 5 &amp; 6)</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Trimester III
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Kunjungan 4 */}
              <div className="space-y-3 bg-base-bg/10 p-4 rounded-2xl">
                <span className="font-bold text-[10px] text-brand-primary block">Kunjungan ke-4</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.anc.t3_1.date} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_1: { ...formData.anc.t3_1, date: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="BB (kg)" value={formData.anc.t3_1.weight} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_1: { ...formData.anc.t3_1, weight: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tensi" value={formData.anc.t3_1.bp} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_1: { ...formData.anc.t3_1, bp: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>

              {/* Kunjungan 5 */}
              <div className="space-y-3 bg-base-bg/10 p-4 rounded-2xl">
                <span className="font-bold text-[10px] text-brand-primary block">Kunjungan ke-5</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.anc.t3_2.date} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_2: { ...formData.anc.t3_2, date: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="BB (kg)" value={formData.anc.t3_2.weight} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_2: { ...formData.anc.t3_2, weight: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tensi" value={formData.anc.t3_2.bp} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_2: { ...formData.anc.t3_2, bp: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>

              {/* Kunjungan 6 */}
              <div className="space-y-3 bg-base-bg/10 p-4 rounded-2xl">
                <span className="font-bold text-[10px] text-brand-primary block">Kunjungan ke-6</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={formData.anc.t3_3.date} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_3: { ...formData.anc.t3_3, date: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="BB (kg)" value={formData.anc.t3_3.weight} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_3: { ...formData.anc.t3_3, weight: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="text" placeholder="Tensi" value={formData.anc.t3_3.bp} onChange={(e) => setFormData({ ...formData, anc: { ...formData.anc, t3_3: { ...formData.anc.t3_3, bp: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. PEMERIKSAAN FISIK & USG */}
      {activeTab === "usg_fisik" && (
        <div className="space-y-6">
          
          {/* Card Pemeriksaan Fisik */}
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Pemeriksaan Fisik Obstetrik</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Fisik
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">IMT</label>
                <select value={formData.usg_fisik.imt} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, imt: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2">
                  <option value="Kurus">Kurus</option>
                  <option value="Normal">Normal</option>
                  <option value="Gemuk">Gemuk</option>
                  <option value="Obesitas">Obesitas</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Porsio</label>
                <input type="text" value={formData.usg_fisik.porsio} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, porsio: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary uppercase mb-1">Vagina</label>
                <input type="text" value={formData.usg_fisik.vagina} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, vagina: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Fluksus</label>
                  <select value={formData.usg_fisik.fluksus} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, fluksus: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl p-2"><option value="Tidak">Tidak</option><option value="Ya">Ya</option></select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Fluor</label>
                  <select value={formData.usg_fisik.fluor} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, fluor: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl p-2"><option value="Tidak">Tidak</option><option value="Ya">Ya</option></select>
                </div>
              </div>
            </div>
          </div>

          {/* Card USG Trimester 1 & 3 */}
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Ultrasonografi (USG) Obstetrik</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan USG
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] text-brand-primary block">USG Trimester I</span>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Jumlah GS" value={formData.usg_fisik.usg_t1.gs} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, gs: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                  <input type="number" placeholder="CRL (cm)" value={formData.usg_fisik.usg_t1.crl} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t1: { ...formData.usg_fisik.usg_t1, crl: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>

              <div className="p-4 bg-base-bg/10 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] text-brand-primary block">USG Trimester III</span>
                <div className="grid grid-cols-2 gap-3">
                  <select value={formData.usg_fisik.usg_t3.done} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, done: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2">
                    <option value="Tidak">Tidak dilakukan</option>
                    <option value="Ya">Ya dilakukan</option>
                  </select>
                  <input type="number" placeholder="EFW (gram)" value={formData.usg_fisik.usg_t3.efw} onChange={(e) => setFormData({ ...formData, usg_fisik: { ...formData.usg_fisik, usg_t3: { ...formData.usg_fisik.usg_t3, efw: e.target.value } } })} className="bg-base-white border border-base-border/40 rounded-xl p-2" />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. SKRINING PREEKLAMPSIA & DMG */}
      {activeTab === "preeklampsia_dmg" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Skrining Preeklampsia &amp; DM Gestasional</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Skrining
              </button>
            </div>

            {isReferralNeeded && (
              <div className="p-4 bg-status-red-light/20 border border-status-red-solid/25 rounded-xl text-xs text-status-red-solid font-bold leading-relaxed flex gap-2.5 items-start">
                <span>🚨</span>
                <div>
                  <h5 className="font-black text-xs">Rekomendasi Rujuk ke FKRTL / RS:</h5>
                  <p className="font-semibold text-status-red-solid/90 mt-0.5">Ditemukan faktor risiko preeklampsia atau nilai MAP &gt; 90 / Protein urine celup positif.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Sistole (mmHg)</label>
                <input type="number" value={formData.preeklampsia_dmg.sistole} onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, sistole: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Diastole (mmHg)</label>
                <input type="number" value={formData.preeklampsia_dmg.diastole} onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, diastole: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Protein Urine</label>
                <select value={formData.preeklampsia_dmg.urin_celup} onChange={(e) => setFormData({ ...formData, preeklampsia_dmg: { ...formData.preeklampsia_dmg, urin_celup: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl p-2">
                  <option value="Negatif">Negatif</option>
                  <option value="+1">+1</option>
                  <option value="+2">+2</option>
                  <option value="+3">+3</option>
                  <option value="+4">+4</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RENCANA & RINGKASAN PERSALINAN */}
      {activeTab === "persalinan" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Rencana &amp; Ringkasan Persalinan</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Persalinan
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Rencana Faskes</label>
                <input type="text" value={formData.rencana_persalinan.faskes1} onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, faskes1: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Tanggal Melahirkan</label>
                <input type="date" value={formData.rencana_persalinan.delivery_date} onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, delivery_date: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-base-text-secondary mb-1">Penolong Persalinan</label>
                <input type="text" value={formData.rencana_persalinan.penolong} onChange={(e) => setFormData({ ...formData, rencana_persalinan: { ...formData.rencana_persalinan, penolong: e.target.value } })} className="w-full bg-base-white border border-base-border/40 rounded-xl px-3 py-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. NIFAS (KF) */}
      {activeTab === "nifas" && (
        <div className="space-y-6">
          <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-sm text-brand-primary uppercase">Pelayanan Nifas (KF 1 - 4)</h3>
              <button onClick={handleSave} className="flex items-center gap-1.5 bg-brand-primary text-base-white px-4 py-1.5 rounded-xl font-bold hover:bg-brand-dark transition shadow-xs text-[10px] cursor-pointer">
                <MdSave className="w-4 h-4" /> Simpan Nifas
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {["kf1", "kf2", "kf3", "kf4"].map((kf) => (
                <div key={kf} className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-xs uppercase text-brand-primary">{kf.toUpperCase()}</span>
                  <input type="date" value={formData.nifas[kf].date} onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf]: { ...formData.nifas[kf], date: e.target.value } } })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-2" />
                  <input type="text" placeholder="Tempat" value={formData.nifas[kf].place} onChange={(e) => setFormData({ ...formData, nifas: { ...formData.nifas, [kf]: { ...formData.nifas[kf], place: e.target.value } } })} className="w-full bg-base-white border border-base-border/40 rounded-lg p-2" />
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
