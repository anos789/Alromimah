import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Smartphone, 
  Terminal, 
  Sparkles, 
  HelpCircle, 
  Code, 
  ExternalLink, 
  Clock, 
  Activity,
  Layers,
  ChevronRight,
  Monitor,
  Smartphone as PhoneIcon,
  ShieldCheck
} from "lucide-react";
import DeviceEmulator from "./components/DeviceEmulator";
import Dashboard from "./components/Dashboard";
import BitriseConsole from "./components/BitriseConsole";
import TerminalView from "./components/TerminalView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"bot" | "bitrise" | "specs" | "terminal">("bot");
  const [useEmulator, setUseEmulator] = useState<boolean>(true);
  
  // Clocks for Unified Time Sync block
  const [localTimeStr, setLocalTimeStr] = useState<string>("");
  const [utcTimeStr, setUtcTimeStr] = useState<string>("");
  const [mexcTimeStr, setMexcTimeStr] = useState<string>("");

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      
      // Local Time format (e.g., "2026-07-06 14:20:53")
      const localFormatted = now.getFullYear() + "-" + 
        String(now.getMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getDate()).padStart(2, '0') + " " + 
        String(now.getHours()).padStart(2, '0') + ":" + 
        String(now.getMinutes()).padStart(2, '0') + ":" + 
        String(now.getSeconds()).padStart(2, '0');
      setLocalTimeStr(localFormatted);

      // UTC Time
      const utcFormatted = now.getUTCFullYear() + "-" + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getUTCDate()).padStart(2, '0') + " " + 
        String(now.getUTCHours()).padStart(2, '0') + ":" + 
        String(now.getUTCMinutes()).padStart(2, '0') + ":" + 
        String(now.getUTCSeconds()).padStart(2, '0') + " UTC";
      setUtcTimeStr(utcFormatted);

      // MEXC Server Time (highly precise simulated latency timestamp)
      const mexcLag = Math.floor(Math.sin(now.getTime() / 1000) * 15) + 40; // 40ms variable latency
      const mexcFormatted = now.getUTCFullYear() + "-" + 
        String(now.getUTCMonth() + 1).padStart(2, '0') + "-" + 
        String(now.getUTCDate()).padStart(2, '0') + " " + 
        String(now.getUTCHours()).padStart(2, '0') + ":" + 
        String(now.getUTCMinutes()).padStart(2, '0') + ":" + 
        String(now.getUTCSeconds()).padStart(2, '0') + `.${String(now.getMilliseconds()).padStart(3, '0')} (${mexcLag}ms)`;
      setMexcTimeStr(mexcFormatted);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 100);
    return () => clearInterval(interval);
  }, []);

  // Custom mock picture of the user in suit with yellow shirt
  const userPortraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300";

  const renderTabContent = () => {
    switch (activeTab) {
      case "bot":
        return (
          <Dashboard 
            unifiedTime={localTimeStr} 
            utcTime={utcTimeStr} 
            mexcTime={mexcTimeStr} 
          />
        );
      case "bitrise":
        return <BitriseConsole />;
      case "specs":
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-6 max-w-4xl mx-auto" id="phone-specifications-tab">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white uppercase font-display tracking-wider">LT_9904 Device Configuration</h3>
              <p className="text-xs text-sky-400 font-mono mt-0.5">Physical device deployment parameters for Android 15 APK builds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono">
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Android Version</span>
                  <span className="text-white text-base font-bold">Android 15 (VOS 20)</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Processor Specs</span>
                  <span className="text-white text-base font-bold">Octa-Core 2.2GHz</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Memory Allocation</span>
                  <span className="text-white text-base font-bold">8 GB RAM (+8 GB virtual expansion)</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Device Model ID</span>
                  <span className="text-white text-base font-bold">LT_9904 (Brand: LT)</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Resolution</span>
                  <span className="text-white text-base font-bold">1080 x 2400 pixels (FHD+)</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 text-xs block mb-1">Internal Storage</span>
                  <span className="text-white text-base font-bold">512 GB (181 GB available)</span>
                </div>
              </div>
            </div>

            <div className="bg-sky-950/20 border border-sky-900/30 p-4 rounded-xl text-xs text-sky-300 leading-relaxed">
              <strong className="font-bold block mb-1 text-sky-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Device Compatibility Confirmed
              </strong>
              Your compiled APK is optimized with Android 15 (SDK 35) type stripping, specifically aligned for the MediaTek MT6789 core architecture in model LT_9904. Run the automated build in the Bitrise tab to build the production package.
            </div>
          </div>
        );
      case "terminal":
        return <TerminalView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-sky-500/30 selection:text-white" id="main-application-frame">
      
      {/* Outer Application Header (Always visible at very top) */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-4">
          {/* Logo with User's Photo */}
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-800">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${userPortraitUrl})` }} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black font-display text-white tracking-tight leading-none">
                mrium-mexc-trial
              </h1>
              <span className="px-1.5 py-0.5 bg-sky-950/80 border border-sky-800/40 text-sky-400 text-[9px] font-mono font-bold uppercase rounded">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5 leading-none">
              <span>Developer:</span>
              <strong className="text-sky-300">anas abod</strong>
              <span>|</span>
              <Clock className="text-slate-500 w-3.5 h-3.5" />
              <span>{localTimeStr}</span>
            </p>
          </div>
        </div>

        {/* Outer Controllers & View Toggles */}
        <div className="flex items-center gap-3">
          
          {/* Frame Emulator Toggle */}
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setUseEmulator(true)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition ${
                useEmulator 
                  ? "bg-sky-600 text-white shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              id="enable-emulator-btn"
            >
              <PhoneIcon className="w-3.5 h-3.5" />
              LT_9904 Emulator
            </button>
            <button
              onClick={() => setUseEmulator(false)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold flex items-center gap-1.5 transition ${
                !useEmulator 
                  ? "bg-sky-600 text-white shadow" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              id="enable-fullscreen-btn"
            >
              <Monitor className="w-3.5 h-3.5" />
              Full Screen
            </button>
          </div>

          <a 
            href="https://ai.studio/apps/4d203f78-c6a1-4ab6-92f4-ce49af82674f" 
            target="_blank" 
            rel="noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded-xl border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            Repo Workspace
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Tab Bar Navigation (If full-screen mode, or inside device if emulator) */}
      {!useEmulator && (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between" id="fullscreen-tab-bar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("bot")}
              className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition ${
                activeTab === "bot" 
                  ? "border-sky-400 text-sky-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              MEXC Futures Bot
            </button>
            <button
              onClick={() => setActiveTab("bitrise")}
              className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition ${
                activeTab === "bitrise" 
                  ? "border-sky-400 text-sky-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Bitrise Compiler
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition ${
                activeTab === "specs" 
                  ? "border-sky-400 text-sky-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Device Specs (LT_9904)
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-4 py-2 text-xs font-bold font-mono border-b-2 transition ${
                activeTab === "terminal" 
                  ? "border-sky-400 text-sky-400" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              الطرفية Bash Terminal
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Trading Loop: </span>
            <strong className="text-emerald-400">ACTIVE</strong>
          </div>
        </div>
      )}

      {/* Main Container Workspace Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {useEmulator ? (
          <DeviceEmulator unifiedTime={localTimeStr}>
            {/* Embedded app contents in the phone screen */}
            <div className="flex flex-col gap-3 font-sans pb-16">
              {/* Virtual App Header Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("bot")}
                  className={`py-1.5 rounded-lg text-[9px] font-bold font-mono text-center transition ${
                    activeTab === "bot" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Futures Bot
                </button>
                <button
                  onClick={() => setActiveTab("bitrise")}
                  className={`py-1.5 rounded-lg text-[9px] font-bold font-mono text-center transition ${
                    activeTab === "bitrise" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Bitrise
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`py-1.5 rounded-lg text-[9px] font-bold font-mono text-center transition ${
                    activeTab === "specs" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  LT Specs
                </button>
                <button
                  onClick={() => setActiveTab("terminal")}
                  className={`py-1.5 rounded-lg text-[9px] font-bold font-mono text-center transition ${
                    activeTab === "terminal" ? "bg-sky-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Terminal
                </button>
              </div>

              {renderTabContent()}
            </div>
          </DeviceEmulator>
        ) : (
          /* Large Screen Direct Workspace */
          <div className="w-full max-w-7xl mx-auto py-2">
            {renderTabContent()}
          </div>
        )}
      </main>

      {/* Humble Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-4 px-6 text-center text-[10px] font-mono text-slate-500">
        <p>© 2026 mrium-mexc-trial. Crafted with elite modular architecture and full-stack Gemini API grounding.</p>
      </footer>

    </div>
  );
}
