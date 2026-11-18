import type { ReactNode } from "react";
import { bgImage } from "../../data/publicImages";

interface Props {
  src: string;
  /** green : teinte verte de marque · ink : plus sombre, pour porter du texte blanc */
  tone?: "green" | "ink";
  className?: string;
  children?: ReactNode;
}

/** Photo en niveaux de gris teintée aux couleurs de la marque (duotone). */
export default function Photo({ src, tone = "green", className = "", children }: Props) {
  return (
    <div className={`relative isolate overflow-hidden ${className}`}>
      <div className="absolute inset-0 -z-30 bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: bgImage(src) }} />
      <div className={`absolute inset-0 -z-20 mix-blend-multiply ${tone === "green" ? "bg-jokko" : "bg-jokko-deep"}`} />
      {tone === "ink" && <div className="absolute inset-0 -z-10 bg-ink/45" />}
      {children}
    </div>
  );
}
