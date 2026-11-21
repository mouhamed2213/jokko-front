import { api } from "../../services/api";
import type { User } from "../../types/index";

export const getUsers = async (): Promise<User[]> =>
  (await api.get("/users")).data;

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> => (await api.post("/users", data)).data.user;

export const updateUser = async (id: number, data: any): Promise<User> =>
  (await api.put(`/users/${id}`, data)).data.user;

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
