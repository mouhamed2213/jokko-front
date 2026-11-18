import { motion, useReducedMotion } from "framer-motion";

const lines = [
  { label: "Riz brisé 5 kg", qty: 1, price: 4000 },
  { label: "Huile 1 L", qty: 2, price: 1500 },
  { label: "Sucre 1 kg", qty: 3, price: 800 },
  { label: "Savon", qty: 4, price: 250 },
];
const total = lines.reduce((n, l) => n + l.qty * l.price, 0);
const fcfa = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f/g, " ");

// Bord inférieur dentelé, comme un ticket arraché.
const teeth = Array.from({ length: 24 }, (_, i) => `${((i + 1) * 100) / 24}% ${i % 2 === 0 ? "calc(100% - 9px)" : "100%"}`).join(",");
const clip = `polygon(0 0,100% 0,100% 100%,${teeth},0 calc(100% - 9px))`;

/** Ticket de caisse d'exemple, imprimé ligne par ligne à l'apparition. */
export default function Receipt({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: -8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: 0.5 + i * 0.28, duration: 0.35 },
  } as const);

  return (
    <div className={className} style={{ filter: "drop-shadow(0 24px 28px rgba(15,32,26,0.28))" }}>
      <div className="bg-paper px-6 pb-10 pt-6 text-ink" style={{ clipPath: clip }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-extrabold tracking-tight">Boutique Sandaga</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">Ticket n° 0148 · exemple</p>
          </div>
          <span className="mt-1 h-3 w-3 rounded-full bg-sun" aria-hidden />
        </div>
        <div className="my-4 border-t border-dashed border-ink/25" />
        <ul className="space-y-2.5 font-mono text-[13px]">
          {lines.map((l, i) => (
            <motion.li key={l.label} className="flex items-baseline justify-between gap-3" {...item(i)}>
              <span>{l.qty} × {l.label}</span>
              <span className="shrink-0 tabular-nums">{fcfa(l.qty * l.price)}</span>
            </motion.li>
          ))}
        </ul>
        <div className="my-4 border-t border-dashed border-ink/25" />
        <motion.div className="flex items-baseline justify-between" {...item(lines.length)}>
          <span className="text-sm font-extrabold uppercase tracking-wide">Total</span>
          <span className="text-2xl font-extrabold tabular-nums tracking-tight">{fcfa(total)} <span className="text-sm">FCFA</span></span>
        </motion.div>
        <motion.p className="mt-3 inline-flex items-center gap-2 rounded-full bg-jokko px-3 py-1 text-xs font-bold text-white" {...item(lines.length + 1)}>
          Payé · Wave
        </motion.p>
      </div>
    </div>
  );
}
