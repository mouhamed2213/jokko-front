import { Banknote, Landmark, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import orangeMoneyLogo from "../../assets/om.png";
import waveLogo from "../../assets/wave.png";
import type { CashTransaction } from "../../types/index";
import { aggregateCashByMethod } from "./utils";

export const METHOD_CONFIG: Record<
  string,
  { name: string; logo?: string; icon?: LucideIcon; bg: string; text: string }
> = {
  CASH: {
    name: "Espèces",
    icon: Banknote,
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
    icon: Smartphone,
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  BANK: {
    name: "Virement",
    icon: Landmark,
    bg: "bg-slate-50",
    text: "text-slate-700",
  },
  OTHER: {
    name: "Autre",
    icon: Wallet,
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
  const Icon = config.icon ?? Wallet;
  return (
    <div
      className={`${cls} rounded-xl ${config.bg} ${config.text} border border-gray-200 flex items-center justify-center shrink-0 p-1.5`}
    >
      <Icon className="h-full w-full" />
    </div>
  );
}

export function getMethodBreakdown(transactions: CashTransaction[]) {
  return aggregateCashByMethod(transactions as any).map((item) => ({
    ...item,
    config: METHOD_CONFIG[item.method] || METHOD_CONFIG.OTHER,
  }));
}
