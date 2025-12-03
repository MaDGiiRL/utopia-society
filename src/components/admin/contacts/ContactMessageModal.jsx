// src/components/admin/contacts/ContactMessageModal.jsx
import { X, Reply } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactMessageModal({ message, onClose }) {
  const { t } = useTranslation();

  if (!message) return null;

  const buildMailtoLink = () => {
    if (!message?.email) return "#";

    const subject = t("admin.contactsPanel.replySubject");
    const body = t("admin.contactsPanel.replyBody", {
      name: message.name || "",
      message: message.message || "",
    });

    return `mailto:${encodeURIComponent(
      message.email
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 sm:px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950 p-4 sm:p-5 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              {t("admin.contactsPanel.modal.title")}
            </h3>
            <p className="text-[11px] text-slate-400">
              ID:{" "}
              <span className="font-mono text-[10px] break-all">
                {message.id}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3 text-xs text-slate-100">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {t("admin.contactsPanel.modal.name")}
              </p>
              <p>{message.name || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {t("admin.contactsPanel.modal.email")}
              </p>
              <p className="break-all">{message.email || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {t("admin.contactsPanel.modal.phone")}
              </p>
              <p>{message.phone || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                {t("admin.contactsPanel.modal.sentAt")}
              </p>
              <p>
                {message.created_at
                  ? new Date(message.created_at).toLocaleString("it-IT")
                  : "-"}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {t("admin.contactsPanel.modal.message")}
            </p>
            <p className="whitespace-pre-wrap text-slate-200/90">
              {message.message || "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-500/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200 hover:bg-slate-800"
          >
            {t("admin.contactsPanel.modal.close")}
          </button>

          {message.email && (
            <a
              href={buildMailtoLink()}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-cyan-400/70 bg-cyan-500/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/35 transition"
            >
              <Reply className="h-3.5 w-3.5" />
              {t("admin.contactsPanel.modal.reply")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
