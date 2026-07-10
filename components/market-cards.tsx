import React from "react";
import { View, Text, ScrollView } from "react-native";

interface MarketCard {
  id: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isUp: boolean;
  icon: string;
}

const markets: MarketCard[] = [
  { id: "oil", name: "Crude Oil", price: "$73.42", change: "+0.85", changePercent: "+1.17%", isUp: true, icon: "🛢️" },
  { id: "gold", name: "Gold", price: "$2,341", change: "+12.50", changePercent: "+0.54%", isUp: true, icon: "🥇" },
  { id: "silver", name: "Silver", price: "$27.83", change: "-0.21", changePercent: "-0.75%", isUp: false, icon: "🥈" },
  { id: "sp500", name: "S&P 500", price: "5,234", change: "+28.40", changePercent: "+0.55%", isUp: true, icon: "📈" },
  { id: "nasdaq", name: "NASDAQ", price: "16,428", change: "-42.10", changePercent: "-0.26%", isUp: false, icon: "📉" },
];

export function MarketCards() {
  return (
    <View>
      <Text className="text-sm font-semibold text-foreground mb-2">Markets</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {markets.map((market) => (
          <View
            key={market.id}
            className="bg-card-bg rounded-xl p-3 mr-3 w-28 border border-border"
          >
            <View className="flex-row items-center gap-1.5 mb-2">
              <Text className="text-base">{market.icon}</Text>
              <Text className="text-[10px] text-muted" numberOfLines={1}>{market.name}</Text>
            </View>
            <Text className="text-sm font-bold text-foreground mb-1">{market.price}</Text>
            <Text
              className={`text-[10px] font-semibold ${
                market.isUp ? "text-success" : "text-error"
              }`}
            >
              {market.change} {market.changePercent}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
