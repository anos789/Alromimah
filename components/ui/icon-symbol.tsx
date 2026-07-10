import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "wallet.fill": "account-balance-wallet",
  "chart.bar.fill": "bar-chart",
  "doc.text.fill": "description",
  "gearshape.fill": "settings",
  "bolt.fill": "flash-on",
  "cloud.fill": "cloud",
  "wifi": "wifi",
  "lock.open": "lock-open",
  "lock": "lock",
  "eye": "visibility",
  "pencil": "edit",
  "gift.fill": "card-giftcard",
  "clock.fill": "access-time",
  "arrow.up.down": "swap-vert",
  "chart.pie.fill": "pie-chart",
  "newspaper": "newspaper",
  "shield.fill": "security",
  "arrow.right": "arrow-forward",
  "plus.circle": "add-circle",
  "minus.circle": "remove-circle",
  "square.and.arrow.up": "share",
  "exclamationmark.triangle": "warning",
  "checkmark.circle": "check-circle",
  "xmark.circle": "cancel",
} as unknown as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: import("expo-symbols").SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
