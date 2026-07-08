import {
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";
import {
  createNewShop,
  getShopList,
  getSubscription,
  switchShop,
} from "../services";
import type { NewShopForm, SubscriptionInfo } from "../types";
import { hasFeature, hasFeatures } from "../utils/subscription.checker";

// ── Types ────────────────────────────────────────────────────

type ShopItem = {
  id: number;
  name: string;
  actorName: string;
  address: string | null;
  logoUrl: string | null;
  currentShop: "PRIMARY" | "SECONDARY";
};

const emptyShopForm: NewShopForm = {
  shopName: "",
  ownerName: "",
  address: "",
  phone: "",
  email: "",
  password: "",
};

// ── Nav links ────────────────────────────────────────────────
// `featureKey` drives the lock check for links that require a specific
// subscription entitlement (checked via hasFeature(subscription, featureKey))
// instead of a hardcoded plan-name comparison.

const allLinks = [
  {
    name: "Tableau de bord",
    path: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  { name: "Caisse", path: "/cash", icon: Wallet, adminOnly: false },
  { name: "Produits", path: "/products", icon: Package, adminOnly: false },
  { name: "Clients", path: "/clients", icon: Users, adminOnly: false },
  {
    name: "Fournisseurs",
    path: "/suppliers",
    icon: Truck,
    adminOnly: false,
    premium: true,
    featureKey: "SUPPLIER_MANAGEMENT" as const,
  },
  { name: "Stock", path: "/stock", icon: Boxes, adminOnly: false },
  { name: "Ventes", path: "/sales", icon: ShoppingCart, adminOnly: false },
  { name: "Factures", path: "/invoices", icon: FileText, adminOnly: false },
  { name: "Utilisateurs", path: "/users", icon: UserCog, adminOnly: true },
  { name: "Paramètres", path: "/settings", icon: Settings, adminOnly: true },
];

// ── Add Shop Modal ───────────────────────────────────────────

function AddShopModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<NewShopForm>(emptyShopForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof NewShopForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shopName || !form.ownerName || !form.phone || !form.password) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setSubmitting(true);
    try {
      await createNewShop(form);
      toast.success("Boutique créée avec succès");
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Erreur lors de la création",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fields: {
    label: string;
    key: keyof NewShopForm;
    type: string;
    placeholder: string;
    span2?: boolean;
  }[] = [
    {
      label: "Nom de la boutique *",
      key: "shopName",
      type: "text",
      placeholder: "Ex: Boutique Sandaga",
    },
    {
      label: "Nom du propriétaire *",
      key: "ownerName",
      type: "text",
      placeholder: "Prénom Nom",
    },
    {
      label: "Téléphone *",
      key: "phone",
      type: "tel",
      placeholder: "77 000 00 00",
    },
    {
      label: "Email",
      key: "email",
      type: "email",
      placeholder: "email@boutique.com",
    },
    {
      label: "Adresse",
      key: "address",
      type: "text",
      placeholder: "Quartier, Ville",
      span2: true,
    },
    {
      label: "Mot de passe *",
      key: "password",
      type: "password",
      placeholder: "Mot de passe d'accès à la boutique",
      span2: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Nouvelle boutique
          </h3>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {fields.map(({ label, key, type, placeholder, span2 }) => (
            <div key={key} className={span2 ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="flex gap-3 sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
            >
              {submitting ? "Création..." : "Créer la boutique"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Shop Switcher ────────────────────────────────────────────

function ShopSwitcher({
  shops,
  currentShopId,
  onSwitch,
  onShopCreated,
  canAddShop,
  onUpgradeClick,
}: {
  shops: ShopItem[];
  currentShopId: number;
  onSwitch: (shopId: number, password: string) => Promise<void>;
  onShopCreated: () => void;
  canAddShop: boolean;
  onUpgradeClick: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addShopOpen, setAddShopOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>();
  const now = new Date(Date.now());
  // Fermer si click dehors
  useEffect(() => {
    getSubscription().then(setSubscription);

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSelected(null);
        setPassword("");
      }
    };
    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!subscription) {
    return;
  }
  const featureFlags = hasFeatures(subscription);

  const otherShops = shops.filter((s) => s.id !== currentShopId);

  // Eligibility to add a new shop, in priority order:
  // 1) plan doesn't include multi-store at all -> Pro upsell (same treatment
  //    as the locked Fournisseurs nav item)
  // 2) plan includes it but temporarily blocked (trial / expired / at limit)
  //    -> informational only, no "Pro" framing since upgrading tier isn't
  //    necessarily what fixes these
  // 3) fully eligible

  const maxStore = subscription.limits.stores ?? 0;
  const maxStoreIsReached = otherShops.length >= maxStore;
  // const maxStoreIsReached = [1, 32, 45, 5, 5,6 ,  7, ];
  const isExpired = new Date(subscription.endDate) < now;

  type AddShopStatus =
    | { kind: "allowed" }
    | { kind: "planLocked"; message: string }
    | { kind: "blocked"; message: string };

  let addShopStatus: AddShopStatus;
  if (!featureFlags.multiStore) {
    addShopStatus = {
      kind: "planLocked",
      message: "Le multi-boutique n'est pas inclus dans votre plan actuel.",
    };
  } else if (subscription.status === "TRIAL") {
    addShopStatus = {
      kind: "blocked",
      message:
        "Vous ne pouvez pas ajouter de boutique pendant votre période d'essai.",
    };
  } else if (isExpired) {
    addShopStatus = {
      kind: "blocked",
      message:
        "Votre abonnement a expiré. Réabonnez-vous pour ajouter une boutique.",
    };
  } else if (maxStoreIsReached) {
    addShopStatus = {
      kind: "blocked",
      message:
        "Vous avez atteint le nombre maximum de boutiques autorisées par votre plan.",
    };
  } else {
    addShopStatus = { kind: "allowed" };
  }

  const handleSelectShop = (shop: ShopItem) => {
    setSelected(shop);
    setPassword("");
  };

  const handleConfirm = async () => {
    if (!selected || !password) return;
    setLoading(true);
    try {
      await onSwitch(selected.id, password);
      setOpen(false);
      setSelected(null);
      setPassword("");
    } catch {
      // erreur gérée dans onSwitch
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="relative px-3 pb-2">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setSelected(null);
          setPassword("");
        }}
        className="w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
      >
        <div className="flex items-center gap-3">
          <Store size={17} />
          <span>Mes boutiques</span>
          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white/80">
            {shops.length}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`opacity-40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shadow-xl z-50">
          {/* Liste des boutiques */}
          {!selected ? (
            <div>
              <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                Changer de boutique
              </p>
              <div className="max-h-52 overflow-y-auto">
                {shops.map((shop) => {
                  const isCurrent = shop.id === currentShopId;
                  return (
                    <button
                      key={shop.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => !isCurrent && handleSelectShop(shop)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition
                        ${
                          isCurrent
                            ? "opacity-50 cursor-default"
                            : "hover:bg-white/10 cursor-pointer"
                        }`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/30 flex items-center justify-center shrink-0 overflow-hidden">
                        {shop.logoUrl ? (
                          <img
                            src={shop.logoUrl}
                            alt={shop.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-emerald-400">
                            {shop.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {shop.name}
                        </p>
                        <p className="text-xs text-white/40 truncate">
                          {shop.currentShop === "PRIMARY"
                            ? "Boutique principale"
                            : "Boutique secondaire"}
                        </p>
                      </div>

                      {isCurrent ? (
                        <Check
                          size={14}
                          className="text-emerald-400 shrink-0"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-white/30 shrink-0"
                        />
                      )}
                    </button>
                  );
                })}

              </div>

              {/* Ajouter une boutique — trois états distincts :
                  - allowed: bouton normal
                  - planLocked: le plan n'inclut pas le multi-boutique du tout
                    -> même traitement que Fournisseurs (ambre + Crown + Pro),
                    ouvre la même modale de mise à niveau
                  - blocked: le plan l'inclut mais c'est temporairement
                    indisponible (essai / expiré / limite atteinte)
                    -> simple message informatif, pas de bouton, pas de "Pro" */}
              {canAddShop && addShopStatus.kind === "allowed" && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setAddShopOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-emerald-400 hover:bg-white/10 border-t border-white/10 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                    <Plus size={16} />
                  </div>
                  <span>Ajouter une boutique</span>
                </button>
              )}

              {canAddShop && addShopStatus.kind === "planLocked" && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onUpgradeClick();
                  }}
                  className="w-full flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-left text-sm font-medium text-amber-400/80 transition hover:bg-amber-500/10 hover:text-amber-400"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                      <Crown size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate">Ajouter une boutique</p>
                      <p className="truncate text-[11px] text-amber-400/70">
                        {addShopStatus.message}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                    Pro
                  </span>
                </button>
              )}

              {canAddShop && addShopStatus.kind === "blocked" && (
                <p className="border-t border-white/10 px-4 py-3 text-xs text-white/40">
                  {addShopStatus.message}
                </p>
              )}
            </div>
          ) : (
            /* Confirmation mot de passe */
            <div className="p-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 mb-3 transition"
              >
                <ChevronRight size={12} className="rotate-180" />
                Retour
              </button>

              {/* Shop cible */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/30 flex items-center justify-center shrink-0">
                  {selected.logoUrl ? (
                    <img
                      src={selected.logoUrl}
                      alt={selected.name}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-sm font-bold text-emerald-400">
                      {selected.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {selected.name}
                  </p>
                  <p className="text-xs text-white/40">
                    Confirmez votre identité pour accéder
                  </p>
                </div>
              </div>

              {/* Input mot de passe */}
              <div className="relative mb-3">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  placeholder="Mot de passe de la boutique"
                  autoFocus
                  className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!password || loading}
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Accès en cours..." : `Accéder à ${selected.name}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal ajout boutique */}
      {addShopOpen && (
        <AddShopModal
          onClose={() => setAddShopOpen(false)}
          onCreated={onShopCreated}
        />
      )}
    </div>
  );
}

// ── Sidebar Content ──────────────────────────────────────────

function SidebarContent({
  onClose,
  onUpgradeClick,
}: {
  onClose?: () => void;
  onUpgradeClick: () => void;
}) {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = storedUser.role;
  const currentShopId = storedUser.shopId as number;

  const [subscription, setSubscription] = useState<SubscriptionInfo>();
  const [shopList, setShopList] = useState<ShopItem[]>([]);
  const [shopLogo, setShopLogo] = useState<string>(
    localStorage.getItem("shopLogo") || "",
  );

  const shopName = storedUser.shopName || "Jokko Business";

  const links = allLinks.filter((l) => !l.adminOnly || role === "ADMIN");

  const refreshShopList = () => {
    getShopList().then((shops) => setShopList(shops));
  };

  useEffect(() => {
    getSubscription().then(setSubscription);
    refreshShopList();

    const handler = () => setShopLogo(localStorage.getItem("shopLogo") || "");
    window.addEventListener("shopLogoUpdated", handler);
    return () => window.removeEventListener("shopLogoUpdated", handler);
  }, []);

  const handleSwitch = async (targetShopId: number, password: string) => {
    try {
      const res = await switchShop({ targetShopId, password });

      const tokenPayload = JSON.parse(atob(res.token.split(".")[1]));

      localStorage.setItem("token", res.token);
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          shopId: tokenPayload.shopId,
          role: tokenPayload.role,
        }),
      );

      try {
        const { api } = await import("../services/api");
        const shopRes = await api.get("/shop/settings");
        if (shopRes.data.logoUrl) {
          localStorage.setItem("shopLogo", shopRes.data.logoUrl);
        } else {
          localStorage.removeItem("shopLogo");
        }
        localStorage.setItem("shopName", shopRes.data.name || "Jokko Business");

        const updatedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...updatedUser,
            shopName: shopRes.data.name,
          }),
        );
      } catch {}

      toast.success(`Connecté à la boutique`);

      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mot de passe incorrect");
      throw error;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-900 text-white">
      {/* Header boutique */}
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={shopLogo || logo}
              alt={shopName}
              className="h-10 w-10 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <h1 className="text-base font-bold truncate max-w-32.5">
                {shopName}
              </h1>
              <p className="text-xs text-white/50">Gestion commerciale</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation — seule zone qui scrolle si besoin */}
      <nav className="flex-1 min-h-0 space-y-0.5 overflow-y-auto px-3 py-3">
        {links.map((link) => {
          const Icon = link.icon;
          const featureUnlocked = link.featureKey
            ? !!subscription && hasFeature(subscription, link.featureKey)
            : true;
          const isLocked = !!link.premium && !featureUnlocked;

          if (isLocked) {
            return (
              <button
                key={link.path + link.name}
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onUpgradeClick();
                }}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} />
                  <span>{link.name}</span>
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <Crown size={13} className="opacity-60" />
              </button>
            );
          }

          return (
            <NavLink
              key={link.path + link.name}
              to={link.path}
              onClick={onClose}
              end={link.path === "/dashboard"}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={17} />
                <span>{link.name}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-60"
              />
            </NavLink>
          );
        })}
      </nav>

      {/* Shop switcher — au-dessus du footer */}
      {shopList.length > 0 && (
        <div className="shrink-0 border-t border-white/10 pt-2">
          <ShopSwitcher
            shops={shopList}
            currentShopId={currentShopId}
            onSwitch={handleSwitch}
            onShopCreated={refreshShopList}
            canAddShop={role === "ADMIN"}
            onUpgradeClick={onUpgradeClick}
          />
        </div>
      )}

      {/* Footer version */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <div className="rounded-xl bg-white/5 px-4 py-2.5">
          <p className="text-xs font-semibold text-white/80">v1.0</p>
          <p className="text-xs text-white/40">Jokko Business SaaS</p>
        </div>
      </div>
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <>
      {/* Burger mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-slate-900 p-3 text-white shadow-lg md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 overflow-hidden md:flex">
        <SidebarContent onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-screen w-[272px] overflow-hidden shadow-xl">
            <SidebarContent
              onClose={() => setMobileOpen(false)}
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modal upgrade */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Crown size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Fonctionnalité Pro
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Cette fonctionnalité est réservée aux abonnés des plans
                supérieurs.
              </p>
            </div>
            <div className="my-5 rounded-xl bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Débloquez le Plan Pro :
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  🤝 Gestion fournisseurs complète
                </li>
                <li className="flex items-center gap-2">
                  📊 Rapports & statistiques avancés
                </li>
                <li className="flex items-center gap-2">
                  🏪 Multi-boutiques (jusqu'à 5)
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Plus tard
              </button>
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  window.location.href = "/settings";
                }}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition sm:w-auto"
              >
                Voir les plans
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}