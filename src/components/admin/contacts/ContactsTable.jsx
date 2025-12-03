// src/components/admin/contacts/ContactsTable.jsx
import { Mail, User, Phone, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactsTable({ messages, onOpen, empty, error }) {
  const { t } = useTranslation();

  return (
    <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5 bg-slate-950/60">
      <div className="min-w-full overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">
                {t("admin.contactsPanel.table.date")}
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />{" "}
                  {t("admin.contactsPanel.table.name")}
                </span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />{" "}
                  {t("admin.contactsPanel.table.email")}
                </span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />{" "}
                  {t("admin.contactsPanel.table.phone")}
                </span>
              </th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr
                key={m.id}
                className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 align-top text-[11px] text-slate-400 whitespace-nowrap">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("it-IT")
                    : "-"}
                </td>
                <td className="px-3 py-2 align-top">{m.name || "-"}</td>
                <td className="px-3 py-2 align-top break-all">
                  {m.email || "-"}
                </td>
                <td className="px-3 py-2 align-top">{m.phone || "-"}</td>
                <td className="px-3 py-2 align-top text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(m)}
                    className="inline-flex items-center gap-1 rounded-full border border-cyan-400/60 bg-cyan-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100 hover:bg-cyan-500/30 transition"
                  >
                    <Eye className="h-3 w-3" />
                    {t("admin.contactsPanel.table.details")}
                  </button>
                </td>
              </tr>
            ))}
            {!messages.length && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  {t("admin.contactsPanel.noMessages")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
