import { Check, X } from "lucide-react";
import { useState } from "react";
import { getSuggestedPrice } from "../../products/api";
import type { PackagingUnit, Product } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import {
  computeUnitPrice,
  formatStockDisplay,
  unitLabel,
  type PriceTier,
} from "../../../utils/packaging";

interface AddToCartModalProps {
  product: Product;
  admin: boolean;
  onConfirm: (
    product: Product,
    unit: PackagingUnit,
    qty: number,
    price: number,
  ) => void;
  onClose: () => void;
}

export function AddToCartModal({
  product,
  admin,
  onConfirm,
  onClose,
}: AddToCartModalProps) {
  const productUnit: PackagingUnit = product.unitType || "PIECE";
  const unitsPerPack = product.unitsPerPack || 1;
  const defaultUnit: PackagingUnit =
    productUnit !== "PIECE" && product.quantity >= unitsPerPack
      ? productUnit
      : "PIECE";
  const initial = computeUnitPrice(product, 1, defaultUnit);

  const [modalUnit, setModalUnit] = useState<PackagingUnit>(defaultUnit);
  const [modalQty, setModalQty] = useState(1);
  const [modalPrice, setModalPrice] = useState(initial.price);
  const [modalTier, setModalTier] = useState<PriceTier>(initial.tier);
  const [modalSuggestion, setModalSuggestion] = useState(
    defaultUnit === "PIECE"
      ? "Prix Détail (à la pièce)"
      : `Prix standard par ${unitLabel(defaultUnit)}`,
  );

  const updatePriceSuggestion = (
    tier: PriceTier,
    tiers: any,
    unit: PackagingUnit,
  ) => {
    const label = unitLabel(unit, true);
    if (tier === "wholesale" && tiers.wholesale) {
      setModalSuggestion(
        `Prix Gros appliqué (≥${tiers.wholesale.minQty} ${label})`,
      );
    } else if (tier === "semiWholesale" && tiers.semiWholesale) {
      setModalSuggestion(
        `Prix Demi-gros appliqué (≥${tiers.semiWholesale.minQty} ${label})`,
      );
    } else {
      setModalSuggestion(
        unit === "PIECE"
          ? "Prix Détail (à la pièce)"
          : `Prix standard par ${unitLabel(unit)}`,
      );
    }
  };

  const refreshModalPrice = async (qty: number, unit: PackagingUnit) => {
    if (qty <= 0) return;
    const local = computeUnitPrice(product, qty, unit);
    setModalPrice(local.price);
    setModalTier(local.tier);
    if (
      unit === (product.unitType || "PIECE") &&
      (product.semiWholesalePrice || product.wholesalePrice)
    ) {
      try {
        const suggestion = await getSuggestedPrice(product.id, qty, unit);
        setModalPrice(suggestion.suggestedPrice);
        setModalTier(suggestion.tier);
        updatePriceSuggestion(suggestion.tier, suggestion.tiers, unit);
      } catch {
        /* silencieux */
      }
    } else {
      setModalSuggestion(
        unit === "PIECE"
          ? "Prix Détail (à la pièce)"
          : `Prix standard par ${unitLabel(unit)}`,
      );
    }
  };

  const handleQtyChange = async (qty: number) => {
    setModalQty(qty);
    await refreshModalPrice(qty, modalUnit);
  };

  const handleUnitChange = async (unit: PackagingUnit) => {
    setModalUnit(unit);
    setModalQty(1);
    await refreshModalPrice(1, unit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Ajouter au panier
          </h3>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
            <p className="text-xs text-gray-400">
              En stock :{" "}
              {formatStockDisplay(
                product.quantity,
                product.unitType,
                product.unitsPerPack,
              )}
            </p>
          </div>
        </div>

        {product.unitType && product.unitType !== "PIECE" && (
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Vendre en :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  {
                    unit: product.unitType,
                    label: `${
                      product.unitType === "CARTON" ? "Carton" : "Douzaine"
                    } (${product.unitsPerPack || 12} pcs)`,
                    disabled: product.quantity < (product.unitsPerPack || 12),
                  },
                  {
                    unit: "PIECE" as PackagingUnit,
                    label: "Pièce (détail)",
                    disabled: false,
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.unit}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleUnitChange(opt.unit)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    modalUnit === opt.unit
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Quantité ({unitLabel(modalUnit, true)})
            </label>
            <input
              type="number"
              min={1}
              max={Math.max(
                1,
                Math.floor(
                  product.quantity /
                    (modalUnit === "PIECE" ? 1 : product.unitsPerPack || 1),
                ),
              )}
              value={modalQty}
              onChange={(e) => handleQtyChange(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            {modalUnit !== "PIECE" && (
              <p className="mt-1 text-[11px] font-medium text-emerald-700">
                = {modalQty * (product.unitsPerPack || 1)} pièces
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Prix / {unitLabel(modalUnit)} (FCFA)
            </label>
            <input
              type="number"
              min={1}
              value={modalPrice}
              readOnly={!admin}
              disabled={!admin}
              title={
                admin
                  ? "Prix unitaire modifiable"
                  : "Tarif appliqué automatiquement selon le palier"
              }
              onChange={(e) => {
                if (admin) setModalPrice(Number(e.target.value));
              }}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-emerald-500 ${
                !admin
                  ? "border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                  : modalTier === "wholesale"
                    ? "border-purple-400 bg-purple-50"
                    : modalTier === "semiWholesale"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {modalSuggestion && (
          <p
            className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
              modalTier === "wholesale"
                ? "text-purple-600"
                : modalTier === "semiWholesale"
                  ? "text-blue-600"
                  : "text-gray-400"
            }`}
          >
            <Check size={13} className="shrink-0" />
            {modalSuggestion}
          </p>
        )}

        <p className="mt-4 text-right text-sm text-gray-500">
          Sous-total :{" "}
          <span className="font-bold text-emerald-700">
            {formatMoney(modalQty * modalPrice)}
          </span>
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => onConfirm(product, modalUnit, modalQty, modalPrice)}
            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Ajouter au panier
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
