import { useCallback, useEffect, useRef, useState } from "react";
import type { Candle } from "../utils/indicators";
import { type Pattern, detectPatterns } from "../utils/patternDetection";

export interface Instrument {
  id: string;
  label: string;
  flag: string;
  binanceSymbol: string | null;
  basePrice: number;
  pip: number;
}

export const INSTRUMENTS: Instrument[] = [
  {
    id: "EURUSD",
    label: "EUR/USD",
    flag: "\u{1F1EA}\u{1F1FA}",
    binanceSymbol: null,
    basePrice: 1.085,
    pip: 0.0001,
  },
  {
    id: "GBPUSD",
    label: "GBP/USD",
    flag: "\u{1F1EC}\u{1F1E7}",
    binanceSymbol: null,
    basePrice: 1.265,
    pip: 0.0001,
  },
  {
    id: "BTCUSDT",
    label: "BTC/USDT",
    flag: "\u20BF",
    binanceSymbol: "btcusdt",
    basePrice: 67500,
    pip: 1,
  },
  {
    id: "ETHUSDT",
    label: "ETH/USDT",
    flag: "\u039E",
    binanceSymbol: "ethusdt",
    basePrice: 3420,
    pip: 0.01,
  },
  {
    id: "XAUUSD",
    label: "XAU/USD",
    flag: "\u{1F947}",
    binanceSymbol: null,
    basePrice: 2340.5,
    pip: 0.01,
  },
  {
    id: "GBPJPY",
    label: "GBP/JPY",
    flag: "\u{1F1EF}\u{1F1F5}",
    binanceSymbol: null,
    basePrice: 192.35,
    pip: 0.01,
  },
];

export interface InstrumentState {
  candles: Candle[];
  currentPrice: number;
  change24h: number;
  changePercent: number;
  patterns: Pattern[];
  isLive: boolean;
}

function generateMockCandles(basePrice: number, count = 100): Candle[] {
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 60000) * 60;
  let price = basePrice;
  const volatility = basePrice * 0.0015;

  for (let i = count - 1; i >= 0; i--) {
    const time = (now - i * 60) * 1000;
    const open = price;
    const changeRatio = (Math.random() - 0.49) * volatility;
    const close = Math.max(open * 0.99, open + changeRatio);
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = basePrice * (500 + Math.random() * 1500);
    candles.push({
      time,
      open,
      high,
      low: Math.max(low, 0.0001),
      close,
      volume,
    });
    price = close;
  }
  return candles;
}

function parseBinanceKline(data: unknown[]): Candle {
  const d = data as [number, string, string, string, string, string];
  return {
    time: d[0] as number,
    open: Number.parseFloat(d[1] as string),
    high: Number.parseFloat(d[2] as string),
    low: Number.parseFloat(d[3] as string),
    close: Number.parseFloat(d[4] as string),
    volume: Number.parseFloat(d[5] as string),
  };
}

