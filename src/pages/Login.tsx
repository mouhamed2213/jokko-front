import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { login } from "../services/index";
import AuthShell from "../components/public/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("shopName", res.user.shopName || "Jokko Business");

      // Charger le logo de la boutique après connexion
      try {
        const shopRes = await api.get("/shop/settings");
        if (shopRes.data.logoUrl) {
          localStorage.setItem("shopLogo", shopRes.data.logoUrl);
        } else {
          localStorage.removeItem("shopLogo");
        }
      } catch { /* pas grave si ça échoue */ }

      toast.success("Connexion réussie");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };


  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Connexion</h1>
          <p className="mt-2 text-sm text-gray-500">Connectez-vous à votre espace de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="admin@boutique.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-jokko/100 focus:ring-2 focus:ring-jokko/15"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-jokko/100 focus:ring-2 focus:ring-jokko/15"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-jokko py-3 text-sm font-medium text-white transition hover:bg-jokko-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm"><Link to="/forgot-password" className="font-medium text-jokko hover:underline">Mot de passe oublié ?</Link></p>

        <p className="mt-6 text-center text-xs text-gray-400">
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            className="font-semibold text-jokko hover:underline"
          >
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}