"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock3, Bot } from "lucide-react";
import type { CronJob } from "./page";

// --- Date Math Helpers ---
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getStartOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// --- Cron Matching ---
function matchCronToken(val: number, expr: string): boolean {
  if (expr === "*") return true;
  if (expr.includes(",")) return expr.split(",").map(Number).includes(val);
  if (expr.includes("/")) return val % Number(expr.split("/")[1]) === 0;
  return Number(expr) === val;
}

function doesCronRunOnDate(cronStr: string, date: Date, checkHour: number | null = null): boolean {
  const parts = cronStr.split(" ");
  if (parts.length < 5) return false; // complex / invalid
  const [, hour, dom, mon, dow] = parts;

  const dDom = date.getDate();
  const dMon = date.getMonth() + 1; // JS months are 0-indexed, cron is 1-12
  const dDow = date.getDay(); // 0 is Sunday, exactly like cron (usually 0-6)

  if (!matchCronToken(dDom, dom)) return false;
  if (!matchCronToken(dMon, mon)) return false;
  if (!matchCronToken(dDow, dow)) return false;
  
  if (checkHour !== null) {
    if (!matchCronToken(checkHour, hour)) return false;
  }

  return true;
}

// --- Components ---
export function CalendarView({ jobs }: { jobs: CronJob[] }) {
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrev = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, -1));
    if (view === "week") setCurrentDate(addDays(currentDate, -7));
    if (view === "day") setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    if (view === "week") setCurrentDate(addDays(currentDate, 7));
    if (view === "day") setCurrentDate(addDays(currentDate, 1));
  };

  const headerTitle = useMemo(() => {
    if (view === "month") return `${MONTH_NAMES[month]} ${year}`;
    if (view === "week") {
      const start = getStartOfWeek(currentDate);
      const end = addDays(start, 6);
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${year}`;
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}, ${year}`;
    }
    return `${MONTH_NAMES[month]} ${currentDate.getDate()}, ${year}`;
  }, [view, currentDate, month, year]);

  // --- Month Grid Logic ---
  const monthDays = useMemo(() => {
    const days: Date[] = [];
    const startObj = getStartOfMonth(year, month);
    const startDow = startObj.getDay();
    
    // pad previous month
    for (let i = startDow - 1; i >= 0; i--) {
      days.push(addDays(startObj, -(i + 1)));
    }
    
    const daysInMonth = getDaysInMonth(year, month);
    for (let i = 0; i < daysInMonth; i++) {
      days.push(addDays(startObj, i));
    }

    // pad next month to complete 6 rows (42 days)
    const remaining = 42 - days.length;
    const lastDay = days[days.length - 1];
    for (let i = 1; i <= remaining; i++) {
      days.push(addDays(lastDay, i));
    }
    return days;
  }, [year, month]);

  // --- Week Grid Logic ---
  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      {/* Calendar Header / Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 shadow-inner">
            <button onClick={() => setView("day")} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${view === "day" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Day</button>
            <button onClick={() => setView("week")} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${view === "week" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Week</button>
            <button onClick={() => setView("month")} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${view === "month" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>Month</button>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 rounded-xl px-2 py-1 bg-white shadow-sm">
          <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-slate-900 transition"><ChevronLeft size={18} /></button>
          <span className="w-48 text-center text-sm font-bold text-slate-800 tracking-tight">{headerTitle}</span>
          <button onClick={handleNext} className="p-2 text-slate-400 hover:text-slate-900 transition"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* --- MONTH VIEW --- */}
      {view === "month" && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {DAY_NAMES.map(d => (
              <div key={d} className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {d.slice(0,3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-slate-200 gap-px">
            {monthDays.map((date, i) => {
              const isCurrentMonth = date.getMonth() === month;
              const isToday = new Date().toDateString() === date.toDateString();
              const dayJobs = jobs.filter(j => doesCronRunOnDate(j.schedule, date));

              return (
                <div key={i} className={`min-h-[100px] bg-white p-2 transition hover:bg-slate-50 ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700'}`}>
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    {dayJobs.slice(0, 3).map(j => (
                      <div key={j.job_id} className="truncate rounded border border-indigo-100 bg-indigo-50/50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        {j.name}
                      </div>
                    ))}
                    {dayJobs.length > 3 && (
                      <div className="text-[10px] font-medium text-slate-400 px-1.5">+ {dayJobs.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- WEEK VIEW --- */}
      {view === "week" && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 divide-x divide-slate-200">
            <div className="p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</div>
            {weekDays.map(d => {
              const isToday = new Date().toDateString() === d.toDateString();
              return (
                <div key={d.toISOString()} className={`p-3 text-center ${isToday ? 'bg-indigo-50/50' : ''}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{DAY_NAMES[d.getDay()].slice(0,3)}</div>
                  <div className={`mt-0.5 text-lg font-black ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          <div className="overflow-y-auto h-[600px] bg-slate-200 grid grid-cols-8 gap-px custom-scrollbar">
            {HOURS.map(hour => (
              <div key={hour} className="contents">
                <div className="bg-slate-50 p-2 text-right text-xs font-bold text-slate-400 sticky left-0 z-10 border-b border-slate-200/50">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map(d => {
                  const cellJobs = jobs.filter(j => doesCronRunOnDate(j.schedule, d, hour));
                  return (
                    <div key={`${d.toISOString()}-${hour}`} className="bg-white min-h-[60px] p-1 border-b border-transparent hover:bg-slate-50 transition relative group">
                      {cellJobs.map(j => (
                        <div key={j.job_id} className="absolute inset-x-1 top-1 rounded-md border border-indigo-200 bg-indigo-50 p-1.5 shadow-sm overflow-hidden z-0 group-hover:z-20 group-hover:h-auto h-12 hover:shadow-md transition-all">
                          <p className="truncate text-[10px] font-bold text-indigo-900">{j.name}</p>
                          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-500">{j.agent_id.toUpperCase()}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- DAY VIEW --- */}
      {view === "day" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-8 text-xl font-bold text-slate-900">Hourly Timeline</h3>
          <div className="relative border-l-2 border-slate-200/60 pb-8 pl-8 md:ml-4 md:pl-12">
            {HOURS.map(hour => {
              const hourJobs = jobs.filter(j => doesCronRunOnDate(j.schedule, currentDate, hour));
              if (hourJobs.length === 0) {
                 return (
                   <div key={hour} className="relative mb-4 flex items-center opacity-40 hover:opacity-100 transition">
                     <div className="absolute -left-12 flex w-10 items-center justify-end text-xs font-bold text-slate-400 md:-left-16 md:w-14">
                       {hour.toString().padStart(2, "0")}:00
                     </div>
                     <div className="h-px w-8 bg-slate-200" />
                   </div>
                 );
              }

              return (
                <div key={hour} className="relative mb-8">
                  <div className="absolute -left-12 flex w-10 items-center justify-end text-sm font-black text-indigo-900 md:-left-16 md:w-14">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  <div className="space-y-3">
                    {hourJobs.map(j => (
                      <div key={j.job_id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative group hover:border-indigo-300 transition shadow-sm">
                        <div className="absolute -left-4 top-5 h-4 w-4 -translate-x-full rounded-full border-[3px] border-slate-50 bg-indigo-400" />
                        <h4 className="text-sm font-bold text-slate-900">{j.name}</h4>
                        <div className="mt-1 flex gap-2">
                           <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{j.schedule}</span>
                           <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">• {j.session_target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
