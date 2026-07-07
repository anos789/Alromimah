import React, { useState, useEffect, useRef } from "react";
import { Terminal as TerminalIcon, Play, AlertCircle, RefreshCw, Trash2, ArrowRight, CornerDownLeft, Sparkles, FolderOpen, ShieldAlert } from "lucide-react";

interface LogEntry {
  type: "command" | "output" | "error" | "system";
  text: string;
  cwd: string;
  command?: string;
  timestamp: string;
}

export default function TerminalView() {
  const [cwd, setCwd] = useState<string>(".");
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [executing, setExecuting] = useState<boolean>(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      type: "system",
      text: "Alromimah Dev Container Shell [v1.0.4]",
      cwd: ".",
      timestamp: new Date().toLocaleTimeString()
    },
    {
      type: "system",
      text: "Type 'help' to view suggestions. Direct physical commands are executed securely inside your container.",
      cwd: ".",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Focus terminal input when clicking the terminal body
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeCommand = async (commandToRun: string) => {
    const trimmed = commandToRun.trim();
    if (!trimmed) return;

    // Add command to log list immediately
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      {
        type: "command",
        text: trimmed,
        cwd: cwd,
        timestamp
      }
    ]);

    // Save to history
    setHistory((prev) => {
      const filtered = prev.filter((cmd) => cmd !== trimmed);
      return [trimmed, ...filtered].slice(0, 50);
    });
    setHistoryIndex(-1);
    setInput("");

    // Special client-side commands
    if (trimmed.toLowerCase() === "clear") {
      setLogs([]);
      return;
    }

    if (trimmed.toLowerCase() === "help") {
      setLogs((prev) => [
        ...prev,
        {
          type: "system",
          text: `المساعد السريع - Quick Terminal Helper:
- ls          : عرض الملفات والمجلدات في المسار الحالي
- cd <dir>    : تغيير المسار (مثال: cd src)
- pwd         : عرض مسار العمل الحالي
- git status  : فحص حالة مستودع Git والتغييرات غير الملتزمة
- git diff    : مراجعة التعديلات الحالية في الكود
- git log -n 5: عرض آخر 5 التزامات (Commits) في المستودع
- clear       : مسح شاشة الطرفية تماماً
- help        : عرض هذه المساعدة اللطيفة`,
          cwd: cwd,
          timestamp
        }
      ]);
      return;
    }

    setExecuting(true);

    try {
      const res = await fetch("/api/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed, cwd })
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.cwd) {
        setCwd(data.cwd);
      }

      if (data.stdout) {
        setLogs((prev) => [
          ...prev,
          {
            type: "output",
            text: data.stdout,
            cwd: data.cwd || cwd,
            timestamp
          }
        ]);
      }

      if (data.stderr) {
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            text: data.stderr,
            cwd: data.cwd || cwd,
            timestamp
          }
        ]);
      }

      // If both are empty
      if (!data.stdout && !data.stderr) {
        setLogs((prev) => [
          ...prev,
          {
            type: "system",
            text: "Command completed with exit code 0.",
            cwd: data.cwd || cwd,
            timestamp
          }
        ]);
      }

    } catch (error: any) {
      setLogs((prev) => [
        ...prev,
        {
          type: "error",
          text: `Execution failed: ${error.message || error}`,
          cwd,
          timestamp
        }
      ]);
    } finally {
      setExecuting(false);
      // Refocus input
      setTimeout(focusInput, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const quickCommands = [
    { label: "git status", cmd: "git status", desc: "Git Status" },
    { label: "git diff", cmd: "git diff", desc: "Git Diff" },
    { label: "ls -la", cmd: "ls -la", desc: "List Files" },
    { label: "pwd", cmd: "pwd", desc: "Current Path" },
    { label: "bitrise.yml", cmd: "cat bitrise.yml", desc: "View Config" },
    { label: "bot status", cmd: "curl -s http://localhost:3000/api/bot/state", desc: "Bot Status" },
    { label: "help", cmd: "help", desc: "Help" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[580px] text-slate-100 shadow-2xl overflow-hidden font-mono" id="interactive-terminal">
      {/* Terminal Title Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
          </div>
          <TerminalIcon className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold font-sans tracking-wide text-white">الطرفية التفاعلية - Interactive Workspace Bash</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-400 font-mono">
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>Path: </span>
          <span className="text-sky-300 font-bold">~/{cwd === "." ? "" : cwd}</span>
        </div>
      </div>

      {/* Quick shortcuts helper panel (perfect for mobile or fast dev checks) */}
      <div className="bg-slate-950/40 border-b border-slate-850 px-3 py-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-sans font-bold text-slate-500 mr-1 uppercase">أوامر سريعة:</span>
        {quickCommands.map((q, idx) => (
          <button
            key={idx}
            onClick={() => executeCommand(q.cmd)}
            disabled={executing}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:bg-slate-950 text-[10px] text-slate-300 hover:text-white rounded-md font-mono transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            title={q.desc}
          >
            <Play className="w-2.5 h-2.5 text-sky-400" />
            <span>{q.label}</span>
          </button>
        ))}
        <button
          onClick={() => executeCommand("clear")}
          className="ml-auto px-2 py-1 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/40 text-[10px] text-red-400 hover:text-red-300 rounded-md font-mono transition flex items-center gap-1"
          title="Clear Terminal Screen"
        >
          <Trash2 className="w-2.5 h-2.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Terminal Output logs Area */}
      <div 
        onClick={focusInput}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex flex-col gap-2.5 cursor-text text-xs leading-relaxed"
      >
        {logs.map((log, idx) => {
          if (log.type === "command") {
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="text-sky-400">visitor@alromimah</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-purple-400">~/{log.cwd === "." ? "" : log.cwd}</span>
                  <span className="text-slate-400">$</span>
                  <span className="text-white font-bold font-mono">{log.text}</span>
                </div>
              </div>
            );
          } else if (log.type === "error") {
            return (
              <div key={idx} className="bg-rose-950/25 border-l-2 border-rose-500 px-3 py-2 text-rose-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed rounded-r-lg">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>خطأ في التنفيذ - Execution Error:</span>
                </div>
                {log.text}
              </div>
            );
          } else if (log.type === "system") {
            return (
              <div key={idx} className="text-slate-400 whitespace-pre-wrap py-0.5 leading-snug border-b border-slate-850/40 pb-1.5">
                {log.text}
              </div>
            );
          } else {
            return (
              <div key={idx} className="text-slate-300 whitespace-pre-wrap pl-2 border-l border-slate-800 font-mono text-[11px] leading-relaxed">
                {log.text}
              </div>
            );
          }
        })}

        {/* Loading execution state */}
        {executing && (
          <div className="flex items-center gap-2 text-slate-500 text-[11px] animate-pulse py-1">
            <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
            <span>Running bash command...</span>
          </div>
        )}

        {/* Spacer for scroll */}
        <div ref={consoleEndRef} />
      </div>

      {/* Input Prompt Bar */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs shrink-0 select-none">
          <span className="text-sky-400">visitor@alromimah</span>
          <span className="text-slate-500">:</span>
          <span className="text-purple-400">~/{cwd === "." ? "" : cwd}</span>
          <span className="text-slate-400">$</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={executing}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-white font-mono text-xs caret-sky-400"
          placeholder="Type bash command and press Enter..."
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          onClick={() => executeCommand(input)}
          disabled={executing || !input.trim()}
          className="p-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg transition"
          title="Run Command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
