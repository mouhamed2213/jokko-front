import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logooo.svg";
import { registerShop } from "../services/index";

const emptyForm = {
  shopName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.shopName ||
      !form.ownerName ||
      !form.email ||
      !form.phone ||
      !form.password
    ) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setLoading(true);
    try {
      const res = await registerShop(form);

    //   localStorage.setItem("token", res.token);
    //   localStorage.setItem("user", JSON.stringify(res.user));
    //   localStorage.setItem("shopName", res.user.shopName || form.shopName);

      try {
        const { api } = await import("../services/api");
        const shopRes = await api.get("/shop/settings");
        if (shopRes.data.logoUrl) {
          localStorage.setItem("shopLogo", shopRes.data.logoUrl);
        } else {
          localStorage.removeItem("shopLogo");
        }
      } catch {
        /* pas grave si ça échoue */
      }

      toast.success("Compte créé avec succès");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Une erreur est survenue",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 p-2">
            <img
              src={logo}
              alt="Jokko Business"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Créer votre compte
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Démarrez la gestion de votre boutique en quelques minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nom de la boutique *
              </label>
              <input
                type="text"
                placeholder="Ex: Boutique Sandaga"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nom du propriétaire *
              </label>
              <input
                type="text"
                placeholder="Prénom Nom"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email (identifiant) *
              </label>
              <input
                type="email"
                placeholder="admin@boutique.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                type="tel"
                placeholder="77 000 00 00"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                type="text"
                placeholder="Quartier, Ville"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mot de passe admin *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}