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
    return <div className="flex h-64 items-center justify-center text-sm text-ink/45">Chargement des paramètres...</div>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mt-1 text-sm text-ink/60">
          Définissez le délai pendant lequel une boutique conserve toutes les fonctionnalités de son forfait après expiration.
        </p>
      </div>

      <div className="rounded-3xl border border-ink/10 bg-paper p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-sun/20 p-3 text-ink">
            <Clock size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-ink">Durée supplémentaire</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              À l'expiration d'un abonnement payant ou d'une période d'essai, le propriétaire et les responsables des boutiques secondaires conservent les droits du forfait pendant cette durée. À son terme, la boutique principale passe au forfait gratuit. Une durée déjà attribuée à une période de grâce en cours reste inchangée ; ce réglage s'applique aux prochaines expirations.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-sm">
          <label htmlFor="grace-days" className="mb-2 block text-sm font-medium text-ink/75">
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
              className="w-32 rounded-xl border border-ink/20 px-4 py-3 text-lg font-semibold text-ink outline-none focus:border-jokko/100 focus:ring-2 focus:ring-jokko/15"
            />
            <span className="text-sm text-ink/60">jour(s)</span>
          </div>
          <p className="mt-2 text-xs text-ink/60">
            Valeur par défaut : {defaultDays} jours si aucun paramètre n'est encore enregistré. Maximum : {maxDays} jours.
          </p>
          {Number(days) === 0 && (
            <p className="mt-2 rounded-lg bg-sun/20 px-3 py-2 text-xs text-ink">
              La période de grâce sera désactivée : le passage à gratuit se fera dès l'expiration.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-ink/10 pt-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </section>
  );
}
