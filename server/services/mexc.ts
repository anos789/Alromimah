/**
 * MEXC Technical & Integration Service Tier
 * Features:
 * - HMAC-SHA256 authenticated API queries
 * - Intelligent Rate-limiting, Retry, Timeout, and Error Recovery
 * - Technical Analysis Indicators calculation: EMA, SMA, RSI, MACD, ATR, Bollinger Bands, VWAP
 */

import CryptoJS from "crypto-js";
import { Logger } from "../logger";

export interface IndicatorData {
  time: string;
  close: number;
  ema?: number;
  sma?: number;
  rsi?: number;
  macd?: { macdLine: number; signalLine: number; histogram: number };
  atr?: number;
  bollingerBands?: { upper: number; middle: number; lower: number };
  vwap?: number;
}

export class MexcService {
  /**
   * Helper to perform signed request with signature, retry and timeout
   */
  static async requestWithRetry(
    url: string,
    options: RequestInit = {},
    retries: number = 3,
    delayMs: number = 1000
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout as requested

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle Rate Limit (Status 429) as requested
      if (response.status === 429) {
        if (retries > 0) {
          const waitTime = delayMs * 2;
          Logger.warn("MEXC-API", `Rate limit hit (429). Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.requestWithRetry(url, options, retries - 1, waitTime);
        } else {
          throw new Error("MEXC Rate limit exceeded. Maximum retries completed.");
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Auto Error Recovery and Retry logic
      if (retries > 0) {
        Logger.warn("MEXC-API", `Request failed: ${error.message}. Recovering and retrying...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return this.requestWithRetry(url, options, retries - 1, delayMs * 1.5);
      }
      
      Logger.error("MEXC-API", `Final request failure after retries: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates signed MEXC request headers
   */
  static generateHeaders(apiKey: string, secretKey: string, params: Record<string, string>): Record<string, string> {
    const timestamp = Date.now().toString();
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    
    const signaturePayload = `${timestamp}${queryString}`;
    const signature = CryptoJS.HmacSHA256(signaturePayload, secretKey).toString(CryptoJS.enc.Hex);

    return {
      "X-MEXC-APIKEY": apiKey,
      "X-MEXC-TIMESTAMP": timestamp,
      "X-MEXC-SIGNATURE": signature,
      "Content-Type": "application/json",
    };
  }

  /**
   * Indicators Engine: Calculates Technical Indicators based on candle history
   */
  static calculateIndicators(candles: { time: string; open: number; close: number; high: number; low: number; volume: number }[]): IndicatorData[] {
    if (candles.length < 20) {
      return candles.map(c => ({ time: c.time, close: c.close }));
    }

    const closes = candles.map(c => c.close);
    const results: IndicatorData[] = candles.map(c => ({ time: c.time, close: c.close }));

    // 1. SMA (Period 14)
    const smaPeriod = 14;
    for (let i = smaPeriod - 1; i < closes.length; i++) {
      const sum = closes.slice(i - smaPeriod + 1, i + 1).reduce((s, x) => s + x, 0);
      results[i].sma = Math.round((sum / smaPeriod) * 100) / 100;
    }

    // 2. EMA (Period 14)
    const emaPeriod = 14;
    const k = 2 / (emaPeriod + 1);
    let prevEma = results[smaPeriod - 1].sma || closes[0];
    results[smaPeriod - 1].ema = prevEma;
    for (let i = smaPeriod; i < closes.length; i++) {
      const curEma = closes[i] * k + prevEma * (1 - k);
      results[i].ema = Math.round(curEma * 100) / 100;
      prevEma = curEma;
    }

    // 3. RSI (Period 14)
    const rsiPeriod = 14;
    let avgGain = 0;
    let avgLoss = 0;

    // First RSI value
    for (let i = 1; i <= rsiPeriod; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) avgGain += change;
      else avgLoss += Math.abs(change);
    }
    avgGain /= rsiPeriod;
    avgLoss /= rsiPeriod;

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    results[rsiPeriod].rsi = Math.round((100 - 100 / (1 + rs)) * 100) / 100;

    for (let i = rsiPeriod + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      avgGain = (avgGain * 13 + gain) / rsiPeriod;
      avgLoss = (avgLoss * 13 + loss) / rsiPeriod;

      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      results[i].rsi = Math.round((100 - 100 / (1 + rs)) * 100) / 100;
    }

    // 4. Bollinger Bands (20, 2)
    const bbPeriod = 20;
    const bbMultiplier = 2;
    for (let i = bbPeriod - 1; i < closes.length; i++) {
      const slice = closes.slice(i - bbPeriod + 1, i + 1);
      const sma = slice.reduce((s, x) => s + x, 0) / bbPeriod;
      const variance = slice.reduce((s, x) => s + Math.pow(x - sma, 2), 0) / bbPeriod;
      const stdDev = Math.sqrt(variance);

      results[i].bollingerBands = {
        upper: Math.round((sma + bbMultiplier * stdDev) * 100) / 100,
        middle: Math.round(sma * 100) / 100,
        lower: Math.round((sma - bbMultiplier * stdDev) * 100) / 100,
      };
    }

    // 5. ATR (Period 14)
    const atrPeriod = 14;
    let trs: number[] = [candles[0].high - candles[0].low];
    for (let i = 1; i < candles.length; i++) {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      trs.push(Math.max(hl, hc, lc));
    }
    let prevAtr = trs.slice(0, atrPeriod).reduce((s, x) => s + x, 0) / atrPeriod;
    results[atrPeriod - 1].atr = Math.round(prevAtr * 100) / 100;
    for (let i = atrPeriod; i < candles.length; i++) {
      const curAtr = (prevAtr * 13 + trs[i]) / atrPeriod;
      results[i].atr = Math.round(curAtr * 100) / 100;
      prevAtr = curAtr;
    }

    // 6. MACD (12, 26, 9)
    const ema12 = this.calcEmaList(closes, 12);
    const ema26 = this.calcEmaList(closes, 26);
    const macdLines: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      macdLines.push(ema12[i] - ema26[i]);
    }
    const signalLines = this.calcEmaList(macdLines, 9);
    for (let i = 0; i < closes.length; i++) {
      results[i].macd = {
        macdLine: Math.round(macdLines[i] * 100) / 100,
        signalLine: Math.round(signalLines[i] * 100) / 100,
        histogram: Math.round((macdLines[i] - signalLines[i]) * 100) / 100,
      };
    }

    // 7. VWAP
    let cumVolumePrice = 0;
    let cumVolume = 0;
    for (let i = 0; i < candles.length; i++) {
      const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
      cumVolumePrice += typicalPrice * candles[i].volume;
      cumVolume += candles[i].volume;
      results[i].vwap = Math.round((cumVolumePrice / (cumVolume || 1)) * 100) / 100;
    }

    // Backfill empty initial states with sane estimates
    for (let i = 0; i < results.length; i++) {
      if (!results[i].sma) results[i].sma = results[i].close;
      if (!results[i].ema) results[i].ema = results[i].close;
      if (!results[i].rsi) results[i].rsi = 50.0;
      if (!results[i].atr) results[i].atr = results[i].close * 0.01;
      if (!results[i].bollingerBands) {
        results[i].bollingerBands = {
          upper: results[i].close * 1.02,
          middle: results[i].close,
          lower: results[i].close * 0.98,
        };
      }
      if (!results[i].macd) {
        results[i].macd = { macdLine: 0, signalLine: 0, histogram: 0 };
      }
      if (!results[i].vwap) results[i].vwap = results[i].close;
    }

    return results;
  }

  private static calcEmaList(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  }
}
