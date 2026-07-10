import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Svg, Rect, Line, Text as SvgText } from "react-native-svg";
import { cn } from "@/lib/utils";

interface Candle {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface CandlestickChartProps {
  candles: Candle[];
  currentPrice: number;
  className?: string;
}

export function CandlestickChart({
  candles,
  currentPrice,
  className,
}: CandlestickChartProps) {
  const chartData = useMemo(() => {
    if (candles.length === 0) return [];

    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice;

    const maxVolume = Math.max(...candles.map((c) => c.volume));

    return candles.map((candle, index) => {
      const x = (index / (candles.length - 1 || 1)) * 100;
      const yHigh = ((maxPrice - candle.high) / priceRange) * 70;
      const yLow = ((maxPrice - candle.low) / priceRange) * 70;
      const yOpen = ((maxPrice - candle.open) / priceRange) * 70;
      const yClose = ((maxPrice - candle.close) / priceRange) * 70;

      const isGreen = candle.close >= candle.open;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);
      const volumeHeight = (candle.volume / maxVolume) * 15;

      return {
        x,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        isGreen,
        volumeHeight,
        volumeY: 85 - volumeHeight,
        time: candle.time,
        price: candle.close,
      };
    });
  }, [candles]);

  const priceLevels = useMemo(() => {
    if (candles.length === 0) return [];
    const prices = candles.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const step = (maxPrice - minPrice) / 5;

    return Array.from({ length: 6 }, (_, i) => ({
      price: maxPrice - step * i,
      y: i * 14,
    }));
  }, [candles]);

  if (candles.length === 0) {
    return (
      <View className={cn("h-52 items-center justify-center", className)}>
        <Text className="text-muted">No data available</Text>
      </View>
    );
  }

  const priceLevel = priceLevels[0];

  return (
    <View className={cn("w-full", className)}>
      {/* Price scale */}
      <View className="absolute right-0 top-0 bottom-0 w-12 z-10">
        {priceLevels.map((level, i) => (
          <Text
            key={i}
            className="text-[10px] text-muted text-right px-1"
            style={{ position: "absolute", top: `${level.y}%`, right: 2 }}
          >
            {level.price.toFixed(2)}
          </Text>
        ))}
      </View>

      {/* Chart SVG */}
      <View className="w-full h-44 mt-4">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {priceLevels.map((level, i) => (
            <Line
              key={i}
              x1="0"
              y1={level.y}
              x2="100"
              y2={level.y}
              stroke="#334155"
              strokeWidth="0.2"
              strokeDasharray="2,2"
            />
          ))}

          {/* Current price line */}
          {priceLevel && (
            <Line
              x1="0"
              y1={((priceLevel.price - priceLevel.price) / (priceLevels[0].price - priceLevels[priceLevels.length - 1].price)) * 70}
              x2="100"
              y2={((priceLevel.price - priceLevel.price) / (priceLevels[0].price - priceLevels[priceLevels.length - 1].price)) * 70}
              stroke={currentPrice >= candles[0]?.open ? "#22c55e" : "#ef4444"}
              strokeWidth="0.3"
              strokeDasharray="4,2"
            />
          )}

          {/* Candles */}
          {chartData.map((d, i) => (
            <React.Fragment key={i}>
              {/* Wick */}
              <Line
                x1={d.x}
                y1={d.yHigh}
                x2={d.x}
                y2={d.yLow}
                stroke={d.isGreen ? "#22c55e" : "#ef4444"}
                strokeWidth="0.3"
              />
              {/* Body */}
              <Rect
                x={d.x - 1.5}
                y={d.bodyTop}
                width="3"
                height={d.bodyHeight}
                fill={d.isGreen ? "#22c55e" : "#ef4444"}
              />
              {/* Volume bar */}
              <Rect
                x={d.x - 1.5}
                y={d.volumeY}
                width="3"
                height={d.volumeHeight}
                fill={d.isGreen ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}
              />
            </React.Fragment>
          ))}
        </Svg>
      </View>

      {/* Time labels */}
      <View className="flex-row justify-between px-4 mt-1">
        {[0, 2, 4, 6, 8].map((idx) => (
          <Text key={idx} className="text-[9px] text-muted">
            {chartData[idx]?.time || ""}
          </Text>
        ))}
      </View>
    </View>
  );
}

// Generate sample candle data
export function generateSampleCandles(count: number = 24): Candle[] {
  const candles: Candle[] = [];
  let price = 66842.13;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    const hourStr = `${time.getHours().toString().padStart(2, "0")}:00`;
    const change = (Math.random() - 0.48) * 500;
    const open = price;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;
    const volume = Math.random() * 1000 + 200;

    candles.push({ time: hourStr, open, close, high, low, volume });
    price = close;
  }

  return candles;
}
