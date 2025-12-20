// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById, deleteMembers } from "../../api/admin";
import Swal from "sweetalert2";

import MembersHeaderFilters from "../../components/admin/registry/MembersHeaderFilters";
import MembersTable from "../../components/admin/registry/MembersTable";
import MemberModal from "../../components/admin/registry/MemberModal";

const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "";
const PAGE_SIZE = 50;

// ✅ helper: Date -> "YYYY-MM-DD" in locale (no UTC edge-cases)
function toLocalISODate(d) {
  if (!d) return null;
  const dateObj = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dateObj.getTime())) return null;
  return dateObj.toLocaleDateString("sv-SE"); // YYYY-MM-DD
}

// ✅ helper: build a local Date from date ("YYYY-MM-DD") and time ("HH:mm")
function combineLocalDateAndTime(dateStr, timeStr) {
  if (!dateStr && !timeStr) return null;

  const now = new Date();
  const baseDate = dateStr || toLocalISODate(now); // "YYYY-MM-DD"
  const baseTime = timeStr || "00:00";

  const d = new Date(`${baseDate}T${baseTime}`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export default function MembersPanel({ reloadToken = 0 }) {
  const { t } = useTranslation();

  // ---- SOCI (tabella members) ----
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- FILTRI GLOBALI ----
  const [yearFilter, setYearFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exactDateFilter, setExactDateFilter] = useState("");

  const [createdAtFromDateFilter, setCreatedAtFromDateFilter] = useState(""); // "YYYY-MM-DD"
  const [createdAtFromTimeFilter, setCreatedAtFromTimeFilter] = useState(""); // "HH:mm"

  // FILTRO EXPORT (non esportati / esportati / tutti)
  const [exportFilter, setExportFilter] = useState("non_exported");

  // 🔎 RICERCA TESTUALE
  const [searchText, setSearchText] = useState("");

  // ✅ SELEZIONE SOCI (usata sia per export che per delete)
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // ---- PAGINAZIONE ----
  const [page, setPage] = useState(1);

  // ---- MODALE SOCIO ----
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  const [uiMessage, setUiMessage] = useState(""); // per errori export selezionati ecc.

  const loadMembers = useCallback(
    async (filter) => {
      setLoading(true);
      setError("");
      setUiMessage("");

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

  // ✅ carica anche quando cambia reloadToken
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await loadMembers(exportFilter);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadMembers, exportFilter, reloadToken]);

  useEffect(() => {
    setSelectedIds(new Set());
    setPage(1);
  }, [exportFilter]);

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

  const filteredMembers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const createdAtFromDate = combineLocalDateAndTime(
      createdAtFromDateFilter,
      createdAtFromTimeFilter
    );

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

          if (!fromYear || String(fromYear) !== String(yearFilter))
            return false;
        }

        const statusText = (m.status || "").toString().toLowerCase();
        const isActive = statusText.startsWith("attiv");
        if (statusFilter === "ACTIVE" && !isActive) return false;
        if (statusFilter === "TERMINATED" && isActive) return false;

        if (exactDateFilter) {
          const ref = m.valid_from || m.created_at || null;
          const refDay = toLocalISODate(ref);
          if (!refDay || refDay !== exactDateFilter) return false;
        }

        if (createdAtFromDate) {
          const createdAt = m.created_at ? new Date(m.created_at) : null;
          if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
          if (createdAt.getTime() < createdAtFromDate.getTime()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const at = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bt - at;
      });
  }, [
    members,
    yearFilter,
    statusFilter,
    searchText,
    exactDateFilter,
    createdAtFromDateFilter,
    createdAtFromTimeFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, page]);

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

  // ✅ selezione export: la abiliti SOLO su "non_exported" (come prima)
  const isSelectingEnabledForExport = exportFilter === "non_exported";

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

  const handleExportSelectedXlsx = async () => {
    try {
      if (!selectedIds.size) return;

      // Export consentito SOLO su non_exported
      if (exportFilter !== "non_exported") return;

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
      setUiMessage(err?.message || "Errore export selezionati");
    }
  };

  const handleDeleteSelected = async () => {
    try {
      if (!selectedIds.size) return;

      const count = selectedIds.size;

      const { isConfirmed } = await Swal.fire({
        title: "Eliminare i soci selezionati?",
        html: `
        <div style="text-align:left">
          <p>Stai per eliminare <b>${count}</b> record.</p>
          <p style="margin-top:8px;opacity:.85">
            Questa operazione cancella anche i <b>log</b> collegati.
          </p>
          <p style="margin-top:12px">
            Per confermare digita <b>ELIMINA</b>:
          </p>
        </div>
      `,
        input: "text",
        inputPlaceholder: "ELIMINA",
        inputAttributes: { autocapitalize: "characters" },
        showCancelButton: true,
        confirmButtonText: "Elimina",
        cancelButtonText: "Annulla",
        confirmButtonColor: "#ef4444",
        preConfirm: (txt) => {
          const v = String(txt || "")
            .trim()
            .toUpperCase();
          if (v !== "ELIMINA") {
            Swal.showValidationMessage("Devi digitare ELIMINA per continuare.");
            return false;
          }
          return true;
        },
      });

      if (!isConfirmed) return;

      // UI loading
      Swal.fire({
        title: "Eliminazione in corso…",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const ids = Array.from(selectedIds);

      const data = await deleteMembers(ids);

      if (!data?.ok) {
        throw new Error(data?.message || "Errore eliminazione soci");
      }

      // refresh e reset
      setSelectedIds(new Set());
      await loadMembers(exportFilter);

      Swal.fire({
        icon: "success",
        title: "Eliminati",
        text: `Eliminati ${count} soci.`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Errore",
        text: err?.message || "Errore eliminazione soci",
      });
    }
  };

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

  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col gap-3">
      <MembersHeaderFilters
        t={t}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
      />

      {!!uiMessage && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {uiMessage}
        </div>
      )}

      {/* FILTRI */}
      <div className="mb-1 rounded-2xl border border-white/5 bg-slate-950/60 p-3 sm:p-4">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Filtri anagrafica
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Data esatta (giorno)
                </label>
                <input
                  type="date"
                  value={exactDateFilter}
                  onChange={(e) => {
                    setExactDateFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Creato da (data e/o ora)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={createdAtFromDateFilter}
                    onChange={(e) => {
                      setCreatedAtFromDateFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  />

                  <input
                    type="time"
                    value={createdAtFromTimeFilter}
                    onChange={(e) => {
                      setCreatedAtFromTimeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-xs text-slate-100 outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  Tip: puoi usare solo la data (dalle 00:00) o solo l’ora (da
                  oggi a quell’ora).
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-slate-900/20 p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                Filtri registro
              </h3>
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
                  <p className="text-[11px] text-slate-500">
                    Tip: puoi combinare ricerca + filtri.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setExactDateFilter("");
                      setCreatedAtFromDateFilter("");
                      setCreatedAtFromTimeFilter("");
                      setPage(1);
                    }}
                    className="h-8 shrink-0 rounded-full border border-slate-700 bg-slate-900/70 px-3 text-[10px] uppercase tracking-[0.16em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
                  >
                    Svuota
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] text-slate-400">
                {exportFilter === "non_exported" ? (
                  <span>
                    Seleziona i soci e premi{" "}
                    <span className="text-slate-200">Esporta selezionati</span>.
                  </span>
                ) : (
                  <span>
                    L’export selezionati è disponibile solo su “Da esportare”.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* ✅ ELIMINA SELEZIONATI (sempre disponibile se c'è selezione) */}
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={handleDeleteSelected}
                  className={`h-9 rounded-full border px-3 text-[10px] uppercase tracking-[0.16em] transition ${
                    selectedCount === 0
                      ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                      : "border-rose-400/70 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                  }`}
                >
                  Elimina selezionati ({selectedCount})
                </button>

                {/* ✅ EXPORT SELEZIONATI (solo non_exported) */}
                {exportFilter === "non_exported" && (
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={handleExportSelectedXlsx}
                    className={`h-9 rounded-full border px-3 text-[10px] uppercase tracking-[0.16em] transition ${
                      selectedCount === 0
                        ? "cursor-not-allowed border-slate-700 bg-slate-900/50 text-slate-500"
                        : "border-cyan-400/70 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20"
                    }`}
                  >
                    Esporta selezionati ({selectedCount})
                  </button>
                )}
              </div>
            </div>
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
          // ✅ la selezione ora serve anche per delete, quindi la lasciamo SEMPRE attiva
          showSelection={true}
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
