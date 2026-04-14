"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useCurrentUser } from "@/lib/userStore";

// Simulating Lucide Icons for now using simple SVGs to avoid dependency issues early on
// We will replace these with real Lucide icons if requested later.
const HomeIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/home.png" 
    alt="Ikon Beranda"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const UserIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" 
    alt="Ikon Profil"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const HistoryIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const BookOpenIcon = () => (
  <img 
    src="https://img.icons8.com/?size=100&id=n1Z4H7G4RdY0&format=png&color=000000" 
    alt="Ikon Edukasi"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const TrendingUpIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const WomanIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/user-female--v2.png" 
    alt="Ikon Ibu"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const BabyIcon = () => (
  <img 
    src="https://img.icons8.com/?size=100&id=MQ0f1jkfvVTu&format=png&color=000000" 
    alt="Ikon Anak"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const ChevronLeftIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SearchIcon = () => (
  <svg className={styles.search_icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SettingsIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/gear--v1.png" 
    alt="Ikon Pengaturan"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const HelpIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/ask-question.png" 
    alt="Ikon Bantuan"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const LogoutIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/shutdown.png" 
    alt="Ikon Keluar"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const SwitchIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/refresh.png" 
    alt="Ikon Ganti Akun"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const ChevronsUpDownIcon = () => (
  <svg className={styles.icon_small} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5 5 5-5M7 9l5-5 5 5" />
  </svg>
);

const CheckIcon = () => (
  <svg className={styles.icon_tiny} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const GlobeIcon = () => (
  <img 
    src="https://img.icons8.com/3d-fluency/94/language.png" 
    alt="Ikon Bahasa"
    className={styles.icon}
    style={{ objectFit: 'contain' }}
  />
);

const ArrowRightIcon = () => (
  <svg className={styles.icon_small} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const SunIcon = () => (
  <svg className={styles.icon_tiny} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg className={styles.icon_tiny} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className={styles.icon_tiny} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20h6l-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [shortcutLabel, setShortcutLabel] = useState("K ⌘");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [selectedLang, setSelectedLang] = useState<{name: string, code: string, flag: string}>({
    name: "Indonesia", 
    code: "ID", 
    flag: "https://img.icons8.com/emoji/48/indonesia-emoji.png"
  });
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<'ibu' | 'anak'>('ibu');

  const { user, switchUser } = useCurrentUser();

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileOpen && !target.closest(`.${styles.profile_section}`)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    // Detect OS for shortcut label
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setShortcutLabel(isMac ? "K ⌘" : "Ctrl + K");

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebar_collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logo_icon}>
            <Image src="/icon.png" alt="Logo" width={40} height={40} />            
          </div>
          <div className={styles.logo_text}>
            Kenanga Care
          </div>
        </div>
        <button 
          className={styles.toggle_btn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div className={styles.search_container}>
        <div className={styles.search_wrapper}>
          <SearchIcon />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search..." 
            className={styles.search_input} 
          />
          <div className={styles.search_shortcut}>{shortcutLabel}</div>
        </div>
      </div>

      <div className={styles.nav_group}>
        <div className={styles.nav_label}><span>Menu Utama</span></div>
        <ul className={styles.nav_list}>
          <li>
            <Link 
              href="/ibu" 
              className={`${styles.nav_link} ${pathname === '/ibu' || pathname === '/' ? styles.nav_link_active : ''}`}
              data-tooltip="Beranda"
            >
              <HomeIcon /> 
              <span className={styles.link_text}>Beranda</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/ibu/kesehatan-ibu" 
              className={`${styles.nav_link} ${pathname.startsWith('/ibu/kesehatan-ibu') ? styles.nav_link_active : ''}`}
              data-tooltip="Kesehatan Ibu"
            >
              <WomanIcon /> <span className={styles.link_text}>Kesehatan Ibu</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/ibu/pantau" 
              className={`${styles.nav_link} ${pathname.startsWith('/ibu/pantau') ? styles.nav_link_active : ''}`}
              data-tooltip="Pantau Anak"
            >
              <BabyIcon /> <span className={styles.link_text}>Pantau Anak</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/edukasi" 
              className={`${styles.nav_link} ${pathname.startsWith('/edukasi') ? styles.nav_link_active : ''}`}
              data-tooltip="Edukasi Kesehatan"
            >
              <BookOpenIcon /> <span className={styles.link_text}>Edukasi Kesehatan</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className={styles.footer}>
        <div className={styles.profile_section}>
          <div 
            className={`${styles.profile_card} ${isProfileOpen ? styles.profile_active : ''}`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            data-tooltip="Ibu Kenanga"
          >
            <div className={styles.profile_avatar_group}>
              <div className={styles.profile_avatar}>
                <img src={user.role === 'kader' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" : "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=150&h=150&fit=crop"} alt="Foto Profil" className={styles.avatar_img} />
              </div>
              <div className={styles.profile_info}>
                <span className={styles.profile_name}>{user.nama}</span>
                <span className={styles.profile_role}>{user.nik}</span>
              </div>
            </div>
            {!isCollapsed && (
              <div className={styles.chevron_bg}>
                <ChevronsUpDownIcon />
              </div>
            )}
          </div>

          {/* Profile Flyout Dropdown */}
          {isProfileOpen && (
            <div className={styles.profile_flyout}>
              {/* Flyout Header (Current Active) */}
              <div className={styles.account_item_active}>
                <div className={styles.profile_avatar_group}>
                  <div className={styles.profile_avatar_small}>
                    <img src={user.role === 'kader' ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" : "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=150&h=150&fit=crop"} alt="Foto Profil" />
                  </div>
                  <div className={styles.profile_info}>
                    <span className={styles.profile_name_small}>{user.nama}</span>
                    <span className={styles.profile_role_small}>{user.role === 'kader' ? 'Kader Posyandu' : 'Ibu Balita'}</span>
                  </div>
                </div>
                <div className={styles.check_icon_box}>
                  <CheckIcon />
                </div>
              </div>

              <Link href="/ibu/profil" className={styles.view_profile_btn} onClick={() => setIsProfileOpen(false)}>
                <UserIcon /> <span>Lihat Profil</span>
              </Link>

              <div className={styles.dropdown_divider}></div>

              {/* Theme Switcher */}
              <div className={styles.theme_switcher_container}>
                <div className={styles.theme_switcher}>
                  <button 
                    className={`${styles.theme_btn} ${activeTheme === 'light' ? styles.theme_btn_active : ''}`}
                    onClick={() => setActiveTheme('light')}
                  >
                    <SunIcon /> <span>Terang</span>
                  </button>
                  <button 
                    className={`${styles.theme_btn} ${activeTheme === 'dark' ? styles.theme_btn_active : ''}`}
                    onClick={() => setActiveTheme('dark')}
                  >
                    <MoonIcon /> <span>Gelap</span>
                  </button>
                  <button 
                    className={`${styles.theme_btn} ${activeTheme === 'system' ? styles.theme_btn_active : ''}`}
                    onClick={() => setActiveTheme('system')}
                  >
                    <MonitorIcon /> <span>Sistem</span>
                  </button>
                </div>
              </div>

              {/* Other Links */}
              <div className={styles.flyout_rows}>
                <Link href="/settings" className={styles.flyout_row_item} onClick={() => setIsProfileOpen(false)}>
                  <SettingsIcon /> <span>Pengaturan</span>
                </Link>
                <Link href="/help" className={styles.flyout_row_item} onClick={() => setIsProfileOpen(false)}>
                  <HelpIcon /> <span>Pusat Bantuan / FAQ</span>
                </Link>
                
                {/* User Switcher for Demo */}
                <div style={{ padding: '10px 14px', marginTop: '4px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#ea2986', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Ganti Peran (Demo Mode)
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => switchUser(0)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0', background: user.nama === 'Siti Nurhaliza' ? '#ea2986' : 'white', color: user.nama === 'Siti Nurhaliza' ? 'white' : '#64748b', cursor: 'pointer' }}
                    >
                      Bunda Siti
                    </button>
                    <button 
                      onClick={() => switchUser(1)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0', background: user.nama === 'Dewi Lestari' ? '#ea2986' : 'white', color: user.nama === 'Dewi Lestari' ? 'white' : '#64748b', cursor: 'pointer' }}
                    >
                      Bunda Dewi
                    </button>
                    <button 
                      onClick={() => switchUser(2)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', border: '1px solid #e2e8f0', background: user.nama === 'Fitri Handayani' ? '#ea2986' : 'white', color: user.nama === 'Fitri Handayani' ? 'white' : '#64748b', cursor: 'pointer' }}
                    >
                      Kader Fitri
                    </button>
                  </div>
                </div>
                <div className={styles.lang_section_wrapper}>
                  <div 
                    className={styles.flyout_row_item} 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    style={{ cursor: 'pointer' }}
                  >
                    <GlobeIcon /> 
                    <span>Bahasa</span>
                    <span className={styles.lang_selection}>
                      <img src={selectedLang.flag} alt={selectedLang.code} className={styles.lang_flag_icon} />
                      {selectedLang.name} 
                      <div style={{ transform: isLangOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <ChevronRightIcon />
                      </div>
                    </span>
                  </div>
                  
                  {isLangOpen && (
                    <div className={styles.lang_dropdown_side}>
                      <div className={styles.lang_option} onClick={() => { 
                        setSelectedLang({name: "Indonesia", code: "ID", flag: "https://img.icons8.com/emoji/48/indonesia-emoji.png"}); 
                        setIsLangOpen(false); 
                      }}>
                        <img src="https://img.icons8.com/emoji/48/indonesia-emoji.png" alt="ID" className={styles.lang_flag_icon} />
                        <span>Indonesia</span>
                      </div>
                      <div className={styles.lang_option} onClick={() => { 
                        setSelectedLang({name: "Inggris", code: "GB", flag: "https://img.icons8.com/emoji/48/united-kingdom-emoji.png"}); 
                        setIsLangOpen(false); 
                      }}>
                        <img src="https://img.icons8.com/emoji/48/united-kingdom-emoji.png" alt="GB" className={styles.lang_flag_icon} />
                        <span>Inggris</span>
                      </div>
                      <div className={styles.lang_option} onClick={() => { 
                        setSelectedLang({name: "Jawa", code: "JW", flag: "https://img.icons8.com/emoji/48/indonesia-emoji.png"}); 
                        setIsLangOpen(false); 
                      }}>
                        <img src="https://img.icons8.com/emoji/48/indonesia-emoji.png" alt="JW" className={styles.lang_flag_icon} />
                        <span>Jawa</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Action */}
              <div className={styles.flyout_footer_actions}>
                <button 
                  className={styles.btn_logout_premium}
                  onClick={() => {
                    setIsLogoutModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                >
                  <span>Keluar</span>
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className={styles.modal_overlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_icon}>⚠️</div>
            <h3 className={styles.modal_title}>Konfirmasi Keluar</h3>
            <p className={styles.modal_text}>Apakah Anda yakin ingin keluar dari aplikasi Kenanga Care?</p>
            <div className={styles.modal_buttons}>
              <button 
                className={styles.modal_btn_cancel}
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Batal
              </button>
              <button 
                className={styles.modal_btn_confirm}
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  router.push("/login");
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
