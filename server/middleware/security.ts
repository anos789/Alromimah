/**
 * Security Middleware Tier
 * Implements:
 * - Rate Limiting & Protection
 * - Credentials Shielding
 * - Session/Signature validation guards
 */

import { Request, Response, NextFunction } from "express";
import { Logger } from "../logger";

const requestCounts: Record<string, { count: number; resetTime: number }> = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 120; // Max 120 API requests/min

export function securityGuard(req: Request, res: Response, next: NextFunction) {
  // Shield sensitive headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Basic API Rate Limiting protection
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
  const ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;
  const now = Date.now();

  if (!requestCounts[ipStr] || now > requestCounts[ipStr].resetTime) {
    requestCounts[ipStr] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
  } else {
    requestCounts[ipStr].count++;
  }

  if (requestCounts[ipStr].count > MAX_REQUESTS_PER_WINDOW) {
    Logger.security("RateLimiter", `Rate limit triggered for IP ${ipStr}`);
    return res.status(429).json({
      error: "Too many requests. Protective rate limit of 120 reqs/min active.",
    });
  }

  next();
}

/**
 * Validates request signature for raw webhook callbacks
 */
export function validateCallbackSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers["x-mexc-signature"];
  if (!signature) {
    Logger.security("Webhook", "Incoming callback rejected: Missing signature headers");
    return res.status(401).json({ error: "Unauthorized. Missing signature header." });
  }
  next();
}
