import { createContext, useContext } from "react";

export type SuperAdminProfile = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN";
};

// Fourni par SuperAdminGuard une fois la session validée auprès de l'API
export const SuperAdminContext = createContext<SuperAdminProfile | null>(null);

export const useSuperAdmin = () => useContext(SuperAdminContext);