export function useMarketData() {
  const [activeId, setActiveId] = useState<string>("BTCUSDT");
  const [data, setData] = useState<Record<string, InstrumentState>>(() => {
    const init: Record<string, InstrumentState> = {};
    for (const inst of INSTRUMENTS) {
      const candles = generateMockCandles(inst.basePrice, 100);
      const last = candles[candles.length - 1];
      const first = candles[0];
      init[inst.id] = {
        candles,
        currentPrice: last.close,
        change24h: last.close - first.open,
        changePercent: ((last.close - first.open) / first.open) * 100,
        patterns: detectPatterns(candles, inst.label),
        isLive: false,
      };
    }
    return init;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const forexTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateForexTick = useCallback(() => {
    setData((prev) => {
      const next = { ...prev };
      for (const inst of INSTRUMENTS) {
        if (inst.binanceSymbol !== null) continue;
        const state = prev[inst.id];
        if (!state) continue;
        const candles = [...state.candles];
        const last = candles[candles.length - 1];
        const now = Date.now();
        const minuteStart = Math.floor(now / 60000) * 60000;
        const volatility = inst.basePrice * 0.00035;
        const delta = (Math.random() - 0.49) * volatility;
        const newClose = Math.max(last.close + delta, 0.0001);

        if (last.time >= minuteStart) {
          candles[candles.length - 1] = {
            ...last,
            close: newClose,
            high: Math.max(last.high, newClose),
            low: Math.min(last.low, newClose),
          };
        } else {
          const newCandle: Candle = {
            time: minuteStart,
            open: last.close,
            high: Math.max(last.close, newClose),
            low: Math.min(last.close, newClose),
            close: newClose,
            volume: inst.basePrice * (500 + Math.random() * 1500),
          };
          candles.push(newCandle);
          if (candles.length > 150) candles.shift();
        }

        const firstCandle = candles[0];
        next[inst.id] = {
          ...state,
          candles,
          currentPrice: newClose,
          change24h: newClose - firstCandle.open,
          changePercent:
            ((newClose - firstCandle.open) / firstCandle.open) * 100,
          patterns: detectPatterns(candles, inst.label),
        };
      }
      return next;
    });
  }, []);

  const connectBinance = useCallback(async () => {
    const cryptoInstruments = INSTRUMENTS.filter(
      (i) => i.binanceSymbol !== null,
    );

    await Promise.all(
      cryptoInstruments.map(async (inst) => {
        try {
          const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${inst.id}&interval=1m&limit=100`,
          );
          if (!res.ok) return;
          const raw: unknown[][] = await res.json();
          const candles = raw.map(parseBinanceKline);
          if (candles.length === 0) return;
          const last = candles[candles.length - 1];
          const first = candles[0];
          setData((prev) => ({
            ...prev,
            [inst.id]: {
              ...prev[inst.id],
              candles,
              currentPrice: last.close,
              change24h: last.close - first.open,
              changePercent: ((last.close - first.open) / first.open) * 100,
              patterns: detectPatterns(candles, inst.label),
              isLive: true,
            },
          }));
        } catch {
          // silently fallback to mock data
        }
      }),
    );

    const symbols = cryptoInstruments.map((i) => `${i.binanceSymbol}@kline_1m`);
    const streamUrl = `wss://stream.binance.com:9443/stream?streams=${symbols.join("/")}`;

    try {
      const ws = new WebSocket(streamUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);
          const k = msg?.data?.k;
          if (!k) return;
          const symbol = (k.s as string).toUpperCase();
          const candle: Candle = {
            time: k.t as number,
            open: Number.parseFloat(k.o as string),
            high: Number.parseFloat(k.h as string),
            low: Number.parseFloat(k.l as string),
            close: Number.parseFloat(k.c as string),
            volume: Number.parseFloat(k.v as string),
          };

          setData((prev) => {
            const state = prev[symbol];
            if (!state) return prev;
            const candles = [...state.candles];
            const lastIdx = candles.length - 1;
            if (lastIdx >= 0 && candles[lastIdx].time === candle.time) {
              candles[lastIdx] = candle;
            } else {
              candles.push(candle);
              if (candles.length > 150) candles.shift();
            }
            const firstCandle = candles[0];
            return {
              ...prev,
              [symbol]: {
                ...state,
                candles,
                currentPrice: candle.close,
                change24h: candle.close - firstCandle.open,
                changePercent:
                  ((candle.close - firstCandle.open) / firstCandle.open) * 100,
                patterns: detectPatterns(
                  candles,
                  INSTRUMENTS.find((i) => i.id === symbol)?.label ?? symbol,
                ),
                isLive: true,
              },
            };
          });
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => ws.close();
    } catch {
      // WebSocket not available
    }
  }, []);

  useEffect(() => {
    connectBinance();
    forexTimerRef.current = setInterval(updateForexTick, 2000);
    return () => {
      wsRef.current?.close();
      if (forexTimerRef.current) clearInterval(forexTimerRef.current);
    };
  }, [connectBinance, updateForexTick]);

  const activeInstrument = INSTRUMENTS.find((i) => i.id === activeId)!;
  const activeState = data[activeId];

  return {
    data,
    activeId,
    setActiveId,
    activeInstrument,
    activeState,
    instruments: INSTRUMENTS,
  };
}
