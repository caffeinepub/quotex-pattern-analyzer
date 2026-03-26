import { useCallback, useEffect, useRef } from "react";
import type { Candle } from "../utils/indicators";
import { calculateMACD, calculateRSI } from "../utils/indicators";
import type { Pattern } from "../utils/patternDetection";

interface Props {
  candles: Candle[];
  patterns: Pattern[];
  symbol: string;
}

const COLORS = {
  bg: "#0E1726",
  border: "#23324A",
  textMuted: "#93A4BC",
  accent: "#7C5CFF",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  gridLine: "rgba(35,50,74,0.7)",
};

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("BTC")) return price.toFixed(1);
  if (symbol.includes("ETH")) return price.toFixed(2);
  if (symbol.includes("XAU")) return price.toFixed(2);
  if (symbol.includes("JPY")) return price.toFixed(3);
  return price.toFixed(4);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function CandlestickChart({ candles, patterns, symbol }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const paddingLeft = 8;
    const paddingRight = 64;
    const paddingTop = 12;
    const chartH = H * 0.58;
    const volH = H * 0.12;
    const macdH = H * 0.13;
    const rsiH = H * 0.12;
    const labelH = 22;
    const gap = 4;

    const chartTop = paddingTop;
    const chartBottom = chartTop + chartH;
    const volTop = chartBottom + gap + labelH;
    const volBottom = volTop + volH;
    const macdTop = volBottom + gap + labelH;
    const macdBottom = macdTop + macdH;
    const rsiTop = macdBottom + gap + labelH;
    const rsiBottom = rsiTop + rsiH;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    const chartW = W - paddingLeft - paddingRight;
    const display = candles.slice(-80);
    const candleCount = display.length;
    if (candleCount === 0) return;

    const candleW = Math.max(2, chartW / candleCount - 1);
    const spacing = chartW / candleCount;

    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;
    for (const c of display) {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
    }
    const priceRange = maxPrice - minPrice || 1;
    const pricePad = priceRange * 0.05;
    const priceMin = minPrice - pricePad;
    const priceMax = maxPrice + pricePad;
    const priceRangeP = priceMax - priceMin;

    const toY = (price: number) =>
      chartTop + ((priceMax - price) / priceRangeP) * chartH;
    const toX = (i: number) => paddingLeft + i * spacing + spacing / 2;

    // Grid lines
    const gridLines = 5;
    for (let g = 0; g <= gridLines; g++) {
      const price = priceMin + (priceRangeP * g) / gridLines;
      const y = toY(price);
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(W - paddingRight, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(formatPrice(price, symbol), W - paddingRight + 6, y + 3);
    }

    // Time axis
    const timeLabelEvery = Math.max(1, Math.floor(candleCount / 8));
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "9px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < candleCount; i += timeLabelEvery) {
      ctx.fillText(formatTime(display[i].time), toX(i), chartBottom + 14);
    }

    // Candles
    for (let i = 0; i < candleCount; i++) {
      const c = display[i];
      const x = toX(i);
      const isBull = c.close >= c.open;
      const color = isBull ? COLORS.green : COLORS.red;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyBottom = toY(Math.min(c.open, c.close));
      const bodyH = Math.max(1, bodyBottom - bodyTop);
      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }

    // Pattern overlays
    for (const pattern of patterns) {
      const startIdx = Math.max(
        0,
        pattern.startIdx - (candles.length - candleCount),
      );
      const endIdx = Math.max(
        0,
        pattern.endIdx - (candles.length - candleCount),
      );
      if (startIdx < 0 || endIdx >= candleCount) continue;
      const x1 = toX(startIdx);
      const x2 = toX(Math.min(endIdx, candleCount - 1));
      const y1 = toY(display[startIdx]?.high ?? priceMax);
      const y2 = toY(
        display[Math.min(endIdx, candleCount - 1)]?.high ?? priceMax,
      );
      ctx.strokeStyle = pattern.direction === "BUY" ? COLORS.green : COLORS.red;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      const labelX = (x1 + x2) / 2;
      const labelY = Math.min(y1, y2) - 8;
      const dir = pattern.direction === "BUY" ? "\u25b2" : "\u25bc";
      const label = `${dir} ${pattern.name}`;
      ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle =
        pattern.direction === "BUY"
          ? "rgba(34,197,94,0.15)"
          : "rgba(239,68,68,0.15)";
      ctx.fillRect(labelX - tw / 2 - 4, labelY - 12, tw + 8, 16);
      ctx.fillStyle = pattern.direction === "BUY" ? COLORS.green : COLORS.red;
      ctx.textAlign = "center";
      ctx.fillText(label, labelX, labelY);
    }

    // Volume panel
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "9px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("VOLUME", paddingLeft, volTop - 2);
    const maxVol = Math.max(...display.map((c) => c.volume));
    for (let i = 0; i < candleCount; i++) {
      const c = display[i];
      const x = toX(i);
      const isBull = c.close >= c.open;
      const barH = (c.volume / maxVol) * volH;
      ctx.fillStyle = isBull ? "rgba(34,197,94,0.45)" : "rgba(239,68,68,0.45)";
      ctx.fillRect(x - candleW / 2, volBottom - barH, candleW, barH);
    }

    // MACD panel
    ctx.fillStyle = COLORS.textMuted;
    ctx.textAlign = "left";
    ctx.fillText("MACD", paddingLeft, macdTop - 2);
    const closes = display.map((c) => c.close);
    const macdData = calculateMACD(closes);
    const histMax = Math.max(...macdData.histogram.map(Math.abs)) || 1;
    const macdMid = (macdTop + macdBottom) / 2;
    for (let i = 0; i < candleCount; i++) {
      const x = toX(i);
      const hist = macdData.histogram[i] || 0;
      const barH = (Math.abs(hist) / histMax) * (macdH / 2);
      ctx.fillStyle = hist >= 0 ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)";
      if (hist >= 0) {
        ctx.fillRect(x - candleW / 2, macdMid - barH, candleW, barH);
      } else {
        ctx.fillRect(x - candleW / 2, macdMid, candleW, barH);
      }
    }
    ctx.strokeStyle = COLORS.amber;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < candleCount; i++) {
      const x = toX(i);
      const sig = macdData.signal[i] || 0;
      const y = macdMid - (sig / histMax) * (macdH / 2);
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, macdMid);
    ctx.lineTo(W - paddingRight, macdMid);
    ctx.stroke();

    // RSI panel
    ctx.fillStyle = COLORS.textMuted;
    ctx.textAlign = "left";
    ctx.fillText("RSI (14)", paddingLeft, rsiTop - 2);
    const rsiValues = calculateRSI(closes);
    const rsiRange = rsiBottom - rsiTop;
    const rsiToY = (v: number) => rsiTop + ((100 - v) / 100) * rsiRange;
    ctx.fillStyle = "rgba(239,68,68,0.07)";
    ctx.fillRect(paddingLeft, rsiTop, chartW, (10 / 100) * rsiRange);
    ctx.fillStyle = "rgba(34,197,94,0.07)";
    ctx.fillRect(
      paddingLeft,
      rsiBottom - (30 / 100) * rsiRange,
      chartW,
      (30 / 100) * rsiRange,
    );
    ctx.strokeStyle = "rgba(239,68,68,0.4)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, rsiToY(70));
    ctx.lineTo(W - paddingRight, rsiToY(70));
    ctx.stroke();
    ctx.strokeStyle = "rgba(34,197,94,0.4)";
    ctx.beginPath();
    ctx.moveTo(paddingLeft, rsiToY(30));
    ctx.lineTo(W - paddingRight, rsiToY(30));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let rsiStarted = false;
    for (let i = 0; i < candleCount; i++) {
      const rsiVal = rsiValues[i];
      if (!rsiVal || rsiVal === 0) continue;
      const x = toX(i);
      const y = rsiToY(rsiVal);
      if (!rsiStarted) {
        ctx.moveTo(x, y);
        rsiStarted = true;
      } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "9px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("70", W - paddingRight + 6, rsiToY(70) + 3);
    ctx.fillText("30", W - paddingRight + 6, rsiToY(30) + 3);
    const lastRsi = rsiValues.filter((v) => v > 0).pop() ?? 50;
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(lastRsi.toFixed(1), W - paddingRight + 6, rsiToY(lastRsi) + 3);

    // Dividers
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    for (const y of [chartBottom, volBottom + gap, macdBottom + gap]) {
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y + labelH / 2);
      ctx.lineTo(W - paddingRight, y + labelH / 2);
      ctx.stroke();
    }
  }, [candles, patterns, symbol]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
