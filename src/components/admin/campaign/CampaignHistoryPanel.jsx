import { useMemo, useState } from "react";
import { History, ListOrdered, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE_CAMPAIGNS = 5;
const PAGE_SIZE_LOGS = 5;

export default function CampaignHistoryPanel({
  historyLoading,
  historyError,
  campaigns,
  logs,
}) {
  const { t } = useTranslation();

  const [campaignPage, setCampaignPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const totalCampaignPages = Math.max(
    1,
    Math.ceil((campaigns?.length || 0) / PAGE_SIZE_CAMPAIGNS)
  );
  const totalLogPages = Math.max(
    1,
    Math.ceil((logs?.length || 0) / PAGE_SIZE_LOGS)
  );

  const pagedCampaigns = useMemo(() => {
    const start = (campaignPage - 1) * PAGE_SIZE_CAMPAIGNS;
    return (campaigns || []).slice(start, start + PAGE_SIZE_CAMPAIGNS);
  }, [campaigns, campaignPage]);

  const pagedLogs = useMemo(() => {
    const start = (logPage - 1) * PAGE_SIZE_LOGS;
    return (logs || []).slice(start, start + PAGE_SIZE_LOGS);
  }, [logs, logPage]);

  const statusLabel = (status) => {
    if (status === "sent") return t("admin.campaign.status.sent");
    if (status === "sending") return t("admin.campaign.status.sending");
    return t("admin.campaign.status.other");
  };

  const logStatusLabel = (status) => {
    if (status === "sent") return t("admin.campaign.logs.status.sent");
    if (status === "error") return t("admin.campaign.logs.status.error");
    return status;
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/80 text-cyan-300">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              {t("admin.campaign.history.title")}
            </h3>
            <p className="text-[10px] text-slate-500">
              {t("admin.campaign.history.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {historyError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {historyError}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Tabella campagne */}
        <div className="flex flex-col max-h-64 rounded-xl border border-white/5 bg-slate-950/70">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.history.table.date")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.history.table.title")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.history.table.eventDate")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.history.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-400"
                    >
                      {t("admin.campaign.history.loading")}
                    </td>
                  </tr>
                ) : pagedCampaigns.length ? (
                  pagedCampaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
                    >
                      <td className="px-3 py-2 text-[10px] text-slate-400">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleString("it-IT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2">{c.title || "-"}</td>
                      <td className="px-3 py-2 text-[10px] text-slate-300">
                        {c.event_date
                          ? new Date(c.event_date).toLocaleDateString("it-IT")
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                            c.status === "sent"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                              : c.status === "sending"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                              : "bg-slate-700/40 text-slate-200 border border-slate-500/40"
                          }`}
                        >
                          {statusLabel(c.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-xs text-slate-500"
                    >
                      {t("admin.campaign.history.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginazione campagne */}
          {!historyLoading && campaigns.length > PAGE_SIZE_CAMPAIGNS && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-[10px] text-slate-300">
              <span>
                {t("ui.pagination.pageOf", {
                  current: campaignPage,
                  total: totalCampaignPages,
                  pageSize: PAGE_SIZE_CAMPAIGNS,
                })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCampaignPage((p) => Math.max(1, p - 1))}
                  disabled={campaignPage === 1}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                    campaignPage === 1
                      ? "border-slate-700 text-slate-600 cursor-not-allowed"
                      : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft className="h-3 w-3" />
                  {t("ui.pagination.prev")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCampaignPage((p) => Math.min(totalCampaignPages, p + 1))
                  }
                  disabled={campaignPage === totalCampaignPages}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                    campaignPage === totalCampaignPages
                      ? "border-slate-700 text-slate-600 cursor-not-allowed"
                      : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                  }`}
                >
                  {t("ui.pagination.next")}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabella log */}
        <div className="flex flex-col max-h-64 rounded-xl border border-white/5 bg-slate-950/70">
          <div className="flex items-center gap-2 px-3 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <ListOrdered className="h-3 w-3" />
            {t("admin.campaign.logs.title")}
          </div>

          <div className="flex-1 overflow-auto">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.logs.table.ts")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.logs.table.campaign")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.logs.table.channel")}
                  </th>
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.logs.table.status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-xs text-slate-400"
                    >
                      {t("admin.campaign.logs.loading")}
                    </td>
                  </tr>
                ) : pagedLogs.length ? (
                  pagedLogs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
                    >
                      <td className="px-3 py-2 text-[10px] text-slate-400">
                        {l.created_at
                          ? new Date(l.created_at).toLocaleString("it-IT")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-[10px] text-slate-300">
                        {l.campaign_id}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-slate-800/80 px-2 py-px text-[10px] uppercase tracking-[0.16em] text-slate-100">
                          {l.channel}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                            l.status === "sent"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {logStatusLabel(l.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-xs text-slate-500"
                    >
                      {t("admin.campaign.logs.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginazione log */}
          {!historyLoading && logs.length > PAGE_SIZE_LOGS && (
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-[10px] text-slate-300">
              <span>
                {t("ui.pagination.pageOf", {
                  current: logPage,
                  total: totalLogPages,
                  pageSize: PAGE_SIZE_LOGS,
                })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  disabled={logPage === 1}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                    logPage === 1
                      ? "border-slate-700 text-slate-600 cursor-not-allowed"
                      : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                  }`}
                >
                  <ChevronLeft className="h-3 w-3" />
                  {t("ui.pagination.prev")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLogPage((p) => Math.min(totalLogPages, p + 1))
                  }
                  disabled={logPage === totalLogPages}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                    logPage === totalLogPages
                      ? "border-slate-700 text-slate-600 cursor-not-allowed"
                      : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
                  }`}
                >
                  {t("ui.pagination.next")}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
