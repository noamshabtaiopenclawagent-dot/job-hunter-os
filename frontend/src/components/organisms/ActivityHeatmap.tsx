"use client";

import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Renders a 7-day x 24-hour heatmap SVG representing agent activity.
 */
export function ActivityHeatmap({
  data,
  days = 7,
}: {
  data: { timestamp: string; weight?: number }[];
  days?: 7 | 14;
}) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);
  
  // bucket by dayIndex (0 to days-1) and hour (0-23)
  const buckets = useMemo(() => {
    const grid = Array.from({ length: days }, () => Array(24).fill(0));
    
    // reset start date to 00:00 for accurate day diff
    const start00 = new Date(startDate);
    start00.setHours(0, 0, 0, 0);

    for (const item of data) {
      try {
        const d = new Date(item.timestamp.endsWith("Z") || item.timestamp.includes("+") ? item.timestamp : item.timestamp + "Z");
        if (isNaN(d.getTime())) continue;
        
        const diffTime = d.getTime() - start00.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays < days) {
          const hr = d.getHours();
          grid[diffDays][hr] += (item.weight ?? 1);
        }
      } catch { /* ignore invalid dates */ }
    }
    return grid;
  }, [data, days, startDate]);

  // find max for color scaling
  const maxVal = useMemo(() => {
    let m = 0;
    for (const day of buckets) for (const hr of day) if (hr > m) m = hr;
    return Math.max(m, 1);
  }, [buckets]);

  const getColor = (val: number) => {
    if (val === 0) return "fill-slate-100 dark:fill-slate-800";
    const ratio = val / maxVal;
    if (ratio < 0.25) return "fill-emerald-200 dark:fill-emerald-900";
    if (ratio < 0.5) return "fill-emerald-300 dark:fill-emerald-700";
    if (ratio < 0.75) return "fill-emerald-400 dark:fill-emerald-500";
    return "fill-emerald-500 dark:fill-emerald-400";
  };

  const getDayLabel = (dayIdx: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayIdx);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  // SVG dimensions
  const colW = 12;
  const rowH = 12;
  const gap = 3;
  const labelW = 40;
  const topH = 20;

  const svgW = labelW + (days * colW) + gap; // will compute exactly
  
  return (
    <div className="overflow-x-auto w-full pb-2">
      <div className="min-w-fit">
        <TooltipProvider delayDuration={100}>
          <svg
            width={labelW + 24 * (colW + gap)}
            height={topH + days * (rowH + gap)}
            className="text-xs font-medium text-slate-400"
          >
            {/* Hour labels (only every 4 hours to save space) */}
            {Array.from({ length: 24 }).map((_, i) => (
              i % 4 === 0 && (
                <text
                  key={`hr-${i}`}
                  x={labelW + i * (colW + gap)}
                  y={topH - 6}
                  fill="currentColor"
                  fontSize="10"
                >
                  {i === 0 ? "12A" : i < 12 ? `${i}A` : i === 12 ? "12P" : `${i % 12}P`}
                </text>
              )
            ))}

            {/* Days and blocks */}
            {buckets.map((dayHours, dIdx) => {
              const y = topH + dIdx * (rowH + gap);
              return (
                <g key={`day-${dIdx}`}>
                  <text x={0} y={y + 10} fill="currentColor" fontSize="10">
                    {getDayLabel(dIdx)}
                  </text>
                  {dayHours.map((val, hIdx) => {
                    const x = labelW + hIdx * (colW + gap);
                    return (
                      <Tooltip key={`block-${dIdx}-${hIdx}`}>
                        <TooltipTrigger asChild>
                          <rect
                            x={x}
                            y={y}
                            width={colW}
                            height={rowH}
                            rx={2}
                            className={cn("transition-colors duration-200 outline-none", getColor(val))}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {val} events on {getDayLabel(dIdx)} at {hIdx}:00
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </TooltipProvider>
      </div>
    </div>
  );
}
