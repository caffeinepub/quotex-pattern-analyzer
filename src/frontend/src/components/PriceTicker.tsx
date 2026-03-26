import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Instrument, InstrumentState } from "../hooks/useMarketData";

interface Props {
  instruments: Instrument[];
  data: Record<string, InstrumentState>;
  activeId: string;
  onSelect: (id: string) => void;
}

function formatPrice(price: number, id: string): string {
  if (id === "BTCUSDT")
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  if (id === "ETHUSDT") return price.toFixed(2);
  if (id === "XAUUSD") return price.toFixed(2);
  if (id === "GBPJPY") return price.toFixed(3);
  return price.toFixed(4);
}

export function PriceTicker({ instruments, data, activeId, onSelect }: Props) {
  const [flashing, setFlashing] = useState<
    Record<string, "up" | "down" | null>
  >({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const updates: Record<string, "up" | "down" | null> = {};
    for (const inst of instruments) {
      const prev = prevPrices.current[inst.id];
      const curr = data[inst.id]?.currentPrice ?? 0;
      if (prev !== undefined && curr !== prev) {
        updates[inst.id] = curr > prev ? "up" : "down";
      }
      prevPrices.current[inst.id] = curr;
    }
    if (Object.keys(updates).length === 0) return;
    setFlashing((f) => ({ ...f, ...updates }));
    const t = setTimeout(() => {
      setFlashing((f) => {
        const next = { ...f };
        for (const k of Object.keys(updates)) next[k] = null;
        return next;
      });
    }, 600);
    return () => clearTimeout(t);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Price Ticker
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2" data-ocid="ticker.list">
          {instruments.map((inst, idx) => {
            const state = data[inst.id];
            const price = state?.currentPrice ?? inst.basePrice;
            const pct = state?.changePercent ?? 0;
            const isPos = pct >= 0;
            const flash = flashing[inst.id];
            const isActive = activeId === inst.id;

            return (
              <button
                key={inst.id}
                type="button"
                data-ocid={`ticker.item.${idx + 1}`}
                onClick={() => onSelect(inst.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg mb-1 text-left transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 border border-primary/30"
                    : "hover:bg-muted/20 border border-transparent"
                } ${
                  flash === "up"
                    ? "bg-success/10"
                    : flash === "down"
                      ? "bg-destructive/10"
                      : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{inst.flag}</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {inst.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {state?.isLive ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                          Live
                        </span>
                      ) : (
                        "Simulated"
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-bold tabular-nums transition-colors ${
                      flash === "up"
                        ? "text-success"
                        : flash === "down"
                          ? "text-destructive"
                          : "text-foreground"
                    }`}
                  >
                    {formatPrice(price, inst.id)}
                  </p>
                  <p
                    className={`text-[10px] font-medium flex items-center gap-0.5 justify-end ${
                      isPos ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isPos ? (
                      <TrendingUp className="w-2.5 h-2.5" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5" />
                    )}
                    {isPos ? "+" : ""}
                    {pct.toFixed(2)}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
