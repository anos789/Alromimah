import React from "react";
import { View, Text, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: "cloud" | "manual";
  onToggle: (mode: "cloud" | "manual") => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const colors = useColors();

  return (
    <View className="flex-row gap-3 w-full">
      <Pressable
        onPress={() => onToggle("cloud")}
        style={({ pressed }) => [
          {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: mode === "cloud" ? "#2563eb" : "#1e293b",
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text
          className={cn(
            "text-sm font-semibold",
            mode === "cloud" ? "text-background" : "text-muted"
          )}
        >
          ☁️ Cloud Auto Mode
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onToggle("manual")}
        style={({ pressed }) => [
          {
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: mode === "manual" ? "#2563eb" : "#1e293b",
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text
          className={cn(
            "text-sm font-semibold",
            mode === "manual" ? "text-background" : "text-muted"
          )}
        >
          ✋ Manual Mode
        </Text>
      </Pressable>
    </View>
  );
}
