import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import CampaignHeader from "../../components/admin/campaign/CampaignHeader";
import CampaignForm from "../../components/admin/campaign/CampaignForm";
import CampaignHistoryPanel from "../../components/admin/campaign/CampaignHistoryPanel";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function NewCampaign() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const [recipientsCount, setRecipientsCount] = useState(null);

  const [campaigns, setCampaigns] = useState([]);
  const [logs, setLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const { data: campData, error: campErr } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (campErr) throw campErr;

      const { data: logData, error: logErr } = await supabase
        .from("campaign_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);

      if (logErr) throw logErr;

      setCampaigns(campData || []);
      setLogs(logData || []);
    } catch (err) {
      console.error("Errore caricamento storico campagne:", err);
      setHistoryError(t("admin.campaign.history.errorLoad"));
      setCampaigns([]);
      setLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    setError("");
    setRecipientsCount(null);

    const form = new FormData(e.target);

    const channel = form.get("channel") || "email"; // 👈 letto dalla form

    const payload = {
      title: form.get("title"),
      event_date: form.get("event_date"),
      message_email: form.get("message_email"),
      channels: {
        email: channel === "email",
        sms: channel === "sms",
      },
      // URL immagine hero (stringa, NON base64)
      hero_image_url: form.get("hero_image_url") || null,
    };

    try {
      const res = await fetch(`${API_BASE}/api/admin/send-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || t("admin.campaign.state.errorGeneric"));
      }

      setOk(true);
      setRecipientsCount(data.recipients ?? null);
      e.target.reset();

      // ricarica storico
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || t("admin.campaign.state.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-7 max-w-5xl mx-auto w-full">
      <CampaignHeader />
      <CampaignForm
        onSubmit={handleSubmit}
        loading={loading}
        ok={ok}
        error={error}
        recipientsCount={recipientsCount}
      />
      <CampaignHistoryPanel
        historyLoading={historyLoading}
        historyError={historyError}
        campaigns={campaigns}
        logs={logs}
      />
    </div>
  );
}
