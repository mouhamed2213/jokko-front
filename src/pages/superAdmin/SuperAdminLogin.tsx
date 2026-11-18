import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/public/Logo";
import { loginSuperAdmin } from "../../services/index";

const field =
  "w-full rounded-xl border border-ink/20 bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-ink/40 focus:border-jokko focus:ring-2 focus:ring-jokko/20";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await loginSuperAdmin({ email, password });
      localStorage.setItem("sa_user", res.token);
      toast.success("Connexion Super Admin réussie");
      navigate("/admin/dash");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Identifiants invalides");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink px-5 font-brand text-ink antialiased">
      <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -bottom-24 -left-16 h-[40rem] w-[40rem] overflow-visible text-white/[0.05]">
        <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
      </svg>

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between py-8">
        <Logo variant="sur-encre" className="h-12 w-auto" />
        <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun">
          <span className="h-2 w-2 rounded-full bg-sun" /> Super admin
        </p>
      </header>

      <main className="relative flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-md rounded-[2rem] bg-cream p-8 shadow-2xl sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em]">
            Super administration<span className="-ml-[0.04em] text-sun">.</span>
          </h1>
          <p className="mt-2 text-sm text-ink/65">Accès réservé à l'administrateur de la plateforme.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label htmlFor="sa-email" className="mb-1.5 block text-sm font-bold">E-mail</label>
              <input id="sa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="superadmin@jokkobusiness.com" required autoComplete="username" />
            </div>
            <div>
              <label htmlFor="sa-password" className="mb-1.5 block text-sm font-bold">Mot de passe</label>
              <input id="sa-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full rounded-full bg-jokko py-3.5 text-sm font-extrabold text-white transition hover:bg-jokko-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-60">
              {loginLoading ? "Connexion..." : "Accéder au panneau"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="font-bold text-jokko hover:underline">Mot de passe oublié ?</Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-ink/60 hover:text-ink">
              <ArrowLeft size={14} /> Connexion boutique
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
