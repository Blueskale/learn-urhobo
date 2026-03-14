import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const STEPS = [
  {
    question: "Why do you want to learn Urhobo?",
    key: "motivation" as const,
    options: [
      { value: "heritage", label: "Heritage / Identity" },
      { value: "family", label: "Communicate with Family" },
      { value: "culture", label: "Cultural Interest" },
      { value: "curiosity", label: "General Curiosity" },
      { value: "other", label: "Other" },
    ],
  },
  {
    question: "What is your current level?",
    key: "current_level" as const,
    options: [
      { value: "complete_beginner", label: "Complete Beginner" },
      { value: "some_exposure", label: "Some Exposure" },
      { value: "understand_cant_speak", label: "Understand but Can't Speak" },
    ],
  },
  {
    question: "What is your learning goal?",
    key: "learning_goal" as const,
    options: [
      { value: "basic_phrases", label: "Learn Basic Phrases" },
      { value: "hold_conversation", label: "Hold a Conversation" },
      { value: "connect_family", label: "Connect with Family" },
      { value: "general_interest", label: "General Interest" },
    ],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({
    motivation: "",
    current_level: "",
    learning_goal: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = STEPS[stepIndex];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.key]: value }));
  };

  const handleNext = async () => {
    if (!answers[step.key]) return;

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsSubmitting(true);
      try {
        const updatedUser = await api.me.onboarding(answers);
        setUser(updatedUser);
        router.replace("/(tabs)/home");
      } catch {
        Alert.alert("Error", "Failed to save your preferences. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isLast = stepIndex === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= stepIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Text style={styles.question}>{step.question}</Text>

        <View style={styles.options}>
          {step.options.map((opt) => {
            const selected = answers[step.key] === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text
                  style={[
                    styles.optionText,
                    selected && styles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Button
            title={isLast ? "Start Learning" : "Next"}
            onPress={handleNext}
            disabled={!answers[step.key]}
            loading={isSubmitting}
          />
        </View>
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
    flexGrow: 1,
    paddingHorizontal: layout.padding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  question: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 28,
  },
  options: {
    gap: 12,
    flex: 1,
  },
  option: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    paddingVertical: 18,
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
  actions: {
    marginTop: 32,
  },
});
