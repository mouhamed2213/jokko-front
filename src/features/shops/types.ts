export type PlanCode = "FREE" | "BASIC" | "PRO" | "PREMIUM";

export type FeatureCode =
  | "EXPORT_PDF"
  | "EXPORT_EXCEL"
  | "LOW_STOCK_ALERT"
  | "TOP_PRODUCTS"
  | "STOCK_VALUES"
  | "SUPPLIER_MANAGEMENT"
  | "ADVANCED_REPORTS"
  | "ACCOUNTING"
  | "MULTI_STORE"
  | "API_ACCESS"
  | "OUT_OF_STOCK_ALERT"
  | "TOTAL_SUPPLIER_DEPT";

export type SubscriptionInfo = {
  id: number;
  status:
    | "ACTIVE"
    | "EXPIRED"
    | "SUSPENDED"
    | "TRIAL"
    | "TRIAL_EXPIRED"
    | "GRACE_PERIOD";
  endDate: Date | string | null;
  gracePeriodDays?: number;
  gracePeriodEndsAt?: Date | string | null;
  gracePeriodDaysRemaining?: number;
  isInGracePeriod?: boolean;
  plan: {
    code: PlanCode;
    name: string;
  };
  limits: {
    sales: number | null;
    products: number | null;
    customers: number | null;
    users: number | null;
    stores: number | null;
    suppliers: number | null;
  };
  features: FeatureCode[];
};

export type Shop = {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  createdAt: string;
  _count?: { users: number; products: number; sales: number };
  subscriptions?: {
    id: number;
    plan: string;
    status: string;
    endDate: string;
  }[];
};

export type NewShopForm = {
  shopName: string;
  ownerName: string;
  address: string;
  phone: string;
  email: string;
  managerEnabled: boolean;
  managerName: string;
  managerEmail: string;
  managerPassword: string;
};
