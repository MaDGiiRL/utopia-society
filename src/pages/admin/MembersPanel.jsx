// src/pages/admin/MembersPanel.jsx
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

  // storico
  const [registryEntries, setRegistryEntries] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState("");

  const [availableYears, setAvailableYears] = useState([]);

  const [registryPage, setRegistryPage] = useState(1);

  const [registryFile, setRegistryFile] = useState(null);
  const [importingRegistry, setImportingRegistry] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // anno da usare per l'import XLSX storico
  const [registryYear, setRegistryYear] = useState("");

  const [yearFilter, setYearFilter] = useState("ALL"); // filtra SOLO storico
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // modale socio "nuovo"
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // modale storico
  const [registryModalOpen, setRegistryModalOpen] = useState(false);
  const [selectedRegistryEntry, setSelectedRegistryEntry] = useState(null);

  // Carica membri non ancora esportati
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMembers();
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
  }, [t]);

  // Carica storico + anni disponibili
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

          // aggiorna anni
          setAvailableYears((prev) => {
            const yearsSet = new Set(prev);
            entries.forEach((r) => {
              if (r.year != null) yearsSet.add(String(r.year));
            });
            return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
          });
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

  // Filtro fascia oraria per i "nuovi" membri
  const filteredMembers = useMemo(() => {
    let list = members;

    const timeToMinutes = (t) => {
      if (!t) return null;
      const [h, m] = t.split(":").map((x) => parseInt(x, 10));
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const fromMinutes = timeToMinutes(fromTime);
    const toMinutes = timeToMinutes(toTime);

    if (fromMinutes != null || toMinutes != null) {
      list = list.filter((m) => {
        if (!m.created_at) return false;
        const d = new Date(m.created_at);
        if (Number.isNaN(d.getTime())) return false;
        const minutes = d.getHours() * 60 + d.getMinutes();
        if (fromMinutes != null && minutes < fromMinutes) return false;
        if (toMinutes != null && minutes > toMinutes) return false;
        return true;
      });
    }

    return list;
  }, [members, fromTime, toTime]);

  // Storico filtrato per anno (già filtrato dal backend ma doppia sicurezza)
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
    const yearForImportRaw = registryYear
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
          setAvailableYears((prev) => {
            const yearsSet = new Set(prev);
            entries.forEach((r) => {
              if (r.year != null) yearsSet.add(String(r.year));
            });
            return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
          });
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
      <MembersHeaderFilters
        t={t}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        fromTime={fromTime}
        setFromTime={setFromTime}
        toTime={toTime}
        setToTime={setToTime}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
        availableYears={availableYears}
      />

      <MembersTable
        t={t}
        loading={loading}
        error={error}
        filteredMembers={filteredMembers}
        onOpenMember={handleOpenMember}
      />

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
      />

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
