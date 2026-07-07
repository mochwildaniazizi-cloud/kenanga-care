"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/24/solid";

interface PullToRefreshProps {
  children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const startY = useRef(0);
  const isAtTop = useRef(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 60;

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        isAtTop.current = containerRef.current.scrollTop === 0;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    if (isRefreshing || !isAtTop.current) return;
    startY.current = e.touches[0].pageY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isRefreshing || !isAtTop.current) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Resistance factor to make pull feel natural
      const distance = Math.min(90, diff * 0.4);
      setPullDistance(distance);
      // Prevent browser default scroll bounce behavior
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing || !isAtTop.current) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      // Trigger data sync & custom events to refresh pages
      try {
        // Dispatch event for other components to reload data
        window.dispatchEvent(new Event("sync-data"));
        window.dispatchEvent(new Event("profile-updated"));
        
        // Wait 1s to show premium animation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setShowCheck(true);
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        console.error("Pull to refresh sync failed:", err);
      } finally {
        setIsRefreshing(false);
        setShowCheck(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: false });
      container.addEventListener("touchmove", handleTouchMove, { passive: false });
      container.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
      {/* Pull indicator spinner container */}
      <div 
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none transition-all duration-150 z-40"
        style={{
          top: `${pullDistance - 40}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="bg-base-white border border-base-border/40 shadow-lg rounded-full p-2.5 flex items-center justify-center w-10 h-10 transition-transform">
          {showCheck ? (
            <CheckIcon className="w-5 h-5 text-status-green-solid animate-in zoom-in duration-200" />
          ) : (
            <ArrowPathIcon 
              className={`w-5 h-5 text-brand-primary ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${pullDistance * 4}deg)`
              }}
            />
          )}
        </div>
      </div>

      {/* Main scrollable container */}
      <main 
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-surface p-4 sm:p-8 pt-4 pb-24 lg:pb-8 transition-transform duration-150"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.5}px)` : undefined
        }}
      >
        {children}
      </main>
    </div>
  );
}
