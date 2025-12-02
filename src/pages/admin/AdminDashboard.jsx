import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminMain from "../../components/admin/AdminMain";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";

export default function AdminDashboard() {
  const { t } = useTranslation();

  // niente <...> qui, solo JS
  const [tab, setTab] = useState("members"); // "members" | "contacts" | "campaign"

  const [xmlError, setXmlError] = useState("");
  const [xmlLoading, setXmlLoading] = useState(false);

  const [xlsxError, setXlsxError] = useState("");
  const [xlsxLoading, setXlsxLoading] = useState(false);

  const navigate = useNavigate();

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

      if (!res.ok) {
        throw new Error("Errore download file ACSI");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const today = new Date().toISOString().slice(0, 10);
      a.download = `utopia_acsi_${today}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setXlsxError(err.message || "Errore imprevisto");
    } finally {
      setXlsxLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh)] bg-slate-950/55 text-slate-50 px-3 py-25">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:flex-row">
        <AdminSidebar
          tab={tab}
          onTabChange={setTab}
          // XML export
          xmlError={xmlError}
          xmlLoading={xmlLoading}
          onExportXml={handleExportXml}
          // XLSX ACSI export
          xlsxError={xlsxError}
          xlsxLoading={xlsxLoading}
          onExportXlsx={handleExportXlsx}
          // logout
          onLogout={handleLogout}
        />
        <AdminMain tab={tab} />
      </div>
    </div>
  );
}
