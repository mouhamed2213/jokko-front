import type { Shop } from "../shops/types";

export type PlatformStats = {
  totalShops: number;
  shopsByStatus: Record<string, number>;
  subscriptionsByStatus: Record<string, number>;
  subscriptionsByPlan: Record<string, number>;
  mrr: number;
  recentShops: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
    status: string;
  }>;
  recentSubscriptions: Array<{
    id: number;
    status: string;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    plan: {
      code: string;
      name: string;
      price: number;
    };
    shop: {
      id: number;
      name: string;
      email: string;
    };
  }>;
};

export type ShopDetailResponse = {
  shop: {
    id: number;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string | null;
    logoUrl: string | null;
    status: string;
    currentShop: string;
    createdAt: string;
    updatedAt: string;
  };
  counts: {
    productsCount: number;
    salesCount: number;
    clientsCount: number;
    usersCount: number;
  };
  recentStats: {
    salesLast30Days: number;
  };
  subscriptionsHistory: Array<{
    id: number;
    status: string;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    plan: {
      code: string;
      name: string;
      price: number;
    };
  }>;
  owners: Array<{
    id: number;
    userId: number;
    phone: string;
  }>;
};

export type ShopsListResponse = {
  meta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
  data: Shop[];
};
