export default function ContactsAlerts({ error, exportError }) {
  if (!error && !exportError) return null;

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
          {error}
        </div>
      )}
      {exportError && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
          {exportError}
        </div>
      )}
    </div>
  );
}
