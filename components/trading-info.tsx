import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface TradingInfoProps {
  totalInvestment: string;
  perTradeAmount: string;
  leverage: string;
  onChangeInvestment: (val: string) => void;
  onChangePerTrade: (val: string) => void;
  onChangeLeverage: (val: string) => void;
}

export function TradingInfo({
  totalInvestment,
  perTradeAmount,
  leverage,
  onChangeInvestment,
  onChangePerTrade,
  onChangeLeverage,
}: TradingInfoProps) {
  const colors = useColors();

  const fields = [
    { label: "Total Investment", sublabel: "USDT", value: totalInvestment, onChange: onChangeInvestment, prefix: "$" },
    { label: "Amount Per Trade", sublabel: "Positive & Negative", value: perTradeAmount, onChange: onChangePerTrade, prefix: "±" },
    { label: "Leverage", sublabel: "x5 ~ x125", value: leverage, onChange: onChangeLeverage, prefix: "x" },
  ];

  return (
    <View className="bg-card-bg rounded-xl p-4 border border-border">
      <Text className="text-sm font-semibold text-foreground mb-3">Trading Parameters</Text>
      {fields.map((field, i) => (
        <View key={field.label} className={cn(i < fields.length - 1 && "mb-3")}>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted">{field.label}</Text>
            <Text className="text-[10px] text-accent-blue">{field.sublabel}</Text>
          </View>
          <View className="flex-row items-center gap-2 mt-1">
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="numeric"
              returnKeyType="done"
              className="flex-1 text-base font-bold text-foreground bg-surface-secondary rounded-lg px-3 py-2"
            />
            <Text className="text-sm text-accent-blue font-medium">{field.prefix}</Text>
          </View>
        </View>
      ))}
      {/* Authorized IP display */}
      <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-border">
        <View className="w-6 h-6 rounded-full bg-success/20 items-center justify-center">
          <Text className="text-xs">🔐</Text>
        </View>
        <Text className="text-[10px] text-muted">Authorized IP:</Text>
        <Text className="text-[10px] text-foreground font-mono">185.176.43.22</Text>
      </View>
    </View>
  );
}
