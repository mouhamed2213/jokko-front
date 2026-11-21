import { CreditCard, Filter, Lock, Pencil, Printer, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { showModal } from "../components/upgradeModal";
import { InvoiceDetailModal } from "../features/invoices/components/InvoiceDetailModal";
import { InvoiceEditModal } from "../features/invoices/components/InvoiceEditModal";
import { InvoicePaymentCard } from "../features/invoices/components/InvoicePaymentCard";
import { SALE_STATUS_BADGE, SALE_STATUS_LABEL } from "../features/sales/types";
import {
  getClients,
  getCurrentCash,
  getInvoices,
  getProducts,
} from "../services/index";
import { useAuth } from "../contexts/AuthContext";
import type { Client, Product, Sale } from "../types/index";
import { formatMoney } from "../utils/format";
import { printInvoice as doPrint } from "../utils/printInvoice";

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
  const [search, setSearch] = useState(
    () => new URLSearchParams(window.location.search).get("search") || "",
  );
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals / panneaux actifs
  const [payingInvoice, setPayingInvoice] = useState<Sale | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<Sale | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Sale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [printMenuFor, setPrintMenuFor] = useState<number | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { user, isAdmin: admin } = useAuth();

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

  const canEdit = (invoice: Sale) =>
    admin && invoice.status !== "PAID" && invoice.paidAmount === 0;

  const openEdit = async (invoice: Sale) => {
    if (!canEdit(invoice)) return;
    try {
      const [productsRes, clientsRes] = await Promise.all([
        getProducts({ limit: 1000 }),
        getClients(),
      ]);
      setProducts(productsRes.data);
      setClients(clientsRes.client);
      setEditingInvoice(invoice);
    } catch {
      toast.error("Erreur chargement produits/clients");
    }
  };

  if (!user) {
    toast.error("User not found");
    return null;
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <Lock size={20} />
            </div>
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
            value: formatMoney(stats.totalRevenue),
            color: "text-slate-900",
          },
          {
            label: "Montant encaissé",
            value: formatMoney(stats.totalCollected),
            color: "text-emerald-600",
          },
          {
            label: "Reste à encaisser",
            value: formatMoney(stats.totalOutstanding),
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

      {/* Panneau paiement */}
      {payingInvoice && (
        <InvoicePaymentCard
          key={payingInvoice.id}
          invoice={payingInvoice}
          cashOpen={cashOpen}
          onClose={() => setPayingInvoice(null)}
          onSuccess={async (invoiceId) => {
            await fetchInvoices();
            if (detailInvoice?.id === invoiceId) {
              const res = await getInvoices({
                search: String(invoiceId),
                page: 1,
                limit: 1,
              });
              if (res.data[0]) setDetailInvoice(res.data[0]);
            }
          }}
        />
      )}

      {/* Modal modification facture */}
      {editingInvoice && (
        <InvoiceEditModal
          invoice={editingInvoice}
          products={products}
          clients={clients}
          onClose={() => setEditingInvoice(null)}
          onSuccess={fetchInvoices}
        />
      )}

      {/* Modal détail facture */}
      {detailInvoice && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          canEdit={canEdit(detailInvoice)}
          onPrintA4={printA4}
          onPrintThermal={printThermal}
          onEdit={(inv) => {
            setDetailInvoice(null);
            openEdit(inv);
          }}
          onPay={(inv) => {
            setDetailInvoice(null);
            setPayingInvoice(inv);
          }}
          onClose={() => setDetailInvoice(null)}
        />
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
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${SALE_STATUS_BADGE[invoice.status]}`}
                    >
                      {SALE_STATUS_LABEL[invoice.status]}
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
                      {formatMoney(invoice.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Payé :{" "}
                      <span className="text-emerald-600 font-medium">
                        {formatMoney(invoice.paidAmount)}
                      </span>
                      {invoice.remaining > 0 && (
                        <>
                          {" "}
                          • Reste :{" "}
                          <span className="text-red-600 font-medium">
                            {formatMoney(invoice.remaining)}
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
                              printA4(invoice);
                              setPrintMenuFor(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition text-gray-700 hover:bg-slate-50"
                          >
                            <Printer size={13} className="shrink-0" />
                            <div className="text-left">
                              <p className="font-medium flex items-center gap-1.5">
                                Format A4
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
                    {invoice.status !== "PAID" &&
                      invoice.status !== "CANCELLED" && (
                        <button
                          onClick={() => {
                            if (!cashOpen) {
                              toast.error("La caisse est fermée.", {
                                duration: 4000,
                              });
                              return;
                            }
                            setPayingInvoice(invoice);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-white transition ${
                            cashOpen
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
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
