// src/pages/admin/MembersPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchMembers, fetchMemberById } from "../../api/admin";

export default function MembersPanel() {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 solo filtri anno + ora
  const [yearFilter, setYearFilter] = useState("ALL");
  const [fromTime, setFromTime] = useState(""); // "HH:MM"
  const [toTime, setToTime] = useState(""); // "HH:MM"

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  // Carica lista soci
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

  // 🔹 Anni disponibili (da created_at)
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
    return Array.from(set).sort((a, b) => b.localeCompare(a)); // anni decrescenti
  }, [members]);

  // 🔹 Soci filtrati per anno + fascia oraria
  const filteredMembers = useMemo(() => {
    let list = members;

    // filtro anno
    if (yearFilter !== "ALL") {
      list = list.filter((m) => {
        if (!m.created_at) return false;
        const d = new Date(m.created_at);
        if (Number.isNaN(d.getTime())) return false;
        return d.getFullYear().toString() === yearFilter;
      });
    }

    // helper per trasformare "HH:MM" in minuti da inizio giornata
    const timeToMinutes = (t) => {
      if (!t) return null;
      const [h, m] = t.split(":").map((x) => parseInt(x, 10));
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };

    const fromMinutes = timeToMinutes(fromTime);
    const toMinutes = timeToMinutes(toTime);

    // filtro fascia oraria (sull'ora locale del created_at)
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
  }, [members, yearFilter, fromTime, toTime]);

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

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
            {t("admin.membersPanel.headerTitle")}
          </h2>
          <p className="text-[11px] text-slate-400">
            {t("admin.membersPanel.headerSubtitle")}
          </p>
        </div>

        {/* 🔹 Solo filtri anno + orario */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* filtro anno */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] text-slate-100 outline-none focus:border-cyan-400"
          >
            <option value="ALL">Tutti gli anni</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* fascia oraria */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-500">Ora da</span>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-100 outline-none focus:border-cyan-400"
            />
            <span className="text-[10px] text-slate-500">a</span>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="rounded-full border border-white/10 bg-slate-900/70 px-2 py-1 text-[10px] text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          {/* contatore */}
          <span className="rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-[10px] text-slate-300">
            {t("admin.membersPanel.shownCounter", {
              filtered: filteredMembers.length,
              total: members.length,
            })}
          </span>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="py-6 text-center text-[11px] text-slate-400">
            {t("admin.membersPanel.loading")}
          </div>
        )}

        {error && !loading && (
          <div className="py-6 text-center text-[11px] text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <div className="py-6 text-center text-[11px] text-slate-400">
            {t("admin.membersPanel.noResults")}
          </div>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/70">
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.date")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.name")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.email")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.city")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.marketing")}
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-400">
                    {t("admin.membersPanel.table.card")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString("it-IT")
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-200">
                      {m.full_name || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {m.email || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {m.city || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {m.accept_marketing
                        ? t("admin.membersPanel.marketingYes")
                        : t("admin.membersPanel.marketingNo")}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => handleOpenMember(m.id)}
                        className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-[10px] text-cyan-100 hover:bg-cyan-500/25"
                      >
                        {t("admin.membersPanel.openCard")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal scheda socio */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-3">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-white/15 bg-slate-950/95 p-4 text-[11px] text-slate-100 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                  {t("admin.membersPanel.modal.title")}
                </h3>
                {selectedMember && (
                  <p className="text-[11px] text-slate-400">
                    {selectedMember.full_name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedMember(null);
                }}
                className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300 hover:border-rose-400 hover:text-rose-300"
              >
                {t("admin.membersPanel.modal.close")}
              </button>
            </div>

            {loadingMember && (
              <div className="py-4 text-center text-slate-400">
                {t("admin.membersPanel.loading")}
              </div>
            )}

            {!loadingMember && selectedMember && (
              <div className="space-y-2">
                <Row
                  label={t("admin.membersPanel.modal.name")}
                  value={selectedMember.full_name}
                />
                <Row
                  label={t("admin.membersPanel.modal.email")}
                  value={selectedMember.email}
                />
                <Row
                  label={t("admin.membersPanel.modal.phone")}
                  value={selectedMember.phone}
                />
                <Row
                  label={t("admin.membersPanel.modal.city")}
                  value={selectedMember.city}
                />
                <Row
                  label={t("admin.membersPanel.modal.birthPlace")}
                  value={selectedMember.birth_place}
                />
                <Row
                  label={t("admin.membersPanel.modal.birthDate")}
                  value={
                    selectedMember.date_of_birth
                      ? new Date(
                          selectedMember.date_of_birth
                        ).toLocaleDateString("it-IT")
                      : "-"
                  }
                />
                <Row
                  label={t("admin.membersPanel.modal.fiscalCode")}
                  value={selectedMember.fiscal_code}
                />
                <Row
                  label={t("admin.membersPanel.modal.privacy")}
                  value={selectedMember.accept_privacy ? "✓" : "✗"}
                />
                <Row
                  label={t("admin.membersPanel.modal.marketing")}
                  value={
                    selectedMember.accept_marketing
                      ? t("admin.membersPanel.marketingYes")
                      : t("admin.membersPanel.marketingNo")
                  }
                />
                <Row
                  label={t("admin.membersPanel.modal.insertedAt")}
                  value={
                    selectedMember.created_at
                      ? new Date(selectedMember.created_at).toLocaleString(
                          "it-IT"
                        )
                      : "-"
                  }
                />
                <Row
                  label={t("admin.membersPanel.modal.notes")}
                  value={selectedMember.note || "—"}
                />
                <Row
                  label={t("admin.membersPanel.modal.source")}
                  value={selectedMember.source || "—"}
                />

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {t("admin.membersPanel.modal.documents")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <DocLink
                      label={t("admin.membersPanel.modal.docFront")}
                      url={selectedMember.document_front_url}
                    />
                    <DocLink
                      label={t("admin.membersPanel.modal.docBack")}
                      url={selectedMember.document_back_url}
                    />
                  </div>
                </div>
              </div>
            )}

            {!loadingMember && !selectedMember && (
              <div className="py-4 text-center text-rose-300">
                {t("admin.membersPanel.error")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <div className="w-32 shrink-0 text-slate-400">{label}</div>
      <div className="flex-1 text-slate-100 break-word">{value || "—"}</div>
    </div>
  );
}

function DocLink({ label, url }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-[10px] text-slate-400">
        {label}: {/* notAvailable key */} {"Non disponibile"}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-3 py-2 text-[10px] text-cyan-100 hover:bg-cyan-500/25"
    >
      {label}
    </a>
  );
}
