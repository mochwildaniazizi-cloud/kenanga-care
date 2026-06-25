import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header"; // Import komponen Header baru

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kenanga Care | Posyandu Dashboard",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface flex h-screen overflow-hidden text-gray-950`}>
        
        {/* SIDEBAR COMPONENT */}
        <Sidebar />

        {/* MAIN AREA WORKSPACE */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* HEADER COMPONENT */}
          <Header />
          
          {/* DYNAMIC CONTENT AREA (Halaman page.tsx akan muncul di sini) */}
          <main className="flex-1 overflow-y-auto bg-surface p-8 pt-4">
            {children}
          </main>
          
        </div>

      </body>
    </html>
  );
}