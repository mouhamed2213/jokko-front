import type { ReactElement } from "react";

import { Navigate } from "react-router-dom";
import { getStoredUser } from "../types/auth";
type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}


export function SuperAdminGuard({ children }: Props) {
  const token = localStorage.getItem("sa_user");

  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return <>{children}</>;
}

export function SubscriptionGuard({ children }: Props) {
  const user = getStoredUser();
  console.log("user", user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.plan === "FREE" || user.plan === "BASIC") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
