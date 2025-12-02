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

    // File immagine hero dal form
    const heroFile = form.get("hero_image");

    let heroImageDataUrl = null;

    if (heroFile && heroFile.size > 0) {
      // Converte il file in data URL (base64)
      heroImageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // es. "data:image/png;base64,...."
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(heroFile);
      });
    }

    const payload = {
      title: form.get("title"),
      event_date: form.get("event_date"),
      message_email: form.get("message_email"),
      message_sms: form.get("message_sms"),
      hero_image_data_url: heroImageDataUrl, // 👈 nuovo campo
      channels: {
        email: form.get("send_email") === "on",
        sms: form.get("send_sms") === "on",
      },
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

      loadHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || t("admin.campaign.state.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
