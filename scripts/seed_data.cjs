/**
 * seed_data.cjs
 * Menambahkan 22 anak/balita + ibu-ibu dengan berbagai kategori
 * ke database tanpa menghapus data akun sistem (KADER, NAKES, IBU-DEFAULT)
 *
 * Jalankan: node scripts/seed_data.cjs
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────
const ago = (years = 0, months = 0, days = 0) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() - days);
  return d;
};

const future = (months = 0, days = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() + days);
  return d;
};

// ─── DATA IBU ────────────────────────────────────────────────────
// 12 ibu dengan beragam kategori:
//   - Ibu Balita  (punya anak, sudah melahirkan)
//   - Ibu Hamil   (sedang hamil, ada yg punya anak sebelumnya)
//   - Ibu Nifas   (baru melahirkan, 0-42 hari)
//   - Calon Ibu   (menikah, belum punya anak, belum hamil)
const MOTHERS = [
  // ── IBU BALITA ──────────────────────────────────────────────────
  {
    national_id: "3578-001-010190-001",
    mother_name: "Siti Rahayu",
    password: "ibu123",
    birth_date: ago(30),
    husband_name: "Agus Setiawan",
    phone_number: "0812-1111-0001",
    blood_type: "O",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Kenanga No.1, RT 01",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 2,
    children_born_alive: 2,
    pregnancy_number: 2,
    husband_occupation: "Wiraswasta",
    husband_phone_number: "0813-1111-0001",
  },
  {
    national_id: "3578-001-050592-002",
    mother_name: "Dewi Lestari",
    password: "ibu123",
    birth_date: ago(28),
    husband_name: "Rudi Hartono",
    phone_number: "0812-1111-0002",
    blood_type: "A",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Kenanga No.3, RT 01",
    occupation: "Ibu Rumah Tangga",
    education: "D3",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "PNS",
    husband_phone_number: "0813-1111-0002",
  },
  {
    national_id: "3578-001-120893-003",
    mother_name: "Rina Susanti",
    password: "ibu123",
    birth_date: ago(32),
    husband_name: "Budi Prasetyo",
    phone_number: "0812-1111-0003",
    blood_type: "B",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Melati No.5, RT 02",
    occupation: "Pedagang",
    education: "SMA",
    number_of_children: 3,
    children_born_alive: 3,
    pregnancy_number: 3,
    husband_occupation: "Buruh",
    husband_phone_number: "0813-1111-0003",
  },
  {
    national_id: "3578-001-290791-004",
    mother_name: "Yuni Astuti",
    password: "ibu123",
    birth_date: ago(34),
    husband_name: "Hendra Santoso",
    phone_number: "0812-1111-0004",
    blood_type: "AB",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Mawar No.2, RT 02",
    occupation: "Ibu Rumah Tangga",
    education: "SMP",
    number_of_children: 2,
    children_born_alive: 2,
    pregnancy_number: 3,
    miscarriage_history: 1,
    husband_occupation: "Sopir",
    husband_phone_number: "0813-1111-0004",
  },
  {
    national_id: "3578-001-070296-005",
    mother_name: "Fitri Handayani",
    password: "ibu123",
    birth_date: ago(29),
    husband_name: "Deni Kurniawan",
    phone_number: "0812-1111-0005",
    blood_type: "O",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Kenanga No.8, RT 03",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Karyawan Swasta",
    husband_phone_number: "0813-1111-0005",
  },

  // ── IBU HAMIL ───────────────────────────────────────────────────
  {
    national_id: "3578-001-150394-006",
    mother_name: "Lilis Suryani",
    password: "ibu123",
    birth_date: ago(32),
    husband_name: "Wahyu Santoso",
    phone_number: "0812-1111-0006",
    blood_type: "A",
    ui_status: "Ibu Hamil",
    risk_status: "Normal",
    estimated_due_date: future(2, 10),  // HPL ~2.5 bln lagi (TM3 ~34 mgg)
    address: "Jl. Melati No.10, RT 03",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 2,
    husband_occupation: "TNI",
    husband_phone_number: "0813-1111-0006",
  },
  {
    national_id: "3578-001-200195-007",
    mother_name: "Nurul Hidayah",
    password: "ibu123",
    birth_date: ago(31),
    husband_name: "Faisal Ramadhan",
    phone_number: "0812-1111-0007",
    blood_type: "O",
    ui_status: "Ibu Hamil",
    risk_status: "Risiko Tinggi",
    estimated_due_date: future(1, 15),  // HPL ~6 mgg lagi (TM3 ~38 mgg)
    address: "Jl. Mawar No.4, RT 03",
    occupation: "Ibu Rumah Tangga",
    education: "SMP",
    number_of_children: 0,
    children_born_alive: 0,
    pregnancy_number: 1,
    husband_occupation: "Buruh",
    husband_phone_number: "0813-1111-0007",
    disease_history: "Hipertensi",
  },
  {
    national_id: "3578-001-030298-008",
    mother_name: "Anggi Permata",
    password: "ibu123",
    birth_date: ago(28),
    husband_name: "Rio Firmansyah",
    phone_number: "0812-1111-0008",
    blood_type: "B",
    ui_status: "Ibu Hamil",
    risk_status: "Normal",
    estimated_due_date: future(4),     // TM2 ~20 mgg
    address: "Jl. Kenanga No.12, RT 04",
    occupation: "Guru",
    education: "S1",
    number_of_children: 0,
    children_born_alive: 0,
    pregnancy_number: 1,
    husband_occupation: "Dokter",
    husband_phone_number: "0813-1111-0008",
  },
  {
    national_id: "3578-001-110589-009",
    mother_name: "Sri Wahyuni",
    password: "ibu123",
    birth_date: ago(37),
    husband_name: "Joko Susilo",
    phone_number: "0812-1111-0009",
    blood_type: "A",
    ui_status: "Ibu Hamil",
    risk_status: "Risiko Tinggi",
    estimated_due_date: future(3),     // TM2 ~26 mgg, usia ibu >35
    address: "Jl. Melati No.6, RT 04",
    occupation: "Pedagang",
    education: "SD",
    number_of_children: 3,
    children_born_alive: 3,
    pregnancy_number: 5,
    miscarriage_history: 1,
    husband_occupation: "Tukang",
    husband_phone_number: "0813-1111-0009",
    disease_history: "Anemia, riwayat operasi caesar",
  },

  // ── IBU NIFAS ───────────────────────────────────────────────────
  {
    national_id: "3578-001-221193-010",
    mother_name: "Mega Wulandari",
    password: "ibu123",
    birth_date: ago(32),
    husband_name: "Aris Munandar",
    phone_number: "0812-1111-0010",
    blood_type: "O",
    ui_status: "Ibu Nifas",
    risk_status: "Normal",
    address: "Jl. Kenanga No.15, RT 05",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 2,
    children_born_alive: 2,
    pregnancy_number: 2,
    husband_occupation: "Karyawan Swasta",
    husband_phone_number: "0813-1111-0010",
  },
  {
    national_id: "3578-001-040296-011",
    mother_name: "Putri Ramadhani",
    password: "ibu123",
    birth_date: ago(29),
    husband_name: "Andika Pratama",
    phone_number: "0812-1111-0011",
    blood_type: "B",
    ui_status: "Ibu Nifas",
    risk_status: "Normal",
    address: "Jl. Mawar No.9, RT 05",
    occupation: "Ibu Rumah Tangga",
    education: "D3",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Polisi",
    husband_phone_number: "0813-1111-0011",
  },

  // ── CALON IBU ───────────────────────────────────────────────────
  {
    national_id: "3578-001-180200-012",
    mother_name: "Anisa Rahma",
    password: "ibu123",
    birth_date: ago(24),
    husband_name: "Bayu Setiawan",
    phone_number: "0812-1111-0012",
    blood_type: "A",
    ui_status: "Calon Ibu",
    risk_status: "Normal",
    address: "Jl. Kenanga No.20, RT 06",
    occupation: "Mahasiswi",
    education: "S1",
    number_of_children: 0,
    children_born_alive: 0,
    pregnancy_number: 0,
    husband_occupation: "Karyawan IT",
    husband_phone_number: "0813-1111-0012",
  },
  {
    national_id: "3578-001-250199-013",
    mother_name: "Riska Amelia",
    password: "ibu123",
    birth_date: ago(26),
    husband_name: "Fahri Maulana",
    phone_number: "0812-1111-0013",
    blood_type: "O",
    ui_status: "Calon Ibu",
    risk_status: "Normal",
    address: "Jl. Melati No.14, RT 06",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 0,
    children_born_alive: 0,
    pregnancy_number: 0,
    husband_occupation: "Wiraswasta",
    husband_phone_number: "0813-1111-0013",
  },
];

// ─── DATA ANAK ───────────────────────────────────────────────────
// 22 anak, distribusi usia beragam: neonatus, 0-6 bln, 6-12 bln,
// 12-24 bln, 2-3 thn, 3-4 thn, 4-5 thn, 5-6 thn
// Tiap entri punya motherNationalId → link ke ibu
const CHILDREN = [
  // ── Siti Rahayu (2 anak) ────────────────────────────────────────
  {
    motherNationalId: "3578-001-010190-001",
    national_id: "3578-CH-001",
    child_name: "Muhammad Farhan Setiawan",
    gender: "L",
    birth_date: ago(0, 0, 18),   // 18 hari (neonatus)
    birth_weight: 3.1,
    birth_length: 49,
    current_weight: 3.4,
    current_height: 50,
    birth_order: 2,
    blood_type: "O",
    birth_place: "Puskesmas Kenanga",
  },
  {
    motherNationalId: "3578-001-010190-001",
    national_id: "3578-CH-002",
    child_name: "Aulia Putri Setiawan",
    gender: "P",
    birth_date: ago(4),          // 4 tahun
    birth_weight: 2.9,
    birth_length: 48,
    current_weight: 14.2,
    current_height: 98,
    birth_order: 1,
    blood_type: "O",
    birth_place: "RS Bhakti Husada",
  },

  // ── Dewi Lestari (1 anak) ────────────────────────────────────────
  {
    motherNationalId: "3578-001-050592-002",
    national_id: "3578-CH-003",
    child_name: "Kevin Arya Hartono",
    gender: "L",
    birth_date: ago(0, 3),       // 3 bulan
    birth_weight: 3.4,
    birth_length: 51,
    current_weight: 5.8,
    current_height: 59,
    birth_order: 1,
    blood_type: "A",
    birth_place: "Bidan Praktik Mandiri",
  },

  // ── Rina Susanti (3 anak) ───────────────────────────────────────
  {
    motherNationalId: "3578-001-120893-003",
    national_id: "3578-CH-004",
    child_name: "Dinda Ayu Prasetyo",
    gender: "P",
    birth_date: ago(5, 8),       // 5 tahun 8 bulan
    birth_weight: 3.0,
    birth_length: 49,
    current_weight: 17.5,
    current_height: 109,
    birth_order: 1,
    blood_type: "B",
    birth_place: "RSUD Kenanga",
    special_conditions: JSON.stringify(["Alergi susu sapi"]),
  },
  {
    motherNationalId: "3578-001-120893-003",
    national_id: "3578-CH-005",
    child_name: "Rizky Putra Prasetyo",
    gender: "L",
    birth_date: ago(3, 6),       // 3 tahun 6 bulan
    birth_weight: 3.3,
    birth_length: 51,
    current_weight: 12.0,
    current_height: 91,
    birth_order: 2,
    blood_type: "B",
    birth_place: "RSUD Kenanga",
  },
  {
    motherNationalId: "3578-001-120893-003",
    national_id: "3578-CH-006",
    child_name: "Nayla Sari Prasetyo",
    gender: "P",
    birth_date: ago(0, 9),       // 9 bulan
    birth_weight: 2.8,
    birth_length: 47,
    current_weight: 7.0,
    current_height: 68,
    birth_order: 3,
    blood_type: "O",
    birth_place: "Bidan Praktik Mandiri",
    special_conditions: JSON.stringify(["Berat lahir rendah"]),
  },

  // ── Yuni Astuti (2 anak) ────────────────────────────────────────
  {
    motherNationalId: "3578-001-290791-004",
    national_id: "3578-CH-007",
    child_name: "Bagas Pradipta Santoso",
    gender: "L",
    birth_date: ago(2, 3),       // 2 tahun 3 bulan
    birth_weight: 3.2,
    birth_length: 50,
    current_weight: 10.5,
    current_height: 83,
    birth_order: 2,
    blood_type: "A",
    birth_place: "Puskesmas Kenanga",
    special_conditions: JSON.stringify(["Risiko stunting"]),
  },
  {
    motherNationalId: "3578-001-290791-004",
    national_id: "3578-CH-008",
    child_name: "Citra Dewi Santoso",
    gender: "P",
    birth_date: ago(4, 10),      // 4 tahun 10 bulan
    birth_weight: 3.1,
    birth_length: 49,
    current_weight: 15.0,
    current_height: 101,
    birth_order: 1,
    blood_type: "AB",
    birth_place: "RS Bhakti Husada",
  },

  // ── Fitri Handayani (1 anak) ────────────────────────────────────
  {
    motherNationalId: "3578-001-070296-005",
    national_id: "3578-CH-009",
    child_name: "Zahra Nurul Kurniawan",
    gender: "P",
    birth_date: ago(1, 7),       // 1 tahun 7 bulan
    birth_weight: 3.0,
    birth_length: 49,
    current_weight: 9.2,
    current_height: 76,
    birth_order: 1,
    blood_type: "O",
    birth_place: "Bidan Praktik Mandiri",
  },

  // ── Lilis Suryani (1 anak sebelumnya, sekarang hamil) ──────────
  {
    motherNationalId: "3578-001-150394-006",
    national_id: "3578-CH-010",
    child_name: "Galang Wahyu Santoso",
    gender: "L",
    birth_date: ago(2, 1),       // 2 tahun 1 bulan
    birth_weight: 3.5,
    birth_length: 52,
    current_weight: 11.8,
    current_height: 84,
    birth_order: 1,
    blood_type: "A",
    birth_place: "Puskesmas Kenanga",
  },

  // ── Sri Wahyuni (3 anak sebelumnya, hamil lagi, usia 37) ───────
  {
    motherNationalId: "3578-001-110589-009",
    national_id: "3578-CH-011",
    child_name: "Aditya Eka Susilo",
    gender: "L",
    birth_date: ago(6),          // 6 tahun
    birth_weight: 3.3,
    birth_length: 51,
    current_weight: 18.0,
    current_height: 112,
    birth_order: 1,
    blood_type: "A",
    birth_place: "RS Bhakti Husada",
  },
  {
    motherNationalId: "3578-001-110589-009",
    national_id: "3578-CH-012",
    child_name: "Bintang Dwi Susilo",
    gender: "L",
    birth_date: ago(4, 2),       // 4 tahun 2 bulan
    birth_weight: 2.9,
    birth_length: 47,
    current_weight: 13.0,
    current_height: 97,
    birth_order: 2,
    blood_type: "A",
    birth_place: "Puskesmas Kenanga",
  },
  {
    motherNationalId: "3578-001-110589-009",
    national_id: "3578-CH-013",
    child_name: "Cantika Tri Susilo",
    gender: "P",
    birth_date: ago(1, 10),      // 1 tahun 10 bulan
    birth_weight: 2.7,
    birth_length: 46,
    current_weight: 8.5,
    current_height: 74,
    birth_order: 3,
    blood_type: "O",
    birth_place: "Bidan Praktik Mandiri",
    special_conditions: JSON.stringify(["Gizi kurang", "Berat lahir rendah"]),
  },

  // ── Mega Wulandari (2 anak – ibu nifas, bayi baru lahir) ───────
  {
    motherNationalId: "3578-001-221193-010",
    national_id: "3578-CH-014",
    child_name: "Evan Dwi Munandar",
    gender: "L",
    birth_date: ago(0, 0, 12),   // 12 hari (neonatus)
    birth_weight: 3.2,
    birth_length: 50,
    current_weight: 3.2,
    current_height: 51,
    birth_order: 2,
    blood_type: "O",
    birth_place: "Puskesmas Kenanga",
  },
  {
    motherNationalId: "3578-001-221193-010",
    national_id: "3578-CH-015",
    child_name: "Fara Nur Munandar",
    gender: "P",
    birth_date: ago(3),          // 3 tahun
    birth_weight: 3.0,
    birth_length: 49,
    current_weight: 12.5,
    current_height: 90,
    birth_order: 1,
    blood_type: "A",
    birth_place: "RS Bhakti Husada",
  },

  // ── Putri Ramadhani (1 anak – ibu nifas, bayi baru lahir) ──────
  {
    motherNationalId: "3578-001-040296-011",
    national_id: "3578-CH-016",
    child_name: "Hana Salsabila Pratama",
    gender: "P",
    birth_date: ago(0, 0, 25),   // 25 hari (neonatus)
    birth_weight: 3.0,
    birth_length: 49,
    current_weight: 3.3,
    current_height: 50,
    birth_order: 1,
    blood_type: "B",
    birth_place: "RS Bhakti Husada",
  },

  // ── Anak TANPA IBU TERDAFTAR (anak umum posyandu)
  // Diikat ke Kader sebagai placeholder mother (KADER-DEFAULT tapi boleh buat ibu baru)
  // Kita buat 6 anak lagi dengan ibu-ibu baru yang lebih sederhana

  // ── Ibu tambahan untuk 6 anak terakhir ──────────────────────────
  // (dibuat inline di sini, maka kita tambahkan ke MOTHERS array di atas
  //  dan di CHILDREN kita pakai national_id ibu tambahan)
  {
    motherNationalId: "3578-001-TAMBAH-014",
    national_id: "3578-CH-017",
    child_name: "Iqbal Ramadhan Putra",
    gender: "L",
    birth_date: ago(0, 5),       // 5 bulan
    birth_weight: 3.6,
    birth_length: 52,
    current_weight: 6.9,
    current_height: 63,
    birth_order: 1,
    blood_type: "O",
    birth_place: "Puskesmas Kenanga",
  },
  {
    motherNationalId: "3578-001-TAMBAH-015",
    national_id: "3578-CH-018",
    child_name: "Jasmine Putri Rahayu",
    gender: "P",
    birth_date: ago(1),          // 1 tahun
    birth_weight: 3.1,
    birth_length: 49,
    current_weight: 8.0,
    current_height: 72,
    birth_order: 1,
    blood_type: "A",
    birth_place: "Bidan Praktik Mandiri",
    special_conditions: JSON.stringify(["Imunisasi belum lengkap"]),
  },
  {
    motherNationalId: "3578-001-TAMBAH-016",
    national_id: "3578-CH-019",
    child_name: "Krisna Bayu Saputra",
    gender: "L",
    birth_date: ago(5, 3),       // 5 tahun 3 bulan
    birth_weight: 3.2,
    birth_length: 50,
    current_weight: 16.8,
    current_height: 106,
    birth_order: 2,
    blood_type: "B",
    birth_place: "RSUD Kenanga",
  },
  {
    motherNationalId: "3578-001-TAMBAH-017",
    national_id: "3578-CH-020",
    child_name: "Luna Sekar Ningrum",
    gender: "P",
    birth_date: ago(2, 8),       // 2 tahun 8 bulan
    birth_weight: 2.8,
    birth_length: 47,
    current_weight: 9.8,
    current_height: 81,
    birth_order: 1,
    blood_type: "O",
    birth_place: "Puskesmas Kenanga",
    special_conditions: JSON.stringify(["Gizi kurang"]),
  },
  {
    motherNationalId: "3578-001-TAMBAH-018",
    national_id: "3578-CH-021",
    child_name: "Muhamad Zaki Al-Ghifari",
    gender: "L",
    birth_date: ago(0, 11),      // 11 bulan
    birth_weight: 3.3,
    birth_length: 51,
    current_weight: 8.4,
    current_height: 71,
    birth_order: 2,
    blood_type: "A",
    birth_place: "RS Bhakti Husada",
  },
  {
    motherNationalId: "3578-001-TAMBAH-019",
    national_id: "3578-CH-022",
    child_name: "Nabila Azahra Putri",
    gender: "P",
    birth_date: ago(3, 9),       // 3 tahun 9 bulan
    birth_weight: 3.0,
    birth_length: 49,
    current_weight: 13.2,
    current_height: 94,
    birth_order: 1,
    blood_type: "B",
    birth_place: "Bidan Praktik Mandiri",
  },
];

// Ibu tambahan untuk anak 17-22
const EXTRA_MOTHERS = [
  {
    national_id: "3578-001-TAMBAH-014",
    mother_name: "Hesti Purnama",
    password: "ibu123",
    birth_date: ago(27),
    husband_name: "Doni Saputra",
    phone_number: "0812-2222-0014",
    blood_type: "O",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Kenanga No.22, RT 07",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Karyawan Swasta",
    husband_phone_number: "0813-2222-0014",
  },
  {
    national_id: "3578-001-TAMBAH-015",
    mother_name: "Indah Kurniawati",
    password: "ibu123",
    birth_date: ago(26),
    husband_name: "Evan Permana",
    phone_number: "0812-2222-0015",
    blood_type: "A",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Melati No.18, RT 07",
    occupation: "Ibu Rumah Tangga",
    education: "D3",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Guru",
    husband_phone_number: "0813-2222-0015",
  },
  {
    national_id: "3578-001-TAMBAH-016",
    mother_name: "Juliana Sari",
    password: "ibu123",
    birth_date: ago(33),
    husband_name: "Agung Prabowo",
    phone_number: "0812-2222-0016",
    blood_type: "B",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Mawar No.11, RT 08",
    occupation: "Pedagang",
    education: "SMA",
    number_of_children: 2,
    children_born_alive: 2,
    pregnancy_number: 2,
    husband_occupation: "Mekanik",
    husband_phone_number: "0813-2222-0016",
  },
  {
    national_id: "3578-001-TAMBAH-017",
    mother_name: "Kartini Wulandari",
    password: "ibu123",
    birth_date: ago(25),
    husband_name: "Lutfi Hakim",
    phone_number: "0812-2222-0017",
    blood_type: "O",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Kenanga No.25, RT 08",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Ojek Online",
    husband_phone_number: "0813-2222-0017",
  },
  {
    national_id: "3578-001-TAMBAH-018",
    mother_name: "Marisa Dewi Anggraini",
    password: "ibu123",
    birth_date: ago(30),
    husband_name: "Nanda Priambodo",
    phone_number: "0812-2222-0018",
    blood_type: "A",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Melati No.21, RT 09",
    occupation: "Ibu Rumah Tangga",
    education: "SMP",
    number_of_children: 2,
    children_born_alive: 2,
    pregnancy_number: 2,
    husband_occupation: "Buruh Pabrik",
    husband_phone_number: "0813-2222-0018",
  },
  {
    national_id: "3578-001-TAMBAH-019",
    mother_name: "Nova Ayu Lestari",
    password: "ibu123",
    birth_date: ago(28),
    husband_name: "Oki Setiyawan",
    phone_number: "0812-2222-0019",
    blood_type: "B",
    ui_status: "Ibu Balita",
    risk_status: "Normal",
    address: "Jl. Mawar No.16, RT 09",
    occupation: "Ibu Rumah Tangga",
    education: "SMA",
    number_of_children: 1,
    children_born_alive: 1,
    pregnancy_number: 1,
    husband_occupation: "Wiraswasta",
    husband_phone_number: "0813-2222-0019",
  },
];

// ─── MAIN ────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║         SEED DATA – POSYANDU KENANGA 1          ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  const ALL_MOTHERS = [...MOTHERS, ...EXTRA_MOTHERS];
  const motherIdMap = {};

  // 1. Upsert semua ibu
  console.log("📋 Menyimpan data ibu...\n");
  for (const m of ALL_MOTHERS) {
    const { children_born_alive, pregnancy_number, miscarriage_history, disease_history, ...rest } = m;
    const record = await prisma.mother.upsert({
      where: { national_id: m.national_id },
      update: {
        ...rest,
        children_born_alive: children_born_alive ?? 0,
        pregnancy_number: pregnancy_number ?? 0,
        miscarriage_history: miscarriage_history ?? 0,
        disease_history: disease_history ?? null,
      },
      create: {
        ...rest,
        children_born_alive: children_born_alive ?? 0,
        pregnancy_number: pregnancy_number ?? 0,
        miscarriage_history: miscarriage_history ?? 0,
        disease_history: disease_history ?? null,
      },
    });
    motherIdMap[m.national_id] = record.mother_id;
    const statusIcon = {
      "Ibu Balita": "👩‍👦",
      "Ibu Hamil":  "🤰",
      "Ibu Nifas":  "🏥",
      "Calon Ibu":  "💍",
    }[m.ui_status] ?? "👩";
    console.log(`  ${statusIcon} [${m.ui_status}] ${m.mother_name} → OK`);
  }

  // 2. Upsert semua anak
  console.log("\n👶 Menyimpan data anak/balita...\n");
  let childCount = 0;
  for (const c of CHILDREN) {
    const motherId = motherIdMap[c.motherNationalId];
    if (!motherId) {
      console.warn(`  ⚠️  Ibu tidak ditemukan untuk: ${c.child_name} (${c.motherNationalId})`);
      continue;
    }

    const { motherNationalId, birth_weight, birth_length, current_weight, current_height, ...rest } = c;
    await prisma.child.upsert({
      where: { national_id: c.national_id },
      update: {
        mother_id: motherId,
        birth_weight: birth_weight ?? null,
        birth_length: birth_length ?? null,
        current_weight: current_weight ?? null,
        current_height: current_height ?? null,
        ...rest,
      },
      create: {
        mother_id: motherId,
        birth_weight: birth_weight ?? null,
        birth_length: birth_length ?? null,
        current_weight: current_weight ?? null,
        current_height: current_height ?? null,
        ...rest,
      },
    });

    // Hitung usia dalam bulan untuk display
    const ageDays = Math.floor((Date.now() - c.birth_date.getTime()) / (1000 * 60 * 60 * 24));
    const ageMon  = Math.floor(ageDays / 30);
    const ageLabel =
      ageDays < 29 ? `${ageDays} hari` :
      ageMon < 12  ? `${ageMon} bln` :
      ageMon < 24  ? `${Math.floor(ageMon/12)} thn ${ageMon%12} bln` :
                     `${Math.floor(ageMon/12)} thn`;

    const genderIcon = c.gender === "L" ? "♂" : "♀";
    childCount++;
    console.log(`  ${genderIcon} [${String(childCount).padStart(2, "0")}] ${c.child_name} (${ageLabel})`);
  }

  // 3. Summary
  const totalMothers = await prisma.mother.count({ where: { national_id: { notIn: ["KADER-DEFAULT", "NAKES-DEFAULT", "IBU-DEFAULT"] } } });
  const totalChildren = await prisma.child.count();
  const totalBalita = await prisma.mother.count({ where: { ui_status: "Ibu Balita" } });
  const totalHamil  = await prisma.mother.count({ where: { ui_status: "Ibu Hamil" } });
  const totalNifas  = await prisma.mother.count({ where: { ui_status: "Ibu Nifas" } });
  const totalCalon  = await prisma.mother.count({ where: { ui_status: "Calon Ibu" } });

  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║                   RINGKASAN                     ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  Total ibu terdaftar : ${String(totalMothers).padEnd(24)}║`);
  console.log(`║    👩‍👦 Ibu Balita     : ${String(totalBalita).padEnd(24)}║`);
  console.log(`║    🤰 Ibu Hamil      : ${String(totalHamil).padEnd(24)}║`);
  console.log(`║    🏥 Ibu Nifas      : ${String(totalNifas).padEnd(24)}║`);
  console.log(`║    💍 Calon Ibu      : ${String(totalCalon).padEnd(24)}║`);
  console.log(`║  Total anak/balita   : ${String(totalChildren).padEnd(24)}║`);
  console.log("╚══════════════════════════════════════════════════╝\n");
  console.log("✅ Seed data berhasil!\n");
}

main()
  .catch((err) => {
    console.error("\n❌ Seed gagal:", err.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
