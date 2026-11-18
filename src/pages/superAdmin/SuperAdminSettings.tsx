import { Link } from "react-router-dom";
import { Clock, KeyRound, Users, Wrench, ChevronRight } from "lucide-react";

const sections = [
  {
    title: "Maintenance",
    description: "Gérer l'indisponibilité temporaire de la plateforme et le message affiché aux visiteurs.",
    path: "/admin/settings/maintenance",
    icon: Wrench,
  },
  {
    title: "Période de grâce",
    description: "Définir le nombre de jours pendant lesquels une boutique conserve son forfait après expiration.",
    path: "/admin/settings/subscription-grace-period",
    icon: Clock,
  },
  {
    title: "Utilisateurs",
    description: "Consulter et gérer les comptes Super Admin de la plateforme.",
    path: "/admin/settings/users",
    icon: Users,
  },
  {
    title: "Sécurité du compte",
    description: "Gérer les paramètres de sécurité de votre propre compte administrateur.",
    path: "/admin/security",
    icon: KeyRound,
  },
];

export default function SuperAdminSettings() {
  return (
    <section className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(({ title, description, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="group flex items-start gap-4 rounded-3xl border border-ink/10 bg-paper p-5 shadow-sm transition hover:border-ink/20 hover:shadow-md"
          >
            <div className="rounded-xl bg-ink/5 p-3 text-ink/75">
              <Icon size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-sm leading-5 text-ink/60">{description}</p>
            </div>
            <ChevronRight size={18} className="mt-1 shrink-0 text-ink/45 transition group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
