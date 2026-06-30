import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { UserRoleProvider } from "@/context/UserRoleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kenanga Care | Posyandu Dashboard",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface flex h-screen overflow-hidden text-gray-950`}>
        <UserRoleProvider>

          {/* SIDEBAR COMPONENT */}
          <Sidebar />

          {/* MOBILE BOTTOM NAVIGATION */}
          <BottomNav />

          {/* MAIN AREA WORKSPACE */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* HEADER COMPONENT */}
            <Header />
            
            {/* DYNAMIC CONTENT AREA (Halaman page.tsx akan muncul di sini) */}
            <main className="flex-1 overflow-y-auto bg-surface p-4 sm:p-8 pt-4 pb-24 lg:pb-8">
              {children}
            </main>
            
          </div>

        </UserRoleProvider>
      </body>
    </html>
  );
}