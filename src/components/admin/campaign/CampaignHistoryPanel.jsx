// src/components/admin/campaign/CampaignHistoryPanel.jsx
import React, { useMemo, useState } from "react";
import {
  History,
  ChevronLeft,
  ChevronRight,
  X,
  ListOrdered,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE_CAMPAIGNS = 5;

export default function CampaignHistoryPanel({
  historyLoading,
  historyError,
  campaigns = [],
  logs = [],
}) {
  const { t } = useTranslation();

  const [campaignPage, setCampaignPage] = useState(1);

  // stato modale dettagli log
  const [detailsCampaignId, setDetailsCampaignId] = useState(null);
  const [detailsChannel, setDetailsChannel] = useState(null); // "email" | "whatsapp" | null

  const totalCampaignPages = Math.max(
    1,
    Math.ceil(campaigns.length / PAGE_SIZE_CAMPAIGNS)
  );

  const pagedCampaigns = useMemo(() => {
    const start = (campaignPage - 1) * PAGE_SIZE_CAMPAIGNS;
    return campaigns.slice(start, start + PAGE_SIZE_CAMPAIGNS);
  }, [campaigns, campaignPage]);

  // 🔹 aggrego i log per campagna e canale (email / whatsapp)
  const statsByCampaignId = useMemo(() => {
    const map = {};

    for (const l of logs) {
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

  const channelLabel = (channel) => {
    if (channel === "email") {
      return t("admin.campaign.logs.channel.email", "Email");
    }
    if (channel === "whatsapp") {
      return t("admin.campaign.logs.channel.whatsapp", "WhatsApp");
    }
    return channel;
  };

  const campaignForDetails = useMemo(
    () => campaigns.find((c) => c.id === detailsCampaignId) || null,
    [campaigns, detailsCampaignId]
  );

  const modalLogs = useMemo(() => {
    if (!detailsCampaignId || !detailsChannel) return [];

    return logs.filter((l) => {
      if (l.campaign_id !== detailsCampaignId) return false;
      if (detailsChannel === "email") {
        return l.channel === "email";
      }
      // whatsapp: includo anche "sms" per sicurezza
      if (detailsChannel === "whatsapp") {
        return l.channel === "whatsapp" || l.channel === "sms";
      }
      return false;
    });
  }, [logs, detailsCampaignId, detailsChannel]);

  const closeModal = () => {
    setDetailsCampaignId(null);
    setDetailsChannel(null);
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

      {/* Tabella campagne (UNICA) */}
      <div className="flex max-h-72 flex-col rounded-xl border border-white/5 bg-slate-950/70">
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
                  <th className="px-3 py-2 text-left">
                    {t("admin.campaign.history.table.deliveries")}
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

                    const emailSent =
                      typeof c.recipients_email === "number"
                        ? c.recipients_email
                        : stats.emailSent;

                    const whatsappSent =
                      typeof c.recipients_whatsapp === "number"
                        ? c.recipients_whatsapp
                        : stats.whatsappSent;

                    const createdByLabel =
                      c.created_by_email || c.created_by_admin_id || "—";
                    const updatedByLabel =
                      c.updated_by_email ||
                      c.updated_by_admin_id ||
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
                                ? new Date(c.created_at).toLocaleString("it-IT")
                                : "-"}
                            </span>
                            {hasUpdatedAt && (
                              <span className="text-[9px] text-slate-500">
                                {t(
                                  "admin.campaign.history.lastUpdateLabel",
                                  "Ultima modifica:"
                                )}{" "}
                                {new Date(c.updated_at).toLocaleString("it-IT")}
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
                                {t(
                                  "admin.campaign.history.publishedBy",
                                  "Pubblicata da"
                                )}{" "}
                                {createdByLabel}
                                {updatedByLabel &&
                                  updatedByLabel !== createdByLabel && (
                                    <>
                                      {" · "}
                                      {t(
                                        "admin.campaign.history.editedBy",
                                        "Modificata da"
                                      )}{" "}
                                      {updatedByLabel}
                                    </>
                                  )}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2 text-[10px] text-slate-300">
                          {c.event_date
                            ? new Date(c.event_date).toLocaleDateString("it-IT")
                            : "—"}
                        </td>

                        {/* Invii email / WhatsApp con click → modale log */}
                        <td className="px-3 py-2 text-[10px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsCampaignId(c.id);
                                  setDetailsChannel("email");
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-1.5 py-px text-[9px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                              >
                                📧{" "}
                                {t(
                                  "admin.campaign.history.emailLabel",
                                  "Email"
                                )}
                                : {emailSent}
                              </button>
                              {stats.emailFailed > 0 && (
                                <span className="text-[9px] text-rose-300">
                                  ({stats.emailFailed} errate)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDetailsCampaignId(c.id);
                                  setDetailsChannel("whatsapp");
                                }}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-1.5 py-px text-[9px] uppercase tracking-[0.16em] text-slate-100 hover:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                              >
                                💬{" "}
                                {t(
                                  "admin.campaign.history.whatsappLabel",
                                  "WhatsApp"
                                )}
                                : {whatsappSent}
                              </button>
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

      {/* MODALE LOG DETTAGLIATI */}
      {detailsCampaignId && detailsChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-900/90 text-cyan-300">
                  <ListOrdered className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {t(
                      "admin.campaign.logs.modal.title",
                      "Dettaglio invii campagna"
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {campaignForDetails?.title || "-"} ·{" "}
                    {channelLabel(detailsChannel)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-600/70 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="max-h-80 overflow-auto rounded-xl border border-white/5 bg-slate-950/80">
              {modalLogs.length ? (
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-900/80 uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        {t("admin.campaign.logs.table.ts")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("admin.campaign.logs.table.member", "Membro")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("admin.campaign.logs.table.status")}
                      </th>
                      <th className="px-3 py-2 text-left">
                        {t("admin.campaign.logs.table.error", "Errore")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalLogs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-t border-white/5 bg-slate-950/40"
                      >
                        <td className="px-3 py-2 text-[10px] text-slate-400">
                          {l.created_at
                            ? new Date(l.created_at).toLocaleString("it-IT")
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-300">
                          {l.member_id || "—"}
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
                        <td className="px-3 py-2 text-[10px] text-rose-300">
                          {l.error || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-3 py-4 text-center text-[11px] text-slate-500">
                  {t(
                    "admin.campaign.logs.modal.empty",
                    "Nessun log disponibile per questo canale."
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center rounded-full border border-slate-600/70 px-3 py-1 text-[11px] text-slate-100 hover:bg-slate-800"
              >
                {t("admin.campaign.logs.modal.close", "Chiudi")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
