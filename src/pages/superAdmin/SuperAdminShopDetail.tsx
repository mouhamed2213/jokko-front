import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Calendar,
  Crown,
  ExternalLink,
  FileText,
  History,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  archiveShop,
  cancelSubscriptionPayment,
  changeSubscriptionPlan,
  confirmSubscriptionPayment,
  getShopDetail,
  restoreShop,
} from "../../services";

type ShopDetail = {
  id: number;
  name: string;
  ownerId: number | null;
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
  FREE: "bg-ink/5 text-ink/70",
  BASIC: "bg-jokko/10 text-jokko-deep",
  PRO: "bg-jokko/10 text-jokko",
  PREMIUM: "bg-sun/20 text-ink",
};

const subStatusBadge: Record<string, string> = {
  ACTIVE: "bg-jokko/10 text-jokko",
  TRIAL: "bg-ink/5 text-ink",
  GRACE_PERIOD: "bg-sun/20 text-ink",
  EXPIRED: "bg-red-50 text-red-600",
  TRIAL_EXPIRED: "bg-red-50 text-red-600",
  SUSPENDED: "bg-ink/5 text-ink/60",
};

const paymentStatusBadge: Record<string, string> = {
  SUCCESS: "bg-jokko/10 text-jokko",
  PENDING: "bg-sun/20 text-ink",
  FAILED: "bg-red-50 text-red-600",
  CANCELLED: "bg-ink/5 text-ink/60",
};

