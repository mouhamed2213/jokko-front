import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute, { SubscriptionGuard } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Cash from "./pages/Cash";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Stock from "./pages/Stock";
import SuperAdmin from "./pages/superAdmin/SuperAdmin";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#0f172a", color: "#fff" },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin" element={<SuperAdmin />} />

        {/* Root route - landing if not authenticated, dashboard if authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/clients" element={<Clients />} />
          <Route
            path="/suppliers"
            element={
              <SubscriptionGuard>
                <Suppliers />
              </SubscriptionGuard>
            }
          />
          <Route path="/stock" element={<Stock />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/cash" element={<Cash />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}