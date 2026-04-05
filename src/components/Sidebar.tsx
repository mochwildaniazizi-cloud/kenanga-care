"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

// Simulating Lucide Icons for now using simple SVGs to avoid dependency issues early on
// We will replace these with real Lucide icons if requested later.
const HomeIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserIcon = () => (
  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
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


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logo_icon}>
          K
        </div>
        <div className={styles.logo_text}>
          Kenanga Care
        </div>
      </div>

      <div className={styles.nav_group}>
        <div className={styles.nav_label}>Menu Ibu</div>
        <ul className={styles.nav_list}>
          <li>
            <Link 
              href="/ibu" 
              className={`${styles.nav_link} ${pathname === '/ibu' || pathname === '/' ? styles.nav_link_active : ''}`}
            >
              <HomeIcon /> Beranda Ibu
            </Link>
          </li>
          <li>
            <Link 
              href="/ibu/profil" 
              className={`${styles.nav_link} ${pathname.startsWith('/ibu/profil') ? styles.nav_link_active : ''}`}
            >
              <UserIcon /> Profil & Anak
            </Link>
          </li>
          <li>
            <Link 
              href="/ibu/pantau" 
              className={`${styles.nav_link} ${pathname.startsWith('/ibu/pantau') ? styles.nav_link_active : ''}`}
            >
              <HistoryIcon /> Catatan Pantau
            </Link>
          </li>
        </ul>
      </div>

      <div className={styles.nav_group}>
        <div className={styles.nav_label}>Menu Kader</div>
        <ul className={styles.nav_list}>
          <li>
            <Link 
              href="/kader" 
              className={`${styles.nav_link} ${pathname === '/kader' ? styles.nav_link_active : ''}`}
            >
              <ClipboardIcon /> Dashboard Kader
            </Link>
          </li>
          <li>
            <Link 
              href="/kader/data" 
              className={`${styles.nav_link} ${pathname.startsWith('/kader/data') ? styles.nav_link_active : ''}`}
            >
              <UserIcon /> Data Ibu & Anak
            </Link>
          </li>
        </ul>
      </div>

      <div className={styles.footer}>
        {/* We can add a user profile quick switch here later */}
      </div>
    </aside>
  );
}
