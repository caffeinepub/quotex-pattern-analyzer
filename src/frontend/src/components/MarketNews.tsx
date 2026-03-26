import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ExternalLink } from "lucide-react";

const NEWS = [
  {
    id: 1,
    headline:
      "Federal Reserve signals potential rate cuts amid cooling inflation data",
    time: "2m ago",
    tag: "USD",
    sentiment: "bearish" as const,
    source: "Reuters",
  },
  {
    id: 2,
    headline:
      "Bitcoin surges past key resistance as ETF inflows hit monthly record",
    time: "8m ago",
    tag: "BTC",
    sentiment: "bullish" as const,
    source: "CoinDesk",
  },
  {
    id: 3,
    headline:
      "ECB holds rates steady, Lagarde emphasizes data-dependency for June decision",
    time: "15m ago",
    tag: "EUR",
    sentiment: "neutral" as const,
    source: "Bloomberg",
  },
  {
    id: 4,
    headline:
      "Gold prices near all-time highs as geopolitical tensions boost safe-haven demand",
    time: "22m ago",
    tag: "XAU",
    sentiment: "bullish" as const,
    source: "MarketWatch",
  },
  {
    id: 5,
    headline: "UK inflation falls to 2.3%, GBP sees sharp intraday volatility",
    time: "31m ago",
    tag: "GBP",
    sentiment: "bearish" as const,
    source: "FT",
  },
  {
    id: 6,
    headline:
      "Ethereum Layer-2 adoption accelerates, ETH on-chain activity at 2024 peak",
    time: "45m ago",
    tag: "ETH",
    sentiment: "bullish" as const,
    source: "Decrypt",
  },
];

const SENTIMENT_STYLES = {
  bullish: "bg-success/15 text-success border-success/30",
  bearish: "bg-destructive/15 text-destructive border-destructive/30",
  neutral: "bg-muted/30 text-muted-foreground border-border",
};

export function MarketNews() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Market News
        </h3>
        <span className="text-[10px] text-muted-foreground">
          Real-time feed
        </span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2" data-ocid="news.list">
          {NEWS.map((item, i) => (
            <div
              key={item.id}
              data-ocid={`news.item.${i + 1}`}
              className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/10 transition-colors cursor-pointer group"
            >
              <Badge
                variant="outline"
                className={`text-[9px] mt-0.5 px-1.5 py-0 h-4 shrink-0 font-medium ${SENTIMENT_STYLES[item.sentiment]}`}
              >
                {item.tag}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                  {item.headline}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {item.time}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.source}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
