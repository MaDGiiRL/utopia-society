// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById } from "../../api/admin";

import MembersHeaderFilters from "../../components/admin/registry/MembersHeaderFilters";
import MembersTable from "../../components/admin/registry/MembersTable";
import MembersRegistrySection from "../../components/admin/registry/MembersRegistrySection";
import MemberModal from "../../components/admin/registry/MemberModal";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";
const REGISTRY_PAGE_SIZE = 20; // 👈 paginazione da 20 per lo storico

export default function MembersPanel() {
  const { t } = useTranslation();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // storico da tabella members_registry
  const [registryEntries, setRegistryEntries] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState("");

  // paginazione storico
  const [registryPage, setRegistryPage] = useState(1); // 👈 pagina corrente

  // stato per import XLSX storico
  const [registryFile, setRegistryFile] = useState(null);
  const [importingRegistry, setImportingRegistry] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  // filtri anno + fascia oraria
  // ⚠️ yearFilter ora VALE SOLO per lo storico, non per la tabella members
  const [yearFilter, setYearFilter] = useState("ALL");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // modal dettagli socio
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // Carica lista soci (tabella members)
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Carica storico soci (tabella members_registry)
  useEffect(() => {
    let cancelled = false;

    async function loadRegistry() {
      setRegistryLoading(true);
      setRegistryError("");

      // cambio anno => reset alla prima pagina
      setRegistryPage(1); // 👈 reset pagina quando cambia il filtro anno

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
          setRegistryEntries(data.entries || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setRegistryError(
            err instanceof Error ? err.message : t("admin.membersPanel.error")
          );
        }
      } finally {
        if (!cancelled) {
          setRegistryLoading(false);
        }
      }
    }

    loadRegistry();
    return () => {
      cancelled = true;
    };
  }, [yearFilter, t]);

  // Anni disponibili (puoi anche lasciarli derivare da members se ti sta bene così)
  const availableYears = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.created_at) {
        const d = new Date(m.created_at);
        if (!Number.isNaN(d.getTime())) {
          set.add(d.getFullYear().toString());
        }
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [members]);

  // Soci filtrati SOLO per fascia oraria (NON più per anno!)
  const filteredMembers = useMemo(() => {
    let list = members; // 👈 niente filtro per yearFilter qui

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
  }, [members, fromTime, toTime]); // 👈 rimosso yearFilter dai deps

  // Storico filtrato (in pratica è già filtrato da backend, ma lo lascio come sicurezza)
  const filteredRegistry = useMemo(() => {
    if (yearFilter === "ALL") return registryEntries;
    const yearInt = parseInt(yearFilter, 10);
    if (Number.isNaN(yearInt)) return registryEntries;
    return registryEntries.filter((r) => r.year === yearInt);
  }, [registryEntries, yearFilter]);

  // Se il numero di righe cambia e la pagina corrente è fuori range, la aggiustiamo
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredRegistry.length / REGISTRY_PAGE_SIZE)
    );
    if (registryPage > totalPages) {
      setRegistryPage(totalPages);
    }
  }, [filteredRegistry, registryPage]);

  // Applichiamo la paginazione da 20 allo storico
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
      if (!data.ok) {
        throw new Error(data.message || "Errore lettura socio");
      }
      setSelectedMember(data.member);
    } catch (err) {
      console.error(err);
      setSelectedMember(null);
    } finally {
      setLoadingMember(false);
    }
  };

  // Import XLSX storico soci
  const handleImportRegistry = async () => {
    if (!registryFile) {
      setImportMessage("Seleziona prima un file .xlsx");
      return;
    }

    setImportingRegistry(true);
    setImportMessage("");

    try {
      const formData = new FormData();
      formData.append("file", registryFile);

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

      // ricarica storico con filtro attuale
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
          setRegistryEntries(refData.entries || []);
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
        setYearFilter={setYearFilter} // 👈 ora filtra solo lo storico
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
        filteredMembers={filteredMembers} // 👈 niente filtro anno
        onOpenMember={handleOpenMember}
      />

      <MembersRegistrySection
        registryLoading={registryLoading}
        registryError={registryError}
        filteredRegistry={paginatedRegistry} // pagina corrente
        registryFile={registryFile}
        setRegistryFile={setRegistryFile}
        importingRegistry={importingRegistry}
        importMessage={importMessage}
        onImportClick={handleImportRegistry}
        page={registryPage}
        pageSize={REGISTRY_PAGE_SIZE}
        total={filteredRegistry.length}
        onPageChange={setRegistryPage}
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
    </div>
  );
}
