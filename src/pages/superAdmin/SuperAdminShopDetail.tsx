import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  Crown,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  History,
  Loader2,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getShopDetail,
  changeSubscriptionPlan,
  confirmSubscriptionPayment,
  cancelSubscriptionPayment,
  archiveShop,
  restoreShop,
} from "../../services";

type ShopDetail = {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string | null;
  logoUrl: string | null;
  status: string;
  currentShop: "PRIMARY" | "SECONDARY";
  createdAt: string;
  primaryShop: { id: number; name: string; status?: string } | null;
  secondaryShops: { id: number; name: string; status: string }[];
  subscriptionInherited: boolean;
  billingShopId: number;
  subscription: {
    id: number;
    status: string;
    startDate: string;
    endDate: string | null;
    gracePeriodEndsAt?: string | null;
    gracePeriodDaysRemaining?: number;
    plan: {
      code: string;
      name: string;
      price: number;
      limits: {
        sales: number | null;
        products: number | null;
        customers: number | null;
        users: number | null;
        stores: number | null;
      };
    };
  } | null;
  users: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }[];
  counts: {
    users: number;
    products: number;
    clients: number;
    suppliers: number;
    sales: number;
    salesRevenue: number;
  };
  payments: {
    id: number;
    amount: number;
    currency: string;
    provider: string;
    status: string;
    planCode: string | null;
    planName: string | null;
    paymentType: string;
    transactionReference: string | null;
    createdAt: string;
    paidAt: string | null;
  }[];
  auditLogs: {
    id: number;
    actorName: string;
    action: string;
    targetType: string;
    createdAt: string;
  }[];
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-sky-50 text-sky-600",
  PRO: "bg-emerald-50 text-emerald-600",
  PREMIUM: "bg-amber-50 text-amber-600",
};

const subStatusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  TRIAL: "bg-violet-50 text-violet-600",
  GRACE_PERIOD: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-red-50 text-red-600",
  TRIAL_EXPIRED: "bg-red-50 text-red-600",
  SUSPENDED: "bg-slate-100 text-slate-500",
};

const paymentStatusBadge: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  FAILED: "bg-red-50 text-red-600",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const plans = ["FREE", "BASIC", "PRO", "PREMIUM"];

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="text-gray-400 w-24 shrink-0">{label}</span>
      <span className="font-medium text-slate-700 truncate">{value}</span>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
        <Icon size={14} />
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

