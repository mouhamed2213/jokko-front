// pages/superAdmin/SuperAdminOwnerDetail.tsx
import { AlertTriangle, ArrowLeft, Info, Loader2, Mail, Phone, Store } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { getOwnerDetail } from "../../services";
import type { OwnerAlert, OwnerDetail, OwnerShop, UsageItem } from "../../types/owner";

const money = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");

const alertStyle: Record<OwnerAlert["level"], string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-sun/50 bg-sun/20 text-ink",
  info: "border-ink/10 bg-cream text-ink/70",
};

function AlertChip({ alert }: { alert: OwnerAlert }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${alertStyle[alert.level]}`}>
      {alert.level === "info" ? <Info size={12} /> : <AlertTriangle size={12} />}
      {alert.message}
    </span>
  );
}

function UsageBar({ item }: { item: UsageItem }) {
  const pct = item.percent ?? 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-sun" : "bg-jokko/100";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-ink/60">{item.label}</span>
        <span className="font-medium text-ink/75">
          {item.used} / {item.limit ?? "∞"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/5">
        {item.limit !== null && (
          <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="rounded-xl bg-cream px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-ink/45">{label}</p>
      <p className={`text-sm font-semibold ${danger ? "text-red-600" : "text-ink/80"}`}>{value}</p>
    </div>
  );
}

function ShopCard({ shop, onOpen }: { shop: OwnerShop; onOpen: () => void }) {
  const archived = shop.status === "ARCHIVED";
  const parentArchived = shop.primaryShop?.status === "ARCHIVED";
  const unavailable = archived || parentArchived;
  const s = shop.stats;
  return (
    <div className={`rounded-3xl border border-ink/10 bg-paper p-5 ${unavailable ? "opacity-70" : ""}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Store size={16} className="text-jokko" />
        <h3 className="font-bold text-ink">{shop.name}</h3>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/70">
          {shop.isPrimary ? "Principale" : "Secondaire"}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            archived
              ? "bg-red-50 text-red-600"
              : parentArchived
                ? "bg-sun/20 text-ink"
                : "bg-jokko/10 text-jokko"
          }`}
        >
          {archived ? "ARCHIVÉE" : parentArchived ? "BLOQUÉE PAR LA PRINCIPALE" : shop.status}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="ml-auto rounded-full border border-ink/10 px-3 py-1 text-xs font-medium text-ink/75 hover:bg-ink/5"
        >
          Voir la boutique
        </button>
      </div>

      <p className="mb-3 text-xs text-ink/60">
        {shop.subscription
          ? `Plan ${shop.subscription.plan.name} · ${shop.subscription.status} · fin ${date(shop.subscription.endDate)}${
              shop.subscription.daysRemaining !== null ? ` (${shop.subscription.daysRemaining} j)` : ""
            }`
          : "Aucun abonnement"}
        {shop.subscriptionInherited && shop.primaryShop
          ? ` · Abonnement hérité de ${shop.primaryShop.name}`
          : ""}
        {" · "}Dernière activité : {date(s.lastActivityAt)}
        {" · "}Caisse {s.cashOpen ? "ouverte" : "fermée"}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="CA 30 jours" value={money(s.sales30d.revenue)} />
        <Stat label="Ventes 30 jours" value={s.sales30d.count} />
        <Stat label="CA total" value={money(s.salesTotal.revenue)} />
        <Stat label="Impayés clients" value={money(s.unpaidAmount)} danger={s.unpaidAmount > 0} />
        <Stat label="Dettes fournisseurs" value={money(s.supplierDebtRemaining)} danger={s.supplierDebtRemaining > 0} />
        <Stat label="Stock bas" value={s.lowStockCount} danger={s.lowStockCount > 0} />
      </div>

      {shop.usage.length > 0 && !unavailable && (
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          {shop.usage.map((u) => (
            <UsageBar key={u.key} item={u} />
          ))}
        </div>
      )}

      {shop.alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shop.alerts.map((a) => (
            <AlertChip key={a.code} alert={a} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SuperAdminOwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<OwnerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOwnerDetail(Number(id))
      .then(setData)
      .catch((e) => {
        toast.error(e?.response?.data?.message || "Propriétaire introuvable");
        navigate("/admin/owners");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-ink/45">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  const { owner, totals, storesUsage, shops, diagnostics } = data;
  const hasDiagnosticAnomaly = diagnostics.some((item) => item.level !== "info");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/owners")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-paper shadow-sm hover:bg-ink/5"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-ink">{owner.name}</h2>
          <p className="flex flex-wrap items-center gap-3 text-xs text-ink/60">
            <span className="inline-flex items-center gap-1"><Mail size={12} />{owner.email}</span>
            {owner.phone && <span className="inline-flex items-center gap-1"><Phone size={12} />{owner.phone}</span>}
            <span>Client depuis le {date(owner.createdAt)}</span>
          </p>
        </div>
      </div>

      {diagnostics.length > 0 && (
        <div className={`space-y-2 rounded-2xl border p-4 ${hasDiagnosticAnomaly ? "border-red-200 bg-red-50" : "border-ink/10 bg-cream"}`}>
          <p className={`flex items-center gap-2 text-sm font-semibold ${hasDiagnosticAnomaly ? "text-red-800" : "text-ink/75"}`}>
            {hasDiagnosticAnomaly ? <AlertTriangle size={16} /> : <Info size={16} />}
            {hasDiagnosticAnomaly ? "Anomalies de données détectées" : "Informations sur les données historiques"}
          </p>
          {diagnostics.map((d) => (
            <p key={d.code + d.message} className={`text-sm ${d.level === "info" ? "text-ink/70" : "text-red-700"}`}>• {d.message}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Boutiques (actives / archivées)" value={`${totals.activeShops} / ${totals.archivedShops}`} />
        <Stat label="CA 30 jours (réseau)" value={money(totals.revenue30d)} />
        <Stat label="CA total (réseau)" value={money(totals.revenueTotal)} />
        <Stat label="Alertes actives" value={totals.alertsCount} danger={totals.alertsCount > 0} />
        <Stat label="Impayés clients" value={money(totals.unpaidAmount)} danger={totals.unpaidAmount > 0} />
        <Stat label="Dettes fournisseurs" value={money(totals.supplierDebtRemaining)} danger={totals.supplierDebtRemaining > 0} />
        <Stat label="Utilisateurs" value={totals.users} />
        <Stat label="Produits" value={totals.products} />
      </div>

      <div className="rounded-3xl border border-ink/10 bg-paper p-5">
        <UsageBar item={storesUsage} />
        <p className="mt-2 text-xs text-ink/45">
          Limite du plan de la boutique principale pour les boutiques secondaires actives.
        </p>
      </div>

      <div className="space-y-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} onOpen={() => navigate(`/admin/shops/${shop.id}`)} />
        ))}
      </div>
    </div>
  );
}
