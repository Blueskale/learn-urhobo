import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";

interface FillBlankQuestionProps {
  prompt: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function FillBlankQuestion({
  prompt,
  value,
  onChangeText,
}: FillBlankQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Type your answer..."
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
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
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...typography.urhobo,
    color: colors.primary,
    backgroundColor: colors.surface,
  },
});
