import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { Check, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  variant?: "light" | "dark";
}

const CurrencySwitcher = ({ variant = "light" }: Props) => {
  const { currency, setCurrency, options, ratesUpdatedAt, rates, flag } = useCurrency();

  const isDark = variant === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 px-3 h-9 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            isDark
              ? "bg-white/25 hover:bg-white/35 border-2 border-white/60 text-white backdrop-blur-md shadow-[0_4px_14px_-4px_rgba(0,0,0,0.4)]"
              : "bg-background hover:bg-muted border border-border text-foreground shadow-sm"
          }`}
          aria-label="Change currency"
        >
          <span className="text-base leading-none">{flag}</span>
          <span className="tracking-wider">{currency}</span>
          <Globe className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Display currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((c) => (
          <DropdownMenuItem
            key={c}
            onClick={() => setCurrency(c)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{getFlag(c)}</span>
              <span className="font-medium">{c}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                1 AED = {rates[c].toFixed(c === "AED" ? 0 : 4)}
              </span>
            </span>
            {currency === c && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground">
          {ratesUpdatedAt
            ? `Live FX · updated ${ratesUpdatedAt.toLocaleTimeString()}`
            : "Using fallback FX rates"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const getFlag = (c: Currency) => {
  switch (c) {
    case "AED":
      return "🇦🇪";
    case "USD":
      return "🇺🇸";
    case "GBP":
      return "🇬🇧";
    case "EUR":
      return "🇪🇺";
  }
};

export default CurrencySwitcher;
