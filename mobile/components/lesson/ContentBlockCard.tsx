import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import type { ContentBlock } from "@/types";

interface ContentBlockCardProps {
  block: ContentBlock;
}

export function ContentBlockCard({ block }: ContentBlockCardProps) {
  if (block.block_type === "tip") {
    return (
      <View style={[styles.card, styles.tipCard]}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
          <Text style={styles.tipLabel}>Tip</Text>
        </View>
        <Text style={styles.english}>{block.english_text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.urhobo}>{block.urhobo_text}</Text>
      <Text style={styles.english}>{block.english_text}</Text>
      {block.pronunciation_guide ? (
        <Text style={styles.pronunciation}>{block.pronunciation_guide}</Text>
      ) : null}
      {block.block_type === "audio" && block.audio_url ? (
        <View style={styles.audioRow}>
          <Ionicons
            name="volume-medium-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.audioLabel}>Audio available</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    padding: layout.padding,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tipCard: {
    backgroundColor: colors.accentLight + "30",
    borderColor: colors.accentLight,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tipLabel: {
    ...typography.captionBold,
    color: colors.accent,
  },
  urhobo: {
    ...typography.urhobo,
    color: colors.primary,
    marginBottom: 4,
  },
  english: {
    ...typography.body,
    color: colors.text,
    marginBottom: 4,
  },
  pronunciation: {
    ...typography.pronunciation,
    color: colors.textSecondary,
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  audioLabel: {
    ...typography.caption,
    color: colors.primary,
  },
});
