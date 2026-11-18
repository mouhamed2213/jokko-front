import { Outlet } from "react-router-dom";
import SuperAdminHeader from "../components/SuperAdminHeader";
import SuperAdminSidebar from "../components/SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-cream font-brand text-ink antialiased">
      <div className="flex">
        <SuperAdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 pb-12 pt-20 md:px-8 md:pt-8">
            <SuperAdminHeader />
            <div className="mt-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
