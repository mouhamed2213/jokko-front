import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logooo.svg";
import { registerShop } from "../services/index";
import type { PlanCode } from "../types";

const SENEGAL_REGIONS = [
  "Dakar",
  "Thiès",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Ziguinchor",
];

const emptyForm = {
  shopName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  adminPassword: "",
  confirmPassword: "", // Nouveau champ
  currentShop: "PRIMARY",
  planType: "FREE",
};

interface FormErrors {
  shopName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  adminPassword?: string;
  confirmPassword?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [queryParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>("FREE");

  // États de contrôle pour l'affichage des mots de passe
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dictionnaire d'erreurs par champ
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const localErrors: FormErrors = {};

    // Validation Shop Name
    if (!form.shopName.trim()) {
      localErrors.shopName = "Le nom de la boutique est obligatoire";
    } else if (form.shopName.trim().length < 2) {
      localErrors.shopName = "Le nom doit comporter au moins 2 caractères";
    }

    // Validation Owner Name
    if (!form.ownerName.trim()) {
      localErrors.ownerName = "Le nom du propriétaire est obligatoire";
    } else if (form.ownerName.trim().length < 2) {
      localErrors.ownerName = "Le nom doit comporter au moins 2 caractères";
    }

    // Validation Email
    if (!form.email.trim()) {
      localErrors.email = "L'adresse email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      localErrors.email = "Format d'email invalide";
    }

    // Validation Téléphone Sénégalais (70, 75, 76, 77, 78 suivi de 7 chiffres)
    // On retire d'abord les espaces éventuels pour la validation
    const cleanPhone = form.phone.replace(/\s+/g, "");
    const phoneRegex = /^(70|75|76|77|78|33)\d{7}$/;
    if (!form.phone) {
      localErrors.phone = "Le numéro de téléphone est obligatoire";
    } else if (!phoneRegex.test(cleanPhone)) {
      localErrors.phone = "Numéro invalide (Ex: 77 123 45 67)";
    }

    // Validation Mot de passe
    if (!form.adminPassword) {
      localErrors.adminPassword = "Le mot de passe est obligatoire";
    } else if (form.adminPassword.length < 6) {
      localErrors.adminPassword =
        "Le mot de passe doit faire au moins 6 caractères";
    }

    // Validation Confirmation Mot de passe
    if (form.adminPassword !== form.confirmPassword) {
      localErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(localErrors);

    // Le formulaire est valide s'il n'y a aucune clé d'erreur
    return Object.keys(localErrors).length === 0;
  };

  const planMapper = (selectedPlan: any) => {
    switch (selectedPlan) {
      case "free":
        setSelectedPlan("FREE");
        break;
      case "starter":
        setSelectedPlan("BASIC");
        break;
      case "pro":
        setSelectedPlan("PRO");
        break;
      case "premium":
        setSelectedPlan("PREMIUM");
        break;
      default:
        setSelectedPlan("FREE");
    }
  };

  useEffect(() => {
    // if (localStorage.getItem("token"))
    //   navigate("/dashboard", { replace: true });
    planMapper(queryParams.get("plan"));
  }, [queryParams]);

  const handleChange = (key: keyof typeof emptyForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    // On efface l'erreur du champ dès que l'utilisateur modifie sa valeur
    if (errors[key as keyof FormErrors]) {
      setErrors((p) => ({ ...p, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation globale avant envoi
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setLoading(true);
    try {
      // Nettoyage final du numéro avant envoi au backend
      const cleanForm = {
        ...form,
        phone: form.phone.replace(/\s+/g, ""),
      };

      // Suppression de la clé confirmPassword pour correspondre au DTO backend attendu
      const { confirmPassword, ...payloadData } = cleanForm;
      const payload = { ...payloadData, planType: selectedPlan };

      const created = await registerShop(payload);
      if (!created.success) {
        toast.error("Inscription échouée veuillez reéssayer");
      } else {
        toast.success("Compte créé avec succès, vous pouvez vous connectez");
        navigate("/dashboard", { replace: true });
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
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

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Nom de la boutique */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nom de la boutique *
              </label>
              <input
                type="text"
                placeholder="Ex: Boutique Sandaga"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.shopName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                value={form.shopName}
                onChange={(e) => handleChange("shopName", e.target.value)}
              />
              {errors.shopName && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.shopName}
                </p>
              )}
            </div>

            {/* Nom du propriétaire */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nom du propriétaire *
              </label>
              <input
                type="text"
                placeholder="Prénom Nom"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.ownerName
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                value={form.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
              />
              {errors.ownerName && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.ownerName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email (identifiant) *
              </label>
              <input
                type="email"
                placeholder="admin@boutique.com"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                type="tel"
                placeholder="77 000 00 00"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Régions Sénégal — Select Dropdown */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Région (Sénégal)
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 appearance-none cursor-pointer"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              >
                <option value="">Sélectionnez votre région</option>
                {SENEGAL_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Mot de passe admin */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mot de passe admin *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border pl-4 pr-11 py-3 outline-none transition focus:ring-2 ${
                    errors.adminPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                  value={form.adminPassword}
                  onChange={(e) =>
                    handleChange("adminPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.adminPassword}
                </p>
              )}
            </div>

            {/* Confirmation Mot de passe */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border pl-4 pr-11 py-3 outline-none transition focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
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
