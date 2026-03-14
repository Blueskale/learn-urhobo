import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/constants/colors";

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 8,
  style,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height }, style]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#E8E8E4",
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 99,
  },
});
