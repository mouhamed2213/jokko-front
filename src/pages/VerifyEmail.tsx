import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyAccountEmail } from "../services";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification de votre adresse email...");

  useEffect(() => {
    let active = true;
    if (!token) {
      setState("error");
      setMessage("Le lien de vérification est incomplet.");
      return;
    }
    verifyAccountEmail(token)
      .then((result) => {
        if (!active) return;
        setState("success");
        setMessage(result.message || "Votre adresse email est vérifiée.");
      })
      .catch((error) => {
        if (!active) return;
        setState("error");
        setMessage(error?.response?.data?.message || "Ce lien est invalide ou a expiré.");
      });
    return () => { active = false; };
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${state === "success" ? "bg-emerald-100 text-emerald-700" : state === "error" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
          {state === "loading" ? "…" : state === "success" ? "✓" : "!"}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Vérification de l'email</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
        <Link to="/login" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">
          Aller à la connexion
        </Link>
      </div>
    </div>
  );
}
