import type { ReactNode } from "react";
import Photo from "./Photo";

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  image: string;
  children?: ReactNode;
  align?: "left" | "center";
}

/** Bandeau d'en-tête des pages publiques : photo duotone + courbe de la marque. */
export default function PageHero({ eyebrow, title, subtitle, image, children, align = "left" }: Props) {
  const center = align === "center";
  return (
    <Photo src={image} tone="ink" className="text-white">
      <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none overflow-visible absolute -bottom-24 right-0 -z-0 h-[30rem] w-[30rem] text-white/10 sm:right-16">
        <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
      </svg>
      <div className={`relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 ${center ? "text-center" : ""}`}>
        <p className="inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-sun">
          <span className="h-2.5 w-2.5 rounded-full bg-sun" />
          {eyebrow}
        </p>
        <h1 className={`mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-6xl ${center ? "mx-auto" : ""}`}>{title}</h1>
        {subtitle && <p className={`mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg ${center ? "mx-auto" : ""}`}>{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </Photo>
  );
}
