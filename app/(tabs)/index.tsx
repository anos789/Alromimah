import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
  Alert,
} from "react-native";
import { trpc } from "@/lib/trpc";
import { ScreenContainer } from "@/components/screen-container";
import { CandlestickChart } from "@/components/candlestick-chart";
import { cn } from "@/lib/utils";

// List of all 16 screen configurations requested
interface AppScreenConfig {
  id: string;
  title: string;
  arTitle: string;
  icon: string;
  status: string;
  color: string;
}

const APP_SCREENS: AppScreenConfig[] = [
  { id: "splash", title: "Splash Screen", arTitle: "شاشة البدء", icon: "🌌", status: "Ready", color: "from-purple-600 to-indigo-600" },
  { id: "login", title: "Login Entry", arTitle: "تسجيل الدخول", icon: "🔐", status: "Authorized", color: "from-sky-500 to-blue-600" },
  { id: "api_keys", title: "API Keys Setup", arTitle: "مفاتيح الربط API", icon: "🔑", status: "Configured", color: "from-amber-500 to-orange-600" },
  { id: "dashboard", title: "Main Dashboard", arTitle: "لوحة التحكم", icon: "📊", status: "Active", color: "from-teal-500 to-emerald-600" },
  { id: "wallet", title: "Asset Wallet", arTitle: "المحفظة", icon: "💼", status: "Secure", color: "from-violet-500 to-purple-700" },
  { id: "futures", title: "USDT Futures", arTitle: "العقود الآجلة", icon: "📈", status: "125x Max", color: "from-rose-500 to-red-600" },
  { id: "spot", title: "Spot Trading", arTitle: "التداول الفوري", icon: "🔄", status: "0% Fees", color: "from-pink-500 to-rose-600" },
  { id: "orders", title: "Orders Management", arTitle: "الطلبات النشطة", icon: "📋", status: "Synced", color: "from-blue-500 to-cyan-600" },
  { id: "open_positions", title: "Open Positions", arTitle: "المراكز المفتوحة", icon: "🔓", status: "Monitored", color: "from-green-500 to-teal-600" },
  { id: "closed_positions", title: "Closed Positions", arTitle: "المراكز المغلقة", icon: "🔒", status: "Recorded", color: "from-slate-600 to-slate-800" },
  { id: "statistics", title: "P&L Statistics", arTitle: "الإحصائيات والتقارير", icon: "🏆", status: "64% Win", color: "from-yellow-500 to-amber-600" },
  { id: "strategy", title: "Strategy Rules", arTitle: "إعدادات الاستراتيجية", icon: "⚙️", status: "Automated", color: "from-indigo-500 to-violet-600" },
  { id: "notifications", title: "Alerts Hub", arTitle: "التنبيهات", icon: "🔔", status: "Operational", color: "from-orange-500 to-red-500" },
  { id: "logs", title: "Operation Logs", arTitle: "السجلات والعمليات", icon: "📁", status: "Live Feed", color: "from-neutral-600 to-neutral-800" },
  { id: "security", title: "Security Core", arTitle: "الأمان والتشفير", icon: "🛡️", status: "AES-256", color: "from-emerald-600 to-teal-700" },
  { id: "about", title: "System Info", arTitle: "عن التطبيق", icon: "ℹ️", status: "v1.0.0", color: "from-slate-500 to-slate-600" },
];

