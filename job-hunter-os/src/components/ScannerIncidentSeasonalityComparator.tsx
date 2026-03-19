import React, { useMemo, useState } from "react";
type Role = "All" | "Data Analyst" | "Business Analyst" | "Product Analyst";
type Source = "All" | "LinkedIn IL" | "AllJobs" | "Drushim" | "Nisha";
type IncidentType = "timeout" | "rate-limit" | "parse-drift";
type SortKey = "variance" | "current" | "previous";
type LoadState = "loading" | "ready" | "empty" | "error";
type Row = {
  id: string;
  role: Exclude<Role, "All">;
  source: Exclude<Source, "All">;
  incidentType: IncidentType;
  currentWeek: number;
  previousWeek: number;
  drilldownHref: string;
};
type Props = {
  rows?: Row[];
  compact?: boolean;
  state?: LoadState;
  errorMessage?: string;
};
const DEFAULT_ROWS: Row[] = [
  {
    id: "s1",
    role: "Data Analyst",
    source: "LinkedIn IL",
    incidentType: "rate-limit",
    currentWeek: 16,
    previousWeek: 11,
    drilldownHref: "/incidents/linkedin-il/rate-limit",
  },
  {
    id: "s2",
    role: "Business Analyst",
    source: "AllJobs",
    incidentType: "timeout",
    currentWeek: 12,
    previousWeek: 15,
    drilldownHref: "/incidents/alljobs/timeout",
  },
  {
    id: "s3",
    role: "Product Analyst",
    source: "Drushim",
    incidentType: "parse-drift",
    currentWeek: 7,
    previousWeek: 5,
    drilldownHref: "/incidents/drushim/parse-drift",
  },
];
function typeLabel(t: IncidentType): string {
  if (t === "rate-limit") return "Rate-limit";
  if (t === "parse-drift") return "Parse drift";
  return "Timeout";
}
export function ScannerIncidentSeasonalityComparator({
  rows = DEFAULT_ROWS,
  compact = false,
  state = "ready",
  errorMessage = "Failed to load seasonality comparator.",
}: Props) {
  const [role, setRole] = useState<Role>("All");
  const [source, setSource] = useState<Source>("All");
  const [sortBy, setSortBy] = useState<SortKey>("variance");
  const visible = useMemo(() => {
    const filtered = rows
      .filter((r) => (role === "All" ? true : r.role === role))
      .filter((r) => (source === "All" ? true : r.source === source))
      .map((r) => ({ ...r, variance: r.currentWeek - r.previousWeek }));
    return filtered.sort((a, b) => {
      if (sortBy === "current") return b.currentWeek - a.currentWeek;
      if (sortBy === "previous") return b.previousWeek - a.previousWeek;
      return Math.abs(b.variance) - Math.abs(a.variance);
    });
  }, [rows, role, source, sortBy]);
  if (state === "loading")
    return (
      <section
        style={{ height: compact ? 90 : 140, borderRadius: 10, background: "#f1f5f9" }}
      />
    );
  if (state === "error")
    return (
      <section
        style={{
          border: "1px solid #fecaca",
          background: "#fef2f2",
          color: "#991b1b",
          borderRadius: 10,
          padding: 10,
        }}
      >
        {errorMessage}
      </section>
    );
  if (state === "empty" || visible.length === 0)
    return (
      <section
        style={{
          border: "1px dashed #cbd5e1",
          borderRadius: 10,
          padding: 10,
          color: "#64748b",
        }}
      >
        No seasonality data for selected filters.
      </section>
    );
  return (
    <section
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: compact ? 8 : 12,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <strong>Incident Seasonality Comparator</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option>All</option>
            <option>Data Analyst</option>
            <option>Business Analyst</option>
            <option>Product Analyst</option>
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as Source)}
          >
            <option>All</option>
            <option>LinkedIn IL</option>
            <option>AllJobs</option>
            <option>Drushim</option>
            <option>Nisha</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="variance">Sort: Variance</option>
            <option value="current">Sort: Current week</option>
            <option value="previous">Sort: Previous week</option>
          </select>
        </div>
      </header>
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {visible.map((r) => (
          <article
            key={r.id}
            style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 8 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong>{r.source}</strong>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {r.role} • {typeLabel(r.incidentType)}
                </div>
              </div>
              <span
                style={{
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  background: r.variance > 0 ? "#fee2e2" : "#dcfce7",
                  color: r.variance > 0 ? "#991b1b" : "#166534",
                }}
              >
                {r.variance > 0 ? `+${r.variance}` : r.variance} variance
              </span>
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#334155" }}>
              Current week: <strong>{r.currentWeek}</strong> • Previous week:{" "}
              <strong>{r.previousWeek}</strong>
            </div>
            <a
              href={r.drilldownHref}
              style={{ marginTop: 6, display: "inline-block", fontSize: 12 }}
            >
              Open drilldown
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
export default ScannerIncidentSeasonalityComparator;
