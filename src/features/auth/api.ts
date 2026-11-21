import { adminApi, api } from "../../services/api";

export const SUPPORT_EMAIL = "contact@jokko-business.com";

export const login = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerShop = async (payload: any) => {
  const res = await api.post("/shop", payload);
  return res.data;
};

export const sendContactMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}) => (await api.post("/contact", data)).data;

export type AccountEmailStatus = {
  email: string;
  emailVerifiedAt: string | null;
};

export const getAccountEmailStatus = async (): Promise<AccountEmailStatus> =>
  (await api.get("/auth/email/status")).data;

export const resendAccountVerification = async () =>
  (await api.post("/auth/email/verification/resend")).data;

export const requestAccountEmailChange = async (data: {
  currentPassword: string;
  newEmail: string;
}) => (await api.post("/auth/email/change/request", data)).data;

export const changeAccountPassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => (await api.post("/auth/password/change", data)).data;

export const requestPasswordReset = async (email: string) =>
  (await api.post("/auth/forgot-password", { email })).data;

export const resetPassword = async (token: string, password: string) =>
  (await api.post("/auth/password/reset", { token, password })).data;

export const verifyAccountEmail = async (token: string) =>
  (await api.post("/auth/email/verify", { token })).data;

export const confirmAccountEmailChange = async (token: string) =>
  (await api.post("/auth/email/change/confirm", { token })).data;

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  updatedAt: string | null;
};

export const getMaintenanceStatus = async (): Promise<MaintenanceStatus> =>
  (await adminApi.get("/maintenance/status")).data;
