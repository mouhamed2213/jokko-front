import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sendContactMessage, SUPPORT_EMAIL } from "../services";

const initialForm = { name: "", email: "", subject: "", message: "", website: "" };

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => ({
    ...initialForm,
    subject: searchParams.get("subject")?.slice(0, 120) ?? "",
  }));
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (field: keyof typeof initialForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await sendContactMessage(form);
      setSent(true);
      setForm(initialForm);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible d'envoyer votre message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Nous contacter</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Comment pouvons-nous vous aider ?</h1>
        <p className="mt-3 text-slate-600">Envoyez-nous votre demande via ce formulaire ou écrivez-nous directement à <a className="font-medium text-emerald-700 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Notre équipe vous répondra à l'adresse indiquée.</p>
        {sent && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Votre message a bien été envoyé.
          </div>
        )}
        <form onSubmit={submit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Nom
              <input required minLength={2} maxLength={100} value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="name" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Adresse email
              <input required type="email" maxLength={254} value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" autoComplete="email" />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Sujet
            <input required minLength={3} maxLength={120} value={form.subject} onChange={(e) => update("subject", e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Votre message
            <textarea required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={(e) => update("message", e.target.value)} className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500" />
          </label>
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label>Ne pas remplir ce champ<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label>
          </div>
          <button disabled={loading} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </div>
    </div>
  );
}
