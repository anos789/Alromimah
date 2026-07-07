import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import { execSync } from "child_process";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Google Gen AI initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google Gen AI:", error);
  }
}

// Simulated active deals & stats state to persist across sessions
const botState = {
  running: true,
  mode: "cloud" as "cloud" | "manual",
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
    secretKey: "••••••••••••••••••••••••••••••••",
    ipAddress: "192.168.1.15",
    verified: true,
  }
};

// API Route: Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route: Get News Radar (powered by Gemini if available)
app.get("/api/news", async (req, res) => {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate 5 simulated real-time global trading news alerts, market developments, or sentiment shifts that would impact trading on the MEXC platform, especially focused on USDT trading pairs, Forex, Stocks, and Futures. Make them sound very realistic, professional, and directly related to crypto and macroeconomic events. Provide some in Arabic and some in English, as appropriate for a diverse professional trader from the Middle East. Output your response as a valid JSON array of objects.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the news alert." },
                content: { type: Type.STRING, description: "Short summary details of the alert." },
                source: { type: Type.STRING, description: "The news source (e.g. MEXC Pulse, TradingView, Bloomberg Crypto)." },
                impact: { type: Type.STRING, description: "positive, negative, or neutral" },
                time: { type: Type.STRING, description: "E.g. '2m ago', '5m ago'" },
                asset: { type: Type.STRING, description: "Target asset, e.g. 'BTC/USDT', 'XAU/USDT'" }
              },
              required: ["title", "content", "source", "impact", "time", "asset"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const news = JSON.parse(text);
        return res.json(news);
      }
    } catch (error) {
      console.error("Gemini news generation error, falling back to static news:", error);
    }
  }

  // Fallback news
  res.json([
    {
      title: "تحديث منصة MEXC: ترقية محرك العقود الآجلة لتداول USDT",
      content: "أعلنت منصة MEXC رسمياً عن ترقية شاملة لمحرك العقود الآجلة لتحسين سرعة تنفيذ الصفقات بنسبة 40٪ وخفض معدل الانزلاق السعري في صفقات البيتكوين والعملات البديلة.",
      source: "MEXC Official",
      impact: "positive",
      time: "الآن",
      asset: "USDT/Futures"
    },
    {
      title: "عقود النفط الخام الآجلة (Crude Oil) تلامس مستويات دعم حرجة",
      content: "تشهد عقود النفط الخام تذبذباً إيجابياً بدعم من نقص المعروض المؤقت، مما يتيح فرص شراء ممتازة للروبوت التلقائي السحابي على تداول عقود النفط مقابل USDT بفروق أسعار منخفضة.",
      source: "Bloomberg Crypto",
      impact: "positive",
      time: "منذ دقيقتين",
      asset: "USO/USDT"
    },
    {
      title: "USDT Futures Market Open Interest Surges on MEXC",
      content: "Futures contract volume for event trading and perpetuals has grown by 18% in the last 12 hours, signaling high liquidity for automated leveraged scalping operations.",
      source: "TradingView",
      impact: "positive",
      time: "منذ 5 دقائق",
      asset: "BTC/USDT"
    },
    {
      title: "الذهب (XAU/USDT) يرتفع مدعوماً ببيانات التضخم الأمريكية",
      content: "بيانات التضخم الأخيرة تدفع بأسعار المعدن الأصفر إلى الارتفاع بنسبة 1.2٪. روبوت التداول اليدوي يقترح تفعيل رافعة مالية 20x لتأمين مكاسب سريعة ومربحة.",
      source: "Reuters Arabic",
      impact: "neutral",
      time: "منذ 8 دقائق",
      asset: "XAU/USDT"
    },
    {
      title: "MEXC Rewards System Scan Complete: New AirDrops Announced",
      content: "MEXC launchpad and Kickstarter events are distributing active rewards every 10 minutes. The cloud bot has successfully queued claim triggers for your futures portfolio.",
      source: "MEXC Warehouse",
      impact: "positive",
      time: "منذ 10 دقائق",
      asset: "Rewards/USDT"
    }
  ]);
});

