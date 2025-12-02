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

    const heroFile = form.get("hero_image");
    let heroImageDataUrl = null;

    try {
      if (heroFile && heroFile.size > 0) {
        // 🔹 comprime e ridimensiona l'immagine
        const compressed = await readAndCompressImage(heroFile);

        // 🔹 opzionale: blocca se ancora troppo grande
        const approxBytes = compressed.length; // 1 char ~ 1 byte
        const MAX_BYTES = 700_000; // ~700KB

        if (approxBytes > MAX_BYTES) {
          setLoading(false);
          setError(
            t(
              "admin.campaign.form.heroImageTooLarge",
              "L'immagine è troppo grande anche dopo la compressione. Usa un file più leggero (max ~700KB)."
            )
          );
          return;
        }

        heroImageDataUrl = compressed;
      }

      const payload = {
        title: form.get("title"),
        event_date: form.get("event_date"),
        message_email: form.get("message_email"),
        message_sms: form.get("message_sms"),
        hero_image_data_url: heroImageDataUrl, // 👈 ora è molto più piccolo
        channels: {
          email: form.get("send_email") === "on",
          sms: form.get("send_sms") === "on",
        },
      };

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

  // Legge un File immagine, lo ridimensiona e lo comprime in JPEG base64
  async function readAndCompressImage(file) {
    const MAX_WIDTH = 1000; // larghezza massima hero
    const QUALITY = 0.7; // qualità JPEG (0–1)

    // 1) leggi il file come dataURL
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 2) crea un'immagine per poter usare <canvas>
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = dataUrl;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 3) esporta come JPEG compresso
    const compressedDataUrl = canvas.toDataURL("image/jpeg", QUALITY);

    return compressedDataUrl;
  }

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
