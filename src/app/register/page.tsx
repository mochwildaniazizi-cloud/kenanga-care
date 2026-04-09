"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/Auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    nik: "",
    whatsapp: "",
  });
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.nik && formData.whatsapp) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating registration process
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login"); 
    }, 1500);
  };

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  return (
    <div className={styles.auth_container}>
      <div className={styles.auth_card}>
        {/* Left Side: Illustration */}
        <div className={styles.auth_side}>
          <div className={styles.auth_illustration}>
            <img 
              src="https://img.icons8.com/3d-fluency/300/mother-holding-baby.png" 
              alt="Kenanga Care Registration" 
              width={260}
            />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Bergabung Sekarang</h2>
          <p style={{ opacity: 0.9, lineHeight: '1.6', fontSize: '15px' }}>
            Mulai petualangan sehat Ibu dan si kecil dengan dukungan penuh dari Kenanga Care.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className={styles.auth_form_side}>
          {step === 2 && (
            <div className={styles.auth_back_btn} onClick={() => setStep(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Kembali
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src="/icon.png" alt="Logo" width={32} height={32} />
              <span style={{ fontWeight: '800', fontSize: '20px', color: '#ea2986' }}>Kenanga Care</span>
            </div>
            <h1 className={styles.auth_title}>
              {step === 1 ? "Daftar Akun" : "Buat PIN Baru"}
            </h1>
            <p className={styles.auth_subtitle}>
              {step === 1 
                ? "NIK Anda adalah kunci rekam medis masa depan si kecil."
                : "PIN ini akan digunakan setiap kali Anda masuk ke akun."
              }
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div className={styles.form_group}>
                <div className={styles.input_wrapper}>
                  <img 
                    src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" 
                    className={styles.input_icon} 
                    alt="Name Icon"
                  />
                  <input
                    type="text"
                    placeholder="Nama Lengkap Bunda"
                    className={styles.input_field}
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.form_group}>
                <div className={styles.input_wrapper}>
                  <img 
                    src="https://img.icons8.com/3d-fluency/94/identity-card.png" 
                    className={styles.input_icon} 
                    alt="NIK Icon"
                  />
                  <input
                    type="text"
                    placeholder="Nomor NIK (Sesuai KTP)"
                    className={styles.input_field}
                    required
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.form_group}>
                <div className={styles.input_wrapper}>
                  <img 
                    src="https://img.icons8.com/3d-fluency/94/whatsapp.png" 
                    className={styles.input_icon} 
                    alt="WhatsApp Icon"
                  />
                  <input
                    type="text"
                    placeholder="Nomor WhatsApp"
                    className={styles.input_field}
                    required
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className={styles.btn_primary}>
                Lanjut
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.pin_input_container} style={{ margin: '8px 0 24px 0' }}>
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.pin_digit}
                    value={digit}
                    onChange={(e) => handlePinChange(e.target.value, i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !pin[i] && i > 0) {
                        document.getElementById(`pin-${i-1}`)?.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.4' }}>
                Dengan mendaftarkan akun, Anda menyetujui seluruh <a href="#" className={styles.auth_link}>Syarat & Ketentuan</a> Kenanga Care.
              </p>

              <button type="submit" className={styles.btn_primary} disabled={isLoading}>
                {isLoading ? "Mendaftarkan..." : "Daftar & Beri Proteksi PIN"}
              </button>
            </form>
          )}

          <p className={styles.auth_footer}>
            Sudah punya akun? <Link href="/login" className={styles.auth_link}>Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
