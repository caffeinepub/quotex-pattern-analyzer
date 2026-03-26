import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { AnalysisInsights } from "./components/AnalysisInsights";
import { CandlestickChart } from "./components/CandlestickChart";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MarketNews } from "./components/MarketNews";
import { PriceTicker } from "./components/PriceTicker";
import { TradingActivity } from "./components/TradingActivity";
import { useMarketData } from "./hooks/useMarketData";

const TIMEFRAMES = ["1-Minute", "5-Minute", "15-Minute", "1-Hour"];

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

export default function App() {
  const [activePage, setActivePage] = useState("Analysis");
  const [timeframe, setTimeframe] = useState("1-Minute");
  const {
    data,
    activeId,
    setActiveId,
    activeInstrument,
    activeState,
    instruments,
  } = useMarketData();

  const patterns = useMemo(() => activeState?.patterns ?? [], [activeState]);
  const price = activeState?.currentPrice ?? activeInstrument.basePrice;
  const changePercent = activeState?.changePercent ?? 0;
  const isPos = changePercent >= 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.13 0.038 250)" }}
    >
      <Header activePage={activePage} onPageChange={setActivePage} />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4">
        {/* Instrument Header Strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 mb-4 p-3 rounded-xl border border-border"
          style={{ background: "oklch(0.17 0.042 250)" }}
          data-ocid="instrument.panel"
        >
          <span className="text-xl leading-none">{activeInstrument.flag}</span>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground">
              {activeInstrument.label}
            </h2>
            <span className="text-xl font-bold text-foreground tabular-nums">
              {formatPrice(price, activeId)}
            </span>
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2 ${
                isPos
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }`}
            >
              {isPos ? "+" : ""}
              {changePercent.toFixed(2)}%
            </Badge>
            {activeState?.isLive && (
              <Badge
                variant="outline"
                className="text-[10px] bg-success/10 text-success border-success/30"
              >
                <span className="w-1 h-1 rounded-full bg-success mr-1 animate-pulse inline-block" />
                LIVE
              </Badge>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Timeframe:</span>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger
                className="w-32 h-7 text-xs border-border bg-muted/20"
                data-ocid="timeframe.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf} value={tf} className="text-xs">
                    {tf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_240px] gap-3 mb-3">
          {/* Left: Price Ticker */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-border overflow-hidden shadow-card"
            style={{ background: "oklch(0.17 0.042 250)", height: "560px" }}
            data-ocid="ticker.panel"
          >
            <PriceTicker
              instruments={instruments}
              data={data}
              activeId={activeId}
              onSelect={setActiveId}
            />
          </motion.div>

          {/* Center: Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="rounded-xl border border-border overflow-hidden shadow-card flex flex-col"
            style={{ background: "oklch(0.17 0.042 250)", height: "560px" }}
            data-ocid="chart.panel"
          >
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Chart Pattern Detection
                </h3>
                {patterns.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-primary/15 text-primary border-primary/30"
                  >
                    {patterns.length} patterns
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-success inline-block rounded" />
                  BUY Signal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-destructive inline-block rounded" />
                  SELL Signal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-0.5 bg-warning inline-block rounded" />
                  MACD Signal
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-2">
              <CandlestickChart
                candles={activeState?.candles ?? []}
                patterns={patterns}
                symbol={activeId}
              />
            </div>
          </motion.div>

          {/* Right: Analysis Insights */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-border overflow-hidden shadow-card"
            style={{ background: "oklch(0.17 0.042 250)", height: "560px" }}
            data-ocid="insights.panel"
          >
            <AnalysisInsights
              patterns={patterns}
              pair={activeInstrument.label}
            />
          </motion.div>
        </div>

        {/* Bottom 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl border border-border overflow-hidden shadow-card"
            style={{ background: "oklch(0.17 0.042 250)", height: "260px" }}
            data-ocid="news.panel"
          >
            <MarketNews />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-xl border border-border overflow-hidden shadow-card"
            style={{ background: "oklch(0.17 0.042 250)", height: "260px" }}
            data-ocid="activity.panel"
          >
            <TradingActivity
              latestPatterns={patterns}
              pair={activeInstrument.label}
              price={price}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
