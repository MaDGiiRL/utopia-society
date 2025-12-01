import { useTranslation } from "react-i18next";

export default function MembershipNotesSection() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 border-t border-white/5 pt-4">
      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">
        {t("membership.sectionNotes")}
      </p>
      <textarea
        id="note"
        name="note"
        rows={3}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm outline-none focus:border-cyan-400"
        placeholder={t("membership.notesPlaceholder")}
      />
    </div>
  );
}
