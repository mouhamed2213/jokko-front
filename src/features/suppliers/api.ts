import { api } from "../../services/api";
import type {
  Supplier,
  SupplierDebtAging,
  SupplierHistoryResponse,
  SupplierListResponse,
  SupplierQuota,
} from "../../types/index";

export type SupplierPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export const getSuppliers = async (params?: {
  page?: number;
  limit?: number;
  agingBucket?: string;
  search?: string;
}): Promise<SupplierListResponse> =>
  (await api.get("/suppliers", { params })).data;

export const getSupplierQuota = async (): Promise<SupplierQuota> =>
  (await api.get("/suppliers/quota")).data;

export const getSupplierDebtAging = async (): Promise<SupplierDebtAging> =>
  (await api.get("/suppliers/aging")).data;

export type SupplierRankingEntry = {
  id: number;
  name: string;
  totalPurchases: number;
  totalDebt: number;
  deliveries: number;
};

export const getSupplierRanking = async (
  sortBy?: "purchases" | "debt" | "deliveries",
  page?: number,
  limit?: number,
): Promise<{
  data: SupplierRankingEntry[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> =>
  (
    await api.get("/suppliers/analytics/ranking", {
      params: { sortBy, page, limit },
    })
  ).data;

export type SupplierProducts = {
  supplier: { id: number; name: string };
  products: {
    productId: number;
    productName: string;
    productImageUrl: string | null;
    lastUnitCost: number | null;
    lastDate: string;
    totalQuantity: number;
    deliveries: number;
  }[];
};

export const getSupplierProducts = async (
  supplierId: number,
): Promise<SupplierProducts> =>
  (
    await api.get("/suppliers/analytics/products", {
      params: { supplierId },
    })
  ).data;

export type ConsolidatedSuppliers = {
  shops: {
    shopId: number;
    shopName: string;
    supplierCount: number;
    totalDebt: number;
    totalPurchases: number;
  }[];
  grandTotalDebt: number;
  grandTotalSuppliers: number;
};

export const getConsolidatedSuppliers =
  async (): Promise<ConsolidatedSuppliers> =>
    (await api.get("/suppliers/consolidated")).data;

export const getSupplierById = async (
  id: number,
  params?: { page?: number; limit?: number },
): Promise<SupplierHistoryResponse> =>
  (await api.get(`/suppliers/${id}`, { params })).data;

export const createSupplier = async (
  payload: SupplierPayload,
): Promise<Supplier> => (await api.post("/suppliers", payload)).data.supplier;

export const updateSupplier = async (
  id: number,
  payload: SupplierPayload,
): Promise<Supplier> =>
  (await api.put(`/suppliers/${id}`, payload)).data.supplier;

export const deleteSupplier = async (id: number): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};

export const addSupplierDebt = async (
  supplierId: number,
  data: { totalAmount: number; paidAmount?: number; note?: string },
) => (await api.post(`/suppliers/${supplierId}/debts`, data)).data;

export const addSupplierPayment = async (
  supplierId: number,
  debtId: number,
  data: { amount: number; note?: string },
) =>
  (await api.post(`/suppliers/${supplierId}/debts/${debtId}/payments`, data))
    .data;
