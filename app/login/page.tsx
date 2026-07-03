"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole, UserRole } from "@/context/UserRoleContext";
import { MdPerson, MdLock, MdErrorOutline } from "react-icons/md";
import { verifyUserLogin } from "@/app/actions/mothers";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useUserRole();

  // Form States
  const [selRole, setSelRole] = useState<UserRole>("kader");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMsg("Harap isi semua kolom input.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyUserLogin(usernameInput, passwordInput, selRole);
      
      if (res.success && res.name) {
        if (res.avatarUrl) {
          localStorage.setItem("user_profile_avatar", res.avatarUrl);
        } else {
          localStorage.removeItem("user_profile_avatar");
        }
        // Log in using the entered username so we can locate the profile easily
        login(selRole, usernameInput.trim());
      } else {
        setErrorMsg(res.error || "Gagal masuk. Periksa kembali input Anda.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem saat masuk.");
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-bg">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-bg p-4 select-none">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-status-blue-solid/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]"></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-base-white rounded-bento-lg border border-base-border/20 shadow-xl p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
        
        {/* Card Top / Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-status-pink-dark rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <img 
              src="/Logo.png" 
              alt="Logo Kenanga Care" 
              className="w-16 h-16 rounded-2xl object-cover relative border border-brand-primary/15 shadow-sm" 
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-primary tracking-tight">Kenanga Care</h2>
            <p className="text-xs text-base-text-secondary font-medium">Posyandu Balita &amp; Ibu Kenanga 1</p>
          </div>
        </div>

        {/* Role Selector Toggle */}
        <div className="flex bg-base-bg/50 p-1.5 rounded-xl border border-base-border/10">
          <button
            type="button"
            onClick={() => {
              setSelRole("kader");
              setErrorMsg("");
              setUsernameInput("");
              setPasswordInput("");
            }}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selRole === "kader"
                ? "bg-brand-primary text-base-white shadow-md shadow-brand-primary/10"
                : "text-base-text-secondary hover:text-base-text-primary"
            }`}
          >
            Kader Posyandu
          </button>
          <button
            type="button"
            onClick={() => {
              setSelRole("ibu");
              setErrorMsg("");
              setUsernameInput("");
              setPasswordInput("");
            }}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selRole === "ibu"
                ? "bg-brand-primary text-base-white shadow-md shadow-brand-primary/10"
                : "text-base-text-secondary hover:text-base-text-primary"
            }`}
          >
            Ibu / Orang Tua
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="bg-status-red-solid/10 border border-status-red-solid/20 text-status-red-solid p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <MdErrorOutline className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Field: Username */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold text-base-text-secondary tracking-wider block">
              {selRole === "kader" ? "Username" : "No. WhatsApp / NIK"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={selRole === "kader" ? "Masukkan username..." : "Masukkan NIK / No. WA..."}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-base-bg/30 border border-base-border/40 focus:border-brand-primary rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-colors focus:bg-base-white text-base-text-primary"
              />
              <MdPerson className="absolute left-4 top-3.5 text-base-text-secondary w-5 h-5" />
            </div>
          </div>

          {/* Field: Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold text-base-text-secondary tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                disabled={isLoading}
                className="w-full bg-base-bg/30 border border-base-border/40 focus:border-brand-primary rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-colors focus:bg-base-white text-base-text-primary"
              />
              <MdLock className="absolute left-4 top-3.5 text-base-text-secondary w-5 h-5" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-primary text-base-white font-extrabold text-sm rounded-xl hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-base-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menghubungkan...</span>
              </>
            ) : (
              <span>Masuk Aplikasi</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
