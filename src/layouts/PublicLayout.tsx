import { Outlet } from "react-router-dom";
import { HeaderPublic } from "../components/headerPublic";
// import FooterPublic from "../components/FooterPublic"; 

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Barre de navigation publique (commune à la Landing et à la Formation) */}
      <HeaderPublic />

      {/* Contenu dynamique de la page (LandingPage ou FormationPage) */}
      <main className="grow">
        <Outlet />
      </main>

      {/* Pied de page public commun */}
      {/* <FooterPublic /> */}
    </div>
  );
}