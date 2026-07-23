"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/context/UserRoleContext";
import { MdPerson, MdLock, MdErrorOutline, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { verifyUserLoginAuto } from "@/app/actions/mothers";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, login } = useUserRole();

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMsg("Harap isi username dan kata sandi.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await verifyUserLoginAuto(usernameInput, passwordInput);

      if (res.success && res.name && res.role) {
        if (res.avatarUrl) {
          localStorage.setItem("user_profile_avatar", res.avatarUrl);
        } else {
          localStorage.removeItem("user_profile_avatar");
        }
        login(res.role, usernameInput.trim());
      } else {
        setErrorMsg(res.error || "Gagal masuk. Periksa kembali username dan kata sandi Anda.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan sistem. Coba lagi.");
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-bg">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-bg p-4 select-none">

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6s]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-status-blue-solid/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-base-white rounded-bento-lg border border-base-border/20 shadow-xl p-8 space-y-6 relative overflow-hidden backdrop-blur-md">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-status-pink-dark rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
            <img
              src="/Logo.png"
              alt="Logo Kenanga Care"
              className="w-16 h-16 rounded-2xl object-cover relative border border-brand-primary/15 shadow-sm"
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-primary tracking-tight">Kenanga Care</h1>
            <p className="text-xs text-base-text-secondary font-medium">Posyandu Balita &amp; Ibu Kenanga 1</p>
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-[11px] text-base-text-secondary font-medium leading-relaxed -mt-2">
          Masukkan username dan kata sandi Anda.<br/>
          <span className="text-brand-primary font-bold">Role akan terdeteksi otomatis</span> dari sistem.
        </p>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-status-red-solid/10 border border-status-red-solid/20 text-status-red-solid p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <MdErrorOutline className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold text-base-text-secondary tracking-wider block">
              Username / No. WhatsApp / NIK
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan username atau nomor WA..."
                value={usernameInput}
                onChange={(e) => { setUsernameInput(e.target.value); setErrorMsg(""); }}
                disabled={isLoading}
                autoComplete="username"
                className="w-full bg-base-bg/30 border border-base-border/40 focus:border-brand-primary rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-colors focus:bg-base-white text-base-text-primary"
              />
              <MdPerson className="absolute left-4 top-3.5 text-base-text-secondary w-5 h-5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-bold text-base-text-secondary tracking-wider block">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi..."
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setErrorMsg(""); }}
                disabled={isLoading}
                autoComplete="current-password"
                className="w-full bg-base-bg/30 border border-base-border/40 focus:border-brand-primary rounded-xl py-3 pl-11 pr-11 text-xs font-semibold outline-none transition-colors focus:bg-base-white text-base-text-primary"
              />
              <MdLock className="absolute left-4 top-3.5 text-base-text-secondary w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-3 text-base-text-secondary hover:text-base-text-primary transition cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-brand-primary text-base-white font-extrabold text-sm rounded-xl hover:bg-status-pink-dark transition shadow-md shadow-brand-primary/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-base-white border-t-transparent rounded-full animate-spin" />
                <span>Menghubungkan...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        {/* Demo Credentials — semua role sekaligus */}
        <div className="p-3 bg-brand-soft/20 border border-brand-primary/15 rounded-xl text-[11px] space-y-2 text-base-text-secondary">
          <p className="font-extrabold text-brand-primary flex items-center gap-1">💡 Akun Simulasi:</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base-text-primary">Kader</span>
              <span>
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">kader</code>
                {" / "}
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">kader123</code>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-base-text-primary">Nakes</span>
              <span>
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">nakes</code>
                {" / "}
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">nakes123</code>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-base-text-primary">Ibu</span>
              <span>
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">08123456789</code>
                {" / "}
                <code className="bg-base-bg px-1.5 py-0.5 rounded font-bold text-base-text-primary">ibu123</code>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
