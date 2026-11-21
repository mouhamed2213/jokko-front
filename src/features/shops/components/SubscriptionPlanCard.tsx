import { AlertTriangle, Check, Clock, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUPPORT_EMAIL } from "../../../services";
import type { SubscriptionInfo } from "../../../types/index";

export type SettingsPlan = {
  id: number;
  code: "FREE" | "BASIC" | "PRO" | "PREMIUM";
  name: string;
  maxSalesPerMonth: number | null;
  maxProducts: number | null;
  maxCustomers: number | null;
  maxUsers: number;
  maxStores: number;
};

export type SettingsSubscription = {
  id: number;
  status:
    | "TRIAL"
    | "ACTIVE"
    | "EXPIRED"
    | "TRIAL_EXPIRED"
    | "GRACE_PERIOD"
    | "SUSPENDED";
  startDate: string;
  endDate: string | null;
  plan: SettingsPlan;
};

const PLANS_INFO = [
  {
    code: "FREE",
    name: "Gratuit",
    price: 0,
    color: "slate",
    features: [
      "1 utilisateur · 1 boutique",
      "Jusqu'à 20 produits",
      "Jusqu'à 10 ventes / mois",
      "Clients illimités",
      "Jusqu'à 2 fournisseurs",
      "Caisse, alertes stock & exports PDF / Excel",
    ],
  },
  {
    code: "BASIC",
    name: "Starter",
    price: 6500,
    color: "emerald",
    features: [
      "Tout le forfait Gratuit, plus :",
      "Jusqu'à 3 utilisateurs · 1 boutique",
      "Produits illimités",
      "Ventes illimitées",
      "Clients illimités",
      "Jusqu'à 5 fournisseurs",
    ],
  },
  {
    code: "PRO",
    name: "Pro",
    price: 14000,
    color: "blue",
    features: [
      "Tout le forfait Starter, plus :",
      "Jusqu'à 5 utilisateurs",
      "Jusqu'à 2 boutiques",
      "Fournisseurs illimités",
      "Analytics & rapports avancés",
      "Performance & classement fournisseurs",
    ],
  },
  {
    code: "PREMIUM",
    name: "Signature",
    price: 22000,
    color: "purple",
    features: [
      "Tout le forfait Pro, plus :",
      "Utilisateurs illimités",
      "Jusqu'à 5 boutiques",
      "Vue consolidée multi-boutiques (analytics & CA)",
      "Analyse détaillée des bénéfices (par produit, catégorie & facture)",
      "Suivi consolidé des dettes fournisseurs",
    ],
  },
];

const PLAN_ORDER = ["FREE", "BASIC", "PRO", "PREMIUM"];

function getPlanIndex(code: string) {
  return PLAN_ORDER.indexOf(code);
}

function getDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface SubscriptionPlanCardProps {
  subscription: SettingsSubscription;
  subscriptionInfo?: SubscriptionInfo;
}

export function SubscriptionPlanCard({
  subscription,
  subscriptionInfo,
}: SubscriptionPlanCardProps) {
  const navigate = useNavigate();

  const currentPlan = subscription.plan ?? null;
  const currentPlanCode = currentPlan?.code ?? "FREE";
  const currentPlanIndex = getPlanIndex(currentPlanCode);
  const daysRemaining = getDaysRemaining(subscription.endDate ?? null);
  const isActive = subscription.status === "ACTIVE";
  const isGracePeriod = subscription.status === "GRACE_PERIOD";
  const isExpired = subscription.status === "EXPIRED";
  const isTrialing = subscription.status === "TRIAL";
  const isTrialExpired = subscription.status === "TRIAL_EXPIRED";

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header statut */}
      <div
        className={`px-6 py-4 flex items-center justify-between ${
          isTrialing
            ? "bg-blue-50 border-b border-blue-100"
            : isGracePeriod
              ? "bg-amber-50 border-b border-amber-100"
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
                : isGracePeriod
                  ? "bg-amber-100"
                  : isExpired || isTrialExpired
                    ? "bg-red-100"
                    : "bg-emerald-100"
            }`}
          >
            {isTrialing ? (
              <Clock size={18} className="text-blue-600" />
            ) : isGracePeriod ? (
              <Clock size={18} className="text-amber-700" />
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
                  : isGracePeriod
                    ? "text-amber-800"
                    : isExpired || isTrialExpired
                      ? "text-red-800"
                      : "text-emerald-800"
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
                  ? "text-blue-600"
                  : isGracePeriod
                    ? "text-amber-700"
                    : isExpired || isTrialExpired
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
                  {new Date(subscription.endDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </>
              )}
              {isGracePeriod && (
                <>
                  Votre abonnement est arrivé à échéance. Vous conservez toutes
                  les fonctionnalités jusqu'au{" "}
                  {subscriptionInfo?.gracePeriodEndsAt
                    ? new Date(subscriptionInfo.gracePeriodEndsAt).toLocaleString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "terme de la période de grâce"}{" "}
                  ({subscriptionInfo?.gracePeriodDaysRemaining ?? 0} jour(s)
                  restant(s)).
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

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            currentPlanCode === "FREE"
              ? "bg-slate-100 text-slate-600"
              : currentPlanCode === "BASIC"
                ? "bg-emerald-100 text-emerald-700"
                : currentPlanCode === "PRO"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
          }`}
        >
          {currentPlan?.name ?? "Gratuit"}
        </span>
      </div>

      {isGracePeriod && (
        <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            Pour conserver votre formule {currentPlan?.name}, demandez son
            renouvellement avant la fin de la période de grâce.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/contact?subject=${encodeURIComponent(`Renouvellement du forfait ${currentPlan?.name ?? ""}`)}`,
              )
            }
            className="shrink-0 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Demander le renouvellement
          </button>
        </div>
      )}

      {/* Limites du plan actuel */}
      {currentPlan && (
        <div className="px-6 py-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-slate-100">
          {[
            {
              label: "Utilisateurs",
              value:
                currentPlan.maxUsers === -1 ? "Illimité" : currentPlan.maxUsers,
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
              <p className="text-base font-bold text-slate-900">{item.value}</p>
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
                  plan.code === "BASIC"
                    ? "border-emerald-200 bg-emerald-50"
                    : plan.code === "PRO"
                      ? "border-blue-200 bg-blue-50"
                      : "border-purple-200 bg-purple-50"
                }`}
                onClick={() =>
                  navigate(
                    `/contact?subject=${encodeURIComponent(`Demande d'activation du plan ${plan.name}`)}`,
                  )
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-bold ${
                      plan.code === "BASIC"
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
                      plan.code === "BASIC"
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
                      <Check size={11} className="text-emerald-500 shrink-0" />
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
                    plan.code === "BASIC"
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
            Pour activer votre plan, contactez-nous par téléphone ou par email :{" "}
            <a
              href="tel:+221783333838"
              className="text-emerald-600 font-medium hover:underline"
            >
              +221 78 333 38 38
            </a>{" "}
            ·{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-emerald-600 font-medium hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            ·{" "}
            <a
              href="/contact?subject=Demande%20d%27activation%20d%27un%20abonnement"
              className="text-emerald-600 font-medium hover:underline"
            >
              Formulaire de contact
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
