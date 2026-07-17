import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { MexcController } from "./controllers/mexcController";
import { Logger } from "./logger";
import { DbRepository } from "./repositories/dbRepo";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  mexc: router({
    getConfig: publicProcedure.query(async () => {
      return await MexcController.getConfig();
    }),

    updateConfig: publicProcedure
      .input(
        z.object({
          maxLeverage: z.number().optional(),
          stopLossPercent: z.number().optional(),
          takeProfitPercent: z.number().optional(),
          trailingStopEnabled: z.boolean().optional(),
          trailingStopPercent: z.number().optional(),
          dailyLossLimit: z.number().optional(),
          maxDrawdownPercent: z.number().optional(),
          supervisorEnabled: z.boolean().optional(),
          apiKey: z.string().optional(),
          secretKey: z.string().optional(),
          ipAddress: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await MexcController.updateConfig(input);
      }),

    getStats: publicProcedure.query(async () => {
      return await MexcController.getAccountStats();
    }),

    getOrders: publicProcedure.query(async () => {
      return await DbRepository.getOrders();
    }),

    placeOrder: publicProcedure
      .input(
        z.object({
          pair: z.string(),
          side: z.enum(["long", "short"]),
          type: z.enum(["LIMIT", "MARKET"]),
          price: z.number(),
          size: z.string(),
          stopLoss: z.number().optional(),
          takeProfit: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await MexcController.placeProtectedOrder({
          pair: input.pair,
          side: input.side,
          type: input.type,
          price: input.price,
          size: input.size,
          stopLoss: input.stopLoss,
          takeProfit: input.takeProfit,
        });
      }),

    getLogs: publicProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          level: z.string().optional(),
        })
      )
      .query(({ input }) => {
        return Logger.getLogs(input.limit, input.level as any);
      }),

    clearLogs: publicProcedure.mutation(() => {
      Logger.clearLogs();
      return { success: true };
    }),

    getIndicatorChart: publicProcedure
      .input(
        z.object({
          symbol: z.string().default("BTC_USDT"),
          candleCount: z.number().default(50),
        })
      )
      .query(({ input }) => {
        // Generate simulated dynamic candles to apply indicators calculations
        const candles: { time: string; open: number; close: number; high: number; low: number; volume: number }[] = [];
        let price = 66842.13;
        const now = new Date();

        for (let i = input.candleCount - 1; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 3600000);
          const hourStr = `${time.getHours().toString().padStart(2, "0")}:00`;
          const change = (Math.random() - 0.48) * 600;
          const open = price;
          const close = open + change;
          const high = Math.max(open, close) + Math.random() * 300;
          const low = Math.min(open, close) - Math.random() * 300;
          const volume = Math.random() * 2000 + 400;

          candles.push({ time: hourStr, open, close, high, low, volume });
          price = close;
        }

        return MexcController.getIndicatorsData(candles);
      }),
  }),
});

export type AppRouter = typeof appRouter;
