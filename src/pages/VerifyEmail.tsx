import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyAccountEmail } from "../services";
import AuthShell from "../components/public/AuthShell";

type VerificationState = "idle" | "loading" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<VerificationState>(token ? "idle" : "error");
  const [message, setMessage] = useState(
    token
      ? "Cliquez sur le bouton ci-dessous pour confirmer votre adresse email."
      : "Le lien de vérification est incomplet.",
  );
  const verificationStarted = useRef(false);

  const handleVerification = async () => {
    if (!token || verificationStarted.current) return;

    verificationStarted.current = true;
    setState("loading");
    setMessage("Vérification de votre adresse email...");

    try {
      const result = await verifyAccountEmail(token);
      setState("success");
      setMessage(
        result.message || "Votre adresse email est vérifiée.",
      );
    } catch (error: any) {
      verificationStarted.current = false;
      setState("error");
      setMessage(
        error?.response?.data?.message ||
          "Impossible de vérifier cette adresse. Le lien est peut-être invalide ou expiré.",
      );
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 text-center shadow-lg">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          state === "success"
            ? "bg-jokko/15 text-jokko-deep"
            : state === "error"
              ? "bg-red-100 text-red-700"
              : "bg-ink/5 text-ink/70"
        }`}>
          {state === "loading" ? "…" : state === "success" ? "✓" : state === "error" ? "!" : "✉"}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-ink">
          Vérification de l'email
        </h1>
        <p className="mt-3 text-sm text-ink/70">{message}</p>

        {state !== "success" && token && (
          <button
            type="button"
            onClick={handleVerification}
            disabled={state === "loading"}
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-jokko px-5 py-3 text-sm font-semibold text-white transition hover:bg-jokko-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === "loading" ? "Vérification..." : "Confirmer mon adresse email"}
          </button>
        )}

        <Link
          to="/login"
          className="mt-4 inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-ink/75 hover:bg-ink/5"
        >
          Aller à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
