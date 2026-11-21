import { History, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showModal } from "../components/upgradeModal";
import { AddToCartModal } from "../features/sales/components/AddToCartModal";
import { ProductCatalogCard } from "../features/sales/components/ProductCatalogCard";
import { RecentSalesModal } from "../features/sales/components/RecentSalesModal";
import { SalesCartPanel } from "../features/sales/components/SalesCartPanel";
import { cartLineKey, type CartItem } from "../features/sales/types";
import {
  getCategories,
  getCurrentCash,
  getProducts,
  getSales,
} from "../services/index";
import { useSubscription } from "../hooks/useSubscription";
import { getStoredUser, isAdmin } from "../types/auth";
import type {
  Category,
  PackagingUnit,
  Product,
  Sale,
} from "../types/index";
import {
  computeUnitPrice,
  formatStockDisplay,
  unitLabel,
} from "../utils/packaging";

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
  const { subscription } = useSubscription();
  const [salesCount, setSalesCount] = useState<number>(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Panier & modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
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
      const [prodRes, catRes] = await Promise.all([
        getProducts({ limit: 500 }),
        getCategories(),
      ]);
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

  const maxLimit = subscription?.limits.sales;
  const isLimitReached =
    maxLimit !== null && maxLimit !== undefined && salesCount >= maxLimit;
  const isLimitReachedApproche =
    maxLimit !== null &&
    maxLimit !== undefined &&
    salesCount < maxLimit &&
    salesCount >= Math.ceil(maxLimit * 0.8);

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

  const piecesInCartForProduct = (productId: number, excludeKey?: string) =>
    cart.reduce((sum, item) => {
      if (item.productId !== productId) return sum;
      if (
        excludeKey &&
        cartLineKey(item.productId, item.soldUnit) === excludeKey
      ) {
        return sum;
      }
      const mult =
        item.soldUnit === "PIECE" ? 1 : Math.max(1, item.unitsPerPack);
      return sum + item.quantity * mult;
    }, 0);

  const handleConfirmAddToCart = (
    product: Product,
    unit: PackagingUnit,
    qty: number,
    price: number,
  ) => {
    if (!Number.isInteger(qty) || qty <= 0 || price <= 0) {
      return toast.error("Quantité et prix invalides");
    }
    const productUnit: PackagingUnit = product.unitType || "PIECE";
    const unitsPerPack = product.unitsPerPack || 1;
    const multiplier = unit === "PIECE" ? 1 : Math.max(1, unitsPerPack);
    const addedPieces = qty * multiplier;
    const alreadyPieces = piecesInCartForProduct(product.id);

    if (alreadyPieces + addedPieces > product.quantity) {
      return toast.error(
        `Stock insuffisant (${formatStockDisplay(
          product.quantity,
          productUnit,
          unitsPerPack,
        )} disponibles)`,
      );
    }

    const lineKey = cartLineKey(product.id, unit);
    const existingLine = cart.find(
      (c) => cartLineKey(c.productId, c.soldUnit) === lineKey,
    );
    const totalQtyInUnit = (existingLine?.quantity || 0) + qty;

    const tierForModalQty = computeUnitPrice(product, qty, unit);
    const adminOverrode = admin && price !== tierForModalQty.price;
    const tierForTotalQty = computeUnitPrice(product, totalQtyInUnit, unit);
    const resolvedUnitPrice = adminOverrode ? price : tierForTotalQty.price;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (c) => cartLineKey(c.productId, c.soldUnit) === lineKey,
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const prevItem = updated[existingIdx];
        const nextOverridden = adminOverrode || prevItem.priceOverridden;
        const nextPrice = adminOverrode
          ? price
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
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          soldUnit: unit,
          unitType: productUnit,
          unitsPerPack,
          quantity: qty,
          unitPrice: resolvedUnitPrice,
          stock: product.quantity,
          salePrice: product.salePrice,
          packSalePrice: product.packSalePrice,
          semiWholesalePrice: product.semiWholesalePrice,
          semiWholesaleMinQty: product.semiWholesaleMinQty,
          wholesalePrice: product.wholesalePrice,
          wholesaleMinQty: product.wholesaleMinQty,
          priceOverridden: adminOverrode,
        },
      ];
    });
    toast.success(
      `${product.name} (${qty} ${unitLabel(unit, qty > 1)}) ajouté au panier`,
    );
    setModalProduct(null);
  };

  const removeFromCart = (productId: number, soldUnit: PackagingUnit) => {
    const key = cartLineKey(productId, soldUnit);
    setCart((prev) =>
      prev.filter((c) => cartLineKey(c.productId, c.soldUnit) !== key),
    );
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
                Plus que {(maxLimit as number) - salesCount} ventes disponibles
                ce mois
              </p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Vous approchez de la limite de votre abonnement ({maxLimit}{" "}
                ventes/mois).
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
                Vous avez utilisé vos {maxLimit} ventes ce mois.
                Réinitialisation le 1er du mois prochain.
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
            <div
              className={`grid grid-cols-2 gap-4 ${
                cart.length
                  ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
              }`}
            >
              {filteredProducts.map((p) => {
                const inCartCount = cart
                  .filter((c) => c.productId === p.id)
                  .reduce((sum, c) => sum + c.quantity, 0);
                return (
                  <ProductCatalogCard
                    key={p.id}
                    product={p}
                    inCartCount={inCartCount}
                    onAdd={setModalProduct}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne panier */}
        {cart.length > 0 && (
          <SalesCartPanel
            cart={cart}
            admin={admin}
            cashOpen={cashOpen}
            piecesInCartForProduct={piecesInCartForProduct}
            onUpdateQty={updateCartQty}
            onUpdatePrice={updateCartPrice}
            onRemoveItem={removeFromCart}
            onClearCart={() => setCart([])}
            onSaleCreated={async () => {
              await Promise.all([fetchProducts(), fetchRecentSales()]);
            }}
          />
        )}
      </div>

      {/* Modal Ajouter au panier */}
      {modalProduct && (
        <AddToCartModal
          product={modalProduct}
          admin={admin}
          onConfirm={handleConfirmAddToCart}
          onClose={() => setModalProduct(null)}
        />
      )}

      {/* Modal Dernières ventes */}
      {showRecentModal && (
        <RecentSalesModal
          loading={recentLoading}
          sales={recentSales}
          onClose={() => setShowRecentModal(false)}
        />
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
