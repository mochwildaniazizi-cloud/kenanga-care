"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdPregnantWoman, MdMedicalServices, MdShield, MdBabyChangingStation, MdHome, MdInfo } from "react-icons/md";
import { getLoggedInMotherDetail } from "@/app/actions/mothers";
import { useUserRole } from "@/context/UserRoleContext";

export default function RekamMedisIbuPage() {
  const router = useRouter();
  const { username } = useUserRole();
  const [mother, setMother] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"anc" | "usg_fisik" | "preeklampsia_dmg" | "persalinan" | "nifas">("anc");
  
  // Default structure
  const [formData, setFormData] = useState<any>({
    anc: {
      t1: {}, t2_1: {}, t2_2: {}, t3_1: {}, t3_2: {}, t3_3: {}
    },
    usg_fisik: {
      imt: "Normal",
      vagina: "",
      fluksus: "Tidak",
      fluor: "Tidak",
      disease_history: {},
      prev_pregnancy: [],
      usg: {}
    },
    preeklampsia_dmg: {
      risiko_sedang: {},
      risiko_tinggi: {},
      sistole: "",
      diastole: "",
      urin_celup: "Negatif",
      dmg: {}
    },
    persalinan: {
      mother_details: {}, father_details: {}
    },
    nifas: {
      kf1: {}, kf2: {}, kf3: {}, kf4: {},
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
  }, []);

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
                      <p>📏 Tinggi Badan: <span className="font-bold text-base-text-primary">{data.height ? `${data.height} cm` : "-"}</span></p>
                      <p>💪 LiLA: <span className="font-bold text-base-text-primary">{data.lila ? `${data.lila} cm` : "-"}</span></p>
                      <p>🩺 Tensi: <span className="font-bold text-brand-primary">{data.bp || "-"} mmHg</span></p>
                      <p>👶 TFU / DJJ: <span className="font-bold text-base-text-primary">{data.tfu ? `${data.tfu} cm` : "-"} / {data.djj ? `${data.djj} x/mnt` : "-"}</span></p>
                      <p>💉 Imunisasi TT: <span className="font-bold text-base-text-primary">{data.tt || "Belum"}</span></p>
                      <p>💊 Pil TTD: <span className="font-bold text-base-text-primary">{data.pills || "-"}</span></p>
                      <p>🧬 Lab (Hb): <span className="font-bold text-base-text-primary">{data.hb ? `${data.hb} g/dL` : "-"}</span></p>
                      <p>🧪 Protein Urin: <span className="font-bold text-base-text-primary">{data.protein || "-"}</span></p>
                      <p>🍬 Gula Darah: <span className="font-bold text-base-text-primary">{data.sugar ? `${data.sugar} mg/dL` : "-"}</span></p>
                      <p>📋 Rujukan/Tatalaksana: <span className="font-bold text-base-text-primary italic">{data.management || "-"}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: USG & PEMERIKSAAN FISIK */}
        {activeTab === "usg_fisik" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Evaluasi Pemeriksaan Fisik &amp; Obstetrik</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Status Fisik</span>
                <p className="text-sm font-bold">IMT: <span className="text-brand-primary">{formData.usg_fisik.imt || "Normal"}</span></p>
                <p>Inspeksi Vagina/Porsio: <span className="text-base-text-primary">{formData.usg_fisik.vagina || "-"}</span></p>
                <p>Fluksus / Fluor: <span className="text-base-text-primary">{formData.usg_fisik.fluksus || "Tidak"} / {formData.usg_fisik.fluor || "Tidak"}</span></p>
              </div>

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Skrining Jiwa &amp; Persalinan</span>
                <p>Skrining Jiwa Nakes: <span className="text-base-text-primary italic">{formData.usg_fisik.mental_screening || "-"}</span></p>
                <p>Rencana Persalinan: <span className="text-brand-primary">{formData.usg_fisik.delivery_plan || "Normal"}</span></p>
              </div>

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Riwayat Keluarga &amp; Penyakit</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {Object.keys(formData.usg_fisik.disease_history || {}).filter(k => formData.usg_fisik.disease_history[k]).map(k => (
                    <span key={k} className="px-2.5 py-1 bg-status-red-light text-status-red-solid border border-status-red-solid/20 rounded-full text-[10px] capitalize">
                      {k}
                    </span>
                  ))}
                  {Object.keys(formData.usg_fisik.disease_history || {}).filter(k => formData.usg_fisik.disease_history[k]).length === 0 && (
                    <span className="text-status-green-solid">Tidak ada riwayat penyakit</span>
                  )}
                </div>
              </div>
            </div>

            {/* USG Biometri */}
            <div className="p-5 border border-base-border/30 rounded-2xl space-y-4">
              <span className="font-bold text-[10px] uppercase text-brand-primary block">Hasil USG Obstetrik</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">Kantung GS / Letak</span>
                  <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg.gs || "Tunggal"} ({formData.usg_fisik.usg.location || "Intrauterin"})</span>
                </div>
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">GS Diameter / CRL</span>
                  <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg.gs_diameter ? `${formData.usg_fisik.usg.gs_diameter} mm` : "-"} / {formData.usg_fisik.usg.crl ? `${formData.usg_fisik.usg.crl} mm` : "-"}</span>
                </div>
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">Pulsasi Jantung Janin</span>
                  <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg.heart_pulsation || "Ya"}</span>
                </div>
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">Biometri (BPD/HC/AC/FL)</span>
                  <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg.bpd || "-"}/{formData.usg_fisik.usg.hc || "-"}/{formData.usg_fisik.usg.ac || "-"}/{formData.usg_fisik.usg.fl || "-"} mm</span>
                </div>
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">Estimasi Berat Janin (EFW)</span>
                  <span className="font-bold text-brand-primary">{formData.usg_fisik.usg.efw ? `${formData.usg_fisik.usg.efw} gram` : "-"}</span>
                </div>
                <div className="bg-brand-soft/10 p-3 rounded-xl">
                  <span className="text-base-text-secondary text-[10px] block">Air Ketuban (SDP)</span>
                  <span className="font-bold text-base-text-primary">{formData.usg_fisik.usg.amnion ? `${formData.usg_fisik.usg.amnion} cm` : "-"}</span>
                </div>
              </div>
            </div>

            {/* Riwayat Kehamilan */}
            {formData.usg_fisik.prev_pregnancy && formData.usg_fisik.prev_pregnancy.length > 0 && (
              <div className="p-5 border border-base-border/30 rounded-2xl space-y-3">
                <span className="font-bold text-[10px] uppercase text-base-text-secondary block">Riwayat Kehamilan Terdahulu</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {formData.usg_fisik.prev_pregnancy.map((p: any, idx: number) => (
                    <div key={idx} className="bg-base-bg/15 p-3.5 rounded-xl font-medium space-y-1">
                      <p>Tahun: <span className="font-bold text-base-text-primary">{p.year || "-"}</span></p>
                      <p>Berat lahir: <span className="font-semibold text-base-text-primary">{p.weight ? `${p.weight} kg` : "-"}</span></p>
                      <p>Proses: <span className="font-semibold text-base-text-primary">{p.process || "-"}</span></p>
                      <p>Penolong / Masalah: <span className="font-semibold text-base-text-primary">{p.helper || "-"} / {p.problem || "-"}</span></p>
                    </div>
                  ))}
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
                  <h5 className="font-black text-status-red-solid text-xs">REKOMENDASI RUJUK KE FKRTL:</h5>
                  <p className="font-semibold text-status-red-solid/90 mt-0.5">Hasil MAP ({mapValue} mmHg) &gt; 90 atau Protein Urin ({urinCelup}) positif terdeteksi. Silakan kunjungi Fasilitas Kesehatan Rujukan Tingkat Lanjut (FKRTL) segera!</p>
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

              <div className="bg-base-bg/20 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase">Faktor Risiko Terdeteksi</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.keys(formData.preeklampsia_dmg.risiko_sedang || {}).filter(k => formData.preeklampsia_dmg.risiko_sedang[k]).map(k => (
                    <span key={k} className="px-2 py-0.5 bg-status-orange-light text-status-orange-solid border border-status-orange-solid/20 rounded-full text-[9px] capitalize">{k.replace(/_/g, " ")}</span>
                  ))}
                  {Object.keys(formData.preeklampsia_dmg.risiko_tinggi || {}).filter(k => formData.preeklampsia_dmg.risiko_tinggi[k]).map(k => (
                    <span key={k} className="px-2 py-0.5 bg-status-red-light text-status-red-solid border border-status-red-solid/20 rounded-full text-[9px] capitalize">{k.replace(/_/g, " ")}</span>
                  ))}
                  {Object.keys(formData.preeklampsia_dmg.risiko_sedang || {}).filter(k => formData.preeklampsia_dmg.risiko_sedang[k]).length === 0 && 
                   Object.keys(formData.preeklampsia_dmg.risiko_tinggi || {}).filter(k => formData.preeklampsia_dmg.risiko_tinggi[k]).length === 0 && (
                    <span className="text-status-green-solid">Tidak ada faktor risiko</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: PERSALINAN */}
        {activeTab === "persalinan" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Keterangan Lahir &amp; Persalinan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase block">Data Kelahiran Bayi</span>
                <p>No. Keterangan Lahir: <span className="text-base-text-primary">{formData.persalinan.birth_cert_no || "-"}</span></p>
                <p>Waktu Lahir: <span className="text-base-text-primary">{formData.persalinan.birth_time || "-"}</span></p>
                <p>Usia Gestasi / Anak Ke-: <span className="text-base-text-primary">{formData.persalinan.gestation_age || "-"} Minggu / {formData.persalinan.child_order || "-"}</span></p>
                <p>Antropometri: <span className="text-brand-primary">{formData.persalinan.baby_weight || "-"} g &bull; {formData.persalinan.baby_height || "-"} cm &bull; LK {formData.persalinan.head_circ || "-"} cm</span></p>
              </div>

              <div className="bg-base-bg/15 p-4 rounded-2xl space-y-2">
                <span className="text-[10px] text-base-text-secondary uppercase block">Metode &amp; Penolong</span>
                <p>Metode Persalinan: <span className="text-base-text-primary">{formData.persalinan.delivery_method || "-"}</span></p>
                <p>Penolong Persalinan: <span className="text-base-text-primary">{formData.persalinan.helper || "-"}</span></p>
                <p>Inisiasi Menyusu Dini (IMD): <span className="text-status-green-solid font-black">{formData.persalinan.imd || "Ya"}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NIFAS */}
        {activeTab === "nifas" && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold text-brand-primary border-b pb-2">Ringkasan Pelayanan Masa Nifas (KF 1 - 4)</h2>
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
                    <p>📅 Tanggal: <span className="text-base-text-primary">{data.date || "-"}</span></p>
                    <p>🍼 Payudara: <span className="text-base-text-primary">{data.breast || "-"}</span></p>
                    <p>🩸 Perdarahan: <span className="text-base-text-primary">{data.bleeding || "-"}</span></p>
                    <p>🩹 Jalan Lahir: <span className="text-base-text-primary">{data.tear || "-"}</span></p>
                    <p>💊 Vit A / KB: <span className="text-base-text-primary">{data.vit_a ? "Diberikan" : "Tidak"} / {data.kb ? "Diberikan" : "Tidak"}</span></p>
                    <p>🧠 Skrining Jiwa: <span className="text-base-text-primary italic">{data.mental || "-"}</span></p>
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 bg-brand-soft/10 border border-brand-primary/10 rounded-2xl text-xs font-semibold">
              <span className="text-[10px] text-brand-primary uppercase">Status Akhir Masa Nifas</span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <p>Status Ibu: <span className="text-base-text-primary">{formData.nifas.final_status.mother || "Sehat"}</span></p>
                <p>Status Bayi: <span className="text-base-text-primary">{formData.nifas.final_status.baby || "Sehat"}</span></p>
                <p>Masalah: <span className="text-status-red-solid">{formData.nifas.final_status.problems || "Tidak Ada"}</span></p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
