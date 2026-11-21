export type CashTransaction = {
  id: number;
  cashRegisterId: number;
  type: "IN" | "OUT";
  amount: number;
  label: string;
  reference?: string | null;
  createdAt: string;
};

export type CashRegister = {
  id: number;
  shopId: number;
  userId?: number | null;
  openingAmount: number;
  closingAmount?: number | null;
  totalIn: number;
  totalOut: number;
  currentBalance?: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string | null;
  note?: string | null;
  transactions?: CashTransaction[];
  user?: { name: string } | null;
};
