export type DashboardStats = {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  stockValue: number;
  totalSales: number;
  totalSalesAmount: number;
  totalPaidAmount: number;
  totalClientDebt: number;
  recentSalesAmount: number;
  totalClients: number;
  totalSuppliers: number;
  totalSupplierDebt: number;
  cashOpen: boolean;
  currentBalance: number | null;
  currentMonthSalesAmount: number;
  currentMonthCostOfGoodsSold?: number;
  currentMonthGrossProfit?: number;
  currentMonthMarginRate?: number | null;
  currentMonthOperatingExpenses?: number;
  currentMonthNetProfit?: number;
  currentMonthItemsWithoutCost?: number;
  topProducts: {
    productId: number | null;
    productName: string;
    totalQuantity: number | null;
    totalAmount: number | null;
  }[];
};

export type DashboardStatType = {
  [K in keyof DashboardStats]: {
    type: K;
    value: DashboardStats[K];
  };
}[keyof DashboardStats];
