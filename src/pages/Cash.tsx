import { Download, Lock, TrendingDown, TrendingUp, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelect from "../components/Paymentmethodselect";
import { CashHistorySection } from "../features/cash/components/CashHistorySection";
import { ClosureSummaryCard } from "../features/cash/components/ClosureSummaryCard";
import {
  getMethodBreakdown,
  METHOD_CONFIG,
  MethodIcon,
} from "../features/cash/constants";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import {
  addCashTransaction,
  closeCash,
  getCashById,
  getCashHistory,
  getCurrentCash,
  openCash,
} from "../services/index";
import type {
  CashRegister,
  CashTransaction,
  SubscriptionInfo,
} from "../types/index";
import { formatMoney } from "../utils/format";
import { hasFeatures } from "../utils/subscription.checker";

export default function Cash() {
  const { user } = useAuth();
  const [cashState, setCashState] = useState<{
    open: boolean;
    cashRegister: CashRegister | null;
  }>({ open: false, cashRegister: null });
  const [history, setHistory] = useState<CashRegister[]>([]);
  const { subscription } = useSubscription();
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [sessionDetail, setSessionDetail] = useState<
    Record<number, CashRegister>
  >({});
  const [closureSummary, setClosureSummary] = useState<any>(null);

  const [openAmount, setOpenAmount] = useState("");
  const [openNote, setOpenNote] = useState("");
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showTxForm, setShowTxForm] = useState(false);
  const [txType, setTxType] = useState<"IN" | "OUT">("IN");
  const [txAmount, setTxAmount] = useState("");
  const [txLabel, setTxLabel] = useState("");
  const [txMethod, setTxMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const hasFeature = hasFeatures(subscription as SubscriptionInfo);

  const fetchData = async () => {
    try {
      const [current, hist] = await Promise.all([
        getCurrentCash(),
        getCashHistory({ page: historyPage, limit: 10 }),
      ]);
      setCashState(current);
      setHistory(hist.data || []);
      setHistoryTotal(hist.pagination?.total || 0);
      setHistoryTotalPages(hist.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [historyPage]);

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openAmount || Number(openAmount) < 0)
      return toast.error("Montant invalide");
    setSubmitting(true);
    try {
      await openCash({
        openingAmount: Number(openAmount),
        note: openNote || undefined,
      });
      toast.success("Caisse ouverte");
      setShowOpenForm(false);
      setOpenAmount("");
      setOpenNote("");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCash = async () => {
    if (!cashState.cashRegister) return;
    if (!confirm("Fermer la caisse ? Un rapport de clôture sera généré."))
      return;
    try {
      const res = await closeCash(cashState.cashRegister.id);
      toast.success("Caisse fermée");
      if (res.summary) setClosureSummary(res.summary);
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  const handleAddTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txLabel)
      return toast.error("Montant et libellé obligatoires");
    setSubmitting(true);
    try {
      await addCashTransaction({
        type: txType,
        amount: Number(txAmount),
        label: txLabel,
        paymentMethod: txMethod,
      } as any);
      toast.success("Transaction enregistrée");
      setShowTxForm(false);
      setTxAmount("");
      setTxLabel("");
      setTxMethod("CASH");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const loadSessionDetail = async (id: number) => {
    if (sessionDetail[id]) {
      setExpandedSession(expandedSession === id ? null : id);
      return;
    }
    try {
      const data = await getCashById(id);
      setSessionDetail((prev) => ({ ...prev, [id]: data }));
      setExpandedSession(id);
    } catch {
      toast.error("Erreur chargement session");
    }
  };

  if (!user) {
    toast.error("User Not found");
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );
  }

  const cr = cashState.cashRegister;

  return (
    <section className="space-y-6">
      {/* Rapport de clôture */}
      {closureSummary && (
        <ClosureSummaryCard
          summary={closureSummary}
          onClose={() => setClosureSummary(null)}
        />
      )}

      {/* Caisse fermée */}
      {!cashState.open ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-yellow-100 p-5">
              <Wallet size={32} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Caisse fermée
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ouvrez la caisse pour commencer les transactions du jour.
              </p>
            </div>
            <button
              onClick={() => setShowOpenForm(true)}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Ouvrir la caisse
            </button>
          </div>
          {showOpenForm && (
            <div className="mt-6 border-t pt-6 max-w-sm mx-auto">
              <form onSubmit={handleOpenCash} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Montant d'ouverture (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={openAmount}
                    onChange={(e) => setOpenAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="Ex: 50000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Note (optionnel)
                  </label>
                  <input
                    type="text"
                    value={openNote}
                    onChange={(e) => setOpenNote(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="Ex: Fonds de caisse matin"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? "Ouverture..." : "Confirmer l'ouverture"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOpenForm(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Résumé caisse ouverte */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <p className="text-xs text-white/60">Solde actuel</p>
              <p className="mt-2 text-2xl font-bold">
                {formatMoney(cr?.currentBalance ?? 0)}
              </p>
              <p className="mt-1 text-xs text-white/40">
                Ouvert à{" "}
                {new Date(cr?.openedAt ?? "").toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500">Montant d'ouverture</p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatMoney(cr?.openingAmount ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-xs text-emerald-700">Total encaissements</p>
              <p className="mt-2 text-xl font-bold text-emerald-800">
                {formatMoney(cr?.totalIn ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-xs text-red-700">Total décaissements</p>
              <p className="mt-2 text-xl font-bold text-red-800">
                {formatMoney(cr?.totalOut ?? 0)}
              </p>
            </div>
          </div>

          {/* Répartition par moyen de paiement */}
          {cr?.transactions?.length ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-slate-900">
                Encaissements par moyen de paiement
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {getMethodBreakdown(cr.transactions)
                  .filter((m) => m.totalIn > 0)
                  .map((m) => (
                    <div
                      key={m.method}
                      className={`flex items-center gap-4 rounded-2xl p-4 ${m.config.bg}`}
                    >
                      <MethodIcon method={m.method} cls="h-12 w-12" />
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm ${m.config.text}`}>
                          {m.config.name}
                        </p>
                        <p className={`font-bold text-xl ${m.config.text}`}>
                          {formatMoney(m.net)}
                        </p>
                        {m.totalOut > 0 && (
                          <p className="text-xs text-gray-400">
                            +{formatMoney(m.totalIn)} entré • -
                            {formatMoney(m.totalOut)} sorti
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <span className="font-semibold">Total encaissé</span>
                <span className="font-bold text-xl">
                  {formatMoney(cr.totalIn)}
                </span>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setTxType("IN");
                setShowTxForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              <TrendingUp size={16} /> Encaissement manuel
            </button>
            <button
              onClick={() => {
                setTxType("OUT");
                setShowTxForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition"
            >
              <TrendingDown size={16} /> Décaissement manuel
            </button>
            <button
              onClick={handleCloseCash}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <Lock size={15} /> Fermer la caisse
            </button>
            {cr && (
              <button className="hidden items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                <Download size={15} /> Rapport PDF
              </button>
            )}
          </div>

          {/* Formulaire transaction manuelle */}
          {showTxForm && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {txType === "IN"
                    ? "Encaissement manuel"
                    : "Décaissement manuel"}
                </h3>
                <button onClick={() => setShowTxForm(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <form
                onSubmit={handleAddTx}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Montant (FCFA)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="Ex: 5000"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mode de paiement
                  </label>
                  <PaymentMethodSelect
                    value={txMethod}
                    onChange={setTxMethod}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Libellé
                  </label>
                  <input
                    type="text"
                    value={txLabel}
                    onChange={(e) => setTxLabel(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="Ex: Achat fournitures..."
                    required
                  />
                </div>
                <div className="flex gap-3 sm:col-span-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 transition ${
                      txType === "IN"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {submitting ? "Enregistrement..." : "Confirmer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTxForm(false)}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transactions du jour */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-slate-900">
              Transactions du jour
            </h3>
            {!cr?.transactions?.length ? (
              <p className="text-sm text-gray-400">
                Aucune transaction pour le moment.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {cr.transactions.map((tx: CashTransaction) => {
                  const method = (tx as any).paymentMethod || "CASH";
                  const config = METHOD_CONFIG[method] || METHOD_CONFIG.OTHER;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-1.5 ${
                            tx.type === "IN" ? "bg-emerald-100" : "bg-red-100"
                          }`}
                        >
                          {tx.type === "IN" ? (
                            <TrendingUp
                              size={13}
                              className="text-emerald-600"
                            />
                          ) : (
                            <TrendingDown size={13} className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {tx.label}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MethodIcon method={method} cls="h-4 w-4" />
                            <p className="text-xs text-gray-400">
                              {config.name} •{" "}
                              {new Date(tx.createdAt).toLocaleTimeString(
                                "fr-FR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "IN" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "IN" ? "+" : "-"}
                        {formatMoney(tx.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Historique journalier */}
      <CashHistorySection
        history={history}
        historyTotal={historyTotal}
        historyPage={historyPage}
        historyTotalPages={historyTotalPages}
        expandedSession={expandedSession}
        sessionDetail={sessionDetail}
        canExportPdf={hasFeature.exportPdf}
        isUpgradeModalOpen={isUpgradeModalOpen}
        user={user}
        onPageChange={setHistoryPage}
        onLoadSessionDetail={loadSessionDetail}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onCloseUpgradeModal={() => setIsUpgradeModalOpen(false)}
      />
    </section>
  );
}
