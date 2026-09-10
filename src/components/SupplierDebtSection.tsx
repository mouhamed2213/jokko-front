import { ChevronDown, ChevronUp } from "lucide-react";
import type { Supplier } from "../types/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

export type SupplierDebtFormState = {
  supplierId: number;
  createDebt: boolean;
  unitCost: number;
  paidAmount: number;
};

type Props = {
  title: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  supplierSearch: string;
  onSupplierSearchChange: (value: string) => void;
  suppliers: Supplier[];
  form: SupplierDebtFormState;
  onFormChange: (
    updater: (prev: SupplierDebtFormState) => SupplierDebtFormState,
  ) => void;
  /** Quantité concernée, utilisée pour calculer le coût total. */
  quantity: number;
  /** Coût unitaire à préremplir si l'utilisateur ouvre la section sans en avoir saisi un. */
  fallbackUnitCost: number;
};

export default function SupplierDebtSection({
  title,
  open,
  onToggle,
  disabled,
  supplierSearch,
  onSupplierSearchChange,
  suppliers,
  form,
  onFormChange,
  quantity,
  fallbackUnitCost,
}: Props) {
  const totalCost = form.unitCost > 0 && quantity > 0 ? form.unitCost * quantity : 0;
  const reste = totalCost > 0 ? totalCost - form.paidAmount : 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          if (!open && form.unitCost <= 0) {
            onFormChange((p) => ({ ...p, unitCost: fallbackUnitCost || 0 }));
          }
          onToggle();
        }}
        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 group transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{open ? "Masquer les infos fournisseur" : "Lier à un fournisseur"}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 space-y-4 border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">{title}</p>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fournisseur
            </label>
            <input
              value={supplierSearch}
              onChange={(e) => {
                onSupplierSearchChange(e.target.value);
                onFormChange((p) => ({ ...p, supplierId: 0 }));
              }}
              placeholder="Rechercher un fournisseur..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
            {supplierSearch && !form.supplierId && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border bg-white shadow-sm">
                {suppliers.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      onFormChange((p) => ({
                        ...p,
                        supplierId: s.id,
                        unitCost: p.unitCost > 0 ? p.unitCost : fallbackUnitCost || 0,
                      }));
                      onSupplierSearchChange(s.name);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
                  >
                    {s.name}
                    {s.phone ? ` — ${s.phone}` : ""}
                  </button>
                ))}
                {!suppliers.length && (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Aucun fournisseur trouvé
                  </p>
                )}
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.createDebt}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, createDebt: e.target.checked }))
              }
              className="h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm text-gray-700">
              Créer une dette fournisseur
            </span>
          </label>

          {form.createDebt && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Coût unitaire (FCFA)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.unitCost}
                  onChange={(e) =>
                    onFormChange((p) => ({
                      ...p,
                      unitCost: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Acompte versé (FCFA)
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalCost || undefined}
                  value={form.paidAmount}
                  onChange={(e) =>
                    onFormChange((p) => ({
                      ...p,
                      paidAmount: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </div>
              {totalCost > 0 && (
                <div
                  className={`col-span-2 rounded-xl px-4 py-3 text-sm font-medium ${
                    reste > 0
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {reste > 0
                    ? `⚠️ Reste dû : ${fmt(reste)}`
                    : "✅ Entièrement payé"}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
