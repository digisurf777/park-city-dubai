import React, { createContext, useContext, useEffect, useState } from "react";

export type Currency = "AED" | "USD" | "GBP" | "EUR";

const SYMBOLS: Record<Currency, string> = {
  AED: "د.إ",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

const FLAGS: Record<Currency, string> = {
  AED: "🇦🇪",
  USD: "🇺🇸",
  GBP: "🇬🇧",
  EUR: "🇪🇺",
};

// Conservative fallback rates (1 AED = X). Updated via API on mount.
const FALLBACK_RATES: Record<Currency, number> = {
  AED: 1,
  USD: 0.272,
  GBP: 0.215,
  EUR: 0.252,
};

interface CurrencyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
  ratesUpdatedAt: Date | null;
  /** Convert from AED into the active currency. */
  convert: (aed: number) => number;
  /** Format an AED value as a string in the active currency. */
  format: (aed: number, opts?: { compact?: boolean; decimals?: number }) => string;
  symbol: string;
  flag: string;
  options: Currency[];
}

const Ctx = createContext<CurrencyCtx | null>(null);

const STORAGE_KEY = "admin.currency";

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "AED";
    const stored = window.localStorage.getItem(STORAGE_KEY) as Currency | null;
    return stored && ["AED", "USD", "GBP", "EUR"].includes(stored) ? stored : "AED";
  });
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<Date | null>(null);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, c);
  };

  // Live FX from open exchangerate API (no key needed). Cached 6h.
  useEffect(() => {
    const cacheKey = "admin.fx.cache";
    try {
      const cached = window.localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.ts && Date.now() - parsed.ts < 6 * 60 * 60 * 1000 && parsed.rates) {
          setRates(parsed.rates);
          setRatesUpdatedAt(new Date(parsed.ts));
          return;
        }
      }
    } catch {}

    (async () => {
      try {
        // Free, no-key endpoint. Returns USD-base rates; we re-base to AED.
        const res = await fetch("https://open.er-api.com/v6/latest/AED");
        if (!res.ok) throw new Error("fx fetch failed");
        const json = await res.json();
        if (json?.result !== "success" || !json.rates) throw new Error("invalid fx response");
        const next: Record<Currency, number> = {
          AED: 1,
          USD: Number(json.rates.USD) || FALLBACK_RATES.USD,
          GBP: Number(json.rates.GBP) || FALLBACK_RATES.GBP,
          EUR: Number(json.rates.EUR) || FALLBACK_RATES.EUR,
        };
        setRates(next);
        const ts = Date.now();
        setRatesUpdatedAt(new Date(ts));
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify({ ts, rates: next }));
        } catch {}
      } catch (e) {
        console.warn("FX fetch failed, using fallback rates", e);
      }
    })();
  }, []);

  const convert = (aed: number) => (Number.isFinite(aed) ? aed * rates[currency] : 0);

  const format: CurrencyCtx["format"] = (aed, opts = {}) => {
    const value = convert(aed);
    const decimals = opts.decimals ?? (currency === "AED" ? 0 : 2);

    if (opts.compact && Math.abs(value) >= 1000) {
      const formatter = new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      });
      return `${SYMBOLS[currency]}${formatter.format(value)}`;
    }
    const formatted = new Intl.NumberFormat("en", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
    }).format(value);
    return `${SYMBOLS[currency]}${formatted}`;
  };

  return (
    <Ctx.Provider
      value={{
        currency,
        setCurrency,
        rates,
        ratesUpdatedAt,
        convert,
        format,
        symbol: SYMBOLS[currency],
        flag: FLAGS[currency],
        options: ["AED", "USD", "GBP", "EUR"],
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe fallback so components don't crash if used outside provider
    return {
      currency: "AED" as Currency,
      setCurrency: () => {},
      rates: FALLBACK_RATES,
      ratesUpdatedAt: null,
      convert: (n: number) => n,
      format: (n: number) =>
        `${SYMBOLS.AED}${new Intl.NumberFormat("en").format(Math.round(n))}`,
      symbol: SYMBOLS.AED,
      flag: FLAGS.AED,
      options: ["AED", "USD", "GBP", "EUR"] as Currency[],
    };
  }
  return ctx;
};
