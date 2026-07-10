import React, { useState, useEffect } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function RewardsHarvester() {
  const colors = useColors();
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [progress, setProgress] = useState(new Animated.Value(1));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reset to 10 minutes and animate
          const anim = Animated.timing(progress, {
            toValue: 0,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          });
          anim.start(() => {
            progress.setValue(1);
            Animated.timing(progress, {
              toValue: 1,
              duration: 0,
              useNativeDriver: false,
            }).start();
          });
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <View className="bg-card-bg rounded-xl p-4 border border-border">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center">
            <Text className="text-lg">🎁</Text>
          </View>
          <View>
            <Text className="text-sm font-semibold text-foreground">Rewards</Text>
            <Text className="text-[10px] text-muted">
              Complete more trades to earn rewards
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-[10px] text-accent-blue">Next Reward In</Text>
          <View className="bg-accent-blue/10 rounded-lg px-3 py-1.5">
            <Text className="text-base font-bold text-accent-blue">{timeStr}</Text>
          </View>
        </View>
      </View>
      {/* Progress bar */}
      <View className="h-1 bg-surface-secondary rounded-full mt-3 overflow-hidden">
        <Animated.View
          style={{
            height: "100%",
            width: `${(countdown / 600) * 100}%`,
            backgroundColor: "#0ea5e9",
          }}
        />
      </View>
    </View>
  );
}