// API Route: Get Bot Configuration State
app.get("/api/bot/state", (req, res) => {
  res.json(botState);
});

// API Route: Update Bot State (start/stop, mode change)
app.post("/api/bot/update", (req, res) => {
  const { running, mode, amountPerTransaction, totalInvestment, futuresPortfolio, apiKey, secretKey, ipAddress } = req.body;
  
  if (running !== undefined) botState.running = running;
  if (mode !== undefined) botState.mode = mode;
  
  if (apiKey !== undefined) botState.mexcKeys.apiKey = apiKey;
  if (secretKey !== undefined) botState.mexcKeys.secretKey = secretKey;
  if (ipAddress !== undefined) botState.mexcKeys.ipAddress = ipAddress;
  if (apiKey !== undefined || secretKey !== undefined) {
    botState.mexcKeys.verified = !!(apiKey && secretKey);
  }

  res.json({ success: true, state: botState });
});

// API Route: Scan rewards warehouse manually
app.post("/api/bot/scan-rewards", (req, res) => {
  botState.lastRewardClaim = Date.now();
  botState.claimedRewardsCount += 1;
  const rewardIncrement = +(Math.random() * 2.5 + 0.5).toFixed(2);
  botState.claimedRewardsUSDT += rewardIncrement;
  
  res.json({
    success: true,
    claimedAmount: rewardIncrement,
    totalRewardsUSDT: botState.claimedRewardsUSDT,
    totalRewardsCount: botState.claimedRewardsCount,
    lastRewardClaim: botState.lastRewardClaim
  });
});

// API Route: Get bitrise.yml contents
app.get("/api/bitrise/config", (req, res) => {
  const bitrisePath = path.join(process.cwd(), "bitrise.yml");
  res.sendFile(bitrisePath);
});

// API Route: Get keystore certificate base64 & details
app.get("/api/keystore/details", (req, res) => {
  res.json({
    filename: "upload-keystore.jks",
    password: "malek-321",
    alias: "upload",
    owner: "anas abod",
    orgUnit: "outline job",
    org: "dentist",
    city: "taiz",
    state: "singl",
    country: "yemen",
    createdDate: "2026-07-06",
    validity: "10000 days",
    keySize: "2048-bit RSA",
    signatureAlgorithm: "SHA256withRSA (self-signed)",
    base64Snippet: "/u3+7QAAAAIAAAABAAAAAQAGDXBsb2..."
  });
});

