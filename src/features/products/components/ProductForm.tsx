import { Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SupplierDebtSection, {
  type SupplierDebtFormState,
} from "../../../components/SupplierDebtSection";
import { createProduct, updateProduct } from "../api";
import { getSuppliers } from "../../suppliers/api";
import type {
  Category,
  PackagingUnit,
  Product,
  Supplier,
} from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { formatStockDisplay, unitLabel } from "../../../utils/packaging";

const emptyForm = {
  name: "",
  description: "",
  reference: "",
  categoryId: "" as string | number,
  unitType: "PIECE" as PackagingUnit,
  unitsPerPack: 24,
  quantity: 0,
  purchasePrice: 0,
  salePrice: 0,
  packPurchasePrice: 0,
  packSalePrice: 0,
  pieceSalePrice: "" as number | string,
  alertThreshold: 5,
  imageUrl: "",
  semiWholesalePrice: "" as number | string,
  semiWholesaleMinQty: "" as number | string,
  wholesalePrice: "" as number | string,
  wholesaleMinQty: "" as number | string,
};

const emptySupplierForm: SupplierDebtFormState = {
  supplierId: 0,
  createDebt: false,
  unitCost: 0,
  paidAmount: 0,
};

function buildInitialForm(editingProduct: Product | null) {
  if (!editingProduct) return emptyForm;
  const unitType: PackagingUnit = editingProduct.unitType || "PIECE";
  const unitsPerPack = editingProduct.unitsPerPack || 1;
  const isPack = unitType !== "PIECE";
  return {
    name: editingProduct.name,
    description: editingProduct.description || "",
    reference: editingProduct.reference || "",
    categoryId: editingProduct.categoryId || "",
    unitType,
    unitsPerPack: isPack ? unitsPerPack : 24,
    quantity: editingProduct.quantity,
    purchasePrice: editingProduct.purchasePrice,
    salePrice: editingProduct.salePrice,
    packPurchasePrice:
      editingProduct.packPurchasePrice ??
      Math.round(editingProduct.purchasePrice * unitsPerPack),
    packSalePrice:
      editingProduct.packSalePrice ??
      Math.round(editingProduct.salePrice * unitsPerPack),
    pieceSalePrice: isPack ? editingProduct.salePrice : "",
    alertThreshold: isPack
      ? Math.max(0, Math.round(editingProduct.alertThreshold / unitsPerPack))
      : editingProduct.alertThreshold,
    imageUrl: editingProduct.imageUrl || "",
    semiWholesalePrice: editingProduct.semiWholesalePrice ?? "",
    semiWholesaleMinQty: editingProduct.semiWholesaleMinQty ?? "",
    wholesalePrice: editingProduct.wholesalePrice ?? "",
    wholesaleMinQty: editingProduct.wholesaleMinQty ?? "",
  };
}

interface ProductFormProps {
  editingProduct: Product | null;
  categories: Category[];
  initialSuppliers: Supplier[];
  hasSubscription: boolean;
  onSuccess: () => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({
  editingProduct,
  categories,
  initialSuppliers,
  hasSubscription,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const editingId = editingProduct?.id ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(() => buildInitialForm(editingProduct));
  const [imagePreview, setImagePreview] = useState(
    editingProduct?.imageUrl || "",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [supplierForm, setSupplierForm] =
    useState<SupplierDebtFormState>(emptySupplierForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierSection, setShowSupplierSection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(buildInitialForm(editingProduct));
    setImagePreview(editingProduct?.imageUrl || "");
    setSelectedFile(null);
    setSupplierForm(emptySupplierForm);
    setShowSupplierSection(false);
    setSupplierSearch("");
  }, [editingProduct]);

  useEffect(() => {
    if (!showSupplierSection) return;
    getSuppliers({ page: 1, limit: 20, search: supplierSearch || undefined })
      .then((result) => setSuppliers(result.data))
      .catch(() => toast.error("Erreur recherche fournisseurs"));
  }, [supplierSearch, showSupplierSection]);

  const effectiveUnitsPerPack =
    form.unitType === "PIECE"
      ? 1
      : form.unitType === "DOZEN"
        ? 12
        : Math.max(2, Number(form.unitsPerPack) || 2);

  const isPackMode = form.unitType !== "PIECE";
  const formUnitPurchase = isPackMode
    ? Number(form.packPurchasePrice) || 0
    : Number(form.purchasePrice) || 0;
  const formUnitSale = isPackMode
    ? Number(form.packSalePrice) || 0
    : Number(form.salePrice) || 0;
  const computedPieceCost =
    isPackMode && effectiveUnitsPerPack > 0
      ? formUnitPurchase / effectiveUnitsPerPack
      : formUnitPurchase;
  const suggestedPieceSale =
    isPackMode && effectiveUnitsPerPack > 0 && formUnitSale > 0
      ? Math.max(1, Math.round(formUnitSale / effectiveUnitsPerPack))
      : 0;
  const totalInitialPieces =
    (Number(form.quantity) || 0) * effectiveUnitsPerPack;
  const initialStockValue = (Number(form.quantity) || 0) * formUnitPurchase;

  const totalCost =
    supplierForm.unitCost > 0 && form.quantity > 0
      ? supplierForm.unitCost * Number(form.quantity)
      : 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((p) => ({ ...p, imageUrl: "" }));
    setImagePreview("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isPack = form.unitType !== "PIECE";
    const unitsPerPack =
      form.unitType === "PIECE"
        ? 1
        : form.unitType === "DOZEN"
          ? 12
          : Number(form.unitsPerPack);

    if (
      form.unitType === "CARTON" &&
      (!Number.isInteger(unitsPerPack) || unitsPerPack < 2)
    ) {
      return toast.error(
        "Le nombre de pièces par carton doit être un entier ≥ 2",
      );
    }

    const purchasePrice = isPack
      ? Number(form.packPurchasePrice)
      : Number(form.purchasePrice);
    const salePrice = isPack
      ? Number(form.packSalePrice)
      : Number(form.salePrice);
    const quantity = Number(form.quantity);

    if (
      !form.name.trim() ||
      Number.isNaN(purchasePrice) ||
      purchasePrice < 0 ||
      Number.isNaN(salePrice) ||
      salePrice <= 0
    ) {
      return toast.error(
        "Nom obligatoire, prix d'achat ≥ 0 et prix de vente > 0",
      );
    }

    if (salePrice < purchasePrice) {
      return toast.error(
        "Le prix de vente ne peut pas être inférieur au prix d'achat",
      );
    }

    if (isPack && form.pieceSalePrice !== "") {
      const pieceSale = Number(form.pieceSalePrice);
      const pieceCost = purchasePrice / unitsPerPack;
      if (Number.isNaN(pieceSale) || pieceSale <= 0) {
        return toast.error("Le prix de vente à la pièce doit être > 0");
      }
      if (pieceSale < pieceCost) {
        return toast.error(
          "Le prix de vente à la pièce ne peut pas être inférieur au coût de revient à la pièce",
        );
      }
    }

    if (!editingId && (!Number.isInteger(quantity) || quantity < 0)) {
      return toast.error("La quantité initiale doit être un entier ≥ 0");
    }

    const hasSemiPrice = form.semiWholesalePrice !== "";
    const hasSemiQty = form.semiWholesaleMinQty !== "";
    const semiPrice = hasSemiPrice ? Number(form.semiWholesalePrice) : null;
    const semiQty = hasSemiQty ? Number(form.semiWholesaleMinQty) : null;

    if (hasSemiPrice !== hasSemiQty) {
      return toast.error(
        "Le palier Demi-gros requiert une quantité minimum et un prix",
      );
    }
    if (semiPrice !== null && semiQty !== null) {
      if (!Number.isInteger(semiQty) || semiQty < 2) {
        return toast.error("La quantité minimum Demi-gros doit être ≥ 2");
      }
      if (semiPrice <= 0 || semiPrice >= salePrice) {
        return toast.error(
          "Le prix Demi-gros doit être inférieur au prix de vente",
        );
      }
      if (semiPrice < purchasePrice) {
        return toast.error(
          "Le prix Demi-gros ne peut pas être inférieur au prix d'achat",
        );
      }
    }

    const hasWholePrice = form.wholesalePrice !== "";
    const hasWholeQty = form.wholesaleMinQty !== "";
    const wholePrice = hasWholePrice ? Number(form.wholesalePrice) : null;
    const wholeQty = hasWholeQty ? Number(form.wholesaleMinQty) : null;

    if (hasWholePrice !== hasWholeQty) {
      return toast.error(
        "Le palier Gros requiert une quantité minimum et un prix",
      );
    }
    if (wholePrice !== null && wholeQty !== null) {
      if (!Number.isInteger(wholeQty) || wholeQty < 2) {
        return toast.error("La quantité minimum Gros doit être ≥ 2");
      }
      if (wholePrice <= 0 || wholePrice >= salePrice) {
        return toast.error("Le prix Gros doit être inférieur au prix de vente");
      }
      if (wholePrice < purchasePrice) {
        return toast.error(
          "Le prix Gros ne peut pas être inférieur au prix d'achat",
        );
      }
    }

    if (
      semiPrice !== null &&
      semiQty !== null &&
      wholePrice !== null &&
      wholeQty !== null
    ) {
      if (wholeQty <= semiQty) {
        return toast.error(
          "La quantité minimum Gros doit être supérieure à celle du Demi-gros",
        );
      }
      if (wholePrice >= semiPrice) {
        return toast.error(
          "Le prix Gros doit être inférieur au prix Demi-gros",
        );
      }
    }

    if (
      showSupplierSection &&
      supplierForm.createDebt &&
      !supplierForm.supplierId
    ) {
      return toast.error("Sélectionnez un fournisseur");
    }
    if (
      showSupplierSection &&
      supplierForm.createDebt &&
      supplierForm.unitCost <= 0
    ) {
      return toast.error("Entrez le coût unitaire");
    }
    if (
      showSupplierSection &&
      supplierForm.createDebt &&
      supplierForm.paidAmount > totalCost
    ) {
      return toast.error("L'acompte ne peut pas dépasser le montant total");
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", form.name.trim());
      formDataToSend.append("unitType", form.unitType);
      formDataToSend.append("unitsPerPack", String(unitsPerPack));

      if (editingId) {
        formDataToSend.append("description", form.description);
        formDataToSend.append("reference", form.reference);
        formDataToSend.append("categoryId", String(form.categoryId));
      } else {
        if (form.description)
          formDataToSend.append("description", form.description);
        if (form.reference) formDataToSend.append("reference", form.reference);
        if (form.categoryId)
          formDataToSend.append("categoryId", String(form.categoryId));
        if (form.quantity)
          formDataToSend.append("quantity", String(form.quantity));
      }

      if (isPack) {
        formDataToSend.append("packPurchasePrice", String(purchasePrice));
        formDataToSend.append("packSalePrice", String(salePrice));
        if (form.pieceSalePrice !== "") {
          formDataToSend.append("salePrice", String(form.pieceSalePrice));
        }
      } else {
        formDataToSend.append("purchasePrice", String(purchasePrice));
        formDataToSend.append("salePrice", String(salePrice));
      }

      formDataToSend.append("alertThreshold", String(form.alertThreshold));

      if (editingId || form.semiWholesalePrice !== "")
        formDataToSend.append(
          "semiWholesalePrice",
          String(form.semiWholesalePrice),
        );
      if (editingId || form.semiWholesaleMinQty !== "")
        formDataToSend.append(
          "semiWholesaleMinQty",
          String(form.semiWholesaleMinQty),
        );
      if (editingId || form.wholesalePrice !== "")
        formDataToSend.append("wholesalePrice", String(form.wholesalePrice));
      if (editingId || form.wholesaleMinQty !== "")
        formDataToSend.append("wholesaleMinQty", String(form.wholesaleMinQty));

      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      } else if (editingId || form.imageUrl) {
        formDataToSend.append("imageUrl", form.imageUrl);
      }

      if (editingId) {
        await updateProduct(editingId, formDataToSend);
        toast.success("Produit modifié");
      } else {
        if (showSupplierSection && supplierForm.supplierId) {
          formDataToSend.append("supplierId", String(supplierForm.supplierId));
          formDataToSend.append("unitCost", String(supplierForm.unitCost));
          formDataToSend.append("paidAmount", String(supplierForm.paidAmount));
          formDataToSend.append("createDebt", String(supplierForm.createDebt));
        }
        await createProduct(formDataToSend);
        toast.success("Produit créé");
      }

      await onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur lors de l'enregistrement",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">
          {editingId ? "Modifier le produit" : "Nouveau produit"}
        </h3>
        <button type="button" onClick={onCancel}>
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1 : Mode de vente / conditionnement */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                1. Comment vendez-vous ce produit ? *
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Le stock est toujours suivi en pièces en interne : vous pourrez
                vendre au conditionnement choisi et à la pièce.
              </p>
            </div>
            {editingId && form.quantity > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                Conditionnement verrouillé (stock en cours)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                {
                  value: "PIECE" as PackagingUnit,
                  title: "Par pièce",
                  desc: "Vente à l'unité classique",
                },
                {
                  value: "DOZEN" as PackagingUnit,
                  title: "Par douzaine",
                  desc: "1 douzaine = 12 pièces",
                },
                {
                  value: "CARTON" as PackagingUnit,
                  title: "Par carton",
                  desc: "Nombre de pièces par carton au choix",
                },
              ] as const
            ).map((opt) => {
              const selected = form.unitType === opt.value;
              const locked = Boolean(editingId && form.quantity > 0);
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setForm((p) => ({
                      ...p,
                      unitType: opt.value,
                      unitsPerPack:
                        opt.value === "DOZEN"
                          ? 12
                          : opt.value === "CARTON"
                            ? Math.max(2, Number(p.unitsPerPack) || 24)
                            : 1,
                      alertThreshold: opt.value === "PIECE" ? 5 : 1,
                    }));
                  }}
                  className={`rounded-xl border p-3.5 text-left transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20"
                      : "border-gray-200 bg-white hover:border-slate-300"
                  } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <p
                    className={`text-sm font-bold ${
                      selected ? "text-emerald-900" : "text-slate-800"
                    }`}
                  >
                    {opt.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {form.unitType === "CARTON" && (
            <div className="pt-1 max-w-xs">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Combien de pièces contient 1 carton ? *
              </label>
              <input
                type="number"
                min={2}
                disabled={Boolean(editingId && form.quantity > 0)}
                onFocus={(e) => e.target.select()}
                value={form.unitsPerPack}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    unitsPerPack: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Ex: 24"
                required
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Upload image */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image du produit
            </label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition overflow-hidden ${
                  imagePreview
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <Upload size={24} />
                    <span className="text-xs">Cliquer pour uploader</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Upload size={15} />
                  {imagePreview ? "Changer l'image" : "Choisir une image"}
                </button>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Supprimer l'image
                  </button>
                )}

                <p className="text-xs text-gray-400">
                  JPG, PNG ou WebP — max 5MB
                </p>

                {!imagePreview && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">
                      Ou entrer une URL directe :
                    </p>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => {
                        setForm((p) => ({
                          ...p,
                          imageUrl: e.target.value,
                        }));
                        setImagePreview(e.target.value);
                      }}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="https://..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nom */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nom du produit *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Ex: Chemise blanche taille M"
              required
            />
          </div>

          {/* Référence */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Référence
            </label>
            <input
              type="text"
              value={form.reference}
              onChange={(e) =>
                setForm((p) => ({ ...p, reference: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Ex: REF-001"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoryId: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            >
              <option value="">Sans catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix achat */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {isPackMode
                ? `Prix d'achat par ${unitLabel(form.unitType)} (FCFA) *`
                : "Prix d'achat (FCFA) *"}
            </label>
            <input
              type="number"
              min={0}
              onFocus={(e) => e.target.select()}
              value={isPackMode ? form.packPurchasePrice : form.purchasePrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setForm((p) =>
                  isPackMode
                    ? { ...p, packPurchasePrice: val }
                    : { ...p, purchasePrice: val },
                );
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            {isPackMode && formUnitPurchase > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Coût de revient :{" "}
                <strong className="text-slate-700">
                  {Math.round(computedPieceCost).toLocaleString("fr-FR")} FCFA /
                  pièce
                </strong>
              </p>
            )}
          </div>

          {/* Prix vente */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {isPackMode
                ? `Prix de vente par ${unitLabel(form.unitType)} (FCFA) *`
                : "Prix de vente conseillé (FCFA) *"}
            </label>
            <input
              type="number"
              min={0}
              onFocus={(e) => e.target.select()}
              value={isPackMode ? form.packSalePrice : form.salePrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setForm((p) =>
                  isPackMode
                    ? { ...p, packSalePrice: val }
                    : { ...p, salePrice: val },
                );
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            {isPackMode &&
              formUnitSale > 0 &&
              formUnitSale >= formUnitPurchase && (
                <p className="mt-1 text-xs text-emerald-700">
                  Marge :{" "}
                  <strong>
                    {formatMoney(formUnitSale - formUnitPurchase)} /{" "}
                    {unitLabel(form.unitType)}
                  </strong>
                </p>
              )}
          </div>

          {/* Prix de vente à la pièce */}
          {isPackMode && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Prix de vente à la pièce (FCFA){" "}
                <span className="font-normal text-gray-400">
                  — optionnel (pour les ventes au détail à l'unité)
                </span>
              </label>
              <input
                type="number"
                min={0}
                onFocus={(e) => e.target.select()}
                value={form.pieceSalePrice}
                onChange={(e) =>
                  setForm((p) => ({ ...p, pieceSalePrice: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder={
                  suggestedPieceSale > 0
                    ? `Par défaut : ${suggestedPieceSale} FCFA / pièce`
                    : "Ex: 500"
                }
              />
            </div>
          )}

          {/* Quantité */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {editingId
                ? "Stock actuel"
                : isPackMode
                  ? `Nombre de ${unitLabel(form.unitType, true)} en stock`
                  : "Quantité initiale (pièces)"}
            </label>
            {editingId ? (
              <div>
                <input
                  type="text"
                  value={formatStockDisplay(
                    form.quantity,
                    form.unitType,
                    effectiveUnitsPerPack,
                  )}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Utilisez les boutons Entrée / Sortie sur la fiche produit pour
                  ajuster le stock.
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  min={0}
                  onFocus={(e) => e.target.select()}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {isPackMode && (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    = {totalInitialPieces.toLocaleString("fr-FR")} pièces au
                    total
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Seuil alerte */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {isPackMode
                ? `Seuil d'alerte (${unitLabel(form.unitType, true)})`
                : "Seuil d'alerte (pièces)"}
            </label>
            <input
              type="number"
              min={0}
              value={form.alertThreshold}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  alertThreshold: Number(e.target.value),
                }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            />
            {isPackMode && (
              <p className="mt-1 text-xs text-gray-400">
                Alerte déclenchée dès ≤{" "}
                {(Number(form.alertThreshold) || 0) * effectiveUnitsPerPack}{" "}
                pièces
              </p>
            )}
          </div>

          {/* Récapitulatif chiffré en direct (Douzaine / Carton) */}
          {isPackMode && !editingId && (
            <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
              <div>
                <p className="text-emerald-700">Stock total enregistré</p>
                <p className="font-bold text-emerald-950 text-sm">
                  {form.quantity}{" "}
                  {unitLabel(form.unitType, form.quantity > 1)} ={" "}
                  {totalInitialPieces.toLocaleString("fr-FR")} pcs
                </p>
              </div>
              <div>
                <p className="text-emerald-700">Prix de revient / pièce</p>
                <p className="font-bold text-emerald-950 text-sm">
                  {Math.round(computedPieceCost).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div>
                <p className="text-emerald-700">Valeur du stock initial</p>
                <p className="font-bold text-emerald-950 text-sm">
                  {formatMoney(initialStockValue)}
                </p>
              </div>
            </div>
          )}

          {/* Niveaux tarifaires */}
          <div className="sm:col-span-2">
            <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Niveaux tarifaires
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Optionnel — le prix sera suggéré automatiquement selon la
                  quantité à la vente.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-3 space-y-2 border border-gray-200">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Demi-gros
                  </p>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      Qté minimum
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.semiWholesaleMinQty}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          semiWholesaleMinQty: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Ex: 10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      Prix demi-gros (FCFA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.semiWholesalePrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          semiWholesalePrice: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Ex: 850"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-white p-3 space-y-2 border border-gray-200">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                    Gros
                  </p>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      Qté minimum
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.wholesaleMinQty}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          wholesaleMinQty: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-600">
                      Prix gros (FCFA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.wholesalePrice}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          wholesalePrice: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      placeholder="Ex: 700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500 min-h-[80px]"
              placeholder="Description optionnelle..."
            />
          </div>
        </div>

        {/* Section fournisseur (création uniquement) */}
        {!editingId && (
          <div className="border-t pt-4">
            <SupplierDebtSection
              title="Fournisseur pour le stock initial"
              open={showSupplierSection}
              onToggle={() => {
                if (!hasSubscription) return;
                setShowSupplierSection((v) => !v);
              }}
              disabled={!hasSubscription}
              supplierSearch={supplierSearch}
              onSupplierSearchChange={setSupplierSearch}
              suppliers={suppliers}
              form={supplierForm}
              onFormChange={setSupplierForm}
              quantity={Number(form.quantity)}
              fallbackUnitCost={formUnitPurchase}
            />
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {submitting
              ? "Enregistrement..."
              : editingId
                ? "Modifier"
                : "Créer le produit"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
