import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { api } from "@/services/api";
import type { LessonSummary } from "@/types";

export default function UnitLessonsScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const router = useRouter();
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const data = await api.lessons.list(Number(unitId));
      setLessons(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  // Refresh on focus so completed lessons show updated lock/complete state
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={loadData} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Lessons</Text>

        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            onPress={
              lesson.is_locked
                ? undefined
                : () =>
                    router.push({
                      pathname: "/(tabs)/lessons/[lessonId]",
                      params: { lessonId: lesson.id },
                    })
            }
            style={[styles.lessonCard, lesson.is_locked && styles.lockedCard]}
          >
            <View style={styles.lessonRow}>
              <View style={styles.statusIcon}>
                {lesson.is_completed ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.success}
                  />
                ) : lesson.is_locked ? (
                  <Ionicons
                    name="lock-closed"
                    size={24}
                    color={colors.locked}
                  />
                ) : (
                  <Ionicons
                    name="play-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text
                  style={[
                    styles.lessonTitle,
                    lesson.is_locked && styles.lockedText,
                  ]}
                >
                  {lesson.title}
                </Text>
                <Text style={styles.lessonMeta}>
                  {lesson.estimated_minutes} min · {lesson.xp_reward} XP
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: layout.padding,
    paddingTop: 24,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 20,
  },
  lessonCard: {
    marginBottom: 10,
  },
  lockedCard: {
    opacity: 0.55,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statusIcon: {
    width: 32,
    alignItems: "center",
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  lockedText: {
    color: colors.locked,
  },
  lessonMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
