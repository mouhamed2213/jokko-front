import type { PlanCode } from "../shops/types";

export type SupplierQuota = {
  count: number;
  limit: number | null;
  remaining: number | null;
  plan: PlanCode;
};

export type SupplierDebtAging = {
  referenceDate: string;
  totalRemaining: number;
  totalDebts: number;
  buckets: Array<{
    key: string;
    label: string;
    count: number;
    amount: number;
  }>;
  debts: Array<{
    id: number;
    supplierId: number;
    supplierName: string;
    totalAmount: number;
    remaining: number;
    status: "UNPAID" | "PARTIAL";
    createdAt: string;
    ageDays: number;
    bucket: string;
    note?: string | null;
  }>;
};

export type Supplier = {
  id: number;
  shopId: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: string;
  totalDebt?: number;
  supplierDebts?: SupplierDebt[];
};

export type SupplierListResponse = {
  data: Supplier[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type SupplierHistoryResponse = Supplier & {
  totalPurchases: number;
  totalPaid: number;
  stockMovements: Array<{
    id: number;
    type: string;
    quantity: number;
    unitCost?: number | null;
    note?: string | null;
    createdAt: string;
    product: { id: number; name: string };
  }>;
  stockMovementsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type SupplierDebt = {
  id: number;
  supplierId: number;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  note?: string | null;
  createdAt: string;
  payments?: SupplierPayment[];
};

export type SupplierPayment = {
  id: number;
  supplierDebtId: number;
  amount: number;
  note?: string | null;
  paidAt: string;
};
