"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./MaternalHealth.module.css";
import { dummyUsers } from "@/lib/dummyData";

import { useCurrentUser } from "@/lib/userStore";

export default function MaternalHealthPage() {
  const { user } = useCurrentUser();
  
  // Interactive States (Gamified TTD Tracker)
  const [ttdWeekly, setTtdWeekly] = useState([true, true, true, false, false, false, false]);
  const [todayIndex, setTodayIndex] = useState(3); // Start at Thursday
  const [ttdPastCount, setTtdPastCount] = useState(user.ttdDiminum || 52); 
  const [streak, setStreak] = useState(4);
  const [hasTakenToday, setHasTakenToday] = useState(false);
  
  // Dynamic Calculation
  const ttdCount = ttdPastCount + ttdWeekly.filter(v => v).length + (hasTakenToday && !ttdWeekly[todayIndex] ? 1 : 0);
  
  const handleTakeTtd = () => {
    if (!hasTakenToday) {
      setHasTakenToday(true);
      setStreak(s => s + 1);
      const newWeekly = [...ttdWeekly];
      newWeekly[todayIndex] = true;
      setTtdWeekly(newWeekly);
    }
  };

  const skipToTomorrow = () => {
    if (!hasTakenToday) {
      setStreak(0); // streak reset if missed
    }
    setHasTakenToday(false);
    
    let nextIndex = todayIndex + 1;
    let nextWeekly = [...ttdWeekly];
    if (nextIndex > 6) {
      nextIndex = 0; 
      setTtdPastCount(c => c + nextWeekly.filter(Boolean).length);
      nextWeekly = [false, false, false, false, false, false, false];
    } else {
      // Clear tomorrow just in case
      nextWeekly[nextIndex] = false;
    }
    setTodayIndex(nextIndex);
    setTtdWeekly(nextWeekly);
  };
  
  const [fetalKicks, setFetalKicks] = useState(0);
  const [checklist, setChecklist] = useState({
    faskes: true,
    nakes: true,
    pendamping: false,
    transportasi: false,
    donor1: false,
    donor2: false,
  });

  // Smart Weekly Triage State
  const [triageActivity, setTriageActivity] = useState({ periksa: false, kelas: false });
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triageHistory, setTriageHistory] = useState([
    { minggu: 31, status: 'Sehat', date: '6 April 2026', symptoms: [], activities: { periksa: true, kelas: false } },
    { minggu: 30, status: 'Sehat', date: '30 Mar 2026', symptoms: [], activities: { periksa: false, kelas: true } },
    { minggu: 29, status: 'Waspada', date: '23 Mar 2026', symptoms: ['Pusing Berat'], activities: { periksa: true, kelas: false } }
  ]);
  const [selectedTriageDetail, setSelectedTriageDetail] = useState<any>(null);
  const [showTriageHistoryDrawer, setShowTriageHistoryDrawer] = useState(false);

  const toggleSymptom = (s: string) => {
    if (symptoms.includes(s)) {
      setSymptoms(symptoms.filter(item => item !== s));
    } else {
      setSymptoms([...symptoms, s]);
    }
  };

  const toggleTriageActivity = (item: keyof typeof triageActivity) => {
    setTriageActivity({ ...triageActivity, [item]: !triageActivity[item] });
  };

  const submitTriage = () => {
    const status = symptoms.length > 0 ? 'Waspada' : 'Sehat';
    const newEntry = {
      minggu: usiaMinggu,
      status: status,
      date: 'Baru saja',
      symptoms: [...symptoms],
      activities: { ...triageActivity }
    };
    setTriageHistory([newEntry, ...triageHistory]);
    setSymptoms([]);
    setTriageActivity({ periksa: false, kelas: false });
  };

  // Smart Class Passport State
  interface ClassAttendance {
    id: number;
    date: string;
    kaderInfo?: string;
    status: 'Menunggu Validasi Kader' | 'Tervalidasi ✅';
  }
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([
    { id: 1, date: '10 Feb 2026', kaderInfo: '10 Feb 2026, Bdn. Siti', status: 'Tervalidasi ✅' },
    { id: 2, date: '10 Mar 2026', kaderInfo: '10 Mar 2026, Bdn. Siti', status: 'Tervalidasi ✅' },
    { id: 3, date: '10 Apr 2026', status: 'Menunggu Validasi Kader' }
  ]);

  const recordNewClass = () => {
    const newEntry: ClassAttendance = {
      id: classAttendance.length + 1,
      date: 'Hari ini',
      status: 'Menunggu Validasi Kader'
    };
    setClassAttendance([...classAttendance, newEntry]);
  };

  const ttdDays = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

  const toggleDay = (index: number) => {
    // Only allow toggling past days, not future
    if (index > todayIndex) return;
    const newWeekly = [...ttdWeekly];
    newWeekly[index] = !newWeekly[index];
    setTtdWeekly(newWeekly);
    // Simulating manual adjustment impact on streak could be complex, we just allow it loosely
  };

  const handleKick = () => {
    setFetalKicks(fetalKicks + 1);
  };

  const toggleCheck = (item: keyof typeof checklist) => {
    setChecklist({ ...checklist, [item]: !checklist[item] });
  };

  if (user.role === 'kader') {
    return (
      <div className={styles.container}>
        <h1 className={styles.section_title}>Dashboard Kader Posyandu</h1>
        <div className={styles.card}>
          <p>Anda masuk sebagai <strong>{user.nama}</strong>. Sebagai Kader, Anda dapat mengelola data seluruh Ibu dan Anak di wilayah {user.wilayahTugas}.</p>
          <button className={styles.btn_record} style={{ marginTop: '20px' }}>Cari Data Ibu (NIK)</button>
        </div>
      </div>
    );
  }

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTtdHistoryModal, setShowTtdHistoryModal] = useState(false);

  // Status Simulator Logic
  const getTtdStatusInfo = (minggu: number, total: number) => {
    if (minggu >= 28 && total < 45) {
      return { status: 'BAHAYA', color: '#ef4444', message: 'Risiko tinggi pendarahan saat persalinan! Hubungi Bidan segera untuk konsultasi.' };
    }
    
    const ekspektasi = Math.min(minggu * 7, 90); 
    const kepatuhan = (total / ekspektasi) * 100;
    
    if (total >= ekspektasi) return { status: 'AMAN', color: '#10b981', message: 'Bunda hebat! Tetap disiplin minum TTD setiap malam hari.' };
    if (kepatuhan < 80) return { status: 'WASPADA', color: '#f59e0b', message: 'Kepatuhan TTD Bunda rendah. Jangan lupa diminum setelah makan malam ya!' };
    
    return { status: 'AMAN', color: '#10b981', message: 'Bagus! Lanjutkan jadwal rutin minum TTD-nya, Bun.' };
  };

  const usiaMinggu = 32; 
  const ttdInfo = getTtdStatusInfo(usiaMinggu, ttdCount);
  const ekspektasiMax = Math.min(usiaMinggu * 7, 90);

  // View for Pregnant Mothers (Dewi)
  const PregnantView = () => (
    <>
      {/* Full History Modal */}
      {showHistoryModal && (
        <div className={styles.modal_overlay} onClick={() => setShowHistoryModal(false)}>
          <div className={styles.modal_card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Riwayat Lengkap Pemeriksaan ANC</h3>
              <button className={styles.btn_close} onClick={() => setShowHistoryModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.modal_body}>
              <table className={styles.anc_table}>
                <thead>
                  <tr>
                    <th>Tgl / Visit</th>
                    <th>Status Janin</th>
                    <th>Nasihat & Catatan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((num) => (
                    <tr key={num}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{num === 5 ? '15 Jan' : num === 4 ? '18 Des' : num === 3 ? '20 Nov' : num === 2 ? '15 Okt' : '10 Sep'} 2026</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Kunjungan ke-{num}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px' }}>{num === 5 ? 'Pos: Kepala Bawah' : 'Sehat'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>DJJ: {140 + num} bpm</div>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '12px' }}>
                        {num === 5 ? 'Rutin minum TTD, kurangi aktivitas berat.' : 'Lanjutkan nutrisi seimbang dan istirahat cukup.'}
                      </td>
                      <td>
                        <span className={`${styles.status_pill} ${num === 4 ? styles.pill_warning : styles.pill_normal}`}>
                          {num === 4 ? 'WARNING' : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <button 
                className={styles.btn_record} 
                style={{ width: 'auto', padding: '10px 30px' }}
                onClick={() => setShowHistoryModal(false)}
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TTD History Modal */}
      {showTtdHistoryModal && (
        <div className={styles.modal_overlay} onClick={() => setShowTtdHistoryModal(false)}>
          <div className={styles.modal_card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Jurnal Kepatuhan TTD</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Target Mutlak: 90 Tablet Terpenuhi</p>
              </div>
              <button className={styles.btn_close} onClick={() => setShowTtdHistoryModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className={styles.modal_body} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '10px' }}>
                {[...Array(90)].map((_, i) => {
                  const dayNum = i + 1;
                  const isTaken = dayNum <= ttdCount;
                  const isFuture = dayNum > ekspektasiMax; 
                  
                  return (
                    <div key={i} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '4px',
                      opacity: isFuture ? 0.3 : 1
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: isTaken ? ttdInfo.color : 'white',
                        border: isTaken ? 'none' : '2px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTaken ? 'white' : '#cbd5e1',
                        fontSize: '11px',
                        fontWeight: '800',
                        transition: 'background 0.3s'
                      }}>
                        {isTaken ? '✓' : dayNum}
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>H-{dayNum}</span>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ marginTop: '24px', padding: '16px', background: `${ttdInfo.color}11`, borderRadius: '12px', fontSize: '13px', borderLeft: `3px solid ${ttdInfo.color}` }}>
                <strong>💡 Status {ttdInfo.status}:</strong> {ttdInfo.message}
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <button 
                className={styles.btn_record} 
                style={{ width: 'auto', padding: '10px 30px' }}
                onClick={() => setShowTtdHistoryModal(false)}
              >
                Tutup Jurnal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Triage Detail History Modal */}
      {selectedTriageDetail && (
        <div className={styles.modal_overlay} onClick={() => setSelectedTriageDetail(null)}>
          <div className={styles.modal_card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Rincian Skrining (Mg ke-{selectedTriageDetail.minggu})</h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Waktu pelaporan: {selectedTriageDetail.date}</p>
              </div>
              <button className={styles.btn_close} onClick={() => setSelectedTriageDetail(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className={styles.modal_body} style={{ padding: '20px' }}>
               <div style={{ background: selectedTriageDetail.status === 'Sehat' ? '#ecfdf5' : '#fef2f2', padding: '16px', borderRadius: '12px', border: `1px solid ${selectedTriageDetail.status === 'Sehat' ? '#a7f3d0' : '#fecaca'}`, marginBottom: '20px' }}>
                 <p style={{ fontSize: '13px', color: selectedTriageDetail.status === 'Sehat' ? '#065f46' : '#991b1b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   {selectedTriageDetail.status === 'Sehat' ? '✅ Status Aman & Sehat' : '🚨 Darurat / Memerlukan Intervensi'}
                 </p>
               </div>

               <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>Aktivitas Sehat:</p>
               <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                 <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', color: selectedTriageDetail.activities?.periksa ? '#10b981' : '#94a3b8', border: `1px solid ${selectedTriageDetail.activities?.periksa ? '#10b981' : '#e2e8f0'}`, fontWeight: '600' }}>
                   🩺 Periksa Kehamilan {selectedTriageDetail.activities?.periksa ? '✓' : ''}
                 </span>
                 <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', color: selectedTriageDetail.activities?.kelas ? '#10b981' : '#94a3b8', border: `1px solid ${selectedTriageDetail.activities?.kelas ? '#10b981' : '#e2e8f0'}`, fontWeight: '600' }}>
                   📚 Kelas Ibu Hamil {selectedTriageDetail.activities?.kelas ? '✓' : ''}
                 </span>
               </div>

               <p style={{ fontWeight: '700', fontSize: '13px', marginBottom: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>Keluhan Dirasakan:</p>
               {selectedTriageDetail.symptoms.length > 0 ? (
                 <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#b91c1c', margin: 0, fontWeight: '600' }}>
                   {selectedTriageDetail.symptoms.map((s: string, idx: number) => (
                     <li key={idx} style={{ marginBottom: '6px' }}>{s}</li>
                   ))}
                 </ul>
               ) : (
                 <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>Tidak ada keluhan. Tubuh sehat dan bugar.</p>
               )}

            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', textAlign: 'center', background: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                className={styles.btn_record} 
                style={{ width: '100%' }}
                onClick={() => setSelectedTriageDetail(null)}
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Triage History Drawer */}
      <div 
        className={styles.modal_overlay} 
        style={{ 
          opacity: showTriageHistoryDrawer ? 1 : 0, 
          visibility: showTriageHistoryDrawer ? 'visible' : 'hidden', 
          transition: 'all 0.3s ease',
          zIndex: 100 
        }} 
        onClick={() => setShowTriageHistoryDrawer(false)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            right: showTriageHistoryDrawer ? 0 : '-100%',
            width: '100%',
            maxWidth: '60vw',
            minWidth: '320px',
            height: '100%',
            background: 'white',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
            transition: 'right 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 101,
            borderTopLeftRadius: '24px',
            borderBottomLeftRadius: '24px',
            overflow: 'hidden'
          }}
        >
           <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Riwayat Skrining Mingguan</h3>
             <button onClick={() => setShowTriageHistoryDrawer(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
             </button>
           </div>
           
           <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {triageHistory.map((hx, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedTriageDetail(hx)}
                  style={{ 
                    background: '#f8fafc', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    borderLeft: `4px solid ${hx.status === 'Sehat' ? '#10b981' : '#ef4444'}`, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Minggu ke-{hx.minggu}</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>{hx.date}</p>
                    {hx.symptoms.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {hx.symptoms.map((sym, idx) => (
                          <span key={idx} style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>{sym}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: hx.status === 'Sehat' ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {hx.status === 'Sehat' ? '✅ Aman' : '🚨 Darurat'}
                    </div>
                    <button 
                      style={{ background: '#e2e8f0', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: '700', color: '#475569', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#cbd5e1'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#e2e8f0'}
                    >
                      Rincian
                    </button>
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* SECTION 1: HERO & STATUS */}
      <div className={styles.hero_section}>
        <div>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Pemantauan Kehamilan Ibu</p>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0' }}>{user.nama}</h1>
          <p style={{ fontSize: '15px', opacity: 0.9 }}>
            Suami: {user.namaSuami} • {user.tglLahir} (29 th)
          </p>
          <div className={`${styles.hero_badge} ${styles.badge_warning}`}>
            Kehamilan Risiko Sedang (Anemia)
          </div>
        </div>

        <div className={styles.hero_stats}>
          <div className={styles.stat_item}>
            <span>Usia Kehamilan</span>
            <h3>{usiaMinggu} Minggu</h3>
          </div>
          <div className={styles.stat_item}>
            <span>Trimester</span>
            <h3>III (Tiga)</h3>
          </div>
          <div className={styles.stat_item}>
            <span>HPL (Perkiraan)</span>
            <h3>{user.hpl || '17 April 2026'}</h3>
          </div>
          <div className={styles.stat_item}>
            <span>Status GPA</span>
            <h3>G2 P1 A0</h3>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE DASHBOARD */}
      <div className={styles.widget_grid}>
        {/* GAMIFIED TTD WIDGET */}
        <div className={styles.card} style={{ border: `2px solid ${ttdInfo.color}33`, position: 'relative', overflow: 'hidden' }}>
          
          <div className={styles.card_title} style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="https://img.icons8.com/3d-fluency/94/pill.png" width={28} height={28} alt="TTD" />
              <span style={{ fontSize: '16px', fontWeight: '800' }}>Catatan Minum TTD Bunda</span>
            </div>
            
            {/* Simulation Dev Toggle */}
            <button 
              onClick={skipToTomorrow} 
              style={{ fontSize: '10px', background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
            >
              Lewati ke Besok ⏩
            </button>
          </div>

          {/* Streak Banner */}
          {streak >= 3 ? (
            <div style={{ background: '#fffbeb', color: '#d97706', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔥 {streak} Hari Berturut-turut! Pertahankan Bunda!
            </div>
          ) : (
             <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
               Ayo semangat kumpulkan streak minum rutin!
             </div>
          )}
          
          {/* Main Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <button 
              onClick={handleTakeTtd}
              disabled={hasTakenToday}
              style={{ 
                background: hasTakenToday ? '#f1f5f9' : 'linear-gradient(135deg, #ea2986 0%, #c026d3 100%)', 
                color: hasTakenToday ? '#94a3b8' : 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '800',
                cursor: hasTakenToday ? 'default' : 'pointer',
                boxShadow: hasTakenToday ? 'none' : '0 10px 25px rgba(234, 41, 134, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transform: hasTakenToday ? 'scale(1)' : 'scale(1.02)'
              }}
            >
              {hasTakenToday ? '✅ Sudah Diminum Hari Ini' : '💊 Catat TTD Hari Ini'}
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
              <span>Total Diminum: {ttdCount} / 90 Tablet</span>
              <span style={{ color: ttdInfo.color }}>{Math.round((ttdCount / 90) * 100)}% Terselesaikan</span>
            </div>
            <div className={styles.progress_container} style={{ height: '10px', borderRadius: '10px' }}>
               <div className={styles.progress_bar} style={{ width: `${(ttdCount / 90) * 100}%`, backgroundColor: ttdInfo.color, transition: 'all 0.5s ease', borderRadius: '10px' }}></div>
            </div>
          </div>
          
          {/* Current Week History */}
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Riwayat 7 Hari Terakhir</p>
            <div className={styles.ttd_log_container} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
              {ttdWeekly.map((taken, i) => {
                const isAfterToday = i > todayIndex;
                const isToday = i === todayIndex;
                return (
                 <div key={i} className={styles.day_item} style={{ opacity: isAfterToday ? 0.3 : 1 }}>
                   <div 
                     className={`${styles.day_circle} ${taken ? styles.day_circle_taken : ''} ${isToday ? styles.day_circle_today : ''}`}
                     style={taken ? { backgroundColor: ttdInfo.color, borderColor: ttdInfo.color } : {}}
                   >
                     {taken ? '✓' : ''}
                   </div>
                   <span className={styles.day_label} style={{ color: isToday ? '#1e293b' : '#64748b', fontWeight: isToday ? '700' : '500' }}>
                     {isToday ? 'Hr Ini' : ttdDays[i]}
                   </span>
                 </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <button 
              className={styles.btn_text} 
              style={{ padding: 0, justifyContent: 'center', width: '100%', color: ttdInfo.color }}
              onClick={() => setShowTtdHistoryModal(true)}
            >
              <span>Lihat Kalender TTD Lengkap</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.card_title}>
            <img src="https://img.icons8.com/3d-fluency/94/footprints.png" width={32} height={32} alt="Kick" />
            <span>Gerak Janin (Trimester 3)</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Target: Minimal 10 gerakan / 12 jam</div>
          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <span style={{ fontSize: '42px', fontWeight: '800', color: '#ea2986' }}>{fetalKicks}</span>
            <p style={{ fontSize: '12px', fontWeight: '600' }}>Gerakan Terdeteksi</p>
          </div>
          <button className={styles.btn_record} onClick={handleKick} style={{ background: '#f8fafc', color: '#ea2986', border: '1px solid #ea2986' }}>🦶 Catat 1 Tendangan</button>
        </div>
      </div>

      {/* SECTION 2.5: SMART WEEKLY TRIAGE */}
      <h2 className={styles.section_title} style={{ marginTop: '32px' }}>Skrining Kehamilan - Minggu {usiaMinggu}</h2>
      <div className={styles.card} style={{ marginBottom: '32px' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '24px' }}>
          
          {/* KOLOM KIRI: AKTIVITAS */}
          <div style={{ flex: '0 0 auto', width: '320px' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Aktivitas Sehat Minggu Ini:</p>
            <div className={styles.checklist_item} onClick={() => toggleTriageActivity('periksa')} style={{ cursor: 'pointer', padding: '8px 0' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: triageActivity.periksa ? '#10b981' : 'white', borderColor: triageActivity.periksa ? '#10b981' : '#cbd5e1', transition: 'all 0.2s' }}>
                {triageActivity.periksa && <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <span style={{ marginLeft: '12px', fontWeight: triageActivity.periksa ? '600' : '500', color: '#334155' }}>🩺 Sudah Periksa Kehamilan</span>
            </div>
            <div className={styles.checklist_item} onClick={() => toggleTriageActivity('kelas')} style={{ cursor: 'pointer', padding: '8px 0', marginBottom: '16px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: triageActivity.kelas ? '#10b981' : 'white', borderColor: triageActivity.kelas ? '#10b981' : '#cbd5e1', transition: 'all 0.2s' }}>
                {triageActivity.kelas && <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <span style={{ marginLeft: '12px', fontWeight: triageActivity.kelas ? '600' : '500', color: '#334155' }}>📚 Ikut Kelas Ibu Hamil</span>
            </div>
          </div>
          
          {/* KOLOM KANAN: KELUHAN */}
          <div style={{ flex: '1 1 400px', paddingLeft: '32px', borderLeft: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Apakah ada keluhan spesifik hari ini?</p>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Tekan keluhan yang Bunda rasakan. Abaikan jika sehat.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'Demam > 2 hari', icon: '🤒' },
                { id: 'Pusing Berat', icon: '😵' },
                { id: 'Sulit Tidur', icon: '😰' },
                { id: 'Batuk Lama', icon: '😷' },
                usiaMinggu >= 24 ? { id: 'Gerak Bayi Berkurang', icon: '🛑' } : null,
                { id: 'Nyeri Perut', icon: '💥' },
                { id: 'Keluar Cairan', icon: '🩸' },
                { id: 'Sakit Kencing', icon: '🚽' },
                { id: 'Diare', icon: '💩' }
              ].filter(Boolean).map((s, i) => {
                const isSelected = symptoms.includes(s!.id);
                return (
                  <button 
                    key={i} 
                    onClick={() => toggleSymptom(s!.id)}
                    style={{
                      background: isSelected ? '#fee2e2' : '#f8fafc',
                      border: `1px solid ${isSelected ? '#ef4444' : '#e2e8f0'}`,
                      color: isSelected ? '#b91c1c' : '#475569',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 2px 8px rgba(239,68,68,0.2)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{s!.icon}</span> {s!.id}
                  </button>
                )
              })}
            </div>
          </div>
          
        </div>

        {/* SUBMIT BUTTON - CONDITIONAL */}
        <div>
          {symptoms.length > 0 ? (
            <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px', padding: '16px' }}>
              <h4 style={{ color: '#b91c1c', margin: '0 0 8px 0', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.pulse_icon} style={{ animation: 'pulse 2s infinite' }}>🚨</span> Peringatan Tanda Bahaya!
              </h4>
              <p style={{ color: '#991b1b', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' }}>
                Bunda, gejala yang Bunda alami butuh penanganan segera untuk dievaluasi kondisinya. Jangan ditunda ya.
              </p>
              <button 
                onClick={submitTriage}
                style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
              >
                📞 Hubungi Bidan Desa & Simpan (Darurat)
              </button>
            </div>
          ) : (
            <button 
              onClick={submitTriage}
              style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
            >
              ✅ Saya Sehat Minggu Ini - Simpan Laporan
            </button>
          )}

        </div>
        
        {/* TRIAGE HISTORY BUTTON */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px dashed #f1f5f9' }}>
          <button 
            onClick={() => setShowTriageHistoryDrawer(true)}
            style={{ 
              width: '100%', 
              background: '#f8fafc', 
              color: '#475569', 
              border: '2px solid #e2e8f0', 
              padding: '16px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '14px', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              transition: 'all 0.2s' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📅</span>
              Riwayat Skrining Sebelumnya
            </div>
            <span style={{ color: '#94a3b8' }}>➔</span>
          </button>
        </div>
        </div>
        {/* END OF TRIAGE HISTORY BUTTON */}

      {/* SECTION 2.6: PASPOR KELAS IBU HAMIL */}
      <h2 className={styles.section_title} style={{ marginTop: '32px' }}>Paspor Kelas Ibu Hamil</h2>
      <div className={styles.card} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>Riwayat Stempel Kehadiran</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Catat tanggal kelas dan minta paraf Bidan/Kader sebagai bukti.</p>
          </div>
          <button 
            onClick={recordNewClass}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '50px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '16px' }}>🙋‍♀️</span> Catat Kehadiran Baru
          </button>
        </div>

        {/* Circular Stamps Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '20px', marginBottom: '32px', justifyItems: 'center' }}>
          {[...Array(classAttendance.length + 1)].map((_, i) => {
            const cls = classAttendance[i];
            const isFilled = !!cls;
            const isValidated = cls?.status === 'Tervalidasi ✅';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  border: isFilled ? 'none' : '2px dashed #cbd5e1',
                  background: isFilled ? (isValidated ? '#d1fae5' : '#fef3c7') : '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  boxShadow: isFilled ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                  color: isFilled ? (isValidated ? '#10b981' : '#d97706') : '#cbd5e1',
                  position: 'relative'
                }}>
                  {isFilled ? (isValidated ? '✅' : '⏳') : i + 1}
                  {isFilled && isValidated && (
                    <div style={{ position: 'absolute', inset: -2, border: '3px solid #10b981', borderRadius: '50%', transform: 'rotate(-15deg)', opacity: 0.3 }} />
                  )}
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: isFilled ? '#1e293b' : '#94a3b8' }}>Kelas {i + 1}</span>
              </div>
            )
          })}
        </div>

        {/* History List */}
        <div style={{ borderTop: '2px dashed #f1f5f9', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Riwayat Verifikasi Kader</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {classAttendance.map((att, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                padding: '16px', 
                background: '#f8fafc', 
                borderRadius: '12px', 
                borderLeft: `4px solid ${att.status === 'Tervalidasi ✅' ? '#10b981' : '#f59e0b'}`,
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Pertemuan ke-{idx + 1}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>📅 Tanggal Hadir: {att.date}</p>
                  {att.kaderInfo && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>✍️ Paraf: {att.kaderInfo}</p>}
                </div>
                <div style={{ textAlign: 'right', paddingLeft: '16px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    background: att.status === 'Tervalidasi ✅' ? '#d1fae5' : '#fef3c7', 
                    color: att.status === 'Tervalidasi ✅' ? '#065f46' : '#b45309',
                    whiteSpace: 'nowrap'
                  }}>
                    {att.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: MEDICAL INDICATORS (10T) */}
      <h2 className={styles.section_title}>Ringkasan Indikator Medis</h2>
      <div className={styles.indicators_grid}>
        <div className={`${styles.card} ${styles.indicator_card}`}>
          <span className={styles.indicator_label}>Berat Badan</span>
          <span className={styles.indicator_value}>64.5 <small style={{fontSize: '14px'}}>kg</small></span>
          <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700' }}>+12kg dari awal</span>
        </div>
        <div className={`${styles.card} ${styles.indicator_card}`}>
          <span className={styles.indicator_label}>Tekanan Darah</span>
          <span className={styles.indicator_value}>110/70</span>
          <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700' }}>Normal</span>
        </div>
        <div className={`${styles.card} ${styles.indicator_card}`}>
          <span className={styles.indicator_label}>LILA</span>
          <span className={styles.indicator_value}>24.5 <small style={{fontSize: '14px'}}>cm</small></span>
          <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700' }}>Normal</span>
        </div>
        <div className={`${styles.card} ${styles.indicator_card}`}>
          <span className={styles.indicator_label}>Kadar Hb</span>
          <span className={styles.indicator_value}>9.8 <small style={{fontSize: '14px'}}>g/dL</small></span>
          <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>Anemia Ringan</span>
        </div>
      </div>

      {/* SECTION 4: ANC TABLE */}
      <h2 className={styles.section_title}>Riwayat Pemeriksaan (ANC)</h2>
      <div className={styles.anc_table_wrapper}>
        <table className={styles.anc_table}>
          <thead>
            <tr>
              <th>Tanggal / Visit</th>
              <th>Status Janin</th>
              <th>Nasihat & Catatan Bidan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ fontWeight: 700 }}>15 Jan 2026</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Kunjungan ke-5</div>
              </td>
              <td>
                <div>Pos: Kepala Bawah</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>DJJ: 145 bpm • TFU: 28 cm</div>
              </td>
              <td style={{ maxWidth: '300px' }}>
                Rutin minum TTD, kurangi aktivitas berat, pantau gerak janin.
              </td>
              <td>
                <span className={`${styles.status_pill} ${styles.pill_normal}`}>NORMAL</span>
              </td>
            </tr>
            <tr>
              <td>
                <div style={{ fontWeight: 700 }}>18 Des 2025</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Kunjungan ke-4</div>
              </td>
              <td>
                <div>Sehat</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Hb: 9.5 (Rendah)</div>
              </td>
              <td style={{ maxWidth: '300px' }}>
                Tambah asupan protein dan sayuran hijau. Lanjutkan TTD.
              </td>
              <td>
                <span className={`${styles.status_pill} ${styles.pill_warning}`}>WARNING</span>
              </td>
            </tr>
            <tr>
              <td>
                <div style={{ fontWeight: 700 }}>20 Nov 2025</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Kunjungan ke-3</div>
              </td>
              <td>
                <div>Sehat</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>G2 P1 A0</div>
              </td>
              <td style={{ maxWidth: '300px' }}>
                Perbanyak istirahat karena keluhan mual di pagi hari.
              </td>
              <td>
                <span className={`${styles.status_pill} ${styles.pill_normal}`}>NORMAL</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className={styles.anc_table_footer}>
          <button className={styles.btn_text} onClick={() => setShowHistoryModal(true)}>
            <span>Buka Riwayat Lengkap</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* SECTION 5: DELIVERY PLAN */}
      <h2 className={styles.section_title}>Amanat Persalinan (Ceklis Persiapan)</h2>
      <div className={styles.card}>
        <div className={styles.checklist_item} onClick={() => toggleCheck('faskes')}>
          <input type="checkbox" checked={checklist.faskes} readOnly />
          <span>Lokasi: Puskesmas Setiabudi (Siaga 24 Jam)</span>
        </div>
        <div className={styles.checklist_item} onClick={() => toggleCheck('nakes')}>
          <input type="checkbox" checked={checklist.nakes} readOnly />
          <span>Tenaga Kesehatan: Bidan Yanti</span>
        </div>
        <div className={styles.checklist_item} onClick={() => toggleCheck('transportasi')}>
          <input type="checkbox" checked={checklist.transportasi} readOnly />
          <span>Transportasi: Ambulans Desa / Mobil Pribadi</span>
        </div>
        <div className={styles.checklist_item} onClick={() => toggleCheck('donor1')}>
          <input type="checkbox" checked={checklist.donor1} readOnly />
          <span>Donor Darah Siaga: Bpk. Budi (Gol A)</span>
        </div>
      </div>

      {/* SECTION 7: EDU BANNERS */}
      <h2 className={styles.section_title} style={{ marginTop: '40px' }}>Pojok Edukasi Penting</h2>
      <div className={styles.edu_scroll}>
        <Link href="/edukasi/tanda-bahaya" className={styles.edu_banner} style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=60)' }}>
          <span>🚨 Tanda Bahaya Kehamilan</span>
        </Link>
        <Link href="/edukasi/nutrisi" className={styles.edu_banner} style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=60)' }}>
          <span>📖 Nutrisi & Isi Piringku</span>
        </Link>
      </div>
    </>
  );

  // View for Non-Pregnant Mothers (Siti)
  const GeneralHealthView = () => (
    <>
      <div className={styles.hero_section} style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
        <div>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>Kesehatan Ibu & Keluarga</p>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '4px 0' }}>{user.nama}</h1>
          <p style={{ fontSize: '15px', opacity: 0.9 }}>
            Suami: {user.namaSuami} • {user.alamat}
          </p>
          <div className={`${styles.hero_badge}`} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            Status: Tidak Sedang Hamil
          </div>
        </div>

        <div className={styles.hero_stats}>
          <div className={styles.stat_item}>
            <span>Jumlah Anak</span>
            <h3>{user.children?.length} Anak</h3>
          </div>
          <div className={styles.stat_item}>
            <span>KB Digunakan</span>
            <h3>IUD (Aktif)</h3>
          </div>
          <div className={styles.stat_item}>
            <span>Kehamilan Terakhir</span>
            <h3>Normal (2025)</h3>
          </div>
        </div>
      </div>

      <div className={styles.widget_grid}>
        <div className={styles.card}>
          <div className={styles.card_title}>
            <img src="https://img.icons8.com/3d-fluency/94/gender-neutral-user.png" width={32} alt="Kids" />
            <span>Daftar Anak</span>
          </div>
          <div style={{ marginTop: '10px' }}>
            {user.children?.map((child, i) => (
              <div key={i} className={styles.checklist_item} style={{ borderBottom: '1px solid #f1f5f9', padding: '10px 0' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
                <span style={{ fontWeight: 600 }}>{child.nama}</span>
              </div>
            ))}
          </div>
          <Link href="/ibu/pantau" className={styles.btn_record} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: '#6366f1' }}>Pantau Pertumbuhan Anak</Link>
        </div>

        <div className={styles.card}>
          <div className={styles.card_title}>
            <img src="https://img.icons8.com/3d-fluency/94/hospital.png" width={32} alt="Clinic" />
            <span>Pemeriksaan Rutin Wanita</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Jadwal kontrol KB atau skrining kesehatan reproduksi.</p>
          <div className={styles.checklist_item}>
             <input type="checkbox" checked /> <span>Kontrol IUD (Februari 2026)</span>
          </div>
          <div className={styles.checklist_item}>
             <input type="checkbox" /> <span>Skrining IVA / Papsmear</span>
          </div>
        </div>
      </div>

      <h2 className={styles.section_title}>Pusat Edukasi Kesehatan Wanita</h2>
      <div className={styles.edu_scroll}>
        <Link href="/edukasi/manajemen-asi" className={styles.edu_banner} style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop&q=60)' }}>
          <span>📖 Manajemen ASI Perah</span>
        </Link>
        <Link href="/edukasi/kb-modern" className={styles.edu_banner} style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1584362193108-62a2fa627341?w=800&auto=format&fit=crop&q=60)' }}>
          <span>📖 Memilih Kontrasepsi Modern</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      {user.isPregnant ? <PregnantView /> : <GeneralHealthView />}
    </div>
  );
}
