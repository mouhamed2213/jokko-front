import { Plus } from "lucide-react";

export function SuperAdminHeader() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          //   src={logo}
          alt="Jokko Business"
          className="h-10 w-10 rounded-xl bg-slate-50 p-1 object-contain"
        />
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Panneau Super Admin
          </h1>
          <p className="text-xs text-gray-400">
            Gestion des boutiques Jokko Business
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {}}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} /> Nouvelle boutique
        </button>
        <button
          onClick={() => {}}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
