import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp } from "lucide-react";

interface Props {
  activePage: string;
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = ["Dashboard", "Analysis", "Market", "Strategies", "Tools"];

export function Header({ activePage, onPageChange }: Props) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border"
      style={{
        background: "oklch(0.15 0.04 250 / 0.97)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold tracking-widest text-foreground">
          QUOTEX
        </span>
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1" data-ocid="main.link">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            data-ocid={`nav.${item.toLowerCase()}.link`}
            onClick={() => onPageChange(item)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activePage === item
                ? "text-primary-foreground bg-primary/20 border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Utilities */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="header.bell.button"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7 border border-primary/40">
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-semibold">
              TR
            </AvatarFallback>
          </Avatar>
          <Badge
            variant="outline"
            className="text-[10px] border-success/40 text-success bg-success/10 hidden sm:flex"
          >
            LIVE
          </Badge>
        </div>
      </div>
    </header>
  );
}
