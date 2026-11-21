import { Minus, Plus, ShoppingCart, Trash2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PaymentSplitInput } from "../../../components/PaymentSplitInput";
import { createClient, getClients } from "../../clients/api";
import { createSale } from "../api";
import type { Client, PackagingUnit } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { unitLabel } from "../../../utils/packaging";
import type { PaymentSplit } from "../../../utils/paymentMethods";
import { cartLineKey, type CartItem } from "../types";

interface SalesCartPanelProps {
  cart: CartItem[];
  admin: boolean;
  cashOpen: boolean | null;
  piecesInCartForProduct: (productId: number, excludeKey?: string) => number;
  onUpdateQty: (
    productId: number,
    soldUnit: PackagingUnit,
    quantity: number,
  ) => void;
  onUpdatePrice: (
    productId: number,
    soldUnit: PackagingUnit,
    unitPrice: number,
  ) => void;
  onRemoveItem: (productId: number, soldUnit: PackagingUnit) => void;
  onClearCart: () => void;
  onSaleCreated: () => Promise<void>;
}

export function SalesCartPanel({
  cart,
  admin,
  cashOpen,
  piecesInCartForProduct,
  onUpdateQty,
  onUpdatePrice,
  onRemoveItem,
  onClearCart,
  onSaleCreated,
}: SalesCartPanelProps) {
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
  const [splitMode, setSplitMode] = useState(false);
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const effectivePaidAmount = splitMode
    ? paymentSplits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
    : paidAmount;

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const cartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  useEffect(() => {
    if (!paidAmountTouched) {
      setPaidAmount(cartTotal);
    } else if (paidAmount > cartTotal) {
      setPaidAmount(cartTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  const resetClientAndPayment = () => {
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
    setSplitMode(false);
    setPaymentSplits([]);
  };

  const handleClear = () => {
    resetClientAndPayment();
    onClearCart();
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
      setClients((prev) => [
        created,
        ...prev.filter((c) => c.id !== created.id),
      ]);
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
        error?.response?.data?.message ||
          "Erreur lors de la création du client",
      );
    } finally {
      setCreatingClient(false);
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashOpen) {
      return toast.error(
        "La caisse est fermée. Ouvrez la caisse avant d'enregistrer une vente.",
        { duration: 5000 },
      );
    }
    if (!cart.length) return toast.error("Le panier est vide");
    if (!clientId && !customerName.trim()) {
      return toast.error("Client ou nom du client requis");
    }
    if (effectivePaidAmount < 0 || effectivePaidAmount > cartTotal) {
      return toast.error("Montant payé invalide");
    }
    const validSplits = splitMode
      ? paymentSplits.filter((s) => Number(s.amount) > 0)
      : [];
    if (splitMode && validSplits.length === 0) {
      return toast.error(
        "Indiquez un montant supérieur à 0 sur au moins un moyen de paiement",
      );
    }
    if (effectivePaidAmount < cartTotal && !clientId) {
      return toast.error(
        "Sélectionnez un client enregistré pour une vente partielle ou à crédit.",
      );
    }
    setSubmitting(true);
    try {
      await createSale({
        clientId: clientId ? Number(clientId) : null,
        customerName: customerName || undefined,
        paidAmount: effectivePaidAmount,
        paymentMethod: splitMode ? undefined : paymentMethod,
        payments: splitMode ? validSplits : undefined,
        note: note || undefined,
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          soldUnit: c.soldUnit,
        })),
      });
      toast.success("Vente enregistrée avec succès");
      handleClear();
      await onSaleCreated();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur enregistrement vente",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
            onClick={handleClear}
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
              item.soldUnit === "PIECE" ? 1 : Math.max(1, item.unitsPerPack);
            const otherPieces = piecesInCartForProduct(item.productId, lineKey);
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
                    onClick={() => onRemoveItem(item.productId, item.soldUnit)}
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
                        onUpdateQty(
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
                        onUpdateQty(
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
                        onUpdateQty(
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
                      onUpdatePrice(
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
                  = {formatMoney(item.unitPrice * item.quantity)}
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
            {formatMoney(cartTotal)}
          </span>
        </div>

        {/* Paiement */}
        <div className="space-y-3 border-t border-gray-100 pt-3">
          {!splitMode && (
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
            </div>
          )}

          <PaymentSplitInput
            targetAmount={cartTotal}
            splitMode={splitMode}
            onToggleSplitMode={(next) => {
              setSplitMode(next);
              if (!next) {
                setPaidAmount(effectivePaidAmount || cartTotal);
              }
            }}
            singleMethod={paymentMethod}
            onSingleMethodChange={setPaymentMethod}
            splits={paymentSplits}
            onSplitsChange={setPaymentSplits}
            hideWhenZero
            singleAmount={paidAmount}
          />

          <p className="text-xs text-gray-400">
            {effectivePaidAmount >= cartTotal ? (
              <span className="text-emerald-600 font-medium">
                Vente payée intégralement
              </span>
            ) : effectivePaidAmount > 0 ? (
              <span className="text-yellow-600 font-medium">
                Paiement partiel — reste{" "}
                {formatMoney(cartTotal - effectivePaidAmount)}
              </span>
            ) : (
              <span className="text-red-500 font-medium">
                Vente à crédit — rien n'est encaissé maintenant
              </span>
            )}
          </p>
        </div>

        {/* Client / note */}
        <div className="space-y-3 border-t border-gray-100 pt-3">
          {effectivePaidAmount < cartTotal && !clientId && (
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
                Client enregistré {effectivePaidAmount < cartTotal ? "*" : ""}
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
                        clients.find((client) => client.id === clientId)
                          ?.name ||
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
                          <span className="ml-2 text-gray-500">
                            {client.phone}
                          </span>
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
                effectivePaidAmount < cartTotal
                  ? "Indisponible pour une vente à crédit"
                  : "Nom du client..."
              }
              disabled={!!clientId || effectivePaidAmount < cartTotal}
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
  );
}
