import orangeMoneyLogo from "../../assets/om.png";
import waveLogo from "../../assets/wave.png";
import type { CashTransaction } from "../../types/index";
import { aggregateCashByMethod } from "./utils";

export const METHOD_CONFIG: Record<
  string,
  { name: string; logo?: string; emoji?: string; bg: string; text: string }
> = {
  CASH: {
    name: "Espèces",
    emoji: "💵",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  WAVE: {
    name: "Wave",
    logo: waveLogo,
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  ORANGE_MONEY: {
    name: "Orange Money",
    logo: orangeMoneyLogo,
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  FREE_MONEY: {
    name: "Free Money",
    emoji: "🟣",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  BANK: {
    name: "Virement",
    emoji: "🏦",
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
  OTHER: {
    name: "Autre",
    emoji: "📱",
    bg: "bg-gray-50",
    text: "text-gray-700",
  },
};

export function MethodIcon({
  method,
  cls = "h-10 w-10",
}: {
  method: string;
  cls?: string;
}) {
  const config = METHOD_CONFIG[method] || METHOD_CONFIG.OTHER;
  if (config.logo) {
    return (
      <img
        src={config.logo}
        alt={config.name}
        className={`${cls} rounded-xl object-contain bg-white p-1 shadow-sm shrink-0 border border-gray-100`}
      />
    );
  }
  return (
    <div
      className={`${cls} rounded-xl ${config.bg} border border-gray-200 flex items-center justify-center shrink-0 text-xl`}
    >
      {config.emoji}
    </div>
  );
}

export function getMethodBreakdown(transactions: CashTransaction[]) {
  return aggregateCashByMethod(transactions as any).map((item) => ({
    ...item,
    config: METHOD_CONFIG[item.method] || METHOD_CONFIG.OTHER,
  }));
}
