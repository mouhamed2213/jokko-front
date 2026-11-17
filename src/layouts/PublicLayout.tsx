import { Outlet } from "react-router-dom";
import { HeaderPublic } from "../components/HeaderPublic";
import FooterPublic from "../components/FooterPublic";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans antialiased text-slate-900">
      <HeaderPublic />
      <main className="grow"><Outlet /></main>
      <FooterPublic />
    </div>
  );
}
