import { api } from "../../services/api";
import type { Category, Product } from "../../types/index";

export type CreateProductPayload = {
  name: string;
  description?: string;
  reference?: string;
  categoryId?: number | null;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  alertThreshold: number;
  imageUrl?: string;
};

export type ProductListResponse = {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  totalProducts: number;
};

export const getProducts = async (params?: {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductById = async (id: number): Promise<Product> =>
  (await api.get(`/products/${id}`)).data;

export const createProduct = async (
  formData: FormData,
): Promise<{ message: string; product: Product }> => {
  const response = await api.post("/products", formData);
  return response.data;
};

export const updateProduct = async (
  id: number,
  payload: Partial<FormData>,
): Promise<Product> => (await api.put(`/products/${id}`, payload)).data.product;

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const getLowStockProducts = async (): Promise<Product[]> =>
  (await api.get("/products/low-stock")).data;

export const getSuggestedPrice = async (
  productId: number,
  quantity: number,
  unit?: "PIECE" | "DOZEN" | "CARTON",
) => {
  const res = await api.get(`/products/${productId}/price`, {
    params: { quantity, ...(unit ? { unit } : {}) },
  });
  return res.data as {
    quantity: number;
    soldUnit?: "PIECE" | "DOZEN" | "CARTON";
    piecesCount?: number;
    suggestedPrice: number;
    tier: "detail" | "semiWholesale" | "wholesale";
    tiers: {
      detail: { price: number; label: string };
      semiWholesale: { price: number; minQty: number; label: string } | null;
      wholesale: { price: number; minQty: number; label: string } | null;
    };
  };
};

// ── Categories ────────────────────────────────────────────────
export const getCategories = async (): Promise<Category[]> =>
  (await api.get("/categories")).data;

export const createCategory = async (name: string): Promise<Category> =>
  (await api.post("/categories", { name })).data.category;

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
