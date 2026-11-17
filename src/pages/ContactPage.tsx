import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail, MessageSquareText } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { sendContactMessage, SUPPORT_EMAIL } from "../services";
import PageHero from "../components/public/PageHero";
import { images } from "../data/publicImages";

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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await sendContactMessage(form);
      setSent(true);
      setForm(initialForm);
      toast.success(result.message);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Impossible d'envoyer votre message.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50">
      <PageHero
        image={images.contact}
        eyebrow="Contact"
        title="Parlons de votre activité."
        subtitle="Une question sur Jokko Business, besoin d’un renseignement ou une difficulté à signaler ? Envoyez-nous votre message. Nous vous répondrons à l’adresse email indiquée."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <aside className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Comment pouvons-nous vous aider ?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choisissez le moyen qui vous convient pour nous transmettre votre demande.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Mail size={20} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Écrivez-nous</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Vous pouvez aussi nous contacter directement par email.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 break-all text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {SUPPORT_EMAIL}
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <MessageSquareText size={20} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Consultez le centre d’aide</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Retrouvez les guides consacrés aux principales fonctionnalités de Jokko Business.
            </p>
            <Link
              to="/help"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Accéder aux guides
              <ArrowRight size={15} />
            </Link>
          </div>
        </aside>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Envoyer un message</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Décrivez votre demande avec suffisamment de détails pour nous aider à vous répondre.
            </p>
          </div>

          {sent && (
            <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p>Votre message a bien été envoyé. Merci de nous avoir contactés.</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Nom
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  autoComplete="name"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Adresse email
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Sujet
              <input
                required
                minLength={3}
                maxLength={120}
                value={form.subject}
                onChange={(event) => update("subject", event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Votre message
              <textarea
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-slate-900 outline-none transition hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              />
              <span className="mt-1.5 block text-xs font-normal text-slate-500">
                {form.message.length}/5000 caractères
              </span>
            </label>

            <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
              <label>
                Ne pas remplir ce champ
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Les champs marqués sont nécessaires pour traiter votre demande.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
                {!loading && <ArrowRight size={16} className="ml-2" />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
