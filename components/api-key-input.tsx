import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  connected: boolean;
  placeholder?: string;
}

export function ApiKeyInput({ label, value, onChange, connected, placeholder }: ApiKeyInputProps) {
  const [showValue, setShowValue] = useState(false);

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 p-3 rounded-xl border",
        connected ? "bg-sky-900/30 border-sky-600/50" : "bg-red-900/20 border-red-600/30"
      )}
    >
      <View className="flex-1">
        <Text className="text-[10px] text-muted mb-1">{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          secureTextEntry={!showValue}
          className={cn(
            "text-sm",
            connected ? "text-foreground" : "text-error"
          )}
        />
      </View>
      <Pressable
        onPress={() => setShowValue(!showValue)}
        style={({ pressed }) => [
          {
            padding: 6,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text className="text-lg">
          {showValue ? "👁️" : "🔒"}
        </Text>
      </Pressable>
      <View
        className={cn(
          "w-6 h-6 rounded-full items-center justify-center",
          connected ? "bg-success" : "bg-error"
        )}
      >
        <Text className="text-xs text-background font-bold">
          {connected ? "🔓" : "🔒"}
        </Text>
      </View>
    </View>
  );
}