const plans = ["FREE", "BASIC", "PRO", "PREMIUM"];

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={14} className="text-ink/45 shrink-0" />
      <span className="text-ink/45 w-24 shrink-0">{label}</span>
      <span className="font-medium text-ink/75 truncate">{value}</span>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-cream p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-paper text-jokko shadow-sm">
        <Icon size={14} />
      </div>
      <p className="text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink/45">{label}</p>
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
  const [paymentProvider, setPaymentProvider] = useState<
    "WAVE" | "ORANGE_MONEY" | "OTHER"
  >("WAVE");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(
    null,
  );
  const [cancellingPaymentId, setCancellingPaymentId] = useState<number | null>(
    null,
  );

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
        ...(selectedPlan !== "FREE"
          ? {
              provider: paymentProvider,
              ...(paymentAmount.trim()
                ? { amount: Number(paymentAmount) }
                : {}),
              ...(paymentReference.trim()
                ? { transactionReference: paymentReference.trim() }
                : {}),
            }
          : {}),
      });
      if (result.payment) {
        toast.success(
          "Demande de paiement enregistrée. Le forfait sera activé après vérification.",
        );
      } else {
        toast.success("Passage au forfait gratuit effectué");
      }
      setPlanModalOpen(false);
      setPaymentAmount("");
      setPaymentReference("");
      await loadShop();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur lors du changement de plan",
      );
    } finally {
      setChangingPlan(false);
    }
  };

  const handleConfirmPayment = async (paymentId: number) => {
    if (
      !window.confirm(
        "Confirmez-vous avoir vérifié la réception réelle de ce paiement sur le compte de l'entreprise ? Cette action activera le forfait.",
      )
    )
      return;
    setConfirmingPaymentId(paymentId);
    try {
      await confirmSubscriptionPayment(paymentId);
      toast.success("Paiement confirmé. Le forfait est maintenant activé.");
      await loadShop();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Impossible de confirmer ce paiement",
      );
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const handleCancelPayment = async (paymentId: number) => {
    if (
      !window.confirm(
        "Annuler cette demande de paiement ? Le forfait actuel sera conservé.",
      )
    )
      return;
    setCancellingPaymentId(paymentId);
    try {
      await cancelSubscriptionPayment(paymentId);
      toast.success("Demande de paiement annulée");
      await loadShop();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Impossible d'annuler ce paiement",
      );
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
      toast.error(
        error?.response?.data?.message || "Erreur lors de l'opération",
      );
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink/45">
        Chargement...
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-ink/45">
        <p>Boutique introuvable.</p>
        <button
          onClick={() => navigate("/admin/shops")}
          className="rounded-xl bg-jokko px-4 py-2 text-sm font-medium text-white hover:bg-jokko-deep"
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
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink/60 shadow-sm hover:bg-ink/5"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-ink">{shop.name}</h2>
          <p className="text-sm text-ink/60">
            {shop.currentShop === "PRIMARY"
              ? "Boutique principale"
              : "Boutique secondaire"}
            {shop.primaryShop && ` · rattachée à ${shop.primaryShop.name}`}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            shop.status === "ACTIVE"
              ? "bg-jokko/10 text-jokko"
              : isArchived
                ? "bg-red-50 text-red-600"
                : "bg-ink/5 text-ink/60"
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
              ? "border-jokko/25 text-jokko-deep hover:bg-jokko/10"
              : "border-red-200 text-red-600 hover:bg-red-50"
          }`}
        >
          {isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          {isArchived ? "Restaurer" : "Archiver"}
        </button>
      </div>

      {isArchived && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          Cette boutique est archivée : ses utilisateurs ne peuvent plus se
          connecter. Aucune donnée n'a été supprimée, vous pouvez la restaurer à
          tout moment.
        </div>
      )}

      {shop.primaryShop?.status === "ARCHIVED" && (
        <div className="rounded-2xl border border-sun/50 bg-sun/20 px-5 py-3 text-sm text-ink">
          Cette boutique secondaire est inaccessible car sa boutique principale
          « {shop.primaryShop.name} » est archivée. Son statut individuel est
          conservé.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column: info + subscription */}
        <div className="flex flex-col gap-5 lg:col-span-1">
          {/* Shop info card */}
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
              <Store size={15} /> Informations
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <InfoRow
                  icon={Users}
                  label="Propriétaire"
                  value={shop.ownerName}
                />
                {shop.ownerId !== null && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/owners/${shop.ownerId}`)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-jokko/25 px-3 py-1.5 text-xs font-medium text-jokko-deep transition hover:bg-jokko/10"
                    title="Consulter la fiche du propriétaire"
                  >
                    Voir le propriétaire
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
              <InfoRow icon={Mail} label="Email" value={shop.email} />
              <InfoRow icon={Phone} label="Téléphone" value={shop.phone} />
              <InfoRow
                icon={MapPin}
                label="Adresse"
                value={shop.address || "—"}
              />
              <InfoRow
                icon={Calendar}
                label="Créée le"
                value={new Date(shop.createdAt).toLocaleDateString("fr-FR")}
              />
            </div>

            {shop.secondaryShops.length > 0 && (
              <div className="mt-4 border-t border-ink/10 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
                  Boutiques secondaires ({shop.secondaryShops.length})
                </p>
                <div className="flex flex-col gap-1.5">
                  {shop.secondaryShops.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/admin/shops/${s.id}`)}
                      className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-left text-sm hover:bg-ink/5"
                    >
                      <span className="text-ink/75">{s.name}</span>
                      <span className="text-xs text-ink/45">{s.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subscription card */}
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Crown size={15} /> Abonnement
              </h3>
              <div className="flex gap-2">
                <button
                  disabled
                  title="Fonctionnalité en cours de développement côté backend"
                  className="rounded-lg bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/45 cursor-not-allowed"
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
                  className="rounded-lg bg-jokko/10 px-3 py-1.5 text-xs font-medium text-jokko hover:bg-jokko/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Changer le plan
                </button>
              </div>
            </div>

            {shop.subscriptionInherited && shop.primaryShop && (
              <p className="mb-3 rounded-lg bg-jokko/10 px-3 py-2 text-xs text-jokko-deep">
                Cet abonnement est hérité de la boutique principale «{" "}
                {shop.primaryShop.name} ». Les changements de forfait doivent
                être effectués depuis cette boutique.
              </p>
            )}

            {shop.subscription ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      planBadge[shop.subscription.plan.code] ??
                      "bg-ink/5 text-ink/70"
                    }`}
                  >
                    {shop.subscription.plan.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      subStatusBadge[shop.subscription.status] ??
                      "bg-ink/5 text-ink/60"
                    }`}
                  >
                    {shop.subscription.status === "GRACE_PERIOD"
                      ? "Période de grâce"
                      : shop.subscription.status}
                  </span>
                </div>
                {shop.subscription.status === "GRACE_PERIOD" && (
                  <p className="rounded-lg bg-sun/20 px-3 py-2 text-xs text-ink">
                    La boutique conserve toutes les fonctionnalités de ce
                    forfait pendant encore{" "}
                    {shop.subscription.gracePeriodDaysRemaining ?? 0} jour(s).
                    Fin de grâce :{" "}
                    {shop.subscription.gracePeriodEndsAt
                      ? new Date(
                          shop.subscription.gracePeriodEndsAt,
                        ).toLocaleString("fr-FR").replace(/\u202f/g, " ")
                      : "—"}
                    .
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-ink/60">
                  <div>
                    <p className="text-ink/45">Prix</p>
                    <p className="font-medium text-ink/75">
                      {shop.subscription.plan.price.toLocaleString("fr-FR").replace(/\u202f/g, " ")}{" "}
                      FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-ink/45">Fin</p>
                    <p className="font-medium text-ink/75">
                      {shop.subscription.endDate
                        ? new Date(
                            shop.subscription.endDate,
                          ).toLocaleDateString("fr-FR")
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-ink/10 pt-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
                    Limites du plan
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p className="text-ink/60">
                      Ventes/mois:{" "}
                      <span className="font-medium text-ink/75">
                        {shop.subscription.plan.limits.sales ?? "∞"}
                      </span>
                    </p>
                    <p className="text-ink/60">
                      Produits:{" "}
                      <span className="font-medium text-ink/75">
                        {shop.subscription.plan.limits.products ?? "∞"}
                      </span>
                    </p>
                    <p className="text-ink/60">
                      Clients:{" "}
                      <span className="font-medium text-ink/75">
                        {shop.subscription.plan.limits.customers ?? "∞"}
                      </span>
                    </p>
                    <p className="text-ink/60">
                      Utilisateurs:{" "}
                      <span className="font-medium text-ink/75">
                        {shop.subscription.plan.limits.users ?? "∞"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/45">Aucun abonnement.</p>
            )}
          </div>
        </div>

        {/* Right column: stats, users, payments, audit log */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Stats */}
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-ink">
              Activité
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <StatBlock icon={Users} label="Users" value={shop.counts.users} />
              <StatBlock
                icon={Package}
                label="Produits"
                value={shop.counts.products}
              />
              <StatBlock
                icon={Users}
                label="Clients"
                value={shop.counts.clients}
              />
              <StatBlock
                icon={Truck}
                label="Fourn."
                value={shop.counts.suppliers}
              />
              <StatBlock
                icon={ShoppingCart}
                label="Ventes"
                value={shop.counts.sales}
              />
              <StatBlock
                icon={Wallet}
                label="CA total"
                value={`${(shop.counts.salesRevenue / 1000).toFixed(0)}k`}
              />
            </div>
          </div>

          {/* Users list */}
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
              <Users size={15} /> Utilisateurs ({shop.users.length})
            </h3>
            <div className="flex flex-col gap-2">
              {shop.users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl bg-cream px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink/80">
                      {u.name}
                    </p>
                    <p className="text-xs text-ink/45">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink/45">{u.role}</span>
                    <span
                      className={`h-2 w-2 rounded-full ${u.isActive ? "bg-jokko/100" : "bg-gray-300"}`}
                      title={u.isActive ? "Actif" : "Inactif"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment history */}
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
              <FileText size={15} /> Historique des paiements
            </h3>
            {shop.subscriptionInherited && shop.primaryShop && (
              <p className="mb-3 text-xs text-jokko-deep">
                Les paiements de cet abonnement sont gérés depuis la boutique
                principale « {shop.primaryShop.name} ».
              </p>
            )}
            {shop.payments.length === 0 ? (
              <p className="text-sm text-ink/45">
                Aucun paiement enregistré.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-ink/45">
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
                      <tr key={p.id} className="border-t border-ink/10">
                        <td className="py-2 font-medium text-ink/75">
                          {p.planName ?? p.planCode ?? "—"}
                        </td>
                        <td className="py-2 text-ink/70">
                          {p.amount.toLocaleString("fr-FR").replace(/\u202f/g, " ")} {p.currency}
                        </td>
                        <td className="py-2 text-ink/60">{p.provider}</td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              paymentStatusBadge[p.status] ??
                              "bg-ink/5 text-ink/60"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2 text-ink/60">
                          {p.transactionReference || "—"}
                        </td>
                        <td className="py-2 text-ink/45">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-2">
                          {p.status === "PENDING" &&
                            p.paymentType === "SUBSCRIPTION" &&
                            !shop.subscriptionInherited && (
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPayment(p.id)}
                                  disabled={
                                    confirmingPaymentId === p.id ||
                                    cancellingPaymentId === p.id
                                  }
                                  className="rounded-lg bg-jokko/10 px-2.5 py-1.5 text-xs font-medium text-jokko-deep hover:bg-jokko/15 disabled:opacity-50"
                                >
                                  {confirmingPaymentId === p.id
                                    ? "Confirmation..."
                                    : "Vérifier et activer"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCancelPayment(p.id)}
                                  disabled={
                                    confirmingPaymentId === p.id ||
                                    cancellingPaymentId === p.id
                                  }
                                  className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                                >
                                  {cancellingPaymentId === p.id
                                    ? "Annulation..."
                                    : "Annuler"}
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
          <div className="rounded-2xl bg-paper p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
              <History size={15} /> Journal d'audit
            </h3>
            {shop.auditLogs.length === 0 ? (
              <p className="text-sm text-ink/45">
                Aucune action enregistrée.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {shop.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink/70">
                      <span className="font-medium">{log.actorName}</span> —{" "}
                      {log.action}
                    </span>
                    <span className="text-xs text-ink/45">
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
          <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-ink">
              {isArchived ? "Restaurer la boutique" : "Archiver la boutique"}
            </h3>
            {isArchived ? (
              <p className="mb-5 text-sm text-ink/60">
                <span className="font-medium text-ink/75">{shop.name}</span>{" "}
                sera de nouveau accessible : ses utilisateurs pourront se
                reconnecter.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-ink/60">
                  Les utilisateurs de{" "}
                  <span className="font-medium text-ink/75">
                    {shop.name}
                  </span>{" "}
                  ne pourront plus se connecter et leurs sessions ouvertes
                  seront coupées en moins de 30 secondes. Aucune donnée n'est
                  supprimée et la boutique peut être restaurée.
                </p>
                <label className="mb-1 block text-xs font-medium text-ink/70">
                  Pour confirmer, saisissez le nom de la boutique :
                </label>
                <input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={shop.name}
                  className="mb-5 w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm outline-none focus:border-red-400"
                />
              </>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setArchiveModalOpen(false)}
                className="flex-1 rounded-xl border border-ink/10 px-4 py-2.5 text-sm text-ink/75 hover:bg-ink/5"
              >
                Annuler
              </button>
              <button
                onClick={handleArchiveToggle}
                disabled={
                  archiving ||
                  (!isArchived && confirmName.trim() !== shop.name.trim())
                }
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                  isArchived
                    ? "bg-jokko hover:bg-jokko-deep"
                    : "bg-red-600 hover:bg-red-700"
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
          <div className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-ink">
              Changer le plan
            </h3>
            <p className="mb-4 text-sm text-ink/60">
              Boutique :{" "}
              <span className="font-medium text-ink/75">{shop.name}</span>
            </p>

            <div className="flex flex-col gap-2 mb-5">
              {plans.map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedPlan(code)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    selectedPlan === code
                      ? "border-jokko/100 bg-jokko/10 text-jokko-deep"
                      : "border-ink/10 text-ink/70 hover:bg-ink/5"
                  }`}
                >
                  {code}
                  {shop.subscription?.plan.code === code && (
                    <span className="text-xs text-ink/45">actuel</span>
                  )}
                </button>
              ))}
            </div>
            {selectedPlan && selectedPlan !== "FREE" && (
              <div className="mb-5 flex flex-col gap-3 border-t border-ink/10 pt-4">
                <p className="text-xs text-ink/60">
                  Le paiement sera enregistré en attente. Le forfait actuel ne
                  changera qu'après vérification de la réception.
                </p>
                <label className="flex flex-col gap-1 text-xs font-medium text-ink/70">
                  Moyen de paiement
                  <select
                    value={paymentProvider}
                    onChange={(e) =>
                      setPaymentProvider(
                        e.target.value as "WAVE" | "ORANGE_MONEY" | "OTHER",
                      )
                    }
                    className="rounded-xl border border-ink/20 px-3 py-2.5 text-sm font-normal text-ink/75"
                  >
                    <option value="WAVE">Wave</option>
                    <option value="ORANGE_MONEY">Orange Money</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-ink/70">
                  Montant déclaré (FCFA)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Prix du forfait si non renseigné"
                    className="rounded-xl border border-ink/20 px-3 py-2.5 text-sm font-normal text-ink/75"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-ink/70">
                  Référence de transaction (facultatif)
                  <input
                    type="text"
                    maxLength={120}
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ex. référence Wave ou Orange Money"
                    className="rounded-xl border border-ink/20 px-3 py-2.5 text-sm font-normal text-ink/75"
                  />
                </label>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPlanModalOpen(false)}
                className="flex-1 rounded-xl border border-ink/10 px-4 py-2.5 text-sm text-ink/75 hover:bg-ink/5"
              >
                Annuler
              </button>
              <button
                onClick={handleChangePlan}
                disabled={
                  changingPlan ||
                  !selectedPlan ||
                  (selectedPlan === shop.subscription?.plan.code &&
                    !canRenewCurrentPlan)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-jokko px-4 py-2.5 text-sm font-semibold text-white hover:bg-jokko-deep disabled:opacity-50"
              >
                {changingPlan && <Loader2 size={14} className="animate-spin" />}
                {selectedPlan === shop.subscription?.plan.code &&
                canRenewCurrentPlan
                  ? "Enregistrer le renouvellement"
                  : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
