import {
  History,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
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
import { getStoredUser } from "../types/auth";
import type {
  Category,
  Client,
  Product,
  Sale,
  SubscriptionInfo,
} from "../types/index";
import { showModal } from "../components/upgradeModal";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type CartItem = {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  stock: number;
};

type PriceTier = "detail" | "semiWholesale" | "wholesale";

const statusBadge: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
};
const statusLabel: Record<string, string> = {
  PAID: "Payée",
  PARTIAL: "Partielle",
  UNPAID: "Non réglée",
};

export default function Sales() {
  const user = getStoredUser();

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
  const [clientSearch, setClientSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [paidAmountTouched, setPaidAmountTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  // Modal "Ajouter au panier"
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
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
    .filter(
      (p) =>
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
    );

  const updatePriceSuggestion = (tier: PriceTier, tiers: any) => {
    if (tier === "wholesale" && tiers.wholesale) {
      setModalSuggestion(`Prix Gros appliqué (≥${tiers.wholesale.minQty} unités)`);
    } else if (tier === "semiWholesale" && tiers.semiWholesale) {
      setModalSuggestion(
        `Prix Demi-gros appliqué (≥${tiers.semiWholesale.minQty} unités)`,
      );
    } else {
      setModalSuggestion("Prix Détail");
    }
  };

  const openAddModal = (product: Product) => {
    setModalProduct(product);
    setModalQty(1);
    setModalPrice(product.salePrice);
    setModalTier("detail");
    setModalSuggestion("");
  };

  const closeAddModal = () => setModalProduct(null);

  const handleModalQtyChange = async (qty: number) => {
    setModalQty(qty);
    if (!modalProduct || qty <= 0) return;
    if (!modalProduct.semiWholesalePrice && !modalProduct.wholesalePrice) return;
    try {
      const suggestion = await getSuggestedPrice(modalProduct.id, qty);
      setModalPrice(suggestion.suggestedPrice);
      setModalTier(suggestion.tier);
      updatePriceSuggestion(suggestion.tier, suggestion.tiers);
    } catch {
      /* silencieux */
    }
  };

  const confirmAddToCart = () => {
    if (!modalProduct || modalQty <= 0 || modalPrice <= 0) {
      return toast.error("Quantité et prix invalides");
    }
    const alreadyInCart =
      cart.find((c) => c.productId === modalProduct.id)?.quantity || 0;
    if (alreadyInCart + modalQty > modalProduct.quantity) {
      return toast.error(
        `Stock insuffisant (${modalProduct.quantity} disponibles)`,
      );
    }
    setCart((prev) => {
      const existing = prev.findIndex((c) => c.productId === modalProduct.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + modalQty,
          unitPrice: modalPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: modalProduct.id,
          productName: modalProduct.name,
          imageUrl: modalProduct.imageUrl,
          quantity: modalQty,
          unitPrice: modalPrice,
          stock: modalProduct.quantity,
        },
      ];
    });
    toast.success(`${modalProduct.name} ajouté au panier`);
    closeAddModal();
  };

  const updateCartQty = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((c) =>
        c.productId === productId
          ? { ...c, quantity: Math.min(quantity, c.stock) }
          : c,
      ),
    );
  };

  const updateCartPrice = (productId: number, unitPrice: number) => {
    setCart((prev) =>
      prev.map((c) => (c.productId === productId ? { ...c, unitPrice } : c)),
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const resetCartAndClient = () => {
    setCart([]);
    setClientId("");
    setClientSearch("");
    setCustomerName("");
    setNote("");
    setPaidAmount(0);
    setPaidAmountTouched(false);
    setPaymentMethod("CASH");
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
          <a
            href="/settings/upgrade"
            className="shrink-0 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
          >
            Passer au plan Basic →
          </a>
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
          <a
            href="/settings/upgrade"
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Upgrader maintenant →
          </a>
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
                const inCartQty =
                  cart.find((c) => c.productId === p.id)?.quantity || 0;
                return (
                  <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="h-24 w-full bg-slate-100 overflow-hidden">
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
                      {inCartQty > 0 && (
                        <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold text-white shadow">
                          {inCartQty}
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
                      <p className="text-sm font-bold text-emerald-600">
                        {p.salePrice.toLocaleString("fr-FR")} F
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.quantity} en stock
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
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="rounded-xl border border-gray-200 p-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-tight">
                        {item.productName}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
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
                            updateCartQty(item.productId, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-500 hover:text-slate-900"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQty(item.productId, Number(e.target.value))
                          }
                          className="w-10 border-x border-gray-300 py-1 text-center text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQty(item.productId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="px-2 py-1 text-gray-500 hover:text-slate-900 disabled:opacity-30"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateCartPrice(item.productId, Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 text-right text-sm outline-none focus:border-emerald-500"
                      />
                    </div>
                    <p className="mt-1 text-right text-xs font-semibold text-slate-600">
                      = {fmt(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
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
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Client enregistré
                  </label>
                  <input
                    type="search"
                    value={
                      clientId
                        ? clients.find((client) => client.id === clientId)?.name || ""
                        : clientSearch
                    }
                    onChange={(event) => {
                      setClientId("");
                      setCustomerName("");
                      setClientSearch(event.target.value);
                    }}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Rechercher par nom, téléphone ou email..."
                  />
                  {!clientId && clientSearch.trim() && (
                    <div className="mt-2 max-h-32 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                      {clients.length ? (
                        clients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setClientId(client.id);
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
                        <p className="px-3 py-2 text-sm text-gray-400">
                          Aucun client trouvé
                        </p>
                      )}
                    </div>
                  )}
                  {clientId && (
                    <button
                      type="button"
                      onClick={() => setClientId("")}
                      className="mt-1 text-xs text-emerald-700 hover:underline"
                    >
                      Changer de client
                    </button>
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
                      if (e.target.value) setClientId("");
                    }}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    placeholder="Nom du client..."
                    disabled={!!clientId}
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
                  {modalProduct.quantity} en stock
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Quantité
                </label>
                <input
                  type="number"
                  min={1}
                  max={modalProduct.quantity}
                  value={modalQty}
                  onChange={(e) => handleModalQtyChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  min={0}
                  value={modalPrice}
                  onChange={(e) => setModalPrice(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-emerald-500 ${
                    modalTier === "wholesale"
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
