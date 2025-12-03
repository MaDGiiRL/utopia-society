
function Row({ label, value }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <div className="w-32 shrink-0 text-slate-400">{label}</div>
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

  return (
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
                  ? new Date(selectedMember.created_at).toLocaleString("it-IT")
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
  );
}
