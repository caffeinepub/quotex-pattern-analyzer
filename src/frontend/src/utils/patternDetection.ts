import type { Candle } from "./indicators";

export interface Pattern {
  name: string;
  direction: "BUY" | "SELL";
  confidence: number;
  description: string;
  status: "Confirmed" | "Active" | "Forming";
  startIdx: number;
  endIdx: number;
  pair?: string;
}

function localMaxima(highs: number[], window = 3): number[] {
  const maxima: number[] = [];
  for (let i = window; i < highs.length - window; i++) {
    let isMax = true;
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && highs[j] >= highs[i]) {
        isMax = false;
        break;
      }
    }
    if (isMax) maxima.push(i);
  }
  return maxima;
}

function localMinima(lows: number[], window = 3): number[] {
  const minima: number[] = [];
  for (let i = window; i < lows.length - window; i++) {
    let isMin = true;
    for (let j = i - window; j <= i + window; j++) {
      if (j !== i && lows[j] <= lows[i]) {
        isMin = false;
        break;
      }
    }
    if (isMin) minima.push(i);
  }
  return minima;
}

function linearRegression(y: number[]): { slope: number; intercept: number } {
  const n = y.length;
  const xMean = (n - 1) / 2;
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (y[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: yMean - slope * xMean };
}

export function detectPatterns(candles: Candle[], pair = ""): Pattern[] {
  if (candles.length < 20) return [];
  const patterns: Pattern[] = [];
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const n = candles.length;

  const maxima = localMaxima(highs, 3);
  const minima = localMinima(lows, 3);

  // Head & Shoulders
  if (maxima.length >= 3) {
    const recent = maxima.slice(-5);
    for (let i = 0; i < recent.length - 2; i++) {
      const l = recent[i];
      const m = recent[i + 1];
      const r = recent[i + 2];
      const lH = highs[l];
      const mH = highs[m];
      const rH = highs[r];
      if (mH > lH && mH > rH && Math.abs(lH - rH) / mH < 0.03) {
        const confidence = Math.round(70 + Math.random() * 25);
        const status: Pattern["status"] =
          r === maxima[maxima.length - 1] ? "Active" : "Confirmed";
        patterns.push({
          name: "Head & Shoulders",
          direction: "SELL",
          confidence,
          description: "Bearish reversal: head higher than both shoulders",
          status,
          startIdx: l,
          endIdx: r,
          pair,
        });
      }
    }
  }

  // Inverse Head & Shoulders
  if (minima.length >= 3) {
    const recent = minima.slice(-5);
    for (let i = 0; i < recent.length - 2; i++) {
      const l = recent[i];
      const m = recent[i + 1];
      const r = recent[i + 2];
      const lL = lows[l];
      const mL = lows[m];
      const rL = lows[r];
      if (mL < lL && mL < rL && Math.abs(lL - rL) / lL < 0.03) {
        const confidence = Math.round(68 + Math.random() * 27);
        patterns.push({
          name: "Inverse Head & Shoulders",
          direction: "BUY",
          confidence,
          description: "Bullish reversal: head lower than both shoulders",
          status: "Active",
          startIdx: l,
          endIdx: r,
          pair,
        });
      }
    }
  }

  // Double Top
  if (maxima.length >= 2) {
    const r1 = maxima[maxima.length - 2];
    const r2 = maxima[maxima.length - 1];
    if (r2 - r1 >= 5 && Math.abs(highs[r1] - highs[r2]) / highs[r1] < 0.015) {
      const confidence = Math.round(65 + Math.random() * 30);
      patterns.push({
        name: "Double Top",
        direction: "SELL",
        confidence,
        description:
          "Strong resistance tested twice \u2014 bearish reversal likely",
        status: "Confirmed",
        startIdx: r1,
        endIdx: r2,
        pair,
      });
    }
  }

  // Double Bottom
  if (minima.length >= 2) {
    const m1 = minima[minima.length - 2];
    const m2 = minima[minima.length - 1];
    if (m2 - m1 >= 5 && Math.abs(lows[m1] - lows[m2]) / lows[m1] < 0.015) {
      const confidence = Math.round(66 + Math.random() * 29);
      patterns.push({
        name: "Double Bottom",
        direction: "BUY",
        confidence,
        description:
          "Strong support tested twice \u2014 bullish reversal likely",
        status: "Forming",
        startIdx: m1,
        endIdx: m2,
        pair,
      });
    }
  }

  // Ascending Triangle
  if (n >= 20) {
    const seg = candles.slice(-20);
    const segHighs = seg.map((c) => c.high);
    const segLows = seg.map((c) => c.low);
    const highLR = linearRegression(segHighs);
    const lowLR = linearRegression(segLows);
    if (
      Math.abs(highLR.slope) < 0.0005 * segHighs[0] &&
      lowLR.slope > 0.0003 * segLows[0]
    ) {
      patterns.push({
        name: "Ascending Triangle",
        direction: "BUY",
        confidence: Math.round(72 + Math.random() * 20),
        description:
          "Flat resistance with rising lows \u2014 bullish breakout expected",
        status: "Active",
        startIdx: n - 20,
        endIdx: n - 1,
        pair,
      });
    }
  }

  // Descending Triangle
  if (n >= 20) {
    const seg = candles.slice(-20);
    const segHighs = seg.map((c) => c.high);
    const segLows = seg.map((c) => c.low);
    const highLR = linearRegression(segHighs);
    const lowLR = linearRegression(segLows);
    if (
      highLR.slope < -0.0003 * segHighs[0] &&
      Math.abs(lowLR.slope) < 0.0005 * segLows[0]
    ) {
      patterns.push({
        name: "Descending Triangle",
        direction: "SELL",
        confidence: Math.round(70 + Math.random() * 22),
        description:
          "Flat support with falling highs \u2014 bearish breakdown expected",
        status: "Forming",
        startIdx: n - 20,
        endIdx: n - 1,
        pair,
      });
    }
  }

  // Bull Flag
  if (n >= 15) {
    const flagpole = candles.slice(-15, -8);
    const flag = candles.slice(-8);
    const poleMove =
      (flagpole[flagpole.length - 1].close - flagpole[0].open) /
      flagpole[0].open;
    const flagMove =
      (flag[flag.length - 1].close - flag[0].open) / flag[0].open;
    if (poleMove > 0.01 && flagMove > -0.005 && flagMove < 0.005) {
      patterns.push({
        name: "Bull Flag",
        direction: "BUY",
        confidence: Math.round(75 + Math.random() * 18),
        description: "Strong upward move followed by tight consolidation",
        status: "Active",
        startIdx: n - 15,
        endIdx: n - 1,
        pair,
      });
    }
  }

  // Bear Flag
  if (n >= 15) {
    const flagpole = candles.slice(-15, -8);
    const flag = candles.slice(-8);
    const poleMove =
      (flagpole[flagpole.length - 1].close - flagpole[0].open) /
      flagpole[0].open;
    const flagMove =
      (flag[flag.length - 1].close - flag[0].open) / flag[0].open;
    if (poleMove < -0.01 && flagMove > -0.005 && flagMove < 0.005) {
      patterns.push({
        name: "Bear Flag",
        direction: "SELL",
        confidence: Math.round(74 + Math.random() * 19),
        description: "Strong downward move followed by tight consolidation",
        status: "Forming",
        startIdx: n - 15,
        endIdx: n - 1,
        pair,
      });
    }
  }

  // Engulfing patterns
  if (n >= 2) {
    const prev = candles[n - 2];
    const curr = candles[n - 1];
    if (
      prev.close < prev.open &&
      curr.close > curr.open &&
      curr.open < prev.close &&
      curr.close > prev.open
    ) {
      patterns.push({
        name: "Bullish Engulfing",
        direction: "BUY",
        confidence: Math.round(70 + Math.random() * 20),
        description:
          "Current candle completely engulfs previous bearish candle",
        status: "Confirmed",
        startIdx: n - 2,
        endIdx: n - 1,
        pair,
      });
    }
    if (
      prev.close > prev.open &&
      curr.close < curr.open &&
      curr.open > prev.close &&
      curr.close < prev.open
    ) {
      patterns.push({
        name: "Bearish Engulfing",
        direction: "SELL",
        confidence: Math.round(70 + Math.random() * 20),
        description:
          "Current candle completely engulfs previous bullish candle",
        status: "Confirmed",
        startIdx: n - 2,
        endIdx: n - 1,
        pair,
      });
    }
  }

  const seen = new Map<string, Pattern>();
  for (const p of patterns) {
    const existing = seen.get(p.name);
    if (!existing || p.confidence > existing.confidence) seen.set(p.name, p);
  }

  return Array.from(seen.values()).slice(0, 6);
}
