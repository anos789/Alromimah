import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { cn } from "@/lib/utils";

interface Trade {
  id: number;
  pair: string;
  side: "long" | "short";
  type: "open" | "closed";
  entryPrice: number;
  exitPrice?: number;
  size: string;
  leverage: string;
  pnl: number;
  pnlPercent: string;
  time: string;
  status: "profit" | "loss" | "active";
}

const trades: Trade[] = [
  { id: 1, pair: "BTC/USDT", side: "long", type: "open", entryPrice: 66420.50, size: "0.05", leverage: "x20", pnl: 21.08, pnlPercent: "+3.17%", time: "2h ago", status: "active" },
  { id: 2, pair: "ETH/USDT", side: "short", type: "open", entryPrice: 3485.20, size: "2.5", leverage: "x10", pnl: 57.75, pnlPercent: "+1.66%", time: "5h ago", status: "active" },
  { id: 3, pair: "SOL/USDT", side: "long", type: "open", entryPrice: 142.30, size: "50", leverage: "x15", pnl: 175.00, pnlPercent: "+4.91%", time: "8h ago", status: "active" },
  { id: 4, pair: "BTC/USDT", side: "long", type: "closed", entryPrice: 65800, exitPrice: 66200, size: "0.1", leverage: "x20", pnl: 40.00, pnlPercent: "+1.22%", time: "Yesterday", status: "profit" },
  { id: 5, pair: "ETH/USDT", side: "short", type: "closed", entryPrice: 3520, exitPrice: 3490, size: "3.0", leverage: "x10", pnl: 90.00, pnlPercent: "+0.85%", time: "Yesterday", status: "profit" },
  { id: 6, pair: "BNB/USDT", side: "long", type: "closed", entryPrice: 580, exitPrice: 575, size: "10", leverage: "x5", pnl: -50.00, pnlPercent: "-0.86%", time: "2 days ago", status: "loss" },
];

export default function TradesScreen() {
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");

  const filteredTrades = trades.filter((t) => t.type === activeTab);

  const totalOpenPnl = trades.filter((t) => t.type === "open").reduce((sum, t) => sum + t.pnl, 0);
  const totalClosedPnl = trades.filter((t) => t.type === "closed").reduce((sum, t) => sum + t.pnl, 0);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <Text className="text-xl font-bold text-foreground mb-4">Trades</Text>

        {/* Stats summary */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-card-bg rounded-xl p-3 border border-border">
            <Text className="text-[10px] text-muted">Open P&L</Text>
            <Text className={cn("text-lg font-bold", totalOpenPnl >= 0 ? "text-success" : "text-error")}>
              {totalOpenPnl >= 0 ? "+" : ""}${totalOpenPnl.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-card-bg rounded-xl p-3 border border-border">
            <Text className="text-[10px] text-muted">Closed P&L</Text>
            <Text className={cn("text-lg font-bold", totalClosedPnl >= 0 ? "text-success" : "text-error")}>
              {totalClosedPnl >= 0 ? "+" : ""}${totalClosedPnl.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("open");
            }}
            style={({ pressed }) => [
              {
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: activeTab === "open" ? "#2563eb" : "#1e293b",
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text className="text-sm font-semibold text-foreground">
              Open ({trades.filter((t) => t.type === "open").length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("closed");
            }}
            style={({ pressed }) => [
              {
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: activeTab === "closed" ? "#2563eb" : "#1e293b",
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text className="text-sm font-semibold text-foreground">
              History ({trades.filter((t) => t.type === "closed").length})
            </Text>
          </Pressable>
        </View>

        {/* Trade list */}
        {filteredTrades.map((trade) => (
          <View key={trade.id} className="bg-card-bg rounded-xl p-3 border border-border mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-lg ${trade.side === "long" ? "bg-success/20" : "bg-error/20"} items-center justify-center`}>
                  <Text className="text-sm">{trade.side === "long" ? "📈" : "📉"}</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-foreground">{trade.pair}</Text>
                  <Text className="text-[10px] text-muted">{trade.time}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={cn(
                  "text-sm font-bold",
                  trade.pnl >= 0 ? "text-success" : "text-error"
                )}>
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </Text>
                <Text className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  trade.pnl >= 0 ? "bg-success/20 text-success" : "bg-error/20 text-error"
                )}>
                  {trade.pnlPercent}
                </Text>
              </View>
            </View>

            {/* Trade details */}
            <View className="bg-surface-secondary rounded-lg p-2">
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Side</Text>
                  <Text className="text-[10px] font-bold text-foreground capitalize">{trade.side}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Entry</Text>
                  <Text className="text-[10px] font-bold text-foreground">${trade.entryPrice.toLocaleString()}</Text>
                </View>
                {trade.exitPrice && (
                  <View className="items-center">
                    <Text className="text-[9px] text-muted">Exit</Text>
                    <Text className="text-[10px] font-bold text-foreground">${trade.exitPrice.toLocaleString()}</Text>
                  </View>
                )}
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Size</Text>
                  <Text className="text-[10px] font-bold text-foreground">{trade.size}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Lev</Text>
                  <Text className="text-[10px] font-bold text-warning">{trade.leverage}</Text>
                </View>
              </View>
            </View>

            {/* Status badge */}
            <View className="flex-row items-center gap-2 mt-2">
              <View className={`w-2 h-2 rounded-full ${
                trade.status === "profit" ? "bg-success" :
                trade.status === "loss" ? "bg-error" : "bg-warning"
              }`} />
              <Text className="text-[10px] text-muted capitalize">{trade.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
