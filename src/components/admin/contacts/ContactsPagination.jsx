// src/components/admin/contacts/ContactsPagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactsPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const { t } = useTranslation();

  if (totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-2 text-[11px] text-slate-300 sm:flex-row">
      <div>
        {t("ui.pagination.pageOf", {
          current: page,
          total: totalPages,
          pageSize,
        })}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
            page === 1
              ? "border-slate-700 text-slate-600 cursor-not-allowed"
              : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
          }`}
        >
          <ChevronLeft className="h-3 w-3" />
          {t("ui.pagination.prev")}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
            page === totalPages
              ? "border-slate-700 text-slate-600 cursor-not-allowed"
              : "border-slate-500/60 text-slate-100 hover:bg-slate-800"
          }`}
        >
          {t("ui.pagination.next")}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
