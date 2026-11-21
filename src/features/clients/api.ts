import { api } from "../../services/api";
import type { Client } from "../../types/index";

export type ClientPayload = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

export const getClients = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  client: Client[];
  customerCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const data = (await api.get("/clients", { params })).data;
  return {
    client: data.data,
    customerCount: data.customerCount,
    pagination: data.pagination,
  };
};

export const getClientById = async (
  id: number,
  params?: { page?: number; limit?: number; status?: string },
) => (await api.get(`/clients/${id}`, { params })).data;

export const createClient = async (payload: ClientPayload): Promise<Client> =>
  (await api.post("/clients", payload)).data.client;

export const updateClient = async (
  id: number,
  payload: ClientPayload,
): Promise<Client> => (await api.put(`/clients/${id}`, payload)).data.client;

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/clients/${id}`);
};
