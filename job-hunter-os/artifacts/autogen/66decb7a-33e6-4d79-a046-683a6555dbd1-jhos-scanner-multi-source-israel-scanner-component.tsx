import React, { useMemo, useState } from "react";

type RoleFilter = "All" | "Data Analyst" | "Business Analyst" | "Product Analyst";
type FetchState = "idle" | "fetching" | "success" | "error";

type SourceKey = "LinkedIn" | "AllJobs" | "Drushim" | "Comeet" | "Company Sites";

interface SourceStatus {
  key: SourceKey;
  label: string;
  coverage: number; // 0-100
  totalFetched: number;
  uniqueAfterDedupe: number;
  lastFetchAt: string | null;
  state: FetchState;
  error?: string;
  roles: Exclude<RoleFilter, "All">[];
}

const INITIAL_SOURCES: SourceStatus[] = [
  {
    key: "LinkedIn",
    label: "LinkedIn Israel",
    coverage: 86,
    totalFetched: 112,
    uniqueAfterDedupe: 91,
    lastFetchAt: null,
    state: "idle",
    roles: ["Data Analyst", "Business Analyst", "Product Analyst"],
  },
  {
    key: "AllJobs",
    label: "AllJobs",
    coverage: 71,
    totalFetched: 73,
    uniqueAfterDedupe: 60,
    lastFetchAt: null,
    state: "idle",
    roles: ["Data Analyst", "Business Analyst"],
  },
  {
    key: "Drushim",
    label: "Drushim",
    coverage: 63,
    totalFetched: 64,
    uniqueAfterDedupe: 47,
    lastFetchAt: null,
    state: "idle",
    roles: ["Data Analyst", "Business Analyst", "Product Analyst"],
  },
  {
    key: "Comeet",
    label: "Comeet (Company ATS)",
    coverage: 58,
    totalFetched: 49,
    uniqueAfterDedupe: 42,
    lastFetchAt: null,
    state: "idle",
    roles: ["Data Analyst", "Product Analyst"],
  },
  {
    key: "Company Sites",
    label: "Direct Company Careers",
    coverage: 66,
    totalFetched: 84,
    uniqueAfterDedupe: 75,
    lastFetchAt: null,
    state: "idle",
    roles: ["Data Analyst", "Business Analyst", "Product Analyst"],
  },
];

const ROLE_OPTIONS: RoleFilter[] = ["All", "Data Analyst", "Business Analyst", "Product Analyst"];

