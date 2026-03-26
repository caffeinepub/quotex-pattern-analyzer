import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import type { Pattern } from "../utils/patternDetection";

export interface Signal {
  id: number;
  pair: string;
  pattern: string;
  direction: "BUY" | "SELL";
  confidence: number;
  price: number;
  time: string;
}

interface Props {
  latestPatterns: Pattern[];
  pair: string;
  price: number;
}

function nowTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export function TradingActivity({ latestPatterns, pair, price }: Props) {
  const [signals, setSignals] = useState<Signal[]>(() => [
    {
      id: 1,
      pair: "BTC/USDT",
      pattern: "Bull Flag",
      direction: "BUY",
      confidence: 87,
      price: 67420.1,
      time: "09:42:15",
    },
    {
      id: 2,
      pair: "EUR/USD",
      pattern: "Double Bottom",
      direction: "BUY",
      confidence: 79,
      price: 1.0848,
      time: "09:40:03",
    },
    {
      id: 3,
      pair: "XAU/USD",
      pattern: "Ascending Triangle",
      direction: "BUY",
      confidence: 82,
      price: 2341.5,
      time: "09:38:47",
    },
    {
      id: 4,
      pair: "ETH/USDT",
      pattern: "Bearish Engulfing",
      direction: "SELL",
      confidence: 75,
      price: 3418.4,
      time: "09:36:22",
    },
    {
      id: 5,
      pair: "GBP/USD",
      pattern: "Head & Shoulders",
      direction: "SELL",
      confidence: 83,
      price: 1.2647,
      time: "09:34:09",
    },
  ]);
  const nextIdRef = useRef(6);
  const prevPatternRef = useRef<string>("");

  useEffect(() => {
    if (latestPatterns.length === 0) return;
    const top = latestPatterns[0];
    // Avoid duplicate signals for the same pattern+pair combo
    const key = `${pair}-${top.name}`;
    if (key === prevPatternRef.current) return;
    prevPatternRef.current = key;
    const id = nextIdRef.current++;
    setSignals((prev) => [
      {
        id,
        pair,
        pattern: top.name,
        direction: top.direction,
        confidence: top.confidence,
        price,
        time: nowTime(),
      },
      ...prev.slice(0, 9),
    ]);
  }, [latestPatterns, pair, price]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Trading Activity
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-success">Signals Live</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5" data-ocid="activity.list">
          {signals.map((signal, i) => (
            <div
              key={signal.id}
              data-ocid={`activity.item.${i + 1}`}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/10 border border-border/50"
            >
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 h-4 font-bold shrink-0 ${
                  signal.direction === "BUY"
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                }`}
              >
                {signal.direction}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-semibold text-foreground">
                    {signal.pair}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    &middot;
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {signal.pattern}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {signal.time}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-[10px] font-bold ${
                    signal.direction === "BUY"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {signal.confidence}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
