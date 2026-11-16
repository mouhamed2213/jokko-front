import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute, { SuperAdminGuard, SubscriptionGuard } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

import PublicLayout from "./layouts/PublicLayout";
import Cash from "./pages/Cash";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import HelpPage from "./pages/HelpPage";
import Invoices from "./pages/Invoices";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ConfirmEmailChange from "./pages/ConfirmEmailChange";
import AccountSecurity from "./pages/AccountSecurity";
import ContactPage from "./pages/ContactPage";
import Sales from "./pages/Sales";
import SalesHistory from "./pages/SalesHistory";
import Settings from "./pages/Settings";
import Stock from "./pages/Stock";
import SuperAdminLogin from "./pages/superAdmin/SuperAdminLogin";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import SuperAdminDashboard from "./pages/superAdmin/SuperAdminDashboard";
import SuperAdminShops from "./pages/superAdmin/SuperAdminShops";
import SuperAdminOwners from "./pages/superAdmin/SuperAdminOwners";
import SuperAdminOwnerDetail from "./pages/superAdmin/SuperAdminOwnerDetail";
import SuperAdminShopDetail from "./pages/superAdmin/SuperAdminShopDetail";
import SuperAdminSettings from "./pages/superAdmin/SuperAdminSettings";
import SuperAdminMaintenanceSettings from "./pages/superAdmin/SuperAdminMaintenanceSettings";
import SuperAdminUsers from "./pages/superAdmin/SuperAdminUsers";
import MaintenanceGate from "./components/MaintenanceGate";

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
      <MaintenanceGate>
      <Routes>
        {/* Public routes */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
          <Route path="/admin/shops" element={<SuperAdminShops/>} />
          <Route path="/admin/shops/:id" element={<SuperAdminShopDetail />} />
          <Route path="/admin/owners" element={<SuperAdminOwners />} />
          <Route path="/admin/owners/:id" element={<SuperAdminOwnerDetail />} />
          <Route path="/admin/settings" element={<SuperAdminSettings />} />
          <Route path="/admin/settings/maintenance" element={<SuperAdminMaintenanceSettings />} />
          <Route path="/admin/settings/users" element={<SuperAdminUsers />} />
          <Route path="/admin/security" element={<AccountSecurity mode="superadmin" />} />
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
          <Route path="/analytics" element={<Analytics />} />
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
          <Route path="/sales/history" element={<SalesHistory />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/cash" element={<Cash />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account/security" element={<AccountSecurity />} />
        </Route>
      </Routes>
      </MaintenanceGate>
    </BrowserRouter>
  );
}
