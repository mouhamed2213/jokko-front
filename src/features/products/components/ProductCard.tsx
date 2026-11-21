import { AlertTriangle, Minus, Pen, Plus, Trash } from "lucide-react";
import type { Product } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { formatStockDisplay } from "../../../utils/packaging";

interface ProductCardProps {
  product: Product;
  admin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onOpenStockModal: (product: Product, mode: "ENTRY" | "OUT") => void;
}

export function ProductCard({
  product,
  admin,
  onEdit,
  onDelete,
  onOpenStockModal,
}: ProductCardProps) {
  const isLow =
    product.quantity > 0 && product.quantity <= product.alertThreshold;
  const isOut = product.quantity === 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
      {/* Top Bar : Conteneur Image avec fond dynamique flouté */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 flex items-center justify-center p-3">
        {product.imageUrl ? (
          <>
            <img
              src={product.imageUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-md scale-125 opacity-30 pointer-events-none"
            />
            <img
              src={product.imageUrl}
              alt={product.name}
              className="relative z-10 h-full w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <span className="text-4xl font-extrabold text-slate-300">
            {product.name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Badges de Statut (Stock) */}
        {(isLow || isOut) && (
          <span
            className={`absolute top-2 left-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isOut
                ? "bg-red-500 text-white shadow-sm"
                : "bg-amber-400 text-amber-950 shadow-sm"
            }`}
          >
            <AlertTriangle size={10} />
            {isOut ? "Rupture" : "Alerte"}
          </span>
        )}

        {/* Admin Menu */}
        {admin && (
          <div className="absolute top-2 right-2 z-20 flex gap-1 rounded-xl bg-white/90 p-1 shadow-sm backdrop-blur-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(product)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
              title="Modifier"
            >
              <Pen size={15} color="green" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 active:bg-red-100"
              title="Supprimer"
            >
              <Trash size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Corps de la Carte */}
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
            <span className="truncate font-medium text-emerald-600">
              {product.category?.name || "Sans catégorie"}
            </span>
            {product.reference && (
              <span className="font-mono text-slate-400">
                #{product.reference}
              </span>
            )}
          </div>

          <h4 className="mt-0.5 font-bold text-slate-800 text-sm leading-snug line-clamp-1">
            {product.name}
          </h4>
        </div>

        {/* Grille des Prix */}
        <div className="rounded-xl bg-slate-50 p-2 space-y-1.5 border border-slate-100 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[11px]">Prix Détail</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatMoney(product.salePrice)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
            <span>Prix Achat</span>
            <span className="font-medium">
              {formatMoney(product.purchasePrice)}
            </span>
          </div>

          {(product.semiWholesalePrice || product.wholesalePrice) && (
            <div className="pt-1 space-y-1 border-t border-slate-200/60 text-[10px]">
              {product.semiWholesalePrice && (
                <div className="flex justify-between text-blue-700">
                  <span>Demi-gros (≥{product.semiWholesaleMinQty})</span>
                  <span className="font-semibold">
                    {formatMoney(product.semiWholesalePrice)}
                  </span>
                </div>
              )}
              {product.wholesalePrice && (
                <div className="flex justify-between text-purple-700">
                  <span>Gros (≥{product.wholesaleMinQty})</span>
                  <span className="font-semibold">
                    {formatMoney(product.wholesalePrice)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer : Quantité + Actions Mouvement */}
        <div className="space-y-2 pt-1">
          {product.unitType && product.unitType !== "PIECE" && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
              <span className="font-medium">
                {product.unitType === "CARTON"
                  ? `Carton (${product.unitsPerPack} pcs)`
                  : "Douzaine (12 pcs)"}
              </span>
              {product.packSalePrice && (
                <span className="font-bold text-emerald-700">
                  {formatMoney(product.packSalePrice)}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-slate-500 text-[11px]">En stock:</span>
            <span
              className={`font-bold text-right ${
                isOut
                  ? "text-red-600"
                  : isLow
                    ? "text-amber-600"
                    : "text-slate-900"
              }`}
            >
              {formatStockDisplay(
                product.quantity,
                product.unitType,
                product.unitsPerPack,
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onOpenStockModal(product, "ENTRY")}
              className="flex items-center justify-center gap-1 rounded-lg bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 active:scale-95 transition"
            >
              <Plus size={12} /> Entrée
            </button>
            <button
              onClick={() => onOpenStockModal(product, "OUT")}
              disabled={product.quantity === 0}
              className="flex items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 transition"
            >
              <Minus size={12} /> Sortie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
