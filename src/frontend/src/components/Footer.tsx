import { TrendingUp } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  const footerLinks = {
    Analysis: [
      "Chart Patterns",
      "Technical Indicators",
      "Pattern Screener",
      "1-Min Signals",
    ],
    Markets: ["Forex Pairs", "Cryptocurrencies", "Commodities", "Indices"],
    Platform: ["Documentation", "API Access", "Support", "Legal"],
  };

  return (
    <footer
      className="border-t border-border mt-4"
      style={{ background: "oklch(0.15 0.04 250)" }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-primary">
                <TrendingUp className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold tracking-widest">QUOTEX</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Professional-grade chart pattern analysis for the modern trader.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-foreground mb-2">
                {category}
              </h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-muted-foreground text-center md:text-left max-w-xl">
            &#9888;&#65039; Risk Disclaimer: Trading involves substantial risk.
            Chart patterns do not guarantee future results. Past performance is
            not indicative of future returns. Trade responsibly.
          </p>
          <p className="text-[11px] text-muted-foreground shrink-0">
            &copy; {year}. Built with &#10084;&#65039; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
