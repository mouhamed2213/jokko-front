import { Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { upgradeFeatures, type UpgradeFeature } from "../utils/upgradeFeaturesData";

interface UpgradeModalProps {
  feature: UpgradeFeature;
  onClose: () => void;
}

export function UpgradeModal({
  feature,
  onClose,
}: UpgradeModalProps) {
  const data = upgradeFeatures[feature];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Lock size={24} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {data.title}
          </h2>

          <p className="mt-2 text-sm text-slate-500 whitespace-pre-line">
            {data.description}
          </p>
        </div>

        {/* Plan */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Disponible avec
          </p>

          <p className="mt-1 font-semibold text-emerald-600">
            {data.requiredPlan}
          </p>

          <ul className="mt-4 space-y-3">
            {data.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <Check
                  size={16}
                  className="text-emerald-600 shrink-0"
                />

                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 text-black"
          >
            Plus tard
          </button>

          <Link
            to={data.redirect}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {data.cta}
          </Link>

        </div>

      </div>
    </div>
  );
}


// Fcontion to show modal on component
  export const showModal = (modalSate: boolean,  onClose :  () => void ,  feature: UpgradeFeature) => {
    if (modalSate) {
      return (
        <>
          <UpgradeModal
            feature={feature}
            onClose={onClose}
          />
        </>
      );
    }
  };