export default function SuperAdminShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Plan change modal state
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [changingPlan, setChangingPlan] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"WAVE" | "ORANGE_MONEY" | "OTHER">("WAVE");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(null);
  const [cancellingPaymentId, setCancellingPaymentId] = useState<number | null>(null);

  // Archive / restore modal state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [archiving, setArchiving] = useState(false);

  const loadShop = () => {
    if (!id) return;
    return getShopDetail(Number(id))
      .then(setShop)
      .catch(() => setError(true));
  };

  useEffect(() => {
    setLoading(true);
    loadShop()?.finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChangePlan = async () => {
    if (!selectedPlan || !shop) return;
    setChangingPlan(true);
    try {
      const result = await changeSubscriptionPlan({
        shopId: shop.id,
        planType: selectedPlan,
        ...(selectedPlan !== "FREE" ? {
          provider: paymentProvider,
          ...(paymentAmount.trim() ? { amount: Number(paymentAmount) } : {}),
          ...(paymentReference.trim() ? { transactionReference: paymentReference.trim() } : {}),
        } : {}),
      });
      if (result.payment) {
        toast.success("Demande de paiement enregistrée. Le forfait sera activé après vérification.");
      } else {
        toast.success("Passage au forfait gratuit effectué");
      }
      setPlanModalOpen(false);
      setPaymentAmount("");
      setPaymentReference("");
      await loadShop();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du changement de plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleConfirmPayment = async (paymentId: number) => {
    if (!window.confirm("Confirmez-vous avoir vérifié la réception réelle de ce paiement sur le compte de l'entreprise ? Cette action activera le forfait.")) return;
    setConfirmingPaymentId(paymentId);
    try {
      await confirmSubscriptionPayment(paymentId);
      toast.success("Paiement confirmé. Le forfait est maintenant activé.");
      await loadShop();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de confirmer ce paiement");
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const handleCancelPayment = async (paymentId: number) => {
    if (!window.confirm("Annuler cette demande de paiement ? Le forfait actuel sera conservé.")) return;
    setCancellingPaymentId(paymentId);
    try {
      await cancelSubscriptionPayment(paymentId);
      toast.success("Demande de paiement annulée");
      await loadShop();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible d'annuler ce paiement");
    } finally {
      setCancellingPaymentId(null);
    }
  };

  const isArchived = shop?.status === "ARCHIVED";
  const canRenewCurrentPlan = shop?.subscription?.status === "GRACE_PERIOD";

  const handleArchiveToggle = async () => {
    if (!shop) return;
    setArchiving(true);
    try {
      if (isArchived) {
        await restoreShop(shop.id);
        toast.success("Boutique restaurée");
      } else {
        await archiveShop(shop.id);
        toast.success("Boutique archivée");
      }
      setArchiveModalOpen(false);
      setConfirmName("");
      await loadShop();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'opération");
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Chargement...</div>;
  }

  if (error || !shop) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>Boutique introuvable.</p>
        <button
          onClick={() => navigate("/admin/shops")}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/shops")}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{shop.name}</h2>
          <p className="text-sm text-gray-500">
            {shop.currentShop === "PRIMARY" ? "Boutique principale" : "Boutique secondaire"}
            {shop.primaryShop && ` · rattachée à ${shop.primaryShop.name}`}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            shop.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-600"
              : isArchived
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {isArchived ? "ARCHIVÉE" : shop.status}
        </span>
        <button
          type="button"
          onClick={() => {
            setConfirmName("");
            setArchiveModalOpen(true);
          }}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
            isArchived
              ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              : "border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          {isArchived ? "Restaurer" : "Archiver"}
        </button>
      </div>

      {isArchived && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          Cette boutique est archivée : ses utilisateurs ne peuvent plus se connecter.
          Aucune donnée n'a été supprimée, vous pouvez la restaurer à tout moment.
        </div>
      )}

      {shop.primaryShop?.status === "ARCHIVED" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          Cette boutique secondaire est inaccessible car sa boutique principale « {shop.primaryShop.name} » est archivée.
          Son statut individuel est conservé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column: info + subscription */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          {/* Shop info card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Store size={15} /> Informations
            </h3>
            <div className="flex flex-col gap-3">
              <InfoRow icon={Users} label="Propriétaire" value={shop.ownerName} />
              <InfoRow icon={Mail} label="Email" value={shop.email} />
              <InfoRow icon={Phone} label="Téléphone" value={shop.phone} />
              <InfoRow icon={MapPin} label="Adresse" value={shop.address || "—"} />
              <InfoRow
                icon={Calendar}
                label="Créée le"
                value={new Date(shop.createdAt).toLocaleDateString("fr-FR")}
              />
            </div>

            {shop.secondaryShops.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Boutiques secondaires ({shop.secondaryShops.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {shop.secondaryShops.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/admin/shops/${s.id}`)}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <span className="text-slate-700">{s.name}</span>
                      <span className="text-xs text-gray-400">{s.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription card */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Crown size={15} /> Abonnement
              </h3>
              <div className="flex gap-2">
                <button
                  disabled
                  title="Fonctionnalité en cours de développement côté backend"
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                >
                  Changer le statut
                </button>
                <button
                  disabled={shop.subscriptionInherited}
                  title={
                    shop.subscriptionInherited
                      ? "Le forfait est hérité de la boutique principale"
                      : "Changer le plan"
                  }
                  onClick={() => {
                    setSelectedPlan(shop.subscription?.plan.code ?? "");
                    setPlanModalOpen(true);
                  }}
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Changer le plan
                </button>
              </div>
            </div>

            {shop.subscriptionInherited && shop.primaryShop && (
              <p className="mb-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
                Cet abonnement est hérité de la boutique principale « {shop.primaryShop.name} ».
                Les changements de forfait doivent être effectués depuis cette boutique.
              </p>
            )}

            {shop.subscription ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      planBadge[shop.subscription.plan.code] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {shop.subscription.plan.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      subStatusBadge[shop.subscription.status] ?? "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {shop.subscription.status === "GRACE_PERIOD" ? "Période de grâce" : shop.subscription.status}
                  </span>
                </div>
                {shop.subscription.status === "GRACE_PERIOD" && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    La boutique conserve toutes les fonctionnalités de ce forfait pendant encore {shop.subscription.gracePeriodDaysRemaining ?? 0} jour(s). Fin de grâce : {shop.subscription.gracePeriodEndsAt ? new Date(shop.subscription.gracePeriodEndsAt).toLocaleString("fr-FR") : "—"}.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <p className="text-gray-400">Prix</p>
                    <p className="font-medium text-slate-700">
                      {shop.subscription.plan.price.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Fin</p>
                    <p className="font-medium text-slate-700">
                      {shop.subscription.endDate
                        ? new Date(shop.subscription.endDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Limites du plan
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="text-gray-500">
                      Ventes/mois:{" "}
                      <span className="font-medium text-slate-700">
                        {shop.subscription.plan.limits.sales ?? "∞"}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Produits:{" "}
                      <span className="font-medium text-slate-700">
                        {shop.subscription.plan.limits.products ?? "∞"}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Clients:{" "}
                      <span className="font-medium text-slate-700">
                        {shop.subscription.plan.limits.customers ?? "∞"}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Utilisateurs:{" "}
                      <span className="font-medium text-slate-700">
                        {shop.subscription.plan.limits.users ?? "∞"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun abonnement.</p>
            )}
          </div>
        </div>

        {/* Right column: stats, users, payments, audit log */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Stats */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Activité</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <StatBlock icon={Users} label="Users" value={shop.counts.users} />
              <StatBlock icon={Package} label="Produits" value={shop.counts.products} />
              <StatBlock icon={Users} label="Clients" value={shop.counts.clients} />
              <StatBlock icon={Truck} label="Fourn." value={shop.counts.suppliers} />
              <StatBlock icon={ShoppingCart} label="Ventes" value={shop.counts.sales} />
              <StatBlock
                icon={Wallet}
                label="CA total"
                value={`${(shop.counts.salesRevenue / 1000).toFixed(0)}k`}
              />
            </div>
          </div>

          {/* Users list */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users size={15} /> Utilisateurs ({shop.users.length})
            </h3>
            <div className="flex flex-col gap-2">
              {shop.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{u.role}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-gray-300"}`}
                      title={u.isActive ? "Actif" : "Inactif"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment history */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <FileText size={15} /> Historique des paiements
            </h3>
            {shop.subscriptionInherited && shop.primaryShop && (
              <p className="mb-3 text-xs text-sky-700">
                Les paiements de cet abonnement sont gérés depuis la boutique principale « {shop.primaryShop.name} ».
              </p>
            )}
            {shop.payments.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun paiement enregistré.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-400">
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Montant</th>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Statut</th>
                      <th className="pb-2">Référence</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shop.payments.map((p) => (
                      <tr key={p.id} className="border-t border-gray-50">
                        <td className="py-2 font-medium text-slate-700">{p.planName ?? p.planCode ?? "—"}</td>
                        <td className="py-2 text-gray-600">
                          {p.amount.toLocaleString("fr-FR")} {p.currency}
                        </td>
                        <td className="py-2 text-gray-500">{p.provider}</td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              paymentStatusBadge[p.status] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 text-gray-500">{p.transactionReference || "—"}</td>
                        <td className="py-2 text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-2">
                          {p.status === "PENDING" && p.paymentType === "SUBSCRIPTION" && !shop.subscriptionInherited && (
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmPayment(p.id)}
                                disabled={confirmingPaymentId === p.id || cancellingPaymentId === p.id}
                                className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                {confirmingPaymentId === p.id ? "Confirmation..." : "Vérifier et activer"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancelPayment(p.id)}
                                disabled={confirmingPaymentId === p.id || cancellingPaymentId === p.id}
                                className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {cancellingPaymentId === p.id ? "Annulation..." : "Annuler"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit log */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <History size={15} /> Journal d'audit
            </h3>
            {shop.auditLogs.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune action enregistrée.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {shop.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      <span className="font-medium">{log.actorName}</span> — {log.action}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Archive / restore modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-slate-900">
              {isArchived ? "Restaurer la boutique" : "Archiver la boutique"}
            </h3>
            {isArchived ? (
              <p className="mb-5 text-sm text-gray-500">
                <span className="font-medium text-slate-700">{shop.name}</span> sera de nouveau
                accessible : ses utilisateurs pourront se reconnecter.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-500">
                  Les utilisateurs de{" "}
                  <span className="font-medium text-slate-700">{shop.name}</span> ne pourront plus
                  se connecter et leurs sessions ouvertes seront coupées en moins de 30 secondes.
                  Aucune donnée n'est supprimée et la boutique peut être restaurée.
                </p>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Pour confirmer, saisissez le nom de la boutique :
                </label>
                <input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={shop.name}
                  className="mb-5 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-red-400"
                />
              </>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setArchiveModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleArchiveToggle}
                disabled={archiving || (!isArchived && confirmName.trim() !== shop.name.trim())}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                  isArchived ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {archiving && <Loader2 size={14} className="animate-spin" />}
                {isArchived ? "Restaurer" : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan change modal */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-slate-900">Changer le plan</h3>
            <p className="mb-4 text-sm text-gray-500">
              Boutique : <span className="font-medium text-slate-700">{shop.name}</span>
            </p>

            <div className="flex flex-col gap-2 mb-5">
              {plans.map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedPlan(code)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    selectedPlan === code
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-slate-600 hover:bg-gray-50"
                  }`}
                >
                  {code}
                  {shop.subscription?.plan.code === code && (
                    <span className="text-xs text-gray-400">actuel</span>
                  )}
                </button>
              ))}
            </div>
            {selectedPlan && selectedPlan !== "FREE" && (
              <div className="mb-5 flex flex-col gap-3 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">
                  Le paiement sera enregistré en attente. Le forfait actuel ne changera qu'après vérification de la réception.
                </p>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Moyen de paiement
                  <select
                    value={paymentProvider}
                    onChange={(e) => setPaymentProvider(e.target.value as "WAVE" | "ORANGE_MONEY" | "OTHER")}
                    className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal text-slate-700"
                  >
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Montant déclaré (FCFA)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Prix du forfait si non renseigné"
                    className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal text-slate-700"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                  Référence de transaction (facultatif)
                  <input
                    type="text"
                    maxLength={120}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ex. référence Wave ou Orange Money"
                    className="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-normal text-slate-700"
                  />
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPlanModalOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlan}
                disabled={changingPlan || !selectedPlan || (selectedPlan === shop.subscription?.plan.code && !canRenewCurrentPlan)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {changingPlan && <Loader2 size={14} className="animate-spin" />}
                {selectedPlan === shop.subscription?.plan.code && canRenewCurrentPlan ? "Enregistrer le renouvellement" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}