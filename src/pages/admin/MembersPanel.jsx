// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById } from "../../api/admin";

import MembersHeaderFilters from "../../components/admin/registry/MembersHeaderFilters";
import MembersTable from "../../components/admin/registry/MembersTable";
import MemberModal from "../../components/admin/registry/MemberModal";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";
const PAGE_SIZE = 50;

export default function MembersPanel() {
  const { t } = useTranslation();

  // ---- SOCI (tabella members) ----
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- FILTRI GLOBALI ----
  const currentYear = new Date().getFullYear().toString();

  // MOSTRA TUTTO DI DEFAULT
  const [yearFilter, setYearFilter] = useState("ALL"); // "ALL" oppure anno specifico
  const [statusFilter, setStatusFilter] = useState("ALL"); // ACTIVE | ALL

  // FILTRO EXPORT (non esportati / esportati / tutti)
  // 🔹 DI DEFAULT: vedi TUTTI
  const [exportFilter, setExportFilter] = useState("all");
  // valori ammessi: "non_exported" | "exported" | "all"

  // ---- PAGINAZIONE ----
  const [page, setPage] = useState(1);

  // ---- IMPORT SOCI (XLSX) ----
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importYear, setImportYear] = useState("");

  // ---- MODALE SOCIO ----
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // -----------------------------------------------------
  // FUNZIONE UNICA DI CARICAMENTO SOCI
  // -----------------------------------------------------
  const loadMembers = useCallback(
    async (filter) => {
      setLoading(true);
      setError("");

      try {
        const data = await fetchMembers(filter);

        if (!data.ok) {
          throw new Error(data.message || t("admin.membersPanel.error"));
        }

        setMembers(data.members || []);
        setPage(1); // reset pagina ogni volta che ricarichi da backend
      } catch (err) {
        console.error(err);
        setError(t("admin.membersPanel.error"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  // -----------------------------------------------------
  // CARICAMENTO SOCI (solo tabella members)
  // -----------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await loadMembers(exportFilter);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadMembers, exportFilter]);

  // -----------------------------------------------------
  // FILTRI SU members (ANNO + STATO)
  // -----------------------------------------------------
  const filteredMembers = useMemo(() => {
    const yearInt =
      yearFilter && yearFilter !== "ALL" ? parseInt(yearFilter, 10) : null;

    return members
      .filter((m) => {
        // anno: uso m.year se c'è; altrimenti prendo anno da valid_from o created_at
        if (yearInt) {
          const fromYear =
            m.year ??
            (m.valid_from
              ? new Date(m.valid_from).getFullYear()
              : m.created_at
              ? new Date(m.created_at).getFullYear()
              : null);
          if (fromYear !== yearInt) return false;
        }

        // stato: “ACTIVE” = stringa che inizia per “attiv”
        if (statusFilter === "ACTIVE") {
          const statusText = (m.status || "").toString().toLowerCase();
          if (!statusText.startsWith("attiv")) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // ordino per anno desc, poi per data desc
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
  }, [members, yearFilter, statusFilter]);

  // -----------------------------------------------------
  // PAGINAZIONE
  // -----------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, page]);

  // -----------------------------------------------------
  // MODALE SOCIO
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

  // -----------------------------------------------------
  // IMPORT SOCI DA XLSX (collegato a /api/admin/members/import-xlsx)
  // -----------------------------------------------------
  const handleImportMembers = async () => {
    if (!importFile) {
      setImportMessage("Seleziona prima un file .xlsx");
      return;
    }

    const yearForImportRaw =
      importYear && importYear.trim().length
        ? importYear
        : yearFilter !== "ALL"
        ? yearFilter
        : new Date().getFullYear().toString();

    const yearForImport = parseInt(yearForImportRaw, 10);
    if (Number.isNaN(yearForImport)) {
      setImportMessage("Inserisci un anno valido per l'import.");
      return;
    }

    setImporting(true);
    setImportMessage("");

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("year", yearForImport.toString());

      const res = await fetch(`${API_BASE}/api/admin/members/import-xlsx`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(
          data.message || "Errore durante l'import del file soci"
        );
      }

      const inserted = data.inserted ?? data.rows ?? null;
      setImportMessage(
        inserted != null
          ? `Import completato (${inserted} righe inserite).`
          : "Import completato."
      );
      setImportFile(null);

      // 🔹 ricarico i members con lo stesso filtro export corrente
      await loadMembers(exportFilter);
    } catch (err) {
      console.error(err);
      setImportMessage(
        err instanceof Error
          ? err.message
          : "Errore imprevisto durante l'import."
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* HEADER: titolo + contatore */}
      <MembersHeaderFilters
        t={t}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
      />

      {/* FILTRI + IMPORT */}
      <div className="mb-1 flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-950/60 p-3 md:flex-row md:items-start md:justify-between">
        {/* Filtri anno + stato + export */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          {/* ANNO */}
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
              {!["2026", "2025", "2024", "2023", "2022"].includes(
                currentYear
              ) && <option value={currentYear}>{currentYear}</option>}
            </select>
          </div>

          {/* STATO */}
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
              <option value="ALL">Tutti</option>
              <option value="ACTIVE">Solo attivi</option>
            </select>
          </div>

          {/* EXPORT */}
          <div className="flex items-center gap-1">
            <span>Export:</span>
            <select
              className="h-8 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-100"
              value={exportFilter}
              onChange={(e) => {
                setExportFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="non_exported">Da esportare</option>
              <option value="exported">Già esportati</option>
              <option value="all">Tutti</option>
            </select>
          </div>
        </div>

        {/* Import soci */}
        <div className="flex flex-col gap-2 text-xs text-slate-300 md:items-end">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="block w-48 cursor-pointer text-[10px] text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-slate-100 hover:file:bg-slate-600"
            />
            <input
              type="text"
              placeholder="Anno per import (es. 2025)"
              value={importYear}
              onChange={(e) => setImportYear(e.target.value)}
              className="h-8 w-36 rounded-md border border-slate-700 bg-slate-900/80 px-2 text-[10px] text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleImportMembers}
              disabled={importing}
              className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${
                importing
                  ? "cursor-not-allowed border-slate-600 bg-slate-800 text-slate-400"
                  : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/25"
              }`}
            >
              {importing ? "Import in corso…" : "Import soci XLSX"}
            </button>
          </div>
          {importMessage && (
            <p className="text-[10px] text-slate-300">{importMessage}</p>
          )}
        </div>
      </div>

      {/* TABELLA UNICA basata SOLO su members */}
      <div className="-mx-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 px-2 py-2 sm:mx-0 sm:px-3">
        <MembersTable
          t={t}
          loading={loading}
          error={error}
          filteredMembers={paginatedMembers}
          onOpenMember={handleOpenMember}
        />

        {/* Paginazione */}
        {filteredMembers.length > PAGE_SIZE && (
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

      {/* MODALE SOCIO */}
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
