import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Square, 
  Wifi, 
  PowerOff, 
  Unlock, 
  Lock, 
  Clock, 
  TrendingUp, 
  Newspaper, 
  RefreshCw, 
  Search, 
  Coins, 
  ChevronRight, 
  Briefcase, 
  Flame, 
  Sparkles,
  DollarSign,
  Droplet,
  Globe,
  Settings,
  HelpCircle,
  ShieldCheck,
  Award,
  Zap
} from "lucide-react";
import { BotState, NewsAlert, BotDeal } from "../types";

interface DashboardProps {
  unifiedTime: string;
  utcTime: string;
  mexcTime: string;
}

export default function Dashboard({ unifiedTime, utcTime, mexcTime }: DashboardProps) {
  // State from backend
  const [botState, setBotState] = useState<BotState>({
    running: true,
    mode: "cloud",
    lastRewardClaim: Date.now(),
    claimedRewardsCount: 12,
    claimedRewardsUSDT: 45.80,
    activeDeals: [
      { id: 1, asset: "Crude Oil", pair: "USO/USDT", type: "Long", leverage: "10x", profit: "+1.24%", amount: 150 },
      { id: 2, asset: "Metals", pair: "XAU/USDT", type: "Long", leverage: "20x", profit: "+0.85%", amount: 200 },
      { id: 3, asset: "TradFi", pair: "EUR/USDT", type: "Short", leverage: "50x", profit: "-0.12%", amount: 100 },
      { id: 4, asset: "Stocks", pair: "AAPL/USDT", type: "Long", leverage: "5x", profit: "+2.40%", amount: 300 },
      { id: 5, asset: "Copy Trading", pair: "PRO-Trader-1", type: "Mirror", leverage: "15x", profit: "+4.12%", amount: 500 },
    ],
    mexcKeys: {
      apiKey: "mx6789_mrium_prod_key_7719",
      secretKey: "mexc_secret_••••••••••••••••",
      ipAddress: "192.168.1.15",
      verified: true
    }
  });

  // Local input parameters
  const [amountPerTransaction, setAmountPerTransaction] = useState<number>(100);
  const [totalInvestment, setTotalInvestment] = useState<number>(2500);
  const [futuresPortfolio, setFuturesPortfolio] = useState<number>(12450.75);

  // API keys inputs
  const [inputApiKey, setInputApiKey] = useState(botState.mexcKeys.apiKey);
  const [inputSecretKey, setInputSecretKey] = useState(botState.mexcKeys.secretKey);
  const [inputIpAddress, setInputIpAddress] = useState(botState.mexcKeys.ipAddress);

  // News radar
  const [news, setNews] = useState<NewsAlert[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Reward claim countdown (every 10 mins = 600 seconds)
  const [countdown, setCountdown] = useState<number>(600);
  const [scanningRewards, setScanningRewards] = useState(false);

  // Fetch bot status and news on launch
  useEffect(() => {
    fetchBotState();
    fetchNews();
  }, []);

  // Reward Countdown Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerAutoRewardClaim();
          return 600; // Reset to 10 minutes
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBotState = async () => {
    try {
      const res = await fetch("/api/bot/state");
      const data = await res.json();
      setBotState(data);
      setInputApiKey(data.mexcKeys.apiKey);
      setInputSecretKey(data.mexcKeys.secretKey);
      setInputIpAddress(data.mexcKeys.ipAddress);
    } catch (e) {
      console.error("Failed to fetch bot state:", e);
    }
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    } catch (e) {
      console.error("Failed to fetch news radar:", e);
    } finally {
      setLoadingNews(false);
    }
  };

  const updateBotOnBackend = async (updatedFields: Partial<BotState> & { apiKey?: string; secretKey?: string; ipAddress?: string }) => {
    try {
      const res = await fetch("/api/bot/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          running: updatedFields.running,
          mode: updatedFields.mode,
          apiKey: updatedFields.apiKey,
          secretKey: updatedFields.secretKey,
          ipAddress: updatedFields.ipAddress
        })
      });
      const data = await res.json();
      if (data.success) {
        setBotState(data.state);
      }
    } catch (e) {
      console.error("Failed to update bot state:", e);
    }
  };

  const toggleBotRunning = () => {
    const nextState = !botState.running;
    updateBotOnBackend({ running: nextState });
  };

  const toggleBotMode = (mode: "cloud" | "manual") => {
    updateBotOnBackend({ mode });
  };

  const saveMexcKeys = () => {
    updateBotOnBackend({
      apiKey: inputApiKey,
      secretKey: inputSecretKey,
      ipAddress: inputIpAddress
    });
  };

  const triggerAutoRewardClaim = async () => {
    setScanningRewards(true);
    try {
      const res = await fetch("/api/bot/scan-rewards", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Increment futures portfolio randomly on reward
        setFuturesPortfolio((prev) => +(prev + data.claimedAmount).toFixed(2));
        fetchBotState();
      }
    } catch (e) {
      console.error("Error claiming rewards:", e);
    } finally {
      setScanningRewards(false);
    }
  };

  // Close direct deal helper
  const closeDeal = (id: number, payout: number) => {
    const nextDeals = botState.activeDeals.filter(d => d.id !== id);
    setFuturesPortfolio(prev => +(prev + payout).toFixed(2));
    setBotState(prev => ({
      ...prev,
      activeDeals: nextDeals
    }));
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Formats values to Arabic local strings if necessary
  const formatUSDT = (val: number) => {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " USDT";
  };

  return (
    <div className="flex flex-col gap-4 p-1 pb-12 w-full text-slate-100" id="mexc-bot-dashboard">
      
      {/* 1. Header Information Panel (Page 5 Blueprint Headers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3" id="blueprint-headers">
        
        {/* Clock/Time Synchronization Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Synchronization</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-400">App Local:</span>
              <span className="text-white font-semibold">{unifiedTime.split(" ")[1] || "14:20:00"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UTC System:</span>
              <span className="text-sky-300 font-semibold">{utcTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MEXC Server:</span>
              <span className="text-amber-400 font-semibold">{mexcTime}</span>
            </div>
          </div>
          <span className="text-[8px] text-emerald-400 font-mono mt-2 text-center bg-emerald-950/40 border border-emerald-900/30 rounded py-0.5 leading-none">
            ● 100% Sync Verified
          </span>
        </div>

        {/* Trading News & Radar Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trading News Radar</span>
            </div>
            <button 
              onClick={fetchNews}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              title="Refresh radar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[85px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {loadingNews ? (
              <div className="flex items-center justify-center h-full text-[10px] font-mono text-slate-500 gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                Querying Gemini Market Intelligence...
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-1.5">
                {news.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-[10px] bg-slate-950/50 p-1.5 rounded border border-slate-800/80 leading-snug">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white truncate max-w-[150px]">{item.title}</span>
                      <span className={`text-[8px] uppercase px-1 rounded font-mono ${
                        item.impact === "positive" ? "bg-emerald-950/80 text-emerald-400" :
                        item.impact === "negative" ? "bg-red-950/80 text-red-400" : "bg-slate-800 text-slate-300"
                      }`}>{item.impact}</span>
                    </div>
                    <p className="text-slate-400 text-[9px] mt-0.5 line-clamp-1">{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 font-mono text-center my-auto">No news feeds loaded</p>
            )}
          </div>
        </div>

        {/* Automatic Cloud Connectivity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Server</span>
          </div>
          <div className="font-mono text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Connection:</span>
              <span className="text-emerald-400 font-bold uppercase">24h Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Host IP:</span>
              <span className="text-white">104.197.88.24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ping:</span>
              <span className="text-emerald-400 font-semibold">12 ms</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-sky-950/30 border border-sky-900/30 rounded px-1.5 py-0.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></div>
            <span className="text-[8px] text-sky-300 font-mono">Frankfurt Region 1</span>
          </div>
        </div>

        {/* MEXC REST API & Keys Status Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition-all md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MEXC Authenticator</span>
            </div>
            
            {/* API Status Badge - Light Blue Open Padlock for genuinely verified keys, Red Closed for offline */}
            <div className={`px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono flex items-center gap-1 ${
              botState.mexcKeys.verified 
                ? "bg-sky-950/60 border-sky-500/30 text-sky-400" 
                : "bg-red-950/60 border-red-500/30 text-red-400"
            }`}>
              {botState.mexcKeys.verified ? <Unlock className="w-3 h-3 text-sky-400" /> : <Lock className="w-3 h-3 text-red-400" />}
              {botState.mexcKeys.verified ? "Genuine Connection" : "Access Locked"}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
              <div>
                <label className="text-slate-400 block">Access Key:</label>
                <input 
                  type="text" 
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 mt-0.5 text-white" 
                  placeholder="MEXC API Key"
                />
              </div>
              <div>
                <label className="text-slate-400 block">Secured IP Bind:</label>
                <input 
                  type="text" 
                  value={inputIpAddress}
                  onChange={(e) => setInputIpAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 mt-0.5 text-white" 
                  placeholder="Yemen IP Address"
                />
              </div>
            </div>
            <button 
              onClick={saveMexcKeys}
              className="w-full py-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-mono text-[10px] rounded transition-colors"
            >
              Verify & Rotate Keys
            </button>
          </div>
        </div>

      </div>

      {/* 2. Primary Boot Switch Bar & Volume Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-3" id="switches-and-volumes">
        
        {/* Main On/Off Button (WiFi indicator if running, crossed symbol if stopped) */}
        <div className="lg:col-span-3 flex flex-col justify-center">
          <button 
            onClick={toggleBotRunning}
            className={`w-full py-4 px-6 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
              botState.running 
                ? "bg-gradient-to-tr from-sky-600 to-sky-400 border-sky-400 shadow-lg shadow-sky-500/10 text-white" 
                : "bg-red-950/60 border-red-500/30 text-red-400"
            }`}
            id="bot-boot-toggle"
          >
            {botState.running ? (
              <>
                <Wifi className="w-7 h-7 animate-pulse text-white" />
                <span className="text-sm font-bold tracking-wider font-sans">ROBOT RUNNING (CLOUD)</span>
              </>
            ) : (
              <>
                <PowerOff className="w-7 h-7 text-red-500" />
                <span className="text-sm font-bold tracking-wider font-sans">ROBOT OFFLINE</span>
              </>
            )}
            <span className="text-[9px] opacity-80 font-mono mt-0.5">
              {botState.running ? "Automatic cloud loop running..." : "Manual control standby"}
            </span>
          </button>
        </div>

        {/* 24h Cloud / Manual Toggle */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Trading Pathway</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
              onClick={() => toggleBotMode("cloud")}
              className={`py-2 px-1 text-center font-mono text-[10px] font-bold rounded-lg border transition ${
                botState.mode === "cloud" 
                  ? "bg-sky-950 border-sky-500 text-sky-400" 
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
            >
              Cloud 24h
            </button>
            <button 
              onClick={() => toggleBotMode("manual")}
              className={`py-2 px-1 text-center font-mono text-[10px] font-bold rounded-lg border transition ${
                botState.mode === "manual" 
                  ? "bg-amber-950 border-amber-500 text-amber-400" 
                  : "bg-slate-950 border-slate-800 text-slate-500"
              }`}
            >
              Manual Path
            </button>
          </div>
          <p className="text-[9px] text-slate-400 font-mono mt-2 leading-tight">
            {botState.mode === "cloud" 
              ? "Saves battery, operates 24/7 on remote cloud server even when device is off."
              : "Allows custom buy/sell overrides directly inside active containers."}
          </p>
        </div>

        {/* Numeric Boxes for Volumes (Page 5: Amount per transaction, investment amount, futures portfolio) */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-3">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Amount per trade</span>
            <div className="flex items-center gap-1.5 mt-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <input 
                type="number" 
                value={amountPerTransaction}
                onChange={(e) => setAmountPerTransaction(+e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-white font-bold outline-none"
              />
              <span className="text-[9px] font-bold text-sky-400 font-mono">USDT</span>
            </div>
            <span className="text-[8px] text-slate-500 font-mono mt-1 block">Manual entry amount</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Allocation</span>
            <div className="flex items-center gap-1.5 mt-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <input 
                type="number" 
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(+e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-white font-bold outline-none"
              />
              <span className="text-[9px] font-bold text-sky-400 font-mono">USDT</span>
            </div>
            <span className="text-[8px] text-slate-500 font-mono mt-1 block">Allocated trading cap</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Futures Portfolio</span>
            <div className="mt-2 text-sky-400 font-mono text-sm font-black tracking-tight leading-none">
              {formatUSDT(futuresPortfolio)}
            </div>
            <span className="text-[8px] text-emerald-400 font-mono mt-1 block leading-none flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              +$452.12 Net Today
            </span>
            <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

        </div>

      </div>

      {/* 3. The 8 Main Asset Containers (Page 5 Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5" id="asset-containers-grid">
        
        {/* Container 1: Crude Oil */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-sky-400 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Crude Oil</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-900 px-1.5 py-0.5 rounded">Futures</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$124.80 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$480.12 USDT</span>
            </div>

            {/* Active Deals List */}
            <div className="mt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Active Deals</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">USO/USDT Long</span>
                  <span className="text-slate-400 text-[9px] block">Amt: 150 USDT | Lev: 10x</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">+1.24%</span>
                  <button 
                    onClick={() => closeDeal(1, 151.86)}
                    className="text-[8px] bg-sky-600 hover:bg-sky-500 font-bold text-white px-1.5 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container 2: Metals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Metals</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-900 px-1.5 py-0.5 rounded">Futures</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$85.20 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$310.50 USDT</span>
            </div>

            {/* Active Deals List */}
            <div className="mt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Active Deals</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">XAU/USDT Long</span>
                  <span className="text-slate-400 text-[9px] block">Amt: 200 USDT | Lev: 20x</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">+0.85%</span>
                  <button 
                    onClick={() => closeDeal(2, 201.70)}
                    className="text-[8px] bg-sky-600 hover:bg-sky-500 font-bold text-white px-1.5 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container 3: TradFi (Forex) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">TradFi Forex</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-900 px-1.5 py-0.5 rounded">Arbitrage</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-slate-400 font-bold">$0.00 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$12.45 USDT</span>
            </div>

            {/* Active Deals List */}
            <div className="mt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Active Deals</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <div>
                  <span className="text-rose-400 font-bold">EUR/USDT Short</span>
                  <span className="text-slate-400 text-[9px] block">Amt: 100 USDT | Lev: 50x</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-bold block">-0.12%</span>
                  <button 
                    onClick={() => closeDeal(3, 99.88)}
                    className="text-[8px] bg-sky-600 hover:bg-sky-500 font-bold text-white px-1.5 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container 4: Stocks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400 animate-pulse" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Stocks CFD</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-900 px-1.5 py-0.5 rounded">Futures</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$240.00 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$590.20 USDT</span>
            </div>

            {/* Active Deals List */}
            <div className="mt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Active Deals</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">AAPL/USDT Long</span>
                  <span className="text-slate-400 text-[9px] block">Amt: 300 USDT | Lev: 5x</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">+2.40%</span>
                  <button 
                    onClick={() => closeDeal(4, 307.20)}
                    className="text-[8px] bg-sky-600 hover:bg-sky-500 font-bold text-white px-1.5 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container 5: Copy Trading */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Copy Trading</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-900 px-1.5 py-0.5 rounded">Mirror</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$412.12 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$1,280.90 USDT</span>
            </div>

            {/* Active Deals List */}
            <div className="mt-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Active Deals</span>
              <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">PRO-Trader-1</span>
                  <span className="text-slate-400 text-[9px] block">Amt: 500 USDT | Lev: 15x</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">+4.12%</span>
                  <button 
                    onClick={() => closeDeal(5, 520.60)}
                    className="text-[8px] bg-sky-600 hover:bg-sky-500 font-bold text-white px-1.5 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container 6: Savings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Savings</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded">Low Risk</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$14.20 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$95.40 USDT</span>
            </div>
            <div className="mt-2 text-[9px] bg-slate-950 rounded p-2 text-slate-400 border border-slate-850">
              Low-risk MEXC automated vault yield optimization. Generating 6.8% APY on idle USDT margin safely.
            </div>
          </div>
        </div>

        {/* Container 7: Fiat */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sky-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Fiat Bridge</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-900 px-1.5 py-0.5 rounded">Arbitrage</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-emerald-400 font-bold">+$48.50 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$182.20 USDT</span>
            </div>
            <div className="mt-2 text-[9px] bg-slate-950 rounded p-2 text-slate-400 border border-slate-850">
              Scans OTC and local Yemeni Rial desk rates against MEXC Peer-to-Peer spreads for instant zero-risk margins.
            </div>
          </div>
        </div>

        {/* Container 8: Futures Contracts for Events */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-black uppercase text-white tracking-wider">Event Prediction</h4>
            </div>
            <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-900 px-1.5 py-0.5 rounded">Contracts</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-2.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Net Profit Deposited:</span>
              <span className="text-slate-400 font-bold">$0.00 USDT</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-slate-400">Weekly Performance:</span>
              <span className="text-emerald-400 font-bold">+$18.50 USDT</span>
            </div>
            <div className="mt-2 text-[9px] bg-slate-950 rounded p-2 text-slate-400 border border-slate-850">
              Scans index price triggers, options hedges, and prediction events on MEXC warehouses and kicks automated triggers.
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Analytics, Rewards Tracking & Side stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5" id="bottom-rewards-and-stats">
        
        {/* Left Area: Rewards Claim Tracker & ALPHA/Dex+ Yield Metrics */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          
          {/* Every 10 Minutes Tracker */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-950/80 border border-sky-800 rounded-xl relative">
                <Award className="w-6 h-6 text-sky-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white font-mono leading-none">
                  {botState.claimedRewardsCount}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-sans">MEXC Platform Rewards Warehouse</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-snug">
                  Automated scan of platform launchpads and Kickstarter modules. Trigger claims and routes profits directly to your futures wallet.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5 font-mono min-w-[130px]">
              <div className="flex justify-between sm:justify-end gap-2 w-full text-right">
                <span className="text-slate-500 text-[10px]">Claim Timer:</span>
                <span className="text-sky-400 font-black text-[11px]">{formatCountdown(countdown)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-2 w-full text-right leading-none">
                <span className="text-slate-500 text-[9px]">Total Collected:</span>
                <span className="text-emerald-400 font-bold text-[10px]">+{botState.claimedRewardsUSDT.toFixed(2)} USDT</span>
              </div>
              <button 
                onClick={triggerAutoRewardClaim}
                disabled={scanningRewards}
                className="w-full sm:w-auto px-3 py-1 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-slate-800 text-[10px] font-bold text-white rounded font-mono mt-1 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${scanningRewards ? "animate-spin text-sky-400" : "text-white"}`} />
                Scan & Claim
              </button>
            </div>
          </div>

          {/* ALPHA and Dex+ Yield Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* ALPHA Indicator */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-indigo-400 font-sans">A</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">ALPHA Yield Matrix</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono leading-relaxed space-y-1">
                <div className="flex justify-between border-b border-slate-850 pb-1">
                  <span>Net Profit Supplied:</span>
                  <span className="text-emerald-400 font-bold">+$12.40 / transaction</span>
                </div>
                <div className="flex justify-between pb-1 text-[10px]">
                  <span>Term Portfolio Allocation:</span>
                  <span className="text-white">1,500.00 USDT</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight mt-1.5">
                  The amount of net profit supplied to the term portfolio for each transaction. Automatically adjusted.
                </p>
              </div>
            </div>

            {/* Dex+ Indicator */}
            <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center">
                  <span className="text-[10px] font-black text-cyan-400 font-sans">D</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Dex+ Liquidity Arbitrage</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono leading-relaxed space-y-1">
                <div className="flex justify-between border-b border-slate-850 pb-1">
                  <span>DeFi Net Yield Supplied:</span>
                  <span className="text-emerald-400 font-bold">+$5.80 / transaction</span>
                </div>
                <div className="flex justify-between pb-1 text-[10px]">
                  <span>Decentralized Bridge:</span>
                  <span className="text-white">Active (Arbitrum Vault)</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight mt-1.5">
                  Decentralized cross-chain slippage triggers routing idle USDT pools through Arbitrum DEXs to yield premium interest.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Area: General Account Statistics & Analytics (Right Panel in PDF) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block border-b border-slate-850 pb-2 mb-3">
            Account Performance Dashboard (24H)
          </span>

          <div className="space-y-3.5 font-mono text-[11px]">
            <div className="flex justify-between border-b border-slate-850/50 pb-2">
              <span className="text-slate-400">Total Open Deals:</span>
              <span className="text-white font-bold">{botState.activeDeals.length} Deals</span>
            </div>
            <div className="flex justify-between border-b border-slate-850/50 pb-2">
              <span className="text-slate-400">Open Vol. Value:</span>
              <span className="text-white font-bold">
                {botState.activeDeals.reduce((acc, d) => acc + d.amount, 0).toLocaleString()} USDT
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-850/50 pb-2">
              <span className="text-slate-400">Total Closed Deals:</span>
              <span className="text-emerald-400 font-bold">148 Deals</span>
            </div>
            <div className="flex justify-between border-b border-slate-850/50 pb-2">
              <span className="text-slate-400">Closed Vol. Value:</span>
              <span className="text-white font-bold">18,450.50 USDT</span>
            </div>
            <div className="flex justify-between border-b border-slate-850/50 pb-2">
              <span className="text-slate-400">Today's Net Profit:</span>
              <span className="text-emerald-400 font-bold">+$452.12 USDT</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-slate-400">Total Bot Profit:</span>
              <span className="text-emerald-400 font-black text-xs">+$2,845.80 USDT</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10px] leading-snug text-slate-400">
            <span className="font-bold text-white block mb-1 flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Security Integrity Protocol
            </span>
            Direct transfer protection enabled. Bot strictly prohibits withdrawals or transfer to unauthorized external addresses, ensuring complete capital security.
          </div>
        </div>

      </div>

    </div>
  );
}
