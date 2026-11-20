import {
  History,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createClient,
  createSale,
  getCategories,
  getClients,
  getCurrentCash,
  getProducts,
  getSales,
  getSubscription,
  getSuggestedPrice,
} from "../services/index";
import PaymentMethodSelect from "../components/Paymentmethodselect";
import { getStoredUser, isAdmin } from "../types/auth";
import type {
  Category,
  Client,
  PackagingUnit,
  Product,
  Sale,
  SubscriptionInfo,
} from "../types/index";
import { showModal } from "../components/upgradeModal";
import {
  computeUnitPrice,
  formatStockDisplay,
  unitLabel,
  type PriceTier,
} from "../utils/packaging";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type CartItem = {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  soldUnit: PackagingUnit;
  unitType: PackagingUnit;
  unitsPerPack: number;
  quantity: number; // quantité dans soldUnit
  unitPrice: number; // prix par soldUnit
  stock: number; // stock total du produit en pièces
  salePrice: number;
  packSalePrice?: number | null;
  semiWholesalePrice?: number | null;
  semiWholesaleMinQty?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  priceOverridden?: boolean;
};

const cartLineKey = (productId: number, soldUnit: PackagingUnit) =>
  `${productId}:${soldUnit}`;

const statusBadge: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-600 line-through",
};
const statusLabel: Record<string, string> = {
  PAID: "Payée",
  PARTIAL: "Partielle",
  UNPAID: "Non réglée",
  CANCELLED: "Annulée",
};

