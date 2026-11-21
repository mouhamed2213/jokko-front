import { Plus, X } from "lucide-react";
import type { Product } from "../../../types/index";

interface HighlightedProductBannerProps {
  loading: boolean;
  product: Product | null;
  admin: boolean;
  onClear: () => void;
  onStockEntry: (product: Product) => void;
  onEdit: (product: Product) => void;
}

export function HighlightedProductBanner({
  loading,
  product,
  admin,
  onClear,
  onStockEntry,
  onEdit,
}: HighlightedProductBannerProps) {
  return (
    <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Produit signalé par une alerte de stock
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Chargement...</p>
      ) : !product ? (
        <p className="text-sm text-gray-500">Produit introuvable.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg font-bold text-slate-300">
                  {product.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{product.name}</p>
              <p
                className={`text-xs font-medium ${
                  product.quantity === 0 ? "text-red-600" : "text-yellow-600"
                }`}
              >
                {product.quantity === 0
                  ? "Rupture de stock"
                  : `Stock faible — ${product.quantity} restant(s)`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onStockEntry(product)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
            >
              <Plus size={13} /> Entrée
            </button>
            {admin && (
              <button
                onClick={() => onEdit(product)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
