import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/ui/Card";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { api } from "@/services/api";
import type { Course, Unit } from "@/types";

export default function LearnScreen() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const courses = await api.courses.list();
          if (courses.length > 0) {
            setCourse(courses[0]);
            const u = await api.units.list(courses[0].id);
            setUnits(u);
          }
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{course?.title ?? "Learn"}</Text>
        {course?.description ? (
          <Text style={styles.description}>{course.description}</Text>
        ) : null}

        {units.map((unit, index) => (
          <Card
            key={unit.id}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/units/[unitId]",
                params: { unitId: unit.id },
              })
            }
            style={styles.unitCard}
          >
            <View style={styles.unitRow}>
              <View style={styles.unitNumber}>
                <Text style={styles.unitNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.unitContent}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitMeta}>
                  {unit.lesson_count} lessons
                </Text>
                <ProgressBar
                  progress={unit.progress_percent}
                  style={styles.bar}
                />
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
    marginBottom: 6,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  unitCard: {
    marginBottom: 12,
  },
  unitRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  unitNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryFaded,
    justifyContent: "center",
    alignItems: "center",
  },
  unitNumberText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  unitContent: {
    flex: 1,
  },
  unitTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  unitMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  bar: {
    marginTop: 2,
  },
});
