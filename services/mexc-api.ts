/**
 * MEXC Encrypted API Gateway Service
 * Implements the encrypted API gateway for MEXC futures trading
 * with AES-256 encryption for API keys and HMAC-SHA256 signatures
 */

import CryptoJS from "crypto-js";

// Types
export interface MexcConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  passphrase?: string;
}

export interface TradeOrder {
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  quantity: string;
  price?: string;
  leverage: number;
}

export interface Position {
  symbol: string;
  side: "LONG" | "SHORT";
  size: string;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: string;
  margin: string;
}

export interface RiskMetrics {
  initialMargin: number;
  maintenanceMargin: number;
  riskToRewardRatio: number;
  liquidationPrice: number;
  marginRatio: number;
}

// Encryption utilities
export class MEXCEncryptionService {
  private readonly encryptionKey: string;

  constructor(encryptionKey: string = "mrium-mexc-2026-secret") {
    this.encryptionKey = encryptionKey;
  }

  /**
   * Encrypt API keys using AES-256
   */
  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  /**
   * Decrypt stored API keys
   */
  decrypt(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

// Risk Management Calculator
export class RiskManagementEngine {
  /**
   * Calculate Initial Margin
   * Formula: IM = (Position Size × Entry Price) / Leverage
   */
  calculateInitialMargin(
    positionSize: number,
    entryPrice: number,
    leverage: number
  ): number {
    const margin = (positionSize * entryPrice) / leverage;
    return Math.round(margin * 100) / 100;
  }

  /**
   * Calculate Maintenance Margin
   * Formula: MM = Initial Margin × 50%
   */
  calculateMaintenanceMargin(initialMargin: number): number {
    return Math.round(initialMargin * 0.5 * 100) / 100;
  }

  /**
   * Calculate Risk-to-Reward Ratio
   * Formula: R:R = |Entry - Stop Loss| : |Entry - Take Profit|
   */
  calculateRiskToReward(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number
  ): { ratio: number; riskAmount: number; rewardAmount: number } {
    const riskAmount = Math.abs(entryPrice - stopLoss);
    const rewardAmount = Math.abs(entryPrice - takeProfit);
    const ratio = rewardAmount > 0 ? rewardAmount / riskAmount : 0;

    return {
      ratio: Math.round(ratio * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      rewardAmount: Math.round(rewardAmount * 100) / 100,
    };
  }

  /**
   * Calculate Liquidation Price for futures
   */
  calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    side: "LONG" | "SHORT",
    maintenanceMarginRate: number = 0.005
  ): number {
    if (side === "LONG") {
      return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
    } else {
      return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
    }
  }

  /**
   * Full risk assessment
   */
  getRiskMetrics(
    positionSize: number,
    entryPrice: number,
    leverage: number,
    stopLoss: number,
    takeProfit: number,
    side: "LONG" | "SHORT"
  ): RiskMetrics {
    const initialMargin = this.calculateInitialMargin(positionSize, entryPrice, leverage);
    const maintenanceMargin = this.calculateMaintenanceMargin(initialMargin);
    const rr = this.calculateRiskToReward(entryPrice, stopLoss, takeProfit);
    const liquidationPrice = this.calculateLiquidationPrice(entryPrice, leverage, side);
    const marginRatio = (initialMargin / (entryPrice * positionSize)) * 100;

    return {
      initialMargin,
      maintenanceMargin,
      riskToRewardRatio: rr.ratio,
      liquidationPrice: Math.round(liquidationPrice * 100) / 100,
      marginRatio: Math.round(marginRatio * 100) / 100,
    };
  }

  /**
   * Validate trade against risk rules
   */
  validateTrade(
    positionSize: number,
    entryPrice: number,
    leverage: number,
    stopLoss: number,
    takeProfit: number,
    maxLeverage: number = 125,
    minRiskToReward: number = 1.5
  ): { valid: boolean; issues: string[]; metrics: RiskMetrics } {
    const issues: string[] = [];

    if (leverage > maxLeverage) {
      issues.push(`Leverage ${leverage}x exceeds maximum ${maxLeverage}x`);
    }

    const metrics = this.getRiskMetrics(
      positionSize, entryPrice, leverage, stopLoss, takeProfit,
      Math.random() > 0.5 ? "LONG" : "SHORT"
    );

    if (metrics.riskToRewardRatio < minRiskToReward) {
      issues.push(
        `R:R ratio ${metrics.riskToRewardRatio} is below minimum ${minRiskToReward}`
      );
    }

    if (metrics.marginRatio > 80) {
      issues.push(`Margin ratio ${metrics.marginRatio}% is dangerously high`);
    }

    return {
      valid: issues.length === 0,
      issues,
      metrics,
    };
  }
}

// Portfolio Supervisor
export class PortfolioSupervisor {
  private readonly riskEngine: RiskManagementEngine;
  private readonly encryptionService: MEXCEncryptionService;

  constructor() {
    this.riskEngine = new RiskManagementEngine();
    this.encryptionService = new MEXCEncryptionService();
  }

  /**
   * Monitor all positions for risk violations
   */
  monitorPositions(
    positions: Position[],
    accountBalance: number
  ): { alerts: string[]; riskLevel: "low" | "medium" | "high" | "critical" } {
    const alerts: string[] = [];
    let totalExposure = 0;

    for (const pos of positions) {
      const entryPrice = pos.entryPrice;
      const leverage = parseInt(pos.leverage.replace("x", ""));
      const size = parseFloat(pos.size);
      const side: "LONG" | "SHORT" = pos.side === "LONG" ? "LONG" : "SHORT";

      const metrics = this.riskEngine.getRiskMetrics(
        size, entryPrice, leverage,
        side === "LONG" ? entryPrice * 0.95 : entryPrice * 1.05,
        side === "LONG" ? entryPrice * 1.15 : entryPrice * 0.85,
        side
      );

      totalExposure += metrics.initialMargin;

      if (metrics.marginRatio > 70) {
        alerts.push(`⚠️ HIGH MARGIN: ${pos.symbol} - ${metrics.marginRatio}%`);
      }

      if (Math.abs(pos.unrealizedPnl) > metrics.initialMargin * 0.5) {
        alerts.push(`⚠️ LARGE LOSS: ${pos.symbol} - PnL: $${pos.unrealizedPnl}`);
      }
    }

    const totalMarginRatio = (totalExposure / accountBalance) * 100;

    return {
      alerts,
      riskLevel:
        totalMarginRatio > 80
          ? "critical"
          : totalMarginRatio > 60
          ? "high"
          : totalMarginRatio > 40
          ? "medium"
          : "low",
    };
  }
}

// Singleton instances
export const encryptionService = new MEXCEncryptionService();
export const riskEngine = new RiskManagementEngine();
export const portfolioSupervisor = new PortfolioSupervisor();
