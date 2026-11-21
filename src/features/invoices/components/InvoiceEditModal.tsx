import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { updateSale } from "../../sales/api";
import type { Client, PackagingUnit, Product, Sale } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { unitLabel } from "../../../utils/packaging";

type EditCartItem = {
  productId: number;
  productName: string;
  soldUnit: PackagingUnit;
  productUnitType: PackagingUnit;
  unitsPerPack: number;
  piecePrice: number;
  packPrice: number;
  quantity: number;
  unitPrice: number;
  stock: number;
};

interface InvoiceEditModalProps {
  invoice: Sale;
  products: Product[];
  clients: Client[];
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function InvoiceEditModal({
  invoice,
  products,
  clients,
  onClose,
  onSuccess,
}: InvoiceEditModalProps) {
  const [editItems, setEditItems] = useState<EditCartItem[]>(() =>
    invoice.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const soldUnit: PackagingUnit = it.soldUnit ?? "PIECE";
      const productUnitType: PackagingUnit = prod?.unitType ?? soldUnit;
      const unitsPerPack = prod?.unitsPerPack ?? 1;
      const piecePrice = prod?.salePrice ?? it.unitPrice;
      const packPrice = prod?.packSalePrice ?? piecePrice * unitsPerPack;
      return {
        productId: it.productId as number,
        productName: it.productName,
        soldUnit,
        productUnitType,
        unitsPerPack,
        piecePrice,
        packPrice,
        quantity: it.soldQuantity ?? it.quantity,
        unitPrice: it.soldUnitPrice ?? it.unitPrice,
        stock: prod?.quantity ?? 0,
      };
    }),
  );
  const [editClientId, setEditClientId] = useState<number | "">(
    invoice.client?.id || "",
  );
  const [editCustomerName, setEditCustomerName] = useState(
    invoice.customerName || "",
  );
  const [editNote, setEditNote] = useState(invoice.note || "");
  const [editAddProductId, setEditAddProductId] = useState<number>(0);
  const [editAddQty, setEditAddQty] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const updateItemQty = (
    productId: number,
    soldUnit: PackagingUnit,
    quantity: number,
  ) => {
    setEditItems((prev) =>
      prev.map((it) =>
        it.productId === productId && it.soldUnit === soldUnit
          ? { ...it, quantity }
          : it,
      ),
    );
  };

  const updateItemPrice = (
    productId: number,
    soldUnit: PackagingUnit,
    unitPrice: number,
  ) => {
    setEditItems((prev) =>
      prev.map((it) =>
        it.productId === productId && it.soldUnit === soldUnit
          ? { ...it, unitPrice }
          : it,
      ),
    );
  };

  const updateItemUnit = (
    productId: number,
    currentUnit: PackagingUnit,
    nextUnit: PackagingUnit,
  ) => {
    if (currentUnit === nextUnit) return;
    setEditItems((prev) => {
      const target = prev.find(
        (it) => it.productId === productId && it.soldUnit === currentUnit,
      );
      if (!target) return prev;
      const nextPrice =
        nextUnit === "PIECE" ? target.piecePrice : target.packPrice;
      const duplicate = prev.find(
        (it) => it.productId === productId && it.soldUnit === nextUnit,
      );
      if (duplicate) {
        return prev
          .filter(
            (it) =>
              !(it.productId === productId && it.soldUnit === currentUnit),
          )
          .map((it) =>
            it.productId === productId && it.soldUnit === nextUnit
              ? { ...it, quantity: it.quantity + target.quantity }
              : it,
          );
      }
      return prev.map((it) =>
        it.productId === productId && it.soldUnit === currentUnit
          ? { ...it, soldUnit: nextUnit, unitPrice: nextPrice }
          : it,
      );
    });
  };

  const removeItem = (productId: number, soldUnit: PackagingUnit) => {
    setEditItems((prev) =>
      prev.filter(
        (it) => !(it.productId === productId && it.soldUnit === soldUnit),
      ),
    );
  };

  const addItem = () => {
    if (!editAddProductId || editAddQty <= 0) {
      return toast.error("Sélectionnez un produit et une quantité valide");
    }
    const product = products.find((p) => p.id === editAddProductId);
    if (!product) return;
    const defaultUnit: PackagingUnit = product.unitType ?? "PIECE";
    const unitsPerPack = product.unitsPerPack ?? 1;
    const piecePrice = product.salePrice;
    const packPrice = product.packSalePrice ?? piecePrice * unitsPerPack;
    const defaultPrice = defaultUnit === "PIECE" ? piecePrice : packPrice;

    setEditItems((prev) => {
      const existing = prev.find(
        (it) => it.productId === product.id && it.soldUnit === defaultUnit,
      );
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id && it.soldUnit === defaultUnit
            ? { ...it, quantity: it.quantity + editAddQty }
            : it,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          soldUnit: defaultUnit,
          productUnitType: defaultUnit,
          unitsPerPack,
          piecePrice,
          packPrice,
          quantity: editAddQty,
          unitPrice: defaultPrice,
          stock: product.quantity,
        },
      ];
    });
    setEditAddProductId(0);
    setEditAddQty(1);
  };

  const editTotal = editItems.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice,
    0,
  );

  const handleUpdateSale = async () => {
    if (editItems.length === 0) {
      return toast.error("La facture doit contenir au moins un article");
    }
    if (!editClientId && !editCustomerName.trim()) {
      return toast.error("Client ou nom du client passager requis");
    }
    setSubmitting(true);
    try {
      await updateSale(invoice.id, {
        clientId: editClientId ? Number(editClientId) : null,
        customerName: editCustomerName || undefined,
        note: editNote || undefined,
        items: editItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          soldUnit: it.soldUnit,
        })),
      });
      toast.success("Facture modifiée avec succès");
      onClose();
      await onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Modifier — {invoice.invoiceNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Modification possible tant qu'aucun paiement n'a été reçu.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Client enregistré
            </label>
            <select
              value={editClientId}
              onChange={(e) =>
                setEditClientId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">— Aucun —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ou nom client passager
            </label>
            <input
              type="text"
              value={editCustomerName}
              onChange={(e) => setEditCustomerName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              placeholder="Nom du client"
            />
          </div>
        </div>

        {/* Lignes articles */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
            Articles
          </p>
          <div className="space-y-2">
            {editItems.map((it) => (
              <div
                key={`${it.productId}:${it.soldUnit}`}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <div className="min-w-32 flex-1">
                  <span className="text-sm font-medium text-slate-800">
                    {it.productName}
                  </span>
                  {it.productUnitType !== "PIECE" ? (
                    <select
                      value={it.soldUnit}
                      onChange={(e) =>
                        updateItemUnit(
                          it.productId,
                          it.soldUnit,
                          e.target.value as PackagingUnit,
                        )
                      }
                      className="ml-2 rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                    >
                      <option value={it.productUnitType}>
                        {unitLabel(it.productUnitType)} ({it.unitsPerPack} pcs)
                      </option>
                      <option value="PIECE">Pièce</option>
                    </select>
                  ) : (
                    <span className="ml-2 text-xs text-slate-400">Pièce</span>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) =>
                    updateItemQty(
                      it.productId,
                      it.soldUnit,
                      Number(e.target.value),
                    )
                  }
                  className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  min={0}
                  value={it.unitPrice}
                  onChange={(e) =>
                    updateItemPrice(
                      it.productId,
                      it.soldUnit,
                      Number(e.target.value),
                    )
                  }
                  className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:border-emerald-500"
                />
                <span className="w-24 text-right text-sm font-semibold">
                  {formatMoney(it.quantity * it.unitPrice)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(it.productId, it.soldUnit)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {editItems.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Aucun article — ajoutez-en un ci-dessous.
              </p>
            )}
          </div>

          {/* Ajout d'un article */}
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">
                Ajouter un produit
              </label>
              <select
                value={editAddProductId}
                onChange={(e) => setEditAddProductId(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              >
                <option value={0}>— Choisir un produit —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1 block text-xs text-gray-500">Qté</label>
              <input
                type="number"
                min={1}
                value={editAddQty}
                onChange={(e) => setEditAddQty(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Note (optionnel)
          </label>
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-gray-500">Nouveau total</span>
          <span className="text-lg font-bold text-slate-900">
            {formatMoney(editTotal)}
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleUpdateSale}
            disabled={submitting}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {submitting
              ? "Enregistrement..."
              : "✓ Enregistrer les modifications"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
