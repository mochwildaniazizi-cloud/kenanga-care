"use client";

import { useState, useEffect, useRef } from "react";
import { getSchedules, getScheduleLogs } from "@/app/actions/schedule";
import CustomDatePicker from "@/components/CustomDatePicker";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import { MdCheckCircleOutline } from "react-icons/md";

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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleConfirmDelete = () => {
    if (!deletingSchedule) return;

    // Filter out the deleted schedule
    setSchedules(prev => prev.filter(s => s.id !== deletingSchedule.id));

    // Create log entry dynamically
    const now = new Date();
    const formattedLogTime = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + 
                             ` Pukul ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLog = {
      id: (logs.length + 1).toString(),
      time: formattedLogTime,
      by: "Kader Siti",
      detail: `Menghapus Jadwal ${deletingSchedule.date}.`
    };

    setLogs(prev => [newLog, ...prev]);
    setShowDeleteModal(false);

    // Show Success Modal
    setSuccessMessage(`Jadwal tanggal ${deletingSchedule.date} berhasil dihapus.`);
    setShowSuccessModal(true);
    setDeletingSchedule(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    // Update schedules list in local state
    setSchedules(prev => 
      prev.map(s => s.id === editingSchedule.id ? editingSchedule : s)
    );

    // Create a new change log entry dynamically
    const now = new Date();
    const formattedLogTime = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + 
                             ` Pukul ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLog = {
      id: (logs.length + 1).toString(),
      time: formattedLogTime,
      by: "Kader Siti",
      detail: `Memperbarui Fokus Layanan ${editingSchedule.date}.`
    };

    setLogs(prev => [newLog, ...prev]);
    setShowEditModal(false);

    // Display Success popup
    setSuccessMessage(`Jadwal tanggal ${editingSchedule.date} berhasil diperbarui.`);
    setShowSuccessModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.date || !newSchedule.focus) {
      alert("Mohon lengkapi Tanggal dan Fokus Layanan.");
      return;
    }

    // Format input date (YYYY-MM-DD) to Indonesian style: "Sabtu, 03 Oktober 2026"
    const dateObj = new Date(newSchedule.date);
    const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const formattedTime = `${newSchedule.waktuMulai} - ${newSchedule.waktuSelesai} WIB`;

    const addedItem = {
      id: (schedules.length + 1).toString(),
      date: formattedDate,
      time: formattedTime,
      focus: newSchedule.focus,
      status: "Terjadwal"
    };

    setSchedules(prev => [...prev, addedItem]);

    // Create a new change log entry dynamically
    const now = new Date();
    const formattedLogTime = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + 
                             ` Pukul ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newLog = {
      id: (logs.length + 1).toString(),
      time: formattedLogTime,
      by: "Kader Siti",
      detail: `Menambahkan Jadwal ${formattedDate}.`
    };

    setLogs(prev => [newLog, ...prev]);
    setShowAddModal(false);
    
    // Reset form states
    setNewSchedule({
      date: "",
      waktuMulai: "08:00",
      waktuSelesai: "12:00",
      focus: ""
    });

    // Display Success popup
    setSuccessMessage(`Jadwal baru tanggal ${formattedDate} berhasil ditambahkan.`);
    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-10 space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (span 5): Next Schedule & Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Jadwal Posyandu Selanjutnya */}
          <div className="bg-base-white rounded-bento-lg p-8 border border-base-border/30 shadow-sm flex flex-col space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-base-text-secondary uppercase tracking-wider">Jadwal Posyandu Selanjutnya</p>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="w-64 h-10 bg-base-bg animate-pulse rounded"></div>
                  <div className="w-32 h-5 bg-base-bg animate-pulse rounded"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-base-text-primary leading-tight">
                    {schedules[0]?.date || "Sabtu, 04 Juli 2026"}
                  </h2>
                  <p className="text-sm font-semibold text-base-text-primary mt-1">
                    {schedules[0]?.time || "08:00 - 12:00 WIB"}
                  </p>
                </>
              )}
            </div>
            
            <div className="border-t border-base-border/20 pt-4">
              <p className="text-sm text-base-text-secondary font-medium">
                Fokus Bulan Ini: <span className="font-semibold text-base-text-primary">{schedules[0]?.focus || "Imunisasi PCV & Penimbangan"}</span>
              </p>
            </div>

            <button 
              onClick={() => schedules.length > 0 && openEditModal(schedules[0])}
              className="w-full border border-brand-primary text-brand-primary hover:bg-brand-soft/20 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2"
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
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base-text-primary text-base">Jadwal Posyandu</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-brand-primary hover:bg-brand-primary/95 text-base-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md shadow-brand-primary/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Tambah Jadwal</span>
                <PlusIcon className="w-3.5 h-3.5 text-base-white stroke-[3]" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tanggal</th>
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
                    schedules.map((schedule, i) => (
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
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Riwayat Perubahan Jadwal */}
          <div className="bg-base-white rounded-bento-lg p-6 border border-base-border/30 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base-text-primary text-base">Riwayat Perubahan Jadwal</h3>
              <button 
                onClick={() => setShowLogsModal(true)}
                className="text-brand-primary text-xs font-bold hover:underline transition cursor-pointer"
              >
                Lihat Selengkapnya &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                    <th className="py-2.5 px-3">Waktu</th>
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
                    logs.slice(0, 4).map((log, i) => (
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

      {/* Modal Tambah Jadwal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
          <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-md overflow-visible border border-base-border/20">
            <form onSubmit={handleSaveAdd}>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-base-text-primary">Tambah Jadwal Posyandu</h3>
                <p className="text-xs text-base-text-secondary">Masukkan tanggal, waktu, dan fokus layanan posyandu baru.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-base-text-primary mb-1.5">Tanggal Kegiatan</label>
                    <CustomDatePicker 
                      value={newSchedule.date}
                      onChange={(val) => setNewSchedule({...newSchedule, date: val})}
                      label="Select a day"
                      outputFormat="iso"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-base-text-primary mb-1.5">Waktu Mulai</label>
                      <CustomTimePicker 
                        label="Start with"
                        value={newSchedule.waktuMulai}
                        onChange={(val) => setNewSchedule({...newSchedule, waktuMulai: val})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-base-text-primary mb-1.5">Waktu Selesai</label>
                      <CustomTimePicker 
                        label="End with"
                        value={newSchedule.waktuSelesai}
                        onChange={(val) => setNewSchedule({...newSchedule, waktuSelesai: val})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-base-text-primary mb-1.5">Fokus Layanan</label>
                    <input 
                      type="text" 
                      required
                      value={newSchedule.focus}
                      onChange={(e) => setNewSchedule({...newSchedule, focus: e.target.value})}
                      placeholder="Contoh: Imunisasi PCV & Penimbangan"
                      className="w-full px-4 py-2.5 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-sm text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex gap-3 rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-base-border/50 text-base-text-secondary hover:text-base-text-primary font-bold text-xs hover:bg-base-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-brand-primary/90 transition shadow-sm cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Modal Riwayat Log Selengkapnya */}
      {showLogsModal && (() => {
        const filteredLogs = logs.filter(log => 
          log.detail.toLowerCase().includes(logSearch.toLowerCase()) ||
          log.by.toLowerCase().includes(logSearch.toLowerCase()) ||
          log.time.toLowerCase().includes(logSearch.toLowerCase())
        );
        const totalLogPages = Math.ceil(filteredLogs.length / logItemsPerPage);
        const paginatedLogs = filteredLogs.slice(
          (logCurrentPage - 1) * logItemsPerPage,
          logCurrentPage * logItemsPerPage
        );
        const startIdx = filteredLogs.length > 0 ? (logCurrentPage - 1) * logItemsPerPage + 1 : 0;
        const endIdx = Math.min(logCurrentPage * logItemsPerPage, filteredLogs.length);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-200">
            <div className="bg-base-white rounded-2xl shadow-xl w-[95%] max-w-2xl overflow-visible border border-base-border/20 flex flex-col">
              <div className="p-6 pb-4 space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-base-border/10 pb-3">
                  <h3 className="text-xl font-bold text-base-text-primary">Riwayat Lengkap Perubahan Jadwal</h3>
                  <button 
                    onClick={() => { setShowLogsModal(false); setLogSearch(""); }}
                    className="text-base-text-secondary hover:text-base-text-primary text-sm font-semibold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                {/* Search Bar inside Modal */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Cari riwayat perubahan (berdasarkan detail, oleh, atau waktu)..." 
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-base-border/50 rounded-xl focus:outline-none focus:border-brand-primary text-xs text-base-text-primary transition bg-base-bg/10 focus:bg-base-white"
                  />
                  <svg className="absolute left-3.5 top-3 w-4 h-4 text-base-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Table Container */}
                <div className="overflow-y-auto max-h-80 pr-1 border border-base-border/10 rounded-xl">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead className="sticky top-0 bg-base-white z-10 border-b border-base-border/20">
                      <tr className="text-xs font-bold text-base-text-secondary uppercase tracking-wider">
                        <th className="py-3 px-4 w-1/4">Waktu</th>
                        <th className="py-3 px-4 w-1/4">Oleh</th>
                        <th className="py-3 px-4 w-1/2">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {paginatedLogs.map((log, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-base-bg/30 transition-colors">
                          <td className="py-3 px-4 text-base-text-secondary font-medium whitespace-nowrap">{log.time}</td>
                          <td className="py-3 px-4 text-base-text-primary font-semibold">{log.by}</td>
                          <td className="py-3 px-4 text-base-text-primary font-medium">{log.detail}</td>
                        </tr>
                      ))}
                      {paginatedLogs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-10 text-center text-sm text-base-text-secondary">
                            Tidak ada riwayat perubahan yang cocok.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {filteredLogs.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-3 text-xs text-base-text-secondary font-semibold gap-3 border-t border-base-border/10">
                    <div className="flex items-center gap-2">
                      <span>Tampilkan</span>
                      <select 
                        value={logItemsPerPage} 
                        onChange={(e) => setLogItemsPerPage(Number(e.target.value))}
                        className="border border-base-border/50 rounded-lg px-2 py-1 bg-base-white focus:outline-none focus:border-brand-primary text-xs"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span>dari {filteredLogs.length} Riwayat (Menampilkan {startIdx}-{endIdx})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setLogCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={logCurrentPage === 1}
                        className="px-2.5 py-1.5 border border-base-border/40 rounded-lg text-base-text-secondary hover:text-brand-primary hover:border-brand-primary disabled:opacity-50 disabled:hover:text-base-text-secondary transition select-none cursor-pointer"
                      >
                        &lt; Seb
                      </button>
                      
                      {Array.from({ length: totalLogPages }, (_, i) => i + 1).map(page => (
                        <button 
                          key={page}
                          onClick={() => setLogCurrentPage(page)}
                          className={`w-7.5 h-7.5 flex items-center justify-center rounded-lg transition select-none cursor-pointer ${
                            logCurrentPage === page 
                              ? 'bg-brand-primary text-base-white font-bold shadow-sm shadow-brand-primary/10' 
                              : 'border border-base-border/30 text-base-text-primary hover:bg-base-bg/60'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button 
                        onClick={() => setLogCurrentPage(prev => Math.min(prev + 1, totalLogPages))}
                        disabled={logCurrentPage === totalLogPages}
                        className="px-2.5 py-1.5 border border-base-border/40 rounded-lg text-base-text-secondary hover:text-brand-primary hover:border-brand-primary disabled:opacity-50 disabled:hover:text-base-text-secondary transition select-none cursor-pointer"
                      >
                        Sel &gt;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-base-bg/50 border-t border-base-border/30 flex justify-end rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => { setShowLogsModal(false); setLogSearch(""); }}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary text-base-white font-semibold text-xs hover:bg-brand-primary/90 transition shadow-sm cursor-pointer"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

    </div>
  );
}
