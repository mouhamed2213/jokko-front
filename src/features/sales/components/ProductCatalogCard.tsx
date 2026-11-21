import { Plus } from "lucide-react";
import type { PackagingUnit, Product } from "../../../types/index";
import { formatStockDisplay, unitLabel } from "../../../utils/packaging";

interface ProductCatalogCardProps {
  product: Product;
  inCartCount: number;
  onAdd: (product: Product) => void;
}

export function ProductCatalogCard({
  product: p,
  inCartCount,
  onAdd,
}: ProductCatalogCardProps) {
  const productUnit: PackagingUnit = p.unitType || "PIECE";
  const unitsPerPack = p.unitsPerPack || 1;
  const isPack = productUnit !== "PIECE";
  const isLowStock = p.quantity > 0 && p.quantity <= p.alertThreshold;

  const unitBadge =
    productUnit === "CARTON"
      ? {
          label: `Carton · ${unitsPerPack} pcs`,
          cls: "bg-purple-600/90 text-white",
        }
      : productUnit === "DOZEN"
        ? {
            label: "Douzaine · 12 pcs",
            cls: "bg-blue-600/90 text-white",
          }
        : {
            label: "Par pièce",
            cls: "bg-slate-800/80 text-white",
          };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md">
      <div className="relative h-32 sm:h-36 w-full shrink-0 overflow-hidden bg-slate-100 flex items-center justify-center p-2.5">
        {p.imageUrl ? (
          <>
            <img
              src={p.imageUrl}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-md"
            />
            <img
              src={p.imageUrl}
              alt={p.name}
              className="relative z-10 h-full w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <span className="text-3xl font-extrabold text-slate-300">
            {p.name.charAt(0).toUpperCase()}
          </span>
        )}

        <span
          className={`absolute left-2.5 top-2.5 z-20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-tight shadow-xs backdrop-blur-xs ${unitBadge.cls}`}
        >
          {unitBadge.label}
        </span>

        {inCartCount > 0 && (
          <span className="absolute right-2.5 top-2.5 z-20 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white shadow">
            {inCartCount}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2.5 p-3.5">
        <div className="space-y-1">
          <p
            className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug"
            title={p.name}
          >
            {p.name}
          </p>

          {isPack && p.packSalePrice ? (
            <div className="pt-0.5">
              <p className="text-base font-bold text-emerald-700 leading-tight">
                {p.packSalePrice.toLocaleString("fr-FR")} F{" "}
                <span className="text-[11px] font-medium text-slate-500">
                  / {unitLabel(productUnit)}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {p.salePrice.toLocaleString("fr-FR")} F / pièce
              </p>
            </div>
          ) : (
            <p className="pt-0.5 text-base font-bold text-emerald-700 leading-tight">
              {p.salePrice.toLocaleString("fr-FR")} F{" "}
              <span className="text-[11px] font-medium text-slate-500">
                / pièce
              </span>
            </p>
          )}
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-100">
          <p
            className={`text-xs font-medium truncate ${
              isLowStock ? "text-amber-600" : "text-slate-500"
            }`}
            title={formatStockDisplay(p.quantity, productUnit, unitsPerPack)}
          >
            Stock :{" "}
            <span className="font-semibold">
              {formatStockDisplay(p.quantity, productUnit, unitsPerPack)}
            </span>
          </p>

          <button
            type="button"
            onClick={() => onAdd(p)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus size={14} /> Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
