import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";

interface NewsItem {
  id: number;
  title: string;
  impact: "bullish" | "bearish" | "neutral";
  time: string;
  source: string;
}

const sampleNews: NewsItem[] = [
  { id: 1, title: "BTC breaks resistance at $67,500", impact: "bullish", time: "2m ago", source: "MEXC" },
  { id: 2, title: "Fed signals rate cut in September", impact: "bullish", time: "15m ago", source: "Reuters" },
  { id: 3, title: "ETH network upgrade scheduled", impact: "neutral", time: "1h ago", source: "CoinDesk" },
  { id: 4, title: "Oil prices surge on supply concerns", impact: "neutral", time: "2h ago", source: "Bloomberg" },
  { id: 5, title: "MEXC lists new perp contracts", impact: "bullish", time: "3h ago", source: "MEXC" },
  { id: 6, title: "Asian markets open mixed", impact: "bearish", time: "4h ago", source: "CNBC" },
];

export function NewsTicker() {
  const [visibleNews, setVisibleNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomItems = sampleNews
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setVisibleNews(randomItems);
    }, 8000);

    setVisibleNews(sampleNews.slice(0, 3));
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="bg-card-bg rounded-xl p-3 border border-border">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-2 h-2 rounded-full bg-error" />
        <Text className="text-xs font-semibold text-error">LIVE NEWS</Text>
        <Text className="text-[10px] text-muted">Trading Radar</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {visibleNews.map((news) => (
          <View
            key={news.id}
            className="flex-row items-center gap-2 mr-4 bg-surface-secondary rounded-lg px-3 py-2"
          >
            <View
              className={`w-2 h-2 rounded-full ${
                news.impact === "bullish"
                  ? "bg-success"
                  : news.impact === "bearish"
                  ? "bg-error"
                  : "bg-warning"
              }`}
            />
            <Text className="text-[10px] text-foreground font-medium max-w-40" numberOfLines={1}>
              {news.title}
            </Text>
            <Text className="text-[9px] text-muted">{news.time}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
