"use client";

import { useEffect, useRef, useState } from "react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  locale?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseISO(value?: string | null) {
  if (!value) return null;
  const parts = value.split("-").map((p) => Number(p));
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateLabel(value: string, localeStr: string) {
  const d = parseISO(value);
  if (!d) return value;
  try {
    return new Intl.DateTimeFormat(localeStr, { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  } catch {
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    const [y, m, dpart] = parts;
    return `${dpart}.${m}.${y}`;
  }
}

function getMonthMatrix(year: number, month: number) {
  // month: 0-11
  const first = new Date(year, month, 1);
  // shift so Monday is index 0
  const startWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const matrix: Array<Array<{ day: number; inMonth: boolean; date: Date }>> = [];
  let week: Array<{ day: number; inMonth: boolean; date: Date }> = [];

  // leading days from prev month
  for (let i = 0; i < startWeekday; i++) {
    const day = prevMonthDays - startWeekday + 1 + i;
    const d = new Date(year, month - 1, day);
    week.push({ day, inMonth: false, date: d });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    week.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  // trailing days
  let nextDay = 1;
  while (week.length > 0 && week.length < 7) {
    const d = new Date(year, month + 1, nextDay);
    week.push({ day: nextDay, inMonth: false, date: d });
    nextDay++;
  }
  if (week.length === 7) matrix.push(week);

  // ensure 6 rows for stable layout
  while (matrix.length < 6) {
    const row: Array<{ day: number; inMonth: boolean; date: Date }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(year, month + matrix.length + 1, i + 1);
      row.push({ day: d.getDate(), inMonth: false, date: d });
    }
    matrix.push(row);
  }

  return matrix;
}

export default function DatePicker({ value, onChange, placeholder, className = "", locale }: DatePickerProps) {
  const inputRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseISO(value) ?? new Date();
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  useEffect(() => {
    const p = parseISO(value);
    if (p) {
      setViewYear(p.getFullYear());
      setViewMonth(p.getMonth());
    }
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (popRef.current && inputRef.current && !popRef.current.contains(target) && !inputRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const activeLocale = locale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
  const weekdays = Array.from({ length: 7 }).map((_, i) =>
    new Intl.DateTimeFormat(activeLocale, { weekday: "short" }).format(new Date(Date.UTC(2021, 0, 4 + i))),
  );

  const matrix = getMonthMatrix(viewYear, viewMonth);

  function handleSelect(date: Date) {
    onChange(toISO(date));
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  function monthLabel() {
    return new Intl.DateTimeFormat(activeLocale, { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth, 1));
  }

  const selected = parseISO(value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        ref={inputRef}
        onClick={() => setOpen((o) => !o)}
        className={`h-12 w-full appearance-none select-none text-sm leading-6 text-left rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${className}`}
        aria-haspopup="dialog"
      >
        <div className="flex w-full items-center justify-between">
          <span className={`truncate ${value ? "" : "text-slate-400"}`}>{value ? formatDateLabel(value, activeLocale) : placeholder ?? "Select date"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-3 text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
      </button>

      {open ? (
        <div ref={popRef} className="absolute left-0 z-50 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between px-1">
            <button type="button" onClick={prevMonth} className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300">
              ‹
            </button>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{monthLabel()}</div>
            <button type="button" onClick={nextMonth} className="p-1 text-slate-600 hover:text-slate-900 dark:text-slate-300">
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {weekdays.map((wd) => (
              <div key={wd} className="py-1 font-medium">
                {wd}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-sm">
            {matrix.map((week, wi) => (
              <div key={wi} className="contents">
                {week.map((cell) => {
                  const iso = toISO(cell.date);
                  const isSelected = selected && iso === toISO(selected);
                  return (
                    <button
                      type="button"
                      key={iso}
                      onClick={() => handleSelect(cell.date)}
                      className={`flex h-8 items-center justify-center rounded-md ${cell.inMonth ? "" : "text-slate-400"} ${isSelected ? "bg-blue-600 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
