import { formatMoney } from "../../../utils/format";
import { METHOD_CONFIG, MethodIcon } from "../constants";

interface ClosureSummaryCardProps {
  summary: any;
  onClose: () => void;
}

export function ClosureSummaryCard({
  summary,
  onClose,
}: ClosureSummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">📊 Rapport de clôture</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="p-6 space-y-5">
        <p className="text-sm text-gray-500">
          {summary.date} • Ouvert à{" "}
          {new Date(summary.openedAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          — Fermé à{" "}
          {new Date(summary.closedAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Ouverture",
              value: formatMoney(summary.openingAmount),
              bg: "bg-slate-100",
              text: "text-slate-700",
            },
            {
              label: "Entrées",
              value: formatMoney(summary.totalIn),
              bg: "bg-emerald-100",
              text: "text-emerald-700",
            },
            {
              label: "Sorties",
              value: formatMoney(summary.totalOut),
              bg: "bg-red-100",
              text: "text-red-700",
            },
            {
              label: "Clôture",
              value: formatMoney(summary.closingAmount),
              bg: "bg-slate-900",
              text: "text-white",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl p-4 text-center ${s.bg}`}>
              <p className={`text-xs font-medium opacity-70 mb-1 ${s.text}`}>
                {s.label}
              </p>
              <p className={`font-bold text-base ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
        {summary.paymentMethodSummary?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Répartition par moyen de paiement
            </p>
            <div className="space-y-2">
              {summary.paymentMethodSummary.map((m: any) => {
                const config = METHOD_CONFIG[m.method] || METHOD_CONFIG.OTHER;
                return (
                  <div
                    key={m.method}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 ${config.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <MethodIcon method={m.method} cls="h-10 w-10" />
                      <div>
                        <p className={`font-semibold text-sm ${config.text}`}>
                          {config.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          +{formatMoney(m.totalIn)} entré
                          {m.totalOut > 0
                            ? ` • -${formatMoney(m.totalOut)} sorti`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-base ${config.text}`}>
                      {formatMoney(m.net)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white">
              <span className="font-semibold">Total encaissé net</span>
              <span className="font-bold text-lg">
                {formatMoney(summary.totalIn - summary.totalOut)}
              </span>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">
          {summary.transactionCount} transaction(s) • {summary.openedBy}
        </p>
      </div>
    </div>
  );
}
