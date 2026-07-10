import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, Image, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { CandlestickChart, generateSampleCandles } from "@/components/candlestick-chart";
import { ModeToggle } from "@/components/mode-toggle";
import { BotStatusToggle } from "@/components/bot-status-toggle";
import { ApiKeyInput } from "@/components/api-key-input";
import { NewsTicker } from "@/components/news-ticker";
import { MarketCards } from "@/components/market-cards";
import { TradingInfo } from "@/components/trading-info";
import { PortfolioSummary } from "@/components/portfolio-summary";
import { RewardsHarvester } from "@/components/rewards-harvester";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();

  // Bot state
  const [botOn, setBotOn] = useState(true);
  const [mode, setMode] = useState<"cloud" | "manual">("cloud");
  const [isConnected, setIsConnected] = useState(true);

  // Trading params
  const [totalInvestment, setTotalInvestment] = useState("200");
  const [perTrade, setPerTrade] = useState("50");
  const [leverage, setLeverage] = useState("20");

  // API keys
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  // Chart data
  const [candles, setCandles] = useState(generateSampleCandles(24));
  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 66842.13;

  // Price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 50;
        const newClose = last.close + change;
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          close: newClose,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
        };
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const priceChange24h = 1.78;
  const todayProfit = "+$34.52";
  const todayProfitPercent = "+2.43%";

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header with avatar and bot toggle */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-surface-secondary items-center justify-center overflow-hidden">
              <Text className="text-2xl">👤</Text>
            </View>
            <View>
              <Text className="text-base font-bold text-foreground">Mrium MEXC</Text>
              <Text className="text-[10px] text-muted">Trading Bot</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${botOn ? "bg-success" : "bg-error"}`} />
            <Text className="text-[10px] text-muted">{botOn ? "ACTIVE" : "STOPPED"}</Text>
            <BotStatusToggle isOn={botOn} onToggle={setBotOn} />
          </View>
        </View>

        {/* Connection status */}
        <View className={cn(
          "flex-row items-center gap-2 mb-4 px-3 py-2 rounded-lg",
          isConnected ? "bg-success/10" : "bg-error/10"
        )}>
          <Text className={cn("text-xs font-semibold", isConnected ? "text-success" : "text-error")}>
            {isConnected ? "● Connected to MEXC" : "● Disconnected"}
          </Text>
          <Text className="text-[10px] text-muted">|</Text>
          <Text className="text-[10px] text-muted">185.176.43.22</Text>
        </View>

        {/* API Key inputs */}
        <ApiKeyInput
          label="MEXC API Key"
          value={apiKey}
          onChange={setApiKey}
          connected={isConnected}
          placeholder="Enter your API key..."
        />
        <ApiKeyInput
          label="MEXC Secret Key"
          value={apiSecret}
          onChange={setApiSecret}
          connected={isConnected}
          placeholder="Enter your secret key..."
        />

        {/* Mode toggle */}
        <View className="mt-4">
          <ModeToggle mode={mode} onToggle={setMode} />
        </View>

        {/* BTC/USDT Price */}
        <View className="bg-card-bg rounded-xl p-4 mt-4 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">₿</Text>
              <Text className="text-base font-bold text-foreground">BTC/USDT</Text>
            </View>
            <View className="bg-success/10 rounded-lg px-2 py-0.5">
              <Text className="text-[10px] text-success font-semibold">PERP</Text>
            </View>
          </View>
          <Text className="text-3xl font-bold text-foreground mt-2">
            ${currentPrice.toFixed(2)}
          </Text>
          <View className="flex-row items-center gap-2 mt-1">
            <Text className="text-success font-semibold">+${priceChange24h.toFixed(2)}</Text>
            <Text className="text-success text-xs">+{priceChange24h}%</Text>
            <Text className="text-[10px] text-muted">24h</Text>
          </View>
        </View>

        {/* Timeframe buttons */}
        <View className="flex-row gap-2 mt-3">
          {["1m", "15m", "1h", "4h", "1d"].map((tf) => (
            <Pressable
              key={tf}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: pressed ? "#2563eb" : "#1e293b",
                  opacity: pressed ? 1 : 0.8,
                },
              ]}
            >
              <Text className="text-xs font-medium text-foreground">{tf}</Text>
            </Pressable>
          ))}
        </View>

        {/* Candlestick Chart */}
        <View className="mt-3">
          <CandlestickChart
            candles={candles}
            currentPrice={currentPrice}
            className="h-52"
          />
        </View>

        {/* News Ticker */}
        <View className="mt-4">
          <NewsTicker />
        </View>

        {/* Market Cards */}
        <View className="mt-4">
          <MarketCards />
        </View>

        {/* Trading Info */}
        <View className="mt-4">
          <TradingInfo
            totalInvestment={totalInvestment}
            perTradeAmount={perTrade}
            leverage={leverage}
            onChangeInvestment={setTotalInvestment}
            onChangePerTrade={setPerTrade}
            onChangeLeverage={setLeverage}
          />
        </View>

        {/* Portfolio Summary */}
        <View className="mt-4">
          <PortfolioSummary
            futuresBalance="1,247.38"
            todayProfit={todayProfit}
            todayProfitPercent={todayProfitPercent}
            totalMargin="250.00"
            maintenanceMargin="125.00"
            riskRewardRatio="1:2.5"
            isProfit={true}
          />
        </View>

        {/* Rewards Harvester */}
        <View className="mt-4">
          <RewardsHarvester />
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mt-4">
          <Pressable
            style={({ pressed }) => [
              {
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: pressed ? "#16a34a" : "#22c55e",
              },
            ]}
            onPress={() => Alert.alert("Trade Executed", "Long position opened on BTC/USDT")}
          >
            <Text className="text-background font-bold text-sm">📈 Open Long</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                flex: 1,
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: pressed ? "#dc2626" : "#ef4444",
              },
            ]}
            onPress={() => Alert.alert("Trade Executed", "Short position opened on BTC/USDT")}
          >
            <Text className="text-background font-bold text-sm">📉 Open Short</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
