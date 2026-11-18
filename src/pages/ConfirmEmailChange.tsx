import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmAccountEmailChange } from "../services";
import AuthShell from "../components/public/AuthShell";

export default function ConfirmEmailChange() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirmation de votre nouvelle adresse email...");

  useEffect(() => {
    let active = true;
    if (!token) {
      setState("error");
      setMessage("Le lien de confirmation est incomplet.");
      return;
    }
    confirmAccountEmailChange(token)
      .then((result) => {
        if (!active) return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("sa_user");
        setState("success");
        setMessage(result.message || "Votre adresse email a été modifiée.");
      })
      .catch((error) => {
        if (!active) return;
        setState("error");
        setMessage(error?.response?.data?.message || "Ce lien est invalide ou a expiré.");
      });
    return () => { active = false; };
  }, [token]);

  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 text-center shadow-lg">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${state === "success" ? "bg-jokko/15 text-jokko-deep" : state === "error" ? "bg-red-100 text-red-700" : "bg-ink/5 text-ink/70"}`}>
          {state === "loading" ? "…" : state === "success" ? "✓" : "!"}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-ink">Changement d'adresse email</h1>
        <p className="mt-3 text-sm text-ink/70">{message}</p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl bg-jokko px-5 py-3 text-sm font-semibold text-white">Se connecter</Link>
      </div>
    </AuthShell>
  );
}
