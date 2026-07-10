/**
 * Rewards Harvester Service
 * Collects rewards every 10 minutes based on trading activity
 */

export interface Reward {
  id: string;
  type: "trade" | "streak" | "volume" | "daily";
  amount: number;
  timestamp: Date;
  asset: string;
}

export class RewardsHarvester {
  private harvestInterval: number = 600000; // 10 minutes in ms
  private lastHarvest: Date | null = null;
  private rewards: Reward[] = [];

  /**
   * Calculate reward based on trade activity
   */
  calculateReward(
    tradeCount: number,
    totalVolume: number,
    streakDays: number,
    winRate: number
  ): number {
    // Base reward from trades
    const tradeReward = tradeCount * 0.1;

    // Volume bonus
    const volumeReward = Math.min(totalVolume / 10000, 1);

    // Streak bonus
    const streakReward = streakDays * 0.5;

    // Win rate bonus
    const winRateBonus = winRate > 0.7 ? 0.5 : winRate > 0.5 ? 0.2 : 0;

    return Math.round((tradeReward + volumeReward + streakReward + winRateBonus) * 100) / 100;
  }

  /**
   * Check if harvest is ready
   */
  canHarvest(): boolean {
    if (!this.lastHarvest) return true;
    const elapsed = Date.now() - this.lastHarvest.getTime();
    return elapsed >= this.harvestInterval;
  }

  /**
   * Get time until next harvest
   */
  timeUntilHarvest(): number {
    if (!this.lastHarvest) return 0;
    const elapsed = Date.now() - this.lastHarvest.getTime();
    return Math.max(0, this.harvestInterval - elapsed);
  }

  /**
   * Harvest rewards
   */
  harvest(tradeCount: number, totalVolume: number, streakDays: number, winRate: number): Reward[] {
    if (!this.canHarvest()) return [];

    const rewardAmount = this.calculateReward(tradeCount, totalVolume, streakDays, winRate);
    const lastHarvest = this.lastHarvest;
    this.lastHarvest = new Date();

    const newReward: Reward = {
      id: `reward-${Date.now()}`,
      type: "trade",
      amount: rewardAmount,
      timestamp: new Date(),
      asset: "USDT",
    };

    this.rewards.push(newReward);

    // Additional bonus rewards
    const bonusRewards: Reward[] = [];
    if (streakDays > 0 && streakDays % 7 === 0) {
      bonusRewards.push({
        id: `streak-${Date.now()}`,
        type: "streak",
        amount: streakDays * 0.1,
        timestamp: new Date(),
        asset: "USDT",
      });
    }

    return [newReward, ...bonusRewards];
  }

  /**
   * Get total rewards earned
   */
  getTotalRewards(): number {
    return this.rewards.reduce((sum, r) => sum + r.amount, 0);
  }

  /**
   * Get rewards history
   */
  getRewards(): Reward[] {
    return this.rewards;
  }
}

export const rewardsHarvester = new RewardsHarvester();
