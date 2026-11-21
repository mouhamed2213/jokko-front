import { api } from "../../services/api";
import type { PaymentSplit } from "../../utils/paymentMethods";

export const getCurrentCash = async () =>
  (await api.get("/cash/current")).data;

export const getCashHistory = async (params?: {
  page?: number;
  limit?: number;
}) => (await api.get("/cash/history", { params })).data;

export const getCashById = async (id: number) =>
  (await api.get(`/cash/${id}`)).data;

export const openCash = async (data: {
  openingAmount: number;
  note?: string;
}) => (await api.post("/cash/open", data)).data;

export const closeCash = async (id: number, data?: { note?: string }) =>
  (await api.patch(`/cash/${id}/close`, data || {})).data;

export const addCashTransaction = async (data: {
  type: "IN" | "OUT";
  amount?: number;
  label: string;
  reference?: string;
  paymentMethod?: string;
  payments?: PaymentSplit[];
}) => (await api.post("/cash/transactions", data)).data;
