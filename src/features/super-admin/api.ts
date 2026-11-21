import { adminApi, api } from "../../services/api";
import type { Shop } from "../../types/index";
import type { OwnerDetail, OwnersResponse } from "../../types/owner";
import type { AccountEmailStatus, MaintenanceStatus } from "../auth/api";

export const loginSuperAdmin = async (data: {
  email: string;
  password: string;
}) => {
  const res = await adminApi.post("/auth/super-admin/login", data);
  return res.data;
};

export const getSuperAdminMe = async (): Promise<{
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN";
}> => (await adminApi.get("/super-admin/me")).data;

export type SuperAdminAccount = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  status: "ACTIVE" | "PENDING" | "DISABLED" | "INVITATION_EXPIRED";
};

export const getSuperAdmins = async (): Promise<SuperAdminAccount[]> =>
  (await adminApi.get("/super-admin/admins")).data.admins;

export const inviteSuperAdmin = async (data: { name: string; email: string }) =>
  (await adminApi.post("/super-admin/admins/invitations", data)).data;

export const resendSuperAdminInvitation = async (id: number) =>
  (await adminApi.post(`/super-admin/admins/${id}/invitation/resend`)).data;

export const setSuperAdminStatus = async (id: number, enabled: boolean) =>
  (await adminApi.patch(`/super-admin/admins/${id}/status`, { enabled })).data;

export const acceptSuperAdminInvitation = async (data: {
  token: string;
  password: string;
}) => (await api.post("/auth/super-admin/invitation/accept", data)).data;

export const getSuperAdminEmailStatus = async (): Promise<AccountEmailStatus> =>
  (await adminApi.get("/auth/super-admin/email/status")).data;

export const resendSuperAdminVerification = async () =>
  (await adminApi.post("/auth/super-admin/email/verification/resend")).data;

export const requestSuperAdminEmailChange = async (data: {
  currentPassword: string;
  newEmail: string;
}) => (await adminApi.post("/auth/super-admin/email/change/request", data)).data;

export const changeSuperAdminPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => (await adminApi.post("/auth/super-admin/password/change", data)).data;

export const updateMaintenanceSettings = async (payload: {
  enabled: boolean;
  message: string;
}): Promise<MaintenanceStatus> =>
  (await adminApi.patch("/maintenance", payload)).data;

export const getShops = async (): Promise<Shop[]> =>
  (await adminApi.get("/super-admin/shops")).data;

export const getPlatformStats = async () =>
  (await adminApi.get("/super-admin/stats")).data;

export const getShopsWithPagination = async (params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  plan?: string;
}) => (await adminApi.get("/super-admin/shops", { params })).data;

export const getShopDetail = async (id: number) =>
  (await adminApi.get(`/super-admin/shops/${id}`)).data;

export const getOwners = async (params?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<OwnersResponse> =>
  (await adminApi.get("/super-admin/owners", { params })).data;

export const getOwnerDetail = async (id: number): Promise<OwnerDetail> =>
  (await adminApi.get(`/super-admin/owners/${id}`)).data;

export const archiveShop = async (id: number) =>
  (await adminApi.patch(`/super-admin/shops/${id}/archive`)).data;

export const restoreShop = async (id: number) =>
  (await adminApi.patch(`/super-admin/shops/${id}/restore`)).data;

export const updateSubscriptionStatus = async (
  shopId: number,
  status: string,
) =>
  (
    await adminApi.patch(`/super-admin/shops/${shopId}/subscription/status`, {
      status,
    })
  ).data;

export const extendTrialPeriod = async (shopId: number, daysToAdd: number) =>
  (
    await adminApi.patch(`/super-admin/shops/${shopId}/subscription/extend`, {
      daysToAdd,
    })
  ).data;

export type ManualSubscriptionPaymentInput = {
  shopId: number;
  planType: string;
  provider?: "WAVE" | "ORANGE_MONEY" | "OTHER";
  amount?: number;
  transactionReference?: string;
};

export const changeSubscriptionPlan = async (
  payload: ManualSubscriptionPaymentInput,
) => {
  const res = await adminApi.post("/super-admin/subscription", {
    shop_id: payload.shopId,
    planType: payload.planType,
    provider: payload.provider,
    amount: payload.amount,
    transactionReference: payload.transactionReference,
  });
  return res.data as {
    requiresPayment: boolean;
    subscription: {
      id: number;
      status: string;
      startDate: string;
      endDate: string | null;
    };
    payment: {
      id: number;
      amount: number;
      currency: string;
      provider: string;
      status: string;
      planCode: string;
      planName: string;
      transactionReference: string | null;
      createdAt: string;
    } | null;
  };
};

export const confirmSubscriptionPayment = async (paymentId: number) =>
  (
    await adminApi.patch(
      `/super-admin/subscription/payments/${paymentId}/confirm`,
    )
  ).data;

export const cancelSubscriptionPayment = async (paymentId: number) =>
  (
    await adminApi.patch(
      `/super-admin/subscription/payments/${paymentId}/cancel`,
    )
  ).data;

export type SuperAdminSubscriptionRow = {
  id: number;
  shopId: number;
  shop: {
    id: number;
    name: string;
    email: string;
    ownerName: string;
    status: string;
  };
  owner: { id: number; name: string; email: string };
  plan: { code: string; name: string; price: number };
  status: string;
  storedStatus: string;
  startDate: string;
  endDate: string | null;
  gracePeriodEndsAt: string | null;
  gracePeriodDaysRemaining: number;
  latestPayment: {
    id: number;
    status: string;
    provider: string;
    amount: number;
    paidAt: string | null;
    createdAt: string;
    paymentType: string;
  } | null;
  createdAt: string;
};

export type SuperAdminSubscriptionsResponse = {
  data: SuperAdminSubscriptionRow[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  gracePeriodDays: number;
};

export type SubscriptionOverviewStats = {
  subscriptionsByStatus: Record<string, number>;
  subscriptionsByPlan: Record<string, number>;
  gracePeriodCount: number;
  expiredCount: number;
  pendingSubscriptionPayments: number;
  gracePeriodDays: number;
  mrr: number;
  activePaidCount: number;
  recentSubscriptions: Array<{
    id: number;
    shopId: number;
    status: string;
    startDate: string;
    endDate: string | null;
    plan: { code: string; name: string; price: number };
    shop: { id: number; name: string; email: string };
    createdAt: string;
  }>;
};

export const getSuperAdminSubscriptions = async (params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  plan?: string;
}): Promise<SuperAdminSubscriptionsResponse> =>
  (await adminApi.get("/super-admin/subscriptions", { params })).data;

export const getSubscriptionOverviewStats =
  async (): Promise<SubscriptionOverviewStats> =>
    (await adminApi.get("/super-admin/subscriptions/overview")).data;

export const getSubscriptionGracePeriod = async (): Promise<{
  days: number;
  defaultDays: number;
  maxDays: number;
}> => (await adminApi.get("/super-admin/subscription-grace-period")).data;

export const updateSubscriptionGracePeriod = async (days: number) =>
  (await adminApi.patch("/super-admin/subscription-grace-period", { days }))
    .data;
