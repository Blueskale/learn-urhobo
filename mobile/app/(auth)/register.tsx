import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { layout } from "@/constants/layout";
import { typography } from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }

    try {
      await register({
        email: email.trim().toLowerCase(),
        username: email.trim().toLowerCase().split("@")[0],
        password,
        display_name: displayName.trim(),
      });
      router.replace("/(auth)/onboarding");
    } catch {
      Alert.alert(
        "Registration failed",
        "Please check your details and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Start your Urhobo learning journey
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Ada"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
            />
            <Button
              title="Already have an account? Log in"
              variant="outline"
              onPress={() => router.push("/(auth)/login")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.padding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  field: {
    gap: 6,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radiusSmall,
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  actions: {
    gap: 12,
    marginTop: "auto",
  },
});
