// src/components/admin/registry/MemberModal.jsx
function Row({ label, value }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <div className="w-40 shrink-0 text-slate-400">{label}</div>
      <div className="flex-1 break-word text-slate-100">{value || "—"}</div>
    </div>
  );
}

function DocLink({ label, url }) {
  if (!url) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-[10px] text-slate-400">
        {label}: {"Non disponibile"}
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

export default function MemberModal({
  open,
  onClose,
  t,
  loadingMember,
  selectedMember,
}) {
  if (!open) return null;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("it-IT") : "-";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-3">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-white/15 bg-slate-950/95 p-4 sm:p-5 text-[11px] text-slate-100 shadow-2xl">
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
            onClick={onClose}
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
          <div className="space-y-3">
            {/* DATI BASE */}
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
                value={formatDate(selectedMember.date_of_birth)}
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
            </div>

            {/* DATI TESSERA ACSI (se presenti) */}
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dati tessera ACSI
              </p>
              <div className="space-y-2">
                <Row label="Stato tessera" value={selectedMember.status} />
                <Row
                  label="Numero tessera"
                  value={selectedMember.card_number}
                />
                <Row label="Anno tesseramento" value={selectedMember.year} />
                <Row
                  label="Anno di affiliazione"
                  value={selectedMember.affiliation_year}
                />
                <Row label="Id sodalizio" value={selectedMember.club_id} />
                <Row label="Id annualità" value={selectedMember.season_id} />
                <Row label="Sodalizio" value={selectedMember.club_name} />
                <Row
                  label="Tipologia sodalizio"
                  value={selectedMember.club_type}
                />
                <Row
                  label="Codice fiscale sodalizio"
                  value={selectedMember.club_fiscal_code}
                />
                <Row label="Affiliazione" value={selectedMember.affiliation} />
                <Row
                  label="Valida dal"
                  value={formatDate(selectedMember.valid_from)}
                />
                <Row
                  label="Valida al"
                  value={formatDate(selectedMember.valid_to)}
                />
                <Row label="Assicurazione" value={selectedMember.insurance} />
                <Row
                  label="Valid insurance flag"
                  value={selectedMember.valid_insurance_flag}
                />
                <Row label="Sesso" value={selectedMember.gender} />
                <Row
                  label="Persona con disabilità"
                  value={selectedMember.has_disability}
                />
                <Row
                  label="Data iscrizione CONI"
                  value={formatDate(selectedMember.coni_registration_date)}
                />
                <Row
                  label="Data iscrizione REGISTRO"
                  value={formatDate(selectedMember.register_registration_date)}
                />
                <Row
                  label="Anomalia codice fiscale"
                  value={selectedMember.fiscal_code_issue}
                />
                <Row
                  label="Anomalia discipline"
                  value={selectedMember.disciplines_issue}
                />
                <Row label="Privacy 2.4" value={selectedMember.privacy_24} />
                <Row label="Privacy 2.5" value={selectedMember.privacy_25} />
                <Row
                  label="Privacy foto/video"
                  value={selectedMember.privacy_photo}
                />
                <Row
                  label="Discipline/attività ACSI"
                  value={selectedMember.acsi_disciplines}
                />
                <Row
                  label="Discipline CONI"
                  value={selectedMember.coni_disciplines}
                />
                <Row
                  label="Exportata nel registro ACSI"
                  value={
                    selectedMember.exported_to_registry === true
                      ? "Sì"
                      : selectedMember.exported_to_registry === false
                      ? "No"
                      : "—"
                  }
                />
              </div>
            </div>

            {/* DOCUMENTI */}
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t("admin.membersPanel.modal.documents")}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
  );
}

/**
 * Modale per i record dello storico (members_registry)
 * Mostra TUTTI i campi provenienti dall'Excel ACSI.
 */
export function RegistryEntryModal({ open, onClose, entry }) {
  if (!open || !entry) return null;

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("it-IT") : "—";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-3">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/15 bg-slate-950/95 p-4 sm:p-5 text-[11px] text-slate-100 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
              Dettaglio socio storico (ACSI)
            </h3>
            <p className="text-[11px] text-slate-400">
              {entry.first_name} {entry.last_name} · Anno {entry.year ?? "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600/60 bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300 hover:border-rose-400 hover:text-rose-300"
          >
            Chiudi
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Dati anagrafici
            </p>
            <div className="space-y-1">
              <Row label="Id" value={entry.external_id || entry.id} />
              <Row label="Utente" value={entry.user_uid} />
              <Row label="Nome" value={entry.first_name} />
              <Row label="Cognome" value={entry.last_name} />
              <Row label="Sesso" value={entry.gender} />
              <Row label="Codice fiscale" value={entry.fiscal_code} />
              <Row
                label="Persona con disabilità"
                value={entry.has_disability}
              />
              <Row label="E-mail" value={entry.email} />
              <Row label="Cellulare" value={entry.phone} />
              <Row label="Qualifica" value={entry.qualification} />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Tessera e validità
            </p>
            <div className="space-y-1">
              <Row label="Stato" value={entry.status} />
              <Row label="Numero tessera" value={entry.card_number} />
              <Row label="Anno tesseramento (DB)" value={entry.year} />
              <Row
                label="Anno di affiliazione"
                value={entry.affiliation_year}
              />
              <Row label="Valida dal" value={formatDate(entry.valid_from)} />
              <Row label="Valida al" value={formatDate(entry.valid_to)} />
              <Row
                label="Valid Insurance Flag"
                value={entry.valid_insurance_flag}
              />
              <Row label="Assicurazione" value={entry.insurance} />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Sodalizio / affiliazione
            </p>
            <div className="space-y-1">
              <Row label="Id Sodalizio" value={entry.club_id} />
              <Row label="Id Annualità" value={entry.season_id} />
              <Row label="Sodalizio" value={entry.club_name} />
              <Row label="Tipologia sodalizio" value={entry.club_type} />
              <Row
                label="Codice fiscale sodalizio"
                value={entry.club_fiscal_code}
              />
              <Row label="Affiliazione" value={entry.affiliation} />
              <Row
                label="Aggiornato il"
                value={formatDate(entry.updated_at_external)}
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Iscrizioni e anomalie
            </p>
            <div className="space-y-1">
              <Row
                label="Data iscrizione CONI"
                value={formatDate(entry.coni_registration_date)}
              />
              <Row
                label="Data iscrizione REGISTRO"
                value={formatDate(entry.register_registration_date)}
              />
              <Row
                label="Anomalia codice fiscale"
                value={entry.fiscal_code_issue}
              />
              <Row
                label="Anomalia discipline"
                value={entry.disciplines_issue}
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Privacy e discipline
            </p>
            <div className="space-y-1">
              <Row label="Privacy 2.4" value={entry.privacy_24} />
              <Row label="Privacy 2.5" value={entry.privacy_25} />
              <Row label="Privacy foto/video" value={entry.privacy_photo} />
              <Row
                label="Discipline/Attività ACSI praticate"
                value={entry.acsi_disciplines}
              />
              <Row
                label="Discipline CONI praticate"
                value={entry.coni_disciplines}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
