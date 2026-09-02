import { useEffect, useRef, useState } from "react";
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

type Plan = {
  id: number;
  code: "FREE" | "STARTER" | "PRO" | "PREMIUM";
  name: string;
  maxSalesPerMonth: number | null;
  maxProducts: number | null;
  maxCustomers: number | null;
  maxUsers: number;
  maxStores: number;
};

type Subscription = {
  id: number;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "TRIAL_EXPIRED";
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
    features: ["1 utilisateur", "50 produits", "90 ventes/mois", "50 clients"],
  },
  {
    code: "STARTER",
    name: "Starter",
    price: 6500,
    color: "emerald",
    features: [
      "2 utilisateurs",
      "Produits illimités",
      "Ventes illimitées",
      "Clients illimités",
      "Factures PDF A4",
      "Export Excel",
      "Alertes stock",
    ],
  },
  {
    code: "PRO",
    name: "Pro",
    price: 14000,
    color: "blue",
    features: [
      "5 utilisateurs",
      "Tout Starter inclus",
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

const PLAN_ORDER = ["FREE", "STARTER", "PRO", "PREMIUM"];

function getPlanIndex(code: string) {
  return PLAN_ORDER.indexOf(code);
}

function getDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Settings() {
  const user = getStoredUser();
  const isAdmin = user?.role === "ADMIN";

  const [shop, setShop] = useState<ShopInfo | null>(null);
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
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );
  // const cSubs = shop?.subscriptions?.[0];
  // // const testSubsStatut = { ...cSubs, status: "TRIAL_EXPIRED" };
  // // const subscription = testSubsStatut;

  const subscription = shop?.subscriptions?.[0] ?? null;

  const currentPlan = subscription?.plan ?? null;
  const currentPlanCode = currentPlan?.code ?? "FREE";
  const currentPlanIndex = getPlanIndex(currentPlanCode);
  const daysRemaining = getDaysRemaining(subscription?.endDate ?? null);
  const isActive = subscription?.status === "ACTIVE"; // current active subscription
  const isExpired = subscription?.status === "EXPIRED"; // cureent subscription EXPIRED
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
            className="rounded-2xl bg-white p-4 shadow-sm text-center"
          >
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Bloc abonnement actuel ── */}
      {subscription && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Header statut */}
          <div
            className={`px-6 py-4 flex items-center justify-between ${
              isTrialing
                ? "bg-blue-50 border-b border-blue-100"
                : isExpired || isTrialExpired 
                  ? "bg-red-50 border-b border-red-100"
                  : "bg-emerald-50 border-b border-emerald-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isTrialing
                    ? "bg-blue-100"
                    : (isExpired || isTrialExpired) 
                      ? "bg-red-100"
                      : "bg-emerald-100"
                }`}
              >
                {isTrialing ? (
                  <Clock size={18} className="text-blue-600" />
                ) : isExpired || isTrialExpired ? (
                  <AlertTriangle size={18} className="text-red-600" />
                ) : (
                  <Zap size={18} className="text-emerald-600" />
                )}
              </div>
              <div>
                <p
                  className={`font-semibold text-sm ${
                    isTrialing
                      ? "text-blue-800"
                      : (isExpired || isTrialExpired)
                        ? "text-red-800"
                        : "text-emerald-800"
                  }`}
                >
                  Plan {currentPlan?.name ?? "Gratuit"}
                  {isTrialing && " — Période d'essai"}
                  {isActive && " — Actif"}
                  {isExpired && " — Expiré"}
                  {isTrialExpired && " — Fin période d'essai"}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isTrialing
                      ? "text-blue-600"
                      : (isExpired || isTrialExpired)
                        ? "text-red-600"
                        : "text-emerald-600"
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
                  ? "bg-slate-100 text-slate-600"
                  : currentPlanCode === "STARTER"
                    ? "bg-emerald-100 text-emerald-700"
                    : currentPlanCode === "PRO"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
              }`}
            >
              {currentPlan?.name ?? "Gratuit"}
            </span>
          </div>

          {/* Limites du plan actuel */}
          {currentPlan && (
            <div className="px-6 py-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-slate-100">
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
                  <p className="text-base font-bold text-slate-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA upgrade si pas Premium */}
          {currentPlanCode !== "PREMIUM" && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
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
                      plan.code === "STARTER"
                        ? "border-emerald-200 bg-emerald-50"
                        : plan.code === "PRO"
                          ? "border-blue-200 bg-blue-50"
                          : "border-purple-200 bg-purple-50"
                    }`}
                    onClick={() =>
                      toast(
                        "Contactez-nous au +221 78 333 38 38 pour activer ce plan",
                        {
                          icon: "📞",
                        },
                      )
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-bold ${
                          plan.code === "STARTER"
                            ? "text-emerald-700"
                            : plan.code === "PRO"
                              ? "text-blue-700"
                              : "text-purple-700"
                        }`}
                      >
                        {plan.name}
                      </span>
                      <Crown
                        size={14}
                        className={
                          plan.code === "STARTER"
                            ? "text-emerald-500"
                            : plan.code === "PRO"
                              ? "text-blue-500"
                              : "text-purple-500"
                        }
                      />
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {plan.price.toLocaleString("fr-FR")}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        FCFA/mois
                      </span>
                    </p>
                    <ul className="mt-2 space-y-1">
                      {plan.features.slice(0, 3).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-1.5 text-xs text-slate-600"
                        >
                          <Check
                            size={11}
                            className="text-emerald-500 shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-slate-400">
                          +{plan.features.length - 3} autres...
                        </li>
                      )}
                    </ul>
                    <button
                      className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold transition ${
                        plan.code === "STARTER"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : plan.code === "PRO"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      Passer au {plan.name}
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center">
                📞 Contactez-nous au{" "}
                <a
                  href="tel:+221783333838"
                  className="text-emerald-600 font-medium hover:underline"
                >
                  +221 78 333 38 38
                </a>{" "}
                pour activer votre plan
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Logo de la boutique ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-slate-900">
          Logo de la boutique
        </h3>
        <p className="mb-5 text-sm text-gray-500">
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
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-dashed border-gray-300 bg-gray-50 hover:border-emerald-400"
              }`}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo boutique"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <Building2 size={28} />
                <span className="text-xs text-center px-1">Pas de logo</span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
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
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Supprimer le logo
                </button>
              )}

              <p className="text-xs text-gray-400">
                JPG, PNG, WebP ou SVG — max 3MB
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                💡 Le logo sera immédiatement visible sur vos nouvelles
                factures.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Informations de la boutique ── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-slate-900">
          Informations de la boutique
        </h3>
        <p className="mb-5 text-sm text-gray-500">
          Ces informations apparaissent sur vos factures.
          {!isAdmin && (
            <span className="ml-1 text-orange-500">
              Seul l'administrateur peut modifier ces informations.
            </span>
          )}
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Building2 size={14} className="inline mr-1.5 text-gray-400" />
                Nom de la boutique *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex: Boutique Fatou"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <User size={14} className="inline mr-1.5 text-gray-400" />
                Nom du propriétaire *
              </label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ownerName: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex: Fatou Diallo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Phone size={14} className="inline mr-1.5 text-gray-400" />
                Téléphone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex: 77 000 00 00"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <MapPin size={14} className="inline mr-1.5 text-gray-400" />
                Adresse
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                disabled={!isAdmin}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>
          </div>

          {/* Email non modifiable */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email (identifiant de connexion)
            </label>
            <input
              type="email"
              value={shop?.email || ""}
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              L'email ne peut être modifié que par le Super Administrateur.
            </p>
          </div>

          {isAdmin && (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
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
