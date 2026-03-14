import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { useProgressStore } from "@/store/progressStore";
import type { Unit } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { summary, fetchSummary } = useProgressStore();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      await fetchSummary();
      const courses = await api.courses.list();
      if (courses.length > 0) {
        const u = await api.units.list(courses[0].id);
        setUnits(u);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) return <LoadingScreen />;

  const displayName =
    user?.profile.display_name || user?.username || "Learner";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>Miguo, {displayName}!</Text>

        <View style={styles.stats}>
          <Badge
            icon="⚡"
            label="XP"
            value={summary?.xp_total ?? 0}
            style={styles.badge}
          />
          <Badge
            icon="🔥"
            label="Streak"
            value={`${summary?.streak_days ?? 0}d`}
            style={styles.badge}
          />
        </View>

        <Text style={styles.sectionTitle}>Your Progress</Text>

        {units.map((unit) => (
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
            <View style={styles.unitHeader}>
              <View style={styles.unitInfo}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitMeta}>
                  {unit.lesson_count} lessons
                </Text>
              </View>
              <Text style={styles.unitPercent}>{unit.progress_percent}%</Text>
            </View>
            <ProgressBar
              progress={unit.progress_percent}
              color={
                unit.progress_percent === 100 ? colors.success : colors.primary
              }
            />
          </Card>
        ))}

        {units.length === 0 && (
          <Card>
            <Text style={styles.emptyText}>
              No lessons available yet. Check back soon!
            </Text>
          </Card>
        )}
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
  greeting: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 20,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  badge: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 14,
  },
  unitCard: {
    marginBottom: 12,
  },
  unitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  unitInfo: {
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
  },
  unitPercent: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
