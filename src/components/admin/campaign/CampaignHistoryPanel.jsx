// src/components/admin/campaign/CampaignHistoryPanel.jsx
import React, { useMemo, useState } from "react";
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

  // 🔹 aggrego i log per campagna e canale (email / whatsapp)
  const statsByCampaignId = useMemo(() => {
    const map = {};

    for (const l of logs || []) {
      if (!l.campaign_id) continue;
      const id = l.campaign_id;

      if (!map[id]) {
        map[id] = {
          emailSent: 0,
          emailFailed: 0,
          whatsappSent: 0,
          whatsappFailed: 0,
        };
      }

      const isSent = l.status === "sent";

      if (l.channel === "email") {
        if (isSent) map[id].emailSent += 1;
        else map[id].emailFailed += 1;
      } else if (l.channel === "whatsapp" || l.channel === "sms") {
        // nel backend è "whatsapp", ma gestisco anche "sms" per sicurezza
        if (isSent) map[id].whatsappSent += 1;
        else map[id].whatsappFailed += 1;
      }
    }

    return map;
  }, [logs]);

  const statusLabel = (status) => {
    if (status === "sent") return t("admin.campaign.status.sent");
    if (status === "sending") return t("admin.campaign.status.sending");
    return t("admin.campaign.status.other");
  };

  const logStatusLabel = (status) => {
    if (status === "sent") return t("admin.campaign.logs.status.sent");
    if (status === "error" || status === "failed")
      return t("admin.campaign.logs.status.error");
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
        <div className="flex max-h-64 flex-col rounded-xl border border-white/5 bg-slate-950/70">
          <div className="flex-1 overflow-auto">
            <div className="min-w-full overflow-x-auto">
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
                    {/* nuovo: colonne invii */}
                    <th className="px-3 py-2 text-left">
                      {t("admin.campaign.history.table.deliveries") || "Invii"}
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
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-slate-400"
                      >
                        {t("admin.campaign.history.loading")}
                      </td>
                    </tr>
                  ) : pagedCampaigns.length ? (
                    pagedCampaigns.map((c) => {
                      const stats = statsByCampaignId[c.id] || {
                        emailSent: 0,
                        emailFailed: 0,
                        whatsappSent: 0,
                        whatsappFailed: 0,
                      };

                      // chi la pubblica / edita (se hai questi campi in tabella campaigns)
                      const createdByLabel =
                        c.created_by_name ||
                        c.created_by_email ||
                        c.created_by ||
                        "—";
                      const updatedByLabel =
                        c.updated_by_name ||
                        c.updated_by_email ||
                        c.updated_by ||
                        createdByLabel;

                      const hasUpdatedAt =
                        c.updated_at && c.updated_at !== c.created_at;

                      return (
                        <tr
                          key={c.id}
                          className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
                        >
                          <td className="px-3 py-2 text-[10px] text-slate-400">
                            <div className="flex flex-col gap-0.5">
                              <span>
                                {c.created_at
                                  ? new Date(c.created_at).toLocaleString(
                                      "it-IT"
                                    )
                                  : "-"}
                              </span>
                              {hasUpdatedAt && (
                                <span className="text-[9px] text-slate-500">
                                  Ultima modifica:{" "}
                                  {new Date(c.updated_at).toLocaleString(
                                    "it-IT"
                                  )}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] text-slate-100">
                                {c.title || "-"}
                              </span>
                              {createdByLabel !== "—" && (
                                <span className="text-[9px] text-slate-500">
                                  Pubblicata da {createdByLabel}
                                  {updatedByLabel &&
                                    updatedByLabel !== createdByLabel && (
                                      <> · Modificata da {updatedByLabel}</>
                                    )}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-2 text-[10px] text-slate-300">
                            {c.event_date
                              ? new Date(c.event_date).toLocaleDateString(
                                  "it-IT"
                                )
                              : "—"}
                          </td>

                          {/* Invii email / WhatsApp */}
                          <td className="px-3 py-2 text-[10px]">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <span className="rounded-full bg-slate-800/80 px-1.5 py-px text-[9px] uppercase tracking-[0.16em] text-slate-100">
                                  📧 Email: {stats.emailSent}
                                </span>
                                {stats.emailFailed > 0 && (
                                  <span className="text-[9px] text-rose-300">
                                    ({stats.emailFailed} errate)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="rounded-full bg-slate-800/80 px-1.5 py-px text-[9px] uppercase tracking-[0.16em] text-slate-100">
                                  💬 WhatsApp: {stats.whatsappSent}
                                </span>
                                {stats.whatsappFailed > 0 && (
                                  <span className="text-[9px] text-rose-300">
                                    ({stats.whatsappFailed} errate)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                                c.status === "sent"
                                  ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                  : c.status === "sending"
                                  ? "border border-amber-500/40 bg-amber-500/15 text-amber-300"
                                  : "border border-slate-500/40 bg-slate-700/40 text-slate-200"
                              }`}
                            >
                              {statusLabel(c.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-slate-500"
                      >
                        {t("admin.campaign.history.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                      ? "cursor-not-allowed border-slate-700 text-slate-600"
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
                      ? "cursor-not-allowed border-slate-700 text-slate-600"
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
        <div className="flex max-h-64 flex-col rounded-xl border border-white/5 bg-slate-950/70">
          <div className="flex items-center gap-2 px-3 pt-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            <ListOrdered className="h-3 w-3" />
            {t("admin.campaign.logs.title")}
          </div>

          <div className="flex-1 overflow-auto">
            <div className="min-w-full overflow-x-auto">
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
                      ? "cursor-not-allowed border-slate-700 text-slate-600"
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
                      ? "cursor-not-allowed border-slate-700 text-slate-600"
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
