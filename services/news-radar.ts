/**
 * Trading News Radar Service
 * Monitors real-time trading news and market signals
 * Provides impact analysis for automated trading decisions
 */

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  impact: "bullish" | "bearish" | "neutral";
  asset: string;
  confidence: number; // 0-1
}

export interface MarketSignal {
  asset: string;
  signal: "buy" | "sell" | "hold";
  strength: number; // 0-1
  reason: string;
  timestamp: Date;
}

export class NewsRadarService {
  private newsQueue: NewsItem[] = [];
  private signals: MarketSignal[] = [];

  /**
   * Analyze news sentiment
   */
  analyzeSentiment(title: string): { impact: "bullish" | "bearish" | "neutral"; confidence: number } {
    const bullishKeywords = ["breaks resistance", "surges", "bullish", "uptrend", "all-time high", "rate cut", "fed signals", "upgrade", "new high"];
    const bearishKeywords = ["breaks support", "drops", "bearish", "downtrend", "crash", "rate hike", "crisis", "warning", "warning"];

    const lowerTitle = title.toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;

    for (const keyword of bullishKeywords) {
      if (lowerTitle.includes(keyword)) bullishScore++;
    }
    for (const keyword of bearishKeywords) {
      if (lowerTitle.includes(keyword)) bearishScore++;
    }

    const total = bullishScore + bearishScore;
    const confidence = Math.min(total / 3, 1);

    return {
      impact: bullishScore > bearishScore ? "bullish" : bearishScore > bullishScore ? "bearish" : "neutral",
      confidence,
    };
  }

  /**
   * Generate trading signal from news
   */
  generateSignal(news: NewsItem): MarketSignal {
    if (news.impact === "bullish" && news.confidence > 0.5) {
      return {
        asset: news.asset,
        signal: "buy",
        strength: news.confidence,
        reason: `Bullish news: ${news.title}`,
        timestamp: new Date(),
      };
    } else if (news.impact === "bearish" && news.confidence > 0.5) {
      return {
        asset: news.asset,
        signal: "sell",
        strength: news.confidence,
        reason: `Bearish news: ${news.title}`,
        timestamp: new Date(),
      };
    }
    return {
      asset: news.asset,
      signal: "hold",
      strength: 0,
      reason: "Insufficient signal from news",
      timestamp: new Date(),
    };
  }

  /**
   * Get combined signals for an asset
   */
  getAssetSignals(asset: string): MarketSignal[] {
    return this.signals.filter((s) => s.asset === asset);
  }

  /**
   * Get the latest aggregated signal
   */
  getAggregatedSignal(asset: string): { signal: "buy" | "sell" | "hold"; strength: number } {
    const signals = this.getAssetSignals(asset);
    if (signals.length === 0) return { signal: "hold", strength: 0 };

    let buyStrength = 0;
    let sellStrength = 0;

    for (const s of signals) {
      if (s.signal === "buy") buyStrength += s.strength;
      else if (s.signal === "sell") sellStrength += s.strength;
    }

    if (buyStrength > sellStrength) {
      return { signal: "buy", strength: buyStrength / signals.length };
    } else if (sellStrength > buyStrength) {
      return { signal: "sell", strength: sellStrength / signals.length };
    }
    return { signal: "hold", strength: 0 };
  }
}

export const newsRadar = new NewsRadarService();
