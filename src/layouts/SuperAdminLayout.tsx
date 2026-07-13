import { Outlet } from "react-router-dom";
import SuperAdminHeader from "../components/SuperAdminHeader";
import SuperAdminSidebar from "../components/SuperAdminSidebar";

export default function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <SuperAdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 pb-8 pt-20 md:px-6 md:pt-6">
            <SuperAdminHeader />
            <div className="mt-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