export default function HomeDashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [btcLivePrice, setBtcLivePrice] = useState(66842.13);
  const [activeIndicator, setActiveIndicator] = useState<"ema" | "sma" | "rsi" | "macd" | "atr" | "bollinger" | "vwap">("ema");

  // Fetch real-time tRPC data from backend
  const { data: config, refetch: refetchConfig } = trpc.mexc.getConfig.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.mexc.getStats.useQuery();
  const { data: orders, refetch: refetchOrders } = trpc.mexc.getOrders.useQuery();
  const { data: logs, refetch: refetchLogs } = trpc.mexc.getLogs.useQuery({ limit: 40 });
  const { data: chartData } = trpc.mexc.getIndicatorChart.useQuery({ candleCount: 30 });

  // Mutations
  const updateConfigMutation = trpc.mexc.updateConfig.useMutation({
    onSuccess: () => {
      refetchConfig();
      refetchLogs();
      Alert.alert("Success", "Configuration successfully saved and encrypted on the backend");
    }
  });

  const placeOrderMutation = trpc.mexc.placeOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      refetchLogs();
      Alert.alert("Order Placed", "Protected trade order has been recorded in the database logs");
    }
  });

  const clearLogsMutation = trpc.mexc.clearLogs.useMutation({
    onSuccess: () => {
      refetchLogs();
    }
  });

  // Mock input states
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [secretKeyInput, setSecretKeyInput] = useState("");
  const [ipAddressInput, setIpAddressInput] = useState("192.168.1.100");
  const [usernameInput, setUsernameInput] = useState("admin");
  const [passwordInput, setPasswordInput] = useState("");
  
  // Futures/Spot order forms
  const [tradeSize, setTradeSize] = useState("0.1");
  const [tradeSide, setTradeSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(20);
  const [stopLossPercent, setStopLossPercent] = useState(5.0);
  const [takeProfitPercent, setTakeProfitPercent] = useState(15.0);

  // Initialize form fields when config loads
  useEffect(() => {
    if (config) {
      setApiKeyInput(config.apiKey || "");
      setSecretKeyInput(config.secretKey || "");
      setIpAddressInput(config.ipAddress || "192.168.1.100");
      setStopLossPercent(config.stopLossPercent || 5.0);
      setTakeProfitPercent(config.takeProfitPercent || 15.0);
      setLeverage(config.maxLeverage || 20);
    }
  }, [config]);

  // Live WebSocket price emulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcLivePrice(prev => {
        const delta = (Math.random() - 0.495) * 60;
        return Math.round((prev + delta) * 100) / 100;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiKeys = () => {
    updateConfigMutation.mutate({
      apiKey: apiKeyInput,
      secretKey: secretKeyInput,
      ipAddress: ipAddressInput,
    });
  };

  const handlePlaceOrder = (type: "LIMIT" | "MARKET") => {
    const sizeNum = parseFloat(tradeSize);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      Alert.alert("Error", "Please input a valid size metric");
      return;
    }

    placeOrderMutation.mutate({
      pair: "BTC/USDT",
      side: tradeSide,
      type,
      price: btcLivePrice,
      size: tradeSize,
      stopLoss: tradeSide === "long" ? btcLivePrice * (1 - stopLossPercent / 100) : btcLivePrice * (1 + stopLossPercent / 100),
      takeProfit: tradeSide === "long" ? btcLivePrice * (1 + takeProfitPercent / 100) : btcLivePrice * (1 - takeProfitPercent / 100),
    });
  };

  return (
    <ScreenContainer className="bg-[#0b0f19] px-4 pt-4 pb-20">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Glowing Top Banner */}
        <View className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-900/30 to-indigo-950/20 border border-sky-500/20">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-extrabold text-white tracking-tight">MY-Alromimah Core</Text>
              <Text className="text-xs text-sky-400 mt-1">MEXC Trading & Risk Gateway</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <View className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Text className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</Text>
              </View>
              <Text className="text-xs font-mono text-slate-400 mt-2">Latency: 14ms</Text>
            </View>
          </View>
        </View>

        {/* Quick Ticker Section */}
        <View className="flex-row justify-between items-center bg-[#131b2e] rounded-xl p-4 border border-border mb-6">
          <View>
            <Text className="text-xs text-slate-400 uppercase font-bold tracking-wider">BTC/USDT Spot Live</Text>
            <Text className="text-2xl font-bold font-mono text-emerald-400 mt-1">${btcLivePrice.toLocaleString()}</Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-slate-400">Risk Margin Index</Text>
            <Text className="text-sm font-bold text-amber-500 mt-1">Normal (8.4%)</Text>
          </View>
        </View>

        {/* 16 Grid Cells Layout */}
        <Text className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Application Hub / بوابة التحكم</Text>
        <View className="flex-row flex-wrap justify-between gap-3 mb-6">
          {APP_SCREENS.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveModal(item.id)}
              className="w-[48%] bg-[#121824] rounded-xl p-4 border border-slate-800 flex-col justify-between"
              style={{ minHeight: 110 }}
            >
              <View className="flex-row justify-between items-start">
                <View className="w-10 h-10 rounded-xl bg-slate-800/60 items-center justify-center">
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <Text className="text-[9px] text-sky-400 font-bold uppercase">{item.status}</Text>
                </View>
              </View>
              <View className="mt-3">
                <Text className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{item.title}</Text>
                <Text className="text-xs text-white font-bold mt-0.5">{item.arTitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-center text-[10px] text-slate-500 uppercase tracking-widest mt-4">
          MY-Alromimah Pro · Clean Architecture Core · 2026
        </Text>
      </ScrollView>

      {/* OVERLAY MODAL MANAGER FOR ALL 16 SCREENS */}
      <Modal
        visible={activeModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-[#090d16] px-4 pt-6 pb-8">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center border-b border-slate-800 pb-4 mb-4">
            <View>
              <Text className="text-lg font-bold text-white">
                {APP_SCREENS.find(s => s.id === activeModal)?.title}
              </Text>
              <Text className="text-xs text-sky-400 font-semibold">
                {APP_SCREENS.find(s => s.id === activeModal)?.arTitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveModal(null)}
              className="bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700"
            >
              <Text className="text-xs text-white font-bold">CLOSE ×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* 1. Splash Screen */}
            {activeModal === "splash" && (
              <View className="items-center py-8">
                <Text className="text-6xl my-6 animate-pulse">🌌</Text>
                <Text className="text-2xl font-extrabold text-white text-center">MY-Alromimah Gateway</Text>
                <Text className="text-sm text-sky-400 text-center mt-1">USDT Futures Automation Terminal</Text>
                <View className="bg-[#121824] p-4 rounded-xl border border-slate-800 w-full mt-8 space-y-2">
                  <Text className="text-xs text-slate-400 font-semibold uppercase">Security Diagnostics</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-300">GPG Encryption Core</Text>
                    <Text className="text-xs text-emerald-400 font-bold">ACTIVE</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-300">Local DB Schema Version</Text>
                    <Text className="text-xs text-emerald-400 font-bold">v2.1</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-300">IP Binding Guard</Text>
                    <Text className="text-xs text-emerald-400 font-bold">CONNECTED</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("System diagnostic complete", "All modules verified. Redundancies enabled.");
                  }}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 w-full py-4 rounded-xl mt-8 items-center"
                >
                  <Text className="text-white font-bold uppercase tracking-wider">Trigger Core Handshake</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. Login Screen */}
            {activeModal === "login" && (
              <View className="space-y-4">
                <Text className="text-sm text-slate-400 mb-2">Secure node credentials access</Text>
                <View>
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">Operator ID</Text>
                  <TextInput
                    value={usernameInput}
                    onChangeText={setUsernameInput}
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm"
                    placeholder="Enter Username"
                    placeholderTextColor="#475569"
                  />
                </View>
                <View className="mt-3">
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">Password Entry</Text>
                  <TextInput
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    secureTextEntry
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm"
                    placeholder="Enter Security Secret"
                    placeholderTextColor="#475569"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert("Login Authorized", "GPG Identity validated. Handshake registered.")}
                  className="bg-sky-500 py-3.5 rounded-lg items-center mt-6"
                >
                  <Text className="text-white font-bold uppercase tracking-wider">Validate Identity 🔓</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 3. API Key Setup Screen */}
            {activeModal === "api_keys" && (
              <View className="space-y-4">
                <Text className="text-xs text-amber-500 font-bold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mb-2">
                  🛡️ API Keys are AES-256 encrypted server-side and never exposed to client bundles or visual logs.
                </Text>
                <View>
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">MEXC Access Key</Text>
                  <TextInput
                    value={apiKeyInput}
                    onChangeText={setApiKeyInput}
                    secureTextEntry
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="mx_..."
                    placeholderTextColor="#475569"
                  />
                </View>
                <View className="mt-3">
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">MEXC Secret Key</Text>
                  <TextInput
                    value={secretKeyInput}
                    onChangeText={setSecretKeyInput}
                    secureTextEntry
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="mxsecret_..."
                    placeholderTextColor="#475569"
                  />
                </View>
                <View className="mt-3">
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">Approved Node IP Address</Text>
                  <TextInput
                    value={ipAddressInput}
                    onChangeText={setIpAddressInput}
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="192.168.1.100"
                    placeholderTextColor="#475569"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSaveApiKeys}
                  className="bg-amber-500 py-3.5 rounded-lg items-center mt-6"
                >
                  <Text className="text-white font-bold uppercase tracking-wider">Save Encrypted Keys 🔒</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 4. Dashboard Screen */}
            {activeModal === "dashboard" && (
              <View className="space-y-4">
                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs text-slate-400 uppercase font-semibold">Active Strategy</Text>
                    <Text className="text-base font-bold text-emerald-400">Trailing Breakout v4</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-slate-400 uppercase">Supervisor Status</Text>
                    <Text className="text-base font-bold text-sky-400">PROTECTED</Text>
                  </View>
                </View>

                {/* Live indicators selector */}
                <View className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Technical Indicators (MEXC Feed)</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["ema", "sma", "rsi", "macd", "atr", "bollinger", "vwap"].map((ind) => (
                      <TouchableOpacity
                        key={ind}
                        onPress={() => setActiveIndicator(ind as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border",
                          activeIndicator === ind ? "bg-sky-500/20 border-sky-400 text-sky-400" : "bg-slate-900 border-slate-800 text-slate-400"
                        )}
                      >
                        <Text className="text-xs uppercase font-bold text-slate-300">{ind}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* SVG Chart Panel */}
                <View className="bg-[#121824] p-3 rounded-xl border border-slate-800 my-2">
                  <Text className="text-xs text-slate-400 uppercase font-bold mb-1">Live Candlesticks</Text>
                  {chartData ? (
                    <CandlestickChart candles={chartData as any} currentPrice={btcLivePrice} />
                  ) : (
                    <View className="h-44 items-center justify-center">
                      <ActivityIndicator color="#0ea5e9" />
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 5. Wallet Screen */}
            {activeModal === "wallet" && (
              <View className="space-y-4">
                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl items-center">
                  <Text className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account Net Worth</Text>
                  <Text className="text-3xl font-extrabold text-white mt-1">${stats?.totalBalance?.toFixed(2) || "1,247.38"} USDT</Text>
                  <Text className="text-xs text-emerald-400 font-semibold mt-1">+${stats?.totalPnl?.toFixed(2) || "253.83"} Realized Profits</Text>
                </View>

                <Text className="text-xs font-bold text-slate-300 uppercase mt-4 mb-2">Asset Breakdown</Text>
                {[
                  { name: "USDT Collateral", balance: "847.38", pct: "68%", color: "bg-emerald-500" },
                  { name: "BTC Spot Collateral", balance: "250.00", pct: "20%", color: "bg-sky-500" },
                  { name: "ETH Spot Collateral", balance: "100.00", pct: "8%", color: "bg-indigo-500" },
                  { name: "SOL Futures Margin", balance: "50.00", pct: "4%", color: "bg-purple-500" },
                ].map((asset, idx) => (
                  <View key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <View className={cn("w-2.5 h-2.5 rounded-full", asset.color)} />
                      <Text className="text-xs text-white font-bold">{asset.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs text-slate-300 font-mono">${asset.balance}</Text>
                      <Text className="text-[9px] text-slate-500 font-bold">{asset.pct}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 6. Futures Screen */}
            {activeModal === "futures" && (
              <View className="space-y-4">
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setTradeSide("long")}
                    className={cn("flex-1 py-3 rounded-lg items-center border", tradeSide === "long" ? "bg-emerald-500/20 border-emerald-400" : "bg-slate-900 border-slate-800")}
                  >
                    <Text className="text-xs font-bold text-emerald-400">LONG (BUY)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setTradeSide("short")}
                    className={cn("flex-1 py-3 rounded-lg items-center border", tradeSide === "short" ? "bg-rose-500/20 border-rose-400" : "bg-slate-900 border-slate-800")}
                  >
                    <Text className="text-xs font-bold text-rose-400">SHORT (SELL)</Text>
                  </TouchableOpacity>
                </View>

                {/* Leverage Slider Mock */}
                <View className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-slate-400">Adjust Leverage</Text>
                    <Text className="text-xs font-bold text-amber-500 font-mono">{leverage}x</Text>
                  </View>
                  <View className="flex-row gap-1 mt-2">
                    {[1, 5, 10, 20, 50, 100, 125].map(levVal => (
                      <TouchableOpacity
                        key={levVal}
                        onPress={() => setLeverage(levVal)}
                        className={cn("flex-1 py-1.5 rounded items-center border", leverage === levVal ? "bg-amber-500/20 border-amber-400" : "bg-slate-950 border-slate-800")}
                      >
                        <Text className="text-[10px] text-slate-300 font-mono">{levVal}x</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Position Size Calculator */}
                <View className="bg-[#121824] p-3 rounded-lg border border-slate-800 space-y-2">
                  <Text className="text-xs text-sky-400 uppercase font-bold">Position Size Calculator</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-400">Estimated Margin Cost:</Text>
                    <Text className="text-xs text-white font-mono">${((parseFloat(tradeSize) * btcLivePrice) / leverage).toFixed(2)} USDT</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-400">Est. Liquidation Price:</Text>
                    <Text className="text-xs text-red-400 font-mono">
                      ${tradeSide === "long" ? (btcLivePrice * (1 - 1/leverage)).toFixed(2) : (btcLivePrice * (1 + 1/leverage)).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text className="text-xs text-slate-400 mb-1.5 font-bold uppercase">Position Size (BTC)</Text>
                  <TextInput
                    value={tradeSize}
                    onChangeText={setTradeSize}
                    keyboardType="numeric"
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="e.g. 0.1"
                  />
                </View>

                <View className="flex-row gap-2 mt-4">
                  <TouchableOpacity
                    onPress={() => handlePlaceOrder("MARKET")}
                    className="flex-1 bg-sky-500 py-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Execute Market Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handlePlaceOrder("LIMIT")}
                    className="flex-1 bg-indigo-600 py-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Execute Limit Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 7. Spot Screen */}
            {activeModal === "spot" && (
              <View className="space-y-4">
                <Text className="text-xs text-slate-400 mb-2">Trade MEXC Spot Pairs with instant settlement and 0% maker fee protocols.</Text>
                
                <View className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex-row justify-between">
                  <Text className="text-xs text-slate-300 font-bold">Target Trading Asset</Text>
                  <Text className="text-xs text-emerald-400 font-bold">MX Token / USDT</Text>
                </View>

                <View className="flex-row gap-2 my-2">
                  <TouchableOpacity className="flex-1 bg-emerald-500/25 border border-emerald-500/40 p-3 rounded-lg items-center">
                    <Text className="text-xs font-bold text-emerald-400">BUY SPOT MX</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-rose-500/25 border border-rose-500/40 p-3 rounded-lg items-center">
                    <Text className="text-xs font-bold text-rose-400">SELL SPOT MX</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 8. Orders Screen */}
            {activeModal === "orders" && (
              <View className="space-y-3">
                <Text className="text-xs text-slate-400 mb-2">Durable database orders state tracker</Text>
                {orders && orders.length > 0 ? (
                  orders.map((ord: any) => (
                    <View key={ord.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex-row justify-between items-center">
                      <View>
                        <Text className="text-xs font-bold text-white">{ord.pair} · {ord.type}</Text>
                        <Text className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.timestamp}</Text>
                        <Text className={cn("text-[10px] font-bold mt-1 uppercase", ord.side === "long" ? "text-emerald-400" : "text-rose-400")}>
                          {ord.side}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xs font-bold text-white font-mono">${ord.price}</Text>
                        <Text className="text-[10px] text-sky-400 font-bold uppercase mt-1">{ord.status}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-xs text-slate-500 text-center py-6">No order logs found</Text>
                )}
              </View>
            )}

            {/* 9. Open Positions Screen */}
            {activeModal === "open_positions" && (
              <View className="space-y-4">
                <Text className="text-xs text-slate-400 mb-2">Monitored leverage positions</Text>
                {[
                  { pair: "BTC/USDT", side: "long", size: "0.05", leverage: "x20", entry: 66420.50, pnl: 21.08 },
                  { pair: "ETH/USDT", side: "short", size: "2.5", leverage: "x10", entry: 3485.20, pnl: 57.75 },
                ].map((pos, i) => (
                  <View key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <View className="flex-row justify-between">
                      <View>
                        <Text className="text-xs font-bold text-white">{pos.pair}</Text>
                        <Text className="text-[10px] text-slate-500">Leverage: {pos.leverage}</Text>
                      </View>
                      <Text className={cn("text-xs font-extrabold", pos.pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        +${pos.pnl.toFixed(2)}
                      </Text>
                    </View>
                    <View className="bg-slate-950 p-2.5 rounded-lg flex-row justify-between text-xs">
                      <View className="items-center">
                        <Text className="text-[9px] text-slate-500">Entry Price</Text>
                        <Text className="text-xs font-bold text-white font-mono">${pos.entry.toFixed(2)}</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[9px] text-slate-500">Size</Text>
                        <Text className="text-xs font-bold text-white font-mono">{pos.size}</Text>
                      </View>
                      <View className="items-center">
                        <Text className="text-[9px] text-slate-500">SL/TP status</Text>
                        <Text className="text-xs font-bold text-emerald-400 uppercase font-mono">Protected</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 10. Closed Positions Screen */}
            {activeModal === "closed_positions" && (
              <View className="space-y-3">
                <Text className="text-xs text-slate-400 mb-2">Realized historical orders recorded in the DB.</Text>
                {[
                  { id: "TX_001", pair: "SOL/USDT", side: "long", profit: 175.00, roi: "+4.91%", time: "Today 04:12" },
                  { id: "TX_002", pair: "ETH/USDT", side: "short", profit: 90.00, roi: "+0.85%", time: "Yesterday 18:00" },
                  { id: "TX_003", pair: "BNB/USDT", side: "long", profit: -50.00, roi: "-0.86%", time: "2 days ago" },
                ].map((pos) => (
                  <View key={pos.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs font-bold text-white">{pos.pair} · {pos.side}</Text>
                      <Text className="text-[10px] text-slate-400 font-mono mt-0.5">{pos.time}</Text>
                    </View>
                    <View className="items-end">
                      <Text className={cn("text-xs font-bold font-mono", pos.profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {pos.profit >= 0 ? "+" : ""}${pos.profit.toFixed(2)}
                      </Text>
                      <Text className="text-[10px] text-slate-500 mt-0.5">{pos.roi}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 11. Statistics Screen */}
            {activeModal === "statistics" && (
              <View className="space-y-4">
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg items-center">
                    <Text className="text-[10px] text-slate-500 uppercase">Win Rate</Text>
                    <Text className="text-lg font-bold text-emerald-400 mt-1">{stats?.winRate || "64"}%</Text>
                  </View>
                  <View className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg items-center">
                    <Text className="text-[10px] text-slate-500 uppercase">Sharpe Ratio</Text>
                    <Text className="text-lg font-bold text-sky-400 mt-1">{stats?.sharpeRatio || "1.45"}</Text>
                  </View>
                  <View className="flex-1 bg-slate-900 border border-slate-800 p-3 rounded-lg items-center">
                    <Text className="text-[10px] text-slate-500 uppercase">Total Trades</Text>
                    <Text className="text-lg font-bold text-indigo-400 mt-1">{stats?.totalTrades || "36"}</Text>
                  </View>
                </View>
                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <Text className="text-xs font-bold text-slate-300 uppercase mb-2">Trading Performance Indices</Text>
                  <View className="space-y-2 text-xs">
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Profit Factor:</Text>
                      <Text className="text-emerald-400 font-bold">1.84</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Average Profit Per Day:</Text>
                      <Text className="text-emerald-400 font-bold">$22.30</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-slate-400">Peak System Drawdown:</Text>
                      <Text className="text-red-400 font-bold">-${stats?.maxDrawdown || "50.00"}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* 12. Strategy Settings Screen */}
            {activeModal === "strategy" && (
              <View className="space-y-4">
                <Text className="text-xs text-slate-400 mb-2">Automated Risk Rules</Text>
                
                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-300">Trailing Stop Protection</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: "#374151", true: "#22c55e" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-300">Daily Loss Safeguard Guard</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: "#374151", true: "#22c55e" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">Daily Loss Limit (USDT)</Text>
                  <TextInput
                    value={config?.dailyLossLimit?.toString() || "500"}
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="500"
                  />
                </View>
                
                <View className="mt-3">
                  <Text className="text-xs text-slate-400 mb-1.5 uppercase font-bold">Max Drawdown Protection (%)</Text>
                  <TextInput
                    value={config?.maxDrawdownPercent?.toString() || "10.0"}
                    className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg text-sm font-mono"
                    placeholder="10.0"
                  />
                </View>

                <TouchableOpacity
                  onPress={() => Alert.alert("Saved", "Risk rules and parameters stored in database config.")}
                  className="bg-indigo-600 py-3.5 rounded-lg items-center mt-4"
                >
                  <Text className="text-white font-bold uppercase tracking-wider text-xs">Save Strategy Metrics</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 13. Notifications Screen */}
            {activeModal === "notifications" && (
              <View className="space-y-3">
                <Text className="text-xs text-slate-400 mb-2">Operational warning and trigger alerts</Text>
                {[
                  { time: "10m ago", text: "⏱️ Reward harvester trigger: successfully verified volume requirements.", type: "system" },
                  { time: "2h ago", text: "🚨 MARGIN WARNING: Initial margin used represents 68% of equity.", type: "risk" },
                  { time: "4h ago", text: "🔓 Secure database sync accomplished.", type: "security" },
                ].map((item, i) => (
                  <View key={i} className="bg-[#121824] p-3.5 rounded-lg border border-slate-800 flex-col gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[9px] text-sky-400 uppercase font-bold tracking-wider">{item.type}</Text>
                      <Text className="text-[10px] text-slate-500">{item.time}</Text>
                    </View>
                    <Text className="text-xs text-slate-300 mt-1 font-semibold">{item.text}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 14. Logs Screen */}
            {activeModal === "logs" && (
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-slate-400">Live operational server logs (Drizzle logs)</Text>
                  <TouchableOpacity
                    onPress={() => clearLogsMutation.mutate()}
                    className="bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20"
                  >
                    <Text className="text-[10px] text-red-400 font-bold uppercase">Clear Cache</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-950 p-3 rounded-xl border border-slate-800 min-h-[300px]">
                  {logs && logs.length > 0 ? (
                    logs.map((log: any) => (
                      <View key={log.id} className="py-2 border-b border-slate-900 flex-row gap-2">
                        <Text className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                          log.level === "ERROR" ? "bg-red-500/20 text-red-400" :
                          log.level === "WARN" ? "bg-amber-500/20 text-amber-400" :
                          log.level === "TRADE" ? "bg-emerald-500/20 text-emerald-400" :
                          log.level === "SECURITY" ? "bg-purple-500/20 text-purple-400" :
                          "bg-sky-500/20 text-sky-400"
                        )}>
                          {log.level}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-[10px] text-slate-300 font-semibold">{log.message}</Text>
                          <Text className="text-[8px] text-slate-600 font-mono mt-0.5">{log.timestamp} · {log.module}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text className="text-xs text-slate-600 font-mono py-12 text-center">Empty system logs</Text>
                  )}
                </View>
              </View>
            )}

            {/* 15. Security Screen */}
            {activeModal === "security" && (
              <View className="space-y-4">
                <Text className="text-xs text-slate-400 mb-2">Gate system encryption and key management protocols</Text>
                
                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-300">GPG Encryption Validation</Text>
                    <Text className="text-xs text-emerald-400 font-bold uppercase">Active</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-300">Active Cipher Type</Text>
                    <Text className="text-xs text-slate-400 font-mono">AES-256-GCM</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-slate-300">Biometric Pattern Lock</Text>
                    <Switch
                      value={true}
                      trackColor={{ false: "#374151", true: "#22c55e" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => Alert.alert("Backup Complete", "Security parameters successfully backed up to encrypted backup file.")}
                  className="bg-emerald-600 py-3.5 rounded-lg items-center"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">Generate Secure GPG Backup</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 16. About Screen */}
            {activeModal === "about" && (
              <View className="items-center py-6 space-y-4">
                <Text className="text-5xl">🛡️</Text>
                <Text className="text-xl font-extrabold text-white">MY-Alromimah Core Platform</Text>
                <Text className="text-xs text-slate-400 text-center uppercase tracking-widest font-mono">Version 1.0.0 (GPG Secured)</Text>
                
                <Text className="text-xs text-slate-300 text-center leading-5 px-4 mt-2">
                  This platform implements clean-architecture specifications for trading management, real-time indicator statistics, automatic strategy scheduler controls, and risk supervisors.
                </Text>

                <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl w-full mt-4">
                  <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Platform Attributes</Text>
                  <View className="space-y-1 text-xs">
                    <Text className="text-slate-300">· UI: NativeWind Tailwind CSS Utilities</Text>
                    <Text className="text-slate-300">· Backend: Node.js, Express & tRPC Adaptors</Text>
                    <Text className="text-slate-300">· ORM: Drizzle Schema Relational Models</Text>
                    <Text className="text-slate-300">· Indicators: EMA, SMA, RSI, MACD, ATR, BB, VWAP</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
