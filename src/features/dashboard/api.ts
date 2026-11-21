import { api } from "../../services/api";
import type { DashboardStats } from "../../types/index";

export const getDashboardStats = async (): Promise<DashboardStats> =>
  (await api.get("/dashboard/stats")).data;
