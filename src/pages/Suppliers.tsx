import { Lock, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConsolidatedSuppliersTab from "../components/ConsolidatedSuppliersTab";
import SupplierAnalyticsTab from "../components/SupplierAnalyticsTab";
import { showModal } from "../components/upgradeModal";
import { SupplierCard } from "../features/suppliers/components/SupplierCard";
import { SupplierDebtPaymentCard } from "../features/suppliers/components/SupplierDebtPaymentCard";
import { SupplierHistoryModal } from "../features/suppliers/components/SupplierHistoryModal";
import { useSubscription } from "../hooks/useSubscription";
import {
  createSupplier,
  deleteSupplier,
  getCurrentCash,
  getSupplierById,
  getSupplierDebtAging,
  getSupplierQuota,
  getSuppliers,
  updateSupplier,
} from "../services/index";
import type {
  Supplier,
  SupplierDebt,
  SupplierDebtAging,
  SupplierHistoryResponse,
  SupplierQuota,
} from "../types/index";
import { formatMoney } from "../utils/format";
import { hasFeature } from "../utils/subscription.checker";
import type { UpgradeFeature } from "../utils/upgradeFeaturesData";

const emptyForm = { name: "", phone: "", email: "", address: "" };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashOpen, setCashOpen] = useState<boolean | null>(null);
  const [quota, setQuota] = useState<SupplierQuota | null>(null);
  const [aging, setAging] = useState<SupplierDebtAging | null>(null);
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<string | null>(
    null,
  );
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierTotalPages, setSupplierTotalPages] = useState(1);
  const [historySupplier, setHistorySupplier] =
    useState<SupplierHistoryResponse | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<
    "list" | "analytics" | "consolidated"
  >("list");
  const { subscription } = useSubscription();
  const [upgradeReason, setUpgradeReason] = useState<UpgradeFeature | null>(
    null,
  );

  const [payingDebt, setPayingDebt] = useState<{
    supplierId: number;
    debt: SupplierDebt;
  } | null>(null);

  const checkCash = async () => {
    try {
      const res = await getCurrentCash();
      setCashOpen(res.open);
    } catch {
      setCashOpen(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const [supplierData, quotaData, agingData] = await Promise.all([
        getSuppliers({
          page: supplierPage,
          limit: 10,
          agingBucket: selectedAgingBucket ?? undefined,
        }),
        getSupplierQuota(),
        getSupplierDebtAging(),
      ]);
      setSuppliers(supplierData.data);
      setSupplierTotalPages(supplierData.pagination.totalPages);
      setQuota(quotaData);
      setAging(agingData);
    } catch {
      toast.error("Erreur chargement fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    checkCash();
  }, [selectedAgingBucket, supplierPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Le nom est obligatoire");
    setSubmitting(true);
    try {
      if (editingId) {
        await updateSupplier(editingId, form);
        toast.success("Fournisseur modifié");
      } else {
        await createSupplier(form);
        toast.success("Fournisseur créé");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    try {
      await deleteSupplier(id);
      toast.success("Fournisseur supprimé");
      await fetchSuppliers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  const openSupplierHistory = async (supplierId: number) => {
    setHistoryLoading(true);
    setHistoryPage(1);
    try {
      setHistorySupplier(
        await getSupplierById(supplierId, { page: 1, limit: 10 }),
      );
    } catch {
      toast.error("Erreur chargement historique fournisseur");
    } finally {
      setHistoryLoading(false);
    }
  };

  const changeHistoryPage = async (page: number) => {
    if (!historySupplier) return;
    setHistoryLoading(true);
    try {
      setHistorySupplier(
        await getSupplierById(historySupplier.id, { page, limit: 10 }),
      );
      setHistoryPage(page);
    } catch {
      toast.error("Erreur chargement historique fournisseur");
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        {(
          [
            { key: "list", label: "Fournisseurs" },
            { key: "analytics", label: "Performance" },
            { key: "consolidated", label: "Vue globale" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {tab.key !== "list" &&
              subscription &&
              !hasFeature(
                subscription,
                tab.key === "analytics" ? "ADVANCED_REPORTS" : "MULTI_STORE",
              ) && <Lock size={12} className="text-amber-500" />}
          </button>
        ))}
      </div>

      {activeTab === "analytics" && (
        <SupplierAnalyticsTab
          locked={!!subscription && !hasFeature(subscription, "ADVANCED_REPORTS")}
          onUpgradeClick={() => setUpgradeReason("supplierAnalytics")}
        />
      )}

      {activeTab === "consolidated" && (
        <ConsolidatedSuppliersTab
          locked={!!subscription && !hasFeature(subscription, "MULTI_STORE")}
          onUpgradeClick={() => setUpgradeReason("multiStoreSuppliers")}
        />
      )}

      {upgradeReason &&
        showModal(true, () => setUpgradeReason(null), upgradeReason)}

      {activeTab === "list" && (
        <>
          {quota && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <p className="text-sm font-semibold text-slate-800">
                Fournisseurs : {quota.count}
                {quota.limit === null ? " (illimité)" : ` / ${quota.limit}`}
              </p>
              {quota.remaining !== null && (
                <p className="mt-1 text-xs text-slate-500">
                  {quota.remaining} place(s) restante(s) sur votre plan
                </p>
              )}
              {aging && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Ancienneté des dettes fournisseurs
                      </p>
                      <p className="mt-1 text-xs text-red-600">
                        Basée sur la date de création de chaque dette
                      </p>
                    </div>
                    <p className="text-sm font-bold text-red-800">
                      {formatMoney(aging.totalRemaining)} restant dû
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {aging.buckets.map((bucket) => (
                      <button
                        key={bucket.key}
                        type="button"
                        onClick={() => {
                          setSupplierPage(1);
                          setSelectedAgingBucket(
                            selectedAgingBucket === bucket.key
                              ? null
                              : bucket.key,
                          );
                        }}
                        className={`rounded-xl p-3 text-left transition ${
                          selectedAgingBucket === bucket.key
                            ? "bg-red-100 ring-2 ring-red-400"
                            : "bg-white hover:bg-red-100"
                        }`}
                      >
                        <p className="text-xs text-gray-500">{bucket.label}</p>
                        <p className="mt-1 font-bold text-slate-900">
                          {formatMoney(bucket.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {bucket.count} dette(s)
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                    Ouvrez la caisse pour payer vos fournisseurs.
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

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {suppliers.length} fournisseur(s)
            </p>
            <button
              disabled={quota?.remaining === 0}
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:bg-slate-300"
              title={
                quota?.remaining === 0 ? "Quota fournisseur atteint" : undefined
              }
            >
              <Plus size={16} /> Nouveau fournisseur
            </button>
          </div>

          {/* Formulaire fournisseur */}
          {showForm && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingId ? "Modifier" : "Nouveau"} fournisseur
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
                  { label: "Nom *", key: "name", placeholder: "Nom du fournisseur" },
                  { label: "Téléphone", key: "phone", placeholder: "77 000 00 00" },
                  { label: "Email", key: "email", placeholder: "email@fournisseur.com" },
                  { label: "Adresse", key: "address", placeholder: "Adresse..." },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <input
                      type="text"
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
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
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
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Paiement dette */}
          {payingDebt && (
            <SupplierDebtPaymentCard
              key={payingDebt.debt.id}
              supplierId={payingDebt.supplierId}
              debt={payingDebt.debt}
              cashOpen={cashOpen}
              onClose={() => setPayingDebt(null)}
              onSuccess={fetchSuppliers}
            />
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              {selectedAgingBucket
                ? `Fournisseurs avec dettes : ${
                    aging?.buckets.find(
                      (bucket) => bucket.key === selectedAgingBucket,
                    )?.label
                  }`
                : "Tous les fournisseurs"}
            </p>
            {selectedAgingBucket && (
              <button
                type="button"
                onClick={() => {
                  setSupplierPage(1);
                  setSelectedAgingBucket(null);
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Voir tout
              </button>
            )}
          </div>

          {/* Liste fournisseurs */}
          {!suppliers.length ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
              {selectedAgingBucket
                ? "Aucun fournisseur avec une dette dans cette tranche."
                : "Aucun fournisseur enregistré."}
            </div>
          ) : (
            <div className="space-y-3">
              {suppliers.map((s) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  expanded={expandedId === s.id}
                  cashOpen={cashOpen}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === s.id ? null : s.id)
                  }
                  onEdit={(sup) => {
                    setForm({
                      name: sup.name,
                      phone: sup.phone || "",
                      email: sup.email || "",
                      address: sup.address || "",
                    });
                    setEditingId(sup.id);
                    setShowForm(true);
                  }}
                  onDelete={handleDelete}
                  onPayDebt={(supplierId, debt) =>
                    setPayingDebt({ supplierId, debt })
                  }
                  onOpenHistory={openSupplierHistory}
                  onDebtAdded={fetchSuppliers}
                />
              ))}
              {supplierTotalPages > 1 && (
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                  <button
                    type="button"
                    disabled={supplierPage === 1}
                    onClick={() => setSupplierPage((page) => page - 1)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {supplierPage} / {supplierTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={supplierPage === supplierTotalPages}
                    onClick={() => setSupplierPage((page) => page + 1)}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </div>
          )}

          {historySupplier && (
            <SupplierHistoryModal
              supplier={historySupplier}
              page={historyPage}
              loading={historyLoading}
              onPageChange={changeHistoryPage}
              onClose={() => setHistorySupplier(null)}
            />
          )}
        </>
      )}
    </section>
  );
}
