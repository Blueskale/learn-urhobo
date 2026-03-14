import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import type { Option } from "@/types";

interface MultipleChoiceQuestionProps {
  prompt: string;
  options: Option[];
  selectedId: number | null;
  onSelect: (optionId: number) => void;
}

export function MultipleChoiceQuestion({
  prompt,
  options,
  selectedId,
  onSelect,
}: MultipleChoiceQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.options}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              style={[styles.option, isSelected && styles.optionSelected]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
});
