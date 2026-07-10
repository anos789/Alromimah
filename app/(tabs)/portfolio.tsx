import React, { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

interface Position {
  id: number;
  pair: string;
  side: "long" | "short";
  size: string;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: string;
  leverage: string;
  margin: string;
  initialMargin: string;
  maintenanceMargin: string;
  riskReward: string;
}

const positions: Position[] = [
  {
    id: 1, pair: "BTC/USDT", side: "long", size: "0.05",
    entryPrice: 66420.50, markPrice: 66842.13, pnl: 21.08,
    pnlPercent: "+3.17%", leverage: "x20", margin: "166.05",
    initialMargin: "166.05", maintenanceMargin: "83.03", riskReward: "1:2.5",
  },
  {
    id: 2, pair: "ETH/USDT", side: "short", size: "2.5",
    entryPrice: 3485.20, markPrice: 3462.10, pnl: 57.75,
    pnlPercent: "+1.66%", leverage: "x10", margin: "870.33",
    initialMargin: "870.33", maintenanceMargin: "435.17", riskReward: "1:3.0",
  },
  {
    id: 3, pair: "SOL/USDT", side: "long", size: "50",
    entryPrice: 142.30, markPrice: 145.80, pnl: 175.00,
    pnlPercent: "+4.91%", leverage: "x15", margin: "474.33",
    initialMargin: "474.33", maintenanceMargin: "237.17", riskReward: "1:2.0",
  },
];

export default function PortfolioScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "long" | "short">("all");

  const totalBalance = 1247.38;
  const totalPnl = 253.83;
  const totalPnlPercent = "+25.48%";
  const totalInitialMargin = 1510.71;
  const totalMaintenanceMargin = 755.36;

  const filteredPositions = positions.filter(
    (p) => selectedFilter === "all" || p.side === selectedFilter
  );

  // Risk management calculation
  const accountEquity = totalBalance + totalPnl;
  const marginRatio = (totalInitialMargin / accountEquity) * 100;

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <Text className="text-xl font-bold text-foreground mb-4">Portfolio</Text>

        {/* Balance card */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <Text className="text-xs text-muted mb-1">Total Balance (USDT)</Text>
          <Text className="text-3xl font-bold text-foreground">${totalBalance.toFixed(2)}</Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-success font-semibold text-sm">+${totalPnl.toFixed(2)}</Text>
            <Text className="bg-success/20 text-success text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {totalPnlPercent}
            </Text>
          </View>

          {/* Account info */}
          <View className="flex-row justify-between mt-3 pt-3 border-t border-border">
            <View className="items-center">
              <Text className="text-[10px] text-muted">Equity</Text>
              <Text className="text-xs font-bold text-foreground">${accountEquity.toFixed(2)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-muted">Margin Ratio</Text>
              <Text className="text-xs font-bold text-warning">{marginRatio.toFixed(1)}%</Text>
            </View>
            <View className="items-center">
              <Text className="text-[10px] text-muted">Available</Text>
              <Text className="text-xs font-bold text-success">${(accountEquity - totalInitialMargin).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Risk Management */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">🛡️</Text>
            <Text className="text-sm font-semibold text-foreground">Risk Management</Text>
          </View>

          {/* Risk formulas */}
          <View className="bg-surface-secondary rounded-lg p-3 mb-3">
            <Text className="text-[10px] text-muted mb-1">Initial Margin Formula</Text>
            <Text className="text-xs text-foreground font-mono mb-1">
              IM = (Position Size × Entry Price) / Leverage
            </Text>
            <Text className="text-[10px] text-muted mb-1">Maintenance Margin Formula</Text>
            <Text className="text-xs text-foreground font-mono mb-1">
              MM = Initial Margin × 50%
            </Text>
            <Text className="text-[10px] text-muted mb-1">Risk-to-Reward Formula</Text>
            <Text className="text-xs text-foreground font-mono">
              R:R = |Entry - Stop Loss| : |Entry - Take Profit|
            </Text>
          </View>

          {/* Risk bars */}
          <View className="space-y-2">
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-[10px] text-muted">Initial Margin Used</Text>
                <Text className="text-[10px] text-warning">${totalInitialMargin.toFixed(2)}</Text>
              </View>
              <View className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(marginRatio, 100)}%`, backgroundColor: marginRatio > 80 ? "#ef4444" : marginRatio > 50 ? "#f59e0b" : "#22c55e" }}
                />
              </View>
            </View>
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-[10px] text-muted">Maintenance Margin</Text>
                <Text className="text-[10px] text-error">${totalMaintenanceMargin.toFixed(2)}</Text>
              </View>
              <View className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${(totalMaintenanceMargin / accountEquity) * 100}%`, backgroundColor: "#ef4444" }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Positions filter */}
        <View className="flex-row gap-2 mb-3">
          {(["all", "long", "short"] as const).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filter);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: selectedFilter === filter ? "#2563eb" : "#1e293b",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text className="text-xs font-semibold text-foreground capitalize">{filter}</Text>
            </Pressable>
          ))}
        </View>

        {/* Positions list */}
        {filteredPositions.map((pos) => (
          <View key={pos.id} className="bg-card-bg rounded-xl p-3 border border-border mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className={`w-8 h-8 rounded-lg ${pos.side === "long" ? "bg-success/20" : "bg-error/20"} items-center justify-center`}>
                  <Text className="text-sm">{pos.side === "long" ? "📈" : "📉"}</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-foreground">{pos.pair}</Text>
                  <Text className="text-[10px] text-muted">Size: {pos.size}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className={cn(
                  "text-sm font-bold",
                  pos.pnl >= 0 ? "text-success" : "text-error"
                )}>
                  {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
                </Text>
                <Text className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full",
                  pos.pnl >= 0 ? "bg-success/20 text-success" : "bg-error/20 text-error"
                )}>
                  {pos.pnlPercent}
                </Text>
              </View>
            </View>

            {/* Position details */}
            <View className="bg-surface-secondary rounded-lg p-2">
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Lev</Text>
                  <Text className="text-[10px] font-bold text-foreground">{pos.leverage}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Entry</Text>
                  <Text className="text-[10px] font-bold text-foreground">${pos.entryPrice.toLocaleString()}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">Mark</Text>
                  <Text className="text-[10px] font-bold text-foreground">${pos.markPrice.toLocaleString()}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">IM</Text>
                  <Text className="text-[10px] font-bold text-warning">${pos.initialMargin}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">MM</Text>
                  <Text className="text-[10px] font-bold text-error">${pos.maintenanceMargin}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[9px] text-muted">R:R</Text>
                  <Text className="text-[10px] font-bold text-accent-blue">{pos.riskReward}</Text>
                </View>
              </View>
            </View>

            {/* Close button */}
            <Pressable
              style={({ pressed }) => [
                {
                  marginTop: 8,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: pressed ? "#7f1d1d" : "#991b1b",
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            >
              <Text className="text-[10px] text-white font-semibold">Close Position</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
