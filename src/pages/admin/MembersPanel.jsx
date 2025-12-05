// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById } from "../../api/admin";

import MembersHeaderFilters from "../../components/admin/registry/MembersHeaderFilters";
import MembersTable from "../../components/admin/registry/MembersTable";
import MemberModal, {
  RegistryEntryModal,
} from "../../components/admin/registry/MemberModal";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";
const PAGE_SIZE = 50;

export default function MembersPanel() {
  const { t } = useTranslation();

  // ---- SOCI DAL NUOVO SISTEMA (members) ----
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  // ---- STORICO ACSI (members_registry) ----
  const [registryEntries, setRegistryEntries] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState("");

  // ---- FILTRI GLOBALI (per l'unica tabella) ----
  const currentYear = new Date().getFullYear().toString();
  const [yearFilter, setYearFilter] = useState(currentYear); // default anno corrente
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ACTIVE | ALL

  // ---- PAGINAZIONE ----
  const [page, setPage] = useState(1);

  // ---- IMPORT STORICO ACSI ----
  const [registryFile, setRegistryFile] = useState(null);
  const [importingRegistry, setImportingRegistry] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [registryYear, setRegistryYear] = useState(""); // anno da usare per import

  // ---- MODALI ----
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  const [registryModalOpen, setRegistryModalOpen] = useState(false);
  const [selectedRegistryEntry, setSelectedRegistryEntry] = useState(null);

  // -----------------------------------------------------
  // CARICAMENTO SOCI "NUOVO SISTEMA"
  // -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      setMembersLoading(true);
      setMembersError("");
      try {
        // prendo TUTTI i soci; il filtro lo facciamo client-side
        const data = await fetchMembers("all");
        if (!cancelled) {
          if (!data.ok) {
            throw new Error(data.message || t("admin.membersPanel.error"));
          }
          setMembers(data.members || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setMembersError(t("admin.membersPanel.error"));
        }
      } finally {
        if (!cancelled) setMembersLoading(false);
      }
    }

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // -----------------------------------------------------
  // CARICAMENTO STORICO ACSI
  // -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadRegistry() {
      setRegistryLoading(true);
      setRegistryError("");

      try {
        const url = `${API_BASE}/api/admin/members-registry`;
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
        if (!cancelled) setRegistryLoading(false);
      }
    }

    loadRegistry();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // -----------------------------------------------------
  // NORMALIZZAZIONE DATI PER L'UNICA TABELLA
  // -----------------------------------------------------

  // Trasformo le righe di registry in pseudo-members
  const registryAsMembers = useMemo(() => {
    return registryEntries.map((r) => {
      const fullName = `${r.first_name || ""} ${r.last_name || ""}`.trim();

      return {
        // campi "base" tipo members
        id:
          r.id ||
          `registry-${
            r.external_id || r.card_number || r.year || Math.random()
          }`,
        created_at: r.valid_from || null,
        full_name:
          fullName || r.card_number || "Socio ACSI (storico registrato)",
        email: r.email || "",
        phone: r.phone || "",
        city: r.club_name || r.city || "",
        source: "members_registry",
        // info ACSI principali
        year: r.year,
        status: r.status,
        valid_from: r.valid_from,
        valid_to: r.valid_to,
        // info per badge "attivo"
        is_registry_active: (r.status || "")
          .toString()
          .toLowerCase()
          .startsWith("attiv"),
        // tengo il record originale per la modale
        _registryEntry: r,
        // fields utili per MembersTable (nome/cognome separati)
        first_name: r.first_name,
        last_name: r.last_name,
      };
    });
  }, [registryEntries]);

  // Unisco soci "nuovi" + storici ACSI
  const allRows = useMemo(() => {
    // i members del nuovo sistema li lascio così come sono
    const normalizedMembers = members.map((m) => ({
      ...m,
      _registryEntry: null,
      is_registry_active: false,
    }));

    return [...normalizedMembers, ...registryAsMembers];
  }, [members, registryAsMembers]);

  // -----------------------------------------------------
  // FILTRI GLOBALI (ANNO + STATO)
  // -----------------------------------------------------
  const filteredRows = useMemo(() => {
    const yearInt =
      yearFilter && yearFilter !== "ALL" ? parseInt(yearFilter, 10) : null;

    return allRows
      .filter((row) => {
        // filtro per anno
        if (yearInt) {
          const fromYear =
            row.year ??
            (row.valid_from
              ? new Date(row.valid_from).getFullYear()
              : row.created_at
              ? new Date(row.created_at).getFullYear()
              : null);

          if (fromYear !== yearInt) return false;
        }

        // filtro per stato
        if (statusFilter === "ACTIVE") {
          const statusText = (
            row._registryEntry?.status ||
            row.status ||
            ""
          ).toString();
          if (!statusText.toLowerCase().startsWith("attiv")) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // ordino per anno desc, poi per data valid_from/created_at desc
        const ay =
          a.year ??
          (a.valid_from
            ? new Date(a.valid_from).getFullYear()
            : a.created_at
            ? new Date(a.created_at).getFullYear()
            : 0);
        const by =
          b.year ??
          (b.valid_from
            ? new Date(b.valid_from).getFullYear()
            : b.created_at
            ? new Date(b.created_at).getFullYear()
            : 0);

        if (by !== ay) return by - ay;

        const aTime = a.valid_from
          ? new Date(a.valid_from).getTime()
          : a.created_at
          ? new Date(a.created_at).getTime()
          : 0;
        const bTime = b.valid_from
          ? new Date(b.valid_from).getTime()
          : b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return bTime - aTime;
      });
  }, [allRows, yearFilter, statusFilter]);

  // -----------------------------------------------------
  // PAGINAZIONE
  // -----------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredRows.slice(start, end);
  }, [filteredRows, page]);

  // -----------------------------------------------------
  // HANDLER MODALI
  // -----------------------------------------------------
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

  const handleOpenRegistryEntry = (entry) => {
    setSelectedRegistryEntry(entry);
    setRegistryModalOpen(true);
  };

  // -----------------------------------------------------
  // IMPORT XLSX STORICO ACSI
  // -----------------------------------------------------
  const handleImportRegistry = async () => {
    if (!registryFile) {
      setImportMessage("Seleziona prima un file .xlsx");
      return;
    }

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

      // ricarico lo storico
      try {
        const url = `${API_BASE}/api/admin/members-registry`;
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

  // -----------------------------------------------------
  // STATO GLOBALE (loading / error) PER LA TABELLA
  // -----------------------------------------------------
  const globalLoading = membersLoading || registryLoading;
  const globalError = membersError || registryError;

  return (
    <div className="flex flex-col gap-3">
      {/* HEADER: titolo + contatore */}
      <MembersHeaderFilters
        t={t}
        filteredCount={filteredRows.length}
        totalCount={allRows.length}
      />

      {/* FILTRI GLOBALI + IMPORT XLSX STORICO */}
      <div className="mb-1 flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 md:flex-row md:items-start md:justify-between">
        {/* Filtri anno + stato */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <span>Anno:</span>
            <select
              className="h-8 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">Tutti</option>
              {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
              {/* aggiungo anche l'anno corrente se non è nella lista */}
              {!["2026", "2025", "2024", "2023", "2022"].includes(
                currentYear
              ) && <option value={currentYear}>{currentYear}</option>}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span>Stato:</span>
            <select
              className="h-8 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ACTIVE">Solo attivi</option>
              <option value="ALL">Tutti</option>
            </select>
          </div>
        </div>

        {/* Import storico ACSI */}
        <div className="flex flex-col gap-2 text-xs text-slate-300 md:items-end">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setRegistryFile(e.target.files?.[0] || null)}
              className="block w-48 cursor-pointer text-[10px] text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-slate-100 hover:file:bg-slate-600"
            />
            <input
              type="text"
              placeholder="Anno per import (es. 2025)"
              value={registryYear}
              onChange={(e) => setRegistryYear(e.target.value)}
              className="h-8 w-36 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-[10px] text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleImportRegistry}
              disabled={importingRegistry}
              className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                importingRegistry
                  ? "cursor-not-allowed border-slate-600 bg-slate-800 text-slate-400"
                  : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/25"
              }`}
            >
              {importingRegistry ? "Import in corso…" : "Import XLSX storico"}
            </button>
          </div>
          {importMessage && (
            <p className="text-[10px] text-slate-300">{importMessage}</p>
          )}
        </div>
      </div>

      {/* TABELLA UNICA */}
      <div className="-mx-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 px-2 py-2 sm:mx-0 sm:px-3">
        <MembersTable
          t={t}
          loading={globalLoading}
          error={globalError}
          filteredMembers={paginatedRows}
          onOpenMember={handleOpenMember}
          onOpenRegistryEntry={handleOpenRegistryEntry}
        />

        {/* Paginazione */}
        {filteredRows.length > PAGE_SIZE && (
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
            <span>
              Pagina {page} di {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                  page <= 1
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "bg-slate-700 text-slate-100 hover:bg-slate-600"
                }`}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                  page >= totalPages
                    ? "cursor-not-allowed bg-slate-800 text-slate-500"
                    : "bg-slate-700 text-slate-100 hover:bg-slate-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALI */}
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
