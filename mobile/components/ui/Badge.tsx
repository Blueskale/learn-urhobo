import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

interface BadgeProps {
  icon: string;
  label: string;
  value: string | number;
  style?: ViewStyle;
}

export function Badge({ icon, label, value, style }: BadgeProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 10,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    ...typography.bodyBold,
    color: colors.text,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
