"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export type UserRole = "kader" | "ibu" | "nakes";

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  username: string;
  login: (role: UserRole, username: string) => void;
  logout: () => void;
  isInitialized: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: "kader",
  setRole: () => {},
  isLoggedIn: false,
  username: "",
  login: () => {},
  logout: () => {},
  isInitialized: false,
});

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("kader");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role") as UserRole | null;
    if (savedRole === "kader" || savedRole === "ibu" || savedRole === "nakes") {
      setRoleState(savedRole);
    }

    const savedLogin = localStorage.getItem("is_logged_in") === "true";
    const savedUser = localStorage.getItem("logged_username") || "";

    setIsLoggedIn(savedLogin);
    setUsername(savedUser);
    setIsInitialized(true);
  }, []);

  // ─── CLIENT-SIDE ROUTER GUARD (MENGGUNAKAN STATE UTAMA: role) ───
  useEffect(() => {
    if (!isInitialized) return;

    const publicPaths = ["/", "/login"];
    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      router.replace("/login");
    } else if (isLoggedIn && pathname === "/login") {
      const targetHome = role === "nakes" ? "/beranda-nakes" : role === "ibu" ? "/beranda-ibu" : "/beranda-kader";
      router.replace(targetHome);
    }
  }, [isLoggedIn, pathname, isInitialized, role, router]);

  const setRole = (newRole: UserRole) => {
    localStorage.setItem("user_role", newRole);
    setRoleState(newRole);
    window.dispatchEvent(new CustomEvent("role-changed", { detail: newRole }));
  };

  // ─── FUNGSI LOGIN ───
  const login = (newRole: UserRole, userVal: string) => {
    localStorage.setItem("user_role", newRole);
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem("logged_username", userVal);
    
    setRoleState(newRole);
    setIsLoggedIn(true);
    setUsername(userVal);

    window.dispatchEvent(
      new CustomEvent("auth-changed", { 
        detail: { isLoggedIn: true, role: newRole, username: userVal } 
      })
    );
    
    const redirectPath = newRole === "nakes" ? "/beranda-nakes" : newRole === "ibu" ? "/beranda-ibu" : "/beranda-kader";
    router.replace(redirectPath);
  };

  const logout = () => {
    localStorage.removeItem("is_logged_in");
    localStorage.removeItem("logged_username");
    
    setIsLoggedIn(false);
    setUsername("");
    
    window.dispatchEvent(new CustomEvent("auth-changed", { detail: { isLoggedIn: false } }));
    router.replace("/login");
  };

  return (
    <UserRoleContext.Provider value={{ role, setRole, isLoggedIn, username, login, logout, isInitialized }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}