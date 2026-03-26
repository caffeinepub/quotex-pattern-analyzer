import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Pattern } from "../utils/patternDetection";

interface Props {
  patterns: Pattern[];
  pair: string;
}

const STATUS_STYLES: Record<string, string> = {
  Confirmed: "bg-success/15 text-success border-success/30",
  Active: "bg-primary/15 text-primary border-primary/30",
  Forming: "bg-warning/15 text-warning border-warning/30",
};

export function AnalysisInsights({ patterns, pair }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Analysis Insights
        </h3>
        <span className="text-[10px] text-muted-foreground">{pair}</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2" data-ocid="insights.list">
          {patterns.length === 0 ? (
            <div className="text-center py-8" data-ocid="insights.empty_state">
              <p className="text-xs text-muted-foreground">
                Scanning for patterns…
              </p>
            </div>
          ) : (
            patterns.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                data-ocid={`insights.item.${i + 1}`}
                className={`p-3 rounded-lg border ${
                  p.direction === "BUY"
                    ? "border-success/20 bg-success/5"
                    : "border-destructive/20 bg-destructive/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {pair}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 h-4 font-medium ${
                        p.direction === "BUY"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-destructive/15 text-destructive border-destructive/30"
                      }`}
                    >
                      {p.direction}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 h-4 ${STATUS_STYLES[p.status] ?? ""}`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Confidence
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.direction === "BUY"
                            ? "bg-success"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${p.confidence}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        p.direction === "BUY"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {p.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
