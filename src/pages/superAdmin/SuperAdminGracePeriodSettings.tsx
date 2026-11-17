import { useEffect, useState } from "react";
import { Clock, Save } from "lucide-react";
import toast from "react-hot-toast";
import {
  getSubscriptionGracePeriod,
  updateSubscriptionGracePeriod,
} from "../../services";

export default function SuperAdminGracePeriodSettings() {
  const [days, setDays] = useState("5");
  const [defaultDays, setDefaultDays] = useState(5);
  const [maxDays, setMaxDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSubscriptionGracePeriod()
      .then((settings) => {
        setDays(String(settings.days));
        setDefaultDays(settings.defaultDays);
        setMaxDays(settings.maxDays);
      })
      .catch((error: any) => {
        toast.error(error?.response?.data?.message || "Impossible de charger le paramètre.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (days.trim() === "") {
      toast.error("Saisissez une durée en jours.");
      return;
    }
    const value = Number(days);
    if (!Number.isInteger(value) || value < 0 || value > maxDays) {
      toast.error(`Saisissez un nombre entier entre 0 et ${maxDays}.`);
      return;
    }

    setSaving(true);
    try {
      const result = await updateSubscriptionGracePeriod(value);
      setDays(String(result.days));
      toast.success("Durée de grâce enregistrée.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible d'enregistrer le paramètre.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Chargement des paramètres...</div>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Période de grâce des abonnements</h1>
        <p className="mt-1 text-sm text-slate-500">
          Définissez le délai pendant lequel une boutique conserve toutes les fonctionnalités de son forfait après expiration.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
            <Clock size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Durée supplémentaire</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              À l'expiration d'un abonnement payant ou d'une période d'essai, le propriétaire et les responsables des boutiques secondaires conservent les droits du forfait pendant cette durée. À son terme, la boutique principale passe au forfait gratuit. Une durée déjà attribuée à une période de grâce en cours reste inchangée ; ce réglage s'applique aux prochaines expirations.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-sm">
          <label htmlFor="grace-days" className="mb-2 block text-sm font-medium text-slate-700">
            Nombre de jours de grâce
          </label>
          <div className="flex items-center gap-3">
            <input
              id="grace-days"
              type="number"
              min={0}
              max={maxDays}
              step={1}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className="w-32 rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            <span className="text-sm text-slate-500">jour(s)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Valeur par défaut : {defaultDays} jours si aucun paramètre n'est encore enregistré. Maximum : {maxDays} jours.
          </p>
          {Number(days) === 0 && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              La période de grâce sera désactivée : le passage à gratuit se fera dès l'expiration.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </section>
  );
}
