"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MdDateRange, MdPlace, MdFitnessCenter, MdStraighten, 
  MdFavorite, MdBloodtype, MdScience, MdMedicalServices,
  MdHelpOutline, MdAssignmentTurnedIn, MdShield, MdPsychology,
  MdFactCheck, MdKeyboardArrowRight, MdCheckCircle,
  MdLocalHospital, MdPerson, MdCheck
} from "react-icons/md";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";

// ─── Interfaces & Types ──────────────────────────────────
interface DetailedMaternalRecord {
  kunjunganKe: number;
  trimester: "I" | "II" | "III";
  mingguFase: string;
  tanggalPeriksa: string;
  tempatPeriksa: string;
  beratBadan: number | null;
  tinggiBadan: number | null;
  lingkarLenganAtas: number | null;
  tekananDarah: string;
  tinggiRahim: number | null;
  letakJanin: string;
  djjBayi: number | null;
  statusImunisasiTetanus: string;
  konseling: string;
  skriningDokter: string;
  tabletTambahDarah: number | null;
  labHemoglobin: number | null;
  golonganDarah: string;
  labProteinUrine: string;
  labGulaDarah: number | null;
  usg: string;
  tripelElimasi: { hiv: string; sifilis: string; hepatitisB: string; };
  tataLaksanaKasus: string;
}

interface DoctorEvaluationRecord {
  namaDokter: string;
  tanggalPeriksa: string;
  fasilitasKesehatan: string;
  fisik: {
    tb: number;
    bb: number;
    lila: number;
    imtStatus: "Kurus" | "Normal" | "Gemuk" | "Obesitas";
  };
  statusImunisasiTd: {
    currentStatus: number;
    kesimpulan: string;
    imunisasiLainnya: string;
  };
  riwayatKesehatanSekarang: {
    alergi: boolean; asma: boolean; autoimun: boolean; diabetes: boolean;
    hepatitisB: boolean; hipertensi: boolean; jantung: boolean; jiwa: boolean;
    sifilis: boolean; tb: boolean; lainnya: string;
  };
  riwayatPerilakuBerisiko: {
    aktivitasFisikKurang: boolean;
    alkohol: boolean;
    kosmetikBerbahaya: boolean;
    merokok: boolean;
    obatTeratogenik: boolean;
    polaMakanBerisiko: boolean;
    lainnya: string;
  };
  riwayatPenyakitKeluarga: {
    alergi: boolean; asma: boolean; autoimun: boolean; diabetes: boolean;
    hepatitisB: boolean; hipertensi: boolean; jantung: boolean; jiwa: boolean;
    sifilis: boolean; tb: boolean; lainnya: string;
  };
  pemeriksaanKhusus: {
    porsio: "Normal" | "Tidak normal";
    uretra: "Normal" | "Tidak normal";
    vagina: "Normal" | "Tidak normal";
    vulva: "Normal" | "Tidak normal";
    fluksus: string;
    fluor: string;
  };
  riwayatKehamilanTerdahulu: {
    no: number;
    tahun: string;
    bbGram: number | null;
    prosesMelahirkan: string;
    penolong: string;
    masalah: string;
  }[];
}

interface LogPelayananMaternal {
  id: number;
  trimester: 1 | 2 | 3;
  tanggalPeriksa: string;
  parafTenagaKesehatan: string;
  keluhanDanTindakan: string;
  tanggalKembali: string;
}

interface Trimester1DoctorRecord {
  namaDokter: string;
  tanggalPeriksa: string;
  konsepRisiko: "Normal" | "Kehamilan Bermasalah";
  pemeriksaanFisik: {
    konjungtiva: "Anemia" | "Tidak Anemia";
    sklera: "Ikterik" | "Tidak Ikterik";
    kulit: "Normal" | "Tidak normal";
    leher: "Normal" | "Tidak normal";
    gigiMulut: "Normal" | "Tidak normal";
    tht: "Normal" | "Tidak normal";
    jantung: "Normal" | "Tidak normal";
    paru: "Normal" | "Tidak normal";
    perut: "Normal" | "Tidak normal";
    tungkai: "Normal" | "Tidak normal";
    keadaanUmum: string;
  };
  usgTri1: {
    hpht: string;
    keteraturanHaid: "Teratur" | "Tidak Teratur";
    umurKehamilanHphtMinggu: number | null;
    hplBerdasarkanHpht: string;
    umurKehamilanUsgMinggu: number | null;
    hplBerdasarkanUsg: string;
    jumlahGs: "Tunggal" | "Kembar";
    diameterGsCm: number | null;
    diameterGsMingguHari: string;
    jumlahBayi: "Tunggal" | "Kembar";
    crlCm: number | null;
    crlMingguHari: string;
    letakProduk: "Intrauterin" | "Extrauterin" | "Tidak dapat ditentukan";
    pulsasiJantung: "Tampak" | "Tidak tampak";
    kecurigaanTemuanAbnormal: { status: boolean; sebutkan: string; };
    hasilUsgNotes: string;
  };
  laboratorium: {
    tanggal: string;
    hemoglobin: number | null; rtlHemoglobin: string;
    golDarahRhesus: string; rtlGolDarah: string;
    gulaDarahSewaktu: number | null; rtlGds: string;
    tripleEliminasi: {
      hiv: "Reaktif" | "Non reaktif" | "-"; rtlHiv: string;
      sifilis: "Reaktif" | "Non reaktif" | "-"; rtlSifilis: string;
      hepB: "Reaktif" | "Non reaktif" | "-"; rtlHepB: string;
    };
  };
  skriningJiwa: {
    tanggal: string;
    skriningJiwaStatus: "Ya" | "Tidak";
    tindakLanjut: "Edukasi" | "Konseling" | "-";
    perluRujukan: "Ya" | "Tidak";
  };
  kesimpulan: string;
  rekomendasi: string;
}
interface Trimester3DoctorRecord {
  namaDokter: string;
  tanggalPeriksa: string;
  pemeriksaanFisik: {
    konjungtiva: "Anemia" | "Tidak Anemia";
    sklera: "Ikterik" | "Tidak Ikterik";
    kulit: "Normal" | "Tidak normal";
    leher: "Normal" | "Tidak normal";
    gigiMulut: "Normal" | "Tidak normal";
    tht: "Normal" | "Tidak normal";
    jantung: "Normal" | "Tidak normal";
    paru: "Normal" | "Tidak normal";
    perut: "Normal" | "Tidak normal";
    tungkai: "Normal" | "Tidak normal";
    keadaanUmum: string;
  };
  usgTri3: {
    dilakukan: "Ya" | "Tidak";
    ukBerdasarkanTri1: number | null;
    ukBerdasarkanHpht: number | null;
    ukBerdasarkanBiometriUsg: number | null;
    selisihTigaMinggu: "Ya" | "Tidak";
    jumlahBayi: "Tunggal" | "Kembar";
    letakBayi: "Intrauterin" | "Extrauterin" | "Tidak dapat ditentukan";
    presentasiJanin: "Kepala" | "Bokong" | "Letak Lintang";
    keadaanJanin: "Hidup" | "Meninggal";
    djjBpm: number | null;
    lokasiPlasenta: "Fundus/Corpus" | "Letak Rendah" | "Previa";
    cairanKetubanSdpCm: number | null;
    cairanKetubanStatus: "Cukup" | "Kurang" | "Berlebih";
    biometri: {
      bpdCm: number | null; bpdMinggu: number | null;
      hcCm: number | null; hcMinggu: number | null;
      acCm: number | null; acMinggu: number | null;
      flCm: number | null; flMinggu: number | null;
      efwGram: number | null; efwMinggu: number | null;
    };
    kecurigaanAbnormal: { status: boolean; sebutkan: string; };
    hasilUsgNotes: string;
  };
  laboratorium: {
    tanggal: string;
    hemoglobin: number | null; rtlHb: string;
    proteinUrin: string; rtlProtein: string;
    urinReduksi: string; rtlReduksi: string;
  };
  skriningJiwa: {
    tanggal: string;
    status: "Ya" | "Tidak";
    tindakLanjut: "Edukasi" | "Konseling";
    perluRujukan: "Ya" | "Tidak";
  };
  rencanaKonsultasiLanjut: string;
  rencanaProsesMelahirkan: "Normal" | "Pervaginam berbantu" | "Sectio caesaria";
  pilihanKontrasepsi: string;
  konselingKb: "Ya" | "Tidak";
  penjelasanKesimpulan: string;
}

const MOCK_DATA_GRAFIK_KIA = [
  { minggu: 0, tanggal: "12/01/2026", pemeriksa: "Dr. Anita R.", djj: null, tfu: null, sistole: 110, diastole: 70, nadi: 80, bbPeningkatan: 0, awalMin: 0, awalMax: 0, kurusMax: 0, normalMin: 0, normalMax: 0, gemukMax: 0, obesitasMin: 0, obesitasMax: 0 },
  { minggu: 12, tanggal: "09/02/2026", pemeriksa: "Bidan Widya", djj: null, tfu: null, sistole: 115, diastole: 75, nadi: 82, bbPeningkatan: 1.2, awalMin: 0.2, awalMax: 2.0, kurusMax: 2.0, normalMin: 0.5, normalMax: 2.0, gemukMax: 2.0, obesitasMin: 0.5, obesitasMax: 1.5 },
  { minggu: 16, tanggal: "09/03/2026", pemeriksa: "Bidan Widya", djj: 136, tfu: null, sistole: 115, diastole: 75, nadi: 80, bbPeningkatan: 2.5, awalMin: null, awalMax: null, kurusMax: 4.3, normalMin: 2.1, normalMax: 4.0, gemukMax: 3.4, obesitasMin: 1.1, obesitasMax: 2.6 },
  { minggu: 20, tanggal: "06/04/2026", pemeriksa: "Bidan Widya", djj: 140, tfu: 16, sistole: 120, diastole: 80, bbPeningkatan: 4.0, awalMin: null, awalMax: null, kurusMax: 6.6, normalMin: 3.8, normalMax: 6.0, gemukMax: 4.7, obesitasMin: 1.8, obesitasMax: 3.7 },
  { minggu: 24, tanggal: "04/05/2026", pemeriksa: "Bidan Widya", djj: 142, tfu: 20, sistole: 120, diastole: 80, bbPeningkatan: 5.8, awalMin: null, awalMax: null, kurusMax: 8.9, normalMin: 5.4, normalMax: 8.0, gemukMax: 6.1, obesitasMin: 2.4, obesitasMax: 4.7 },
  { minggu: 28, tanggal: "01/06/2026", pemeriksa: "Dr. Rian Syarif", djj: 140, tfu: 25, sistole: 118, diastole: 78, nadi: 80, bbPeningkatan: 7.5, awalMin: null, awalMax: null, kurusMax: 11.1, normalMin: 7.0, normalMax: 10.0, gemukMax: 7.4, obesitasMin: 3.1, obesitasMax: 5.8 },
  { minggu: 32, tanggal: "29/06/2026", pemeriksa: "Dr. Rian Syarif", djj: 144, tfu: 29, sistole: 135, diastole: 88, nadi: 85, bbPeningkatan: 9.2, awalMin: null, awalMax: null, kurusMax: 13.4, normalMin: 8.6, normalMax: 12.0, gemukMax: 8.8, obesitasMin: 3.7, obesitasMax: 6.9 },
  { minggu: 36, tanggal: "27/07/2026", pemeriksa: "Dr. Rian Syarif", djj: 146, tfu: 32, sistole: 122, diastole: 82, nadi: 88, bbPeningkatan: 11.0, awalMin: null, awalMax: null, kurusMax: 15.7, normalMin: 10.3, normalMax: 14.0, gemukMax: 10.1, obesitasMin: 4.4, obesitasMax: 7.9 },
  { minggu: 40, tanggal: "24/08/2026", pemeriksa: "Dr. Rian Syarif", djj: 144, tfu: 34, sistole: 120, diastole: 80, bbPeningkatan: 12.5, awalMin: null, awalMax: null, kurusMax: 18.0, normalMin: 11.5, normalMax: 16.0, gemukMax: 11.5, obesitasMin: 5.0, obesitasMax: 9.0 },
];

// ─── Mock Data Kunjungan ANC ───
const MOCK_DETAILED_RECORDS: DetailedMaternalRecord[] = [
  {
    kunjunganKe: 1, trimester: "I", mingguFase: "12 Minggu Pertama",
    tanggalPeriksa: "12 Februari 2026", tempatPeriksa: "Puskesmas Suhat, Malang",
    beratBadan: 52.5, tinggiBadan: 158, lingkarLenganAtas: 22.8, tekananDarah: "115/75",
    tinggiRahim: null, letakJanin: "-", djjBayi: null, statusImunisasiTetanus: "T1",
    konseling: "Edukasi gizi trimester 1 dan penanganan mual", skriningDokter: "Dilakukan oleh Dr. Anita (Normal)",
    tabletTambahDarah: 30, labHemoglobin: 12.1, golonganDarah: "O+", labProteinUrine: "Negatif",
    labGulaDarah: 95, usg: "Kantung janin terlihat berkembang baik",
    tripelElimasi: { hiv: "Non Reaktif", sifilis: "Non Reaktif", hepatitisB: "Non Reaktif" },
    tataLaksanaKasus: "Pemberian vitamin asam folat"
  }
];

// ─── Ganti Mock Data Evaluasi Medis Dokter dengan ini ───
const MOCK_DOCTOR_EVALUATION: DoctorEvaluationRecord = {
  namaDokter: "Dr. Rian Syarif, Sp.OG",
  tanggalPeriksa: "15 Februari 2026",
  fasilitasKesehatan: "RSIA Permata Bunda, Malang",
  fisik: { tb: 158, bb: 52.5, lila: 24.0, imtStatus: "Normal" },
  statusImunisasiTd: {
    currentStatus: 2,
    kesimpulan: "Status T2 Terpenuhi, Jadwal T3 berikutnya disesuaikan",
    imunisasiLainnya: "COVID-19 (Dosis Booster Ke-2)"
  },
  riwayatKesehatanSekarang: {
    alergi: true, asma: true, autoimun: false, diabetes: false,
    hepatitisB: false, hipertensi: false, jantung: false, jiwa: false,
    sifilis: false, tb: false, lainnya: "Rhinitis Alergi Ringan"
  },
  // Data Baru untuk Perilaku Berisiko
  riwayatPerilakuBerisiko: {
    aktivitasFisikKurang: true,
    alkohol: false,
    kosmetikBerbahaya: false,
    merokok: false,
    obatTeratogenik: false,
    polaMakanBerisiko: true,
    lainnya: "-"
  },
  riwayatPenyakitKeluarga: {
    alergi: false, asma: false, autoimun: false, diabetes: true,
    hepatitisB: false, hipertensi: true, jantung: false, jiwa: false,
    sifilis: false, tb: false, lainnya: "-"
  },
  pemeriksaanKhusus: {
    porsio: "Normal", uretra: "Normal", vagina: "Normal", vulva: "Normal",
    fluksus: "-", fluor: "-"
  },
  riwayatKehamilanTerdahulu: [
    { no: 1, tahun: "2023", bbGram: 3100, prosesMelahirkan: "Normal / Spontan", penolong: "Bidan", masalah: "Tidak Ada" }
  ]
};

