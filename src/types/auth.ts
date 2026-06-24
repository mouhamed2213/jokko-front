import type { PlanType } from "../pages/superAdmin/SuperAdmin";
export type UserRole = "ADMIN" | "EMPLOYEE" | "SUPER_ADMIN";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  shopId: number;
  plan:  PlanType;
  shopName: string;
};

export const getStoredUser = (): AuthUser | null => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
};

export  const me = async () => {
  // const res = await api.post("/auth/login");
  // return res.data;
}

export const isAdmin = (): boolean => getStoredUser()?.role === "ADMIN";
export const isEmployee = (): boolean => getStoredUser()?.role === "EMPLOYEE";
export const isSuperAdmin = (): boolean =>
  getStoredUser()?.role === "SUPER_ADMIN";
