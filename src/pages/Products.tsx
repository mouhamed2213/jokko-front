import { AlertTriangle, Lock, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { showModal } from "../components/upgradeModal";
import { HighlightedProductBanner } from "../features/products/components/HighlightedProductBanner";
import { ProductCard } from "../features/products/components/ProductCard";
import { ProductForm } from "../features/products/components/ProductForm";
import { StockMovementModal } from "../features/products/components/StockMovementModal";
import {
  createCategory,
  deleteProduct,
  getCategories,
  getProductById,
  getProducts,
  getSubscription,
  getSuppliers,
} from "../services/index";
import { isAdmin } from "../types/auth";
import type {
  Category,
  Product,
  SubscriptionInfo,
  Supplier,
} from "../types/index";

export default function Products() {
  const [subscription, setSubscription] = useState<SubscriptionInfo>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  // Formulaire création / édition
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Création catégorie rapide
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Modal limite abonnement
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Mouvements de stock rapides
  const [stockModal, setStockModal] = useState<{
    product: Product;
    mode: "ENTRY" | "OUT";
  } | null>(null);

  // Produit signalé depuis une alerte de stock
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [highlightedProduct, setHighlightedProduct] = useState<Product | null>(
    null,
  );
  const [loadingHighlight, setLoadingHighlight] = useState(false);

  const admin = isAdmin();
  const maxProducts = subscription?.limits.products;
  const warningThreshold =
    maxProducts === null || maxProducts === undefined
      ? null
      : Math.ceil(maxProducts * 0.8);
  const isAlmostReached =
    warningThreshold !== null && totalProducts >= warningThreshold;
  const limiteReached =
    maxProducts !== null &&
    maxProducts !== undefined &&
    totalProducts >= maxProducts;

  const fetchData = async () => {
    setLoading(true);
    try {
      getSubscription().then(setSubscription);

      const [prodRes, cats, sups] = await Promise.all([
        getProducts({ search, categoryId: categoryFilter, page, limit: 25 }),
        getCategories(),
        getSuppliers({ page: 1, limit: 20 }),
      ]);
      setProducts(prodRes.data);
      setTotalProducts(prodRes.totalProducts);
      setTotal(prodRes.pagination.total);
      setTotalPages(prodRes.pagination.totalPages);
      setCategories(cats);
      setSuppliers(sups.data);
    } catch {
      toast.error("Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoryFilter, page]);

  useEffect(() => {
    if (!highlightId) {
      setHighlightedProduct(null);
      return;
    }
    setLoadingHighlight(true);
    getProductById(Number(highlightId))
      .then(setHighlightedProduct)
      .catch(() => {
        toast.error("Produit introuvable");
        setHighlightedProduct(null);
      })
      .finally(() => setLoadingHighlight(false));
  }, [highlightId]);

  const clearHighlight = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("highlight");
    setSearchParams(next);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduct(id);
      toast.success("Produit supprimé");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory(newCategoryName.trim());
      toast.success("Catégorie créée");
      setNewCategoryName("");
      setShowCategoryForm(false);
      const cats = await getCategories();
      setCategories(cats);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  return (
    <section className="space-y-6">
      {(isAlmostReached || limiteReached) && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl p-4 text-sm border ${
            limiteReached
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={limiteReached ? "text-red-600" : "text-amber-600"}
            />
            <span>
              {limiteReached
                ? `Limite atteinte : Vous avez atteint le quota maximum de ${totalProducts}/${maxProducts} produits autorisés par votre abonnement.`
                : `Attention : Vous approchez de la limite de produits (${totalProducts}/${maxProducts}).`}
            </span>
          </div>

          <a
            onClick={() => setIsUpgradeModalOpen(true)}
            className={
              limiteReached
                ? "shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                : "shrink-0 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition"
            }
          >
            Passer au plan supérieur
          </a>
        </div>
      )}

      {/* Produit signalé depuis une alerte de stock */}
      {highlightId && (
        <HighlightedProductBanner
          loading={loadingHighlight}
          product={highlightedProduct}
          admin={admin}
          onClear={clearHighlight}
          onStockEntry={(p) => setStockModal({ product: p, mode: "ENTRY" })}
          onEdit={handleEdit}
        />
      )}

      {/* Barre de recherche */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={categoryFilter ?? ""}
          onChange={(e) => {
            setCategoryFilter(
              e.target.value ? Number(e.target.value) : undefined,
            );
            setPage(1);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {admin && (
          <>
            <button
              onClick={() => setShowCategoryForm((v) => !v)}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              + Catégorie
            </button>
            <button
              onClick={() => {
                if (limiteReached) {
                  setIsUpgradeModalOpen(true);
                }
                setEditingProduct(null);
                setShowForm(true);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition ${
                limiteReached
                  ? "bg-amber-600 hover:bg-amber-700 shadow-sm"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {limiteReached ? <Lock size={16} /> : <Plus size={16} />}
              Nouveau produit
            </button>
          </>
        )}
      </div>

      {/* Nouvelle catégorie */}
      {showCategoryForm && (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nom de la catégorie"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleCreateCategory}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            Créer
          </button>
          <button
            onClick={() => setShowCategoryForm(false)}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Formulaire produit */}
      {showForm && (
        <ProductForm
          editingProduct={editingProduct}
          categories={categories}
          initialSuppliers={suppliers}
          hasSubscription={Boolean(subscription)}
          onSuccess={async () => {
            closeForm();
            await fetchData();
          }}
          onCancel={closeForm}
        />
      )}

      <p className="text-sm text-gray-500">{total} produit(s)</p>

      {/* Grille produits */}
      {loading ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-400 font-medium">
          Chargement des produits...
        </div>
      ) : !products.length ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-400 font-medium">
          {search
            ? `Aucun résultat pour "${search}"`
            : "Aucun produit enregistré."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              admin={admin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpenStockModal={(p, mode) => setStockModal({ product: p, mode })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm border border-slate-100">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Précédent
        </button>
        <span className="text-sm text-gray-500">
          Page <strong className="text-slate-900">{page}</strong> sur{" "}
          <strong className="text-slate-900">{totalPages}</strong>
          <span className="ml-2 text-gray-400">({total} au total)</span>
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Suivant →
        </button>
      </div>

      {isUpgradeModalOpen &&
        showModal(
          isUpgradeModalOpen,
          () => setIsUpgradeModalOpen(false),
          "maxProductReached",
        )}

      {/* Modal Entrée / Sortie de stock */}
      {stockModal && (
        <StockMovementModal
          product={stockModal.product}
          mode={stockModal.mode}
          initialSuppliers={suppliers}
          onClose={() => setStockModal(null)}
          onSuccess={async (productId) => {
            await fetchData();
            if (highlightId && Number(highlightId) === productId) {
              getProductById(Number(highlightId)).then(setHighlightedProduct);
            }
          }}
        />
      )}
    </section>
  );
}
