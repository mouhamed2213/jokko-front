import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { acceptSuperAdminInvitation } from "../services";

export default function AcceptSuperAdminInvitation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      toast.error("Le lien d'invitation est incomplet.");
      return;
    }
    if (password.length < 12) {
      toast.error("Le mot de passe doit contenir au moins 12 caractères.");
      return;
    }
    if (password !== confirmation) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await acceptSuperAdminInvitation({ token, password });
      setAccepted(true);
      toast.success("Votre compte Super Admin est activé.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de valider cette invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (accepted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12">
        <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><ShieldCheck size={28} /></div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Compte activé</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Votre invitation a été acceptée. Vous pouvez maintenant vous connecter à l'espace Super Admin.</p>
          <button type="button" onClick={() => navigate("/super-admin/login", { replace: true })} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">Accéder à la connexion</button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800"><ShieldCheck size={24} /></div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Activer votre compte</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choisissez un mot de passe sécurisé pour rejoindre l'équipe d'administration de Jokko Business.</p>
        {!token ? (
          <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Le lien d'invitation est invalide ou incomplet. Demandez une nouvelle invitation à un Super Admin.</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Mot de passe
              <div className="relative mt-1.5">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" className="w-full rounded-xl border border-slate-300 px-3 py-3 pr-11 outline-none focus:border-slate-500" placeholder="12 caractères minimum" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 px-3 text-slate-400" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            <label className="block text-sm font-medium text-slate-700">Confirmer le mot de passe
              <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={12} maxLength={128} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-slate-500" placeholder="Saisissez à nouveau le mot de passe" />
            </label>
            <p className="text-xs text-slate-500">Ce lien est à usage unique et expire après 48 heures.</p>
            <button type="submit" disabled={submitting || password.length < 12 || password !== confirmation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              {submitting && <Loader2 size={16} className="animate-spin" />} Activer mon compte
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500"><Link to="/super-admin/login" className="font-medium text-slate-800 hover:underline">Retour à la connexion</Link></p>
      </section>
    </main>
  );
}
