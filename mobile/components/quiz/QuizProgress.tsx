import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} color={colors.primary} height={6} />
      <Text style={styles.label}>
        {current} of {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.padding,
    paddingTop: 12,
    gap: 6,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "right",
  },
});
