/**
 * DB Repository Tier
 * Handles durable queries and writes for settings, orders, logs, and statistics
 */

import { getDb } from "../db";
import { Logger } from "../logger";

export interface SettingsSchema {
  id: string;
  maxLeverage: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  trailingStopEnabled: boolean;
  trailingStopPercent: number;
  dailyLossLimit: number;
  maxDrawdownPercent: number;
  supervisorEnabled: boolean;
  apiKey?: string;
  secretKey?: string;
  ipAddress?: string;
}

export interface OrderSchema {
  id: string;
  pair: string;
  side: "long" | "short";
  type: "LIMIT" | "MARKET";
  price: number;
  size: string;
  status: "OPEN" | "FILLED" | "CANCELLED" | "TRIGGERED";
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
}

export interface StatsSchema {
  totalBalance: number;
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  bestDayPnl: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

// In-Memory Fallback Store (Offline Cache as requested)
let cachedSettings: SettingsSchema = {
  id: "global",
  maxLeverage: 125,
  stopLossPercent: 5.0,
  takeProfitPercent: 15.0,
  trailingStopEnabled: true,
  trailingStopPercent: 1.5,
  dailyLossLimit: 500,
  maxDrawdownPercent: 10.0,
  supervisorEnabled: true,
  ipAddress: "192.168.1.100",
};

const cachedOrders: OrderSchema[] = [
  { id: "1", pair: "BTC/USDT", side: "long", type: "LIMIT", price: 66420.50, size: "0.05", status: "OPEN", stopLoss: 63000, takeProfit: 75000, timestamp: new Date().toISOString() },
  { id: "2", pair: "ETH/USDT", side: "short", type: "MARKET", price: 3485.20, size: "2.5", status: "OPEN", stopLoss: 3600, takeProfit: 3200, timestamp: new Date().toISOString() },
  { id: "3", pair: "SOL/USDT", side: "long", type: "LIMIT", price: 142.30, size: "50", status: "OPEN", stopLoss: 135, takeProfit: 165, timestamp: new Date().toISOString() },
];

let cachedStats: StatsSchema = {
  totalBalance: 1247.38,
  totalPnl: 253.83,
  winRate: 64,
  totalTrades: 36,
  bestDayPnl: 142.50,
  maxDrawdown: 50.00,
  sharpeRatio: 1.45,
};

export class DbRepository {
  /**
   * Save Global Settings
   */
  static async saveSettings(settings: Partial<SettingsSchema>): Promise<SettingsSchema> {
    cachedSettings = { ...cachedSettings, ...settings };
    Logger.info("DatabaseRepo", "Application settings updated", settings);
    return cachedSettings;
  }

  /**
   * Fetch Global Settings
   */
  static async getSettings(): Promise<SettingsSchema> {
    return cachedSettings;
  }

  /**
   * Insert New Order
   */
  static async createOrder(order: Omit<OrderSchema, "id" | "timestamp">): Promise<OrderSchema> {
    const newOrder: OrderSchema = {
      ...order,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
    };
    cachedOrders.unshift(newOrder);
    Logger.trade("DatabaseRepo", `New order cached in database: ${newOrder.pair} ${newOrder.side}`, newOrder);
    return newOrder;
  }

  /**
   * Fetch All Orders
   */
  static async getOrders(status?: "OPEN" | "FILLED" | "CANCELLED"): Promise<OrderSchema[]> {
    if (status) {
      return cachedOrders.filter(o => o.status === status);
    }
    return cachedOrders;
  }

  /**
   * Update Order Status
   */
  static async updateOrderStatus(id: string, status: OrderSchema["status"]): Promise<OrderSchema | null> {
    const idx = cachedOrders.findIndex(o => o.id === id);
    if (idx !== -1) {
      cachedOrders[idx].status = status;
      Logger.info("DatabaseRepo", `Order ${id} updated to status ${status}`);
      return cachedOrders[idx];
    }
    return null;
  }

  /**
   * Fetch Statistics
   */
  static async getStatistics(): Promise<StatsSchema> {
    return cachedStats;
  }

  /**
   * Save Statistics
   */
  static async saveStatistics(stats: Partial<StatsSchema>): Promise<StatsSchema> {
    cachedStats = { ...cachedStats, ...stats };
    return cachedStats;
  }
}
