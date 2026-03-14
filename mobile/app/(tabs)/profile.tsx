import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useProgressStore } from "@/store/progressStore";

const MOTIVATION_LABELS: Record<string, string> = {
  heritage: "Heritage / Identity",
  family: "Communicate with Family",
  culture: "Cultural Interest",
  curiosity: "General Curiosity",
  other: "Other",
};

const GOAL_LABELS: Record<string, string> = {
  basic_phrases: "Learn Basic Phrases",
  hold_conversation: "Hold a Conversation",
  connect_family: "Connect with Family",
  general_interest: "General Interest",
};

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { summary, fetchSummary } = useProgressStore();

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  const profile = user?.profile;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.textLight} />
          </View>
          <Text style={styles.name}>
            {profile?.display_name || user?.username || "Learner"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.stats}>
          <Badge icon="⚡" label="Total XP" value={summary?.xp_total ?? 0} style={styles.badge} />
          <Badge icon="🔥" label="Streak" value={`${summary?.streak_days ?? 0}d`} style={styles.badge} />
        </View>

        <View style={styles.stats}>
          <Badge icon="📖" label="Lessons" value={summary?.lessons_completed ?? 0} style={styles.badge} />
          <Badge icon="📚" label="Units" value={summary?.units_completed ?? 0} style={styles.badge} />
        </View>

        {profile?.motivation || profile?.learning_goal ? (
          <Card style={styles.goalsCard}>
            <Text style={styles.goalsTitle}>Your Goals</Text>
            {profile?.motivation ? (
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Motivation</Text>
                <Text style={styles.goalValue}>
                  {MOTIVATION_LABELS[profile.motivation] || profile.motivation}
                </Text>
              </View>
            ) : null}
            {profile?.learning_goal ? (
              <View style={styles.goalRow}>
                <Text style={styles.goalLabel}>Goal</Text>
                <Text style={styles.goalValue}>
                  {GOAL_LABELS[profile.learning_goal] || profile.learning_goal}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Button
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
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
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  badge: {
    flex: 1,
  },
  goalsCard: {
    marginTop: 8,
    marginBottom: 12,
  },
  goalsTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  goalValue: {
    ...typography.captionBold,
    color: colors.text,
  },
  logoutBtn: {
    marginTop: 16,
  },
});
