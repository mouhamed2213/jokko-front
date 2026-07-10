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
import Register from "./pages/Register";
import HelpPage from "./pages/HelpPage";
import PublicLayout from "./layouts/PublicLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import { AdminDashboard } from "./pages/superAdmin/AdminDashboard";

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

        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        {/* Protected ADMIN routes */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Route>




        {/* Protected dashboard user routes */}
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
