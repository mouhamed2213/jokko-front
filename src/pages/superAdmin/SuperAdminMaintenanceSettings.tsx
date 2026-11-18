import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2, Save, ShieldCheck } from "lucide-react";
import { getMaintenanceStatus, updateMaintenanceSettings, type MaintenanceStatus } from "../../services";

export default function SuperAdminMaintenanceSettings() {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMaintenanceStatus()
      .then((data) => {
        setStatus(data);
        setEnabled(data.enabled);
        setMessage(data.message);
      })
      .catch(() => toast.error("Impossible de charger les paramètres de maintenance."))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const result = await updateMaintenanceSettings({ enabled, message });
      setStatus(result);
      setEnabled(result.enabled);
      setMessage(result.message);
      toast.success("Paramètres de maintenance enregistrés.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible d'enregistrer les paramètres.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 p-6 text-sm text-ink/60"><Loader2 className="animate-spin" size={18} /> Chargement des paramètres...</div>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mt-1 text-sm text-ink/60">Rendez temporairement la plateforme inaccessible aux utilisateurs pendant une intervention.</p>
      </div>

      <div className={`rounded-2xl border p-5 ${enabled ? "border-sun/50 bg-sun/20" : "border-jokko/25 bg-jokko/10"}`}>
        <div className="flex items-start gap-3">
          {enabled ? <AlertTriangle className="mt-0.5 text-ink" /> : <ShieldCheck className="mt-0.5 text-jokko-deep" />}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">{enabled ? "Maintenance activée" : "Plateforme opérationnelle"}</p>
            <p className="mt-1 text-sm text-ink/70">{enabled ? "Les utilisateurs classiques ne pourront plus accéder aux fonctionnalités de la plateforme." : "Les utilisateurs peuvent accéder normalement à la plateforme."}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? "bg-sun/50 text-ink" : "bg-jokko/25 text-jokko-deep"}`}>{enabled ? "Activée" : "Désactivée"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm space-y-5">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-semibold text-ink">Activer le mode maintenance</span>
            <span className="mt-1 block text-sm text-ink/60">Le changement est appliqué aux API dès son enregistrement.</span>
          </span>
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-5 w-5 accent-slate-900" />
        </label>

        <label className="block text-sm font-medium text-ink/75">
          Message affiché aux visiteurs
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-slate-500" placeholder="Expliquez brièvement l'indisponibilité..." />
          <span className="mt-1 block text-right text-xs text-ink/45">{message.length}/1000</span>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <p className="text-xs text-ink/60">Le back-office Super Admin reste accessible.</p>
          <button type="button" onClick={save} disabled={saving || !message.trim()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Enregistrer
          </button>
        </div>
      </div>
      {status?.updatedAt && <p className="text-xs text-ink/45">Dernière modification : {new Date(status.updatedAt).toLocaleString("fr-FR").replace(/\u202f/g, " ")}</p>}
    </section>
  );
}
