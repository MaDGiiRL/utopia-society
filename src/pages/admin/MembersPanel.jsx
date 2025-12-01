// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { X, ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 40;

// generator soci finti (immutato)
function generateFakeMembers(count = 120, offset = 0) {
  const cities = [
    "Verona",
    "Brescia",
    "Mantova",
    "Milano",
    "Padova",
    "Vicenza",
  ];
  const names = [
    "Luca",
    "Marco",
    "Giulia",
    "Sara",
    "Andrea",
    "Marta",
    "Alessio",
    "Chiara",
  ];
  const surnames = [
    "Rossi",
    "Bianchi",
    "Verdi",
    "Neri",
    "Ferrari",
    "Romano",
    "Gallo",
    "Costa",
  ];

  const out = [];

  for (let i = 0; i < count; i++) {
    const idx = offset + i;
    const name = names[idx % names.length];
    const surname = surnames[idx % surnames.length];
    const fullName = `${name} ${surname}`;
    const city = cities[idx % cities.length];

    const now = new Date();
    const created = new Date(now.getTime() - idx * 60 * 60 * 1000 * 6);
    const birth = new Date(1990, idx % 12, (idx % 28) + 1);

    const id =
      (typeof window !== "undefined" && window.crypto?.randomUUID?.()) ||
      `fake-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`;

    const baseCf = `${surname.slice(0, 3)}${name
      .slice(0, 3)
      .toUpperCase()}90A01H`;
    const numPart = String(100 + (idx % 900));
    const fiscalCode = (baseCf + numPart).slice(0, 16).toUpperCase();

    out.push({
      id,
      created_at: created.toISOString(),
      full_name: fullName,
      email: `${name.toLowerCase()}.${surname.toLowerCase()}+${idx}@example.com`,
      phone: `333${String(100000 + idx).slice(-6)}`,
      city,
      date_of_birth: birth.toISOString().slice(0, 10),
      birth_place: "Verona",
      fiscal_code: fiscalCode,
      accept_privacy: true,
      accept_marketing: idx % 3 !== 0,
      note:
        idx % 5 === 0
          ? "Nota di test: questo è un socio fake generato per debug."
          : "",
      source: "debug_fake_member",
      document_front_url: "https://via.placeholder.com/300x180?text=FRONTE",
      document_back_url: "https://via.placeholder.com/300x180?text=RETRO",
    });
  }

  return out;
}

