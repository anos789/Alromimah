import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, Switch } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  hasArrow?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, children, hasArrow = true }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View className="flex-row items-center gap-3 py-3 border-b border-border">
        <View className="w-10 h-10 rounded-xl bg-surface-secondary items-center justify-center">
          <Text className="text-lg">{icon}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{title}</Text>
          {subtitle && <Text className="text-[10px] text-muted">{subtitle}</Text>}
        </View>
        {children}
        {hasArrow && !children && (
          <Text className="text-muted">›</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);
  const [maxLeverage, setMaxLeverage] = useState("125");
  const [stopLossPercent, setStopLossPercent] = useState("5");
  const [takeProfitPercent, setTakeProfitPercent] = useState("15");
  const [supervisorEnabled, setSupervisorEnabled] = useState(true);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <Text className="text-xl font-bold text-foreground mb-4">Settings</Text>

        {/* API Settings */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">🔑</Text>
            <Text className="text-sm font-semibold text-foreground">API Configuration</Text>
          </View>
          <View className="space-y-3">
            <View>
              <Text className="text-[10px] text-muted mb-1">API Key</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 text-sm text-foreground bg-surface-secondary rounded-lg px-3 py-2 font-mono"
                  placeholder="Enter API Key"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  returnKeyType="done"
                />
                <View className="w-6 h-6 rounded-full bg-success/20 items-center justify-center">
                  <Text className="text-[10px]">🔓</Text>
                </View>
              </View>
            </View>
            <View>
              <Text className="text-[10px] text-muted mb-1">Secret Key</Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 text-sm text-foreground bg-surface-secondary rounded-lg px-3 py-2 font-mono"
                  placeholder="Enter Secret Key"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  returnKeyType="done"
                />
                <View className="w-6 h-6 rounded-full bg-success/20 items-center justify-center">
                  <Text className="text-[10px]">🔓</Text>
                </View>
              </View>
            </View>
            <View>
              <Text className="text-[10px] text-muted mb-1">Passphrase</Text>
              <TextInput
                className="text-sm text-foreground bg-surface-secondary rounded-lg px-3 py-2 font-mono"
                placeholder="Enter Passphrase"
                placeholderTextColor="#64748b"
                secureTextEntry
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* Cloud Mode Settings */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">☁️</Text>
            <Text className="text-sm font-semibold text-foreground">Cloud Auto Mode</Text>
          </View>
          <SettingItem
            icon="🔄"
            title="Auto Sync"
            subtitle="Continuous 24/7 cloud execution"
          >
            <Switch
              value={cloudSync}
              onValueChange={setCloudSync}
              trackColor={{ false: "#374151", true: "#22c55e" }}
              thumbColor={cloudSync ? "#ffffff" : "#9ca3af"}
            />
          </SettingItem>
          <SettingItem
            icon="⏰"
            title="Reward Harvest"
            subtitle="Every 10 minutes"
          >
            <Switch
              value={true}
              trackColor={{ false: "#374151", true: "#22c55e" }}
              thumbColor="#ffffff"
            />
          </SettingItem>
        </View>

        {/* Risk Management Settings */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">🛡️</Text>
            <Text className="text-sm font-semibold text-foreground">Risk Management</Text>
          </View>
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-foreground">Max Leverage</Text>
                <Text className="text-[10px] text-muted">x5 to x125</Text>
              </View>
              <TextInput
                value={maxLeverage}
                onChangeText={setMaxLeverage}
                keyboardType="numeric"
                className="text-sm text-foreground bg-surface-secondary rounded-lg px-3 py-2 w-20 text-center font-bold"
                returnKeyType="done"
              />
            </View>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-foreground">Stop Loss</Text>
                <Text className="text-[10px] text-muted">Auto close at % loss</Text>
              </View>
              <TextInput
                value={stopLossPercent}
                onChangeText={setStopLossPercent}
                keyboardType="numeric"
                className="text-sm text-error bg-surface-secondary rounded-lg px-3 py-2 w-20 text-center font-bold"
                returnKeyType="done"
              />
            </View>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-foreground">Take Profit</Text>
                <Text className="text-[10px] text-muted">Auto close at % profit</Text>
              </View>
              <TextInput
                value={takeProfitPercent}
                onChangeText={setTakeProfitPercent}
                keyboardType="numeric"
                className="text-sm text-success bg-surface-secondary rounded-lg px-3 py-2 w-20 text-center font-bold"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        {/* Portfolio Supervisor */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">👁️</Text>
            <Text className="text-sm font-semibold text-foreground">Portfolio Supervisor</Text>
          </View>
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-xs text-foreground">Security Monitor</Text>
              <Text className="text-[10px] text-muted">Monitor all trades and margins</Text>
            </View>
            <Switch
              value={supervisorEnabled}
              onValueChange={setSupervisorEnabled}
              trackColor={{ false: "#374151", true: "#22c55e" }}
              thumbColor={supervisorEnabled ? "#ffffff" : "#9ca3af"}
            />
          </View>
          <View className="bg-surface-secondary rounded-lg p-3 mt-2">
            <Text className="text-[10px] text-muted mb-1">Security Status</Text>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-success" />
              <Text className="text-xs text-success font-semibold">All Systems Protected</Text>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text className="text-[10px] text-muted">Encryption: AES-256</Text>
              <Text className="text-[10px] text-muted">GPG: Active</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">🔔</Text>
            <Text className="text-sm font-semibold text-foreground">Notifications</Text>
          </View>
          <SettingItem icon="📈" title="Trade Alerts" subtitle="Notify on trade execution">
            <Switch value={true} trackColor={{ false: "#374151", true: "#22c55e" }} thumbColor="#ffffff" />
          </SettingItem>
          <SettingItem icon="⚠️" title="Risk Warnings" subtitle="Alert on high risk">
            <Switch value={true} trackColor={{ false: "#374151", true: "#22c55e" }} thumbColor="#ffffff" />
          </SettingItem>
          <SettingItem icon="💰" title="Reward Notifications" subtitle="Alert when rewards are ready">
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#374151", true: "#22c55e" }} thumbColor={notifications ? "#ffffff" : "#9ca3af"} />
          </SettingItem>
        </View>

        {/* Security */}
        <View className="bg-card-bg rounded-xl p-4 border border-border mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-2xl">🔐</Text>
            <Text className="text-sm font-semibold text-foreground">Security</Text>
          </View>
          <SettingItem icon="👆" title="Biometric Lock" subtitle="Face ID / Fingerprint">
            <Switch
              value={biometricLock}
              onValueChange={setBiometricLock}
              trackColor={{ false: "#374151", true: "#22c55e" }}
              thumbColor={biometricLock ? "#ffffff" : "#9ca3af"}
            />
          </SettingItem>
          <SettingItem icon="📋" title="Backup & Restore" subtitle="Secure your configuration">
            <Text className="text-muted">›</Text>
          </SettingItem>
        </View>

        {/* Version info */}
        <View className="items-center py-4">
          <Text className="text-xs text-muted">Mrium MEXC Trial</Text>
          <Text className="text-[10px] text-muted">Version 1.0.0</Text>
          <Text className="text-[10px] text-muted mt-1">Powered by Manus AI</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
