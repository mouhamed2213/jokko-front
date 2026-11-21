export type Client = {
  id: number;
  shopId: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  createdAt: string;
  totalPurchases?: number;
  totalPaid?: number;
  totalRemaining?: number;
  customerCount: number | null;
};
