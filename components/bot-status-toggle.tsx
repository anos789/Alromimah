import React, { useState } from "react";
import { View, Text, Pressable, Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface BotStatusToggleProps {
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
}

export function BotStatusToggle({ isOn, onToggle }: BotStatusToggleProps) {
  const [toggleAnim] = useState(new Animated.Value(isOn ? 1 : 0));

  const handleToggle = () => {
    const newState = !isOn;
    onToggle(newState);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.timing(toggleAnim, {
      toValue: newState ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const thumbPosition = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Pressable onPress={handleToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <View
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          backgroundColor: isOn ? "#22c55e" : "#ef4444",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#ffffff",
            marginLeft: thumbPosition,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        />
      </View>
    </Pressable>
  );
}
