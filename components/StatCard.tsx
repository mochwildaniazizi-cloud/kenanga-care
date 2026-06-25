// src/components/StatCard.tsx

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  progress?: { current: number; total: number; color: string };
}

export default function StatCard({ icon, label, value, change, changeType, progress }: StatCardProps) {
  const isUp = changeType === "up";
  
  return (
    // Menggunakan rounded-bento-md dan bg-card
    <div className="bg-card p-6 rounded-bento-md shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-center gap-4 mb-3">
        {/* Menggunakan bg-surface */}
        <div className="text-3xl p-3 bg-surface rounded-full">{icon}</div>
        <div>
          <p className="text-4xl font-bold text-gray-950">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        <div className={`ml-auto flex items-center gap-1 text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
          {isUp ? "↗" : "↘"} {change}
        </div>
      </div>
      {progress && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className={`h-full rounded-full ${progress.color}`} 
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}