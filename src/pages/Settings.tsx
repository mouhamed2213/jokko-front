import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload,
  Trash2,
  Save,
  Building2,
  Phone,
  MapPin,
  User,
  Crown,
  Check,
  AlertTriangle,
  Clock,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { getStoredUser } from "../types/auth";
import { SUPPORT_EMAIL, getSubscription } from "../services";

type Plan = {
  id: number;
  code: "FREE" | "BASIC" | "PRO" | "PREMIUM";
  name: string;
  maxSalesPerMonth: number | null;
  maxProducts: number | null;
  maxCustomers: number | null;
  maxUsers: number;
  maxStores: number;
};

type Subscription = {
  id: number;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "TRIAL_EXPIRED" | "GRACE_PERIOD";
  startDate: string;
  endDate: string | null;
  plan: Plan;
};

type ShopInfo = {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  status: string;
  subscriptions: Subscription[];
  _count: {
    users: number;
    products: number;
    sales: number;
    clients: number;
  };
};

// ── Données des plans pour la section upgrade ──
const PLANS_INFO = [
  {
    code: "FREE",
    name: "Gratuit",
    price: 0,
    color: "slate",
    features: [
      "1 utilisateur",
      "20 produits",
      "10 ventes/mois",
      "Clients illimités",
      "2 fournisseurs",
    ],
  },
  {
    code: "BASIC",
    name: "Basic",
    price: 6500,
    color: "emerald",
    features: [
      "3 utilisateurs",
      "Produits illimités",
      "Ventes illimitées",
      "Clients illimités",
      "Factures PDF A4",
      "Export Excel",
      "Alertes stock",
      "5 fournisseurs",
    ],
  },
  {
    code: "PRO",
    name: "Pro",
    price: 14000,
    color: "blue",
    features: [
      "5 utilisateurs",
      "Tout Basic inclus",
      "Gestion fournisseurs",
      "Rapports & statistiques",
      "Paiements par tranches",
      "Historique complet",
    ],
  },
  {
    code: "PREMIUM",
    name: "Premium",
    price: 22000,
    color: "purple",
    features: [
      "Utilisateurs illimités",
      "Tout Pro inclus",
      "Multi-boutiques (5 max)",
      "Rôles & permissions avancés",
      "Support prioritaire",
    ],
  },
];

const PLAN_ORDER = ["FREE", "BASIC", "PRO", "PREMIUM"];

function getPlanIndex(code: string) {
  return PLAN_ORDER.indexOf(code);
}

function getDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Settings() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const isAdmin = user?.role === "ADMIN";

  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<Awaited<ReturnType<typeof getSubscription>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    phone: "",
    address: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchShop = async () => {
    try {
      const res = await api.get("/shop/settings");
      setShop(res.data);
      setForm({
        name: res.data.name,
        ownerName: res.data.ownerName,
        phone: res.data.phone || "",
        address: res.data.address || "",
      });
      setLogoPreview(res.data.logoUrl || "");
      if (res.data.logoUrl) {
        localStorage.setItem("shopLogo", res.data.logoUrl);


        localStorage.setItem("shopName", res.data.name);
      }
    } catch {
      toast.error("Erreur chargement paramètres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
    getSubscription().then(setSubscriptionInfo).catch(() => undefined);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.ownerName) {
      return toast.error("Nom boutique et propriétaire obligatoires");
    }
    setSaving(true);
    try {
      const res = await api.put("/shop/settings", form);
      setShop(res.data.shop);
      localStorage.setItem("shopName", res.data.shop.name);
      const currentUser = getStoredUser();
      if (currentUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({ ...currentUser, shopName: res.data.shop.name }),
        );
      }
      toast.success("Paramètres sauvegardés");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await api.post("/shop/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLogoPreview(res.data.logoUrl);
      localStorage.setItem("shopLogo", res.data.logoUrl);
      toast.success("Logo mis à jour — visible sur vos factures");
      window.dispatchEvent(new Event("shopLogoUpdated"));
      fetchShop()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur upload logo");
      setLogoPreview(shop?.logoUrl || "");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Supprimer le logo de la boutique ?")) return;
    try {
      await api.delete("/shop/logo");
      setLogoPreview("");
      localStorage.removeItem("shopLogo");
      toast.success("Logo supprimé");
      window.dispatchEvent(new Event("shopLogoUpdated"));
    } catch {
      toast.error("Erreur suppression logo");
    }
  };

  if (loading)
    return (
      <div className="rounded-2xl bg-paper p-8 text-center text-ink/45">
        Chargement...
      </div>
    );
  // const cSubs = shop?.subscriptions?.[0];
  // // const testSubsStatut = { ...cSubs, status: "TRIAL_EXPIRED" };
  // // const subscription = testSubsStatut;

  const storedSubscription = shop?.subscriptions?.[0] ?? null;
  const subscription = storedSubscription
    ? {
        ...storedSubscription,
        status: subscriptionInfo?.status ?? storedSubscription.status,
        endDate: subscriptionInfo?.endDate
          ? String(subscriptionInfo.endDate)
          : storedSubscription.endDate,
        plan: subscriptionInfo
          ? {
              ...storedSubscription.plan,
              code: subscriptionInfo.plan.code as Plan["code"],
              name: subscriptionInfo.plan.name,
              maxSalesPerMonth: subscriptionInfo.limits.sales,
              maxProducts: subscriptionInfo.limits.products,
              maxCustomers: subscriptionInfo.limits.customers,
              maxUsers: subscriptionInfo.limits.users ?? 0,
              maxStores: subscriptionInfo.limits.stores ?? 0,
            }
          : storedSubscription.plan,
      }
    : null;

  const currentPlan = subscription?.plan ?? null;
  const currentPlanCode = currentPlan?.code ?? "FREE";
  const currentPlanIndex = getPlanIndex(currentPlanCode);
  const daysRemaining = getDaysRemaining(subscription?.endDate ?? null);
  const isActive = subscription?.status === "ACTIVE";
  const isGracePeriod = subscription?.status === "GRACE_PERIOD";
  const isExpired = subscription?.status === "EXPIRED";
  const isTrialing = subscription?.status === "TRIAL";
  const isTrialExpired = subscription?.status === "TRIAL_EXPIRED";

  // console.log(subscription)

  return (
    <section className="space-y-6 max-w-3xl">
      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Produits", value: shop?._count?.products ?? 0 },
          { label: "Clients", value: shop?._count?.clients ?? 0 },
          { label: "Ventes", value: shop?._count?.sales ?? 0 },
          { label: "Utilisateurs", value: shop?._count?.users ?? 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-ink/10 bg-paper p-4 text-center"
          >
            <p className="text-2xl font-bold text-ink">{s.value}</p>
            <p className="mt-1 text-xs text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Bloc abonnement actuel ── */}
      {subscription && (
        <div className="rounded-3xl border border-ink/10 bg-paper overflow-hidden">
          {/* Header statut */}
          <div
            className={`px-6 py-4 flex items-center justify-between ${
              isTrialing
                ? "bg-jokko/10 border-b border-jokko/25"
                : isGracePeriod
                  ? "bg-sun/20 border-b border-sun/60"
                  : isExpired || isTrialExpired
                    ? "bg-red-50 border-b border-red-100"
                    : "bg-jokko/10 border-b border-jokko/25"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isTrialing
                    ? "bg-jokko/10"
                    : isGracePeriod
                      ? "bg-sun/20"
                      : (isExpired || isTrialExpired)
                        ? "bg-red-100"
                        : "bg-jokko/10"
                }`}
              >
                {isTrialing ? (
                  <Clock size={18} className="text-jokko-deep" />
                ) : isGracePeriod ? (
                  <Clock size={18} className="text-ink" />
                ) : isExpired || isTrialExpired ? (
                  <AlertTriangle size={18} className="text-red-600" />
                ) : (
                  <Zap size={18} className="text-jokko-deep" />
                )}
              </div>
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isTrialing
                      ? "text-jokko-deep"
                      : isGracePeriod
                        ? "text-ink"
                        : (isExpired || isTrialExpired)
                          ? "text-red-800"
                          : "text-jokko-deep"
                  }`}
                >
                  Plan {currentPlan?.name ?? "Gratuit"}
                  {isTrialing && " — Période d'essai"}
                  {isActive && " — Actif"}
                  {isGracePeriod && " — Période de grâce"}
                  {isExpired && " — Expiré"}
                  {isTrialExpired && " — Fin période d'essai"}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isTrialing
                      ? "text-jokko-deep"
                      : isGracePeriod
                        ? "text-ink"
                        : (isExpired || isTrialExpired)
                          ? "text-red-600"
                          : "text-jokko-deep"
                  }`}
                >
                  {isTrialing && daysRemaining !== null && (
                    <>
                      {daysRemaining > 0
                        ? `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} d'essai restant${daysRemaining > 1 ? "s" : ""}`
                        : "Essai expiré aujourd'hui"}
                    </>
                  )}
                  {isActive && subscription.endDate && (
                    <>
                      Renouvellement le{" "}
                      {new Date(subscription.endDate).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </>
                  )}
                  {isGracePeriod && (
                    <>
                      Votre abonnement est arrivé à échéance. Vous conservez toutes les fonctionnalités jusqu'au{" "}
                      {subscriptionInfo?.gracePeriodEndsAt
                        ? new Date(subscriptionInfo.gracePeriodEndsAt).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "terme de la période de grâce"}
                      {" "}({subscriptionInfo?.gracePeriodDaysRemaining ?? 0} jour(s) restant(s)).
                    </>
                  )}
                  {isActive && !subscription.endDate && (
                    <>Sans date d'expiration</>
                  )}
                  {isExpired &&
                    "Votre abonnement a expiré — passez à un plan payant"}
                  {isTrialExpired &&
                    "Votre période d'essai a expiré — passez à un plan payant"}

                </p>
              </div>
            </div>

            {/* Badge plan */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                currentPlanCode === "FREE"
                  ? "bg-ink/5 text-ink/70"
                  : currentPlanCode === "BASIC"
                    ? "bg-jokko/10 text-jokko-deep"
                    : currentPlanCode === "PRO"
                      ? "bg-jokko/10 text-jokko-deep"
                      : "bg-ink/5 text-ink"
              }`}
            >
              {currentPlan?.name ?? "Gratuit"}
            </span>
          </div>

          {isGracePeriod && (
            <div className="flex flex-col gap-3 border-b border-sun/60 bg-sun/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink">
                Pour conserver votre formule {currentPlan?.name}, demandez son renouvellement avant la fin de la période de grâce.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/contact?subject=${encodeURIComponent(`Renouvellement du forfait ${currentPlan?.name ?? ""}`)}`)}
                className="shrink-0 rounded-full bg-sun px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sun"
              >
                Demander le renouvellement
              </button>
            </div>
          )}

          {/* Limites du plan actuel */}
          {currentPlan && (
            <div className="px-6 py-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-ink/10">
              {[
                {
                  label: "Utilisateurs",
                  value:
                    currentPlan.maxUsers === -1
                      ? "Illimité"
                      : currentPlan.maxUsers,
                },
                {
                  label: "Produits",
                  value:
                    currentPlan.maxProducts === null
                      ? "Illimité"
                      : currentPlan.maxProducts,
                },
                {
                  label: "Ventes/mois",
                  value:
                    currentPlan.maxSalesPerMonth === null
                      ? "Illimité"
                      : currentPlan.maxSalesPerMonth,
                },
                {
                  label: "Boutiques",
                  value:
                    currentPlan.maxStores === -1
                      ? "Illimité"
                      : currentPlan.maxStores,
                },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-base font-bold text-ink">
                    {item.value}
                  </p>
                  <p className="text-xs text-ink/45 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA upgrade si pas Premium */}
          {currentPlanCode !== "PREMIUM" && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-ink/60 uppercase tracking-wider mb-3">
                {isExpired
                  ? "Réactivez votre abonnement"
                  : "Passer à un plan supérieur"}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {PLANS_INFO.filter(
                  (p) => getPlanIndex(p.code) > currentPlanIndex,
                ).map((plan) => (
                  <div
                    key={plan.code}
                    className={`rounded-xl border p-4 cursor-pointer hover:shadow-sm transition ${
                      plan.code === "BASIC"
                        ? "border-jokko/25 bg-jokko/10"
                        : plan.code === "PRO"
                          ? "border-jokko/25 bg-jokko/10"
                          : "border-ink/15 bg-ink/5"
                    }`}
                    onClick={() =>
                      navigate(`/contact?subject=${encodeURIComponent(`Demande d'activation du plan ${plan.name}`)}`)
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-bold ${
                          plan.code === "BASIC"
                            ? "text-jokko-deep"
                            : plan.code === "PRO"
                              ? "text-jokko-deep"
                              : "text-ink"
                        }`}
                      >
                        {plan.name}
                      </span>
                      <Crown
                        size={14}
                        className={
                          plan.code === "BASIC"
                            ? "text-jokko-deep"
                            : plan.code === "PRO"
                              ? "text-jokko-deep"
                              : "text-ink"
                        }
                      />
                    </div>
                    <p className="text-lg font-bold text-ink">
                      {plan.price.toLocaleString("fr-FR").replace(/\u202f/g, " ")}{" "}
                      <span className="text-xs font-normal text-ink/60">
                        FCFA/mois
                      </span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plan.features.slice(0, 3).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-1.5 text-xs text-ink/70"
                        >
                          <Check
                            size={11}
                            className="text-jokko-deep shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-ink/45">
                          +{plan.features.length - 3} autres...
                        </li>
                      )}
                    </ul>
                    <button
                      className={`mt-3 w-full py-1.5 rounded-full text-xs font-semibold transition ${
                        plan.code === "BASIC"
                          ? "bg-jokko text-white hover:bg-jokko-deep"
                          : plan.code === "PRO"
                            ? "bg-jokko text-white hover:bg-jokko-deep"
                            : "bg-ink text-white hover:bg-ink"
                      }`}
                    >
                      Passer au {plan.name}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink/45 text-center">
                Pour activer votre plan, contactez-nous par téléphone ou par email :{" "}
                <a
                  href="tel:+221783333838"
                  className="text-jokko-deep font-medium hover:underline"
                >
                  +221 78 333 38 38
                </a>{" "}
                · <a href={`mailto:${SUPPORT_EMAIL}`} className="text-jokko-deep font-medium hover:underline">{SUPPORT_EMAIL}</a>{" "}
                · <a href="/contact?subject=Demande%20d%27activation%20d%27un%20abonnement" className="text-jokko-deep font-medium hover:underline">Formulaire de contact</a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Logo de la boutique ── */}
      <div className="rounded-3xl border border-ink/10 bg-paper p-6">
        <h3 className="mb-1 text-lg font-bold text-ink">
          Logo de la boutique
        </h3>
        <p className="mb-5 text-sm text-ink/60">
          Ce logo apparaîtra dans la barre latérale et sur toutes vos factures.
        </p>

        <div className="flex items-start gap-6">
          <div
            onClick={() =>
              isAdmin && !uploading && fileInputRef.current?.click()
            }
            className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-2 overflow-hidden transition
              ${isAdmin ? "cursor-pointer" : "cursor-default"}
              ${
                logoPreview
                  ? "border-jokko/25 bg-jokko/10"
                  : "border-dashed border-ink/20 bg-cream hover:border-jokko"
              }`}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo boutique"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-ink/45">
                <Building2 size={28} />
                <span className="text-xs text-center px-1">Pas de logo</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-jokko border-t-transparent" />
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2.5 text-sm text-ink/75 hover:bg-cream disabled:opacity-50"
              >
                <Upload size={15} />
                {uploading
                  ? "Upload en cours..."
                  : logoPreview
                    ? "Changer le logo"
                    : "Uploader un logo"}
              </button>

              {logoPreview && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Supprimer le logo
                </button>
              )}

              <p className="text-xs text-ink/45">
                JPG, PNG, WebP ou SVG — max 3MB
              </p>
              <p className="text-xs text-jokko-deep font-medium">
                💡 Le logo sera immédiatement visible sur vos nouvelles
                factures.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Informations de la boutique ── */}
      <div className="rounded-3xl border border-ink/10 bg-paper p-6">
        <h3 className="mb-1 text-lg font-bold text-ink">
          Informations de la boutique
        </h3>
        <p className="mb-5 text-sm text-ink/60">
          Ces informations apparaissent sur vos factures.
          {!isAdmin && (
            <span className="ml-1 text-ink">
              Seul l'administrateur peut modifier ces informations.
            </span>
          )}
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                <Building2 size={14} className="inline mr-1.5 text-ink/45" />
                Nom de la boutique *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko disabled:bg-cream disabled:text-ink/60"
                placeholder="Ex: Boutique Fatou"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                <User size={14} className="inline mr-1.5 text-ink/45" />
                Nom du propriétaire *
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ownerName: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko disabled:bg-cream disabled:text-ink/60"
                placeholder="Ex: Fatou Diallo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                <Phone size={14} className="inline mr-1.5 text-ink/45" />
                Téléphone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko disabled:bg-cream disabled:text-ink/60"
                placeholder="Ex: 77 000 00 00"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                <MapPin size={14} className="inline mr-1.5 text-ink/45" />
                Adresse
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko disabled:bg-cream disabled:text-ink/60"
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>
          </div>

          {/* Email non modifiable */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/75">
              Email (identifiant de connexion)
            </label>
            <input
              type="email"
              value={shop?.email || ""}
              disabled
              className="w-full rounded-xl border border-ink/10 bg-cream px-4 py-3 text-sm text-ink/60"
            />
            <p className="mt-1 text-xs text-ink/45">
              L'email ne peut être modifié que par le Super Administrateur.
            </p>
          </div>

          {isAdmin && (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-jokko px-6 py-3 text-sm font-medium text-white hover:bg-jokko-deep disabled:opacity-60 transition"
            >
              <Save size={15} />
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </button>
          )}
        </form>
      </div>
    </section>
  );
}
