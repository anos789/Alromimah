import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Signal, 
  Cpu, 
  FolderLock, 
  Clock, 
  Coins, 
  Smartphone as PhoneIcon,
  ChevronRight,
  User,
  LogOut,
  Sparkles,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeviceEmulatorProps {
  children: React.ReactNode;
  unifiedTime: string;
}

export default function DeviceEmulator({ children, unifiedTime }: DeviceEmulatorProps) {
  const [appOpen, setAppOpen] = useState(true);
  const [booting, setBooting] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  // Custom mock picture of the user in suit with yellow shirt
  const userPortraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300"; // Fallback URL for visual polish

  const triggerLaunch = () => {
    if (appOpen) return;
    setBooting(true);
    setTimeout(() => {
      setBooting(false);
      setAppOpen(true);
    }, 2200);
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-8 w-full max-w-7xl mx-auto p-4 md:p-6" id="device-emulator-container">
      {/* Phone Specifications Panel */}
      <div className="flex-1 max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl" id="phone-specifications">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <Smartphone className="text-sky-400 w-6 h-6 animate-pulse" />
          <div>
            <h3 className="text-lg font-semibold text-white">LT_9904 Device Status</h3>
            <p className="text-xs text-sky-400 font-mono">Android 15 (SDK 35)</p>
          </div>
        </div>

        <div className="space-y-4 text-sm font-mono">
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Manufacturer:</span>
            <span className="text-white font-medium">LT Mobile Corp</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">SOC Hardware:</span>
            <span className="text-white font-medium">Mediatek MT6789</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Processor:</span>
            <span className="text-white font-medium">Octa-core 2.2GHz</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Total Memory:</span>
            <span className="text-white font-medium">8GB + 8GB Virtual</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Battery Capacity:</span>
            <span className="text-emerald-400 font-medium">6000 mAh</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Screen Resolution:</span>
            <span className="text-white font-medium">1080 x 2400 (FHD+)</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/50 pb-2">
            <span className="text-slate-400">Locale & Lang:</span>
            <span className="text-white font-medium">ar-YE (Yemeni Arabic)</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-slate-400">Target Build Stack:</span>
            <span className="text-amber-400 font-medium">Bitrise SDK 15</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-300">
          <span className="font-semibold text-white block mb-1 text-sky-400">💡 PWA App Launcher Info</span>
          This app operates in premium responsive web mode. Tap on the custom app icon featuring your portrait in the emulator to open or simulate launching the fully functional <strong className="text-white">mrium-mexc-trial</strong> trading interface.
        </div>
      </div>

      {/* Emulator Wrapper */}
      <div className="relative mx-auto bg-slate-950 rounded-[50px] p-3 border-[6px] border-slate-800 shadow-2xl max-w-[420px] w-full aspect-[9/19.5] flex flex-col overflow-hidden" id="phone-emulator-frame">
        {/* Dynamic Notch / Camera Hole */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 h-5 w-28 bg-black rounded-full z-50 flex items-center justify-around px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
          <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
          <div className="w-2 h-2 rounded-full bg-blue-950"></div>
        </div>

        {/* Live Mobile Status Bar */}
        <div className="h-10 bg-slate-950 flex items-end justify-between px-6 pb-1 text-[11px] font-mono text-slate-400 font-semibold select-none z-40">
          <span>{unifiedTime.split(" ")[1]?.substring(0, 5) || "14:20"}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[9px]">4G/5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px]">98%</span>
            </div>
          </div>
        </div>

        {/* Interactive Screen Content */}
        <div className="flex-1 bg-slate-900 rounded-[38px] overflow-hidden relative flex flex-col p-2">
          
          <AnimatePresence mode="wait">
            {/* 1. App Launcher Home Screen */}
            {!appOpen && !booting && (
              <motion.div 
                key="homescreen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between p-6 pb-10"
              >
                {/* Search Bar Widget */}
                <div className="w-full bg-slate-800/60 border border-slate-700/50 rounded-full py-2 px-4 text-xs text-slate-400 flex items-center justify-between font-mono mt-6">
                  <span>Google Chrome Beta...</span>
                  <PhoneIcon className="w-3.5 h-3.5 text-slate-500" />
                </div>

                {/* Grid of Apps */}
                <div className="grid grid-cols-4 gap-y-6 gap-x-4 my-auto px-2">
                  
                  {/* The User's Custom App */}
                  <button 
                    onClick={triggerLaunch}
                    className="flex flex-col items-center gap-1.5 group outline-none"
                    id="mrium-app-launcher-btn"
                  >
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-lg group-hover:scale-105 transition-all duration-300">
                      {/* User's portrait in center */}
                      <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-800 relative flex items-center justify-center">
                        {/* Custom portrait canvas or fallback */}
                        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
                          {/* Beautiful simulated face layout representing the exact user photo */}
                          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${userPortraitUrl})` }} />
                          {/* Elegant suit overlay fallback */}
                          <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-950/80 text-[7px] text-sky-400 flex items-center justify-center font-mono">
                            PRO BOT
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                        <Wifi className="w-2.5 h-2.5 text-white animate-pulse" />
                      </div>
                    </div>
                    <span className="text-[10px] text-white font-mono text-center font-bold tracking-tight truncate w-full shadow-sm">
                      mrium-mexc
                    </span>
                  </button>

                  {/* Placeholders for realism */}
                  <div className="flex flex-col items-center gap-1.5 opacity-40 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">TimeSync</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 opacity-40 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                      <FolderLock className="w-6 h-6 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Bitrise</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 opacity-40 cursor-not-allowed">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">MEXC Global</span>
                  </div>

                </div>

                {/* Hotseat */}
                <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-3 flex items-center justify-around gap-2 shadow-inner">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg cursor-pointer">
                    <PhoneIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center cursor-pointer">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center cursor-pointer">
                    <Layers className="w-5 h-5 text-slate-400" />
                  </div>
                  <button 
                    onClick={triggerLaunch}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden">
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${userPortraitUrl})` }} />
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. Booting Splash Screen */}
            {booting && (
              <motion.div 
                key="booting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-2xl mb-4 animate-bounce">
                  <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${userPortraitUrl})` }} />
                  </div>
                </div>
                <h2 className="text-xl font-bold font-sans tracking-wider text-white">mrium-mexc-trial</h2>
                <p className="text-xs text-sky-400 font-mono mt-1">Trading Intelligence v2.0</p>
                
                {/* Simulated Loading Bar */}
                <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden mt-8">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="relative w-1/2 h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">SECURE DIRECT MEXC BRIDGE...</span>
              </motion.div>
            )}

            {/* 3. The Live Application Container */}
            {appOpen && !booting && (
              <motion.div 
                key="appcontent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col bg-slate-950 text-slate-100"
              >
                {/* App Toolbar Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cover bg-center border border-slate-700" style={{ backgroundImage: `url(${userPortraitUrl})` }} />
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight leading-none">mrium-mexc</h4>
                      <span className="text-[8px] font-mono text-sky-400 leading-none">PRO BOT V2</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setAppOpen(false)}
                    className="text-[9px] font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 flex items-center gap-1"
                    id="exit-to-homescreen"
                  >
                    <LogOut className="w-2.5 h-2.5 text-red-400" />
                    Exit App
                  </button>
                </div>

                {/* Children app contents (Scrollable Viewport) */}
                <div className="flex-1 overflow-y-auto px-1.5 py-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Device Navigation Bar */}
        <div className="h-6 bg-slate-950 flex items-center justify-around px-16 pb-1">
          <button 
            onClick={() => setAppOpen(false)}
            className="w-12 h-1 bg-slate-700 hover:bg-slate-500 rounded-full transition-colors duration-200"
            title="Home"
          ></button>
        </div>
      </div>
    </div>
  );
}
