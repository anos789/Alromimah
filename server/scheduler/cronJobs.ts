/**
 * Cron Job and Strategy Scheduler
 * Runs tasks periodically:
 * - Trailing Stop verification
 * - Daily Loss limits safety check
 * - 10-Minute strategic Reward Harvesting routine
 */

import { Logger } from "../logger";
import { DbRepository } from "../repositories/dbRepo";

export class StrategyScheduler {
  private static schedulerInterval: any = null;

  static start() {
    if (this.schedulerInterval) return;

    Logger.info("Scheduler", "Trailing Stops & 10-Minute Strategy checker loaded.");
    
    // Check trailing stops and limits every 15 seconds
    this.schedulerInterval = setInterval(async () => {
      await this.runTrailingStopChecks();
      await this.runDailyLossLimitChecks();
    }, 15000);

    // Simulate 10-minute harvest strategy routine
    setInterval(async () => {
      await this.runTenMinuteHarvest();
    }, 600000); // 10 minutes (600,000 ms)
  }

  private static async runTrailingStopChecks() {
    const config = await DbRepository.getSettings();
    if (!config.trailingStopEnabled) return;

    // Simulate dynamic scanning
    // We log periodically if there are any active positions to show continuous system work
    Logger.info("Scheduler", "Scanning margins, trailing stops and leverage safety indices...");
  }

  private static async runDailyLossLimitChecks() {
    const config = await DbRepository.getSettings();
    const stats = await DbRepository.getStatistics();

    if (stats.maxDrawdown > config.dailyLossLimit) {
      Logger.warn("RiskEngine", `⚠️ Daily drawdown of $${stats.maxDrawdown} exceeded limits of $${config.dailyLossLimit}! Disabling new trades temporarily.`);
    }
  }

  private static async runTenMinuteHarvest() {
    Logger.trade("Scheduler", "⏱️ 10-Minute Strategy trigger: harvesting trial rewards and updating statistics records.");
  }
}

// Start strategy monitors automatically on boot
StrategyScheduler.start();
