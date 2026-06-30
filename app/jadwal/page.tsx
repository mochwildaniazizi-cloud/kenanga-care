"use client";

import { useState, useEffect, useRef } from "react";
import { getSchedules, getScheduleLogs, updateSchedule, deleteSchedule } from "@/app/actions/schedule";
import CustomDatePicker from "@/components/CustomDatePicker";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import { MdCheckCircleOutline } from "react-icons/md";
import { FiShare2, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { useUserRole } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";

const calendarDays = [
  { value: "29", isCurrentMonth: false },
  { value: "30", isCurrentMonth: false },
  { value: "01", isCurrentMonth: true },
  { value: "02", isCurrentMonth: true },
  { value: "03", isCurrentMonth: true },
  { value: "04", isCurrentMonth: true, isHighlighted: true },
  { value: "05", isCurrentMonth: true },

  { value: "06", isCurrentMonth: true },
  { value: "07", isCurrentMonth: true },
  { value: "08", isCurrentMonth: true },
  { value: "09", isCurrentMonth: true },
  { value: "10", isCurrentMonth: true },
  { value: "11", isCurrentMonth: true },
  { value: "12", isCurrentMonth: true },

  { value: "13", isCurrentMonth: true },
  { value: "14", isCurrentMonth: true },
  { value: "15", isCurrentMonth: true },
  { value: "16", isCurrentMonth: true },
  { value: "17", isCurrentMonth: true },
  { value: "18", isCurrentMonth: true },
  { value: "19", isCurrentMonth: true },

  { value: "20", isCurrentMonth: true },
  { value: "21", isCurrentMonth: true },
  { value: "22", isCurrentMonth: true },
  { value: "23", isCurrentMonth: true },
  { value: "24", isCurrentMonth: true },
  { value: "25", isCurrentMonth: true },
  { value: "26", isCurrentMonth: true },

  { value: "27", isCurrentMonth: true },
  { value: "28", isCurrentMonth: true },
  { value: "29", isCurrentMonth: true },
  { value: "30", isCurrentMonth: true },
  { value: "31", isCurrentMonth: true },
  { value: "01", isCurrentMonth: false },
  { value: "02", isCurrentMonth: false },
];



interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

function CustomTimePicker({ value, onChange, label }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse hours and minutes from value (e.g. "08:30" or default to "08:00")
  const parseVal = (valStr: string) => {
    const parts = (valStr || "08:00").split(":");
    const h = parts[0] || "08";
    const m = parts[1] || "00";
    return { h: h.padStart(2, "0"), m: m.padStart(2, "0") };
  };

  const initialParsed = parseVal(value);
  const [selHour, setSelHour] = useState(initialParsed.h);
  const [selMinute, setSelMinute] = useState(initialParsed.m);

  // Sync state when value changes from outside
  useEffect(() => {
    const parsed = parseVal(value);
    setSelHour(parsed.h);
    setSelMinute(parsed.m);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDone = () => {
    onChange(`${selHour}:${selMinute}`);
    setIsOpen(false);
  };

  // Generate lists
  const hoursList = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between border rounded-xl px-4 py-2 bg-base-bg/10 focus-within:bg-base-white cursor-pointer transition select-none ${
          isOpen ? "border-brand-primary ring-2 ring-brand-primary/20 bg-base-white" : "border-base-border/50 hover:border-brand-primary/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <svg className={`w-5 h-5 transition-colors ${isOpen ? "text-brand-primary" : "text-base-text-secondary"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-[10px] uppercase font-semibold tracking-wider transition-colors ${isOpen ? "text-brand-primary" : "text-base-text-secondary"}`}>
              {label}
            </span>
            <span className="text-sm font-semibold text-base-text-primary mt-1">
              {selHour}:{selMinute}
            </span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-base-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Popover List */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 bg-base-white rounded-2xl shadow-xl border border-base-border/20 p-4 w-52 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-base-text-secondary border-b border-base-border/10 pb-1.5">
            <div>JAM</div>
            <div>MENIT</div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-base-border/10">
            {/* Hours Column */}
            <div className="max-h-40 overflow-y-auto pr-1 space-y-0.5 scrollbar-none">
              {hoursList.map((h) => {
                const isSelected = h === selHour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSelHour(h)}
                    className={`w-full text-center py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary text-base-white font-semibold shadow-sm shadow-brand-primary/10"
                        : "text-base-text-primary hover:bg-base-bg/60"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div className="max-h-40 overflow-y-auto pl-1 space-y-0.5 scrollbar-none">
              {minutesList.map((m) => {
                const isSelected = m === selMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelMinute(m)}
                    className={`w-full text-center py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary text-base-white font-semibold shadow-sm shadow-brand-primary/10"
                        : "text-base-text-primary hover:bg-base-bg/60"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selesai Button */}
          <div className="pt-2 border-t border-base-border/10">
            <button
              type="button"
              onClick={handleDone}
              className="w-full py-2 rounded-xl bg-brand-primary text-base-white font-semibold text-xs hover:bg-brand-primary/95 transition shadow-sm shadow-brand-primary/10 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JadwalPage() {
  const { role, username } = useUserRole();
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role === "ibu") {
      router.replace("/");
    }
  }, [role, router]);

  if (role === "ibu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-base-text-secondary">Mengalihkan...</p>
      </div>
    );
  }

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logItemsPerPage, setLogItemsPerPage] = useState(5);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const [scheduleSortOrder, setScheduleSortOrder] = useState<"asc" | "desc">("asc");
  const [logSortOrder, setLogSortOrder] = useState<"asc" | "desc">("desc");
  const [scheduleTab, setScheduleTab] = useState<"upcoming" | "past">("upcoming");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingSchedules = schedules.filter((s) => new Date(s.rawDate) >= today);
  const pastSchedules = schedules.filter((s) => new Date(s.rawDate) < today);

  const displayedSchedules = scheduleTab === "upcoming" ? upcomingSchedules : pastSchedules;

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    setLogCurrentPage(1);
  }, [logSearch, logItemsPerPage]);

  // Form States
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<any | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    date: "",
    waktuMulai: "08:00",
    waktuSelesai: "12:00",
    focus: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedSchedules, fetchedLogs] = await Promise.all([
          getSchedules(),
          getScheduleLogs()
        ]);
        setSchedules(fetchedSchedules);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error("Failed to load jadwal", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const openEditModal = (schedule: any) => {
    setEditingSchedule({ ...schedule });
    setShowEditModal(true);
  };

  const openDeleteModal = (schedule: any) => {
    setDeletingSchedule({ ...schedule });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSchedule) return;

    setIsLoading(true);
    try {
      const res = await deleteSchedule(deletingSchedule.id, username || "Kader Siti");
      if (res.success) {
        const fetchedSchedules = await getSchedules();
        setSchedules(fetchedSchedules);

        const fetchedLogs = await getScheduleLogs();
        setLogs(fetchedLogs);

        setShowDeleteModal(false);
        setSuccessMessage(`Jadwal tanggal ${deletingSchedule.date} berhasil dihapus.`);
        setShowSuccessModal(true);
      } else {
        alert(res.error || "Gagal menghapus jadwal.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setIsLoading(false);
      setDeletingSchedule(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    setIsLoading(true);
    try {
      const timeParts = editingSchedule.time.split("-");
      const startTime = timeParts[0]?.trim() || "08:00";
      const endTime = timeParts[1]?.replace("WIB", "").trim() || "12:00";

      const res = await updateSchedule(editingSchedule.id, {
        schedule_date: editingSchedule.rawDate,
        start_time: startTime,
        end_time: endTime,
        service_focus: editingSchedule.focus,
        status: editingSchedule.status || "Terjadwal",
        changed_by: username || "Kader Siti"
      });

      if (res.success) {
        const fetchedSchedules = await getSchedules();
        setSchedules(fetchedSchedules);

        const fetchedLogs = await getScheduleLogs();
        setLogs(fetchedLogs);

        setShowEditModal(false);
        setSuccessMessage(`Jadwal berhasil diperbarui.`);
        setShowSuccessModal(true);
      } else {
        alert(res.error || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full pb-28 lg:pb-8 space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (span 5): Next Schedule & Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Jadwal Posyandu Selanjutnya */}
          <div className="bg-base-white rounded-bento-lg p-8 border border-base-border/30 shadow-sm flex flex-col space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-base-text-secondary uppercase tracking-wider">Jadwal Posyandu Selanjutnya</p>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-8 h-8 rounded-full border border-base-border/50 flex items-center justify-center text-base-text-secondary hover:text-brand-primary hover:border-brand-primary transition-all duration-200 hover:scale-110 cursor-pointer"
                  title="Bagikan Jadwal"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="w-64 h-10 bg-base-bg animate-pulse rounded"></div>
                  <div className="w-32 h-5 bg-base-bg animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-base-text-primary leading-tight">
                    {upcomingSchedules[0]?.date || "Tidak ada jadwal mendatang"}
                  </h2>
                  {upcomingSchedules[0] && (
                    <p className="text-sm font-semibold text-base-text-primary mt-1">
                      {upcomingSchedules[0].time}
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="border-t border-base-border/20 pt-4">
              <p className="text-sm text-base-text-secondary font-medium">
                Fokus Bulan Ini: <span className="font-semibold text-base-text-primary">{upcomingSchedules[0]?.focus || "-"}</span>
              </p>
            </div>

            <button 
              disabled={upcomingSchedules.length === 0}
              onClick={() => upcomingSchedules.length > 0 && openEditModal(upcomingSchedules[0])}
              className="w-full border border-brand-primary text-brand-primary hover:bg-brand-soft/20 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Edit Jadwal</span>
              <PencilIcon className="w-4 h-4 text-brand-primary" />
            </button>
          </div>

          {/* Card: Kalender */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base-text-primary text-base">Juli 2026</h3>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-base-bg rounded-lg text-base-text-secondary hover:text-brand-primary transition cursor-pointer">
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-base-bg rounded-lg text-base-text-secondary hover:text-brand-primary transition cursor-pointer">
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {/* Days headers */}
              {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => (
                <div key={day} className="font-bold text-base-text-secondary py-1 select-none">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => (
                <div key={index} className="flex justify-center items-center py-1">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold select-none ${
                      day.isHighlighted
                        ? "bg-brand-primary text-base-white font-bold shadow-md shadow-brand-primary/10"
                        : day.isCurrentMonth
                        ? "text-base-text-primary hover:bg-base-bg/60 cursor-pointer"
                        : "text-base-text-secondary/40"
                    }`}
                  >
                    {day.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (span 7): Schedules Table & Logs Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Card: Daftar Jadwal */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-border/10 pb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base-text-primary text-base">Jadwal Posyandu</h3>
                <div className="flex bg-base-bg p-0.5 rounded-lg border border-base-border/20 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setScheduleTab("upcoming")}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      scheduleTab === "upcoming"
                        ? "bg-base-white text-brand-primary shadow-sm"
                        : "text-base-text-secondary hover:text-base-text-primary"
                    }`}
                  >
                    Mendatang ({upcomingSchedules.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleTab("past")}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      scheduleTab === "past"
                        ? "bg-base-white text-brand-primary shadow-sm"
                        : "text-base-text-secondary hover:text-base-text-primary"
                    }`}
                  >
                    Riwayat Selesai ({pastSchedules.length})
                  </button>
                </div>
              </div>
              <button 
                onClick={() => router.push("/jadwal/tambah")}
                className="bg-brand-primary hover:bg-brand-primary/95 text-base-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md shadow-brand-primary/10 transition cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
              >
                <span>Tambah Jadwal</span>
                <PlusIcon className="w-3.5 h-3.5 text-base-white stroke-[3]" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider select-none">
                    <th className="py-2.5 px-3 cursor-pointer hover:text-brand-primary" onClick={() => setScheduleSortOrder(prev => prev === "asc" ? "desc" : "asc")}>
                      <div className="flex items-center gap-1">
                        <span>Tanggal</span>
                        <span className="text-[10px]">{scheduleSortOrder === "asc" ? "↑" : "↓"}</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3">Waktu</th>
                    <th className="py-2.5 px-3">Fokus</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 px-3"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-3 px-3"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-3 px-3"><div className="w-36 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-3 px-3"><div className="w-16 h-7 bg-gray-200 animate-pulse rounded-lg mx-auto"></div></td>
                      </tr>
                    ))
                  ) : (
                    [...displayedSchedules].sort((a, b) => {
                      const dateA = new Date(a.rawDate || 0).getTime();
                      const dateB = new Date(b.rawDate || 0).getTime();
                      return scheduleSortOrder === "asc" ? dateA - dateB : dateB - dateA;
                    }).map((schedule, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-base-text-primary whitespace-nowrap">{schedule.date}</td>
                        <td className="py-3 px-3 text-base-text-secondary font-medium whitespace-nowrap">{schedule.time}</td>
                        <td className="py-3 px-3 text-base-text-primary font-medium">{schedule.focus}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditModal(schedule)}
                              className="px-2.5 py-1.5 border border-brand-primary text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-soft/20 transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>Edit</span>
                              <PencilIcon className="w-3 h-3 text-brand-primary" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(schedule)}
                              className="px-2.5 py-1.5 border border-status-red-solid text-status-red-solid rounded-lg text-xs font-bold hover:bg-status-red-solid/10 transition cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>Hapus</span>
                              <TrashIcon className="w-3 h-3 text-status-red-solid" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {displayedSchedules.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-sm text-base-text-secondary font-semibold">
                        Tidak ada jadwal {scheduleTab === "upcoming" ? "mendatang" : "riwayat selesai"} yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Riwayat Perubahan Jadwal */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base-text-primary text-base">Riwayat Perubahan Jadwal</h3>
              <button 
                onClick={() => router.push("/jadwal/riwayat")}
                className="text-brand-primary text-xs font-bold hover:underline transition cursor-pointer"
              >
                Lihat Selengkapnya &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider select-none">
                    <th className="py-2.5 px-3 cursor-pointer hover:text-brand-primary" onClick={() => setLogSortOrder(prev => prev === "asc" ? "desc" : "asc")}>
                      <div className="flex items-center gap-1">
                        <span>Waktu</span>
                        <span className="text-[10px]">{logSortOrder === "asc" ? "↑" : "↓"}</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-3">Oleh</th>
                    <th className="py-2.5 px-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-3 px-3"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-3 px-3"><div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                        <td className="py-3 px-3"><div className="w-48 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                      </tr>
                    ))
                  ) : (
                    [...logs].sort((a, b) => {
                      const idA = parseInt(a.id) || 0;
                      const idB = parseInt(b.id) || 0;
                      return logSortOrder === "asc" ? idA - idB : idB - idA;
                    }).slice(0, 4).map((log, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                        <td className="py-3 px-3 text-base-text-secondary font-medium whitespace-nowrap">{log.time}</td>
                        <td className="py-3 px-3 text-base-text-primary font-bold">{log.by}</td>
                        <td className="py-3 px-3 text-base-text-primary font-medium">{log.detail}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Modal Edit Jadwal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-md overflow-visible border border-base-border/20">
            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-base-text-primary">Edit Jadwal Posyandu</h3>
                <p className="text-xs text-base-text-secondary">Ubah tanggal, waktu, atau fokus kegiatan pelayanan posyandu.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-base-text-primary mb-1.5">Tanggal Kegiatan</label>
                    <CustomDatePicker 
                      value={editingSchedule.date}
                      onChange={(val) => setEditingSchedule({...editingSchedule, date: val})}
                      label="Select a day"
                      outputFormat="verbal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-base-text-primary mb-1.5">Waktu Pelayanan</label>
                    <div className="grid grid-cols-2 gap-4">
                      <CustomTimePicker 
                        label="Start with"
                        value={(() => {
                          const parts = editingSchedule.time.split("-");
                          return parts[0]?.trim() || "08:00";
                        })()}
                        onChange={(newStart) => {
                          const parts = editingSchedule.time.split("-");
                          const endPart = parts[1]?.trim() || "12:00 WIB";
                          setEditingSchedule({
                            ...editingSchedule,
                            time: `${newStart} - ${endPart}`
                          });
                        }}
                      />
                      <CustomTimePicker 
                        label="End with"
                        value={(() => {
                          const parts = editingSchedule.time.split("-");
                          const endPart = parts[1]?.trim() || "12:00 WIB";
                          return endPart.replace(" WIB", "").trim();
                        })()}
                        onChange={(newEnd) => {
                          const parts = editingSchedule.time.split("-");
                          const startPart = parts[0]?.trim() || "08:00";
                          const hasWib = editingSchedule.time.includes("WIB");
                          setEditingSchedule({
                            ...editingSchedule,
                            time: `${startPart} - ${newEnd}${hasWib ? " WIB" : ""}`
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-base-text-primary mb-1.5">Fokus Layanan</label>
                    <input 
                      type="text" 
                      required
                      value={editingSchedule.focus}
                      onChange={(e) => setEditingSchedule({...editingSchedule, focus: e.target.value})}
                      className="w-full px-4 py-2.5 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3 rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-bold text-xs hover:bg-base-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-brand-primary/90 transition shadow-sm cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal Konfirmasi Hapus Jadwal */}
      {showDeleteModal && deletingSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-sm overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-red-solid/10 text-status-red-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <TrashIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Hapus Jadwal Posyandu?</h3>
              <p className="text-sm text-base-text-secondary">
                Apakah Anda yakin ingin menghapus jadwal posyandu untuk tanggal <span className="font-semibold text-base-text-primary">{deletingSchedule.date}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3">
              <button 
                type="button" 
                onClick={() => { setShowDeleteModal(false); setDeletingSchedule(null); }}
                className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-semibold text-xs hover:bg-base-white transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-status-red-solid text-white font-semibold text-xs hover:bg-status-red-solid/90 transition shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[90%] max-w-sm overflow-hidden border border-base-border/20">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-status-green-light text-status-green-solid rounded-full flex items-center justify-center mx-auto mb-2">
                <MdCheckCircleOutline className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-text-primary">Berhasil Disimpan</h3>
              <p className="text-sm text-base-text-secondary">
                {successMessage}
              </p>
            </div>
            <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-center">
              <button 
                type="button" 
                onClick={() => setShowSuccessModal(false)}
                className="w-full max-w-[200px] py-2.5 rounded-xl bg-status-green-solid text-base-white font-bold hover:bg-status-green-solid/90 transition shadow-sm cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bagikan Jadwal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-share-backdrop">
          <div className="bg-base-white rounded-[28px] shadow-xl w-full max-w-sm overflow-visible border border-base-border/20 p-8 pt-10 text-center relative animate-share-content">
            
            {/* Circular badge on the top edge */}
            <div className="w-16 h-16 bg-base-white rounded-full flex items-center justify-center shadow-md absolute top-0 left-1/2 border border-base-border/30 animate-link-badge">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chrome-grad-jadwal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="50%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#374151" />
                  </linearGradient>
                </defs>
                <g transform="rotate(-45 16 16)">
                  <path d="M15 13H9C6.79086 13 5 14.7909 5 17C5 19.2091 6.79086 21 9 21H15C17.2091 21 19 19.2091 19 17" stroke="url(#chrome-grad-jadwal)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M13 15C13 12.7909 14.7909 11 17 11H23C25.2091 11 27 12.7909 27 15C27 17.2091 25.2091 19 23 19H17" stroke="url(#chrome-grad-jadwal)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M15 13H17" stroke="url(#chrome-grad-jadwal)" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            {/* Close button */}
            <button 
              onClick={() => { setShowShareModal(false); setCopiedLink(false); }} 
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F8F9FD] border border-[#E5E9F2] hover:bg-[#E5E9F2]/50 flex items-center justify-center text-base-text-secondary hover:text-base-text-primary transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-2 mb-6 mt-2 animate-stagger-1">
              <h3 className="text-xl font-bold text-[#1E1E1E]">Bagikan Jadwal</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-[240px] mx-auto">
                Informasikan jadwal posyandu ini kepada warga sekitar!
              </p>
            </div>

            {/* Share link input box */}
            <div className="space-y-2 text-left mb-6 animate-stagger-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Tautan Halaman</span>
              <div className="flex items-center justify-between bg-[#F5F7FB] border border-[#E5E9F2] rounded-2xl px-4 py-3.5 text-xs font-medium">
                <span className="truncate max-w-[200px] select-all text-[#4B5563]">{shareUrl}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }} 
                  className="text-[#6B7280] hover:text-[#1E1E1E] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center"
                  title="Salin Tautan"
                >
                  {copiedLink ? (
                    <FiCheck className="w-4 h-4 text-status-green-solid" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Share to social media icons */}
            <div className="space-y-3 text-left animate-stagger-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Bagikan ke</span>
              <div className="grid grid-cols-5 gap-2 text-center">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#1877F2"/>
                    <path d="M24 20H21V30H17V20H15V16.5H17V14.25C17 11.25 18.75 9.5 21.5 9.5C22.75 9.5 24 9.75 24 9.75V12.75H22.5C21 12.75 20.5 13.75 20.5 14.75V16.5H24.5L24 20Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Facebook</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Jadwal Posyandu ' + (upcomingSchedules[0]?.date || ''))}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="black"/>
                    <path d="M26 11H28.5L22.5 17.5L29.5 27H24L19.5 21.25L14.75 27H12L18.5 20.25L12 11H17.5L21.75 16.5L26 11ZM25 25.5H26.5L16.5 12.5H15L25 25.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">X</span>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Jadwal Posyandu ' + (upcomingSchedules[0]?.date || '') + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#25D366"/>
                    <path d="M20 9C13.9 9 9 13.9 9 20C9 22 9.5 23.9 10.5 25.6L9 31L14.6 29.5C16.2 30.5 18.1 31 20 31C26.1 31 31 26.1 31 20C31 13.9 26.1 9 20 9ZM25.2 24.1C24.9 25 23.9 25.7 23 25.9C22.4 26 21.6 26.1 18.8 24.9C15.2 23.4 12.9 19.7 12.7 19.5C12.5 19.3 11 17.3 11 15.2C11 13.1 12 12.1 12.4 11.6C12.8 11.1 13.5 10.9 14.1 10.9C14.3 10.9 14.5 10.9 14.7 10.9C15.2 10.9 15.5 10.9 15.8 11.6C16.2 12.5 17.1 14.7 17.2 14.9C17.3 15.1 17.4 15.4 17.2 15.7C17.1 16 16.9 16.2 16.7 16.5C16.5 16.7 16.2 17 16 17.2C15.8 17.4 15.5 17.6 15.8 18.1C16.1 18.6 17.1 20.3 18.7 21.7C20.7 23.5 22.4 24.1 22.9 24.3C23.4 24.5 23.7 24.4 24 24.1C24.3 23.8 24.9 23.1 25.2 22.6C25.5 22.1 25.9 22.2 26.3 22.3C26.7 22.4 28.7 23.4 29.1 23.6C29.5 23.8 29.8 23.9 29.9 24.1C30 24.3 30 25.1 29.6 25.9C29.2 26.7 27 27.5 25.2 24.1Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Whatsapp</span>
                </a>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Jadwal Posyandu ' + (upcomingSchedules[0]?.date || ''))}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#179CDE"/>
                    <path d="M27.5 12.5L11.5 18.7C10.4 19.1 10.4 19.8 11.3 20.1L15.4 21.4L24.9 15.4C25.3 15.1 25.7 15.3 25.4 15.6L17.7 22.6L17.4 26.8C17.8 26.8 18 26.6 18.2 26.4L20.2 24.5L24.4 27.6C25.2 28 25.8 27.8 26 26.9L28.8 13.8C29.1 12.6 28.3 12.1 27.5 12.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Telegram</span>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
                  <svg className="w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ease-out" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#0A66C2"/>
                    <path d="M14.5 13C14.5 13.8 13.8 14.5 13 14.5C12.2 14.5 11.5 13.8 11.5 13C11.5 12.2 12.2 11.5 13 11.5C13.8 11.5 14.5 12.2 14.5 13ZM11.5 27H14.5V17H11.5V27ZM22.5 21.5V27H25.5V21.1C25.5 18.2 24.8 16.5 21.8 16.5C20.3 16.5 19.3 17.3 18.9 18.1H18.8V17H16V27H19V21.5C19 20.1 19.3 19.2 20.5 19.2C21.7 19.2 22.5 20.1 22.5 21.5Z" fill="white"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-[#6B7280] group-hover:text-[#1E1E1E] transition-colors">Linkedin</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