export default function Sales() {
  const user = getStoredUser();
  const admin = isAdmin();

  // Données de référence
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  // Etat caisse / abonnement
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>();
  const [salesCount, setSalesCount] = useState<number>(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Panier
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | "">("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");
  const [quickClientPhone, setQuickClientPhone] = useState("");
  const [quickClientAddress, setQuickClientAddress] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [note, setNote] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paidAmountTouched, setPaidAmountTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  // Modal "Ajouter au panier"
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalUnit, setModalUnit] = useState<PackagingUnit>("PIECE");
  const [modalQty, setModalQty] = useState(1);
  const [modalPrice, setModalPrice] = useState(0);
  const [modalTier, setModalTier] = useState<PriceTier>("detail");
  const [modalSuggestion, setModalSuggestion] = useState("");

  // Dernières ventes (aperçu)
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [showRecentModal, setShowRecentModal] = useState(false);

  const checkCash = async () => {
    try {
      const res = await getCurrentCash();
      setCashOpen(res.open);
    } catch {
      setCashOpen(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const [subRes, prodRes, catRes] = await Promise.all([
        getSubscription(),
        getProducts({ limit: 500 }),
        getCategories(),
      ]);
      setSubscription(subRes);
      setProducts(prodRes.data);
      setCategories(catRes);
    } catch {
      toast.error("Erreur chargement des produits");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchRecentSales = async () => {
    setRecentLoading(true);
    try {
      const res = await getSales({ page: 1, limit: 10 });
      setRecentSales(res.data);
      setSalesCount(res.meta.salescount);
    } catch {
      toast.error("Erreur chargement des dernières ventes");
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchRecentSales();
    checkCash();
  }, []);

  // Recherche client (uniquement quand le panier contient au moins un article)
  useEffect(() => {
    if (!cart.length) return;
    const timeout = window.setTimeout(async () => {
      try {
        const result = await getClients({
          search: clientSearch.trim() || undefined,
          page: 1,
          limit: 10,
        });
        setClients(result.client);
      } catch {
        toast.error("Erreur chargement clients");
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [cart.length, clientSearch]);

  const maxLimit = subscription?.limits.sales;
  const isLimitReached =
    maxLimit !== null && maxLimit !== undefined && salesCount >= maxLimit;
  const isLimitReachedApproche =
    maxLimit !== null &&
    maxLimit !== undefined &&
    salesCount < maxLimit &&
    salesCount >= Math.ceil(maxLimit * 0.8);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const cartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Le montant payé suit automatiquement le total du panier (paiement
  // intégral par défaut) tant que l'utilisateur ne l'a pas modifié
  // manuellement, pour permettre un règlement partiel ou à crédit.
  useEffect(() => {
    if (!paidAmountTouched) {
      setPaidAmount(cartTotal);
    } else if (paidAmount > cartTotal) {
      // Le panier a diminué en dessous du montant payé saisi : on recadre.
      setPaidAmount(cartTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  useEffect(() => {
    if (!cart.length) {
      setPaidAmountTouched(false);
      setPaymentMethod("CASH");
    }
  }, [cart.length]);

  const filteredProducts = products
    .filter((p) => p.quantity > 0)
    .filter((p) => !categoryFilter || p.categoryId === categoryFilter)
    .filter((p) => {
      if (!productSearch.trim()) return true;
      const q = productSearch.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.reference?.toLowerCase().includes(q) ?? false)
      );
    });

  const updatePriceSuggestion = (tier: PriceTier, tiers: any, unit: PackagingUnit) => {
    const label = unitLabel(unit, true);
    if (tier === "wholesale" && tiers.wholesale) {
      setModalSuggestion(`Prix Gros appliqué (≥${tiers.wholesale.minQty} ${label})`);
    } else if (tier === "semiWholesale" && tiers.semiWholesale) {
      setModalSuggestion(
        `Prix Demi-gros appliqué (≥${tiers.semiWholesale.minQty} ${label})`,
      );
    } else {
      setModalSuggestion(
        unit === "PIECE" ? "Prix Détail (à la pièce)" : `Prix standard par ${unitLabel(unit)}`,
      );
    }
  };

  const openAddModal = (product: Product) => {
    const productUnit: PackagingUnit = product.unitType || "PIECE";
    const unitsPerPack = product.unitsPerPack || 1;
    // Si le produit est en carton/douzaine et qu'il y a au moins 1 pack en stock, on pré-sélectionne son unité
    const defaultUnit: PackagingUnit =
      productUnit !== "PIECE" && product.quantity >= unitsPerPack
        ? productUnit
        : "PIECE";
    const initial = computeUnitPrice(product, 1, defaultUnit);
    setModalProduct(product);
    setModalUnit(defaultUnit);
    setModalQty(1);
    setModalPrice(initial.price);
    setModalTier(initial.tier);
    setModalSuggestion(
      defaultUnit === "PIECE"
        ? "Prix Détail (à la pièce)"
        : `Prix standard par ${unitLabel(defaultUnit)}`,
    );
  };

  const closeAddModal = () => setModalProduct(null);

  const refreshModalPrice = async (
    product: Product,
    qty: number,
    unit: PackagingUnit,
  ) => {
    if (qty <= 0) return;
    const local = computeUnitPrice(product, qty, unit);
    setModalPrice(local.price);
    setModalTier(local.tier);
    if (unit === (product.unitType || "PIECE") && (product.semiWholesalePrice || product.wholesalePrice)) {
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

  const handleModalQtyChange = async (qty: number) => {
    setModalQty(qty);
    if (!modalProduct) return;
    await refreshModalPrice(modalProduct, qty, modalUnit);
  };

  const handleModalUnitChange = async (unit: PackagingUnit) => {
    setModalUnit(unit);
    setModalQty(1);
    if (!modalProduct) return;
    await refreshModalPrice(modalProduct, 1, unit);
  };

  const piecesInCartForProduct = (productId: number, excludeKey?: string) =>
    cart.reduce((sum, item) => {
      if (item.productId !== productId) return sum;
      if (excludeKey && cartLineKey(item.productId, item.soldUnit) === excludeKey) {
        return sum;
      }
      const mult = item.soldUnit === "PIECE" ? 1 : Math.max(1, item.unitsPerPack);
      return sum + item.quantity * mult;
    }, 0);

  const confirmAddToCart = () => {
    if (!modalProduct || !Number.isInteger(modalQty) || modalQty <= 0 || modalPrice <= 0) {
      return toast.error("Quantité et prix invalides");
    }
    const productUnit: PackagingUnit = modalProduct.unitType || "PIECE";
    const unitsPerPack = modalProduct.unitsPerPack || 1;
    const multiplier = modalUnit === "PIECE" ? 1 : Math.max(1, unitsPerPack);
    const addedPieces = modalQty * multiplier;
    const alreadyPieces = piecesInCartForProduct(modalProduct.id);

    if (alreadyPieces + addedPieces > modalProduct.quantity) {
      return toast.error(
        `Stock insuffisant (${formatStockDisplay(
          modalProduct.quantity,
          productUnit,
          unitsPerPack,
        )} disponibles)`,
      );
    }

    const lineKey = cartLineKey(modalProduct.id, modalUnit);
    const existingLine = cart.find(
      (c) => cartLineKey(c.productId, c.soldUnit) === lineKey,
    );
    const totalQtyInUnit = (existingLine?.quantity || 0) + modalQty;

    const tierForModalQty = computeUnitPrice(modalProduct, modalQty, modalUnit);
    const adminOverrode = admin && modalPrice !== tierForModalQty.price;
    const tierForTotalQty = computeUnitPrice(
      modalProduct,
      totalQtyInUnit,
      modalUnit,
    );
    const resolvedUnitPrice = adminOverrode ? modalPrice : tierForTotalQty.price;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) => cartLineKey(c.productId, c.soldUnit) === lineKey,
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const prevItem = updated[existingIdx];
        const nextOverridden = adminOverrode || prevItem.priceOverridden;
        const nextPrice = adminOverrode
          ? modalPrice
          : prevItem.priceOverridden
            ? prevItem.unitPrice
            : tierForTotalQty.price;
        updated[existingIdx] = {
          ...prevItem,
          quantity: totalQtyInUnit,
          unitPrice: nextPrice,
          priceOverridden: nextOverridden,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: modalProduct.id,
          productName: modalProduct.name,
          imageUrl: modalProduct.imageUrl,
          soldUnit: modalUnit,
          unitType: productUnit,
          unitsPerPack,
          quantity: modalQty,
          unitPrice: resolvedUnitPrice,
          stock: modalProduct.quantity,
          salePrice: modalProduct.salePrice,
          packSalePrice: modalProduct.packSalePrice,
          semiWholesalePrice: modalProduct.semiWholesalePrice,
          semiWholesaleMinQty: modalProduct.semiWholesaleMinQty,
          wholesalePrice: modalProduct.wholesalePrice,
          wholesaleMinQty: modalProduct.wholesaleMinQty,
          priceOverridden: adminOverrode,
        },
      ];
    });
    toast.success(
      `${modalProduct.name} (${modalQty} ${unitLabel(modalUnit, modalQty > 1)}) ajouté au panier`,
    );
    closeAddModal();
  };

  const updateCartQty = (
    productId: number,
    soldUnit: PackagingUnit,
    quantity: number,
  ) => {
    const key = cartLineKey(productId, soldUnit);
    if (quantity <= 0) return removeFromCart(productId, soldUnit);
    const otherPieces = piecesInCartForProduct(productId, key);

    setCart((prev) =>
      prev.map((c) => {
        if (cartLineKey(c.productId, c.soldUnit) !== key) return c;
        const mult = c.soldUnit === "PIECE" ? 1 : Math.max(1, c.unitsPerPack);
        const maxQtyInUnit = Math.max(
          1,
          Math.floor((c.stock - otherPieces) / mult),
        );
        const nextQty = Math.min(quantity, maxQtyInUnit);
        const nextPrice = c.priceOverridden
          ? c.unitPrice
          : computeUnitPrice(c, nextQty, c.soldUnit).price;
        return { ...c, quantity: nextQty, unitPrice: nextPrice };
      }),
    );
  };

  const updateCartPrice = (
    productId: number,
    soldUnit: PackagingUnit,
    unitPrice: number,
  ) => {
    if (!admin) return;
    const key = cartLineKey(productId, soldUnit);
    setCart((prev) =>
      prev.map((c) =>
        cartLineKey(c.productId, c.soldUnit) === key
          ? { ...c, unitPrice, priceOverridden: true }
          : c,
      ),
    );
  };

  const removeFromCart = (productId: number, soldUnit: PackagingUnit) => {
    const key = cartLineKey(productId, soldUnit);
    setCart((prev) =>
      prev.filter((c) => cartLineKey(c.productId, c.soldUnit) !== key),
    );
  };

  const resetCartAndClient = () => {
    setCart([]);
    setClientId("");
    setSelectedClient(null);
    setClientSearch("");
    setCustomerName("");
    setShowQuickClientForm(false);
    setQuickClientName("");
    setQuickClientPhone("");
    setQuickClientAddress("");
    setNote("");
    setPaidAmount(0);
    setPaidAmountTouched(false);
    setPaymentMethod("CASH");
  };

  const openQuickClientForm = (prefill?: string) => {
    const seed = (prefill ?? clientSearch ?? customerName).trim();
    const looksLikePhone = /^[+\d\s-]{6,}$/.test(seed);
    setQuickClientName(looksLikePhone ? "" : seed);
    setQuickClientPhone(looksLikePhone ? seed : "");
    setQuickClientAddress("");
    setShowQuickClientForm(true);
  };

  const handleQuickCreateClient = async () => {
    if (!quickClientName.trim() || !quickClientPhone.trim()) {
      return toast.error("Le nom et le téléphone du client sont obligatoires");
    }
    setCreatingClient(true);
    try {
      const created = await createClient({
        name: quickClientName.trim(),
        phone: quickClientPhone.trim(),
        address: quickClientAddress.trim() || undefined,
      });
      setClients((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setSelectedClient(created);
      setClientId(created.id);
      setClientSearch("");
      setCustomerName("");
      setShowQuickClientForm(false);
      setQuickClientName("");
      setQuickClientPhone("");
      setQuickClientAddress("");
      toast.success(`Client "${created.name}" créé et sélectionné`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur lors de la création du client",
      );
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashOpen) {
      return toast.error(
        "⚠️ La caisse est fermée. Ouvrez la caisse avant d'enregistrer une vente.",
        { duration: 5000 },
      );
    }
    if (!cart.length) return toast.error("Le panier est vide");
    if (!clientId && !customerName.trim())
      return toast.error("Client ou nom du client requis");
    if (paidAmount < 0 || paidAmount > cartTotal) {
      return toast.error("Montant payé invalide");
    }
    if (paidAmount < cartTotal && !clientId) {
      return toast.error(
        "Sélectionnez un client enregistré pour une vente partielle ou à crédit.",
      );
    }
    setSubmitting(true);
    try {
      await createSale({
        clientId: clientId ? Number(clientId) : null,
        customerName: customerName || undefined,
        paidAmount,
        paymentMethod,
        note: note || undefined,
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          soldUnit: c.soldUnit,
        })),
      } as any);
      toast.success("Vente enregistrée avec succès");
      resetCartAndClient();
      await Promise.all([fetchProducts(), fetchRecentSales()]);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur enregistrement vente",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    toast.error("User not found");
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Alerte caisse fermée */}
      {cashOpen === false && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-red-800">
                Caisse fermée — Ventes bloquées
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                Vous devez ouvrir la caisse avant d'enregistrer une vente.
              </p>
            </div>
          </div>
          <a
            href="/cash"
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Ouvrir la caisse →
          </a>
        </div>
      )}

      {isLimitReachedApproche && !isLimitReached && (
        <div className="rounded-2xl bg-yellow-50 border border-yellow-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">
                Plus que {(maxLimit as number) - salesCount} ventes disponibles ce mois
              </p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Vous approchez de la limite de votre abonnement ({maxLimit} ventes/mois).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="shrink-0 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
          >
            Changer de forfait →
          </button>
        </div>
      )}

      {isLimitReached && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="font-semibold text-red-800">
                Limite mensuelle atteinte — Ventes bloquées
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                Vous avez utilisé vos {maxLimit} ventes ce mois. Réinitialisation le
                1er du mois prochain.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Changer de forfait →
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nouvelle vente</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Sélectionnez des produits pour les ajouter au panier.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRecentModal(true)}
          className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
        >
          <History size={16} />
          Voir les dernières ventes
        </button>
      </div>

      {/* Contenu principal : produits + panier */}
      <div
        className={`grid grid-cols-1 gap-6 ${
          cart.length ? "lg:grid-cols-[1fr_380px]" : ""
        }`}
      >
        {/* Colonne produits */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-45">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value ? Number(e.target.value) : "")
              }
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {loadingProducts ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
              Chargement des produits...
            </div>
          ) : !filteredProducts.length ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
              Aucun produit trouvé.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((p) => {
                const productUnit: PackagingUnit = p.unitType || "PIECE";
                const unitsPerPack = p.unitsPerPack || 1;
                const isPack = productUnit !== "PIECE";
                const inCartLines = cart.filter((c) => c.productId === p.id);
                const inCartCount = inCartLines.reduce(
                  (sum, c) => sum + c.quantity,
                  0,
                );
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
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-300">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Type d'enregistrement du produit */}
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-tight shadow-sm backdrop-blur-xs ${unitBadge.cls}`}
                      >
                        {unitBadge.label}
                      </span>
                      {inCartCount > 0 && (
                        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white shadow">
                          {inCartCount}
                        </span>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <p
                        className="text-sm font-semibold text-slate-800 truncate"
                        title={p.name}
                      >
                        {p.name}
                      </p>
                      {isPack && p.packSalePrice ? (
                        <div>
                          <p className="text-sm font-bold text-emerald-600">
                            {p.packSalePrice.toLocaleString("fr-FR")} F{" "}
                            <span className="text-[10px] font-medium text-slate-500">
                              / {unitLabel(productUnit)}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {p.salePrice.toLocaleString("fr-FR")} F / pièce
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-emerald-600">
                          {p.salePrice.toLocaleString("fr-FR")} F{" "}
                          <span className="text-[10px] font-medium text-slate-500">
                            / pièce
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5 truncate" title={formatStockDisplay(p.quantity, productUnit, unitsPerPack)}>
                        {formatStockDisplay(p.quantity, productUnit, unitsPerPack)}
                      </p>
                      <button
                        type="button"
                        onClick={() => openAddModal(p)}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                      >
                        <Plus size={13} /> Ajouter au panier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne panier (visible uniquement si non vide) */}
        {cart.length > 0 && (
          <div className="h-fit space-y-4 lg:sticky lg:top-4">
            <form
              onSubmit={handleCreateSale}
              className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <ShoppingCart size={18} className="text-emerald-600" />
                  Panier
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {cartQty} article(s)
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={resetCartAndClient}
                  className="text-xs text-gray-400 hover:text-red-500"
                  title="Vider le panier"
                >
                  Vider
                </button>
              </div>

              {/* Articles */}
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {cart.map((item) => {
                  const lineKey = cartLineKey(item.productId, item.soldUnit);
                  const mult =
                    item.soldUnit === "PIECE"
                      ? 1
                      : Math.max(1, item.unitsPerPack);
                  const otherPieces = piecesInCartForProduct(
                    item.productId,
                    lineKey,
                  );
                  const maxQty = Math.max(
                    1,
                    Math.floor((item.stock - otherPieces) / mult),
                  );
                  return (
                    <div
                      key={lineKey}
                      className="rounded-xl border border-gray-200 p-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-800 leading-tight">
                            {item.productName}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            {item.soldUnit === "PIECE"
                              ? "Vente à la pièce"
                              : `${unitLabel(item.soldUnit, item.quantity > 1)} (${item.quantity * mult} pcs)`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(item.productId, item.soldUnit)
                          }
                          className="shrink-0 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-gray-300">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(
                                item.productId,
                                item.soldUnit,
                                item.quantity - 1,
                              )
                            }
                            className="px-2 py-1 text-gray-500 hover:text-slate-900"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={maxQty}
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartQty(
                                item.productId,
                                item.soldUnit,
                                Number(e.target.value),
                              )
                            }
                            className="w-10 border-x border-gray-300 py-1 text-center text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(
                                item.productId,
                                item.soldUnit,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= maxQty}
                            className="px-2 py-1 text-gray-500 hover:text-slate-900 disabled:opacity-30"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <input
                          type="number"
                          min={1}
                          value={item.unitPrice}
                          readOnly={!admin}
                          disabled={!admin}
                          title={
                            admin
                              ? "Prix unitaire modifiable"
                              : "Tarif appliqué automatiquement selon le palier"
                          }
                          onChange={(e) =>
                            updateCartPrice(
                              item.productId,
                              item.soldUnit,
                              Number(e.target.value),
                            )
                          }
                          className={`w-full rounded-lg border border-gray-300 px-2 py-1 text-right text-sm outline-none focus:border-emerald-500 ${
                            !admin
                              ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                              : ""
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-right text-xs font-semibold text-slate-600">
                        = {fmt(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-semibold text-slate-700">
                  Total panier
                </span>
                <span className="text-lg font-bold text-emerald-700">
                  {fmt(cartTotal)}
                </span>
              </div>

              {/* Paiement */}
              <div className="space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-700">
                      Montant payé
                    </label>
                    {paidAmountTouched && paidAmount !== cartTotal && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaidAmountTouched(false);
                          setPaidAmount(cartTotal);
                        }}
                        className="text-xs text-emerald-700 hover:underline"
                      >
                        Payer la totalité
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={cartTotal}
                    value={paidAmount}
                    onChange={(e) => {
                      setPaidAmountTouched(true);
                      setPaidAmount(Number(e.target.value));
                    }}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {paidAmount >= cartTotal ? (
                      <span className="text-emerald-600 font-medium">
                        Vente payée intégralement
                      </span>
                    ) : paidAmount > 0 ? (
                      <span className="text-yellow-600 font-medium">
                        Paiement partiel — reste {fmt(cartTotal - paidAmount)}
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Vente à crédit — rien n'est encaissé maintenant
                      </span>
                    )}
                  </p>
                </div>
                {paidAmount > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">
                      Méthode de paiement
                    </label>
                    <PaymentMethodSelect
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Client / note */}
              <div className="space-y-3 border-t border-gray-100 pt-3">
                {paidAmount < cartTotal && !clientId && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 flex items-center justify-between gap-2">
                    <span>
                      Vente à crédit : sélectionnez ou créez une fiche client.
                    </span>
                    {!showQuickClientForm && (
                      <button
                        type="button"
                        onClick={() => openQuickClientForm()}
                        className="shrink-0 font-semibold text-emerald-700 hover:underline"
                      >
                        + Créer
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-medium text-gray-700">
                      Client enregistré {paidAmount < cartTotal ? "*" : ""}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        showQuickClientForm
                          ? setShowQuickClientForm(false)
                          : openQuickClientForm()
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <UserPlus size={13} />
                      {showQuickClientForm ? "Fermer" : "Nouveau client"}
                    </button>
                  </div>

                  {showQuickClientForm ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-2">
                      <p className="text-xs font-semibold text-emerald-900">
                        Création rapide de client
                      </p>
                      <input
                        type="text"
                        value={quickClientName}
                        onChange={(e) => setQuickClientName(e.target.value)}
                        placeholder="Nom complet *"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="tel"
                        value={quickClientPhone}
                        onChange={(e) => setQuickClientPhone(e.target.value)}
                        placeholder="Téléphone *"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={quickClientAddress}
                        onChange={(e) => setQuickClientAddress(e.target.value)}
                        placeholder="Adresse (optionnel)"
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={creatingClient}
                          onClick={handleQuickCreateClient}
                          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {creatingClient ? "Création..." : "Créer et sélectionner"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuickClientForm(false)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="search"
                        value={
                          clientId
                            ? selectedClient?.name ||
                              clients.find((client) => client.id === clientId)?.name ||
                              ""
                            : clientSearch
                        }
                        onChange={(event) => {
                          setClientId("");
                          setSelectedClient(null);
                          setCustomerName("");
                          setClientSearch(event.target.value);
                        }}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        placeholder="Rechercher par nom, téléphone ou email..."
                      />
                      {!clientId && clientSearch.trim() && (
                        <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                          {clients.length ? (
                            clients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                  setClientId(client.id);
                                  setSelectedClient(client);
                                  setClientSearch("");
                                  setCustomerName("");
                                }}
                                className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm hover:bg-emerald-50"
                              >
                                <span className="font-medium">{client.name}</span>
                                <span className="ml-2 text-gray-500">{client.phone}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2.5 space-y-2">
                              <p className="text-xs text-gray-400">
                                Aucun client trouvé pour « {clientSearch.trim()} »
                              </p>
                              <button
                                type="button"
                                onClick={() => openQuickClientForm(clientSearch)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                <UserPlus size={13} />
                                Créer « {clientSearch.trim()} » maintenant
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {clientId && (
                        <button
                          type="button"
                          onClick={() => {
                            setClientId("");
                            setSelectedClient(null);
                          }}
                          className="mt-1 text-xs text-emerald-700 hover:underline"
                        >
                          Changer de client
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Ou Client Passager...
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (e.target.value) {
                        setClientId("");
                        setSelectedClient(null);
                      }
                    }}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={
                      paidAmount < cartTotal
                        ? "Indisponible pour une vente à crédit"
                        : "Nom du client..."
                    }
                    disabled={!!clientId || paidAmount < cartTotal}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Optionnel..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !cart.length}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Enregistrement..." : "Valider la vente"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal Ajouter au panier */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Ajouter au panier
              </h3>
              <button type="button" onClick={closeAddModal}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {modalProduct.imageUrl ? (
                  <img
                    src={modalProduct.imageUrl}
                    alt={modalProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg font-bold text-slate-300">
                    {modalProduct.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {modalProduct.name}
                </p>
                <p className="text-xs text-gray-400">
                  En stock :{" "}
                  {formatStockDisplay(
                    modalProduct.quantity,
                    modalProduct.unitType,
                    modalProduct.unitsPerPack,
                  )}
                </p>
              </div>
            </div>

            {modalProduct.unitType && modalProduct.unitType !== "PIECE" && (
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Vendre en :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        unit: modalProduct.unitType,
                        label: `${
                          modalProduct.unitType === "CARTON"
                            ? "Carton"
                            : "Douzaine"
                        } (${modalProduct.unitsPerPack || 12} pcs)`,
                        disabled:
                          modalProduct.quantity <
                          (modalProduct.unitsPerPack || 12),
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
                      onClick={() => handleModalUnitChange(opt.unit)}
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
                      modalProduct.quantity /
                        (modalUnit === "PIECE"
                          ? 1
                          : modalProduct.unitsPerPack || 1),
                    ),
                  )}
                  value={modalQty}
                  onChange={(e) => handleModalQtyChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                {modalUnit !== "PIECE" && (
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">
                    = {modalQty * (modalProduct.unitsPerPack || 1)} pièces
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
                className={`mt-2 text-xs font-medium ${
                  modalTier === "wholesale"
                    ? "text-purple-600"
                    : modalTier === "semiWholesale"
                      ? "text-blue-600"
                      : "text-gray-400"
                }`}
              >
                ✓ {modalSuggestion}
              </p>
            )}

            <p className="mt-4 text-right text-sm text-gray-500">
              Sous-total :{" "}
              <span className="font-bold text-emerald-700">
                {fmt(modalQty * modalPrice)}
              </span>
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={confirmAddToCart}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Ajouter au panier
              </button>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dernières ventes */}
      {showRecentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Dernières ventes
              </h2>
              <button type="button" onClick={() => setShowRecentModal(false)}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
              {recentLoading ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-400">
                  Chargement...
                </div>
              ) : !recentSales.length ? (
                <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-400">
                  Aucune vente trouvée.
                </div>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="rounded-2xl border border-gray-100 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {sale.items
                              .map((item) => item.productName)
                              .join(", ")}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[sale.status]}`}
                          >
                            {statusLabel[sale.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sale.client?.name ||
                            sale.customerName ||
                            "Client non précisé"}{" "}
                          •{" "}
                          {new Date(sale.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                        </p>
                        <div className="mt-1 text-xs text-gray-400">
                          {sale.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          article(s) • Total :{" "}
                          <strong className="text-slate-700">
                            {fmt(sale.totalAmount)}
                          </strong>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = `/invoices?search=${encodeURIComponent(sale.invoiceNumber || String(sale.id))}`;
                        }}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Voir la facture
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                to="/sales/history"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Voir tout l'historique →
              </Link>
            </div>
          </div>
        </div>
      )}

      {isUpgradeModalOpen &&
        showModal(
          isUpgradeModalOpen,
          () => setIsUpgradeModalOpen(false),
          "exportPdfOrExcel",
        )}
    </section>
  );
}
