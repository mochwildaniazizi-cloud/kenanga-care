export interface ChildData {
  nama: string;
  nik: string;
  gender: 'L' | 'P';
  tglLahir: string;
  beratLahir: number;
  panjangLahir: number;
  statusGizi: string;
  statusImunisasi: string;
  catatan?: string;
}

export interface UserPersona {
  nama: string;
  nik: string;
  tglLahir: string;
  whatsapp: string;
  pin: string;
  alamat: string;
  golDan: string;
  namaSuami?: string;
  role: 'ibu' | 'kader';
  isPregnant: boolean;
  hpht?: string;
  hpl?: string;
  ttdDiminum?: number;
  catatanMedis?: string;
  children?: ChildData[];
  wilayahTugas?: string;
  kewenangan?: string[];
}

export const dummyUsers: UserPersona[] = [
  {
    nama: "Siti Nurhaliza",
    nik: "3573010508950002",
    tglLahir: "1995-08-05",
    whatsapp: "081234567890",
    pin: "123456",
    alamat: "Jl. Kenanga Sari No. 14, RT 02 / RW 05, Kel. Setiabudi",
    golDan: "O",
    namaSuami: "Budi Santoso",
    role: 'ibu',
    isPregnant: false,
    children: [
      {
        nama: "Dika Aditya Santoso",
        nik: "3573010101230001",
        gender: 'L',
        tglLahir: "2023-01-01",
        beratLahir: 3.2,
        panjangLahir: 49,
        statusGizi: "Gizi Baik (BB: 14.5 kg, TB: 95 cm)",
        statusImunisasi: "Lengkap Dasar",
      },
      {
        nama: "Rina Amelia Santoso",
        nik: "3573011510250003",
        gender: 'P',
        tglLahir: "2025-10-15",
        beratLahir: 2.8,
        panjangLahir: 47,
        statusGizi: "Gizi Kurang (BB: 6.2 kg, PB: 62 cm)",
        statusImunisasi: "Menunggu jadwal PCV 2 dan Rotavirus 2",
        catatan: "Anak BBLR, sedang dalam pemantauan gizi ketat",
      }
    ]
  },
  {
    nama: "Dewi Lestari",
    nik: "3573012011960004",
    tglLahir: "1996-11-20",
    whatsapp: "085678901234",
    pin: "654321",
    alamat: "Jl. Mawar Merah No. 8, RT 03 / RW 05, Kel. Setiabudi",
    golDan: "A",
    namaSuami: "Hendra Wijaya",
    role: 'ibu',
    isPregnant: true,
    hpht: "2025-07-10",
    hpl: "2026-04-17",
    ttdDiminum: 55,
    catatanMedis: "Anemia Ringan (Hb terakhir 9.8 g/dL). Perlu pantauan minum TTD 90 tablet.",
    children: [
      {
        nama: "Bima Saputra Wijaya",
        nik: "3573011208230007",
        gender: 'L',
        tglLahir: "2023-08-12",
        beratLahir: 3.1,
        panjangLahir: 50,
        statusGizi: "Gizi Baik (BB: 13.2 kg, TB: 89 cm)",
        statusImunisasi: "Campak Lanjutan (Belum)",
        catatan: "Anak sehat, motorik sangat aktif",
      }
    ]
  },
  {
    nama: "Fitri Handayani",
    nik: "3573011402800009",
    tglLahir: "1980-02-14",
    whatsapp: "081955556666",
    pin: "999999",
    alamat: "Jl. Kenanga Sari No. 1, RT 02 / RW 05, Kel. Setiabudi",
    golDan: "-",
    role: 'kader',
    isPregnant: false,
    wilayahTugas: "Posyandu Melati (Melingkupi RT 01, 02, 03, 04 di RW 05)",
    kewenangan: [
      "can_add_toddler",
      "can_edit_anc",
      "can_view_all_reports",
      "can_manage_inventory",
      "can_send_broadcast_wa"
    ]
  }
];
