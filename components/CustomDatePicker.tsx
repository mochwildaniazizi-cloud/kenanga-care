"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// Helper to parse date from "YYYY-MM-DD" or "Hari, DD Bulan YYYY" into Date object
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Case 1: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }
  // Case 2: "Sabtu, 04 Juli 2026" or "04 Juli 2026"
  const cleanStr = dateStr.includes(",") ? dateStr.split(",")[1].trim() : dateStr.trim();
  const parts = cleanStr.split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    const months: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
    };
    const monthIndex = months[monthName] !== undefined ? months[monthName] : 0;
    if (!isNaN(day) && !isNaN(year)) {
      return new Date(year, monthIndex, day);
    }
  }
  return null;
}

// Helper to format Date object into YYYY-MM-DD
export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to format Date object to "DD.MM.YYYY" for display
export function formatDateToDot(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

// Helper to format Date object to verbal Indonesian "Sabtu, 04 Juli 2026"
export function formatDateToVerbal(date: Date): string {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  outputFormat?: 'iso' | 'verbal';
}

export default function CustomDatePicker({ value, onChange, label = "Select a day", outputFormat = 'iso' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const parsed = parseDate(value);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => parsed || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => parsed);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync state when value changes from outside
  useEffect(() => {
    const p = parseDate(value);
    setSelectedDate(p);
    if (p) {
      setCurrentMonth(p);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRemove = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  const handleDone = () => {
    if (selectedDate) {
      if (outputFormat === 'iso') {
        onChange(formatDateToISO(selectedDate));
      } else {
        onChange(formatDateToVerbal(selectedDate));
      }
    } else {
      onChange("");
    }
    setIsOpen(false);
  };

  // Generate calendar days for currentMonth
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // First day of month starting on Monday
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Prev month days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // Next month days to pad to 42
  const totalSlots = 42;
  const nextMonthPadding = totalSlots - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const displayDateStr = selectedDate ? formatDateToDot(selectedDate) : "--.--.----";

  const indonesianMonths = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const monthName = indonesianMonths[month];

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between border rounded-xl px-4 py-2.5 bg-base-bg/10 focus-within:bg-base-white cursor-pointer transition select-none ${
          isOpen ? "border-brand-primary ring-2 ring-brand-primary/20 bg-base-white" : "border-base-border/50 hover:border-brand-primary/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <svg className={`w-5 h-5 transition-colors ${isOpen ? "text-brand-primary" : "text-base-text-secondary"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <div className="flex flex-col items-start leading-none">
            <span className={`text-[10px] uppercase font-semibold tracking-wider transition-colors ${isOpen ? "text-brand-primary" : "text-base-text-secondary"}`}>
              {label}
            </span>
            <span className="text-sm font-semibold text-base-text-primary mt-1">
              {displayDateStr}
            </span>
          </div>
        </div>
        <svg className={`w-4 h-4 text-base-text-secondary transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 bg-base-white rounded-2xl shadow-xl border border-base-border/20 p-5 w-80 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-base-text-primary text-sm">
              {monthName} {year}
            </h4>
            <div className="flex gap-1.5">
              <button 
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-base-bg rounded-lg text-base-text-secondary hover:text-brand-primary transition cursor-pointer"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-base-bg rounded-lg text-base-text-secondary hover:text-brand-primary transition cursor-pointer"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center">
            {/* Days headers */}
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-[10px] font-semibold text-base-text-secondary py-0.5 select-none">
                {d}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((item, idx) => {
              const isSelected = selectedDate && 
                selectedDate.getDate() === item.date.getDate() &&
                selectedDate.getMonth() === item.date.getMonth() &&
                selectedDate.getFullYear() === item.date.getFullYear();
              
              return (
                <div key={idx} className="flex justify-center items-center">
                  <button
                    type="button"
                    onClick={() => handleSelectDay(item.date)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition select-none cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary text-base-white shadow-md shadow-brand-primary/20"
                        : item.isCurrentMonth
                        ? "text-base-text-primary hover:bg-brand-soft/50 hover:text-brand-primary"
                        : "text-base-text-secondary/30"
                    }`}
                  >
                    {item.date.getDate()}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-base-border/10">
            <button
              type="button"
              onClick={handleRemove}
              className="flex-1 py-2 rounded-xl bg-base-bg hover:bg-base-border/20 text-base-text-secondary font-semibold text-xs transition cursor-pointer"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 py-2 rounded-xl bg-brand-primary text-base-white font-semibold text-xs hover:bg-brand-primary/95 transition shadow-sm shadow-brand-primary/10 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
