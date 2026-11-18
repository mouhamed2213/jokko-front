import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  changeAccountPassword,
  changeSuperAdminPassword,
  getAccountEmailStatus,
  getSuperAdminEmailStatus,
  requestAccountEmailChange,
  requestSuperAdminEmailChange,
  type AccountEmailStatus,
} from "../services";

type Props = { mode?: "shop" | "superadmin" };

export default function AccountSecurity({ mode = "shop" }: Props) {
  const isSuperAdmin = mode === "superadmin";
  const [emailStatus, setEmailStatus] = useState<AccountEmailStatus | null>(null);
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const loadStatus = isSuperAdmin ? getSuperAdminEmailStatus : getAccountEmailStatus;
    loadStatus().then(setEmailStatus).catch(() => undefined);
  }, [isSuperAdmin]);

  const submitEmailChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailLoading(true);
    try {
      const changeEmail = isSuperAdmin ? requestSuperAdminEmailChange : requestAccountEmailChange;
      const result = await changeEmail({ currentPassword: emailPassword, newEmail });
      toast.success(result.message);
      setEmailPassword("");
      setNewEmail("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de demander le changement d'adresse.");
    } finally {
      setEmailLoading(false);
    }
  };

  const submitPasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setPasswordLoading(true);
    try {
      const changePassword = isSuperAdmin ? changeSuperAdminPassword : changeAccountPassword;
      const result = await changePassword({ currentPassword, newPassword });
      toast.success(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de modifier le mot de passe.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sécurité du compte</h1>
        <p className="mt-1 text-sm text-slate-500">Gérez votre adresse email de connexion et votre mot de passe.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Adresse email</h2>
        {emailStatus && (
          <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-800">{emailStatus.email}</p>
            <p className={emailStatus.emailVerifiedAt ? "mt-1 text-emerald-700" : "mt-1 text-amber-700"}>
              {emailStatus.emailVerifiedAt ? "Adresse vérifiée" : "Adresse non vérifiée"}
            </p>
          </div>
        )}
        <p className="mt-3 text-sm text-slate-500">
          La nouvelle adresse ne remplacera l'actuelle qu'après confirmation depuis le lien envoyé à cette nouvelle adresse.
        </p>
        <form onSubmit={submitEmailChange} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Nouvelle adresse email
            <input type="email" required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="email" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Mot de passe actuel
            <input type="password" required value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="current-password" />
          </label>
          <div className="sm:col-span-2">
            <button disabled={emailLoading} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {emailLoading ? "Envoi..." : "Demander le changement d'email"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Mot de passe</h2>
        <p className="mt-2 text-sm text-slate-500">Une notification de sécurité sera envoyée à votre adresse email après modification.</p>
        <form onSubmit={submitPasswordChange} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe actuel
            <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="current-password" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Nouveau mot de passe
              <input type="password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="new-password" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirmer le nouveau mot de passe
              <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="new-password" />
            </label>
          </div>
          <button disabled={passwordLoading} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </form>
      </section>
    </div>
  );
}
