import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import type { MatchItemData } from "@/types";

interface MatchingQuestionProps {
  prompt: string;
  leftItems: MatchItemData[];
  rightItems: MatchItemData[];
  matches: { left_id: number; right_id: number }[];
  onMatchesChange: (matches: { left_id: number; right_id: number }[]) => void;
}

export function MatchingQuestion({
  prompt,
  leftItems,
  rightItems,
  matches,
  onMatchesChange,
}: MatchingQuestionProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<number | null>(null);

  const getMatchedRightId = (leftId: number) =>
    matches.find((m) => m.left_id === leftId)?.right_id ?? null;

  const getMatchedLeftId = (rightId: number) =>
    matches.find((m) => m.right_id === rightId)?.left_id ?? null;

  const matchColors = ["#1B4332", "#E09F3E", "#2D6A4F", "#D62828", "#4361EE"];

  const getMatchIndex = (leftId: number) =>
    matches.findIndex((m) => m.left_id === leftId);

  const handleLeftPress = (leftId: number) => {
    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
    } else {
      setSelectedLeftId(leftId);
    }
  };

  const handleRightPress = (rightId: number) => {
    if (selectedLeftId === null) return;

    // Remove any existing match for this left or right item
    const updated = matches.filter(
      (m) => m.left_id !== selectedLeftId && m.right_id !== rightId
    );
    updated.push({ left_id: selectedLeftId, right_id: rightId });
    onMatchesChange(updated);
    setSelectedLeftId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {leftItems.map((item) => {
            const matchIdx = getMatchIndex(item.id);
            const isSelected = selectedLeftId === item.id;
            const isMatched = matchIdx >= 0;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleLeftPress(item.id)}
                style={[
                  styles.item,
                  isSelected && styles.itemSelected,
                  isMatched && {
                    borderColor: matchColors[matchIdx % matchColors.length],
                    backgroundColor:
                      matchColors[matchIdx % matchColors.length] + "15",
                  },
                ]}
              >
                <Text
                  style={[styles.itemText, isMatched && styles.matchedText]}
                >
                  {item.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.column}>
          {rightItems.map((item) => {
            const matchedLeftId = getMatchedLeftId(item.id);
            const matchIdx =
              matchedLeftId !== null ? getMatchIndex(matchedLeftId) : -1;
            const isMatched = matchIdx >= 0;
            return (
              <Pressable
                key={item.id}
                onPress={() => handleRightPress(item.id)}
                style={[
                  styles.item,
                  selectedLeftId !== null && !isMatched && styles.itemHint,
                  isMatched && {
                    borderColor: matchColors[matchIdx % matchColors.length],
                    backgroundColor:
                      matchColors[matchIdx % matchColors.length] + "15",
                  },
                ]}
              >
                <Text
                  style={[styles.itemText, isMatched && styles.matchedText]}
                >
                  {item.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.hint}>
        Tap a word on the left, then tap its match on the right
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  prompt: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 20,
  },
  columns: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  item: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radiusSmall,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  itemHint: {
    borderStyle: "dashed",
  },
  itemText: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: "center",
  },
  matchedText: {
    fontWeight: "700",
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 16,
  },
});
