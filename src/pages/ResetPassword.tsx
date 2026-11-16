import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("Le lien de réinitialisation est incomplet.");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmation) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("sa_user");
      setDone(true);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>
        {done ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-emerald-700">Votre mot de passe a été modifié. Vous pouvez vous connecter.</p>
            <Link to="/login" className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Se connecter</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Nouveau mot de passe
              <input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Confirmer le mot de passe
              <input type="password" minLength={8} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <button disabled={loading || !token} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Modification..." : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm"><Link to="/login" className="font-medium text-emerald-700 hover:underline">Retour à la connexion</Link></p>
      </div>
    </div>
  );
}
