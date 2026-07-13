import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute, { SuperAdminGuard, SubscriptionGuard } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import PublicLayout from "./layouts/PublicLayout";
import Cash from "./pages/Cash";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import HelpPage from "./pages/HelpPage";
import Invoices from "./pages/Invoices";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Sales from "./pages/Sales";
import Settings from "./pages/Settings";
import Stock from "./pages/Stock";
import SuperAdminLogin from "./pages/superAdmin/SuperAdminLogin";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import SuperAdminDashboard from "./pages/superAdmin/SuperAdminDashboard";

export default function App() {
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
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="help" element={<HelpPage />} />
        </Route>

        {/* Super Admin routes */}
        <Route
          element={
            <SuperAdminGuard>
              <SuperAdminLayout />
            </SuperAdminGuard>
          }
        >

          <Route path="/admin/dash" element={<SuperAdminDashboard/>} />
        </Route>

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

