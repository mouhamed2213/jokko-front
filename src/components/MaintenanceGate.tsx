import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMaintenanceStatus } from "../services";

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin") || location.pathname.startsWith("/super-admin");
  const [maintenance, setMaintenance] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAdminArea) {
      setMaintenance(false);
      return;
    }

    let active = true;
    getMaintenanceStatus()
      .then((status) => {
        if (!active) return;
        setMessage(status.message);
        setMaintenance(Boolean(status.enabled));
      })
      .catch(() => {
        if (active) setMaintenance(false);
      });
    return () => { active = false; };
  }, [isAdminArea]);

  if (isAdminArea || !maintenance) return <>{children}</>;
  return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
        <section className="w-full max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42" />
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Jokko Business</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Nous revenons bientôt</h1>
          <p className="mx-auto mt-4 max-w-lg whitespace-pre-wrap leading-7 text-slate-300">{message || "La plateforme est temporairement indisponible pour maintenance."}</p>
          <p className="mt-8 text-sm text-slate-500">Merci de votre patience.</p>
        </section>
      </main>
    );
}