export default function MembersPanel() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);

  const [selectedMember, setSelectedMember] = useState(null);
  const [debugUsed, setDebugUsed] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore caricamento members:", error);
        setError(t("admin.membersPanel.errorLoad"));
        setMembers([]);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    };
    load();
  }, [t]);

  const cities = useMemo(() => {
    const set = new Set();
    for (const m of members) {
      if (m.city) set.add(m.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "it-IT"));
  }, [members]);

  const filteredMembers = useMemo(() => {
    const txt = searchText.trim().toLowerCase();
    return members.filter((m) => {
      if (cityFilter && m.city !== cityFilter) return false;
      if (!txt) return true;

      const haystack = [
        m.full_name,
        m.email,
        m.phone,
        m.city,
        m.fiscal_code,
        m.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(txt);
    });
  }, [members, searchText, cityFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchText, cityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));

  const pagedMembers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, page]);

  const handleOpenMember = (m) => setSelectedMember(m);
  const handleCloseModal = () => setSelectedMember(null);

  const handleAddDebugMembers = () => {
    const currentLen = members.length;
    const fake = generateFakeMembers(200, currentLen);
    setMembers((prev) => [...prev, ...fake]);
    setDebugUsed(true);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-300">
        {t("admin.membersPanel.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + filtro + contatori */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
                {t("admin.membersPanel.title")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("admin.membersPanel.subtitle")}
              </p>
            </div>
          </div>
          {debugUsed && (
            <p className="mt-1 text-[10px] text-amber-300">
              {t("admin.membersPanel.debugNotice")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* filtro testo */}
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t("admin.membersPanel.searchPlaceholder")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-950/80 py-1.5 pl-7 pr-3 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
            />
          </div>

          {/* filtro città */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-400/70 md:w-40"
          >
            <option value="">{t("admin.membersPanel.allCities")}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-center text-[10px] uppercase tracking-[0.18em] text-slate-300">
            {t("admin.membersPanel.countShown", {
              shown: filteredMembers.length,
              total: members.length,
            })}
          </span>

          {/* bottone debug se vuoi riattivarlo
          <button
            type="button"
            onClick={handleAddDebugMembers}
            className="inline-flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200 hover:bg-amber-500/20 transition"
          >
            Debug soci fake
          </button>
          */}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </div>
      )}

      {/* tabella */}
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/5 bg-slate-950/60">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.date")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.name")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.email")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.city")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.marketing")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("admin.membersPanel.table.card")}
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedMembers.map((m) => (
              <tr
                key={m.id}
                className="border-t border-white/5 bg-slate-950/40 hover:bg-slate-900/70"
              >
                <td className="px-3 py-2 text-[11px] text-slate-400">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleString("it-IT")
                    : "-"}
                </td>
                <td className="px-3 py-2">{m.full_name || "-"}</td>
                <td className="px-3 py-2">{m.email || "-"}</td>
                <td className="px-3 py-2">{m.city || "-"}</td>
                <td className="px-3 py-2">
                  {m.accept_marketing ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-[2px] text-[10px] text-emerald-300">
                      {t("admin.membersPanel.marketingYes")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-700/40 px-2 py-[2px] text-[10px] text-slate-300">
                      {t("admin.membersPanel.marketingNo")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleOpenMember(m)}
                    className="rounded-full border border-cyan-400/60 bg-cyan-500/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-500/30"
                  >
                    {t("admin.membersPanel.table.card")}
                  </button>
                </td>
              </tr>
            ))}

            {!pagedMembers.length && !loading && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  {t("admin.membersPanel.noMembersFiltered")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINAZIONE */}
      {filteredMembers.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
          <div>
            {t("ui.pagination.pageOf", {
              current: page,
              total: totalPages,
              pageSize: PAGE_SIZE,
            })}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                page === 1
                  ? "cursor-not-allowed border-slate-700 text-slate-600"
                  : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              {t("ui.pagination.prev")}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                page === totalPages
                  ? "cursor-not-allowed border-slate-700 text-slate-600"
                  : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
              }`}
            >
              {t("ui.pagination.next")}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* MODALE DETTAGLIO SOCIO */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {t("admin.membersPanel.modal.title")}
                </h3>
                <p className="text-[11px] text-slate-400">
                  ID:{" "}
                  <span className="font-mono text-[10px]">
                    {selectedMember.id}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs text-slate-100">
              {/* dati principali */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.fullName")}
                  </p>
                  <p>{selectedMember.full_name || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.email")}
                  </p>
                  <p>{selectedMember.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.phone")}
                  </p>
                  <p>{selectedMember.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.city")}
                  </p>
                  <p>{selectedMember.city || "-"}</p>
                </div>
              </div>

              {/* dati anagrafici */}
              <div className="grid gap-3 border-t border-white/10 pt-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.birthPlace")}
                  </p>
                  <p>{selectedMember.birth_place || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.birthDate")}
                  </p>
                  <p>
                    {selectedMember.date_of_birth
                      ? new Date(
                          selectedMember.date_of_birth
                        ).toLocaleDateString("it-IT")
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.fiscalCode")}
                  </p>
                  <p className="font-mono text-[11px] uppercase">
                    {selectedMember.fiscal_code || "-"}
                  </p>
                </div>
              </div>

              {/* consensi / meta */}
              <div className="grid gap-3 border-t border-white/10 pt-3 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.privacy")}
                  </p>
                  <p>
                    {selectedMember.accept_privacy
                      ? t("admin.membersPanel.modal.privacyAccepted")
                      : t("admin.membersPanel.modal.privacyNo")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.marketing")}
                  </p>
                  <p>
                    {selectedMember.accept_marketing
                      ? t("admin.membersPanel.marketingYes")
                      : t("admin.membersPanel.marketingNo")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.insertedAt")}
                  </p>
                  <p>
                    {selectedMember.created_at
                      ? new Date(selectedMember.created_at).toLocaleString(
                          "it-IT"
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              {/* note */}
              <div className="space-y-1 border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {t("admin.membersPanel.modal.notes")}
                </p>
                <p className="whitespace-pre-wrap text-slate-200/90">
                  {selectedMember.note || "—"}
                </p>
              </div>

              {/* documenti */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {t("admin.membersPanel.modal.documents")}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-300">
                      {t("admin.membersPanel.modal.docFront")}
                    </p>
                    {selectedMember.document_front_url ? (
                      <a
                        href={selectedMember.document_front_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-[11px] text-cyan-300 underline"
                      >
                        {t("admin.membersPanel.modal.docFront")}
                      </a>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        {t("admin.membersPanel.modal.notAvailable")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-300">
                      {t("admin.membersPanel.modal.docBack")}
                    </p>
                    {selectedMember.document_back_url ? (
                      <a
                        href={selectedMember.document_back_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-[11px] text-cyan-300 underline"
                      >
                        {t("admin.membersPanel.modal.docBack")}
                      </a>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        {t("admin.membersPanel.modal.notAvailable")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* source */}
              <div className="space-y-1 border-t border-white/10 pt-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {t("admin.membersPanel.modal.source")}
                </p>
                <p className="text-[11px] text-slate-300">
                  {selectedMember.source || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-slate-500/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200 hover:bg-slate-800"
              >
                {t("admin.membersPanel.modal.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
