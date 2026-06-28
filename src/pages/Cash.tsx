import {
  ChevronDown,
  ChevronUp,
  Download,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import orangeMoneyLogo from "../assets/om.png";
import waveLogo from "../assets/wave.png";
import PaymentMethodSelect from "../components/Paymentmethodselect";
import {
  addCashTransaction,
  closeCash,
  getCashById,
  getCashHistory,
  getCurrentCash,
  getSubscription,
  openCash,
} from "../services/index";
import { getStoredUser } from "../types/auth";
import type {
  CashRegister,
  CashTransaction,
  SubscriptionInfo,
} from "../types/index";
import { exportCashReportPDF } from "../utils/exportPDF";
import { hasFeatures } from "../utils/subscription.checker";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

const METHOD_CONFIG: Record<
  string,
  { name: string; logo?: string; emoji?: string; bg: string; text: string }
> = {
  CASH: {
    name: "Espèces",
    emoji: "💵",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  WAVE: {
    name: "Wave",
    logo: waveLogo,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  ORANGE_MONEY: {
    name: "Orange Money",
    logo: orangeMoneyLogo,
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  FREE_MONEY: {
    name: "Free Money",
    emoji: "🟣",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  BANK: {
    name: "Virement",
    emoji: "🏦",
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
  OTHER: {
    name: "Autre",
    emoji: "📱",
    bg: "bg-gray-50",
    text: "text-gray-700",
  },
};

const MethodIcon = ({
  method,
  cls = "h-10 w-10",
}: {
  method: string;
  cls?: string;
}) => {
  const config = METHOD_CONFIG[method] || METHOD_CONFIG.OTHER;
  if (config.logo) {
    return (
      <img
        src={config.logo}
        alt={config.name}
        className={`${cls} rounded-xl object-contain bg-white p-1 shadow-sm shrink-0 border border-gray-100`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-xl ${config.bg} border border-gray-200 flex items-center justify-center shrink-0 text-xl`}
    >
      {config.emoji}
    </div>
  );
};

export default function Cash() {
  const user = getStoredUser();
  const [cashState, setCashState] = useState<{
    open: boolean;
    cashRegister: CashRegister | null;
  }>({ open: false, cashRegister: null });
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo>();
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
      const [subscription, current, hist] = await Promise.all([
        getSubscription(),
        getCurrentCash(),
        getCashHistory({ page: historyPage, limit: 10 }),
      ]);
      setSubscription(subscription);
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
      toast.success("Caisse fermée ✅");
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

  const getMethodBreakdown = (transactions: CashTransaction[]) => {
    const byMethod: Record<string, { in: number; out: number }> = {};
    transactions.forEach((tx: any) => {
      const m = tx.paymentMethod || "CASH";
      if (!byMethod[m]) byMethod[m] = { in: 0, out: 0 };
      if (tx.type === "IN") byMethod[m].in += tx.amount;
      else byMethod[m].out += tx.amount;
    });
    return Object.entries(byMethod).map(([method, amounts]) => ({
      method,
      config: METHOD_CONFIG[method] || METHOD_CONFIG.OTHER,
      totalIn: amounts.in,
      totalOut: amounts.out,
      net: amounts.in - amounts.out,
    }));
  };

  if (!user) {
    toast.error("User Not found");
    return;
  }

  if (loading)
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );

  const cr = cashState.cashRegister;

  return (
    <section className="space-y-6">
      {/* Rapport de clôture */}
      {closureSummary && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              📊 Rapport de clôture
            </h3>
            <button
              onClick={() => setClosureSummary(null)}
              className="text-white/70 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-gray-500">
              {closureSummary.date} • Ouvert à{" "}
              {new Date(closureSummary.openedAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              — Fermé à{" "}
              {new Date(closureSummary.closedAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  label: "Ouverture",
                  value: fmt(closureSummary.openingAmount),
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                },
                {
                  label: "Entrées",
                  value: fmt(closureSummary.totalIn),
                  bg: "bg-emerald-100",
                  text: "text-emerald-700",
                },
                {
                  label: "Sorties",
                  value: fmt(closureSummary.totalOut),
                  bg: "bg-red-100",
                  text: "text-red-700",
                },
                {
                  label: "Clôture",
                  value: fmt(closureSummary.closingAmount),
                  bg: "bg-slate-900",
                  text: "text-white",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-2xl p-4 text-center ${s.bg}`}
                >
                  <p
                    className={`text-xs font-medium opacity-70 mb-1 ${s.text}`}
                  >
                    {s.label}
                  </p>
                  <p className={`font-bold text-base ${s.text}`}>{s.value}</p>
                </div>
              ))}
            </div>
            {closureSummary.paymentMethodSummary?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Répartition par moyen de paiement
                </p>
                <div className="space-y-2">
                  {closureSummary.paymentMethodSummary.map((m: any) => {
                    const config =
                      METHOD_CONFIG[m.method] || METHOD_CONFIG.OTHER;
                    return (
                      <div
                        key={m.method}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 ${config.bg}`}
                      >
                        <div className="flex items-center gap-3">
                          <MethodIcon method={m.method} cls="h-10 w-10" />
                          <div>
                            <p
                              className={`font-semibold text-sm ${config.text}`}
                            >
                              {config.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              +{fmt(m.totalIn)} entré
                              {m.totalOut > 0
                                ? ` • -${fmt(m.totalOut)} sorti`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <p className={`font-bold text-base ${config.text}`}>
                          {fmt(m.net)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white">
                  <span className="font-semibold">Total encaissé net</span>
                  <span className="font-bold text-lg">
                    {fmt(closureSummary.totalIn - closureSummary.totalOut)}
                  </span>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">
              {closureSummary.transactionCount} transaction(s) •{" "}
              {closureSummary.openedBy}
            </p>
          </div>
        </div>
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
                {fmt(cr?.currentBalance ?? 0)}
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
                {fmt(cr?.openingAmount ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-xs text-emerald-700">Total encaissements</p>
              <p className="mt-2 text-xl font-bold text-emerald-800">
                {fmt(cr?.totalIn ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-xs text-red-700">Total décaissements</p>
              <p className="mt-2 text-xl font-bold text-red-800">
                {fmt(cr?.totalOut ?? 0)}
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
                          {fmt(m.net)}
                        </p>
                        {m.totalOut > 0 && (
                          <p className="text-xs text-gray-400 ">
                            +{fmt(m.totalIn)} entré • -{fmt(m.totalOut)} sorti
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <span className="font-semibold">Total encaissé</span>
                <span className="font-bold text-xl">{fmt(cr.totalIn)}</span>
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
              🔒 Fermer la caisse
            </button>
            {cr && (
              <button
                // onClick={() => exportCashReportPDF(cr, user)}
                className=" hidden items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
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
                    className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 transition ${txType === "IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}
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
                          className={`rounded-full p-1.5 ${tx.type === "IN" ? "bg-emerald-100" : "bg-red-100"}`}
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
                        className={`text-sm font-bold ${tx.type === "IN" ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {tx.type === "IN" ? "+" : "-"}
                        {fmt(tx.amount)}
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
                    if (!hasFeature.exportPdf) {
                      setIsUpgradeModalOpen(true);
                      return;
                    }

                    loadSessionDetail(session.id);
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {new Date(session.openedAt).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${session.status === "OPEN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
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
                        ` • Fermé ${new Date(session.closedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                      {(session as any).user?.name &&
                        ` • ${(session as any).user.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-400 text-xs">Ouverture</p>
                      <p className="font-medium">
                        {fmt(session.openingAmount)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-emerald-600 text-xs">+Entrées</p>
                      <p className="font-medium text-emerald-700">
                        {fmt(session.totalIn)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-red-500 text-xs">-Sorties</p>
                      <p className="font-medium text-red-600">
                        {fmt(session.totalOut)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-400 text-xs">Clôture</p>
                      <p className="font-bold text-slate-900">
                        {session.closingAmount != null
                          ? fmt(session.closingAmount)
                          : fmt((session as any).currentBalance ?? 0)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasFeature.exportPdf) {
                          setIsUpgradeModalOpen(true);
                          return;
                        }

                        // Comportement normal pour les plans payants
                        if (sessionDetail[session.id]) {
                          exportCashReportPDF(sessionDetail[session.id], user);
                        } else {
                          loadSessionDetail(session.id);
                          toast("Cliquez à nouveau pour télécharger", {
                            icon: "ℹ️",
                            duration: 3000,
                          });
                        }
                      }}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                        !hasFeature.exportPdf
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {!hasFeature.exportPdf ? (
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

                {expandedSession === session.id &&
                  sessionDetail[session.id] && (
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
                                      {fmt(m.net)}
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
                        <p className="text-sm text-gray-400">
                          Aucune transaction.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {sessionDetail[session.id].transactions?.map(
                            (tx: CashTransaction) => {
                              const method =
                                (tx as any).paymentMethod || "CASH";
                              const config =
                                METHOD_CONFIG[method] || METHOD_CONFIG.OTHER;
                              return (
                                <div
                                  key={tx.id}
                                  className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`rounded-full p-1 ${tx.type === "IN" ? "bg-emerald-100" : "bg-red-100"}`}
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
                                        <MethodIcon
                                          method={method}
                                          cls="h-3 w-3"
                                        />
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
                                    className={`text-xs font-bold ${tx.type === "IN" ? "text-emerald-600" : "text-red-600"}`}
                                  >
                                    {tx.type === "IN" ? "+" : "-"}
                                    {fmt(tx.amount)}
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
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
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
                setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
              }
              disabled={historyPage === historyTotalPages}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}

      {isUpgradeModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    {/* Conteneur du Modal */}
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 relative mx-4">
      
      {/* Bouton Fermer (X) en haut à droite */}
      <button 
        onClick={() => setIsUpgradeModalOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={18} />
      </button>

      {/* Header / Icône */}
      <div className="flex flex-col items-center text-center mt-2">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-100 text-amber-600 shadow-sm">
          <Lock size={22} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Historique & Rapports PDF verrouillés
        </h3>
        <p className="mt-2 text-sm text-gray-500 px-2">
          La consultation détaillée et l'export au format PDF des sessions de caisse archivées sont réservés aux utilisateurs des plans supérieurs.
        </p>
      </div>

      {/* Avantages du Plan Supérieur */}
      <div className="my-5 rounded-xl bg-slate-50 border border-gray-100 p-4 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Débloquez la gestion de caisse pro :
        </p>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-center gap-2">
            ✨ Historique complet et exports PDF <b>illimités</b>
          </li>
          <li className="flex items-center gap-2">
            📊 Historique des caisses cloturer
          </li>
          {/* <li className="flex items-center gap-2">
            👥 Gestion multi-boutiques et comptes employés
          </li> */}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={() => setIsUpgradeModalOpen(false)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition sm:w-auto"
        >
          Plus tard
        </button>
        <button
          type="button"
          onClick={() => {
            setIsUpgradeModalOpen(false);
            toast.success("Redirection vers les plans d'abonnement...");
          }}
          className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition sm:w-auto"
        >
          Passer au plan supérieur
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </section>
  );
}