function formatTime(value: string | null): string {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleString();
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

export default function MultiSourceIsraelScanner(): JSX.Element {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [sources, setSources] = useState<SourceStatus[]>(INITIAL_SOURCES);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const filteredSources = useMemo(() => {
    if (roleFilter === "All") return sources;
    return sources.filter((s) => s.roles.includes(roleFilter));
  }, [roleFilter, sources]);

  const totals = useMemo(() => {
    const visible = filteredSources;
    const totalFetched = visible.reduce((acc, s) => acc + s.totalFetched, 0);
    const uniqueAfterDedupe = visible.reduce((acc, s) => acc + s.uniqueAfterDedupe, 0);
    const avgCoverage = visible.length
      ? Math.round(visible.reduce((acc, s) => acc + s.coverage, 0) / visible.length)
      : 0;

    return {
      sourceCount: visible.length,
      totalFetched,
      uniqueAfterDedupe,
      dedupeSaved: Math.max(0, totalFetched - uniqueAfterDedupe),
      avgCoverage,
    };
  }, [filteredSources]);

  const refreshSingle = async (key: SourceKey) => {
    setSources((current) =>
      current.map((s) =>
        s.key === key
          ? {
              ...s,
              state: "fetching",
              error: undefined,
            }
          : s,
      ),
    );

    await wait(randomBetween(450, 1200));

    const failed = Math.random() < 0.14;

    if (failed) {
      setSources((current) =>
        current.map((s) =>
          s.key === key
            ? {
                ...s,
                state: "error",
                lastFetchAt: new Date().toISOString(),
                error: "Source timeout after 30s. Retry recommended.",
              }
            : s,
        ),
      );
      return;
    }

    setSources((current) =>
      current.map((s) => {
        if (s.key !== key) return s;

        const newFetched = s.totalFetched + randomBetween(6, 25);
        const dedupeDrop = randomBetween(2, 11);
        const newUnique = clamp(newFetched - dedupeDrop, 0, newFetched);
        const newCoverage = clamp(s.coverage + randomBetween(-2, 5), 35, 100);

        return {
          ...s,
          state: "success",
          totalFetched: newFetched,
          uniqueAfterDedupe: newUnique,
          coverage: newCoverage,
          lastFetchAt: new Date().toISOString(),
          error: undefined,
        };
      }),
    );
  };

  const refreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      const keys = filteredSources.map((s) => s.key);
      for (const key of keys) {
        // sequential fetch makes status transitions visible in UI
        await refreshSingle(key);
      }
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const statusPill = (state: FetchState) => {
    const map: Record<FetchState, { text: string; bg: string; color: string }> = {
      idle: { text: "Idle", bg: "#EEF2FF", color: "#3730A3" },
      fetching: { text: "Fetching", bg: "#FEF3C7", color: "#92400E" },
      success: { text: "Synced", bg: "#DCFCE7", color: "#166534" },
      error: { text: "Error", bg: "#FEE2E2", color: "#991B1B" },
    };

    const v = map[state];
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          padding: "4px 8px",
          borderRadius: 999,
          background: v.bg,
          color: v.color,
          display: "inline-flex",
          alignItems: "center",
          minWidth: 68,
          justifyContent: "center",
        }}
      >
        {v.text}
      </span>
    );
  };

  return (
    <section
      aria-label="Job Hunter OS multi-source scanner"
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: 14,
        padding: 18,
        background: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#111827",
        maxWidth: 1100,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Israel Multi-Source Scanner</h2>
          <p style={{ margin: "6px 0 0", color: "#4B5563", fontSize: 13 }}>
            Coverage + fetch health + dedupe visibility for Data/Business/Product Analyst roles.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 13, color: "#374151", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Role:
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                padding: "6px 8px",
                fontSize: 13,
                background: "white",
              }}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={isRefreshingAll || filteredSources.length === 0}
            onClick={refreshAll}
            style={{
              border: "1px solid #1D4ED8",
              borderRadius: 8,
              background: isRefreshingAll ? "#93C5FD" : "#2563EB",
              color: "#FFFFFF",
              fontWeight: 600,
              padding: "7px 11px",
              cursor: isRefreshingAll ? "not-allowed" : "pointer",
            }}
          >
            {isRefreshingAll ? "Refreshing…" : "Refresh Visible Sources"}
          </button>
        </div>
      </header>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
        }}
      >
        <MetricCard title="Visible Sources" value={String(totals.sourceCount)} sub="after role filter" />
        <MetricCard title="Fetched Jobs" value={String(totals.totalFetched)} sub="raw before dedupe" />
        <MetricCard title="Unique Jobs" value={String(totals.uniqueAfterDedupe)} sub="after dedupe" />
        <MetricCard title="Duplicates Removed" value={String(totals.dedupeSaved)} sub="same job across sources" />
        <MetricCard title="Avg Coverage" value={`${totals.avgCoverage}%`} sub="market signal confidence" />
      </div>

      <div style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB", textAlign: "left" }}>
              <Th>Source</Th>
              <Th>Coverage</Th>
              <Th>Status</Th>
              <Th>Fetched</Th>
              <Th>Unique</Th>
              <Th>Dedupe</Th>
              <Th>Last Fetch</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredSources.map((source) => {
              const dedupe = Math.max(0, source.totalFetched - source.uniqueAfterDedupe);
              return (
                <tr key={source.key} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{source.label}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>{source.roles.join(" · ")}</div>
                  </Td>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 90,
                          height: 8,
                          borderRadius: 999,
                          background: "#E5E7EB",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${source.coverage}%`,
                            height: "100%",
                            background: source.coverage >= 75 ? "#22C55E" : source.coverage >= 55 ? "#F59E0B" : "#EF4444",
                          }}
                        />
                      </div>
                      <strong>{source.coverage}%</strong>
                    </div>
                  </Td>
                  <Td>{statusPill(source.state)}</Td>
                  <Td>{source.totalFetched}</Td>
                  <Td>{source.uniqueAfterDedupe}</Td>
                  <Td>
                    <span style={{ fontWeight: 600 }}>{dedupe}</span>
                    <span style={{ color: "#6B7280", marginLeft: 6 }}>
                      ({source.totalFetched > 0 ? Math.round((dedupe / source.totalFetched) * 100) : 0}%)
                    </span>
                  </Td>
                  <Td>
                    <div>{formatTime(source.lastFetchAt)}</div>
                    {source.error ? (
                      <div style={{ marginTop: 3, color: "#B91C1C", fontSize: 12 }} aria-live="polite">
                        {source.error}
                      </div>
                    ) : null}
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => void refreshSingle(source.key)}
                      disabled={source.state === "fetching" || isRefreshingAll}
                      style={{
                        border: "1px solid #D1D5DB",
                        background: "#FFFFFF",
                        borderRadius: 8,
                        padding: "6px 9px",
                        cursor: source.state === "fetching" || isRefreshingAll ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {source.state === "fetching" ? "Fetching…" : "Refresh"}
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSources.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            border: "1px dashed #D1D5DB",
            borderRadius: 10,
            padding: 12,
            color: "#4B5563",
            fontSize: 13,
          }}
        >
          No sources match current role filter.
        </div>
      ) : null}
    </section>
  );
}

function MetricCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <article
      style={{
        border: "1px solid #F3F4F6",
        borderRadius: 10,
        padding: "10px 12px",
        background: "#FAFAFA",
      }}
    >
      <div style={{ color: "#6B7280", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 5 }}>{value}</div>
      <div style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>{sub}</div>
    </article>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: "10px 8px", color: "#374151", fontWeight: 700, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 8px", verticalAlign: "top", whiteSpace: "nowrap" }}>{children}</td>;
}
