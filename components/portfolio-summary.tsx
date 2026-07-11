import React from "react";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  futuresBalance: string;
  todayProfit: string;
  todayProfitPercent: string;
  totalMargin: string;
  maintenanceMargin: string;
  riskRewardRatio: string;
  isProfit: boolean;
}

export function PortfolioSummary({
  futuresBalance,
  todayProfit,
  todayProfitPercent,
  totalMargin,
  maintenanceMargin,
  riskRewardRatio,
  isProfit,
}: PortfolioSummaryProps) {
  return (
    <View className="bg-card-bg rounded-xl p-4 border border-border">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-foreground">Futures Portfolio</Text>
        <View className="bg-primary/10 rounded-lg px-2 py-1">
          <Text className="text-[10px] text-primary font-semibold">Futures</Text>
        </View>
      </View>

      {/* Balance row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs text-muted">Futures Balance</Text>
        <Text className="text-base font-bold text-foreground">${futuresBalance}</Text>
      </View>

      {/* Profit row */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs text-muted">Today&apos;s P&L</Text>
        <View className="flex-row items-center gap-2">
          <Text
            className={cn(
              "text-sm font-bold",
              isProfit ? "text-success" : "text-error"
            )}
          >
            {isProfit ? "+" : ""}{todayProfit}
          </Text>
          <Text
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full",
              isProfit ? "bg-success/20 text-success" : "bg-error/20 text-error"
            )}
          >
            {todayProfitPercent}
          </Text>
        </View>
      </View>

      {/* Risk management row */}
      <View className="bg-surface-secondary rounded-lg p-3 mt-2">
        <Text className="text-[10px] text-muted mb-2 font-semibold">Risk Management</Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-[10px] text-muted">Initial Margin</Text>
            <Text className="text-xs font-bold text-foreground">{totalMargin}</Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] text-muted">Maint. Margin</Text>
            <Text className="text-xs font-bold text-foreground">{maintenanceMargin}</Text>
          </View>
          <View className="items-center">
            <Text className="text-[10px] text-muted">R:R Ratio</Text>
            <Text className="text-xs font-bold text-accent-blue">{riskRewardRatio}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
