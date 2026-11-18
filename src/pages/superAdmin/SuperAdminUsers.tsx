import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { useSuperAdmin } from "../../hooks/useSuperAdmin";
import { Loader2, MailPlus, RefreshCw, ShieldCheck, ShieldOff, UserPlus, Users } from "lucide-react";
import {
  getSuperAdmins,
  inviteSuperAdmin,
  resendSuperAdminInvitation,
  setSuperAdminStatus,
  type SuperAdminAccount,
} from "../../services";

const statusLabels: Record<SuperAdminAccount["status"], string> = {
  ACTIVE: "Actif",
  PENDING: "Invitation en attente",
  DISABLED: "Désactivé",
  INVITATION_EXPIRED: "Invitation expirée",
};

const statusClasses: Record<SuperAdminAccount["status"], string> = {
  ACTIVE: "bg-jokko/10 text-jokko-deep",
  PENDING: "bg-sun/20 text-ink",
  DISABLED: "bg-ink/5 text-ink/70",
  INVITATION_EXPIRED: "bg-red-50 text-red-700",
};

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function SuperAdminUsers() {
  const currentAdmin = useSuperAdmin();
  const [admins, setAdmins] = useState<SuperAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [changingId, setChangingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loadAdmins = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      setAdmins(await getSuperAdmins());
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de charger les administrateurs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadAdmins(); }, [loadAdmins]);

  const submitInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await inviteSuperAdmin({ name: name.trim(), email: email.trim() });
      toast.success("Invitation envoyée par email.");
      setName("");
      setEmail("");
      setShowForm(false);
      await loadAdmins(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible d'envoyer l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async (admin: SuperAdminAccount) => {
    setChangingId(admin.id);
    try {
      await resendSuperAdminInvitation(admin.id);
      toast.success(`Nouvelle invitation envoyée à ${admin.email}.`);
      await loadAdmins(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de renvoyer l'invitation.");
    } finally {
      setChangingId(null);
    }
  };

  const toggleStatus = async (admin: SuperAdminAccount) => {
    const enabled = !admin.isActive;
    const action = enabled ? "réactiver" : "désactiver";
    if (!window.confirm(`Voulez-vous vraiment ${action} le compte de ${admin.name} ?`)) return;
    setChangingId(admin.id);
    try {
      await setSuperAdminStatus(admin.id, enabled);
      toast.success(enabled ? "Compte réactivé." : "Compte désactivé.");
      await loadAdmins(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de modifier ce compte.");
    } finally {
      setChangingId(null);
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-ink/60">Gérez les accès à l'administration de Jokko Business.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void loadAdmins(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2.5 text-sm font-medium text-ink/75 hover:bg-cream">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Actualiser
          </button>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            <UserPlus size={16} /> Ajouter un administrateur
          </button>
        </div>
      </header>

      {showForm && (
        <form onSubmit={submitInvitation} className="rounded-2xl border border-ink/10 bg-paper p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MailPlus className="text-ink/70" size={19} />
            <h2 className="font-semibold text-ink">Inviter un Super Admin</h2>
          </div>
          <p className="mb-4 text-sm text-ink/60">Un lien sécurisé sera envoyé. Le destinataire choisira son propre mot de passe. L'invitation expire après 48 heures.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink/75">Nom complet
              <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-ink/20 px-3 py-2.5 outline-none focus:border-slate-500" placeholder="Nom de l'administrateur" />
            </label>
            <label className="text-sm font-medium text-ink/75">Adresse email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-ink/20 px-3 py-2.5 outline-none focus:border-slate-500" placeholder="admin@exemple.com" />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-medium text-ink/70">Annuler</button>
            <button type="submit" disabled={submitting || name.trim().length < 2 || !email.trim()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <MailPlus size={16} />} Envoyer l'invitation
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-ink/10 bg-paper shadow-sm">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div className="flex items-center gap-2 font-semibold text-ink"><Users size={18} /> Administrateurs ({admins.length})</div>
          <span className="text-xs text-ink/60">Comptes distincts des utilisateurs des boutiques</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-ink/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink/60">Aucun administrateur trouvé.</div>
        ) : (
          <div className="divide-y divide-ink/10">
            {admins.map((admin) => (
              <article key={admin.id} className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{admin.name}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[admin.status]}`}>{statusLabels[admin.status]}</span>
                  </div>
                  <p className="mt-1 break-all text-sm text-ink/70">{admin.email}</p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink/45">
                    <span>Créé le {formatDate(admin.createdAt)}</span>
                    <span>Dernière connexion : {formatDate(admin.lastLoginAt)}</span>
                    <span>Email vérifié : {admin.emailVerifiedAt ? "Oui" : "Non"}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(admin.status === "PENDING" || admin.status === "INVITATION_EXPIRED") && (
                    <button type="button" onClick={() => void resend(admin)} disabled={changingId === admin.id} className="inline-flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm font-medium text-ink/75 hover:bg-cream disabled:opacity-50">
                      {changingId === admin.id ? <Loader2 size={15} className="animate-spin" /> : <MailPlus size={15} />} Renvoyer l'invitation
                    </button>
                  )}
                  {admin.emailVerifiedAt && admin.id !== currentAdmin?.id && (
                    <button type="button" onClick={() => void toggleStatus(admin)} disabled={changingId === admin.id} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50 ${admin.isActive ? "border-red-200 text-red-700 hover:bg-red-50" : "border-jokko/25 text-jokko-deep hover:bg-jokko/10"}`}>
                      {changingId === admin.id ? <Loader2 size={15} className="animate-spin" /> : admin.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                      {admin.isActive ? "Désactiver" : "Réactiver"}
                    </button>
                  )}
                  {admin.id === currentAdmin?.id && <span className="self-center text-xs text-ink/45">Votre compte</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
