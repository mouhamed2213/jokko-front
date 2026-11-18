import { AlertTriangle, Lock, Plus, Power, UserCog, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showModal, UpgradeModal } from "../components/upgradeModal";
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
  ADMIN: "bg-ink/5 text-ink",
  EMPLOYEE: "bg-jokko/10 text-jokko-deep",
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
  let limiteReached: boolean = false;
  
  if (maxUsers !== 0) {
    limiteReached = users.length >= maxUsers ? true : false;
  }
  
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
      limiteMessage = "Limite d'employés atteinte pour votre abonnement.";
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

  const handleToggleActive = async (user: User) => {
    const nextActive = !user.isActive;
    const action = nextActive ? "réactiver" : "désactiver";
    if (!confirm(`Voulez-vous vraiment ${action} le compte de ${user.name} ?`)) return;

    try {
      await updateUser(user.id, { isActive: nextActive });
      toast.success(nextActive ? "Compte réactivé" : "Compte désactivé");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur de modification du statut");
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
      <div className="rounded-2xl bg-paper p-8 text-center text-ink/45">
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
            className="shrink-0 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Augmenter la limite
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60">{users.length} utilisateur(s) </p>

        {/*  */}
        <button
          onClick={() => {
            if (limiteReached) {
              setIsUpgradeModalOpen(true);
              return;
            }
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white transition ${
            limiteReached
              ? "bg-sun hover:bg-sun shadow-sm"
              : "bg-jokko hover:bg-jokko-deep" // Style normal
          }`}
        >
          {limiteReached ? <Lock size={16} /> : <Plus size={16} />}

          <span>Nouvel utilisateur </span>
        </button>

        {limiteReached &&
          isUpgradeModalOpen &&
          showModal(
            isUpgradeModalOpen,
            () => setIsUpgradeModalOpen(false),
            "maxUserReached",
          )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-3xl border border-ink/10 bg-paper p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-ink">
              {editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X size={20} className="text-ink/45" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                Nom complet *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko"
                placeholder="Ex: Fatou Diallo"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                disabled={!!editingId}
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko disabled:bg-cream disabled:text-ink/45"
                placeholder="email@boutique.com"
                required={!editingId}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                Mot de passe{" "}
                {editingId ? "(laisser vide pour ne pas changer)" : "*"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko"
                placeholder="••••••••"
                required={!editingId}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/75">
                Rôle
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm outline-none focus:border-jokko"
              >
                <option value="EMPLOYEE">Employé</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-jokko px-6 py-3 text-sm font-medium text-white hover:bg-jokko-deep disabled:opacity-60 transition"
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
                className="rounded-full border border-ink/20 px-6 py-3 text-sm text-ink/75 hover:bg-cream"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste utilisateurs */}
      {!users.length ? (
        <div className="rounded-2xl bg-paper p-8 text-center text-ink/45">
          <UserCog size={40} className="mx-auto mb-3 text-ink/35" />
          <p>Aucun utilisateur enregistré.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-ink/10 bg-paper px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Avatar + infos */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-jokko/10 text-sm font-bold text-jokko-deep">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink truncate">
                        {user.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[user.role]}`}
                      >
                        {roleLabel[user.role]}
                      </span>
                    </div>
                    <p className="text-sm text-ink/60 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-ink/45">
                        Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${user.isActive ? "bg-jokko/10 text-jokko-deep" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Accès actif" : "Accès désactivé"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {user.id !== Number(JSON.parse(localStorage.getItem("user") || "{}").id) && (
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition ${user.isActive ? "border-sun/60 text-ink hover:bg-sun/20" : "border-jokko/25 text-jokko-deep hover:bg-jokko/10"}`}
                    >
                      <Power size={13} />
                      {user.isActive ? "Désactiver" : "Réactiver"}
                    </button>
                  )}
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
                    className="rounded-full border border-ink/20 px-3 py-2 text-xs text-ink/75 hover:bg-cream transition"
                  >
                    Modifier
                  </button>
                  {user.role !== "ADMIN" && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* {i */}
    </section>
  );
}