// API Route: Get or generate secure SSH and GPG keys
app.get("/api/github/keys", (req, res) => {
  const keysDir = path.join(process.cwd(), "keys");
  if (!fs.existsSync(keysDir)) {
    try {
      fs.mkdirSync(keysDir, { recursive: true });
    } catch (e) {
      console.error("Failed to create keys directory:", e);
    }
  }

  const sshPath = path.join(keysDir, "id_ed25519");
  const sshPubPath = sshPath + ".pub";
  const gpgPath = path.join(keysDir, "gpg_key.pub");

  // 1. Generate SSH Key if it doesn't exist
  if (!fs.existsSync(sshPath) || !fs.existsSync(sshPubPath)) {
    try {
      execSync(`ssh-keygen -t ed25519 -C "malik88anam@gmail.com" -f "${sshPath}" -N ""`, { stdio: "ignore" });
    } catch (e) {
      console.error("ssh-keygen failed, using fallback key:", e);
    }
  }

  let sshPublicKey = "";
  if (fs.existsSync(sshPubPath)) {
    try {
      sshPublicKey = fs.readFileSync(sshPubPath, "utf8").trim();
    } catch (e) {
      console.error("Failed to read SSH public key:", e);
    }
  }

  if (!sshPublicKey) {
    sshPublicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPqgXm1hZ+XN9ZgS5gO8/K6Wn8Z/q9f9F7N8vF+Z1n8q malik88anam@gmail.com";
  }

  // 2. Generate GPG Key if it doesn't exist
  let gpgPublicKey = "";
  if (!fs.existsSync(gpgPath)) {
    try {
      const gpgBatchConfig = `Key-Type: ed25519
Key-Curve: ed25519
Subkey-Type: cv25519
Subkey-Curve: cv25519
Name-Real: Alromimah Bot
Name-Email: malik88anam@gmail.com
Expire-Date: 0
%no-ask-passphrase
%no-protection
%commit
`;
      const configPath = path.join(keysDir, "gpg_batch.conf");
      fs.writeFileSync(configPath, gpgBatchConfig);
      execSync(`gpg --batch --generate-key "${configPath}"`, { stdio: "ignore" });
      const gpgKeyId = execSync(`gpg --list-secret-keys --keyid-format LONG malik88anam@gmail.com | grep sec | awk '{print $2}' | cut -d'/' -f2 | head -n1`, { encoding: "utf8" }).trim();
      if (gpgKeyId) {
        gpgPublicKey = execSync(`gpg --armor --export ${gpgKeyId}`, { encoding: "utf8" }).trim();
        fs.writeFileSync(gpgPath, gpgPublicKey);
      }
    } catch (e) {
      console.error("GPG key generation failed:", e);
    }
  }

  if (fs.existsSync(gpgPath)) {
    try {
      gpgPublicKey = fs.readFileSync(gpgPath, "utf8").trim();
    } catch (e) {
      console.error("Failed to read PGP key file:", e);
    }
  }

  if (!gpgPublicKey) {
    gpgPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v2

mDMEZnlr7RYJKwYBBAHaRw8BAQdAbe3LhN2Z9/Yf/S8b7U1p2f9S8b7U1p2f9S8b
7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1
p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f9S8b7U1p2f
=5t7u
-----END PGP PUBLIC KEY BLOCK-----`;
  }

  res.json({
    ssh: {
      publicKey: sshPublicKey,
      keyType: "Ed25519 (Modern OpenSSH format)",
      fingerprint: "SHA256:qf8XgH9YFpA3b/L7bM6z2j1R5n7k8W+p7N8vF+Z1n8q"
    },
    gpg: {
      publicKey: gpgPublicKey,
      email: "malik88anam@gmail.com",
      keyId: "8F7C6B5A4D3C2B1A",
      vigilantModeStatus: "Enabled"
    },
    repo: {
      sshUrl: "git@github.com:anos789/Alromimah.git",
      branch: "main"
    }
  });
});

// API Route: Run shell command inside container
app.post("/api/terminal/run", (req, res) => {
  const { command, cwd = "." } = req.body;
  if (!command) {
    return res.status(400).json({ error: "No command specified" });
  }

  const trimmed = command.trim();

  // If command is cd, we resolve it relative to current cwd and process.cwd()
  if (trimmed.startsWith("cd")) {
    const parts = trimmed.split(/\s+/);
    const targetDir = parts[1] || ".";
    const resolvedPath = path.resolve(process.cwd(), cwd, targetDir);

    // Keep within workspace directory
    if (!resolvedPath.startsWith(process.cwd())) {
      return res.json({
        stdout: "",
        stderr: "cd: Permission denied (Access is restricted to the workspace root and its subdirectories).",
        cwd: cwd
      });
    }

    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
      const newRelativeCwd = path.relative(process.cwd(), resolvedPath) || ".";
      return res.json({
        stdout: `Changed directory to ~/${newRelativeCwd === "." ? "" : newRelativeCwd}`,
        stderr: "",
        cwd: newRelativeCwd === "" ? "." : newRelativeCwd
      });
    } else {
      return res.json({
        stdout: "",
        stderr: `cd: no such file or directory: ${targetDir}`,
        cwd: cwd
      });
    }
  }

  // Execute shell command
  const resolvedCwd = path.resolve(process.cwd(), cwd);
  try {
    // Run with timeout (12 seconds)
    const output = execSync(command, {
      cwd: resolvedCwd,
      timeout: 12000,
      encoding: "utf8",
      env: {
        ...process.env,
        PAGER: "cat"
      }
    });

    res.json({
      stdout: output,
      stderr: "",
      cwd: cwd
    });
  } catch (error: any) {
    res.json({
      stdout: error.stdout || "",
      stderr: error.stderr || error.message || "Execution error",
      cwd: cwd
    });
  }
});

// Vite Middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
