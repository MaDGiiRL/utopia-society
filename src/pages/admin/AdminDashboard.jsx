// src/pages/admin/AdminDashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminMain from "../../components/admin/AdminMain";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function AdminDashboard() {
  const { t } = useTranslation();

  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // ✅ token per forzare reload members
  const [membersReloadToken, setMembersReloadToken] = useState(0);

  const [tab, setTab] = useState("members");

  const [xmlError, setXmlError] = useState("");
  const [xmlLoading, setXmlLoading] = useState(false);

  const [xlsxError, setXlsxError] = useState("");
  const [xlsxLoading, setXlsxLoading] = useState(false);

  const [lastXlsxExportAt, setLastXlsxExportAt] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("utopia:lastXlsxExportAt") || "";
  });

  const navigate = useNavigate();

  const trackUiEvent = async (event_type, description, meta) => {
    try {
      await fetch(`${API_BASE}/api/admin/logs/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type,
          description,
          meta: meta || null,
          source: "admin_panel_ui",
        }),
      });
    } catch {}
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    trackUiEvent("admin_tab_change", `Cambio tab admin in ${nextTab}`, {
      tab: nextTab,
    });
  };

  // ✅ IMPORT MEMBERS (usato dalla Sidebar)
  const handleImportMembers = async ({ file, year }) => {
    setImportMessage("");
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", String(year));

      const res = await fetch(`${API_BASE}/api/admin/members/import-xlsx`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Errore import soci");
      }

      const inserted = data.inserted ?? data.rows ?? null;

      setImportMessage(
        inserted != null
          ? `Import completato (${inserted} righe inserite).`
          : "Import completato."
      );

      // ✅ torna su members e ricarica lista
      setTab("members");
      setMembersReloadToken((n) => n + 1);

      trackUiEvent("admin_import_members_xlsx", "Import soci XLSX riuscito", {
        status: "ok",
        inserted,
      });

      return data;
    } catch (err) {
      console.error(err);
      setImportMessage(err?.message || "Errore imprevisto import");
      trackUiEvent("admin_import_members_xlsx", "Errore import soci XLSX", {
        status: "error",
        errorMessage: err?.message || String(err),
      });
      return { ok: false, message: err?.message || "Errore import" };
    } finally {
      setImporting(false);
    }
  };

  // -------- XML EXPORT (completo) --------
  const handleExportXml = async () => {
    setXmlError("");
    setXmlLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/members.xml`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || t("admin.dashboard.xmlError", "Errore export XML")
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      a.href = url;
      a.download = `utopia_soci_${today}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      trackUiEvent("admin_export_members_xml", "Export soci XML riuscito", {
        status: "ok",
      });
    } catch (err) {
      console.error(err);
      setXmlError(
        err instanceof Error
          ? err.message
          : t(
              "admin.dashboard.xmlUnexpectedError",
              "Errore imprevisto export XML"
            )
      );
      trackUiEvent("admin_export_members_xml", "Errore export soci XML", {
        status: "error",
        errorMessage: err?.message || String(err),
      });
    } finally {
      setXmlLoading(false);
    }
  };

  // -------- XLSX EXPORT (ACSI) --------
  const handleExportXlsx = async () => {
    setXlsxError("");
    setXlsxLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/members.xlsx`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Errore download file ACSI");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      a.href = url;
      a.download = `utopia_acsi_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const nowIso = new Date().toISOString();
      setLastXlsxExportAt(nowIso);
      if (typeof window !== "undefined") {
        localStorage.setItem("utopia:lastXlsxExportAt", nowIso);
      }

      trackUiEvent(
        "admin_export_members_xlsx",
        "Export soci XLSX ACSI riuscito",
        {
          status: "ok",
        }
      );
    } catch (err) {
      console.error(err);
      setXlsxError(err?.message || "Errore imprevisto");

      trackUiEvent(
        "admin_export_members_xlsx",
        "Errore export soci XLSX ACSI",
        {
          status: "error",
          errorMessage: err?.message || String(err),
        }
      );
    } finally {
      setXlsxLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      trackUiEvent("admin_logout_click", "Click su logout admin");
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950/55 text-slate-50 px-3 py-20 sm:px-4 sm:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:gap-6 md:flex-row">
        <AdminSidebar
          tab={tab}
          onTabChange={handleTabChange}
          xmlError={xmlError}
          xmlLoading={xmlLoading}
          onExportXml={handleExportXml}
          xlsxError={xlsxError}
          xlsxLoading={xlsxLoading}
          onExportXlsx={handleExportXlsx}
          lastXlsxExportAt={lastXlsxExportAt}
          // ✅ import
          onImportMembers={handleImportMembers}
          importing={importing}
          importMessage={importMessage}
          setImportMessage={setImportMessage}
          // logout
          onLogout={handleLogout}
        />

        <AdminMain tab={tab} membersReloadToken={membersReloadToken} />
      </div>
    </div>
  );
}
