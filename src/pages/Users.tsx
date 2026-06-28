import { AlertTriangle, Lock, Plus, UserCog, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createUser,
  deleteUser,
  getSubscription,
  getUsers,
  updateUser,
} from "../services/index";
import type { SubscriptionInfo, User } from "../types/index";

const emptyForm = { name: "", email: "", password: "", role: "EMPLOYEE" };

const roleLabel: Record<string, string> = {
  ADMIN: "Administrateur",
  EMPLOYEE: "Employé",
};
const roleBadge: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  EMPLOYEE: "bg-blue-100 text-blue-700",
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>();

  const maxUsers = subscription?.limits.users ?? 0;
  const limiteReached = users.length >= maxUsers ? true : false;

let limiteMessage;

switch (subscription?.plan.code) {
  case "FREE":
    limiteMessage =
      "Ajout d'employés indisponible avec le plan Gratuit. Passez à une offre supérieure pour gérer des employés.";
    break;

  case "BASIC":
  case "PRO":
    limiteMessage = `Limite atteinte : votre abonnement permet jusqu'à ${maxUsers} employé${maxUsers > 1 ? "s" : ""}.`;
    break;

  default:
    limiteMessage =
      "Limite d'employés atteinte pour votre abonnement.";
}

  const fetchUsers = async () => {
    try {
      getSubscription().then(setSubscription);
      setUsers(await getUsers());
    } catch {
      toast.error("Erreur chargement utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // console.log(subscription?.limits.users);
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email)
      return toast.error("Nom et email obligatoires");
    if (!editingId && !form.password)
      return toast.error("Mot de passe obligatoire");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateUser(editingId, {
          name: form.name,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("Utilisateur modifié");
      } else {
        await createUser(form);
        toast.success("Utilisateur créé");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      toast.success("Utilisateur supprimé");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  if (loading)
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );

  return (
    <section className="space-y-6">
      {/* Header */}
      {limiteReached && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>{limiteMessage}</span>
          </div>
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Augmenter la limite
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{users.length} utilisateur(s)  </p>

        {/*  */}
        <button
          onClick={() => {
            if (limiteReached) {
              setIsUpgradeModalOpen(true); // Ouvre le modal de conversion directement
              return;
            }
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition ${
            limiteReached
              ? "bg-amber-600 hover:bg-amber-700 shadow-sm"
              : "bg-emerald-600 hover:bg-emerald-700" // Style normal
          }`}
        >
          {limiteReached ? <Lock size={16} /> : <Plus size={16} />}
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Ex: Fatou Diallo"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                disabled={!!editingId}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="email@boutique.com"
                required={!editingId}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mot de passe{" "}
                {editingId ? "(laisser vide pour ne pas changer)" : "*"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                placeholder="••••••••"
                required={!editingId}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Rôle
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              >
                <option value="EMPLOYEE">Employé</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {submitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-xl border border-gray-300 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste utilisateurs */}
      {!users.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          <UserCog size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Aucun utilisateur enregistré.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Avatar + infos */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[user.role]}`}
                      >
                        {roleLabel[user.role]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Membre depuis{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => {
                      setForm({
                        name: user.name,
                        email: user.email,
                        password: "",
                        role: user.role,
                      });
                      setEditingId(user.id);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Lock size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Gestion d'Équipe Premium
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Le plan Free est limité à un maximum de 2 comptes utilisateurs.
                Passez au plan supérieur pour ajouter d'autres collaborateurs ou
                caissiers.
              </p>
            </div>

            {/* Avantages ciblés Gestion d'équipe */}
            <div className="my-5 rounded-xl bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Débloquez le Plan Basic pour collaborer efficacement :
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  👥 Comptes <b>caissiers et gérants supplémentaires</b>
                </li>
                <li className="flex items-center gap-2">
                  🔒 Traçabilité fine des ventes et actions par utilisateur
                </li>
                <li className="flex items-center gap-2">
                  📦 Extension du catalogue produits et historique de caisse
                  illimité
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Plus tard
              </button>
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  toast.success("Redirection vers les plans d'abonnement...");
                }}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition sm:w-auto"
              >
                Découvrir les plans
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
