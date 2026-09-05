import {
  AlertTriangle,
  Download,
  Lock,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showModal } from "../components/upgradeModal";
import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  getSubscription,
  updateClient,
} from "../services/index";
import { getStoredUser, isAdmin } from "../types/auth";
import type { Client, Sale, SubscriptionInfo } from "../types/index";
import { exportClientsToExcel } from "../utils/exportExcel";
import { hasFeature } from "../utils/subscription.checker";

const emptyForm = { name: "", phone: "", email: "", address: "" };
const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [historyClient, setHistoryClient] = useState<Client | null>(null);
  const [historySales, setHistorySales] = useState<Sale[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyStatus, setHistoryStatus] = useState("");
  const admin = isAdmin();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [limitCostumer, setLimitCostumer] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>();
  const maxCustomers = subscription?.limits.customers;
  const [page, setPage] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Calcul des seuils critiques
  const isLimitCustomerReached =
    maxCustomers !== null &&
    maxCustomers !== undefined &&
    limitCostumer !== null &&
    limitCostumer >= maxCustomers;

  const fetchClients = async () => {
    try {
      const { client, customerCount, pagination } = await getClients({
        search: search.trim() || undefined,
        page,
        limit: 10,
      });
      setClients(client);
      setLimitCostumer(customerCount);
      setTotalClients(pagination.total);
      setTotalPages(pagination.totalPages);
    } catch {
      toast.error("Erreur chargement clients");
    } finally {
      setLoading(false);
    }
  };

  const hasfeatures = hasFeature(
    subscription as SubscriptionInfo,
    "EXPORT_EXCEL",
  );

  useEffect(() => {
    getSubscription().then(setSubscription).catch(() => {
      toast.error("Erreur chargement abonnement");
    });
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(fetchClients, 300);
    return () => window.clearTimeout(timeout);
  }, [search, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone)
      return toast.error("Nom et téléphone obligatoires");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateClient(editingId, form);
        toast.success("Client modifié");
      } else {
        await createClient(form);
        toast.success("Client créé");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setPage(1);
      await fetchClients();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: Client) => {
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      address: c.address || "",
    });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce client ?")) return;
    try {
      await deleteClient(id);
      toast.success("Client supprimé");
      setPage(1);
      await fetchClients();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur suppression");
    }
  };

  const loadHistory = async (client: Client, nextPage = historyPage, nextStatus = historyStatus) => {
    setHistoryClient(client);
    setHistoryLoading(true);
    try {
      const details = await getClientById(client.id, {
        page: nextPage,
        limit: 5,
        status: nextStatus || undefined,
      });
      setHistorySales(details.sales || []);
      setHistoryTotalPages(details.salesPagination?.totalPages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur chargement historique");
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = (client: Client) => {
    setHistoryPage(1);
    setHistoryStatus("");
    void loadHistory(client, 1, "");
  };

  if (!user) {
    return;
  }
  if (loading)
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );

  return (
    <section className="space-y-6">
      {/* 1. Message si la limite est atteinte */}
      {isLimitCustomerReached && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>
              <b>Limite atteinte !</b> Vous avez enregistré {limitCostumer}/
              {maxCustomers} clients. Passez au Plan Starter pour obtenir un
              carnet d'adresses illimité.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Augmenter la limite
          </button>
        </div>
      )}

      {/* Barre actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition ${
            isLimitCustomerReached
              ? "bg-amber-600 hover:bg-amber-700 shadow-sm" // Style si limite atteinte
              : "bg-emerald-600 hover:bg-emerald-700" // Style normal
          }`}
        >
          {isLimitCustomerReached ? <Lock size={16} /> : <Plus size={16} />}
          Nouveau client
        </button>
        <button
          onClick={() => {
            if (!hasfeatures) {
              setIsUpgradeModalOpen(true); // Ouvre le modal de conversion
              return;
            }
            exportClientsToExcel(clients, user);
          }}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition ${
            !hasfeatures
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" // Mode premium/verrouillé
              : "border-gray-300 text-gray-700 hover:bg-gray-50" // Mode normal
          }`}
        >
          {!hasfeatures ? (
            <Lock size={15} className="text-amber-600" />
          ) : (
            <Download size={15} />
          )}
          <span>Excel</span>
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? "Modifier" : "Nouveau"} client
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {[
              {
                label: "Nom *",
                key: "name",
                placeholder: "Prénom Nom",
                type: "text",
              },
              {
                label: "Téléphone *",
                key: "phone",
                placeholder: "77 000 00 00",
                type: "tel",
              },
              {
                label: "Email",
                key: "email",
                placeholder: "email@client.com",
                type: "email",
              },
              {
                label: "Adresse",
                key: "address",
                placeholder: "Quartier, Ville",
                type: "text",
              },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting
                  ? "Enregistrement..."
                  : editingId
                    ? "Modifier"
                    : "Créer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-xl border border-gray-300 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="text-sm text-gray-500">
        {totalClients} client(s)
      </p>

      {/* Liste clients */}
      {!clients.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          {search
            ? `Aucun client pour "${search}"`
            : "Aucun client enregistré."}
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {client.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {client.phone}
                      {client.email ? ` • ${client.email}` : ""}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        (client.totalRemaining ?? 0) > 0
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {(client.totalRemaining ?? 0) > 0
                        ? "Compte à régler"
                        : "En règle"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Modifier
                  </button>
                  {admin && (
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  )}
                  <button
                    onClick={() => openHistory(client)}
                    className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Voir détail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">
            Page <strong className="text-slate-900">{page}</strong> sur{" "}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Suivant →
          </button>
        </div>
      )}

      {historyClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Historique de {historyClient.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {historyClient.phone}
                  {historyClient.email ? ` • ${historyClient.email}` : ""}
                </p>
              </div>
              <button onClick={() => setHistoryClient(null)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                  Factures et achats
                </p>
                <select
                  value={historyStatus}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setHistoryStatus(nextStatus);
                    setHistoryPage(1);
                    void loadHistory(historyClient, 1, nextStatus);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="PAID">Payées</option>
                  <option value="PARTIAL">Partielles</option>
                  <option value="UNPAID">Non réglées</option>
                </select>
              </div>
              {historyLoading ? (
                <p className="py-8 text-center text-gray-400">Chargement...</p>
              ) : !historySales.length ? (
                <p className="py-8 text-center text-gray-400">
                  Aucun achat enregistré.
                </p>
              ) : (
                historySales.map((sale) => (
                  <div key={sale.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {sale.invoiceNumber || `Facture #${sale.id}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        sale.status === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : sale.status === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}>
                        {sale.status === "PAID" ? "Payée" : sale.status === "PARTIAL" ? "Partielle" : "Non réglée"}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {sale.items.map((item) => (
                        <p key={item.id}>
                          {item.productName} × {item.quantity} — {fmt(item.totalAmount)}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs">
                      <span>Total : <strong>{fmt(sale.totalAmount)}</strong></span>
                      <span>Payé : <strong className="text-emerald-700">{fmt(sale.paidAmount)}</strong></span>
                      <span>Reste : <strong className="text-red-600">{fmt(sale.remaining)}</strong></span>
                      <button
                        onClick={() => {
                          window.location.href = `/invoices?search=${encodeURIComponent(sale.invoiceNumber || String(sale.id))}`;
                        }}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Voir la facture
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!historyLoading && historyTotalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <button
                    onClick={() => {
                      const nextPage = Math.max(1, historyPage - 1);
                      setHistoryPage(nextPage);
                      void loadHistory(historyClient, nextPage, historyStatus);
                    }}
                    disabled={historyPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs disabled:opacity-40"
                  >
                    ← Précédent
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {historyPage} sur {historyTotalPages}
                  </span>
                  <button
                    onClick={() => {
                      const nextPage = Math.min(historyTotalPages, historyPage + 1);
                      setHistoryPage(nextPage);
                      void loadHistory(historyClient, nextPage, historyStatus);
                    }}
                    disabled={historyPage === historyTotalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-xs disabled:opacity-40"
                  >
                    Suivant →
                  </button>
                </div>
              )}
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
