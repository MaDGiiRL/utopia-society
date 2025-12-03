import { useEffect, useState } from "react";
import { Activity, RefreshCcw } from "lucide-react";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

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
    });
  } catch {
    // ignora errori
  }
}

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
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

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className={`inline-flex items-center gap-1 rounded-full border border-slate-600/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-200 hover:border-cyan-400/70 hover:text-cyan-100 transition ${
            loading ? "cursor-not-allowed opacity-60" : ""
          }`}
        >
          <RefreshCcw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100">
          {error}
        </div>
      )}

      {/* Lista log */}
      <div className="mt-1 flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-400">
            Caricamento log...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-500">
            Nessun log registrato.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800 text-[11px]">
            {logs.map((log) => (
              <li key={log.id} className="px-3 py-2.5 hover:bg-slate-900/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
                      {log.event_type}
                    </span>
                    {log.source && (
                      <span className="text-[10px] text-slate-500">
                        {log.source}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString("it-IT")
                      : "-"}
                  </span>
                </div>

                {log.description && (
                  <p className="mt-1 text-[11px] text-slate-200">
                    {log.description}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                  {log.admin_id && <span>admin_id: {log.admin_id}</span>}
                  {log.member_id && <span>member_id: {log.member_id}</span>}
                  {log.ip && <span>IP: {log.ip}</span>}
                </div>

                {log.meta && (
                  <pre className="mt-1 max-h-20 overflow-auto rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-slate-300">
                    {JSON.stringify(log.meta, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
