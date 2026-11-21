import { api } from "../../services/api";

export type StockPayload = {
  productId: number;
  quantity: number;
  unit?: "PIECE" | "DOZEN" | "CARTON";
  supplierId?: number;
  unitCost?: number;
  paidAmount?: number;
  createDebt?: boolean;
  note?: string;
};

export const getStockMovements = async (params?: {
  page?: number;
  limit?: number;
  productId?: number;
  type?: string;
}) => (await api.get("/stock/movements", { params })).data;

export const addStockEntry = async (payload: StockPayload) =>
  (await api.post("/stock/entry", payload)).data;

export const addStockOut = async (payload: StockPayload) =>
  (await api.post("/stock/out", payload)).data;
