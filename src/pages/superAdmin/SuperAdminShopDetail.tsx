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
} from "lucide-react";
import { getShopDetail } from "../../services";

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
  primaryShop: { id: number; name: string } | null;
  secondaryShops: { id: number; name: string; status: string }[];
  subscription: {
    id: number;
    status: string;
    startDate: string;
    endDate: string | null;
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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getShopDetail(Number(id))
      .then(setShop)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

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
            shop.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
          }`}
        >
          {shop.status}
        </span>
      </div>

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
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Crown size={15} /> Abonnement
            </h3>
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
                    {shop.subscription.status}
                  </span>
                </div>
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
                      Ventes/mois: <span className="font-medium text-slate-700">{shop.subscription.plan.limits.sales ?? "∞"}</span>
                    </p>
                    <p className="text-gray-500">
                      Produits: <span className="font-medium text-slate-700">{shop.subscription.plan.limits.products ?? "∞"}</span>
                    </p>
                    <p className="text-gray-500">
                      Clients: <span className="font-medium text-slate-700">{shop.subscription.plan.limits.customers ?? "∞"}</span>
                    </p>
                    <p className="text-gray-500">
                      Utilisateurs: <span className="font-medium text-slate-700">{shop.subscription.plan.limits.users ?? "∞"}</span>
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
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5"
                >
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
                      <th className="pb-2">Date</th>
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
                        <td className="py-2 text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR")}
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
    </div>
  );
}