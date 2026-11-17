import type { ReactNode } from "react";
import { bgImage } from "../../data/publicImages";

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
  fallback?: string;
  children?: ReactNode;
  align?: "left" | "center";
}

/** Bandeau d'en-tête des pages publiques : photo de fond + voile sombre. */
export default function PageHero({ eyebrow, title, subtitle, image, fallback, children, align = "left" }: Props) {
  const center = align === "center";
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: bgImage(image, fallback) }} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
      <div className={`mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 ${center ? "text-center" : ""}`}>
        <p className={`inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300`}>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {eyebrow}
        </p>
        <h1 className={`mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl ${center ? "mx-auto" : ""}`}>{title}</h1>
        {subtitle && <p className={`mt-5 max-w-2xl text-base leading-8 text-slate-200 ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
