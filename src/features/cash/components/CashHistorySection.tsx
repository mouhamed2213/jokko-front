import {
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { showModal } from "../../../components/upgradeModal";
import type { CashRegister, CashTransaction } from "../../../types/index";
import { exportCashReportPDF } from "../../../utils/exportPDF";
import { formatMoney } from "../../../utils/format";
import { getMethodBreakdown, METHOD_CONFIG, MethodIcon } from "../constants";

interface CashHistorySectionProps {
  history: CashRegister[];
  historyTotal: number;
  historyPage: number;
  historyTotalPages: number;
  expandedSession: number | null;
  sessionDetail: Record<number, CashRegister>;
  canExportPdf: boolean;
  isUpgradeModalOpen: boolean;
  user: any;
  onPageChange: (nextPage: number) => void;
  onLoadSessionDetail: (id: number) => void;
  onOpenUpgradeModal: () => void;
  onCloseUpgradeModal: () => void;
}

export function CashHistorySection({
  history,
  historyTotal,
  historyPage,
  historyTotalPages,
  expandedSession,
  sessionDetail,
  canExportPdf,
  isUpgradeModalOpen,
  user,
  onPageChange,
  onLoadSessionDetail,
  onOpenUpgradeModal,
  onCloseUpgradeModal,
}: CashHistorySectionProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">
          Historique journalier
        </h3>
        <span className="text-sm text-gray-400">
          {historyTotal} session(s)
        </span>
      </div>
      {!history.length ? (
        <p className="text-sm text-gray-400">Aucun historique disponible.</p>
      ) : (
        <div className="space-y-3">
          {history.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-gray-200 overflow-hidden"
            >
              <div
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                  if (!canExportPdf) {
                    onOpenUpgradeModal();
                    return;
                  }
                  onLoadSessionDetail(session.id);
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {new Date(session.openedAt).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        session.status === "OPEN"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {session.status === "OPEN" ? "En cours" : "Clôturée"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Ouvert{" "}
                    {new Date(session.openedAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {session.closedAt &&
                      ` • Fermé ${new Date(session.closedAt).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                      )}`}
                    {(session as any).user?.name &&
                      ` • ${(session as any).user.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-400 text-xs">Ouverture</p>
                    <p className="font-medium">
                      {formatMoney(session.openingAmount)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-emerald-600 text-xs">+Entrées</p>
                    <p className="font-medium text-emerald-700">
                      {formatMoney(session.totalIn)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-red-500 text-xs">-Sorties</p>
                    <p className="font-medium text-red-600">
                      {formatMoney(session.totalOut)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-400 text-xs">Clôture</p>
                    <p className="font-bold text-slate-900">
                      {session.closingAmount != null
                        ? formatMoney(session.closingAmount)
                        : formatMoney((session as any).currentBalance ?? 0)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canExportPdf) {
                        onOpenUpgradeModal();
                        return;
                      }
                      if (sessionDetail[session.id]) {
                        exportCashReportPDF(sessionDetail[session.id], user);
                      } else {
                        onLoadSessionDetail(session.id);
                        toast("Cliquez à nouveau pour télécharger", {
                          duration: 3000,
                        });
                      }
                    }}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                      !canExportPdf
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {!canExportPdf ? (
                      <Lock size={12} className="text-amber-600" />
                    ) : (
                      <Download size={12} />
                    )}
                    <span>PDF</span>
                  </button>
                  {expandedSession === session.id ? (
                    <ChevronUp size={18} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSession === session.id && sessionDetail[session.id] && (
                <div className="border-t bg-slate-50 px-5 py-4">
                  {sessionDetail[session.id].transactions?.length ? (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                        Par moyen de paiement
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {getMethodBreakdown(
                          sessionDetail[session.id].transactions!,
                        )
                          .filter((m) => m.totalIn > 0)
                          .map((m) => (
                            <div
                              key={m.method}
                              className={`flex items-center gap-3 rounded-xl p-3 ${m.config.bg}`}
                            >
                              <MethodIcon method={m.method} cls="h-8 w-8" />
                              <div>
                                <p
                                  className={`text-xs font-semibold ${m.config.text}`}
                                >
                                  {m.config.name}
                                </p>
                                <p
                                  className={`text-sm font-bold ${m.config.text}`}
                                >
                                  {formatMoney(m.net)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Transactions (
                    {sessionDetail[session.id].transactions?.length || 0})
                  </p>
                  {!sessionDetail[session.id].transactions?.length ? (
                    <p className="text-sm text-gray-400">Aucune transaction.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sessionDetail[session.id].transactions?.map(
                        (tx: CashTransaction) => {
                          const method = (tx as any).paymentMethod || "CASH";
                          const config =
                            METHOD_CONFIG[method] || METHOD_CONFIG.OTHER;
                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`rounded-full p-1 ${
                                    tx.type === "IN"
                                      ? "bg-emerald-100"
                                      : "bg-red-100"
                                  }`}
                                >
                                  {tx.type === "IN" ? (
                                    <TrendingUp
                                      size={12}
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <TrendingDown
                                      size={12}
                                      className="text-red-600"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-800">
                                    {tx.label}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <MethodIcon method={method} cls="h-3 w-3" />
                                    <p className="text-xs text-gray-400">
                                      {config.name} •{" "}
                                      {new Date(
                                        tx.createdAt,
                                      ).toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-bold ${
                                  tx.type === "IN"
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {tx.type === "IN" ? "+" : "-"}
                                {formatMoney(tx.amount)}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {historyTotalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onPageChange(Math.max(1, historyPage - 1))}
            disabled={historyPage === 1}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">
            Page {historyPage} / {historyTotalPages}
          </span>
          <button
            onClick={() =>
              onPageChange(Math.min(historyTotalPages, historyPage + 1))
            }
            disabled={historyPage === historyTotalPages}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Suivant →
          </button>
        </div>
      )}
      {!canExportPdf &&
        showModal(
          isUpgradeModalOpen,
          onCloseUpgradeModal,
          "cashExportAndhistoique",
        )}
    </div>
  );
}
