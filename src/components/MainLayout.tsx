"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>
      {!isAuthPage && <Sidebar />}
      <main style={{ 
        flex: 1, 
        overflowY: "auto", 
        position: "relative",
        height: "100vh"
      }}>
        {children}
      </main>
    </div>
  );
}
