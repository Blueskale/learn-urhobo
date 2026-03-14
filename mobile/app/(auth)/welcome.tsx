import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.logo}>Urhobo</Text>
          <Text style={styles.tagline}>
            Learn the language of your roots
          </Text>
          <Text style={styles.subtitle}>
            Simple lessons, real progress. Start speaking Urhobo today.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Get Started"
            onPress={() => router.push("/(auth)/register")}
          />
          <Button
            title="I already have an account"
            variant="outline"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
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
    paddingHorizontal: layout.padding,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 12,
  },
  tagline: {
    ...typography.h2,
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
  actions: {
    gap: 12,
  },
});
