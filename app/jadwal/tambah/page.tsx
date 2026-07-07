"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchedule } from "@/app/actions/schedule";
import { useUserRole } from "@/context/UserRoleContext";
import CustomDatePicker from "@/components/CustomDatePicker";
import { FiArrowLeft } from "react-icons/fi";
import { showLocalNotification } from "@/utils/notifications";

export default function TambahJadwalPage() {
  const router = useRouter();
  const { username } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    schedule_date: "",
    start_time: "08:00",
    end_time: "12:00",
    service_focus: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dateStr: string) => {
    setFormData((prev) => ({ ...prev, schedule_date: dateStr }));
  };

  const isFormDirty = () => {
    return formData.schedule_date !== "" || formData.service_focus !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schedule_date || !formData.service_focus) {
      setErrorMsg("Mohon lengkapi Tanggal Pelaksanaan dan Fokus Pelayanan.");
      return;
    }

    const scheduleData = {
      schedule_date: formData.schedule_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      service_focus: formData.service_focus,
      changed_by: username || "Kader Siti"
    };

    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem("pending_create_schedules") || "[]");
      pending.push(scheduleData);
      localStorage.setItem("pending_create_schedules", JSON.stringify(pending));

      // Optimistically update the cached schedules list
      const cached = localStorage.getItem("offline_schedules_list");
      if (cached) {
        try {
          const list = JSON.parse(cached);
          list.push({
            id: "offline-" + Date.now(),
            date: new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(formData.schedule_date)),
            rawDate: formData.schedule_date,
            time: `${formData.start_time} - ${formData.end_time} WIB`,
            focus: formData.service_focus,
            status: "Terjadwal"
          });
          localStorage.setItem("offline_schedules_list", JSON.stringify(list));
        } catch (e) {
          console.error("Failed to optimistically update offline schedules list:", e);
        }
      }

      setIsOfflineSaved(true);
      showLocalNotification("Jadwal Disimpan Offline", {
        body: `Jadwal Posyandu untuk tanggal ${formData.schedule_date} disimpan secara offline.`,
      });
      setShowSuccessModal(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createSchedule(scheduleData);

      if (res.success) {
        setIsOfflineSaved(false);
        setShowSuccessModal(true);
      } else {
        setErrorMsg(res.error || "Gagal menyimpan jadwal.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan jadwal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto pb-24 p-4 md:p-8 animate-in fade-in duration-300">
      {/* Header & Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => {
            if (isFormDirty()) {
              setShowCancelModal(true);
            } else {
              router.push("/jadwal");
            }
          }}
          className="inline-flex items-center gap-2 text-base-text-primary font-bold hover:text-brand-primary transition mb-4 cursor-pointer focus:outline-none"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali ke Jadwal
        </button>
        <h1 className="text-2xl font-extrabold text-base-text-primary tracking-tight">Tambah Jadwal Posyandu</h1>
        <p className="text-sm text-base-text-secondary">Buat jadwal agenda bulanan posyandu baru untuk para ibu &amp; anak.</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-status-pink-light border border-status-pink-solid/30 text-brand-primary rounded-lg font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-base-white border border-base-border/30 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Date Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-base-text-secondary">
            Tanggal Pelaksanaan <span className="text-brand-primary">*</span>
          </label>
          <CustomDatePicker 
            value={formData.schedule_date}
            onChange={handleDateChange}
          />
        </div>

        {/* Time Range Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-base-text-secondary">
              Waktu Mulai <span className="text-brand-primary">*</span>
            </label>
            <input 
              type="time" 
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="w-full bg-base-bg/30 border border-base-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-primary focus:bg-base-white transition text-sm text-base-text-primary font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-base-text-secondary">
              Waktu Selesai <span className="text-brand-primary">*</span>
            </label>
            <input 
              type="time" 
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="w-full bg-base-bg/30 border border-base-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-primary focus:bg-base-white transition text-sm text-base-text-primary font-medium"
              required
            />
          </div>
        </div>

        {/* Focus Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-base-text-secondary">
            Fokus Pelayanan &amp; Keterangan <span className="text-brand-primary">*</span>
          </label>
          <textarea
            name="service_focus"
            value={formData.service_focus}
            onChange={handleInputChange}
            placeholder="Contoh: Imunisasi Campak, Pengukuran KMS, & Kelas Gizi Stunting..."
            className="w-full min-h-[100px] bg-base-bg/30 border border-base-border/50 rounded-xl py-3 px-4 outline-none focus:border-brand-primary focus:bg-base-white transition text-sm text-base-text-primary font-medium resize-y"
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4 border-t border-base-border/20">
          <button
            type="button"
            onClick={() => {
              if (isFormDirty()) {
                setShowCancelModal(true);
              } else {
                router.push("/jadwal");
              }
            }}
            className="flex-1 py-3.5 rounded-xl border border-base-border/40 text-base-text-secondary font-bold text-sm hover:bg-base-bg/50 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-xl bg-brand-primary text-base-white font-extrabold text-sm hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/10 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-base-white w-[90%] max-w-[420px] rounded-2xl p-6 shadow-xl border border-base-border/20 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-status-green-light rounded-full flex items-center justify-center text-status-green-solid mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-base-text-primary">
                {isOfflineSaved ? "Jadwal Disimpan Offline" : "Jadwal Berhasil Disimpan"}
              </h3>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                {isOfflineSaved 
                  ? "Koneksi offline. Jadwal Posyandu baru disimpan secara lokal dan akan otomatis disinkronisasikan ke database saat internet aktif."
                  : "Jadwal Posyandu baru telah sukses ditambahkan dan disinkronisasikan ke database sistem."
                }
              </p>
            </div>
            <button
              onClick={() => router.push("/jadwal")}
              className="w-full py-3 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-status-pink-dark transition shadow-sm cursor-pointer"
            >
              Kembali ke Halaman Jadwal
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-base-white w-[90%] max-w-[400px] rounded-2xl p-6 shadow-xl border border-base-border/20 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-black text-base-text-primary">Batalkan Pembuatan Jadwal?</h3>
              <p className="text-xs text-base-text-secondary leading-relaxed">
                Apakah Anda yakin ingin membatalkan? Semua isian jadwal baru yang Anda tulis akan hilang.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-base-border/40 text-base-text-secondary font-bold text-xs hover:bg-base-bg/50 transition cursor-pointer"
              >
                Lanjutkan Menulis
              </button>
              <button
                type="button"
                onClick={() => router.push("/jadwal")}
                className="flex-1 py-2.5 rounded-xl bg-brand-primary text-base-white font-bold text-xs hover:bg-status-pink-dark transition shadow-sm cursor-pointer"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
