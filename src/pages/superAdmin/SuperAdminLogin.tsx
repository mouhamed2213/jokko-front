import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { loginSuperAdmin } from "../../services/index";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await loginSuperAdmin({ email, password });
      localStorage.setItem("sa_user", res.token);
      toast.success("Connexion Super Admin réussie");
      navigate("/admin/dash"); // Redirect to the admin dashboard
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Identifiants invalides");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Jokko Business"
            className="mb-4 h-16 w-16 rounded-2xl bg-slate-50 p-2 object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-900">
            Super Administration
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Accès réservé à l'administrateur de la plateforme
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="superadmin@jokkobusiness.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {loginLoading ? "Connexion..." : "Accéder au panneau"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          <a href="/login" className="text-emerald-600 hover:underline">
            ← Retour connexion boutique
          </a>
        </p>
      </div>
    </div>
  );
}
