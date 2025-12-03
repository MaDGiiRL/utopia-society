import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchContactMessages } from "../../api/admin";
import ContactsHeader from "../../components/admin/contacts/ContactsHeader";
import ContactsAlerts from "../../components/admin/contacts/ContactsAlerts";
import ContactsTable from "../../components/admin/contacts/ContactsTable";
import ContactsPagination from "../../components/admin/contacts/ContactsPagination";
import ContactMessageModal from "../../components/admin/contacts/ContactMessageModal";
const PAGE_SIZE = 40;

export default function ContactMessagesPanel() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchContactMessages();
        if (!data.ok) {
          throw new Error(data.message || "Errore lettura messaggi");
        }
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Errore caricamento contact_messages:", err);
        setError(t("admin.contactsPanel.errorLoad"));
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  useEffect(() => {
    setPage(1);
  }, [messages.length]);

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));

  const pagedMessages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return messages.slice(start, start + PAGE_SIZE);
  }, [messages, page]);

  const handleOpen = (msg) => {
    setSelectedMessage(msg);
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  const handleExportCsv = () => {
    try {
      setExportError("");
      if (!messages.length) {
        setExportError(t("admin.contactsPanel.errorNoMessages"));
        return;
      }

      const headers = [
        "ID",
        t("admin.contactsPanel.table.date"),
        t("admin.contactsPanel.table.name"),
        t("admin.contactsPanel.table.email"),
        t("admin.contactsPanel.table.phone"),
        t("admin.contactsPanel.modal.message"),
      ];

      const escapeCsv = (value) => {
        if (value === null || value === undefined) return "";
        const s = String(value);
        return `"${s.replace(/"/g, '""')}"`;
      };

      const rows = messages.map((m) => {
        const created = m.created_at
          ? new Date(m.created_at).toLocaleString("it-IT")
          : "";
        return [
          escapeCsv(m.id),
          escapeCsv(created),
          escapeCsv(m.name || ""),
          escapeCsv(m.email || ""),
          escapeCsv(m.phone || ""),
          escapeCsv(m.message || ""),
        ].join(";");
      });

      const csvContent = [headers.join(";"), ...rows].join("\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `utopia_contact_messages_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Errore export CSV:", err);
      setExportError(t("admin.contactsPanel.errorExport"));
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-300">
        {t("admin.contactsPanel.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ContactsHeader total={messages.length} onExport={handleExportCsv} />

      <ContactsAlerts error={error} exportError={exportError} />

      <ContactsTable
        messages={pagedMessages}
        onOpen={handleOpen}
        empty={!messages.length}
        error={error}
      />

      <ContactsPagination
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        totalItems={messages.length}
        onPageChange={(next) =>
          setPage((p) => Math.min(Math.max(1, next), totalPages))
        }
      />

      <ContactMessageModal
        message={selectedMessage}
        onClose={handleCloseModal}
      />
    </div>
  );
}
