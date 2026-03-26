# Quotex Chart Pattern Analyzer

## Current State
New project. No existing application.

## Requested Changes (Diff)

### Add
- Live price ticker for major forex/crypto pairs via Binance public WebSocket API (no key required)
- Candlestick chart with 1-minute OHLCV data using lightweight-charts library
- Real-time chart pattern detection engine: Head & Shoulders, Double Top/Bottom, Ascending/Descending/Symmetrical Triangles, Bull/Bear Flags, Pennants
- Pattern confidence scoring (0-100%) based on pattern geometry quality
- Buy/Sell signal overlays on chart with confidence badges
- Technical indicators: Volume histogram, RSI, MACD panels below main chart
- Analysis Insights sidebar listing all detected patterns with status chips
- Instrument selector (EUR/USD, GBP/USD, BTC/USDT, ETH/USDT, XAU/USD, etc.)
- Timeframe selector defaulting to 1-minute
- Market news feed (static curated content)
- Trading signals log (recent pattern-based signals)
- Footer with disclaimer text

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store user-favorite instruments and signal history in Motoko canister
2. Backend: HTTP outcalls to fetch historical 1-min OHLCV candle data from Binance REST API
3. Frontend: Dark fintech dashboard layout matching design preview
4. Frontend: Integrate lightweight-charts for candlestick rendering
5. Frontend: WebSocket connection to Binance for live price streaming
6. Frontend: Pattern detection algorithms running client-side on candle data
7. Frontend: Indicator calculations (RSI, MACD, Volume)
8. Frontend: Analysis Insights panel, Price Ticker, Signals Log
9. Frontend: Instrument and timeframe selectors
