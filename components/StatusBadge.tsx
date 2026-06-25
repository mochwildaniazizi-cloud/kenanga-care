export type StatusType = "Normal" | "Risiko Stunting" | "Gizi Kurang" | "Sehat" | "Pantau";

export default function StatusBadge({ status }: { status: StatusType }) {
  const styles: Record<StatusType, string> = {
    "Normal": "bg-green-50 text-green-700",
    "Sehat": "bg-blue-50 text-blue-700",
    "Gizi Kurang": "bg-yellow-50 text-yellow-700",
    "Pantau": "bg-yellow-50 text-yellow-700",
    "Risiko Stunting": "bg-red-50 text-red-700",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}