const MOCK_LOG_PELAYANAN: LogPelayananMaternal[] = [
  {
    id: 1,
    trimester: 1,
    tanggalPeriksa: "12 Feb 2026",
    parafTenagaKesehatan: "Bidan Widya, A.Md.Keb",
    keluhanDanTindakan: "Ibu mengeluh mual muntah di pagi hari (morning sickness) ringan. Nafsu makan sedikit menurun. Diberikan KIE nutrisi porsi kecil tapi sering, suplemen asam folat 400 mcg, dan vitamin B6 untuk meredakan mual.",
    tanggalKembali: "18 Apr 2026"
  },
  {
    id: 2,
    trimester: 2,
    tanggalPeriksa: "18 Apr 2026",
    parafTenagaKesehatan: "Bidan Widya, A.Md.Keb",
    keluhanDanTindakan: "Tidak ada keluhan utama, gerakan janin mulai dirasakan aktif oleh Ibu. Pembagian tablet tambah darah (Fe) sebanyak 30 tablet untuk bulan ini. Diingatkan untuk rutin meminumnya malam hari dengan air putih/jeruk.",
    tanggalKembali: "20 Mei 2026"
  },
  {
    id: 3,
    trimester: 3,
    tanggalPeriksa: "10 Juni 2026",
    parafTenagaKesehatan: "Dr. Rian Syarif, Sp.OG",
    keluhanDanTindakan: "Ibu mengeluh sering kencing dan sedikit pegal pada pinggang bagian belakang (kondisi fisiologis trimester 3). Posisi janin normal presentasi kepala. Diberikan edukasi senam hamil ringan dan persiapan tabulin.",
    tanggalKembali: "08 Juli 2026"
  }
];

const MOCK_TRIMESTER_1_DOCTOR: Trimester1DoctorRecord = {
  namaDokter: "Dr. Anita Rahmawati",
  tanggalPeriksa: "14 Februari 2026",
  konsepRisiko: "Normal",
  pemeriksaanFisik: {
    konjungtiva: "Tidak Anemia",
    sklera: "Tidak Ikterik",
    kulit: "Normal",
    leher: "Normal",
    gigiMulut: "Normal",
    tht: "Normal",
    jantung: "Normal",
    paru: "Normal",
    perut: "Normal",
    tungkai: "Normal",
    keadaanUmum: "Baik, kesadaran compos mentis optimal."
  },
  usgTri1: {
    hpht: "01 Desember 2025",
    keteraturanHaid: "Teratur",
    umurKehamilanHphtMinggu: 10,
    hplBerdasarkanHpht: "07 September 2026",
    umurKehamilanUsgMinggu: 10,
    hplBerdasarkanUsg: "07 September 2026",
    jumlahGs: "Tunggal",
    diameterGsCm: 3.4,
    diameterGsMingguHari: "10 Minggu + 2 Hari",
    jumlahBayi: "Tunggal",
    crlCm: 3.1,
    crlMingguHari: "10 Minggu + 0 Hari",
    letakProduk: "Intrauterin",
    pulsasiJantung: "Tampak",
    kecurigaanTemuanAbnormal: { status: false, sebutkan: "-" },
    hasilUsgNotes: "Kantung kehamilan utuh di dalam rahim, mudigah berkembang sesuai usia gestasi tunggal hidup."
  },
  laboratorium: {
    tanggal: "14/02/2026",
    hemoglobin: 12.4, rtlHemoglobin: "Pertahankan gizi seimbang",
    golDarahRhesus: "A / Positif", rtlGolDarah: "Tercatat di kartu darah",
    gulaDarahSewaktu: 98, rtlGds: "Normal, kurangi konsumsi gula berlebih",
    tripleEliminasi: {
      hiv: "Non reaktif", rtlHiv: "Edukasi pencegahan",
      sifilis: "Non reaktif", rtlSifilis: "Edukasi pencegahan",
      hepB: "Non reaktif", rtlHepB: "Edukasi pencegahan"
    }
  },
  skriningJiwa: {
    tanggal: "14/02/2026",
    skriningJiwaStatus: "Tidak",
    tindakLanjut: "Edukasi",
    perluRujukan: "Tidak"
  },
  kesimpulan: "Kehamilan Trimester I Normal, kondisi umum Ibu dan janin sehat prima.",
  rekomendasi: "Lanjutkan konsumsi rutin tablet tambah darah harian, asam folat, dan jadwalkan kontrol ulang USG di Trimester II."
};

const MOCK_TRIMESTER_3_DOCTOR: Trimester3DoctorRecord = {
  namaDokter: "Dr. Rian Syarif, Sp.OG",
  tanggalPeriksa: "28 Juni 2026",
  pemeriksaanFisik: {
    konjungtiva: "Tidak Anemia", sklera: "Tidak Ikterik", kulit: "Normal",
    leher: "Normal", gigiMulut: "Normal", tht: "Normal", jantung: "Normal",
    paru: "Normal", perut: "Normal", tungkai: "Normal", keadaanUmum: "Baik, Compos Mentis"
  },
  usgTri3: {
    dilakukan: "Ya",
    ukBerdasarkanTri1: 34, ukBerdasarkanHpht: 34, ukBerdasarkanBiometriUsg: 34,
    selisihTigaMinggu: "Tidak", jumlahBayi: "Tunggal", letakBayi: "Intrauterin",
    presentasiJanin: "Kepala", keadaanJanin: "Hidup", djjBpm: 144, lokasiPlasenta: "Fundus/Corpus",
    cairanKetubanSdpCm: 5.2, cairanKetubanStatus: "Cukup",
    biometri: {
      bpdCm: 8.5, bpdMinggu: 34, hcCm: 30.5, hcMinggu: 34,
      acCm: 29.8, acMinggu: 34, flCm: 6.6, flMinggu: 34,
      efwGram: 2250, efwMinggu: 34
    },
    kecurigaanAbnormal: { status: false, sebutkan: "" },
    hasilUsgNotes: "Pertumbuhan janin sesuai kurva gestasi normal, cairan ketuban jernih dan cukup."
  },
  laboratorium: {
    tanggal: "28/06/2026", hemoglobin: 11.8, rtlHb: "Pertahankan gizi",
    proteinUrin: "Negatif", rtlProtein: "Normal", urinReduksi: "Negatif", rtlReduksi: "Normal"
  },
  skriningJiwa: {
    tanggal: "28/06/2026", status: "Tidak", tindakLanjut: "Edukasi", perluRujukan: "Tidak"
  },
  rencanaKonsultasiLanjut: "Kebidanan",
  rencanaProsesMelahirkan: "Normal",
  pilihanKontrasepsi: "AKDR",
  konselingKb: "Ya",
  penjelasanKesimpulan: "Rekomendasi Tempat Proses Melahirkan: FKTP (Fasilitas Kesehatan Tingkat Pertama / Puskesmas)"
};

const ticksEvaluasi = Array.from({ length: 42 - 8 + 1 }, (_, i) => 8 + i); // [8, 9, 10, ..., 42]
const ticksBeratBadan = Array.from({ length: 42 - 0 + 2 }, (_, i) => 2 + i); // [2, ..., 42]

const TETANUS_REF = [
  { stat: "T1", interval: "Langkah awal pembentukan kekebalan tubuh", perlindungan: "Langkah Awal" },
  { stat: "T2", interval: "1 Bulan setelah T1", perlindungan: "3 Tahun" },
  { stat: "T3", interval: "6 Bulan setelah T2", perlindungan: "5 Tahun" },
  { stat: "T4", interval: "12 Bulan setelah T3", perlindungan: "10 Tahun" },
  { stat: "T5", interval: "12 Bulan setelah T4", perlindungan: "Lebih dari 25 Tahun" },
];

const IMUNISASI_TD_REF = [
  { tt: 1, selangWaktu: "Awal", perlindungan: "Awal" },
  { tt: 2, selangWaktu: "1 bulan", perlindungan: "3 tahun" },
  { tt: 3, selangWaktu: "6 bulan", perlindungan: "5 tahun" },
  { tt: 4, selangWaktu: "12 bulan", perlindungan: "10 tahun" },
  { tt: 5, selangWaktu: "12 bulan", perlindungan: "> 25 tahun" },
];

