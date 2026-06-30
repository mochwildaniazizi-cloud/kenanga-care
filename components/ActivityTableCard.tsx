import Link from "next/link";
import StatusBadge, { StatusType } from "./StatusBadge";

interface ActivityTableCardProps {
  title: string;
  description: string;
  columns: string[];
  data: { time: string; name: string; detail: string; status: StatusType; avatar: string }[];
  viewAllHref?: string;
}

export default function ActivityTableCard({ title, description, columns, data, viewAllHref }: ActivityTableCardProps) {
  return (
    // Menggunakan rounded-bento-lg dan bg-card
    <div className="bg-card p-8 rounded-bento-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-brand-primary hover:underline transition">
            Lihat Semua
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-8">{description}</p>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              {columns.map(col => (
                <th key={col} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider py-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-surface transition-colors">
                <td className="py-5 text-gray-600">{item.time}</td>
                <td className="py-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-between p-2 text-xl">{item.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.detail}</p>
                  </div>
                </td>
                <td className="py-5"><StatusBadge status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}