"use client";

import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker immediately
      navigator.serviceWorker.register("/sw.js").then(
        (registration) => {
          console.log("Kenanga Care Service Worker registered successfully: ", registration.scope);
        },
        (err) => {
          console.error("Kenanga Care Service Worker registration failed: ", err);
        }
      );
    }
  }, []);

  return null;
}
