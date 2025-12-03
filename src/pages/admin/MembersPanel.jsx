import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById } from "../../api/admin";

import MembersHeaderFilters from "../../components/admin/registry/MembersHeaderFilters";
import MembersTable from "../../components/admin/registry/MembersTable";
import MembersRegistrySection from "../../components/admin/registry/MembersRegistrySection";
import MemberModal, {
  RegistryEntryModal,
} from "../../components/admin/registry/MemberModal";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";
const REGISTRY_PAGE_SIZE = 20;

export default function MembersPanel() {
  const { t } = useTranslation();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 filtro export per la PRIMA tabella (membri)
  const [membersExportFilter, setMembersExportFilter] =
    useState("non_exported");

  // storico
  const [registryEntries, setRegistryEntries] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState("");

  const [registryPage, setRegistryPage] = useState(1);

  const [registryFile, setRegistryFile] = useState(null);
  const [importingRegistry, setImportingRegistry] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // anno da usare per l'import XLSX storico
  const [registryYear, setRegistryYear] = useState("");

  // 🔹 filtro anno SOLO per lo storico
  const [yearFilter, setYearFilter] = useState("ALL");

  // modale socio "nuovo"
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // modale storico
  const [registryModalOpen, setRegistryModalOpen] = useState(false);
  const [selectedRegistryEntry, setSelectedRegistryEntry] = useState(null);

  // 👇 handler per il pulsante EXPORT
  const handleExportXlsx = () => {
    if (membersExportFilter !== "non_exported") return;
    const year = new Date().getFullYear();
    const url = `${API_BASE}/api/admin/members.xlsx?year=${year}`;
    window.location.href = url;
  };

  // Carica membri con filtro exported / non-exported / all
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMembers(membersExportFilter);
        if (!cancelled) {
          if (!data.ok) {
            throw new Error(data.message || t("admin.membersPanel.error"));
          }
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(t("admin.membersPanel.error"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [t, membersExportFilter]);

  // Carica storico + filtro per anno
  useEffect(() => {
    let cancelled = false;

    async function loadRegistry() {
      setRegistryLoading(true);
      setRegistryError("");
      setRegistryPage(1);

      try {
        const url =
          yearFilter === "ALL"
            ? `${API_BASE}/api/admin/members-registry`
            : `${API_BASE}/api/admin/members-registry?year=${encodeURIComponent(
                yearFilter
              )}`;

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Errore storico soci");
        }

        if (!cancelled) {
          const entries = data.entries || [];
          setRegistryEntries(entries);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setRegistryError(
            err instanceof Error ? err.message : t("admin.membersPanel.error")
          );
        }
      } finally {
        if (!cancelled) setRegistryLoading(false);
      }
    }

    loadRegistry();
    return () => {
      cancelled = true;
    };
  }, [yearFilter, t]);

  // Storico filtrato per anno (doppia sicurezza)
  const filteredRegistry = useMemo(() => {
    if (yearFilter === "ALL") return registryEntries;
    const yearInt = parseInt(yearFilter, 10);
    if (Number.isNaN(yearInt)) return registryEntries;
    return registryEntries.filter((r) => r.year === yearInt);
  }, [registryEntries, yearFilter]);

  // aggiusta pagina se fuori range
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredRegistry.length / REGISTRY_PAGE_SIZE)
    );
    if (registryPage > totalPages) {
      setRegistryPage(totalPages);
    }
  }, [filteredRegistry, registryPage]);

  const paginatedRegistry = useMemo(() => {
    const start = (registryPage - 1) * REGISTRY_PAGE_SIZE;
    const end = start + REGISTRY_PAGE_SIZE;
    return filteredRegistry.slice(start, end);
  }, [filteredRegistry, registryPage]);

  const handleOpenMember = async (id) => {
    setModalOpen(true);
    setSelectedMember(null);
    setLoadingMember(true);
    try {
      const data = await fetchMemberById(id);
      if (!data.ok) throw new Error(data.message || "Errore lettura socio");
      setSelectedMember(data.member);
    } catch (err) {
      console.error(err);
      setSelectedMember(null);
    } finally {
      setLoadingMember(false);
    }
  };

  // apertura modale storico
  const handleOpenRegistryEntry = (entry) => {
    setSelectedRegistryEntry(entry);
    setRegistryModalOpen(true);
  };

  // Import storico da XLSX
  const handleImportRegistry = async () => {
    if (!registryFile) {
      setImportMessage("Seleziona prima un file .xlsx");
      return;
    }

    // anno da usare per la colonna "year" dello storico
    const yearForImportRaw =
      registryYear && registryYear.trim().length
        ? registryYear
        : yearFilter !== "ALL"
        ? yearFilter
        : new Date().getFullYear().toString();

    const yearForImport = parseInt(yearForImportRaw, 10);
    if (Number.isNaN(yearForImport)) {
      setImportMessage("Inserisci un anno valido per l'import.");
      return;
    }

    setImportingRegistry(true);
    setImportMessage("");

    try {
      const formData = new FormData();
      formData.append("file", registryFile);
      formData.append("year", yearForImport.toString());

      const res = await fetch(
        `${API_BASE}/api/admin/members-registry/import-xlsx`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante l'import del file storico"
        );
      }

      const inserted = data.inserted ?? data.rows ?? null;
      setImportMessage(
        inserted != null
          ? `Import completato (${inserted} righe inserite).`
          : "Import completato."
      );
      setRegistryFile(null);

      // ricarico storico con filtro attuale
      try {
        const url =
          yearFilter === "ALL"
            ? `${API_BASE}/api/admin/members-registry`
            : `${API_BASE}/api/admin/members-registry?year=${encodeURIComponent(
                yearFilter
              )}`;
        const refRes = await fetch(url, { credentials: "include" });
        const refData = await refRes.json().catch(() => ({}));
        if (refRes.ok && refData.ok) {
          const entries = refData.entries || [];
          setRegistryEntries(entries);
        }
      } catch (e) {
        console.warn("Errore reload members_registry dopo import:", e);
      }
    } catch (err) {
      console.error(err);
      setImportMessage(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante l'import."
      );
    } finally {
      setImportingRegistry(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* HEADER: solo titolo + contatore */}
      <MembersHeaderFilters
        t={t}
        filteredCount={members.length}
        totalCount={members.length}
      />

      {/* 🔹 Filtro ESPORTATI / NON ESPORTATI + pulsante export XLSX */}
      <div className="mb-1 flex flex-col gap-2 rounded-xl border border-white/5 bg-slate-950/60 p-3 md:flex-row md:items-center md:justify-between">
        <span className="text-xs text-slate-400">
          Filtro esportazione tessere:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-8 rounded-lg border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
            value={membersExportFilter}
            onChange={(e) => setMembersExportFilter(e.target.value)}
          >
            <option value="non_exported">Solo non esportati</option>
            <option value="exported">Solo esportati</option>
            <option value="all">Tutti</option>
          </select>

          <button
            type="button"
            onClick={handleExportXlsx}
            disabled={membersExportFilter !== "non_exported"}
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
              membersExportFilter !== "non_exported"
                ? "cursor-not-allowed border-slate-600 bg-slate-900/60 text-slate-500 opacity-60"
                : "border-cyan-400/70 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/25"
            }`}
          >
            Esporta XLSX ACSI
          </button>
        </div>
      </div>

      {/* 🔹 wrapper con scroll orizzontale per la tabella membri */}
      <div className="-mx-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 px-2 py-2 sm:mx-0 sm:px-3">
        <MembersTable
          t={t}
          loading={loading}
          error={error}
          filteredMembers={members}
          onOpenMember={handleOpenMember}
        />
      </div>

      {/* 🔹 wrapper con scroll orizzontale per lo storico */}
      <div className="-mx-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 px-2 py-2 sm:mx-0 sm:px-3">
        <MembersRegistrySection
          registryLoading={registryLoading}
          registryError={registryError}
          filteredRegistry={paginatedRegistry}
          registryFile={registryFile}
          setRegistryFile={setRegistryFile}
          importingRegistry={importingRegistry}
          importMessage={importMessage}
          onImportClick={handleImportRegistry}
          page={registryPage}
          pageSize={REGISTRY_PAGE_SIZE}
          total={filteredRegistry.length}
          onPageChange={setRegistryPage}
          registryYear={registryYear}
          setRegistryYear={setRegistryYear}
          onOpenRegistryEntry={handleOpenRegistryEntry}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
        />
      </div>

      <MemberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMember(null);
        }}
        t={t}
        loadingMember={loadingMember}
        selectedMember={selectedMember}
      />

      <RegistryEntryModal
        open={registryModalOpen}
        onClose={() => {
          setRegistryModalOpen(false);
          setSelectedRegistryEntry(null);
        }}
        entry={selectedRegistryEntry}
      />
    </div>
  );
}