export default function RekamMedisIbuPage() {
  // Main Tab terbagi menjadi 3 bagian terpisah sesuai permintaanmu
  const [activeMainTab, setActiveMainTab] = useState<"anc" | "evaluasi_kesehatan" | "evaluasi_dokter" | "catatan_pelayanan" | "persalinan" | "nifas">("anc");  const [activeSubTab, setActiveSubTab] = useState<"pemeriksaan_tri1" | "skrining_khusus" | "pemeriksaan_tri3" | "grafik">("pemeriksaan_tri1");
  const [activeKunjungan, setActiveKunjungan] = useState<number>(1);
  const [selectedLogTrimester, setSelectedLogTrimester] = useState<1 | 2 | 3 | "grafik">(1);
  const [activePersalinanSubTab, setActivePersalinanSubTab] = useState<"rencana" | "ringkasan" | "keterangan_lahir" | "riwayat_partus">("rencana");
  const [activeNifasSubTab, setActiveNifasSubTab] = useState<"ringkasan" | "perawatan" | "rujukan" | "log_pelayanan">("ringkasan");

  // State untuk mengontrol filter fokus garis pada Grafik Evaluasi
  const [focusGarisEvaluasi, setFocusGarisEvaluasi] = useState<string | null>(null);

  // State untuk mengontrol filter fokus garis pada Grafik Berat Badan
  const [focusGarisBB, setFocusGarisBB] = useState<string | null>(null);

  const record = MOCK_DETAILED_RECORDS[0];
  const evalDoc = MOCK_DOCTOR_EVALUATION;

  const checkIsKek = record.lingkarLenganAtas ? record.lingkarLenganAtas < 23.5 : false;
  const checkIsHipertensi = () => {
    if (!record.tekananDarah || record.tekananDarah === "-") return false;
    const [systolic, diastolic] = record.tekananDarah.split("/").map(Number);
    return systolic >= 140 || diastolic >= 90;
  };

  const getLayananStatus = (id: string) => {
    switch (id) {
      case "bb_tb": return record.beratBadan !== null;
      case "tansi": return !!record.tekananDarah && record.tekananDarah !== "-";
      case "lila": return record.lingkarLenganAtas !== null;
      default: return false;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 pb-18 bg-[#FAFAFA] min-h-screen text-gray-800 space-y-6">
      
      {/* ─── BREADCRUMB & HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/dashboard" className="hover:text-[#EA2986]">Beranda</Link>
            <span>/</span>
            <span className="text-gray-600">Perjalanan Ibu</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 mt-1 tracking-tight">Catatan Kesehatan &amp; Rekam Medis Maternal</h1>
        </div>
        <span className="text-[10px] font-extrabold text-[#EA2986] bg-[#EA2986]/10 px-3 py-1.5 rounded-xl uppercase tracking-wider self-start md:self-auto">
          Buku Kesehatan Ibu dan Anak
        </span>
      </div>

      {/* ─── MAIN TABS NAVIGATION (FULLY RESPONSIVE GRID) ─── */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMainTab("anc")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "anc" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <MdFactCheck className="text-sm shrink-0" /> 
            <span className="truncate">Riwayat ANC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("evaluasi_kesehatan")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "evaluasi_kesehatan" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <MdShield className="text-sm shrink-0" /> 
            <span className="truncate">Evaluasi Ibu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("evaluasi_dokter")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "evaluasi_dokter" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <MdLocalHospital className="text-sm shrink-0" /> 
            <span className="truncate">Evaluasi Dokter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab("catatan_pelayanan")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "catatan_pelayanan" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <MdAssignmentTurnedIn className="text-sm shrink-0" /> 
            <span className="truncate">Catatan Pelayanan</span>
          </button>

          {/* Tab Persalinan & Kelahiran */}
          <button
            type="button"
            onClick={() => setActiveMainTab("persalinan")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "persalinan" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
          >
            <MdLocalHospital className="text-sm shrink-0" /> 
            <span className="truncate">Persalinan &amp; Bayi</span>
          </button>

          {/* Tab Nifas */}
          <button
            type="button"
            onClick={() => setActiveMainTab("nifas")}
            className={`flex items-center justify-center gap-2 py-3 px-3 text-xs font-black transition-all rounded-xl cursor-pointer text-center ${
              activeMainTab === "nifas" 
                ? "bg-[#EA2986] text-white shadow-xs" 
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-950"
            }`}
            >
            <MdCheckCircle className="text-sm shrink-0" />
            <span className="truncate">Kesehatan Nifas</span>
          </button>
        </div>
      </div>

      {/* ─── KONDISI KONTEN TAB 1: RIWAYAT & PANDUAN ANC ─── */}
      {activeMainTab === "anc" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Picker Kunjungan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Lembar Kartu Kunjungan ANC
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-gray-100 p-1 rounded-xl">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const hasData = MOCK_DETAILED_RECORDS.some(r => r.kunjunganKe === num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => hasData && setActiveKunjungan(num)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      activeKunjungan === num
                        ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                        : hasData
                        ? "text-gray-700 hover:text-gray-900 font-semibold cursor-pointer"
                        : "text-gray-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    Ke-{num} {hasData && "•"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata Ringkas Kunjungan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EA2986]/10 text-[#EA2986] flex items-center justify-center text-lg shrink-0"><MdDateRange /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Tanggal Periksa</p>
                <p className="text-sm font-black text-gray-900">{record.tanggalPeriksa}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shrink-0"><MdPlace /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Tempat Layanan</p>
                <p className="text-sm font-black text-gray-900 truncate max-w-[180px]">{record.tempatPeriksa}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0"><MdMedicalServices /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Fase Trimester</p>
                <p className="text-sm font-black text-gray-900">Trimester {record.trimester} <span className="text-xs font-normal text-gray-400">({record.mingguFase})</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* KOLOM KIRI: DATA MEDIS */}
            <div className="flex flex-col gap-6 justify-between">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-3.5 bg-[#EA2986] rounded-full block"/>
                    Hasil Pemeriksaan Fisik Kunjungan ke-{activeKunjungan}
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Berat Badan", val: record.beratBadan ? `${record.beratBadan} kg` : "-", icon: <MdFitnessCenter /> },
                      { label: "Tinggi Badan", val: record.tinggiBadan ? `${record.tinggiBadan} cm` : "Tidak Diukur", disabled: !record.tinggiBadan, icon: <MdStraighten className="rotate-90" /> },
                      { label: "Lingkar Lengan Atas (LiLA)", val: record.lingkarLenganAtas ? `${record.lingkarLenganAtas} cm` : "-", icon: <MdStraighten />, alert: checkIsKek ? "⚠️ Risiko KEK (<23.5 cm)" : null },
                      { label: "Tekanan Darah", val: record.tekananDarah || "-", icon: <MdFavorite className="text-rose-500" />, alert: checkIsHipertensi() ? "⚠️ Hipertensi (≥140/90)" : null },
                      { label: "Tinggi Fundus Uteri (TFU)", val: record.tinggiRahim ? `${record.tinggiRahim} cm` : "Belum Terukur", disabled: !record.tinggiRahim, icon: <MdStraighten className="rotate-45" /> },
                      { label: "Letak Janin", val: record.letakJanin || "-", icon: <MdHelpOutline /> },
                      { label: "Denyut Jantung Janin (DJJ)", val: record.djjBayi ? `${record.djjBayi} bpm` : "Belum Terdengar", disabled: !record.djjBayi, icon: <MdFavorite className="text-emerald-500 animate-pulse" /> },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${item.disabled ? "bg-gray-50/70 opacity-60" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><span className="text-gray-400 text-sm">{item.icon}</span><span>{item.label}</span></div>
                          <span className="text-xs font-black text-gray-900">{item.val}</span>
                        </div>
                        {item.alert && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded self-start mt-0.5">{item.alert}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><span className="w-1.5 h-3.5 bg-purple-600 rounded-full block"/>Skrining &amp; Hasil Laboratorium</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-400 font-bold block uppercase">Status Imunisasi TT</span><span className="text-xs font-black text-gray-900">{record.statusImunisasiTetanus || "-"}</span></div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100"><span className="text-[10px] text-gray-400 font-bold block uppercase">Materi Konseling</span><span className="text-xs font-medium text-gray-800 line-clamp-1">{record.konseling || "-"}</span></div>
                </div>
                <div className="border border-purple-100/60 rounded-xl p-3.5 bg-gradient-to-br from-purple-50/20 to-white space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1"><MdScience className="text-purple-600" />Hasil Uji Laboratorium</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-gray-100 rounded-lg p-2 text-center"><span className="text-[9px] text-gray-400 font-bold block">Hemoglobin</span><span className="text-xs font-black text-gray-900">{record.labHemoglobin ? `${record.labHemoglobin} g/dL` : "-"}</span></div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 text-center"><span className="text-[9px] text-gray-400 font-bold block">Gol. Darah</span><span className="text-xs font-black text-indigo-600">{record.golonganDarah || "-"}</span></div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 text-center"><span className="text-[9px] text-gray-400 font-bold block">Protein Urine</span><span className="text-xs font-black text-gray-900">{record.labProteinUrine || "-"}</span></div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 text-center"><span className="text-[9px] text-gray-400 font-bold block">Gula Darah</span><span className="text-xs font-black text-gray-900">{record.labGulaDarah ? `${record.labGulaDarah} mg/dL` : "-"}</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-gray-100 rounded-xl bg-white"><span className="text-[10px] text-gray-400 font-bold block uppercase">Kesimpulan USG</span><span className="text-xs font-medium text-gray-700">{record.usg || "-"}</span></div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-white space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Triple Eliminasi</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(record.tripelElimasi).map(([k, v]) => (
                        <span key={k} className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${v === "Non Reaktif" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-100 text-gray-400"}`}>{k.toUpperCase()}: {v}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-3.5 bg-[#EA2986]/5 border border-[#EA2986]/10 rounded-xl">
                  <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block">Tata Laksana Kasus / Catatan Rujukan</span>
                  <p className="text-xs font-bold text-gray-800 mt-1">{record.tataLaksanaKasus || "Kondisi sehat optimal."}</p>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: VALIDASI KEMENKES */}
            <div className="flex flex-col gap-6 justify-between">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">Validasi Standar Kemenkes</span>
                    <h3 className="text-sm font-black text-gray-900 mt-1.5">Komponen Pelayanan Kehamilan Wajib</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "bb_tb", title: "Timbang BB & Ukur TB", desc: "Memantau status energi & gizi harian.", icon: <MdFitnessCenter /> },
                      { id: "tansi", title: "Ukur Tekanan Darah", desc: "Skrining deteksi preeklamsia.", icon: <MdFavorite className="text-rose-500" /> },
                      { id: "lila", title: "Ukur Lengan Atas (LiLA)", desc: "Mencegah Risiko KEK (<23.5 cm).", icon: <MdStraighten /> },
                      { id: "tfu", title: "Ukur Tinggi Rahim (TFU)", desc: "Evaluasi ukuran rahim masa gestasi.", icon: <MdStraighten className="rotate-45" /> },
                      { id: "djj", title: "Cek Letak & DJJ Bayi", desc: "Mendengar detak jantung janin.", icon: <MdFavorite className="text-emerald-500" /> },
                      { id: "ttd", title: "Suplementasi Tablet TTD", desc: "Mencegah anemia prenatal zat besi.", icon: <MdAssignmentTurnedIn className="text-[#EA2986]" /> },
                      { id: "tt_status", title: "Skrining Imunisasi TT", desc: "Proteksi komprehensif infeksi tetanus.", icon: <MdShield className="text-indigo-500" /> },
                      { id: "jiwa", title: "Skrining Kesehatan Jiwa", desc: "Evaluasi psikologis emosional.", icon: <MdPsychology className="text-purple-500" /> },
                      { id: "lab", title: "Pemeriksaan Laboratorium", desc: "Uji Hb darah & Triple Eliminasi.", icon: <MdScience className="text-purple-600" /> },
                      { id: "usg", title: "Pemeriksaan USG Dokter", desc: "Validasi HPL & organ janin.", icon: <MdHelpOutline /> },
                    ].map((item) => {
                      const isDone = getLayananStatus(item.id);
                      return (
                        <div key={item.id} className={`p-2.5 border rounded-xl flex gap-2.5 transition-all duration-300 ${isDone ? "bg-emerald-50/60 border-emerald-200 text-gray-900 shadow-sm" : "bg-gray-50/40 border-gray-100 text-gray-500 opacity-80"}`}>
                          <div className={`w-7 h-7 rounded-lg shadow-sm flex items-center justify-center shrink-0 text-xs ${isDone ? "bg-emerald-600 text-white" : "bg-white text-gray-400 border border-gray-100"}`}>{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className={`text-[11px] font-black leading-tight ${isDone ? "text-emerald-900" : "text-gray-800"}`}>{item.title}</h4>
                              {isDone && <span className="text-[9px] font-black text-emerald-600 shrink-0 flex items-center gap-0.5 bg-white border border-emerald-200 px-1.5 py-0.2 rounded">✓ Selesai</span>}
                            </div>
                            <p className="text-[10px] mt-0.5 leading-tight text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2"><MdShield className="text-[#EA2986] text-base" />Tabel Status Imunisasi Tetanus</h3>
                </div>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-[9px] font-extrabold text-white uppercase tracking-wider">
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Interval Minimal</th>
                        <th className="py-2 px-3">Masa Perlindungan</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100 bg-white">
                      {TETANUS_REF.map((t, idx) => {
                        const isCurrentStatus = record.statusImunisasiTetanus === t.stat;
                        return (
                          <tr key={idx} className={`transition-colors ${isCurrentStatus ? "bg-[#EA2986]/10 font-bold text-gray-900" : "hover:bg-gray-50/50 text-gray-600"}`}>
                            <td className="py-2.5 px-3"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isCurrentStatus ? "bg-[#EA2986] text-white" : "bg-gray-100 text-gray-500"}`}>{t.stat}</span></td>
                            <td className="py-2.5 px-3 text-[10px] leading-tight">{t.interval}</td>
                            <td className={`py-2.5 px-3 font-extrabold text-[10px] ${isCurrentStatus ? "text-[#EA2986]" : "text-gray-700"}`}>{t.perlindungan}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EVALUASI KESEHATAN IBU (COMPLETE ANTI-BOLONG LAYOUT) ─── */}
      {activeMainTab === "evaluasi_kesehatan" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* BARIS HEADER: Identitas Dokter Pemeriksa */}
          <div className="bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">Diisi oleh Dokter</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0"><MdPerson /></div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Nama Dokter</p>
                  <p className="text-sm font-black text-gray-900">{evalDoc.namaDokter}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center text-lg shrink-0"><MdDateRange /></div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Tanggal Periksa</p>
                  <p className="text-sm font-black text-gray-900">{evalDoc.tanggalPeriksa}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center text-lg shrink-0"><MdLocalHospital /></div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Fasilitas Kesehatan</p>
                  <p className="text-sm font-black text-gray-900 truncate">{evalDoc.fasilitasKesehatan}</p>
                </div>
              </div>
            </div>
          </div>

          {/* BARIS 1: Status Imunisasi TD & Antropometri */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Kiri: Status Imunisasi TD */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MdShield className="text-[#EA2986] text-lg" />
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Status Imunisasi TD (Tetanus)</h3>
                    <p className="text-[11px] text-gray-400">Interval pemberian minimal &amp; riwayat proteksi aktif.</p>
                  </div>
                </div>
                
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                        <th className="py-2.5 px-3 text-center">TT</th>
                        <th className="py-2.5 px-3">Selang Waktu</th>
                        <th className="py-2.5 px-3">Perlindungan</th>
                        <th className="py-2.5 px-3 text-center">✔</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-gray-100 bg-white">
                      {IMUNISASI_TD_REF.map((item) => {
                        const isChecked = evalDoc.statusImunisasiTd.currentStatus === item.tt;
                        return (
                          <tr key={item.tt} className={`transition-colors ${isChecked ? "bg-[#EA2986]/5 font-bold text-gray-900" : "text-gray-600 hover:bg-gray-50/40"}`}>
                            <td className="py-2.5 px-3 text-center font-bold">{item.tt}</td>
                            <td className="py-2.5 px-3 text-[11px]">{item.selangWaktu}</td>
                            <td className="py-2.5 px-3 text-[11px] font-semibold">{item.perlindungan}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className={`w-4 h-4 rounded flex items-center justify-center mx-auto transition-all border ${isChecked ? "bg-[#EA2986] border-[#EA2986] text-white" : "bg-gray-50 border-gray-200 text-transparent"}`}>
                                <MdCheck className="w-3 h-3" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-50 mt-4">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Kesimpulan Imunisasi</span>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{evalDoc.statusImunisasiTd.kesimpulan}</p>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Imunisasi Lainnya</span>
                  <p className="text-xs font-bold text-[#EA2986] mt-0.5">{evalDoc.statusImunisasiTd.imunisasiLainnya}</p>
                </div>
              </div>
            </div>

            {/* Kanan: Kondisi Kesehatan Ibu */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MdFitnessCenter className="text-emerald-600 text-lg" />
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Kondisi Kesehatan Ibu</h3>
                    <p className="text-[11px] text-gray-400">Pengukuran antropometri &amp; indeks massa tubuh.</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block mb-0.5">TB (cm)</span>
                    <span className="text-base font-black text-gray-900">{evalDoc.fisik.tb}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block mb-0.5">BB (kg)</span>
                    <span className="text-base font-black text-gray-900">{evalDoc.fisik.bb}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-bold text-gray-400 block mb-0.5">LiLa (cm)</span>
                    <span className="text-base font-black text-gray-900">{evalDoc.fisik.lila}</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2 mt-6">
                <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Status Klasifikasi IMT Medis</span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-black">
                  {["Kurus", "Normal", "Gemuk", "Obesitas"].map((status) => {
                    const isActive = evalDoc.fisik.imtStatus === status;
                    return (
                      <span key={status} className={`py-2 rounded-lg border transition-all ${isActive ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-gray-300 border-gray-100"}`}>
                        {status}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* BARIS 2: Riwayat Penyakit Sekarang vs Penyakit Keluarga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Riwayat Kesehatan Sekarang */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <h3 className="text-sm font-black text-gray-900 flex items-center justify-between">
                    <span>Riwayat Kesehatan Ibu Sekarang</span>
                    <span className="text-[9px] font-bold text-gray-400 tracking-wide uppercase bg-gray-100 px-2 py-0.5 rounded">Skrining</span>
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(evalDoc.riwayatKesehatanSekarang)
                    .filter(([key]) => key !== "lainnya")
                    .map(([key, val]) => (
                      <div key={key} className={`py-2 px-1 border text-center rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 ${
                        val ? "bg-rose-50 border-rose-200 text-rose-700 font-black shadow-2xs text-center items-center flex justify-center" : "bg-gray-50/50 border-gray-100 text-gray-300 opacity-40 text-center items-center flex justify-center"
                      }`}>
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs mt-auto">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Lainnya:</span>
                <p className="font-semibold text-gray-700 mt-0.5">{evalDoc.riwayatKesehatanSekarang.lainnya || "-"}</p>
              </div>
            </div>

            {/* Riwayat Penyakit Keluarga */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <h3 className="text-sm font-black text-gray-900 flex items-center justify-between">
                    <span>Riwayat Penyakit Keluarga</span>
                    <span className="text-[9px] font-bold text-gray-400 tracking-wide uppercase bg-gray-100 px-2 py-0.5 rounded">Genetis</span>
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(evalDoc.riwayatPenyakitKeluarga)
                    .filter(([key]) => key !== "lainnya")
                    .map(([key, val]) => (
                      <div key={key} className={`py-2 px-1 border text-center rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 ${
                        val ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-2xs text-center items-center flex justify-center" : "bg-gray-50/50 border-gray-100 text-gray-300 opacity-40 text-center items-center flex justify-center"
                      }`}>
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs mt-auto">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Lainnya:</span>
                <p className="font-semibold text-gray-700 mt-0.5">{evalDoc.riwayatPenyakitKeluarga.lainnya || "-"}</p>
              </div>
            </div>
          </div>

          {/* BARIS 3: Riwayat Perilaku Berisiko (New Module) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 flex items-center justify-between">
                <span>Riwayat Perilaku Berisiko 1 Bulan Sebelum Hamil</span>
                <span className="text-[9px] font-bold text-gray-400 lowercase italic">lingkari pilihan</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: "Aktivitas fisik kurang", val: (evalDoc as any).riwayatPerilakuBerisiko?.aktivitasFisikKurang },
                { label: "Alkohol", val: (evalDoc as any).riwayatPerilakuBerisiko?.alkohol },
                { label: "Kosmetik Berbahaya", val: (evalDoc as any).riwayatPerilakuBerisiko?.kosmetikBerbahaya },
                { label: "Merokok", val: (evalDoc as any).riwayatPerilakuBerisiko?.merokok },
                { label: "Obat Teratogenik", val: (evalDoc as any).riwayatPerilakuBerisiko?.obatTeratogenik },
                { label: "Pola makan berisiko", val: (evalDoc as any).riwayatPerilakuBerisiko?.polaMakanBerisiko },
              ].map((item, idx) => (
                <div key={idx} className={`py-2 px-2 border text-center rounded-xl text-[11px] font-black tracking-tight transition-all duration-300 flex items-center justify-center min-h-[46px] ${
                  item.val ? "bg-amber-50 border-amber-300 text-amber-800 shadow-2xs font-extrabold" : "bg-gray-50/50 border-gray-100 text-gray-300 opacity-40"
                }`}>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
              <span className="text-[9px] font-bold text-gray-400 block uppercase">Lainnya:</span>
              <p className="font-semibold text-gray-700 mt-0.5">{(evalDoc as any).riwayatPerilakuBerisiko?.lainnya || "-"}</p>
            </div>
          </div>

          {/* BARIS 4: Pemeriksaan Khusus & Riwayat Obstetri Melahirkan (Sejajar Sempurna) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Pemeriksaan Khusus Inspeksi / Inspekulo */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Pemeriksaan Khusus (Inspeksi / Inspekulo)</h3>
                <div className="space-y-2">
                  {[
                    { n: "Porsio", v: evalDoc.pemeriksaanKhusus.porsio },
                    { n: "Uretra", v: evalDoc.pemeriksaanKhusus.uretra },
                    { n: "Vagina", v: evalDoc.pemeriksaanKhusus.vagina },
                    { n: "Vulva", v: evalDoc.pemeriksaanKhusus.vulva },
                    { n: "Fluksus", v: evalDoc.pemeriksaanKhusus.fluksus },
                    { n: "Fluor", v: evalDoc.pemeriksaanKhusus.fluor },
                  ].map((item) => {
                    const isNormal = item.v === "Normal" || item.v === "-";
                    return (
                      <div key={item.n} className="p-2.5 bg-gray-50/50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-500 uppercase">{item.n}</span>
                        <span className={`font-black px-2.5 py-0.5 rounded-md ${
                          isNormal ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-700 bg-rose-50 border border-rose-100"
                        }`}>
                          {item.v === "-" ? "- (Negatif)" : item.v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Riwayat Kehamilan & Proses Melahirkan Terdahulu */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Riwayat Kehamilan dan Proses Melahirkan</h3>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                      <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Tahun</th>
                        <th className="py-2.5 px-3">BB (gram)</th>
                        <th className="py-2.5 px-3">Proses Melahirkan</th>
                        <th className="py-2.5 px-3">Penolong Proses</th>
                        <th className="py-2.5 px-3">Masalah</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs bg-white divide-y divide-gray-100 text-gray-700">
                      {evalDoc.riwayatKehamilanTerdahulu.map((h, i) => (
                        <tr key={i} className="hover:bg-gray-50/30">
                          <td className="py-2.5 px-3 font-bold text-gray-900">{h.no}</td>
                          <td className="py-2.5 px-3">{h.tahun}</td>
                          <td className="py-2.5 px-3 font-black text-[#EA2986]">{h.bbGram ? `${h.bbGram}g` : "-"}</td>
                          <td className="py-2.5 px-3">{h.prosesMelahirkan}</td>
                          <td className="py-2.5 px-3">{h.penolong}</td>
                          <td className={`py-2.5 px-3 font-bold ${h.masalah === "Tidak Ada" ? "text-emerald-600" : "text-rose-600"}`}>{h.masalah}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 3: EVALUASI AWAL DOKTER (INTEGRASI 3 SUB-TABS UTUH & SIMETRIS) ─── */}
      {activeMainTab === "evaluasi_dokter" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SUB-TAB BAR CONTROLS (Disesuaikan dengan 3 Sub-Tabs Pilihanmu) */}
          <div className="bg-gray-100 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-1 border border-gray-200 shadow-xs">
            {[
              { id: "pemeriksaan_tri1", label: "1. Hasil USG & Fisik Trimester 1" },
              { id: "skrining_khusus", label: "2. Skrining Preeklampsia & DM" },
              { id: "pemeriksaan_tri3", label: "3. Hasil USG & Fisik Trimester 3" },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSubTab(sub.id as any)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  activeSubTab === sub.id 
                    ? "bg-white text-gray-900 shadow-xs border border-gray-200/40" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* STAMP IDENTITAS DOKTER PENANGGUNG JAWAB (FULL-WIDTH) */}
          <div className="bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-200 rounded-2xl p-4 flex justify-between items-center text-xs relative overflow-hidden shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0">
                <MdPerson />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Dokter Pemeriksa Utama</p>
                <p className="text-sm font-black text-gray-900">Dr. Rian Syarif, Sp.OG / Dr. Anita R.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Fasilitas Kesehatan</p>
              <p className="text-xs font-bold text-gray-700">RSIA Permata Bunda / Puskesmas Suhat</p>
            </div>
          </div>

          {/* ─── SUB-TAB 1: HASIL USG & FISIK TRIMESTER 1 ─── */}
          {activeSubTab === "pemeriksaan_tri1" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                <span className="text-gray-400 text-lg">ℹ️</span>
                <div className="text-xs text-gray-500 leading-normal">
                  <strong className="text-gray-800">Konsep Klinis:</strong> Anamnesa dan pemeriksaan dokter umum mengenai risiko kehamilan saat ini normal atau kehamilan bermasalah pada usia kehamilan &lt; 12 minggu.
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Kiri: Fisik Keadaan Umum */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full block"/> Pemeriksaan Fisik Keadaan Umum
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: "Konjungtiva Mata", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.konjungtiva, isAlert: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.konjungtiva === "Anemia" },
                        { label: "Sklera Mata", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.sklera, isAlert: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.sklera === "Ikterik" },
                        { label: "Kulit Tubuh", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.kulit },
                        { label: "Leher", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.leher },
                        { label: "Gigi & Mulut", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.gigiMulut },
                        { label: "THT (Telinga Hidung Tenggorokan)", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.tht },
                        { label: "Dada: Organ Jantung", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.jantung },
                        { label: "Dada: Organ Paru", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.paru },
                        { label: "Perut / Abdomen", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.perut },
                        { label: "Tungkai Kaki", val: MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.tungkai },
                      ].map((item, idx) => (
                        <div key={idx} className="p-2 bg-gray-50/50 border border-gray-50 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-500">{item.label}</span>
                          <span className={`font-black px-2.5 py-0.5 rounded ${item.isAlert ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase">Resume Tambahan:</span>
                    <p className="font-semibold text-gray-700 mt-0.5">{MOCK_TRIMESTER_1_DOCTOR.pemeriksaanFisik.keadaanUmum}</p>
                  </div>
                </div>

                {/* Kanan: USG Pokok Trimester 1 */}
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#EA2986] rounded-full block"/> Biometri Diagnostik USG Trimester I
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">Hari Pertama Haid Terakhir (HPHT)</span><span className="font-black text-gray-900">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.hpht}</span></div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">Keteraturan Haid Kehamilan</span><span className="font-black text-[#EA2986]">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.keteraturanHaid}</span></div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">Umur Kehamilan Berdasarkan HPHT</span><span className="font-black text-gray-900">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.umurKehamilanHphtMinggu} Minggu</span></div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">HPL Perkiraan HPHT</span><span className="font-black text-gray-900">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.hplBerdasarkanHpht}</span></div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">Umur Kehamilan Berdasarkan USG</span><span className="font-black text-gray-900">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.umurKehamilanUsgMinggu} Minggu</span></div>
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100"><span className="text-gray-400 block font-bold">HPL Berdasarkan USG</span><span className="font-black text-gray-900">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.hplBerdasarkanUsg}</span></div>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-900 text-[10px] font-bold text-white uppercase">
                          <tr><th className="p-2">Parameter USG</th><th className="p-2">Hasil Ukur</th><th className="p-2">Kesesuaian Usia Kehamilan</th></tr>
                        </thead>
                        <tbody className="text-xs bg-white divide-y divide-gray-50 text-gray-600 font-medium">
                          <tr><td className="p-2.5 font-bold text-gray-900">Jumlah GS (Kantung Janin)</td><td className="p-2.5">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.jumlahGs}</td><td className="p-2.5 text-gray-400">-</td></tr>
                          <tr><td className="p-2.5 font-bold text-gray-900">Diameter GS</td><td className="p-2.5 font-black text-indigo-600">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.diameterGsCm} cm</td><td className="p-2.5 text-[#EA2986] font-bold">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.diameterGsMingguHari}</td></tr>
                          <tr><td className="p-2.5 font-bold text-gray-900">Jumlah Bayi</td><td className="p-2.5">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.jumlahBayi}</td><td className="p-2.5 text-gray-400">-</td></tr>
                          <tr><td className="p-2.5 font-bold text-gray-900">CRL (Crown-Rump Length)</td><td className="p-2.5 font-black text-indigo-600">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.crlCm} cm</td><td className="p-2.5 text-[#EA2986] font-bold">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.crlMingguHari}</td></tr>
                          <tr><td className="p-2.5 font-bold text-gray-900">Letak Produk Kehamilan</td><td className="p-2.5 font-bold text-emerald-600">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.letakProduk}</td><td className="p-2.5 text-gray-400">-</td></tr>
                          <tr><td className="p-2.5 font-bold text-gray-900">Pulsasi Jantung Janin</td><td className="p-2.5 font-bold text-emerald-600">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.pulsasiJantung}</td><td className="p-2.5 text-gray-400">-</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className={`p-3 border rounded-xl text-xs mt-4 ${MOCK_TRIMESTER_1_DOCTOR.usgTri1.kecurigaanTemuanAbnormal.status ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-gray-50 border-gray-100 text-gray-600"}`}>
                    <strong>Kecurigaan Temuan Abnormalitas Janin:</strong> {MOCK_TRIMESTER_1_DOCTOR.usgTri1.kecurigaanTemuanAbnormal.status ? MOCK_TRIMESTER_1_DOCTOR.usgTri1.kecurigaanTemuanAbnormal.sebutkan : "Tidak Ada"}
                  </div>
                </div>
              </div>

              {/* Lampiran Gambar / Memo Catatan Hasil USG */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Hasil USG (Catatan Tambahan Canvas)</h4>
                <p className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-xl leading-relaxed">{MOCK_TRIMESTER_1_DOCTOR.usgTri1.hasilUsgNotes}</p>
              </div>

              {/* Baris Laboratorium & Kesehatan Jiwa */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><span className="w-1.5 h-3.5 bg-purple-600 rounded-full block"/>Pemeriksaan Laboratorium</h3>
                    <span className="text-[10px] font-bold text-gray-400">Tanggal: {MOCK_TRIMESTER_1_DOCTOR.laboratorium.tanggal}</span>
                  </div>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-900 text-[10px] font-bold text-white uppercase">
                        <tr><th className="py-2 px-3">Pemeriksaan</th><th className="py-2 px-3">Hasil</th><th className="py-2 px-3">Rencana Tindak Lanjut</th></tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-gray-50 font-medium text-gray-600 bg-white">
                        <tr><td className="p-2.5 font-bold text-gray-900">Hemoglobin (Hb)</td><td className="p-2.5 font-black">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.hemoglobin} g/dL</td><td className="p-2.5 text-gray-400 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.rtlHemoglobin}</td></tr>
                        <tr><td className="p-2.5 font-bold text-gray-900">Golongan Darah &amp; Rhesus</td><td className="p-2.5 font-black text-indigo-600">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.golDarahRhesus}</td><td className="p-2.5 text-gray-400 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.rtlGolDarah}</td></tr>
                        <tr><td className="p-2.5 font-bold text-gray-900">Gula Darah Sewaktu</td><td className="p-2.5 font-black">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.gulaDarahSewaktu} Mg/dL</td><td className="p-2.5 text-gray-400 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.rtlGds}</td></tr>
                        <tr><td className="p-2.5 font-bold text-gray-900 bg-gray-50/50">Triple Eliminasi: HIV (H)</td><td className="p-2.5 font-black text-emerald-600 bg-gray-50/50">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.hiv}</td><td className="p-2.5 text-gray-400 bg-gray-50/50 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.rtlHiv}</td></tr>
                        <tr><td className="p-2.5 font-bold text-gray-900 bg-gray-50/50">Triple Eliminasi: Sifilis (S)</td><td className="p-2.5 font-black text-emerald-600 bg-gray-50/50">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.sifilis}</td><td className="p-2.5 text-gray-400 bg-gray-50/50 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.rtlSifilis}</td></tr>
                        <tr><td className="p-2.5 font-bold text-gray-900 bg-gray-50/50">Triple Eliminasi: Hepatitis B</td><td className="p-2.5 font-black text-emerald-600 bg-gray-50/50">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.hepB}</td><td className="p-2.5 text-gray-400 bg-gray-50/50 text-[11px]">{MOCK_TRIMESTER_1_DOCTOR.laboratorium.tripleEliminasi.rtlHepB}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><span className="w-1.5 h-3.5 bg-indigo-600 rounded-full block"/>Skrining Kesehatan Jiwa</h3>
                      <span className="text-[10px] font-bold text-gray-400">Tanggal: {MOCK_TRIMESTER_1_DOCTOR.skriningJiwa.tanggal}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Skrining Kesehatan Jiwa</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-md">{MOCK_TRIMESTER_1_DOCTOR.skriningJiwa.skriningJiwaStatus}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Tindak Lanjut Hasil Skrining</span>
                        <div className="flex gap-1 text-[10px] font-black">
                          {["Edukasi", "Konseling"].map(item => (
                            <span key={item} className={`px-2 py-0.5 rounded border ${MOCK_TRIMESTER_1_DOCTOR.skriningJiwa.tindakLanjut === item ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-300 border-gray-100"}`}>{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Perlu Rujukan Medis?</span>
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-md">{MOCK_TRIMESTER_1_DOCTOR.skriningJiwa.perluRujukan}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#EA2986]/5 border border-[#EA2986]/20 rounded-2xl shadow-xs space-y-1 mt-4">
                    <span className="text-[9px] text-[#EA2986] font-black uppercase tracking-wider block">
                      Kesimpulan &amp; Rekomendasi
                    </span>
                    <p className="text-xs font-bold text-gray-800 leading-relaxed">
                      {MOCK_TRIMESTER_1_DOCTOR.kesimpulan}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SUB-TAB 2: SKRINING PREEKLAMPSIA & DIABETES GESTASIONAL ─── */}
          {activeSubTab === "skrining_khusus" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Peringatan Klinis Utama Kemenkes */}
              <div className="p-4  bg-slate-600 border border-slate-700 rounded-2xl flex items-start gap-3 shadow-2xs">
                <div className="w-5 h-5 rounded-full border-2 border-white text-white flex items-center justify-center shrink-0 font-bold text-xs">!</div>
                <div className="text-xs text-white leading-relaxed font-medium">
                  Jika ibu berisiko preeklampsia maka pemeriksaan kehamilan, proses melahirkan dan pemeriksaan nifas dilaksanakan di Rumah Sakit. Lakukan rujukan terencana pada ibu hamil dengan kondisi yang disebutkan di bawah (tidak perlu menunggu inpartu). <span className="text-[10px] text-slate-300 block mt-0.5">Umur kehamilan &lt; 20 minggu.</span>
                </div>
              </div>

              {/* LAYOUT GRID BERSEBELAHAN */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                
                {/* KOLOM KIRI: Matriks Tabel Skrining Preeklampsia */}
                <div className="xl:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-purple-600 rounded-full block"/> Kriteria Skrining Risiko Preeklampsia
                      </h3>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-3/5">Kriteria</th>
                            <th className="py-2.5 px-3 text-center border-l border-gray-700">Risiko Sedang</th>
                            <th className="py-2.5 px-3 text-center border-l border-gray-700">Risiko Tinggi</th>
                            <th className="py-2.5 px-3 text-center border-l border-gray-700">✔</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs bg-white text-gray-700 font-medium">
                          {[
                            { type: "header", label: "Anamnesis" },
                            { label: "Multipara Dengan Kehamilan oleh Pasangan Baru", risk: "sedang", status: false },
                            { label: "Kehamilan dengan Teknologi Reproduksi Berbantu: Bayi Tabung, Obat Induksi Ovulasi", risk: "sedang", status: false },
                            { label: "Umur ≥ 35 Tahun", risk: "sedang", status: false },
                            { label: "Nulipara", risk: "sedang", status: true },
                            { label: "Multipara yang Jarak Kehamilan Sebelumnya > 10 Tahun", risk: "sedang", status: false },
                            { label: "Riwayat Preeklampsia pada Ibu atau Saudara Perempuan", risk: "sedang", status: false },
                            { label: "Obesitas Sebelum Hamil (IMT > 30 kg/m2)", risk: "sedang", status: false },
                            { label: "Multipara Dengan Riwayat Preeklampsia Sebelumnya", risk: "tinggi", status: false },
                            { label: "Kehamilan Multipel", risk: "tinggi", status: false },
                            { label: "Diabetes dalam Kehamilan", risk: "tinggi", status: false },
                            { label: "Hipertensi Kronik", risk: "tinggi", status: false },
                            { label: "Penyakit Ginjal", risk: "tinggi", status: false },
                            { label: "Penyakit Autoimun, SLE", risk: "tinggi", status: false },
                            { label: "Anti Phospholipid Syndrome*", risk: "tinggi", status: false },
                            { type: "header", label: "Pemeriksaan Fisik" },
                            { label: "Mean Arterial Presure > 90 mmHg **", risk: "sedang", status: false },
                            { label: "Proteinuria (Urin Celup > +1 pada 2x Pemeriksaan Berjarak 6 Jam atau Segera Kuantitatif 300 mg/24 Jam)", risk: "sedang", status: false },
                          ].map((item, idx) => {
                            if (item.type === "header") {
                              return (
                                <tr key={idx} className="bg-gray-100 font-black text-gray-900 border-b border-gray-200">
                                  <td colSpan={4} className="px-3 py-2.5 uppercase text-[10px] tracking-wider text-gray-600">
                                    {item.label}
                                  </td>
                                </tr>
                              );
                            }

                            const isChecked = item.status;
                            const isSedang = item.risk === "sedang";
                            const isTinggi = item.risk === "tinggi";

                            return (
                              <tr key={idx} className={`transition-colors border-b border-gray-100 ${isChecked ? "bg-rose-50" : "hover:bg-gray-50/40"}`}>
                                <td className={`p-2.5 leading-snug border-r border-gray-100 ${isChecked ? "font-bold text-rose-900" : "text-gray-700"}`}>
                                  {item.label}
                                </td>
                                <td className={`p-2.5 text-center border-r border-gray-100 ${isSedang ? (isChecked ? "text-[#EA2986] font-black" : "text-gray-400 font-bold") : "bg-gray-50/50"}`}>
                                  {isSedang ? "✓" : ""}
                                </td>
                                <td className={`p-2.5 text-center border-r border-gray-100 ${isTinggi ? (isChecked ? "text-[#EA2986] font-black" : "text-gray-400 font-bold") : "bg-rose-50/30"}`}>
                                  {isTinggi ? "✓" : ""}
                                </td>
                                <td className="p-2.5 text-center">
                                  <div className={`w-4 h-4 mx-auto border rounded flex items-center justify-center transition-colors ${isChecked ? "bg-[#EA2986] border-[#EA2986] text-white" : "border-gray-300 bg-gray-50 text-transparent"}`}>
                                    <MdCheck className="w-3 h-3" />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Keterangan Kaki Catatan Matriks */}
                  <div className="text-[10px] text-gray-500 font-medium leading-relaxed pt-4 border-t border-gray-100 mt-4 space-y-1">
                    <p>* **Manifestasi Klinis APS Antara Lain:** Keguguran Berulang, IUFD, Kelahiran Prematur.</p>
                    <p>** **MAP dihitung pada Kehamilan &lt; 20 Minggu:** MAP = ((2 &times; Diastolik) + Sistolik) / 3</p>
                  </div>
                  
                  {/* Box Kesimpulan Rujukan */}
                  <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-800 font-semibold leading-relaxed">
                      Ibu hamil dilakukan rujukan bila ditemukan sedikitnya:
                      <ul className="mt-1 space-y-0.5 ml-1">
                        <li className="flex items-center gap-1.5"><div className="w-3 h-2 border border-gray-400 bg-white"/> 2 risiko sedang dan atau,</li>
                        <li className="flex items-center gap-1.5"><div className="w-3 h-2 border border-rose-300 bg-rose-100"/> 1 risiko tinggi</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      Kesimpulan: Risiko Rendah. Tidak perlu rujukan terencana ke faskes rujukan.
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: DMG & Catatan */}
                <div className="xl:col-span-5 flex flex-col gap-6 justify-between">
                  {/* Skrining Diabetes Melitus Gestasional (Usia 24 - 28 Minggu) */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-2">
                      <h3 className="text-sm font-black text-gray-900">Skrining Diabetes Melitus Gestasional pada Usia Kehamilan 24 - 28 Minggu</h3>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                            <th className="py-2.5 px-3">Pemeriksaan</th>
                            <th className="py-2.5 px-3 text-center border-l border-gray-700">Hasil</th>
                            <th className="py-2.5 px-3 border-l border-gray-700">Rencana Tindak Lanjut</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs bg-white divide-y divide-gray-100 text-gray-600 font-medium">
                          <tr className="hover:bg-gray-50/40">
                            <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">Gula Darah Puasa</td>
                            <td className="p-2.5 text-center font-black text-gray-800 border-r border-gray-100">88 g/dL</td>
                            <td className="p-2.5 text-[11px] text-gray-400">Normal, diet sehat</td>
                          </tr>
                          <tr className="hover:bg-gray-50/40">
                            <td className="p-2.5 font-bold text-gray-900 border-r border-gray-100">Gula Darah 2 Jam Post Prandial</td>
                            <td className="p-2.5 text-center font-black text-gray-800 border-r border-gray-100">124 g/dL</td>
                            <td className="p-2.5 text-[11px] text-gray-400">Normal</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                      <span>Tanggal Periksa: 14/02/2026</span>
                      <span className="font-bold">Dokter Pemeriksa: Dr. Rian Syarif</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SUB-TAB 3: HASIL USG & FISIK TRIMESTER 3 ─── */}
          {activeSubTab === "pemeriksaan_tri3" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-3">
                <span className="text-gray-400 text-lg">ℹ️</span>
                <div className="text-xs text-gray-500 leading-normal">
                  <strong className="text-gray-800">Konsep Klinis:</strong> Anamnesa dan pemeriksaan dokter umum mengenai risiko kehamilan masa tua / lanjut saat mendekati proses persalinan (Umur Kehamilan 32 - 36 minggu).
                </div>
              </div>

              {/* BARIS 1: Pemeriksaan Fisik vs Detail Parameter USG Trimester 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Kiri: Fisik Keadaan Umum */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full block"/> Pemeriksaan Fisik Keadaan Umum
                    </h3>
                    <div className="space-y-1.5">
                      {Object.entries(MOCK_TRIMESTER_3_DOCTOR.pemeriksaanFisik)
                        .filter(([k]) => k !== "keadaanUmum")
                        .map(([key, val]) => {
                          const isAlert = val === "Anemia" || val === "Ikterik" || val === "Tidak normal";
                          return (
                            <div key={key} className="p-2 bg-gray-50/50 border border-gray-50 rounded-xl flex justify-between items-center text-xs">
                              <span className="font-semibold text-gray-400 uppercase tracking-tight text-[10px]">{key}</span>
                              <span className={`font-black px-2 py-0.5 rounded ${isAlert ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{val}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase">Keadaan Umum:</span>
                    <p className="font-semibold text-gray-700 mt-0.5">{MOCK_TRIMESTER_3_DOCTOR.pemeriksaanFisik.keadaanUmum}</p>
                  </div>
                </div>

                {/* Kanan: USG & Tabel Biometri Janin Trimester III */}
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-3.5 bg-[#EA2986] rounded-full block"/> USG Trimester III
                    </h3>

                    {/* Indikator Prasyarat & Evaluasi Selisih UK */}
                    <div className="p-3 bg-[#EA2986]/5 border border-[#EA2986]/10 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">USG Trimester III telah dilakukan:</span>
                        <span className="px-2 py-0.5 bg-[#EA2986] text-white font-black rounded text-[10px]">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.dilakukan}*</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600 font-medium">
                        <li>Bila ya, Umur Kehamilan saat ini berdasarkan USG Trimester I: <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.ukBerdasarkanTri1 ?? ".........."} minggu.</span></li>
                        <li>Bila tidak dan haid teratur, umur kehamilan saat ini berdasarkan HPHT: <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.ukBerdasarkanHpht ?? ".........."} minggu.</span></li>
                      </ul>
                      <div className="pt-2 border-t border-[#EA2986]/10 space-y-1.5">
                        <p className="text-gray-700 font-bold">Umur Kehamilan berdasarkan biometri bayi USG Trimester III: <span className="text-indigo-600 font-black">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.ukBerdasarkanBiometriUsg ?? ".........."} minggu.</span></p>
                        <p className="text-gray-700 leading-normal font-medium">Apakah terdapat selisih 3 minggu atau lebih diantara UK USG Trimester I/HPHT dengan UK USG Trimester III: <span className="px-1.5 py-0.5 bg-gray-200 text-gray-800 font-black rounded text-[10px]">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.selisihTigaMinggu}*</span></p>
                      </div>
                    </div>

                    {/* Matriks Parameter Tabel USG Buku KIA */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                            <th className="py-2 px-3 w-1/3">Kriteria Pemeriksaan</th>
                            <th className="py-2 px-3" colSpan={2}>Hasil Ukur Klinis &amp; Kesesuaian</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Jumlah bayi</td>
                            <td className="p-2.5" colSpan={2}>{MOCK_TRIMESTER_3_DOCTOR.usgTri3.jumlahBayi}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Letak bayi</td>
                            <td className="p-2.5" colSpan={2}>{MOCK_TRIMESTER_3_DOCTOR.usgTri3.letakBayi}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Presentasi bayi</td>
                            <td className="p-2.5 text-indigo-600 font-black" colSpan={2}>{MOCK_TRIMESTER_3_DOCTOR.usgTri3.presentasiJanin}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Keadaan bayi</td>
                            <td className="p-2.5" colSpan={2}>
                              {MOCK_TRIMESTER_3_DOCTOR.usgTri3.keadaanJanin}, DJJ: <span className="font-black text-emerald-600">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.djjBpm ?? ".........."} X/m</span> (normal)
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Lokasi Plasenta</td>
                            <td className="p-2.5" colSpan={2}>{MOCK_TRIMESTER_3_DOCTOR.usgTri3.lokasiPlasenta}</td>
                          </tr>
                          
                          {/* 1. Modul Jumlah Cairan Ketuban dengan Tooltip SDP */}
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Jumlah Cairan Ketuban</td>
                            <td className="p-2.5" colSpan={2}>
                              <span 
                                title="Single Deepest Pocket Cairan Ketuban" 
                                className="underline decoration-dashed cursor-help font-bold text-gray-600"
                              >
                                SDP
                              </span>
                              : <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.cairanKetubanSdpCm ?? ".........."} cm</span>, {MOCK_TRIMESTER_3_DOCTOR.usgTri3.cairanKetubanStatus}
                            </td>
                          </tr>
                          
                          {/* 2. Modul Biometri Bayi dengan Tooltip BPD, HC, AC, FL, dan EFW */}
                          <tr>
                            <td className="p-2.5 font-bold text-gray-900 bg-gray-50/30" rowSpan={5}>Biometri bayi</td>
                            <td className="p-2 border-r border-gray-100">
                              <span title="Biparietal Diameter / Jarak tulang parietal kepala" className="underline decoration-dashed cursor-help font-bold text-gray-600">BPD</span>
                              : <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.bpdCm ?? "....."} cm</span>
                            </td>
                            <td className="p-2 font-bold text-indigo-600">sesuai: {MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.bpdMinggu ?? "....."} minggu</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-gray-100">
                              <span title="Head Circumference / Lingkar dada" className="underline decoration-dashed cursor-help font-bold text-gray-600">HC</span>
                              : <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.hcCm ?? "....."} cm</span>
                            </td>
                            <td className="p-2 font-bold text-indigo-600">sesuai: {MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.hcMinggu ?? "....."} minggu</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-gray-100">
                              <span title="Abdominal Circumference / Lingkar perut" className="underline decoration-dashed cursor-help font-bold text-gray-600">AC</span>
                              : <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.acCm ?? "....."} cm</span>
                            </td>
                            <td className="p-2 font-bold text-indigo-600">sesuai: {MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.acMinggu ?? "....."} minggu</td>
                          </tr>
                          <tr>
                            <td className="p-2 border-r border-gray-100">
                              <span title="Femur Length / Panjang tulang paha" className="underline decoration-dashed cursor-help font-bold text-gray-600">FL</span>
                              : <span className="font-black text-gray-900">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.flCm ?? "....."} cm</span>
                            </td>
                            <td className="p-2 font-bold text-indigo-600">sesuai: {MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.flMinggu ?? "....."} minggu</td>
                          </tr>
                          <tr className="bg-pink-50/10">
                            <td className="p-2 border-r border-gray-100">
                              <span title="Estimates Fetal Weight / Taksiran Berat bayi" className="underline decoration-dashed cursor-help font-bold text-gray-900">EFW/TBJ</span>
                              : <span className="font-black text-[#EA2986]">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.efwGram ?? "....."} gram</span>
                            </td>
                            <td className="p-2 font-black text-indigo-600">sesuai: {MOCK_TRIMESTER_3_DOCTOR.usgTri3.biometri.efwMinggu ?? "....."} minggu</td>
                          </tr>

                          <tr>
                            <td className="p-2.5 font-bold text-gray-900">Kecurigaan Temuan Abnormal</td>
                            <td className="p-2.5" colSpan={2}>
                              {MOCK_TRIMESTER_3_DOCTOR.usgTri3.kecurigaanAbnormal.status ? "Ya" : "Tidak"} {MOCK_TRIMESTER_3_DOCTOR.usgTri3.kecurigaanAbnormal.status && `, Sebutkan: ${MOCK_TRIMESTER_3_DOCTOR.usgTri3.kecurigaanAbnormal.sebutkan}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Canvas Lampiran Catatan USG */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Hasil USG (Catatan Tambahan Canvas)</span>
                <p className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 p-3.5 rounded-xl leading-relaxed">{MOCK_TRIMESTER_3_DOCTOR.usgTri3.hasilUsgNotes}</p>
              </div>

              {/* BARIS 2: Laboratorium & Rencana Persalinan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Lab */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5"><span className="w-1.5 h-3.5 bg-purple-600 rounded-full block"/>Pemeriksaan Laboratorium &amp; Jiwa</h3>
                    <span className="text-[10px] font-bold text-gray-400">Tanggal: {MOCK_TRIMESTER_3_DOCTOR.laboratorium.tanggal}</span>
                  </div>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs"><thead className="bg-gray-900 text-[10px] text-white"><tr><th className="p-2.5">Pemeriksaan</th><th className="p-2.5">Hasil</th><th className="p-2.5">Rencana Tindak Lanjut</th></tr></thead><tbody className="divide-y divide-gray-50 font-medium text-gray-600 bg-white">
                      <tr><td className="p-2.5 font-bold text-gray-900">Hemoglobin</td><td className="p-2.5 font-black">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.hemoglobin} g/dL</td><td className="p-2.5 text-gray-400">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.rtlHb}</td></tr>
                      <tr><td className="p-2.5 font-bold text-gray-900">Protein Urin</td><td className="p-2.5 font-black">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.proteinUrin || "Negatif"}</td><td className="p-2.5 text-gray-400">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.rtlProtein}</td></tr>
                      <tr><td className="p-2.5 font-bold text-gray-900">Urin Reduksi</td><td className="p-2.5 font-black">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.urinReduksi || "Negatif"}</td><td className="p-2.5 text-gray-400">{MOCK_TRIMESTER_3_DOCTOR.laboratorium.rtlReduksi}</td></tr>
                    </tbody></table>
                  </div>

                  <div className="pt-2 space-y-2">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wide">Skrining Kesehatan Jiwa Berkala</h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-black">
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100"><span className="text-gray-400 block font-bold text-[9px]">Skrining Jiwa</span><span className="text-gray-800">{MOCK_TRIMESTER_3_DOCTOR.skriningJiwa.status}</span></div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100"><span className="text-gray-400 block font-bold text-[9px]">Tindak Lanjut</span><span className="text-gray-800">{MOCK_TRIMESTER_3_DOCTOR.skriningJiwa.tindakLanjut}</span></div>
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100"><span className="text-gray-400 block font-bold text-[9px]">Perlu Rujukan</span><span className="text-gray-800">{MOCK_TRIMESTER_3_DOCTOR.skriningJiwa.perluRujukan}</span></div>
                    </div>
                  </div>
                </div>

                {/* Kanan: Rencana Proses Persalinan & Pasca Salin (Opsi Badge Terbuka) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Rencana Persalinan &amp; KB Pasca Salin</h3>
                    
                    {/* Module 1: Rencana Konsultasi Lanjut */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">Rencana Konsultasi Lanjut</span>
                      <div className="flex flex-wrap gap-1">
                        {["Gizi", "Kebidanan", "Anak", "Penyakit Dalam", "Neurologi", "THT", "Psikiatri", "Lain-lain"].map((opsi) => {
                          const isActive = MOCK_TRIMESTER_3_DOCTOR.rencanaKonsultasiLanjut === opsi;
                          return (
                            <span
                              key={opsi}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black border transition-all ${
                                isActive
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                  : "bg-gray-50 text-gray-400 border-gray-100"
                              }`}
                            >
                              {opsi}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 2: Rencana Proses Melahirkan */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">Rencana Proses Melahirkan</span>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-black">
                        {["Normal", "Pervaginam berbantu", "Sectio caesaria"].map((m) => {
                          const isActive = MOCK_TRIMESTER_3_DOCTOR.rencanaProsesMelahirkan === m;
                          return (
                            <span 
                              key={m} 
                              className={`py-1.5 rounded-md border transition-all ${
                                isActive 
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" 
                                  : "bg-gray-50 text-gray-400 border-gray-100"
                              }`}
                            >
                              {m}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module 3: Pilihan Rencana Kontrasepsi & Konseling */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">Pilihan Rencana Kontrasepsi</span>
                        <div className="flex flex-wrap gap-1">
                          {["AKDR", "Pil", "Suntik", "Steril", "MAL", "Implan", "Belum memilih"].map((kb) => {
                            const isActive = MOCK_TRIMESTER_3_DOCTOR.pilihanKontrasepsi === kb;
                            return (
                              <span
                                key={kb}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                  isActive
                                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                    : "bg-gray-50 text-gray-400 border-gray-100"
                                }`}
                              >
                                {kb}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wide">Kebutuhan Konseling KB</span>
                        <div className="flex gap-1">
                          {["Ya", "Tidak"].map((status) => {
                            const isActive = MOCK_TRIMESTER_3_DOCTOR.konselingKb === status;
                            return (
                              <span
                                key={status}
                                className={`px-3 py-1 rounded text-[10px] font-black border transition-all ${
                                  isActive
                                    ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                                    : "bg-gray-50 text-gray-400 border-gray-100"
                                }`}
                              >
                                {status}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* BARIS MODULE TERPISAH: Penjelasan vs Kesimpulan Akhir Rujukan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Modul Penjelasan Medis */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-1">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Penjelasan Klinis</span>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed">
                    Kondisi kepala janin sudah masuk Pintu Atas Panggul (PAP). Seluruh persiapan dokumen persalinan, donor darah pendukung, dan transportasi darurat puskesmas telah divalidasi lengkap.
                  </p>
                </div>

                {/* 2. Modul Kesimpulan Rekomendasi Tempat Melahirkan (Warna Rose Cerah) */}
                <div className="p-4 bg-[#EA2986]/5 border border-[#EA2986]/20 rounded-2xl shadow-2xs space-y-1">
                  <span className="text-[9px] text-[#EA2986] font-black uppercase tracking-wider block">Kesimpulan Tempat Persalinan</span>
                  <p className="text-xs font-black text-gray-900 leading-relaxed">
                    Kesimpulan: Rekomendasi Tempat Proses Melahirkan: <span className="underline decoration-2 text-[#EA2986]">FKTP</span> / <span className="line-through text-gray-300">FKRTL</span> (Puskesmas Siap Melayani).
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ─── PEMASANGAN BLOK TAB 4: CATATAN PELAYANAN KESEHATAN IBU ─── */}
      {activeMainTab === "catatan_pelayanan" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Penyaring Trimester / Grafik Pemantauan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Modul Pelayanan &amp; Pemantauan Berkala
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: 1, label: "Catatan Trimester 1" },
                { id: 2, label: "Catatan Trimester 2" },
                { id: 3, label: "Catatan Trimester 3" },
                { id: "grafik", label: "Grafik & Peningkatan BB" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedLogTrimester(sub.id as any)}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    selectedLogTrimester === sub.id
                      ? "bg-white text-gray-900 shadow-xs border border-gray-200/40"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kondisi Jika Memilih Lembar Tabel Kronologis Trimester 1, 2, atau 3 */}
          {selectedLogTrimester !== "grafik" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Catatan Pelayanan Kesehatan Ibu Trimester {selectedLogTrimester}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Histori tindakan medis, keluhan klinis, dan saran berkala dari buku KIA.</p>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Diisi oleh Tenaga Kesehatan
                </span>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/4">Tanggal Periksa, Stamp &amp; Paraf</th>
                      <th className="py-3 px-4 w-2/4">Keluhan, Pemeriksaan, Tindakan dan Saran</th>
                      <th className="py-3 px-4 text-center w-1/4">Tanggal Kembali</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs bg-white divide-y divide-gray-100 text-gray-700 font-medium">
                    {MOCK_LOG_PELAYANAN.filter(log => log.trimester === selectedLogTrimester).length > 0 ? (
                      MOCK_LOG_PELAYANAN
                        .filter(log => log.trimester === selectedLogTrimester)
                        .map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-4 px-4 align-top">
                              <p className="font-black text-gray-900 text-sm">{row.tanggalPeriksa}</p>
                              <span className="text-[10px] text-emerald-600 font-bold block mt-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md self-start inline-block">
                                {row.parafTenagaKesehatan}
                              </span>
                            </td>
                            <td className="py-4 px-4 leading-relaxed text-gray-600 align-top whitespace-pre-line">
                              {row.keluhanDanTindakan}
                            </td>
                            <td className="py-4 px-4 text-center align-top font-black text-[#EA2986] text-sm">
                              {row.tanggalKembali}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-400 italic">
                          Belum ada histori log pelayanan kesehatan untuk Trimester {selectedLogTrimester}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── SUB-TAB 4: GRAFIK PEMANTAUAN KIA (INTERACTIVE HIGHLIGHT LINES) ─── */}
          {selectedLogTrimester === "grafik" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* BENTO ROW 1: Dua Grafik Utama Buku KIA */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                
                {/* GRAPH A: Grafik Evaluasi Kehamilan (Halaman 107) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-[#EA2986] rounded-full block"/> Grafik Evaluasi Kehamilan
                      </h3>
                      <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">Halaman 107</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Klik label di bawah untuk memfokuskan visualisasi tren garis medis tertentu.</p>
                  </div>

                  {/* CUSTOM INTERACTIVE LEGEND - GRAFIK EVALUASI */}
                  <div className="flex flex-wrap gap-2 justify-center mt-4 text-[11px] font-black">
                    {[
                      { id: "djj", label: "DJJ Bayi", color: "text-[#EA2986] bg-pink-50 border-pink-200" },
                      { id: "tfu", label: "TFU Rahim", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
                      { id: "sistole", label: "Tensi Sistole", color: "text-red-600 bg-red-50 border-red-200" },
                      { id: "diastole", label: "Tensi Diastole", color: "text-blue-600 bg-blue-50 border-blue-200" },
                    ].map((item) => {
                      const isAnyFocused = focusGarisEvaluasi !== null;
                      const isMeFocused = focusGarisEvaluasi === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFocusGarisEvaluasi(isMeFocused ? null : item.id)}
                          className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                            !isAnyFocused 
                              ? item.color 
                              : isMeFocused 
                              ? `${item.color} ring-2 ring-offset-1 ring-gray-400 font-black scale-105` 
                              : "bg-gray-50 text-gray-300 border-gray-100 opacity-40 line-through"
                          }`}
                        >
                          ● {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Chart Canvas Area */}
                  <div className="w-full h-80 mt-4 text-[9px] font-bold overflow-x-auto">
                    <div className="min-w-[600px] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_DATA_GRAFIK_KIA} margin={{ top: 20, right: -5, left: -25, bottom: 15 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="minggu" type="number" domain={[8, 42]} ticks={ticksEvaluasi} interval={0} tickLine={true} />
                          <YAxis yAxisId="left" domain={[30, 180]} tickCount={16} />
                          <YAxis yAxisId="right" orientation="right" domain={[5, 45]} tickCount={9} />
                          
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border border-[#EA2986]/30 p-3 rounded-xl text-[11px] space-y-1 shadow-md font-medium text-gray-800">
                                    <p className="font-black text-[#EA2986] border-b border-rose-100 pb-1 mb-1 text-xs">Minggu {data.minggu} Gestasi</p>
                                    <p className="text-gray-500">🗓️ Tanggal: <span className="text-gray-900 font-bold">{data.tanggal}</span></p>
                                    <p className="text-gray-500">🧑‍⚕️ Pemeriksa: <span className="text-gray-900 font-bold">{data.pemeriksa}</span></p>
                                    {data.djj && <p className="text-[#EA2986] font-bold">❤️ DJJ Janin: {data.djj} x/menit</p>}
                                    {data.tfu && <p className="text-indigo-600 font-bold">📏 TFU Ibu: {data.tfu} cm</p>}
                                    <p className="text-gray-700 font-semibold">Tensi: {data.sistole}/{data.diastole} mmHg</p>
                                    <p className="text-gray-700">💓 Nadi: {data.nadi} bpm</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          <ReferenceLine yAxisId="right" x={20} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
                          <ReferenceLine yAxisId="left" y={140} stroke="#e11d48" strokeWidth={1} strokeDasharray="3 3" />
                          <ReferenceLine yAxisId="left" y={90} stroke="#b91c1c" strokeWidth={1} strokeDasharray="3 3" />

                          {/* Dinamis Opacity Garis Evaluasi */}
                          <Line yAxisId="left" type="monotone" dataKey="djj" stroke="#EA2986" strokeWidth={3} connectNulls activeDot={{ r: 6 }} opacity={focusGarisEvaluasi === null || focusGarisEvaluasi === "djj" ? 1 : 0.1} />
                          <Line yAxisId="right" type="monotone" dataKey="tfu" stroke="#4f46e5" strokeWidth={3} connectNulls opacity={focusGarisEvaluasi === null || focusGarisEvaluasi === "tfu" ? 1 : 0.1} />
                          <Line yAxisId="left" type="monotone" dataKey="sistole" stroke="#dc2626" strokeWidth={1.5} dot={{ r: 2 }} opacity={focusGarisEvaluasi === null || focusGarisEvaluasi === "sistole" ? 1 : 0.1} />
                          <Line yAxisId="left" type="monotone" dataKey="diastole" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 2 }} opacity={focusGarisEvaluasi === null || focusGarisEvaluasi === "diastole" ? 1 : 0.1} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Grafik Peningkatan Berat Badan (Halaman 108) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full block"/> Grafik Kenaikan Berat Badan Ibu
                      </h3>
                      <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">Halaman 108</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Klik label di bawah untuk menyorot batasan arsir IMT sesuai Buku KIA.</p>
                  </div>

                  {/* CUSTOM INTERACTIVE LEGEND - GRAFIK BERAT BADAN */}
                  <div className="flex flex-wrap gap-2 justify-center mt-4 text-[11px] font-black">
                    {[
                      { id: "kurus", label: "Batas Kurus (<18.5)", color: "text-gray-900 bg-gray-100 border-gray-300" },
                      { id: "normal", label: "Batas Normal (18.5-24.9)", color: "text-pink-600 bg-pink-50 border-pink-200" },
                      { id: "gemuk", label: "Batas Gemuk (25-29.9)", color: "text-purple-600 bg-purple-50 border-purple-200" },
                      { id: "obesitas", label: "Batas Obesitas (>30)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                      { id: "aktif", label: "Kenaikan BB Aktif", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
                    ].map((item) => {
                      const isAnyFocused = focusGarisBB !== null;
                      const isMeFocused = focusGarisBB === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFocusGarisBB(isMeFocused ? null : item.id)}
                          className={`px-3 py-1 rounded-full border transition-all cursor-pointer ${
                            !isAnyFocused 
                              ? item.color 
                              : isMeFocused 
                              ? `${item.color} ring-2 ring-offset-1 ring-gray-400 font-black scale-105` 
                              : "bg-gray-50 text-gray-300 border-gray-100 opacity-40 line-through"
                          }`}
                        >
                          ● {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Chart Canvas Area */}
                  <div className="w-full h-80 mt-4 text-[9px] font-bold overflow-x-auto">
                    <div className="min-w-[600px] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_DATA_GRAFIK_KIA} margin={{ top: 20, right: 10, left: -25, bottom: 15 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis dataKey="minggu" type="number" domain={[0, 42]} ticks={ticksBeratBadan} interval={0} tickLine={true} />
                          <YAxis domain={[-3, 23]} tickCount={27} />
                          
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border border-emerald-200 p-3 rounded-xl text-[11px] space-y-1 shadow-md font-medium text-gray-800">
                                    <p className="font-black text-emerald-600 border-b border-emerald-100 pb-1 mb-1 text-xs">Minggu {data.minggu} Gestasi</p>
                                    <p className="text-gray-500">🗓️ Tanggal: <span className="text-gray-900 font-bold">{data.tanggal}</span></p>
                                    <p className="text-gray-500">🧑‍⚕️ Pemeriksa: <span className="text-gray-900 font-bold">{data.pemeriksa}</span></p>
                                    <p className="text-emerald-600 font-black text-xs pt-0.5 border-t border-gray-100 mt-1">📈 Kenaikan BB: +{data.bbPeningkatan} kg</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          {/* Shaded Area Awal Trimester 1 */}
                          <Line type="monotone" dataKey="awalMax" stroke="#9ca3af" strokeWidth={0} fill="#e5e7eb" fillOpacity={focusGarisBB === null ? 0.6 : 0.05} legendType="none" />
                          
                          {/* Jalur Kurva Garis dengan Pengkondisian Opacity Interaktif */}
                          <Line type="monotone" dataKey="kurusMax" stroke="#111827" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} opacity={focusGarisBB === null || focusGarisBB === "kurus" ? 1 : 0.1} />
                          <Line type="monotone" dataKey="normalMax" stroke="#f472b6" strokeWidth={2} dot={false} activeDot={false} opacity={focusGarisBB === null || focusGarisBB === "normal" ? 1 : 0.1} />
                          <Line type="monotone" dataKey="gemukMax" stroke="#db2777" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} opacity={focusGarisBB === null || focusGarisBB === "gemuk" ? 1 : 0.1} />
                          <Line type="monotone" dataKey="obesitasMax" stroke="#059669" strokeWidth={2} dot={false} activeDot={false} opacity={focusGarisBB === null || focusGarisBB === "obesitas" ? 1 : 0.1} />

                          {/* Batas Bawah Area Arsir */}
                          <Line type="monotone" dataKey="normalMin" stroke="#f472b6" strokeWidth={1} strokeDasharray="2 2" dot={false} activeDot={false} legendType="none" opacity={focusGarisBB === null || focusGarisBB === "normal" ? 1 : 0.1} />
                          <Line type="monotone" dataKey="obesitasMin" stroke="#059669" strokeWidth={1} strokeDasharray="2 2" dot={false} activeDot={false} legendType="none" opacity={focusGarisBB === null || focusGarisBB === "obesitas" ? 1 : 0.1} />

                          {/* Garis Data Realitas Kunjungan Ibu */}
                          <Line type="monotone" dataKey="bbPeningkatan" stroke="#4f46e5" strokeWidth={3.5} dot={{ r: 3.5, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} opacity={focusGarisBB === null || focusGarisBB === "aktif" ? 1 : 0.1} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>

              {/* BENTO ROW 2: Histori Log Petugas Medis & Box Catatan Penjelasan */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Log Otoritas Pemeriksa Mingguan</h4>
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                          <th className="p-2 px-3">UK (Wk)</th>
                          <th className="p-2 px-3">Tanggal Periksa</th>
                          <th className="p-2 px-3">Tensi &amp; Nadi</th>
                          <th className="p-2 px-3">Tenaga Kesehatan / Pemeriksa</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-gray-100 text-gray-600 bg-white font-medium">
                        {MOCK_DATA_GRAFIK_KIA.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/40">
                            <td className="p-2 px-3 font-bold text-gray-900">{row.minggu} Wk</td>
                            <td className="p-2 px-3 text-gray-500">{row.tanggal}</td>
                            <td className="p-2 px-3 font-semibold text-gray-800">{row.sistole}/{row.diastole} <span className="text-[10px] font-normal text-gray-400">({row.nadi} bpm)</span></td>
                            <td className="p-2 px-3"><span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-[10px] font-bold">{row.pemeriksa}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 bg-[#EA2986]/5 border border-[#EA2986]/20 rounded-2xl shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#EA2986] font-black uppercase tracking-wider block">
                      Penjelasan Hasil Grafik
                    </span>
                    <p className="text-xs font-bold text-gray-800 leading-relaxed whitespace-pre-line">
                      Seluruh titik koordinat denyut jantung janin (DJJ) dan tinggi fundus uteri (TFU) berkembang normal secara linier di dalam kurva rujukan klinis. 
                      
                      Garis tren tekanan darah (Sistole/Diastole) terpantau stabil berada di bawah garis batas waspada rujukan merah (140/90 mmHg), menepis risiko indikasi preeklampsia gestasional harian.
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-400 italic pt-2 border-t border-[#EA2986]/10 mt-3 flex justify-between items-center">
                    <span>* Sesuai Standar Kemenkes RI</span>
                    <span className="font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-3xs">Halaman 107-108</span>
                  </div>
                </div>
              </div>

              {/* Glosarium Medis Buku KIA */}
              <div className="text-[9px] text-gray-400 font-medium leading-normal space-y-1 pt-2 border-t border-gray-200">
                <p>• **Glosarium:** **DJJ**: Denyut Jantung bayi, **SDP**: Jarak Terdalam Kantung Ketuban, **BPD**: Biparietal Diameter (jarak tulang parietal kepala), **HC**: Head Circumference (lingkar kepala), **AC**: Abdominal Circumference (lingkar perut), **PL**: Femur Length (panjang tulang paha), **EFW**: Estimates Fetal Weight / TBU (Taksiran Berat bayi).</p>
                <p>• **\***: Menandakan pilihan opsi kondisional yang dilingkari/disesuaikan oleh Tenaga Kesehatan.</p>
              </div>

            </div>
          )}
        </div>
      )}
      
      {/* ─── KONDISI KONTEN TAB BARU: PERSALINAN & KELAHIRAN ─── */}
      {activeMainTab === "persalinan" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Selector internal untuk membagi berkas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Lembar Berkas Persalinan &amp; Bayi Baru Lahir
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: "rencana", label: "Menyambut Proses Melahirkan" },
                { id: "ringkasan", label: "Ringkasan Pelayanan Ibu & Bayi" },
                { id: "keterangan_lahir", label: "Surat Keterangan Lahir" },
                { id: "riwayat_partus", label: "Riwayat & Cap Kaki Bayi" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActivePersalinanSubTab(sub.id as any)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                    activePersalinanSubTab === sub.id
                      ? "bg-white text-gray-900 shadow-xs border border-gray-200/40"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* DOCUMENT 1: MENYAMBUT PROSES MELAHIRKAN */}
          {activePersalinanSubTab === "rencana" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Sektor Kiri: Diisi Oleh Ibu (5 Kolom) */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-black text-gray-900">Pernyataan &amp; Kepercayaan Ibu</h3>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">Diisi Oleh Ibu</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
                    <p className="text-gray-400 font-bold uppercase text-[9px]">Nama Lengkap Ibu Hamil:</p>
                    <p className="font-black text-gray-900 text-sm">Adristy Nityasa Anggun Saraswati</p>
                    <p className="text-gray-400 font-bold uppercase text-[9px] mt-2">Perkiraan Waktu Persalinan:</p>
                    <p className="font-bold text-indigo-600">Bulan: September, Tahun: 2026</p>
                  </div>
                </div>
              </div>

              {/* Sektor Kanan: Rencana Fasilitas & Logistik (7 Kolom) */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-black text-gray-900">Fasyankes &amp; Kesiapan Donor Transportasi</h3>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">Diisi Oleh Nakes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 border rounded-xl"><span className="text-gray-400 block font-bold text-[9px]">Fasyankes Utama</span><span className="font-black">Bidan Widya - Puskesmas Suhat</span></div>
                  <div className="p-3 bg-gray-50 border rounded-xl"><span className="text-gray-400 block font-bold text-[9px]">Pembiayaan Dana</span><span className="font-black text-emerald-600">JKN / BPJS Kesehatan</span></div>
                </div>
                {/* Ambulan & Kendaraan Desa */}
                <div className="p-3.5 border border-gray-100 rounded-xl space-y-2">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Kontak Kendaraan / Ambulan Desa</span>
                  <div className="text-xs font-bold text-gray-800 space-y-1">
                    <p>1. Bp. Ahmad (Avanza Desa) — <span className="text-gray-500 font-mono">0812-3456-7890</span></p>
                    <p>2. Ambulan Siaga Puskesmas — <span className="text-gray-500 font-mono">0812-9988-7766</span></p>
                  </div>
                </div>
                {/* Sumbangan Darah */}
                <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <span className="text-[10px] text-rose-700 font-black uppercase tracking-wide block">Kesiapan Calon Pendonor Darah (Golongan Darah O+)</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-700 mt-1.5">
                    <div>• Rey (0822-1122-3344)</div>
                    <div>• Esti (0822-5566-7788)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT 2: RINGKASAN PELAYANAN PROSES MELAHIRKAN */}
          {activePersalinanSubTab === "ringkasan" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-900">Ringkasan Pelayanan Ibu Bersalin, Nifas &amp; Bayi Baru Lahir</h3>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">Tenaga Kesehatan</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Blok Kondisi Ibu */}
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3 text-xs">
                  <h4 className="font-black text-gray-900 border-b pb-1.5 uppercase tracking-wide text-[10px] text-gray-400">Data Ibu Bersalin &amp; Nifas</h4>
                  <div className="space-y-1.5 font-medium">
                    <p>⏱️ **Waktu Melahirkan:** 14/09/2026 - Pukul 04:30 WIB</p>
                    <p>📏 **Umur Kehamilan:** 39 Minggu</p>
                    <p>🧑‍⚕️ **Penolong:** Dokter Spesialis Kebidanan (Sp.OG)</p>
                    <p>🩺 **Cara Melahirkan:** Normal / Spontan Pervaginam</p>
                    <p>❤️ **Keadaan Ibu:** Sehat, Perdarahan normal post-partum</p>
                    <p>💊 **KB Pasca Melahirkan:** AKDR IUD Post-Placenta Terpasang</p>
                  </div>
                </div>

                {/* Blok Kondisi Bayi Saat Lahir */}
                <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl space-y-3 text-xs">
                  <h4 className="font-black text-gray-900 border-b pb-1.5 uppercase tracking-wide text-[10px] text-gray-400">Kondisi Bayi Saat Lahir &amp; Asuhan</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-gray-700">
                    <div className="bg-white p-2 border rounded-lg">⚖️ Berat: 3200 gram</div>
                    <div className="bg-white p-2 border rounded-lg">📏 Panjang: 50 cm</div>
                    <div className="bg-white p-2 border rounded-lg">👶 Kepala: 34 cm</div>
                    <div className="bg-white p-2 border rounded-lg">🧬 Kelamin: Laki-laki</div>
                  </div>
                  {/* Checkbox status tindakan bayi baru lahir */}
                  <div className="pt-2 grid grid-cols-2 gap-1.5 text-[10px] font-black text-emerald-800">
                    <span className="flex items-center gap-1">✓ Segera Menangis</span>
                    <span className="flex items-center gap-1">✓ Tubuh Kemerahan</span>
                    <span className="flex items-center gap-1">✓ IMT 1 Jam Pertama</span>
                    <span className="flex items-center gap-1">✓ Injeksi Vitamin K1</span>
                    <span className="flex items-center gap-1">✓ Salep Mata Antibiotik</span>
                    <span className="flex items-center gap-1">✓ Imunisasi HB0 Done</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT 3: SURAT KETERANGAN LAHIR */}
          {activePersalinanSubTab === "keterangan_lahir" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="text-center border-b border-gray-100 pb-3">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">SURAT KETERANGAN LAHIR</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">No. SKL: 474.1/112/Pusk-Sht/IX/2026</p>
              </div>
              <div className="text-xs space-y-4 max-w-3xl mx-auto">
                <p className="leading-relaxed font-medium text-gray-600">
                  Yang bertandatangan di bawah ini, menerangkan bahwa pada hari **Senin**, Tanggal **14 September 2026**, Pukul **04:30 WIB**, telah lahir seorang bayi **Tunggal** berjenis kelamin **Laki-laki**, Anak ke-**1**, Usia gestasi **39 minggu**, dengan Berat Lahir **3200 gram**, Panjang Badan **50 cm**, di **Puskesmas Suhat, Kota Malang**.
                </p>
                
                {/* Data Orang Tua */}
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Data Kependudukan Orang Tua</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold text-gray-700">
                    <div>👩‍👦 **Nama Ibu:** Ny. Esti Rosana (Sample)</div>
                    <div>👨‍👦 **Nama Ayah:** Tn. Mochamad Wildani Azizi</div>
                    <div>📍 **Alamat:** Lowokwaru, Kota Malang</div>
                    <div>💼 **Pekerjaan Ayah:** Informatics Engineer</div>
                  </div>
                </div>
                
                {/* Stamp Legitimasi */}
                <div className="pt-4 flex justify-between items-center border-t border-gray-100 text-[10px] text-gray-400 font-medium">
                  <div>Saksi I: Rey (Hub Group Hub)</div>
                  <div className="text-right font-bold text-gray-700">Mengesahkan Fasyankes: ( ✓ Puskesmas Suhat Verified )</div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT 4: RIWAYAT PROSES MELAHIRKAN & CAP KAKI BAYI */}
          {activePersalinanSubTab === "riwayat_partus" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Paritas G P A & Catatan Pemeriksaan (6 Kolom) */}
              <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Riwayat Paritas &amp; Catatan Tindakan</h3>
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-900 text-center tracking-widest">
                    STATUS OBSTETRI: G1 P1 A0
                  </div>
                  <div className="border border-gray-100 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y font-medium text-gray-700">
                        <tr><td className="p-2.5 font-bold bg-gray-50 w-1/3">Taksiran Lahir</td><td className="p-2.5">Sesuai HPL September 2026</td></tr>
                        <tr><td className="p-2.5 font-bold bg-gray-50">Fasyankes</td><td className="p-2.5">Kamar Bersalin Utama Puskesmas</td></tr>
                        <tr><td className="p-2.5 font-bold bg-gray-50">Rujukan</td><td className="p-2.5 text-gray-400">Tidak Ada (Partus Normal Lancar)</td></tr>
                        <tr><td className="p-2.5 font-bold bg-gray-50">IMD</td><td className="p-2.5 text-emerald-600 font-bold">✓ Berhasil Dilaksanakan &gt; 1 Jam</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Tempat Cap Kaki Bayi (6 Kolom) */}
              <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[250px]">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-900">Dokumentasi Cap Kaki Bayi Baru Lahir</h3>
                  <p className="text-[11px] text-gray-400">Lembar otentikasi biometrik telapak kaki bayi saat lahir (Halaman 115).</p>
                </div>
                {/* Kotak Canvas/Frame Penampung Gambar Cap Kaki */}
                <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl mt-4 flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-400 text-xs">
                  <span className="text-2xl mb-1">👣</span>
                  <span className="font-bold text-gray-700">Cap Kaki Kiri &amp; Kanan Bayi</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">(Tersimpan Secara Digital di Database Fasyankes)</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── KONDISI KONTEN TAB BARU: KESEHATAN NIFAS ─── */}
      {activeMainTab === "nifas" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-Tabs Selector Masa Nifas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
            <span className="text-[10px] font-black text-[#EA2986] uppercase tracking-wider block px-2 mb-2">
              Pilih Modul &amp; Berkas Pemeriksaan Masa Nifas (KF 1 - KF 4)
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl">
              {[
                { id: "ringkasan", label: "Matriks Ringkasan Nifas" },
                { id: "perawatan", label: "Checklist Perawatan Nifas" },
                { id: "rujukan", label: "Lembar Rujukan Medis" },
                { id: "log_pelayanan", label: "Log Pelayanan Nifas" },
              ].map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveNifasSubTab(sub.id as any)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${activeNifasSubTab === sub.id ? "bg-white text-gray-900 shadow-xs border border-gray-200/40" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* DOKUMEN 1: MATRIKS RINGKASAN PELAYANAN NIFAS */}
          {activeNifasSubTab === "ringkasan" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-black text-gray-900">Ringkasan Pelayanan Nifas (6 Jam - 42 Hari Setelah Bersalin)</h3>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">Tenaga Kesehatan</span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider text-center">
                        <th className="py-2.5 px-3 text-left w-1/5">Catatan Pemeriksaan</th>
                        <th className="py-2.5 px-3 border-l border-gray-700 w-1/5">KF 1 (6 - 48 Jam)</th>
                        <th className="py-2.5 px-3 border-l border-gray-700 w-1/5">KF 2 (3 - 7 Hari)</th>
                        <th className="py-2.5 px-3 border-l border-gray-700 w-1/5">KF 3 (8 - 28 Hari)</th>
                        <th className="py-2.5 px-3 border-l border-gray-700 w-1/5">KF 4 (29 - 42 Hari)</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs bg-white text-gray-700 font-medium divide-y divide-gray-100">
                      <tr><td className="p-2.5 font-bold bg-gray-50">Tanggal &amp; Tempat</td><td className="p-2.5 text-center">15/09/2026<br/><span className="text-[10px] text-gray-400">Puskesmas</span></td><td className="p-2.5 text-center">19/09/2026<br/><span className="text-[10px] text-gray-400">Puskesmas</span></td><td className="p-2.5 text-center">02/10/2026<br/><span className="text-[10px] text-gray-400">Puskesmas</span></td><td className="p-2.5 text-center">20/10/2026<br/><span className="text-[10px] text-gray-400">Puskesmas</span></td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Periksa Payudara (ASI)</td><td className="p-2.5 text-center text-emerald-600 font-bold">Normal, Keluar</td><td className="p-2.5 text-center text-emerald-600 font-bold">Normal, Lancar</td><td className="p-2.5 text-center text-emerald-600 font-bold">Normal, Cukup</td><td className="p-2.5 text-center text-emerald-600 font-bold">Normal, Produktif</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Periksa Perdarahan</td><td className="p-2.5 text-center">Normal (Lokhian)</td><td className="p-2.5 text-center">Normal (Serosa)</td><td className="p-2.5 text-center">Normal (Alba)</td><td className="p-2.5 text-center">Berhenti (-)</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Periksa Jalan Lahir</td><td className="p-2.5 text-center text-gray-500">Proses Penyembuhan</td><td className="p-2.5 text-center text-emerald-600 font-bold">Kering / Baik</td><td className="p-2.5 text-center text-emerald-600 font-bold">Sembuh Sempurna</td><td className="p-2.5 text-center text-emerald-600 font-bold">Sembuh Total</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Vitamin A</td><td className="p-2.5 text-center font-black text-[#EA2986]">Kapsul ke-1 Done</td><td className="p-2.5 text-center font-black text-[#EA2986]">Kapsul ke-2 Done</td><td className="p-2.5 text-center text-gray-400">-</td><td className="p-2.5 text-center text-gray-400">-</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">KB Pasca Melahirkan</td><td className="p-2.5 text-center text-indigo-600 font-bold">IUD Terpasang</td><td className="p-2.5 text-center text-gray-400">Evaluasi Posisi</td><td className="p-2.5 text-center text-gray-400">Evaluasi Posisi</td><td className="p-2.5 text-center text-emerald-600 font-bold">Aman / Efektif</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Skrining Jiwa</td><td className="p-2.5 text-center">Tidak Berisiko</td><td className="p-2.5 text-center">Tidak Berisiko</td><td className="p-2.5 text-center">Tidak Berisiko</td><td className="p-2.5 text-center">Tidak Berisiko</td></tr>
                      <tr><td className="p-2.5 font-bold bg-gray-50">Konseling &amp; Kasus</td><td className="p-2.5 text-center text-gray-400">KIE Personal Higiene</td><td className="p-2.5 text-center text-gray-400">KIE ASI Eksklusif</td><td className="p-2.5 text-center text-gray-400">KIE Nutrisi Ibu Busui</td><td className="p-2.5 text-center text-gray-400">KIE Stimulasi Bayi</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── PEMBARUAN: PEMISAHAN KESIMPULAN & CATATAN REKOMENDASI NIFAS ─── */}
              <div className="space-y-4">
                
                {/* 1. KANVAS UTAMA: KESIMPULAN AKHIR MASA NIFAS */}
                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-5">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Kesimpulan Akhir Masa Nifas (Kondisi &amp; Skrining Komplikasi)
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Menampilkan seluruh indikator status kesehatan pasca-salin. Badge redup menandakan kondisi tidak terpenuhi.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Klaster Keadaan Ibu */}
                    <div className="space-y-2 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Keadaan Ibu *</span>
                      <div className="flex flex-wrap gap-1">
                        {["Sehat", "Sakit", "Meninggal"].map((status) => {
                          const isActive = status === "Sehat";
                          return (
                            <span
                              key={status}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black border transition-all ${
                                isActive
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                  : "bg-white text-gray-300 border-gray-100 select-none"
                              }`}
                            >
                              {status}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Klaster Keadaan Bayi */}
                    <div className="space-y-2 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Keadaan Bayi *</span>
                      <div className="flex flex-wrap gap-1">
                        {["Sehat", "Sakit", "Kelainan Bawaan", "Meninggal"].map((status) => {
                          const isActive = status === "Sehat";
                          return (
                            <span
                              key={status}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black border transition-all ${
                                isActive
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                  : "bg-white text-gray-300 border-gray-100 select-none"
                              }`}
                            >
                              {status}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Klaster Masalah Nifas */}
                    <div className="space-y-2 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Masalah Nifas *</span>
                      <div className="flex flex-wrap gap-1">
                        {["Pendarahan", "Infeksi", "Hipertensi", "Lainnya"].map((masalah) => {
                          const isActive = false; 
                          return (
                            <span
                              key={masalah}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black border transition-all ${
                                isActive
                                  ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                                  : "bg-white text-gray-300 border-gray-100 select-none"
                              }`}
                            >
                              {masalah}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wide">Kesimpulan Tertulis Nakes:</span>
                      <p className="text-xs font-bold text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                        Masa nifas berjalan dengan normal tanpa adanya penyulit klinis. Seluruh proses involusi uteri (pengerutan rahim) kembali ke bentuk semula secara optimal, pengeluaran cairan lokhia bersih sesuai fasenya, dan tanda vital Ibu stabil dalam batas aman selama 42 hari penuh.
                      </p>
                    </div>
                  </div>
                </div>

                

                {/* 2. KANVAS TERPISAH: CATATAN REKOMENDASI MEDIS (Aksen Rose Lembut) */}
                <div className="p-4 bg-[#EA2986]/5 border border-[#EA2986]/20 rounded-2xl shadow-2xs space-y-1.5">
                  <span className="text-[9px] text-[#EA2986] font-black uppercase tracking-wider block">
                    Catatan Rekomendasi Medis
                  </span>
                  <p className="text-xs font-bold text-gray-800 leading-relaxed">
                    Pastikan bayi mendapat pelayanan kesehatan neonatal (KN) secara rutin dan catat hasil pemeriksaan pada lembar anak. Keseluruhan fase nifas 42 hari selesai dengan indikator klinis prima.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ─── DOKUMEN 2: PERAWATAN IBU NIFAS (CHECKLIST & DETAIL NASIHAT) ─── */}
          {activeNifasSubTab === "perawatan" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Grid Atas: Evaluasi Tindakan Medis Nifas Wajib */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Pelayanan Kesehatan Ibu Nifas</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Evaluasi checklist pemenuhan indikator pemeriksaan klinis per kunjungan (KF 1 - KF 4).</p>
                </div>
                
                <div className="space-y-2">
                  {[
                    "Menanyakan kondisi ibu nifas secara umum",
                    "Pengukuran tekanan darah, suhu tubuh, pernapasan, dan nadi",
                    "Pemeriksaan lokhia dan perdarahan jalan lahir",
                    "Pemeriksaan kondisi jalan lahir dan tanda infeksi",
                    "Pemeriksaan kontraksi rahim dan tinggi fundus uteri (TFU)",
                    "Pemeriksaan payudara dan anjuran pemberian ASI Eksklusif",
                    "Pemberian kapsul vitamin A (2 kapsul)",
                    "Pelayanan kontrasepsi pasca proses melahirkan",
                    "Skrining Kesehatan Jiwa",
                    "Konseling KIE perawatan nifas mandiri",
                    "Tatalaksana pada ibu nifas sakit atau ibu nifas dengan masalah",
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50/60 border border-gray-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-gray-700">{index + 1}. {item}</span>
                      <div className="flex gap-1 text-[9px] font-black text-white">
                        <span className="px-2 py-0.5 bg-pink-500 rounded-md shadow-3xs">✓ KF 1</span>
                        <span className="px-2 py-0.5 bg-amber-500 rounded-md shadow-3xs">✓ KF 2</span>
                        <span className="px-2 py-0.5 bg-lime-600 rounded-md shadow-3xs">✓ KF 3</span>
                        <span className="px-2 py-0.5 bg-blue-600 rounded-md shadow-3xs">✓ KF 4</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Bawah: Edukasi Nasihat Perawatan Mandiri Terbuka */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Edukasi &amp; Nasihat Perawatan Ibu Nifas Mandiri</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {[
                    { title: "🥗 Nutrisi & Gizi Busui", desc: "Makan makanan beraneka ragam mengandung karbohidrat, protein hewani, nabati, sayur, dan buah." },
                    { title: "💧 Kebutuhan Air Minum", desc: "6 bulan pertama minimal 14 gelas sehari. 6 bulan kedua minimal 12 gelas harian." },
                    { title: "🧼 Higiene & Kebersihan", desc: "Menjaga kebersihan diri dan area kemaluan, serta ganti pembalut sesering mungkin." },
                    { title: "🛌 Istirahat Terencana", desc: "Istirahat yang cukup, saat bayi tidur pastikan Ibu juga ikut beristirahat." },
                    { title: "🏃‍♀️ Aktivitas Fisik Ringan", desc: "Senam nifas/aktivitas intensitas ringan 30 menit, frekuensi 3-5 kali seminggu." },
                    { title: "🤱 Perawatan ASI & KB", desc: "Cara menyusui yang benar, berikan ASI Eksklusif 6 bulan, dan konsultasi KB." },
                  ].map((nasihat, idx) => (
                    <div key={idx} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                      <span className="font-black text-gray-950 block">{nasihat.title}</span>
                      <p className="text-gray-500 leading-relaxed font-medium text-[11px]">{nasihat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── DOKUMEN 3: LEMBAR RUJUKAN MEDIS NIFAS (SLOT BERKAS) ─── */}
          {activeNifasSubTab === "rujukan" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                {[1, 2].map((slot) => (
                  <div key={slot} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl">Slot Rekam Rujukan {slot}</div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-3.5 bg-red-600 rounded-full block"/> Berkas Rujukan Klinis Nifas
                      </h3>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wide">Rujukan (Resume Hasil Pemeriksaan &amp; Tatalaksana FKTP)</span>
                          <p className="font-bold text-gray-700 leading-relaxed whitespace-pre-line">
                            {slot === 1 
                              ? "Ibu nifas dengan riwayat hipertensi gestasional pasca-salin. Tekanan darah di FKTP terpantau 145/95 mmHg pada hari ke-3. Dilakukan tatalaksana awal pemberian antihipertensi dan dirujuk ke FKRTL untuk evaluasi syok/preeklampsia nifas." 
                              : "Belum ada data rekam rujukan aktif untuk lembar berkas kasus kedua."}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wide">Rujukan Balik (Resume Pemeriksaan &amp; Tatalaksana FKRTL)</span>
                          <p className="font-bold text-gray-700 leading-relaxed whitespace-pre-line">
                            {slot === 1 
                              ? "Kondisi teratasi. Diagnosis akhir: Hipertensi postpartum terkontrol. Terapi pulang: Methyldopa 3x250mg. Rekomendasi kontrol berkala tensi di Puskesmas/Bidan desa terdekat." 
                              : "Belum ada berkas feedback dari Rumah Sakit rujukan."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] font-black">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-600">🏥 Rekomendasi Faskes: <span className="text-indigo-600">{slot === 1 ? "FKRTL (Coret FKTP)" : "-"}</span></div>
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-600 text-right">🗓️ Tgl/Bln/Th: <span className="text-gray-900">{slot === 1 ? "17/09/2026" : "-"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── DOKUMEN 4: CATATAN PELAYANAN KESEHATAN NIFAS (LOG CHRONOLOGICAL) ─── */}
          {activeNifasSubTab === "log_pelayanan" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Catatan Pelayanan Kesehatan Nifas</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Histori urutan tanggal periksa berkala, keluhan klinis tindakan, dan rencana kontrol kembali.</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Buku KIA Halaman 117
                </span>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-2xs overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-900 text-[10px] font-extrabold text-white uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/4">Tanggal Periksa, Stamp &amp; Paraf</th>
                      <th className="py-3 px-4 w-2/4">Keluhan, Pemeriksaan, Tindakan dan Saran</th>
                      <th className="py-3 px-4 text-center w-1/4">Tanggal Kembali</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs bg-white text-gray-700 font-medium divide-y divide-gray-100">
                    {[
                      {
                        tgl: "15 Sep 2026",
                        nakes: "Bidan Widya, A.Md.Keb",
                        detail: "Pemeriksaan KF 1 (6-48 jam). Ibu mengeluh mules ringan pada perut bagian bawah (kondisi fisiologis kontraksi rahim). TFU teraba 2 jari di bawah pusat, kontraksi rahim baik dan keras. Perdarahan lokhia rubra normal merah segar. Diberikan KIE mobilisasi dini, nutrisi menyusui, serta pemberian suplemen vitamin A dosis pertama.",
                        kembali: "19 Sep 2026"
                      },
                      {
                        tgl: "19 Sep 2026",
                        nakes: "Bidan Widya, A.Md.Keb",
                        detail: "Pemeriksaan KF 2 (3-7 hari). Tidak ada keluhan demam/pusing. Pengeluaran lokhia sanguinolenta berwarna kecokelatan dalam batas normal. ASI keluar lancar pada kedua payudara, bayi menyusu dengan baik tanpa luka lecet puting. Diberikan vitamin A dosis kedua. Edukasi personal higiene kebersihan jalan lahir.",
                        kembali: "02 Okt 2026"
                      },
                      {
                        tgl: "02 Okt 2026",
                        nakes: "Dr. Anita Rahmawati",
                        detail: "Pemeriksaan KF 3 (8-28 hari). Kontrol pasca rujukan balik tensi. Tekanan darah stabil 118/78 mmHg, keluhan nyeri kepala disangkal. Involusi uteri berjalan optimal, lokhia serosa kekuningan. Ibu meminum rutin obat maintenance faskes lanjutan. Motivasi ASI Eksklusif dilanjutkan.",
                        kembali: "20 Okt 2026"
                      }
                    ].map((log, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-4 align-top">
                          <p className="font-black text-gray-900 text-sm">{log.tgl}</p>
                          <span className="text-[9px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded block mt-1 inline-block">
                            {log.nakes}
                          </span>
                        </td>
                        <td className="p-4 leading-relaxed text-gray-600 align-top whitespace-pre-line">
                          {log.detail}
                        </td>
                        <td className="p-4 text-center font-black text-[#EA2986] text-sm align-top">
                          {log.kembali}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}