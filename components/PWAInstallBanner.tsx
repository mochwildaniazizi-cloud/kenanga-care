"use client";

import { useState, useEffect } from "react";
import { MdOutlineInstallMobile, MdClose } from "react-icons/md";
import { FiShare } from "react-icons/fi";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Check if user dismissed banner recently
    const isDismissed = localStorage.getItem("pwa_install_dismissed") === "true";
    if (isDismissed) return;

    // 3. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // iOS Safari doesn't support beforeinstallprompt, but we can show guide
      setIsVisible(true);
    }

    // 4. Listen for Chrome/Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show native prompt
    deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-brand-primary/10 via-status-pink-light/50 to-brand-soft/80 border border-brand-primary/20 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3.5 pr-6">
        <div className="w-10 h-10 rounded-xl bg-brand-primary text-base-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-primary/20">
          <MdOutlineInstallMobile className="w-5.5 h-5.5" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-sm text-base-text-primary">Gunakan Kenanga Care Seperti Aplikasi</h4>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            {isIOS 
              ? "Instal di iPhone Anda: Ketuk ikon bagikan (share) di Safari, lalu pilih 'Tambahkan ke Layar Utama'." 
              : "Instal aplikasi ini ke layar utama ponsel Anda untuk performa lebih cepat, hemat kuota, dan akses offline penuh."
            }
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pl-13 sm:pl-0">
        {!isIOS ? (
          <button 
            onClick={handleInstallClick}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-brand-primary text-base-white text-xs font-bold hover:bg-status-pink-dark transition shadow-sm cursor-pointer"
          >
            Instal Aplikasi
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-[10px] tracking-wide uppercase border border-brand-primary/15 select-none">
            <FiShare className="w-3.5 h-3.5" />
            <span>Bagikan &gt; Tambah ke Layar Utama</span>
          </div>
        )}
        <button 
          onClick={handleDismiss}
          className="p-2 text-base-text-secondary hover:text-base-text-primary rounded-lg hover:bg-base-border/20 transition cursor-pointer"
          aria-label="Tutup"
        >
          <MdClose className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
