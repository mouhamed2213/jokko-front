import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setSubmitted(true);
      toast.success(result.message);
    } catch {
      toast.error("Impossible de traiter la demande pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
        <p className="mt-2 text-sm text-slate-500">
          Indiquez l'adresse email associée à votre compte. Si elle existe, vous recevrez un lien de réinitialisation.
        </p>
        {submitted ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Si cette adresse correspond à un compte, un email de réinitialisation sera envoyé.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Adresse email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="vous@exemple.com"
              />
            </label>
            <button disabled={loading} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Envoi..." : "Recevoir le lien"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
