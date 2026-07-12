import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { UserRoleProvider } from "@/context/UserRoleContext";
import SWRegister from "@/components/SWRegister";
import PullToRefresh from "@/components/PullToRefresh";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kenanga Care | Posyandu Dashboard",
  manifest: "/manifest.json",
  icons: {
    icon: "/Logo.png",
    apple: "/Logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-surface flex h-screen overflow-hidden text-gray-950`}>
        <UserRoleProvider>
          <SWRegister />

          {/* SIDEBAR COMPONENT */}
          <Sidebar />

          {/* MOBILE BOTTOM NAVIGATION */}
          <BottomNav />

          {/* MAIN AREA WORKSPACE */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* HEADER COMPONENT */}
            <Header />
            
            {/* DYNAMIC CONTENT AREA WITH PULL TO REFRESH */}
            <PullToRefresh>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </PullToRefresh>
            
          </div>

        </UserRoleProvider>
      </body>
    </html>
  );
}