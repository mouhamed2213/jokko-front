import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SupplierDebtSection, {
  type SupplierDebtFormState,
} from "../../../components/SupplierDebtSection";
import { addStockEntry, addStockOut } from "../../stock/api";
import { getSuppliers } from "../../suppliers/api";
import type { PackagingUnit, Product, Supplier } from "../../../types/index";
import { formatStockDisplay, unitLabel } from "../../../utils/packaging";

const emptySupplierForm: SupplierDebtFormState = {
  supplierId: 0,
  createDebt: false,
  unitCost: 0,
  paidAmount: 0,
};

interface StockMovementModalProps {
  product: Product;
  mode: "ENTRY" | "OUT";
  initialSuppliers: Supplier[];
  onClose: () => void;
  onSuccess: (productId: number) => Promise<void>;
}

export function StockMovementModal({
  product,
  mode,
  initialSuppliers,
  onClose,
  onSuccess,
}: StockMovementModalProps) {
  const defaultUnit: PackagingUnit =
    mode === "ENTRY" && product.unitType && product.unitType !== "PIECE"
      ? product.unitType
      : "PIECE";
  const defaultCost =
    defaultUnit !== "PIECE"
      ? (product.packPurchasePrice ??
        Math.round(product.purchasePrice * (product.unitsPerPack || 1)))
      : product.purchasePrice;

  const [stockQty, setStockQty] = useState(1);
  const [stockUnit, setStockUnit] = useState<PackagingUnit>(defaultUnit);
  const [stockNote, setStockNote] = useState("");
  const [supplierForm, setSupplierForm] = useState<SupplierDebtFormState>({
    ...emptySupplierForm,
    unitCost: defaultCost,
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierSection, setShowSupplierSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!showSupplierSection) return;
    getSuppliers({ page: 1, limit: 20, search: supplierSearch || undefined })
      .then((res) => setSuppliers(res.data))
      .catch(() => toast.error("Erreur recherche fournisseurs"));
  }, [supplierSearch, showSupplierSection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockQty <= 0) {
      return toast.error("Quantité invalide");
    }
    const multiplier =
      stockUnit === "PIECE" ? 1 : Math.max(1, product.unitsPerPack || 1);
    const totalPiecesDelta = stockQty * multiplier;

    if (
      mode === "ENTRY" &&
      showSupplierSection &&
      supplierForm.createDebt &&
      !supplierForm.supplierId
    ) {
      return toast.error("Sélectionnez un fournisseur");
    }
    if (
      mode === "ENTRY" &&
      showSupplierSection &&
      supplierForm.createDebt &&
      supplierForm.unitCost <= 0
    ) {
      return toast.error("Entrez le coût unitaire");
    }

    setSubmitting(true);
    try {
      if (mode === "ENTRY") {
        await addStockEntry({
          productId: product.id,
          quantity: stockQty,
          unit: stockUnit,
          note: stockNote || undefined,
          supplierId:
            showSupplierSection && supplierForm.supplierId
              ? supplierForm.supplierId
              : undefined,
          unitCost:
            showSupplierSection && supplierForm.unitCost
              ? supplierForm.unitCost
              : undefined,
          paidAmount:
            showSupplierSection && supplierForm.paidAmount
              ? supplierForm.paidAmount
              : undefined,
          createDebt: showSupplierSection && supplierForm.createDebt,
        });
        toast.success("Entrée de stock enregistrée");
      } else {
        if (totalPiecesDelta > product.quantity) {
          setSubmitting(false);
          return toast.error(
            `Stock insuffisant (${formatStockDisplay(
              product.quantity,
              product.unitType,
              product.unitsPerPack,
            )} disponibles)`,
          );
        }
        await addStockOut({
          productId: product.id,
          quantity: stockQty,
          unit: stockUnit,
          note: stockNote || undefined,
        });
        toast.success("Sortie de stock enregistrée");
      }
      onClose();
      await onSuccess(product.id);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur mouvement de stock",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            {mode === "ENTRY" ? "Entrée de stock" : "Sortie de stock"}
          </h3>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
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
            <p className="text-xs text-gray-400">
              Stock actuel :{" "}
              {formatStockDisplay(
                product.quantity,
                product.unitType,
                product.unitsPerPack,
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {product.unitType && product.unitType !== "PIECE" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Unité du mouvement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    {
                      unit: product.unitType,
                      label: `${
                        product.unitType === "CARTON" ? "Carton" : "Douzaine"
                      } (${product.unitsPerPack || 12} pcs)`,
                    },
                    { unit: "PIECE" as PackagingUnit, label: "Pièce" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.unit}
                    type="button"
                    onClick={() => {
                      setStockUnit(opt.unit);
                      const nextCost =
                        opt.unit === "PIECE"
                          ? product.purchasePrice
                          : (product.packPurchasePrice ??
                            Math.round(
                              product.purchasePrice *
                                (product.unitsPerPack || 1),
                            ));
                      setSupplierForm((p) => ({
                        ...p,
                        unitCost: nextCost,
                      }));
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      stockUnit === opt.unit
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {mode === "ENTRY"
                ? `Quantité à ajouter (${unitLabel(stockUnit, true)}) *`
                : `Quantité à retirer (${unitLabel(stockUnit, true)}) *`}
            </label>
            <input
              type="number"
              min={1}
              max={
                mode === "OUT"
                  ? Math.floor(
                      product.quantity /
                        (stockUnit === "PIECE"
                          ? 1
                          : product.unitsPerPack || 1),
                    )
                  : undefined
              }
              onFocus={(e) => e.target.select()}
              value={stockQty}
              onChange={(e) => setStockQty(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            {stockUnit !== "PIECE" && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                = {stockQty * (product.unitsPerPack || 1)} pièces
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {mode === "ENTRY" ? "Note" : "Raison"}
            </label>
            <textarea
              value={stockNote}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setStockNote(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500 min-h-20"
              placeholder={
                mode === "ENTRY"
                  ? "Ex: Réapprovisionnement..."
                  : "Ex: Casse, perte, retour client..."
              }
            />
          </div>

          {mode === "ENTRY" && (
            <SupplierDebtSection
              title="Informations fournisseur"
              open={showSupplierSection}
              onToggle={() => setShowSupplierSection((v) => !v)}
              supplierSearch={supplierSearch}
              onSupplierSearchChange={setSupplierSearch}
              suppliers={suppliers}
              form={supplierForm}
              onFormChange={setSupplierForm}
              quantity={stockQty}
              fallbackUnitCost={
                stockUnit === "PIECE"
                  ? product.purchasePrice
                  : (product.packPurchasePrice ??
                    Math.round(
                      product.purchasePrice * (product.unitsPerPack || 1),
                    ))
              }
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition disabled:opacity-60 ${
                mode === "ENTRY"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {submitting
                ? "Enregistrement..."
                : mode === "ENTRY"
                  ? "Ajouter au stock"
                  : "Sortir du stock"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
