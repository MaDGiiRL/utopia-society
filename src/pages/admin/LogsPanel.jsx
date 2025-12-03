import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  RefreshCcw,
  AlertTriangle,
  Info,
  Bug,
  CheckCircle2,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

// Traccia eventi di UI nel sistema di audit log
async function trackUiEvent(event_type, description, meta) {
  try {
    await fetch(`${API_BASE}/api/admin/logs/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type,
        description,
        meta: meta || null,
        source: "admin_panel_logs_tab",
      }),
      credentials: "include",
    });
  } catch {
    // ignora errori
  }
}

// helper per relative time
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffSec < 60) return "now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffH < 24) return `${diffH} h ago`;
  return `${diffD} d ago`;
}

function getSeverity(eventType = "") {
  const t = String(eventType).toLowerCase();

  if (t.includes("error") || t.includes("fail") || t.includes("failed")) {
    return "error";
  }
  if (t.includes("warn") || t.includes("warning")) {
    return "warning";
  }
  if (t.includes("login") || t.includes("logout") || t.includes("view")) {
    return "info";
  }
  if (
    t.includes("created") ||
    t.includes("success") ||
    t.includes("sent") ||
    t.includes("export")
  ) {
    return "success";
  }
  return "default";
}

// palette Utopia: cyan / fuchsia / emerald / slate
function severityConfig(sev) {
  switch (sev) {
    case "error":
      return {
        icon: Bug,
        pillClass:
          "bg-fuchsia-500/15 text-fuchsia-100 border border-fuchsia-400/70 shadow-[0_0_12px_rgba(217,70,239,0.45)]",
        labelClass: "text-fuchsia-200",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        pillClass:
          "bg-amber-500/15 text-amber-100 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.35)]",
        labelClass: "text-amber-200",
      };
    case "success":
      return {
        icon: CheckCircle2,
        pillClass:
          "bg-emerald-500/15 text-emerald-100 border border-emerald-400/70 shadow-[0_0_10px_rgba(16,185,129,0.35)]",
        labelClass: "text-emerald-200",
      };
    case "info":
      return {
        icon: Info,
        pillClass:
          "bg-cyan-500/15 text-cyan-100 border border-cyan-400/70 shadow-[0_0_10px_rgba(34,211,238,0.35)]",
        labelClass: "text-cyan-200",
      };
    default:
      return {
        icon: Activity,
        pillClass:
          "bg-slate-900/80 text-slate-100 border border-slate-700/80 shadow-[0_0_8px_rgba(15,23,42,0.8)]",
        labelClass: "text-slate-300",
      };
  }
}

const PAGE_SIZE = 20;

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [severityFilter, setSeverityFilter] = useState("all"); // all | error | warning | info | success ...
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE}/api/admin/logs?limit=100&offset=0`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.message || "Errore nel recupero dei log attività"
          );
        }

        const data = await res.json();
        setLogs(data.logs || []);

        trackUiEvent("admin_view_logs", "Visualizzazione log attività", {
          count: data.logs?.length || 0,
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Errore imprevisto nel caricamento dei log");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [refreshKey]);

  const handleRefresh = () => {
    trackUiEvent("admin_click_logs_refresh", "Refresh manuale log", null);
    setRefreshKey((k) => k + 1);
  };

  // reset page quando cambiano filtri o ricerca
  useEffect(() => {
    setPage(1);
  }, [severityFilter, search]);

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log) => {
      const sev = getSeverity(log.event_type);
      if (severityFilter !== "all" && sev !== severityFilter) return false;

      if (!search.trim()) return true;

      const haystack = [
        log.event_type || "",
        log.description || "",
        log.source || "",
        log.ip || "",
        log.admin_id || "",
        log.member_id || "",
        typeof log.meta === "string"
          ? log.meta
          : log.meta
          ? JSON.stringify(log.meta)
          : "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search.toLowerCase());
    });
  }, [logs, severityFilter, search]);

  const total = filteredLogs.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(pageCount, p + 1));
  };

  return (
    <div className="flex flex-col gap-3 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/80">
            <Activity className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">
              Log attività
            </h2>
            <p className="text-xs text-slate-400">
              Ultimi 100 eventi di sistema e UI
            </p>
          </div>
        </div>

        {/* Search + refresh */}
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in logs..."
            className="h-8 w-full rounded-full border border-slate-700 bg-slate-950/90 px-3 text-[11px] text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-400/80 sm:w-56"
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-1 rounded-full border border-slate-600/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition ${
              loading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <RefreshCcw
              className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Severity filter */}
      <div className="flex flex-col gap-2 text-[10px] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "all", label: "All" },
            { key: "error", label: "Error" },
            { key: "warning", label: "Warning" },
            { key: "info", label: "Info" },
            { key: "success", label: "Success" },
          ].map((f) => {
            const active = severityFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setSeverityFilter(f.key)}
                className={`rounded-full px-2 py-1 transition ${
                  active
                    ? "bg-cyan-500/20 text-cyan-100 border border-cyan-400/70"
                    : "bg-slate-950/80 text-slate-300 border border-slate-700 hover:border-cyan-400/60 hover:text-cyan-100"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* info conteggio log + pagina */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
          <span>
            {total === 0
              ? "0 log"
              : `Showing ${startIndex + 1}–${endIndex} of ${total} logs`}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100">
          {error}
        </div>
      )}

      {/* Lista log + paginazione */}
      <div className="mt-1 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-400">
            Caricamento log...
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-500">
            Nessun log registrato con i filtri attuali.
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <ul className="flex-1 divide-y divide-slate-800 overflow-auto text-[11px]">
              {paginatedLogs.map((log) => {
                const sev = getSeverity(log.event_type);
                const cfg = severityConfig(sev);
                const Icon = cfg.icon;

                let metaDisplay = log.meta;
                if (typeof metaDisplay === "string") {
                  try {
                    metaDisplay = JSON.parse(metaDisplay);
                  } catch {
                    // resta stringa
                  }
                }

                const createdAt = log.created_at
                  ? new Date(log.created_at)
                  : null;

                return (
                  <li
                    key={log.id}
                    className="px-3 py-2.5 hover:bg-slate-900/60 transition"
                  >
                    {/* Top row: type + source + time */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* type pill */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${cfg.pillClass}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{log.event_type || "event"}</span>
                        </span>

                        {/* source */}
                        {log.source && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">
                            <Activity className="h-3 w-3 text-slate-500" />
                            <span>{log.source}</span>
                          </span>
                        )}
                      </div>

                      {/* time */}
                      <div className="flex flex-col items-start text-[10px] text-slate-500 sm:items-end">
                        <span>
                          {log.created_at
                            ? createdAt.toLocaleString("it-IT")
                            : "-"}
                        </span>
                        {log.created_at && (
                          <span className="text-[9px] text-slate-500">
                            {formatRelativeTime(log.created_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* description */}
                    {log.description && (
                      <p className="mt-1 text-[11px] text-slate-200">
                        {log.description}
                      </p>
                    )}

                    {/* meta quick chips */}
                    <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                      {log.admin_id && (
                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                          admin_id:{" "}
                          <span className="text-slate-200">{log.admin_id}</span>
                        </span>
                      )}
                      {log.member_id && (
                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                          member_id:{" "}
                          <span className="text-slate-200">
                            {log.member_id}
                          </span>
                        </span>
                      )}
                      {log.ip && (
                        <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                          IP: <span className="text-slate-200">{log.ip}</span>
                        </span>
                      )}
                      {log.user_agent && (
                        <span className="hidden rounded-full bg-slate-900/80 px-2 py-0.5 sm:inline">
                          UA:{" "}
                          <span className="text-slate-300">
                            {log.user_agent.slice(0, 40)}
                            {log.user_agent.length > 40 ? "…" : ""}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* meta JSON */}
                    {metaDisplay && (
                      <pre className="mt-1 max-h-24 overflow-auto rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">
                        {typeof metaDisplay === "string"
                          ? metaDisplay
                          : JSON.stringify(metaDisplay, null, 2)}
                      </pre>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Pagination footer */}
            <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/90 px-3 py-2 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentPage <= 1}
                  className={`rounded-full px-2 py-1 border border-slate-700 hover:border-cyan-400/70 hover:text-cyan-100 transition ${
                    currentPage <= 1
                      ? "cursor-not-allowed opacity-40"
                      : "text-slate-200"
                  }`}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage >= pageCount}
                  className={`rounded-full px-2 py-1 border border-slate-700 hover:border-cyan-400/70 hover:text-cyan-100 transition ${
                    currentPage >= pageCount
                      ? "cursor-not-allowed opacity-40"
                      : "text-slate-200"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
