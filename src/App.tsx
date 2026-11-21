import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute, { SuperAdminGuard, SubscriptionGuard } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import MaintenanceGate from "./components/MaintenanceGate";
import RouteSeo from "./components/RouteSeo";
import { AuthProvider } from "./contexts/AuthContext";

// Public pages (lazy loaded)
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ConfirmEmailChange = lazy(() => import("./pages/ConfirmEmailChange"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const HelpArticlePage = lazy(() => import("./pages/HelpArticlePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));

// Boutique & Dashboard pages (lazy loaded)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Products = lazy(() => import("./pages/Products"));
const Clients = lazy(() => import("./pages/Clients"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Stock = lazy(() => import("./pages/Stock"));
const Sales = lazy(() => import("./pages/Sales"));
const SalesHistory = lazy(() => import("./pages/SalesHistory"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Cash = lazy(() => import("./pages/Cash"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const AccountSecurity = lazy(() => import("./pages/AccountSecurity"));

// Super Admin pages (lazy loaded)
const SuperAdminLogin = lazy(() => import("./pages/superAdmin/SuperAdminLogin"));
const AcceptSuperAdminInvitation = lazy(() => import("./pages/AcceptSuperAdminInvitation"));
const SuperAdminDashboard = lazy(() => import("./pages/superAdmin/SuperAdminDashboard"));
const SuperAdminShops = lazy(() => import("./pages/superAdmin/SuperAdminShops"));
const SuperAdminShopDetail = lazy(() => import("./pages/superAdmin/SuperAdminShopDetail"));
const SuperAdminOwners = lazy(() => import("./pages/superAdmin/SuperAdminOwners"));
const SuperAdminOwnerDetail = lazy(() => import("./pages/superAdmin/SuperAdminOwnerDetail"));
const SuperAdminSubscriptions = lazy(() => import("./pages/superAdmin/SuperAdminSubscriptions"));
const SuperAdminSettings = lazy(() => import("./pages/superAdmin/SuperAdminSettings"));
const SuperAdminMaintenanceSettings = lazy(() => import("./pages/superAdmin/SuperAdminMaintenanceSettings"));
const SuperAdminGracePeriodSettings = lazy(() => import("./pages/superAdmin/SuperAdminGracePeriodSettings"));
const SuperAdminUsers = lazy(() => import("./pages/superAdmin/SuperAdminUsers"));

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
  </div>
);

const NotFoundPage = () => (
  <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center">
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Erreur 404</p>
    <h1 className="mt-3 text-3xl font-bold text-slate-900">Page introuvable</h1>
    <p className="mt-2 max-w-md text-sm text-slate-500">
      La page que vous recherchez n'existe pas ou a été déplacée.
    </p>
    <Link
      to="/"
      className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      Retour à l'accueil
    </Link>
  </main>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <RouteSeo />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#0f172a", color: "#fff" },
        }}
      />
      <MaintenanceGate>
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route path="/super-admin/accept-invitation" element={<AcceptSuperAdminInvitation />} />

          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/confirm-email-change" element={<ConfirmEmailChange />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/help/:moduleId" element={<HelpArticlePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/tarifs" element={<PricingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Super Admin routes */}
          <Route
            element={
              <SuperAdminGuard>
                <SuperAdminLayout />
              </SuperAdminGuard>
            }
          >
            <Route path="/admin/dash" element={<SuperAdminDashboard />} />
            <Route path="/admin/shops" element={<SuperAdminShops />} />
            <Route path="/admin/shops/:id" element={<SuperAdminShopDetail />} />
            <Route path="/admin/owners" element={<SuperAdminOwners />} />
            <Route path="/admin/owners/:id" element={<SuperAdminOwnerDetail />} />
            <Route path="/admin/subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="/admin/settings" element={<SuperAdminSettings />} />
            <Route path="/admin/settings/maintenance" element={<SuperAdminMaintenanceSettings />} />
            <Route path="/admin/settings/subscription-grace-period" element={<SuperAdminGracePeriodSettings />} />
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
        </Suspense>
      </MaintenanceGate>
    </BrowserRouter>
    </AuthProvider>
  );
}
