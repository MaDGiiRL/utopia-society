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
  const [yearFilter, setYearFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // FILTRO EXPORT (non esportati / esportati / tutti)
  const [exportFilter, setExportFilter] = useState("non_exported");

  // 🔎 RICERCA TESTUALE
  const [searchText, setSearchText] = useState("");

  // ✅ SELEZIONE SOCI DA ESPORTARE (solo tab "non_exported")
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // ---- PAGINAZIONE ----
  const [page, setPage] = useState(1);

  // ---- IMPORT SOCI (XLSX) ----
  const [importOpen, setImportOpen] = useState(false); // ✅ COLLAPSE
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importYear, setImportYear] = useState("");

  // ---- MODALE SOCIO ----
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // -----------------------------------------------------
  // FUNZIONE UNICA DI CARICAMENTO SOCI (dal backend)
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
        setPage(1);
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
  // CARICAMENTO SOCI
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

  // quando cambi filtro export, svuota selezione + pagina
  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
  }, [exportFilter]);

  // -----------------------------------------------------
  // ANNI DISPONIBILI (dinamici dal DB)
  // -----------------------------------------------------
  const availableYears = useMemo(() => {
    const years = new Set();

    for (const m of members) {
      const y =
        m.year ??
        (m.valid_from
          ? new Date(m.valid_from).getFullYear()
          : m.created_at
          ? new Date(m.created_at).getFullYear()
          : null);

      if (y) years.add(y);
    }

    return Array.from(years).sort((a, b) => b - a);
  }, [members]);

  // -----------------------------------------------------
  // FILTRI SU members (ANNO + STATO + SEARCH)
  // -----------------------------------------------------
  const filteredMembers = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return members
      .filter((m) => {
        if (q) {
          const hay = [
            m.full_name,
            m.first_name,
            m.last_name,
            m.email,
            m.phone,
            m.fiscal_code,
            m.city,
            m.status,
            m.card_number,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!hay.includes(q)) return false;
        }

        if (yearFilter !== "ALL") {
          const fromYear =
            m.year ??
            (m.valid_from
              ? new Date(m.valid_from).getFullYear()
              : m.created_at
              ? new Date(m.created_at).getFullYear()
              : null);

          if (!fromYear || String(fromYear) !== String(yearFilter)) {
            return false;
          }
        }

        const statusText = (m.status || "").toString().toLowerCase();
        const isActive = statusText.startsWith("attiv");

        if (statusFilter === "ACTIVE" && !isActive) return false;
        if (statusFilter === "TERMINATED" && isActive) return false;

        return true;
      })
      .sort((a, b) => {
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
  }, [members, yearFilter, statusFilter, searchText]);

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
  // IMPORT SOCI DA XLSX
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

  // -----------------------------------------------------
  // SELEZIONE SOCI (checkbox)
  // -----------------------------------------------------
  const isSelectingEnabled = exportFilter === "non_exported";

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = (idsOnPage, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of idsOnPage) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  // -----------------------------------------------------
  // EXPORT XLSX SELEZIONATI
  // -----------------------------------------------------
  const handleExportSelectedXlsx = async () => {
    try {
      if (!selectedIds.size) return;

      const ids = Array.from(selectedIds);
      const qs = new URLSearchParams({ ids: ids.join(",") });

      const res = await fetch(
        `${API_BASE}/api/admin/members.xlsx?${qs.toString()}`,
        { credentials: "include" }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Errore download XLSX selezionati");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);

      a.href = url;
      a.download = `utopia_acsi_selezionati_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setSelectedIds(new Set());
      await loadMembers(exportFilter);
    } catch (err) {
      console.error(err);
      setImportMessage(err?.message || "Errore export selezionati");
    }
  };

  // -----------------------------------------------------
  // PILL STATO EXPORT + micro-hints
  // -----------------------------------------------------
  const exportMeta = useMemo(() => {
    if (exportFilter === "non_exported") {
      return {
        label: "Da esportare",
        hint: "Soci non ancora esportati verso ACSI.",
        micro: "Qui puoi selezionare e esportare.",
        cls: "border-amber-400/40 bg-amber-500/10 text-amber-100",
        dot: "bg-amber-300",
      };
    }
    if (exportFilter === "exported") {
      return {
        label: "Già esportati",
        hint: "Soci già esportati (solo consultazione).",
        micro: "La selezione non è disponibile qui.",
        cls: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
        dot: "bg-emerald-300",
      };
    }
    return {
      label: "Tutti",
      hint: "Include sia esportati che da esportare.",
      micro: "Utile per controlli e ricerche.",
      cls: "border-slate-500/50 bg-slate-500/10 text-slate-200",
      dot: "bg-slate-300",
    };
  }, [exportFilter]);

  const canShowHints = true;

  return (
    <div className="flex flex-col gap-3">
      <MembersHeaderFilters
        t={t}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
      />

      {/* FILTRI + IMPORT */}
      <div className="mb-1 rounded-2xl border border-white/5 bg-slate-950/60 p-3 sm:p-4">
        <div className="flex flex-col gap-4">
          {/* FILTRI ANAGRAFICA */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Filtri anagrafica
              </h3>
              {canShowHints && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Suggerimento: usa <span className="text-slate-300">Anno</span>{" "}
                  per periodi specifici e{" "}
                  <span className="text-slate-300">Stato</span> per separare
                  attivi/non attivi.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Anno
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Tutti</option>
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
                {canShowHints && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Consiglio: lascia “Tutti” per non perdere risultati.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Stato
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="ALL">Tutti</option>
                  <option value="ACTIVE">Solo attivi</option>
                  <option value="TERMINATED">Terminati / non attivi</option>
                </select>
                {canShowHints && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    “Solo attivi” è utile prima di invii/comunicazioni.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FILTRI REGISTRO */}
          <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/20 p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Filtri registro
              </h3>
              {canShowHints && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Suggerimento: <span className="text-slate-200">Export</span>{" "}
                  controlla lo stato di esportazione,{" "}
                  <span className="text-slate-200">Cerca</span> filtra per
                  testo.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Export
                  </label>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${exportMeta.cls}`}
                    title={exportMeta.hint}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${exportMeta.dot}`}
                    />
                    {exportMeta.label}
                  </span>
                </div>

                <select
                  className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
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

                {canShowHints && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {exportMeta.micro}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-slate-500">
                  Nota: i soci esportati finiranno sotto{" "}
                  <span className="font-semibold text-slate-300">
                    anno 2025
                  </span>
                  .
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Cerca
                  </label>
                  <span className="text-[10px] text-slate-500">
                    es. “Rossi”, “@gmail”, “CF”
                  </span>
                </div>

                <input
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Nome, email, CF, città..."
                  className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />

                <div className="mt-2 flex items-center justify-between gap-2">
                  {canShowHints && (
                    <p className="text-[11px] text-slate-500">
                      Tip: puoi combinare ricerca + filtri sopra.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setPage(1);
                    }}
                    className="h-8 shrink-0 rounded-full border border-slate-700 bg-slate-900/70 px-3 text-[10px] uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                  >
                    Svuota
                  </button>
                </div>
              </div>
            </div>

            {/* AZIONI EXPORT SELEZIONATI */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-slate-400">
                {exportFilter === "non_exported" ? (
                  <span>
                    Seleziona i soci e premi{" "}
                    <span className="text-slate-200">Esporta selezionati</span>.
                  </span>
                ) : (
                  <span>
                    La selezione è disponibile solo su “Da esportare”.
                  </span>
                )}
              </div>

              {exportFilter === "non_exported" && (
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={handleExportSelectedXlsx}
                  className={`h-9 rounded-full border px-3 text-[10px] uppercase tracking-[0.16em] transition ${
                    selectedIds.size === 0
                      ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                      : "border-cyan-400/70 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                  }`}
                >
                  Esporta selezionati ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* ✅ IMPORT: toggle + box rifatto */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/20 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                    Import
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                    Avanzato
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Carica un file XLSX solo quando devi aggiungere/aggiornare
                  soci dal gestionale.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setImportOpen((v) => {
                    const next = !v;
                    if (!next) {
                      setImportFile(null);
                      setImportYear("");
                      setImportMessage("");
                      setImporting(false);
                    } else {
                      setImportMessage("");
                    }
                    return next;
                  });
                }}
                className={`h-9 rounded-full border px-3 text-[10px] uppercase tracking-[0.16em] transition ${
                  importOpen
                    ? "border-slate-600 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                }`}
              >
                {importOpen ? "Nascondi import" : "Apri import"}
              </button>
            </div>

            {importOpen && (
              <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/40 p-3 sm:p-4">
                {/* micro hint non invasivo */}
                {canShowHints && (
                  <div className="mb-3 rounded-xl border border-white/5 bg-slate-900/40 px-3 py-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-200">Nota:</span> il
                    campo <span className="text-slate-200">Anno import</span> è{" "}
                    <span className="text-slate-200">obbligatorio</span>. Se
                    lasciato vuoto, l’import non assegnerà alcun anno e la
                    procedura risulterà{" "}
                    <span className="text-slate-200">non valida</span>. In caso
                    di dubbi, contatta la developer prima di procedere.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                  {/* FILE */}
                  <div className="lg:col-span-5">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      File XLSX
                    </label>

                    <input
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(e) =>
                        setImportFile(e.target.files?.[0] || null)
                      }
                      className="block w-full cursor-pointer rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 text-[11px] text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-slate-100 hover:file:bg-slate-600"
                    />

                    {/* nome file selezionato */}
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-500">File selezionato:</span>
                      <span className="truncate text-slate-300">
                        {importFile?.name ? importFile.name : "Nessuno"}
                      </span>
                    </div>
                  </div>

                  {/* ANNO */}
                  <div className="lg:col-span-3">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Anno import
                    </label>
                    <input
                      type="text"
                      placeholder="Es. 2025"
                      value={importYear}
                      onChange={(e) => setImportYear(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      L'anno corrispondente ai soci importati.
                    </p>
                  </div>

                  {/* AZIONI */}
                  <div className="lg:col-span-4">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleImportMembers}
                        disabled={importing}
                        className={`h-10 w-full rounded-xl border px-4 text-[10px] uppercase tracking-[0.16em] transition ${
                          importing
                            ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                            : "border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                        }`}
                      >
                        {importing ? "Import in corso…" : "Importa soci"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImportOpen(false);
                          setImportFile(null);
                          setImportYear("");
                          setImportMessage("");
                          setImporting(false);
                        }}
                        className="h-9 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 text-[10px] uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                      >
                        Chiudi
                      </button>
                    </div>
                  </div>

                  {/* MESSAGGIO */}
                  {importMessage && (
                    <div className="sm:col-span-2 lg:col-span-12">
                      <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3 text-[11px] text-slate-300">
                        {importMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABELLA */}
      <div className="-mx-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 px-2 py-2 sm:mx-0 sm:px-3">
        <MembersTable
          t={t}
          loading={loading}
          error={error}
          filteredMembers={paginatedMembers}
          onOpenMember={handleOpenMember}
          showSelection={isSelectingEnabled}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAllOnPage}
        />

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
