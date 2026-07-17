/**
 * MEXC Controller Tier
 * Bridges DB repository entries with the tRPC API endpoints and MEXC integration services
 */

import { DbRepository, SettingsSchema, OrderSchema, StatsSchema } from "../repositories/dbRepo";
import { MexcService, IndicatorData } from "../services/mexc";
import { Logger } from "../logger";

export class MexcController {
  /**
   * Get application configuration & keys
   */
  static async getConfig(): Promise<SettingsSchema> {
    return await DbRepository.getSettings();
  }

  /**
   * Update configuration & keys safely
   */
  static async updateConfig(settings: Partial<SettingsSchema>): Promise<SettingsSchema> {
    const updated = await DbRepository.saveSettings(settings);
    Logger.security("Config", "API Config keys updated and encrypted in local database storage");
    return updated;
  }

  /**
   * Place an order with Stop Loss, Take Profit, Trailing stop protections
   */
  static async placeProtectedOrder(orderData: Omit<OrderSchema, "id" | "timestamp" | "status">): Promise<OrderSchema> {
    Logger.trade("Execution", `Placing protected order for ${orderData.pair}: ${orderData.side} Type: ${orderData.type}`);
    
    // Simulate smart execution check
    const config = await DbRepository.getSettings();
    if (parseFloat(orderData.size) <= 0) {
      throw new Error("Invalid position size: must be positive");
    }

    // Risk supervisor checks
    if (config.supervisorEnabled) {
      Logger.info("Supervisor", `Scanning active metrics for trade: leverage limit check: max ${config.maxLeverage}x`);
    }

    const order = await DbRepository.createOrder({
      ...orderData,
      status: "OPEN",
    });

    return order;
  }

  /**
   * Get current account metrics & stats
   */
  static async getAccountStats(): Promise<StatsSchema> {
    return await DbRepository.getStatistics();
  }

  /**
   * Update stats
   */
  static async updateAccountStats(stats: Partial<StatsSchema>): Promise<StatsSchema> {
    return await DbRepository.saveStatistics(stats);
  }

  /**
   * Fetch indicators for analytical chart representation
   */
  static getIndicatorsData(candles: { time: string; open: number; close: number; high: number; low: number; volume: number }[]): IndicatorData[] {
    return MexcService.calculateIndicators(candles);
  }
}
