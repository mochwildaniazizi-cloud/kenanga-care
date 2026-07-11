"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdPregnantWoman, MdMedicalServices, MdShield, MdBabyChangingStation, MdHome, MdInfo, MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { getLoggedInMotherDetail } from "@/app/actions/mothers";
import { useUserRole } from "@/context/UserRoleContext";

export default function RekamMedisIbuPage() {
  const router = useRouter();
  const { username } = useUserRole();
  const [mother, setMother] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"anc" | "usg_fisik" | "preeklampsia_dmg" | "rencana_persalinan" | "skl" | "nifas">("anc");
  
  // Default structure
  const [formData, setFormData] = useState<any>({
    anc: {
      t1: {}, t2_1: {}, t2_2: {}, t3_1: {}, t3_2: {}, t3_3: {}
    },
    usg_fisik: {
      imt: "Normal", vagina: "", uretra: "", vulva: "", porsio: "", fluksus: "Tidak", fluor: "Tidak",
      disease_history: {}, risk_behavior: {}, family_disease: {},
      prev_pregnancy: [], usg_t1: {}, usg_t3: {}
    },
    preeklampsia_dmg: {
      risiko_sedang: {}, risiko_tinggi: {}, sistole: "", diastole: "", urin_celup: "Negatif", dmg: {}
    },
    rencana_persalinan: {
      client_name: "", client_address: "", helper_name: "", est_month: "", est_year: "",
      faskes1: "", faskes2: "", finance: "JKN",
      ambulance_driver1: "", ambulance_phone1: "", ambulance_driver2: "", ambulance_phone2: "",
      kb_chosen: "", donor_name1: "", donor_phone1: "", donor_name2: "", donor_phone2: "",
      delivery_date: "", delivery_time: "", gestation_age: "", order: "", penolong: "Bidan", cara: "Normal", keadaan_ibu: "Sehat", kb_postpartum: "",
      baby_gender: "Laki-laki", baby_weight: "", baby_height: "", baby_head: "", baby_status: "Segera menangis", baby_asuhan: {}
    },
    skl: {
      no_skl: "", day: "", date: "", time: "", gender: "Laki-laki", type: "Tunggal", order: "", gestation: "", weight: "", height: "", head: "", place: "Puskesmas", place_address: "", baby_name: "",
      mother_name: "", mother_age: "", mother_nik: "", father_name: "", father_age: "", father_nik: "", father_job: "",
      address: "", rtrw: "", kec: "", kota: "", saksi1: "", saksi2: "", penolong_nakes: ""
    },
    nifas: {
      kf1: {}, kf2: {}, kf3: {}, kf4: {},
      checks_kf1: {}, checks_kf2: {}, checks_kf3: {}, checks_kf4: {},
      final_status: {}
    }
  });

  useEffect(() => {
    if (!username) return;
    // Load logged-in mother
    getLoggedInMotherDetail(username).then(data => {
      if (data) {
        setMother(data);
        const saved = localStorage.getItem(`pemeriksaan_klinis_ibu_${data.mother_id}`);
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
  }, [username]);

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
      <div className="flex items-center gap-3 border-b pb-4 border-base-border/30">
        <Link href="/perjalanan-ibu" className="p-2 border border-base-border/50 text-base-text-secondary hover:text-brand-primary hover:border-brand-primary rounded-xl transition bg-base-white shadow-sm flex items-center justify-center cursor-pointer">
          <MdArrowBack className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-brand-primary uppercase tracking-wider">Rekam Medis (EHR) Ibu</h1>
          <p className="text-xs text-base-text-secondary font-medium">
            Nama Ibu: <span className="font-bold text-base-text-primary">{mother?.mother_name || "-"}</span> &bull; Status: <span className="font-bold text-status-green-solid">Read-Only EHR</span>
          </p>
        </div>
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

      {/* Main EHR view - Bento Grid style */}
      <div className="bg-base-white border border-base-border/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* TAB 1: ANC */}
        {activeTab === "anc" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Riwayat Pemeriksaan ANC (Antenatal Care)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "t1", title: "Trimester I (Kunjungan 1)" },
                { key: "t2_1", title: "Trimester II (Kunjungan 2)" },
                { key: "t2_2", title: "Trimester II (Kunjungan 3)" },
                { key: "t3_1", title: "Trimester III (Kunjungan 4)" },
                { key: "t3_2", title: "Trimester III (Kunjungan 5)" },
                { key: "t3_3", title: "Trimester III (Kunjungan 6)" }
              ].map((visit) => {
                const data = formData.anc[visit.key] || {};
                return (
                  <div key={visit.key} className="bg-base-bg/25 border border-base-border/10 rounded-2xl p-4.5 space-y-3 text-xs">
                    <span className="font-bold text-xs text-brand-primary block">{visit.title}</span>
                    <div className="space-y-1.5 font-medium text-base-text-secondary">
                      <p>📅 Tanggal: <span className="font-bold text-base-text-primary">{data.date || "-"}</span></p>
                      <p>📍 Tempat: <span className="font-bold text-base-text-primary">{data.place || "-"}</span></p>
                      <p>⚖️ Berat Badan: <span className="font-bold text-base-text-primary">{data.weight ? `${data.weight} kg` : "-"}</span></p>
                      {data.height && <p>📏 Tinggi Badan: <span className="font-bold text-base-text-primary">{data.height} cm</span></p>}
                      {data.lila && <p>💪 LiLA: <span className="font-bold text-base-text-primary">{data.lila} cm</span></p>}
                      <p>🩺 Tensi: <span className="font-bold text-brand-primary">{data.bp || "-"} mmHg</span></p>
                      <p>👶 TFU / DJJ: <span className="font-bold text-base-text-primary">{data.tfu ? `${data.tfu} cm` : "-"} / {data.djj || "-"}</span></p>
                      <p>💉 Imunisasi TT: <span className="font-bold text-base-text-primary">{data.tt || "Belum"}</span></p>
                      <p>💊 Pil TTD: <span className="font-bold text-base-text-primary">{data.pills || "-"}</span></p>
                      {data.hb && <p>🧬 Lab (Hb): <span className="font-bold text-base-text-primary">{data.hb} g/dL</span></p>}
                      {data.protein && <p>🧪 Protein Urin: <span className="font-bold text-base-text-primary">{data.protein}</span></p>}
                      {data.sugar && <p>🍬 Gula Darah: <span className="font-bold text-base-text-primary">{data.sugar} mg/dL</span></p>}
                      <p>📋 Rujukan/Tatalaksana: <span className="font-bold text-base-text-primary italic">{data.management || "-"}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FISIK & USG */}
        {activeTab === "usg_fisik" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Evaluasi Pemeriksaan Fisik &amp; Obstetrik</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Status Fisik</span>
                <p className="text-sm font-bold">IMT: <span className="text-brand-primary">{formData.usg_fisik.imt || "Normal"}</span></p>
                <p>Porsio &amp; Uretra: <span className="text-base-text-primary">{formData.usg_fisik.porsio || "Normal"} / {formData.usg_fisik.uretra || "Normal"}</span></p>
                <p>Vulva &amp; Vagina: <span className="text-base-text-primary">{formData.usg_fisik.vulva || "Normal"} / {formData.usg_fisik.vagina || "Normal"}</span></p>
                <p>Fluksus / Fluor: <span className="text-base-text-primary">{formData.usg_fisik.fluksus || "Tidak"} / {formData.usg_fisik.fluor || "Tidak"}</span></p>
              </div>

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Skrining &amp; Persalinan</span>
                <p>Skrining Jiwa Nakes: <span className="text-base-text-primary italic">{formData.usg_fisik.mental_screening || "-"}</span></p>
                <p>Rencana Persalinan: <span className="text-brand-primary">{formData.usg_fisik.delivery_plan || "Normal"}</span></p>
              </div>

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Riwayat Keluarga &amp; Penyakit</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(formData.usg_fisik.disease_history || {}).filter(k => formData.usg_fisik.disease_history[k]).map(k => (
                    <span key={k} className="px-2 py-0.5 bg-status-red-light text-status-red-solid border border-status-red-solid/20 rounded-full text-[9px] capitalize">{k.replace(/_/g, " ")}</span>
                  ))}
                  {Object.keys(formData.usg_fisik.disease_history || {}).filter(k => formData.usg_fisik.disease_history[k]).length === 0 && (
                    <span className="text-status-green-solid">Tidak ada riwayat penyakit</span>
                  )}
                </div>
              </div>
            </div>

            {/* USG Trimester 1 */}
            <div className="p-5 border border-base-border/30 rounded-2xl space-y-4">
              <span className="font-bold text-[10px] uppercase text-brand-primary block">Hasil USG Trimester I</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium">
                <p>Kantung GS: <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg_t1.gs || "Tunggal"} ({formData.usg_fisik.usg_t1.location || "Intrauterin"})</span></p>
                <p>Diameter GS: <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg_t1.gs_diameter || "-"} cm</span></p>
                <p>CRL: <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg_t1.crl || "-"} cm</span></p>
                <p>Pulsasi Jantung: <span className="font-bold text-status-green-solid">{formData.usg_fisik.usg_t1.heart_pulsation || "Ya"}</span></p>
              </div>
            </div>

            {/* USG Trimester 3 */}
            {formData.usg_fisik.usg_t3.done === "Ya" && (
              <div className="p-5 border border-base-border/30 rounded-2xl space-y-4">
                <span className="font-bold text-[10px] uppercase text-brand-primary block">Hasil USG Trimester III</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <p>Presentasi / Letak: <span className="text-base-text-primary">{formData.usg_fisik.usg_t3.presentation || "Kepala"} / {formData.usg_fisik.usg_t3.location || "Intrauterin"}</span></p>
                  <p>Jumlah Fetus: <span className="text-base-text-primary">{formData.usg_fisik.usg_t3.count || "Tunggal"} ({formData.usg_fisik.usg_t3.status || "Hidup"})</span></p>
                  <p>Air Ketuban (SDP): <span className="text-base-text-primary">{formData.usg_fisik.usg_t3.amnion_sdp || "-"} cm ({formData.usg_fisik.usg_t3.amnion_status || "Cukup"})</span></p>
                  <p>Estimasi Berat (EFW): <span className="text-brand-primary">{formData.usg_fisik.usg_t3.efw || "-"} gram</span></p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: PREEKLAMPSIA & DMG */}
        {activeTab === "preeklampsia_dmg" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Matriks Skrining Preeklampsia &amp; DM Gestasional</h2>
            
            {isReferralNeeded && (
              <div className="p-4 bg-status-red-light/20 border border-status-red-solid/25 rounded-xl text-xs text-status-red-solid font-bold leading-relaxed flex gap-2.5 items-start shadow-xs">
                <span className="text-lg">🚨</span>
                <div>
                  <h5 className="font-black text-status-red-solid text-xs">REKOMENDASI RUJUK KE RS/FKRTL (Halaman 102):</h5>
                  <p className="font-semibold text-status-red-solid/90 mt-0.5">Memenuhi faktor risiko preeklampsia atau urin protein positif. Segera konsultasikan ke RS untuk melahirkan.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Hasil Pemeriksaan Klinis</span>
                <p>Mean Arterial Pressure (MAP): <span className={`font-black ${mapValue && mapValue > 90 ? "text-status-red-solid" : "text-status-green-solid"}`}>{mapValue || "-"} mmHg</span></p>
                <p>Tekanan Darah: <span className="text-base-text-primary">{formData.preeklampsia_dmg.sistole || "-"}/{formData.preeklampsia_dmg.diastole || "-"} mmHg</span></p>
                <p>Protein Urine Celup: <span className="text-base-text-primary">{formData.preeklampsia_dmg.urin_celup || "-"}</span></p>
              </div>

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">DM Gestasional (DMG)</span>
                <p>Gula Darah Puasa (GDP): <span className="text-base-text-primary">{formData.preeklampsia_dmg.dmg.gdp ? `${formData.preeklampsia_dmg.dmg.gdp} mg/dL` : "-"}</span></p>
                <p>GD 2 Jam Post Prandial: <span className="text-base-text-primary">{formData.preeklampsia_dmg.dmg.gd2jpp ? `${formData.preeklampsia_dmg.dmg.gd2jpp} mg/dL` : "-"}</span></p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PERSALINAN */}
        {activeTab === "rencana_persalinan" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Rencana &amp; Ringkasan Proses Melahirkan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase block">Rencana Awal</span>
                <p>Fasyankes Utama: <span className="text-base-text-primary">{formData.rencana_persalinan.faskes1 || "-"}</span></p>
                <p>Pembiayaan: <span className="text-base-text-primary">{formData.rencana_persalinan.finance || "-"}</span></p>
                <p>KB pasca melahirkan dipilih: <span className="text-base-text-primary">{formData.rencana_persalinan.kb_chosen || "-"}</span></p>
              </div>

              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase block">Ringkasan Persalinan (Realisasi)</span>
                <p>Waktu Melahirkan: <span className="text-base-text-primary">{formData.rencana_persalinan.delivery_date || "-"} {formData.rencana_persalinan.delivery_time || ""}</span></p>
                <p>Penolong / Cara: <span className="text-base-text-primary">{formData.rencana_persalinan.penolong || "-"} / {formData.rencana_persalinan.cara || "-"}</span></p>
                <p>Keadaan Ibu / Bayi: <span className="text-status-green-solid">{formData.rencana_persalinan.keadaan_ibu || "-"}</span> / <span className="text-base-text-primary">{formData.rencana_persalinan.baby_gender || "-"} ({formData.rencana_persalinan.baby_weight || "-"} g)</span></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SKL */}
        {activeTab === "skl" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Surat Keterangan Lahir (SKL) Resmi</h2>
            <div className="p-5 border border-base-border/30 rounded-2xl space-y-4 text-xs font-semibold">
              <p className="text-brand-primary font-bold">No. SKL: {formData.skl.no_skl || "Belum Diterbitkan"}</p>
              <div className="grid grid-cols-2 gap-4">
                <p>Nama Lengkap Bayi: <span className="text-base-text-primary">{formData.skl.baby_name || "-"}</span></p>
                <p>Jenis Kelamin / Lahir: <span className="text-base-text-primary">{formData.skl.gender || "-"} / {formData.skl.type || "-"}</span></p>
                <p>Antropometri Lahir: <span className="text-base-text-primary">{formData.skl.weight || "-"} g, {formData.skl.height || "-"} cm, LK {formData.skl.head || "-"} cm</span></p>
                <p>Tempat Lahir: <span className="text-base-text-primary">{formData.skl.place || "-"}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: NIFAS */}
        {activeTab === "nifas" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Ringkasan Pelayanan Nifas (KF 1 - KF 4)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {[
                { key: "kf1", title: "KF 1 (6 - 48 Jam)" },
                { key: "kf2", title: "KF 2 (3 - 7 Hari)" },
                { key: "kf3", title: "KF 3 (8 - 28 Hari)" },
                { key: "kf4", title: "KF 4 (29 - 42 Hari)" }
              ].map((kf) => {
                const data = formData.nifas[kf.key] || {};
                return (
                  <div key={kf.key} className="bg-base-bg/10 p-4 rounded-2xl space-y-1.5">
                    <span className="font-bold text-brand-primary block">{kf.title}</span>
                    <p>📅 Periksa: <span className="text-base-text-primary">{data.date || "-"} ({data.place || "-"})</span></p>
                    <p>🍼 Payudara / ASI: <span className="text-base-text-primary">{data.breast || "-"}</span></p>
                    <p>🩸 Perdarahan / Jalan Lahir: <span className="text-base-text-primary">{data.bleeding || "-"} / {data.tear || "-"}</span></p>
                    <p>💊 Vit A / KB: <span className="text-base-text-primary">{data.vit_a ? "Diberikan" : "Tidak"} / {data.kb ? "Diberikan" : "Tidak"}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
