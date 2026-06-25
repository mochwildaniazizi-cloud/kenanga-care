// src/app/page.tsx
import StatCard from "@/components/StatCard";
import ActivityTableCard from "@/components/ActivityTableCard";
import { StatusType } from "@/components/StatusBadge";

const childActivities = [
  { time: "12 Okt, 10:30", name: "Budi Santoso", detail: "24 Bulan", status: "Normal" as StatusType, avatar: "👶" },
  { time: "12 Okt, 08:45", name: "Sari Putri", detail: "18 Bulan", status: "Risiko Stunting" as StatusType, avatar: "👶" },
  { time: "12 Okt, 08:30", name: "Rizky Pratama", detail: "36 Bulan", status: "Normal" as StatusType, avatar: "👶" },
  { time: "12 Okt, 08:15", name: "Anita Dewi", detail: "12 Bulan", status: "Gizi Kurang" as StatusType, avatar: "👶" },
  { time: "11 Okt, 13:45", name: "Doni Kurniawan", detail: "48 Bulan", status: "Normal" as StatusType, avatar: "👶" },
];

const motherActivities = [
  { time: "12 Okt, 09:15", name: "Ibu Siti Aminah", detail: "Hamil 28 M", status: "Sehat" as StatusType, avatar: "🤰" },
  { time: "11 Okt, 14:20", name: "Ibu Ratna", detail: "Hamil 16 M", status: "Sehat" as StatusType, avatar: "🤰" },
  { time: "11 Okt, 10:00", name: "Ibu Wulandari", detail: "Hamil 34 M", status: "Pantau" as StatusType, avatar: "🤰" },
  { time: "10 Okt, 16:10", name: "Ibu Dewi K", detail: "Nifas Hari 3", status: "Sehat" as StatusType, avatar: "🤰" },
  { time: "10 Okt, 10:45", name: "Ibu Siska P", detail: "Hamil 12 M", status: "Sehat" as StatusType, avatar: "🤰" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-8">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Grid Kartu Statistik */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
          {/* Menggunakan token bg-kenanga-pink */}
          <StatCard icon="👶" label="Total Balita" value="124" change="+4%" changeType="up" progress={{ current: 85, total: 100, color: "bg-kenanga-pink" }} />
          <StatCard icon="🤰" label="Ibu Hamil" value="18" change="+2" changeType="up" />
          <StatCard icon="🤱" label="Ibu Nifas" value="6" change="-1" changeType="down" progress={{ current: 30, total: 100, color: "bg-blue-600" }} />
          <StatCard icon="📅" label="Jadwal Berikutnya" value="15 Okt" change="2 Hari Lagi" changeType="up" progress={{ current: 0, total: 100, color: "bg-orange-500" }} />
        </div>

        {/* Pencapaian Bulan Ini */}
        {/* Menggunakan bg-card dan rounded-bento-lg */}
        <div className="md:col-span-4 bg-card p-8 rounded-bento-lg shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium tracking-wide">Statistik Cakupan</p>
              <h3 className="text-lg font-semibold text-gray-900">Pencapaian Bulan Ini</h3>
            </div>
            {/* Menggunakan text-kenanga-pink dan bg-surface */}
            <div className="text-3xl p-3 bg-surface rounded-full text-kenanga-pink">📊</div>
          </div>
          
          <div className="flex-1 space-y-6 mt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-gray-700 flex items-center gap-2">
                  {/* Menggunakan bg-kenanga-pink */}
                  <span className="w-2.5 h-2.5 rounded-full bg-kenanga-pink"/> Penimbangan Balita
                </span>
                <span className="text-gray-950">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                {/* Menggunakan bg-kenanga-pink */}
                <div className="h-full bg-kenanga-pink rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Aktivitas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActivityTableCard title="Aktivitas Anak" description="Pemeriksaan & Imunisasi Balita" columns={["Tanggal & Waktu", "Nama Anak", "Status"]} data={childActivities} />
        <ActivityTableCard title="Aktivitas Ibu" description="Pemeriksaan Kehamilan & Nifas" columns={["Tanggal & Waktu", "Nama Ibu", "Status"]} data={motherActivities} />
      </div>

    </div>
  );
}