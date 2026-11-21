import { api } from "../../services/api";

export type AnalyticsOverview = {
  period: { startDate: string; endDate: string };
  comparison: {
    revenueChange: number | null;
    previousRevenue?: number;
    previousSalesCount?: number;
    previousGrossProfit?: number;
    profitChange?: number | null;
    previousPeriod?: { startDate: string; endDate: string } | null;
  } | null;
  kpis: {
    revenue: number;
    salesCount: number;
    averageBasket: number;
    collected: number;
    receivables: number;
    stockValue: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    costOfGoodsSold?: number;
    grossProfit?: number;
    marginRate?: number | null;
    operatingExpenses?: number;
    netProfit?: number;
    itemsWithoutCost?: number;
  };
};

export type AnalyticsPeriodParams = {
  startDate?: string;
  endDate?: string;
  limit?: number;
};

export const getAnalyticsOverview = async (params?: {
  startDate?: string;
  endDate?: string;
  compare?: boolean;
}): Promise<AnalyticsOverview> =>
  (await api.get("/analytics/overview", { params })).data;

export const getAnalyticsMultiStoreOverview = async (params: {
  startDate?: string;
  endDate?: string;
  compare?: boolean;
}) => {
  const res = await api.get("/analytics/overview/multi-store", { params });
  return res.data as {
    period: { startDate: string; endDate: string } | null;
    comparison?: AnalyticsOverview["comparison"];
    shops: Array<{
      shop: { id: number; name: string };
      overview: AnalyticsOverview;
    }>;
    consolidated: AnalyticsOverview["kpis"];
  };
};

export const getAnalyticsSales = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/sales", { params })).data;

export const getAnalyticsProducts = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/products", { params })).data;

export const getAnalyticsStock = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/stock", { params })).data;

export const getAnalyticsCustomers = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/customers", { params })).data;

export const getAnalyticsCash = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/cash", { params })).data;

export const getAnalyticsTrends = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/trends", { params })).data;

export const getAnalyticsInsights = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/insights", { params })).data;

export const getAnalyticsProfit = async (params?: AnalyticsPeriodParams) =>
  (await api.get("/analytics/profit", { params })).data;
