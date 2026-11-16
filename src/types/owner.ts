export type OwnerRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  primaryShopName: string | null;
  shopsCount: number;
  activeShops: number;
  archivedShops: number;
  plans: string[];
  nextExpiry: string | null;
  expiredShops: number;
};

export type OwnersResponse = {
  data: OwnerRow[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

export type AlertLevel = "danger" | "warning" | "info";
export type OwnerAlert = { level: AlertLevel; code: string; message: string };

export type UsageItem = {
  key: string;
  label: string;
  used: number;
  limit: number | null;
  percent: number | null;
};

export type OwnerShop = {
  id: number;
  name: string;
  status: string;
  address: string | null;
  isPrimary: boolean;
  primaryShop: { id: number; name: string; status?: string } | null;
  subscriptionInherited: boolean;
  createdAt: string;
  subscription: {
    status: string;
    startDate: string;
    endDate: string | null;
    daysRemaining: number | null;
    plan: { code: string; name: string; price: number };
  } | null;
  usage: UsageItem[];
  stats: {
    counts: { users: number; products: number; clients: number; suppliers: number };
    sales30d: { count: number; revenue: number };
    salesTotal: { count: number; revenue: number };
    unpaidAmount: number;
    supplierDebtRemaining: number;
    lowStockCount: number;
    cashOpen: boolean;
    lastSaleAt: string | null;
    lastActivityAt: string | null;
    inactiveDays: number;
  };
  alerts: OwnerAlert[];
};

export type OwnerDetail = {
  owner: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
    primaryShopId: number | null;
  };
  totals: {
    shopsCount: number;
    activeShops: number;
    archivedShops: number;
    revenue30d: number;
    sales30d: number;
    revenueTotal: number;
    unpaidAmount: number;
    supplierDebtRemaining: number;
    users: number;
    products: number;
    lowStockCount: number;
    alertsCount: number;
  };
  storesUsage: UsageItem;
  shops: OwnerShop[];
  diagnostics: OwnerAlert[];
};
