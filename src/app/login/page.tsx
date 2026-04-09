"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Auth.module.css";

import { dummyUsers, UserPersona } from "@/lib/dummyData";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'wa' | 'nik'>('wa');
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<UserPersona | null>(null);
  const [error, setError] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Clean search (remove dashes/spaces from WA)
    const cleanId = identifier.replace(/[-\s]/g, "");
    
    const user = dummyUsers.find(u => {
      const cleanUserWa = u.whatsapp.replace(/[-\s]/g, "");
      return loginMethod === 'wa' ? cleanUserWa === cleanId : u.nik === cleanId;
    });

    if (user) {
      setVerifiedUser(user);
      setStep(2);
    } else {
      setError("Data tidak ditemukan. Silakan periksa kembali nomor Anda atau daftar akun baru.");
    }
  };

  const [isRedirecting, setIsRedirecting] = useState(false);

  const performLogin = (enteredPin: string) => {
    setIsLoading(true);
    setError("");
    
    // Simulating login process with PIN verification
    setTimeout(() => {
      setIsLoading(false);
      if (enteredPin === verifiedUser?.pin) {
        // Successful login - Show transition loader
        setIsRedirecting(true);
        setTimeout(() => {
          router.push("/ibu"); 
        }, 1500);
      } else {
        setError("PIN yang Anda masukkan salah. Silakan coba lagi.");
        setPin(["", "", "", "", "", ""]);
        document.getElementById("pin-0")?.focus();
      }
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(pin.join(""));
  };

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Auto submit when all 6 digits are filled
    if (value && index === 5 && newPin.every(d => d !== "")) {
      performLogin(newPin.join(""));
    }
  };

  return (
    <div className={styles.auth_container}>
      {/* Fullscreen Transition Loader */}
      {isRedirecting && (
        <div className={styles.loading_overlay}>
          <div className={styles.loader_spinner}></div>
          <div className={styles.loader_logo}>
            <img src="/icon.png" alt="Kenanga Care" width={80} height={80} />
          </div>
          <p style={{ marginTop: '20px', fontWeight: '700', color: '#ea2986' }}>
            Menyiapkan Dashboard Bunda...
          </p>
        </div>
      )}

      <div className={styles.auth_card}>
        {/* Left Side: Branding & Illustration */}
        <div className={styles.auth_side}>
          <div className={styles.auth_illustration}>
            <img 
              src="https://img.icons8.com/3d-fluency/300/heart-with-pulse.png" 
              alt="Kenanga Care Illustration" 
              width={240}
            />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Selamat datang kembali Bunda & Kader!</h2>
          <p style={{ opacity: 0.9, lineHeight: '1.6', fontSize: '15px' }}>
            Pantau kesehatan Anda dan si kecil dengan mudah di satu tempat.
          </p>
        </div>

        {/* Right Side: Form */}
        <div className={styles.auth_form_side}>
          {step === 2 && (
            <div className={styles.auth_back_btn} onClick={() => { setStep(1); setPin(["", "", "", "", "", ""]); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Kembali
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src="/icon.png" alt="Logo" width={32} height={32} />
              <span style={{ fontWeight: '800', fontSize: '20px', color: '#ea2986' }}>Kenanga Care</span>
            </div>
            <h1 className={styles.auth_title}>
              {step === 1 ? "Masuk Akun" : "Masukkan PIN"}
            </h1>
            <p className={styles.auth_subtitle}>
              {step === 1 
                ? `Masukkan ${loginMethod === 'wa' ? 'Nomor WhatsApp' : 'NIK'} Anda untuk melanjutkan.`
                : <span>Halo, {verifiedUser?.role === 'kader' ? 'Kader' : 'Bunda'} <strong>{verifiedUser?.nama}</strong>! Silahkan masukkan 6 digit PIN keamanan Anda.</span>
              }
            </p>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#b91c1c', 
              padding: '12px', 
              borderRadius: '12px', 
              fontSize: '13px', 
              marginBottom: '20px',
              border: '1px solid #fee2e2'
            }}>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div className={styles.form_group}>
                <div className={styles.input_wrapper}>
                  <img 
                    src={loginMethod === 'wa' 
                      ? "https://img.icons8.com/3d-fluency/94/whatsapp.png"
                      : "https://img.icons8.com/3d-fluency/94/identity-card.png"
                    }
                    className={styles.input_icon} 
                    alt="Icon"
                  />
                  <input
                    type="text"
                    placeholder={loginMethod === 'wa' ? "Nomor WhatsApp (Contoh: 0812...)" : "Nomor NIK"}
                    className={styles.input_field}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className={styles.btn_primary}>
                Lanjut Masuk
              </button>

              <div className={styles.divider_text}>
                <span>atau masuk dengan</span>
              </div>

              <div className={styles.social_login}>
                <button type="button" className={styles.social_btn}>
                  <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" width={20} />
                  Google
                </button>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <div 
                  className={styles.auth_link} 
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                  onClick={() => {
                    setLoginMethod(loginMethod === 'wa' ? 'nik' : 'wa');
                    setIdentifier("");
                    setError("");
                  }}
                >
                  {loginMethod === 'wa' ? "Masuk dengan NIK" : "Masuk dengan WhatsApp"}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.pin_input_container}>
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

              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <a href="#" className={styles.auth_link} style={{ fontSize: '14px' }}>Lupa PIN?</a>
              </div>

              <button type="submit" className={styles.btn_primary} disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>
          )}

          <p className={styles.auth_footer}>
            Belum punya akun? <Link href="/register" className={styles.auth_link}>Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
