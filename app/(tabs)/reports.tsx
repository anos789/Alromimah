import React, { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

interface PerformanceData {
  day: string;
  pnl: number;
  trades: number;
  winRate: string;
}

const weeklyData: PerformanceData[] = [
  { day: "Mon", pnl: 12.50, trades: 5, winRate: "60%" },
  { day: "Tue", pnl: -3.20, trades: 3, winRate: "33%" },
  { day: "Wed", pnl: 28.70, trades: 7, winRate: "71%" },
  { day: "Thu", pnl: 15.40, trades: 4, winRate: "75%" },
  { day: "Fri", pnl: 42.10, trades: 8, winRate: "62%" },
  { day: "Sat", pnl: 8.90, trades: 2, winRate: "100%" },
  { day: "Sun", pnl: 22.30, trades: 6, winRate: "67%" },
];

interface RewardRecord {
  id: number;
  time: string;
  amount: string;
  type: string;
}

const rewards: RewardRecord[] = [
  { id: 1, time: "Today 14:30", amount: "+$2.50", type: "Trade Reward" },
  { id: 2, time: "Today 12:00", amount: "+$1.80", type: "Streak Bonus" },
  { id: 3, time: "Yesterday 18:00", amount: "+$3.20", type: "Volume Reward" },
  { id: 4, time: "Yesterday 10:00", amount: "+$1.50", type: "Daily Reward" },
  { id: 5, time: "2 days ago", amount: "+$2.00", type: "Trade Reward" },
];

export default function ReportsScreen() {
  const colors = useColors();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");

  const totalPnl = weeklyData.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = weeklyData.reduce((s, d) => s + d.trades, 0);
  const avgWinRate = Math.round(weeklyData.reduce((s, d) => s + parseFloat(d.winRate), 0) / weeklyData.length);
  const bestDay = weeklyData.reduce((a, b) => a.pnl > b.pnl ? a : b);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <Text className="text-xl font-bold text-foreground mb-4">Reports</Text>

        {/* Period selector */}
        <View className="flex-row gap-2 mb-4">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeriod(p);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: period === p ? "#2563eb" : "#1e293b",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text className="text-xs font-semibold text-foreground capitalize">{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Summary stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-card-bg rounded-xl p-3 border border-border items-center">
            <Text className="text-[10px] text-muted">Total P&L</Text>
            <Text className={cn("text-lg font-bold", totalPnl >= 0 ? "text-success" : "text-error")}>
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-card-bg rounded-xl p-3 border border-border items-center">
            <Text className="text-[10px] text-muted">Trades</Text>
            <Text className="text-lg font-bold text-foreground">{totalTrades}</Text>
          </View>
          <View className="flex-1 bg-card-bg rounded-xl p-3 border border-border items-center">
            <Text className="text-[10px] text-muted">Win Rate</Text>
            <Text className="text-lg font-bold text-success">{avgWinRate}%</Text>
          </View>
        </View>

        {/* Best day */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">Best Day</Text>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold text-success">${bestDay.pnl.toFixed(2)}</Text>
              <Text className="text-[10px] text-muted">{bestDay.day} · {bestDay.winRate} win rate</Text>
            </View>
            <Text className="text-2xl">🏆</Text>
          </View>
        </View>

        {/* Weekly chart */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Weekly Performance</Text>
          <View className="h-36 items-center justify-end">
            <View className="flex-row items-end justify-between w-full h-full px-2">
              {weeklyData.map((d) => (
                <View key={d.day} className="items-center flex-1">
                  <Text className="text-[9px] text-muted mb-1">{d.pnl >= 0 ? "+" : ""}${d.pnl}</Text>
                  <View
                    className={`w-6 rounded-t-sm ${d.pnl >= 0 ? "bg-success" : "bg-error"}`}
                    style={{ height: Math.min(Math.abs(d.pnl) * 2, 80) as number | undefined }}
                  />
                  <Text className="text-[10px] text-muted mt-1">{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Rewards history */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-foreground">Rewards History</Text>
            <Text className="text-[10px] text-accent-blue">Total Earned: $11.00</Text>
          </View>
          {rewards.map((reward, i) => (
            <View key={reward.id} className={cn(i < rewards.length - 1 && "border-b border-border pb-3 mb-3")}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-warning/20 items-center justify-center">
                    <Text className="text-sm">🎁</Text>
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-foreground">{reward.type}</Text>
                    <Text className="text-[10px] text-muted">{reward.time}</Text>
                  </View>
                </View>
                <Text className="text-sm font-bold text-success">{reward.amount}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Risk report */}
        <View className="bg-card-bg rounded-xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-3">Risk Report</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Total Drawdown</Text>
              <Text className="text-xs font-bold text-error">-$50.00</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Max Drawdown</Text>
              <Text className="text-xs font-bold text-error">-$50.00</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Sharpe Ratio</Text>
              <Text className="text-xs font-bold text-accent-blue">1.45</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Risk Level</Text>
              <View className="bg-warning/20 rounded-lg px-2 py-0.5">
                <Text className="text-xs font-bold text-warning">Medium</Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Liquidation Risk</Text>
              <View className="bg-success/20 rounded-lg px-2 py-0.5">
                <Text className="text-xs font-bold text-success">Low</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
