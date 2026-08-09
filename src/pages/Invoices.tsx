import { CreditCard, Filter, Lock, Pencil, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelect from "../components/Paymentmethodselect";
import {
  addInvoicePayment,
  getClients,
  getCurrentCash,
  getInvoices,
  getProducts,
  updateSale,
} from "../services/index";
import { getStoredUser, isAdmin } from "../types/auth";
import type { Client, Product, Sale } from "../types/index";
import { printInvoice as doPrint } from "../utils/printInvoice";
import { showModal } from "../components/upgradeModal";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type EditCartItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: number; // stock actuellement disponible (hors réservation de cette facture)
};

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

export default function Invoices() {
  const [invoices, setInvoices] = useState<Sale[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalOutstanding: 0,
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);

  // Filtres
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Paiement
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Sale | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [paySubmitting, setPaySubmitting] = useState(false);

  // Détail
  const [detailInvoice, setDetailInvoice] = useState<Sale | null>(null);
  const [printMenuFor, setPrintMenuFor] = useState<number | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // Modification de facture
  const [editingInvoice, setEditingInvoice] = useState<Sale | null>(null);
  const [editItems, setEditItems] = useState<EditCartItem[]>([]);
  const [editClientId, setEditClientId] = useState<number | "">("");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editAddProductId, setEditAddProductId] = useState<number>(0);
  const [editAddQty, setEditAddQty] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const user = getStoredUser();

  const checkCash = async () => {
    try {
      const res = await getCurrentCash();
      setCashOpen(res.open);
    } catch {
      setCashOpen(false);
    }
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoices({
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 7,
      });
      setInvoices(res.data);
      setStats(res.stats);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error("Erreur chargement factures");
    } finally {
      setLoading(false);
    }
  }, [search, status, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchInvoices();
    checkCash();
  }, [fetchInvoices]);

  const openPayment = (invoice: Sale) => {
    setPayingId(invoice.id);
    setPayingInvoice(invoice);
    setPayAmount(String(invoice.remaining));
    setPayNote("");
  };

  const handlePayment = async () => {
    if (!cashOpen) {
      return toast.error(
        "⚠️ La caisse est fermée. Ouvrez la caisse avant d'enregistrer un paiement.",
        { duration: 5000 },
      );
    }
    if (!payingId || !payAmount || Number(payAmount) <= 0) {
      return toast.error("Montant invalide");
    }
    setPaySubmitting(true);
    try {
      await addInvoicePayment(
        payingId,
        Number(payAmount),
        payNote || undefined,
        payMethod,
      );
      toast.success("Paiement enregistré — caisse mise à jour");
      setPayingId(null);
      setPayingInvoice(null);
      setPayAmount("");
      setPayMethod("CASH");
      await fetchInvoices();
      if (detailInvoice?.id === payingId) {
        const res = await getInvoices({
          search: String(payingId),
          page: 1,
          limit: 1,
        });
        if (res.data[0]) setDetailInvoice(res.data[0]);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur paiement");
    } finally {
      setPaySubmitting(false);
    }
  };

  const canEdit = (invoice: Sale) =>
    isAdmin() && invoice.status !== "PAID" && invoice.paidAmount === 0;

  const openEdit = async (invoice: Sale) => {
    if (!canEdit(invoice)) return;
    try {
      const [productsRes, clientsRes] = await Promise.all([
        getProducts({ limit: 1000 }),
        getClients(),
      ]);
      setProducts(productsRes.data);
      setClients(clientsRes.client);
    } catch {
      toast.error("Erreur chargement produits/clients");
      return;
    }
    setEditingInvoice(invoice);
    setEditItems(
      invoice.items.map((it) => ({
        productId: it.productId as number,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        stock: 0, // sera recalculé via le produit sélectionné le cas échéant
      })),
    );
    setEditClientId(invoice.client?.id || "");
    setEditCustomerName(invoice.customerName || "");
    setEditNote(invoice.note || "");
    setEditAddProductId(0);
    setEditAddQty(1);
  };

  const updateEditItemQty = (productId: number, quantity: number) => {
    setEditItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity } : it)),
    );
  };

  const updateEditItemPrice = (productId: number, unitPrice: number) => {
    setEditItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, unitPrice } : it)),
    );
  };

  const removeEditItem = (productId: number) => {
    setEditItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const addEditItem = () => {
    if (!editAddProductId || editAddQty <= 0) {
      return toast.error("Sélectionnez un produit et une quantité valide");
    }
    const product = products.find((p) => p.id === editAddProductId);
    if (!product) return;
    setEditItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id
            ? { ...it, quantity: it.quantity + editAddQty }
            : it,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: editAddQty,
          unitPrice: product.salePrice,
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
    if (!editingInvoice) return;
    if (editItems.length === 0) {
      return toast.error("La facture doit contenir au moins un article");
    }
    if (!editClientId && !editCustomerName.trim()) {
      return toast.error("Client ou nom du client passager requis");
    }
    setEditSubmitting(true);
    try {
      await updateSale(editingInvoice.id, {
        clientId: editClientId ? Number(editClientId) : null,
        customerName: editCustomerName || undefined,
        note: editNote || undefined,
        items: editItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      });
      toast.success("Facture modifiée avec succès");
      setEditingInvoice(null);
      await fetchInvoices();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!user) {
    toast.error("User not found");
    return;
  }

  const printA4 = (invoice: Sale) =>
    doPrint(invoice, user, "A4", localStorage.getItem("shopLogo") || undefined);
  const printThermal = (invoice: Sale) => doPrint(invoice, user, "THERMAL");

  return (
    <section className="space-y-6">
      {/* Alerte caisse fermée */}
      {cashOpen === false && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-semibold text-red-800">
                Caisse fermée — Paiements bloqués
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                Ouvrez la caisse pour encaisser des paiements sur les factures.
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

      {/* Stats globales */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "Total factures",
            value: stats.totalInvoices,
            color: "text-slate-900",
          },
          {
            label: "Chiffre d'affaires",
            value: fmt(stats.totalRevenue),
            color: "text-slate-900",
          },
          {
            label: "Montant encaissé",
            value: fmt(stats.totalCollected),
            color: "text-emerald-600",
          },
          {
            label: "Reste à encaisser",
            value: fmt(stats.totalOutstanding),
            color: "text-red-600",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`mt-2 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Barre de recherche */}
      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-50">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par numéro, client, téléphone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">Tous statuts</option>
            <option value="PAID">Payées</option>
            <option value="PARTIAL">Partielles</option>
            <option value="UNPAID">Non réglées</option>
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Filter size={15} />
            Filtres dates
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
                className="mt-4 rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                Effacer dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal paiement */}
      {payingId && payingInvoice && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Enregistrer un paiement — {payingInvoice.invoiceNumber}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Client :{" "}
                {payingInvoice.client?.name || payingInvoice.customerName} •
                Reste :{" "}
                <strong className="text-red-600">
                  {fmt(payingInvoice.remaining)}
                </strong>
              </p>
            </div>
            <button
              onClick={() => {
                setPayingId(null);
                setPayingInvoice(null);
              }}
            >
              <X size={20} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Montant reçu (FCFA)
              </label>
              <input
                type="number"
                min={1}
                max={payingInvoice.remaining}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mode de paiement
              </label>
              <PaymentMethodSelect
                value={payMethod}
                onChange={setPayMethod}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Note (optionnel)
              </label>
              <input
                type="text"
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="Ex: Versement espèces..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePayment}
                disabled={paySubmitting}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {paySubmitting
                  ? "Enregistrement..."
                  : "✓ Confirmer le paiement"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-600">
            💡 Ce paiement sera automatiquement enregistré dans la caisse si
            elle est ouverte.
          </p>
        </div>
      )}

      {/* Modal modification facture */}
      {editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Modifier — {editingInvoice.invoiceNumber}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Modification possible tant qu'aucun paiement n'a été reçu.
                </p>
              </div>
              <button onClick={() => setEditingInvoice(null)}>
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
                    key={it.productId}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span className="flex-1 text-sm font-medium text-slate-800">
                      {it.productName}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateEditItemQty(it.productId, Number(e.target.value))
                      }
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:border-emerald-500"
                    />
                    <input
                      type="number"
                      min={0}
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateEditItemPrice(it.productId, Number(e.target.value))
                      }
                      className="w-28 rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-right outline-none focus:border-emerald-500"
                    />
                    <span className="w-24 text-right text-sm font-semibold">
                      {fmt(it.quantity * it.unitPrice)}
                    </span>
                    <button
                      onClick={() => removeEditItem(it.productId)}
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
                  onClick={addEditItem}
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
                {fmt(editTotal)}
              </span>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleUpdateSale}
                disabled={editSubmitting}
                className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {editSubmitting ? "Enregistrement..." : "✓ Enregistrer les modifications"}
              </button>
              <button
                onClick={() => setEditingInvoice(null)}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail facture */}
      {detailInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {detailInvoice.invoiceNumber}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(detailInvoice.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[detailInvoice.status]}`}
                >
                  {statusLabel[detailInvoice.status]}
                </span>
                <button onClick={() => setDetailInvoice(null)}>
                  <X size={20} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            {/* Client */}
            <div className="rounded-xl bg-slate-50 px-4 py-3 mb-4">
              <p className="text-xs text-gray-400">Client</p>
              <p className="font-semibold text-slate-900">
                {detailInvoice.client?.name ||
                  detailInvoice.customerName ||
                  "Client non précisé"}
              </p>
              {detailInvoice.client?.phone && (
                <p className="text-sm text-gray-500">
                  {detailInvoice.client.phone}
                </p>
              )}
            </div>

            {/* Articles */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b text-gray-500 text-xs">
                  <th className="pb-2 text-left">Produit</th>
                  <th className="pb-2 text-right">Qté</th>
                  <th className="pb-2 text-right">P.U</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {detailInvoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{fmt(item.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold">
                      {fmt(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold">
                  {fmt(detailInvoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payé</span>
                <span className="font-bold text-emerald-600">
                  {fmt(detailInvoice.paidAmount)}
                </span>
              </div>
              {detailInvoice.remaining > 0 && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-red-600">Reste</span>
                  <span className="font-bold text-red-600">
                    {fmt(detailInvoice.remaining)}
                  </span>
                </div>
              )}
            </div>

            {/* Historique paiements */}
            {detailInvoice.payments.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
                  Historique des paiements
                </p>
                <div className="space-y-2">
                  {detailInvoice.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-emerald-800">
                          {fmt(p.amount)}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {new Date(p.paidAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                      {p.note && (
                        <p className="text-xs text-gray-500">{p.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <div className="hidden relative">
                <button
                  onClick={() =>
                    setPrintMenuFor(
                      printMenuFor === detailInvoice.id
                        ? null
                        : detailInvoice.id,
                    )
                  }
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  <Printer size={15} /> Imprimer ▾
                </button>
                {printMenuFor === detailInvoice.id && (
                  <div className="absolute left-0 top-12 z-10 w-44 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => {
                        printA4(detailInvoice);
                        setPrintMenuFor(null);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition"
                    >
                      <Printer size={14} />
                      <div className="text-left">
                        <p className="font-medium">Format A4</p>
                        <p className="text-xs text-gray-400">
                          Facture professionnelle
                        </p>
                      </div>
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => {
                        printThermal(detailInvoice);
                        setPrintMenuFor(null);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition"
                    >
                      <Printer size={14} />
                      <div className="text-left">
                        <p className="font-medium">Ticket thermique</p>
                        <p className="text-xs text-gray-400">
                          Imprimante de caisse 80mm
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              {canEdit(detailInvoice) && (
                <button
                  onClick={() => {
                    const inv = detailInvoice;
                    setDetailInvoice(null);
                    openEdit(inv);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={15} /> Modifier
                </button>
              )}
              {detailInvoice.status !== "PAID" && (
                <button
                  onClick={() => {
                    setDetailInvoice(null);
                    openPayment(detailInvoice);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <CreditCard size={15} /> Paiement
                </button>
              )}
              <button
                onClick={() => setDetailInvoice(null)}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste factures */}
      <p className="text-sm text-gray-500">{total} facture(s)</p>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          Chargement...
        </div>
      ) : !invoices.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          Aucune facture trouvée.
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="rounded-2xl bg-white px-5 py-4 shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => setDetailInvoice(invoice)}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900">
                      {invoice.invoiceNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[invoice.status]}`}
                    >
                      {statusLabel[invoice.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {invoice.client?.name ||
                      invoice.customerName ||
                      "Client non précisé"}{" "}
                    • {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}{" "}
                    • {invoice.items.length} article(s)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="font-bold text-slate-900">
                      {fmt(invoice.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Payé :{" "}
                      <span className="text-emerald-600 font-medium">
                        {fmt(invoice.paidAmount)}
                      </span>
                      {invoice.remaining > 0 && (
                        <>
                          {" "}
                          • Reste :{" "}
                          <span className="text-red-600 font-medium">
                            {fmt(invoice.remaining)}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <button
                        onClick={() =>
                          setPrintMenuFor(
                            printMenuFor === invoice.id ? null : invoice.id,
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Printer size={13} /> Imprimer ▾
                      </button>
                      {printMenuFor === invoice.id && (
                        <div className="absolute right-0 top-9 z-20 w-44 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => {
                              if (user?.plan === "FREE") {
                                setPrintMenuFor(null);
                                setIsUpgradeModalOpen(true);
                                return;
                              }

                              printA4(invoice);
                              setPrintMenuFor(null);
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition ${
                              user?.plan === "FREE"
                                ? "text-amber-800 bg-amber-50/50 hover:bg-amber-50"
                                : "text-gray-700 hover:bg-slate-50"
                            }`}
                          >
                            {user?.plan === "FREE" ? (
                              <Lock
                                size={13}
                                className="text-amber-600 shrink-0"
                              />
                            ) : (
                              <Printer size={13} className="shrink-0" />
                            )}
                            <div className="text-left">
                              <p className="font-medium flex items-center gap-1.5">
                                Format A4
                                {user?.plan === "FREE" && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-semibold">
                                    Starter
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">
                                Facture professionnelle
                              </p>
                            </div>
                          </button>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={() => {
                              printThermal(invoice);
                              setPrintMenuFor(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition"
                          >
                            <Printer size={13} />
                            <div className="text-left">
                              <p className="font-medium">Ticket thermique</p>
                              <p className="text-xs text-gray-400">
                                Imprimante 80mm
                              </p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                    {canEdit(invoice) && (
                      <button
                        onClick={() => openEdit(invoice)}
                        className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil size={13} /> Modifier
                      </button>
                    )}
                    {invoice.status !== "PAID" && (
                      <button
                        onClick={() => {
                          if (!cashOpen) {
                            toast.error("⚠️ La caisse est fermée.", {
                              duration: 4000,
                            });
                            return;
                          }
                          openPayment(invoice);
                        }}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-white transition ${cashOpen ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}
                      >
                        <CreditCard size={13} /> Payer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Suivant →
        </button>
      </div>

      {isUpgradeModalOpen &&
        showModal(
          isUpgradeModalOpen,
          () => setIsUpgradeModalOpen(false),
          "exportPdfOrExcel",
        )}
    </section>
  );
}
