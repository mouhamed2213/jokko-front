import { api } from "../../services/api";
import type { Sale } from "../../types/index";
import type { PaymentSplit } from "../../utils/paymentMethods";

export type SaleItemPayload = {
  productId: number;
  quantity: number;
  unitPrice: number;
  soldUnit?: "PIECE" | "DOZEN" | "CARTON";
};

export type CreateSalePayload = {
  clientId?: number | null;
  customerName?: string;
  paidAmount?: number;
  paymentMethod?: string;
  payments?: PaymentSplit[];
  note?: string;
  items: SaleItemPayload[];
};

export type SaleListResponse = {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  meta: any;
};

export const getSales = async (params?: {
  status?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<SaleListResponse> => (await api.get("/sales", { params })).data;

export const getSaleById = async (id: number): Promise<Sale> =>
  (await api.get(`/sales/${id}`)).data;

export const createSale = async (payload: CreateSalePayload) =>
  (await api.post("/sales", payload)).data;

export type UpdateSalePayload = {
  clientId?: number | null;
  customerName?: string;
  note?: string;
  items: SaleItemPayload[];
};

export const updateSale = async (id: number, payload: UpdateSalePayload) =>
  (await api.put(`/sales/${id}`, payload)).data;

export const addSalePayment = async (
  saleId: number,
  amount: number,
  note?: string,
) => (await api.patch(`/sales/${saleId}/payment`, { amount, note })).data;

export const deleteSale = async (id: number): Promise<void> => {
  await api.delete(`/sales/${id}`);
};

// ── Invoices ──────────────────────────────────────────────────
export type InvoiceListResponse = {
  data: Sale[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalInvoices: number;
    totalRevenue: number;
    totalCollected: number;
    totalOutstanding: number;
  };
};

export const getInvoices = async (params?: {
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<InvoiceListResponse> =>
  (await api.get("/invoices", { params })).data;

export const getInvoiceById = async (id: number): Promise<Sale> =>
  (await api.get(`/invoices/${id}`)).data;

export const addInvoicePayment = async (
  id: number,
  amount: number,
  note?: string,
  paymentMethod = "CASH",
  payments?: PaymentSplit[],
) =>
  (
    await api.patch(`/invoices/${id}/payment`, {
      amount,
      note,
      paymentMethod,
      payments,
    })
  ).data;
