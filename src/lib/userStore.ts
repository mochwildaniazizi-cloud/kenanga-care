"use client";

import { useState, useEffect } from "react";
import { dummyUsers, UserPersona } from "./dummyData";

const STORAGE_KEY = "kenanga_active_user_index";

export function getActiveUserIndex(): number {
  if (typeof window === "undefined") return 1; // Default to Dewi (Pregnant)
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved !== null ? parseInt(saved, 10) : 1;
}

export function setActiveUserIndex(index: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, index.toString());
    window.dispatchEvent(new Event("user-changed"));
  }
}

export function useCurrentUser() {
  const [index, setIndex] = useState(getActiveUserIndex());

  useEffect(() => {
    const handleUserChange = () => {
      setIndex(getActiveUserIndex());
    };

    window.addEventListener("user-changed", handleUserChange);
    return () => window.removeEventListener("user-changed", handleUserChange);
  }, []);

  return {
    user: dummyUsers[index],
    index,
    switchUser: setActiveUserIndex
  };
}
