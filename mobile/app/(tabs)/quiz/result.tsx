import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { useProgressStore } from "@/store/progressStore";

export default function QuizResultScreen() {
  const router = useRouter();
  const { fetchSummary } = useProgressStore();
  const params = useLocalSearchParams<{
    lessonId: string;
    score: string;
    correct: string;
    total: string;
    passed: string;
    xp_earned: string;
    best_score: string;
  }>();

  const score = Number(params.score);
  const correct = Number(params.correct);
  const total = Number(params.total);
  const passed = params.passed === "1";
  const xpEarned = Number(params.xp_earned);

  // Refresh progress summary so dashboard/profile show updated XP/streak
  useEffect(() => {
    if (passed) {
      fetchSummary();
    }
  }, [passed]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={passed ? "checkmark-circle" : "refresh-circle"}
            size={80}
            color={passed ? colors.success : colors.accent}
          />
        </View>

        <Text style={styles.title}>
          {passed ? "Great work!" : "Keep practicing!"}
        </Text>
        <Text style={styles.subtitle}>
          {passed
            ? "You passed the quiz!"
            : "You need 70% to pass. Try again!"}
        </Text>

        <View style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}%</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Correct</Text>
            <Text style={styles.scoreValue}>
              {correct} / {total}
            </Text>
          </View>
          {xpEarned > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>XP Earned</Text>
                <Text style={[styles.scoreValue, styles.xpValue]}>
                  +{xpEarned}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {passed ? (
          <Button
            title="Continue"
            onPress={() => router.dismissAll()}
          />
        ) : (
          <>
            <Button
              title="Try Again"
              onPress={() =>
                router.replace({
                  pathname: "/(tabs)/quiz/[lessonId]",
                  params: { lessonId: params.lessonId },
                })
              }
            />
            <Button
              title="Review Lesson"
              variant="outline"
              onPress={() => router.dismissAll()}
              style={styles.secondaryBtn}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: layout.padding,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    padding: layout.padding,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scoreValue: {
    ...typography.h3,
    color: colors.text,
  },
  xpValue: {
    color: colors.accent,
  },
  footer: {
    padding: layout.padding,
    paddingBottom: 32,
  },
  secondaryBtn: {
    marginTop: 10,
  },
});
